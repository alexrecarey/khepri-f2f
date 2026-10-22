// One side of the matchup: the picked trooper's card (weapon buttons and the
// situation chips), or the empty slot that asks for one.
import PropTypes from 'prop-types';
import {FIRETEAM_MIN, HACKED_RESET_MODS, firewallMod} from '../rules/modifiers.js';
import {ROLE} from '../state/schema.js';
import {dispatch} from '../state/store.js';
import {FIREWALL_CHIPS} from '../rules/trooper.js';
import {CountChip, PickChip, ToggleChip} from './Chips.jsx';
import {CardCrest} from './Crest.jsx';
import {SiteMark} from './icons.jsx';
import Plasma from './Plasma.jsx';
import WeaponButtons from './WeaponButtons.jsx';
import {Rich, useT} from './i18n.jsx';

// "ACTIVE" / "REACTIVE" over a card, in t's language.
export const sideLabel = (t, side) => t(`side.${ROLE[side]}`).toLocaleUpperCase(t.lang);

const patch = (side, p) => dispatch({type: 'patchSide', side, patch: p});

// A side with no trooper yet: a tall slot with the site mark, one call to
// action and the latest recent picks as one-tap chips. A slow plasma tint
// behind it draws the eye to what is still missing. Tapping anywhere on the
// card opens the search (the button covers the card, app.css).
export function EmptySlot({side, recents, onOpenPicker, onPick, hint}) {
  const t = useT();
  const color = ROLE[side];
  return (
    <section className={`card slot ${color}`} data-side={side} aria-label={t('side.trooper', {side: t(`side.${color}`)})}>
      <Plasma cssVar={`--${color}`} seed={side === 'A' ? 0 : 40} />
      <button type="button" className="slot-open" onClick={onOpenPicker}>
        <span className="slot-die"><SiteMark fill={`var(--${color})`} /></span>
        <span className={`role ${color}`}>{sideLabel(t, side)}</span>
        <span className="slot-title">{t('side.choose')}</span>
      </button>
      {recents.length > 0 && (
        <div className="slot-chips" role="group" aria-label={t('side.recent')}>
          {recents.map((h) => (
            <button type="button" key={h.rowId} className="chip" onClick={() => onPick(h)}>{h.unit}</button>
          ))}
        </div>
      )}
      {hint && <span className="slot-hint"><Rich text={t('side.pressKey', {key: side === 'A' ? 'A' : 'R'})} tags={{kbd: (k) => <kbd>{k}</kbd>}} /></span>}
    </section>
  );
}

EmptySlot.propTypes = {
  side: PropTypes.oneOf(['A', 'B']).isRequired, recents: PropTypes.array.isRequired,
  onOpenPicker: PropTypes.func.isRequired, onPick: PropTypes.func.isRequired, hint: PropTypes.bool,
};

