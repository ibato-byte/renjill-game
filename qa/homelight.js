// ホーム画面の明かりと、選んだ子の見せ方（2026-11-16）。
// オーナーの報告：「ポムを選んだ時にジルにもスポットが当たる。どのキャラを選んでいるのか直感的に分かりづらい」
// 確かめること：
//  (1) ホーム画面では光を描く (2) 走っている間は描かない（画面に固定の光の帯は、走ると「斜めの残像」に見える。2026-11-08 の報告）
//  (3) だれを選んでも、選んだ子が画面の横のまん中（±8%）にいて、3 人の中でいちばん手前（大きい）
//  (4) スポットライトは無し（オーナー 2026-11-17：「明るすぎて不自然。選択されてるキャラクターのライトいらない」）：明かりを入れても、だれの所も 3% 以上は明るくならない
//  (6) 選んだ子の色がうすくならない：明かりを入れても、体の色のこさ（彩度）が 9 割以上のまま（オーナー 2026-11-16：「光が明るすぎて色合いが逆にうすくなってる」）
//  (5) 画面を暗くしない：明かりを入れても、ほかの 2 人の所・画面の四すみ・下のほうは暗くならない（オーナー 2026-11-16：「ホーム画面全体を暗くしなくていい」）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  for (const [w, h] of [[390, 844], [1280, 800], [2240, 1082]]) for (const ch of ['ren', 'jill', 'pom']) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(c => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 3, char: c })), ch);
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(2200);
    const r = await p.evaluate(async () => { const H = window.__hayDash; H.ev('window.__tl = 0; const __o = titleLight; titleLight = function () { window.__tl++; if (!window.__tlOff) return __o.apply(this, arguments); }');
      const wait = ms => new Promise(r => setTimeout(r, ms)); await wait(400); const n1 = window.__tl; const G = H.ev('G');
      const at = o => { const s = H.ev('spriteAt')(o.wx, o.wy, o.wz); return s ? { x: s.sx, y: s.sy - s.k * .5, fy: s.sy, k: s.k } : null; };
      const P = at(G.player), F = at(G.follow), M = G.pom.show ? at(G.pom) : null; const c = document.querySelector('canvas'), dpr = c.width / innerWidth;
      const lum = q => { const g = c.getContext('2d'), R = Math.max(6, q.k * .25 * dpr) | 0, d = g.getImageData(Math.max(0, q.x * dpr - R) | 0, Math.max(0, q.y * dpr - R) | 0, R * 2, R * 2).data; let s = 0, n = 0; for (let i = 0; i < d.length; i += 16) { s += d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; n++; } return s / n; }, lit = q => (lum(q) + lum({ x: q.x, y: q.fy, k: q.k })) / 2; // 体と足もと（光のたまり）の平均。白い子（ポム）は体だけだと明るさの上がり方が小さいため
      const W = innerWidth, Hh = innerHeight, S = Math.min(W, Hh) * .25, spots = [[S * .3, S * .3], [W - S * .3, S * .3], [S * .3, Hh * .5], [W - S * .3, Hh * .5], [W * .5, Hh * .7]].map(([x, y]) => ({ x, y, k: S }));
      const sat = q => { const g = c.getContext('2d'), d = g.getImageData(Math.max(0, (q.x - q.k * .45) * dpr) | 0, Math.max(0, (q.fy - q.k * 1.05) * dpr) | 0, q.k * .9 * dpr | 0, q.k * 1.05 * dpr | 0).data; let S = 0, n = 0; for (let i = 0; i < d.length; i += 8) { const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); S += mx ? (mx - mn) / mx : 0; n++; } return S / n; };
      const pn = performance.now.bind(performance), dn = Date.now, T0 = pn(), D0 = dn(); performance.now = () => T0; Date.now = () => D0;   // 比べる 2 回の絵は同じ瞬間にする（2026-11-18：選んだ子が跳ねる間に描くと、位置がずれて明るさが 103% などになり、時々落ちていた）
      H.ev('render()'); const satOn = sat(P); window.__tlOff = 1; H.ev('render()'); const satOff = sat(P); window.__tlOff = 0;
      H.ev('render()'); const on = [lit(P), lit(F), M ? lit(M) : null], eon = spots.map(lum); window.__tlOff = 1; H.ev('render()'); const off = [lit(P), lit(F), M ? lit(M) : null], eoff = spots.map(lum); window.__tlOff = 0;
      performance.now = pn; Date.now = dn;
      return { n1, P, F, M, on, off, eon, eoff, satOn, satOff, W: innerWidth }; });
    const tag = `${w}×${h} ${ch}：`;
    if (!(r.n1 > 3)) bad.push(tag + 'ホーム画面で光を描いていない');
    if (!r.P || !r.F) { bad.push(tag + 'キャラクターが画面にいない'); await p.close(); continue; }
    const mid = w > h * 1.25 ? null : r.W / 2; // 横長は右に札があるので、まん中の決まりはたて長だけ
    if (mid != null && Math.abs(r.P.x - mid) > r.W * .08) bad.push(tag + '選んだ子がまん中にいない（x=' + r.P.x.toFixed(0) + '）');
    for (const [nm, q] of [['2 人目', r.F], ['3 人目', r.M]]) if (q && !(r.P.k > q.k * 1.1)) bad.push(tag + '選んだ子がいちばん手前ではない（' + nm + '）');
    for (const [nm, q] of [['2 人目', r.F], ['3 人目', r.M]]) if (q && Math.abs(q.x - r.P.x) < r.P.k * .95) bad.push(tag + nm + 'が選んだ子に重なっている（横の間 ' + Math.abs(q.x - r.P.x).toFixed(0) + '・目安 ' + (r.P.k * .95).toFixed(0) + '）');
    const kP = r.on[0] / r.off[0]; if (!(kP < 1.03)) bad.push(tag + '選んだ子にスポットライトが当たっている（' + (kP * 100).toFixed(0) + '%。オーナー 2026-11-17：ライトはいらない）'); if (!(kP > .985)) bad.push(tag + '選んだ子が暗くなっている（' + (kP * 100).toFixed(0) + '%）');
    for (const [nm, i] of [['2 人目', 1], ['3 人目', 2]]) { if (r.on[i] == null) continue; const k = r.on[i] / r.off[i];
      if (!(k > .985)) bad.push(tag + nm + 'が暗くなっている（' + (k * 100).toFixed(0) + '%）'); if (!(k < 1.03)) bad.push(tag + nm + 'にスポットライトが当たっている（' + (k * 100).toFixed(0) + '%）'); }
    if (!(r.satOn >= r.satOff * .9)) bad.push(tag + '選んだ子の色がうすくなっている（彩度 ' + (r.satOn / r.satOff * 100).toFixed(0) + '%）');
    r.eon.forEach((v, i) => { if (!(v >= r.eoff[i] * .985)) bad.push(tag + '画面が暗くなっている（' + ['左上', '右上', '左', '右', '下'][i] + ' ' + (v / r.eoff[i] * 100).toFixed(0) + '%）'); });
    if (w === 390 && ch === 'ren') { await p.click('#btnStart'); await p.waitForTimeout(900); const n2 = await p.evaluate(() => window.__tl); await p.waitForTimeout(900); const n3 = await p.evaluate(() => window.__tl); if (n3 !== n2) bad.push('走っている間も光を描いている（' + (n3 - n2) + ' 回）'); }
    await p.close(); }
  await b.close(); if (bad.length) { console.log('HOMELIGHT NG\n' + bad.join('\n')); process.exit(1); } console.log('HOMELIGHT OK 3 画面 × 3 人'); })();
