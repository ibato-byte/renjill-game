// 季節の企画がもれなく切り替わる：日付どおり（初めて開いた人も1回目から）・古いリンク（#halloween など）で終わった企画が戻らない・
// 終わった企画の帽子をかぶったままの人は1回だけふつうの姿にもどる（帽子は持ったまま・購買部でまたかぶれる）・買った帽子はそのまま
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const APP = path.resolve(__dirname, '../app'), KEY = 'renjill-hay-dash-v1';
(async () => {
  const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; try { const b = fs.readFileSync(path.join(APP, p)); r.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html; charset=utf-8' : p.endsWith('.js') ? 'text/javascript' : p.endsWith('.json') ? 'application/json' : 'application/octet-stream' }); r.end(b); } catch (e) { r.writeHead(404); r.end(); } }).listen(8797);
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [], out = [];
  const feed = JSON.parse(fs.readFileSync(path.join(APP, 'feed.json'), 'utf8'));
  async function open(date, { sv, hash = '', feedEvents = feed.events, storedFeed = null } = {}) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'ja-JP' });
    await ctx.route('**/config.js', r => r.fulfill({ contentType: 'text/javascript', body: 'window.HAYDASH_CONFIG={}' }));
    await ctx.route('**/fonts.googleapis.com/**', r => r.abort()); await ctx.route('**/sw.js', r => r.fulfill({ contentType: 'text/javascript', body: '' }));
    await ctx.route('**/feed.json*', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(Object.assign({}, feed, { events: feedEvents })) }));
    await ctx.addInitScript(([K, sv, st]) => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', 1); if (sv) localStorage.setItem(K, JSON.stringify(sv)); if (st) localStorage.setItem('rjFeed', JSON.stringify(st)); }, [KEY, sv || null, storedFeed]);
    await ctx.addInitScript(() => { window.__toasts = []; new MutationObserver(() => document.querySelectorAll('.toast').forEach(t => { if (!window.__toasts.includes(t.textContent)) window.__toasts.push(t.textContent); })).observe(document, { childList: true, subtree: true, characterData: true }); });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(date + ' ' + e.message)); await p.clock.setFixedTime(new Date(date + 'T10:00:00+09:00'));
    await p.goto('http://127.0.0.1:8797/' + hash); await p.waitForTimeout(5500);
    return { ctx, p };
  }
  const state = p => p.evaluate(K => { const s = JSON.parse(localStorage.getItem(K) || '{}'); return { toast: (window.__toasts || []).join(' / '), wear: s.wear, closet: Object.keys(s.closet || {}), lastEv: s.lastEv }; }, KEY);
  const shopItems = async p => { await p.click('#btnShop'); await p.waitForTimeout(400); const t = await p.evaluate(() => document.querySelector('#pBody').innerText); return t; };
  const base = { tutDone: 1, nickAsked: 1, runs: 12, bank: 5000 };
  // 1) a brand-new player on 11/4: the winter event from the very first start, its gifts, nothing from Halloween
  { const { ctx, p } = await open('2026-11-04'); const s = await state(p); const shop = await shopItems(p); out.push('new 11/4: ' + s.toast.slice(0, 24));
    if (!/イルミネーション|クリスマス/.test(s.toast)) errs.push('new player 11/4: no winter event on the first start ' + JSON.stringify(s));
    if (!s.closet.includes('hat_santa_gift_ren') || !s.closet.includes('hat_antler_jill')) errs.push('winter gifts not given ' + s.closet);
    if (/ハロウィン|魔法使い|かぼちゃ/.test(shop + s.toast)) errs.push('Halloween shown on 11/4 to a new player');
    await ctx.close(); }
  // 2) old Halloween links never bring Halloween back
  for (const h of ['#halloween', '#ev=halloween', '#x&halloween']) { const { ctx, p } = await open('2026-11-04', { hash: h }); const s = await state(p); const shop = await shopItems(p);
    if (/ハロウィン|魔法使い|かぼちゃ/.test(shop + s.toast) || s.closet.some(c => /witch|pumpkin/.test(c))) errs.push('old link ' + h + ' brought Halloween back'); await ctx.close(); }
  // 3) a Halloween player (wearing both gifts, save from before this update): back to the usual look once, gifts kept and wearable again
  { const sv = Object.assign({}, base, { closet: { hat_witch_ren: 1, hat_pumpkin_jill: 1, hat_straw_ren: 1 }, wear: { ren: { tie: 'red', hat: 'witch', suit: '' }, jill: { frame: 'pink', hat: 'pumpkin', suit: '' } } });
    const { ctx, p } = await open('2026-11-04', { sv }); const s = await state(p);
    if (s.wear.ren.hat !== '' || s.wear.jill.hat !== '') errs.push('still wearing Halloween hats after it ended ' + JSON.stringify(s.wear));
    if (s.wear.ren.tie !== 'red' || s.wear.jill.frame !== 'pink') errs.push('other clothes changed ' + JSON.stringify(s.wear));
    if (!s.closet.includes('hat_witch_ren') || !s.closet.includes('hat_pumpkin_jill')) errs.push('Halloween gifts were taken away');
    const shop = await shopItems(p); if (!/魔法使い/.test(shop)) errs.push('owned Halloween hat not in the shop');
    // wear it again on purpose: it stays on after the next start
    await p.evaluate(() => { const b = document.querySelector('[data-wear="hat_witch_ren"]'); b && b.click(); }); await p.waitForTimeout(300);
    await p.reload(); await p.waitForTimeout(1500); const s2 = await state(p); if (s2.wear.ren.hat !== 'witch') errs.push('a hat put on again was taken off again ' + JSON.stringify(s2.wear));
    await ctx.close(); }
  // 4) a bought hat that looks like a gift (Santa hat bought with hay) is never taken off
  { const sv = Object.assign({}, base, { lastEv: 'xmas', closet: { hat_santa_ren: 1, hat_santa_gift_ren: 1 }, wear: { ren: { tie: 'gold', hat: 'santa', suit: '' }, jill: { frame: 'brown', hat: '', suit: '' } } });
    const { ctx, p } = await open('2027-01-20', { sv, feedEvents: [] }); const s = await state(p); if (s.wear.ren.hat !== 'santa') errs.push('bought Santa hat taken off ' + JSON.stringify(s.wear)); await ctx.close(); }
  // 5) the calendar: Halloween in late October, New Year in early January (no feed events)
  for (const [d, re, name] of [['2026-10-20', /ハロウィン/, 'halloween'], ['2027-01-03', /あけまして|お正月/, 'newyear']]) { const { ctx, p } = await open(d, { feedEvents: [] }); const s = await state(p); if (!re.test(s.toast)) errs.push(name + ' not on ' + d + ' ' + s.toast); await ctx.close(); }
  // 6) an old stored feed does not hide a newer event built into the page
  { const { ctx, p } = await open('2026-11-04', { storedFeed: { updated: '2026-10-25T20:00:00+09:00', latest: feed.latest } }); const s = await state(p); if (!/イルミネーション|クリスマス/.test(s.toast)) errs.push('old stored feed hid the event ' + s.toast); await ctx.close(); }
  console.log(out.join(' | ')); console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'SEASONAL OK no errors'); await b.close(); srv.close();
})();
