// Full-screen pages (the trooper picker) must fit the part of the screen the
// keyboard leaves. position: fixed follows the layout viewport, which the
// keyboard doesn't shrink on iOS (or on Android Chrome by default): the
// browser scrolls the document instead to show the focused input, pushing
// the page header off screen, and doesn't always scroll back when the
// keyboard closes, hiding the search box. So while a page is open:
//   - --vv-top / --vv-height follow window.visualViewport, and .page uses them;
//   - the document behind is pinned in place (body position: fixed, its scroll
//     kept and restored on close). overflow: hidden alone doesn't stop iOS
//     scrolling it: with the keyboard opening on the picker's first frame, the
//     document took the swipes and the list didn't scroll until the keyboard
//     was closed once;
//   - when the visible area changes (keyboard up or down), the page's scroll
//     area is nudged so iOS picks it up as scrollable again;
//   - with the keyboard up the page is taller than what's visible, and iOS
//     pans the view over it on any drag the list doesn't take (the header slid
//     off, the screen behind showed under the search box, and the list never
//     scrolled). So a drag is cancelled unless it scrolls something that can
//     still scroll that way: the list up and down, the chip row sideways.
import {useEffect, useLayoutEffect} from 'react';
import {DEV_TOOLS} from '../devTools.js';

let touchStart = null;

const scrolls = (el, axis) => {
  const style = getComputedStyle(el);
  const o = axis === 'y' ? style.overflowY : style.overflowX;
  if (o !== 'auto' && o !== 'scroll') return false;
  return axis === 'y' ? el.scrollHeight > el.clientHeight + 1 : el.scrollWidth > el.clientWidth + 1;
};

// Can `el` or one of its ancestors scroll by this drag (d > 0: finger moves
// down / right, so the content scrolls back toward its start)?
function canScroll(el, axis, d) {
  for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    if (!scrolls(el, axis)) continue;
    const pos = axis === 'y' ? el.scrollTop : el.scrollLeft;
    const max = axis === 'y' ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
    if (d > 0 ? pos > 0 : pos < max - 1) return true;
  }
  return false;
}

function onTouchStart(e) {
  const t = e.touches[0];
  touchStart = e.touches.length === 1 ? {x: t.clientX, y: t.clientY} : null;
}

function onTouchMove(e) {
  if (!touchStart || e.touches.length !== 1) return; // pinch zoom stays
  const t = e.touches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  const axis = Math.abs(dy) >= Math.abs(dx) ? 'y' : 'x';
  const ok = canScroll(e.target, axis, axis === 'y' ? dy : dx);
  if (window.__touchDebug) {
    const pb = document.querySelector('.page-body');
    const vv = window.visualViewport;
    window.__touchDebug(`${ok ? 'allow' : 'BLOCK'} ${axis} dx${Math.round(dx)} dy${Math.round(dy)} t=${e.target.className}`
      + ` | body st${pb?.scrollTop} sh${pb?.scrollHeight} ch${pb?.clientHeight} ov${pb && getComputedStyle(pb).overflowY}`
      + ` | vv h${Math.round(vv?.height)} top${Math.round(vv?.offsetTop)} inner${innerHeight} sy${scrollY}`);
  }
  if (!ok && e.cancelable) e.preventDefault();
}

// ?debug=touch: a readout of the drag guard's decisions, for phone testing
// (dev and previews only).
if (DEV_TOOLS && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === 'touch') {
  const box = document.createElement('pre');
  box.style.cssText = 'position:fixed;left:0;right:0;top:40px;z-index:999;margin:0;padding:6px;font:10px/1.3 monospace;color:#0f0;background:rgba(0,0,0,.8);pointer-events:none;white-space:pre-wrap;max-height:40vh;overflow:hidden';
  const lines = [];
  window.__touchDebug = (line) => { lines.unshift(line); lines.length = Math.min(lines.length, 8); box.textContent = lines.join('\n'); };
  window.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  if (document.body) document.body.appendChild(box);
}

let users = 0;
let savedScroll = 0;

function nudgeScrollers() {
  for (const el of document.querySelectorAll('.page-body')) {
    const top = el.scrollTop;
    el.style.overflowY = 'hidden';
    void el.offsetHeight; // force the layout with scrolling off...
    el.style.overflowY = '';
    el.scrollTop = top;   // ...then back on, where it was
  }
}

function update() {
  const vv = window.visualViewport;
  // Tapping the search box (not the picker focusing it on open) makes Safari
  // scroll the view to show it above the keyboard, measured while the page is
  // still full height; once the page shrinks to fit, that scroll left the
  // search box at the top with the header and list gone and blank space
  // below. The page already fits the visible area, so put the view back.
  if (users > 0 && (window.scrollY !== 0 || (vv && vv.offsetTop !== 0))) window.scrollTo(0, 0);
  const root = document.documentElement.style;
  root.setProperty('--vv-top', `${vv ? vv.offsetTop : 0}px`);
  root.setProperty('--vv-height', `${vv ? vv.height : window.innerHeight}px`);
  if (window.__touchDebug) window.__touchDebug(`vv h${Math.round(vv?.height)} top${Math.round(vv?.offsetTop)} sy${window.scrollY}`);
}

function onResize() {
  update();
  nudgeScrollers();
}

function lockDocument() {
  savedScroll = window.scrollY;
  const b = document.body.style;
  // top 0, not -scroll: on phones the screen behind is hidden while a page
  // is open (app.css), so there's nothing to keep in place; the scroll comes
  // back on close.
  Object.assign(b, {position: 'fixed', top: '0', left: '0', right: '0', width: '100%'});
  document.documentElement.classList.add('page-open');
  document.addEventListener('touchstart', onTouchStart, {passive: true});
  document.addEventListener('touchmove', onTouchMove, {passive: false});
}

function unlockDocument() {
  const b = document.body.style;
  Object.assign(b, {position: '', top: '', left: '', right: '', width: ''});
  document.documentElement.classList.remove('page-open');
  document.removeEventListener('touchstart', onTouchStart);
  document.removeEventListener('touchmove', onTouchMove);
  window.scrollTo(0, savedScroll);
}

export default function useVisualViewport() {
  // Before paint, and before the picker focuses its search box (a plain
  // useEffect runs after every layout effect), so the document is already
  // pinned when the keyboard comes up.
  useLayoutEffect(() => {
    users += 1;
    if (users === 1) lockDocument();
    update();
    return () => {
      users -= 1;
      if (users === 0) unlockDocument();
    };
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    vv?.addEventListener('resize', onResize);
    vv?.addEventListener('scroll', update);
    window.addEventListener('resize', onResize);
    return () => {
      vv?.removeEventListener('resize', onResize);
      vv?.removeEventListener('scroll', update);
      window.removeEventListener('resize', onResize);
    };
  }, []);
}
