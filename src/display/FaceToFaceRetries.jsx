import {Box, Typography} from "@mui/material";
import {activePlayerWithOneWound, reactivePlayerWithOneWound} from "./DataTransform.js";
import {formatPercentage} from './DataTransform';
import pmf from "@stdlib/stats-base-dists-binomial-pmf";

function FaceToFaceRetries(props) {
  const expectedWounds = props.expectedWounds;
  if(!expectedWounds){
    return null;
  }
  console.log()
  const activeOneWoundList = activePlayerWithOneWound(expectedWounds);
  const reactiveOneWoundList = reactivePlayerWithOneWound(expectedWounds);
  const activeOneWound = activeOneWoundList[0]?.cumulative_chance ?? 0;
  const reactiveOneWound = reactiveOneWoundList[0]?.cumulative_chance ?? 0;

  let retryResults = [];

  for (let i = 2; i < 6 ; i++) {
    retryResults.push({
      active: 1 - pmf(0, i, activeOneWound),
      reactive: 1 - pmf(0, i, reactiveOneWound),
      retry: i,
    })
  };


  return(
    <Box sx={{textAlign: 'left'}}>
      <Typography variant="h6" sx={{flexGrow: 1}}>Retries</Typography>
      {
        retryResults.map((retry, index) => {
          let active = formatPercentage(retry['active']);
          let reactive = formatPercentage(retry['reactive']);
          return <Typography variant="body2" key={index}>
            After {retry['retry']} tries: Active {active}% / Reactive {reactive}%
          </Typography>
        })
      }
    </Box>
  )

}


export default FaceToFaceRetries;
