// Small inline icons. The d20 is the same Font Awesome die the old Burst
// input used (dice-d20, Font Awesome Free 6, CC BY 4.0), inlined so the app
// doesn't ship the whole icon pack for one path.
import PropTypes from 'prop-types';

const [w, h] = [512, 512];
const d20Path = 'M64.7 125.8l53.2 31.9c7.8 4.7 17.8 2 22.2-5.9L217.6 12.1c3-5.4-.9-12.1-7.1-12.1c-1.6 0-3.2 .5-4.6 1.4L63.9 98.8c-9.6 6.6-9.2 20.9 .8 26.9zM32 171.7V295.3c0 8 10.4 11 14.7 4.4l60-92c5-7.6 2.6-17.8-5.2-22.5L56.2 158C45.6 151.6 32 159.3 32 171.7zM326.4 12.1l77.6 139.6c4.4 7.9 14.5 10.6 22.2 5.9l53.2-31.9c10-6 10.4-20.3 .8-26.9L338.1 1.4c-1.4-.9-3-1.4-4.6-1.4c-6.2 0-10.1 6.7-7.1 12.1zM512 171.7c0-12.4-13.6-20.1-24.2-13.7l-45.3 27.2c-7.8 4.7-10.1 14.9-5.2 22.5l60 92c4.3 6.7 14.7 3.6 14.7-4.4V171.7zm-49.3 246L302.1 436.6c-8.1 .9-14.1 7.8-14.1 15.9v52.8c0 3.7 3 6.8 6.8 6.8c.8 0 1.6-.1 2.4-.4l172.7-64c6.1-2.2 10.1-8 10.1-14.5c0-9.3-8.1-16.5-17.3-15.4zM249.2 512c3.7 0 6.8-3 6.8-6.8V452.6c0-8.1-6.1-14.9-14.1-15.9l-160.6-19c-9.2-1.1-17.3 6.1-17.3 15.4c0 6.5 4 12.3 10.1 14.5l172.7 64c.8 .3 1.6 .4 2.4 .4zM57.7 382.9l170.9 20.2c7.8 .9 13.4-7.5 9.5-14.3l-85.7-150c-5.9-10.4-20.7-10.8-27.3-.8L46.2 358.2c-6.5 9.9-.3 23.3 11.5 24.7zm439.6-24.8L418.9 238.1c-6.5-10-21.4-9.6-27.3 .8L306.2 388.5c-3.9 6.8 1.6 15.2 9.5 14.3l170.1-20c11.8-1.4 18-14.7 11.5-24.6zm-216.9 11l78.4-137.2c6.1-10.7-1.6-23.9-13.9-23.9H199.1c-12.3 0-20 13.3-13.9 23.9l78.4 137.2c3.7 6.4 13 6.4 16.7 0zM190.4 176H353.6c12.2 0 19.9-13.1 14-23.8l-80-144c-2.8-5.1-8.2-8.2-14-8.2h-3.2c-5.8 0-11.2 3.2-14 8.2l-80 144c-5.9 10.7 1.8 23.8 14 23.8z';

export function D20({fill, opacity = 1, crossed = false}) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{opacity}}>
      <path fill={fill} d={d20Path} />
      {crossed && <path d="M40 472 L472 40" stroke="var(--bg)" strokeWidth="64" />}
      {crossed && <path d="M40 472 L472 40" stroke="var(--text-3)" strokeWidth="28" strokeLinecap="round" />}
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
