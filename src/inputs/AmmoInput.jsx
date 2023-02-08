import {ToggleButton, ToggleButtonGroup} from "@mui/material";

function AmmoInput(props){
  const ammo = props.ammo;
  const update = props.update;

  return <ToggleButtonGroup
    exclusive
    value={ammo}
    onChange={
      (event, newAmmo) => {
        if(newAmmo !== null){
          update(newAmmo);
        } else {
          update('N');
        }}}
  >
    <ToggleButton value="DA">DA</ToggleButton>
    <ToggleButton value="EXP">EXP</ToggleButton>
  </ToggleButtonGroup>
}

export default AmmoInput;
