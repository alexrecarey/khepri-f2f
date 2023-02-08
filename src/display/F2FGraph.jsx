import {Table, TableBody, TableCell, TableRow} from "@mui/material";

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

export default F2FGraph;
