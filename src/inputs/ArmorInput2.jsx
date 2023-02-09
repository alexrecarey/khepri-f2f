import {Grid, InputLabel, Slider, Typography} from "@mui/material";
import { useTheme } from '@mui/material/styles';


function ArmorInput(props){
  const variant = props.variant ?? 'active';

  const theme = useTheme();
  const colorLight = theme.palette.player[variant]["100"];
  const colorDark = theme.palette.player[variant]["700"];

  const gridStyle = {
    bgcolor: colorLight,
    display: "flex",
    justifyContent:"center",
    alignItems:"center",
    borderRadius: '8px 8px 8px 8px',
    p:1};

  const textStyle = {
    color: colorDark,
    fontWeight: 'bold'
  };

  const armor = props.armor;
  const update = props.update;

  return <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <InputLabel>Armor</InputLabel></Grid>
    <Grid item xs={2} sx={gridStyle}>
      <Typography sx={textStyle}>{armor}</Typography></Grid>
    <Grid item xs={1}></Grid>
    <Grid item xs={9} sx={{display:"flex", justifyContent:"left", alignItems:"center"}}>
      <Slider value={armor} step={1} min={0} max={10} onChange={(event, newValue) => {update(newValue)}}/>
    </Grid>
  </>
}

export default ArmorInput;
