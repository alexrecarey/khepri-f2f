// Message descriptors: what the rules say, before it is said in a language.
//
// The rules (src/rules) decide which note, warning or ledger line applies
// and return it as a descriptor, plain data with no language in it; the
// view (state/matchupView.js, rules/ledger.js) renders it with the player's
// translator (./index.js). The shapes are types.js Message: one constructor
// each below, or a string that is already text.

/**
 * @param {string} key
 * @param {Record<string, unknown>} [params]
 * @returns {import('../types.js').MessageKey}
 */
export const msg = (key, params) => (params ? {key, params} : {key});
/**
 * @param {string} table
 * @param {string} token
 * @param {string | number} [scope] narrows the table by a key first (weapon modes are per weapon id)
 * @returns {import('../types.js').MessageTerm}
 */
export const term = (table, token, scope) => ({term: scope === undefined ? [table, token] : [table, token, scope]});
/**
 * @param {string} text
 * @returns {import('../types.js').MessageInch}
 */
export const inch = (text) => ({inch: text});
/**
 * @param {number} cm
 * @returns {import('../types.js').MessageDistance}
 */
export const distance = (cm) => ({distance: cm});
/**
 * @param {(import('../types.js').Message | number)[]} items
 * @param {string} [sep]
 * @returns {import('../types.js').MessageList}
 */
export const list = (items, sep = ', ') => ({list: items, sep});

/**
 * "Active: ..." / "Reactive: ...": a note about one side; s null is about both.
 * @param {import('../types.js').Side | null} s
 * @param {import('../types.js').Message} m
 * @returns {import('../types.js').Message}
 */
export const side = (s, m) => (s ? msg('note.side', {side: msg(s === 'A' ? 'side.active' : 'side.reactive'), text: m}) : m);

/** @param {unknown} m
 * @returns {m is Exclude<import('../types.js').Message, string>} */
const isDescriptor = (m) => m !== null && typeof m === 'object' && !Array.isArray(m)
  && ('key' in m || 'term' in m || 'inch' in m || 'distance' in m || 'list' in m);

/**
 * The descriptor's text in t's language. Anything that isn't a descriptor
 * (a string, a number, null) comes back unchanged.
 * @overload
 * @param {import('../types.js').Translator} t
 * @param {import('../types.js').Message} m a Message (types.js)
 * @returns {string} the text
 */
/**
 * @overload
 * @param {import('../types.js').Translator} t
 * @param {import('../types.js').Message | null} m a Message, or null
 * @returns {string | null} the text, or null as it came
 */
/**
 * @overload
 * @param {import('../types.js').Translator} t
 * @param {unknown} m anything else
 * @returns {unknown} `m` as it came
 */
/**
 * @param {import('../types.js').Translator} t
 * @param {unknown} m
 * @returns {unknown}
 */
export function render(t, m) {
  if (!isDescriptor(m)) return m;
  if ('key' in m) {
    if (m.fallback !== undefined && !t.has(m.key)) return m.fallback;
    const params = m.params && Object.fromEntries(Object.entries(m.params).map(([k, v]) => [k, render(t, v)]));
    return t(m.key, params);
  }
  if ('term' in m) {
    const text = t.term(...m.term);
    return m.strip ? text.replace(m.strip, '') : text;
  }
  if ('inch' in m) return t.inchText(m.inch);
  if ('distance' in m) return t.distance(m.distance);
  return m.list.map((x) => render(t, x)).join(m.sep);
}

/**
 * The same lines (lines.js) with every text rendered: label, struck, source.
 * @param {import('../types.js').Translator} t
 * @param {import('../types.js').Line[]} lines
 * @returns {import('../types.js').Line[]}
 */
export const renderLines = (t, lines) => lines.map((l) => {
  const out = {...l, label: render(t, l.label)};
  // `in`: the key is there, so the Message is too.
  if ('struck' in l) out.struck = render(t, /** @type {import('../types.js').Message} */ (l.struck));
  if ('source' in l) out.source = render(t, /** @type {import('../types.js').Message} */ (l.source));
  return out;
});
