// The trooper picker on wide screens (useLayout 'landscape' and up): one
// overlay over the dimmed workbench. Top: which side, the search box, faction
// chips with hit counts. Left: recents, a unit type's units, or the matches
// (this faction first, then other factions). Right: the highlighted unit with
// its stats and every loadout as a chart line, or, before typing, factions and
// unit types to browse. The keyboard drives it all from the search box:
// ↑↓ move, → into the loadouts, ← back, ↵ pick, Tab the other side, Esc close.
// Query, scope, highlight and side are the state document's ui.picker.
import {useEffect, useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import {TIER} from '../../search/search.js';
import {words} from '../../search/text.js';
import {pickTrooper, pickerSide} from '../../state/actions.js';
import {other} from '../../state/reduce.js';
import {dispatch, getState, useAppState} from '../../state/store.js';
import FactionLogo from '../factionLogo.jsx';
import {extraLoadoutName} from '../names.js';
import {loadoutCharts, loadoutTag, orderLoadouts, unitDetail} from './loadouts.js';
import {TYPE_NAMES} from './TrooperPicker.jsx';

const ROLE = {A: 'active', B: 'reactive'};
const back = () => dispatch({type: 'back'});
const setCursor = (cursor) => dispatch({type: 'pickerCursor', cursor});

const bandColor = (mod) => {
  if (mod == null) return 'transparent';
  if (mod > 0) return 'var(--band-plus)';
  if (mod === 0) return 'var(--band-zero)';
  return mod <= -6 ? 'var(--band-minus6)' : 'var(--band-minus3)';
};

// The typed letters, marked where a word of the name starts with them.
function Highlight({text, query}) {
  const tokens = words(query);
  if (!tokens.length) return text;
  return text.split(/(\s+)/).map((part, i) => {
    const folded = words(part)[0] ?? '';
    const t = tokens.find((tok) => folded.startsWith(tok));
    if (!t) return <span key={i}>{part}</span>;
    return <span key={i}><b className="hl">{part.slice(0, t.length)}</b>{part.slice(t.length)}</span>;
  });
}

Highlight.propTypes = {text: PropTypes.string.isRequired, query: PropTypes.string.isRequired};

const REASON = {[TIER.TYPO1]: 'close match', [TIER.SOUND]: 'sounds like', [TIER.TYPO2]: 'close match'};

// "BS12 ARM1 W1" for a unit's first profile.
function shortStats(detail) {
  const st = Object.fromEntries(detail?.profiles[0]?.stats ?? []);
  return detail ? `BS${st.BS} ARM${st.ARM} ${st.STR != null ? 'STR' : 'W'}${st.STR ?? st.W}` : '';
}

function Stripe({bands}) {
  return (
    <span className="stripe7" aria-hidden="true">{bands.map((m, i) => <i key={i} style={{background: bandColor(m)}} />)}</span>
  );
}

Stripe.propTypes = {bands: PropTypes.array.isRequired};

function ChartLine({c, sub}) {
  return (
    <div className={`chart-line${sub ? ' sub' : ''}`}>
      <span className="n">{c.name}</span>
      <Stripe bands={c.bands} />
      <span className="m">{c.burst != null ? `B${c.burst}` : ''}</span>
      <span className="m">{c.ps != null ? `PS${c.ps}` : ''}</span>
      <span className="a">{c.ammo}</span>
    </div>
  );
}

ChartLine.propTypes = {c: PropTypes.object.isRequired, sub: PropTypes.bool};

export default function DeskPicker({searcher, army}) {
  const picker = useAppState((s) => s.ui.picker);
  const recents = useAppState((s) => s.lists.recents);
  const sides = useAppState((s) => s.matchup);
  const {side, query, scope, stack} = picker;
  const cursor = picker.cursor ?? 0;
  const pane = picker.pane ?? 'list';
  const lcursor = picker.lcursor ?? 0;
  const color = ROLE[side];
  const top = stack.at(-1) ?? null;
  const typing = query.trim().length > 0;
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, [side]);

  const factionName = (id) => searcher?.factions.find((f) => f.id === id)?.name ?? 'All factions';
  const recentIds = useMemo(
    () => (searcher ? recents.map((r) => searcher.findRow(r)).filter((id) => id != null) : []),
    [searcher, recents],
  );

  // Every match in every faction, for the chip counts and "in other factions".
  const all = useMemo(() => (searcher && typing ? searcher.search({query, factionId: null, recentIds}) : null), [searcher, typing, query, recentIds]);
  const scoped = useMemo(() => (searcher && typing ? searcher.search({query, factionId: scope, recentIds}) : null), [searcher, typing, query, scope, recentIds]);
  const browse = useMemo(() => (searcher && !typing ? searcher.browse({factionId: scope, recentIds}) : null), [searcher, typing, scope, recentIds]);

  // The left list: rows the arrow keys move through, with headings between.
  const items = useMemo(() => {
    if (!searcher) return [];
    if (typing) {
      const head = scope != null ? [{kind: 'head', text: factionName(scope)}] : [];
      const mine = scoped.units.map((u) => ({kind: 'unit', u, factionId: scope ?? u.factionIds[0]}));
      const elsewhere = scope != null
        ? all.units.filter((u) => !u.factionIds.includes(scope)).map((u) => ({kind: 'unit', u, factionId: u.factionIds[0], away: true}))
        : [];
      return [...head, ...mine, ...(elsewhere.length ? [{kind: 'head', text: 'In other factions'}, ...elsewhere] : [])];
    }
    if (top?.view === 'type') {
      return [{kind: 'head', text: TYPE_NAMES[top.type] ?? top.type},
        ...searcher.unitsOfType(top.type, scope).map((u) => ({kind: 'unit', u, factionId: scope ?? u.factionIds[0]}))];
    }
    const recent = browse.recent.map((hit) => ({kind: 'recent', hit}));
    return recent.length ? [{kind: 'head', text: scope != null ? `Recent in ${factionName(scope)}` : 'Recent'}, ...recent] : [];
  }, [searcher, typing, scoped, all, browse, top, scope]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = items.filter((x) => x.kind !== 'head');
  const at = Math.min(cursor, Math.max(0, rows.length - 1));
  // Before typing, the right pane browses factions and unit types until a
  // recent is highlighted (cursor set by a click or an arrow key).
  const browsing = !typing && top?.view !== 'type';
  const current = browsing && picker.cursor == null ? null : rows[at] ?? null;

  // The unit in the right pane and its loadouts in scope.
  const unitId = current?.kind === 'unit' ? current.u.unitId : current?.kind === 'recent' ? current.hit.unitId : null;
  const factionId = current?.kind === 'unit' ? current.factionId : current?.kind === 'recent' ? current.hit.factionId : null;
  const loadouts = useMemo(() => (searcher && unitId != null ? orderLoadouts(army, searcher.unitRows(unitId, factionId)) : []), [searcher, army, unitId, factionId]);
  const detail = useMemo(() => (unitId != null ? unitDetail(army, unitId, loadouts[0]?.armyFactionId) : null), [army, unitId, loadouts]);
  const profile = detail?.profiles.find((p) => p.id === picker.profileId) ?? detail?.profiles[0] ?? null;
  const lat = Math.min(lcursor, Math.max(0, loadouts.length - 1));

  // The hit Enter picks: the highlighted loadout in the loadouts pane; on a
  // unit row, the loadout the query matched ("fus ml"), else its first.
  const withProfile = (hit) => (profile && detail.profiles.length > 1 ? {...hit, profileId: profile.id} : hit);
  const hitFor = () => {
    if (pane === 'loadouts' && loadouts[lat]) return withProfile(loadouts[lat]);
    if (current?.kind === 'recent') return current.hit;
    if (current?.kind === 'unit') {
      const matched = scoped?.profiles.find((h) => h.unitId === unitId) ?? all?.profiles.find((h) => h.unitId === unitId);
      return withProfile(matched ?? loadouts[0]);
    }
    return null;
  };
  const pick = (hit, next = false) => hit && dispatch(pickTrooper(army, side, hit, {next, state: getState()}));
  const otherSide = other(side);
  // With the other side still empty the default (Enter) moves on to it, so
  // two Enters fill both; once it is set, the default goes back to the
  // calculator and moving on is the secondary (Shift+Enter).
  const otherSet = sides[otherSide]?.unitId != null;
  const otherName = otherSide === 'A' ? 'active' : 'reactive';

  const onKey = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const d = e.key === 'ArrowDown' ? 1 : -1;
      if (pane === 'loadouts') setCursor({lcursor: Math.max(0, Math.min(loadouts.length - 1, lat + d))});
      else if (!current) setCursor({cursor: 0, lcursor: 0, profileId: null});
      else setCursor({cursor: Math.max(0, Math.min(rows.length - 1, at + d)), lcursor: 0, profileId: null});
    } else if (e.key === 'ArrowRight' && unitId != null && (pane === 'list') && e.currentTarget.selectionStart === query.length) {
      e.preventDefault();
      setCursor({pane: 'loadouts'});
    } else if (e.key === 'ArrowLeft' && pane === 'loadouts') {
      e.preventDefault();
      setCursor({pane: 'list'});
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(hitFor(), e.shiftKey ? otherSet : !otherSet);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      dispatch(pickerSide(army, getState(), otherSide));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      back();
    }
  };

  // Chips: All, then the factions, by hits while typing.
  const chips = useMemo(() => {
    const factions = searcher?.factions ?? [];
    if (!all) return factions.map((f) => ({id: f.id, name: f.name, count: null}));
    const counts = new Map();
    for (const u of all.units) for (const f of u.factionIds) counts.set(f, (counts.get(f) ?? 0) + 1);
    return factions.map((f) => ({id: f.id, name: f.name, count: counts.get(f.id) ?? 0}))
      .filter((f) => f.count > 0 || f.id === scope)
      .sort((a, b) => b.count - a.count);
  }, [searcher, all, scope]);

  const sideSel = sides[side];
  return (
    <>
      <div className="desk-scrim" onClick={back} />
      <div className="desk-picker" role="dialog" aria-modal="true" aria-label={`${color} trooper`}>
        <div className="dp-top">
          <span className="dp-sides" role="group" aria-label="Side">
            {['A', 'B'].map((s) => (
              <button type="button" key={s} className={`${s === side ? `on ${ROLE[s]}` : ''}`} aria-pressed={s === side}
                onClick={() => s !== side && dispatch(pickerSide(army, getState(), s))}>
                {s === 'A' ? 'ACTIVE' : 'REACTIVE'}
                {s !== side && sides[s]?.unitId != null && <span className={`dp-set c-${ROLE[s]}`}> · {army.units.find((u) => u.id === sides[s].unitId)?.isc.split(',')[0]} ✓</span>}
              </button>
            ))}
          </span>
          <label className={`dp-search ${color}`}>
            <span aria-hidden="true">⌕</span>
            <span className="vh">Search troopers</span>
            <input ref={inputRef} value={query} placeholder="Search troopers and weapons…" autoComplete="off" spellCheck={false}
              onChange={(e) => dispatch({type: 'pickerQuery', query: e.target.value})} onKeyDown={onKey}
              aria-activedescendant={current ? `dp-row-${at}` : undefined} aria-controls="dp-list" />
          </label>
          <span className="dp-keys"><kbd>Tab</kbd> side <kbd>esc</kbd></span>
        </div>
        <div className="dp-chips" role="group" aria-label="Faction">
          <button type="button" className={`chip${scope == null ? ' on-plain' : ''}`} onClick={() => dispatch({type: 'pickerScope', scope: null})}>
            All {all && <small>{all.units.length}</small>}
          </button>
          {chips.map((f) => (
            <button type="button" key={f.id} className={`chip${scope === f.id ? ' on-plain' : ''}`} onClick={() => dispatch({type: 'pickerScope', scope: f.id})}>
              {f.name} {f.count != null && <small>{f.count}</small>}
            </button>
          ))}
        </div>
        <div className="dp-body">
          <div className="dp-list" id="dp-list" role="listbox" aria-label="Troopers">
            {!searcher && <span className="empty">Loading units…</span>}
            {searcher && typing && rows.length === 0 && <span className="empty">Nothing matches “{query}”</span>}
            {(() => {
              let i = -1;
              return items.map((x, k) => {
                if (x.kind === 'head') return <span key={`h${k}`} className="dp-head">{x.text}</span>;
                i += 1;
                const idx = i;
                const on = current != null && idx === at;
                const select = () => setCursor({cursor: idx, pane: 'list', lcursor: 0, profileId: null});
                if (x.kind === 'recent') {
                  const d = unitDetail(army, x.hit.unitId, x.hit.armyFactionId);
                  return (
                    <div key={`r${x.hit.rowId}`} id={`dp-row-${idx}`} role="option" aria-selected={on} className={`dp-row${on ? ' on' : ''}`}
                      onClick={select} onDoubleClick={() => pick(x.hit)}>
                      <span className="t">{x.hit.unit} · {x.hit.weapon}</span><span className="s">{shortStats(d)}</span>
                      <span className="sub">{factionName(x.hit.factionId)}</span>
                    </div>
                  );
                }
                const d = unitDetail(army, x.u.unitId, null);
                const reason = REASON[x.u.tier];
                return (
                  <div key={`u${x.u.unitId}${x.away ? 'x' : ''}`} id={`dp-row-${idx}`} role="option" aria-selected={on}
                    className={`dp-row${on ? ' on' : ''}`} onClick={select} onDoubleClick={() => { select(); }}>
                    <span className="t"><Highlight text={x.u.short} query={query} />{x.away ? ` · ${factionName(x.factionId)}` : ''}</span>
                    <span className="s">{shortStats(d)}</span>
                    <span className="sub">{TYPE_NAMES[x.u.type] ?? x.u.type ?? ''}{reason && <span className="reason"> · {reason}</span>}</span>
                  </div>
                );
              });
            })()}
            {rows.length > 0 && <span className="dp-hint"><kbd>↑↓</kbd> move <kbd>→</kbd> into loadouts <kbd>↵</kbd> pick</span>}
          </div>
          <div className="dp-detail">
            {detail && profile ? (
              <>
                <div className="dp-unit">
                  <div>
                    <span className="dp-name">{detail.unit.isc.split(',')[0]}</span>
                    <div className="note">{factionName(factionId)} · {TYPE_NAMES[profile.type] ?? profile.type}</div>
                  </div>
                  {detail.profiles.length > 1 && (
                    <span className="dp-tabs" role="group" aria-label="Profile">
                      {detail.profiles.map((p) => (
                        <button type="button" key={p.id} className={p.id === profile.id ? 'on' : ''} aria-pressed={p.id === profile.id}
                          onClick={() => setCursor({profileId: p.id})}>{p.name}</button>
                      ))}
                    </span>
                  )}
                </div>
                <div className="dp-stats">
                  {profile.stats.map(([k, v]) => <span key={k}><small>{k}</small><b>{v}</b></span>)}
                </div>
                {profile.skills.length > 0 && <div className="dp-skills">{profile.skills.join(' · ')}</div>}
                <span className="dp-head" style={{padding: 0}}>Loadouts</span>
                <div className="dp-loadouts" role="listbox" aria-label="Loadouts">
                  {loadouts.map((h, i) => {
                    const charts = loadoutCharts(army, h.weaponIds);
                    const tag = extraLoadoutName(h.loadout, h.unit) ?? loadoutTag(army, h);
                    const on = pane === 'loadouts' ? i === lat : false;
                    const main = charts[0];
                    return (
                      <div key={h.rowId} role="option" aria-selected={on} className={`dp-loadout${on ? ` on ${color}` : ''}`}
                        onClick={() => setCursor({pane: 'loadouts', lcursor: i})} onDoubleClick={() => pick(withProfile(h))}>
                        {main ? <ChartLine c={{...main, name: `${main.name}${tag ? ` · ${tag}` : ''}`}} /> : <span>{h.weapons.join(', ')}</span>}
                        {on && charts.slice(1).map((c) => <ChartLine key={c.id} c={c} sub />)}
                        <span className="pts">{h.points} pts{h.swc ? ` · ${h.swc} SWC` : ''}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="dp-actions">
                  <span className="label">Set now</span>
                  <label className="dp-ft">
                    <span className="vh">Fireteam</span>
                    <select value={sideSel.ftSize} onChange={(e) => dispatch({type: 'patchSide', side, patch: {ftSize: Number(e.target.value)}})}>
                      <option value={1}>No fireteam</option>
                      {[2, 3, 4, 5].map((n) => <option key={n} value={n}>Fireteam {n}</option>)}
                    </select>
                  </label>
                  <button type="button" className={`chip${sideSel.inCover ? ` on ${color}` : ''}`} aria-pressed={sideSel.inCover}
                    onClick={() => dispatch({type: 'patchSide', side, patch: {inCover: !sideSel.inCover}})}>
                    {sideSel.inCover ? 'Cover ✓' : '+ Cover'}
                  </button>
                  <span style={{flexGrow: 1}} />
                  {otherSet ? (
                    <>
                      <button type="button" className="btn" onClick={() => pick(hitFor(), true)}>Use and change {otherName} <kbd>⇧↵</kbd></button>
                      <button type="button" className={`btn on ${color}`} onClick={() => pick(hitFor())}>Use <kbd>↵</kbd></button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="btn" onClick={() => pick(hitFor())}>Use <kbd>⇧↵</kbd></button>
                      <button type="button" className={`btn on ${color}`} onClick={() => pick(hitFor(), true)}>Use and choose {otherName} <kbd>↵</kbd></button>
                    </>
                  )}
                </div>
              </>
            ) : !browsing ? (
              <span className="empty">{rows.length ? 'Pick a unit on the left.' : ''}</span>
            ) : scope == null ? (
              <>
                <span className="dp-head" style={{padding: 0}}>Browse by faction</span>
                <div className="dp-tiles">
                  {(searcher?.factions ?? []).map((f) => (
                    <button type="button" key={f.id} className="tile faction" onClick={() => dispatch({type: 'pickerScope', scope: f.id})}>
                      <FactionLogo id={f.id} size={40} />
                      <span>{f.name}</span><span className="r">{searcher.unitCount(f.id)}</span>
                    </button>
                  ))}
                </div>
                <span className="note">Sectorials fold into their vanilla army; mercenary companies into Non-Aligned Armies.</span>
              </>
            ) : (
              <>
                <div className="dp-unit">
                  <span className="dp-name dp-faction"><FactionLogo id={scope} size={36} />{factionName(scope)} <span className="note">· all sectorials included</span></span>
                  <button type="button" className="text-btn" onClick={() => dispatch({type: 'pickerScope', scope: null})}>← All factions</button>
                </div>
                <span className="dp-head" style={{padding: 0}}>Unit type</span>
                <div className="dp-tiles">
                  {(browse?.types ?? []).map((t) => {
                    const sample = searcher.unitsOfType(t.type, scope).slice(0, 3).map((u) => u.short).join(', ');
                    return (
                      <button type="button" key={t.type} className="tile type" onClick={() => dispatch({type: 'pickerPush', view: {view: 'type', type: t.type}})}>
                        <span className="tt"><span>{TYPE_NAMES[t.type] ?? t.type}</span><span className="r">{t.count}</span></span>
                        <span className="note">{sample}…</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

DeskPicker.propTypes = {searcher: PropTypes.object, army: PropTypes.object};
