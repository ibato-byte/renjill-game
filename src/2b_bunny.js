/* ================= the bunnies =================
   Sitting, quadruped rabbits like the series art: Ren (Holland Lop, tall face, huge lop ears, yellow tie)
   and Jill (Netherland Dwarf, round face, pink upright ears, round glasses, ID badge).
   Every pose is pre-rendered once with soft fur strokes, then drawn as an image. */
const BS = 300;            // sprite canvas width; ground line at y = 282 (below the headroom)
const BTOP = 64;           // headroom above the 300px box so tall hats (wizard, Santa, antlers) are never cut off
const GROUND_Y = 282;
const PAL = {
  ren:  { a: '#DDB68C', b: '#BE9369', c: '#9C7652', ear: ['#B48D67', '#8E6B4C'], cream: '#F5EBDD' },
  jill: { a: '#E3C29C', b: '#C9A176', c: '#A88259', ear: ['#D4AE84', '#AE885F'], cream: '#F7EEE2' },
  // Pom: a kinkuma (golden) Syrian hamster: pale cream fur, a warmer apricot back, rounded grey-brown ears with pink insides, pink paws
  pom:  { a: '#F3E3CA', b: '#DCC29E', back: '#EBCDA2', ear: ['#9A8478', '#EBAAA4'], cream: '#FAF1E4' },
};
/* ---- the closet: what each bunny is wearing while its sprites are painted ---- */
const WEAR = { ren: { tie: 'gold', hat: '', suit: '' }, jill: { frame: 'brown', hat: '', suit: '' } };
/* ---- costumes from the shop: a striped onesie over the body, plus a little extra (wings, antennae, mane, tail) ---- */
function suitOver(g, kind, cx, cy, rx, ry) {
  const ex = rx * .94, ey = ry * .94;
  g.save(); g.beginPath(); g.ellipse(cx, cy, ex, ey, 0, 0, Math.PI * 2); g.clip();
  if (kind === 'bee') {
    g.fillStyle = '#F4C433'; g.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
    g.fillStyle = '#2E2622'; const h = ry * .26;
    for (const k of [-1.15, -.45, .25, .95]) { const y = cy + k * ry; g.beginPath(); g.moveTo(cx - rx, y); g.quadraticCurveTo(cx, y + ry * .16, cx + rx, y); g.lineTo(cx + rx, y + h); g.quadraticCurveTo(cx, y + h + ry * .16, cx - rx, y + h); g.closePath(); g.fill(); }
  } else if (kind === 'zebra') {
    g.fillStyle = '#F7F4EE'; g.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
    g.fillStyle = '#272321';
    for (let k = 0; k < 6; k++) for (const sd of [-1, 1]) { // tapered stripes reaching in from both sides, like a real coat
      const y = cy - ry * .95 + k * ry * .36 + (sd > 0 ? ry * .1 : 0), w = ry * (.15 + (k % 2) * .04), reach = rx * (.55 + ((k * 7) % 3) * .12);
      g.beginPath(); g.moveTo(cx + sd * rx, y - w); g.quadraticCurveTo(cx + sd * (rx - reach * .5), y - w * .6 + ry * .06, cx + sd * (rx - reach), y + ry * .1);
      g.quadraticCurveTo(cx + sd * (rx - reach * .5), y + w * .9 + ry * .06, cx + sd * rx, y + w); g.closePath(); g.fill(); }
    g.fillRect(cx - rx * .05, cy - ry, rx * .1, ry * .3); // the stripe down the spine
  }
  const sh = g.createRadialGradient(cx - rx * .3, cy - ry * .45, rx * .1, cx, cy, rx * 1.05); sh.addColorStop(0, 'rgba(255,255,255,.28)'); sh.addColorStop(.6, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(40,25,15,.28)');
  g.fillStyle = sh; g.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
  g.restore();
  g.strokeStyle = 'rgba(60,40,25,.28)'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy, ex, ey, 0, 0, Math.PI * 2); g.stroke();
}
function beeWings(g, cx, cy, s, flap) {
  for (const sd of [-1, 1]) { g.save(); g.translate(cx + sd * 22 * s, cy); g.rotate(sd * (1.0 + flap)); 
    for (const [w, h, y, a] of [[34, 62, -58, 0], [22, 38, -26, .55]]) { g.save(); g.rotate(sd * a); g.beginPath(); g.ellipse(0, y * s, w * s, h * s, 0, 0, Math.PI * 2);
      g.fillStyle = 'rgba(232,244,255,.78)'; g.fill(); g.strokeStyle = 'rgba(120,150,180,.85)'; g.lineWidth = 2; g.stroke();
      g.strokeStyle = 'rgba(140,170,200,.55)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, (y + h * .8) * s); g.lineTo(0, (y - h * .7) * s); g.moveTo(0, y * s); g.lineTo(sd * w * .6 * s, (y - h * .4) * s); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(-w * .3 * s, (y - h * .35) * s, w * .18 * s, h * .22 * s, -.3, 0, Math.PI * 2); g.fill(); g.restore(); }
    g.restore(); }
}
function antennae(g, x, y, s) {
  g.strokeStyle = '#2E2622'; g.lineWidth = 3.2 * s; g.lineCap = 'round';
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(x + sd * 14 * s, y); g.quadraticCurveTo(x + sd * 18 * s, y - 30 * s, x + sd * 32 * s, y - 40 * s); g.stroke();
    g.fillStyle = '#2E2622'; g.beginPath(); g.arc(x + sd * 33 * s, y - 42 * s, 7 * s, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F4C433'; g.beginPath(); g.arc(x + sd * 33 * s, y - 42 * s, 3.6 * s, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = '#2E2622'; g.lineWidth = 5 * s; g.beginPath(); g.moveTo(x - 20 * s, y + 4 * s); g.quadraticCurveTo(x, y - 6 * s, x + 20 * s, y + 4 * s); g.stroke(); // the headband
}
function zebraMane(g, x, y, len, s) { // a short upright mane, black and white
  for (let k = 0; k < 7; k++) { const t = k / 6, yy = y + t * len; g.fillStyle = k % 2 ? '#F7F4EE' : '#272321'; g.beginPath(); g.ellipse(x, yy, 7 * s, 9 * s, 0, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 7 * s, y); g.lineTo(x - 7 * s, y + len); g.stroke();
}
function zebraTail(g, x, y, ph) {
  const sw = Math.sin(ph * 2) * 10; g.lineCap = 'round';
  g.strokeStyle = '#F7F4EE'; g.lineWidth = 7; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sw * .5, y + 16, x + sw, y + 30); g.stroke();
  g.strokeStyle = '#272321'; g.lineWidth = 7; g.setLineDash([5, 5]); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sw * .5, y + 16, x + sw, y + 30); g.stroke(); g.setLineDash([]);
  g.fillStyle = '#272321'; g.beginPath(); g.ellipse(x + sw, y + 38, 8, 12, sw * .02, 0, Math.PI * 2); g.fill();
}
const TIE_COL = { gold: ['#D6A23C', '#A97A1E', '#E0AE48'], red: ['#C8463C', '#8E2E27', '#D95A4F'], navy: ['#2F4F7F', '#1E3556', '#3E6AA6'], green: ['#3E8E5A', '#2B6540', '#55A872'], sakura: ['#F2A7BD', '#C97490', '#F7C6D5'] };
const FRAME_COL = { brown: '#9C7A52', red: '#C8463C', gold: '#C9962F', navy: '#2F4F7F', pink: '#E86A75' };
// hats drawn with the origin at the top of the head (y grows down)
function hat(g, kind, w) {
  w = w || 1;
  if (kind === 'mug') { mugHat(g, 0); return; }
  if (kind === 'beret') { g.save(); g.scale(w, w); g.fillStyle = '#C8463C'; g.beginPath(); g.ellipse(4, -8, 46, 18, -.12, 0, Math.PI * 2); g.fill(); g.fillStyle = '#A8352C'; g.beginPath(); g.ellipse(0, 2, 40, 9, 0, 0, Math.PI); g.fill(); g.fillStyle = '#7A241E'; g.fillRect(4, -30, 4, 8); g.restore(); return; }
  if (kind === 'straw') { g.save(); g.scale(w, w); g.fillStyle = '#E8D28A'; g.beginPath(); g.ellipse(0, 0, 70, 14, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#C9B06A'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#EFDB98'; g.beginPath(); g.roundRect ? g.roundRect(-36, -34, 72, 36, [20, 20, 6, 6]) : g.rect(-36, -34, 72, 36); g.fill(); g.stroke(); g.fillStyle = '#2F4F7F'; g.fillRect(-36, -12, 72, 8); g.restore(); return; }
  if (kind === 'santa') { g.save(); g.scale(w, w); g.fillStyle = '#C8463C'; g.beginPath(); g.moveTo(-40, 0); g.quadraticCurveTo(-30, -50, 10, -62); g.quadraticCurveTo(40, -70, 52, -50); g.quadraticCurveTo(30, -52, 20, -30); g.quadraticCurveTo(30, -10, 40, 0); g.closePath(); g.fill();
    g.fillStyle = '#FBF6EE'; g.beginPath(); g.ellipse(0, 0, 46, 10, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(54, -50, 9, 0, Math.PI * 2); g.fill(); g.restore(); return; }
  if (kind === 'crown') { g.save(); g.scale(w, w); g.fillStyle = '#F2C230'; g.strokeStyle = '#B08A3E'; g.lineWidth = 2; g.beginPath(); g.moveTo(-34, 0); g.lineTo(-38, -34); g.lineTo(-20, -16); g.lineTo(0, -40); g.lineTo(20, -16); g.lineTo(38, -34); g.lineTo(34, 0); g.closePath(); g.fill(); g.stroke();
    for (const [x, c] of [[-20, '#C8463C'], [0, '#4E77A0'], [20, '#5F9E5A']]) { g.fillStyle = c; g.beginPath(); g.arc(x, -8, 4, 0, Math.PI * 2); g.fill(); } g.restore(); return; }
  if (kind === 'ribbon') { g.save(); g.scale(w, w); g.translate(26, -8); g.fillStyle = '#E86A75'; g.beginPath(); g.ellipse(-14, 0, 14, 9, -.4, 0, Math.PI * 2); g.ellipse(14, 0, 14, 9, .4, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C8463C'; g.beginPath(); g.arc(0, 0, 5, 0, Math.PI * 2); g.fill(); g.restore(); return; }
  if (kind === 'witch') { g.save(); g.scale(w, w); // a soft, slightly bent wizard hat with a gold band and a little star
    g.fillStyle = '#3B3350'; g.beginPath(); g.ellipse(0, 0, 58, 13, 0, 0, Math.PI * 2); g.fill();
    const gr = g.createLinearGradient(-30, 0, 30, -80); gr.addColorStop(0, '#2E2842'); gr.addColorStop(1, '#5A4E7E'); g.fillStyle = gr;
    g.beginPath(); g.moveTo(-32, -4); g.quadraticCurveTo(-14, -44, 4, -78); g.quadraticCurveTo(16, -92, 40, -84); g.quadraticCurveTo(22, -78, 18, -60); g.quadraticCurveTo(26, -30, 32, -4); g.closePath(); g.fill();
    g.fillStyle = '#E0A93A'; g.beginPath(); g.moveTo(-31, -8); g.quadraticCurveTo(0, -16, 31, -8); g.lineTo(30, -18); g.quadraticCurveTo(0, -26, -28, -18); g.closePath(); g.fill();
    g.fillStyle = '#F6D36B'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4 : 9; g.lineTo(-6 + Math.cos(a) * r, -44 + Math.sin(a) * r); } g.closePath(); g.fill();
    g.restore(); return; }
  if (kind === 'pumpkin') { g.save(); g.scale(w, w); // a little pumpkin worn like a cap, with a leaf
    for (const [x, rx, c] of [[-20, 18, '#D9661C'], [20, 18, '#D9661C'], [-8, 18, '#EE8526'], [8, 18, '#EE8526'], [0, 15, '#F59A3A']]) { g.fillStyle = c; g.beginPath(); g.ellipse(x, -18, rx, 20, 0, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = 'rgba(140,60,10,.35)'; g.lineWidth = 2; for (const x of [-12, 12]) { g.beginPath(); g.moveTo(x, -36); g.quadraticCurveTo(x * 1.3, -18, x, 0); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(-10, -28, 7, 4, -.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#6B4E2A'; g.beginPath(); g.moveTo(-3, -36); g.quadraticCurveTo(-2, -48, 6, -50); g.lineTo(5, -45); g.quadraticCurveTo(2, -44, 3, -36); g.closePath(); g.fill();
    g.fillStyle = '#5F9E5A'; g.beginPath(); g.ellipse(14, -42, 10, 5, -.5, 0, Math.PI * 2); g.fill(); g.restore(); return; }
  if (kind === 'antler') { g.save(); g.scale(w, w); // a soft reindeer-antler headband with a little bell
    g.strokeStyle = '#7A4E2C'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-44, 2); g.quadraticCurveTo(0, -16, 44, 2); g.stroke();
    for (const sd of [-1, 1]) { g.save(); g.scale(sd, 1); g.strokeStyle = '#B07A45'; g.lineWidth = 8; g.beginPath(); g.moveTo(24, -6); g.quadraticCurveTo(34, -36, 26, -60); g.moveTo(30, -30); g.quadraticCurveTo(46, -38, 50, -52); g.moveTo(28, -46); g.quadraticCurveTo(16, -54, 14, -64); g.stroke(); g.restore(); }
    g.fillStyle = '#E0A93A'; g.beginPath(); g.arc(0, -4, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C8463C'; g.beginPath(); g.ellipse(-9, -6, 6, 3, -.4, 0, Math.PI * 2); g.ellipse(9, -6, 6, 3, .4, 0, Math.PI * 2); g.fill(); g.restore(); return; }
  if (kind === 'kagami') { g.save(); g.scale(w, w); // a tiny kagami-mochi (two rice cakes and a bitter orange) on a paper base
    g.fillStyle = '#FBF6EE'; g.strokeStyle = '#C8463C'; g.lineWidth = 2; g.beginPath(); g.moveTo(-34, 0); g.lineTo(34, 0); g.lineTo(28, -8); g.lineTo(-28, -8); g.closePath(); g.fill(); g.stroke();
    for (const [y, rx, ry] of [[-18, 30, 12], [-36, 23, 10]]) { const gr = g.createRadialGradient(-8, y - 4, 2, 0, y, rx); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, '#E8E1D2'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#F09A2A'; g.beginPath(); g.arc(0, -52, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = '#5F9E5A'; g.beginPath(); g.ellipse(8, -62, 8, 4, -.5, 0, Math.PI * 2); g.fill(); g.restore(); return; }
  if (kind === 'sakura') { g.save(); g.scale(w, w); g.translate(24, -6); // a cherry-blossom hair clip
    for (const [x, y, s] of [[0, 0, 1], [-18, 6, .7], [14, 10, .6]]) { g.save(); g.translate(x, y); g.scale(s, s); for (let i = 0; i < 5; i++) { g.rotate(Math.PI * 2 / 5); g.fillStyle = '#F7C6D3'; g.beginPath(); g.ellipse(0, -10, 7, 10, 0, 0, Math.PI * 2); g.fill(); } g.fillStyle = '#E8879E'; g.beginPath(); g.arc(0, 0, 4, 0, Math.PI * 2); g.fill(); g.restore(); } g.restore(); return; }
  if (kind === 'heartband') { g.save(); g.scale(w, w); g.strokeStyle = '#C8463C'; g.lineWidth = 5; g.beginPath(); g.moveTo(-42, 2); g.quadraticCurveTo(0, -14, 42, 2); g.stroke();
    for (const sd of [-1, 1]) { g.save(); g.translate(sd * 22, -34); g.strokeStyle = '#9E2B3A'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 26); g.lineTo(0, 8); g.stroke(); g.fillStyle = '#E8465E'; g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(-14, -6, -6, -18, 0, -9); g.bezierCurveTo(6, -18, 14, -6, 0, 6); g.fill(); g.restore(); } g.restore(); return; }
  if (kind === 'starband') { g.save(); g.scale(w, w); g.strokeStyle = '#355F86'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(-46, 2); g.quadraticCurveTo(0, -12, 46, 2); g.stroke();
    g.fillStyle = '#F2C230'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 6 : 14; g.lineTo(Math.cos(a) * r, -10 + Math.sin(a) * r); } g.closePath(); g.fill(); g.restore(); return; }
  if (kind === 'helmet') { g.save(); g.scale(w, w); g.fillStyle = '#F2C230'; g.beginPath(); g.ellipse(0, -8, 52, 30, 0, Math.PI, 0); g.fill(); g.fillStyle = '#D9A21B'; g.fillRect(-56, -10, 112, 7); g.fillStyle = '#FBF6EE'; g.fillRect(-4, -36, 8, 26); g.restore(); return; }
}
let SEED = 1; const srand = () => (SEED = (SEED * 16807) % 2147483647) / 2147483647;
function shade(hex, k) { const c = hexRgb(hex); return `rgb(${clamp(c[0] * k, 0, 255) | 0},${clamp(c[1] * k, 0, 255) | 0},${clamp(c[2] * k, 0, 255) | 0})`; }
// a soft, furry ellipse: gradient, inner strokes, fluffy rim
function shapePath(g, rx, ry, o) { g.beginPath(); if (o.rr) { const r = Math.min(rx, ry) * o.rr; g.roundRect ? g.roundRect(-rx, -ry, rx * 2, ry * 2, [r * 1.1, r * 1.1, r * 1.35, r * 1.35]) : g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); } else g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); }
// a soft, furry shape: gradient, fine inner strands, a short soft fringe
function fur(g, cx, cy, rx, ry, rot, cIn, cOut, o) {
  o = o || {};
  g.save(); g.translate(cx, cy); g.rotate(rot || 0);
  const gr = o.vert ? g.createLinearGradient(0, -ry, 0, ry) : g.createRadialGradient(-rx * .2, -ry * .3, Math.min(rx, ry) * .1, 0, 0, Math.max(rx, ry) * 1.08);
  gr.addColorStop(0, cIn); gr.addColorStop(1, cOut);
  // soft fringe first (slightly larger, blurred)
  g.save(); try { g.filter = 'blur(1.6px)'; } catch (e) { } shapePath(g, rx + 1.5, ry + 1.5, o); g.fillStyle = cOut; g.globalAlpha = .55; g.fill(); g.restore();
  shapePath(g, rx, ry, o); g.fillStyle = gr; g.fill();
  g.save(); shapePath(g, rx, ry, o); g.clip();
  const n = Math.round(rx * ry * Math.PI / (o.sparse ? 30 : 16));
  g.lineCap = 'round'; g.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    const x = (srand() * 2 - 1) * rx, y = (srand() * 2 - 1) * ry;
    const ang = Math.PI / 2 + (x / rx) * .5 + (srand() - .5) * .35 + (o.flow || 0);
    const Ln = 3 + srand() * 5;
    g.strokeStyle = srand() < .5 ? 'rgba(255,250,240,.13)' : 'rgba(90,60,36,.07)';
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * Ln, y + Math.sin(ang) * Ln); g.stroke();
  }
  // gentle shading toward the bottom edge
  const sh = g.createLinearGradient(0, -ry, 0, ry); sh.addColorStop(0, 'rgba(255,255,255,.06)'); sh.addColorStop(.6, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(70,45,25,.14)');
  g.fillStyle = sh; g.fillRect(-rx - 2, -ry - 2, rx * 2 + 4, ry * 2 + 4);
  g.restore();
  // very short fringe hairs
  const m = Math.round((rx + ry) * 1.2);
  g.strokeStyle = cOut; g.globalAlpha = .45; g.lineWidth = 1;
  for (let i = 0; i < m; i++) {
    const tt = i / m * Math.PI * 2; const x = Math.cos(tt) * rx, y = Math.sin(tt) * ry;
    if (o.rr && Math.abs(Math.cos(tt)) > .7 && Math.abs(Math.sin(tt)) > .7) continue;
    const L2 = .8 + srand() * (o.rim || 1.8);
    g.beginPath(); g.moveTo(x * .985, y * .985); g.lineTo(x + Math.cos(tt) * L2, y + Math.sin(tt) * L2); g.stroke();
  }
  g.globalAlpha = 1; g.restore();
}
function blob(g, cx, cy, rx, ry, rot, fill, alpha) { g.save(); g.globalAlpha = alpha == null ? 1 : alpha; g.beginPath(); g.ellipse(cx, cy, rx, ry, rot || 0, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); g.restore(); }
function whiskers(g, cx, cy, spread, len) {
  g.strokeStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 1.4; g.lineCap = 'round';
  for (const sd of [-1, 1]) for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(cx + sd * spread, cy + k * 3); g.quadraticCurveTo(cx + sd * (spread + len * .5), cy + k * 5 - 2, cx + sd * (spread + len), cy + k * 9); g.stroke(); }
}
function eyes(g, who, x1, x2, y, r, mood) {
  if (mood === 'sick') { // dizzy swirls, a little drooped
    g.strokeStyle = '#3A2216'; g.lineWidth = r * .22; g.lineCap = 'round';
    for (const x of [x1, x2]) { g.beginPath(); for (let k = 0; k <= 40; k++) { const a = k / 40 * Math.PI * 4.2, rr = r * .95 * k / 40; g.lineTo(x + Math.cos(a) * rr, y + 2 + Math.sin(a) * rr * .9); } g.stroke(); }
    return;
  }
  if (mood === 'worry') { // eyebrows tilted up in the middle, eyes looking up a little
    g.strokeStyle = '#5A3A26'; g.lineWidth = r * .28; g.lineCap = 'round';
    for (const [x, sd] of [[x1, 1], [x2, -1]]) { g.beginPath(); g.moveTo(x - sd * r * .9, y - r * 1.35); g.lineTo(x + sd * r * .7, y - r * 1.85); g.stroke(); }
    mood = 'open';
  }
  if (mood === 'cheer') mood = 'happy';
  if (mood === 'sleepy' || mood === 'yawn') { // heavy lids: the eye, then a lid of fur over its top half
    for (const x of [x1, x2]) { g.fillStyle = who === 'ren' ? '#3E2216' : '#07090C'; g.beginPath(); g.ellipse(x, y + r * .25, r * .95, r * .7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = who === 'ren' ? '#E9CAA2' : who === 'pom' ? '#E8C79A' : '#EBCDA8'; g.beginPath(); g.ellipse(x, y - r * .35, r * 1.1, r * .62, 0, 0, Math.PI); g.fill(); g.strokeStyle = '#3A2216'; g.lineWidth = r * .18; g.lineCap = 'round'; g.beginPath(); g.arc(x, y - r * .35, r * .95, Math.PI * .08, Math.PI * .92); g.stroke(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x - r * .25, y + r * .1, r * .14, 0, Math.PI * 2); g.fill(); }
    return;
  }
  if (mood === 'happy' || mood === 'blink') {
    g.strokeStyle = '#3A2216'; g.lineWidth = r * .5; g.lineCap = 'round';
    for (const x of [x1, x2]) { g.beginPath(); if (mood === 'happy') g.arc(x, y + r * .4, r * .85, Math.PI * 1.15, Math.PI * 1.85); else { g.moveTo(x - r, y + 1); g.quadraticCurveTo(x, y + r * .5, x + r, y + 1); } g.stroke(); }
    return;
  }
  const ren = who === 'ren';
  for (const [x, i] of [[x1, 0], [x2, 1]]) {
    if (mood === 'wink' && i === 1) { g.strokeStyle = '#3A2216'; g.lineWidth = r * .5; g.lineCap = 'round'; g.beginPath(); g.arc(x, y + r * .4, r * .8, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); continue; }
    if (!ren) { // Jill: big glossy black button eyes, a large soft highlight up and to the left, a pin of light low right, a faint sheen along the bottom
      const gr = g.createRadialGradient(x + r * .25, y + r * .35, r * .05, x, y, r * 1.02);
      gr.addColorStop(0, '#1A2029'); gr.addColorStop(.55, '#07090C'); gr.addColorStop(1, '#000000');
      g.beginPath(); g.ellipse(x, y, r, r * 1.02, 0, 0, Math.PI * 2); g.fillStyle = gr; g.fill();
      g.strokeStyle = 'rgba(150,165,180,.5)'; g.lineWidth = r * .07; g.lineCap = 'round'; g.beginPath(); g.arc(x, y + r * .05, r * .78, Math.PI * .28, Math.PI * .72); g.stroke(); // the sheen
      g.save(); g.translate(x + r * .28, y - r * .3); g.rotate(-.35); g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(0, 0, r * .34, r * .28, 0, 0, Math.PI * 2); g.fill(); g.restore();
      g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(x - r * .35, y + r * .38, r * .12, 0, Math.PI * 2); g.fill();
      if (mood === 'sparkle') { g.fillStyle = '#FFFFFF'; star(g, x + r * .15, y + r * .1, r * .4); }
      continue;
    }
    const gr = g.createRadialGradient(x, y + r * .3, r * .1, x, y, r * 1.05);
    gr.addColorStop(0, '#6A3E26'); gr.addColorStop(.6, '#3E2216'); gr.addColorStop(1, '#1E0F08');
    g.beginPath(); g.ellipse(x, y, r, r * .95, 0, 0, Math.PI * 2); g.fillStyle = gr; g.fill();
    blob(g, x + r * .32, y - r * .36, r * .34, r * .3, 0, '#FFFFFF'); blob(g, x - r * .3, y + r * .38, r * .12, r * .1, 0, 'rgba(255,255,255,.7)');
    if (mood === 'sparkle') { g.fillStyle = '#FFFFFF'; star(g, x + r * .15, y + r * .1, r * .4); }
  }
}
function muzzle(g, x, y, w) { // white fluffy puffs under the nose
  fur(g, x - w * .42, y, w * .55, w * .42, 0, '#FBF6EE', '#E9DCCB', { sparse: 1, rim: 1.4 });
  fur(g, x + w * .42, y, w * .55, w * .42, 0, '#FBF6EE', '#E9DCCB', { sparse: 1, rim: 1.4 });
  fur(g, x, y + w * .42, w * .42, w * .36, 0, '#FBF6EE', '#E9DCCB', { sparse: 1, rim: 1.4 });
}
function star(g, x, y, r) { g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .35 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
function tie(g, x, y, len, flap) {
  g.save(); g.translate(x, y); g.rotate(flap || 0);
  const T = TIE_COL[WEAR.ren.tie] || TIE_COL.gold;
  g.beginPath(); g.moveTo(-8, 0); g.lineTo(8, 0); g.lineTo(5, 11); g.lineTo(-5, 11); g.closePath(); g.fillStyle = T[0]; g.fill(); g.strokeStyle = T[1]; g.lineWidth = 1.5; g.stroke();
  g.beginPath(); g.moveTo(-5, 11); g.lineTo(5, 11); g.lineTo(9, len - 8); g.lineTo(0, len); g.lineTo(-9, len - 8); g.closePath(); g.fillStyle = T[0]; g.fill(); g.stroke();
  tiePattern(g, WEAR.ren.tie, -9, 11, 18, len - 11); g.strokeStyle = T[1]; g.globalAlpha = .6; g.beginPath(); g.moveTo(1, 13); g.lineTo(3, len - 6); g.stroke(); g.globalAlpha = 1;
  g.restore();
}
// Ren's tie blown back by the wind: it comes out from under his chin (behind the head) and streams out to the side
function tiePattern(g, kind, x, y, w, h) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  if (kind === 'red') { g.fillStyle = 'rgba(255,255,255,.75)'; for (let j = 0; j < h; j += 9) for (let i = 0; i < w; i += 9) { g.beginPath(); g.arc(x + i + (j / 9 % 2) * 4, y + j, 1.6, 0, Math.PI * 2); g.fill(); } }
  else if (kind === 'navy') { g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2.2; for (let j = -h; j < h * 2; j += 10) { g.beginPath(); g.moveTo(x - 4, y + j); g.lineTo(x + w + 4, y + j + w + 8); g.stroke(); } }
  else if (kind === 'sakura') { g.fillStyle = 'rgba(255,255,255,.8)'; for (let j = 4; j < h; j += 12) { const cx = x + w / 2 + ((j / 12) % 2 ? 4 : -4); for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(cx + Math.cos(k * 1.257) * 3, y + j + Math.sin(k * 1.257) * 3, 1.5, 0, Math.PI * 2); g.fill(); } } }
  g.restore();
}
function windTie(g, x, y, p) {
  const T = TIE_COL[WEAR.ren.tie] || TIE_COL.gold;
  const ph = p.tiePh || 0, lift = p.slide ? .35 : p.air ? -.35 : 0;
  const N = 18, len = 104, pts = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, a = .45 + lift - u * 1.05;
    const wave = Math.sin(ph * 2 - u * 6.5) * 8 * u * u;
    const px = x + Math.cos(a) * len * u * .95, py = y + Math.sin(a) * len * u * .5 + wave;
    pts.push([px, py, u]);
  }
  const wAt = u => u < .12 ? 4 + u * 30 : u > .9 ? 8.2 * (1 - u) / .1 : 8.2;
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const [px, py, u] = pts[i], q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)];
    const dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, w = wAt(u);
    L.push([px + nx * w, py + ny * w]); R.push([px - nx * w, py - ny * w]);
  }
  g.beginPath(); g.moveTo(L[0][0], L[0][1]); for (const q of L) g.lineTo(q[0], q[1]); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath();
  const gr = g.createLinearGradient(x, y - 10, x + len, y + 20); gr.addColorStop(0, T[0]); gr.addColorStop(.5, T[2]); gr.addColorStop(1, T[0]);
  g.fillStyle = gr; g.fill(); g.strokeStyle = T[1]; g.lineWidth = 1.6; g.stroke(); g.save(); g.clip(); tiePattern(g, WEAR.ren.tie, x - 10, y - 60, len + 20, 140); g.restore();
  g.strokeStyle = T[1]; g.globalAlpha = .55; g.lineWidth = 1.2; g.beginPath(); pts.slice(2, -2).forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.stroke(); g.globalAlpha = 1;
}
function glasses(g, x1, x2, y, r) {
  g.strokeStyle = FRAME_COL[WEAR.jill.frame] || FRAME_COL.brown; g.lineWidth = 1.7;
  g.beginPath(); g.arc(x1, y, r, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(x2, y, r, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(x1 + r, y - 2); g.quadraticCurveTo((x1 + x2) / 2, y - 6, x2 - r, y - 2); g.stroke();
  g.beginPath(); g.moveTo(x1 - r, y - 3); g.lineTo(x1 - r - 20, y - 8); g.moveTo(x2 + r, y - 3); g.lineTo(x2 + r + 20, y - 8); g.stroke();
  g.fillStyle = 'rgba(255,246,232,.10)'; g.beginPath(); g.arc(x1, y, r - 1.2, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(x2, y, r - 1.2, 0, Math.PI * 2); g.fill();
}
function moodFx(g, mood, top, side) { // drawn over the face for the unwell / worried looks
  if (mood === 'sick') { g.save(); g.globalAlpha = .55; g.strokeStyle = '#6A7FB8'; g.lineWidth = 3; g.lineCap = 'round'; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 12, top); g.lineTo(k * 12, top + 22 - Math.abs(k) * 4); g.stroke(); }
    const gl = g.createLinearGradient(0, top - 6, 0, top + 34); gl.addColorStop(0, 'rgba(110,140,200,.22)'); gl.addColorStop(1, 'rgba(110,140,200,0)'); g.fillStyle = gl; g.fillRect(-side, top - 6, side * 2, 40); g.restore(); }
  if (mood === 'sick' || mood === 'worry') { g.save(); g.fillStyle = 'rgba(150,205,240,.95)'; g.strokeStyle = 'rgba(70,130,180,.8)'; g.lineWidth = 1.5; const x = side * .78, y = top + 6;
    g.beginPath(); g.moveTo(x, y - 12); g.quadraticCurveTo(x + 9, y + 2, x, y + 7); g.quadraticCurveTo(x - 9, y + 2, x, y - 12); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(x - 2, y + 1, 2, 0, Math.PI * 2); g.fill(); g.restore(); }
}
function mouth(g, x, y, w, open) {
  g.strokeStyle = '#7A4A40'; g.lineWidth = 2; g.lineCap = 'round';
  if (open === 'w') { // the little ω under the nose, as in the original drawings
    g.strokeStyle = '#8A5A50'; g.lineWidth = Math.max(1.6, w * .22); g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y - w * .35); g.lineTo(x, y); g.stroke();
    g.beginPath(); g.arc(x - w * .42, y, w * .42, Math.PI * .05, Math.PI * .95); g.moveTo(x + w * .84, y); g.arc(x + w * .42, y, w * .42, Math.PI * .05, Math.PI * .95); g.stroke(); return; }
  if (open === 'wavy') { g.strokeStyle = '#8A5A50'; g.lineWidth = 2.4; g.beginPath(); for (let k = 0; k <= 12; k++) { const u = k / 12; g.lineTo(x - w + u * w * 2, y + 2 + Math.sin(u * Math.PI * 3) * 2.6); } g.stroke(); return; }
  if (open === 'o') { g.beginPath(); g.ellipse(x, y + 3, w * .32, w * .4, 0, 0, Math.PI * 2); g.fillStyle = '#9A4E46'; g.fill(); return; }
  if (open === 1) { g.beginPath(); g.ellipse(x, y + 4, w * .45, w * .5, 0, 0, Math.PI); g.fillStyle = '#B5584F'; g.fill(); return; }
  g.strokeStyle = '#9A5A50'; g.lineWidth = 2.4; g.beginPath();
  if (open === 'smile') { g.moveTo(x - w, y); g.quadraticCurveTo(x, y + w * .7, x + w, y); } else { g.moveTo(x - w * .7, y + 1); g.lineTo(x + w * .7, y + 1); }
  g.stroke();
}
// ---- face (front, used for menus and for the look-back) ----
function faceRen(g, cx, cy, sc, mood, mug) {
  const P = PAL.ren; g.save(); g.translate(cx, cy); g.scale(sc, sc);
  // ears first (behind the head), hanging from the top corners
  fur(g, -70, 18, 36, 84, .12, '#B8916B', '#86644A', { vert: 1 }); fur(g, 70, 18, 36, 84, -.12, '#B8916B', '#86644A', { vert: 1 });
  fur(g, 0, -2, 60, 66, 0, '#E9CAA2', '#C49C70', { rr: .62 });
  { const gl = g.createRadialGradient(0, 12, 4, 0, 12, 52); gl.addColorStop(0, 'rgba(255,244,228,.3)'); gl.addColorStop(1, 'rgba(255,244,228,0)'); g.fillStyle = gl; g.beginPath(); g.ellipse(0, 12, 52, 56, 0, 0, Math.PI * 2); g.fill(); }
  // ear roots over the top corners
  g.strokeStyle = 'rgba(120,84,56,.55)'; g.lineWidth = 2.2; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-62, -56); g.quadraticCurveTo(-46, -70, -28, -62); g.moveTo(28, -62); g.quadraticCurveTo(46, -70, 62, -56); g.moveTo(-26, -66); g.quadraticCurveTo(0, -72, 26, -66); g.stroke();
  { const cr = g.createRadialGradient(0, -48, 2, 0, -44, 34); cr.addColorStop(0, 'rgba(246,226,196,.75)'); cr.addColorStop(1, 'rgba(246,226,196,0)'); g.fillStyle = cr; g.beginPath(); g.ellipse(0, -44, 36, 22, 0, 0, Math.PI * 2); g.fill(); } // the paler crown on top of his head
  eyes(g, 'ren', -25, 25, -3, 10.5, mood);
  if (mood !== 'open' && mood !== 'sick' && mood !== 'worry') { blob(g, -40, 18, 12, 7, 0, 'rgba(236,140,140,.38)'); blob(g, 40, 18, 12, 7, 0, 'rgba(236,140,140,.38)'); }
  muzzle(g, 0, 29, 26);
  g.beginPath(); g.moveTo(-7, 18); g.quadraticCurveTo(0, 16, 7, 18); g.lineTo(0, 25); g.closePath(); g.fillStyle = '#E0959A'; g.fill();
  mouth(g, 0, 33, 7, mood === 'sick' ? 'wavy' : mood === 'worry' ? 'o' : mood === 'sparkle' || mood === 'cheer' ? 1 : mood === 'yawn' ? 'o' : mood === 'open' || mood === 'blink' ? 'w' : 'smile');
  whiskers(g, 0, 28, 20, 62); moodFx(g, mood, -48, 58);
  { const hk = mug ? 'mug' : WEAR.ren.hat; if (hk) { g.save(); g.translate(0, -62); hat(g, hk, 1); g.restore(); } else if (WEAR.ren.suit === 'bee') antennae(g, 0, -60, 1); }
  g.restore();
}
function faceJill(g, cx, cy, sc, mood) {
  const P = PAL.jill; g.save(); g.translate(cx, cy); g.scale(sc, sc);
  for (const sd of [-1, 1]) { g.save(); g.translate(sd * 24, -40); g.rotate(sd * .2); fur(g, 0, -22, 16, 30, 0, '#D9B48B', '#B48D64', { vert: 1 }); blob(g, 0, -20, 8, 21, 0, '#EBB1A8'); g.restore(); }
  fur(g, 0, 0, 62, 52, 0, '#EBCDA8', P.b);
  { const gl = g.createRadialGradient(0, 10, 4, 0, 10, 42); gl.addColorStop(0, 'rgba(255,244,228,.26)'); gl.addColorStop(1, 'rgba(255,244,228,0)'); g.fillStyle = gl; g.beginPath(); g.ellipse(0, 10, 44, 38, 0, 0, Math.PI * 2); g.fill(); }
  eyes(g, 'jill', -23, 23, -4, 11, mood);
  glasses(g, -23, 23, -4, 16.5);
  if (mood !== 'open' && mood !== 'sick' && mood !== 'worry') { blob(g, -42, 16, 9, 5, 0, 'rgba(236,140,140,.36)'); blob(g, 42, 16, 9, 5, 0, 'rgba(236,140,140,.36)'); }
  muzzle(g, 0, 25, 19);
  g.beginPath(); g.moveTo(-5, 15); g.quadraticCurveTo(0, 13.5, 5, 15); g.lineTo(0, 21); g.closePath(); g.fillStyle = '#E0959A'; g.fill();
  mouth(g, 0, 29, 5.5, mood === 'sick' ? 'wavy' : mood === 'worry' ? 'o' : mood === 'sparkle' || mood === 'cheer' ? 1 : mood === 'yawn' ? 'o' : mood === 'open' || mood === 'blink' ? 'w' : 'smile');
  whiskers(g, 0, 22, 15, 54); moodFx(g, mood, -40, 56);
  if (WEAR.jill.hat) { g.save(); g.translate(0, -48); hat(g, WEAR.jill.hat, .9); g.restore(); } else if (WEAR.jill.suit === 'zebra') zebraMane(g, 0, -60, 22, .8);
  g.restore();
}
function pomEar(g, x, y, r, rot, back) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.ellipse(0, 0, r, r * 1.05, 0, 0, Math.PI * 2); g.fillStyle = '#8E786C'; g.fill(); g.beginPath(); g.ellipse(0, r * .12, r * .72, r * .78, 0, 0, Math.PI * 2); g.fillStyle = back ? '#A8928A' : '#E9A9A2'; g.fill();
  g.strokeStyle = 'rgba(70,55,50,.55)'; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, r * .98, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.restore(); }
