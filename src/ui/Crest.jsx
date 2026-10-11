// A unit crest as a coin (design canvas: Crests E), ringed in its side's
// colour. The crests are self-hosted WebPs (src/army/crests.js); a missing
// or failed one shows the trooper's vanilla faction crest instead, and with
// neither, an empty coin.
import {useState} from 'react';
import PropTypes from 'prop-types';
import {factionLogoSrc} from './factionLogo.jsx';

export function Crest({slug, faction, side, size = 36}) {
  const [failed, setFailed] = useState(null);
  const unit = slug && failed !== slug ? `/crests/${slug}.webp` : null;
  const src = unit ?? factionLogoSrc(faction);
  const cls = `crest ring-${side}${unit ? '' : ' fallback'}`;
  const style = {width: size, height: size};
  return src
    ? <img className={cls} style={style} src={src} alt="" loading="lazy" onError={() => setFailed(slug)} />
    : <span className={cls} style={style} />;
}

Crest.propTypes = {slug: PropTypes.string, faction: PropTypes.number, side: PropTypes.oneOf(['active', 'reactive']).isRequired, size: PropTypes.number};

// Active's coin with reactive's overlapping it on the right.
export function CrestPair({row, size = 36}) {
  return (
    <span className="crest-pair" style={{'--crest': `${size}px`}}>
      <Crest slug={row.ca} faction={row.fa} side="active" size={size} />
      <Crest slug={row.cr} faction={row.fr} side="reactive" size={size} />
    </span>
  );
}

CrestPair.propTypes = {row: PropTypes.object.isRequired, size: PropTypes.number};
