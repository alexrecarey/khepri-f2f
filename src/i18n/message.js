// Message descriptors: what the rules say, before it is said in a language.
//
// The rules (src/rules) decide which note, warning or ledger line applies
// and return it as a descriptor, plain data with no language in it; the
// view (state/matchupView.js, rules/ledger.js) renders it with the player's
// translator (./index.js). A descriptor is one of:
//   msg(key, params)   {key, params?, fallback?}: t(key, params), each param
//                      itself a value or a descriptor; `fallback` is shown
//                      when the key has no message (an ammo name the copy
//                      doesn't translate)
//   term(table, token) {term: [table, token, scope?], strip?}: an army term
//                      (t.term), `strip` a RegExp taken off it
//   inch(text)         {inch}: Army text in inches, in t's unit (t.inchText)
//   distance(cm)       {distance}: a distance in t's unit (t.distance)
//   list(items, sep)   {list, sep}: descriptors joined by `sep`
//   a string           already text: rendered as is, so a caller can mix
//                      the army's own names (a weapon's) with descriptors
export const msg = (key, params) => (params ? {key, params} : {key});
export const term = (table, token, scope) => ({term: scope === undefined ? [table, token] : [table, token, scope]});
export const inch = (text) => ({inch: text});
export const distance = (cm) => ({distance: cm});
export const list = (items, sep = ', ') => ({list: items, sep});

// "Active: ..." / "Reactive: ...": a note about one side; s null is about both.
export const side = (s, m) => (s ? msg('note.side', {side: msg(s === 'A' ? 'side.active' : 'side.reactive'), text: m}) : m);

const isDescriptor = (m) => m !== null && typeof m === 'object' && !Array.isArray(m)
  && ('key' in m || 'term' in m || 'inch' in m || 'distance' in m || 'list' in m);

// The descriptor's text in t's language. Anything that isn't a descriptor
// (a string, a number, null) comes back unchanged.
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

// The same lines (lines.js) with every text rendered: label, struck, source.
export const renderLines = (t, lines) => lines.map((l) => {
  const out = {...l, label: render(t, l.label)};
  if ('struck' in l) out.struck = render(t, l.struck);
  if ('source' in l) out.source = render(t, l.source);
  return out;
});
