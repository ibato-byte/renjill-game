// 「どのレーンも通れない列」が出ないこと：同じ列で3レーンとも、飛び越えられない壁（block）にならない
// 積んだ箱（crate）は置くときに高い・低いが決まるので、選んだ時点の種類では防げなかった（2026-11-08 上野・アメ横で3段の箱＋両脇の段ボールの報告）
// いろいろな場所・難しさで何千列も作って確かめる
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9 })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900);
  await p.click('#btnStart'); await p.waitForTimeout(800);
  const r = JSON.parse(await p.evaluate(() => window.__hayDash.ev(`JSON.stringify((()=>{
    const ids = new Set(G.segs.map(s => s.step.t));
    if (typeof THEMES === 'object' && THEMES) Object.keys(THEMES).forEach(k => ids.add(k));
    const keepD = G.distEst; let rows = 0, tried = 0; const bad = [];
    for (const id of ids) for (let i = 0; i < 60; i++) {
      G.distEst = 1200 + i * 60; let sg;
      try { sg = newSeg(null, { t: id, d: 60 }, {}); } catch (e) { continue; }
      tried++;
      for (const rw of sg.rows || []) {
        rows++; const bl = new Set();
        for (const o of sg.obs) { if (o.lane == null || Math.abs(o.s0 - rw.s) > 1.2) continue; if (o.k === 'block') bl.add(o.lane); }
        if (bl.size >= 3) bad.push(id + '@' + Math.round(rw.s));
      }
    }
    G.distEst = keepD; return { tried, rows, nbad: bad.length, bad: bad.slice(0, 10) };
  })())`)));
  console.log('segments', r.tried, 'rows checked', r.rows, 'walls', r.nbad, r.bad.join(' '));
  console.log(r.nbad === 0 && r.rows > 500 && !errs.length ? 'WALL OK' : 'WALL NG ' + errs.join(' | '));
  await b.close();
})();
