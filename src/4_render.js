/* ================= tiny 3D renderer on Canvas 2D ================= */
const cv = $('#cv'), ctx = cv.getContext('2d', { alpha: false }) || cv.getContext('2d'); /* 透けない画面として描く（ブラウザが重ね合わせを省けるので軽い） */
/* [遠く A1] 線の太さの倍率（ふだんは 1）。遠くの小さな飾りを描く間だけ 1 より小さくする */
let LWK = 1; { const LWD = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'lineWidth'); if (LWD && LWD.set) try { Object.defineProperty(ctx, 'lineWidth', { configurable: true, get() { return LWD.get.call(this) / LWK; }, set(v) { LWD.set.call(this, LWK === 1 ? v : v * LWK); } }); } catch (e) { } }
/* 絵の保存（save）の深さを数える：だれか 1 人の絵を描く途中で失敗しても、そこまでの save を戻して、ほかの人は描く（2026-11-15：紙飛行機の絵の失敗で、仲間まで消えた） */
let CTXD = 0; { const sv0 = ctx.save.bind(ctx), rs0 = ctx.restore.bind(ctx); ctx.save = () => { CTXD++; sv0(); }; ctx.restore = () => { if (CTXD > 0) CTXD--; rs0(); }; }
let W = 0, H = 0, DPR = 1, FOCAL = 400, BASEF = 400, HORIZON = 0;
/* 画質（2026-11-15）：設定「画質」＝ 自動（上限 1.75 倍）／きれい（上限 2 倍・軽くするのは本当に重いときだけ）／軽い（1 倍・演出も少なめ）。
   自動で重いときは、まず細かさ（RES_K）を1段ずつ下げる。演出を減らす（lowQ）のはその後。軽くなったら細かさは戻す */
let RES_K = 1;
function gfxMode() { try { const g = OPT().gfx; return g === 'high' || g === 'low' ? g : 'auto'; } catch (e) { return 'auto'; } }
function dprWant() { const dev = window.devicePixelRatio || 1, g = gfxMode(); const home = typeof G !== 'undefined' && G.mode === 'title'; if (home && g !== 'low') return Math.max(1, Math.min(dev, 3)); /* [H84] 2026-11-23 オーナー「上がぼやけてる」：ホーム画面（止まった部屋）は、走っている間に重くて細かさを下げた後（lowQ・RES_K）でも、画面の細かさのまま描く（前は走った後に 1 倍や 1.4 倍になり、天井の板の線がにじんでいた） */ if (g === 'low' || (typeof lowQ !== 'undefined' && lowQ)) return 1; return Math.max(1, Math.min(dev, g === 'high' || home ? 2 : 1.75) * RES_K); } /* [H34] 2026-11-21 オーナー「上の方がボヤけている」：ホーム画面（止まった部屋の絵）は、走る時より細かく描く（iPhone の 3 倍の画面で 1.75 倍だと、天井や障子の細い線がぼやけた） */
function resize() {
  DPR = dprWant();
  W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); smoothOn();
  FOCAL = BASEF = Math.min(W * 1.12, H * .84);
  try { G.drawNow = 1; } catch (e) { } /* 大きさを変えると絵が消えるので、止まっている画面でもすぐ描き直す */
  HORIZON = H * (H / W > 1.6 ? .45 : .41); // tall phones: the road ahead sits lower, clear of the bars at the top (2026-11-14 「スマホだと奥が見づらい」); the empty floor at the bottom gets smaller
}
function smoothOn() { try { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = gfxMode() === 'high' ? 'high' : 'low'; } catch (e) { } } /* 絵を縮めて描くときの質。設定「画質：きれい」のときだけ上げる（端末によっては重くなるので、自動では今までどおり）。画面の大きさを変えると初期値に戻るので、そのたびに入れ直す */
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
  BOK = m === 4 && !behind; if (BOK) for (let i = 0; i < 12; i++) BCAM[i] = src[i]; /* 4 すみのカメラから見た位置（bil が遠近どおりに貼るため） */
  if (maxx < 0 || minx > W || maxy < 0 || miny > H) return 0;
  return behind ? -m : m;
}
// 面の一番奥の点の奥行き（長い建物の真ん中を通りすぎると、まだ見えている前のほうごと消えていた：2026-11-09 の報告。消すかどうかはこちらで決める）
function depthMax(v) { let d = -1e9; const n = v.length / 3; for (let i = 0; i < n; i++) { const q = (v[i * 3] - CAM.x) * CAM.s + (v[i * 3 + 2] - CAM.z) * CAM.c; if (q > d) d = q; } return d; }
function depthOf(v) { let d = 0; const n = v.length / 3; for (let i = 0; i < n; i++) d += (v[i * 3] - CAM.x) * CAM.s + (v[i * 3 + 2] - CAM.z) * CAM.c; return d / n; }
function pathPoly(m) { ctx.beginPath(); ctx.moveTo(SCR[0], SCR[1]); for (let i = 1; i < m; i++) ctx.lineTo(SCR[i * 2], SCR[i * 2 + 1]); ctx.closePath(); }
let BU0 = 0, BUS = 1; // u remap while a quad that is partly behind the camera is drawn through its visible part
/* [2026-11-19 オーナー「電車の横の壁の絵が、通りすぎると上にぐにゃっと歪む」] 前は画面の上の 4 すみを、そのまま直線でまぜていた（遠近を無視）。
   ななめに見る近い壁ほど、窓や広告が手前へずれ、カメラの横を通る時（壁の一部だけが見える時）は大きく上へゆがんでいた。
   いまは、4 すみのカメラから見た位置をまぜてから画面へ写す（遠近どおり）。4 すみが分からない形の時だけ、前のやり方 */
