// Situation chips with an inline editor: tapped, a chip opens in place
// (ui.edit names which), a pick or × closes it.
import PropTypes from 'prop-types';
import {dispatch, useAppState} from '../state/store.js';
import {useT} from './i18n.jsx';

const patch = (side, p) => dispatch({type: 'patchSide', side, patch: p});

function useEditing(side, chip) {
  const editing = useAppState((st) => st.ui.edit?.side === side && st.ui.edit.chip === chip);
  const setEditing = (on) => dispatch({type: 'setEdit', edit: on ? {side, chip} : null});
  return [editing, setEditing];
}

// A number the player sets with a chip: closed, "+ Fireteam" or "Fireteam 3";
// tapped, one button per value from `min` to `max` and × for none (`none`).
// Hidden when nothing above `none` is possible.
export function CountChip({side, chip, label, value, min, max, none, color}) {
  const t = useT();
  const [editing, setEditing] = useEditing(side, chip);
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
// "Team-Ops: BS+1"; tapped, one button per option and × for none. `value` is
// the picked index or null; onPick gets the same. Hidden with no options.
export function PickChip({side, chip, label, options, value, onPick, color}) {
  const t = useT();
  const [editing, setEditing] = useEditing(side, chip);
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
        <button type="button" className="n" aria-label={t('chip.none', {label})} onClick={() => pick(null)}>×</button>
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
  color: PropTypes.string.isRequired,
};
