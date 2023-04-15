import {Typography, TextField, Box, IconButton} from "@mui/material"
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import EditIcon from '@mui/icons-material/Edit';
import {useState} from "react";


export default function InlineEdit(props) {
  const initialValue = props.value;
  const variant = props.variant;

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const onKeyDown = (event) => {
    if (event.key === "Enter" || event.key === "Escape") {
      toggleIsEditing();
      event.target.blur();
    }
  }

  const handleFocus = (event) => event.target.select();

  const toggleIsEditing = () => setIsEditing((b) => !b);

  if (isEditing) {
    return (
      <Box style={{display: "flex", flexGrow: 1, alignItems: "flex-start"}}>
        <TextField
          sx={{flexGrow: 1, textAlign: "left"}}
          fullWidth
          className="MuiTypography-root MuiTypography-h6 MuiTypography-displayInline"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={handleFocus}
        />
        <Typography variant={variant} style={{display: "none"}}/>
        <IconButton color="primary" size="small" onClick={toggleIsEditing}>
          <SaveAltIcon/>
        </IconButton>
      </Box>
    );
  }

  return (
    <div style={{display: "flex", alignItems: "flex-start", flexGrow: 1}}>
      <Typography variant={variant} display="inline" sx={{flexGrow: 1, textAlign: "left"}}>
        {value}
      </Typography>
      <IconButton size="small" onClick={toggleIsEditing}>
        <EditIcon/>
      </IconButton>
    </div>
  )
}
