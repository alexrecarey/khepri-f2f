// Weapons as the Army data lists them: `army.weapons[id]` is one row per firing
// mode, and a loadout refers to a weapon by id with optional extras ("+1B").
// Rows are in army.json form (src/army/normalize.js): `ammo` is a list or
// null, `save` / `saveRolls` describe the Saving Roll. Weapon properties are
// the Army's strings, read only through the helpers below.
import {list, msg, render} from '../i18n/message.js';

/** @typedef {import('../types.js').WeaponRow} WeaponRow */
/** @typedef {import('../types.js').WeaponMods} WeaponMods */
/** @typedef {import('../types.js').WeaponEntry} WeaponEntry */
/** @typedef {import('../types.js').Choice} Choice */
/** A weapon row, or nothing picked.
 * @typedef {WeaponRow | null | undefined} MaybeRow */

// Comms Attacks are rolled (the Jammer); the Technical Weapons among them
// (Tohaa programs) are not modelled yet.
const EXCLUDED_PROPS = new Set(['CC', 'CC Attack (+3)', 'Deployable', 'Perimeter', 'Technical Weapon', 'Targetless']);

/** @param {MaybeRow} row */
export const isTemplate = (row) => (row?.props ?? []).some((p) => p.startsWith('Direct Template'));

// What a weapon entry is (types.js WeaponEntry / PseudoEntry), set once
// where it is built and switched on everywhere else (bsWeapons / ccWeapons
// here, army/hacking.js trooperPrograms, rules/trooper.js pseudoWeapons):
//   bs        a BS Attack that is rolled (Impact Templates included: they roll)
//   template  a Direct Template: hits without a roll
//   cc        a CC Attack
//   program   a Hacking Program (a Comms Attack rolled on WIP)
//   dodge     Dodge (Bangbomb too), reset  Reset (Zero Pain too), none  No ARO
/** @type {import('../types.js').WeaponKind[]} */
export const WEAPON_KINDS = ['bs', 'template', 'cc', 'program', 'dodge', 'reset', 'none'];
// A choice that is not a weapon.
/**
 * @param {Choice | null | undefined} w
 * @returns {w is import('../types.js').PseudoEntry}
 */
export const isPseudo = (w) => w?.kind === 'dodge' || w?.kind === 'reset' || w?.kind === 'none';
// A choice that rolls dice: anything but a Direct Template or No ARO.
/**
 * @param {Choice | null | undefined} w
 * @returns {w is WeaponEntry | (import('../types.js').PseudoEntry & {kind: 'dodge' | 'reset'})}
 */
export const rolls = (w) => w?.kind === 'bs' || w?.kind === 'cc' || w?.kind === 'program' || w?.kind === 'dodge' || w?.kind === 'reset';

// Blast Mode weapons. The only Impact Template in the Army data is (Circular);
// the pipeline stops if another shape appears (scripts/army-validate.mjs).
/** @param {MaybeRow} row */
export const isImpactTemplate = (row) => (row?.props ?? []).some((p) => p.startsWith('Impact Template'));

// Close combat weapons: the CC Trait, or a Chest Mine's CC Mode ("CC Attack
// (+3)"). They need a Saving Roll to cause anything: ARM / BTS, or PH for
// PARA (no PS; save.mod is the MOD to the PH roll).
/** @param {MaybeRow} row */
export const isCcWeapon = (row) => (row?.props ?? []).some((p) => p === 'CC' || p.startsWith('CC Attack ('))
  // With a CC property there is a row.
  && (/** @type {WeaponRow} */ (row).save?.attr === 'ARM' || /** @type {WeaponRow} */ (row).save?.attr === 'BTS' || /** @type {WeaponRow} */ (row).save?.attr === 'PH');

// Comms Attack (wiki, Labels): evaded with Reset, not Dodge; Partial Cover
// has no effect on it.
/** @param {MaybeRow} row */
export const isCommsAttack = (row) => (row?.props ?? []).includes('Comms. Attack');

// Weapons that need no LoF (Jammer): Mimetism, Albedo, Smoke and White Noise
// don't touch them.
/** @param {MaybeRow} row */
export const needsLof = (row) => !(row?.props ?? []).includes('No LoF');

// Weapons that reach the user's Zone of Control (8") instead of range bands.
/** @param {MaybeRow} row */
export const inZoneOfControl = (row) => (row?.props ?? []).includes('Zone of Control');

