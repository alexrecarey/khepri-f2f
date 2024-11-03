import {Grid, InputLabel, ToggleButtonGroup, Tooltip} from "@mui/material";
import MuiToggleButton from "@mui/material/ToggleButton";
import { styled } from "@mui/material/styles";


function AmmoInput(props){
  const ammo = props.ammo;
  const update = props.update;
  const cont = props.cont;
  const setCont = props.updateCont;
  const title = props.title;
  const tooltip = props.tooltip;
  const variant = props.variant ?? 'active';
  const dtw = props.dtw;
  const color = variant === 'active' ? 'primary' : 'secondary'

  const selected = dtw ? "DODGE" : ammo;

  const ToggleButton = styled(MuiToggleButton)({
    fontWeight: 'bold',
    minWidth: '3em',
  });

  return  <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <Tooltip title={tooltip}>
        <InputLabel sx={{mt:1}}>{title}</InputLabel>
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
