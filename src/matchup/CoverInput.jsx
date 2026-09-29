import {Grid, InputLabel, Rating, Tooltip} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import PropTypes from 'prop-types';
import {CONTROL_ROW_HEIGHT} from './layout.js';
import BrickWallIcon from '../components/BrickWallIcon.jsx';
import {SKILL} from '../army/ids.js';

// "In cover" for one side of the matchup, in the Burst pattern: a single brick
// wall toggles cover on/off. Units with No Cover can't take cover.
function CoverInput({variant, matchup}) {
  const theme = useTheme();
  const colorMid = theme.palette[variant]['500'];
  const side = variant === 'active' ? 'A' : 'B';
  const {sel, setSel, resolved} = matchup[side];
  const noCover = (resolved?.traits?.skills ?? []).some((s) => s.id === SKILL.NO_COVER);
  const inCover = Boolean(sel.inCover) && !noCover;

  return (
    <>
      <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
        <Tooltip title="Partial Cover: attackers get −3 to hit, and the trooper gets +3 to its Saving Roll (not against templates).">
          <InputLabel>Cover</InputLabel>
        </Tooltip>
      </Grid>
      {/* Wall indented to sit under the number boxes. */}
      <Grid item xs={12} sx={{display: 'flex', alignItems: 'center', pl: 3, height: CONTROL_ROW_HEIGHT}}>
        {/* span: a Tooltip needs an enabled child to hang on. */}
        <Tooltip title={noCover ? 'Unit has No Cover' : ''}>
          <span>
            <Rating
              max={1}
              size="large"
              value={inCover ? 1 : 0}
              disabled={noCover}
              // Clicking the lit wall clears the Rating: out of cover.
              onChange={(e, n) => setSel({...sel, inCover: n === 1})}
              getLabelText={() => 'In cover'}
              icon={<BrickWallIcon fontSize="inherit" sx={{color: colorMid}} />}
              emptyIcon={<BrickWallIcon fontSize="inherit" sx={{opacity: 0.55}} />}
            />
          </span>
        </Tooltip>
      </Grid>
    </>
  );
}

CoverInput.propTypes = {
  variant: PropTypes.oneOf(['active', 'reactive']).isRequired,
  matchup: PropTypes.object.isRequired,
};

export default CoverInput;
