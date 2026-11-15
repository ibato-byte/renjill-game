/* ================= item sprites (drawn once into small canvases) ================= */
const SPR = {};
const SPR_URL = {};
function mk(sz, h) { const c = document.createElement('canvas'); c.width = sz; c.height = h || sz; return c; }
// a phone that has run out of picture memory hands out canvases with no drawing context (iPhone: getContext returns null), and every
// drawing call on one would throw, frame after frame (the screen stopped half drawn on a very long run). noCtx() frees the kept copies
// (each is painted again when next needed) and returns a tiny scratch context, so the picture is just blank this once and the frame goes on.
const NOCTX = (() => { try { const c = document.createElement('canvas'); c.width = c.height = 1; return c.getContext('2d'); } catch (e) { return null; } })();
let NOCTX_T = -1e9, CANVAS_LOW = 0;
function noCtx() { CANVAS_LOW++; const now = performance.now(); if (now - NOCTX_T > 1500) { NOCTX_T = now; try { freePictures(); if (typeof sprTrim === "function") sprTrim(0); } catch (e) { } } try { NOCTX.setTransform(1, 0, 0, 1, 0, 0); } catch (e) { } return NOCTX; }
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
  chalflag(g) { // challenge flag: a pole with a red-and-gold pennant and a star
    rr(g, 58, 14, 8, 106, 3, '#8C5A3C', OUT, 2); g.beginPath(); g.moveTo(66, 16); g.lineTo(118, 34); g.lineTo(66, 54); g.closePath(); g.fillStyle = '#E2434B'; g.fill(); g.strokeStyle = OUT; g.lineWidth = 3; g.stroke();
    g.beginPath(); g.moveTo(66, 30); g.lineTo(100, 35); g.lineTo(66, 41); g.closePath(); g.fillStyle = '#F2C230'; g.fill(); ell(g, 62, 116, 16, 5, 0, 'rgba(0,0,0,.18)');
  },
  memo(g) { // dropped papers: two sheets with lines and a red clip
    g.save(); g.translate(64, 66); g.rotate(-.18); rr(g, -34, -42, 68, 86, 6, '#E9E2D3', OUT, 3); g.restore();
    g.save(); g.translate(64, 64); g.rotate(.1); rr(g, -34, -44, 68, 88, 6, '#FFFDF7', OUT, 3);
    g.fillStyle = '#B9AE9E'; for (let i = 0; i < 5; i++) g.fillRect(-22, -22 + i * 13, i === 4 ? 26 : 44, 5);
    rr(g, -8, -52, 16, 22, 4, '#E2434B', OUT, 2.5); g.restore();
  },
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
/* 見た目 141〜162（2026-11-16）：食べ物・アイテムの絵に、物ごとの立体感を足す（全体に同じうすい陰影を 1 枚かけるだけでは、のっぺりしたままだった）。
   絵の上（source-atop）に描くので、形の外にははみ出さない。丸い物は丸く、長い物は長さにそって、葉は葉先にむかって明るく */
const FORM = { ball(g, cx, cy, r, a) { const gr = g.createRadialGradient(cx - r * .38, cy - r * .42, r * .08, cx, cy, r * 1.05); gr.addColorStop(0, `rgba(255,255,255,${a || .34})`); gr.addColorStop(.45, 'rgba(255,255,255,0)'); gr.addColorStop(.7, 'rgba(40,20,5,0)'); gr.addColorStop(1, 'rgba(40,20,5,.3)'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r * 1.05, 0, Math.PI * 2); g.fill(); },
  lin(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([t, c]) => gr.addColorStop(t, c)); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); },
  spec(g, x, y, rx, ry, rot, a) { g.fillStyle = `rgba(255,255,255,${a || .5})`; g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); g.fill(); } };
