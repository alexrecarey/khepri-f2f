// Text for the Matchup UI: loadout rows in the profile menu and the traits
// line under each side's summary.
import {SKILL} from '../army/ids.js';
import {skillExtras, traitLabel} from '../army/traits.js';
import {isBsAttackWeapon} from '../army/weapons.js';
import {attackBonuses, benefitsFromCover, dodgeExtras, fireteamBonuses, keepsAroBurst} from '../rules/modifiers.js';
import {MODELED_EQUIP, MODELED_IMMUNITIES, MODELED_SKILLS} from '../rules/matchup.js';
import {BS_ATTACK_WEAPON_EXTRAS} from '../rules/trooper.js';

// Extras such as "+1B" tell otherwise identical loadouts apart.
const nameWithExtras = traitLabel;

function bsWeaponNames(option, weapons) {
  const names = [];
  for (const w of option?.weapons ?? []) {
    const name = nameWithExtras(w);
    if ((weapons?.[w.id] ?? []).some(isBsAttackWeapon) && !names.includes(name)) names.push(name);
  }
  return names;
}

// Distinguishable labels for the loadout rows of a profile group (the Army
// app lists e.g. six identically named "HATAMOTO" rows).
// Loadouts that only differ in points, SWC, order or non-BS gear play the same
// here; keep the first of each.
const traitKey = (t) => `${t.id}:${(t.extra ?? []).join(',')}`;
const loadoutFingerprint = (o, weapons) => JSON.stringify([
  o.name,
  (o.weapons ?? []).filter((w) => (weapons?.[w.id] ?? []).some(isBsAttackWeapon)).map(traitKey).sort(),
  (o.skills ?? []).map(traitKey).sort(),
  (o.equip ?? []).map(traitKey).sort(),
]);

// Lowest value over the loadouts collapsed into a row, with a "+" when some cost more.
function lowestCost(values) {
  const distinct = [...new Set(values)].sort((a, b) => Number(a) - Number(b));
  return `${distinct[0]}${distinct.length > 1 ? '+' : ''}`;
}

// Short forms players use for skills and equipment, to keep the labels short.
// Hand-kept; names not listed are shown as in the Army data.
const ABBREVIATIONS = {
  'Chain of Command': 'CoC',
  'EVO Hacking Device': 'EVO HD',
  'Forward Observer': 'FO',
  'Hacking Device': 'HD',
  'Hacking Device Plus': 'HD+',
  'Killer Hacking Device': 'KHD',
  Lieutenant: 'Lt',
  'Multispectral Visor L1': 'MSV1',
  'Multispectral Visor L2': 'MSV2',
  'Multispectral Visor L3': 'MSV3',
};
const shortNameWithExtras = (x) => nameWithExtras({...x, name: ABBREVIATIONS[x.name] ?? x.name});

// Weapons the label leaves out: the BS weapons every loadout has and the ones
// that aren't BS weapons. Collapsed loadouts can differ in the latter, listed
// as alternatives ("optional" when some have none).
function omittedWeapons(row, shown) {
  const perLoadout = row.map((o) =>
    [...new Set((o.weapons ?? []).map(nameWithExtras))].filter((n) => !shown.includes(n)));
  const common = perLoadout[0].filter((n) => perLoadout.every((names) => names.includes(n)));
  const others = [...new Set(perLoadout.map((names) => names.filter((n) => !common.includes(n)).join(', ')))];
  const alternatives = others.filter(Boolean);
  const parts = [];
  if (common.length > 0) parts.push(common.join(', '));
  if (alternatives.length > 0) parts.push(`${others.includes('') ? 'optional ' : ''}${alternatives.join(' or ')}`);
  return parts.join(' · ');
}

