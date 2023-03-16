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
      <Typography variant="h6">Expected Wounds</Typography>
      <Box sx={{textAlign: "left"}}>Active: B{p.player_A_burst} SV{p.player_a_sv} with
        DAM{p.player_a_dam} and ARM{p.player_a_arm}</Box>
      <Box sx={{textAlign: "right"}}>Reactive: B{p.player_b_burst} SV{p.player_b_sv} with
        DAM{p.player_b_dam} and ARM{p.player_b_arm}</Box>
      <ExpectedWoundsGraph
        rows={expectedWounds}
      />
      <ExpectedWoundsList rows={expectedWounds}/>

      <Typography sx={{mt: 2}} variant="h6">Face to Face</Typography>
      <FaceToFaceGraph rows={faceToFace}/>
    </CardContent>
    <CardActions>
      <Button onClick={handleOpen} size="small">Share</Button>
    </CardActions>
    <ShareResultsModal open={open} setClose={handleClose} expectedWounds={expectedWounds}/>
  </Card>;

}

export default FaceToFaceResultCard;
