// a 6-minute invincible bot run on a phone-size screen, watching memory-ish counters and frame hitches
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const ctxm = await b.newContext({ viewport: { width: +(process.env.VW || 375), height: +(process.env.VH || 667) }, screen: { width: +(process.env.VW || 375), height: +(process.env.VH || 667) }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, locale: 'ja-JP', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' }); const p = await ctxm.newPage();
  const errs = []; p.on('pageerror', e => errs.push('ERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CON ' + m.text().slice(0, 120)); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(800);
  await p.evaluate(() => { const H = window.__hayDash; H.SV.nickAsked = 1; H.SV.tutDone = 1; H.SV.pomMet = +(window.__PM || 0); });
  await p.click('#btnStart');
  await p.evaluate(() => { const { G, act } = window.__hayDash; window.__MX = 0; let last = performance.now();
    const tick = now => { const dt = now - last; last = now; if (G.mode === 'play' && dt > window.__MX) window.__MX = dt; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    setInterval(() => { if (G.mode !== 'play') return; const seg = G.segs[G.ci]; G.invT = 99; if (G.s > seg.len - Math.max(13, G.speed) + 1 && !G.turnQueued) act(seg.fork ? (Math.random() < .5 ? 'left' : 'right') : seg.turn > 0 ? 'right' : 'left'); if (Math.random() < .02) act(Math.random() < .5 ? 'up' : 'down'); }, 16); });
  const N = +process.argv[2] || 36;
  for (let i = 0; i < N; i++) { await p.waitForTimeout(10000);
    const st = await p.evaluate(() => { const H = window.__hayDash, G = H.G; const r = H.ev('({phone: FAC_PHONE, litPx: (LIT_PX/1e6).toFixed(1), art: ART_C.size, facN: FAC_CACHE.size, facPx: (FAC_PX/1e6).toFixed(1), spr: Object.keys(SPR).length, pend: Object.keys(SPR_PEND).length, segs: G.segs.length})'); const mx = window.__MX; window.__MX = 0; return Object.assign(r, { t: G.t | 0, day: G.day, dist: G.dist | 0, tid: G.segs[G.ci].tid, mode: G.mode, maxDt: mx | 0, pom: !!G.pom.on, mem: performance.memory ? (performance.memory.usedJSHeapSize / 1e6) | 0 : -1 }); });
    if (i % 3 === 0 || st.maxDt > 120) console.log(JSON.stringify(st));
    if (st.mode === 'dead' || st.mode === 'result') { await p.evaluate(() => { const r = document.querySelector('#btnRvNo'); if (r && !document.querySelector('#sRevive').hidden) r.click(); }); await p.waitForTimeout(300); await p.click('#btnAgain'); }
  }
  console.log(errs.slice(0, 5).join('\n') || 'no errors'); await b.close();
})();
