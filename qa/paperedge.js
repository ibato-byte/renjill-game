// 書類の山（スタートの時・ぶつかった後に画面の下から出る白い紙）が、右の端まで届いている（2026-11-15 オーナー：スマホで右下にすき間）。
// 原因は「24 きざみで打った点の最後が画面の幅に届かない」だったので、幅を変えて確かめる（375・390・393・402・414・430、横向き、PC）。
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  for (const [w, h] of [[375, 667], [390, 844], [393, 852], [402, 874], [414, 896], [430, 932], [844, 390], [1280, 800]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 }); p.on('pageerror', e => bad.push(w + ' エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900); await p.click('#btnStart'); await p.waitForTimeout(700);
    // 山をいちばん高くして止め、紙のすぐ内側（右端から 2px・左端から 2px）を下から山の 6 割の高さまで見る：白い紙でうまっていること
    const r = await p.evaluate(() => { const H = window.__hayDash, G = H.G; G.invT = 99; G.chaseVis = 1; G.chaseT = 9; return H.ev(`(() => { drawFX(); const cv = ctx.canvas, k = cv.width / W, hh = H * .2 * .6, out = {}; for (const [nm, x] of [['右', W - 2], ['左', 2], ['中', W / 2]]) { let n = 0, wht = 0; for (let y = H - 3; y > H - hh; y -= 3) { const d = ctx.getImageData(Math.round(x * k), Math.round(y * k), 1, 1).data; n++; if (d[0] > 225 && d[1] > 225 && d[2] > 225) wht++; } out[nm] = +(wht / n).toFixed(2); } return out; })()`); });
    if (!(r['右'] >= .8)) bad.push(`幅 ${w}：右の端に、紙の山が届いていない（白い割合 ${r['右']}。左 ${r['左']}・中 ${r['中']}）`); if (!(r['左'] >= .8)) bad.push(`幅 ${w}：左の端に届いていない（${r['左']}）`);
    await p.close(); }
  await b.close(); if (bad.length) { console.log('PAPEREDGE NG\n' + bad.join('\n')); process.exit(1); } console.log('PAPEREDGE OK');
})();
