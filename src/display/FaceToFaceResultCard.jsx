import ExpectedWoundsGraph from "./ExpectedWoundsGraph.jsx";
import ExpectedWoundsList from "./ExpectedWoundsList.jsx";
import FaceToFaceGraph from "./Face2FaceGraph.jsx";
import {
  Box, Card, CardActions,
  CardContent, Collapse, IconButton,
  Typography
} from "@mui/material";
import { styled } from '@mui/material/styles';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import TableRowsIcon from '@mui/icons-material/TableRows';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ShareIcon from '@mui/icons-material/Share';
import {useState} from "react";
import ShareResultsModal from "./ShareResultsModal.jsx";
import InlineEdit from "../componets/InlineEdit.jsx";


const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(90deg)',
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
  const [expandGraph, setExpandGraph] = useState(true);
  const [expandTable, setExpandTable] = useState(variant === 'result');
  const handleExpandGraphClick = () => {
    setExpandGraph(!expandGraph);
  };
  const handleExpandTableClick = () => {
    setExpandTable(!expandTable);
  };

  // Modal sheet handlers
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  let activeParameters = `B${p.burstA} ${p.dtwVsDodge ? "DTW" : "SV" + p.successValueA}\
 ${p.ammoA !== "DODGE" ? "DAM" + p.damageA : ""} ${p.ammoA !== "N" ? p.ammoA : ""} \
 ${p.contA ? "CONT" : ""} ARM${p.armA} ${p.critImmuneA ? "CRIT_IMMUNE" : ""}`
  let reactiveParameters = `B${p.burstB} SV${p.successValueB} ${p.ammoB !== "DODGE" ? "DAM" + p.damageB : ""}\
 ${p.ammoB !== "N" ? p.ammoB : ""} ${p.contB ? "CONT" : ""} ARM${p.armB} ${p.critImmuneB ? "CRIT_IMMUNE" : ""}`

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
      <Collapse in={expandGraph} timeout="auto" >
        <Typography sx={{mt: 1, textAlign: "left", }} >Face to face</Typography>
        <FaceToFaceGraph rows={faceToFace}/>
        <Typography sx={{mt: 1, textAlign: "left", }}>Expected wounds</Typography>
        <ExpectedWoundsGraph rows={expectedWounds}/>
      </Collapse>
    </CardContent>
    <Collapse in={expandTable} timeout="auto" >
      <CardContent>
        <ExpectedWoundsList rows={expectedWounds}/>
      </CardContent>
    </Collapse>
    <CardActions >
      <IconButton onClick={handleOpen} size="small"><ShareIcon/></IconButton>
      {variant === 'result' && <IconButton onClick={addToCompare} size="small"><StarOutlineIcon/></IconButton>}
      <Box sx={{flexGrow:1}}/>
      <ExpandMore
        expand={expandGraph}
        onClick={handleExpandGraphClick}
        aria-expanded={expandTable}
        aria-label="show more"
      >
        <AssessmentIcon />
      </ExpandMore>
      <ExpandMore
        expand={expandTable}
        onClick={handleExpandTableClick}
        aria-expanded={expandTable}
        aria-label="show more"
      >
        <TableRowsIcon />
      </ExpandMore>
    </CardActions>
    <ShareResultsModal open={open} setClose={handleClose} expectedWounds={expectedWounds} faceToFace={faceToFace} parameters={p}/>
  </Card>;

}

export default FaceToFaceResultCard;
