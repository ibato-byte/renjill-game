// 天井のある場所（室内・電車）で、天井が低く見えない・ジャンプしてもカメラとキャラクターが天井をこえない（2026-11-15 オーナーの報告）
//  ① 走っている時、カメラは天井より 0.75m 以上 下（縦長のスマホ・ふつうのスマホ・PC）
//  ② ジャンプ・スーパージャンプの間じゅう、カメラは天井より 0.2m 以上 下
//  ③ キャラクターの頭（足 + 1.2m）が天井をこえない
//  ④ 天井のない場所（外）は今までどおり（縦長のスマホのカメラ 2.75m・ジャンプの高さ）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [], out = [];
  for (const [w, h] of [[393, 852], [390, 700], [1280, 800]]) { const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800); await p.click('#btnStart'); await p.waitForTimeout(900);
    for (const [tid, sup] of [['yamanote', 0], ['yamanote', 1], ['desk', 1], ['bedroom', 1], ['street', 1]]) {
      await p.evaluate(a => { const H = window.__hayDash, G = H.G; H.setQ(0); G.jumpTo(a.tid, 660, 1); G.invT = 99; G.pow.jump = a.sup ? 30 : 0; }, { tid, sup }); await p.waitForTimeout(1300);
      const r = await p.evaluate(() => new Promise(res => { const H = window.__hayDash, G = H.G; G.invT = 99; const ceil = H.ev('curSeg().ceilH || 0'); const rest = H.ev('CAM.y - G.camE'); let maxCam = -9, maxY = 0; const t0 = performance.now(); let jumped = 0;
        const tick = () => { G.invT = 99; const el = performance.now() - t0; if (!jumped && el > 80) { jumped = 1; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp', key: 'ArrowUp', bubbles: true })); }
          maxCam = Math.max(maxCam, H.ev('CAM.y - G.camE')); maxY = Math.max(maxY, G.y); if (el < 1500) requestAnimationFrame(tick); else res({ ceil: H.ev('curSeg().ceilH || 0'), ceil0: ceil, rest, maxCam, maxY }); }; tick(); }));
      const tag = w + 'x' + h + ' ' + tid + (sup ? '（スーパージャンプ）' : ''); out.push(tag + ' 天井 ' + r.ceil0 + ' カメラ ' + r.rest.toFixed(2) + ' → 最高 ' + r.maxCam.toFixed(2) + ' 足の最高 ' + r.maxY.toFixed(2));
      if (r.maxY < .9) { bad.push(tag + ' ジャンプできていない（試験の前提）' + r.maxY.toFixed(2)); continue; }
      if (tid === 'street') { if (r.ceil0) bad.push(tag + ' 外なのに天井あつかい'); if (h / w > 1.6 && Math.abs(r.rest - 2.75) > .12) bad.push(tag + ' 外のカメラの高さが変わった（' + r.rest.toFixed(2) + '）'); if (sup && r.maxY < 1.6) bad.push(tag + ' 外のスーパージャンプが低くなった（' + r.maxY.toFixed(2) + '）'); continue; }
      if (!r.ceil0 || r.ceil !== r.ceil0) { bad.push(tag + ' 天井の高さが取れない／途中で場所が変わった'); continue; }
      if (r.rest > r.ceil0 - .75) bad.push(tag + ' 走っている時のカメラが天井に近い（天井まで ' + (r.ceil0 - r.rest).toFixed(2) + 'm）');
      if (r.maxCam > r.ceil0 - .2) bad.push(tag + ' ジャンプでカメラが天井に近づきすぎ／こえた（天井まで ' + (r.ceil0 - r.maxCam).toFixed(2) + 'm）');
      if (r.maxY + 1.2 > r.ceil0 + .05) bad.push(tag + ' キャラクターの頭が天井をこえる（足 ' + r.maxY.toFixed(2) + ' + 1.2 > ' + r.ceil0 + '）'); }
    if (errs.length) bad.push(w + 'x' + h + ' エラー: ' + errs[0]); await p.close(); }
  await b.close(); console.log(out.join('\n'));
  if (bad.length) { console.log('CEILVIEW NG\n' + bad.join('\n')); process.exit(1); } console.log('CEILVIEW OK');
})();
