// offline play: the game and its icons are kept on the device; fonts are cached the first time they load
const CACHE = 'haydash-29d1353253';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'config.js', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png', './favicon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('haydash-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url); if (e.request.method !== 'GET') return;
  if (/googleapis\.com$/.test(u.hostname) && !/^fonts\./.test(u.hostname)) return; // the ranking: always live
  if (u.origin === location.origin && (e.request.mode === 'navigate' || u.pathname.endsWith('/index.html') || u.pathname.endsWith('/config.js'))) { // the game page: newest when online, cached when not
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))); return; }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; })));
});
