import {useState, useEffect, useRef} from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import './App.css'
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Grid,
  Rating,
  Stack,
  Typography
} from "@mui/material";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDiceD20} from '@fortawesome/free-solid-svg-icons'

import { loadPyodide } from 'pyodide'

const pythonCode = `
import micropip
await micropip.install('icepool==0.20.1')

import icepool
from icepool import d20, lowest
import js
from pyodide.ffi import to_js


class InfinityUniverseEvaluator(icepool.OutcomeCountEvaluator):
    def __init__(self, a_sv, b_sv):
        self.a_sv = a_sv
        self.b_sv = b_sv

    # Note that outcomes are seen in ascending order by default.
    def next_state(self, state, outcome, a_count, b_count):
        # Initial state is all zeros.
        a_crit, a_success, b_crit, b_success = state or (0, 0, 0, 0)

        # First, accumulate scores.
        if outcome < self.a_sv:
            a_success += a_count
        elif outcome == self.a_sv:
            a_crit += a_count
        if outcome < self.b_sv:
            b_success += b_count
        elif outcome == self.b_sv:
            b_crit += b_count

        # Then, cancel the other side's current and previous successes,
        # which must all have been equal or less than the current outcome.
        # Crits continue to cancel future (higher) successes as well.
        if a_crit or (a_count > 0 and outcome <= self.a_sv):
            b_success = 0
        if b_crit or (b_count > 0 and outcome <= self.b_sv):
            a_success = 0

        # Finally, cancel all crits if both sides scored any crit.
        if a_crit > 0 and b_crit > 0:
            # Note that successes were already cancelled above.
            # Also, no more outcomes will matter since
            # all remaining outcomes are above SV.
            a_crit = 0
            b_crit = 0
        return a_crit, a_success, b_crit, b_success


def face_to_face(player_a_sv, player_a_burst, player_b_sv, player_b_burst):
    # Handle cases where SV > 20
    a_sv = player_a_sv if player_a_sv <= 20 else 20
    a_bonus = 0 if player_a_sv <= 20 else player_a_sv - 20
    b_sv = a_sv if player_b_sv <= 20 else 20
    b_bonus = 0 if player_b_sv <= 20 else player_b_sv - 20

    result = InfinityUniverseEvaluator(a_sv=a_sv, b_sv=b_sv).evaluate(
        lowest(d20+a_bonus, 20).pool(player_a_burst),
        lowest(d20+b_bonus, 20).pool(player_b_burst))
    return [i for i in result.items()]


def face_to_face_results(player_a_sv, player_a_burst, player_b_sv, player_b_burst):
    f2f = face_to_face(player_a_sv, player_a_burst, player_b_sv, player_b_burst)
    result = {'active':0,
              'tie':0,
              'reactive':0}
    for outcome, amount in f2f:
        squash = outcome[0] + outcome[1] - outcome[2] - outcome[3]
        # check if tie
        if squash == 0:
            result['tie'] = result['tie'] + amount
        # Player A wins F2F
        elif squash > 0:
            result['active'] = result['active'] + amount
        # Player B wins F2F
        elif squash < 0:
            result['reactive'] = result['reactive'] + amount
    return to_js(result, dict_converter=js.Object.fromEntries)

to_js(face_to_face_results)`



