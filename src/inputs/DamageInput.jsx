import {Grid, InputLabel, Tooltip} from "@mui/material";
import PropTypes from "prop-types";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBurst} from "@fortawesome/free-solid-svg-icons";
import UncontrolledInput from "../componets/UncontrolledInput.jsx";
import IncrementDecrementIconButtonGroup from '../componets/IncrementDecrementIconButtonGroup';
import {clamp} from "ramda";


function DamageInput({damage, update, variant, title, tooltip}) {
  const min = 0;
  const max = 20;

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
    <Grid item xs={2} sx={gridStyle}
    >
      <UncontrolledInput
        key={damage}
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
        variant={variant}
        icon={<FontAwesomeIcon
          icon={faBurst}
          style={{paddingLeft: 4, paddingRight: 4, alignSelf: "center"}}
          className="fa-xl"/>}
      />
    </Grid>
  </>
}

DamageInput.propTypes = {
  damage: PropTypes.number,
  update: PropTypes.func,
  variant: PropTypes.string,
}

DamageInput.defaultProps = {
  variant: 'active',
}

export default DamageInput;