// PARA (Adhesive Launcher Rifle, Riotstoppers) has no PS: the target rolls
// PH-6 instead (save.attr 'PH').
/** @param {MaybeRow} row */
export function isBsAttackWeapon(row) {
  if (!row) return false;
  const para = row.save?.attr === 'PH';
  if (!para && typeof row.dmg !== 'number') return false;
  if (!para && row.save?.attr !== 'ARM' && row.save?.attr !== 'BTS') return false;
  if ((row.props ?? []).some((p) => EXCLUDED_PROPS.has(p))) return false;
  return Boolean(row.ranges) || isTemplate(row) || inZoneOfControl(row);
}

// Weapons with the BS Weapon (PH) / (WIP) trait roll against that attribute
// instead of BS (e.g. Grenades, Flash Pulse). Hacking Programs roll WIP.
// CC weapons roll against CC.
/**
 * @param {MaybeRow} row
 * @returns {'cc' | 'ph' | 'wip' | 'bs'}
 */
export function attackAttribute(row) {
  const props = row?.props ?? [];
  if (isCcWeapon(row)) return 'cc';
  if (props.includes('BS Weapon (PH)')) return 'ph';
  if (props.includes('BS Weapon (WIP)') || props.includes('Hacking Program')) return 'wip';
  return 'bs';
}

// Viral etc. are listed as one BTS save plus a "Bioweapon (DA+SHOCK)" property.
/**
 * @param {MaybeRow} row
 * @returns {'EXP' | 'DA' | null}
 */
export const bioweaponAmmo = (row) => {
  const prop = bioweaponProp(row);
  if (!prop) return null;
  if (/\bEXP\b/i.test(prop)) return 'EXP';
  if (/\bDA\b/i.test(prop)) return 'DA';
  return null;
};

// A Bioweapon's ammo as its brackets list it: "Bioweapon (DA+SHOCK)" ->
// ['DA', 'SHOCK']; [] for any other weapon.
/**
 * @param {MaybeRow} row
 * @returns {string[]}
 */
export const bioweaponParts = (row) => bioweaponProp(row)?.match(/\(([^)]+)\)/)?.[1].split('+') ?? [];

// Ammunition as players write it: DA, EXP, AP, T2, but Shock, Stun, Plasma
// (src/i18n: ammo.*). Any other is shown as the data has it. ammoMsg is the
// descriptor (i18n/message.js), ammoName its text in t's language.
/**
 * @param {string} a
 * @returns {import('../types.js').MessageKey}
 */
export const ammoMsg = (a) => ({...msg(`ammo.${a.toUpperCase()}`), fallback: a});
/**
 * @param {string} a
 * @param {import('../types.js').Translator} t
 */
export const ammoName = (a, t) => render(t, ammoMsg(a));

/**
 * @param {MaybeRow} row
 * @param {string} name
 */
export const hasAmmo = (row, name) => (row?.ammo ?? []).some((a) => a.toUpperCase() === name.toUpperCase());

/** @param {MaybeRow} row */
export const hasShockAmmo = (row) =>
  hasAmmo(row, 'Shock') || (row?.props ?? []).some((p) => p.startsWith('Bioweapon (') && /\bshock\b/i.test(p));

// Plasma: one ARM and one BTS Saving Roll per hit.
/** @param {MaybeRow} row */
export const isPlasma = (row) => Boolean(row?.save?.alsoBts);

// The Attribute of the Saving Roll. Plasma's combined save counts as ARM: its
// BTS half is a plain Saving Roll, with nothing for an Immunity to ignore.
// PARA saves with PH, which no Immunity covers.
/**
 * @param {MaybeRow} row
 * @returns {'ARM' | 'BTS' | 'PH'}
 */
export const saveAttribute = (row) => (row?.save?.attr === 'BTS' || row?.save?.attr === 'PH' ? row.save.attr : 'ARM');

/**
 * @param {MaybeRow} row
 * @param {Pick<WeaponMods, 'cont'> | null | undefined} mods
 */
export const hasContinuousDamage = (row, mods) => Boolean(mods?.cont) || (row?.props ?? []).includes('Continuous Damage');

