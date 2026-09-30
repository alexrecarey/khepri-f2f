import {Grid, InputLabel, ToggleButtonGroup, Tooltip} from "@mui/material";
import MuiToggleButton from "@mui/material/ToggleButton";
import { styled } from "@mui/material/styles";
import {AMMO} from "../engine/params.js";


function AmmoInput(props){
  const ammo = props.ammo;
  const update = props.update;
  const cont = props.cont;
  const setCont = props.updateCont;
  const shock = props.shock;
  const setShock = props.updateShock;
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
        {/* NONE is only set by Matchup mode (an attack its target is immune to). */}
        {AMMO.filter((a) => a !== 'NONE').map((a) => <ToggleButton key={a} value={a}>{a === 'DODGE' ? 'Dodge' : a}</ToggleButton>)}
      </ToggleButtonGroup>
      <ToggleButton sx={{fontWeight:'bold', minWidth:'3em'}}
                    color={color}
                    value="CONT"
                    size="small"
                    selected={cont}
                    onChange={() => {
                      setCont(!cont);
                    }}>CONT</ToggleButton>
      <Tooltip title="Shock against a target with VITA 1 and no Immunity (Shock): any failed save sends it straight
                      to Dead, counted as one extra wound.">
        <ToggleButton sx={{fontWeight:'bold', minWidth:'3em'}}
                      color={color}
                      value="SHOCK"
                      size="small"
                      selected={shock}
                      onChange={() => {
                        setShock(!shock);
                      }}>SHOCK</ToggleButton>
      </Tooltip>
    </Grid>
  </>
}

export default AmmoInput;
