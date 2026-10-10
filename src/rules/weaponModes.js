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
import {ammoName, isImpactTemplate, isTemplate} from '../army/weapons.js';

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

const ammoLabel = (w) => (w.row.ammo ?? ['N']).map(ammoName).join('+');
const modeWord = (w) => (w.mode ?? '').replace(/ Mode$/i, '');

// What each mode's button says: its ammo (DA, EXP, AP, Shock, AP+DA), so a
// MULTI weapon reads [MULTI Rifle | AP | Shock | DA]. Where a mode is a
// template the ammo doesn't tell them apart, so Hit / Blast stays; so does
// the mode name if two modes would read the same.
export function modeLabels(modes) {
  const template = modes.some((w) => isTemplate(w.row) || isImpactTemplate(w.row));
  const ammo = modes.map(ammoLabel);
  const clash = new Set(ammo).size < ammo.length;
  return new Map(modes.map((w, i) => [w.key, template || clash ? modeWord(w) : ammo[i]]));
}
