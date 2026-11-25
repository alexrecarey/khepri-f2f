// Every army's fireteam chart as the Army API served it, written next to
// army.json by scripts/fetch-army.mjs (src/army/fireteam-charts.json).
// army.json keeps only what the calculator reads (each unit's largest team),
// and the API serves only the current release, so this file's git history is
// what lets the next update be diffed chart by chart. Charts are stored
// unchanged; the armies' names and versions are in army.json, and the shared
// generatedAt says the two files come from the same fetch.

/** @typedef {import('./fireteams.js').FireteamChart} FireteamChart */

/**
 * @param {Map<number, {fireteamChart?: FireteamChart}>} files raw API file per army id
 * @param {string} generatedAt army.json's
 */
export function fireteamChartsFile(files, generatedAt) {
  /** @type {Record<string, FireteamChart | null>} */
  const charts = {};
  for (const id of [...files.keys()].sort((a, b) => a - b)) charts[id] = files.get(id)?.fireteamChart ?? null;
  return {generatedAt, charts};
}