// Non-Lethal weapons, and ones without Ammunition (Sepsitor), cause States
// instead of Wounds.
/** @param {WeaponRow} row */
export const causesWounds = (row) => row.ammo != null && !isNonLethal(row);

/** @param {MaybeRow} row */
export const isNonLethal = (row) => (row?.props ?? []).includes('Non-lethal');

// A failed save leaves the target Isolated instead of wounded (Jammer).
/** @param {MaybeRow} row */
export const isolates = (row) => isNonLethal(row) && (row?.props ?? []).includes('State: Isolated');

/** @param {MaybeRow} row */
export const causesStunned = (row) => (row?.props ?? []).some((p) => p.startsWith('State: Stunned'));

// A failed save leaves the target Stunned instead of wounded (Flash Pulse,
// Stun Pistol): how many saves fail doesn't matter.
/** @param {MaybeRow} row */
export const stuns = (row) => isNonLethal(row) && causesStunned(row);

// PARA Ammunition: a failed PH-6 save leaves the target Immobilized-A (wiki,
// Paralysis (PARA) Ammunition), whether or not the row says "State: IMM-A".
/** @param {MaybeRow} row */
export const paralyses = (row) => hasAmmo(row, 'PARA');

// The State a failed save causes in place of wounds, or null. A Hacking
// Program names its own (army/hacking.js): Immobilized-B, Targeted, Possessed.
/**
 * @param {MaybeRow} row
 * @returns {string | null}
 */
export const stateCaused = (row) => (row?.hack ? row.hack.state : isolates(row) ? 'Isolated' : stuns(row) ? 'Stunned'
  : paralyses(row) ? 'Immobilized-A' : null);

// "Bioweapon (DA+SHOCK)" or null.
/**
 * @param {MaybeRow} row
 * @returns {string | null}
 */
export const bioweaponProp = (row) => (row?.props ?? []).find((p) => p.startsWith('Bioweapon (')) ?? null;

// Ammo extras that swap the weapon's Ammunition (see withAmmoExtra). "AP" is
// handled apart, as forceAP.
const AMMO_EXTRAS = ['T2', 'Shock', 'Viral'];

// Adds one loadout-level weapon extra to mods; false if it isn't one.
/**
 * @param {WeaponMods} mods
 * @param {string} e
 */
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

/**
 * Loadout-level weapon extras such as "+1B", "+1SD", "PS=6", "AP", "T2".
 * @param {string[] | null} [extra]
 * @returns {WeaponMods}
 */
export function parseWeaponMods(extra = []) {
  // psMod: MOD to the target's Saving Rolls, as a change to PS (BS Attack (SR-1)).
  /** @type {WeaponMods} */
  const mods = {burst: 0, sd: 0, ps: null, psMod: 0, forceAP: false, cont: false, sv: 0, ammo: null};
  for (const e of extra ?? []) addWeaponMod(mods, e);
  return mods;
}

// The extras parseWeaponMods doesn't read, for the pipeline's check.
/** @param {string[] | null} [extra] */
export const unreadWeaponExtras = (extra = []) =>
  (extra ?? []).filter((e) => !addWeaponMod(parseWeaponMods(), e));

// Ammunition types other than N, loadout "AP" included.
/**
 * @param {WeaponRow} row
 * @param {Pick<WeaponMods, 'forceAP'> | null} [mods]
 */
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
/**
 * @param {WeaponRow} row
 * @param {WeaponMods | null | undefined} mods
 * @returns {WeaponRow}
 */
function withAmmoExtra(row, mods) {
  if (!mods?.ammo) return row;
  if (mods.ammo === 'Viral') {
    const props = (row.props ?? []).filter((p) => !p.startsWith('Bioweapon ('));
    return {...row, name: `Viral ${row.name}`, ...(row.en ? {en: `Viral ${row.en}`} : {}), save: {attr: 'BTS'},
      props: ['Bioweapon (DA+SHOCK)', ...props]};
  }
  return {...row, ammo: [...ammoTypes(row), mods.ammo]};
}

/** @param {string | null} mode */
const modeSuffix = (mode) => (mode ? ` (${mode.replace(/ Mode$/i, '')})` : '');

// The PS the target saves against: the loadout's "PS=6" or the chart's, with
// any Saving Roll MOD (BS Attack (SR-1)).
// PARA has no PS: 0, its save is the target's PH roll (rules/matchup.js).
/**
 * @param {WeaponRow} row
 * @param {Pick<WeaponMods, 'ps' | 'psMod'> | null | undefined} mods
 */
