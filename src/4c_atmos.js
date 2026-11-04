/* ================= atmosphere: sun, sky, clouds, street shade, finishing =================
   Everything here is drawn in screen space or as soft overlays, so it stays cheap on phones. */

// the sun moves east to west through the day; altitude in radians
const SUN = { az: -.6, alt: .8, k: 1 };
function computeSun() {
  const m = G.clock % 1440, t = (m - 330) / (1110 - 330);
  SUN.alt = Math.sin(clamp(t, 0, 1) * Math.PI) * .98;
  SUN.az = -1.5 + clamp(t, 0, 1) * 2.4;
  const clear = G.weather === 'clear' ? 1 : G.weather === 'snow' ? .3 : .18;
  SUN.k = clamp(SUN.alt * 4, 0, 1) * clear * (1 - LT.night);
}
const mixRGB = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgbS = (c, a) => a == null ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

/* ---- sky gradient: deep zenith, a bright haze band at the horizon ---- */
function skyGradient(horizon) {
  const top = LT.top, bot = LT.bot, N = LT.night, rain = G.weather === 'rain';
  const zen = mixRGB(top, [top[0] * .7, top[1] * .78, top[2] * .92], .6);
  const gold = G.weather === 'clear' ? clamp(1 - SUN.alt * 2.6, 0, 1) * (1 - N) * clamp(SUN.alt * 12, 0, 1) : 0; // the golden hour: a warm band along the horizon, the zenith going violet
  const haze = rain ? mixRGB(bot, [200, 204, 208], .4) : mixRGB(mixRGB(bot, [255, 252, 245], N > .5 ? 0 : .28), [255, 184, 120], gold * .6);
  const g = ctx.createLinearGradient(0, Math.min(0, horizon - H), 0, horizon + 4);
  const zen2 = mixRGB(zen, [96, 70, 120], gold * .45), mid = mixRGB(mixRGB(top, bot, .65), [240, 150, 120], gold * .5);
  g.addColorStop(0, rgbS(zen2)); g.addColorStop(.55, rgbS(mixRGB(top, [200, 140, 150], gold * .3))); g.addColorStop(.86, rgbS(mid)); g.addColorStop(.97, rgbS(haze)); g.addColorStop(1, rgbS(haze));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (N > .3) { // the city's glow on the night horizon
    const cg = ctx.createLinearGradient(0, horizon - H * .22, 0, horizon + 2);
    cg.addColorStop(0, 'rgba(255,150,90,0)'); cg.addColorStop(1, `rgba(255,160,100,${.28 * N})`); ctx.fillStyle = cg; ctx.fillRect(0, horizon - H * .22, W, H * .22 + 2);
  }
}

