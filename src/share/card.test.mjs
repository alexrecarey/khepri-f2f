// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeCard, encodeCard, numbersLine, previewDescription, previewTitle} from './card.js';

const side = (n, u, w, s, c) => ({n, l: 'wounds / order', u, w, s, c});
/** @type {import('./card.js').Card} */
const card = {k: 'wpo', nf: false, x: '16-24"', a: side('0.81', 'Squalos Mk-II', 'HMG', 'Surprise attack', 'squalos-mk-ii-1-1'),
  b: side('0.46', 'Zhanshi Gongchéng', 'Missile L.', 'Cover, Fireteam 5', 'zhanshi-1-1')};

test('a card survives the link, accents and all', () => {
  assert.deepEqual(decodeCard(encodeCard(card)), card);
  assert.match(encodeCard(card), /^[A-Za-z0-9_-]+$/);
});

test('hand-written cards: junk is refused, long text cut, odd crest names dropped', () => {
  // Deliberately malformed cards, as a hand-written link could carry.
  const junk = (/** @type {unknown} */ x) => encodeCard(/** @type {import('./card.js').Card} */ (x));
  for (const bad of [null, '', 'not base64!', junk({k: 'odds', a: card.a, b: card.b}), junk({k: 'wpo', a: card.a})]) {
    assert.equal(decodeCard(bad), null);
  }
  const odd = decodeCard(encodeCard({...card, a: {...card.a, u: 'x'.repeat(500), c: '../secret'}}));
  assert.ok(odd);
  assert.equal(odd.a.u.length, 60);
  assert.equal(odd.a.c, '');
});

test('the preview words (T1): names in the title, the numbers first', () => {
  assert.equal(previewTitle(card), 'Squalos Mk-II vs Zhanshi Gongchéng');
  assert.equal(previewDescription(card),
    '0.81 vs 0.46 wounds / order · 16-24" · HMG, Surprise attack vs Missile L., Cover, Fireteam 5');
});

test('each number keeps its own label when the sides differ (one is dodging)', () => {
  const a = {n: '61%', l: 'wins face to face'}, b = {n: '22%', l: 'dodges'};
  assert.equal(numbersLine({a, b}), '61% wins face to face vs 22% dodges');
});

test('a headline that fell back says so after the range', () => {
  assert.match(previewDescription({...card, nf: true}), /16-24" · Not face to face/);
});

test('hand-written cards, field by field: a side needs its number and unit, the kind must be known', () => {
  const junk = (/** @type {unknown} */ x) => decodeCard(encodeCard(/** @type {import('./card.js').Card} */ (x)));
  // Wrong types fall back to '', an unknown nf to false; what remains is a card.
  assert.deepEqual(junk({k: 'win', nf: 'yes', x: 7, a: {...card.a, l: 3, w: null, s: ['x'], c: 9}, b: card.b, extra: 1}),
    {k: 'win', nf: false, x: '', a: {...card.a, l: '', w: '', s: '', c: ''}, b: card.b});
  // No number or no unit: no card.
  assert.equal(junk({...card, a: {...card.a, n: ''}}), null);
  assert.equal(junk({...card, b: {...card.b, u: 7}}), null);
  assert.equal(junk({...card, a: 'side'}), null);
  assert.equal(junk({...card, k: 'WPO'}), null);
  assert.equal(junk([card]), null);
  assert.equal(decodeCard('x'.repeat(2001)), null);
});
