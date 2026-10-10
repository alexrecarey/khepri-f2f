// The trooper picker on wide screens (useLayout 'landscape' and up): one
// overlay over the dimmed workbench. Top: which side, the search box, faction
// chips with hit counts. Left: recents, a unit type's units, or the matches
// (this faction first, then other factions). Right: the highlighted unit with
// its stats and every loadout as a chart line, or, before typing, factions and
// unit types to browse. The keyboard drives it all from the search box:
// ↑↓ move, → into the loadouts, ← back, ↵ pick, Tab the other side, Esc close.
// Query, scope, highlight and side are the state document's ui.picker.
import {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {unitById} from '../../army/lookup.js';
import {shortIsc} from '../../army/names.js';
import {pickerSide} from '../../state/actions.js';
import {ROLE, SIDE_NAME} from '../../state/schema.js';
import {dispatch, getState} from '../../state/store.js';
import DeskDetail from './DeskDetail.jsx';
import DeskList from './DeskList.jsx';
import deskKeyHandler from './deskKeys.js';
import useDeskPicker from './useDeskPicker.js';

const back = () => dispatch({type: 'back'});

export default function DeskPicker({searcher, army, loadError}) {
  const m = useDeskPicker({searcher, army});
  const {side, color, query, scope, sides, all, chips, current, at} = m;
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, [side]);
  const onKey = deskKeyHandler(m);

  return (
    <>
      <div className="desk-scrim" onClick={back} />
      <div className="desk-picker" role="dialog" aria-modal="true" aria-label={`${color} trooper`}>
        <div className="dp-top">
          <span className="dp-sides" role="group" aria-label="Side">
            {['A', 'B'].map((s) => (
              <button type="button" key={s} className={`${s === side ? `on ${ROLE[s]}` : ''}`} aria-pressed={s === side}
                onClick={() => s !== side && dispatch(pickerSide(army, getState(), s))}>
                {SIDE_NAME[s].toUpperCase()}
                {s !== side && sides[s]?.unitId != null && <span className={`dp-set c-${ROLE[s]}`}> · {shortIsc(unitById(army, sides[s].unitId)?.isc)} ✓</span>}
              </button>
            ))}
          </span>
          <label className={`dp-search ${color}`}>
            <span aria-hidden="true">⌕</span>
            <span className="vh">Search troopers</span>
            <input ref={inputRef} value={query} placeholder="Search troopers and weapons…" autoComplete="off" spellCheck={false}
              onChange={(e) => dispatch({type: 'pickerQuery', query: e.target.value})} onKeyDown={onKey}
              aria-activedescendant={current ? `dp-row-${at}` : undefined} aria-controls="dp-list" />
          </label>
          <span className="dp-keys"><kbd>Tab</kbd> side <kbd>esc</kbd></span>
        </div>
        <div className="dp-chips" role="group" aria-label="Faction">
          <button type="button" className={`chip${scope == null ? ' on-plain' : ''}`} onClick={() => dispatch({type: 'pickerScope', scope: null})}>
            All {all && <small>{all.units.length}</small>}
          </button>
          {chips.map((f) => (
            <button type="button" key={f.id} className={`chip${scope === f.id ? ' on-plain' : ''}`} onClick={() => dispatch({type: 'pickerScope', scope: f.id})}>
              {f.name} {f.count != null && <small>{f.count}</small>}
            </button>
          ))}
        </div>
        <div className="dp-body">
          <DeskList m={m} loadError={loadError} />
          <DeskDetail m={m} />
        </div>
      </div>
    </>
  );
}

DeskPicker.propTypes = {searcher: PropTypes.object, army: PropTypes.object, loadError: PropTypes.func};
