const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  for (const [name, vp] of [['wide', { width: 1280, height: 760 }], ['phone', { width: 375, height: 667 }]]) {
    const p = await b.newPage({ viewport: vp });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(600);
    await p.screenshot({ path: `shots/ui_${name}_title.png` });
    await p.click('#btnZukan'); await p.waitForTimeout(200); await p.screenshot({ path: `shots/ui_${name}_zukan.png` }); await p.click('#pClose');
    await p.click('#btnShop'); await p.waitForTimeout(200); await p.screenshot({ path: `shots/ui_${name}_shop.png` }); await p.click('#pClose');
    await p.click('#btnStart'); await p.waitForTimeout(4000);
    await p.evaluate(() => { const G = window.__hayDash.G; G.invT = 0; G.chaseT = 1; }); 
    await p.waitForTimeout(6000);
    const m = await p.evaluate(() => window.__hayDash.G.mode); console.log(name, 'mode', m);
    await p.evaluate(() => { const r = document.querySelector('#btnRvNo'); if (!document.querySelector('#sRevive').hidden) r.click(); });
    await p.waitForTimeout(400); await p.screenshot({ path: `shots/ui_${name}_result.png` });
    const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    console.log(name, 'overflow', ov, errs.join('|') || 'no errors');
    await p.close();
  }
  await b.close();
})();
