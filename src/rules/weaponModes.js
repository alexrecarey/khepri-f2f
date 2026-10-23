// Weapons with several fire modes (MULTI weapons, Missile Launcher, Feuerbach...):
// which mode comes first for each role, and what each mode's button says.
//
// Alex's rules (2026-10-08), written out per weapon below:
//   - burst matters more than ammo; active only weighs the higher-burst modes,
//     reactive (an ARO is one die anyway) goes by ammo after burst;
//   - an Impact Template ("Blast") mode comes before Hit;
//   - DA wins over AP, AP over Shock;
//   - Boarding Pistol always defaults to its Direct Template.
// A weapon not listed falls back to the default-weapon keys (defaultWeapon.js).
import {ammoMsg, isImpactTemplate} from '../army/weapons.js';
import {list, term} from '../i18n/message.js';

// 'Anti-materiel Mode', 'Anti-Material Mode', 'Antimaterial Mode' -> 'am';
// otherwise the mode's first word: 'ap', 'shock', 'blast', 'hit', 'burst'...
export const modeKey = (mode) => (/^anti-?mat/i.test(mode ?? '') ? 'am' : (mode ?? '').split(' ')[0].toLowerCase());

// Low-burst anti-materiel mode: reactive's first choice, active's last.
const MULTI = {active: ['ap', 'shock', 'am'], reactive: ['am', 'ap', 'shock']};
const BLAST_FIRST = {active: ['blast', 'hit'], reactive: ['blast', 'hit']};

// Army weapon id -> mode order per role, best first.
export const MODE_ORDER = {
  4: MULTI,                                        // MULTI Heavy Machine Gun (AM is EXP B1, AP / Shock B4)
  15: MULTI,                                       // Hyper-Rapid Magnetic Cannon
  30: {active: ['burst', 'explosive'], reactive: ['explosive', 'burst']}, // Feuerbach: AP+DA B2 / EXP B1
  36: {active: ['am', 'ap', 'shock'], reactive: ['am', 'ap', 'shock']},   // MULTI Sniper Rifle: all B2, DA first
  40: BLAST_FIRST,                                 // Plasma Rifle
  41: MULTI,                                       // MULTI Rifle
  58: BLAST_FIRST,                                 // Missile Launcher
  75: BLAST_FIRST,                                 // Uragan MRL
  82: BLAST_FIRST,                                 // Flammenspeer (Blast N before Hit AP: the template wins)
  88: BLAST_FIRST,                                 // Light Rocket Launcher
  89: BLAST_FIRST,                                 // Heavy Rocket Launcher
  111: BLAST_FIRST,                                // Plasma Carbine
  113: BLAST_FIRST,                                // Plasma Sniper Rifle
  169: MULTI,                                      // MULTI Marksman Rifle
  189: MULTI,                                      // MULTI Pistol
  210: MULTI,                                      // MULTI Red Fury
  212: BLAST_FIRST,                                // Boarding Pistol: Direct Template first, always
  217: MULTI,                                      // Spitfire MULTI
};

// One weapon's modes (bsWeapons entries sharing an id), best first for role;
// `fallback` sorts a weapon that isn't in the table.
export function orderModes(modes, role, fallback) {
  const order = MODE_ORDER[modes[0]?.id]?.[role];
  if (!order) return fallback ? fallback(modes, role) : modes;
  const rank = (w) => {
    const i = order.indexOf(modeKey(w.mode));
    return i === -1 ? order.length : i;
  };
  return [...modes].sort((a, b) => rank(a) - rank(b));
}

// The mode's ammo as the chart writes it: 'AP+DA'. Told apart in English:
// two modes whose ammo reads the same read the same in any language.
const ammoKey = (w) => (w.row.ammo ?? ['N']).map((a) => a.toUpperCase()).join('+');
const ammoLabel = (w) => list((w.row.ammo ?? ['N']).map(ammoMsg), '+');
// "Hit Mode" -> "Hit", "Modo Impacto" -> "Impacto": the mode in the player's
// language (the army's own translation), without the word for mode.
const modeWord = (w) => ({...term('modes', w.mode ?? '', w.id), strip: / Mode$|^Modo /i});

// What each mode's button says: its ammo (DA, EXP, AP, Shock, AP+DA), so a
// MULTI weapon reads [MULTI Rifle | AP | Shock | DA]. Where a mode is a
// template the ammo doesn't tell them apart, so Hit / Blast stays; so does
// the mode name if two modes would read the same, or one is a CC Mode.
// Each label is a message descriptor (i18n/message.js).
export function modeLabels(modes) {
  // A CC Mode next to a BS one (Vorpal, Kobra Pistol): "BS" / "CC" says
  // more than the ammo.
  const template = modes.some((w) => w.kind === 'template' || isImpactTemplate(w.row) || w.kind === 'cc');
  const keys = modes.map(ammoKey);
  const clash = new Set(keys).size < keys.length;
  return new Map(modes.map((w) => [w.key, template || clash ? modeWord(w) : ammoLabel(w)]));
}
