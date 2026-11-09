// 続ける（復活）：分かれ道の壁で続けたら、寄っていた側へ曲がる／曲がった先の最初の障害物もどける（2026-11-09）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 1, lang: 'ja', pomMet: 1 })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800); await p.click('#btnStart'); await p.waitForTimeout(400);
  const r = await p.evaluate(() => { const D = window.__hayDash, G = D.G; const res = {};
    for (const lane of [0, 2]) { G.testFork(); const seg = D.ev('curSeg()'); const lbl = seg.forkLbl; G.lane = lane; G.lastSwipe = 0; G.s = seg.len; G.reviveN = 0; G.cause = 'wall'; G.mode = 'dead';
      D.ev("doRevive('free')"); const cs = D.ev('curSeg()'); const near = cs.obs.filter(o => o.s0 < G.s + 25 && o.s1 > G.s && !o.dead).length;
      res[lane] = { side: D.ev('lblOf')(cs.tid).ja === (lane === 0 ? lbl.L : lbl.R).ja, tid: cs.tid, want: lane === 0 ? lbl.L : lbl.R, mode: G.mode, nearAlive: near, changed: cs !== seg }; }
    return res; });
  const ok = [0, 2].every(l => r[l].mode === 'play' && r[l].changed && r[l].nearAlive === 0 && r[l].side) && JSON.stringify(r[0].want) !== JSON.stringify(r[2].want);
  console.log(JSON.stringify(r), errs.join('|')); console.log(ok && !errs.length ? 'REVIVE OK' : 'REVIVE NG'); await b.close(); })();
