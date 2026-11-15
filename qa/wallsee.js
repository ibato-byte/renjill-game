// 建物の中にいるとき、壁の向こう（次の次の場所）が見えない（2026-11-15 の報告：「壁が透けて次の次のステージが見える」）。
// 原因：中から外へ曲がる角・分かれ道で、つきあたりの壁の左右と上に壁が無く、先の道とその先の町がななめに見えていた。
// 確かめ方：自動で走らせ、建物の中のコマごとに 2 枚の絵を比べる。ちがう点が画面の 0.4% をこえたら不合格。
//   先が外のとき：「全部描いた絵」と「今いる建物だけ描いた絵」（外は、壁にかくれて見えないはず）／先も中のとき：「全部」と「次の部屋まで」（次の次は見えないはず）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  if (process.env.WALLSEE_DUMP) await p.addInitScript(() => { window.__dump = 1; });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200); await p.click('#btnStart'); await p.waitForTimeout(700);
  await p.evaluate(() => { const { G, act } = window.__hayDash; setInterval(() => { if (G.mode !== 'play') return; const seg = G.segs[G.ci]; G.invT = 99; if (G.s > seg.len - Math.max(13, G.speed) + 1 && !G.turnQueued) act(seg.fork ? (Math.random() < .5 ? 'left' : 'right') : seg.turn > 0 ? 'right' : 'left'); }, 16); });
  let rooms = 0, out = 0, worst = 0;
  for (let i = 0; i < 150; i++) { await p.waitForTimeout(430);
    const r = await p.evaluate(() => { const H = window.__hayDash, G = H.G; if (G.mode !== 'play') return null; const cur = G.segs[G.ci], k = cur.th.kind; if (k !== 'room' && k !== 'train' && k !== 'glass') return { room: 0 }; if (G.turnT > 0) return { room: 0 };
      { const nx0 = G.fork && G.fork.length ? G.fork : [G.segs[G.ci + 1]]; window.__toOut = nx0.some(q => q && !['room', 'train', 'glass'].includes(q.th.kind)) && !nx0.some(q => q && ['room', 'train', 'glass'].includes(q.th.kind)); }
      const cv = document.getElementById('cv'), g = cv.getContext('2d'), w = cv.width, h = cv.height; const pn = performance.now, dn = Date.now, t0 = performance.now(), d0 = Date.now(); performance.now = () => t0; Date.now = () => d0; const kf = [H.ev('drawFX'), H.ev('drawWeather'), H.ev('groundDust')]; H.ev('drawFX = drawWeather = groundDust = () => {}'); /* 時計を止め、動く文字・雨・砂ぼこりは描かない（描くたびに動くので、2 枚の絵でずれる。壁とは関係がない） */ H.ev('render()'); const a0 = g.getImageData(0, 0, w, h).data.slice(); H.ev('render()'); const a = g.getImageData(0, 0, w, h).data.slice();
      const keep = H.ev('segOrder'), src = keep.toString().replace(/^function segOrder\(\)/, 'function ()'); H.ev(`segOrder = (() => { const f = ${src}; return () => f().filter(s => { const i = G.segs.indexOf(s); return window.__toOut ? (i >= 0 && i <= G.ci) : (i < 0 || i <= G.ci + 1); }); })()`); H.ev('render()'); const c = g.getImageData(0, 0, w, h).data; H.ev('segOrder = ' + keep.toString()); performance.now = pn; Date.now = dn; window.__kf = kf; H.ev('drawFX = window.__kf[0]; drawWeather = window.__kf[1]; groundDust = window.__kf[2]');
      const mk = window.__dump ? new Uint8Array(w * h) : null; let n = 0; const yMax = Math.floor(h * .36) * w * 4; /* 壁の高さ（画面の上 36%）だけ見る。その下は床で、曲がり角の床は次の場所の床が見えていて正しい */ for (let j = 0; j < yMax; j += 4) { if (Math.abs(a[j] - a0[j]) + Math.abs(a[j + 1] - a0[j + 1]) + Math.abs(a[j + 2] - a0[j + 2]) > 20) continue; if (Math.abs(a[j] - c[j]) + Math.abs(a[j + 1] - c[j + 1]) + Math.abs(a[j + 2] - c[j + 2]) > 40) { n++; if (mk) mk[j / 4] = 1; } }
      let url = ''; if (mk && n / (w * h) > .004) { const id = g.createImageData(w, h); for (let k = 0; k < w * h; k++) { id.data[k * 4] = mk[k] ? 255 : a[k * 4]; id.data[k * 4 + 1] = mk[k] ? 0 : a[k * 4 + 1]; id.data[k * 4 + 2] = mk[k] ? 200 : a[k * 4 + 2]; id.data[k * 4 + 3] = 255; } const c2 = document.createElement('canvas'); c2.width = w; c2.height = h; c2.getContext('2d').putImageData(id, 0, 0); url = c2.toDataURL('image/jpeg', .7); }
      const nx = G.fork && G.fork.length ? G.fork : [G.segs[G.ci + 1]]; return { room: 1, url, frac: n / (w * h), s: G.s | 0, len: cur.len | 0, toOut: window.__toOut ? 1 : 0, id: cur.th.k || k }; });
    if (!r) { await p.evaluate(() => { const a = document.querySelector('#btnAgain'); if (a && a.offsetParent) a.click(); }); continue; }
    if (!r.room) continue; if (r.url && process.env.WALLSEE_DUMP) require('fs').writeFileSync(`${process.env.WALLSEE_DUMP}/w${i}.jpg`, Buffer.from(r.url.split(',')[1], 'base64')); rooms++; if (r.toOut) out++; if (r.frac > worst) worst = r.frac; if (r.frac > .004) bad.push(`中から先の先が見える：${(r.frac * 100).toFixed(1)}%（${r.id}・${r.s}/${r.len}・${r.toOut ? '先は外' : '先も中'}）`); }
  await b.close(); if (rooms < 12) bad.push('建物の中のコマが少なくて確かめられない（' + rooms + '）');
  if (bad.length) { console.log('WALLSEE NG\n' + [...new Set(bad)].slice(0, 10).join('\n')); process.exit(1); } console.log('WALLSEE OK', rooms, 'コマ（うち先が外', out, '）最大', (worst * 100).toFixed(2) + '%');
})();