// Per row: `label` tells the loadouts apart, skills and equipment (abbreviated)
// first as in the Army list's name column; `swc` and `points` mark the row as
// a profile, not a weapon; `detail` is the rest of the loadout ('' when the
// label has it all).
export function loadoutLabels(group, weapons) {
  const collapsed = new Map();
  for (const o of group?.options ?? []) {
    const fp = loadoutFingerprint(o, weapons);
    collapsed.set(fp, [...(collapsed.get(fp) ?? []), o]);
  }
  const rows = [...collapsed.values()];
  const options = rows.map((row) => row[0]);
  const namesDiffer = new Set(options.map((o) => o.name)).size > 1;
  const perOption = options.map((o) => bsWeaponNames(o, weapons));
  const labels = options.map((o, i) => {
    const mine = perOption[i];
    const common = mine.filter((n) => perOption.every((names) => names.includes(n)));
    let shown = mine.filter((n) => !common.includes(n));
    if (shown.length === 0) shown = mine;
    const extras = [...(o.skills ?? []), ...(o.equip ?? [])].map(shortNameWithExtras);
    const parts = [];
    if (namesDiffer && o.name) parts.push(o.name);
    if (extras.length > 0) parts.push(extras.join(', '));
    if (shown.length > 0) parts.push(shown.join(', '));
    return {
      id: o.id,
      label: parts.join(' · ') || o.name || `Profile ${o.id}`,
      swc: lowestCost(rows[i].map((x) => x.swc)),
      points: lowestCost(rows[i].map((x) => x.points)),
      detail: omittedWeapons(rows[i], shown),
    };
  });
  const counts = labels.reduce((acc, l) => acc.set(l.label, (acc.get(l.label) ?? 0) + 1), new Map());
  return labels.map((l) => (counts.get(l.label) > 1 ? {...l, label: `${l.label} #${l.id}`} : l));
}

// Skills, equipment and state on this side that the converter actually uses,
// for the matchup summary. Order follows the profile, then the roll bonuses
// that apply to the chosen action (Fireteam included), summed per kind.
// `role` is 'A' (active) or 'B' (reactive).
export function matchupTraits(side, role = 'A') {
  if (!side?.traits) return [];
  const out = [];
  for (const s of side.traits.skills) {
    if (MODELED_SKILLS.includes(s.id)) out.push(traitLabel(s));
    else if (s.id === SKILL.IMMUNITY && (s.extra ?? []).some((e) => MODELED_IMMUNITIES.includes(e))) out.push(traitLabel(s));
  }
  for (const e of side.traits.equip) {
    if (MODELED_EQUIP.includes(e.id)) out.push(traitLabel(e));
  }
  for (const e of skillExtras(side.traits, SKILL.BS_ATTACK)) {
    if (BS_ATTACK_WEAPON_EXTRAS.test(e) || /^-\d+$/.test(e)) out.push(`BS Attack (${e})`);
  }
  if (benefitsFromCover(side)) out.push('In cover');
  out.push(...(side.upgrades ?? []).map((u) => u.label));
  out.push(...rollBonusLabels(side, role));
  return [...new Set(out)];
}

const signed = (n) => `${n > 0 ? '+' : ''}${n}`;

function rollBonusLabels(side, role) {
  const ft = fireteamBonuses(side.ftSize);
  if (side.weapon?.pseudo === 'dodge') {
    const dodge = dodgeExtras(side.traits);
    const labels = [];
    // "Dodge (PH=14)" replaces PH; the Fireteam MOD still applies on top.
    if (dodge.ph !== null) labels.push(`Dodge (PH=${dodge.ph})`);
    if (dodge.mod + ft.dodge !== 0) labels.push(`Dodge ${signed(dodge.mod + ft.dodge)}`);
    if (dodge.opponentMod) labels.push(`Dodge (${dodge.opponentMod})`);   // on the opponent
    if (dodge.sd > 0) labels.push(`+${dodge.sd}SD`);
    if (dodge.arm > 0) labels.push(`Dodge (ARM +${dodge.arm})`);
    return labels;
  }
  const b = attackBonuses(side);
  const labels = [];
  if (b.skillBurst > 0 && (role === 'A' || keepsAroBurst(side))) labels.push(`+${b.skillBurst}B`);
  if (b.sd > 0) labels.push(`+${b.sd}SD`);
  if (b.bs > 0) labels.push(`BS+${b.bs}`);
  return labels;
}
