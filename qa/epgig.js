// 動画のネタがステージの出来事に（B-40）：最新の動画の題名から最初のおしごとを選ぶ（了解です → 電話のおつかい）、お知らせに題名、点は 1.5 倍、2回目からはいつもどおり。feed の gig があればそちら
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900); await p.click('#btnStart'); await p.waitForTimeout(700);
  const r = await p.evaluate(() => { const D = window.__hayDash, G = D.G, ev = D.ev;
    ev("FEED = Object.assign({}, FEED || {}, { latest: { date: '2026-11-08', ja: '了解です', en: 'Roger that', url: 'https://www.youtube.com/shorts/x' } })");
    const first = ev('epGig()'); G.epGigDone = 0; G.gigLast = ''; ev('gigStart()'); const g1 = Object.assign({}, G.gig), msg = document.getElementById('banner').textContent;
    const s0 = G.score; ev('gigEnd(true)'); const pts = G.score - s0; ev('gigStart()'); const g2 = Object.assign({}, G.gig); ev('gigEnd(false)');
    ev("FEED.latest.gig = 'rain'"); const forced = ev('epGig()'); ev("FEED.latest = { date: '2026-11-08', ja: 'ねこ', url: 'https://www.youtube.com/shorts/y' }"); const none = ev('epGig()');
    return { first, g1k: g1.k, g1ep: g1.ep, msg, pts, g2ep: g2.ep, forced: forced && forced.k, none, ml: D.SV.mlevel }; });
  console.log(JSON.stringify(r));
  const ok = r.first && r.first.k === 'call' && r.g1k === 'call' && r.g1ep === 1 && /了解です/.test(r.msg) && r.pts === Math.round(500 * r.ml * 1.5) && r.g2ep === 0 && r.forced === 'rain' && r.none === null;
  console.log(ok && !errs.length ? 'EPGIG OK' : 'EPGIG NG ' + errs.join(' | ')); await b.close();
})();
