// ランキングの丸い顔は、顔が真ん中に来る（2026-11-15 の報告：「モチは右寄り、ユズは左寄り」）。
// 確かめること：3 人とも、目（いちばん暗い所）の左右のまん中が、丸の中心から 3 ドット以内。顔が丸からはみ出していない。帽子をかぶっても同じ。
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => { const H = window.__hayDash, out = [];
    for (const [who, hat] of [['ren', ''], ['jill', ''], ['pom', ''], ['ren', 'santa'], ['jill', 'helmet']]) {
      H.ev(`Object.assign(WEAR.${who}, { hat: '${hat}', suit: '' }); buildBunnies('${who}')`); const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
      H.ev('iconCrop')(g, H.BUN[who].front_open, who); const d = g.getImageData(0, 0, 64, 64).data; let n = 0, sx = 0, sy = 0, edge = 0;
      for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const i = (y * 64 + x) * 4; const v = d[i] + d[i + 1] + d[i + 2]; if (d[i + 3] > 200 && v < 150) { n++; sx += x; sy += y; } }
      out.push({ who, hat, n, ex: sx / Math.max(1, n), ey: sy / Math.max(1, n) }); H.ev(`Object.assign(WEAR.${who}, { hat: '' }); buildBunnies('${who}')`); }
    return out; });
  for (const x of r) { const nm = x.who + (x.hat ? '（' + x.hat + '）' : ''); if (x.n < 15) { bad.push(nm + '：目が見えない'); continue; } if (Math.abs(x.ex - 32) > 3) bad.push(`${nm}：顔が${x.ex < 32 ? '左' : '右'}に寄っている（目の中心 ${x.ex.toFixed(1)} / 32）`); if (x.ey < 16 || x.ey > 40) bad.push(`${nm}：顔の高さがおかしい（${x.ey.toFixed(1)}）`); }
  await b.close(); if (bad.length) { console.log('RANKICON NG\n' + bad.join('\n')); process.exit(1); } console.log('RANKICON OK', r.map(x => x.who + ':' + x.ex.toFixed(1)).join(' '));
})();
