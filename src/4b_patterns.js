/* ================= surface patterns ================= */
/* street details laid on the ground: manholes, crosswalks, painted words, lane arrows, drain grates, odd slabs */
function decalDraw(p, d) {
  if (d > 60) return; const a = clamp(1 - d / 60, 0, 1) * (LT.night > .5 ? .8 : 1), T = c => tint(c);
  ctx.globalAlpha = a;
  switch (p.dec) {
    case 'futonD': quadImage(futonTopTex3(), 14, 10); break; // 敷きぶとんの上の面（2026-11-17：箱の上にのせる。マットのふちまでいっぱいに）
    case 'futonShadow': quadImage(futonShadowTex(), 6, 6); break;
    case 'zabuTop': quadImage(zabuTopTex(p.zc || '#B4572E'), 6, 6); break; // 2026-11-17 ホーム画面の第 2 段：座布団の上の面
    case 'zabuShadow': quadImage(futonShadowTex(), 4, 4); break; // the boss's futon, still unmade (a soft painted picture laid on the floor in perspective)
    case 'manhole': { const c = bil(.5, .5), ex = bil(1, .5), ey = bil(.5, 1), rx = Math.hypot(ex[0] - c[0], ex[1] - c[1]), ry = Math.abs(ey[1] - c[1]) + Math.abs(ey[0] - c[0]) * .05;
      ctx.beginPath(); ctx.ellipse(c[0], c[1], Math.max(1, rx), Math.max(1, Math.max(rx * .18, ry)), Math.atan2(ex[1] - c[1], ex[0] - c[0]), 0, Math.PI * 2); ctx.fillStyle = T('#4E4C48'); ctx.fill(); ctx.strokeStyle = T('#2E2C2A'); ctx.lineWidth = Math.max(.8, 18 / d); ctx.stroke();
      if (d < 22) { ctx.globalAlpha = a * .5; ctx.beginPath(); for (let k = 1; k < 4; k++) bline(.5 - k * .1, .2, .5 - k * .1, .8), bline(.5 + k * .1, .2, .5 + k * .1, .8); ctx.strokeStyle = T('#6E6A64'); ctx.lineWidth = Math.max(.6, 10 / d); ctx.stroke(); } break; }
    case 'zebra': for (let v = .06; v < .94; v += .16) bquad(.0, v, 1, v + .09, T('#EEEDE8')); break;
    case 'stop': bquad(.05, .2, .95, .8, 'rgba(0,0,0,0)'); if (d < 40) qtext(tr('とまれ', 'STOP'), .1, .15, .9, .85, T('#F2F1EC')); break;
    case 'arrow': { const P = [[.2, .4], [.6, .4], [.6, .25], [.95, .5], [.6, .75], [.6, .6], [.2, .6]]; ctx.beginPath(); P.forEach(([u, v], i) => { const q = bil(u, v); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fillStyle = T('#EEEDE8'); ctx.fill(); break; }
    case 'yArrowL': case 'yArrowR': { const L2 = p.dec === 'yArrowL', vv = v => L2 ? v : 1 - v; /* [Y1] ななめの矢印：まっすぐ進んで、とちゅうからななめに曲がる。先は三角 */ ctx.strokeStyle = T('#EEEDE8'); ctx.lineWidth = Math.max(1.2, 70 / Math.max(d, 4)); ctx.lineCap = 'butt'; ctx.beginPath(); let q = bil(.08, vv(.62)); ctx.moveTo(q[0], q[1]); q = bil(.5, vv(.62)); ctx.lineTo(q[0], q[1]); q = bil(.78, vv(.3)); ctx.lineTo(q[0], q[1]); ctx.stroke();
      const P2 = [[.7, .18], [.95, .08], [.84, .4]]; ctx.beginPath(); P2.forEach(([u, v], i) => { const q2 = bil(u, vv(v)); i ? ctx.lineTo(q2[0], q2[1]) : ctx.moveTo(q2[0], q2[1]); }); ctx.closePath(); ctx.fillStyle = T('#EEEDE8'); ctx.fill(); break; }
    case 'grate': bquad(0, 0, 1, 1, T('#3E3C39')); if (d < 25) { ctx.beginPath(); for (let k = 1; k < 8; k++) bline(k / 8, .1, k / 8, .9); ctx.strokeStyle = T('#26241F'); ctx.lineWidth = Math.max(.6, 12 / d); ctx.stroke(); } break;
    case 'tdoor': { const w0 = p.sd < 0 ? 0 : 1, vv = v => p.sd < 0 ? v : 1 - v; /* [65] ドアのしきい：溝のある金属 [66] 黄色い注意の帯（点の出っぱり） [67] しきいのかげ */
      ctx.globalAlpha = a; bquad(0, Math.min(vv(0), vv(.22)), 1, Math.max(vv(0), vv(.22)), T('#A9B1B8')); if (d < 22) { ctx.strokeStyle = T('#6E7881'); ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 4; k++) bline(0, vv(k * .055), 1, vv(k * .055)); ctx.stroke(); }
      bquad(0, Math.min(vv(.22), vv(.6)), 1, Math.max(vv(.22), vv(.6)), T('#E8C23A')); if (d < 16) { ctx.globalAlpha = a * .5; for (let i = 0; i < 10; i++) for (let j = 0; j < 3; j++) { const v0 = vv(.27 + j * .11); bquad(i / 10 + .03, v0 - .02, i / 10 + .06, v0 + .02, '#B8961E'); } }
      ctx.globalAlpha = a * .25; bquad(0, Math.min(vv(.6), vv(.68)), 1, Math.max(vv(.6), vv(.68)), '#000000'); break; }
    case 'tseatF': { const vv = v => p.sd < 0 ? v : 1 - v; ctx.globalAlpha = a * .32; bquad(0, Math.min(vv(0), vv(.9)), 1, Math.max(vv(0), vv(.9)), '#2A323A'); ctx.globalAlpha = a * .18; bquad(0, Math.min(vv(.9), vv(1)), 1, Math.max(vv(.9), vv(1)), '#2A323A'); break; } // [14] 座席の下の暗がりと、足もとのかげ
    case 'tsun': { if (LT.night > .3 || G.weather === 'rain') break; const dist = G.dist || G.t * 12, sh = Math.sin(dist * .23 + p.a) + Math.sin(dist * .61 + p.a * 2); if (sh < -1.1) break; /* [91] ビルや柱のかげが通ると、日だまりが一瞬消える [92] 夜・雨・トンネルでは出ない */
      ctx.globalAlpha = a * (sh > .4 ? .2 : .1); const k0 = p.sd < 0 ? 0 : 1; bquad(.06, 0, .94, 1, '#FFF1C8'); ctx.globalAlpha = a * .08; bquad(.02, 0, .98, 1, '#FFE6A8'); break; }
    case 'spill': { if (LT.night < .35) break; ctx.globalAlpha = a * .22 * (LT.night - .2); const g0 = ctx.createLinearGradient(...bil(.5, 1), ...bil(.5, 0)); g0.addColorStop(0, 'rgba(255,214,150,1)'); g0.addColorStop(1, 'rgba(255,214,150,0)'); bquad(0, 0, 1, 1, g0); break; } // [G25] 店の明かりのこぼれ（建物の側ほど明るい）
    case 'alleyF': { ctx.globalAlpha = a; bquad(0, 0, 1, 1, T('#6E6A64')); ctx.globalAlpha = a * .35; bquad(.4, .1, .6, 1, '#4A4743'); ctx.globalAlpha = a * .6; bquad(.42, .5, .58, .62, '#2B2826'); ctx.globalAlpha = a * .2; bquad(.1, .6, .3, .9, '#3B3631'); break; } // [G60] 路地の床：まん中の溝・ふたの格子・水のしみ
    case 'mat': ctx.globalAlpha = a * .85; bquad(0, 0, 1, 1, T('#3B3F46')); ctx.globalAlpha = a * .4; bquad(.08, .15, .92, .85, T('#5A6168')); break; // [S2] 入口のマット
    case 'recessF': { if (LT.night > .35) { ctx.globalAlpha = a * .35; bquad(0, 0, 1, 1, '#FFE2A8'); } ctx.globalAlpha = a * .3; /* [G26] 夜は、のきの下の床がダウンライトで明るい */ ctx.strokeStyle = T('#6E6A64'); ctx.beginPath(); for (let k = 1; k < 6; k++) bline(k / 6, 0, k / 6, 1); bline(0, .5, 1, .5); ctx.stroke(); ctx.globalAlpha = a * .25; bquad(0, .7, 1, 1, '#2B2622'); break; } // [G14] 奥の床のタイルと、奥ほど暗いかげ
    case 'tgang': { ctx.globalAlpha = a; bquad(0, 0, 1, 1, T('#9AA3AB')); if (d < 25) { ctx.strokeStyle = T('#7A848D'); ctx.lineWidth = 1; ctx.beginPath(); for (let k = 0; k < 14; k++) bline(0, k / 14, 1, k / 14 + .04); ctx.stroke(); } ctx.globalAlpha = a * .6; bquad(0, 0, .06, 1, '#2A2E33'); bquad(.94, 0, 1, 1, '#2A2E33'); bquad(.48, 0, .52, 1, '#3A3F45'); break; } // [15] 渡り板：すべり止めの筋・前後のすき間・まん中の合わせ目
    case 'patch': ctx.globalAlpha = a * .3; bquad(0, 0, 1, 1, T(p.pc || '#5E5E62')); break;
  }
  ctx.globalAlpha = 1;
}
// a picture laid on the floor quad in SCR (u along the first edge, v along the second), in small cells so the perspective holds
function quadImage(img, nu, nv) {
  if (!img || !img.width) return; const W = img.width, H = img.height;
  const tri = (p0, p1, p2, t0, t1, t2) => {
    const cx = (p0[0] + p1[0] + p2[0]) / 3, cy = (p0[1] + p1[1] + p2[1]) / 3, gr = q => { const dx = q[0] - cx, dy = q[1] - cy, l = Math.hypot(dx, dy) || 1; return [q[0] + dx / l * 1.6, q[1] + dy / l * 1.6]; }; // grown a hair so no seams show
    const a = gr(p0), b = gr(p1), c = gr(p2);
    const du1 = t1[0] - t0[0], dv1 = t1[1] - t0[1], du2 = t2[0] - t0[0], dv2 = t2[1] - t0[1], det = du1 * dv2 - du2 * dv1; if (Math.abs(det) < 1e-6) return;
    const x1 = p1[0] - p0[0], y1 = p1[1] - p0[1], x2 = p2[0] - p0[0], y2 = p2[1] - p0[1];
    const A = (x1 * dv2 - x2 * dv1) / det, B = (y1 * dv2 - y2 * dv1) / det, C = (x2 * du1 - x1 * du2) / det, D = (y2 * du1 - y1 * du2) / det;
    ctx.save(); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.clip();
    ctx.transform(A, B, C, D, p0[0] - A * t0[0] - C * t0[1], p0[1] - B * t0[0] - D * t0[1]); ctx.drawImage(img, 0, 0); ctx.restore(); };
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u0 = i / nu, u1 = (i + 1) / nu, v0 = j / nv, v1 = (j + 1) / nv;
    const P00 = bil(u0, v0), P10 = bil(u1, v0), P11 = bil(u1, v1), P01 = bil(u0, v1), T = (u, v) => [u * W, v * H];
    tri(P00, P10, P11, T(u0, v0), T(u1, v0), T(u1, v1)); tri(P00, P11, P01, T(u0, v0), T(u1, v1), T(u0, v1));
  }
}
// the boss's futon from above: white mattress with rounded corners, the quilt thrown back in a soft fold, the pillow with the dent of his head
// 敷きぶとんの上の面：元の絵からマットの所だけを切り出し、すみの丸みのすき間はマットの色でうめる（厚みの箱の上にぴったりのる）
function futonTopTex2() { return artCanvas('futonTop2', 700, 500, (g, W, H) => { g.__keep = 1; g.fillStyle = '#EFE8D8'; g.fillRect(0, 0, W, H); g.drawImage(futonTopTex(), W * .07, H * .06, W * .86, H * .84, 0, 0, W, H);
  { const e = 26; for (const [x, y, w, h, gx0, gy0, gx1, gy1] of [[0, 0, W, e, 0, 0, 0, e], [0, H - e, W, e, 0, H, 0, H - e], [0, 0, e, H, 0, 0, e, 0], [W - e, 0, e, H, W, 0, W - e, 0]]) { const gr = g.createLinearGradient(gx0, gy0, gx1, gy1); gr.addColorStop(0, 'rgba(120,100,70,.32)'); gr.addColorStop(.5, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x, y, w, h); } } // [6b] ふちの丸み（外はかげ、内側に光）
  { const qy = H * (.36 - .06) / .84; const sg = g.createLinearGradient(0, qy - 34, 0, qy + 6); sg.addColorStop(0, 'rgba(70,55,35,0)'); sg.addColorStop(1, 'rgba(70,55,35,.3)'); g.fillStyle = sg; g.fillRect(0, qy - 34, W, 40); // [6] 掛けぶとんの折り返しが、シーツに落とすかげ（厚み）
    const r = rnd(12); for (let i = 0; i < 9; i++) { const x = W * (.08 + r() * .84), y = qy + H * (.12 + r() * .45); const lg = g.createRadialGradient(x - 20, y - 14, 4, x, y, 70); lg.addColorStop(0, 'rgba(255,255,255,.22)'); lg.addColorStop(.6, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(20,30,60,.12)'); g.fillStyle = lg; g.beginPath(); g.ellipse(x, y, 80, 48, 0, 0, 7); g.fill(); } } // [6c] 掛けぶとんのふっくらしたふくらみ
  g.strokeStyle = 'rgba(160,140,110,.35)'; g.lineWidth = 3; g.strokeRect(4, 4, W - 8, H - 8); // [7] ふちのとじ目
  g.fillStyle = 'rgba(140,120,90,.18)'; for (const [x, y] of [[.12, .5], [.88, .5], [.12, .9], [.88, .9], [.5, .9]]) { g.beginPath(); g.arc(W * x, H * y, 5, 0, 7); g.fill(); } // [8] 綿がずれないためのとじ（小さなくぼみ）
  const sg = g.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, 'rgba(255,240,215,.2)'); sg.addColorStop(1, 'rgba(0,0,0,.06)'); g.fillStyle = sg; g.fillRect(0, 0, W, H); }); } // [9] 障子からの光で、奥が明るい
function futonShadowTex() { return artCanvas('futonShadow', 200, 160, (g, W, H) => { g.__keep = 1; g.filter = 'blur(10px)'; g.fillStyle = 'rgba(50,38,22,.42)'; g.fillRect(W * .07, H * .08, W * .86, H * .84); g.filter = 'none'; }); }
function futonTopTex() {
  return artCanvas('futonTop', 700, 500, (g, W, H) => { g.__keep = 1;
    const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); };
    // soft shadow on the tatami
    g.save(); g.filter = 'blur(14px)'; g.fillStyle = 'rgba(60,45,25,.38)'; rr(W * .07, H * .09, W * .87, H * .84, 50); g.fill(); g.restore();
    // the mattress
    const mx = W * .07, my = H * .06, mw = W * .86, mh = H * .84;
    let gr = g.createRadialGradient(W * .45, H * .4, 20, W * .5, H * .5, W * .62); gr.addColorStop(0, '#FBF8F1'); gr.addColorStop(.75, '#F1EADC'); gr.addColorStop(1, '#DED3BF');
    rr(mx, my, mw, mh, 46); g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(170,150,115,.35)'; g.lineWidth = 3; g.setLineDash([9, 8]); rr(mx + 16, my + 16, mw - 32, mh - 32, 34); g.stroke(); g.setLineDash([]); // the stitched edge
    // creases in the sheet where he lay
    g.strokeStyle = 'rgba(160,140,110,.22)'; g.lineWidth = 5; g.lineCap = 'round';
    for (const [x0, y0, x1, y1, cx, cy] of [[.22, .3, .5, .24, .36, .2], [.55, .28, .8, .33, .68, .24], [.3, .36, .62, .38, .46, .42]]) { g.beginPath(); g.moveTo(W * x0, H * y0); g.quadraticCurveTo(W * cx, H * cy, W * x1, H * y1); g.stroke(); }
    // the pillow (buckwheat, a little lumpy) with the dent of his head
    const px = W * .3, py = H * .06, pw = W * .4, ph = H * .2;
    g.save(); g.filter = 'blur(6px)'; g.fillStyle = 'rgba(80,60,30,.3)'; rr(px + 6, py + 10, pw, ph, 40); g.fill(); g.restore();
    gr = g.createLinearGradient(0, py, 0, py + ph); gr.addColorStop(0, '#F3ECDD'); gr.addColorStop(1, '#D8C9AC'); rr(px, py, pw, ph, 42); g.fillStyle = gr; g.fill();
    g.fillStyle = 'rgba(120,95,60,.16)'; g.beginPath(); g.ellipse(px + pw * .5, py + ph * .55, pw * .24, ph * .3, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(150,120,80,.3)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(px + 18, py + ph * .5); g.quadraticCurveTo(px + pw * .5, py + ph * .46, px + pw - 18, py + ph * .5); g.stroke();
    // the quilt, thrown back: a wavy fold edge, its pale lining showing, then the patterned top
    const qy = H * .36, wave = x => qy + Math.sin(x / W * Math.PI * 3 + .6) * H * .025 + (x / W) * H * .04;
    const top = (y0) => { g.beginPath(); g.moveTo(mx - 6, y0(mx - 6)); for (let x = mx - 6; x <= mx + mw + 6; x += 10) g.lineTo(x, y0(x)); g.lineTo(mx + mw + 6, my + mh - 10); g.quadraticCurveTo(mx + mw + 6, my + mh + 6, mx + mw - 30, my + mh + 6); g.lineTo(mx + 24, my + mh + 6); g.quadraticCurveTo(mx - 6, my + mh + 6, mx - 6, my + mh - 20); g.closePath(); };
    g.save(); g.filter = 'blur(8px)'; g.fillStyle = 'rgba(50,40,30,.3)'; top(x => wave(x) - 6); g.fill(); g.restore();
    gr = g.createLinearGradient(0, qy, 0, my + mh); gr.addColorStop(0, '#8EAACE'); gr.addColorStop(.5, '#7D9CC4'); gr.addColorStop(1, '#6787B2'); top(wave); g.fillStyle = gr; g.fill();
    g.save(); top(wave); g.clip();
    const rn = rnd(11); g.fillStyle = 'rgba(255,255,255,.2)'; for (let k = 0; k < 150; k++) { const x = rn() * W, y = qy + rn() * H * .6; for (let i = 0; i < 5; i++) { const a = i * Math.PI * .4; g.beginPath(); g.arc(x + Math.cos(a) * 3.4, y + Math.sin(a) * 3.4, 2.4, 0, Math.PI * 2); g.fill(); } }
    // big soft folds in the quilt
    for (const [x, w, k] of [[.25, .1, .14], [.52, .14, .1], [.78, .09, .13]]) { const fg = g.createLinearGradient(W * (x - w), 0, W * (x + w), 0); fg.addColorStop(0, 'rgba(30,40,70,0)'); fg.addColorStop(.5, `rgba(30,40,70,${k})`); fg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = fg; g.fillRect(W * (x - w), qy, W * w * 2, H); }
    const ed = g.createLinearGradient(0, my + mh - 40, 0, my + mh + 6); ed.addColorStop(0, 'rgba(20,30,60,0)'); ed.addColorStop(1, 'rgba(20,30,60,.25)'); g.fillStyle = ed; g.fillRect(0, my + mh - 40, W, 60);
    g.restore();
    // the turned-down lining along the fold
    g.beginPath(); for (let x = mx - 6; x <= mx + mw + 6; x += 10) { const y = wave(x); x === mx - 6 ? g.moveTo(x, y) : g.lineTo(x, y); } for (let x = mx + mw + 6; x >= mx - 6; x -= 10) g.lineTo(x, wave(x) + H * .06 + Math.sin(x * .02) * 3); g.closePath();
    gr = g.createLinearGradient(0, qy, 0, qy + H * .1); gr.addColorStop(0, '#FBF7EE'); gr.addColorStop(1, '#D9D2C2'); g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(90,110,150,.45)'; g.lineWidth = 2; g.beginPath(); for (let x = mx - 6; x <= mx + mw + 6; x += 10) { const y = wave(x) + H * .06 + Math.sin(x * .02) * 3; x === mx - 6 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
  });
}
/* 道路のアスファルト（2026-11-17 景色 21〜30。オーナー「図形の組み合わせだけのような景色にならないように」）。
   本物の東京の道は、①車のタイヤが通る所が黒くみがかれた 2 本の帯 ②白線はところどころはげる ③ひび割れをふさいだ黒いタールのすじ
   ④掘り返して埋めた四角い補修のあと ⑤小石まじりの細かいつぶ ⑥車の止まる所の油じみ ⑦1 区画ごとに色がちがう（舗装の年） */
function roadWear(p, d, a, T) { const r = rnd(p.ti * 31 + 7 + ((p.a || 0) * 13 | 0)), near = d < 18;
  ctx.stroke(); ctx.beginPath();
  ctx.globalAlpha = a * .08; bquad(0, .04, 1, .96, p.ti % 4 === 1 ? '#000000' : p.ti % 4 === 3 ? '#FFFFFF' : 'rgba(0,0,0,0)'); // [27] 区画ごとの色のちがい
  ctx.globalAlpha = a * .13; for (const v of [.12, .23, .44, .55, .76, .87]) bquad(0, v - .025, 1, v + .025, '#1A1A1E'); // [21] タイヤの通り道の黒い帯（1 車線に 2 本）
  if (near) { ctx.globalAlpha = a * .35; for (let i = 0; i < 26; i++) { const u = r(), v = .05 + r() * .9, c = r() < .5 ? '#B9B6AE' : '#2E2E32'; bquad(u, v, u + .006, v + .008, c); } } // [22] 小石まじりの細かいつぶ
  if (p.ti % 7 === 3) { ctx.globalAlpha = a * .5; ctx.strokeStyle = '#18181B'; ctx.lineWidth = Math.max(.6, 6 / Math.max(d, 4)); ctx.beginPath(); let u = r() * .3, v = .1 + r() * .3; for (let k = 0; k < 5; k++) { const u2 = u + .1 + r() * .15, v2 = v + (r() - .3) * .2; bline(u, v, u2, v2); u = u2; v = v2; } ctx.stroke(); ctx.beginPath(); } // [23] ひび割れをふさいだ黒いタールのすじ
  if (p.ti % 11 === 5) { ctx.globalAlpha = a * .08; const v0 = .1 + r() * .5; bquad(.15, v0, .85, v0 + .25, '#2A2A2E'); ctx.globalAlpha = a * .14; ctx.strokeStyle = '#1A1A1E'; ctx.beginPath(); bline(.15, v0, .85, v0); bline(.15, v0 + .25, .85, v0 + .25); bline(.15, v0, .15, v0 + .25); bline(.85, v0, .85, v0 + .25); ctx.stroke(); ctx.beginPath(); } // [24] 掘り返して埋めた補修のあと（色のちがう四角と継ぎ目）
  if (p.ti % 3 !== 2 && near) { ctx.globalAlpha = a * .7; for (let i = 0; i < 4; i++) { const u = r(); for (const v of [.355, .645]) bquad(u, v - .006, u + .04 + r() * .05, v + .006, T('#5A5A60')); } } // [25] 白線のはげた所
  if (p.ti % 9 === 4) { ctx.globalAlpha = a * .18; const c = bil(.5, .2 + (p.ti % 3) * .3); ctx.fillStyle = '#121214'; ctx.beginPath(); ctx.ellipse(c[0], c[1], Math.max(2, 40 / d), Math.max(1, 14 / d), 0, 0, 7); ctx.fill(); } // [26] 車が止まる所の油じみ
  roadMarks(p, d, a, T, r, near);
  ctx.globalAlpha = a; }
/* 2026-11-17 景色 51〜62：東京の道の路面（マンホール・側溝・路面の数字と矢印・ひし形・水たまり）。タイル 1 枚＝長さ 1.5m・はば 5.2m（u＝進む向き、v＝横） */
function roadPaint(fn, u0, u1, v0, v1) { const o = bil(u1, v0), x = bil(u1, v1), y = bil(u0, v0); ctx.save(); ctx.transform((x[0] - o[0]) / 100, (x[1] - o[1]) / 100, (y[0] - o[0]) / 100, (y[1] - o[1]) / 100, o[0], o[1]); fn(); ctx.restore(); } // 100×100 の箱に描くと、路面に寝かせて貼れる（上＝進む先）
function roadMarks(p, d, a, T, r, near) { const ti = p.ti, night = LT.night > .5, paint = T('#E9E8E1');
  if (ti % 13 === 6) { const v = [.175, .5, .825][(ti >> 2) % 3], ru = .2, rv = .058, ring = (k, rr, ss) => { const c = bil(.5 + Math.cos(k) * rr, v + Math.sin(k) * ss); return c; }, disc = (rr, ss, fill) => { ctx.beginPath(); for (let k = 0; k <= 24; k++) { const c = ring(k / 24 * 6.2832, rr, ss); k ? ctx.lineTo(c[0], c[1]) : ctx.moveTo(c[0], c[1]); } ctx.fillStyle = fill; ctx.fill(); };
    ctx.globalAlpha = a * .25; disc(ru * 1.5, rv * 1.5, '#55565B'); // [53] ふたのまわりの、新しいアスファルトの輪
    ctx.globalAlpha = a * .95; disc(ru, rv, T('#3F3D3B')); ctx.globalAlpha = a * .9; disc(ru * .86, rv * .86, T('#55524D')); // [51] マンホールの鉄のふた（ふちの輪）
    if (near) { ctx.globalAlpha = a * .5; ctx.strokeStyle = T('#2E2C2A'); ctx.lineWidth = Math.max(.5, 3 / d); ctx.beginPath(); for (let k = -3; k <= 3; k++) { bline(.5 + k * ru * .25, v - rv * .8 * Math.sqrt(1 - (k / 3.6) ** 2), .5 + k * ru * .25, v + rv * .8 * Math.sqrt(1 - (k / 3.6) ** 2)); bline(.5 - ru * .8 * Math.sqrt(1 - (k / 3.6) ** 2), v + k * rv * .25, .5 + ru * .8 * Math.sqrt(1 - (k / 3.6) ** 2), v + k * rv * .25); } ctx.stroke(); } // [52] ふたのすべり止めのもよう
    ctx.globalAlpha = a * (night ? .12 : .22); disc(ru * .35, rv * .5, '#FFFFFF'); } // [54] ふたのにぶい光り
  ctx.globalAlpha = a * .55; bquad(0, 0, 1, .022, T('#A9A79F')); bquad(0, .978, 1, 1, T('#A9A79F')); ctx.globalAlpha = a * .5; ctx.strokeStyle = T('#6E6C66'); ctx.beginPath(); bline(.5, 0, .5, .022); bline(.5, .978, .5, 1); bline(0, .022, 1, .022); bline(0, .978, 1, .978); ctx.stroke(); // [55] 道の両はしの側溝のコンクリートのふた（継ぎ目つき）
  if (ti % 4 === 2) { ctx.globalAlpha = a * .9; bquad(.2, .002, .8, .02, T('#4A4844')); bquad(.2, .98, .8, .998, T('#4A4844')); if (near) { ctx.globalAlpha = a * .8; for (let k = 0; k < 9; k++) { const u = .23 + k * .065; bquad(u, .004, u + .03, .018, '#141414'); bquad(u, .982, u + .03, .996, '#141414'); } } } // [56] 鉄の格子ぶた [57] 格子のすきまの暗さ
  const lane = [.175, .5, .825], fade = (u0, u1, v0, v1) => { if (!near) return; ctx.globalAlpha = a * .6; for (let k = 0; k < 3; k++) { const u = u0 + r() * (u1 - u0), w = v0 + r() * (v1 - v0); bquad(u, w, u + .05, w + .02, T('#6C6D72')); } }; // [60] 路面の字・矢印のかすれ
  const k37 = ti % 37, span = (t0, len, fn) => { if (k37 < t0 || k37 >= t0 + len) return; const uA = t0 - k37, a0 = bil(0, 0), a1 = bil(1, 0), a2 = bil(1, 1), a3 = bil(0, 1); ctx.save(); ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.lineTo(a3[0], a3[1]); ctx.closePath(); ctx.clip(); fn(uA, uA + len); ctx.restore(); }; // 何枚かのタイルにまたがる字・矢印は、タイルごとに自分の分だけ描く
  span(17, 3, (u0, u1) => { const v = lane[1]; ctx.globalAlpha = a * .85; roadPaint(() => { ctx.fillStyle = paint; ctx.font = '900 100px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('30', 50, 52, 92); }, u0, u1, v - .11, v + .11); fade(u0 + .1, u1 - .2, v - .08, v + .08); }); // [58] 路面の「30」（進む向きに細長い字）
  for (const t0 of [4, 30]) span(t0, 2, (u0, u1) => { const v = lane[(t0 >> 1) % 3]; ctx.globalAlpha = a * .85; roadPaint(() => { ctx.fillStyle = paint; ctx.beginPath(); ctx.moveTo(50, 0); ctx.lineTo(88, 34); ctx.lineTo(62, 34); ctx.lineTo(62, 100); ctx.lineTo(38, 100); ctx.lineTo(38, 34); ctx.lineTo(12, 34); ctx.closePath(); ctx.fill(); }, u0, u1, v - .06, v + .06); fade(u0 + .1, u1 - .1, v - .03, v + .03); }); // [59] 進む向きの矢印
  for (const t0 of [22, 25]) span(t0, 2, (u0, u1) => { ctx.globalAlpha = a * .8; ctx.strokeStyle = paint; ctx.lineWidth = Math.max(.8, 14 / Math.max(d, 4)); const um = (u0 + u1) / 2; for (const v of lane) { ctx.beginPath(); bline(um, v - .1, u0, v); bline(u0, v, um, v + .1); bline(um, v + .1, u1, v); bline(u1, v, um, v - .1); ctx.stroke(); } }); // [61] 「この先に横断歩道」のひし形（2 つ続けて）
  if (ti % 17 === 9) { const v = lane[ti % 3] + .06, c = bil(.5, v); ctx.globalAlpha = a * (night ? .3 : .22); ctx.fillStyle = night ? '#F2D59A' : T('#C9D6E2'); ctx.beginPath(); ctx.ellipse(c[0], c[1], Math.max(2, 70 / d), Math.max(1, 9 / d), 0, 0, 7); ctx.fill(); } // [62] 水たまりにうつる空（夜は街灯の色）
}
function floorPattern(p, d) {
  if (p.dec) return decalDraw(p, d);
  if (d > 70 && p.pat !== 'sea' && p.pat !== 'water') return;
  const a = clamp(1 - d / 70, 0, 1);
  ctx.globalAlpha = a * .4; ctx.lineWidth = Math.max(.5, 19 / Math.max(d, 4)); ctx.beginPath();
  const T = (c) => tint(c);
  switch (p.pat) {
    case 'tatami': ctx.strokeStyle = T('#6E6A3A'); bline(0, 0, 0, 1); bline(0, .5, 1, .5); bline(.5, p.ti % 2 ? 0 : .5, .5, p.ti % 2 ? .5 : 1); bline(0, .02, 1, .02); bline(0, .98, 1, .98);
      /* 2026-11-17 畳（ホーム画面ほか）：[31] 長い辺の黒い縁（へり）と、そのもよう、[32] い草の細かい織り目（近くだけ）、[33] 1 枚ごとの色のちがい（新しい畳は青み、古いのは黄色） */
      ctx.stroke(); ctx.globalAlpha = a * .9; bquad(0, 0, 1, .025, T('#2E3A2E')); bquad(0, .975, 1, 1, T('#2E3A2E')); ctx.globalAlpha = a * .35; bquad(0, .006, 1, .012, T('#C9B48A')); bquad(0, .988, 1, .994, T('#C9B48A'));
      ctx.globalAlpha = a * .12; bquad(0, .03, 1, .97, T(p.ti % 3 === 0 ? '#9AB070' : p.ti % 3 === 1 ? '#D9C27A' : '#C9B97A'));
      /* 2026-11-17 ホーム画面の第 2 段（オーナー「まだごわごわしてる」）：手前の畳の目が、太い横じまに見えていた（線の太さが近いほど太くなる作りだった）。
         [64] い草の目を本物の細かさ（約 2cm）に [65] 線は細く・うすく [66] たての糸（経糸）のかすかな線 [67] い草 1 本ずつの色むら [68] 光の当たる向きのつや */
      ctx.stroke(); if (d < 16) { const n = d < 7 ? 90 : 45, r = rnd(p.ti * 41 + 3); ctx.lineWidth = Math.max(.35, 2.2 / Math.max(d, 1)); ctx.globalAlpha = a * (d < 7 ? .1 : .14); ctx.beginPath(); ctx.strokeStyle = T('#6E6636'); for (let k = 1; k < n; k++) bline(k / n, .03, k / n, .97); ctx.stroke();
        ctx.globalAlpha = a * .06; ctx.beginPath(); ctx.strokeStyle = T('#4A4422'); for (let k = 1; k < 8; k++) bline(0, .03 + k * .94 / 8, 1, .03 + k * .94 / 8); ctx.stroke();
        if (d < 9) { ctx.globalAlpha = a * .18; for (let k = 0; k < 40; k++) { const u = r(), v = .03 + r() * .94; bquad(u, v, u + .011, v + .05 + r() * .1, T(r() < .5 ? '#A9B46E' : '#D6C27A')); } }
        ctx.globalAlpha = a * .07; bquad(.2, .03, .45, .97, '#FFFFFF'); } ctx.beginPath(); break;
    case 'boards': ctx.strokeStyle = T('#6B4631'); for (let k = 1; k < 8; k++) bline(0, k / 8, 1, k / 8); { const v = (p.ti * 3 % 8) / 8; bline(.5, v, .5, v + 1 / 8); } break;
    case 'rug': ctx.globalAlpha = a * .7; ctx.strokeStyle = T('#F2C230'); bline(0, .15, 1, .15); bline(0, .85, 1, .85); ctx.stroke(); ctx.beginPath(); ctx.strokeStyle = T('#7A2E24'); bline(0, .5, 1, .5); break;
    case 'grid': ctx.globalAlpha = a * .3; ctx.strokeStyle = T('#8F8676'); for (let k = 0; k <= 4; k++) bline(0, k / 4, 1, k / 4); bline(0, 0, 0, 1); bline(.5, 0, .5, 1); break;
    case 'carpet': ctx.globalAlpha = a * .28; ctx.strokeStyle = T('#4E5B68'); for (let k = 0; k <= 4; k++) bline(0, k / 4, 1, k / 4); bline(0, 0, 0, 1); break;
    case 'stone': case 'plaza': ctx.globalAlpha = a * .22; ctx.strokeStyle = T('#55534D'); for (let k = 0; k <= 4; k++) bline(0, k / 4, 1, k / 4); bline(0, 0, 0, 1); bline(.5, (p.ti % 2) * .25, .5, (p.ti % 2) * .25 + .25); break;
    case 'gravel': ctx.fillStyle = T('#A8966F'); for (let k = 0; k < 8; k++) bquad((k * .37 + p.ti * .11) % .9, (k * .61) % .9, (k * .37 + p.ti * .11) % .9 + .04, (k * .61) % .9 + .05, T('#A8966F'));
      /* 2026-11-17 景色 189〜193：川沿い・公園の土の遊歩道（u＝進む向き 1.5m、v＝横 5.2m） */
      { const r = rnd(p.ti * 17 + 9); ctx.globalAlpha = a * .12; bquad(0, .3, 1, .7, '#FFFFFF'); // [190] 人がよく歩くまん中の、ふみ固められた明るい帯
        ctx.globalAlpha = a * .18; bquad(0, 0, 1, .06, '#3A2E20'); bquad(0, .94, 1, 1, '#3A2E20'); // [191] 両はしの、雨水の流れたあとの暗い帯
        if (d < 22) { ctx.globalAlpha = a * .5; for (let k = 0; k < 30; k++) { const u = r(), v = r(); bquad(u, v, u + .008, v + .004, r() < .5 ? T('#6E5E44') : T('#D8CCB2')); } } // [189] 細かい土のつぶ
        if (d < 30 && p.ti % 3 === 1) { ctx.globalAlpha = a * .8; for (let k = 0; k < 4; k++) { const u = r(), v = .08 + r() * .84; bquad(u, v, u + .03, v + .012, T(['#C9861B', '#A8562A', '#D9B84A', '#7A5A2A'][k % 4])); } } // [192] 落ち葉
        ctx.globalAlpha = a * .22; ctx.strokeStyle = '#4A3C28'; ctx.lineWidth = Math.max(.5, 6 / Math.max(d, 4)); ctx.beginPath(); const v0 = .42 + Math.sin(p.ti * .7) * .04, v1 = .42 + Math.sin(p.ti * .7 + .7) * .04; bline(0, v0, 1, v1); ctx.stroke(); ctx.beginPath(); ctx.globalAlpha = a * .4; } // [193] 自転車のわだち
      break;
    case 'leaves': for (let k = 0; k < 9; k++) bquad((k * .29 + p.ti * .17) % .92, (k * .53) % .9, (k * .29 + p.ti * .17) % .92 + .06, (k * .53) % .9 + .08, k % 2 ? T('#F2CD45') : T('#C9961B')); break;
    case 'road': case 'hokoten': ctx.globalAlpha = Math.min(1, a * 1.5) * .8; ctx.strokeStyle = T('#ECEBE4'); ctx.lineWidth *= 1.25; if (p.ti % 3 !== 2) { bline(0, .355, 1, .355); bline(0, .645, 1, .645); } ctx.stroke(); ctx.beginPath(); ctx.strokeStyle = T('#E4E3DC'); ctx.lineWidth *= 1.2; bline(0, .03, 1, .03); bline(0, .97, 1, .97);
      if (d < 42 && p.pat === 'road') roadWear(p, d, a, T); // 2026-11-17 景色 21〜30：本物のアスファルトの使われたあと
 break;
    case 'scramble': ctx.globalAlpha = Math.min(1, a * 1.6); { const ph = p.ti % 12; if (ph < 7) for (let v = .05; v < .95; v += .125) bquad(0, v, 1, v + .07, T('#ECECE6')); else if (ph === 8) { ctx.globalAlpha = a * .6; ctx.strokeStyle = T('#ECECE6'); ctx.lineWidth *= 2; bline(0, 0, 1, 1); bline(0, 1, 1, 0); } } break;
    case 'petals': case 'petalstone': if (p.pat === 'petalstone') { ctx.strokeStyle = T('#8F8577'); for (let k = 0; k <= 4; k++) bline(0, k / 4, 1, k / 4); bline(.5, (p.ti % 2) * .25, .5, (p.ti % 2) * .25 + .25); ctx.stroke(); ctx.beginPath(); }
      ctx.globalAlpha = Math.min(1, a * 1.6); for (let k = 0; k < 14; k++) { const u = (k * .37 + p.ti * .19) % .95, v = (k * .61 + p.ti * .07) % .95; bquad(u, v, u + .035, v + .045, k % 3 ? T('#F7D3DE') : T('#FBE9EF')); } break;
    case 'lookdown': { /* 展望台のガラスの床（2026-11-17）：床の一部が、ステンレスの細い枠で区切った正方形のガラス。真下の町（屋根・道・緑）が小さく見える。ななめの映りこみ。
      4 枚に 1 枚だけ（全部ガラスだと、暗い横じまが階段に見えた） */
      if (p.ti % 16 !== 5 && p.ti % 16 !== 6) { /* [T5] ガラスの床は 4 か所だけ（24m ごとに 3m。本物も、展望台の床のガラスは数か所） */ ctx.globalAlpha = a * .25; ctx.strokeStyle = T('#8F8676'); for (let k = 0; k <= 2; k++) bline(0, k / 2, 1, k / 2); bline(0, 0, 0, 1); if (d < 30) { ctx.stroke(); ctx.beginPath(); ctx.globalAlpha = a * .16; ctx.strokeStyle = T('#5E636A'); for (let k = -3; k <= 3; k++) { const c = k / 4; bline(Math.max(0, c), Math.max(0, -c), Math.min(1, 1 + c), Math.min(1, 1 - c)); const e = .5 + k / 4 + .5; bline(Math.max(0, e - 1), Math.min(1, e), Math.min(1, e), Math.max(0, e - 1)); } ctx.stroke(); ctx.beginPath(); ctx.globalAlpha = a * .1; bquad(0, 0, 1, .5, p.ti % 2 ? '#FFFFFF' : '#000000'); } break; } /* [T4] ガラスでない所：網目の柄のじゅうたん（ななめの細い線）と、1 枚ごとの毛並みのむら */
      ctx.globalAlpha = a * .95; const r2 = rnd(p.ti * 13 + 5), roof = ['#8E8C86', '#A7A49C', '#7E7C78', '#9C968A', '#B5B2AA', '#6F8A5E'];
      for (const [u0, u1] of [[.22, .5], [.5, .78]]) { bquad(u0, .08, u1, .92, T(LT.night > .4 ? '#1E2433' : '#56626E'));
        for (let k = 0; k < (d < 20 ? 6 : 3); k++) { const u = u0 + .03 + r2() * (u1 - u0 - .12), v = .12 + r2() * .66; bquad(u, v, u + .03 + r2() * .06, v + .06 + r2() * .12, T(LT.night > .4 ? (k % 3 ? '#2A3044' : '#C9A15A') : roof[k % roof.length])); }
        ctx.globalAlpha = a * .2; bquad(u0 + .02, .1, u0 + .07, .9, '#FFFFFF'); ctx.globalAlpha = a * .95; }
      ctx.strokeStyle = T('#D5DADF'); ctx.lineWidth *= 1.8; bline(.22, .08, .22, .92); bline(.5, .08, .5, .92); bline(.78, .08, .78, .92); bline(.22, .08, .78, .08); bline(.22, .92, .78, .92); break; }
    case 'lawn': ctx.globalAlpha = a * .5; bquad(0, 0, 1, .5, T('#8DB26A')); break;
    case 'sand': ctx.globalAlpha = a * .45; for (let k = 0; k < 7; k++) bquad((k * .41 + p.ti * .13) % .9, (k * .67) % .9, (k * .41 + p.ti * .13) % .9 + .05, (k * .67) % .9 + .03, T('#C9B48A')); break;
    case 'brickroad': ctx.strokeStyle = T('#8A7558'); for (let k = 0; k <= 6; k++) bline(0, k / 6, 1, k / 6); for (let k = 0; k < 3; k++) bline(k / 3 + (p.ti % 2) * .16, 0, k / 3 + (p.ti % 2) * .16, 1); break;
    case 'walk': if (d < 30) { ctx.globalAlpha = a * .08; bquad(0, 0, .5, .5, p.ti % 2 ? '#000000' : '#FFFFFF'); bquad(.5, .5, 1, 1, p.ti % 2 ? '#FFFFFF' : '#000000'); const v0 = p.sd < 0 ? .52 : .33; if (d < 16) { ctx.globalAlpha = a * .5; for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) bquad(i / 6 + .03, v0 + .03 + j * .07, i / 6 + .07, v0 + .06 + j * .07, '#B8961E'); } ctx.beginPath(); } /* [28] 歩道のタイル 1 枚ごとの色のちがい [29] 黄色い点字ブロックの点の出っぱり */
      ctx.globalAlpha = a * .25; ctx.strokeStyle = T('#8E887C'); bline(0, 0, 0, 1); bline(.5, 0, .5, 1); bline(0, .5, 1, .5); ctx.stroke(); ctx.globalAlpha = a * .95; { const v0 = p.sd < 0 ? .52 : .33; bquad(0, v0, 1, v0 + .15, T('#E8C23A')); } break;
    case 'platform': ctx.globalAlpha = a * .95; bquad(0, .02, 1, .1, T('#FBF6EE')); bquad(0, .16, 1, .27, T('#E8C23A')); ctx.strokeStyle = T('#8F8676'); ctx.beginPath(); bline(0, .6, 1, .6); break;
    case 'train': { /* 電車の床（2026-11-16）：座席の前（足もと）は少しこい色、通路はうすい色、細かいつぶの模様。黄色い線は出さない（本物の車内には無い） */
      ctx.stroke(); ctx.globalAlpha = a * .5; bquad(0, 0, 1, .14, T('#6E7A86')); bquad(0, .86, 1, 1, T('#6E7A86')); ctx.globalAlpha = a * .8; ctx.beginPath(); ctx.strokeStyle = T('#5E6A76'); bline(0, .14, 1, .14); bline(0, .86, 1, .86); ctx.stroke(); /* [64] 床の横の継ぎ目の線をやめた（本物は 1 枚のシート。前は 3m ごとのタイルに見えた） */
      if (d < 16) { ctx.globalAlpha = a * .35; const r = rnd(p.ti * 7 + 3); for (let k = 0; k < 26; k++) { const u = r(), v = .15 + r() * .7; bquad(u, v, u + .012, v + .012, k % 2 ? '#B9C2CA' : '#6E7A86'); } }
      ctx.globalAlpha = a; ctx.beginPath(); break; }
    case 'planks': ctx.strokeStyle = T('#B9B2A5'); for (let k = 1; k < 7; k++) bline(0, k / 7, 1, k / 7); bline(.5, 0, .5, 1); break;
    case 'stairs': ctx.globalAlpha = Math.min(1, a * 1.4);
      if (p.land) { /* コース 15：踊り場（平らな鉄の板。すべり止めの点、まわりの白い線） */ ctx.globalAlpha = a * .25; bquad(0, .03, 1, .97, '#FFFFFF'); if (d < 22) { ctx.globalAlpha = a * .35; for (let i = 0; i < 6; i++) for (let j = 0; j < 14; j++) bquad(i / 6 + .06, .06 + j * .065, i / 6 + .1, .075 + j * .065, T('#3A3E44')); } ctx.globalAlpha = a * .8; ctx.strokeStyle = T('#F4F4F0'); ctx.beginPath(); bline(0, .03, 1, .03); bline(0, .97, 1, .97); break; }
      ctx.strokeStyle = T('#4F555B'); for (let k = 0; k < 6; k++) bline(k / 6, 0, k / 6, 1); ctx.stroke(); ctx.globalAlpha = a * .22; for (let k = 0; k < 6; k++) bquad(k / 6, 0, k / 6 + .05, 1, '#FFFFFF'); ctx.globalAlpha = Math.min(1, a * 1.4); ctx.beginPath(); ctx.strokeStyle = T('#F2C230'); bline(0, .02, 1, .02); bline(0, .98, 1, .98); /* [19] 段の先の、明るい段鼻 */
      if (p.stepN && d < 40) { ctx.stroke(); ctx.globalAlpha = a * (p.stepBig ? .95 : .7); const big = p.stepBig; roadPaint(() => { ctx.fillStyle = '#FFFFFF'; ctx.font = '900 ' + (big ? 96 : 70) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(p.stepN), 50, 54, 96); }, .1, .9, big ? .3 : .38, big ? .7 : .62); ctx.beginPath(); ctx.globalAlpha = Math.min(1, a * 1.4); } // [17] [18]
      break;
    case 'water': case 'sea': { ctx.globalAlpha = .5; ctx.strokeStyle = LT.night > .5 ? 'rgba(255,220,160,.5)' : 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.4; const o = (G.t * .15) % .25;
      for (let k = 0; k < 4; k++) { const v = (k * .25 + o) % 1; bline(.1 + (k % 2) * .3, v, .35 + (k % 2) * .3, v + .02); }
      /* 2026-11-17 景色 194〜201：川・運河・海の水面 */
      ctx.stroke(); ctx.beginPath(); const N = LT.night > .5, r = rnd(p.ti * 23 + 5), aa = clamp(1 - d / 90, 0, 1);
      ctx.globalAlpha = aa * .18; bquad(0, 0, 1, .15, '#0E2234'); bquad(0, .85, 1, 1, '#0E2234'); // [194] 岸に近いほど濃い色（深さ）
      if (d > 25) { ctx.globalAlpha = aa * .15; bquad(0, .3, 1, .7, N ? '#3A4A6A' : '#E8F2FA'); } // [195] 遠くの水面にうつる空の明るさ
      if (d < 45) { ctx.globalAlpha = aa * .3; ctx.strokeStyle = N ? 'rgba(180,200,230,.6)' : 'rgba(255,255,255,.7)'; ctx.lineWidth = Math.max(.5, 5 / Math.max(d, 4)); for (let k = 0; k < 10; k++) { const u = (r() + G.t * .03) % 1, v = r(); bline(u, v, u + .12, v + .005); } ctx.stroke(); ctx.beginPath(); } // [196] 細かいさざ波
      if (!N) { ctx.globalAlpha = aa * .9; for (let k = 0; k < 5; k++) { const u = r(), v = r(), on = Math.sin(G.t * 6 + k * 2.3 + p.ti) > .6; if (on) bquad(u, v, u + .015, v + .015, '#FFFFFF'); } } // [197] 日の光のきらめき（ちらちら）
      else { ctx.globalAlpha = aa * .35; for (let k = 0; k < 3; k++) { const v = r(), w2 = Math.sin(G.t * 2 + k + p.ti) * .01; bquad(.1 + w2, v, .9 - w2, v + .02, ['#FFD27A', '#FFB060', '#F7F4E0'][k]); } } // [198] 夜：町の明かりの、ゆれる映りこみ
      ctx.globalAlpha = aa * .25; bquad(0, 0, 1, .03, '#1A1A14'); bquad(0, .97, 1, 1, '#1A1A14'); // [200] 岸の水ぎわの黒いしみ
      if (d < 35 && p.ti % 11 === 4) { const ph = (G.t * .5 + p.ti * .13) % 1, c = bil(.5, .5); ctx.globalAlpha = aa * .5 * (1 - ph); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(c[0], c[1], Math.max(2, (10 + ph * 60) / d), Math.max(1, (3 + ph * 16) / d), 0, 0, 7); ctx.stroke(); ctx.beginPath(); } // [201] 魚がはねた波紋の輪
      if (d < 30 && p.ti % 5 === 2) { ctx.globalAlpha = aa * .8; for (let k = 0; k < 3; k++) { const u = (r() + G.t * .02) % 1, v = r(); bquad(u, v, u + .02, v + .01, ['#E8A6B8', '#C9861B', '#F7D3DE'][k]); } } // [199] 水に浮かぶ花びら・落ち葉（ゆっくり流れる）
      ctx.globalAlpha = .5; } break;
  }
  ctx.stroke(); ctx.globalAlpha = 1;
}
function rnd(seed) { let s = Math.abs(seed | 0) % 2147483646 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function wallPattern(w, d) {
  const pat = w.pat, N = LT.night;
  if (pat === 'fac' && w.fv != null) return drawFacadeTex(w, d); /* [R1] 絵のある正面は、遠くでも同じ絵（もやでうすく） */
  if (d > 95) return;
  if (pat === 'fac') return facade(w, d); // far fronts still get their windows, just painted simply
  if (pat === 'roof') { ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 9; k++) bline(0, k / 9, 1, k / 9); ctx.stroke();
    if (d < 40) { ctx.globalAlpha = .18; ctx.beginPath(); for (let k = 1; k < 30; k++) bline(k / 30, 0, k / 30, 1); ctx.stroke(); ctx.globalAlpha = 1; } // [T71] かわらの 1 枚ずつの目地
    if ((w.seed || 0) % 3 === 0) { bquad(.15, .25, .6, .8, tint('#1F2A44')); ctx.strokeStyle = 'rgba(200,210,230,.5)'; ctx.beginPath(); for (let k = 1; k < 4; k++) bline(.15 + k * .1125, .25, .15 + k * .1125, .8); bline(.15, .52, .6, .52); ctx.stroke(); } // [T72] 屋根の太陽光パネル（3 軒に 1 軒）
    bquad(0, 0, 1, .04, tint('#2B2B2B')); return; } // [T73] 屋根のてっぺんの棟がわら
  if (d > 60) return;
  if (pat === 'juraku') { /* 2026-11-17 ホーム画面の第 2 段：和室の壁（u＝横 3m、v＝下 0・上 1、高さ 3.0m）。前は、うすい黄色の平らな面だった
      [99] じゅらく壁の細かい砂のつぶ [100] うっすらした色むら [101] 長押（木の横木。高さ 2.0m） [102] 長押の下に落ちる細いかげ [103] 天井近くの小壁の明るさ [104] 畳寄せ（壁と畳の間の細い木） */
    const r = rnd(((w.v[0] * 13 + w.v[2] * 7) | 0) + 3), T = tint;
    ctx.globalAlpha = .06; bquad(0, 0, .5, 1, '#8A6A40'); ctx.globalAlpha = .05; bquad(.5, .2, 1, .8, '#FFFFFF');
    if (d < 20) { ctx.globalAlpha = .28; for (let k = 0; k < 160; k++) { const u = r(), v = r() * .66; bquad(u, v, u + .003, v + .004, r() < .5 ? T('#B8A27A') : T('#FFF8E8')); } }
    ctx.globalAlpha = .1; bquad(0, .7, 1, 1, '#FFFFFF');
    ctx.globalAlpha = .95; bquad(0, .666, 1, .694, T('#9C7A52')); ctx.globalAlpha = .5; bquad(0, .688, 1, .694, T('#C9A87C')); ctx.globalAlpha = .18; bquad(0, .64, 1, .666, '#3A2A18');
    ctx.globalAlpha = .9; bquad(0, 0, 1, .02, T('#7A5A38'));
    ctx.globalAlpha = 1; return; }
  if (pat === 'blocks') { const sd = Math.abs((w.v[0] * 7 + w.v[2] * 13 + w.v[1] * 3) | 0), near = d < 30, T = tint;
    /* 2026-11-17 景色 98〜104：住宅街のブロック塀（u＝横 3m、v＝下 0・上 1、高さ 1.35m） */
    if (sd % 4 === 1 && near) { ctx.globalAlpha = .95; bquad(.08, .02, .44, .86, T('#4E5156')); ctx.globalAlpha = .9; for (let k = 0; k < 12; k++) { const u = .1 + k * .03; bquad(u, .05, u + .012, .84, T('#7A7E84')); } bquad(.08, .8, .44, .86, T('#8A8E94')); bquad(.08, .05, .44, .1, T('#6E7278')); ctx.globalAlpha = 1; } // [101] アルミの門扉（たての格子）
    ctx.globalAlpha = .35; ctx.strokeStyle = T('#7A7468'); ctx.lineWidth = Math.max(.6, 24 / d); ctx.beginPath(); for (let k = 1; k < 6; k++) bline(0, k / 6.5, 1, k / 6.5); for (let r = 0; r < 6; r++) for (let k = 0; k < 8; k++) { const u = k / 7.5 + (r % 2) * .066; if (u < 1) bline(u, r / 6.5, u, (r + 1) / 6.5); } ctx.stroke(); // 目地（1 段ずつ互い違い）
    if (sd % 3 === 0 && near) { ctx.globalAlpha = .8; for (const u0 of [.3, .57]) { bquad(u0, .62, u0 + .13, .76, T('#C9C3B5')); ctx.globalAlpha = .75; ctx.fillStyle = T('#4A4640'); const c = bil(u0 + .065, .69); ctx.beginPath(); ctx.ellipse(c[0], c[1], Math.max(1, 26 / d), Math.max(1, 20 / d), 0, 0, 7); ctx.fill(); ctx.globalAlpha = .8; } } // [98] 透かしブロック（丸い穴の模様）
    ctx.globalAlpha = .9; bquad(0, .93, 1, 1.03, T('#D2CDC2')); ctx.globalAlpha = .3; bquad(0, .89, 1, .93, '#2A2622'); // [99] 塀の上のかさ木と、その下のかげ
    ctx.globalAlpha = .22; bquad(0, 0, 1, .12, T('#4E5A3A')); ctx.globalAlpha = .12; bquad(0, .12, 1, .2, T('#5E6A44')); // [100] 足もとの、しみとこけ
    if (near) { ctx.globalAlpha = .12; for (let k = 0; k < 3; k++) { const u = ((sd * (k + 3)) % 97) / 100; bquad(u, .35, u + .012, .89, '#3A3530'); } } // [102] 雨だれのすじ
    if (sd % 4 === 1 && near) { ctx.globalAlpha = .95; bquad(.5, .5, .62, .72, T('#3A3C40')); bquad(.505, .66, .615, .69, T('#1E1F22')); bquad(.66, .55, .74, .66, T('#EDE7D8')); ctx.globalAlpha = .6; bquad(.67, .57, .73, .64, T('#6E6658')); } // [103] 門のわきの郵便受け [104] 表札
    ctx.globalAlpha = 1; return; }
  if (pat === 'ishigaki') { ctx.globalAlpha = .45; ctx.strokeStyle = tint('#6E685C'); ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 6; k++) bline(0, k / 6, 1, k / 6 + .03); for (let k = 0; k < 8; k++) bline(k / 8 + ((k * 3) % 2) * .05, (k % 6) / 6, k / 8 + ((k * 3) % 2) * .05, (k % 6 + 1) / 6); ctx.stroke(); ctx.globalAlpha = 1; return; }
  if (pat === 'stonewall') { ctx.globalAlpha = .4; ctx.strokeStyle = tint('#5C574C'); ctx.lineWidth = 1; ctx.beginPath(); bline(0, .5, 1, .5); for (let k = 0; k < 4; k++) bline(k / 4 + .1, 0, k / 4 + .1, .5); ctx.stroke(); ctx.globalAlpha = 1; return; }
  if (pat === 'bricks') { ctx.globalAlpha = .35; ctx.strokeStyle = tint('#E9D9BF'); ctx.lineWidth = Math.max(.5, 18 / d); ctx.beginPath(); for (let k = 1; k < 12; k++) bline(0, k / 12, 1, k / 12); ctx.stroke(); ctx.globalAlpha = 1;
    bpath(.1, 0, .9, .78); ctx.fillStyle = N > .3 || w.c ? tint('#3A2016') : '#3A2016'; ctx.fill(); return; }
  if (pat === 'doorhead') { bquad(0, 0, 1, .12, tint('#8A949E')); if (d < 40) { bquad(.44, .3, .56, .6, tint('#2F5579')); qtext(tr('入口', 'ENTRANCE'), .45, .33, .55, .57, '#FBF6EE'); } return; } // [T3] ドアの上の枠と「入口」の案内
  if (pat === 'reveal') { /* [G15] 奥まった 1 階の、となりとの境の壁：石の板の目地・下のけこみ・上のかげ */ ctx.globalAlpha = .22; ctx.strokeStyle = tint('#5A554E'); ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 4; k++) bline(0, k / 4, 1, k / 4); bline(.5, 0, .5, 1); ctx.stroke(); ctx.globalAlpha = .35; bquad(0, 0, 1, .06, '#3B3631'); bquad(0, .85, 1, 1, '#2B2622'); ctx.globalAlpha = 1; return; }
  if (pat === 'soffit') { /* [G16] のき天井：板の目地と、ダウンライト（夜は明るく、まわりに光） */ ctx.globalAlpha = .25; ctx.strokeStyle = tint('#5A554E'); ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 6; k++) bline(k / 6, 0, k / 6, 1); ctx.stroke(); ctx.globalAlpha = 1;
    const nL = Math.max(1, Math.round((w.w || 6) / 2.2)); for (let k = 0; k < nL; k++) { const u = (k + .5) / nL, c = bil(u, .5), q = bil(Math.min(1, u + .02), .5), rr = Math.max(1.2, Math.hypot(q[0] - c[0], q[1] - c[1])); if (LT.night > .35) { ctx.globalAlpha = .35; ctx.beginPath(); ctx.ellipse(c[0], c[1], rr * 4, rr * 2, 0, 0, Math.PI * 2); ctx.fillStyle = '#FFE2A0'; ctx.fill(); ctx.globalAlpha = 1; } ctx.beginPath(); ctx.ellipse(c[0], c[1], rr, rr * .5, 0, 0, Math.PI * 2); ctx.fillStyle = LT.night > .35 ? '#FFF6DA' : tint('#E9E6DF'); ctx.fill(); } return; }
  if (pat === 'alleyB') { const N2 = LT.night > .35; bquad(.3, 0, .62, .32, tint('#3B3F46')); bquad(.33, .02, .59, .3, tint('#5A6168')); bquad(.66, .26, .74, .3, N2 ? '#FFE2A0' : tint('#C9C3B5')); if (N2) { ctx.globalAlpha = .25; bquad(.5, 0, .9, .45, '#FFD27A'); ctx.globalAlpha = 1; } return; } // [G59] 路地の奥の裏口と、その上の明かり
  if (pat === 'alleyW') { /* [G17] 路地の横の壁：コンクリートの打ちつぎ・小さな窓・たての配管・雨のしみ・裏口のドア */ const r = rnd(w.seed || 3), H = w.h || 10, fl = 3.2 / H, N2 = LT.night > .35;
    ctx.globalAlpha = .18; for (let k = 1; k * fl < 1; k++) bquad(0, k * fl - .004, 1, k * fl, '#5A554E'); ctx.globalAlpha = 1;
    for (let k = 1; k * fl < .95; k++) for (let i = 0; i < 2; i++) if (r() < .55) { const u = .15 + i * .45 + r() * .1, v = k * fl + fl * .3; bquad(u, v, u + .09, v + fl * .35, N2 && r() < .5 ? '#F7D58A' : tint('#5E6A74')); bquad(u - .005, v - .01, u + .095, v, tint('#8A857C')); }
    ctx.globalAlpha = .2; for (let k = 0; k < 5; k++) { const u = r(); bquad(u, .1 + r() * .3, u + .015, .9, '#4A453E'); } ctx.globalAlpha = 1;
    bquad(.02, 0, .12, Math.min(.95, 2.1 / H), tint('#5A6168')); bquad(.1, Math.min(.5, 1 / H), .11, Math.min(.55, 1.1 / H), tint('#C9C3B5')); return; }
  if (pat === 'gangP') { /* 車両のはしの板（通路の横） [53] ステンレスのみがき筋 [54] 通路側のふちの黒いゴム [55] 号車の札 [56] 優先席の札 [57] 非常通報ボタン [58] 消火器の箱 [59] けこみ（足もとのこい板） */
    const op = w.gsd < 0 ? 1 : 0, uo = u => op ? 1 - u : u; ctx.globalAlpha = .12; for (let k = 1; k < 10; k++) bquad(k / 10, .04, k / 10 + .004, .98, '#FFFFFF'); ctx.globalAlpha = 1;
    bquad(Math.min(uo(0), uo(.05)), 0, Math.max(uo(0), uo(.05)), 1, tint('#2F343A')); bquad(0, 0, 1, .045, tint('#8E98A2'));
    if (d < 40) { const pu = uo(.32); bquad(pu - .1, .74, pu + .1, .8, tint('#2F5579')); qtext(String(w.gno || 1), pu - .08, .745, pu + .08, .795, '#FBF6EE');
      if (w.gsd < 0) { bquad(pu - .1, .62, pu + .1, .7, tint('#F08A2E')); qtext(tr('優先席', 'PRIORITY'), pu - .09, .63, pu + .09, .69, '#FFFFFF'); }
      const bu = uo(.3); bquad(bu - .05, .45, bu + .05, .53, tint('#F2C230')); { const c = bil(bu, .49), rr = Math.max(1.5, Math.abs(bil(bu + .025, .49)[0] - c[0])); ctx.beginPath(); ctx.arc(c[0], c[1], rr, 0, Math.PI * 2); ctx.fillStyle = '#D23A2E'; ctx.fill(); }
      const fu = uo(.62); bquad(fu - .1, .08, fu + .1, .36, tint('#F4F4F2')); bquad(fu - .1, .3, fu + .1, .36, tint('#C8372D')); bquad(fu - .03, .12, fu + .03, .26, tint('#C8372D')); }
    bquad(0, 0, 1, .02, 'rgba(0,0,0,.2)'); return; }
  if (pat === 'gangS') { /* [60] ほろ：黒いゴムのひだ（たての筋）とつや [61] ほろの上下の金具 */ ctx.globalAlpha = .55; for (let k = 0; k < 9; k++) bquad(k / 9 + .02, .05, k / 9 + .06, .95, '#23272C'); ctx.globalAlpha = .18; for (let k = 0; k < 9; k++) bquad(k / 9 + .065, .05, k / 9 + .08, .95, '#FFFFFF'); ctx.globalAlpha = 1; bquad(0, 0, 1, .05, tint('#8E98A2')); bquad(0, .95, 1, 1, tint('#8E98A2')); return; }
  if (pat === 'gangH') { /* [62] 通路の上のかもい：となりの号車の札 [63] ふちのかげ */ bquad(0, 0, 1, .12, 'rgba(0,0,0,.18)'); if (d < 45) { bquad(.42, .3, .58, .8, tint('#2F5579')); qtext((w.gno || 1) + tr('号車', ''), .43, .33, .57, .77, '#FBF6EE'); } return; }
  if (pat === 'trainside') { /* ホームに止まっている電車の横（2026-11-17）：前は 3m ごとに同じ窓 2 枚のくり返しだった。本物の 20m・4 ドアの車両の並びにする
      [70] 20m ごとの車両 [71] 車両のすき間（ほろ） [72] ドアは 4.8m ごと・ドアの窓・ドアの線の色 [73] ドアのあいだの窓（2 枚ずつ） [74] 窓から見える車内（座席の背・明かり。夜は明るく） [75] すそ [76] 屋根と雨どい [77] 行き先の表示 [78] 号車の番号 */
    const x0 = w.ta || 0, tw = w.tw || 3, U = x => (x - x0) / tw, N = LT.night > .4, C0 = Math.floor(x0 / 20) * 20;
    bquad(0, .78, 1, 1, tint('#8E969E')); bquad(0, .78, 1, .8, tint('#6E767E')); bquad(0, 0, 1, .045, tint('#5A6168')); bquad(0, .66, 1, .69, tint(LC)); // 屋根・雨どい・すそ・帯
    ctx.globalAlpha = .1; for (let k = 1; k < 12; k++) bquad(k / 12, .05, k / 12 + .003, .77, '#FFFFFF'); ctx.globalAlpha = 1; // ステンレスのみがき筋
    const seg2 = (xa, xb, f) => { const ua = Math.max(0, U(xa)), ub = Math.min(1, U(xb)); if (ub > ua) f(ua, ub); };
    for (let c = C0 - 20; c < x0 + tw + 20; c += 20) {
      seg2(c - .35, c + .35, (ua, ub) => { bquad(ua, .03, ub, .8, '#2A2E33'); ctx.globalAlpha = .4; for (let k = 0; k < 4; k++) { const q = ua + (ub - ua) * k / 4; bquad(q, .05, q + (ub - ua) * .1, .78, '#4A5057'); } ctx.globalAlpha = 1; });
      for (const [r, len] of [[.72, 1.42], [3.55, 3.2], [8.35, 3.2], [13.15, 3.2], [17.86, 1.42]]) { const panes = len > 2 ? [[r + .1, r + len / 2 - .05], [r + len / 2 + .05, r + len - .1]] : [[r + .1, r + len - .1]];
        for (const [pa, pb] of panes) seg2(c + pa, c + pb, (ua, ub) => { bquad(ua, .32, ub, .62, tint('#2F343A')); bquad(ua + .004, .335, ub - .004, .605, N ? '#E9D9B0' : tint('#56616C')); bquad(ua + .004, .335, ub - .004, .42, N ? '#C9B98F' : tint('#3A7FA0')); bquad(ua + .004, .56, ub - .004, .605, N ? '#FFF6DA' : tint('#8E9AA6')); if (!N) { ctx.globalAlpha = .22; bquad(ua + (ub - ua) * .1, .34, ua + (ub - ua) * .3, .6, '#FFFFFF'); ctx.globalAlpha = 1; } }); }
      for (const d of [2.75, 7.55, 12.35, 17.15]) seg2(c + d - .68, c + d + .68, (ua, ub) => { bquad(ua, .045, ub, .56, tint(LC)); const m = (ua + ub) / 2; bquad(ua + .006, .05, m - .002, .55, tint('#C3CAD1')); bquad(m + .002, .05, ub - .006, .55, tint('#C3CAD1')); bquad(m - .002, .05, m + .002, .55, '#1E2024');
        for (const [p0, p1] of [[ua + .02, m - .02], [m + .02, ub - .02]]) { bquad(p0, .3, p1, .5, tint('#2F343A')); bquad(p0 + .004, .31, p1 - .004, .49, N ? '#E9D9B0' : tint('#56616C')); } });
      seg2(c + .8, c + 1.4, (ua, ub) => { bquad(ua, .7, ub, .74, tint('#2F5579')); });
      seg2(c + 9.2, c + 10.6, (ua, ub) => { bquad(ua, .7, ub, .76, '#15181C'); qtext(tr('各駅停車', 'LOCAL'), ua + .005, .705, ub - .005, .755, '#FFB23C'); }); }
    return; }
  if (pat === 'ceil') return ceiling(w, d);
}
function ceiling(w, d) {
  const cp = w.cp, li = w.light;
  /* 2026-11-15：のっぺりした天井に、走っても動いて見えない（道に沿った）物だけを足す。壁ぎわのうすい陰・板の継ぎ目・電車の手すり棒と空調の筋。横切る線は足さない（上の数字の後ろでちらつくため） */
  bquad(0, 0, 1, .075, 'rgba(30,22,16,.085)'); bquad(0, .925, 1, 1, 'rgba(30,22,16,.085)'); bquad(0, .075, 1, .15, 'rgba(30,22,16,.035)'); bquad(0, .85, 1, .925, 'rgba(30,22,16,.035)');
  if (w.train) { /* 電車の天井（2026-11-16）：まん中に冷房の吹き出し口の帯（細いすき間の列）、両わきに乳白のカバーの明かり、つなぎ目、ときどき送風機の丸い格子 */
    const lw = Math.max(1, Math.min(3, 9 / Math.max(1, d)));
    bquad(0, .41, 1, .59, 'rgba(120,132,144,.16)'); ctx.strokeStyle = 'rgba(70,80,92,.45)'; ctx.lineWidth = lw; ctx.beginPath(); bline(0, .41, 1, .41); bline(0, .59, 1, .59); bline(0, .2, 1, .2); bline(0, .8, 1, .8); ctx.stroke();
    if (d < 34) { ctx.fillStyle = 'rgba(60,70,82,.35)'; for (let k = 0; k < 8; k++) { bquad(.04 + k * .12, .46, .1 + k * .12, .48, ctx.fillStyle); bquad(.04 + k * .12, .52, .1 + k * .12, .54, ctx.fillStyle); } }
    if (w.ti % 3 === 1 && d < 30) { const c = bil(.5, .5), rx = (Math.abs(bil(.56, .5)[0] - c[0]) + Math.abs(bil(.5, .55)[0] - c[0])) * .8, ry = (Math.abs(bil(.5, .55)[1] - c[1]) + Math.abs(bil(.56, .5)[1] - c[1])) * .8;
      ctx.beginPath(); ctx.ellipse(c[0], c[1], Math.max(2, rx), Math.max(1, ry), 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(200,208,216,.9)'; ctx.fill(); ctx.strokeStyle = 'rgba(70,80,92,.55)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); for (let k = 1; k < 4; k++) ctx.ellipse(c[0], c[1], Math.max(1, rx * k / 4), Math.max(.5, ry * k / 4), 0, 0, Math.PI * 2); ctx.stroke(); }
    if (w.tlay && d < 26) { const T = w.tlay, x0 = w.ta || 0; for (const c of T.cars) for (const dd of [2.75, 7.55, 12.35, 17.15]) { const u = (c + dd - x0) / 3; if (u < 0 || u > 1) continue;
        for (const v of [.12, .88]) { const p = bil(u, v), q = bil(Math.min(1, u + .04), v), rr = Math.max(1.5, Math.hypot(q[0] - p[0], q[1] - p[1])); ctx.beginPath(); ctx.ellipse(p[0], p[1], rr, rr * .45, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(70,80,92,.55)'; ctx.fill(); } // [103] ドアの上の天井のスピーカー
        const p = bil(u, .5), q = bil(Math.min(1, u + .03), .5), rr = Math.max(1.5, Math.hypot(q[0] - p[0], q[1] - p[1])); ctx.beginPath(); ctx.ellipse(p[0], p[1], rr, rr * .6, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(30,34,40,.75)'; ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(p[0] - rr * .3, p[1] - rr * .3, Math.max(1, rr * .3), Math.max(1, rr * .2)); } } // [104] 防犯カメラ（黒い半球）
    ctx.strokeStyle = 'rgba(70,80,92,.28)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.stroke(); } /* [102] 天井の横の継ぎ目の線を 3m ごとに引くのをやめた（車両のつなぎ目だけ） */
  ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1; ctx.beginPath();
  if (cp === 'plain' && !w.train) { bline(0, 1 / 3, 1, 1 / 3); bline(0, 2 / 3, 1, 2 / 3); }
  if (cp === 'wood') { for (let k = 1; k < 8; k++) bline(0, k / 8, 1, k / 8); bline(0, 0, 1, 0); if (d < 18) { ctx.stroke(); const rr = rnd((w.ti || 0) * 7 + 5); ctx.save(); ctx.strokeStyle = 'rgba(90,60,30,.12)'; ctx.lineWidth = .8; ctx.beginPath(); for (let k = 0; k < 8; k++) for (let j = 0; j < 3; j++) { const v = k / 8 + .02 + rr() * .09, u = rr() * .6; bline(u, v, u + .25 + rr() * .3, v + (rr() - .5) * .01); } ctx.stroke(); ctx.restore(); ctx.beginPath(); } } // [110] 天井板の木目（2026-11-17）
  else if (cp === 'grid') { for (let k = 1; k < 4; k++) bline(0, k / 4, 1, k / 4); bline(0, 0, 1, 0); bline(.5, 0, .5, 1); }
  else if (cp === 'beams' || cp === 'girder') { ctx.stroke(); bquad(0, 0, .12, 1, cp === 'girder' ? tint('#2B2B30') : tint('#7D8791')); if (cp === 'girder') { ctx.strokeStyle = tint('#55555C'); ctx.beginPath(); bline(0, 0, 1, 1); bline(0, 1, 1, 0); } }
  ctx.stroke();
  const on = `rgba(255,253,240,${(.95 * clamp((d - 1.2) / 3, 0, 1)).toFixed(2)})`; // fixtures right overhead fade out instead of slicing the top of the screen
  if (li === 'panel' && w.ti % 2 === 0) { bquad(.2, .18, .8, .32, on); bquad(.2, .68, .8, .82, on); }
  else if (li === 'strip' && w.train) { const halo = on.replace(/[\d.]+\)$/, m => (parseFloat(m) * .25).toFixed(3) + ')'); bquad(0, .21, 1, .37, halo); bquad(0, .63, 1, .79, halo); bquad(0, .25, 1, .33, on); bquad(0, .67, 1, .75, on); ctx.strokeStyle = 'rgba(150,160,170,.6)'; ctx.lineWidth = 1; ctx.beginPath(); bline(0, .25, 1, .25); bline(0, .33, 1, .33); bline(0, .67, 1, .67); bline(0, .75, 1, .75); ctx.stroke(); } // 電車：つながった乳白のカバーの明かりと、まわりのうすい光
  else if (li === 'strip') { bquad(.1, .3, .9, .36, on); bquad(.1, .64, .9, .7, on); }
  else if (li === 'round' && w.ti % 3 === 1) { const c = bil(.5, .5), r = Math.abs(bil(.62, .5)[0] - c[0]) + Math.abs(bil(.5, .62)[1] - c[1]); ctx.beginPath(); ctx.ellipse(c[0], c[1], Math.max(3, r * 1.9), Math.max(1.5, r * .68), 0, 0, Math.PI * 2); ctx.fillStyle = on.replace(/[\d.]+\)$/, m => (parseFloat(m) * .18).toFixed(3) + ')'); ctx.fill(); /* 明かりのまわりのうすい光 */ ctx.beginPath(); ctx.ellipse(c[0], c[1], Math.max(2, r), Math.max(1, r * .35), 0, 0, Math.PI * 2); ctx.fillStyle = on; ctx.fill(); }
  else if (li === 'bulb') { /* 裸電球：すぐ頭の上では巨大な黄色い丸になっていた（ガード下・横丁）。大きさに上限をつけ、近づくと消え、まわりにうすい光の輪 */ const rr = Math.min(7, Math.max(1.5, 34 / d)), al = clamp((d - 2.2) / 3, 0, 1); if (al > .02) for (let k = 0; k < 3; k++) { const c = bil(.5, .2 + k * .3); ctx.globalAlpha = al * .22; ctx.beginPath(); ctx.arc(c[0], c[1], rr * 2.4, 0, Math.PI * 2); ctx.fillStyle = '#FFC860'; ctx.fill(); ctx.globalAlpha = al; ctx.beginPath(); ctx.arc(c[0], c[1], rr, 0, Math.PI * 2); ctx.fillStyle = '#FFE2A0'; ctx.fill(); } ctx.globalAlpha = 1; }
}
function glassFrame(w) { const gf = w.gf, nt = LT.night > .4; ctx.strokeStyle = gf === 'dark' ? (nt ? 'rgba(70,78,92,.85)' : 'rgba(96,104,116,.8)') : (nt ? 'rgba(190,200,215,.5)' : 'rgba(240,245,250,.75)'); ctx.lineWidth = gf === 'dark' ? 2.6 : 2; /* [S1] 窓わくの色：押上の展望デッキは、こい灰色の鉄（夜は暗く）。夜の白いわくは、うすく（光る線に見えていた） */ ctx.beginPath(); bline(0, 0, 1, 0); bline(0, 1, 1, 1); bline(0, 0, 0, 1); if (!w.ceil) bline(0, .05, 1, .05); ctx.stroke(); }
// building fronts; w.st = style
function facade(w, d) {
  const r = rnd(w.seed * 7 + 13), rp = a => a[(r() * a.length) | 0], N = LT.night, h = w.h, st = w.st;
  const fl = 3.2; const floors = Math.floor(h / fl);
  const win = (u0, v0, u1, v1, kind) => { const on = N > .35 && r() < .62; bquad(u0, v0, u1, v1, on ? (r() < .3 ? '#FFE8B0' : '#F7D58A') : kind === 'glass' ? tint('#7FA0BC') : tint('#9EB8CC')); };
  if (w.side) { ctx.globalAlpha = 1 - fogK(d) * .9; /* [R19] 横の壁の模様も、もやでうすく */ /* [R7] 建物の横の壁：前は夜の明かりだけの無地。打ちつぎの線・小さな窓（階段・トイレ）・たての配管・室外機・雨のしみ・上のかげ */
    const fl2 = 3.2 / Math.max(3.2, h); ctx.globalAlpha = .16; for (let k = 1; k * fl2 < 1; k++) bquad(0, k * fl2 - .004, 1, k * fl2, '#4A453E'); ctx.globalAlpha = 1;
    if (d < 70) { for (let k = 1; k < floors; k++) { const v = k / floors; if (r() < .45) bquad(.62, v + .02, .7, v + fl2 * .45, N > .35 && r() < .5 ? '#F7D58A' : tint('#5E6A74')); if (N < .35 && r() < .3) { bquad(.2, v - fl2 * .4, .28, v - fl2 * .2, tint('#E3E5E7')); } }
      bquad(.9, 0, .915, .97, tint('#8A8F94')); ctx.globalAlpha = .15; bquad(.3, .2, .32, .95, '#3B3631'); bquad(.75, .4, .765, .9, '#3B3631'); ctx.globalAlpha = .2; bquad(0, .94, 1, 1, '#000000'); ctx.globalAlpha = 1; }
    else if (N > .35) for (let k = 1; k < floors; k++) if (r() < .5) bquad(.6, k / floors + .02, .7, k / floors + .1, '#F7D58A');
    return; }
  if (st === 'glass') { // curtain wall
    const rows = floors * 2; ctx.globalAlpha = .9;
    for (let k = 0; k < rows; k++) { const v0 = k / rows, v1 = (k + .8) / rows; bquad(.04, v0, .96, v1, N > .35 ? (r() < .55 ? '#E8D79A' : '#2A3550') : tint(r() < .5 ? '#9DB6CB' : '#86A2BA')); }
    ctx.globalAlpha = 1; ctx.strokeStyle = tint('#C9D4DE'); ctx.lineWidth = 1; ctx.beginPath(); bline(.5, 0, .5, 1); bline(0, 0, 0, 1); ctx.stroke(); return;
  }
  if (st === 'station') { // red brick with white bands and arched windows
    for (const v of [.3, .62, .94]) bquad(0, v, 1, v + .03, tint('#F3EEE6'));
    for (let k = 0; k < 3; k++) { const v0 = .06 + k * .32; bquad(.3, v0, .7, v0 + .2, N > .35 ? '#FFE3A8' : tint('#5C6670')); bquad(.3, v0 + .19, .7, v0 + .22, tint('#F3EEE6')); }
    return;
  }
  if (st === 'viaduct') { bquad(0, .78, 1, .86, tint('#9A968E')); bquad(0, .86, 1, 1, tint('#7D7A73')); bpath(.12, 0, .88, .62); ctx.fillStyle = N > .3 ? '#FFD58A' : tint('#3A3630'); ctx.fill();
    if (d < 45) { bquad(.14, .5, .86, .62, tint(['#C8463C', '#F2C230', '#355F86', '#E86A75'][w.seed % 4])); qtext(['鮮魚', '乾物', '果物', 'お菓子', '雑貨', '洋品'][w.seed % 6], .18, .5, .82, .62, '#FBF6EE'); } return; }
  if (st === 'house') { const vf = fl / h; for (let k = 0; k < Math.min(2, floors); k++) { const v0 = k * vf + .1 * vf + (k ? 0 : .12); win(.25, v0, .75, v0 + vf * .5); } return; }
  // ground floor shop
  const g1 = Math.min(.5, fl / h);
  if (st === 'nakamise') {
    bquad(0, 0, 1, g1 * .85, tint('#8A5530')); for (let k = 0; k < 6; k++) bquad(.06 + (k % 3) * .3, .08 + (k / 3 | 0) * .3 * g1, .3 + (k % 3) * .3, .26 + (k / 3 | 0) * .3 * g1, tint(['#F2C230', '#E86A75', '#FBF6EE', '#7FD06A'][k % 4]));
    bquad(0, g1 * .86, 1, g1, tint('#FBF6EE')); if (w.k === 0) qtext(rp(['人形焼', 'せんべい', '雷おこし', '扇子', '甘味', '土産']), .05, g1 * .86, .95, g1, '#B5302A');
    for (let k = 1; k < floors; k++) bquad(.15, k / floors + .05, .85, k / floors + .15, N > .35 ? '#FFD27A' : tint('#6B4631'));
    return;
  }
  if (st === 'luxury') { bquad(.06, 0, .94, g1 * .9, N > .3 ? '#FFF1D0' : tint('#C9D9E6')); bquad(.06, g1 * .9, .94, g1, tint('#C9962F')); }
  else { // mixed / neon
    bquad(.05, 0, .95, g1 * .78, N > .3 ? '#FFE9B8' : tint('#BFD6E6'));
    const awn = rp(['#C8463C', '#355F86', '#5F9E5A', '#F2C230', '#3B2A20']);
    bquad(0, g1 * .78, 1, g1, tint(awn));
    if (w.first && d < 40) qtext(rp(['ラーメン', 'カフェ', '書店', '薬局', 'パン', '食堂', '花屋', '寿司', '居酒屋', '雑貨']), .1, g1 * .8, .9, g1 * .98, '#FBF6EE');
  }
  // upper floors
  const vf = fl / h;
  for (let k = 1; k < floors; k++) { const v0 = k * vf + vf * .25, v1 = v0 + vf * .5; if (st === 'luxury') win(.08, v0, .92, v1, 'glass'); else { win(.1, v0, .44, v1); win(.56, v0, .9, v1); } }
  if (st === 'neon' && d < 70) { ctx.globalAlpha = .9; const c = rp(['#E86A75', '#6FC3E8', '#F2C230', '#7FD06A', '#C792EA']); if (r() < .5) bquad(.05, g1 + .02, .95, g1 + .07, N > .2 ? c : tint(c)); ctx.globalAlpha = 1; }
}

/* ================= wall decorations ================= */
function sceneView(e, x0, y0, x1, y1, kind) { // a little view through a window
  const N = LT.night;
  bquad(x0, y0, x1, y1, `rgb(${LT.bot[0] | 0},${LT.bot[1] | 0},${LT.bot[2] | 0})`);
  bquad(x0, (y0 + y1) / 2, x1, y1, `rgb(${LT.top[0] | 0},${LT.top[1] | 0},${LT.top[2] | 0})`);
  if (kind === 'garden') { bquad(x0, y0, x1, y0 + (y1 - y0) * .35, tint('#5F9E5A')); bquad(x0, y0, x1, y0 + (y1 - y0) * .12, tint('#4C8A48')); }
  else { const r = rnd((e.seed || 7) + 3); for (let k = 0; k < 7; k++) { const u = x0 + (x1 - x0) * k / 7, hh = .15 + r() * .45; bquad(u, y0, u + (x1 - x0) / 8, y0 + (y1 - y0) * hh, N > .4 ? '#1E2848' : tint('#9AA9B6')); if (N > .4) bquad(u + .01, y0 + (y1 - y0) * hh * .5, u + .03, y0 + (y1 - y0) * hh * .55, '#F7D58A'); } }
}
const DECO_DRAW = {
  mesh(e) { /* 電波塔コース PDCA 108〜110（2026-11-17・本物を調べて）：赤い電波塔の外階段は、金網で囲まれた赤い階段。[108] ひし形の金網 [109] 金網の赤い枠と、ところどころの太い柱 [110] 夜は、金網のふちがライトで光る */
    const N = LT.night > .4; ctx.strokeStyle = N ? 'rgba(255,190,150,.35)' : 'rgba(70,74,80,.38)'; ctx.lineWidth = .7; ctx.beginPath(); const n = Math.max(6, Math.round((e.w || 3) * 6)); for (let k = -6; k <= n; k++) { bline(k / n, 0, (k + 6) / n, 1); bline((k + 6) / n, 0, k / n, 1); } ctx.stroke();
    ctx.strokeStyle = tint('#D9452B'); ctx.lineWidth = 2; ctx.beginPath(); bline(0, 0, 1, 0); bline(0, 1, 1, 1); bline(0, 0, 0, 1); bline(1, 0, 1, 1); ctx.stroke(); if (N) { ctx.strokeStyle = 'rgba(255,170,90,.5)'; ctx.lineWidth = 1; ctx.beginPath(); bline(0, .99, 1, .99); ctx.stroke(); } },
  ticketbooth(e) { /* コース 29〜33：1 階のチケット売り場 [29] 窓口のガラス [30] 中の明かりと係の人のかげ [31] カウンターの台 [32] 上の案内の板 [33] 順番待ちのロープの柱 */
    bquad(0, 0, 1, 1, tint('#EDE6D8')); bquad(.03, .34, .97, .78, tint('#FFF4DC')); for (let k = 0; k < 3; k++) { const u = .06 + k * .31; bquad(u, .36, u + .27, .76, tint('#CFE0EA')); ctx.fillStyle = 'rgba(60,50,40,.55)'; const c = bil(u + .135, .6), r1 = Math.abs(bil(u + .2, .6)[0] - c[0]) * .5; ctx.beginPath(); ctx.arc(c[0], c[1], Math.max(1, r1 * .55), 0, 7); ctx.fill(); bquad(u + .07, .38, u + .2, .52, 'rgba(60,50,40,.55)'); ctx.globalAlpha *= .5; bquad(u + .02, .4, u + .06, .74, '#FFFFFF'); ctx.globalAlpha *= 2; }
    bquad(0, .28, 1, .34, tint('#8A6A48')); bquad(0, 0, 1, .28, tint('#B9966A')); bquad(.02, .8, .98, .96, tint('#D9452B')); qtext(tr('チケット', 'TICKETS'), .2, .82, .8, .95, '#FFFFFF');
    ctx.strokeStyle = tint('#5A4636'); ctx.lineWidth = 1.5; ctx.beginPath(); bline(0, 0, 1, 0); bline(0, 1, 1, 1); bline(.345, .34, .345, .78); bline(.655, .34, .655, .78); ctx.stroke(); },
  towerposter(e) { /* コース 34〜36：塔のポスター [34] 夕空に立つ赤と白の塔の絵 [35] 「外階段 約600段」の字 [36] 額のふち */
    const N = (e.seed || 0) % 2; bquad(0, 0, 1, 1, tint('#2E2A26')); bquad(.04, .03, .96, .97, tint(N ? '#F2C9A0' : '#BFDCEF')); bquad(.04, .03, .96, .2, tint(N ? '#C9B08A' : '#9CB88A'));
    for (let k = 0; k < 7; k++) { const v0 = .2 + k * .095, w0 = .2 - k * .024, w1 = .2 - (k + 1) * .024; const a = bil(.5 - w0, v0), b2 = bil(.5 + w0, v0), c = bil(.5 + w1, v0 + .095), d2 = bil(.5 - w1, v0 + .095); ctx.fillStyle = tint(k % 2 ? '#F2F2F0' : '#D9452B'); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b2[0], b2[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d2[0], d2[1]); ctx.closePath(); ctx.fill(); }
    bquad(.42, .58, .58, .63, tint('#F2F2F0')); bquad(.49, .86, .51, .96, tint('#D9452B')); qtext(tr('外階段 600段', '600 STEPS'), .1, .05, .9, .17, '#FFFFFF'); },
  infodesk(e) { /* コース 37〜40：案内のカウンター [37] 丸みのある白い台 [38] 「i」の印 [39] うしろの塔の案内図 [40] 台の上の花 */
    bquad(0, 0, 1, 1, tint('#EFE9DD')); bquad(.1, .45, .9, .92, tint('#DCE6EC')); for (let k = 0; k < 5; k++) bquad(.14 + k * .15, .5, .26 + k * .15, .88, tint(k % 2 ? '#F4F0E6' : '#D9452B'));
    bquad(.04, 0, .96, .36, tint('#FBF8F2')); bquad(.04, .33, .96, .37, tint('#C9A24A')); bquad(.04, 0, .96, .04, tint('#7A5A48')); const c = bil(.5, .19), r1 = Math.abs(bil(.56, .19)[0] - c[0]); ctx.fillStyle = tint('#1E5AA8'); ctx.beginPath(); ctx.arc(c[0], c[1], Math.max(2, r1), 0, 7); ctx.fill(); qtext('i', .46, .1, .54, .28, '#FFFFFF');
    const f = bil(.82, .4); ctx.fillStyle = tint('#E86A85'); for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(f[0] + Math.cos(k * 1.26) * r1 * .5, f[1] - r1 * .6 + Math.sin(k * 1.26) * r1 * .5, Math.max(1, r1 * .35), 0, 7); ctx.fill(); } },
  quizpanel(e) { /* コース 16：踊り場のクイズの板（黄色い板に問題の番号。答えは次の階段の先） */
    bquad(0, 0, 1, 1, tint('#FFFFFF')); bquad(.04, .05, .96, .95, tint('#F7D54A')); bquad(.04, .7, .96, .95, tint('#D9452B')); qtext(tr('クイズ', 'QUIZ'), .15, .72, .85, .93, '#FFFFFF'); qtext(e.txt || 'Q', .2, .2, .8, .62, tint('#2B2B2B')); ctx.strokeStyle = tint('#8A8E94'); ctx.lineWidth = 1.2; ctx.beginPath(); bline(0, 0, 1, 0); bline(0, 1, 1, 1); bline(0, 0, 0, 1); bline(1, 0, 1, 1); ctx.stroke(); },
  stepsign500(e) { bquad(0, 0, 1, 1, tint('#FBF8F0')); bquad(0, .78, 1, 1, tint('#D9452B')); qtext((500 + ((e.seed || 0) % 9) * 10) + tr('段', ''), .08, .3, .92, .74, tint('#2B2B2B')); qtext(tr('あと少し', 'ALMOST'), .1, .8, .9, .98, '#FFFFFF'); },
  gatesign(e) { /* コース 27：外階段の入口の看板 */ bquad(0, 0, 1, 1, tint('#D9452B')); bquad(.01, .06, .99, .94, tint('#FBF8F0')); qtext(tr('外階段 入口　約600段', 'OUTDOOR STAIRS  600 STEPS'), .04, .14, .96, .86, tint('#D9452B')); },
  stepsign(e) { /* [111] 階段の段数の表示（本物も段数が書いてある）と、[112] その場所の高さ */
    bquad(0, 0, 1, 1, tint('#FBF8F0')); bquad(0, .78, 1, 1, tint('#D9452B')); ctx.strokeStyle = tint('#8A8E94'); ctx.lineWidth = 1; ctx.beginPath(); bline(0, 0, 1, 0); bline(0, 1, 1, 1); bline(0, 0, 0, 1); bline(1, 0, 1, 1); ctx.stroke();
    qtext(e.txt || '', .08, .32, .92, .74, tint('#2B2B2B')); qtext(e.txt2 || '', .12, .8, .88, .98, tint('#FFFFFF')); },
  tansuW(e) { // a paulownia chest: frame, four rows of drawers (the top row split), iron handles; all in the wall's own perspective
    bquad(0, 0, 1, 1, tint('#7A4E2E')); bquad(.03, .03, .97, .97, tint('#8E5E38'));
    const rows = [[.05, .27], [.29, .5], [.52, .73], [.75, .96]];
    rows.forEach(([v0, v1], r) => { const cols = r === 3 ? [[.05, .48], [.52, .95]] : [[.05, .95]];
      for (const [u0, u1] of cols) { bquad(u0, 1 - v1, u1, 1 - v0, tint('#A06C42')); bquad(u0, 1 - v1, u1, 1 - v1 + .02, tint('#B98450'));
        const um = (u0 + u1) / 2, vm = 1 - (v0 + v1) / 2; ctx.strokeStyle = tint('#2E2420'); ctx.lineWidth = 2.2; ctx.beginPath(); bline(um - .09, vm - .02, um - .06, vm + .04); bline(um - .06, vm + .04, um + .06, vm + .04); bline(um + .06, vm + .04, um + .09, vm - .02); ctx.stroke();
        bquad(um - .015, vm - .035, um + .015, vm - .01, tint('#2E2420')); } });
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); for (const [v0, v1] of rows) { bline(.04, 1 - v1, .96, 1 - v1); } ctx.stroke(); bquad(0, 0, 1, .02, tint('#5E3A22')); },
  hanger(e) { /* 壁のフックの上着：[48] 木のハンガーの肩の丸み、[49] 上着の前あわせとボタン、[50] えりの折り返し、[51] ネクタイの結び目と小剣、[52] ポケットとふた、[53] 布のしわとかげ */
    ctx.strokeStyle = tint('#4A3220'); ctx.lineWidth = 2; ctx.beginPath(); bline(.42, .02, .5, 0); bline(.5, 0, .58, .02); ctx.stroke();
    ctx.strokeStyle = tint('#8A6234'); ctx.lineWidth = 4; ctx.beginPath(); bline(.18, .15, .5, .05); bline(.5, .05, .82, .15); ctx.stroke();
    bpath(.1, .14, .9, .96); ctx.fillStyle = tint('#3E4A5E'); ctx.fill(); bpath(.4, .14, .6, .5); ctx.fillStyle = tint('#F7F4EE'); ctx.fill();
    bquad(.47, .18, .53, .22, tint('#B8862A')); bpath(.475, .22, .525, .6); ctx.fillStyle = tint('#C9962F'); ctx.fill(); bquad(.49, .58, .51, .62, tint('#B8862A'));
    bpath(.1, .14, .42, .56); ctx.fillStyle = tint('#33404F'); ctx.fill(); bpath(.58, .14, .9, .56); ctx.fillStyle = tint('#33404F'); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.beginPath(); bline(.4, .14, .5, .56); bline(.6, .14, .5, .56); ctx.stroke();
    for (const v of [.66, .78]) bquad(.48, v, .52, v + .03, tint('#1E242E'));
    bquad(.16, .72, .36, .74, tint('#2A3442')); bquad(.64, .72, .84, .74, tint('#2A3442')); bquad(.62, .36, .78, .38, tint('#2A3442'));
    ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1.2; ctx.beginPath(); bline(.26, .3, .24, .9); bline(.74, .3, .76, .9); bline(.2, .6, .3, .62); ctx.stroke(); },
  shoji(e) { /* 障子（2026-11-17 オーナー「スタート画面の質を」）：[23] 和紙の白に、[24] 外の朝日で上ほど明るく、[25] 紙のせんい、[26] 太い外わくと細い組子（くみこ）、[27] 組子のかげ、[28] 下の木の腰板、[29] 外の木の枝のかげ、[30] 引き手 */
    const N = LT.night > .4; bquad(0, 0, 1, 1, tint(N ? '#C9B990' : '#FBF8F0')); if (!N) { ctx.globalAlpha = .5; bquad(0, .45, 1, 1, tint('#FFFDF7')); ctx.globalAlpha = 1; }
    const r = rnd(e.seed || 11); ctx.strokeStyle = 'rgba(190,175,150,.25)'; ctx.lineWidth = .7; ctx.beginPath(); for (let i = 0; i < 26; i++) { const u = r(), v = .18 + r() * .8; bline(u, v, u + .05 + r() * .05, v + (r() - .5) * .03); } ctx.stroke();
    if (!N) { ctx.globalAlpha = .13; ctx.strokeStyle = '#4A5A3A'; ctx.lineWidth = 3; ctx.beginPath(); bline(.05, .95, .55, .62); bline(.3, .8, .42, .92); bline(.4, .74, .52, .86); bline(.55, .62, .9, .55); ctx.stroke(); ctx.fillStyle = '#4A5A3A'; for (let i = 0; i < 9; i++) { const c = bil(.2 + r() * .7, .55 + r() * .4); ctx.beginPath(); ctx.ellipse(c[0], c[1], 4, 2, r() * 3, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
    bquad(0, 0, 1, .16, tint('#B48C62')); ctx.strokeStyle = tint('#8A6A48'); ctx.lineWidth = 1; ctx.beginPath(); bline(0, .08, 1, .08); ctx.stroke();
    { ctx.strokeStyle = 'rgba(110,70,35,.18)'; ctx.lineWidth = .8; ctx.beginPath(); for (let k = 0; k < 14; k++) { const v = .01 + r() * .14, u = r() * .7; bline(u, v, u + .2 + r() * .2, v + (r() - .5) * .01); } ctx.stroke(); } // [108] 下の腰板の木目（2026-11-17 ホーム画面の第 2 段）
    ctx.strokeStyle = 'rgba(80,55,30,.22)'; ctx.lineWidth = 2.6; ctx.beginPath(); for (let k = 1; k < 4; k++) bline(k / 4 + .006, .16, k / 4 + .006, 1); for (let k = 1; k < 6; k++) bline(0, .16 + k * .14 + .005, 1, .16 + k * .14 + .005); ctx.stroke();
    ctx.strokeStyle = tint('#A07C56'); ctx.lineWidth = 1.6; ctx.beginPath(); for (let k = 1; k < 4; k++) bline(k / 4, .16, k / 4, 1); for (let k = 1; k < 6; k++) bline(0, .16 + k * .14, 1, .16 + k * .14); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,245,225,.35)'; ctx.lineWidth = .7; ctx.beginPath(); for (let k = 1; k < 4; k++) bline(k / 4 - .004, .16, k / 4 - .004, 1); for (let k = 1; k < 6; k++) bline(0, .16 + k * .14 - .004, 1, .16 + k * .14 - .004); ctx.stroke(); // [109] 組子の、光の当たるふち
    ctx.strokeStyle = tint('#7A5636'); ctx.lineWidth = 3.4; ctx.beginPath(); bline(0, 0, 0, 1); bline(1, 0, 1, 1); bline(0, 1, 1, 1); bline(0, .16, 1, .16); ctx.stroke();
    bquad(.86, .5, .94, .56, tint('#C9B48A')); ctx.strokeStyle = tint('#8A6A48'); ctx.lineWidth = 1; ctx.beginPath(); bline(.86, .5, .94, .5); bline(.86, .56, .94, .56); ctx.stroke(); },
  fusuma(e) { bquad(0, 0, 1, 1, tint('#E9DDC1')); ctx.strokeStyle = tint('#6B4631'); ctx.lineWidth = 2; ctx.beginPath(); bline(0, 0, 0, 1); bline(.5, 0, .5, 1); bline(1, 0, 1, 1); bline(0, 1, 1, 1); ctx.stroke(); bquad(.38, .45, .44, .52, tint('#6B4631')); bquad(.56, .45, .62, .52, tint('#6B4631')); bquad(.05, .12, .45, .4, tint('#B9CBB0')); bquad(.55, .6, .95, .85, tint('#B9CBB0')); },
  tokonoma(e) { /* 床の間：[43] 土壁の色とむら、[44] 掛け軸（表具の布・墨の山水・軸先）、[45] 床柱（皮をむいた丸太の木目）、[46] 床板と一輪ざし、[47] 落としがけ */
    bquad(0, 0, 1, 1, tint('#D8C7A6')); const r = rnd(5); ctx.fillStyle = 'rgba(140,110,70,.08)'; for (let i = 0; i < 30; i++) { const c = bil(r(), r()); ctx.fillRect(c[0], c[1], 3, 2); }
    bquad(.33, .2, .67, .9, tint('#8A6E54')); bquad(.36, .26, .64, .84, tint('#F4EFE4'));
    ctx.strokeStyle = 'rgba(40,30,25,.7)'; ctx.lineWidth = 2; ctx.beginPath(); bline(.4, .7, .46, .55); bline(.46, .55, .5, .62); bline(.5, .62, .56, .45); bline(.56, .45, .6, .7); ctx.stroke(); ctx.globalAlpha = .35; bquad(.4, .7, .6, .74, '#6A7A6A'); ctx.globalAlpha = 1;
    bquad(.33, .9, .67, .94, tint('#2B1E18')); for (const u of [.31, .69]) bquad(u - .02, .9, u + .02, .95, tint('#E9E2D2'));
    bquad(0, .97, 1, 1, tint('#5E3E24')); bquad(0, 0, 1, .05, tint('#6B4A2E'));
    bquad(.9, 0, 1, 1, tint('#9C7A52')); ctx.strokeStyle = 'rgba(70,45,20,.35)'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 0; k < 5; k++) bline(.91 + k * .02, 0, .92 + k * .02, 1); ctx.stroke();
    bquad(.12, .86, .2, .97, tint('#3E5A6E')); ctx.strokeStyle = tint('#4E7A3E'); ctx.lineWidth = 1.5; ctx.beginPath(); bline(.16, .86, .15, .7); ctx.stroke(); bquad(.13, .66, .18, .71, tint('#E86A85')); },
  window(e) { bquad(0, 0, 1, 1, tint('#FBF6EE')); sceneView(e, .06, .08, .94, .92, 'garden'); ctx.strokeStyle = tint('#FBF6EE'); ctx.lineWidth = 3; ctx.beginPath(); bline(.5, .08, .5, .92); ctx.stroke(); },
  citywin(e) { bquad(0, 0, 1, 1, tint('#C9D4DE')); sceneView(e, .03, .05, .97, .95, 'city'); ctx.strokeStyle = tint('#C9D4DE'); ctx.lineWidth = 3; ctx.beginPath(); bline(.33, .05, .33, .95); bline(.66, .05, .66, .95); ctx.stroke(); },
  calendar(e) { /* カレンダー：[54] 上の写真（富士山）、[55] 月の数字と日付の小さな字、[56] 日曜は赤、[57] 今日に赤い丸、[58] つるす穴とひも */
    bquad(0, 0, 1, 1, tint('#FFFFFF')); bquad(.06, .52, .94, .97, tint('#8FB8D8')); bquad(.06, .52, .94, .62, tint('#5E8A4E')); { const c0 = bil(.3, .62), c1 = bil(.5, .78), c2 = bil(.7, .62); ctx.fillStyle = tint('#5E6E8A'); ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.lineTo(c1[0], c1[1]); ctx.lineTo(c2[0], c2[1]); ctx.fill(); }
    ctx.strokeStyle = tint('#C9C2B5'); ctx.lineWidth = .8; ctx.beginPath(); for (let k = 1; k < 7; k++) bline(k / 7, .04, k / 7, .46); for (let k = 1; k < 5; k++) bline(0, .04 + k * .084, 1, .04 + k * .084); ctx.stroke();
    ctx.globalAlpha = .7; for (let k = 0; k < 30; k++) { const col = k % 7, row = (k / 7) | 0; bquad(col / 7 + .03, .06 + row * .084, col / 7 + .1, .09 + row * .084, col === 0 ? tint('#C8463C') : tint('#4A4A4A')); } ctx.globalAlpha = 1;
    bquad(.44, .96, .56, 1, tint('#B9B2A5')); ctx.strokeStyle = tint('#8A7A60'); ctx.lineWidth = 1; ctx.beginPath(); bline(.5, 1, .5, 1.06); ctx.stroke();
    const c = bil(.64, .3); ctx.beginPath(); ctx.strokeStyle = '#C8463C'; ctx.lineWidth = 2.4; ctx.ellipse(c[0], c[1], Math.abs(bil(.72, .3)[0] - c[0]) + 1, Math.abs(bil(.64, .38)[1] - c[1]) + 1, 0, 0, Math.PI * 2); ctx.stroke(); },
  frame(e) { bquad(0, 0, 1, 1, tint('#C9962F')); bquad(.1, .1, .9, .9, tint('#E3F0F6')); bquad(.1, .1, .9, .45, tint('#8FC07A')); bquad(.55, .5, .75, .7, tint('#F2C230')); },
  /* 電車の座席側の壁（2026-11-16 オーナー「ただの図形の組み合わせ」）：下から 座席の背（別の箱）→ 帯 → 窓（黒い枠・角の丸い 2 枚のガラス・まん中の柱・半分おろした日よけ・流れる景色と電柱）→ 網棚 → 窓の上の広告の列 */
  seatwin(e) { const night = LT.night > .4, r = rnd((e.seed || 7) + (e.v2 || 0) * 13), dir = e.sd < 0 ? -1 : 1, tun = e.seg && e.seg.th.tunnel, dist = G.dist || G.t * 12; // [27] 景色の流れる向きを、左右の窓で正しく（左の窓は、景色が前へ流れていた）
    bquad(0, .4, 1, 1, tint('#E8ECEF')); bquad(0, .405, 1, .425, tint(LC));
    ctx.globalAlpha = .07; bquad(0, .425, 1, .44, '#000000'); ctx.globalAlpha = 1; // [28] 帯の下の細いかげ
    const panes = e.one ? [[.07, .93]] : [[.04, .49], [.51, .96]]; // [8] 3 人がけの上は 1 枚、7 人がけの上は 2 枚
    for (const [x0, x1] of panes) { const y0 = .45, y1 = .79;
      bquad(x0 - .015, y0 - .022, x1 + .015, y1 + .022, tint('#59626B')); bquad(x0 - .006, y0 - .01, x1 + .006, y1 + .01, tint('#2F343A')); // [29] 窓の枠：外のこい枠と、内側の黒いゴム
      bpath(x0, y0, x1, y1); ctx.save(); ctx.clip();
      if (tun) { bquad(x0, y0, x1, y1, '#14171D'); for (let k = 0; k < 2; k++) { const o2 = ((dist * .045 * dir + k * .5) % 1 + 1) % 1, u = x0 + o2 * (x1 - x0); bquad(u - .03, .6, u, .625, '#FFE3A0'); ctx.globalAlpha = .25; bquad(u - .07, .57, u + .02, .655, '#FFD27A'); ctx.globalAlpha = 1; } // [30] トンネルの明かりが、電車の速さで流れる（光のにじみつき）
        ctx.globalAlpha = .5; bquad(x0, .5, x1, .505, '#3A3F48'); bquad(x0, .7, x1, .705, '#3A3F48'); ctx.globalAlpha = 1; } // [31] トンネルの壁のケーブル
      else { sceneView(e, x0, y0, x1, y1, e.seg && e.seg.th.winView || 'city');
        const off = ((dist * .012 * dir) % 1 + 1) % 1; for (let k = 0; k < 4; k++) { const u = x0 + ((k * .29 + off) % 1) * (x1 - x0); bquad(u - .05, y0, u, .58 + (k % 2) * .05, night ? '#2A3550' : tint('#7D8B97')); if (night) bquad(u - .04, .52, u - .03, .53, '#F7D58A'); } // [32] 近くのビルは景色より速く流れる（夜は窓の明かり）
        const op = ((dist * .05 * dir + (e.seed % 7) * .1) % 1.6 + 1.6) % 1.6; if (op < 1) { const u = x0 + op * (x1 - x0); bquad(u, y0, u + .007, y1, night ? '#11151C' : tint('#3B4148')); ctx.strokeStyle = night ? '#11151C' : tint('#3B4148'); ctx.lineWidth = 1; ctx.beginPath(); bline(x0, .75, x1, .74); bline(x0, .765, x1, .755); ctx.stroke(); } } // [33] 線路ぎわの柱と架線（いちばん近いので、いちばん速い）
      if (night) { bquad(x0, y0, x1, y1, 'rgba(255,240,210,.12)'); ctx.globalAlpha = .22; bquad(x0 + .02, y0 + .02, x1 - .02, y0 + .14, tint('#C9D2DA')); ctx.globalAlpha = 1; } // [34] 夜は車内の明かりがガラスにうつる（座席の背のかげ）
      else { ctx.globalAlpha = .16; bpath(x0 + (x1 - x0) * .12, y0, x0 + (x1 - x0) * .3, y1); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.globalAlpha = .08; bpath(x0 + (x1 - x0) * .36, y0, x0 + (x1 - x0) * .42, y1); ctx.fill(); ctx.globalAlpha = 1; } // [35] ガラスの映りこみ（太いのと細いの）
      const bl = (r() < .45 ? r() * .45 : 0) * (y1 - y0); if (bl > .01) { bquad(x0, y1 - bl, x1, y1, tint('#C9C3B5')); ctx.globalAlpha = .25; for (let k = 1; k < 5; k++) bquad(x0, y1 - bl * k / 5, x1, y1 - bl * k / 5 + .003, '#8A8270'); ctx.globalAlpha = 1; bquad(x0, y1 - bl - .014, x1, y1 - bl, tint('#8A949E')); bquad((x0 + x1) / 2 - .02, y1 - bl - .03, (x0 + x1) / 2 + .02, y1 - bl - .014, tint('#59626B')); } // [36] 日よけのひだ・下の棒・つまみ
      ctx.restore(); if (!e.one) bquad((x0 + x1) / 2 - .004, y0, (x0 + x1) / 2 + .004, y1, tint('#59626B')); }
    if (!e.one) bquad(.49, .43, .51, .81, tint('#59626B')); // [37] 2 枚の窓のあいだの柱
    bquad(0, .82, 1, .83, tint('#9AA4AD')); ctx.strokeStyle = tint('#B9C2CA'); ctx.lineWidth = 1; ctx.beginPath(); for (let k = 0; k <= 16; k++) bline(k / 16, .8, k / 16 + .02, .83); ctx.stroke(); bquad(0, .83, 1, .845, 'rgba(60,70,80,.18)'); // 網棚（金属の棒としかげ）
    for (const u of [.03, .97]) bquad(u - .01, .8, u + .01, .86, tint('#8A949E')); // [38] 網棚を支える金具
    if (e.prio) { bquad(.06, .3, .94, .4, tint('#F08A2E')); qtext(tr('優先席', 'PRIORITY SEATS'), .2, .31, .8, .39, '#FFFFFF'); } // [39] 優先席：窓の下にオレンジの帯と「優先席」
    const nA = e.one ? 2 : 4; for (let k = 0; k < nA; k++) { const a = k / nA + .01, w2 = 1 / nA - .02, c = ['#F7E7B8', '#CFE6F5', '#F4CFD8', '#D7EFD0', '#FBF6EE'][((e.seed || 0) + k) % 5]; bquad(a, .86, a + w2, .98, tint('#B9C2CA')); bquad(a + .01, .87, a + w2 - .01, .97, tint(c)); bquad(a + .03, .9, a + w2 * .5, .95, tint(['#C8463C', '#355F86', '#5F9E5A', '#E86A75'][k % 4])); ctx.globalAlpha = .5; bquad(a + w2 * .58, .9, a + w2 - .03, .915, tint('#59626B')); bquad(a + w2 * .58, .93, a + w2 - .05, .94, tint('#59626B')); ctx.globalAlpha = 1; } }, // [40] 窓の上の広告（文字の行を足す）
  /* ドア（2026-11-16・11-17）：戸袋のこい枠・2 枚の戸（角の丸い窓・外の景色・ゴムのふち・注意のシール）・横の手すり・上の 2 つの画面・開け閉めの赤いランプ・足もとの黄色 */
  door(e) { const night = LT.night > .4, tun = e.seg && e.seg.th.tunnel, dir = e.sd < 0 ? -1 : 1, dist = G.dist || G.t * 12;
    bquad(0, 0, 1, .86, tint('#59626B'));
    for (const [a, b] of [[.06, .495], [.505, .94]]) { const g0 = ctx.createLinearGradient(...bil(a, .5), ...bil(b, .5)); g0.addColorStop(0, tint('#CBD2D8')); g0.addColorStop(1, tint('#B7BFC6')); bquad(a, .02, b, .85, g0); bquad(a, .02, b, .05, tint('#9AA4AD')); // [41] 戸のステンレスのつや
      ctx.globalAlpha = .1; for (let k = 1; k < 9; k++) bquad(a + (b - a) * k / 9, .06, a + (b - a) * k / 9 + .003, .83, '#FFFFFF'); ctx.globalAlpha = 1; // [42] ステンレスのみがきの筋
      bquad(a + .07, .41, b - .07, .83, tint('#2F343A')); bpath(a + .08, .42, b - .08, .82); ctx.save(); ctx.clip(); // [43] 窓のゴムのふち
      if (tun) { bquad(a, .4, b, .84, '#14171D'); const o2 = ((dist * .045 * dir) % 1 + 1) % 1; bquad(a + o2 * (b - a), .6, a + o2 * (b - a) + .03, .625, '#FFE3A0'); } else { sceneView(e, a + .08, .42, b - .08, .82, e.seg && e.seg.th.winView || 'city'); if (night) bquad(a, .4, b, .84, 'rgba(255,240,210,.14)'); } // [44] ドアの窓にも外の景色
      ctx.globalAlpha = night ? .1 : .3; bquad(a + .1, .44, a + .16, .8, '#FFFFFF'); ctx.globalAlpha = 1; ctx.restore();
      { const c = bil((a + b) / 2, .37), rr = Math.max(1.5, Math.abs(bil(a + .06, .37)[0] - bil(a, .37)[0]) * .7); ctx.beginPath(); ctx.arc(c[0], c[1], rr, 0, Math.PI * 2); ctx.fillStyle = tint('#F2C230'); ctx.fill(); } // [45] 「指をはさまないように」の黄色い丸いシール
      if ((e.car || 0) % 4 === 0 && a < .5) { bquad(a + .1, .6, a + .2, .66, tint('#4E8CC8')); } // [99] 弱冷房車の青いシール（4 両に 1 両）
      bquad(a + .02, .2, a + .05, .26, tint('#8A949E')); } // [46] 戸のくぼみの取っ手
    bquad(.493, .02, .507, .85, '#1E2024'); ctx.globalAlpha = .5; bquad(.485, .02, .493, .85, '#3A3F45'); bquad(.507, .02, .515, .85, '#3A3F45'); ctx.globalAlpha = 1; // [47] 戸のあたりのゴム（2 重）
    bquad(.0, .05, .035, .8, tint('#D9DEE2')); bquad(.965, .05, 1, .8, tint('#D9DEE2')); ctx.globalAlpha = .35; bquad(.005, .05, .015, .8, '#FFFFFF'); bquad(.97, .05, .98, .8, '#FFFFFF'); ctx.globalAlpha = 1; // [48] ドアの横のたての手すり（つや）
    bquad(.04, .875, .48, .975, '#15181C'); bquad(.52, .875, .96, .975, '#15181C');
    bquad(.06, .89, .46, .96, night ? '#24476A' : '#2E5F8E'); bquad(.54, .89, .94, .96, '#F7F9FA'); bquad(.56, .9, .62, .95, LC);
    const nx = G.announce && G.announce.find(a => a.s > G.s); qtext(nx ? tr('つぎは ', 'Next: ') + nx.st : tr('つぎは', 'Next'), .08, .895, .44, .955, '#FBF6EE'); // [49] 上の左の画面：つぎの駅（英語の時は英語）
    { const k = Math.floor(G.t / 4 + (e.di || 0)) % 3; if (k === 0) { bquad(.64, .9, .92, .915, tint('#9AA4AD')); bquad(.64, .925, .86, .94, tint('#C9D2DA')); } else if (k === 1) { for (let j = 0; j < 4; j++) bquad(.64 + j * .07, .9, .69 + j * .07, .95, ['#E86A75', '#F2C230', '#7FD06A', '#6FC3E8'][j]); } else qtext((e.car || 1) + tr('号車', ''), .64, .895, .92, .955, '#2B2B2B'); } // [50] 右の画面は、ニュース・広告・号車案内が入れかわる
    const lampOn = G.announce && G.announce.some(a => Math.abs(a.s - G.s) < 3); bquad(.47, .965, .53, .99, lampOn && Math.sin(G.t * 9) > 0 ? '#FF4A3A' : '#5A2A26'); // [51] ドアの上の赤いランプ（駅に着くあたりで点滅）
    bquad(.0, .86, 1, .875, tint('#E8C23A')); bquad(0, 0, 1, .02, tint('#E8C23A')); ctx.globalAlpha = .55; bquad(.06, .02, .94, .03, '#9AA4AD'); ctx.globalAlpha = 1; }, // [52] 戸の下のレール
  trainmap(e) { bquad(0, 0, 1, 1, tint('#FBF6EE')); bquad(0, .86, 1, 1, tint(LC)); const c = bil(.5, .45), rx = Math.abs(bil(.85, .45)[0] - c[0]), ry = Math.abs(bil(.5, .78)[1] - c[1]);
    ctx.beginPath(); ctx.strokeStyle = LC; ctx.lineWidth = Math.max(1.5, rx * .12); ctx.ellipse(c[0], c[1], rx + .1, ry + .1, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = tint('#3B2A20'); for (let k = 0; k < 15; k++) { const a = k / 15 * Math.PI * 2; ctx.fillRect(c[0] + Math.cos(a) * rx - 1.5, c[1] + Math.sin(a) * ry - 1.5, 3, 3); }
    const a = (G.t * .05) % (Math.PI * 2); ctx.fillStyle = '#C8463C'; ctx.beginPath(); ctx.arc(c[0] + Math.cos(a) * rx, c[1] + Math.sin(a) * ry, Math.max(2, rx * .09), 0, Math.PI * 2); ctx.fill(); },  // 路線図：いまいる所に赤い丸
  stationsign(e) { const st = (e.seg && e.seg.stName) || '上野'; bquad(0, 0, 1, 1, tint('#FBF6EE')); bquad(0, .0, 1, .18, tint(LC)); qtext(st, .2, .45, .8, .9, '#2B2B2B'); },
  poster(e) { bquad(0, 0, 1, 1, tint('#FBF6EE')); bquad(.1, .45, .9, .9, tint(['#F2C230', '#4E77A0', '#5F9E5A', '#E86A75'][e.v2 || 0])); bquad(.1, .18, .7, .28, tint('#3B2A20')); bquad(.1, .32, .55, .38, tint('#9AA9B6')); },
  timetable(e) { bquad(0, 0, 1, 1, '#1C1919'); for (let k = 0; k < 4; k++) { bquad(.05, .1 + k * .22, .45, .24 + k * .22, '#F2C230'); bquad(.55, .1 + k * .22, .95, .24 + k * .22, k % 2 ? '#7FD06A' : '#FBF6EE'); } },
  plantwall(e) { bquad(0, 0, 1, 1, tint('#4F8A4A')); for (let k = 0; k < 9; k++) bquad((k * .37) % .9, (k * .23) % .85, (k * .37) % .9 + .12, (k * .23) % .85 + .14, tint('#7DB46A')); },
  whiteboard(e) { bquad(0, 0, 1, 1, tint('#9AA9B6')); bquad(.03, .05, .97, .95, tint('#FFFFFF')); ctx.strokeStyle = '#4E77A0'; ctx.lineWidth = 2; ctx.beginPath(); bline(.1, .7, .3, .75); bline(.1, .55, .45, .58); bline(.55, .2, .65, .45); bline(.65, .45, .75, .35); bline(.75, .35, .88, .75); ctx.stroke(); },
  screen(e) { bquad(0, 0, 1, 1, tint('#FFFFFF')); [.3, .5, .42, .75].forEach((h, k) => bquad(.15 + k * .18, .12, .27 + k * .18, .12 + h * .7, k === 3 ? '#C8463C' : '#4E77A0')); },
  clock(e) { /* 2026-11-17 オーナー「スタート画面の時計の向きが物理的におかしい」：前は壁の向きに関係なく、画面に正面を向いた丸と針を描いていた（横の壁にかかった時計が、こちらを向いていた）。
      いまは壁の面の上に描く：丸は壁の向きに合わせてつぶれただ円、目もりと針も壁の面の上（12 時は真上、3 時は壁の右）。木のわくの厚みも壁から少し出る */
    const v = e.v, wm = Math.hypot(v[3] - v[0], v[5] - v[2]) || 1, hm = Math.abs(v[7] - v[4]) || 1, rm = Math.min(wm, hm) * .46, ru = rm / wm, rv = rm / hm;
    const u0 = bil(0, .5), u1 = bil(1, .5), v0 = bil(.5, 0), v1 = bil(.5, 1), mir = ((u1[0] - u0[0]) * (v1[1] - v0[1]) - (u1[1] - u0[1]) * (v1[0] - v0[0])) > 0 ? -1 : 1; /* 壁の面を、こちらから見て左右が逆になる向きで持っている時は、3 時の向きを逆に（針が左右反対に回らないように） */
    const P = (a, k) => bil(.5 + mir * Math.sin(a) * ru * k, .5 + Math.cos(a) * rv * k), ring = k => { ctx.beginPath(); for (let i = 0; i <= 32; i++) { const q = P(i / 32 * Math.PI * 2, k); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.closePath(); };
    const c = P(0, 0), sz = Math.abs(P(Math.PI / 2, 1)[0] - c[0]) + Math.abs(P(0, 1)[1] - c[1]);
    ring(1.06); ctx.fillStyle = tint('#6B4631'); ctx.fill(); /* 木のわく */
    ring(.9); ctx.fillStyle = tint('#FBF6EE'); ctx.fill(); /* 文字盤 */
    ctx.strokeStyle = tint('#3B2A20'); ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(.6, sz * .03); ctx.beginPath(); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, q0 = P(a, k % 3 ? .74 : .66), q1 = P(a, .82); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); } ctx.stroke(); /* 目もり（3・6・9・12 は長く） */
    const m = G.clock % 60, h = (G.clock / 60) % 12, hq = P(h / 12 * Math.PI * 2, .45), mq = P(m / 60 * Math.PI * 2, .7);
    ctx.lineWidth = Math.max(1, sz * .07); ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(hq[0], hq[1]); ctx.stroke();
    ctx.lineWidth = Math.max(.8, sz * .045); ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(mq[0], mq[1]); ctx.stroke();
    ctx.fillStyle = tint('#3B2A20'); ctx.beginPath(); ctx.arc(c[0], c[1], Math.max(1, sz * .04), 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha *= .25; ring(.9); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = Math.max(.6, sz * .03); ctx.stroke(); ctx.globalAlpha /= .25; ctx.lineCap = 'butt'; }, /* ガラスのふちの光 */
  izakaya(e) { bquad(0, 0, 1, 1, '#2B1A12'); bquad(.08, .05, .92, .7, '#FFCF7A'); bquad(.08, .05, .92, .25, '#6B4631'); for (let k = 0; k < 3; k++) bquad(.12 + k * .27, .72, .34 + k * .27, .95, '#1C1919');
    for (let k = 0; k < 4; k++) bquad(.1 + k * .22, .58, .27 + k * .22, .9, k % 2 ? '#2F5579' : '#355F86'); qtext(['やきとり', '大衆酒場', 'もつ焼', 'おでん'][(e.v2 || 0) % 4], .15, .62, .85, .86, '#FBF6EE'); },
  menu(e) { bquad(0, 0, 1, 1, tint('#F6EBDC')); for (let k = 0; k < 5; k++) bquad(.15, .15 + k * .16, .85, .22 + k * .16, tint('#3B2A20')); },
  bigscreen(e) { bquad(0, 0, 1, 1, '#1C1919'); const k = Math.floor(G.t * .7 + (e.seed % 5)) % 4;
    if (k === 0) { bquad(.03, .05, .97, .95, '#F6EBDC'); qtext('REN & JILL', .1, .45, .9, .85, '#3B2A20'); qtext('レンとジル', .25, .15, .75, .42, '#A97A1E'); }
    else { const C2 = [['#E86A75', '#F2C230'], ['#4E77A0', '#7FD06A'], ['#9C7BD0', '#6FC3E8'], ['#F08A2E', '#FBF6EE']][k]; bquad(.03, .05, .97, .95, C2[0]); bquad(.12, .2, .55, .8, C2[1]); bquad(.62, .55, .9, .7, '#FBF6EE'); bquad(.62, .3, .82, .42, '#FBF6EE'); } },
  selev(e) { /* [S1] 押上の電波塔のエレベーター：四季の絵（春＝桜・夏＝花火・秋＝紅葉・冬＝雪）の扉の上の板 [S2] 銀の扉と合わせ目 [S3] 行き先「天望デッキ 350」の表示 [S4] 上り下りの矢印のランプ */
    const k = (e.v2 || 0) % 4, BG = ['#F6DCE4', '#1C2340', '#F2D9B8', '#DCE8F2'][k];
    bquad(0, 0, 1, 1, tint('#C9CED3')); bquad(.12, 0, .88, .7, tint('#E3E6E9')); ctx.strokeStyle = tint('#8A949E'); ctx.lineWidth = 2; ctx.beginPath(); bline(.5, 0, .5, .7); ctx.stroke();
    bquad(.08, .74, .92, .98, tint(BG)); const r = rnd((e.seed || 3) + k);
    for (let i = 0; i < 14; i++) { const u = .12 + r() * .76, v = .77 + r() * .18; if (k === 0) bquad(u, v, u + .025, v + .02, tint('#F4A6BA')); else if (k === 1) { const c = ['#FFD27A', '#FF7A9A', '#7AD8FF'][i % 3]; bquad(u, v, u + .012, v + .03, c); bquad(u - .01, v + .012, u + .022, v + .018, c); } else if (k === 2) bquad(u, v, u + .025, v + .02, tint(i % 2 ? '#D9452B' : '#E8A030')); else bquad(u, v, u + .015, v + .015, '#FFFFFF'); }
    qtext(tr('天望デッキ 350', 'DECK 350'), .3, .705, .7, .735, '#2B2B2B'); bquad(.9, .35, .96, .42, tint('#E9EDF0')); bquad(.915, .37, .945, .4, LT.night > .4 ? '#FFD27A' : tint('#9AA4AD')); },
  liftArt(e) { /* [H14] 四季のエレベーターのかべ：うるし塗りの黒い板に、季節の絵（春＝桜・夏＝隅田川の花火・秋＝紅葉・冬＝雪の結晶）。金のふち */
    const k = (e.seg && e.seg.liftK != null ? e.seg.liftK : (e.v2 || 0)) % 4, r = rnd((e.seed || 7) + k * 13);
    bquad(0, 0, 1, 1, tint('#1E1A18')); bquad(.03, .04, .97, .96, tint(['#2A1E22', '#121A30', '#2A1A12', '#1A2230'][k]));
    ctx.strokeStyle = tint('#C9A24A'); ctx.lineWidth = Math.max(1, ctx.lineWidth); ctx.beginPath(); bline(.03, .04, .97, .04); bline(.03, .96, .97, .96); bline(.03, .04, .03, .96); bline(.97, .04, .97, .96); ctx.stroke();
    if (k === 0) { ctx.strokeStyle = tint('#5A3A2A'); ctx.lineWidth *= 2; ctx.beginPath(); bline(.05, .3, .5, .45); bline(.5, .45, .9, .35); bline(.3, .38, .4, .65); ctx.stroke(); for (let i = 0; i < 40; i++) { const u = .08 + r() * .84, v = .2 + r() * .6; bquad(u, v, u + .02, v + .03, tint(i % 3 ? '#F4B6C6' : '#FBE3EA')); } }
    else if (k === 1) { for (let f = 0; f < 4; f++) { const cu = .2 + f * .2 + r() * .05, cv = .3 + r() * .3, c = ['#FFD27A', '#FF7A9A', '#7AD8FF', '#B9FF8A'][f]; ctx.strokeStyle = c; ctx.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; bline(cu, cv, cu + Math.cos(a) * .08, cv + Math.sin(a) * .12); } ctx.stroke(); } bquad(0.03, .82, .97, .96, tint('#1C2A44')); }
    else if (k === 2) { for (let i = 0; i < 34; i++) { const u = .08 + r() * .84, v = .15 + r() * .7; bquad(u, v, u + .035, v + .045, tint(['#D9452B', '#E8A030', '#C23A22'][i % 3])); } }
    else { ctx.strokeStyle = '#E9F2FF'; ctx.beginPath(); for (let i = 0; i < 9; i++) { const cu = .1 + r() * .8, cv = .15 + r() * .7, rr = .03 + r() * .03; for (let a = 0; a < 6; a++) { const t2 = a / 6 * Math.PI * 2; bline(cu, cv, cu + Math.cos(t2) * rr, cv + Math.sin(t2) * rr * 1.4); } } ctx.stroke(); } },
  liftGlass(e) { bquad(0, 0, 1, 1, tint('#D5DBE0')); for (let i = 0; i < 3; i++) bquad(.05 + i * .32, .08, .3 + i * .32, .92, tint('#E9EDF0')); ctx.strokeStyle = tint('#9AA4AD'); ctx.beginPath(); bline(0, .5, 1, .5); ctx.stroke(); }, /* [H15] 445m へのエレベーター：明るい銀の板 */
  liftDoor(e) { /* [H16] かごの正面：銀の 2 枚の扉と、上がっていく高さの数字（扉の上の表示）。着く直前に「ポーン」 */
    const th = e.lift || {}, sg = e.seg, cur = G.segs[G.ci] === sg ? G.s : 0, h = Math.round(lerp(th.liftFrom || 0, th.liftTo || 0, sstep(clamp((cur - 4) / Math.max(1, (sg ? sg.len : 30) - 10), 0, 1))));
    bquad(0, 0, 1, 1, tint('#7E868E')); bquad(.18, 0, .82, .8, tint('#C9CED3')); ctx.strokeStyle = tint('#8A949E'); ctx.lineWidth = Math.max(1, ctx.lineWidth * 1.6); ctx.beginPath(); bline(.5, 0, .5, .8); ctx.stroke();
    ctx.globalAlpha *= .3; bquad(.2, .05, .3, .78, '#FFFFFF'); bquad(.52, .05, .6, .78, '#FFFFFF'); ctx.globalAlpha /= .3;
    bquad(.3, .84, .7, .96, '#14161A'); qtext(h + ' m', .33, .855, .67, .945, '#FFB84A'); },
  elevator(e) { bquad(0, 0, 1, 1, tint('#B9C2CA')); bquad(.12, 0, .88, .86, tint('#D9DEE2')); ctx.strokeStyle = tint('#8A949E'); ctx.lineWidth = 2; ctx.beginPath(); bline(.5, 0, .5, .86); ctx.stroke();
    bquad(.3, .9, .7, .98, '#1C1919'); qtext(String(1 + ((e.v2 || 0) + Math.floor(G.t * .5)) % 9), .42, .9, .58, .98, '#FFB13B'); bquad(.92, .4, .98, .5, tint('#E9EDF0')); },
  bookshelf(e) { bquad(0, 0, 1, 1, tint('#6B4631')); const r = rnd((e.seed || 3) + (e.v2 || 0)); for (let row = 0; row < 5; row++) { const v0 = .05 + row * .19; let u = .03; while (u < .97) { const w = .02 + r() * .035; bquad(u, v0, Math.min(.97, u + w), v0 + .13 + r() * .03, tint(['#C8463C', '#355F86', '#F2C230', '#5F9E5A', '#E9E2D5', '#8A5530', '#46525E'][(r() * 7) | 0])); u += w + .004; } bquad(0, v0 - .02, 1, v0, tint('#4A2F20')); } },
  mirror(e) { bquad(0, 0, 1, 1, tint('#E9EEF2')); bquad(.08, .3, .92, .95, LT.night > .4 ? '#7E8A96' : tint('#BFD3E0')); bquad(.08, .3, .5, .95, 'rgba(255,255,255,.25)'); bquad(0, 0, 1, .26, tint('#F7F9FA')); },
  menuboard(e) { bquad(0, 0, 1, 1, '#2B2B2B'); qtext(['本日の定食', 'カレー', 'そば・うどん', 'A定食 B定食'][(e.v2 || 0) % 4], .08, .7, .92, .92, '#FBF6EE'); for (let k = 0; k < 3; k++) { bquad(.1, .12 + k * .18, .55, .24 + k * .18, '#E9E2D5'); bquad(.65, .12 + k * .18, .9, .24 + k * .18, '#F2C230'); } },
  woodpanel(e) { bquad(0, 0, 1, 1, tint('#7A5538')); ctx.strokeStyle = tint('#5A3D27'); ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = 1; k < 4; k++) bline(k / 4, 0, k / 4, 1); ctx.stroke(); bquad(.1, .45, .9, .8, tint('#8A6444')); },
  portrait(e) { bquad(0, 0, 1, 1, tint('#B08A3E')); bquad(.08, .06, .92, .94, tint('#E9E2D5')); bquad(.3, .12, .7, .55, tint('#8A6A55')); const c = bil(.5, .68); ctx.fillStyle = tint('#C9A882'); ctx.beginPath(); ctx.ellipse(c[0], c[1], Math.abs(bil(.68, .68)[0] - c[0]), Math.abs(bil(.5, .84)[1] - c[1]), 0, 0, Math.PI * 2); ctx.fill(); },
  /* つきあたりの壁の物（2026-11-16） */
  extinguisher(e) { bquad(.0, .0, 1, .05, 'rgba(0,0,0,.18)'); bquad(.22, .04, .78, .72, tint('#C8372D')); bquad(.3, .1, .42, .66, 'rgba(255,255,255,.28)'); bquad(.36, .72, .64, .84, tint('#2B2B2B')); bquad(.58, .76, .9, .82, tint('#2B2B2B')); bquad(.84, .5, .92, .8, tint('#2B2B2B')); bquad(.3, .3, .7, .48, tint('#FBF6EE')); bquad(.05, .88, .95, 1, tint('#C8372D')); bquad(.3, .91, .7, .97, tint('#FBF6EE')); }, // 消火器：赤い本体・つや・レバー・ホース・ラベル／上に赤い札
  exitsign(e) { const on = '#7FE0A0'; bquad(-.04, -.12, 1.04, 1.12, 'rgba(140,255,180,.16)'); bquad(0, 0, 1, 1, tint('#2E8B57')); bquad(.03, .08, .97, .92, on); bquad(.12, .2, .3, .8, tint('#2E8B57')); bquad(.3, .42, .55, .58, tint('#2E8B57')); bpath(.55, .5, .55, .5); { const a = bil(.55, .25), b = bil(.8, .5), c = bil(.55, .75); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.fillStyle = tint('#2E8B57'); ctx.fill(); } }, // 非常口の明かり：緑の箱・戸口と矢印
  carend(e) { const night = LT.night > .4, gl = night ? '#2A3550' : tint('#BFE3F5'); // 電車の車両のはし：ステンレスの板・となりの車両への引き戸（窓・取っ手・ゴムのふち）・両わきの窓・帯・号車の札・消火器の札
    bquad(0, 0, 1, 1, tint('#D9DEE2')); bquad(0, 0, 1, .035, tint('#59626B')); bquad(0, .1, 1, .125, tint(LC));
    for (const u of [.02, .7]) { bquad(u, .13, u + .28, .92, tint('#E8ECEF')); bquad(u + .04, .42, u + .24, .74, tint('#59626B')); bquad(u + .05, .435, u + .23, .725, gl); if (!night) { ctx.globalAlpha = .28; bquad(u + .07, .44, u + .1, .72, '#FFFFFF'); ctx.globalAlpha = 1; } bquad(u + .03, .78, u + .25, .8, tint('#9AA4AD')); }
    bquad(.33, 0, .67, .78, tint('#59626B')); bquad(.345, .01, .655, .765, tint('#C3CAD1')); bquad(.4, .36, .6, .7, tint('#3F4850')); bquad(.41, .37, .59, .69, gl); bquad(.36, .3, .385, .5, tint('#8A949E')); bquad(.345, .01, .655, .03, tint('#8A949E'));
    ctx.strokeStyle = tint('#59626B'); ctx.lineWidth = 1; ctx.beginPath(); bline(.5, .01, .5, .36); ctx.stroke();
    bquad(.44, .8, .56, .88, tint('#2F5579')); qtext(String(1 + ((e.seed || 3) % 10)), .46, .81, .54, .87, '#FBF6EE'); bquad(.72, .82, .8, .9, tint('#C8372D')); bquad(.2, .82, .28, .9, tint('#2E8B57')); },
  arrowR(e) { arrowSign(1); }, arrowL(e) { arrowSign(-1); },
  forkSign(e) { bquad(0, 0, 1, 1, '#2F5579'); bquad(.02, .05, .98, .95, '#3A6AA0'); ctx.strokeStyle = '#FBF6EE'; ctx.lineWidth = 2; ctx.beginPath(); bline(.5, .1, .5, .9); ctx.stroke();
    const lb = e.seg && e.seg.forkLbl; if (lb) { qtext('← ' + L(lb.L), .03, .2, .49, .8, '#FBF6EE'); qtext(L(lb.R) + ' →', .51, .2, .97, .8, '#FBF6EE'); } },
};
let LC = '#80C241'; // the current line's color (train stripe, station sign, route map)
function arrowSign(dir) {
  bquad(0, 0, 1, 1, '#2B2B2B'); bquad(.03, .06, .97, .94, '#F2C230');
  const P = dir > 0 ? [[.15, .4], [.55, .4], [.55, .2], [.88, .5], [.55, .8], [.55, .6], [.15, .6]] : [[.85, .4], [.45, .4], [.45, .2], [.12, .5], [.45, .8], [.45, .6], [.85, .6]];
  ctx.beginPath(); P.forEach(([u, v], i) => { const p = bil(u, v); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.fillStyle = '#2B2B2B'; ctx.fill();
}

/* ================= sky, skyline, landmarks ================= */
const SKYB = (() => { const a = []; const r = rnd(7); for (let i = 0; i < 160; i++) a.push({ a: r() * Math.PI * 2, w: .015 + r() * .05, h: .02 + Math.pow(r(), 2.2) * .17, t: r(), win: r(), ant: r() < .12, layer: r() < .45 ? 0 : 1 }); return a; })();
function angDiff(a, b) { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }
function altitude(seg, s) { const c = seg.th.climb; if (seg.th.lift) return Math.round(lerp(seg.th.liftFrom, seg.th.liftTo, sstep(clamp((s - 4) / Math.max(1, seg.len - 10), 0, 1)))); if (c && seg.base != null) return Math.max(0, Math.round(segE(seg, clamp(s, 0, seg.len)) - seg.base)); /* [H6] 高さの表示は、本当の地面からの高さ */ if (c && seg.th.sky) return Math.max(0, Math.round(segE(seg, clamp(s, 0, seg.len)) - (seg.e0 - c[0]))); return c ? Math.round(lerp(c[0], c[1], clamp(s / seg.len, 0, 1))) : 0; }
function drawSky(seg) {
  const th = seg.th, open = th.kind !== 'room' && th.kind !== 'train';
  const horizon = HORIZON - Math.tan(CAM.pitch) * FOCAL;
  if (!open && th.kind) { /* 室内・車内：天井の板がまだ無い所（部屋に入った直後・縦長の画面のいちばん上）に空の青が見えていた。天井と同じ色で塗る（2026-11-15） */
    const cc = C(th.ceil || '#EEF0F2'), gr = ctx.createLinearGradient(0, 0, 0, Math.max(40, horizon + 30)); gr.addColorStop(0, fogged(cc, .82, 2)); gr.addColorStop(.7, fogged(cc, .8, 18)); gr.addColorStop(1, fogged(cc, .74, 60)); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); G.skyIn = 1; return; }
  G.skyIn = 0;
  skyGradient(horizon);
  const N = LT.night;
  if (N > .5) { /* 星：四角い点 → 丸く、大きさと明るさをばらばらに、ゆっくりまたたく（「動きをひかえめ」ではまたたかない）。地平線の近くは町の明かりでうすく（2026-11-15） */ const calm = OPT().calm, tt = G.t || 0; ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 56; i++) { const x = ((i * 97.3 - CAM.yaw * 80) % W + W) % W, y = (i * 53.7) % (horizon * .85), big = i % 7 === 0, tw = calm ? .8 : .62 + .38 * Math.sin(tt * (1.1 + (i % 5) * .35) + i * 1.7); ctx.globalAlpha = clamp((N - .5) * 2, 0, 1) * tw * (big ? .95 : .7) * clamp(1.15 - y / Math.max(1, horizon * .85), .25, 1); ctx.beginPath(); ctx.arc(x, y, big ? 1.5 : .6 + (i % 3) * .28, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1; }
  drawSunGlow(horizon);
  if (N > .6 && G.weather === 'clear' && adSeason() === 'summer') drawFireworks(horizon);
  drawClouds2(horizon);
  if (N < .6 && G.weather === 'clear') drawBirds(horizon);
  const climb = !!th.climb, alt = climb ? altitude(seg, G.mode === 'title' ? 0 : G.s) : 0, drop = climb ? Math.min(H * .2, alt / 4200 * FOCAL) + Math.min(4, alt * .5) : 0; /* 2026-11-17：高い所から見た遠くの町の根もとは、地平線のすぐ下（本当の見え方：高さ÷きょり）。前は 450m で画面の 4 分の 1 も下げていて、展望台の窓の外は、床にかくれて町が見えなかった */
  const yb = horizon + drop;
  // while the camera swings round a corner, the last stretch's landmarks fade out instead of vanishing
  const prev = G.turnT > 0 && G.segs[G.ci - 1] && G.segs[G.ci - 1] !== seg ? G.segs[G.ci - 1] : null, fade = prev ? clamp(G.turnT / .8, 0, 1) : 0;
  const lmPass = (sg, fuji) => { for (const lm of sg.th.lm || []) if ((lm.t === 'fuji') === fuji) { landmark(sg, lm, yb); if (fuji) ranges(sg, lm, yb); } };
  if (prev && fade > .02) { ctx.globalAlpha = fade; lmPass(prev, true); ctx.globalAlpha = 1; }
  ctx.globalAlpha = 1 - fade; lmPass(seg, true); ctx.globalAlpha = 1;
  const rmOn = th.sky && typeof rmFrame === 'function' && rmFrame(seg); /* [M30] 鳥と降りる時は、地平線の平たいビルの絵を出さない（本物の場所の立体のビルがあるので、絵と立体が重なっていた） */
  if (!rmOn) skyline(seg, yb, 0);
  if (prev && fade > .02) { ctx.globalAlpha = fade; lmPass(prev, false); ctx.globalAlpha = 1; }
  ctx.globalAlpha = 1 - fade; lmPass(seg, false); ctx.globalAlpha = 1;
  if (!rmOn) skyline(seg, yb, 1);
  ctx.fillStyle = N > .4 ? 'rgb(36,44,74)' : `rgb(${(LT.bot[0] * .82) | 0},${(LT.bot[1] * .85) | 0},${(LT.bot[2] * .88) | 0})`; ctx.fillRect(0, yb, W, H - yb);
  if (climb && (alt >= 20 || th.sky)) { try { aerialCity(seg, yb, alt, horizon); } catch (e) { reportErr(e); } }
  if (th.sky && G.mode === 'play' && !OPT().calm) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.2; for (let k = 0; k < 9; k++) { const ph = (G.t * (1.4 + k * .13) + k * .37) % 1, x = ((k * 97) % W), y = horizon + 40 + ((k * 151) % Math.max(1, H - horizon - 80)) - ph * 60; ctx.globalAlpha = Math.sin(ph * Math.PI) * .5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (x - W / 2) * .08, y - 26); ctx.stroke(); } ctx.restore(); } /* [D14] 風のすじ（下へおりていく速さ） */ /* [D6] 空の上は、地面の近くまで町を描く（前は 20m より下で、町が消えて一色の地面になった） */
  else if (climb && N > .4) { ctx.fillStyle = 'rgba(255,214,140,.8)'; const r = rnd(5); for (let i = 0; i < 160; i++) { const x = ((r() * W * 3 - CAM.yaw * 300) % W + W) % W, y = yb + 2 + r() * (H - yb); ctx.fillRect(x, y, 1.6, 1.6); } }
}
// summer nights: fireworks far away over the city (2026-11-08)
const FW_COL = ['255,206,96', '255,128,140', '140,210,255', '190,255,160', '255,170,90'];
function drawFireworks(hz) {
  const SL = 1.7; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let j = 0; j < 2; j++) { const tt = G.t - j * SL * .5, slot = Math.floor(tt / SL), k = (tt - slot * SL) / SL, rn = n => { const v = Math.sin(slot * 12.9898 + j * 78.233 + n * 37.719) * 43758.5453; return v - Math.floor(v); };
    if (rn(9) < .25) continue; // now and then a quiet gap
    const x = ((rn(1) * 1.6 - CAM.yaw * .25) % 1.6 + 1.6) % 1.6 * W - W * .3, y = hz * (.7 + rn(2) * .16), R = Math.min(W, H) * (.08 + rn(3) * .06), c = FW_COL[(rn(4) * FW_COL.length) | 0];
    if (k < .22) { const u = k / .22; ctx.fillStyle = `rgba(${c},.8)`; ctx.fillRect(x - 1, hz - (hz - y) * u, 2, 5); continue; } // the trail going up
    const u = (k - .22) / .78, r = R * (1 - Math.pow(1 - u, 3)), a = Math.max(0, 1 - u * 1.15);
    ctx.fillStyle = `rgba(${c},${(a * .9).toFixed(3)})`;
    for (let i = 0; i < 22; i++) { const an = i / 22 * Math.PI * 2 + rn(5), px = x + Math.cos(an) * r, py = y + Math.sin(an) * r + u * u * R * .35; ctx.beginPath(); ctx.arc(px, py, 1.6 + (1 - u) * 1.2, 0, Math.PI * 2); ctx.fill(); }
    if (u < .3) { ctx.fillStyle = `rgba(255,250,230,${((.3 - u) * 1.6).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, R * .25, 0, Math.PI * 2); ctx.fill(); } }
  ctx.restore();
}
function drawBirds(hz) { // a few birds drifting across the sky
  ctx.strokeStyle = 'rgba(40,40,50,.55)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const t = G.t * .03 + i * .13, x = ((t + i * .37 - CAM.yaw * .05) % 1.2 + 1.2) % 1.2 * W - W * .1, y = hz * (.2 + (i % 3) * .08) + Math.sin(G.t + i) * 4, f = Math.sin(G.t * 8 + i * 2) * 3, w = 5 + (i % 2) * 2;
    ctx.beginPath(); ctx.moveTo(x - w, y - f); ctx.quadraticCurveTo(x - w * .4, y - 2, x, y); ctx.quadraticCurveTo(x + w * .4, y - 2, x + w, y - f); ctx.stroke(); }
}
let CLOUDS = null;
function drawClouds(hz) {
  if (!CLOUDS) CLOUDS = Array.from({ length: 7 }, () => ({ x: Math.random(), y: rand(.08, .6), w: rand(.14, .3) }));
  ctx.fillStyle = LT.night > .5 ? 'rgba(150,165,210,.18)' : G.weather === 'rain' ? 'rgba(160,166,172,.7)' : `rgba(255,${(240 + LT.amb[1] * 15) | 0},${(230 + LT.amb[2] * 25) | 0},.78)`;
  for (const c of CLOUDS) { const x = ((c.x - CAM.yaw * .08 + G.t * .002) % 1 + 1) % 1 * (W + 300) - 150, y = c.y * hz, w = c.w * W; ctx.beginPath(); ctx.ellipse(x, y, w * .5, w * .14, 0, 0, Math.PI * 2); ctx.ellipse(x + w * .18, y - w * .07, w * .24, w * .13, 0, 0, Math.PI * 2); ctx.ellipse(x - w * .2, y - w * .04, w * .2, w * .1, 0, 0, Math.PI * 2); ctx.fill(); }
}
function skyline(seg, yb, layer) {
  const N = LT.night, sc = seg.th.climb ? .6 : layer ? 1 : .7;
  for (const b of SKYB) {
    if (b.layer !== layer) continue;
    const dx = angDiff(b.a, CAM.yaw); if (Math.abs(dx) > 1.2) continue;
    const x = W / 2 + Math.tan(dx) * FOCAL, w = b.w * FOCAL * (layer ? 1 : .8), h = b.h * FOCAL * sc;
    const base = layer ? (N > .4 ? [26, 34, 62] : [140 + b.t * 40, 152 + b.t * 40, 170 + b.t * 36]) : (N > .4 ? [40, 50, 84] : [176 + b.t * 30, 188 + b.t * 28, 204 + b.t * 24]);
    const amb = N > .4 ? [1, 1, 1] : LT.amb; ctx.fillStyle = `rgb(${(base[0] * amb[0]) | 0},${(base[1] * amb[1]) | 0},${(base[2] * amb[2]) | 0})`;
    ctx.fillRect(x - w / 2, yb - h, w, h + 2);
    if (b.ant) { ctx.fillRect(x - 1, yb - h - h * .25, 2, h * .25); if (N > .4 && Math.floor(G.t * 1.5 + b.t * 5) % 2) { ctx.fillStyle = '#FF4A3D'; ctx.fillRect(x - 2, yb - h - h * .25 - 2, 4, 4); } }
    if (layer && h > 12) { ctx.fillStyle = N > .4 ? 'rgba(247,213,138,.85)' : 'rgba(255,255,255,.22)'; const cols = Math.max(1, (w / 6) | 0), rows = Math.max(1, (h / 7) | 0);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if (!N || ((i * 7 + j * 13 + (b.win * 100 | 0)) % 3)) ctx.fillRect(x - w / 2 + 2 + i * (w - 3) / cols, yb - h + 3 + j * (h - 4) / rows, Math.max(1, (w - 3) / cols - 2), 2.4); }
  }
}
// 本当の方角（brg）がある目印は、その道の向き（th.face）との差で置く（2026-11-17：塔の上で見回すと、本物と同じ順・同じ向きに並ぶ）
function lmAngle(seg, lm) { const th = seg.th; return lm.brg != null && th.face != null ? (lm.brg - th.face) * Math.PI / 180 : (lm.off || 0) + (seg.lmOff || 0) * .3; }
/* 2026-11-17 オーナー「右に曲がっても左に曲がっても、正面に見えていたタワーや皇居などが見えるのはおかしい」：
   目印（塔・城・山など）は、場所ごとに「その道の正面から少し横」に置いていたので、角を曲がって次の道に入ると、また正面に出ていた。
   → 一度見えた目印は、世界の中の向きを覚えておく（LM_WORLD）。角を曲がっても同じ向きにあり続ける＝右に曲がれば左うしろへ流れて見えなくなる。
   しばらく（道 4 本ぶん）出てこなかった目印は忘れる。その目印へ向かう道（grow＝近づくと大きくなる）と、本当の方角で置く所（brg）は、今までどおり自分の向き */
const LM_WORLD = {};
function lmWorldAngle(seg, lm) { const own = seg.dir * Math.PI / 2 + lmAngle(seg, lm); if (lm.brg != null || lm.grow || G.mode === 'title') return own;
  if (!seg.lmA) seg.lmA = {}; if (seg.lmA[lm.t] != null) return seg.lmA[lm.t];
  const reg = LM_WORLD[lm.t], a = reg && seg.id !== reg.id && Math.abs(seg.id - reg.id) <= 6 ? reg.a : own; LM_WORLD[lm.t] = { a, id: Math.max(seg.id, reg && Math.abs(seg.id - reg.id) <= 6 ? reg.id : 0) }; return seg.lmA[lm.t] = a; }
function landmark(seg, lm, yb) {
  const a = lmWorldAngle(seg, lm), dx = angDiff(a, CAM.yaw);
  if (Math.abs(dx) > 1.15) return;
  const grow = lm.grow && seg === G.segs[G.ci] && G.mode !== 'title' ? lerp(1, lm.grow, sstep(clamp(G.s / seg.len, 0, 1))) : 1; // 近づくほど大きく（足もとへ向かう道）
  const x = W / 2 + Math.tan(dx) * FOCAL, N = LT.night, s = (lm.sc || 1) * grow * (seg.th.climb && lm.t !== 'fuji' && lm.t !== 'tsukuba' ? .6 : 1);
  if (lm.t === 'tower') drawTokyoTower(x, yb, FOCAL * .42 * s, N);
  else if (lm.t === 'skytree') drawSkytree(x, yb, FOCAL * .72 * s, N);
  else if (lm.t === 'fuji') drawFuji(x, yb, FOCAL * (lm.brg != null ? .085 : .3) * s, N); // 電波塔コース PDCA 106（2026-11-17）：本当の方角で見る所（塔の上・空の上）では、富士山は 98km 先の高さ 3776m＝見上げる角度は約 2 度。前はその 5 倍以上の大きさで、目の前の山に見えた（少し大きめの 4.8 度。遠くの山らしく小さく）
  else if (lm.t === 'pagoda') drawPagoda(x, yb, FOCAL * .2 * s, N);
  else if (lm.t === 'tocho') drawTocho(x, yb, FOCAL * .36 * s, N);
  else if (lm.t === 'clock') drawClockTower(x, yb, FOCAL * .24 * s, N);
  else if (lm.t === 'yagura') drawYagura(x, yb, FOCAL * .14 * s, N);
  else if (lm.t === 'nijubashi') drawNijubashi(x, yb, FOCAL * .1 * s, N);
  else if (lm.t === 'kokugikan') drawKokugikan(x, yb, FOCAL * .12 * s, N);
  else if (lm.t === 'cyl') drawCyl(x, yb, FOCAL * .3 * s, N);
  else if (lm.t === 'gallery') drawGallery(x, yb, FOCAL * .16 * s, N);
  else if (lm.t === 'airport') drawAirport(x, yb, FOCAL * .3 * s, N);
  else if (lm.t === 'hondo') drawHondo(x, yb, FOCAL * .3 * s, N);
  else if (lm.t === 'hills') drawHills(x, yb, FOCAL * .3 * s, N);
  else if (lm.t === 'rbridge') drawSusBridge(x, yb, FOCAL * .16 * s, N);
  else if (lm.t === 'tsukuba') drawTsukuba(x, yb, FOCAL * .09 * s, N);
}
/* 2026-11-17 電波塔コースで足した目印（どれも、名前・会社のマークは無い、ただの形） */
// 浅草寺の本堂：急なこうばいの大きな屋根（両はしがそり上がる）、朱色の柱、白い壁、まん中に大きな赤いちょうちん、石段
function drawHondo(x, yb, h, N) { ctx.save(); const w = h * 1.5, night = N > .4, roofC = night ? '#232838' : tint('#5E6A70'), roofL = night ? '#343B50' : tint('#8C989C'), red = night ? '#8A3024' : tint('#C23B2A'), wall = night ? '#C9B48A' : tint('#F1ECE0');
  if (night) { ctx.shadowColor = 'rgba(255,190,110,.5)'; ctx.shadowBlur = 14; }
  ctx.fillStyle = night ? '#55514A' : tint('#B9B2A5'); for (let k = 0; k < 4; k++) ctx.fillRect(x - w * (.36 + k * .025), yb - h * (.02 + k * .018) - h * .018, w * (.72 + k * .05), h * .02); // 石段
  ctx.fillStyle = wall; ctx.fillRect(x - w * .44, yb - h * .4, w * .88, h * .32); ctx.shadowBlur = 0;
  ctx.fillStyle = red; for (let k = 0; k <= 8; k++) ctx.fillRect(x - w * .44 + k * w * .88 / 8 - h * .012, yb - h * .4, h * .024, h * .32); ctx.fillRect(x - w * .46, yb - h * .43, w * .92, h * .035); ctx.fillRect(x - w * .46, yb - h * .1, w * .92, h * .022); // 柱・長押・縁
  ctx.fillStyle = night ? '#3A2A1E' : 'rgba(40,24,18,.72)'; ctx.fillRect(x - w * .1, yb - h * .38, w * .2, h * .28); // ひらいた正面の暗がり
  ctx.fillStyle = night ? '#E0603A' : tint('#C8342A'); ctx.beginPath(); ctx.ellipse(x, yb - h * .27, h * .06, h * .085, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = night ? '#1E1A18' : tint('#2A2422'); ctx.fillRect(x - h * .05, yb - h * .36, h * .1, h * .016); ctx.fillRect(x - h * .05, yb - h * .2, h * .1, h * .016); // 大ちょうちん
  // 屋根：上は急で、軒へ向かってゆるく、両はしがそり上がる
  ctx.beginPath(); ctx.moveTo(x - w * .6, yb - h * .44); ctx.quadraticCurveTo(x - w * .5, yb - h * .5, x - w * .3, yb - h * .62); ctx.quadraticCurveTo(x - w * .2, yb - h * .86, x - w * .17, yb - h * .98);
  ctx.lineTo(x + w * .17, yb - h * .98); ctx.quadraticCurveTo(x + w * .2, yb - h * .86, x + w * .3, yb - h * .62); ctx.quadraticCurveTo(x + w * .5, yb - h * .5, x + w * .6, yb - h * .44); ctx.quadraticCurveTo(x, yb - h * .5, x - w * .6, yb - h * .44); ctx.closePath();
  const rg = ctx.createLinearGradient(0, yb - h, 0, yb - h * .44); rg.addColorStop(0, roofL); rg.addColorStop(1, roofC); ctx.fillStyle = rg; ctx.fill();
  ctx.strokeStyle = night ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.2)'; ctx.lineWidth = Math.max(.5, h * .004); ctx.beginPath(); for (let k = -9; k <= 9; k++) { const u = k / 9; ctx.moveTo(x + u * w * .17, yb - h * .97); ctx.quadraticCurveTo(x + u * w * .25, yb - h * .7, x + u * w * .56, yb - h * .47); } ctx.stroke(); // かわらの筋
  ctx.fillStyle = night ? '#1A1E2A' : tint('#434C52'); ctx.fillRect(x - w * .19, yb - h * 1.0, w * .38, h * .035); ctx.beginPath(); ctx.moveTo(x - w * .19, yb - h); ctx.quadraticCurveTo(x - w * .22, yb - h * 1.04, x - w * .2, yb - h * 1.07); ctx.lineTo(x - w * .17, yb - h); ctx.moveTo(x + w * .19, yb - h); ctx.quadraticCurveTo(x + w * .22, yb - h * 1.04, x + w * .2, yb - h * 1.07); ctx.lineTo(x + w * .17, yb - h); ctx.fill(); // 大むねと鬼がわら
  ctx.fillStyle = night ? 'rgba(0,0,0,.35)' : 'rgba(30,24,20,.28)'; ctx.beginPath(); ctx.moveTo(x - w * .6, yb - h * .44); ctx.quadraticCurveTo(x, yb - h * .5, x + w * .6, yb - h * .44); ctx.lineTo(x + w * .46, yb - h * .4); ctx.lineTo(x - w * .46, yb - h * .4); ctx.closePath(); ctx.fill(); // 軒下のかげ
  ctx.restore(); }
// 六本木の高い四角いビル：すそが少し広がる、上に航空の赤い灯
function drawHills(x, yb, h, N) { ctx.save(); const w = h * .26, c = N > .4 ? '#2A3352' : tint('#8D9BAA');
  ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - w * .62, yb); ctx.lineTo(x - w * .5, yb - h * .9); ctx.quadraticCurveTo(x, yb - h * 1.02, x + w * .5, yb - h * .9); ctx.lineTo(x + w * .62, yb); ctx.closePath(); ctx.fill();
  ctx.fillStyle = N > .4 ? 'rgba(255,224,160,.75)' : 'rgba(255,255,255,.28)'; for (let k = 1; k < 18; k++) { const y = yb - h * .9 * k / 18; ctx.fillRect(x - w * .48, y, w * .96, Math.max(1, h * .012)); }
  ctx.fillStyle = N > .4 ? 'rgba(0,0,0,.25)' : 'rgba(40,50,60,.18)'; ctx.fillRect(x + w * .12, yb - h * .9, w * .4, h * .9);
  if (N > .3 && Math.floor(G.t * 1.2) % 2) { ctx.fillStyle = '#FF4A3D'; ctx.beginPath(); ctx.arc(x, yb - h * .99, Math.max(1.5, h * .012), 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
// 海の上の白い吊り橋：2 本の塔、たれ下がる太いケーブル、2 段の橋げた。夜はケーブルに白い明かり
function drawSusBridge(x, yb, h, N) { ctx.save(); const L = h * 4.2, c = N > .4 ? '#DCE6FF' : tint('#EEF1F3'), t0 = x - L * .22, t1 = x + L * .22, dk = yb - h * .32;
  ctx.fillStyle = N > .4 ? 'rgba(20,30,60,.9)' : tint('#C9D2DA'); ctx.fillRect(x - L / 2, dk, L, h * .07); ctx.fillRect(x - L / 2, dk + h * .1, L, h * .04);
  ctx.fillStyle = c; for (const tx of [t0, t1]) { ctx.fillRect(tx - h * .06, yb - h, h * .035, h); ctx.fillRect(tx + h * .025, yb - h, h * .035, h); ctx.fillRect(tx - h * .06, yb - h * .62, h * .12, h * .03); ctx.fillRect(tx - h * .06, yb - h * .95, h * .12, h * .03); }
  ctx.strokeStyle = c; ctx.lineWidth = Math.max(1, h * .02); ctx.beginPath(); ctx.moveTo(x - L / 2, dk); ctx.quadraticCurveTo((x - L / 2 + t0) / 2, yb - h * .55, t0, yb - h * .97); ctx.quadraticCurveTo(x, yb - h * .2, t1, yb - h * .97); ctx.quadraticCurveTo((x + L / 2 + t1) / 2, yb - h * .55, x + L / 2, dk); ctx.stroke();
  ctx.lineWidth = Math.max(.6, h * .006); ctx.beginPath(); for (let k = 1; k < 14; k++) { const u = k / 14, px = lerp(t0, t1, u), py = yb - h * .97 + (1 - (2 * u - 1) ** 2) * h * .58; ctx.moveTo(px, py); ctx.lineTo(px, dk); } ctx.stroke();
  if (N > .4) { ctx.fillStyle = 'rgba(255,255,255,.9)'; for (let k = 0; k <= 20; k++) { const u = k / 20, px = lerp(t0, t1, u), py = yb - h * .97 + (1 - (2 * u - 1) ** 2) * h * .58; ctx.fillRect(px - 1, py - 1, 2, 2); } } ctx.restore(); }
// 北東のはるか遠くの山：ふたつの頂（男体山・女体山）が並ぶ、低い青い山
function drawTsukuba(x, yb, h, N) { ctx.save(); ctx.fillStyle = N > .4 ? 'rgba(40,48,80,.9)' : 'rgba(118,138,168,.62)'; ctx.beginPath(); ctx.moveTo(x - h * 4, yb);
  ctx.quadraticCurveTo(x - h * 1.6, yb - h * .35, x - h * .5, yb - h * .92); ctx.quadraticCurveTo(x - h * .25, yb - h * 1.02, x, yb - h * .82); ctx.quadraticCurveTo(x + h * .3, yb - h * 1.08, x + h * .6, yb - h * .9); ctx.quadraticCurveTo(x + h * 1.8, yb - h * .3, x + h * 4.2, yb); ctx.closePath(); ctx.fill(); ctx.restore(); }
function drawTokyoTower(x, yb, h, N) {
  ctx.save(); if (N > .4) { ctx.shadowColor = '#FF9A4D'; ctx.shadowBlur = 18; }
  const red = N > .4 ? '#FF8A3D' : tint('#E2462E'), white = N > .4 ? '#FFD9A8' : tint('#F3F3F3');
  const P = [[-.21, 0], [-.075, .45], [-.05, .62], [-.03, .78], [-.012, .9], [0, 1], [.012, .9], [.03, .78], [.05, .62], [.075, .45], [.21, 0]];
  ctx.beginPath(); P.forEach(([u, v], i) => { const px = x + u * h, py = yb - v * h; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.closePath(); ctx.fillStyle = red; ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(60,30,26,.5)'; ctx.beginPath(); ctx.moveTo(x - .14 * h, yb); ctx.quadraticCurveTo(x, yb - .3 * h, x + .14 * h, yb); ctx.fill();
  ctx.fillStyle = white; [[.27, .135], [.56, .06]].forEach(([v, wv]) => ctx.fillRect(x - wv * h, yb - v * h - h * .015, wv * 2 * h, h * .03));
  ctx.fillStyle = N > .4 ? '#FFF1C9' : tint('#DDE3E8'); ctx.fillRect(x - .085 * h, yb - .46 * h, .17 * h, .035 * h); ctx.fillRect(x - .04 * h, yb - .79 * h, .08 * h, .025 * h);
  ctx.strokeStyle = N > .4 ? 'rgba(255,240,200,.5)' : 'rgba(120,30,20,.35)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let k = 0; k < 8; k++) { const v0 = k * .055, v1 = v0 + .055, w0 = lerp(.21, .075, v0 / .45), w1 = lerp(.21, .075, v1 / .45); ctx.moveTo(x - w0 * h, yb - v0 * h); ctx.lineTo(x + w1 * h, yb - v1 * h); ctx.moveTo(x + w0 * h, yb - v0 * h); ctx.lineTo(x - w1 * h, yb - v1 * h); }
  ctx.stroke(); ctx.restore();
}
function drawSkytree(x, yb, h, N) {
  ctx.save(); if (N > .4) { ctx.shadowColor = '#8FB0FF'; ctx.shadowBlur = 16; }
  const c = N > .4 ? '#B8C8FF' : tint('#AEBBC8');
  ctx.beginPath(); ctx.moveTo(x - .055 * h, yb); ctx.lineTo(x - .03 * h, yb - .54 * h); ctx.lineTo(x - .02 * h, yb - .7 * h); ctx.lineTo(x - .012 * h, yb - .86 * h); ctx.lineTo(x - .003 * h, yb - h);
  ctx.lineTo(x + .003 * h, yb - h); ctx.lineTo(x + .012 * h, yb - .86 * h); ctx.lineTo(x + .02 * h, yb - .7 * h); ctx.lineTo(x + .03 * h, yb - .54 * h); ctx.lineTo(x + .055 * h, yb); ctx.closePath(); ctx.fillStyle = c; ctx.fill();
  ctx.beginPath(); ctx.ellipse(x, yb - .54 * h, .055 * h, .02 * h, 0, 0, Math.PI * 2); ctx.ellipse(x, yb - .7 * h, .036 * h, .014 * h, 0, 0, Math.PI * 2); ctx.fillStyle = N > .4 ? '#E6ECFF' : tint('#C9D4DE'); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = N > .4 ? 'rgba(140,160,255,.6)' : 'rgba(110,130,150,.35)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let k = 0; k < 9; k++) { const v = k * .058, w = lerp(.055, .03, v / .54); ctx.moveTo(x - w * h, yb - v * h); ctx.lineTo(x + w * h, yb - (v + .058) * h); }
  ctx.stroke(); ctx.restore();
}
// low blue mountain ranges in front of Fuji's foot, so the mountain sits on the land
function ranges(seg, lm, yb) {
  const a = lmWorldAngle(seg, lm), dx = angDiff(a, CAM.yaw); if (Math.abs(dx) > 1.3) return;
  const x0 = W / 2 + Math.tan(dx) * FOCAL, h = FOCAL * .3 * (lm.sc || 1), N = LT.night;
  for (const [k, amp, alpha] of [[0, .16, .75], [1, .1, .9]]) {
    const c = N > .4 ? [34, 42, 74] : mixC(mixC([110, 124, 160], LT.bot, .45 + k * .2), [255, 255, 255], .05);
    ctx.fillStyle = `rgba(${c.map(v => v | 0)},${alpha})`; ctx.beginPath(); ctx.moveTo(x0 - h * 6, yb + 2);
    for (let i = 0; i <= 48; i++) { const u = i / 48, x = x0 - h * 6 + u * h * 12; const y = yb - h * amp * (.45 + .35 * Math.sin(u * 17 + k * 2) + .2 * Math.sin(u * 41 + k)) * (1 - Math.abs(u - .5) * .6); ctx.lineTo(x, y); }
    ctx.lineTo(x0 + h * 6, yb + 2); ctx.closePath(); ctx.fill();
  }
}
function drawFuji(x, yb, h, N) {
  // Mt. Fuji: concave slopes, a short flat summit with small notches, a snowcap with long streaks, haze at the foot
  yb += h * .06; const W2 = h * 3.4, top = yb - h, sw = h * .3;
  const body = () => { ctx.beginPath(); ctx.moveTo(x - W2, yb + 2);
    ctx.bezierCurveTo(x - W2 * .48, yb - h * .06, x - h * .78, yb - h * .52, x - sw, top + h * .02);
    ctx.lineTo(x - sw * .55, top - h * .012); ctx.lineTo(x - sw * .3, top + h * .01); ctx.lineTo(x - sw * .05, top - h * .016); ctx.lineTo(x + sw * .25, top + h * .006); ctx.lineTo(x + sw * .6, top - h * .01); ctx.lineTo(x + sw, top + h * .025);
    ctx.bezierCurveTo(x + h * .8, yb - h * .5, x + W2 * .5, yb - h * .05, x + W2, yb + 2); ctx.closePath(); };
  const sunset = clamp((G.clock - 1000) / 80, 0, 1) * (1 - N);
  const g = ctx.createLinearGradient(0, top, 0, yb);
  if (N > .4) { g.addColorStop(0, '#2A3460'); g.addColorStop(1, 'rgba(36,46,84,.9)'); }
  else { const c1 = mixC([92, 108, 158], [150, 96, 120], sunset), c2 = mixC(LT.bot, [255, 255, 255], .12);
    g.addColorStop(0, `rgb(${c1.map(v => v | 0)})`); g.addColorStop(.7, `rgb(${mixC(c1, c2, .55).map(v => v | 0)})`); g.addColorStop(1, `rgba(${c2.map(v => v | 0)},.95)`); }
  body(); ctx.fillStyle = g; ctx.fill();
  // right flank a little darker
  ctx.save(); body(); ctx.clip(); { const sg = ctx.createLinearGradient(x - h * .3, 0, x + h * 1.2, 0); sg.addColorStop(0, 'rgba(30,30,80,0)'); sg.addColorStop(1, N > .4 ? 'rgba(0,0,20,.28)' : 'rgba(40,40,90,.18)'); ctx.fillStyle = sg; ctx.fillRect(x - h * .3, top - 5, W2 + h, h + 10); }
  // snowcap with streaks running down the gullies
  const sc = N > .4 ? 'rgba(200,210,240,.55)' : sunset > .3 ? `rgba(255,${(232 - sunset * 40) | 0},${(236 - sunset * 50) | 0},.96)` : 'rgba(255,255,255,.97)';
  ctx.beginPath(); ctx.moveTo(x - sw * 1.05, top);
  const fingers = [[-.95, .34], [-.8, .27], [-.68, .44], [-.52, .3], [-.38, .5], [-.22, .33], [-.06, .46], [.1, .31], [.26, .52], [.42, .34], [.58, .47], [.74, .28], [.88, .38], [1.02, .26]];
  for (const [u, d] of fingers) ctx.lineTo(x + u * h * .78, top + d * h);
  ctx.lineTo(x + sw * 1.1, top); ctx.closePath(); ctx.fillStyle = sc; ctx.fill();
  ctx.strokeStyle = N > .4 ? 'rgba(160,175,220,.22)' : 'rgba(255,255,255,.32)'; ctx.lineWidth = Math.max(.8, h * .008); ctx.lineCap = 'round'; ctx.beginPath();
  for (const u of [-.75, -.45, -.15, .2, .5, .8]) { ctx.moveTo(x + u * h * .72, top + h * .3); ctx.quadraticCurveTo(x + u * h * .86, top + h * .45, x + u * h * 1.0, top + h * .58); } ctx.stroke();
  ctx.restore();
  // haze at the foot
  const hz = ctx.createLinearGradient(0, yb - h * .35, 0, yb);
  hz.addColorStop(0, `rgba(${LT.bot.map(v => v | 0)},0)`); hz.addColorStop(1, `rgba(${LT.bot.map(v => v | 0)},.85)`);
  ctx.fillStyle = hz; ctx.fillRect(x - W2, yb - h * .35, W2 * 2, h * .37);
}
function drawPagoda(x, yb, h, N) {
  const c = N > .4 ? '#2A2030' : tint('#5C4A3E'), red = N > .4 ? '#E0603A' : tint('#C0392B');
  for (let k = 0; k < 5; k++) { const y = yb - k * h * .17, w = h * (.42 - k * .05); ctx.fillStyle = red; ctx.fillRect(x - w * .35, y - h * .12, w * .7, h * .12); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - w * .6, y - h * .12); ctx.quadraticCurveTo(x, y - h * .18, x + w * .6, y - h * .12); ctx.lineTo(x + w * .4, y - h * .16); ctx.lineTo(x - w * .4, y - h * .16); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = c; ctx.fillRect(x - 1.5, yb - h * 1.08, 3, h * .25);
}
function drawTocho(x, yb, h, N) {
  const c = N > .4 ? '#27304E' : tint('#A9B4BF'), w = h * .34;
  ctx.fillStyle = c; ctx.fillRect(x - w * .5, yb - h * .62, w, h * .62);
  for (const sd of [-1, 1]) { ctx.fillRect(x + sd * w * .28 - w * .2, yb - h, w * .4, h * .4); }
  ctx.fillStyle = N > .4 ? 'rgba(247,213,138,.85)' : 'rgba(255,255,255,.3)'; for (let j = 0; j < 14; j++) for (let i = 0; i < 6; i++) ctx.fillRect(x - w * .45 + i * w * .15, yb - h * .95 + j * h * .066, w * .08, h * .02);
}
function drawYagura(x, yb, h, N) { // Fushimi-yagura style turret on a stone wall
  const w = h * 1.6; ctx.fillStyle = N > .4 ? '#3A3A44' : tint('#9A9384'); ctx.beginPath(); ctx.moveTo(x - w * .8, yb); ctx.lineTo(x - w * .62, yb - h * .45); ctx.lineTo(x + w * .62, yb - h * .45); ctx.lineTo(x + w * .8, yb); ctx.fill();
  ctx.fillStyle = N > .4 ? '#D8D2C2' : tint('#F3F0E8'); ctx.fillRect(x - w * .48, yb - h * .78, w * .96, h * .33); ctx.fillRect(x - w * .32, yb - h * 1.05, w * .64, h * .22);
  ctx.fillStyle = N > .4 ? '#20242E' : tint('#3E4650'); for (const [y0, ww] of [[.78, .6], [1.05, .44]]) { ctx.beginPath(); ctx.moveTo(x - w * ww, yb - h * (y0 - .02)); ctx.quadraticCurveTo(x, yb - h * (y0 + .12), x + w * ww, yb - h * (y0 - .02)); ctx.lineTo(x + w * ww * .8, yb - h * (y0 + .06)); ctx.lineTo(x - w * ww * .8, yb - h * (y0 + .06)); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = N > .4 ? '#FFE6A8' : tint('#3E4650'); for (let k = 0; k < 4; k++) ctx.fillRect(x - w * .36 + k * w * .22, yb - h * .66, w * .07, h * .08);
}
function drawNijubashi(x, yb, h, N) { // stone double-arch bridge with lamps
  const w = h * 3; ctx.fillStyle = N > .4 ? '#4A4A56' : tint('#C9C2B2'); ctx.fillRect(x - w / 2, yb - h * .55, w, h * .14);
  ctx.beginPath(); ctx.moveTo(x - w / 2, yb - h * .41); for (const c of [-.25, .25]) { ctx.lineTo(x + (c - .2) * w, yb - h * .41); ctx.quadraticCurveTo(x + c * w, yb - h * .05, x + (c + .2) * w, yb - h * .41); } ctx.lineTo(x + w / 2, yb - h * .41); ctx.lineTo(x + w / 2, yb); ctx.lineTo(x - w / 2, yb); ctx.closePath(); ctx.fill();
  ctx.fillStyle = N > .4 ? 'rgba(120,150,170,.5)' : 'rgba(80,120,130,.45)'; for (const c of [-.25, .25]) { ctx.beginPath(); ctx.ellipse(x + c * w, yb - h * .02, w * .18, h * .18, 0, Math.PI, 0); ctx.fill(); }
  for (let k = 0; k < 5; k++) { const lx = x - w * .45 + k * w * .225; ctx.fillStyle = N > .4 ? '#2B2B2B' : tint('#3B3B3B'); ctx.fillRect(lx - 1, yb - h * .85, 2, h * .3); ctx.fillStyle = N > .4 ? '#FFE6A8' : '#F3F0E8'; ctx.beginPath(); ctx.arc(lx, yb - h * .88, Math.max(1.5, h * .04), 0, Math.PI * 2); ctx.fill(); }
}
function drawKokugikan(x, yb, h, N) { const w = h * 2.6; ctx.fillStyle = N > .4 ? '#2E3440' : tint('#E9E4DA'); ctx.fillRect(x - w * .46, yb - h * .45, w * .92, h * .45);
  ctx.fillStyle = N > .4 ? '#3E6A5E' : tint('#5E9C86'); ctx.beginPath(); ctx.moveTo(x - w * .52, yb - h * .44); ctx.quadraticCurveTo(x - w * .3, yb - h * .62, x, yb - h); ctx.quadraticCurveTo(x + w * .3, yb - h * .62, x + w * .52, yb - h * .44); ctx.closePath(); ctx.fill(); }
function drawCyl(x, yb, h, N) { const w = h * .22; const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, N > .4 ? '#2A3350' : tint('#B9C3CC')); g.addColorStop(.5, N > .4 ? '#4A5880' : tint('#EEF2F6')); g.addColorStop(1, N > .4 ? '#2A3350' : tint('#9AA9B6'));
  ctx.fillStyle = g; ctx.fillRect(x - w / 2, yb - h, w, h); ctx.beginPath(); ctx.ellipse(x, yb - h, w / 2, w * .12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = N > .4 ? '#F7D58A' : 'rgba(255,255,255,.5)'; for (let k = 1; k < 9; k++) ctx.fillRect(x - w / 2 + 2, yb - h * k / 9, w - 4, 1.5); if (N > .3) { ctx.fillStyle = '#E86A75'; ctx.fillRect(x - w * .35, yb - h * .9, w * .7, h * .08); } }
function drawGallery(x, yb, h, N) { const w = h * 2.4; ctx.fillStyle = N > .4 ? '#3A3A44' : tint('#D9D2C2'); ctx.fillRect(x - w / 2, yb - h * .45, w, h * .45); ctx.fillRect(x - w * .14, yb - h * .62, w * .28, h * .2);
  ctx.fillStyle = N > .4 ? '#2F4A48' : tint('#6E9C8E'); ctx.beginPath(); ctx.ellipse(x, yb - h * .62, w * .14, h * .32, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(x - 1, yb - h * 1.02, 2, h * .1); }
function drawClockTower(x, yb, h, N) {
  const c = N > .4 ? '#2F3550' : tint('#C9C1B2'); const w = h * .45;
  ctx.fillStyle = c; ctx.fillRect(x - w / 2, yb - h * .75, w, h * .75); ctx.fillRect(x - w * .3, yb - h, w * .6, h * .3);
  ctx.beginPath(); ctx.fillStyle = N > .4 ? '#FFF1C9' : '#FBF6EE'; ctx.arc(x, yb - h * .86, w * .2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#3B2A20'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, yb - h * .86); ctx.lineTo(x, yb - h * .86 - w * .15); ctx.moveTo(x, yb - h * .86); ctx.lineTo(x + w * .1, yb - h * .86); ctx.stroke();
}

/* ================= extra sprites ================= */
function buildWorldSprites() {
  const can = (cols, n) => { const c = mk(256), g = c.getContext('2d') || noCtx(); const r = rnd(n); for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 90; g.beginPath(); g.fillStyle = cols[(r() * cols.length) | 0]; g.arc(128 + Math.cos(a) * d, 120 + Math.sin(a) * d * .8, 18 + r() * 22, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(128, 190, 90, 30, 0, 0, Math.PI * 2); g.fill(); return c; };
  for (const k in TREE) SPR['canopy_' + k] = leafCrown(TREE[k].length > 2 ? TREE[k] : [TREE[k][0], TREE[k][0], TREE[k][0]], k.length * 7);
  { const c = mk(256), g = c.getContext('2d') || noCtx(), r = rnd(9); for (let i = 0; i < 160; i++) { const v = r(), wv = (1 - v) * 92 + 6; g.beginPath(); g.fillStyle = TREE.ginkgo[(r() * 3) | 0]; g.arc(128 + (r() * 2 - 1) * wv * .8, 20 + v * 210, 10 + r() * 10, 0, Math.PI * 2); g.fill(); } SPR.canopy_cone = c; }
  { const c = mk(256), g = c.getContext('2d') || noCtx(), r = rnd(4); for (let k = 0; k < 4; k++) for (let i = 0; i < 26; i++) { g.beginPath(); g.fillStyle = TREE.pine[(r() * 3) | 0]; g.ellipse(128 + (r() * 2 - 1) * 100, 60 + k * 45 + r() * 20, 26 + r() * 20, 10 + r() * 6, 0, 0, Math.PI * 2); g.fill(); } SPR.canopy_pine = c; }
  { const day = leafCrown(TREE.green, 31), c = mk(256), g = c.getContext('2d') || noCtx(); g.drawImage(day, 0, 0); const r = rnd(11); for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(255,230,150,.9)'; g.beginPath(); g.arc(30 + r() * 196, 30 + r() * 170, 2.2, 0, Math.PI * 2); g.fill(); } SPR.canopy_illum = c;
    const n = mk(256), h2 = n.getContext('2d') || noCtx(); h2.globalAlpha = .55; h2.filter = 'brightness(.25)'; h2.drawImage(day, 0, 0); h2.filter = 'none'; h2.globalAlpha = 1; const r2 = rnd(13);
    for (let i = 0; i < 160; i++) { const x = 28 + r2() * 200, y = 24 + r2() * 176; const gr = h2.createRadialGradient(x, y, 0, x, y, 7); gr.addColorStop(0, 'rgba(255,236,170,1)'); gr.addColorStop(1, 'rgba(255,200,110,0)'); h2.fillStyle = gr; h2.fillRect(x - 7, y - 7, 14, 14); } SPR.canopy_illumN = n; }
  { const c = mk(128), g = c.getContext('2d') || noCtx(); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(255,230,170,.95)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); SPR.glow = c; }
  { const c = mk(128), g = c.getContext('2d') || noCtx(); g.fillStyle = '#2B1A12'; g.fillRect(48, 6, 32, 12); g.fillRect(48, 110, 32, 12); const gr = g.createRadialGradient(54, 50, 6, 64, 64, 60); gr.addColorStop(0, '#FF7A5C'); gr.addColorStop(1, '#C0392B'); g.fillStyle = gr; g.beginPath(); g.ellipse(64, 64, 42, 50, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.25)'; for (let k = 1; k < 6; k++) { g.beginPath(); g.ellipse(64, 64 - 50 + k * 16.6, 42 * Math.sin(k / 6 * Math.PI), 3, 0, 0, Math.PI * 2); g.stroke(); } SPR.lantern = c; }
  { const c = mk(64), g = c.getContext('2d') || noCtx(); /* 見た目 163〜165：電車のつり革。布のベルトに / 輪を太さと光のある樹脂に / ベルトと輪のつなぎ目 */
    g.fillStyle = '#9AA4AD'; g.fillRect(28.5, 0, 7, 34); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(29.5, 0, 2, 34); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(34, 0, 1.5, 34); g.fillStyle = '#6E7B88'; g.beginPath(); g.roundRect ? g.roundRect(26.5, 30, 11, 7, 2) : g.rect(26.5, 30, 11, 7); g.fill();
    g.strokeStyle = '#C9D2DA'; g.lineWidth = 5.5; g.beginPath(); g.ellipse(32, 49, 11.5, 12.5, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#F7F9FA'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(32, 49, 13, 14, 0, Math.PI * 1.05, Math.PI * 1.6); g.stroke(); g.strokeStyle = 'rgba(70,82,94,.4)'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(32, 49, 13.6, 14.6, 0, Math.PI * .1, Math.PI * .7); g.stroke(); SPR.strap = c; }
  { const c = mk(64), g = c.getContext('2d') || noCtx(); g.drawImage(SPR.strap, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(242,194,48,.75)'; g.fillRect(0, 36, 64, 28); g.fillStyle = 'rgba(240,138,46,.5)'; g.fillRect(28, 0, 8, 34); SPR.strapP = c; } // [24] 優先席の前の、黄色いつり革
  { const c = mk(128), g = c.getContext('2d') || noCtx(); /* 見た目 166〜168：花だんの花。丸 → 葉は葉の形に / 花は花びら 5 枚と花心 / 奥から手前へ重ねる */
    const P = []; for (let i = 0; i < 26; i++) P.push([20 + (i * 37) % 90, 40 + (i * 23) % 60, i]); P.sort((a, b) => a[1] - b[1]);
    for (const [x, y, i] of P) { if (i % 3) { g.fillStyle = i % 2 ? '#5F9E5A' : '#4A8A48'; for (const a of [-.7, 0, .7]) { g.save(); g.translate(x, y + 6); g.rotate(a + (i % 5) * .1 - .2); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(5, -8, 0, -16); g.quadraticCurveTo(-5, -8, 0, 0); g.fill(); g.restore(); } }
      else { const col = ['#E86A75', '#F2C230', '#FBF6EE', '#C792EA'][i % 4]; g.save(); g.translate(x, y); for (let k = 0; k < 5; k++) { g.rotate(Math.PI * 2 / 5); const pg = g.createLinearGradient(0, 0, 0, -11); pg.addColorStop(0, col); pg.addColorStop(1, '#FFFFFF'); g.fillStyle = pg; g.beginPath(); g.ellipse(0, -6.5, 4.6, 6, 0, 0, Math.PI * 2); g.fill(); } g.fillStyle = col === '#F2C230' ? '#C8742A' : '#F6D36B'; g.beginPath(); g.arc(0, 0, 3, 0, Math.PI * 2); g.fill(); g.restore(); } } SPR.flowers = c; }
  { const c = mk(64), g = c.getContext('2d') || noCtx(); /* 見た目 169〜171：海のブイ。丸みの濃淡 / 白い帯と水ぎわの波 / てっぺんの輪 */
    { const bg = g.createRadialGradient(24, 22, 2, 32, 36, 24); bg.addColorStop(0, '#FFB070'); bg.addColorStop(.55, '#F07C2E'); bg.addColorStop(1, '#B8501A'); g.fillStyle = bg; } g.beginPath(); g.arc(32, 36, 22, Math.PI, 0); g.fill();
    g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(23, 24, 6, 3, -.6, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#5E6A76'; g.lineWidth = 2.4; g.beginPath(); g.arc(32, 12, 4, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#FBF6EE'; g.fillRect(10, 34, 44, 6); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(10, 38.5, 44, 1.5); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.moveTo(8, 42); for (let x = 8; x <= 56; x += 6) g.quadraticCurveTo(x + 3, 39, x + 6, 42); g.lineTo(56, 44); g.lineTo(8, 44); g.closePath(); g.fill(); SPR.buoy = c; }
  { const c = mk(256), g = c.getContext('2d') || noCtx(), r = rnd(23); // a row of riverside buildings in silhouette, windows lit at night via the N variant
      const paintRow = (night) => { const cv = mk(256), q = cv.getContext('2d') || noCtx(), rr2 = rnd(23); let x = 0; while (x < 256) { const w = 40 + rr2() * 60, h = 90 + rr2() * 150; q.fillStyle = night ? '#1C2440' : `rgb(${150 + rr2() * 40 | 0},${160 + rr2() * 36 | 0},${178 + rr2() * 30 | 0})`; q.fillRect(x, 256 - h, w, h);
          const cols = Math.max(1, (w / 9) | 0), rows = Math.max(1, (h / 10) | 0); for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const on = rr2() < (night ? .5 : .9); q.fillStyle = night ? (on ? '#F7D58A' : '#2A3550') : 'rgba(255,255,255,.28)'; if (on || !night) q.fillRect(x + 3 + i * 9, 256 - h + 4 + j * 10, 5, 5); }
          x += w + 2 + rr2() * 6; } return cv; };
      SPR.bldg = paintRow(0); SPR.bldgN = paintRow(1); }
  buildSakuraSprites();
}

/* ================= cherry trees, bare trees =================
   Somei-yoshino: a dark, low trunk that splits into long, nearly level limbs; a wide crown of pale blossom clumps,
   shaded pinker underneath. dir = which way the tree leans (+1 right, -1 left, 0 upright). */
function treeLimbs(g, r, x, y, ang, len, wid, depth, col, tips, droop) {
  const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len + droop * len * .12;
  const cx = (x + x2) / 2 + (r() - .5) * len * .35, cy = (y + y2) / 2 + (r() - .5) * len * .25;
  g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = wid; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(cx, cy, x2, y2); g.stroke();
  tips.push([x2, y2, depth]);
  if (depth <= 0) return;
  const n = 2 + (r() < .45 ? 1 : 0);
  for (let i = 0; i < n; i++) treeLimbs(g, r, x2, y2, ang + (i - (n - 1) / 2) * .62 + (r() - .5) * .45, len * (.6 + r() * .16), Math.max(1, wid * .6), depth - 1, col, tips, droop);
}
function sakuraTree(dir, night, seed) {
  const S = 512, c = mk(S), g = c.getContext('2d') || noCtx(), r = rnd(seed), tips = [];
  const bark = night ? '#1E1512' : '#5B4338', bx = 256 - dir * 92; /* 2026-11-15：花の間からのぞく枝が黒い棒に見えていたので、桜の幹らしいこげ茶に */
  // trunk: short and thick, leaning
  const tx = bx + dir * 46, ty = 330;
  g.fillStyle = bark; g.beginPath(); g.moveTo(bx - 20, S); g.quadraticCurveTo(bx - 16 + dir * 10, 420, tx - 11, ty); g.lineTo(tx + 11, ty); g.quadraticCurveTo(bx + 18 + dir * 14, 420, bx + 22, S); g.fill();
  // bark lenticels: short light horizontal dashes, a cherry tree's signature
  if (!night) { g.strokeStyle = 'rgba(150,130,120,.55)'; g.lineWidth = 1.4; for (let i = 0; i < 26; i++) { const t = r(), yy = S - t * (S - ty), xx = bx + (tx - bx) * t + (r() - .5) * 22; g.beginPath(); g.moveTo(xx - 5, yy); g.lineTo(xx + 5, yy); g.stroke(); } }
  // limbs: wide, mostly level, longest on the leaning side
  const base = -Math.PI / 2;
  const L = [[base + dir * 1.25, 150, 15], [base + dir * .7, 135, 16], [base - dir * .15, 120, 14], [base - dir * .85, 110, 12], [base + dir * 1.55, 120, 10]];
  for (const [a, len, w] of L) treeLimbs(g, r, tx, ty, a + (r() - .5) * .2, len, w, 2, bark, tips, 1);
  // blossom clumps
  const pal = night ? { sh: '#8E6680', md: '#E3BFCB', lt: '#FCE7EE', hi: '#FFFFFF' } : { sh: '#D497AB', md: '#F2C6D3', lt: '#FBE4EB', hi: '#FFF6F9' };
  const clumps = [];
  for (const [x, y, d] of tips) if (d <= 1) clumps.push([x, y, d === 0 ? 34 + r() * 16 : 28 + r() * 12]);
  for (let i = 0; i < 26; i++) { const a = tips[(r() * tips.length) | 0], b = tips[(r() * tips.length) | 0]; const t = r(); clumps.push([a[0] + (b[0] - a[0]) * t, Math.min(a[1], b[1]) + (r() - .3) * 30, 26 + r() * 14]); }
  const dot = (x, y, rr, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill(); };
  for (const c of clumps) { c[2] = Math.min(c[2], 60); c[0] = clamp(c[0], c[2] + 16, S - c[2] - 16); c[1] = clamp(c[1], c[2] + 12, S - 150); } // keep every clump inside the canvas (no straight cut edges)
  for (const [x, y, R] of clumps) for (let i = 0; i < 20; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R; dot(x + Math.cos(a) * d, y + R * .28 + Math.sin(a) * d * .6, 5 + r() * 7, pal.sh); }
  for (const [x, y, R] of clumps) for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R; dot(x + Math.cos(a) * d, y + Math.sin(a) * d * .62, 4 + r() * 7, pal.md); }
  for (const [x, y, R] of clumps) for (let i = 0; i < 16; i++) { const a = -Math.PI * (.1 + r() * .8), d = Math.sqrt(r()) * R * .85; dot(x + Math.cos(a) * d, y - R * .12 + Math.sin(a) * d * .55, 3 + r() * 5, pal.lt); }
  for (const [x, y, R] of clumps) for (let i = 0; i < 7; i++) { const a = -Math.PI * (.15 + r() * .7), d = r() * R * .7; dot(x + Math.cos(a) * d, y - R * .2 + Math.sin(a) * d * .5, 1.6 + r() * 2, pal.hi); }
  // a few dark twigs showing through the blossoms
  g.globalAlpha = .7; for (const [x, y, d] of tips) if (d === 0 && r() < .5) { g.strokeStyle = bark; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 30, y - 8 - r() * 14); g.stroke(); } g.globalAlpha = 1;
  if (night) { // lit from below by paper lanterns
    g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, 120, 0, 380); gr.addColorStop(0, 'rgba(40,30,70,.25)'); gr.addColorStop(1, 'rgba(255,190,140,.38)'); g.fillStyle = gr; g.fillRect(0, 0, S, S); g.globalCompositeOperation = 'source-over'; }
  return c;
}
function bareTree(seed, cone) {
  const S = 256, c = mk(S), g = c.getContext('2d') || noCtx(), r = rnd(seed), tips = [];
  if (cone) { g.strokeStyle = '#5E4C42'; g.lineWidth = 4; g.beginPath(); g.moveTo(128, 250); g.lineTo(128, 14); g.stroke();
    for (let y = 30; y < 240; y += 9) { const w = (y - 14) / 236 * 100; for (const sd of [-1, 1]) treeLimbs(g, r, 128, y, (sd < 0 ? Math.PI : 0) - sd * (.5 + r() * .3), w * (.6 + r() * .4), 2, 1, '#6B5A50', tips, 0); } return c; }
  for (const a of [-1.9, -1.55, -1.2, -2.3, -.85]) treeLimbs(g, r, 128, 250, a + (r() - .5) * .2, 70 + r() * 20, 7, 3, '#5A4A42', tips, 0);
  return c;
}
function buildSakuraSprites() {
  for (const d of [-1, 1]) for (const v of [0, 1]) { SPR[`sakura${d < 0 ? 'L' : 'R'}${v}`] = sakuraTree(d, 0, 17 + v * 31 + (d + 1) * 7); SPR[`sakura${d < 0 ? 'L' : 'R'}${v}N`] = sakuraTree(d, 1, 17 + v * 31 + (d + 1) * 7); }
  SPR.sakuraU = sakuraTree(0, 0, 88); SPR.sakuraUN = sakuraTree(0, 1, 88);
  SPR.canopy_sakura = SPR.sakuraU; SPR.canopy_bare = bareTree(5); SPR.canopy_coneB = bareTree(9, 1);
  { const c = mk(256), g = c.getContext('2d') || noCtx(), r = rnd(9); for (let i = 0; i < 170; i++) { const v = r(), wv = (1 - v) * 92 + 6; g.beginPath(); g.fillStyle = TREE.fresh[(r() * 3) | 0]; g.arc(128 + (r() * 2 - 1) * wv * .8, 20 + v * 210, 10 + r() * 10, 0, Math.PI * 2); g.fill(); } SPR.canopy_coneG = c; }
}
// sprites take the scene's light: a darkened copy per light level, made once and kept
const LIT_CACHE = new WeakMap(); // weak: when a building texture is dropped, its lit copies go with it
// all shaded copies together stay under a pixel budget (phones run out of canvas memory at dusk, when every picture gets re-shaded)
const LIT_PHONE = navigator.maxTouchPoints >= 1 && Math.min(screen.width, screen.height) < 820, LIT_MAXDIM = LIT_PHONE ? 320 : 4096; const LIT_LIST = []; let LIT_PX = 0; const LIT_MAXPX = LIT_PHONE ? 7e6 : 16e6;
function litEvict() { while (LIT_LIST.length && LIT_PX > LIT_MAXPX) { const e = LIT_LIST.shift(); LIT_PX -= e.px; const m = LIT_CACHE.get(e.img); if (m) { if (m[e.k] === e.c) delete m[e.k]; if (m.last === e.c) m.last = null; } try { e.c.width = e.c.height = 0; } catch (x) { } } }
function litSprite(img, amb, force, full) {
  if (!img || !img.width) return img; // a picture already freed: nothing to shade
  const st = full ? 16 : 4, q = amb.map(x => Math.round(Math.min(1, x) * st) / st); if (q[0] >= 1 && q[1] >= 1 && q[2] >= .95) return img; // coarse steps: few shades per picture. The runners (full) take fine steps: with 1/4 steps a mild evening light [.90,.87,.87] rounded to [1,.75,.75] and the bunnies turned red at 18:00 (2026-11-15)
  let m = LIT_CACHE.get(img); if (!m) { m = {}; LIT_CACHE.set(img, m); }
  const k = q.join(','); if (m[k]) return m[k];
  if (!force && !texOK() && m.last) return m.last; TEXN++; // over this frame's budget: the previous shade for one more frame
  const ks = full ? 1 : Math.min(1, LIT_MAXDIM / Math.max(img.width, img.height)); // phones keep shaded copies at a reduced size: many more fit in memory, and they are drawn small anyway
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.width * ks)); c.height = Math.max(1, Math.round(img.height * ks)); const g = c.getContext('2d'); if (!g) { noCtx(); return img; } // out of picture memory: the unshaded picture (never a throw, never a blank kept)
  g.drawImage(img, 0, 0, c.width, c.height); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgb(${q.map(x => (x * 255) | 0).join(',')})`; g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(img, 0, 0, c.width, c.height);
  for (const kk of Object.keys(m)) if (kk !== 'last' && kk !== k) { const o = m[kk]; delete m[kk]; const i = LIT_LIST.findIndex(e => e.c === o); if (i >= 0) { LIT_PX -= LIT_LIST[i].px; LIT_LIST.splice(i, 1); } try { o.width = o.height = 0; } catch (x) { } } // one shade per picture: the light only moves one way through the day
  const px = c.width * c.height; LIT_LIST.push({ img, k, c, px }); LIT_PX += px; litEvict();
  m[k] = m.last = c; return c;
}
const STAMP_CACHE = {};
function stampSprite(tid, big) {
  const key = tid + (big ? 'B' : '') + LANG; if (STAMP_CACHE[key]) return STAMP_CACHE[key];
  const th = THEMES[tid], st = th && th.stamp; const sz = big ? 256 : 128, c = mk(sz), g = c.getContext('2d') || noCtx(), s = sz / 128;
  g.scale(s, s); g.fillStyle = '#FBF6EE'; g.beginPath(); g.arc(64, 64, 58, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#C8463C'; g.lineWidth = 6; g.beginPath(); g.arc(64, 64, 52, 0, Math.PI * 2); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(64, 64, 44, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#C8463C'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${st && st.k.length > 2 ? 30 : 38}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; g.fillText(st ? st.k : '?', 64, 60);
  g.font = '900 11px sans-serif'; g.fillText(LANG === 'ja' || !st || !st.en ? 'TOKYO' : st.en.toUpperCase(), 64, 92, 74);
  STAMP_CACHE[key] = c; return c;
}

/* 2026-11-17 ホーム画面の第 2 段（オーナー「まだごわごわしてる」）：座布団は、横にのびた棒の絵に見えていた。本物（55×59cm・厚さ 10cm）の大きさの箱を 2 枚重ね、上の面に絵をのせる。
   [69] 本当の大きさと厚み [70] まん中のふくらみ（光とかげ） [71] まん中の糸のとじ（三方とじの房） [72] 4 すみの房 [73] 地紋（青海波） [74] ふちの縫い目 [75] 布の細かい織り目 */
function zabuTopTex(c) { return artCanvas('zabuTop|' + c, 240, 240, (g, W, H) => { g.__keep = 1;
  const gr = g.createRadialGradient(W * .42, H * .4, 8, W * .5, H * .5, W * .62); gr.addColorStop(0, shadeHex(c, 1.25)); gr.addColorStop(.55, c); gr.addColorStop(1, shadeHex(c, .72)); g.fillStyle = gr; g.fillRect(0, 0, W, H); // [70]
  g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1.2; for (let y = 18; y < H; y += 22) for (let x = (y / 22 % 2) * 11; x < W; x += 22) { g.beginPath(); g.arc(x, y, 10, Math.PI, 0); g.stroke(); g.beginPath(); g.arc(x, y, 6, Math.PI, 0); g.stroke(); } // [73] 青海波
  g.fillStyle = 'rgba(0,0,0,.05)'; for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, .6); for (let x = 0; x < W; x += 2) g.fillRect(x, 0, .6, H); // [75]
  g.setLineDash([5, 4]); g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1.5; g.strokeRect(9, 9, W - 18, H - 18); g.setLineDash([]); // [74]
  g.fillStyle = shadeHex(c, .55); g.beginPath(); g.arc(W / 2, H / 2, 6, 0, 7); g.fill(); g.strokeStyle = shadeHex(c, .45); g.lineWidth = 2.5; for (const a of [0, 2.1, 4.2]) { g.beginPath(); g.moveTo(W / 2, H / 2); g.lineTo(W / 2 + Math.cos(a) * 13, H / 2 + Math.sin(a) * 13); g.stroke(); } // [71]
  g.fillStyle = shadeHex(c, .8); for (const [x, y] of [[4, 4], [W - 4, 4], [4, H - 4], [W - 4, H - 4]]) { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); } // [72]
  const e = 18; for (const [x, y, w, h, x0, y0, x1, y1] of [[0, 0, W, e, 0, 0, 0, e], [0, H - e, W, e, 0, H, 0, H - e], [0, 0, e, H, 0, 0, e, 0], [W - e, 0, e, H, W, 0, W - e, 0]]) { const sg = g.createLinearGradient(x0, y0, x1, y1); sg.addColorStop(0, 'rgba(0,0,0,.28)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sg; g.fillRect(x, y, w, h); } }); } // ふちの丸み
/* 2026-11-17 ホーム画面の第 2 段：敷きぶとんの上の面 [93] シーツのやわらかいしわ（光とかげの曲線） [94] 掛けぶとんの細かい麻の葉もよう [95] 木綿の細かい織り目 [96] 人が寝ていたくぼみ（まくらの下の、うすいかげ） */
function futonTopTex3() { return artCanvas('futonTop3', 700, 500, (g, W, H) => { g.__keep = 1; g.drawImage(futonTopTex2(), 0, 0, W, H); const r = rnd(5);
  for (let k = 0; k < 7; k++) { const x = W * (.1 + r() * .8), y = H * (.45 + r() * .5), l = 60 + r() * 120, a = r() * .6 - .3; g.save(); g.translate(x, y); g.rotate(a); const gr = g.createLinearGradient(0, -6, 0, 6); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.45, 'rgba(255,255,255,.35)'); gr.addColorStop(.55, 'rgba(120,100,70,.18)'); gr.addColorStop(1, 'rgba(120,100,70,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, l, 6, 0, 0, 7); g.fill(); g.restore(); } // [93]
  g.save(); g.beginPath(); g.rect(0, 0, W, H * .36); g.clip(); g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; for (let y = 0; y < H * .36; y += 18) for (let x = (y / 18 % 2) * 15; x < W; x += 30) { g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); } g.stroke(); } g.restore(); // [94]
  g.fillStyle = 'rgba(0,0,0,.035)'; for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, .7); for (let x = 0; x < W; x += 2) g.fillRect(x, 0, .7, H); // [95]
  const dg = g.createRadialGradient(W * .5, H * .62, 10, W * .5, H * .62, W * .3); dg.addColorStop(0, 'rgba(110,90,60,.12)'); dg.addColorStop(1, 'rgba(110,90,60,0)'); g.fillStyle = dg; g.fillRect(0, 0, W, H); }); } // [96]
