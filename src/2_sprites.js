/* ================= item sprites (drawn once into small canvases) ================= */
const SPR = {};
const SPR_URL = {};
function mk(sz, h) { const c = document.createElement('canvas'); c.width = sz; c.height = h || sz; return c; }
// a phone that has run out of picture memory hands out canvases with no drawing context (iPhone: getContext returns null), and every
// drawing call on one would throw, frame after frame (the screen stopped half drawn on a very long run). noCtx() frees the kept copies
// (each is painted again when next needed) and returns a tiny scratch context, so the picture is just blank this once and the frame goes on.
const NOCTX = (() => { try { const c = document.createElement('canvas'); c.width = c.height = 1; return c.getContext('2d'); } catch (e) { return null; } })();
let NOCTX_T = -1e9, CANVAS_LOW = 0;
function noCtx() { CANVAS_LOW++; const now = performance.now(); if (now - NOCTX_T > 1500) { NOCTX_T = now; try { freePictures(); } catch (e) { } } try { NOCTX.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { } return NOCTX; }
function ell(g, x, y, rx, ry, rot, fill, stroke, lw) { g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot || 0, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 2; g.stroke(); } }
function rr(g, x, y, w, h, r, fill, stroke, lw) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 2; g.stroke(); } }
function leaf(g, x, y, len, wid, ang, fill, vein) {
  g.save(); g.translate(x, y); g.rotate(ang); g.beginPath(); g.moveTo(0, 0);
  g.quadraticCurveTo(wid, -len * .5, 0, -len); g.quadraticCurveTo(-wid, -len * .5, 0, 0); g.fillStyle = fill; g.fill();
  if (vein) { g.strokeStyle = vein; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -len * .9); g.stroke(); }
  g.restore();
}
const OUT = '#3B2A20';
const DRAW_ITEM = {
  hay(g) { // a tied bundle of timothy
    for (let i = 0; i < 26; i++) {
      const a = -0.5 + i / 25, x0 = 64 + a * 10;
      g.strokeStyle = i % 3 ? '#9BB85A' : (i % 2 ? '#C9C46A' : '#7FA046'); g.lineWidth = 3.2; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x0, 112); g.quadraticCurveTo(x0 + a * 30, 70, 64 + a * 64, 18 + Math.abs(a) * 22); g.stroke();
    }
    rr(g, 46, 70, 36, 12, 5, '#B5562C', OUT, 2.5);
  },
  pellet(g) {
    ell(g, 64, 96, 46, 14, 0, '#F3E8DA', OUT, 3);
    const P = [[44, 80], [60, 74], [76, 80], [52, 88], [70, 89], [86, 88], [40, 90], [64, 64], [80, 68]];
    P.forEach(([x, y], i) => { g.save(); g.translate(x, y); g.rotate(i); rr(g, -9, -5, 18, 10, 5, i % 2 ? '#8C6B3E' : '#A3824F', OUT, 2); g.restore(); });
  },
  komatsuna(g) { for (let i = 0; i < 5; i++) { g.strokeStyle = '#B8D98A'; g.lineWidth = 6; g.beginPath(); g.moveTo(64, 118); g.lineTo(64 + (i - 2) * 14, 70); g.stroke(); }
    [[-0.6, 34], [0.6, 34], [-0.2, 44], [0.2, 44], [0, 30]].forEach(([a, w]) => leaf(g, 64 + a * 20, 76, 64, w * .9, a, '#3F7F3A', '#7DB46A')); },
  chingen(g) { ell(g, 64, 96, 22, 22, 0, '#DDEFC6', OUT, 2.5); for (let i = -2; i <= 2; i++) leaf(g, 64 + i * 6, 86, 70, 22, i * .28, '#5E9E4E', '#A9D38C'); },
  parsley(g) { g.strokeStyle = '#6FA34E'; g.lineWidth = 4; g.beginPath(); g.moveTo(64, 120); g.lineTo(64, 64); g.moveTo(64, 90); g.lineTo(40, 58); g.moveTo(64, 90); g.lineTo(88, 58); g.stroke();
    [[64, 44], [40, 50], [88, 50], [52, 30], [76, 30], [30, 38], [98, 38]].forEach(([x, y]) => { for (let k = 0; k < 5; k++) ell(g, x + Math.cos(k * 1.3) * 9, y + Math.sin(k * 1.3) * 8, 10, 9, 0, k % 2 ? '#3F8A3A' : '#2F7A33'); }); },
  carrotTop(g) { g.strokeStyle = '#5E9E4E'; g.lineWidth = 3; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(64, 120); g.quadraticCurveTo(64 + i * 8, 70, 64 + i * 15, 20 + Math.abs(i) * 8); g.stroke();
    for (let k = 0; k < 4; k++) ell(g, 64 + i * (6 + k * 2.6), 34 + Math.abs(i) * 8 + k * 16, 7, 4, i * .3, '#4F9445'); } },
  dandelion(g) { leaf(g, 64, 118, 64, 18, -0.9, '#4F8F42', '#8BC46E'); leaf(g, 64, 118, 64, 18, 0.9, '#4F8F42', '#8BC46E');
    g.strokeStyle = '#6FA34E'; g.lineWidth = 4; g.beginPath(); g.moveTo(64, 118); g.lineTo(64, 52); g.stroke();
    for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; ell(g, 64 + Math.cos(a) * 16, 40 + Math.sin(a) * 16, 9, 4, a, '#F2C230'); } ell(g, 64, 40, 12, 12, 0, '#E8A81E'); },
  apple(g) { ell(g, 52, 72, 30, 34, 0, '#D9443E'); ell(g, 76, 72, 30, 34, 0, '#D9443E'); g.beginPath(); g.ellipse(64, 74, 46, 38, 0, 0, Math.PI * 2); g.strokeStyle = OUT; g.lineWidth = 3; g.stroke();
    ell(g, 46, 60, 9, 14, -.5, 'rgba(255,255,255,.45)'); g.strokeStyle = '#6B4631'; g.lineWidth = 5; g.beginPath(); g.moveTo(64, 40); g.lineTo(68, 22); g.stroke(); leaf(g, 68, 30, 26, 10, 1.1, '#5F9E5A'); },
  strawberry(g) { g.beginPath(); g.moveTo(26, 52); g.quadraticCurveTo(64, 30, 102, 52); g.quadraticCurveTo(100, 96, 64, 118); g.quadraticCurveTo(28, 96, 26, 52); g.fillStyle = '#E2434B'; g.fill(); g.strokeStyle = OUT; g.lineWidth = 3; g.stroke();
    for (let i = 0; i < 14; i++) ell(g, 38 + (i * 37) % 52, 60 + ((i * 23) % 44), 2.4, 3.4, 0, '#F7E3A1');
    for (let i = -2; i <= 2; i++) leaf(g, 64, 48, 28, 9, i * .55, '#4F9445'); },
  banana(g) { g.beginPath(); g.moveTo(24, 40); g.quadraticCurveTo(34, 112, 108, 96); g.quadraticCurveTo(52, 92, 38, 34); g.closePath(); g.fillStyle = '#F2C94C'; g.fill(); g.strokeStyle = OUT; g.lineWidth = 3; g.stroke();
    rr(g, 20, 28, 16, 14, 4, '#6B4631'); },
  pineapple(g) { for (let i = -3; i <= 3; i++) leaf(g, 64, 46, 44 - Math.abs(i) * 4, 9, i * .32, '#3F8A3A'); ell(g, 64, 82, 30, 38, 0, '#E9A93A', OUT, 3);
    g.strokeStyle = '#B9771E'; g.lineWidth = 2; for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(40, 60 + k * 10); g.lineTo(88, 84 + k * 10); g.moveTo(88, 60 + k * 10); g.lineTo(40, 84 + k * 10); g.stroke(); } },
  carrot(g) { g.beginPath(); g.moveTo(40, 44); g.quadraticCurveTo(64, 30, 88, 44); g.lineTo(66, 122); g.quadraticCurveTo(62, 124, 60, 120); g.closePath(); g.fillStyle = '#F08A2E'; g.fill(); g.strokeStyle = OUT; g.lineWidth = 3; g.stroke();
    g.strokeStyle = '#C96A1C'; g.lineWidth = 2; [[50, 60, 62], [58, 78, 70], [54, 96, 64]].forEach(([x, y, x2]) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y + 2); g.stroke(); });
    for (let i = -2; i <= 2; i++) leaf(g, 64, 40, 34, 9, i * .38, '#4F9445'); },
  papaya(g) { ell(g, 64, 70, 44, 32, -0.35, '#F0A24A', OUT, 3); ell(g, 64, 70, 32, 20, -0.35, '#F7C36E'); ell(g, 64, 70, 20, 10, -0.35, '#F2994A');
    for (let i = 0; i < 9; i++) ell(g, 50 + i * 3.5, 76 - i * 1.4 + (i % 2) * 5, 3.4, 3.4, 0, '#2E2018'); },
  alfalfa(g) { for (let i = 0; i < 20; i++) { const a = -0.5 + i / 19; g.strokeStyle = i % 2 ? '#A9D38C' : '#8CC46E'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(64 + a * 8, 112); g.quadraticCurveTo(64 + a * 20, 70, 64 + a * 58, 26 + Math.abs(a) * 18); g.stroke(); }
    [[34, 30], [56, 20], [76, 22], [96, 32], [46, 40], [84, 42]].forEach(([x, y]) => { ell(g, x, y, 7, 7, 0, '#9C7BD0'); ell(g, x - 2, y - 2, 3, 3, 0, '#C8B2EA'); });
    rr(g, 48, 74, 32, 11, 5, '#4E77A0', OUT, 2.5); },
  clover(g) { g.strokeStyle = '#4F8F42'; g.lineWidth = 5; g.beginPath(); g.moveTo(64, 66); g.quadraticCurveTo(70, 100, 60, 122); g.stroke();
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; g.save(); g.translate(64 + Math.cos(a) * 20, 60 + Math.sin(a) * 20); g.rotate(a + Math.PI / 2);
      ell(g, -9, 0, 13, 15, 0, '#4FA34A', OUT, 2.5); ell(g, 9, 0, 13, 15, 0, '#4FA34A', OUT, 2.5); g.restore(); } ell(g, 64, 60, 6, 6, 0, '#3E8A3A'); },
  mugIcon(g) { rr(g, 30, 34, 56, 66, 10, '#FBF6EE', OUT, 3); ell(g, 92, 66, 14, 18, 0, null, OUT, 8); ell(g, 92, 66, 14, 18, 0, null, '#FBF6EE', 4); rr(g, 30, 50, 56, 10, 0, '#4E77A0'); ell(g, 58, 36, 26, 6, 0, '#6B4631'); },
  pomseed(g) { // a little pile of striped sunflower seeds with a sparkle
    g.save(); g.translate(64, 70); for (const [x, y, r] of [[-22, 14, -.5], [0, 18, .1], [22, 12, .6], [-10, -4, -.2], [12, -6, .4], [0, -22, 0]]) { g.save(); g.translate(x, y); g.rotate(r);
      g.beginPath(); g.ellipse(0, 0, 10, 20, 0, 0, Math.PI * 2); g.fillStyle = '#2E2A28'; g.fill(); g.strokeStyle = OUT; g.lineWidth = 2.5; g.stroke();
      g.strokeStyle = '#F3EEE6'; g.lineWidth = 2; for (const k of [-4, 0, 4]) { g.beginPath(); g.moveTo(k, -16); g.lineTo(k * .8, 16); g.stroke(); } g.restore(); }
    g.fillStyle = '#FFE27A'; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? 6 : 16; g.lineTo(38 + Math.cos(a) * rr, -38 + Math.sin(a) * rr); } g.closePath(); g.fill(); g.restore(); },
  plane(g) { g.save(); g.translate(64, 66); g.rotate(-0.25); g.beginPath(); g.moveTo(-52, 6); g.lineTo(50, -22); g.lineTo(-8, 26); g.closePath(); g.fillStyle = '#FFFFFF'; g.fill(); g.strokeStyle = OUT; g.lineWidth = 3; g.stroke();
    g.beginPath(); g.moveTo(-8, 26); g.lineTo(50, -22); g.lineTo(-14, 10); g.closePath(); g.fillStyle = '#DDE3E8'; g.fill(); g.stroke(); g.strokeStyle = 'rgba(59,42,32,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-40, 2); g.lineTo(20, -12); g.moveTo(-36, 10); g.lineTo(10, -2); g.stroke(); g.restore(); },
  goldhay(g) { DRAW_ITEM.hay(g); g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, 0, 128, 128); gr.addColorStop(0, 'rgba(255,230,120,.85)'); gr.addColorStop(1, 'rgba(214,162,60,.85)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.globalCompositeOperation = 'source-over'; },
  hanko(g) { ell(g, 64, 64, 50, 50, 0, '#FBF6EE'); ell(g, 64, 64, 44, 44, 0, null, '#C8463C', 7); g.save(); g.translate(64, 66); g.rotate(-0.18);
    g.fillStyle = '#C8463C'; g.font = '900 34px "Zen Maru Gothic",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('承認', 0, 0); g.restore(); },
  choco(g) { g.save(); g.translate(64, 66); g.rotate(-0.3); rr(g, -40, -26, 80, 52, 6, '#6B3F24', OUT, 3);
    g.strokeStyle = '#4A2A17'; g.lineWidth = 3; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * 20 + 10, -26); g.lineTo(i * 20 + 10, 26); g.stroke(); } g.beginPath(); g.moveTo(-40, 0); g.lineTo(40, 0); g.stroke();
    rr(g, -40, -26, 34, 52, 4, '#C9CDD2', OUT, 3); g.restore(); },
  onion(g) { ell(g, 64, 78, 36, 36, 0, '#D9B48A', OUT, 3); g.strokeStyle = '#B98C60'; g.lineWidth = 2; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(64 + i * 4, 44); g.quadraticCurveTo(64 + i * 22, 78, 64 + i * 4, 112); g.stroke(); }
    g.fillStyle = '#D9B48A'; g.beginPath(); g.moveTo(54, 48); g.quadraticCurveTo(64, 18, 74, 48); g.fill(); g.stroke();
    g.strokeStyle = '#6FA34E'; g.lineWidth = 6; g.beginPath(); g.moveTo(64, 30); g.lineTo(58, 8); g.moveTo(64, 30); g.lineTo(74, 10); g.stroke(); },
  chips(g) { g.beginPath(); g.moveTo(28, 22); g.lineTo(100, 22); g.lineTo(94, 112); g.lineTo(34, 112); g.closePath(); g.fillStyle = '#E8B23A'; g.fill(); g.strokeStyle = OUT; g.lineWidth = 3; g.stroke();
    rr(g, 26, 16, 76, 12, 3, '#C8463C', OUT, 2.5); rr(g, 30, 106, 68, 10, 3, '#C8463C', OUT, 2.5); ell(g, 64, 70, 22, 16, 0, '#F7DD8A', OUT, 2);
    g.fillStyle = '#C8463C'; g.font = '900 14px sans-serif'; g.textAlign = 'center'; g.fillText('CHIPS', 64, 46); },
};
function buildItemSprites() {
  for (const k in DRAW_ITEM) { const c = mk(128); const g = c.getContext('2d') || noCtx(); g.lineJoin = 'round'; DRAW_ITEM[k](g); SPR[k] = c; try { SPR_URL[k] = c.toDataURL(); } catch (e) { SPR_URL[k] = ''; } }
  // NG badge over bad foods
  for (const k of BADS) { const c = mk(128); const g = c.getContext('2d') || noCtx(); g.drawImage(SPR[k], 0, 0); ell(g, 100, 24, 20, 20, 0, '#C8463C', '#FBF6EE', 4);
    g.strokeStyle = '#FBF6EE'; g.lineWidth = 6; g.beginPath(); g.moveTo(91, 15); g.lineTo(109, 33); g.moveTo(109, 15); g.lineTo(91, 33); g.stroke(); SPR[k + 'NG'] = c; }
}

