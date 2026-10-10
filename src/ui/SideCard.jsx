// One side of the matchup: the picked trooper's card (weapon buttons and the
// situation chips), or the empty slot that asks for one.
import PropTypes from 'prop-types';
import {shortWeaponName} from '../army/names.js';
import {FIRETEAM_MIN} from '../rules/modifiers.js';
import {ROLE, SIDE_NAME} from '../state/schema.js';
import {dispatch, useAppState} from '../state/store.js';
import {SiteMark} from './icons.jsx';
import Plasma from './Plasma.jsx';

// Weapon button text: the short name and fire mode, "Missile L. (Blast)". The
// full stat line (B, PS, ammo) belongs to the results, not to a button.
const modeText = (w) => (w.mode ? ` (${w.mode.replace(/ Mode$/i, '')})` : '');
export const weaponText = (w) => `${shortWeaponName(w.name)}${modeText(w)}`;
const weaponTitle = (w) => `${w.name}${modeText(w)}`;
const patch = (side, p) => dispatch({type: 'patchSide', side, patch: p});

// Only for troopers that can be in a fireteam, with sizes up to their max.
function FireteamChip({side, size, max, color}) {
  const editing = useAppState((st) => st.ui.edit?.side === side && st.ui.edit.chip === 'fireteam');
  const setEditing = (on) => dispatch({type: 'setEdit', edit: on ? {side, chip: 'fireteam'} : null});
  const onChange = (n) => patch(side, {ftSize: n});
  const inTeam = size >= FIRETEAM_MIN;
  if (max < FIRETEAM_MIN) return null;
  if (editing) {
    const sizes = [];
    for (let n = FIRETEAM_MIN; n <= max; n++) sizes.push(n);
    return (
      <span className={`chip-group ${color}`}>
        <span style={{marginRight: 4}}>Fireteam</span>
        {sizes.map((n) => (
          <button type="button" key={n} className={`n${n === size ? ' on' : ''}`}
            onClick={() => { onChange(n); setEditing(false); }}>{n}</button>
        ))}
        <button type="button" className="n" aria-label="Not in a fireteam" onClick={() => { onChange(1); setEditing(false); }}>×</button>
      </span>
    );
  }
  return inTeam
    ? <button type="button" className={`chip on ${color}`} onClick={() => setEditing(true)}>Fireteam {size}</button>
    : <button type="button" className="chip" onClick={() => setEditing(true)}>+ Fireteam</button>;
}

FireteamChip.propTypes = {side: PropTypes.oneOf(['A', 'B']).isRequired, size: PropTypes.number.isRequired, max: PropTypes.number.isRequired, color: PropTypes.string.isRequired};

// A side with no trooper yet: a tall slot with the site mark, one call to
// action and the latest recent picks as one-tap chips. A slow plasma tint
// behind it draws the eye to what is still missing. Tapping anywhere on the
// card opens the search (the button covers the card, app.css).
export function EmptySlot({side, recents, onOpenPicker, onPick, hint}) {
  const color = ROLE[side];
  return (
    <section className={`card slot ${color}`} data-side={side} aria-label={`${color} trooper`}>
      <Plasma cssVar={`--${color}`} seed={side === 'A' ? 0 : 40} />
      <button type="button" className="slot-open" onClick={onOpenPicker}>
        <span className="slot-die"><SiteMark fill={`var(--${color})`} /></span>
        <span className={`role ${color}`}>{SIDE_NAME[side].toUpperCase()}</span>
        <span className="slot-title">Choose a trooper</span>
      </button>
      {recents.length > 0 && (
        <div className="slot-chips" role="group" aria-label="Recent troopers">
          {recents.map((h) => (
            <button type="button" key={h.rowId} className="chip" onClick={() => onPick(h)}>{h.unit}</button>
          ))}
        </div>
      )}
      {hint && <span className="slot-hint">or press <kbd>{side === 'A' ? 'A' : 'R'}</kbd> to search</span>}
    </section>
  );
}

EmptySlot.propTypes = {
  side: PropTypes.oneOf(['A', 'B']).isRequired, recents: PropTypes.array.isRequired,
  onOpenPicker: PropTypes.func.isRequired, onPick: PropTypes.func.isRequired, hint: PropTypes.bool,
};

