const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
 const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'ja-JP' }); const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.message));
 await p.route('**/fonts.googleapis.com/**', r => r.abort());
 await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(600);
 // an old save without the suit slot
 await p.evaluate(() => { const SV = window.__hayDash.SV; SV.bank = 7000; SV.tutDone = 1; SV.nickAsked = 1; SV.wear = { ren: { tie: 'gold', hat: '' }, jill: { frame: 'brown', hat: '' } }; });
 await p.click('#btnShop'); await p.waitForTimeout(400);
 await p.click('[data-buy="suit_bee"]'); await p.waitForTimeout(200); await p.click('[data-buy="suit_zebra"]'); await p.waitForTimeout(200);
 const st1 = await p.evaluate(() => JSON.stringify([window.__hayDash.SV.wear, window.__hayDash.SV.bank, window.__hayDash.SV.closet]));
 await p.evaluate(() => document.querySelector('[data-wear="suit_zebra"]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(200);
 await p.screenshot({ path: 'shots/shop_suit.png' });
 // take off and put back on
 await p.click('[data-wear="suit_zebra"]'); await p.waitForTimeout(150); const off = await p.evaluate(() => window.__hayDash.SV.wear.jill.suit);
 await p.click('[data-wear="suit_zebra"]'); await p.waitForTimeout(150); const on = await p.evaluate(() => window.__hayDash.SV.wear.jill.suit);
 // hat + bee: antennae should give way to the hat
 await p.evaluate(() => { window.__hayDash.SV.closet.hat_beret_ren = 1; }); 
 console.log('after buy', st1, 'off=', JSON.stringify(off), 'on=', on);
 await p.keyboard.press('Escape'); await p.evaluate(() => { const x = document.querySelector('#pClose, .panel .x'); if (x) x.click(); }); await p.waitForTimeout(300);
 await p.screenshot({ path: 'shots/title_suit.png' });
 await p.reload(); await p.waitForTimeout(800);
 console.log('after reload', await p.evaluate(() => JSON.stringify(window.__hayDash.SV.wear)));
 await p.click('#pickJill'); await p.click('#btnStart'); await p.waitForTimeout(5000); await p.screenshot({ path: 'shots/run_suit.png' });
 console.log(errs.join('|') || 'no errors'); await b.close(); })();
