// A split range (canvas board S3): each side shoots at its own distance. One
// shared row of distances, a track above it for the active and one below for
// the reactive, each holding its side's pick. Open, each track carries its
// weapon's Range MOD colours; closed, the tracks shrink to thin bars, so both
// distances still show. A tap on a distance only opens the selector: it
// belongs to both sides, so it can't pick for either.
import PropTypes from 'prop-types';
import {RANGE_BANDS, bandLabel} from '../rules/ranges.js';
import {dispatch} from '../state/store.js';
import {bandColor, signedMod} from './bands.js';
import {SplitIcon} from './icons.jsx';
import {useT} from './i18n.jsx';

const ROLE = {A: 'side.active', B: 'side.reactive'};

function Pick({side, i, on, mod, open}) {
  const t = useT();
  const b = RANGE_BANDS[i];
  return (
    <button type="button" className={`scale-pick ${side}${on ? ' on' : ''}`} aria-pressed={on}
      aria-label={`${t(ROLE[side])} ${bandLabel(i, t)}: ${signedMod(mod)}`}
      onClick={() => dispatch({type: 'setRange', side, rangeCm: b.to, open: true})}>
      <span className="track"><span className="stripe" style={{background: open ? bandColor(mod) : 'transparent'}} /></span>
    </button>
  );
}

Pick.propTypes = {side: PropTypes.oneOf(['A', 'B']).isRequired, i: PropTypes.number.isRequired, on: PropTypes.bool, mod: PropTypes.number, open: PropTypes.bool};

// selA / selB: each side's band index.
export default function RangeScale({bands, open, selA, selB}) {
  const t = useT();
  return (
    <div className="scale" role="group" aria-label={t('range.perSide')}>
      {RANGE_BANDS.map((b, i) => {
        const on = i === selA || i === selB;
        return (
          <div className="scale-col" key={b.to}>
            <Pick side="A" i={i} on={i === selA} mod={bands[i].A} open={open} />
            {/* Keyboard users pick on the tracks, which open it too. */}
            <button type="button" className={`dist${on ? ' on' : ''}`} tabIndex={-1} aria-label={`${bandLabel(i, t)}; ${t('range.open')}`}
              onClick={() => dispatch({type: 'setRangeOpen', open: true})}>{on ? t('dist.picked', {n: t.distance(b.to)}) : t.distance(b.to)}</button>
            <Pick side="B" i={i} on={i === selB} mod={bands[i].B} open={open} />
          </div>
        );
      })}
    </div>
  );
}

RangeScale.propTypes = {bands: PropTypes.array.isRequired, open: PropTypes.bool, selA: PropTypes.number.isRequired, selB: PropTypes.number.isRequired};

// Next to Smoke / White Noise: split the range so each side picks its own.
export function SplitChip({split, open}) {
  const t = useT();
  return (
    <button type="button" className={`range-chip${split ? ' on' : ''}`} aria-pressed={split} tabIndex={open ? 0 : -1}
      onClick={() => dispatch({type: 'setRangeSplit', on: !split})}>
      <SplitIcon />{t('range.split')}
    </button>
  );
}

SplitChip.propTypes = {split: PropTypes.bool, open: PropTypes.bool};