/* [軽く 3-3] bil の答えは、使い回す 128 個の入れ物に順に入れて返す（前は呼ぶたびに新しい入れ物を作り、1 コマに数千個のごみになっていた。答えはすぐ使うので、128 個先まで上書きされない） */
const BILR = Array.from({ length: 128 }, () => [0, 0]); let BILI = 0;
function bilOut(x, y) { const o = BILR[BILI = (BILI + 1) & 127]; o[0] = x; o[1] = y; return o; }
const BCAM = new Float32Array(12); let BOK = false;
function bil(u, v) { u = (u - BU0) / BUS;
  if (BOK) { const ax = BCAM[0] + (BCAM[3] - BCAM[0]) * u, ay = BCAM[1] + (BCAM[4] - BCAM[1]) * u, az = BCAM[2] + (BCAM[5] - BCAM[2]) * u, bx = BCAM[9] + (BCAM[6] - BCAM[9]) * u, by = BCAM[10] + (BCAM[7] - BCAM[10]) * u, bz = BCAM[11] + (BCAM[8] - BCAM[11]) * u;
    const x = ax + (bx - ax) * v, y = ay + (by - ay) * v, z = az + (bz - az) * v; if (z > NEAR * .5) return bilOut(W / 2 + x * FOCAL / z, HORIZON - y * FOCAL / z); }
  return bilOut(lerp(lerp(SCR[0], SCR[2], u), lerp(SCR[6], SCR[4], u), v), lerp(lerp(SCR[1], SCR[3], u), lerp(SCR[7], SCR[5], u), v)); }
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
/* [遠く A13] しまもよう（横断歩道・スクランブル交差点など）のしまの間かくが、画面で何ドットか。小さすぎる時は、しまをうすくして、まざった色の面にかえる */
function spanUV(du, dv) { const a = bil(.5, .5), ax = a[0], ay = a[1], b = bil(.5 + du, .5 + dv); return Math.hypot(b[0] - ax, b[1] - ay); }
function stripeF(sp) { return LODOFF ? 1 : clamp((sp - 2) / 3, 0, 1); }
function bline(u0, v0, u1, v1) { const a = bil(u0, v0), b = bil(u1, v1); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
function bpathAdd(u0, v0, u1, v1) { const a = bil(u0, v0), b = bil(u1, v0), c = bil(u1, v1), d = bil(u0, v1); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); } /* bquad の、ぬらずに形だけ足す版（同じ色をまとめて 1 回でぬる） */
function bquad(u0, v0, u1, v1, fill) { const a = bil(u0, v0), b = bil(u1, v0), c = bil(u1, v1), d = bil(u0, v1); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
function bpath(u0, v0, u1, v1) { const a = bil(u0, v0), b = bil(u1, v0), c = bil(u1, v1), d = bil(u0, v1); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); }
// text laid onto the current projected quad (affine approximation)
const QVERT = { vert: true }, QFLAT = { vert: false }, QFONT = '900 60px "Zen Maru Gothic","Hiragino Sans",sans-serif', QW = new Map();
/* [字 T2] 看板の小さな字は、前もって小さな絵にしておき、それを貼る（その場で小さく書くと、走るたびに字の形がゆれてチカチカした）。大きく見える近い看板は今までどおり、その場で書く */
const QTEX = new Map(); try { document.fonts && document.fonts.addEventListener('loadingdone', () => { QTEX.clear(); QW.clear(); }); } catch (e) { } /* 字体が読みこまれたら作り直す */
function qtextPaint(g, txt, color, vert) { g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; const chars = [...txt];
  if (vert) { const n = chars.length, sz = Math.min(80, 92 / n * 1); g.font = `900 ${sz * 1.0}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; chars.forEach((ch, i) => { g.save(); g.translate(50, (i + .5) * 100 / n); g.scale(1, (100 / n) / sz * .9); g.fillText(ch, 0, 0); g.restore(); }); }
  else { g.font = QFONT; let w = QW.get(txt); if (w === undefined) { w = g.measureText(txt).width; if (QW.size > 400) QW.clear(); QW.set(txt, w); } g.translate(50, 52); g.scale(Math.min(1.4, 88 / w), 1.25); g.fillText(txt, 0, 0); } }
function qtextTex(txt, color, vert, R) { const k = R + '|' + (vert ? 1 : 0) + '|' + color + '|' + txt; let c = QTEX.get(k); if (c) return c;
  if (QTEX.size > 360) QTEX.clear(); c = document.createElement('canvas'); c.width = c.height = R; const g = c.getContext('2d'); if (!g) return null; g.scale(R / 100, R / 100); qtextPaint(g, txt, color, vert); QTEX.set(k, c); return c; }
function qtext(txt, u0, v0, u1, v1, color, o) {
  o = o || {};
  const tl = bil(u0, v1), tr = bil(u1, v1), bl = bil(u0, v0);
  const ax = tr[0] - tl[0], ay = tr[1] - tl[1], bx = bl[0] - tl[0], by = bl[1] - tl[1], ar = Math.abs(ax * by - ay * bx);
  if (ar < 40) return; // too small to read
  const ga = ctx.globalAlpha, fa = LODOFF ? 1 : clamp((ar - 40) / 80, 0, 1); /* [字 T1] 読める大きさになる所（面積 40〜120）で、うすく出る（前はパッと出た） */
  ctx.save(); ctx.transform(ax / 100, ay / 100, bx / 100, by / 100, tl[0], tl[1]); if (fa < 1) ctx.globalAlpha = ga * fa;
  const big = Math.max(Math.hypot(ax, ay), Math.hypot(bx, by));
  const bd = big * (typeof DPR !== 'undefined' ? DPR : 1), tex = !LODOFF && bd < 120 && typeof color === 'string' ? qtextTex(txt, color, !!o.vert, bd < 14 ? 16 : bd < 28 ? 32 : bd < 60 ? 64 : 128) : null;
  if (tex) ctx.drawImage(tex, 0, 0, 100, 100); else qtextPaint(ctx, txt, color, !!o.vert);
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
  { const nb = LT.night > .5 && !LT.indoor && G.mode !== 'title'; if (nb !== LT.nb) { LT.nb = nb; document.body.classList.toggle('nightband', nb); } } // 夜の外：お知らせの帯を少し明るく（C-27）
  const wet = G.weather === 'rain' && !LT.indoor ? .82 : G.weather === 'snow' && !LT.indoor ? .95 : 1;
  LT.top = G.weather === 'rain' ? mixC(top, [120, 130, 140], .55 * (1 - LT.night * .6)) : top;
  LT.bot = G.weather === 'rain' ? mixC(bot, [170, 176, 182], .5 * (1 - LT.night * .6)) : G.weather === 'snow' ? mixC(bot, [235, 238, 242], .5) : bot;
  LT.amb = LT.indoor ? (LT.night > .4 ? [.96, .9, .8] : [1, .99, .97]) : amb.map(x => x * wet);
  if (seg.th.tid === 'yurakucho') LT.amb = [.86, .78, .66];
  if (seg.th.solidCeil && !LT.indoor && LT.night > .3) LT.amb = mixC(LT.amb, [.8, .76, .7], clamp((LT.night - .3) / .4, 0, 1) * .75); /* [B43] 夜の押上の展望デッキ（屋根のあるガラスの部屋）：外の夜と同じ暗さで、中がまっ暗だった。中の明かりで、少しあたたかく明るく（外の空と町は夜のまま） */
  LT.fog = LT.indoor ? mixC(C(seg.th.wall || '#EEEEEE'), [255, 255, 255], .2).map((x, j) => x * LT.amb[j]) : LT.bot;
  computeSun();
}
function lit(c, k) { return [c[0] * k * LT.amb[0], c[1] * k * LT.amb[1], c[2] * k * LT.amb[2]]; }
function fogK(d) { return clamp((d - 34) / (FAR - 34), 0, 1) * (LT.indoor ? .55 : 1); } // the haze starts a little nearer: more depth down the street
const c255 = x => x > 255 ? 255 : x < 0 ? 0 : x | 0; // out-of-range rgb() values put the canvas on a very slow path
const RGBS = new Map(); /* [軽く] 色の文字（rgb(…)）を作り直さず使い回す。同じ文字だとブラウザの色の読み取りも速い */
function rgbStr(r, g, b) { const key = (r << 16) | (g << 8) | b; let v = RGBS.get(key); if (v === undefined) { if (RGBS.size > 30000) RGBS.clear(); v = `rgb(${r},${g},${b})`; RGBS.set(key, v); } return v; }
function fogged(c, k, d, glow) { const t = fogK(d), f = LT.fog; let r, g, b; if (glow) { r = c[0]; g = c[1]; b = c[2]; } else { const a = LT.amb; r = c[0] * k * a[0]; g = c[1] * k * a[1]; b = c[2] * k * a[2]; } return rgbStr(c255(r + (f[0] - r) * t), c255(g + (f[1] - g) * t), c255(b + (f[2] - b) * t)); }
const TC = new Map(), TA = [NaN, NaN, NaN]; let TCK = '';
function tint(hex) { // apply the current light to a literal color (for patterns)
  const am = LT.amb; if (am[0] !== TA[0] || am[1] !== TA[1] || am[2] !== TA[2]) { TA[0] = am[0]; TA[1] = am[1]; TA[2] = am[2]; const key = am.map(x => x.toFixed(2)).join(); if (key !== TCK) { TC.clear(); TCK = key; } } /* [軽く 3-2] 明るさが前と同じなら、目印の文字を作り直さない（1 コマに数千回呼ばれていた） */
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
/* [軽く 3-10] 箱の 6 つの面は、箱と場所が前と同じなら、前に作った物をそのまま使う（止まっている箱は毎コマ作り直していた。動く箱は今までどおり） */
/* [軽く 3-11] 物の深さだけが要る時は、入れ物を作らずに求める（segPos と同じ式） */
function segDepth(sg, s, lat) { const x = sg.sx + sg.f[0] * s + sg.r[0] * lat, z = sg.sz + sg.f[1] * s + sg.r[1] * lat; return (x - CAM.x) * CAM.s + (z - CAM.z) * CAM.c; }
function boxFaces(seg, b, ds, dl, dy) {
  const s0 = b.s0 + ds, s1 = b.s1 + ds, l0 = b.l0 + dl, l1 = b.l1 + dl, y0 = b.y0 + dy, y1 = b.y1 + dy;
  const k = b.__bk; if (k && k[0] === seg && k[1] === s0 && k[2] === s1 && k[3] === l0 && k[4] === l1 && k[5] === y0 && k[6] === y1 && k[8] === !!b.noTop) return k[7];
  const fs = boxFaces0(seg, b, s0, s1, l0, l1, y0, y1), kk = k || (b.__bk = []); kk[0] = seg; kk[1] = s0; kk[2] = s1; kk[3] = l0; kk[4] = l1; kk[5] = y0; kk[6] = y1; kk[7] = fs; kk[8] = !!b.noTop; return fs;
}
function boxFaces0(seg, b, s0, s1, l0, l1, y0, y1) {
  const f = seg.f, r = seg.r;
  if (b.noTop) return boxFaces0(seg, Object.assign({}, b, { noTop: 0 }), s0, s1, l0, l1, y0, y1).filter(fc => !fc.top); // 上の面を描かない箱（ホーム画面の敷きぶとん：上の面は床の絵＝シーツと掛けぶとん）
  /* [B7] 階段のある区間の、天井の明かり（fl: 'c'）は天井の線に、かべの窓・札（fl: 1）は水平に置く。前は 1 つの箱の前と後ろが別の段の高さになり、ゆがんで天井から飛び出したり、ななめの板に見えた */
  const e0 = seg.e0 || 0, Ef = b.fl && seg.hp ? (b.fl === 'c' ? s => ceilE(seg, s) - e0 : (m => () => m)(Math.max(segE(seg, s0), segE(seg, s1)) - e0)) : null, quad = Ef ? (sg, pts) => quadAt(sg, pts.map(p => [p[0], p[1], p[2] + Ef(p[0])]), 1) : quadAt;
  const fs = [
    { v: quad(seg, [[s0, l0, y1], [s0, l1, y1], [s1, l1, y1], [s1, l0, y1]]), n: [0, 1, 0], sh: FACE_SH.top, top: 1 },
    { v: quad(seg, [[s0, l0, y0], [s0, l1, y0], [s0, l1, y1], [s0, l0, y1]]), n: [-f[0], 0, -f[1]], sh: FACE_SH.front, front: 1 },
    { v: quad(seg, [[s1, l1, y0], [s1, l0, y0], [s1, l0, y1], [s1, l1, y1]]), n: [f[0], 0, f[1]], sh: FACE_SH.back, back: 1 },
    { v: quad(seg, [[s1, l0, y0], [s0, l0, y0], [s0, l0, y1], [s1, l0, y1]]), n: [-r[0], 0, -r[1]], sh: FACE_SH.left, sideL: 1 },
    { v: quad(seg, [[s0, l1, y0], [s1, l1, y0], [s1, l1, y1], [s0, l1, y1]]), n: [r[0], 0, r[1]], sh: FACE_SH.right, sideR: 1 },
    { v: quad(seg, [[s0, l1, y0], [s0, l0, y0], [s1, l0, y0], [s1, l1, y0]]), n: [0, -1, 0], sh: .7 },
  ];
  return b.only ? fs.filter(fc => b.only.some(q => fc[q])) : fs; /* [B37] only：外がわの面だけを描く箱（建物の外のかべ。中からは見えない） */
}
function faceVisible(fc) { const v = fc.v; const cx = (v[0] + v[6]) / 2, cy = (v[1] + v[7]) / 2, cz = (v[2] + v[8]) / 2; const n = fc.n3 || fc.n; return n.length === 3 ? (CAM.x - cx) * n[0] + (CAM.y - cy) * n[1] + (CAM.z - cz) * n[2] > 0 : (CAM.x - cx) * n[0] + (CAM.z - cz) * n[1] > 0; }
function spriteAt(x, y, z) { tc(x, y, z, TMP, 0); const zc = TMP[2]; if (zc < NEAR || zc > FAR) return null; return { sx: W / 2 + TMP[0] * FOCAL / zc, sy: HORIZON - TMP[1] * FOCAL / zc, k: FOCAL / zc, z: zc }; } // 答えは毎回新しい入れ物（受け取った側が、あとで使うことがある）
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
  MAT_TEX[kind] = ctx.createPattern(c, 'repeat'); if (MAT_TEX[kind]) MAT_TEX[kind].__img = c; return MAT_TEX[kind];
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
  let pat = matTex(matOf(b, sg)); if (!pat.setTransform) return; let mk = 1;
  const wl = b.l1 - b.l0, ws = b.s1 - b.s0, wy = b.y1 - b.y0, top = fc.top || fc.n[1] === -1;
  const wu = top ? wl : (fc.front || fc.n.length === 3 && !fc.sideL && !fc.sideR) ? wl : (fc.sideL || fc.sideR) ? ws : wl, wv = top ? ws : wy;
  const T = .55, ru = Math.max(.25, wu / T) * 128, rv = Math.max(.25, wv / T) * 128;
  let a = (SCR[2] - SCR[0]) / ru, bb = (SCR[3] - SCR[1]) / ru, c = (SCR[6] - SCR[0]) / rv, d = (SCR[7] - SCR[1]) / rv;
  if (!isFinite(a + bb + c + d)) return;
  /* [遠く A16] 箱の面の材質（木目・布・石のつぶ）も、画面で 1 ドットより細かく縮む時は、なめらかに縮めた絵を使う（ななめの面・遠くの面がキラキラしない） */
  if (!LODOFF && pat.__img) { const sc = Math.min(Math.hypot(a, bb), Math.hypot(c, d)); if (sc < .5) { const lv = sc < .125 ? 3 : sc < .25 ? 2 : 1, m = pat.__mips || (pat.__mips = []); if (!m[lv]) { let cc = pat.__img; for (let i = 0; i < lv; i++) { const n = document.createElement('canvas'); n.width = n.height = Math.max(8, cc.width >> 1); const g = n.getContext('2d'); if (!g) { cc = null; break; } g.imageSmoothingQuality = 'high'; g.drawImage(cc, 0, 0, n.width, n.height); cc = n; } m[lv] = cc ? ctx.createPattern(cc, 'repeat') : null; } if (m[lv] && m[lv].setTransform) { pat = m[lv]; mk = 1 << lv; a *= mk; bb *= mk; c *= mk; d *= mk; } } }
  ctx.globalAlpha = BOXA * clamp(1.15 - fd / 30, .25, 1) * LODK(34, fd); /* [近づく G3] */ fillMapped(pat, a, bb, c, d, SCR[0], SCR[1]); ctx.globalAlpha = BOXA; /* [軽く 3-17] 今の透け具合は覚えている数（BOXA）から求める（読むたびにごみが出ていた） */
}
let BOXA = 1;
// a painting laid on a box face in true perspective: the face is cut into narrow vertical strips, each mapped on its own
const FI = new Float32Array(3), FIG = new Float64Array(11 * 11 * 2);
function faceImage(img, flip, v) {
  if (!img || !img.width) return; // a picture the phone had no memory for: the plain box face stays
  let L = litSprite(img, LT.amb), IW = L.width, IH = L.height;
  // world corners: bottom-start, bottom-end, top-start, top-end (start = the image's left edge)
  let B0 = [v[0], v[1], v[2]], B1 = [v[3], v[4], v[5]], T1 = [v[6], v[7], v[8]], T0 = [v[9], v[10], v[11]];
  if (flip) { [B0, B1] = [B1, B0]; [T0, T1] = [T1, T0]; }
  /* 2026-11-17 オーナー「ホーム画面のタンスなど、まだごわごわしてる」：前は 6 本のたての帯を、左上の角だけに合わせてゆがめていたので、帯ごとに下の方がずれて、
     取っ手や木目が段になって切れていた。面を（たて×よこ）のます目に分け、本当の遠近で求めた 4 すみを、三角 2 つずつで貼る（ずれない）。小さく見える面はます目を少なく（軽い） */
  const Q = (t, s) => { const bx = B0[0] + (B1[0] - B0[0]) * t, by = B0[1] + (B1[1] - B0[1]) * t, bz = B0[2] + (B1[2] - B0[2]) * t, tx = T0[0] + (T1[0] - T0[0]) * t, ty = T0[1] + (T1[1] - T0[1]) * t, tz = T0[2] + (T1[2] - T0[2]) * t;
    tc(bx + (tx - bx) * s, by + (ty - by) * s, bz + (tz - bz) * s, FI, 0); if (FI[2] < NEAR) return null; return [W / 2 + FI[0] * FOCAL / FI[2], HORIZON - FI[1] * FOCAL / FI[2]]; };
  const c00 = Q(0, 0), c10 = Q(1, 0), c01 = Q(0, 1), c11 = Q(1, 1); if (!c00 || !c10 || !c01 || !c11) return;
  const sw = Math.max(Math.hypot(c10[0] - c00[0], c10[1] - c00[1]), Math.hypot(c11[0] - c01[0], c11[1] - c01[1])), sh = Math.max(Math.hypot(c01[0] - c00[0], c01[1] - c00[1]), Math.hypot(c11[0] - c10[0], c11[1] - c10[1]));
  { const L2 = sprMip(L, Math.max(sw, sh * IW / Math.max(1, IH))); if (L2 !== L) { L = L2; IW = L.width; IH = L.height; } } /* [遠く A12] 箱にはった絵（たんす・電車の顔・自動販売機）も、遠くでは小さくした絵で */
  let N = clamp(Math.ceil(sw / 28), 1, 10), M = clamp(Math.ceil(sh / 34), 1, 10); while (N * M > 48) { if (N >= M) N--; else M--; } // 1 面あたり三角 96 まで（電車など、近くの大きな面がたくさんあっても重くしない）
  /* [軽く 3-27] ます目の点・三角の計算は、使い回す数の表で行う（前は点ごと・三角ごとに入れ物を作り、1 面で数百個のごみ。貼り方は同じ） */
  const GX = FIG, NN = N + 1; let k = 0; for (let j = 0; j <= M; j++) for (let i = 0; i <= N; i++, k += 2) { const q = Q(i / N, 1 - j / M); if (q) { GX[k] = q[0]; GX[k + 1] = q[1]; } else { GX[k] = NaN; GX[k + 1] = NaN; } } // row 0 = top of the picture
  const tp = PAT_OK ? texPat(L) : null;
  const tri = (i0, j0, i1, j1, i2, j2) => { const o0 = (j0 * NN + i0) * 2, o1 = (j1 * NN + i1) * 2, o2 = (j2 * NN + i2) * 2;
    const p0x = GX[o0], p0y = GX[o0 + 1], p1x = GX[o1], p1y = GX[o1 + 1], p2x = GX[o2], p2y = GX[o2 + 1]; if (p0x !== p0x || p1x !== p1x || p2x !== p2x) return;
    const t0u = IW * i0 / N, t0v = IH * j0 / M, t1u = IW * i1 / N, t1v = IH * j1 / M, t2u = IW * i2 / N, t2v = IH * j2 / M;
    const cx = (p0x + p1x + p2x) / 3, cy = (p0y + p1y + p2y) / 3; // a hair bigger, so no hairline seams
    const du1 = t1u - t0u, dv1 = t1v - t0v, du2 = t2u - t0u, dv2 = t2v - t0v, det = du1 * dv2 - du2 * dv1; if (Math.abs(det) < 1e-6) return;
    const x1 = p1x - p0x, y1 = p1y - p0y, x2 = p2x - p0x, y2 = p2y - p0y;
    const A = (x1 * dv2 - x2 * dv1) / det, B = (y1 * dv2 - y2 * dv1) / det, C = (x2 * du1 - x1 * du2) / det, D = (y2 * du1 - y1 * du2) / det;
    const E = p0x - A * t0u - C * t0v, F = p0y - B * t0u - D * t0v; ctx.beginPath();
    let dx = p0x - cx, dy = p0y - cy, l = Math.hypot(dx, dy) || 1; ctx.moveTo(p0x + dx / l * .9, p0y + dy / l * .9);
    dx = p1x - cx; dy = p1y - cy; l = Math.hypot(dx, dy) || 1; ctx.lineTo(p1x + dx / l * .9, p1y + dy / l * .9);
    dx = p2x - cx; dy = p2y - cy; l = Math.hypot(dx, dy) || 1; ctx.lineTo(p2x + dx / l * .9, p2y + dy / l * .9); ctx.closePath();
    if (tp) fillMapped(tp, A, B, C, D, E, F); else { ctx.save(); ctx.clip(); ctx.transform(A, B, C, D, E, F); ctx.drawImage(L, 0, 0); ctx.restore(); } };
  for (let j = 0; j < M; j++) for (let i = 0; i < N; i++) { tri(i, j, i + 1, j, i + 1, j + 1); tri(i, j, i + 1, j + 1, i, j + 1); }
}
let BOXG = null, BOXM = null, BFN = 0; const BM = new Float64Array(6); const BFACES = [], BFPOOL = [], byDepth0 = (a, b) => b[0] - a[0], byKey3 = (a, b) => b.d > a.d ? 1 : b.d < a.d ? -1 : 0;
/* [軽く 3-13] 箱の面に模様・絵を貼る時は、模様の向きを（模様の入れ物ではなく）描く向きのほうで合わせる。
   箱を描いている間の描く向き（BOXM）は決まっているので、それに掛け合わせて、ぬったら戻す。前は 1 面ごとに向きの入れ物を通して渡し、
   そのたびに小さなごみが十数個出ていた（見た目は同じ） */
function boxM() { if (!BOXM) { const T = ctx.getTransform(); BM[0] = T.a; BM[1] = T.b; BM[2] = T.c; BM[3] = T.d; BM[4] = T.e; BM[5] = T.f; BOXM = BM; } return BOXM; } // 描く向きは数字の表で覚える（読むたびのごみを出さない）
function fillMapped(pat, a, b, c, d, e, f) { const M = boxM();
  ctx.setTransform(M[0] * a + M[2] * b, M[1] * a + M[3] * b, M[0] * c + M[2] * d, M[1] * c + M[3] * d, M[0] * e + M[2] * f + M[4], M[1] * e + M[3] * f + M[5]);
  if (pat.setTransform && pat.__mt) { pat.setTransform(PATI); pat.__mt = 0; } ctx.fillStyle = pat; ctx.fill(); ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]); }
function bfPut(fc, b) { let e = BFPOOL[BFN]; if (!e) e = BFPOOL[BFN] = { d: 0.5, fc: null, b: null }; BFN++; e.d = depthOf(fc.v); e.fc = fc; e.b = b; BFACES.push(e); }
/* [軽く 3-9] 箱の上のふちの光の色（16 段の明るさ）は、作っておいた文字を使う（前は面ごとに文字を作っていた。見分けのつかない差） */
const TOPHL = Array.from({ length: 101 }, (_, k) => `rgba(255,250,240,${(.22 * k / 100).toFixed(3)})`);
/* [ちらつき F1] 2026-11-20 オーナー「障害物や壁がチカチカする」：箱の面は「面のまん中までの深さ」の順に描いていた。重ねた箱（いすの座面と台、看板と柱など）では、
   となりあう面の深さがほぼ同じで、カメラが少しゆれるだけで順番が入れかわり、面がチカチカしていた（調べた 40 の場所で 2,000 組以上）。
   深さの順に並べたあと、画面で重なる 2 つの面だけ「どちらの面の平らな面のどちら側にあるか」で確かめ、うしろの面を先に描く（面の形で決まる順番なので、ゆれても入れかわらない） */
const FOP = new Float64Array(4 * 1024), FOB = new Float64Array(4 * 1024), FOIN = new Int32Array(1024), FODONE = new Uint8Array(1024), FOX = new Int32Array(1024), FOOD = new Int32Array(1024), FOST = new Int32Array(1024), FOADJ = new Int32Array(65536), FOE = [], FOOUT = [], FOSUB = [];
function planeOf(v) { const ax = v[3] - v[0], ay = v[4] - v[1], az = v[5] - v[2], bx = v[9] - v[0], by = v[10] - v[1], bz = v[11] - v[2]; let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l; const r = new Float64Array(4); r[0] = nx; r[1] = ny; r[2] = nz; r[3] = -(nx * v[0] + ny * v[1] + nz * v[2]); return r; } // [F6] 面の平らな向きは、面ごとに 1 回だけ求めて覚える
function facePlane(i, v) { const ax = v[3] - v[0], ay = v[4] - v[1], az = v[5] - v[2], bx = v[9] - v[0], by = v[10] - v[1], bz = v[11] - v[2]; let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
  const o = i * 4; FOP[o] = nx; FOP[o + 1] = ny; FOP[o + 2] = nz; FOP[o + 3] = -(nx * v[0] + ny * v[1] + nz * v[2]); }
function sideOf(i, v, cs) { const o = i * 4, nx = FOP[o], ny = FOP[o + 1], nz = FOP[o + 2], dd = FOP[o + 3]; let pos = 0, neg = 0; for (let k = 0; k < v.length; k += 3) { const s = (nx * v[k] + ny * v[k + 1] + nz * v[k + 2] + dd) * cs; if (s > .004) pos++; else if (s < -.004) neg++; } return neg === 0 && pos > 0 ? 1 : pos === 0 && neg > 0 ? -1 : 0; } // 1: 全部カメラ側 / -1: 全部うしろ / 0: またがる・面の上
function camSide(i) { const o = i * 4, s = FOP[o] * CAM.x + FOP[o + 1] * CAM.y + FOP[o + 2] * CAM.z + FOP[o + 3]; return s >= 0 ? 1 : -1; }
let FONEAR = 35; let SIDN = 0; const sid = b => b.__sid || (b.__sid = ++SIDN);
function boxTouch(a, b) { const t = .03; return a.s0 < b.s1 + t && b.s0 < a.s1 + t && a.l0 < b.l1 + t && b.l0 < a.l1 + t && a.y0 < b.y1 + t && b.y0 < a.y1 + t; }
function faceOrderFix(faces) { const n0 = Math.min(faces.length, 1024); let any = false;
  /* [F5] 軽く：遠くの面（35m より先）は小さく、入れかわっても目立たないので、近い面だけ調べる（面は遠い順なので、近い面は表のうしろの方） */
  let st = 0; while (st < n0 && faces[st].d > FONEAR) st++; if (n0 - st < 2) return false;
  if (st > 0) { const sub = FOSUB; sub.length = 0; for (let i = st; i < n0; i++) sub.push(faces[i]); const r = faceOrderFix(sub); if (r) for (let i = st; i < n0; i++) faces[i] = sub[i - st]; return r; }
  const n = n0;
  for (let i = 0; i < n; i++) { const e = faces[i], v = e.fc.v; e.ix = i; const pl = e.fc.__pl || (e.fc.__pl = planeOf(v)); const o4 = i * 4; FOP[o4] = pl[0]; FOP[o4 + 1] = pl[1]; FOP[o4 + 2] = pl[2]; FOP[o4 + 3] = pl[3]; const m = project(v); const o = i * 4; if (!m) { FOB[o] = 1e9; FOB[o + 1] = 1e9; FOB[o + 2] = -1e9; FOB[o + 3] = -1e9; continue; }
    const am = Math.abs(m); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let k = 0; k < am; k++) { const x = SCR[k * 2], y = SCR[k * 2 + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } FOB[o] = x0; FOB[o + 1] = y0; FOB[o + 2] = x1; FOB[o + 3] = y1; }
  // before(a, b)：a は b より先に描く（a が b のうしろ）とはっきり言えるか
  const before = (a, b) => { const A = faces[a], B = faces[b]; const ia = A.ix, ib = B.ix, ca = camSide(ia), cb = camSide(ib); const s1 = sideOf(ia, B.fc.v, ca), s2 = sideOf(ib, A.fc.v, cb); return (s1 === 1 || s2 === -1) && !(s1 === -1 || s2 === 1); };
  const ov = (a, b) => { const p = faces[a].ix * 4, q = faces[b].ix * 4; return Math.min(FOB[p + 2], FOB[q + 2]) - Math.max(FOB[p], FOB[q]) > .5 && Math.min(FOB[p + 3], FOB[q + 3]) - Math.max(FOB[p + 1], FOB[q + 1]) > .5; };
  /* 重なる 2 面の「うしろ・まえ」が言える組だけを決まりにして、決まりを守る中で深さの順に並べる（決まりが言えない組は、今までどおり深さの順）。
     [F3] 大きな建物（面が数百）でも重くならないよう、画面の左右で重なる組だけを、左のはしの順に調べる */
  if (n > 900) return false;
  for (let i = 0; i < n; i++) { FOX[i] = i; FOIN[i] = 0; FOOD[i] = 0; } FOE.length = 0;
  const xs = FOX.subarray(0, n); xs.sort((p, q) => FOB[p * 4] - FOB[q * 4]);
  for (let a = 0; a < n; a++) { const i0 = xs[a], x1 = FOB[faces[i0].ix * 4 + 2]; if (FOB[i0 * 4] > 1e8) continue;
    for (let c = a + 1; c < n; c++) { const j0 = xs[c]; if (FOB[j0 * 4] > x1) break; const i = Math.min(i0, j0), j = Math.max(i0, j0); if (faces[i].b === faces[j].b || !ov(i, j)) continue;
      if (before(j, i)) { FOE.push(j, i); any = true; } else if (before(i, j)) FOE.push(i, j);
      else if (boxTouch(faces[i].b, faces[j].b)) { if (sid(faces[i].b) > sid(faces[j].b)) { FOE.push(j, i); any = true; } else FOE.push(i, j); } } } // [F2] めりこんだ箱どうし（柱と帯など）は、どちらが前とも言えない。いつも同じ順（あとから作った箱を上）にして、入れかわらないように
  if (!any) return false;
  const E = FOE.length >> 1; for (let k = 0; k < E; k++) { FOOD[FOE[k * 2]]++; FOIN[FOE[k * 2 + 1]]++; }
  let acc = 0; for (let i = 0; i < n; i++) { FOST[i] = acc; acc += FOOD[i]; FOOD[i] = FOST[i]; } for (let k = 0; k < E; k++) FOADJ[FOOD[FOE[k * 2]]++] = FOE[k * 2 + 1]; // 決まりの表（i → 後に描く面）
  const out = FOOUT; out.length = 0; FODONE.fill(0, 0, n); let lo = 0;
  for (let step = 0; step < n; step++) { let pick = -1; for (let i = lo; i < n; i++) if (!FODONE[i] && FOIN[i] === 0) { pick = i; break; } if (pick < 0) for (let i = 0; i < n; i++) if (!FODONE[i]) { pick = i; break; } // 輪になった時は、いちばん遠い面から
    FODONE[pick] = 1; out.push(faces[pick]); for (let k = FOST[pick]; k < FOOD[pick]; k++) FOIN[FOADJ[k]]--; while (lo < n && FODONE[lo]) lo++; if (pick > lo) { for (let k = FOST[pick]; k < FOOD[pick]; k++) if (FOADJ[k] < pick && FOIN[FOADJ[k]] === 0) { lo = Math.min(lo, FOADJ[k]); } } }
  for (let i = 0; i < n; i++) faces[i] = out[i];
  return any; }
function drawBoxes(list, sg, d, alpha, ds, dl, dy, cache) {
  BOXM = null; // the drawing's own scale (taken once per call, when first needed)
  /* [軽く 3-5] 見える面の表は、使い回す入れ物に入れる（1 コマに数百個の新しい入れ物を作っていた）。表そのものも使い回す（この中から自分をまた呼ぶことはない） */
  const faces = BFACES; faces.length = 0; BFN = 0;
  if (cache) { for (const [fc, b] of cache) { if (faceVisible(fc)) bfPut(fc, b); } }
  else for (const b of list) { for (const fc of boxFaces(sg, b, ds, dl, dy)) if (faceVisible(fc)) bfPut(fc, b); }
  faces.sort(byKey3); /* [軽く 3-8] 並べかえのくらべは、大小だけを 1・-1・0 で返す（小数のひき算の答えは、そのたびにごみが出ていた。順番は前と同じ） */
  if (faces.length > 1) faceOrderFix(faces);
  ctx.globalAlpha = alpha; BOXA = alpha; ctx.lineJoin = 'round'; let PEND = null;
  for (const e of faces) { const fd = e.d, fc = e.fc, b = e.b;
    const m = project(fc.v); if (!m) continue; const am = Math.abs(m); let ar = 0; for (let i = 0, j = am - 1; i < am; j = i++) ar += (SCR[j * 2] + SCR[i * 2]) * (SCR[j * 2 + 1] - SCR[i * 2 + 1]); ar = Math.abs(ar) * .5;
    if (ar < .02) continue; /* 面積がほぼ 0（真横から見た面）だけ省く */
    const glow = b.glow && (LT.night > .3 || b.glow === 1);
    const col = fogged(b.cc, glow ? 1 : fc.sh * sunK(fc.n), fd, glow);
    const plain = !((fd < 40 && !glow) || (fd < 34 && !glow && m === 4) || (fd < 28 && m === 4 && !glow && !fc.top) || (fd < 30 && !b.noEdge) || (fc.top && m === 4 && fd < 22 && !glow) || b.face || b.face2 || (m === 4 && fd < 45 && (b.pat === 'vend' || b.txt)));
    if (plain) { if (PEND !== col) { if (PEND) { ctx.fillStyle = PEND; ctx.fill(); } ctx.beginPath(); PEND = col; } ctx.moveTo(SCR[0], SCR[1]); for (let i = 1; i < am; i++) ctx.lineTo(SCR[i * 2], SCR[i * 2 + 1]); ctx.closePath(); continue; } /* [軽く] 飾りのない面は、同じ色が続くあいだ 1 回にまとめてぬる（描く回数がへる。見た目は同じ） */
    if (PEND) { ctx.fillStyle = PEND; ctx.fill(); PEND = null; }
    pathPoly(am); ctx.fillStyle = col; ctx.fill(); /* 小さな物は、ふちの線・光のぐあい・材質の絵を省く（画面では見分けられない大きさ） */
    if (fd < 40 && !glow) { const sk = LODOFF ? 1 : clamp(ar / 90, 0, 1); /* [細い面 B1] 真横から見る細い面（柱の横・看板のふち）は、ふちの線（最大 2.6 ドット）で太い線に見え、走ると出たり消えたりしてチカチカした。面の広さが小さいほど、ふちの線をうすく */ if (sk > .02) { ctx.strokeStyle = col; ctx.lineWidth = clamp(36 / fd, .6, 2.6); if (sk < 1) ctx.globalAlpha = alpha * sk; ctx.stroke(); if (sk < 1) ctx.globalAlpha = alpha; } } // soft, rounded edges instead of hard cube corners
    if (fd < 34 && !glow && m === 4) { ctx.globalAlpha = alpha * LODK(34, fd); matFace(fc, b, sg, fd); ctx.globalAlpha = alpha; } /* [近づく G3] 材質の絵は 29〜34m でうすく出る（前は 34m で急に出て、走るとパッと切りかわった） */
    if (fd < 28 && m === 4 && !glow && !fc.top) { // soft light: a little brighter at the top of a face, darker at its foot
      let y0 = 1e9, y1 = -1e9; for (let i = 0; i < 4; i++) { y0 = Math.min(y0, SCR[i * 2 + 1]); y1 = Math.max(y1, SCR[i * 2 + 1]); }
      if (y1 - y0 > 14) { /* [軽く 3-1] 同じ光のぐあいの色の帯を 1 本だけ作り、面の高さに合わせて伸ばして使う（前は面ごと・コマごとに作っていた：1 コマ 150 本ほど。見た目は同じ） */
        if (!BOXG) { BOXG = ctx.createLinearGradient(0, 0, 0, 1); BOXG.addColorStop(0, 'rgba(255,255,255,.10)'); BOXG.addColorStop(.6, 'rgba(0,0,0,0)'); BOXG.addColorStop(1, 'rgba(20,15,30,.22)'); }
        const M = boxM(), h = y1 - y0; ctx.setTransform(M[0], M[1], M[2] * h, M[3] * h, M[4] + M[2] * y0, M[5] + M[3] * y0); ctx.fillStyle = BOXG; ctx.globalAlpha = alpha * LODK(28, fd) * clamp((h - 14) / 10, 0, 1); ctx.fill(); ctx.globalAlpha = alpha; /* [近づく G1・G7] やわらかい光は 24〜28m・面の高さ 14〜24 ドットでうすく出る（前はパッと出た） */ ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]); } }
    if (fd < 30 && !b.noEdge) { ctx.strokeStyle = 'rgba(40,30,24,.08)'; ctx.lineWidth = 1; ctx.globalAlpha = alpha * LODK(30, fd) * (LODOFF ? 1 : clamp(ar / 90, 0, 1)); ctx.stroke(); ctx.globalAlpha = alpha; } /* [細い面 B2] 細い面のこい線も同じ */ /* [近づく G2] ふちの細い線も 26〜30m でうすく出る */
    if (fc.top && m === 4 && fd < 22 && !glow) { ctx.strokeStyle = TOPHL[Math.round(clamp(1 - fd / 22, 0, 1) * 100)]; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(SCR[0], SCR[1]); ctx.lineTo(SCR[2], SCR[3]); ctx.stroke(); }
    if (b.face && m === 4 && fd < (b.faceN ? 120 : 50)) ctx.globalAlpha = alpha * LODK(b.faceN ? 120 : 50, fd); /* [近づく G4] 箱にはった絵（たんす・電車の顔）も、消える手前でうすく */
    if (b.face && m === 4 && fd < (b.faceN ? 120 : 50) && (b.faceAll ? (fc.front || fc.back || fc.sideL || fc.sideR) : b.faceFront ? fc.front : b.faceSide ? (b.faceSide === 'L' ? fc.sideL : fc.sideR) : (fc.sideL || fc.sideR))) faceImage(paintFace(b.faceN && LT.night > .4 ? b.faceN : b.face, b.faceW, b.faceH), fc.sideL, fc.v); // 電車（faceN）は遠くからも絵で。先頭の顔は前の面（faceFront）
    ctx.globalAlpha = alpha * (b.face2 && fd < 50 ? LODK(50, fd) : 1); /* [近づく G5] */
    if (b.face2 && m === 4 && fd < 50 && !fc.top && (b.face2F ? (fc.front || fc.back) : !(b.faceSide === 'L' ? fc.sideL : fc.sideR) && (fc.front || fc.back || fc.sideL || fc.sideR))) faceImage(paintFace(b.face2, b.face2W || 200, b.face2H || 200), fc.sideL, fc.v); // 2026-11-17：主な面とちがう絵を、ほかの横の面に（たんすの横の板）
    ctx.globalAlpha = alpha * (fd < 45 ? LODK(45, fd) : 1); /* [近づく G6] 自動販売機の商品・箱の字も、45m の手前でうすく出る */
    if (m === 4 && fd < 45) {
      if (b.pat === 'vend' && (fc.sideL || fc.sideR || fc.front)) vendFace(b);
      if (b.txt && (fc.front || (b.vert && (fc.sideL || fc.sideR)))) qtext(b.txt, .08, .06, .92, .94, b.tc || b.tcA || (b.tcA = hexRgb(b.c)[0] + hexRgb(b.c)[1] < 260 ? '#FBF6EE' : '#2B1A12'), b.vert ? QVERT : QFLAT);
    }
    ctx.globalAlpha = alpha;
  }
  if (PEND) { ctx.fillStyle = PEND; ctx.fill(); }
  ctx.globalAlpha = 1;
}
const VENDC = ['#C8463C', '#F2C230', '#4E77A0', '#5F9E5A', '#E86A75'];
function vendFace(b) { bquad(.08, .45, .92, .95, '#FFFFFF'); for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) bquad(.12 + k * .16, .5 + r * .14, .22 + k * .16, .6 + r * .14, VENDC[(r + k) % 5]); bquad(.3, .1, .7, .3, '#2B2B2B'); }

/* ================= frame ================= */
const DRAW = [], DPOOL = []; let DN = 0; const byE0 = (a, b) => b[0] > a[0] ? 1 : b[0] < a[0] ? -1 : 0;
/* [軽く 3-4] 描く順の表の 1 行（深さ・種類・物）は、使い回す入れ物に入れる（前は 1 コマに数百個の新しい入れ物を作っていた） */
function dput(a, b, c) { let e = DPOOL[DN]; if (!e) e = DPOOL[DN] = [0, 0, null]; DN++; e[0] = a; e[1] = b; e[2] = c; DRAW.push(e); }
function dclear() { DRAW.length = 0; DN = 0; }
const IN_K = k => k === 'room' || k === 'train' || k === 'glass';
/* 外から建物の中へ曲がった時：カメラが半分以上まわったら、うしろの外の道は描かない（2026-11-16 オーナー「曲がり角で壁が透けて先が見える」。
   中に入ったのに、入り口の横から前の通りの建物や看板が見えていた） */
function prevHidden() { const cur = G.segs[G.ci], pv = G.segs[G.ci - 1]; if (!cur || !pv || G.mode === 'title') return false; if (cur.th.sky) return !(pv.th.climb && G.s < 28); /* [飛び立ち D1] 2026-11-23 オーナー「飛び立つ時に、一瞬で跳び立った場所が消えるのはおかしい」：飛び立ってすぐ（28m まで・まだ前を向いている間）は、うしろの展望台の床と手すりも描く。足もとから、ゆっくり下へ遠ざかって見える */ /* 空の上：うしろの展望台（地面の高さに作ってある）は描かない */ if (!IN_K(cur.th.kind) || IN_K(pv.th.kind)) return false;
  let d = (G.camYaw || 0) - cur.dir * Math.PI / 2; d = Math.atan2(Math.sin(d), Math.cos(d)); return Math.abs(d) < Math.PI / 4; }
// 空の上の先（着地する公園）は地面の高さにある。塔の上・展望台にいる間は、空の先は描かない（150m の窓の外に、目の高さの公園が浮いて見えないように）
function skyCut() { const cur = G.segs[G.ci]; if (!cur) return 1e9; if (cur.th.sky && G.mode !== 'title' && segE(cur, G.s) - segE(cur, cur.len) > 22) return G.ci + 1; /* [着地 G8] 地面から 22m より下（着地の直前）からは、公園の先の道も描く（着地した時に、先の町が急に出てこない） */ /* [着地 G4] 2026-11-20 オーナー「降りる時に安っぽい道路が出てきてから、通常のコースに戻る」：空の上からは、着地する公園の先（ふつうのコースの道・町）を描かない。下に見えるのは本物の地図の町と、着地する公園だけ */ for (let i = G.ci + 1; i < G.segs.length; i++) { if (G.segs[i - 1].th.lift) return i - 1; /* [床 L1] エレベーターより先（350m・445m の上の階）は、エレベーターに乗るまで描かない（乗り場の床の上に、上の階のガラスの床から見える町が重なって見えていた） */ if (!cur.th.sky && G.segs[i].th.sky) return i; } return 1e9; }
function segOrder() { const out = [], cut = skyCut(); { const gh = G.forkGhost; if (gh) { const cur = G.segs[G.ci]; if (G.mode === 'play' && ((cur === gh.of && G.s < 60) || G.segs[G.ci + 1] === gh.of)) out.push(gh.seg); else if (cur !== gh.of && G.segs[G.ci + 1] !== gh.of || G.s >= 60) G.forkGhost = null; } } for (let i = G.segs.length - 1; i > G.ci; i--) if (i <= cut) out.push(G.segs[i]); if (G.fork) out.push(...G.fork); if (G.segs[G.ci - 1] && !prevHidden()) out.push(G.segs[G.ci - 1]); out.push(G.segs[G.ci]); return out.filter(Boolean); }
// つきあたりの壁の上（cap）：先が、天井のもっと高い部屋のときも描く
function capOn(sg) { if (sg !== G.segs[G.ci] || G.mode === 'title') return false; const nx = G.fork && G.fork.length ? G.fork : [G.segs[G.ci + 1]]; return nx.some(n => n && (n.wallH || 0) > (sg.wallH || 0) + .05); }
// のばした奥の壁（3_world.js の wing）を描くか：その建物の中にいる間と、外へ曲がり始めた一瞬だけ。先が建物の中なら描かない
// 高架の上の電車は、高架のある範囲（r0〜r1）だけ描く。はみ出た分は切る（2026-11-16：高架の先のとなりの場所＝公園などの空に、電車が浮いて見えていた）
/* [電車 M1] 高架の範囲で切った電車の箱は、毎コマ新しく作っていたので、重なった箱の「いつも同じ順」の番号が毎コマ変わり、電車の窓わく・帯がチカチカした。
   切った箱は元の箱ごとに 1 つを使い回し、番号も元の箱と同じにする */
function moverBoxes(m) { if (m.r1 == null) return m.bx; const out = m.__mb || (m.__mb = []); out.length = 0; for (const b of m.bx) { const s0 = Math.max(b.s0 + m.ds, m.r0) - m.ds, s1 = Math.min(b.s1 + m.ds, m.r1) - m.ds; if (s1 - s0 > .05) { if (LODOFF) { out.push(Object.assign({}, b, { s0, s1 })); continue; } let c = b.__cut; if (!c) { c = b.__cut = Object.assign({}, b); delete c.__bk; delete c.__cut; c.__sid = b.__sid || (b.__sid = ++SIDN); } c.s0 = s0; c.s1 = s1; out.push(c); } } return out; }
function wingOn(sg) { const inK = k => k === 'room' || k === 'train' || k === 'glass', cur = G.segs[G.ci]; if (G.mode === 'title') return false;
  if (sg === cur) { const nx = G.fork && G.fork.length ? G.fork : [G.segs[G.ci + 1]]; return nx.some(n => n && n.th && !inK(n.th.kind)); }
  return sg === G.segs[G.ci - 1] && G.turnT > .5 && cur && cur.th && !inK(cur.th.kind); }
let BUBS = [], BUBT = 0; // このコマに出したふきだし（重なり回避）
/* ホーム画面の第 2 段（2026-11-16）：朝の光。障子ごしの日ざしが左上からさしこみ、光の中をほこりがゆっくり舞う。画面を暗くはしない。
   ホーム画面だけ（走っている間は出さない：画面に固定の光の帯は、走ると「斜めの残像」に見えた。2026-11-08）。「動きをひかえめに」の時は、光は止まったまま・ほこりは出さない */
function titleLight() {
  const calm = !!OPT().calm, t = calm ? 0 : G.t, m = Math.min(W, H), top = H * (W < H * .8 ? .56 : .92); // たて長の画面は、下の札にかかる前で光を消す
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  { const gl = ctx.createRadialGradient(W * .08, H * .04, m * .05, W * .08, H * .04, m * 1.05); gl.addColorStop(0, 'rgba(255,238,196,.22)'); gl.addColorStop(.4, 'rgba(255,232,184,.07)'); gl.addColorStop(1, 'rgba(255,232,184,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, top); }
  for (let k = 0; k < 3; k++) { const x0 = W * (-.1 + k * .2), wd = m * (.09 + k * .025), a = (.045 + .015 * Math.sin(t * .35 + k * 2.1)) * (k === 1 ? 1.15 : 1), dx = top * .62; // 光の帯は弱め（2026-11-18：まん中の選んだ子の上を通り、選んだ子が約 3% 明るく見えていた。オーナー「選んだ子のライトはいらない」）
    const lg = ctx.createLinearGradient(0, 0, 0, top); lg.addColorStop(0, `rgba(255,240,205,${a})`); lg.addColorStop(.7, `rgba(255,240,205,${a * .45})`); lg.addColorStop(1, 'rgba(255,240,205,0)'); ctx.fillStyle = lg;
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + wd, 0); ctx.lineTo(x0 + wd * 1.9 + dx, top); ctx.lineTo(x0 + dx, top); ctx.closePath(); ctx.fill(); }
  if (!calm && !(typeof lowQ !== 'undefined' && lowQ)) for (let i = 0; i < 18; i++) { const u = (i * .6180339) % 1, v = (i * .3819660 + .13) % 1, sp = .012 + (i % 5) * .004, ph = (t * sp + v) % 1; // ほこり：光の帯にそって、ゆっくり右下へ
      const x = W * (-.05 + u * .75) + ph * top * .5 + Math.sin(t * .5 + i) * m * .012, y = ph * top * .92, tw = .5 + .5 * Math.sin(t * (1.1 + (i % 4) * .3) + i * 1.7), al = tw * .55 * Math.sin(ph * Math.PI);
      if (al < .03) continue; const r = m * (.0028 + (i % 3) * .0012); const dg = ctx.createRadialGradient(x, y, 0, x, y, r * 3); dg.addColorStop(0, `rgba(255,248,225,${al})`); dg.addColorStop(1, 'rgba(255,248,225,0)'); ctx.fillStyle = dg; ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); }
  ctx.restore();
  /* 選んだ子へのスポットライトは無し（オーナー 2026-11-17：「スポットライトが明るすぎて不自然。選択されてるキャラクターのライトいらない」）。
     だれを選んでいるかは、まん中・いちばん手前にいることで分かる。qa/homelight.js が、選んだ子だけ明るくなっていないことを見張る */
}
/* [軽く 2026-11-19] 絵を斜めの形に貼る時、前は「切り抜き（clip）→ ゆがめる → 絵を描く → もとに戻す」だった。切り抜きはスマホでとても重い
   （1 コマに数百回）。同じ絵を「模様」にして、その形をぬるだけにする（見た目は同じ。切り抜きをしない）。模様は 1 コマの中だけ使い回す */
let PAT_OK = (() => { try { const c = document.createElement('canvas'); c.width = c.height = 2; const p = c.getContext('2d').createPattern(c, 'no-repeat'); return !!(p && typeof p.setTransform === 'function' && typeof DOMMatrix !== 'undefined'); } catch (e) { return false; } })();
const PATF = new Map(), PATM = PAT_OK ? new DOMMatrix() : null, PATI = PAT_OK ? new DOMMatrix() : null;
function texPat(img) { let p = PATF.get(img); if (p === undefined) { try { p = img && img.width && img.height ? ctx.createPattern(img, 'no-repeat') : null; } catch (e) { p = null; } PATF.set(img, p); } return p; }
function texFill(img, A, B, C, D, E, F) { if (!PAT_OK) return false; const p = texPat(img); if (!p) return false; PATM.a = A; PATM.b = B; PATM.c = C; PATM.d = D; PATM.e = E; PATM.f = F; p.setTransform(PATM); p.__mt = 1; ctx.fillStyle = p; ctx.fill(); return true; } // いまの形（path）を、絵でぬる
function render() {
  PATF.clear();
  const seg = G.segs[G.ci] || G.segs[0]; if (!seg) return;
  computeLight(seg); camPrep();
  drawSky(seg);
  BUBQ.length = 0; { const so = segOrder(); for (const sg of so) drawUnder(sg); for (const sg of so) drawSegment(sg, sg === seg); }
  for (const f of BUBQ) f(); BUBQ.length = 0;
  if (G.prints && G.prints.length && G.weather === 'snow' && G.mode !== 'title') { ctx.fillStyle = 'rgba(95,110,140,.45)'; // footprints in the snow, fading
    for (const f of G.prints) { const age = G.t - f.t; if (age > 5 || age < .05) continue; const sp = spriteAt(f.x, f.y + .01, f.z); if (!sp || sp.sy < HORIZON) continue; ctx.globalAlpha = 1 - age / 5; ctx.beginPath(); ctx.ellipse(sp.sx, sp.sy, sp.k * .1, sp.k * .04, 0, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1; }
  groundDust(seg);
  drawFX();
  drawWeather(seg);
  // 手前の下のほうは少しだけ暗く、奥行きを出す（C-32）
  //  室内の斜めの光（C-35）はやめた：画面に固定の帯なので、走っていると「薄い斜めの残像」に見える（遊んだ方の報告 2026-11-08）。qa/visfx で 0 本を確認
  if (G.mode === 'title') titleLight();
  if (G.mode !== 'title') {
    const vg = ctx.createLinearGradient(0, H * .66, 0, H); vg.addColorStop(0, 'rgba(30,22,16,0)'); vg.addColorStop(1, 'rgba(30,22,16,.13)'); ctx.fillStyle = vg; ctx.fillRect(0, H * .66, W, H * .34); }
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
/* [軽く 3-14] 線（線路・電線・手すり）を 4m ごとに分けた切れはしは、線ごとに 1 回だけ作って覚える（前は毎コマ作り直していた） */
function linePieces(l) { const a = l.a, b = l.b, k = l.__pk;
  if (k && k[0] === a[0] && k[1] === a[1] && k[2] === a[2] && k[3] === b[0] && k[4] === b[1] && k[5] === b[2] && k[6] === l.c && k[7] === l.w && k[8] === l.glowN) return l.__pc;
  const len = Math.abs(b[0] - a[0]), n = Math.max(1, Math.ceil(len / 4)), out = [];
  for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n; out.push(n === 1 ? l : { a: [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0, a[2] + (b[2] - a[2]) * t0], b: [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1, a[2] + (b[2] - a[2]) * t1], c: l.c, w: l.w, glowN: l.glowN, abs: l.abs }); }
  l.__pk = [a[0], a[1], a[2], b[0], b[1], b[2], l.c, l.w, l.glowN]; l.__pc = out; return out; }
function occDraw(d, fn) { const y = occAt(d); if (y === Infinity) return fn(); if (y <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, y); ctx.clip(); try { fn(); } finally { ctx.restore(); } }
const PROF = {}; let PT = 0; const pm = k => { if (!PROF.on) return; const t = performance.now(); PROF[k] = (PROF[k] || 0) + t - PT; PT = t; };
/* [近づく] 遠くで省く細かい絵を、省く距離の手前 15% でうすくしていく（パッと出る・消えるのがチカチカに見えた） */
let LODOFF = 0; /* くらべる時だけ 1（前の見た目） */
function LODK(T, d) { return LODOFF ? (d < T ? 1 : 0) : clamp((T - d) / (T * .15), 0, 1); }
let SEAMF = true, SEAMW = true, SEAMLW = .9, NOGF = 0; let FLN = 0; const FLA = [], FLB = [], FLC = [];
/* [F11] 坂のある道（sg.hp）：床の板の間の順番は深さのままにし、となり合う平らな絵の組の中だけ、いつも同じ順に（坂の頂上より向こうの絵が、手前の坂の上に出ないように） */
/* [F12] 坂のある道の平らな絵は、その下の床の板のすぐあとに描く（板の深さ − ほんの少し、絵どうしはいつも同じ順）。前は絵ごとの深さで並べていたので、
   となりの絵と順番が入れかわってチカチカした（店先のくぼみと明かりのにじみ） */
function decKey(sg, p, d) { let h = p.__host; if (h === undefined) { h = null; const c = p.a != null && p.b != null ? (p.a + p.b) / 2 : null; if (c != null) for (const f of sg.floor) if (!f.dec && !f.soft && f.a != null && f.a <= c && c < f.b && (p.sd == null || f.sd === p.sd || (f.mid && !p.sd))) { h = f; break; } p.__host = h; if (!p.__fi) p.__fi = ++FLN; }
  return h ? depthOf(h.v) - .001 - p.__fi * 1e-7 : d - .8; }
function floorRuns() { for (let i = 0; i < DRAW.length;) { const p = DRAW[i][1]; if (!(p.dec && p.dec !== 'futonD' && p.dec !== 'zabuTop')) { i++; continue; } let j = i; while (j < DRAW.length) { const q = DRAW[j][1]; if (!(q.dec && q.dec !== 'futonD' && q.dec !== 'zabuTop')) break; if (!q.__fi) q.__fi = ++FLN; j++; } if (!p.__fi) p.__fi = ++FLN; if (j - i > 1) { FLB.length = 0; for (let k = i; k < j; k++) FLB.push(DRAW[k]); FLB.sort((a, b) => a[1].__fi - b[1].__fi); for (let k = i; k < j; k++) DRAW[k] = FLB[k - i]; } i = j; } }
function floorLayers() { FLA.length = 0; FLB.length = 0; FLC.length = 0;
  for (const e of DRAW) { const p = e[1]; if (p.dec && p.dec !== 'futonD' && p.dec !== 'zabuTop') { if (!p.__fi) p.__fi = ++FLN; FLB.push(e); } else if (p.soft || p.dec) FLC.push(e); else FLA.push(e); }
  if (!FLB.length) return; FLB.sort((a, b) => a[1].__fi - b[1].__fi); DRAW.length = 0; for (const e of FLA) DRAW.push(e); for (const e of FLB) DRAW.push(e); for (const e of FLC) DRAW.push(e); }
const BUBQ = [];
function drawUnder(sg) { /* [塔 U1] 2026-11-21：床より下の物は、ぜんぶの区間の床より先に描く（前は区間ごとに描いたので、屋上の下のビルの面が、先に描いた次の区間（曲がった先の階段）の床の上にかぶり、曲がり角の床に穴があいてユズが宙に立って見えた） */
  if (!sg.under) return; LC = sg.th.lc || '#80C241';
  const near = d => d > -8 && d < FAR + 8;
  if (sg.under) { /* [塔 S2] 2026-11-21：床より下の高さにある物（屋上から見下ろす、まわりのビルの箱・下の道ぞいの窓の面）は、床より先に描く。
       前は床の後に描いたので、ビルの下の方（屋上の床の下にあるはず）が屋上の床の上にかぶり、床が透けて下のビルが見えるようだった。先に描けば、手前の屋上の床がビルの下の方をかくし、屋上より上の所だけが見える */
    for (const pr of sg.props) { if (!pr.under) continue; const d = segDepth(sg, (pr.s0 + pr.s1) / 2, (pr.l0 + pr.l1) / 2); if (d < -3 || d > FAR) continue; if (!pr.fc) { pr.fc = []; for (const b of pr.bx) for (const fc of boxFaces(sg, b, 0, 0, 0)) pr.fc.push([fc, b]); } drawBoxes(null, sg, d, 1, 0, 0, 0, pr.fc); }
    dclear(); for (const w of sg.walls) { if (!w.under || !faceVisible(w)) continue; const d = depthOf(w.v); if (d >= FAR + 8 || depthMax(w.v) < -.5) continue; dput(d, 1, w); } DRAW.sort(byE0); for (const [d, t, w] of DRAW) drawWallItem(d, t, w); /* 窓の絵の面は、ビルの箱のすぐ外にはってあるので、箱の後に描く */
    dclear(); for (const sp of sg.spr) { if (!sp.under) continue; const d = segDepth(sg, sp.s, sp.lat); if (d < .5 || d > FAR) continue; dput(d, 7, sp); } DRAW.sort(byE0); for (const [d, , sp] of DRAW) drawSpr(sp, sg, d); }
}
function drawSegment(sg, isCur) {
  LC = sg.th.lc || '#80C241'; if (isCur) buildOcc(sg); const oc = isCur && OCC.on;
  const near = d => d > -8 && d < FAR + 8; if (PROF.on) PT = performance.now();
  // floor
  dclear();
  const skyRM = curSeg().th.sky && rmFrame(curSeg()); /* [M64] 空を飛んでいる間は、本物の地図の川があるので、着地する公園の手前の立体の水面は描かない（色がちがい、川の上に板がういて見えた） */
  for (const p of sg.floor) { if (skyRM && p.far) continue; const d = depthOf(p.v); if (d >= FAR + 8 || depthMax(p.v) < -.5) continue; dput(p.dec ? (sg.hp && !LODOFF && p.dec !== 'futonD' && p.dec !== 'zabuTop' ? decKey(sg, p, d) : d - (p.dec === 'futonD' || p.dec === 'zabuTop' ? 4.6 : .8)) : p.soft ? d - 4 - (p.sb || 0) : d, p); } // やわらかい物（soft）とその上の絵は、まわりの畳より後に描く（畳にかくれない）
  const patFar = typeof lowQ !== 'undefined' && lowQ > 1 ? 55 : 999;
  DRAW.sort(byE0); if (!sg.hp) floorLayers(); else floorRuns(); /* [ちらつき F4] 床の上にはった平らな絵（店先のくぼみ・明かりのにじみ・マットなど）は、同じ平らな面にあるので、深さの順で描くと、
     カメラが少しゆれるたびに重なる 2 枚の上下が入れかわってチカチカしていた。床 → 平らな絵（いつも同じ順）→ ふとん・座布団などの盛り上がった物、の順に描く（坂のある道は今までどおり） */
  const isW = p => p.pat === 'sea' || p.pat === 'water';
  let wPolys = null;
  for (const [d, p] of DRAW) { if (!isW(p)) continue; const m = project(p.v); if (!m) continue; pathPoly(Math.abs(m)); ctx.fillStyle = waterFill(p, d); ctx.fill(); if (m === 4 && d < patFar) floorPattern(p, d);
    if (sg === G.segs[G.ci]) { const n = Math.abs(m), pts = []; for (let i = 0; i < n; i++) pts.push(SCR[i * 2], SCR[i * 2 + 1]); (wPolys || (wPolys = [])).push(pts); } }
  if (wPolys) { // the sun's glitter only on this stretch's own water
    ctx.save(); ctx.beginPath(); for (const pts of wPolys) { ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); } ctx.clip(); waterGlitter(sg); ctx.restore(); }
  const SNOWF = G.weather === 'snow' && !LT.indoor && G.mode !== 'title'; const RAINF = G.weather === 'rain' && !LT.indoor && G.mode !== 'title'; /* [B57] 雨の日の外の道：雨が降っているのに、道が乾いた色のままだった。ぬれた道は暗く、少し青く（車道は多め、歩道は少し） */
  for (const [d, p] of DRAW) { if (isW(p)) continue; const m = project(p.v); if (!m) continue; if (p.dec) { if (m === 4) decalDraw(p, d); else clippedPattern(p, () => decalDraw(p, d)); continue; } pathPoly(Math.abs(m)); ctx.fillStyle = fogged(p.c, 1, d); ctx.fill(); if (RAINF && !p.soft && p.pat !== 'water' && p.pat !== 'sea') { ctx.fillStyle = p.mid ? 'rgba(34,42,56,.2)' : 'rgba(40,48,62,.11)'; ctx.fill(); } if (SNOWF && !p.soft && p.pat !== 'water' && p.pat !== 'sea') { ctx.fillStyle = p.mid ? 'rgba(238,242,248,.16)' : 'rgba(242,245,250,.34)'; ctx.fill(); } /* [B47] 雪の日の外の道：雪が降っているのに地面がいつもの色だった。道はうすく、歩道は少し多く白く */ if (p.soft) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke(); continue; } if (SEAMF) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = SEAMLW; ctx.stroke(); } /* [床 S1] 床の板と板の合わせ目に、1 ドットより細いすき間（下の色が線になって見え、走るとチカチカ）ができていた。板のふちを同じ色で 0.45 ドットだけ外へぬる */ if (!lowQ || d < 14) { floorTexture(p, d, m, sg); project(p.v); } if (m === 4 && d < patFar) { if (!LODOFF && p.pat !== 'tatami') { const v = p.v, wl = Math.hypot(v[9] - v[0], v[10] - v[1], v[11] - v[2]); if (wl > .2) LWK = clamp(Math.hypot(SCR[6] - SCR[0], SCR[7] - SCR[1]) / wl / 45, .35, 1); } try { floorPattern(p, d); } finally { LWK = 1; } } else if (m < 0) clippedPattern(p, () => floorPattern(p, d)); } /* [遠く A9] 床の模様（タイルの目地・段の線・板の目）の線も、床の 1m が画面で 45 ドットより小さい所では、その分細く（遠くの床の線がつぶれてざらざら・チカチカしていた） */
  pm('floor'); streetShade(sg);
  objShadows(sg);
  if (isCur) drawShadows(sg); pm('shade');
  // walls, ceilings, decorations
  dclear();
  const wing = wingOn(sg), cap = wing || capOn(sg);
  const fallE = G.mode === 'dying' && G.fallSeg === sg; /* [塔 F11] 曲がりそこねて落ちる間は、つきあたりの壁と飾りを描かない（へりの先へ飛び出す） */
  const skyFar = skyRM && G.segs.indexOf(sg) > G.ci + 1; /* [着地 L2] 2026-11-23 オーナー「着地する時の景色のクオリティが低い」：空からおりる間、着地の公園の先の通りのビルの正面（道に向いた板だけで、屋根もうらも無い）が、木の上に、空にうかぶ白い板のように見えた。公園の先の通りのビルの正面は、着地してから描く（着地すると公園の木にかくれる高さ） */
  for (const w of sg.walls) { if (skyRM && w.far) continue; if (skyFar && w.pat === 'fac') continue; if (w.under) continue; if (fallE && w.endW) continue; /* [M67] 空から見る間は、着地の公園のうしろの町の正面（うすいかべ）を描かない（上から見ると屋根の無い板に見えた） */ if (w.wing && !wing) continue; if (w.cap && !cap) continue; if (!faceVisible(w)) continue; const d = depthOf(w.v); if (d >= FAR + 8 || depthMax(w.v) < -.5) continue; G.wallN = (G.wallN || 0) + 1; dput(d, 1, w); }
  const behind = G.segs.indexOf(sg) >= 0 && G.segs.indexOf(sg) < G.ci; // 曲がり終えた角の矢印の看板は描かない（横に浮いた板に見えていた）
  for (const e of sg.decos) { if (e.sign && behind) continue; if (e.endW && G.mode === 'dying' && G.fallSeg === sg) continue; if (!faceVisible(e)) continue; const d = depthOf(e.v); if (depthMax(e.v) < -.5 || d > (e.glow || e.pat === 'bigscreen' ? FAR : lowQ ? 70 : 90)) continue; /* [R14] 光る大画面は遠くでも見える */ dput(d - 1.6, 2, e); } /* 重い端末（lowQ）では遠くの小物を早めに間引く（C-58） */ // a decoration sits on a 3 m wall piece whose centre can be nearer than its own: drawn after the walls around it
  DRAW.sort(byE0);
  for (const [d, t, w] of DRAW) {
    if (oc && occAt(d - 2) !== Infinity) { occDraw(d - 2, () => drawWallItem(d, t, w)); continue; }
    drawWallItem(d, t, w);
  }
  pm('walls');
  // 坂の向こうの線（ガードレール・手すり）も、坂のかげに隠す（2026-11-09：渋谷の上り坂で、先の下り坂のガードレールが透けて見えた）。長い線は 4m ごとに分けて、それぞれの奥行きで
  const cur0 = G.segs[G.ci], walled = !isCur && cur0 && cur0 !== sg && cur0.th.kind === 'room' && G.segs.indexOf(sg) > G.ci; /* [T6] 部屋（塔の入口の建物など）の中にいる時は、この先の場所の線（塔の骨組み・手すり）を描かない（壁ごしに透けて見えた） */
  const okL = walled ? 0 : camOutK(sg), gaL = ctx.globalAlpha; if (okL < 1) ctx.globalAlpha = gaL * okL;
  if (okL <= 0) { } else
  if (oc) { for (const l of sg.lines) { const ps = linePieces(l);
      for (const piece of ps) { const d = segDepth(sg, (piece.a[0] + piece.b[0]) / 2, (piece.a[1] + piece.b[1]) / 2); G.occLines = (G.occLines || 0) + 1;
        const y = occAt(d); if (y === Infinity) drawLine(sg, piece); else if (y > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, y); ctx.clip(); try { drawLine(sg, piece); } finally { ctx.restore(); } } } } } /* occDraw と同じ（入れ物を作らない形） */
  else for (const l of sg.lines) drawLine(sg, l);
  ctx.globalAlpha = gaL; pm('lines');
  drawObjects(sg, isCur, oc);
}
function drawWallItem(d, t, w) {
  if (w.bf && (CAM.x - w.v[0]) * w.n[0] + (CAM.z - w.v[2]) * w.n[1] < 0) return; /* [塔 S1] 2026-11-21：外向きのかべ（屋上の建物の外かべなど）は、うら側から見る時は描かない（かべは床より後に描くので、屋上に立つと、床の下にあるはずの外かべが床の上にかぶり、地面が透けたように見えた） */
  { const m = project(w.v); if (!m) return;
    if (t === 1) {
      pathPoly(Math.abs(m));
      if (w.glass) { ctx.fillStyle = LT.night > .5 && !w.ceil && (LT.indoor || curSeg().th.kind === 'glass' || curSeg().th.core) ? 'rgba(120,140,185,.26)' : `rgba(200,225,240,${w.ceil ? .12 : .16})`; /* [塔 G10] 2026-11-21：夜の展望台の窓は、外より中が明るいので、ガラスに中の明かりがうっすらうつる（前は昼と同じ、ほとんど透明のガラス） */ ctx.fill(); if (m === 4) { const v = w.v, wl = Math.hypot(v[3] - v[0], v[4] - v[1], v[5] - v[2]); if (!LODOFF && wl > .2) LWK = clamp(Math.hypot(SCR[2] - SCR[0], SCR[3] - SCR[1]) / wl / 50, .3, 1); try { glassFrame(w); } finally { LWK = 1; } } return; } /* [遠く A17] ガラスの壁の枠の線も、遠くでは細く（太いままで、遠くのガラスの枠がチカチカした） */
      if (w.skKey !== SUNKEY2) { w.skKey = SUNKEY2; w.sk = w.n && !w.ceil ? sunK(w.n3 || w.n) : 1; }
      ctx.fillStyle = fogged(w.c, w.sh * w.sk, d); ctx.fill(); if (SEAMW && !w.thin) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = .9; ctx.stroke(); } /* [壁 S2] 壁・天井の板と板の合わせ目のすき間（空や向こうが細い線で見えてチカチカ）も、同じ色で 0.45 ドットふさぐ */
      /* [遠く A2] 壁・天井の模様の線も、壁の 1m が画面で 50 ドットより小さい時は、その分細くする（遠くのタイル・板の目地がつぶれてざらざら・チカチカしていた） */
      if (w.pat && w.pat !== 'fac' && !LODOFF) { const v = w.v, wl = Math.hypot(v[3] - v[0], v[4] - v[1], v[5] - v[2]); if (m === 4 && wl > .2) LWK = clamp(Math.hypot(SCR[2] - SCR[0], SCR[3] - SCR[1]) / wl / 50, .3, 1); }
      try {
      if (m === 4 && w.pat) { wallPattern(w, d); const kf = LODOFF || w.pat === 'fac' ? 1 : w.pat === 'roof' ? LODK(95, d) : LODK(60, d); if (kf < 1 && kf > 0 && project(w.v) === 4) { pathPoly(4); ctx.globalAlpha = 1 - kf; ctx.fillStyle = fogged(w.c, w.sh * w.sk, d); ctx.fill(); ctx.globalAlpha = 1; } } /* [近づく G14] 壁・天井の模様は 60m（屋根は 95m）でパッと出ていた。手前の 15% は、壁の地の色を上からうすく重ねて、模様をうすく出す */
      else if (m < 0 && w.pat) { if (w.pat === 'fac' && w.fv != null) drawFacadeTex(w, d); else if (w.pat !== 'ceil' || w.cp) clippedPattern(w, () => wallPattern(w, d)); }
      } finally { LWK = 1; }
    } else { const f = DECO_DRAW[w.pat]; if (!f) return; ctx.globalAlpha = (1 - fogK(d)) * (w.glow || w.pat === 'bigscreen' ? 1 : LODK(lowQ ? 70 : 90, d)); /* [近づく G15] 壁の飾り（看板・ポスター）も 90m の手前でうすく出る */
      /* [遠く A1] 壁の飾り（障子・ふすま・ポスター・上着など）の線の太さは、近くで見た時の太さ（ドット）で決めてあった。遠くで小さくなっても線は太いままで、
         組子や木目がつぶれてざらざら・チカチカしていた。飾りの画面の大きさに合わせて線を細くする（近くは今までどおり） */
      if (m === 4) { const sp = Math.max(Math.hypot(SCR[2] - SCR[0], SCR[3] - SCR[1]), Math.hypot(SCR[4] - SCR[6], SCR[5] - SCR[7])); LWK = LODOFF ? 1 : clamp(sp / 120, .3, 1); }
      try { if (m === 4) f(w, d); else clippedPattern(w, () => f(w, d)); } finally { LWK = 1; } ctx.globalAlpha = 1; }
  }
}
const obstacleHintQ = [];
let SKYV = false;
function drawObjects(sg, isCur, oc) { SKYV = !!(curSeg().th.sky);
  obstacleHintQ.length = 0;
  // objects
  dclear();
  for (const o of sg.obs) {
    if (o.dead > .9) continue;
    const mid = segPos(sg, (o.s0 + o.s1) / 2 + (o.ds || 0) + (o.dead ? o.dead * 6 + 3 : 0), (o.l0 + o.l1) / 2);
    const d = (mid[0] - CAM.x) * CAM.s + (mid[1] - CAM.z) * CAM.c; if (d < -3 || d > FAR) continue;
    dput(d, 3, o);
  }
  if (sg.movers) for (const m of sg.movers) { const mid = m.cross ? segPos(sg, (m.bx[0].s0 + m.bx[0].s1) / 2, (m.bx[0].l0 + m.bx[0].l1) / 2 + (m.dl || 0)) : segPos(sg, m.ds + 20, (m.bx[0].l0 + m.bx[0].l1) / 2); const d = (mid[0] - CAM.x) * CAM.s + (mid[1] - CAM.z) * CAM.c; if (d > -20 && d < FAR) dput(m.cross ? d + 8 : d, 8, m); } // 橋の上の電車は、橋げた・かべ高欄より先に描く（下から見上げても、電車の床下は橋げたにかくれる。2026-11-17）
  for (const p of sg.props) { if (p.nodraw || p.under) continue; const d = p.extOnly ? segDepth(sg, p.s0, 0) - .5 : segDepth(sg, (p.s0 + p.s1) / 2, (p.l0 + p.l1) / 2); /* [B40] 建物の外かべは、いちばん手前（入口）の深さで並べる（建物の中の物が、外かべの上に描かれて透けて見えた） */ if (d < -3 || d > (p.big || SKYV ? FAR : lowQ ? 60 : 85)) continue; /* [降りる時 D3] 降りる間は、下の公園のベンチ・街灯なども遠くから描く（近づいた時に急に出てこない） */ dput(d, 6, p); }
  for (const s of sg.spr) { if (s.under) continue; if (s.night && LT.night < .3) continue; if (s.img === 'glow' && LT.night < .3 && !LT.indoor) continue; const d = segDepth(sg, s.s, s.lat); if (d < .5 || d > (s.far || SKYV ? FAR : 80)) continue; /* [降りる時 D2] オオタカと降りる間は、下の公園の木や物が 80m より遠くても描く（前は、高い所では消え、近づくと急に出てきた） */ dput(d, 7, s); }
  // pigeons on the street: they peck about and fly off as you run up (2026-11-08)
  // rain: puddles on the street that splash when you run through (2026-11-08)
  if (sg.puddles === undefined && G.weather === 'rain') sg.puddles = puddlesFor(sg);
  if (sg.puddles && G.weather === 'rain') for (const q of sg.puddles) { const d = segDepth(sg, q.s, q.lat); if (d < .5 || d > 70) continue; dput(d + 4, 10, q); }
  if (sg.birds === undefined) sg.birds = birdsFor(sg);
  if (sg.birds && lowQ < 2) for (const b of sg.birds) { if (isCur && !b.fly && G.mode === 'play' && G.s > b.s - 5 && G.s < b.s + 2) b.fly = G.t; const fy = b.fly ? G.t - b.fly : 0; if (fy > 2.5) continue;
    const d = segDepth(sg, b.s + fy * 3, b.lat + b.dir * fy * 2.2); if (d < .8 || d > 60) continue; dput(d, 9, b); }
  /* [塔 F3] 2026-11-20 オーナー「タワーを登るときにチカチカ」：曲がっている間は、となりの道（一つ前・一つ先）のチモシーだけ描く。前は、曲がった瞬間のコマだけ、
     2〜3 本先（展望台・空）のチモシーまで描かれて、階段の上に 1 コマだけ光って見えた。まっすぐつながった次の道のチモシーは、角で急に出ないよう、いつも描く */
  const iRel = isCur ? 0 : G.segs.indexOf(sg) - G.ci, nxS = iRel === 1 && sg.turnIn === 0 && !sg.prevFork;
  if (isCur || (G.turnT > 0 && (iRel === 1 || iRel === -1)) || nxS) for (const it of sg.items) {
    if (it.got || (isCur && it.s < G.s - 3)) continue; /* 取りのがした物も、カメラの後ろに行くまで見えたまま（すぐ消えない） */
    const d = segDepth(sg, it.s, it.lat); if (d < .5 || d > 75) continue;
    dput(d, 4, it);
  }
  if (isCur && G.player.show) { if (!G.player.fallHide) dput(G.player.depth, 5, G.player); /* [塔 F11] へりより下へ落ちたら見えない */ if (G.follow.show) dput(G.follow.depth, 5, G.follow); if ((G.pom.on || G.pom.title) && G.pom.show) dput(G.pom.depth, 5, G.pom); if (G.pomPeek && G.pomPeek.seg === sg && G.pomPeek.b.show) dput(G.pomPeek.b.depth, 5, G.pomPeek.b); }
  DRAW.sort(byE0);
  pm('sort');
  for (const e of DRAW) {
    if (oc && e[1] !== 5 && occAt(e[0]) !== Infinity) { occDraw(e[0], () => drawObj(e, sg)); continue; }
    drawObj(e, sg);
  }
}
function drawObj(e, sg) {
  {
    if (e[1] === 3) { drawObstacle(e[2], sg, e[0]); pm('obs'); }
    else if (e[1] === 6) { const p = e[2]; if (p.extOnly && sg === G.segs[G.ci]) return; const tk = p.tall ? camOutK(sg) : 1; if (tk <= 0) return; /* [B40] 建物の外からだけ見る物（中に入ったら描かない） */ if (!p.fc) { p.fc = []; for (const b of p.bx) for (const fc of boxFaces(sg, b, 0, 0, 0)) p.fc.push([fc, b]); } drawBoxes(null, sg, e[0], tk * ((p.l0 < ROAD && p.l1 > -ROAD) ? passFade(e[0]) : 1), 0, 0, 0, p.fc); pm('props'); } // 道のわきの家具・箱は、通りすぎてもうすくしない（2026-11-17）
    else if (e[1] === 7) { drawSpr(e[2], sg, e[0]); pm('spr'); }
    else if (e[1] === 8) drawBoxes(moverBoxes(e[2]), sg, e[0], 1, e[2].cross ? 0 : e[2].ds, e[2].cross ? e[2].dl || 0 : 0, 0);
    else if (e[1] === 4) { drawItem(e[2], sg, e[0]); pm('items'); }
    else if (e[1] === 9) drawBird(e[2], sg, e[0]);
    else if (e[1] === 10) drawPuddle(e[2], sg, e[0] - 4);
    else { const d0 = CTXD; try { drawBunnyWorld(e[2]); } catch (x) { while (CTXD > d0) ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; reportErr(x); } pm('bunny'); }
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
/* 通りすぎた物（自分よりカメラ側）はうすく：近くの大きな物が前をふさがない */
function passFade(d) { const pd = G.player.depth || 0; if (G.mode !== 'play' || pd < 1.5 || d >= pd - .8) return 1; G.passFadeN = (G.passFadeN || 0) + 1; return clamp(.3 + .7 * d / (pd - .8), .3, 1); }
function drawObstacle(o, sg, d) {
  if (o.art && drawArt(o, sg, d)) return; // the illustrations are one image each: cheaper than boxes, so always used
  if (!o.mv && !o.dead) { if (!o.fc) { o.fc = []; for (const b of o.bx) for (const fc of boxFaces(sg, b, 0, 0, 0)) o.fc.push([fc, b]); } drawBoxes(null, sg, d, passFade(d), 0, 0, 0, o.fc); return; }
  const lift = o.dead ? o.dead * o.dead * 9 : 0, side = o.dead ? o.dead * 7 * (o.vx || 1) : 0;
  drawBoxes(o.bx, sg, d, o.dead ? clamp(1 - o.dead * 1.2, 0, 1) : 1, (o.ds || 0) + (o.dead ? o.dead * 6 : 0), side, lift);
}
const SPA = [0, 0, 0], SPB = [0, 0, 0];
function segPosTo(seg, s, lat, o) { o[0] = seg.sx + seg.f[0] * s + seg.r[0] * lat; o[1] = seg.sz + seg.f[1] * s + seg.r[1] * lat; o[2] = segE(seg, s); return o; } // segPos と同じ（答えを o に入れる）
/* [塔 T210] 2026-11-23 オーナー「東京タワーの最初の階段を登り終わった直後の右折で、地面が透けている」：
   入口の建物の中から屋上へ曲がる時、モチたちが角のまん中をこえると、今いる場所が屋上に変わるが、カメラはまだ建物の中（角の部屋）にいる。
   屋上の物（太いエレベーターの塔・塔の脚の線）は、建物の部屋のかべ・天井より後に描くので、かべと天井をつきぬけて、手前に大きく見えた（前の T6 は、建物の中を走っている間だけ止めていた）。
   カメラが前の部屋の中（角の出口より手前）にいる間は、屋上の高い物と線を描かない */
function camOutK(sg) { const cur = G.segs[G.ci]; if (sg !== cur || G.mode === 'title') return 1; const pv = G.segs[G.ci - 1]; if (!pv || pv.th.kind !== 'room' || IN_K(cur.th.kind)) return 1;
  const o = segPos(sg, 0, 0), q = segPos(sg, 1, 0), fx = q[0] - o[0], fz = q[1] - o[1]; return clamp(((CAM.x - o[0]) * fx + (CAM.z - o[1]) * fz - HW - .2) / 3, 0, 1); } /* 出口をこえてから 3m で、ふわっと出す（ぱっと出ない） */
function drawLine(sg, l) {
  const a = segPosTo(sg, l.a[0], l.a[1], SPA), b = segPosTo(sg, l.b[0], l.b[1], SPB); /* [軽く 3-15] 入れ物を使い回す */
  if (l.abs) { const e0 = sg.e0 || 0; a[2] = e0; b[2] = e0; } /* [塔 L3] abs の線は、床の上がり下がりに合わせない（塔の骨組み） */
  tc(a[0], l.a[2] + a[2], a[1], TMP, 0); tc(b[0], l.b[2] + b[2], b[1], TMP, 3);
  let z0 = TMP[2], z1 = TMP[5]; if (z0 < NEAR && z1 < NEAR) return; if (z0 > 95 && z1 > 95) return;
  let x0 = TMP[0], y0 = TMP[1], x1 = TMP[3], y1 = TMP[4];
  if (z0 < NEAR) { const t = (NEAR - z0) / (z1 - z0); x0 += (x1 - x0) * t; y0 += (y1 - y0) * t; z0 = NEAR; }
  if (z1 < NEAR) { const t = (NEAR - z1) / (z0 - z1); x1 += (x0 - x1) * t; y1 += (y0 - y1) * t; z1 = NEAR; }
  const zm = (z0 + z1) / 2, glow = l.glowN && LT.night > .4;
  /* [遠く A5] 遠くの細い線（電線・線路・手すり）は、前は 0.7 ドットより細くしなかったので、遠いほど本当より太く・濃く、走ると線がちらちらした。
     本当の太さが 1.2 ドットより細い時は、1.2 ドットの太さで、その分うすく描く（線の濃さの合計は本当の太さと同じ）。[遠く A6] 95m で消える手前の 80〜95m はうすく */
  const tw = l.w * FOCAL / zm; let fa = LODOFF ? 1 : (glow ? 1 : clamp(tw / 1.2, .2, 1)) * clamp((95 - Math.min(z0, z1)) / 15, 0, 1);
  /* [塔 F4] 2026-11-20 オーナー「タワーを登るときにチカチカ」：外階段の金網の柱は 1.2m ごとで、遠くでは柱と柱の間が 1〜2 ドットになり、登るたびに縞がちらちらした。
     遠くなるにつれ、まず 2 本に 1 本、次に 4 本に 1 本を、少しずつうすくして消す（ぱっと消さない）。金網そのものの絵は残るので、見た目は金網のまま */
  if (l.pi != null && !LODOFF) { const lv = l.pi % 4 === 0 ? 0 : l.pi % 2 === 0 ? 1 : 2; if (lv) { fa *= lv === 2 ? clamp((16 - zm) / 7, 0, 1) : clamp((32 - zm) / 9, 0, 1); if (fa <= 0) return; } }
  ctx.strokeStyle = glow ? '#FFF6E0' : fogged(C(l.c), 1, zm); ctx.lineWidth = LODOFF ? Math.max(.7, tw) : Math.max(1.2, tw); ctx.lineCap = 'round'; const ga = ctx.globalAlpha; ctx.globalAlpha = ga * fa;
  ctx.beginPath(); ctx.moveTo(W / 2 + x0 * FOCAL / z0, HORIZON - y0 * FOCAL / z0); ctx.lineTo(W / 2 + x1 * FOCAL / z1, HORIZON - y1 * FOCAL / z1); ctx.stroke(); ctx.globalAlpha = ga;
}
/* [遠く A10] 道ばたの絵（標識の柱・看板・木・人）を大きな絵から小さく縮めて描くと、細い柱や字が 1 ドットより細くなり、走ると出たり消えたりしてチカチカした。
   前もって 1/2・1/4・1/8 に、なめらかに縮めた絵を作っておき、画面での大きさに合った絵を使う（壁の絵と同じやり方） */
const SPR_MIP = new WeakMap();
function sprMip(img, dw) { if (LODOFF || !img || !img.width || img.width < 48 || dw >= img.width * .5) return img; let m = SPR_MIP.get(img); if (!m) { m = []; SPR_MIP.set(img, m); }
  const lv = dw < img.width * .125 ? 2 : dw < img.width * .25 ? 1 : 0; if (m[lv]) return m[lv];
  const src = lv ? sprMip(img, img.width * (lv === 2 ? .2 : .4)) : img; if (src.width < 16) return src; const c = document.createElement('canvas'); c.width = Math.max(8, src.width >> 1); c.height = Math.max(8, src.height >> 1); const g = c.getContext('2d'); if (!g) return img;
  g.imageSmoothingQuality = 'high'; g.drawImage(src, 0, 0, c.width, c.height); m[lv] = c; return c; }
function drawSpr(s, sg, d) {
  const p = segPos(sg, s.s, s.lat), sp = spriteAt(p[0], s.y + p[2], p[1]); if (!sp) return;
  const nm = s.pn && LT.night > .35 && SPR[s.img + 'N'] ? s.img + 'N' : LT.night > .35 && (s.img === 'canopy_illum' || ((s.nv || s.img === 'canopy_sakura') && SPR[s.img + 'N'])) ? (s.img === 'canopy_illum' ? 'canopy_illumN' : s.img + 'N') : s.img === 'canopy_illum' ? 'canopy_green' : s.img; const nmS = G.weather === 'snow' && !LT.indoor && SPR[nm + 'S'] ? nm + 'S' : nm; /* [B48] 雪の日は、雪をのせた木の絵 */
  const nm2 = s.walk ? s.imgs[((G.t * 6.5 + s.ph) | 0) % s.imgs.length] : nmS;
  let img = SPR[nm2] || (SPR_PEND[nm2] && d < 45 ? sprPaint(nm2) : null); if (!img || !img.width) return;
  if (!s.glow && s.img !== 'glow' && nm === s.img) img = litSprite(img, LT.amb); // trees and signs darken with the evening light
  const w = s.w * sp.k, h = s.h * sp.k;
  ctx.globalAlpha = (1 - fogK(d) * .9) * (s.far || SKYV ? 1 : LODK(80, d)) * (LODOFF || s.nv || s.beamY ? 1 : clamp((d - .5) / .7, 0, 1)); /* [近く N1] カメラの真横を通りすぎる道ばたの絵は、0.5m で急に消えず、1.2m から うすくなって消える（曲がり角でカメラが向きを変える時、出たり消えたりした） */ /* [近づく G8] 道ばたの木・絵は 68〜80m でうすく出る（前は 80m でパッと出た） */
  /* 2026-11-17 オーナー「走ってると通り過ぎた景色が消えていく（特に街を走る時）。現実味のないバグ」：道のわきの木・看板・自動販売機などが、横を通る手前でうすくなって消えていた
     （走る人をかくさないための仕組みが、道の外の物にもかかっていた）。うすくするのは、走る 3 レーンの真上・まん中にある物だけにする。道のわきの物は、画面の外へ出るまで、はっきり見えたまま */
  const overRoad = Math.abs(s.lat) < 1.6;
  if (s.nv && d < 9 && overRoad) ctx.globalAlpha *= clamp((d - 1.5) / 7.5, 0, 1); // crowns right over the lanes fade as you pass under them, so the way ahead stays clear
  else if (s.beamY && d < 3.6) { ctx.globalAlpha *= clamp((d - 1.3) / 2.3, 0, 1); G.gateFadeN = (G.gateFadeN || 0) + 1; } /* くぐる鳥居は、カメラの横を通りすぎる手前ですっと消える（上の数字の後ろを赤い横木がちらちら横切らない）（2026-11-15） */
  else if (s.y > 1.9 && !s.trunk && d < 6 && Math.abs(s.lat) < ROAD) { ctx.globalAlpha *= clamp((d - 1) / 5, 0, 1); G.sprFadeN = (G.sprFadeN || 0) + 1; } /* 頭の上の吊り広告・看板は近づくと消える（画面の上半分とHUDをふさがない） */
  if (s.img === 'glow') { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= LT.indoor ? .35 : .55 * LT.night; }
  if (s.trunk) { // one piece: a tapered trunk with a little root flare, and the crown sitting on it
    const tw = w * .055, top = sp.sy - h * .52; const gr = ctx.createLinearGradient(sp.sx - tw, 0, sp.sx + tw, 0); gr.addColorStop(0, tint('#4E3A2E')); gr.addColorStop(.4, tint('#7A5E48')); gr.addColorStop(1, tint('#3E2E24'));
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(sp.sx - tw * 1.7, sp.sy); ctx.quadraticCurveTo(sp.sx - tw, sp.sy - h * .04, sp.sx - tw, sp.sy - h * .1); ctx.lineTo(sp.sx - tw * .55, top); ctx.lineTo(sp.sx + tw * .55, top); ctx.lineTo(sp.sx + tw, sp.sy - h * .1); ctx.quadraticCurveTo(sp.sx + tw, sp.sy - h * .04, sp.sx + tw * 1.7, sp.sy); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = tint('#5A4436'); ctx.lineWidth = Math.max(1, tw * .5); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sp.sx, top + h * .08); ctx.lineTo(sp.sx - w * .14, top - h * .05); ctx.moveTo(sp.sx + tw * .2, top + h * .04); ctx.lineTo(sp.sx + w * .16, top - h * .08); ctx.stroke();
    ctx.drawImage(sprMip(img, w), sp.sx - w / 2, sp.sy - h, w, h * .74); }
  else ctx.drawImage(sprMip(img, w), sp.sx - w / 2, sp.sy - h, w, h);
  if (!s.glow && s.img !== 'glow' && LT.amb[0] < .95) { ctx.globalCompositeOperation = 'source-atop'; }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
function puddlesFor(sg) { const k = sg.th && sg.th.kind; if (!k || k === 'room' || k === 'train' || !(sg.len > 30)) return null; const out = [], n = 2 + ((Math.random() * 3) | 0);
  for (let i = 0; i < n; i++) out.push({ s: 12 + Math.random() * (sg.len - 24), lat: LANES[(Math.random() * 3) | 0] + (Math.random() - .5) * .5, w: .7 + Math.random() * .5, hit: 0 });
  return out; }
function drawPuddle(q, sg, d) { const p = segPos(sg, q.s, q.lat), sp = spriteAt(p[0], p[2] + .01, p[1]); if (!sp) return; const rx = sp.k * q.w * .9, ry = rx * .28;
  ctx.save(); ctx.globalAlpha = (1 - fogK(d) * .9) * .85 * LODK(70, d) /* [近づく G12] 雨の水たまりも 60〜70m でうすく出る */; ctx.fillStyle = LT.night > .5 ? 'rgba(70,90,130,.55)' : 'rgba(150,170,195,.5)'; ctx.beginPath(); ctx.ellipse(sp.sx, sp.sy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = Math.max(1, sp.k * .015); const r = (G.t * .9 + q.s) % 1; ctx.beginPath(); ctx.ellipse(sp.sx + rx * .2, sp.sy, rx * .5 * r, ry * .5 * r, 0, 0, Math.PI * 2); ctx.globalAlpha *= 1 - r; ctx.stroke();
  ctx.restore(); }
function birdsFor(sg) { const k = sg.th && sg.th.kind; if (!k || k === 'room' || k === 'train' || k === 'glass' || (sg.th.climb && sg.th.climb[1] > 30) || sg.fork /* 電波塔コース PDCA 107（2026-11-17）：地上 350m の展望デッキの中や外階段の上に、ハトが歩いていた */ || Math.random() > .4 || !(sg.len > 50)) return null;
  const s0 = 25 + Math.random() * (sg.len - 45), lane = (Math.random() * 3) | 0, out = [], n = 3 + ((Math.random() * 3) | 0);
  for (let i = 0; i < n; i++) out.push({ s: s0 + Math.random() * 3, lat: LANES[lane] + (Math.random() - .5) * 1.2, ph: Math.random() * 6, dir: Math.random() < .5 ? -1 : 1, flip: Math.random() < .5, fly: 0 });
  return out; }
function drawBird(b, sg, d) { const fy = b.fly ? G.t - b.fly : 0, p = segPos(sg, b.s + fy * 3, b.lat + b.dir * fy * 2.2), y = fy > 0 ? fy * 2.4 + fy * fy * 1.2 : 0;
  const sp = spriteAt(p[0], p[2] + y, p[1]); if (!sp) return; const k = sp.k, f = b.flip ? -1 : 1, peck = !b.fly ? Math.max(0, Math.sin(G.t * 4 + b.ph)) : 0;
  ctx.save(); ctx.globalAlpha = (1 - fogK(d) * .9) * (fy > 1.8 ? Math.max(0, (2.5 - fy) / .7) : 1) * LODK(60, d); /* [近づく G9] ハトも 51〜60m でうすく出る */ ctx.translate(sp.sx, sp.sy); ctx.scale(f, 1);
  if (!b.fly) { ctx.fillStyle = 'rgba(30,22,16,.14)'; ctx.beginPath(); ctx.ellipse(0, 0, k * .16, k * .04, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#C0705A'; ctx.lineWidth = Math.max(1, k * .02); ctx.beginPath(); ctx.moveTo(-k * .03, 0); ctx.lineTo(-k * .03, -k * .07); ctx.moveTo(k * .03, 0); ctx.lineTo(k * .03, -k * .07); ctx.stroke(); }
  const by = -k * .16; ctx.fillStyle = '#8E949E'; ctx.beginPath(); ctx.ellipse(0, by, k * .17, k * .1, -.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6E7480'; ctx.beginPath(); ctx.moveTo(-k * .14, by); ctx.lineTo(-k * .26, by - k * .02); ctx.lineTo(-k * .14, by + k * .05); ctx.fill(); // tail
  if (b.fly) { const w = Math.sin(G.t * 26 + b.ph) * k * .16; ctx.fillStyle = '#A3A9B3'; ctx.beginPath(); ctx.moveTo(-k * .05, by - k * .02); ctx.quadraticCurveTo(-k * .02, by - k * .12 - w, k * .1, by - k * .2 - w); ctx.lineTo(k * .06, by - k * .02); ctx.fill(); }
  else { ctx.fillStyle = '#A3A9B3'; ctx.beginPath(); ctx.ellipse(-k * .02, by - k * .01, k * .1, k * .05, -.2, 0, Math.PI * 2); ctx.fill(); }
  const hx = k * .14, hy = by - k * .07 + peck * k * .07; ctx.fillStyle = '#5E8C7A'; ctx.beginPath(); ctx.ellipse(k * .1, by - k * .04 + peck * k * .03, k * .05, k * .06, .3, 0, Math.PI * 2); ctx.fill(); // shiny neck
  ctx.fillStyle = '#7A808C'; ctx.beginPath(); ctx.arc(hx, hy, k * .055, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E8C9A0'; ctx.beginPath(); ctx.moveTo(hx + k * .05, hy); ctx.lineTo(hx + k * .1, hy + k * .015); ctx.lineTo(hx + k * .05, hy + k * .025); ctx.fill();
  ctx.fillStyle = '#1E1A18'; ctx.beginPath(); ctx.arc(hx + k * .02, hy - k * .01, Math.max(1, k * .012), 0, Math.PI * 2); ctx.fill();
  ctx.restore(); ctx.globalAlpha = 1; }
function drawItem(it, sg, d) {
  const p = segPos(sg, it.s, it.lat); const sp = spriteAt(p[0], p[2] + it.y + Math.sin(G.t * 3 + it.ph) * .06, p[1]); if (!sp) return;
  const def = ITEMS[it.type]; const isPow = def.kind === 'power' || def.kind === 'stamp' || def.kind === 'pom', bad = def.kind === 'bad';
  const size = (it.type === 'hay' ? .74 : isPow ? .9 : .7) * sp.k; // a little bigger: the hay was hard to see on a phone
  const spin = it.type === 'hay' || it.type === 'goldhay' || isPow ? 1 - .28 * (1 - Math.cos(G.t * 3.2 + it.ph)) / 2 * 2 * (LODOFF ? 1 : clamp((34 - d) / 16, .15, 1)) : 1; /* [塔 I1] 2026-11-20 オーナー「タワーで出てくるアイテムがチカチカ」：くるくる回る（はばがのびちぢみする）チモシーが、まっすぐの長い階段では遠くまで何十本も並び、遠くの小さいものほど細い線になったり太くなったりしてチカチカして見えた。遠くの物は回り方を小さく（近くは今までどおり） */
  { const t = G.t || 0; if (!(it.__vt > t - .05) || it.__vt > t) it.__va = 0; it.__va = Math.min(1, (it.__va || 0) + (t - (it.__vt || t)) / .18 + .001); it.__vt = t; } /* [T200] 2026-11-23 オーナー「タワーに入った時にアイテムがチカチカ」：牧草が 1 コマだけ見えて消え、また出る（階段のかげの切りかわり）のが点滅に見えた。取る物は、見え始めから 0.18 秒かけて出す（1 コマだけの出入りは、ほとんど見えない）。消えて 0.05 秒たった物は、また 0 から */
  ctx.globalAlpha = (it.__va || 0) * (1 - fogK(d) * .9) * passFade(d) * LODK(75, d) * (LODOFF ? 1 : clamp((d - .5) / .7, 0, 1)); /* [近く N2] 取る物も同じ */ /* [近づく G10] 牧草などの取る物も 64〜75m でうすく出る */
  if (d < 40 && !lowQ && !sg.th.sky) { const gp = spriteAt(p[0], p[2], p[1]); if (gp) { const hk = clamp(1 - it.y / 3, .35, 1); ctx.fillStyle = `rgba(30,22,16,${(.16 * hk * LODK(40, d)).toFixed(3)})`; /* [近づく G11] 取る物の足もとのかげも 34〜40m でうすく出る */ ctx.beginPath(); ctx.ellipse(gp.sx, gp.sy, size * .34 * hk, size * .09 * hk, 0, 0, Math.PI * 2); ctx.fill(); } } // a soft shadow on the ground under each item (2026-11-08)
  if (isPow || it.type === 'goldhay') { ctx.beginPath(); ctx.fillStyle = def.kind === 'stamp' ? 'rgba(255,120,110,.45)' : 'rgba(255,236,150,.5)'; ctx.arc(sp.sx, sp.sy, size * .62 * (1 + .08 * Math.sin(G.t * 6)), 0, Math.PI * 2); ctx.fill(); }
  const img = def.kind === 'stamp' ? stampSprite(sg.tid) : SPR[bad ? it.type + 'NG' : it.type];
  ctx.drawImage(sprMip(img, size), sp.sx - size * spin / 2, sp.sy - size / 2, size * spin, size); /* [遠く A11] 牧草などの取る物も、遠くでは小さくした絵で（細い葉がチカチカしない） */
  ctx.globalAlpha = 1;
}
// soft contact shadows under obstacles and furniture
function objShadows(sg) {
  ctx.fillStyle = 'rgba(30,22,16,.16)';
  const one = (s0, s1, l0, l1) => {
    const p = segPosTo(sg, (s0 + s1) / 2, (l0 + l1) / 2, SPA), sp = spriteAt(p[0], p[2], p[1]); if (!sp || sp.z > 55) return; /* [軽く 3-24] 入れ物・関数を毎回作らない（同じかげ） */
    const rx = Math.min(3, (l1 - l0) / 2 + .15) * sp.k, ry = Math.min(2, (s1 - s0) / 2 + .1) * sp.k * .35;
    let y = Infinity; if (sg === G.segs[G.ci] && OCC.on) { y = occAt(sp.z); if (y <= 0) return; } // 坂の頂上の向こうの物のかげは、手前の坂に重ねない
    if (y !== Infinity) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, y); ctx.clip(); }
    ctx.fillStyle = 'rgba(30,22,16,.16)'; ctx.beginPath(); ctx.ellipse(sp.sx, sp.sy, rx, Math.max(1, ry), 0, 0, Math.PI * 2); ctx.globalAlpha = LODK(55, sp.z); ctx.fill(); ctx.globalAlpha = 1; if (y !== Infinity) ctx.restore(); /* [近づく C1] 物の足もとのかげは 47〜55m でうすく出る（前は 55m でパッと出た） */
  };
  for (const o of sg.obs) if (!o.dead && !o.full && o.k !== 'high' && o.top < 3.5) one(o.s0 + (o.ds || 0), o.s1 + (o.ds || 0), o.l0, o.l1);
  for (const p of sg.props) if (!p.big && p.bx[0] && p.bx[0].y0 <= .05) one(p.s0, p.s1, p.l0, p.l1);
  for (const q of sg.spr) if (q.gnd) one(q.s - .3, q.s + .3, q.lat - q.gnd, q.lat + q.gnd);
  // at night, street lamps and paper lanterns throw warm pools of light on the ground
  if (LT.night > .3 && !LT.indoor) {
    ctx.globalCompositeOperation = 'lighter';
    for (const p of sg.props) { const lb = p.lamp; if (!lb) continue;
      const q = segPos(sg, (p.s0 + p.s1) / 2, (p.l0 + p.l1) / 2), sp = spriteAt(q[0], q[2], q[1]); if (!sp || sp.z > 70) continue;
      const R = (lb.y1 > 3 ? 2.6 : 1.5) * sp.k; if (R < 3) continue; const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); ctx.globalAlpha = LODK(70, sp.z) * (LODOFF ? 1 : clamp((R - 3) / 4, 0, 1)); /* [近づく C2・C3] 夜の街灯・ちょうちんの足もとの明かりも、70m・小さい所でパッと出ない */
      g.addColorStop(0, `rgba(255,200,120,${(.22 * LT.night).toFixed(3)})`); g.addColorStop(.5, `rgba(255,200,120,${(.08 * LT.night).toFixed(3)})`); g.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.save(); ctx.translate(sp.sx, sp.sy); ctx.scale(R, R * .38); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
}
let SHG = null; function softShadow() { if (SHG) return SHG; SHG = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); SHG.addColorStop(0, 'rgba(30,22,16,.34)'); SHG.addColorStop(.55, 'rgba(30,22,16,.2)'); SHG.addColorStop(1, 'rgba(30,22,16,0)'); return SHG; }
function drawShadows(seg) {
  if (seg.th.sky) return; // 空の上：足もとに地面が無いので、かげも無い
  ctx.fillStyle = 'rgba(30,22,16,.22)';
  const sh = (s, lat, r, a) => { const p = segPos(seg, s, lat); const sp = spriteAt(p[0], p[2], p[1]); if (!sp) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(sp.sx, sp.sy); ctx.scale(r * sp.k * 1.15, r * sp.k * .34); ctx.fillStyle = softShadow(); ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }; // a soft-edged pool, darkest under the feet
  if (G.player.show && G.mode !== 'title') { if (!(G.mode === 'dying' && G.cause === 'fall')) sh(G.s, G.lat, .55, clamp(1 - G.y * .3, .25, 1)); if (G.follow.show) sh(G.s - G.follow.back, G.follow.lat, .46, .8); if (G.pom.on && G.pom.show) sh(G.s - G.pom.back, G.pom.lat, G.pom.who === 'pom' ? .32 : .46, .75); }
  ctx.globalAlpha = 1;
}
/* うさぎに当たる夕方の色はひかえめに（赤むらさきに染まりすぎて、だれだか分からなくなっていた）。明るさは残して色味だけ弱める */
function bunnyAmb() { const a = LT.amb.map(x => x + (1 - x) * .45), m = (a[0] + a[1] + a[2]) / 3; return a.map((x, i) => Math.max(i === 2 ? .58 : .55, m + (x - m) * .45)); }
/* オオタカ（2026-11-17）：うしろ・少し上から見た、成鳥のオオタカ。
   背中と翼の上は青みのある灰黒色、風切羽の先はこい色で指のように 6 本に分かれる（タカの仲間の丸い翼）。
   尾は長く、こい横帯が 4 本・先が白い。頭は黒っぽく、目の上に白いまゆ（白い眉斑）。足は黄色。
   ふだんは翼を広げてすべるように飛び（滑空）、ときどき重そうに 2〜3 回はばたく。かぎづめで背中の上（首のうしろ）をそっとつかむ */
function drawHawk(b) {
  const k = b === G.player ? 0 : b === G.follow ? 1.7 : 3.1, t = G.t + k, rel = b.hawkRel || 0, cyc = (t * (.55 + rel * 1.6)) % 1, flapping = rel > 0 || cyc > .62, fl = rel > 0 ? Math.sin(t * 14) : flapping ? Math.sin((cyc - .62) / .38 * Math.PI * 3) : Math.sin(t * 1.3) * .08; /* [D4] はなす時は速く羽ばたく */
  if (b.hawkIn != null && b.hawkIn < 1) { const q = 1 - b.hawkIn; ctx.translate(-q * 160, -q * q * 1100); ctx.globalAlpha *= clamp(b.hawkIn * 3, 0, 1); } /* [F4] つかむ前：ななめ上から、おりてくる */
  if (rel > .2) { const q = (rel - .2) / .8; ctx.translate(Math.sin(k * 2) * q * 220, -q * q * 900); ctx.globalAlpha *= 1 - q * .6; ctx.scale(1 - q * .45, 1 - q * .45); } /* [D5] 足をはなしたオオタカは、ななめ上へ飛び去って小さくなる */
  const T = c => tint(c), up = -fl * 70, x0 = Math.sin(t * .9) * 6;
  ctx.save(); ctx.translate(x0, -335 + fl * 8);
  // 足：黄色いすね・白い羽毛の「ズボン」・黒いかぎづめ。首のうしろ（両肩）をつかむ
  ctx.lineCap = 'round';
  for (const sd of [-1, 1]) { ctx.strokeStyle = T('#E2B53A'); ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(sd * 16, 40); ctx.quadraticCurveTo(sd * 30, 100, sd * 44, 150); ctx.stroke();
    ctx.fillStyle = T('#EDEFF0'); ctx.beginPath(); ctx.ellipse(sd * 18, 52, 15, 24, sd * -.2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = T('#9AA3AD'); ctx.lineWidth = 2; for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.moveTo(sd * 8, 42 + j * 9); ctx.lineTo(sd * 28, 46 + j * 9); ctx.stroke(); }
    ctx.strokeStyle = T('#23262B'); ctx.lineWidth = 6; for (const a of [-.6, 0, .6]) { ctx.beginPath(); ctx.moveTo(sd * 44, 150); ctx.quadraticCurveTo(sd * (44 + Math.sin(a) * 26), 154, sd * (44 + Math.sin(a) * 22), 172); ctx.stroke(); } }
  // 尾：手前に向かって長い扇形。こい横帯 4 本と白い先
  ctx.save(); ctx.beginPath(); ctx.moveTo(-16, 30); ctx.lineTo(-38, 128); ctx.quadraticCurveTo(0, 146, 38, 128); ctx.lineTo(16, 30); ctx.closePath(); ctx.fillStyle = T('#69727D'); ctx.fill(); ctx.clip();
  ctx.fillStyle = T('#3A4048'); for (let j = 0; j < 4; j++) ctx.fillRect(-50, 46 + j * 21, 100, 8); ctx.fillStyle = T('#F1F2F2'); ctx.fillRect(-50, 128, 100, 20); ctx.restore();
  // 翼（左右）：付け根は灰色、外は濃く、先は指のように分かれた 6 本の羽
  for (const sd of [-1, 1]) {
    const tipX = sd * 300, tipY = -6 + up;
    ctx.beginPath(); ctx.moveTo(sd * 24, -14); ctx.bezierCurveTo(sd * 110, -54 + up * .3, sd * 210, -40 + up * .7, tipX, tipY); ctx.lineTo(sd * 250, 24 + up * .8); ctx.bezierCurveTo(sd * 170, 58 + up * .5, sd * 80, 52 + up * .2, sd * 22, 34); ctx.closePath();
    const gr = ctx.createLinearGradient(0, 0, tipX, 0); gr.addColorStop(0, T('#7A8490')); gr.addColorStop(.55, T('#5D6672')); gr.addColorStop(1, T('#3B414A')); ctx.fillStyle = gr; ctx.fill();
    for (let j = 0; j < 6; j++) { const q = j / 5, fx = sd * (236 + q * 78), fy = 8 + up * .92 - q * 26 + (j % 2) * 4; ctx.fillStyle = T(j % 2 ? '#353A42' : '#2E333A'); ctx.beginPath(); ctx.ellipse(fx, fy, 40, 9, sd * (.15 + q * .45), 0, Math.PI * 2); ctx.fill(); }
    if (!lowQ) { for (let j = 0; j < 11; j++) { const q = (j + .5) / 11, bx = sd * (26 + q * 220), by = 36 + q * 2 + up * (q * .8) + Math.sin(q * 3.1) * 18; ctx.fillStyle = T(j % 2 ? '#4C5560' : '#454D57'); ctx.beginPath(); ctx.ellipse(bx, by, 13, 9, 0, 0, Math.PI); ctx.fill(); ctx.strokeStyle = 'rgba(235,238,240,.18)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(bx, by, 13, 9, 0, .2, Math.PI - .2); ctx.stroke(); } /* [D16] 翼のうしろのふち：風切り羽の先が 1 枚ずつ（ぎざぎざ）、先に白っぽいふち */
      for (let row = 0; row < 2; row++) for (let j = 0; j < 7 - row * 2; j++) { const q = (j + .5) / (7 - row * 2) * (.75 - row * .2), bx = sd * (40 + q * 230), by = -8 + row * 16 - q * 10 + up * q * .55; ctx.strokeStyle = row ? 'rgba(210,216,222,.22)' : 'rgba(225,230,235,.18)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(bx, by, 10 - row * 2, .15, Math.PI - .15); ctx.stroke(); } } /* [D17] 翼の付け根の小さな羽（雨おおい）のうろこ模様 2 列 */
    ctx.strokeStyle = 'rgba(30,34,40,.35)'; ctx.lineWidth = 2.5; for (let j = 1; j < 5; j++) { const q = j / 5; ctx.beginPath(); ctx.moveTo(sd * (60 + q * 150), 46 - q * 6 + up * q * .6); ctx.lineTo(sd * (70 + q * 160), 6 - q * 18 + up * q * .7); ctx.stroke(); } // 羽のすじ
    ctx.strokeStyle = LT.night > .4 ? 'rgba(200,214,255,.55)' : 'rgba(255,255,255,.22)'; ctx.lineWidth = LT.night > .4 ? 4 : 3; ctx.beginPath(); ctx.moveTo(sd * 28, -16); ctx.bezierCurveTo(sd * 110, -54 + up * .3, sd * 210, -40 + up * .7, tipX, tipY); ctx.stroke(); }
  // 胴と頭：背中は灰黒、頭は黒っぽく、目の上に白いまゆ
  ctx.fillStyle = T('#59626D'); ctx.beginPath(); ctx.ellipse(0, 12, 34, 48, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(-8, 0, 16, 30, -.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = T('#2B3036'); ctx.beginPath(); ctx.ellipse(0, -40, 21, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = T('#F4F4F2'); ctx.lineWidth = 4; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 8, -50); ctx.quadraticCurveTo(sd * 18, -48, sd * 22, -38); ctx.stroke(); }
  ctx.fillStyle = T('#3A3F45'); ctx.beginPath(); ctx.moveTo(-5, -58); ctx.lineTo(0, -66); ctx.lineTo(5, -58); ctx.fill(); // くちばしの先（向こう向きなので少しだけ）
  ctx.restore();
}
function drawBunnyWorld(b) {
  const sp = spriteAt(b.wx, b.wy, b.wz); if (!sp) return;
  const sc = sp.k * (b.who === 'ren' ? 1.18 : b.who === 'pom' ? .72 * (b.big || 1) : 1.0) / 240;
  let pose;
  // しゃがむ・跳ぶが、ふり返り（look）より先（ふり返っている間に下スワイプしても、しゃがまなかった：2026-11-09 の報告）
  if (b.view === 'front') pose = 'front_' + (b.mood || 'open');
  else if (b.hawk && !(b.hawkRel > .2) && !(b.hawkIn < .85)) pose = b.hawkRel > .02 ? 'fall' : 'air'; /* オオタカにつかまれて、足をのばしてぶら下がる。[D3] 地面が近づくと、足を下へのばして着地の用意 */
  else if (b.fly) pose = 'run0'; /* 紙飛行機に乗っている間は、足を止めて座る（2026-11-17 オーナー：「紙飛行機に乗ってる時も走り続けてる動作をしてる」）。下半分は紙飛行機にかくれる */
  else if (b.slide) pose = 'slide'; else if (b.air) pose = !b.fly && (b === G.player ? G.vy : b.vy) < -2.5 ? 'fall' : 'air'; /* くだりは「落ちてくる絵」 */
  else if (b.look > 0) pose = 'look_' + (b.mood || 'happy');
  else if (b.runLook) pose = 'rlook' + (((b.ph / (Math.PI * 2)) * RUN_FRAMES | 0) % RUN_FRAMES + RUN_FRAMES) % RUN_FRAMES; /* 走りながらふり向く（クリのあいさつ） */
  else pose = 'run' + (((b.ph / (Math.PI * 2)) * RUN_FRAMES | 0) % RUN_FRAMES + RUN_FRAMES) % RUN_FRAMES;
  b.pose = pose; const img = bunFrame(b.who, pose, SV.mugOn);
  ctx.save(); ctx.translate(sp.sx, sp.sy); ctx.scale(sc, sc);
  if (b.tilt) ctx.rotate(b.tilt);
  if (b.land > 0) ctx.scale(1 + b.land * .9, 1 - b.land * .9); /* クリのあいさつ：小さく跳んだあとの着地で、体がつぶれる */ if (b.lean) ctx.scale(1 + .05 * b.lean, 1 - .05 * b.lean); /* 走りぬける時は、体を低く長く */
  if (b === G.player && G.mode === 'play' && !OPT().calm && !b.fly) { const lc = G.laneT > 0 ? Math.sign(G.lane - G.prevLane) * Math.sin(G.laneT / .35 * Math.PI) * .09 : 0, tc = G.turnT > 0 && G.turnDir ? G.turnDir * Math.sin(G.turnT / .8 * Math.PI) * .12 : 0; if (lc || tc) ctx.rotate(lc + tc); if (G.laneT > 0 && !b.air && !b.slide) ctx.translate(0, -Math.sin(G.laneT / .35 * Math.PI) * 12); } // lean into a lane change and a corner (2026-11-08)。車線を変える時は、小さく横へ跳ぶ（本物のうさぎは向きを変える時に横へぴょんと跳ぶ。2026-11-18）
  if (b === G.player && G.mode === 'play' && !OPT().calm) { // squash on landing, a touch of stretch at the top of a jump
    if (G.landT > 0 && !b.air && !b.slide) { const q = Math.sin(G.landT / .14 * Math.PI) * .2 * (G.landK || 1); ctx.scale(1 + q, 1 - q); }
    else if (b.air && !b.fly && G.takeT > 0) { const q = Math.sin(clamp(G.takeT / .09, 0, 1) * Math.PI) * .11; ctx.scale(1 + q, 1 - q); G.takeN = (G.takeN || 0) + 1; } /* ふみ切り：跳ぶ瞬間だけ、ぐっと沈む（アニメの「予備動作」。跳び始めるのは今までどおり押した瞬間） */
    else if (b.air && !b.fly && G.vy > 5) { const q = Math.min(.08, (G.vy - 5) * .008); ctx.scale(1 - q, 1 + q); } }
  if (b.who === 'pom' && b.air && !b.fly && b.vy != null) { ctx.translate(0, -140); ctx.rotate(-(1 - clamp((b.vy + JUMPV) / (2 * JUMPV), 0, 1)) * Math.PI * 2); ctx.translate(0, 140); } // Kuri flips on every jump
  if (b.who === 'pom' && b.slide) { ctx.translate(0, -110); ctx.rotate((G.t * 14) % (Math.PI * 2)); ctx.translate(0, 110); } // and rolls under things
  if (b.look > 0 && b.mood === 'sick') ctx.rotate(Math.sin(G.t * 7) * .07);
  if (b.look > 0 && b.mood === 'worry') { ctx.translate(0, -Math.abs(Math.sin(G.t * 9)) * 14); ctx.rotate(Math.sin(G.t * 9) * .05); }
  if (b.fly && b.who === 'pom') ctx.translate(0, Math.sin(G.t * 5) * 6);
  // フィーバー中は走る自分のうしろに、うすい残像を2つ（C-38）。手前（画面の下）に少しずらし、レーン移動の向きにも流す。「動きを減らす」設定では出さない
  // 2026-11-09：相棒とクリにも（メインのキャラクターだけ残像が出ていた）。ダッシュ中も
  if ((b === G.player || b === G.follow || b === G.pom) && (G.fever > 0 || G.pow.dash > 0) && G.mode === 'play' && !OPT().calm && !b.fly && !(b.look > 0)) { const lx = b === G.player && G.laneT > 0 ? -Math.sign(G.lane - G.prevLane) * 60 : 0; G.ghostN = (G.ghostN || 0) + 1; const tn = G.trailN || (G.trailN = {}); tn[b === G.player ? 'p' : b === G.follow ? 'f' : 'm'] = (tn[b === G.player ? 'p' : b === G.follow ? 'f' : 'm'] || 0) + 1;
    for (const [k, a] of [[1, .12]]) { ctx.globalAlpha = a; ctx.drawImage(img, -BS / 2, -GROUND_Y - BTOP + 30 * k, img.width, img.height); } ctx.globalAlpha = 1; } /* フィーバー・ダッシュの残像も、うすい 1 つだけ・横へは流さない（2026-11-17 オーナー：「残像がウザくなりすぎないように全体的に気をつけて」。前は 2 つ・レーン移動の向きにも流していた） */
  /* レーンを移る一瞬の残像は、やめた（2026-11-17 オーナー：「キャラクターが左右に移動した時の残像はうざったいのでいらない」）。qa/motion.js が、出ないことを見張る */
  if (b.flash && G.mode === 'play' && Math.floor(G.t * 16) % 2) ctx.globalAlpha = .45; // 点滅は走っている時だけ（ホーム画面・結果の画面では出さない）
  ctx.drawImage(LT.indoor ? img : litSprite(img, bunnyAmb(), 1, 1), -BS / 2, -GROUND_Y - BTOP, img.width, img.height);
  if (b.hawk && b.hawkIn != null && b.hawkIn > 0 && b.hawkIn < 1 && b === G.player) { const sp2 = spriteAt(b.wx, segE(curSeg(), G.s), b.wz); if (sp2) { const q = 1 - b.hawkIn; ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = `rgba(20,24,30,${(.22 * b.hawkIn).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(sp2.sx - q * 90, sp2.sy, sp2.k * (1.3 + q * 1.6), sp2.k * (.32 + q * .3), 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } } /* [F12] テラスの床に、おりてくるオオタカの大きなかげ（近づくほどこく、小さく） */
  if (b.hawk && !(b.hawkRel >= 1)) drawHawk(b); /* [D1] はなしたあとは、上へ飛び去って消える */
  if (b.fly) { const pw = b.who === 'pom' ? 380 : 420, ph = pw * .4, yb = b.who === 'pom' ? -16 : -36; ctx.globalAlpha = 1; const pl = planePic(); if (pl) ctx.drawImage(pl, -pw / 2, yb - ph * .42, pw, ph); } // drawn over the lower body: they sit in the plane, not on air (Kuri rides his own)
  if (G.weather === 'rain' && !LT.indoor && G.mode !== 'title' && !b.fly) { ctx.globalAlpha = .55; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (const [x, y, a] of [[-60, -190, 0], [55, -150, .6], [-20, -120, 1.2]]) { const k = .5 + .5 * Math.sin(G.t * 3 + a * 3); ctx.globalAlpha = .25 + .3 * k; ctx.beginPath(); ctx.arc(x, y, 14, -2.4, -1.3); ctx.stroke(); } ctx.globalAlpha = 1; G.wetN = (G.wetN || 0) + 1; } // 雨の日はうっすらぬれて光る（C-34）
  if (b.glow) { ctx.globalAlpha = .9; ctx.strokeStyle = b.glow; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(0, -110, 130, 120, 0, 0, Math.PI * 2); ctx.stroke(); }
  if (!(b.look > 0) && b.who !== 'pom') b.say = '';
  if (b.look > 0 && b.mood === 'sick') { ctx.globalAlpha = Math.min(1, b.look * 3); ctx.strokeStyle = '#7C8FC4'; ctx.lineWidth = 6; ctx.lineCap = 'round'; // a woozy swirl over the head
    for (let k = 0; k < 3; k++) { const a = G.t * 5 + k * 2.1; ctx.beginPath(); ctx.arc(Math.cos(a) * 60, -265 + Math.sin(a) * 16, 9, 0, Math.PI * 2); ctx.stroke(); } }
  else if (b.look > 0 && b.mood === 'worry') { ctx.globalAlpha = Math.min(1, b.look * 3); ctx.fillStyle = '#FBF6EE'; ctx.strokeStyle = '#C8463C'; ctx.lineWidth = 8; ctx.font = '900 92px "Zen Maru Gothic",sans-serif'; ctx.textAlign = 'center';
    const y = -250 - Math.abs(Math.sin(G.t * 9)) * 16; ctx.strokeText('!?', 110, y); ctx.fillStyle = '#C8463C'; ctx.fillText('!?', 110, y);
 }
  else if (b.look > 0) { ctx.globalAlpha = Math.min(1, b.look * 3); ctx.fillStyle = '#E86A75'; heart(ctx, 120, -250 - (1 - b.look) * 40, 22); ctx.fillStyle = '#F2C230'; star(ctx, -130, -230 - (1 - b.look) * 30, 18); }
  ctx.restore();
  if (b.say && (b.look > 0 || b.runLook)) BUBQ.push(() => { // a speech bubble in screen space, kept on screen  [空 B1] 2026-11-21：ふきだしは、ぜんぶの物を描いた後に描く（前は、あとから描くオオタカの羽などの下にかくれて、字が切れて見えた）
    ctx.save(); ctx.globalAlpha = b.runLook ? (b.sayA || 0) : Math.min(1, b.look * 3); ctx.font = '900 15px "Zen Maru Gothic","Hiragino Sans",sans-serif';
    const tw = ctx.measureText(b.say).width, bw = tw + 22, bh = 30, tipX = sp.sx, bx = clamp(sp.sx - bw / 2, 8, W - bw - 8); let by = Math.max(70, sp.sy - 230 * sc - bh - 16); { const now = performance.now(); if (now - BUBT > 8) BUBS = []; BUBT = now; }
    for (let k = 0; k < 4 && BUBS.some(r => bx < r[0] + r[2] + 4 && r[0] < bx + bw + 4 && by < r[1] + r[3] + 4 && r[1] < by + bh + 4); k++) by -= bh + 8; /* ふきだし同士が重ならないよう、上にずらす */
    BUBS.push([bx, by, bw, bh]); G.bubN = BUBS.length;
    ctx.fillStyle = 'rgba(255,252,246,.97)'; ctx.strokeStyle = '#3B2A20'; ctx.lineWidth = 2; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 14); else ctx.rect(bx, by, bw, bh); ctx.fill(); ctx.stroke();
    const tx = clamp(tipX, bx + 14, bx + bw - 14); ctx.beginPath(); ctx.moveTo(tx - 6, by + bh - 1); ctx.lineTo(tx, by + bh + 9); ctx.lineTo(tx + 6, by + bh - 1); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillRect(tx - 5, by + bh - 3, 10, 3);
    ctx.fillStyle = '#3B2A20'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.say, bx + bw / 2, by + bh / 2 + 1); ctx.restore(); });
}
function heart(g, x, y, r) { g.beginPath(); g.moveTo(x, y + r * .9); g.bezierCurveTo(x - r * 1.6, y - r * .2, x - r * .6, y - r * 1.3, x, y - r * .4); g.bezierCurveTo(x + r * .6, y - r * 1.3, x + r * 1.6, y - r * .2, x, y + r * .9); g.fill(); }

