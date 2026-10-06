// Small inline icons. The d20 is the same Font Awesome die the old Burst input used.
import {faDiceD20} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const [w, h, , , d20Path] = faDiceD20.icon;

export function D20({fill, opacity = 1, crossed = false}) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{opacity}}>
      <path fill={fill} d={d20Path} />
      {crossed && <path d="M40 472 L472 40" stroke="#121212" strokeWidth="64" />}
      {crossed && <path d="M40 472 L472 40" stroke="#9a978f" strokeWidth="28" strokeLinecap="round" />}
    </svg>
  );
}

D20.propTypes = {fill: PropTypes.string.isRequired, opacity: PropTypes.number, crossed: PropTypes.bool};

export const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <circle cx="4" cy="10" r="1.8" /><circle cx="10" cy="10" r="1.8" /><circle cx="16" cy="10" r="1.8" />
  </svg>
);

export const BackIcon = () => <span aria-hidden="true" style={{fontSize: 24, lineHeight: 1}}>‹</span>;
