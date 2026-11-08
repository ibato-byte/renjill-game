// 世界の置き方の点検（2026-11-08 の総点検から）：場所×難しさを変えて何千区間も作り、次がないこと
// - 取れない場所の物：壁（block）の中の牧草・アイテム／飛び越える障害物の中に埋まった物（車は長いので後ろ半分に入りがちだった）
// - 同じレーンで障害物どうしが重なる
// - 1レーンしか空いていない列の、その空きレーンにダメな食べ物（避けようがない）
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9 })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900);
  await p.click('#btnStart'); await p.waitForTimeout(800);
  const r = JSON.parse(await p.evaluate(() => window.__hayDash.ev(`JSON.stringify((()=>{
    const ids = Object.keys(THEMES).filter(k => !THEMES[k].hidden); const keepD = G.distEst; const C = {}, ex = {};
    const add = (k, v) => { C[k] = (C[k] || 0) + 1; (ex[k] = ex[k] || []).length < 5 && ex[k].push(v); };
    let segs = 0;
    for (const id of ids) for (let i = 0; i < 25; i++) {
      G.distEst = 300 + i * 120; let sg; try { sg = newSeg(null, { t: id, d: 60 }, {}); } catch (e) { add('newSegThrow', id + ' ' + e.message); continue; }
      segs++;
      for (const it of sg.items) for (const o of sg.obs) {
        if (o.k === 'gates' && !o.closed) continue;
        if (!(it.lat > o.l0 - .25 && it.lat < o.l1 + .25 && it.s > o.s0 - .2 && it.s < o.s1 + .2)) continue;
        if (o.k === 'block') add('itemInWall', id + ':' + it.type + ' in ' + o.type);
        else if (o.k === 'low' && it.y < (o.top || 0)) add('itemBuried', id + ':' + it.type + ' in ' + o.type);
      }
      for (let a = 0; a < sg.obs.length; a++) for (let c = a + 1; c < sg.obs.length; c++) { const A = sg.obs[a], B = sg.obs[c]; if (A.lane == null || A.lane !== B.lane) continue; if (A.s1 > B.s0 && B.s1 > A.s0) add('obsOverlap', id + ' ' + A.type + '+' + B.type); }
      for (const rw of sg.rows || []) { const open = [0, 1, 2].filter(l => rw.lanes[l] !== 'block'); if (open.length === 1 && sg.items.some(it => BADS.includes(it.type) && it.lane === open[0] && Math.abs(it.s - rw.s) < 3)) add('badInOnlyLane', id); }
    }
    G.distEst = keepD; return { segs, C, ex };
  })())`)));
  const n = Object.values(r.C).reduce((a, b) => a + b, 0);
  console.log('segments', r.segs, JSON.stringify(r.C), JSON.stringify(r.ex));
  console.log(n === 0 && r.segs > 1000 && !errs.length ? 'WORLD OK' : 'WORLD NG ' + errs.join(' | '));
  await b.close();
})();
