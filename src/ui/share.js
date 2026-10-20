// Share the current setup: the address bar always holds it (state/url.js).
// The button copies the link, nothing else: the system share sheet (Safari
// on the Mac) has no way to just copy it, and the link alone unfurls.
// A Matchup link goes out as a share link (/s, src/share/card.js) carrying
// its share card, so it unfurls on Discord and WhatsApp with the sender's
// numbers.
import {dispatch} from '../state/store.js';
import {shareUrl} from '../share/card.js';

// card: matchupShareCard(), or null (Classic).
const shareHref = (href, card) => (card ? shareUrl(href, card) : href);

export async function shareLink(card = null) {
  try {
    await navigator.clipboard.writeText(shareHref(window.location.href, card));
    dispatch({type: 'toast', text: 'Link copied'});
  } catch {
    dispatch({type: 'toast', text: 'Could not copy the link'});
  }
}
