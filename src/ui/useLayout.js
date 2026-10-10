// Which layout the viewport gets. Derived from the window width, never
// stored: the same state document renders on every screen size.
//   phone      < 768   one column, results card + sheet
//   tablet     768+    sides next to each other, results and mods below
//   landscape  1100+   setup column | results with the mods under them
//   desktop    1400+   setup | results | mods
//   wide       1800+   setup | results | both mods cards side by side
import {useSyncExternalStore} from 'react';

const STEPS = [[1800, 'wide'], [1400, 'desktop'], [1100, 'landscape'], [768, 'tablet']];

export const layoutFor = (width) => STEPS.find(([min]) => width >= min)?.[1] ?? 'phone';

const subscribe = (cb) => {
  window.addEventListener('resize', cb);
  return () => window.removeEventListener('resize', cb);
};

export default function useLayout() {
  return useSyncExternalStore(subscribe, () => layoutFor(window.innerWidth), () => 'phone');
}
