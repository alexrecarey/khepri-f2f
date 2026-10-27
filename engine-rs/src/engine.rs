//! khepri-f2f's Face to Face dice engine on icepool-rs, ported from the Python engine f2f.py (removed; its results
//! stay the reference: src/engine/engine.golden.json, tests/khepri_calculate.json): d20s in, wound chances out.
//!
//! Typed and native on top of the core: the dice are `Die<i64>` (Python's bool dice from `d20 > save` are their
//! 0/1 ints, which compare, hash and add alike), the roll is a `Die<Roll>` of `(a_crit, a_hit, b_crit, b_hit)`
//! and the result a `Die<WinnerWounds>`. Every step goes through the same core operations Python's icepool uses
//! (`map` is `Die(results, quantities)`, `explode` is depth-mode `Again`, `@` is `_sum_all`), so the integer
//! quantities match f2f.py exactly, not just the probabilities.
//!
//! Only the core dice rules live here. Everything the game rules decide happens before this point, in
//! JavaScript: MODs, range, ARM and BTS, cover, AP halving, Immunities, what each ammunition does, Shock, and
//! splitting a Direct Template against an attack into two rolls. What arrives is final numbers for each side's
//! attack ([`Side`]), for the active (A) and the reactive (B) side, plus `fixedFaceToFace`: the reactive side's
//! dice always roll `successValueB`.

use dashu_int::IBig;
use rustc_hash::FxHashMap;
use serde_json::{json, Map, Value as Json};

use icepool_core::evaluator::basic::SumEvaluator;
use icepool_core::evaluator::{evaluate, Final, MultisetEvaluator, MultisetSource};
use icepool_core::value::{ratio_to_f64, DieArg};
use icepool_core::{
    d, AgainEnd, Die, Error, Int, Order, OutcomeArith, OutcomeOrder, Pool, Quantity,
    Result,
};

/// The roll's outcome: `(a_crit, a_hit, b_crit, b_hit)`.
pub type Roll = [i64; 4];

/// The result's outcome: `(winner, wounds)`.
pub type WinnerWounds = (Player, i64);

/// Continuous Damage: rolls again after a failed Saving Roll at most this many times.
pub const MAX_CONTINUOUS: u64 = 5;

/// One side's attack, as the engine input holds it (the keys with an `A` or `B` suffix).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Side {
    /// The roll's final success value (0 = always fails, over 20 = more Criticals).
    pub success_value: i64,
    /// Dice rolled (0 = no roll: the other side makes a Normal Roll).
    pub burst: i64,
    /// Special Dice: rolled too, but only the best `burst` count.
    pub bonus_burst: i64,
    /// Hits automatically, `burst` hits, no roll. The other side, if it rolls, is a Dodge: any success cancels
    /// every hit.
    pub template: bool,
    /// A Saving Roll against this attack passes on d20 <= saveValue (PS plus ARM or BTS, MODs included).
    pub save_value: i64,
    /// Saving Rolls each hit causes (N 1, DA 2, EXP 3; 0 for a roll that causes none, e.g. a Dodge).
    pub saves: i64,
    /// A Critical causes one more Saving Roll, at saveValue, never with Continuous Damage or extra wounds.
    pub crit_save: bool,
    /// Wounds each failed Saving Roll causes (2 for T2).
    pub wounds_per_failure: i64,
    /// Continuous Damage: a failed Saving Roll is rolled again, up to [`MAX_CONTINUOUS`] more times.
    pub cont: bool,
    /// The save value of a second Saving Roll every one of the `saves` also needs (Plasma's BTS).
    pub secondary_save: Option<i64>,
}

/// The engine input: both sides' attacks and `fixedFaceToFace`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Input {
    pub a: Side,
    pub b: Side,
    pub fixed_face_to_face: bool,
}

/// Who won the roll. The variants are in the order Python sorts their names (`'active' < 'fail' < 'reactive'`),
/// so `(Player, i64)` sorts as f2f.py's `(winner, wounds)` tuples do.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub enum Player {
    Active,
    Fail,
    Reactive,
}

impl Player {
    /// The string in the engine's output.
    pub fn name(self) -> &'static str {
        match self {
            Player::Active => "active",
            Player::Fail => "fail",
            Player::Reactive => "reactive",
        }
    }
}

