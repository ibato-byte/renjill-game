// 着せかえ（帽子）が自然に見えるか（2026-11-15 オーナー：「帽子をただ載せただけ」「ジルのベレー帽で耳が突き出すのはおかしい」）。
// 全部の帽子 × 3 人 × 前向き・後ろ姿で確かめる：①帽子が描かれている ②目が隠れない（前向きで、目の暗い点の数が帽子なしの 85% 以上）
// ③ジルの耳が両方見える（前向きで、耳の内側の桃色が、帽子のない側は 60%・帽子をかぶる側でも 30% 以上） ④絵のわくからはみ出さない ⑤後ろ姿でも帽子が頭にのっている（背の高い帽子をのぞき、頭の上のふちから 70 ドット以上離れない）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage(); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200);
  const r = await p.evaluate(() => { const H = window.__hayDash; H.ev('bunniesNow()'); const hats = H.ev('CLOSET').filter(c => c.slot === 'hat').map(c => [c.who, c.v]); const out = [];
    const stat = (c, who) => { const g = c.getContext('2d'), w = c.width, h = c.height, d = g.getImageData(0, 0, w, h).data; let eye = 0, pinkL = 0, pinkR = 0, x0 = w, x1 = 0, y0 = h; const px = d;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (d[i + 3] < 40) continue; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y;
        const R = d[i], G = d[i + 1], B = d[i + 2]; if (R + G + B < 120 && y > 120 && y < 260) eye++; if (R > 215 && G > 160 && G < 205 && B > 150 && B < 200 && R - G > 25 && y < 200) { if (x < 150) pinkL++; else pinkR++; } }
      return { eye, pinkL, pinkR, x0, x1, y0, px: Array.from(px.filter((v, i) => i % 16 === 3 || i % 16 === 0)) }; };
    const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 40) n++; return n; };
    for (const who of ['ren', 'jill', 'pom']) { H.ev(`Object.assign(WEAR.${who}, { hat: '', suit: '' }); buildBunnies('${who}')`); const base = stat(H.BUN[who].front_open), baseB = stat(H.BUN[who].run0);
      for (const [w2, v] of hats) { if (w2 !== who && w2 !== 'all') continue; H.ev(`WEAR.${who}.hat = '${v}'; buildBunnies('${who}')`); const f = stat(H.BUN[who].front_open), k = stat(H.BUN[who].run0); out.push({ who, v, base: Object.assign({}, base, { px: 0 }), f: Object.assign({}, f, { px: 0 }), baseB: Object.assign({}, baseB, { px: 0 }), k: Object.assign({}, k, { px: 0 }), df: diff(f.px, base.px), dk: diff(k.px, baseB.px) }); }
      H.ev(`WEAR.${who}.hat = ''; buildBunnies('${who}')`); }
    return out; });
  for (const x of r) { const nm = `${x.who}・${x.v}`;
    const small = x.v === 'heartband' ? 12 : ['ribbon', 'sakura', 'starband'].includes(x.v) ? 60 : 200; if (x.df < small) bad.push(`① ${nm}：前向きで帽子が見えない（${x.df}）`); if (x.dk < small) bad.push(`① ${nm}：後ろ姿で帽子が見えない（${x.dk}）`);
    if (x.f.eye < x.base.eye * .85) bad.push(`② ${nm}：目が帽子に隠れる（${x.f.eye} / ${x.base.eye}）`);
    if (x.who === 'jill' && (x.f.pinkL < x.base.pinkL * .6 || x.f.pinkR < x.base.pinkR * .3)) bad.push(`③ ${nm}：耳が隠れる（左 ${x.f.pinkL}/${x.base.pinkL}・右 ${x.f.pinkR}/${x.base.pinkR}）`);
    if (x.f.x0 < 1 || x.f.x1 > 298 || x.f.y0 < 1 || x.k.x0 < 1 || x.k.x1 > 298 || x.k.y0 < 1) bad.push(`④ ${nm}：絵のわくからはみ出す`);
    if (!['witch', 'santa', 'kagami', 'antler'].includes(x.v) && x.k.y0 < x.baseB.y0 - 70) bad.push(`⑤ ${nm}：後ろ姿で帽子が頭から浮いている（${x.baseB.y0 - x.k.y0} ドット上）`); }
  await b.close(); if (bad.length) { console.log('WEARFIT NG\n' + bad.join('\n')); process.exit(1); } console.log('WEARFIT OK', r.length, '通り');
})();
