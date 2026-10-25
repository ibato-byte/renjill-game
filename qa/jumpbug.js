const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(500);
  await p.evaluate(() => { window.__hayDash.SV.tutDone = 1; window.__hayDash.SV.nickAsked = 1; }); await p.click('#btnStart'); await p.waitForTimeout(800);
  // watcher: air stuck while on the ground
  await p.evaluate(() => { const G = window.__hayDash.G; window.__stuck = []; let t = 0; setInterval(() => { if (G.mode !== 'play') return; G.invT = 99; const fly = G.pow.fly > 0; if (G.air && !fly && Math.abs(G.vy) < .01) { t += 50; if (t > 600) { window.__stuck.push({ y: G.y, room: G.segs[G.ci].tid, s: G.s }); t = 0; } } else t = 0;
      const seg = G.segs[G.ci]; if (G.s > seg.len - 12 && !G.turnQueued) window.__hayDash.act(seg.fork ? 'left' : seg.turn > 0 ? 'right' : 'left'); }, 50); });
  const sw = async (dx, dy) => { await p.mouse.move(195, 600); await p.mouse.down(); await p.mouse.move(195 + dx, 600 + dy, { steps: 4 }); await p.mouse.up(); };
  let fails = 0, tries = 0, details = [];
  for (let i = 0; i < 160; i++) {
    const up = i % 2 === 0;
    const before = await p.evaluate(() => { const G = window.__hayDash.G; return { mode: G.mode, air: G.air, fly: G.pow.fly > 0, slide: G.slideT > 0, y: G.y, turnT: G.turnT, hs: G.hitStop }; });
    if (i < 12) console.log(JSON.stringify(before)); if (before.mode !== 'play') { await p.waitForTimeout(500); continue; }
    await sw(0, up ? -90 : 90); await p.waitForTimeout(60);
    const after = await p.evaluate(() => { const G = window.__hayDash.G; return { air: G.air, slide: G.slideT > 0, vy: G.vy, room: G.segs[G.ci].tid, mode: G.mode }; });
    if (!before.air && !before.fly && after.mode === 'play') { tries++; const ok = up ? after.air : after.slide; if (!ok) { fails++; details.push({ up, before, after }); } }
    await p.waitForTimeout(up ? 700 : 500);
  }
  console.log('tries', tries, 'fails', fails, JSON.stringify(details.slice(0, 5)));
  console.log('stuck', JSON.stringify(await p.evaluate(() => window.__stuck.slice(0, 5))), errs.join('|') || 'no errors');
  await b.close();
})();
