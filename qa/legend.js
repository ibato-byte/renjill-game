// 伝説のうさぎ：到達した人（この更新の前に到達した人も）に、月桂冠・金の礼服（3人とも）・伝説モード・★ごとのごほうび。
// ★1 で伝説の輝き、★2 でランキングの金の名札。二重にもらえない。まだの人は鍵つきで見えるだけ（買えない）。
const { chromium } = require('playwright'); const KEY = 'renjill-hay-dash-v1';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [], out = {};
  for (const lang of ['ja', 'en']) {
    // a legend with 2 stars, saved before this update (no lstar)
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); let p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(600);
    const need = await p.evaluate(() => window.__hayDash.ev('(() => { let a = 0; for (let i = 0; i < RANKS.length - 1; i++) a += careerNeed(i); return a; })()'));
    await p.close(); await ctx.addInitScript(([K, need, l]) => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', 1); localStorage.setItem(K, JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 300, bank: 1000, clovers: 0, lang: l, pomMet: 1, career: 15, daily: (d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate())(new Date()), totals: { hay: Math.ceil((need + 2 * 50000 + 5000 - 300 * 40) / .5) } })); }, [KEY, need, lang]);
    p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200);
    const r = await p.evaluate(K => { const D = window.__hayDash, s = JSON.parse(localStorage.getItem(K)); return { li: D.ev('legendInfo()'), closet: Object.keys(s.closet || {}), bank: s.bank, clovers: s.clovers, lstar: s.lstar, career: document.querySelector('#tCareer').textContent, toasts: [...document.querySelectorAll('.ttoast')].map(t => t.textContent) }; }, KEY);
    out[lang] = r; if (process.env.DBG) console.log(JSON.stringify(r));
    if (!r.li || r.li.stars !== 2) errs.push(lang + ' stars ' + JSON.stringify(r.li));
    for (const id of ['hat_laurel_ren', 'hat_laurel_jill', 'hat_laurel_pom', 'suit_royal_ren', 'suit_royal_jill', 'suit_royal_pom']) if (!r.closet.includes(id)) errs.push(lang + ' missing ' + id);
    if (r.bank !== 1000 + 4000 || r.clovers !== 2) errs.push(lang + ' star rewards ' + r.bank + ' ' + r.clovers);
    if (!/★2/.test(r.career)) errs.push(lang + ' career shows no star: ' + r.career);
    // no double reward on the next start
    await p.reload(); await p.waitForTimeout(1000); const bank2 = await p.evaluate(K => JSON.parse(localStorage.getItem(K)).bank, KEY); if (bank2 !== 5000) errs.push(lang + ' legend reward given twice ' + bank2);
    // the shop: perks box with working toggles; wear the laurel
    await p.click('#btnShop'); await p.waitForTimeout(400);
    const shop = await p.evaluate(() => ({ box: !!document.querySelector('.legendbox [data-lg="mode"]'), aura: !!document.querySelector('.legendbox [data-lg="aura"]'), laurel: !!document.querySelector('[data-wear="hat_laurel_ren"]') }));
    if (!shop.box || !shop.aura || !shop.laurel) errs.push(lang + ' shop ' + JSON.stringify(shop));
    await p.click('.legendbox [data-lg="mode"]'); await p.click('[data-wear="hat_laurel_ren"]'); await p.click('[data-wear="suit_royal_jill"]'); await p.waitForTimeout(200);
    await p.screenshot({ path: (process.env.SHOTS || 'shots') + `/legend_shop_${lang}.png` });
    await p.keyboard.press('Escape'); await p.waitForTimeout(300); await p.screenshot({ path: (process.env.SHOTS || 'shots') + `/legend_title_${lang}.png` });
    await p.click('#btnStart'); await p.waitForTimeout(2500);
    const run = await p.evaluate(() => { const G = window.__hayDash.G; return { legend: G.legend, aura: G.aura, speed: +G.speed.toFixed(2), gold: window.__hayDash.ev("FX.filter(f => /255,214,90|255,246,200/.test(f.c || '')).length") }; });
    if (!run.legend || !run.aura || run.gold < 3) errs.push(lang + ' run ' + JSON.stringify(run));
    await p.screenshot({ path: (process.env.SHOTS || 'shots') + `/legend_run_${lang}.png` });
    // ranking row: star and ring
    const rk = await p.evaluate(() => window.__hayDash.ev(`(() => { const el = document.createElement('div'); rankList(el, [{ id: 'a', m: 9, mc: 'ren', lg: 3, wr: 'gold.laurel.royal.0' }, { id: 'b', m: 5, mc: 'jill', lg: 0 }], 'm', id => 'p' + id); return [...el.children].map(c => c.className + '|' + c.querySelector('span').textContent); })()`));
    if (!/lg lggold\|pa ★2/.test(rk[0]) || /lg/.test(rk[1])) errs.push(lang + ' ranking ' + JSON.stringify(rk));
    await ctx.close();
    // not a legend: locked, cannot be bought even by forcing the button
    const c2 = await b.newContext({ viewport: { width: 390, height: 844 } }); const q = await c2.newPage(); q.on('pageerror', e => errs.push(e.message)); await q.route('**/fonts.googleapis.com/**', r => r.abort());
    await q.addInitScript(([K, l]) => { if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', 1); localStorage.setItem(K, JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 3, bank: 99999, lang: l })); } }, [KEY, lang]);
    await q.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await q.waitForTimeout(900); await q.click('#btnShop'); await q.waitForTimeout(300);
    await q.evaluate(() => { const b = document.createElement('button'); b.dataset.buy = 'hat_laurel_ren'; document.querySelector('#pBody').appendChild(b); b.click(); const m = document.createElement('button'); m.dataset.lg = 'mode'; document.querySelector('#pBody').appendChild(m); m.click(); });
    const nl = await q.evaluate(K => { const s = JSON.parse(localStorage.getItem(K)); return { laurel: !!(s.closet || {}).hat_laurel_ren, mode: s.lgMode, lock: !!document.querySelector('.legendbox .lock') }; }, KEY);
    if (nl.laurel || nl.mode || !nl.lock) errs.push(lang + ' non-legend ' + JSON.stringify(nl)); await c2.close();
  }
  console.log(JSON.stringify(out).slice(0, 400)); console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'LEGEND OK no errors'); await b.close();
})();
