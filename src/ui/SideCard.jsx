// One side of the matchup: the picked trooper's card (weapon buttons and the
// situation chips), or the empty slot that asks for one.
import {FIRETEAM_MIN, HACKED_RESET_MODS} from '../rules/modifiers.js';
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
/** @typedef {import('../types.js').Side} Side */
/** @typedef {import('../types.js').ProfileHit} ProfileHit */

/**
 * "ACTIVE" / "REACTIVE" over a card, in t's language.
 * @param {import('../types.js').Translator} t
 * @param {Side} side
 */
export const sideLabel = (t, side) => t(`side.${ROLE[side]}`).toLocaleUpperCase(t.lang);

/**
 * @param {Side} side
 * @param {Partial<import('../types.js').Selection>} p
 */
const patch = (side, p) => dispatch({type: 'patchSide', side, patch: p});

// A side with no trooper yet: a tall slot with the site mark, one call to
// action and the latest recent picks as one-tap chips. A slow plasma tint
// behind it draws the eye to what is still missing. Tapping anywhere on the
// card opens the search (the button covers the card, slots.css).
/** @param {{side: Side, recents: ProfileHit[], onOpenPicker: () => void, onPick: (hit: ProfileHit) => void, hint?: boolean}} props */
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

/** @param {{side: Side, view: import('../types.js').MatchupView, onOpenPicker: () => void, onUpgrade: (pick: {upgrade?: number | null, ball?: number | null}) => void}} props */
export default function SideCard({side, view, onOpenPicker, onUpgrade}) {
  const t = useT();
  const color = ROLE[side];
  // A side card is drawn for a picked trooper (MatchupScreen).
  const {sel, resolved, groups, cc, ccAllies, ccAlliesMax, noCover, coverOn, hacked, firewallRequired, fireteamChip, targetedChip, hackedChip, immAChip, surprise,
    berserk, teamOps, faction, crest, short, loadout} = /** @type {import('../types.js').SideView & {resolved: import('../types.js').ResolvedSide}} */ (view[side]);
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
          {/* Cover first, whenever it is there (Alex, 2026-10-22). Hacked:
              Firewall (-3 / -6) in its place, as cover does nothing
              against a Comms Attack. Starts on the trooper's own, which
              can't be switched off. */}
          {hacked && (
            <PickChip side={side} chip="firewall" label={t('chip.firewall')} options={FIREWALL_CHIPS.map(String)}
              value={FIREWALL_CHIPS.includes(resolved.firewall) ? FIREWALL_CHIPS.indexOf(resolved.firewall) : null} color={color}
              required={firewallRequired} onPick={(i) => patch(side, {firewall: i == null ? 0 : FIREWALL_CHIPS[i]})} />
          )}
          {/* Cover or, for Sapper, the Foxhole (its own cover): one or the other. */}
          {!hacked && !noCover && (
            <ToggleChip on={coverOn} label={t('chip.cover')} color={color} onToggle={() => dispatch({type: 'setCover', side, on: !coverOn})} />
          )}
          {!hacked && resolved.canSapper && (
            <ToggleChip on={resolved.sapper} label={t('chip.sapper')} color={color} onToggle={() => dispatch({type: 'setSapper', side, on: !resolved.sapper})} />
          )}
          {/* States that matter to this pick: Targeted against a shot or
              program or on a Reset, Hacked (-3 to -12) on a Reset, IMM-A on
              a Dodge. */}
          {targetedChip && <ToggleChip on={sel.targeted} label={t('chip.targeted')} color={color} onToggle={() => patch(side, {targeted: !sel.targeted})} />}
          {hackedChip && (
            <PickChip side={side} chip="hackedReset" label={t('chip.hacked')} options={HACKED_RESET_MODS.map(String)}
              value={HACKED_RESET_MODS.includes(sel.hackedReset) ? HACKED_RESET_MODS.indexOf(sel.hackedReset) : null} color={color}
              onPick={(i) => patch(side, {hackedReset: i == null ? 0 : HACKED_RESET_MODS[i]})} />
          )}
          {immAChip && <ToggleChip on={sel.immA} label={t('chip.immA')} color={color} onToggle={() => patch(side, {immA: !sel.immA})} />}
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
          {/* Fireteams only, while the pick gets a bonus: the size of the team, 1 = none. */}
          {fireteamChip && (
            <CountChip side={side} chip="ftSize" label={t('chip.fireteam')} value={resolved.ftSize} min={FIRETEAM_MIN} max={resolved.ftMax} none={1}
              color={color} />
          )}
          {/* CC Attack: allies in contact with the target, +1 B each. */}
          {cc && (
            <CountChip side={side} chip="ccAllies" label={t('chip.allies')} value={ccAllies} min={1} max={ccAlliesMax}
              none={0} color={color} />
          )}
          {berserk && (
            <ToggleChip on={sel.berserk} label={t('skill.berserk')} color={color} onToggle={() => patch(side, {berserk: !sel.berserk})}
              onLabel={berserk.mod ? t('skill.berserkMod', {mod: `+${berserk.mod}`}) : t('skill.berserk')} />
          )}
          {surprise !== 0 && (
            <ToggleChip on={sel.surpriseAttack} label={t('roll.surpriseAttack')} onLabel={t('chip.surpriseAttackMod', {mod: surprise})} color={color}
              onToggle={() => patch(side, {surpriseAttack: !sel.surpriseAttack})} />
          )}
        </div>
      )}
      {/** @type {number} */ (resolved?.unsupportedUpgradeWeapons?.length) > 0 && (
        <span className="note">{t('side.notRolled', {weapons: resolved.unsupportedUpgradeWeapons.join(', ')})}</span>
      )}
    </section>
  );
}
