import {useState} from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import './App.css'
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Grid,
  Rating,
  Stack,
  Typography
} from "@mui/material";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDiceD20} from '@fortawesome/free-solid-svg-icons'

function App() {
  const [burstA, setBurstA] = useState(3)
  const [burstB, setBurstB] = useState(1)
  const [successValueA, setSuccessValueA] = useState(10)
  const [successValueB, setSuccessValueB] = useState(10)

  const handleButtonPress = (amount, variable, setter) => {
    if (amount + variable >= 30) {
      setter(30);
    } else if (amount + variable <= 1) {
      setter(1);
    } else {
      setter(amount + variable);
    }
  };


  return (
    <>
      <CssBaseline/>
      <Box sx={{flexGrow: 1}}>
        <Grid container spacing={2}>
          <Grid xs={12} sm={6} lg={4} xl={3} item>
            <Card
              style={{alignItems: "center", justifyContent: "center"}}>
              <CardContent>
                <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>Player A</Typography>
                <Rating
                  value={burstA}
                  min={1}
                  max={6}
                  size="large"
                  onChange={(event, newValue) => {
                    setBurstA(newValue);
                  }}
                  icon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2}} icon={faDiceD20}/>}
                  emptyIcon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, opacity: 0.55}} icon={faDiceD20}/>}
                />
                <Stack alignItems="center" justifyContent="center" direction="row">
                  <ButtonGroup>
                    <Button onClick={() => handleButtonPress(-3, successValueA, setSuccessValueA)}>-3</Button>
                    <Button onClick={() => handleButtonPress(-1, successValueA, setSuccessValueA)}>-1</Button>
                  </ButtonGroup>
                  <Typography sx={{fontSize: 24, fontWeight: "bold", pl: 2, pr: 2}}>{successValueA}</Typography>
                  <ButtonGroup>
                    <Button onClick={() => handleButtonPress(+1, successValueA, setSuccessValueA)}>+1</Button>
                    <Button onClick={() => handleButtonPress(+3, successValueA, setSuccessValueA)}>+3</Button>
                  </ButtonGroup>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} lg={4} xl={3} item>
            <Card>
              <CardContent>
                <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>Player B</Typography>
                <Rating
                  value={burstB}
                  min={1}
                  max={6}
                  size="large"
                  onChange={(event, newValue) => {
                    setBurstB(newValue);
                  }}
                  icon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2}} icon={faDiceD20}/>}
                  emptyIcon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, opacity: 0.55}} icon={faDiceD20}/>}
                />
                <Stack alignItems="center" justifyContent="center" direction="row">
                  <ButtonGroup>
                    <Button onClick={() => handleButtonPress(-3, successValueB, setSuccessValueB)}>-3</Button>
                    <Button onClick={() => handleButtonPress(-1, successValueB, setSuccessValueB)}>-1</Button>
                  </ButtonGroup>
                  <Typography sx={{fontSize: 24, fontWeight: "bold", pl: 2, pr: 2}}>{successValueB}</Typography>
                  <ButtonGroup>
                    <Button onClick={() => handleButtonPress(+1, successValueB, setSuccessValueB)}>+1</Button>
                    <Button onClick={() => handleButtonPress(+3, successValueB, setSuccessValueB)}>+3</Button>
                  </ButtonGroup>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={12} lg={4} xl={6} item>
            <Card>
              <CardContent>

              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default App


