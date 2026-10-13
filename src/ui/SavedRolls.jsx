// Saved rolls: Matchup rolls as crest pairs (design canvas: Crests E), with
// unit + weapon for each side and the situation; Classic rolls by their dice.
// Phone and tablet: a page whose cards swipe left to Delete. Wider: a dialog
// over the workbench; Delete shows on the row under the mouse or the focus,
// arrows move, Enter loads, Delete removes, Esc closes.
import PropTypes from 'prop-types';
import {dispatch, useAppState} from '../state/store.js';
import {MODES} from '../state/modes.js';
import {rollRow} from '../state/rolls.js';
import {CrestPair} from './Crest.jsx';
import DeskDialog from './DeskDialog.jsx';
import {TrashIcon} from './icons.jsx';
import {Page} from './Sheet.jsx';
import useLayout, {usesDialogs} from './useLayout.js';
import useSwipeToDelete from './useSwipeToDelete.js';

const back = () => dispatch({type: 'back'});
const loadRoll = (id) => dispatch({type: 'loadRoll', id});
const deleteRoll = (id) => {
  dispatch({type: 'deleteRoll', id});
  dispatch({type: 'toast', text: 'Roll deleted'});
};

// What a roll says: Matchup, the crest row; Classic, both dice lines.
function RollBody({roll, size}) {
  const s = roll.summary;
  if (roll.mode !== MODES.matchup) {
    return (
      <span className="roll-classic">
        <span className="roll-row" style={{fontWeight: 600}}><span className="c-active">{s.a}</span><span className="c-reactive">{s.r}</span></span>
        <span className="roll-row dice"><span className="c-active">{s.ad}</span><span className="c-reactive">{s.rd}</span></span>
        <span className="roll-row note"><span>{s.setup}</span><span><b className="c-active">{s.ap}</b> · <b className="c-reactive">{s.rp}</b></span></span>
      </span>
    );
  }
  const r = rollRow(s);
  return (
    <span className="roll-crests">
      <CrestPair row={r} size={size} />
      <span className="roll-text">
        <span className="roll-who">
          <span className="c-active">{r.au}</span> <span className="roll-weapon">{r.aw}</span> <span className="roll-vs">vs</span>{' '}
          <span className="c-reactive">{r.ru}</span> <span className="roll-weapon">{r.rw}</span>
        </span>
        {r.setup && <span className="roll-setup">{r.setup}</span>}
      </span>
    </span>
  );
}

RollBody.propTypes = {roll: PropTypes.object.isRequired, size: PropTypes.number};

const rollLabel = (s) => `${s.a} against ${s.r}${s.setup ? `, ${s.setup}` : ''}. Load this roll`;

// One saved roll on the phone page; swipe it left to show Delete.
function RollCard({roll, swiped}) {
  const {cardRef, handlers} = useSwipeToDelete(roll.id, swiped, () => loadRoll(roll.id));
  return (
    <div className={`roll-wrap ${roll.mode}`}>
      <button type="button" className="roll-delete" tabIndex={swiped ? 0 : -1} onClick={() => deleteRoll(roll.id)}>Delete</button>
      <button type="button" ref={cardRef} className="roll" {...handlers}
        onKeyDown={(e) => { if (e.key === 'Delete' || e.key === 'Backspace') deleteRoll(roll.id); }}
        aria-label={rollLabel(roll.summary)}>
        <RollBody roll={roll} size={36} />
      </button>
    </div>
  );
}

RollCard.propTypes = {roll: PropTypes.object.isRequired, swiped: PropTypes.bool};

// The list for the open tab, and the Matchup | Classic switch.
function useSavedList() {
  const saved = useAppState((s) => s.lists.saved);
  const mode = useAppState((s) => s.mode);
  const tab = useAppState((s) => s.ui.savedTab) ?? mode;
  const count = (m) => saved.filter((r) => r.mode === m).length;
  const tabs = (
    <div className="segs" role="group" aria-label="Which calculator">
      {[[MODES.matchup, 'Matchup'], [MODES.basic, 'Classic']].map(([m, name]) => (
        <button key={m} type="button" className={`seg${tab === m ? ' on' : ''}`} aria-pressed={tab === m}
          onClick={() => dispatch({type: 'setSavedTab', tab: m})}>{name} · {count(m)}</button>
      ))}
    </div>
  );
  return {saved, list: saved.filter((r) => r.mode === tab), tabs};
}

const EMPTY = 'Nothing saved yet. Open the results and tap Save to keep a roll here.';

function SavedPhone() {
  const {saved, list, tabs} = useSavedList();
  const swiped = useAppState((s) => s.ui.swiped);
  return (
    <Page title="Saved rolls" className="from-menu" onBack={back} action={<span className="note" style={{paddingRight: 12, fontSize: 13}}>{saved.length}</span>}>
      {tabs}
      <div className="roll-list">
        {list.map((r) => <RollCard key={r.id} roll={r} swiped={swiped === r.id} />)}
        {list.length > 0
          ? <span className="note roll-hint">Tap to load the whole setup · swipe left to delete</span>
          : <span className="empty">{EMPTY}</span>}
      </div>
    </Page>
  );
}

// Up / down move the focus between the rows' load buttons.
function moveFocus(e) {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  const rows = [...e.currentTarget.querySelectorAll('.drow-load')];
  const i = rows.indexOf(document.activeElement);
  const next = rows[i < 0 ? 0 : Math.max(0, Math.min(rows.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))];
  if (next) { e.preventDefault(); next.focus(); next.scrollIntoView({block: 'nearest'}); }
}

function SavedDialog() {
  const {list, tabs} = useSavedList();
  return (
    <DeskDialog title="Saved rolls" size="saved" head={tabs}>
      <div className="sd-list" onKeyDown={moveFocus}>
        {list.map((r) => (
          <div key={r.id} className={`drow ${r.mode}`}>
            <button type="button" className="drow-load" aria-label={rollLabel(r.summary)} onClick={() => loadRoll(r.id)}
              onKeyDown={(e) => { if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteRoll(r.id); } }}>
              <RollBody roll={r} size={40} />
              <kbd className="drow-enter" aria-hidden="true">↵ load</kbd>
            </button>
            <button type="button" className="icon-btn drow-delete" aria-label="Delete this roll" onClick={() => deleteRoll(r.id)}><TrashIcon /></button>
          </div>
        ))}
        {list.length === 0 && <span className="empty">{EMPTY}</span>}
      </div>
      <div className="sd-foot">
        <span>Click a roll to load the whole setup</span>
        <span><kbd>↑</kbd> <kbd>↓</kbd> move · <kbd>↵</kbd> load · <kbd>Del</kbd> delete · <kbd>esc</kbd> close</span>
      </div>
    </DeskDialog>
  );
}

// Same layouts as the trooper picker: a dialog from landscape tablets up.
export default function SavedRolls() {
  return usesDialogs(useLayout()) ? <SavedDialog /> : <SavedPhone />;
}
