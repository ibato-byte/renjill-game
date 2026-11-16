// CrazyGames ではじめて開いた人には、題名をキャラクターとスタートだけに（2026-11-16：試験公開で、開いた人の半分近くが遊ばずに離れた）
// ① CrazyGames・まだ 0 回：題名に見えるボタンは 言語・キャラ・スタート・音 だけ。スタートが画面の中に入っている（PC・スマホ縦横・320）
// ② 1 回走って題名に戻ると、ふだんの題名（ミッション・ショップなど）に戻る
// ③ 自社サイト版・2 回目以降の人は、今までどおり（何も消えない）
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../dist') + '/test.html';
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  const OK = ['btnLangTop', 'pickRen', 'pickJill', 'pickPom', 'btnStart', 'btnCont', 'btnMute'];
  const vis = p => p.evaluate(() => [...document.querySelectorAll('#sTitle button')].filter(e => e.offsetParent && e.getBoundingClientRect().width > 0).map(e => e.id));
  for (const [w, h, lang] of [[1280, 800, 'en'], [390, 844, 'ja'], [844, 390, 'en'], [320, 568, 'en'], [430, 932, 'zh']]) {
    const mob = w < 900; const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mob, isMobile: mob, locale: lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US' }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/sdk.crazygames.com/**', r => r.abort());
    await p.goto(URL + '?ref=crazygames'); await p.waitForTimeout(1500);
    const v = await vis(p), extra = v.filter(x => !OK.includes(x)); if (extra.length) bad.push(`① ${w}x${h} 余計なボタン: ${extra}`); if (!v.includes('btnStart')) bad.push(`① ${w}x${h} スタートが見えない`);
    const r = await p.evaluate(() => { const r = document.getElementById('btnStart').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }); if (!r) bad.push(`① ${w}x${h} スタートが画面の外`);
    await p.click('#btnStart'); await p.waitForTimeout(1800);
    await p.evaluate(() => { const G = window.__hayDash.G; G.invT = 0; G.fever = 0; G.reviveN = 9; window.__die('obstacle'); }); await p.waitForTimeout(6500);
    if (await p.evaluate(() => window.__hayDash.G.mode) === 'result') await p.click('#btnMenu'); await p.waitForTimeout(800);
    const v2 = await vis(p); if (!v2.includes('btnMissions') || !v2.includes('btnShop')) bad.push(`② ${w}x${h} 1 回走ったあと、ふだんの題名に戻らない: ${v2}`);
    if (errs.length) bad.push(`${w}x${h} エラー: ${errs[0]}`); await ctx.close(); }
  for (const [q, save] of [['', null], ['?ref=crazygames', { tutDone: 1, nickAsked: 1, runs: 3 }]]) {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/sdk.crazygames.com/**', r => r.abort());
    if (save) await p.addInitScript(s => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify(s)), save);
    await p.goto(URL + q); await p.waitForTimeout(1500); const v = await vis(p);
    if (!v.includes('btnMissions') || !v.includes('btnShop')) bad.push(`③ ${q || '自社サイト'} ${save ? '2 回目以降' : 'はじめて'}：ボタンが消えている ${v}`); await p.close(); }
  console.log(bad.length ? 'CGFRESH FAIL\n' + bad.join('\n') : 'CGFRESH OK no errors'); await b.close(); })();
