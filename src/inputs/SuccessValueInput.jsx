import {Button, ButtonGroup, Stack, Typography} from "@mui/material";

function SuccessValueInput(props){
  const successValue = props.successValue;
  const update = props.update;
  const handleButtonPress = (amount, setter) => {
    if (amount + successValue >= 30) {
      setter(30);
    } else if (amount + successValue <= 1) {
      setter(1);
    } else {
      setter(amount + successValue);
    }
  };

  return <Stack alignItems="center" justifyContent="center" direction="row">
    <ButtonGroup>
      <Button onClick={() => handleButtonPress(-3, update)}>-3</Button>
      <Button onClick={() => handleButtonPress(-1, update)}>-1</Button>
    </ButtonGroup>
    <Typography sx={{fontSize: 24, fontWeight: "bold", pl: 2, pr: 2}}>{successValue}</Typography>
    <ButtonGroup>
      <Button onClick={() => handleButtonPress(+1, update)}>+1</Button>
      <Button onClick={() => handleButtonPress(+3, update)}>+3</Button>
    </ButtonGroup>
  </Stack>;
}

export default SuccessValueInput;
