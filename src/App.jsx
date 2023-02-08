import {useState, useEffect, useRef} from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import './App.css'
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Grid, List, ListItem,
  Rating, Slider,
  Stack, Table, TableBody, TableCell, TableRow, ToggleButton, ToggleButtonGroup,
  Typography
} from "@mui/material";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDiceD20} from '@fortawesome/free-solid-svg-icons'

import { loadPyodide } from 'pyodide'

const pythonCode = `import micropip
await micropip.install('icepool==0.20.1')
from functools import reduce

import icepool
from icepool import d20, lowest
from math import comb
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
    b_sv = player_b_sv if player_b_sv <= 20 else 20
    b_bonus = 0 if player_b_sv <= 20 else player_b_sv - 20

    result = InfinityUniverseEvaluator(a_sv=a_sv, b_sv=b_sv).evaluate(
        lowest(d20+a_bonus, 20).pool(player_a_burst),
        lowest(d20+b_bonus, 20).pool(player_b_burst))
    return [i for i in result.items()]


def face_to_face_result(player_a_sv, player_a_burst, player_b_sv, player_b_burst):
    f2f = face_to_face(player_a_sv, player_a_burst, player_b_sv, player_b_burst)
    result = {'active': 0,
              'tie': 0,
              'reactive': 0,
              'total_rolls': 0}
    for outcome, amount in f2f:
        result['total'] += amount
        squash = outcome[0] + outcome[1] - outcome[2] - outcome[3]
        # check if tie
        if squash == 0:
            result['tie'] += amount
        # Player A wins F2F
        elif squash > 0:
            result['active'] += amount
        # Player B wins F2F
        elif squash < 0:
            result['reactive'] += amount
    return result
    #return to_js(result, dict_converter=js.Object.fromEntries)


def binomial_success(successes: int, trials: int, probability: float):
    """Binomial theory success probability"""
    return comb(trials, successes) * pow(probability, successes) * pow(1 - probability, trials - successes);


AMMO = {
    'N': 1,
    'DA': 2,
    'EXP': 3,
    'CONT': 1  # not used for now?
}



def face_to_face_expected_wounds(
        player_a_sv, player_a_burst, player_a_dam, player_a_arm, player_a_ammo,
        player_b_sv, player_b_burst, player_b_dam, player_b_arm, player_b_ammo):
    """Calculates the wounds expected from a face to face encounter"""
    outcomes = face_to_face(player_a_sv, player_a_burst, player_b_sv, player_b_burst)
    wounds = {
        'active': {},
        'reactive': {},
        'tie': {},
        'total_rolls': 0
    }
    for (a_crit, a_hit, b_crit, b_hit), rolls in outcomes:
        wounds['total_rolls'] += rolls
        winner_number = a_crit + a_hit - b_crit - b_hit
        if winner_number > 0:
            winner = 'active'
            wound_probability = (player_a_dam - player_b_arm) / 20
        elif winner_number < 0:
            winner = 'reactive'
            wound_probability = (player_b_dam - player_a_arm) / 20
        else:
            winner = 'tie'
            wound_probability = 0

        saves = ((a_crit*AMMO[player_a_ammo] + a_crit) + a_hit*AMMO[player_a_ammo] +
                 (b_crit*AMMO[player_b_ammo] + b_crit) + b_hit*AMMO[player_b_ammo])

        # Fold successful results by active or reactive that cause 0 wounds into the "tie" dictionary
        wounds_caused_probability = binomial_success(0, saves, wound_probability)
        if 0 in wounds['tie']:
            wounds['tie'][0] += wounds_caused_probability * rolls
        else:
            wounds['tie'][0] = wounds_caused_probability * rolls

        # Calculate probabilities of active or reactive player inflicting 1 or more wounds
        for wounds_caused in range(1, saves + 1):
            wounds_caused_probability = binomial_success(wounds_caused, saves, wound_probability)
            # # At the moment accept any number of wounds caused results
            # if wounds_caused > MAX_WOUNDS_CALCULATED:
            #     wounds_caused = MAX_WOUNDS_CALCULATED
            if wounds_caused in wounds[winner]:
                wounds[winner][wounds_caused] += wounds_caused_probability * rolls
            else:
                wounds[winner][wounds_caused] = wounds_caused_probability * rolls
    formatted_wounds = format_expected_wounds(wounds)
    return to_js(formatted_wounds, dict_converter=js.Object.fromEntries)
    #return formatted_wounds



def format_expected_wounds(wounds, max_wounds_shown=3):
    """Format expected_wounds into a list of results

    Output format is {'player': 'active/reactive', 'wounds': 3, 'chance': 0.2432, 'raw_chance' 1341234.23}
    """
    # Squash items that are > than max_wounds_shown
    squashed = {'active': None, 'reactive': None, 'tie': wounds['tie']}
    for player in ['active', 'reactive']:
        over_max = {k: v for k, v in wounds[player].items() if k > max_wounds_shown}
        if len(over_max) > 0:
            additional_successes = reduce(lambda x, y: x+y, over_max.values(), 0)
            new_dict = {k: v for k, v in wounds[player].items() if k <= max_wounds_shown}
            new_dict[max_wounds_shown] += additional_successes
            squashed[player] = new_dict
        else:
            squashed[player] = wounds[player]

    # Create output table
    expected_wounds = []
    order = 0
    for player in ['active', 'tie', 'reactive']:
        # ugly hack to get the ordering right, only works if results are ordered
        reverse_list = True if player == 'active' else False
        keys = sorted(squashed[player].keys(), reverse=reverse_list)
        for key in keys:
            expected_wounds.append({
                'id': order,
                'player': player,
                'wounds': key,
                'raw_chance': squashed[player][key],
                'chance': squashed[player][key]/wounds['total_rolls']
            })
            order += 1
    return expected_wounds
    # to_js(expected_wounds, dict_converter=js.Object.fromEntries)

# Return value for Javascript
to_js(face_to_face_expected_wounds)`



