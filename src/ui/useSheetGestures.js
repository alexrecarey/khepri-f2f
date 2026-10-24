// The phone results sheet is one element with two resting positions: low,
// with only its top showing (the results card), and open. Dragging moves it
// between them with the finger; letting go springs to the nearer one (or the
// way it was flicked). Taps still open it (the top) and close it (outside).
//
// --open runs 0 (resting low) to 1 (open). CSS grows the numbers and bars
// from it (app.css .rsheet), and transitions it on taps; while dragging it is
// written straight to the element each move, not through React state. Whether
// the sheet is open stays in the state document (ui.overlay): onOpen /
// onClose run once a drag has settled, so Back and history work as before.
// A sideways swipe on the top is not the sheet's: it calls onSwipeX(+1 for
// right to left, -1 for left to right) to change the headline number.
// The numbers (thresholds, velocity, where a drag puts the sheet) are in
// sheetGestureMath.js; this file is the DOM and the effects.
import {useCallback, useEffect, useLayoutEffect, useRef} from 'react';
import {
  DRAG_CLICK_MS, SETTLE_MS, SLOP, dragY, isSideways, openFraction, restingY, settlesOpen, swipeDirection, tracker,
} from './sheetGestureMath.js';

// measureKey: changes when the top's content may change size (new numbers,
// status); only then is the resting position measured again.
/** A drag in progress: where it started, what it moves and whether it has become one.
 * @typedef {{x0: number, y0: number, from: number, open: boolean, armed: boolean, moved: boolean, onTop: boolean,
 *   track: ReturnType<typeof tracker>, sideways?: boolean, y?: number}} Drag */

/**
 * @param {{open: boolean, canOpen: boolean, onOpen: () => void, onClose: () => void, onSwipeX: ((dir: 1 | -1) => void) | null, measureKey: string}} props
 */