function App() {
  // App Status
  const [statusMessage, setStatusMessage] = useState("(loading...)");
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const pyodideRef = useRef(null);

  // Inputs
  const [burstA, setBurstA] = useState(3)
  const [burstB, setBurstB] = useState(1)
  const [successValueA, setSuccessValueA] = useState(10)
  const [successValueB, setSuccessValueB] = useState(10)

  // Outputs
  const [f2fResults, setF2fResults] = useState(null);

  const handleButtonPress = (amount, variable, setter) => {
    if (amount + variable >= 30) {
      setter(30);
    } else if (amount + variable <= 1) {
      setter(1);
    } else {
      setter(amount + variable);
    }
  };

  // First load
  useEffect(() => {
    setStatusMessage("Loading icepool engine");
    setIsPyodideReady(false);
    const run = async () => {
      pyodideRef.current = await loadPyodide({
        indexURL : "https://cdn.jsdelivr.net/pyodide/v0.22.1/full/"
      });
      await pyodideRef.current.loadPackage(["micropip"], {messageCallback: console.log});
      console.log(`pyodide is ${pyodideRef} and current is ${pyodideRef}`);
      setStatusMessage("Icepool ready");
      setIsPyodideReady(true);
    }
    run();
  }, []);

  const rollDice = async () => {
    setIsCalculating(true);
    setStatusMessage("Calculating");
    setF2fResults(null);
    let startTime = Date.now();
    console.log(`pyodide ref is ${pyodideRef} and ${pyodideRef.current}`);
    const f = await pyodideRef.current.runPythonAsync(pythonCode);
    //setStatusMessage(`result is ${f}`);
    const result = await f(successValueA, burstA, successValueB, burstB)
    console.log('Pyodide script result:');
    console.log(result);
    let elapsed = Date.now() - startTime;
    setF2fResults({...result})
    setStatusMessage(`Done! Took ${elapsed} ms`);
    setIsCalculating(false);
    console.log(`Calculated results ${JSON.stringify(result)}`);
  };


  return (
    <>
      <CssBaseline/>
      <Box sx={{flexGrow: 1}}>
        <Grid container spacing={2}>
          <Grid xs={12} sm={6} lg={4} xl={3} item>
            <Card
              style={{alignItems: "center", justifyContent: "center"}}>
              <CardContent>
                <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>Player A</Typography>
                <Rating
                  value={burstA}
                  min={1}
                  max={6}
                  size="large"
                  onChange={(event, newValue) => {
                    setBurstA(newValue);
                  }}
                  icon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2}} icon={faDiceD20}/>}
                  emptyIcon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, opacity: 0.55}} icon={faDiceD20}/>}
                />
                <Stack alignItems="center" justifyContent="center" direction="row">
                  <ButtonGroup>
                    <Button onClick={() => handleButtonPress(-3, successValueA, setSuccessValueA)}>-3</Button>
                    <Button onClick={() => handleButtonPress(-1, successValueA, setSuccessValueA)}>-1</Button>
                  </ButtonGroup>
                  <Typography sx={{fontSize: 24, fontWeight: "bold", pl: 2, pr: 2}}>{successValueA}</Typography>
                  <ButtonGroup>
                    <Button onClick={() => handleButtonPress(+1, successValueA, setSuccessValueA)}>+1</Button>
                    <Button onClick={() => handleButtonPress(+3, successValueA, setSuccessValueA)}>+3</Button>
                  </ButtonGroup>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} lg={4} xl={3} item>
            <Card>
              <CardContent>
                <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>Player B</Typography>
                <Rating
                  value={burstB}
                  min={1}
                  max={6}
                  size="large"
                  onChange={(event, newValue) => {
                    setBurstB(newValue);
                  }}
                  icon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2}} icon={faDiceD20}/>}
                  emptyIcon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, opacity: 0.55}} icon={faDiceD20}/>}
                />
                <Stack alignItems="center" justifyContent="center" direction="row">
                  <ButtonGroup>
                    <Button onClick={() => handleButtonPress(-3, successValueB, setSuccessValueB)}>-3</Button>
                    <Button onClick={() => handleButtonPress(-1, successValueB, setSuccessValueB)}>-1</Button>
                  </ButtonGroup>
                  <Typography sx={{fontSize: 24, fontWeight: "bold", pl: 2, pr: 2}}>{successValueB}</Typography>
                  <ButtonGroup>
                    <Button onClick={() => handleButtonPress(+1, successValueB, setSuccessValueB)}>+1</Button>
                    <Button onClick={() => handleButtonPress(+3, successValueB, setSuccessValueB)}>+3</Button>
                  </ButtonGroup>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={12} lg={4} xl={6} item>
            <Button variant="contained" disabled={!isPyodideReady || isCalculating} onClick={()=> rollDice()}>Roll dice!</Button>
            <Card>
              <CardContent>


                <ResultTable
                  res={f2fResults}
                />
                
              </CardContent>
            </Card>
            <Typography variant="caption" color="text.secondary">{statusMessage}</Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

function ResultTable(props) {

  let die_results = props.res;

  if(die_results === null || die_results.size === 0 ){
    return <div/>
  }

  const {active, reactive, tie} = die_results;
  const total_rolls = (active + reactive + tie);
  const active_pcnt = active / total_rolls;
  const reactive_pcnt = reactive / total_rolls;
  const tie_pcnt = tie / total_rolls;
  let activeWidth = active_pcnt * 300;
  let reactiveWidth = reactive_pcnt * 300;
  let tieWidth = tie_pcnt * 300;

  // testing color palette
  const [lightSkyBlue, mediumOrchid, lavender, royalBlue, midnightBlue] = ['#6EcbF5', '#C252E1', '#E0D9F6', '#586AE2', '#2A2356'];
  return <Grid container>
    <Grid item xs={12}>
      <svg style={{width: "inherit"}} height="20">
        <rect x="0" y="0" width={activeWidth} height="20" fill={royalBlue}></rect>
        <rect x={activeWidth} y="0" width={tieWidth} height="20" fill={midnightBlue}></rect>
        <rect x={activeWidth+tieWidth} y="0" width={reactiveWidth} height="20" fill={mediumOrchid}></rect>
      </svg>
    </Grid>
    <Grid item xs={6}>
      <Typography>Active</Typography>
    </Grid>
    <Grid item xs={6}>
      <Typography>{Number(active_pcnt).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:0})}</Typography>
    </Grid>
    <Grid item xs={6}>
      <Typography>Tie</Typography>
    </Grid>
    <Grid item xs={6}>
      <Typography>{Number(tie_pcnt).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:0})}</Typography>
    </Grid>
    <Grid item xs={6}>
      <Typography>Reactive</Typography>
    </Grid>
    <Grid item xs={6}>
      <Typography>{Number(reactive_pcnt).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:0})}</Typography>
    </Grid>
  </Grid>;
}

// function ResultGraph(props) {
//
//   const {active, reactive, tie} = die_results;
//   let activeWidth = active_pcnt * 300;
//   let reactiveWidth = reactive_pcnt * 300;
//   let tieWidth = tie_pcnt * 300;
//
//
//   const [lightSkyBlue, mediumOrchid, lavender, royalBlue, midnightBlue] = ['#6EcbF5', '#C252E1', '#E0D9F6', '#586AE2', '#2A2356'];
//
//   return(<svg width="inherit" height="20">
//     <rect x="0" y="0" width={activeWidth} height="20" fill={royalBlue}></rect>
//     <rect x={activeWidth} y="0" width={tieWidth} height="20" fill={midnightBlue}></rect>
//     <rect x={activeWidth+tieWidth} y="0" width={reactiveWidth} height="20" fill={mediumOrchid}></rect>
//   </svg>);
// }

export default App


