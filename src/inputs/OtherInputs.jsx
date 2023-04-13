import { Grid, InputLabel, Checkbox, FormControlLabel} from "@mui/material";

function OtherInputs(props){
  const variant = props.variant ?? 'active';
  const critImmune = props.critImmune;
  const dtwVsDodge = props.dtwVsDodge;
  const update = props.update;
  const updateDtw = props.updateDtw;

  const handleChange = (event) => {
    update(event.target.checked);
  };

  const handleDtwChange = (event) => {
    updateDtw(event.target.checked);
  };

  return <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <InputLabel sx={{mt:1}}>Other</InputLabel>
    </Grid>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <FormControlLabel
        label="Immunity (Critical)"
        control={<Checkbox
          checked={critImmune}
          onChange={handleChange}
        />}/>
    </Grid>
    {variant === 'active' ?
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <FormControlLabel
        label="Direct Template Weapon"
        control={<Checkbox
          checked={dtwVsDodge}
          onChange={handleDtwChange}
        />}/></Grid>: <></>}
  </>
}

export default OtherInputs;
