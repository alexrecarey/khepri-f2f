// Each board of the design canvas's Final page as a state document (partial:
// missing slices get their defaults). Open one with ?fixture=FinalPeek to see
// the build in the exact state the board shows.
const FIXTURES = import.meta.glob('./*.json', {import: 'default'});

// `name` comes from the URL: only an own key of the glob map may be called.
/**
 * @param {string} name
 * @returns {Promise<unknown>} a partial state document, or null for a name that isn't a fixture
 */
export async function loadFixture(name) {
  const key = `./${name}.json`;
  if (!Object.hasOwn(FIXTURES, key)) return null;
  const load = FIXTURES[key];
  return typeof load === 'function' ? load() : null;
}
