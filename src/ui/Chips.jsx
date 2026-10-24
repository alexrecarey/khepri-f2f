// Situation chips with an inline editor: tapped, a chip opens in place
// (ui.edit names which), a pick or × closes it.
import PropTypes from 'prop-types';
import {dispatch, useAppState} from '../state/store.js';
import {useT} from './i18n.jsx';

/** @typedef {import('../types.js').Side} Side */
/** The chip's name, as ui.edit names the one open (types.js UiState).
 * @typedef {NonNullable<import('../types.js').UiState['edit']>['chip'] | 'firewall' | 'hackedReset'} ChipName */

/**
 * @param {Side} side
 * @param {Partial<import('../types.js').Selection>} p
 */
const patch = (side, p) => dispatch({type: 'patchSide', side, patch: p});

/**
 * @param {Side} side
 * @param {ChipName} chip
 * @returns {[boolean, (on: boolean) => void]}
 */
function useEditing(side, chip) {
  const editing = useAppState((st) => st.ui.edit?.side === side && st.ui.edit.chip === chip);
  // Every chip's name is one ui.edit can hold (the two PickChips with their own names included).
  /** @param {boolean} on */
  const setEditing = (on) => dispatch({type: 'setEdit', edit: on ? {side, chip: /** @type {NonNullable<import('../types.js').UiState['edit']>['chip']} */ (chip)} : null});
  return [editing, setEditing];
}

// A number the player sets with a chip: closed, "+ Fireteam" or "Fireteam 3";
// tapped, one button per value from `min` to `max` and × for none (`none`).
// Hidden when nothing above `none` is possible.
/** @param {{side: Side, chip: 'ftSize' | 'ccAllies', label: string, value: number, min: number, max: number, none: number, color: string}} props */
export function CountChip({side, chip, label, value, min, max, none, color}) {
  const t = useT();
  const [editing, setEditing] = useEditing(side, chip);
  /** @param {number} n */
  const set = (n) => { patch(side, {[chip]: n}); setEditing(false); };
  if (max < min) return null;
  if (editing) {
    const values = [];
    for (let n = min; n <= max; n++) values.push(n);
    return (
      <span className={`chip-group ${color}`}>
        <span className="chip-label">{label}</span>
        {values.map((n) => (
          <button type="button" key={n} className={`n${n === value ? ' on' : ''}`} onClick={() => set(n)}>{n}</button>
        ))}
        <button type="button" className="n" aria-label={t('chip.none', {label})} onClick={() => set(none)}>×</button>
      </span>
    );
  }
  return value >= min
    ? <button type="button" className={`chip on ${color}`} onClick={() => setEditing(true)}>{label} {value}</button>
    : <button type="button" className="chip" onClick={() => setEditing(true)}>+ {label}</button>;
}

CountChip.propTypes = {
  side: PropTypes.oneOf(['A', 'B']).isRequired, chip: PropTypes.string.isRequired, label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired, min: PropTypes.number.isRequired, max: PropTypes.number.isRequired,
  none: PropTypes.number.isRequired, color: PropTypes.string.isRequired,
};

// One item from a list the player picks with a chip: closed, "+ Team-Ops" or
// "Team-Ops: BS+1"; tapped, one button per option and × for none (not when
// `required`: a Firewall of the trooper's own). `value` is the picked index or
// null; onPick gets the same. Hidden with no options.
/** @param {{side: Side, chip: ChipName, label: string, options: string[], value?: number | null, onPick: (i: number | null) => void, color: string, required?: boolean}} props */
export function PickChip({side, chip, label, options, value, onPick, color, required = false}) {
  const t = useT();
  const [editing, setEditing] = useEditing(side, chip);
  /** @param {number | null} i */
  const pick = (i) => { onPick(i); setEditing(false); };
  if (options.length === 0) return null;
  const picked = value != null ? options[value] : null;
  if (editing) {
    return (
      <span className={`chip-group list ${color}`} role="group" aria-label={label}>
        <span className="chip-label">{label}</span>
        {options.map((o, i) => (
          <button type="button" key={i} className={`opt${i === value ? ' on' : ''}`} aria-pressed={i === value} onClick={() => pick(i)}>{o}</button>
        ))}
        {!required && <button type="button" className="n" aria-label={t('chip.none', {label})} onClick={() => pick(null)}>×</button>}
      </span>
    );
  }
  return picked
    ? <button type="button" className={`chip on ${color}`} onClick={() => setEditing(true)}>{label}: {picked}</button>
    : <button type="button" className="chip" onClick={() => setEditing(true)}>+ {label}</button>;
}

PickChip.propTypes = {
  side: PropTypes.oneOf(['A', 'B']).isRequired, chip: PropTypes.string.isRequired, label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired, value: PropTypes.number, onPick: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired, required: PropTypes.bool,
};

// An on / off situation: "+ Targeted", tapped "Targeted ✓". `field` is the
// side's selection field it sets.
/** @param {{side: Side, field: 'targeted' | 'immA', on: boolean, label: string, color: string}} props */
export function ToggleChip({side, field, on, label, color}) {
  return (
    <button type="button" className={`chip${on ? ` on ${color}` : ''}`} aria-pressed={on} onClick={() => patch(side, {[field]: !on})}>
      {on ? `${label} ✓` : `+ ${label}`}
    </button>
  );
}

ToggleChip.propTypes = {
  side: PropTypes.oneOf(['A', 'B']).isRequired, field: PropTypes.string.isRequired, on: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired, color: PropTypes.string.isRequired,
};
