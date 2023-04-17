import {faDiceD20} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Collapse, Grid, InputLabel, Rating, Typography} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import {clamp} from "ramda";
import UncontrolledInput from "../componets/UncontrolledInput.jsx";


function BurstInput(props) {
  const burst = props.burst;
  const update = props.update;
  const variant = props.variant ?? 'active';

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
      val = clamp(0, 6, val);
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
      <InputLabel>Burst</InputLabel>
    </Grid>
    <Grid item xs={12} sx={{textAlign: 'left'}}>
      <Collapse in={props.info}>
        <Typography variant='caption'>Final burst after bonuses (fire team, multiple combatants in CC, etc). You can
        set Reactive burst to 0 to calculate unopposed shots by double clicking on the die or typing 0 in the value box.
        </Typography>
      </Collapse>
    </Grid>
    <Grid item xs={2} sx={gridStyle}>
      <UncontrolledInput
        key={props.burst}
        value={burst}
        onBlur={(event) => handleOnBlur(event.target.value)}
        variant={variant}
      />
    </Grid>
    <Grid item xs={1}></Grid>
    <Grid item xs={9} sx={{display:"flex", justifyContent:"left", alignItems:"center"}}>
      <Rating
        value={burst}
        min={1}
        max={6}
        size="large"
        onChange={(event, newValue) => {
          if(newValue !== null){
            update(newValue);
          } else if(variant === 'reactive'){
            update(0)
          }
        }}
        icon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, color: colorMid}} icon={faDiceD20}/>}
        emptyIcon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, opacity: 0.55}} icon={faDiceD20}/>}
      />
    </Grid>
  </>
}

export default BurstInput;
