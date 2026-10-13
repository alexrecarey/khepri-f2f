// The WebP for a crest too heavy to serve as SVG (config.mjs WEBP_OVER_BYTES).
// Drawn with resvg at WEBP_PX, the widest a crest needs (the setup card's
// crest at 3x and room to spare), then encoded by ImageMagick, and checked
// against the SVG pixel by pixel like verify.mjs checks an optimized SVG.
import {Resvg} from '@resvg/resvg-js';
import {magick} from './optimize.mjs';

export const WEBP_PX = 512;
// Lossless: crests are mostly flat colour, where lossless WebP is both exact
// and smaller than lossy (Oct 2026: Squalos 13 KB lossless vs 26 KB at q82).

const draw = (svg, px) => new Resvg(svg, {fitTo: {mode: 'width', value: px}, background: 'rgba(0,0,0,0)'}).render();

// -> {webp: Buffer, diff}: diff is the RMS difference (0..1) between the
// WebP decoded and the SVG drawn, both at WEBP_PX. Lossless, so it should be
// ~0; checked anyway, like every other change to a crest.
export async function crestWebp(svg) {
  const ref = draw(svg, WEBP_PX);
  const webp = await magick(['png:-', '-define', 'webp:lossless=true', '-define', 'webp:method=6', 'webp:-'], ref.asPng());
  // ImageMagick builds without WebP write something else silently.
  if (webp.subarray(0, 4).toString() !== 'RIFF' || webp.subarray(8, 12).toString() !== 'WEBP') {
    throw new Error('ImageMagick did not write a WebP (no WebP support in this build?)');
  }
  const back = await magick(['webp:-', '-depth', '8', 'rgba:-'], webp);
  // resvg's pixels have alpha multiplied in, ImageMagick's don't.
  const a = ref.pixels;
  if (back.length !== a.length) return {webp, diff: 1};
  let sum = 0;
  for (let i = 0; i < a.length; i += 4) {
    const alpha = back[i + 3] / 255;
    for (let c = 0; c < 4; c++) {
      const b = c === 3 ? back[i + 3] : back[i + c] * alpha;
      const d = (a[i + c] - b) / 255;
      sum += d * d;
    }
  }
  return {webp, diff: Math.sqrt(sum / a.length)};
}
