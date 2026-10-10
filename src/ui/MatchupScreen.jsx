// The matchup calculator: two side cards with the range selector between
// them, the results card pinned below. Everything comes from the state
// document (src/state) and its derived matchup view; this file only lays it
// out and turns taps into actions.
import {useEffect, useMemo} from 'react';
import PropTypes from 'prop-types';
import {FIRETEAM_MIN} from '../rules/modifiers.js';
import {RANGE_BANDS} from '../rules/ranges.js';
import {openPicker, pickTrooper} from '../state/actions.js';
import {ROLE, recentsFor} from '../state/schema.js';
import {dispatch, getState, useAppState} from '../state/store.js';
import TrooperPicker from './picker/TrooperPicker.jsx';
import DeskPicker from './picker/DeskPicker.jsx';
import {useSearcher} from './picker/useTrooperSearch.js';
import LoadFailed from './LoadFailed.jsx';
import {shortWeaponName} from '../army/names.js';
import ResultsCard, {ResultsPanel} from './ResultsCard.jsx';
import {SiteMark} from './icons.jsx';
import Plasma from './Plasma.jsx';
import Ledger from './Ledger.jsx';
import useLayout from './useLayout.js';
import {matchupRollSummary} from '../state/rolls.js';
import {summarize} from './results.js';
import useSaveRoll from './useSaveRoll.js';

