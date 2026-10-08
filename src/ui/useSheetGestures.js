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
import {useCallback, useEffect, useLayoutEffect, useRef} from 'react';

const SLOP = 8;          // px before a press becomes a drag
const FLICK = 0.4;       // px/ms that counts as a flick
const SETTLE_MS = 330;   // the spring in app.css

// Velocity over the last moves, in px/ms (positive = down).
function tracker() {
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

// measureKey: changes when the top's content may change size (new numbers,
// status); only then is the resting position measured again.
export default function useSheetGestures({open, canOpen, onOpen, onClose, measureKey}) {
  const sheetRef = useRef(null);
  const scrimRef = useRef(null);
  const live = useRef({open, canOpen, onOpen, onClose});
  live.current = {open, canOpen, onOpen, onClose};
  // When a drag ended: a click right after it is the drag's own, not a tap.
  const dragEnded = useRef(0);

  // How far down the sheet rests when closed: its height minus the part that
  // shows (the top, measured at --open 0). Kept in --rest-y for the CSS.
  const restY = useRef(0);
  const measure = useCallback(() => {
    const s = sheetRef.current;
    const top = s?.querySelector('.rs-top');
    // Not mid-drag or mid-settle: that would undo the sheet's live position.
    if (!s || !top || s.style.transform) return;
    s.classList.add('measuring');
    s.style.setProperty('--open', '0');
    const visible = top.offsetTop + top.offsetHeight + parseFloat(getComputedStyle(s).paddingBottom);
    restY.current = Math.max(0, s.offsetHeight - visible);
    s.style.removeProperty('--open');
    void s.offsetHeight; // apply the real --open with transitions still off
    s.classList.remove('measuring');
    s.style.setProperty('--rest-y', `${restY.current}px`);
  }, []);

  // y: how far down the sheet is (0 = open, restY = resting low).
  const place = (y) => {
    const s = sheetRef.current;
    const open01 = restY.current ? Math.max(0, Math.min(1, 1 - y / restY.current)) : 1;
    s.style.transform = `translate(-50%, ${y}px)`;
    s.style.setProperty('--open', String(open01));
    if (scrimRef.current) scrimRef.current.style.opacity = String(open01);
  };
  const setDragging = (on) => {
    for (const el of [sheetRef.current, scrimRef.current]) el?.classList.toggle('dragging', on);
  };
  // Let go: CSS springs it to the chosen position; then the state follows.
  // 'settling' covers the spring until the state catches up (app.css keeps
  // the sheet's content and stacking as they were while dragging).
  const settle = (toOpen) => {
    setDragging(false);
    for (const el of [sheetRef.current, scrimRef.current]) el?.classList.add('settling');
    place(toOpen ? 0 : restY.current);
    setTimeout(() => {
      // The state first, so the open / resting class is on before the inline
      // position goes (which would otherwise spring it the wrong way briefly).
      const {open: isOpen, onOpen: o, onClose: c} = live.current;
      if (toOpen && !isOpen) o();
      if (!toOpen && isOpen) c();
      setTimeout(() => {
        for (const el of [sheetRef.current, scrimRef.current]) {
          if (!el) continue;
          el.classList.remove('settling');
          el.style.transform = '';
          el.style.opacity = '';
          el.style.removeProperty('--open');
        }
      }, 50);
    }, SETTLE_MS);
  };

  // Touch events, non-passive, so a drag can stop the page from scrolling.
  // Open, a drag down only moves the sheet while its content is at the top;
  // otherwise it scrolls the content. A mouse drags by the top part.
  useEffect(() => {
    const s = sheetRef.current;
    if (!s) return undefined;
    let d = null;
    const start = (y, t) => {
      const {open: isOpen, canOpen: can} = live.current;
      if (!isOpen && !can) return;
      d = {y0: y, from: isOpen ? 0 : restY.current, open: isOpen, armed: !isOpen || s.scrollTop <= 0, moved: false, track: tracker()};
      d.track.add(y, t);
    };
    const move = (y, t, e) => {
      if (!d) return;
      const dy = y - d.y0;
      d.track.add(y, t);
      if (!d.moved) {
        // Closed: only up opens. Open: down at the top closes, anything else scrolls.
        const wrongWay = d.open ? dy < 0 || !d.armed || s.scrollTop > 0 : dy > 0;
        if (wrongWay) { if (Math.abs(dy) > SLOP) d = null; return; }
        if (Math.abs(dy) < SLOP) return;
        d.moved = true;
        setDragging(true);
      }
      e?.preventDefault();
      d.y = Math.max(0, Math.min(restY.current, d.from + dy - Math.sign(dy) * SLOP));
      place(d.y);
    };
    const end = () => {
      const g = d;
      d = null;
      if (!g?.moved) return;
      dragEnded.current = Date.now();
      const v = g.track.velocity();
      settle(v < -FLICK || (v <= FLICK && g.y < restY.current / 2));
    };
    const ts = (e) => { if (e.touches.length === 1) start(e.touches[0].clientY, e.timeStamp); else d = null; };
    const tm = (e) => { if (d) move(e.touches[0].clientY, e.timeStamp, e); };
    const pd = (e) => {
      if (e.pointerType !== 'mouse' || !e.target.closest('.rs-top, .rs-head')) return;
      start(e.clientY, e.timeStamp);
      if (d) { d.armed = true; s.setPointerCapture?.(e.pointerId); }
    };
    const pm = (e) => { if (e.pointerType === 'mouse' && d) move(e.clientY, e.timeStamp, null); };
    const pu = (e) => { if (e.pointerType === 'mouse') end(); };
    s.addEventListener('touchstart', ts, {passive: true});
    s.addEventListener('touchmove', tm, {passive: false});
    s.addEventListener('touchend', end);
    s.addEventListener('touchcancel', end);
    s.addEventListener('pointerdown', pd);
    s.addEventListener('pointermove', pm);
    s.addEventListener('pointerup', pu);
    return () => {
      s.removeEventListener('touchstart', ts);
      s.removeEventListener('touchmove', tm);
      s.removeEventListener('touchend', end);
      s.removeEventListener('touchcancel', end);
      s.removeEventListener('pointerdown', pd);
      s.removeEventListener('pointermove', pm);
      s.removeEventListener('pointerup', pu);
    };
  }, []);

  // Re-measure when the top's content may have changed size, and on resize.
  // Not on every render: measuring turns transitions off for a moment, which
  // made a tap's open / close jump instead of animating.
  useLayoutEffect(measure, [measure, measureKey]);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  // The top is the card: a tap on it opens, unless it ended a drag.
  const onTopClick = () => {
    if (Date.now() - dragEnded.current < 350) return;
    const {open: isOpen, canOpen: can, onOpen: o} = live.current;
    if (!isOpen && can) o();
  };

  return {sheetRef, scrimRef, onTopClick};
}
