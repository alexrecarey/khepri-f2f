import {Box, Grid, InputLabel, Tooltip} from '@mui/material';
import {alpha, useTheme} from '@mui/material/styles';
import PropTypes from 'prop-types';
import {RANGE_BANDS, rangeModFor} from './profileToInputs.js';

// "+3" / "-6" / "—" (out of range, or no weapon picked yet).
function modText(mod) {
  return mod === null ? '—' : `${mod > 0 ? '+' : ''}${mod}`;
}

// Distance between the two troopers, as a ruler divided into the weapon
// chart's range bands. `rangeCm` is shared by both sides (App.jsx passes the
// same matchup.rangeCm/setRangeCm pair to the active and reactive columns),
// so picking a band here moves it there too: lines of fire are reciprocal.
// `row` is the currently selected weapon's row (null for Dodge/No ARO/no
// pick yet), used to show that weapon's own MOD at each band. `traits` are
// the shooter's: an X Visor softens the MODs.
function RangeInput({rangeCm, update, row, traits, variant}) {
  const theme = useTheme();
  const accent = theme.palette[variant]['500'];
  const accentText = theme.palette[variant]['700'];
  const index = RANGE_BANDS.findIndex((b) => b.to === rangeCm);
  const selectedIndex = index === -1 ? 0 : index;
  const currentMod = row ? rangeModFor(row, rangeCm, traits) : null;

  return (
    <>
      <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
        <Tooltip title="Distance between the two troopers, in the weapon chart's range bands (inches).">
          <InputLabel>Range</InputLabel>
        </Tooltip>
      </Grid>
      {/* Same columns and number style as Fireteam Purity below. */}
      <Grid item xs={2} sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', px: 1, pt: 1.5, pb: 1}}>
        <Box
          sx={{
            typography: 'body1',
            fontFamily: 'conthrax',
            whiteSpace: 'nowrap',
            color: row ? accentText : 'text.disabled',
          }}
        >
          {row ? modText(currentMod) : '—'}
        </Box>
      </Grid>
      <Grid item xs={1} />
      <Grid item xs={9} sx={{pt: 1.5, pb: 1}}>
        <Box sx={{position: 'relative', pt: 1.75}}>
          <Box sx={{display: 'flex', height: 30, borderRadius: 1, overflow: 'hidden', bgcolor: 'action.hover', border: 1, borderColor: 'divider'}}>
            {RANGE_BANDS.map((band, i) => {
              const mod = row ? rangeModFor(row, band.to, traits) : null;
              const selected = i === selectedIndex;
              return (
                <Tooltip key={band.to} title={`${band.label}${row ? ` · ${modText(mod)}` : ''}`}>
                  <Box
                    onClick={() => update(band.to)}
                    sx={{
                      flex: 1,
                      position: 'relative',
                      cursor: 'pointer',
                      borderRight: i < RANGE_BANDS.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      bgcolor: selected ? accent : (mod !== null ? alpha(accent, 0.14) : 'transparent'),
                      '&:hover': {filter: 'brightness(1.2)'},
                    }}
                  >
                    {selected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: '50%',
                          top: -12,
                          transform: 'translateX(-50%)',
                          width: 0,
                          height: 0,
                          borderLeft: '5px solid transparent',
                          borderRight: '5px solid transparent',
                          borderTop: `7px solid ${accent}`,
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        fontFamily: 'conthrax',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        color: selected ? theme.palette.getContrastText(accent) : 'text.secondary',
                        opacity: row ? 1 : 0.4,
                      }}
                    >
                      {row ? modText(mod) : ''}
                    </Box>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
          <Box sx={{display: 'flex', mt: 0.5}}>
            {RANGE_BANDS.map((band) => (
              <Box key={band.to} sx={{flex: 1, textAlign: 'center', fontSize: '0.6rem', color: 'text.disabled'}}>
                {band.inches}&Prime;
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>
    </>
  );
}

RangeInput.propTypes = {
  rangeCm: PropTypes.number.isRequired,
  update: PropTypes.func.isRequired,
  row: PropTypes.object,
  traits: PropTypes.object,
  variant: PropTypes.oneOf(['active', 'reactive']),
};

RangeInput.defaultProps = {
  row: null,
  traits: null,
  variant: 'active',
};

export default RangeInput;
