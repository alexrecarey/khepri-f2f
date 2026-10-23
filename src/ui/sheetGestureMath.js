// The maths of the phone results sheet's gestures (useSheetGestures.js),
// apart from the DOM and the effects so it can be tested: the thresholds,
// the pointer tracker, and what a drag's numbers mean.

export const SLOP = 8;          // px before a press becomes a drag
export const FLICK = 0.4;       // px/ms that counts as a flick
export const SETTLE_MS = 330;   // the spring in app.css
export const SWIPE_X = 32;      // px sideways that change the headline
export const DRAG_CLICK_MS = 350; // a click this soon after a drag is the drag's own, not a tap

// Velocity over the last moves, in px/ms (positive = down).
export function tracker() {
  const pts = [];
  return {
    add(y, t) { pts.push([y, t]); if (pts.length > 5) pts.shift(); },
    velocity() {
      if (pts.length < 2) return 0;
      const [[y0, t0], [y1, t1]] = [pts[0], pts.at(-1)];
      return t1 > t0 ? (y1 - y0) / (t1 - t0) : 0;
    },
  };
}

// How far down the sheet rests when closed: its height minus the part that
// shows (the top, measured at --open 0, plus the padding under it).
export const restingY = (sheetHeight, topBottom, paddingBottom) => Math.max(0, sheetHeight - (topBottom + paddingBottom));

// --open for a sheet y px down (0 = open, restY = resting low); 1 while
// the resting position is unknown.
export const openFraction = (y, restY) => (restY ? Math.max(0, Math.min(1, 1 - y / restY)) : 1);

// Mostly sideways before it became a drag: the headline's, never the sheet's.
export const isSideways = (dx, dy) => Math.abs(dx) > SLOP && Math.abs(dx) > Math.abs(dy);

// Past SWIPE_X the headline changes: +1 for right to left, -1 for left to
// right; 0 before that.
export const swipeDirection = (dx) => (Math.abs(dx) >= SWIPE_X ? (dx < 0 ? 1 : -1) : 0);

// Where the sheet goes for a finger dy px from where the drag started at
// `from`: the slop is taken off so it doesn't jump when the drag begins, and
// it stays between open and resting low.
export const dragY = (from, dy, restY) => Math.max(0, Math.min(restY, from + dy - Math.sign(dy) * SLOP));

// Let go at y with velocity v: open when flicked up, or when not flicked
// down and nearer open than resting low.
export const settlesOpen = (v, y, restY) => v < -FLICK || (v <= FLICK && y < restY / 2);