export default function SideCard({side, view, onOpenPicker}) {
  const color = ROLE[side];
  const {sel, resolved, groups, noCover, surprise, faction, short, loadout} = view[side];
  const unit = resolved?.unit;
  const option = resolved?.option;

  return (
    <section className="card" data-side={side} aria-label={`${color} trooper`}>
      <button type="button" className="unit-btn" onClick={onOpenPicker}>
        <span className={`role ${color}`}>{SIDE_NAME[side].toUpperCase()}</span>
        {unit
          ? <span className="unit-name">{short}{loadout ? ` · ${loadout}` : ''} <span className="faction">{faction} ›</span></span>
          : <span className="unit-empty">Choose a trooper ›</span>}
      </button>
      {option && (
        <div className="row-wrap" role="group" aria-label="Weapon">
          {groups.map((g) => (g.modes ? (
            // One weapon, several fire modes, best first for this side: the
            // name picks the first; name and chosen mode are filled, the
            // other modes outlined.
            <span key={g.key} className={`btn-group ${color}${g.modes.some((w) => w.key === sel.weaponKey) ? ' on' : ''}`}
              role="group" aria-label={shortWeaponName(g.name)}>
              <button type="button" className="g-name" title={`${g.name}: ${g.labels.get(g.modes[0].key)}`}
                aria-pressed={g.modes.some((w) => w.key === sel.weaponKey)} onClick={() => patch(side, {weaponKey: g.modes[0].key})}>
                {shortWeaponName(g.name)}
              </button>
              {g.modes.map((w) => (
                <button type="button" key={w.key} className={`g-mode${sel.weaponKey === w.key ? ' on' : ''}`}
                  aria-pressed={sel.weaponKey === w.key} title={weaponTitle(w)} onClick={() => patch(side, {weaponKey: w.key})}>
                  {g.labels.get(w.key)}
                </button>
              ))}
            </span>
          ) : (
            <button type="button" key={g.key} className={`btn${sel.weaponKey === g.w.key ? ` on ${color}` : ''}`}
              aria-pressed={sel.weaponKey === g.w.key} title={g.w.pseudo ? undefined : weaponTitle(g.w)}
              onClick={() => patch(side, {weaponKey: g.w.key})}>
              {g.w.pseudo ? g.w.label.replace(/ \(unopposed\)$/, '') : weaponText(g.w)}
            </button>
          )))}
        </div>
      )}
      {unit && (
        <div className="row-wrap">
          {/* Cover or, for Sapper, the Foxhole (its own cover): one or the other. */}
          {!noCover && (
            <button type="button" className={`chip${sel.inCover && !resolved.sapper ? ` on ${color}` : ''}`} aria-pressed={sel.inCover && !resolved.sapper}
              onClick={() => patch(side, {inCover: !(sel.inCover && !resolved.sapper), sapper: false})}>
              {sel.inCover && !resolved.sapper ? 'Cover ✓' : '+ Cover'}
            </button>
          )}
          {resolved.canSapper && (
            <button type="button" className={`chip${resolved.sapper ? ` on ${color}` : ''}`} aria-pressed={resolved.sapper}
              onClick={() => patch(side, {sapper: !resolved.sapper, inCover: false})}>
              {resolved.sapper ? 'Sapper ✓' : '+ Sapper'}
            </button>
          )}
          <FireteamChip side={side} size={resolved.ftSize} max={resolved.ftMax} color={color} />
          {surprise !== 0 && (
            <button type="button" className={`chip${sel.surpriseAttack ? ` on ${color}` : ''}`} aria-pressed={sel.surpriseAttack}
              onClick={() => patch(side, {surpriseAttack: !sel.surpriseAttack})}>
              {sel.surpriseAttack ? `Surprise attack (${surprise}) ✓` : '+ Surprise attack'}
            </button>
          )}
        </div>
      )}
      {resolved?.unsupportedUpgradeWeapons?.length > 0 && (
        <span className="note">Not rolled: {resolved.unsupportedUpgradeWeapons.join(', ')}</span>
      )}
    </section>
  );
}

SideCard.propTypes = {side: PropTypes.oneOf(['A', 'B']).isRequired, view: PropTypes.object.isRequired, onOpenPicker: PropTypes.func.isRequired};
