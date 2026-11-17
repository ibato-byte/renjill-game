/* ================= segments =================
   A segment is one straight stretch between two corners. Track coords: s (along), lat (right +), y (up). */
function segPos(seg, s, lat) { return [seg.sx + seg.f[0] * s + seg.r[0] * lat, seg.sz + seg.f[1] * s + seg.r[1] * lat, segE(seg, s)]; }
/* ---------- terrain: streets rise and fall (hills, slopes, bridges); flat near both corners so stretches meet cleanly ---------- */
const sstep = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
function segE(seg, s) { const h = seg.hp, e0 = seg.e0 || 0; if (!h) return e0; if (h.shape === 'flights') { const u0 = s - h.a; if (u0 <= 0) return e0; const k = Math.floor(u0 / h.P); if (h.back && k >= h.n) { if (k >= 2 * h.n) return e0; const u = u0 - k * h.P; return e0 + h.R * h.n - h.R * (k - h.n + sstep(clamp((u - h.F) / (h.P - h.F), 0, 1))); } /* [H26] おりて、また上がる（押上のデッキ：350 → 340 → 350） */ if (k >= h.n) return e0 + h.R * h.n; const u = u0 - k * h.P; return e0 + h.R * (k + sstep(clamp((u - h.F) / (h.P - h.F), 0, 1))); } const t = (s - h.a) / (h.b - h.a); if (t <= 0) return e0; if (t >= 1) return e0 + h.d;
  const sn = Math.sin(Math.PI * t), s2 = Math.sin(2 * Math.PI * t); return e0 + h.d * sstep(t) + h.hump * sn * sn + (h.w2 || 0) * s2 * s2 + (h.lift ? h.lift * sstep(clamp((s - h.a) / 9, 0, 1)) * (1 - sstep(t)) : 0); }
/* road shapes: a hill, a slope up or down, rolling double hills, a long climb with a crest, or a dip under a railway bridge */
function terrainFor(seg, prev) {
  const th = seg.th, L = seg.len; seg.e0 = prev ? segE(prev, prev.len) : 0;
  if (prev && prev.th.lift && prev.base != null) seg.e0 = prev.base + prev.th.liftTo; /* [H11] エレベーターをおりた先は、本当の高さ（地面 ＋ 350m・445m） */
  if (seg.first) return;
  const a = HW + 6, b = L - HW - 8; if (b - a < 30) return;
  /* 2026-11-17 オーナー：「タワーを登る時に高低差がないのがおかしい。ちゃんと階段を何回か登るルートに」。前は、高さの数字（展望の景色）だけが上がり、足もとは平らなままだった。
     本物の外階段は、ひと続きの階段（約 3m 上がる）→ 平らな踊り場 → また階段…のくり返し。flights＝{ 最初の踊り場の位置, 間かく, 踊り場の長さ, 1 回に上がる高さ, 上がる回数 } */
  if (th.ramp) { seg.hp = { a: HW + 4, b: L - 14, d: th.ramp, hump: 0, w2: 0, shape: 'slope' }; return; } /* 展望回廊：ガラスの筒の中を、ゆるい坂で 445m → 450m へ */
  if (th.flights) { const f = th.flights, A = (seg.first ? 0 : HW) + f.a, n = Math.max(1, Math.min(f.n || 99, Math.floor((L - 12 - A) / f.P / (f.back ? 2 : 1)))); seg.hp = { shape: 'flights', a: A, P: f.P, F: f.F, R: f.R, n, back: f.back ? 1 : 0, b: A + n * f.P * (f.back ? 2 : 1) }; return; }
  if (G.testHump) { seg.hp = { a, b, d: 0, hump: G.testHump, w2: G.testW2 || 0 }; if (G.testShape) seg.hp = Object.assign({ a, b, d: 0, hump: 0, w2: 0 }, G.testShape); return; }
  if (th.bridge) { seg.hp = { a, b, d: 0, hump: 7 }; return; }
  if (th.kind !== 'street' || th.moat || th.flat) return;
  const e0 = seg.e0; let d = 0, hump = 0, w2 = 0, shape = 'flat';
  if (th.hill) { d = th.hill * rand(4.5, 7); shape = 'slope'; }
  else { const r = Math.random();
    if (r < .24) { hump = rand(3, 6); shape = 'hill'; }
    else if (r < .48) { d = rand(3.5, 7) * (Math.random() < .5 ? -1 : 1); shape = 'slope'; }
    else if (r < .64) { w2 = rand(1.6, 3); shape = 'rolling'; }
    else if (r < .78) { d = rand(2.5, 4.5) * (Math.random() < .5 ? -1 : 1); hump = rand(2, 3.5); shape = 'crest'; }
    else if (r < .9 && !th.gate && !th.torii && !th.toriiTunnel && !th.overpass && !noRail(th) && L > 85) { hump = -rand(3, 4.2); shape = 'underpass'; } /* 2026-11-16 オーナー：「公園で電車が通るのはおかしい」。公園・参道・水辺では、線路の橋（とその上を走る電車）を出さない */
    else shape = 'flat'; }
  if (e0 + d > 10) d = -Math.abs(d); if (e0 + d < -3) d = Math.abs(d) || 3;
  if (shape === 'underpass' && e0 + hump < -6) { hump = 0; shape = 'flat'; }
  if (d || hump || w2) seg.hp = { a, b, d, hump, w2, shape };
}

/* やわらかい物（敷きぶとん・座布団）の形（2026-11-17 オーナー：「ホーム画面の座布団や布団がカクカクしていて現実っぽくない」）。
   前は角の立った箱だった。本物のふとんや座布団は、中の綿で横がふくらみ、角は丸く、下は床に押されて内へ入る。
   上の面（絵）のふちから、まわりを角の丸い輪で何段か囲み、半円の形で外へふくらませて床へもどす。1 枚ごとに向きに合わせて明るさを変える */
function softSlab(seg, o) {
  const { s0, s1, l0, l1 } = o, h = o.h, y0 = o.y0 || 0, R = o.r != null ? o.r : h * .6, rc = o.rc != null ? o.rc : .04, n = o.n || 6, m = 5, base = o.col;
  const ring = (out, y) => { const pts = [], cs = [[s1 - rc, l1 - rc, 0], [s0 + rc, l1 - rc, Math.PI / 2], [s0 + rc, l0 + rc, Math.PI], [s1 - rc, l0 + rc, Math.PI * 1.5]];
    for (const [cx, cl, a0] of cs) for (let i = 0; i <= m; i++) { const a = a0 + Math.PI / 2 * i / m, r = rc + out; pts.push([cx + Math.cos(a) * r, cl + Math.sin(a) * r, y, Math.cos(a), Math.sin(a)]); }
    return pts; };
  const rings = []; for (let k = 0; k <= n; k++) { const th = Math.PI * k / n; rings.push({ r: ring(R * Math.sin(th) * (k ? 1 : 0), y0 + h * (.5 + .5 * Math.cos(th)) - (o.dip || 0) * Math.sin(th) * 0), th }); }
  { const T = rings[0].r, top = y0 + h, tc = o.colAt ? o.colAt(0) : base; for (let i = 1; i + 1 < T.length; i++) seg.floor.push({ v: quad(seg, [[T[0][0], T[0][1], top], [T[i][0], T[i][1], top], [T[i + 1][0], T[i + 1][1], top], [T[i + 1][0], T[i + 1][1], top]]), c: tc, soft: 1, sb: o.sb || 0 }); } // 上の面（絵が無い所も、すき間なく）
  for (let k = 0; k < n; k++) { const A = rings[k].r, B = rings[k + 1].r, th = Math.PI * (k + .5) / n, nv = R * Math.cos(th), nh = h / 2 * Math.sin(th), L = Math.hypot(nv, nh) || 1;
    for (let i = 0; i < A.length; i++) { const j = (i + 1) % A.length, dirS = (A[i][3] + A[j][3]) / 2, dirL = (A[i][4] + A[j][4]) / 2;
      const up = nv / L, side = nh / L, lightK = .74 + .26 * up + side * (.07 * -dirL - .05 * dirS) - (up < 0 ? .12 * -up : 0); // 上ほど明るく、下（床に入る所）は暗く。光は左前から
      const c = (o.colAt ? o.colAt(k / n) : base).map((v) => v * lightK);
      seg.floor.push({ v: quad(seg, [[A[i][0], A[i][1], A[i][2]], [A[j][0], A[j][1], A[j][2]], [B[j][0], B[j][1], B[j][2]], [B[i][0], B[i][1], B[i][2]]]), c, soft: 1, sb: o.sb || 0 }); } }
}
function quad(seg, pts, flat) { const v = []; for (const [s, lat, y] of pts) { const p = segPos(seg, s, lat); v.push(p[0], y + (flat ? seg.e0 || 0 : p[2]), p[1]); } return v; }
const C = hexRgb;
const TORII_TUNNEL_H = 4.8; // 鳥居のトンネルの高さ（m）。横木の下は 3.7m：縦長のスマホのカメラ（2.75m）より十分に上
let SEGN = 0;

function noRail(th) { return !!(th.fac && th.fac.style === 'park') || !!th.moat || !!th.boats; } // 電車が通ると変な場所（公園・参道・お堀や池のそば）
/* 向き（0〜4 を一周）からの前・右の向き。0.5 きざみ（Y 字路の 45 度）も使える。整数の向きは前と同じ数字（DIRS）になる */
function dirVec(d) { const a = d * Math.PI / 2, x = Math.round(Math.sin(a) * 1e9) / 1e9, z = Math.round(Math.cos(a) * 1e9) / 1e9; return [x, z]; }
/* Y 字路（2026-11-16 オーナー「左右に曲がるだけでなく、Y 字路も」）：分かれ道のうち、手前も先の 2 本も外の通り（公園・水辺・室内を除く）のとき、ときどき Y 字にする。
   道はまっすぐ進んで、つきあたりの代わりに、2 本の道の間に「とがった角の建物」（東京の Y 字路によくある、細い正面の建物）が立つ。2 本はそれぞれ 45 度ずつ左右へ。
   その先の角はまた 90 度（45 度ずれた向きで続く）。壁・床・建物は 45 度の角でつながるように作る（すき間から景色が透けない） */
const YT = HW * Math.tan(Math.PI / 8); // 45 度の角の内側で、壁が角の点より手前で止まる長さ（約 1.9m）
function yOK(th, nf, day) { if (!nf || th.kind !== 'street' || (th.fac && th.fac.style === 'park') || th.toriiTunnel || th.overpass) return false;
  const one = x => { const t = Array.isArray(x) ? x[0] : x; if (!t || !t.t) return false; const h = themeFor(t.t, day || 1); return h && h.kind === 'street' && !(h.fac && h.fac.style === 'park') && !h.toriiTunnel && !h.torii && !h.gate; };
  return one(nf.L) && one(nf.R); }
function newSeg(prev, step, opts) {
  opts = opts || {};
  const th = themeFor(step.t, opts.day || 1);
  const first = !prev;
  const turnIn = opts.turnIn != null ? opts.turnIn : prev ? prev.turn : 0;
  const dir = first ? 0 : (prev.dir + turnIn + 4) % 4;
  let sx = 0, sz = 0; if (!first) { const p = segPos(prev, prev.len, 0); sx = p[0]; sz = p[1]; }
  const len = first ? (opts.len || 92) : Math.round(rand(th.len[0], th.len[1]));
  const seg = { id: ++SEGN, turnIn: first ? 0 : turnIn, prevFork: !!(prev && prev.fork), prevIn: !!(prev && prev.th && ['room', 'train', 'glass'].includes(prev.th.kind)), tid: step.t, th, step, t0: opts.t0 ?? 480, t1: (opts.t0 ?? 480) + step.d, dir, sx, sz, f: dirVec(dir), r: dirVec(dir + 1), first, day: opts.day || 1,
    len, straight: !!opts.straight && !opts.fork, toSky: !!opts.toSky, parentTh: prev && prev.forkY && th.kind === 'street' && prev.th.kind === 'street' ? prev.th : null, turn: opts.fork || opts.straight ? 0 : (turnIn ? -Math.sign(turnIn) : (Math.random() < .5 ? -1 : 1)), fork: opts.fork || null, prevForkY: !!(prev && prev.forkY), halfIn: Math.abs(turnIn) === .5 ? Math.sign(turnIn) : 0,
    floor: [], walls: [], decos: [], obs: [], items: [], props: [], lines: [], spr: [] };
  if (seg.fork && yOK(th, seg.fork, opts.day) && (window.__forceY || Math.random() < .97)) seg.forkY = 1; /* 2026-11-17 夜 オーナー「Y 字路が出る確率をもう少しあげて」：.8 → .97 */ // 2026-11-17：.45 → .8（外の分かれ道は、ほとんど Y 字路に）
  seg.wallH = th.wallH || 3; { const k0 = th.kind; if (k0 === 'room' || k0 === 'glass') seg.wallH = Math.max(seg.wallH, CEIL_ROOM); else if (k0 === 'train') seg.wallH = Math.max(seg.wallH, CEIL_TRAIN); } /* 2026-11-15 オーナー：天井そのものを高く（空港のロビーのように）。低い天井だと、縦長のスマホで天井のすぐ下をはうように見え、ジャンプでつきぬけた */
  terrainFor(seg, prev);
  if (th.lift) seg.liftK = (Math.random() * 4) | 0; /* 4 台のうちどれか（春・夏・秋・冬） */
  if (step.co || th.course) seg.base = prev && prev.base != null && ((step.co && prev.step && prev.step.co === step.co) || (th.course && prev.th.course === th.course)) ? prev.base : seg.e0; /* [H5] コースの地面の高さ（ここからの高さを、画面の「地上 ○m」に出す） */
  if (th.sky) { /* オオタカに運ばれる空：本当に高い所（climb[0] m）から、地面（0 m）までおりる。先の場所（着地する公園）は本当に真下の地面にある */
    seg.e0 = prev ? segE(prev, prev.len) : th.climb[0]; seg.hp = { a: 0, b: seg.len - 22, d: -th.climb[0], /* [H4] 空の道は、飛び立った展望台の本当の高さから始まる（前は、展望台が低いのに 150m から始まり、カメラが 120m 以上とんで、レンとジルが画面から消えた） */ hump: 0, w2: 0, shape: 'sky', lift: 3.4 }; } /* [F5] 飛び立ちは、テラスの手すりの上へ少し持ち上がってから、おりていく */
  buildGeometry(seg);
  if ((seg.tid === 'tlobby' || seg.tid === 'slobby') && seg.hp && seg.hp.shape === 'flights') { const h = seg.hp, sd = 1, l2 = sd * (HW - .06), nS = [-sd * seg.r[0], -sd * seg.r[1]]; for (let k = 0; k <= h.n; k++) { const s1 = h.a + k * h.P + .6; if (s1 > seg.len - 3) break; const e = segE(seg, s1) - (seg.e0 || 0), fl = k === h.n && seg.tid === 'tlobby' ? 'RF' : (k + 1) + 'F', a2 = segPos(seg, s1 + .9, l2), b2 = segPos(seg, s1, l2), E = segE(seg, s1); seg.decos.push({ v: [a2[0], E + 1.5, a2[1], b2[0], E + 1.5, b2[1], b2[0], E + 2.2, b2[1], a2[0], E + 2.2, a2[1]], n: nS, pat: 'stepsign', seg, w: .9, txt: fl, txt2: Math.round(segE(seg, s1) - (seg.base != null ? seg.base : 0)) + 'm' }); } } /* [H24] 入口の建物の階段：踊り場ごとに階の札（1F・2F…屋上）と、その高さ */
  if (th.truss) { const red = th.truss === 'red', c1 = red ? '#D9452B' : '#E6EAEE', c2 = red ? '#F2F0EC' : '#C9D1D9', L = seg.len, Hh = red ? (seg.wallH || 5) + 3 : (seg.wallH || 5) - .4; /* [T8][S4] 展望台のガラスの外に、塔の鉄骨（赤い電波塔は赤と白、押上は白いトラス）。窓の外が、塔の中にいるとわかる */
    for (const sd of [-1, 1]) { if (th.core === sd) continue; const lt = sd * (HW + (red ? 2.2 : 1.6)); for (let a = 2; a < L - 2; a += red ? 9 : 14) { const b = Math.min(a + (red ? 9 : 14), L - 2); seg.lines.push({ a: [a, lt, -6], b: [b, lt, Hh], c: c1, w: red ? .16 : .08 }); seg.lines.push({ a: [a, lt, Hh], b: [b, lt, -6], c: c1, w: red ? .16 : .08 }); seg.lines.push({ a: [a, lt, -6], b: [a, lt, Hh], c: c2, w: red ? .22 : .16 }); }
      seg.lines.push({ a: [2, lt, -.3], b: [L - 2, lt, -.3], c: c2, w: .14 }); seg.lines.push({ a: [2, lt, Hh - 1], b: [L - 2, lt, Hh - 1], c: c2, w: .14 }); } }
  if (th.esc && seg.hp && seg.hp.shape === 'flights') { const h = seg.hp, sd = th.esc, c = sd * 3.7, nIn = [-sd * seg.r[0], -sd * seg.r[1]]; /* [H27] 4 階の入口：階段の横に、本物どおりのエスカレーター（銀の段・黒い手すり・ガラスのらんかん） */
    for (let k = 0; k < h.n; k++) { const s1 = h.a + k * h.P + h.F - 1.2, s2 = h.a + (k + 1) * h.P + 1.2;
      for (let a = s1; a < s2 - .01; a += .5) { const b = Math.min(a + .5, s2);
        seg.floor.push({ v: quad(seg, [[a, c - .55, .03], [b, c - .55, .03], [b, c + .55, .03], [a, c + .55, .03]]), c: C('#9AA0A6'), pat: 'stairs' });
        seg.walls.push({ v: quad(seg, sd > 0 ? [[b, c - .6, .05], [a, c - .6, .05], [a, c - .6, .95], [b, c - .6, .95]] : [[a, c + .6, .05], [b, c + .6, .05], [b, c + .6, .95], [a, c + .6, .95]]), c: C('#DCE6EC'), n: nIn, sh: 1, glass: 1 });
        for (const q of [c - .62, c + .62]) seg.lines.push({ a: [a, q, 1.0], b: [b, q, 1.0], c: '#1E2126', w: .08 }); }
      for (const q of [c - .62, c + .62]) seg.walls.push({ v: quad(seg, [[s1 - .02, q - .06, 0], [s1 - .02, q + .06, 0], [s1 - .02, q + .06, 1.0], [s1 - .02, q - .06, 1.0]]), c: C('#B9C0C6'), n: [-seg.f[0], -seg.f[1]], sh: .9 }); } } /* 乗り口の、手すりの銀の柱 */
  if (th.rpat === 'lookdown' && seg.hp && seg.hp.shape === 'flights') { const lowE = (seg.e0 || 0) + Math.min(0, seg.hp.R * seg.hp.n); for (const f of seg.floor) if (f.pat === 'lookdown') { f.lowOnly = 1; f.low = Math.abs(segE(seg, (f.a + f.b) / 2) - lowE) < .5 ? 1 : 0; } }
  if (th.ramp && th.climb && seg.base != null) { let last = th.climb[0]; const sd = 1, l2 = sd * (HW - .06), nS = [-sd * seg.r[0], -sd * seg.r[1]]; for (let s = 6; s < seg.len - 6; s += .5) { const h = segE(seg, s) - seg.base, n = Math.floor(h + .001); if (n > last) { last = n; const top = n >= Math.floor(th.climb[0] + th.ramp), txt = (top ? (th.climb[0] + th.ramp).toFixed(1) : n) + 'm', e = segE(seg, s); seg.decos.push({ v: [...segPos(seg, s + .9, l2).slice(0, 2)].length ? (() => { const a = segPos(seg, s + .9, l2), b = segPos(seg, s, l2); return [a[0], e + 1.2, a[1], b[0], e + 1.2, b[1], b[0], e + 1.75, b[1], a[0], e + 1.75, a[1]]; })() : null, n: nS, pat: 'stepsign', seg, w: .9, txt, txt2: '' }); } } } /* [H21] 展望回廊：1m 上がるごとに、ガラスのわきに今の高さの札（446m・447m…451.2m） */
  buildProps(seg); buildWalkers(seg);
  // open scenery that would spill into the next or previous stretch is dropped (see terrOK)
  seg.spr = seg.spr.filter(sp => sp.keep || terrOK(seg, sp.s, sp.lat));
  seg.props = seg.props.filter(p => p.big || terrOK(seg, (p.s0 + p.s1) / 2, (p.l0 + p.l1) / 2));
  if (!opts.empty && !th.noObs) (th.sky ? skyItems : populate)(seg);
  return seg;
}

/* ---------- territory ----------
   At a corner the plane is split along the 45° line through the junction: everything on this stretch's
   side belongs to it, the rest to the next (or previous) stretch. Walls already stop at the corner;
   this keeps open scenery (water, far banks, distant trees, boats) from overlapping the neighbour, which
   is what made corners flicker or change at the moment of turning. u = distance from the road's centre line. */
function terrK(seg, sd) { return { endTurn: !!(seg.fork || sd === seg.turn), startIn: !seg.first && (sd === seg.turnIn || !!seg.prevForkY), first: seg.first }; }
function terrOK(seg, s, lat) {
  const u = Math.abs(lat); if (u <= HW + .01) return true;
  const sd = lat < 0 ? -1 : 1, k = terrK(seg, sd), L = seg.len;
  if (k.endTurn ? s + u > L + .01 : s - u > L + .01) return false;
  if (!k.first && (k.startIn ? s - u < -.01 : s + u < -.01)) return false;
  return true;
}
// clip a polygon given as [[s, lat], ...] (all on one side of the road) to this stretch's territory
function terrClip(seg, pts) {
  const sd = pts.reduce((a, p) => a + p[1], 0) < 0 ? -1 : 1, k = terrK(seg, sd), L = seg.len;
  const planes = [k.endTurn ? (s, u) => L - s - u : (s, u) => L - s + u]; if (!k.first) planes.push(k.startIn ? (s, u) => s - u : (s, u) => s + u);
  let poly = pts;
  for (const f of planes) { const out = []; for (let i = 0; i < poly.length; i++) { const A = poly[i], Bp = poly[(i + 1) % poly.length], fa = f(A[0], Math.abs(A[1])), fb = f(Bp[0], Math.abs(Bp[1]));
      if (fa >= 0) out.push(A); if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push([A[0] + (Bp[0] - A[0]) * t, A[1] + (Bp[1] - A[1]) * t]); } }
    poly = out; if (poly.length < 3) return null; }
  return poly;
}
// the allowed stretch of s at a given distance from the road (for far walls)
function terrRange(seg, lat) { const u = Math.abs(lat), sd = lat < 0 ? -1 : 1, k = terrK(seg, sd), L = seg.len; return [k.first ? -1e9 : (k.startIn ? u : -u), k.endTurn ? L - u : L + u]; }

