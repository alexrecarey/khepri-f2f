import {Button, ButtonGroup, Grid, InputLabel, Typography} from "@mui/material";
import { useTheme } from '@mui/material/styles';

function SuccessValueInput(props){
  const successValue = props.successValue;
  const update = props.update;
  const variant = props.variant ?? 'active';

  const theme = useTheme();
  const colorLight = theme.palette.player[variant]["100"];
  const colorDark = theme.palette.player[variant]["700"];


  const handleButtonPress = (amount, setter) => {
    if (amount + successValue >= 30) {
      setter(30);
    } else if (amount + successValue <= 1) {
      setter(1);
    } else {
      setter(amount + successValue);
    }
  };

  const gridStyle = {
    bgcolor: colorLight,
    display: "flex",
    justifyContent:"center",
    alignItems:"center",
    borderRadius: '8px 8px 8px 8px',
    p:1};

  return <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <InputLabel>Success Value</InputLabel>
    </Grid>
    <Grid item xs={2} sx={gridStyle}
    >
      <Typography sx={{fontWeight: "bold", color: colorDark}}>{successValue}</Typography>
    </Grid>
    <Grid item xs={1}></Grid>
    <Grid item xs={9} sx={{display: 'flex', justifyContent:"left"}} >
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
