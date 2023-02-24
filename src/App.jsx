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
import FaceToFaceResultCard from "./display/FaceToFaceResultCard.jsx";



function App() {
  // App Status
  const [statusMessage, setStatusMessage] = useState("(loading...)");
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
      setF2fResults(msg.data.value);
      setStatusMessage(`Done! Took ${msg.data.elapsed}ms to simulate ${msg.data.totalRolls.toLocaleString()} rolls.`);
    } else if (msg.data.command === 'status'){
      if(msg.data.value === 'ready'){
        rollDice()
      }
    }
  }

  // First load
  useEffect(() => {
    setStatusMessage("Loading icepool engine");
    const run = async () => {
      // Web workers without comlink
      workerRef.current = new Worker(new URL('./python.worker.js', import.meta.url),
      );
      workerRef.current.onmessage = messageReceived
      workerRef.current.postMessage({command:'init'});
    }
    run();
  }, []);

  useEffect( ()=> {
    rollDice();
  },[burstA, successValueA, damageA, armA, ammoA, contA, burstB, successValueB, damageB, armB, ammoB, contB]);


  const rollDice = async () => {
    // get result from worker
    let parameters = {
      player_a_sv: successValueA, player_a_burst: burstA, player_a_dam: damageA, player_a_arm: armA, player_a_ammo: ammoA, player_a_cont: contA,
      player_b_sv: successValueB, player_b_burst: burstB, player_b_dam: damageB, player_b_arm: armB, player_b_ammo: ammoB, player_b_cont: contB
    }
    await workerRef.current.postMessage({command: 'calculate', data: parameters})
  };


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Box sx={{flexGrow: 1}}>
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
            <FaceToFaceResultCard f2fResults={f2fResults}/>
            <Typography variant="caption" color="text.secondary">{statusMessage}</Typography>
          </Grid>

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


