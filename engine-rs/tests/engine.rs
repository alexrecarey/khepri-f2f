//! The engine's dice rules, natively (`cargo test`): ported from the Python engine's own tests (test_f2f.py) when
//! the Python engine was retired. Against the Ghostlords calculator (inf-dice.ghostlords.com, N4), against the
//! engine's earlier numbers (before icepool 2), and one rule at a time: to hit, Direct Templates, Saving Rolls.
//! khepri_calculate.rs and ../../src/engine/engine.test.mjs check whole results bit for bit; these say why.
use std::collections::BTreeMap;

use khepri_engine::engine::{calculate, read_roll, roll, Calculation, Chance, Input, Player, Side, MAX_CONTINUOUS};
use Player::{Active, Fail, Reactive};

// --- Building engine input ---------------------------------------------------------------------------------------

/// One side's engine input; tests change what they need with `Side { burst: 3, ..side() }`.
fn side() -> Side {
    Side {
        success_value: 13,
        burst: 1,
        bonus_burst: 0,
        template: false,
        save_value: 10,
        saves: 1,
        crit_save: true,
        wounds_per_failure: 1,
        cont: false,
        secondary_save: None,
    }
}

/// An attack that causes no Saving Rolls (a Dodge) has no Critical's extra one either, as calculate.js sends it.
fn finished(s: Side) -> Side {
    Side { crit_save: s.crit_save && s.saves > 0, ..s }
}

fn input(a: Side, b: Side) -> Input {
    Input { a: finished(a), b: finished(b), fixed_face_to_face: false }
}

fn calc(p: &Input) -> Calculation {
    calculate(p).expect("calculate")
}

fn chance(c: &Calculation, player: Player) -> f64 {
    c.outcomes.iter().filter(|o| o.player == player).map(|o| o.chance).sum()
}

fn rolls(c: &Calculation) -> f64 {
    c.rolls.to_string().parse().unwrap()
}

/// math.isclose: relative tolerance, plus an absolute one for values near 0.
fn close(got: f64, want: f64, rel: f64, abs: f64) -> bool {
    (got - want).abs() <= f64::max(rel * f64::max(got.abs(), want.abs()), abs)
}

fn assert_close(got: f64, want: f64) {
    assert!(close(got, want, 1e-9, 0.0), "{got} is not {want}");
}

/// Two maps with the same keys and values within `rel`.
fn assert_maps_close<K: Ord + std::fmt::Debug>(got: &BTreeMap<K, f64>, want: &BTreeMap<K, f64>, rel: f64, abs: f64) {
    assert_eq!(got.keys().collect::<Vec<_>>(), want.keys().collect::<Vec<_>>());
    for (k, w) in want {
        assert!(close(got[k], *w, rel, abs), "{k:?}: {} is not {w}", got[k]);
    }
}

// --- The reference data's N4 terms -------------------------------------------------------------------------------

/// What the calculator's ammunition becomes in the engine input (src/engine/calculate.js AMMO).
#[derive(Clone, Copy, Default)]
enum Ammo {
    #[default]
    N,
    Da,
    Exp,
    T2,
    Plasma,
    Dodge,
}

/// A side as the reference data describes it: N4 DAM, its own ARM / BTS (what the other side saves against),
/// ammunition.
#[derive(Clone, Copy, Default)]
struct N4 {
    sv: i64,
    burst: i64,
    dam: i64,
    arm: i64,
    bts: i64,
    ammo: Ammo,
    cont: bool,
    template: bool,
    crit_immune: bool,
}

/// N4 DAM -> N5 PS with the same wound chance. The reference data is from the N4 era, where a save failed on
/// d20 <= DAM - ARM. In N5 it fails on d20 > PS + ARM, so PS = 20 - DAM gives identical odds, Criticals and
/// Continuous Damage included.
fn ps(n4_dam: i64) -> i64 {
    20 - n4_dam
}

