/* ================= tiny 3D renderer on Canvas 2D ================= */
const cv = $('#cv'), ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1, FOCAL = 400, BASEF = 400, HORIZON = 0;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, typeof lowQ !== 'undefined' && lowQ ? 1 : 1.75);
  W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  FOCAL = BASEF = Math.min(W * 1.12, H * .84);
  HORIZON = H * .41;
}
const CAM = { x: 0, y: 2, z: 0, yaw: 0, pitch: .3, c: 1, s: 0, cp: 1, sp: 0 };
function camPrep() { CAM.c = Math.cos(CAM.yaw); CAM.s = Math.sin(CAM.yaw); CAM.cp = Math.cos(CAM.pitch); CAM.sp = Math.sin(CAM.pitch); }
const NEAR = 0.25, FAR = 120;
function tc(x, y, z, o, i) {
  const rx = x - CAM.x, ry = y - CAM.y, rz = z - CAM.z;
  const cx = rx * CAM.c - rz * CAM.s, cz = rx * CAM.s + rz * CAM.c;
  o[i] = cx; o[i + 1] = ry * CAM.cp + cz * CAM.sp; o[i + 2] = cz * CAM.cp - ry * CAM.sp;
}
const TMP = new Float32Array(48), CLP = new Float32Array(48), SCR = new Float32Array(32);
function project(v) {
  const n = v.length / 3; let behind = 0, far = 0;
  for (let i = 0; i < n; i++) { tc(v[i * 3], v[i * 3 + 1], v[i * 3 + 2], TMP, i * 3); if (TMP[i * 3 + 2] < NEAR) behind++; if (TMP[i * 3 + 2] > FAR) far++; }
  if (behind === n || far === n) return 0;
  let m = n, src = TMP;
  if (behind) {
    m = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, ai = i * 3, bj = j * 3, za = TMP[ai + 2], zb = TMP[bj + 2];
      if (za >= NEAR) { CLP[m * 3] = TMP[ai]; CLP[m * 3 + 1] = TMP[ai + 1]; CLP[m * 3 + 2] = za; m++; }
      if ((za >= NEAR) !== (zb >= NEAR)) { const t = (NEAR - za) / (zb - za); CLP[m * 3] = TMP[ai] + (TMP[bj] - TMP[ai]) * t; CLP[m * 3 + 1] = TMP[ai + 1] + (TMP[bj + 1] - TMP[ai + 1]) * t; CLP[m * 3 + 2] = NEAR; m++; }
    }
    src = CLP; if (m < 3) return 0;
  }
  let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
  for (let i = 0; i < m; i++) { const z = src[i * 3 + 2]; const x = W / 2 + src[i * 3] * FOCAL / z, y = HORIZON - src[i * 3 + 1] * FOCAL / z; SCR[i * 2] = x; SCR[i * 2 + 1] = y; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; }
  if (maxx < 0 || minx > W || maxy < 0 || miny > H) return 0;
  return behind ? -m : m;
}
function depthOf(v) { let d = 0; const n = v.length / 3; for (let i = 0; i < n; i++) d += (v[i * 3] - CAM.x) * CAM.s + (v[i * 3 + 2] - CAM.z) * CAM.c; return d / n; }
function pathPoly(m) { ctx.beginPath(); ctx.moveTo(SCR[0], SCR[1]); for (let i = 1; i < m; i++) ctx.lineTo(SCR[i * 2], SCR[i * 2 + 1]); ctx.closePath(); }
let BU0 = 0, BUS = 1; // u remap while a quad that is partly behind the camera is drawn through its visible part
function bil(u, v) { u = (u - BU0) / BUS; return [lerp(lerp(SCR[0], SCR[2], u), lerp(SCR[6], SCR[4], u), v), lerp(lerp(SCR[1], SCR[3], u), lerp(SCR[7], SCR[5], u), v)]; }
/* A wall, sign or floor tile that reaches behind the camera used to lose its pattern (windows, shop fronts, road marks)
   the moment one corner crossed the near plane, so buildings went plain strip by strip as you passed them.
   Here the visible part of the quad is cut out along u, projected on its own, and the pattern is drawn through it
   with u remapped, clipped to that part. */
