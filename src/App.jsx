import {useState, useEffect, useRef, useMemo, useCallback} from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import './App.css'
import {any, assoc, clone, findIndex, propEq, remove, update} from "ramda";
import {
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Link,
  Stack,
  Typography,
  ThemeProvider,
  Tooltip, Alert,
} from "@mui/material";
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { createTheme } from '@mui/material/styles';
import {grey} from "@mui/material/colors";
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// Data input
import SuccessValueInput from "./inputs/SuccessValueInput.jsx";
import DamageInput from "./inputs/DamageInput.jsx";
import ArmorInput from "./inputs/ArmorInput.jsx";
import AmmoInput from "./inputs/AmmoInput.jsx";
import BurstInput from "./inputs/BurstInput.jsx";

// Data display
import FaceToFaceResultCard from "./display/FaceToFaceResultCard.jsx";
import OtherInputs from "./inputs/OtherInputs.jsx";
import BTSInput from "./inputs/BTSInput.jsx";
import {useSearchParams} from "react-router-dom";
import validateParams from "./inputs/validateParams.js";
import curry from "ramda/src/curry";
import {CustomAppBar} from "./componets/CustomAppBar.jsx";
import UnitLoader from "./units/UnitLoader.jsx";
import FireteamPurityInput from "./units/FireteamPurityInput.jsx";
import WeaponSelect from "./units/WeaponSelect.jsx";
import RangeInput from "./units/RangeInput.jsx";
import CoverInput from "./units/CoverInput.jsx";
import OverridesSection from "./units/OverridesSection.jsx";
import useMatchup from "./units/useMatchup.js";
import {decodeMatchup, encodeMatchup} from "./units/matchupParams.js";
import {PARAM_KEYS} from "./units/previews.js";
import {createF2fClient} from "./lib/f2fClient.js";
import ModeTabs, {MODES} from "./componets/ModeTabs.jsx";

export const themeAtom = atomWithStorage('selectedTheme', 'dark')
// 'basic' = the original inputs only; 'matchup' = unit picker on top of them.
// Read on init: the first render must already know the saved mode, or it would
// write the default into the URL and overwrite the preference.
export const modeAtom = atomWithStorage('calculatorMode', MODES.basic, undefined, {unstable_getOnInit: true})

