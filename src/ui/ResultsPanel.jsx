// Tablet and desktop: the results in their own column, always open. The mods
// go in another column (MatchupScreen). The phone's sheet is ResultsCard.jsx.
import {shareLink} from './share.js';
import ResultsBody, {SheetActions} from './ResultsBody.jsx';
import {EngineLoading, WaitPanel} from './ResultsWait.jsx';
import useResultsView from './useResultsView.js';
import {useStatesUi} from './WoundStates.jsx';
import {useT} from './i18n.jsx';

/** @param {import('../types.js').ResultsProps} props */
export default function ResultsPanel({s, status, diceLine, classic, ledger, save, pending, picked, params}) {
  const t = useT();
  const ui = useStatesUi();
  const {choice, h, b, wait} = useResultsView({s, ledger, params, picked});
  return (
    <section className="results-panel" aria-label={t('results.title')}>
      <div className="panel-head"><span className="label">{t('results.title')}</span><span className="sheet-actions"><SheetActions save={save} onShare={shareLink} /></span></div>
      {wait ? <WaitPanel picked={wait} />
        : s ? <ResultsBody s={s} h={h} choice={choice} b={b} classic={classic} ledger={ledger} diceLine={diceLine} pending={pending} ui={ui} />
        : pending ? <EngineLoading label={status} /> : <span className="empty">{status}</span>}
      {s && status && <span className="status">{status}</span>}
    </section>
  );
}

// The same props as ResultsCard (documented there).
