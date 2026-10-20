// One side of the matchup: the picked trooper's card (weapon buttons and the
// situation chips), or the empty slot that asks for one.
import PropTypes from 'prop-types';
import {FIRETEAM_MIN} from '../rules/modifiers.js';
import {ROLE, SIDE_NAME} from '../state/schema.js';
import {dispatch} from '../state/store.js';
import {CountChip, PickChip} from './Chips.jsx';
import {CardCrest} from './Crest.jsx';
import {SiteMark} from './icons.jsx';
import Plasma from './Plasma.jsx';
import WeaponButtons from './WeaponButtons.jsx';

const patch = (side, p) => dispatch({type: 'patchSide', side, patch: p});

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

export default function SideCard({side, view, onOpenPicker, onUpgrade}) {
  const color = ROLE[side];
  const {sel, resolved, groups, cc, ccAlliesMax, noCover, surprise, berserk, teamOps, faction, crest, short, loadout} = view[side];
  const unit = resolved?.unit;
  const option = resolved?.option;

  return (
    <section className="card" data-side={side} aria-label={`${color} trooper`}>
      <CardCrest slug={crest} />
      <button type="button" className="unit-btn" onClick={onOpenPicker}>
        <span className={`role ${color}`}>{SIDE_NAME[side].toUpperCase()}</span>
        {unit
          ? <span className="unit-name">{short}{loadout ? ` · ${loadout}` : ''} <span className="faction">{faction} ›</span></span>
          : <span className="unit-empty">Choose a trooper ›</span>}
      </button>
      {option && <WeaponButtons side={side} groups={groups} selected={sel.weaponKey} color={color} />}
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
          {/* Team-Ops: one pick from the unit's chart and one TacBall item;
              a weapon joins the weapon buttons, a skill or equipment shows
              on the chip. */}
          {teamOps && (
            <>
              <PickChip side={side} chip="upgrade" label="Team-Ops" options={teamOps.chart} value={sel.upgrade} color={color}
                onPick={(i) => onUpgrade({upgrade: i})} />
              <PickChip side={side} chip="ball" label="TacBall" options={teamOps.ball} value={sel.ball} color={color}
                onPick={(i) => onUpgrade({ball: i})} />
            </>
          )}
          {/* Fireteams only: the size of the team, 1 = none. */}
          <CountChip side={side} chip="ftSize" label="Fireteam" value={resolved.ftSize} min={FIRETEAM_MIN} max={resolved.ftMax} none={1} color={color} />
          {/* CC Attack: allies in contact with the target, +1 B each. */}
          {cc && (
            <CountChip side={side} chip="ccAllies" label="Allies" value={Math.min(resolved.ccAllies, ccAlliesMax)} min={1} max={ccAlliesMax}
              none={0} color={color} />
          )}
          {berserk && (
            <button type="button" className={`chip${sel.berserk ? ` on ${color}` : ''}`} aria-pressed={sel.berserk}
              onClick={() => patch(side, {berserk: !sel.berserk})}>
              {sel.berserk ? `Berserk${berserk.mod ? ` (+${berserk.mod})` : ''} ✓` : '+ Berserk'}
            </button>
          )}
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

SideCard.propTypes = {
  side: PropTypes.oneOf(['A', 'B']).isRequired, view: PropTypes.object.isRequired, onOpenPicker: PropTypes.func.isRequired,
  onUpgrade: PropTypes.func.isRequired,
};
