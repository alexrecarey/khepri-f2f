import {faDiceD20} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Grid, InputLabel, Rating, Typography} from "@mui/material";

function BurstInput(props) {
  const burst = props.burst;
  const update = props.update;
  const color = props.color;

  return <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <InputLabel>Burst</InputLabel>
    </Grid>
    <Grid item xs={1} sx={{
      bgcolor: '#f3cbd3',
      display: "flex",
      justifyContent:"center",
      alignItems:"center",
      borderRadius: '8px 0 0 8px',
      p:1}}
    >
      <Typography color='#6c2167' fontWeight="bold">B</Typography>
    </Grid>
    <Grid item xs={1} sx={{
      bgcolor: '#f3cbd3',
      display: "flex",
      justifyContent:"center",
      alignItems:"center",
      borderRadius: '0 8px 8px 0',
      p:1}}
    >
      <Typography color='#6c2167' fontWeight="bold">{burst}</Typography>
    </Grid>
    <Grid item xs={10} sx={{display:"flex", justifyContent:"center", alignItems:"center"}}>
      <Rating
        value={burst}
        min={1}
        max={6}
        size="large"
        onChange={(event, newValue) => {
          if(newValue !== null){
            update(newValue);
          }
        }}
        icon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, color: color}} icon={faDiceD20}/>}
        emptyIcon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, opacity: 0.55}} icon={faDiceD20}/>}
      />
    </Grid>
  </>
}

export default BurstInput;