fn n4_side(x: &N4, target: &N4, ps_of: fn(i64) -> i64) -> Side {
    let (saves, wounds_per_failure) = match x.ammo {
        Ammo::N | Ammo::Plasma => (1, 1),
        Ammo::Da => (2, 1),
        Ammo::Exp => (3, 1),
        Ammo::T2 => (1, 2),
        Ammo::Dodge => (0, 1),
    };
    let pv = ps_of(x.dam);
    finished(Side {
        success_value: x.sv,
        burst: x.burst,
        bonus_burst: 0,
        template: x.template,
        save_value: pv + target.arm,
        saves,
        crit_save: !target.crit_immune,
        wounds_per_failure,
        cont: x.cont,
        secondary_save: matches!(x.ammo, Ammo::Plasma).then_some(pv + target.bts),
    })
}

fn n4_with(a: N4, b: N4, ps_of: fn(i64) -> i64) -> Calculation {
    calc(&Input { a: n4_side(&a, &b, ps_of), b: n4_side(&b, &a, ps_of), fixed_face_to_face: false })
}

fn n4(a: N4, b: N4) -> Calculation {
    n4_with(a, b, ps)
}

// --- Against the Ghostlords calculator ---------------------------------------------------------------------------

/// The result as Ghostlords shows it: a won roll that causes no wounds counts as a failure, wounds over
/// `max_shown` as `max_shown`.
fn as_ghostlords(c: &Calculation, max_shown: i64) -> BTreeMap<(Player, i64), f64> {
    let mut out = BTreeMap::from([((Fail, 0), 0.0)]);
    for o in &c.outcomes {
        let key = if o.wounds > 0 { (o.player, o.wounds.min(max_shown)) } else { (Fail, 0) };
        *out.entry(key).or_default() += o.chance;
    }
    out
}

/// Ghostlords' figures, in percent: the chance of each exact number of wounds from 1 up (its "P1 / P2 Scores N
/// Success(es)" lines, 0.000% ones included), and of No Successes.
fn ghostlords(active: &[f64], reactive: &[f64], fail: f64) -> BTreeMap<(Player, i64), f64> {
    let by_side = |player: Player, pcts: &[f64]| {
        pcts.iter().enumerate().map(move |(i, p)| ((player, i as i64 + 1), p / 100.0)).collect::<Vec<_>>()
    };
    let mut out: BTreeMap<_, _> = by_side(Active, active).into_iter().chain(by_side(Reactive, reactive)).collect();
    out.insert((Fail, 0), fail / 100.0);
    out
}

/// Its minimal view's "inflicts N or more wounds" figures -> the exact ones.
fn or_more(cumulative: &[f64]) -> Vec<f64> {
    (0..cumulative.len()).map(|i| cumulative[i] - cumulative.get(i + 1).unwrap_or(&0.0)).collect()
}

/// Ghostlords rounds to 0.001%.
fn assert_ghostlords(c: &Calculation, max_shown: i64, want: BTreeMap<(Player, i64), f64>) {
    assert_maps_close(&as_ghostlords(c, max_shown), &want, 0.0, 0.0005);
}

#[test]
fn ghostlords_regular_roll() {
    // http://inf-dice.ghostlords.com/n4/ with p1 BS 16 B3 DAM 13 ARM 2 N, p2 BS 13 B1 DAM 14 ARM 5 N.
    let c = n4(N4 { sv: 16, burst: 3, dam: 13, arm: 2, ..N4::default() }, N4 { sv: 13, burst: 1, dam: 14, arm: 5, ..N4::default() });
    assert_ghostlords(&c, 100, ghostlords(&[36.215, 14.420, 2.591, 0.163, 0.004, 0.000], &[7.444, 1.543], 37.620));
}

