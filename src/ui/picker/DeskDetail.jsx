// The desk picker's right pane: the highlighted unit with its stats and every
// loadout as a chart line, or, before typing, factions and unit types to browse.
import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {extraLoadoutName, shortIsc} from '../../army/names.js';
import {dispatch} from '../../state/store.js';
import {bandColor} from '../bands.js';
import {CardCrest} from '../Crest.jsx';
import FactionLogo from '../factionLogo.jsx';
import {typeName} from './constants.js';
import {traitLabel} from '../../army/traits.js';
import {ammoName} from '../../army/weapons.js';
import {useT} from '../i18n.jsx';
import {loadoutCharts, loadoutTag} from './loadouts.js';
import {setCursor} from './useDeskPicker.js';

function Stripe({bands}) {
  return (
    <span className="stripe7" aria-hidden="true">{bands.map((m, i) => <i key={i} style={{background: bandColor(m)}} />)}</span>
  );
}

Stripe.propTypes = {bands: PropTypes.array.isRequired};

// c.ammo: English tokens joined by +, or 'template'.
function ChartLine({c, sub}) {
  const t = useT();
  const ammo = c.ammo === 'template' ? t('ledger.template') : c.ammo.split('+').filter(Boolean).map((a) => ammoName(a, t)).join('+');
  return (
    <div className={`chart-line${sub ? ' sub' : ''}`}>
      <span className="n">{c.name}</span>
      <Stripe bands={c.bands} />
      <span className="m">{c.burst != null ? `${t('abbr.B')}${c.burst}` : ''}</span>
      <span className="m">{c.ps != null ? `${t('abbr.PS')}${c.ps}` : ''}</span>
      <span className="a">{ammo}</span>
    </div>
  );
}

ChartLine.propTypes = {c: PropTypes.object.isRequired, sub: PropTypes.bool};

// The unit: name, profile tabs, stats, skills, loadouts and the Use buttons.
function UnitPane({m}) {
  const t = useT();
  const {army, detail, profile, factionName, factionId, loadouts, pane, lat, best, bestAt, color, pick, withProfile, hitFor, otherSet, otherName} = m;
  // The loadout Enter picks is the lit one: the keyboard's in the loadouts
  // pane, else the one the search matched ("fus ml") on a unit row.
  const lit = pane === 'loadouts' ? lat : best ? bestAt : -1;
  useEffect(() => {
    if (lit >= 0) document.getElementById(`dp-lo-${lit}`)?.scrollIntoView({block: 'nearest'});
  }, [lit, detail]);
  return (
    <>
      {/* The highlighted profile's crest in the pane's corner, like the setup cards (A5). */}
      <CardCrest slug={profile.crest} />
      <div className="dp-unit">
        <div>
          <span className="dp-name">{shortIsc(detail.unit.isc)}</span>
          <div className="note">{factionName(factionId)} · {typeName(t, profile.type)}</div>
        </div>
        {detail.profiles.length > 1 && (
          <span className="dp-tabs" role="group" aria-label={t('picker.profile')}>
            {detail.profiles.map((p) => (
              <button type="button" key={p.id} className={p.id === profile.id ? 'on' : ''} aria-pressed={p.id === profile.id}
                onClick={() => setCursor({profileId: p.id})}>{p.name}</button>
            ))}
          </span>
        )}
      </div>
      <div className="dp-stats">
        {profile.stats.map(([k, v]) => <span key={k}><small>{t(`stat.${k.toLowerCase()}`)}</small><b>{k === 'MOV' ? v.map((cm) => t.distance(cm)).join('-') : v}</b></span>)}
      </div>
      {profile.skills.length > 0 && <div className="dp-skills">{profile.skills.map((sk) => traitLabel(sk, t)).join(' · ')}</div>}
      <span className="dp-head" style={{padding: 0}}>{t('picker.loadouts')}</span>
      <div className="dp-loadouts" id="dp-loadouts" role="listbox" aria-label={t('picker.loadouts')}>
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
              <span className="pts">{h.points} {t('picker.pts')}{h.swc ? ` · ${h.swc} ${t('picker.swc')}` : ''}</span>
            </div>
          );
        })}
      </div>
      {/* Cover, Sapper and Fireteam are set on the side card after picking. */}
      <div className="dp-actions">
        <span style={{flexGrow: 1}} />
        {otherSet ? (
          <>
            <button type="button" className="btn" onClick={() => pick(hitFor(), true)}>{t('picker.useAndChange', {side: otherName})} <kbd>⇧↵</kbd></button>
            <button type="button" className={`btn on ${color}`} onClick={() => pick(hitFor())}>{t('picker.use')} <kbd>↵</kbd></button>
          </>
        ) : (
          <>
            <button type="button" className="btn" onClick={() => pick(hitFor())}>{t('picker.use')} <kbd>⇧↵</kbd></button>
            <button type="button" className={`btn on ${color}`} onClick={() => pick(hitFor(), true)}>{t('picker.useAndChoose', {side: otherName})} <kbd>↵</kbd></button>
          </>
        )}
      </div>
    </>
  );
}

UnitPane.propTypes = {m: PropTypes.object.isRequired};

// Before typing, with no faction: every faction to browse.
function FactionTiles({searcher}) {
  const t = useT();
  return (
    <>
      <span className="dp-head" style={{padding: 0}}>{t('picker.browseByFaction')}</span>
      <div className="dp-tiles">
        {(searcher?.factions ?? []).map((f) => (
          <button type="button" key={f.id} className="tile faction" onClick={() => dispatch({type: 'pickerScope', scope: f.id})}>
            <FactionLogo id={f.id} size={40} />
            <span>{f.name}</span><span className="r">{searcher.unitCount(f.id)}</span>
          </button>
        ))}
      </div>
      <span className="note">{t('picker.sectorialsNote')}</span>
    </>
  );
}

FactionTiles.propTypes = {searcher: PropTypes.object};

// Before typing, in a faction: its unit types.
function TypeTiles({m}) {
  const t = useT();
  const {searcher, scope, browse, factionName} = m;
  return (
    <>
      <div className="dp-unit">
        <span className="dp-name dp-faction"><FactionLogo id={scope} size={36} />{factionName(scope)} <span className="note">· {t('picker.sectorialsIncluded')}</span></span>
        <button type="button" className="text-btn" onClick={() => dispatch({type: 'pickerScope', scope: null})}>← {t('picker.allFactions')}</button>
      </div>
      <span className="dp-head" style={{padding: 0}}>{t('picker.unitType')}</span>
      <div className="dp-tiles">
        {(browse?.types ?? []).map((ty) => {
          const sample = searcher.unitsOfType(ty.type, scope).slice(0, 3).map((u) => u.short).join(', ');
          return (
            <button type="button" key={ty.type} className="tile type" onClick={() => dispatch({type: 'pickerPush', view: {view: 'type', type: ty.type}})}>
              <span className="tt"><span>{typeName(t, ty.type)}</span><span className="r">{ty.count}</span></span>
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
  const t = useT();
  const {detail, profile, browsing, rows, scope, searcher} = m;
  return (
    <div className="dp-detail">
      {detail && profile ? <UnitPane m={m} />
        : !browsing ? <span className="empty">{rows.length ? t('picker.pickOnLeft') : ''}</span>
          : scope == null ? <FactionTiles searcher={searcher} />
            : <TypeTiles m={m} />}
    </div>
  );
}

DeskDetail.propTypes = {m: PropTypes.object.isRequired};
