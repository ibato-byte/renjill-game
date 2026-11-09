// 逆走デー（B-37）：夕方 6 時に会社のあたりから始まり、帰り道 → 玄関 → 寝室で「ただいま」ボーナス、そのまま次の日へ。書類に追われない・ランキングとゴーストに入らない
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900);
  const r = {};
  r.start = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; G.revNext = 1; D.ev('hideAll(); startRun()'); await new Promise(r => setTimeout(r, 800)); const plan = G.plan.map(x => x.t || (x.fork ? 'fork' : '')); return { rev: G.rev, clock: G.clock, chase: G.chaseT, first: D.ev('curSeg().tid'), tail: plan.slice(-2), ghost: !!G.ghost, rank: D.ev('G.rev') }; });
  r.sub = await p.evaluate(async () => { const v = await window.__hayDash.ev('rankSubmit(500, { dist: 100, day: 1 })'); return v; }).catch(() => 'err');
  // walk the plan forward to the bedroom and enter it
  r.home = await p.evaluate(() => { const D = window.__hayDash, G = D.G; const s0 = G.score; const sg = D.ev("newSeg(null, { t: 'bedroom', d: 6, home: 1 }, { t0: 1400, day: 1 })"); D.ev('onEnterSeg')(sg); return { done: G.revDone, bonus: G.score - s0, stat: G.stats.revHome }; });
  r.after = await p.evaluate(() => { const D = window.__hayDash, G = D.G; G.plan = []; const st = D.ev('nextStep()'); return { day: G.planDay, clock: G.planClock, t: st && st.t }; });
  r.normal = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; D.ev('hideAll(); startRun()'); await new Promise(r => setTimeout(r, 500)); return { rev: G.rev, clock: G.clock }; });
  r.btnFri = await p.evaluate(() => { const D = window.__hayDash; D.ev("G.mode = 'title'"); D.ev('refreshTitle()'); const q = document.getElementById('btnRev'); return { exists: !!q, shownMatchesDay: !!q && q.hidden === !D.ev('revDay()') }; });
  console.log(JSON.stringify(r));
  const ok = r.start.rev && r.start.clock >= 1080 && r.start.clock < 1090 && r.start.chase === 0 && r.start.tail.join() === 'genkan,bedroom' && !r.start.ghost && r.sub == null && r.home.done === 1 && r.home.bonus >= 3000 && r.home.stat === 1 && r.after.day === 2 && r.after.clock === 480 && r.normal.rev === false && r.normal.clock < 490 && r.btnFri.exists && r.btnFri.shownMatchesDay;
  console.log(ok && !errs.length ? 'REVDAY OK' : 'REVDAY NG ' + errs.join(' | ')); await b.close();
})();
