/* Service worker Nabire Kreatif — cache ringan agar aplikasi (PWA) cepat dibuka.
   Data dari Google Apps Script TIDAK pernah di-cache di sini (selalu langsung ke server). */
const V = 'nk-9c6cb167';
const CORE = ['./', 'index.html', 'dist/nk.min.css?v=9c6cb167', 'dist/nk.min.js?v=9c6cb167', 'js/config.js?v=9c6cb167', 'assets/icon-192.png', 'assets/logo-icon.png', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => { })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin) return;
  if (r.mode === 'navigate') { e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put('index.html', c)); return res; }).catch(() => caches.match('index.html').then(m => m || caches.match('./')))); return; }
  if (/\/(dist|assets|js|sdk)\//.test(u.pathname)) e.respondWith(caches.open(V).then(c => c.match(r).then(m => { const f = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => m); return m || f; })));
});