function App() {
  // App Status
  const [statusMessage, setStatusMessage] = useState("(loading...)");
  const workerRef = useRef(null);
  // Promise-based side channel to the same worker, used for weapon previews.
  const clientRef = useRef(null);
  const previewCalculate = useCallback((params) => {
    if (!clientRef.current) return Promise.reject(new Error('worker not ready'));
    return clientRef.current.calculate(params, {quiet: true});
  }, []);

  // theme
  const [selectedTheme, ] = useAtom(themeAtom)
  const [storedMode, setStoredMode] = useAtom(modeAtom)

  // Search params
  let [searchParams, setSearchParams] = useSearchParams();
  let p = validateParams(searchParams);
  // The URL as first opened; calculator and matchup params are cleared from the
  // address bar once applied, so read share-link state from this copy.
  const [initialParams] = useState(() => new URLSearchParams(searchParams));
  const [initialMatchup] = useState(() => decodeMatchup(initialParams));

  // Mode lives in the URL (?mode=basic|matchup) so links and back/forward
  // keep it; a URL without one falls back to the saved preference.
  const urlMode = Object.values(MODES).includes(searchParams.get('mode')) ? searchParams.get('mode') : null;
  const calcMode = urlMode ?? storedMode;
  useEffect(() => {
    if (urlMode && urlMode !== storedMode) setStoredMode(urlMode);
  }, [urlMode]);
  // A tab switch is a new history entry, so Back returns to the other mode.
  const setCalcMode = (mode) => {
    setStoredMode(mode);
    setSearchParams({mode});
  };

  // Inputs Player A
  const [burstA, setBurstA] = useState(p.burstA);
  const [bonusBurstA, setBonusBurstA] = useState(p.bonusBurstA);
  const [successValueA, setSuccessValueA] = useState(p.successValueA);
  const [damageA, setDamageA] = useState(p.damageA);
  const [armA, setArmA] = useState(p.armA);
  const [btsA, setBtsA] = useState(p.btsA);
  const [ammoA, setAmmoA] = useState(p.ammoA);
  const [contA, setContA] = useState(p.contA);
  const [critImmuneA, setCritImmuneA] = useState(p.critImmuneA);
  const [dtwVsDodge, setDtwVsDodge] = useState(p.dtwVsDodge);

  // Inputs Player B
  const [burstB, setBurstB] = useState(p.burstB);
  const [bonusBurstB, setBonusBurstB] = useState(p.bonusBurstB);
  const [successValueB, setSuccessValueB] = useState(p.successValueB);
  const [damageB, setDamageB] = useState(p.damageB);
  const [armB, setArmB] = useState(p.armB);
  const [btsB, setBtsB] = useState(p.btsB);
  const [ammoB, setAmmoB] = useState(p.ammoB);
  const [contB, setContB] = useState(p.contB);
  const [critImmuneB, setCritImmuneB] = useState(p.critImmuneB);
  const [fixedFaceToFace, setFixedFaceToFace] = useState(p.fixedFaceToFace);

  // Bulk update from a unit profile (UnitLoader). React 18 batches the setters
  // into one render, so the calculation effect below runs once.
  const setters = {
    burstA: setBurstA, bonusBurstA: setBonusBurstA, successValueA: setSuccessValueA, damageA: setDamageA,
    armA: setArmA, btsA: setBtsA, ammoA: setAmmoA, contA: setContA, critImmuneA: setCritImmuneA,
    dtwVsDodge: setDtwVsDodge,
    burstB: setBurstB, bonusBurstB: setBonusBurstB, successValueB: setSuccessValueB, damageB: setDamageB,
    armB: setArmB, btsB: setBtsB, ammoB: setAmmoB, contB: setContB, critImmuneB: setCritImmuneB,
    fixedFaceToFace: setFixedFaceToFace,
  };
  const applyInputs = (partial) => {
    Object.entries(partial).forEach(([key, value]) => {
      if (value !== undefined && setters[key]) setters[key](value);
    });
  };
  const [showOverrides, setShowOverrides] = useState(false)
  const matchup = useMatchup({
    enabled: calcMode === MODES.matchup,
    calculate: previewCalculate,
    onApply: applyInputs,
    initial: initialMatchup,
    // A link with calculator values (maybe overridden by hand) keeps them.
    keepCalcParams: PARAM_KEYS.some((k) => initialParams.has(k)),
  });
  // Extra share-link params: the mode always, the matchup picks in Matchup mode.
  const shareParams = {
    mode: calcMode,
    ...(calcMode === MODES.matchup ? encodeMatchup({
      selA: matchup.A.sel, selB: matchup.B.sel, ftSize: matchup.ftSize, rangeCm: matchup.rangeCm,
    }) : {}),
  };

  // Outputs
  const [f2fResults, setF2fResults] = useState(null);

  // Saved Result list
  const [savedResults, setSavedResults] = useState([]);

  // Theme
  const getDesignTokens = (mode) => ({
    palette: {
      mode: mode,
      ...(mode === 'light') ? {
        primary: {
          main: '#217a79'
        },
        background: {
          default: grey[100],
        },
        reactive: {
          light: '#f3cbd3',
          main: '#b14d8e',
          dark: '#6c2167',
          100: '#f3cbd3',
          200: '#eaa9bd',
          300: '#dd88ac',
          400: '#ca699d',
          500: '#b14d8e',
          600: '#91357d',
          700: '#6c2167',
        },
        active: {
          light: '#d3f2a3',
          main: '#217a79',
          dark: '#074050',
          100: '#d3f2a3',
          200: '#97e196',
          300: '#6cc08b',
          400: '#4c9b82',
          500: '#217a79',
          600: '#105965',
          700: '#074050',
        },
        failure: {
          100: grey[100],
        },
        appbar: grey[100],
      } : {
        primary: {
          main: '#6cc08b',
        },
        reactive: {
          700: '#f3cbd3',
          600: '#eaa9bd',
          500: '#dd88ac',
          400: '#ca699d',
          300: '#b14d8e',
          200: '#91357d',
          100: '#6c2167',
        },
        active: {
          700: '#d3f2a3',
          600: '#97e196',
          500: '#6cc08b',
          400: '#4c9b82',
          300: '#217a79',
          200: '#105965',
          100: '#074050',
        },
        failure: {
          300: '#424242',
          200: '#212121',
          100: '#121212',
        },
        appbar: '#121212',
      }
    }
  })

  let mode = selectedTheme === 'dark' ? 'dark' : 'light';
  const theme = createTheme(useMemo(() => createTheme(getDesignTokens(mode)), [mode]));

  // Worker message received
  const messageReceived = (msg) => {
    // Preview replies carry a requestId and are resolved by the client, not shown.
    if (clientRef.current?.handleMessage(msg)) return;
    if(msg.data.command === 'result'){
      let value = msg.data.value;
      let cl = clone(value);
      setF2fResults(cl);
      setStatusMessage(`Done! Took ${msg.data.elapsed}ms to calculate all ${msg.data.totalRolls.toLocaleString()} possible rolls.`);
    } else if (msg.data.command === 'status'){
      if(msg.data.value === 'ready'){
        // This handler is bound once at mount; use the latest rollDice so inputs
        // set before the worker was ready (e.g. from a share link) are used.
        rollDiceRef.current()
      }
    }
  }

  const workerError = (error) => {
    console.log(`Worker error: ${error.message} \n`);
    setStatusMessage(`Worker error: ${error.message}`);
    clientRef.current?.rejectAll(error);
    throw error;
  };

  // First load
  useEffect(() => {
    setStatusMessage("Loading icepool engine");
    const run = async () => {
      // Web workers without comlink
      workerRef.current = new Worker(new URL('./python.worker.js', import.meta.url),);
      clientRef.current = createF2fClient(workerRef.current);
      workerRef.current.onmessage = messageReceived
      workerRef.current.onerror = workerError
      workerRef.current.postMessage({command:'init'});
    }
    run();
  }, []);

  useEffect( ()=> {
    rollDice();
    // Drop any shared calculator params once applied, but keep the mode.
    setSearchParams({mode: calcMode}, {replace: true});
  },[
    burstA, bonusBurstA, successValueA, damageA, armA, btsA, ammoA, contA, critImmuneA,
    burstB, bonusBurstB, successValueB, damageB, armB, btsB, ammoB, contB, critImmuneB,
    dtwVsDodge, fixedFaceToFace
  ]);


  const rollDiceRef = useRef(null);
  const rollDice = async () => {
    // get result from worker
    let parameters = {
      successValueA: successValueA, burstA: burstA, bonusBurstA: bonusBurstA, damageA: damageA, armA: armA, btsA: btsA,
      ammoA: ammoA, contA: contA, critImmuneA: critImmuneA,
      successValueB: successValueB, burstB: burstB, bonusBurstB: bonusBurstB, damageB: damageB, armB: armB, btsB: btsB,
      ammoB: ammoB, contB: contB, critImmuneB: critImmuneB,
      dtwVsDodge: dtwVsDodge, fixedFaceToFace: fixedFaceToFace
    }
    await workerRef?.current?.postMessage?.({command: 'calculate', data: parameters})
  };
  rollDiceRef.current = rollDice;

  const addResultToCompareList = () => {
    if(any(propEq(f2fResults.id, 'id'))(savedResults)){
      console.log("Not adding, duplicate key")
    } else {
      // Snapshot the share params so the saved result's link stays correct.
      setSavedResults(prevState =>  clone([... prevState, {...f2fResults, share: shareParams}]));
    }
  }

  const updateResultTitle = (name) => {
    setF2fResults(prevState => {
      console.log(`Updating result title to "${name}"`)
      return assoc('title', name, prevState);
    })
  }

  const changeSavedResultName = (id, name) => {
    console.log(`received request to change saved result name with id ${id} and title ${name}`)
    setSavedResults(prevState => {
      console.log('changeing saved results list. current value:');
      console.log(prevState)

      let index = findIndex(propEq(id, 'id'))(prevState);
      console.log(`changing index ${index}`)
      let newSavedResults = update(index, assoc('title', name, prevState[index]))(prevState);
      console.log('New saved results');
      console.log(newSavedResults);
      return newSavedResults;
    })
  }
  const curriedChangeSavedResultName = curry(changeSavedResultName);

  const deleteResultFromCompareList = (id) => {
    let index = findIndex(propEq(id, 'id'))(savedResults);
    if(index >= 0){
      setSavedResults(prevState => remove(index, 1, prevState));
    }
  }

  const deleteAllResultsFromCompareList = () => {
    setSavedResults([]);
  }

  const downloadResultsInCSV = () => {
    // Title: Result ID, Result name,
    // F2F results: Active Win %, Reactive win %, Failure win %,
    // Parameters A: burstA, successValueA, damageA,armA, btsA, ammoA, contA, critImmuneA, dtwVsDodge,
    // Parameters B: burstB, successValueB, damageB, armB, btsB, ammoB, contB, critImmuneB,
    // Expected wounds results
    const expectedWoundsHeaders = ["player", "wounds", "raw_chance", "cumulative_chance", "chance"];
    const parametersHeaders = ['burstA', 'successValueA', 'damageA', 'armA', 'btsA', 'ammoA', 'contA', 'critImmuneA',
      'dtwVsDodge', 'burstB', 'successValueB', 'damageB', 'armB', 'btsB', 'ammoB', 'contB', 'critImmuneB'];
    let csvContent = "data:text/csv;charset=utf-8,";
    let headers =  "result id,title," + parametersHeaders.join(',') + ',' + expectedWoundsHeaders.join(',') + '\n';
    let rows = savedResults.map((result, idx) => {
      let paramValues = parametersHeaders.map(e => result['parameters'][e]);
      return result.expected_wounds.map((row) => {
        let title = result.title ? result.title : `Saved Result ${idx + 1}`;
        let titleFields = `${result.id},${title},`;
      return titleFields + paramValues.join(',') + ',' + (expectedWoundsHeaders.map(header => row[header]).join(","));
    }).join('\n')}).join('\n');

    let encodedUri = encodeURI(csvContent + headers + rows);
    window.open(encodedUri);
  }

  // Small calculations for titles if plasma
  let armorTitleA = ammoB === "PLASMA" ? "ARM" : "ARM / BTS"
  let armorTitleB = ammoA === "PLASMA" ? "ARM" : "ARM / BTS"
  // In Matchup mode the unit picker sets burst, SD, ammo and the other flags.
  const showDerivedInputs = calcMode !== MODES.matchup
  // Raw value scales. In Matchup mode they sit in a collapsible "Overrides"
  // section (open/closed shared by both columns).
  const burstInputA = <BurstInput burst={burstA} update={setBurstA} title="Burst"
                                  tooltip="Final burst after bonuses (fire team, multiple combatants in CC, etc). You can
                                  set Reactive burst to 0 to calculate unopposed shots by double clicking on the die or
                                  typing 0 in the value box."/>
  const burstInputB = <BurstInput burst={burstB} update={setBurstB} variant='reactive' title="Burst"
                                  tooltip="Final burst after bonuses (fire team, multiple combatants in CC, etc). You can
                                  set Reactive burst to 0 to calculate unopposed shots by double clicking on the die or
                                  typing 0 in the value box."/>
  // Matchup mode also offers Burst here: a trooper may split their shots
  // between targets.
  const scalesA = <>
    {!showDerivedInputs && burstInputA}
    {dtwVsDodge === false &&
      <SuccessValueInput successValue={successValueA} update={setSuccessValueA} title="Success Value"
                         tooltip="Target Success Value for player after all positive and negative mods
                         (fireteam, mimetism, range, cover, etc) have been applied to the BS or CC
                         attribute. Success values over 20 will cause critical hits starting at 1.
                         Remember mods cap out at +/-12."/>}
    {ammoA !== 'DODGE' &&
      <DamageInput damage={damageA} update={setDamageA} title="Weapon PS"
                   tooltip="Possiblity of Survival for the weapon being used. You must include all damage
                   mods like SR-1. You can add cover bonus here or add it to reactive player's ARM."/>}
    <ArmorInput armor={armA} update={setArmA} title={armorTitleA}
               tooltip="Final save roll value, after all modifiers. You must halve and round up if
               opposing player uses AP ammo. If a weapon only targets BTS (like breaker), use BTS value
               here. Generally I like to add the +3 cover bonus here."/>
    {ammoB === 'PLASMA' && <BTSInput bts={btsA} update={setBtsA}/>}
  </>
  const scalesB = <>
    {!showDerivedInputs && burstInputB}
    {burstB !== 0 &&
      <SuccessValueInput successValue={successValueB} update={setSuccessValueB} variant='reactive'
                         title="Success Value"
                         tooltip="Target Success Value for player after all positive and negative mods
                         (fireteam, mimetism, range, cover, etc) have been applied to the BS or CC
                         attribute. Success values over 20 will cause critical hits starting at 1.
                         Remember mods cap out at +/-12."/>}
    {dtwVsDodge === false && burstB !== 0 && ammoB !== 'DODGE' &&
      <DamageInput damage={damageB} update={setDamageB} variant='reactive' title="Weapon PS"
                   tooltip="Possiblity of Survival for the weapon being used. You must include all damage
                   mods like SR-1. You can add cover bonus here or add it to active player's ARM"/>}
    <ArmorInput armor={armB} update={setArmB} variant='reactive' title={armorTitleB}
               tooltip="Final computed armor value, after all modifiers. You must halve and round up if
               opposing player uses AP ammo. If a weapon only targets BTS (like breaker), use BTS value
               here. Generally I like to add the +3 cover bonus here."/>
    {ammoA === 'PLASMA' &&
      <BTSInput bts={btsB} update={setBtsB} variant='reactive' title="BTS"
                tooltip="BTS value. This box only shows if plasma ammo is used."/>}
  </>
  const toggleOverrides = () => setShowOverrides((v) => !v)


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <CustomAppBar/>
      <Container maxWidth='xl'>
        <ModeTabs mode={calcMode} onChange={setCalcMode}/>
        <Grid container spacing={2}>
          {calcMode === MODES.matchup && <Grid item xs={12}>
            <UnitLoader matchup={matchup}/>
          </Grid>}
          <Grid xs={12} sm={6} lg={4} xl={3} item>
            <Card style={{alignItems: "center", justifyContent: "center"}}>
              <CardContent>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{fontFamily: 'conthrax'}} gutterBottom>Active</Typography>
                  </Grid>
                  {!showDerivedInputs && <>
                    <WeaponSelect variant='active' matchup={matchup}/>
                    <RangeInput rangeCm={matchup.rangeCm} update={matchup.setRangeCm} row={matchup.A.resolved?.weapon?.row}/>
                    <CoverInput variant='active' matchup={matchup}/>
                    <FireteamPurityInput value={matchup.ftSize.A} update={(n) => matchup.setFtSize('A', n)}/>
                  </>}
                  {showDerivedInputs && <>
                  {burstInputA}
                  <BurstInput burst={bonusBurstA} update={setBonusBurstA} role='bonus' title="Special dice"
                              tooltip="Additional dies that are added to the burst but cannot be kept. Only *burst* die
                              will be kept, but *burst* + *special dice* die will be rolled. Highest die will be kept.
                              You can set to zero by double clicking any value or typing 0 into the value box"/>
                  </>}
                  {showDerivedInputs ? scalesA : <OverridesSection open={showOverrides} onToggle={toggleOverrides}>{scalesA}</OverridesSection>}
                  {showDerivedInputs && <>
                  <AmmoInput ammo={ammoA} cont={contA} update={setAmmoA} updateCont={setContA} title="Ammunition"
                             tooltip="Calculate AP ammo by halving opposing ARM/BTS manually. Dodge will use the burst
                             value, so smoke dodges in fire teams can be calculated."/>
                  <OtherInputs critImmune={critImmuneA} update={setCritImmuneA} dtwVsDodge={dtwVsDodge} updateDtw={setDtwVsDodge}/>
                  </>}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} lg={4} xl={3} item>
            <Card style={{alignItems: "center", justifyContent: "center"}}>
              <CardContent>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{fontFamily: 'conthrax'}} gutterBottom>Reactive</Typography>
                  </Grid>
                  {!showDerivedInputs && <>
                    <WeaponSelect variant='reactive' matchup={matchup}/>
                    <RangeInput rangeCm={matchup.rangeCm} update={matchup.setRangeCm} row={matchup.B.resolved?.weapon?.row} variant='reactive'/>
                    <CoverInput variant='reactive' matchup={matchup}/>
                    <FireteamPurityInput value={matchup.ftSize.B} update={(n) => matchup.setFtSize('B', n)}
                                         variant='reactive'/>
                  </>}
                  {showDerivedInputs && <>
                  {burstInputB}
                  <BurstInput burst={bonusBurstB} update={setBonusBurstB} variant='reactive' role='bonus' title="Special dice"
                              tooltip="Additional dies that are added to the burst but cannot be kept. Only *burst* die
                              will be kept, but *burst* + *special dice* die will be rolled. Highest die will be kept.
                              You can set to zero by double clicking any value or typing 0 into the value box"/>
                  </>}
                  {showDerivedInputs ? scalesB : <OverridesSection open={showOverrides} onToggle={toggleOverrides}>{scalesB}</OverridesSection>}
                  {showDerivedInputs && <>
                  <AmmoInput ammo={ammoB} cont={contB} update={setAmmoB} updateCont={setContB} variant='reactive'
                             dtw={dtwVsDodge} title="Ammunition" tooltip="Calculate AP ammo by halving opposing ARM/BTS
                             manually. Dodge will use the burst value, so smoke dodges in fire teams can be calculated."/>
                  <OtherInputs critImmune={critImmuneB} update={setCritImmuneB} variant='reactive'
                               fixedFaceToFace={fixedFaceToFace} updateFixedFaceToFace={setFixedFaceToFace}/>
                  </>}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {/* Matchup mode: no result until both sides are fully chosen. */}
          {(showDerivedInputs || matchup.complete) && <Grid xs={12} sm={12} lg={4} xl={6} item>
            <FaceToFaceResultCard
              f2fResults={f2fResults && {...f2fResults, share: shareParams}}
              addToCompare={addResultToCompareList}
              changeName={updateResultTitle}
            />
            <Typography variant="caption" color="text.secondary">{statusMessage}</Typography>
          </Grid>}
          {savedResults.length > 0 && <Grid item xs={12}>
            <Stack justifyContent="center" direction="row">
            <Typography variant="h5">Saved Results</Typography>
              <IconButton onClick={deleteAllResultsFromCompareList}><Tooltip title="Delete all results"><DeleteSweepIcon/></Tooltip></IconButton>
              <IconButton onClick={downloadResultsInCSV}><Tooltip title="Download CSV of results"><FileDownloadIcon/></Tooltip></IconButton>
            </Stack>
          </Grid>}
          {savedResults.map((result, index) => {
            return <Grid xs={12} sm={12} lg={4} xl={6} item key={result['id']}>
              <FaceToFaceResultCard
                f2fResults={result}
                changeName={curriedChangeSavedResultName(result['id'])}
                remove={deleteResultFromCompareList}
                index={index}
                variant='list'
              />
            </Grid>
          })}
          <Grid>
            <Alert severity="warning">
              This N5 version of the Infinity Dice Calculator is still beta software. Expect interface changes.
            </Alert>
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