/* ---------- geometry ---------- */
// floor tiles: outdoors the two theme colors blend into one surface with a faint per-tile variance (no stripes)
function floorTone(th, which, i) {
  const a = C(th[which][0]), b = C(th[which][1]), tiled = ['tatami', 'grid', 'scramble', 'rug', 'carpet'].includes(which === 'road' ? th.rpat : th.spat) || th.kind === 'room';
  const t = tiled ? i % 2 : .5, j = tiled ? 1 + (Math.random() - .5) * .02 : 1;
  return [lerp(a[0], b[0], t) * j, lerp(a[1], b[1], t) * j, lerp(a[2], b[2], t) * j];
}
function addWallQuad(seg, side, a, b, y0, y1, c, extra) {
  const lat = side * HW, n = [-side * seg.r[0], -side * seg.r[1]];
  const pts = side < 0 ? [[a, lat, y0], [b, lat, y0], [b, lat, y1], [a, lat, y1]] : [[b, lat, y0], [a, lat, y0], [a, lat, y1], [b, lat, y1]];
  const w = Object.assign({ v: quad(seg, pts), c, n, sh: side < 0 ? .94 : .86 }, extra || {});
  seg.walls.push(w); return w;
}
function sideStart(seg, sd) { if (!seg.prevForkY) return null; return sd === seg.halfIn ? YT : HW + .9; } // Y 字路の先：内側の壁は 1.9m から、とがった建物の側は角の先から
function sideEnds(seg) { const L = seg.len, s0 = seg.first ? (seg.th.backAt != null ? seg.th.backAt : -16) : HW; if (seg.forkY) return { s0, lEnd: L - YT, rEnd: L - YT }; return { s0, lEnd: (seg.turn === -1 || seg.fork) ? L - HW : L + HW, rEnd: (seg.turn === 1 || seg.fork) ? L - HW : L + HW }; }
function buildGeometry(seg) {
  const th = seg.th, L = seg.len, k = th.kind;
  if (th.sky) { seg.fS = 0; seg.fE = L; return; } // 空の上：床・壁・曲がり角の札は無い（下に見えるのは町）
  const { s0, lEnd, rEnd } = sideEnds(seg);
  // floor: road in the middle, side zones outside
  const T = th.rpat === 'tatami' ? 1.8 : 1.5;
  // the corner square belongs to the stretch you turn into (so the new place starts right at the corner);
  // at a fork it stays with the fork's own stretch, since two stretches leave from it
  const fS = seg.first || seg.prevFork ? s0 : -HW, fE = seg.forkY ? L - YT : seg.fork ? L + HW : seg.straight ? L : L - HW;
  seg.fS = fS; seg.fE = fE;
  let i = 0;
  for (let a = fS; a < fE - .01; a += T, i++) {
    const b = Math.min(a + T, fE);
    seg.floor.push({ v: quad(seg, [[a, -ROAD, 0], [b, -ROAD, 0], [b, ROAD, 0], [a, ROAD, 0]]), c: floorTone(th, 'road', i), pat: th.rpat, ti: i, a, b, mid: 1 });
  }
  i = 0;
  for (let a = fS; a < fE - .01; a += 3, i++) {
    const b = Math.min(a + 3, fE);
    for (const sd of [-1, 1]) { const l0 = sd < 0 ? -HW : ROAD, l1 = sd < 0 ? -ROAD : HW;
      seg.floor.push({ v: quad(seg, [[a, l0, 0], [b, l0, 0], [b, l1, 0], [a, l1, 0]]), c: floorTone(th, 'side', i + (sd > 0)), pat: th.spat, ti: i, a, b, sd }); }
  }
  if (seg.hp && seg.hp.shape === 'flights') { const h = seg.hp; for (const f of seg.floor) { if (f.a == null) continue; const u0 = f.a + 1 - h.a, k = Math.floor(u0 / h.P), u = u0 - k * h.P; if (u0 > 0 && k < h.n * (h.back ? 2 : 1) && u > h.F) { f.pat = 'stairs'; f.land = 0; } } } // 上がる所の床は階段の模様（段の線）
  addDecals(seg, fS, fE);
  if (seg.forkY) { /* Y 字路の分かれ目の路面：手前の道の終わりから、2 本の道の始まりまでを 1 枚の五角形で（すき間・重なりが出ない） */
    const k = HW * Math.SQRT2, pg = [[L - YT, -HW], [L, -k], [L + k, 0], [L, k], [L - YT, HW]];
    seg.floor.push({ v: quad(seg, pg.map(q => [q[0], q[1], 0])), c: floorTone(th, 'road', 0), pat: null, ti: 0, a: L - YT, b: L + k, mid: 1, yPad: 1 });
    // 分かれ目の白い線（止まれの線と、2 本へ分かれる白い線）
    seg.floor.push({ v: quad(seg, [[L - YT - .5, -ROAD + .2, .012], [L - YT - .2, -ROAD + .2, .012], [L - YT - .2, ROAD - .2, .012], [L - YT - .5, ROAD - .2, .012]]), c: [240, 240, 236], pat: null, ti: 0, a: L - YT - .5, b: L - YT, dec: 'line' }); }
  // water / void beyond decks
  if (th.view === 'river' || th.view === 'sea') {
    for (let a = s0 - 30; a < L + 60; a += 15) for (const sd of [-1, 1]) {
      const l0 = sd < 0 ? -90 : HW, l1 = sd < 0 ? -HW : 90;
      const pg = terrClip(seg, [[a, l0], [a + 15, l0], [a + 15, l1], [a, l1]]); if (pg) seg.floor.push({ v: quad(seg, pg.map(q => [q[0], q[1], -.02]), 1), c: C(th.side[0]), pat: 'sea', far: 1 });
    }
  }
  if (k === 'room' || k === 'train' || k === 'glass') buildRoom(seg, s0, lEnd, rEnd);
  else if (k === 'street') buildStreet(seg, s0, lEnd, rEnd);
  else buildDeck(seg, s0, lEnd, rEnd);
  // corner sign
  const e = seg.forkY ? L + HW * Math.SQRT2 + .5 : L + HW - .05, H = k === 'street' ? 3.2 : k === 'deck' ? 2.4 : Math.min(seg.wallH - .3, 2.4);
  const sign = { n: [-seg.f[0], -seg.f[1]], pat: seg.fork ? 'forkSign' : seg.turn > 0 ? 'arrowR' : 'arrowL', seg, sign: 1 };
  { const sw = seg.forkY ? .62 : 2.2, se = seg.forkY ? L + Math.SQRT1_2 * (2 * HW + .9) - .04 : e; sign.v = quad(seg, [[se, -sw, H - 1.4], [se, sw, H - 1.4], [se, sw, H], [se, -sw, H]]); } // Y 字路：とがった建物の細い正面に、たての札
  if (!seg.straight && seg.fork) seg.decos.push(sign); /* 2026-11-17 夜 オーナー「右や左に曲がる時の大きな矢印は全ていらない（景色のじゃま）」：曲がり角の矢印の札は出さない（分かれ道の行き先の札だけ残す） */
  if (k === 'deck' && seg.fork) { // a post holding the sign
    seg.props.push(mkProp(seg, [{ l0: -.1, l1: .1, s0: L + HW - .3, s1: L + HW - .1, y0: 0, y1: H - 1.4, c: '#6E7B88' }]));
  }
}
function addDecals(seg, fS, fE) {
  const th = seg.th, L = seg.len, out = (s0, s1, l0, l1, dec, x) => { if (s0 < fS + .5 || s1 > fE - .5) return; seg.floor.push(Object.assign({ v: quad(seg, [[s0, l0, .015], [s1, l0, .015], [s1, l1, .015], [s0, l1, .015]]), c: [0, 0, 0], dec, ti: 0, a: s0, b: s1 }, x || {})); };
  if (th.kind === 'train') { trainFloor(seg, out); return; }
  if (th.kind !== 'street' && th.kind !== 'deck') return;
  const road = th.rpat === 'road' || th.rpat === 'hokoten', stone = ['stone', 'plaza', 'brickroad', 'petalstone'].includes(th.rpat);
  if (road) {
    for (let s = fS + 12 + rand(0, 10); s < fE - 14; s += rand(18, 32)) { const l = pick([-1.5, 0, 1.5]) + rand(-.3, .3); out(s, s + .7, l - .35, l + .35, 'manhole'); }
    for (let s = fS + 6 + rand(0, 6); s < fE - 16; s += rand(10, 18)) { const l = pick([-1.5, 0, 1.5]); out(s, s + .5, l - .5, l + .5, 'patch', { pc: pick(['#5A5A5E', '#6E6E72', '#646468']) }); }
    if (!seg.first && th.kind === 'street' && L > 60) { const z = L - HW - 6.5; out(z, z + 3.6, -ROAD, ROAD, 'zebra'); if (Math.random() < .6) out(z - 4.2, z - 2.4, -ROAD + .3, -.15, 'stop'); if (seg.forkY) { for (const sd of [-1, 1]) { const L0 = sd * (ROAD + .15), L1 = sd * (ROAD + .95); seg.floor.push({ v: quad(seg, [[z + .2, Math.min(L0, L1), .03], [z + 3.4, Math.min(L0, L1), .03], [z + 3.4, Math.max(L0, L1), .03], [z + .2, Math.max(L0, L1), .03]]), c: [0, 0, 0], dec: 'tactile', ti: 0, a: z + .2, b: z + 3.4 }); /* [Y8] 横断歩道の両はしの歩道：黄色い点字ブロック（とまれの点） */
        { const gl = sd * (ROAD + .55), bx = []; for (let a = z - 18; a < z - 1; a += 2) bx.push({ l0: gl - .04, l1: gl + .04, s0: a, s1: a + .08, y0: 0, y1: .8, c: '#E9EDF0' }); bx.push({ l0: gl - .05, l1: gl + .05, s0: z - 18, s1: z - 1, y0: .74, y1: .82, c: '#E9EDF0' }, { l0: gl - .04, l1: gl + .04, s0: z - 18, s1: z - 1, y0: .4, y1: .46, c: '#E9EDF0' }); seg.props.push(mkProp(seg, bx)); } /* [Y12] 交差点の手前の歩道のふちに、白い歩行者用の柵（車道へ出ないように） */
        seg.props.push(mkProp(seg, [{ l0: sd * (ROAD + 1.1) - .06, l1: sd * (ROAD + 1.1) + .06, s0: z - .5, s1: z - .38, y0: 0, y1: 2.9, c: '#8A9098' }, { l0: sd * (ROAD + 1.1) - .2, l1: sd * (ROAD + 1.1) + .2, s0: z - .62, s1: z - .5, y0: 2.1, y1: 2.85, c: '#2B2F36' }, { l0: sd * (ROAD + 1.1) - .14, l1: sd * (ROAD + 1.1) + .14, s0: z - .64, s1: z - .62, y0: 2.5, y1: 2.78, c: '#C8463C' }, { l0: sd * (ROAD + 1.1) - .14, l1: sd * (ROAD + 1.1) + .14, s0: z - .64, s1: z - .62, y0: 2.17, y1: 2.45, c: '#3E5A48' }])); } /* [Y7] 横断歩道の手前の、歩行者の信号（赤・青の 2 つの箱） */
      out(z + 3.9, z + 7.4, -.7, .7, 'yGore'); out(z - 26, z - .3, -.08, .08, 'yLine'); for (let a = z - 24; a < z - 1; a += 3) out(a, a + .2, -.14, .14, 'stud'); out(z - 12, z - 9.5, -ROAD + .35, -.35, 'yArrowL'); out(z - 12, z - 9.5, .35, ROAD - .35, 'yArrowR'); out(z - 21, z - 18.5, -ROAD + .35, -.35, 'yArrowL'); out(z - 21, z - 18.5, .35, ROAD - .35, 'yArrowR'); } else out(z - 12, z - 9.5, .35, ROAD - .35, 'arrow'); } /* [Y1] Y 字路の手前：左の車線に「ななめ左」、右の車線に「ななめ右」の矢印（本物の道の矢印。2 回） */
  }
  if (stone || road) for (let s = fS + 8; s < fE - 8; s += rand(14, 22)) for (const sd of [-1, 1]) if (Math.random() < .55) out(s, s + .5, sd * (ROAD - .38), sd * (ROAD - .05), 'grate');
  if (stone) for (let s = fS + 4; s < fE - 6; s += rand(4, 9)) { const l = rand(-ROAD + .4, ROAD - 1.2); out(s, s + rand(.6, 1.2), l, l + rand(.6, 1.1), 'patch', { pc: pick(['#8A8478', '#A09A8E', '#77716A']) }); }
}
function buildRoom(seg, s0, lEnd, rEnd) {
  const th = seg.th, H = seg.wallH, L = seg.len, glass = th.kind === 'glass'; seg.ceilH = H; /* 天井の高さ（カメラとジャンプが天井をこえないために使う） */
  const wc = C(th.wall || '#E9EEF2'), bc = C(th.base || '#7D8B97');
  const wallRun = (side, a0, a1) => {
    for (let a = a0; a < a1 - .01; a += 3) {
      const b = Math.min(a + 3, a1);
      if (glass && th.core === side) { addWallQuad(seg, side, a, b, 0, H, C(th.coreC || '#DCD8D0'), {}); addWallQuad(seg, side, a, b, 0, .14, bc, { base: 1 }); } /* [T11] 展望台の内がわは、塔のまん中の柱（エレベーターや階段の入る、かべ）。窓は外がわだけ（本物の展望台は、ぐるりと 1 周する通路） */
      else if (glass) addWallQuad(seg, side, a, b, 0, H, wc, { glass: 1, gf: th.gframe });
      else if (side < 0 && th.leftWall === 'trainside') addWallQuad(seg, side, a, b, 0, H, C('#C9CDD2'), { pat: 'trainside', ta: a, tw: b - a });
      else { addWallQuad(seg, side, a, b, 0, H, wc, { pat: th.wpat || null }); addWallQuad(seg, side, a, b, 0, .14, bc, { base: 1 }); }
      if (th.kind === 'train') addWallQuad(seg, side, a, b, .02, .3, C(th.lc || '#80C241'), { base: 1 });
    }
  };
  const terr = seg.straight && seg.toSky, T0 = terr ? L - 16 : 0; /* [F1] 空へ飛び出す展望台：最後の 16m は、屋根の無い外のテラス（ガラスの低い手すりだけ。前も左右も景色が広がる） */
  if (terr) { lEnd = rEnd = T0; }
  wallRun(-1, s0, lEnd); wallRun(1, s0, rEnd);
  /* 外から入った部屋（2026-11-16 オーナー「曲がり角で壁が透けて先が見える」）：曲がり角の四角も部屋の中なので、入り口と反対の側と、うしろに壁を立てる。
     前は部屋の壁が角の四角の先から始まっていて、曲がる途中に、入り口の横から外の通りの木や看板が見えていた。入り口の側（前の道が入ってくる側）はあけておく */
  if (!seg.first && !seg.prevFork && !seg.prevIn && seg.turnIn) { const out = -seg.turnIn; wallRun(out, -HW, s0);
    seg.walls.push({ v: quad(seg, [[-HW, HW, 0], [-HW, -HW, 0], [-HW, -HW, H], [-HW, HW, H]]), c: wc, n: [seg.f[0], seg.f[1]], sh: .95, glass: glass ? 1 : 0, gf: th.gframe, pat: th.wpat || null }); }
  const e = L + HW;
  if (terr) { const nF = [-seg.f[0], -seg.f[1]], rail = '#C9CDD2';
    seg.walls.push({ v: quad(seg, [[T0, -HW, H - .7], [T0, HW, H - .7], [T0, HW, H], [T0, -HW, H]]), c: C(th.base || '#7D8B97'), n: nF, sh: .9 }); for (const x of [-HW + .35, -1.9, 1.9, HW - .35]) seg.props.push(mkProp(seg, [{ l0: x - .05, l1: x + .05, s0: T0 - .05, s1: T0 + .05, y0: 0, y1: H - .7, c: '#AEB6BE' }])); /* [T12] 屋内とテラスの境：あいた自動ドアの銀のわく（たての柱） */ /* [F2] 屋内とテラスの境：上のはり（ここから先は屋根が無い） */
    for (const sd of [-1, 1]) { seg.walls.push({ v: quad(seg, sd < 0 ? [[T0, -HW, 0], [T0, -HW + .35, 0], [T0, -HW + .35, H], [T0, -HW, H]] : [[T0, HW - .35, 0], [T0, HW, 0], [T0, HW, H], [T0, HW - .35, H]]), c: C(th.base || '#7D8B97'), n: nF, sh: .9 });
      for (let a = T0; a < L - .01; a += 2) addWallQuad(seg, sd, a, Math.min(a + 2, L), 0, 1.1, wc, { glass: 1, gf: th.gframe }); /* [F3] 左右：高さ 1.1m のガラスの手すり（上の景色はさえぎらない） */
      seg.lines.push({ a: [T0, sd * (HW - .05), 1.12], b: [L, sd * (HW - .05), 1.12], c: rail, w: .07 }); }
    for (let x = -HW; x < HW - .01; x += 2) seg.walls.push({ v: quad(seg, [[L, x, 0], [L, x + 2, 0], [L, x + 2, 1.1], [L, x, 1.1]]), c: wc, n: nF, sh: 1, glass: 1, gf: th.gframe }); /* 正面のはしも、低いガラスの手すり。その先は空 */
    seg.lines.push({ a: [L, -HW, 1.12], b: [L, HW, 1.12], c: rail, w: .07 });
    seg.floor.push({ v: quad(seg, [[L - 1.6, -HW + .4, .015], [L - 1.2, -HW + .4, .015], [L - 1.2, HW - .4, .015], [L - 1.6, HW - .4, .015]]), c: [0, 0, 0], dec: 'tactile', ti: 0, a: L - 1.6, b: L - 1.2 }); /* [T10] テラスの正面の手すりの手前に、黄色い注意の線（点字ブロック） */
    for (const sd of [-1, 1]) { const q = sd * (HW - .55), a = T0 + 6 + (sd > 0 ? 3 : 0); seg.props.push(mkProp(seg, [{ l0: q - .09, l1: q + .09, s0: a - .09, s1: a + .09, y0: 0, y1: 1.05, c: '#4A5058' }, { l0: q - .22, l1: q + .22, s0: a - .2, s1: a + .2, y0: 0, y1: .06, c: '#3A3F46' }, { l0: q - .2, l1: q + .2, s0: a - .16, s1: a + .2, y0: 1.05, y1: 1.32, c: '#2F6C8E' }, { l0: q - .17, l1: q - .05, s0: a - .26, s1: a - .16, y0: 1.16, y1: 1.27, c: '#1E2328' }, { l0: q + .05, l1: q + .17, s0: a - .26, s1: a - .16, y0: 1.16, y1: 1.27, c: '#1E2328' }, { l0: q - .19, l1: q + .19, s0: a + .2, s1: a + .26, y0: 1.12, y1: 1.26, c: '#16191D' }])); } /* [T9] テラスの左右に、景色を見る望遠鏡（台の柱・青い本体・のぞき口・前のレンズ）。前（空の方）を向く */ }
  else seg.walls.push({ v: quad(seg, [[e, -HW, 0], [e, HW, 0], [e, HW, H], [e, -HW, H]]), c: wc, n: [-seg.f[0], -seg.f[1]], sh: 1, glass: glass ? 1 : 0, gf: th.gframe, pat: th.wpat || null });
  /* つきあたりの壁（2026-11-16 オーナー「景色や壁にブラッシュアップの余地がたくさん」）：どの部屋も、白い壁に矢印だけだった。
     はばき（床との境の板）を回し、矢印の左右に、その部屋の壁と同じ種類の物（窓・ふすま・額・ポスター・時計…）を掛ける。
     事務所・駅など土足の建物は、足もとに消火器、上に非常口の明かり。電車は、車両のはしの壁（となりの車両への引き戸・窓・ステンレスの板）にする */
  if (!glass) { const nE = [-seg.f[0], -seg.f[1]], ex = e - .04, put = (pat, l0, l1, y0, y1, x) => seg.decos.push(Object.assign({ v: quad(seg, [[ex, l0, y0], [ex, l1, y0], [ex, l1, y1], [ex, l0, y1]]), n: nE, pat, v2: (Math.random() * 4) | 0, seg, w: l1 - l0, seed: (Math.random() * 1e5) | 0 }, x || {}));
    if (th.kind === 'train') put('carend', -HW, HW, 0, H);
    else if (th.lift) { put('liftDoor', -1.6, 1.6, 0, 2.55, { lift: th }); /* [H17] かごの中：最後の 7m は、本物の大きさのかご（はば 3.9m・高さ 2.6m）。入口の銀のわく、左右のかべは季節の絵の板、低い天井の明かり */
      const K0 = L - 7, kw = 1.95, kh = 2.6, wc2 = C(th.wall || '#2B2522'), nB = [-seg.f[0], -seg.f[1]];
      for (const sd of [-1, 1]) { seg.walls.push({ v: quad(seg, sd < 0 ? [[K0, -kw, 0], [e, -kw, 0], [e, -kw, kh], [K0, -kw, kh]] : [[e, kw, 0], [K0, kw, 0], [K0, kw, kh], [e, kw, kh]]), c: wc2, n: [-sd * seg.r[0], -sd * seg.r[1]], sh: sd < 0 ? .94 : .86 });
        seg.decos.push({ v: quad(seg, sd < 0 ? [[K0 + .6, -kw + .02, .4], [e - .6, -kw + .02, .4], [e - .6, -kw + .02, 2.3], [K0 + .6, -kw + .02, 2.3]] : [[e - .6, kw - .02, .4], [K0 + .6, kw - .02, .4], [K0 + .6, kw - .02, 2.3], [e - .6, kw - .02, 2.3]]), n: [-sd * seg.r[0], -sd * seg.r[1]], pat: 'liftArt', v2: 0, seg, w: 6 }); }
      for (const sd of [-1, 1]) seg.walls.push({ v: quad(seg, sd < 0 ? [[K0, -HW, 0], [K0, -kw, 0], [K0, -kw, H], [K0, -HW, H]] : [[K0, kw, 0], [K0, HW, 0], [K0, HW, H], [K0, kw, H]]), c: C('#B9C0C6'), n: nB, sh: .95 }); /* かごの入口の両わきの銀のかべ */
      seg.walls.push({ v: quad(seg, [[K0, -kw, kh], [K0, kw, kh], [K0, kw, H], [K0, -kw, H]]), c: C('#B9C0C6'), n: nB, sh: .9 });
      for (const sd of [-1, 1]) { const q = sd * (kw - .09); seg.lines.push({ a: [K0 + .4, q, .92], b: [e - .3, q, .92], c: '#D5DADF', w: .06 }); for (const x of [K0 + .4, e - .3]) seg.lines.push({ a: [x, q, .92], b: [x, sd * (kw - .02), .92], c: '#D5DADF', w: .04 }); addWallQuadO(seg, sd, K0, e, 0, .12, kw - HW - .015, C('#2A2A2E'), { base: 1 }); } /* [S7] かごの中の左右に、銀の手すりと、足もとの黒いけり板 */
      seg.walls.push({ v: quad(seg, [[K0, kw, kh], [e, kw, kh], [e, -kw, kh], [K0, -kw, kh]]), c: C('#EFE8D8'), n3: [0, -1, 0], sh: .95 }); } /* かごの低い天井（明るい） */ /* [H12] かごの正面：銀の扉と、上がっていく高さの数字 */
    else { seg.walls.push({ v: quad(seg, [[e - .02, -HW, 0], [e - .02, HW, 0], [e - .02, HW, .14], [e - .02, -HW, .14]]), c: bc, n: nE, sh: .9, base: 1 });
      const ok = (th.wdeco || []).filter(t => !['seatwin', 'izakaya', 'stationsign', 'timetable', 'flightboard', 'planewin', 'citywin'].includes(t)), soft = th.rpat === 'tatami' || th.rpat === 'boards' || th.rpat === 'rug';
      for (const sd of [-1, 1]) { const t = ok.length ? pick(ok) : (soft ? 'frame' : 'poster'), sz = DECO_SIZE[t] || [2, .8, 2], w = Math.min(1.9, sz[0]), c0 = sd * 3.4;
        put(t, c0 - w / 2, c0 + w / 2, sz[1], Math.min(sz[2], H - .15)); }
      if (!soft) { put('extinguisher', -2.05, -1.55, 0, .82); if (H >= 2.85) put('exitsign', 1.2, 2.1, H - .36, H - .08); } } }
  /* 曲がり角・分かれ道の「奥の壁」を横に長くのばす（2026-11-15 の報告：「壁が透けて、次の次のステージが見える」）。
     建物の中から外の道へ曲がる所で、つきあたりの壁の左右から、先の道とその先の町がななめに見えていた（壁が無いので、透けて見える）。
     のばした壁は、中にいる間と曲がり始めだけ描く（wing。描くかどうかは 4_render.js の wingOn）。先が同じ建物の中なら、その部屋の壁があるので描かない */
  if (!terr) seg.walls.push({ v: quad(seg, [[e, -HW, H], [e, HW, H], [e, HW, 16], [e, -HW, 16]]), c: wc, n: [-seg.f[0], -seg.f[1]], sh: .86, cap: 1 }); // つきあたりの壁の上（先の天井が高い・先が外のとき、壁の上から先の町が見えた）
  for (const sd of [-1, 1]) if (seg.turn === sd || seg.fork) { const a0 = sd * HW, a1 = sd * (HW + 46), lo = Math.min(a0, a1), hi = Math.max(a0, a1);
    seg.walls.push({ v: quad(seg, [[e, lo, 0], [e, hi, 0], [e, hi, 16], [e, lo, 16]]), c: wc, n: [-seg.f[0], -seg.f[1]], sh: .9, wing: 1 });
    seg.walls.push({ v: quad(seg, [[e, lo, 0], [e, hi, 0], [e, hi, .5], [e, lo, .5]]), c: bc, n: [-seg.f[0], -seg.f[1]], sh: .8, wing: 1 }); }
  if (seg.first) { const b0 = s0; seg.walls.push({ v: quad(seg, [[b0, HW, 0], [b0, -HW, 0], [b0, -HW, H], [b0, HW, H]]), c: wc, n: [seg.f[0], seg.f[1]], sh: .95, glass: glass ? 1 : 0, gf: th.gframe, pat: th.wpat || null }); // the room's back wall (seen on the title screen)
    if (!glass) { const bw = (th.backW || 2.2) / 2; seg.decos.push({ v: quad(seg, [[b0 + .03, bw, .2], [b0 + .03, -bw, .2], [b0 + .03, -bw, 2.5], [b0 + .03, bw, 2.5]]), n: [seg.f[0], seg.f[1]], pat: (th.wdeco || ['window'])[0], v2: 1, seg, w: bw * 2 }); } }
  // ceiling
  const cc = C(th.ceil || '#EEF0F2');
  const cE = terr ? T0 : seg.fE;
  for (let a = seg.fS, i = 0; a < cE - .01; a += 3, i++) {
    const b = Math.min(a + 3, cE);
    seg.walls.push({ v: quad(seg, [[a, HW, H], [b, HW, H], [b, -HW, H], [a, -HW, H]]), c: cc, n3: [0, -1, 0], sh: .82, pat: 'ceil', cp: th.cpat, light: th.light, ti: i, glass: glass && !th.solidCeil ? 1 : 0, gf: th.gframe, ceil: 1, train: th.kind === 'train' ? 1 : 0, ta: a, tlay: th.kind === 'train' ? trainLay(seg) : null });
  }
  if (!seg.fork && !terr) seg.walls.push({ v: quad(seg, [[L - HW, HW, H], [e, HW, H], [e, -HW, H], [L - HW, -HW, H]]), c: cc, n3: [0, -1, 0], sh: .82, cap: 1 }); // 曲がり角の上の天井（先が外のとき、ここに天井が無くて外が見えた）
  // lintels above the openings
  for (const sd of [-1, 1]) if (seg.turn === sd || seg.fork) addWallQuad(seg, sd, L - HW, L + HW, H - .5, H, bc, { sh: .8 });
  // wall decorations
  if (th.kind === 'train') trainWalls(seg);
  if (seg.tid === 'tlobby' || seg.tid === 'slobby') entryDoors(seg, s0 + 5);
  else if (th.wdeco) {
    for (const sd of [-1, 1]) {
      if (sd < 0 && th.leftWall) continue; if (glass && th.core !== sd) continue;
      let s = s0 + (seg.first ? 18 : 2) + rand(0, 2);
      const end = (sd < 0 ? lEnd : rEnd) - 2;
      while (s < end - 1) {
        const type = pick(th.wdeco), sz = DECO_SIZE[type] || [2, .8, 2];
        if (s + sz[0] > end) break;
        const lat = sd * (HW - .03), n = [-sd * seg.r[0], -sd * seg.r[1]];
        const a = s, b = s + sz[0], y0 = sz[1], y1 = Math.min(sz[2], H - .15);
        const pts = sd < 0 ? [[a, lat, y0], [b, lat, y0], [b, lat, y1], [a, lat, y1]] : [[b, lat, y0], [a, lat, y0], [a, lat, y1], [b, lat, y1]];
        seg.decos.push({ v: quad(seg, pts), n, pat: type, v2: (Math.random() * 4) | 0, seg, w: sz[0] });
        s += sz[0] + (th.kind === 'train' ? rand(.2, .6) : rand(1.2, 3.5));
      }
    }
  }
}
const DECO_SIZE = { selev: [2.4, 0, 3.0], ticketbooth: [2.8, .1, 2.7], towerposter: [1.5, .8, 2.9], infodesk: [2.6, .1, 2.6], quizpanel: [1.4, 1.0, 2.0], stepsign500: [1.2, 1.2, 1.9], tansuW: [1.5, 0, 1.65], hanger: [.9, 1.0, 2.5], elevator: [2.0, 0, 2.6], bookshelf: [2.8, 0, 2.6], mirror: [1.6, .8, 2.0], menuboard: [1.8, 1.1, 2.4], woodpanel: [2.4, 0, 2.8], portrait: [1.1, 1.3, 2.3], shoji: [2.4, .2, 2.6], fusuma: [2.6, .15, 2.6], tokonoma: [2.2, .35, 2.5], window: [2.2, .9, 2.3], calendar: [1.0, 1.2, 2.2], frame: [1.4, 1.2, 2.1],
  seatwin: [3.6, .0, 2.4], door: [1.5, 0, 2.3], trainmap: [1.1, 1.4, 2.3], stationsign: [3.0, 1.6, 2.8], poster: [1.2, 1.0, 2.3], timetable: [2.4, 1.4, 2.6],
  citywin: [3.6, .5, 2.7], plantwall: [2.4, .3, 2.8], whiteboard: [2.6, .9, 2.2], clock: [1.0, 2.0, 2.8], screen: [3.0, .9, 2.6], izakaya: [3.4, 0, 2.9], menu: [1.2, 1.0, 2.2] };

/* ---- 電車の中（2026-11-17 オーナー：「電車の中を走るときのクオリティが全体的に低め。現実世界に近くハイクオリティに、100 以上」） ----
   前は、座席・窓・ドア・つり革・中づりを、それぞれ「くじ」で並べていた（ドアが 10m 以上ないところ・座席が窓とずれる・どこまでも 1 両の長いつつ）。
   本物の通勤電車（山手線などの 4 ドア・20m の車両）を調べた並び：車両のはし（となりへの通路）→ 3 人がけ（片方のはしは優先席）→ ドア → 7 人がけ → ドア → 7 人がけ → ドア → 7 人がけ → ドア → 3 人がけ → 通路。
   ドアは左右で向かい合い、ドアとドアのあいだは約 4.8m。番号は docs/TRAIN-100-2026-11-17.md */
const TCAR = 20, TDOOR = [2.75, 7.55, 12.35, 17.15], TBENCH = [[.72, 1.42, 3, 1], [3.55, 3.2, 7, 0], [8.35, 3.2, 7, 0], [13.15, 3.2, 7, 0], [17.86, 1.42, 3, 0]], TGW = 2.35; // [1][2][3] 車両 20m・4 ドア・座席の並び [4] 通路（ほろ）の口は、走る 3 車線より広く
function trainLay(seg) {
  if (seg.tlay) return seg.tlay; const { s0, lEnd, rEnd } = sideEnds(seg); const cars = [], b0 = s0 + 13 - TCAR;
  for (let c = b0; c < Math.max(lEnd, rEnd) + 1; c += TCAR) cars.push(c);
  const no0 = 2 + ((Math.random() * 6) | 0); // [5] 号車の番号は、となりへ行くたびに 1 つずつ（前へ走ると数が増える）
  return seg.tlay = { sun: Math.random() < .5 ? -1 : 1, s0, lEnd, rEnd, cars, endOf: sd => (sd < 0 ? lEnd : rEnd), no: c => no0 + Math.round((c - b0) / TCAR) };
}
function trainWalls(seg) {
  const T = trainLay(seg), H = seg.wallH, th = seg.th;
  const deco = (sd, a, b, y0, y1, pat, x) => { const lat = sd * (HW - .03), n = [-sd * seg.r[0], -sd * seg.r[1]]; const pts = sd < 0 ? [[a, lat, y0], [b, lat, y0], [b, lat, y1], [a, lat, y1]] : [[b, lat, y0], [a, lat, y0], [a, lat, y1], [b, lat, y1]];
    seg.decos.push(Object.assign({ v: quad(seg, pts), n, pat, v2: (Math.random() * 4) | 0, seg, w: b - a, sd, seed: (Math.random() * 1e5) | 0 }, x || {})); };
  for (const sd of [-1, 1]) { const lo = T.s0 + .2, hi = T.endOf(sd) - .3;
    for (const c of T.cars) { const no = T.no(c);
      TDOOR.forEach((d, i) => { const a = c + d - .75, b = c + d + .75; if (a > lo && b < hi) deco(sd, a, b, 0, Math.min(2.3, H - .15), 'door', { car: no, di: i }); }); // [6] ドアは左右で向かい合う
      for (const [r, len, n, pr] of TBENCH) { const a = c + r - .04, b = c + r + len + .04; if (a > lo && b < hi) deco(sd, a, b, 0, Math.min(2.4, H - .15), 'seatwin', { one: n === 3 ? 1 : 0, prio: pr, car: no }); } // [7] 窓は座席の上にそろう [8] 3 人がけの上は 1 枚の窓
    } }
  for (const c of T.cars) if (c > T.s0 + 1.2 && c < Math.min(T.lEnd, T.rEnd) - 1.2) gangway(seg, c, T.no(c - 1), T.no(c));
}
/* となりの車両への通路（ほろ）：手前の車両のはし（ステンレスの板・号車の札・消火器・優先席の札）→ 黒いほろの内側 → 向こうの車両。上は低い「かもい」。足もとは金属の渡り板 */
/* [T3] 塔の入口の建物：入ってすぐの、ガラスの自動ドアの枠（左右にあいた 2 枚のガラス戸・上の枠・ドアの上の案内） */
function entryDoors(seg, a) { const H = seg.wallH, nE = [-seg.f[0], -seg.f[1]], wc = C('#B9C0C7'), gl = C('#CFE3EE');
  for (const sd of [-1, 1]) { const l0 = sd * 2.6, l1 = sd * HW, lo = Math.min(l0, l1), hi = Math.max(l0, l1);
    seg.walls.push({ v: quad(seg, [[a, lo, 0], [a, hi, 0], [a, hi, 2.9], [a, lo, 2.9]]), c: gl, n: nE, sh: 1, glass: 1 });
    seg.walls.push({ v: quad(seg, [[a, sd * 2.5, 0], [a, sd * 2.7, 0], [a, sd * 2.7, 2.9], [a, sd * 2.5, 2.9]].map(p => sd < 0 ? [p[0], Math.min(p[1], -2.5), p[2]] : p)), c: wc, n: nE, sh: .9 }); }
  seg.walls.push({ v: quad(seg, [[a, -HW, 2.9], [a, HW, 2.9], [a, HW, H], [a, -HW, H]]), c: wc, n: nE, sh: .95, pat: 'doorhead' }); }
