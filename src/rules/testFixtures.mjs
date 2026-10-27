// Fixtures the rules tests share (rules, hacking, closeCombat, ledger,
// sapper...). Each test file used to carry its own copy of these and they
// drifted; the fields a fixture sets are the minimum the rules read, standing
// for whole rows and troopers. Not a test file itself: `node --test` skips it.
import assert from 'node:assert/strict';
import {normalizeWeaponRow} from '../army/normalize.js';
import {SIDES, other} from '../lib/side.js';
import {buildLedger, renderDerived} from './ledger.js';
import {deriveInputs as deriveRaw} from './matchup.js';

/** @typedef {import('../types.js').WeaponRow} WeaponRow */
/** @typedef {import('../types.js').ProfileRow} ProfileRow */
/** @typedef {import('../types.js').OptionRow} OptionRow */
/** @typedef {import('../types.js').TraitRef} TraitRef */
/** @typedef {import('../types.js').Line} Line */
/** @typedef {import('../types.js').Ledger} Ledger */
/** @typedef {import('../types.js').RenderedDerived} RenderedDerived */
/** @typedef {Parameters<typeof deriveRaw>[0]} DeriveArgs */

/**
 * Weapon rows as the Army API gives them, normalized like the pipeline does,
 * keyed by weapon id (the columns the rules read, so they stand for army.json rows).
 * @param {Record<string, Parameters<typeof normalizeWeaponRow>[0][]>} t
 * @returns {Record<string, WeaponRow[]>}
 */
export const weaponTable = (t) => /** @type {Record<string, WeaponRow[]>} */ (Object.fromEntries(Object.entries(t).map(([id, rows]) => [id, rows.map(normalizeWeaponRow)])));

/**
 * A profile row; `over` sets what the case is about.
 * @param {Partial<ProfileRow>} [over]
 * @returns {ProfileRow}
 */
export const profile = (over = {}) => /** @type {ProfileRow} */ ({id: 1, name: 'P', bs: 12, ph: 12, arm: 2, bts: 3, w: 1, skills: [], equip: [], ...over});

/**
 * A loadout row carrying `weapons`.
 * @param {TraitRef[]} weapons
 * @param {Partial<OptionRow>} [over]
 * @returns {OptionRow}
 */
export const option = (weapons, over = {}) => /** @type {OptionRow} */ ({id: 1, name: 'O', points: 10, swc: '0', weapons, skills: [], equip: [], ...over});

// The rules word their notes and lines as message descriptors; the tests
// read them in English (ledger.js renders them).
/** @param {DeriveArgs} o */
export const deriveInputs = (o) => renderDerived(deriveRaw(o));

/**
 * What a section's live lines (not struck, a number) add up to.
 * @param {Line[]} lines
 */
export const addUp = (lines) => lines.filter((x) => x.value !== null && !x.struck).reduce((n, x) => n + /** @type {number} */ (x.value), 0);

/**
 * deriveInputs, plus a check that "How the dice were built" (ledger.js) adds
 * up to every number it produced: each rule case is also a ledger case, so a
 * struck or display-only line that should count (or the reverse) fails here.
 * Returns the derivation with its ledger. No ledger without inputs: a test
 * reading one fails on its inputs first.
 * @param {DeriveArgs} args
 * @returns {RenderedDerived & {ledger: Ledger}}
 */
export function derive(args) {
  const r = deriveInputs(args);
  if (!r.ok) return /** @type {RenderedDerived & {ledger: Ledger}} */ (r);
  const ledger = buildLedger({...args, derived: r});
  for (const s of SIDES) {
    const l = ledger[s];
    if (!l || l.kind === 'none') continue;
    const t = other(s);
    /** @type {Record<string, number | undefined>} */
    const expect = {sv: r.inputs[`successValue${s}`], burst: r.inputs[`burst${s}`], sd: r.inputs[`bonusBurst${s}`] ?? 0};
    // No target, no Saving Roll to explain (the app only builds a ledger for both sides).
    if (r.inputs[`arm${t}`] !== undefined) expect.save = /** @type {number} */ (r.inputs[`damage${s}`]) + /** @type {number} */ (r.inputs[`arm${t}`]);
    for (const [k, total] of Object.entries(expect)) {
      // k names a section of the side (sv, burst, sd, save).
      /** @type {import('../types.js').Section | undefined} */
      const sec = l[/** @type {'sv' | 'burst' | 'sd' | 'save'} */ (k)];
      if (!sec) continue;
      /** @type {string} */
      const where = `ledger ${s} ${k}: ${JSON.stringify(sec.lines)}`;
      assert.equal(sec.total, total, where);
      // Out of range: Success Value 0 under a '—' mark, not the lines' sum.
      if (!sec.lines.some((x) => x.text === '—')) assert.equal(addUp(sec.lines), total, where);
    }
  }
  return {...r, ledger};
}
