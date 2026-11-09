/* ================= illustrated obstacles =================
   The things that run at you (cars, scooters, bikes) and the common street obstacles are painted once
   as front-view illustrations (shading, glass, lights) and drawn as billboards, instead of as boxes.
   The boxes stay as the collision shape. Everything is generic: no badges, no brand shapes. */
const ART_C = new Map();
const ART_MAX = (navigator.maxTouchPoints >= 1 && Math.min(screen.width, screen.height) < 820) ? 120 : 260;
let ART_SOFT = 0, ART_KEPT = 0; // set while drawing something far away: a picture not painted yet waits for idle time instead
function artCanvas(key, w, h, paint) {
  let c = ART_C.get(key); if (c) return c;
  if (ART_SOFT && !texOK()) return null; TEXN++;
  if (ART_C.size - ART_KEPT > ART_MAX) { for (const [k0, old] of ART_C) { if (old.__keep) continue; ART_C.delete(k0); try { old.width = old.height = 0; } catch (e) { } break; } } // oldest loose picture out (phones); the ones the scenery holds on to do not count
  c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d') || noCtx(); if (g === NOCTX) return null; paint(g, w, h); ART_C.set(key, c); return c;
}
// out of picture memory (see noCtx): drop every picture that is only a kept copy; each is painted again when it is next needed
function freePictures() {
  while (LIT_LIST.length) { const e = LIT_LIST.shift(); const m = LIT_CACHE.get(e.img); if (m) { if (m[e.k] === e.c) delete m[e.k]; if (m.last === e.c) m.last = null; } try { e.c.width = e.c.height = 0; } catch (x) { } } LIT_PX = 0;
  for (const v of FAC_CACHE.values()) { try { v.c.width = v.c.height = 0; } catch (x) { } } FAC_CACHE.clear(); FAC_PX = 0;
  for (const [k0, old] of [...ART_C]) { if (old.__keep) continue; ART_C.delete(k0); try { old.width = old.height = 0; } catch (x) { } }
}
const shadeHex = (hex, k) => { const c = hexRgb(hex); return `rgb(${clamp(c[0] * k, 0, 255) | 0},${clamp(c[1] * k, 0, 255) | 0},${clamp(c[2] * k, 0, 255) | 0})`; };
function rrect(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
function vgrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([t, c]) => gr.addColorStop(t, c)); return gr; }

