import {Grid, InputLabel, Tooltip} from "@mui/material";
import PropTypes from "prop-types";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faShieldHalved} from "@fortawesome/free-solid-svg-icons";
import {clamp} from "ramda";
import UncontrolledInput from "../componets/UncontrolledInput.jsx";
import IncrementDecrementIconButtonGroup from '../componets/IncrementDecrementIconButtonGroup';


function ArmorInput({armor, update, variant, title, tooltip}){
  const min = 0;
  const max = 13;

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
    // bgcolor: colorLight,
    display: "flex",
    justifyContent:"center",
    alignItems:"center",
    borderRadius: '8px 8px 8px 8px',
    p:1};


  return <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <Tooltip title={tooltip}>
        <InputLabel sx={{mt:1}}>{title}</InputLabel>
      </Tooltip>
    </Grid>
    <Grid item xs={2} sx={gridStyle}>
      <UncontrolledInput
        key={armor}
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
        variant={variant}
        icon={<FontAwesomeIcon
          icon={faShieldHalved}
          style={{paddingLeft: 4, paddingRight: 4, alignSelf: "center"}}
          className="fa-xl"/>}
      />
    </Grid>
  </>
}


ArmorInput.propTypes = {
  armor: PropTypes.number,
  update: PropTypes.func,
  variant: PropTypes.string,
  hideBTS: PropTypes.bool
}

ArmorInput.defaultProps = {
  variant: 'active',
  hideBTS: false
}


export default ArmorInput;
