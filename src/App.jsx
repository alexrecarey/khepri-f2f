import {useMemo} from 'react'

import './ui/app.css'
import {DEFAULT_PARAMS} from "./engine/params.js";
import useEngine from "./engine/useEngine.js";
import {useArmy} from "./data/army.js";
import {dispatch, useAppState} from "./state/store.js";
import useMatchupView from "./state/useMatchupView.js";
import ClassicScreen from "./ui/ClassicScreen.jsx";
import MatchupScreen from "./ui/MatchupScreen.jsx";
import {MoreIcon} from "./ui/icons.jsx";
import {MODES} from "./ui/modes.js";
import {Sheet} from "./ui/Sheet.jsx";

const back = () => dispatch({type: 'back'});

function AppMenu({mode}) {
  const item = (m, text) => (
    <button type="button" className="menu-item" onClick={() => dispatch({type: 'setMode', mode: m})} aria-pressed={mode === m}>
      <span className="dot" style={{color: mode === m ? 'var(--active)' : '#555'}}>{mode === m ? '●' : '○'}</span>
      <span style={{flexGrow: 1, color: mode === m ? 'var(--text)' : 'var(--text-2)'}}>{text}</span>
      {mode === m && <span className="note">opens next time</span>}
    </button>
  );
  return (
    <Sheet onClose={back} label="Menu">
      <span className="label" style={{padding: '0 14px'}}>Calculator</span>
      <div style={{display: 'flex', flexDirection: 'column', margin: '-8px -8px 0'}}>
        {item(MODES.matchup, 'Matchup')}
        {item(MODES.basic, 'Classic — type the numbers')}
      </div>
      <div className="menu-sep" />
      <p className="note" style={{margin: '0 14px', lineHeight: 1.5}}>
        Face-to-face odds for Infinity N5. Made with ❤️ for the Infinity community by Khepri and Bebop.
        {' '}<a href="https://github.com/alexrecarey/khepri-f2f" style={{color: 'var(--active)'}}>Source on GitHub</a>
        {' · '}Powered by <a href="https://github.com/HighDiceRoller/icepool" style={{color: 'var(--active)'}}>icepool</a>
        {' · '}<a href="https://n4.infinitythecalculator.com" style={{color: 'var(--active)'}}>N4 calculator</a>
      </p>
    </Sheet>
  );
}

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

  return (
    <div className="app">
      <header className="app-header">
        <span className="wordmark">INFINITY THE CALCULATOR{!matchupMode && <small> · CLASSIC</small>}</span>
        <button type="button" className="icon-btn" aria-label="Menu" onClick={() => dispatch({type: 'openOverlay', overlay: 'menu'})}><MoreIcon /></button>
      </header>
      {matchupMode
        ? <MatchupScreen army={army} armyError={armyError} view={view} engine={engine} />
        : <ClassicScreen params={classic} engine={engine} />}
      {overlay === 'menu' && <AppMenu mode={mode} />}
    </div>
  )
}

export default App
