import {useEffect, useMemo, useState} from 'react'
import {useAtom} from 'jotai'
import {atomWithStorage} from 'jotai/utils'
import {useSearchParams} from "react-router-dom";

import './ui/app.css'
import {PARAM_KEYS, paramsKey, parseParams} from "./engine/params.js";
import useEngine from "./engine/useEngine.js";
import {decodeMatchup} from "./matchup/matchupParams.js";
import useMatchup from "./matchup/useMatchup.js";
import ClassicScreen from "./ui/ClassicScreen.jsx";
import MatchupScreen from "./ui/MatchupScreen.jsx";
import {MoreIcon} from "./ui/icons.jsx";
import {MODES} from "./ui/modes.js";
import {Sheet} from "./ui/Sheet.jsx";

// 'basic' = the classic calculator (type the numbers); 'matchup' = pick two
// troopers. The app opens in the last mode used, Matchup the first time.
// Read on init: the first render must already know the saved mode, or it would
// write the default into the URL and overwrite the preference.
export const modeAtom = atomWithStorage('calculatorMode', MODES.matchup, undefined, {unstable_getOnInit: true})

function AppMenu({mode, onMode, onClose}) {
  const item = (m, text) => (
    <button type="button" className="menu-item" onClick={() => { onMode(m); onClose(); }} aria-pressed={mode === m}>
      <span className="dot" style={{color: mode === m ? 'var(--active)' : '#555'}}>{mode === m ? '●' : '○'}</span>
      <span style={{flexGrow: 1, color: mode === m ? 'var(--text)' : 'var(--text-2)'}}>{text}</span>
      {mode === m && <span className="note">opens next time</span>}
    </button>
  );
  return (
    <Sheet onClose={onClose} label="Menu">
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

function App() {
  const [storedMode, setStoredMode] = useAtom(modeAtom)

  const [searchParams, setSearchParams] = useSearchParams();
  // The URL as first opened; calculator and matchup params are cleared from the
  // address bar once applied, so read share-link state from this copy.
  const [initialParams] = useState(() => new URLSearchParams(searchParams));
  const [initialMatchup] = useState(() => decodeMatchup(initialParams));

  // Mode lives in the URL (?mode=basic|matchup) so links and back/forward
  // keep it; a URL without one falls back to the saved preference.
  const urlMode = Object.values(MODES).includes(searchParams.get('mode')) ? searchParams.get('mode') : null;
  const calcMode = urlMode ?? storedMode;
  const matchupMode = calcMode === MODES.matchup;
  useEffect(() => {
    if (urlMode && urlMode !== storedMode) setStoredMode(urlMode);
  }, [urlMode]);
  // A mode switch is a new history entry, so Back returns to the other mode.
  const setCalcMode = (mode) => {
    setStoredMode(mode);
    setSearchParams({mode});
  };

  // The calculator params (src/engine/params.js), from a share link or defaults.
  const [params, setParams] = useState(() => parseParams(initialParams));
  const setParam = (key) => (value) => setParams((p) => ({...p, [key]: value}));
  // Bulk update from Matchup mode: the params it derived, the rest kept.
  const applyInputs = (partial) => setParams((p) => {
    const next = {...p};
    for (const k of PARAM_KEYS) if (partial[k] !== undefined) next[k] = partial[k];
    return next;
  });
  // Drop any shared calculator params once applied, but keep the mode.
  useEffect(() => {
    setSearchParams({mode: calcMode}, {replace: true});
  }, [paramsKey(params)]);

  // Shock is Matchup-only (it depends on the target's VITA); the classic
  // calculator has no input for it, so a value left over from Matchup must not count.
  const engineParams = useMemo(
    () => (matchupMode ? params : {...params, shockA: false, shockB: false}),
    [params, matchupMode],
  );
  const engine = useEngine(engineParams);

  const matchup = useMatchup({
    enabled: matchupMode,
    calculate: engine.calculate,
    onApply: applyInputs,
    initial: initialMatchup,
    // A link with calculator values (maybe overridden by hand) keeps them.
    keepCalcParams: PARAM_KEYS.some((k) => initialParams.has(k)),
    // The new weapon buttons don't show per-weapon wounds yet; skip those engine runs.
    withPreviews: false,
  });

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <span className="wordmark">INFINITY THE CALCULATOR{!matchupMode && <small> · CLASSIC</small>}</span>
        <button type="button" className="icon-btn" aria-label="Menu" onClick={() => setMenuOpen(true)}><MoreIcon /></button>
      </header>
      {matchupMode
        ? <MatchupScreen matchup={matchup} engine={engine} params={params} />
        : <ClassicScreen params={params} setParam={setParam} engine={engine} />}
      {menuOpen && <AppMenu mode={calcMode} onMode={setCalcMode} onClose={() => setMenuOpen(false)} />}
    </div>
  )
}

export default App