// Weapon button text: the short name and fire mode, "Missile L. (Blast)". The
// full stat line (B, PS, ammo) belongs to the results, not to a button.
const modeText = (w) => (w.mode ? ` (${w.mode.replace(/ Mode$/i, '')})` : '');
const weaponText = (w) => `${shortWeaponName(w.name)}${modeText(w)}`;
const weaponTitle = (w) => `${w.name}${modeText(w)}`;
const patch = (side, p) => dispatch({type: 'patchSide', side, patch: p});

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Swap: each trooper's card content moves to the other card, so slide each
// card in from where its trooper was (FLIP), along a slight arc.
function flipSwap(run) {
  const card = (s) => document.querySelector(`.card[data-side="${s}"]`);
  const A = card('A');
  const B = card('B');
  if (!A || !B || reducedMotion() || !A.animate) { run(); return; }
  const from = {A: B.getBoundingClientRect(), B: A.getBoundingClientRect()};
  run();
  requestAnimationFrame(() => {
    for (const [el, f] of [[A, from.A], [B, from.B]]) {
      const to = el.getBoundingClientRect();
      const dx = f.left - to.left;
      const dy = f.top - to.top;
      el.animate([
        {transform: `translate(${dx}px, ${dy}px)`},
        {transform: `translate(${dx / 2 + (dx ? 0 : 16)}px, ${dy / 2}px) scale(.96)`},
        {transform: 'none'},
      ], {duration: 340, easing: 'cubic-bezier(.5,0,.3,1)'});
    }
  });
}

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
function EmptySlot({side, recents, onOpenPicker, onPick, hint}) {
  const color = ROLE[side];
  return (
    <section className={`card slot ${color}`} data-side={side} aria-label={`${color} trooper`}>
      <Plasma cssVar={`--${color}`} seed={side === 'A' ? 0 : 40} />
      <button type="button" className="slot-open" onClick={onOpenPicker}>
        <span className="slot-die"><SiteMark fill={`var(--${color})`} /></span>
        <span className={`role ${color}`}>{side === 'A' ? 'ACTIVE' : 'REACTIVE'}</span>
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

function SideCard({side, view, onOpenPicker}) {
  const color = ROLE[side];
  const {sel, resolved, groups, noCover, surprise, faction, short, loadout} = view[side];
  const unit = resolved?.unit;
  const option = resolved?.option;

  return (
    <section className="card" data-side={side} aria-label={`${color} trooper`}>
      <button type="button" className="unit-btn" onClick={onOpenPicker}>
        <span className={`role ${color}`}>{side === 'A' ? 'ACTIVE' : 'REACTIVE'}</span>
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
  // Range MODs per band (matchupView bands): undefined = no range bands.
  const mods = view.bands[selected];
  const hasA = mods.A !== undefined;
  const hasB = mods.B !== undefined;

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
          {/* The selected band's highlight glides to the tapped band. */}
          <span className="band-pill" aria-hidden="true" style={{left: `calc(${selected} * 100% / ${RANGE_BANDS.length})`, width: `calc(100% / ${RANGE_BANDS.length})`}} />
          {RANGE_BANDS.map((b, i) => (
            <button type="button" key={b.to} className={`band${i === selected ? ' on' : ''}`} aria-pressed={i === selected}
              aria-label={`${b.label}: active ${signed(view.bands[i].A)}, reactive ${signed(view.bands[i].B)}`}
              onClick={() => dispatch({type: 'setRange', rangeCm: b.to, open: true})}>
              <span className="stripe" style={{background: open ? bandColor(view.bands[i].A) : 'transparent'}} />
              <span className="dist">{i === selected ? `${b.inches}"` : b.inches}</span>
              <span className="stripe" style={{background: open ? bandColor(view.bands[i].B) : 'transparent'}} />
            </button>
          ))}
        </div>
        <button type="button" className="icon-btn swap" aria-label="Swap active and reactive" onClick={() => flipSwap(() => dispatch({type: 'swapSides'}))}>⇅</button>
      </div>
      <div className="collapse" style={{maxHeight: open ? 64 : 0, opacity: open ? 1 : 0}} aria-hidden={!open}>
        <div className="range-foot">
          <div className="mods">
            <span className="c-active">{weaponName(view.A)} <b>{hasA ? signed(mods.A) : '—'}</b></span>
            <span className="c-reactive">{weaponName(view.B)} <b>{hasB ? signed(mods.B) : '—'}</b></span>
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

export default function MatchupScreen({army, armyError, retryArmy, view, engine}) {
  const picking = useAppState((st) => (st.ui.overlay === 'picker' ? st.ui.picker.side : null));
  const {searcher, error: searchError, retry: retrySearch} = useSearcher(true);
  const result = view.complete ? engine.result : null;
  const summary = useMemo(() => {
    const s = summarize(result);
    return s && view.complete ? matchupRollSummary(view, s) : null;
  }, [result, view]);
  const save = useSaveRoll(summary, engine.pending);

  const layout = useLayout();
  const resultProps = {
    result,
    save,
    pending: engine.pending,
    status: view.complete ? engine.status : 'Choose both troopers to see the odds',
    diceLine: view.ledger ? {active: view.ledger.ledger.A?.dice, reactive: view.ledger.ledger.B?.dice} : null,
    ledger: view.ledger,
    targets: view.targets,
  };
  const openSide = (side) => () => dispatch(openPicker(army, getState(), side));
  const picked = {A: view.A.resolved?.unit != null, B: view.B.resolved?.unit != null};
  resultProps.picked = picked;
  // Empty slots offer the side's last three picks; the same list as that
  // side's picker shows under Recent.
  const recentList = useAppState((st) => st.lists.recents);
  const recentHits = useMemo(() => {
    const hits = (side) => {
      if (!searcher) return [];
      const ids = recentsFor(recentList, side).map((r) => searcher.findRow(r)).filter((id) => id != null);
      return searcher.browse({factionId: null, recentIds: ids}).recent.slice(0, 3);
    };
    return {A: hits('A'), B: hits('B')};
  }, [searcher, recentList]);
  const wide = layout !== 'phone' && layout !== 'tablet';
  // Desktop: A and R open the pickers, unless typing somewhere or a picker is up.
  useEffect(() => {
    if (!wide) return undefined;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || picking) return;
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
      const side = {a: 'A', r: 'B'}[e.key.toLowerCase()];
      if (!side) return;
      e.preventDefault();
      dispatch(openPicker(army, getState(), side));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [wide, picking, army]);
  const sideBox = (side) => (picked[side]
    ? <SideCard side={side} view={view} onOpenPicker={openSide(side)} />
    : <EmptySlot side={side} recents={recentHits[side]} hint={wide} onOpenPicker={openSide(side)}
      onPick={(hit) => dispatch(pickTrooper(army, side, hit, {state: getState()}))} />);
  const cardA = sideBox('A');
  const cardB = sideBox('B');
  const range = <RangeSelector view={view} />;
  const clear = view.hasSelection && (
    <button type="button" className="chip" style={{alignSelf: 'center', justifySelf: 'center'}} onClick={() => dispatch({type: 'clearSides'})}>Clear both troopers</button>
  );
  const error = (armyError || searchError) && (
    <>
      {armyError && <LoadFailed what="the army data" onRetry={retryArmy} />}
      {searchError && <LoadFailed what="the trooper list" onRetry={retrySearch} />}
    </>
  );
  const mods = view.ledger && result && <Ledger {...view.ledger} />;
  // Phone and tablet: the full-screen picker; wider: the two-pane overlay.
  const deskPicker = layout === 'landscape' || layout === 'desktop' || layout === 'wide';
  const picker = picking && (deskPicker
    ? <DeskPicker searcher={searcher} army={army} loadError={searchError ? retrySearch : null} />
    : <TrooperPicker side={picking} searcher={searcher} army={army} loadError={searchError ? retrySearch : null}
      onPick={(hit) => dispatch(pickTrooper(army, picking, hit))} />);

  if (layout === 'phone') {
    return (
      <>
        <main className="screen">
          {error}{cardA}{range}{cardB}{clear}
        </main>
        <ResultsCard {...resultProps} />
        {picker}
      </>
    );
  }
  // Tablet and desktop: the same pieces in columns (useLayout.js).
  const setup = <div className="col setup">{error}{cardA}{range}{cardB}{clear}</div>;
  return (
    <>
      <main className={`workbench ${layout}`}>
        {layout === 'tablet' ? (
          <>
            {error}
            <div className="sides">{cardA}{cardB}</div>
            {range}
            {clear}
            <ResultsPanel {...resultProps} />
            {mods && <div className="mods-grid">{mods}</div>}
          </>
        ) : layout === 'landscape' ? (
          <>
            {setup}
            <div className="col"><ResultsPanel {...resultProps} />{mods && <div className="mods-grid">{mods}</div>}</div>
          </>
        ) : (
          <>
            {setup}
            <div className="col"><ResultsPanel {...resultProps} /></div>
            <div className={`col${layout === 'wide' ? ' mods-grid' : ''}`}>{mods ?? (!view.complete && (
              <div className="mods-wait"><span className="c-active">ACTIVE MODS</span><span className="c-reactive">REACTIVE MODS</span>
                <span className="small">Every modifier, with where it came from, once both sides are set.</span></div>
            ))}</div>
          </>
        )}
      </main>
      {picker}
    </>
  );
}

MatchupScreen.propTypes = {
  army: PropTypes.object,
  armyError: PropTypes.any,
  retryArmy: PropTypes.func,
  view: PropTypes.object.isRequired,
  engine: PropTypes.object.isRequired,
};
