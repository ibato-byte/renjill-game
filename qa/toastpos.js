// 題名画面のお知らせ（出社ボーナスなど）が、ボタンにかぶらない（横向きで下のメニューにかぶっていた。2026-11-10）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  for (const [w, h] of [[320, 568], [390, 844], [844, 390], [667, 375], [1024, 768], [1280, 760]]) { const p = await b.newPage({ viewport: { width: w, height: h } }); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 })));
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900);
    const r = await p.evaluate(() => { const t = document.querySelector('.ttoast'); if (!t) return 'no toast'; const a = t.getBoundingClientRect(); return [...document.querySelectorAll('button')].filter(x => { if (!x.offsetParent) return false; const q = x.getBoundingClientRect(); return q.right > a.left && q.left < a.right && q.bottom > a.top && q.top < a.bottom; }).map(x => x.id); });
    if (!Array.isArray(r) || r.length) bad.push(w + 'x' + h + ' ' + JSON.stringify(r)); await p.close(); }
  console.log(bad.length ? 'TOASTPOS NG ' + bad.join(' / ') : 'TOASTPOS OK'); await b.close(); })();
