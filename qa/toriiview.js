// 鳥居のトンネル（根津・山王）で、道の先が見える（2026-11-15 オーナーの報告：縦長のスマホで、鳥居の横木が画面のまん中をふさいで先が見えなかった）
//  ① いちばん下の横木が、カメラの目の高さより 0.7m 以上うえにある（縦長のスマホ・ふつうのスマホ・PC）
//  ② 道の 20m・30m・45m 先の画面の点が、鳥居の赤や黒でぬられていない
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [], out = [];
  for (const [w, h] of [[393, 852], [390, 700], [360, 640], [1280, 800]]) { const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800); await p.click('#btnStart'); await p.waitForTimeout(900);
    for (const tid of ['nezu', 'hie']) {
      await p.evaluate(t => { const H = window.__hayDash, G = H.G; H.setQ(0); G.jumpTo(t, 660, 1); G.invT = 99; }, tid); await p.waitForTimeout(1300);
      const r = await p.evaluate(() => window.__hayDash.ev(`(() => { const seg = curSeg(), gates = seg.spr.filter(s => s.beamY); const eye = CAM.y - segE(seg, G.s);
        const px = []; for (const ahead of [20, 30, 45]) { const q = segPos(seg, G.s + ahead, 0), sp = spriteAt(q[0], q[2] + .05, q[1]); if (!sp) { px.push('none'); continue; }
          const d = ctx.getImageData(Math.round((sp.sx - 4) * DPR), Math.round((sp.sy - 8) * DPR), Math.round(8 * DPR), Math.round(8 * DPR)).data; let red = 0, n = 0; for (let i = 0; i < d.length; i += 4) { n++; if ((d[i] > 150 && d[i + 1] < 105 && d[i + 2] < 90) || (d[i] < 62 && d[i + 1] < 62 && d[i + 2] < 66)) red++; } px.push(+(red / n).toFixed(2)); }
        return { n: gates.length, beam: gates.length ? Math.min(...gates.map(s => s.beamY)) : 0, eye: +eye.toFixed(2), px, fade: G.gateFadeN || 0 }; })()`));
      out.push(w + 'x' + h + ' ' + tid + ' ' + JSON.stringify(r));
      if (!r.n) bad.push(w + 'x' + h + ' ' + tid + ' 鳥居がない');
      if (r.beam - r.eye < .7) bad.push(w + 'x' + h + ' ' + tid + ' 横木が目の高さに近い ' + r.beam + ' / ' + r.eye);
      if (r.px.some(v => v === 'none' || v > .34)) bad.push(w + 'x' + h + ' ' + tid + ' 道の先が鳥居でかくれている ' + JSON.stringify(r.px));
    }
    if (errs.length) bad.push('pageerror ' + errs[0]); await p.close(); }
  console.log(out.join('\n')); console.log(bad.length ? 'TORIIVIEW NG ' + bad.join(' / ') : 'TORIIVIEW OK'); await b.close(); })();
