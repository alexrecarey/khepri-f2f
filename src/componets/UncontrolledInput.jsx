import {InputBase} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import {useState} from "react";


export default function UncontrolledInput(props) {
  const value = props.value;
  const onBlur = props.onBlur;
  const variant = props.variant;
  const [displayValue, setDisplayValue] = useState(value);

  const handleFocus = (event) => event.target.select();

  const handleOnChange = (newValue) => {
    setDisplayValue(newValue);
  }

  const theme = useTheme();
  //const colorLight = theme.palette.player[variant]["100"];
  //const colorMid = theme.palette.player[variant]["500"];
  const colorDark = theme.palette.player[variant]["700"];

  return <InputBase
    sx={{fontWeight: "bold", color: colorDark, input: {textAlign: "center", paddingTop: 0, paddingBottom: 0}}}
    key={props.successValue}
    autoComplete="False"
    value={displayValue}
    onBlur={onBlur}
    onChange={(event) => handleOnChange(event.target.value)}
    onFocus={handleFocus}
  />
}

