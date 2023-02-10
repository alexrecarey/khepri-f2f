import {Box, List, ListItem, Typography} from "@mui/material";


function ResultListItem(props){
  const item = props.item
  let winner;
  if(item['player'] === 'tie'){
    winner = <Typography><Box component='span' fontWeight='bold'>
      No wounds caused:</Box> {(item['chance']*100).toFixed(1)}%</Typography>
  } else {
    winner = <Typography><Box component='span' fontWeight='bold'>{item['player'].toUpperCase()}</Box> player
      causes at least {item['wounds']} wounds: {(item['cumulative_chance']*100).toFixed(1)}%.
      (exactly {item['wounds']} wounds: {(item['chance']*100).toFixed(1)}%).
  </Typography>
  }
  return <ListItem>
    {winner}
  </ListItem>
}

function F2FResultList(props){
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

export default F2FResultList;
