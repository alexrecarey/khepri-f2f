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

/** @param {string} w */
const letters = (w) => w.replace(/[^\p{L}]/gu, '');
/** @param {string} w */
const isUpper = (w) => letters(w) !== '' && letters(w) === letters(w).toUpperCase() && letters(w) !== letters(w).toLowerCase();

// "CABALLERO DEL SANTO SEPULCRO" -> "Caballero del Santo Sepulcro". Words
// already in mixed case ("Mk-III", "Varuna") are left alone.
/** @param {string} name */
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
/**
 * @param {string | null | undefined} unitName
 * @param {string[]} loadouts the unit's loadout names
 */
export function spanishShort(unitName, loadouts) {
  const own = (unitName ?? '').split(',')[0].replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  return shortFromLoadouts(loadouts, own.length <= OWN_NAME_MAX ? own : null);
}

// Units that are a team around one controller (its pack, its puppets): the
// loadouts name the controller, so the unit goes by its own name.
export const BY_UNIT_NAME = new Set(['Antipode Assault Pack', 'Bakunin Überfallkommando', 'Puppetactica Company']);
const OWN_NAME_MAX = 28;

// The words every loadout name starts with, role tags left out and cased
// for reading ("HAC TAO", "HAC TAO HACKER" -> "Hac Tao"); null if none.
/**
 * @param {string[]} loadouts
 * @returns {string | null}
 */
export function sharedLoadoutName(loadouts) {
  const split = loadouts.map((n) => n.replace(/\s+/g, ' ').trim()).filter(Boolean).map((n) => n.split(' '));
  if (split.length === 0) return null;
  /** @type {string[]} */
  const common = [];
  for (let i = 0; i < split[0].length && split.every((w) => w[i] === split[0][i]); i++) common.push(split[0][i]);
  let short = common.join(' ');
  while (TAGS.test(short)) short = short.replace(TAGS, '');
  return short ? readableCase(short.replace(/_/g, ' ')) : null;
}

/**
 * @param {string[]} loadouts
 * @param {string | null} fallback
 */
function shortFromLoadouts(loadouts, fallback) {
  const names = loadouts.map((n) => n.replace(/\s+/g, ' ').trim()).filter(Boolean);
  if (names.length === 0) return fallback ? readableCase(fallback) : null;
  const split = names.map((n) => n.split(' '));
  /** @type {string[]} */
  const common = [];
  for (let i = 0; i < split[0].length && split.every((w) => w[i] === split[0][i]); i++) common.push(split[0][i]);
  let short = common.join(' ');
  if (!short && fallback) short = fallback;
  if (!short) {
    /** @type {Map<string, number>} */
    const counts = new Map();
    for (const n of names) counts.set(n, (counts.get(n) ?? 0) + 1);
    short = [...counts].sort((a, b) => b[1] - a[1])[0][0];
  }
  while (TAGS.test(short)) short = short.replace(TAGS, '');
  return readableCase(short.replace(/_/g, ' '));
}
