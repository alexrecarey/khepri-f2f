import {Table, TableBody, TableCell, TableRow} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import {activePlayer, failurePlayer, reactivePlayer} from "./DataTransform.js";

function FaceToFaceGraphCell(props) {
  const theme = useTheme();
  const data = props.row;
  const width = (data['chance'] * 100).toFixed(1) + "%";
  // const percentage = (data['chance'] * 100).toFixed(0) + "%";

  let color;
  if(data['player'] === 'active'){
    color = theme.palette['active'][400];
  } else if(data['player'] === 'reactive'){
    color = theme.palette['reactive'][400];
  } else {
    color = theme.palette['failure'][100];
  }

  return <TableCell sx={{bgcolor: color, width: width, padding:0, height: '30px', textAlign: 'center'}}>
    {data['chance'] >= 0.1 &&
      <div>{width}</div>
    }
  </TableCell>;
}

function FaceToFaceGraph(props) {
  const results = props.rows;

  if(!results){
    return <div/>
  }

  let activeResults = activePlayer(results);
  let failureResults = failurePlayer(results);
  let reactiveResults = reactivePlayer(results);

  return <Table sx={{width:"100%"}}>
    <TableBody>
      <TableRow key="1">
        {activeResults.map((result) => (<FaceToFaceGraphCell key={result['id']} row={result}/>))}
        {failureResults.map((result) => (<FaceToFaceGraphCell key={result['id']} row={result}/>))}
        {reactiveResults.map((result) => (<FaceToFaceGraphCell key={result['id']} row={result}/>))}
      </TableRow>
    </TableBody>
  </Table>
}

export default FaceToFaceGraph;
