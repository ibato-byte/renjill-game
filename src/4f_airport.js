/* ================= the airport (departure hall + observation deck) =================
   generic airliners (no airline colors or logos), a flip-style departure board, check-in counters, luggage carts,
   and on the horizon: the terminal, the control tower and a plane taking off over the bay every few seconds */

// ---- a generic airliner, side view, nose to the right. (x, y) = the wheels' contact point; s = length in px
function drawPlane(g, x, y, s, ang, N, gear) {
  g.save(); g.translate(x, y); g.rotate(ang || 0);
  const L = s, Hh = s * .11, top = -Hh - (gear ? s * .05 : 0), mid = top + Hh / 2;
  const body = N > .4 ? ['#C9D2E6', '#8E9AB8'] : ['#FFFFFF', '#C9D0D8'], fin = N > .4 ? '#6F86B8' : '#7FB3D9';
  // far wing and engine (behind the body)
  g.fillStyle = N > .4 ? '#8390AE' : '#B8C1CB'; g.beginPath(); g.moveTo(-L * .02, mid); g.lineTo(L * .16, mid); g.lineTo(-L * .1, mid - Hh * 1.5); g.lineTo(-L * .16, mid - Hh * 1.5); g.closePath(); g.fill();
  // tail fin and the little tailplane
  const fg = g.createLinearGradient(-L * .5, top - Hh * 2.4, -L * .36, top); fg.addColorStop(0, fin); fg.addColorStop(1, shadeHex(fin, .8)); g.fillStyle = fg;
  g.beginPath(); g.moveTo(-L * .47, top + Hh * .1); g.quadraticCurveTo(-L * .5, top - Hh * 1.6, -L * .52, top - Hh * 2.3); g.lineTo(-L * .43, top - Hh * 2.3); g.quadraticCurveTo(-L * .36, top - Hh * .6, -L * .3, top + Hh * .2); g.closePath(); g.fill();
  g.fillStyle = shadeHex(fin, .85); g.beginPath(); g.ellipse(-L * .44, mid - Hh * .1, L * .07, Hh * .16, -.08, 0, Math.PI * 2); g.fill();
  // fuselage: a long rounded capsule with a soft top-lit gradient
  const bg = g.createLinearGradient(0, top, 0, top + Hh); bg.addColorStop(0, body[0]); bg.addColorStop(.55, body[0]); bg.addColorStop(1, body[1]); g.fillStyle = bg;
  g.beginPath(); g.moveTo(-L * .5, top + Hh * .25); g.quadraticCurveTo(-L * .5, top, -L * .44, top); g.lineTo(L * .36, top); g.bezierCurveTo(L * .46, top, L * .5, top + Hh * .45, L * .5, top + Hh * .62);
  g.bezierCurveTo(L * .49, top + Hh * .95, L * .44, top + Hh, L * .36, top + Hh); g.lineTo(-L * .3, top + Hh); g.quadraticCurveTo(-L * .44, top + Hh * .9, -L * .5, top + Hh * .25); g.closePath(); g.fill();
  // a pale cheat line and the cabin windows
  g.fillStyle = N > .4 ? 'rgba(120,150,210,.6)' : 'rgba(127,179,217,.75)'; g.fillRect(-L * .4, top + Hh * .58, L * .78, Hh * .09);
  g.fillStyle = N > .4 ? '#FFE3A0' : '#4A5566'; const n = Math.max(6, (L / 9) | 0); for (let k = 0; k < n; k++) { const wx = -L * .36 + k * (L * .66 / n); g.beginPath(); g.ellipse(wx, top + Hh * .36, Math.max(.6, L * .006), Math.max(.8, Hh * .1), 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = N > .4 ? '#2A3550' : '#3A4656'; g.beginPath(); g.moveTo(L * .41, top + Hh * .3); g.quadraticCurveTo(L * .455, top + Hh * .3, L * .47, top + Hh * .45); g.lineTo(L * .41, top + Hh * .45); g.closePath(); g.fill(); // cockpit
  // near wing + engine
  g.fillStyle = N > .4 ? '#A3AEC8' : '#DDE2E8'; g.beginPath(); g.moveTo(-L * .06, top + Hh * .78); g.lineTo(L * .14, top + Hh * .78); g.lineTo(-L * .12, top + Hh * 1.9); g.lineTo(-L * .2, top + Hh * 1.9); g.closePath(); g.fill();
  const eg = g.createLinearGradient(0, top + Hh * .95, 0, top + Hh * 1.45); eg.addColorStop(0, N > .4 ? '#B8C2DA' : '#EEF1F4'); eg.addColorStop(1, N > .4 ? '#6E7A96' : '#9AA4AF'); g.fillStyle = eg;
  g.beginPath(); g.ellipse(L * .02, top + Hh * 1.2, L * .075, Hh * .26, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3A4250'; g.beginPath(); g.ellipse(L * .09, top + Hh * 1.2, L * .012, Hh * .2, 0, 0, Math.PI * 2); g.fill();
  if (gear) { g.fillStyle = '#3B3B40'; for (const gx of [L * .3, -L * .06]) { g.fillRect(gx - .5, top + Hh, Math.max(1, L * .008), s * .05); g.beginPath(); g.arc(gx, top + Hh + s * .05, Math.max(1, s * .018), 0, Math.PI * 2); g.fill(); } }
  if (N > .4) { const on = Math.floor(G.t * 1.4) % 2; g.fillStyle = on ? '#FF5A4A' : 'rgba(255,90,74,.25)'; g.beginPath(); g.arc(-L * .5, top - Hh * 2.3, Math.max(1.4, L * .012), 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(-L * .14, mid - Hh * 1.5, Math.max(1.2, L * .01), 0, Math.PI * 2); g.fill(); }
  g.restore();
}

// ---- the airport on the horizon (a landmark): runway, terminal, control tower, parked tails, and a take-off every 16 s
function drawAirport(x, yb, h, N) {
  const g = ctx, wd = h * 3.2;
  // the runway: a pale strip lying on the water's edge, a dashed centre line, edge lights at night
  g.fillStyle = N > .4 ? '#2E3550' : tint('#B9BDC2'); g.fillRect(x - wd / 2, yb - h * .03, wd, h * .035);
  g.fillStyle = N > .4 ? 'rgba(255,255,255,.35)' : tint('#F3F3F3'); for (let k = 0; k < 18; k++) g.fillRect(x - wd / 2 + (k + .3) * wd / 18, yb - h * .015, wd / 40, Math.max(1, h * .006));
  if (N > .4) { for (let k = 0; k < 40; k++) { g.fillStyle = k % 2 ? '#FFD27A' : '#9FD0FF'; g.fillRect(x - wd / 2 + k * wd / 40, yb - h * .032, 2, 2); } }
  // the terminal: a long low hall with a curved roof and a glass front
  const tx0 = x - wd * .46, tx1 = x - wd * .08, th = h * .12;
  g.fillStyle = N > .4 ? '#3A4468' : tint('#D9DEE3'); g.beginPath(); g.moveTo(tx0, yb - h * .03); g.lineTo(tx0, yb - th); g.quadraticCurveTo((tx0 + tx1) / 2, yb - th * 1.45, tx1, yb - th); g.lineTo(tx1, yb - h * .03); g.closePath(); g.fill();
  g.fillStyle = N > .4 ? 'rgba(255,214,140,.85)' : tint('#8FB6D2'); g.fillRect(tx0 + 2, yb - th * .78, tx1 - tx0 - 4, th * .42);
  g.strokeStyle = N > .4 ? 'rgba(40,40,70,.6)' : 'rgba(255,255,255,.55)'; g.lineWidth = 1; g.beginPath(); for (let k = 1; k < 14; k++) { const u = tx0 + (tx1 - tx0) * k / 14; g.moveTo(u, yb - th * .78); g.lineTo(u, yb - th * .36); } g.stroke();
  // parked planes' tails peeking over the terminal
  for (let k = 0; k < 4; k++) { const px = tx0 + (tx1 - tx0) * (.16 + k * .22), c = ['#7FB3D9', '#9CC9A8', '#E3B35A', '#7FB3D9'][k];
    g.fillStyle = N > .4 ? '#56638A' : tint(c); g.beginPath(); g.moveTo(px - h * .03, yb - th * 1.05); g.lineTo(px - h * .01, yb - th * 1.9); g.lineTo(px + h * .02, yb - th * 1.9); g.lineTo(px + h * .03, yb - th * 1.05); g.closePath(); g.fill(); }
  // the control tower: a slim tapering shaft with a rounded glass cab
  const cx = x + wd * .3, ch = h * .78, sw = h * .05;
  const sg = g.createLinearGradient(cx - sw, 0, cx + sw, 0); sg.addColorStop(0, N > .4 ? '#4A5478' : tint('#E9ECEF')); sg.addColorStop(1, N > .4 ? '#2E3550' : tint('#BFC6CE')); g.fillStyle = sg;
  g.beginPath(); g.moveTo(cx - sw, yb - h * .03); g.lineTo(cx - sw * .6, yb - ch * .8); g.lineTo(cx + sw * .6, yb - ch * .8); g.lineTo(cx + sw, yb - h * .03); g.closePath(); g.fill();
  g.fillStyle = N > .4 ? '#4A5478' : tint('#DDE2E8'); g.beginPath(); g.moveTo(cx - sw * 1.6, yb - ch * .8); g.lineTo(cx - sw * 2.1, yb - ch * .9); g.lineTo(cx + sw * 2.1, yb - ch * .9); g.lineTo(cx + sw * 1.6, yb - ch * .8); g.closePath(); g.fill();
  g.fillStyle = N > .4 ? 'rgba(160,230,200,.9)' : tint('#5E8CA8'); g.beginPath(); g.moveTo(cx - sw * 2.1, yb - ch * .9); g.lineTo(cx - sw * 1.8, yb - ch * .98); g.lineTo(cx + sw * 1.8, yb - ch * .98); g.lineTo(cx + sw * 2.1, yb - ch * .9); g.closePath(); g.fill();
  g.fillStyle = N > .4 ? '#3A4468' : tint('#C9D0D8'); g.beginPath(); g.ellipse(cx, yb - ch * .985, sw * 1.9, h * .012, 0, 0, Math.PI * 2); g.fill(); g.fillRect(cx - 1, yb - ch * 1.12, 2, ch * .14);
  if (N > .4 || Math.floor(G.t * 1.2) % 2) { g.fillStyle = '#FF5A4A'; g.beginPath(); g.arc(cx, yb - ch * 1.12, Math.max(1.5, h * .008), 0, Math.PI * 2); g.fill(); }
  // the take-off: rolls along the runway, lifts, climbs away to the right, fading into the haze
  const T = 16, p = ((G.t + 3) % T) / T, sz = h * .5;
  let px, py, ang = 0, gear = 1, a = 1;
  if (p < .42) { const q = p / .42; px = x - wd * .42 + wd * .5 * q * q; py = yb - h * .02; }
  else { const q = (p - .42) / .58; px = x + wd * .08 + wd * .7 * q; py = yb - h * .02 - h * 1.1 * q * q - h * .06 * q; ang = -.08 - .14 * Math.min(1, q * 3); gear = q < .25 ? 1 : 0; a = 1 - Math.max(0, q - .7) / .3; }
  if (a > .02) { g.save(); g.globalAlpha *= a; drawPlane(g, px, py, sz * (p < .42 ? 1 : 1 - (p - .42) * .5), ang, N, gear);
    if (p > .42 && N < .4) { g.globalAlpha *= .35; g.strokeStyle = '#FFFFFF'; g.lineWidth = Math.max(1, h * .006); g.beginPath(); g.moveTo(px - sz * .5, py - sz * .02); g.lineTo(px - sz * 1.4, py + sz * .2); g.stroke(); }
    g.restore(); }
}

// ---- wall pieces (drawn in the wall's own perspective; v = 0 at the bottom)
const FLIGHTS = [['札幌', 'SAPPORO'], ['福岡', 'FUKUOKA'], ['那覇', 'NAHA'], ['大阪', 'OSAKA'], ['仙台', 'SENDAI'], ['広島', 'HIROSHIMA'], ['鹿児島', 'KAGOSHIMA'], ['函館', 'HAKODATE'], ['松山', 'MATSUYAMA'], ['石垣', 'ISHIGAKI'], ['小松', 'KOMATSU'], ['長崎', 'NAGASAKI']];
function bpoly(pts, fill) { ctx.beginPath(); pts.forEach(([u, v], i) => { const p = bil(u, v); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
function bellipse(u, v, ru, rv, fill) { const pts = []; for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; pts.push([u + Math.cos(a) * ru, v + Math.sin(a) * rv]); } bpoly(pts, fill); }
Object.assign(DECO_DRAW, {
  flightboard(e) { // a flip-style departure board: one line changes every few seconds
    bquad(0, 0, 1, 1, '#1E2430'); bquad(.02, .82, .98, .97, '#2D6CB5'); qtext('出発', .05, .84, .4, .96, '#FBF6EE'); qtext('DEPARTURES', .45, .845, .95, .955, 'rgba(251,246,238,.75)');
    const step = Math.floor(G.t / 3.2), base = (e.v2 || 3) % FLIGHTS.length;
    for (let r = 0; r < 5; r++) { const v1 = .78 - r * .155, v0 = v1 - .12, k = (base + r + (r === step % 5 ? step : Math.floor(step / 5) * 5)) % FLIGHTS.length, flip = r === step % 5 && (G.t % 3.2) < .35;
      bquad(.02, v0, .98, v1, r % 2 ? '#262D3B' : '#2A3242');
      if (flip) { bquad(.02, v0 + (v1 - v0) * .45, .98, v0 + (v1 - v0) * .55, '#0E1118'); continue; }
      const hh = 7 + ((k * 37) % 13), mm = ((k * 17) % 6) * 10;
      qtext(String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'), .03, v0, .2, v1, '#F2C230');
      qtext('RJ ' + (100 + k * 7), .22, v0, .38, v1, '#BFD3E6');
      qtext(tr(FLIGHTS[k][0], FLIGHTS[k][1]), .4, v0, .72, v1, '#FBF6EE');
      const st = (k + Math.floor(step / 7)) % 4; qtext(tr(['搭乗中', '定刻', '定刻', 'まもなく'][st], ['BOARDING', 'ON TIME', 'ON TIME', 'SOON'][st]), .74, v0, .97, v1, st === 0 ? '#7FD06A' : st === 3 ? '#F2C230' : '#BFD3E6'); }
  },
  planewin(e) { // a tall window onto the apron: a parked plane at the gate and another taxiing past
    const N = LT.night; bquad(0, 0, 1, 1, tint('#AEB7C0'));
    bquad(.03, .04, .97, .97, N > .4 ? '#1E2848' : `rgb(${LT.top[0] | 0},${LT.top[1] | 0},${LT.top[2] | 0})`);
    bquad(.03, .04, .97, .3, N > .4 ? '#2A3045' : tint('#9AA0A6')); bquad(.03, .28, .97, .31, N > .4 ? '#3A4468' : tint('#C9CED3'));
    for (let k = 0; k < 6; k++) bquad(.05 + k * .16, .12, .11 + k * .16, .135, N > .4 ? '#FFD27A' : tint('#F2C230')); // taxiway markings
    const pl = (u0, v0, su, sv, faceL) => { const f = faceL ? -1 : 1, U = t => u0 + f * t * su, V = t => v0 + t * sv;
      bpoly([[U(-.5), V(.25)], [U(-.44), V(1)], [U(.36), V(1)], [U(.5), V(.55)], [U(.42), V(.05)], [U(-.3), V(0)]], N > .4 ? '#B8C2DA' : tint('#FBFCFD'));
      bpoly([[U(-.47), V(.9)], [U(-.52), V(2.6)], [U(-.43), V(2.6)], [U(-.3), V(1)]], N > .4 ? '#6F86B8' : tint('#7FB3D9'));
      bpoly([[U(-.1), V(.3)], [U(.14), V(.3)], [U(-.12), V(-.7)], [U(-.2), V(-.7)]], N > .4 ? '#8E9AB8' : tint('#DDE2E8'));
      bellipse(U(.02), V(-.15), su * .08, sv * .25, N > .4 ? '#8E9AB8' : tint('#C9D0D8'));
      bquad(Math.min(U(-.4), U(.38)), V(.52), Math.max(U(-.4), U(.38)), V(.6), N > .4 ? 'rgba(120,150,210,.6)' : tint('#7FB3D9'));
      for (let k = 0; k < 10; k++) bellipse(U(-.34 + k * .07), V(.75), su * .008, sv * .07, N > .4 ? '#FFE3A0' : tint('#4A5566')); };
    pl(.36, .2, .6, .16, 0); // at the gate
    const tx = ((G.t * .035 + (e.v2 || 0) * .3) % 1.6) - .3; if (tx > -.25 && tx < 1.25) pl(tx, .14, .32, .085, 1); // taxiing past, smaller and further out
    ctx.strokeStyle = tint('#C9CED3'); ctx.lineWidth = 3; ctx.beginPath(); bline(.35, .04, .35, .97); bline(.68, .04, .68, .97); bline(.03, .62, .97, .62); ctx.stroke();
  },
});
Object.assign(DECO_SIZE, { flightboard: [3.4, 1.7, 3.5], planewin: [3.6, .15, 3.9] });

// ---- side furniture: check-in counters (painted whole, facing the road)
PROPS.checkin = (sd, s) => ({ w: 3.4, bx: [B(sd * 4.0, s, .9, 3.0, 0, 2.6, '#D9DEE2')] });
PROPS.cartS = (sd, s) => ({ w: 1.6, bx: [B(sd * 3.9, s, .6, 1.3, 0, 1.2, '#9AA9B6')] });
function paintCheckin(g, W, H, night) {
  seasonShadow(g, W, H, .26);
  // the sign board above: a letter and a little plane
  g.fillStyle = vgrad(g, H * .02, H * .2, [[0, '#3A79C0'], [1, '#2D6CB5']]); rrect(g, W * .18, H * .02, W * .64, H * .17, 10); g.fill();
  g.fillStyle = '#FBF6EE'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${Math.round(H * .072)}px "Zen Maru Gothic",sans-serif`; g.fillText('チェックイン', W * .5, H * .08); g.font = `800 ${Math.round(H * .045)}px "Zen Maru Gothic",sans-serif`; g.fillText('CHECK-IN', W * .5, H * .155);
  g.fillStyle = '#9AA9B6'; g.fillRect(W * .3, H * .19, W * .02, H * .12); g.fillRect(W * .68, H * .19, W * .02, H * .12);
  // two desks with screens, a soft rounded top and a pale front
  for (const [x0, w0] of [[.04, .44], [.52, .44]]) { const x = W * x0, w = W * w0;
    g.fillStyle = '#2B3240'; rrect(g, x + w * .2, H * .38, w * .26, H * .14, 4); g.fill(); g.fillStyle = night ? '#9ED8F5' : '#BFE3F5'; g.fillRect(x + w * .22, H * .395, w * .22, H * .105);
    g.fillStyle = vgrad(g, H * .52, H * .58, [[0, '#F7F8F9'], [1, '#C9D0D8']]); rrect(g, x, H * .52, w, H * .07, 8); g.fill();
    g.fillStyle = vgrad(g, H * .58, H * .97, [[0, '#E9ECEF'], [1, '#BFC6CE']]); rrect(g, x + w * .03, H * .58, w * .94, H * .39, 6); g.fill();
    g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(x + w * .06, H * .6, w * .88, H * .02);
    g.fillStyle = '#2D6CB5'; g.fillRect(x + w * .03, H * .7, w * .94, H * .025); }
  // the bag belt between them
  g.fillStyle = vgrad(g, H * .8, H * .97, [[0, '#5E6B78'], [1, '#3A4250']]); rrect(g, W * .46, H * .8, W * .08, H * .17, 4); g.fill();
}
function paintCart(g, W, H) { // a luggage trolley with two suitcases
  seasonShadow(g, W, H, .3);
  g.strokeStyle = '#7D8B97'; g.lineWidth = W * .035; g.lineCap = 'round'; g.beginPath(); g.moveTo(W * .12, H * .9); g.lineTo(W * .1, H * .22); g.lineTo(W * .26, H * .14); g.stroke();
  g.fillStyle = vgrad(g, H * .84, H * .9, [[0, '#C9D0D8'], [1, '#8A949E']]); rrect(g, W * .08, H * .84, W * .84, H * .06, 4); g.fill();
  g.fillStyle = '#2B2B2B'; for (const x of [.18, .82]) { g.beginPath(); g.arc(W * x, H * .93, W * .045, 0, Math.PI * 2); g.fill(); }
  const sc = (x, y, w, h, c) => { g.fillStyle = vgrad(g, y, y + h, [[0, shadeHex(c, 1.18)], [1, shadeHex(c, .72)]]); rrect(g, x, y, w, h, Math.min(w, h) * .14); g.fill();
    g.strokeStyle = shadeHex(c, .6); g.lineWidth = 2.5; for (const u of [.3, .7]) { g.beginPath(); g.moveTo(x + w * u, y + h * .08); g.lineTo(x + w * u, y + h * .92); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x + w * .04, y + h * .06, w * .1, h * .8); };
  sc(W * .2, H * .48, W * .66, H * .36, '#4E77A0'); sc(W * .26, H * .2, W * .54, H * .29, '#C8463C');
  g.fillStyle = '#F2C230'; rrect(g, W * .62, H * .26, W * .1, H * .07, 3); g.fill(); // a luggage tag
}
Object.assign(PROP_ART, { checkin: (n) => artCanvas('pcheckin' + (n ? 'N' : ''), 340, 300, (g, w, h) => paintCheckin(g, w, h, n)), cartS: () => artCanvas('cart', 220, 210, paintCart) });
// ---- an obstacle: a loaded luggage cart rolling across (jump it)
OBS.cart = L => ({ k: 'low', art: 'cart', artW: 1.05, artH: 1.0, bx: [OB(L, 0, .9, 1.1, 0, .95, '#9AA9B6')] });
Object.assign(ART, { cart: () => artCanvas('cart', 220, 210, paintCart) });
