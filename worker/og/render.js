// SPIKE: draw share card A (1200x630 PNG) in the Worker with satori (layout +
// text to SVG) and resvg (SVG to PNG). Crests come from R2 as SVG data URIs;
// resvg can't decode WebP, so a WebP-only crest is left out.
import satori, {init as initSatori} from 'satori/standalone';
import yoga from 'satori/yoga.wasm';
import {initWasm, Resvg} from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
import chakra600 from './fonts/ChakraPetch-SemiBold.ttf';
import chakra700 from './fonts/ChakraPetch-Bold.ttf';
import plex400 from './fonts/IBMPlexSans-Regular.ttf';
import plex600 from './fonts/IBMPlexSans-SemiBold.ttf';

const INK = '#e8e6e1', GREY = '#9a978f', BG = '#121212', A = '#5fc4a0', R = '#e59bc0';
const CH = 'Chakra Petch', PLEX = 'IBM Plex Sans';

let ready;
const setup = () => (ready ??= Promise.all([initSatori(yoga), initWasm(resvgWasm)]).catch((e) => { ready = null; throw e; }));

const FONTS = [
  {name: CH, data: chakra600, weight: 600}, {name: CH, data: chakra700, weight: 700},
  {name: PLEX, data: plex400, weight: 400}, {name: PLEX, data: plex600, weight: 600},
];

// Satori wants every div to say how it lays out its children.
const h = (type, style, ...children) => ({type, props: {style: {display: 'flex', ...style}, children: children.length === 1 ? children[0] : children}});
const one = {overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 470};

async function crestUri(env, slug) {
  if (!slug) return null;
  const o = await env.CRESTS.get(`${slug}.svg`);
  if (!o) return null;
  const b = new Uint8Array(await o.arrayBuffer());
  let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return `data:image/svg+xml;base64,${btoa(s)}`;
}

function wing(side, uri) {
  if (!uri) return null;
  const left = side === 'l';
  return [
    {type: 'img', props: {src: uri, width: 600, height: 600, style: {position: 'absolute', top: 15, [left ? 'left' : 'right']: -170, opacity: 0.4}}},
    h('div', {position: 'absolute', top: 0, bottom: 0, width: 470, [left ? 'left' : 'right']: 0,
      backgroundImage: `linear-gradient(${left ? 90 : 270}deg, rgba(18,18,18,0) 25%, ${BG} 100%)`}),
  ];
}

function column(right, colour, d) {
  const align = right ? 'flex-end' : 'flex-start';
  return h('div', {display: 'flex', flexDirection: 'column', alignItems: align, textAlign: right ? 'right' : 'left', width: 500},
    h('div', {fontFamily: CH, fontWeight: 700, fontSize: 150, lineHeight: 0.95, color: colour}, d.num),
    h('div', {fontSize: 30, color: colour, marginTop: 8}, d.label),
    h('div', {...one, fontSize: 46, fontWeight: 600, marginTop: 18, color: INK}, d.name),
    h('div', {...one, fontSize: 32, color: GREY}, d.sub));
}

export async function renderCard(env, p) {
  await setup();
  const [ca, cb] = await Promise.all([crestUri(env, p.ca), crestUri(env, p.cb)]);
  const tree = h('div', {width: 1200, height: 630, display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '44px 64px 40px', background: BG, color: INK, fontFamily: PLEX, position: 'relative'},
    ...[wing('l', ca), wing('r', cb)].flat().filter(Boolean),
    h('div', {fontFamily: CH, fontWeight: 600, fontSize: 30, letterSpacing: 3.6, color: GREY}, 'INFINITY THE CALCULATOR'),
    h('div', {display: 'flex', flexGrow: 1, width: '100%', justifyContent: 'center', alignItems: 'center', gap: 72},
      column(true, A, p.a), column(false, R, p.b)),
    h('div', {fontSize: 32, color: GREY}, p.foot));
  const svg = await satori(tree, {width: 1200, height: 630, fonts: FONTS});
  return new Resvg(svg, {fitTo: {mode: 'width', value: 1200}}).render().asPng();
}
