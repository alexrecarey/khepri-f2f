// Run with: yarn test:js
// A pasted app address unfurls with what the app shows for it.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initSync, calculate as runEngine} from '../src/engine/wasm/khepri_engine.js';
import {cardFromSetup} from './setupCard.js';
import {army} from '../src/army/testArmy.mjs';

initSync({module: readFileSync(new URL('../src/engine/wasm/khepri_engine_bg.wasm', import.meta.url))});

// The Final results board (src/ui/fixtures/FinalResults.json) as its link.
const FINAL = '?mode=matchup&unitA=1651&factionA=101&groupA=1&optionA=2&weaponA=2%3A'
  + '&unitB=1803&factionB=101&groupB=1&optionB=3&weaponB=58%3ABlast+Mode&coverB=1&ftB=5&range=80';

test('a matchup link gets the card the app shows for it', () => {
  assert.deepEqual(cardFromSetup(`${FINAL}&headline=wpo`, army, runEngine), {
    k: 'wpo', nf: false, x: '24-32"',
    a: {n: '0.81', l: 'wounds / order', u: 'Squalos Mk-II', w: 'HMG', s: '', c: 'squalos-mk-ii-1-1'},
    b: {n: '0.46', l: 'wounds / order', u: 'Fennec Fusiliers', w: 'Missile L.', s: 'Cover, Fireteam 5', c: 'fennec-fusiliers-1-1'},
  });
});

test('a link without a headline (or a made-up one) shows at least one wound', () => {
  for (const q of [FINAL, `${FINAL}&headline=junk`]) {
    const card = cardFromSetup(q, army, runEngine);
    assert.ok(card);
    assert.equal(card.k, 'wound');
    assert.deepEqual([card.a.n, card.a.l, card.b.n], ['47.7%', 'at least one wound', '28.6%']);
  }
});

test('the Share button\'s headline is the one the card shows', () => {
  const card = cardFromSetup(`${FINAL}&headline=win`, army, runEngine);
  assert.ok(card);
  assert.deepEqual([card.k, card.a.n, card.a.l, card.b.n], ['win', '56.8%', 'wins face to face', '35.6%']);
});

test('a split range shows both bands', () => {
  assert.equal(cardFromSetup(`${FINAL}&rangeB=100`, army, runEngine)?.x, '24-32" / 32-40"');
});

test('anything that is not a complete matchup has no card', () => {
  assert.equal(cardFromSetup('', army, runEngine), null);
  assert.equal(cardFromSetup('?mode=basic&burstA=4', army, runEngine), null);
  assert.equal(cardFromSetup('?mode=matchup&unitA=1651&factionA=101', army, runEngine), null);
  assert.equal(cardFromSetup('?mode=matchup&unitA=999999&unitB=1', army, runEngine), null);
});
