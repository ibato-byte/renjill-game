const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
 for (const [w, h] of [[360, 780], [844, 390], [768, 1024], [1920, 1080], [320, 568]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, locale: 'ja-JP' }); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(600);
  const ov = await p.evaluate(() => { const bad = []; for (const e of document.querySelectorAll('#sTitle *')) { const r = e.getBoundingClientRect(); if (r.width && (r.right > innerWidth + 1 || r.left < -1)) bad.push(e.tagName + '#' + e.id); } return bad.slice(0, 4); });
  await p.screenshot({ path: `shots/sz_${w}x${h}_title.png` });
  await p.evaluate(() => { const H = window.__hayDash; H.SV.tutDone = 1; H.SV.nickAsked = 1; H.SV.runs = 3; }); await p.click('#btnStart'); await p.waitForTimeout(2500);
  await p.evaluate(() => { const G = window.__hayDash.G; G.testFork(); G.invT = 999; G.s = G.segs[0].len - 30; }); await p.waitForTimeout(600); await p.screenshot({ path: `shots/sz_${w}x${h}_play.png` });
  await p.evaluate(() => { window.__hayDash.G.invT = 0; window.__die('obstacle'); }); await p.waitForTimeout(2200);
  const ov2 = await p.evaluate(() => { const bad = []; for (const e of document.querySelectorAll('#sResult *')) { const r = e.getBoundingClientRect(); if (r.width && (r.right > innerWidth + 1 || r.left < -1)) bad.push(e.tagName + '#' + e.id + '.' + e.className); } return bad.slice(0, 4); });
  await p.screenshot({ path: `shots/sz_${w}x${h}_res.png` });
  console.log(w + 'x' + h, 'titleOverflow', JSON.stringify(ov), 'resOverflow', JSON.stringify(ov2), errs.join('|') || 'ok'); await p.close(); }
 await b.close(); })();
