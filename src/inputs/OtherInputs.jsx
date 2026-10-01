import { Grid, InputLabel, Checkbox, FormControlLabel, Tooltip} from "@mui/material";

function OtherInputs(props){
  const variant = props.variant ?? 'active';
  const color = variant === 'active' ? 'primary' : 'secondary'
  const critImmune = props.critImmune;
  const template = props.template;
  const update = props.update;
  const updateTemplate = props.updateTemplate;
  const fixedFaceToFace = props.fixedFaceToFace;
  const updateFixedFaceToFace = props.updateFixedFaceToFace;

  const handleChange = (event) => {
    update(event.target.checked);
  };

  const handleTemplateChange = (event) => {
    updateTemplate(event.target.checked);
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
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <Tooltip title="Hits automatically, no roll. Against a Dodge only the Dodge is rolled; against an attack,
                      each side's attack is rolled on its own (no Face to Face Roll).">
        <FormControlLabel
          label="Direct Template Weapon"
          control={<Checkbox
            color={color}
            checked={template}
            onChange={handleTemplateChange}
          />}/>
      </Tooltip></Grid>
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
