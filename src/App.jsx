import { useState } from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import './App.css'
import {BottomNavigation, BottomNavigationAction} from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import RestoreIcon from '@mui/icons-material/Restore';

function App() {
  const [tab, setTab] = useState(0)

  return (
    <>
      <CssBaseline />
      <BottomNavigation
        showLabels
        value={tab}
        onChange={(event, newValue) => {
          setTab(newValue);
        }}
      >
        <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
        <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
      </BottomNavigation>
    </>
  )
}

export default App
