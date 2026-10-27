// The app's translator for components: App provides it (with the army's
// display terms), useT() reads it. Outside a provider it is English.
import {createContext, Fragment, useContext} from 'react';
import {tEn} from '../i18n/index.js';

const TContext = createContext(tEn);
export const TProvider = TContext.Provider;
export const useT = () => useContext(TContext);

// A message with markup: "Let me know at <a>{email}</a>." Each <tag>…</tag>
// is drawn by tags[tag](its text); the rest is text.
/** @param {{text: string, tags: Record<string, (text: string) => import('react').ReactNode>}} props */
export function Rich({text, tags}) {
  const parts = text.split(/<(\w+)>(.*?)<\/\1>/);
  // split with two groups: text, tag, inner, text, tag, inner, ..., text
  /** @type {import('react').ReactNode[]} */
  const out = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) out.push(parts[i]);
    if (i + 2 < parts.length) out.push(<Fragment key={i}>{tags[parts[i + 1]]?.(parts[i + 2]) ?? parts[i + 2]}</Fragment>);
  }
  return <>{out}</>;
}

// The engine's status message (engine/useEngine.js) in t's language; the
// number of rolls with the language's digit grouping.
/**
 * @param {import('../types.js').Translator} t
 * @param {import('../types.js').EngineHook['status']} status
 */
export const engineStatus = (t, {key, params}) =>
  t(key, params?.rolls == null ? params : {...params, rolls: /** @type {number} */ (params.rolls).toLocaleString(t.lang)});
