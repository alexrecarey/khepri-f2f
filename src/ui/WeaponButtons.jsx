// A side card's weapon buttons (CC weapons included): each weapon a button,
// a weapon with several fire modes a group (name + one button per mode).
import PropTypes from 'prop-types';
import {shortWeaponName} from '../army/names.js';
import {isPseudo} from '../army/weapons.js';
import {dispatch} from '../state/store.js';
import {pseudoName} from '../rules/trooper.js';
import {render} from '../i18n/message.js';
import {useT} from './i18n.jsx';

// Weapon button text: the short name and fire mode, "Missile L. (Blast)". The
// full stat line (B, PS, ammo) belongs to the results, not to a button. The
// mode in t's language: the army's own translation, without the word for mode.
/** @typedef {import('../types.js').WeaponEntry} WeaponEntry */
/** @typedef {import('../types.js').Translator} Translator */

/**
 * @param {WeaponEntry} w
 * @param {Translator} t
 */
const modeText = (w, t) => (w.mode ? ` (${t.term('modes', w.mode, w.id).replace(/ Mode$|^Modo /i, '')})` : '');
/**
 * @param {WeaponEntry} w
 * @param {Translator} t
 */
export const weaponText = (w, t) => `${shortWeaponName(w.name, t.lang)}${modeText(w, t)}`;
/**
 * @param {WeaponEntry} w
 * @param {Translator} t
 */
const weaponTitle = (w, t) => `${w.name}${modeText(w, t)}`;
/**
 * @param {import('../types.js').Side} side
 * @param {import('../types.js').Choice} w
 */
const pick = (side, w) => dispatch({type: 'pickWeapon', side, key: w.key, kind: w.kind, zoc: Boolean(w.zoc)});

/** @param {{side: import('../types.js').Side, groups: import('../types.js').WeaponGroup[], selected: string | null, color: string}} props */
export default function WeaponButtons({side, groups, selected, color}) {
  const t = useT();
  return (
    <div className="row-wrap" role="group" aria-label={t('side.weapon')}>
      {groups.map((g) => (g.modes ? (
        // One weapon, several fire modes, best first for this side: the
        // name picks the first; name and chosen mode are filled, the
        // other modes outlined.
        <span key={g.key} className={`btn-group ${color}${g.modes.some((w) => w.key === selected) ? ' on' : ''}`}
          role="group" aria-label={shortWeaponName(g.name, t.lang)}>
          {/* A group with modes has their labels, rendered (renderMatchup). */}
          <button type="button" className="g-name" title={`${g.name}: ${/** @type {Map<string, string>} */ (g.labels).get(g.modes[0].key)}`}
            aria-pressed={g.modes.some((w) => w.key === selected)} onClick={() => pick(side, /** @type {WeaponEntry[]} */ (g.modes)[0])}>
            {shortWeaponName(g.name, t.lang)}
          </button>
          {/** @type {WeaponEntry[]} */ (g.modes).map((w) => (
            <button type="button" key={w.key} className={`g-mode${selected === w.key ? ' on' : ''}`}
              aria-pressed={selected === w.key} title={weaponTitle(w, t)} onClick={() => pick(side, w)}>
              {/** @type {Map<string, string>} */ (g.labels).get(w.key)}
            </button>
          ))}
        </span>
      ) : (
        <button type="button" key={g.key} className={`btn${selected === g.w.key ? ` on ${color}` : ''}`}
          aria-pressed={selected === g.w.key} title={isPseudo(g.w) ? undefined : weaponTitle(g.w, t)}
          onClick={() => pick(side, g.w)}>
          {isPseudo(g.w) ? render(t, pseudoName(g.w)) : weaponText(g.w, t)}
        </button>
      )))}
    </div>
  );
}

WeaponButtons.propTypes = {
  side: PropTypes.oneOf(['A', 'B']).isRequired, groups: PropTypes.array.isRequired, selected: PropTypes.string,
  color: PropTypes.string.isRequired,
};
