import {useState, useEffect, useRef} from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import './App.css'
import {
  Box,
  Card,
  CardContent,
  Grid,
  ThemeProvider,
  Typography
} from "@mui/material";

import { createTheme } from '@mui/material/styles';
import {grey} from "@mui/material/colors";

// Data input
import SuccessValueInput from "./inputs/SuccessValueInput.jsx";
import DamageInput from "./inputs/DamageInput.jsx";
import ArmorInput from "./inputs/ArmorInput.jsx";
import AmmoInput from "./inputs/AmmoInput.jsx";
import BurstInput from "./inputs/BurstInput.jsx";

// Data display
import F2FGraph from "./display/F2FGraph.jsx";
import F2FResultList from "./display/F2FResultList.jsx";


function App() {
  // App Status
  const [statusMessage, setStatusMessage] = useState("(loading...)");
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const pyodideRef = useRef(null);
  const workerRef = useRef(null);

  // Inputs Player A
  const [burstA, setBurstA] = useState(3);
  const [successValueA, setSuccessValueA] = useState(13);
  const [damageA, setDamageA] = useState(13);
  const [armA, setArmA] = useState(0);
  const [ammoA, setAmmoA] = useState('N');
  const [contA, setContA] = useState(false);

  // Inputs Player B
  const [burstB, setBurstB] = useState(1);
  const [successValueB, setSuccessValueB] = useState(13);
  const [damageB, setDamageB] = useState(13);
  const [armB, setArmB] = useState(0);
  const [ammoB, setAmmoB] = useState('N');
  const [contB, setContB] = useState(false);

  // Outputs
  const [f2fResults, setF2fResults] = useState(null);

  // worker output
  const [test, setTest] = useState(null);

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

  // First load
  useEffect(() => {
    setStatusMessage("Loading icepool engine");
    setIsPyodideReady(false);
    const run = async () => {
      // pyodideRef.current = await loadPyodide({
      //   indexURL : "https://cdn.jsdelivr.net/pyodide/v0.22.1/full/"
      // });
      // await pyodideRef.current.loadPackage(["micropip"], {messageCallback: console.log});
      // console.log(`pyodide is ${pyodideRef} and current is ${pyodideRef}`);
      // setStatusMessage("Icepool ready");
      // setIsPyodideReady(true);
      //

      // Web workers test
      workerRef.current = new ComlinkWorker(new URL('./worker.js', import.meta.url), { type: "module" });
      await workerRef.current.setup();
      await rollDice();  // calculate initial dice
    }
    run();
  }, []);

  useEffect(()=>{
    rollDice();
  },[isPyodideReady])

  useEffect( ()=> {
    rollDice();
  },[burstA, successValueA, damageA, armA, ammoA, contA, burstB, successValueB, damageB, armB, ammoB, contB]);


  const rollDice = async () => {

    // get result from worker
    let t = await workerRef.current.remoteFunction(
      burstA, successValueA, damageA, armA, ammoA, contA, burstB, successValueB, damageB, armB, ammoB, contB)

    console.log(`main thread: result is`);
    console.log(JSON.stringify(t));
  };


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Box sx={{flexGrow: 1}} >
        <Grid container spacing={2}>
          <Grid xs={12} item>
            <Typography variant="h5">Face 2 Face Calculator</Typography>
          </Grid>
          <Grid xs={12} sm={6} lg={4} xl={3} item>
            <Card style={{alignItems: "center", justifyContent: "center"}}>
              <CardContent>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Active</Typography>
                  </Grid>
                <BurstInput burst={burstA} update={setBurstA} color="#b14d8e"/>
                <SuccessValueInput successValue={successValueA} update={setSuccessValueA}/>
                <DamageInput damage={damageA} update={setDamageA}/>
                <ArmorInput armor={armA} update={setArmA}/>
                <AmmoInput ammo={ammoA} cont={contA} update={setAmmoA} updateCont={setContA}/>
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
                  <BurstInput burst={burstB} update={setBurstB} variant='reactive'/>
                  <SuccessValueInput successValue={successValueB} update={setSuccessValueB} variant='reactive'/>
                  <DamageInput damage={damageB} update={setDamageB} variant='reactive'/>
                  <ArmorInput armor={armB} update={setArmB} variant='reactive'/>
                  <AmmoInput ammo={ammoB} cont={contB} update={setAmmoB} updateCont={setContB} variant='reactive'/>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={12} lg={4} xl={6} item>
            <Card>
              <CardContent>
                <Typography variant="h6">Face to Face Results</Typography>
                <Box sx={{textAlign: 'left'}}>Active: B{burstA} SV{successValueA} with DAM{damageA} and ARM{armA}</Box>
                <Box sx={{textAlign: 'right'}}>Reactive: B{burstB} SV{successValueB} with DAM{damageB} and ARM{armB}</Box>
                <F2FGraph
                  results={f2fResults}
                />
                <F2FResultList rows={f2fResults}/>

              </CardContent>
            </Card>
            <Typography variant="caption" color="text.secondary">{statusMessage}</Typography>
          </Grid>
          <Grid>
            <Typography color="text.secondary" variant="body2" sx={{marginTop: 4,marginLeft:2, marginRight:2 }}>
              Made with ❤️ for the Infinity community by Khepri.
              Contact me with any bugs or suggestions on the <a href="https://www.infinitygloballeague.com/">
              IGL Discord</a> or on the Corvus Belli forums. Source code <a href="https://github.com/alexrecarey/khepri-f2f">
                available on github</a>.</Typography>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  )
}

export default App