#[test]
fn ghostlords_sv_over_20_da() {
    let c = n4(
        N4 { sv: 26, burst: 1, dam: 16, arm: 1, ammo: Ammo::Da, ..N4::default() },
        N4 { sv: 13, burst: 1, dam: 12, arm: 4, ..N4::default() },
    );
    assert_ghostlords(&c, 100, ghostlords(&[36.696, 34.704, 7.182], &[3.671, 0.983], 16.764));
}

#[test]
fn ghostlords_high_burst_exp() {
    let c = n4(
        N4 { sv: 14, burst: 5, dam: 13, arm: 0, ammo: Ammo::Exp, ..N4::default() },
        N4 { sv: 13, burst: 2, dam: 12, arm: 3, ..N4::default() },
    );
    let active = [
        9.763, 13.996, 12.588, 10.410, 8.526, 6.234, 4.166, 2.498, 1.319, 0.607, 0.238, 0.078, 0.020, 0.004, 0.001,
        0.000, 0.000, 0.000, 0.000, 0.000,
    ];
    assert_ghostlords(&c, 100, ghostlords(&active, &[10.552, 3.441, 0.228, 0.025], 15.307));
}

#[test]
fn ghostlords_hmg_vs_tr() {
    let c = n4(N4 { sv: 9, burst: 5, dam: 15, arm: 6, ..N4::default() }, N4 { sv: 8, burst: 4, dam: 15, arm: 3, ..N4::default() });
    assert_ghostlords(
        &c,
        100,
        ghostlords(
            &[25.249, 13.810, 4.785, 1.231, 0.220, 0.029, 0.003, 0.000, 0.000, 0.000],
            &[14.425, 4.824, 0.725, 0.106, 0.008, 0.001, 0.000, 0.000],
            34.585,
        ),
    );
}

#[test]
fn ghostlords_spitfire_vs_tag() {
    let c = n4(
        N4 { sv: 13, burst: 4, dam: 14, arm: 6, ..N4::default() },
        N4 { sv: 15, burst: 1, dam: 16, arm: 11, ammo: Ammo::Exp, ..N4::default() },
    );
    assert_ghostlords(
        &c,
        100,
        ghostlords(&[18.409, 2.738, 0.224, 0.011, 0.000, 0.000, 0.000, 0.000], &[9.112, 9.621, 3.716, 0.255], 55.913),
    );
}

#[test]
fn ghostlords_continuous_damage_azrail_vs_tag() {
    // Ghostlords' minimal view: 1 W, Unconscious, Dead (3 or more).
    let c = n4(
        N4 { sv: 13, burst: 3, dam: 14, arm: 8, ammo: Ammo::Da, cont: true, ..N4::default() },
        N4 { sv: 14, burst: 1, dam: 16, arm: 11, ammo: Ammo::Exp, ..N4::default() },
    );
    assert_ghostlords(&c, 3, ghostlords(&or_more(&[29.33, 10.11, 3.08]), &or_more(&[21.20, 10.10, 2.19]), 49.46));
}

#[test]
fn t2_ammo() {
    // A self test in Ghostlords' terms: Ghostlords doesn't work T2 out correctly.
    let c = n4(
        N4 { sv: 13, burst: 1, dam: 13, arm: 0, ammo: Ammo::T2, ..N4::default() },
        N4 { sv: 13, burst: 1, dam: 13, arm: 0, ..N4::default() },
    );
    assert_ghostlords(
        &c,
        3,
        ghostlords(&or_more(&[28.543125, 27.4625, 2.006875]), &or_more(&[28.543125, 2.006875]), 42.90),
    );
}

// --- Against the engine's earlier numbers ------------------------------------------------------------------------

/// The result in rolls out of `total`: (player, wounds) -> how many of the rolls end there.
fn assert_rolls(c: &Calculation, total: f64, want: &[(Player, i64, f64)]) {
    assert_eq!(rolls(c), total);
    let got: BTreeMap<_, _> = c.outcomes.iter().map(|o| ((o.player, o.wounds), o.chance * total)).collect();
    let want: BTreeMap<_, _> = want.iter().map(|&(p, w, n)| ((p, w), n)).collect();
    assert_maps_close(&got, &want, 1e-9, 1e-12);
}

