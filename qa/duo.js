// ふたりで交代（B-33）：題名のボタン → 1P が走って結果に「次は 2P」→ 2P が走って合計と勝ち負け → もう一回はふつうに戻る。ランキングには入れない
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', 1); localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900);
  const r = {}; r.btn = await p.evaluate(() => { const q = document.getElementById('btnDuo'); return !!q && !q.hidden; });
  const end = async sc => { await p.evaluate(sc => { const D = window.__hayDash; D.G.score = sc; D.ev("G.cause = 'quit'; G.mode = 'dead'; endRun()"); }, sc); await p.waitForTimeout(700); return p.evaluate(() => ({ duo: document.getElementById('resDuo') ? document.getElementById('resDuo').textContent : '', hidden: document.getElementById('resDuo') ? document.getElementById('resDuo').hidden : true, again: document.getElementById('btnAgain').textContent, rank: window.__hayDash.ev('!!(G.duo)') })); };
  await p.click('#btnDuo'); await p.waitForTimeout(800); r.t1 = await p.evaluate(() => window.__hayDash.G.duo && window.__hayDash.G.duo.turn);
  r.r1 = await end(1200);
  await p.click('#btnAgain'); await p.waitForTimeout(800); r.t2 = await p.evaluate(() => window.__hayDash.G.duo && window.__hayDash.G.duo.turn);
  r.sub = await p.evaluate(async () => { const v = await window.__hayDash.ev('rankSubmit(500, { dist: 100, day: 1 })'); return v; }).catch(() => 'err');
  r.r2 = await end(3400);
  await p.click('#btnAgain'); await p.waitForTimeout(800); r.t3 = await p.evaluate(() => window.__hayDash.G.duo);
  r.r3 = await end(10);
  console.log(JSON.stringify(r));
  const ok = r.btn && r.t1 === 1 && /次は 2P/.test(r.r1.duo) && /2P/.test(r.r1.again) && r.t2 === 2 && r.sub == null && /4,600/.test(r.r2.duo) && /2P の勝ち/.test(r.r2.duo) && r.r2.again === 'もう一回！' && r.t3 === null && r.r3.hidden;
  console.log(ok && !errs.length ? 'DUO OK' : 'DUO NG ' + errs.join(' | ')); await b.close();
})();
