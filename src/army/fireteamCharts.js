// Every army's fireteam chart as the Army API served it, kept per release in
// src/army/fireteam-charts/<version>.json by scripts/fetch-army.mjs. army.json
// keeps only what the calculator reads (each unit's largest team), and the API
// serves only the current release, so these snapshots are what lets the next
// update be diffed chart by chart. Charts are stored unchanged.

/** @typedef {import('./fireteams.js').FireteamChart} FireteamChart */

/** Army API versions ("7.26329.478") compared part by part. */
export function compareVersions(/** @type {string} */ a, /** @type {string} */ b) {
  const x = a.split('.').map(Number), y = b.split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/**
 * The snapshot of one fetch: armies by id with their name, version and chart.
 * Its file is named after the newest army version, since each army has its own.
 * @param {Record<string, {name: string, version: string | null}>} factions army.json's factions
 * @param {Map<number, {version?: string, fireteamChart?: FireteamChart}>} files raw API file per army id
 * @param {string} generatedAt
 */
export function fireteamChartsSnapshot(factions, files, generatedAt) {
  /** @type {Record<string, {name: string, version: string | null, chart: FireteamChart | null}>} */
  const armies = {};
  for (const id of [...files.keys()].sort((a, b) => a - b)) {
    const file = files.get(id);
    armies[id] = {name: factions[id]?.name ?? String(id), version: file?.version ?? null, chart: file?.fireteamChart ?? null};
  }
  const versions = Object.values(armies).map((a) => a.version).filter((v) => v !== null);
  const version = versions.sort(compareVersions).at(-1) ?? null;
  return {version, generatedAt, armies};
}
