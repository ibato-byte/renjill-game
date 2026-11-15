// 2026-11-08 の遊び方：のんびりモード（速くならない・障害物少なめ・自己ベストとランキングに入らない）／（1分ダッシュは 2026-11-15 にやめた。以前の説明：60秒で終わる・専用の自己ベスト・復活なし）／なかよし度
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = []; const ok = {};
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, best: 5000, clovers: 9, bank: 99999 })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800);
  // 1分ダッシュ・スタートブーストはやめた（2026-11-15 オーナーの判断）：入口が無いこと
  ok.noQuick = await p.evaluate(() => !document.querySelector('#btnQuick') && !document.querySelector('#btnBoost') && !/1分ダッシュ|スタートブースト|1-minute|Start boost/.test(document.querySelector('#sTitle').innerText));
  // relaxed
  await p.evaluate(() => { const D = window.__hayDash; D.SV.opt = Object.assign({}, D.SV.opt, { easy: true }); D.ev('hideAll(); startRun()'); });
  await p.waitForTimeout(400);
  ok.easy = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; if (!G.easy) return false; G.dist = 6000; G.invT = 99; await new Promise(r => setTimeout(r, 1500));
    const rowsOk = (D.ev('curSeg()').rows || []).every(rw => rw.lanes.filter(Boolean).length <= 1 || rw.lanes.every(x => x === rw.lanes[0]));
    return G.speed < 13.5 && rowsOk; });
  ok.easyBest = await p.evaluate(() => { const D = window.__hayDash; D.G.score = 999999; D.ev('G.invT = 0; G.lives = 0; G.reviveN = 9; hideAll(); endRun()'); return D.SV.best === 5000; });
  ok.bond = await p.evaluate(() => (window.__hayDash.SV.bond || 0) >= 1);
  await p.evaluate(() => { const D = window.__hayDash; D.SV.opt.easy = false; });
  console.log(JSON.stringify(ok));
  console.log(Object.values(ok).every(Boolean) && !errs.length ? 'MODE OK' : 'MODE NG ' + errs.slice(0, 3).join(' | '));
  await b.close();
})();
