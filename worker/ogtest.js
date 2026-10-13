// TEST ONLY (branch og-test, never merged): link-preview experiments for
// Discord and WhatsApp. /og-test/ lists the cases; /og-test/<case>/ is a page
// whose only job is its preview tags; /og-test/ua/ puts the fetcher's
// User-Agent into the preview itself, so the chat app shows who asked.
// Images are static files under public/og-test/img/.

const IMG = {
  wide: ['wide.png', 1200, 630, 'image/png'],
  nosize: ['wide-nosize.png', 1200, 630, 'image/png'],
  jpg: ['wide.jpg', 1200, 630, 'image/jpeg'],
  webp: ['wide.webp', 1200, 630, 'image/webp'],
  mid: ['mid.png', 1200, 630, 'image/png'],
  heavy: ['heavy.png', 1200, 630, 'image/png'],
  small: ['small.png', 600, 315, 'image/png'],
  square: ['square.png', 1200, 1200, 'image/png'],
  b: ['wide-b.png', 1200, 630, 'image/png'],
};

const GREEN = '#5fc4a0', PINK = '#e59bc0';
const TITLE = 'Squalos Mk-II vs Zhanshi';
const DESC = '0.81 vs 0.46 wounds per order · 16–24″ · HMG, Surprise attack vs Missile L. in Cover, Fireteam 5';

// id -> what it tests. img: key of IMG; large: twitter:card summary_large_image;
// size: og:image:width/height/type tags.
const CASES = [
  {id: '1', img: 'wide', large: true, size: true, what: 'Baseline: 1200×630 PNG, 190 KB, size tags, twitter large-image card'},
  {id: '2', img: 'wide', large: false, size: true, what: 'Same, without the twitter large-image tag (Discord: small thumbnail?)'},
  {id: '3', img: 'nosize', large: true, size: false, what: 'Same PNG, no og:image:width/height tags'},
  {id: '4', img: 'jpg', large: true, size: true, what: 'JPEG, 84 KB'},
  {id: '5', img: 'webp', large: true, size: true, what: 'WebP, 45 KB'},
  {id: '6', img: 'mid', large: true, size: true, what: 'PNG, 1.15 MB (size cap?)'},
  {id: '7', img: 'heavy', large: true, size: true, what: 'PNG, 1.65 MB (size cap?)'},
  {id: '8', img: 'small', large: true, size: true, what: '600×315 PNG (too small for the big preview?)'},
  {id: '9', img: 'square', large: true, size: true, stripe: PINK, what: 'Square 1200×1200 (option D); Discord stripe pink'},
  {id: '10', img: 'b', large: true, size: true, what: 'Option B, square-safe centre: how does the small WhatsApp thumbnail crop it?'},
  {id: '11', img: 'wide', large: true, size: true, short: true, what: 'Baseline image with a short title and one-line description'},
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function previewPage(origin, c, title, desc) {
  const [file, w, h, type] = IMG[c.img];
  const img = `${origin}/og-test/img/${file}`;
  const tags = [
    ['property', 'og:site_name', 'Infinity the Calculator'],
    ['property', 'og:type', 'website'],
    ['property', 'og:url', `${origin}/og-test/${c.id}/`],
    ['property', 'og:title', title],
    ['property', 'og:description', desc],
    ['property', 'og:image', img],
    ['property', 'og:image:secure_url', img],
    ...(c.size ? [['property', 'og:image:type', type], ['property', 'og:image:width', w], ['property', 'og:image:height', h]] : []),
    ['property', 'og:image:alt', 'Squalos Mk-II 0.81 vs Zhanshi 0.46 wounds per order'],
    ...(c.large ? [['name', 'twitter:card', 'summary_large_image']] : []),
    ['name', 'theme-color', c.stripe || GREEN],
  ];
  const meta = tags.map(([k, n, v]) => `<meta ${k}="${n}" content="${esc(v)}">`).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${meta}
</head><body style="font-family:system-ui,sans-serif;background:#121212;color:#e8e6e1;padding:24px">
<p>Link-preview test ${esc(c.id)}: ${esc(c.what)}</p>
<p><img src="/og-test/img/${file}" alt="" style="max-width:100%"></p>
<p><a style="color:${GREEN}" href="/og-test/">All tests</a></p>
</body></html>`;
}

function listPage(origin) {
  const all = [...CASES, {id: 'ua', what: 'Shows the app’s User-Agent as the preview title (can the Worker tell Discord from WhatsApp?)'}];
  const rows = all.map(c => {
    const url = `${origin}/og-test/${c.id}/`;
    return `<li><b>${esc(c.id)}</b> · ${esc(c.what)}<br>
<code>${esc(url)}</code><br>
<button data-url="${esc(url)}" class="copy">Copy</button> <button data-url="${esc(url)}" class="share">Share…</button></li>`;
  }).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Link-preview tests</title>
<style>body{font-family:system-ui,sans-serif;background:#121212;color:#e8e6e1;padding:16px;max-width:720px;margin:auto;line-height:1.4}
li{margin:0 0 18px}code{font-size:13px;color:#9a978f;word-break:break-all}
button{font:inherit;padding:8px 14px;margin-top:6px;border-radius:8px;border:1px solid #5fc4a0;background:#1c1c1c;color:#e8e6e1}</style>
</head><body>
<h1 style="font-size:22px">Link-preview tests</h1>
<p>Paste each link into Discord and WhatsApp and note what you get: <b>big</b> image, <b>small</b> thumbnail, or <b>no</b> image.
The apps cache per link: to retry one, add <code>?2</code>, <code>?3</code>… to the end.</p>
<ol style="padding-left:18px;list-style:none">${rows}</ol>
<script>
for (const b of document.querySelectorAll('button')) b.onclick = async () => {
  const url = b.dataset.url;
  try {
    if (b.classList.contains('share') && navigator.share) await navigator.share({url});
    else { await navigator.clipboard.writeText(url); b.textContent = 'Copied'; }
  } catch (e) {}
};
</script>
</body></html>`;
}

const html = body => new Response(body, {headers: {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store'}});

export function ogTest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path.startsWith('/og-test/img/')) return env.ASSETS.fetch(request);
  if (path === '/og-test' || path === '/og-test/') return html(listPage(url.origin));
  const id = path.match(/^\/og-test\/([^/]+)\/?$/)?.[1];
  if (id === 'ua') {
    const ua = request.headers.get('user-agent') || '(none)';
    // Logged too, for `wrangler tail`.
    console.log('og-test ua', ua);
    return html(previewPage(url.origin, {...CASES[0], id: 'ua', what: 'User-Agent echo'}, ua, `User-Agent: ${ua}`));
  }
  const c = CASES.find(x => x.id === id);
  if (!c) return new Response('Not found', {status: 404});
  return c.short
    ? html(previewPage(url.origin, c, 'Squalos vs Zhanshi: 0.81 – 0.46', 'Wounds per order at 16–24″'))
    : html(previewPage(url.origin, c, TITLE, DESC));
}