const CQ = new Array(12).fill(0), CZ = [0, 0, 0, 0];
function clippedPattern(q, fn) {
  const v = q.v; if (v.length !== 12) return;
  for (let i = 0; i < 4; i++) { tc(v[i * 3], v[i * 3 + 1], v[i * 3 + 2], TMP, i * 3); CZ[i] = TMP[i * 3 + 2]; }
  const ZN = NEAR + .02, zA = Math.min(CZ[0], CZ[3]), zB = Math.min(CZ[1], CZ[2]);
  if (zA < ZN && zB < ZN) return;
  let ua = 0, ub = 1; if (zA < ZN) ua = (ZN - zA) / (zB - zA); else if (zB < ZN) ub = (ZN - zA) / (zB - zA); else return;
  ua = clamp(ua, 0, 1); ub = clamp(ub, 0, 1); if (ub - ua < .01) return;
  const P = (u, i0, i1, o) => { for (let k = 0; k < 3; k++) CQ[o + k] = lerp(v[i0 * 3 + k], v[i1 * 3 + k], u); };
  P(ua, 0, 1, 0); P(ub, 0, 1, 3); P(ub, 3, 2, 6); P(ua, 3, 2, 9);
  if (project(CQ) !== 4) return;
  ctx.save(); pathPoly(4); ctx.clip(); BU0 = ua; BUS = ub - ua;
  try { fn(); } finally { BU0 = 0; BUS = 1; ctx.restore(); }
}
function bline(u0, v0, u1, v1) { const a = bil(u0, v0), b = bil(u1, v1); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
function bquad(u0, v0, u1, v1, fill) { const a = bil(u0, v0), b = bil(u1, v0), c = bil(u1, v1), d = bil(u0, v1); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
function bpath(u0, v0, u1, v1) { const a = bil(u0, v0), b = bil(u1, v0), c = bil(u1, v1), d = bil(u0, v1); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); }
// text laid onto the current projected quad (affine approximation)
function qtext(txt, u0, v0, u1, v1, color, o) {
  o = o || {};
  const tl = bil(u0, v1), tr = bil(u1, v1), bl = bil(u0, v0);
  const ax = tr[0] - tl[0], ay = tr[1] - tl[1], bx = bl[0] - tl[0], by = bl[1] - tl[1];
  if (Math.abs(ax * by - ay * bx) < 40) return; // too small to read
  ctx.save(); ctx.transform(ax / 100, ay / 100, bx / 100, by / 100, tl[0], tl[1]);
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const chars = [...txt];
  if (o.vert) { const n = chars.length, sz = Math.min(80, 92 / n * 1); ctx.font = `900 ${sz * 1.0}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; chars.forEach((ch, i) => { ctx.save(); ctx.translate(50, (i + .5) * 100 / n); ctx.scale(1, (100 / n) / sz * .9); ctx.fillText(ch, 0, 0); ctx.restore(); }); }
  else { ctx.font = `900 60px "Zen Maru Gothic","Hiragino Sans",sans-serif`; const w = ctx.measureText(txt).width; ctx.translate(50, 52); ctx.scale(Math.min(1.4, 88 / w), 1.25); ctx.fillText(txt, 0, 0); }
  ctx.restore();
}

/* ================= light & time of day ================= */
const LK = [ // minutes, ambient rgb, sky top, sky bottom
  [480, [1, .98, .95], '#7DB9E8', '#EAF3F7'], [600, [1, 1, 1], '#4E9EDB', '#DDEFF8'], [960, [1, .97, .92], '#5DA0D8', '#ECE6D8'],
  [1050, [1, .86, .72], '#5865A8', '#F6A46B'], [1110, [.72, .64, .78], '#2D3570', '#D97E7A'], [1170, [.42, .46, .68], '#0E1636', '#2E3D6E'], [1500, [.42, .46, .68], '#0E1636', '#2E3D6E']];
const LT = { amb: [1, 1, 1], top: [80, 160, 220], bot: [220, 235, 245], night: 0, fog: [220, 230, 240], indoor: false };
function mixC(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
function computeLight(seg) {
  let m = (G.clock % 1440); if (m < 420) m += 1440;
  let i = 0; while (i < LK.length - 2 && LK[i + 1][0] < m) i++;
  const a = LK[i], b = LK[i + 1], t = clamp((m - a[0]) / (b[0] - a[0]), 0, 1);
  const amb = mixC(a[1], b[1], t), top = mixC(C(a[2]), C(b[2]), t), bot = mixC(C(a[3]), C(b[3]), t);
  LT.night = clamp((m - 1080) / 110, 0, 1);
  const kind = seg.th.kind; LT.indoor = kind === 'room' || kind === 'train';
  const wet = G.weather === 'rain' && !LT.indoor ? .82 : G.weather === 'snow' && !LT.indoor ? .95 : 1;
  LT.top = G.weather === 'rain' ? mixC(top, [120, 130, 140], .55 * (1 - LT.night * .6)) : top;
  LT.bot = G.weather === 'rain' ? mixC(bot, [170, 176, 182], .5 * (1 - LT.night * .6)) : G.weather === 'snow' ? mixC(bot, [235, 238, 242], .5) : bot;
  LT.amb = LT.indoor ? (LT.night > .4 ? [.96, .9, .8] : [1, .99, .97]) : amb.map(x => x * wet);
  if (seg.th.tid === 'yurakucho') LT.amb = [.86, .78, .66];
  LT.fog = LT.indoor ? mixC(C(seg.th.wall || '#EEEEEE'), [255, 255, 255], .2).map((x, j) => x * LT.amb[j]) : LT.bot;
  computeSun();
}
function lit(c, k) { return [c[0] * k * LT.amb[0], c[1] * k * LT.amb[1], c[2] * k * LT.amb[2]]; }
function fogK(d) { return clamp((d - 40) / (FAR - 40), 0, 1) * (LT.indoor ? .55 : 1); }
const c255 = x => x > 255 ? 255 : x < 0 ? 0 : x | 0; // out-of-range rgb() values put the canvas on a very slow path
function fogged(c, k, d, glow) { const t = fogK(d); const q = glow ? [c[0], c[1], c[2]] : lit(c, k); return `rgb(${c255(lerp(q[0], LT.fog[0], t))},${c255(lerp(q[1], LT.fog[1], t))},${c255(lerp(q[2], LT.fog[2], t))})`; }
const TC = new Map(); let TCK = '';
function tint(hex) { // apply the current light to a literal color (for patterns)
  const key = LT.amb.map(x => x.toFixed(2)).join(); if (key !== TCK) { TC.clear(); TCK = key; }
  let s = TC.get(hex); if (!s) { const c = lit(C(hex), 1); s = `rgb(${c255(c[0])},${c255(c[1])},${c255(c[2])})`; TC.set(hex, s); } return s;
}

/* ================= faces, boxes, sprites ================= */
const FACE_SH = { top: 1.06, front: .9, back: .9, left: .8, right: .74 };
/* sunlight by direction: faces turned toward the sun brighten, faces turned away fall into shade
   (strongest on clear days with the sun high; nothing at night or indoors) */
const SUND = [0, 0]; let SUNKEY = -1, SUNKEY2 = 0;
function sunK(n) {
  if (LT.indoor || !SUN.k) return 1;
  if (SUNKEY !== (G.clock | 0)) { SUNKEY = G.clock | 0; SUNKEY2++; const a = SUN.az * .9 + .7; SUND[0] = Math.sin(a); SUND[1] = Math.cos(a); }
  const nx = n[0], nz = n.length === 3 ? n[2] : n[1]; if (n.length === 3 && Math.abs(n[1]) > .7) return 1 + .06 * SUN.k;
  const dp = nx * SUND[0] + nz * SUND[1]; return 1 + SUN.k * (dp > 0 ? dp * .16 : dp * .2);
}
function boxFaces(seg, b, ds, dl, dy) {
  const s0 = b.s0 + ds, s1 = b.s1 + ds, l0 = b.l0 + dl, l1 = b.l1 + dl, y0 = b.y0 + dy, y1 = b.y1 + dy, f = seg.f, r = seg.r;
  return [
    { v: quad(seg, [[s0, l0, y1], [s0, l1, y1], [s1, l1, y1], [s1, l0, y1]]), n: [0, 1, 0], sh: FACE_SH.top, top: 1 },
    { v: quad(seg, [[s0, l0, y0], [s0, l1, y0], [s0, l1, y1], [s0, l0, y1]]), n: [-f[0], 0, -f[1]], sh: FACE_SH.front, front: 1 },
    { v: quad(seg, [[s1, l1, y0], [s1, l0, y0], [s1, l0, y1], [s1, l1, y1]]), n: [f[0], 0, f[1]], sh: FACE_SH.back },
    { v: quad(seg, [[s1, l0, y0], [s0, l0, y0], [s0, l0, y1], [s1, l0, y1]]), n: [-r[0], 0, -r[1]], sh: FACE_SH.left, sideL: 1 },
    { v: quad(seg, [[s0, l1, y0], [s1, l1, y0], [s1, l1, y1], [s0, l1, y1]]), n: [r[0], 0, r[1]], sh: FACE_SH.right, sideR: 1 },
    { v: quad(seg, [[s0, l1, y0], [s0, l0, y0], [s1, l0, y0], [s1, l1, y0]]), n: [0, -1, 0], sh: .7 },
  ];
}
function faceVisible(fc) { const v = fc.v; const cx = (v[0] + v[6]) / 2, cy = (v[1] + v[7]) / 2, cz = (v[2] + v[8]) / 2; const n = fc.n3 || fc.n; return n.length === 3 ? (CAM.x - cx) * n[0] + (CAM.y - cy) * n[1] + (CAM.z - cz) * n[2] > 0 : (CAM.x - cx) * n[0] + (CAM.z - cz) * n[1] > 0; }
function spriteAt(x, y, z) { tc(x, y, z, TMP, 0); const zc = TMP[2]; if (zc < NEAR || zc > FAR) return null; return { sx: W / 2 + TMP[0] * FOCAL / zc, sy: HORIZON - TMP[1] * FOCAL / zc, k: FOCAL / zc, z: zc }; }
/* a fine material grain laid over near box faces (wood, paint, fabric all read as surfaces rather than flat blocks) */
let GRAINP = null;
function grainPattern() { if (GRAINP) return GRAINP; const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d') || noCtx(), r = rnd(11);
  for (let i = 0; i < 900; i++) { const v = r(); g.fillStyle = v < .5 ? `rgba(0,0,0,${(.05 + r() * .08).toFixed(3)})` : `rgba(255,255,255,${(.04 + r() * .07).toFixed(3)})`; g.fillRect(r() * 96, r() * 96, 1 + r() * 2.5, 1 + r() * 1.2); }
  for (let k = 0; k < 7; k++) { g.fillStyle = 'rgba(0,0,0,.035)'; g.fillRect(0, r() * 96, 96, 1 + r() * 2); } GRAINP = ctx.createPattern(c, 'repeat'); return GRAINP; }
/* ---- real materials on every box face ----
   Each box gets a material from its color and where it is (wood, fabric, painted metal, brushed metal, plastic, foliage,
   paper, stone). Its texture is laid over the face in the face's own perspective (an affine map from three corners), so
   grain, weave and brushing run along the surface; edges are softened and corners rounded. */
const MAT_TEX = {};
function matTex(kind) {
  if (MAT_TEX[kind]) return MAT_TEX[kind];
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d') || noCtx(), r = rnd(kind.length * 31 + 7);
  const dot = (n, a0, a1, w, h) => { for (let i = 0; i < n; i++) { const v = r(); g.fillStyle = v < .5 ? `rgba(0,0,0,${(a0 + r() * a1).toFixed(3)})` : `rgba(255,255,255,${(a0 + r() * a1).toFixed(3)})`; g.fillRect(r() * 128, r() * 128, w + r() * w, h + r() * h); } };
  if (kind === 'wood') { for (let y = 0; y < 128; y += 3 + r() * 5) { g.strokeStyle = `rgba(60,30,10,${(.06 + r() * .1).toFixed(3)})`; g.lineWidth = .8 + r() * 1.6; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 128; x += 16) g.lineTo(x, y + Math.sin(x * .05 + y) * 1.6); g.stroke(); }
    for (let k = 0; k < 2; k++) { const x = r() * 128, y = r() * 128; g.strokeStyle = 'rgba(60,30,10,.18)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, 7, 2.6, 0, 0, Math.PI * 2); g.stroke(); } dot(160, .02, .04, 1, .6); }
  else if (kind === 'fabric') { for (let i = 0; i < 128; i += 2) { g.fillStyle = `rgba(0,0,0,${i % 4 ? .05 : .09})`; g.fillRect(0, i, 128, 1); g.fillStyle = `rgba(255,255,255,${i % 4 ? .04 : .07})`; g.fillRect(i, 0, 1, 128); } dot(260, .02, .05, 1, 1);
    g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1.2; g.setLineDash([3, 3]); g.strokeRect(6, 6, 116, 116); g.setLineDash([]); }
  else if (kind === 'metal') { for (let y = 0; y < 128; y++) { g.fillStyle = `rgba(${r() < .5 ? '0,0,0' : '255,255,255'},${(.015 + r() * .05).toFixed(3)})`; g.fillRect(0, y, 128, 1); }
    const gr = g.createLinearGradient(0, 0, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,.14)'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.08)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
  else if (kind === 'paint') { dot(240, .015, .035, 1, 1); const gr = g.createRadialGradient(40, 30, 4, 40, 30, 90); gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    g.fillStyle = 'rgba(0,0,0,.05)'; for (let k = 0; k < 3; k++) g.fillRect(r() * 120, r() * 128, 2 + r() * 3, 10 + r() * 30); }
  else if (kind === 'foliage') { for (let i = 0; i < 160; i++) { const x = r() * 128, y = r() * 128; g.fillStyle = r() < .5 ? `rgba(20,50,20,${(.12 + r() * .18).toFixed(3)})` : `rgba(200,240,160,${(.08 + r() * .14).toFixed(3)})`; g.beginPath(); g.ellipse(x, y, 4 + r() * 5, 2 + r() * 3, r() * 3, 0, Math.PI * 2); g.fill(); } }
  else if (kind === 'paper') { for (let y = 2; y < 128; y += 4) { g.fillStyle = `rgba(120,110,90,${(.05 + r() * .06).toFixed(3)})`; g.fillRect(0, y, 128, 1); } dot(120, .02, .03, 1, 1); }
  else if (kind === 'stone') { dot(700, .03, .08, 1.2, 1.2); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1; for (let k = 0; k < 4; k++) { g.beginPath(); let x = r() * 128, y = r() * 128; g.moveTo(x, y); for (let j = 0; j < 4; j++) { x += (r() - .5) * 30; y += (r() - .5) * 30; g.lineTo(x, y); } g.stroke(); } }
  MAT_TEX[kind] = ctx.createPattern(c, 'repeat'); return MAT_TEX[kind];
}
function matOf(b, sg) {
  if (b.mat) return b.mat; const [R, Gc, Bc] = hexRgb(b.c), mx = Math.max(R, Gc, Bc) / 255, mn = Math.min(R, Gc, Bc) / 255, l = (mx + mn) / 2, sat = mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1));
  let h = 0; if (mx !== mn) { const d = (mx - mn) * 255; h = mx * 255 === R ? ((Gc - Bc) / d) % 6 : mx * 255 === Gc ? (Bc - R) / d + 2 : (R - Gc) / d + 4; h *= 60; if (h < 0) h += 360; }
  const room = sg && sg.th && (sg.th.kind === 'room' || sg.th.kind === 'train');
  b.mat = l > .86 ? 'paper' : (h > 75 && h < 160 && sat > .22) ? 'foliage' : (h >= 15 && h <= 45 && sat > .2 && l < .62) ? 'wood' : sat < .14 ? (Bc >= R ? 'metal' : 'stone') : room ? 'fabric' : 'paint';
  return b.mat;
}
const MAT_M = new DOMMatrix();
function matFace(fc, b, sg, fd) {
  const pat = matTex(matOf(b, sg)); if (!pat.setTransform) return;
  const wl = b.l1 - b.l0, ws = b.s1 - b.s0, wy = b.y1 - b.y0, top = fc.top || fc.n[1] === -1;
  const wu = top ? wl : (fc.front || fc.n.length === 3 && !fc.sideL && !fc.sideR) ? wl : (fc.sideL || fc.sideR) ? ws : wl, wv = top ? ws : wy;
  const T = .55, ru = Math.max(.25, wu / T) * 128, rv = Math.max(.25, wv / T) * 128;
  MAT_M.a = (SCR[2] - SCR[0]) / ru; MAT_M.b = (SCR[3] - SCR[1]) / ru; MAT_M.c = (SCR[6] - SCR[0]) / rv; MAT_M.d = (SCR[7] - SCR[1]) / rv; MAT_M.e = SCR[0]; MAT_M.f = SCR[1];
  if (!isFinite(MAT_M.a + MAT_M.b + MAT_M.c + MAT_M.d)) return;
  pat.setTransform(MAT_M); ctx.fillStyle = pat; ctx.globalAlpha *= clamp(1.15 - fd / 30, .25, 1); ctx.fill(); ctx.globalAlpha = BOXA;
}
let BOXA = 1;
// a painting laid on a box face in true perspective: the face is cut into narrow vertical strips, each mapped on its own
const FI = new Float32Array(3);
function faceImage(img, flip, v) {
  if (!img || !img.width) return; // a picture the phone had no memory for: the plain box face stays
  const L = litSprite(img, LT.amb), IW = L.width, IH = L.height, N = 6;
  // world corners: bottom-start, bottom-end, top-start, top-end (start = the image's left edge)
  let B0 = [v[0], v[1], v[2]], B1 = [v[3], v[4], v[5]], T1 = [v[6], v[7], v[8]], T0 = [v[9], v[10], v[11]];
  if (flip) { [B0, B1] = [B1, B0]; [T0, T1] = [T1, T0]; }
  const P = (A, Bq, t) => { tc(A[0] + (Bq[0] - A[0]) * t, A[1] + (Bq[1] - A[1]) * t, A[2] + (Bq[2] - A[2]) * t, FI, 0); if (FI[2] < NEAR) return null; return [W / 2 + FI[0] * FOCAL / FI[2], HORIZON - FI[1] * FOCAL / FI[2]]; };
  for (let i = 0; i < N; i++) {
    const t0 = i / N, t1 = (i + 1) / N, b0 = P(B0, B1, t0), b1 = P(B0, B1, t1), u0 = P(T0, T1, t0), u1 = P(T0, T1, t1); if (!b0 || !b1 || !u0 || !u1) continue;
    const sx = IW * t0, sw = IW / N;
    ctx.save(); ctx.beginPath(); ctx.moveTo(b0[0], b0[1]); ctx.lineTo(b1[0], b1[1]); ctx.lineTo(u1[0], u1[1]); ctx.lineTo(u0[0], u0[1]); ctx.closePath(); ctx.clip();
    // image (sx..sx+sw, 0..IH): top-left -> u0, top-right -> u1, bottom-left -> b0
    ctx.transform((u1[0] - u0[0]) / sw, (u1[1] - u0[1]) / sw, (b0[0] - u0[0]) / IH, (b0[1] - u0[1]) / IH, u0[0] - (u1[0] - u0[0]) / sw * sx, u0[1] - (u1[1] - u0[1]) / sw * sx);
    ctx.drawImage(L, sx - .5, 0, sw + 1, IH, sx - .5, 0, sw + 1, IH); ctx.restore();
  }
}
function drawBoxes(list, sg, d, alpha, ds, dl, dy, cache) {
  const faces = [];
  if (cache) { for (const [fc, b] of cache) if (faceVisible(fc)) faces.push([depthOf(fc.v), fc, b]); }
  else for (const b of list) for (const fc of boxFaces(sg, b, ds, dl, dy)) if (faceVisible(fc)) faces.push([depthOf(fc.v), fc, b]);
  faces.sort((a, b) => b[0] - a[0]);
  ctx.globalAlpha = alpha; BOXA = alpha; ctx.lineJoin = 'round';
  for (const [fd, fc, b] of faces) {
    const m = project(fc.v); if (!m) continue; pathPoly(Math.abs(m));
    const glow = b.glow && (LT.night > .3 || b.glow === 1);
    const col = fogged(b.cc, glow ? 1 : fc.sh * sunK(fc.n), fd, glow); ctx.fillStyle = col; ctx.fill();
    if (fd < 40 && !glow) { ctx.strokeStyle = col; ctx.lineWidth = clamp(36 / fd, .6, 2.6); ctx.stroke(); } // soft, rounded edges instead of hard cube corners
    if (fd < 34 && !glow && m === 4) matFace(fc, b, sg, fd);
    if (fd < 28 && m === 4 && !glow && !fc.top) { // soft light: a little brighter at the top of a face, darker at its foot
      let y0 = 1e9, y1 = -1e9; for (let i = 0; i < 4; i++) { y0 = Math.min(y0, SCR[i * 2 + 1]); y1 = Math.max(y1, SCR[i * 2 + 1]); }
      if (y1 - y0 > 14) { const gr = ctx.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(255,255,255,.10)'); gr.addColorStop(.6, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(20,15,30,.22)'); ctx.fillStyle = gr; ctx.fill(); } }
    if (fd < 30 && !b.noEdge) { ctx.strokeStyle = 'rgba(40,30,24,.08)'; ctx.lineWidth = 1; ctx.stroke(); }
    if (fc.top && m === 4 && fd < 22 && !glow) { ctx.strokeStyle = `rgba(255,250,240,${(.22 * (1 - fd / 22)).toFixed(3)})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(SCR[0], SCR[1]); ctx.lineTo(SCR[2], SCR[3]); ctx.stroke(); }
    if (b.face && m === 4 && fd < 50 && (fc.sideL || fc.sideR)) faceImage(paintFace(b.face, b.faceW, b.faceH), fc.sideL, fc.v);
    if (m === 4 && fd < 45) {
      if (b.pat === 'vend' && (fc.sideL || fc.sideR || fc.front)) vendFace(b);
      if (b.txt && (fc.front || (b.vert && (fc.sideL || fc.sideR)))) qtext(b.txt, .08, .06, .92, .94, b.tc || (hexRgb(b.c)[0] + hexRgb(b.c)[1] < 260 ? '#FBF6EE' : '#2B1A12'), { vert: b.vert });
    }
  }
  ctx.globalAlpha = 1;
}
function vendFace(b) { bquad(.08, .45, .92, .95, '#FFFFFF'); for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) bquad(.12 + k * .16, .5 + r * .14, .22 + k * .16, .6 + r * .14, ['#C8463C', '#F2C230', '#4E77A0', '#5F9E5A', '#E86A75'][(r + k) % 5]); bquad(.3, .1, .7, .3, '#2B2B2B'); }

