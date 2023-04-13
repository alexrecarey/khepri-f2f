import ExpectedWoundsGraph from "./ExpectedWoundsGraph.jsx";
import ExpectedWoundsList from "./ExpectedWoundsList.jsx";
import FaceToFaceGraph from "./Face2FaceGraph.jsx";
import {
  Box, Button,
  Card, CardActions,
  CardContent,
  Typography
} from "@mui/material";
import {useState} from "react";
import ShareResultsModal from "./ShareResultsModal.jsx";
function FaceToFaceResultCard(props) {
  if(!props.f2fResults){
    return null;
  }
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const expectedWounds = props.f2fResults.expected_wounds;
  const faceToFace = props.f2fResults.face_to_face;
  const p = props.f2fResults.parameters;

  console.log('Face to face results are:');
  console.log(faceToFace)
  return <Card>
    <CardContent>
      <Typography variant="h6">Results</Typography>
      <Box sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Typography sx={{whiteSpace: "nowrap"}} variant="overline">B{p.player_a_burst} SV{p.player_a_sv} DAM{p.player_a_dam} {p.player_a_ammo !== "N" ? p.player_a_ammo : ""} {p.player_a_cont ? "CONT" : ""} ARM{p.player_a_arm}</Typography>
        <Typography sx={{whiteSpace: "nowrap", alignSelf: "end"}} variant="overline">B{p.player_b_burst} SV{p.player_b_sv} DAM{p.player_b_dam} {p.player_b_ammo !== "N" ? p.player_b_ammo : ""} {p.player_b_cont ? "CONT" : ""} ARM{p.player_b_arm}</Typography>
      </Box>
      <Typography sx={{mt: 1, textAlign: "left", }} >Face to face</Typography>
      <FaceToFaceGraph rows={faceToFace}/>
      <Typography sx={{mt: 1, textAlign: "left", }}>Expected wounds</Typography>
      <ExpectedWoundsGraph rows={expectedWounds}/>
      <Box sx={{mt: 1}}/>
      <ExpectedWoundsList rows={expectedWounds}/>
    </CardContent>
    <CardActions>
      <Button onClick={handleOpen} size="small">Share</Button>
    </CardActions>
    <ShareResultsModal open={open} setClose={handleClose} expectedWounds={expectedWounds} faceToFace={faceToFace}/>
  </Card>;

}

export default FaceToFaceResultCard;