function headband(g, x, y, w, back, ph) { // Pom's red sweatband; from behind the knot and its two tails flutter
  g.save(); g.strokeStyle = '#C8263C'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - w, y + 4); g.quadraticCurveTo(x, y - 7, x + w, y + 4); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - w * .8, y + 1); g.quadraticCurveTo(x, y - 8, x + w * .8, y + 1); g.stroke();
  if (back) { const t = ph || 0; g.fillStyle = '#C8263C'; g.beginPath(); g.ellipse(x + 6, y - 1, 7, 6, 0, 0, Math.PI * 2); g.fill();
    for (const k of [0, 1]) { g.beginPath(); g.moveTo(x + 8, y); const ex = x + 40 + k * 6, ey = y + 8 + k * 14 + Math.sin(t * 2 + k) * 5; g.quadraticCurveTo(x + 24, y - 4 + k * 8 + Math.sin(t * 2 + k + 1) * 4, ex, ey); g.lineTo(ex - 2, ey + 7); g.quadraticCurveTo(x + 22, y + 4 + k * 8, x + 8, y + 6); g.closePath(); g.fill(); } }
  g.restore();
}
function facePom(g, cx, cy, sc, mood) {
  const P = PAL.pom; g.save(); g.translate(cx, cy); g.scale(sc, sc);
  pomEar(g, -40, -44, 17, -.35); pomEar(g, 40, -44, 17, .35);
  fur(g, 0, 0, 62, 54, 0, P.a, P.b); // the round head, wider at the cheeks
  const ck = mood === 'puff' ? 1.55 : 1; fur(g, -34 * (ck > 1 ? 1.15 : 1), 18, 26 * ck, 22 * ck, 0, P.cream, '#E9DCCB', { sparse: 1, rim: 2 }); fur(g, 34 * (ck > 1 ? 1.15 : 1), 18, 26 * ck, 22 * ck, 0, P.cream, '#E9DCCB', { sparse: 1, rim: 2 }); // cheek pouches (stuffed full when puffed)
  { const gl = g.createRadialGradient(0, -20, 4, 0, -20, 46); gl.addColorStop(0, 'rgba(226,190,140,.45)'); gl.addColorStop(1, 'rgba(226,190,140,0)'); g.fillStyle = gl; g.beginPath(); g.ellipse(0, -22, 46, 30, 0, 0, Math.PI * 2); g.fill(); } // warmer apricot on top of the head
  eyes(g, 'jill', -22, 22, -4, 9.5, mood === 'puff' ? 'happy' : mood);
  if (mood !== 'open' && mood !== 'sick' && mood !== 'worry') { blob(g, -36, 14, 9, 5, 0, 'rgba(236,140,140,.4)'); blob(g, 36, 14, 9, 5, 0, 'rgba(236,140,140,.4)'); }
  g.beginPath(); g.ellipse(0, 12, 6.5, 4.8, 0, 0, Math.PI * 2); g.fillStyle = '#E58F98'; g.fill(); // pink nose
  g.strokeStyle = '#9A5A50'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 16); g.lineTo(0, 20); g.stroke();
  mouth(g, 0, 21, 6, mood === 'sick' ? 'wavy' : mood === 'worry' ? 'o' : mood === 'sparkle' || mood === 'cheer' ? 1 : mood === 'yawn' ? 'o' : mood === 'open' || mood === 'blink' ? 'w' : 'smile');
  whiskers(g, 0, 16, 14, 46);
  headband(g, 0, -34, 52, 0);
  moodFx(g, mood, -40, 54);
  g.restore();
}
function drawPom(g, p) {
  const P = PAL.pom, sx = p.slide ? 1.2 : 1 + (1 - p.sq) * .6, sy = p.slide ? .66 : p.sq;
  const by = GROUND_Y - 70 * sy - p.lift, brx = 84 * sx, bry = 72 * sy;
  if (p.view === 'front') {
    fur(g, 150, by + 6, brx, bry, 0, P.a, P.b);
    fur(g, 150, by + 22, brx * .6, bry * .62, 0, P.cream, '#E7D9C4', { sparse: 1, rim: 3 });
    for (const sd of [-1, 1]) { blob(g, 150 + sd * 22, by + 26, 10, 8, 0, '#F2B8B0'); blob(g, 150 + sd * 36, GROUND_Y - 6, 15, 8, 0, '#F2B8B0'); } // little pink hands and feet
    // a green "new hire" leaf badge
    g.save(); g.translate(150, by + 46); g.beginPath(); g.moveTo(0, 12); g.lineTo(-9, 0); g.lineTo(-9, -10); g.lineTo(0, -4); g.closePath(); g.fillStyle = '#F2C230'; g.fill(); g.beginPath(); g.moveTo(0, 12); g.lineTo(9, 0); g.lineTo(9, -10); g.lineTo(0, -4); g.closePath(); g.fillStyle = '#3FA34D'; g.fill(); g.restore();
    facePom(g, 150, by - 52, .95, p.mood); return;
  }
  // back / look: one round pear-shaped body (hamsters have no neck), pink soles, a stub of a tail
  const fy = GROUND_Y - 6 - Math.max(0, p.feet) * 7, fo = Math.max(0, -p.feet) * 8;
  for (const sd of [-1, 1]) { blob(g, 150 + sd * brx * .5, fy + fo * .3, 17, 9 + fo * .3, 0, '#F2B8B0'); blob(g, 150 + sd * brx * .5, fy + fo * .3 + 1, 9, 4, 0, 'rgba(200,120,120,.45)'); }
  fur(g, 150, by, brx, bry, 0, P.a, P.b);
  { const gl = g.createRadialGradient(150, by - bry * .4, 6, 150, by - bry * .3, brx); gl.addColorStop(0, 'rgba(222,182,128,.55)'); gl.addColorStop(1, 'rgba(222,182,128,0)'); g.fillStyle = gl; g.beginPath(); g.ellipse(150, by - bry * .25, brx * .9, bry * .8, 0, 0, Math.PI * 2); g.fill(); } // warmer back
  blob(g, 150, by + bry * .62, 7, 5, 0, '#E8CFA8');
  const hy = by - bry * .55 + (p.slide ? 14 : 0);
  if (p.view === 'look') { facePom(g, 156, hy - 24, .98, p.mood); if (p.mood === 'cheer') { fur(g, 150 + 56, hy + 10, 9, 16, -.6, P.a, P.b); blob(g, 150 + 64, hy - 6, 10, 8, -.3, '#F2B8B0'); } return; }
  pomEar(g, 150 - 40, hy - 26, 16 + p.ear * 2, -.3 - p.ear * .3, 1); pomEar(g, 150 + 40, hy - 26, 16 + p.ear * 2, .3 + p.ear * .3, 1);
  headband(g, 150, hy - 4, 58, 1, p.tiePh);
}
function mugHat(g, y) { g.save(); g.translate(0, y); rr(g, -22, -38, 44, 38, 6, '#FBF6EE', '#9AA9B6', 3); g.beginPath(); g.ellipse(27, -19, 9, 12, 0, 0, Math.PI * 2); g.strokeStyle = '#9AA9B6'; g.lineWidth = 5; g.stroke(); rr(g, -22, -30, 44, 7, 0, '#4E77A0'); g.restore(); }

