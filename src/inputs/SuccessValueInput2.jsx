import {Button, ButtonGroup, Grid, InputLabel, Typography} from "@mui/material";

function SuccessValueInput(props){
  const successValue = props.successValue;
  const update = props.update;
  const handleButtonPress = (amount, setter) => {
    if (amount + successValue >= 30) {
      setter(30);
    } else if (amount + successValue <= 1) {
      setter(1);
    } else {
      setter(amount + successValue);
    }
  };

  return <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <InputLabel>Success Value</InputLabel>
    </Grid>
    <Grid item xs={1} sx={{
      bgcolor: '#f3cbd3',
      display: "flex",
      justifyContent:"center",
      alignItems:"center",
      borderRadius: '8px 0 0 8px',
      p:1}}
    >
      <Typography color='#6c2167' fontWeight="bold">SV</Typography>
    </Grid>
    <Grid item xs={1} sx={{
      bgcolor: '#f3cbd3',
      display: "flex",
      justifyContent:"center",
      alignItems:"center",
      borderRadius: '0 8px 8px 0',
      p:1}}
    >
      <Typography sx={{fontWeight: "bold", color: '#6c2167'}}>{successValue}</Typography>
    </Grid>
    <Grid item xs={10}>
      <ButtonGroup>
        <Button onClick={() => handleButtonPress(-3, update)}>-3</Button>
        <Button onClick={() => handleButtonPress(-1, update)}>-1</Button>
        <Button onClick={() => handleButtonPress(+1, update)}>+1</Button>
        <Button onClick={() => handleButtonPress(+3, update)}>+3</Button>
      </ButtonGroup>
    </Grid>
  </>
}

export default SuccessValueInput;
