import ExpectedWoundsGraph from "./ExpectedWoundsGraph.jsx";
import ExpectedWoundsList from "./ExpectedWoundsList.jsx";
import FaceToFaceGraph from "./Face2FaceGraph.jsx";
import {
  Box, Card, CardActions,
  CardContent, CardMedia, Collapse, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip,
  Typography
} from "@mui/material";
import { styled } from '@mui/material/styles';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import TableRowsIcon from '@mui/icons-material/TableRows';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
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
  const updateTitle = props.changeName ? props.changeName : () => void 0;
  const remove = props.remove ? props.remove : () => void 0;

  // ?? `Saved result ${index +1}`;
  // Calculate custom title
  let title;
  if (props.f2fResults?.title) {
    title = props.f2fResults.title;
  } else if (variant !== 'result' && index !== ""){
    title = `Saved result ${index +1}`;
  } else {
    title = "Result"
  }

  // Expanded handler
  const [expandGraph, setExpandGraph] = useState(true);
  const [expandTable, setExpandTable] = useState(variant === 'result');
  const [expandWounds, setExpandWounds] = useState(false);
  const handleExpandGraphClick = () => {
    setExpandGraph(!expandGraph);
  };
  const handleExpandTableClick = () => {
    setExpandTable(!expandTable);
  };
  const handleExpandWoundsClick = () => {
    setExpandWounds(!expandWounds);
  }

  // Active / Reactive max wounds handler
  const [activeMaxWounds, setActiveMaxWounds] = useState(3);
  const [reactiveMaxWounds, setReactiveMaxWounds] = useState(3);
  const handleActiveChange = (event) => {
    setActiveMaxWounds(event.target.value);
  };
  const handleReactiveChange = (event) => {
    setReactiveMaxWounds(event.target.value);
  };

  // Modal sheet handlers
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  let activeParameters = `B${p.burstA} ${p.dtwVsDodge ? "DTW" : "SV" + p.successValueA}\
 ${p.ammoA !== "DODGE" ? "DAM" + p.damageA : ""} ${p.ammoA !== "N" ? p.ammoA : ""} \
 ${p.contA ? "CONT" : ""} ARM${p.armA} ${p.critImmuneA ? "CRIT_IMMUNE" : ""}`
  let reactiveParameters = `B${p.burstB} ${p.burstB !== 0 ? "SV" + p.successValueB : ""} ${p.ammoB !== "DODGE" && p.burstB !== 0 ? "DAM" + p.damageB : ""}\
 ${p.ammoB !== "N" ? p.ammoB : ""} ${p.contB ? "CONT" : ""} ARM${p.armB} ${p.critImmuneB ? "CRIT_IMMUNE" : ""}`

  return <Card>
    <CardContent>
      <Box sx={{display: "flex", flexDirection: "row", flexGrow: 1}}>
        <InlineEdit sx={{flexGrow: 1}} variant="h6" value={title} update={updateTitle}/>
      </Box>
    </CardContent>
    <CardMedia sx={{pl:2, pr:2}}>
      <Box sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Typography sx={{whiteSpace: "nowrap"}} variant="overline">{activeParameters}</Typography>
        <Typography sx={{whiteSpace: "nowrap", alignSelf: "end"}} variant="overline">{reactiveParameters}</Typography>
      </Box>
      <Collapse in={expandGraph} timeout="auto" >
        <Typography sx={{textAlign: "left", }} >Face to face</Typography>
        <FaceToFaceGraph rows={faceToFace}/>
        <Typography sx={{mt: 1, textAlign: "left", }}>Expected wounds</Typography>
        <ExpectedWoundsGraph
          rows={expectedWounds}
          activeMaxWounds={activeMaxWounds}
          reactiveMaxWounds={reactiveMaxWounds}
        />
      </Collapse>
    </CardMedia>
    <Collapse in={expandTable} timeout="auto" >
      <CardContent>
        <ExpectedWoundsList
          rows={expectedWounds}
          activeMaxWounds={activeMaxWounds}
          reactiveMaxWounds={reactiveMaxWounds}
        />
      </CardContent>
    </Collapse>
    <Collapse in={expandWounds} timeout="auto" >
      <CardContent>
        <FormControl sx={{ m: 1, minWidth: 135}} size="small">
          <InputLabel id="active-max-wounds">Active Max Wounds</InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            value={activeMaxWounds}
            label="Active max wounds"
            onChange={handleActiveChange}
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={100}>No limit</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 135 }} size="small">
          <InputLabel id="demo-select-small-label">Rective Max Wounds</InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            value={reactiveMaxWounds}
            label="Active max wounds"
            onChange={handleReactiveChange}
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={100}>No limit</MenuItem>
          </Select>
        </FormControl>

      </CardContent>
    </Collapse>
    <CardActions >
      <IconButton onClick={handleOpen} size="small">
        <Tooltip title="Share results"><ShareIcon/></Tooltip></IconButton>
      {variant === 'result' && <Tooltip title="Add result to comparison list">
        <IconButton onClick={addToCompare} size="small"><LibraryAddIcon/></IconButton>
      </Tooltip>}
      {variant === 'list' && <Tooltip title="Delete from comparison list">
        <IconButton onClick={() => remove(props.f2fResults['id'])}><DeleteIcon/></IconButton></Tooltip>
      }
      <IconButton onClick={handleExpandWoundsClick}><Tooltip title="Set maximum wounds"><HeartBrokenIcon/></Tooltip></IconButton>
      <Box sx={{flexGrow:1}}/>
      <ExpandMore
        expand={expandGraph}
        onClick={handleExpandGraphClick}
        aria-expanded={expandTable}
        aria-label="show more"
      >
        <Tooltip title="Show / hide face to face result graph">
          <AssessmentIcon />
        </Tooltip>
      </ExpandMore>
      <ExpandMore
        expand={expandTable}
        onClick={handleExpandTableClick}
        aria-expanded={expandTable}
        aria-label="show more"
      >
        <Tooltip title="Show / hide face to face result table">
          <TableRowsIcon />
        </Tooltip>
      </ExpandMore>
    </CardActions>
    <ShareResultsModal open={open} setClose={handleClose} results={props.f2fResults}/>
  </Card>;

}

export default FaceToFaceResultCard;
