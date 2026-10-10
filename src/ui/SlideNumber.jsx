// A number that slides to its new value as one piece (Number changes board,
// option B): when the value goes up the old one leaves upwards and the new one
// comes in from below; when it goes down, the other way round. The direction
// is the message, so a glance tells you whether your last change helped.
// Both values sit in the same grid cell while they cross; the old one is
// dropped when its animation ends (hidden outright under reduced motion).
import {useState} from 'react';
import PropTypes from 'prop-types';

export default function SlideNumber({text, className = ''}) {
  const [s, setS] = useState({text, old: null, dir: 'up', n: 0});
  if (s.text !== text) {
    // Non-numbers ("—") have no direction; they come in like a rise.
    const dir = Number(text) < Number(s.text) ? 'down' : 'up';
    setS({text, old: s.text, dir, n: s.n + 1});
  }
  const dropOld = () => setS((cur) => (cur.n === s.n ? {...cur, old: null} : cur));
  return (
    <span className={`slide-n ${s.dir} ${className}`} aria-label={text} role="text">
      {s.old != null && <span key={`o${s.n}`} className="slide-out" aria-hidden="true" onAnimationEnd={dropOld}>{s.old}</span>}
      <span key={`i${s.n}`} className={s.old != null ? 'slide-in' : undefined} aria-hidden="true">{s.text}</span>
    </span>
  );
}

SlideNumber.propTypes = {text: PropTypes.string.isRequired, className: PropTypes.string};
