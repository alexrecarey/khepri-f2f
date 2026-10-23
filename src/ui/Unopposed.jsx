// Results when the roll is not face to face: a Direct Template against an
// attack. The template doesn't roll, so nothing is opposed: each attack is its
// own event and both can wound in the same order. One combined bar would
// mislead, so each attack gets its own (card: two stacked bars; sheet: the
// four ways the order can end, then each attack in detail).
import PropTypes from 'prop-types';
import Headline from './Headline.jsx';
import {pct, shade, shadeInk, shows} from '../results/summary.js';
import {Rich, useT} from './i18n.jsx';

const top = (a) => [3, 2, 1].find((w) => shows(a.wounds[w - 1])) ?? 0;

// One attack's bar: wounds (most first for the active side, mirrored for the
// reactive), then saved, then missed. Nothing for outcomes that can't happen.
// 1, 2 and 3+ wounds take the face-to-face shades for three states (steps 3,
// 5, 6), so the deepest is the most wounds here too.
function AttackBar({a, side, height, labels = false}) {
  const t = useT();
  const wounds = [3, 2, 1].map((w) => ({key: `w${w}`, chance: a.wounds[w - 1], bg: shade(side, w - 1, 3), ink: shadeInk(side, w - 1, 3),
    text: w === top(a) ? `${w}+` : `${w}`}));
  const rest = [
    {key: 'saved', chance: a.saved, cls: 'seg-none', ink: 'var(--muted)', text: t('unopposed.saved')},
    {key: 'miss', chance: a.miss, cls: 'seg-miss', ink: 'var(--muted)', text: t('unopposed.miss')},
  ];
  const segs = (side === 'active' ? [...wounds, ...rest] : [...rest.reverse(), ...[...wounds].reverse()]).filter((x) => shows(x.chance));
  return (
    <div className="bar" style={{height, borderRadius: height > 10 ? 7 : 3}}>
      {segs.map((x) => (
        <span key={x.key} className={x.cls ? `${x.cls} seg-l` : 'seg-l'} style={{width: `${100 * x.chance}%`, background: x.bg, color: x.ink}}>
          {labels && x.chance > 0.07 ? x.text : ''}
        </span>
      ))}
    </div>
  );
}

AttackBar.propTypes = {a: PropTypes.object.isRequired, side: PropTypes.string.isRequired, height: PropTypes.number.isRequired, labels: PropTypes.bool};

// Card body: the two headline numbers, one thin bar per attack.
export function UnopposedCardBody({s, h, choice}) {
  return (
    <>
      <Headline h={h} choice={choice} />
      <AttackBar a={s.attacks.active} side="active" height={6} />
      <AttackBar a={s.attacks.reactive} side="reactive" height={6} />
      <div className="split"><span>{h.small[0]}</span><span>{h.small[1]}</span></div>
    </>
  );
}

UnopposedCardBody.propTypes = {s: PropTypes.object.isRequired, h: PropTypes.object.isRequired, choice: PropTypes.string.isRequired};

function AttackDetail({a, side, name, dice}) {
  const t = useT();
  const most = top(a);
  const rows = [
    ...[3, 2, 1].filter((w) => w <= most).map((w) => [w === most ? t('unopposed.atLeast', {count: w}) : t('state.wounds', {count: w}), a.wounds[w - 1]]),
    [t('unopposed.hitsAllSaved'), a.saved],
    [t('unopposed.misses'), a.miss],
  ].filter(([, p]) => shows(p));
  return (
    <div className="attack">
      <div className={`ledger-top c-${side}`}><span>{t('unopposed.attack', {name})}</span><span>{dice}</span></div>
      <AttackBar a={a} side={side} height={28} labels />
      <div className="pct-list">
        {rows.map(([k, p]) => <div key={k}><span>{k}</span><span>{pct(p)}</span></div>)}
        <div className="muted"><span>{t('headline.wpoLabel')}</span><span>{a.wpo.toFixed(2)}</span></div>
      </div>
    </div>
  );
}

AttackDetail.propTypes = {a: PropTypes.object.isRequired, side: PropTypes.string.isRequired, name: PropTypes.string.isRequired, dice: PropTypes.string};

// Sheet body: why it's two attacks, how the order can end, each attack in detail.
export function UnopposedSheetBody({s, names, diceLine}) {
  const t = useT();
  const {joint} = s;
  const tiles = [
    {k: 'both', p: joint.both, text: t('unopposed.both'), cls: 'c-both'},
    {k: 'a', p: joint.onlyActive, text: t('unopposed.only', {name: names.B}), cls: 'c-active'},
    {k: 'r', p: joint.onlyReactive, text: t('unopposed.only', {name: names.A}), cls: 'c-reactive'},
    {k: 'n', p: joint.neither, text: t('unopposed.nobody'), cls: 'c-none'},
  ].filter((x) => shows(x.p));
  return (
    <>
      <p className="explain"><Rich text={t('unopposed.explain')} tags={{b: (text) => <b>{text}</b>}} /></p>
      <span className="label">{t('unopposed.thisOrder')}</span>
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
