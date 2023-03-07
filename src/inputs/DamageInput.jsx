import {Grid, InputLabel} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBurst} from "@fortawesome/free-solid-svg-icons";
import UncontrolledInput from "../componets/UncontrolledInput.jsx";
import IncrementDecrementIconButtonGroup from '../componets/IncrementDecrementIconButtonGroup';
import {clamp} from "ramda";

function DamageInput(props) {
  const damage = props.damage;
  const update = props.update;
  const variant = props.variant ?? 'active';
  const min = 0;
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
      val = clamp(0, 30, val);
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
      <InputLabel sx={{mt:1}}>Damage</InputLabel>
    </Grid>
    <Grid item xs={2} sx={gridStyle}
    >
      <UncontrolledInput
        key={props.damage}
        value={damage}
        onBlur={(event) => handleOnBlur(event.target.value)}
        variant={variant}
      />
    </Grid>
    <Grid item xs={1}></Grid>
    <Grid item xs={9} sx={{display: 'flex', justifyContent:"left"}} >
      <IncrementDecrementIconButtonGroup
        value={damage}
        update={update}
        min={min}
        max={max}
        icon={<FontAwesomeIcon
          icon={faBurst}
          style={{paddingLeft: 4, paddingRight: 4, color: colorMid, alignSelf: "center"}}
          className="fa-xl"/>}
      />
    </Grid>
  </>
}

export default DamageInput;
