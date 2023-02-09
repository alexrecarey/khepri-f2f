import {Grid, InputLabel, ToggleButtonGroup, Typography} from "@mui/material";
import MuiToggleButton from "@mui/material/ToggleButton";
import { styled } from "@mui/material/styles";

function AmmoInput(props){
  const ammo = props.ammo;
  const update = props.update;
  //const variant = props.variant;

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

  const ToggleButton = styled(MuiToggleButton)({
    "&.Mui-selected, &.Mui-selected:hover": {
      color: "white",
      backgroundColor: '#b14d8e',
      fontWeight: 'bold'
    },
    "MuiToggleButton-root": {
      color:'#6c2167',
      fontWeight: 'bold',
    }
  });

  return  <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <InputLabel>Ammunition</InputLabel></Grid>
    <Grid item xs={2} sx={gridStyle}>
      <Typography sx={textStyle}>{ammo}</Typography></Grid>
    <Grid item xs={1}></Grid>
    <Grid item xs={9} sx={{display:"flex", justifyContent:"left", alignItems:"center"}}>
      <ToggleButtonGroup
        exclusive
        value={ammo}
        onChange={
          (event, newAmmo) => {
            if(newAmmo !== null){
              update(newAmmo);
            }}}
      >
        <ToggleButton sx={{fontWeight:'bold'}} value="N">N</ToggleButton>
        <ToggleButton sx={{fontWeight:'bold'}} value="DA">DA</ToggleButton>
        <ToggleButton sx={{fontWeight:'bold'}} value="EXP">EXP</ToggleButton>
      </ToggleButtonGroup>
    </Grid>
  </>
}

export default AmmoInput;
