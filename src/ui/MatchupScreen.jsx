// The matchup calculator: two side cards with the range selector between
// them, the results card pinned below. Everything comes from the state
// document (src/state) and its derived matchup view; this file only lays it
// out and turns taps into actions.
import {useCallback, useEffect, useMemo} from 'react';
import PropTypes from 'prop-types';
import {openPicker, pickTrooper} from '../state/actions.js';
import {recentsFor} from '../state/schema.js';
import {dispatch, getState, useAppState} from '../state/store.js';
import TrooperPicker from './picker/TrooperPicker.jsx';
import DeskPicker from './picker/DeskPicker.jsx';
import {useSearcher} from './picker/useTrooperSearch.js';
import LoadFailed from './LoadFailed.jsx';
import ResultsCard, {ResultsPanel} from './ResultsCard.jsx';
import Ledger from './Ledger.jsx';
import RangeSelector from './RangeSelector.jsx';
import SideCard, {EmptySlot} from './SideCard.jsx';
import useLayout from './useLayout.js';
import {matchupRollSummary} from '../state/rolls.js';
import useRollResults from './useRollResults.js';

export default function MatchupScreen({army, armyError, retryArmy, view, engine}) {
  const picking = useAppState((st) => (st.ui.overlay === 'picker' ? st.ui.picker.side : null));
  const {searcher, error: searchError, retry: retrySearch} = useSearcher(true);
  const result = view.complete ? engine.result : null;
  // Summarized once here; the card, the panel and Save all read it.
  const summaryOf = useCallback((s) => (view.complete ? matchupRollSummary(view, s) : null), [view]);
  const {s, save} = useRollResults({result, targets: view.targets, summaryOf, pending: engine.pending});

  const layout = useLayout();
  const resultProps = {
    s,
    save,
    pending: engine.pending,
    status: view.complete ? engine.status : 'Choose both troopers to see the odds',
    diceLine: view.ledger ? {active: view.ledger.ledger.A?.dice, reactive: view.ledger.ledger.B?.dice} : null,
    ledger: view.ledger,
  };
  const openSide = (side) => () => dispatch(openPicker(army, getState(), side));
  const picked = {A: view.A.resolved?.unit != null, B: view.B.resolved?.unit != null};
  resultProps.picked = picked;
  // Empty slots offer the side's last three picks; the same list as that
  // side's picker shows under Recent.
  const recentList = useAppState((st) => st.lists.recents);
  const recentHits = useMemo(() => {
    const hits = (side) => {
      if (!searcher) return [];
      const ids = recentsFor(recentList, side).map((r) => searcher.findRow(r)).filter((id) => id != null);
      return searcher.browse({factionId: null, recentIds: ids}).recent.slice(0, 3);
    };
    return {A: hits('A'), B: hits('B')};
  }, [searcher, recentList]);
  const wide = layout !== 'phone' && layout !== 'tablet';
  // Desktop: A and R open the pickers, unless typing somewhere or a picker is up.
  useEffect(() => {
    if (!wide) return undefined;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || picking) return;
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
      const side = {a: 'A', r: 'B'}[e.key.toLowerCase()];
      if (!side) return;
      e.preventDefault();
      dispatch(openPicker(army, getState(), side));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [wide, picking, army]);
  const sideBox = (side) => (picked[side]
    ? <SideCard side={side} view={view} onOpenPicker={openSide(side)} />
    : <EmptySlot side={side} recents={recentHits[side]} hint={wide} onOpenPicker={openSide(side)}
      onPick={(hit) => dispatch(pickTrooper(army, side, hit, {state: getState()}))} />);
  const cardA = sideBox('A');
  const cardB = sideBox('B');
  const range = <RangeSelector view={view} />;
  const clear = view.hasSelection && (
    <button type="button" className="chip" style={{alignSelf: 'center', justifySelf: 'center'}} onClick={() => dispatch({type: 'clearSides'})}>Clear both troopers</button>
  );
  const error = (armyError || searchError) && (
    <>
      {armyError && <LoadFailed what="the army data" onRetry={retryArmy} />}
      {searchError && <LoadFailed what="the trooper list" onRetry={retrySearch} />}
    </>
  );
  const mods = view.ledger && result && <Ledger {...view.ledger} />;
  // Phone and tablet: the full-screen picker; wider: the two-pane overlay.
  const deskPicker = layout === 'landscape' || layout === 'desktop' || layout === 'wide';
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
              <div className="mods-wait"><span className="c-active">ACTIVE MODS</span><span className="c-reactive">REACTIVE MODS</span>
                <span className="small">Every modifier, with where it came from, once both sides are set.</span></div>
            ))}</div>
          </>
        )}
      </main>
      {picker}
    </>
  );
}

MatchupScreen.propTypes = {
  army: PropTypes.object,
  armyError: PropTypes.any,
  retryArmy: PropTypes.func,
  view: PropTypes.object.isRequired,
  engine: PropTypes.object.isRequired,
};
