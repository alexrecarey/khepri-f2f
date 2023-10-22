import {InputBase} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import {useState} from "react";


export default function UncontrolledInput({successValue, value, onBlur, variant, ...rest}) {
  const [displayValue, setDisplayValue] = useState(value);

  const handleFocus = (event) => event.target.select();

  const handleOnChange = (newValue) => {
    setDisplayValue(newValue.replace(/\D/g,''));
  }

  const theme = useTheme();
  //const colorLight = theme.palette[variant]["100"];
  //const colorMid = theme.palette[variant]["500"];
  const colorDark = theme.palette[variant]["700"];

  return <InputBase
    sx={{ //fontWeight: "bold",
      fontFamily: 'conthrax',
      //color: theme.palette.getContrastText(theme.palette[variant]["100"]),
      color: colorDark,
      input: {textAlign: "center", paddingTop: 0, paddingBottom: 0}}}
    key={successValue}
    autoComplete="False"
    value={displayValue}
    onBlur={onBlur}
    onChange={(event) => handleOnChange(event.target.value)}
    onFocus={handleFocus}
    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
  />
}

