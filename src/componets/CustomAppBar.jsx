import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemText,
  IconButton,
  ListItemButton, Button, Box
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {forwardRef, useState} from 'react'
import {NavLink as NavLinkBase} from "react-router-dom";
import {styled, useTheme} from "@mui/material/styles";
import { useAtom } from 'jotai'
import {themeAtom} from '../App.jsx'


const NavLink = forwardRef((props, ref) => (
  <NavLinkBase
    ref={ref}
    {...props}
    className={({ isActive }) => (isActive ? props.className + ' Mui-selected' : props.className)}
  />
));
NavLink.displayName = 'NavLink';
NavLink.propTypes = NavLinkBase.propTypes;

const NavigationButton = styled(Button)(({ theme }) => ({
  // color: 'white', // theme.palette.primary.contrastText,
  // backgroundColor: 'red', //theme.palette.primary.main,
  '&.Mui-selected': {
    backgroundColor: 'rgba(144, 202, 249, 0.16)',
  },
  '&.MuiButton-root': {
    color: 'white',
  }
}));


const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

const navItems = [
  {to: '/', label: 'Dice Calculator'},
  {to: '/settings', label: 'Settings'}]
// tournament winners
// contact



export function CustomAppBar() {
  const theme = useTheme()
  const [selectedTheme, setSelectedTheme] = useAtom(themeAtom)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const changeTheme = () => selectedTheme === 'dark' ? setSelectedTheme('light') : setSelectedTheme('dark')
  return (
    <>
      <AppBar
        sx={{backgroundColor: theme.palette.appbar}}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setIsDrawerOpen(true)}
            sx={{ mr: 2, display: { sm: 'none' }, color: theme.palette.getContrastText(theme.palette.appbar)}}
          >
            <MenuIcon/>
          </IconButton>
          <Typography sx={{fontFamily: 'conthrax', flexGrow: 1, color: theme.palette.getContrastText(theme.palette.appbar)}}>
            Infinity the Calculator
          </Typography>

          {/* Items in header */}
          <Box sx={{ display: { xs: 'none', sm: 'block' }, ml: 2 }}>
            <IconButton sx={{ ml: 1 }} onClick={changeTheme} // color="inherit"
            >
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>

          <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
            <List className='drawer'>
              {navItems.map((item) => {
                return (
                  <ListItemButton key={item.to} component={NavLink} to={item.to}>
                    <ListItemText primary={item.label}/>
                  </ListItemButton>
                )
              })}
            </List>
          </Drawer>
        </Toolbar>
      </AppBar>
      <Offset/>
    </>
  )
}

