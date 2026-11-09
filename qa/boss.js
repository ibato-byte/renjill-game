// 締め切りの山（B-39）：締め切り前の区間でボスのバー（残りの道のり）が出て減っていく、ぶつからずに抜けると大きなボーナス、続けてから抜けると小さめ、ほかの区間では出ない
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900); await p.click('#btnStart'); await p.waitForTimeout(700);
  const r = {};
  r.plain = await p.evaluate(async () => { const G = window.__hayDash.G; G.jumpTo('desk', 700, 1); await new Promise(r => setTimeout(r, 300)); const e = document.getElementById('bossBar'); return { boss: !!G.boss, bar: !!e && !e.hidden }; });
  r.boss = await p.evaluate(async () => { const G = window.__hayDash.G; G.jumpTo('deadline', 1000, 1); G.invT = 99; await new Promise(r => setTimeout(r, 300)); const e = document.getElementById('bossBar'), w1 = parseFloat(e.querySelector('s').style.width); G.s += 30; await new Promise(r => setTimeout(r, 200)); const w2 = parseFloat(e.querySelector('s').style.width); return { boss: !!G.boss, bar: !e.hidden, txt: e.textContent, w1, w2 }; });
  r.win = await p.evaluate(() => { const D = window.__hayDash, G = D.G; const s0 = G.score; D.ev('onLeaveSeg')(G.boss.seg); return { bonus: G.score - s0, stat: G.stats.bossWin, left: G.boss }; });
  r.win2 = await p.evaluate(() => { const D = window.__hayDash, G = D.G; G.jumpTo('deadline', 1000, 1); G.reviveN = (G.reviveN || 0) + 1; const s0 = G.score; D.ev('onLeaveSeg')(G.boss.seg); return G.score - s0; });
  console.log(JSON.stringify(r));
  const ok = !r.plain.boss && !r.plain.bar && r.boss.boss && r.boss.bar && /締め切りの山/.test(r.boss.txt) && r.boss.w2 < r.boss.w1 && r.win.bonus >= 2500 && r.win.stat === 1 && r.win.left === null && r.win2 >= 800 && r.win2 < 2500;
  console.log(ok && !errs.length ? 'BOSS OK' : 'BOSS NG ' + errs.join(' | ')); await b.close();
})();