// ---- full bodies ----
// p: {lift, sq, feet, ear, tie, view:'back'|'front'|'look', mood, slide}
function drawBody(g, who, p) {
  if (who === 'pom') return drawPom(g, p);
  const P = PAL[who], ren = who === 'ren';
  const sx = p.slide ? 1.18 : 1 + (1 - p.sq) * .6, sy = p.slide ? .7 : p.sq;
  const by = GROUND_Y - (ren ? 62 : 50) * sy - p.lift;
  const brx = (ren ? 96 : 74) * sx, bry = (ren ? 64 : 52) * sy;
  if (p.view === 'front') {
    // body + chest + front paws
    const suit = WEAR[who].suit;
    if (suit === 'bee') beeWings(g, 150, by - bry * .2, 1.05, -.15);
    fur(g, 150, by, brx, bry, 0, P.a, P.b);
    if (suit) suitOver(g, suit, 150, by, brx, bry); else fur(g, 150, by + 6, brx * .55, bry * .78, 0, P.cream, '#E7D9C4', { sparse: 1, rim: 3 });
    blob(g, 122, GROUND_Y - 6, 16, 9, 0, P.cream); blob(g, 178, GROUND_Y - 6, 16, 9, 0, P.cream);
    if (ren) { faceRen(g, 150, by - 88, 1, p.mood, p.mug); tie(g, 150, by - 26, 66, 0); }
    else { lanyard(g, 150, by - 24); faceJill(g, 150, by - 70, 1, p.mood); }
    return;
  }
  // back / look views: soles of the hind feet, rump, tail
  const fy = GROUND_Y - 8 - Math.max(0, p.feet) * 8, fo = Math.max(0, -p.feet) * 10;
  blob(g, 150 - brx * .62, fy + fo * .3, (ren ? 30 : 23), (ren ? 13 : 10) + fo * .4, 0, '#EFE3D0'); blob(g, 150 + brx * .62, fy + fo * .3, (ren ? 30 : 23), (ren ? 13 : 10) + fo * .4, 0, '#EFE3D0');
  blob(g, 150 - brx * .62, fy + fo * .3 + 2, (ren ? 16 : 12), 6, 0, 'rgba(200,170,140,.5)'); blob(g, 150 + brx * .62, fy + fo * .3 + 2, (ren ? 16 : 12), 6, 0, 'rgba(200,170,140,.5)');
  const suit = WEAR[who].suit;
  fur(g, 150, by, brx, bry, 0, P.a, P.b);
  if (suit) suitOver(g, suit, 150, by, brx, bry);
  if (suit === 'bee') { g.fillStyle = '#2E2622'; g.beginPath(); g.moveTo(142, by + bry * .22); g.lineTo(158, by + bry * .22); g.lineTo(150, by + bry * .22 + 18); g.closePath(); g.fill(); }
  if (suit === 'zebra') zebraTail(g, 150, by + bry * .1, p.tiePh || 0);
  else fur(g, 150, by + bry * .1, ren ? 23 : 18, ren ? 21 : 16, 0, '#FBF6EE', '#E7DCCB', { sparse: 1, rim: 4 });
  if (suit === 'bee') beeWings(g, 150, by - bry * .2, 1, p.slide ? .25 : Math.sin((p.tiePh || 0) * 4) * .12);
  const hy = by - bry - (ren ? 18 : 22) + (p.slide ? 22 : 0);
  if (p.view === 'look') { // head turned toward the camera
    if (ren) { faceRen(g, 150 + 10, hy - 10, .86, p.mood, p.mug); }
    else { faceJill(g, 150 + 8, hy - 4, .9, p.mood); }
    if (p.mood === 'cheer') { const px = 150 + (ren ? 76 : 60), py = hy + (ren ? 10 : 6); fur(g, px, py + 26, ren ? 13 : 10, ren ? 22 : 17, -.5, P.a, P.b); blob(g, px + 6, py + 4, ren ? 15 : 12, ren ? 11 : 9, -.3, P.cream); } // a paw thrown up in the air
    return;
  }
  if (ren) {
    fur(g, 150, hy, 56, 56, 0, '#DDB98D', P.b, { rr: .62 });
    g.strokeStyle = 'rgba(120,84,56,.5)'; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(122, hy - 52); g.quadraticCurveTo(150, hy - 60, 178, hy - 52); g.stroke();
    const e = p.ear;
    for (const sd of [-1, 1]) { const ex = 150 + sd * (66 + e * 12), ey = hy + 26 - e * 18, rot = sd * (.12 + e * .5);
      fur(g, ex, ey, 32, 72, rot, '#B08A66', '#7E5E42', { vert: 1 }); }
    if (p.tie != null) { // the tie comes out from under his chin and streams back over his shoulder in the wind
      windTie(g, 152, hy + 50, p);
      fur(g, 150, hy + 44, 30, 13, 0, '#D6AE82', '#BE9369', { sparse: 1, rim: 1 }); // the chin/neck fur tucks the root in
    }
    { const hk = p.mug ? 'mug' : WEAR.ren.hat; if (hk) { g.save(); g.translate(150, hy - 50); hat(g, hk, 1); g.restore(); } else if (WEAR.ren.suit === 'bee') antennae(g, 150, hy - 50, 1); }
  } else {
    for (const sd of [-1, 1]) { g.save(); g.translate(150 + sd * 24, hy - 32); g.rotate(sd * (.2 + p.ear * .4)); fur(g, 0, -22, 16, 30, 0, '#D3AE84', '#AE885F', { vert: 1 }); g.restore(); }
    fur(g, 150, hy, 52, 46, 0, '#E5C59F', P.b);
    g.strokeStyle = '#3F6E99'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(112, hy + 34); g.quadraticCurveTo(150, hy + 50, 188, hy + 34); g.stroke();
    if (WEAR.jill.suit === 'zebra') zebraMane(g, 150, hy - 44, 52, 1);
    if (WEAR.jill.hat) { g.save(); g.translate(150, hy - 40); hat(g, WEAR.jill.hat, .9); g.restore(); }
  }
}
function lanyard(g, x, y) { g.strokeStyle = '#3F6E99'; g.lineWidth = 3.5; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 34, y - 16); g.lineTo(x - 3, y + 22); g.moveTo(x + 34, y - 16); g.lineTo(x + 3, y + 22); g.stroke(); rr(g, x - 13, y + 20, 26, 34, 4, '#FBF6EE', '#355F86', 3); rr(g, x - 8, y + 25, 16, 10, 2, '#C9A176'); rr(g, x - 8, y + 39, 16, 2.5, 1, '#9AA9B6'); rr(g, x - 3, y + 44, 11, 2.5, 1, '#9AA9B6'); }

