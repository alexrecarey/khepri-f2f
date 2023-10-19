import {useState, useEffect, useRef} from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import './App.css'
import {any, assoc, clone, findIndex, propEq, remove, update} from "ramda";
import {
  Box,
  Card,
  CardContent,
  Grid, IconButton, Stack,
  ThemeProvider, Tooltip,
  Typography
} from "@mui/material";

import { createTheme } from '@mui/material/styles';
import {grey} from "@mui/material/colors";
import InfoIcon from '@mui/icons-material/Info';
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


function App() {
  // App Status
  const [statusMessage, setStatusMessage] = useState("(loading...)");
  const workerRef = useRef(null);

  // Search params
  let [searchParams, setSearchParams] = useSearchParams();
  let p = validateParams(searchParams);

  // Inputs Player A
  const [burstA, setBurstA] = useState(p.burstA);
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

  // Tooltips
  const [showTooltips, setShowTooltips] = useState(false);

  // Theme
  const theme = createTheme({
    palette: {
      background: {
        default: grey[100]
      },
      player: {
        active: {
          100: '#f3cbd3',
          200: '#eaa9bd',
          300: '#dd88ac',
          400: '#ca699d',
          500: '#b14d8e',
          600: '#91357d',
          700: '#6c2167',
        },
        reactive: {
          100: '#d3f2a3',
          200: '#97e196',
          300: '#6cc08b',
          400: '#4c9b82',
          500: '#217a79',
          600: '#105965',
          700: '#074050',
        },
      },
    },
  });
  // Worker message received
  const messageReceived = (msg) => {
    if(msg.data.command === 'result'){
      let value = msg.data.value;
      let cl = clone(value);
      setF2fResults(cl);
      setStatusMessage(`Done! Took ${msg.data.elapsed}ms to simulate ${msg.data.totalRolls.toLocaleString()} rolls.`);
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
    burstA, successValueA, damageA, armA, btsA, ammoA, contA, critImmuneA,
    burstB, successValueB, damageB, armB, btsB, ammoB, contB, critImmuneB,
    dtwVsDodge, fixedFaceToFace
  ]);


  const rollDice = async () => {
    // get result from worker
    let parameters = {
      successValueA: successValueA, burstA: burstA, damageA: damageA, armA: armA, btsA: btsA,
      ammoA: ammoA, contA: contA, critImmuneA: critImmuneA,
      successValueB: successValueB, burstB: burstB, damageB: damageB, armB: armB, btsB: btsB,
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Box sx={{flexGrow: 1}}>
        <Grid container spacing={2}>
          <Grid xs={12} item>
            <Typography variant="h5">Face 2 Face Calculator <IconButton onClick={()=>setShowTooltips(!showTooltips)}><InfoIcon/></IconButton></Typography>
          </Grid>
          <Grid xs={12} sm={6} lg={4} xl={3} item>
            <Card style={{alignItems: "center", justifyContent: "center"}}>
              <CardContent>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Active</Typography>
                  </Grid>
                  <BurstInput burst={burstA} update={setBurstA} info={showTooltips}/>
                  {dtwVsDodge === false && <SuccessValueInput successValue={successValueA} update={setSuccessValueA} info={showTooltips}/>}
                  {ammoA !== 'DODGE' && <DamageInput damage={damageA} update={setDamageA} info={showTooltips}/>}
                  <ArmorInput armor={armA} update={setArmA} hideBTS={ammoB === 'PLASMA'} info={showTooltips}/>
                  {ammoB === 'PLASMA' && <BTSInput bts={btsA} update={setBtsA} info={showTooltips}/>}
                  <AmmoInput ammo={ammoA} cont={contA} update={setAmmoA} updateCont={setContA} info={showTooltips}/>
                  <OtherInputs critImmune={critImmuneA} update={setCritImmuneA} dtwVsDodge={dtwVsDodge} updateDtw={setDtwVsDodge} info={showTooltips}/>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} lg={4} xl={3} item>
            <Card style={{alignItems: "center", justifyContent: "center"}}>
              <CardContent>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Reactive</Typography>
                  </Grid>
                  <BurstInput burst={burstB} update={setBurstB} variant='reactive' info={showTooltips}/>
                  {burstB !== 0 && <SuccessValueInput successValue={successValueB} update={setSuccessValueB} variant='reactive' info={showTooltips}/>}
                  {dtwVsDodge === false && burstB !== 0 && ammoB !== 'DODGE' &&<DamageInput damage={damageB} update={setDamageB} variant='reactive' info={showTooltips}/>}
                  <ArmorInput armor={armB} update={setArmB} hideBTS={ammoA === 'PLASMA'} variant='reactive' info={showTooltips}/>
                  {ammoA === 'PLASMA' && <BTSInput bts={btsB} update={setBtsB} variant='reactive' info={showTooltips}/>}
                  <AmmoInput ammo={ammoB} cont={contB} update={setAmmoB} updateCont={setContB} variant='reactive' dtw={dtwVsDodge} info={showTooltips}/>
                  <OtherInputs critImmune={critImmuneB} update={setCritImmuneB} variant='reactive' info={showTooltips}
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
            <Typography color="text.secondary" variant="body2" sx={{marginTop: 4, marginLeft: 2, marginRight: 2}}>
              Made with ❤️ for the Infinity community by Khepri.
              Contact me with any bugs or suggestions on the <a href="https://www.infinitygloballeague.com/">
              IGL Discord</a> or on the Corvus Belli forums. Source code <a
              href="https://github.com/alexrecarey/khepri-f2f">
              available on github</a>.</Typography>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  )
}

export default App


