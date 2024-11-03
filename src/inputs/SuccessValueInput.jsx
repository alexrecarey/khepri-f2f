import {Grid, InputLabel, Tooltip} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCrosshairs} from "@fortawesome/free-solid-svg-icons";
import {clamp} from "ramda";
import UncontrolledInput from "../componets/UncontrolledInput";
import IncrementDecrementIconButtonGroup from '../componets/IncrementDecrementIconButtonGroup';
import PropTypes from "prop-types";


function SuccessValueInput({successValue, update, variant, title, tooltip}){
  const min = 1;
  const max = 30;

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
    //bgcolor: colorLight,
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
        key={successValue}
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
        variant={variant}
        icon={<FontAwesomeIcon
          icon={faCrosshairs}
          style={{paddingLeft: 4, paddingRight: 4, alignSelf: "center"}}
          className="fa-xl"/>}
      />
    </Grid>
  </>
}

SuccessValueInput.propTypes = {
  successValue: PropTypes.number,
  update: PropTypes.func,
  variant: PropTypes.string,
}

SuccessValueInput.defaultProps = {
  variant: 'active',
}

export default SuccessValueInput;
