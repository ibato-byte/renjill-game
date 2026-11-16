// 走りが「うさぎ跳び」になっているか（2026-11-16 オーナー：「うさぎの走り方を研究して、ゲームもリアルな走り方に」）。
// 前は、体が上下にゆれて足が左右交互に出るだけだった。うさぎは、後ろ足 2 本でそろってけり、空中でのび、着いてから背中を丸めて後ろ足を引きよせる。
// 確かめること：① 1 歩が 12 コマ ② けった時（のび）は体が低く平たく、引きよせた時（ちぢみ）は高く丸い（高さの差が 15% 以上）
// ③ 空中のコマがある（体が床から 15 以上うく）・着いているコマもある ④ 後ろ足は左右そろって動く（交互に出さない）⑤ 12 コマの絵がとなり同士で少しずつ違う（同じ絵のくり返しでない）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1800);
  const r = await p.evaluate(() => { const H = window.__hayDash; H.ev('bunniesNow()'); const N = H.ev('RUN_FRAMES'), hop = H.ev('hopPose'), BUN = H.ev('BUN'); const ps = []; for (let k = 0; k < N; k++) ps.push(hop(k / N));
    const sig = im => { const c = document.createElement('canvas'); c.width = c.height = 48; const g = c.getContext('2d'); g.drawImage(im, 0, 0, 48, 48); return g.getImageData(0, 0, 48, 48).data; };
    const diff = {}; for (const w of ['ren', 'jill']) { const s = []; for (let k = 0; k < N; k++) s.push(sig(BUN[w]['run' + k])); let mn = 1e9; for (let k = 0; k < N; k++) { const a = s[k], q = s[(k + 1) % N]; let d = 0; for (let i = 3; i < a.length; i += 4) d += Math.abs(a[i] - q[i]); mn = Math.min(mn, d / (48 * 48)); } diff[w] = +mn.toFixed(2); }
    return { N, sq: ps.map(q => +q.sq.toFixed(3)), lift: ps.map(q => +q.lift.toFixed(1)), plant: ps.map(q => q.plant), kick: ps.map(q => +q.kick.toFixed(2)), diff, hasFeet: 'feet' in ps[0] }; });
  if (r.N !== 12) bad.push('1 歩が 12 コマでない: ' + r.N);
  const mx = Math.max(...r.sq), mn = Math.min(...r.sq); if (!(mx / mn > 1.15)) bad.push('のびとちぢみの差が小さい（' + mn + '〜' + mx + '）');
  if (!(Math.max(...r.lift) > 15)) bad.push('空中のコマが無い'); if (!r.plant.some(x => x === 1) || !r.plant.some(x => x === 0)) bad.push('着いているコマ・空中のコマの両方が無い');
  if (r.sq.indexOf(mn) === r.sq.indexOf(mx)) bad.push('のびとちぢみが同じコマ'); if (!(r.kick[r.sq.indexOf(mn)] > .5)) bad.push('いちばんのびたコマで、後ろ足がけっていない');
  for (const w of ['ren', 'jill']) if (!(r.diff[w] > .15)) bad.push(w + '：となりのコマと同じ絵がある（' + r.diff[w] + '）');
  await b.close(); if (bad.length) { console.log('RABBITHOP NG\n' + bad.join('\n') + '\n' + JSON.stringify(r)); process.exit(1); } console.log('RABBITHOP OK ' + JSON.stringify({ sq: [mn, mx], lift: Math.max(...r.lift), diff: r.diff })); })();