const BUN = { ren: {}, jill: {}, pom: {} };
const RUN_FRAMES = 8;
function buildBunnies(only) {
  for (const who of ['ren', 'jill', 'pom']) {
    if (only && who !== only) continue; BUN[who] = BUN[who] || {};
    for (const mug of [0, 1]) {
      if (who !== 'ren' && mug) continue;
      const key = mug ? 'm' : '';
      for (let k = 0; k < RUN_FRAMES; k++) {
        const ph = k / RUN_FRAMES * Math.PI * 2;
        SEED = 11 + k;
        BUN[who]['run' + k + key] = paint(g => drawBody(g, who, { lift: Math.max(0, Math.sin(ph)) * 16, sq: 1 - .08 * Math.cos(ph * 2), feet: -Math.sin(ph), ear: Math.sin(ph + .9) * .12, tie: 0, tiePh: ph, view: 'back', mug }));
      }
      SEED = 3; BUN[who]['air' + key] = paint(g => drawBody(g, who, { lift: 10, sq: 1.04, feet: -.6, ear: -.3, tie: 0, tiePh: 1.2, air: 1, view: 'back', mug }));
      SEED = 4; BUN[who]['slide' + key] = paint(g => drawBody(g, who, { lift: 0, sq: 1, feet: .5, ear: .35, tie: 0, tiePh: 2.4, view: 'back', slide: 1, mug }));
      for (const mood of ['happy', 'sparkle', 'wink', 'open', 'sick', 'worry', 'cheer'].concat(who === 'pom' ? ['puff'] : [])) { SEED = 5; BUN[who]['look_' + mood + key] = paint(g => drawBody(g, who, { lift: 6, sq: 1, feet: 0, ear: 0, view: 'look', mood, mug })); }
      for (const mood of ['open', 'blink', 'happy', 'cheer', 'sleepy', 'yawn'].concat(who === 'pom' ? ['puff', 'sparkle'] : [])) { SEED = 6; BUN[who]['front_' + mood + key] = paint(g => drawBody(g, who, { lift: 0, sq: 1, feet: 0, ear: 0, view: 'front', mood, mug })); }
    }
  }
}
function paint(fn) { const c = mk(BS, BS + BTOP); const g = c.getContext('2d'); g.lineJoin = 'round'; g.translate(0, BTOP); fn(g); return c; }
function bunFrame(who, pose, mug) { const k = mug && who === 'ren' ? 'm' : ''; return BUN[who][pose + k] || BUN[who][pose] || BUN[who]['front_open'] || BUN[who].run0; }
function drawCharCard(cv, who, t) {
  const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height);
  const mood = (t % 3.4) < .14 ? 'blink' : ((t % 9) > 7.4 ? 'happy' : 'open');
  const img = bunFrame(who, 'front_' + mood, SV.mugOn);
  const s = cv.width / BS * 1.05 * (who === 'pom' ? 1.25 : 1), bob = Math.sin(t * 2.2) * 2;
  g.save(); g.translate(cv.width / 2, cv.height * .98 + bob * 0); g.scale(s, s * (1 + Math.sin(t * 2.2) * .012));
  g.fillStyle = 'rgba(59,42,32,.14)'; g.beginPath(); g.ellipse(0, -14, 100, 14, 0, 0, Math.PI * 2); g.fill();
  g.drawImage(img, -BS / 2, -GROUND_Y - 4 - BTOP); g.restore();
}