// --- The engine input ------------------------------------------------------------------------------------------

/// An input f2f.py might read differently (a missing key, a float, a bool where an int goes): the port only
/// models the plain ints, bools and `None` that khepri's JavaScript sends.
fn unsupported<T>(what: String) -> Result<T> {
    Err(Error::Unported(format!("khepri input: {what}")))
}

fn field<'a>(p: &'a Map<String, Json>, key: &str) -> Result<&'a Json> {
    match p.get(key) {
        Some(v) => Ok(v),
        None => unsupported(format!("missing key {key}")),
    }
}

fn int_field(p: &Map<String, Json>, key: &str) -> Result<i64> {
    match field(p, key)?.as_i64() {
        Some(i) => Ok(i),
        None => unsupported(format!("{key} is not a small int")),
    }
}

/// A flag f2f.py tests for truth (`if p['templateA']:`): a bool, an int, or `None`.
fn flag_field(p: &Map<String, Json>, key: &str) -> Result<bool> {
    match field(p, key)? {
        Json::Bool(b) => Ok(*b),
        Json::Null => Ok(false),
        v => match v.as_i64() {
            Some(i) => Ok(i != 0),
            None => unsupported(format!("{key} is not a bool")),
        },
    }
}

impl Side {
    fn from_json(p: &Map<String, Json>, s: &str) -> Result<Side> {
        let key = |k: &str| format!("{k}{s}");
        let secondary_save = match field(p, &key("secondarySave"))? {
            Json::Null => None,
            _ => Some(int_field(p, &key("secondarySave"))?),
        };
        Ok(Side {
            success_value: int_field(p, &key("successValue"))?,
            burst: int_field(p, &key("burst"))?,
            bonus_burst: int_field(p, &key("bonusBurst"))?,
            template: flag_field(p, &key("template"))?,
            save_value: int_field(p, &key("saveValue"))?,
            saves: int_field(p, &key("saves"))?,
            crit_save: flag_field(p, &key("critSave"))?,
            wounds_per_failure: int_field(p, &key("woundsPerFailure"))?,
            cont: flag_field(p, &key("cont"))?,
            secondary_save,
        })
    }
}

impl Input {
    /// The engine input as khepri's src/engine/calculate.js builds it (a JSON object; see [`Side`]).
    pub fn from_json(p: &Json) -> Result<Input> {
        let Json::Object(p) = p else {
            return unsupported("not an object".into());
        };
        Ok(Input {
            a: Side::from_json(p, "A")?,
            b: Side::from_json(p, "B")?,
            fixed_face_to_face: flag_field(p, "fixedFaceToFace")?,
        })
    }

    fn side(&self, player: Player) -> &Side {
        match player {
            Player::Reactive => &self.b,
            _ => &self.a,
        }
    }
}

// --- Small helpers: icepool operations on typed dice ------------------------------------------------------------

/// `Die([outcome])`, what `implicit_convert_to_die` makes of a plain outcome.
fn constant<O: OutcomeOrder>(outcome: O) -> Result<Die<O>> {
    Die::new(vec![DieArg::Outcome(outcome)], vec![Quantity::ONE])
}

/// `die.map(f)` without Again (`map_simple`): `Die([f(o) for o in die], [q for q in die])`, every item including
/// zero quantities. `f` returns an outcome or a die (`DieArg`).
fn map<O: OutcomeOrder, P: OutcomeOrder>(
    die: &Die<O>,
    mut f: impl FnMut(&O) -> Result<DieArg<P>>,
) -> Result<Die<P>> {
    let (objects, times): (Vec<_>, Vec<_>) = die
        .items()
        .iter()
        .map(|(o, q)| Ok((f(o)?, q.clone())))
        .collect::<Result<Vec<_>>>()?
        .into_iter()
        .unzip();
    Die::new(objects, times)
}

/// `die + other` for int dice.
fn add(die: &Die<i64>, other: &Die<i64>) -> Result<Die<i64>> {
    die.binary_operator(other, OutcomeArith::try_add)
}

/// `count @ die` for an int `count`: `Die([count]).__matmul__(die)`.
fn matmul(count: i64, die: &Die<i64>) -> Result<Die<i64>> {
    die.matmul(&[(count, Quantity::ONE)])
}