function gangway(seg, c, noA, noB) {
  const H = seg.wallH, nE = [-seg.f[0], -seg.f[1]], a = c - .38, b = c + .38, hy = H - .34, wc = C('#CDD3D8');
  for (const sd of [-1, 1]) { const l0 = sd * TGW, l1 = sd * HW, lo = Math.min(l0, l1), hi = Math.max(l0, l1);
    seg.walls.push({ v: quad(seg, [[a, lo, 0], [a, hi, 0], [a, hi, H], [a, lo, H]]), c: wc, n: nE, sh: .97, pat: 'gangP', gsd: sd, gno: noA, ti: 0 }); // [9] 車両のはしの板（顔）
    const lat = sd * TGW, n = [-sd * seg.r[0], -sd * seg.r[1]]; // [10] ほろの内側（通路の横の壁）：黒いゴムのひだ
    seg.walls.push({ v: quad(seg, sd < 0 ? [[a, lat, 0], [b, lat, 0], [b, lat, H], [a, lat, H]] : [[b, lat, 0], [a, lat, 0], [a, lat, H], [b, lat, H]]), c: C('#646B72'), n, sh: .9, pat: 'gangS', ti: 0 }); }
  seg.walls.push({ v: quad(seg, [[a, -TGW, hy], [a, TGW, hy], [a, TGW, H], [a, -TGW, H]]), c: wc, n: nE, sh: .97, pat: 'gangH', gno: noB, ti: 0 }); // [11] 通路の上のかもい（となりの号車の番号）
  seg.walls.push({ v: quad(seg, [[a, TGW, hy], [b, TGW, hy], [b, -TGW, hy], [a, -TGW, hy]]), c: C('#8E98A2'), n3: [0, -1, 0], sh: .75, ti: 0 }); // [12] かもいの下の面
}
function trainFloor(seg, out) {
  const T = trainLay(seg);
  for (const c of T.cars) { for (const sd of [-1, 1]) { const hi = T.endOf(sd) - .3;
      for (const d of TDOOR) { const a = c + d - .68, b = c + d + .68; if (a > T.s0 && b < hi) out(a, b, sd < 0 ? -HW + .02 : HW - .62, sd < 0 ? -HW + .62 : HW - .02, 'tdoor', { sd }); } // [13] ドアの前の床：黄色い注意の帯と、ドアのしきい（溝のある金属）
      for (const [r, len] of TBENCH) { const a = c + r, b = c + r + len; if (a > T.s0 && b < hi) { out(a, b, sd < 0 ? -HW + .02 : HW - 1.05, sd < 0 ? -HW + 1.05 : HW - .02, 'tseatF', { sd });
        if (sd === T.sun && !seg.th.tunnel) out(a + .3, b - .1, sd < 0 ? -HW + 1.1 : HW - 2.7, sd < 0 ? -HW + 2.7 : HW - 1.1, 'tsun', { sd }); } } } // [90] 日の当たる側の窓から、床に日だまり // [14] 座席の下と足もとのかげ
    if (c > T.s0 + 1.2 && c < Math.min(T.lEnd, T.rEnd) - 1.2) out(c - .38, c + .38, -TGW, TGW, 'tgang'); } // [15] 車両のつなぎ目の渡り板
}
function trainSeat(sd, s, len, n, pr) { // [16] 座席の長さ・人数を、本物の 7 人がけ（3.2m）・3 人がけ（1.4m）に
  const c = pr ? '#8E5A62' : '#2F6E8E', t = (n === 3 ? '3' : '') + (pr ? 'P' : ''), fw = n === 3 ? 150 : 300, bx = [
    Object.assign(B(sd * 4.0, s, 1.0, len, .42, .6, c), { face: 'tsC' + t, faceW: fw, faceH: 40 }), Object.assign(B(sd * 4.05, s + .05, .9, len - .1, 0, .42, '#8E98A2'), { face: 'tsbase', faceW: fw, faceH: 50 }),
    Object.assign(B(sd * 4.45, s, .2, len, .6, 1.18, c), { face: 'tsB' + t, faceW: fw, faceH: 70 }),
    Object.assign(B(sd * 3.98, s - .07, 1.04, .06, .42, 1.3, '#D9DEE2'), { face: 'tspart', faceW: 160, faceH: 140, faceFront: 1, noEdge: 1 }), Object.assign(B(sd * 3.98, s + len + .01, 1.04, .06, .42, 1.3, '#D9DEE2'), { face: 'tspart', faceW: 160, faceH: 140, faceFront: 1, noEdge: 1 }), // [17] 両はしの仕切り板
    B(sd * 3.47, s - .04, .07, .07, 0, 2.6, '#D9DEE2'), B(sd * 3.47, s + len, .07, .07, 0, 2.6, '#D9DEE2'), // [18] 仕切りの横のたての手すり
    B(sd * 4.25, s, .5, len, 1.92, 1.95, '#B9C0C7'), B(sd * 4.0, s, .04, len, 1.9, 1.96, '#D9DEE2')]; // [19] 網棚
  if (n === 7) bx.push(B(sd * 3.6, s + len * 3 / 7 - .035, .06, .06, .42, 2.6, '#D9DEE2')); // [20] 7 人がけのまん中の手すり（3 人と 4 人に分ける）
  return bx;
}
function trainProps(seg) {
  const T = trainLay(seg), H = seg.wallH, dy = Math.max(0, H - 2.9), r = Math.random;
  for (const sd of [-1, 1]) { const lo = T.s0 + .2, hi = T.endOf(sd) - .4;
    for (const c of T.cars) {
      for (const [rr, len, n, pr] of TBENCH) { const a = c + rr; if (a - .1 < lo || a + len + .1 > hi) continue; seg.props.push(mkProp(seg, trainSeat(sd, a, len, n, pr)));
        if (r() < .35) { const q = a + .2 + r() * (len - .7), w = .3 + r() * .25, col = pick(['#3B3F46', '#7A5538', '#2F5579', '#9AA4AD', '#5F2F2F']); seg.props.push(mkProp(seg, [B(sd * 4.22, q, .34, w, 1.96, 2.12 + r() * .06, col)])); } } // [21] 網棚の上に、ときどきかばん
      // [22] つり革：座席の前に、レールにそって約 55cm ごと。[23] 高さは 2 種類（低いつり革を混ぜる） [24] 優先席の前は黄色いつり革
      const ra = Math.max(lo, c + .6), rb = Math.min(hi, c + TCAR - .6); if (rb - ra > 1) { seg.lines.push({ a: [ra, sd * 3.05, 2.58 + dy], b: [rb, sd * 3.05, 2.58 + dy], c: '#C9CDD2', w: .05 });
        for (let q = ra + .4; q < rb; q += 1.65) seg.lines.push({ a: [q, sd * 3.05, 2.58 + dy], b: [q, sd * 3.35, H - .02], c: '#B9C0C7', w: .035 }); // [96] つり革のレールを天井から支える金具
        for (let q = ra + .3, k = 0; q < rb - .2; q += .55, k++) { const rel = q - c, prio = rel < 2.3, low = k % 3 === 1; seg.spr.push({ lat: sd * 3.05, s: q, y: (low ? 1.93 : 2.05) + dy, h: low ? .62 : .5, w: .22, img: prio ? 'strapP' : 'strap' }); } }
      // [25] ドアの横に立っている人（混み具合は時間で：朝と夕方は多め）
      const rush = (G.clock > 7 * 60 + 30 && G.clock < 9 * 60 + 30) || (G.clock > 17 * 60 + 30 && G.clock < 19 * 60 + 30), pN = rush ? .55 : G.clock > 21 * 60 ? .12 : .25; // [97] 夜おそくは人が少ない
      TDOOR.forEach(d => { if (r() > pN) return; const q = c + d + (r() < .5 ? -.42 : .42); if (q < lo + .5 || q > hi - .5) return; const k = (r() * PEOPLE.length) | 0, back = r() < .5 ? 1 : 0;
        seg.spr.push({ lat: sd * 3.9, s: q, y: 0, w: .8, h: 1.75, img: artKey('walker', k + '.0.' + back), gnd: .3, keep: 1, rider: 1 }); }); } }
  // [26] 中づり広告：ドアとドアのあいだの、通路のまん中に 1 組（前は 3m ごと、くじで）
  for (const c of T.cars) for (const d of [5.15, 9.95, 14.75]) { const q = c + d; if (q < T.s0 + 1 || q > Math.min(T.lEnd, T.rEnd) - 2) continue;
    for (const o of [-.6, .6]) { seg.spr.push({ lat: o < 0 ? -.95 : .95, s: q + o, y: 2.34 + dy, h: .46, w: .82, img: artKey('ad', ((r() * 10) | 0) + adSeason()), keep: 1 }); seg.lines.push({ a: [q + o, o < 0 ? -.95 : .95, 2.6 + dy], b: [q + o, o < 0 ? -.95 : .95, 2.86 + dy], c: '#9AA0A6', w: .03 }); } } // [69] 中づりは少し小さく、通路のまん中の真上をさけて左右に（前は正面の上をふさいで、数字の板に重なった）
}

/* [79] ホームドア（2026-11-17）：電車の側のホームのはしに、腰の高さのドアの列。[80] あく所は、止まっている電車のドアの前（20m・4 ドアにそろえる）
   [81] 上のふちに線の色の帯 [82] あく所の両わきの戸袋（少し高い柱）。電車の横の絵（trainside）と同じ 20m の割り付け */
function platformDoors(seg, s0, end) {
  const lat = -HW + .62, a0 = s0 + .5, a1 = end - .5;
  for (let c = Math.floor(a0 / 20) * 20; c < a1; c += 20) { const a = Math.max(a0, c + .2), b = Math.min(a1, c + 19.8); if (b - a < 1) continue;
    seg.props.push(mkProp(seg, [Object.assign(B(lat, a, .16, b - a, 0, 1.25, '#F1F3F4'), { face: 'psd' + Math.round(a - c) + '_' + Math.round(b - c), faceW: Math.round((b - a) * 50), faceH: 64 }), B(lat, a, .2, b - a, 1.25, 1.32, '#B9C0C7')]));
    for (const d of [2.75, 7.55, 12.35, 17.15]) for (const e of [-1.05, 1.05]) { const q = c + d + e; if (q > a + .1 && q < b - .3) seg.props.push(mkProp(seg, [B(lat, q - .14, .32, .28, 0, 1.36, '#D9DEE2')])); } }
}

/* ---- streets: sidewalks, curbs, building facades ---- */
function buildStreet(seg, s0, lEnd, rEnd) {
  const th = seg.th, fac = th.fac, L = seg.len;
  // curbs
  const cc = C(th.curb || '#D9D6CE');
  for (const sd of [-1, 1]) {
    const lat = sd * ROAD, l2 = sd * (ROAD + .2), end = sd < 0 ? lEnd : rEnd;
    for (let a = sideStart(seg, sd) ?? s0; a < end - .01; a += 6) { const b = Math.min(a + 6, end);
      seg.walls.push({ v: quad(seg, [[a, lat, .14], [b, lat, .14], [b, l2, .14], [a, l2, .14]]), c: cc, n3: [0, 1, 0], sh: 1, curb: 1 });
      seg.walls.push({ v: quad(seg, sd < 0 ? [[a, lat, 0], [b, lat, 0], [b, lat, .14], [a, lat, .14]] : [[b, lat, 0], [a, lat, 0], [a, lat, .14], [b, lat, .14]]), c: cc, n: [sd * seg.r[0] * -1, sd * seg.r[1] * -1], sh: .8, curb: 1 }); }
  }
  const cont = !!(seg.step && seg.step.cont);
  if (th.gate && !cont) { const gc = th.gateColor || '#2F5579', s1 = (seg.first ? 6 : HW) + (th.gateColor ? 22 : 7); // the street's name gate, painted whole
    seg.spr.push({ lat: 0, s: s1 + .2, y: 0, w: (ROAD + .9) * 2, h: 6.5, img: artKey('sgate', th.gate + '/' + gc), far: 1, keep: 1 }); }
  if (th.torii && !cont) { const tc = th.torii, s1 = (seg.first ? 6 : HW) + 10, W2 = ROAD + 1.3; // a big shrine gate across the approach, painted whole
    seg.spr.push({ lat: 0, s: s1 + .35, y: 0, w: (W2 + 1.9) * 2, h: 8.35, img: artKey('torii', tc + '/' + (th.toriiTop || '#2B2B2B') + (th.plaque ? '/' + th.plaque : '')), far: 1, keep: 1 }); }
  if (th.toriiTunnel) { const W2 = ROAD + .45, key = artKey('torii', '#D9452B/#2B2B2B/tunnel'); for (let a = (seg.first ? 10 : HW + 8); a < L - HW - 10; a += 2.8) seg.spr.push({ lat: 0, s: a + .14, y: 0, w: (W2 + .5) * 2, h: TORII_TUNNEL_H, img: key, keep: 1, beamY: TORII_TUNNEL_H * (1 - .22) }); } /* beamY＝いちばん下の横木の下の高さ（qa/toriiview が、カメラより上にあることを確かめる） */ // rows of small vermilion gates
  if (seg.hp && seg.hp.shape === 'underpass') { // a railway bridge across the bottom of the dip, painted whole (deck, railing, piers, the height sign)
    const mid = (seg.hp.a + seg.hp.b) / 2, a0 = mid - 4, a1 = mid + 4;
    seg.spr.push({ lat: 0, s: a0, y: 0, w: (HW + 1.2) * 2, h: 7.6, img: artKey('overpass', 'rail'), far: 1, keep: 1 });
    /* 2026-11-17 オーナー：「電車が上を通過する時に、電車の下側が見えてしまうのはおかしい。線路のはずなのに」。
       前は、橋げたが道の上（はば ±(HW+8)m）しか無く、電車はその外（±80m まで）も走るので、下から台車・床下の機器が丸見えだった。車輪も橋げたの上の面より下にめりこんでいた。
       本物の鉄道の高架橋：コンクリートの厚い橋げたが、電車の走る所ぜんぶの下にある。両側に、電車のすそをかくす高さの壁（かべ高欄）。電車はレールの上に乗る。
       → 橋げたを電車の走る範囲（±95m）までのばし、両側にかべ高欄、電車をレールの上（橋げたの上の面＋レール）に乗せた */
    seg.props.push(mkProp(seg, [{ l0: -95, l1: 95, s0: a0 + .05, s1: a1, y0: 4.6, y1: 5.6, c: '#8E949A' }, // 橋げた（電車の走る所ぜんぶの下）
      { l0: -95, l1: 95, s0: a0 + .05, s1: a0 + .35, y0: 5.6, y1: 7.0, c: '#A3A9AE' }, { l0: -95, l1: 95, s0: a1 - .3, s1: a1, y0: 5.6, y1: 7.0, c: '#A3A9AE' }], { big: 1 })); // かべ高欄（両側）：下から電車のすそ・台車は見えない
    seg.movers = seg.movers || []; seg.movers.push({ ds: rand(-30, 30), v: -22, cross: 1, bx: trainCars({ cross: 1, l0: -40, l1: -10, s0: a0 + 1, s1: a1 - 1, y0: 6.75, lc: th.lc || '#80C241' }) }); // 車輪の下＝6.75-.95=5.8：橋げた（5.6）＋レール
  }
  if (th.overpass) { const a0 = L * .3, a1 = Math.min(L - HW - 6, a0 + 34); // an expressway passing overhead
    seg.spr.push({ lat: 0, s: a0, y: 0, w: (HW + 6) * 2, h: 14.6, img: artKey('overpass', 'road'), far: 1, keep: 1 });
    seg.props.push(mkProp(seg, [{ l0: -HW - 6, l1: HW + 6, s0: a0 + .05, s1: a1, y0: 8.6, y1: 10.2, c: '#9AA0A6' }], { big: 1 }));
    for (const sd of [-1, 1]) seg.props.push(mkProp(seg, [{ l0: sd * (HW + .4) - .5, l1: sd * (HW + .4) + .5, s0: a1 - 5, s1: a1 - 3.8, y0: 0, y1: 8.6, c: '#8F949A' }], { big: 1 })); }
  if (fac.style === 'park') { buildPark(seg, s0, lEnd, rEnd); return; }
  for (const sd of [-1, 1]) { const a0 = sideStart(seg, sd) ?? s0, a1 = sd < 0 ? lEnd : rEnd, pf = seg.parentTh && seg.parentTh.fac, blend = pf && !['park', 'viaduct'].includes(pf.style) && a1 - a0 > 50;
    if (blend) { const keep = seg.th, cut = a0 + 22; seg.th = Object.assign({}, keep, { fac: pf }); try { buildFacades(seg, sd, a0, cut); } finally { seg.th = keep; } buildFacades(seg, sd, cut, a1); } /* [Y9] Y 字路で分かれた先の道は、はじめの約 20m は分かれる前の町なみが続き、そこから次の町に変わる（別の場所を Y 字でくっつけただけに見えないように） */
    else buildFacades(seg, sd, a0, a1); }
  if (seg.forkY) { yWedge(seg); return; }
  // end of the street: one building across
  const e = L + HW, h = clamp(rand(fac.h[0], fac.h[1]), 8, 40), c = C(pick(fac.pal)), ev = (Math.random() * 8) | 0;
  seg.props.push(mkProp(seg, [{ l0: -HW, l1: HW, s0: e - .35, s1: e, y0: h - .05, y1: h + .25, c: '#6E6A64' }, { l0: -HW, l1: HW, s0: e - .12, s1: e, y0: h + .25, y1: h + .95, c: '#9A958C' }], { big: 1 })); // [G54] つきあたりの建物にも、屋上のふち
  for (let x = -HW; x < HW - .01; x += 3) seg.walls.push({ v: quad(seg, [[e, x, 0], [e, x + 3, 0], [e, x + 3, h], [e, x, h]]), c, n: [-seg.f[0], -seg.f[1]], sh: 1, pat: 'fac', st: fac.style === 'station' ? 'glass' : fac.style, h, w: 3, seed: (x * 7 + 3) | 0, fv: ev, fw: 2 * HW, fh: Math.round(h * 2) / 2, fm: fac.mood || '', fu0: (x + HW) / (2 * HW), fu1: (x + 3 + HW) / (2 * HW) }); // 2026-11-17 景色 97：つきあたりの建物も、両わきの建物と同じ 1 枚の絵（前は青い窓がならぶだけ）
}
function buildFacades(seg, sd, s0, end) {
  const th = seg.th, fac = th.fac;
  const style = sd < 0 ? (fac.left || fac.style) : (fac.right || fac.style);
  if (style === 'viaduct') { // elevated railway: arches below, a train going by on top
    for (let a = s0, k = 0; a < end - .01; a += 3, k++) { const b = Math.min(a + 3, end); addWallQuad(seg, sd, a, b, 0, 8, C('#8E8A82'), { pat: 'fac', st: 'viaduct', h: 8, w: b - a, seed: k, k }); }
    seg.movers = seg.movers || [];
    seg.movers.push({ ds: rand(s0, end - 40), v: -16, r0: s0, r1: end, bx: trainCars({ side: sd, near: HW + .4, far: HW + 3.4, y0: 8.3, len: 40, lc: th.lc || '#80C241' }) });
    return;
  }
  const pal = style === 'glass' && fac.pal2 ? fac.pal2 : fac.pal;
  let s = s0, prevH = 0, prevOff = 0, prevTier = null;
  const ALLEY = ['mixed', 'neon', 'books', 'luxury', 'glass'].includes(style); // [G6] 建物と建物のあいだの細い路地（本物の通りは、ビルがすき間なくつながった 1 枚の壁ではない）
  while (s < end - .01) {
    let w = style === 'nakamise' || style === 'market' ? rand(3.5, 5) : style === 'machiya' ? rand(4, 6) : style === 'books' ? rand(4, 7) : style === 'station' ? end - s : style === 'house' ? rand(7, 10) : rand(5, 11);
    if (style !== 'station') w = Math.max(3.6, Math.round(w / .91) * .91); // [G22] 間口は 1 間（約 0.91m）の倍数：日本の土地の割り方
    if (end - s - w < 3) w = end - s;
    let h = style === 'station' ? 13 : rand(fac.h[0], fac.h[1]);
    if (style !== 'station' && prevH > 0 && Math.abs(h - prevH) < 1.6) h = clamp(h + (h < (fac.h[0] + fac.h[1]) / 2 ? 2.2 : -2.2), Math.max(4, fac.h[0] - 1), fac.h[1] + 1); // [G23] となりと同じ高さが続かない（高さがそろうと、1 枚の壁紙に見えた）
    if (style !== 'station' && style !== 'house') h = Math.max(4, Math.round(h / 3.2) * 3.2 + .6); // [G24] 高さは階の高さ（3.2m）の倍数＋屋上の手すり：窓の段と建物の高さが合う
    const c = C(pick(pal)), seed = (Math.random() * 1e6) | 0;
    const setback = style === 'house' ? 3.2 : 0;
    if (style === 'house') { // block wall in front, house behind
      const gA = s + w * (.25 + Math.random() * .4), gB = gA + 1.3; // [H5] 門：ブロック塀に入口のすき間・門柱・郵便受け・家への通路
      for (let a = s; a < s + w - .01; a += 3) { const b = Math.min(a + 3, s + w); for (const [x0, x1] of [[a, Math.min(b, gA)], [Math.max(a, gB), b]]) if (x1 - x0 > .05) addWallQuad(seg, sd, x0, x1, 0, 1.35, C('#B9B2A5'), { pat: 'blocks' }); }
      { const L = o => sd * (HW + o), bx = []; for (const x of [gA, gB]) bx.push({ l0: Math.min(L(-.05), L(.3)), l1: Math.max(L(-.05), L(.3)), s0: x - .16, s1: x + .16, y0: 0, y1: 1.6, c: '#9A948A' });
        bx.push({ l0: Math.min(L(-.08), L(.1)), l1: Math.max(L(-.08), L(.1)), s0: gA - .15, s1: gA + .15, y0: 1.0, y1: 1.3, c: '#C8463C' });
        bx.push({ l0: Math.min(L(.0), L(.06)), l1: Math.max(L(.0), L(.06)), s0: gA + .16, s1: gA + .62, y0: .05, y1: 1.1, c: '#3B3F46' }); // [H7] 門の扉（半分あいた鉄の門）
        for (let x = s; x < s + w - .05; x += 3) { const x1 = Math.min(x + 3, s + w); for (const [p0, p1] of [[x, Math.min(x1, gA - .16)], [Math.max(x, gB + .16), x1]]) if (p1 - p0 > .05) bx.push({ l0: Math.min(L(-.06), L(.16)), l1: Math.max(L(-.06), L(.16)), s0: p0, s1: p1, y0: 1.35, y1: 1.42, c: '#A39D92' }); } // [H8] ブロック塀の上の笠木
        seg.props.push(mkProp(seg, bx)); seg.floor.push({ v: quad(seg, [[gA, L(0), .004], [gB, L(0), .004], [gB, L(3.2), .004], [gA, L(3.2), .004]]), c: C('#A8A298'), pat: null, ti: 0 }); }
      if (seed % 4 === 1) { const L = o => sd * (HW + o); seg.props.push(mkProp(seg, [{ l0: Math.min(L(.05), L(.75)), l1: Math.max(L(.05), L(.75)), s0: s + .1, s1: gA - .2, y0: 1.0, y1: 1.85, c: '#4C8A48' }, { l0: Math.min(L(.05), L(.75)), l1: Math.max(L(.05), L(.75)), s0: gB + .2, s1: s + w - .1, y0: 1.0, y1: 1.85, c: '#4C8A48' }])); } // [H10] 塀の上の生け垣
      houseBehind(seg, sd, s + .5, s + w - .5, h, c, seed); // [H4] 家と家のあいだは 1m ほどあける（すき間から家の横と奥が見える）
    } else {
      if (ALLEY && s > s0 + 6 && w > 5.5 && end - s - w > 6 && Math.random() < .22) { const g = rand(.9, 1.5); alley(seg, sd, s, s + g, prevH, h); s += g; w -= g; prevH = 0; prevOff = 9; }
      const fv = seed % 8, fw = Math.round(w * 2) / 2, fh = Math.round(h * 2) / 2, fm = fac.mood || '', tiers = massTiers(style, h, w, seed);
      tiers.forEach(([y0, y1, off], ti) => { for (let a = s, k = 0; a < s + w - .01; a += 3, k++) { const b = Math.min(a + 3, s + w);
        addWallQuadO(seg, sd, a, b, y0, y1, off, c, { pat: 'fac', st: style, h, w: b - a, seed: seed + k, k, first: k === 0, fv, fw, fh, fm, fu0: (a - s) / w, fu1: (b - s) / w, fy0: y0 / h, fy1: y1 / h }); } });
      massDetail(seg, sd, s, s + w, h, tiers, c, style, seed, prevH, prevOff);
      if (h <= 17 && style !== 'nakamise' && style !== 'market' && style !== 'machiya' && w >= 5 && Math.random() < .7) // what stands on the roof
        seg.spr.push({ lat: sd * (HW + 1.6 + tiers[tiers.length - 1][2]), s: s + w / 2, y: h + .35, w: Math.min(w - .5, 7.5), h: Math.min(w - .5, 7.5) * .66, img: artKey('roof', String(seed % 9)), far: 1, keep: 1 }); // [G7] 屋上の物は、パラペット（手すり壁）の上に
      decorateBuilding(seg, sd, s, s + w, h, style, seed);
      prevOff = tiers[0][2];
    }
    prevH = h + setback * 0; s += w;
  }
}
function addWallQuadO(seg, side, a, b, y0, y1, off, c, extra) { // addWallQuad の、道から off m 奥の壁
  const lat = side * (HW + off), n = [-side * seg.r[0], -side * seg.r[1]];
  const pts = side < 0 ? [[a, lat, y0], [b, lat, y0], [b, lat, y1], [a, lat, y1]] : [[b, lat, y0], [a, lat, y0], [a, lat, y1], [b, lat, y1]];
  const w = Object.assign({ v: quad(seg, pts), c, n, sh: side < 0 ? .94 : .86 }, extra || {}); seg.walls.push(w); return w;
}
/* 建物の段（2026-11-17 オーナー：「ビルやお店の景色が、壁紙に雑な絵が描かれただけ。一つ一つ作り込んで現実に近い建造物に」）。
   [y0, y1, 道からの奥行き]。番号は docs/CITY-200-2026-11-17.md
   [G1] 1 階の店は、柱の線より奥に入っている（ショーウィンドウ・入口の前に、ひさしの下の空間）
   [G2] 高いオフィスビルは、低い基壇（4 階ほど）の上に、少し奥へ下がった塔が立つ */