#[test]
fn simple_decent_arm_special_ammo() {
    let c = n4(
        N4 { sv: 13, burst: 3, dam: 14, arm: 6, ammo: Ammo::Da, cont: true, ..N4::default() },
        N4 { sv: 13, burst: 1, dam: 16, arm: 6, ammo: Ammo::Exp, ..N4::default() },
    );
    let active = [
        22190.725799424, 25253.871405465597, 21241.052930211838, 15887.243378589697, 11066.76271660401,
        7314.86697692332, 4796.023127937123, 2887.195025879964, 1673.2309999994693, 937.2007140389826,
        507.6054807974403, 266.2674690989054, 135.9308052824171, 66.75009802370272, 31.870412939526794,
        14.771972525056883, 6.649379652325107, 2.908023587154541, 1.2362697630172954, 0.5087790039275358,
        0.20329098857578848, 0.0788320082840267, 0.02963602138060582, 0.010787087528762312, 0.0037958829632112716,
        0.001285435783532172, 0.0004198373167651864, 0.00013182503337114547, 3.9660600026129256e-05,
        1.13806030200333e-05, 3.0951470873026182e-06, 7.883403569666869e-07, 1.8874919209960912e-07,
        4.203973322575997e-08, 8.486696909845032e-09, 1.4790708532189742e-09, 2.0035044038145404e-10,
        1.3254058223344986e-11, 4.175327549494025e-13, 5.7423976431694885e-15,
    ];
    let reactive = [4028.6875, 12514.75, 13372.125, 5314.75, 428.6875];
    let mut want: Vec<_> = active.iter().enumerate().map(|(w, &n)| (Active, w as i64, n)).collect();
    want.extend(reactive.iter().enumerate().map(|(w, &n)| (Reactive, w as i64, n)));
    want.push((Fail, 0, 10058.0));
    assert_rolls(&c, 160000.0, &want);
}

#[test]
fn crit_immune() {
    let c = n4(
        N4 { sv: 25, burst: 2, dam: 15, arm: 6, ..N4::default() },
        N4 { sv: 13, burst: 1, dam: 13, arm: 6, crit_immune: true, ..N4::default() },
    );
    assert_rolls(&c, 8000.0, &[
        (Active, 0, 2464.5499999999997), (Active, 1, 3654.8999999999996), (Active, 2, 1340.55), (Fail, 0, 253.0),
        (Reactive, 0, 141.96), (Reactive, 1, 121.03), (Reactive, 2, 24.009999999999998),
    ]);
}

#[test]
fn dodge_vs_template() {
    let c = n4(
        N4 { sv: 25, burst: 2, dam: 15, arm: 6, template: true, ..N4::default() },
        N4 { sv: 13, burst: 1, dam: 13, arm: 6, ammo: Ammo::Dodge, ..N4::default() },
    );
    assert_rolls(&c, 20.0, &[(Active, 0, 2.1174999999999997), (Active, 1, 3.465), (Active, 2, 1.4175), (Fail, 0, 13.0)]);
}

#[test]
fn plasma() {
    let c = n4(
        N4 { sv: 13, burst: 3, dam: 14, arm: 6, ammo: Ammo::Plasma, ..N4::default() },
        N4 { sv: 13, burst: 1, dam: 13, arm: 3, ..N4::default() },
    );
    let active = [
        6567.584857528641, 27000.717685382388, 35015.890689458254, 23489.99869272637, 14627.696396870906,
        5665.637580835031, 1719.0338085648748, 187.37418932925002, 8.885704569328125, 0.180394734953125,
    ];
    let mut want: Vec<_> = active.iter().enumerate().map(|(w, &n)| (Active, w as i64, n)).collect();
    want.extend([(Reactive, 0, 21617.927499999998), (Reactive, 1, 13200.845000000001), (Reactive, 2, 840.2275), (Fail, 0, 10058.0)]);
    assert_rolls(&c, 160000.0, &want);
}

