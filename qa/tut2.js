// first-time player who never swipes: must survive the lesson room and get GOOD! via auto-turn
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(500);
  await p.evaluate(() => { window.__hayDash.SV.nickAsked = 1; }); await p.click('#btnStart');
  let st; for (let i = 0; i < 120; i++) { await p.waitForTimeout(500); st = await p.evaluate(() => { const G = window.__hayDash.G; return { mode: G.mode, ci: G.ci, s: +G.s.toFixed(1), cause: G.cause, tut: !!G.tut, cue: document.querySelector('#tutCue').className }; }); if (st.ci > 0 || st.mode !== 'play') break; }
  console.log(JSON.stringify(st), errs.join('|') || 'no errors'); await b.close();
})();
