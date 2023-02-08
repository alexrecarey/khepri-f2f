import {Slider, Stack, Typography} from "@mui/material";

function ArmorInput(props){
  const armor = props.armor;
  const update = props.update;
  return <Stack spacing={2} direction="row" sx={{mb:1}} alignItems="center">
    <Typography>ARM</Typography>
    <Typography>{armor}</Typography>
    <Slider value={armor} step={1} min={0} max={10} onChange={(event, newValue) => {update(newValue)}}/>
  </Stack>
}

export default ArmorInput;
