// The share card image (canvas Final, "Share card"; design option A): a
// 1200x630 PNG drawn per link from its ?card= (src/share/card.js). satori
// lays the card out as SVG, resvg turns that into a PNG. Both apps show
// 1200x630 PNGs big, even over a megabyte (PR #50's tests).
//
// satori stays at 0.32: later releases shape text with harfbuzzjs, which
// can't load its wasm inside a Worker.
import satori, {init as initSatori} from 'satori/standalone';
import yoga from 'satori/yoga.wasm';
import {initWasm, Resvg} from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
import {detailLine, footerLine} from '../src/share/card.js';
import chakra600 from './fonts/ChakraPetch-SemiBold.ttf';
import chakra700 from './fonts/ChakraPetch-Bold.ttf';
import plex400 from './fonts/IBMPlexSans-Regular.ttf';
import plex600 from './fonts/IBMPlexSans-SemiBold.ttf';

export const CARD_W = 1200;
export const CARD_H = 630;

// The app's tokens (src/ui/styles/tokens.css): the side colours are fixed.
const INK = '#e8e6e1', GREY = '#9a978f', BG = '#121212', ACTIVE = '#5fc4a0', REACTIVE = '#e59bc0';
const CHAKRA = 'Chakra Petch', PLEX = 'IBM Plex Sans';

const FONTS = [
  {name: CHAKRA, data: chakra600, weight: 600}, {name: CHAKRA, data: chakra700, weight: 700},
  {name: PLEX, data: plex400, weight: 400}, {name: PLEX, data: plex600, weight: 600},
];

// Both wasm modules start once per isolate; a failed start is retried next time.
let ready = null;
const setup = () => (ready ??= Promise.all([initSatori(yoga), initWasm(resvgWasm)]).catch((e) => {
  ready = null;
  throw e;
}));

// Satori wants every div to say how it lays out its children.
const div = (style, ...children) => ({type: 'div', props: {style: {display: 'flex', ...style}, children: children.length === 1 ? children[0] : children}});
const oneLine = {overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500};

// The unit crest as a data URI, or null. resvg can't read WebP, so the few
// crests R2 holds as WebP (scripts/crests) are left out, as are missing ones.
async function crestUri(env, slug) {
  if (!slug) return null;
  const object = await env.CRESTS.get(`${slug}.svg`);
  if (!object) return null;
  const bytes = new Uint8Array(await object.arrayBuffer());
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:image/svg+xml;base64,${btoa(s)}`;
}

// A crest at the card's edge in its own colours, fading toward the middle.
function wing(edge, uri) {
  if (!uri) return [];
  return [
    {type: 'img', props: {src: uri, width: 600, height: 600, style: {position: 'absolute', top: 15, [edge]: -170, opacity: 0.4}}},
    div({position: 'absolute', top: 0, bottom: 0, width: 470, [edge]: 0,
      backgroundImage: `linear-gradient(${edge === 'left' ? 90 : 270}deg, rgba(18,18,18,0) 25%, ${BG} 100%)`}),
  ];
}

// One side: number, its label, unit, weapon and situation, flush toward the middle.
function column(x, colour, towardRight) {
  return div({flexDirection: 'column', alignItems: towardRight ? 'flex-end' : 'flex-start', width: 500},
    div({fontFamily: CHAKRA, fontWeight: 700, fontSize: 150, lineHeight: 0.95, color: colour}, x.n),
    div({fontSize: 30, color: colour, marginTop: 8}, x.l),
    div({...oneLine, fontSize: 46, fontWeight: 600, marginTop: 18, color: INK}, x.u),
    div({...oneLine, fontSize: 32, color: GREY}, detailLine(x)));
}

// card: decodeCard()'s result. Returns the PNG's bytes.
export async function renderCard(env, card) {
  await setup();
  const [crestA, crestB] = await Promise.all([crestUri(env, card.a.c), crestUri(env, card.b.c)]);
  const tree = div({width: CARD_W, height: CARD_H, flexDirection: 'column', alignItems: 'center',
    padding: '44px 64px 40px', background: BG, color: INK, fontFamily: PLEX, position: 'relative'},
  ...wing('left', crestA), ...wing('right', crestB),
  div({fontFamily: CHAKRA, fontWeight: 600, fontSize: 30, letterSpacing: 3.6, color: GREY}, 'INFINITY THE CALCULATOR'),
  div({flexGrow: 1, width: '100%', justifyContent: 'center', alignItems: 'center', gap: 72},
    column(card.a, ACTIVE, true), column(card.b, REACTIVE, false)),
  div({fontSize: 32, color: GREY}, footerLine(card)));
  const svg = await satori(tree, {width: CARD_W, height: CARD_H, fonts: FONTS});
  return new Resvg(svg, {fitTo: {mode: 'width', value: CARD_W}}).render().asPng();
}

// The site's own image, for links without a card (index.html's tags).
export async function renderDefault() {
  await setup();
  const stripe = (colour, width) => div({width, height: 14, background: colour});
  const tree = div({width: CARD_W, height: CARD_H, flexDirection: 'column', justifyContent: 'center',
    padding: '0 96px', gap: 28, background: BG, color: INK, fontFamily: PLEX},
  div({fontFamily: CHAKRA, fontWeight: 700, fontSize: 96, lineHeight: 1}, 'Infinity the Calculator'),
  div({fontSize: 46, color: GREY}, 'Face-to-face odds for Infinity N5'),
  div({width: 640, marginTop: 24, borderRadius: 7, overflow: 'hidden'},
    stripe(ACTIVE, 300), stripe('#2e2e2e', 140), stripe(REACTIVE, 200)));
  const svg = await satori(tree, {width: CARD_W, height: CARD_H, fonts: FONTS});
  return new Resvg(svg, {fitTo: {mode: 'width', value: CARD_W}}).render().asPng();
}
