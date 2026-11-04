const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const url = `http://127.0.0.1:${process.env.PD || 8765}/test.html`;
  await p.goto(url); await p.waitForTimeout(600);
  await p.evaluate(() => { const SV = window.__hayDash.SV; SV.bank = 9000; SV.tutDone = 1; SV.nickAsked = 1; SV.nick = 'テスト'; });
  await p.click('#btnShop'); await p.click('[data-buy="tie_green"]'); await p.click('[data-up="magnet"]'); await p.click('#pClose');
  await p.click('#btnStart'); await p.waitForTimeout(1500); await p.evaluate(() => { window.__hayDash.G.invT = 0; window.__die('obstacle'); }); await p.waitForTimeout(1300);
  await p.evaluate(() => { const r = document.querySelector('#btnRvNo'); if (r && !document.querySelector('#sRevive').hidden) r.click(); }); await p.waitForTimeout(1000);
  const before = await p.evaluate(() => { const SV = window.__hayDash.SV; return JSON.stringify([SV.bank, SV.closet, SV.wear.ren.tie, SV.upg.magnet, SV.runs, SV.best > 0, SV.nick]); });
  await p.reload(); await p.waitForTimeout(700);
  const after = await p.evaluate(() => { const SV = window.__hayDash.SV; return JSON.stringify([SV.bank, SV.closet, SV.wear.ren.tie, SV.upg.magnet, SV.runs, SV.best > 0, SV.nick]); });
  console.log('persist', before === after ? 'OK' : 'MISMATCH', before, after);
  for (const bad of ['{not json', '[]', 'null', '42', '{"totals":null,"missions":{"slots":null},"char":"bob","nick":"' + 'x'.repeat(300) + '"}', '{"tutDone":1,"missions":{"slots":[null,{"id":"gone_mission","target":5},{"id":"office","target":"x"}]},"last":{"score":"x","place":3},"runs":2,"closet":[1],"lstar":"2"}']) {
    await p.evaluate(v => localStorage.setItem('renjill-hay-dash-v1', v), bad); await p.reload(); await p.waitForTimeout(600);
    const ok = await p.evaluate(() => !!document.querySelector('#btnStart') && !document.querySelector('#sTitle').hidden); await p.click('#btnStart'); await p.waitForTimeout(800);
    const m = await p.evaluate(() => window.__hayDash.G.mode); console.log('corrupt save', JSON.stringify(bad.slice(0, 20)), ok && m === 'play' ? 'OK' : 'FAIL ' + m);
  }
  console.log(errs.slice(0, 5).join('|') || 'no errors'); await b.close();
})();
