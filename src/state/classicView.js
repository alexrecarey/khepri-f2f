// The classic calculator's rules: what each side's inputs show, and the save
// it forces as one number. Pure; used by the reducer, the URL and the screen.
import {LIMITS} from '../engine/params.js';
import {other} from './schema.js';

const clamp = ([min, max], n) => Math.min(max, Math.max(min, n));

// Ammunition buttons, in order: [calculator ammo, label].
export const CLASSIC_AMMO = [['N', 'N'], ['DA', 'DA'], ['EXP', 'EXP'], ['T2', 'T2'], ['PLASMA', 'PLASMA'], ['DODGE', 'Dodge']];

// The highest Opponent PS the steppers reach: weapon PS + ARM (or BTS) limits.
export const SAVE_LIMIT = {arm: [0, LIMITS.damage[1] + LIMITS.arm[1]], bts: [0, LIMITS.damage[1] + LIMITS.bts[1]]};

// The save the opponent makes against side s: weapon PS + their ARM (cover
// included), and + their BTS for Plasma's second save.
export const armSave = (c, s) => c[`damage${s}`] + c[`arm${other(s)}`];
export const btsSave = (c, s) => c[`damage${s}`] + c[`bts${other(s)}`];

// Which of side s's inputs mean anything: burst 0 rolls nothing; a Direct
// Template hits automatically (no roll, so no Success Value); a Dodge causes
// no saves.
export function classicSide(c, s) {
  const burst = c[`burst${s}`];
  return {
    rollsDice: burst !== 0 && !c[`template${s}`],
    causesSaves: burst !== 0 && c[`ammo${s}`] !== 'DODGE',
    plasma: c[`ammo${s}`] === 'PLASMA',
  };
}

// Classic: the save the opponent makes against side s, as one number (the
// engine only reads PS + ARM and PS + BTS). Moves the weapon PS first and
// spills into the target's ARM past its limits; a Plasma BTS total below the
// PS lowers the PS and gives the difference to ARM, so the ARM total holds.
export function classicSave(c, s, which, total) {
  const t = other(s);
  const dmg = c[`damage${s}`];
  if (which === 'arm') {
    const armT = c[`arm${t}`];
    const want = clamp(SAVE_LIMIT.arm, total);
    const damage = clamp(LIMITS.damage, want - armT);
    return {...c, [`damage${s}`]: damage, [`arm${t}`]: clamp(LIMITS.arm, want - damage)};
  }
  const want = clamp(SAVE_LIMIT.bts, total);
  if (want >= dmg) return {...c, [`bts${t}`]: clamp(LIMITS.bts, want - dmg)};
  return {...c, [`damage${s}`]: want, [`arm${t}`]: clamp(LIMITS.arm, c[`arm${t}`] + dmg - want), [`bts${t}`]: 0};
}
