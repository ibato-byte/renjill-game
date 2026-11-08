// ぶつかった物の絵（C-69）：ぶつかって止まると、続ける画面（または結果画面）に、その物の絵と名前が出る。絵のない物・時間切れでは出さない
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = []; const out = {};
  for (const lang of ['ja', 'en']) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(l => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: l })); }, lang);
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800); await p.click('#btnStart'); await p.waitForTimeout(1000);
    await p.evaluate(() => { const D = window.__hayDash, G = D.G; G.jumpTo('shinjuku', 600, 1); const sg = D.ev('curSeg()'); G.lastHit = sg.obs.find(x => x.art) || null; D.ev("die('obstacle')"); });
    await p.waitForTimeout(2400);
    out[lang] = await p.evaluate(() => { const v = id => { const e = document.getElementById(id); return e && !e.hidden && e.offsetParent !== null; }; const any = v('rvHit') || v('resHit');
      const txt = (v('rvHit') ? document.getElementById('rvHitTxt') : document.getElementById('resHitTxt')).textContent; const img = (v('rvHit') ? document.getElementById('rvHitImg') : document.getElementById('resHitImg')).src;
      return { any, txt, img: /^data:image\//.test(img) }; });
    await p.close();
  }
  const ok = out.ja.any && out.ja.img && /「.+」/.test(out.ja.txt) && out.en.any && out.en.img && /bumped/i.test(out.en.txt);
  console.log(JSON.stringify(out)); console.log(ok && !errs.length ? 'HITWHAT OK' : 'HITWHAT NG ' + errs.join(' | '));
  await b.close();
})();