/* ---- the sun (or moon) and its glow ---- */
function drawSunGlow(horizon) {
  const N = LT.night, dx = angDiff(SUN.az, CAM.yaw);
  if (N > .5) { // moon
    const ma = angDiff(.9, CAM.yaw); if (Math.abs(ma) > 1.1) return;
    const x = W / 2 + Math.tan(ma) * FOCAL, y = horizon - H * .24;
    const g = ctx.createRadialGradient(x, y, 2, x, y, 70); g.addColorStop(0, 'rgba(255,250,230,.35)'); g.addColorStop(1, 'rgba(255,250,230,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 70, y - 70, 140, 140);
    ctx.fillStyle = '#FFF8E4'; ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(200,196,180,.35)'; ctx.beginPath(); ctx.arc(x - 3, y - 2, 3, 0, Math.PI * 2); ctx.arc(x + 4, y + 3, 2.2, 0, Math.PI * 2); ctx.fill();
    return;
  }
  if (Math.abs(dx) > 1.3 || SUN.alt <= 0) return;
  const x = W / 2 + Math.tan(dx) * FOCAL, y = horizon - Math.tan(Math.min(SUN.alt, 1.2)) * FOCAL * .55;
  const low = clamp(1 - SUN.alt * 2.2, 0, 1), k = G.weather === 'clear' ? 1 : .35;
  const col = mixRGB([255, 250, 230], [255, 168, 90], low);
  ctx.globalCompositeOperation = 'lighter';
  const R = FOCAL * (.55 + low * .4), g = ctx.createRadialGradient(x, y, 0, x, y, R);
  g.addColorStop(0, rgbS(col, .55 * k)); g.addColorStop(.18, rgbS(col, .22 * k)); g.addColorStop(1, rgbS(col, 0));
  ctx.fillStyle = g; ctx.fillRect(x - R, y - R, R * 2, R * 2);
  if (k === 1) { ctx.fillStyle = rgbS(mixRGB([255, 255, 248], col, .5), .95); ctx.beginPath(); ctx.arc(x, y, 9 + low * 5, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over';
}

/* ---- clouds: soft cumulus sprites, shaded underneath, tinted by the hour ---- */
const CLOUD_SPR = [];
function buildCloudSprites() {
  for (let n = 0; n < 6; n++) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 220; const g = c.getContext('2d') || noCtx(), r = rnd(31 + n * 17);
    const puffs = [], cnt = n < 4 ? 26 : 14;
    for (let i = 0; i < cnt; i++) { const t = r(), x = 70 + t * 372, ht = Math.sin(t * Math.PI) * (n < 4 ? 80 : 30); puffs.push([x + (r() - .5) * 30, 175 - r() * ht, (n < 4 ? 26 : 18) + r() * (n < 4 ? 34 : 16)]); }
    // body
    for (const [x, y, R] of puffs) { const gr = g.createRadialGradient(x, y - R * .2, R * .1, x, y, R); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.7, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill(); }
    // flat, shaded base, lit top
    g.globalCompositeOperation = 'source-atop';
    const sh = g.createLinearGradient(0, 60, 0, 200); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(.55, 'rgba(186,196,214,.22)'); sh.addColorStop(1, 'rgba(160,172,196,.5)');
    g.fillStyle = sh; g.fillRect(0, 0, 512, 220);
    g.globalCompositeOperation = 'destination-out'; const cut = g.createLinearGradient(0, 188, 0, 214); cut.addColorStop(0, 'rgba(0,0,0,0)'); cut.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = cut; g.fillRect(0, 188, 512, 32);
    CLOUD_SPR.push(c);
  }
  { // thin high cirrus
    const c = document.createElement('canvas'); c.width = 512; c.height = 96; const g = c.getContext('2d') || noCtx(), r = rnd(77);
    for (let i = 0; i < 40; i++) { const x = r() * 420 + 40, y = 30 + r() * 40, w = 60 + r() * 120; const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, w / 2, 3 + r() * 4, -.08, 0, Math.PI * 2); g.fill(); }
    CLOUD_SPR.push(c);
  }
}
const TINT_CACHE = new Map();
function tintedSprite(img, rgb) {
  if (!img || !img.width) return img;
  const q = rgb.map(x => Math.min(255, Math.round(x / 12) * 12)); if (q[0] >= 252 && q[1] >= 252 && q[2] >= 252) return img;
  let m = TINT_CACHE.get(img); if (!m) { m = {}; TINT_CACHE.set(img, m); } const k = q.join(','); if (m[k]) return m[k];
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d') || noCtx();
  g.drawImage(img, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = rgbS(q); g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'destination-in'; g.drawImage(img, 0, 0);
  const keys = Object.keys(m); while (keys.length > 3) { const kk = keys.shift(), o = m[kk]; delete m[kk]; try { o.width = o.height = 0; } catch (e) { } } m[k] = c; return c;
}
let CLOUDS2 = null;
function drawClouds2(hz) {
  if (!CLOUD_SPR.length) buildCloudSprites();
  if (!CLOUDS2) { const r = rnd(12); CLOUDS2 = Array.from({ length: 10 }, (_, i) => ({ a: r() * Math.PI * 2, e: .05 + Math.pow(r(), 1.6) * .42, s: .5 + r() * .8, k: i % 9 === 8 ? 6 : (r() * 6) | 0 })); }
  const N = LT.night, rain = G.weather === 'rain', snow = G.weather === 'snow';
  const tint = N > .5 ? [70, 80, 115] : rain || snow ? [178, 182, 190] : mixRGB([255, 255, 255], LT.bot, clamp((1 - LT.amb[2]) * 2.2, 0, .85));
  const alpha = N > .5 ? .45 : rain ? .95 : .92;
  ctx.globalAlpha = alpha;
  for (const c of CLOUDS2) {
    const a = c.a + G.t * .0012, dx = angDiff(a, CAM.yaw); if (Math.abs(dx) > 1.25) continue;
    const img = tintedSprite(CLOUD_SPR[c.k], tint), sc = (rain ? 1.6 : 1) * c.s * FOCAL * (.28 + c.e * .9);
    const x = W / 2 + Math.tan(dx) * FOCAL, y = hz - Math.tan(c.e) * FOCAL - sc * .2;
    const w = sc * (c.k === 6 ? 2.2 : 1.6), h = w * img.height / img.width;
    ctx.drawImage(img, x - w / 2, y - h * .8, w, h);
  }
  ctx.globalAlpha = 1;
  if (rain) { const g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, 'rgba(110,118,128,.55)'); g.addColorStop(1, 'rgba(150,156,164,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, hz); }
}

/* ---- the street's own shade: buildings block the sun, wall bases stay dark ---- */
const SHQ = new Float64Array(12);
function shadeQuad(sg, a, b, l0, l1) {
  const p = [[a, l0], [b, l0], [b, l1], [a, l1]]; const v = []; for (const [s, l] of p) { const q = segPos(sg, s, l); v.push(q[0], q[2] + .012, q[1]); }
  const m = project(v); if (!m) return; pathPoly(Math.abs(m)); ctx.fill();
}
function streetShade(sg) {
  const th = sg.th, k = th.kind, room = k === 'room' || k === 'train' || k === 'glass';
  if (k === 'deck') return;
  // contact darkening along the base of the side walls (rooms and streets)
  ctx.fillStyle = room ? 'rgba(40,30,20,.14)' : 'rgba(25,30,45,.16)';
  for (let a = 0; a < sg.len + HW; a += 12) { const b = Math.min(a + 12, sg.len + HW); for (const sd of [-1, 1]) shadeQuad(sg, a, b, sd * HW, sd * (HW - .55)); }
  if (room || k !== 'street' || SUN.k < .05) return;
  // the sun's shadow from the buildings on one side
  const fh = th.fac && th.fac.h ? (th.fac.h[0] + th.fac.h[1]) / 2 : th.fac && th.fac.style === 'park' ? 3 : 9;
  const sx = -Math.sin(SUN.az), sz = -Math.cos(SUN.az); // where shadows fall
  const across = sx * sg.r[0] + sz * sg.r[1];
  const sd = across > 0 ? -1 : 1; // the wall on this side throws its shade across the street
  const w = clamp(fh * Math.abs(across) / Math.max(.18, Math.tan(SUN.alt)), 0, HW * 2);
  if (w < .3) return;
  ctx.fillStyle = `rgba(30,42,78,${(.24 * SUN.k).toFixed(3)})`;
  for (let a = 0; a < sg.len + HW; a += 12) { const b = Math.min(a + 12, sg.len + HW); shadeQuad(sg, a, b, sd * HW, sd * (HW - w)); }
  // a soft penumbra
  ctx.fillStyle = `rgba(30,42,78,${(.08 * SUN.k).toFixed(3)})`;
  for (let a = 0; a < sg.len + HW; a += 12) { const b = Math.min(a + 12, sg.len + HW); shadeQuad(sg, a, b, sd * (HW - w), sd * (HW - w - .5)); }
}

/* ---- finishing: lens vignette, gentle contrast, a little film grain ---- */
let GRAIN = null, VIG = null, VIGK = '';
function postFX() {
  if (typeof lowQ !== 'undefined' && lowQ > 0) return;
  const key = W + 'x' + H;
  if (VIGK !== key) { VIGK = key; VIG = ctx.createRadialGradient(W / 2, H * .45, Math.min(W, H) * .35, W / 2, H * .5, Math.hypot(W, H) * .62); VIG.addColorStop(0, 'rgba(0,0,0,0)'); VIG.addColorStop(1, 'rgba(10,8,20,.28)'); }
  ctx.fillStyle = VIG; ctx.fillRect(0, 0, W, H);
  // warm light from the bottom, cool from the top: a soft-light grade
  if (!LT.indoor && G.weather === 'clear' && LT.night < .5) { const gold = clamp(1 - SUN.alt * 2.6, 0, 1) * clamp(SUN.alt * 12, 0, 1) * (1 - LT.night * 2); if (gold > .02) { // golden hour: warm light from the sun's side, cooler shade on the other
      const dx = angDiff(SUN.az, CAM.yaw), sx = clamp(.5 + Math.tan(clamp(dx, -1.2, 1.2)) * .4, 0, 1); ctx.globalCompositeOperation = 'soft-light'; const gg = ctx.createLinearGradient(sx * W, 0, (1 - sx) * W, 0); gg.addColorStop(0, `rgba(255,170,90,${(.5 * gold).toFixed(3)})`); gg.addColorStop(1, `rgba(90,110,180,${(.3 * gold).toFixed(3)})`); ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(255,214,170,${(.35 * gold).toFixed(3)})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; } }
  if (!LT.indoor) { ctx.globalCompositeOperation = 'soft-light'; const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, LT.night > .5 ? 'rgba(60,80,160,.35)' : 'rgba(90,130,200,.22)'); g.addColorStop(1, LT.night > .5 ? 'rgba(255,170,90,.18)' : 'rgba(255,200,140,.22)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  if (!GRAIN) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d') || noCtx(), d = g.createImageData(128, 128), r = rnd(3);
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - .5) * 90; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); GRAIN = ctx.createPattern(c, 'repeat'); }
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .07; ctx.fillStyle = GRAIN; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

/* ---- tree crowns with light from above: dark inner mass, lit clumps, sky gaps ---- */
function leafCrown(cols, seed) {
  const c = mk(256), g = c.getContext('2d') || noCtx(), r = rnd(seed);
  const dark = hexRgb(cols[1]).map(x => x * .62), mid = hexRgb(cols[0]), lt = hexRgb(cols[2]).map(x => Math.min(255, x * 1.12));
  const clumps = []; for (let i = 0; i < 22; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 86; clumps.push([128 + Math.cos(a) * d, 118 + Math.sin(a) * d * .72, 22 + r() * 18]); }
  const dot = (x, y, R, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill(); };
  for (const [x, y, R] of clumps) for (let i = 0; i < 14; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R; dot(x + Math.cos(a) * d, y + R * .25 + Math.sin(a) * d * .7, 5 + r() * 7, rgbS(dark)); }
  for (const [x, y, R] of clumps) for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R * .9; dot(x + Math.cos(a) * d, y + Math.sin(a) * d * .65, 4 + r() * 6, rgbS(mixRGB(dark, mid, .5 + r() * .5))); }
  for (const [x, y, R] of clumps) for (let i = 0; i < 9; i++) { const a = -Math.PI * (.15 + r() * .7), d = Math.sqrt(r()) * R * .8; dot(x - R * .12 + Math.cos(a) * d, y - R * .2 + Math.sin(a) * d * .5, 3 + r() * 4, rgbS(mixRGB(mid, lt, .4 + r() * .6))); }
  // a few gaps to the sky and a shadowed underside
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 10; i++) dot(40 + r() * 176, 50 + r() * 120, 2 + r() * 4, '#000');
  g.globalCompositeOperation = 'source-atop'; const sh = g.createLinearGradient(0, 60, 0, 220); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(10,25,10,.35)'); g.fillStyle = sh; g.fillRect(0, 0, 256, 256);
  g.globalCompositeOperation = 'source-over';
  return c;
}

