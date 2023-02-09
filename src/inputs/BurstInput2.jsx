import {faDiceD20} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Grid, InputLabel, Rating, Typography} from "@mui/material";
import { useTheme } from '@mui/material/styles';

function BurstInput(props) {
  const burst = props.burst;
  const update = props.update;
  const variant = props.variant ?? 'active';

  const theme = useTheme();
  const colorLight = theme.palette.player[variant]["100"];
  const colorMid = theme.palette.player[variant]["500"];
  const colorDark = theme.palette.player[variant]["700"];

  const gridStyle = {
    bgcolor: colorLight,
    display: "flex",
    justifyContent:"center",
    alignItems:"center",
    borderRadius: '8px 8px 8px 8px',
    p:1};

  return <>
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
      <InputLabel>Burst</InputLabel>
    </Grid>
    <Grid item xs={2} sx={gridStyle}>
      <Typography color={colorDark} fontWeight="bold">{burst}</Typography>
    </Grid>
    <Grid item xs={1}></Grid>
    <Grid item xs={9} sx={{display:"flex", justifyContent:"left", alignItems:"center"}}>
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
        icon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, color: colorMid}} icon={faDiceD20}/>}
        emptyIcon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, opacity: 0.55}} icon={faDiceD20}/>}
      />
    </Grid>
  </>
}

export default BurstInput;
