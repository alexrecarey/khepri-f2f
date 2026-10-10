// The desk picker's right pane: the highlighted unit with its stats and every
// loadout as a chart line, or, before typing, factions and unit types to browse.
import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {extraLoadoutName, shortIsc} from '../../army/names.js';
import {dispatch} from '../../state/store.js';
import {bandColor} from '../bands.js';
import FactionLogo from '../factionLogo.jsx';
import {TYPE_NAMES} from './constants.js';
import {loadoutCharts, loadoutTag} from './loadouts.js';
import {setCursor} from './useDeskPicker.js';

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

// The unit: name, profile tabs, stats, skills, loadouts and the Use buttons.
function UnitPane({m}) {
  const {army, detail, profile, factionName, factionId, loadouts, pane, lat, best, bestAt, color, pick, withProfile, hitFor, otherSet, otherName} = m;
  // The loadout Enter picks is the lit one: the keyboard's in the loadouts
  // pane, else the one the search matched ("fus ml") on a unit row.
  const lit = pane === 'loadouts' ? lat : best ? bestAt : -1;
  useEffect(() => {
    if (lit >= 0) document.getElementById(`dp-lo-${lit}`)?.scrollIntoView({block: 'nearest'});
  }, [lit, detail]);
  return (
    <>
      <div className="dp-unit">
        <div>
          <span className="dp-name">{shortIsc(detail.unit.isc)}</span>
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
      <div className="dp-loadouts" id="dp-loadouts" role="listbox" aria-label="Loadouts">
        {loadouts.map((h, i) => {
          const charts = loadoutCharts(army, h.weaponIds);
          const tag = extraLoadoutName(h.loadout, h.unit) ?? loadoutTag(army, h);
          const on = i === lit;
          const main = charts[0];
          return (
            <div key={h.rowId} id={`dp-lo-${i}`} role="option" aria-selected={on} className={`dp-loadout${on ? ` on ${color}` : ''}`}
              onClick={() => setCursor({pane: 'loadouts', lcursor: i})} onDoubleClick={() => pick(withProfile(h))}>
              {main ? <ChartLine c={{...main, name: `${main.name}${tag ? ` · ${tag}` : ''}`}} /> : <span>{h.weapons.join(', ')}</span>}
              {on && charts.slice(1).map((c) => <ChartLine key={c.id} c={c} sub />)}
              <span className="pts">{h.points} pts{h.swc ? ` · ${h.swc} SWC` : ''}</span>
            </div>
          );
        })}
      </div>
      {/* Cover, Sapper and Fireteam are set on the side card after picking. */}
      <div className="dp-actions">
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
  );
}

UnitPane.propTypes = {m: PropTypes.object.isRequired};

// Before typing, with no faction: every faction to browse.
function FactionTiles({searcher}) {
  return (
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
  );
}

FactionTiles.propTypes = {searcher: PropTypes.object};

// Before typing, in a faction: its unit types.
function TypeTiles({m}) {
  const {searcher, scope, browse, factionName} = m;
  return (
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
  );
}

TypeTiles.propTypes = {m: PropTypes.object.isRequired};

// m: useDeskPicker()
export default function DeskDetail({m}) {
  const {detail, profile, browsing, rows, scope, searcher} = m;
  return (
    <div className="dp-detail">
      {detail && profile ? <UnitPane m={m} />
        : !browsing ? <span className="empty">{rows.length ? 'Pick a unit on the left.' : ''}</span>
          : scope == null ? <FactionTiles searcher={searcher} />
            : <TypeTiles m={m} />}
    </div>
  );
}

DeskDetail.propTypes = {m: PropTypes.object.isRequired};