function massTiers(style, h, w, seed) {
  const r = rnd(seed + 11), gf = 3.2;
  const rec = style === 'luxury' ? 1.3 : style === 'glass' ? 1.5 : style === 'neon' ? .55 : style === 'mixed' ? (r() < .7 ? .8 : 0) : style === 'books' ? .5 : 0;
  const t = []; if (rec > 0 && h > gf + 2) t.push([0, gf, rec]); else t.push([0, Math.min(h, gf), 0]);
  if ((style === 'glass' || style === 'luxury') && h > 24 && w > 7) { const pod = 12.8; t.push([gf, pod, 0], [pod, h, style === 'glass' ? 2.6 : 1.6]); }
  else if (h > gf) t.push([gf, h, 0]);
  if (t[0][1] >= h) t.length = 1;
  /* [G85] 道路斜線（道の上の空を広く残すきまり）で、ふつうのビルの上の階は道から下がる [G86] 高いビルは 2 段に下がる */
  if ((style === 'mixed' || style === 'neon' || style === 'books') && h > 12 && r() < .45) { const last = t[t.length - 1]; if (last[1] - last[0] > 7) { const y1 = last[1]; last[1] = y1 - 3.2; t.push([y1 - 3.2, y1, last[2] + 1.6]); if (h > 18 && r() < .5) { const l2 = t[t.length - 2]; if (l2[1] - l2[0] > 7) { const y2 = l2[1]; l2[1] = y2 - 3.2; t.splice(t.length - 1, 0, [y2 - 3.2, y2, l2[2] + .9]); t[t.length - 1][2] = Math.max(t[t.length - 1][2], l2[2] + 1.8); } } } }
  return t;
}
function massDetail(seg, sd, a, b, h, tiers, c, style, seed, prevH, prevOff) {
  const r = rnd(seed + 5), hx = k => '#' + c.map(x => clamp(Math.round(x * k), 0, 255).toString(16).padStart(2, '0')).join(''), dark = hx(.72), sideC = hx(.9), sideA = C(sideC), nF = [-seg.f[0], -seg.f[1]], L = o => sd * (HW + o), boxes = [], big = [];
  const B2 = (o0, o1, s0, s1, y0, y1, col) => { const l0 = L(o0), l1 = L(o1); return { l0: Math.min(l0, l1), l1: Math.max(l0, l1), s0, s1, y0, y1, c: col }; };
  const front = (o0, o1, y0, y1, col, x) => seg.walls.push(Object.assign({ v: quad(seg, sd < 0 ? [[a, L(o1), y0], [a, L(o0), y0], [a, L(o0), y1], [a, L(o1), y1]] : [[a, L(o0), y0], [a, L(o1), y0], [a, L(o1), y1], [a, L(o0), y1]]), c: col, n: nF, sh: .78 }, x || {}));
  tiers.forEach(([y0, y1, off], i) => {
    // [G3] 奥に入った段の、手前の面（となりとの境の壁）。前の建物がもっと奥まっていれば、そのぶんも
    const deep = Math.max(off, y0 < 3.3 ? Math.min(prevOff, 3) : 0); if (deep > .01) front(0, deep, y0, y1, sideA, { pat: y0 < 3.3 ? 'reveal' : null });
    // [G4] 1 階の奥まりの天井（のき天井）と、ダウンライト
    if (off > .01 && y0 === 0 && tiers[1] && tiers[1][2] < off) { const yy = y1, o0 = tiers[1][2]; seg.walls.push({ v: quad(seg, sd < 0 ? [[a, L(o0), yy], [b, L(o0), yy], [b, L(off), yy], [a, L(off), yy]] : [[b, L(o0), yy], [a, L(o0), yy], [a, L(off), yy], [b, L(off), yy]]), c: C('#8A8580'), n3: [0, -1, 0], sh: .8, pat: 'soffit', w: b - a, ti: 0 });
      seg.floor.push({ v: quad(seg, [[a, L(0), .003], [b, L(0), .003], [b, L(off), .003], [a, L(off), .003]]), c: C(shadeHex(seg.th.side ? seg.th.side[0] : '#BDB8AE', .82).replace(/rgb\((\d+),(\d+),(\d+)\)/, (m, x, y, z) => '#' + [x, y, z].map(q => (+q).toString(16).padStart(2, '0')).join(''))), pat: null, ti: 0 }); seg.floor.push({ v: quad(seg, [[a, L(0), .004], [b, L(0), .004], [b, L(off), .004], [a, L(off), .004]]), c: [0, 0, 0], dec: 'recessF', ti: 0, a, b }); // [G14] 奥まった 1 階の前の床（のきの下のかげ）
      // [G5] 1 階の柱：建物のはしと、広い建物はまん中にも
      const cols = [a + .22, b - .22]; if (b - a > 8) cols.push((a + b) / 2); for (const x of cols) boxes.push(B2(0, Math.min(.38, off), x - .17, x + .17, 0, y1, sideC)); }
    // [G8] 上の段が奥へ下がる所：下の段の屋上のふちに手すり壁
    if (tiers[i + 1] && tiers[i + 1][2] > off + .01) big.push(B2(off - .05, off + .3, a, b, y1, y1 + .9, dark));
    if (tiers[i + 1] && tiers[i + 1][2] > off + .6 && y1 > 6) { if (r() < .5) for (let x = a + .5; x < b - .5; x += 1.5) seg.spr.push({ lat: L(off + .6), s: x, y: y1, h: 1.0, w: 1.0, img: 'canopy_green', far: 1 }); else for (let x = a + .6; x < b - 1; x += 2.2) big.push(B2(off + .35, off + .95, x, x + .8, y1, y1 + .6, '#D9DCDF')); } // [G87] 下がった階の前のテラスに植木 [G88] または室外機
    // [G9] 高い所の、横から見える面（前の建物より高い部分）
    const lo = Math.max(y0, prevH), D = y1 > 20 ? 14 : 8; /* [G58] 高い建物ほど奥行きが深い（横の壁が長く見える） */ if (lo < y1 - .3 && prevH > 0) { seg.walls.push({ v: quad(seg, sd < 0 ? [[a, L(off + D), lo], [a, L(off), lo], [a, L(off), y1], [a, L(off + D), y1]] : [[a, L(off), lo], [a, L(off + D), lo], [a, L(off + D), y1], [a, L(off), y1]]), c, n: nF, sh: .72, pat: 'fac', st: style, h: y1, w: D, seed, side: 1 }); }
  });
  const top = tiers[tiers.length - 1], ty = top[1], to = top[2];
  // [G10] 屋上のふち：コーニス（少し張り出した帯）とパラペット。ガラスのビルは細い金属のふち
  if (style === 'glass') big.push(B2(to - .12, to + .25, a, b, ty - .02, ty + .5, '#B9C2CA'));
  else if (style !== 'nakamise' && style !== 'market' && style !== 'machiya' && style !== 'station') { big.push(B2(to - .35, to + .3, a + .02, b - .02, ty - .05, ty + .22, dark)); big.push(B2(to - .12, to + .3, a + .05, b - .05, ty + .22, ty + .95, sideC)); }
  // [G11] ふつうのビルの、階ごとの床のでっぱり（バルコニーのふち・ひさし）
  if (style === 'mixed' && r() < .45) { const fl = 3.2, rc = pick(['#B7C2CB', '#D9D6CE', '#9AA0A6']); for (let k = 2; k * fl < ty - 1 && k < 10; k++) boxes.push(B2(-.5, .02, a + .3, b - .3, k * fl - .2, k * fl, dark), B2(-.5, -.44, a + .3, b - .3, k * fl, k * fl + .95, rc)); } // ベランダの床と、前の手すり壁
  // [G12] 店のテント（日よけ）：のき先へ張り出し、前に垂れ（たれ）
  if ((style === 'mixed' || style === 'books' || style === 'market') && r() < .5) { const col = pick(['#C8463C', '#2F6E4E', '#355F86', '#E9D9B0', '#8A5530', '#3B3F46']), o = tiers[0][2]; boxes.push(B2(o - 1.15, o, a + .4, b - .4, 2.62, 2.72, col), B2(o - 1.18, o - 1.12, a + .4, b - .4, 2.32, 2.72, col)); }
  // [G13] オフィス・高級店の入口：張り出したひさしと細い柱
  if ((style === 'glass' || style === 'luxury') && b - a > 6 && r() < .4) { const m = (a + b) / 2, o = tiers[0][2]; boxes.push(B2(-1.0, o, m - 1.8, m + 1.8, 3.3, 3.42, '#9AA3AB'), B2(-1.02, -.96, m - 1.8, m + 1.8, 3.18, 3.42, '#7E878F')); } // 片持ちのひさし（柱なし）
  // [G18] ガラスのビル：たての細い金属のフィン（カーテンウォールのたて枠が外に出ている）
  if (style === 'glass') tiers.forEach(([y0, y1, off]) => { if (y0 < 3) return; for (let x = a + 1.5; x < b - .5; x += 1.5) boxes.push(B2(off - .24, off, x - .035, x + .035, y0, y1, '#AEB8C1')); });
  // [G19] 高級店のビル：石の付け柱と、階の横帯
  if (style === 'luxury') tiers.forEach(([y0, y1, off]) => { if (y0 < 3) return; for (let x = a + .3; x < b; x += Math.max(2.4, (b - a) / 4)) boxes.push(B2(off - .2, off, x - .18, x + .18, y0, y1, sideC)); boxes.push(B2(off - .28, off, a, b, y0, y0 + .35, dark)); });
  // [G20] 町家：1 階と 2 階の上の、瓦の庇
  if (style === 'machiya') { boxes.push(B2(-.95, 0, a, b, 2.72, 2.86, '#4A4A4E'), B2(-.98, -.9, a, b, 2.6, 2.86, '#3B3B3F')); if (h > 5) boxes.push(B2(-.6, 0, a, b, h - .25, h - .1, '#4A4A4E')); }
  // [G21] 繁華街の低いビルの屋上の、大きな広告板（文字は架空の店・サービス）
  if ((style === 'neon' || style === 'mixed') && ty < 18 && b - a > 6 && r() < (style === 'neon' ? .45 : .15)) { const o = to + 1.2; big.push(Object.assign(B2(o, o + .25, a + .6, b - .6, ty + 1.1, ty + 1.1 + Math.min(3.4, (b - a) * .4), '#2B2B2B'), { face: 'bb' + ((seed >> 3) % 12), faceW: 360, faceH: 140 })); for (const x of [a + 1, b - 1]) big.push(B2(o + .3, o + .45, x - .06, x + .06, ty + .9, ty + 1.2, '#6E767E')); for (const x of [a + 1.5, (a + b) / 2, b - 1.5]) big.push(B2(o - .5, o, x - .05, x + .05, ty + 1.1 + Math.min(3.4, (b - a) * .4), ty + 1.2 + Math.min(3.4, (b - a) * .4), '#3B3F46'), Object.assign(B2(o - .55, o - .4, x - .12, x + .12, ty + .95 + Math.min(3.4, (b - a) * .4), ty + 1.12 + Math.min(3.4, (b - a) * .4), '#FFF2CC'), { glow: 1 })); } // [N16] 広告板を照らすライト
  { const o = tiers[0][2], m = a + (b - a) * (.3 + r() * .4);
    if (style === 'books') for (const x of [a + .6, b - 1.9]) if (x > a && x + 1.3 < b) { boxes.push(B2(-.75, -.1, x, x + 1.3, .55, .92, '#7A5538')); for (let k = 0; k < 6; k++) boxes.push(B2(-.7, -.15, x + .05 + k * .2, x + .2 + k * .2, .92, 1.0 + r() * .12, ['#C8463C', '#355F86', '#E9E2D5', '#5F9E5A', '#8A5530', '#F2C230'][k])); for (const xx of [x + .05, x + 1.2]) boxes.push(B2(-.72, -.64, xx, xx + .05, 0, .55, '#3B2A20')); } // [G27] 古書店の前の本の台車
    if (style === 'market') { boxes.push(B2(-1.0, -.05, a + .3, b - .3, .62, .78, '#8A6A4A')); for (let x = a + .4; x < b - .7; x += .55) boxes.push(B2(-.95, -.15, x, x + .45, .78, .98, ['#C8463C', '#F2C230', '#5F9E5A', '#F08A2E', '#E9E2D5'][(r() * 5) | 0])); } // [G28] 市場の店先の台と、品物の木箱
    if ((style === 'mixed' || style === 'luxury' || style === 'glass') && r() < .45) for (const x of [m - 1.1, m + .7]) { boxes.push(B2(-.55, -.12, x, x + .42, 0, .5, style === 'luxury' ? '#3B3632' : '#9A8E80'), B2(-.52, -.15, x + .03, x + .39, .5, .56, '#3B2A20')); seg.spr.push({ lat: L(-.33), s: x + .21, y: .5, h: 1.15, w: .85, img: 'canopy_green', gnd: .3 }); } // [G29] 入口の両わきの鉢植え
    if ((style === 'mixed' || style === 'books') && r() < .4) boxes.push(Object.assign(B2(-1.15, -.6, m + 1.2, m + 1.26, 0, .95, '#2B2B2B'), { face: 'ab' + ((seed >> 4) % 6), faceW: 80, faceH: 140, faceFront: 1 })); // [G30] 店の前の立て看板（黒板のメニュー）
    if ((style === 'mixed' || style === 'market') && r() < .45) boxes.push(B2(o - .32, o, a + .2, b - .2, 3.0, 3.22, '#8A8F94')); // [G31] 1 階の上の、シャッターの箱
    if (style === 'mixed' || style === 'books') for (let x = a + 1.2; x < b - .8; x += 1.8) boxes.push(B2(-.32, 0, x - .03, x + .03, 3.32, 3.36, '#3B3F46'), B2(-.36, -.24, x - .07, x + .07, 3.22, 3.34, '#3B3F46')); // [G32] 看板を照らす、首の長いライト
    if (style === 'machiya') { const nx = m - .6; boxes.push(B2(-.06, 0, nx, nx + 1.2, 1.45, 2.3, pick(['#2F3F5F', '#6B2B2B', '#3B4A3B']))); } // [G33] 町家ののれん
    if (style === 'neon' && seg.th.fac.mood === 'shinbashi') for (let x = a + .8; x < b - .5; x += 1.6) seg.spr.push({ lat: L(-.55), s: x, y: 2.15, w: .42, h: .62, img: 'lantern', nv: 1 }); } // [G34] 飲み屋の赤ちょうちん
  // [G41] 屋上の給水タンク（脚つき）・[G42] アンテナ・[G43] エレベーターの機械室（屋上に小さな箱）
  if ((style === 'mixed' || style === 'neon' || style === 'books') && ty < 30 && b - a > 5) { const x = a + 1 + r() * (b - a - 3.5), oo = to + 1.5 + r() * 2;
    if (r() < .45) { big.push(B2(oo, oo + 1.6, x, x + 1.6, ty + .95, ty + 1.15, '#7E868E')); for (const [p0, p1] of [[x, x + .1], [x + 1.5, x + 1.6]]) big.push(B2(oo + .1, oo + .2, p0, p1, ty, ty + .95, '#6E767E'), B2(oo + 1.4, oo + 1.5, p0, p1, ty, ty + .95, '#6E767E')); big.push(B2(oo + .1, oo + 1.5, x + .1, x + 1.5, ty + 1.15, ty + 2.4, '#C9CED3'), B2(oo + .2, oo + 1.4, x + .2, x + 1.4, ty + 2.4, ty + 2.55, '#AEB4BA')); }
    else if (r() < .6) big.push(B2(oo, oo + 2.4, x, x + 2.2, ty, ty + 2.6, sideC), B2(oo - .05, oo + 2.45, x - .05, x + 2.25, ty + 2.6, ty + 2.75, dark));
    if (r() < .5) { const ax = a + .8 + r() * (b - a - 1.6); big.push(B2(to + .8, to + .86, ax - .03, ax + .03, ty, ty + 3.2, '#8A8F94'), B2(to + .8, to + .86, ax - .5, ax + .5, ty + 2.6, ty + 2.64, '#8A8F94'), B2(to + .8, to + .86, ax - .35, ax + .35, ty + 2.9, ty + 2.94, '#8A8F94')); } }
  // [G45] 高いガラスのビルのてっぺん：機械をかくす、少し奥まった箱
  if (style === 'glass' && ty > 20) big.push(B2(to + 1.2, to + 5, a + 1, b - 1, ty, ty + 2.8, '#9AA3AB'));
  // [G46] 高級店のショーウィンドウの上の黒い日よけ
  if (style === 'luxury' && r() < .5) boxes.push(B2(tiers[0][2] - .7, tiers[0][2], a + .4, b - .4, 2.85, 2.95, '#2B2B2B'));
  // [G47] 繁華街のビルは、突き出し看板をもう 1 つ（高さをずらす）
  if (style === 'neon' && r() < .55) { const x = a + .8 + r() * (b - a - 1.6), y0 = 6 + r() * 4, hh = Math.min(ty - y0 - .5, 3 + r() * 3); if (hh > 1.5) seg.props.push(mkProp(seg, [{ l0: Math.min(L(-.9), L(-.05)), l1: Math.max(L(-.9), L(-.05)), s0: x, s1: x + .14, y0, y1: y0 + hh, c: pick(['#C8463C', '#F2C230', '#FBF6EE', '#355F86', '#E86A75', '#2B2B2B']), txt: pick(SIGNS_V), vert: 1, glow: 1 }, { l0: Math.min(L(-1.0), L(0)), l1: Math.max(L(-1.0), L(0)), s0: x + .03, s1: x + .11, y0: y0 + hh, y1: y0 + hh + .08, c: '#3B3F46' }, { l0: Math.min(L(-1.0), L(0)), l1: Math.max(L(-1.0), L(0)), s0: x + .03, s1: x + .11, y0: y0 - .08, y1: y0, c: '#3B3F46' }], { minS: x, big: 1 })); } // [S16] 看板を壁につなぐ上下の金具
  // [G48] ふつうのビルの窓の下の室外機（壁から少し出た箱）
  if (style === 'mixed' && r() < .5) for (let k = 1; (k + 1) * 3.2 < ty; k++) if (r() < .4) { const x = a + .5 + r() * (b - a - 1.4); boxes.push(B2(-.32, 0, x, x + .8, k * 3.2 + .15, k * 3.2 + .7, '#E3E5E7')); }
  // [S8] 建物の角の、たてどい（雨水の管）
  if ((style === 'mixed' || style === 'neon' || style === 'books') && r() < .6) { const x = r() < .5 ? a + .12 : b - .2; boxes.push(B2(-.12, 0, x, x + .08, 0, ty, '#8A8F94')); }
  // [S9] 入口の段（タイルの 1 段）
  if ((style === 'glass' || style === 'luxury' || style === 'mixed') && b - a > 5) { const m2 = (a + b) / 2, o = tiers[0][2]; boxes.push(B2(o - .45, o, m2 - .9, m2 + .9, 0, .14, '#B9B2A5')); }
  // [S4] 市場の横に、つみ上げた段ボール
  if (style === 'market' && r() < .5) { const x = b - .9; for (let k = 0; k < 3; k++) boxes.push(B2(-.9, -.3, x, x + .6, k * .38, k * .38 + .36, k % 2 ? '#B08155' : '#C49A6C')); }
  // [S6] 町家の前の鉢植えの列
  if (style === 'machiya' && r() < .6) for (let x = a + .4; x < b - .4; x += .7) boxes.push(B2(-.4, -.1, x, x + .28, 0, .3, '#8A5530'), B2(-.42, -.08, x - .02, x + .3, .3, .55, '#4F8A4A'));
  if (style === 'glass' && ty > 30) for (const x of [a + .3, b - .3]) big.push(Object.assign(B2(to - .1, to + .1, x - .1, x + .1, ty + .5, ty + .7, '#E0473A'), { glow: 1 })); // [N6] 高いビルの屋上の、赤い航空障害灯
  if (style === 'glass' && ty > 20) { big.push(B2(to + .4, to + .55, a + .5, b - .5, ty + .5, ty + .62, '#8A8F94')); boxes.push(B2(to - .32, to, a, a + .14, 3.2, ty, '#9AA3AB'), B2(to - .32, to, b - .14, b, 3.2, ty, '#9AA3AB')); } // [G61] 窓ふきのゴンドラのレール [G62] 角のたて枠は太く
  if ((style === 'neon') && r() < .5) { const x = a + .5 + r() * (b - a - 1.2); boxes.push(Object.assign(B2(-1.0, -.85, x, x + .45, 0, 1.0, '#FBF6EE'), { glow: 1, face: 'ls' + ((seed >> 2) % 10), faceW: 60, faceH: 130 })); } // [S13] 店先の、明かりの入った置き看板
  if ((style === 'market' || style === 'books') && r() < .5) for (const x of [a + .3, b - .3]) boxes.push(B2(-.62, -.58, x - .02, x + .02, 0, 2.4, '#8A8F94'), B2(-.62, -.56, x, x + .35, 1.2, 2.3, pick(['#C8463C', '#F2C230', '#2F6E4E', '#355F86']))); // [S14] 店先ののぼり旗
  if ((style === 'glass' || style === 'luxury' || style === 'mixed') && b - a > 5) { const m3 = (a + b) / 2; seg.floor.push({ v: quad(seg, [[m3 - .7, L(-1.1), .007], [m3 + .7, L(-1.1), .007], [m3 + .7, L(-.45), .007], [m3 - .7, L(-.45), .007]]), c: [0, 0, 0], dec: 'mat', ti: 0, a: m3 - .7, b: m3 + .7 }); } // [S2] 入口の前のマット
  // [G63] 繁華街：2 階の下の横長の看板（建物の幅いっぱい）
  if (style === 'neon' && r() < .5 && b - a > 4) boxes.push(Object.assign(B2(-.18, 0, a + .2, b - .2, 3.3, 4.05, '#FBF6EE'), { face: 'bb' + ((seed >> 5) % 12), faceW: 360, faceH: 80, glow: 1 }));
  // [G64] ふつうのビルの入口の小さなひさし [G65] 入口の横の明かり
  if (style === 'mixed' && tiers[0][2] < .1 && r() < .6) { const x = a + .8 + r() * (b - a - 2.4); boxes.push(B2(-.75, 0, x, x + 1.3, 2.4, 2.5, '#9AA3AB')); boxes.push(Object.assign(B2(-.12, 0, x + 1.38, x + 1.5, 1.9, 2.15, '#FFF2CC'), { glow: 1 })); }
  // [G66] オフィスの入口の前の、車止めの低い柱
  if (style === 'glass' && b - a > 6) for (let x = a + 1; x < b - 1; x += 1.4) boxes.push(B2(-1.4, -1.25, x, x + .15, 0, .7, '#8A8F94'));
  // [G67] 高級店：ショーウィンドウの前の、石の台座
  if (style === 'luxury') boxes.push(B2(tiers[0][2] - .25, tiers[0][2], a + .4, b - .4, 0, .45, '#D9D2C4'));
  // [G69] 町家の入口のちょうちん
  if (style === 'machiya' && r() < .5) seg.spr.push({ lat: L(-.35), s: a + (b - a) * .3, y: 1.8, w: .38, h: .55, img: 'lantern', nv: 1 });
  // [G72] となりのビルとの境の、細いすき間（黒い目地）
  if (['mixed', 'neon', 'books'].includes(style)) boxes.push(B2(-.02, .02, a - .04, a + .04, 3.2, ty, '#2B2826'));
  // [G73] 屋上の手すりのフェンス [G74] 屋上の室外機のかたまり
  if ((style === 'mixed' || style === 'neon') && ty < 30) { big.push(B2(to - .02, to + .02, a + .1, b - .1, ty + .95, ty + 1.9, '#8A8F94')); for (let x = a + .3; x < b - .2; x += 1.2) big.push(B2(to - .03, to + .03, x, x + .05, ty + .95, ty + 1.9, '#8A8F94'));
    if (r() < .5) for (let k = 0; k < 3; k++) big.push(B2(to + 3 + k * .1, to + 3.6 + k * .1, a + 1 + k * .9, a + 1.8 + k * .9, ty, ty + .7, '#D9DCDF')); }
  // [G75] 高級店のビルの屋上の緑 [G76] ガラスのビルの屋上の冷却塔
  if (style === 'luxury' && ty < 30) for (let x = a + .6; x < b - .6; x += 1.6) seg.spr.push({ lat: L(to + .9), s: x, y: ty + .2, h: 1.6, w: 1.4, img: 'canopy_green', far: 1 });
  if (style === 'glass' && ty > 20 && b - a > 8) big.push(B2(to + 2, to + 4.5, a + 2, a + 4.5, ty + 2.8, ty + 4.2, '#B9C0C7'), B2(to + 2.2, to + 4.3, a + 2.2, a + 4.3, ty + 4.2, ty + 4.35, '#6E767E'));
  // [N8] 夜：突き出し看板のまわりに光のにじみ
  if ((style === 'neon') && r() < .7) seg.spr.push({ lat: L(-.5), s: a + (b - a) * (.2 + r() * .6), y: 4, w: 2.4, h: 4, img: 'glow', night: 1 });
  if (style === 'mixed' && r() < .22 && b - a > 4) { const pb = PROPS.bikes(sd, a + 1); if (pb && pb.bx) seg.props.push(mkProp(seg, pb.bx)); } // [S15] 店の前にとめた自転車
  if (style === 'glass' && b - a > 7 && r() < .5) boxes.push(B2(-1.9, -1.3, a + 1.2, a + 3.6, 0, .55, '#9A958C'), B2(-1.85, -1.35, a + 1.25, a + 3.55, .55, .75, '#4C8A48')); // [S17] オフィスの前の、長い植えこみ
  if (style === 'mixed' && r() < .35) boxes.push(B2(-.25, 0, a + .3, a + .75, .9, 1.35, '#C9CED3')); // [S18] 入口の横の集合ポスト
  // [G25] 夜：店の明かりが歩道にこぼれる（1 階に店のある建物）
  if (['mixed', 'neon', 'luxury', 'books', 'market', 'glass', 'nakamise', 'machiya'].includes(style)) seg.floor.push({ v: quad(seg, [[a + .3, L(-1.7), .006], [b - .3, L(-1.7), .006], [b - .3, L(0), .006], [a + .3, L(0), .006]]), c: [0, 0, 0], dec: 'spill', sd, ti: seed % 7, a: a + .3, b: b - .3 });
  if (boxes.length) seg.props.push(mkProp(seg, boxes, { big: 1 })); if (big.length) seg.props.push(mkProp(seg, big, { big: 1 })); // [R12] 建物の立体の部品は、遠くでも消さない（85m で急に消えていた）
}
/* [G6] 路地：両がわの建物の横の壁・奥の暗がり・室外機・配管・ごみ箱 */
function alley(seg, sd, a, b, prevH, h) {
  const nF = [-seg.f[0], -seg.f[1]], L = o => sd * (HW + o), D = 9, side = C('#9A958C');
  seg.walls.push({ v: quad(seg, sd < 0 ? [[b, L(D), 0], [b, L(0), 0], [b, L(0), h], [b, L(D), h]] : [[b, L(0), 0], [b, L(D), 0], [b, L(D), h], [b, L(0), h]]), c: side, n: nF, sh: .7, pat: 'alleyW', w: D, h, seed: (Math.random() * 1e5) | 0 });
  addWallQuadO(seg, sd, a, b, 0, Math.max(h, prevH, 6), D, C('#4A4743'), { pat: 'alleyB' }); // [G59] 路地の奥：裏口と小さな明かり
  seg.floor.push({ v: quad(seg, [[a, L(0), .005], [b, L(0), .005], [b, L(D), .005], [a, L(D), .005]]), c: C('#6E6A64'), dec: 'alleyF', ti: 0, a, b });
  const bx = []; const B3 = (o0, o1, s0, s1, y0, y1, col) => { const l0 = L(o0), l1 = L(o1); return { l0: Math.min(l0, l1), l1: Math.max(l0, l1), s0, s1, y0, y1, c: col }; };
  for (let y = 2.4; y < Math.min(h, 14); y += 3.2) if (Math.random() < .7) { const o = 1 + Math.random() * 5; bx.push(B3(o, o + .8, b - .3, b - .02, y, y + .6, '#D9D6CE')); } // 室外機
  bx.push(B3(.3, .42, b - .14, b - .02, 0, Math.min(h, 12), '#8A8F94')); // たての配管
  if (h > 7 && Math.random() < .5) for (let y = 3.2; y < Math.min(h, 13); y += 3.2) { bx.push(B3(2, 3.2, b - .9, b - .02, y - .12, y, '#7E868E'), B3(2, 3.2, b - .92, b - .86, y, y + 1.0, '#9AA0A6')); } // [G36] 路地側の鉄の外階段の踊り場と手すり
  for (let k = 0; k < 2; k++) { const y = Math.min(h, 7) - .5 - k * .4; seg.lines.push({ a: [a, L(.6 + k * 1.3), y], b: [b, L(.6 + k * 1.3), y - .25], c: '#2B2B2B', w: .025 }); } // [G37] 建物のあいだにわたした電線
  if (Math.random() < .5) bx.push(B3(.2, .35, b - .5, b - .02, 1.2, 1.7, '#B9B2A5'), B3(.2, .35, b - .9, b - .6, 1.0, 1.4, '#C9C3B5')); // [S1] 電気とガスのメーター
  if (b - a > 1.1 && Math.random() < .3) bx.push(Object.assign(B3(-.05, .05, a, b, 3.4, 3.9, '#2B2B2B'), { face: 'bb' + ((Math.random() * 12) | 0), faceW: 160, faceH: 60, faceFront: 1 })); // [G89] 路地の入口の上の看板
  if (Math.random() < .6) bx.push(B3(.6, 1.2, a + .1, a + .7, 0, .8, '#3F6E4E')); // ごみ箱
  seg.props.push(mkProp(seg, bx));
}
function houseBehind(seg, sd, a, b, h, c, seed) {
  const lat = sd * (HW + 3.2), n = [-sd * seg.r[0], -sd * seg.r[1]];
  for (let x = a; x < b - .01; x += 3) { const y = Math.min(x + 3, b);
    const pts = sd < 0 ? [[x, lat, 0], [y, lat, 0], [y, lat, h], [x, lat, h]] : [[y, lat, 0], [x, lat, 0], [x, lat, h], [y, lat, h]];
    seg.walls.push({ v: quad(seg, pts), c, n, sh: sd < 0 ? .94 : .86, pat: 'fac', st: 'house', h, w: y - x, seed: seed + x | 0, fv: seed % 8, fw: Math.round((b - a) * 2) / 2, fh: Math.round(h * 2) / 2, fm: '', fu0: (x - a) / (b - a), fu1: (y - a) / (b - a) }); } // 2026-11-17：家の壁も 1 軒ぶんの絵（玄関・窓・ベランダ）
  // tiled roof sloping away from the street
  const l2 = sd * (HW + 6.5), rc = C(pick(['#4A5866', '#5C5550', '#3F4D5C', '#6B4C3B'])), le = sd * (HW + 2.65), ye = h - .3; // [H2] 軒が壁より 0.55m 張り出す
  seg.walls.push({ v: quad(seg, sd < 0 ? [[a - .3, l2, h + 2.2], [b + .3, l2, h + 2.2], [b + .3, le, ye], [a - .3, le, ye]] : [[b + .3, l2, h + 2.2], [a - .3, l2, h + 2.2], [a - .3, le, ye], [b + .3, le, ye]]), c: rc, n3: [-sd * seg.r[0] * .6, .8, -sd * seg.r[1] * .6], sh: 1, pat: 'roof', seed });
  seg.walls.push({ v: quad(seg, sd < 0 ? [[a - .3, le, ye - .14], [b + .3, le, ye - .14], [b + .3, le, ye], [a - .3, le, ye]] : [[b + .3, le, ye - .14], [a - .3, le, ye - .14], [a - .3, le, ye], [b + .3, le, ye]]), c: C('#E9E6DF'), n, sh: .9 }); // [H3] 軒先の白い鼻隠し板
  { const nF = [-seg.f[0], -seg.f[1]], L0 = sd * (HW + 3.2), L1 = sd * (HW + 9.8); // [H1] 家の横の壁と、三角の妻（となりの家とのすき間から見える）
    seg.walls.push({ v: quad(seg, sd < 0 ? [[a, L1, 0], [a, L0, 0], [a, L0, h], [a, L1, h]] : [[a, L0, 0], [a, L1, 0], [a, L1, h], [a, L0, h]]), c: C(shadeHexA(c, .86)), n: nF, sh: .8, pat: 'fac', st: 'house', h, w: 6.6, seed, side: 1 });
    const lm = sd * (HW + 6.5); seg.walls.push({ v: quad(seg, sd < 0 ? [[a, L1, h], [a, L0, h], [a, lm, h + 2.2], [a, lm, h + 2.2]] : [[a, L0, h], [a, L1, h], [a, lm, h + 2.2], [a, lm, h + 2.2]]), c: C(shadeHexA(c, .8)), n: nF, sh: .8 }); }
  { const L = o => sd * (HW + o), m = a + (b - a) * (.3 + (seed % 5) * .1); seg.props.push(mkProp(seg, [{ l0: Math.min(L(2.2), L(3.2)), l1: Math.max(L(2.2), L(3.2)), s0: m - .8, s1: m + .8, y0: 2.3, y1: 2.42, c: '#8A857C' }])); } // [H6] 玄関の上の小さなひさし
  if (seed % 2 === 0) { const L = o => sd * (HW + o), x = a + (b - a) * .4; seg.props.push(mkProp(seg, [{ l0: Math.min(L(6.4), L(6.48)), l1: Math.max(L(6.4), L(6.48)), s0: x, s1: x + .06, y0: h + 2.1, y1: h + 4.2, c: '#8A8F94' }, { l0: Math.min(L(6.4), L(6.48)), l1: Math.max(L(6.4), L(6.48)), s0: x - .6, s1: x + .66, y0: h + 3.6, y1: h + 3.64, c: '#8A8F94' }, { l0: Math.min(L(6.4), L(6.48)), l1: Math.max(L(6.4), L(6.48)), s0: x - .4, s1: x + .46, y0: h + 3.9, y1: h + 3.94, c: '#8A8F94' }], { big: 1 })); } // [G77] 屋根の上のテレビのアンテナ
  if (seed % 3 === 0) { const L = o => sd * (HW + o); seg.props.push(mkProp(seg, [{ l0: Math.min(L(2.6), L(3.2)), l1: Math.max(L(2.6), L(3.2)), s0: a + .3, s1: b - .3, y0: h * .46, y1: h * .46 + .12, c: '#5C5550' }])); } // [H12] 1 階の窓の上の小さな屋根（下屋）
  if (seed % 3 === 1) seg.spr.push({ lat: sd * (HW + 1.6), s: a + (b - a) * .8, y: 0, h: 4.2, w: 2.8, img: 'canopy_green', trunk: 1, gnd: .4 }); // [G52] 庭の木（塀の上からのぞく）
  if (seed % 4 === 2 && b - a > 6) { const L = o => sd * (HW + o); seg.props.push(mkProp(seg, [{ l0: Math.min(L(.2), L(3.0)), l1: Math.max(L(.2), L(3.0)), s0: b - 3, s1: b - .3, y0: 2.2, y1: 2.3, c: '#C9CED3' }, { l0: Math.min(L(.25), L(.35)), l1: Math.max(L(.25), L(.35)), s0: b - 3, s1: b - 2.9, y0: 0, y1: 2.2, c: '#9AA0A6' }, { l0: Math.min(L(.25), L(.35)), l1: Math.max(L(.25), L(.35)), s0: b - .4, s1: b - .3, y0: 0, y1: 2.2, c: '#9AA0A6' }])); } // [G50] カーポートの屋根と柱
  if (seed % 5 === 3) { const L0 = o => sd * (HW + o); for (const k of [0, 1]) seg.lines.push({ a: [a + 1.2, L0(2.6 + k * .3), h * .52 + 1.6], b: [b - 1.2, L0(2.6 + k * .3), h * .52 + 1.6], c: '#B9C0C7', w: .025 }); } // [G79] ベランダの物干しざお
  if (seed % 5 === 3) { const L = o => sd * (HW + o); seg.props.push(mkProp(seg, [{ l0: Math.min(L(3.2), L(2.3)), l1: Math.max(L(3.2), L(2.3)), s0: a + 1, s1: b - 1, y0: h * .52, y1: h * .52 + .12, c: '#B9B2A5' }, { l0: Math.min(L(2.3), L(2.36)), l1: Math.max(L(2.3), L(2.36)), s0: a + 1, s1: b - 1, y0: h * .52, y1: h * .52 + 1.0, c: '#D9D6CE' }])); } // [G51] 2 階のベランダ（床と手すり壁）
}
function shadeHexA(c, k) { return '#' + c.map(x => clamp(Math.round(x * k), 0, 255).toString(16).padStart(2, '0')).join(''); }
function decorateBuilding(seg, sd, a, b, h, style, seed) {
  const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const lat = sd * (HW - .02), n = [-sd * seg.r[0], -sd * seg.r[1]];
  const wq = (x0, x1, y0, y1, pat, extra) => { const pts = sd < 0 ? [[x0, lat, y0], [x1, lat, y0], [x1, lat, y1], [x0, lat, y1]] : [[x1, lat, y0], [x0, lat, y0], [x0, lat, y1], [x1, lat, y1]]; seg.decos.push(Object.assign({ v: quad(seg, pts), n, pat, seg, seed: (r() * 1e6) | 0, w: x1 - x0 }, extra || {})); };
  const fac = seg.th.fac;
  if (style === 'neon' && h > 12 && r() < (fac.screen || 0)) { const w = Math.min(b - a - 1, rand(5, 9)); const x0 = a + (b - a - w) / 2; wq(x0, x0 + w, h * .45, h * .45 + w * .56, 'bigscreen', { glow: 1 }); }
  // blade signs sticking out from the facade (vertical text)
  if ((style === 'neon' || style === 'mixed') && r() < (fac.vsign || .4)) {
    const x = a + 1 + r() * (b - a - 2), y0 = 3.4 + r() * 2, hh = 3 + r() * 4;
    seg.props.push(mkProp(seg, [{ l0: sd * (HW - .95), l1: sd * (HW - .05), s0: x, s1: x + .14, y0, y1: y0 + hh, c: pick(['#C8463C', '#F2C230', '#FBF6EE', '#355F86', '#E86A75', '#2B2B2B']), txt: pick(SIGNS_V), vert: 1, glow: 1 }], { minS: x, big: 1 })); // [R13] 突き出し看板も遠くで消さない
  }
  if (style === 'nakamise') {
    const ac = pick(['#C0392B', '#FBF6EE', '#B5302A']);
    seg.props.push(mkProp(seg, [{ l0: sd * (HW - .8), l1: sd * HW, s0: a + .1, s1: b - .1, y0: 2.5, y1: 2.75, c: ac }, { l0: sd * (HW - .03), l1: sd * (HW + .4), s0: a, s1: b, y0: 4.3, y1: 4.9, c: '#4A4A4E' }]));
  }
  if (style === 'station' && b - a > 20) { // domes of the red-brick station
    for (const x of [a + 12, b - 12]) if (x > a && x < b) seg.props.push(mkProp(seg, [{ l0: sd * (HW + .5), l1: sd * (HW + 6.5), s0: x - 3, s1: x + 3, y0: 13, y1: 15.5, c: '#B5533C' }, { l0: sd * (HW + 1.2), l1: sd * (HW + 5.8), s0: x - 2.3, s1: x + 2.3, y0: 15.5, y1: 17.5, c: '#5C6670' }, { l0: sd * (HW + 2.3), l1: sd * (HW + 4.7), s0: x - 1.2, s1: x + 1.2, y0: 17.5, y1: 19, c: '#4E5862' }]));
  }
}
const SIGNS_V = ['ラーメン', '居酒屋', '薬', '珈琲', 'カラオケ', '書店', '寿司', '歯科', '不動産', 'ゲーム', '中古', '電気', '天ぷら', '甘味処', '眼鏡', '古書', 'うどん', '定食', '雑貨', '花'];
// a cherry tree whose base stands at baseLat and whose crown leans toward dir (+1 = right)
function sakuraSpr(baseLat, s, dir, w, h) { const v = Math.random() < .5 ? 0 : 1, nm = dir === 0 ? 'sakuraU' : `sakura${dir < 0 ? 'L' : 'R'}${v}`;
  return { lat: baseLat + dir * 92 / 512 * w, s, y: 0, h, w, img: nm, nv: 1 }; }
