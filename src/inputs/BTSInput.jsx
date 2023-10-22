import {Grid, InputLabel, Tooltip} from "@mui/material";
import PropTypes from "prop-types";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faShieldVirus} from "@fortawesome/free-solid-svg-icons";
import {clamp} from "ramda";
import UncontrolledInput from "../componets/UncontrolledInput.jsx";
import IncrementDecrementIconButtonGroup from '../componets/IncrementDecrementIconButtonGroup';


function BTSInput({bts, update, variant, ...rest}){
  const min = 0;
  const max = 12;

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
      <Tooltip title="BTS value. This box only shows if plasma ammo is used.">
        <InputLabel sx={{mt:1}}>BTS</InputLabel>
      </Tooltip>
    </Grid>
    <Grid item xs={2} sx={gridStyle}>
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

BTSInput.propTypes = {
  bts: PropTypes.number,
  update: PropTypes.func,
  variant: PropTypes.string,
}

BTSInput.defaultProps = {
  variant: 'active',
}

export default BTSInput;