/// `d20 > value`: a die of `False` / `True`, here `0` / `1`.
fn d20_gt(value: i64) -> Result<Die<i64>> {
    d(20).binary_operator(&constant(value)?, |a, b| Ok(i64::from(a > b)))
}

/// A number of dice to keep, as `Pool::highest` counts them; a negative count is an error, as `pool.highest`
/// of a negative count is in Python.
fn keep_count(n: i64) -> Result<usize> {
    usize::try_from(n).map_err(|_| Error::InvalidArgument(format!("cannot keep {n} dice")))
}

/// `Pool([die], times)`: one die, `times` times. Python raises for a negative count (`(1,) * sum(times)` makes
/// fewer dice than `times` says); the engine never sends one.
fn pool_of(die: Die<i64>, times: i64) -> Result<Pool<i64>> {
    match usize::try_from(times) {
        Ok(times) => Pool::new(vec![(die, times)]),
        Err(_) => unsupported(format!("a negative number of dice ({times})")),
    }
}

/// `evaluator.evaluate(*pools)`: `Die(final_outcomes, final_weights)`.
fn evaluate_pools<F: OutcomeOrder, E: MultisetEvaluator<i64, Final = F>>(
    evaluator: &E,
    pools: &[Pool<i64>],
) -> Result<Die<F>> {
    let sources: Vec<_> = pools
        .iter()
        .map(|p| MultisetSource::Pool(p.source()))
        .collect();
    let (outcomes, weights): (Vec<_>, Vec<_>) = evaluate(evaluator, &sources)?
        .into_iter()
        .map(|(o, w)| (DieArg::Outcome(o), w))
        .unzip();
    Die::new(outcomes, weights)
}

// --- To hit ------------------------------------------------------------------------------------------------------

/// One d20 read against a success value: 0 = miss, 1-19 = success (higher beats lower), 20 = Critical.
///
/// Over 20, the excess is added to the roll: those that reach 20 or more become Criticals.
pub fn read_roll(mut roll: i64, mut success_value: i64) -> i64 {
    if success_value > 20 {
        roll += success_value - 20;
        success_value = 20;
    }
    if roll == success_value || roll > 20 {
        return 20;
    }
    if roll < success_value {
        roll
    } else {
        0
    }
}

/// A d20 rolled against this success value, read as above (`d20.map(read_roll, success_value)`).
pub fn infinity_die(success_value: i64) -> Result<Die<i64>> {
    map(&d(20), |&roll| {
        Ok(DieArg::Outcome(read_roll(roll, success_value)))
    })
}

/// Both sides' dice -> `(a_crit, a_hit, b_crit, b_hit)` left after cancelling.
///
/// Seen from the lowest result up: a result cancels every lower success of the other side, a tie cancels both,
/// and a Critical cancels all of the other side's successes and Criticals.
pub struct FaceToFace;

impl MultisetEvaluator<i64> for FaceToFace {
    type State = [i64; 4];
    type Final = [i64; 4];

    fn initial_state(&self, order: Order, _: &[i64], _: &[Option<Int>]) -> Result<[i64; 4]> {
        // Outcomes must be seen lowest first: a result only cancels the other side's successes already counted.
        if order != Order::Ascending {
            return Err(Error::UnsupportedOrder(String::new()));
        }
        Ok([0, 0, 0, 0])
    }

    fn next_state(
        &self,
        state: &[i64; 4],
        _: Order,
        &outcome: &i64,
        counts: &[Int],
    ) -> Result<Option<[i64; 4]>> {
        let [mut a_crit, mut a_hit, mut b_crit, mut b_hit] = *state;
        let (a_count, b_count) = (small(&counts[0])?, small(&counts[1])?);
        if outcome == 0 {
            // miss
            return Ok(Some(*state));
        }
        if outcome < 20 {
            // hit
            a_hit += a_count;
            b_hit += b_count;
        } else {
            // crit
            a_crit += a_count;
            b_crit += b_count;
            if a_count != 0 {
                b_crit = 0;
            }
            if b_count != 0 {
                a_crit = 0;
            }
        }
        if a_count != 0 {
            b_hit = 0;
        }
        if b_count != 0 {
            a_hit = 0;
        }
        Ok(Some([a_crit, a_hit, b_crit, b_hit]))
    }

