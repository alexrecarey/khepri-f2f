// Share the current setup: the address bar always holds it (state/url.js).
// The phone's share sheet where there is one, else copy the link.
// A Matchup link also carries its share card (src/share/card.js), so it
// unfurls on Discord and WhatsApp with the sender's numbers, and the share
// sheet gets a line of text to go with it.
import {dispatch} from '../state/store.js';
import {CARD_PARAM, encodeCard, numbersLine, shareText} from '../share/card.js';

// card: matchupShareCard(), or null (Classic); h: ui/headline.js headline().
export function shareContent(href, card, h) {
  if (card) {
    const url = new URL(href);
    url.searchParams.set(CARD_PARAM, encodeCard(card));
    return {url: url.href, text: shareText(card)};
  }
  const sides = h && {a: {n: h.text.active, l: h.label.active}, b: {n: h.text.reactive, l: h.label.reactive}};
  return {url: href, text: sides ? `Active vs Reactive: ${numbersLine(sides)}` : ''};
}

export async function shareLink(card = null, h = null) {
  const {url, text} = shareContent(window.location.href, card, h);
  try {
    if (navigator.share) {
      await navigator.share({title: 'Infinity the Calculator', text, url});
      return;
    }
    await navigator.clipboard.writeText(url);
    dispatch({type: 'toast', text: 'Link copied'});
  } catch (e) {
    // The person closed the share sheet: nothing to say.
    if (e?.name !== 'AbortError') dispatch({type: 'toast', text: 'Could not share the link'});
  }
}
