// Smoke and White Noise, inside the range selector (canvas board A1): two
// small chips under the legend, each side's zone MOD after its Range MOD, and
// a narrow slot by the swap button (board D3) that is always there, open or
// closed, so the bands never change length.
import PropTypes from 'prop-types';
import {ZONES, zoneName} from '../rules/visibility.js';
import {render} from '../i18n/message.js';
import {dispatch} from '../state/store.js';
import {signed} from '../rules/lines.js';
import {ZoneIcon} from './icons.jsx';
import {useT} from './i18n.jsx';

// " · smoke −6", " · smoke 0 (MSV2)", " · no LoF": what the zones do to one
// side's attack (matchupView vis), after its Range MOD.
/**
 * @param {import('../types.js').VisSide} v rendered (renderMatchup): its labels are strings
 * @param {import('../types.js').Translator} t
 */
export function zoneText(v, t) {
  if (v.blocked) return ` · ${t('range.noLof')}`;
  return v.lines.map((l) => {
    const name = render(t, zoneName(l.zone)).toLocaleLowerCase(t.lang);
    return l.ignoredBy ? ` · ${name} 0 (${/** @type {string} */ (l.ignoredBy)})` : ` · ${name} ${signed(l.value)}`;
  }).join('');
}

/** @param {{zones: import('../types.js').Zones, open: boolean}} props */
export function ZoneChips({zones, open}) {
  const t = useT();
  return (
    <div className="zone-chips" role="group" aria-label={t('range.between')}>
      {ZONES.map((z) => (
        <button type="button" key={z} className={`range-chip${zones[z] ? ' on' : ''}`} aria-pressed={zones[z]} tabIndex={open ? 0 : -1}
          onClick={() => dispatch({type: 'setZone', zone: z, on: !zones[z]})}>
          <ZoneIcon zone={z} />{render(t, zoneName(z))}
        </button>
      ))}
    </div>
  );
}

ZoneChips.propTypes = {zones: PropTypes.object.isRequired, open: PropTypes.bool};

// The slot: the icons of the zones that are on, or a faint cloud when none
// is (so the feature can be found); a tap opens or closes the selector.
/** @param {{zones: import('../types.js').Zones, open: boolean}} props */
export function ZoneMarks({zones, open}) {
  const t = useT();
  const on = ZONES.filter((z) => zones[z]);
  const label = on.length === 1 ? t('range.zoneBetween', {zone: render(t, zoneName(on[0]))})
    : on.length ? t('range.bothBetween') : t('range.zones');
  return (
    <button type="button" className={`zone-marks${on.length ? ' on' : ''}`} aria-label={`${label}; ${t(open ? 'range.close' : 'range.open')}`}
      aria-expanded={open} onClick={() => dispatch({type: 'setRangeOpen', open: !open})}>
      {on.length ? on.map((z) => <ZoneIcon key={z} zone={z} size={16} />) : <ZoneIcon zone="smoke" size={16} />}
    </button>
  );
}

ZoneMarks.propTypes = {zones: PropTypes.object.isRequired, open: PropTypes.bool};
