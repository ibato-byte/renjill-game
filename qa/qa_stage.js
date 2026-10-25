// every stage x several situations: frame errors (counted, not just logged), blank frames, a blank-sky check indoors
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(400);
  await p.evaluate(() => { window.__hayDash.SV.tutDone = 1; window.__hayDash.SV.nickAsked = 1; }); await p.click('#btnStart'); await p.waitForTimeout(300);
  const all = await p.evaluate(() => Object.keys(window.__hayDash.THEMES).filter(k => !window.__hayDash.THEMES[k].hidden)); const NP = +(process.env.NP || 1), PI = +(process.env.PI || 0);
  const SIT = [[720, 'clear', 0, 1], [1150, 'clear', 0, 1], [1250, 'rain', 1, 2], [840, 'snow', 2, 2], [1000, 'clear', 0, 3]];
  let n = 0, bad = 0;
  for (const t of all.filter((x, i) => i % NP === PI)) for (const [c, w, q, day] of SIT) {
    await p.evaluate(([t, c, w, q, day]) => { const H = window.__hayDash, G = H.G; H.setQ(q); G.jumpTo(t, c, day); G.weather = w; G.invT = 99; window.__frameErr = 0; }, [t, c, w, q, day]);
    for (let k = 0; k < 3; k++) { await p.waitForTimeout(350); await p.evaluate(() => { const G = window.__hayDash.G; G.invT = 99; if (G.s > G.segs[G.ci].len - 14) window.__hayDash.act('right'); }); }
    const r = await p.evaluate(() => { const cv = document.querySelector('#cv'), g = cv.getContext('2d'); const k = window.__hayDash.G.segs[window.__hayDash.G.ci].th.kind;
      const rows = [.3, .45, .6].map(f => g.getImageData(0, Math.round(cv.height * f), cv.width, 1).data); let flat = 0;
      for (const d of rows) { let same = 0; for (let i = 4; i < d.length; i += 4) if (Math.abs(d[i] - d[i - 4]) < 2 && Math.abs(d[i + 1] - d[i - 3]) < 2 && Math.abs(d[i + 2] - d[i - 2]) < 2) same++; flat = Math.max(flat, same / (d.length / 4)); }
      return { fe: window.__frameErr || 0, msg: window.__frameErrMsg || '', flat: +flat.toFixed(2), kind: k }; });
    if (r.fe || r.flat > .985 || errs.length) { bad++; console.log('BAD', t, c, w, q, day, JSON.stringify(r), errs[0] || ''); errs.length = 0; }
    n++;
  }
  console.log('done', n, 'bad', bad); await b.close();
})();
