// Makes a Corvus Belli unit crest SVG small without changing how it looks.
// What makes their crests big (measured over all ~900, Oct 2026):
//   - embedded bitmaps far larger than the crest is ever drawn: the TAG
//     crests ("-2-1") carry ~2200 px PNGs inside an 82-unit badge, ~500 KB
//     each. We redraw them at what the crest needs at RENDER_PX wide.
//   - <image> links to files that don't exist (Illustrator leftovers like
//     "74E7A3BC.jpeg", 404 on CB's server too): never shown, so dropped.
//   - long path data and editor cruft: svgo, keeping the viewBox.
// Every candidate is checked against the source before it is used
// (verify.mjs); svgo alone changed how some crests look.
// Raster work uses ImageMagick (`magick`, or `convert` on ImageMagick 6).
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {optimize} from 'svgo';

const run = promisify(execFile);

// The widest a crest is drawn (the app shows them at 64 CSS px at most; 512
// leaves room for a 3x screen and a bigger use later).
export const RENDER_PX = 512;

let magickBin = null;
export async function magick(args, input) {
  if (!magickBin) {
    for (const bin of ['magick', 'convert']) {
      if (await run(bin, ['-version']).then(() => true, () => false)) { magickBin = bin; break; }
    }
    if (!magickBin) throw new Error('needs ImageMagick (`magick` or `convert`) on the PATH');
  }
  return new Promise((resolve, reject) => {
    const p = execFile(magickBin, args, {encoding: 'buffer', maxBuffer: 64 * 1024 * 1024}, (err, stdout) => (err ? reject(err) : resolve(stdout)));
    if (input) p.stdin.end(input); else p.stdin.end();
  });
}

const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] ?? null;

// How much a transform scales x: matrix(a b c d e f) -> |(a, b)|, scale(s ...) -> s.
function scaleX(transform) {
  if (!transform) return 1;
  let s = 1;
  for (const [, fn, args] of transform.matchAll(/(matrix|scale)\(([^)]*)\)/g)) {
    const n = args.trim().split(/[\s,]+/).map(Number);
    s *= fn === 'matrix' ? Math.hypot(n[0], n[1]) : n[0];
  }
  return s;
}

const IMAGE = /<image\b[^>]*?(?:\/>|>(?:\s*<\/image>)?)/g;

function dropBrokenImages(svg, notes) {
  return svg.replace(IMAGE, (tag) => {
    const href = attr(tag, 'xlink:href') ?? attr(tag, 'href');
    if (href && !href.startsWith('data:') && !/^https?:/.test(href)) {
      notes.push(`dropped missing image ${href}`);
      return '';
    }
    return tag;
  });
}

async function shrinkRasters(svg, notes) {
  const root = /<svg\b[^>]*>/.exec(svg)?.[0] ?? '';
  const vbWidth = Number((attr(root, 'viewBox') ?? '').split(/[\s,]+/)[2]) || null;
  if (!vbWidth) return svg;
  const tags = [...svg.matchAll(IMAGE)].map((m) => m[0]);
  let out = svg;
  for (const tag of tags) {
    const href = attr(tag, 'xlink:href') ?? attr(tag, 'href');
    const m = href && /^data:image\/(png|jpe?g|webp);base64,(.*)$/s.exec(href);
    if (!m) continue;
    const raw = Buffer.from(m[2].replace(/\s/g, ''), 'base64');
    const drawn = Number(attr(tag, 'width')) * scaleX(attr(tag, 'transform'));
    const needPx = Math.ceil((drawn / vbWidth) * RENDER_PX);
    const [pxW] = String(await magick(['-', '-format', '%w %h', 'info:'], raw)).split(' ').map(Number);
    if (!needPx || pxW <= needPx * 1.1) continue;
    // Same format back: PNG and JPEG work in every SVG renderer (WebP
    // doesn't, e.g. resvg, which verify.mjs uses).
    const jpeg = m[1].startsWith('jp');
    const small = await magick(['-', '-resize', `${needPx}x`, ...(jpeg ? ['-quality', '85', 'jpeg:-'] : ['-define', 'png:compression-level=9', 'png:-'])], raw);
    if (small.length >= raw.length) continue;
    const next = `data:image/${jpeg ? 'jpeg' : 'png'};base64,${small.toString('base64')}`;
    out = out.replace(tag, tag.replace(href, next));
    notes.push(`image ${pxW}px -> ${needPx}px, ${Math.round(raw.length / 1000)} -> ${Math.round(small.length / 1000)} KB`);
  }
  return out;
}

// svgo settings, most savings first. floatPrecision also rounds transform
// matrices (CB's are like matrix(.2333 0 0 .2333 ...)), so fewer than 2
// decimals visibly moves things; 3 is the fallback for crests where 2 does.
const SVGO_DECIMALS = [2, 3];

const svgo = (svg, floatPrecision) => optimize(svg, {
  multipass: true,
  floatPrecision,
  plugins: [{name: 'preset-default', params: {overrides: {removeViewBox: false}}}],
}).data;

// Candidates for a crest, smallest first, each to be checked by the caller
// (verify.mjs) against the source; the last is the source itself.
//   {svg, how, notes}
export async function crestCandidates(source) {
  const notes = [];
  let fixed = dropBrokenImages(source, notes);
  fixed = await shrinkRasters(fixed, notes);
  const out = [];
  for (const d of SVGO_DECIMALS) {
    // svgo 3.3 can throw in convertPathData on odd paths: skip that try.
    try { out.push({svg: svgo(fixed, d), how: `svgo ${d} decimals`, notes}); } catch { /* next */ }
  }
  out.push({svg: fixed, how: notes.length ? 'images fixed, no svgo' : 'no svgo', notes});
  out.push({svg: source, how: 'original', notes: []});
  return out;
}
