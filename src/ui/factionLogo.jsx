// Vanilla faction crests (public/factions, copied from the infinitystats
// site's static/factions). Keyed by the vanilla faction id the search index
// uses; precached with the rest of the app, so they work offline.
import PropTypes from 'prop-types';

const SLUG = {
  101: 'panoceania', 201: 'yu-jing', 301: 'ariadna', 401: 'haqqislam', 501: 'nomads', 601: 'combined-army',
  701: 'aleph', 801: 'tohaa', 901: 'non-aligned-armies', 1001: 'o-12', 1101: 'jsa',
};

// The crest's path, or null for an id without one.
export const factionLogoSrc = (id) => (SLUG[id] ? `/factions/${SLUG[id]}.svg` : null);

export default function FactionLogo({id, size = 24}) {
  const src = factionLogoSrc(id);
  if (!src) return null;
  return <img className="faction-logo" src={src} alt="" width={size} height={size} loading="lazy" />;
}

FactionLogo.propTypes = {id: PropTypes.number, size: PropTypes.number};
