import {createTheme} from '@mui/material/styles';
import {grey} from '@mui/material/colors';
import {atomWithStorage} from 'jotai/utils';

// 'dark' or 'light', saved per browser; toggled in the app bar.
export const themeAtom = atomWithStorage('selectedTheme', 'dark');

// Palettes: `active` (green) and `reactive` (pink) colour each side's inputs
// and results; `failure` the rolls where nobody wins; `rest` the part of an
// unopposed roll's bar where that side causes nothing.
const designTokens = (mode) => ({
  palette: {
    mode: mode,
    ...(mode === 'light') ? {
      primary: {
        main: '#217a79'
      },
      background: {
        default: grey[100],
      },
      reactive: {
        light: '#f3cbd3',
        main: '#b14d8e',
        dark: '#6c2167',
        100: '#f3cbd3',
        200: '#eaa9bd',
        300: '#dd88ac',
        400: '#ca699d',
        500: '#b14d8e',
        600: '#91357d',
        700: '#6c2167',
      },
      active: {
        light: '#d3f2a3',
        main: '#217a79',
        dark: '#074050',
        100: '#d3f2a3',
        200: '#97e196',
        300: '#6cc08b',
        400: '#4c9b82',
        500: '#217a79',
        600: '#105965',
        700: '#074050',
      },
      failure: {
        100: grey[100],
      },
      rest: '#000000',
      appbar: grey[100],
    } : {
      primary: {
        main: '#6cc08b',
      },
      reactive: {
        700: '#f3cbd3',
        600: '#eaa9bd',
        500: '#dd88ac',
        400: '#ca699d',
        300: '#b14d8e',
        200: '#91357d',
        100: '#6c2167',
      },
      active: {
        700: '#d3f2a3',
        600: '#97e196',
        500: '#6cc08b',
        400: '#4c9b82',
        300: '#217a79',
        200: '#105965',
        100: '#074050',
      },
      failure: {
        300: '#424242',
        200: '#212121',
        100: '#121212',
      },
      rest: '#000000',
      appbar: '#121212',
    }
  }
})

export const makeTheme = (mode) => createTheme(designTokens(mode === 'dark' ? 'dark' : 'light'));
