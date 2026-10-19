// Close combat (N5, infinitythewiki.com: Close Combat, CC Attack, Martial
// Arts, Natural Born Warrior). A side that picks a CC weapon makes a CC
// Attack: it rolls CC, has no range band, and none of the shooting MODs apply
// to it (Mimetism, cover, Smoke...). The other side may answer in CC, Dodge
// or shoot back (it isn't Engaged yet when the attacker charges in).
//
// Every MOD here is a line {value, label}; deriveInputs (matchup.js) adds
// them up and the ledger lists them, so a rule lives only in this file.
import {SKILL} from '../army/ids.js';
import {hasSkill, skillExtras} from '../army/traits.js';

// Martial Arts chart (N5). Levels are not cumulative: each row is the whole
// bonus. `attack` is the user's own CC MOD, `opponent` the MOD on the
// opponent's Face to Face Roll (whatever it rolls: CC, Dodge or a shot),
// `burst` / `sd` extra dice. Unlike other Burst MODs these apply in both the
// Active and the Reactive Turn.
export const MARTIAL_ARTS = [
  {level: 1, id: SKILL.MARTIAL_ARTS_L1, attack: 0, opponent: -3, burst: 0, sd: 0},
  {level: 2, id: SKILL.MARTIAL_ARTS_L2, attack: 3, opponent: -3, burst: 0, sd: 0},
  {level: 3, id: SKILL.MARTIAL_ARTS_L3, attack: 3, opponent: -3, burst: 0, sd: 1},
  {level: 4, id: SKILL.MARTIAL_ARTS_L4, attack: 3, opponent: -3, burst: 1, sd: 0},
  {level: 5, id: SKILL.MARTIAL_ARTS_L5, attack: 3, opponent: -3, burst: 1, sd: 1},
];

// The trooper's Martial Arts row, the highest level it lists; null without.
export function martialArts(traits) {
  return [...MARTIAL_ARTS].reverse().find((m) => hasSkill(traits, m.id)) ?? null;
}
const maName = (ma) => `Martial Arts L${ma.level}`;

// Close Combat With Multiple Troopers: the trooper attacking gets +1 B for
// each ally (trooper or Peripheral) in Silhouette contact with the target,
// in the Active and the Reactive Turn. At most 4 models can touch a 25 mm
// base and 6 a 40 mm or larger one (wiki, Other CC Restrictions); the
// attacker is one of them. The Army data has no base sizes: S1-S2 are taken
// as 25 mm, S3 and up as 40 mm or larger.
export const CONTACT_LIMIT = {small: 4, large: 6};
export const CC_ALLIES_MAX = CONTACT_LIMIT.large - 1;
export const ccAlliesMax = (target) =>
  ((target?.profile?.s ?? 2) >= 3 ? CONTACT_LIMIT.large : CONTACT_LIMIT.small) - 1;
// The allies x counts against y: the player's number, down to what fits.
export const ccAllies = (x, y) => Math.min(x?.ccAllies ?? 0, ccAlliesMax(y));

// Improvised weapons (D-Charges in CC Mode): -6 to the user's CC.
export const IMPROVISED_MOD = -6;

// The CC Attack skill's bracketed values:
//   +3, +9               a MOD to the user's CC Attack
//   -3, -6               a MOD on the opponent's Face to Face Roll
//   +1B                  Burst, Active Turn only
//   AP, Shock,           added to every CC weapon (trooper.js)
//   Continuous Damage
//   Antimaterial         only matters against scenery
export function ccAttackSkill(traits) {
  const out = {mod: 0, opponent: 0, burst: 0, ap: false, shock: false, cont: false};
  for (const e of skillExtras(traits, SKILL.CC_ATTACK)) {
    let m;
    if ((m = /^\+(\d+)$/.exec(e))) out.mod += Number(m[1]);
    else if ((m = /^-(\d+)$/.exec(e))) out.opponent = Math.min(out.opponent, -Number(m[1]));
    else if ((m = /^\+(\d+)B$/.exec(e))) out.burst += Number(m[1]);
    else if (e === 'AP') out.ap = true;
    else if (e === 'Shock') out.shock = true;
    else if (e === 'Continuous Damage') out.cont = true;
  }
  return out;
}

// Berserk (wiki, N5): a Long Skill, Move (both MOV values) + CC Attack, so
// Active Turn only. Its bracketed MOD (Berserk (+3), (+6)) goes on the CC
// Attack; +1 SD still applies. Plain Berserk changes nothing on the roll,
// only how far the trooper moves. Whether it is used is the player's call
// (chip); the MOD, 0 for plain Berserk.
export const hasBerserk = (traits) => hasSkill(traits, SKILL.BERSERK);
export function berserkMod(traits) {
  const mods = skillExtras(traits, SKILL.BERSERK).map((e) => /^\+(\d+)$/.exec(e)).filter(Boolean).map((m) => Number(m[1]));
  return mods.length ? Math.max(...mods) : 0;
}
// x declared Berserk: the chip is on, x is the active side and CC attacks.
export const usesBerserk = (x, active) => active && isCcAttack(x) && Boolean(x.berserk) && hasBerserk(x.traits);

