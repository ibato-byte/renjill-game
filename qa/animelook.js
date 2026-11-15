// ゲームのキャラクターが、アニメ（SNS の動画）と同じ絵のままか（2026-11-15：似せて描き直していたので、耳・口元・色が少しずつ違っていた。
// いまはアニメを描いている renjill-auto の rig/rig.js・rig/ep/pom_debut.js の数字をそのまま使う）。
// 確かめること：①色と形の「もと」の数字がアニメと同じ ②前向きの絵で、決まった場所の色がアニメの色に近い ③レンは体が左・ジルは体が右・ポムは左右対称 ④帽子をかぶせても絵が出る
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const bad = []; const src = fs.readFileSync(path.resolve(__dirname, '../src/2b_bunny.js'), 'utf8');
  const must = [ // アニメの絵の「もと」（rig.js の C.ren / C.jil、頭と耳の形、pom_debut.js の POM）
    "fur1: '#DDB68C', fur2: '#C7A077', fur3: '#9C7652', head1: '#E3C29C', head2: '#CDA67C', head3: '#A88259', ear1: '#C4A381', ear2: '#AE8D6D', ear3: '#8E7057', cream: '#F3E7D6'",
    "fur1: '#E2BB8D', fur2: '#CFA174', fur3: '#A3754C', head1: '#E9C79F', head2: '#D3A777', head3: '#B08155', ear1: '#C79A6C', ear2: '#B38657', earIn1: '#E9C3B2', earIn2: '#DDA898', cream: '#F6EBDC'",
    "a: '#F3E3CA', b: '#DCC29E', deep: '#C9A57A', cream: '#FAF1E4', earO: '#8E786C', earI: '#E9A9A2', nose: '#E58F98', pink: '#F2B8B0'",
    'M180 105 C 252 105 292 150 292 202 C 292 258 246 292 180 292 C 114 292 68 258 68 202 C 68 150 108 105 180 105 Z',
    'M134 112 C 100 102 56 126 40 180 C 26 230 28 286 52 306 C 74 324 106 306 112 272 C 118 238 110 204 106 172 C 102 146 114 124 134 112 Z',
    'M188 130 C 248 130 284 166 284 210 C 284 260 240 290 188 290 C 136 290 92 260 92 210 C 92 166 128 130 188 130 Z',
    'M158 240 Q122 230 92 229 M158 246 Q124 247 96 254', 'M166 240 Q130 230 98 226 M166 246 Q132 248 102 256', '[0, hy, 64, 55]', '[240, 304, 148, 90]', '[222, 322, 112, 74]', '[0, -60, 76, 62]'];
  for (const m of must) if (!src.includes(m)) bad.push('① アニメと同じ数字が消えた: ' + m.slice(0, 60));
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => { const H = window.__hayDash, out = {};
    const info = c => { const g = c.getContext('2d'), w = c.width, h = c.height, d = g.getImageData(0, 0, w, h).data; let n = 0, sx = 0, x0 = w, x1 = 0, y0 = h, ln = 0, lx = 0; const px = (x, y) => { const i = ((y | 0) * w + (x | 0)) * 4; return [d[i], d[i + 1], d[i + 2], d[i + 3]]; };
      for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (d[(y * w + x) * 4 + 3] > 128) { n++; sx += x; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > 64 + 282 - 70 && y < 64 + 282 - 24) { ln++; lx += x; } } return { n, cx: sx / Math.max(1, n), low: lx / Math.max(1, ln), x0, x1, y0, w, h, px }; };
    for (const who of ['ren', 'jill', 'pom']) { H.ev(`Object.assign(WEAR.${who}, { hat: '', suit: '' }); buildBunnies('${who}')`); const i = info(H.BUN[who].front_open); out[who] = { n: i.n, cx: i.cx, low: i.low, x0: i.x0, x1: i.x1, y0: i.y0 };
      // 決まった場所の色（アニメの座標 → 絵の中の位置）
      const S = who === 'pom' ? 1 : .72, at = (X, Y) => who === 'ren' ? i.px(150 - (X - 211) * S, 64 + 282 + (Y - 402) * S) : who === 'jill' ? i.px(150 + (X - 217) * S, 64 + 282 + (Y - 402) * S) : i.px(150 + X, 64 + 282 + Y);
      out[who].spots = who === 'ren' ? { ear: at(70, 220), head: at(180, 150), body: at(330, 300), eye: at(150, 199), chest: at(140, 348) } : who === 'jill' ? { head: at(188, 160), body: at(300, 320), eye: at(148, 206), earIn: at(165, 112), chest: at(160, 352) } : { head: at(0, -146), belly: at(10, -40), band: at(0, -162), ear: at(-56, -178), eye: at(-22, -134) };
      H.ev(`Object.assign(WEAR.${who}, { hat: 'santa' }); buildBunnies('${who}')`); { const hi = info(H.BUN[who].front_open); out[who].hatTop = hi.y0; out[who].hatN = hi.n; } H.ev(`Object.assign(WEAR.${who}, { hat: '' }); buildBunnies('${who}')`); }
    return out; });
  const near = (c, hex, tol) => { const t = [1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16)); return c[3] > 200 && Math.max(...t.map((v, k) => Math.abs(v - c[k]))) <= tol; };
  const want = { ren: { ear: ['#B9987A', 40], head: ['#E3C29C', 30], body: ['#C7A077', 40], eye: ['#2A160E', 45], chest: ['#F3E7D6', 30] }, jill: { head: ['#E9C79F', 30], body: ['#CFA174', 40], eye: ['#141414', 45], earIn: ['#E4BAAA', 34], chest: ['#F6EBDC', 30] }, pom: { head: ['#F3E3CA', 36], belly: ['#FAF1E4', 26], band: ['#C8263C', 40], ear: ['#8E786C', 60], eye: ['#0B0D10', 40] } };
  for (const who in want) { const o = r[who]; if (!o || o.n < 3000) { bad.push(`② ${who} の前向きの絵が出ていない`); continue; }
    for (const k in want[who]) if (!near(o.spots[k], want[who][k][0], want[who][k][1])) bad.push(`② ${who} の ${k} の色がアニメとちがう: ${o.spots[k]}（アニメ ${want[who][k][0]}）`);
    if (o.x0 < 2 || o.x1 > 297) bad.push(`③ ${who} が絵のわくからはみ出している（${o.x0}〜${o.x1}）`);
    if (!(o.hatTop < o.y0 - 8 || o.hatN > o.n * 1.04)) bad.push(`④ ${who} に帽子をかぶせても絵が変わらない（帽子が出ていない？ ${o.hatTop} / ${o.y0}）`); } // ジルは帽子を頭の横にかぶるので、高さでなく絵の量で見る
  if (r.ren && !(r.ren.low < 150 - 8)) bad.push('③ レンの体が左にない（体の中心 ' + r.ren.low.toFixed(1) + '）'); if (r.jill && !(r.jill.low > 150 + 2)) bad.push('③ ジルの体が右にない（体の中心 ' + r.jill.low.toFixed(1) + '）'); if (r.pom && Math.abs(r.pom.cx - 150) > 5) bad.push('③ ポムが左右対称でない（中心 ' + r.pom.cx.toFixed(1) + '）');
  await b.close(); if (bad.length) { console.log('ANIMELOOK NG\n' + bad.slice(0, 14).join('\n')); process.exit(1); } console.log('ANIMELOOK OK', must.length, 'の数字 ／ 3 キャラ × 色の点');
})();
