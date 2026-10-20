import {searchKey} from '../lib/searchKey.js';

// Spanish unit names for the picker and cards. The Spanish Army data has no
// short unit name: `isc` stays English and `name` is the full formal title
// ("SANTA ORDEN MILITAR DE CABALLEROS TEUTONES"). Its loadout names are the
// short form players use, singular and translated ("CABALLERO TEUTÓN"), so a
// unit is called by what its loadouts share, cased for reading.

// Words players write in capitals.
const UPPER = new Set(['FTO', 'TAG', 'REM', 'IA', 'JSA', 'CSU', 'DCB', 'O-12', 'O12', 'ALEPH', 'EI', 'B2M', 'II', 'III', 'IV',
  'VI', 'VII', 'K-9', 'NA2', 'HMG', 'ML', 'PMC', 'ICARUS', 'LT', 'LT.']);
// Spanish particles stay lower case inside a name.
const SMALL = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'en', 'a', 'of', 'the', 'and']);

const letters = (w) => w.replace(/[^\p{L}]/gu, '');
const isUpper = (w) => letters(w) !== '' && letters(w) === letters(w).toUpperCase() && letters(w) !== letters(w).toLowerCase();

// "CABALLERO DEL SANTO SEPULCRO" -> "Caballero del Santo Sepulcro". Words
// already in mixed case ("Mk-III", "Varuna") are left alone.
export function readableCase(name) {
  return name.split(' ').filter(Boolean).map((word, i) => {
    if (!isUpper(word) || UPPER.has(word.replace(/[^\p{L}\p{N}.-]/gu, ''))) return word;
    const lower = word.toLocaleLowerCase('es');
    if (i > 0 && SMALL.has(lower)) return lower;
    // Capitalise each part: "MED-TEC" -> "Med-Tec", "'ROSIE'" -> "'Rosie'".
    return lower.replace(/(^|[-'"(])(\p{L})/gu, (_, sep, c) => sep + c.toLocaleUpperCase('es'));
  }).join(' ');
}

// Loadout tags that say what the trooper does, not who it is.
const TAGS = /\s+(FTO|LT\.?|Lt\.?)$/u;

// The unit's short name: the words its loadout names all start with
// ("NYOKA", "NYOKA FTO", "NYOKA HACKER" -> "NYOKA"). Loadouts with nothing in
// common are different troopers (Team-Ops, a TAG and its pilot), so the unit
// goes by its own name when that is short enough, else its commonest loadout.
export function spanishShort(unitName, loadouts) {
  const own = (unitName ?? '').split(',')[0].replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  return shortFromLoadouts(loadouts, own.length <= OWN_NAME_MAX ? own : null);
}

// Units that are a team around one controller (its pack, its puppets): the
// loadouts name the controller, so the unit goes by its own name.
export const BY_UNIT_NAME = new Set(['Antipode Assault Pack', 'Bakunin Überfallkommando', 'Puppetactica Company']);
const OWN_NAME_MAX = 28;

function shortFromLoadouts(loadouts, fallback) {
  const names = loadouts.map((n) => n.replace(/\s+/g, ' ').trim()).filter(Boolean);
  if (names.length === 0) return fallback ? readableCase(fallback) : null;
  const split = names.map((n) => n.split(' '));
  const common = [];
  for (let i = 0; i < split[0].length && split.every((w) => w[i] === split[0][i]); i++) common.push(split[0][i]);
  let short = common.join(' ');
  if (!short && fallback) short = fallback;
  if (!short) {
    const counts = new Map();
    for (const n of names) counts.set(n, (counts.get(n) ?? 0) + 1);
    short = [...counts].sort((a, b) => b[1] - a[1])[0][0];
  }
  while (TAGS.test(short)) short = short.replace(TAGS, '');
  return readableCase(short.replace(/_/g, ' '));
}

// The one word that tells the unit apart, for narrow columns (the ledger's
// source). English uses the short name's first word ("Fennec" for Fennec
// Fusiliers); where the Spanish name keeps that word it's the same ("Hac
// Tao", "Gorgos"), and where it's translated the Spanish order puts the
// telling word last ("Caballero Teutón", "Caballero de Montesa").
const NOT_A_TAG = /^(v\d+|mk[\w.-]*|[ivx]+|\d+)$/i;
export function spanishTag(short, enShort) {
  const parts = (short ?? '').split(' ').filter(Boolean);
  if (parts.length <= 1) return short;
  const enFirst = searchKey((enShort ?? '').split(' ')[0]);
  const same = parts.find((p) => searchKey(p) === enFirst);
  if (same) return same;
  return [...parts].reverse().find((p) => /\p{L}/u.test(p) && !NOT_A_TAG.test(p)) ?? parts[parts.length - 1];
}
