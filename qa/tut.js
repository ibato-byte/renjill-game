const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, locale: 'ja-JP' });
  const errs = []; p.on('pageerror', e => errs.push(e.message + (e.stack || '').split('\n')[1]));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(600);
  await p.evaluate(() => { window.__hayDash.SV.nickAsked = 1; }); await p.click('#btnStart');
  const sw = async (dx, dy) => { await p.mouse.move(195, 600); await p.mouse.down(); await p.mouse.move(195 + dx, 600 + dy, { steps: 4 }); await p.mouse.up(); };
  const steps = [[-80, 0, 9], [0, -80, 5], [0, 80, 4]];
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 120; i++) { const d = await p.evaluate(k => { const G = window.__hayDash.G; return G.tut[k].s - G.s; }, k); if (d < steps[k][2]) break; await p.waitForTimeout(60); }
    if (k === 1) await p.screenshot({ path: 'shots/tut2.png' });
    await sw(steps[k][0], steps[k][1]); await p.waitForTimeout(150);
  }
  for (let i = 0; i < 200; i++) { const c = await p.evaluate(() => document.querySelector('#tutCue').className); if (c.includes('turn')) break; if (i === 40) await p.screenshot({ path: 'shots/tut_pre.png' }); await p.waitForTimeout(60); }
  await p.screenshot({ path: 'shots/tut_turn.png' });
  const dir = await p.evaluate(() => window.__hayDash.G.segs[window.__hayDash.G.ci].turn);
  await p.waitForTimeout(400); await sw(dir * 80, 0); await p.waitForTimeout(1500);
  console.log(await p.evaluate(() => { const G = window.__hayDash.G; return G.mode + ' tut=' + (G.tut ? JSON.stringify(G.tut.map(x => x.done)) : 'cleared') + ' ci=' + G.ci + ' room=' + G.segs[G.ci].tid + ' tutDone=' + window.__hayDash.SV.tutDone; }));
  await p.evaluate(() => window.__die && window.__die('obstacle')); await p.waitForTimeout(1500);
  await p.evaluate(() => { const r = document.querySelector('#btnRvNo'); if (r && !document.querySelector('#sRevive').hidden) r.click(); }); await p.waitForTimeout(1200);
  await p.click('#btnAgain'); await p.waitForTimeout(800);
  console.log('second run tutorial:', await p.evaluate(() => !!window.__hayDash.G.tut), 'first seg len', await p.evaluate(() => window.__hayDash.G.segs[0].len));
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
