// The results' big numbers: whichever headline the player chose (results/headline.js),
// sliding to each new value, with dots between them for the three choices.
// On the phone card a sideways swipe moves between them (useSheetGestures.js)
// and the dots only show where you are; on the results panel they are buttons.
import {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {dispatch} from '../state/store.js';
import {HEADLINES} from '../results/headline.js';
import {setHeadline} from '../state/headlines.js';
import {useT} from './i18n.jsx';
import SlideNumber from './SlideNumber.jsx';
import WpoRow from './WpoRow.jsx';

// The change since the last value, in the headline's own unit.
const deltaText = (d, kind) => (kind === 'wpo' ? Math.abs(d).toFixed(2) : `${(100 * Math.abs(d)).toFixed(1)}%`);

// One side's number: slides to a new value, up or down with it (SlideNumber),
// shimmers while the next result is being worked out, and floats the change
// (+0.33) for a moment. Switching headline is not a change of value: no float.
function Num({value, text, kind, side, size, pending}) {
  const prev = useRef({value, kind});
  const [delta, setDelta] = useState(null);
  useEffect(() => {
    const before = prev.current;
    prev.current = {value, kind};
    if (value == null || before.value == null || before.kind !== kind) return undefined;
    // Less than what the number shows (0.005 wounds, 0.05%) isn't a change.
    if (Math.abs(value - before.value) < (kind === 'wpo' ? 0.005 : 0.0005)) return undefined;
    setDelta(value - before.value);
    const t = setTimeout(() => setDelta(null), 1600);
    return () => clearTimeout(t);
  }, [value, kind]);
  return (
    <span className="wpo-n">
      <SlideNumber text={text} className={`big ${size} c-${side}${pending ? ' computing' : ''}`} />
      {delta != null && <span className={`delta c-${side}`} aria-hidden="true">{delta > 0 ? '+' : '−'}{deltaText(delta, kind)}</span>}
    </span>
  );
}

Num.propTypes = {
  value: PropTypes.number, text: PropTypes.string.isRequired, kind: PropTypes.string.isRequired,
  side: PropTypes.string.isRequired, size: PropTypes.string, pending: PropTypes.bool,
};

// Where you are among the three. buttons: each dot picks its headline (the
// panel); otherwise they are a picture only, as the card is one button.
function Dots({choice, buttons}) {
  const t = useT();
  if (!buttons) {
    return (
      <span className="hl-dots" aria-hidden="true">
        {HEADLINES.map((c) => <i key={c} className={c === choice ? 'on' : undefined} />)}
      </span>
    );
  }
  return (
    <span className="hl-dots buttons" role="group" aria-label={t('headline.bigNumber')}>
      {HEADLINES.map((c) => (
        <button key={c} type="button" aria-pressed={c === choice} aria-label={t(`headline.${c}`)} title={t(`headline.${c}`)}
          onClick={() => dispatch(setHeadline(c))}><i className={c === choice ? 'on' : undefined} /></button>
      ))}
    </span>
  );
}

Dots.propTypes = {choice: PropTypes.string.isRequired, buttons: PropTypes.bool};

// h: headline(s, choice, params); choice: the player's pick (h.kind can differ
// when it falls back).
export default function Headline({h, choice, size = '', pending, buttons = false}) {
  const num = (side) => <Num value={h.value[side]} text={h.text[side]} kind={h.kind} side={side} size={size} pending={pending} />;
  return <WpoRow active={num('active')} reactive={num('reactive')} labels={h.label} middle={<Dots choice={choice} buttons={buttons} />} />;
}

Headline.propTypes = {
  h: PropTypes.object.isRequired, choice: PropTypes.string.isRequired, size: PropTypes.string,
  pending: PropTypes.bool, buttons: PropTypes.bool,
};
