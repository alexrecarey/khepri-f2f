// Each board of the design canvas's Final page as a state document (partial:
// missing slices get their defaults). Open one with ?fixture=FinalPeek to see
// the build in the exact state the board shows.
const FIXTURES = import.meta.glob('./*.json', {import: 'default'});

export const fixtureNames = Object.keys(FIXTURES).map((p) => p.slice(2, -5));

// `name` comes from the URL: only an own key of the glob map may be called.
export async function loadFixture(name) {
  const key = `./${name}.json`;
  if (!Object.hasOwn(FIXTURES, key)) return null;
  const load = FIXTURES[key];
  return typeof load === 'function' ? load() : null;
}
