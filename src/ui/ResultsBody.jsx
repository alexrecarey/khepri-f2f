// What the results say, wherever they are shown (the open phone sheet draws
// the same pieces itself, ResultsCard.jsx), and the Save and Share buttons
// both views put on their head row.
import {BookmarkIcon, ShareIcon} from './icons.jsx';
import Headline from './Headline.jsx';
import FaceToFaceChart from './FaceToFaceChart.jsx';
import {F2FBar, PickBars, useBreakdownView} from './ResultBars.jsx';
import {Breakdown, ClassicBody, WoundBar} from './ResultsDetail.jsx';
import {UnopposedSheetBody} from './Unopposed.jsx';
import {StateBar, StateList} from './WoundStates.jsx';
import {useT} from './i18n.jsx';

// Save and Share on the sheet's handle row. `save` = {saved, pending, toggle}
// or null while there is nothing to save; pending, Save is disabled.
// onShare: copies the link (ui/share.js).
/** @param {{save?: import('../types.js').SaveControl | null, onShare: (t: import('../types.js').Translator) => void}} props */
export function SheetActions({save, onShare}) {
  const t = useT();
  return (
    <>
      {save && (
        <button type="button" className={`icon-btn sm${save.saved ? ' on' : ''}`} aria-pressed={save.saved} aria-label={save.saved ? t('results.unsave') : t('results.save')}
          disabled={save.pending} onClick={save.toggle}><BookmarkIcon filled={save.saved} /></button>
      )}
      <button type="button" className="icon-btn sm" aria-label={t('results.share')} onClick={() => onShare(t)}><ShareIcon /></button>
    </>
  );
}

// h, choice, b: useResultsView.js, computed once by the panel.
/**
 * @param {{s: import('../types.js').Summary, h: import('../types.js').Headline | null, choice: import('../types.js').HeadlineChoice, b: import('../rules/bestDie.js').Breakdown | null,
 *   classic?: boolean, ledger?: import('../types.js').MatchupView['ledger'], diceLine?: import('../types.js').ResultsProps['diceLine'], pending?: boolean, ui: import('./WoundStates.jsx').StatesUi}} props
 */
export default function ResultsBody({s, h, choice, b, classic, ledger, diceLine, pending, ui}) {
  const t = useT();
  const [view, setView] = useBreakdownView();
  if (s.unopposed) return <UnopposedSheetBody s={/** @type {import('./Unopposed.jsx').UnopposedSummary} */ (s)} names={ledger?.names ?? {A: t('side.active'), B: t('side.reactive')}} diceLine={diceLine} />;
  if (classic) return <ClassicBody s={s} />;
  const showF2F = view === 'f2f' && Boolean(b);
  return (
    <>
      {/* A summary comes with its headline. */}
      <Headline h={/** @type {import('../types.js').Headline} */ (h)} choice={choice} size="xl" pending={pending} buttons />
      <div className={`res-bars${showF2F ? ' f2f-view' : ''}`}>
        <PickBars view={view} onView={setView} pick={Boolean(b)} f2fBar={<F2FBar s={s} className="res-bar" />}
          woundBar={s.states ? <StateBar s={/** @type {import('./WoundStates.jsx').StatesSummary} */ (s)} ui={ui} glyphs className="res-bar" /> : <WoundBar summary={s} className="res-bar" />} />
      </div>
      {showF2F ? <FaceToFaceChart b={/** @type {NonNullable<typeof b>} */ (b)} names={/** @type {NonNullable<typeof ledger>} */ (ledger).labels} /> : s.states ? <StateList s={/** @type {import('./WoundStates.jsx').StatesSummary} */ (s)} ui={ui} /> : <Breakdown s={s} />}
    </>
  );
}
