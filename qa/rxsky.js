// 2026-11-28 景色 1000（2 回目）：オオタカと飛ぶ空（hawk・hawk2）に足した物が、本当に画面に出ているか。
// きっかけ：1 回目に「ユリカモメ」を足して数に入れたが、空の上のステージは道ばたの絵（seg.spr）を描かないので、1 羽も見えていなかった。
//           スクリーンショットで確かめずに「足した」と数えたのが原因。空の上は、空の絵（src/4u_rround2.js rxSkyLife）として描くようにした。
// 確かめ方：(1) hawk・hawk2 を 春・夏・秋・冬 で開き、空の絵として描いた物（ヘリコプター・鳥）が、画面の中に 1 つ以上あること。
//           (2) 春夏はツバメ、秋冬はムクドリの群れが出ること（季節が逆になっていない）。夏はユリカモメを描かないこと。
//           (3) 絵のエラーが 0 件。
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = [], seen = {}; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  for (const [W, H] of [[390, 844], [1280, 800]]) { const p = await b.newPage({ viewport: { width: W, height: H } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200); await p.click('#btnStart'); await p.waitForTimeout(600);
    await p.evaluate(() => window.__hayDash.ev(`(() => { const di = CanvasRenderingContext2D.prototype.drawImage, r0 = rxSkyLife; window.__sk = [];
      rxSkyLife = function (hz, seg) { const f = ctx.drawImage, L = []; ctx.drawImage = function (img, x, y, w, h) { const m = ctx.getTransform(), cx = m.e + (x + w / 2) * m.a, cy = m.f + (y + h / 2) * m.d; L.push([Math.round(cx), Math.round(cy), Math.round(w), Math.round(h)]); return di.apply(this, arguments); };
        try { r0(hz, seg); } finally { ctx.drawImage = f; } if (L.length > window.__sk.length) window.__sk = L; }; })()`));
    for (const tid of ['hawk', 'hawk2']) for (const day of [1, 2, 3, 4]) {
      await p.evaluate(([t, d]) => { const G = window.__hayDash.G; window.__sk = []; window.__frameErr = 0; G.jumpTo(t, 720, d); G.weather = 'clear'; G.invT = 99; }, [tid, day]);
      for (let k = 0; k < 6; k++) { await p.waitForTimeout(200); await p.evaluate(() => { window.__hayDash.G.invT = 99; }); }
      const r = await p.evaluate(() => { const [W, H] = window.__hayDash.ev('[W, H]'), th = window.__hayDash.G.segs[0].th; return { L: window.__sk, W, H, fe: window.__frameErr || 0, msg: window.__frameErrMsg || '', rx: (th.rx || []).map(x => x[0] + ':' + ((x[2] || {}).kind || '')) }; });
      const on = r.L.filter(q => q[0] > 0 && q[0] < r.W && q[1] > 0 && q[1] < r.H), se = ['春', '夏', '秋', '冬'][day - 1];
      if (r.fe) bad.push(tid + ' ' + se + '：絵のエラー ' + r.msg);
      if (!on.length) bad.push(tid + ' ' + se + ' ' + W + 'px：空の絵が画面に 1 つも出ていない（描いた数 ' + r.L.length + '）');
      const want = 1 + 1 + (day === 2 ? 0 : 1); /* ヘリ + 季節の鳥（春夏ツバメ・秋冬ムクドリ）+ ユリカモメ（夏は出ない） */
      if (r.L.length > want) bad.push(tid + ' ' + se + '：空の絵が多すぎる ' + r.L.length + '（季節の物が逆に出ている？）');
      if (!r.rx.includes('heli:') || !r.rx.includes('flock:sw') || !r.rx.includes('flock:st')) bad.push(tid + '：表にヘリ・ツバメ・ムクドリが入っていない ' + r.rx.join(','));
      seen[tid + se] = r.L.length; }
    const spr = await p.evaluate(() => { const G = window.__hayDash.G; G.jumpTo('hawk', 720, 1); return G.segs[0].spr.filter(s => /rx(Heli|Flock|Gulls)/.test(s.img || '')).length; });
    if (spr) bad.push('空の上のステージに、見えない道ばたの絵が ' + spr + ' 個ある（空の絵として描くこと）');
    await p.close(); }
  await b.close(); console.log(JSON.stringify(seen));
  if (bad.length) { console.log('NG'); for (const x of [...new Set(bad)].slice(0, 20)) console.log(' - ' + x); process.exit(1); }
  console.log('RXSKY OK');
})();