#[test]
fn reactive_0_burst() {
    let c = n4(N4 { sv: 13, burst: 3, dam: 14, arm: 6, ..N4::default() }, N4 { sv: 13, burst: 0, dam: 13, arm: 3, ..N4::default() });
    assert_rolls(&c, 8000.0, &[
        (Active, 0, 1658.566936265625), (Active, 1, 3380.54768803125), (Active, 2, 2047.324565859375),
        (Active, 3, 519.4431309375001), (Active, 4, 49.14228773437499), (Active, 5, 1.94771053125),
        (Active, 6, 0.027680640625), (Fail, 0, 343.0),
    ]);
}

#[test]
fn active_0_burst_mirrors_reactive_0_burst() {
    // Active burst 0 is a reactive Normal Roll. Here DAM is the PS as it is.
    let same = |dam| dam;
    let reactive_only = n4_with(N4 { sv: 13, burst: 0, dam: 7, arm: 2, ..N4::default() }, N4 { sv: 13, burst: 3, dam: 6, arm: 3, ..N4::default() }, same);
    let active_only = n4_with(N4 { sv: 13, burst: 3, dam: 6, arm: 3, ..N4::default() }, N4 { sv: 13, burst: 0, dam: 7, arm: 2, ..N4::default() }, same);
    assert_eq!(rolls(&reactive_only), 8000.0);
    assert_eq!(chance(&reactive_only, Active), 0.0);
    let by = |c: &Calculation, player: Player| -> BTreeMap<i64, f64> {
        c.outcomes.iter().filter(|o| o.player == player).map(|o| (o.wounds, o.chance * 8000.0)).collect()
    };
    assert_maps_close(&by(&reactive_only, Reactive), &by(&active_only, Active), 1e-6, 1e-12);
    assert_maps_close(&by(&reactive_only, Fail), &BTreeMap::from([(0, 343.0)]), 1e-6, 1e-12);
    assert_maps_close(&by(&active_only, Fail), &BTreeMap::from([(0, 343.0)]), 1e-6, 1e-12);
}

#[test]
fn minimum_5_wounds() {
    let c = n4(
        N4 { sv: 25, burst: 3, dam: 20, arm: 6, ammo: Ammo::Da, ..N4::default() },
        N4 { sv: 13, burst: 0, dam: 13, arm: 0, ..N4::default() },
    );
    assert_rolls(&c, 8000.0, &[(Active, 6, 2744.0), (Active, 7, 3528.0), (Active, 8, 1512.0), (Active, 9, 216.0)]);
}

#[test]
fn active_reactive_both_0_wounds() {
    let c = n4(N4 { sv: 1, burst: 1, dam: 1, arm: 13, ..N4::default() }, N4 { sv: 1, burst: 0, dam: 1, arm: 13, ..N4::default() });
    assert_rolls(&c, 20.0, &[(Active, 0, 1.0), (Fail, 0, 19.0)]);
}

// --- To hit ------------------------------------------------------------------------------------------------------

#[test]
fn success_values() {
    let read = |sv, rolls: &[i64]| rolls.iter().map(|&r| read_roll(r, sv)).collect::<Vec<_>>();
    assert_eq!(read(13, &[1, 12, 13, 14, 20]), [1, 12, 20, 0, 0]);
    // Over 20 the excess is added to the roll: 23 makes 18, 19 and 20 Criticals.
    assert_eq!(read(23, &[1, 14, 17, 18, 20]), [4, 17, 20, 20, 20]);
    // 0 always fails, with no Critical.
    assert!((1..=20).all(|r| read_roll(r, 0) == 0));
}

