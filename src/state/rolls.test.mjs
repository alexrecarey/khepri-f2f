// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {matchupView} from './matchupView.js';
import {matchupRollSummary, rollRow} from './rolls.js';
import {EMPTY_SIDE} from './schema.js';

const army = JSON.parse(readFileSync(new URL('../army/army.json', import.meta.url), 'utf8'));
// Share-link ids: Corax-1 (Viral, Combined Army sectorial 603) and Chaksa (Tohaa).
const corax = {...EMPTY_SIDE, unitId: 1934, factionId: 603, groupId: 1, optionId: 4};
const chaksa = {...EMPTY_SIDE, unitId: 1310, factionId: 801, groupId: 1, optionId: 1, inCover: true};

test('a Matchup roll keeps each side\'s unit, weapon, crest and vanilla faction for its crest row', () => {
  const v = matchupView(army, {A: corax, B: chaksa, rangeCm: 40});
  const s = matchupRollSummary(v, null);
  assert.equal(s.a, `${s.au} · ${s.aw}`);
  assert.match(s.ca, /^[a-z0-9-]+$/);
  assert.match(s.cr, /^[a-z0-9-]+$/);
  assert.equal(s.fa, 601);   // the sectorial's vanilla army
  assert.equal(s.fr, 801);
  assert.match(s.setup, /Cover/);
});

test('rolls saved before the crests still make a row, from "Unit · Weapon"', () => {
  const r = rollRow({a: 'Squalos · HMG', r: 'Fennec · ML', setup: '24-32"'});
  assert.deepEqual([r.au, r.aw, r.ru, r.rw, r.ca, r.fr], ['Squalos', 'HMG', 'Fennec', 'ML', null, null]);
});
