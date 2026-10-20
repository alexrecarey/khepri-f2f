// The desk picker's right pane: the highlighted unit with its stats and every
// loadout as a chart line, or, before typing, factions and unit types to browse.
import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {extraLoadoutName, shortIsc} from '../../army/names.js';
import {dispatch} from '../../state/store.js';
import {CardCrest} from '../Crest.jsx';
import FactionLogo from '../factionLogo.jsx';
import {typeName} from './constants.js';
import {traitLabel} from '../../army/traits.js';
import {useT} from '../i18n.jsx';
import DeskLoadout from './DeskLoadout.jsx';
import {loadoutTag} from './loadouts.js';
import {setCursor} from './useDeskPicker.js';

// A profile's stats, each label over its value.
function Stats({stats}) {
  const t = useT();
  return (
    <div className="dp-stats">
      {stats.map(([k, v]) => <span key={k}><small>{t(`stat.${k.toLowerCase()}`)}</small><b>{k === 'MOV' ? v.map((cm) => t.distance(cm)).join('-') : v}</b></span>)}
    </div>
  );
}

Stats.propTypes = {stats: PropTypes.array.isRequired};

// A unit with several profile groups (Team-Ops, a TAG and its peripheral): a
// section per group with its own name, type, stats and skills, then its
// loadouts. The section names the profile, so a loadout's tag is its skills
// (canvas, "Picker — a unit with several profiles", desktop).
function ProfileSections({m, lit}) {
  const t = useT();
  const {army, pgroups, color, pick} = m;
  let start = 0;
  return pgroups.map((g) => {
    const first = start;
    start += g.items.length;
    return (
      <section key={g.key} className="dp-group" aria-label={g.name}>
        <div className="dp-group-head"><h3>{g.name}</h3>
          <span className="note">{g.type ? `${typeName(t, g.type)} · ` : ''}{t('picker.loadoutCount', {count: g.items.length})}</span></div>
        <Stats stats={g.stats} />
        {g.skills.length > 0 && <div className="dp-skills">{g.skills.map((sk) => traitLabel(sk, t)).join(' · ')}</div>}
        <div className="dp-loadouts" role="listbox" aria-label={g.name}>
          {g.items.map(({hit}, j) => (
            <DeskLoadout key={hit.rowId} h={hit} i={first + j} tag={loadoutTag(army, hit)} on={first + j === lit} color={color} army={army} onPick={pick} />
          ))}
        </div>
      </section>
    );
  });
}

ProfileSections.propTypes = {m: PropTypes.object.isRequired, lit: PropTypes.number.isRequired};

// The unit: name, profile tabs, stats, skills, loadouts and the Use buttons.
function UnitPane({m}) {
  const t = useT();
  const {army, detail, profile, factionName, factionId, loadouts, pgroups, pane, lat, best, bestAt, color, pick, withProfile, hitFor, otherSet, otherName} = m;
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
          <div className="note">{factionName(factionId)} · {pgroups
            ? `${t('picker.profiles', {count: pgroups.length})} · ${t('picker.loadoutCount', {count: loadouts.length})}`
            : typeName(t, profile.type)}</div>
        </div>
        {!pgroups && detail.profiles.length > 1 && (
          <span className="dp-tabs" role="group" aria-label={t('picker.profile')}>
            {detail.profiles.map((p) => (
              <button type="button" key={p.id} className={p.id === profile.id ? 'on' : ''} aria-pressed={p.id === profile.id}
                onClick={() => setCursor({profileId: p.id})}>{p.name}</button>
            ))}
          </span>
        )}
      </div>
      {pgroups ? <ProfileSections m={m} lit={lit} /> : (
        <>
          <Stats stats={profile.stats} />
          {profile.skills.length > 0 && <div className="dp-skills">{profile.skills.map((sk) => traitLabel(sk, t)).join(' · ')}</div>}
          <span className="dp-head" style={{padding: 0}}>{t('picker.loadouts')}</span>
          <div className="dp-loadouts" id="dp-loadouts" role="listbox" aria-label={t('picker.loadouts')}>
            {loadouts.map((h, i) => (
              <DeskLoadout key={h.rowId} h={h} i={i} tag={extraLoadoutName(h.loadout, h.unit) ?? loadoutTag(army, h)} on={i === lit}
                color={color} army={army} onPick={(x) => pick(withProfile(x))} />
            ))}
          </div>
        </>
      )}
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
