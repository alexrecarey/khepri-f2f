import {useState, useEffect, useRef, useMemo} from 'react'
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

export const themeAtom = atomWithStorage('selectedTheme', 'dark')

function App() {
  // App Status
  const [statusMessage, setStatusMessage] = useState("(loading...)");
  const workerRef = useRef(null);

  // theme
  const [selectedTheme, ] = useAtom(themeAtom)

  // Search params
  let [searchParams, setSearchParams] = useSearchParams();
  let p = validateParams(searchParams);

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
    if(msg.data.command === 'result'){
      let value = msg.data.value;
      let cl = clone(value);
      setF2fResults(cl);
      setStatusMessage(`Done! Took ${msg.data.elapsed}ms to calculate all ${msg.data.totalRolls.toLocaleString()} possible rolls.`);
    } else if (msg.data.command === 'status'){
      if(msg.data.value === 'ready'){
        rollDice()
      }
    }
  }

  const workerError = (error) => {
    console.log(`Worker error: ${error.message} \n`);
    setStatusMessage(`Worker error: ${error.message}`);
    throw error;
  };

  // First load
  useEffect(() => {
    setStatusMessage("Loading icepool engine");
    const run = async () => {
      // Web workers without comlink
      workerRef.current = new Worker(new URL('./python.worker.js', import.meta.url),);
      workerRef.current.onmessage = messageReceived
      workerRef.current.onerror = workerError
      workerRef.current.postMessage({command:'init'});
    }
    run();
  }, []);

  useEffect( ()=> {
    rollDice();
    setSearchParams();
  },[
    burstA, bonusBurstA, successValueA, damageA, armA, btsA, ammoA, contA, critImmuneA,
    burstB, bonusBurstB, successValueB, damageB, armB, btsB, ammoB, contB, critImmuneB,
    dtwVsDodge, fixedFaceToFace
  ]);


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

  const addResultToCompareList = () => {
    if(any(propEq(f2fResults.id, 'id'))(savedResults)){
      console.log("Not adding, duplicate key")
    } else {
      setSavedResults(prevState =>  clone([... prevState, f2fResults]));
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


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <CustomAppBar/>
      <Container maxWidth='xl'>
        <Grid container spacing={2}>
          <Grid xs={12} sm={6} lg={4} xl={3} item>
            <Card style={{alignItems: "center", justifyContent: "center"}}>
              <CardContent>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{fontFamily: 'conthrax'}} gutterBottom>Active</Typography>
                  </Grid>
                  <BurstInput burst={burstA} update={setBurstA} title="Burst"
                              tooltip="Final burst after bonuses (fire team, multiple combatants in CC, etc). You can
                              set Reactive burst to 0 to calculate unopposed shots by double clicking on the die or
                              typing 0 in the value box."/>
                  <BurstInput burst={bonusBurstA} update={setBonusBurstA} role='bonus' title="Extra dice"
                              tooltip="Additional dies that are added to the burst but cannot be kept. Only *burst* die
                              will be kept, but *burst* + *extra dice* die will be rolled. Highest die will be kept.
                              You can set to zero by double clicking any value or typing 0 into the value box"/>
                  {dtwVsDodge === false &&
                    <SuccessValueInput successValue={successValueA} update={setSuccessValueA} title="Success Value"
                                       tooltip="Target Success Value for player after all positive and negative mods
                                       (fireteam, mimetism, range, cover, etc) have been applied to the BS or CC
                                       attribute. Success values over 20 will cause critical hits starting at 1.
                                       Remember mods cap out at +/-12."/>}
                  {ammoA !== 'DODGE' &&
                    <DamageInput damage={damageA} update={setDamageA} title="Save Roll"
                                 tooltip="Final saving roll value of weapon being used. You must include all damage mods
                                 like SR-1. You should add cover bonus here."/>}
                  <ArmorInput armor={armA} update={setArmA} title={armorTitleA}
                              tooltip="Final computed armor value, after all modifiers. You must halve and round up if
                              opposing player uses AP ammo. If a weapon only targets BTS (like breaker), use BTS value
                              here"/>
                  {ammoB === 'PLASMA' && <BTSInput bts={btsA} update={setBtsA}/>}
                  <AmmoInput ammo={ammoA} cont={contA} update={setAmmoA} updateCont={setContA} title="Ammunition"
                             tooltip="Calculate AP ammo by halving opposing ARM/BTS manually. Dodge will use the burst
                             value, so smoke dodges in fire teams can be calculated."/>
                  <OtherInputs critImmune={critImmuneA} update={setCritImmuneA} dtwVsDodge={dtwVsDodge} updateDtw={setDtwVsDodge}/>
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
                  <BurstInput burst={burstB} update={setBurstB} variant='reactive' title="Burst"
                              tooltip="Final burst after bonuses (fire team, multiple combatants in CC, etc). You can
                              set Reactive burst to 0 to calculate unopposed shots by double clicking on the die or
                              typing 0 in the value box."/>
                  <BurstInput burst={bonusBurstB} update={setBonusBurstB} variant='reactive' role='bonus' title="Extra dice"
                              tooltip="Additional dies that are added to the burst but cannot be kept. Only *burst* die
                              will be kept, but *burst* + *extra dice* die will be rolled. Highest die will be kept.
                              You can set to zero by double clicking any value or typing 0 into the value box"/>
                  {burstB !== 0 &&
                    <SuccessValueInput successValue={successValueB} update={setSuccessValueB} variant='reactive'
                                       title="Success Value"
                                       tooltip="Target Success Value for player after all positive and negative mods
                                       (fireteam, mimetism, range, cover, etc) have been applied to the BS or CC
                                       attribute. Success values over 20 will cause critical hits starting at 1.
                                       Remember mods cap out at +/-12."/>}
                  {dtwVsDodge === false && burstB !== 0 && ammoB !== 'DODGE' &&
                    <DamageInput damage={damageB} update={setDamageB} variant='reactive' title="Save Roll"
                                 tooltip="Final saving roll value of weapon being used. You must include all damage mods
                                 like SR-1. You should add cover bonus here."/>}
                  <ArmorInput armor={armB} update={setArmB} variant='reactive' title={armorTitleB}
                              tooltip="Final computed armor value, after all modifiers. You must halve and round up if
                              opposing player uses AP ammo. If a weapon only targets BTS (like breaker), use BTS value
                              here"/>
                  {ammoA === 'PLASMA' &&
                    <BTSInput bts={btsB} update={setBtsB} variant='reactive' title="BTS"
                              tooltip="BTS value. This box only shows if plasma ammo is used."/>}
                  <AmmoInput ammo={ammoB} cont={contB} update={setAmmoB} updateCont={setContB} variant='reactive'
                             dtw={dtwVsDodge} title="Ammunition" tooltip="Calculate AP ammo by halving opposing ARM/BTS
                             manually. Dodge will use the burst value, so smoke dodges in fire teams can be calculated."/>
                  <OtherInputs critImmune={critImmuneB} update={setCritImmuneB} variant='reactive'
                               fixedFaceToFace={fixedFaceToFace} updateFixedFaceToFace={setFixedFaceToFace}/>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={12} lg={4} xl={6} item>
            <FaceToFaceResultCard
              f2fResults={f2fResults}
              addToCompare={addResultToCompareList}
              changeName={updateResultTitle}
            />
            <Typography variant="caption" color="text.secondary">{statusMessage}</Typography>
          </Grid>
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
              Made with ❤️ for the Infinity community by Khepri.
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


