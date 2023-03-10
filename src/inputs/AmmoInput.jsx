import {Grid, InputLabel, ToggleButtonGroup} from "@mui/material";
import MuiToggleButton from "@mui/material/ToggleButton";
import { styled, useTheme } from "@mui/material/styles";


function AmmoInput(props){
  const ammo = props.ammo;
  const update = props.update;
  const cont = props.cont;
  const setCont = props.updateCont;
  const variant = props.variant ?? 'active';

  const theme = useTheme();
  const colorMid = theme.palette.player[variant]["500"];


  const ToggleButton = styled(MuiToggleButton)({
    fontWeight: 'bold',
    minWidth: '3em',
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
    <Grid item xs={12} sx={{display:"flex", justifyContent:"left", alignItems:"center", flexWrap: "wrap"}}>
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
        <ToggleButton value="N">N</ToggleButton>
        <ToggleButton value="DA">DA</ToggleButton>
        <ToggleButton value="EXP">EXP</ToggleButton>
        <ToggleButton value="T2">T2</ToggleButton>
        <ToggleButton value="PLASMA">PLASMA</ToggleButton>
        <ToggleButton value="DODGE">Dodge</ToggleButton>
      </ToggleButtonGroup>
      <ToggleButton sx={{fontWeight:'bold', minWidth:'3em'}}
                    value="CONT"
                    size="small"
                    selected={cont}
                    onChange={() => {
                      setCont(!cont);
                    }}>CONT</ToggleButton>
    </Grid>
  </>
}

export default AmmoInput;