/* ================= screen-space effects ================= */
const FX = [];
function leaves(x, y, n) { if (OPT().calm || lowQ) n = Math.min(n, 2); for (let i = 0; i < n; i++) FX.push({ x, y, vx: rand(-110, 110), vy: rand(-170, -60), life: rand(.55, .9), t: 0, c: pick(['#B8D98A', '#9BB85A', '#C9C46A', '#D9C27A']), r: rand(2.2, 3.4), leaf: 1, rot: rand(0, 6.3), vr: rand(-9, 9) }); }
function burst(x, y, color, n) { for (let i = 0; i < n; i++) FX.push({ x, y, vx: rand(-160, 160), vy: rand(-260, -60), life: rand(.35, .7), t: 0, c: color, r: rand(2, 5) }); }
// praise words ('NICE JUMP!', 'FEVER!' …) used to pop up in the middle of the screen, right over the road ahead (2026-11-14: 「その調子などのせいで先が見づらい」).
// They now rise from the floor below the runners, where nothing is coming at you; the old heights keep their order.
function cheerY(k) { return H - Math.min(196, H * .28) - (k - .3) * 110; } // short landscape screens: lower, so the words stay below the runners
/* 浮かぶ文字が重ならない（2026-11-16：新しい食べ物を続けて 2 つ取ると「NEW! 図鑑に…」が同じ場所に 2 つ重なって読めなかった）。先に出ている文字と近いときは、1 行ぶん下にずらす */
function floatText(x, y, txt, color) { for (let k = 0; k < 4; k++) { if (!FX.some(p => p.txt && Math.abs(p.y - y) < 20 && Math.abs(p.x - x) < 150)) break; y += 22; } FX.push({ x, y, vx: 0, vy: -60, life: .9, t: 0, txt, c: color }); }
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
  /* 2026-11-17 オーナー「モチが寝てないのに ZZ と出るのはおかしい」：ホーム画面では顔を切りかえない（目はあいたまま）ので、居眠りの「Zz」も出さない */
}
// 足もとの土ぼこり（C-33）：地面の種類で色が変わる（砂・雪・草・道）。屋内・板の上は出さない。「動きを減らす」設定でも出さない
function groundDust(seg) {
  if (G.mode !== 'play' || OPT().calm || G.air || G.player.slide || G.pow.fly > 0 || LT.indoor) return; const u = ((G.player.ph / (Math.PI * 2)) % 1 + 1) % 1, pu = G.dustU, kick = pu != null && (pu <= u ? pu < .14 && u >= .14 : pu < .14 || u >= .14); /* [軽く D5] 2026-11-22：コマ数の少ない端末（1 秒 20 コマ前後）では、1 コマで足の動きが「けった瞬間」を飛びこえてしまい、土ぼこりがほとんど出なかった。前のコマと今のコマの間にけった瞬間が入っていれば出す */ G.dustU = u; const ld = G.landDust; G.landDust = 0; if (!kick && !ld) return; // 土ぼこりは、後ろ足でけった瞬間（1 歩に 1 回）と、ジャンプの着地に出す（前は 0.09 秒ごとに出していた。2026-11-18）
  const rp = seg.th.rpat, c = G.weather === 'snow' ? 'rgba(244,247,250,.9)' : rp === 'sand' ? 'rgba(226,212,182,.85)' : rp === 'grass' || rp === 'lawn' ? 'rgba(150,180,100,.75)' : rp === 'gravel' ? 'rgba(196,182,156,.8)' : rp === 'planks' || rp === 'boards' ? '' : 'rgba(170,160,150,.55)'; if (!c) return;
  const sp = spriteAt(G.player.wx, G.player.wy, G.player.wz); if (!sp) return; G.dustC = c;
  const land = !!ld; for (let i = 0; i < (land ? 7 : 3); i++) FX.push({ x: sp.sx + rand(-14, 14) * sp.k * .01, y: sp.sy - 4, vx: land ? rand(-120, 120) : rand(-50, 50), vy: land ? rand(-50, -15) : rand(-75, -30), life: rand(.25, .45), t: 0, c, r: rand(2.5, land ? 6 : 5) }); // 着地は横へ広がる
}
function drawFX() {
  const dt = G.dtFX || .016;
  if (G.mode === 'title') titleFX();
  const near = G.chaseVis;
  if (near > .01) {
    const h = H * .2 * near;
    if (paper.length < 46) paper.push({ x: Math.random() * W, y: H + 20, vx: rand(-40, 40), vy: rand(-260, -120), r: rand(0, 6), vr: rand(-4, 4), w: rand(20, 38) });
    ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = 'rgba(59,42,32,.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; ; x += 24) { const xx = Math.min(x, W); ctx.lineTo(xx, H - h + Math.sin(xx * .05 + G.t * 9) * 10 * near); if (xx >= W) break; } ctx.lineTo(W, H); ctx.closePath(); ctx.fill(); ctx.stroke(); // 右の端まで山の高さで描く（2026-11-15 オーナー：スマホで右下にすき間。24 きざみの最後の点が画面の幅に届かず、そこから右下の角へ斜めに切れていた。幅 430 で 22px、402 で 18px、375 で 15px）
    ctx.strokeStyle = 'rgba(59,42,32,.18)'; ctx.beginPath(); for (let k = 1; k < 4; k++) { const yy = H - h * (k / 4); ctx.moveTo(0, yy); ctx.lineTo(W, yy + Math.sin(G.t * 5 + k) * 4); } ctx.stroke();
    for (const p of paper) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; p.r += p.vr * dt;
      if (p.y > H + 40) { p.y = H - rand(0, h * .5); p.x = Math.random() * W; p.vy = rand(-330, -160) * near; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-p.w / 2, -p.w * .65, p.w, p.w * 1.3); ctx.strokeStyle = 'rgba(59,42,32,.3)'; ctx.strokeRect(-p.w / 2, -p.w * .65, p.w, p.w * 1.3);
      ctx.fillStyle = 'rgba(59,42,32,.25)'; for (let k = 0; k < 4; k++) ctx.fillRect(-p.w * .35, -p.w * .45 + k * p.w * .22, p.w * .7, 2); ctx.restore(); }
  } else paper.length = 0;
  if (FX.length > 280) FX.splice(0, FX.length - 280); /* つぶが増えすぎたら古い物から消す（重い端末でフィーバーと紙吹雪が重なったとき） */
  for (let i = FX.length - 1; i >= 0; i--) {
    const p = FX[i]; p.t += dt; if (p.t > p.life) { FX.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; if (p.leaf) { p.vy += 140 * dt; p.vx *= 1 - dt * 2.5; p.x += Math.sin(p.t * 9 + p.r) * 30 * dt; p.rot += p.vr * dt; } else if (!p.txt) p.vy += 600 * dt;
    ctx.globalAlpha = 1 - p.t / p.life;
    if (p.txt) { /* 浮かぶ文字：出た瞬間だけ少し大きく（ぽんっ）、最後の3割でうすくなる（前は出た瞬間からうすくなり始めて読みにくかった） */ const u = p.t / p.life, pop = OPT().calm ? 1 : 1 + .28 * Math.max(0, 1 - p.t / .12); ctx.globalAlpha = u < .7 ? 1 : 1 - (u - .7) / .3; ctx.font = `900 ${Math.round(15 * pop)}px "Zen Maru Gothic",sans-serif`; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(59,42,32,.85)'; ctx.strokeText(p.txt, p.x, p.y); ctx.fillStyle = p.c; ctx.fillText(p.txt, p.x, p.y); }
    else if (p.leaf) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(0, 0, p.r * 1.9, p.r * .55, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(80,110,40,.55)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-p.r * 1.6, 0); ctx.lineTo(p.r * 1.6, 0); ctx.stroke(); ctx.restore(); } // hay blades flutter down (2026-11-08)
    else { ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - .45 * p.t / p.life), 0, Math.PI * 2); ctx.fill(); } /* つぶは消えながら小さくなる */
  }
  ctx.globalAlpha = 1;
  // 集中線はダッシュ・フィーバー・飛んでいる間だけ。ふつうに速いだけのときの薄い線は、画面のあちこちに「薄い斜めの残像」が出ているように見えたのでやめた（2026-11-08 の報告）
  const spdK = (G.pow.dash > 0 || G.fever > 0 || G.pow.fly > 0) ? 1 : 0;
  if (G.mode === 'play' && !OPT().calm && spdK > 0) { G.spdN = (G.spdN || 0) + 1;
    ctx.strokeStyle = G.fever > 0 ? `rgba(242,194,48,${(.4 * spdK).toFixed(2)})` : `rgba(255,255,255,${(.4 * spdK).toFixed(2)})`; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath();
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2 + G.t * .5, r0 = Math.min(W, H) * (.5 + ((G.t * 3 + k * .37) % 1) * .45), L = 30 + r0 * .18; ctx.moveTo(W / 2 + Math.cos(a) * r0, HORIZON + Math.sin(a) * r0 * .8); ctx.lineTo(W / 2 + Math.cos(a) * (r0 + L), HORIZON + Math.sin(a) * (r0 + L) * .8); } /* [B6] 集中線は画面のふちだけ・外ほど長く・うすく（.55 → .4）。前はまん中近くにも短い線が散って、ひっかき傷に見えた */
    ctx.stroke();
  }
  if (G.flashT > 0) { ctx.fillStyle = `rgba(200,70,60,${G.flashT * .45})`; ctx.fillRect(0, 0, W, H); }
  if (G.skyWipe > 0) { ctx.fillStyle = `rgba(255,255,255,${(G.skyWipe * G.skyWipe * .9).toFixed(3)})`; ctx.fillRect(0, 0, W, H); G.skyWipe = Math.max(0, G.skyWipe - (G.dtFX || .016) * 1.4); } // オオタカにつかまれた瞬間：白い風（展望台から空へ）
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
