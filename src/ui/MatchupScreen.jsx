// The matchup calculator: two side cards with the range selector between
// them, the results card pinned below. Everything comes from the state
// document (src/state) and its derived matchup view; this file only lays it
// out and turns taps into actions.
import {useCallback, useEffect, useMemo} from 'react';
import {openPicker, pickTrooper, setUpgrade} from '../state/actions.js';
import {recentsFor} from '../state/schema.js';
import {dispatch, getState, useAppState} from '../state/store.js';
import TrooperPicker from './picker/TrooperPicker.jsx';
import DeskPicker from './picker/DeskPicker.jsx';
import {useSearcher} from './picker/useTrooperSearch.js';
import {useLanguage} from '../state/language.js';
import LoadFailed from './LoadFailed.jsx';
import ResultsCard from './ResultsCard.jsx';
import ResultsPanel from './ResultsPanel.jsx';
import Ledger from './Ledger.jsx';
import RangeSelector from './RangeSelector.jsx';
import SideCard, {EmptySlot} from './SideCard.jsx';
import useLayout, {usesDialogs} from './useLayout.js';
import {matchupRollSummary} from '../state/rolls.js';
import useRollResults from './useRollResults.js';
import {engineStatus, useT} from './i18n.jsx';

/** @typedef {import('../types.js').Side} Side */
/** @typedef {import('../types.js').ProfileHit} ProfileHit */

/**
 * @param {{army: import('../types.js').Army | null, armyError: unknown, retryArmy: () => void, view: import('../types.js').MatchupView, engine: import('../types.js').EngineHook}} props
 */
