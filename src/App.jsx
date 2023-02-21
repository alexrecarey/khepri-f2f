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

// Pyodide
import { loadPyodide } from 'pyodide'

const pythonCode = `import micropip
await micropip.install('icepool==0.20.1')
import js
from pyodide.ffi import to_js
import icepool
from icepool import d20, lowest, Again, Die, Pool
from math import comb
from functools import reduce


class InfinityFace2FaceEvaluator(icepool.OutcomeCountEvaluator):
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

    result = InfinityFace2FaceEvaluator(a_sv=a_sv, b_sv=b_sv).evaluate(
        lowest(d20+a_bonus, 20).pool(player_a_burst),
        lowest(d20+b_bonus, 20).pool(player_b_burst))
    return [i for i in result.items()]


def face_to_face_result(player_a_sv, player_a_burst, player_b_sv, player_b_burst):
    f2f = face_to_face(player_a_sv, player_a_burst, player_b_sv, player_b_burst)
    result = {'active': 0,
              'fail': 0,
              'reactive': 0,
              'total_rolls': 0}
    for outcome, amount in f2f:
        result['total_rolls'] += amount
        squash = outcome[0] + outcome[1] - outcome[2] - outcome[3]
        # check if failure result
        if squash == 0:
            result['fail'] += amount
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
    return comb(trials, successes) * pow(probability, successes) * pow(1 - probability, trials - successes)


def increment_or_create(dictionary, key, amount):
    if key in dictionary:
        dictionary[key] += amount
    else:
        dictionary[key] = amount


AMMO = {
    'N': 1,
    'DA': 2,
    'EXP': 3,
    'DODGE': 0,
    'T2': 1,
}

def face_to_face_expected_wounds(
        player_a_sv, player_a_burst, player_a_dam, player_a_arm, player_a_ammo, player_a_cont,
        player_b_sv, player_b_burst, player_b_dam, player_b_arm, player_b_ammo, player_b_cont):
    """Calculates the wounds expected from a face to face encounter

    Return format is {
        'active': {1: 11111, 2: 222222, 3: 33333},
        'reactive': {},
        'fail': {},
        'total_rolls': 0
    }
    """
    outcomes = face_to_face(player_a_sv, player_a_burst, player_b_sv, player_b_burst)
    wounds = {
        'active': {},
        'reactive': {},
        'fail': {},
        'total_rolls': 0
    }
    for (a_crit, a_hit, b_crit, b_hit), rolls in outcomes:
        wounds['total_rolls'] += rolls
        if a_crit + a_hit > 0:
            winner = 'active'
            success_value = player_a_dam - player_b_arm
            damage = 2 if player_a_ammo == 'T2' else 1
            cont = True if player_a_cont else False
        elif b_crit + b_hit > 0:
            winner = 'reactive'
            success_value = player_b_dam - player_a_arm
            damage = 2 if player_b_ammo == 'T2' else 1
            cont = True if player_b_cont else False
        else:
            winner = 'fail'
            success_value = 0
            damage = 0
            cont = False

        # Calculate total amount of saves that must be made.
        # Each crit deals AMMO saves plus one extra save per crit. The extra save per crit is in \`crit_saves\`, as
        # neither CONT damage nor T2 apply their special effects to crit saves
        # For DODGE AMMO we run "min" to keep 0 (for dodge) or original value of crit, as 3 crits = 3 crit saves
        # Each regular hit causes AMMO number of \`saves\`. We also have to add the regular hit portion of a crit,
        # as 1 crit causes a AMMO saves for the regular portion, and 1 extra crit save that is not.
        crit_saves = min(a_crit, AMMO[player_a_ammo] * a_crit) + min(b_crit, AMMO[player_b_ammo] * b_crit)
        saves = ((a_crit + a_hit) * AMMO[player_a_ammo]) + ((b_crit + b_hit) * AMMO[player_b_ammo])

        ### Using icepool to calculate wounds
        if cont:
            dSave = Die([(damage + Again() if x < success_value else 0) for x in range(20)], again_depth=5)
        else:
            dSave = Die([(damage if x < success_value else 0) for x in range(20)])
        dCrit = Die([(1 if x < success_value else 0) for x in range(20)])

        r = Pool([dSave for x in range(saves)] + [dCrit for x in range(crit_saves)]).sum()
        denominator = r.denominator()
        for w, occurrences in r.items():
            if w == 0:
                wounds['fail'][0] = wounds['fail'].get(0,0) + (occurrences/denominator) * rolls
            else:
                wounds[winner][w] = wounds[winner].get(w, 0) + (occurrences/denominator) * rolls
    return wounds


def format_expected_wounds(wounds, max_wounds_shown=3):
    """Format expected_wounds into a list of results

    Output format is {'player': 'active/reactive', 'wounds': 3, 'chance': 0.2432, 'raw_chance' 1341234.23}
    """
    # Squash items that are > than max_wounds_shown
    squashed = {'active': None, 'reactive': None, 'fail': wounds['fail']}
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
    for player in ['active', 'fail', 'reactive']:
        # ugly hack to get the ordering right, only works if results are ordered
        reverse_list = True if player == 'active' else False
        keys = sorted(squashed[player].keys(), reverse=reverse_list)
        for key in keys:
            expected_wounds.append({
                'id': order,
                'player': player,
                'wounds': key,
                'raw_chance': squashed[player][key],
                'cumulative_chance': reduce(
                    lambda x, y: x+y,
                    [squashed[player][i] for i in squashed[player].keys() if i >= key], 0) / wounds['total_rolls'],
                'chance': squashed[player][key]/wounds['total_rolls'],
                'total_rolls': wounds['total_rolls']
            })
            order += 1
    return expected_wounds


def roll_and_bridge_results(
    player_a_sv, player_a_burst, player_a_dam, player_a_arm, player_a_ammo, player_a_cont,
    player_b_sv, player_b_burst, player_b_dam, player_b_arm, player_b_ammo, player_b_cont):
    expected_wounds = face_to_face_expected_wounds(
        player_a_sv, player_a_burst, player_a_dam, player_a_arm, player_a_ammo, player_a_cont,
        player_b_sv, player_b_burst, player_b_dam, player_b_arm, player_b_ammo, player_b_cont)
    formatted_expected_wounds = format_expected_wounds(expected_wounds)
    return to_js(formatted_expected_wounds, dict_converter=js.Object.fromEntries)
    # return formatted_expected_wounds

# Return value for Javascript
to_js(roll_and_bridge_results)`



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
      pyodideRef.current = await loadPyodide({
        indexURL : "https://cdn.jsdelivr.net/pyodide/v0.22.1/full/"
      });
      await pyodideRef.current.loadPackage(["micropip"], {messageCallback: console.log});
      console.log(`pyodide is ${pyodideRef} and current is ${pyodideRef}`);
      setStatusMessage("Icepool ready");
      setIsPyodideReady(true);
      await rollDice();  // calculate initial dice

      // Web workers test
      workerRef.current = new ComlinkWorker(new URL('./worker.js', import.meta.url), {/* normal Worker options*/})
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
    let t = await workerRef.current.add(2, 3)
    setTest(t);
    console.log(`Test variable is: ${t}`)
   if(!isPyodideReady){
      return;
    }
    setStatusMessage("Calculating");
    setF2fResults(null);
    let startTime = Date.now();
    console.log(`pyodide ref is ${pyodideRef} and ${pyodideRef.current}`);
    const f = await pyodideRef.current.runPythonAsync(pythonCode);
    //setStatusMessage(`result is ${f}`);
    const result = await f(successValueA, burstA, damageA, armA, ammoA, contA,
                           successValueB, burstB, damageB, armB, ammoB, contB);
    console.log('Pyodide script result:');
    console.log(result);
    let elapsed = Date.now() - startTime;
    setF2fResults(result);
    setStatusMessage(`Done! Took ${elapsed} ms to simulate ${result[0]['total_rolls'].toLocaleString()} rolls.`);
    console.log(`Calculated results ${JSON.stringify(result)}`);
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


