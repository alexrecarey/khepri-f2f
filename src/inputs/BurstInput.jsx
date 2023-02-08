import {faDiceD20} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Rating} from "@mui/material";

function BurstInput(props) {
  const burst = props.burst;
  const update = props.update;
  const color = props.color;

  return <Rating
    value={burst}
    min={1}
    max={6}
    size="large"
    onChange={(event, newValue) => {
      update(newValue);
    }}
    icon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, color: color}} icon={faDiceD20}/>}
    emptyIcon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, opacity: 0.55}} icon={faDiceD20}/>}
  />
}

export default BurstInput;