// Protheion (wiki, N5.3): optional, in the Active or Reactive Turn, with a
// CC Attack on a target that has VITA. Declared (a chip), its bracketed
// negative MOD goes on the enemy's Face to Face Roll. A trooper has one
// value, Protheion (-3) or (-6); plain Protheion has none.
export function protheionValue(traits) {
  const printed = skillExtras(traits, SKILL.PROTHEION).map((e) => /^-(\d+)$/.exec(e)).filter(Boolean).map((m) => -Number(m[1]));
  return printed.length ? Math.min(...printed) : 0;
}
// The MOD x's declared Protheion puts on y, 0 when it doesn't apply: not
// declared, not a CC Attack, or a target without VITA (STR).
export function protheionMod(x, y) {
  if (!x?.protheion || !isCcAttack(x) || y?.profile?.str) return 0;
  return protheionValue(x.traits);
}

// Is this side making a CC Attack?
export const isCcAttack = (x) => Boolean(x?.weapon?.cc);

// MODs to x's own CC Attack roll (before the opponent's). `active`: x is
// the active side (Berserk).
export function ccAttackMods(x, active) {
  const {row} = x.weapon;
  const lines = [];
  if (usesBerserk(x, active)) {
    const mod = berserkMod(x.traits);
    lines.push({value: mod, label: mod ? `Berserk (+${mod})` : 'Berserk'});
  }
  const ma = martialArts(x.traits);
  if (ma?.attack) lines.push({value: ma.attack, label: maName(ma)});
  const skill = ccAttackSkill(x.traits);
  if (skill.mod) lines.push({value: skill.mod, label: `CC Attack (+${skill.mod})`});
  for (const p of row.props ?? []) {
    const m = /^CC Attack \(\+(\d+)\)$/.exec(p);
    if (m) lines.push({value: Number(m[1]), label: `${row.name} (+${m[1]})`});
  }
  if ((row.props ?? []).includes('Improvised')) lines.push({value: IMPROVISED_MOD, label: 'Improvised'});
  return lines;
}

// MODs x's CC Attack puts on its opponent y's Face to Face Roll: Martial
// Arts, CC Attack (-X), the weapon's own (-X) (PARA CC Weapon (-6)) and a
// declared Protheion (-X).
export function ccOpposingMods(x, y) {
  const lines = [];
  const ma = martialArts(x.traits);
  if (ma?.opponent) lines.push({value: ma.opponent, label: maName(ma)});
  const skill = ccAttackSkill(x.traits);
  if (skill.opponent) lines.push({value: skill.opponent, label: `CC Attack (${skill.opponent})`});
  const weapon = x.weapon.mods?.opponent ?? 0;
  if (weapon) lines.push({value: weapon, label: `${x.weapon.name} (${weapon})`});
  const protheion = protheionMod(x, y);
  if (protheion) lines.push({value: protheion, label: `Protheion (${protheion})`});
  return lines;
}

// Natural Born Warrior: the target of a CC Attack that answers with a CC
// Attack ignores every negative MOD its attacker imposes (Martial Arts,
// Surprise Attack, CC Attack (-X)...). Not when it Dodges or shoots.
export const naturalBornWarrior = (x, y) =>
  isCcAttack(x) && isCcAttack(y) && hasSkill(y.traits, SKILL.NATURAL_BORN_WARRIOR);

// x's CC Burst against y, as lines: the weapon's B, then the loadout's and
// the CC Attack skill's +B in the Active Turn only (in ARO the Burst is 1),
// Martial Arts' +1 B and the allies in contact in both turns.
export function ccBurst(x, active, y) {
  const {row, mods} = x.weapon;
  const lines = [{value: row.burst ?? 1, label: x.weapon.name}];
  const extra = (mods?.burst ?? 0) + ccAttackSkill(x.traits).burst;
  if (extra) lines.push({value: extra, label: 'loadout / CC Attack'});
  if (!active) {
    const base = lines.reduce((t, l) => t + l.value, 0);
    if (base !== 1) lines.push({value: 1 - base, label: 'ARO: one die'});
  }
  const ma = martialArts(x.traits);
  if (ma?.burst) lines.push({value: ma.burst, label: maName(ma)});
  const allies = ccAllies(x, y);
  if (allies) lines.push({value: allies, label: `${allies} ${allies === 1 ? 'ally' : 'allies'} in contact`});
  return lines;
}

// x's Special Dice in CC: Martial Arts L3 / L5 (both turns). Fireteam
// bonuses are for BS Attacks only.
export function ccSd(x) {
  const ma = martialArts(x.traits);
  const lines = [];
  if (ma?.sd) lines.push({value: ma.sd, label: maName(ma)});
  if (x.weapon.mods?.sd) lines.push({value: x.weapon.mods.sd, label: 'loadout'});
  return lines;
}
