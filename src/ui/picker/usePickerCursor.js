// The highlighted row of the picker's current screen, and the keys that move
// it: ↑↓ move, ↵ takes it. On the search screen the box has the keys (its
// onKeyDown and submit); on a drilled-in screen (a unit's loadouts, a unit
// type's units) there is no box, so the document listens. The first row is
// highlighted while typing (Enter takes it); elsewhere only once an arrow is
// pressed, so a phone shows no highlight it can't use.
import {useEffect, useState} from 'react';

/** @typedef {import('../../types.js').ResultItem} ResultItem */

// Keys a focused control keeps for itself: typing, or a button's own Enter.
/** @param {EventTarget | null} target */
const ownsKeys = (target) => target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target.tagName);

/**
 * @param {ResultItem[]} rows what the arrow keys walk, in screen order
 * @param {unknown} screen changes when the list starts again (query, faction, screen)
 * @param {(item: ResultItem) => void} take opens a unit or picks a loadout
 * @param {{typing: boolean, drilled: boolean}} opts
 */
export default function usePickerCursor(rows, screen, take, {typing, drilled}) {
  const [cursor, setCursor] = useState({at: 0, moved: false});
  useEffect(() => setCursor({at: 0, moved: false}), [screen]);
  const at = Math.min(cursor.at, Math.max(0, rows.length - 1));
  const shown = typing || cursor.moved;
  // Lists driven by the keyboard keep the active row in view.
  useEffect(() => {
    if (cursor.moved) document.getElementById(`picker-row-${at}`)?.scrollIntoView({block: 'nearest'});
  }, [at, cursor.moved]);

  /** @param {number} d */
  const move = (d) => setCursor({at: shown ? Math.max(0, Math.min(rows.length - 1, at + d)) : 0, moved: true});
  // Enter takes the highlighted row, but never an unasked-for typo guess: the player confirms those.
  const submit = () => {
    const item = rows[at];
    if (!shown || !item || (item.kind === 'loadout' && item.hit.loose && !cursor.moved)) return;
    take(item);
  };
  /** @param {KeyboardEvent | import('react').KeyboardEvent} e @returns {boolean} handled */
  const arrows = (e) => {
    if ((e.key !== 'ArrowDown' && e.key !== 'ArrowUp') || !rows.length) return false;
    e.preventDefault();
    move(e.key === 'ArrowDown' ? 1 : -1);
    return true;
  };

  // Drilled in: the document has the keys (Escape is the page's, useEscape).
  useEffect(() => {
    if (!drilled) return undefined;
    /** @param {KeyboardEvent} e */
    const onKey = (e) => {
      if (arrows(e)) return;
      if (e.key === 'Enter' && !ownsKeys(e.target)) { e.preventDefault(); submit(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  /** The props that mark row i as the highlighted one. @param {number} i */
  const rowProps = (i) => ({id: `picker-row-${i}`, on: shown && i === at});
  return {at, shown, arrows, submit, rowProps};
}
