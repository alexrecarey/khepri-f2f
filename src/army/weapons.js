// Weapons as the Army data lists them: `army.weapons[id]` is one row per firing
// mode, and a loadout refers to a weapon by id with optional extras ("+1B").
// Rows are in army.json form (src/army/normalize.js): `ammo` is a list or
// null, `save` / `saveRolls` describe the Saving Roll. Weapon properties are
// the Army's strings, read only through the helpers below.

const EXCLUDED_PROPS = new Set(['CC', 'CC Attack (+3)', 'Deployable', 'Perimeter', 'Comms. Attack', 'Technical Weapon', 'Targetless']);

export const isTemplate = (row) => (row?.props ?? []).some((p) => p.startsWith('Direct Template'));

// Blast Mode weapons. The only Impact Template in the Army data is (Circular);
// the pipeline stops if another shape appears (scripts/army-validate.mjs).
export const isImpactTemplate = (row) => (row?.props ?? []).some((p) => p.startsWith('Impact Template'));

export function isBsAttackWeapon(row) {
  if (!row || typeof row.dmg !== 'number') return false;
  if (row.save?.attr !== 'ARM' && row.save?.attr !== 'BTS') return false;
  if ((row.props ?? []).some((p) => EXCLUDED_PROPS.has(p))) return false;
  return Boolean(row.ranges) || isTemplate(row);
}

// Weapons with the BS Weapon (PH) / (WIP) trait roll against that attribute
// instead of BS (e.g. Grenades, Flash Pulse).
export function attackAttribute(row) {
  const props = row?.props ?? [];
  if (props.includes('BS Weapon (PH)')) return 'ph';
  if (props.includes('BS Weapon (WIP)')) return 'wip';
  return 'bs';
}

// Viral etc. are listed as one BTS save plus a "Bioweapon (DA+SHOCK)" property.
export const bioweaponAmmo = (row) => {
  const prop = bioweaponProp(row);
  if (!prop) return null;
  if (/\bEXP\b/i.test(prop)) return 'EXP';
  if (/\bDA\b/i.test(prop)) return 'DA';
  return null;
};

// A Bioweapon's ammo as its brackets list it: "Bioweapon (DA+SHOCK)" ->
// ['DA', 'SHOCK']; [] for any other weapon.
export const bioweaponParts = (row) => bioweaponProp(row)?.match(/\(([^)]+)\)/)?.[1].split('+') ?? [];

// Ammunition as players write it: DA, EXP, AP, T2, but Shock, Stun, Plasma.
const AMMO_NAMES = {N: 'N', DA: 'DA', EXP: 'EXP', AP: 'AP', T2: 'T2', SHOCK: 'Shock', STUN: 'Stun', PLASMA: 'Plasma'};
export const ammoName = (a) => AMMO_NAMES[a.toUpperCase()] ?? a;

export const hasAmmo = (row, name) => (row?.ammo ?? []).some((a) => a.toUpperCase() === name.toUpperCase());

export const hasShockAmmo = (row) =>
  hasAmmo(row, 'Shock') || (row?.props ?? []).some((p) => p.startsWith('Bioweapon (') && /\bshock\b/i.test(p));

// Plasma: one ARM and one BTS Saving Roll per hit.
export const isPlasma = (row) => Boolean(row?.save?.alsoBts);

// The Attribute of the Saving Roll. Plasma's combined save counts as ARM: its
// BTS half is a plain Saving Roll, with nothing for an Immunity to ignore.
export const saveAttribute = (row) => (row?.save?.attr === 'BTS' ? 'BTS' : 'ARM');

export const hasContinuousDamage = (row, mods) => Boolean(mods?.cont) || (row?.props ?? []).includes('Continuous Damage');

// Non-Lethal weapons, and ones without Ammunition (Sepsitor), cause States
// instead of Wounds.
export const causesWounds = (row) => row.ammo != null && !isNonLethal(row);

export const isNonLethal = (row) => (row?.props ?? []).includes('Non-lethal');

export const causesStunned = (row) => (row?.props ?? []).some((p) => p.startsWith('State: Stunned'));

// "Bioweapon (DA+SHOCK)" or null.
export const bioweaponProp = (row) => (row?.props ?? []).find((p) => p.startsWith('Bioweapon (')) ?? null;

// Ammo extras that swap the weapon's Ammunition (see withAmmoExtra). "AP" is
// handled apart, as forceAP.
const AMMO_EXTRAS = ['T2', 'Shock', 'Viral'];

