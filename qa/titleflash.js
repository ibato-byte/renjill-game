// ホーム画面でキャラクターが半透明にちかちかしないか（2026-11-16 オーナー：「選択の画面でレンがチカチカしている」。
// ぶつかった直後の点滅（半透明）が付いたまま遊び終わると、ホーム画面でも点滅し続けていた）。
// 確かめること：走っている途中でぶつかって点滅中にする → ホーム画面に戻る → 3 人を描く時に半透明が 1 度も使われない（2 秒ぶん）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 3, char: 'ren' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1800); await p.click('#btnStart'); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => { const H = window.__hayDash, G = H.ev('G'); G.invT = 1.5; await new Promise(r => setTimeout(r, 300)); const during = !!G.player.flash;
    H.ev("G.mode = 'title'; if (typeof showTitle === 'function') showTitle();"); G.mode = 'title';
    H.ev("window.__ga = 0; const __d = drawBunnyWorld; drawBunnyWorld = function (b) { const o = ctx.drawImage; ctx.drawImage = function () { if (ctx.globalAlpha < .9) window.__ga++; return o.apply(this, arguments); }; try { return __d.apply(this, arguments); } finally { ctx.drawImage = o; } }");
    for (let i = 0; i < 60; i++) { G.t += 1 / 30; H.ev('titleFrame(1/30); render()'); }
    return { during, ga: window.__ga, flash: [G.player.flash, G.follow.flash, G.pom.flash] }; });
  if (!r.during) bad.push('試験の準備ができていない（走っている間に点滅にならない）');
  if (r.ga) bad.push('ホーム画面で半透明に描いた: ' + r.ga + ' 回');
  if (r.flash.some(Boolean)) bad.push('ホーム画面で点滅の印が残っている: ' + JSON.stringify(r.flash));
  await b.close(); if (bad.length) { console.log('TITLEFLASH NG\n' + bad.join('\n')); process.exit(1); } console.log('TITLEFLASH OK ' + JSON.stringify(r)); })();
