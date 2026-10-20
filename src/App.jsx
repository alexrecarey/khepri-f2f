import {useEffect, useMemo} from 'react'
import PropTypes from 'prop-types'

import './ui/app.css'
import useEngine from "./engine/useEngine.js";
import {useArmy} from "./data/army.js";
import {dispatch, useAppState} from "./state/store.js";
import {useLanguage} from "./state/language.js";
import useMatchupView from "./state/useMatchupView.js";
import ClassicScreen from "./ui/ClassicScreen.jsx";
import MatchupScreen from "./ui/MatchupScreen.jsx";
import {AboutPage, Menu, SettingsPage, Toast} from "./ui/Chrome.jsx";
import {AboutDialog, HeaderButtons, SettingsDialog} from "./ui/DeskMenu.jsx";
import SavedRolls from "./ui/SavedRolls.jsx";
import {MoreIcon} from "./ui/icons.jsx";
import {MODES} from './state/modes.js';
import {useSearcher} from "./ui/picker/useTrooperSearch.js";
import useLayout, {usesDialogs} from "./ui/useLayout.js";

// The whole app is a function of the state document (src/state): the mode
// picks the screen, the screens read their slices, and the engine runs on the
// calculator params that the current mode derives.
function App() {
  const mode = useAppState((s) => s.mode);
  const classic = useAppState((s) => s.classic);
  const matchupMode = mode === MODES.matchup;
  const layout = useLayout();

  const lang = useLanguage();
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const {army, error: armyError, retry: retryArmy} = useArmy(matchupMode, lang);
  const view = useMatchupView(army);

  // Shock is Matchup-only (it depends on the target's VITA); the classic
  // calculator has no input for it, so it never counts there. An incomplete
  // matchup has no params and calculates nothing.
  const engineParams = useMemo(
    () => (matchupMode ? view.params ?? null : {...classic, shockA: false, shockB: false}),
    [matchupMode, view.params, classic],
  );
  const engine = useEngine(engineParams);
  // The roll on screen, for the desktop Settings' headline previews.
  const results = useMemo(() => ({
    result: matchupMode ? (view.complete ? engine.result : null) : engine.result,
    targets: matchupMode ? view.targets : null,
    params: engineParams,
  }), [matchupMode, view.complete, view.targets, engine.result, engineParams]);
  const dialogs = usesDialogs(layout);

  return (
    <div className={`app ${layout}`}>
      <header className="app-header">
        <span className="wordmark">INFINITY THE CALCULATOR{!matchupMode && layout === 'phone' && <small> · CLASSIC</small>}</span>
        {layout !== 'phone' && (
          <span className="mode-switch" role="group" aria-label="Calculator">
            {[[MODES.matchup, 'Matchup'], [MODES.basic, 'Classic']].map(([m, name]) => (
              <button type="button" key={m} className={mode === m ? 'on' : ''} aria-pressed={mode === m}
                onClick={() => dispatch({type: 'setMode', mode: m})}>{name}</button>
            ))}
          </span>
        )}
        {dialogs
          ? <HeaderButtons />
          : <button type="button" className="icon-btn" aria-label="Menu" onClick={() => dispatch({type: 'openOverlay', overlay: 'menu'})}><MoreIcon /></button>}
      </header>
      {matchupMode
        ? <MatchupScreen army={army} armyError={armyError} retryArmy={retryArmy} view={view} engine={engine} />
        : <ClassicScreen params={classic} engine={engine} />}
      <Overlays dialogs={dialogs} results={results} />
      <Toast />
    </div>
  )
}

// The menu and its pages. Their own component, so opening or closing one
// re-renders only this, not the screen behind. `dialogs`: wide layouts, where
// the header buttons open them as dialogs (DeskMenu.jsx).
function Overlays({dialogs, results}) {
  const overlay = useAppState((s) => s.ui.overlay);
  // Settings lists the factions; the search index has them without the army data.
  const {searcher} = useSearcher(overlay === 'settings', useLanguage());
  const factions = searcher?.factions ?? [];
  if (overlay === 'menu') return <Menu />;
  if (overlay === 'saved') return <SavedRolls />;
  if (overlay === 'settings') return dialogs ? <SettingsDialog factions={factions} results={results} /> : <SettingsPage factions={factions} />;
  if (overlay === 'about') return dialogs ? <AboutDialog /> : <AboutPage />;
  return null;
}

Overlays.propTypes = {dialogs: PropTypes.bool.isRequired, results: PropTypes.object.isRequired};

export default App
