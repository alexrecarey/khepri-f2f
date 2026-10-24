// A saved roll swiped left shows its Delete button behind it (phone and
// tablet). Returns the card's ref and pointer handlers; onTap runs for a tap
// that wasn't the end of a swipe. Which card is open lives in the state
// document (ui.swiped), so opening one closes the others.
import {useEffect, useRef} from 'react';
import {dispatch} from '../state/store.js';

// How far a swiped card slides to show Delete: the Delete button's width
// (app.css --roll-delete-w).
const OPEN = -88;

/**
 * @param {string} id the saved roll's
 * @param {boolean} swiped this card is the open one
 * @param {() => void} onTap
 */
export default function useSwipeToDelete(id, swiped, onTap) {
  const drag = useRef(/** @type {{x0: number, y0: number, base: number, moved: boolean, id: number} | null} */ (null));
  const cardRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  // When a swipe ended: the click that follows it is the swipe's own.
  const swipeEnded = useRef(0);
  /** @param {number} x */
  const setX = (x) => { if (cardRef.current) cardRef.current.style.transform = x ? `translateX(${x}px)` : ''; };
  /** @param {boolean} on */
  const setDragging = (on) => cardRef.current?.classList.toggle('dragging', on);
  useEffect(() => setX(swiped ? OPEN : 0), [swiped]);
  /** @param {import('react').PointerEvent} e */
  const onPointerDown = (e) => { drag.current = {x0: e.clientX, y0: e.clientY, base: swiped ? OPEN : 0, moved: false, id: e.pointerId}; };
  /** @param {import('react').PointerEvent} e */
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x0;
    if (!d.moved && Math.abs(dx) < 8) return;
    if (!d.moved && Math.abs(e.clientY - d.y0) > Math.abs(dx)) { drag.current = null; return; }
    if (!d.moved) {
      // From here the card follows the pointer, even off the card, and
      // without the transition that made it trail behind.
      d.moved = true;
      cardRef.current?.setPointerCapture?.(d.id);
      setDragging(true);
    }
    setX(Math.min(0, Math.max(OPEN * 1.5, d.base + dx)));
  };
  /** @param {import('react').PointerEvent} e */
  const onPointerUp = (e) => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    setDragging(false);
    swipeEnded.current = Date.now();
    const x = d.base + e.clientX - d.x0;
    const isOpen = x < OPEN / 2;
    setX(isOpen ? OPEN : 0);
    dispatch({type: 'setSwiped', id: isOpen ? id : null});
    e.preventDefault();
  };
  const onPointerCancel = () => {
    drag.current = null;
    setDragging(false);
    setX(swiped ? OPEN : 0);
  };
  /** @param {import('react').MouseEvent} e */
  const onClick = (e) => {
    if (Date.now() - swipeEnded.current < 350) return;
    if (swiped) { e.preventDefault(); dispatch({type: 'setSwiped', id: null}); return; }
    onTap();
  };
  return {cardRef, handlers: {onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClick}};
}