export default function useSheetGestures({open, canOpen, onOpen, onClose, onSwipeX, measureKey}) {
  const sheetRef = useRef(/** @type {HTMLElement | null} */ (null));
  const scrimRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const live = useRef({open, canOpen, onOpen, onClose, onSwipeX});
  live.current = {open, canOpen, onOpen, onClose, onSwipeX};
  // When a drag ended: a click right after it is the drag's own, not a tap.
  const dragEnded = useRef(0);
  // The settle timers: cleared on unmount (a layout change can remove the
  // sheet mid-spring), and no new drag starts until they have run.
  const timers = useRef(/** @type {ReturnType<typeof setTimeout>[]} */ ([]));

  // How far down the sheet rests when closed: its height minus the part that
  // shows (the top, measured at --open 0). Kept in --rest-y for the CSS.
  const restY = useRef(0);
  const measure = useCallback(() => {
    const s = sheetRef.current;
    const top = /** @type {HTMLElement | null | undefined} */ (s?.querySelector('.rs-top'));
    // Not mid-drag or mid-settle: that would undo the sheet's live position.
    if (!s || !top || s.style.transform) return;
    s.classList.add('measuring');
    s.style.setProperty('--open', '0');
    restY.current = restingY(s.offsetHeight, top.offsetTop + top.offsetHeight, parseFloat(getComputedStyle(s).paddingBottom));
    s.style.removeProperty('--open');
    void s.offsetHeight; // apply the real --open with transitions still off
    s.classList.remove('measuring');
    s.style.setProperty('--rest-y', `${restY.current}px`);
  }, []);

  // y: how far down the sheet is (0 = open, restY = resting low).
  /** @param {number} y */
  const place = (y) => {
    // Placed mid-drag or mid-settle: the sheet is mounted.
    const s = /** @type {HTMLElement} */ (sheetRef.current);
    const open01 = openFraction(y, restY.current);
    s.style.transform = `translate(-50%, ${y}px)`;
    s.style.setProperty('--open', String(open01));
    if (scrimRef.current) scrimRef.current.style.opacity = String(open01);
  };
  /** @param {boolean} on */
  const setDragging = (on) => {
    for (const el of [sheetRef.current, scrimRef.current]) el?.classList.toggle('dragging', on);
  };
  // Let go: CSS springs it to the chosen position; then the state follows.
  // 'settling' covers the spring until the state catches up (app.css keeps
  // the sheet's content and stacking as they were while dragging).
  /** @param {boolean} toOpen */
  const settle = (toOpen) => {
    setDragging(false);
    for (const el of [sheetRef.current, scrimRef.current]) el?.classList.add('settling');
    place(toOpen ? 0 : restY.current);
    timers.current.push(setTimeout(() => {
      // The state first, so the open / resting class is on before the inline
      // position goes (which would otherwise spring it the wrong way briefly).
      const {open: isOpen, onOpen: o, onClose: c} = live.current;
      if (toOpen && !isOpen) o();
      if (!toOpen && isOpen) c();
      timers.current.push(setTimeout(() => {
        timers.current = [];
        for (const el of [sheetRef.current, scrimRef.current]) {
          if (!el) continue;
          el.classList.remove('settling');
          el.style.transform = '';
          el.style.opacity = '';
          el.style.removeProperty('--open');
        }
      }, 50));
    }, SETTLE_MS));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Touch events, non-passive, so a drag can stop the page from scrolling.
  // Open, a drag down only moves the sheet while its content is at the top;
  // otherwise it scrolls the content. A mouse drags by the top part.
  useEffect(() => {
    const s = sheetRef.current;
    if (!s) return undefined;
    /** @type {Drag | null} */
    let d = null;
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} t
     * @param {EventTarget | null} target
     */
    const start = (x, y, t, target) => {
      const {open: isOpen, canOpen: can} = live.current;
      if ((!isOpen && !can) || timers.current.length) return;
      d = {x0: x, y0: y, from: isOpen ? 0 : restY.current, open: isOpen, armed: !isOpen || s.scrollTop <= 0, moved: false,
        onTop: Boolean(/** @type {Element | null} */ (target)?.closest?.('.rs-top')), track: tracker()};
      d.track.add(y, t);
    };
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} t
     * @param {Event | null} e
     */
    const move = (x, y, t, e) => {
      if (!d) return;
      const dx = x - d.x0;
      const dy = y - d.y0;
      d.track.add(y, t);
      // Mostly sideways before it became a drag: the headline's, never the
      // sheet's. Past SWIPE_X it changes the number, once per touch.
      if (!d.moved && (d.sideways || isSideways(dx, dy))) {
        d.sideways = true;
        const swipeX = live.current.onSwipeX;
        const dir = swipeDirection(dx);
        if (d.onTop && swipeX && dir) {
          swipeX(dir);
          dragEnded.current = Date.now();
          d = null;
        }
        return;
      }
      if (!d.moved) {
        // Closed: only up opens. Open: down at the top closes, anything else scrolls.
        const wrongWay = d.open ? dy < 0 || !d.armed || s.scrollTop > 0 : dy > 0;
        if (wrongWay) { if (Math.abs(dy) > SLOP) d = null; return; }
        if (Math.abs(dy) < SLOP) return;
        d.moved = true;
        setDragging(true);
      }
      e?.preventDefault();
      d.y = dragY(d.from, dy, restY.current);
      place(d.y);
    };
    const end = () => {
      const g = d;
      d = null;
      if (!g?.moved) return;
      dragEnded.current = Date.now();
      // A moved drag has a y.
      settle(settlesOpen(g.track.velocity(), /** @type {number} */ (g.y), restY.current));
    };
    // A second finger ends the drag where it is (settling to the nearer
    // position); dropping it instead left the sheet stuck mid-way.
    /** @param {TouchEvent} e */
    const ts = (e) => {
      if (e.touches.length === 1) start(e.touches[0].clientX, e.touches[0].clientY, e.timeStamp, e.target);
      else if (d?.moved) end();
      else d = null;
    };
    /** @param {TouchEvent} e */
    const tm = (e) => { if (d) move(e.touches[0].clientX, e.touches[0].clientY, e.timeStamp, e); };
    /** @param {PointerEvent} e */
    const pd = (e) => {
      // Not on a button (the bars, Save, Share): capturing the pointer would
      // send its click to the sheet instead. The target is an element of the sheet.
      if (e.pointerType !== 'mouse' || !/** @type {Element} */ (e.target).closest('.rs-top, .rs-head') || /** @type {Element} */ (e.target).closest('button')) return;
      start(e.clientX, e.clientY, e.timeStamp, e.target);
      if (d) { d.armed = true; s.setPointerCapture?.(e.pointerId); }
    };
    /** @param {PointerEvent} e */
    const pm = (e) => { if (e.pointerType === 'mouse' && d) move(e.clientX, e.clientY, e.timeStamp, null); };
    /** @param {PointerEvent} e */
    const pu = (e) => { if (e.pointerType === 'mouse') end(); };
    /** @type {([string, (e: TouchEvent) => void, AddEventListenerOptions?] | [string, (e: PointerEvent) => void])[]} */
    const listeners = [
      ['touchstart', ts, {passive: true}], ['touchmove', tm, {passive: false}], ['touchend', end], ['touchcancel', end],
      ['pointerdown', pd], ['pointermove', pm], ['pointerup', pu], ['pointercancel', pu], ['lostpointercapture', pu],
    ];
    // Each handler takes the event its name delivers.
    for (const [name, fn, options] of listeners) s.addEventListener(name, /** @type {EventListener} */ (fn), options);
    return () => { for (const [name, fn] of listeners) s.removeEventListener(name, /** @type {EventListener} */ (fn)); };
  }, []);

  // Re-measure when the top's content may have changed size, and on resize.
  // Not on every render: measuring turns transitions off for a moment, which
  // made a tap's open / close jump instead of animating.
  useLayoutEffect(measure, [measure, measureKey]);
  // Resize fires often (iOS while the URL bar collapses): once per frame.
  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, [measure]);

  // The top is the card: a tap on it opens, unless it ended a drag.
  const onTopClick = () => {
    if (Date.now() - dragEnded.current < DRAG_CLICK_MS) return;
    const {open: isOpen, canOpen: can, onOpen: o} = live.current;
    if (!isOpen && can) o();
  };

  return {sheetRef, scrimRef, onTopClick};
}
