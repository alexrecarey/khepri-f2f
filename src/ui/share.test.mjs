// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {shareHref} from './share.js';

const HREF = 'https://x.test/?mode=matchup&unitA=10#top';

test('the Share link carries the headline the sender sees', () => {
  assert.equal(new URL(shareHref(HREF, 'wpo')).searchParams.get('headline'), 'wpo');
  assert.equal(new URL(shareHref(HREF, 'win')).searchParams.get('headline'), 'win');
});

test('the links\' default headline stays out of the link', () => {
  assert.equal(shareHref(HREF, 'wound'), HREF);
});