function buildPark(seg, s0, lEnd, rEnd) {
  const th = seg.th;
  for (const sd of [-1, 1]) {
    const end = sd < 0 ? lEnd : rEnd;
    for (let a = s0; a < end - .01; a += 3) { const b = Math.min(a + 3, end); addWallQuad(seg, sd, a, b, 0, .7, C('#8A8470'), { pat: 'stonewall' }); }
    if (th.moat === sd) { // the palace moat: water, then the far stone wall with pines on top
      const FW = th.wide || 38, WH = th.wide ? 1.3 : 7; if (th.wide) { const ql = sd * (HW - .05); seg.lines.push({ a: [s0, ql, 1.15], b: [end, ql, 1.15], c: '#9AA3AB', w: .06 }); for (let a = s0 + 1; a < end - .5; a += 2) seg.lines.push({ a: [a, ql, .7], b: [a, ql, 1.15], c: '#9AA3AB', w: .045 }); } /* [L5] 隅田川の岸：低いかべの上に、金属の手すり（本物の川ぞいのテラスの柵） */ /* [R12] 大きな川（隅田川）：向こう岸は 100m 先の低いコンクリートの護岸と並木（お堀の高い石垣と松にしない） */
      for (let a = s0 - 20; a < seg.len + 40; a += 12) { const pg = terrClip(seg, [[a, sd * HW], [a + 12, sd * HW], [a + 12, sd * FW], [a, sd * FW]]); if (pg) seg.floor.push({ v: quad(seg, pg.map(q => [q[0], q[1], -.9])), c: C('#3E6E7A'), pat: 'sea', far: 1 }); }
      const [wr0, wr1] = terrRange(seg, sd * FW);
      for (let a = Math.max(s0 - 20, wr0); a < Math.min(seg.len + 40, wr1) - .5; a += 8) { const lat = sd * FW, n = [-sd * seg.r[0], -sd * seg.r[1]]; const a2 = Math.min(a + 8, wr1);
        seg.walls.push({ v: quad(seg, sd < 0 ? [[a, lat, -.9], [a2, lat, -.9], [a2, lat, WH], [a, lat, WH]] : [[a2, lat, -.9], [a, lat, -.9], [a, lat, WH], [a2, lat, WH]]), c: C(th.wide ? '#B5B0A4' : '#9A9384'), n, sh: .9, pat: th.wide ? 'stonewall' : 'ishigaki' });
        if (th.wide) { if (((a / 8) | 0) % 2 === 0) seg.spr.push({ lat: sd * (FW + 3), s: a + 4, y: WH, h: 7, w: 8, img: 'canopy_green', far: 1 }); if (((a / 8) | 0) % 2 === 1 && a > s0) { const w = 14, hh = Math.round(rand(14, 38)), seed = (Math.random() * 1e5) | 0, style = pick(['mixed', 'glass', 'mixed']), cc = C(pick(['#C9C4BA', '#B9C2CA', '#D6D0C4', '#A9B3BC'])); for (let x = a, k = 0; x < a + w - .01; x += 3.5, k++) addWallQuadO(seg, sd, x, Math.min(x + 3.5, a + w), WH, WH + hh, FW + 12 - HW, cc, { pat: 'fac', st: style, h: hh, w: 3.5, seed: seed + k, k, first: k === 0, fv: seed % 8, fw: w, fh: hh, fm: '', fu0: (x - a) / w, fu1: (Math.min(x + 3.5, a + w) - a) / w, fy0: 0, fy1: 1, far: 1 }); } } /* [L6] 川の向こう岸（浅草の側）の並木のうしろに、町のビル（窓のある立体の正面。夜は窓に明かり） */
        else if (th.tree === 'sakura') seg.spr.push(Object.assign(sakuraSpr(sd * 39, a + 4, -sd, 12, 11), { y: 6.4, far: 1 }));
        else seg.spr.push({ lat: sd * 40, s: a + 4, y: 7, h: 6, w: 7, img: 'canopy_pine', far: 1 }); }
      if (th.wide) for (let k = 0; k < 2; k++) { const a = s0 + 12 + k * 45 + rand(0, 20), Lb = sd * (k ? rand(58, 75) : rand(30, 45)), bx = [B(Lb, a, 4.2, 17, -.95, .25, '#3B2F2A'), B(Lb, a + 1.5, 3.7, 14, .25, 2.0, '#EBDFC4', 2), B(Lb, a + 1.2, 4.3, 14.6, 2.0, 2.3, '#4A3A30'), B(Lb, a + 16.2, 4.0, .6, -.2, .5, '#3B2F2A')];
        for (let m = 0; m < 7; m++) bx.push(B(Lb + (Lb > 0 ? -1 : 1) * 2.05, a + 2 + m * 2, .3, .3, 1.55, 1.95, '#D9483A', 2)); for (let m = 0; m < 6; m++) bx.push(B(Lb + (Lb > 0 ? -1 : 1) * 1.86, a + 2.4 + m * 2.2, .02, 1.6, .55, 1.7, '#8A6A4A'));
        seg.props.push(mkProp(seg, bx, { big: 1 })); } /* [L9] 隅田川にうかぶ屋形船（黒い船体・障子の明かりの屋形・屋根・赤いちょうちん。夜は明かりがつく） */
      if (th.tree === 'sakura') { // the near bank: cherries leaning out over the water, and rowboats underneath
        for (let a = s0 + 1; a < end - 2; a += rand(7, 10)) seg.spr.push(sakuraSpr(sd * (HW + 1.2), a, sd, 11, 11.5));
        if (th.boats) for (let a = s0 + 6; a < seg.len + 20; a += rand(9, 16)) { const L = sd * rand(11, 30), hc = pick(['#F3F3F3', '#E9EEF2', '#DDE8D0']);
          seg.props.push(mkProp(seg, [B(L, a, 1.3, 3.0, -.95, -.55, hc), B(L, a + .25, 1.05, 2.5, -.56, -.5, '#3E6E7A'), B(L, a + 1.3, 1.1, .3, -.56, -.36, '#B8794A'), B(L - .2, a + .9, .3, .3, -.5, .2, pick(['#E86A75', '#4E77A0', '#F2C230'])), B(L - .2, a + .9, .26, .26, .2, .46, '#F1D9C4')]));
        }
      }
      continue;
    }
    if (th.tree === 'sakura') { // two rows of cherries arching over the path, like a tunnel
      for (let s = s0 + 1; s < end - 2; s += rand(5, 7)) { seg.spr.push(sakuraSpr(sd * (HW + 3.2), s, -sd, 9, 11.5)); seg.spr.push(sakuraSpr(sd * (HW + 9), s + 2.5, -sd, 12, 12)); }
      continue;
    }
    for (let s = s0 + 2; s < end - 10; s += rand(3, 6)) for (const d of [1.2, 4.5]) seg.spr.push({ /* stop short of the corner so the turn sign stays visible */ lat: sd * (HW + d + rand(0, 2)), s: s + rand(-1, 1), y: 0, h: rand(7, 10), w: rand(6, 8), img: 'canopy_' + (th.tree === 'illum' ? 'green' : th.tree || 'green'), trunk: 1 });
    if (th.town) for (let a = s0 - 6; a < end; a += 12) { const pg = terrClip(seg, [[a, sd * (HW + 4)], [a + 12, sd * (HW + 4)], [a + 12, sd * (HW + 24.3)], [a, sd * (HW + 24.3)]]); if (pg) seg.floor.push({ v: quad(seg, pg.map(q => [q[0], q[1], -.03])), c: C(((a / 12) | 0) % 2 ? '#6F9558' : '#73995B'), pat: 'lawn', far: 1 }); } /* 木のうしろの芝生を、町のビルの足もとまでつなぐ（ビルがういて見えない） */
    if (th.town) for (let a = s0 + 4; a < end - 18; a += rand(17, 24)) { const w = rand(10, 15), hh = Math.round(rand(12, 42)), seed = (Math.random() * 1e5) | 0, style = pick(['mixed', 'glass', 'mixed', 'luxury']), cc = C(pick(['#C9C4BA', '#B9C2CA', '#D6D0C4', '#A9B3BC', '#C8BBAA'])); for (let x = a, k = 0; x < a + w - .01; x += 3.5, k++) addWallQuadO(seg, sd, x, Math.min(x + 3.5, a + w), 0, hh, 24, cc, { pat: 'fac', st: style, h: hh, w: Math.min(3.5, a + w - x), seed: seed + k, k, first: k === 0, fv: seed % 8, fw: w, fh: hh, fm: '', fu0: (x - a) / w, fu1: (Math.min(x + 3.5, a + w) - a) / w, fy0: 0, fy1: 1, far: 1 }); } /* [L7] 着地する公園：並木のうしろ（24m 先）に、まわりの町のビル。前は木のうしろが何もない灰色だった */
  }
  const e = seg.len + HW;
  for (let x = -HW; x < HW - .01; x += 3) seg.walls.push({ v: quad(seg, [[e, x, 0], [e, x + 3, 0], [e, x + 3, .7], [e, x, .7]]), c: C('#8A8470'), n: [-seg.f[0], -seg.f[1]], sh: 1, pat: 'stonewall' });
  if (th.tree === 'sakura') for (let x = -HW - 4; x < HW + 4; x += 5) seg.spr.push(Object.assign(sakuraSpr(x, e + rand(1, 4), 0, 11, 10), { keep: Math.abs(x) <= HW }));
  else for (let x = -HW - 4; x < HW + 4; x += 3) seg.spr.push({ lat: x, s: e + rand(1, 4), y: 0, h: rand(7, 10), w: 7, img: 'canopy_' + (th.tree || 'green'), trunk: 1, keep: Math.abs(x) <= HW });
}
/* Y 字路のとがった角の建物の「細い正面」：2 本の道の建物（それぞれの道が作る）がとがって出会う所を、幅 1.8m ほどの正面でつなぐ。
   正面は 1 階が小さな店（ガラス戸・ひさし）、上は窓。角の看板（分かれ道の札）はこの正面に付く */
function yWedge(seg) {
  const th = seg.th, fac = th.fac, L = seg.len, k = Math.SQRT1_2, h = clamp(rand(fac.h[0], fac.h[1]), 10, 34), c = C(pick(fac.pal));
  const fs = L + k * (2 * HW + .9), half = .9 * k; // 2 本の道の建物は、それぞれの道の「角から 0.9m 先」から始まる。その 2 点を結ぶ正面
  seg.walls.push({ v: quad(seg, [[fs, -half, 0], [fs, half, 0], [fs, half, h], [fs, -half, h]]), c, n: [-seg.f[0], -seg.f[1]], sh: 1, pat: 'fac', st: fac.style === 'station' ? 'glass' : fac.style, h, w: 1.3, seed: (Math.random() * 1e5) | 0, yFront: 1 });
  seg.yFront = { s: fs, half, h };
  /* [Y2] 分かれ目の島：とがった建物の前に、低い縁石の三角の島（植え込み）。先に黄色と黒のポール [Y3] 信号の柱と、こちらを向いた信号（赤・黄・青）[Y4] 島の両わきの白い柵 */
  seg.props.push(mkProp(seg, [{ l0: -half - .25, l1: half + .25, s0: fs - .9, s1: fs - .02, y0: 2.7, y1: 2.84, c: '#3B3F46' }, { l0: -half - .25, l1: half + .25, s0: fs - .92, s1: fs - .86, y0: 2.5, y1: 2.84, c: pick(['#B5302A', '#2F5579', '#3E5A48']) }], { big: 1 })); /* [Y10] とがった角の建物の、1 階の上のひさし（色のついた前だれ） */
  if (h > 14) { const cy = Math.min(h - 2, 9.5); seg.props.push(mkProp(seg, [{ l0: -.55, l1: .55, s0: fs - .25, s1: fs - .05, y0: cy - .55, y1: cy + .55, c: '#2B2F36' }, { l0: -.46, l1: .46, s0: fs - .27, s1: fs - .25, y0: cy - .46, y1: cy + .46, c: '#F6F2E8' }, { l0: -.03, l1: .03, s0: fs - .29, s1: fs - .27, y0: cy - .02, y1: cy + .32, c: '#2B2B2B' }, { l0: -.02, l1: .24, s0: fs - .29, s1: fs - .27, y0: cy - .02, y1: cy + .02, c: '#2B2B2B' }], { big: 1 })); } /* [Y11] 角の建物の正面の、四角いわくの大きな時計（分かれ道の角の目印） */
  if (h > 8) seg.props.push(mkProp(seg, [{ l0: -half - .05, l1: half + .05, s0: fs - .05, s1: fs + .25, y0: h, y1: h + .9, c: '#A7ACB2' }, { l0: -half - .08, l1: half + .08, s0: fs - .08, s1: fs + .28, y0: h + .9, y1: h + 1, c: '#7E858C' }], { big: 1 })); /* [Y14] とがった角の建物の屋上のへり（手すりの立ち上がりと、笠木） */
  const tip = fs - 5.4, G0 = '#B9B4A8';
  { const t2 = fs - 5.4, bx = []; for (const l of [-.55, .55]) bx.push({ l0: l - .07, l1: l + .07, s0: t2 - .9, s1: t2 - .76, y0: 0, y1: .8, c: '#F2F2EE' }, { l0: l - .075, l1: l + .075, s0: t2 - .905, s1: t2 - .755, y0: .58, y1: .66, c: '#E06A2A' }); seg.props.push(mkProp(seg, bx, { big: 1 })); } /* [Y15] 島の先の手前に、白い車止めのポール 2 本（オレンジの反射の帯） */
  seg.props.push(mkProp(seg, [{ l0: -.3, l1: .3, s0: tip, s1: tip + 1.8, y0: 0, y1: .16, c: G0 }, { l0: -.48, l1: .48, s0: tip + 1.8, s1: tip + 3.6, y0: 0, y1: .16, c: G0 }, { l0: -.62, l1: .62, s0: tip + 3.6, s1: fs - .05, y0: 0, y1: .16, c: G0 },
    { l0: -.38, l1: .38, s0: tip + 2, s1: fs - .2, y0: .16, y1: .32, c: '#6F9A52' }, { l0: -.1, l1: .1, s0: tip + .2, s1: tip + .4, y0: 0, y1: .85, c: '#E8C23A' }, { l0: -.1, l1: .1, s0: tip + .2, s1: tip + .4, y0: .5, y1: .62, c: '#2B2B2B' },
    { l0: -.07, l1: .07, s0: fs - 1.1, s1: fs - .96, y0: 0, y1: 4.6, c: '#8A9098' }, { l0: -.48, l1: .48, s0: fs - 1.3, s1: fs - 1.05, y0: 3.75, y1: 4.15, c: '#3B3F46' },
    { l0: -.4, l1: -.18, s0: fs - 1.32, s1: fs - 1.3, y0: 3.83, y1: 4.07, c: '#5FB05A' }, { l0: -.11, l1: .11, s0: fs - 1.32, s1: fs - 1.3, y0: 3.83, y1: 4.07, c: '#6A5A2A' }, { l0: .18, l1: .4, s0: fs - 1.32, s1: fs - 1.3, y0: 3.83, y1: 4.07, c: '#5A2A26' },
    { l0: -.6, l1: -.56, s0: tip + 3.6, s1: fs - .3, y0: .16, y1: .95, c: '#E9EDF0' }, { l0: .56, l1: .6, s0: tip + 3.6, s1: fs - .3, y0: .16, y1: .95, c: '#E9EDF0' }, { l0: -.6, l1: .6, s0: tip + 3.6, s1: fs - .3, y0: .88, y1: .95, c: '#E9EDF0' }], { big: 1 }));
}
/* ---- decks: railings, water or open air ---- */
function buildDeck(seg, s0, lEnd, rEnd) {
  const th = seg.th, L = seg.len;
  const railLat = th.boat ? ROAD + .4 : HW;
  for (const sd of [-1, 1]) {
    const end = sd < 0 ? lEnd : rEnd, lat = sd * railLat, hgt = th.mesh ? 1.25 : 1.0;
    seg.lines.push({ a: [s0, lat, hgt], b: [end, lat, hgt], c: th.rail, w: .09 });
    seg.lines.push({ a: [s0, lat, hgt * .5], b: [end, lat, hgt * .5], c: th.rail, w: .05 });
    for (let s = s0; s < end; s += th.mesh ? 1.2 : 2) seg.lines.push({ a: [s, lat, 0], b: [s, lat, hgt], c: th.rail, w: .05 });
    if (th.mesh) { const nS = [-sd * seg.r[0], -sd * seg.r[1]], ml = sd * (railLat - .02); // PDCA 108〜112：金網と段数の表示
      for (let s = s0; s < end - .01; s += 3) { const e2 = Math.min(end, s + 3); seg.decos.push({ v: quad(seg, sd < 0 ? [[s, ml, 0], [e2, ml, 0], [e2, ml, 2.3], [s, ml, 2.3]] : [[e2, ml, 0], [s, ml, 0], [s, ml, 2.3], [e2, ml, 2.3]]), n: nS, pat: 'mesh', seg, w: e2 - s, seed: s | 0 }); }
      if (sd > 0 && th.climb) for (let s = s0 + 14; s < end - 6; s += 30) { const alt = th.climb[0] + (th.climb[1] - th.climb[0]) * clamp(s / L, 0, 1), steps = Math.round((th.landings && seg.hp && seg.hp.shape === 'flights' ? (segE(seg, s) - segE(seg, 0)) / Math.max(1, segE(seg, L) - segE(seg, 0)) : th.landings ? (alt - 20) / 125 : alt / 150) * 600 / 10) * 10, l2 = sd * (railLat - .05); seg.decos.push({ v: quad(seg, [[s + .8, l2, 1.3], [s, l2, 1.3], [s, l2, 1.9], [s + .8, l2, 1.9]]), n: nS, pat: 'stepsign', seg, w: .8, txt: steps + '段', txt2: Math.round(seg.base != null && seg.hp && seg.hp.shape === 'flights' ? segE(seg, s) - seg.base : alt) + 'm' } /* [H20] 手すりの札の高さは、その場所の本当の高さ */); } }
    if (th.mesh && th.beams) { /* [T1] 塔の骨組み（2026-11-17）：金網の 4m 外に、赤と白の帯の柱（12m ごと）と、ゆるいななめの筋交いだけ。細く・外がわだけにして、階段の前をふさがない（前の太い枠は下の if (false)） */
      const lt = sd * (HW + 4), red = th.beams, wh = '#EDEDEA';
      for (let s = s0 + 10; s < end - 1; s += 12) { for (let j = -1; j < 2; j++) seg.lines.push({ a: [s, lt, j * 5], b: [s, lt, j * 5 + 5], c: (j & 1) ? wh : red, w: .2 });
        if (s + 12 < end - 1) seg.lines.push({ a: [s, lt, -6], b: [s + 12, lt, 6], c: red, w: .08 }); } }
    if (false) { // the tower's own red frame around the stairs（2026-11-17：この枠は名前のまちがいで一度も出ていなかった。出すと画面の前を太い赤い棒がふさぐので、出さないまま。塔の骨組みは金網の外の景色で見せる）
      for (let s = s0 + 4; s < end - 2; s += 8) { seg.lines.push({ a: [s, sd * (HW + 1.5), -30], b: [s + 8, sd * (HW + .8), 18], c: th.beams, w: .55 }); seg.lines.push({ a: [s + 8, sd * (HW + 1.5), -30], b: [s, sd * (HW + .8), 18], c: th.beams, w: .45 }); }
      for (let s = s0; s < end; s += 8) seg.lines.push({ a: [s, sd * (HW + 1), -30], b: [s, sd * (HW + 1), 20], c: th.beams, w: .7 });
    }
  }
  if (th.landings) { /* コース 15〜22（2026-11-17・本物を調べて）：[15] ところどころの踊り場（小さなテラス。段がなく平ら） [16] 踊り場のクイズの板（全 7 問） [17] 白い字で階段に書いた段数 [18] 333 段・500 段の節目の表示 */
    let q = 0; for (let a = s0 + 16; a < L - 12; a += 15) { for (const f of seg.floor) if (f.mid && f.a >= a - .1 && f.a < a + 4.4) f.land = 1; q++;
      for (const sd of [-1, 1]) { const ql = sd * (railLat - .12); seg.props.push(mkProp(seg, [{ l0: ql - .05, l1: ql + .05, s0: a + 2, s1: a + 2.1, y0: 0, y1: 1.3, c: '#5A5F66' }, { l0: ql - .1, l1: ql + .1, s0: a + 1.95, s1: a + 2.15, y0: 1.3, y1: 1.48, c: '#FFE6B0', glow: 2 }])); } /* [H29] 踊り場ごとに、手すりの角に小さな足もと灯（夜は明かりがつく） */
      const l2 = -(railLat - .05), nS = [seg.r[0], seg.r[1]]; if (q <= 7) seg.decos.push({ v: quad(seg, [[a + 1.2, l2, 1.0], [a + 2.6, l2, 1.0], [a + 2.6, l2, 2.0], [a + 1.2, l2, 2.0]]), n: nS, pat: 'quizpanel', seg, w: 1.4, txt: 'Q' + q }); }
    const stepAt = a => { const up = segE(seg, a) - segE(seg, 0), tot = Math.max(1, segE(seg, L) - segE(seg, 0)); return Math.round(up / tot * 600); }; /* [H19] 段の数は、本当に登った高さから（20 段＝3.5m ごと）。前は道の長さの割合で数えていて、踊り場でも数がふえた */
    for (const f of seg.floor) if (f.mid && !f.land && f.ti % 6 === 3) { const n = stepAt(f.a); if (n > 0 && n < 600) f.stepN = n; }
    for (const [n, lab] of [[333, '333'], [500, '500']]) { let best = null; for (const f of seg.floor) if (f.mid && !f.land && (!best || Math.abs(stepAt(f.a) - n) < Math.abs(stepAt(best.a) - n))) best = f; if (best) { best.stepN = n; best.stepBig = 1; } } }
  if (th.roofLegs) { /* コース 23〜28：屋上 [23] 真上にのびる塔の 4 本の脚（赤と白の鉄骨） [24] 脚をつなぐ斜めの筋交い [25] 白い手すり [26] 外階段の入口の門 [27] 門の上の看板「外階段 入口 約 600 段」 [28] 係員の立つ台 */
    const red = '#D9452B', wh = '#F2F2F0'; for (const sd of [-1, 1]) for (const [sa, k] of [[-6, 1], [L * .45, -1], [L + 8, 1]]) { for (let j = 0; j < 6; j++) { const y0 = j * 9, y1 = y0 + 9, t0 = j / 6, t1 = (j + 1) / 6, lat0 = sd * (HW + 9 - t0 * 7), lat1 = sd * (HW + 9 - t1 * 7); seg.lines.push({ a: [sa + k * t0 * 3, lat0, y0], b: [sa + k * t1 * 3, lat1, y1], c: j % 2 ? wh : red, w: 1.1 }); }
        for (let j = 0; j < 3; j++) seg.lines.push({ a: [sa, sd * (HW + 9 - j * 2.3), j * 18], b: [sa + 14 * k, sd * (HW + 8 - j * 2.3), j * 18 + 14], c: red, w: .4 }); }
    const g0 = L - 9; for (const sd of [-1, 1]) seg.lines.push({ a: [g0, sd * 2.9, 0], b: [g0, sd * 2.9, 3.0], c: red, w: .22 }); seg.lines.push({ a: [g0, -2.9, 3.0], b: [g0, 2.9, 3.0], c: red, w: .22 });
    seg.decos.push({ v: quad(seg, [[g0 - .05, -2.2, 3.05], [g0 - .05, 2.2, 3.05], [g0 - .05, 2.2, 3.95], [g0 - .05, -2.2, 3.95]]), n: [-seg.f[0], -seg.f[1]], pat: 'gatesign', seg, w: 4.4 });
    for (const sd of [-1, 1]) { const k = (Math.random() * PEOPLE.length) | 0; seg.spr.push({ lat: sd * 3.5, s: g0 - .6, y: 0, w: .8, h: 1.75, img: artKey('walker', k + '.0.0'), gnd: .3, keep: 1 }); } } // [T2] 外階段の入口の門の両わきに、係の人
  if (th.boat) { // the boat: white hull edges, cabin at the end
    for (const sd of [-1, 1]) for (let a = s0; a < L + HW; a += 6) { const lat = sd * (ROAD + .45);
      seg.walls.push({ v: quad(seg, sd < 0 ? [[a, lat, -.6], [a + 6, lat, -.6], [a + 6, lat, .02], [a, lat, .02]] : [[a + 6, lat, -.6], [a, lat, -.6], [a, lat, .02], [a + 6, lat, .02]]), c: C(th.hull || '#FBF6EE'), n: [-sd * seg.r[0] * -1, -sd * seg.r[1] * -1], sh: .9 }); }
    if (th.boatLanterns) for (const sd of [-1, 1]) for (let a = s0 + 2; a < L - 2; a += 2.6) seg.spr.push({ lat: sd * (ROAD + .4), s: a, y: 1.9, h: .8, w: .62, img: 'lantern', glow: 1 });
    for (let k = 0; k < 7; k++) { const sd = k % 2 ? 1 : -1; const s = rand(0, L); seg.spr.push({ lat: sd * rand(20, 60), s, y: -.9, h: rand(14, 40), w: rand(24, 44), img: 'bldg', nv: 1, far: 1 }); }
  }
  if (th.bridge) { // the suspension bridge to Odaiba: towers and cables
    const towers = [L * .28, L * .78];
    for (const ts of towers) for (const sd of [-1, 1]) seg.props.push(mkProp(seg, [{ l0: sd * (HW + .3), l1: sd * (HW + 1.6), s0: ts, s1: ts + 1.6, y0: 0, y1: 46, c: '#EEF1F3', glowN: 1 }, { l0: -HW - 1.6, l1: HW + 1.6, s0: ts, s1: ts + 1.6, y0: 30, y1: 32, c: '#EEF1F3' }, { l0: -HW - 1.6, l1: HW + 1.6, s0: ts, s1: ts + 1.6, y0: 42, y1: 44, c: '#EEF1F3' }], { big: 1 }));
    for (const sd of [-1, 1]) {
      const lat = sd * (HW + .95), pts = [];
      const hAt = s => { if (s < towers[0]) return lerp(4, 45, clamp((s - s0) / (towers[0] - s0), 0, 1) ** 2); if (s > towers[1]) return lerp(45, 4, clamp((s - towers[1]) / (L - towers[1]), 0, 1) ** .5); const u = (s - towers[0]) / (towers[1] - towers[0]); return 6 + 39 * (2 * u - 1) ** 2; };
      for (let s = s0; s < L + HW; s += 4) pts.push(s);
      for (let k = 0; k < pts.length - 1; k++) { seg.lines.push({ a: [pts[k], lat, hAt(pts[k])], b: [pts[k + 1], lat, hAt(pts[k + 1])], c: '#EEF1F3', w: .35, glowN: 1 }); seg.lines.push({ a: [pts[k], lat, 1.2], b: [pts[k], lat, hAt(pts[k])], c: '#D9DEE3', w: .06 }); }
    }
  }
}

/* ---------- props (furniture / street furniture) ---------- */
// a painted piece's sprite key, registered for idle-time painting
function artKey(type, v) { const key = 'pa|' + type + '|' + v; if (!SPR[key] && !SPR_PEND[key]) { SPR_PEND[key] = () => PROP_ART[type](false, v); } return key; }
function mkProp(seg, boxes, o) {
  o = o || {};
  const bx = boxes.map(b => Object.assign({}, b, { cc: C(b.c) }));
  let s0 = 1e9, s1 = -1e9, l0 = 9e9, l1 = -9e9; for (const b of bx) { s0 = Math.min(s0, b.s0); s1 = Math.max(s1, b.s1); l0 = Math.min(l0, b.l0); l1 = Math.max(l1, b.l1); }
  const lamp = bx.find(b => b.glow && b.y1 > 1.2 && (b.l1 - b.l0) < 1.2);
  return { bx, s0, s1, l0, l1, prop: 1, big: o.big, spr: o.spr || [], lamp };
}
/* 走る電車（高架の上・道の上の橋）：2026-11-16 オーナー「ただの図形の組み合わせ」→ 本物の通勤電車のつくりで組み立てる。
   1 両 20m を 5m ずつ 4 つに分け、横の面に絵（4e_art.js の paintFace 'tc…'：ステンレスの車体・窓・両開きのドア・帯・行き先の表示）を貼る。
   屋根（丸みの段・冷房の箱・パンタグラフ）、床下の機器、台車と車輪、車両のあいだのほろ、先頭の運転台の顔。夜は窓に明かり。 docs/TRAIN-2026-11-16.md */
