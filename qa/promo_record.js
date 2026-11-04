// SNS 用のプレイ動画（renjill-auto の週次PDCA が使う）。季節は日付どおり（終わった企画の帽子・飾りは出ない）
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined, args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 720, height: 1280 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, locale: process.env.LOC || 'en-US', recordVideo: { dir: process.env.OUT || (process.env.SHOTS || '/tmp/rj-shots') + '/promo', size: { width: 720, height: 1280 } } });
  await ctx.route('**/fonts.googleapis.com/**', r => r.abort());
  const p = await ctx.newPage();
  await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html' + (process.env.EV ? '#ev=' + process.env.EV : '')); await p.waitForTimeout(1500); // the season follows the date (EV=xmas etc. only to force one for a test)
  await p.evaluate(() => { const H = window.__hayDash; H.SV.tutDone = 1; H.SV.nickAsked = 1; H.ev("const g = CLOSET.filter(c => c.ev && c.ev === EVENT); for (const c of g) { SV.closet[c.id] = 1; SV.wear[c.who][c.slot] = c.v; } applyWear(); refreshTitle()"); // the current event's gift hats (none outside an event) for (const t of document.querySelectorAll('.toast')) t.remove(); });
  await p.waitForTimeout(1500); const t0 = Date.now();
  await p.evaluate(() => document.getElementById('btnStart').click()); await p.waitForTimeout(600);
  const th = await p.evaluate(() => Object.keys(window.__hayDash.THEMES).filter(k => !window.__hayDash.THEMES[k].hidden));
  const pick = (process.env.STAGES || '').split(',').filter(Boolean);
  const plan = pick.length ? pick : [th[3], th[8], th[12]];
  console.log('plan', plan.join(','), 'start offset', ((Date.now() - t0) / 1000).toFixed(1));
  for (const [i, t] of plan.entries()) {
    await p.evaluate(([t, i]) => { const G = window.__hayDash.G; G.jumpTo(t, [760, 1170, 1050, 900][i % 4], 1); }, [t, i]);
    for (let k = 0; k < 13; k++) { await p.waitForTimeout(400); await p.evaluate(k => { const H = window.__hayDash, G = H.G; G.invT = 0; G.pow.dash = Math.max(G.pow.dash, 1.5); if (G.s > G.segs[G.ci].len - 14) H.act(k % 2 ? 'right' : 'left'); else H.act(['up', 'left', 'right', 'up', 'down'][k % 5]); }, k); }
  }
  await ctx.close(); await b.close(); console.log('done'); })();
