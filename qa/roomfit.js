// 時計の下の場所名が、どの場所・どの季節・4言語でも2行に入って「…」で切れない（320・390 幅）（2026-11-09）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  for (const w of [320, 390]) { const p = await b.newPage({ viewport: { width: w, height: 760 } }); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 })));
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(700); await p.click('#btnStart'); await p.waitForTimeout(600);
    bad.push(...await p.evaluate(w => { const D = window.__hayDash, G = D.G; G.mode = 'pause'; const out = [], el = document.getElementById('hRoom'), TH = D.ev('THEMES');
      for (const lang of ['ja', 'en', 'zh', 'ko']) { D.ev(`LANG = '${lang}'`);
        for (const tid of Object.keys(TH)) for (let day = 1; day <= 4; day++) { const th = D.ev('themeFor')(tid, day); el.textContent = D.ev('roomName')(th, th.climb ? 1 : 0) + (th.climb ? ' 120m' : '');
          if (el.scrollHeight > el.clientHeight + 2) out.push(w + ' ' + lang + ' ' + tid + ' "' + el.textContent + '"'); } }
      D.ev("LANG = 'ja'"); return [...new Set(out)]; }, w)); await p.close(); }
  console.log(bad.length ? 'ROOMFIT NG ' + bad.length + ' ' + bad.slice(0, 12).join(' / ') : 'ROOMFIT OK'); await b.close(); })();
