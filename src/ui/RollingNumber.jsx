// A number that rolls to its new value digit by digit, like an odometer: each
// digit is a 0-9 column that slides to the new digit, left to right a beat
// apart (MotionPolish board, "Odometer numbers"). Anything that isn't a digit
// ("." or "—") just shows. Digits are keyed from the right, so 0.81 -> 1.04
// moves the same columns. Under reduced motion the columns jump (app.css).
// The display font has proportional digits, so each window is sized by an
// invisible copy of its current digit and the column is centred over it;
// otherwise every window is as wide as a 0 and a 1 sits off to the left.
import PropTypes from 'prop-types';

const DIGITS = '0123456789';

export default function RollingNumber({text, className = ''}) {
  const chars = [...text];
  return (
    <span className={`odo ${className}`} aria-label={text} role="text">
      {chars.map((c, i) => {
        const key = chars.length - i; // from the right
        if (!DIGITS.includes(c)) return <span key={`c${key}`} aria-hidden="true">{c}</span>;
        return (
          <span key={`d${key}`} className="odo-d" aria-hidden="true">
            <span className="odo-w">{c}</span>
            <span className="odo-col" style={{transform: `translateY(${-Number(c)}em)`, transitionDelay: `${i * 60}ms`}}>
              {[...DIGITS].map((d) => <span key={d}>{d}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}

RollingNumber.propTypes = {text: PropTypes.string.isRequired, className: PropTypes.string};
