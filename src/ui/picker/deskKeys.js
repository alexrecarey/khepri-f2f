// The desk picker's keyboard, all from the search box: ↑↓ move, → into the
// loadouts, ← back, ↵ pick (⇧↵ the other choice), Tab the other side, Esc close.
import {pickerSide} from '../../state/actions.js';
import {dispatch, getState} from '../../state/store.js';
import {setCursor} from './useDeskPicker.js';

const back = () => dispatch({type: 'back'});

// The search box's onKeyDown. m: useDeskPicker()
export default function deskKeyHandler(m) {
  const {pane, loadouts, lat, current, rows, at, unitId, query, bestAt, otherSet, army, otherSide} = m;
  return (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const d = e.key === 'ArrowDown' ? 1 : -1;
      if (pane === 'loadouts') setCursor({lcursor: Math.max(0, Math.min(loadouts.length - 1, lat + d))});
      else if (!current) setCursor({cursor: 0, lcursor: 0, profileId: null});
      else setCursor({cursor: Math.max(0, Math.min(rows.length - 1, at + d)), lcursor: 0, profileId: null});
    } else if (e.key === 'ArrowRight' && unitId != null && (pane === 'list') && e.currentTarget.selectionStart === query.length) {
      e.preventDefault();
      setCursor({pane: 'loadouts', lcursor: bestAt});
    } else if (e.key === 'ArrowLeft' && pane === 'loadouts') {
      e.preventDefault();
      setCursor({pane: 'list'});
    } else if (e.key === 'Enter') {
      e.preventDefault();
      m.pick(m.hitFor(), e.shiftKey ? otherSet : !otherSet);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      dispatch(pickerSide(army, getState(), otherSide));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      back();
    }
  };
}
