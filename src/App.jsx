import {useMemo} from 'react'

import './ui/app.css'
import {DEFAULT_PARAMS} from "./engine/params.js";
import useEngine from "./engine/useEngine.js";
import {useArmy} from "./data/army.js";
import {dispatch, useAppState} from "./state/store.js";
import useMatchupView from "./state/useMatchupView.js";
import ClassicScreen from "./ui/ClassicScreen.jsx";
import MatchupScreen from "./ui/MatchupScreen.jsx";
import {AboutPage, Menu, SavedPage, SettingsPage, Toast} from "./ui/Chrome.jsx";
import {MoreIcon} from "./ui/icons.jsx";
import {MODES} from "./ui/modes.js";
import {useSearcher} from "./ui/picker/useTrooperSearch.js";

// The whole app is a function of the state document (src/state): the mode
// picks the screen, the screens read their slices, and the engine runs on the
// calculator params that the current mode derives.
function App() {
  const mode = useAppState((s) => s.mode);
  const overlay = useAppState((s) => s.ui.overlay);
  const classic = useAppState((s) => s.classic);
  const matchupMode = mode === MODES.matchup;

  const {army, error: armyError} = useArmy(matchupMode);
  const view = useMatchupView(army);

  // Shock is Matchup-only (it depends on the target's VITA); the classic
  // calculator has no input for it, so it never counts there.
  const engineParams = useMemo(
    () => (matchupMode ? view.params ?? DEFAULT_PARAMS : {...classic, shockA: false, shockB: false}),
    [matchupMode, view.params, classic],
  );
  const engine = useEngine(engineParams);
  // Settings lists the factions; the search index has them without the army data.
  const searcher = useSearcher(overlay === 'settings');

  return (
    <div className="app">
      <header className="app-header">
        <span className="wordmark">INFINITY THE CALCULATOR{!matchupMode && <small> · CLASSIC</small>}</span>
        <button type="button" className="icon-btn" aria-label="Menu" onClick={() => dispatch({type: 'openOverlay', overlay: 'menu'})}><MoreIcon /></button>
      </header>
      {matchupMode
        ? <MatchupScreen army={army} armyError={armyError} view={view} engine={engine} />
        : <ClassicScreen params={classic} engine={engine} />}
      {overlay === 'menu' && <Menu />}
      {overlay === 'saved' && <SavedPage />}
      {overlay === 'settings' && <SettingsPage factions={searcher?.factions ?? []} />}
      {overlay === 'about' && <AboutPage />}
      <Toast />
    </div>
  )
}

export default App
