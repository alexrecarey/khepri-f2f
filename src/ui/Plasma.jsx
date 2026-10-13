// The moving tint behind an empty slot: four summed sine waves on a 32×24
// canvas that the browser stretches over the card. Its own bilinear scaling
// does the blurring, so a frame is ~800 pixels of arithmetic, cheap enough
// for old phones. 30 fps, paused off screen or in a hidden tab, one still
// frame under reduced motion. No video, no WebGL.
import PropTypes from 'prop-types';
import {useEffect, useRef} from 'react';

const W = 32;
const H = 24;
const ALT = [122, 168, 255]; // the blue the side colour drifts towards

function rgbOf(el, cssVar) {
  const hex = getComputedStyle(el).getPropertyValue(cssVar).trim();
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : [154, 151, 143];
}

function draw(ctx, img, rgb, t) {
  const d = img.data;
  for (let y = 0, i = 0; y < H; y++) {
    for (let x = 0; x < W; x++, i += 4) {
      const v = Math.sin(x * 0.21 + t * 0.5) + Math.sin(y * 0.33 - t * 0.37) + Math.sin((x + y) * 0.17 + t * 0.23)
        + Math.sin(Math.hypot(x - W / 2 - 6 * Math.sin(t * 0.2), y - H / 2) * 0.3 - t * 0.45);
      const a = Math.max(0, v / 4 + 0.5);
      const k = a * a * (3 - 2 * a); // smoothstep: soft cores, no hard rims
      const m = (0.5 + 0.5 * Math.sin(x * 0.12 - t * 0.3)) * 0.35;
      d[i] = rgb[0] + (ALT[0] - rgb[0]) * m;
      d[i + 1] = rgb[1] + (ALT[1] - rgb[1]) * m;
      d[i + 2] = rgb[2] + (ALT[2] - rgb[2]) * m;
      d[i + 3] = k * 80;
    }
  }
  ctx.putImageData(img, 0, 0);
}

export default function Plasma({cssVar, seed = 0}) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext('2d');
    if (!ctx) return undefined;
    const img = ctx.createImageData(W, H);
    const rgb = rgbOf(cv, cssVar);
    let t = seed + 3;
    draw(ctx, img, rgb, t); // painted before the first animation frame
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let visible = true;
    let last = 0;
    let raf = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return;
      // Capped so a long pause (off screen, tab hidden) doesn't jump the pattern.
      t += Math.min(0.1, (now - last) / 1000);
      last = now;
      draw(ctx, img, rgb, t);
    };
    // Frames only while it can be seen: no callback every frame off screen or
    // in a hidden tab.
    const sync = () => {
      const run = visible && !document.hidden;
      if (run && !raf) raf = requestAnimationFrame(frame);
      if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
    io.observe(cv);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [cssVar, seed]);
  return <canvas ref={ref} className="slot-plasma" width={W} height={H} aria-hidden="true" />;
}

Plasma.propTypes = {cssVar: PropTypes.string.isRequired, seed: PropTypes.number};