const W0 = 'rgba(255,255,255,0)', D0 = 'rgba(30,18,5,0)';
const ITEM_FORM = {
  hay(g) { FORM.lin(g, 0, 16, 0, 116, [[0, 'rgba(255,255,220,.3)'], [.4, W0], [.6, D0], [1, 'rgba(50,60,10,.34)']]); FORM.lin(g, 30, 0, 98, 0, [[0, 'rgba(40,50,10,.18)'], [.35, W0], [.7, D0], [1, 'rgba(40,50,10,.22)']]); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(49, 72, 30, 2.5); }, // 141 チモシー：穂先が明るく根もとが暗い・束の丸み・ひものつや
  pellet(g) { [[44, 80], [60, 74], [76, 80], [52, 88], [70, 89], [86, 88], [64, 64], [80, 68]].forEach(([x, y]) => FORM.spec(g, x - 2, y - 2.5, 5, 1.6, 0, .32)); FORM.lin(g, 0, 84, 0, 112, [[0, W0], [1, 'rgba(90,60,30,.3)']]); }, // 142 ペレット：1 つぶずつのつや・皿の下側のかげ
  komatsuna(g) { FORM.lin(g, 20, 10, 100, 110, [[0, 'rgba(220,255,190,.32)'], [.45, W0], [1, 'rgba(10,45,15,.3)']]); FORM.lin(g, 0, 78, 0, 120, [[0, 'rgba(30,60,20,.22)'], [.35, D0], [1, 'rgba(255,255,255,.22)']]); }, // 143 小松菜：葉先の光と、葉の重なりのかげ・くきの白さ
  chingen(g) { FORM.lin(g, 20, 10, 100, 100, [[0, 'rgba(225,255,200,.3)'], [.5, W0], [1, 'rgba(10,45,15,.28)']]); FORM.ball(g, 64, 96, 23, .4); }, // 144 チンゲン菜：株もとの丸み
  parsley(g) { for (const [x, y] of [[64, 44], [40, 50], [88, 50], [52, 30], [76, 30], [30, 38], [98, 38]]) FORM.ball(g, x, y, 16, .26); }, // 145 パセリ：ふさごとのもこもこ
  carrotTop(g) { FORM.lin(g, 0, 14, 0, 120, [[0, 'rgba(225,255,200,.3)'], [.5, W0], [1, 'rgba(10,45,15,.3)']]); }, // 146 にんじんの葉：先が明るい
  dandelion(g) { FORM.ball(g, 64, 40, 27, .3); FORM.ball(g, 64, 40, 12, .4); FORM.lin(g, 20, 60, 108, 120, [[0, 'rgba(220,255,190,.25)'], [.5, W0], [1, 'rgba(10,45,15,.25)']]); }, // 147 タンポポ：花のふくらみ・花心のもりあがり
  apple(g) { FORM.ball(g, 64, 74, 46, .22); FORM.lin(g, 0, 36, 0, 60, [[0, 'rgba(90,10,10,.25)'], [1, D0]]); g.fillStyle = 'rgba(255,225,150,.16)'; for (let i = 0; i < 9; i++) g.fillRect(38 + i * 6.5, 84 + (i % 3) * 5, 1.6, 9); }, // 148 りんご：丸み・へたのくぼみのかげ・皮のすじ
  strawberry(g) { FORM.ball(g, 62, 76, 44, .3); FORM.spec(g, 44, 66, 5, 10, -.5, .3); }, // 149 いちご
  banana(g) { FORM.lin(g, 30, 40, 70, 110, [[0, 'rgba(255,255,235,.4)'], [.4, W0], [.6, D0], [1, 'rgba(140,90,10,.34)']]); g.strokeStyle = 'rgba(150,100,20,.35)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(32, 40); g.quadraticCurveTo(42, 98, 104, 95); g.stroke(); g.fillStyle = 'rgba(60,40,20,.5)'; g.fillRect(101, 92, 7, 5); }, // 150 バナナ：面の光とかげ・りょう線・先の黒
  pineapple(g) { FORM.ball(g, 64, 82, 38, .3); g.fillStyle = 'rgba(255,240,170,.28)'; for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(46 + i * 12 + (j % 2) * 6, 58 + j * 12, 2, 0, Math.PI * 2); g.fill(); } FORM.lin(g, 30, 4, 98, 48, [[0, 'rgba(220,255,190,.3)'], [1, 'rgba(10,45,15,.2)']]); }, // 151 パイナップル：胴の丸み・うろこの芽
  carrot(g) { FORM.lin(g, 40, 0, 88, 0, [[0, 'rgba(255,240,210,.34)'], [.4, W0], [.62, D0], [1, 'rgba(120,45,5,.34)']]); FORM.spec(g, 53, 66, 3, 16, .1, .28); }, // 152 にんじん：円すいの丸み
  papaya(g) { FORM.ball(g, 64, 70, 44, .2); g.save(); g.translate(64, 70); g.rotate(-.35); g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 32, 20, 0, Math.PI * 1.05, Math.PI * 1.7); g.stroke(); g.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 9; i++) g.fillRect(-15 + i * 3.6, -1.6 + (i % 2) * 4.6, 1.3, 1.3); g.restore(); }, // 153 パパイヤ：果肉のみずみずしさ・たねのつや
  alfalfa(g) { FORM.lin(g, 0, 20, 0, 116, [[0, 'rgba(240,255,220,.28)'], [.5, W0], [1, 'rgba(20,50,20,.32)']]); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(51, 76, 26, 2.2); }, // 154 アルファルファ
  clover(g) { for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; FORM.ball(g, 64 + Math.cos(a) * 20, 60 + Math.sin(a) * 20, 22, .24); } g.strokeStyle = 'rgba(210,245,190,.5)'; g.lineWidth = 1.4; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; g.beginPath(); g.moveTo(64 + Math.cos(a) * 6, 60 + Math.sin(a) * 6); g.lineTo(64 + Math.cos(a) * 30, 60 + Math.sin(a) * 30); g.stroke(); } }, // 155 四つ葉：葉のふくらみと葉脈
  mugIcon(g) { FORM.lin(g, 30, 0, 86, 0, [[0, 'rgba(120,95,70,.2)'], [.25, 'rgba(255,255,255,.3)'], [.6, W0], [1, 'rgba(120,95,70,.26)']]); FORM.spec(g, 50, 35, 12, 2, 0, .3); }, // 156 マグカップ：横の丸み・コーヒーの面の光
  chalflag(g) { FORM.lin(g, 66, 0, 118, 0, [[0, 'rgba(90,10,10,.25)'], [.3, 'rgba(255,255,255,.2)'], [.6, 'rgba(90,10,10,.16)'], [1, 'rgba(255,255,255,.14)']]); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(59.5, 16, 2, 100); }, // 157 旗：はためきの波・さおの光
  pomseed(g) { g.save(); g.translate(64, 70); for (const [x, y, r] of [[-22, 14, -.5], [0, 18, .1], [22, 12, .6], [-10, -4, -.2], [12, -6, .4], [0, -22, 0]]) { g.save(); g.translate(x, y); g.rotate(r); FORM.spec(g, -4, -7, 2.2, 7, 0, .3); g.restore(); } g.restore(); }, // 158 ひまわりの種：からのつや
  choco(g) { g.save(); g.translate(64, 66); g.rotate(-.3); for (const bx of [-6, 14]) for (const by of [-26, 0]) { g.fillStyle = 'rgba(255,220,180,.2)'; g.fillRect(bx + 2, by + 2, 20, 2.5); g.fillRect(bx + 2, by + 2, 2.5, 22); g.fillStyle = 'rgba(20,8,0,.25)'; g.fillRect(bx + 2, by + 21, 20, 2.5); }
    const fg = g.createLinearGradient(-40, -26, -6, 26); fg.addColorStop(0, 'rgba(255,255,255,.5)'); fg.addColorStop(.4, W0); fg.addColorStop(.55, 'rgba(255,255,255,.3)'); fg.addColorStop(1, 'rgba(60,70,80,.25)'); g.fillStyle = fg; g.fillRect(-40, -26, 34, 52); g.restore(); }, // 159 チョコ：1 かけごとの面取り・銀紙のしわの光
  onion(g) { FORM.ball(g, 64, 78, 37, .34); FORM.spec(g, 48, 64, 5, 11, -.5, .3); }, // 160 玉ねぎ：皮のつや
  chips(g) { FORM.lin(g, 28, 0, 100, 0, [[0, 'rgba(120,70,10,.22)'], [.2, 'rgba(255,255,255,.3)'], [.45, W0], [.7, 'rgba(255,255,255,.14)'], [1, 'rgba(120,70,10,.28)']]); g.strokeStyle = 'rgba(120,70,10,.25)'; g.lineWidth = 1.2; for (const x of [34, 44, 54, 64, 74, 84, 94]) { g.beginPath(); g.moveTo(x, 17); g.lineTo(x, 27); g.moveTo(x + 1, 107); g.lineTo(x + 1, 115); g.stroke(); } }, // 161 ポテチ：ふくろのふくらみ・上下のとじ目
  hanko(g) { FORM.ball(g, 64, 64, 50, .16); }, // 162 ハンコ：紙の丸み（文字は読めるまま）
};
const ITEM_NOSHADE = ['goldhay', 'planeBack', 'plane', 'hanko', 'memo']; /* 自分で色を重ねている物・紙のように平らな物には、陰影を足さない */
function buildItemSprites() {
  /* 2026-11-15：アイテムの絵を 2 倍の細かさで作る（128 → 256）。スマホの細かい画面で、近くのアイテムがぼやけていた。絵のメモリが足りない端末（CANVAS_LOW）は今までどおり。
     あわせて、のっぺりした面にうすい陰影（左上が明るく、右下が少し暗い）を重ねて、丸みを出す */
  const IK = typeof CANVAS_LOW !== 'undefined' && CANVAS_LOW ? 1 : 2;
  for (const k in DRAW_ITEM) { const c = mk(128 * IK); const g = c.getContext('2d') || noCtx(); g.lineJoin = 'round'; g.save(); g.scale(IK, IK); DRAW_ITEM[k](g); { const fk = k === 'goldhay' ? 'hay' : k; if (ITEM_FORM[fk]) { g.globalCompositeOperation = 'source-atop'; g.lineJoin = 'round'; try { ITEM_FORM[fk](g); } catch (e) { } g.globalCompositeOperation = 'source-over'; } } g.restore();
    if (!ITEM_NOSHADE.includes(k)) { g.save(); g.globalCompositeOperation = 'source-atop'; const sh = g.createLinearGradient(c.width * .2, c.height * .1, c.width * .8, c.height * .95); sh.addColorStop(0, 'rgba(255,255,255,.16)'); sh.addColorStop(.45, 'rgba(255,255,255,0)'); sh.addColorStop(.6, 'rgba(40,24,10,0)'); sh.addColorStop(1, 'rgba(40,24,10,.17)'); g.fillStyle = sh; g.fillRect(0, 0, c.width, c.height); g.restore(); }
    SPR[k] = c; try { SPR_URL[k] = c.toDataURL(); } catch (e) { SPR_URL[k] = ''; } }
  // NG badge over bad foods
  for (const k of BADS) { const c = mk(128 * IK); const g = c.getContext('2d') || noCtx(); g.drawImage(SPR[k], 0, 0); g.scale(IK, IK); ell(g, 100, 24, 20, 20, 0, '#C8463C', '#FBF6EE', 4);
    g.strokeStyle = '#FBF6EE'; g.lineWidth = 6; g.beginPath(); g.moveTo(91, 15); g.lineTo(109, 33); g.moveTo(109, 15); g.lineTo(91, 33); g.stroke(); SPR[k + 'NG'] = c; }
}