/* ================= frame ================= */
const DRAW = [];
function segOrder() { const out = []; for (let i = G.segs.length - 1; i > G.ci; i--) out.push(G.segs[i]); if (G.fork) out.push(...G.fork); if (G.segs[G.ci - 1]) out.push(G.segs[G.ci - 1]); out.push(G.segs[G.ci]); return out.filter(Boolean); }
function render() {
  const seg = G.segs[G.ci] || G.segs[0]; if (!seg) return;
  computeLight(seg); camPrep();
  drawSky(seg);
  for (const sg of segOrder()) drawSegment(sg, sg === seg);
  drawFX();
  drawWeather(seg);
  if (LT.night > .5 && !LT.indoor) { const g = ctx.createRadialGradient(W / 2, H * .55, H * .2, W / 2, H * .55, H * .8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(8,10,30,.35)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  postFX();
}
/* ---- hills hide what is behind them ----
   Everything is painted back to front, and the ground is painted first, so a rider or a building foot beyond a
   crest was drawn over the hilltop and looked like it was floating. For the stretch you are on, sample the road's
   screen height ahead; anything farther than a crest is clipped to above the highest ground in front of it. */
const OCC = { on: false, n: 0, d: new Float32Array(160), y: new Float32Array(160), m: new Float32Array(160) };
function buildOcc(sg) {
  OCC.on = false; if (!sg.hp) return; let n = 0, mn = 1e9;
  for (let s = Math.max(0, G.s - 4); s < sg.len + HW && n < 160; s += 1.5) {
    const p = segPos(sg, s, 0); tc(p[0], p[2], p[1], TMP, 0); const z = TMP[2]; if (z < NEAR + .3) continue;
    const y = HORIZON - TMP[1] * FOCAL / z; mn = Math.min(mn, y); OCC.d[n] = z; OCC.y[n] = y; OCC.m[n] = mn; n++; }
  OCC.n = n; OCC.on = n > 2;
}
// the screen y above which something at camera depth d is visible (Infinity when nothing in front rises above it)
function occAt(d) {
  if (!OCC.on || d < OCC.d[0]) return Infinity; let i = 0; while (i < OCC.n - 1 && OCC.d[i + 1] < d - .6) i++;
  const prev = OCC.m[i]; let j = i; while (j < OCC.n - 1 && OCC.d[j] < d) j++; const gy = OCC.y[j];
  return prev < gy - 1.5 ? prev : Infinity;
}
function occDraw(d, fn) { const y = occAt(d); if (y === Infinity) return fn(); if (y <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, y); ctx.clip(); try { fn(); } finally { ctx.restore(); } }
const PROF = {}; let PT = 0; const pm = k => { if (!PROF.on) return; const t = performance.now(); PROF[k] = (PROF[k] || 0) + t - PT; PT = t; };
function drawSegment(sg, isCur) {
  LC = sg.th.lc || '#80C241'; if (isCur) buildOcc(sg); const oc = isCur && OCC.on;
  const near = d => d > -8 && d < FAR + 8; if (PROF.on) PT = performance.now();
  // floor
  DRAW.length = 0;
  for (const p of sg.floor) { const d = depthOf(p.v); if (!near(d)) continue; DRAW.push([p.dec ? d - (p.dec === 'futonD' ? 4 : .8) : d, p]); }
  const patFar = typeof lowQ !== 'undefined' && lowQ > 1 ? 55 : 999;
  DRAW.sort((a, b) => b[0] - a[0]);
  const isW = p => p.pat === 'sea' || p.pat === 'water';
  let wPolys = null;
  for (const [d, p] of DRAW) { if (!isW(p)) continue; const m = project(p.v); if (!m) continue; pathPoly(Math.abs(m)); ctx.fillStyle = waterFill(p, d); ctx.fill(); if (m === 4 && d < patFar) floorPattern(p, d);
    if (sg === G.segs[G.ci]) { const n = Math.abs(m), pts = []; for (let i = 0; i < n; i++) pts.push(SCR[i * 2], SCR[i * 2 + 1]); (wPolys || (wPolys = [])).push(pts); } }
  if (wPolys) { // the sun's glitter only on this stretch's own water
    ctx.save(); ctx.beginPath(); for (const pts of wPolys) { ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); } ctx.clip(); waterGlitter(sg); ctx.restore(); }
  for (const [d, p] of DRAW) { if (isW(p)) continue; const m = project(p.v); if (!m) continue; if (p.dec) { if (m === 4) decalDraw(p, d); else clippedPattern(p, () => decalDraw(p, d)); continue; } pathPoly(Math.abs(m)); ctx.fillStyle = fogged(p.c, 1, d); ctx.fill(); if (!lowQ || d < 14) { floorTexture(p, d, m, sg); project(p.v); } if (m === 4 && d < patFar) floorPattern(p, d); else if (m < 0) clippedPattern(p, () => floorPattern(p, d)); }
  pm('floor'); streetShade(sg);
  objShadows(sg);
  if (isCur) drawShadows(sg); pm('shade');
  // walls, ceilings, decorations
  DRAW.length = 0;
  for (const w of sg.walls) { if (!faceVisible(w)) continue; const d = depthOf(w.v); if (!near(d)) continue; DRAW.push([d, 1, w]); }
  for (const e of sg.decos) { if (!faceVisible(e)) continue; const d = depthOf(e.v); if (d < -5 || d > 90) continue; DRAW.push([d - 1.6, 2, e]); } // a decoration sits on a 3 m wall piece whose centre can be nearer than its own: drawn after the walls around it
  DRAW.sort((a, b) => b[0] - a[0]);
  for (const [d, t, w] of DRAW) {
    if (oc && occAt(d - 2) !== Infinity) { occDraw(d - 2, () => drawWallItem(d, t, w)); continue; }
    drawWallItem(d, t, w);
  }
  pm('walls');
  for (const l of sg.lines) drawLine(sg, l); pm('lines');
  drawObjects(sg, isCur, oc);
}
function drawWallItem(d, t, w) {
  { const m = project(w.v); if (!m) return;
    if (t === 1) {
      pathPoly(Math.abs(m));
      if (w.glass) { ctx.fillStyle = `rgba(200,225,240,${w.ceil ? .12 : .16})`; ctx.fill(); if (m === 4) glassFrame(w); return; }
      if (w.skKey !== SUNKEY2) { w.skKey = SUNKEY2; w.sk = w.n && !w.ceil ? sunK(w.n3 || w.n) : 1; }
      ctx.fillStyle = fogged(w.c, w.sh * w.sk, d); ctx.fill();
      if (m === 4 && w.pat) wallPattern(w, d);
      else if (m < 0 && w.pat) { if (w.pat === 'fac' && w.fv != null) drawFacadeTex(w, d); else if (w.pat !== 'ceil' || w.cp) clippedPattern(w, () => wallPattern(w, d)); }
    } else { const f = DECO_DRAW[w.pat]; if (!f) return; ctx.globalAlpha = 1 - fogK(d); if (m === 4) f(w, d); else clippedPattern(w, () => f(w, d)); ctx.globalAlpha = 1; }
  }
}
const obstacleHintQ = [];
function drawObjects(sg, isCur, oc) {
  obstacleHintQ.length = 0;
  // objects
  DRAW.length = 0;
  for (const o of sg.obs) {
    if (o.dead > .9) continue;
    const mid = segPos(sg, (o.s0 + o.s1) / 2 + (o.ds || 0) + (o.dead ? o.dead * 6 + 3 : 0), (o.l0 + o.l1) / 2);
    const d = (mid[0] - CAM.x) * CAM.s + (mid[1] - CAM.z) * CAM.c; if (d < -3 || d > FAR) continue;
    DRAW.push([d, 3, o]);
  }
  if (sg.movers) for (const m of sg.movers) { const mid = m.cross ? segPos(sg, (m.bx[0].s0 + m.bx[0].s1) / 2, (m.bx[0].l0 + m.bx[0].l1) / 2 + (m.dl || 0)) : segPos(sg, m.ds + 20, (m.bx[0].l0 + m.bx[0].l1) / 2); const d = (mid[0] - CAM.x) * CAM.s + (mid[1] - CAM.z) * CAM.c; if (d > -20 && d < FAR) DRAW.push([d, 8, m]); }
  for (const p of sg.props) { if (p.nodraw) continue; const mid = segPos(sg, (p.s0 + p.s1) / 2, (p.l0 + p.l1) / 2); const d = (mid[0] - CAM.x) * CAM.s + (mid[1] - CAM.z) * CAM.c; if (d < -3 || d > (p.big ? FAR : 85)) continue; DRAW.push([d, 6, p]); }
  for (const s of sg.spr) { if (s.night && LT.night < .3) continue; if (s.img === 'glow' && LT.night < .3 && !LT.indoor) continue; const p = segPos(sg, s.s, s.lat); const d = (p[0] - CAM.x) * CAM.s + (p[1] - CAM.z) * CAM.c; if (d < .5 || d > (s.far ? FAR : 80)) continue; DRAW.push([d, 7, s]); }
  if (isCur || G.turnT > 0) for (const it of sg.items) {
    if (it.got || (isCur && it.s < G.s - .6)) continue;
    const p = segPos(sg, it.s, it.lat); const d = (p[0] - CAM.x) * CAM.s + (p[1] - CAM.z) * CAM.c; if (d < .5 || d > 75) continue;
    DRAW.push([d, 4, it]);
  }
  if (isCur && G.player.show) { DRAW.push([G.player.depth, 5, G.player]); if (G.follow.show) DRAW.push([G.follow.depth, 5, G.follow]); if ((G.pom.on || G.pom.title) && G.pom.show) DRAW.push([G.pom.depth, 5, G.pom]); if (G.pomPeek && G.pomPeek.seg === sg && G.pomPeek.b.show) DRAW.push([G.pomPeek.b.depth, 5, G.pomPeek.b]); }
  DRAW.sort((a, b) => b[0] - a[0]);
  pm('sort');
  for (const e of DRAW) {
    if (oc && e[1] !== 5 && occAt(e[0]) !== Infinity) { occDraw(e[0], () => drawObj(e, sg)); continue; }
    drawObj(e, sg);
  }
}
function drawObj(e, sg) {
  {
    if (e[1] === 3) { drawObstacle(e[2], sg, e[0]); pm('obs'); }
    else if (e[1] === 6) { const p = e[2]; if (!p.fc) { p.fc = []; for (const b of p.bx) for (const fc of boxFaces(sg, b, 0, 0, 0)) p.fc.push([fc, b]); } drawBoxes(null, sg, e[0], 1, 0, 0, 0, p.fc); pm('props'); }
    else if (e[1] === 7) { drawSpr(e[2], sg, e[0]); pm('spr'); }
    else if (e[1] === 8) drawBoxes(e[2].bx, sg, e[0], 1, e[2].cross ? 0 : e[2].ds, e[2].cross ? e[2].dl || 0 : 0, 0);
    else if (e[1] === 4) { drawItem(e[2], sg, e[0]); pm('items'); }
    else { drawBunnyWorld(e[2]); pm('bunny'); }
  }
}
/* a small chip over an obstacle type you have not met a few times yet: what to do with it */
const HINT_K = { low: ['↑', '#3FA34D', 'jump'], high: ['↓', '#3A73C2', 'slide'], block: ['←→', '#D0453A', 'dodge'] };
function obstacleHint(o, sg, d) {
  if (o.dead || o.k === 'deco' || d < 5 || d > 34 || G.mode !== 'play') return; const kk = HINT_K[o.k]; if (!kk) return;
  SV.obsKnow = SV.obsKnow || {}; const key = o.type + (o.type === 'crate' ? o.k : '');
  if (!o.hinted) { if ((SV.obsKnow[key] || 0) >= 3) return; o.hinted = 1; SV.obsKnow[key] = (SV.obsKnow[key] || 0) + 1; }
  const mid = (o.l0 + o.l1) / 2, s = (o.s0 + o.s1) / 2 + (o.ds || 0), p = segPos(sg, s, o.full ? LANES[G.lane] : mid), sp = spriteAt(p[0], p[2] + Math.min(o.top || 1, 2.6) + .55, p[1]); if (!sp) return;
  const a = clamp((34 - d) / 6, 0, 1) * clamp((d - 5) / 3, 0, 1), r = clamp(sp.k * .26, 11, 22);
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = kk[1]; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(sp.sx, sp.sy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFFFFF'; ctx.font = `900 ${Math.round(r * (kk[0].length > 1 ? .9 : 1.25))}px "Zen Maru Gothic",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(kk[0], sp.sx, sp.sy + 1);
  ctx.font = `900 ${Math.round(r * .62)}px "Zen Maru Gothic",sans-serif`; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(30,25,20,.7)'; const w = lab(kk[2] === 'jump' ? 'JUMP' : kk[2] === 'slide' ? 'SLIDE' : 'DODGE');
  ctx.strokeText(w, sp.sx, sp.sy + r + 10); ctx.fillText(w, sp.sx, sp.sy + r + 10); ctx.restore();
}
function drawObstacle(o, sg, d) {
  obstacleHintQ.push([o, sg, d]);
  if (o.art && drawArt(o, sg, d)) return; // the illustrations are one image each: cheaper than boxes, so always used
  if (!o.mv && !o.dead) { if (!o.fc) { o.fc = []; for (const b of o.bx) for (const fc of boxFaces(sg, b, 0, 0, 0)) o.fc.push([fc, b]); } drawBoxes(null, sg, d, 1, 0, 0, 0, o.fc); return; }
  const lift = o.dead ? o.dead * o.dead * 9 : 0, side = o.dead ? o.dead * 7 * (o.vx || 1) : 0;
  drawBoxes(o.bx, sg, d, o.dead ? clamp(1 - o.dead * 1.2, 0, 1) : 1, (o.ds || 0) + (o.dead ? o.dead * 6 : 0), side, lift);
}
function drawLine(sg, l) {
  const a = segPos(sg, l.a[0], l.a[1]), b = segPos(sg, l.b[0], l.b[1]);
  tc(a[0], l.a[2] + a[2], a[1], TMP, 0); tc(b[0], l.b[2] + b[2], b[1], TMP, 3);
  let z0 = TMP[2], z1 = TMP[5]; if (z0 < NEAR && z1 < NEAR) return; if (z0 > 95 && z1 > 95) return;
  let x0 = TMP[0], y0 = TMP[1], x1 = TMP[3], y1 = TMP[4];
  if (z0 < NEAR) { const t = (NEAR - z0) / (z1 - z0); x0 += (x1 - x0) * t; y0 += (y1 - y0) * t; z0 = NEAR; }
  if (z1 < NEAR) { const t = (NEAR - z1) / (z0 - z1); x1 += (x0 - x1) * t; y1 += (y0 - y1) * t; z1 = NEAR; }
  const zm = (z0 + z1) / 2, glow = l.glowN && LT.night > .4;
  ctx.strokeStyle = glow ? '#FFF6E0' : fogged(C(l.c), 1, zm); ctx.lineWidth = Math.max(.7, l.w * FOCAL / zm); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(W / 2 + x0 * FOCAL / z0, HORIZON - y0 * FOCAL / z0); ctx.lineTo(W / 2 + x1 * FOCAL / z1, HORIZON - y1 * FOCAL / z1); ctx.stroke();
}
function drawSpr(s, sg, d) {
  const p = segPos(sg, s.s, s.lat), sp = spriteAt(p[0], s.y + p[2], p[1]); if (!sp) return;
  const nm = s.pn && LT.night > .35 && SPR[s.img + 'N'] ? s.img + 'N' : LT.night > .35 && (s.img === 'canopy_illum' || (s.nv && SPR[s.img + 'N'])) ? (s.img === 'canopy_illum' ? 'canopy_illumN' : s.img + 'N') : s.img === 'canopy_illum' ? 'canopy_green' : s.img;
  const nm2 = s.walk ? s.imgs[((G.t * 5 + s.ph) | 0) % 2] : nm;
  let img = SPR[nm2] || (SPR_PEND[nm2] && d < 45 ? sprPaint(nm2) : null); if (!img || !img.width) return;
  if (!s.glow && s.img !== 'glow' && nm === s.img) img = litSprite(img, LT.amb); // trees and signs darken with the evening light
  const w = s.w * sp.k, h = s.h * sp.k;
  ctx.globalAlpha = 1 - fogK(d) * .9;
  if (s.nv && d < 9) ctx.globalAlpha *= clamp((d - 1.5) / 7.5, 0, 1); // big crowns fade as you pass under them, so the way ahead stays clear
  if (s.img === 'glow') { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= LT.indoor ? .35 : .55 * LT.night; }
  if (s.trunk) { // one piece: a tapered trunk with a little root flare, and the crown sitting on it
    const tw = w * .055, top = sp.sy - h * .52; const gr = ctx.createLinearGradient(sp.sx - tw, 0, sp.sx + tw, 0); gr.addColorStop(0, tint('#4E3A2E')); gr.addColorStop(.4, tint('#7A5E48')); gr.addColorStop(1, tint('#3E2E24'));
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(sp.sx - tw * 1.7, sp.sy); ctx.quadraticCurveTo(sp.sx - tw, sp.sy - h * .04, sp.sx - tw, sp.sy - h * .1); ctx.lineTo(sp.sx - tw * .55, top); ctx.lineTo(sp.sx + tw * .55, top); ctx.lineTo(sp.sx + tw, sp.sy - h * .1); ctx.quadraticCurveTo(sp.sx + tw, sp.sy - h * .04, sp.sx + tw * 1.7, sp.sy); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = tint('#5A4436'); ctx.lineWidth = Math.max(1, tw * .5); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sp.sx, top + h * .08); ctx.lineTo(sp.sx - w * .14, top - h * .05); ctx.moveTo(sp.sx + tw * .2, top + h * .04); ctx.lineTo(sp.sx + w * .16, top - h * .08); ctx.stroke();
    ctx.drawImage(img, sp.sx - w / 2, sp.sy - h, w, h * .74); }
  else ctx.drawImage(img, sp.sx - w / 2, sp.sy - h, w, h);
  if (!s.glow && s.img !== 'glow' && LT.amb[0] < .95) { ctx.globalCompositeOperation = 'source-atop'; }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
function drawItem(it, sg, d) {
  const p = segPos(sg, it.s, it.lat); const sp = spriteAt(p[0], p[2] + it.y + Math.sin(G.t * 3 + it.ph) * .06, p[1]); if (!sp) return;
  const def = ITEMS[it.type]; const isPow = def.kind === 'power' || def.kind === 'stamp' || def.kind === 'pom', bad = def.kind === 'bad';
  const size = (it.type === 'hay' ? .62 : isPow ? .82 : .6) * sp.k;
  const spin = it.type === 'hay' || it.type === 'goldhay' || isPow ? .72 + .28 * Math.cos(G.t * 3.2 + it.ph) : 1;
  ctx.globalAlpha = 1 - fogK(d) * .9;
  if (isPow || it.type === 'goldhay') { ctx.beginPath(); ctx.fillStyle = def.kind === 'stamp' ? 'rgba(255,120,110,.45)' : 'rgba(255,236,150,.5)'; ctx.arc(sp.sx, sp.sy, size * .62 * (1 + .08 * Math.sin(G.t * 6)), 0, Math.PI * 2); ctx.fill(); }
  const img = def.kind === 'stamp' ? stampSprite(sg.tid) : SPR[bad ? it.type + 'NG' : it.type];
  ctx.drawImage(img, sp.sx - size * spin / 2, sp.sy - size / 2, size * spin, size);
  ctx.globalAlpha = 1;
}
// soft contact shadows under obstacles and furniture
function objShadows(sg) {
  ctx.fillStyle = 'rgba(30,22,16,.16)';
  const one = (s0, s1, l0, l1) => {
    const p = segPos(sg, (s0 + s1) / 2, (l0 + l1) / 2), sp = spriteAt(p[0], p[2], p[1]); if (!sp || sp.z > 55) return;
    const rx = Math.min(3, (l1 - l0) / 2 + .15) * sp.k, ry = Math.min(2, (s1 - s0) / 2 + .1) * sp.k * .35;
    ctx.beginPath(); ctx.ellipse(sp.sx, sp.sy, rx, Math.max(1, ry), 0, 0, Math.PI * 2); ctx.fill();
  };
  for (const o of sg.obs) if (!o.dead && !o.full && o.k !== 'high' && o.top < 3.5) one(o.s0 + (o.ds || 0), o.s1 + (o.ds || 0), o.l0, o.l1);
  for (const p of sg.props) if (!p.big && p.bx[0] && p.bx[0].y0 <= .05) one(p.s0, p.s1, p.l0, p.l1);
  for (const q of sg.spr) if (q.gnd) one(q.s - .3, q.s + .3, q.lat - q.gnd, q.lat + q.gnd);
  // at night, street lamps and paper lanterns throw warm pools of light on the ground
  if (LT.night > .3 && !LT.indoor) {
    ctx.globalCompositeOperation = 'lighter';
    for (const p of sg.props) { const lb = p.lamp; if (!lb) continue;
      const q = segPos(sg, (p.s0 + p.s1) / 2, (p.l0 + p.l1) / 2), sp = spriteAt(q[0], q[2], q[1]); if (!sp || sp.z > 70) continue;
      const R = (lb.y1 > 3 ? 2.6 : 1.5) * sp.k; if (R < 3) continue; const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, `rgba(255,200,120,${(.22 * LT.night).toFixed(3)})`); g.addColorStop(.5, `rgba(255,200,120,${(.08 * LT.night).toFixed(3)})`); g.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.save(); ctx.translate(sp.sx, sp.sy); ctx.scale(R, R * .38); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    ctx.globalCompositeOperation = 'source-over';
  }
}
function drawShadows(seg) {
  ctx.fillStyle = 'rgba(30,22,16,.22)';
  const sh = (s, lat, r, a) => { const p = segPos(seg, s, lat); const sp = spriteAt(p[0], p[2], p[1]); if (!sp) return; ctx.globalAlpha = a; ctx.beginPath(); ctx.ellipse(sp.sx, sp.sy, r * sp.k, r * sp.k * .3, 0, 0, Math.PI * 2); ctx.fill(); };
  if (G.player.show && G.mode !== 'title') { sh(G.s, G.lat, .55, clamp(1 - G.y * .3, .25, 1)); if (G.follow.show) sh(G.s - G.follow.back, G.follow.lat, .46, .8); if (G.pom.on && G.pom.show) sh(G.s - G.pom.back, G.pom.lat, G.pom.who === 'pom' ? .32 : .46, .75); }
  ctx.globalAlpha = 1;
}
function drawBunnyWorld(b) {
  const sp = spriteAt(b.wx, b.wy, b.wz); if (!sp) return;
  const sc = sp.k * (b.who === 'ren' ? 1.18 : b.who === 'pom' ? .72 * (b.big || 1) : 1.0) / 240;
  let pose;
  if (b.view === 'front') pose = 'front_' + (b.mood || 'open');
  else if (b.look > 0) pose = 'look_' + (b.mood || 'happy');
  else if (b.slide) pose = 'slide'; else if (b.air) pose = 'air';
  else pose = 'run' + (((b.ph / (Math.PI * 2)) * RUN_FRAMES | 0) % RUN_FRAMES + RUN_FRAMES) % RUN_FRAMES;
  const img = bunFrame(b.who, pose, SV.mugOn);
  ctx.save(); ctx.translate(sp.sx, sp.sy); ctx.scale(sc, sc);
  if (b.tilt) ctx.rotate(b.tilt);
  if (b.who === 'pom' && b.air && !b.fly && b.vy != null) { ctx.translate(0, -140); ctx.rotate(-(1 - clamp((b.vy + JUMPV) / (2 * JUMPV), 0, 1)) * Math.PI * 2); ctx.translate(0, 140); } // Pom flips on every jump
  if (b.who === 'pom' && b.slide) { ctx.translate(0, -110); ctx.rotate((G.t * 14) % (Math.PI * 2)); ctx.translate(0, 110); } // and rolls under things
  if (b.look > 0 && b.mood === 'sick') ctx.rotate(Math.sin(G.t * 7) * .07);
  if (b.look > 0 && b.mood === 'worry') { ctx.translate(0, -Math.abs(Math.sin(G.t * 9)) * 14); ctx.rotate(Math.sin(G.t * 9) * .05); }
  if (b.fly && b.who === 'pom') ctx.translate(0, Math.sin(G.t * 5) * 6);
  if (b.flash && Math.floor(G.t * 16) % 2) ctx.globalAlpha = .45;
  ctx.drawImage(LT.indoor ? img : litSprite(img, LT.amb.map((x, i) => Math.max(i === 2 ? .55 : .5, x + (1 - x) * .45)), 1, 1), -BS / 2, -GROUND_Y - BTOP, img.width, img.height);
  if (b.fly) { const pw = b.who === 'pom' ? 380 : 420, ph = pw * .4, yb = b.who === 'pom' ? -16 : -36; ctx.globalAlpha = 1; ctx.drawImage(b.view === 'back' || !(b.look > 0) ? SPR.planeBack : SPR.planeBack, -pw / 2, yb - ph * .42, pw, ph); } // drawn over the lower body: they sit in the plane, not on air (Pom rides his own)
  if (b.glow) { ctx.globalAlpha = .9; ctx.strokeStyle = b.glow; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(0, -110, 130, 120, 0, 0, Math.PI * 2); ctx.stroke(); }
  if (!(b.look > 0) && b.who !== 'pom') b.say = '';
  if (b.look > 0 && b.mood === 'sick') { ctx.globalAlpha = Math.min(1, b.look * 3); ctx.strokeStyle = '#7C8FC4'; ctx.lineWidth = 6; ctx.lineCap = 'round'; // a woozy swirl over the head
    for (let k = 0; k < 3; k++) { const a = G.t * 5 + k * 2.1; ctx.beginPath(); ctx.arc(Math.cos(a) * 60, -265 + Math.sin(a) * 16, 9, 0, Math.PI * 2); ctx.stroke(); } }
  else if (b.look > 0 && b.mood === 'worry') { ctx.globalAlpha = Math.min(1, b.look * 3); ctx.fillStyle = '#FBF6EE'; ctx.strokeStyle = '#C8463C'; ctx.lineWidth = 8; ctx.font = '900 92px "Zen Maru Gothic",sans-serif'; ctx.textAlign = 'center';
    const y = -250 - Math.abs(Math.sin(G.t * 9)) * 16; ctx.strokeText('!?', 110, y); ctx.fillStyle = '#C8463C'; ctx.fillText('!?', 110, y);
 }
  else if (b.look > 0) { ctx.globalAlpha = Math.min(1, b.look * 3); ctx.fillStyle = '#E86A75'; heart(ctx, 120, -250 - (1 - b.look) * 40, 22); ctx.fillStyle = '#F2C230'; star(ctx, -130, -230 - (1 - b.look) * 30, 18); }
  ctx.restore();
  if (b.say && b.look > 0) { // a speech bubble in screen space, kept on screen
    ctx.save(); ctx.globalAlpha = Math.min(1, b.look * 3); ctx.font = '900 15px "Zen Maru Gothic","Hiragino Sans",sans-serif';
    const tw = ctx.measureText(b.say).width, bw = tw + 22, bh = 30, tipX = sp.sx, bx = clamp(sp.sx - bw / 2, 8, W - bw - 8), by = Math.max(70, sp.sy - 230 * sc - bh - 16);
    ctx.fillStyle = 'rgba(255,252,246,.97)'; ctx.strokeStyle = '#3B2A20'; ctx.lineWidth = 2; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 14); else ctx.rect(bx, by, bw, bh); ctx.fill(); ctx.stroke();
    const tx = clamp(tipX, bx + 14, bx + bw - 14); ctx.beginPath(); ctx.moveTo(tx - 6, by + bh - 1); ctx.lineTo(tx, by + bh + 9); ctx.lineTo(tx + 6, by + bh - 1); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillRect(tx - 5, by + bh - 3, 10, 3);
    ctx.fillStyle = '#3B2A20'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.say, bx + bw / 2, by + bh / 2 + 1); ctx.restore(); }
}
function heart(g, x, y, r) { g.beginPath(); g.moveTo(x, y + r * .9); g.bezierCurveTo(x - r * 1.6, y - r * .2, x - r * .6, y - r * 1.3, x, y - r * .4); g.bezierCurveTo(x + r * .6, y - r * 1.3, x + r * 1.6, y - r * .2, x, y + r * .9); g.fill(); }