function trainCars(o) {
  const out = [], CAR = 20, H = 3.05, y0 = o.y0, lc = o.lc, n = o.cross ? 1.5 : Math.round((o.len || 40) / CAR);
  // put a box along the train: a = from the head (m), b = to (m), across: n0..n1 (m from the side that faces the street), height y0..y1
  const put = (a, b, n0, n1, ya, yb, c, extra) => {
    let box;
    if (o.cross) box = { l0: o.l0 + a, l1: o.l0 + b, s0: o.s0 + n0, s1: o.s0 + n1, y0: ya, y1: yb };
    else { const sd = o.side, p0 = sd * (o.near + n0), p1 = sd * (o.near + n1); box = { l0: Math.min(p0, p1), l1: Math.max(p0, p1), s0: a, s1: b, y0: ya, y1: yb, faceSide: sd < 0 ? 'R' : 'L' }; }   // 道に向いた面だけに絵
    out.push(Object.assign(box, { c, cc: C(c) }, extra || {})); };
  const W = o.cross ? (o.s1 - o.s0) : (o.far - o.near), FW = 600, FH = 366;
  for (let k = 0; k * CAR < n * CAR - .1; k++) {
    const c0 = k * CAR, last = (k + 1) * CAR > n * CAR + .1;
    for (let q = 0; q < 4; q++) { const a = c0 + q * 5 + (q === 0 ? .2 : 0), b = c0 + (q + 1) * 5 - (q === 3 ? .2 : 0); if (o.cross && a > (o.l1 - o.l0) - .1) break;
      const part = k === 0 && q === 0 ? 'head' : q === 1 && k % 2 === 0 ? 'led' : 'mid', key = 'tc' + part + lc;
      put(a, Math.min(b, o.cross ? o.l1 - o.l0 : b), 0, W, y0, y0 + H, '#C9CDD2', o.cross ? { face: key, faceN: key + 'N', faceW: FW, faceH: FH, faceFront: 1, noEdge: 1 } : { face: key, faceN: key + 'N', faceW: FW, faceH: FH, noEdge: 1 }); }
    if (o.cross && c0 + CAR > o.l1 - o.l0) { /* the part of a car still beyond the bridge */ }
    const e = Math.min(c0 + CAR, o.cross ? o.l1 - o.l0 : 1e9);
    put(c0 + .3, e - .3, .12, W - .12, y0 + H, y0 + H + .18, '#A9B0B7', { noEdge: 1 });                        // 屋根の丸みの段
    put(c0 + 3.2, c0 + 6.4, .55, W - .55, y0 + H + .18, y0 + H + .55, '#B9C0C7');                              // 冷房の箱（前）
    if (e > c0 + 16.6) put(c0 + 13.6, c0 + 16.8, .55, W - .55, y0 + H + .18, y0 + H + .55, '#B9C0C7');          // 冷房の箱（後ろ）
    if (k % 2 === 1 && e > c0 + 11) { put(c0 + 9, c0 + 9.12, .8, W - .8, y0 + H + .18, y0 + H + 1.25, '#3A3F45'); put(c0 + 9, c0 + 11, .9, W - .9, y0 + H + 1.2, y0 + H + 1.28, '#3A3F45'); } // パンタグラフ
    put(c0 + 4.5, Math.min(e, c0 + 15.5), .35, W - .35, y0 - .55, y0, '#3A3F45', { noEdge: 1 });               // 床下の機器
    for (const t of [1.2, 16.4]) if (e > c0 + t + 2.4) { put(c0 + t, c0 + t + 2.4, .05, W - .05, y0 - .8, y0 - .05, '#2B2E33');   // 台車
      for (const w of [.35, 1.65]) put(c0 + t + w, c0 + t + w + .4, .1, W - .1, y0 - .95, y0 - .5, '#1E2024', { noEdge: 1 }); }  // 車輪
    if (!last && !(o.cross && c0 + CAR > o.l1 - o.l0)) put(c0 + CAR - .2, c0 + CAR + .2, .4, W - .4, y0 + .2, y0 + H - .2, '#2B2E33', { noEdge: 1 });   // ほろ
  }
  if (!o.cross) out.push(Object.assign({}, out[0], { s0: out[0].s0 - .08, s1: out[0].s0 + .02, face: 'tccab' + lc, faceN: 'tccab' + lc + 'N', faceW: 300, faceH: 366, faceFront: 1 }));   // 先頭の顔
  return out;
}
function B(L, s, w, d, y0, y1, c, glow, pat) { return { l0: L - w / 2, l1: L + w / 2, s0: s, s1: s + d, y0, y1, c, glow, pat }; }
// Each builder gets (sd = -1|1, s) and returns {bx, spr, ln, w}: w = length used along s
const PROPS = {
  tansu: (sd, s) => ({ w: 1.4, bx: [B(sd * 4.05, s, .9, 1.3, 0, 1.6, '#8A5A36'), B(sd * 3.58, s + .05, .04, 1.2, .3, .32, '#C9962F'), B(sd * 3.58, s + .05, .04, 1.2, .8, .82, '#C9962F'), B(sd * 3.58, s + .05, .04, 1.2, 1.3, 1.32, '#C9962F')] }),
  futon: (sd, s) => ({ w: 1.6, bx: [B(sd * 3.9, s, 1.3, 1.3, 0, .25, '#F2F2F7'), B(sd * 3.9, s + .05, 1.25, 1.2, .25, .5, '#E6A4A9'), B(sd * 3.9, s, 1.3, 1.3, .5, .72, '#F2F2F7'), B(sd * 3.9, s + .1, 1.0, .9, .72, .95, '#7FA6D6')] }),
  xmasTree: (sd, s) => ({ w: .9, bx: [B(sd * 3.9, s, .6, .6, 0, 1.2, '#2F6B4F', 1)], spr: [{ lat: sd * 3.9, s: s + .25, y: .5, h: 1.6, w: 1.6, img: 'glow', glow: 1, night: 1 }] }),
  kadomatsu: (sd, s) => ({ w: .9, bx: [B(sd * 3.9, s, .55, .55, 0, 1.1, '#5F9E5A')] }),
  heartBox: (sd, s) => ({ w: .8, bx: [B(sd * 3.9, s, .5, .5, 0, .4, '#E8465E')] }),
  sakuraPot: (sd, s) => ({ w: .9, bx: [B(sd * 3.9, s, .6, .6, 0, 1.3, '#F7C6D3')] }),
  bambooWish: (sd, s) => ({ w: .9, bx: [B(sd * 3.9, s, .5, .5, 0, 1.7, '#7FA65A')] }),
  jackO: (sd, s) => ({ w: .9, bx: [B(sd * 3.9, s, .55, .55, 0, .5, '#E07A1F', 1)], spr: [{ lat: sd * 3.9, s: s + .25, y: .3, h: 1.1, w: 1.3, img: 'glow', glow: 1, night: 1 }] }),
  andon: (sd, s) => ({ w: .9, bx: [B(sd * 3.9, s, .5, .5, 0, .2, '#5E3820'), B(sd * 3.9, s, .45, .45, .2, 1.0, '#FFF3D6', 1)], spr: [{ lat: sd * 3.9, s: s + .25, y: .6, h: 1.6, w: 1.6, img: 'glow', glow: 1 }] }),
  zabutonS: (sd, s) => ({ w: 1.4, bx: [B(sd * 3.6, s, 1.1, 1.1, 0, .15, '#7E3552'), B(sd * 3.6, s + .05, 1.0, 1.0, .15, .3, '#9C456A')] }),
  papersS: (sd, s) => ({ w: 1.2, bx: [B(sd * 3.8, s, .9, .7, 0, .5 + Math.random() * .8, '#FFFFFF'), B(sd * 3.75, s + .05, .88, .66, .5, .9 + Math.random() * .6, '#F4F4F0')] }),
  shelf: (sd, s) => ({ w: 2.2, bx: [B(sd * 4.25, s, .6, 2.0, 0, 2.1, '#8A5A36'), ...[0, 1, 2, 3].map(r => B(sd * 3.94, s + .1, .02, 1.8, .2 + r * .5, .5 + r * .5, ['#C8463C', '#4E77A0', '#F2C230', '#5F9E5A'][r]))] }),
  plant: (sd, s) => ({ w: 1.4, bx: [B(sd * 3.8, s, .6, .6, 0, .55, '#B08155')], spr: [{ lat: sd * 3.8, s: s + .3, y: .5, h: 1.5, w: 1.3, img: 'canopy_green' }] }),
  boxesS: (sd, s) => ({ w: 1.6, bx: [B(sd * 4.3, s, 1.0, 1.0, 0, .75, '#C79A6C'), B(sd * 4.35, s + .15, .7, .7, .75, 1.2, '#D3A777'), B(sd * 3.85, s + .4, .02, .3, 0, .75, '#E2BB8D')] }), /* 道ばたの段ボール：レーンの障害物の箱と同じ絵なので、道から離して低くする（レーンをふさいで見えた・2026-11-08） */
  umbrellaS: (sd, s) => ({ w: 1, bx: [B(sd * 4.0, s, .5, .5, 0, .7, '#4E77A0'), B(sd * 3.95, s + .2, .08, .08, .7, 1.35, '#C8463C'), B(sd * 4.05, s + .3, .08, .08, .7, 1.25, '#F2C230')] }),
  sofa: (sd, s) => ({ w: 2.8, bx: [B(sd * 3.9, s, 1.2, 2.4, 0, .5, '#4E77A0'), B(sd * 4.35, s, .3, 2.4, .5, 1.1, '#46699A'), B(sd * 3.9, s - .1, 1.3, .25, 0, .8, '#46699A'), B(sd * 3.9, s + 2.25, 1.3, .25, 0, .8, '#46699A')] }),
  tvstand: (sd, s) => ({ w: 2.2, bx: [B(sd * 4.1, s, .7, 2.0, 0, .55, '#6B4631'), B(sd * 4.2, s + .2, .12, 1.6, .55, 1.5, '#1C1919'), B(sd * 4.13, s + .28, .02, 1.44, .62, 1.43, '#3B6EA8', 1)] }),
  lampS: (sd, s) => ({ w: .8, bx: [B(sd * 4.0, s, .3, .3, 0, .05, '#3B2A20'), B(sd * 4.0, s + .12, .06, .06, .05, 1.6, '#3B2A20'), B(sd * 4.0, s, .5, .5, 1.6, 1.95, '#FFF3D6', 1)], spr: [{ lat: sd * 4.0, s: s + .25, y: 1.4, h: 2, w: 2, img: 'glow', glow: 1 }] }),
  counter: (sd, s) => ({ w: 3.2, bx: [B(sd * 4.1, s, .8, 3.0, 0, .9, '#F3EEE6'), B(sd * 4.1, s, .85, 3.0, .9, .96, '#9AA9B6'), B(sd * 4.1, s + 1.0, .5, .8, .96, .98, '#7D8B97'), B(sd * 4.5, s, .2, 3.0, 1.5, 2.2, '#E9E2D4')] }),
  fridge: (sd, s) => ({ w: 1.2, bx: [B(sd * 4.0, s, .8, .9, 0, 2.0, '#F7F9FA'), B(sd * 3.59, s + .7, .02, .06, .9, 1.3, '#9AA9B6'), B(sd * 3.59, s, .02, .9, 1.28, 1.3, '#9AA9B6')] }),
  rack: (sd, s) => ({ w: 1.4, bx: [B(sd * 4.2, s, .5, 1.2, 0, 1.7, '#9AA9B6'), B(sd * 4.0, s + .2, .2, .3, 1.0, 1.25, '#C8463C'), B(sd * 4.0, s + .7, .2, .3, 1.0, 1.2, '#F2C230')] }),
  getabako: (sd, s) => ({ w: 2.6, bx: [B(sd * 4.2, s, .6, 2.4, 0, 1.0, '#9C7652'), B(sd * 3.89, s + .1, .02, 2.2, .45, .48, '#6B4631'), B(sd * 4.2, s, .62, 2.4, 1.0, 1.04, '#6B4631')] }),
  // street furniture
  pole: (sd, s) => ({ w: 6, pole: 1, bx: [B(sd * 3.0, s, .28, .28, 0, 8.6, '#A39E95'), B(sd * 3.0, s - .05, 1.1, .12, 7.6, 7.72, '#7A756D'), B(sd * 2.8, s + .1, .5, .5, 5.8, 6.6, '#9AA0A6')] }),
  vending: (sd, s) => { const c = pick(['#E9ECEF', '#C8463C', '#355F86', '#F2F2F2']); return { w: 1.2, bx: [B(sd * 4.05, s, .8, 1.0, 0, 1.85, c), B(sd * 3.64, s + .08, .02, .84, .7, 1.7, '#FBF6EE', 1, 'vend')] }; },
  tree: (sd, s, th) => ({ w: 5, spr: [{ lat: sd * 3.4, s: s + .45, y: 0, h: 5.6, w: 3.8, img: 'canopy_' + ((th && th.tree) || 'green'), trunk: 1, gnd: .55 }] }),
  post: (sd, s) => ({ w: 1, bx: [B(sd * 3.3, s, .5, .45, 0, 1.15, '#D33A2C'), B(sd * 3.3, s - .02, .54, .5, 1.15, 1.25, '#B5302A'), B(sd * 3.05, s + .1, .02, .25, .85, .9, '#2B2B2B')] }),
  bikes: (sd, s) => ({ w: 2.6, bx: [0, 1, 2].flatMap(k => [B(sd * 3.9, s + k * .8, 1.3, .1, 0, .6, '#2B2B2B'), B(sd * 3.9, s + k * .8, .9, .12, .6, .7, pick(['#3A6FB0', '#C8463C', '#5F9E5A', '#E9E9E9']))]) }),
  hedge: (sd, s) => ({ w: 3.4, bx: [B(sd * 3.4, s, .8, 3, 0, .3, '#8A8470'), B(sd * 3.4, s, .7, 3, .3, .68, '#4C8A48')], spr: [0, 1, 2, 3, 4].map(k => ({ lat: sd * (3.4 + (k % 2 ? .12 : -.12)), s: s + .3 + k * .6, y: .5, h: .42 + (k % 3) * .06, w: .85, img: 'canopy_green' })) }), /* 2026-11-17 景色 112：生け垣の上を、四角い箱でなく、葉のかたまりのでこぼこに */
  sakura: (sd, s) => ({ w: 5, bx: [B(sd * 3.6, s, .5, .5, 0, .12, '#7A6A55')], spr: [sakuraSpr(sd * 3.6, s + .25, -sd, 9, 8)] }),
  // a paper lantern on a post (bonbori), lit for the evening cherry viewing
  bonbori: (sd, s) => ({ w: 3.4, bx: [B(sd * 3.1, s, .12, .12, 0, 1.45, '#3B2A20'), B(sd * 3.1, s - .14, .4, .4, 1.45, 2.0, '#FBEFE6', 2), B(sd * 3.1, s - .16, .44, .44, 2.0, 2.08, '#2B1E18'), B(sd * 3.1, s - .16, .44, .44, 1.4, 1.46, '#2B1E18')],
    spr: [{ lat: sd * 3.1, s: s + .05, y: 1.1, h: 1.8, w: 1.8, img: 'glow', glow: 1, night: 1 }] }),
  lampC: (sd, s) => ({ w: 4, bx: [B(sd * 3.2, s, .3, .3, 0, .5, '#2F3B47'), B(sd * 3.2, s + .1, .1, .1, .5, 4.2, '#2F3B47'), B(sd * 3.2, s, .4, .4, 4.2, 4.7, '#FFF3D6', 1)], spr: [{ lat: sd * 3.2, s: s + .2, y: 3.4, h: 2.6, w: 2.6, img: 'glow', glow: 1, night: 1 }] }),
  // 2026-11-17 景色 31〜50：東京の道ならではの物（絵は 4h_artplus.js。PROP_DIM で道に向いた 1 枚の絵になる）
  cmirror: (sd, s) => ({ w: 2, bx: [B(sd * 3.4, s, .2, .2, 0, 3.0, '#E87A2E')] }),
  roadsign: (sd, s) => ({ w: 2, bx: [B(sd * 3.5, s, .15, .15, 0, 2.6, '#9AA0A6')] }),
  hydrant: (sd, s) => ({ w: 1.5, bx: [B(sd * 3.6, s, .12, .12, 0, 2.0, '#D7262E')] }),
  busstop: (sd, s) => ({ w: 3, bx: [B(sd * 3.4, s, .2, .2, 0, 2.6, '#2E7A4E')] }),
  gomi: (sd, s) => ({ w: 2.4, bx: [B(sd * 4.0, s, .9, 1.6, 0, .9, '#3E8A4A')] }),
  bollard: (sd, s) => ({ w: 2.4, bx: [B(sd * 3.0, s, .15, 1.6, 0, .85, '#B9BEC4')] }),
  areamap: (sd, s) => ({ w: 2.2, bx: [B(sd * 4.0, s, .2, 1.3, 0, 2.0, '#3A4048')] }),
  fountainS: (sd, s) => ({ w: 1.4, bx: [B(sd * 3.7, s, .42, .42, 0, .82, '#B9B4A8'), B(sd * 3.7, s - .12, .72, .66, .82, .92, '#9A958C'), B(sd * 3.7, s + .12, .07, .07, .92, 1.05, '#C9CDD2')] }), /* [L11] 公園の水のみ場（石の柱・受け皿・じゃ口） */
  noki: (sd, s) => ({ w: 2.4, bx: [B(sd * 4.15, s, .6, 1.7, 0, .7, '#C9C7BF')] }),
  signal: (sd, s) => ({ w: 5, bx: [B(sd * 3.0, s, .2, .2, 0, 5.2, '#9AA0A6'), B(sd * 2.2, s, 1.7, .15, 5.0, 5.12, '#9AA0A6'), B(sd * 1.6, s - .1, 1.2, .35, 4.8, 5.2, '#46525E'), B(sd * 1.2, s - .12, .26, .02, 4.88, 5.12, '#7FD06A', 1), B(sd * 1.6, s - .12, .26, .02, 4.88, 5.12, '#3B3B3B'), B(sd * 2.0, s - .12, .26, .02, 4.88, 5.12, '#3B3B3B')] }),
  guard: (sd, s) => ({ w: 6, ln: [{ a: [s, sd * 2.8, .7], b: [s + 6, sd * 2.8, .7], c: '#F3F3F3', w: .12 }, { a: [s, sd * 2.8, .45], b: [s + 6, sd * 2.8, .45], c: '#F3F3F3', w: .08 }, { a: [s, sd * 2.8, 0], b: [s, sd * 2.8, .75], c: '#D9DEE3', w: .07 }] }),
  benchS: (sd, s) => ({ w: 2.2, bx: [B(sd * 3.9, s, .5, 1.8, .38, .46, '#B08155'), B(sd * 3.9, s + .1, .45, .1, 0, .38, '#46525E'), B(sd * 3.9, s + 1.6, .45, .1, 0, .38, '#46525E'), B(sd * 4.12, s, .08, 1.8, .46, .85, '#B08155')] }),
  flowers: (sd, s) => ({ w: 1.6, bx: [B(sd * 3.6, s, 1.0, 1.0, 0, .55, '#D9D2C6')], spr: [{ lat: sd * 3.6, s: s + .5, y: .4, h: .9, w: 1.1, img: 'flowers' }] }),
  gacha: (sd, s) => ({ w: 2.6, bx: [0, 1, 2].flatMap(k => [B(sd * 4.0, s + k * .8, .6, .7, 0, .9, pick(['#E86A75', '#4E77A0', '#F2C230', '#7FD06A'])), B(sd * 4.0, s + k * .8, .6, .7, .9, 1.5, '#DDEFF8', 1)]) }),
  chochin: (sd, s) => ({ w: 1.6, spr: [{ lat: sd * (HW - .6), s, y: 2.2, h: .9, w: .7, img: 'lantern', glow: 1 }] }),
  stoneLantern: (sd, s) => ({ w: 2, bx: [B(sd * 3.6, s, .7, .7, 0, .3, '#8F8A80'), B(sd * 3.6, s + .2, .3, .3, .3, 1.2, '#8F8A80'), B(sd * 3.6, s, .7, .7, 1.2, 1.6, '#A09B90', 1), B(sd * 3.6, s - .1, .9, .9, 1.6, 1.8, '#7A756D')] }),
  rickshawP: (sd, s) => ({ w: 2.6, bx: [B(sd * 3.6, s + .4, .1, 1.0, 0, 1.0, '#2B2B2B'), B(sd * 4.2, s + .4, .1, 1.0, 0, 1.0, '#2B2B2B'), B(sd * 3.9, s + .3, 1.0, 1.0, .7, 1.05, '#B5302A'), B(sd * 3.9, s + .9, 1.0, .2, 1.05, 1.7, '#2B2B2B')] }),
  kiosk: (sd, s) => ({ w: 3, bx: [B(sd * 4.0, s, 1.0, 2.6, 0, 2.2, '#4E77A0'), B(sd * 3.49, s + .2, .02, 2.2, .9, 1.6, '#FBF6EE', 1)] }),
  pillarS: (sd, s) => ({ w: 6, bx: [B(sd * 3.6, s, .5, .5, 0, 3.6, '#D6D6D0'), B(sd * 3.34, s + .05, .02, .4, 1.5, 2.3, '#2F5579')] }),
  /* 電車のロングシート（2026-11-16）：7 人がけの座面と背（1 人ずつのふくらみ）・下の暖房の格子・両はしの仕切り板・手すりの柱・網棚。5 つに 1 つは色のちがう優先席 */
  seat: (sd, s) => { const pr = Math.random() < .2, c = pr ? '#8E5A62' : '#2F6E8E', t = pr ? 'P' : '';
    return { w: 3.4, bx: [Object.assign(B(sd * 4.0, s, 1.0, 3.2, .42, .6, c), { face: 'tsC' + t, faceW: 300, faceH: 40 }), Object.assign(B(sd * 4.05, s + .05, .9, 3.1, 0, .42, '#8E98A2'), { face: 'tsbase', faceW: 300, faceH: 50 }),
      Object.assign(B(sd * 4.45, s, .2, 3.2, .6, 1.18, c), { face: 'tsB' + t, faceW: 300, faceH: 70 }),
      Object.assign(B(sd * 3.98, s - .07, 1.04, .06, .42, 1.3, '#D9DEE2'), { face: 'tspart', faceW: 160, faceH: 140, faceFront: 1, noEdge: 1 }), Object.assign(B(sd * 3.98, s + 3.21, 1.04, .06, .42, 1.3, '#D9DEE2'), { face: 'tspart', faceW: 160, faceH: 140, faceFront: 1, noEdge: 1 }),
      B(sd * 3.47, s - .04, .07, .07, 0, 2.6, '#D9DEE2'), B(sd * 3.47, s + 3.2, .07, .07, 0, 2.6, '#D9DEE2'),
      B(sd * 4.25, s, .5, 3.2, 1.92, 1.95, '#B9C0C7'), B(sd * 4.0, s, .04, 3.2, 1.9, 1.96, '#D9DEE2')] }; },
  nakazuri: (sd, s) => ({ w: 3.2, spr: [{ lat: 0, s: s + .4, y: 2.28, h: .56, w: 1.0, img: artKey('ad', ((Math.random() * 10) | 0) + adSeason()), keep: 1 }, { lat: 0, s: s + 1.6, y: 2.28, h: .56, w: 1.0, img: artKey('ad', ((Math.random() * 10) | 0) + adSeason()), keep: 1 }], ln: [{ a: [s + .4, 0, 2.62], b: [s + .4, 0, 2.86], c: '#9AA0A6', w: .03 }, { a: [s + 1.6, 0, 2.62], b: [s + 1.6, 0, 2.86], c: '#9AA0A6', w: .03 }] }),
  strapS: (sd, s) => ({ w: 3, ln: [{ a: [s, sd * 3.0, 2.55], b: [s + 3, sd * 3.0, 2.55], c: '#C9CDD2', w: .05 }], spr: [0, 1, 2].map(k => ({ lat: sd * 3.0, s: s + .5 + k, y: 2.05, h: .5, w: .22, img: 'strap' })) }),
  desk: (sd, s) => ({ w: 2.4, bx: [B(sd * 3.8, s, 1.4, 1.6, .7, .76, '#E9E4DA'), B(sd * 3.8, s + .1, 1.3, .08, 0, .7, '#9AA9B6'), B(sd * 3.8, s + 1.42, 1.3, .08, 0, .7, '#9AA9B6'), B(sd * 4.2, s + .4, .1, .8, .76, 1.28, '#1C1919'), B(sd * 4.14, s + .45, .02, .7, .82, 1.24, '#6FC3E8', 1), B(sd * 3.0, s + .5, .6, .6, .4, .52, '#3B4A5A'), B(sd * 2.72, s + .5, .1, .6, .52, 1.0, '#3B4A5A')] }),
  cabinet: (sd, s) => ({ w: 1.6, bx: [B(sd * 4.2, s, .6, 1.4, 0, 1.8, '#C9CDD2'), B(sd * 3.89, s + .1, .02, 1.2, .9, .93, '#9AA9B6')] }),
  water: (sd, s) => ({ w: 1, bx: [B(sd * 4.1, s, .4, .4, 0, 1.1, '#F7F9FA'), B(sd * 4.1, s, .36, .36, 1.1, 1.5, '#9ED0F0')] }),
  copierS: (sd, s) => ({ w: 1.8, bx: [B(sd * 4.0, s, .9, 1.3, 0, 1.15, '#D9DDE2'), B(sd * 4.0, s + .1, .9, 1.1, 1.15, 1.3, '#9AA9B6')] }),
  sofaO: (sd, s) => ({ w: 2.6, bx: [B(sd * 3.9, s, 1.0, 2.2, 0, .45, '#46525E'), B(sd * 4.3, s, .25, 2.2, .45, .9, '#3B4A5A')] }),
  gateS: (sd, s) => ({ w: 1.5, bx: [B(sd * 3.8, s, .8, 1.0, 0, 1.0, '#46525E')] }),
  mchairs: (sd, s) => ({ w: 2, bx: [B(sd * 3.4, s, .8, 1.6, .7, .78, '#E9E4DA'), B(sd * 3.4, s + .7, .2, .2, 0, .7, '#9AA9B6'), B(sd * 4.2, s + .5, .6, .6, .4, .5, '#3B4A5A'), B(sd * 4.45, s + .5, .1, .6, .5, .95, '#3B4A5A')] }),
  crates: (sd, s) => ({ w: 1.6, bx: [B(sd * 3.8, s, .8, .8, 0, .45, '#E0A030'), B(sd * 3.8, s, .8, .8, .45, .9, '#C8463C'), B(sd * 3.85, s + .05, .7, .7, .9, 1.35, '#E0A030')] }),
  stools: (sd, s) => ({ w: 2.4, bx: [0, 1].flatMap(k => [B(sd * 3.4, s + k * 1.1, .4, .4, 0, .5, '#B5302A'), B(sd * 3.4, s + k * 1.1, .45, .45, .5, .58, '#C0392B')]).concat([B(sd * 4.0, s, .8, 2.2, .8, .86, '#8A5530'), B(sd * 4.0, s + 1, .2, .2, 0, .8, '#5E3820')]) }),
  coneTree: (sd, s, th) => ({ w: 3.2, spr: [{ lat: sd * 3.4, s: s + .1, y: 0, h: 10.5, w: 3.8, img: (th && th.cone) || 'canopy_cone', trunk: 1, gnd: .5 }, { lat: sd * 7.2, s: s + 1.5, y: 0, h: 11, w: 4, img: (th && th.cone) || 'canopy_cone', trunk: 1 }] }),
  bigTree: (sd, s, th) => ({ w: 5.5, spr: [{ lat: sd * 3.4, s: s + .5, y: 0, h: 9.4, w: 7.4, img: 'canopy_zelkova', trunk: 1, gnd: .7 }] }),
  stall: (sd, s) => { const c = pick(['#E86A75', '#F2C230', '#5F9E5A', '#F08A2E', '#C8463C']); return { w: 2.4, bx: [B(sd * 3.9, s, 1.2, 2.2, 0, .9, '#8A5530'), B(sd * 3.75, s + .1, .9, 2.0, .9, 1.15, c), B(sd * 3.85, s + .1, 1.1, 2.0, 1.15, 1.25, pick(['#F2C230', '#E86A75', '#FBF6EE'])), B(sd * 4.2, s, .1, 2.2, 1.25, 2.6, '#3B3B40'), B(sd * 3.6, s - .1, 1.6, 2.4, 2.55, 2.7, pick(['#C8463C', '#355F86', '#F3F3F3']))] }; },
  nobori: (sd, s) => { const c = pick(['#C8463C', '#355F86', '#F2C230', '#2E9E55', '#E86A75', '#FBF6EE']); return { w: 1.6, bx: [B(sd * 3.0, s, .08, .08, 0, 3.6, '#9AA0A6'), Object.assign(B(sd * 3.0, s + .06, .03, .7, 1.2, 3.4, c), { txt: pick(['のぼり', '名物', '本日', '祭', '団子', '相撲', '新鮮', '大売出し']), vert: 1, tc: c === '#FBF6EE' || c === '#F2C230' ? '#C8463C' : '#FBF6EE' })] }; },
  bookcart: (sd, s) => ({ w: 2.2, bx: [B(sd * 3.7, s, .9, 1.8, 0, .75, '#7A5538'), ...[0, 1, 2, 3, 4, 5].map(k => B(sd * 3.7, s + .1 + k * .28, .7, .22, .75, .95 + Math.random() * .15, pick(['#C8463C', '#355F86', '#E9E2D5', '#8A5530', '#5F9E5A']))), B(sd * 4.15, s, .1, 1.8, .75, 1.5, '#7A5538')] }),
  fishbox: (sd, s) => ({ w: 2.0, bx: [B(sd * 3.7, s, 1.0, 1.6, 0, .7, '#8A5530'), B(sd * 3.7, s + .05, .9, .7, .7, .95, '#F7F9FA'), B(sd * 3.7, s + .85, .9, .7, .7, .95, '#F7F9FA'), B(sd * 3.7, s + .1, .8, .6, .95, .97, '#C8D9E6'), B(sd * 3.7, s + .9, .8, .6, .95, .97, '#E9A07A')] }),
  cafe: (sd, s) => { const c = pick(['#355F86', '#2F6B4F', '#C8463C', '#F3EEE6']); return { w: 2.6, bx: [B(sd * 3.6, s + .5, .7, .7, .7, .76, '#F3F3F3'), B(sd * 3.6, s + .8, .1, .1, 0, .7, '#3B3B40'), B(sd * 3.0, s + .7, .4, .4, 0, .45, '#3B3B40'), B(sd * 4.2, s + .7, .4, .4, 0, .45, '#3B3B40'), B(sd * 3.6, s + .82, .06, .06, .76, 2.3, '#9AA0A6'), B(sd * 3.6, s, 1.9, 1.9, 2.2, 2.35, c)] }; },
  planter: (sd, s) => ({ w: 1.8, bx: [B(sd * 3.5, s, .9, 1.5, 0, .55, '#8F8A80'), B(sd * 3.5, s + .1, .8, 1.3, .55, .72, '#4C8A48')], spr: [{ lat: sd * 3.5, s: s + .7, y: .5, h: .8, w: 1.4, img: 'flowers' }] }),
  bamboo: (sd, s) => ({ w: 3, bx: [B(sd * 4.0, s, .3, 3, 0, 1.3, '#C9B98A')] }),
  kuroita: (sd, s) => ({ w: 3, bx: [B(sd * 4.2, s, .2, 3, 0, 2.15, '#2E2A27')] }),
  sl: (sd, s) => ({ w: 11, bx: [B(sd * 6.6, s, 2.4, 10, 0, .5, '#2B2B2B'), B(sd * 6.6, s + .5, 1.9, 7.2, .5, 2.6, '#1C1C20'), B(sd * 6.6, s + 7.3, 2.4, 2.6, .5, 3.4, '#1C1C20'), B(sd * 6.6, s + .9, .6, .6, 2.6, 3.4, '#1C1C20'), B(sd * 6.6, s + 3.0, .7, .7, 2.6, 3.0, '#1C1C20'),
    ...[1.5, 3.2, 4.9].map(k => B(sd * (6.6 - 1.25), s + k, .06, 1.4, .1, 1.5, '#C8463C')), B(sd * 6.6, s - .05, 1.2, .1, 1.4, 1.9, '#C9962F')] }),
  pinetree: (sd, s) => ({ w: 5, spr: [{ lat: sd * 3.5, s: s + .1, y: 0, h: 5.2, w: 4.6, img: 'canopy_pine', trunk: 1, gnd: .5 }] }),
  buoyS: (sd, s) => ({ w: 18, spr: [{ lat: sd * rand(10, 20), s, y: 0, h: .8, w: .7, img: 'buoy' }] }),
  scopeS: (sd, s) => ({ w: 8, bx: [B(sd * 3.8, s, .2, .2, 0, 1.1, '#46525E'), B(sd * 3.8, s - .2, .4, .7, 1.1, 1.4, '#9AA9B6')] }),
};
// which box of each wall piece carries a painted front: [box index, painting, texture width, height]
const FACE_OF = { tansu: [0, 'tansu', 160, 200], shelf: [0, 'shelf', 220, 220], sofa: [0, 'sofa', 280, 90], tvstand: [0, 'tv', 220, 60], counter: [0, 'counter', 300, 90], fridge: [0, 'fridge', 120, 220], rack: [0, 'rack', 140, 170],
  getabako: [0, 'getabako', 260, 100], cabinet: [0, 'cabinet', 160, 200], sofaO: [0, 'sofaO', 240, 70], kiosk: [0, 'kiosk', 260, 220], hedge: [1, 'hedge', 300, 60] , kuroita: [0, 'kuroita', 600, 430], bamboo: [0, 'bamboo', 600, 260], gateS: [0, 'gateS', 220, 210] };