/* ---- floor surface texture: asphalt aggregate, stone grain, wood grain, carpet weave ----
   An affine-mapped tile on each near floor quad. Grey around 128 and drawn with 'overlay',
   so it adds detail without changing the floor's color. */
const FTEX = {};
function buildFloorTex() {
  const mkT = (fn, seed) => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d') || noCtx(), r = rnd(seed); g.fillStyle = 'rgb(128,128,128)'; g.fillRect(0, 0, 256, 256); fn(g, r); return c; };
  const blot = (g, r, n, a, R) => { for (let i = 0; i < n; i++) { const x = r() * 256, y = r() * 256, rr = R * (.4 + r()), v = r() < .5 ? 96 : 160; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(${v},${v},${v},${a})`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); } };
  const specks = (g, r, n, lo, hi, s) => { for (let i = 0; i < n; i++) { const v = (lo + r() * (hi - lo)) | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(r() * 256, r() * 256, s * (.5 + r()), s * (.5 + r())); } };
  FTEX.asphalt = mkT((g, r) => { blot(g, r, 26, .35, 40); specks(g, r, 2600, 70, 120, 1.6); specks(g, r, 1600, 150, 200, 1.3); }, 5);
  FTEX.stone = mkT((g, r) => { blot(g, r, 18, .3, 50); specks(g, r, 1500, 100, 150, 1.2); specks(g, r, 600, 140, 175, 1); }, 6);
  FTEX.wood = mkT((g, r) => { for (let y = 0; y < 256; y += 2) { const v = 128 + Math.sin(y * .21 + r() * 2) * 14 + (r() - .5) * 18; g.fillStyle = `rgb(${v | 0},${v | 0},${v | 0})`; g.fillRect(0, y, 256, 2); } blot(g, r, 8, .25, 30); }, 7);
  FTEX.fabric = mkT((g, r) => { for (let i = 0; i < 256; i += 3) { g.fillStyle = 'rgba(100,100,100,.25)'; g.fillRect(i, 0, 1, 256); g.fillStyle = 'rgba(160,160,160,.2)'; g.fillRect(0, i, 256, 1); } specks(g, r, 900, 105, 150, 1); }, 8);
  for (const k in FTEX) FTEX[k] = { img: FTEX[k], pat: ctx.createPattern(FTEX[k], 'repeat') };
}
const FTEX_OF = { road: 'asphalt', hokoten: 'asphalt', scramble: 'asphalt', stone: 'stone', plaza: 'stone', gravel: 'stone', walk: 'stone', brickroad: 'stone', petalstone: 'stone', petals: 'stone', lawn: 'stone', leaves: 'stone', grid: 'stone', boards: 'wood', planks: 'wood', tatami: 'fabric', carpet: 'fabric', rug: 'fabric' };
// draw a texture into a screen triangle with an exact affine map from texture coords
function texTri(x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, pat) {
  const du1 = u1 - u0, dv1 = v1 - v0, du2 = u2 - u0, dv2 = v2 - v0, det = du1 * dv2 - du2 * dv1; if (Math.abs(det) < 1e-6) return;
  const dx1 = x1 - x0, dy1 = y1 - y0, dx2 = x2 - x0, dy2 = y2 - y0;
  const a = (dx1 * dv2 - dx2 * dv1) / det, b = (dy1 * dv2 - dy2 * dv1) / det, c = (dx2 * du1 - dx1 * du2) / det, dd = (dy2 * du1 - dy1 * du2) / det;
  ctx.save(); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath(); ctx.clip();
  ctx.transform(a, b, c, dd, x0 - a * u0 - c * v0, y0 - b * u0 - dd * v0);
  ctx.fillStyle = pat; ctx.fillRect(Math.min(u0, u1, u2) - 2, Math.min(v0, v1, v2) - 2, Math.max(u0, u1, u2) - Math.min(u0, u1, u2) + 4, Math.max(v0, v1, v2) - Math.min(v0, v1, v2) + 4);
  ctx.restore();
}
function floorTexture(p, d, m, sg) {
  const key = FTEX_OF[p.pat] || (p.pat === 'sea' || p.pat === 'water' ? null : 'stone'); if (!key || d > 22) return;
  if (!FTEX.asphalt) buildFloorTex();
  const pat = FTEX[key].pat, alpha = clamp(1 - d / 22, 0, 1) * (key === 'asphalt' ? .85 : .6), px = 110;
  const one = (ox, e01, e03) => { // texture over the quad currently in SCR
    const a = (SCR[2] - SCR[0]) / e01, b = (SCR[3] - SCR[1]) / e01, c = (SCR[6] - SCR[0]) / e03, dd = (SCR[7] - SCR[1]) / e03;
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = alpha;
    ctx.save(); pathPoly(4); ctx.clip(); ctx.transform(a, b, c, dd, SCR[0] - a * ox, SCR[1] - b * ox); ctx.fillStyle = pat; ctx.fillRect(ox - 1, -1, e01 + 2, e03 + 2); ctx.restore();
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; };
  const v = p.v, e01 = Math.hypot(v[3] - v[0], v[5] - v[2]) * px, e03 = Math.hypot(v[9] - v[0], v[11] - v[2]) * px;
  let miny = 1e9, maxy = -1e9; if (m === 4) for (let i = 0; i < 4; i++) { miny = Math.min(miny, SCR[i * 2 + 1]); maxy = Math.max(maxy, SCR[i * 2 + 1]); }
  if (m === 4 && maxy - miny < H * .16) { one((p.a || 0) * px % 256, e01, e03); return; }
  // a big near quad (or one cut by the camera): short sub-quads in world space, each with its own affine map
  if (p.a == null || !sg) return;
  const camS = (CAM.x - sg.sx) * sg.f[0] + (CAM.z - sg.sz) * sg.f[1], b2 = p.b;
  const l0 = p.mid ? -ROAD : p.sd < 0 ? -HW : ROAD, l1 = p.mid ? ROAD : p.sd < 0 ? -ROAD : HW;
  let a2 = p.a; const vv = [];
  if (m !== 4) { a2 = 0; for (const step of [.5, 1.2, 2.2, 3.5]) { const t = Math.max(p.a, camS + step); if (b2 - t < .2) break; vv.length = 0; for (const [ss, ll] of [[t, l0], [t + .3, l0], [t + .3, l1], [t, l1]]) { const w = segPos(sg, ss, ll); vv.push(w[0], w[2], w[1]); } if (project(vv) === 4) { a2 = t; break; } } if (!a2) return; }
  for (let s0 = a2; s0 < b2 - .01; s0 += .5) { const s1 = Math.min(s0 + .5, b2); vv.length = 0; for (const [ss, ll] of [[s0, l0], [s1, l0], [s1, l1], [s0, l1]]) { const w = segPos(sg, ss, ll); vv.push(w[0], w[2], w[1]); }
    if (project(vv) !== 4) continue;
    one(s0 * px % 256, (s1 - s0) * px, (l1 - l0) * px);
    if (m !== 4) floorPattern(p, Math.max(d, 2)); }
}

/* ---- water: the sky mirrored, deeper near the camera, with the sun's glitter path ---- */
let WATER_G = null, WATER_K = '';
function waterFill(p, d) {
  const hz = HORIZON - Math.tan(CAM.pitch) * FOCAL, N = LT.night;
  const key = [hz | 0, LT.bot.map(x => x | 0).join(), N.toFixed(2), G.weather].join('|');
  if (key !== WATER_K) { WATER_K = key;
    const base = p.c, sky = LT.bot, deep = [base[0] * .55 * LT.amb[0], base[1] * .62 * LT.amb[1], base[2] * .7 * LT.amb[2]];
    const g = ctx.createLinearGradient(0, hz, 0, H);
    g.addColorStop(0, rgbS(mixRGB(sky, base, .25 + N * .5))); g.addColorStop(.25, rgbS(mixRGB(sky, base, .62))); g.addColorStop(1, rgbS(deep));
    WATER_G = g; }
  return WATER_G;
}
function waterGlitter(seg) { // sun or moon path on open water, drawn over the far water
  const th = seg.th; if (!(th.spat === 'water' || th.moat)) return;
  if (LT.night > .3) cityReflections(seg);
  const N = LT.night, az = N > .5 ? .9 : SUN.az, dx = angDiff(az, CAM.yaw); if (Math.abs(dx) > 1.2 || (N < .5 && SUN.alt < .03)) return;
  const hz = HORIZON - Math.tan(CAM.pitch) * FOCAL, x = W / 2 + Math.tan(dx) * FOCAL, k = N > .5 ? .45 : clamp(1 - SUN.alt * 1.4, .15, 1) * SUN.k;
  if (k <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, hz, 0, hz + H * .55); g.addColorStop(0, `rgba(255,236,190,${(.55 * k).toFixed(3)})`); g.addColorStop(1, 'rgba(255,236,190,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 6, hz); ctx.lineTo(x + 6, hz); ctx.lineTo(x + W * .22, hz + H * .55); ctx.lineTo(x - W * .22, hz + H * .55); ctx.closePath(); ctx.fill();
  // glints
  const r = rnd(((G.t * 6) | 0) + 11); ctx.fillStyle = `rgba(255,250,230,${(.7 * k).toFixed(3)})`;
  for (let i = 0; i < 40; i++) { const t = r(), y = hz + t * t * H * .5, w = (1 + t * 10) * (.5 + r()); ctx.fillRect(x + (r() - .5) * (W * .06 + t * W * .4), y, w, Math.max(1, w * .18)); }
  ctx.restore();
}

// the lit skyline mirrored in the water at night: wobbling columns of light under each tower, from the horizon down
function cityReflections(seg) {
  const hz = HORIZON - Math.tan(CAM.pitch) * FOCAL, N = LT.night, wob = G.t * 1.7;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const b of SKYB) { if (!b.layer) continue; const dx = angDiff(b.a, CAM.yaw); if (Math.abs(dx) > 1.1) continue;
    const x = W / 2 + Math.tan(dx) * FOCAL, w = b.w * FOCAL * .7, len = Math.min(H * .5, b.h * FOCAL * 1.6);
    const g = ctx.createLinearGradient(0, hz, 0, hz + len); g.addColorStop(0, `rgba(255,214,150,${(.32 * N * (.5 + b.t)).toFixed(3)})`); g.addColorStop(1, 'rgba(255,214,150,0)');
    ctx.fillStyle = g; const k = 7; for (let i = 0; i < k; i++) { const y0 = hz + len * i / k, y1 = hz + len * (i + 1) / k, sx = Math.sin(wob + i * 1.3 + b.t * 9) * (2 + i * 1.6); ctx.fillRect(x - w / 2 + sx, y0, w, y1 - y0 + 1); } }
  for (const lm of seg.th.lm || []) { if (lm.t !== 'tower' && lm.t !== 'skytree') continue; const a = seg.dir * Math.PI / 2 + (lm.off || 0) + (seg.lmOff || 0) * .3, dx = angDiff(a, CAM.yaw); if (Math.abs(dx) > 1.1) continue;
    const x = W / 2 + Math.tan(dx) * FOCAL, col = lm.t === 'tower' ? '255,150,80' : '170,200,255'; const g = ctx.createLinearGradient(0, hz, 0, hz + H * .5); g.addColorStop(0, `rgba(${col},${(.5 * N).toFixed(2)})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; for (let i = 0; i < 10; i++) { const y0 = hz + H * .05 * i, sx = Math.sin(wob * 1.1 + i) * (3 + i * 2); ctx.fillRect(x - 5 + sx, y0, 10 + i * 1.5, H * .05 + 1); } }
  ctx.restore();
}