function App() {
  // App Status
  const [statusMessage, setStatusMessage] = useState("(loading...)");
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const pyodideRef = useRef(null);

  // Inputs
  const [burstA, setBurstA] = useState(3);
  const [burstB, setBurstB] = useState(1);
  const [successValueA, setSuccessValueA] = useState(10);
  const [successValueB, setSuccessValueB] = useState(10);
  const [damageA, setDamageA] = useState(13);
  const [damageB, setDamageB] = useState(13);
  const [armA, setArmA] = useState(0);
  const [armB, setArmB] = useState(0);
  const [ammoA, setAmmoA] = useState('N');
  const [ammoB, setAmmoB] = useState('N');

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
    const result = await f(successValueA, burstA, damageA, armA, ammoA,
                           successValueB, burstB, damageB, armB, ammoB);
    console.log('Pyodide script result:');
    console.log(result);
    let elapsed = Date.now() - startTime;
    setF2fResults(result);
    setStatusMessage(`Done! Took ${elapsed} ms`);
    setIsCalculating(false);
    console.log(`Calculated results ${JSON.stringify(result)}`);
  };

  return (
    <>
      <CssBaseline/>
      <Box sx={{flexGrow: 1}}>
        <Grid container spacing={2}>
          <Grid xs={12} item>
            <Typography variant="h5">Face 2 Face Calculator</Typography>
          </Grid>
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
                  icon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, color: "#b14d8e"}} icon={faDiceD20}/>}
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
                <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                  <Typography>DAM</Typography>
                  <Typography>{damageA}</Typography>
                  <Slider value={damageA} step={1} min={10} max={20} onChange={(event, newValue) => {setDamageA(newValue)}}/>
                </Stack>
                <Stack spacing={2} direction="row" sx={{mb:1}} alignItems="center">
                  <Typography>ARM</Typography>
                  <Typography>{armA}</Typography>
                  <Slider value={armA} step={1} min={0} max={10} onChange={(event, newValue) => {setArmA(newValue)}}/>
                </Stack>
                <ToggleButtonGroup
                  exclusive
                  value={ammoA}
                  onChange={
                  (event, newAmmo) => {
                    if(newAmmo !== null){
                      setAmmoA(newAmmo);
                    } else {
                      setAmmoA('N');
                    }}}
                >
                  <ToggleButton value="DA">DA</ToggleButton>
                  <ToggleButton value="EXP">EXP</ToggleButton>
                </ToggleButtonGroup>
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
                  icon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, color: "#217a79"}} icon={faDiceD20}/>}
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
                <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                  <Typography>DAM</Typography>
                  <Typography>{damageB}</Typography>
                  <Slider value={damageB} step={1} min={10} max={20} onChange={(event, newValue) => {setDamageB(newValue)}}/>
                </Stack>
                <Stack spacing={2} direction="row" sx={{mb:1}} alignItems="center">
                  <Typography>ARM</Typography>
                  <Typography>{armB}</Typography>
                  <Slider value={armB} step={1} min={0} max={10} onChange={(event, newValue) => {setArmB(newValue)}}/>
                </Stack>
                <ToggleButtonGroup
                  exclusive
                  value={ammoB}
                  onChange={
                    (event, newAmmo) => {
                      if(newAmmo !== null){
                        setAmmoB(newAmmo);
                      } else {
                        setAmmoB('N');
                      }}}
                >
                  <ToggleButton value="DA">DA</ToggleButton>
                  <ToggleButton value="EXP">EXP</ToggleButton>
                </ToggleButtonGroup>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={12} lg={4} xl={6} item>
            <Button variant="contained" disabled={!isPyodideReady || isCalculating} onClick={()=> rollDice()}>Roll dice!</Button>
            <Card>
              <CardContent>
                <Typography>Results</Typography>
                <F2FGraph
                  results={f2fResults}
                />
                <ResultList rows={f2fResults}/>


                
              </CardContent>
            </Card>
            <Typography variant="caption" color="text.secondary">{statusMessage}</Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