// passers-by on the pavements: a few people walking either way, each a two-frame painted sprite
function buildWalkers(seg) {
  const th = seg.th; if (th.kind !== 'street' || th.noWalk) return; seg.walkers = [];
  const { s0, lEnd, rEnd } = sideEnds(seg); const n = th.crowd === 0 ? 0 : Math.round(rand(2, 4) * (th.crowd || 1));
  for (let i = 0; i < n; i++) {
    const sd = Math.random() < .5 ? -1 : 1, end = sd < 0 ? lEnd : rEnd; if (end - s0 < 12) continue;
    const dir = Math.random() < .5 ? 1 : -1, k = (Math.random() * PEOPLE.length) | 0, back = dir > 0 ? 1 : 0;
    const imgs = [0, 1, 2, 3].map(f => artKey('walker', k + '.' + f + '.' + back));
    const w = { lat: sd * rand(3.35, 4.1), s: rand(s0 + 3, end - 3), y: 0, w: .8, h: 1.8, img: imgs[0], imgs, walk: 1, ph: Math.random() * 10, vs: dir * rand(.9, 1.5), a0: s0 + 2, a1: end - 2, gnd: .3, keep: 1 };
    seg.spr.push(w); seg.walkers.push(w);
  }
}
function buildProps(seg) {
  const th = seg.th; if (th.kind === 'train') return trainProps(seg); if (!th.props || !th.props.length) return;
  const { s0, lEnd, rEnd } = sideEnds(seg);
  if (th.leftWall === 'trainside') platformDoors(seg, s0, lEnd);
  for (const sd of [-1, 1]) {
    if (th.core === sd || th.esc === sd) continue; /* 望遠鏡は窓の側だけ。エスカレーターの側には物を置かない */
    if (sd < 0 && th.leftWall === 'trainside') continue; // ホームドアの前（電車の側）には、ベンチや柱を置かない
    let s = s0 + (seg.first ? 4 : 2) + rand(0, 2); const end = (sd < 0 ? lEnd : rEnd) - 1.5;
    let lastPole = null;
    while (s < end) {
      let type = wpick(th.props); if (EVENT && th.kind !== 'train' && Math.random() < .12) type = EV_KITS[EVENT].deco; const p = PROPS[type](sd, s, th);
      if (s + (p.w || 2) > end) break;
      if (typeof PROP_DIM !== 'undefined' && PROP_DIM[type] && p.bx && p.bx.length) { // tall furniture painted whole (lamp posts, poles, signals): the picture faces the road
        const D = PROP_DIM[type], v = sd < 0 ? 'R' : 'L', key = 'pa|' + type + '|' + v, lat = p.bx[0] ? (p.bx[0].l0 + p.bx[0].l1) / 2 : sd * 3.2;
        if (!SPR[key] && !SPR_PEND[key]) { const ty = type; SPR_PEND[key] = () => PROP_ART[ty](false, v); SPR_PEND[key + 'N'] = () => PROP_ART[ty](true, v); }
        const lamp = p.bx.find(b => b.glow && b.y1 > 1.2);
        p.spr = (p.spr || []).filter(q => q.img !== 'glow' || type !== 'lampC').concat([{ lat: lat + sd * D.off, s: p.bx[0].s0, y: 0, w: D.w, h: D.h, img: key, pn: 1, gnd: .35, glow: 0 }]);
        if (lamp) seg.props.push({ bx: [], s0: p.bx[0].s0, s1: p.bx[0].s0 + .3, l0: lat - .2, l1: lat + .2, prop: 1, lamp, nodraw: 1 });
        p.bx = null;
      }
      if (typeof PROP_ART !== 'undefined' && PROP_ART[type] && p.bx && p.bx.length) { // a painted piece instead of a stack of boxes
        let l0 = 9e9, l1 = -9e9, s0 = 1e9, s1 = -1e9, y1 = 0; for (const b of p.bx) { l0 = Math.min(l0, b.l0); l1 = Math.max(l1, b.l1); s0 = Math.min(s0, b.s0); s1 = Math.max(s1, b.s1); y1 = Math.max(y1, b.y1); }
        const v = type === 'vending' ? p.bx[0].c : type === 'stall' ? p.bx[1].c : type === 'cafe' ? p.bx[5].c : type === 'nobori' ? p.bx[1].c + '|' + p.bx[1].txt : '', key = 'pa|' + type + '|' + v, nightOK = ['vending', 'andon', 'lampS', 'bonbori', 'jackO', 'xmasTree'].includes(type);
        if (!SPR[key] && !SPR_PEND[key]) { const ty = type; SPR_PEND[key] = () => PROP_ART[ty](false, v); if (nightOK) SPR_PEND[key + 'N'] = () => PROP_ART[ty](true, v); } // painted later in idle time (a new street is built at the turn)
        let spTop = 0; for (const q of p.spr || []) if (!q.glow && q.img !== 'glow') spTop = Math.max(spTop, q.y + q.h); // a crown or shade that was a separate sprite is part of the painting now
        const ww = Math.max(l1 - l0, (s1 - s0) * .85), hh = Math.max(y1, spTop * .95);
        p.spr = (p.spr || []).filter(q => q.glow || q.img === 'glow').concat([{ lat: (l0 + l1) / 2, s: (s0 + s1) / 2, y: 0, w: ww, h: hh, img: key, pn: nightOK ? 1 : 0, gnd: Math.max(.3, ww / 2), glow: 0 }]);
        p.bx = null;
      }
      if (p.bx && p.bx.length && FACE_OF[type]) { const [i, k, pw, ph] = FACE_OF[type]; if (p.bx[i]) Object.assign(p.bx[i], { face: k, faceW: pw, faceH: ph }); }
      if (p.bx && p.bx.length) seg.props.push(mkProp(seg, p.bx));
      if ((type === 'nakazuri' || type === 'strapS') && seg.wallH > 2.9) { const dy = seg.wallH - 2.9; for (const q of p.spr || []) q.y += dy; for (const l of p.ln || []) { l.a[2] += dy; l.b[2] += dy; } } /* 天井からつるす物（中づり広告・つり革）は、高くした天井に合わせて上げる（2026-11-15） */
      if (p.spr) for (const sp of p.spr) seg.spr.push(sp);
      if (p.ln) for (const l of p.ln) seg.lines.push(l);
      if (p.pole) { // overhead wires between poles
        if (lastPole != null) for (const y of [7.2, 7.5, 7.85]) { const m = (lastPole + s) / 2; seg.lines.push({ a: [lastPole, sd * 3.0, y], b: [m, sd * 3.0, y - .45], c: '#2B2B2B', w: .03 }); seg.lines.push({ a: [m, sd * 3.0, y - .45], b: [s, sd * 3.0, y], c: '#2B2B2B', w: .03 }); }
        lastPole = s;
      }
      s += (p.w || 2) + rand(.6, 3.2);
    }
  }
}

/* ================= obstacles =================
   kind: low (jump), high (slide under), block (dodge). */
function OB(L, s, w, d, y0, y1, c, glow) { return { l0: L - w / 2, l1: L + w / 2, s0: s, s1: s + d, y0, y1, c, glow }; }
// 立て看板の文字に、季節の言葉も（C-44）。その日の季節（ゲームの中の日）で変わる
const SIGN_SEASON = { spring: ['春の新作', 'お花見弁当'], summer: ['冷やし中華', 'かき氷'], autumn: ['秋の味覚', '新米入荷'], winter: ['あったか鍋', '冬季限定'] };
const OBS = {
  zabuton: L => ({ k: 'low', bx: [OB(L, 0, 1.25, 1.15, 0, .2, '#7E3552'), OB(L, .05, 1.15, 1.05, .2, .42, '#9C456A')] }),
  clock: L => ({ k: 'low', bx: [OB(L, 0, .8, .5, 0, .72, '#D9534F'), OB(L, -.02, .6, .02, .12, .62, '#FBF6EE'), OB(L - .25, .15, .16, .16, .72, .86, '#C9962F'), OB(L + .25, .15, .16, .16, .72, .86, '#C9962F')] }),
  chabudai: L => ({ k: 'high', y0: .6, solid3d: 1, bx: [OB(L - .6, .1, .12, .12, 0, .62, '#5E3820'), OB(L + .6, .1, .12, .12, 0, .62, '#5E3820'), OB(L - .6, 1, .12, .12, 0, .62, '#5E3820'), OB(L + .6, 1, .12, .12, 0, .62, '#5E3820'), OB(L, 0, 1.5, 1.22, .62, .76, '#8A5530')] }),
  futon: () => ({ k: 'low', full: 1, bx: [OB(0, 0, 5.2, 1.0, 0, .46, '#F2F2F7'), OB(0, .35, 5.2, .3, .46, .5, '#7FA6D6')] }),
  box: L => ({ k: 'block', solid3d: 1, picArt: 'box', artW: 1.32, artH: 1.54, bx: [Object.assign(OB(L, 0, 1.3, 1.1, 0, .74, '#C79A6C'), { face: 'cbox', faceW: 120, faceH: 70, faceAll: 1 }), Object.assign(OB(L + .04, .03, 1.2, 1.0, .74, 1.5, '#C49668'), { face: 'cbox', faceW: 110, faceH: 70, faceAll: 1 }), OB(L + .04, .03, .26, 1.0, 1.5, 1.515, '#E2BB8D')] }), // [O3] 段ボールの山：2 つ重ね（少しずれる）・テープ・印刷のマーク
  slipper: L => ({ k: 'low', bx: [OB(L - .25, 0, .4, .85, 0, .3, '#6FA3C9'), OB(L + .25, .15, .4, .85, 0, .3, '#6FA3C9'), OB(L - .25, .05, .42, .3, .3, .36, '#4E77A0'), OB(L + .25, .2, .42, .3, .3, .36, '#4E77A0')] }),
  roomba: L => ({ k: 'low', mv: 3.2, bx: [OB(L, 0, .95, .95, 0, .26, '#33343A'), OB(L, .22, .5, .5, .26, .31, '#6A6A72'), OB(L, -.01, .3, .02, .1, .2, '#7FD06A', 1)] }),
  toys: L => ({ k: 'low', bx: [OB(L - .35, 0, .5, .5, 0, .5, '#E86A75'), OB(L + .3, .2, .5, .5, 0, .5, '#4E77A0'), OB(L, .1, .45, .45, .5, .82, '#F2C230')] }),
  table: L => ({ k: 'high', y0: .62, solid3d: 1, bx: [OB(L - .62, .1, .12, .12, 0, .64, '#7A5A48'), OB(L + .62, .1, .12, .12, 0, .64, '#7A5A48'), OB(L - .62, 1.1, .12, .12, 0, .64, '#7A5A48'), OB(L + .62, 1.1, .12, .12, 0, .64, '#7A5A48'), OB(L, 0, 1.5, 1.35, .64, .8, '#B08155')] }),
  pot: L => ({ k: 'low', bx: [OB(L, 0, .95, .95, 0, .62, '#9AA9B6'), OB(L, .1, 1.05, .75, .62, .68, '#7D8B97'), OB(L, .4, .2, .2, .68, .8, '#46525E')] }),
  noren: () => ({ k: 'high', full: 1, y0: .64, bx: [OB(-1.5, 0, 1.5, .06, .64, 2.55, '#355F86'), OB(0, 0, 1.5, .06, .64, 2.55, '#2F5579'), OB(1.5, 0, 1.5, .06, .64, 2.55, '#355F86'), OB(0, -.02, 5.6, .1, 2.55, 2.65, '#5E4535'), OB(0, -.03, .9, .02, 1.3, 2.0, '#FBF6EE')] }),
  shoes: L => ({ k: 'low', bx: [OB(L - .25, 0, .4, .8, 0, .32, '#EDEDED'), OB(L + .25, .1, .4, .8, 0, .32, '#EDEDED'), OB(L - .25, 0, .42, .3, .2, .34, '#C8463C'), OB(L + .25, .1, .42, .3, .2, .34, '#C8463C')] }),
  umbrella: L => ({ k: 'block', solid3d: 1, bx: [Object.assign(OB(L, 0, .8, .8, 0, .8, '#9AA0A6'), { face: 'ustand', faceW: 60, faceH: 60, faceAll: 1 }), ...[[-.2, .2, '#C8463C', 1.85], [.18, .3, '#F2C230', 1.7], [0, .5, '#3B2A20', 1.8], [-.05, .15, '#E9EDF0', 1.6], [.22, .55, '#355F86', 1.75]].map(([x, q, c, t]) => OB(L + x, q, .1, .1, .5, t, c)), ...[[-.2, .2], [0, .5]].map(([x, q]) => OB(L + x - .06, q, .14, .04, 1.8, 1.86, '#3B2A20'))] }), // [O9] かさ立て：金属の筒・5 本のかさ（色と高さがばらばら）・柄の曲がり
  step: () => ({ k: 'low', full: 1, bx: [OB(0, 0, 9.2, .9, 0, .42, '#8A6A48'), OB(0, -.02, 9.2, .02, .36, .42, '#B08155')] }),
  cone: L => ({ k: 'low', solid3d: 1, picArt: 'cone', artW: 0.78, artH: 0.76, bx: [OB(L, 0, .75, .75, 0, .07, '#2B2B2B'), ...Array.from({ length: 9 }, (_, i) => { const w = .5 - i * .042, y0 = .07 + i * .074; return Object.assign(OB(L, .375 - w / 2, w, w, y0, y0 + .076, i === 3 || i === 4 ? '#F4F6F8' : '#F07C2E'), { face: i === 3 || i === 4 ? 'cone1' : 'cone0', faceW: 40, faceH: 16, faceAll: 1, noEdge: 1 }); }), OB(L, .34, .07, .07, .74, .8, '#F07C2E')] }), // 2026-11-17：絵をやめて立体に（[O1] 下ほど太いコーン・反射の白い帯・黒い台）
  bike: L => ({ k: 'block', mv: 4.5, art: 'bike', av: { s: pick(['#4E77A0', '#C8463C', '#5F9E5A', '#E9EDF0', '#F2C230']), p: pick(['#2F3B47', '#3B3B40', '#6B5A50']), h: pick(['#2B2B2B', '#FBF6EE', '#3A73C2']) }, artW: .72, artH: 1.95, bx: [OB(L, 0, .12, .62, 0, .62, '#222'), OB(L, 1.2, .12, .62, 0, .62, '#222'), OB(L, .25, .14, 1.3, .55, .7, '#3A6FB0'), OB(L, .2, .55, .12, .95, 1.0, '#3B3B3B'), OB(L, .3, .12, .12, .6, 1.0, '#3A6FB0'), OB(L, 1.1, .3, .25, .75, .85, '#2B2B2B'), OB(L, -.02, .12, .02, .6, .68, '#F2C230', 1)] }),
  bags: L => ({ k: 'low', bx: [OB(L - .3, 0, .7, .8, 0, .66, '#5C8FC4'), OB(L + .3, .15, .7, .8, 0, .6, '#6FA3D6'), OB(L - .3, .3, .12, .12, .66, .76, '#5C8FC4'), OB(L - .3, .05, .5, .04, .2, .5, '#F2C230'), OB(L + .3, .2, .5, .04, .15, .45, '#FBF6EE')] }),
  sign: L => ({ k: 'block', solid3d: 1, bx: [OB(L, 0, 1.15, .5, 0, .08, '#5A3D27'), Object.assign(OB(L, .05, 1.1, .14, .08, 1.45, '#F6EBDC'), { txt: pick(['営業中', 'OPEN', '本日特売', 'ランチ'].concat(SIGN_SEASON[(typeof adSeason === 'function' ? adSeason() : '')] || [])) }), OB(L, .2, 1.1, .3, .08, 1.35, '#6B4631'), OB(L, .05, 1.16, .16, 1.45, 1.55, '#5A3D27')] }),
  pillar: L => ({ k: 'block', solid3d: 1, bx: [Object.assign(OB(L, 0, 1.25, 1.25, 0, 3.6, '#D6D6D0'), { face: 'tilep', faceW: 80, faceH: 220, faceAll: 1 }), OB(L - .04, -.04, 1.33, 1.33, 0, .12, '#8A857C'), Object.assign(OB(L, -.02, 1.0, .02, 1.4, 2.0, '#2F5579'), { txt: tr('出口', 'EXIT'), tc: '#FBF6EE' })] }), // [O8] 柱：タイルの目地・すその幅木・出口の案内
  plant: L => ({ k: 'block', bx: [OB(L, 0, .85, .85, 0, .62, '#B08155'), OB(L, -.1, 1.15, 1.05, .62, 1.7, '#5F9E5A'), OB(L, .1, .8, .8, 1.7, 2.0, '#4F8A4A')] }), // 植木は絵のまま（箱を積むと、四角いブロックの木に見える）
  papers: L => ({ k: 'low', solid3d: 1, bx: [Object.assign(OB(L, 0, 1.0, .8, 0, .28, '#FFFFFF'), { face: 'paperE', faceW: 100, faceH: 28, faceAll: 1, noEdge: 1 }), Object.assign(OB(L + .05, .05, .98, .78, .28, .56, '#F4F4F0'), { face: 'paperE', faceW: 100, faceH: 28, faceAll: 1, noEdge: 1 }), OB(L - .04, .02, .2, .02, .1, .5, '#C8463C'), OB(L + .1, .2, .5, .4, .56, .58, '#FBF6EE')] }), // [O7] 書類の山：紙の重なりの筋・はさんだ赤い付せん・上にのった 1 枚
  paperTall: L => ({ k: 'block', bx: [OB(L, 0, 1.05, .85, 0, .65, '#FFFFFF'), OB(L + .08, .04, 1.0, .82, .65, 1.25, '#F4F4F0'), OB(L - .06, 0, 1.0, .82, 1.25, 1.85, '#FFFFFF'), OB(L, -.02, .9, .02, .9, .95, '#D6A23C')] }),
  chair: L => ({ k: 'low', bx: [OB(L, .1, .8, .8, 0, .1, '#2B2B2B'), OB(L, .4, .1, .1, .1, .42, '#8A9098'), OB(L, 0, .95, .95, .42, .55, '#C8463C'), OB(L, .75, .95, .14, .55, .8, '#C8463C')] }),
  mtable: L => ({ k: 'high', y0: .62, solid3d: 1, bx: [OB(L - .68, .3, .1, .7, 0, .62, '#9AA9B6'), OB(L + .68, .3, .1, .7, 0, .62, '#9AA9B6'), OB(L, 0, 1.55, 1.4, .62, .76, '#E9E4DA')] }),
  wboard: L => ({ k: 'high', y0: .66, solid3d: 1, bx: [OB(L - .7, .1, .08, .5, 0, .66, '#9AA9B6'), OB(L + .7, .1, .08, .5, 0, .66, '#9AA9B6'), OB(L - .7, -.05, .3, .6, 0, .05, '#7D8B97'), OB(L + .7, -.05, .3, .6, 0, .05, '#7D8B97'), OB(L, 0, 1.5, .1, .66, 2.0, '#FFFFFF'), OB(L, -.02, 1.5, .04, .66, .74, '#9AA9B6'), OB(L - .2, -.03, .6, .02, 1.4, 1.46, '#4E77A0'), OB(L + .15, -.03, .5, .02, 1.1, 1.16, '#C8463C')] }),
  mug: L => ({ k: 'low', bx: [OB(L, 0, .8, .8, 0, .82, '#FBF6EE'), OB(L + .48, .25, .16, .3, .22, .66, '#FBF6EE'), OB(L, .1, .62, .62, .82, .83, '#6B4631'), OB(L, -.01, .8, .02, .5, .6, '#4E77A0')] }),
  copier: L => ({ k: 'block', solid3d: 1, bx: [Object.assign(OB(L, 0, 1.4, 1.15, 0, 1.2, '#D9DDE2'), { face: 'copier', faceW: 140, faceH: 120, faceAll: 1 }), OB(L, .15, 1.4, .95, 1.2, 1.38, '#9AA9B6'), OB(L + .3, -.02, .5, .02, .8, 1.0, '#46525E'), OB(L - .4, -.02, .2, .02, .95, 1.05, '#7FD06A', 1)] }), // [O12] 複合機：紙のトレイ 3 段・前のふた・すき間のかげ
  bench: L => ({ k: 'low', solid3d: 1, picArt: 'bench', artW: 1.4, artH: 0.56, bx: [OB(L - .58, .08, .06, .55, 0, .4, '#3B3F46'), OB(L + .58, .08, .06, .55, 0, .4, '#3B3F46'), OB(L, .1, 1.3, .5, .36, .4, '#3B3F46'), ...[0, 1, 2, 3].map(k => Object.assign(OB(L, .02 + k * .17, 1.4, .14, .4, .47, '#B08155'), { face: 'wood', faceW: 140, faceH: 12, faceAll: 1, noEdge: 1 }))] }), // [O4] ベンチ：木の板 4 枚（すき間）・鉄の脚と横の支え
  pole: L => ({ k: 'block', bx: [OB(L, .3, .16, .16, 0, 2.9, '#C9CDD2'), OB(L, .28, .3, .3, 1.1, 1.18, '#80C241')] }),
  suitcase: L => { const c = pick(['#4E77A0', '#C8463C', '#3B3F46', '#E9EDF0', '#5F9E5A']); return { k: 'low', solid3d: 1, av: { c }, bx: [Object.assign(OB(L, 0, .95, .42, .07, .72, c), { face: 'case|' + c, faceW: 90, faceH: 64, faceAll: 1 }), OB(L - .2, .14, .04, .04, .72, .95, '#8A8F94'), OB(L + .2, .14, .04, .04, .72, .95, '#8A8F94'), OB(L, .13, .44, .06, .95, 1.0, '#2B2B2B'), ...[[-.4, .02], [.4, .02], [-.4, .34], [.4, .34]].map(([x, q]) => OB(L + x, q, .07, .07, 0, .07, '#1C1919'))] }; }, // [O5] スーツケース：たてのみぞ・角の金具・のびる取っ手・4 つの車輪
  bag: L => ({ k: 'low', solid3d: 1, bx: [Object.assign(OB(L, 0, .9, .55, 0, .45, '#6B4631'), { face: 'bag', faceW: 90, faceH: 45, faceAll: 1 }), OB(L - .18, .25, .05, .05, .45, .6, '#3B2A20'), OB(L + .18, .25, .05, .05, .45, .6, '#3B2A20'), OB(L, .25, .41, .05, .58, .63, '#3B2A20')] }), // [O6] かばん：革のつや・ぬい目・金具・2 本の持ち手
  barrier: L => ({ k: 'low', solid3d: 1, picArt: 'barrier', artW: 1.55, artH: 0.92, bx: [OB(L - .62, -.15, .1, .6, 0, .05, '#3B3B3B'), OB(L + .62, -.15, .1, .6, 0, .05, '#3B3B3B'), OB(L - .62, .1, .08, .1, .05, .9, '#9AA0A6'), OB(L + .62, .1, .08, .1, .05, .9, '#9AA0A6'), Object.assign(OB(L, .08, 1.4, .1, .62, .9, '#F2C230'), { face: 'stripe', faceW: 160, faceH: 24, faceAll: 1, noEdge: 1 }), Object.assign(OB(L, .08, 1.4, .1, .3, .48, '#F2C230'), { face: 'stripe', faceW: 160, faceH: 16, faceAll: 1, noEdge: 1 }), OB(L + .55, .07, .14, .12, .9, 1.02, '#E85A2E', 1)] }), // [O2] 工事の柵：黄と黒のななめのしまの横板 2 枚・脚・足の台・上の赤いランプ
  rope: () => ({ k: 'low', full: 1, bx: [OB(-2.45, 0, .22, .22, 0, .55, '#C9962F'), OB(2.45, 0, .22, .22, 0, .55, '#C9962F'), OB(-2.45, -.05, .45, .45, 0, .06, '#8F7A3A'), OB(2.45, -.05, .45, .45, 0, .06, '#8F7A3A'), OB(0, .04, 4.8, .1, .3, .4, '#C8463C'), OB(0, .04, 4.8, .06, .12, .18, '#C8463C')] }),
  telescope: L => ({ k: 'block', bx: [OB(L, 0, .75, .75, 0, .25, '#3B4650'), OB(L, .1, .5, .5, .25, 1.2, '#46525E'), OB(L, -.05, .6, .9, 1.2, 1.55, '#9AA9B6'), OB(L, -.07, .3, .02, 1.3, 1.45, '#2F3B47')] }),
  jokoro: L => ({ k: 'block', bx: [OB(L, 0, 1.3, 1.3, 0, .9, '#6E5A3A'), OB(L, .15, 1.0, 1.0, .9, 1.25, '#57472E'), OB(L, .4, .5, .5, 1.25, 1.9, '#6E5A3A')] }),
  rickshaw: L => ({ k: 'block', mv: 3.6, bx: [OB(L - .62, .4, .12, 1.0, 0, 1.0, '#2B2B2B'), OB(L + .62, .4, .12, 1.0, 0, 1.0, '#2B2B2B'), OB(L, .3, 1.15, 1.0, .7, 1.05, '#B5302A'), OB(L, .9, 1.15, .2, 1.05, 1.7, '#2B2B2B'), OB(L, -.6, .1, 1.0, .6, .66, '#3B2A20')] }),
  kaminarimon: () => ({ k: 'high', y0: .72, hb: [-.82, .82, 2.3], bx: [OB(-3.4, 0, .5, .6, 0, 4.2, '#C0392B'), OB(3.4, 0, .5, .6, 0, 4.2, '#C0392B'), OB(0, -.15, 8.4, .9, 4.2, 4.6, '#3B2A20'), OB(0, -.25, 9.2, 1.1, 4.6, 4.75, '#2B2B2B'),
    OB(0, 0, 1.6, 1.35, .9, 2.3, '#D33A2C', 1), Object.assign(OB(0, -.01, 1.6, .02, 1.2, 2.05, '#D33A2C', 1), { txt: '雷門', tc: '#1A0F0A', vert: 0 }), OB(0, 0, 1.25, 1.15, .72, .9, '#2B2B2B'), OB(0, 0, 1.25, 1.15, 2.3, 2.48, '#2B2B2B'), OB(0, .5, .1, .1, 2.48, 4.2, '#2B2B2B')] }),
  parasol: L => ({ k: 'block', bx: [OB(L, .3, .8, .8, 0, .72, '#FBF6EE'), OB(L, .28, .84, .84, .66, .72, '#E9E2D5'), OB(L, .6, .1, .1, .72, 2.2, '#9AA0A6'), OB(L, -.1, 1.6, 1.5, 2.0, 2.2, pick(['#C8463C', '#355F86', '#F2C230'])), OB(L - .55, .4, .38, .38, 0, .8, '#9C7652')] }),
  flowers: L => ({ k: 'low', bx: [OB(L, 0, 1.1, 1.0, 0, .55, '#D9D2C6'), OB(L, .1, 1.0, .8, .55, .75, '#E86A75')] }),
  crate: L => { const tall = Math.random() < .4; return { k: tall ? 'block' : 'low', solid3d: 1, bx: (tall ? [OB(L, 0, .9, .9, 0, .5, '#E0A030'), OB(L, 0, .9, .9, .5, 1.0, '#C8463C'), OB(L, .05, .85, .85, 1.0, 1.5, '#E0A030')] : [OB(L, 0, .9, .9, 0, .5, '#E0A030'), OB(L, 0, .9, .9, .5, .82, '#C8463C')]).map(b => Object.assign(b, { face: 'crate|' + b.c, faceW: 72, faceH: 40, faceAll: 1 })) }; }, // one roll: a 3-high stack is dodged, a 2-high one is jumped (two separate rolls used to make some 3-high stacks 'jump over' ones you can't clear)
  stoolsO: L => ({ k: 'low', bx: [OB(L - .35, 0, .45, .45, 0, .52, '#B5302A'), OB(L + .35, .2, .45, .45, 0, .52, '#B5302A'), OB(L - .35, 0, .5, .5, .52, .6, '#C0392B'), OB(L + .35, .2, .5, .5, .52, .6, '#C0392B')] }),
  gachaO: L => ({ k: 'block', solid3d: 1, bx: [Object.assign(OB(L - .3, 0, .6, .7, 0, .9, '#E86A75'), { face: 'gacha|#E86A75', faceW: 60, faceH: 90, faceAll: 1 }), Object.assign(OB(L + .3, 0, .6, .7, 0, .9, '#4E77A0'), { face: 'gacha|#4E77A0', faceW: 60, faceH: 90, faceAll: 1 }), Object.assign(OB(L - .3, 0, .6, .7, .9, 1.6, '#DDEFF8'), { face: 'gcap', faceW: 60, faceH: 70, faceAll: 1 }), Object.assign(OB(L + .3, 0, .6, .7, .9, 1.6, '#DDEFF8'), { face: 'gcap', faceW: 60, faceH: 70, faceAll: 1 }), OB(L - .3, 0, .62, .72, 1.6, 1.66, '#E86A75'), OB(L + .3, 0, .62, .72, 1.6, 1.66, '#4E77A0')] }), // [O13] ガチャの機械：中のカプセル・ハンドル・お金を入れる所・取り出し口・上のふた
  // a blue picnic sheet with lunch boxes and a cooler: jump over it
  picnic: L => ({ k: 'low', bx: [OB(L, 0, 1.7, 1.5, 0, .04, '#3A73C2'), OB(L - .4, .3, .5, .38, .04, .42, '#E9EDF0'), OB(L - .4, .3, .52, .4, .42, .48, '#3A73C2'), OB(L + .35, .5, .5, .4, .04, .16, '#2B2B2B'), OB(L + .35, .5, .5, .4, .16, .2, '#C8463C'), OB(L + .3, .05, .2, .2, .04, .32, '#5F9E5A')] }),
  // a photographer's tripod, set up to shoot the blossoms
  tripod: L => ({ k: 'block', bx: [OB(L - .3, .1, .06, .06, 0, 1.35, '#2B2B2B'), OB(L + .3, .1, .06, .06, 0, 1.35, '#2B2B2B'), OB(L, .5, .06, .06, 0, 1.35, '#2B2B2B'), OB(L, .2, .4, .3, 1.35, 1.62, '#1E1E22'), OB(L, .05, .16, .2, 1.4, 1.56, '#46525E'), OB(L, .15, .8, .45, 0, .72, '#3B4650'), OB(L, .14, .82, .1, .72, .8, '#2B2B2B')] }),
  stroller: L => ({ k: 'low', hitTop: .9, mv: 1.6, solid3d: 1, bx: [...[[-.3, 0], [.3, 0], [-.3, .7], [.3, .7]].map(([x, q]) => Object.assign(OB(L + x, q, .07, .2, 0, .2, '#2B2B2B'), { face: 'whl', faceW: 32, faceH: 32, noEdge: 1 })), OB(L - .28, .1, .04, .7, .2, .26, '#8A8F94'), OB(L + .28, .1, .04, .7, .2, .26, '#8A8F94'), Object.assign(OB(L, .35, .66, .8, .26, .75, '#B9C7D6'), { face: 'quilt', faceW: 70, faceH: 50, faceAll: 1 }), OB(L, .55, .7, .45, .75, 1.15, '#8DA2B8'), OB(L, .48, .72, .12, .75, 1.18, '#7A8EA4'), OB(L - .3, -.12, .04, .04, .7, 1.05, '#46525E'), OB(L + .3, -.12, .04, .04, .7, 1.05, '#46525E'), OB(L, -.15, .64, .06, 1.02, 1.1, '#46525E')] }), // [O11] ベビーカー：タイヤ 4 つ（ホイールの絵）・下のわく・キルトの座席・ほろ・ほろのふち・持ち手の 2 本の棒
  snowball: L => ({ k: 'low', mv: 3.0, bx: [OB(L, 0, .95, .95, 0, .9, '#F2F5F8')] }), // 雪の日だけ、転がってくる雪玉（B-28）。ジャンプでこえる
  leafpile: L => ({ k: 'low', bx: [OB(L, 0, 1.3, 1.1, 0, .32, '#E8B923'), OB(L, .2, .9, .7, .32, .55, '#F2CD45')] }),
  stoneLanternO: L => ({ k: 'block', bx: [OB(L, 0, .8, .8, 0, .3, '#8F8A80'), OB(L, .25, .3, .3, .3, 1.3, '#8F8A80'), OB(L, 0, .8, .8, 1.3, 1.7, '#A09B90', 1), OB(L, -.1, 1.0, 1.0, 1.7, 1.9, '#7A756D')] }),
  bridge: () => { const c = pick([['#C0392B', '吾妻橋'], ['#3A6FB0', '駒形橋'], ['#5F9E5A', '厩橋'], ['#E9D9BF', '蔵前橋']]);
    return { k: 'high', full: 1, y0: .72, hb: [-ROAD, ROAD, 1.8], bx: [OB(0, 0, 160, 2.4, .72, 1.5, c[0]), Object.assign(OB(0, -.01, 4, .02, .8, 1.4, c[0]), { txt: c[1], tc: '#FBF6EE' }), OB(0, .1, 160, 2.2, 1.5, 1.8, '#E9E9E4'), OB(-9, .3, 2, 1.8, -3, .72, '#8F8A80'), OB(9, .3, 2, 1.8, -3, .72, '#8F8A80'), OB(-28, .3, 2.4, 1.8, -3, .72, '#8F8A80'), OB(28, .3, 2.4, 1.8, -3, .72, '#8F8A80')] }; },
  ring: L => ({ k: 'low', bx: [OB(L, 0, .9, .9, 0, .25, '#F07C2E'), OB(L, .2, .5, .5, .25, .28, '#FBF6EE')] }),
  // a shared electric kick scooter rolling toward you (generic, no brand)
  kick: L => { const shirt = pick(['#4E77A0', '#C8463C', '#5F9E5A', '#E9EDF0', '#3B3B40', '#D9A21B']), pants = pick(['#2F3B47', '#3B3B40', '#6B5A50']); return { k: 'block', mv: 4.6, bx: [OB(L, 0, .28, 1.1, .08, .2, '#2F3B47'), OB(L, -.05, .16, .16, 0, .14, '#1C1919'), OB(L, 1.0, .16, .16, 0, .14, '#1C1919'), OB(L, -.02, .1, .1, .2, 1.05, '#3FA37A'), OB(L, -.04, .62, .08, 1.0, 1.06, '#2F3B47'), OB(L, -.06, .14, .02, .8, .9, '#FFF3D6', 2), // a rider standing on the deck, hands on the bar
    OB(L - .1, .35, .13, .16, .2, 1.0, pants), OB(L + .1, .5, .13, .16, .2, 1.0, pants), OB(L, .4, .42, .28, 1.0, 1.62, shirt), OB(L, .12, .44, .34, 1.3, 1.42, shirt), OB(L, .42, .24, .24, 1.64, 1.9, '#F1D9C4'), OB(L, .44, .28, .28, 1.86, 2.0, pick(['#2B2B2B', '#FBF6EE', '#3A73C2']))], art: 'kick', av: { s: shirt, p: pants, h: pick(['#2B2B2B', '#FBF6EE', '#3A73C2', '#C8463C']) }, artW: .86, artH: 2.05 }; },
  // everyday cars: sedan, hybrid hatchback, SUV, kei car, taxi, van (generic shapes, no badges)
  car: L => { const t = pick(['sedan', 'hybrid', 'suv', 'kei', 'taxi', 'van']), c = t === 'taxi' ? pick(['#F2C230', '#2B2B2B', '#2F6B4F']) : pick(['#F3F3F3', '#2B2B2B', '#9AA0A6', '#C8463C', '#355F86', '#B9C3CC']);
    const dims = { sedan: [1.75, 4.6, .55, 1.0, 1.45], hybrid: [1.75, 4.5, .55, 1.0, 1.48], suv: [1.85, 4.6, .6, 1.2, 1.75], kei: [1.48, 3.4, .5, 1.2, 1.75], taxi: [1.7, 4.5, .55, 1.0, 1.5], van: [1.7, 4.7, .5, 1.6, 1.95] }[t];
    const [w, len, wh, bodyTop, roof] = dims, cabinS = t === 'hybrid' ? .9 : t === 'kei' || t === 'van' ? .2 : 1.0, cabinL = t === 'kei' || t === 'van' ? len - .5 : t === 'hybrid' ? 2.6 : 2.3;
    /* 2026-11-17 オーナー：「車などもただの絵にするのではなく、現実に近い立体に」。前は箱の上に 1 枚の絵（いつもこちらを向く板）を貼っていた。
       立体の箱に、面ごとの絵を貼る：横＝ドアの継ぎ目・取っ手・タイヤの上の丸いくぼみ・すそ、前＝グリル・ライト・ナンバー、窓＝柱とガラスの映りこみ、タイヤ＝ゴムとホイール */
    const key = t + '|' + c, bx = [Object.assign(OB(L, 0, w, len, .22, bodyTop, c), { face: 'cvS|' + key, faceW: 360, faceH: 64, face2: 'cvF|' + key, face2W: 180, face2H: 64, face2F: 1 }),
      Object.assign(OB(L, cabinS, w * .92, cabinL, bodyTop, roof, c), { face: 'cwS|' + key, faceW: 240, faceH: 48, face2: 'cwF|' + key, face2W: 180, face2H: 48, face2F: 1 }),
      OB(L, -.04, w * 1.02, .12, .26, .5, '#2B2B2B'), OB(L, len - .08, w * 1.02, .12, .26, .5, '#2B2B2B'), OB(L, cabinS + .2, w * .5, cabinL - .4, roof, roof + .02, '#F4F6F8'),
      OB(L - w * .38, -.02, .3, .02, bodyTop - .3, bodyTop - .14, '#FFF6DC', 2), OB(L + w * .38, -.02, .3, .02, bodyTop - .3, bodyTop - .14, '#FFF6DC', 2), // 夜に光るライト（絵のライトの位置に重ねる）
      OB(L - w * .5, cabinS + .05, .14, .14, bodyTop - .02, bodyTop + .12, c), OB(L + w * .5, cabinS + .05, .14, .14, bodyTop - .02, bodyTop + .12, c)]; // ドアミラー
    for (const [x, q] of [[L - w * .44, .48], [L + w * .44, .48], [L - w * .44, len - 1.12], [L + w * .44, len - 1.12]]) bx.push(Object.assign(OB(x, q, .2, .64, 0, .64, '#1C1919'), { face: 'whl', faceW: 64, faceH: 64, noEdge: 1 })); // タイヤ（横から見るとホイール）
    if (t === 'taxi') bx.push(Object.assign(OB(L, cabinS + .9, .6, .3, roof, roof + .22, '#FBF6EE', 2), { txt: 'TAXI', tc: '#2B2B2B' }));
    // every ordinary car is taller than the runners: dodged, never jumped (one simple rule: low things you hop, tall things you go round). Only the low sports car is hopped
    return { k: 'block', car: 0, mv: 6.5, bx, av: { t, c }, solid3d: 1, picArt: 'car', artW: w * 1.04, artH: roof + (t === 'taxi' ? .24 : .02) }; },
  // a low red supercar (generic shape, no badge); like every car, something to dodge
  supercar: L => { const c = pick(['#D42A1E', '#D42A1E', '#F2C230', '#F3F3F3']);
    return { k: 'low', car: 1, vault: 1.4, mv: 10, roar: 1, bx: [Object.assign(OB(L, 0, 1.95, 4.5, .14, .62, c), { face: 'cvS|sport|' + c, faceW: 360, faceH: 50, face2: 'cvF|sport|' + c, face2W: 180, face2H: 50, face2F: 1 }), Object.assign(OB(L, 1.3, 1.7, 1.9, .62, 1.0, c), { face: 'cwS|sport|' + c, faceW: 220, faceH: 40, face2: 'cwF|sport|' + c, face2W: 160, face2H: 40, face2F: 1 }), OB(L, 3.9, 1.9, .25, .62, .78, '#2B2B2B'),
      OB(L - .7, -.02, .34, .02, .4, .5, '#FFF6DC', 2), OB(L + .7, -.02, .34, .02, .4, .5, '#FFF6DC', 2), OB(L, -.02, 1.1, .02, .2, .3, '#2B2B2B'),
      ...[[L - .9, .55], [L + .9, .55], [L - .9, 3.2], [L + .9, 3.2]].map(([x, q]) => Object.assign(OB(x, q, .18, .68, 0, .62, '#1C1919'), { face: 'whl', faceW: 64, faceH: 64, noEdge: 1 }))], av: { c }, solid3d: 1, picArt: 'supercar', artW: 2.0, artH: 1.08 }; }, // 2026-11-17：絵をやめて、面ごとの絵を貼った立体に
  gates: null, ogates: null,
};
// every obstacle gets its illustration (the boxes stay as the collision shape); [width, height] in metres
const ART_SPEC = { snowball: [1.0, .95], kaminarimon: [9.2, 4.75], futon: [5.2, .62], noren: [5.6, 2.75], step: [9.2, .45], pillar: [1.3, 3.6], pole: [.55, 2.9], bag: [.95, .7], rope: [5.4, .62], jokoro: [1.35, 1.95], picnic: [1.8, .55], ring: [.95, .3], papers: [1.02, .58], paperTall: [1.08, 1.88], plant: [1.15, 2.0], chair: [.95, .8], suitcase: [.95, .8], bags: [1.35, .7], crate: [.92, 1], stroller: [.8, 1.18], sign: [1.2, 1.56],
  parasol: [1.75, 2.2], flowers: [1.1, .75], leafpile: [1.35, .56], stoolsO: [1.2, .6], umbrella: [.8, 1.9], copier: [1.42, 1.38], mug: [.95, .85], toys: [1.0, .84], zabuton: [1.25, .42], pot: [1.05, .82],
  clock: [.8, .86], telescope: [.78, 1.55], gachaO: [1.22, 1.6], tripod: [.85, 1.62], stoneLanternO: [1.0, 1.9], rickshaw: [1.3, 1.75], table: [1.5, .82], chabudai: [1.5, .78], mtable: [1.55, .78],
  wboard: [1.6, 2.0], shoes: [.92, .36], slipper: [.92, .36], roomba: [.95, .32] };
