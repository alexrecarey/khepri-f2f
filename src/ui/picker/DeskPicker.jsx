// The trooper picker on wide screens (useLayout 'landscape' and up): the
// phone's picker in a centred panel over the dimmed workbench, the same
// search box, rows and ranking. What a keyboard adds: ↑↓ ↵ (TrooperPicker),
// Tab for the other side while the box is empty, and ↵ moving on to the other
// side while it is still empty, so two Enters fill both.
import {pickTrooper, pickerSide} from '../../state/actions.js';
import {other} from '../../state/schema.js';
import {dispatch, useAppState} from '../../state/store.js';
import TrooperPicker from './TrooperPicker.jsx';
import {back} from '../nav.js';

/** @param {{searcher: import('../../types.js').Searcher | null, army: import('../../types.js').Army | null, loadError?: (() => void) | null}} props */
export default function DeskPicker({searcher, army, loadError}) {
  // Shown while the picker is open (ui.picker set).
  const {side, query} = useAppState((s) => /** @type {import('../../types.js').PickerState} */ (s.ui.picker));
  const otherSet = useAppState((s) => s.matchup[other(side)]?.unitId != null);
  /** @param {import('react').KeyboardEvent<HTMLInputElement>} e */
  const onKeyDown = (e) => {
    if (e.key === 'Tab' && !e.shiftKey && query === '') {
      e.preventDefault();
      dispatch(pickerSide(other(side)));
    }
  };
  return (
    <>
      <div className="desk-scrim" onClick={back} />
      <div className="desk-panel">
        <TrooperPicker side={side} searcher={searcher} army={army} loadError={loadError} onKeyDown={onKeyDown}
          onPick={(hit) => dispatch(pickTrooper(army, side, hit, {next: !otherSet}))} />
      </div>
    </>
  );
}
