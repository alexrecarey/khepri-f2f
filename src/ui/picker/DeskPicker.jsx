// The trooper picker on wide screens (useLayout 'landscape' and up): one
// overlay over the dimmed workbench. Top: which side, the search box, faction
// chips with hit counts. Left: recents, a unit type's units, or the matches
// (this faction first, then other factions). Right: the highlighted unit with
// its stats and every loadout as a chart line, or, before typing, factions and
// unit types to browse. The keyboard drives it all from the search box:
// ↑↓ move, → into the loadouts, ← back, ↵ pick, Tab the other side (empty
// box only), Esc close.
// Query, scope, highlight and side are the state document's ui.picker.
import {useEffect, useRef} from 'react';
import {unitById} from '../../army/lookup.js';
import {shortIsc} from '../../army/names.js';
import {pickerSide} from '../../state/actions.js';
import {ROLE} from '../../state/schema.js';
import {dispatch, getState} from '../../state/store.js';
import DeskDetail from './DeskDetail.jsx';
import DeskList from './DeskList.jsx';
import deskKeyHandler from './deskKeys.js';
import useDeskPicker from './useDeskPicker.js';
import useDialogFocus from '../useDialogFocus.js';
import {useT} from '../i18n.jsx';
import {sideLabel} from '../SideCard.jsx';
import {back} from '../nav.js';

/** @param {{searcher: import('../../types.js').Searcher | null, army: import('../../types.js').Army | null, loadError?: (() => void) | null}} props */
export default function DeskPicker({searcher, army, loadError}) {
  const t = useT();
  const m = useDeskPicker({searcher, army});
  const {side, color, query, scope, sides, all, chips, current, at, pane, lat, loadouts} = m;
  // The highlighted option, in whichever pane has the arrow keys.
  const active = pane === 'loadouts' && loadouts[lat] ? `dp-lo-${lat}` : current ? `dp-row-${at}` : undefined;
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const dialogRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  useEffect(() => { inputRef.current?.focus(); }, [side]);
  useDialogFocus(dialogRef);
  const onKey = deskKeyHandler(m);

  return (
    <>
      <div className="desk-scrim" onClick={back} />
      <div ref={dialogRef} className="desk-picker" role="dialog" aria-modal="true" aria-label={t('side.trooper', {side: t(`side.${color}`)})}>
        <div className="dp-top">
          <span className="dp-sides" role="group" aria-label={t('picker.side')}>
            {/** @type {import('../../types.js').Side[]} */ (['A', 'B']).map((s) => (
              <button type="button" key={s} className={`${s === side ? `on ${ROLE[s]}` : ''}`} aria-pressed={s === side}
                onClick={() => s !== side && dispatch(pickerSide(army, getState(), s))}>
                {sideLabel(t, s)}
                {s !== side && sides[s]?.unitId != null && <span className={`dp-set c-${ROLE[s]}`}> · {shortIsc(unitById(army, sides[s].unitId)?.isc)} ✓</span>}
              </button>
            ))}
          </span>
          <label className={`dp-search ${color}`}>
            <span aria-hidden="true">⌕</span>
            <span className="vh">{t('picker.search')}</span>
            <input ref={inputRef} value={query} placeholder={t('picker.placeholderDesk')} autoComplete="off" spellCheck={false}
              onChange={(e) => dispatch({type: 'pickerQuery', query: e.target.value})} onKeyDown={onKey}
              role="combobox" aria-expanded="true" aria-autocomplete="list" aria-haspopup="listbox"
              aria-activedescendant={active} aria-controls={active?.startsWith('dp-lo-') ? 'dp-loadouts' : 'dp-list'} />
          </label>
          <span className="dp-keys">{query === '' && <><kbd>Tab</kbd> {t('picker.sideKey')} </>}<kbd>esc</kbd></span>
        </div>
        <div className="dp-chips" role="group" aria-label={t('picker.faction')}>
          <button type="button" className={`chip${scope == null ? ' on-plain' : ''}`} onClick={() => dispatch({type: 'pickerScope', scope: null})}>
            {t('picker.all')} {all && <small>{all.units.length}</small>}
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
