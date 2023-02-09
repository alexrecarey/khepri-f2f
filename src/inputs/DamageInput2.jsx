import {Grid, InputLabel, Slider, Typography} from "@mui/material";

function DamageInput(props) {
  const damage = props.damage;
  const update = props.update;

  const gridStyleLeft = {
    bgcolor: '#f3cbd3',
    display: "flex",
    justifyContent:"center",
    alignItems:"center",
    borderRadius: '8px 0 0 8px',
    p:1};

  const gridStyleRight = {
    bgcolor: '#f3cbd3',
    display: "flex",
    justifyContent:"center",
    alignItems:"center",
    borderRadius: '0 8px 8px 0',
    p:1}

  const textStyle = {
    color:'#6c2167',
    fontWeight: 'bold'
  };

  return <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <InputLabel>Damage</InputLabel></Grid>
    <Grid item xs={1} sx={gridStyleLeft}>
      <Typography sx={textStyle}>DAM</Typography></Grid>
    <Grid item xs={1} sx={gridStyleRight}>
      <Typography sx={textStyle}>{damage}</Typography></Grid>
    <Grid item xs={10} sx={{display:"flex", justifyContent:"center", alignItems:"center", pl:2, pr:2}}>
      <Slider
        value={damage} step={1} min={10} max={20}
        onChange={(event, newValue) => {
          update(newValue)
      }}/>
    </Grid>
  </>
}

export default DamageInput;
