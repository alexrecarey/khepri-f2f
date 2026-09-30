import {useMemo} from 'react';
import {Grid, MenuItem, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import {twoDecimalPlaces} from '../display/DataTransform.js';
import {isTemplate} from '../army/weapons.js';
import {fireteamBonuses} from '../rules/modifiers.js';
import {rangeModFor} from '../rules/ranges.js';
import {pseudoWeapons, trooperWeapons} from '../rules/trooper.js';
import SelectField from './SelectField.jsx';

// "+3" / "-6" / "out of range" for the weapon at the shared distance.
// Direct Templates auto-hit what they cover and take no range MODs.
function rangeText(row, rangeCm, traits) {
  if (isTemplate(row)) return 'template';
  const mod = rangeModFor(row, rangeCm, traits);
  if (mod === null) return 'out of range';
  return `${mod > 0 ? '+' : ''}${mod} range`;
}

// Expected wounds per order from usePreviewWounds: number, 'pending' or null.
function previewText(preview) {
  if (preview === 'pending') return ' · …';
  if (typeof preview === 'number') return ` · ~${twoDecimalPlaces(preview)} wounds`;
  return '';
}

// Weapon choice for one side of the matchup, first in its calculator column.
// Disabled until a loadout is picked; the unit picker then auto-selects the
// default weapon (defaultWeapon).
function WeaponSelect({variant, matchup}) {
  const side = variant === 'active' ? 'A' : 'B';
  const {sel, setSel, resolved, previews} = matchup[side];
  const {army, rangeCm} = matchup;
  const option = resolved?.option ?? null;
  const profile = resolved?.profile ?? null;

  const weapons = useMemo(
    () => (option ? trooperWeapons(option, army.weapons, resolved.traits) : []),
    [option, army, resolved],
  );
  const dodgeMod = fireteamBonuses(sel.ftSize).dodge;
  const pseudo = useMemo(
    () => (profile ? pseudoWeapons(profile, resolved.traits, side, dodgeMod) : []),
    [profile, resolved, side, dodgeMod],
  );

  return (
    <Grid item xs={12} sx={{mt: 1, mb: 2.5}}>
      <SelectField
        label="Weapon"
        color={variant === 'active' ? 'primary' : 'secondary'}
        needsChoice={false}
        disabled={!option}
        value={option ? sel.weaponKey : null}
        onChange={(key) => setSel({...sel, weaponKey: key})}
      >
        {[
          ...weapons.map((w) => (
            <MenuItem key={w.key} value={w.key}>
              {`${w.label} · ${rangeText(w.row, rangeCm, resolved?.traits)}${previewText(previews?.[w.key])}`}
            </MenuItem>
          )),
          ...pseudo.map((w) => <MenuItem key={w.key} value={w.key}>{w.label}</MenuItem>),
        ]}
      </SelectField>
      {option && weapons.length === 0 && (
        <Typography variant="caption" color="text.secondary">No BS weapons in this profile.</Typography>
      )}
    </Grid>
  );
}

WeaponSelect.propTypes = {
  variant: PropTypes.oneOf(['active', 'reactive']).isRequired,
  matchup: PropTypes.object.isRequired,
};

export default WeaponSelect;