/* ---- cars, seen from the front ---- */
const CAR_SHAPE = { // cabin top, cabin bottom (as part of height), body roundness, cabin inset, ride height
  sedan: { ct: .14, cb: .46, r: .18, inset: .16, ride: .1 }, hybrid: { ct: .12, cb: .47, r: .22, inset: .17, ride: .1 }, taxi: { ct: .2, cb: .47, r: .14, inset: .15, ride: .1 },
  suv: { ct: .06, cb: .44, r: .14, inset: .1, ride: .14 }, kei: { ct: .04, cb: .42, r: .2, inset: .08, ride: .11 }, van: { ct: .03, cb: .38, r: .12, inset: .06, ride: .1 },
};
function paintCar(g, W, H, col, type) {
  const S = CAR_SHAPE[type] || CAR_SHAPE.sedan, ride = H * S.ride, bodyTop = H * S.cb, bodyBot = H - ride * .6;
  // shadow under the car
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(W / 2, H - 4, W * .5, 7, 0, 0, Math.PI * 2); g.fill();
  // tyres
  g.fillStyle = '#16181B'; for (const x of [W * .06, W * .79]) rrect(g, x, H - ride * 2.2, W * .15, ride * 2.2 - 2, 8), g.fill();
  // body
  const bx = W * .02, bw = W * .96;
  g.fillStyle = vgrad(g, bodyTop, bodyBot, [[0, shadeHex(col, 1.18)], [.18, shadeHex(col, 1.05)], [.55, shadeHex(col, .9)], [1, shadeHex(col, .62)]]);
  rrect(g, bx, bodyTop, bw, bodyBot - bodyTop, [W * S.r * .6, W * S.r * .6, 14, 14]); g.fill();
  // cabin (pillars in body colour) and windscreen
  const ci = W * S.inset, ct = H * S.ct;
  g.fillStyle = vgrad(g, ct, bodyTop, [[0, shadeHex(col, 1.1)], [1, shadeHex(col, .92)]]);
  g.beginPath(); g.moveTo(ci, bodyTop + 2); g.lineTo(ci + W * .07, ct + 6); g.quadraticCurveTo(W / 2, ct - 4, W - ci - W * .07, ct + 6); g.lineTo(W - ci, bodyTop + 2); g.closePath(); g.fill();
  const gi = W * .045, gt = ct + H * .045;
  g.fillStyle = vgrad(g, gt, bodyTop, [[0, '#B9D3E6'], [.45, '#6F8FA8'], [1, '#26323E']]);
  g.beginPath(); g.moveTo(ci + gi, bodyTop - 2); g.lineTo(ci + W * .07 + gi * .6, gt + 4); g.quadraticCurveTo(W / 2, gt - 3, W - ci - W * .07 - gi * .6, gt + 4); g.lineTo(W - ci - gi, bodyTop - 2); g.closePath(); g.fill();
  // a sky reflection streak and the interior (seats, a driver)
  g.save(); g.clip(); g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.moveTo(W * .58, gt); g.lineTo(W * .7, gt); g.lineTo(W * .48, bodyTop); g.lineTo(W * .36, bodyTop); g.closePath(); g.fill();
  g.fillStyle = 'rgba(20,24,30,.55)'; g.beginPath(); g.ellipse(W * .33, bodyTop - (bodyTop - gt) * .38, W * .07, (bodyTop - gt) * .3, 0, 0, Math.PI * 2); g.fill(); g.fillRect(W * .27, bodyTop - (bodyTop - gt) * .18, W * .12, (bodyTop - gt) * .2); g.restore();
  // mirrors
  g.fillStyle = shadeHex(col, .95); for (const x of [ci - W * .06, W - ci + W * .01]) { rrect(g, x, bodyTop - H * .05, W * .05, H * .06, 4); g.fill(); }
  // bonnet crease highlight
  g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W * .2, bodyTop + 6); g.quadraticCurveTo(W / 2, bodyTop + 1, W * .8, bodyTop + 6); g.stroke();
  // headlights (white glass) with amber corners, grille, bumper, plate
  const hy = bodyTop + (bodyBot - bodyTop) * .26, hh = (bodyBot - bodyTop) * .2;
  for (const sd of [-1, 1]) { const x = sd < 0 ? W * .07 : W * .93 - W * .2; g.fillStyle = vgrad(g, hy, hy + hh, [[0, '#FFFFFF'], [1, '#C9D2DA']]); rrect(g, x, hy, W * .2, hh, hh * .45); g.fill();
    g.fillStyle = 'rgba(255,190,90,.95)'; rrect(g, sd < 0 ? x : x + W * .2 - W * .045, hy + 2, W * .045, hh - 4, 3); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; rrect(g, x, hy, W * .2, hh, hh * .45); g.stroke(); }
  g.fillStyle = '#1F2328'; rrect(g, W * .33, hy + hh * .1, W * .34, hh * 1.1, 6); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1.5; for (let k = 1; k < 4; k++) { const y = hy + hh * .1 + k * hh * 1.1 / 4; g.beginPath(); g.moveTo(W * .35, y); g.lineTo(W * .65, y); g.stroke(); }
  const by = bodyBot - (bodyBot - bodyTop) * .3; g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(bx + 6, by, bw - 12, 3);
  g.fillStyle = '#2A2E33'; rrect(g, W * .2, by + 6, W * .6, (bodyBot - by) * .45, 5); g.fill();
  g.fillStyle = '#F4F4EC'; rrect(g, W * .38, by + 4, W * .24, (bodyBot - by) * .5, 3); g.fill(); g.strokeStyle = '#3C7A4E'; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = '#3C7A4E'; g.font = `900 ${Math.round((bodyBot - by) * .3)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('12-34', W / 2, by + 4 + (bodyBot - by) * .27);
  if (type === 'taxi') { const tw = W * .26, th = H * .09; g.fillStyle = '#FBF6EE'; rrect(g, W / 2 - tw / 2, ct - th + 4, tw, th, 4); g.fill(); g.strokeStyle = 'rgba(0,0,0,.3)'; g.stroke(); g.fillStyle = '#2B2B2B'; g.font = `900 ${Math.round(th * .7)}px sans-serif`; g.fillText('TAXI', W / 2, ct - th / 2 + 4); }
}
function paintSupercar(g, W, H, col) {
  const bodyTop = H * .5, bodyBot = H * .94;
  g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(W / 2, H - 4, W * .52, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#121416'; for (const x of [W * .04, W * .8]) { rrect(g, x, H * .7, W * .16, H * .28, 8); g.fill(); }
  g.fillStyle = vgrad(g, H * .3, bodyBot, [[0, shadeHex(col, 1.25)], [.35, shadeHex(col, 1)], [1, shadeHex(col, .55)]]);
  g.beginPath(); g.moveTo(W * .01, bodyBot); g.lineTo(W * .02, bodyTop + 10); g.quadraticCurveTo(W * .1, bodyTop - 8, W * .3, bodyTop - 10); g.lineTo(W * .7, bodyTop - 10); g.quadraticCurveTo(W * .9, bodyTop - 8, W * .98, bodyTop + 10); g.lineTo(W * .99, bodyBot); g.closePath(); g.fill();
  g.fillStyle = vgrad(g, H * .2, bodyTop - 8, [[0, '#9FB7C9'], [1, '#1F2A34']]);
  g.beginPath(); g.moveTo(W * .24, bodyTop - 8); g.quadraticCurveTo(W * .3, H * .22, W / 2, H * .2); g.quadraticCurveTo(W * .7, H * .22, W * .76, bodyTop - 8); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.moveTo(W * .56, H * .22); g.lineTo(W * .64, H * .23); g.lineTo(W * .5, bodyTop - 8); g.lineTo(W * .43, bodyTop - 8); g.closePath(); g.fill();
  for (const sd of [-1, 1]) { const x = sd < 0 ? W * .08 : W * .72; g.fillStyle = '#F4FBFF'; g.beginPath(); g.moveTo(x, bodyTop + 14); g.lineTo(x + W * .2, bodyTop + 6); g.lineTo(x + W * .2, bodyTop + 14); g.lineTo(x, bodyTop + 20); g.closePath(); g.fill(); }
  g.fillStyle = '#16181B'; for (const [x, w] of [[W * .06, W * .22], [W * .72, W * .22], [W * .34, W * .32]]) { rrect(g, x, H * .72, w, H * .14, 6); g.fill(); }
  g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W * .3, bodyTop + 2); g.quadraticCurveTo(W / 2, bodyTop - 6, W * .7, bodyTop + 2); g.stroke();
}
/* ---- people riding toward you ---- */
function paintRider(g, W, H, shirt, pants, helmet, kind) {
  const cx = W / 2;
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(cx, H - 5, W * .3, 6, 0, 0, Math.PI * 2); g.fill();
  if (kind === 'kick') { /* the scooter itself is drawn after the rider, in front (see the end) */
  } else { // a bicycle: thin wheel, fork, basket, handlebar
    g.fillStyle = '#16181B'; rrect(g, cx - W * .03, H * .72, W * .06, H * .27, 4); g.fill();
    g.fillStyle = '#6C7A88'; g.fillRect(cx - W * .015, H * .5, W * .03, H * .26);
    g.fillStyle = '#B9C3CC'; rrect(g, cx - W * .16, H * .5, W * .32, H * .12, 4); g.fill(); g.strokeStyle = '#6C7A88'; g.lineWidth = 2; for (let x = -.14; x <= .14; x += .04) { g.beginPath(); g.moveTo(cx + W * x, H * .5); g.lineTo(cx + W * x, H * .62); g.stroke(); }
    g.fillStyle = '#2F3B47'; rrect(g, cx - W * .3, H * .45, W * .6, H * .025, 4); g.fill();
    g.fillStyle = '#FFF3D6'; rrect(g, cx - W * .04, H * .63, W * .08, H * .035, 3); g.fill();
  }
  // legs
  g.fillStyle = vgrad(g, H * .55, H * .88, [[0, shadeHex(pants, 1.1)], [1, shadeHex(pants, .7)]]);
  const legB = kind === 'kick' ? H * .82 : H * .87; rrect(g, cx - W * .14, H * .55, W * .11, legB - H * .55, 6); g.fill(); rrect(g, cx + W * .03, H * .55, W * .11, legB - H * .55, 6); g.fill();
  g.fillStyle = '#2B2B2B'; rrect(g, cx - W * .16, legB - H * .02, W * .14, H * .04, 3); g.fill(); rrect(g, cx + W * .02, legB - H * .02, W * .14, H * .04, 3); g.fill();
  // body and arms reaching the handlebar
  g.fillStyle = vgrad(g, H * .2, H * .6, [[0, shadeHex(shirt, 1.15)], [1, shadeHex(shirt, .75)]]);
  rrect(g, cx - W * .2, H * .2, W * .4, H * .4, [W * .14, W * .14, 8, 8]); g.fill();
  g.strokeStyle = shadeHex(shirt, .85); g.lineWidth = W * .09; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx - W * .17, H * .27); g.quadraticCurveTo(cx - W * .3, H * .34, cx - W * .26, H * .43); g.moveTo(cx + W * .17, H * .27); g.quadraticCurveTo(cx + W * .3, H * .34, cx + W * .26, H * .43); g.stroke();
  g.fillStyle = '#F1D9C4'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(cx + sd * W * .26, H * .43, W * .045, 0, Math.PI * 2); g.fill(); }
  // head, hair, helmet
  g.fillStyle = vgrad(g, H * .06, H * .21, [[0, '#F6E2CF'], [1, '#E2BFA4']]); g.beginPath(); g.ellipse(cx, H * .14, W * .1, H * .075, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(60,40,30,.7)'; g.fillRect(cx - W * .05, H * .135, W * .025, H * .012); g.fillRect(cx + W * .025, H * .135, W * .025, H * .012);
  g.fillStyle = vgrad(g, H * .02, H * .12, [[0, shadeHex(helmet, 1.2)], [1, shadeHex(helmet, .8)]]); g.beginPath(); g.ellipse(cx, H * .1, W * .12, H * .065, 0, Math.PI, 0); g.fill(); g.fillRect(cx - W * .12, H * .095, W * .24, H * .015);
  if (kind === 'kick') kickScooter(g, W, H, cx);
}
// a shared electric kick scooter at a slight angle, in front of its rider: fat front wheel, teal stem with a bright
// headlight and a lightning badge, a wide handlebar with a little display, the long deck under the feet, a number plate
function kickScooter(g, W, H, cx) {
  const fx = cx - W * .06; // the front wheel sits a little to the left: we see the scooter three-quarter on
  g.fillStyle = '#2B2E33'; g.beginPath(); g.moveTo(fx - W * .05, H * .9); g.lineTo(cx + W * .3, H * .845); g.lineTo(cx + W * .32, H * .87); g.lineTo(fx + W * .02, H * .93); g.closePath(); g.fill(); // deck
  g.fillStyle = '#2BB38A'; g.beginPath(); g.moveTo(fx - W * .04, H * .925); g.lineTo(cx + W * .32, H * .87); g.lineTo(cx + W * .32, H * .885); g.lineTo(fx - W * .03, H * .94); g.closePath(); g.fill();
  g.fillStyle = '#16181B'; rrect(g, cx + W * .26, H * .86, W * .09, H * .07, 5); g.fill(); // rear wheel
  g.fillStyle = '#16181B'; rrect(g, fx - W * .09, H * .87, W * .18, H * .125, 9); g.fill(); g.fillStyle = '#4A4E54'; rrect(g, fx - W * .045, H * .9, W * .09, H * .07, 4); g.fill(); // front wheel
  g.fillStyle = '#2BB38A'; g.beginPath(); g.moveTo(fx - W * .11, H * .885); g.quadraticCurveTo(fx, H * .84, fx + W * .11, H * .885); g.lineTo(fx + W * .09, H * .895); g.quadraticCurveTo(fx, H * .86, fx - W * .09, H * .895); g.closePath(); g.fill(); // fender
  g.fillStyle = '#F7F7F2'; rrect(g, fx - W * .065, H * .8, W * .13, H * .04, 2); g.fill(); g.fillStyle = '#2F7A4E'; g.font = `900 ${Math.round(H * .024)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('12-34', fx, H * .821);
  const sg = g.createLinearGradient(fx - W * .04, 0, fx + W * .04, 0); sg.addColorStop(0, '#1C7A5E'); sg.addColorStop(.45, '#3FD3A4'); sg.addColorStop(1, '#1C7A5E');
  g.fillStyle = sg; g.beginPath(); g.moveTo(fx - W * .045, H * .8); g.lineTo(fx - W * .028, H * .4); g.lineTo(fx + W * .028, H * .4); g.lineTo(fx + W * .045, H * .8); g.closePath(); g.fill(); // stem, in front of the rider
  g.fillStyle = '#FFFBEA'; g.beginPath(); g.ellipse(fx, H * .6, W * .06, H * .026, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#155C47'; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = 'rgba(255,250,220,.55)'; g.beginPath(); g.ellipse(fx, H * .6, W * .1, H * .04, 0, 0, Math.PI * 2); g.fill(); // headlight glow
  g.fillStyle = '#F2C230'; g.beginPath(); g.moveTo(fx + W * .005, H * .66); g.lineTo(fx - W * .018, H * .7); g.lineTo(fx, H * .7); g.lineTo(fx - W * .008, H * .735); g.lineTo(fx + W * .02, H * .69); g.lineTo(fx + W * .002, H * .69); g.closePath(); g.fill(); // electric badge
  g.strokeStyle = '#2B2E33'; g.lineWidth = W * .04; g.lineCap = 'round'; g.beginPath(); g.moveTo(fx - W * .27, H * .405); g.quadraticCurveTo(fx, H * .38, fx + W * .3, H * .41); g.stroke();
  g.fillStyle = '#1C1C1E'; rrect(g, fx - W * .065, H * .372, W * .13, H * .032, 3); g.fill(); g.fillStyle = '#7FE0C0'; g.fillRect(fx - W * .045, H * .38, W * .09, H * .015);
  g.fillStyle = '#F1D9C4'; for (const x of [fx - W * .25, fx + W * .28]) { g.beginPath(); g.arc(x, H * .405, W * .045, 0, Math.PI * 2); g.fill(); } // hands on the grips
}
/* ---- street obstacles ---- */
function paintCone(g, W, H) {
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(W / 2, H - 4, W * .45, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#26282B'; rrect(g, W * .06, H * .88, W * .88, H * .1, 4); g.fill();
  const gr = g.createLinearGradient(W * .2, 0, W * .8, 0); gr.addColorStop(0, '#C9541C'); gr.addColorStop(.38, '#FF9A4A'); gr.addColorStop(1, '#B4461A');
  g.fillStyle = gr; g.beginPath(); g.moveTo(W * .44, H * .04); g.lineTo(W * .56, H * .04); g.lineTo(W * .82, H * .89); g.lineTo(W * .18, H * .89); g.closePath(); g.fill();
  g.save(); g.clip(); const wg = g.createLinearGradient(W * .2, 0, W * .8, 0); wg.addColorStop(0, '#C9CDD0'); wg.addColorStop(.38, '#FFFFFF'); wg.addColorStop(1, '#AEB3B7'); g.fillStyle = wg; g.fillRect(0, H * .3, W, H * .12); g.fillRect(0, H * .58, W, H * .1); g.restore();
}
function paintBarrier(g, W, H) {
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(W / 2, H - 4, W * .48, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3B3E42'; for (const x of [W * .06, W * .88]) { g.fillRect(x, H * .3, W * .06, H * .68); g.fillRect(x - W * .04, H * .94, W * .14, H * .05); }
  for (const y of [H * .32, H * .62]) { g.save(); rrect(g, W * .02, y, W * .96, H * .2, 4); g.clip(); g.fillStyle = '#F2C230'; g.fillRect(0, y, W, H * .2); g.fillStyle = '#222'; for (let x = -W; x < W * 1.2; x += W * .16) { g.beginPath(); g.moveTo(x, y + H * .2); g.lineTo(x + W * .08, y + H * .2); g.lineTo(x + W * .16, y); g.lineTo(x + W * .08, y); g.closePath(); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(0, y, W, H * .04); g.restore(); }
  g.fillStyle = '#FF5A3C'; g.beginPath(); g.arc(W / 2, H * .22, W * .05, 0, Math.PI * 2); g.fill();
}
function paintBench(g, W, H) {
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(W / 2, H - 4, W * .5, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3E4650'; for (const x of [W * .08, W * .86]) g.fillRect(x, H * .45, W * .06, H * .53);
  for (let k = 0; k < 3; k++) { const y = H * (.38 + k * .1); g.fillStyle = vgrad(g, y, y + H * .07, [[0, '#C8945F'], [1, '#8C6038']]); rrect(g, W * .02, y, W * .96, H * .07, 3); g.fill(); }
  for (let k = 0; k < 2; k++) { const y = H * (.04 + k * .14); g.fillStyle = vgrad(g, y, y + H * .09, [[0, '#C8945F'], [1, '#8C6038']]); rrect(g, W * .04, y, W * .92, H * .09, 3); g.fill(); }
  g.fillStyle = '#3E4650'; g.fillRect(W * .1, H * .02, W * .04, H * .4); g.fillRect(W * .86, H * .02, W * .04, H * .4);
}
function paintCardboard(g, W, H) {
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(W / 2, H - 4, W * .5, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = vgrad(g, H * .14, H, [[0, '#D9A86A'], [1, '#A9763E']]); g.fillRect(W * .04, H * .14, W * .92, H * .84);
  g.fillStyle = '#E7BC82'; g.beginPath(); g.moveTo(W * .04, H * .14); g.lineTo(W * .16, H * .02); g.lineTo(W * .98, H * .02); g.lineTo(W * .96, H * .14); g.closePath(); g.fill();
  g.fillStyle = 'rgba(240,230,200,.75)'; g.fillRect(W * .44, H * .14, W * .12, H * .84); g.fillRect(W * .5, H * .02, W * .1, H * .12);
  g.strokeStyle = 'rgba(90,60,30,.5)'; g.lineWidth = 2; g.strokeRect(W * .04, H * .14, W * .92, H * .84);
  g.fillStyle = 'rgba(60,40,20,.55)'; g.font = `900 ${Math.round(H * .1)}px ${typeof FAC_FONT !== 'undefined' ? FAC_FONT : 'sans-serif'}`; g.textAlign = 'center'; g.fillText('こわれもの', W * .26, H * .62); g.fillText('↑↑', W * .76, H * .5);
}
const ART = {
  car: (o, night) => artCanvas(`car|${o.av.t}|${o.av.c}`, 360, 300, (g, w, h) => paintCar(g, w, h, o.av.c, o.av.t)),
  supercar: (o) => artCanvas(`super|${o.av.c}`, 400, 220, (g, w, h) => paintSupercar(g, w, h, o.av.c)),
  kick: (o) => artCanvas(`kick|${o.av.s}|${o.av.p}|${o.av.h}`, 160, 320, (g, w, h) => paintRider(g, w, h, o.av.s, o.av.p, o.av.h, 'kick')),
  bike: (o) => artCanvas(`bike|${o.av.s}|${o.av.p}|${o.av.h}`, 160, 320, (g, w, h) => paintRider(g, w, h, o.av.s, o.av.p, o.av.h, 'bike')),
  cone: () => artCanvas('cone', 120, 140, paintCone),
  barrier: () => artCanvas('barrier', 240, 150, paintBarrier),
  bench: () => artCanvas('bench', 260, 110, paintBench),
  box: () => artCanvas('box', 200, 170, paintCardboard),
};
/* ---- more illustrated obstacles: everything you meet is painted, so its shape says what to do:
   jump = low and solid to the ground; slide = raised, clearly open underneath, supports at the sides; dodge = tall and solid ---- */
const SH = (g, W, H, k) => { g.fillStyle = `rgba(0,0,0,${k || .3})`; g.beginPath(); g.ellipse(W / 2, H - 4, W * .48, 6, 0, 0, Math.PI * 2); g.fill(); };
function paperSheet(g, x, y, w, h, tilt) { g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(tilt || 0); g.fillStyle = vgrad(g, -h / 2, h / 2, [[0, '#FFFFFF'], [1, '#E4E2DA']]); g.fillRect(-w / 2, -h / 2, w, h); g.strokeStyle = 'rgba(120,115,100,.35)'; g.lineWidth = 1; g.strokeRect(-w / 2, -h / 2, w, h); g.restore(); }
function paintPapers(g, W, H, tall) {
  SH(g, W, H); const n = tall ? 16 : 6, r = rnd(tall ? 9 : 5);
  for (let k = 0; k < n; k++) { const y = H - 6 - (k + 1) * (H - 10) / n, off = (r() - .5) * W * .08; paperSheet(g, W * .08 + off, y, W * .84, (H - 10) / n + 2, (r() - .5) * .05); }
  g.fillStyle = 'rgba(120,115,100,.25)'; for (let k = 1; k < n; k++) g.fillRect(W * .1, H - 6 - k * (H - 10) / n, W * .8, 1.5);
  if (tall) { g.fillStyle = '#C8463C'; g.fillRect(W * .12, H * .42, W * .14, H * .03); g.fillStyle = '#F2C230'; g.fillRect(W * .7, H * .2, W * .1, H * .04); }
}
function paintPlant(g, W, H) {
  SH(g, W, H); g.fillStyle = vgrad(g, H * .62, H, [[0, '#C8945F'], [1, '#8C6038']]); g.beginPath(); g.moveTo(W * .22, H * .64); g.lineTo(W * .78, H * .64); g.lineTo(W * .7, H * .98); g.lineTo(W * .3, H * .98); g.closePath(); g.fill();
  g.fillStyle = '#6B4631'; g.fillRect(W * .2, H * .62, W * .6, H * .04);
  const r = rnd(4); for (let k = 0; k < 14; k++) { const a = -Math.PI / 2 + (r() - .5) * 2.4, L = H * (.3 + r() * .3), cx = W / 2 + Math.cos(a) * L * .55, cy = H * .62 + Math.sin(a) * L;
    g.strokeStyle = '#3F6E3A'; g.lineWidth = 3; g.beginPath(); g.moveTo(W / 2, H * .62); g.quadraticCurveTo(W / 2 + Math.cos(a) * L * .2, H * .62 + Math.sin(a) * L * .6, cx, cy); g.stroke();
    g.fillStyle = vgrad(g, cy - 20, cy + 20, [[0, '#7DB46A'], [1, '#3F7A3F']]); g.beginPath(); g.ellipse(cx, cy, W * .13, H * .055, a + Math.PI / 2, 0, Math.PI * 2); g.fill(); }
}
function paintChair(g, W, H) {
  SH(g, W, H, .25); g.strokeStyle = '#2B2B2B'; g.lineWidth = 6; g.lineCap = 'round'; for (const x of [.15, .5, .85]) { g.beginPath(); g.moveTo(W / 2, H * .86); g.lineTo(W * x, H * .95); g.stroke(); }
  g.fillStyle = '#1C1C1E'; for (const x of [.15, .5, .85]) { g.beginPath(); g.arc(W * x, H * .95, 6, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#8A9098'; g.fillRect(W * .46, H * .55, W * .08, H * .32);
  g.fillStyle = vgrad(g, H * .44, H * .58, [[0, '#E0574A'], [1, '#9C2F27']]); rrect(g, W * .08, H * .46, W * .84, H * .12, 10); g.fill();
  g.fillStyle = vgrad(g, H * .02, H * .44, [[0, '#E0574A'], [1, '#A8352C']]); rrect(g, W * .16, H * .02, W * .68, H * .42, 14); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W * .24, H * .08); g.lineTo(W * .76, H * .08); g.stroke();
}
function paintSuitcase(g, W, H, col) {
  SH(g, W, H); g.fillStyle = '#2B2B2B'; for (const x of [.16, .84]) { g.beginPath(); g.arc(W * x, H * .95, 7, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = vgrad(g, H * .2, H * .92, [[0, shadeHex(col, 1.2)], [1, shadeHex(col, .7)]]); rrect(g, W * .06, H * .2, W * .88, H * .72, 14); g.fill();
  g.strokeStyle = shadeHex(col, .6); g.lineWidth = 3; for (const x of [.3, .5, .7]) { g.beginPath(); g.moveTo(W * x, H * .24); g.lineTo(W * x, H * .88); g.stroke(); }
  g.fillStyle = '#3B3B40'; g.fillRect(W * .36, H * .02, W * .05, H * .2); g.fillRect(W * .59, H * .02, W * .05, H * .2); rrect(g, W * .34, H * .0, W * .32, H * .05, 4); g.fill();
  g.fillStyle = '#F2C230'; g.fillRect(W * .06, H * .56, W * .88, H * .05);
}
function paintBags(g, W, H) {
  SH(g, W, H); for (const [x, w, h, c] of [[.04, .5, .82, '#5C8FC4'], [.46, .5, .74, '#E9E2D5']]) { const y = H - H * h - 3;
    g.fillStyle = vgrad(g, y, H, [[0, shadeHex(c, 1.12)], [1, shadeHex(c, .78)]]); g.fillRect(W * x, y, W * w, H * h);
    g.strokeStyle = shadeHex(c, .6); g.lineWidth = 4; g.beginPath(); g.arc(W * (x + w / 2), y, W * w * .22, Math.PI, 0); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(W * x, y, W * w * .18, H * h); }
  g.fillStyle = '#C8463C'; g.font = `900 ${Math.round(H * .16)}px sans-serif`; g.textAlign = 'center'; g.fillText('SALE', W * .29, H * .62);
}
function paintCrates(g, W, H, n) {
  SH(g, W, H); const h = (H - 6) / n; for (let k = 0; k < n; k++) { const y = H - 6 - (k + 1) * h, c = k % 2 ? '#C8463C' : '#E0A030';
    g.fillStyle = vgrad(g, y, y + h, [[0, shadeHex(c, 1.15)], [1, shadeHex(c, .78)]]); rrect(g, W * .04, y + 2, W * .92, h - 2, 6); g.fill();
    g.fillStyle = 'rgba(0,0,0,.25)'; for (const x of [.18, .42, .62]) rrect(g, W * x, y + h * .25, W * .16, h * .32, 4), g.fill(); }
}
function paintStroller(g, W, H) {
  SH(g, W, H); g.fillStyle = '#1C1C1E'; for (const x of [.12, .88]) { g.beginPath(); g.arc(W * x, H * .9, W * .09, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = '#46525E'; g.lineWidth = 5; g.beginPath(); g.moveTo(W * .12, H * .9); g.lineTo(W * .3, H * .5); g.moveTo(W * .88, H * .9); g.lineTo(W * .7, H * .5); g.stroke();
  g.fillStyle = vgrad(g, H * .4, H * .72, [[0, '#B9C7D6'], [1, '#7F93A8']]); rrect(g, W * .16, H * .4, W * .68, H * .32, 16); g.fill();
  g.fillStyle = vgrad(g, H * .05, H * .45, [[0, '#9AB0C6'], [1, '#5F7790']]); g.beginPath(); g.moveTo(W * .12, H * .45); g.quadraticCurveTo(W * .2, H * .02, W * .55, H * .05); g.quadraticCurveTo(W * .86, H * .1, W * .88, H * .45); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 2; for (const t of [.25, .5, .75]) { g.beginPath(); g.moveTo(W * (.12 + .76 * t), H * .45); g.lineTo(W * (.3 + .3 * t), H * .07); g.stroke(); }
}
function paintSandwich(g, W, H, txt) {
  SH(g, W, H); g.fillStyle = '#5A3D27'; g.fillRect(W * .04, H * .94, W * .1, H * .05); g.fillRect(W * .86, H * .94, W * .1, H * .05);
  g.fillStyle = vgrad(g, 0, H, [[0, '#7A5538'], [1, '#4A3020']]); g.beginPath(); g.moveTo(W * .1, H * .02); g.lineTo(W * .9, H * .02); g.lineTo(W * .98, H * .96); g.lineTo(W * .02, H * .96); g.closePath(); g.fill();
  g.fillStyle = '#F6EBDC'; g.beginPath(); g.moveTo(W * .16, H * .08); g.lineTo(W * .84, H * .08); g.lineTo(W * .9, H * .88); g.lineTo(W * .1, H * .88); g.closePath(); g.fill();
  g.fillStyle = '#3B2A20'; g.font = `900 ${Math.round(W * .2)}px ${typeof FAC_FONT !== 'undefined' ? FAC_FONT : 'sans-serif'}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  [...txt].forEach((ch, i, a) => g.fillText(ch, W / 2, H * (.2 + .62 * (i + .5) / a.length)));
}
function paintCafe(g, W, H, col) {
  SH(g, W, H); g.fillStyle = '#9AA0A6'; g.fillRect(W * .48, H * .08, W * .04, H * .58);
  g.fillStyle = vgrad(g, 0, H * .14, [[0, shadeHex(col, 1.2)], [1, shadeHex(col, .8)]]); g.beginPath(); g.moveTo(W * .02, H * .14); g.quadraticCurveTo(W / 2, -H * .06, W * .98, H * .14); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(W * (.1 + k * .2), H * .14); g.lineTo(W / 2, H * .02); g.lineTo(W * (.2 + k * .2), H * .14); g.closePath(); if (k % 2) g.fill(); }
  g.fillStyle = vgrad(g, H * .62, H, [[0, '#FBF6EE'], [1, '#D9D2C6']]); g.beginPath(); g.moveTo(W * .26, H * .64); g.lineTo(W * .74, H * .64); g.lineTo(W * .8, H * .97); g.lineTo(W * .2, H * .97); g.closePath(); g.fill(); // a cloth to the ground
  g.fillStyle = vgrad(g, H * .6, H, [[0, '#B08155'], [1, '#7A5538']]); rrect(g, W * .02, H * .62, W * .16, H * .36, 6); g.fill(); rrect(g, W * .82, H * .62, W * .16, H * .36, 6); g.fill();
}
function paintFlowers(g, W, H) {
  SH(g, W, H); g.fillStyle = vgrad(g, H * .45, H, [[0, '#D9D2C6'], [1, '#A39C90']]); g.fillRect(W * .04, H * .45, W * .92, H * .53);
  g.fillStyle = '#4C8A48'; g.beginPath(); g.ellipse(W / 2, H * .45, W * .48, H * .14, 0, 0, Math.PI * 2); g.fill();
  const r = rnd(8); for (let k = 0; k < 18; k++) { g.fillStyle = ['#E86A75', '#F2C230', '#FBF6EE', '#C792EA', '#F08A2E'][(r() * 5) | 0]; g.beginPath(); g.arc(W * (.08 + r() * .84), H * (.26 + r() * .2), W * .045, 0, Math.PI * 2); g.fill(); }
}
function paintLeaves(g, W, H) {
  SH(g, W, H, .2); g.fillStyle = vgrad(g, 0, H, [[0, '#F2CD45'], [1, '#C9961B']]); g.beginPath(); g.moveTo(W * .02, H * .98); g.quadraticCurveTo(W * .12, H * .1, W / 2, H * .04); g.quadraticCurveTo(W * .88, H * .1, W * .98, H * .98); g.closePath(); g.fill();
  const r = rnd(3); for (let k = 0; k < 40; k++) { g.fillStyle = ['#F2CD45', '#E8B923', '#D9A21B', '#C77A1B'][(r() * 4) | 0]; g.save(); g.translate(W * (.12 + r() * .76), H * (.2 + r() * .72)); g.rotate(r() * 6); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, W * .06, -.6, .6); g.closePath(); g.fill(); g.restore(); }
}
// 雪の日に転がってくる雪玉（B-28）：白い玉に青い影、てっぺんの光、表面の小さな雪のつぶ
function paintSnowball(g, W, H) {
  SH(g, W, H, .22); const r = Math.min(W, H) * .47, cx = W / 2, cy = H - r - H * .02;
  const gr = g.createRadialGradient(cx - r * .35, cy - r * .4, r * .1, cx, cy, r); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(.65, '#EEF3F8'); gr.addColorStop(1, '#B9C8DA');
  g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(120,140,170,.55)'; g.lineWidth = Math.max(2, W * .012); g.stroke();
  const q = rnd(7); g.fillStyle = 'rgba(160,178,205,.55)'; for (let k = 0; k < 14; k++) { const a = q() * Math.PI * 2, d = q() * r * .85; g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r * (.03 + q() * .04), 0, Math.PI * 2); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(cx - r * .38, cy - r * .45, r * .2, r * .12, -.6, 0, Math.PI * 2); g.fill();
}
function paintStools(g, W, H) {
  SH(g, W, H); for (const x of [.02, .52]) { g.fillStyle = '#7A1F18'; g.fillRect(W * (x + .05), H * .22, W * .05, H * .76); g.fillRect(W * (x + .36), H * .22, W * .05, H * .76);
    g.fillStyle = vgrad(g, 0, H * .24, [[0, '#E0574A'], [1, '#9C2F27']]); g.beginPath(); g.ellipse(W * (x + .23), H * .14, W * .23, H * .12, 0, 0, Math.PI * 2); g.fill(); g.fillRect(W * x, H * .14, W * .46, H * .1); }
}
function paintUmbrellas(g, W, H) {
  SH(g, W, H); const cs = ['#C8463C', '#F2C230', '#3B2A20', '#355F86'];
  cs.forEach((c, k) => { const x = W * (.24 + k * .17), top = H * (.04 + (k % 2) * .08); g.strokeStyle = shadeHex(c, .8); g.lineWidth = W * .07; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, H * .55); g.lineTo(x + (k - 1.5) * 4, top + H * .06); g.stroke();
    g.strokeStyle = '#3B2A20'; g.lineWidth = 3; g.beginPath(); g.arc(x + (k - 1.5) * 4 + 6, top + H * .06, 7, Math.PI, 0, true); g.stroke(); });
  g.fillStyle = vgrad(g, H * .5, H, [[0, '#6A8FB5'], [1, '#3E5F80']]); rrect(g, W * .12, H * .5, W * .76, H * .48, 10); g.fill(); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(W * .16, H * .54, W * .1, H * .4);
}
function paintCopier(g, W, H) {
  SH(g, W, H); g.fillStyle = vgrad(g, H * .2, H, [[0, '#E9ECEF'], [1, '#B9C0C7']]); rrect(g, W * .03, H * .14, W * .94, H * .84, 8); g.fill();
  g.fillStyle = '#9AA9B6'; rrect(g, W * .03, H * .02, W * .94, H * .14, 6); g.fill(); g.fillStyle = '#46525E'; rrect(g, W * .55, H * .2, W * .34, H * .12, 4); g.fill(); g.fillStyle = '#7FD06A'; g.fillRect(W * .6, H * .23, W * .08, H * .05);
  g.fillStyle = '#FFFFFF'; g.fillRect(W * .08, H * .26, W * .38, H * .05); g.fillStyle = '#C9CDD2'; for (const y of [.48, .66, .84]) { g.fillRect(W * .08, H * y, W * .84, H * .02); rrect(g, W * .42, H * (y - .08), W * .16, H * .04, 3); g.fill(); }
}
function paintMug(g, W, H) {
  SH(g, W, H); g.strokeStyle = '#E9E2D5'; g.lineWidth = W * .1; g.beginPath(); g.arc(W * .82, H * .5, W * .14, -1.2, 1.2); g.stroke();
  g.fillStyle = vgrad(g, 0, H, [[0, '#FFFFFF'], [1, '#D9D2C6']]); rrect(g, W * .06, H * .04, W * .74, H * .94, [6, 6, 22, 22]); g.fill();
  g.fillStyle = '#4E77A0'; g.fillRect(W * .06, H * .36, W * .74, H * .12); g.fillStyle = '#6B4631'; g.beginPath(); g.ellipse(W * .43, H * .06, W * .34, H * .04, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * .3, H * .02); g.quadraticCurveTo(W * .25, -H * .1, W * .35, -H * .2); g.stroke();
}
function paintToys(g, W, H) {
  SH(g, W, H); const blk = (x, y, s, c) => { g.fillStyle = vgrad(g, y, y + s, [[0, shadeHex(c, 1.15)], [1, shadeHex(c, .75)]]); rrect(g, x, y, s, s, 6); g.fill(); };
  blk(W * .02, H * .52, W * .42, '#E86A75'); blk(W * .5, H * .52, W * .42, '#4E77A0'); blk(W * .26, H * .1, W * .42, '#F2C230');
  g.fillStyle = '#FBF6EE'; g.font = `900 ${Math.round(W * .26)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('A', W * .23, H * .74); g.fillText('B', W * .71, H * .74); g.fillText('C', W * .47, H * .32);
}
function paintCushions(g, W, H) { // two zabuton cushions stacked: plump, with the centre tuft and corner tassels
  g.fillStyle = 'rgba(40,30,20,.28)'; g.beginPath(); g.ellipse(W / 2, H - 6, W * .47, 7, 0, 0, Math.PI * 2); g.fill();
  const cols = [['#6E7FA6', '#465577'], ['#C98E4E', '#8E5E2E']];
  for (let k = 0; k < 2; k++) { const h = H * .4, y = H - 8 - h * (k + 1) * .9, x = W * (.05 + k * .02), w = W * (.9 - k * .04);
    puffLayer(g, x, y, w, h, cols[k][0], cols[k][1], { bulge: .35, sag: .18 });
    g.fillStyle = 'rgba(30,20,10,.28)'; g.beginPath(); g.ellipse(W / 2, y + h * .42, 5, 3, 0, 0, Math.PI * 2); g.fill(); // the centre tuft
    g.strokeStyle = '#E9C9A0'; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 - 5, y + h * .38); g.lineTo(W / 2 + 5, y + h * .46); g.moveTo(W / 2 + 5, y + h * .38); g.lineTo(W / 2 - 5, y + h * .46); g.stroke();
    g.fillStyle = shadeHex(cols[k][0], .8); for (const tx of [x - 2, x + w + 2]) { g.beginPath(); g.ellipse(tx, y + h * .5, 3.5, 6, 0, 0, Math.PI * 2); g.fill(); } } // corner tassels
}
function paintPot(g, W, H) {
  SH(g, W, H); g.fillStyle = vgrad(g, H * .18, H, [[0, '#C9D2DA'], [.5, '#9AA9B6'], [1, '#6E7B88']]); rrect(g, W * .08, H * .18, W * .84, H * .8, [4, 4, 18, 18]); g.fill();
  g.fillStyle = '#7D8B97'; rrect(g, W * .02, H * .12, W * .96, H * .1, 6); g.fill(); g.fillStyle = '#46525E'; rrect(g, W * .42, H * .0, W * .16, H * .12, 5); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(W * .16, H * .26, W * .06, H * .6);
}
function paintClock(g, W, H) {
  SH(g, W, H); g.fillStyle = '#C9962F'; for (const x of [.22, .78]) { g.beginPath(); g.arc(W * x, H * .14, W * .14, Math.PI, 0); g.fill(); }
  g.strokeStyle = '#3B2A20'; g.lineWidth = 5; g.beginPath(); g.moveTo(W * .2, H * .98); g.lineTo(W * .3, H * .82); g.moveTo(W * .8, H * .98); g.lineTo(W * .7, H * .82); g.stroke();
  g.fillStyle = vgrad(g, H * .14, H * .9, [[0, '#E86A5F'], [1, '#A8352C']]); g.beginPath(); g.arc(W / 2, H * .52, W * .42, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FBF6EE'; g.beginPath(); g.arc(W / 2, H * .52, W * .32, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#2B2B2B'; g.lineWidth = 4; g.beginPath(); g.moveTo(W / 2, H * .52); g.lineTo(W / 2, H * .3); g.moveTo(W / 2, H * .52); g.lineTo(W * .66, H * .58); g.stroke();
}
function paintBinoculars(g, W, H) {
  SH(g, W, H); g.fillStyle = vgrad(g, H * .4, H, [[0, '#5A6672'], [1, '#2F3B47']]); g.fillRect(W * .38, H * .4, W * .24, H * .5); rrect(g, W * .2, H * .86, W * .6, H * .12, 6); g.fill();
  g.fillStyle = vgrad(g, 0, H * .4, [[0, '#B9C3CC'], [1, '#7D8B97']]); rrect(g, W * .06, H * .06, W * .88, H * .3, 12); g.fill();
  g.fillStyle = '#1C1C1E'; for (const x of [.28, .72]) { g.beginPath(); g.arc(W * x, H * .21, W * .12, 0, Math.PI * 2); g.fill(); } g.fillStyle = 'rgba(120,180,230,.5)'; for (const x of [.25, .69]) { g.beginPath(); g.arc(W * x, H * .18, W * .04, 0, Math.PI * 2); g.fill(); }
}
function paintGacha(g, W, H) {
  SH(g, W, H); for (const [x, c] of [[.01, '#E86A75'], [.51, '#4E77A0']]) { g.fillStyle = vgrad(g, H * .5, H, [[0, shadeHex(c, 1.1)], [1, shadeHex(c, .7)]]); rrect(g, W * x, H * .52, W * .48, H * .46, 6); g.fill();
    g.fillStyle = 'rgba(220,240,250,.85)'; rrect(g, W * (x + .02), H * .04, W * .44, H * .48, 6); g.fill(); const r = rnd(x * 10 + 2); for (let k = 0; k < 9; k++) { g.fillStyle = ['#F2C230', '#E86A75', '#7FD06A', '#C792EA', '#FBF6EE'][(r() * 5) | 0]; g.beginPath(); g.arc(W * (x + .08 + r() * .32), H * (.2 + r() * .28), W * .05, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#C9CDD2'; g.beginPath(); g.arc(W * (x + .24), H * .7, W * .07, 0, Math.PI * 2); g.fill(); }
}
function paintTripod(g, W, H) {
  SH(g, W, H); g.fillStyle = vgrad(g, H * .52, H, [[0, '#4A5866'], [1, '#2F3B47']]); rrect(g, W * .2, H * .55, W * .6, H * .43, 8); g.fill(); g.fillStyle = '#2B2B2B'; g.fillRect(W * .2, H * .62, W * .6, H * .04);
  g.strokeStyle = '#1C1C1E'; g.lineWidth = 4; g.beginPath(); g.moveTo(W / 2, H * .18); g.lineTo(W * .1, H * .98); g.moveTo(W / 2, H * .18); g.lineTo(W * .9, H * .98); g.moveTo(W / 2, H * .18); g.lineTo(W / 2, H * .55); g.stroke();
  g.fillStyle = '#1E1E22'; rrect(g, W * .28, H * .02, W * .44, H * .16, 6); g.fill(); g.fillStyle = '#46525E'; g.beginPath(); g.arc(W / 2, H * .1, W * .08, 0, Math.PI * 2); g.fill();
}
function paintStoneLantern(g, W, H) {
  SH(g, W, H); const st = (y0, y1, x0, x1, c) => { g.fillStyle = vgrad(g, y0, y1, [[0, shadeHex(c, 1.12)], [1, shadeHex(c, .8)]]); g.fillRect(W * x0, H * y0, W * (x1 - x0), H * (y1 - y0)); };
  st(.84, .98, .1, .9, '#8F8A80'); st(.4, .84, .36, .64, '#9A958A'); st(.32, .4, .2, .8, '#8F8A80'); st(.16, .32, .26, .74, '#A09B90');
  g.fillStyle = LT && LT.night > .4 ? '#FFD58A' : '#4A463E'; g.fillRect(W * .38, H * .19, W * .24, H * .1);
  g.fillStyle = vgrad(g, 0, H * .17, [[0, '#A09B90'], [1, '#7A756D']]); g.beginPath(); g.moveTo(W * .06, H * .17); g.quadraticCurveTo(W / 2, -H * .02, W * .94, H * .17); g.closePath(); g.fill();
}
function paintRickshaw(g, W, H) {
  SH(g, W, H); g.fillStyle = '#1C1C1E'; for (const x of [.04, .86]) rrect(g, W * x, H * .4, W * .1, H * .58, 6), g.fill();
  g.fillStyle = vgrad(g, H * .3, H * .62, [[0, '#D9452B'], [1, '#8E2A1C']]); rrect(g, W * .14, H * .34, W * .72, H * .26, 8); g.fill();
  g.fillStyle = '#2B2B2B'; g.beginPath(); g.moveTo(W * .14, H * .34); g.quadraticCurveTo(W / 2, H * .02, W * .86, H * .34); g.closePath(); g.fill();
  g.fillStyle = '#F1D9C4'; g.beginPath(); g.arc(W / 2, H * .46, W * .08, 0, Math.PI * 2); g.fill(); g.fillStyle = '#2B2B2B'; g.fillRect(W * .42, H * .54, W * .16, H * .3); g.fillStyle = '#F3EEE6'; g.fillRect(W * .44, H * .38, W * .12, H * .04);
  g.strokeStyle = '#3B2A20'; g.lineWidth = 4; g.beginPath(); g.moveTo(W * .2, H * .62); g.lineTo(W * .3, H * .88); g.moveTo(W * .8, H * .62); g.lineTo(W * .7, H * .88); g.stroke();
}
function paintTableHigh(g, W, H, kind) { // a table seen from the front: a top, two legs at the sides, open underneath
  SH(g, W, H, .18); const wood = kind === 'chabudai' ? ['#A86E40', '#5E3820'] : kind === 'table' ? ['#C8945F', '#8C6038'] : ['#F1EEE8', '#B9B4AA'];
  const top = kind === 'wboard' ? .02 : .0, legW = W * .06;
  if (kind === 'wboard') { g.fillStyle = '#9AA9B6'; g.fillRect(W * .02, H * .3, legW, H * .7); g.fillRect(W * .92, H * .3, legW, H * .7); g.fillRect(0, H * .96, W * .14, H * .04); g.fillRect(W * .86, H * .96, W * .14, H * .04);
    g.fillStyle = '#C9D2DA'; rrect(g, W * .04, H * .0, W * .92, H * .66, 6); g.fill(); g.fillStyle = '#FFFFFF'; rrect(g, W * .07, H * .03, W * .86, H * .6, 4); g.fill();
    g.strokeStyle = '#4E77A0'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * .15, H * .4); g.lineTo(W * .35, H * .3); g.lineTo(W * .5, H * .45); g.lineTo(W * .75, H * .15); g.stroke(); g.strokeStyle = '#C8463C'; g.beginPath(); g.moveTo(W * .15, H * .52); g.lineTo(W * .55, H * .52); g.stroke();
    g.fillStyle = '#9AA9B6'; g.fillRect(W * .04, H * .64, W * .92, H * .04); return; }
  g.fillStyle = vgrad(g, H * .2, H, [[0, wood[1]], [1, shadeHex(wood[1], .7)]]); g.fillRect(W * .05, H * .2, legW, H * .78); g.fillRect(W * .89, H * .2, legW, H * .78);
  g.fillStyle = vgrad(g, top, H * .22, [[0, shadeHex(wood[0], 1.15)], [1, wood[1]]]); rrect(g, 0, top, W, H * .22, 5); g.fill();
  g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(W * .02, top + 2, W * .96, H * .03);
}
function paintShoes(g, W, H, c) {
  SH(g, W, H, .22); for (const x of [.02, .52]) { g.fillStyle = '#EDEDED'; rrect(g, W * x, H * .3, W * .46, H * .66, [18, 18, 8, 8]); g.fill(); g.fillStyle = c; rrect(g, W * x, H * .3, W * .46, H * .28, [18, 18, 4, 4]); g.fill();
    g.fillStyle = '#9AA0A6'; g.fillRect(W * x, H * .86, W * .46, H * .1); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; for (const y of [.44, .54]) { g.beginPath(); g.moveTo(W * (x + .12), H * y); g.lineTo(W * (x + .34), H * y); g.stroke(); } }
}
function paintRoomba(g, W, H) {
  SH(g, W, H, .25); g.fillStyle = vgrad(g, H * .1, H, [[0, '#55565E'], [1, '#22232A']]); g.beginPath(); g.ellipse(W / 2, H * .55, W * .48, H * .42, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#6A6A72'; g.beginPath(); g.ellipse(W / 2, H * .38, W * .3, H * .2, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#7FD06A'; g.beginPath(); g.arc(W / 2, H * .6, 4, 0, Math.PI * 2); g.fill();
}
function paintBarrier2(g, W, H) { // a road barrier with a solid panel to the ground: plainly something to jump
  SH(g, W, H); g.fillStyle = '#3B3E42'; for (const x of [W * .04, W * .9]) g.fillRect(x, H * .14, W * .06, H * .84);
  g.save(); rrect(g, W * .02, H * .2, W * .96, H * .78, 6); g.clip(); g.fillStyle = '#F2C230'; g.fillRect(0, H * .2, W, H * .78); g.fillStyle = '#222'; for (let x = -W; x < W * 1.2; x += W * .18) { g.beginPath(); g.moveTo(x, H); g.lineTo(x + W * .09, H); g.lineTo(x + W * .09 + H * .8, H * .2); g.lineTo(x + H * .8, H * .2); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(0, H * .2, W, H * .05); g.restore();
  g.fillStyle = '#FF5A3C'; g.beginPath(); g.arc(W / 2, H * .1, W * .05, 0, Math.PI * 2); g.fill();
}
Object.assign(ART, {
  papers: () => artCanvas('papers', 220, 130, (g, w, h) => paintPapers(g, w, h, 0)), paperTall: () => artCanvas('paperTall', 220, 380, (g, w, h) => paintPapers(g, w, h, 1)),
  plant: () => artCanvas('plant', 240, 420, paintPlant), chair: () => artCanvas('chair', 200, 170, paintChair),
  suitcase: o => artCanvas('suitcase|' + o.av.c, 200, 170, (g, w, h) => paintSuitcase(g, w, h, o.av.c)), bags: () => artCanvas('bags', 220, 150, paintBags),
  crate: o => artCanvas('crate' + o.av.n, 200, 100 * o.av.n + 20, (g, w, h) => paintCrates(g, w, h, o.av.n)), stroller: () => artCanvas('stroller', 200, 240, paintStroller),
  sign: o => artCanvas('sign|' + o.av.t, 240, 320, (g, w, h) => paintSandwich(g, w, h, o.av.t)), parasol: o => artCanvas('cafe|' + o.av.c, 320, 440, (g, w, h) => paintCafe(g, w, h, o.av.c)),
  flowers: () => artCanvas('flowers', 240, 160, paintFlowers), leafpile: () => artCanvas('leaves', 260, 120, paintLeaves), snowball: () => artCanvas('snowball', 200, 190, paintSnowball), stoolsO: () => artCanvas('stools', 240, 130, paintStools),
  umbrella: () => artCanvas('umbrellas', 180, 380, paintUmbrellas), copier: () => artCanvas('copier', 280, 280, paintCopier), mug: () => artCanvas('mug', 200, 200, paintMug),
  toys: () => artCanvas('toys', 200, 180, paintToys), zabuton: () => artCanvas('zabuton', 260, 100, paintCushions), pot: () => artCanvas('pot', 220, 180, paintPot), clock: () => artCanvas('clock', 180, 180, paintClock),
  telescope: () => artCanvas('scope', 180, 320, paintBinoculars), gachaO: () => artCanvas('gacha', 260, 340, paintGacha), tripod: () => artCanvas('tripod', 200, 330, paintTripod),
  stoneLanternO: () => artCanvas('lantern', 200, 380, paintStoneLantern), jokoro: () => artCanvas('lantern', 200, 380, paintStoneLantern), rickshaw: () => artCanvas('rickshaw', 260, 360, paintRickshaw),
  table: () => artCanvas('table', 320, 170, (g, w, h) => paintTableHigh(g, w, h, 'table')), chabudai: () => artCanvas('chabudai', 320, 160, (g, w, h) => paintTableHigh(g, w, h, 'chabudai')),
  mtable: () => artCanvas('mtable', 320, 160, (g, w, h) => paintTableHigh(g, w, h, 'mtable')), wboard: () => artCanvas('wboard', 320, 420, (g, w, h) => paintTableHigh(g, w, h, 'wboard')),
  shoes: () => artCanvas('shoes', 180, 80, (g, w, h) => paintShoes(g, w, h, '#C8463C')), slipper: () => artCanvas('slipper', 180, 70, (g, w, h) => paintShoes(g, w, h, '#4E77A0')), roomba: () => artCanvas('roomba', 200, 70, paintRoomba),
  barrier: () => artCanvas('barrier2', 240, 150, paintBarrier2),
});

/* ================= props as illustrations =================
   Free-standing props (vending machines, plants, lanterns, stalls, bicycles...) are painted pieces stood in the scene
   instead of stacks of boxes; furniture against a wall keeps its body but shows a painted front. */
function paintVending(g, W, H, night, col) {
  SH(g, W, H, .3); g.fillStyle = vgrad(g, 0, H, [[0, shadeHex(col, 1.1)], [1, shadeHex(col, .75)]]); rrect(g, W * .04, H * .02, W * .92, H * .96, 6); g.fill();
  g.fillStyle = night ? '#FFFBEA' : '#F4F6F8'; rrect(g, W * .1, H * .08, W * .8, H * .5, 4); g.fill();
  const cs = ['#C8463C', '#F2C230', '#4E77A0', '#5F9E5A', '#E86A75', '#F08A2E', '#FBF6EE'];
  for (let row = 0; row < 3; row++) for (let k = 0; k < 5; k++) { const x = W * (.14 + k * .148), y = H * (.12 + row * .15); g.fillStyle = cs[(row * 5 + k * 3) % 7]; rrect(g, x, y, W * .1, H * .1, 3); g.fill(); g.fillStyle = '#2B2B2B'; g.fillRect(x, y + H * .11, W * .1, H * .015); }
  if (night) { g.fillStyle = 'rgba(255,250,220,.35)'; g.fillRect(W * .1, H * .08, W * .8, H * .5); }
  g.fillStyle = '#2B2B2B'; rrect(g, W * .62, H * .62, W * .2, H * .1, 3); g.fill(); g.fillStyle = '#1C1C1E'; rrect(g, W * .14, H * .8, W * .72, H * .12, 4); g.fill();
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(W * .08, H * .04, W * .04, H * .9);
}
function paintPost(g, W, H) {
  SH(g, W, H); g.fillStyle = vgrad(g, 0, H, [[0, '#E0574A'], [1, '#9C2F27']]); rrect(g, W * .12, H * .12, W * .76, H * .86, [W * .3, W * .3, 6, 6]); g.fill();
  g.fillStyle = '#1C1C1E'; rrect(g, W * .24, H * .32, W * .52, H * .06, 3); g.fill(); g.fillStyle = '#FBF6EE'; rrect(g, W * .3, H * .48, W * .4, H * .18, 3); g.fill();
  g.fillStyle = '#C8463C'; g.font = `900 ${Math.round(W * .2)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('〒', W / 2, H * .57); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(W * .2, H * .18, W * .08, H * .7);
}
function bicycle(g, x, y, s, col) { g.strokeStyle = '#1C1C1E'; g.lineWidth = 3; for (const dx of [-.32, .32]) { g.beginPath(); g.arc(x + dx * s, y, s * .26, 0, Math.PI * 2); g.stroke(); }
  g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); g.moveTo(x - .32 * s, y); g.lineTo(x - .05 * s, y - .3 * s); g.lineTo(x + .22 * s, y - .3 * s); g.lineTo(x + .32 * s, y); g.moveTo(x - .05 * s, y - .3 * s); g.lineTo(x + .02 * s, y); g.lineTo(x - .32 * s, y); g.moveTo(x + .22 * s, y - .3 * s); g.lineTo(x + .28 * s, y - .45 * s); g.stroke();
  g.fillStyle = '#2B2B2B'; g.fillRect(x - .1 * s, y - .36 * s, .14 * s, .05 * s); g.fillRect(x + .22 * s, y - .48 * s, .14 * s, .04 * s);
  g.fillStyle = '#B9C3CC'; rrect(g, x + .3 * s, y - .44 * s, .16 * s, .12 * s, 2); g.fill(); }
function paintBikes(g, W, H) { SH(g, W, H, .22); const cs = ['#3A6FB0', '#C8463C', '#5F9E5A', '#E9E9E9']; for (let k = 0; k < 3; k++) bicycle(g, W * (.2 + k * .3), H * .72 - k * 2, W * .34, cs[k % 4]); }
function seasonShadow(g, W, H, k) { g.fillStyle = `rgba(40,25,10,${k || .28})`; g.beginPath(); g.ellipse(W / 2, H - 6, W * .4, 7, 0, 0, Math.PI * 2); g.fill(); }
function seasonPot(g, cx, y, w, h, c0, c1) { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.beginPath(); g.moveTo(cx - w / 2, y); g.lineTo(cx + w / 2, y); g.lineTo(cx + w * .38, y + h); g.lineTo(cx - w * .38, y + h); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(cx - w / 2, y, w, h * .14); }
function paintXmasTree(g, W, H, night) { // a small decorated fir in a pot; the lights glow after dark
  seasonShadow(g, W, H); seasonPot(g, W / 2, H * .8, W * .42, H * .17, '#B5552E', '#7A3418');
  for (const [y0, y1, w] of [[.5, .82, .9], [.3, .62, .72], [.1, .42, .52]]) { const gr = g.createLinearGradient(0, H * y0, 0, H * y1); gr.addColorStop(0, '#3F8A5E'); gr.addColorStop(1, '#245C3C'); g.fillStyle = gr; g.beginPath(); g.moveTo(W / 2, H * y0); g.quadraticCurveTo(W * (.5 + w * .2), H * (y0 + y1) / 2, W * (.5 + w / 2), H * y1); g.quadraticCurveTo(W / 2, H * (y1 + .03), W * (.5 - w / 2), H * y1); g.quadraticCurveTo(W * (.5 - w * .2), H * (y0 + y1) / 2, W / 2, H * y0); g.fill(); }
  g.strokeStyle = 'rgba(242,194,48,.8)'; g.lineWidth = 3; for (const [y, w] of [[.4, .34], [.6, .5], [.76, .62]]) { g.beginPath(); g.moveTo(W * (.5 - w / 2), H * (y - .03)); g.quadraticCurveTo(W / 2, H * (y + .04), W * (.5 + w / 2), H * (y - .05)); g.stroke(); }
  const r = rnd(4); if (night) { g.save(); g.shadowColor = 'rgba(255,220,120,.9)'; g.shadowBlur = 10; }
  for (let k = 0; k < 16; k++) { const y = .18 + r() * .62, w = (y - .1) * .8; g.fillStyle = ['#F2C230', '#E8465E', '#7FB8E6', '#FBF6EE'][k % 4]; g.beginPath(); g.arc(W * (.5 + (r() - .5) * w), H * y, 4, 0, Math.PI * 2); g.fill(); }
  if (night) g.restore();
  g.fillStyle = '#F2C230'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 6 : 14; g.lineTo(W / 2 + Math.cos(a) * rr, H * .09 + Math.sin(a) * rr); } g.closePath(); g.fill();
}
function paintKadomatsu(g, W, H) { // a New Year kadomatsu: three cut bamboo stems with pine, bound in straw
  seasonShadow(g, W, H);
  for (const [x, top, c] of [[.38, .12, '#6FA352'], [.6, .2, '#5F9E5A'], [.5, .04, '#7DB55E']]) { const gr = g.createLinearGradient(W * (x - .08), 0, W * (x + .08), 0); gr.addColorStop(0, '#4E7E3A'); gr.addColorStop(.5, c); gr.addColorStop(1, '#3F6A30'); g.fillStyle = gr; g.beginPath(); g.moveTo(W * (x - .08), H * .7); g.lineTo(W * (x - .08), H * (top + .06)); g.lineTo(W * (x + .08), H * top); g.lineTo(W * (x + .08), H * .7); g.closePath(); g.fill(); g.fillStyle = '#E8D9A8'; g.beginPath(); g.ellipse(W * x, H * (top + .03), W * .08, H * .025, -.35, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#2F6B3F'; for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; g.beginPath(); g.ellipse(W * (.5 + Math.cos(a) * .3), H * (.66 + Math.sin(a) * .05), 12, 4, a, 0, Math.PI * 2); g.fill(); }
  const gr = g.createLinearGradient(0, H * .68, 0, H * .98); gr.addColorStop(0, '#D9BE7A'); gr.addColorStop(1, '#A98A48'); g.fillStyle = gr; g.beginPath(); g.moveTo(W * .2, H * .68); g.lineTo(W * .8, H * .68); g.lineTo(W * .76, H * .98); g.lineTo(W * .24, H * .98); g.closePath(); g.fill();
  g.strokeStyle = '#6E5430'; g.lineWidth = 3; for (const y of [.76, .88]) { g.beginPath(); g.moveTo(W * .21, H * y); g.lineTo(W * .79, H * y); g.stroke(); }
  g.fillStyle = '#C8463C'; g.beginPath(); g.arc(W * .3, H * .62, 6, 0, Math.PI * 2); g.arc(W * .68, H * .63, 5, 0, Math.PI * 2); g.fill();
}
function paintHeartBox(g, W, H) { // a heart-shaped gift box with a ribbon
  seasonShadow(g, W, H); const cx = W / 2, cy = H * .56;
  const gr = g.createLinearGradient(0, H * .2, 0, H * .95); gr.addColorStop(0, '#F06A7E'); gr.addColorStop(1, '#B8324A'); g.fillStyle = gr; g.beginPath(); g.moveTo(cx, H * .92); g.bezierCurveTo(W * .06, H * .6, W * .14, H * .16, cx, H * .34); g.bezierCurveTo(W * .86, H * .16, W * .94, H * .6, cx, H * .92); g.fill();
  g.fillStyle = '#F2C230'; g.fillRect(cx - 5, H * .3, 10, H * .6); g.beginPath(); g.ellipse(cx - 14, H * .3, 14, 8, -.5, 0, Math.PI * 2); g.ellipse(cx + 14, H * .3, 14, 8, .5, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(W * .32, cy - H * .12, W * .07, H * .05, -.6, 0, Math.PI * 2); g.fill();
}
function paintSakuraPot(g, W, H) { // a potted cherry branch in bloom
  seasonShadow(g, W, H); seasonPot(g, W / 2, H * .78, W * .4, H * .19, '#E9E2D2', '#BFB39A');
  g.strokeStyle = '#6B4631'; g.lineCap = 'round'; for (const [x1, y1, w] of [[.3, .2, 7], [.66, .12, 6], [.5, .32, 5]]) { g.lineWidth = w; g.beginPath(); g.moveTo(W / 2, H * .78); g.quadraticCurveTo(W * (x1 + .5) / 2, H * .5, W * x1, H * y1); g.stroke(); }
  const r = rnd(8); for (let k = 0; k < 70; k++) { const a = r() * Math.PI * 2, d = r(); const x = W * (.5 + Math.cos(a) * .36 * d), y = H * (.3 + Math.sin(a) * .2 * d); g.fillStyle = r() < .3 ? '#F2A8BC' : '#F9D3DE'; g.beginPath(); g.arc(x, y, 6 + r() * 4, 0, Math.PI * 2); g.fill(); }
}
function paintBambooWish(g, W, H) { // Tanabata bamboo with paper wishes (tanzaku)
  seasonShadow(g, W, H); g.fillStyle = '#7FA65A'; g.fillRect(W * .46, H * .05, W * .08, H * .9); g.fillStyle = '#5E8A40'; for (let y = .15; y < .95; y += .14) g.fillRect(W * .45, H * y, W * .1, 4);
  g.fillStyle = '#6F9E4E'; const r = rnd(6); for (let k = 0; k < 16; k++) { const y = H * (.08 + r() * .5), sd = r() < .5 ? -1 : 1; g.beginPath(); g.ellipse(W * .5 + sd * W * (.12 + r() * .2), y, W * .16, 6, sd * .4, 0, Math.PI * 2); g.fill(); }
  for (let k = 0; k < 7; k++) { const x = W * (.18 + r() * .64), y = H * (.18 + r() * .4); g.strokeStyle = 'rgba(80,60,40,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x, y); g.stroke(); g.fillStyle = ['#E8465E', '#F2C230', '#7FB8E6', '#A78BD6', '#FBF6EE'][k % 5]; g.fillRect(x - 6, y, 12, 34); }
}
function paintJackO(g, W, H, night) { // a carved pumpkin with a friendly face; it glows after dark
  g.fillStyle = 'rgba(40,25,10,.3)'; g.beginPath(); g.ellipse(W / 2, H - 6, W * .44, 7, 0, 0, Math.PI * 2); g.fill();
  const cy = H * .58, ry = H * .36;
  for (const [x, rx, c0, c1] of [[-.26, .24, '#C9561A', '#8E3A10'], [.26, .24, '#C9561A', '#8E3A10'], [-.12, .25, '#E97A24', '#A9461A'], [.12, .25, '#E97A24', '#A9461A'], [0, .2, '#F59339', '#C2581C']]) {
    const gr = g.createRadialGradient(W * (.5 + x) - 8, cy - ry * .4, 4, W * (.5 + x), cy, ry * 1.1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.beginPath(); g.ellipse(W * (.5 + x), cy, W * rx, ry, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#5E4426'; g.beginPath(); g.moveTo(W * .47, cy - ry + 6); g.quadraticCurveTo(W * .46, cy - ry - 16, W * .55, cy - ry - 22); g.lineTo(W * .56, cy - ry - 14); g.quadraticCurveTo(W * .52, cy - ry - 10, W * .53, cy - ry + 6); g.closePath(); g.fill();
  const face = night ? '#FFD45E' : '#4A2410';
  if (night) { g.save(); g.shadowColor = 'rgba(255,190,60,.9)'; g.shadowBlur = 18; }
  g.fillStyle = face;
  const eye = sx => { g.beginPath(); g.moveTo(W * (.5 + sx * .16), cy - ry * .42); g.quadraticCurveTo(W * (.5 + sx * .26), cy - ry * .1, W * (.5 + sx * .07), cy - ry * .08); g.quadraticCurveTo(W * (.5 + sx * .1), cy - ry * .3, W * (.5 + sx * .16), cy - ry * .42); g.fill(); };
  eye(-1); eye(1);
  g.beginPath(); g.moveTo(W * .3, cy + ry * .1); g.quadraticCurveTo(W * .5, cy + ry * .62, W * .7, cy + ry * .1); g.quadraticCurveTo(W * .62, cy + ry * .28, W * .56, cy + ry * .22); g.lineTo(W * .53, cy + ry * .32); g.lineTo(W * .47, cy + ry * .22); g.quadraticCurveTo(W * .4, cy + ry * .3, W * .3, cy + ry * .1); g.fill();
  if (night) g.restore();
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(W * .34, cy - ry * .55, W * .06, ry * .16, -.5, 0, Math.PI * 2); g.fill();
}
function paintAndon(g, W, H, night) {
  SH(g, W, H, .2); g.fillStyle = '#5E3820'; g.fillRect(W * .2, H * .9, W * .6, H * .08); for (const x of [.22, .74]) g.fillRect(W * x, H * .1, W * .04, H * .82);
  g.fillStyle = night ? vgrad(g, H * .12, H * .88, [[0, '#FFF6DA'], [1, '#FFD58A']]) : vgrad(g, H * .12, H * .88, [[0, '#FFF8EA'], [1, '#EADFC8']]); g.fillRect(W * .26, H * .12, W * .48, H * .76);
  g.strokeStyle = 'rgba(90,60,30,.5)'; g.lineWidth = 1.5; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(W * .26, H * (.12 + k * .19)); g.lineTo(W * .74, H * (.12 + k * .19)); g.stroke(); } g.fillStyle = '#5E3820'; g.fillRect(W * .18, H * .06, W * .64, H * .06);
}
function paintFloorLamp(g, W, H, night) {
  SH(g, W, H, .2); g.fillStyle = '#3B2A20'; g.beginPath(); g.ellipse(W / 2, H * .97, W * .3, H * .025, 0, 0, Math.PI * 2); g.fill(); g.fillRect(W * .47, H * .2, W * .06, H * .77);
  g.fillStyle = night ? vgrad(g, 0, H * .22, [[0, '#FFF3D0'], [1, '#FFD58A']]) : vgrad(g, 0, H * .22, [[0, '#FBF6EE'], [1, '#E3D5BC']]); g.beginPath(); g.moveTo(W * .22, H * .22); g.lineTo(W * .32, H * .02); g.lineTo(W * .68, H * .02); g.lineTo(W * .78, H * .22); g.closePath(); g.fill();
}
// ---- futons: soft, puffy layers drawn with curves (no boxes) ----
// one cushioned layer seen from the front: bulging sides, rounded ends, light on top, a soft crease below
function puffLayer(g, x, y, w, h, c0, c1, opt) {
  opt = opt || {}; const r = Math.min(h * .5, w * .12), bul = h * (opt.bulge || .16), sag = h * (opt.sag || .06);
  g.save();
  g.beginPath(); g.moveTo(x + r, y + sag);
  g.bezierCurveTo(x + w * .3, y - sag * .6, x + w * .7, y - sag * .6, x + w - r, y + sag);
  g.bezierCurveTo(x + w + bul * .4, y + sag, x + w + bul, y + h * .45, x + w - r * .25, y + h);
  g.bezierCurveTo(x + w * .66, y + h + sag * 1.2, x + w * .34, y + h + sag * 1.2, x + r * .25, y + h);
  g.bezierCurveTo(x - bul, y + h * .45, x - bul * .4, y + sag, x + r, y + sag); g.closePath();
  const gr = g.createLinearGradient(0, y - sag, 0, y + h + sag); gr.addColorStop(0, shadeHex(c0, 1.06)); gr.addColorStop(.35, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.fill();
  g.clip();
  if (opt.dots) { const rr = rnd(opt.seed || 3); g.fillStyle = opt.dots; for (let k = 0; k < w * h / 260; k++) { const px = x + rr() * w, py = y + rr() * h; g.beginPath(); for (let i = 0; i < 5; i++) { const a = i * Math.PI * .4; g.moveTo(px, py); g.arc(px + Math.cos(a) * 2.6, py + Math.sin(a) * 2.6, 1.9, 0, Math.PI * 2); } g.fill(); } }
  if (opt.tufts) { g.fillStyle = 'rgba(120,100,70,.18)'; for (let i = 1; i < 6; i++) { g.beginPath(); g.ellipse(x + w * i / 6, y + h * .5, 2.4, 1.6, 0, 0, Math.PI * 2); g.fill(); } }
  const hl = g.createLinearGradient(0, y, 0, y + h * .5); hl.addColorStop(0, 'rgba(255,255,255,.5)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hl; g.fillRect(x - bul, y - sag, w + bul * 2, h * .5);
  const sd = g.createLinearGradient(0, y + h * .62, 0, y + h + sag); sd.addColorStop(0, 'rgba(40,30,20,0)'); sd.addColorStop(1, 'rgba(40,30,20,.22)'); g.fillStyle = sd; g.fillRect(x - bul, y + h * .6, w + bul * 2, h * .5);
  // the side shading that makes it round
  const sx = g.createLinearGradient(x - bul, 0, x + w + bul, 0); sx.addColorStop(0, 'rgba(40,30,20,.16)'); sx.addColorStop(.12, 'rgba(40,30,20,0)'); sx.addColorStop(.88, 'rgba(40,30,20,0)'); sx.addColorStop(1, 'rgba(40,30,20,.2)'); g.fillStyle = sx; g.fillRect(x - bul, y - sag, w + bul * 2, h + sag * 2);
  g.restore();
}
function paintFutonStack(g, W, H) { // a futon folded away neatly: the mattress in three, the quilt in two, the pillow on top
  g.fillStyle = 'rgba(40,30,20,.28)'; g.beginPath(); g.ellipse(W / 2, H - 8, W * .47, 9, 0, 0, Math.PI * 2); g.fill();
  const cream = ['#F4EFE4', '#D9CFBE'], blue = ['#7E9DC4', '#4F6E98'];
  let y = H - 12; const L = (h, w, c, opt) => { y -= h * .86; puffLayer(g, (W - w) / 2, y, w, h, c[0], c[1], opt); };
  L(36, W * .9, cream, { tufts: 1 }); L(36, W * .9, cream, { tufts: 1, sag: .04 }); L(36, W * .88, cream, { tufts: 1, sag: .05 });
  L(46, W * .86, blue, { dots: 'rgba(255,255,255,.22)', seed: 4, bulge: .22 }); L(46, W * .84, blue, { dots: 'rgba(255,255,255,.22)', seed: 7, bulge: .22, sag: .08 });
  L(34, W * .42, ['#EDE4D2', '#C9B89A'], { bulge: .3, sag: .14 }); // the pillow
  g.strokeStyle = 'rgba(150,120,80,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W * .36, y + 17); g.quadraticCurveTo(W / 2, y + 12, W * .64, y + 17); g.stroke(); // the pillowcase seam
}
function paintBonbori(g, W, H, night) {
  SH(g, W, H, .2); g.fillStyle = '#3B2A20'; g.fillRect(W * .46, H * .4, W * .08, H * .58);
  g.fillStyle = night ? vgrad(g, H * .06, H * .4, [[0, '#FFF1DA'], [1, '#FFC98A']]) : vgrad(g, H * .06, H * .4, [[0, '#FFFFFF'], [1, '#F2E2D6']]); rrect(g, W * .28, H * .06, W * .44, H * .34, 10); g.fill();
  g.fillStyle = '#2B1E18'; g.fillRect(W * .24, H * .03, W * .52, H * .04); g.fillRect(W * .26, H * .39, W * .48, H * .03); g.fillStyle = '#E86A75'; g.beginPath(); g.arc(W / 2, H * .22, W * .07, 0, Math.PI * 2); g.fill();
}
function paintStall(g, W, H, col) {
  SH(g, W, H); g.fillStyle = '#3B3B40'; g.fillRect(W * .04, H * .1, W * .03, H * .88); g.fillRect(W * .93, H * .1, W * .03, H * .88);
  g.fillStyle = vgrad(g, 0, H * .2, [[0, shadeHex(col, 1.15)], [1, shadeHex(col, .8)]]); g.beginPath(); g.moveTo(0, H * .2); g.lineTo(W * .06, H * .04); g.lineTo(W * .94, H * .04); g.lineTo(W, H * .2); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; for (let x = 0; x < W; x += W * .16) g.fillRect(x, H * .12, W * .08, H * .08);
  g.fillStyle = vgrad(g, H * .6, H, [[0, '#A06A3E'], [1, '#6E4426']]); g.fillRect(W * .06, H * .62, W * .88, H * .36);
  const r = rnd(5); for (let k = 0; k < 14; k++) { g.fillStyle = ['#E86A75', '#F2C230', '#5F9E5A', '#F08A2E', '#FBF6EE', '#C8463C'][(r() * 6) | 0]; g.beginPath(); g.arc(W * (.12 + r() * .76), H * (.52 + r() * .1), W * .045, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#FBF6EE'; rrect(g, W * .36, H * .66, W * .28, H * .12, 3); g.fill(); g.fillStyle = '#C8463C'; g.font = `900 ${Math.round(H * .07)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('100円', W / 2, H * .72);
}
function paintBookcart(g, W, H) {
  SH(g, W, H); g.fillStyle = vgrad(g, H * .3, H, [[0, '#8A6444'], [1, '#5A3D27']]); g.fillRect(W * .04, H * .4, W * .92, H * .5); g.fillStyle = '#2B2B2B'; for (const x of [.14, .86]) { g.beginPath(); g.arc(W * x, H * .93, H * .06, 0, Math.PI * 2); g.fill(); }
  const r = rnd(12); let x = W * .07; while (x < W * .92) { const w = W * (.03 + r() * .04); g.fillStyle = ['#C8463C', '#355F86', '#E9E2D5', '#8A5530', '#5F9E5A', '#C9962F'][(r() * 6) | 0]; g.fillRect(x, H * (.12 + r() * .06), w - 1, H * .3); x += w; }
  g.fillStyle = '#FBF6EE'; rrect(g, W * .3, H * .5, W * .4, H * .16, 3); g.fill(); g.fillStyle = '#3B2A20'; g.font = `900 ${Math.round(H * .1)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('均一', W / 2, H * .58);
}
function paintFishbox(g, W, H) {
  SH(g, W, H); g.fillStyle = vgrad(g, H * .4, H, [[0, '#A06A3E'], [1, '#6E4426']]); g.fillRect(W * .04, H * .45, W * .92, H * .53);
  for (const x of [.06, .52]) { g.fillStyle = '#F7F9FA'; rrect(g, W * x, H * .2, W * .42, H * .28, 4); g.fill(); g.fillStyle = '#C8D9E6'; g.fillRect(W * (x + .02), H * .22, W * .38, H * .08);
    for (let k = 0; k < 3; k++) { g.fillStyle = x < .3 ? '#9FB4C6' : '#E9A07A'; g.beginPath(); g.ellipse(W * (x + .1 + k * .11), H * .3, W * .05, H * .03, .3, 0, Math.PI * 2); g.fill(); } }
}
function paintCooler(g, W, H) { SH(g, W, H); g.fillStyle = vgrad(g, H * .3, H, [[0, '#F7F9FA'], [1, '#C9D2DA']]); rrect(g, W * .14, H * .32, W * .72, H * .66, 6); g.fill();
  g.fillStyle = 'rgba(150,200,240,.8)'; rrect(g, W * .2, H * .0, W * .6, H * .34, [18, 18, 4, 4]); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(W * .28, H * .04, W * .08, H * .26); g.fillStyle = '#4E77A0'; g.fillRect(W * .4, H * .5, W * .2, H * .06); }
function paintDesk(g, W, H) {
  SH(g, W, H, .22); g.fillStyle = '#9AA9B6'; g.fillRect(W * .06, H * .5, W * .05, H * .48); g.fillRect(W * .89, H * .5, W * .05, H * .48);
  g.fillStyle = vgrad(g, H * .44, H * .52, [[0, '#F3EFE8'], [1, '#C9C3B8']]); g.fillRect(W * .02, H * .44, W * .96, H * .08); g.fillStyle = '#B9C0C7'; g.fillRect(W * .56, H * .52, W * .32, H * .4);
  g.fillStyle = '#1C1919'; rrect(g, W * .22, H * .02, W * .5, H * .34, 4); g.fill(); g.fillStyle = vgrad(g, H * .04, H * .33, [[0, '#9ED8F5'], [1, '#4E8FC8']]); g.fillRect(W * .245, H * .04, W * .45, H * .29); g.fillStyle = '#46525E'; g.fillRect(W * .44, H * .36, W * .06, H * .08);
  g.fillStyle = '#FFFFFF'; g.fillRect(W * .74, H * .34, W * .14, H * .1); g.fillStyle = '#E9E4DA'; g.fillRect(W * .3, H * .41, W * .3, H * .03); g.fillStyle = '#FBF6EE'; g.beginPath(); g.ellipse(W * .14, H * .4, W * .04, H * .04, 0, 0, Math.PI * 2); g.fill();
}
const PROP_ART = {
  desk: () => artCanvas('pdesk', 260, 200, paintDesk),
  vending: (n, v) => artCanvas('pv|' + v + n, 160, 300, (g, w, h) => paintVending(g, w, h, n, v || '#E9ECEF')), post: () => artCanvas('ppost', 120, 220, paintPost), bikes: () => artCanvas('pbikes', 320, 160, paintBikes),
  xmasTree: n => artCanvas('pxmas' + n, 180, 320, (g, w, h) => paintXmasTree(g, w, h, n)), kadomatsu: () => artCanvas('pkado', 180, 300, paintKadomatsu), heartBox: () => artCanvas('pheart', 160, 130, paintHeartBox), sakuraPot: () => artCanvas('psakura', 200, 320, paintSakuraPot), bambooWish: () => artCanvas('pbamboo', 170, 380, paintBambooWish), jackO: n => artCanvas('pjack' + n, 170, 160, (g, w, h) => paintJackO(g, w, h, n)), plant: () => artCanvas('plant', 240, 420, paintPlant), andon: n => artCanvas('pandon' + n, 120, 220, (g, w, h) => paintAndon(g, w, h, n)), lampS: n => artCanvas('plamp' + n, 120, 400, (g, w, h) => paintFloorLamp(g, w, h, n)),
  umbrellaS: () => artCanvas('umbrellas', 180, 380, paintUmbrellas), boxesS: () => artCanvas('box', 200, 170, paintCardboard), papersS: () => artCanvas('paperTall', 220, 380, (g, w, h) => paintPapers(g, w, h, 1)),
  zabutonS: () => artCanvas('zabuton', 260, 100, paintCushions), futon: () => artCanvas('pfuton', 300, 220, paintFutonStack), bonbori: n => artCanvas('pbon' + n, 120, 300, (g, w, h) => paintBonbori(g, w, h, n)),
  flowers: () => artCanvas('flowers', 240, 160, paintFlowers), planter: () => artCanvas('flowers', 240, 160, paintFlowers), gacha: () => artCanvas('gacha', 260, 340, paintGacha), stoneLantern: () => artCanvas('lantern', 200, 380, paintStoneLantern),
  rickshawP: () => artCanvas('rickshaw', 260, 360, paintRickshaw), benchS: () => artCanvas('bench', 260, 110, paintBench), crates: () => artCanvas('crate3', 200, 320, (g, w, h) => paintCrates(g, w, h, 3)), stools: () => artCanvas('stools', 240, 130, paintStools),
  stall: (n, v) => artCanvas('pstall|' + v, 320, 300, (g, w, h) => paintStall(g, w, h, v || '#C8463C')), bookcart: () => artCanvas('pbook', 300, 200, paintBookcart), fishbox: () => artCanvas('pfish', 280, 160, paintFishbox),
  cafe: (n, v) => artCanvas('cafe|' + (v || '#355F86'), 320, 440, (g, w, h) => paintCafe(g, w, h, v || '#355F86')), scopeS: () => artCanvas('scope', 180, 320, paintBinoculars), water: () => artCanvas('pcool', 120, 260, paintCooler),
  copierS: () => artCanvas('copier', 280, 280, paintCopier), mchairs: () => artCanvas('chair', 200, 170, paintChair),
};

/* ---- painted fronts for furniture that stands against a wall (the side you see from the corridor) ---- */

function paintFace(kind, W, H) {
  return artCanvas('face|' + kind, W, H, (g) => {
    const knob = (x, y, r) => { g.fillStyle = '#C9962F'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(x - r * .3, y - r * .3, r * .35, 0, Math.PI * 2); g.fill(); };
    const panel = (x, y, w, h, c) => { g.fillStyle = vgrad(g, y, y + h, [[0, shadeHex(c, 1.12)], [1, shadeHex(c, .86)]]); g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, w - 2, h - 2); g.strokeStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(x + 2, y + 2); g.lineTo(x + w - 2, y + 2); g.stroke(); };
    if (kind === 'tansu') { panel(0, 0, W, H, '#8A5A36'); for (let r = 0; r < 4; r++) { const y = H * (.04 + r * .24); panel(W * .04, y, W * .92, H * .21, '#9C6A40'); for (const x of [.3, .7]) { g.strokeStyle = '#C9962F'; g.lineWidth = 3; g.beginPath(); g.arc(W * x, y + H * .1, H * .045, 0, Math.PI); g.stroke(); knob(W * x, y + H * .08, 3); } } }
    else if (kind === 'shelf') { panel(0, 0, W, H, '#7A5232'); const r = rnd(4); for (let k = 0; k < 4; k++) { const y0 = H * (.04 + k * .24), y1 = y0 + H * .2; g.fillStyle = '#4A2F20'; g.fillRect(W * .04, y0, W * .92, y1 - y0); let x = W * .06; while (x < W * .94) { const w = W * (.025 + r() * .035), h = (y1 - y0) * (.7 + r() * .28); g.fillStyle = ['#C8463C', '#355F86', '#F2C230', '#5F9E5A', '#E9E2D5', '#8A5530', '#46525E'][(r() * 7) | 0]; g.fillRect(x, y1 - h, w - 1, h); x += w; } g.fillStyle = '#9C6A40'; g.fillRect(0, y1, W, H * .04); } }
    else if (kind === 'sofa') { g.fillStyle = vgrad(g, 0, H, [[0, '#5A86B8'], [1, '#2F4E78']]); rrect(g, 0, H * .05, W, H * .95, 14); g.fill(); for (let k = 0; k < 3; k++) { g.fillStyle = vgrad(g, H * .1, H * .55, [[0, '#6E9AC9'], [1, '#41669A']]); rrect(g, W * (.08 + k * .29), H * .1, W * .27, H * .45, 12); g.fill(); g.fillStyle = vgrad(g, H * .55, H * .8, [[0, '#6E9AC9'], [1, '#3B5E8E']]); rrect(g, W * (.07 + k * .29), H * .56, W * .29, H * .22, 10); g.fill(); }
      g.fillStyle = '#3B2A20'; g.fillRect(W * .05, H * .92, W * .04, H * .08); g.fillRect(W * .91, H * .92, W * .04, H * .08); }
    else if (kind === 'sofaO') { g.fillStyle = vgrad(g, 0, H, [[0, '#5E6A78'], [1, '#353E4A']]); rrect(g, 0, 0, W, H, 10); g.fill(); for (let k = 0; k < 2; k++) { g.fillStyle = vgrad(g, H * .2, H * .7, [[0, '#6E7B88'], [1, '#46525E']]); rrect(g, W * (.06 + k * .46), H * .2, W * .42, H * .5, 10); g.fill(); } }
    else if (kind === 'tv') { panel(0, H * .55, W, H * .45, '#6B4631'); for (const x of [.05, .52]) { panel(W * x, H * .62, W * .43, H * .32, '#7A5538'); knob(W * (x + .38), H * .78, 3); }
      g.fillStyle = '#1C1919'; rrect(g, W * .12, 0, W * .76, H * .52, 6); g.fill(); g.fillStyle = vgrad(g, H * .03, H * .48, [[0, '#4E8FD0'], [1, '#2A5A8E']]); g.fillRect(W * .15, H * .03, W * .7, H * .45); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.moveTo(W * .5, H * .03); g.lineTo(W * .62, H * .03); g.lineTo(W * .4, H * .48); g.lineTo(W * .28, H * .48); g.closePath(); g.fill(); }
    else if (kind === 'counter') { g.fillStyle = '#9AA9B6'; g.fillRect(0, 0, W, H * .08); for (let k = 0; k < 3; k++) { panel(W * (.02 + k * .33), H * .12, W * .3, H * .84, '#F3EEE6'); g.fillStyle = '#9AA9B6'; rrect(g, W * (.13 + k * .33), H * .2, W * .08, H * .03, 2); g.fill(); } g.fillStyle = '#7D8B97'; g.fillRect(0, H * .96, W, H * .04); }
    else if (kind === 'fridge') { panel(0, 0, W, H, '#F7F9FA'); panel(W * .04, H * .02, W * .92, H * .34, '#F2F5F7'); panel(W * .04, H * .38, W * .92, H * .6, '#F2F5F7'); g.fillStyle = '#9AA9B6'; rrect(g, W * .82, H * .1, W * .05, H * .2, 2); g.fill(); rrect(g, W * .82, H * .44, W * .05, H * .3, 2); g.fill();
      g.fillStyle = '#E86A75'; g.beginPath(); g.arc(W * .3, H * .5, W * .06, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FBF6EE'; g.fillRect(W * .2, H * .58, W * .2, H * .12); }
    else if (kind === 'rack') { panel(0, 0, W, H, '#B9C3CC'); for (let k = 0; k < 3; k++) { const y = H * (.08 + k * .3); g.fillStyle = '#7D8B97'; g.fillRect(W * .04, y + H * .22, W * .92, H * .03); for (let j = 0; j < 4; j++) { g.fillStyle = ['#FBF6EE', '#E9A07A', '#9ED0F0', '#F2C230'][(j + k) % 4]; g.beginPath(); g.ellipse(W * (.16 + j * .22), y + H * .14, W * .08, H * .08, 0, 0, Math.PI * 2); g.fill(); } } }
    else if (kind === 'getabako') { panel(0, 0, W, H, '#9C7652'); for (let k = 0; k < 4; k++) { panel(W * (.02 + k * .245), H * .06, W * .23, H * .88, '#A98260'); for (let j = 1; j < 6; j++) { g.fillStyle = 'rgba(60,30,10,.25)'; g.fillRect(W * (.04 + k * .245), H * (.06 + j * .14), W * .19, 2); } knob(W * (.2 + k * .245), H * .5, 3); } }
    else if (kind === 'cabinet') { panel(0, 0, W, H, '#C9CDD2'); for (let k = 0; k < 4; k++) { panel(W * .05, H * (.03 + k * .24), W * .9, H * .21, '#D9DDE2'); g.fillStyle = '#7D8B97'; rrect(g, W * .38, H * (.07 + k * .24), W * .24, H * .04, 2); g.fill(); g.fillStyle = '#FBF6EE'; g.fillRect(W * .44, H * (.13 + k * .24), W * .12, H * .04); } }
    else if (kind === 'kiosk') { panel(0, 0, W, H, '#4E77A0'); g.fillStyle = '#FBF6EE'; g.fillRect(W * .04, H * .36, W * .92, H * .34); const r = rnd(6); for (let k = 0; k < 10; k++) { g.fillStyle = ['#C8463C', '#F2C230', '#5F9E5A', '#E86A75', '#355F86'][(r() * 5) | 0]; g.fillRect(W * (.06 + k * .09), H * (.4 + (k % 2) * .14), W * .07, H * .12); }
      g.fillStyle = '#F2C230'; g.fillRect(0, H * .08, W, H * .14); g.fillStyle = '#2B2B2B'; g.font = `900 ${Math.round(H * .1)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NEWS・売店', W / 2, H * .15); }
    else if (kind === 'seat') { g.fillStyle = vgrad(g, 0, H, [[0, '#3A7FA0'], [1, '#215A78']]); g.fillRect(0, 0, W, H); for (let k = 0; k < 7; k++) { g.fillStyle = 'rgba(255,255,255,.08)'; rrect(g, W * (.01 + k * .14), H * .06, W * .13, H * .88, 8); g.fill(); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(W * (.01 + k * .14) + W * .13, H * .1, 2, H * .8); } }
    else if (kind === 'hedge') { g.fillStyle = '#3F7A3F'; g.fillRect(0, 0, W, H); const r = rnd(9); for (let k = 0; k < 220; k++) { g.fillStyle = r() < .5 ? 'rgba(130,190,100,.6)' : 'rgba(30,70,30,.5)'; g.beginPath(); g.ellipse(r() * W, r() * H * .75, 4 + r() * 6, 3 + r() * 4, r() * 3, 0, Math.PI * 2); g.fill(); } g.fillStyle = vgrad(g, H * .72, H, [[0, '#8A8470'], [1, '#6E6858']]); g.fillRect(0, H * .72, W, H * .28); }
  });
}

// world size of each illustration: width follows the obstacle, height its top, the sprite anchored at the front face
function drawArt(o, sg, d) {
  const make = ART[o.art]; if (!make) return false;
  const lift = o.dead ? o.dead * o.dead * 9 : 0, side = o.dead ? o.dead * 7 * (o.vx || 1) : 0;
  const s = o.s0 + (o.ds || 0) + (o.dead ? o.dead * 6 : 0), lat = (o.l0 + o.l1) / 2 + side;
  const p = segPos(sg, s, lat), sp = spriteAt(p[0], lift + p[2], p[1]); if (!sp) return true; // off screen: not even painted yet
  const img = make(o, LT.night > .35); if (!img) return false;
  const ww = (o.artW || (o.l1 - o.l0)) * sp.k, hh = (o.artH || o.top || 1) * sp.k;
  ctx.globalAlpha = (o.dead ? clamp(1 - o.dead * 1.2, 0, 1) : passFade(d)) * (1 - fogK(d) * .9);
  ctx.drawImage(litSprite(img, LT.amb), sp.sx - ww / 2, sp.sy - hh, ww, hh);
  if (LT.night > .3 && (o.art === 'car' || o.art === 'supercar' || o.art === 'kick' || o.art === 'bike') && !o.dead) { // headlights at night, and their light on the road
    ctx.globalCompositeOperation = 'lighter';
    const hy = sp.sy - hh * (o.art === 'car' ? .4 : o.art === 'supercar' ? .38 : .5), lights = o.art === 'car' || o.art === 'supercar' ? [-.33, .33] : [0];
    for (const x of lights) { const lx = sp.sx + x * ww, R = Math.max(6, ww * .22), gr = ctx.createRadialGradient(lx, hy, 0, lx, hy, R); gr.addColorStop(0, 'rgba(255,250,225,.95)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = gr; ctx.fillRect(lx - R, hy - R, R * 2, R * 2); }
    const pool = ctx.createRadialGradient(sp.sx, sp.sy + hh * .1, 0, sp.sx, sp.sy + hh * .1, ww * 1.3); pool.addColorStop(0, `rgba(255,240,200,${(.28 * LT.night).toFixed(3)})`); pool.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = pool; ctx.beginPath(); ctx.ellipse(sp.sx, sp.sy + hh * .1, ww * 1.3, ww * .35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = 1; return true;
}

/* ================= street furniture as illustrations: lamp posts, utility poles, signals, rooftop clutter, people ================= */
function paintLampC(g, W, H, night, v) { // a modern street light: tapered post, an arm reaching over the road, a flat head
  const dir = v === 'L' ? -1 : 1, x0 = W / 2 + dir * -W * .22; // the post stands at the pavement side, the arm reaches toward the road
  const post = g.createLinearGradient(x0 - 8, 0, x0 + 8, 0); post.addColorStop(0, '#3A414A'); post.addColorStop(.45, '#6B737C'); post.addColorStop(1, '#2A3036');
  g.fillStyle = post; g.beginPath(); g.moveTo(x0 - 7, H); g.lineTo(x0 + 7, H); g.lineTo(x0 + 4, H * .12); g.lineTo(x0 - 4, H * .12); g.closePath(); g.fill();
  g.fillStyle = '#2F3B47'; g.fillRect(x0 - 11, H - 18, 22, 18); g.fillStyle = '#4B5560'; g.fillRect(x0 - 9, H - 60, 18, 40); // base and the inspection door
  g.strokeStyle = post; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, H * .13); g.quadraticCurveTo(x0 + dir * W * .22, H * .06, x0 + dir * W * .46, H * .08); g.stroke();
  const hx = x0 + dir * W * .46, hy = H * .08; // the head
  g.fillStyle = night ? '#FFF6DC' : '#E7ECEF'; g.beginPath(); g.ellipse(hx, hy + 6, W * .16, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#4B5560'; g.beginPath(); g.ellipse(hx, hy, W * .17, 8, 0, Math.PI, Math.PI * 2); g.fill();
  if (night) { g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(hx, hy + 8, 2, hx, hy + 8, W * .5); gl.addColorStop(0, 'rgba(255,230,170,.9)'); gl.addColorStop(.3, 'rgba(255,210,140,.35)'); gl.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H * .5); g.globalCompositeOperation = 'source-over'; }
}
function paintPole(g, W, H) { // a concrete utility pole with crossarms, insulators and a transformer drum
  const x = W / 2; const c = g.createLinearGradient(x - 9, 0, x + 9, 0); c.addColorStop(0, '#8B8F93'); c.addColorStop(.4, '#C9CCCF'); c.addColorStop(1, '#6F7478');
  g.fillStyle = c; g.beginPath(); g.moveTo(x - 10, H); g.lineTo(x + 10, H); g.lineTo(x + 6, 0); g.lineTo(x - 6, 0); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = H * .1; y < H; y += H * .18) g.fillRect(x - 9, y, 18, 2); // the rings of a cast pole
  g.fillStyle = '#5B6066'; g.fillRect(x - 46, H * .07, 92, 5); g.fillRect(x - 40, H * .14, 80, 4); // crossarms
  g.fillStyle = '#E8E6DF'; for (const ax of [-40, -22, 22, 40]) { g.beginPath(); g.ellipse(x + ax, H * .06, 4, 6, 0, 0, Math.PI * 2); g.fill(); } // insulators
  g.fillStyle = '#4A5056'; rrect(g, x + 10, H * .17, 22, 44, 4); g.fill(); g.fillStyle = '#3A3F44'; rrect(g, x + 8, H * .16, 26, 6, 2); g.fill(); // transformer
  g.strokeStyle = '#2B2B2B'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 21, H * .17); g.lineTo(x + 21, H * .1); g.stroke();
  g.fillStyle = '#F2C230'; g.fillRect(x - 7, H * .55, 14, 26); g.fillStyle = '#2B2B2B'; g.fillRect(x - 5, H * .58, 10, 3); g.fillRect(x - 5, H * .64, 10, 3); // a yellow notice plate
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x - 8, H - 30, 16, 30);
}
function paintSignal(g, W, H, night, v) { // a Japanese horizontal traffic signal on a bent pole, with a pedestrian light
  const dir = v === 'L' ? -1 : 1, x0 = W / 2 - dir * W * .3;
  const post = g.createLinearGradient(x0 - 7, 0, x0 + 7, 0); post.addColorStop(0, '#6E7278'); post.addColorStop(.5, '#B9BDC2'); post.addColorStop(1, '#5A5E63');
  g.fillStyle = post; g.fillRect(x0 - 6, H * .1, 12, H * .9); g.strokeStyle = post; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, H * .11); g.lineTo(x0 + dir * W * .52, H * .11); g.stroke();
  const hx = x0 + dir * W * .36, hy = H * .14, lw = W * .42, lh = 30; // the three-lamp head
  g.fillStyle = '#2E3338'; rrect(g, hx - lw / 2, hy, lw, lh, 5); g.fill(); g.fillStyle = '#1C1F22'; g.fillRect(hx - lw / 2 + 2, hy - 6, lw - 4, 6); // the visor
  const lamps = [['#3C8F6E', '#52D493'], ['#A88A2A', '#FFD64A'], ['#8C3A33', '#FF5A4A']]; const lit = night ? (Math.round(G.t) % 7 < 4 ? 0 : 2) : -1;
  lamps.forEach(([off, on], i) => { const lx = hx - lw / 2 + lw * (.17 + i * .33); g.fillStyle = i === lit || (!night && i === 0) ? on : off; g.beginPath(); g.arc(lx, hy + lh / 2, 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(lx - 3, hy + lh / 2 - 3, 3.5, 0, Math.PI * 2); g.fill(); });
  // the pedestrian signal on the post
  g.fillStyle = '#2E3338'; rrect(g, x0 - 14, H * .36, 28, 52, 4); g.fill(); g.fillStyle = '#C0392B'; rrect(g, x0 - 10, H * .37, 20, 22, 3); g.fill(); g.fillStyle = '#2E8B57'; rrect(g, x0 - 10, H * .36 + 27, 20, 22, 3); g.fill();
  g.fillStyle = '#1C1F22'; g.beginPath(); g.arc(x0, H * .37 + 11, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F7F4EE'; g.beginPath(); g.arc(x0, H * .36 + 38, 4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#F2C230'; g.fillRect(x0 - 6, H * .78, 12, 30); g.fillStyle = '#2B2B2B'; g.fillRect(x0 - 4, H * .82, 8, 2); // a yellow sleeve
}
function paintRoofKit(g, W, H, v) { // what stands on a Tokyo roof: tanks, AC units, antennas, a railing, a billboard frame
  const r = rnd(v * 17 + 3);
  g.strokeStyle = '#6F7478'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, H - 20); g.lineTo(W, H - 20); for (let x = 8; x < W; x += 22) { g.moveTo(x, H - 20); g.lineTo(x, H - 40); } g.moveTo(0, H - 40); g.lineTo(W, H - 40); g.stroke(); // parapet railing
  g.fillStyle = '#9AA0A6'; g.fillRect(0, H - 22, W, 22); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(0, H - 8, W, 8);
  if (v % 3 === 0) { // a water tank on legs
    const x = W * (.2 + r() * .3); g.fillStyle = '#5B6066'; g.fillRect(x - 24, H - 120, 4, 100); g.fillRect(x + 20, H - 120, 4, 100); g.fillRect(x - 2, H - 120, 4, 100);
    g.fillStyle = g.createLinearGradient(x - 30, 0, x + 30, 0); g.fillStyle.addColorStop(0, '#9FA6AD'); g.fillStyle.addColorStop(.5, '#E1E5E8'); g.fillStyle.addColorStop(1, '#8D959C'); rrect(g, x - 32, H - 190, 64, 76, 8); g.fill();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x - 32, H - 150, 64, 3); g.fillRect(x - 32, H - 128, 64, 3);
  }
  if (v % 3 === 1) { // two rooftop AC units
    for (const x of [W * .25, W * .55]) { g.fillStyle = '#B8BDC2'; rrect(g, x - 28, H - 86, 56, 46, 4); g.fill(); g.fillStyle = '#6F7478'; g.beginPath(); g.arc(x, H - 63, 15, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#A0A6AB'; g.lineWidth = 2; for (let a = 0; a < 6; a++) { g.beginPath(); g.moveTo(x, H - 63); g.lineTo(x + Math.cos(a) * 13, H - 63 + Math.sin(a) * 13); g.stroke(); } g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(x - 28, H - 46, 56, 6); }
  }
  if (v % 3 === 2) { // a billboard frame and a stairwell hut
    const x = W * .62; g.fillStyle = '#C9CDD2'; g.fillRect(x - 40, H - 150, 80, 50); g.strokeStyle = '#7A7F85'; g.lineWidth = 3; g.strokeRect(x - 40, H - 150, 80, 50); g.fillStyle = '#5B6066'; g.fillRect(x - 30, H - 100, 4, 60); g.fillRect(x + 26, H - 100, 4, 60);
    g.fillStyle = ['#C8463C', '#355F86', '#F2C230'][v % 3 ? v % 2 : 2]; g.fillRect(x - 34, H - 144, 68, 38); g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(x - 24, H - 130, 48, 6); g.fillRect(x - 24, H - 118, 30, 5);
    g.fillStyle = '#D7D2C8'; g.fillRect(W * .12, H - 92, 60, 72); g.fillStyle = '#B9B2A5'; g.fillRect(W * .12 - 4, H - 96, 68, 6); g.fillStyle = '#4A5056'; g.fillRect(W * .12 + 20, H - 70, 18, 50);
  }
  // an antenna somewhere
  const ax = W * (.1 + r() * .8); g.strokeStyle = '#4A5056'; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, H - 40); g.lineTo(ax, H - 140); for (const y of [H - 130, H - 115, H - 100]) { g.moveTo(ax - 14, y); g.lineTo(ax + 14, y); } g.stroke();
}
const PEOPLE = [['#355F86', '#2B2B2B', '#2B2B2B'], ['#C8463C', '#3B3B40', '#5A3A26'], ['#F7F4EE', '#46525E', '#2B2B2B'], ['#5F9E5A', '#2F3B47', '#8C5A3C'], ['#E86A75', '#F2E6D8', '#3B2A20'], ['#2B2B2B', '#2B2B2B', '#2B2B2B'], ['#F2C230', '#355F86', '#2B2B2B'], ['#9AA9B6', '#2B2B2B', '#5A3A26']];
function paintWalker(g, W, H, v, frame, back) { // a passer-by, seen from the back (walking away) or the front
  const [top, pants, hair] = PEOPLE[v % PEOPLE.length], x = W / 2, skin = v % 3 === 1 ? '#E9C3A3' : '#F1D2B6', sw = frame ? 1 : -1;
  SH(g, W, H, .22);
  g.fillStyle = pants; // legs mid-stride
  g.beginPath(); g.moveTo(x - 14, H * .52); g.lineTo(x - 2, H * .52); g.lineTo(x - 6 + sw * 8, H - 8); g.lineTo(x - 18 + sw * 8, H - 8); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(x + 2, H * .52); g.lineTo(x + 14, H * .52); g.lineTo(x + 18 - sw * 8, H - 8); g.lineTo(x + 6 - sw * 8, H - 8); g.closePath(); g.fill();
  g.fillStyle = '#2B2B2B'; g.beginPath(); g.ellipse(x - 12 + sw * 8, H - 7, 9, 4, 0, 0, Math.PI * 2); g.ellipse(x + 12 - sw * 8, H - 7, 9, 4, 0, 0, Math.PI * 2); g.fill(); // shoes
  g.fillStyle = vgrad(g, H * .22, H * .55, [[0, shadeHex(top, 1.08)], [1, shadeHex(top, .8)]]); rrect(g, x - 20, H * .22, 40, H * .32, 8); g.fill(); // torso
  g.fillStyle = shadeHex(top, .92); rrect(g, x - 30, H * .24, 10, H * .2, 5); g.fill(); rrect(g, x + 20, H * .24, 10, H * .2, 5); g.fill(); // arms
  g.fillStyle = skin; g.beginPath(); g.arc(x - 25, H * .46, 5, 0, Math.PI * 2); g.arc(x + 25, H * .46, 5, 0, Math.PI * 2); g.fill();
  if (v % 2) { g.fillStyle = '#5A3A26'; rrect(g, x + 22, H * .36, 14, 18, 3); g.fill(); } // a bag
  g.fillStyle = skin; g.beginPath(); g.arc(x, H * .13, 15, 0, Math.PI * 2); g.fill(); // head
  g.fillStyle = hair; g.beginPath(); g.arc(x, H * .11, 15.5, Math.PI, Math.PI * 2); g.fill(); if (back) g.fillRect(x - 15.5, H * .11, 31, v % 2 ? 14 : 7); else { g.fillRect(x - 15.5, H * .11, 31, 4); if (v % 4 === 2) g.fillRect(x - 15.5, H * .11, 5, 14); }
  if (!back) { g.fillStyle = '#2B2B2B'; g.beginPath(); g.arc(x - 5, H * .14, 1.6, 0, Math.PI * 2); g.arc(x + 5, H * .14, 1.6, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = skin; g.fillRect(x - 4, H * .19, 8, 6); // neck
}
Object.assign(PROP_ART, {
  lampC: (n, v) => artCanvas('plampC|' + v + n, 240, 480, (g, w, h) => paintLampC(g, w, h, n, v)),
  pole: () => artCanvas('ppole', 120, 560, paintPole),
  signal: (n, v) => artCanvas('psignal|' + v + n, 260, 420, (g, w, h) => paintSignal(g, w, h, n, v)),
  roof: (n, v) => artCanvas('proof' + v, 300, 200, (g, w, h) => paintRoofKit(g, w, h, +v || 0)),
  walker: (n, v) => { const [k, f, b] = String(v).split('.'); return artCanvas('pwalk' + v, 80, 180, (g, w, h) => paintWalker(g, w, h, +k, +f, +b)); },
});
// sprite sizes for the furniture that is painted whole (world units, and where the picture's base sits relative to the pavement)
const PROP_DIM = { lampC: { w: 2.4, h: 4.8, off: .5 }, pole: { w: 1.9, h: 8.9, off: 0 }, signal: { w: 3.3, h: 5.3, off: .6 } };

function paintKaminarimon(g, W, H, night) { // the thunder gate: two vermilion pillars, a dark lintel, the great red lantern
  const pw = W * .062, lint = H * .13;
  for (const x of [W * .13, W * .87]) { g.fillStyle = vgrad(g, 0, H, [[0, '#D9452B'], [1, '#9C2E1E']]); g.fillRect(x - pw / 2, lint, pw, H - lint); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - pw / 2 + 2, lint, pw * .3, H - lint); g.fillStyle = '#2B2B2B'; g.fillRect(x - pw / 2 - 3, H - 10, pw + 6, 10); }
  g.fillStyle = '#3B2A20'; g.fillRect(W * .04, lint * .35, W * .92, lint * .65); g.fillStyle = '#1E1A18'; g.fillRect(0, 0, W, lint * .4); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, lint * .4, W, 3);
  g.fillStyle = '#D9452B'; for (let x = W * .1; x < W * .9; x += W * .1) g.fillRect(x, lint * .45, 4, lint * .5); // rafters
  // the lantern: a red paper body with ribs, black bands, the characters, a dark base and a tassel
  const cx = W / 2, top = H * .5, bot = H * .85, lw = W * .08;
  g.fillStyle = '#2B2B2B'; g.fillRect(cx - 4, lint, 8, top - lint + 8); g.fillStyle = '#D9A21B'; g.fillRect(cx - 14, top - 10, 28, 6);
  const body = g.createRadialGradient(cx - lw * .3, (top + bot) / 2 - 20, 10, cx, (top + bot) / 2, lw * 1.2); body.addColorStop(0, night ? '#FF7A5A' : '#E85A3C'); body.addColorStop(.7, '#C8362A'); body.addColorStop(1, '#8A1F14');
  g.fillStyle = body; g.beginPath(); g.moveTo(cx - lw * .7, top + 8); g.bezierCurveTo(cx - lw * 1.25, top + (bot - top) * .3, cx - lw * 1.25, bot - (bot - top) * .3, cx - lw * .7, bot - 8); g.lineTo(cx + lw * .7, bot - 8); g.bezierCurveTo(cx + lw * 1.25, bot - (bot - top) * .3, cx + lw * 1.25, top + (bot - top) * .3, cx + lw * .7, top + 8); g.closePath(); g.fill();
  g.save(); g.clip(); g.strokeStyle = 'rgba(60,10,5,.35)'; g.lineWidth = 1.5; for (let y = top + 10; y < bot - 8; y += 6) { g.beginPath(); g.moveTo(cx - lw * 1.3, y); g.quadraticCurveTo(cx, y + 4, cx + lw * 1.3, y); g.stroke(); } g.restore(); // the ribs
  g.fillStyle = '#1E1A18'; g.fillRect(cx - lw * .72, top, lw * 1.44, 14); g.fillRect(cx - lw * .72, bot - 14, lw * 1.44, 14); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(cx - lw * .72, top + 2, lw * 1.44, 3);
  g.fillStyle = '#1A0F0A'; g.font = `900 ${Math.round(lw * .62)}px "Zen Maru Gothic","Hiragino Sans",serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('雷', cx, top + (bot - top) * .36); g.fillText('門', cx, top + (bot - top) * .66);
  g.fillStyle = '#2B2B2B'; g.beginPath(); g.moveTo(cx - 10, bot); g.lineTo(cx + 10, bot); g.lineTo(cx + 6, H - 2); g.lineTo(cx - 6, H - 2); g.closePath(); g.fill(); g.fillStyle = '#D9A21B'; g.fillRect(cx - 12, bot - 2, 24, 4); // the carved base and tassel ring
  if (night) { g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(cx, (top + bot) / 2, 10, cx, (top + bot) / 2, lw * 1.8); gl.addColorStop(0, 'rgba(255,170,110,.5)'); gl.addColorStop(1, 'rgba(255,150,90,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
}
ART.kaminarimon = (o, night) => artCanvas('kmon' + (night ? 'N' : ''), 720, 380, (g, w, h) => paintKaminarimon(g, w, h, night));

// the hanging ads follow the season of the day you are on (a 'summer outing' ad in winter, or a 'morning' ad at night, looked wrong — 2026-11-08)
const AD_SEASON = { spring: ['春の旅', 'お花見へ', '新生活'], summer: ['夏のおでかけ', '花火大会', '冷たい麦茶'], autumn: ['読書の秋', '紅葉狩り', '新米の季節'], winter: ['冬のあったか', '年末セール', '温泉へ'] };
const AD_ANY = ['新発売', '週末セール', '東京さんぽ', 'お弁当特集', '映画公開', '美術館へ', '牧草フェア'];
const adSeason = () => { try { return seasonOf(G.planDay || 1); } catch (e) { return 'spring'; } };
const adWords = se => [...(AD_SEASON[se] || AD_SEASON.spring), ...AD_ANY];
function paintAdPoster(g, W, H, v, se) { // a hanging train advertisement: a bright block of colour, a bold headline, a line of small print
  const r = rnd(v * 53 + 9), bg = ['#F7E7B8', '#CFE6F5', '#F4CFD8', '#D7EFD0', '#FBF6EE', '#2B2B2B'][v % 6], ink = v % 6 === 5 ? '#FBF6EE' : '#2B2B2B';
  g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = ['#C8463C', '#355F86', '#F2C230', '#5F9E5A', '#E86A75'][(r() * 5) | 0]; g.fillRect(W * .08, H * .12, W * .84, H * .42);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(W * .7, H * .33, H * .14, 0, Math.PI * 2); g.fill();
  g.fillStyle = ink; g.font = `900 ${Math.round(H * .17)}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; { const ws = adWords(se); g.fillText(ws[v % ws.length], W / 2, H * .7); }
  g.fillStyle = v % 6 === 5 ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.35)'; for (let k = 0; k < 3; k++) g.fillRect(W * .15, H * (.84 + k * .05), W * (.7 - k * .15), H * .02);
  g.fillStyle = '#9AA0A6'; g.fillRect(W * .2, 0, 3, H * .1); g.fillRect(W * .8, 0, 3, H * .1);
}
PROP_ART.ad = (n, v) => { const m = /^(\d+)([a-z]*)$/.exec(String(v)) || [], se = m[2] && AD_SEASON[m[2]] ? m[2] : adSeason(); return artCanvas('pad' + (+m[1] || 0) + se, 300, 200, (g, w, h) => paintAdPoster(g, w, h, +m[1] || 0, se)); }; // 季節は区間を作った日のもの（前の日の絵が使い回されて、夏に「お花見へ」が出ていた：2026-11-09）

/* ---- the last box-built obstacles, painted ---- */
function paintFuton(g, W, H) { // a futon laid out on the floor, seen from the side: the mattress, the rumpled quilt, the pillow
  g.fillStyle = 'rgba(40,30,20,.3)'; g.beginPath(); g.ellipse(W / 2, H - 5, W * .5, 6, 0, 0, Math.PI * 2); g.fill();
  const c = ['#7E9DC4', '#D99AA6', '#8FB59A'][(G.stats && G.stats.runs || 0) % 3];
  puffLayer(g, W * .02, H * .58, W * .96, H * .36, '#F4EFE4', '#D6CCBA', { bulge: .4, sag: .1, tufts: 1 });
  // the quilt: rolling humps where it was kicked about
  g.save(); g.beginPath(); g.moveTo(W * .2, H * .66);
  g.bezierCurveTo(W * .28, H * .2, W * .42, H * .3, W * .5, H * .4); g.bezierCurveTo(W * .58, H * .14, W * .76, H * .22, W * .84, H * .44);
  g.bezierCurveTo(W * .92, H * .56, W * .97, H * .66, W * .96, H * .8); g.bezierCurveTo(W * .7, H * .86, W * .4, H * .86, W * .18, H * .8); g.closePath();
  const gr = g.createLinearGradient(0, H * .15, 0, H * .86); gr.addColorStop(0, shadeHex(c, 1.12)); gr.addColorStop(.6, c); gr.addColorStop(1, shadeHex(c, .78)); g.fillStyle = gr; g.fill(); g.clip();
  g.strokeStyle = 'rgba(30,30,50,.18)'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * .5, H * .42); g.quadraticCurveTo(W * .54, H * .62, W * .5, H * .84); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.18)'; const rr = rnd(9); for (let k = 0; k < 60; k++) { g.beginPath(); g.arc(W * (.2 + rr() * .78), H * (.2 + rr() * .66), 2, 0, Math.PI * 2); g.fill(); }
  g.restore();
  puffLayer(g, W * .03, H * .38, W * .16, H * .3, '#EDE4D2', '#C9B89A', { bulge: .3, sag: .16 }); // the pillow
}
function paintNoren(g, W, H) { // a shop curtain in three split panels with a shop name, hung from a bamboo pole (open below)
  const home0 = G.segs && G.segs[G.ci] && G.segs[G.ci].th.kind === 'room', top = H * .02, bot = H * .76, col = home0 ? '#2F4E78' : ['#1F3A5F', '#7A2E24', '#2E5E3A', '#2B2B2B'][(G.day || 1) % 4];
  g.fillStyle = '#C9A06A'; g.fillRect(0, top, W, 6); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, top + 4, W, 2);
  const n = 3, pw = W / n;
  for (let i = 0; i < n; i++) { const x0 = i * pw + 3, x1 = (i + 1) * pw - 3; g.fillStyle = vgrad(g, top, bot, [[0, shadeHex(col, 1.12)], [1, shadeHex(col, .8)]]);
    g.beginPath(); g.moveTo(x0, top + 6); g.lineTo(x1, top + 6); g.lineTo(x1 + 4, bot - 8); g.quadraticCurveTo((x0 + x1) / 2, bot + 6, x0 - 4, bot - 8); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x0 + (x1 - x0) * .55, top + 6, (x1 - x0) * .18, bot - top - 14); }
  if (home0) { g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 3; for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) { const cx = i * pw + pw / 2, cy = top + (bot - top) * (.25 + k * .17); g.beginPath(); g.arc(cx, cy + 10, pw * .22, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(cx, cy + 10, pw * .12, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } return; }
  g.fillStyle = '#FBF6EE'; g.font = `900 ${Math.round(pw * .5)}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const word = home0 ? '' : ['食堂', '甘味', '湯', 'そば'][(G.day || 1) % 4], first = word.length === 1 ? 1 : 0; [...word].forEach((ch, i) => g.fillText(ch, pw * (i + first) + pw / 2, top + (bot - top) * .5));
  const cx = pw * (word.length === 1 ? 0 : 2) + pw / 2, cy = top + (bot - top) * .5; g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(cx, cy, pw * .17, 0, Math.PI * 2); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(cx, cy, pw * .11, 0, Math.PI * 2); g.fill(); // a shop crest on the spare panel
}
function paintStep(g, W, H) { // a long wooden step up to the raised floor, worn in the middle
  g.fillStyle = vgrad(g, 0, H, [[0, '#A8824F'], [1, '#6B4A2E']]); g.fillRect(0, H * .1, W, H * .9); g.fillStyle = '#C9A06A'; g.fillRect(0, H * .1, W, H * .18);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, H * .1, W, 3); g.strokeStyle = 'rgba(60,40,20,.35)'; g.lineWidth = 1.5; for (const y of [.42, .58, .74]) { g.beginPath(); g.moveTo(0, H * y); g.lineTo(W, H * y + 2); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.ellipse(W / 2, H * .2, W * .22, H * .06, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, H * .95, W, H * .05);
}
function paintPillar(g, W, H) { // a square timber pillar with a sign plate and a rounded base
  g.fillStyle = g.createLinearGradient(0, 0, W, 0); g.fillStyle.addColorStop(0, '#5A3E2A'); g.fillStyle.addColorStop(.4, '#9C7652'); g.fillStyle.addColorStop(1, '#4A3220'); g.fillRect(W * .12, 0, W * .76, H);
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; for (let y = 10; y < H; y += 14) { g.beginPath(); g.moveTo(W * .14, y); g.lineTo(W * .86, y + 3); g.stroke(); }
  g.fillStyle = '#2B2B2B'; g.fillRect(W * .06, H * .92, W * .88, H * .08); g.fillStyle = '#F2E6D8'; g.fillRect(W * .25, H * .3, W * .5, H * .2); g.strokeStyle = '#8A5A36'; g.lineWidth = 2; g.strokeRect(W * .25, H * .3, W * .5, H * .2);
  g.fillStyle = '#2B2B2B'; g.font = `900 ${Math.round(W * .2)}px "Zen Maru Gothic",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('禁', W / 2, H * .36); g.fillText('煙', W / 2, H * .45);
}
function paintStationPole(g, W, H) { // a slim station pillar, pale blue, with a number plate
  g.fillStyle = g.createLinearGradient(0, 0, W, 0); g.fillStyle.addColorStop(0, '#6E8AA3'); g.fillStyle.addColorStop(.45, '#C9D8E4'); g.fillStyle.addColorStop(1, '#5E7A94'); g.fillRect(W * .3, 0, W * .4, H);
  g.fillStyle = '#F2C230'; g.fillRect(W * .26, H * .48, W * .48, H * .1); g.fillStyle = '#2B2B2B'; g.font = `900 ${Math.round(W * .22)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('3', W / 2, H * .53);
  g.fillStyle = '#2B2B2B'; g.fillRect(W * .24, H * .95, W * .52, H * .05);
}
function paintBag(g, W, H) { // a handbag left on the floor
  SH(g, W, H, .25); const c = '#8C5A3C'; g.fillStyle = vgrad(g, H * .3, H, [[0, shadeHex(c, 1.12)], [1, shadeHex(c, .78)]]); rrect(g, W * .08, H * .32, W * .84, H * .62, 12); g.fill();
  g.strokeStyle = shadeHex(c, .7); g.lineWidth = 5; g.beginPath(); g.moveTo(W * .3, H * .34); g.quadraticCurveTo(W / 2, -H * .1, W * .7, H * .34); g.stroke();
  g.fillStyle = '#D9A21B'; g.fillRect(W * .44, H * .5, W * .12, H * .08); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(W * .08, H * .6, W * .84, 3);
}
function paintRope(g, W, H) { // a red velvet rope between brass stanchions
  const px = [W * .06, W * .5, W * .94];
  for (const x of px) { g.fillStyle = vgrad(g, 0, H, [[0, '#E6C560'], [1, '#9C7A1E']]); g.fillRect(x - 5, H * .12, 10, H * .88); g.fillStyle = '#C9A030'; g.beginPath(); g.ellipse(x, H * .98, 14, 5, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(x, H * .12, 7, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = '#B8202C'; g.lineWidth = 9; g.lineCap = 'round'; for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(px[i], H * .18); g.quadraticCurveTo((px[i] + px[i + 1]) / 2, H * .6, px[i + 1], H * .18); g.stroke(); }
  g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 3; for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(px[i], H * .15); g.quadraticCurveTo((px[i] + px[i + 1]) / 2, H * .55, px[i + 1], H * .15); g.stroke(); }
}
function paintJokoro(g, W, H) { // a bronze incense burner with a little roof, smoke rising
  SH(g, W, H, .3); g.fillStyle = '#4A5A4A'; g.fillRect(W * .2, H * .62, W * .6, H * .36); g.fillStyle = vgrad(g, H * .3, H * .62, [[0, '#7A8A6A'], [1, '#3E4A3A']]); g.beginPath(); g.ellipse(W / 2, H * .62, W * .34, H * .06, 0, 0, Math.PI * 2); g.fill(); g.fillRect(W * .16, H * .34, W * .68, H * .28);
  g.fillStyle = '#5C6B52'; g.beginPath(); g.moveTo(W * .08, H * .34); g.lineTo(W * .5, H * .14); g.lineTo(W * .92, H * .34); g.closePath(); g.fill(); g.fillStyle = '#3E4A3A'; g.fillRect(W * .06, H * .33, W * .88, 4);
  g.fillStyle = '#C9A030'; g.beginPath(); g.arc(W / 2, H * .13, 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(230,230,225,.55)'; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(W * (.45 + k * .04), H * (.3 - k * .07), 10 + k * 4, 6 + k * 2, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(W * .22, H * .36, W * .1, H * .24);
}
function paintPicnic(g, W, H) { // a picnic sheet with a bento box and a thermos
  g.fillStyle = '#4E77A0'; g.beginPath(); g.moveTo(W * .1, H * .35); g.lineTo(W * .9, H * .35); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.18)'; for (let x = W * .1; x < W; x += W * .16) g.fillRect(x, H * .35, 5, H * .65);
  g.fillStyle = '#F2E6D8'; rrect(g, W * .28, H * .18, W * .3, H * .5, 6); g.fill(); g.fillStyle = '#C8463C'; g.fillRect(W * .31, H * .24, W * .1, H * .14); g.fillStyle = '#5F9E5A'; g.fillRect(W * .43, H * .24, W * .1, H * .14); g.fillStyle = '#F2C230'; g.fillRect(W * .31, H * .44, W * .22, H * .14);
  g.fillStyle = '#355F86'; rrect(g, W * .66, H * .02, W * .14, H * .62, 8); g.fill(); g.fillStyle = '#C9CDD2'; g.fillRect(W * .66, H * .02, W * .14, H * .14);
}
function paintRing(g, W, H) { // a life ring lying on the deck
  g.save(); g.translate(W / 2, H * .6); g.scale(1, .5); g.lineWidth = W * .22; g.strokeStyle = '#F2F2F2'; g.beginPath(); g.arc(0, 0, W * .36, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = '#D33A2C'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(0, 0, W * .36, k * Math.PI / 2 + .25, k * Math.PI / 2 + .85); g.stroke(); } g.restore();
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(W / 2, H * .9, W * .4, H * .1, 0, 0, Math.PI * 2); g.fill();
}
Object.assign(ART, {
  futon: () => artCanvas('futonO', 520, 70, paintFuton), noren: () => { const home = G.segs && G.segs[G.ci] && G.segs[G.ci].th.kind === 'room'; return artCanvas('norenO' + (home ? 'H' : (G.day || 1) % 4), 560, 290, paintNoren); }, step: () => artCanvas('stepO', 920, 60, paintStep),
  pillar: () => artCanvas('pillarO', 130, 370, paintPillar), pole: () => artCanvas('poleO', 60, 300, paintStationPole), bag: () => artCanvas('bagO', 110, 90, paintBag),
  rope: () => artCanvas('ropeO', 540, 80, paintRope), jokoro: () => artCanvas('jokoroO', 140, 210, paintJokoro), picnic: () => artCanvas('picnicO', 180, 70, paintPicnic), ring: () => artCanvas('ringO', 100, 40, paintRing),
});

// pieces for the title room, reusing the obstacle painters
Object.assign(PROP_ART, { tChabudai: () => ART.chabudai({}), tMug: () => ART.mug({}), tPapers: () => ART.papers({}), tClock: () => ART.clock({}), tZabuton: () => ART.zabuton({}), tToys: () => ART.toys({}) });

function paintPendant(g, W, H) { // a paper pendant lamp on a cord, lit from inside
  g.strokeStyle = '#4A3220'; g.lineWidth = 3; g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, H * .22); g.stroke();
  const gr = g.createRadialGradient(W / 2, H * .5, 4, W / 2, H * .55, W * .5); gr.addColorStop(0, '#FFF6DC'); gr.addColorStop(.75, '#F3E2BC'); gr.addColorStop(1, '#D9C49A');
  g.fillStyle = gr; g.beginPath(); g.ellipse(W / 2, H * .58, W * .46, H * .36, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(120,90,50,.35)'; g.lineWidth = 1.2; for (let k = 1; k < 7; k++) { const y = H * .58 + (k - 3.5) * H * .09, w = Math.sqrt(1 - Math.pow((k - 3.5) / 4, 2)) * W * .46; g.beginPath(); g.moveTo(W / 2 - w, y); g.quadraticCurveTo(W / 2, y + 3, W / 2 + w, y); g.stroke(); }
  g.fillStyle = '#4A3220'; g.fillRect(W * .42, H * .2, W * .16, 6); g.fillRect(W * .46, H * .92, W * .08, 5);
}
PROP_ART.pendant = () => artCanvas('pendant', 140, 140, paintPendant);
function paintTorii(g, W, H, v) { // a myojin torii: round pillars leaning in a little, the tie beam through them, the upswept top beam with its black cap, the name plaque
  const [col, top] = String(v).split('/'); const c = col || '#C8463C', k = top || '#2B2B2B';
  const px = [W * .2, W * .8], pw = W * .055, base = H, py0 = H * .2;
  for (const x of px) { const lean = (x < W / 2 ? 1 : -1) * W * .012; const gr = g.createLinearGradient(x - pw, 0, x + pw, 0); gr.addColorStop(0, shadeHex(c, .72)); gr.addColorStop(.4, shadeHex(c, 1.12)); gr.addColorStop(1, shadeHex(c, .62));
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - pw - lean * .2, base); g.lineTo(x + pw - lean * .2, base); g.lineTo(x + pw * .85 + lean, py0); g.lineTo(x - pw * .85 + lean, py0); g.closePath(); g.fill();
    g.fillStyle = '#2B2B2B'; g.fillRect(x - pw * 1.25, base - H * .045, pw * 2.5, H * .045); // the black foot
    g.fillStyle = shadeHex(c, .8); g.fillRect(x - pw * 1.1, H * .44, pw * 2.2, H * .02); }
  // the tie beam (nuki), running through and past the pillars
  g.fillStyle = vgrad(g, H * .3, H * .36, [[0, shadeHex(c, 1.1)], [1, shadeHex(c, .75)]]); g.fillRect(W * .08, H * .3, W * .84, H * .055);
  // the plaque between the beams
  g.fillStyle = shadeHex(c, .85); g.fillRect(W * .47, H * .19, W * .06, H * .11); g.fillStyle = '#2B2420'; g.fillRect(W * .445, H * .17, W * .11, H * .13); g.strokeStyle = '#C9A030'; g.lineWidth = 2; g.strokeRect(W * .45, H * .175, W * .1, H * .12);
  // the lower top beam (shimaki) and the upswept kasagi with its dark cap
  g.fillStyle = vgrad(g, H * .12, H * .18, [[0, shadeHex(c, 1.08)], [1, shadeHex(c, .72)]]); g.fillRect(W * .06, H * .125, W * .88, H * .055);
  g.fillStyle = k; g.beginPath(); g.moveTo(0, H * .02); g.quadraticCurveTo(W * .5, H * .1, W, H * .02); g.lineTo(W * .97, H * .125); g.quadraticCurveTo(W * .5, H * .17, W * .03, H * .125); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(W * .02, H * .04); g.quadraticCurveTo(W * .5, H * .11, W * .98, H * .04); g.lineTo(W * .98, H * .055); g.quadraticCurveTo(W * .5, H * .125, W * .02, H * .055); g.closePath(); g.fill();
}
function paintStreetGate(g, W, H, v) { // a shopping-street arch: two slim posts, a lit sign board with the street's name, a row of bulbs
  const [txt, col] = String(v).split('/'); const c = col || '#2F5579';
  for (const x of [W * .06, W * .94]) { const gr = g.createLinearGradient(x - 8, 0, x + 8, 0); gr.addColorStop(0, '#2B2B30'); gr.addColorStop(.5, '#6E7278'); gr.addColorStop(1, '#2B2B30'); g.fillStyle = gr; g.fillRect(x - 7, H * .2, 14, H * .8); g.fillStyle = '#2B2B30'; g.fillRect(x - 12, H - 10, 24, 10); }
  g.fillStyle = shadeHex(c, .6); rrect(g, W * .02, H * .02, W * .96, H * .24, 8); g.fill(); g.fillStyle = vgrad(g, H * .04, H * .24, [[0, shadeHex(c, 1.15)], [1, c]]); rrect(g, W * .035, H * .035, W * .93, H * .21, 6); g.fill();
  g.fillStyle = '#FBF6EE'; g.font = `900 ${Math.round(H * .15)}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 4; g.fillText(txt || '', W / 2, H * .145, W * .86); g.shadowBlur = 0;
  g.fillStyle = '#FFE9A8'; for (let x = W * .05; x < W * .96; x += W * .035) { g.beginPath(); g.arc(x, H * .275, 3, 0, Math.PI * 2); g.fill(); }
}
Object.assign(PROP_ART, { torii: (n, v) => artCanvas('ptorii|' + v, 720, 520, (g, w, h) => paintTorii(g, w, h, v)), sgate: (n, v) => artCanvas('psgate|' + v, 900, 560, (g, w, h) => paintStreetGate(g, w, h, v)) });
function paintOverpass(g, W, H, v) { // an elevated road or railway seen head-on: the deck's concrete edge with a sound wall or a railing, piers at both ends, the shadow underneath
  const rail = v === 'rail', deckY = H * (rail ? .62 : .66), deckH = H * (rail ? .14 : .2);
  for (const x of [W * .06, W * .94]) { const gr = g.createLinearGradient(x - W * .03, 0, x + W * .03, 0); gr.addColorStop(0, '#7E8388'); gr.addColorStop(.45, '#B9BEC4'); gr.addColorStop(1, '#6E737A'); g.fillStyle = gr; g.fillRect(x - W * .028, deckY, W * .056, H - deckY); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x - W * .028, H - 8, W * .056, 8); }
  g.fillStyle = vgrad(g, deckY - deckH, deckY, [[0, '#C9CDD2'], [.2, '#A9AFB5'], [1, '#8E949A']]); g.fillRect(0, deckY - deckH, W, deckH);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, deckY - 4, W, 4); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(0, deckY - deckH, W, 3);
  g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1.5; for (let x = W * .1; x < W; x += W * .12) { g.beginPath(); g.moveTo(x, deckY - deckH); g.lineTo(x, deckY); g.stroke(); } // panel joints
  if (rail) { g.strokeStyle = '#6E737A'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, deckY - deckH - 22); g.lineTo(W, deckY - deckH - 22); for (let x = 0; x < W; x += 18) { g.moveTo(x, deckY - deckH); g.lineTo(x, deckY - deckH - 22); } g.stroke();
    g.strokeStyle = '#4A4F55'; g.lineWidth = 2; for (let x = W * .05; x < W; x += W * .2) { g.beginPath(); g.moveTo(x, deckY - deckH); g.lineTo(x, deckY - deckH - 70); g.moveTo(x - 14, deckY - deckH - 64); g.lineTo(x + 14, deckY - deckH - 64); g.stroke(); } } // overhead line poles
  else { g.fillStyle = vgrad(g, deckY - deckH - H * .16, deckY - deckH, [[0, '#DCE5EC'], [1, '#B4C1CC']]); g.fillRect(0, deckY - deckH - H * .16, W, H * .16); g.strokeStyle = 'rgba(80,95,110,.45)'; g.lineWidth = 2; for (let x = 0; x < W; x += W * .05) { g.beginPath(); g.moveTo(x, deckY - deckH - H * .16); g.lineTo(x, deckY - deckH); g.stroke(); } // the sound wall
    g.fillStyle = '#2F6B4F'; rrect(g, W * .62, deckY - deckH - H * .15, W * .2, H * .1, 4); g.fill(); g.fillStyle = '#FBF6EE'; g.font = `900 ${Math.round(H * .045)}px "Zen Maru Gothic",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tr('首都高 出口', 'EXPRESSWAY EXIT'), W * .72, deckY - deckH - H * .1, W * .18); }
  // a shadow cast under the deck on whatever is behind
  g.fillStyle = 'rgba(30,35,45,.18)'; g.fillRect(W * .09, deckY, W * .82, H * .04);
  if (rail) { g.fillStyle = '#F2C230'; g.fillRect(W * .35, deckY - deckH * .82, W * .3, deckH * .64); g.fillStyle = '#2B2B2B'; g.font = `900 ${Math.round(deckH * .38)}px "Zen Maru Gothic",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tr('高さ制限 4.0m', 'MAX HEIGHT 4.0m'), W / 2, deckY - deckH * .5, W * .28); }
}
PROP_ART.overpass = (n, v) => artCanvas('poverpass|' + v + LANG, 1000, 560, (g, w, h) => paintOverpass(g, w, h, v));
function paintNobori(g, W, H, v) { // a tall banner on a pole, its top bar and a soft wave in the cloth
  const [c, txt] = String(v).split('|'), ink = c === '#FBF6EE' || c === '#F2C230' ? '#C8463C' : '#FBF6EE';
  g.fillStyle = '#9AA0A6'; g.fillRect(W * .12, 0, 5, H); g.fillRect(W * .12, H * .04, W * .78, 4);
  const x0 = W * .18, x1 = W * .9, y0 = H * .05, y1 = H * .72;
  g.fillStyle = c; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); for (let k = 0; k <= 10; k++) { const y = y0 + (y1 - y0) * k / 10; g.lineTo(x1 + Math.sin(k * .9) * 3, y); } g.lineTo(x0, y1); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.12)'; for (let k = 0; k < 4; k++) g.fillRect(x0 + (x1 - x0) * (.2 + k * .22), y0, 3, y1 - y0); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x0, y0, x1 - x0, 5);
  g.fillStyle = ink; g.font = `900 ${Math.round((x1 - x0) * .62)}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const ch = [...(txt || '名物')]; ch.forEach((t, i) => g.fillText(t, (x0 + x1) / 2, y0 + (y1 - y0) * (i + .5) / Math.max(3, ch.length)));
  g.fillStyle = '#5A5E63'; g.fillRect(W * .06, H - 10, W * .24, 10);
}
PROP_ART.nobori = (n, v) => artCanvas('pnobori|' + v, 90, 400, (g, w, h) => paintNobori(g, w, h, v));

function paintLowTable(g, W, H) { // a round chabudai seen from the room: the oval top in its grain, short legs, a mug and the folded morning paper on it
  g.fillStyle = 'rgba(40,30,20,.22)'; g.beginPath(); g.ellipse(W / 2, H * .9, W * .44, H * .08, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#5E3820'; for (const x of [.2, .8]) g.fillRect(W * x - 6, H * .46, 12, H * .44); g.fillStyle = '#4A2C18'; g.fillRect(W * .47, H * .5, 12, H * .38);
  g.fillStyle = '#6B4228'; g.beginPath(); g.ellipse(W / 2, H * .44, W * .48, H * .17, 0, 0, Math.PI * 2); g.fill(); // the edge
  const top = g.createRadialGradient(W * .4, H * .32, 10, W / 2, H * .38, W * .5); top.addColorStop(0, '#C48A58'); top.addColorStop(1, '#93603A'); g.fillStyle = top; g.beginPath(); g.ellipse(W / 2, H * .38, W * .47, H * .15, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(80,45,20,.25)'; g.lineWidth = 1.2; for (let k = 1; k < 6; k++) { g.beginPath(); g.ellipse(W / 2, H * .38, W * .47 * k / 6, H * .15 * k / 6, 0, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(W * .38, H * .33, W * .16, H * .03, -.1, 0, Math.PI * 2); g.fill();
  // the folded newspaper
  g.save(); g.translate(W * .64, H * .36); g.rotate(-.12); g.fillStyle = '#EDE9DF'; g.fillRect(-W * .13, -H * .07, W * .26, H * .12); g.fillStyle = 'rgba(0,0,0,.35)'; for (let k = 0; k < 4; k++) g.fillRect(-W * .11, -H * .05 + k * H * .025, W * .1, 2); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(W * .01, -H * .05, W * .1, H * .07); g.restore();
  // the mug (the one from the shop), with a little shine
  const mx = W * .36, my = H * .3; g.fillStyle = '#FBF6EE'; g.beginPath(); g.roundRect ? g.roundRect(mx - 14, my - 22, 28, 30, 5) : g.rect(mx - 14, my - 22, 28, 30); g.fill(); g.strokeStyle = '#FBF6EE'; g.lineWidth = 5; g.beginPath(); g.arc(mx + 16, my - 8, 7, -1.3, 1.3); g.stroke();
  g.fillStyle = '#4E77A0'; g.fillRect(mx - 14, my - 14, 28, 6); g.fillStyle = '#7A4E2E'; g.beginPath(); g.ellipse(mx, my - 21, 12, 3.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(mx + 6, my - 20, 6, 28);
}
PROP_ART.lowtable = () => artCanvas('lowtable', 300, 130, paintLowTable);
function paintPillarS(g, W, H) { // a station's square pillar: tiled, a line-colour band, a blue sign plate
  g.fillStyle = vgrad(g, 0, H, [[0, '#E6E6E0'], [1, '#C9C9C2']]); g.fillRect(W * .1, 0, W * .8, H);
  g.strokeStyle = 'rgba(0,0,0,.07)'; g.lineWidth = 1; for (let y = 10; y < H; y += 14) { g.beginPath(); g.moveTo(W * .1, y); g.lineTo(W * .9, y); g.stroke(); } for (let x = W * .1; x < W * .9; x += 14) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(W * .78, 0, W * .12, H); g.fillStyle = LC || '#80C241'; g.fillRect(W * .1, H * .72, W * .8, H * .03);
  g.fillStyle = '#2F5579'; g.fillRect(W * .16, H * .4, W * .68, H * .2); g.fillStyle = '#FBF6EE'; g.font = `900 ${Math.round(W * .2)}px "Zen Maru Gothic",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('出口', W / 2, H * .47); g.font = `900 ${Math.round(W * .12)}px sans-serif`; g.fillText('EXIT →', W / 2, H * .55);
  g.fillStyle = '#4A5058'; g.fillRect(W * .08, H - 8, W * .84, 8);
}
function paintGateS(g, W, H) { // a ticket gate seen from the side of the passage: the grey body, the card reader glowing, the flap
  g.fillStyle = vgrad(g, H * .1, H, [[0, '#6E7B88'], [1, '#46525E']]); rrect(g, W * .04, H * .12, W * .92, H * .86, 8); g.fill(); g.fillStyle = '#A9BDCC'; rrect(g, W * .04, H * .08, W * .92, H * .1, 6); g.fill();
  g.fillStyle = '#3FD18A'; rrect(g, W * .62, H * .1, W * .2, H * .06, 3); g.fill(); g.fillStyle = '#2B2B30'; g.fillRect(W * .12, H * .3, W * .3, H * .1);
  g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(W * .06, H * .2, W * .88, 3);
}
function paintKuroita(g, W, H) { // a black board fence of an old street, its top capped with tiles
  g.fillStyle = '#2E2A27'; g.fillRect(0, H * .12, W, H * .88); g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 2; for (let x = 6; x < W; x += 12) { g.beginPath(); g.moveTo(x, H * .12); g.lineTo(x, H); g.stroke(); }
  g.fillStyle = '#4A4F57'; g.fillRect(0, 0, W, H * .12); g.fillStyle = 'rgba(255,255,255,.2)'; for (let x = 0; x < W; x += 10) g.fillRect(x, 0, 2, H * .12);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, H * .12, W, 4); g.fillStyle = '#3B342E'; g.fillRect(0, H - 6, W, 6);
}
function paintBamboo(g, W, H) { // a bamboo fence (takegaki): upright canes tied with dark cord on three rails
  g.fillStyle = '#9C8A5C'; for (const y of [.2, .5, .8]) g.fillRect(0, H * y, W, 6);
  for (let x = 4; x < W; x += 9) { const gr = g.createLinearGradient(x, 0, x + 7, 0); gr.addColorStop(0, '#B8A770'); gr.addColorStop(.5, '#D9C98E'); gr.addColorStop(1, '#A08E58'); g.fillStyle = gr; g.fillRect(x, H * .06, 7, H * .94); g.fillStyle = 'rgba(80,60,30,.35)'; for (let y = H * .15; y < H; y += H * .22) g.fillRect(x, y, 7, 2); }
  g.fillStyle = '#3B2A20'; for (const y of [.2, .5, .8]) for (let x = 8; x < W; x += 36) g.fillRect(x, H * y - 2, 6, 10);
}
Object.assign(PROP_ART, { pillarS: () => artCanvas('ppillarS', 120, 420, paintPillarS) });
// fences run along the wall, so they are painted onto the face of their box (in the wall's own perspective)
const FACE_EXTRA = { kuroita: paintKuroita, bamboo: paintBamboo, gateS: paintGateS };
{ const pf0 = paintFace; paintFace = function (kind, W, H) { const f = FACE_EXTRA[kind]; return f ? artCanvas('face|' + kind, W, H, g => f(g, W, H)) : pf0(kind, W, H); }; }
function paintPlaneBack(g, W, H) { // a paper plane seen from behind: the two wings spread flat at hip height, the folded keel underneath, the crease lines
  const cx = W / 2, y = H * .42;
  const wing = (sd) => { g.beginPath(); g.moveTo(cx, y - 6); g.lineTo(cx + sd * W * .49, y - H * .22); g.lineTo(cx + sd * W * .46, y - H * .1); g.lineTo(cx + sd * W * .06, y + H * .1); g.closePath(); };
  for (const sd of [-1, 1]) { wing(sd); const gr = g.createLinearGradient(cx, 0, cx + sd * W * .5, 0); gr.addColorStop(0, '#E9EEF2'); gr.addColorStop(1, '#FFFFFF'); g.fillStyle = gr; g.fill(); g.strokeStyle = '#3B2A20'; g.lineWidth = 4; g.lineJoin = 'round'; g.stroke();
    g.strokeStyle = 'rgba(80,100,120,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + sd * W * .05, y + H * .02); g.lineTo(cx + sd * W * .44, y - H * .17); g.stroke(); }
  g.beginPath(); g.moveTo(cx - W * .07, y + H * .08); g.lineTo(cx + W * .07, y + H * .08); g.lineTo(cx, y + H * .5); g.closePath(); g.fillStyle = '#C9D4DE'; g.fill(); g.strokeStyle = '#3B2A20'; g.lineWidth = 4; g.stroke(); // the keel
  g.strokeStyle = 'rgba(80,100,120,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, y + H * .08); g.lineTo(cx, y + H * .46); g.stroke();
}
SPR.planeBack = artCanvas('planeBack', 400, 160, paintPlaneBack);
