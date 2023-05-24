import {Table, TableBody, TableCell, TableRow} from "@mui/material";
import {
  activePlayerWithWounds,
  ascendByWounds,
  descendByWounds,
  failurePlayerWithNoWounds,
  reactivePlayerWithWounds,
  sumChance
} from "./DataTransform.js";


function ExpectedWoundsGraphCell(props) {
  const active_colors = [ '#dd88ac', '#ca699d', '#b14d8e', '#91357d', '#6c2167'];
  const reactive_colors = ['#6cc08b', '#4c9b82', '#217a79', '#105965', '#074050'];
  //const active_colors = [theme.palette.player['active'][300], theme.palette.player[400], theme.palette.player[500], theme.palette.player['active'][600], theme.palette.player['active'][700]];
  //const data = props.row;
  const player = props.player;
  const chance = props.chance;
  const wounds = props.wounds;

  const width = (chance * 100).toFixed(1) + "%";
  // const percentage = (data['chance'] * 100).toFixed(0) + "%";

  let color;
  if(player === 'active' && wounds > 0){
    color = active_colors[wounds];
  } else if(player === 'reactive' && wounds > 0){
    color = reactive_colors[wounds];
  } else {
    color = 'lightgrey';
  }

  return <TableCell sx={{bgcolor: color, width: width, padding:0, height: '30px', textAlign: 'center'}}>
    {chance >= 0.1 &&
      <div>{wounds}{wounds === 3 &&<span>+</span>}</div>
    }
  </TableCell>;
}


function ExpectedWoundsGraph(props) {
  const results = props.rows;
  if (!results) {
    return null
  }

  let totalFail = sumChance(failurePlayerWithNoWounds(results));

  return <Table sx={{width: "100%"}}>
    <TableBody>
      <TableRow key="1">
        {descendByWounds(activePlayerWithWounds(results)).map((result) => (
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
        {ascendByWounds(reactivePlayerWithWounds(results)).map((result) => (
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
