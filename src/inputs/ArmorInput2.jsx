import {Grid, InputLabel, Slider, Typography} from "@mui/material";

function ArmorInput(props){
  const gridStyle = {
    bgcolor: '#f3cbd3',
    display: "flex",
    justifyContent:"center",
    alignItems:"center",
    borderRadius: '8px 8px 8px 8px',
    p:1};

  const textStyle = {
    color:'#6c2167',
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
