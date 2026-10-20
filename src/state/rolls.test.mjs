// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {matchupView} from './matchupView.js';
import {matchupRollSummary, matchupShareCard, rollRow} from './rolls.js';
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

test('the share card puts each side\'s own situation under it, with the headline the sender sees', () => {
  const v = matchupView(army, {A: {...corax, surpriseAttack: true}, B: chaksa, rangeCm: 40});
  const h = {kind: 'win', fallback: false, text: {active: '61%', reactive: '22%'}, label: {active: 'wins face to face', reactive: 'dodges'}};
  const card = matchupShareCard(v, h);
  assert.equal(card.k, 'win');
  assert.deepEqual([card.a.n, card.a.l, card.b.n, card.b.l], ['61%', 'wins face to face', '22%', 'dodges']);
  assert.equal(card.a.s, 'Surprise attack');
  assert.equal(card.b.s, 'Cover');
  assert.equal(card.x, matchupRollSummary(v, null).setup.split(' · ')[0]);
  assert.match(card.a.c, /^[a-z0-9-]+$/);
});

test('Smoke is part of the saved setup line and the share card', () => {
  const v = matchupView(army, {A: corax, B: chaksa, rangeCm: 40, smoke: true});
  assert.match(matchupRollSummary(v, null).setup, /Smoke/);
  const h = {kind: 'wpo', fallback: false, text: {active: '1', reactive: '2'}, label: {active: 'a', reactive: 'r'}};
  assert.match(matchupShareCard(v, h).x, / · Smoke$/);
});

test('Team-Ops picks go in the saved line and on the share card', () => {
  const v = matchupView(army, {A: {...corax, upgrade: 1, ball: 1}, B: chaksa, rangeCm: 40});
  const pick = `Team-Ops: ${v.A.teamOps.chart[1]}, TacBall: ${v.A.teamOps.ball[1]}`;
  const {setup} = matchupRollSummary(v, null);
  assert.ok(setup.includes(pick.replace(', ', ' · ')), setup);
  const h = {kind: 'win', fallback: false, text: {active: '', reactive: ''}, label: {active: '', reactive: ''}};
  assert.equal(matchupShareCard(v, h).a.s, pick);
});
