// ポムの着せ替え：会う前は購買部に出ない／会ったあとは出て、買う・かぶる・はずすができる。走る姿・タイトル・ランキングの顔に出る。古いセーブ（pom の服なし）も読める
const { chromium } = require('playwright'); const KEY = 'renjill-hay-dash-v1';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  for (const [lang, met] of [['ja', 0], ['ja', 1], ['en', 1]]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(([K, l, m]) => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', 1); localStorage.setItem(K, JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, bank: 9000, lang: l, pomMet: m, daily: (d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate())(new Date()), wear: { ren: { tie: 'red', hat: '', suit: '' }, jill: { frame: 'brown', hat: '', suit: '' } } })); }, [KEY, lang, met]);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900);
    await p.click('#btnShop'); await p.waitForTimeout(300);
    const has = await p.evaluate(() => !!document.querySelector('[data-buy="band_gold"]'));
    if (!met) { if (has) errs.push('Pom wardrobe shown before meeting him'); await ctx.close(); continue; }
    if (!has) { errs.push(lang + ' no Pom wardrobe'); await ctx.close(); continue; }
    await p.click('[data-buy="band_gold"]'); await p.waitForTimeout(150); await p.click('[data-buy="hat_straw_pom"]'); await p.waitForTimeout(200);
    let s = await p.evaluate(K => { const v = JSON.parse(localStorage.getItem(K)); return { wear: v.wear.pom, bank: v.bank, W: window.__hayDash.ev('JSON.stringify(WEAR.pom)'), ren: v.wear.ren }; }, KEY);
    if (s.wear.band !== 'gold' || s.wear.hat !== 'straw' || s.bank !== 9000 - 1500 - 1500 || !/gold.*straw/.test(s.W)) errs.push(lang + ' buy/wear ' + JSON.stringify(s));
    if (s.ren.tie !== 'red') errs.push('Ren outfit changed by Pom shopping');
    await p.click('[data-wear="band_gold"]'); await p.waitForTimeout(150); s = await p.evaluate(K => JSON.parse(localStorage.getItem(K)).wear.pom, KEY); if (s.band !== 'red') errs.push(lang + ' take off band ' + JSON.stringify(s));
    const code = await p.evaluate(() => window.__hayDash.ev("wearCode('pom')")); if (code !== 'red.straw.') errs.push('wear code ' + code);
    await p.keyboard.press('Escape'); await p.click('#pickPom'); await p.click('#btnStart'); await p.waitForTimeout(2000);
    await p.screenshot({ path: (process.env.SHOTS || 'shots') + `/pomwear_run_${lang}.png` }); await ctx.close();
  }
  console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'POM WEAR OK no errors'); await b.close();
})();
