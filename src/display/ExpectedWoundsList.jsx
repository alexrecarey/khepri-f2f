import {Box, Grid, Stack, Typography} from "@mui/material";
import {
  activePlayer,
  failurePlayer,
  formatPercentage,
  reactivePlayer,
  ascendByWounds,
  twoDecimalPlaces
} from './DataTransform';
import {reduce} from "ramda";
import { useTheme } from '@mui/material/styles';


// To calculate expected wounds per order
const woundsByChance = (x, y) => x + y['wounds'] * y['chance'];


function ExpectedWoundsList(props){
  const theme = useTheme();
  const rows = props.rows
  const activeColors = {
    1: theme.palette.player['active'][300],
    2: theme.palette.player['active'][400],
    3: theme.palette.player['active'][500],
    4: theme.palette.player['active'][600],
    5: theme.palette.player['active'][700],
  }
  const reactiveColors = {
    1: theme.palette.player['reactive'][300],
    2: theme.palette.player['reactive'][400],
    3: theme.palette.player['reactive'][500],
    4: theme.palette.player['reactive'][600],
    5: theme.palette.player['reactive'][700],
  }

  if (rows === null){
    return null;
  }

  return(
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4} lg={12} sx={{textAlign: 'left'}}>
        <Typography>Active ({twoDecimalPlaces(reduce(woundsByChance, 0, activePlayer(rows)))} wounds / order)</Typography>
        {ascendByWounds(activePlayer(rows)).map((row) => {
          return <Stack direction="row" sx={{alignItems: 'center'}} key={row.id}>
            <Box sx={{width: 25, height: 25, display: 'flex', justifyContent: 'center', alignContent: 'center', backgroundColor:activeColors[row['wounds']]}}>
              <div style={{display:'flex', verticalAlign:'middle', justifyContent: 'center', alignContent: 'center'}}></div>
            </Box>
            <Typography ml={1} mr={1} lineHeight={1} variant="body2">{formatPercentage(row['cumulative_chance'])}% chance {row['wounds']} or more wounds.</Typography></Stack>
        })}
      </Grid>
      <Grid item xs={12} sm={4} lg={12} sx={{textAlign: 'left'}}>
        <Typography>Failure</Typography>
        {failurePlayer(rows).map((row) => {
          return <Stack direction="row" sx={{alignItems: 'center'}} key={row.id}>
            <Box sx={{
              width: 25,
              height: 25,
              display: 'flex',
              justifyContent: 'center',
              alignContent: 'center',
              backgroundColor: 'lightgrey'
            }}>
              <div style={{
                display: 'flex',
                verticalAlign: 'middle',
                justifyContent: 'center',
                alignContent: 'center'
              }}>
              </div>
            </Box>
            <Typography ml={1} mr={1} lineHeight={1} variant="body2">{formatPercentage(row['cumulative_chance'])}% chance neither player causes wounds.</Typography></Stack>
        })}
      </Grid>
      <Grid item xs={12} sm={4} lg={12} sx={{textAlign: 'left'}}>
        <Typography  >Reactive ({twoDecimalPlaces(reduce(woundsByChance, 0, reactivePlayer(rows)))} wounds / order)</Typography>
        {ascendByWounds(reactivePlayer(rows)).map((row) => {
          return <Stack direction="row" sx={{alignItems: 'center'}} key={row.id}>
            <Box sx={{width: 25, height: 25, display: 'flex', justifyContent: 'center', alignContent: 'center', backgroundColor:reactiveColors[row['wounds']]}}>
              <div style={{display:'flex', verticalAlign:'middle', justifyContent: 'center', alignContent: 'center'}}></div>
            </Box>
            <Typography ml={1} mr={1} lineHeight={1} variant="body2">{formatPercentage(row['cumulative_chance'])}% chance {row['wounds']} or more wounds.</Typography></Stack>
        })}
      </Grid>
    </Grid>
  )
}

export default ExpectedWoundsList;
