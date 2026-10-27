// Which layout the viewport gets. Derived from the window width, never
// stored: the same state document renders on every screen size.
//   phone      < 768   one column, results card + sheet
//   tablet     768+    sides next to each other, results and mods below
//   landscape  1100+   setup column | results with the mods under them
//   desktop    1400+   setup | results | mods
//   wide       1800+   setup | results | both mods cards side by side
import {useSyncExternalStore} from 'react';

/** @typedef {import('../types.js').Layout} Layout */

/** @type {[number, Layout][]} */
const STEPS = [[1800, 'wide'], [1400, 'desktop'], [1100, 'landscape'], [768, 'tablet']];

/**
 * @param {number} width
 * @returns {Layout}
 */
const layoutFor = (width) => STEPS.find(([min]) => width >= min)?.[1] ?? 'phone';

// From landscape tablets up the menu pages and the picker are dialogs over
// the workbench, reached from header buttons; below, full-screen pages.
/** @param {Layout} layout */
export const usesDialogs = (layout) => layout === 'landscape' || layout === 'desktop' || layout === 'wide';

/** @param {() => void} cb */
const subscribe = (cb) => {
  window.addEventListener('resize', cb);
  return () => window.removeEventListener('resize', cb);
};

/** @returns {Layout} */
export default function useLayout() {
  return useSyncExternalStore(subscribe, () => layoutFor(window.innerWidth), () => /** @type {Layout} */ ('phone'));
}
