// Turns Corvus Belli's Army API encodings into the fields army.json stores.
// Used by scripts/fetch-army.mjs at build time (and by tests for fixtures);
// the app only ever sees the normalized form.

// Names the Army data misspells, fixed wherever a name appears (weapon
// properties, extras, skills). Add a line when a release introduces one.
export const RENAMES = {
  'Continous Damage': 'Continuous Damage',
};
export const fixName = (s) => (typeof s === 'string' ? RENAMES[s] ?? s : s);

// Weapon "saving" column -> the Saving Roll a hit asks for:
//   attr     'ARM' | 'BTS' | 'PH' (e.g. Adhesive: PH-6)
//   halved   AP-style halving is printed in the chart (ARM/2, BTS/2)
//   armZero  ARM=0 (e.g. Monofilament)
//   alsoBts  each ARM save comes with a BTS save (Plasma: "ARM and BTS")
//   mod      MOD to the Attribute (PH-6)
// '-' and '*' (no save, or see the weapon's rules) give null.
const SAVES = {
  ARM: {attr: 'ARM'},
  'ARM/2': {attr: 'ARM', halved: true},
  BTS: {attr: 'BTS'},
  'BTS/2': {attr: 'BTS', halved: true},
  'ARM=0': {attr: 'ARM', armZero: true},
  'ARM and BTS': {attr: 'ARM', alsoBts: true},
  'PH-6': {attr: 'PH', mod: -6},
  '-': null,
  '*': null,
  '': null,
};

// Weapon "savingNum" column -> Saving Rolls per hit. Plasma's "1 and 1" is one
// ARM and one BTS roll, which save.alsoBts already says.
const SAVE_ROLLS = {1: 1, 2: 2, 3: 3, '1 and 1': 1, '-': null, '*': null, '': null};

export class UnknownValue extends Error {}

export function normalizeSave(saving, saves) {
  if (!(saving in SAVES)) throw new UnknownValue(`saving "${saving}"`);
  if (!(saves in SAVE_ROLLS)) throw new UnknownValue(`saves "${saves}"`);
  const save = SAVES[saving];
  if ((saves === '1 and 1') !== Boolean(save?.alsoBts)) throw new UnknownValue(`saving "${saving}" with saves "${saves}"`);
  return {save: save && {...save}, saveRolls: SAVE_ROLLS[saves]};
}

// "AP+Exp" -> ['AP', 'Exp']; no Ammunition (e.g. Sepsitor) stays null.
export const normalizeAmmo = (ammo) => (ammo ? ammo.split('+').map((a) => a.trim()) : null);

// One weapon row (firing mode) in the Army's column names -> army.json form.
export function normalizeWeaponRow({saving, saves, ammo, props, ...row}) {
  return {
    ...row,
    ammo: normalizeAmmo(ammo),
    ...normalizeSave(saving ?? '', saves ?? ''),
    props: (props ?? []).map(fixName),
  };
}

// Loadouts that replace a stat list it as a skill named like "BS=12"
// (Konduktor FTO) or "BTS=3" (Alguacil Gatta). The skill stays for display.
const STAT_FIELDS = {MOV: 'move', CC: 'cc', BS: 'bs', PH: 'ph', WIP: 'wip', ARM: 'arm', BTS: 'bts', W: 'w', STR: 'str', S: 's'};
export function statOverrides(skills) {
  let out = null;
  for (const s of skills ?? []) {
    const m = /^([A-Z]+)=(\d+)$/.exec(s.name ?? '');
    if (!m) continue;
    if (!STAT_FIELDS[m[1]]) throw new UnknownValue(`stat override "${s.name}"`);
    out = {...out, [STAT_FIELDS[m[1]]]: Number(m[2])};
  }
  return out;
}
