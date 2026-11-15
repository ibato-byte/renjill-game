// 紙飛行機に乗ったとき、仲間と紙飛行機が消えない（2026-11-15 の報告：「紙飛行機に乗ったらメインのキャラクター以外消えて、紙飛行機も見えない」）。
// 原因：紙飛行機の絵は、スマホで絵の置き場がいっぱいになると「古い順」に捨てられる物だった（最初に作るので、まっ先に捨てられる）。捨てられた絵を描こうとして失敗し、
//       その後に描くはずの仲間まで描かれなかった。確かめること：絵の置き場を空にしても（スマホと同じ状態）、乗っている間ずっと ①描く失敗が起きない ②仲間が描かれる ③紙飛行機の白が画面に出る
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  for (const place of ['', 'asakusa']) { const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900); await p.click('#btnStart'); await p.waitForTimeout(1500);
    if (place) { await p.evaluate(pl => window.__hayDash.G.jumpTo(pl, 600, 1), place); await p.waitForTimeout(1200); }
    const before = await p.evaluate(() => { const H = window.__hayDash, G = H.G; H.ev('freePictures()'); /* スマホで絵の置き場がいっぱいになった時と同じ */ G.invT = 9; G.pow.fly = 5; H.ev('startFly()'); G.follow.pose = ''; return window.__frameErr || 0; });
    await p.waitForTimeout(1200);
    const r = await p.evaluate(() => { const H = window.__hayDash, G = H.G, cv = document.querySelector('canvas'); const sp = H.ev('spriteAt(G.player.wx, G.player.wy, G.player.wz)'); let white = 0;
      if (sp) { const dpr = cv.width / cv.clientWidth, x0 = Math.max(0, (sp.sx - 110) * dpr) | 0, y0 = Math.max(0, (sp.sy - 90) * dpr) | 0, w = (220 * dpr) | 0, h = (110 * dpr) | 0; const d = cv.getContext('2d').getImageData(x0, y0, w, h).data; for (let i = 0; i < d.length; i += 4) if (d[i] > 228 && d[i + 1] > 232 && d[i + 2] > 236) white++; }
      return { err: window.__frameErr || 0, msg: window.__frameErrMsg || '', fly: G.pow.fly, fpose: G.follow.pose, fshow: G.follow.show, white }; });
    const nm = place || '部屋';
    if (r.err > before) bad.push(`① ${nm}：描く途中で失敗した（${r.msg}）`); if (!(r.fly > 0)) bad.push(`${nm}：乗っていない`); if (r.fshow && !r.fpose) bad.push(`② ${nm}：仲間が描かれていない`); if (r.white < 250) bad.push(`③ ${nm}：紙飛行機が見えない（白 ${r.white}）`);
    await p.close(); }
  await b.close(); if (bad.length) { console.log('PLANEKEEP NG\n' + bad.join('\n')); process.exit(1); } console.log('PLANEKEEP OK');
})();
