import {faPersonRifle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Grid, InputLabel, Rating, Tooltip} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import PropTypes from 'prop-types';
import {useState} from 'react';
import {CONTROL_ROW_HEIGHT} from './layout.js';
import UncontrolledInput from '../components/UncontrolledInput.jsx';
import {FIRETEAM_MAX, FIRETEAM_MIN} from '../rules/modifiers.js';

// 1 (not in a Fireteam, just this trooper) or FIRETEAM_MIN..FIRETEAM_MAX.
const normalize = (n) => Math.max(1, Math.min(FIRETEAM_MAX, n));

// Same layout as BurstInput: typed number, then a row of icons.
function FireteamPurityInput({value, update, variant}) {
  const theme = useTheme();
  const colorMid = theme.palette[variant]['500'];
  // Bumped on every blur so the number box remounts (and drops a typed "0")
  // even when normalize(n) leaves the committed value unchanged.
  const [nonce, setNonce] = useState(0);
  return (
    <>
      <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
        <Tooltip title="Fireteam members from the same Unit. 2: +1 SD, 3: +1 Dodge, 4: +1 BS, 5: Sixth Sense.">
          <InputLabel>Fireteam Purity</InputLabel>
        </Tooltip>
      </Grid>
      <Grid item xs={2} sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', px: 1, height: CONTROL_ROW_HEIGHT}}>
        <UncontrolledInput
          key={`${value}-${nonce}`}
          value={value}
          variant={variant}
          onBlur={(e) => {
            const n = Number(e.target.value);
            if (e.target.value !== '' && Number.isFinite(n)) update(normalize(n));
            setNonce((x) => x + 1);
          }}
        />
      </Grid>
      <Grid item xs={1} sx={{height: CONTROL_ROW_HEIGHT}} />
      <Grid item xs={9} sx={{display: 'flex', justifyContent: 'left', alignItems: 'center', height: CONTROL_ROW_HEIGHT}}>
        <Rating
          max={FIRETEAM_MAX}
          size="large"
          value={value}
          // Re-clicking the current size clears the Rating; that means 1, the floor.
          onChange={(e, n) => update(normalize(n ?? 1))}
          getLabelText={(n) => `Fireteam Purity ${n}`}
          icon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, color: colorMid}} icon={faPersonRifle} />}
          emptyIcon={<FontAwesomeIcon fontSize="inherit" style={{padding: 2, opacity: 0.55}} icon={faPersonRifle} />}
        />
      </Grid>
    </>
  );
}

FireteamPurityInput.propTypes = {
  value: PropTypes.number.isRequired,
  update: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['active', 'reactive']),
};

FireteamPurityInput.defaultProps = {
  variant: 'active',
};

export default FireteamPurityInput;