export const weaponPS = (row, mods) => (mods?.ps ?? row.dmg ?? 0) + (mods?.psMod ?? 0);

/**
 * The entry's one-line summary, "Combi Rifle · B3 · PS13 · N": a Message
 * (i18n/message.js), rendered where it is read (tests, the ledger snapshot).
 * @param {WeaponRow} row
 * @param {WeaponMods} mods
 * @returns {import('../types.js').Message}
 */
export function weaponLabel(row, mods) {
  // Templates show their burst too (e.g. a Dog-Warrior's B2 Chain Rifle); the
  // weapon menu marks them "template" in place of the range MOD.
  const burst = (row.burst ?? 1) + mods.burst;
  const sd = mods.sd > 0 ? `+${mods.sd}SD` : '';
  // PARA: no PS, the target rolls PH-6.
  const dmg = row.save?.attr === 'PH' ? `PH${row.save.mod ?? ''}` : `PS${weaponPS(row, mods)}`;
  // As players write it: "AP+EXP", not the data's "AP+Exp" (ammoMsg).
  const ammo = ammoTypes(row, mods);
  return list([`${row.name}${modeSuffix(row.mode)}`, `B${burst}${sd}`, dmg, ammo.length ? list(ammo.map(ammoMsg), '+') : 'N'], ' · ');
}

// Weapon menu order: single-mode first, then "Hit Mode", then other modes.
/** @param {WeaponRow} row */
const modeRank = (row) => (!row.mode ? 0 : /^hit/i.test(row.mode) ? 1 : 2);

// A CC weapon's bracketed negative MOD ("PARA CC Weapon (-6)",
// "Monofilament CC Weapon (-3)") is not the user's: like every negative MOD
// on a profile it goes on the opponent's Face to Face Roll (wiki, Modifiers).
/**
 * @param {WeaponMods} mods
 * @returns {WeaponMods}
 */
function ccMods(mods) {
  return mods.sv < 0 ? {...mods, sv: 0, opponent: mods.sv} : {...mods, opponent: 0};
}

// The loadout's weapons that pass `keep`, one entry per firing mode.
/**
 * @param {import('../types.js').OptionRow | null | undefined} option
 * @param {Record<string, WeaponRow[]> | null | undefined} weapons the army's weapon rows by id
 * @param {(row: WeaponRow) => boolean} keep
 * @param {boolean} cc
 * @returns {WeaponEntry[]}
 */
function loadoutWeapons(option, weapons, keep, cc) {
  /** @type {WeaponEntry[]} */
  const out = [];
  for (const w of option?.weapons ?? []) {
    const parsed = parseWeaponMods(w.extra);
    const mods = cc ? ccMods(parsed) : parsed;
    const rows = [...(weapons?.[w.id] ?? [])].sort((a, b) => modeRank(a) - modeRank(b));
    for (const base of rows) {
      if (!keep(base)) continue;
      const row = withAmmoExtra(base, mods);
      const key = `${w.id}:${row.mode ?? ''}`;
      if (out.some((x) => x.key === key)) continue;
      /** @type {WeaponEntry['kind']} */
      const kind = cc ? 'cc' : isTemplate(row) ? 'template' : 'bs';
      out.push({key, kind, id: w.id, name: row.name, mode: row.mode, row, mods, label: weaponLabel(row, mods),
        ...(inZoneOfControl(row) && {zoc: true})});
    }
  }
  return out;
}

/**
 * BS-attack capable weapons of a loadout, one entry per firing mode.
 * @param {import('../types.js').OptionRow | null | undefined} option
 * @param {Record<string, WeaponRow[]> | null | undefined} weapons
 * @returns {WeaponEntry[]}
 */
export const bsWeapons = (option, weapons) => loadoutWeapons(option, weapons, isBsAttackWeapon, false);

/**
 * CC weapons of a loadout (CC Mode of a weapon with several), kind 'cc'.
 * @param {import('../types.js').OptionRow | null | undefined} option
 * @param {Record<string, WeaponRow[]> | null | undefined} weapons
 * @returns {WeaponEntry[]}
 */
export const ccWeapons = (option, weapons) => loadoutWeapons(option, weapons, isCcWeapon, true);
