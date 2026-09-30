import {FormControlLabel, Grid, Switch, Tooltip} from '@mui/material';
import PropTypes from 'prop-types';
import {surpriseAttackMod} from '../rules/modifiers.js';

// "Use Surprise Attack" for the active trooper, shown only when it has the
// skill. Whether it applies depends on rules the calculator doesn't model
// (Camouflage, Impersonation, not being revealed...), so the player decides.
function SurpriseAttackInput({matchup}) {
  const {sel, setSel, resolved} = matchup.A;
  const mod = surpriseAttackMod(resolved?.traits);
  if (!mod) return null;

  return (
    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left', mt: 1}}>
      <Tooltip title={`The opponent takes ${mod} on its Face to Face Roll (attack or Dodge). Only in the active turn, `
        + 'only if the conditions for Surprise Attack are met; Combat Instinct ignores it.'}>
        <FormControlLabel
          label={`Surprise Attack (${mod})`}
          control={(
            <Switch
              color="primary"
              checked={Boolean(sel.surpriseAttack)}
              onChange={(e) => setSel({...sel, surpriseAttack: e.target.checked})}
            />
          )}
        />
      </Tooltip>
    </Grid>
  );
}

SurpriseAttackInput.propTypes = {
  matchup: PropTypes.object.isRequired,
};

export default SurpriseAttackInput;