#[test]
fn ties_cancel() {
    // Both sides at SV 1: the only success is a Critical on a 1, and two Criticals cancel each other.
    let c = calc(&input(Side { success_value: 1, ..side() }, Side { success_value: 1, ..side() }));
    assert_close(chance(&c, Active), 19.0 / 400.0);
    assert_close(chance(&c, Reactive), 19.0 / 400.0);
}

#[test]
fn special_dice_keep_the_best() {
    // B1 plus one Special Die at SV 10 against nobody: one of two dice passing is enough.
    let c = calc(&input(Side { success_value: 10, bonus_burst: 1, ..side() }, Side { burst: 0, ..side() }));
    assert_close(chance(&c, Active), 1.0 - 0.5f64.powi(2));
    assert_eq!(rolls(&c), 400.0);
}

#[test]
fn fixed_reactive_roll() {
    // The reactive side always rolls its success value (19 at most: 20 would be a Critical).
    let fixed = |a, b| Input { fixed_face_to_face: true, ..input(a, b) };
    let c = calc(&fixed(side(), Side { success_value: 10, ..side() }));
    // Only 11, 12 and 13 (a Critical) beat a fixed 10; a 10 ties.
    assert_close(chance(&c, Active), 3.0 / 20.0);
    assert_close(chance(&c, Fail), 1.0 / 20.0);
    assert_eq!(rolls(&c), 20.0);
    let rolled = roll(&fixed(side(), Side { success_value: 25, ..side() })).expect("roll");
    assert!(rolled.outcomes().all(|o| o[3] <= 1 && o[2] == 0), "a fixed 25 rolls as a 19, never a Critical");
}

// --- Direct Templates --------------------------------------------------------------------------------------------

#[test]
fn dodge_vs_template_special_dice() {
    // A Special Die on the Dodge is one more chance to pass: 2 dice at SV 10 fail together 1/4 of the time.
    let tpl = Side { burst: 2, template: true, ..side() };
    let dodge = Side { success_value: 10, saves: 0, ..side() };
    assert_close(chance(&calc(&input(tpl.clone(), dodge.clone())), Active), 0.5);
    assert_close(chance(&calc(&input(tpl, Side { bonus_burst: 1, ..dodge })), Active), 0.25);
}

#[test]
fn template_against_no_aro() {
    // Nobody dodges (burst 0): every hit lands, leftover Special Dice don't make a Dodge.
    let c = calc(&input(Side { burst: 2, template: true, ..side() }, Side { burst: 0, bonus_burst: 2, ..side() }));
    assert_eq!(chance(&c, Active), 1.0);
    assert_eq!(rolls(&c), 1.0);
}

#[test]
fn reactive_template_mirrors_active() {
    // The template's hits are whichever side holds it.
    let tpl = Side { template: true, save_value: 13, ..side() };
    let dodge = Side { success_value: 10, saves: 0, ..side() };
    let active_tpl = calc(&input(tpl.clone(), dodge.clone()));
    let reactive_tpl = calc(&input(dodge, tpl));
    assert_close(chance(&reactive_tpl, Reactive), 0.5);
    assert_eq!(chance(&reactive_tpl, Active), 0.0);
    assert_close(chance(&active_tpl, Active), chance(&reactive_tpl, Reactive));
}

#[test]
fn templates_never_crit() {
    // A Direct Template doesn't roll to hit, so it never scores a Critical (no extra Saving Roll).
    let rolled = roll(&input(Side { burst: 3, template: true, ..side() }, Side { success_value: 10, ..side() })).expect("roll");
    assert!(rolled.outcomes().all(|o| o[0] == 0 && o[2] == 0));
    let c = calc(&input(Side { template: true, save_value: 6, ..side() }, Side { burst: 0, ..side() }));
    assert_eq!(c.outcomes.iter().map(|o| o.wounds).collect::<Vec<_>>(), [0, 1]);
}

#[test]
fn two_templates_are_two_rolls() {
    let tpl = Side { template: true, ..side() };
    assert!(calculate(&input(tpl.clone(), tpl)).is_err());
}

