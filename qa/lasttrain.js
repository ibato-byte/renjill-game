// 終電間際（B-30）：夜 9 時すぎ、次が最後の電車のとき「終電まで ◯秒」→ 間に合えばボーナス、遅れたら「ドアが閉まった」で走りは続く。朝や昼は出ない
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900); await p.click('#btnStart'); await p.waitForTimeout(700);
  const setup = clock => p.evaluate(clock => { const D = window.__hayDash, G = D.G; G.jumpTo('ueno', clock, 1); const nx = D.ev("newSeg(G.segs[0], { t: 'yamanote', d: 30, line: ['上野', '鶯谷'], last: 1 }, { t0: " + clock + ", day: 1 })"); G.segs.splice(1, G.segs.length - 1, nx); G.clock = clock; G.lastTrain = null; G.lastTrainDone = 0; G.invT = 99; D.ev('lastTrainTick()'); return { on: !!G.lastTrain, hud: document.getElementById('hLast').textContent }; }, clock);
  const r = {};
  r.day = await setup(600);
  r.night = await setup(1300);
  r.ok = await p.evaluate(() => { const D = window.__hayDash, G = D.G; const s0 = G.score; G.ci = 1; D.ev('lastTrainTick()'); return { bonus: G.score - s0, done: G.lastTrainDone, got: G.stats.lastTrain }; });
  await setup(1300);
  r.late = await p.evaluate(() => { const D = window.__hayDash, G = D.G; G.lastTrain.until = G.t - 1; D.ev('lastTrainTick()'); const closed = document.getElementById('hLast').textContent; const s0 = G.score; G.ci = 1; D.ev('lastTrainTick()'); return { closed, bonus: G.score - s0, mode: G.mode }; });
  console.log(JSON.stringify(r));
  const ok = !r.day.on && r.night.on && /終電まで/.test(r.night.hud) && r.ok.bonus >= 1500 && r.ok.done === 1 && r.ok.got === 1 && /閉まった/.test(r.late.closed) && r.late.bonus === 0 && r.late.mode === 'play';
  console.log(ok && !errs.length ? 'LASTTRAIN OK' : 'LASTTRAIN NG ' + errs.join(' | ')); await b.close();
})();
