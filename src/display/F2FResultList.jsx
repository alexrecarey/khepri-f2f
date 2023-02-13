import {Box, Grid, Stack, Typography} from "@mui/material";
import {propEq, pipe, multiply, filter, sortBy, prop} from "ramda";
import { useTheme } from '@mui/material/styles';

// const colorLight = theme.palette.player[variant]["100"];
// const colorMid = theme.palette.player[variant]["500"];
// const colorDark = theme.palette.player[variant]["700"];

const decimalPlaces = (n, d=1) => n.toFixed(d);
const formatPercentage = pipe(multiply(100), decimalPlaces);
const activePlayer = filter(propEq('player', 'active'));
const reactivePlayer = filter(propEq('player', 'reactive'));
const failurePlayer = filter(propEq('player', 'tie'));
const sortedByWounds = sortBy(prop('wounds'));


function F2FResultList(props){
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
        <Typography variant="h6" sx={{}}>Active</Typography>
        {sortedByWounds(activePlayer(rows)).map((row) => {
          return <Stack direction="row" sx={{alignItems: 'center'}}>
            <Box sx={{width: 30, height: 30, display: 'flex', justifyContent: 'center', alignContent: 'center', backgroundColor:activeColors[row['wounds']]}}>
              <div style={{display:'flex', verticalAlign:'middle', justifyContent: 'center', alignContent: 'center'}}>{row['wounds']}+</div>
            </Box>
            <Typography ml={1} mr={1} lineHeight={1}>{formatPercentage(row['cumulative_chance'])}% chance to inflict {row['wounds']} or more wounds.</Typography></Stack>

        })}
      </Grid>
      <Grid item xs={12} sm={4} lg={12} sx={{textAlign: 'left'}}>
        <Typography variant="h6">Failure</Typography>
        {failurePlayer(rows).map((row) => {
          return <Stack direction="row" sx={{alignItems: 'center'}}>
            <Box sx={{
              width: 30,
              height: 30,
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
              }}>{row['wounds']}+
              </div>
            </Box>
            <Typography ml={1} mr={1} lineHeight={1}>{formatPercentage(row['cumulative_chance'])}% chance neither player succeeds.</Typography></Stack>
        })}
      </Grid>
      <Grid item xs={12} sm={4} lg={12} sx={{textAlign: 'left'}}>
        <Typography variant="h6">Reactive</Typography>
        {sortedByWounds(reactivePlayer(rows)).map((row) => {
          return <Stack direction="row" sx={{alignItems: 'center'}}>
            <Box sx={{width: 30, height: 30, display: 'flex', justifyContent: 'center', alignContent: 'center', backgroundColor:reactiveColors[row['wounds']]}}>
              <div style={{display:'flex', verticalAlign:'middle', justifyContent: 'center', alignContent: 'center'}}>{row['wounds']}+</div>
            </Box>
            <Typography ml={1} mr={1} lineHeight={1}>{formatPercentage(row['cumulative_chance'])}% chance to inflict {row['wounds']} or more wounds.</Typography></Stack>

        })}
      </Grid>
    </Grid>
  )
}

export default F2FResultList;
