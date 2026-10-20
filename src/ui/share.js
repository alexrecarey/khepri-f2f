// Share the current setup: the address bar always holds it (state/url.js),
// so the button copies that, nothing else: the system share sheet (Safari
// on the Mac) has no way to just copy it. The address unfurls on its own
// with the matchup's numbers and headline (worker/preview.js).
import {dispatch} from '../state/store.js';

// t: the toast's language (src/i18n).
export async function shareLink(t) {
  try {
    await navigator.clipboard.writeText(window.location.href);
    dispatch({type: 'toast', text: t('share.copied')});
  } catch {
    dispatch({type: 'toast', text: t('share.failed')});
  }
}
