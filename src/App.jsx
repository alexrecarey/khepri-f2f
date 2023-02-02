import { useState } from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import './App.css'
import {
  Grid,
  Rating,
  TextField,
  Typography
} from "@mui/material";

function App() {
  const [burstA, setBurstA] = useState(3)
  const [burstB, setBurstB] = useState(1)
  const [successValueA, setSuccessValueA] = useState(10)
  const [successValueB, setSuccessValueB] = useState(10)


  return (
    <>
    <CssBaseline />
        <Grid container spacing={2}>
          <Typography>Player A</Typography>
          <Grid xs={12} item>
            <Rating
              value={burstA}
              min={1}
              max={6}
              onChange={(event, newValue) => {
                setBurstA(newValue);
              }
          }
            />
          </Grid>
          <Grid xs={12} item>Burst</Grid>

          <Grid xs={12} item>Success Value</Grid>
          <TextField
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            value={successValueA}
            onChange={(event, newValue)=> {
              setSuccessValueA(newValue);
            }}
          />

          <Grid xs={12} item>Player B</Grid>
          <Grid xs={12} item>Burst</Grid>
          <Grid xs={12} item>
            <Rating
              value={burstB}
              min={1}
              max={6}
              onChange={(event, newValue) => {
                setBurstB(newValue);
              }}
            />
          </Grid>
          <Grid xs={12} item>Success Value</Grid>
          <Grid xs={12} item>
            <TextField
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              value={successValueB}
              onChange={(event, newValue)=> {
                setSuccessValueB(newValue);
              }}
            />
          </Grid>

        </Grid>
    </>
  )
}

export default App
