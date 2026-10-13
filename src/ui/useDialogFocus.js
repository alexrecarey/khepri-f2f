// Dialogs (pages, sheets, the desk picker, the open results sheet) take the
// focus when they open and give it back when they close, so keyboard and
// screen-reader users land inside them and return where they were.
import {useEffect, useRef} from 'react';

const FOCUSABLE = 'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

// The last two elements that had the focus. By the time a dialog's effect
// runs, its opener has often lost it already (on phones the page hides the
// screen behind; the results card stops being focusable as it opens), and
// the dialog's own search box may have taken it.
let last = null;
let before = null;
if (typeof document !== 'undefined') {
  document.addEventListener('focusin', (e) => {
    if (e.target === last) return;
    before = last;
    last = e.target;
  });
}

const usable = (x, el) => x instanceof HTMLElement && x !== document.body && x.isConnected && !el.contains(x);

// returnTo (optional): what gets the focus back on close, when it isn't the
// element that opened the dialog (the results card's top, inside the sheet).
export default function useDialogFocus(ref, active = true, returnTo = null) {
  // Kept across React's development double run of effects (mount, cleanup,
  // mount): the second run would find the focus already inside.
  const opener = useRef(null);
  const open = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return undefined;
    open.current = true;
    opener.current ??= [document.activeElement, last, before].find((x) => usable(x, el)) ?? null;
    // Something inside already has it (the picker focuses its search box).
    if (!el.contains(document.activeElement)) el.querySelector(FOCUSABLE)?.focus({preventScroll: true});
    return () => {
      open.current = false;
      // After the other cleanups (the page unhides the screen behind), once
      // it's really closed, and only if the focus is still in the dialog or
      // lost with it: never pull it from somewhere the user moved it.
      setTimeout(() => {
        if (open.current) return;
        const now = document.activeElement;
        const target = returnTo?.() ?? opener.current;
        opener.current = null;
        if (now && now !== document.body && !el.contains(now)) return;
        if (target?.isConnected) target.focus({preventScroll: true});
      }, 0);
    };
  }, [ref, active]); // eslint-disable-line react-hooks/exhaustive-deps
}
