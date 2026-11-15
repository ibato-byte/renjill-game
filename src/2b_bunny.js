/* ================= the bunnies =================
   Sitting, quadruped rabbits like the series art: Ren (Holland Lop, tall face, huge lop ears, yellow tie)
   and Jill (Netherland Dwarf, round face, pink upright ears, round glasses, ID badge).
   Every pose is pre-rendered once with soft fur strokes, then drawn as an image. */
const BS = 300;            // sprite canvas width; ground line at y = 282 (below the headroom)
const BTOP = 64;           // headroom above the 300px box so tall hats (wizard, Santa, antlers) are never cut off
const GROUND_Y = 282;
const PAL = {
  ren:  { a: '#DDB68C', b: '#C7A077', c: '#9C7652', ear: ['#C4A381', '#8E7057'], cream: '#F3E7D6' },
  jill: { a: '#E2BB8D', b: '#CFA174', c: '#A3754C', ear: ['#C79A6C', '#B38657'], cream: '#F6EBDC' },
  // Pom: a kinkuma (golden) Syrian hamster: pale cream fur, a warmer apricot back, rounded grey-brown ears with pink insides, pink paws
  pom:  { a: '#F3E3CA', b: '#DCC29E', back: '#EBCDA2', ear: ['#9A8478', '#EBAAA4'], cream: '#FAF1E4' },
};
/* ---- the closet: what each bunny is wearing while its sprites are painted ---- */
const WEAR = { ren: { tie: 'gold', hat: '', suit: '' }, jill: { frame: 'brown', hat: '', suit: '' }, pom: { band: 'red', hat: '', suit: '' } };
const BAND_COL = { red: ['#C8263C', 'rgba(255,255,255,.45)'], blue: ['#2F6DB5', 'rgba(255,255,255,.45)'], green: ['#3E9A4E', 'rgba(255,255,255,.45)'], pink: ['#E77FA3', 'rgba(255,255,255,.5)'], gold: ['#D9A21B', 'rgba(255,248,200,.8)'] };
/* ---- costumes from the shop: a striped onesie over the body, plus a little extra (wings, antennae, mane, tail) ---- */
function suitOver(g, kind, cx, cy, rx, ry) {
  const ex = rx * .94, ey = ry * .94;
  g.save(); g.beginPath(); g.ellipse(cx, cy, ex, ey, 0, 0, Math.PI * 2); g.clip();
  if (kind === 'royal') { // the Legendary bunny's gold-and-cream ceremonial coat: soft gold cloth, a red sash, small gold buttons
    const gr = g.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry); gr.addColorStop(0, '#F6DC86'); gr.addColorStop(.5, '#E2B341'); gr.addColorStop(1, '#C8902A'); g.fillStyle = gr; g.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
    g.strokeStyle = 'rgba(255,248,215,.35)'; g.lineWidth = 2; for (let k = -4; k <= 4; k++) { g.beginPath(); g.moveTo(cx + k * rx * .3 - rx * .3, cy - ry); g.lineTo(cx + k * rx * .3 + rx * .3, cy + ry); g.stroke(); }
    g.fillStyle = '#C8263C'; g.beginPath(); g.moveTo(cx - rx, cy - ry * .55); g.lineTo(cx - rx * .7, cy - ry * .8); g.lineTo(cx + rx, cy + ry * .55); g.lineTo(cx + rx * .7, cy + ry * .85); g.closePath(); g.fill();
    g.fillStyle = '#FFF2C2'; for (const k of [-.35, .05, .45]) { g.beginPath(); g.arc(cx - rx * .02, cy + k * ry, rx * .05, 0, Math.PI * 2); g.fill(); }
  } else if (kind === 'bee') {
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
function hat(g, kind, w, H) { // H = half the width of the head where the brim sits (hat units); covering hats are sized to it
  if (kind === 'laurel') { g.save(); g.scale(w, w); // the Legendary bunny's golden laurel: a ring of leaves sitting on the head, the two sprays rising to points at the back, a red gem in front
    const leaf = (x, y, a, L) => { g.save(); g.translate(x, y); g.rotate(a); const gr = g.createLinearGradient(-L * .4, -L, L * .4, 0); gr.addColorStop(0, '#FFF0A8'); gr.addColorStop(.55, '#F2C230'); gr.addColorStop(1, '#B98A22'); g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * .42, -L * .5, 0, -L); g.quadraticCurveTo(-L * .42, -L * .5, 0, 0); g.fill(); g.strokeStyle = 'rgba(120,85,20,.6)'; g.lineWidth = 1.2; g.stroke(); g.beginPath(); g.moveTo(0, -1); g.lineTo(0, -L * .8); g.strokeStyle = 'rgba(255,248,210,.6)'; g.stroke(); g.restore(); };
    // back half of the ring (behind), then the front
    g.strokeStyle = '#A57C24'; g.lineWidth = 4; g.beginPath(); g.ellipse(0, -6, 40, 12, 0, Math.PI, Math.PI * 2); g.stroke();
    for (const sd of [-1, 1]) for (let i = 0; i < 7; i++) { const u = i / 6, ang = Math.PI * (1 + u * .5) , x = sd * Math.cos(ang) * -40, y = -6 + Math.sin(ang) * 12 - u * 14;
      leaf(x, y, sd * (-.4 - u * .9), 16 - u * 3); leaf(x, y + 2, sd * (.5 - u * .6) + Math.PI * .1 * sd, 13 - u * 2); }
    g.strokeStyle = '#C9962F'; g.lineWidth = 4; g.beginPath(); g.ellipse(0, -6, 40, 12, 0, 0, Math.PI); g.stroke();
    for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) { const ang = Math.PI * (.5 - sd * (.12 + i * .1)); leaf(Math.cos(ang) * 40, -6 + Math.sin(ang) * 12, sd * (.9 + i * .15), 14); }
    g.fillStyle = '#C8263C'; g.beginPath(); g.ellipse(0, 6, 6.5, 5.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.arc(-2, 4, 1.8, 0, Math.PI * 2); g.fill();
    g.restore(); return; }
  w = w || 1; H = H || 46;
  if (kind === 'mug') { mugHat(g, 0); return; }
  if (kind === 'beret') { g.save(); g.scale(w, w); // a soft beret pulled down over the top of the head, tipped to one side
    const gr = g.createRadialGradient(-H * .2, -H * .5, 2, 0, -H * .3, H * 1.1); gr.addColorStop(0, '#DA5A4E'); gr.addColorStop(1, '#B63A30'); g.fillStyle = gr;
    g.beginPath(); g.ellipse(H * .1, -H * .3, H * 1.1, H * .44, -.1, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#A8352C'; g.beginPath(); g.ellipse(0, -3, H * .96, 8, 0, 0, Math.PI); g.fill(); g.beginPath(); g.ellipse(0, -3, H * .96, 3, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#7A241E'; g.fillRect(H * .12, -H * .76, 4, 8); g.restore(); return; }
  if (kind === 'straw') { g.save(); g.scale(w, w); // the crown fits over the head, the wide brim at the brow
    g.fillStyle = '#E8D28A'; g.strokeStyle = '#C9B06A'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, -2, H * 1.5, H * .27, 0, Math.PI, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = '#EFDB98'; g.beginPath(); g.roundRect ? g.roundRect(-H * .78, -H * .78, H * 1.56, H * .78, [H * .42, H * .42, 4, 4]) : g.rect(-H * .78, -H * .78, H * 1.56, H * .78); g.fill(); g.stroke();
    g.fillStyle = '#2F4F7F'; g.fillRect(-H * .78, -H * .3, H * 1.56, H * .17);
    g.fillStyle = '#E8D28A'; g.beginPath(); g.ellipse(0, -2, H * 1.5, H * .27, 0, 0, Math.PI); g.fill(); g.stroke(); g.restore(); return; }
  if (kind === 'santa') { g.save(); g.scale(w * H / 44, w * H / 44); g.fillStyle = '#C8463C'; g.beginPath(); g.moveTo(-40, 0); g.quadraticCurveTo(-30, -50, 10, -62); g.quadraticCurveTo(40, -70, 52, -50); g.quadraticCurveTo(30, -52, 20, -30); g.quadraticCurveTo(30, -10, 40, 0); g.closePath(); g.fill();
    g.fillStyle = '#FBF6EE'; g.beginPath(); g.ellipse(0, 0, 46, 10, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(54, -50, 9, 0, Math.PI * 2); g.fill(); g.restore(); return; }
  if (kind === 'crown') { g.save(); g.scale(w, w); g.fillStyle = '#F2C230'; g.strokeStyle = '#B08A3E'; g.lineWidth = 2; g.beginPath(); g.moveTo(-34, 0); g.lineTo(-38, -34); g.lineTo(-20, -16); g.lineTo(0, -40); g.lineTo(20, -16); g.lineTo(38, -34); g.lineTo(34, 0); g.closePath(); g.fill(); g.stroke();
    for (const [x, c] of [[-20, '#C8463C'], [0, '#4E77A0'], [20, '#5F9E5A']]) { g.fillStyle = c; g.beginPath(); g.arc(x, -8, 4, 0, Math.PI * 2); g.fill(); } g.restore(); return; }
  if (kind === 'ribbon') { g.save(); g.scale(w, w); g.translate(26, -8); g.fillStyle = '#E86A75'; g.beginPath(); g.ellipse(-14, 0, 14, 9, -.4, 0, Math.PI * 2); g.ellipse(14, 0, 14, 9, .4, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C8463C'; g.beginPath(); g.arc(0, 0, 5, 0, Math.PI * 2); g.fill(); g.restore(); return; }
  if (kind === 'witch') { g.save(); g.scale(w * H / 48, w * H / 48); // a soft, slightly bent wizard hat with a gold band and a little star
    g.fillStyle = '#3B3350'; g.beginPath(); g.ellipse(0, 0, 58, 13, 0, 0, Math.PI * 2); g.fill();
    const gr = g.createLinearGradient(-30, 0, 30, -80); gr.addColorStop(0, '#2E2842'); gr.addColorStop(1, '#5A4E7E'); g.fillStyle = gr;
    g.beginPath(); g.moveTo(-32, -4); g.quadraticCurveTo(-14, -44, 4, -78); g.quadraticCurveTo(16, -92, 40, -84); g.quadraticCurveTo(22, -78, 18, -60); g.quadraticCurveTo(26, -30, 32, -4); g.closePath(); g.fill();
    g.fillStyle = '#E0A93A'; g.beginPath(); g.moveTo(-31, -8); g.quadraticCurveTo(0, -16, 31, -8); g.lineTo(30, -18); g.quadraticCurveTo(0, -26, -28, -18); g.closePath(); g.fill();
    g.fillStyle = '#F6D36B'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4 : 9; g.lineTo(-6 + Math.cos(a) * r, -44 + Math.sin(a) * r); } g.closePath(); g.fill();
    g.restore(); return; }
  if (kind === 'pumpkin') { g.save(); g.scale(w * H / 36, w * H / 36); // a little pumpkin worn like a cap, with a leaf
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
  if (kind === 'helmet') { g.save(); g.scale(w, w); // a site hard hat: the shell covers the head down to the brow, a short visor in front
    const gr = g.createLinearGradient(-H, -H, H * .6, 0); gr.addColorStop(0, '#FBD957'); gr.addColorStop(1, '#E6B21F'); g.fillStyle = gr;
    g.beginPath(); g.ellipse(0, -3, H * 1.06, H * .86, 0, Math.PI, 0); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-H * .42, -H * .55, H * .26, H * .12, -.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#E8B624'; g.fillRect(-H * .09, -H * .86, H * .18, H * .83); // the ridge
    { const cx = -H * .5, cy = -H * .42, a = H * .2, t = H * .075; g.fillStyle = '#3FA34D'; g.fillRect(cx - a / 2, cy - t / 2, a, t); g.fillRect(cx - t / 2, cy - a / 2, t, a); } // a small green safety cross
    g.fillStyle = '#D29B16'; g.beginPath(); g.roundRect ? g.roundRect(-H * 1.16, -6, H * 2.32, 8, 4) : g.rect(-H * 1.16, -6, H * 2.32, 8); g.fill();
    g.fillStyle = '#C48E12'; g.beginPath(); g.ellipse(0, 1, H * .62, 6, 0, 0, Math.PI); g.fill(); g.restore(); return; }
}
// put a hat on a head: x,y = the top of the head as before, hw = half the head's width at the brow, sink = how far the brow is below x,y
const HAT_COVER = { helmet: 1, beret: 1, straw: 1, santa: 1, witch: 1, pumpkin: 1 }, HAT_PERCH = { crown: 1, kagami: 1 };
/* 2026-11-15 オーナー：「帽子をただ載せただけのように見える」。かぶっている感じを出す 3 つ：
   ①ふちの下に、頭と耳にだけ落ちる柔らかい影（絵の外には落とさない） ②ふちの下から毛が少しのぞく ③帽子ごとに少しだけかたむける。who＝だれの頭か（毛の色に使う） */
const HAT_TILT = { helmet: .05, straw: -.06, santa: -.07, witch: .07, pumpkin: .06, crown: -.06, kagami: .03 };
const HAT_TUFT = { helmet: [.92, 4], beret: [.84, 7], pumpkin: [.84, 2] }; // 毛がのぞく幅（ふちの半分の幅に対して）と、ふちの下の高さ。サンタ・魔女・麦わらは、ふちが太いので出さない（線がふちの上に出た）
const HAT_SINK = { witch: .45, santa: .8, straw: .9 }; // ふちの太い帽子は浅くかぶる（魔女の帽子のふちがレンの目にかかった）
function hatTufts(g, hw, who, y0) {
  const c = who === 'pom' ? [RC.pom.a, RC.pom.b] : who === 'jill' ? [RC.jil.head1, RC.jil.head2] : [RC.ren.head1, RC.ren.head2];
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < 7; i++) { const u = (i + .5) / 7 * 2 - 1, x = u * hw, y = y0 + (1 - Math.abs(u)) * 1.2, L = 3 + (i % 3) * 1.4;
    g.strokeStyle = i % 2 ? c[0] : c[1]; g.lineWidth = 2.6 - (i % 2) * .6; g.beginPath(); g.moveTo(x - u * 1.5, y - 2); g.quadraticCurveTo(x + u * 2, y + L * .55, x + u * 3.5 + (i % 2 ? 1.2 : -1.2), y + L); g.stroke(); }
  g.restore();
}
function wearHat(g, kind, x, y, w, hw, sink, who, rot) {
  const dy = HAT_COVER[kind] ? sink * (HAT_SINK[kind] || 1) : HAT_PERCH[kind] ? sink * .4 : 0, onSprite = who && !(g.canvas && g.canvas.id === 'cv');
  g.save(); g.translate(x, y + dy);
  if (onSprite && (HAT_COVER[kind] || HAT_PERCH[kind])) { g.save(); g.globalCompositeOperation = 'source-atop'; // 影は、もう描いてある頭・耳の上にだけ
    if (HAT_COVER[kind]) soft(g, 0, hw * .14, hw * 1.1, hw * .36, '#3B2416', .3, 6); else soft(g, 0, 1, hw * .6, hw * .12, '#3B2416', .24, 3); g.restore(); }
  g.rotate((HAT_TILT[kind] || 0) + (rot || 0));
  hat(g, kind, w, hw / w);
  if (onSprite && HAT_TUFT[kind] && !rot) hatTufts(g, hw * HAT_TUFT[kind][0], who, HAT_TUFT[kind][1] * w);
  g.restore();
}
function earHoles(g, x, y, dx, rot) { g.save(); g.fillStyle = 'rgba(60,30,20,.28)'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(x + sd * (dx + 4), y, 15, 7, sd * rot, 0, Math.PI * 2); g.fill(); } g.restore(); }
const hatCovers = k => !!HAT_COVER[k]; // big enough to hide where the ears grow, so the ears are drawn again on top
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
  if (mood === 'happy' || mood === 'blink') { // アニメと同じ弧（にっこり＝上にふくらむ／まばたき＝下にゆるく）
    const k = who === 'ren' ? [1.08, .15, -1.31, .35, 1, .08, .54, .31] : who === 'pom' ? [.95, .32, -.95, .42, .95, .1, .5, .34] : [.94, .17, -1.06, .28, .89, .06, .44, .25];
    g.strokeStyle = who === 'ren' ? '#3A2216' : who === 'pom' ? '#0B0D10' : '#1C1919'; g.lineCap = 'round';
    for (const x of [x1, x2]) { g.beginPath(); if (mood === 'happy') { g.lineWidth = r * k[3]; g.moveTo(x - r * k[0], y + r * k[1]); g.quadraticCurveTo(x, y + r * k[2], x + r * k[0], y + r * k[1]); } else { g.lineWidth = r * k[7]; g.moveTo(x - r * k[4], y + r * k[5]); g.quadraticCurveTo(x, y + r * k[6], x + r * k[4], y + r * k[5]); } g.stroke(); }
    return;
  }
  const ren = who === 'ren';
  for (const [x, i] of [[x1, 0], [x2, 1]]) {
    if (mood === 'wink' && i === 1) { g.strokeStyle = '#3A2216'; g.lineWidth = r * .5; g.lineCap = 'round'; g.beginPath(); g.arc(x, y + r * .4, r * .8, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); continue; }
    if (who === 'pom') { // ポム：まっ黒のつぶらな目に、白い光がふたつ（アニメと同じ）
      blob(g, x, y, r * .92, r * 1.05, 0, '#0B0D10'); blob(g, x + r * .32, y - r * .42, r * .32, r * .3, 0, '#FFFFFF'); blob(g, x - r * .26, y + r * .42, r * .14, r * .12, 0, 'rgba(255,255,255,.7)');
      if (mood === 'sparkle') { g.fillStyle = '#FFFFFF'; star(g, x + r * .15, y + r * .1, r * .4); }
      continue;
    }
    if (!ren) { // ジル：大きな黒い目（上が少し青みがかる）、右上に白い光、下にうすい照り返し（アニメと同じ）
      const gr = g.createRadialGradient(x - r * .16, y - r * .26, 0, x - r * .16, y - r * .26, r * 1.36);
      gr.addColorStop(0, '#46525E'); gr.addColorStop(.45, '#1C1919'); gr.addColorStop(1, '#050404');
      g.beginPath(); g.ellipse(x, y, r, r * 1.083, 0, 0, Math.PI * 2); g.fillStyle = gr; g.fill();
      g.strokeStyle = 'rgba(169,189,204,.25)'; g.lineWidth = r * .11; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r * .5, y + r * .5); g.quadraticCurveTo(x, y + r * .78, x + r * .5, y + r * .5); g.stroke();
      blob(g, x + r * .33, y - r * .44, r * .29, r * .233, 0, 'rgba(255,255,255,.92)');
      if (mood === 'sparkle') { g.fillStyle = '#FFFFFF'; star(g, x + r * .15, y + r * .1, r * .4); }
      continue;
    }
    const gr = g.createRadialGradient(x - r * .16, y - r * .27, 0, x - r * .16, y - r * .27, r * 1.38);
    gr.addColorStop(0, '#6B4631'); gr.addColorStop(.45, '#3A2216'); gr.addColorStop(1, '#0F0704');
    g.beginPath(); g.ellipse(x, y, r, r * 1.115, 0, 0, Math.PI * 2); g.fillStyle = gr; g.fill();
    blob(g, x + r * .35, y - r * .42, r * .31, r * .25, 0, 'rgba(255,255,255,.9)');
    g.save(); g.globalAlpha = .6; g.strokeStyle = '#5E4535'; g.lineWidth = r * .12; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r, y - r * .23); g.quadraticCurveTo(x, y - r * 1.31, x + r, y - r * .23); g.stroke(); g.restore(); // 上まぶたの線
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
/* 2026-11-15：アニメ（SNS の動画）と同じ絵にする。形・位置・色は、アニメを描いている renjill-auto の rig/rig.js（レン・ジル）と rig/ep/pom_debut.js（ポム）の
   数字をそのまま使う（前は似せて描き直していたので、耳・口元・色が少しずつ違っていた）。アニメの絵を変えたら、ここの数字も合わせる（qa/animelook.js が見張る）。 */
const RC = { ren: { fur1: '#DDB68C', fur2: '#C7A077', fur3: '#9C7652', head1: '#E3C29C', head2: '#CDA67C', head3: '#A88259', ear1: '#C4A381', ear2: '#AE8D6D', ear3: '#8E7057', cream: '#F3E7D6', nose: '#C88D85', mouth: '#7A5A48', blush: '#EFA09A' },
  jil: { fur1: '#E2BB8D', fur2: '#CFA174', fur3: '#A3754C', head1: '#E9C79F', head2: '#D3A777', head3: '#B08155', ear1: '#C79A6C', ear2: '#B38657', earIn1: '#E9C3B2', earIn2: '#DDA898', cream: '#F6EBDC', nose: '#D98F8E', mouth: '#A86E68', blush: '#EFA09A', theme: '#355F86' },
  pom: { a: '#F3E3CA', b: '#DCC29E', deep: '#C9A57A', cream: '#FAF1E4', earO: '#8E786C', earI: '#E9A9A2', nose: '#E58F98', pink: '#F2B8B0' } };
const RK = { ren: .536, jil: .646, pom: .97 }; // アニメの座標 → 今までの顔の大きさ（帽子などの位置はこの大きさで決めてある）
function rgB(g, b, cx, cy, r, st) { const R = r * Math.sqrt((b[2] * b[2] + b[3] * b[3]) / 2), x = b[0] + cx * b[2], y = b[1] + cy * b[3]; const gr = g.createRadialGradient(x, y, 0, x, y, R); for (const q of st) gr.addColorStop(q[0], q[1]); return gr; }
function lgB(g, b, x2, y2, st) { const gr = g.createLinearGradient(b[0], b[1], b[0] + x2 * b[2], b[1] + y2 * b[3]); for (const q of st) gr.addColorStop(q[0], q[1]); return gr; }
// 毛のある面：d はパスの文字列か [cx, cy, rx, ry]。ふちは細かい毛でぼかし、中にうすい毛並みを入れる
function furP(g, d, b, fill, edge, o) {
  o = o || {}; let p;
  if (typeof d === 'string') p = new Path2D(d); else { p = new Path2D(); p.ellipse(d[0], d[1], d[2], d[3], 0, 0, Math.PI * 2); b = [d[0] - d[2], d[1] - d[3], d[2] * 2, d[3] * 2]; }
  if (typeof fill === 'function') fill = fill(b);
  g.save(); if (o.a != null) g.globalAlpha *= o.a;
  g.save(); g.strokeStyle = edge; g.lineCap = 'round'; g.globalAlpha *= .5; g.lineWidth = 3.2; g.setLineDash([1.3, 2.3]); g.stroke(p); g.lineDashOffset = 1.7; g.lineWidth = 5; g.globalAlpha *= .45; g.stroke(p); g.restore();
  g.fillStyle = fill; g.fill(p);
  if (!o.plain) { g.save(); g.clip(p); const n = Math.min(700, Math.round(b[2] * b[3] / 26)); g.lineCap = 'round'; g.lineWidth = 1.1;
    for (let i = 0; i < n; i++) { const x = b[0] + srand() * b[2], y = b[1] + srand() * b[3], L = 3 + srand() * 6, dx = ((x - b[0]) / b[2] - .5) * 3 + (srand() - .5) * 2; g.strokeStyle = srand() < .5 ? 'rgba(255,248,236,.07)' : 'rgba(82,56,36,.05)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + dx, y + L); g.stroke(); }
    g.restore(); }
  g.restore();
}
function soft(g, cx, cy, rx, ry, col, a, sd) { const k = 1 + (sd || 5) * 1.6 / Math.min(rx, ry); g.save(); g.translate(cx, cy); g.scale(rx * k, ry * k); const c = hexRgb(col), q = t => `rgba(${c[0]},${c[1]},${c[2]},${t})`, gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, q(a)); gr.addColorStop(1 / k * .72, q(a * .82)); gr.addColorStop(1, q(0)); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fill(); g.restore(); }
function sPath(g, d, col, w, a) { g.save(); g.globalAlpha *= a == null ? 1 : a; g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(new Path2D(d)); g.restore(); }
function fPath(g, d, col, a) { g.save(); g.globalAlpha *= a == null ? 1 : a; g.fillStyle = col; g.fill(new Path2D(d)); g.restore(); }
function rigMouth(g, x, y, mood, col, w) { // y＝鼻の下の線の先（アニメの 243）。w＝ω の片側の幅
  const k = mood === 'sick' ? 'wavy' : mood === 'worry' || mood === 'yawn' ? 'o' : mood === 'sparkle' || mood === 'cheer' ? 'open' : mood === 'open' || mood === 'blink' || mood === 'sleepy' ? 'w' : 'smile';
  if (k === 'w') sPath(g, `M${x} ${y - 7} V${y} M${x} ${y} Q${x - w * .5} ${y + w * .5} ${x - w} ${y + w * .33} M${x} ${y} Q${x + w * .5} ${y + w * .5} ${x + w} ${y + w * .33}`, col, 1.8);
  else if (k === 'smile') sPath(g, `M${x - w * 1.17} ${y - 3} Q${x} ${y + w * 1.1} ${x + w * 1.17} ${y - 3}`, col, 2.4);
  else if (k === 'open') { const d = `M${x - 10} ${y - 3} Q${x} ${y + 15} ${x + 10} ${y - 3} Z`; fPath(g, d, '#C9605F'); sPath(g, d, col, 2); }
  else if (k === 'wavy') sPath(g, `M${x - 14} ${y + 1} q5 -5 10 0 q5 5 10 0 q5 -5 8 0`, col, 2.2);
  else { const e = mood === 'yawn' ? 1.5 : 1; g.save(); g.beginPath(); g.ellipse(x, y + 3 * e, 5 * e, 6 * e, 0, 0, Math.PI * 2); g.fillStyle = '#C9605F'; g.fill(); g.strokeStyle = col; g.lineWidth = 1.8; g.stroke(); g.restore(); }
}
const REN_EARL = 'M134 112 C 100 102 56 126 40 180 C 26 230 28 286 52 306 C 74 324 106 306 112 272 C 118 238 110 204 106 172 C 102 146 114 124 134 112 Z', REN_EARR = 'M226 112 C 260 102 304 126 320 180 C 334 230 332 286 308 306 C 286 324 254 306 248 272 C 242 238 250 204 254 172 C 258 146 246 124 226 112 Z';
function renHead(g, mood, mug) { // アニメの座標（頭の中心は 180,200 あたり）
  const c = RC.ren, hb = [68, 105, 224, 187];
  furP(g, 'M180 105 C 252 105 292 150 292 202 C 292 258 246 292 180 292 C 114 292 68 258 68 202 C 68 150 108 105 180 105 Z', hb, rgB(g, hb, .5, .42, .62, [[0, c.head1], [.65, c.head2], [1, c.head3]]), c.head3);
  soft(g, 180, 250, 70, 34, '#E9D3B6', .75, 7); soft(g, 180, 108, 46, 13, '#E3C7A3', .7, 3);
  sPath(g, 'M138 122 C 152 112 168 110 180 112 C 192 110 208 112 222 122', '#A98863', 3, .55);
  soft(g, 150, 196, 20, 18, '#EAD7BE', .8, 3); soft(g, 210, 196, 20, 18, '#EAD7BE', .8, 3);
  for (const [d, b, tx, fold] of [[REN_EARL, [28, 104, 108, 214], 66, 'M112 122 C 122 112 136 110 150 118'], [REN_EARR, [226, 104, 108, 214], 294, 'M248 122 C 238 112 224 110 210 118']]) {
    furP(g, d, b, lgB(g, b, .2, 1, [[0, c.ear1], [.6, c.ear2], [1, c.ear3]]), c.ear3); soft(g, tx, 296, 24, 12, c.ear3, .22, 3); sPath(g, fold, c.ear3, 4, .5); }
  for (const e of [[168, 242, 17, 13], [192, 242, 17, 13], [180, 259, 13, 8]]) furP(g, e, null, c.cream, '#E6D7C1', { plain: 1 });
  eyes(g, 'ren', 150, 210, 195, 13, mood);
  fPath(g, 'M173 229 Q180 225 187 229 Q184 235 180 236 Q176 235 173 229 Z', c.nose);
  rigMouth(g, 180, 243, mood, c.mouth, 12);
  if (mood !== 'open' && mood !== 'sick' && mood !== 'worry' && mood !== 'blink') { blob(g, 124, 228, 15, 9, 0, c.blush, .42); blob(g, 236, 228, 15, 9, 0, c.blush, .42); }
  sPath(g, 'M158 240 Q122 230 92 229 M158 246 Q124 247 96 254 M202 240 Q238 230 268 229 M202 246 Q236 247 264 254', '#FBF6EE', 1.2, .85);
  g.save(); g.translate(180, 200); g.scale(1 / RK.ren, 1 / RK.ren); moodFx(g, mood, -44, 58);
  { const hk = mug ? 'mug' : WEAR.ren.hat; if (hk) wearHat(g, hk, 0, -45, 1, 58, 22, 'ren'); else if (WEAR.ren.suit === 'bee') antennae(g, 0, -45, 1); }
  g.restore();
}
function renBack(g, cx, cy, sc, e) { // 後ろから見た頭：アニメの頭と耳の形のまま。e＝耳のゆれ（走る・跳ぶ）
  const c = RC.ren, hb = [68, 105, 224, 187]; g.save(); g.translate(cx, cy); g.scale(sc * RK.ren, sc * RK.ren); g.translate(-180, -200);
  furP(g, 'M180 105 C 252 105 292 150 292 202 C 292 258 246 292 180 292 C 114 292 68 258 68 202 C 68 150 108 105 180 105 Z', hb, rgB(g, hb, .5, .42, .62, [[0, c.head1], [.65, c.head2], [1, c.head3]]), c.head3);
  soft(g, 180, 108, 46, 13, '#E3C7A3', .7, 3); sPath(g, 'M138 122 C 152 112 168 110 180 112 C 192 110 208 112 222 122', '#A98863', 3, .55);
  for (const [d, b, px, sd, tx, fold] of [[REN_EARL, [28, 104, 108, 214], 130, -1, 66, 'M112 122 C 122 112 136 110 150 118'], [REN_EARR, [226, 104, 108, 214], 230, 1, 294, 'M248 122 C 238 112 224 110 210 118']]) {
    g.save(); g.translate(px, 120); g.rotate(sd * (e || 0) * 30 * Math.PI / 180); g.translate(-px, -120);
    furP(g, d, b, lgB(g, b, .2, 1, [[0, c.ear1], [.6, c.ear2], [1, c.ear3]]), c.ear3); soft(g, tx, 296, 24, 12, c.ear3, .22, 3); sPath(g, fold, c.ear3, 4, .5); g.restore(); }
  g.restore();
}
function faceRen(g, cx, cy, sc, mood, mug) { g.save(); g.translate(cx, cy); g.scale(sc * RK.ren, sc * RK.ren); g.translate(-180, -200); renHead(g, mood, mug); g.restore(); }
function jillEars(g, sway, back) { const c = RC.jil; for (const [x, y, rot, sd] of [[164, 118, -12, -1], [212, 116, 13, 1]]) { g.save(); g.translate(x, 150); g.rotate((rot + sd * (sway || 0)) * Math.PI / 180); g.translate(-x, -150); const b = [x - 22, y - 36, 44, 72]; furP(g, [x, y, 22, 36], null, lgB(g, b, 0, 1, [[0, c.ear1], [1, c.ear2]]), c.ear2); if (!back) { g.fillStyle = lgB(g, [x - 11, y - 23, 22, 52], 0, 1, [[0, c.earIn1], [1, c.earIn2]]); g.beginPath(); g.ellipse(x, y + 3, 11, 26, 0, 0, Math.PI * 2); g.fill(); } g.restore(); } }
function jillHead(g, mood) { // アニメの座標（頭の中心は 188,210）
  const c = RC.jil, hb = [92, 130, 192, 160];
  jillEars(g);
  furP(g, 'M188 130 C 248 130 284 166 284 210 C 284 260 240 290 188 290 C 136 290 92 260 92 210 C 92 166 128 130 188 130 Z', hb, rgB(g, hb, .5, .42, .62, [[0, c.head1], [.65, c.head2], [1, c.head3]]), c.head3);
  soft(g, 188, 252, 66, 30, '#EED9BE', .75, 7); soft(g, 148, 200, 27, 25, '#F0DDC4', .9, 3); soft(g, 228, 200, 27, 25, '#F0DDC4', .9, 3);
  for (const e of [[178, 242, 16, 12.5], [198, 242, 16, 12.5], [188, 258, 12, 7]]) furP(g, e, null, c.cream, '#E9DAC5', { plain: 1 });
  eyes(g, 'jill', 148, 228, 201, 18, mood);
  fPath(g, 'M181 229 Q188 225 195 229 Q192 235 188 236 Q184 235 181 229 Z', c.nose);
  rigMouth(g, 188, 243, mood, c.mouth, 10);
  if (mood !== 'open' && mood !== 'sick' && mood !== 'worry' && mood !== 'blink') { blob(g, 118, 232, 14, 8, 0, c.blush, .42); blob(g, 258, 232, 14, 8, 0, c.blush, .42); }
  sPath(g, 'M166 240 Q130 230 98 226 M166 246 Q132 248 102 256 M210 240 Q246 230 278 226 M210 246 Q244 248 274 256', '#FBF6EE', 1.2, .9);
  { const ring = FRAME_COL[WEAR.jill.frame] || FRAME_COL.brown; g.save(); g.strokeStyle = WEAR.jill.frame && WEAR.jill.frame !== 'brown' ? ring : '#9A7F5A'; g.lineWidth = 2.2; g.lineCap = 'round';
    g.beginPath(); g.arc(148, 201, 26, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(228, 201, 26, 0, Math.PI * 2); g.stroke(); g.stroke(new Path2D('M174 197 Q188 190 202 197 M122 197 L106 192 M254 197 L270 192')); g.restore();
    sPath(g, 'M136 186 l7 -7', '#FFFFFF', 2, .6); }
  g.save(); g.translate(188, 210); g.scale(1 / RK.jil, 1 / RK.jil); moodFx(g, mood, -40, 56);
  const hk = WEAR.jill.hat;
  if (hk) jillHat(g, hk, 1); else if (WEAR.jill.suit === 'zebra') zebraMane(g, 0, -60, 22, .8);
  g.restore();
  // 耳は帽子の後ろから立つ（前は帽子に穴をあけて耳を突き出していた。2026-11-15 オーナー：「耳が突き出してしまうのはおかしい」）
}
/* ジルの帽子（2026-11-15 オーナー：「ベレー帽で耳が突き出すのはおかしい・ベレー帽に見えない」）：ジルの耳は頭のまん中近くに立っているので、
   頭の上に帽子を置くと耳が隠れ、穴をあけると耳が帽子から突き出す。そこで、小さめの帽子を頭の横（向かって右）にかたむけてかぶる。両耳はそのまま見える。
   side＝1 前から・-1 後ろから（反対側に見える）。単位は顔の大きさ（帽子の後ろの耳は先に描いてある） */
const JILL_HAT = { beret: [36, -36, 34, .5], helmet: [34, -36, 35, .42], straw: [34, -38, 31, .4], santa: [32, -38, 32, .45], witch: [30, -42, 30, .4], pumpkin: [38, -32, 27, .48], crown: [28, -46, 25, .3], kagami: [26, -48, 23, .24], antler: [0, -40, 40, 0], heartband: [0, -40, 40, 0], laurel: [0, -42, 40, 0] }; // カチューシャ・月桂冠は頭の上を左右に通るので、まん中に水平 // 王冠・鏡もちも横に（まん中にのせると耳が隠れた）
function jillHat(g, hk, side) { const f = JILL_HAT[hk] || [32, -42, 28, .4]; wearHat(g, hk, side * f[0], f[1], .9, f[2], 8, 'jill', side * f[3]); }
function faceJill(g, cx, cy, sc, mood) { g.save(); g.translate(cx, cy); g.scale(sc * RK.jil, sc * RK.jil); g.translate(-188, -210); jillHead(g, mood); g.restore(); }
function pomEar(g, x, y, r, rot, back) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.ellipse(0, 0, r, r * 1.05, 0, 0, Math.PI * 2); g.fillStyle = '#8E786C'; g.fill(); g.beginPath(); g.ellipse(0, r * .12, r * .72, r * .78, 0, 0, Math.PI * 2); g.fillStyle = back ? '#A8928A' : '#E9A9A2'; g.fill();
  g.strokeStyle = 'rgba(70,55,50,.55)'; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, r * .98, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.restore(); }
function headband(g, x, y, w, back, ph) { // Pom's red sweatband; from behind the knot and its two tails flutter
  const bc = BAND_COL[WEAR.pom.band] || BAND_COL.red; g.save(); g.strokeStyle = bc[0]; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - w, y + 4); g.quadraticCurveTo(x, y - 7, x + w, y + 4); g.stroke();
  g.strokeStyle = bc[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(x - w * .8, y + 1); g.quadraticCurveTo(x, y - 8, x + w * .8, y + 1); g.stroke();
  if (back) { const t = ph || 0; g.fillStyle = bc[0]; g.beginPath(); g.ellipse(x + 6, y - 1, 7, 6, 0, 0, Math.PI * 2); g.fill();
    for (const k of [0, 1]) { g.beginPath(); g.moveTo(x + 8, y); const ex = x + 40 + k * 6, ey = y + 8 + k * 14 + Math.sin(t * 2 + k) * 5; g.quadraticCurveTo(x + 24, y - 4 + k * 8 + Math.sin(t * 2 + k + 1) * 4, ex, ey); g.lineTo(ex - 2, ey + 7); g.quadraticCurveTo(x + 22, y + 4 + k * 8, x + 8, y + 6); g.closePath(); g.fill(); } }
  g.restore();
}
function pomHead(g, mood) { // アニメの座標（足もとが 0,0・頭の中心は 0,-128）
  const c = RC.pom, hy = -128, ck = mood === 'puff' ? 1 : 0, hb = [-64, hy - 55, 128, 110];
  for (const sd of [-1, 1]) { g.save(); g.translate(sd * 42, hy - 44); g.rotate(sd * 22 * Math.PI / 180); furP(g, [0, 0, 17, 18], null, c.earO, '#7A665C', { plain: 1 }); blob(g, 0, 2, 12, 13, 0, c.earI); g.restore(); }
  furP(g, [0, hy, 64, 55], null, b => rgB(g, b, .5, .4, .65, [[0, '#F7E9D3'], [.6, c.a], [1, c.b]]), c.b);
  soft(g, 0, hy - 24, 44, 26, '#E2BE8C', .4, 4);
  const cr = 1 + 1.45 * ck;
  for (const sd of [-1, 1]) furP(g, [sd * (34 + 24 * ck), hy + 18 + 8 * ck, 26 * cr, 22 * (1 + 1.1 * ck)], null, b => rgB(g, b, .45, .4, .6, [[0, '#FFFFFF'], [.62, c.cream], [.9, '#EBDCC6'], [1, '#D9C4A4']]), '#DCC9AB', { plain: 1 });
  if (mood !== 'open' && mood !== 'blink' && mood !== 'sick' && mood !== 'worry') for (const sd of [-1, 1]) blob(g, sd * (36 + 18 * ck), hy + 16, 9 + 6 * ck, 5 + 3 * ck, 0, '#EC8C8C', .45);
  eyes(g, 'pom', -22 - 2 * ck, 22 + 2 * ck, hy - 6, 9.5, mood === 'puff' ? 'happy' : mood);
  blob(g, 0, hy + 14, 6.5, 4.8, 0, c.nose);
  { const m = mood === 'sick' ? 'wavy' : mood === 'worry' || mood === 'yawn' ? 'o' : mood === 'sparkle' || mood === 'cheer' ? 'open' : 'w';
    if (m === 'w') sPath(g, `M0 ${hy + 24} V${hy + 28} M0 ${hy + 28} q-4 4 -8 2 M0 ${hy + 28} q4 4 8 2`, '#9A5A50', 2); else rigMouth(g, 0, hy + 27, mood, '#9A5A50', 8); }
  sPath(g, `M-14 ${hy + 18} L-${54 + 20 * ck} ${hy + 10} M-14 ${hy + 22} L-${52 + 20 * ck} ${hy + 26} M14 ${hy + 18} L${54 + 20 * ck} ${hy + 10} M14 ${hy + 22} L${52 + 20 * ck} ${hy + 26}`, '#FFFFFF', 1.3, .85);
  { const bc = BAND_COL[WEAR.pom.band] || BAND_COL.red; // はちまき（結び目は向かって右）
    sPath(g, `M-54 ${hy - 24} Q0 ${hy - 44} 54 ${hy - 24}`, bc[0], 10); sPath(g, `M-44 ${hy - 28} Q0 ${hy - 45} 44 ${hy - 28}`, '#FFFFFF', 2, .4);
    fPath(g, `M50 ${hy - 26} q16 2 22 12 l-6 4 q-6 -8 -16 -10 Z M50 ${hy - 26} q18 -6 26 0 l-4 6 q-8 -4 -20 0 Z`, bc[0]); }
  g.save(); g.translate(0, hy); g.scale(1 / RK.pom, 1 / RK.pom);
  if (WEAR.pom.hat) wearHat(g, WEAR.pom.hat, 0, -50, .95, 42, 12, 'pom'); else if (WEAR.pom.suit === 'bee') antennae(g, 0, -52, .9);
  moodFx(g, mood, -40, 54); g.restore();
}
function facePom(g, cx, cy, sc, mood) { g.save(); g.translate(cx, cy); g.scale(sc * RK.pom, sc * RK.pom); g.translate(0, 128); pomHead(g, mood); g.restore(); }
function drawPom(g, p) {
  const P = PAL.pom, sx = p.slide ? 1.2 : 1 + (1 - p.sq) * .6, sy = p.slide ? .66 : p.sq;
  const by = GROUND_Y - 70 * sy - p.lift, brx = 84 * sx, bry = 72 * sy;
  if (p.view === 'front') { // アニメと同じ形（pom_debut.js の pomShape）
    const c = RC.pom, S = 1; g.save(); g.translate(150, GROUND_Y - p.lift); g.scale(S, S * sy);
    blob(g, -30, -5, 17, 8, 0, c.pink); blob(g, 30, -5, 17, 8, 0, c.pink);
    if (WEAR.pom.suit === 'bee') beeWings(g, 0, -78, 1, -.15);
    furP(g, [0, -60, 76, 62], null, b => rgB(g, b, .4, .3, .8, [[0, c.a], [.6, c.b], [1, c.deep]]), c.deep);
    if (WEAR.pom.suit) suitOver(g, WEAR.pom.suit, 0, -60, 76, 62); else furP(g, [0, -46, 48, 40], null, c.cream, '#E9DCC8', { plain: 1, a: .95 });
    g.save(); g.translate(-30, -40); g.scale(.9, .9); g.lineJoin = 'round'; g.lineWidth = 1; // 若葉の社員バッジ
    g.beginPath(); g.moveTo(0, 12); g.lineTo(-9, 0); g.lineTo(-9, -11); g.lineTo(0, -4); g.closePath(); g.fillStyle = '#F2C230'; g.fill(); g.strokeStyle = '#B8901C'; g.stroke();
    g.beginPath(); g.moveTo(0, 12); g.lineTo(9, 0); g.lineTo(9, -11); g.lineTo(0, -4); g.closePath(); g.fillStyle = '#3FA34D'; g.fill(); g.strokeStyle = '#2C7A37'; g.stroke(); g.restore();
    pomHead(g, p.mood);
    { const up = p.mood === 'cheer' ? 12 : 0; blob(g, -26, -96 - up, 11, 9, 0, c.pink); blob(g, 26, -96 - up, 11, 9, 0, c.pink); } // 手はほっぺの下（アニメの立ち絵と同じ）。ばんざいで少し上がる
    g.restore(); return;
  }
  // back / look: one round pear-shaped body (hamsters have no neck), pink soles, a stub of a tail
  const fy = GROUND_Y - 6 - Math.max(0, p.feet) * 7, fo = Math.max(0, -p.feet) * 8;
  for (const sd of [-1, 1]) { blob(g, 150 + sd * brx * .5, fy + fo * .3, 17, 9 + fo * .3, 0, '#F2B8B0'); blob(g, 150 + sd * brx * .5, fy + fo * .3 + 1, 9, 4, 0, 'rgba(200,120,120,.45)'); }
  if (WEAR.pom.suit === 'bee') beeWings(g, 150, by - bry * .2, 1, Math.sin((p.tiePh || 0) * 3) * .15);
  fur(g, 150, by, brx, bry, 0, P.a, P.b);
  if (WEAR.pom.suit) suitOver(g, WEAR.pom.suit, 150, by, brx, bry);
  { const gl = g.createRadialGradient(150, by - bry * .4, 6, 150, by - bry * .3, brx); gl.addColorStop(0, 'rgba(222,182,128,.55)'); gl.addColorStop(1, 'rgba(222,182,128,0)'); g.fillStyle = gl; g.beginPath(); g.ellipse(150, by - bry * .25, brx * .9, bry * .8, 0, 0, Math.PI * 2); g.fill(); } // warmer back
  blob(g, 150, by + bry * .62, 7, 5, 0, '#E8CFA8');
  const hy = by - bry * .55 + (p.slide ? 14 : 0);
  if (p.view === 'look') { facePom(g, 156, hy - 24, .98, p.mood); if (p.mood === 'cheer') { fur(g, 150 + 56, hy + 10, 9, 16, -.6, P.a, P.b); blob(g, 150 + 64, hy - 6, 10, 8, -.3, '#F2B8B0'); } return; }
  pomEar(g, 150 - 40, hy - 26, 16 + p.ear * 2, -.3 - p.ear * .3, 1); pomEar(g, 150 + 40, hy - 26, 16 + p.ear * 2, .3 + p.ear * .3, 1);
  headband(g, 150, hy - 4, 58, 1, p.tiePh);
  if (WEAR.pom.hat) wearHat(g, WEAR.pom.hat, 150, hy - 30, 1, 46, 12, 'pom'); else if (WEAR.pom.suit === 'bee') antennae(g, 150, hy - 24, 1);
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
  if (p.view === 'front') { // アニメと同じ形（rig.js の buildRen / buildJil の「すわる」）。レンは体が向かって左、ジルは右
    const suit = WEAR[who].suit, S = .72; g.save(); g.translate(150, GROUND_Y - p.lift); g.scale(ren ? -S : S, S * sy);
    if (ren) { const c = RC.ren; g.translate(-211, -402);
      if (suit === 'bee') beeWings(g, 240, 280, 1.4, -.15);
      furP(g, [240, 304, 148, 90], null, b => rgB(g, b, .35, .3, .8, [[0, c.fur1], [.55, c.fur2], [1, c.fur3]]), c.fur3);
      furP(g, [338, 386, 56, 15], null, '#D6BB98', '#BFA27E', { plain: 1 });
      if (suit) suitOver(g, suit, 240, 304, 148, 90); else { g.save(); g.beginPath(); g.ellipse(240, 304, 148, 90, 0, 0, Math.PI * 2); g.clip(); soft(g, 176, 323, 80, 68, c.cream, 1, 9); g.restore(); } // 胸のクリーム色は体の外にはみ出さない
      furP(g, [150, 390, 24, 13], null, '#F0E3D1', '#DCCBB3', { plain: 1 }); furP(g, [204, 392, 24, 13], null, '#F0E3D1', '#DCCBB3', { plain: 1 });
      { const T = TIE_COL[WEAR.ren.tie] || TIE_COL.gold, blade = 'M177 293 L187 293 L193 334 L182 345 L171 334 Z'; g.save(); g.translate(182, 286); g.rotate(10 * Math.PI / 180); g.translate(-182, -286);
        fPath(g, 'M175 282 L189 282 L187 293 L177 293 Z', T[0]); fPath(g, blade, T[0]); g.save(); g.clip(new Path2D(blade)); tiePattern(g, WEAR.ren.tie, 170, 293, 24, 54); g.restore(); sPath(g, 'M182 296 L182 340', T[1], 2, .6); g.restore(); }
      renHead(g, p.mood, p.mug);
    } else { const c = RC.jil; g.translate(-217, -402);
      if (suit === 'bee') beeWings(g, 222, 300, 1.25, -.15);
      furP(g, [222, 322, 112, 74], null, b => rgB(g, b, .35, .3, .8, [[0, c.fur1], [.55, c.fur2], [1, c.fur3]]), c.fur3);
      furP(g, [300, 388, 42, 12], null, '#DABE9C', '#C2A480', { plain: 1 });
      if (suit) suitOver(g, suit, 222, 322, 112, 74); else { g.save(); g.beginPath(); g.ellipse(222, 322, 112, 74, 0, 0, Math.PI * 2); g.clip(); soft(g, 184, 334, 60, 54, c.cream, 1, 8); g.restore(); }
      furP(g, [164, 390, 19, 11], null, '#F3E8DA', '#DFD0BB', { plain: 1 }); furP(g, [206, 391, 19, 11], null, '#F3E8DA', '#DFD0BB', { plain: 1 });
      sPath(g, 'M166 284 L188 316 L210 284', c.theme, 3); rr(g, 177, 314, 22, 28, 3, '#FFFFFF', c.theme, 1.8); rr(g, 181, 318, 14, 9, 1, c.head2); sPath(g, 'M181 332 H195 M181 337 H191', '#9AA9B6', 1.8);
      jillHead(g, p.mood);
    }
    g.restore(); return;
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
    if (ren) { faceRen(g, 150 + 10, hy - 2, 1.12, p.mood, p.mug); }
    else { faceJill(g, 150 + 8, hy + 2, 1.04, p.mood); }
    if (p.mood === 'cheer') { const px = 150 + (ren ? 76 : 60), py = hy + (ren ? 10 : 6); fur(g, px, py + 26, ren ? 13 : 10, ren ? 22 : 17, -.5, P.a, P.b); blob(g, px + 6, py + 4, ren ? 15 : 12, ren ? 11 : 9, -.3, P.cream); } // a paw thrown up in the air
    return;
  }
  if (ren) {
    renBack(g, 150, hy - 2, 1.12, p.ear); // 後ろ姿も、アニメの頭と耳の形（顔だけ無い）
    if (p.tie != null) { // the tie comes out from under his chin and streams back over his shoulder in the wind
      windTie(g, 152, hy + 50, p);
      fur(g, 150, hy + 44, 30, 13, 0, '#D6AE82', '#BE9369', { sparse: 1, rim: 1 }); // the chin/neck fur tucks the root in
    }
    { const hk = p.mug ? 'mug' : WEAR.ren.hat; if (hk) wearHat(g, hk, 150, hy - 2 - 45 * 1.12, 1.12, 58 * 1.12, 22 * 1.12, 'ren'); else if (WEAR.ren.suit === 'bee') antennae(g, 150, hy - 52, 1); } // 前向きと同じ大きさ・位置
  } else {
    const jb = fn => { g.save(); g.translate(150, hy); g.scale(RK.jil, RK.jil); g.translate(-188, -210); fn(); g.restore(); }; // アニメの座標で描く
    const ears = () => jb(() => jillEars(g, p.ear * 26, 1));
    ears();
    jb(() => { const c = RC.jil, hb = [92, 130, 192, 160]; furP(g, 'M188 130 C 248 130 284 166 284 210 C 284 260 240 290 188 290 C 136 290 92 260 92 210 C 92 166 128 130 188 130 Z', hb, rgB(g, hb, .5, .42, .62, [[0, c.head1], [.65, c.head2], [1, c.head3]]), c.head3); soft(g, 188, 150, 50, 16, '#EED9BE', .35, 5); });
    g.strokeStyle = '#3F6E99'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(106, hy + 40); g.quadraticCurveTo(150, hy + 62, 194, hy + 40); g.stroke();
    if (WEAR.jill.suit === 'zebra') zebraMane(g, 150, hy - 50, 52, 1);
    if (WEAR.jill.hat) { g.save(); g.translate(150, hy); jillHat(g, WEAR.jill.hat, -1); g.restore(); } // 後ろから見ると、帽子は反対側
  }
}
function lanyard(g, x, y) { g.strokeStyle = '#3F6E99'; g.lineWidth = 3.5; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 34, y - 16); g.lineTo(x - 3, y + 22); g.moveTo(x + 34, y - 16); g.lineTo(x + 3, y + 22); g.stroke(); rr(g, x - 13, y + 20, 26, 34, 4, '#FBF6EE', '#355F86', 3); rr(g, x - 8, y + 25, 16, 10, 2, '#C9A176'); rr(g, x - 8, y + 39, 16, 2.5, 1, '#9AA9B6'); rr(g, x - 3, y + 44, 11, 2.5, 1, '#9AA9B6'); }

const BUN = { ren: {}, jill: {}, pom: {} };
const RUN_FRAMES = 8;
/* 2026-11-15：起動を速く。開いた直後（題名画面）に要るのは前向きの絵だけなので、まずそれだけ描く（part = 'front'）。
   走る・跳ぶ・ふり返るの絵（part = 'rest'・全体の 7 割）は、題名が出たあと少しずつ描く。スタートを押した時にまだ残っていれば、その場で描き終える（bunniesNow）。
   part なし＝全部（着せかえ・消えた絵の描き直し。今までどおり） */
let BUN_LAZY = 0; const BUN_TODO = new Set();
function buildBunnies(only, part) {
  if (!part && BUN_LAZY) part = 'front';
  for (const who of ['ren', 'jill', 'pom']) {
    if (only && who !== only) continue; BUN[who] = BUN[who] || {};
    if (part === 'front') BUN_TODO.add(who); else BUN_TODO.delete(who);
    for (const mug of [0, 1]) {
      if (who !== 'ren' && mug) continue;
      const key = mug ? 'm' : '';
      if (part !== 'front') {
      for (let k = 0; k < RUN_FRAMES; k++) {
        const ph = k / RUN_FRAMES * Math.PI * 2;
        SEED = 11 + k;
        BUN[who]['run' + k + key] = paint(g => drawBody(g, who, { lift: Math.max(0, Math.sin(ph)) * 16, sq: 1 - .08 * Math.cos(ph * 2), feet: -Math.sin(ph), ear: Math.sin(ph + .9) * .12, tie: 0, tiePh: ph, view: 'back', mug }));
      }
      SEED = 3; BUN[who]['air' + key] = paint(g => drawBody(g, who, { lift: 10, sq: 1.04, feet: -.6, ear: -.3, tie: 0, tiePh: 1.2, air: 1, view: 'back', mug }));
      /* 2026-11-15：落ちてくる時の絵（前は跳んでいる間ずっと同じ絵だった）。のぼりは耳が下に流れて足をたたむ、くだりは耳がふわっと開いて足を着地にのばす */
      SEED = 3; BUN[who]['fall' + key] = paint(g => drawBody(g, who, { lift: 10, sq: .98, feet: .55, ear: .32, tie: 0, tiePh: 2.6, air: 1, view: 'back', mug }));
      SEED = 4; BUN[who]['slide' + key] = paint(g => drawBody(g, who, { lift: 0, sq: 1, feet: .5, ear: .35, tie: 0, tiePh: 2.4, view: 'back', slide: 1, mug }));
      for (const mood of ['happy', 'sparkle', 'wink', 'open', 'sick', 'worry', 'cheer'].concat(who === 'pom' ? ['puff'] : [])) { SEED = 5; BUN[who]['look_' + mood + key] = paint(g => drawBody(g, who, { lift: 6, sq: 1, feet: 0, ear: 0, view: 'look', mood, mug })); }
      }
      if (part !== 'rest') for (const mood of ['open', 'blink', 'happy', 'cheer', 'sleepy', 'yawn'].concat(who === 'pom' ? ['puff', 'sparkle'] : [])) { SEED = 6; BUN[who]['front_' + mood + key] = paint(g => drawBody(g, who, { lift: 0, sq: 1, feet: 0, ear: 0, view: 'front', mood, mug })); }
    }
  }
}
// 残りの絵（走る・跳ぶ・ふり返る）を今すぐ描き終える（スタートの直前など）
function bunniesNow() { for (const who of [...BUN_TODO]) buildBunnies(who, 'rest'); }
// 残りの絵を、題名が出たあと 1 匹ずつ描く（画面を止めない）
function bunniesLater() { const step = () => { const who = [...BUN_TODO][0]; if (!who) return; try { buildBunnies(who, 'rest'); } catch (e) { } if (BUN_TODO.size) setTimeout(step, 80); }; setTimeout(step, 350); }
function paint(fn) { const c = mk(BS, BS + BTOP); const g = c.getContext('2d') || noCtx(); g.lineJoin = 'round'; g.translate(0, BTOP); fn(g); return c; }
function bunFrame(who, pose, mug) { const k = mug && who === 'ren' ? 'm' : ''; const f = BUN[who][pose + k] || BUN[who][pose] || BUN[who]['front_open'] || BUN[who].run0; if (f && PIC_SEEN.size < 12) PIC_SEEN.add(f); return f; }
/* 題名画面のカード用の、くっきりした絵（2026-11-15）。キャラクターごとに 2 つまで（ふだんの顔と、まばたき）。元の絵が描き直されたら（着せかえ・消えた絵の描き直し）作り直す。
   走り始めたら手放す（スマホの絵のメモリを空ける）。作れないときは、今までの絵で描く */
const BUN_HI = { ren: [], jill: [], pom: [] };
function bunHi(who, mood, base, k) {
  const L = BUN_HI[who] || (BUN_HI[who] = []); let e = L.find(x => x.mood === mood);
  if (e && e.base === base && e.k >= k - .01 && e.c.width) { e.t = performance.now(); return e.c; }
  try { const c = mk(Math.round(BS * k), Math.round((BS + BTOP) * k)), g = c.getContext('2d'); if (!g) return base; g.lineJoin = 'round'; g.scale(k, k); g.translate(0, BTOP); SEED = 6;
    drawBody(g, who, { lift: 0, sq: 1, feet: 0, ear: 0, view: 'front', mood, mug: who === 'ren' && SV.mugOn ? 1 : 0 });
    if (e) { try { e.c.width = e.c.height = 0; } catch (x) { } L.splice(L.indexOf(e), 1); }
    while (L.length >= 2) { L.sort((a, b) => a.t - b.t); const o = L.shift(); try { o.c.width = o.c.height = 0; } catch (x) { } }
    L.push({ mood, base, k, c, t: performance.now() }); return c;
  } catch (x) { return base; }
}
function bunHiFree() { for (const w in BUN_HI) { for (const e of BUN_HI[w]) { try { e.c.width = e.c.height = 0; } catch (x) { } } BUN_HI[w] = []; } }
/* カードの絵の細かさを、画面の細かさに合わせる（220×200 の絵を正方形の枠に入れていて、縦に 1 割のびていた。正方形の絵にして、のびをなくす） */
function charCardFit() { const dpr = Math.min(3, window.devicePixelRatio || 1); for (const id of ['cvRen', 'cvJill', 'cvPom']) { const c = document.getElementById(id); if (!c) continue; const cw = c.clientWidth || 110, n = Math.max(160, Math.min(450, Math.round(cw * dpr))); if (Math.abs(c.width - n) > 8 || c.height !== c.width) { c.width = n; c.height = n; } } }
function drawCharCard(cv, who, t) {
  const g = cv.getContext('2d') || noCtx(); g.clearRect(0, 0, cv.width, cv.height);
  /* 選んだときに、はねたり顔が切りかわったりしない（2026-11-15：オーナー「チカチカするやつ、いらない」。選んだ印は、わくの色で足りる） */
  const mood = (t % 3.4) < .14 ? 'blink' : ((t % 9) > 7.4 ? 'happy' : 'open'), hop = 0;
  const base = bunFrame(who, 'front_' + mood, SV.mugOn);
  const s = cv.width / BS * 1.05 * (who === 'pom' ? 1.25 : 1), bob = Math.sin(t * 2.2) * 2;
  const img = s > 1.15 ? bunHi(who, mood, base, Math.min(2, s)) : base; /* 大きく映すときは、その大きさで描いた絵を使う（小さい絵を引きのばすと、ぼやける） */
  g.imageSmoothingQuality = 'high';
  g.save(); g.translate(cv.width / 2, cv.height * .98 + bob * 0); g.scale(s, s * (1 + Math.sin(t * 2.2) * .012));
  g.fillStyle = 'rgba(59,42,32,.14)'; g.beginPath(); g.ellipse(0, -14, 100 * (1 - hop / cv.height * 2), 14, 0, 0, Math.PI * 2); g.fill();
  g.drawImage(img, -BS / 2, -GROUND_Y - 4 - BTOP - hop / s, BS, BS + BTOP); g.restore();
}

/* ---- kept pictures that went blank are painted again (2026-11-13 の報告：プレイ中にキャラクターが透明になって消え、選択画面でも消えたまま) ----
   An iPhone that is short of memory (or comes back from the background) can empty the pictures a page keeps: the canvases are still
   there, but with nothing in them. The stage is drawn fresh every frame, so it carried on, but the characters are kept pictures and
   stayed invisible, in the run and on the title, until the page was loaded again. Once a second the pictures in use are looked at;
   an empty one means: paint them again (and, when the item pictures are empty too, every other kept picture as well). */
const PIC_SEEN = new Set(); let PIC_NEXT = 0, PIC_FIX = 0, PIC_BAD = 0, PIC_WAIT = 1000;
const PIC_PROBE = (() => { try { const c = document.createElement('canvas'); c.width = c.height = 16; return c.getContext('2d', { willReadFrequently: true }); } catch (e) { return null; } })();
function picBlank(img) { // true: nothing in it / false: something is drawn / null: cannot tell (then nothing is done)
  if (!img) return null; if (!img.width || !img.height) return true; if (!PIC_PROBE) return null;
  try { PIC_PROBE.clearRect(0, 0, 16, 16); PIC_PROBE.drawImage(img, 0, 0, 16, 16); const d = PIC_PROBE.getImageData(0, 0, 16, 16).data; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) return false; return true; } catch (e) { return null; }
}
function picCheck(now, force) {
  if (!force && now < PIC_NEXT) return; PIC_NEXT = now + PIC_WAIT;
  let bad = PIC_BAD; const list = [...PIC_SEEN]; PIC_SEEN.clear(); for (const w of ['ren', 'jill', 'pom']) if (BUN[w] && BUN[w].front_open) list.push(BUN[w].front_open);
  if (!bad) for (const f of list) if (picBlank(f) === true) { bad = 1; break; }
  if (!bad) { PIC_WAIT = 1000; return; }
  picRepair(); PIC_WAIT = PIC_BAD ? Math.min(8000, PIC_WAIT * 2) : 1000; PIC_NEXT = now + PIC_WAIT; // no picture memory yet: again in a moment, a little later each time
}
function picRepair() {
  PIC_FIX++; window.__picFix = PIC_FIX; const low = CANVAS_LOW, all = picBlank(SPR.hay) === true;
  try { freePictures(); } catch (e) { } // the loose copies first: the memory they held is what the new pictures need
  for (const w of ['ren', 'jill', 'pom']) for (const k in BUN[w]) { try { BUN[w][k].width = BUN[w][k].height = 0; } catch (e) { } }
  if (all) { try { picRepairAll(); } catch (e) { } }
  buildBunnies(); PIC_BAD = CANVAS_LOW !== low ? 1 : 0;
}
