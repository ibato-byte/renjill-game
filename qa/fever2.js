const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(500);
  await p.evaluate(() => { window.__hayDash.SV.tutDone = 1; window.__hayDash.SV.nickAsked = 1; }); await p.click('#btnStart'); await p.waitForTimeout(300);
  const r = await p.evaluate(async () => { const G = window.__hayDash.G; G.jumpTo('kokyo', 700); G.segs[0].obs = []; G.segs[0].items = []; window.__hayDash.startFever(6);
    await new Promise(r => setTimeout(r, 120)); const sg = G.segs[0]; const fevItems = sg.items.filter(i => i.type === 'hay').length; const h0 = G.hay;
    await new Promise(r => setTimeout(r, 5500)); const left = sg.items.filter(i => i.type === 'hay' && !i.got && i.s < G.s - 1).length;
    return { fever: G.fever.toFixed(1), fevItems, eaten: G.hay - h0, missedBehind: left }; });
  console.log(JSON.stringify(r), errs.join('|') || 'no errors'); await b.close();
})();
