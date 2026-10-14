// Smoke and White Noise, inside the range selector (canvas board A1): two
// small chips under the legend, each side's zone MOD after its Range MOD, and
// with the selector closed, the zones' icons by the swap button.
import PropTypes from 'prop-types';
import {ZONES, ZONE_NAME} from '../rules/visibility.js';
import {dispatch} from '../state/store.js';
import {ZoneIcon} from './icons.jsx';

const signed = (n) => `${n > 0 ? '+' : ''}${n}`;

// " · smoke −6", " · smoke 0 (MSV2)", " · no LoF": what the zones do to one
// side's attack (matchupView vis), after its Range MOD.
export function zoneText(v) {
  if (v.blocked) return ' · no LoF';
  return v.lines.map((l) => {
    const name = ZONE_NAME[l.zone].toLowerCase();
    return l.ignoredBy ? ` · ${name} 0 (${l.ignoredBy})` : ` · ${name} ${signed(l.value)}`;
  }).join('');
}

export function ZoneChips({zones, open}) {
  return (
    <div className="zone-chips" role="group" aria-label="Between the troopers">
      {ZONES.map((z) => (
        <button type="button" key={z} className={`zone-chip${zones[z] ? ' on' : ''}`} aria-pressed={zones[z]} tabIndex={open ? 0 : -1}
          onClick={() => dispatch({type: 'setZone', zone: z, on: !zones[z]})}>
          <ZoneIcon zone={z} />{ZONE_NAME[z]}
        </button>
      ))}
    </div>
  );
}

ZoneChips.propTypes = {zones: PropTypes.object.isRequired, open: PropTypes.bool};

// Closed: which zones are on, by the swap button; a tap opens the selector.
export function ZoneMarks({zones}) {
  const on = ZONES.filter((z) => zones[z]);
  if (!on.length) return null;
  return (
    <button type="button" className="zone-marks" aria-label={`${on.map((z) => ZONE_NAME[z]).join(' and ')} between them; open range`}
      onClick={() => dispatch({type: 'setRangeOpen', open: true})}>
      {on.map((z) => <ZoneIcon key={z} zone={z} size={18} />)}
    </button>
  );
}

ZoneMarks.propTypes = {zones: PropTypes.object.isRequired};