export default function MatchupScreen({army, armyError, retryArmy, view, engine}) {
  const t = useT();
  // The picker overlay comes with its picker state.
  const picking = useAppState((st) => (st.ui.overlay === 'picker' ? /** @type {import('../types.js').PickerState} */ (st.ui.picker).side : null));
  const {searcher, error: searchError, retry: retrySearch} = useSearcher(true, useLanguage());
  const result = view.complete ? engine.result : null;
  // Summarized once here; the card, the panel and Save all read it.
  const summaryOf = useCallback(/** @param {import('../types.js').Summary} s */ (s) => (view.complete ? matchupRollSummary(view, s, t) : null), [view, t]);
  const {s, save} = useRollResults({result, targets: view.targets, summaryOf, pending: engine.pending});

  const layout = useLayout();
  /** @type {import('../types.js').ResultsProps} */
  const resultProps = {
    s,
    save,
    pending: engine.pending,
    status: view.complete ? engineStatus(t, engine.status) : t('results.chooseBoth'),
    // A complete matchup's ledger has both sides.
    diceLine: view.ledger ? {active: /** @type {string} */ (view.ledger.ledger.A?.dice), reactive: /** @type {string} */ (view.ledger.ledger.B?.dice)} : null,
    ledger: view.ledger,
    params: view.params,
  };
  /** @param {Side} side */
  const openSide = (side) => () => dispatch(openPicker(army, getState(), side));
  const picked = {A: view.A.resolved?.unit != null, B: view.B.resolved?.unit != null};
  resultProps.picked = picked;
  // Empty slots offer the side's last three picks; the same list as that
  // side's picker shows under Recent.
  const recentList = useAppState((st) => st.lists.recents);
  const recentHits = useMemo(() => {
    /** @param {Side} side */
    const hits = (side) => {
      if (!searcher) return [];
      const ids = /** @type {number[]} */ (recentsFor(recentList, side).map((r) => searcher.findRow(r)).filter((id) => id != null));
      return searcher.browse({factionId: null, recentIds: ids}).recent.slice(0, 3);
    };
    return {A: hits('A'), B: hits('B')};
  }, [searcher, recentList]);
  const wide = layout !== 'phone' && layout !== 'tablet';
  // Desktop: A and R open the pickers, unless typing somewhere or a picker is up.
  useEffect(() => {
    if (!wide) return undefined;
    /** @param {KeyboardEvent} e */
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || picking) return;
      if (/** @type {Element} */ (e.target).closest?.('input, textarea, select, [contenteditable]')) return;
      const side = /** @type {Record<string, Side | undefined>} */ ({a: 'A', r: 'B'})[e.key.toLowerCase()];
      if (!side) return;
      e.preventDefault();
      dispatch(openPicker(army, getState(), side));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [wide, picking, army]);
  /** @param {Side} side */
  const sideBox = (side) => (picked[side]
    ? <SideCard side={side} view={view} onOpenPicker={openSide(side)}
      onUpgrade={(pick) => dispatch(setUpgrade(army, getState(), side, pick))} />
    : <EmptySlot side={side} recents={recentHits[side]} hint={wide} onOpenPicker={openSide(side)}
      onPick={(hit) => dispatch(pickTrooper(army, side, hit, {state: getState()}))} />);
  const cardA = sideBox('A');
  const cardB = sideBox('B');
  const range = <RangeSelector view={view} />;
  const clear = view.hasSelection && (
    <div className="setup-actions">
      <button type="button" className="chip" onClick={() => dispatch({type: 'clearSides'})}>{t('matchup.clearBoth')}</button>
      {view.params && (
        <button type="button" className="chip" onClick={() => dispatch({type: 'openInClassic', params: /** @type {import('../types.js').Params} */ (view.params)})}>{t('matchup.modifyInClassic')}</button>
      )}
    </div>
  );
  const error = /** @type {import('react').ReactNode} */ ((armyError || searchError) && (
    <>
      {armyError && <LoadFailed what={t('load.armyData')} onRetry={retryArmy} />}
      {searchError && <LoadFailed what={t('load.trooperList')} onRetry={retrySearch} />}
    </>
  ));
  const mods = view.ledger && result && <Ledger {...view.ledger} />;
  // Phone and tablet: the full-screen picker; wider: the two-pane overlay.
  const deskPicker = usesDialogs(layout);
  const picker = picking && (deskPicker
    ? <DeskPicker searcher={searcher} army={army} loadError={searchError ? retrySearch : null} />
    : <TrooperPicker side={picking} searcher={searcher} army={army} loadError={searchError ? retrySearch : null}
      onPick={(hit) => dispatch(pickTrooper(army, picking, hit))} />);

  if (layout === 'phone') {
    return (
      <>
        <main className="screen">
          {error}{cardA}{range}{cardB}{clear}
        </main>
        <ResultsCard {...resultProps} />
        {picker}
      </>
    );
  }
  // Tablet and desktop: the same pieces in columns (useLayout.js).
  const setup = <div className="col setup">{error}{cardA}{range}{cardB}{clear}</div>;
  return (
    <>
      <main className={`workbench ${layout}`}>
        {layout === 'tablet' ? (
          <>
            {error}
            <div className="sides">{cardA}{cardB}</div>
            {range}
            {clear}
            <ResultsPanel {...resultProps} />
            {mods && <div className="mods-grid">{mods}</div>}
          </>
        ) : layout === 'landscape' ? (
          <>
            {setup}
            <div className="col"><ResultsPanel {...resultProps} />{mods && <div className="mods-grid">{mods}</div>}</div>
          </>
        ) : (
          <>
            {setup}
            <div className="col"><ResultsPanel {...resultProps} /></div>
            <div className={`col${layout === 'wide' ? ' mods-grid' : ''}`}>{mods ?? (!view.complete && (
              <div className="mods-wait"><span className="c-active">{t('ledger.mods', {side: t('side.active')}).toLocaleUpperCase(t.lang)}</span>
                <span className="c-reactive">{t('ledger.mods', {side: t('side.reactive')}).toLocaleUpperCase(t.lang)}</span>
                <span className="small">{t('matchup.modsWait')}</span></div>
            ))}</div>
          </>
        )}
      </main>
      {picker}
    </>
  );
}
