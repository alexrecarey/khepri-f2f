import {faDiceD20} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Grid, IconButton, InputLabel, Rating, Tooltip} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import PropTypes from "prop-types";
import {clamp} from "ramda";
import UncontrolledInput from "../componets/UncontrolledInput.jsx";
import DiceD20NegatedIcon from "../componets/DiceD20NegatedIcon.jsx"


function BurstInput({burst, update, variant}) {
  const theme = useTheme();
  const colorMid = theme.palette[variant]["500"];
  const maxViewableBurst = variant === 'active' ? 6 : 5;
  const zeroBurstColor = burst === 0 ? colorMid : 'grey';

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
    //bgcolor: colorLight,
    display: "flex",
    justifyContent:"center",
    alignItems:"center",
    borderRadius: '8px 8px 8px 8px',
    p:1};

  return <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <Tooltip title="Final burst after bonuses (fire team, multiple combatants in CC, etc). You can
        set Reactive burst to 0 to calculate unopposed shots by double clicking on the die or typing 0 in the value box.">
        <InputLabel>Burst</InputLabel>
      </Tooltip>
    </Grid>
    <Grid item xs={2} sx={gridStyle}>
      <UncontrolledInput
        key={burst}
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
        max={maxViewableBurst}
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
      {variant === 'reactive' && <IconButton
        onClick={()=>update(0)}>
        <DiceD20NegatedIcon sx={{height:30, width:30}} htmlColor={zeroBurstColor} />
      </IconButton>}
    </Grid>
  </>
}

BurstInput.propTypes = {
  burst: PropTypes.number,
  update: PropTypes.func,
  variant: PropTypes.string,
}

BurstInput.defaultProps = {
  variant: 'active',
}


export default BurstInput;
