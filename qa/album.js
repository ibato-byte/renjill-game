// 自己ベストの記念写真（B-19）と、牧草で育つ観葉植物（B-12）
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', 1); localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, best: 600, totals: { hay: 2500 } })); } });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200);
  const r = {}; r.plant = await p.evaluate(() => ({ lv: window.__hayDash.ev('plantLv()'), saved: window.__hayDash.SV.plantLv }));
  await p.click('#btnStart'); await p.waitForTimeout(1200);
  await p.evaluate(() => { const G = window.__hayDash.G; G.invT = 99; G.score = 700; }); await p.waitForTimeout(600);
  r.pic = await p.evaluate(() => { const SV = window.__hayDash.SV; return { n: (SV.bestPics || []).length, jpg: /^data:image\/jpeg/.test(((SV.bestPics || [])[0] || {}).img || '') }; });
  await p.evaluate(() => { window.__hayDash.G.score = 950; window.__hayDash.ev("die('obstacle')"); }); await p.waitForTimeout(2500);
  await p.evaluate(() => { const D = window.__hayDash; D.ev("(() => { try { endRun && 0; } catch (e) { } })()"); }); 
  r.fixed = await p.evaluate(() => (window.__hayDash.SV.bestPics || [])[0] && window.__hayDash.SV.bestPics[0].s);
  r.panel = await p.evaluate(() => { const D = window.__hayDash; D.ev('openStamps()'); return !!document.querySelector('.album.best figure img'); });
  // 走った場所の地図（B-20）：名所が増えても、地図の位置がない名所がないこと
  r.map = await p.evaluate(() => { const D = window.__hayDash; return { missing: D.ev('STAMP_ORDER.filter(id => !MAP_PT[id])'), svg: !!document.querySelector('.tmap svg') }; });
  console.log(JSON.stringify(r));
  const ok = r.map.missing.length === 0 && r.map.svg && r.plant.lv === 2 && r.plant.saved === 2 && r.pic.n === 1 && r.pic.jpg && r.panel;
  console.log(ok && !errs.length ? 'ALBUM OK' : 'ALBUM NG ' + errs.join(' | ')); await b.close();
})();
