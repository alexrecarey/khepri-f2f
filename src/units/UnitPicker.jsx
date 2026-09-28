import {Fragment, useEffect, useMemo, useRef, useState} from 'react';
import {
  Autocomplete,
  Box,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import PropTypes from 'prop-types';
import {SKILL, bsWeapons, defaultWeapon, effectiveTraits, loadoutLabels, searchKey} from './profileToInputs.js';
import SelectField, {compactText} from './SelectField.jsx';
import {EMPTY_SELECTION} from './useMatchup.js';

// Faction logos shown per unit row before collapsing the rest into "+N".
const MAX_LOGOS = 4;

// Match the short ISC only, ignoring case and accents (`label` and `search` are built at load).
const filterOptions = (units, {inputValue}) => {
  const q = searchKey(inputValue.trim());
  return units.filter((u) => u.search.includes(q));
};

// Unit, faction, profile and loadout for one side. The weapon (auto-set by
// defaultWeapon) and cover are set in the calculator column.
function UnitPicker({variant, army, value, onChange, headerAction}) {
  const theme = useTheme();
  const color = variant === 'active' ? 'primary' : 'secondary';
  const headerColor = theme.palette[variant]['500'];

  const unit = army.units.find((u) => u.id === value.unitId) ?? null;
  const factionIds = unit?.inFactions ?? [];
  const factionId = value.factionId ?? (factionIds.length === 1 ? factionIds[0] : null);
  const groups = factionId ? unit?.byFaction[factionId]?.groups ?? [] : [];
  const group = groups.find((g) => g.id === value.groupId) ?? (groups.length === 1 ? groups[0] : null);
  const profiles = group?.profiles ?? [];
  const profile = profiles.find((p) => p.id === value.profileId) ?? (profiles.length === 1 ? profiles[0] : null);
  const options = group?.options ?? [];
  const option = options.find((o) => o.id === value.optionId) ?? null;

  const labels = useMemo(() => (group ? loadoutLabels(group, army.weapons) : []), [group, army.weapons]);
  const weapons = useMemo(() => (option ? bsWeapons(option, army.weapons) : []), [option, army.weapons]);
  // Team-Ops troopers can take one chart upgrade and one TacBall item (both optional).
  const teamOps = Boolean(profile) && Boolean(unit?.upgrades)
    && effectiveTraits(profile, option).skills.some((s) => s.id === SKILL.TEAM_OPS);
  // Changing upgrades can remove the weapon in use; fall back to the default.
  const setUpgrade = (patch) => {
    const keep = !value.weaponKey || ['dodge', 'none'].includes(value.weaponKey)
      || weapons.some((w) => w.key === value.weaponKey);
    set({...patch, ...(keep ? {} : {weaponKey: null})});
  };

  const set = (patch) => onChange({...value, ...patch});

  const [inputValue, setInputValue] = useState(unit?.label ?? '');
  const [open, setOpen] = useState(false);
  // Suggestion the list highlights: the first one, unless moved with the arrow keys.
  const highlighted = useRef(null);
  const inputRef = useRef(null);

  // Defaults that need a state write: a single loadout, and the default weapon.
  useEffect(() => {
    if (group && !value.optionId && labels.length === 1) {
      set({optionId: labels[0].id, weaponKey: null});
    } else if (option && !value.weaponKey && weapons.length > 0) {
      set({weaponKey: defaultWeapon(weapons, variant).key});
    }
  });

  // After picking a unit, faction, profile group or stat profile, focus and
  // open the next select that still needs a choice. It may only exist after the next render, so retry until it does;
  // stop once a loadout is set (the weapon is picked automatically).
  const rootRef = useRef(null);
  const [pendingFocus, setPendingFocus] = useState(false);
  const [openField, setOpenField] = useState(null);
  useEffect(() => {
    if (!pendingFocus || !rootRef.current) return;
    const el = rootRef.current.querySelector('[data-field][data-needs-choice="true"]');
    if (el) {
      el.focus();
      setOpenField(el.dataset.field);
      setPendingFocus(false);
    } else if (option) {
      setPendingFocus(false);
    }
  }, [pendingFocus, value, option]);
  const fieldProps = (name) => ({
    field: name,
    open: openField === name,
    onOpen: () => setOpenField(name),
    onClose: () => setOpenField(null),
  });

  const selectUnit = (u) => {
    onChange({...EMPTY_SELECTION, unitId: u?.id ?? null, inCover: value.inCover});
    if (u) setPendingFocus(true);
  };
  // Enter (or the soft keyboard's action key) takes the highlighted suggestion,
  // else the first one. Done here because MUI skips Enter when nothing is
  // highlighted or the keyboard is still composing.
  const pickSuggestion = (event) => {
    event.preventDefault();
    if (!open) return;
    const matches = filterOptions(army.units, {inputValue});
    const u = matches.includes(highlighted.current) ? highlighted.current : matches[0];
    if (!u) return;
    selectUnit(u);
    setOpen(false);
    inputRef.current?.blur();
  };

  const factionName = (id) => army.factions[id]?.name ?? `Faction ${id}`;
  const factionLogo = (id, size) => {
    const src = army.factions[id]?.logo;
    return src
      ? <img src={src} alt={factionName(id)} width={size} height={size} style={{objectFit: 'contain', flexShrink: 0}} />
      : null;
  };
  // Units like Warcors sit in dozens of factions; keep the row short.
  const factionLogos = (ids) => (
    <Box
      component="span"
      title={ids.map(factionName).join(', ')}
      sx={{ml: 'auto', pl: 1, display: 'inline-flex', alignItems: 'center', gap: 0.5}}
    >
      {ids.slice(0, MAX_LOGOS).map((id) => <Fragment key={id}>{factionLogo(id, 18)}</Fragment>)}
      {ids.length > MAX_LOGOS && (
        <Typography variant="caption" color="text.secondary">+{ids.length - MAX_LOGOS}</Typography>
      )}
    </Box>
  );

  return (
    <Grid container spacing={1.5} ref={rootRef}>
      <Grid item xs={12} sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Typography variant="h6" sx={{fontFamily: 'conthrax', color: headerColor}}>
          {variant === 'active' ? 'Active' : 'Reactive'}
        </Typography>
        {headerAction}
      </Grid>
      {/* A search form: keeps contact AutoFill off the field, and its submit
          catches a soft keyboard Enter that never arrives as a key event. */}
      <Grid item xs={12} component="form" role="search" autoComplete="off" onSubmit={pickSuggestion}>
        <Autocomplete
          id={`unit-search-${variant}`}
          size="small"
          options={army.units}
          value={unit}
          onChange={(event, u) => selectUnit(u)}
          onHighlightChange={(event, u) => { highlighted.current = u; }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.defaultMuiPrevented = true;
            pickSuggestion(event);
          }}
          getOptionLabel={(u) => u.label}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          filterOptions={filterOptions}
          autoHighlight
          blurOnSelect
          // Suggestions only while the user is typing; focusing or clicking a
          // field that already holds a unit shows nothing.
          inputValue={inputValue}
          onInputChange={(event, text, reason) => {
            setInputValue(text);
            if (reason === 'input') setOpen(text.trim() !== '');
          }}
          open={open}
          onClose={() => setOpen(false)}
          forcePopupIcon={false}
          renderOption={(props, u) => {
            // MUI 5.14 keys rows by label; key by id so duplicate names never collide.
            const {key, ...rest} = props;
            return (
              <li key={u.id} {...rest}>
                {u.label}
                {factionLogos(u.inFactions)}
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Unit"
              color={color}
              // No "name" in the placeholder: it made browsers offer contact AutoFill.
              placeholder="Search units"
              inputRef={inputRef}
              inputProps={{
                ...params.inputProps,
                name: `unit-search-${variant}`,
                autoCorrect: 'off',
                // Not "next": Android then moves focus itself and sends no Enter.
                enterKeyHint: 'search',
              }}
              // iOS zooms the page in on focus when an input's text is under 16px.
              sx={{'& .MuiInputBase-input': {fontSize: 'max(16px, 1rem)'}}}
            />
          )}
          ListboxProps={{sx: {'& .MuiAutocomplete-option': {fontSize: compactText.fontSize}}}}
        />
      </Grid>
      {unit && factionIds.length > 1 && (
        <Grid item xs={12}>
          <SelectField
            label="Faction"
            {...fieldProps('faction')}
            color={color}
            value={factionId}
            onChange={(id) => {
              set({factionId: id, groupId: null, profileId: null, optionId: null, weaponKey: null, upgrade: null, ball: null});
              setPendingFocus(true);
            }}
          >
            {factionIds.map((id) => (
              // Wrapper carries the gap: Select renders the selected item's children without MenuItem's sx.
              <MenuItem key={id} value={id}>
                <Box component="span" sx={{display: 'inline-flex', alignItems: 'center', gap: 1}}>
                  {factionLogo(id, 18)}{factionName(id)}
                </Box>
              </MenuItem>
            ))}
          </SelectField>
        </Grid>
      )}
      {groups.length > 1 && (
        <Grid item xs={12}>
          <SelectField
            label="Profile group"
            {...fieldProps('group')}
            color={color}
            value={group?.id ?? null}
            onChange={(id) => {
              set({groupId: id, profileId: null, optionId: null, weaponKey: null, upgrade: null, ball: null});
              setPendingFocus(true);
            }}
          >
            {groups.map((g) => (
              <MenuItem key={g.id} value={g.id}>{g.isc ?? g.profiles[0]?.name ?? `Group ${g.id}`}</MenuItem>
            ))}
          </SelectField>
        </Grid>
      )}
      {profiles.length > 1 && (
        <Grid item xs={12}>
          <SelectField
            label="Stat profile"
            {...fieldProps('stat')}
            color={color}
            value={profile?.id ?? null}
            onChange={(id) => {
              set({profileId: id});
              setPendingFocus(true);
            }}
          >
            {profiles.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name ?? `Profile ${p.id}`}</MenuItem>
            ))}
          </SelectField>
        </Grid>
      )}
      {group && (
        <Grid item xs={12}>
          <SelectField
            label="Profile"
            {...fieldProps('loadout')}
            needsChoice={!option && labels.length > 1}
            color={color}
            value={option?.id ?? null}
            onChange={(id) => set({optionId: id, weaponKey: null})}
          >
            {labels.map((l) => (
              <MenuItem key={l.id} value={l.id}>{l.label}</MenuItem>
            ))}
          </SelectField>
        </Grid>
      )}
      {teamOps && (
        <>
          <Grid item xs={12}>
            <SelectField
              label="Team-Ops upgrade"
              color={color}
              needsChoice={false}
              value={value.upgrade ?? -1}
              onChange={(i) => setUpgrade({upgrade: i === -1 ? null : i})}
            >
              <MenuItem value={-1}>None</MenuItem>
              {unit.upgrades.chart.map((u, i) => (
                <MenuItem key={u.label} value={i}>{u.label}</MenuItem>
              ))}
            </SelectField>
          </Grid>
          <Grid item xs={12}>
            <SelectField
              label="TacBall"
              color={color}
              needsChoice={false}
              value={value.ball ?? -1}
              onChange={(i) => setUpgrade({ball: i === -1 ? null : i})}
            >
              <MenuItem value={-1}>None</MenuItem>
              {unit.upgrades.ball.map((u, i) => (
                <MenuItem key={u.label} value={i}>{u.label}</MenuItem>
              ))}
            </SelectField>
          </Grid>
        </>
      )}
    </Grid>
  );
}

UnitPicker.propTypes = {
  variant: PropTypes.oneOf(['active', 'reactive']).isRequired,
  army: PropTypes.object.isRequired,
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  // Rendered at the right end of the title row (e.g. the Swap button).
  headerAction: PropTypes.node,
};

export default UnitPicker;
