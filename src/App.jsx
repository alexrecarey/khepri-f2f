import {useState, useEffect, useCallback, useRef} from 'react'
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

import {
  DataGrid
} from "@mui/x-data-grid";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDiceD20} from '@fortawesome/free-solid-svg-icons'

import { loadPyodide } from 'pyodide'

const pythonCode = `
def func():
    return 5 + 7

func()
`

const pythonCode2 = `
def func(a,b,c,d):
    return a+b+c+d
func
`

const pythonCodeOriginal = `
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
  const [statusMessage, setStatusMessage] = useState("(loading...)");
  const pyodideRef = useRef(null);

  // Inputs
  const [burstA, setBurstA] = useState(3)
  const [burstB, setBurstB] = useState(1)
  const [successValueA, setSuccessValueA] = useState(10)
  const [successValueB, setSuccessValueB] = useState(10)

  // Outputs
  const [results, setResults] = useState(null);

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
    const run = async () => {
      pyodideRef.current = await loadPyodide({
        indexURL : "https://cdn.jsdelivr.net/pyodide/v0.22.1/full/"
      });
      await pyodideRef.current.loadPackage(["micropip"], {messageCallback: console.log});
      console.log(`pyodide is ${pyodideRef} and current is ${pyodideRef}`);
      setStatusMessage("Pyodide ready");
    }
    run();
  }, []);

  const rollDice = async () => {
    setStatusMessage("Calculating");
    console.log(`pyodide ref is ${pyodideRef} and ${pyodideRef.current}`);
    const f = await pyodideRef.current.runPythonAsync(pythonCodeOriginal);
    //setStatusMessage(`result is ${f}`);
    const result = await f(successValueA, burstA, successValueB, burstB)
    console.log('Pyodide script result:');
    console.log(result);
    setResults({...result});
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
            <Button onClick={()=> rollDice()}>Roll dice!</Button>
            <Card>
              <CardContent>

                <Typography>{statusMessage}</Typography>
                <ResultTable
                  res={results}
                />
                
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

function ResultTable(props) {

  let die_results = props.res;

  if(die_results === null || die_results.size == 0 ){
    return <div/>
  }

  const total_rolls = die_results['active'] + die_results['reactive'] + die_results['tie'];
  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 0,
    },
    {
      field: 'outcome',
      headerName: 'Outcome',
      width: 90
    },
    {
      field: 'result',
      headerName: 'Result',
      width: 150,
    }]
  const rows = [
    {
      'id': 1,
      'outcome': 'Active player wins',
      'result': die_results['active'] / total_rolls
    },
    {
      'id': 2,
      'outcome': 'No winner',
      'result': die_results['tie'] / total_rolls
    },
    {
      'id': 3,
      'outcome': 'Reactive player wins',
      'result': die_results['reactive'] / total_rolls
    }
  ];

  console.log('Props are:');
  console.log(`${JSON.stringify(props)}`);
  console.log(`Total rolls ${total_rolls}`);
  console.log('Die results:');
  console.log(`${JSON.stringify(die_results)}`);
  console.log('Rows:');
  console.log(`${JSON.stringify(rows)}`);
  return <Box sx={{ height: '300px', width:'300px'}}>
    <DataGrid
      rows={rows}
      columns={columns}
      disableSelectionOnClick
    />
  </Box>;
}

export default App