export default function SideCard({side, view, onOpenPicker, onUpgrade}) {
  const t = useT();
  const color = ROLE[side];
  const {sel, resolved, groups, cc, ccAlliesMax, noCover, hacked, targetedChip, hackedChip, immAChip, surprise, berserk, teamOps, faction, crest, short,
    loadout} = view[side];
  const unit = resolved?.unit;
  const option = resolved?.option;

  return (
    <section className="card" data-side={side} aria-label={t('side.trooper', {side: t(`side.${color}`)})}>
      <CardCrest slug={crest} />
      <button type="button" className="unit-btn" onClick={onOpenPicker}>
        <span className={`role ${color}`}>{sideLabel(t, side)}</span>
        {unit
          ? <span className="unit-name">{short}{loadout ? ` · ${loadout}` : ''} <span className="faction">{faction} ›</span></span>
          : <span className="unit-empty">{t('side.choose')} ›</span>}
      </button>
      {option && <WeaponButtons side={side} groups={groups} selected={sel.weaponKey} color={color} />}
      {unit && (
        <div className="row-wrap">
          {/* Hacked: Firewall (-3 / -6) in place of cover, which does nothing
              against a Comms Attack. Starts on the trooper's own, which
              can't be switched off. */}
          {hacked && (
            <PickChip side={side} chip="firewall" label={t('chip.firewall')} options={FIREWALL_CHIPS.map(String)}
              value={FIREWALL_CHIPS.includes(resolved.firewall) ? FIREWALL_CHIPS.indexOf(resolved.firewall) : null} color={color}
              required={firewallMod(resolved.traits) !== 0} onPick={(i) => patch(side, {firewall: i == null ? 0 : FIREWALL_CHIPS[i]})} />
          )}
          {/* What the pick allows: Targeted for a shot or program, Hacked
              (-3 to -12) for a Reset, IMM-A for a Dodge. */}
          {targetedChip && <ToggleChip side={side} field="targeted" on={sel.targeted} label={t('chip.targeted')} color={color} />}
          {hackedChip && (
            <PickChip side={side} chip="hackedReset" label={t('chip.hacked')} options={HACKED_RESET_MODS.map(String)}
              value={HACKED_RESET_MODS.includes(sel.hackedReset) ? HACKED_RESET_MODS.indexOf(sel.hackedReset) : null} color={color}
              onPick={(i) => patch(side, {hackedReset: i == null ? 0 : HACKED_RESET_MODS[i]})} />
          )}
          {immAChip && <ToggleChip side={side} field="immA" on={sel.immA} label={t('chip.immA')} color={color} />}
          {/* Cover or, for Sapper, the Foxhole (its own cover): one or the other. */}
          {!hacked && !noCover && (
            <button type="button" className={`chip${sel.inCover && !resolved.sapper ? ` on ${color}` : ''}`} aria-pressed={sel.inCover && !resolved.sapper}
              onClick={() => patch(side, {inCover: !(sel.inCover && !resolved.sapper), sapper: false})}>
              {sel.inCover && !resolved.sapper ? `${t('chip.cover')} ✓` : `+ ${t('chip.cover')}`}
            </button>
          )}
          {!hacked && resolved.canSapper && (
            <button type="button" className={`chip${resolved.sapper ? ` on ${color}` : ''}`} aria-pressed={resolved.sapper}
              onClick={() => patch(side, {sapper: !resolved.sapper, inCover: false})}>
              {resolved.sapper ? `${t('chip.sapper')} ✓` : `+ ${t('chip.sapper')}`}
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
          <CountChip side={side} chip="ftSize" label={t('chip.fireteam')} value={resolved.ftSize} min={FIRETEAM_MIN} max={resolved.ftMax} none={1} color={color} />
          {/* CC Attack: allies in contact with the target, +1 B each. */}
          {cc && (
            <CountChip side={side} chip="ccAllies" label={t('chip.allies')} value={Math.min(resolved.ccAllies, ccAlliesMax)} min={1} max={ccAlliesMax}
              none={0} color={color} />
          )}
          {berserk && (
            <button type="button" className={`chip${sel.berserk ? ` on ${color}` : ''}`} aria-pressed={sel.berserk}
              onClick={() => patch(side, {berserk: !sel.berserk})}>
              {sel.berserk ? `${berserk.mod ? t('skill.berserkMod', {mod: `+${berserk.mod}`}) : t('skill.berserk')} ✓` : `+ ${t('skill.berserk')}`}
            </button>
          )}
          {surprise !== 0 && (
            <button type="button" className={`chip${sel.surpriseAttack ? ` on ${color}` : ''}`} aria-pressed={sel.surpriseAttack}
              onClick={() => patch(side, {surpriseAttack: !sel.surpriseAttack})}>
              {sel.surpriseAttack ? `${t('chip.surpriseAttackMod', {mod: surprise})} ✓` : `+ ${t('roll.surpriseAttack')}`}
            </button>
          )}
        </div>
      )}
      {resolved?.unsupportedUpgradeWeapons?.length > 0 && (
        <span className="note">{t('side.notRolled', {weapons: resolved.unsupportedUpgradeWeapons.join(', ')})}</span>
      )}
    </section>
  );
}

SideCard.propTypes = {
  side: PropTypes.oneOf(['A', 'B']).isRequired, view: PropTypes.object.isRequired, onOpenPicker: PropTypes.func.isRequired,
  onUpgrade: PropTypes.func.isRequired,
};
