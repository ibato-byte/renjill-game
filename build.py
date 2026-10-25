import glob, os
os.makedirs("dist", exist_ok=True); os.makedirs("app", exist_ok=True)
head=open('src/head.html').read(); body=open('src/body.html').read()
js='\n'.join(open(f).read() for f in sorted(glob.glob('src/*.js')))
import re
script='<script>\n(()=>{\n'+js+'\n})();\n</script>\n'
# the published page ships without the test hooks (they would let anyone fake a ranking score)
rel_js=re.sub(r'/\*TEST-ONLY\*/.*?/\*END-TEST-ONLY\*/', '', js, flags=re.S)
assert rel_js != js, 'test hooks not found'
rel_script='<script>\n(()=>{\n'+rel_js+'\n})();\n</script>\n'
open('dist/hay-dash.html','w').write(head+body+rel_script)
open('dist/test.html','w').write('<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+head+'</head><body>'+body+script+'</body></html>')
print(len(head+body+script))

# ---- the app (PWA): a folder to put on any static host; installable, plays offline ----
import os, json, hashlib
pass
ver = hashlib.sha1((head + body + rel_js).encode()).hexdigest()[:10]
app_head = ('<!doctype html><html lang="ja"><head><meta charset="utf-8">'
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  '<meta name="theme-color" content="#3B2A20"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">'
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="チモシーダッシュ">'
  '<meta name="description" content="うさぎの課長レンと部下ジルが、チモシーを集めながら東京をかけぬけるランゲーム">'
  '<meta property="og:type" content="website"><meta property="og:site_name" content="レンとジル Ren &amp; Jill">'
  '<meta property="og:title" content="レンとジルのチモシーダッシュ｜Ren &amp; Jill: Hay Dash">'
  '<meta property="og:description" content="うさぎの課長レンと部下ジルが、チモシーを集めながら東京をかけぬける無料のランゲーム。Two office bunnies, one mad dash across Tokyo. Free to play.">'
  '<meta property="og:url" content="https://renjill-hay-dash.pages.dev/"><meta property="og:image" content="https://renjill-hay-dash.pages.dev/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
  '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="レンとジルのチモシーダッシュ｜Ren &amp; Jill: Hay Dash"><meta name="twitter:image" content="https://renjill-hay-dash.pages.dev/og.png">'
  '<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="./apple-touch-icon.png"><link rel="icon" href="./favicon.png">'
  '<style>html,body{margin:0;height:100%;background:#3B2A20;overscroll-behavior:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>'
  '<script>window.HAYDASH_APP=1</script><script src="config.js"></script>')
app_sw_reg = ('<script>if("serviceWorker" in navigator&&location.protocol!=="file:")addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));</script>')
open('app/index.html','w').write(app_head + head + '</head><body>' + body + rel_script + app_sw_reg + '</body></html>')
manifest = { "name": "レンとジルのチモシーダッシュ", "short_name": "チモシーダッシュ", "description": "うさぎの課長レンと部下ジルが、チモシーを集めながら東京をかけぬけるランゲーム",
  "lang": "ja", "start_url": "./", "scope": "./", "display": "standalone", "orientation": "any", "background_color": "#3B2A20", "theme_color": "#3B2A20",
  "icons": [{ "src": "./icon-192.png", "sizes": "192x192", "type": "image/png" }, { "src": "./icon-512.png", "sizes": "512x512", "type": "image/png" },
            { "src": "./maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }], "categories": ["games"] }
open('app/manifest.webmanifest','w').write(json.dumps(manifest, ensure_ascii=False, indent=1))
open('app/sw.js','w').write('''// offline play: the game and its icons are kept on the device; fonts are cached the first time they load
const CACHE = 'haydash-%s';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'config.js', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png', './favicon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('haydash-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url); if (e.request.method !== 'GET') return;
  if (/googleapis\\.com$/.test(u.hostname) && !/^fonts\\./.test(u.hostname)) return; // the ranking: always live
  if (u.origin === location.origin && (e.request.mode === 'navigate' || u.pathname.endsWith('/index.html') || u.pathname.endsWith('/config.js'))) { // the game page: newest when online, cached when not
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))); return; }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; })));
});
''' % ver)
if not os.path.exists('app/config.js'):
  open('app/config.js','w').write('''// ランキングを使うときだけ、Firebase の「ウェブアプリ」の設定から apiKey と projectId を貼り付けてください（README.md 参照）。
// 空のままでもゲームはすべて遊べます（ランキングだけ「準備中」になります）。
window.HAYDASH_CONFIG = {
  firebase: { apiKey: '', projectId: '' },
  url: ''   // 公開したアプリのURL（シェアの文面に入ります）。空なら今開いているURLを使います
};
''')
open('app/firestore.rules','w').write('''rules_version = '2';
// ranking rules: anyone can read the board; each device (an anonymous account) can only write its own row, with sane values
service cloud.firestore {
  match /databases/{database}/documents {
    match /ranks/{uid} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == uid
        && request.resource.data.keys().size() <= 60
        && (!('nick' in request.resource.data) || (request.resource.data.nick is string && request.resource.data.nick.size() <= 12))
        && (!('all' in request.resource.data) || (request.resource.data.all is int && request.resource.data.all >= 0 && request.resource.data.all < 50000000));
    }
  }
}
''')
print('app', ver)
