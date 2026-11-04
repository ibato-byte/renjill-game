/* ================= surface patterns ================= */
/* street details laid on the ground: manholes, crosswalks, painted words, lane arrows, drain grates, odd slabs */
function decalDraw(p, d) {
  if (d > 60) return; const a = clamp(1 - d / 60, 0, 1) * (LT.night > .5 ? .8 : 1), T = c => tint(c);
  ctx.globalAlpha = a;
  switch (p.dec) {
    case 'futonD': quadImage(futonTopTex(), 14, 10); break; // the boss's futon, still unmade (a soft painted picture laid on the floor in perspective)
    case 'manhole': { const c = bil(.5, .5), ex = bil(1, .5), ey = bil(.5, 1), rx = Math.hypot(ex[0] - c[0], ex[1] - c[1]), ry = Math.abs(ey[1] - c[1]) + Math.abs(ey[0] - c[0]) * .05;
      ctx.beginPath(); ctx.ellipse(c[0], c[1], Math.max(1, rx), Math.max(1, Math.max(rx * .18, ry)), Math.atan2(ex[1] - c[1], ex[0] - c[0]), 0, Math.PI * 2); ctx.fillStyle = T('#4E4C48'); ctx.fill(); ctx.strokeStyle = T('#2E2C2A'); ctx.lineWidth = Math.max(.8, 18 / d); ctx.stroke();
      if (d < 22) { ctx.globalAlpha = a * .5; ctx.beginPath(); for (let k = 1; k < 4; k++) bline(.5 - k * .1, .2, .5 - k * .1, .8), bline(.5 + k * .1, .2, .5 + k * .1, .8); ctx.strokeStyle = T('#6E6A64'); ctx.lineWidth = Math.max(.6, 10 / d); ctx.stroke(); } break; }
    case 'zebra': for (let v = .06; v < .94; v += .16) bquad(.0, v, 1, v + .09, T('#EEEDE8')); break;
    case 'stop': bquad(.05, .2, .95, .8, 'rgba(0,0,0,0)'); if (d < 40) qtext(tr('とまれ', 'STOP'), .1, .15, .9, .85, T('#F2F1EC')); break;
    case 'arrow': { const P = [[.2, .4], [.6, .4], [.6, .25], [.95, .5], [.6, .75], [.6, .6], [.2, .6]]; ctx.beginPath(); P.forEach(([u, v], i) => { const q = bil(u, v); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fillStyle = T('#EEEDE8'); ctx.fill(); break; }
    case 'grate': bquad(0, 0, 1, 1, T('#3E3C39')); if (d < 25) { ctx.beginPath(); for (let k = 1; k < 8; k++) bline(k / 8, .1, k / 8, .9); ctx.strokeStyle = T('#26241F'); ctx.lineWidth = Math.max(.6, 12 / d); ctx.stroke(); } break;
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
function floorPattern(p, d) {
  if (p.dec) return decalDraw(p, d);
  if (d > 70 && p.pat !== 'sea' && p.pat !== 'water') return;
  const a = clamp(1 - d / 70, 0, 1);
  ctx.globalAlpha = a * .4; ctx.lineWidth = Math.max(.5, 19 / Math.max(d, 4)); ctx.beginPath();
  const T = (c) => tint(c);
  switch (p.pat) {
    case 'tatami': ctx.strokeStyle = T('#6E6A3A'); bline(0, 0, 0, 1); bline(0, .5, 1, .5); bline(.5, p.ti % 2 ? 0 : .5, .5, p.ti % 2 ? .5 : 1); bline(0, .02, 1, .02); bline(0, .98, 1, .98); break;
    case 'boards': ctx.strokeStyle = T('#6B4631'); for (let k = 1; k < 8; k++) bline(0, k / 8, 1, k / 8); { const v = (p.ti * 3 % 8) / 8; bline(.5, v, .5, v + 1 / 8); } break;
    case 'rug': ctx.globalAlpha = a * .7; ctx.strokeStyle = T('#F2C230'); bline(0, .15, 1, .15); bline(0, .85, 1, .85); ctx.stroke(); ctx.beginPath(); ctx.strokeStyle = T('#7A2E24'); bline(0, .5, 1, .5); break;
    case 'grid': ctx.globalAlpha = a * .3; ctx.strokeStyle = T('#8F8676'); for (let k = 0; k <= 4; k++) bline(0, k / 4, 1, k / 4); bline(0, 0, 0, 1); bline(.5, 0, .5, 1); break;
    case 'carpet': ctx.globalAlpha = a * .28; ctx.strokeStyle = T('#4E5B68'); for (let k = 0; k <= 4; k++) bline(0, k / 4, 1, k / 4); bline(0, 0, 0, 1); break;
    case 'stone': case 'plaza': ctx.globalAlpha = a * .22; ctx.strokeStyle = T('#55534D'); for (let k = 0; k <= 4; k++) bline(0, k / 4, 1, k / 4); bline(0, 0, 0, 1); bline(.5, (p.ti % 2) * .25, .5, (p.ti % 2) * .25 + .25); break;
    case 'gravel': ctx.fillStyle = T('#A8966F'); for (let k = 0; k < 8; k++) bquad((k * .37 + p.ti * .11) % .9, (k * .61) % .9, (k * .37 + p.ti * .11) % .9 + .04, (k * .61) % .9 + .05, T('#A8966F')); break;
    case 'leaves': for (let k = 0; k < 9; k++) bquad((k * .29 + p.ti * .17) % .92, (k * .53) % .9, (k * .29 + p.ti * .17) % .92 + .06, (k * .53) % .9 + .08, k % 2 ? T('#F2CD45') : T('#C9961B')); break;
    case 'road': case 'hokoten': ctx.globalAlpha = Math.min(1, a * 1.5) * .8; ctx.strokeStyle = T('#ECEBE4'); ctx.lineWidth *= 1.25; if (p.ti % 3 !== 2) { bline(0, .355, 1, .355); bline(0, .645, 1, .645); } ctx.stroke(); ctx.beginPath(); ctx.strokeStyle = T('#E4E3DC'); ctx.lineWidth *= 1.2; bline(0, .03, 1, .03); bline(0, .97, 1, .97);
 break;
    case 'scramble': ctx.globalAlpha = Math.min(1, a * 1.6); { const ph = p.ti % 12; if (ph < 7) for (let v = .05; v < .95; v += .125) bquad(0, v, 1, v + .07, T('#ECECE6')); else if (ph === 8) { ctx.globalAlpha = a * .6; ctx.strokeStyle = T('#ECECE6'); ctx.lineWidth *= 2; bline(0, 0, 1, 1); bline(0, 1, 1, 0); } } break;
    case 'petals': case 'petalstone': if (p.pat === 'petalstone') { ctx.strokeStyle = T('#8F8577'); for (let k = 0; k <= 4; k++) bline(0, k / 4, 1, k / 4); bline(.5, (p.ti % 2) * .25, .5, (p.ti % 2) * .25 + .25); ctx.stroke(); ctx.beginPath(); }
      ctx.globalAlpha = Math.min(1, a * 1.6); for (let k = 0; k < 14; k++) { const u = (k * .37 + p.ti * .19) % .95, v = (k * .61 + p.ti * .07) % .95; bquad(u, v, u + .035, v + .045, k % 3 ? T('#F7D3DE') : T('#FBE9EF')); } break;
    case 'lawn': ctx.globalAlpha = a * .5; bquad(0, 0, 1, .5, T('#8DB26A')); break;
    case 'sand': ctx.globalAlpha = a * .45; for (let k = 0; k < 7; k++) bquad((k * .41 + p.ti * .13) % .9, (k * .67) % .9, (k * .41 + p.ti * .13) % .9 + .05, (k * .67) % .9 + .03, T('#C9B48A')); break;
    case 'brickroad': ctx.strokeStyle = T('#8A7558'); for (let k = 0; k <= 6; k++) bline(0, k / 6, 1, k / 6); for (let k = 0; k < 3; k++) bline(k / 3 + (p.ti % 2) * .16, 0, k / 3 + (p.ti % 2) * .16, 1); break;
    case 'walk': ctx.globalAlpha = a * .25; ctx.strokeStyle = T('#8E887C'); bline(0, 0, 0, 1); bline(.5, 0, .5, 1); bline(0, .5, 1, .5); ctx.stroke(); ctx.globalAlpha = a * .95; { const v0 = p.sd < 0 ? .52 : .33; bquad(0, v0, 1, v0 + .15, T('#E8C23A')); } break;
    case 'platform': ctx.globalAlpha = a * .95; bquad(0, .02, 1, .1, T('#FBF6EE')); bquad(0, .16, 1, .27, T('#E8C23A')); ctx.strokeStyle = T('#8F8676'); ctx.beginPath(); bline(0, .6, 1, .6); break;
    case 'train': ctx.strokeStyle = T('#5E6A76'); bline(0, .5, 1, .5); bline(0, 0, 0, 1); ctx.stroke(); ctx.beginPath(); ctx.strokeStyle = T('#E8C23A'); bline(0, .06, 1, .06); bline(0, .94, 1, .94); break;
    case 'planks': ctx.strokeStyle = T('#B9B2A5'); for (let k = 1; k < 7; k++) bline(0, k / 7, 1, k / 7); bline(.5, 0, .5, 1); break;
    case 'stairs': ctx.globalAlpha = Math.min(1, a * 1.4); ctx.strokeStyle = T('#4F555B'); for (let k = 0; k < 6; k++) bline(k / 6, 0, k / 6, 1); ctx.stroke(); ctx.beginPath(); ctx.strokeStyle = T('#F2C230'); bline(0, .02, 1, .02); bline(0, .98, 1, .98); break;
    case 'water': case 'sea': { ctx.globalAlpha = .5; ctx.strokeStyle = LT.night > .5 ? 'rgba(255,220,160,.5)' : 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.4; const o = (G.t * .15) % .25;
      for (let k = 0; k < 4; k++) { const v = (k * .25 + o) % 1; bline(.1 + (k % 2) * .3, v, .35 + (k % 2) * .3, v + .02); } } break;
  }
  ctx.stroke(); ctx.globalAlpha = 1;
}
function rnd(seed) { let s = Math.abs(seed | 0) % 2147483646 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function wallPattern(w, d) {
  if (d > 95) return;
  const pat = w.pat, N = LT.night;
  if (pat === 'fac') return w.fv != null && d < 75 ? drawFacadeTex(w, d) : facade(w, d); // far fronts still get their windows, just painted simply
  if (pat === 'roof') { ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 6; k++) bline(0, k / 6, 1, k / 6); ctx.stroke(); return; }
  if (d > 60) return;
  if (pat === 'blocks') { ctx.globalAlpha = .35; ctx.strokeStyle = tint('#7A7468'); ctx.lineWidth = Math.max(.6, 24 / d); ctx.beginPath(); for (let k = 1; k < 4; k++) bline(0, k / 4, 1, k / 4); for (let k = 0; k < 5; k++) bline(k / 5 + ((k % 2) * .1), 0, k / 5 + ((k % 2) * .1), 1); ctx.stroke(); ctx.globalAlpha = 1; return; }
  if (pat === 'ishigaki') { ctx.globalAlpha = .45; ctx.strokeStyle = tint('#6E685C'); ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 6; k++) bline(0, k / 6, 1, k / 6 + .03); for (let k = 0; k < 8; k++) bline(k / 8 + ((k * 3) % 2) * .05, (k % 6) / 6, k / 8 + ((k * 3) % 2) * .05, (k % 6 + 1) / 6); ctx.stroke(); ctx.globalAlpha = 1; return; }
  if (pat === 'stonewall') { ctx.globalAlpha = .4; ctx.strokeStyle = tint('#5C574C'); ctx.lineWidth = 1; ctx.beginPath(); bline(0, .5, 1, .5); for (let k = 0; k < 4; k++) bline(k / 4 + .1, 0, k / 4 + .1, .5); ctx.stroke(); ctx.globalAlpha = 1; return; }
  if (pat === 'bricks') { ctx.globalAlpha = .35; ctx.strokeStyle = tint('#E9D9BF'); ctx.lineWidth = Math.max(.5, 18 / d); ctx.beginPath(); for (let k = 1; k < 12; k++) bline(0, k / 12, 1, k / 12); ctx.stroke(); ctx.globalAlpha = 1;
    bpath(.1, 0, .9, .78); ctx.fillStyle = N > .3 || w.c ? tint('#3A2016') : '#3A2016'; ctx.fill(); return; }
  if (pat === 'trainside') { bquad(0, .1, 1, .2, tint(LC)); for (let k = 0; k < 2; k++) bquad(.08 + k * .5, .35, .42 + k * .5, .8, LT.night > .4 ? '#F7E7B8' : tint('#46525E')); bquad(0, .85, 1, .9, tint('#80C241')); return; }
  if (pat === 'ceil') return ceiling(w, d);
}
function ceiling(w, d) {
  const cp = w.cp, li = w.light;
  ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1; ctx.beginPath();
  if (cp === 'wood') { for (let k = 1; k < 8; k++) bline(0, k / 8, 1, k / 8); bline(0, 0, 1, 0); }
  else if (cp === 'grid') { for (let k = 1; k < 4; k++) bline(0, k / 4, 1, k / 4); bline(0, 0, 1, 0); bline(.5, 0, .5, 1); }
  else if (cp === 'beams' || cp === 'girder') { ctx.stroke(); bquad(0, 0, .12, 1, cp === 'girder' ? tint('#2B2B30') : tint('#7D8791')); if (cp === 'girder') { ctx.strokeStyle = tint('#55555C'); ctx.beginPath(); bline(0, 0, 1, 1); bline(0, 1, 1, 0); } }
  ctx.stroke();
  const on = `rgba(255,253,240,${(.95 * clamp((d - 1.2) / 3, 0, 1)).toFixed(2)})`; // fixtures right overhead fade out instead of slicing the top of the screen
  if (li === 'panel' && w.ti % 2 === 0) { bquad(.2, .18, .8, .32, on); bquad(.2, .68, .8, .82, on); }
  else if (li === 'strip') { bquad(.1, .3, .9, .36, on); bquad(.1, .64, .9, .7, on); }
  else if (li === 'round' && w.ti % 3 === 1) { const c = bil(.5, .5), r = Math.abs(bil(.62, .5)[0] - c[0]) + Math.abs(bil(.5, .62)[1] - c[1]); ctx.beginPath(); ctx.ellipse(c[0], c[1], Math.max(2, r), Math.max(1, r * .35), 0, 0, Math.PI * 2); ctx.fillStyle = on; ctx.fill(); }
  else if (li === 'bulb') { for (let k = 0; k < 3; k++) { const c = bil(.5, .2 + k * .3); ctx.beginPath(); ctx.arc(c[0], c[1], Math.max(1.5, 90 / d), 0, Math.PI * 2); ctx.fillStyle = '#FFD27A'; ctx.fill(); } }
}
function glassFrame(w) { ctx.strokeStyle = 'rgba(240,245,250,.75)'; ctx.lineWidth = 2; ctx.beginPath(); bline(0, 0, 1, 0); bline(0, 1, 1, 1); bline(0, 0, 0, 1); if (!w.ceil) bline(0, .05, 1, .05); ctx.stroke(); }
// building fronts; w.st = style
function facade(w, d) {
  const r = rnd(w.seed * 7 + 13), rp = a => a[(r() * a.length) | 0], N = LT.night, h = w.h, st = w.st;
  const fl = 3.2; const floors = Math.floor(h / fl);
  const win = (u0, v0, u1, v1, kind) => { const on = N > .35 && r() < .62; bquad(u0, v0, u1, v1, on ? (r() < .3 ? '#FFE8B0' : '#F7D58A') : kind === 'glass' ? tint('#7FA0BC') : tint('#9EB8CC')); };
  if (w.side) { if (N > .35) for (let k = 1; k < floors; k++) if (r() < .5) bquad(.3, k / floors + .02, .7, k / floors + .1, '#F7D58A'); return; }
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
  tansuW(e) { // a paulownia chest: frame, four rows of drawers (the top row split), iron handles; all in the wall's own perspective
    bquad(0, 0, 1, 1, tint('#7A4E2E')); bquad(.03, .03, .97, .97, tint('#8E5E38'));
    const rows = [[.05, .27], [.29, .5], [.52, .73], [.75, .96]];
    rows.forEach(([v0, v1], r) => { const cols = r === 3 ? [[.05, .48], [.52, .95]] : [[.05, .95]];
      for (const [u0, u1] of cols) { bquad(u0, 1 - v1, u1, 1 - v0, tint('#A06C42')); bquad(u0, 1 - v1, u1, 1 - v1 + .02, tint('#B98450'));
        const um = (u0 + u1) / 2, vm = 1 - (v0 + v1) / 2; ctx.strokeStyle = tint('#2E2420'); ctx.lineWidth = 2.2; ctx.beginPath(); bline(um - .09, vm - .02, um - .06, vm + .04); bline(um - .06, vm + .04, um + .06, vm + .04); bline(um + .06, vm + .04, um + .09, vm - .02); ctx.stroke();
        bquad(um - .015, vm - .035, um + .015, vm - .01, tint('#2E2420')); } });
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); for (const [v0, v1] of rows) { bline(.04, 1 - v1, .96, 1 - v1); } ctx.stroke(); bquad(0, 0, 1, .02, tint('#5E3A22')); },
  hanger(e) { // a suit jacket and a tie on a wall hook, ready for the day
    ctx.strokeStyle = tint('#4A3220'); ctx.lineWidth = 2; ctx.beginPath(); bline(.42, .02, .5, 0); bline(.5, 0, .58, .02); ctx.stroke(); // the hook
    ctx.strokeStyle = tint('#5A4A3A'); ctx.lineWidth = 2.5; ctx.beginPath(); bline(.2, .14, .5, .05); bline(.5, .05, .8, .14); ctx.stroke(); // the hanger
    bpath(.12, .14, .88, .95); ctx.fillStyle = tint('#3E4A5E'); ctx.fill(); bpath(.4, .14, .6, .55); ctx.fillStyle = tint('#F7F4EE'); ctx.fill(); // the jacket and shirt
    bpath(.47, .2, .53, .62); ctx.fillStyle = tint('#C9962F'); ctx.fill(); bpath(.12, .14, .4, .6); ctx.fillStyle = tint('#33404F'); ctx.fill(); bpath(.6, .14, .88, .6); ctx.fillStyle = tint('#33404F'); ctx.fill(); // the tie and lapels
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1; ctx.beginPath(); bline(.3, .3, .3, .9); bline(.7, .3, .7, .9); ctx.stroke(); },
  shoji(e) { bquad(0, 0, 1, 1, tint('#F7F3EA')); ctx.strokeStyle = tint('#8A6A48'); ctx.lineWidth = 1.4; ctx.beginPath(); for (let k = 0; k <= 4; k++) bline(k / 4, 0, k / 4, 1); for (let k = 0; k <= 6; k++) bline(0, k / 6, 1, k / 6); ctx.stroke(); },
  fusuma(e) { bquad(0, 0, 1, 1, tint('#E9DDC1')); ctx.strokeStyle = tint('#6B4631'); ctx.lineWidth = 2; ctx.beginPath(); bline(0, 0, 0, 1); bline(.5, 0, .5, 1); bline(1, 0, 1, 1); bline(0, 1, 1, 1); ctx.stroke(); bquad(.38, .45, .44, .52, tint('#6B4631')); bquad(.56, .45, .62, .52, tint('#6B4631')); bquad(.05, .12, .45, .4, tint('#B9CBB0')); bquad(.55, .6, .95, .85, tint('#B9CBB0')); },
  tokonoma(e) { bquad(0, 0, 1, 1, tint('#D8C7A6')); bquad(.35, .25, .65, .95, tint('#F3EEE6')); bquad(.35, .93, .65, .97, tint('#6B4631')); ctx.strokeStyle = tint('#3B2A20'); ctx.lineWidth = 2; ctx.beginPath(); bline(.5, .4, .5, .8); bline(.44, .6, .56, .55); ctx.stroke(); bquad(.08, 0, .28, .12, tint('#8A5530')); },
  window(e) { bquad(0, 0, 1, 1, tint('#FBF6EE')); sceneView(e, .06, .08, .94, .92, 'garden'); ctx.strokeStyle = tint('#FBF6EE'); ctx.lineWidth = 3; ctx.beginPath(); bline(.5, .08, .5, .92); ctx.stroke(); },
  citywin(e) { bquad(0, 0, 1, 1, tint('#C9D4DE')); sceneView(e, .03, .05, .97, .95, 'city'); ctx.strokeStyle = tint('#C9D4DE'); ctx.lineWidth = 3; ctx.beginPath(); bline(.33, .05, .33, .95); bline(.66, .05, .66, .95); ctx.stroke(); },
  calendar(e) { bquad(0, 0, 1, 1, tint('#FFFFFF')); bquad(0, .82, 1, 1, tint('#C8463C')); ctx.strokeStyle = tint('#B9B2A5'); ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 7; k++) bline(k / 7, 0, k / 7, .8); for (let k = 1; k < 5; k++) bline(0, k / 5 * .8, 1, k / 5 * .8); ctx.stroke();
    const c = bil(.64, .3); ctx.beginPath(); ctx.strokeStyle = '#C8463C'; ctx.lineWidth = 2.4; ctx.ellipse(c[0], c[1], Math.abs(bil(.72, .3)[0] - c[0]) + 1, Math.abs(bil(.64, .42)[1] - c[1]) + 1, 0, 0, Math.PI * 2); ctx.stroke(); },
  frame(e) { bquad(0, 0, 1, 1, tint('#C9962F')); bquad(.1, .1, .9, .9, tint('#E3F0F6')); bquad(.1, .1, .9, .45, tint('#8FC07A')); bquad(.55, .5, .75, .7, tint('#F2C230')); },
  seatwin(e) { bquad(0, .35, 1, .95, tint('#C9CDD2')); for (const u of [0, .5]) { bpath(u + .04, .42, u + .46, .9); ctx.save(); ctx.clip();
      if (e.seg && e.seg.th.tunnel) { bquad(u + .04, .42, u + .46, .9, '#1A1D24'); const o2 = (G.t * 1.6) % 1; bquad(u + .04 + o2 * .42 - .04, .62, u + .04 + o2 * .42, .66, '#FFE3A0'); }
      else sceneView(e, u + .04, .42, u + .46, .9, e.seg && e.seg.th.winView || 'city');
      const off = (G.t * .5) % 1; for (let k = 0; k < 4; k++) bquad(u + .04 + ((k * .3 + off) % 1) * .42 - .05, .42, u + .04 + ((k * .3 + off) % 1) * .42, .7, LT.night > .4 ? '#2A3550' : tint('#7D8B97')); ctx.restore(); }
    bquad(0, .92, 1, .97, tint(LC)); },
  door(e) { bquad(0, 0, 1, 1, tint('#B9C0C7')); bquad(.12, .48, .44, .88, LT.night > .4 ? '#2A3550' : tint('#BFE3F5')); bquad(.56, .48, .88, .88, LT.night > .4 ? '#2A3550' : tint('#BFE3F5')); ctx.strokeStyle = tint('#46525E'); ctx.lineWidth = 2; ctx.beginPath(); bline(.5, 0, .5, 1); ctx.stroke(); bquad(0, 0, 1, .04, tint('#F2C230')); },
  trainmap(e) { bquad(0, 0, 1, 1, tint('#FBF6EE')); const c = bil(.5, .5), rx = Math.abs(bil(.85, .5)[0] - c[0]), ry = Math.abs(bil(.5, .85)[1] - c[1]);
    ctx.beginPath(); ctx.strokeStyle = LC; ctx.lineWidth = Math.max(1.5, rx * .12); ctx.ellipse(c[0], c[1], rx + .1, ry + .1, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = tint('#3B2A20'); for (let k = 0; k < 15; k++) { const a = k / 15 * Math.PI * 2; ctx.fillRect(c[0] + Math.cos(a) * rx - 1.5, c[1] + Math.sin(a) * ry - 1.5, 3, 3); } },
  stationsign(e) { const st = (e.seg && e.seg.stName) || '上野'; bquad(0, 0, 1, 1, tint('#FBF6EE')); bquad(0, .0, 1, .18, tint(LC)); qtext(st, .2, .45, .8, .9, '#2B2B2B'); },
  poster(e) { bquad(0, 0, 1, 1, tint('#FBF6EE')); bquad(.1, .45, .9, .9, tint(['#F2C230', '#4E77A0', '#5F9E5A', '#E86A75'][e.v2 || 0])); bquad(.1, .18, .7, .28, tint('#3B2A20')); bquad(.1, .32, .55, .38, tint('#9AA9B6')); },
  timetable(e) { bquad(0, 0, 1, 1, '#1C1919'); for (let k = 0; k < 4; k++) { bquad(.05, .1 + k * .22, .45, .24 + k * .22, '#F2C230'); bquad(.55, .1 + k * .22, .95, .24 + k * .22, k % 2 ? '#7FD06A' : '#FBF6EE'); } },
  plantwall(e) { bquad(0, 0, 1, 1, tint('#4F8A4A')); for (let k = 0; k < 9; k++) bquad((k * .37) % .9, (k * .23) % .85, (k * .37) % .9 + .12, (k * .23) % .85 + .14, tint('#7DB46A')); },
  whiteboard(e) { bquad(0, 0, 1, 1, tint('#9AA9B6')); bquad(.03, .05, .97, .95, tint('#FFFFFF')); ctx.strokeStyle = '#4E77A0'; ctx.lineWidth = 2; ctx.beginPath(); bline(.1, .7, .3, .75); bline(.1, .55, .45, .58); bline(.55, .2, .65, .45); bline(.65, .45, .75, .35); bline(.75, .35, .88, .75); ctx.stroke(); },
  screen(e) { bquad(0, 0, 1, 1, tint('#FFFFFF')); [.3, .5, .42, .75].forEach((h, k) => bquad(.15 + k * .18, .12, .27 + k * .18, .12 + h * .7, k === 3 ? '#C8463C' : '#4E77A0')); },
  clock(e) { const c = bil(.5, .5), r = Math.max(2, Math.abs(bil(1, .5)[0] - c[0]) * .9);
    ctx.beginPath(); ctx.fillStyle = tint('#FBF6EE'); ctx.strokeStyle = tint('#3B2A20'); ctx.lineWidth = Math.max(1, r * .12); ctx.arc(c[0], c[1], r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const m = G.clock % 60, h = (G.clock / 60) % 12; ctx.beginPath(); ctx.lineWidth = Math.max(1, r * .1);
    ctx.moveTo(c[0], c[1]); ctx.lineTo(c[0] + Math.sin(h / 12 * Math.PI * 2) * r * .5, c[1] - Math.cos(h / 12 * Math.PI * 2) * r * .5);
    ctx.moveTo(c[0], c[1]); ctx.lineTo(c[0] + Math.sin(m / 60 * Math.PI * 2) * r * .8, c[1] - Math.cos(m / 60 * Math.PI * 2) * r * .8); ctx.stroke(); },
  izakaya(e) { bquad(0, 0, 1, 1, '#2B1A12'); bquad(.08, .05, .92, .7, '#FFCF7A'); bquad(.08, .05, .92, .25, '#6B4631'); for (let k = 0; k < 3; k++) bquad(.12 + k * .27, .72, .34 + k * .27, .95, '#1C1919');
    for (let k = 0; k < 4; k++) bquad(.1 + k * .22, .58, .27 + k * .22, .9, k % 2 ? '#2F5579' : '#355F86'); qtext(['やきとり', '大衆酒場', 'もつ焼', 'おでん'][(e.v2 || 0) % 4], .15, .62, .85, .86, '#FBF6EE'); },
  menu(e) { bquad(0, 0, 1, 1, tint('#F6EBDC')); for (let k = 0; k < 5; k++) bquad(.15, .15 + k * .16, .85, .22 + k * .16, tint('#3B2A20')); },
  bigscreen(e) { bquad(0, 0, 1, 1, '#1C1919'); const k = Math.floor(G.t * .7 + (e.seed % 5)) % 4;
    if (k === 0) { bquad(.03, .05, .97, .95, '#F6EBDC'); qtext('REN & JILL', .1, .45, .9, .85, '#3B2A20'); qtext('レンとジル', .25, .15, .75, .42, '#A97A1E'); }
    else { const C2 = [['#E86A75', '#F2C230'], ['#4E77A0', '#7FD06A'], ['#9C7BD0', '#6FC3E8'], ['#F08A2E', '#FBF6EE']][k]; bquad(.03, .05, .97, .95, C2[0]); bquad(.12, .2, .55, .8, C2[1]); bquad(.62, .55, .9, .7, '#FBF6EE'); bquad(.62, .3, .82, .42, '#FBF6EE'); } },
  elevator(e) { bquad(0, 0, 1, 1, tint('#B9C2CA')); bquad(.12, 0, .88, .86, tint('#D9DEE2')); ctx.strokeStyle = tint('#8A949E'); ctx.lineWidth = 2; ctx.beginPath(); bline(.5, 0, .5, .86); ctx.stroke();
    bquad(.3, .9, .7, .98, '#1C1919'); qtext(String(1 + ((e.v2 || 0) + Math.floor(G.t * .5)) % 9), .42, .9, .58, .98, '#FFB13B'); bquad(.92, .4, .98, .5, tint('#E9EDF0')); },
  bookshelf(e) { bquad(0, 0, 1, 1, tint('#6B4631')); const r = rnd((e.seed || 3) + (e.v2 || 0)); for (let row = 0; row < 5; row++) { const v0 = .05 + row * .19; let u = .03; while (u < .97) { const w = .02 + r() * .035; bquad(u, v0, Math.min(.97, u + w), v0 + .13 + r() * .03, tint(['#C8463C', '#355F86', '#F2C230', '#5F9E5A', '#E9E2D5', '#8A5530', '#46525E'][(r() * 7) | 0])); u += w + .004; } bquad(0, v0 - .02, 1, v0, tint('#4A2F20')); } },
  mirror(e) { bquad(0, 0, 1, 1, tint('#E9EEF2')); bquad(.08, .3, .92, .95, LT.night > .4 ? '#7E8A96' : tint('#BFD3E0')); bquad(.08, .3, .5, .95, 'rgba(255,255,255,.25)'); bquad(0, 0, 1, .26, tint('#F7F9FA')); },
  menuboard(e) { bquad(0, 0, 1, 1, '#2B2B2B'); qtext(['本日の定食', 'カレー', 'そば・うどん', 'A定食 B定食'][(e.v2 || 0) % 4], .08, .7, .92, .92, '#FBF6EE'); for (let k = 0; k < 3; k++) { bquad(.1, .12 + k * .18, .55, .24 + k * .18, '#E9E2D5'); bquad(.65, .12 + k * .18, .9, .24 + k * .18, '#F2C230'); } },
  woodpanel(e) { bquad(0, 0, 1, 1, tint('#7A5538')); ctx.strokeStyle = tint('#5A3D27'); ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = 1; k < 4; k++) bline(k / 4, 0, k / 4, 1); ctx.stroke(); bquad(.1, .45, .9, .8, tint('#8A6444')); },
  portrait(e) { bquad(0, 0, 1, 1, tint('#B08A3E')); bquad(.08, .06, .92, .94, tint('#E9E2D5')); bquad(.3, .12, .7, .55, tint('#8A6A55')); const c = bil(.5, .68); ctx.fillStyle = tint('#C9A882'); ctx.beginPath(); ctx.ellipse(c[0], c[1], Math.abs(bil(.68, .68)[0] - c[0]), Math.abs(bil(.5, .84)[1] - c[1]), 0, 0, Math.PI * 2); ctx.fill(); },
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
function altitude(seg, s) { const c = seg.th.climb; return c ? Math.round(lerp(c[0], c[1], clamp(s / seg.len, 0, 1))) : 0; }
function drawSky(seg) {
  const th = seg.th, open = th.kind !== 'room' && th.kind !== 'train';
  const horizon = HORIZON - Math.tan(CAM.pitch) * FOCAL;
  if (!open && th.kind) { const gr = ctx.createLinearGradient(0, 0, 0, horizon + 30); gr.addColorStop(0, `rgb(${LT.top.map(x => x | 0)})`); gr.addColorStop(1, `rgb(${LT.bot.map(x => x | 0)})`); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); return; }
  skyGradient(horizon);
  const N = LT.night;
  if (N > .5) { ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 50; i++) { const x = ((i * 97.3 - CAM.yaw * 80) % W + W) % W, y = (i * 53.7) % (horizon * .85); ctx.fillRect(x, y, 1.5, 1.5); } }
  drawSunGlow(horizon);
  drawClouds2(horizon);
  if (N < .6 && G.weather === 'clear') drawBirds(horizon);
  const climb = !!th.climb, drop = climb ? (altitude(seg, G.mode === 'title' ? 0 : G.s) / 450) * H * .24 + 8 : 0;
  const yb = horizon + drop;
  // while the camera swings round a corner, the last stretch's landmarks fade out instead of vanishing
  const prev = G.turnT > 0 && G.segs[G.ci - 1] && G.segs[G.ci - 1] !== seg ? G.segs[G.ci - 1] : null, fade = prev ? clamp(G.turnT / .8, 0, 1) : 0;
  const lmPass = (sg, fuji) => { for (const lm of sg.th.lm || []) if ((lm.t === 'fuji') === fuji) { landmark(sg, lm, yb); if (fuji) ranges(sg, lm, yb); } };
  if (prev && fade > .02) { ctx.globalAlpha = fade; lmPass(prev, true); ctx.globalAlpha = 1; }
  ctx.globalAlpha = 1 - fade; lmPass(seg, true); ctx.globalAlpha = 1;
  skyline(seg, yb, 0);
  if (prev && fade > .02) { ctx.globalAlpha = fade; lmPass(prev, false); ctx.globalAlpha = 1; }
  ctx.globalAlpha = 1 - fade; lmPass(seg, false); ctx.globalAlpha = 1;
  skyline(seg, yb, 1);
  ctx.fillStyle = N > .4 ? 'rgb(36,44,74)' : `rgb(${(LT.bot[0] * .82) | 0},${(LT.bot[1] * .85) | 0},${(LT.bot[2] * .88) | 0})`; ctx.fillRect(0, yb, W, H - yb);
  if (climb && N > .4) { ctx.fillStyle = 'rgba(255,214,140,.8)'; const r = rnd(5); for (let i = 0; i < 160; i++) { const x = ((r() * W * 3 - CAM.yaw * 300) % W + W) % W, y = yb + 2 + r() * (H - yb); ctx.fillRect(x, y, 1.6, 1.6); } }
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
function landmark(seg, lm, yb) {
  const a = seg.dir * Math.PI / 2 + (lm.off || 0) + (seg.lmOff || 0) * .3, dx = angDiff(a, CAM.yaw);
  if (Math.abs(dx) > 1.15) return;
  const x = W / 2 + Math.tan(dx) * FOCAL, N = LT.night, s = (lm.sc || 1) * (seg.th.climb && lm.t !== 'fuji' ? .6 : 1);
  if (lm.t === 'tower') drawTokyoTower(x, yb, FOCAL * .42 * s, N);
  else if (lm.t === 'skytree') drawSkytree(x, yb, FOCAL * .72 * s, N);
  else if (lm.t === 'fuji') drawFuji(x, yb, FOCAL * .3 * s, N);
  else if (lm.t === 'pagoda') drawPagoda(x, yb, FOCAL * .2 * s, N);
  else if (lm.t === 'tocho') drawTocho(x, yb, FOCAL * .36 * s, N);
  else if (lm.t === 'clock') drawClockTower(x, yb, FOCAL * .24 * s, N);
  else if (lm.t === 'yagura') drawYagura(x, yb, FOCAL * .14 * s, N);
  else if (lm.t === 'nijubashi') drawNijubashi(x, yb, FOCAL * .1 * s, N);
  else if (lm.t === 'kokugikan') drawKokugikan(x, yb, FOCAL * .12 * s, N);
  else if (lm.t === 'cyl') drawCyl(x, yb, FOCAL * .3 * s, N);
  else if (lm.t === 'gallery') drawGallery(x, yb, FOCAL * .16 * s, N);
  else if (lm.t === 'airport') drawAirport(x, yb, FOCAL * .3 * s, N);
}
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
  const a = seg.dir * Math.PI / 2 + (lm.off || 0) + (seg.lmOff || 0) * .3, dx = angDiff(a, CAM.yaw); if (Math.abs(dx) > 1.3) return;
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
  const can = (cols, n) => { const c = mk(256), g = c.getContext('2d'); const r = rnd(n); for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 90; g.beginPath(); g.fillStyle = cols[(r() * cols.length) | 0]; g.arc(128 + Math.cos(a) * d, 120 + Math.sin(a) * d * .8, 18 + r() * 22, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(128, 190, 90, 30, 0, 0, Math.PI * 2); g.fill(); return c; };
  for (const k in TREE) SPR['canopy_' + k] = leafCrown(TREE[k].length > 2 ? TREE[k] : [TREE[k][0], TREE[k][0], TREE[k][0]], k.length * 7);
  { const c = mk(256), g = c.getContext('2d'), r = rnd(9); for (let i = 0; i < 160; i++) { const v = r(), wv = (1 - v) * 92 + 6; g.beginPath(); g.fillStyle = TREE.ginkgo[(r() * 3) | 0]; g.arc(128 + (r() * 2 - 1) * wv * .8, 20 + v * 210, 10 + r() * 10, 0, Math.PI * 2); g.fill(); } SPR.canopy_cone = c; }
  { const c = mk(256), g = c.getContext('2d'), r = rnd(4); for (let k = 0; k < 4; k++) for (let i = 0; i < 26; i++) { g.beginPath(); g.fillStyle = TREE.pine[(r() * 3) | 0]; g.ellipse(128 + (r() * 2 - 1) * 100, 60 + k * 45 + r() * 20, 26 + r() * 20, 10 + r() * 6, 0, 0, Math.PI * 2); g.fill(); } SPR.canopy_pine = c; }
  { const day = leafCrown(TREE.green, 31), c = mk(256), g = c.getContext('2d'); g.drawImage(day, 0, 0); const r = rnd(11); for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(255,230,150,.9)'; g.beginPath(); g.arc(30 + r() * 196, 30 + r() * 170, 2.2, 0, Math.PI * 2); g.fill(); } SPR.canopy_illum = c;
    const n = mk(256), h2 = n.getContext('2d'); h2.globalAlpha = .55; h2.filter = 'brightness(.25)'; h2.drawImage(day, 0, 0); h2.filter = 'none'; h2.globalAlpha = 1; const r2 = rnd(13);
    for (let i = 0; i < 160; i++) { const x = 28 + r2() * 200, y = 24 + r2() * 176; const gr = h2.createRadialGradient(x, y, 0, x, y, 7); gr.addColorStop(0, 'rgba(255,236,170,1)'); gr.addColorStop(1, 'rgba(255,200,110,0)'); h2.fillStyle = gr; h2.fillRect(x - 7, y - 7, 14, 14); } SPR.canopy_illumN = n; }
  { const c = mk(128), g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(255,230,170,.95)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); SPR.glow = c; }
  { const c = mk(128), g = c.getContext('2d'); g.fillStyle = '#2B1A12'; g.fillRect(48, 6, 32, 12); g.fillRect(48, 110, 32, 12); const gr = g.createRadialGradient(54, 50, 6, 64, 64, 60); gr.addColorStop(0, '#FF7A5C'); gr.addColorStop(1, '#C0392B'); g.fillStyle = gr; g.beginPath(); g.ellipse(64, 64, 42, 50, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.25)'; for (let k = 1; k < 6; k++) { g.beginPath(); g.ellipse(64, 64 - 50 + k * 16.6, 42 * Math.sin(k / 6 * Math.PI), 3, 0, 0, Math.PI * 2); g.stroke(); } SPR.lantern = c; }
  { const c = mk(64), g = c.getContext('2d'); g.strokeStyle = '#E9EDF0'; g.lineWidth = 4; g.beginPath(); g.moveTo(32, 0); g.lineTo(32, 36); g.stroke(); g.beginPath(); g.ellipse(32, 48, 12, 14, 0, 0, Math.PI * 2); g.stroke(); SPR.strap = c; }
  { const c = mk(128), g = c.getContext('2d'); for (let i = 0; i < 26; i++) { g.beginPath(); g.fillStyle = i % 3 ? '#5F9E5A' : ['#E86A75', '#F2C230', '#FBF6EE', '#C792EA'][i % 4]; g.arc(20 + (i * 37) % 90, 40 + (i * 23) % 60, 9, 0, Math.PI * 2); g.fill(); } SPR.flowers = c; }
  { const c = mk(64), g = c.getContext('2d'); g.fillStyle = '#F07C2E'; g.beginPath(); g.arc(32, 36, 22, Math.PI, 0); g.fill(); g.fillStyle = '#FBF6EE'; g.fillRect(10, 36, 44, 6); SPR.buoy = c; }
  { const c = mk(256), g = c.getContext('2d'), r = rnd(23); // a row of riverside buildings in silhouette, windows lit at night via the N variant
      const paintRow = (night) => { const cv = mk(256), q = cv.getContext('2d'), rr2 = rnd(23); let x = 0; while (x < 256) { const w = 40 + rr2() * 60, h = 90 + rr2() * 150; q.fillStyle = night ? '#1C2440' : `rgb(${150 + rr2() * 40 | 0},${160 + rr2() * 36 | 0},${178 + rr2() * 30 | 0})`; q.fillRect(x, 256 - h, w, h);
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
  const S = 512, c = mk(S), g = c.getContext('2d'), r = rnd(seed), tips = [];
  const bark = night ? '#17110F' : '#3B2F2B', bx = 256 - dir * 92;
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
  g.globalAlpha = .7; for (const [x, y, d] of tips) if (d === 0 && r() < .5) { g.strokeStyle = bark; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 30, y - 8 - r() * 14); g.stroke(); } g.globalAlpha = 1;
  if (night) { // lit from below by paper lanterns
    g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, 120, 0, 380); gr.addColorStop(0, 'rgba(40,30,70,.25)'); gr.addColorStop(1, 'rgba(255,190,140,.38)'); g.fillStyle = gr; g.fillRect(0, 0, S, S); g.globalCompositeOperation = 'source-over'; }
  return c;
}
function bareTree(seed, cone) {
  const S = 256, c = mk(S), g = c.getContext('2d'), r = rnd(seed), tips = [];
  if (cone) { g.strokeStyle = '#5E4C42'; g.lineWidth = 4; g.beginPath(); g.moveTo(128, 250); g.lineTo(128, 14); g.stroke();
    for (let y = 30; y < 240; y += 9) { const w = (y - 14) / 236 * 100; for (const sd of [-1, 1]) treeLimbs(g, r, 128, y, (sd < 0 ? Math.PI : 0) - sd * (.5 + r() * .3), w * (.6 + r() * .4), 2, 1, '#6B5A50', tips, 0); } return c; }
  for (const a of [-1.9, -1.55, -1.2, -2.3, -.85]) treeLimbs(g, r, 128, 250, a + (r() - .5) * .2, 70 + r() * 20, 7, 3, '#5A4A42', tips, 0);
  return c;
}
function buildSakuraSprites() {
  for (const d of [-1, 1]) for (const v of [0, 1]) { SPR[`sakura${d < 0 ? 'L' : 'R'}${v}`] = sakuraTree(d, 0, 17 + v * 31 + (d + 1) * 7); SPR[`sakura${d < 0 ? 'L' : 'R'}${v}N`] = sakuraTree(d, 1, 17 + v * 31 + (d + 1) * 7); }
  SPR.sakuraU = sakuraTree(0, 0, 88); SPR.sakuraUN = sakuraTree(0, 1, 88);
  SPR.canopy_sakura = SPR.sakuraU; SPR.canopy_bare = bareTree(5); SPR.canopy_coneB = bareTree(9, 1);
  { const c = mk(256), g = c.getContext('2d'), r = rnd(9); for (let i = 0; i < 170; i++) { const v = r(), wv = (1 - v) * 92 + 6; g.beginPath(); g.fillStyle = TREE.fresh[(r() * 3) | 0]; g.arc(128 + (r() * 2 - 1) * wv * .8, 20 + v * 210, 10 + r() * 10, 0, Math.PI * 2); g.fill(); } SPR.canopy_coneG = c; }
}
// sprites take the scene's light: a darkened copy per light level, made once and kept
const LIT_CACHE = new WeakMap(); // weak: when a building texture is dropped, its lit copies go with it
// all shaded copies together stay under a pixel budget (phones run out of canvas memory at dusk, when every picture gets re-shaded)
const LIT_PHONE = navigator.maxTouchPoints >= 1 && Math.min(screen.width, screen.height) < 820, LIT_MAXDIM = LIT_PHONE ? 320 : 4096; const LIT_LIST = []; let LIT_PX = 0; const LIT_MAXPX = LIT_PHONE ? 7e6 : 16e6;
function litEvict() { while (LIT_LIST.length && LIT_PX > LIT_MAXPX) { const e = LIT_LIST.shift(); LIT_PX -= e.px; const m = LIT_CACHE.get(e.img); if (m) { if (m[e.k] === e.c) delete m[e.k]; if (m.last === e.c) m.last = null; } try { e.c.width = e.c.height = 0; } catch (x) { } } }
function litSprite(img, amb, force, full) {
  if (!img || !img.width) return img; // a picture already freed: nothing to shade
  const q = amb.map(x => Math.round(Math.min(1, x) * 4) / 4); if (q[0] >= 1 && q[1] >= 1 && q[2] >= .95) return img; // coarse steps: few shades per picture
  let m = LIT_CACHE.get(img); if (!m) { m = {}; LIT_CACHE.set(img, m); }
  const k = q.join(','); if (m[k]) return m[k];
  if (!force && !texOK() && m.last) return m.last; TEXN++; // over this frame's budget: the previous shade for one more frame
  const ks = full ? 1 : Math.min(1, LIT_MAXDIM / Math.max(img.width, img.height)); // phones keep shaded copies at a reduced size: many more fit in memory, and they are drawn small anyway
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.width * ks)); c.height = Math.max(1, Math.round(img.height * ks)); const g = c.getContext('2d');
  g.drawImage(img, 0, 0, c.width, c.height); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgb(${q.map(x => (x * 255) | 0).join(',')})`; g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(img, 0, 0, c.width, c.height);
  for (const kk of Object.keys(m)) if (kk !== 'last' && kk !== k) { const o = m[kk]; delete m[kk]; const i = LIT_LIST.findIndex(e => e.c === o); if (i >= 0) { LIT_PX -= LIT_LIST[i].px; LIT_LIST.splice(i, 1); } try { o.width = o.height = 0; } catch (x) { } } // one shade per picture: the light only moves one way through the day
  const px = c.width * c.height; LIT_LIST.push({ img, k, c, px }); LIT_PX += px; litEvict();
  m[k] = m.last = c; return c;
}
const STAMP_CACHE = {};
function stampSprite(tid, big) {
  const key = tid + (big ? 'B' : '') + LANG; if (STAMP_CACHE[key]) return STAMP_CACHE[key];
  const th = THEMES[tid], st = th && th.stamp; const sz = big ? 256 : 128, c = mk(sz), g = c.getContext('2d'), s = sz / 128;
  g.scale(s, s); g.fillStyle = '#FBF6EE'; g.beginPath(); g.arc(64, 64, 58, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#C8463C'; g.lineWidth = 6; g.beginPath(); g.arc(64, 64, 52, 0, Math.PI * 2); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(64, 64, 44, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#C8463C'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${st && st.k.length > 2 ? 30 : 38}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; g.fillText(st ? st.k : '?', 64, 60);
  g.font = '900 11px sans-serif'; g.fillText(LANG === 'ja' || !st || !st.en ? 'TOKYO' : st.en.toUpperCase(), 64, 92, 74);
  STAMP_CACHE[key] = c; return c;
}
