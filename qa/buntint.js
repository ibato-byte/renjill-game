// 夕方の光でキャラクターの色が急に変わらない（2026-11-15：18:00 を過ぎた外で、うさぎが急に赤くなった。光の強さを 1/4 きざみに丸めていて、
// おだやかな夕方の光 [.90,.87,.87] が [1,.75,.75]＝赤に丸まっていた）。確かめること：①実際に塗られた色が、決めた光の色から大きくずれない ②5分ごとの変化がなめらか ③赤だけが強くならない
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900); await p.click('#btnStart'); await p.waitForTimeout(900);
  const rows = await p.evaluate(() => { const H = window.__hayDash, G = H.G, out = []; G.jumpTo('kaihin', 900, 1);
    for (let c = 900; c <= 1260; c += 5) { G.clock = c; out.push(H.ev(`(() => { computeLight(G.segs[G.ci]); const a = bunnyAmb(), w = document.createElement('canvas'); w.width = w.height = 8; const g = w.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 8, 8); const t = litSprite(w, a, 1, 1), d = t.getContext('2d').getImageData(4, 4, 1, 1).data; return { c: G.clock, a: a.map(x => +Math.min(1, x).toFixed(3)), got: [d[0] / 255, d[1] / 255, d[2] / 255].map(x => +x.toFixed(3)) }; })()`)); }
    return out; });
  let prev = null;
  for (const r of rows) { const hm = n => Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
    for (let i = 0; i < 3; i++) if (Math.abs(r.got[i] - r.a[i]) > .045) { bad.push(`① ${hm(r.c)} 塗られた色が光の色からずれている 光=${r.a} 塗り=${r.got}`); break; }
    if (r.got[0] - Math.min(r.got[1], r.got[2]) > (r.a[0] - Math.min(r.a[1], r.a[2])) + .06) bad.push(`③ ${hm(r.c)} 赤だけが強い 光=${r.a} 塗り=${r.got}`);
    if (prev) for (let i = 0; i < 3; i++) if (Math.abs(r.got[i] - prev.got[i]) > .09) { bad.push(`② ${hm(prev.c)}→${hm(r.c)} で色が急に変わる ${prev.got} → ${r.got}`); break; }
    prev = r; }
  await b.close(); if (bad.length) { console.log('BUNTINT NG\n' + bad.slice(0, 12).join('\n')); process.exit(1); } console.log('BUNTINT OK', rows.length, '時刻');
})();
