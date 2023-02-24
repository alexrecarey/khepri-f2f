import {Table, TableBody, TableCell, TableRow} from "@mui/material";
import {activePlayer, ascendByWounds, descendByWounds, failurePlayer, reactivePlayer} from "./DataTransform.js";


function ExpectedWoundsGraphCell(props) {
  const active_colors = [ '#dd88ac', '#ca699d', '#b14d8e', '#91357d', '#6c2167'];
  const reactive_colors = ['#6cc08b', '#4c9b82', '#217a79', '#105965', '#074050'];
  //const active_colors = [theme.palette.player['active'][300], theme.palette.player[400], theme.palette.player[500], theme.palette.player['active'][600], theme.palette.player['active'][700]];
  const data = props.row;
  const width = (data['chance'] * 100).toFixed(1) + "%";
  // const percentage = (data['chance'] * 100).toFixed(0) + "%";

  let color;
  if(data['player'] === 'active'){
    color = active_colors[data['wounds']];
  } else if(data['player'] === 'reactive'){
    color = reactive_colors[data['wounds']];
  } else {
    color = 'lightgrey';
  }
  let key_ = data['player'] + '-' + data['wounds'];
  console.debug(`Width of cell ${key_} is ${width}`);

  return <TableCell sx={{bgcolor: color, width: width, padding:0, height: '30px', textAlign: 'center'}}>
    {data['chance'] >= 0.1 &&
      <div>{data['wounds']}</div>
    }
  </TableCell>;
}


function ExpectedWoundsGraph(props) {
  const results = props.rows;
  if (!results) {
    return null
  }

  let activeResults = descendByWounds(activePlayer(results));
  let failureResults = failurePlayer(results);
  let reactiveResults = ascendByWounds(reactivePlayer(results));

  return <Table sx={{width: "100%"}}>
    <TableBody>
      <TableRow key="1">
        {activeResults.map((result) => (<ExpectedWoundsGraphCell key={result['id']} row={result}/>))}
        {failureResults.map((result) => (<ExpectedWoundsGraphCell key={result['id']} row={result}/>))}
        {reactiveResults.map((result) => (<ExpectedWoundsGraphCell key={result['id']} row={result}/>))}
      </TableRow>
    </TableBody>
  </Table>
}

export default ExpectedWoundsGraph;
