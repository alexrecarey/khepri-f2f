// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeCard, encodeCard, numbersLine, previewDescription, previewTitle, shareText, shareUrl} from './card.js';

const side = (n, u, w, s, c) => ({n, l: 'wounds / order', u, w, s, c});
const card = {k: 'wpo', nf: false, x: '16-24"', a: side('0.81', 'Squalos Mk-II', 'HMG', 'Surprise attack', 'squalos-mk-ii-1-1'),
  b: side('0.46', 'Zhanshi Gongchéng', 'Missile L.', 'Cover, Fireteam 5', 'zhanshi-1-1')};

test('a card survives the link, accents and all', () => {
  assert.deepEqual(decodeCard(encodeCard(card)), card);
  assert.match(encodeCard(card), /^[A-Za-z0-9_-]+$/);
});

test('hand-written cards: junk is refused, long text cut, odd crest names dropped', () => {
  for (const bad of [null, '', 'not base64!', encodeCard({k: 'odds', a: card.a, b: card.b}), encodeCard({k: 'wpo', a: card.a})]) {
    assert.equal(decodeCard(bad), null);
  }
  const odd = decodeCard(encodeCard({...card, a: {...card.a, u: 'x'.repeat(500), c: '../secret'}}));
  assert.equal(odd.a.u.length, 60);
  assert.equal(odd.a.c, '');
});

test('the preview words (T1): names in the title, the numbers first', () => {
  assert.equal(previewTitle(card), 'Squalos Mk-II vs Zhanshi Gongchéng');
  assert.equal(previewDescription(card),
    '0.81 vs 0.46 wounds / order · 16-24" · HMG, Surprise attack vs Missile L., Cover, Fireteam 5');
  assert.equal(shareText(card), 'Squalos Mk-II HMG vs Zhanshi Gongchéng Missile L.: 0.81 vs 0.46 wounds / order');
});

test('each number keeps its own label when the sides differ (one is dodging)', () => {
  const a = {n: '61%', l: 'wins face to face'}, b = {n: '22%', l: 'dodges'};
  assert.equal(numbersLine({a, b}), '61% wins face to face vs 22% dodges');
});

test('a headline that fell back says so after the range', () => {
  assert.match(previewDescription({...card, nf: true}), /16-24" · Not face to face/);
});

test('a share link is the app address at /s, plus the card', () => {
  const url = new URL(shareUrl('https://x.test/?mode=matchup&unitA=10#top', card));
  assert.equal(url.pathname, '/s');
  assert.equal(url.hash, '');
  assert.equal(url.searchParams.get('unitA'), '10');
  assert.deepEqual(decodeCard(url.searchParams.get('card')), card);
});
