// Saved rolls: Matchup rolls as crest pairs (design canvas: Crests E), with
// unit + weapon for each side and the situation; Classic rolls by their dice.
// Phone and tablet: a page whose cards swipe left to Delete. Wider: a dialog
// over the workbench; Delete shows on the row under the mouse or the focus,
// arrows move, Enter loads, Delete removes, Esc closes.
import {dispatch, useAppState} from '../state/store.js';
import {MODES} from '../state/modes.js';
import {rollRow} from '../state/rolls.js';
import {CrestPair} from './Crest.jsx';
import DeskDialog from './DeskDialog.jsx';
import {TrashIcon} from './icons.jsx';
import {Page} from './Sheet.jsx';
import useLayout, {usesDialogs} from './useLayout.js';
import useSwipeToDelete from './useSwipeToDelete.js';
import {useT} from './i18n.jsx';
import {back} from './nav.js';

/** @typedef {import('../types.js').SavedRoll} SavedRoll */
/** @typedef {import('../types.js').Translator} Translator */

/** @param {string} id */
const loadRoll = (id) => dispatch({type: 'loadRoll', id});
/**
 * @param {string} id
 * @param {Translator} t
 */
const deleteRoll = (id, t) => {
  dispatch({type: 'deleteRoll', id});
  dispatch({type: 'toast', text: t('saved.deleted')});
};

// What a roll says: Matchup, the crest row; Classic, both dice lines.
/** @param {{roll: SavedRoll, size?: number}} props */
function RollBody({roll, size}) {
  const t = useT();
  const s = roll.summary;
  if (roll.mode !== MODES.matchup) {
    return (
      <span className="roll-classic">
        <span className="roll-row main"><span className="c-active">{s.a}</span><span className="c-reactive">{s.r}</span></span>
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
          <span className="c-active">{r.au}</span> <span className="roll-weapon">{r.aw}</span> <span className="roll-vs">{t('roll.vs')}</span>{' '}
          <span className="c-reactive">{r.ru}</span> <span className="roll-weapon">{r.rw}</span>
        </span>
        {r.setup && <span className="roll-setup">{r.setup}</span>}
      </span>
    </span>
  );
}

/**
 * @param {import('../types.js').RollSummary} s
 * @param {Translator} t
 */
const rollLabel = (s, t) => t('saved.rollLabel', {a: s.a, r: s.r, setup: s.setup ? `, ${s.setup}` : ''});

// One saved roll on the phone page; swipe it left to show Delete.
/** @param {{roll: SavedRoll, swiped: boolean}} props */
function RollCard({roll, swiped}) {
  const t = useT();
  const {cardRef, handlers} = useSwipeToDelete(roll.id, swiped, () => loadRoll(roll.id));
  return (
    <div className={`roll-wrap ${roll.mode}`}>
      <button type="button" className="roll-delete" tabIndex={swiped ? 0 : -1} onClick={() => deleteRoll(roll.id, t)}>{t('saved.delete')}</button>
      <button type="button" ref={cardRef} className="roll" {...handlers}
        onKeyDown={(e) => { if (e.key === 'Delete' || e.key === 'Backspace') deleteRoll(roll.id, t); }}
        aria-label={rollLabel(roll.summary, t)}>
        <RollBody roll={roll} size={36} />
      </button>
    </div>
  );
}

// The list for the open tab, and the Matchup | Classic switch.
function useSavedList() {
  const t = useT();
  const saved = useAppState((s) => s.lists.saved);
  const mode = useAppState((s) => s.mode);
  const tab = useAppState((s) => s.ui.savedTab) ?? mode;
  /** @param {string} m */
  const count = (m) => saved.filter((r) => r.mode === m).length;
  const tabs = (
    <div className="segs" role="group" aria-label={t('saved.whichCalculator')}>
      {/** @type {[import('../types.js').UiState['savedTab'] & string, string][]} */ ([[MODES.matchup, t('mode.matchup')], [MODES.basic, t('mode.classic')]]).map(([m, name]) => (
        <button key={m} type="button" className={`seg${tab === m ? ' on' : ''}`} aria-pressed={tab === m}
          onClick={() => dispatch({type: 'setSavedTab', tab: m})}>{name} · {count(m)}</button>
      ))}
    </div>
  );
  return {saved, list: saved.filter((r) => r.mode === tab), tabs};
}

function SavedPhone() {
  const t = useT();
  const {saved, list, tabs} = useSavedList();
  const swiped = useAppState((s) => s.ui.swiped);
  return (
    <Page title={t('menu.savedRolls')} className="from-menu" onBack={back} action={<span className="note roll-count">{saved.length}</span>}>
      {tabs}
      <div className="roll-list">
        {list.map((r) => <RollCard key={r.id} roll={r} swiped={swiped === r.id} />)}
        {list.length > 0
          ? <span className="note roll-hint">{t('saved.hintPhone')}</span>
          : <span className="empty">{t('saved.empty')}</span>}
      </div>
    </Page>
  );
}

// Up / down move the focus between the rows' load buttons.
/** @param {import('react').KeyboardEvent<HTMLElement>} e */
function moveFocus(e) {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  const rows = [.../** @type {NodeListOf<HTMLElement>} */ (e.currentTarget.querySelectorAll('.drow-load'))];
  const i = rows.indexOf(/** @type {HTMLElement} */ (document.activeElement));
  const next = rows[i < 0 ? 0 : Math.max(0, Math.min(rows.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))];
  if (next) { e.preventDefault(); next.focus(); next.scrollIntoView({block: 'nearest'}); }
}

function SavedDialog() {
  const t = useT();
  const {list, tabs} = useSavedList();
  return (
    <DeskDialog title={t('menu.savedRolls')} size="saved" head={tabs}>
      <div className="sd-list" onKeyDown={moveFocus}>
        {list.map((r) => (
          <div key={r.id} className={`drow ${r.mode}`}>
            <button type="button" className="drow-load" aria-label={rollLabel(r.summary, t)} onClick={() => loadRoll(r.id)}
              onKeyDown={(e) => { if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteRoll(r.id, t); } }}>
              <RollBody roll={r} size={40} />
              <kbd className="drow-enter" aria-hidden="true">↵ {t('saved.load')}</kbd>
            </button>
            <button type="button" className="icon-btn drow-delete" aria-label={t('saved.deleteThis')} onClick={() => deleteRoll(r.id, t)}><TrashIcon /></button>
          </div>
        ))}
        {list.length === 0 && <span className="empty">{t('saved.empty')}</span>}
      </div>
      <div className="sd-foot">
        <span>{t('saved.hintDesk')}</span>
        <span><kbd>↑</kbd> <kbd>↓</kbd> {t('keys.move')} · <kbd>↵</kbd> {t('saved.load')} · <kbd>Del</kbd> {t('keys.delete')} · <kbd>esc</kbd> {t('keys.close')}</span>
      </div>
    </DeskDialog>
  );
}

// Same layouts as the trooper picker: a dialog from landscape tablets up.
export default function SavedRolls() {
  return usesDialogs(useLayout()) ? <SavedDialog /> : <SavedPhone />;
}
