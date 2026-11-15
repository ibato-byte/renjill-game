// ホーム画面の朝の光（2026-11-16 ホーム画面の第 2 段）。
// 確かめること：(1) ホーム画面では光を描く (2) 走っている間は描かない（画面に固定の光の帯は、走ると「斜めの残像」に見える。2026-11-08 の報告）
//               (3) 光で、文字のある場所（題名・あいさつ）が白くとばない＝光を入れても、画面の上 1/3 の明るさの平均が上がりすぎない（+14% まで）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(2200);
  const r = await p.evaluate(async () => { const H = window.__hayDash; H.ev('window.__tl = 0; const __o = titleLight; titleLight = function () { window.__tl++; if (!window.__tlOff) return __o.apply(this, arguments); }');
    const lum = () => { const c = document.querySelector('canvas'), g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, Math.round(c.height / 3)).data; let s = 0, n = 0; for (let i = 0; i < d.length; i += 40) { s += d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; n++; } return s / n; };
    const wait = ms => new Promise(r => setTimeout(r, ms)); await wait(400); const n1 = window.__tl; H.ev('render()'); const on = lum(); window.__tlOff = 1; H.ev('render()'); const off = lum(); window.__tlOff = 0; return { n1, on, off }; });
  if (!(r.n1 > 3)) bad.push('ホーム画面で光を描いていない（' + r.n1 + ' 回）');
  if (!(r.on > r.off * 1.004)) bad.push('光が見えない（明るさ ' + r.off.toFixed(1) + ' → ' + r.on.toFixed(1) + '）');
  if (r.on > r.off * 1.14) bad.push('光が強すぎる（明るさ ' + r.off.toFixed(1) + ' → ' + r.on.toFixed(1) + '）');
  await p.click('#btnStart'); await p.waitForTimeout(900); const n2 = await p.evaluate(() => window.__tl); await p.waitForTimeout(900); const n3 = await p.evaluate(() => window.__tl);
  if (n3 !== n2) bad.push('走っている間も光を描いている（' + (n3 - n2) + ' 回）');
  await b.close(); if (bad.length) { console.log('HOMELIGHT NG\n' + bad.join('\n')); process.exit(1); } console.log('HOMELIGHT OK 明るさ ' + r.off.toFixed(1) + ' → ' + r.on.toFixed(1)); })();
