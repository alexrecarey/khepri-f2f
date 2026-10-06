// The matchup calculator: two side cards with the range selector between
// them, the results card pinned below. All state is useMatchup's; this file
// only lays it out and turns taps into selections.
import {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {SKILL} from '../army/ids.js';
import {hasSkill} from '../army/traits.js';
import {defaultWeapon} from '../rules/defaultWeapon.js';
import {FIRETEAM_MAX, FIRETEAM_MIN, fireteamBonuses, surpriseAttackMod} from '../rules/modifiers.js';
import {RANGE_BANDS, rangeModFor} from '../rules/ranges.js';
import {buildLedger} from '../rules/ledger.js';
import {pseudoWeapons, resolveSelection, trooperWeapons} from '../rules/trooper.js';
import {EMPTY_SELECTION} from '../matchup/useMatchup.js';
import {rootFaction} from '../search/buildIndex.js';
import TrooperPicker from './picker/TrooperPicker.jsx';
import {useRecents, useSearcher} from './picker/useTrooperSearch.js';
import {extraLoadoutName} from './names.js';
import ResultsCard from './ResultsCard.jsx';

const ROLE = {A: 'active', B: 'reactive'};
const vanillaOf = (army, factionId) => (factionId == null || !army ? null : rootFaction(army.factions, factionId));

// A search hit -> a full selection. The weapon the query matched ("fus ml")
// is preselected, else the default weapon for the side.
function selectionFromHit(army, hit, side, keep) {
  const sel = {
    ...EMPTY_SELECTION,
    unitId: hit.unitId,
    factionId: hit.armyFactionId,
    groupId: hit.groupId,
    profileId: hit.profileId,
    optionId: hit.optionId,
    inCover: keep.inCover,
  };
  const resolved = resolveSelection(army, sel);
  if (!resolved?.option) return sel;
  const weapons = trooperWeapons(resolved.option, army.weapons, resolved.traits);
  const matched = hit.weaponId != null ? weapons.find((w) => w.id === hit.weaponId) : null;
  const weapon = matched ?? defaultWeapon(weapons, ROLE[side]);
  return {...sel, weaponKey: weapon?.key ?? 'dodge'};
}

// Weapon button text: the name and fire mode, "Missile Launcher (Blast)". The
// full stat line (B, PS, ammo) belongs to the results, not to a button.
const weaponText = (w) => `${w.name}${w.mode ? ` (${w.mode.replace(/ Mode$/i, '')})` : ''}`;

function FireteamChip({size, onChange, color}) {
  const [editing, setEditing] = useState(false);
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

FireteamChip.propTypes = {size: PropTypes.number.isRequired, onChange: PropTypes.func.isRequired, color: PropTypes.string.isRequired};

function SideCard({side, matchup, onOpenPicker}) {
  const color = ROLE[side];
  const {sel, setSel, resolved} = matchup[side];
  const {army} = matchup;
  const unit = resolved?.unit;
  const option = resolved?.option;
  const profile = resolved?.profile;
  const weapons = useMemo(
    () => (option ? trooperWeapons(option, army.weapons, resolved.traits) : []),
    [option, army, resolved],
  );
  const pseudo = useMemo(
    () => (profile ? pseudoWeapons(profile, resolved.traits, side, fireteamBonuses(sel.ftSize).dodge) : []),
    [profile, resolved, side, sel.ftSize],
  );
  // A loadout with no weapon chosen gets the default one: after a swap moves a
  // reactive "No ARO" to the active side, or from a share link without one.
  useEffect(() => {
    if (option && !sel.weaponKey && weapons.length > 0) {
      setSel({...sel, weaponKey: defaultWeapon(weapons, ROLE[side]).key});
    }
  }, [option, sel, weapons, side, setSel]);
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
              aria-pressed={sel.weaponKey === w.key} onClick={() => setSel({...sel, weaponKey: w.key})}>
              {w.pseudo ? w.label.replace(/ \(unopposed\)$/, '') : weaponText(w)}
            </button>
          ))}
        </div>
      )}
      {unit && (
        <div className="row-wrap">
          {!noCover && (
            <button type="button" className={`chip${sel.inCover ? ` on ${color}` : ''}`} aria-pressed={sel.inCover}
              onClick={() => setSel({...sel, inCover: !sel.inCover})}>
              {sel.inCover ? 'Cover ✓' : '+ Cover'}
            </button>
          )}
          <FireteamChip size={matchup.ftSize[side]} color={color} onChange={(n) => matchup.setFtSize(side, n)} />
          {surprise !== 0 && (
            <button type="button" className={`chip${sel.surpriseAttack ? ` on ${color}` : ''}`} aria-pressed={sel.surpriseAttack}
              onClick={() => setSel({...sel, surpriseAttack: !sel.surpriseAttack})}>
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

SideCard.propTypes = {side: PropTypes.oneOf(['A', 'B']).isRequired, matchup: PropTypes.object.isRequired, onOpenPicker: PropTypes.func.isRequired};

// Infinity's range-band colours for a Range MOD; null = out of range.
const bandColor = (mod) => {
  if (mod === undefined) return 'transparent'; // no weapon picked
  if (mod === null) return 'var(--band-out)';
  if (mod > 0) return 'var(--band-plus)';
  if (mod === 0) return 'var(--band-zero)';
  return mod <= -6 ? 'var(--band-minus6)' : 'var(--band-minus3)';
};
const signed = (n) => (n == null ? '—' : `${n > 0 ? '+' : ''}${n}`);

// The shared distance: a slim strip of inches; tapped, it opens into the
// ruler with each weapon's Range MOD as a continuous stripe (active above,
// reactive below). Lines of fire are reciprocal, so both sides share it.
function RangeSelector({matchup}) {
  const [open, setOpen] = useState(false);
  const {rangeCm, setRangeCm} = matchup;
  const selected = Math.max(0, RANGE_BANDS.findIndex((b) => b.to === rangeCm));
  const rowA = matchup.A.resolved?.weapon?.row;
  const rowB = matchup.B.resolved?.weapon?.row;
  const modA = (to) => (rowA ? rangeModFor(rowA, to, matchup.A.resolved.traits) : undefined);
  const modB = (to) => (rowB ? rangeModFor(rowB, to, matchup.B.resolved.traits) : undefined);
  const band = RANGE_BANDS[selected];
  const from = selected ? RANGE_BANDS[selected - 1].inches : 0;
  const swap = (
    <button type="button" className="icon-btn swap" aria-label="Swap active and reactive" onClick={matchup.swapSides}>⇅</button>
  );

  return (
    <div className="range">
      <div className="collapse" style={{maxHeight: open ? 0 : 60, opacity: open ? 0 : 1}} aria-hidden={open}>
        <div className="range-slim">
          <button type="button" className="range-strip" aria-label={`Range ${band.label}, change`} onClick={() => setOpen(true)} tabIndex={open ? -1 : 0}>
            {RANGE_BANDS.map((b, i) => (
              <span key={b.to} className={i === selected ? 'on' : ''}>{i === selected ? `${b.inches}"` : b.inches}</span>
            ))}
          </button>
          {swap}
        </div>
      </div>
      <div className="collapse" style={{maxHeight: open ? 320 : 0, opacity: open ? 1 : 0}} aria-hidden={!open}>
        <div className="range-open">
          <div className="range-head">
            <span className="label">Range</span>
            <span style={{flexGrow: 1}} />
            {swap}
            <button type="button" className="icon-btn" style={{width: 'auto', height: 32, fontSize: 15, fontWeight: 600, color: 'var(--text)'}}
              onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>{from}–{band.inches}" ⌃</button>
          </div>
          <div className="bands">
            {RANGE_BANDS.map((b, i) => (
              <button type="button" key={b.to} className={`band${i === selected ? ' on' : ''}`} tabIndex={open ? 0 : -1}
                aria-label={`${b.label}: active ${signed(modA(b.to))}, reactive ${signed(modB(b.to))}`}
                onClick={() => { setRangeCm(b.to); setOpen(false); }}>
                <span className="stripe" style={{background: bandColor(modA(b.to))}} />
                <span className="dist">{b.inches}</span>
                <span className="stripe" style={{background: bandColor(modB(b.to))}} />
              </button>
            ))}
          </div>
          <div className="split" style={{padding: '0 4px'}}>
            <span>Top: active weapon · bottom: reactive</span>
            <span>{rowA ? signed(modA(band.to)) : '—'} · {rowB ? signed(modB(band.to)) : '—'}</span>
          </div>
          <div className="legend">
            <span><i style={{background: 'var(--band-plus)'}} />+3</span>
            <span><i style={{background: 'var(--band-zero)'}} />0</span>
            <span><i style={{background: 'var(--band-minus3)'}} />−3</span>
            <span><i style={{background: 'var(--band-minus6)'}} />−6</span>
            <span><i style={{background: 'var(--band-out)'}} />out of range</span>
          </div>
        </div>
      </div>
    </div>
  );
}

RangeSelector.propTypes = {matchup: PropTypes.object.isRequired};

export default function MatchupScreen({matchup, engine, params}) {
  const searcher = useSearcher(true);
  const {recents, remember} = useRecents();
  const [picking, setPicking] = useState(null); // 'A' | 'B' | null
  // A pick made before army.json arrives waits here and applies once it does.
  const [pending, setPending] = useState(null);

  const apply = (side, hit) => {
    const s = matchup[side];
    s.setSel(selectionFromHit(matchup.army, hit, side, s.sel));
  };
  useEffect(() => {
    if (pending && matchup.army) {
      apply(pending.side, pending.hit);
      setPending(null);
    }
  }, [pending, matchup.army]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPick = (hit) => {
    remember(hit);
    if (matchup.army) apply(picking, hit); else setPending({side: picking, hit});
    setPicking(null);
  };

  // The picker opens scoped to that side's current faction, else the other
  // side's, else the faction of the last trooper picked.
  const scopeFor = (side) => {
    const own = vanillaOf(matchup.army, matchup[side].resolved?.factionId);
    const other = vanillaOf(matchup.army, matchup[side === 'A' ? 'B' : 'A'].resolved?.factionId);
    const last = vanillaOf(matchup.army, recents[0]?.armyFactionId);
    return own ?? other ?? last ?? null;
  };

  // "How the dice were built", from the same inputs the engine got.
  const ledger = useMemo(() => {
    if (!matchup.complete || !matchup.derived) return null;
    const inputs = {...params, ...matchup.derived.inputs};
    const name = (x) => x.unit.isc.split(',')[0].trim();
    return {
      ledger: buildLedger({active: matchup.A.resolved, reactive: matchup.B.resolved, rangeCm: matchup.rangeCm, inputs}),
      names: {A: name(matchup.A.resolved), B: name(matchup.B.resolved)},
      notes: [...matchup.derived.warnings, ...matchup.derived.notes],
    };
  }, [matchup.complete, matchup.derived, matchup.A.resolved, matchup.B.resolved, matchup.rangeCm, params]);

  return (
    <>
      <main className="screen">
        {matchup.loadError && <div className="note">Could not load the army data: {String(matchup.loadError)}</div>}
        <SideCard side="A" matchup={matchup} onOpenPicker={() => setPicking('A')} />
        <RangeSelector matchup={matchup} />
        <SideCard side="B" matchup={matchup} onOpenPicker={() => setPicking('B')} />
        {matchup.hasSelection && (
          <button type="button" className="chip" style={{alignSelf: 'center'}} onClick={matchup.reset}>Clear both troopers</button>
        )}
      </main>
      <ResultsCard
        result={matchup.complete ? engine.result : null}
        status={matchup.complete ? engine.status : 'Choose both troopers to see the odds'}
        diceLine={ledger ? {active: ledger.ledger.A?.dice, reactive: ledger.ledger.B?.dice} : null}
        ledger={ledger}
      />
      {picking && (
        <TrooperPicker
          side={picking}
          searcher={searcher}
          initialScope={scopeFor(picking)}
          recents={recents}
          onPick={onPick}
          onClose={() => setPicking(null)}
        />
      )}
    </>
  );
}

MatchupScreen.propTypes = {
  matchup: PropTypes.object.isRequired,
  engine: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
};