/* ================= screen-space effects ================= */
const FX = [];
function burst(x, y, color, n) { for (let i = 0; i < n; i++) FX.push({ x, y, vx: rand(-160, 160), vy: rand(-260, -60), life: rand(.35, .7), t: 0, c: color, r: rand(2, 5) }); }
function floatText(x, y, txt, color) { FX.push({ x, y, vx: 0, vy: -60, life: .9, t: 0, txt, c: color }); }
let paper = [];
// the title room's morning: sunlight through the shoji falls across the tatami, dust drifts in it, the mug steams, the boss snores
function titleFX() {
  const seg = G.segs[0]; if (!seg || !seg.titleWins) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const w of seg.titleWins) { // a shaft from the window's top edge to a patch of floor well into the room
    const a = segPos(seg, w.s0, w.sd * (HW - .05)), b = segPos(seg, w.s1, w.sd * (HW - .05)), c = segPos(seg, w.s1 + 1.0, w.sd * (HW - 2.6)), d = segPos(seg, w.s0 + 1.0, w.sd * (HW - 2.6));
    const pts = [[a[0], a[2] + 2.55, a[1]], [b[0], b[2] + 2.55, b[1]], [c[0], c[2] + .01, c[1]], [d[0], d[2] + .01, d[1]]]; const v = []; for (const q of pts) v.push(q[0], q[1], q[2]);
    const m = project(v); if (!m) continue; const n = Math.abs(m); let y0 = 1e9, y1 = -1e9; for (let i = 0; i < n; i++) { y0 = Math.min(y0, SCR[i * 2 + 1]); y1 = Math.max(y1, SCR[i * 2 + 1]); }
    const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(255,236,190,.10)'); g.addColorStop(1, 'rgba(255,236,190,.02)'); pathPoly(n); ctx.fillStyle = g; ctx.fill();
    // the patch of light on the floor
    const f = []; for (const q of [[w.s0 + .3, w.sd * (HW - .2)], [w.s1 + .3, w.sd * (HW - .2)], [w.s1 + 1.0, w.sd * (HW - 2.5)], [w.s0 + 1.0, w.sd * (HW - 2.5)]]) { const p = segPos(seg, q[0], q[1]); f.push(p[0], p[2] + .012, p[1]); }
    const m2 = project(f); if (m2) { pathPoly(Math.abs(m2)); ctx.fillStyle = 'rgba(255,236,190,.09)'; ctx.fill(); }
    // dust in the beam
    const r = rnd(w.s0 * 31 + 7); for (let i = 0; i < 22; i++) { const u = r(), vv = r(), ph = r() * 6.3, sp = .3 + r() * .5; const t = (G.t * sp * .08 + u) % 1, s = w.s0 + (w.s1 - w.s0) * ((vv + Math.sin(G.t * .5 + ph) * .05 + 1) % 1), lat = w.sd * (HW - .2 - 3.3 * t), y = 2.5 - 2.4 * t + Math.sin(G.t * .9 + ph) * .06;
      const p = segPos(seg, s, lat), q = spriteAt(p[0], y + p[2], p[1]); if (!q) continue; ctx.fillStyle = `rgba(255,245,215,${(.25 + .25 * Math.sin(G.t * 2 + ph)).toFixed(2)})`; ctx.beginPath(); ctx.arc(q.sx, q.sy, Math.max(.8, q.k * .012), 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
  { // steam from the mug on the low table
    const base = segPos(seg, 2.4, -2.18); for (let i = 0; i < 4; i++) { const t = (G.t * .35 + i * .25) % 1, q = spriteAt(base[0] + Math.sin(G.t * 1.3 + i) * .05 * t, .6 + t * .45 + base[2], base[1]); if (!q) continue; ctx.fillStyle = `rgba(255,255,255,${(.35 * (1 - t)).toFixed(2)})`; ctx.beginPath(); ctx.arc(q.sx, q.sy, q.k * (.03 + t * .05), 0, Math.PI * 2); ctx.fill(); } }
  { // Ren's "Zz" when he dozes
    const tt = G.t % 9; if (tt > 7.2) { const b = G.player.who === 'ren' ? G.player : G.follow, q = spriteAt(b.wx, b.wy + 1.25, b.wz); if (q) { const k = (tt - 7.2) / 1.8; ctx.font = `900 ${Math.round(q.k * .11)}px "Zen Maru Gothic",sans-serif`; ctx.fillStyle = `rgba(90,110,180,${(.9 * (1 - k)).toFixed(2)})`; ctx.textAlign = 'center'; ctx.fillText('Zz', q.sx + q.k * .35 + k * 12, q.sy - k * 30); ctx.font = `900 ${Math.round(q.k * .07)}px "Zen Maru Gothic",sans-serif`; ctx.fillText('z', q.sx + q.k * .22 + k * 6, q.sy - k * 12 + 8); } } }
}
function drawFX() {
  const dt = G.dtFX || .016;
  if (G.mode === 'title') titleFX();
  const near = G.chaseVis;
  if (near > .01) {
    const h = H * .2 * near;
    if (paper.length < 46) paper.push({ x: Math.random() * W, y: H + 20, vx: rand(-40, 40), vy: rand(-260, -120), r: rand(0, 6), vr: rand(-4, 4), w: rand(20, 38) });
    ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = 'rgba(59,42,32,.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 24) ctx.lineTo(x, H - h + Math.sin(x * .05 + G.t * 9) * 10 * near); ctx.lineTo(W, H); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(59,42,32,.18)'; ctx.beginPath(); for (let k = 1; k < 4; k++) { const yy = H - h * (k / 4); ctx.moveTo(0, yy); ctx.lineTo(W, yy + Math.sin(G.t * 5 + k) * 4); } ctx.stroke();
    for (const p of paper) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; p.r += p.vr * dt;
      if (p.y > H + 40) { p.y = H - rand(0, h * .5); p.x = Math.random() * W; p.vy = rand(-330, -160) * near; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-p.w / 2, -p.w * .65, p.w, p.w * 1.3); ctx.strokeStyle = 'rgba(59,42,32,.3)'; ctx.strokeRect(-p.w / 2, -p.w * .65, p.w, p.w * 1.3);
      ctx.fillStyle = 'rgba(59,42,32,.25)'; for (let k = 0; k < 4; k++) ctx.fillRect(-p.w * .35, -p.w * .45 + k * p.w * .22, p.w * .7, 2); ctx.restore(); }
  } else paper.length = 0;
  for (let i = FX.length - 1; i >= 0; i--) {
    const p = FX[i]; p.t += dt; if (p.t > p.life) { FX.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; if (!p.txt) p.vy += 600 * dt;
    ctx.globalAlpha = 1 - p.t / p.life;
    if (p.txt) { ctx.font = '900 15px "Zen Maru Gothic",sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(59,42,32,.85)'; ctx.strokeText(p.txt, p.x, p.y); ctx.fillStyle = p.c; ctx.fillText(p.txt, p.x, p.y); }
    else { ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  if (G.mode === 'play' && !OPT().calm && (G.pow.dash > 0 || G.fever > 0 || G.pow.fly > 0)) {
    ctx.strokeStyle = G.fever > 0 ? 'rgba(242,194,48,.55)' : 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; ctx.beginPath();
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2 + G.t * .5, r0 = Math.min(W, H) * (.32 + ((G.t * 3 + k * .37) % 1) * .5); ctx.moveTo(W / 2 + Math.cos(a) * r0, HORIZON + Math.sin(a) * r0 * .8); ctx.lineTo(W / 2 + Math.cos(a) * (r0 + 40), HORIZON + Math.sin(a) * (r0 + 40) * .8); }
    ctx.stroke();
  }
  if (G.flashT > 0) { ctx.fillStyle = `rgba(200,70,60,${G.flashT * .45})`; ctx.fillRect(0, 0, W, H); }
}
const WX = [];
function drawWeather(seg) {
  const dt = G.dtFX || .016, k = seg.th.kind;
  if (k === 'room' || k === 'train' || k === 'glass') { WX.length = 0; return; }
  const type = seg.th.petals ? 'petal' : seg.th.leaves ? 'leaf' : G.weather;
  if (type === 'clear') { WX.length = 0; return; }
  const n = type === 'rain' ? 110 : type === 'snow' ? 70 : type === 'petal' ? 46 : 34;
  while (WX.length < n) WX.push({ x: Math.random() * W, y: Math.random() * H, v: rand(.6, 1.2), r: Math.random() * 6 });
  ctx.save();
  for (const p of WX) {
    if (type === 'rain') { p.y += 900 * p.v * dt; p.x -= 80 * dt; ctx.strokeStyle = 'rgba(220,230,240,.45)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 4, p.y + 16); ctx.stroke(); }
    else if (type === 'snow') { p.y += 70 * p.v * dt; p.x += Math.sin(G.t + p.r) * 20 * dt; ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.5 + p.v * 1.5, 0, Math.PI * 2); ctx.fill(); }
    else if (type === 'petal') { // cherry petals: small notched ovals that tumble and drift sideways
      p.y += 38 * p.v * dt; p.x += (Math.sin(G.t * 1.2 + p.r * 3) * 30 - 18) * dt; p.r += dt * (1.5 + p.v); const sc = Math.cos(p.r * 1.7);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, .35 + Math.abs(sc) * .65); ctx.fillStyle = p.v > 1 ? '#FBE6EC' : '#F4C7D4'; ctx.globalAlpha = .92;
      const z = 3 + p.v * 3; ctx.beginPath(); ctx.moveTo(0, -z); ctx.quadraticCurveTo(z * 1.1, -z * .2, 0, z); ctx.quadraticCurveTo(-z * 1.1, -z * .2, 0, -z); ctx.fill(); ctx.restore(); }
    else { p.y += 60 * p.v * dt; p.x += Math.sin(G.t * 1.5 + p.r) * 40 * dt; p.r += dt * 2; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.v > .9 ? '#F2CD45' : '#E8B923'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 7, -Math.PI * .9, -Math.PI * .1); ctx.closePath(); ctx.fill(); ctx.restore(); }
    if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
  }
  ctx.restore();
}
