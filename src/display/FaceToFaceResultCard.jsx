import ExpectedWoundsGraph from "./ExpectedWoundsGraph.jsx";
import ExpectedWoundsList from "./ExpectedWoundsList.jsx";
import FaceToFaceGraph from "./Face2FaceGraph.jsx";
import {
  Box, Button,
  Card, CardActions,
  CardContent, Collapse, IconButton,
  Typography
} from "@mui/material";
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useState} from "react";
import ShareResultsModal from "./ShareResultsModal.jsx";
import InlineEdit from "../componets/InlineEdit.jsx";


const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));


function FaceToFaceResultCard(props) {
  if(!props.f2fResults){
    return null;
  }
  // Props
  const expectedWounds = props.f2fResults.expected_wounds;
  const faceToFace = props.f2fResults.face_to_face;
  const p = props.f2fResults.parameters;
  const addToCompare = props.addToCompare;
  const variant = props.variant ?? 'result';
  const index = props.index ?? "";
  const customTitle = props.f2fResults?.title ?? `Saved result ${index +1}`;
  const title = (variant === 'result' ? 'Results' : customTitle);

  // Expanded handler
  const [expanded, setExpanded] = useState(variant === 'result');
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Modal sheet handlers
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  let activeParameters = `B${p.player_a_burst} ${p.dtw_vs_dodge ? "DTW" : "SV" + p.player_a_sv}\
 ${p.player_a_ammo !== "DODGE" ? "DAM" + p.player_a_dam : ""} ${p.player_a_ammo !== "N" ? p.player_a_ammo : ""} \
 ${p.player_a_cont ? "CONT" : ""} ARM${p.player_a_arm} ${p.player_a_crit_immune ? "CRIT_IMMUNE" : ""}`
  let reactiveParameters = `B${p.player_b_burst} SV${p.player_b_sv} ${p.player_b_ammo !== "DODGE" ? "DAM" + p.player_b_dam : ""}\
 ${p.player_b_ammo !== "N" ? p.player_b_ammo : ""} ${p.player_b_cont ? "CONT" : ""} ARM${p.player_b_arm} ${p.player_b_crit_immune ? "CRIT_IMMUNE" : ""}`

  return <Card>
    <CardContent>
      <Box sx={{display: "flex", flexDirection: "row", flexGrow: 1}}>
        {/*<Typography variant="h6">{title}</Typography>*/}
        <InlineEdit sx={{flexGrow: 1}} variant="h6" value={title}/>
      </Box>
      <Box sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Typography sx={{whiteSpace: "nowrap"}} variant="overline">{activeParameters}</Typography>
        <Typography sx={{whiteSpace: "nowrap", alignSelf: "end"}} variant="overline">{reactiveParameters}</Typography>
      </Box>
      <Typography sx={{mt: 1, textAlign: "left", }} >Face to face</Typography>
      <FaceToFaceGraph rows={faceToFace}/>
      <Typography sx={{mt: 1, textAlign: "left", }}>Expected wounds</Typography>
      <ExpectedWoundsGraph rows={expectedWounds}/>
    </CardContent>
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <CardContent>
        <ExpectedWoundsList rows={expectedWounds}/>
      </CardContent>
    </Collapse>
    <CardActions disableSpacing>
      <Button onClick={handleOpen} size="small">Share</Button>
      {variant === 'result' && <Button onClick={addToCompare} size="small">Add to compare list</Button>}
      <ExpandMore
        expand={expanded}
        onClick={handleExpandClick}
        aria-expanded={expanded}
        aria-label="show more"
      >
        <ExpandMoreIcon />
      </ExpandMore>
    </CardActions>
    <ShareResultsModal open={open} setClose={handleClose} expectedWounds={expectedWounds} faceToFace={faceToFace}/>
  </Card>;

}

export default FaceToFaceResultCard;
