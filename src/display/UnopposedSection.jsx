import {Box, Collapse, Stack, Typography} from "@mui/material";
import {useTheme} from '@mui/material/styles';
import ExpectedWoundsGraph from "./ExpectedWoundsGraph.jsx";
import FaceToFaceGraph from "./FaceToFaceGraph.jsx";
import {formatPercentage, twoDecimalPlaces, unopposedSummary} from "./DataTransform.js";

// One side of an unopposed result: that side's roll on its own (the other
// side's roll is its own section). The active side reads left to right; the
// reactive side keeps to the right, as in a Face to Face result, so its colour
// is always on the right. The part of each bar where the side causes nothing
// is black: there is no failure shared by both sides.
function UnopposedSection({sideResult, player, summary, maxWounds, expandGraph, expandTable}) {
  const theme = useTheme();
  const reactive = player === 'reactive';
  const align = reactive ? 'right' : 'left';
  const rest = theme.palette.rest;
  const shade = (w) => theme.palette[player][Math.min(w, 5) * 100 + 200];
  const s = unopposedSummary(sideResult, player, maxWounds);
  const name = reactive ? 'Reactive' : 'Active';
  // Without the other side's (always 0) part, or a 0-width miss.
  const rolls = sideResult.face_to_face.filter((r) => r.chance > 0);

  const line = (color, text, key) => (
    <Stack key={key} direction={reactive ? 'row-reverse' : 'row'} sx={{alignItems: 'center'}}>
      <Box sx={{width: 25, height: 25, backgroundColor: color, flexShrink: 0}}/>
      <Typography ml={1} mr={1} lineHeight={1} variant="body2">{text}</Typography>
    </Stack>
  );

  return <Box sx={{textAlign: align}}>
    <Box sx={{px: 2}}>
      <Typography sx={{whiteSpace: "nowrap", display: 'block'}} variant="overline">{summary}</Typography>
      <Collapse in={expandGraph} timeout="auto">
        <Typography>Unopposed roll</Typography>
        <FaceToFaceGraph rows={rolls} restColor={rest}/>
        <Typography sx={{mt: 1}}>Expected wounds</Typography>
        <ExpectedWoundsGraph rows={sideResult.expected_wounds} activeMaxWounds={maxWounds}
                             reactiveMaxWounds={maxWounds} restColor={rest}/>
      </Collapse>
    </Box>
    <Collapse in={expandTable} timeout="auto">
      <Box sx={{px: 2, pt: 2}}>
        <Typography>{name} ({twoDecimalPlaces(s.wpo)} wounds / order)</Typography>
        <Stack spacing={0.5} sx={{alignItems: reactive ? 'flex-end' : 'flex-start'}}>
          {line(rest, `${formatPercentage(s.noWounds)}% chance of no wounds.`, 0)}
          {s.atLeast.map((x) => line(shade(x.wounds),
            `${formatPercentage(x.chance)}% chance of ${x.wounds} or more wounds.`, x.wounds))}
        </Stack>
      </Box>
    </Collapse>
  </Box>;
}

export default UnopposedSection;
