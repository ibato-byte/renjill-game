const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const cases = [['left swipe', -90, ''], ['right swipe', 90, ''], ['left while invincible', -90, 'inv'], ['right while invincible, lane 0', 90, 'inv0'], ['no swipe while invincible lane 0', 0, 'inv0'], ['change mind L then R', -90, 'both']];
  for (const [label, dx, mode] of cases) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, locale: 'ja-JP' });
    p.on('pageerror', e => console.log('ERR', e.message));
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(400);
    await p.evaluate(() => { window.__hayDash.SV.tutDone = 1; window.__hayDash.SV.nickAsked = 1; }); await p.click('#btnStart'); await p.waitForTimeout(300);
    await p.evaluate(m => { const G = window.__hayDash.G; G.testFork(); if (m.startsWith('inv')) G.invT = 9; if (m === 'inv0') { G.lane = 0; } }, mode);
    for (let i = 0; i < 120; i++) { const ok = await p.evaluate(() => { const G = window.__hayDash.G, s = G.segs[G.ci]; return G.s > s.len - Math.max(13, G.speed) + 2; }); if (ok) break; await p.waitForTimeout(30); }
    const sw = async d => { await p.mouse.move(195, 600); await p.mouse.down(); await p.mouse.move(195 + d, 600, { steps: 4 }); await p.mouse.up(); };
    if (dx) await sw(dx); if (mode === 'both') { await p.waitForTimeout(200); await sw(90); }
    await p.evaluate(() => { window.__hayDash.G.invT = Math.max(window.__hayDash.G.invT, 4); }); await p.waitForTimeout(2200);
    console.log(label.padEnd(36), '->', await p.evaluate(() => { const G = window.__hayDash.G; return G.mode + ' ' + G.segs[G.ci].tid; }));
    await p.close();
  }
  await b.close();
})();
