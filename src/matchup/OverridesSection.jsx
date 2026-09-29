import {Box, Grid, InputLabel} from '@mui/material';
import {alpha, useTheme} from '@mui/material/styles';
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import PropTypes from 'prop-types';

// "Overrides" section holding the calculator's raw value scales (SV, PS, ARM).
// The header is an InputLabel rendered as a button, so it matches the control
// labels; an outlined circle chevron (right = collapsed, down = expanded)
// shows the state. Expanded, the section gets a
// slightly darker background.
function OverridesSection({open, onToggle, children}) {
  const theme = useTheme();
  const shade = alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.2 : 0.05);
  return (
    <Grid item xs={12} sx={{mt: 1}}>
      {/* Negative margin + padding keeps the content aligned with the controls above. */}
      <Box sx={{mx: -1, px: 1, py: 0.5, borderRadius: 1, bgcolor: open ? shade : 'transparent'}}>
        <InputLabel
          component="button"
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'none',
            border: 0,
            p: 0,
            cursor: 'pointer',
            '&:hover, &:focus-visible': {color: 'text.primary'},
          }}
        >
          Overrides
          <ExpandCircleDownOutlinedIcon
            sx={{
              fontSize: '1.1em',
              ml: 0.75,
              transform: open ? 'none' : 'rotate(-90deg)',
              transition: 'transform 150ms',
            }}
          />
        </InputLabel>
        {open && <Grid container>{children}</Grid>}
      </Box>
    </Grid>
  );
}

OverridesSection.propTypes = {
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default OverridesSection;
