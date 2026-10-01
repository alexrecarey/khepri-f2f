import {useEffect, useMemo, useState} from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import './App.css'
import {
  Alert,
  Container,
  Grid,
  IconButton,
  Link,
  Stack,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";
import {useAtom} from 'jotai'
import {atomWithStorage} from 'jotai/utils'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {useSearchParams} from "react-router-dom";

import CalculatorColumn from "./CalculatorColumn.jsx";
import {CustomAppBar} from "./components/CustomAppBar.jsx";
import ModeTabs, {MODES} from "./components/ModeTabs.jsx";
import FaceToFaceResultCard from "./display/FaceToFaceResultCard.jsx";
import {useSavedResults} from "./display/savedResults.js";
import {PARAM_KEYS, paramsKey, parseParams} from "./engine/params.js";
import useEngine from "./engine/useEngine.js";
import UnitLoader from "./matchup/UnitLoader.jsx";
import {decodeMatchup, encodeMatchup} from "./matchup/matchupParams.js";
import useMatchup from "./matchup/useMatchup.js";
import {makeTheme, themeAtom} from "./theme.js";

// 'basic' = the original inputs only; 'matchup' = unit picker on top of them.
// Read on init: the first render must already know the saved mode, or it would
// write the default into the URL and overwrite the preference.
export const modeAtom = atomWithStorage('calculatorMode', MODES.basic, undefined, {unstable_getOnInit: true})

function App() {
  const [selectedTheme] = useAtom(themeAtom)
  const theme = useMemo(() => makeTheme(selectedTheme), [selectedTheme]);
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
  // A tab switch is a new history entry, so Back returns to the other mode.
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

  // Shock is Matchup-only (it depends on the target's VITA); Basic mode has no
  // input for it, so a value left over from Matchup mode must not count.
  const engineParams = useMemo(
    () => (matchupMode ? params : {...params, shockA: false, shockB: false}),
    [params, matchupMode],
  );
  const engine = useEngine(engineParams);
  const saved = useSavedResults();

  const [showOverrides, setShowOverrides] = useState(false)
  const matchup = useMatchup({
    enabled: matchupMode,
    calculate: engine.calculate,
    onApply: applyInputs,
    initial: initialMatchup,
    // A link with calculator values (maybe overridden by hand) keeps them.
    keepCalcParams: PARAM_KEYS.some((k) => initialParams.has(k)),
  });
  // Extra share-link params: the mode always, the matchup picks in Matchup mode.
  const shareParams = {
    mode: calcMode,
    ...(matchupMode ? encodeMatchup({
      selA: matchup.A.sel, selB: matchup.B.sel, ftSize: matchup.ftSize, rangeCm: matchup.rangeCm,
    }) : {}),
  };
  // Saved with the result so its share link stays correct.
  const result = engine.result && {...engine.result, share: shareParams};
  const renameResult = (title) => engine.setResult((r) => ({...r, title}));

  const column = (side) => (
    <Grid xs={12} sm={6} lg={4} xl={3} item>
      <CalculatorColumn side={side} params={params} setParam={setParam} matchup={matchup} matchupMode={matchupMode}
                        overridesOpen={showOverrides} onToggleOverrides={() => setShowOverrides((v) => !v)}/>
    </Grid>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <CustomAppBar/>
      <Container maxWidth='xl'>
        <ModeTabs mode={calcMode} onChange={setCalcMode}/>
        <Grid container spacing={2}>
          {matchupMode && <Grid item xs={12}>
            <UnitLoader matchup={matchup}/>
          </Grid>}
          {column('A')}
          {column('B')}
          {/* Matchup mode: no result until both sides are fully chosen. */}
          {(!matchupMode || matchup.complete) && <Grid xs={12} sm={12} lg={4} xl={6} item>
            <FaceToFaceResultCard
              f2fResults={result}
              addToCompare={() => saved.add(result)}
              changeName={renameResult}
            />
            <Typography variant="caption" color="text.secondary">{engine.status}</Typography>
          </Grid>}
          {saved.saved.length > 0 && <Grid item xs={12}>
            <Stack justifyContent="center" direction="row">
            <Typography variant="h5">Saved Results</Typography>
              <IconButton onClick={saved.clear}><Tooltip title="Delete all results"><DeleteSweepIcon/></Tooltip></IconButton>
              <IconButton onClick={saved.downloadCsv}><Tooltip title="Download CSV of results"><FileDownloadIcon/></Tooltip></IconButton>
            </Stack>
          </Grid>}
          {saved.saved.map((r, index) => (
            <Grid xs={12} sm={12} lg={4} xl={6} item key={r.id}>
              <FaceToFaceResultCard
                f2fResults={r}
                changeName={saved.rename(r.id)}
                remove={saved.remove}
                index={index}
                variant='list'
              />
            </Grid>
          ))}
          <Grid>
            {matchupMode && <Alert severity="warning">
              Matchup mode is a new feature that might still have bugs issues. Feedback is greatly appreciated!
            </Alert>}
            <Typography color="text.secondary" variant="body2" sx={{marginTop: 4, marginLeft: 2, marginRight: 2}}>
              Made with ❤️ for the Infinity community by Khepri and Bebop.
              Contact me with any bugs or suggestions on the <Link href="https://www.infinitygloballeague.com/">
              IGL Discord</Link> or on the Corvus Belli forums.
              Source code <Link href="https://github.com/alexrecarey/khepri-f2f"> available on github</Link>.
              Powered by the amazing <Link href="https://github.com/HighDiceRoller/icepool">icepool library</Link>.
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{marginTop: 1, marginLeft: 2, marginRight: 2}}>
              Looking for the <Link href="https://n4.infinitythecalculator.com">N4 Calculator</Link>?
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  )
}

export default App
