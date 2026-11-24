// Run with: yarn test:js
// Every pairing of choices is one of three shapes: a Face to Face Roll, two
// rolls each on its own (not face to face), or one side's roll alone (a
// Direct Template's automatic hits, or the other side rolls nothing).
import test from 'node:test';
import assert from 'node:assert/strict';
import {matchupView} from './matchupView.js';
import {EMPTY_SIDE} from './schema.js';
import {army} from '../army/testArmy.mjs';
import {isUnopposed} from '../engine/calculate.js';

// 112 Motorized: Light Shotgun, Smoke Grenades, Boarding Pistol (Blast Mode:
// a Direct Template), CC Weapon. Acontecimento Regular hacker: programs, Reset.
const s112 = {...EMPTY_SIDE, unitId: 1284, factionId: 301, groupId: 1, optionId: 4761};
const hacker = {...EMPTY_SIDE, unitId: 21, factionId: 102, groupId: 1, optionId: 5};
const PICK = {bs: [s112, '28:'], smoke: [s112, '45:'], template: [s112, '212:Blast Mode'], cc: [s112, '5:'],
  dodge: [s112, 'dodge'], reset: [hacker, 'reset'], program: [hacker, 'hack:carbonite'], none: [s112, 'none'],
  // Programs only reach a hacker: the hacker's own Combi Rifle and Dodge.
  hackerBs: [hacker, '33:'], hackerDodge: [hacker, 'dodge']};

/** @param {string} a @param {string} b */
function shape(a, b) {
  const [ua, ka] = PICK[a];
  const [ub, kb] = PICK[b];
  const p = /** @type {import('../types.js').Params} */ (matchupView(army, {A: {...ua, weaponKey: ka}, B: {...ub, weaponKey: kb}, rangeCm: 20}).params);
  const acts = (s) => p[`template${s}`] || p[`burst${s}`] > 0;
  if (isUnopposed(p)) return 'own';
  if (acts('A') && acts('B')) return p.templateA || p.templateB ? 'alone' : 'f2f';
  return acts('A') || acts('B') ? 'alone' : 'nothing';
}

// [active, reactive, shape]. 'own': each rolls on its own; 'alone': one roll.
const TABLE = [
  ['bs', 'bs', 'f2f'], ['bs', 'cc', 'f2f'], ['bs', 'dodge', 'f2f'], ['bs', 'smoke', 'f2f'], ['smoke', 'smoke', 'f2f'],
  ['program', 'reset', 'f2f'], ['reset', 'program', 'f2f'], ['program', 'program', 'f2f'], ['program', 'hackerBs', 'f2f'],
  ['bs', 'template', 'own'], ['template', 'template', 'own'], ['template', 'cc', 'own'],
  ['smoke', 'cc', 'own'], ['smoke', 'dodge', 'own'], ['dodge', 'smoke', 'own'], ['smoke', 'reset', 'own'], ['reset', 'smoke', 'own'],
  ['dodge', 'dodge', 'own'], ['dodge', 'reset', 'own'], ['reset', 'dodge', 'own'],
  ['template', 'dodge', 'alone'], ['dodge', 'template', 'alone'], ['template', 'reset', 'alone'],
  ['bs', 'reset', 'alone'], ['reset', 'bs', 'alone'], ['cc', 'reset', 'alone'], ['program', 'hackerDodge', 'alone'],
  ['bs', 'none', 'alone'], ['smoke', 'none', 'alone'], ['template', 'none', 'alone'], ['dodge', 'none', 'alone'], ['reset', 'none', 'alone'],
];

test('every pairing is a Face to Face Roll, two rolls each on its own, or one roll alone', () => {
  const got = TABLE.map(([a, b]) => [a, b, shape(a, b)]);
  assert.deepEqual(got, TABLE);
});
