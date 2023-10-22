import {Button, ButtonGroup} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import {clamp} from "ramda";


function IncrementDecrementIconButtonGroup(props){
  const value = props.value;
  const update = props.update;
  const icon = props.icon;
  const min = props.min;
  const max = props.max;
  const variant = props.variant || 'active';
  const color = variant === 'active' ? 'primary' : 'secondary';

  const handleButtonPress = (amount) => {
    update(clamp(min, max, amount + value));
  };

  return ( <>
      <ButtonGroup color={color}>
        <Button sx={{fontFamily: 'conthrax'}} variant="outlined" onClick={() => handleButtonPress(-3)} tabIndex={-1} disabled={value === min}>-3</Button>
        <Button sx={{fontFamily: 'conthrax'}} variant="outlined" onClick={() => handleButtonPress(-1)} tabIndex={-1} disabled={value === min}>-1</Button>
      </ButtonGroup>
      {icon}
      <ButtonGroup color={color}>
        <Button sx={{fontFamily: 'conthrax'}} variant="outlined" onClick={() => handleButtonPress(+1)} tabIndex={-1} disabled={value === max}>+1</Button>
        <Button sx={{fontFamily: 'conthrax'}} variant="outlined" onClick={() => handleButtonPress(+3)} tabIndex={-1} disabled={value === max}>+3</Button>
      </ButtonGroup>
    </>
  )
}

export default IncrementDecrementIconButtonGroup;
