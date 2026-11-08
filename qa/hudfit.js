// 上の3つの枠（スコア・時計と場所・チモシー）が、どのスマホの幅でも、スコアが7〜9桁でも、画面からはみ出さず重ならない
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = [], out = [];
  for (const [w, h] of [[320, 568], [360, 640], [375, 667], [390, 844], [414, 896], [768, 1024], [820, 1180], [1280, 800]]) for (const lang of ['ja', 'en']) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(400);
    await p.evaluate(l => { const D = window.__hayDash; D.SV.tutDone = 1; D.SV.nickAsked = 1; D.SV.lang = l; D.SV.mlevel = 12; D.ev('LANG = SV.lang; save()'); }, lang);
    await p.click('#btnStart'); await p.waitForTimeout(300);
    for (const score of [999999, 1234567, 12345678, 123456789]) {
      const r = await p.evaluate(async score => { const D = window.__hayDash, G = D.G; G.invT = 99; G.jumpTo('kukodeck', 1250, 3); G.score = score; G.hay = 98765; G.combo = 188; G.comboT = 3; await new Promise(r => setTimeout(r, 250));
        const box = id => { const e = document.getElementById(id); const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; };
        const a = box('hScoreBox'), c = document.querySelector('.clock').getBoundingClientRect(), y = document.querySelector('.hay').getBoundingClientRect(), W = innerWidth;
        const sc = document.getElementById('hScore'), clipped = sc.scrollWidth > sc.clientWidth + 1 || [...document.querySelectorAll('.hud-top .chip')].some(e => e.scrollWidth > e.clientWidth + 1);
        return { a: [Math.round(a.l), Math.round(a.r)], c: [Math.round(c.left), Math.round(c.right)], y: [Math.round(y.left), Math.round(y.right)], fs: sc.style.fontSize, cfs: parseFloat(getComputedStyle(sc).fontSize), tfs: parseFloat(getComputedStyle(document.querySelector('.clock b')).fontSize), score: document.getElementById('hScore').textContent, inView: a.l >= 0 && y.right <= W + .5 && c.left >= 0 && c.right <= W, overlap: a.r > c.left + .5 || c.right > y.left + .5, clipped }; }, score);
      if (!r.inView || r.overlap || r.clipped) errs.push(`${w}x${h} ${lang} ${JSON.stringify(r)}`);
      // タブレットでは数字を少し大きく（C-25）：スコアが短いときは 34px 以上、時計は 30px 以上
      if (w >= 700 && h >= 700 && score === 999999 && (r.cfs < 34 || r.tfs < 30)) errs.push(`${w}x${h} ${lang} tablet HUD too small ${r.cfs}/${r.tfs}`);
      out.push(`${w}${lang}:${r.score}`);
      if (score === 12345678 && (w === 320 || w === 390)) await p.screenshot({ path: (process.env.SHOTS || 'shots') + `/hud_${w}_${lang}.png`, clip: { x: 0, y: 0, width: w, height: 140 } });
    }
    await p.close();
  }
  console.log(out.length + ' cases'); console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'HUD FIT OK no errors'); await b.close();
})();
