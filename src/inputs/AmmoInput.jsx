import {Collapse, Grid, InputLabel, ToggleButtonGroup, Tooltip, Typography} from "@mui/material";
import MuiToggleButton from "@mui/material/ToggleButton";
import { styled, useTheme } from "@mui/material/styles";


function AmmoInput(props){
  const ammo = props.ammo;
  const update = props.update;
  const cont = props.cont;
  const setCont = props.updateCont;
  const variant = props.variant ?? 'active';
  const dtw = props.dtw;
  const color = variant === 'active' ? 'primary' : 'secondary'

  const selected = dtw ? "DODGE" : ammo;

  const ToggleButton = styled(MuiToggleButton)({
    fontWeight: 'bold',
    minWidth: '3em',
    // "&.Mui-selected, &.Mui-selected:hover": {
    //   color: theme.palette.getContrastText(colorMid),
    //   backgroundColor: colorMid,
    //   fontWeight: 'bold'
    // },
    // "MuiToggleButton-root": {
    //   color: colorMid,
    //   fontWeight: 'bold',
    // }
  });

  return  <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <Tooltip title="Calculate AP ammo by halving opposing ARM/BTS manually. Dodge will use the burst value, so smoke
       dodges in fire teams can be calculated.">
        <InputLabel sx={{mt:1}}>Ammunition</InputLabel>
      </Tooltip>
    </Grid>
    <Grid item xs={12} sx={{display:"flex", justifyContent:"left", alignItems:"center", flexWrap: "wrap"}}>
      <ToggleButtonGroup
        color={color}
        exclusive
        value={selected}
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
                    color={color}
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
