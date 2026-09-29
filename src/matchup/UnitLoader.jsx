import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PropTypes from 'prop-types';
import UnitPicker from './UnitPicker.jsx';
import {matchupTraits} from './labels.js';

// "HATAMOTO Plasma Carbine (Hit)" for the collapsed summary: the loadout's
// short name from Army, then the weapon.
function sideSummary(resolved) {
  if (!resolved?.unit) return '—';
  const short = resolved.option?.name ?? resolved.unit.name ?? resolved.unit.isc;
  const w = resolved.weapon;
  let weapon = '';
  if (w?.pseudo) weapon = w.label;
  else if (w) weapon = `${w.name}${w.mode ? ` (${w.mode.replace(/ Mode$/i, '')})` : ''}`;
  return weapon ? `${short} · ${weapon}` : short;
}

function SideLine({resolved, role, color}) {
  const traits = matchupTraits(resolved, role);
  return (
    <Box>
      <Typography variant="body1" sx={{color, fontWeight: 600}}>{sideSummary(resolved)}</Typography>
      {traits.length > 0 && (
        <Typography variant="caption" color="text.secondary">{traits.join(', ')}</Typography>
      )}
    </Box>
  );
}

SideLine.propTypes = {
  resolved: PropTypes.object,
  role: PropTypes.oneOf(['A', 'B']).isRequired,
  color: PropTypes.string.isRequired,
};

// Unit pickers and swap/minify/reset. State lives in useMatchup (App).
function UnitLoader({matchup}) {
  const {army, loadError, collapsed, setCollapsed, derived, hasSelection, swapSides, reset} = matchup;
  const resolvedA = matchup.A.resolved;
  const resolvedB = matchup.B.resolved;


  // In the Active title row (top-right of the card) when the columns stack.
  const swapButton = (
    <Tooltip title="Swap active and reactive">
      <span>
        <Button
          variant="outlined"
          size="small"
          color="inherit"
          startIcon={<CachedIcon />}
          disabled={!hasSelection}
          onClick={swapSides}
          sx={{borderColor: 'text.secondary', whiteSpace: 'nowrap', px: '9px', py: '3px'}}
        >
          Swap
        </Button>
      </span>
    </Tooltip>
  );

  // Between the columns there's room for just the icon.
  const swapIconButton = (
    <Tooltip title="Swap active and reactive">
      <span>
        <IconButton
          aria-label="swap active and reactive"
          disabled={!hasSelection}
          onClick={swapSides}
        >
          <CachedIcon sx={{fontSize: 36}} />
        </IconButton>
      </span>
    </Tooltip>
  );

  if (collapsed) {
    return (
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{flex: 1, minWidth: 0}}>
              <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems={{xs: 'stretch', sm: 'center'}}>
                <Box sx={{flex: 1, minWidth: 0}}>
                  <SideLine resolved={resolvedA} role="A" color="active.500" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{alignSelf: 'center'}}>vs</Typography>
                <Box sx={{flex: 1, minWidth: 0}}>
                  <SideLine resolved={resolvedB} role="B" color="reactive.500" />
                </Box>
              </Stack>
            </Box>
            <Tooltip title="Edit matchup">
              <IconButton
                aria-label="edit matchup"
                onClick={() => setCollapsed(false)}
                sx={{border: 1, borderColor: 'text.secondary'}}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          {loadError && (
            <Grid item xs={12}>
              <Alert severity="error">Could not load unit data: {String(loadError.message ?? loadError)}</Alert>
            </Grid>
          )}
          {!army && !loadError && (
            <Grid item xs={12}>
              <CircularProgress size={24} />
            </Grid>
          )}
          {army && (
            <>
              <Grid item xs={12}>
                <Stack direction={{xs: 'column', md: 'row'}} spacing={2} alignItems="stretch">
                  <Box sx={{flex: 1, minWidth: 0}}>
                    <UnitPicker
                      army={army}
                      onChange={matchup.A.setSel}
                      value={matchup.A.sel}
                      variant="active"
                      headerAction={<Box sx={{display: {xs: 'block', md: 'none'}}}>{swapButton}</Box>}
                    />
                  </Box>
                  <Box sx={{display: {xs: 'none', md: 'flex'}, alignItems: 'center', justifyContent: 'center', mx: 2}}>
                    {swapIconButton}
                  </Box>
                  <Box sx={{flex: 1, minWidth: 0}}>
                    <UnitPicker army={army} onChange={matchup.B.setSel} value={matchup.B.sel} variant="reactive" />
                  </Box>
                </Stack>
              </Grid>
              {hasSelection && derived && (
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    {[...derived.errors, ...derived.warnings].map((e) => (
                      <Alert key={e} severity="warning">{e}</Alert>
                    ))}
                    {derived.notes.map((n) => (
                      <Typography key={n} variant="caption" color="text.secondary">{n}</Typography>
                    ))}
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={<KeyboardArrowUpIcon />}
                        onClick={() => setCollapsed(true)}
                        sx={{
                          bgcolor: 'text.primary',
                          color: 'background.paper',
                          '&:hover': {bgcolor: 'text.secondary'},
                        }}
                      >
                        Minify
                      </Button>
                      <Button
                        variant="text"
                        sx={{color: 'text.primary'}}
                        onClick={reset}
                      >
                        Reset
                      </Button>
                    </Stack>
                  </Stack>
                </Grid>
              )}
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

UnitLoader.propTypes = {
  matchup: PropTypes.object.isRequired,
};

export default UnitLoader;
