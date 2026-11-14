// シェア画像の写真に、走っているキャラクターが頭から足まで入る（2026-11-15：前は画面のまん中を切り出していて、縦長のスマホでは頭しか入らなかった）
//  切り出す範囲（G.cardTop から 画面幅×0.62 の高さ）の中に、プレイヤーの頭（足もとから 1m 上）と足もとが入り、足もとの下に画面の 5% 以上の余白（後ろを走る相棒の分）があること。縦長・ふつう・横向き・PC。
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [], out = [];
  for (const [w, h] of [[393, 852], [360, 640], [844, 390], [1280, 800]]) { const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800); await p.click('#btnStart'); await p.waitForTimeout(900);
    await p.evaluate(() => { const H = window.__hayDash, G = H.G; H.setQ(0); G.jumpTo('shibuya', 780, 1); G.invT = 99; }); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => window.__hayDash.ev(`(() => { buildShareCard('', '', 0); const sp = spriteAt(G.player.wx, G.player.wy || 0, G.player.wz); const sh = Math.min(cv.height, Math.round(cv.width * .62)), top = G.cardTop * cv.height;
      return { top: Math.round(top), sh, feet: Math.round(sp.sy * DPR), head: Math.round((sp.sy - sp.k * 1.0) * DPR), H: cv.height, card: typeof G.cardTop }; })()`));
    out.push(w + 'x' + h + ' 切り出し ' + r.top + '〜' + (r.top + r.sh) + ' 頭 ' + r.head + ' 足 ' + r.feet);
    if (r.card !== 'number') bad.push(w + 'x' + h + ' 切り出し位置が記録されていない');
    // 画面そのものが切り出しより低い（横向き）ときは、画面の全部が入っていればよい
    if (r.sh < r.H) { if (r.head < r.top - 2) bad.push(w + 'x' + h + ' 頭が切れる（頭 ' + r.head + ' < 上 ' + r.top + '）'); if (r.feet > r.top + r.sh - r.H * .05) bad.push(w + 'x' + h + ' 足もとの下に余白がない（後ろの相棒が切れる）（足 ' + r.feet + ' ・下 ' + (r.top + r.sh) + '）'); }
    if (errs.length) bad.push(w + 'x' + h + ' エラー: ' + errs[0]); await p.close(); }
  await b.close(); console.log(out.join('\n'));
  if (bad.length) { console.log('CARDFRAME NG\n' + bad.join('\n')); process.exit(1); } console.log('CARDFRAME OK');
})();
