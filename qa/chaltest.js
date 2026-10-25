// 友だちへの挑戦リンク：?beat=点数&c=キャラ で開くと挑戦状が出て、こえたら「クリア」。シェアのリンクに自分の点数が入る。日英・スマホ/PC。
const { chromium } = require('playwright');
const SH = process.env.SHOTS || 'shots';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = [], out = {};
  for (const [vw, vh, tag] of [[390, 844, 'sp'], [1280, 800, 'pc']]) for (const lang of ['ja', 'en']) {
    const ctx = await b.newContext({ viewport: { width: vw, height: vh } }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(tag + lang + ': ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    const base = 'file://' + process.cwd() + '/dist/test.html';
    await p.goto(base); await p.evaluate(l => { localStorage.clear(); const D = window.__hayDash; D.SV.tutDone = 1; D.SV.nickAsked = 1; D.SV.lang = l; D.ev('save()'); }, lang);
    // bad values are ignored
    await p.goto(base + '?beat=abc&c=<b>'); await p.waitForTimeout(400);
    if (await p.evaluate(() => !!document.querySelector('#tChal:not([hidden])'))) errs.push(tag + lang + ' BAD VALUE SHOWN');
    await p.goto(base + '?beat=500&c=jill'); await p.waitForTimeout(600);
    const t1 = await p.evaluate(() => ({ card: (document.querySelector('#tChal:not([hidden])') || {}).textContent || '', url: location.search, img: !!document.querySelector('#tChal img'), over: (() => { const e = document.querySelector('#tChal'); return e ? e.scrollWidth > e.clientWidth + 1 : true; })() }));
    if (!/500/.test(t1.card) || t1.url || !t1.img || t1.over) errs.push(tag + lang + ' CARD ' + JSON.stringify(t1));
    await p.screenshot({ path: SH + `/chal_title_${tag}_${lang}.png` });
    await p.click('#btnStart'); await p.evaluate(() => { window.__hayDash.G.invT = 999; }); await p.waitForTimeout(1200);
    const h1 = await p.evaluate(() => document.querySelector('#hChal').textContent);
    if (!/500/.test(h1)) errs.push(tag + lang + ' HUD ' + h1);
    await p.evaluate(() => { window.__hayDash.G.score = 650; }); await p.waitForTimeout(400);
    const w = await p.evaluate(() => ({ won: window.__hayDash.G.chalWon, banner: document.querySelector('#banner').textContent, hud: document.querySelector('#hChal').textContent }));
    if (!w.won || !/挑戦状クリア|CHALLENGE BEATEN/.test(w.banner) || w.hud) errs.push(tag + lang + ' WIN ' + JSON.stringify(w));
    await p.screenshot({ path: SH + `/chal_win_${tag}_${lang}.png` });
    await p.evaluate(() => window.__die('obstacle')); await p.waitForTimeout(1500); await p.evaluate(() => { const D = window.__hayDash; if (D.G.mode === 'dead') D.ev('hideAll(); endRun()'); }); await p.waitForTimeout(800);
    const r = await p.evaluate(() => ({ note: document.querySelector('#resNote').textContent, url: window.__hayDash.ev('SHARE.url()'), text: window.__hayDash.ev('SHARE.text()') }));
    if (!/挑戦状クリア|Challenge beaten/.test(r.note) || !/[?&]beat=\d+&c=(ren|jill|pom)$/.test(r.url) || !/500/.test(r.text)) errs.push(tag + lang + ' RESULT ' + JSON.stringify(r));
    await p.screenshot({ path: SH + `/chal_result_${tag}_${lang}.png` });
    // once beaten, the card is gone after a reload
    await p.goto(base); await p.waitForTimeout(500);
    if (await p.evaluate(() => !!document.querySelector('#tChal:not([hidden])'))) errs.push(tag + lang + ' STILL SHOWN AFTER WIN');
    // not beaten: the result says how far you were
    await p.goto(base + '?beat=999999&c=ren'); await p.waitForTimeout(500);
    await p.click('#btnStart'); await p.evaluate(() => { window.__hayDash.G.invT = 999; }); await p.waitForTimeout(800);
    await p.evaluate(() => { window.__hayDash.G.invT = 0; window.__die('obstacle'); }); await p.waitForTimeout(1500); await p.evaluate(() => { const D = window.__hayDash; if (D.G.mode === 'dead') D.ev('hideAll(); endRun()'); }); await p.waitForTimeout(800);
    const r2 = await p.evaluate(() => ({ note: document.querySelector('#resNote').textContent, text: window.__hayDash.ev('SHARE.text()') }));
    if (!/あと|more to beat/.test(r2.note) || !/こえられる|Can you beat/.test(r2.text)) errs.push(tag + lang + ' LEFT ' + JSON.stringify(r2));
    out[tag + lang] = { t1, h1, w, r, r2 }; await ctx.close();
  }
  console.log(JSON.stringify(out).slice(0, 1500)); console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'CHALLENGE OK no errors'); await b.close();
})();
