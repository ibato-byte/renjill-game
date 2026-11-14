// 光の演出（2026-11-15）：①夕方、太陽が低く画面に入っている時だけ光のすじが出る（昼・夜・軽いモードでは出ない）②やわらかい光は「ふつう」で働き、軽いモードでは働かない ③どちらもエラーを出さない
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900); await p.click('#btnStart'); await p.waitForTimeout(900);
  const at = async (clock, q) => { await p.evaluate(a => { const H = window.__hayDash, G = H.G; H.setQ(a.q); G.jumpTo('kaihin', a.clock, 1); G.invT = 99; G.rayN = 0; H.ev('DIF_K = 1; window.__dif = 0; if (!window.__difWrap) { window.__difWrap = 1; const d0 = diffusion; diffusion = function () { const before = DIFC; d0(); if (DIFC && DIF_K > 0) window.__dif++; }; }'); }, { clock, q }); await p.waitForTimeout(800);
    return p.evaluate(() => ({ ray: window.__hayDash.G.rayN || 0, dif: window.__dif || 0, difK: window.__hayDash.ev('DIF_K'), low: window.__hayDash.ev('lowQ') })); };
  const eve = await at(1066, 0), noon = await at(720, 0), night = await at(1290, 0), lowq = await at(1066, 1);
  if (!(eve.ray > 3)) bad.push('① 夕方に光のすじが出ていない ' + JSON.stringify(eve)); if (noon.ray) bad.push('① 昼に光のすじが出た'); if (night.ray) bad.push('① 夜に光のすじが出た'); if (lowq.ray) bad.push('① 軽いモードで光のすじが出た');
  if (!(eve.dif > 3) || eve.difK <= 0) bad.push('② やわらかい光が働いていない ' + JSON.stringify(eve)); if (lowq.dif) bad.push('② 軽いモードで、やわらかい光が働いた ' + JSON.stringify(lowq));
  await b.close(); if (bad.length) { console.log('LIGHTFX NG\n' + bad.join('\n')); process.exit(1); } console.log('LIGHTFX OK');
})();