// --- Saving Rolls ------------------------------------------------------------------------------------------------

/// Wounds -> chance from `a`'s successes against nobody (Criticals only if its SV makes them).
fn wounds(a: Side) -> BTreeMap<i64, f64> {
    calc(&input(a, Side { burst: 0, ..side() })).outcomes.iter().map(|o| (o.wounds, o.chance)).collect()
}

/// At SV 19 a die succeeds 95% of the time (1-18 a hit, 19 a Critical); with no critSave both are one hit.
fn hit_95(s: Side) -> Side {
    Side { success_value: 19, crit_save: false, ..s }
}

/// At SV 40 every die is a Critical.
fn crit(s: Side) -> Side {
    Side { success_value: 40, ..s }
}

#[test]
fn saves_per_hit() {
    // Three Saving Rolls at save value 10, each failing half the time.
    let w = wounds(hit_95(Side { saves: 3, save_value: 10, ..side() }));
    assert_close(w[&3], 0.95 / 8.0);
}

#[test]
fn critical_adds_a_save() {
    // One Critical = saves + 1 Saving Rolls, unless critSave is off.
    let most = |s| *wounds(s).keys().max().unwrap();
    assert_eq!(most(crit(Side { saves: 2, save_value: 0, ..side() })), 3);
    assert_eq!(most(crit(Side { saves: 2, save_value: 0, crit_save: false, ..side() })), 2);
}

#[test]
fn wounds_per_failure() {
    // T2: two wounds per failed Saving Roll; a Critical's extra one is always one wound.
    let t2 = Side { save_value: 0, wounds_per_failure: 2, ..side() };
    assert_maps_close(&wounds(hit_95(t2.clone())), &BTreeMap::from([(0, 0.05), (2, 0.95)]), 1e-6, 1e-12);
    assert_eq!(wounds(crit(t2)).keys().collect::<Vec<_>>(), [&3]);
}

#[test]
fn continuous_damage() {
    // Each failed Saving Roll is rolled again, at most MAX_CONTINUOUS more times.
    let w = wounds(hit_95(Side { save_value: 10, cont: true, ..side() }));
    assert_close(w[&1], 0.95 / 4.0);
    assert_eq!(*w.keys().max().unwrap(), 1 + MAX_CONTINUOUS as i64);
    // A save that can't pass used to crash icepool: it chains to the cap.
    let never = wounds(hit_95(Side { save_value: 0, cont: true, ..side() }));
    assert_maps_close(&never, &BTreeMap::from([(0, 0.05), (6, 0.95)]), 1e-6, 1e-12);
}

#[test]
fn secondary_save() {
    // Plasma: every Saving Roll also needs a second one, at its own save value.
    let w = wounds(hit_95(Side { save_value: 20, secondary_save: Some(10), ..side() }));
    assert_close(w[&1], 0.95 / 2.0);
    let w = wounds(hit_95(Side { save_value: 10, secondary_save: Some(20), ..side() }));
    assert_close(w[&1], 0.95 / 2.0);
}

#[test]
fn no_saves() {
    // A Dodge (saves 0) wins the roll but causes nothing, Criticals included.
    let c = calc(&input(crit(Side { saves: 0, ..side() }), Side { burst: 0, ..side() }));
    assert_eq!(c.outcomes, [Chance { player: Active, wounds: 0, chance: 1.0 }]);
}

#[test]
fn no_line_of_fire_nobody_wounds() {
    // Smoke / White Noise with no LoF: the attack rolls no dice (burst 0); nothing is wounded.
    for b in [Side { burst: 0, ..side() }, Side { saves: 0, ..side() }] {
        let c = calc(&input(Side { burst: 0, ..side() }, b));
        assert!(c.outcomes.iter().all(|o| o.wounds == 0));
        assert_close(c.outcomes.iter().map(|o| o.chance).sum(), 1.0);
    }
}
