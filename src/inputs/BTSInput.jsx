import {Button, ButtonGroup, Grid, InputLabel} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faShieldVirus} from "@fortawesome/free-solid-svg-icons";
import UncontrolledInput from "../componets/UncontrolledInput.jsx";
import {clamp} from "ramda";

function BTSInput(props){
  const bts = props.bts;
  const update = props.update;
  const variant = props.variant ?? 'active';

  const theme = useTheme();
  const colorLight = theme.palette.player[variant]["100"];
  const colorMid = theme.palette.player[variant]["500"];
  //const colorDark = theme.palette.player[variant]["700"];

  const handleButtonPress = (amount) => {
    update(clamp(0, 12, amount + bts));
  };

  const handleOnBlur = (newValue) => {
    let val = Number(newValue);
    if (isNaN(val)){
      // do nothing
      return
    } else {
      val = clamp(0, 12, val);
    }
    update(val);
  }

  const gridStyle = {
    bgcolor: colorLight,
    display: "flex",
    justifyContent:"center",
    alignItems:"center",
    borderRadius: '8px 8px 8px 8px',
    p:1
  };

  return <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <InputLabel sx={{mt:1}}>BTS</InputLabel>
    </Grid>
    <Grid item xs={2} sx={gridStyle}
    >
      <UncontrolledInput
        key={props.bts}
        value={bts}
        onBlur={(event) => handleOnBlur(event.target.value)}
        variant={variant}
      />
    </Grid>
    <Grid item xs={1}></Grid>
    <Grid item xs={9} sx={{display: 'flex', justifyContent:"left"}} >
      <ButtonGroup>
        <Button onClick={() => handleButtonPress(-3)} tabIndex={-1}>-3</Button>
        <Button onClick={() => handleButtonPress(-1)} tabIndex={-1}>-1</Button>
      </ButtonGroup>
      <FontAwesomeIcon icon={faShieldVirus} style={{paddingLeft: 4, paddingRight: 4, color: colorMid, alignSelf: "center"}} className="fa-xl"/>
      <ButtonGroup>
        <Button onClick={() => handleButtonPress(+1)} tabIndex={-1}>+1</Button>
        <Button onClick={() => handleButtonPress(+3)} tabIndex={-1}>+3</Button>
      </ButtonGroup>
    </Grid>
  </>
}

export default BTSInput;