// Single colors
// sunset dark
//#f3e79b,#fac484,#f8a07e,#eb7f86,#ce6693,#a059a0,#5c53a5

// emerald
// ['#074050', '#105965', '#217a79', '#4c9b82', '#6cc08b', '#97e196', '#d3f2a3']  // dark to light

// teal
// #d1eeea,#a8dbd9,#85c4c9,#68abb8,#4f90a6,#3b738f,#2a5674

// magenta dark to light
// ['#6c2167', '#91357d', '#b14d8e', '#ca699d', '#dd88ac', '#eaa9bd', '#f3cbd3']

// Diverging colors.
// tropic. Kinda cyberpunky?
//#009B9E,#42B7B9,#A7D3D4,#F1F1F1,#E4C1D9,#D691C1,#C75DAB



function F2FGraphCell(props) {
  //const active_colors = ['#6c2167', '#91357d', '#b14d8e', '#ca699d', '#dd88ac', '#eaa9bd', '#f3cbd3'];
  const active_colors = [ '#dd88ac', '#ca699d', '#b14d8e', '#91357d', '#6c2167'];
  //const reactive_colors = ['#074050', '#105965', '#217a79', '#4c9b82', '#6cc08b', '#97e196', '#d3f2a3'];
  const reactive_colors = ['#6cc08b', '#4c9b82', '#217a79', '#105965', '#074050'];
  const data = props.row;
  const width = (data['chance'] * 100).toFixed(1) + "%";
  let color;
  if(data['player'] === 'active'){
    color = active_colors[data['wounds']];
  } else if(data['player'] === 'reactive'){
    color = reactive_colors[data['wounds']];
  } else {
    color = 'lightgrey';
  }
  let key_ = data['player'] + '-' + data['wounds'];
  console.log(`Width of cell ${key_} is ${width}`);

  return <TableCell sx={{bgcolor: color, width: width, padding:0, height: '30px'}}>

  </TableCell>;
}

function F2FGraph(props) {
  const results = props.results;
  if(results === null || results.size === 0 ){
    return <div/>
  }
  console.log(results instanceof Array);
  return <Table sx={{width:"100%"}}>
    <TableBody>
        <TableRow key="1">
          {results.map((result) => (<F2FGraphCell key={result['id']} row={result}/>))}
        </TableRow>
    </TableBody>
  </Table>
}

function ResultListItem(props){
  const item = props.item
  return <ListItem>
    <Typography>{item['player']} player causes {item['wounds']} wounds: {(item['chance']*100).toFixed(1)}%</Typography>
  </ListItem>
}

function ResultList(props){
  const rows = props.rows
  if (rows === null){
    return null;
  }

  return(<List>
    {rows.map((row)=>{
      return <ResultListItem key={row['id']} item={row}/>;
    })}
  </List>);
}



// function Face2FaceResultBarChart(props){
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


