import {Box, Tab, Tabs} from '@mui/material';
import {styled} from '@mui/material/styles';
import PropTypes from 'prop-types';

export const MODES = {basic: 'basic', matchup: 'matchup'};

const NewPill = styled('span')(({theme}) => ({
  background: `linear-gradient(90deg, ${theme.palette.active[500]}, ${theme.palette.reactive[500]})`,
  borderRadius: 999,
  color: theme.palette.getContrastText(theme.palette.active[500]),
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  lineHeight: 1,
  marginLeft: theme.spacing(1),
  padding: '3px 7px',
  textTransform: 'uppercase',
}));

function ModeTabs({mode, onChange}) {
  return (
    <Tabs
      value={mode}
      onChange={(event, value) => onChange(value)}
      textColor="inherit"
      sx={{
        mb: 2,
        minHeight: 40,
        // Keep the pill at full strength; dim the label instead of the whole tab.
        '& .MuiTab-root': {opacity: 1, color: 'text.secondary'},
        '& .MuiTab-root.Mui-selected': {color: 'text.primary'},
      }}
    >
      <Tab value={MODES.basic} label="Basic" sx={{minHeight: 40}} />
      <Tab
        value={MODES.matchup}
        sx={{minHeight: 40}}
        label={
          <Box component="span" sx={{display: 'inline-flex', alignItems: 'center'}}>
            Matchup
            <NewPill>New</NewPill>
          </Box>
        }
      />
    </Tabs>
  );
}

ModeTabs.propTypes = {
  mode: PropTypes.oneOf(Object.values(MODES)).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ModeTabs;
