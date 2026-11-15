// キャラクターを選んだとき、絵がチカチカしない（2026-11-15：選ぶと 0.6 秒はねて顔が切りかわるのを、オーナーが「いらない」と言った）。
// 確かめること：選んだ直後の 1 秒、絵の大きさ・位置が急に変わらない（はねない・消えない）。選んだ印（わく）は付く。
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const bad = []; if (/cardPick/.test(fs.readFileSync(path.resolve(__dirname, '../src/2b_bunny.js'), 'utf8') + fs.readFileSync(path.resolve(__dirname, '../src/7_ui.js'), 'utf8'))) bad.push('選んだときの「はねる」仕組み（cardPick）が戻っている');
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(2200);
  const sig = id => p.evaluate(id => { const c = document.getElementById(id), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0, sy = 0; for (let i = 3; i < d.length; i += 28) if (d[i] > 128) { n++; sy += Math.floor(i / 4 / c.width); } return [n, sy / Math.max(1, n) / c.height]; }, id);
  for (const [btn, cv] of [['#pickJill', 'cvJill'], ['#pickRen', 'cvRen']]) { const base = await sig(cv); await p.click(btn); let worst = 0, dy = 0;
    for (let i = 0; i < 20; i++) { await p.waitForTimeout(45); const s = await sig(cv); worst = Math.max(worst, Math.abs(s[0] - base[0]) / base[0]); dy = Math.max(dy, Math.abs(s[1] - base[1])); }
    if (base[0] < 300) bad.push(cv + ' の絵が出ていない'); if (worst > .08) bad.push(`${cv}：選んだあと絵が急に変わる（${(worst * 100).toFixed(1)}%）`); if (dy > .02) bad.push(`${cv}：選んだあと絵がはねる（${(dy * 100).toFixed(1)}%）`);
    if (await p.getAttribute(btn, 'aria-pressed') !== 'true') bad.push(btn + ' に選んだ印が付かない'); }
  await b.close(); if (bad.length) { console.log('PICKSTEADY NG\n' + bad.join('\n')); process.exit(1); } console.log('PICKSTEADY OK');
})();
