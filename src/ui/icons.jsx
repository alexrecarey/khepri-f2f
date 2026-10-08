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

const stroke = {fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round'};
export const BookmarkIcon = ({filled = false}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...stroke} fill={filled ? 'currentColor' : 'none'}><path d="M6 3h12v18l-6-4-6 4z" /></svg>
);
BookmarkIcon.propTypes = {filled: PropTypes.bool};
export const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
  </svg>
);
export const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...stroke}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></svg>
);
export const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...stroke}><path d="M12 15V3M7 8l5-5 5 5M5 13v7h14v-7" /></svg>
);
