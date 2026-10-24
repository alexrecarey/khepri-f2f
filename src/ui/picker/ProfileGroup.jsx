import PropTypes from 'prop-types';
import {useT} from '../i18n.jsx';
import {typeName} from './constants.js';
import {loadoutTag} from '../../state/pickerView.js';

// A unit with several profile groups (Team-Ops): one section per group, its
// name and type over its stats (label over value, as on desktop), the kit
// every loadout in it carries once, then each loadout as only what sets it
// apart. The side's colour stays on what the player picks (canvas Final,
// "Picker — units with several profiles").
/** @param {{g: import('../../state/pickerView.js').ProfileGroupView, onPick: (hit: import('../../types.js').ProfileHit) => void, color: string, army: import('../../types.js').Army | null}} props */
export default function ProfileGroup({g, onPick, color, army}) {
  const t = useT();
  return (
    <section className="pgroup" aria-label={g.name}>
      <div className="pgroup-head">
        <h2>{g.name}</h2>
        <span>{g.type ? `${typeName(t, g.type)} · ` : ''}{t('picker.loadoutCount', {count: g.items.length})}</span>
      </div>
      <div className="pgroup-stats">
        {/* MOV is the pair of values (profileStats). */}
        {g.stats.map(([k, v]) => <span key={k}><small>{t(`stat.${k.toLowerCase()}`)}</small><b>{k === 'MOV' ? /** @type {number[]} */ (v).map((cm) => t.distance(cm)).join('-') : v}</b></span>)}
      </div>
      {g.shared.length > 0 && <div className="pgroup-kit">{g.shared.join(', ')}</div>}
      {g.items.map(({hit, own}) => {
        // The section names the profile, so a row says what sets it apart:
        // its skills (Hacker, Forward Observer), not the loadout's name.
        const extra = loadoutTag(army, hit);
        return (
          <button type="button" key={hit.rowId} className="line-btn loadout" onClick={() => onPick(hit)}>
            <span><span className={`c-${color}`}>{own.join(', ')}</span>{extra && <span className="tag"> · {extra}</span>}</span>
            <span className="r">{hit.points}</span>
          </button>
        );
      })}
    </section>
  );
}

ProfileGroup.propTypes = {g: PropTypes.object.isRequired, onPick: PropTypes.func.isRequired, color: PropTypes.string.isRequired, army: PropTypes.object};