// Adds one loadout-level weapon extra to mods; false if it isn't one.
function addWeaponMod(mods, e) {
  let m;
  if ((m = /^\+(\d+)B$/.exec(e))) mods.burst += Number(m[1]);
  else if ((m = /^\+(\d+)SD$/.exec(e))) mods.sd += Number(m[1]);
  else if ((m = /^PS=(\d+)$/.exec(e))) mods.ps = Number(m[1]);
  else if (e === 'AP') mods.forceAP = true;
  else if (AMMO_EXTRAS.includes(e)) mods.ammo = e;
  else if (e === 'Continuous Damage') mods.cont = true;
  // BS MOD for this weapon: "+3" (Flash Pulse), "+3 BS" (Tactical Bow).
  else if ((m = /^([+-]\d+)(?: BS)?$/.exec(e))) mods.sv += Number(m[1]);
  else return false;
  return true;
}

// Loadout-level weapon extras such as "+1B", "+1SD", "PS=6", "AP", "T2".
export function parseWeaponMods(extra = []) {
  // psMod: MOD to the target's Saving Rolls, as a change to PS (BS Attack (SR-1)).
  const mods = {burst: 0, sd: 0, ps: null, psMod: 0, forceAP: false, cont: false, sv: 0, ammo: null};
  for (const e of extra ?? []) addWeaponMod(mods, e);
  return mods;
}

// The extras parseWeaponMods doesn't read, for the pipeline's check.
export const unreadWeaponExtras = (extra = []) =>
  (extra ?? []).filter((e) => !addWeaponMod(parseWeaponMods(), e));

// Ammunition types other than N, loadout "AP" included.
export function ammoTypes(row, mods) {
  const ammo = (row.ammo ?? ['N']).filter((a) => a !== 'N');
  if (mods?.forceAP && !ammo.includes('AP')) ammo.unshift('AP');
  return ammo;
}

// The weapon row as fired with the loadout's ammo extra, so the ammo, Shock
// and default-weapon rules read it like any other row. "T2" and "Shock"
// replace N ammo (Combi Rifle (T2), Mk12 (T2)). "Viral" makes the chart's
// Viral Combi Rifle: N ammo, BTS save, Bioweapon (DA+SHOCK), and "Viral" in
// the name for Vulnerability (Viral).
function withAmmoExtra(row, mods) {
  if (!mods?.ammo) return row;
  if (mods.ammo === 'Viral') {
    const props = (row.props ?? []).filter((p) => !p.startsWith('Bioweapon ('));
    return {...row, name: `Viral ${row.name}`, save: {attr: 'BTS'}, props: ['Bioweapon (DA+SHOCK)', ...props]};
  }
  return {...row, ammo: [...ammoTypes(row), mods.ammo]};
}

const modeSuffix = (mode) => (mode ? ` (${mode.replace(/ Mode$/i, '')})` : '');

// The PS the target saves against: the loadout's "PS=6" or the chart's, with
// any Saving Roll MOD (BS Attack (SR-1)).
export const weaponPS = (row, mods) => (mods?.ps ?? row.dmg) + (mods?.psMod ?? 0);

export function weaponLabel(row, mods) {
  // Templates show their burst too (e.g. a Dog-Warrior's B2 Chain Rifle); the
  // weapon menu marks them "template" in place of the range MOD.
  const burst = (row.burst ?? 1) + mods.burst;
  const sd = mods.sd > 0 ? `+${mods.sd}SD` : '';
  const dmg = weaponPS(row, mods);
  const ammo = ammoTypes(row, mods).join('+') || 'N';
  return `${row.name}${modeSuffix(row.mode)} · B${burst}${sd} · PS${dmg} · ${ammo}`;
}

// Weapon menu order: single-mode first, then "Hit Mode", then other modes.
const modeRank = (row) => (!row.mode ? 0 : /^hit/i.test(row.mode) ? 1 : 2);

// BS-attack capable weapons of a loadout, one entry per firing mode.
export function bsWeapons(option, weapons) {
  const out = [];
  for (const w of option?.weapons ?? []) {
    const mods = parseWeaponMods(w.extra);
    const rows = [...(weapons?.[w.id] ?? [])].sort((a, b) => modeRank(a) - modeRank(b));
    for (const base of rows) {
      if (!isBsAttackWeapon(base)) continue;
      const row = withAmmoExtra(base, mods);
      const key = `${w.id}:${row.mode ?? ''}`;
      if (out.some((x) => x.key === key)) continue;
      out.push({key, id: w.id, name: row.name, mode: row.mode, row, mods, label: weaponLabel(row, mods)});
    }
  }
  return out;
}
