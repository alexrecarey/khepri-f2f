import {Grid, InputLabel, ToggleButtonGroup, Typography} from "@mui/material";
import MuiToggleButton from "@mui/material/ToggleButton";
import { styled, useTheme } from "@mui/material/styles";


function AmmoInput(props){
  const ammo = props.ammo;
  const update = props.update;
  const variant = props.variant ?? 'active';

  const theme = useTheme();
  const colorLight = theme.palette.player[variant]["100"];
  const colorMid = theme.palette.player[variant]["500"];
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

  const ToggleButton = styled(MuiToggleButton)({
    "&.Mui-selected, &.Mui-selected:hover": {
      color: "white",
      backgroundColor: colorMid,
      fontWeight: 'bold'
    },
    "MuiToggleButton-root": {
      color: colorMid,
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
        <ToggleButton sx={{fontWeight:'bold', minWidth:'4em'}} value="N">N</ToggleButton>
        <ToggleButton sx={{fontWeight:'bold', minWidth:'4em'}} value="DA">DA</ToggleButton>
        <ToggleButton sx={{fontWeight:'bold', minWidth:'4em'}} value="EXP">EXP</ToggleButton>
        <ToggleButton sx={{fontWeight:'bold', minWidth:'4em'}} value="DODGE">Dodge</ToggleButton>
      </ToggleButtonGroup>

    </Grid>
  </>
}

export default AmmoInput;
