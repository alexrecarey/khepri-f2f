// Each board of the design canvas's Final page as a state document (partial:
// missing slices get their defaults). Open one with ?fixture=FinalPeek to see
// the build in the exact state the board shows.
const FIXTURES = import.meta.glob('./*.json', {import: 'default'});

export const fixtureNames = Object.keys(FIXTURES).map((p) => p.slice(2, -5));

export async function loadFixture(name) {
  const load = FIXTURES[`./${name}.json`];
  return load ? load() : null;
}
