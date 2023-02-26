import { Grid, InputLabel, Checkbox, FormControlLabel} from "@mui/material";

function CritImmuneInput(props){
  const critImmune = props.critImmune;
  const update = props.update;

  const handleChange = (event) => {
    update(event.target.checked);
  };

  return <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <InputLabel sx={{mt:1}}>Other</InputLabel>
    </Grid>
    <Grid item xs={12}>
      <FormControlLabel
        label="Immunity (Critical)"
        control={<Checkbox
          checked={critImmune}
          onChange={handleChange}
        />}/>
    </Grid>
  </>
}

export default CritImmuneInput;
