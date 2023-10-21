import { Grid, InputLabel, Checkbox, FormControlLabel} from "@mui/material";

function OtherInputs(props){
  const variant = props.variant ?? 'active';
  const color = variant === 'active' ? 'primary' : 'secondary'
  const critImmune = props.critImmune;
  const dtwVsDodge = props.dtwVsDodge;
  const update = props.update;
  const updateDtw = props.updateDtw;
  const fixedFaceToFace = props.fixedFaceToFace;
  const updateFixedFaceToFace = props.updateFixedFaceToFace;

  const handleChange = (event) => {
    update(event.target.checked);
  };

  const handleDtwChange = (event) => {
    updateDtw(event.target.checked);
  };

  const handleFixedFaceToFaceChange = (event) => {
    updateFixedFaceToFace(event.target.checked);
  }

  return <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <InputLabel sx={{mt:1}}>Other</InputLabel>
    </Grid>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <FormControlLabel
        label="Immunity (Critical)"
        control={<Checkbox
          color={color}
          checked={critImmune}
          onChange={handleChange}
        />}/>
    </Grid>
    {variant === 'active' ?
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <FormControlLabel
        label="Direct Template Weapon"
        control={<Checkbox
          color={color}
          checked={dtwVsDodge}
          onChange={handleDtwChange}
        />}/></Grid>: <></>}
    {variant === 'reactive' ?
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <FormControlLabel
        label="Fixed value die (AC2)"
        control={<Checkbox
          color={color}
          checked={fixedFaceToFace}
          onChange={handleFixedFaceToFaceChange}
        />}/></Grid>: <></>}
  </>
}

export default OtherInputs;
