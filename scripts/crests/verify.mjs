// Proves an optimized crest still looks like Corvus Belli's: both are drawn
// with resvg at COMPARE_PX and compared pixel by pixel (RGBA, transparency
// counts). Returns the root-mean-square difference, 0 (same) to 1.
import {Resvg} from '@resvg/resvg-js';

export const COMPARE_PX = 256;
// Above this the optimized crest is not used (the original goes up instead,
// and the run reports it). Resizing an embedded bitmap or rounding paths to
// half a pixel stays well under it.
export const MAX_DIFF = 0.02;

const render = (svg) => new Resvg(svg, {fitTo: {mode: 'width', value: COMPARE_PX}, background: 'rgba(0,0,0,0)'}).render();

export function crestDiff(original, optimized) {
  const a = render(original);
  const b = render(optimized);
  if (a.width !== b.width || a.height !== b.height) return 1;
  const pa = a.pixels;
  const pb = b.pixels;
  let sum = 0;
  for (let i = 0; i < pa.length; i++) {
    const d = (pa[i] - pb[i]) / 255;
    sum += d * d;
  }
  return Math.sqrt(sum / pa.length);
}
