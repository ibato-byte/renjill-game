// 浮かぶ文字が重ならない（2026-11-16：新しい食べ物を続けて取ると「NEW! 図鑑に…」が同じ場所に重なって読めなかった）。
// 確かめ方：同じ場所に、同時に 3 つ・少し時間をあけて 1 つ出す。どの 2 つも、たての間が 18 以上あること。
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200); await p.click('#btnStart'); await p.waitForTimeout(500);
  const ys = await p.evaluate(async () => { const H = window.__hayDash; const FX = H.ev('FX'); const f = H.ev('floatText'); f(195, 253, 'NEW! 図鑑に「ペレット」', '#F2C230'); f(195, 253, 'NEW! 図鑑に「小松菜」', '#F2C230'); f(195, 253, 'NEW! 図鑑に「りんご」', '#F2C230');
    await new Promise(r => setTimeout(r, 150)); f(195, 253, 'NEW! 図鑑に「パセリ」', '#F2C230'); return FX.filter(q => q.txt && /NEW/.test(q.txt)).map(q => q.y); });
  if (ys.length !== 4) bad.push('文字が 4 つ出ていない（' + ys.length + '）');
  for (let i = 0; i < ys.length; i++) for (let j = i + 1; j < ys.length; j++) if (Math.abs(ys[i] - ys[j]) < 18) bad.push('浮かぶ文字が重なる（たての間 ' + Math.abs(ys[i] - ys[j]).toFixed(0) + '）');
  await b.close(); if (bad.length) { console.log('FLOATTEXT NG\n' + [...new Set(bad)].join('\n')); process.exit(1); } console.log('FLOATTEXT OK'); })();
