import {Table, TableBody, TableCell, TableRow} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import {
  activePlayerWithWounds,
  ascendByWounds,
  descendByWounds,
  failurePlayerWithNoWounds,
  reactivePlayerWithWounds,
  sumChance,
  squashResults
} from "./DataTransform.js";
import {clamp} from "ramda";


function ExpectedWoundsGraphCell(props) {
  const theme = useTheme();
  const activeColors = {
    1: theme.palette['active'][300],
    2: theme.palette['active'][400],
    3: theme.palette['active'][500],
    4: theme.palette['active'][600],
    5: theme.palette['active'][700],
  }
  const reactiveColors = {
    1: theme.palette['reactive'][300],
    2: theme.palette['reactive'][400],
    3: theme.palette['reactive'][500],
    4: theme.palette['reactive'][600],
    5: theme.palette['reactive'][700],
  }

  //const data = props.row;
  const player = props.player;
  const chance = props.chance;
  const wounds = props.wounds;

  const width = (chance * 100).toFixed(1) + "%";
  // const percentage = (data['chance'] * 100).toFixed(0) + "%";

  let color;
  if(player === 'active' && wounds > 0){
    color = activeColors[wounds];
  } else if(player === 'reactive' && wounds > 0){
    color = reactiveColors[wounds];
  } else {
    color = theme.palette['failure'][100];
  }

  return <TableCell sx={{bgcolor: color, width: width, padding:0, height: '30px', textAlign: 'center'}}>
    {chance >= 0.1 &&
      <div>{wounds}</div>
    }
  </TableCell>;
}


function ExpectedWoundsGraph(props) {
  const results = props.rows;
  if (!results) {
    return null
  }
  const activeMaxWounds = clamp(1, 5, props.activeMaxWounds ? props.activeMaxWounds : 3);
  const reactiveMaxWounds = clamp(1, 5, props.reactiveMaxWounds ? props.reactiveMaxWounds : 3);

  const squashedResults = squashResults(results, activeMaxWounds, reactiveMaxWounds);

  let totalFail = sumChance(failurePlayerWithNoWounds(squashedResults));

  return <Table sx={{width: "100%"}}>
    <TableBody>
      <TableRow key="1">
        {descendByWounds(activePlayerWithWounds(squashedResults)).map((result) => (
          <ExpectedWoundsGraphCell
            key={result['id']}
            wounds={result['wounds']}
            chance={result['chance']}
            player={result['player']}
          />
          ))}
        {totalFail > 0 &&
          <ExpectedWoundsGraphCell
            key={-1}
            wounds={0}
            chance={totalFail}
            player='fail'
          />
        }
        {ascendByWounds(reactivePlayerWithWounds(squashedResults)).map((result) => (
          <ExpectedWoundsGraphCell
            key={result['id']}
            wounds={result['wounds']}
            chance={result['chance']}
            player={result['player']}
          />
        ))}
      </TableRow>
    </TableBody>
  </Table>
}

export default ExpectedWoundsGraph;
