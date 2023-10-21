import {Grid, InputLabel} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faShieldVirus} from "@fortawesome/free-solid-svg-icons";
import {clamp} from "ramda";
import UncontrolledInput from "../componets/UncontrolledInput.jsx";
import IncrementDecrementIconButtonGroup from '../componets/IncrementDecrementIconButtonGroup';

function BTSInput(props){
  const bts = props.bts;
  const update = props.update;
  const variant = props.variant ?? 'active';
  const min = 0;
  const max = 12;

  const theme = useTheme();
  const colorLight = theme.palette[variant]["100"];
  const colorMid = theme.palette[variant]["500"];
  //const colorDark = theme.palette[variant]["700"];

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
    //bgcolor: colorLight,
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
      <IncrementDecrementIconButtonGroup
        value={bts}
        update={update}
        min={min}
        max={max}
        variant={variant}
        icon={<FontAwesomeIcon
          icon={faShieldVirus}
          style={{paddingLeft: 4, paddingRight: 4, alignSelf: "center"}}
          className="fa-xl"/>}
      />
    </Grid>
  </>
}

export default BTSInput;
