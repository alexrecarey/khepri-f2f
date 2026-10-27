// Escape closes the open overlay: a sheet, a page, a dialog, the range
// selector, the results sheet. One listener on the window while `active`;
// the handler is read through a ref, so a new closure each render doesn't
// re-subscribe.
import {useEffect, useLayoutEffect, useRef} from 'react';

/**
 * @param {() => void} onClose
 * @param {boolean} [active]
 */
export default function useEscape(onClose, active = true) {
  const live = useRef(onClose);
  useLayoutEffect(() => { live.current = onClose; });
  useEffect(() => {
    if (!active) return undefined;
    /** @param {KeyboardEvent} e */
    const onKey = (e) => { if (e.key === 'Escape') live.current(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);
}
