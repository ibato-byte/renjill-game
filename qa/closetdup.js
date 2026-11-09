// 着せかえの同じ見た目の品は1つだけ（2026-11-09：レンのサンタ帽が2つ並んでいた）。全員・どの行事でも、同じ見た目の品が並ばないこと
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 })); localStorage.setItem('rjFeed', JSON.stringify({ updated: '2999-01-01', events: [{ id: 'xmas', from: '2000-01-01', to: '2999-12-31' }] })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200);
  const r = await p.evaluate(() => { const D = window.__hayDash, ev = D.ev; const out = {};
    for (const who of ['ren', 'jill', 'pom']) { const l = ev(`closetList('${who}')`); const keys = l.map(c => c.slot + ':' + c.v); out[who] = { n: l.length, dup: keys.filter((k, i) => keys.indexOf(k) !== i), santa: l.filter(c => c.v === 'santa').map(c => c.id) }; }
    // owning the bought one: that one is shown, not the gift
    D.SV.closet.hat_santa_ren = 1; out.owned = ev("closetList('ren')").filter(c => c.v === 'santa').map(c => c.id); return out; });
  console.log(JSON.stringify(r));
  const ok = ['ren', 'jill', 'pom'].every(w => r[w].n > 0 && !r[w].dup.length) && r.ren.santa.length === 1 && r.ren.santa[0] === 'hat_santa_gift_ren' && r.owned.join() === 'hat_santa_ren';
  console.log(ok && !errs.length ? 'CLOSETDUP OK' : 'CLOSETDUP NG ' + errs.join(' | ')); await b.close();
})();
