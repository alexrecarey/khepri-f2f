// The trooper picker's rows (TrooperPicker.jsx, PickerScreens.jsx). Search
// results share one shape, Spotify style: a picture, a title, and a line
// under it that says what the row is. A unit (round crest) opens its page;
// a loadout (crest square with its weapon's label) is picked. On the unit's
// page, a loadout is just its weapons and points.
import {crestForRow, crestOf} from '../../army/crests.js';
import {unitById} from '../../army/lookup.js';
import {extraLoadoutName} from '../../army/names.js';
import {TIER} from '../../search/search.js';
import {ResultArt} from '../Crest.jsx';
import {loadoutTag} from '../../state/pickerView.js';
import {useT} from '../i18n.jsx';

/** @typedef {import('../../types.js').ProfileHit} ProfileHit */
/** @typedef {import('../../types.js').UnitHit} UnitHit */
/** @typedef {import('../../types.js').Army} Army */
/** @typedef {(id: number | null | undefined) => string} FactionName */

// The loadout's weapons, the one the query matched first: several loadouts
// often share their main weapon and only differ further down the list.
/** @param {ProfileHit} hit */
function weaponList(hit) {
  const rest = hit.weapons.filter((w) => w !== hit.weapon);
  return [hit.weapon, ...rest].filter(Boolean).join(', ');
}

// "PanOceania +1": a unit in several vanilla armies names the first.
/**
 * @param {number[]} ids
 * @param {FactionName} factionName
 */
export const factionsLabel = (ids, factionName) => `${factionName(ids[0])}${ids.length > 1 ? ` +${ids.length - 1}` : ''}`;

// `on`: the row the arrow keys or Enter are on.
/** @param {{u: UnitHit, onOpen: (u: UnitHit) => void, army: Army | null, factionName: FactionName, on?: boolean, id?: string}} props */
export function UnitResult({u, onOpen, army, factionName, on, id}) {
  const t = useT();
  const slug = u.best ? crestForRow(army, u.best) : crestOf(unitById(army, u.unitId), null);
  return (
    <button type="button" id={id} className={`res${on ? ' on' : ''}`} data-kind="unit" onClick={() => onOpen(u)}>
      <ResultArt kind="unit" slug={slug} faction={u.factionIds[0]} />
      <span className="tx">
        <span className="t">{u.title}</span>
        <span className="s">
          {t('picker.kindUnit')} · {factionsLabel(u.factionIds, factionName)} · {t('picker.loadoutCount', {count: u.profileCount})}
          {(u.tier ?? TIER.EXACT) >= TIER.TYPO1 && ` · ${t('picker.closeMatch')}`}
        </span>
      </span>
    </button>
  );
}

// Title: the trooper, with points and SWC; subtext: what makes this loadout
// this one (the weapon, then skills like Hacker).
/** @param {{hit: ProfileHit, onPick: (hit: ProfileHit) => void, army: Army | null, factionName: FactionName, recent?: boolean, on?: boolean, id?: string}} props */
export function LoadoutResult({hit, onPick, army, factionName, recent, on, id}) {
  const t = useT();
  const tag = loadoutTag(army, hit);
  return (
    <button type="button" id={id} className={`res${on ? ' on' : ''}`} data-kind="loadout" onClick={() => onPick(hit)}>
      <ResultArt kind="loadout" slug={crestForRow(army, hit)} faction={hit.factionId} code={hit.code} />
      <span className="tx">
        <span className="t"><span className="nm">{hit.title}</span><span className="cost">{hit.points} {t('picker.pts')} · {hit.swc} {t('picker.swc')}</span></span>
        <span className="s">
          {recent ? <span className="rec">{t('picker.recent')}</span> : t('picker.kindLoadout')}
          {' · '}{hit.weapon ?? '—'}{tag && ` · ${tag}`} · {factionName(hit.factionId)}
          {hit.loose && ` · ${t('picker.closeMatch')}`}
        </span>
      </span>
    </button>
  );
}

// A loadout on its unit's page: the unit name is the page title, so just the
// weapons (and any loadout name), with the points on the right.
/** @param {{hit: ProfileHit, onPick: (hit: ProfileHit) => void, color: string, army: Army | null, on?: boolean, id?: string}} props */
export function LoadoutRow({hit, onPick, color, army, on, id}) {
  const extra = extraLoadoutName(hit.loadout, hit.unit) ?? loadoutTag(army, hit);
  return (
    <button type="button" id={id} className={`line-btn loadout${on ? ' on' : ''}`} onClick={() => onPick(hit)}>
      <span><span className={`c-${color}`}>{weaponList(hit)}</span>{extra && <span className="tag"> · {extra}</span>}</span>
      <span className="r">{hit.points}</span>
    </button>
  );
}
