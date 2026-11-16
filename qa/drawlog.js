// 絵が描けない時（2026-11-15 に PC の Chrome で「draw trouble」→「一区切り」）、エラーの記録に「何が・どこで」こわれたかを残す。
// 走りは止まらず続く（描けるようになったら、ふつうに走る）。
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900);
  const r = await p.evaluate(async () => { const D = window.__hayDash; localStorage.removeItem('rjErrLog'); D.ev('hideAll(); startRun()'); await new Promise(r => setTimeout(r, 800));
    D.ev('window.__brk = 1; window.__oR = render; render = function () { if (window.__brk) null.x; return window.__oR.apply(this, arguments); }');
    await new Promise(r => setTimeout(r, 4000)); window.__brk = 0; const s0 = D.G.s; await new Promise(r => setTimeout(r, 1200));
    return { log: JSON.parse(localStorage.getItem('rjErrLog') || '[]'), mode: D.G.mode, moved: D.G.s !== s0 }; });
  const m = (r.log.find(x => /^draw trouble/.test(x.m)) || {}).m || '';
  const ok = /reading 'x'/.test(m) && /@ render/.test(m) && !/file:\/\//.test(m) && r.mode === 'play' && r.moved;
  console.log(JSON.stringify(r)); console.log(ok ? 'DRAW LOG OK' : 'DRAW LOG NG'); await b.close();
})();
