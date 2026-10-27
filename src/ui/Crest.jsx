// A unit crest as a coin (design canvas: Crests E), ringed in its side's
// colour. Crests are Corvus Belli's SVGs (a WebP for the few heavy ones),
// kept in R2 and served by the app's Worker at /crests/<slug>, whichever
// format it is (scripts/crests); a missing or failed one
// shows the trooper's vanilla faction crest instead, and with neither, an
// empty coin.
import {useState} from 'react';
import {factionLogoSrc} from './factionLogo.jsx';

/** @param {{slug?: string | null, faction?: number | null, side: 'active' | 'reactive', size?: number}} props */
export function Crest({slug, faction, side, size = 36}) {
  const [failed, setFailed] = useState(/** @type {string | null | undefined} */ (null));
  const unit = slug && failed !== slug ? `/crests/${slug}` : null;
  const src = unit ?? factionLogoSrc(faction);
  const cls = `crest ring-${side}${unit ? '' : ' fallback'}`;
  const style = {width: size, height: size};
  return src
    ? <img className={cls} style={style} src={src} alt="" loading="lazy" onError={() => setFailed(slug)} />
    : <span className={cls} style={style} />;
}

// Active's coin with reactive's overlapping it on the right.
/** @param {{row: Pick<Required<import('../types.js').RollSummary>, 'ca' | 'cr' | 'fa' | 'fr'>, size?: number}} props */
export function CrestPair({row, size = 36}) {
  return (
    <span className="crest-pair" style={/** @type {import('react').CSSProperties} */ ({'--crest': `${size}px`})}>
      <Crest slug={row.ca} faction={row.fa} side="active" size={size} />
      <Crest slug={row.cr} faction={row.fr} side="reactive" size={size} />
    </span>
  );
}

// The unit's crest behind a setup card (design canvas: Crests A5): in its own
// colours, cut by the card's top-right corner and fading towards the bottom
// left (matchup.css). Decoration only, so a missing crest just isn't there
// (a faction crest would read as a different, brighter mark).
/** @param {{slug?: string | null}} props */
export function CardCrest({slug}) {
  const [failed, setFailed] = useState(/** @type {string | null} */ (null));
  if (!slug || failed === slug) return null;
  return (
    <span className="card-crest" aria-hidden="true">
      <img src={`/crests/${slug}`} alt="" loading="lazy" onError={() => setFailed(slug)} />
    </span>
  );
}

// A picker row's crest (design canvas: Crests D): behind the row's right
// edge, faint and grey, in its own colours on the row Enter or a tap would
// pick (picker.css). Decoration only, like CardCrest.
/** @param {{slug?: string | null}} props */
export function RowCrest({slug}) {
  const [failed, setFailed] = useState(/** @type {string | null} */ (null));
  if (!slug || failed === slug) return null;
  return <img className="row-crest" src={`/crests/${slug}`} alt="" aria-hidden="true" loading="lazy" onError={() => setFailed(slug)} />;
}