    /// The default `final_outcome`: the final state itself.
    fn final_outcome(
        &self,
        final_state: &[i64; 4],
        _: Order,
        _: &[i64],
        _: &[Option<Int>],
    ) -> Result<Final<[i64; 4]>> {
        Ok(Final::Outcome(*final_state))
    }
}

/// A count of a khepri pool, which has at most a few dozen dice.
fn small(count: &Int) -> Result<i64> {
    count
        .to_i64()
        .ok_or_else(|| Error::Overflow("i64 count overflowed".into()))
}

/// Side `side`'s dice: burst plus Special Dice rolled, the best `burst` kept.
fn dice(side: &Side) -> Result<Pool<i64>> {
    let rolled = pool_of(
        infinity_die(side.success_value)?,
        side.burst + side.bonus_burst,
    )?;
    Ok(rolled.highest(keep_count(side.burst)?))
}

/// A Direct Template's automatic hits, as `(crit, hit)`, cancelled by any success of the other side.
fn template_roll(hits: i64, dodger: &Side) -> Result<Die<[i64; 2]>> {
    if dodger.burst == 0 {
        return constant([0, hits]); // Nobody dodges: the template always hits
    }
    // One success is enough: every die rolled counts, Special Dice included.
    let dodge = pool_of(
        infinity_die(dodger.success_value)?,
        dodger.burst + dodger.bonus_burst,
    )?;
    // `pool.highest(1).sum()`: the best die.
    let best = evaluate_pools(&SumEvaluator, &[dodge.highest(1)])?;
    map(&best, |&best| {
        Ok(DieArg::Outcome(if best != 0 { [0, 0] } else { [0, hits] }))
    })
}

/// The roll: a die of `(a_crit, a_hit, b_crit, b_hit)`.
pub fn roll(p: &Input) -> Result<Die<Roll>> {
    if p.a.template && p.b.template {
        return Err(Error::InvalidArgument(
            "two Direct Templates are two separate rolls".into(),
        ));
    }
    if p.a.template {
        let t = template_roll(p.a.burst, &p.b)?;
        return map(&t, |&[c, h]| Ok(DieArg::Outcome([c, h, 0, 0])));
    }
    if p.b.template {
        let t = template_roll(p.b.burst, &p.a)?;
        return map(&t, |&[c, h]| Ok(DieArg::Outcome([0, 0, c, h])));
    }
    if p.fixed_face_to_face {
        // Don't let the fixed die be over 19: at the moment 20 is a Critical. Fix later to allow 20.
        let fixed = pool_of(constant(p.b.success_value.min(19))?, p.b.burst)?;
        return evaluate_pools(&FaceToFace, &[dice(&p.a)?, fixed]);
    }
    evaluate_pools(&FaceToFace, &[dice(&p.a)?, dice(&p.b)?])
}

// --- Saving Rolls ------------------------------------------------------------------------------------------------

/// Die of wounds caused by `crits` + `hits` successes of this attack.
pub fn wounds(crits: i64, hits: i64, attack: &Side) -> Result<Die<i64>> {
    let save = attack.save_value;
    // A crit is a regular hit plus one extra save: its regular part causes `saves` Saving Rolls like any hit. The
    // extra one is kept apart in crit_saves, as neither Continuous Damage nor T2 apply their special effects to it.
    let saves = (crits + hits) * attack.saves;
    let crit_saves = if attack.crit_save { crits } else { 0 };
    // Wounds for a failed save, 0 for a passed one. T2 makes a failed save cost 2.
    let mut failed =
        d20_gt(save)?.binary_operator(&constant(attack.wounds_per_failure)?, |a, b| {
            a.checked_mul(*b)
                .ok_or_else(|| Error::Overflow("i64 product overflowed".into()))
        })?;
    if attack.cont {
        // `failed.explode([wounds_per_failure], depth=MAX_CONTINUOUS, end=0)`.
        let which = attack.wounds_per_failure;
        failed = failed.explode(|&o| o == which, MAX_CONTINUOUS, AgainEnd::Outcome(0))?;
    }
    // Thank you HighDiceRoller for this beautiful line of code!
    let mut total = add(
        &matmul(saves, &failed)?,
        &matmul(crit_saves, &d20_gt(save)?)?,
    )?; // Crits are always 1 damage
    if let Some(secondary) = attack.secondary_save {
        // Plasma BTS hits are always 1 damage (so far)
        total = add(&total, &matmul(saves, &d20_gt(secondary)?)?)?;
    }
    Ok(total)
}

