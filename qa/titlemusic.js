// 題名画面の曲：はじめて開いて、画面に 1 回ふれたら（どこでも・どのふれ方でも）すぐ流れる（2026-11-15 オーナー）。
// ふれる前は、スマホ・ブラウザの決まりで音を出せない（どのサイトも同じ）ので、そこは確かめない。
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined, args: ['--autoplay-policy=document-user-activation-required'] }); const bad = [];
  for (const how of ['tap', 'click', 'key']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: how === 'tap', isMobile: how === 'tap' }); const p = await ctx.newPage(); p.on('pageerror', e => bad.push(how + ' エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200); // はじめての人（保存なし）
    if (how === 'tap') await p.touchscreen.tap(200, 120); else if (how === 'click') await p.mouse.click(200, 120); else await p.keyboard.press('a'); // Shift などの修飾キーは、ブラウザが「ふれた」と数えない
    await p.waitForTimeout(900);
    const r = await p.evaluate(() => window.__hayDash.ev("({ on: !!(AU.ctx && AU.on), area: AU.area, state: AU.ctx && AU.ctx.state, mode: G.mode })"));
    if (!(r.on && r.area === 'title' && r.state === 'running')) bad.push(`${how}：1 回ふれても題名の曲が流れない ${JSON.stringify(r)}`);
    await ctx.close(); }
  await b.close(); if (bad.length) { console.log('TITLEMUSIC NG\n' + bad.join('\n')); process.exit(1); } console.log('TITLEMUSIC OK');
})();
