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

// The site mark (public/favicon.svg): a hexagon with a triangle cut into it.
// The empty slot shows it in the side colour.
export function SiteMark({fill}) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path fill={fill} opacity=".9" d="M50 4 90 27v46L50 96 10 73V27Z" />
      <path fill="var(--surface)" opacity=".55" d="M50 22 72 62H28Z" />
    </svg>
  );
}

SiteMark.propTypes = {fill: PropTypes.string.isRequired};

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

// Wound state glyphs, one colour (currentColor): Unconscious (the token's
// heartbeat), NWI (its two arrowheads), Dogged (a dog head; the token's figure
// is lost at this size) and Dead.
const STATE_GLYPHS = {
  unc: <polyline fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" points="1.5,13 7,13 9,7 12.5,19 15,10 17,13 22.5,13" />,
  nwi: (
    <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5,12 12,5 19,12" /><polyline points="5,19 12,12 19,19" />
    </g>
  ),
  dogged: (
    <g fill="currentColor">
      <ellipse cx="4.8" cy="10.5" rx="2.8" ry="6.2" transform="rotate(18 4.8 10.5)" />
      <ellipse cx="19.2" cy="10.5" rx="2.8" ry="6.2" transform="rotate(-18 19.2 10.5)" />
      <path fillRule="evenodd" d="M12 3.2 C8 3.2 6.6 6.4 6.6 10 C6.6 13 7.2 15.1 8.6 17.1 C9.6 19.6 10.6 21.2 12 21.2 C13.4 21.2 14.4 19.6 15.4 17.1 C16.8 15.1 17.4 13 17.4 10 C17.4 6.4 16 3.2 12 3.2 Z M9.6 9.8 a1.3 1.3 0 1 0 .01 0 Z M14.4 9.8 a1.3 1.3 0 1 0 .01 0 Z M10.2 14.6 h3.6 l-1.8 2.3 Z" />
    </g>
  ),
  dead: <path fill="currentColor" fillRule="evenodd" d="M12 1.8 C6.6 1.8 3 5.5 3 10.2 C3 13.4 4.5 15.6 6.5 16.8 V20.5 Q6.5 22.2 8.2 22.2 H15.8 Q17.5 22.2 17.5 20.5 V16.8 C19.5 15.6 21 13.4 21 10.2 C21 5.5 17.4 1.8 12 1.8 Z M8.6 9 a2.3 2.3 0 1 0 0.01 0 Z M15.4 9 a2.3 2.3 0 1 0 0.01 0 Z M11 14.5 L12 13 L13 14.5 Z" />,
};

export function StateGlyph({glyph, size = 15}) {
  if (!STATE_GLYPHS[glyph]) return <span style={{width: size, display: 'inline-block'}} />;
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{display: 'block', flexShrink: 0}}>{STATE_GLYPHS[glyph]}</svg>;
}

StateGlyph.propTypes = {glyph: PropTypes.string, size: PropTypes.number};
