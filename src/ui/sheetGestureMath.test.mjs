import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DRAG_CLICK_MS, FLICK, SETTLE_MS, SLOP, SWIPE_X, dragY, isSideways, openFraction, restingY, settlesOpen, swipeDirection, tracker,
} from './sheetGestureMath.js';

test('sheet gestures: the thresholds are what the hook and app.css agree on', () => {
  assert.deepEqual([SLOP, FLICK, SETTLE_MS, SWIPE_X, DRAG_CLICK_MS], [8, 0.4, 330, 32, 350]);
});

test('sheet gestures: tracker measures the velocity over the last five points', () => {
  const t = tracker();
  assert.equal(t.velocity(), 0);
  t.add(100, 0);
  assert.equal(t.velocity(), 0);
  t.add(50, 100);
  assert.equal(t.velocity(), -0.5);
  // Only the last five count: the first point (100 at 0) drops out.
  for (const [y, ts] of [[40, 110], [30, 120], [20, 130], [10, 140]]) t.add(y, ts);
  assert.equal(t.velocity(), -1);
  // Two points at the same time are not a velocity.
  const same = tracker();
  same.add(0, 5); same.add(10, 5);
  assert.equal(same.velocity(), 0);
});

test('sheet gestures: resting position and --open', () => {
  assert.equal(restingY(600, 150, 12), 438);
  assert.equal(restingY(100, 150, 12), 0);
  assert.equal(openFraction(0, 400), 1);
  assert.equal(openFraction(400, 400), 0);
  assert.equal(openFraction(100, 400), 0.75);
  assert.equal(openFraction(-20, 400), 1);
  assert.equal(openFraction(900, 400), 0);
  // Not measured yet: open.
  assert.equal(openFraction(100, 0), 1);
});

test('sheet gestures: sideways swipes are the headline\'s', () => {
  assert.equal(isSideways(SLOP + 1, 0), true);
  assert.equal(isSideways(SLOP, 0), false);
  assert.equal(isSideways(20, 20), false);
  assert.equal(isSideways(-20, 10), true);
  assert.equal(swipeDirection(-SWIPE_X), 1);
  assert.equal(swipeDirection(SWIPE_X), -1);
  assert.equal(swipeDirection(SWIPE_X - 1), 0);
});

test('sheet gestures: a drag takes the slop off and stays between open and resting', () => {
  assert.equal(dragY(400, -100, 400), 400 - 100 + SLOP);
  assert.equal(dragY(0, 100, 400), 100 - SLOP);
  assert.equal(dragY(0, 900, 400), 400);
  assert.equal(dragY(400, -900, 400), 0);
});

test('sheet gestures: letting go springs to the flick\'s way, else the nearer position', () => {
  assert.equal(settlesOpen(-FLICK - 0.1, 390, 400), true);   // flicked up from nearly closed
  assert.equal(settlesOpen(FLICK + 0.1, 10, 400), false);    // flicked down from nearly open
  assert.equal(settlesOpen(0, 199, 400), true);
  assert.equal(settlesOpen(0, 200, 400), false);
  assert.equal(settlesOpen(FLICK, 199, 400), true);          // exactly FLICK is not a flick
});
