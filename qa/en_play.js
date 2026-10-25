// English play audit: every stage, log any on-screen DOM text with Japanese characters (banners, hints, fork cards, toasts)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, locale: 'en-US', hasTouch: true });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800);
  await p.evaluate(() => {
    window.__jp = new Map(); const JP = /[぀-ヿ㐀-鿿！-｠]/;
    const chk = () => { for (const el of document.querySelectorAll('#hud *, #banner *, .toast, #forkCards *, #tutCue, #hint, #sRevive *, #sResult *')) { if (el.children.length) continue; const s = el.textContent.trim(); if (s && JP.test(s) && el.getClientRects().length) window.__jp.set((el.id || el.className) + ': ' + s.slice(0, 70), 1); } };
    new MutationObserver(chk).observe(document.body, { subtree: true, childList: true, characterData: true }); setInterval(chk, 100);
    const H = window.__hayDash; H.SV.tutDone = 1; H.SV.nickAsked = 1;
  });
  await p.click('#btnStart'); await p.waitForTimeout(500);
  const NP = +(process.env.NP || 1), PI = +(process.env.PI || 0); const all = (await p.evaluate(() => Object.keys(window.__hayDash.THEMES).filter(k => !window.__hayDash.THEMES[k].hidden))).filter((x, i) => i % NP === PI);
  for (const t of all) for (const [c, day] of [[700, 1], [1150, 2]]) {
    await p.evaluate(([t, c, day]) => { const G = window.__hayDash.G; G.jumpTo(t, c, day); G.invT = 99; }, [t, c, day]);
    for (let k = 0; k < 6; k++) { await p.waitForTimeout(400); await p.evaluate(() => { const H = window.__hayDash, G = H.G; G.invT = 99; if (G.s > G.segs[G.ci].len - 14) H.act(Math.random() < .5 ? 'right' : 'left'); else if (Math.random() < .3) H.act(['up', 'down', 'left', 'right'][(Math.random() * 4) | 0]); }); }
  }
  // a natural run from the start for 60 s with random inputs
  await p.evaluate(() => { const G = window.__hayDash.G; G.jumpTo(Object.keys(window.__hayDash.THEMES)[0], 480, 1); });
  for (let k = 0; k < (PI ? 0 : 120); k++) { await p.waitForTimeout(500); await p.evaluate(() => { const H = window.__hayDash, G = H.G; G.invT = 99; H.act(['up', 'down', 'left', 'right'][(Math.random() * 4) | 0]); }); }
  const r = await p.evaluate(() => [...window.__jp.keys()]);
  console.log('JP strings seen in EN play:', r.length); r.forEach(x => console.log('  ', x)); console.log('errors', errs.slice(0, 5));
  await b.close();
})();
