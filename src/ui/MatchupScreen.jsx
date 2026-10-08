// The matchup calculator: two side cards with the range selector between
// them, the results card pinned below. Everything comes from the state
// document (src/state) and its derived matchup view; this file only lays it
// out and turns taps into actions.
import PropTypes from 'prop-types';
import {SKILL} from '../army/ids.js';
import {hasSkill} from '../army/traits.js';
import {FIRETEAM_MAX, FIRETEAM_MIN, surpriseAttackMod} from '../rules/modifiers.js';
import {RANGE_BANDS, rangeModFor} from '../rules/ranges.js';
import {isTemplate} from '../army/weapons.js';
import {openPicker, pickTrooper} from '../state/actions.js';
import {ROLE, vanillaOf} from '../state/matchupView.js';
import {dispatch, getState, useAppState} from '../state/store.js';
import TrooperPicker from './picker/TrooperPicker.jsx';
import {useSearcher} from './picker/useTrooperSearch.js';
import {extraLoadoutName} from './names.js';
import ResultsCard from './ResultsCard.jsx';

// Weapon button text: the name and fire mode, "Missile Launcher (Blast)". The
// full stat line (B, PS, ammo) belongs to the results, not to a button.
const weaponText = (w) => `${w.name}${w.mode ? ` (${w.mode.replace(/ Mode$/i, '')})` : ''}`;

const patch = (side, p) => dispatch({type: 'patchSide', side, patch: p});

