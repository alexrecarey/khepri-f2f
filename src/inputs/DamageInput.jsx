import {Slider, Stack, Typography} from "@mui/material";

function DamageInput(props) {
  const damage = props.damage;
  const update = props.update;

  return <Stack spacing={2} direction="row" sx={{mb: 1}} alignItems="center">
    <Typography>DAM</Typography>
    <Typography>{damage}</Typography>
    <Slider value={damage} step={1} min={10} max={20} onChange={(event, newValue) => {
      update(newValue)
    }}/>
  </Stack>
}

export default DamageInput;
