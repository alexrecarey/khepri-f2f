import {useState} from 'react';
import {PARAM_KEYS} from '../engine/params.js';

const WOUND_COLUMNS = ['player', 'wounds', 'raw_chance', 'cumulative_chance', 'chance'];

// A title may contain commas or quotes.
const csvField = (s) => (/[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s);

// One row per expected-wounds line of each saved result: result id, title,
// every calculator param, then the wounds line.
export function resultsToCsv(results) {
  const header = ['result id', 'title', ...PARAM_KEYS, ...WOUND_COLUMNS].join(',');
  const rows = results.flatMap((result, idx) => {
    const title = csvField(result.title ? result.title : `Saved Result ${idx + 1}`);
    const params = PARAM_KEYS.map((k) => result.parameters[k]);
    return result.expected_wounds.map((w) => [result.id, title, ...params, ...WOUND_COLUMNS.map((c) => w[c])].join(','));
  });
  return [header, ...rows].join('\n');
}

// Results saved for comparison below the calculator.
export function useSavedResults() {
  const [saved, setSaved] = useState([]);
  const withTitle = (id, title) => setSaved((list) => list.map((r) => (r.id === id ? {...r, title} : r)));
  return {
    saved,
    // `result` is the current result with its share params snapshotted, so a
    // saved result's link stays correct. The same result is only saved once.
    add: (result) => setSaved((list) => (list.some((r) => r.id === result.id) ? list : [...list, structuredClone(result)])),
    rename: (id) => (title) => withTitle(id, title),
    remove: (id) => setSaved((list) => list.filter((r) => r.id !== id)),
    clear: () => setSaved([]),
    downloadCsv: () => window.open(encodeURI(`data:text/csv;charset=utf-8,${resultsToCsv(saved)}`)),
  };
}