for (const k in ART_SPEC) { const f = OBS[k]; if (!f) continue; OBS[k] = L => { const o = f(L); if (o.solid3d && !o.picArt) { o.picArt = k; } if (!o.art) { if (!o.solid3d) { o.art = k; } o.artW = ART_SPEC[k][0]; o.artH = ART_SPEC[k][1]; o.av = o.av || {}; /* 立体の物も、結果の画面の絵のために av（色・数・文字）は用意する */
  if (k === 'suitcase') o.av.c = o.bx[0].c; if (k === 'crate') { o.av.n = o.k === 'block' ? 3 : 2; o.artH = o.k === 'block' ? 1.5 : .82; }
  if (k === 'sign') o.av.t = (o.bx.find(b => b.txt) || {}).txt || 'OPEN'; if (k === 'parasol') o.av.c = o.bx[3].c; } return o; }; }
function gateRow(L, closed, office) {
  const post = office ? '#46525E' : '#9AA9B6', flap = office ? '#A9BDCC' : '#C8463C';
  const bx = [OB(L - .72, 0, .16, 1.0, 0, 1.0, post), OB(L + .72, 0, .16, 1.0, 0, 1.0, post), OB(L - .72, -.01, .16, .02, .75, .85, closed ? '#C8463C' : '#7FD06A', 1)];
  if (closed) bx.push(OB(L, .45, 1.28, .08, .35, 1.25, flap));
  return { k: closed ? 'block' : 'deco', bx };
}
function makeObs(seg, type, s, lane, extra) {
  const L = lane == null ? 0 : LANES[lane];
  const o = type === 'gates' || type === 'ogates' ? gateRow(L, extra, type === 'ogates') : OBS[type](L);
  if (type === 'pole' && o.artH && seg.wallH > o.artH && (seg.th.kind === 'train' || seg.th.kind === 'room')) { o.artH = seg.wallH; for (const b of o.bx) if (b.y0 === 0) b.y1 = Math.max(b.y1, seg.wallH); } /* 手すりの棒は天井まで（2026-11-15：天井を高くした） */
  o.bx.forEach(b => { b.s0 += s; b.s1 += s; b.cc = C(b.c); });
  let l0 = 9, l1 = -9, s0 = 1e9, s1 = -1e9, y1 = 0;
  for (const b of o.bx) { l0 = Math.min(l0, b.l0); l1 = Math.max(l1, b.l1); s0 = Math.min(s0, b.s0); s1 = Math.max(s1, b.s1); if (b.y0 < 2.5) y1 = Math.max(y1, Math.min(b.y1, 3.5)); }
  if (o.full) { l0 = -ROAD; l1 = ROAD; }
  if (o.hb) { l0 = o.hb[0]; l1 = o.hb[1]; y1 = o.hb[2]; s1 = Math.min(s1, s0 + 2.6); }
  Object.assign(o, { type, l0, l1, s0, s1, top: y1, yb: o.k === 'high' ? o.y0 : 0, lane, dead: 0, vx: 0 });
  if (o.car) o.hitTop = .5; // cars can be vaulted: the jump over one is boosted, and only the bumper height counts as a hit
  seg.obs.push(o); return o;
}

/* ================= population ================= */
function obsKind(t) { if (t === 'gates' || t === 'ogates') return 'gates'; if (t === 'kaminarimon') return 'kmon'; if (t === 'bridge') return 'bridge'; const o = OBS[t](0); return o.k + (o.full ? 'F' : ''); }
function populate(seg) {
  const th = seg.th, L = seg.len;
  const diff = clamp(.05 + G.distEst / 3600, 0, .9) + (th.rush ? .2 : 0) + Math.min(.3, (G.planDay - 1) * .08); // a little bite from the start
  const kinds = th.obs.map(t => [t, obsKind(t)]);
  const lane3 = kinds.filter(k => k[1] === 'low' || k[1] === 'high' || k[1] === 'block');
  if (G.weather === 'snow' && th.kind === 'street' && !th.noSnowball) lane3.push(['snowball', 'low']); // 雪の日の通り：雪玉が転がってくる（B-28）
  const fulls = kinds.filter(k => k[1] === 'lowF' || k[1] === 'highF');
  const gates = kinds.filter(k => k[1] === 'gates');
  const special = kinds.filter(k => k[1] === 'kmon' || k[1] === 'bridge');
  const rows = [];
  let s = seg.first ? 46 : HW + 16;
  const endS = L - 26;
  const spd = clamp(G.speedEst, 10, 24);
  let n = 0;
  while (s < endS) {
    const row = { s, lanes: [null, null, null] };
    const r = Math.random();
    const firstOk = th.first && n === 0 && !(seg.step && seg.step.cont);
    if (special.length && (firstOk || r < (th.boat ? .38 : .22))) {
      const t = firstOk ? th.first : pick(special)[0];
      makeObs(seg, t, s, null);
      row.lanes = t === 'kaminarimon' ? [null, 'high', null] : ['high', 'high', 'high'];
      if (t === 'kaminarimon' && Math.random() < .5) { const l = Math.random() < .5 ? 0 : 2; makeObs(seg, 'bench', s + rand(-.2, .2), l); row.lanes[l] = 'low'; }
    } else if (fulls.length && r < .14) {
      const t = pick(fulls)[0]; makeObs(seg, t, s, null); const k = OBS[t](0).k; row.lanes = [k, k, k];
    } else if (gates.length && r < .4) {
      const open = (Math.random() * 3) | 0, open2 = diff < .4 && Math.random() < .5 ? (open + 1) % 3 : -1;
      for (let l = 0; l < 3; l++) { const closed = l !== open && l !== open2; makeObs(seg, gates[0][0], s, l, closed); row.lanes[l] = closed ? 'block' : null; }
    } else if (lane3.length) {
      let cnt = diff < .2 || G.easy || (SV.runs <= 2 && G.t < 40) ? 1 : Math.random() < .55 ? 1 : 2; if (diff > .5 && Math.random() < .25) cnt = 3;
      const ls = [0, 1, 2].sort(() => Math.random() - .5).slice(0, cnt);
      let blocks = 0;
      for (const l of ls) {
        let [t, k] = pick(lane3);
        if (k === 'block' && cnt === 3 && blocks >= 2) { const alt = lane3.filter(e => e[1] !== 'block'); if (!alt.length) continue; [t, k] = pick(alt); }
        let o = makeObs(seg, t, s + rand(-.3, .3), l);
        /* 置いた後の実際の種類で数える：積んだ箱（crate）は置くときに高い（壁）か低いかが決まるので、選んだ時点の種類では「3レーンとも壁」を防げなかった（2026-11-08） */
        if (o.k === 'block' && cnt === 3 && blocks >= 2) { seg.obs.splice(seg.obs.indexOf(o), 1); const alt = lane3.filter(e => e[1] !== 'block' && e[0] !== 'crate'); if (!alt.length) continue; o = makeObs(seg, pick(alt)[0], s + rand(-.3, .3), l); }
        if (o.k === 'block') blocks++; row.lanes[l] = o.k;
      }
    }
    rows.push(row); n++;
    const gapT = lerp(1.3, .78, clamp(diff, 0, 1)) * rand(.95, 1.3) * (SV.runs <= 2 && G.t < 40 ? 1.45 : 1); // new players get a little more room for their first runs
    s += Math.max(9, gapT * spd * (G.easy ? 1.35 : 1));
  }
  seg.rows = rows;
  // moving obstacles must have a clear lane in front of them
  for (const o of seg.obs) if (o.mv) { if (seg.obs.some(p => p !== o && p.lane === o.lane && p.s0 < o.s0 && p.s0 > o.s0 - 40)) o.mv = 0; }
  /* 建物から出てすぐの所では、動く物（人力車・自転車・車など）を動かさない（2026-11-16 オーナー：「室内で人力車にぶつかるのはおかしい」。
     前の場所が室内だと、外に出た直後はまだ建物の壁が見えている。そこへ通りの人力車が走ってきて、建物の中でぶつかったように見えた）。
     止まっている物は前から見えているので、よけられる。動く物が建物の側（通りの入り口から 30m より手前）へ入ってくることもない（6_game.js） */
  if (seg.prevIn) for (const o of seg.obs) if (o.mv && o.s0 < 70) o.mv = 0;
  // hay lines that weave through the rows
  const rowAt = q => rows.find(rw => Math.abs(rw.s - q) < 1.6);
  let lane = 1, q = seg.first ? 22 : HW + 8, on = true, runLeft = rand(14, 30), lineN = ++LINE_ID;
  const span = spd * (2 * JUMPV / GRAV);
  while (q < L - 18) {
    const rw = rows.find(rw => rw.s > q - 1.4 && rw.s < q + 4);
    if (rw && rw.lanes[lane] === 'block') { const free = [0, 1, 2].filter(l => rw.lanes[l] !== 'block'); lane = free.sort((a, b) => Math.abs(a - lane) - Math.abs(b - lane))[0] ?? 1; }
    if (on) {
      let y = .45;
      const near = rows.find(rw => Math.abs(rw.s + .5 - q) < span * .5);
      if (near && near.lanes[lane] === 'low') { const d = (q - near.s - .5) / (span * .5); y = .45 + Math.max(0, 1.05 * (1 - d * d)); }
      else if (near && near.lanes[lane] === 'high' && Math.abs(near.s - q) < 2.4) y = .28;
      const isRow = rowAt(q);
      if (!(isRow && isRow.lanes[lane] === 'block')) {
        let type = 'hay'; const rr = Math.random();
        if (rr < .006) type = 'goldhay'; else if (rr < .07) type = pick(VEG); else if (rr < .11) type = 'pellet';
        addItem(seg, type, q, lane, y); seg.items[seg.items.length - 1].line = lineN;
      }
    }
    q += 1.7; runLeft -= 1.7;
    if (runLeft <= 0) { on = !on; if (on) lineN = ++LINE_ID; runLeft = on ? rand(14, 34) : rand(4, 12); if (Math.random() < .5) lane = clamp(lane + (Math.random() < .5 ? -1 : 1), 0, 2); }
  }
  // specials between rows
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i].s + 3, b = rows[i + 1].s - 3; if (b - a < 3) continue;
    const at = rand(a, b), r = Math.random(), pBoost = hasPerk('jill') ? 1.3 : 1;
    const freeLane = () => { const ls = [0, 1, 2].filter(l => !seg.items.some(it => it.lane === l && Math.abs(it.s - at) < 2)); return ls.length ? pick(ls) : -1; };
    if (r < .07 * pBoost) { const l = freeLane(); if (l >= 0) addItem(seg, wpick(POWERS), at, l, .55); }
    else if (r < .17) { const l = freeLane(); if (l >= 0) addItem(seg, pick(TREATS), at, l, .5); }
    else if (r < .25 + diff * .05) { const l = freeLane(); if (l >= 0) addItem(seg, pick(BADS), at, l, .5); }
  }
  // before you have ever met Pom: one quick glimpse of a hamster dashing across the road ahead
  if (!G.pomPeek && !G.pom.on && G.char !== 'pom' && (G.planDay >= 2 || G.t > 52) && th.kind !== 'room' && th.kind !== 'train' && th.kind !== 'glass' && L > 110) G.pomPeek = { seg, s: L * .42, dir: Math.random() < .5 ? 1 : -1, b: { who: 'pom', view: 'back', ph: 0, look: 0, show: false, depth: 0 } };
  // Pom's sunflower seeds: once the run is well under way (day 2, or a long day 1), until Pom has joined
  if (!G.pom.on && G.char !== 'pom' && !(G.pomSeedAt > 0 && G.dist - G.pomSeedAt < 600) && (G.planDay >= 2 || G.t > 78) && ((G.pomPeek && G.pomPeek.ph) || G.t > 110) && rows.length >= 1 && L > 50 && Math.random() < .7) {
    // just past a row of obstacles, in a lane that the next row leaves open
    const i = Math.max(0, ((rows.length - 1) / 2) | 0), at = rows[i].s + 4.5, nx = rows[i + 1], free = [0, 1, 2].filter(l => !nx || nx.s - at > 7 || !nx.lanes[l]);
    if (free.length && at < L - 20) { seg.items = seg.items.filter(it => !(Math.abs(it.s - at) < 2.5)); addItem(seg, 'pomseed', at, pick(free), .6); G.pomSeedAt = G.dist; G.pomSeedN = (G.pomSeedN || 0) + 1; } }
  // あいことばのかくれんぼ（B-49）：期間中、まだそろっていなければ、1回の走りに1枚まで「？」の札。次の列が空けるレーンに
  /* あいことばのかくれんぼ（「？」の札）はやめた（2026-11-15 オーナーの判断） */
  // dropped papers (B-24): now and then on a street, in a lane the next row leaves open. Picking them up earns a thank-you from the partner
  if (th.kind === 'street' && rows.length >= 2 && G.t > 15 && !(G.memoAt > 0 && G.dist - G.memoAt < 900) && Math.random() < .35) {
    const i = Math.min(rows.length - 2, 1 + ((Math.random() * (rows.length - 1)) | 0)), at = (rows[i - 1 >= 0 ? i - 1 : 0].s + rows[i].s) / 2, free = [0, 1, 2].filter(l => !rows[i].lanes[l]);
    if (free.length && at > 10 && at < L - 20 && !seg.items.some(it => Math.abs(it.s - at) < 2)) { addItem(seg, 'memo', at, pick(free), .45); G.memoAt = G.dist; } }
  // one sightseeing stamp per Tokyo spot, in the middle of the stretch
  if (th.stamp && rows.length > 2 && !(seg.step && seg.step.cont)) { const i = (rows.length / 2) | 0; const at = (rows[i].s + rows[i + 1 < rows.length ? i + 1 : i].s) / 2 + 1; const free = [0, 1, 2].filter(l => !rows[i].lanes[l]); addItem(seg, 'stamp', at, free.length ? pick(free) : 1, .6); }
  // last pass: no item may sit inside an obstacle (cars are long, so a hay line or a treat could land in a car's back half — 2026-11-08)
  //  inside a wall → move it to a free lane (or drop it); inside something you jump over → lift it above the top
  for (const it of seg.items) {
    const hit = seg.obs.find(o => !(o.k === 'gates' && !o.closed) && it.lat > o.l0 - .25 && it.lat < o.l1 + .25 && it.s > o.s0 - .2 && it.s < o.s1 + .2);
    if (!hit) continue;
    if (hit.k === 'low') { if (it.y < (hit.top || 0) + .3) it.y = (hit.top || 0) + .35; continue; }
    if (hit.k !== 'block') continue;
    const free = [0, 1, 2].filter(l => !seg.obs.some(o => o.k === 'block' && LANES[l] > o.l0 - .25 && LANES[l] < o.l1 + .25 && it.s > o.s0 - .2 && it.s < o.s1 + .2));
    if (free.length) { it.lane = free.sort((a, b) => Math.abs(a - it.lane) - Math.abs(b - it.lane))[0]; it.lat = LANES[it.lane]; } else it.dead = 1;
  }
  //  second pass: an item moved to a free lane, or sitting in two things at once, may still be inside something low → lift above every one (worldcheck, 2026-11-08)
  for (const it of seg.items) if (!it.dead) for (const o of seg.obs) if (o.k === 'low' && it.lat > o.l0 - .25 && it.lat < o.l1 + .25 && it.s > o.s0 - .2 && it.s < o.s1 + .2 && it.y < (o.top || 0) + .3) it.y = (o.top || 0) + .35;
  seg.items = seg.items.filter(it => !it.dead);
  // now and then, a short road of golden hay (a happy surprise; once the run is under way, never in the lesson) — 2026-11-08
  if (!seg.first && G.mode === 'play' && G.t > 40 && SV.tutDone && Math.random() < .045) {
    const byLine = {}; for (const it of seg.items) if (it.line && it.type === 'hay') (byLine[it.line] = byLine[it.line] || []).push(it);
    const best = Object.values(byLine).sort((a, b) => b.length - a.length)[0];
    if (best && best.length >= 8) { const a = ((best.length - 6) / 2) | 0; for (const it of best.slice(a, a + 6)) it.type = 'goldhay'; seg.goldRoad = best[a].s; }
  }
}
// a street with extra hay: every other piece of a hay line gets a twin in a free lane beside it (the fork sign tells you which way)
function richHay(sg) { if (!sg || sg.rich) return; sg.rich = 1; const add = [];
  sg.items.forEach((it, i) => { if (it.type !== 'hay' || i % 2) return; for (const l of [it.lane - 1, it.lane + 1].filter(x => x >= 0 && x <= 2)) {
    const lat = LANES[l]; if (sg.obs.some(o => !(o.k === 'gates' && !o.closed) && lat > o.l0 - .25 && lat < o.l1 + .25 && it.s > o.s0 - .6 && it.s < o.s1 + .6)) continue;
    if (sg.items.some(x => x.lane === l && Math.abs(x.s - it.s) < 1.2) || add.some(x => x.lane === l && Math.abs(x.s - it.s) < 1.2)) continue;
    add.push({ type: 'hay', s: it.s, lane: l, lat, y: it.y, got: 0, ph: Math.random() * 6 }); break; } });
  sg.items.push(...add); }
let LINE_ID = 0; // every line of hay gets a number: take every piece of one line for a PERFECT LINE bonus (2026-11-08)
// 空の上：オオタカの通り道に、牧草がまっすぐ一列（ハンドルを切らなくても取れる。見回している間に、操作がいらない）
function skyItems(seg) { const L = seg.len; for (let s = 24; s < L - 30; s += 3.2) addItem(seg, Math.random() < .03 ? 'goldhay' : 'hay', s, 1, .5); }
function addItem(seg, type, s, lane, y) { seg.items.push({ type, s, lane, lat: LANES[lane], y, got: 0, ph: Math.random() * 6 }); }
