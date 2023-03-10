import {Grid, InputLabel} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCrosshairs} from "@fortawesome/free-solid-svg-icons";
import {clamp} from "ramda";
import UncontrolledInput from "../componets/UncontrolledInput";
import IncrementDecrementIconButtonGroup from '../componets/IncrementDecrementIconButtonGroup';

function SuccessValueInput(props){
  const successValue = props.successValue;
  const update = props.update;
  const variant = props.variant ?? 'active';
  const min = 1;
  const max = 30;

  const theme = useTheme();
  const colorLight = theme.palette.player[variant]["100"];
  const colorMid = theme.palette.player[variant]["500"];

  const handleOnBlur = (newValue) => {
    let val = Number(newValue);
    if (isNaN(val)){
      // do nothing
      return
    } else {
      val = clamp(min, max, val);
    }
    update(val);
  }


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
      <UncontrolledInput
        key={props.successValue}
        value={successValue}
        onBlur={(event) => handleOnBlur(event.target.value)}
        variant={variant}
      />
    </Grid>
    <Grid item xs={1}></Grid>
    <Grid item xs={9} sx={{display: 'flex', justifyContent:"left"}} >
      <IncrementDecrementIconButtonGroup
        value={successValue}
        update={update}
        min={min}
        max={max}
        icon={<FontAwesomeIcon
          icon={faCrosshairs}
          style={{paddingLeft: 4, paddingRight: 4, color: colorMid, alignSelf: "center"}}
          className="fa-xl"/>}
      />
    </Grid>
  </>
}

export default SuccessValueInput;
