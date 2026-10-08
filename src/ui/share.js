// Share the current setup: the address bar always holds it (state/url.js).
// The phone's share sheet where there is one, else copy the link.
import {dispatch} from '../state/store.js';

export async function shareLink() {
  const url = window.location.href;
  try {
    if (navigator.share) {
      await navigator.share({title: 'Infinity the Calculator', url});
      return;
    }
    await navigator.clipboard.writeText(url);
    dispatch({type: 'toast', text: 'Link copied'});
  } catch (e) {
    // The person closed the share sheet: nothing to say.
    if (e?.name !== 'AbortError') dispatch({type: 'toast', text: 'Could not share the link'});
  }
}
