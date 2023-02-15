import {Grid, InputLabel, ToggleButtonGroup, Typography} from "@mui/material";
import MuiToggleButton from "@mui/material/ToggleButton";
import { styled, useTheme } from "@mui/material/styles";


function AmmoInput(props){
  const ammo = props.ammo;
  const update = props.update;
  const cont = props.cont;
  const setCont = props.updateCont;
  const variant = props.variant ?? 'active';

  const theme = useTheme();
  const colorLight = theme.palette.player[variant]["100"];
  const colorMid = theme.palette.player[variant]["500"];
  const colorDark = theme.palette.player[variant]["700"];
  const toggleCont = (event) => {
    setCont(event.target.checked);
  };

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
      <InputLabel sx={{mt:1}}>Ammunition</InputLabel></Grid>
    <Grid item xs={2} sx={gridStyle}>
      <Typography sx={textStyle}>{ammo}</Typography></Grid>
    <Grid item xs={1}></Grid>
    <Grid item xs={9} sx={{display:"flex", justifyContent:"left", alignItems:"center"}}>
      <ToggleButtonGroup
        exclusive
        value={ammo}
        size="small"
        onChange={
          (event, newAmmo) => {
            if(newAmmo !== null){
              update(newAmmo);
            }}}
      >
        <ToggleButton sx={{fontWeight:'bold', minWidth:'3em'}} value="N">N</ToggleButton>
        <ToggleButton sx={{fontWeight:'bold', minWidth:'3em'}} value="DA">DA</ToggleButton>
        <ToggleButton sx={{fontWeight:'bold', minWidth:'3em'}} value="EXP">EXP</ToggleButton>
        <ToggleButton sx={{fontWeight:'bold', minWidth:'3em'}} value="T2">T2</ToggleButton>
        <ToggleButton sx={{fontWeight:'bold', minWidth:'3em'}} value="DODGE">Dodge</ToggleButton>
      </ToggleButtonGroup>
    </Grid>
    <Grid item xs={1}>

    </Grid>
    <Grid item xs={11}>
      {/*<Box sx={{flexGrow: 1}}></Box>*/}
      {/*<ToggleButton sx={{fontWeight:'bold', minWidth:'3em'}}*/}
      {/*              value="CONT"*/}
      {/*              size="small"*/}
      {/*              selected={cont}*/}
      {/*              onChange={() => {*/}
      {/*                setCont(!cont);*/}
      {/*              }}>CONT</ToggleButton>*/}
      {/*<FormControlLabel labelPlacement="end" control={*/}
      {/*  <Checkbox checked={cont} onChange={toggleCont} />} label="Continuous" />*/}
    </Grid>
  </>
}

export default AmmoInput;