/// Die of `(winner, wounds)` after the roll `rolled`: `Active` / `Reactive` won it and caused that many wounds, or
/// `Fail`.
pub fn outcomes(p: &Input, rolled: &Die<Roll>) -> Result<Die<WinnerWounds>> {
    // `@cache`: each (winner, crits, hits) is worked out once.
    let mut cache: FxHashMap<(Player, i64, i64), Die<WinnerWounds>> = FxHashMap::default();
    let mut caused = |winner: Player, crits: i64, hits: i64| -> Result<DieArg<(Player, i64)>> {
        if let Some(die) = cache.get(&(winner, crits, hits)) {
            return Ok(DieArg::Die(die.clone()));
        }
        let die = map(&wounds(crits, hits, p.side(winner))?, |&w| {
            Ok(DieArg::Outcome((winner, w)))
        })?;
        cache.insert((winner, crits, hits), die.clone());
        Ok(DieArg::Die(die))
    };
    map(rolled, |&[a_crit, a_hit, b_crit, b_hit]| {
        if a_crit + a_hit != 0 {
            return caused(Player::Active, a_crit, a_hit);
        }
        if b_crit + b_hit != 0 {
            return caused(Player::Reactive, b_crit, b_hit);
        }
        Ok(DieArg::Outcome((Player::Fail, 0)))
    })
}

/// The exact result [`calculate`] turns into floats: `outcomes(p, roll(p))`, with the roll.
pub fn engine(p: &Input) -> Result<(Die<Roll>, Die<WinnerWounds>)> {
    let rolled = roll(p)?;
    let result = outcomes(p, &rolled)?;
    Ok((rolled, result))
}

// --- Entry point -------------------------------------------------------------------------------------------------

/// One outcome of [`calculate`].
#[derive(Clone, Debug, PartialEq)]
pub struct Chance {
    pub player: Player,
    pub wounds: i64,
    /// `float(Fraction(quantity, denominator))`: correctly rounded.
    pub chance: f64,
}

/// What [`calculate`] returns: the number of distinct rolls and every outcome with its chance.
#[derive(Clone, Debug, PartialEq)]
pub struct Calculation {
    pub rolls: Quantity,
    pub outcomes: Vec<Chance>,
}

/// One calculation. `p` is the engine input (see the top of this file).
pub fn calculate(p: &Input) -> Result<Calculation> {
    let (rolled, result) = engine(p)?;
    let denominator = IBig::from(result.denominator());
    let outcomes = result
        .items()
        .iter()
        .map(|((player, w), q)| {
            Ok(Chance {
                player: *player,
                wounds: *w,
                chance: ratio_to_f64(&IBig::from(q.clone()), &denominator)?,
            })
        })
        .collect::<Result<_>>()?;
    Ok(Calculation {
        rolls: rolled.denominator(),
        outcomes,
    })
}

/// [`calculate`] with the engine's JSON shape, for the WASM build (khepri's worker): the engine input object in,
/// `{"rolls": number of distinct rolls, "outcomes": [{"player", "wounds", "chance"}, ...]}` out. `rolls` may
/// exceed 2**53; it is written as an exact JSON integer.
pub fn calculate_json(p: &Json) -> Result<Json> {
    let c = calculate(&Input::from_json(p)?)?;
    let rolls: serde_json::Number = c
        .rolls
        .to_string()
        .parse()
        .map_err(|_| Error::Overflow("rolls is not a JSON number".into()))?;
    let outcomes: Vec<Json> = c
        .outcomes
        .iter()
        .map(|o| json!({"player": o.player.name(), "wounds": o.wounds, "chance": o.chance}))
        .collect();
    Ok(json!({"rolls": rolls, "outcomes": outcomes}))
}
