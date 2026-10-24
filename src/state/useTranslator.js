// The translator for the app's language (src/i18n), for React. English is
// bundled; another language loads on first use, and until it has, the last
// translator stays (on the first load, `ready` is false so the app can wait
// rather than flash English). After a failure the app goes on in English.
import {useEffect, useState} from 'react';
import {loadTranslator, tEn} from '../i18n/index.js';

/** @param {string} lang */
export function useTranslator(lang) {
  const [state, setState] = useState(
    /** @type {{t: import('../types.js').Translator | null, failed: string | null}} */ ({t: lang === tEn.lang ? tEn : null, failed: null}));
  useEffect(() => {
    if (state.t?.lang === lang || state.failed === lang) return undefined;
    let live = true;
    loadTranslator(lang).then(
      (t) => live && setState({t, failed: null}),
      () => live && setState((s) => ({t: s.t ?? tEn, failed: lang})),
    );
    return () => { live = false; };
  }, [lang, state.t, state.failed]);
  return {t: state.t ?? tEn, ready: state.t !== null};
}
