// 自己ベストを更新した瞬間にゲームが終わらないか（2026-11 ランキング1位の方から「自己ベスト更新の瞬間に強制ゲームオーバー」の報告）
// いろいろな自己ベスト（小・中・1位級の大きな値）で、更新の前後を走らせ、終わり方・立て直し（rescue）・エラーを記録する
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const CASES = [
    { name: 'small', best: 3000, start: 0 },
    { name: 'mid', best: 60000, start: 59500 },
    { name: 'top', best: 2500000, start: 2499600 },
    { name: 'huge', best: 99999999, start: 99999700 },
  ];
  let bad = 0;
  for (const C of CASES) for (const lang of ['ja-JP', 'en-US']) {
    const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale: lang });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push('ERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CON ' + m.text().slice(0, 160)); });
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(800);
    await p.evaluate(best => { const H = window.__hayDash; H.SV.nickAsked = 1; H.SV.tutDone = 1; H.SV.pomMet = 1; H.SV.runs = Math.max(H.SV.runs || 0, 10); H.SV.best = best; }, C.best);
    await p.click('#btnStart');
    await p.evaluate(start => { const { G, act } = window.__hayDash; window.__T = []; if (start) G.score = start;
      setInterval(() => { if (G.mode !== 'play') return; const seg = G.segs[G.ci]; G.invT = 99; if (G.s > seg.len - Math.max(13, G.speed) + 1 && !G.turnQueued) act(seg.fork ? (Math.random() < .5 ? 'left' : 'right') : seg.turn > 0 ? 'right' : 'left'); }, 16);
      let passed = 0; setInterval(() => { const H = window.__hayDash; if (!passed && G.score > H.SV.best) { passed = 1; window.__T.push({ at: 'pb', t: performance.now(), mode: G.mode, score: G.score | 0 }); } }, 10);
    }, C.start);
    let pbAt = null, end = null;
    for (let i = 0; i < 180; i++) {
      await p.waitForTimeout(500);
      const s = await p.evaluate(() => { const H = window.__hayDash, G = H.G; return { mode: G.mode, score: G.score | 0, best: H.SV.best, told: G.bestTold, rescue: window.__rescue || 0, rescueWhy: window.__rescueWhy || '', finish: window.__finish || 0, finishWhy: window.__finishWhy || '', T: window.__T }; });
      if (s.T.length && pbAt === null) pbAt = i;
      if (s.mode !== 'play' && s.mode !== 'turn' && s.mode !== 'fork') { end = s; break; }
      if (pbAt !== null && i - pbAt >= 24) { end = s; break; }
    }
    const ok = end && pbAt !== null && end.finish === 0 && end.rescue === 0 && (end.mode === 'play' || end.mode === 'turn' || end.mode === 'fork') && !errs.length;
    if (!ok) bad++;
    console.log((ok ? 'ok   ' : 'FAIL ') + C.name + ' ' + lang + ' ' + JSON.stringify({ pbAt, end, errs: errs.slice(0, 5) }));
    await ctx.close();
  }
  await b.close();
  console.log(bad ? 'PB FAIL ' + bad : 'PB OK');
})();
