// 練習モード・場所えらび（B-31・B-38）：行った名所から始められる・ぶつかっても終わらない・やめると題名に戻り、記録・牧草の貯金・ランキングに入らない
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', 1); const d = new Date(), td = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, best: 5000, bank: 100, daily: td, streak: 1, stamps: { shibuya: 1, asakusa: 1 } })); /* daily = 今日：題名に戻ったときのログインボーナスを出さない */ } });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1000);
  const r = {}; r.btn = await p.evaluate(() => { const q = document.getElementById('btnPractice'); return !!q && !q.hidden; });
  await p.click('#btnPractice'); await p.waitForTimeout(300); r.choices = await p.evaluate(() => [...document.querySelectorAll('[data-prac]')].map(e => e.dataset.prac));
  await p.click('[data-prac="shibuya"]'); await p.waitForTimeout(1200);
  r.start = await p.evaluate(() => { const G = window.__hayDash.G; return { mode: G.mode, practice: G.practice, tid: window.__hayDash.ev('curSeg().tid') }; });
  // bump into things twice and hit the wall: still running
  r.after = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; G.invT = 0; D.ev("die('papers')"); D.ev("die('obstacle')"); G.score = 9999; G.hay = 50; await new Promise(r => setTimeout(r, 300)); return { mode: G.mode, bumps: G.stats.pracBumps }; });
  // quit: back to the title, nothing saved
  await p.evaluate(() => { const D = window.__hayDash; D.ev("G.cause = 'quit'; G.mode = 'dead'; endRun()"); }); await p.waitForTimeout(900);
  r.end = await p.evaluate(() => { const D = window.__hayDash; return { title: !document.getElementById('sTitle').hidden, best: D.SV.best, bank: D.SV.bank, practice: D.G.practice }; });
  console.log(JSON.stringify(r));
  const ok = r.btn && r.choices.includes('bedroom') && r.choices.includes('shibuya') && !r.choices.includes('ginza') && r.start.practice === 'shibuya' && r.start.mode === 'play' && r.after.mode === 'play' && r.after.bumps === 2 && r.end.title && r.end.best === 5000 && r.end.bank === 100 && !r.end.practice;
  console.log(ok && !errs.length ? 'PRACTICE OK' : 'PRACTICE NG ' + errs.join(' | ')); await b.close();
})();
