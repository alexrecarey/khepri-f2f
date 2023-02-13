import {Button, ButtonGroup, Grid, InputLabel, Typography} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCrosshairs} from "@fortawesome/free-solid-svg-icons";

function SuccessValueInput(props){
  const successValue = props.successValue;
  const update = props.update;
  const variant = props.variant ?? 'active';

  const theme = useTheme();
  const colorLight = theme.palette.player[variant]["100"];
  const colorMid = theme.palette.player[variant]["500"];
  const colorDark = theme.palette.player[variant]["700"];


  const handleButtonPress = (amount) => {
    if (amount + successValue >= 30) {
      update(30);
    } else if (amount + successValue <= 1) {
      update(1);
    } else {
      update(amount + successValue);
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
      <InputLabel sx={{mt:1}}>Success Value</InputLabel>
    </Grid>
    <Grid item xs={2} sx={gridStyle}
    >
      <Typography sx={{fontWeight: "bold", color: colorDark}}>{successValue}</Typography>
    </Grid>
    <Grid item xs={1}></Grid>
    <Grid item xs={9} sx={{display: 'flex', justifyContent:"left"}} >
      <ButtonGroup>
        <Button onClick={() => handleButtonPress(-3)}>-3</Button>
        <Button onClick={() => handleButtonPress(-1)}>-1</Button>
      </ButtonGroup>
      <FontAwesomeIcon icon={faCrosshairs} style={{paddingLeft: 4, paddingRight: 4, color: colorMid, alignSelf: "center"}} className="fa-xl"/>
      <ButtonGroup>
        <Button onClick={() => handleButtonPress(+1)}>+1</Button>
        <Button onClick={() => handleButtonPress(+3)}>+3</Button>
      </ButtonGroup>
    </Grid>
  </>
}

export default SuccessValueInput;
