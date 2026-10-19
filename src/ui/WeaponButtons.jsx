// One row of a side card's weapon buttons: each weapon a button, a weapon
// with several fire modes a group (name + one button per mode).
import PropTypes from 'prop-types';
import {shortWeaponName} from '../army/names.js';
import {dispatch} from '../state/store.js';

// Weapon button text: the short name and fire mode, "Missile L. (Blast)". The
// full stat line (B, PS, ammo) belongs to the results, not to a button.
const modeText = (w) => (w.mode ? ` (${w.mode.replace(/ Mode$/i, '')})` : '');
export const weaponText = (w) => `${shortWeaponName(w.name)}${modeText(w)}`;
const weaponTitle = (w) => `${w.name}${modeText(w)}`;
const pick = (side, w) => dispatch({type: 'pickWeapon', side, key: w.key, cc: Boolean(w.cc)});

// `label`: a heading at the start of the row ("CC").
export default function WeaponButtons({side, groups, selected, color, label, ariaLabel}) {
  return (
    <div className="row-wrap" role="group" aria-label={ariaLabel}>
      {label && <span className="row-label" aria-hidden="true">{label}</span>}
      {groups.map((g) => (g.modes ? (
        // One weapon, several fire modes, best first for this side: the
        // name picks the first; name and chosen mode are filled, the
        // other modes outlined.
        <span key={g.key} className={`btn-group ${color}${g.modes.some((w) => w.key === selected) ? ' on' : ''}`}
          role="group" aria-label={shortWeaponName(g.name)}>
          <button type="button" className="g-name" title={`${g.name}: ${g.labels.get(g.modes[0].key)}`}
            aria-pressed={g.modes.some((w) => w.key === selected)} onClick={() => pick(side, g.modes[0])}>
            {shortWeaponName(g.name)}
          </button>
          {g.modes.map((w) => (
            <button type="button" key={w.key} className={`g-mode${selected === w.key ? ' on' : ''}`}
              aria-pressed={selected === w.key} title={weaponTitle(w)} onClick={() => pick(side, w)}>
              {g.labels.get(w.key)}
            </button>
          ))}
        </span>
      ) : (
        <button type="button" key={g.key} className={`btn${selected === g.w.key ? ` on ${color}` : ''}`}
          aria-pressed={selected === g.w.key} title={g.w.pseudo ? undefined : weaponTitle(g.w)}
          onClick={() => pick(side, g.w)}>
          {g.w.pseudo ? g.w.label.replace(/ \(unopposed\)$/, '') : weaponText(g.w)}
        </button>
      )))}
    </div>
  );
}

WeaponButtons.propTypes = {
  side: PropTypes.oneOf(['A', 'B']).isRequired, groups: PropTypes.array.isRequired, selected: PropTypes.string,
  color: PropTypes.string.isRequired, label: PropTypes.string, ariaLabel: PropTypes.string.isRequired,
};
