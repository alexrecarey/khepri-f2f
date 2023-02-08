import {List, ListItem, Typography} from "@mui/material";


function ResultListItem(props){
  const item = props.item
  return <ListItem>
    <Typography>{item['player']} player causes {item['wounds']} wounds: {(item['chance']*100).toFixed(1)}%</Typography>
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
