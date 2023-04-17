import {Collapse, Grid, InputLabel, Typography} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faShieldHalved} from "@fortawesome/free-solid-svg-icons";
import {clamp} from "ramda";
import UncontrolledInput from "../componets/UncontrolledInput.jsx";
import IncrementDecrementIconButtonGroup from '../componets/IncrementDecrementIconButtonGroup';


function ArmorInput(props){
  const armor = props.armor;
  const update = props.update;
  const variant = props.variant ?? 'active';
  const hideBTS = props.hideBTS ?? false;
  const min = 0;
  const max = 13;

  const theme = useTheme();
  const colorLight = theme.palette.player[variant]["100"];
  const colorMid = theme.palette.player[variant]["500"];
  //const colorDark = theme.palette.player[variant]["700"];

  const handleOnBlur = (newValue) => {
    let val = Number(newValue);
    if (isNaN(val)){
      // do nothing
      return
    } else {
      val = clamp(0, 13, val);
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
      <InputLabel sx={{mt:1}}>Armor {!hideBTS && <span>/ BTS</span>}</InputLabel>
    </Grid>
    <Grid item xs={12} sx={{textAlign: 'left'}}>
      <Collapse in={props.info}>
        <Typography variant='caption'>Final computed armor value, after all modifiers. You must halve and round up
          if opposing player uses AP ammo.</Typography>
      </Collapse>
    </Grid>
    <Grid item xs={2} sx={gridStyle}
    >
      <UncontrolledInput
        key={props.armor}
        value={armor}
        onBlur={(event) => handleOnBlur(event.target.value)}
        variant={variant}
      />
    </Grid>
    <Grid item xs={1}></Grid>
    <Grid item xs={9} sx={{display: 'flex', justifyContent:"left"}} >
      <IncrementDecrementIconButtonGroup
        value={armor}
        update={update}
        min={min}
        max={max}
        icon={<FontAwesomeIcon
          icon={faShieldHalved}
          style={{paddingLeft: 4, paddingRight: 4, color: colorMid, alignSelf: "center"}}
          className="fa-xl"/>}
      />
    </Grid>
  </>
}

export default ArmorInput;
