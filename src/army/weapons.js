// Weapons as the Army data lists them: `army.weapons[id]` is one row per firing
// mode, and a loadout refers to a weapon by id with optional extras ("+1B").

const BS_SAVINGS = new Set(['ARM', 'ARM/2', 'BTS', 'BTS/2', 'ARM=0', 'ARM and BTS']);
const EXCLUDED_PROPS = new Set(['CC', 'CC Attack (+3)', 'Deployable', 'Perimeter', 'Comms. Attack', 'Technical Weapon', 'Targetless']);

export const isTemplate = (row) => (row?.props ?? []).some((p) => p.startsWith('Direct Template'));

export const isImpactTemplate = (row) => (row?.props ?? []).some((p) => p.startsWith('Impact Template'));

export const hasCircularImpactTemplate = (row) => (row.props ?? []).includes('Impact Template (Circular)');

export function isBsAttackWeapon(row) {
  if (!row || typeof row.dmg !== 'number') return false;
  if (!BS_SAVINGS.has(row.saving)) return false;
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
  const prop = (row.props ?? []).find((p) => p.startsWith('Bioweapon ('));
  if (!prop) return null;
  if (/\bEXP\b/i.test(prop)) return 'EXP';
  if (/\bDA\b/i.test(prop)) return 'DA';
  return null;
};

export const hasShockAmmo = (row) =>
  /\bshock\b/i.test(row?.ammo ?? '') || (row?.props ?? []).some((p) => p.startsWith('Bioweapon (') && /\bshock\b/i.test(p));

// Plasma's combined save counts as ARM: its BTS half is a plain Saving Roll,
// with nothing for an Immunity to ignore.
export const saveAttribute = (row) => ((row?.saving ?? '').startsWith('BTS') ? 'BTS' : 'ARM');

export const hasContinuousDamage = (row, mods) => Boolean(mods?.cont) || (row?.props ?? []).includes('Continous Damage');

// Non-Lethal weapons, and ones without Ammunition (Sepsitor), cause States
// instead of Wounds.
export const causesWounds = (row) => row.ammo != null && !(row.props ?? []).includes('Non-lethal');

// Ammo extras that swap the weapon's Ammunition (see withAmmoExtra). "AP" is
// handled apart, as forceAP.
const AMMO_EXTRAS = ['T2', 'Shock', 'Viral'];

// Loadout-level weapon extras such as "+1B", "+1SD", "PS=6", "AP", "T2".
export function parseWeaponMods(extra = []) {
  const mods = {burst: 0, sd: 0, ps: null, forceAP: false, cont: false, sv: 0, ammo: null};
  for (const e of extra ?? []) {
    let m;
    if ((m = /^\+(\d+)B$/.exec(e))) mods.burst += Number(m[1]);
    else if ((m = /^\+(\d+)SD$/.exec(e))) mods.sd += Number(m[1]);
    else if ((m = /^PS=(\d+)$/.exec(e))) mods.ps = Number(m[1]);
    else if (e === 'AP') mods.forceAP = true;
    else if (AMMO_EXTRAS.includes(e)) mods.ammo = e;
    else if (e === 'Continous Damage') mods.cont = true;
    // BS MOD for this weapon: "+3" (Flash Pulse), "+3 BS" (Tactical Bow).
    else if ((m = /^([+-]\d+)(?: BS)?$/.exec(e))) mods.sv += Number(m[1]);
  }
  return mods;
}

// Ammunition types other than N, loadout "AP" included.
export function ammoTypes(row, mods) {
  const ammo = (row.ammo ?? 'N').split('+').filter((a) => a !== 'N');
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
    return {...row, name: `Viral ${row.name}`, saving: 'BTS', props: ['Bioweapon (DA+SHOCK)', ...props]};
  }
  return {...row, ammo: [...ammoTypes(row), mods.ammo].join('+')};
}

const modeSuffix = (mode) => (mode ? ` (${mode.replace(/ Mode$/i, '')})` : '');

export function weaponLabel(row, mods) {
  // Templates show their burst too (e.g. a Dog-Warrior's B2 Chain Rifle); the
  // weapon menu marks them "template" in place of the range MOD.
  const burst = (row.burst ?? 1) + mods.burst;
  const sd = mods.sd > 0 ? `+${mods.sd}SD` : '';
  const dmg = mods.ps ?? row.dmg;
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
