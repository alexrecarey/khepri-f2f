// The trooper picker's rows (TrooperPicker.jsx, PickerScreens.jsx): a profile
// hit with its crest and stats, a loadout on its unit's page, a unit to drill
// into.
import PropTypes from 'prop-types';
import {crestForRow} from '../../army/crests.js';
import {extraLoadoutName} from '../../army/names.js';
import {RowCrest} from '../Crest.jsx';
import {loadoutTag} from './loadouts.js';
import {useT} from '../i18n.jsx';

// The loadout's weapons, the one the query matched first: several loadouts
// often share their main weapon and only differ further down the list.
function weaponList(hit) {
  const rest = hit.weapons.filter((w) => w !== hit.weapon);
  return [hit.weapon, ...rest].filter(Boolean).join(', ');
}

export function ProfileRow({hit, onPick, first, color, army}) {
  const t = useT();
  const extra = extraLoadoutName(hit.loadout, hit.unit) ?? loadoutTag(army, hit);
  return (
    <button type="button" className={`hit${first ? ' first' : ''}`} onClick={() => onPick(hit)}>
      <RowCrest slug={crestForRow(army, hit)} />
      <span className="t">{hit.unit}{extra && <span className="tag"> · {extra}</span>}</span>
      <span className={`w c-${color}`}>{weaponList(hit)}</span>
      <span className="m">{t('stat.bs')} {hit.bs ?? '—'} · {hit.swc} {t('picker.swc')} · {hit.points} {t('picker.pts')}{hit.loose && <span className="loose"> · {t('picker.closeMatch')}</span>}</span>
    </button>
  );
}

ProfileRow.propTypes = {
  hit: PropTypes.object.isRequired, onPick: PropTypes.func.isRequired, first: PropTypes.bool,
  color: PropTypes.string.isRequired, army: PropTypes.object,
};

// A loadout on its unit's page: the unit name is the page title, so just the
// weapons (and any loadout name), with the points on the right.
export function LoadoutRow({hit, onPick, color, army}) {
  const extra = extraLoadoutName(hit.loadout, hit.unit) ?? loadoutTag(army, hit);
  return (
    <button type="button" className="line-btn loadout" onClick={() => onPick(hit)}>
      <span><span className={`c-${color}`}>{weaponList(hit)}</span>{extra && <span className="tag"> · {extra}</span>}</span>
      <span className="r">{hit.points}</span>
    </button>
  );
}

LoadoutRow.propTypes = {hit: PropTypes.object.isRequired, onPick: PropTypes.func.isRequired, color: PropTypes.string.isRequired, army: PropTypes.object};

export function UnitRow({u, onOpen}) {
  return (
    <button type="button" className="line-btn" onClick={() => onOpen(u)}>
      <span>{u.short}</span><span className="r">{u.profileCount} ›</span>
    </button>
  );
}

UnitRow.propTypes = {u: PropTypes.object.isRequired, onOpen: PropTypes.func.isRequired};