function FireteamChip({side, size, color}) {
  const editing = useAppState((st) => st.ui.edit?.side === side && st.ui.edit.chip === 'fireteam');
  const setEditing = (on) => dispatch({type: 'setEdit', edit: on ? {side, chip: 'fireteam'} : null});
  const onChange = (n) => patch(side, {ftSize: n});
  const inTeam = size >= FIRETEAM_MIN;
  if (editing) {
    const sizes = [];
    for (let n = FIRETEAM_MIN; n <= FIRETEAM_MAX; n++) sizes.push(n);
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

FireteamChip.propTypes = {side: PropTypes.oneOf(['A', 'B']).isRequired, size: PropTypes.number.isRequired, color: PropTypes.string.isRequired};

function SideCard({side, army, view, onOpenPicker}) {
  const color = ROLE[side];
  const {sel, resolved, weapons, pseudo} = view[side];
  const unit = resolved?.unit;
  const option = resolved?.option;
  const noCover = hasSkill(resolved?.traits, SKILL.NO_COVER);
  const surprise = side === 'A' ? surpriseAttackMod(resolved?.traits) : 0;
  const faction = army?.factions[vanillaOf(army, resolved?.factionId)]?.name;
  const short = unit ? unit.isc.split(',')[0].trim() : null;
  const loadout = unit ? extraLoadoutName(option?.name, unit.isc) : null;

  return (
    <section className="card" aria-label={`${color} trooper`}>
      <button type="button" className="unit-btn" onClick={onOpenPicker}>
        <span className={`role ${color}`}>{side === 'A' ? 'ACTIVE' : 'REACTIVE'}</span>
        {unit
          ? <span className="unit-name">{short}{loadout ? ` · ${loadout}` : ''} <span className="faction">{faction} ›</span></span>
          : <span className="unit-empty">Choose a trooper ›</span>}
      </button>
      {option && (
        <div className="row-wrap" role="group" aria-label="Weapon">
          {[...weapons, ...pseudo].map((w) => (
            <button type="button" key={w.key} className={`btn${sel.weaponKey === w.key ? ` on ${color}` : ''}`}
              aria-pressed={sel.weaponKey === w.key} onClick={() => patch(side, {weaponKey: w.key})}>
              {w.pseudo ? w.label.replace(/ \(unopposed\)$/, '') : weaponText(w)}
            </button>
          ))}
        </div>
      )}
      {unit && (
        <div className="row-wrap">
          {!noCover && (
            <button type="button" className={`chip${sel.inCover ? ` on ${color}` : ''}`} aria-pressed={sel.inCover}
              onClick={() => patch(side, {inCover: !sel.inCover})}>
              {sel.inCover ? 'Cover ✓' : '+ Cover'}
            </button>
          )}
          <FireteamChip side={side} size={sel.ftSize} color={color} />
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
  side: PropTypes.oneOf(['A', 'B']).isRequired, army: PropTypes.object, view: PropTypes.object.isRequired,
  onOpenPicker: PropTypes.func.isRequired,
};

// Infinity's range-band colours for a Range MOD. Nothing (the card shows
// through) when there is no band to colour: no weapon yet, a Dodge, a Direct
// Template (no range bands) or out of range.
const bandColor = (mod) => {
  if (mod == null) return 'transparent';
  if (mod > 0) return 'var(--band-plus)';
  if (mod === 0) return 'var(--band-zero)';
  return mod <= -6 ? 'var(--band-minus6)' : 'var(--band-minus3)';
};
const signed = (n) => (n == null ? '—' : `${n > 0 ? '+' : ''}${n}`);

// A side's Range MOD at a band, or undefined when it has no range bands
// (nothing picked, Dodge, No ARO, Direct Template).
function bandMod(side, to) {
  const row = side.resolved?.weapon?.row;
  if (!row || isTemplate(row)) return undefined;
  return rangeModFor(row, to, side.resolved.traits);
}

// "Missile Launcher (Hit)", "Dodge": what the footer's Range MOD belongs to.
const weaponName = (side) => {
  const w = side.resolved?.weapon;
  if (!w) return '—';
  if (w.pseudo) return w.pseudo === 'dodge' ? 'Dodge' : 'No ARO';
  return weaponText(w);
};

// The shared distance. Closed: one slim row of bands. Tapping a band picks it
// straight away and opens the selector, which adds a header above and a
// legend below and lights up each weapon's Range MOD as a stripe (active above,
// reactive below). The row of bands itself never moves or resizes, open or
// closed. Lines of fire are reciprocal, so both sides share the distance.
function RangeSelector({view}) {
  const open = useAppState((st) => st.ui.rangeOpen);
  const rangeCm = useAppState((st) => st.matchup.rangeCm);
  const setOpen = (o) => dispatch({type: 'setRangeOpen', open: o});
  const selected = Math.max(0, RANGE_BANDS.findIndex((b) => b.to === rangeCm));
  const band = RANGE_BANDS[selected];
  const from = selected ? RANGE_BANDS[selected - 1].inches : 0;
  const modA = (to) => bandMod(view.A, to);
  const modB = (to) => bandMod(view.B, to);
  const hasA = modA(band.to) !== undefined;
  const hasB = modB(band.to) !== undefined;

  // Open, a tap anywhere outside the selector closes it (the scrim).
  return (
    <>
    {open && <button type="button" className="range-scrim" aria-label="Close range" onClick={() => setOpen(false)} />}
    <div className={`range${open ? ' open' : ''}`}>
      <div className="collapse" style={{maxHeight: open ? 48 : 0, opacity: open ? 1 : 0}} aria-hidden={!open}>
        <div className="range-head">
          <span className="label">Range</span>
          <button type="button" className="range-close" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            {from}–{band.inches}" ⌃
          </button>
        </div>
      </div>
      <div className="range-row">
        <div className="bands" role="group" aria-label="Range">
          {RANGE_BANDS.map((b, i) => (
            <button type="button" key={b.to} className={`band${i === selected ? ' on' : ''}`} aria-pressed={i === selected}
              aria-label={`${b.label}: active ${signed(modA(b.to))}, reactive ${signed(modB(b.to))}`}
              onClick={() => dispatch({type: 'setRange', rangeCm: b.to, open: true})}>
              <span className="stripe" style={{background: open ? bandColor(modA(b.to)) : 'transparent'}} />
              <span className="dist">{i === selected ? `${b.inches}"` : b.inches}</span>
              <span className="stripe" style={{background: open ? bandColor(modB(b.to)) : 'transparent'}} />
            </button>
          ))}
        </div>
        <button type="button" className="icon-btn swap" aria-label="Swap active and reactive" onClick={() => dispatch({type: 'swapSides'})}>⇅</button>
      </div>
      <div className="collapse" style={{maxHeight: open ? 64 : 0, opacity: open ? 1 : 0}} aria-hidden={!open}>
        <div className="range-foot">
          <div className="mods">
            <span className="c-active">{weaponName(view.A)} <b>{hasA ? signed(modA(band.to)) : '—'}</b></span>
            <span className="c-reactive">{weaponName(view.B)} <b>{hasB ? signed(modB(band.to)) : '—'}</b></span>
          </div>
          <div className="key">
            <span><i style={{background: 'var(--band-plus)'}} />+3</span>
            <span><i style={{background: 'var(--band-zero)'}} />0</span>
            <span><i style={{background: 'var(--band-minus3)'}} />−3</span>
            <span><i style={{background: 'var(--band-minus6)'}} />−6</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

RangeSelector.propTypes = {view: PropTypes.object.isRequired};

export default function MatchupScreen({army, armyError, view, engine}) {
  const picking = useAppState((st) => (st.ui.overlay === 'picker' ? st.ui.picker.side : null));
  const searcher = useSearcher(true);

  return (
    <>
      <main className="screen">
        {armyError && <div className="note">Could not load the army data: {String(armyError)}</div>}
        <SideCard side="A" army={army} view={view} onOpenPicker={() => dispatch(openPicker(army, getState(), 'A'))} />
        <RangeSelector view={view} />
        <SideCard side="B" army={army} view={view} onOpenPicker={() => dispatch(openPicker(army, getState(), 'B'))} />
        {view.hasSelection && (
          <button type="button" className="chip" style={{alignSelf: 'center'}} onClick={() => dispatch({type: 'clearSides'})}>Clear both troopers</button>
        )}
      </main>
      <ResultsCard
        result={view.complete ? engine.result : null}
        status={view.complete ? engine.status : 'Choose both troopers to see the odds'}
        diceLine={view.ledger ? {active: view.ledger.ledger.A?.dice, reactive: view.ledger.ledger.B?.dice} : null}
        ledger={view.ledger}
      />
      {picking && <TrooperPicker side={picking} searcher={searcher} onPick={(hit) => dispatch(pickTrooper(army, picking, hit))} />}
    </>
  );
}

MatchupScreen.propTypes = {
  army: PropTypes.object,
  armyError: PropTypes.any,
  view: PropTypes.object.isRequired,
  engine: PropTypes.object.isRequired,
};
