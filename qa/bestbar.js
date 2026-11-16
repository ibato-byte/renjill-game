// 自己ベストまでの棒（2026-11-16 オーナー：「自己ベストまでの残り」を見えるように）
// ① 次の目標が自己ベストのとき、棒は太い（7 ドット以上）・金色 ② 85% を超えたら光る（kpg-near）
// ③ スマホ横向き（高さ 500 以下）でも棒は見える ④ 棒の箱に色の付いた背景が付かない（ほかの所の名前とかぶらない：2026-11-16 に結果画面の .kpg-near とかぶって、桃色の四角が出た）
// ⑤ 自己ベストがまだ無い人には出さない
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../dist') + '/test.html';
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  for (const [w, h, lang] of [[1280, 800, 'ja'], [390, 844, 'ja'], [844, 390, 'en'], [320, 568, 'en'], [430, 932, 'en'], [375, 667, 'ja']]) {
    const mob = w < 900; const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mob, isMobile: mob, locale: lang === 'ja' ? 'ja-JP' : 'en-US' }); const p = await ctx.newPage();
    await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/sdk.crazygames.com/**', r => r.abort());
    await p.addInitScript(l => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 4, lang: l, best: 6200 })), lang);
    await p.goto(URL); await p.waitForTimeout(1200); await p.click('#btnStart'); await p.waitForTimeout(2500);
    const look = () => p.evaluate(() => { const e = document.getElementById('kpGoal'), i = e.querySelector('i'), s = e.querySelector('s'), r = i.getBoundingClientRect(), cs = getComputedStyle(e);
      return { cl: e.className, vis: !!e.offsetParent && r.width > 20, h: r.height, fill: getComputedStyle(s).backgroundImage, bg: cs.backgroundColor, shadow: cs.boxShadow, inView: r.right <= innerWidth && r.bottom <= innerHeight }; });
    await p.evaluate(() => { window.__hayDash.G.score = 4500; }); await p.waitForTimeout(500); let a = await look();
    if (!/kpg-best/.test(a.cl)) bad.push(`① ${w}x${h} 自己ベストの棒になっていない (${a.cl})`); if (!a.vis) bad.push(`③ ${w}x${h} 棒が見えない`); if (a.h < 7) bad.push(`① ${w}x${h} 棒が細い ${a.h}`); if (!/gradient/.test(a.fill)) bad.push(`① ${w}x${h} 金色でない`); if (/kpg-near/.test(a.cl)) bad.push(`② ${w}x${h} 72% で光っている`);
    if (!/rgba\(0, 0, 0, 0\)|transparent/.test(a.bg) || a.shadow !== 'none') bad.push(`④ ${w}x${h} 棒の箱に背景・影 (${a.bg} ${a.shadow})`); if (!a.inView) bad.push(`${w}x${h} 棒が画面の外`);
    await p.evaluate(() => { window.__hayDash.G.score = 5600; }); await p.waitForTimeout(500); a = await look();
    if (!/kpg-near/.test(a.cl)) bad.push(`② ${w}x${h} 90% で光らない`); if (!/rgba\(0, 0, 0, 0\)|transparent/.test(a.bg) || a.shadow !== 'none') bad.push(`④ ${w}x${h} 光るとき箱に背景・影 (${a.bg} ${a.shadow})`);
    await ctx.close(); }
  { const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 1, lang: 'ja', best: 300 })));
    await p.goto(URL); await p.waitForTimeout(1200); await p.click('#btnStart'); await p.waitForTimeout(2000);
    if (await p.evaluate(() => /kpg-best/.test(document.getElementById('kpGoal').className))) bad.push('⑤ 自己ベストが無い人に自己ベストの棒'); await p.close(); }
  console.log(bad.length ? 'BESTBAR FAIL\n' + bad.join('\n') : 'BESTBAR OK no errors'); await b.close(); })();
