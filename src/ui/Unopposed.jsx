// Results when the roll is not face to face: a Direct Template against an
// attack. The template doesn't roll, so nothing is opposed: each attack is its
// own event and both can wound in the same order. One combined bar would
// mislead, so each attack gets its own (card: two stacked bars; sheet: the
// four ways the order can end, then each attack in detail).
import PropTypes from 'prop-types';
import {pct, shows} from './results.js';

const SHADES = {active: ['seg-a1', 'seg-a2', 'seg-a3'], reactive: ['seg-r1', 'seg-r2', 'seg-r3']};
const top = (a) => [3, 2, 1].find((w) => shows(a.wounds[w - 1])) ?? 0;

// One attack's bar: wounds (most first for the active side, mirrored for the
// reactive), then saved, then missed. Nothing for outcomes that can't happen.
function AttackBar({a, side, height, labels = false}) {
  const wounds = [3, 2, 1].map((w) => ({key: `w${w}`, chance: a.wounds[w - 1], cls: SHADES[side][w - 1],
    text: w === top(a) ? `${w}+` : `${w}`}));
  const rest = [
    {key: 'saved', chance: a.saved, cls: 'seg-none', text: 'saved'},
    {key: 'miss', chance: a.miss, cls: 'seg-miss', text: 'miss'},
  ];
  const segs = (side === 'active' ? [...wounds, ...rest] : [...rest.reverse(), ...[...wounds].reverse()]).filter((x) => shows(x.chance));
  return (
    <div className="bar" style={{height, borderRadius: height > 10 ? 7 : 3}}>
      {segs.map((x) => (
        <span key={x.key} className={x.cls} style={{width: `${100 * x.chance}%`, display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
          color: x.cls.startsWith('seg-a') ? 'var(--active-ink)' : x.cls.startsWith('seg-r') ? 'var(--reactive-ink)' : 'var(--muted)'}}>
          {labels && x.chance > 0.07 ? x.text : ''}
        </span>
      ))}
    </div>
  );
}

AttackBar.propTypes = {a: PropTypes.object.isRequired, side: PropTypes.string.isRequired, height: PropTypes.number.isRequired, labels: PropTypes.bool};

// Card body: the two numbers, one thin bar per attack.
export function UnopposedCardBody({s}) {
  return (
    <>
      <div className="wpo-row">
        <div className="wpo"><span className="big c-active">{s.attacks.active.wpo.toFixed(2)}</span><span className="small">wounds / order</span></div>
        <div className="wpo right"><span className="big c-reactive">{s.attacks.reactive.wpo.toFixed(2)}</span><span className="small">wounds / order</span></div>
      </div>
      <AttackBar a={s.attacks.active} side="active" height={6} />
      <AttackBar a={s.attacks.reactive} side="reactive" height={6} />
      <div className="split"><span>{pct(s.attacks.active.wounded)} at least one wound</span><span>{pct(s.attacks.reactive.wounded)}</span></div>
    </>
  );
}

UnopposedCardBody.propTypes = {s: PropTypes.object.isRequired};

function AttackDetail({a, side, name, dice}) {
  const t = top(a);
  const rows = [
    ...[3, 2, 1].filter((w) => w <= t).map((w) => [w === t ? `${w}+ wound${w > 1 ? 's' : ''}` : `${w} wound${w > 1 ? 's' : ''}`, a.wounds[w - 1]]),
    ['hits, all saved', a.saved],
    ['misses', a.miss],
  ].filter(([, p]) => shows(p));
  return (
    <div className="attack">
      <div className={`ledger-top c-${side}`}><span>{name} attack</span><span>{dice}</span></div>
      <AttackBar a={a} side={side} height={28} labels />
      <div className="pct-list">
        {rows.map(([k, p]) => <div key={k}><span>{k}</span><span>{pct(p)}</span></div>)}
        <div className="muted"><span>wounds / order</span><span>{a.wpo.toFixed(2)}</span></div>
      </div>
    </div>
  );
}

AttackDetail.propTypes = {a: PropTypes.object.isRequired, side: PropTypes.string.isRequired, name: PropTypes.string.isRequired, dice: PropTypes.string};

// Sheet body: why it's two attacks, how the order can end, each attack in detail.
export function UnopposedSheetBody({s, names, diceLine}) {
  const {joint} = s;
  const tiles = [
    {k: 'both', p: joint.both, text: 'both are wounded', cls: 'c-both'},
    {k: 'a', p: joint.onlyActive, text: `only ${names.B} wounded`, cls: 'c-active'},
    {k: 'r', p: joint.onlyReactive, text: `only ${names.A} wounded`, cls: 'c-reactive'},
    {k: 'n', p: joint.neither, text: 'nobody wounded', cls: 'c-none'},
  ].filter((x) => shows(x.p));
  return (
    <>
      <p className="explain">
        Not a face to face roll. A Direct Template doesn&apos;t roll, so nothing is opposed: each attack is resolved
        on its own and <b>both can wound</b> this order.
      </p>
      <span className="label">What happens this order</span>
      <div className="tiles4">
        {tiles.map((x) => (
          <div key={x.k} className="tile4">
            <span className={`n ${x.cls}`}>{pct(x.p)}</span>
            <span className="t">{x.text}</span>
          </div>
        ))}
      </div>
      <AttackDetail a={s.attacks.active} side="active" name={names.A} dice={diceLine?.active} />
      <AttackDetail a={s.attacks.reactive} side="reactive" name={names.B} dice={diceLine?.reactive} />
    </>
  );
}

UnopposedSheetBody.propTypes = {s: PropTypes.object.isRequired, names: PropTypes.object.isRequired, diceLine: PropTypes.object};
