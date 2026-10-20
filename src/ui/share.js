// Share the current setup: the address bar always holds it (state/url.js),
// so the button copies that, nothing else: the system share sheet (Safari
// on the Mac) has no way to just copy it. The address unfurls on its own
// with the matchup's numbers (worker/preview.js), showing the headline the
// sender picked when it isn't the links' default.
import {dispatch} from '../state/store.js';
import {HEADLINE_PARAM, LINK_HEADLINE} from '../share/card.js';

// href: the app address; choice: the player's headline (ui/headline.js).
export function shareHref(href, choice) {
  const url = new URL(href);
  if (choice && choice !== LINK_HEADLINE) url.searchParams.set(HEADLINE_PARAM, choice);
  return url.href;
}

export async function shareLink(choice) {
  try {
    await navigator.clipboard.writeText(shareHref(window.location.href, choice));
    dispatch({type: 'toast', text: 'Link copied'});
  } catch {
    dispatch({type: 'toast', text: 'Could not copy the link'});
  }
}
