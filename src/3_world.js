/* ================= segments =================
   A segment is one straight stretch between two corners. Track coords: s (along), lat (right +), y (up). */
function segPos(seg, s, lat) { return [seg.sx + seg.f[0] * s + seg.r[0] * lat, seg.sz + seg.f[1] * s + seg.r[1] * lat, segE(seg, s)]; }
/* ---------- terrain: streets rise and fall (hills, slopes, bridges); flat near both corners so stretches meet cleanly ---------- */
const sstep = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
function segE(seg, s) { const h = seg.hp, e0 = seg.e0 || 0; if (!h) return e0; const t = (s - h.a) / (h.b - h.a); if (t <= 0) return e0; if (t >= 1) return e0 + h.d;
  const sn = Math.sin(Math.PI * t), s2 = Math.sin(2 * Math.PI * t); return e0 + h.d * sstep(t) + h.hump * sn * sn + (h.w2 || 0) * s2 * s2; }
/* road shapes: a hill, a slope up or down, rolling double hills, a long climb with a crest, or a dip under a railway bridge */
function terrainFor(seg, prev) {
  const th = seg.th, L = seg.len; seg.e0 = prev ? segE(prev, prev.len) : 0;
  if (seg.first) return;
  const a = HW + 6, b = L - HW - 8; if (b - a < 30) return;
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
    else if (r < .9 && !th.gate && !th.torii && !th.toriiTunnel && !th.overpass && L > 85) { hump = -rand(3, 4.2); shape = 'underpass'; }
    else shape = 'flat'; }
  if (e0 + d > 10) d = -Math.abs(d); if (e0 + d < -3) d = Math.abs(d) || 3;
  if (shape === 'underpass' && e0 + hump < -6) { hump = 0; shape = 'flat'; }
  if (d || hump || w2) seg.hp = { a, b, d, hump, w2, shape };
}

function quad(seg, pts, flat) { const v = []; for (const [s, lat, y] of pts) { const p = segPos(seg, s, lat); v.push(p[0], y + (flat ? seg.e0 || 0 : p[2]), p[1]); } return v; }
const C = hexRgb;
let SEGN = 0;

function newSeg(prev, step, opts) {
  opts = opts || {};
  const th = themeFor(step.t, opts.day || 1);
  const first = !prev;
  const turnIn = opts.turnIn != null ? opts.turnIn : prev ? prev.turn : 0;
  const dir = first ? 0 : (prev.dir + turnIn + 4) % 4;
  let sx = 0, sz = 0; if (!first) { const p = segPos(prev, prev.len, 0); sx = p[0]; sz = p[1]; }
  const len = first ? (opts.len || 92) : Math.round(rand(th.len[0], th.len[1]));
  const seg = { id: ++SEGN, turnIn: first ? 0 : turnIn, prevFork: !!(prev && prev.fork), tid: step.t, th, step, t0: opts.t0 ?? 480, t1: (opts.t0 ?? 480) + step.d, dir, sx, sz, f: DIRS[dir], r: DIRS[(dir + 1) % 4], first, day: opts.day || 1,
    len, turn: opts.fork ? 0 : (turnIn ? -turnIn : (Math.random() < .5 ? -1 : 1)), fork: opts.fork || null,
    floor: [], walls: [], decos: [], obs: [], items: [], props: [], lines: [], spr: [] };
  seg.wallH = th.wallH || 3;
  terrainFor(seg, prev);
  buildGeometry(seg);
  buildProps(seg); buildWalkers(seg);
  // open scenery that would spill into the next or previous stretch is dropped (see terrOK)
  seg.spr = seg.spr.filter(sp => sp.keep || terrOK(seg, sp.s, sp.lat));
  seg.props = seg.props.filter(p => p.big || terrOK(seg, (p.s0 + p.s1) / 2, (p.l0 + p.l1) / 2));
  if (!opts.empty) populate(seg);
  return seg;
}

/* ---------- territory ----------
   At a corner the plane is split along the 45° line through the junction: everything on this stretch's
   side belongs to it, the rest to the next (or previous) stretch. Walls already stop at the corner;
   this keeps open scenery (water, far banks, distant trees, boats) from overlapping the neighbour, which
   is what made corners flicker or change at the moment of turning. u = distance from the road's centre line. */
function terrK(seg, sd) { return { endTurn: !!(seg.fork || sd === seg.turn), startIn: !seg.first && sd === seg.turnIn, first: seg.first }; }
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
function sideEnds(seg) { const L = seg.len, s0 = seg.first ? (seg.th.backAt != null ? seg.th.backAt : -16) : HW; return { s0, lEnd: (seg.turn === -1 || seg.fork) ? L - HW : L + HW, rEnd: (seg.turn === 1 || seg.fork) ? L - HW : L + HW }; }
function buildGeometry(seg) {
  const th = seg.th, L = seg.len, k = th.kind;
  const { s0, lEnd, rEnd } = sideEnds(seg);
  // floor: road in the middle, side zones outside
  const T = th.rpat === 'tatami' ? 1.8 : 1.5;
  // the corner square belongs to the stretch you turn into (so the new place starts right at the corner);
  // at a fork it stays with the fork's own stretch, since two stretches leave from it
  const fS = seg.first || seg.prevFork ? s0 : -HW, fE = seg.fork ? L + HW : L - HW;
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
  addDecals(seg, fS, fE);
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
  const e = L + HW - .05, H = k === 'street' ? 3.2 : k === 'deck' ? 2.4 : Math.min(seg.wallH - .3, 2.4);
  const sign = { n: [-seg.f[0], -seg.f[1]], pat: seg.fork ? 'forkSign' : seg.turn > 0 ? 'arrowR' : 'arrowL', seg, sign: 1 };
  sign.v = quad(seg, [[e, -2.2, H - 1.4], [e, 2.2, H - 1.4], [e, 2.2, H], [e, -2.2, H]]);
  seg.decos.push(sign);
  if (k === 'deck') { // a post holding the sign
    seg.props.push(mkProp(seg, [{ l0: -.1, l1: .1, s0: L + HW - .3, s1: L + HW - .1, y0: 0, y1: H - 1.4, c: '#6E7B88' }]));
  }
}
function addDecals(seg, fS, fE) {
  const th = seg.th, L = seg.len, out = (s0, s1, l0, l1, dec, x) => { if (s0 < fS + .5 || s1 > fE - .5) return; seg.floor.push(Object.assign({ v: quad(seg, [[s0, l0, .015], [s1, l0, .015], [s1, l1, .015], [s0, l1, .015]]), c: [0, 0, 0], dec, ti: 0, a: s0, b: s1 }, x || {})); };
  if (th.kind !== 'street' && th.kind !== 'deck') return;
  const road = th.rpat === 'road' || th.rpat === 'hokoten', stone = ['stone', 'plaza', 'brickroad', 'petalstone'].includes(th.rpat);
  if (road) {
    for (let s = fS + 12 + rand(0, 10); s < fE - 14; s += rand(18, 32)) { const l = pick([-1.5, 0, 1.5]) + rand(-.3, .3); out(s, s + .7, l - .35, l + .35, 'manhole'); }
    for (let s = fS + 6 + rand(0, 6); s < fE - 16; s += rand(10, 18)) { const l = pick([-1.5, 0, 1.5]); out(s, s + .5, l - .5, l + .5, 'patch', { pc: pick(['#5A5A5E', '#6E6E72', '#646468']) }); }
    if (!seg.first && th.kind === 'street' && L > 60) { const z = L - HW - 6.5; out(z, z + 3.6, -ROAD, ROAD, 'zebra'); if (Math.random() < .6) out(z - 4.2, z - 2.4, -ROAD + .3, -.15, 'stop'); out(z - 12, z - 9.5, .35, ROAD - .35, 'arrow'); }
  }
  if (stone || road) for (let s = fS + 8; s < fE - 8; s += rand(14, 22)) for (const sd of [-1, 1]) if (Math.random() < .55) out(s, s + .5, sd * (ROAD - .38), sd * (ROAD - .05), 'grate');
  if (stone) for (let s = fS + 4; s < fE - 6; s += rand(4, 9)) { const l = rand(-ROAD + .4, ROAD - 1.2); out(s, s + rand(.6, 1.2), l, l + rand(.6, 1.1), 'patch', { pc: pick(['#8A8478', '#A09A8E', '#77716A']) }); }
}
function buildRoom(seg, s0, lEnd, rEnd) {
  const th = seg.th, H = seg.wallH, L = seg.len, glass = th.kind === 'glass';
  const wc = C(th.wall || '#E9EEF2'), bc = C(th.base || '#7D8B97');
  const wallRun = (side, a0, a1) => {
    for (let a = a0; a < a1 - .01; a += 3) {
      const b = Math.min(a + 3, a1);
      if (glass) addWallQuad(seg, side, a, b, 0, H, wc, { glass: 1 });
      else if (side < 0 && th.leftWall === 'trainside') addWallQuad(seg, side, a, b, 0, H, C('#C9CDD2'), { pat: 'trainside', ta: a });
      else { addWallQuad(seg, side, a, b, 0, H, wc, { pat: th.wpat || null }); addWallQuad(seg, side, a, b, 0, .14, bc, { base: 1 }); }
      if (th.kind === 'train') addWallQuad(seg, side, a, b, .02, .3, C(th.lc || '#80C241'), { base: 1 });
    }
  };
  wallRun(-1, s0, lEnd); wallRun(1, s0, rEnd);
  const e = L + HW;
  seg.walls.push({ v: quad(seg, [[e, -HW, 0], [e, HW, 0], [e, HW, H], [e, -HW, H]]), c: wc, n: [-seg.f[0], -seg.f[1]], sh: 1, glass: glass ? 1 : 0, pat: th.wpat || null });
  if (seg.first) { const b0 = s0; seg.walls.push({ v: quad(seg, [[b0, HW, 0], [b0, -HW, 0], [b0, -HW, H], [b0, HW, H]]), c: wc, n: [seg.f[0], seg.f[1]], sh: .95, glass: glass ? 1 : 0, pat: th.wpat || null }); // the room's back wall (seen on the title screen)
    if (!glass) { const bw = (th.backW || 2.2) / 2; seg.decos.push({ v: quad(seg, [[b0 + .03, bw, .2], [b0 + .03, -bw, .2], [b0 + .03, -bw, 2.5], [b0 + .03, bw, 2.5]]), n: [seg.f[0], seg.f[1]], pat: (th.wdeco || ['window'])[0], v2: 1, seg, w: bw * 2 }); } }
  // ceiling
  const cc = C(th.ceil || '#EEF0F2');
  for (let a = seg.fS, i = 0; a < seg.fE - .01; a += 3, i++) {
    const b = Math.min(a + 3, seg.fE);
    seg.walls.push({ v: quad(seg, [[a, HW, H], [b, HW, H], [b, -HW, H], [a, -HW, H]]), c: cc, n3: [0, -1, 0], sh: .82, pat: 'ceil', cp: th.cpat, light: th.light, ti: i, glass: glass ? 1 : 0, ceil: 1 });
  }
  // lintels above the openings
  for (const sd of [-1, 1]) if (seg.turn === sd || seg.fork) addWallQuad(seg, sd, L - HW, L + HW, H - .5, H, bc, { sh: .8 });
  // wall decorations
  if (th.wdeco) {
    for (const sd of [-1, 1]) {
      if (sd < 0 && th.leftWall) continue;
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
const DECO_SIZE = { tansuW: [1.5, 0, 1.65], hanger: [.9, 1.0, 2.5], elevator: [2.0, 0, 2.6], bookshelf: [2.8, 0, 2.6], mirror: [1.6, .8, 2.0], menuboard: [1.8, 1.1, 2.4], woodpanel: [2.4, 0, 2.8], portrait: [1.1, 1.3, 2.3], shoji: [2.4, .2, 2.6], fusuma: [2.6, .15, 2.6], tokonoma: [2.2, .35, 2.5], window: [2.2, .9, 2.3], calendar: [1.0, 1.2, 2.2], frame: [1.4, 1.2, 2.1],
  seatwin: [3.6, .0, 2.4], door: [1.5, 0, 2.3], trainmap: [1.1, 1.4, 2.3], stationsign: [3.0, 1.6, 2.8], poster: [1.2, 1.0, 2.3], timetable: [2.4, 1.4, 2.6],
  citywin: [3.6, .5, 2.7], plantwall: [2.4, .3, 2.8], whiteboard: [2.6, .9, 2.2], clock: [1.0, 2.0, 2.8], screen: [3.0, .9, 2.6], izakaya: [3.4, 0, 2.9], menu: [1.2, 1.0, 2.2] };

/* ---- streets: sidewalks, curbs, building facades ---- */
function buildStreet(seg, s0, lEnd, rEnd) {
  const th = seg.th, fac = th.fac, L = seg.len;
  // curbs
  const cc = C(th.curb || '#D9D6CE');
  for (const sd of [-1, 1]) {
    const lat = sd * ROAD, l2 = sd * (ROAD + .2), end = sd < 0 ? lEnd : rEnd;
    for (let a = s0; a < end - .01; a += 6) { const b = Math.min(a + 6, end);
      seg.walls.push({ v: quad(seg, [[a, lat, .14], [b, lat, .14], [b, l2, .14], [a, l2, .14]]), c: cc, n3: [0, 1, 0], sh: 1, curb: 1 });
      seg.walls.push({ v: quad(seg, sd < 0 ? [[a, lat, 0], [b, lat, 0], [b, lat, .14], [a, lat, .14]] : [[b, lat, 0], [a, lat, 0], [a, lat, .14], [b, lat, .14]]), c: cc, n: [sd * seg.r[0] * -1, sd * seg.r[1] * -1], sh: .8, curb: 1 }); }
  }
  const cont = !!(seg.step && seg.step.cont);
  if (th.gate && !cont) { const gc = th.gateColor || '#2F5579', s1 = (seg.first ? 6 : HW) + (th.gateColor ? 22 : 7); // the street's name gate, painted whole
    seg.spr.push({ lat: 0, s: s1 + .2, y: 0, w: (ROAD + .9) * 2, h: 6.5, img: artKey('sgate', th.gate + '/' + gc), far: 1, keep: 1 }); }
  if (th.torii && !cont) { const tc = th.torii, s1 = (seg.first ? 6 : HW) + 10, W2 = ROAD + 1.3; // a big shrine gate across the approach, painted whole
    seg.spr.push({ lat: 0, s: s1 + .35, y: 0, w: (W2 + 1.9) * 2, h: 8.35, img: artKey('torii', tc + '/' + (th.toriiTop || '#2B2B2B')), far: 1, keep: 1 }); }
  if (th.toriiTunnel) { const W2 = ROAD + .45, key = artKey('torii', '#D9452B/#2B2B2B'); for (let a = (seg.first ? 10 : HW + 8); a < L - HW - 10; a += 2.4) seg.spr.push({ lat: 0, s: a + .14, y: 0, w: (W2 + .5) * 2, h: 3.52, img: key, keep: 1 }); } // rows of small vermilion gates
  if (seg.hp && seg.hp.shape === 'underpass') { // a railway bridge across the bottom of the dip, painted whole (deck, railing, piers, the height sign)
    const mid = (seg.hp.a + seg.hp.b) / 2, a0 = mid - 4, a1 = mid + 4;
    seg.spr.push({ lat: 0, s: a0, y: 0, w: (HW + 1.2) * 2, h: 7.6, img: artKey('overpass', 'rail'), far: 1, keep: 1 });
    seg.props.push(mkProp(seg, [{ l0: -HW - 8, l1: HW + 8, s0: a0 + .05, s1: a1, y0: 4.6, y1: 5.6, c: '#8E949A' }], { big: 1 })); // the deck's underside, so it reads as a bridge from below too
    seg.movers = seg.movers || []; seg.movers.push({ ds: rand(-30, 30), v: -22, cross: 1, bx: [{ l0: -40, l1: -10, s0: a0 + 1, s1: a1 - 1, y0: 6, y1: 9, c: '#C9CDD2', cc: C('#C9CDD2') }, { l0: -40, l1: -10, s0: a0 + .98, s1: a0 + 1, y0: 7, y1: 8.2, c: '#46525E', cc: C('#46525E'), glow: 2 }, { l0: -40, l1: -10, s0: a0 + .97, s1: a0 + .99, y0: 6.4, y1: 6.7, c: '#80C241', cc: C('#80C241') }] });
  }
  if (th.overpass) { const a0 = L * .3, a1 = Math.min(L - HW - 6, a0 + 34); // an expressway passing overhead
    seg.spr.push({ lat: 0, s: a0, y: 0, w: (HW + 6) * 2, h: 14.6, img: artKey('overpass', 'road'), far: 1, keep: 1 });
    seg.props.push(mkProp(seg, [{ l0: -HW - 6, l1: HW + 6, s0: a0 + .05, s1: a1, y0: 8.6, y1: 10.2, c: '#9AA0A6' }], { big: 1 }));
    for (const sd of [-1, 1]) seg.props.push(mkProp(seg, [{ l0: sd * (HW + .4) - .5, l1: sd * (HW + .4) + .5, s0: a1 - 5, s1: a1 - 3.8, y0: 0, y1: 8.6, c: '#8F949A' }], { big: 1 })); }
  if (fac.style === 'park') { buildPark(seg, s0, lEnd, rEnd); return; }
  for (const sd of [-1, 1]) buildFacades(seg, sd, s0, sd < 0 ? lEnd : rEnd);
  // end of the street: one building across
  const e = L + HW, h = clamp(rand(fac.h[0], fac.h[1]), 8, 40), c = C(pick(fac.pal));
  for (let x = -HW; x < HW - .01; x += 3) seg.walls.push({ v: quad(seg, [[e, x, 0], [e, x + 3, 0], [e, x + 3, h], [e, x, h]]), c, n: [-seg.f[0], -seg.f[1]], sh: 1, pat: 'fac', st: fac.style === 'station' ? 'glass' : fac.style, h, w: 3, seed: (x * 7 + 3) | 0 });
}
function buildFacades(seg, sd, s0, end) {
  const th = seg.th, fac = th.fac;
  const style = sd < 0 ? (fac.left || fac.style) : (fac.right || fac.style);
  if (style === 'viaduct') { // elevated railway: arches below, a train going by on top
    for (let a = s0, k = 0; a < end - .01; a += 3, k++) { const b = Math.min(a + 3, end); addWallQuad(seg, sd, a, b, 0, 8, C('#8E8A82'), { pat: 'fac', st: 'viaduct', h: 8, w: b - a, seed: k, k }); }
    seg.movers = seg.movers || [];
    seg.movers.push({ ds: rand(0, seg.len), v: -16, bx: [{ l0: sd * (HW + .4), l1: sd * (HW + 3.4), s0: 0, s1: 40, y0: 8.3, y1: 11.4, c: '#C9CDD2', cc: C('#C9CDD2') }, { l0: sd * (HW + .38), l1: sd * (HW + .4), s0: 0, s1: 40, y0: 9.0, y1: 9.3, c: '#80C241', cc: C('#80C241') }, { l0: sd * (HW + .36), l1: sd * (HW + .38), s0: 1, s1: 39, y0: 9.6, y1: 10.6, c: '#46525E', cc: C('#46525E'), glow: 2 }] });
    return;
  }
  const pal = style === 'glass' && fac.pal2 ? fac.pal2 : fac.pal;
  let s = s0, prevH = 0;
  while (s < end - .01) {
    let w = style === 'nakamise' || style === 'market' ? rand(3.5, 5) : style === 'machiya' ? rand(4, 6) : style === 'books' ? rand(4, 7) : style === 'station' ? end - s : style === 'house' ? rand(7, 10) : rand(5, 11);
    if (end - s - w < 3) w = end - s;
    const h = style === 'station' ? 13 : rand(fac.h[0], fac.h[1]);
    const c = C(pick(pal)), seed = (Math.random() * 1e6) | 0;
    const setback = style === 'house' ? 3.2 : 0;
    if (style === 'house') { // block wall in front, house behind
      for (let a = s; a < s + w - .01; a += 3) { const b = Math.min(a + 3, s + w);
        addWallQuad(seg, sd, a, b, 0, 1.35, C('#B9B2A5'), { pat: 'blocks' }); }
      houseBehind(seg, sd, s, s + w, h, c, seed);
    } else {
      const tex = true; const fv = seed % 8, fw = Math.round(w * 2) / 2, fh = Math.round(h * 2) / 2, fm = fac.mood || '';
      for (let a = s, k = 0; a < s + w - .01; a += 3, k++) { const b = Math.min(a + 3, s + w);
        addWallQuad(seg, sd, a, b, 0, h, c, Object.assign({ pat: 'fac', st: style, h, w: b - a, seed: seed + k, k, first: k === 0 }, tex ? { fv, fw, fh, fm, fu0: (a - s) / w, fu1: (b - s) / w } : {})); }
      if (h > prevH + .5 && prevH > 0) { // the side of a taller building
        const lat0 = sd * HW, lat1 = sd * (HW + 7);
        seg.walls.push({ v: quad(seg, sd < 0 ? [[s, lat1, prevH], [s, lat0, prevH], [s, lat0, h], [s, lat1, h]] : [[s, lat0, prevH], [s, lat1, prevH], [s, lat1, h], [s, lat0, h]]), c, n: [-seg.f[0], -seg.f[1]], sh: .72, pat: 'fac', st: style, h, w: 7, seed, side: 1 });
      }
      if (h <= 17 && style !== 'nakamise' && style !== 'market' && style !== 'machiya' && w >= 5 && Math.random() < .7) // what stands on the roof
        seg.spr.push({ lat: sd * (HW + 1.6), s: s + w / 2, y: h - .05, w: Math.min(w - .5, 7.5), h: Math.min(w - .5, 7.5) * .66, img: artKey('roof', String(seed % 9)), far: 1, keep: 1 });
      decorateBuilding(seg, sd, s, s + w, h, style, seed);
    }
    prevH = h + setback * 0; s += w;
  }
}
function houseBehind(seg, sd, a, b, h, c, seed) {
  const lat = sd * (HW + 3.2), n = [-sd * seg.r[0], -sd * seg.r[1]];
  for (let x = a; x < b - .01; x += 3) { const y = Math.min(x + 3, b);
    const pts = sd < 0 ? [[x, lat, 0], [y, lat, 0], [y, lat, h], [x, lat, h]] : [[y, lat, 0], [x, lat, 0], [x, lat, h], [y, lat, h]];
    seg.walls.push({ v: quad(seg, pts), c, n, sh: sd < 0 ? .94 : .86, pat: 'fac', st: 'house', h, w: y - x, seed: seed + x | 0 }); }
  // tiled roof sloping away from the street
  const l2 = sd * (HW + 6.5), rc = C(pick(['#4A5866', '#5C5550', '#3F4D5C', '#6B4C3B']));
  seg.walls.push({ v: quad(seg, sd < 0 ? [[a, l2, h + 2.2], [b, l2, h + 2.2], [b, lat, h], [a, lat, h]] : [[b, l2, h + 2.2], [a, l2, h + 2.2], [a, lat, h], [b, lat, h]]), c: rc, n3: [-sd * seg.r[0] * .6, .8, -sd * seg.r[1] * .6], sh: 1, pat: 'roof' });
}
function decorateBuilding(seg, sd, a, b, h, style, seed) {
  const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const lat = sd * (HW - .02), n = [-sd * seg.r[0], -sd * seg.r[1]];
  const wq = (x0, x1, y0, y1, pat, extra) => { const pts = sd < 0 ? [[x0, lat, y0], [x1, lat, y0], [x1, lat, y1], [x0, lat, y1]] : [[x1, lat, y0], [x0, lat, y0], [x0, lat, y1], [x1, lat, y1]]; seg.decos.push(Object.assign({ v: quad(seg, pts), n, pat, seg, seed: (r() * 1e6) | 0, w: x1 - x0 }, extra || {})); };
  const fac = seg.th.fac;
  if (style === 'neon' && h > 12 && r() < (fac.screen || 0)) { const w = Math.min(b - a - 1, rand(5, 9)); const x0 = a + (b - a - w) / 2; wq(x0, x0 + w, h * .45, h * .45 + w * .56, 'bigscreen', { glow: 1 }); }
  // blade signs sticking out from the facade (vertical text)
  if ((style === 'neon' || style === 'mixed') && r() < (fac.vsign || .4)) {
    const x = a + 1 + r() * (b - a - 2), y0 = 3.4 + r() * 2, hh = 3 + r() * 4;
    seg.props.push(mkProp(seg, [{ l0: sd * (HW - .95), l1: sd * (HW - .05), s0: x, s1: x + .14, y0, y1: y0 + hh, c: pick(['#C8463C', '#F2C230', '#FBF6EE', '#355F86', '#E86A75', '#2B2B2B']), txt: pick(SIGNS_V), vert: 1, glow: 1 }], { minS: x }));
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
      for (let a = s0 - 20; a < seg.len + 40; a += 12) { const pg = terrClip(seg, [[a, sd * HW], [a + 12, sd * HW], [a + 12, sd * 38], [a, sd * 38]]); if (pg) seg.floor.push({ v: quad(seg, pg.map(q => [q[0], q[1], -.9])), c: C('#3E6E7A'), pat: 'sea', far: 1 }); }
      const [wr0, wr1] = terrRange(seg, sd * 38);
      for (let a = Math.max(s0 - 20, wr0); a < Math.min(seg.len + 40, wr1) - .5; a += 8) { const lat = sd * 38, n = [-sd * seg.r[0], -sd * seg.r[1]]; const a2 = Math.min(a + 8, wr1);
        seg.walls.push({ v: quad(seg, sd < 0 ? [[a, lat, -.9], [a2, lat, -.9], [a2, lat, 7], [a, lat, 7]] : [[a2, lat, -.9], [a, lat, -.9], [a, lat, 7], [a2, lat, 7]]), c: C('#9A9384'), n, sh: .9, pat: 'ishigaki' });
        if (th.tree === 'sakura') seg.spr.push(Object.assign(sakuraSpr(sd * 39, a + 4, -sd, 12, 11), { y: 6.4, far: 1 }));
        else seg.spr.push({ lat: sd * 40, s: a + 4, y: 7, h: 6, w: 7, img: 'canopy_pine', far: 1 }); }
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
  }
  const e = seg.len + HW;
  for (let x = -HW; x < HW - .01; x += 3) seg.walls.push({ v: quad(seg, [[e, x, 0], [e, x + 3, 0], [e, x + 3, .7], [e, x, .7]]), c: C('#8A8470'), n: [-seg.f[0], -seg.f[1]], sh: 1, pat: 'stonewall' });
  if (th.tree === 'sakura') for (let x = -HW - 4; x < HW + 4; x += 5) seg.spr.push(Object.assign(sakuraSpr(x, e + rand(1, 4), 0, 11, 10), { keep: Math.abs(x) <= HW }));
  else for (let x = -HW - 4; x < HW + 4; x += 3) seg.spr.push({ lat: x, s: e + rand(1, 4), y: 0, h: rand(7, 10), w: 7, img: 'canopy_' + (th.tree || 'green'), trunk: 1, keep: Math.abs(x) <= HW });
}
/* ---- decks: railings, water or open air ---- */
function buildDeck(seg, s0, lEnd, rEnd) {
  const th = seg.th, L = seg.len;
  const railLat = th.boat ? ROAD + .4 : HW;
  for (const sd of [-1, 1]) {
    const end = sd < 0 ? lEnd : rEnd, lat = sd * railLat, hgt = th.tid === 'tower' ? 1.25 : 1.0;
    seg.lines.push({ a: [s0, lat, hgt], b: [end, lat, hgt], c: th.rail, w: .09 });
    seg.lines.push({ a: [s0, lat, hgt * .5], b: [end, lat, hgt * .5], c: th.rail, w: .05 });
    for (let s = s0; s < end; s += th.tid === 'tower' ? 1.2 : 2) seg.lines.push({ a: [s, lat, 0], b: [s, lat, hgt], c: th.rail, w: .05 });
    if (th.tid === 'tower') { // the tower's own red frame around the stairs
      for (let s = s0 + 4; s < end - 2; s += 8) { seg.lines.push({ a: [s, sd * (HW + 1.5), -30], b: [s + 8, sd * (HW + .8), 18], c: th.beams, w: .55 }); seg.lines.push({ a: [s + 8, sd * (HW + 1.5), -30], b: [s, sd * (HW + .8), 18], c: th.beams, w: .45 }); }
      for (let s = s0; s < end; s += 8) seg.lines.push({ a: [s, sd * (HW + 1), -30], b: [s, sd * (HW + 1), 20], c: th.beams, w: .7 });
    }
  }
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
  boxesS: (sd, s) => ({ w: 1.6, bx: [B(sd * 3.8, s, 1.1, 1.1, 0, .9, '#C79A6C'), B(sd * 3.85, s + .15, .8, .8, .9, 1.55, '#D3A777'), B(sd * 3.25, s + .4, .02, .3, 0, .9, '#E2BB8D')] }),
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
  hedge: (sd, s) => ({ w: 3.4, bx: [B(sd * 3.4, s, .8, 3, 0, .3, '#8A8470'), B(sd * 3.4, s, .7, 3, .3, .75, '#4C8A48')] }),
  sakura: (sd, s) => ({ w: 5, bx: [B(sd * 3.6, s, .5, .5, 0, .12, '#7A6A55')], spr: [sakuraSpr(sd * 3.6, s + .25, -sd, 9, 8)] }),
  // a paper lantern on a post (bonbori), lit for the evening cherry viewing
  bonbori: (sd, s) => ({ w: 3.4, bx: [B(sd * 3.1, s, .12, .12, 0, 1.45, '#3B2A20'), B(sd * 3.1, s - .14, .4, .4, 1.45, 2.0, '#FBEFE6', 2), B(sd * 3.1, s - .16, .44, .44, 2.0, 2.08, '#2B1E18'), B(sd * 3.1, s - .16, .44, .44, 1.4, 1.46, '#2B1E18')],
    spr: [{ lat: sd * 3.1, s: s + .05, y: 1.1, h: 1.8, w: 1.8, img: 'glow', glow: 1, night: 1 }] }),
  lampC: (sd, s) => ({ w: 4, bx: [B(sd * 3.2, s, .3, .3, 0, .5, '#2F3B47'), B(sd * 3.2, s + .1, .1, .1, .5, 4.2, '#2F3B47'), B(sd * 3.2, s, .4, .4, 4.2, 4.7, '#FFF3D6', 1)], spr: [{ lat: sd * 3.2, s: s + .2, y: 3.4, h: 2.6, w: 2.6, img: 'glow', glow: 1, night: 1 }] }),
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
  seat: (sd, s) => ({ w: 3.4, bx: [B(sd * 4.0, s, 1.0, 3.2, .45, .62, '#2F6E8E'), B(sd * 4.0, s, 1.0, 3.2, 0, .45, '#9AA9B6'), B(sd * 4.45, s, .2, 3.2, .62, 1.2, '#2F6E8E'), B(sd * 3.5, s, .08, .08, 0, 2.6, '#C9CDD2'), B(sd * 3.5, s + 3.12, .08, .08, 0, 2.6, '#C9CDD2')] }),
  nakazuri: (sd, s) => ({ w: 3.2, spr: [{ lat: 0, s: s + .4, y: 2.28, h: .56, w: 1.0, img: artKey('ad', String((Math.random() * 10) | 0)), keep: 1 }, { lat: 0, s: s + 1.6, y: 2.28, h: .56, w: 1.0, img: artKey('ad', String((Math.random() * 10) | 0)), keep: 1 }], ln: [{ a: [s + .4, 0, 2.62], b: [s + .4, 0, 2.86], c: '#9AA0A6', w: .03 }, { a: [s + 1.6, 0, 2.62], b: [s + 1.6, 0, 2.86], c: '#9AA0A6', w: .03 }] }),
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
  getabako: [0, 'getabako', 260, 100], cabinet: [0, 'cabinet', 160, 200], sofaO: [0, 'sofaO', 240, 70], kiosk: [0, 'kiosk', 260, 220], seat: [1, 'seat', 300, 60], hedge: [1, 'hedge', 300, 60] , kuroita: [0, 'kuroita', 600, 430], bamboo: [0, 'bamboo', 600, 260], gateS: [0, 'gateS', 220, 210] };
// passers-by on the pavements: a few people walking either way, each a two-frame painted sprite
function buildWalkers(seg) {
  const th = seg.th; if (th.kind !== 'street' || th.noWalk) return; seg.walkers = [];
  const { s0, lEnd, rEnd } = sideEnds(seg); const n = th.crowd === 0 ? 0 : Math.round(rand(2, 4) * (th.crowd || 1));
  for (let i = 0; i < n; i++) {
    const sd = Math.random() < .5 ? -1 : 1, end = sd < 0 ? lEnd : rEnd; if (end - s0 < 12) continue;
    const dir = Math.random() < .5 ? 1 : -1, k = (Math.random() * PEOPLE.length) | 0, back = dir > 0 ? 1 : 0;
    const imgs = [0, 1].map(f => artKey('walker', k + '.' + f + '.' + back));
    const w = { lat: sd * rand(3.35, 4.1), s: rand(s0 + 3, end - 3), y: 0, w: .75, h: 1.68, img: imgs[0], imgs, walk: 1, ph: Math.random() * 10, vs: dir * rand(.9, 1.5), a0: s0 + 2, a1: end - 2, gnd: .3, keep: 1 };
    seg.spr.push(w); seg.walkers.push(w);
  }
}
function buildProps(seg) {
  const th = seg.th; if (!th.props || !th.props.length) return;
  const { s0, lEnd, rEnd } = sideEnds(seg);
  for (const sd of [-1, 1]) {
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
const OBS = {
  zabuton: L => ({ k: 'low', bx: [OB(L, 0, 1.25, 1.15, 0, .2, '#7E3552'), OB(L, .05, 1.15, 1.05, .2, .42, '#9C456A')] }),
  clock: L => ({ k: 'low', bx: [OB(L, 0, .8, .5, 0, .72, '#D9534F'), OB(L, -.02, .6, .02, .12, .62, '#FBF6EE'), OB(L - .25, .15, .16, .16, .72, .86, '#C9962F'), OB(L + .25, .15, .16, .16, .72, .86, '#C9962F')] }),
  chabudai: L => ({ k: 'high', y0: .6, bx: [OB(L - .6, .1, .12, .12, 0, .62, '#5E3820'), OB(L + .6, .1, .12, .12, 0, .62, '#5E3820'), OB(L - .6, 1, .12, .12, 0, .62, '#5E3820'), OB(L + .6, 1, .12, .12, 0, .62, '#5E3820'), OB(L, 0, 1.5, 1.22, .62, .76, '#8A5530')] }),
  futon: () => ({ k: 'low', full: 1, bx: [OB(0, 0, 5.2, 1.0, 0, .46, '#F2F2F7'), OB(0, .35, 5.2, .3, .46, .5, '#7FA6D6')] }),
  box: L => ({ k: 'block', art: 'box', artW: 1.32, artH: 1.54, bx: [OB(L, 0, 1.3, 1.1, 0, 1.5, '#C79A6C'), OB(L, -.02, .3, .02, 0, 1.5, '#E2BB8D'), OB(L, 0, .3, 1.1, 1.5, 1.52, '#E2BB8D')] }),
  slipper: L => ({ k: 'low', bx: [OB(L - .25, 0, .4, .85, 0, .3, '#6FA3C9'), OB(L + .25, .15, .4, .85, 0, .3, '#6FA3C9'), OB(L - .25, .05, .42, .3, .3, .36, '#4E77A0'), OB(L + .25, .2, .42, .3, .3, .36, '#4E77A0')] }),
  roomba: L => ({ k: 'low', mv: 3.2, bx: [OB(L, 0, .95, .95, 0, .26, '#33343A'), OB(L, .22, .5, .5, .26, .31, '#6A6A72'), OB(L, -.01, .3, .02, .1, .2, '#7FD06A', 1)] }),
  toys: L => ({ k: 'low', bx: [OB(L - .35, 0, .5, .5, 0, .5, '#E86A75'), OB(L + .3, .2, .5, .5, 0, .5, '#4E77A0'), OB(L, .1, .45, .45, .5, .82, '#F2C230')] }),
  table: L => ({ k: 'high', y0: .62, bx: [OB(L - .62, .1, .12, .12, 0, .64, '#7A5A48'), OB(L + .62, .1, .12, .12, 0, .64, '#7A5A48'), OB(L - .62, 1.1, .12, .12, 0, .64, '#7A5A48'), OB(L + .62, 1.1, .12, .12, 0, .64, '#7A5A48'), OB(L, 0, 1.5, 1.35, .64, .8, '#B08155')] }),
  pot: L => ({ k: 'low', bx: [OB(L, 0, .95, .95, 0, .62, '#9AA9B6'), OB(L, .1, 1.05, .75, .62, .68, '#7D8B97'), OB(L, .4, .2, .2, .68, .8, '#46525E')] }),
  noren: () => ({ k: 'high', full: 1, y0: .64, bx: [OB(-1.5, 0, 1.5, .06, .64, 2.55, '#355F86'), OB(0, 0, 1.5, .06, .64, 2.55, '#2F5579'), OB(1.5, 0, 1.5, .06, .64, 2.55, '#355F86'), OB(0, -.02, 5.6, .1, 2.55, 2.65, '#5E4535'), OB(0, -.03, .9, .02, 1.3, 2.0, '#FBF6EE')] }),
  shoes: L => ({ k: 'low', bx: [OB(L - .25, 0, .4, .8, 0, .32, '#EDEDED'), OB(L + .25, .1, .4, .8, 0, .32, '#EDEDED'), OB(L - .25, 0, .42, .3, .2, .34, '#C8463C'), OB(L + .25, .1, .42, .3, .2, .34, '#C8463C')] }),
  umbrella: L => ({ k: 'block', bx: [OB(L, 0, .8, .8, 0, 1.0, '#4E77A0'), OB(L - .15, .3, .1, .1, 1.0, 1.9, '#C8463C'), OB(L + .18, .4, .1, .1, 1.0, 1.75, '#F2C230'), OB(L, .2, .1, .1, 1.0, 1.85, '#3B2A20')] }),
  step: () => ({ k: 'low', full: 1, bx: [OB(0, 0, 9.2, .9, 0, .42, '#8A6A48'), OB(0, -.02, 9.2, .02, .36, .42, '#B08155')] }),
  cone: L => ({ k: 'low', art: 'cone', artW: .78, artH: .76, bx: [OB(L, 0, .75, .75, 0, .08, '#2B2B2B'), OB(L, .15, .48, .45, .08, .74, '#F07C2E'), OB(L, .14, .5, .47, .36, .48, '#FBF6EE')] }),
  bike: L => ({ k: 'block', mv: 4.5, art: 'bike', av: { s: pick(['#4E77A0', '#C8463C', '#5F9E5A', '#E9EDF0', '#F2C230']), p: pick(['#2F3B47', '#3B3B40', '#6B5A50']), h: pick(['#2B2B2B', '#FBF6EE', '#3A73C2']) }, artW: .72, artH: 1.95, bx: [OB(L, 0, .12, .62, 0, .62, '#222'), OB(L, 1.2, .12, .62, 0, .62, '#222'), OB(L, .25, .14, 1.3, .55, .7, '#3A6FB0'), OB(L, .2, .55, .12, .95, 1.0, '#3B3B3B'), OB(L, .3, .12, .12, .6, 1.0, '#3A6FB0'), OB(L, 1.1, .3, .25, .75, .85, '#2B2B2B'), OB(L, -.02, .12, .02, .6, .68, '#F2C230', 1)] }),
  bags: L => ({ k: 'low', bx: [OB(L - .3, 0, .7, .8, 0, .66, '#5C8FC4'), OB(L + .3, .15, .7, .8, 0, .6, '#6FA3D6'), OB(L - .3, .3, .12, .12, .66, .76, '#5C8FC4'), OB(L - .3, .05, .5, .04, .2, .5, '#F2C230'), OB(L + .3, .2, .5, .04, .15, .45, '#FBF6EE')] }),
  sign: L => ({ k: 'block', bx: [OB(L, 0, 1.15, .5, 0, .08, '#5A3D27'), Object.assign(OB(L, .05, 1.1, .14, .08, 1.45, '#F6EBDC'), { txt: pick(['営業中', 'OPEN', '本日特売', 'ランチ']) }), OB(L, .2, 1.1, .3, .08, 1.35, '#6B4631'), OB(L, .05, 1.16, .16, 1.45, 1.55, '#5A3D27')] }),
  pillar: L => ({ k: 'block', bx: [OB(L, 0, 1.25, 1.25, 0, 3.6, '#D6D6D0'), OB(L, -.02, 1.0, .02, 1.4, 2.0, '#2F5579')] }),
  plant: L => ({ k: 'block', bx: [OB(L, 0, .85, .85, 0, .62, '#B08155'), OB(L, -.1, 1.15, 1.05, .62, 1.7, '#5F9E5A'), OB(L, .1, .8, .8, 1.7, 2.0, '#4F8A4A')] }),
  papers: L => ({ k: 'low', bx: [OB(L, 0, 1.0, .8, 0, .28, '#FFFFFF'), OB(L + .05, .05, .98, .78, .28, .56, '#F4F4F0'), OB(L - .04, .02, .2, .02, .1, .5, '#C8463C')] }),
  paperTall: L => ({ k: 'block', bx: [OB(L, 0, 1.05, .85, 0, .65, '#FFFFFF'), OB(L + .08, .04, 1.0, .82, .65, 1.25, '#F4F4F0'), OB(L - .06, 0, 1.0, .82, 1.25, 1.85, '#FFFFFF'), OB(L, -.02, .9, .02, .9, .95, '#D6A23C')] }),
  chair: L => ({ k: 'low', bx: [OB(L, .1, .8, .8, 0, .1, '#2B2B2B'), OB(L, .4, .1, .1, .1, .42, '#8A9098'), OB(L, 0, .95, .95, .42, .55, '#C8463C'), OB(L, .75, .95, .14, .55, .8, '#C8463C')] }),
  mtable: L => ({ k: 'high', y0: .62, bx: [OB(L - .68, .3, .1, .7, 0, .62, '#9AA9B6'), OB(L + .68, .3, .1, .7, 0, .62, '#9AA9B6'), OB(L, 0, 1.55, 1.4, .62, .76, '#E9E4DA')] }),
  wboard: L => ({ k: 'high', y0: .66, bx: [OB(L - .7, .1, .08, .5, 0, .66, '#9AA9B6'), OB(L + .7, .1, .08, .5, 0, .66, '#9AA9B6'), OB(L - .7, -.05, .3, .6, 0, .05, '#7D8B97'), OB(L + .7, -.05, .3, .6, 0, .05, '#7D8B97'), OB(L, 0, 1.5, .1, .66, 2.0, '#FFFFFF'), OB(L, -.02, 1.5, .04, .66, .74, '#9AA9B6'), OB(L - .2, -.03, .6, .02, 1.4, 1.46, '#4E77A0'), OB(L + .15, -.03, .5, .02, 1.1, 1.16, '#C8463C')] }),
  mug: L => ({ k: 'low', bx: [OB(L, 0, .8, .8, 0, .82, '#FBF6EE'), OB(L + .48, .25, .16, .3, .22, .66, '#FBF6EE'), OB(L, .1, .62, .62, .82, .83, '#6B4631'), OB(L, -.01, .8, .02, .5, .6, '#4E77A0')] }),
  copier: L => ({ k: 'block', bx: [OB(L, 0, 1.4, 1.15, 0, 1.2, '#D9DDE2'), OB(L, .15, 1.4, .95, 1.2, 1.38, '#9AA9B6'), OB(L + .3, -.02, .5, .02, .8, 1.0, '#46525E'), OB(L - .4, -.02, .2, .02, .95, 1.05, '#7FD06A', 1)] }),
  bench: L => ({ k: 'low', art: 'bench', artW: 1.4, artH: .56, bx: [OB(L - .55, .1, .12, .5, 0, .4, '#5E4535'), OB(L + .55, .1, .12, .5, 0, .4, '#5E4535'), OB(L, 0, 1.35, .7, .4, .52, '#B08155')] }),
  pole: L => ({ k: 'block', bx: [OB(L, .3, .16, .16, 0, 2.9, '#C9CDD2'), OB(L, .28, .3, .3, 1.1, 1.18, '#80C241')] }),
  suitcase: L => ({ k: 'low', bx: [OB(L, 0, .95, .5, .06, .7, '#4E77A0'), OB(L, .18, .3, .1, .7, .8, '#2B2B2B'), OB(L, -.01, .95, .02, .42, .5, '#F2C230')] }),
  bag: L => ({ k: 'low', bx: [OB(L, 0, .9, .6, 0, .45, '#6B4631'), OB(L, .25, .5, .08, .45, .6, '#3B2A20')] }),
  barrier: L => ({ k: 'low', art: 'barrier', artW: 1.55, artH: .92, bx: [OB(L - .6, 0, .12, .3, 0, .9, '#3B3B3B'), OB(L + .6, 0, .12, .3, 0, .9, '#3B3B3B'), OB(L, 0, 1.4, .12, .5, .9, '#F2C230'), OB(L, -.01, .3, .02, .5, .9, '#2B2B2B')] }),
  rope: () => ({ k: 'low', full: 1, bx: [OB(-2.45, 0, .22, .22, 0, .55, '#C9962F'), OB(2.45, 0, .22, .22, 0, .55, '#C9962F'), OB(-2.45, -.05, .45, .45, 0, .06, '#8F7A3A'), OB(2.45, -.05, .45, .45, 0, .06, '#8F7A3A'), OB(0, .04, 4.8, .1, .3, .4, '#C8463C'), OB(0, .04, 4.8, .06, .12, .18, '#C8463C')] }),
  telescope: L => ({ k: 'block', bx: [OB(L, 0, .75, .75, 0, .25, '#3B4650'), OB(L, .1, .5, .5, .25, 1.2, '#46525E'), OB(L, -.05, .6, .9, 1.2, 1.55, '#9AA9B6'), OB(L, -.07, .3, .02, 1.3, 1.45, '#2F3B47')] }),
  jokoro: L => ({ k: 'block', bx: [OB(L, 0, 1.3, 1.3, 0, .9, '#6E5A3A'), OB(L, .15, 1.0, 1.0, .9, 1.25, '#57472E'), OB(L, .4, .5, .5, 1.25, 1.9, '#6E5A3A')] }),
  rickshaw: L => ({ k: 'block', mv: 3.6, bx: [OB(L - .62, .4, .12, 1.0, 0, 1.0, '#2B2B2B'), OB(L + .62, .4, .12, 1.0, 0, 1.0, '#2B2B2B'), OB(L, .3, 1.15, 1.0, .7, 1.05, '#B5302A'), OB(L, .9, 1.15, .2, 1.05, 1.7, '#2B2B2B'), OB(L, -.6, .1, 1.0, .6, .66, '#3B2A20')] }),
  kaminarimon: () => ({ k: 'high', y0: .72, hb: [-.82, .82, 2.3], bx: [OB(-3.4, 0, .5, .6, 0, 4.2, '#C0392B'), OB(3.4, 0, .5, .6, 0, 4.2, '#C0392B'), OB(0, -.15, 8.4, .9, 4.2, 4.6, '#3B2A20'), OB(0, -.25, 9.2, 1.1, 4.6, 4.75, '#2B2B2B'),
    OB(0, 0, 1.6, 1.35, .9, 2.3, '#D33A2C', 1), Object.assign(OB(0, -.01, 1.6, .02, 1.2, 2.05, '#D33A2C', 1), { txt: '雷門', tc: '#1A0F0A', vert: 0 }), OB(0, 0, 1.25, 1.15, .72, .9, '#2B2B2B'), OB(0, 0, 1.25, 1.15, 2.3, 2.48, '#2B2B2B'), OB(0, .5, .1, .1, 2.48, 4.2, '#2B2B2B')] }),
  parasol: L => ({ k: 'block', bx: [OB(L, .3, .8, .8, 0, .72, '#FBF6EE'), OB(L, .28, .84, .84, .66, .72, '#E9E2D5'), OB(L, .6, .1, .1, .72, 2.2, '#9AA0A6'), OB(L, -.1, 1.6, 1.5, 2.0, 2.2, pick(['#C8463C', '#355F86', '#F2C230'])), OB(L - .55, .4, .38, .38, 0, .8, '#9C7652')] }),
  flowers: L => ({ k: 'low', bx: [OB(L, 0, 1.1, 1.0, 0, .55, '#D9D2C6'), OB(L, .1, 1.0, .8, .55, .75, '#E86A75')] }),
  crate: L => { const tall = Math.random() < .4; return { k: tall ? 'block' : 'low', bx: tall ? [OB(L, 0, .9, .9, 0, .5, '#E0A030'), OB(L, 0, .9, .9, .5, 1.0, '#C8463C'), OB(L, .05, .85, .85, 1.0, 1.5, '#E0A030')] : [OB(L, 0, .9, .9, 0, .5, '#E0A030'), OB(L, 0, .9, .9, .5, .82, '#C8463C')] }; }, // one roll: a 3-high stack is dodged, a 2-high one is jumped (two separate rolls used to make some 3-high stacks 'jump over' ones you can't clear)
  stoolsO: L => ({ k: 'low', bx: [OB(L - .35, 0, .45, .45, 0, .52, '#B5302A'), OB(L + .35, .2, .45, .45, 0, .52, '#B5302A'), OB(L - .35, 0, .5, .5, .52, .6, '#C0392B'), OB(L + .35, .2, .5, .5, .52, .6, '#C0392B')] }),
  gachaO: L => ({ k: 'block', bx: [OB(L - .3, 0, .6, .7, 0, .9, '#E86A75'), OB(L + .3, 0, .6, .7, 0, .9, '#4E77A0'), OB(L - .3, 0, .6, .7, .9, 1.6, '#DDEFF8', 1), OB(L + .3, 0, .6, .7, .9, 1.6, '#DDEFF8', 1)] }),
  // a blue picnic sheet with lunch boxes and a cooler: jump over it
  picnic: L => ({ k: 'low', bx: [OB(L, 0, 1.7, 1.5, 0, .04, '#3A73C2'), OB(L - .4, .3, .5, .38, .04, .42, '#E9EDF0'), OB(L - .4, .3, .52, .4, .42, .48, '#3A73C2'), OB(L + .35, .5, .5, .4, .04, .16, '#2B2B2B'), OB(L + .35, .5, .5, .4, .16, .2, '#C8463C'), OB(L + .3, .05, .2, .2, .04, .32, '#5F9E5A')] }),
  // a photographer's tripod, set up to shoot the blossoms
  tripod: L => ({ k: 'block', bx: [OB(L - .3, .1, .06, .06, 0, 1.35, '#2B2B2B'), OB(L + .3, .1, .06, .06, 0, 1.35, '#2B2B2B'), OB(L, .5, .06, .06, 0, 1.35, '#2B2B2B'), OB(L, .2, .4, .3, 1.35, 1.62, '#1E1E22'), OB(L, .05, .16, .2, 1.4, 1.56, '#46525E'), OB(L, .15, .8, .45, 0, .72, '#3B4650'), OB(L, .14, .82, .1, .72, .8, '#2B2B2B')] }),
  stroller: L => ({ k: 'low', hitTop: .9, mv: 1.6, bx: [OB(L - .3, 0, .08, .08, 0, .2, '#2B2B2B'), OB(L + .3, 0, .08, .08, 0, .2, '#2B2B2B'), OB(L - .3, .7, .08, .08, 0, .2, '#2B2B2B'), OB(L + .3, .7, .08, .08, 0, .2, '#2B2B2B'), OB(L, .35, .66, .8, .22, .75, '#B9C7D6'), OB(L, .55, .7, .45, .75, 1.15, '#8DA2B8'), OB(L, -.15, .5, .06, .9, 1.1, '#46525E')] }),
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
    const bx = [OB(L, 0, w, len, .22, bodyTop, c), OB(L, cabinS, w * .92, cabinL, bodyTop, roof, c), OB(L, cabinS - .01, w * .8, .02, bodyTop + .05, roof - .08, '#22313E'),
      OB(L - w * .46, cabinS + .2, .02, cabinL - .4, bodyTop + .05, roof - .1, '#22313E'), OB(L + w * .46, cabinS + .2, .02, cabinL - .4, bodyTop + .05, roof - .1, '#22313E'), OB(L, cabinS + cabinL - .01, w * .8, .02, bodyTop + .05, roof - .08, '#22313E'),
      OB(L, -.04, w * 1.02, .12, .3, .55, '#2B2B2B'), OB(L, len - .08, w * 1.02, .12, .3, .55, '#2B2B2B'), OB(L, cabinS + .2, w * .5, cabinL - .4, roof, roof + .02, '#F4F6F8'),
      OB(L - w * .38, -.02, .24, .02, .55, .72, '#FFF6DC', 2), OB(L + w * .38, -.02, .24, .02, .55, .72, '#FFF6DC', 2), OB(L, -.02, w * .5, .02, .35, .45, '#3B3B3B'),
      OB(L - w * .42, .5, .14, .62, 0, .62, '#1C1919'), OB(L + w * .42, .5, .14, .62, 0, .62, '#1C1919'), OB(L - w * .42, len - 1.1, .14, .62, 0, .62, '#1C1919'), OB(L + w * .42, len - 1.1, .14, .62, 0, .62, '#1C1919')];
    if (t === 'taxi') bx.push(Object.assign(OB(L, cabinS + .9, .6, .3, roof, roof + .22, '#FBF6EE', 2), { txt: 'TAXI', tc: '#2B2B2B' }));
    // every ordinary car is taller than the runners: dodged, never jumped (one simple rule: low things you hop, tall things you go round). Only the low sports car is hopped
    return { k: 'block', car: 0, mv: 6.5, bx, art: 'car', av: { t, c }, artW: w * 1.04, artH: roof + (t === 'taxi' ? .24 : .02) }; },
  // a low red supercar (generic shape, no badge); like every car, something to dodge
  supercar: L => { const c = pick(['#D42A1E', '#D42A1E', '#F2C230', '#F3F3F3']);
    return { k: 'low', car: 1, vault: 1.4, mv: 10, roar: 1, bx: [OB(L, 0, 1.95, 4.5, .14, .62, c), OB(L, 1.3, 1.7, 1.9, .62, 1.0, c), OB(L, 1.28, 1.5, .02, .66, .96, '#1C2630'), OB(L, 3.9, 1.9, .25, .62, .78, '#2B2B2B'),
      OB(L - .7, -.02, .34, .02, .4, .5, '#FFF6DC', 2), OB(L + .7, -.02, .34, .02, .4, .5, '#FFF6DC', 2), OB(L, -.02, 1.1, .02, .2, .3, '#2B2B2B'),
      OB(L - .9, .55, .16, .66, 0, .6, '#1C1919'), OB(L + .9, .55, .16, .66, 0, .6, '#1C1919'), OB(L - .9, 3.2, .18, .7, 0, .62, '#1C1919'), OB(L + .9, 3.2, .18, .7, 0, .62, '#1C1919')], art: 'supercar', av: { c }, artW: 2.0, artH: 1.08 }; },
  gates: null, ogates: null,
};
// every obstacle gets its illustration (the boxes stay as the collision shape); [width, height] in metres
const ART_SPEC = { kaminarimon: [9.2, 4.75], futon: [5.2, .62], noren: [5.6, 2.75], step: [9.2, .45], pillar: [1.3, 3.6], pole: [.55, 2.9], bag: [.95, .7], rope: [5.4, .62], jokoro: [1.35, 1.95], picnic: [1.8, .55], ring: [.95, .3], papers: [1.02, .58], paperTall: [1.08, 1.88], plant: [1.15, 2.0], chair: [.95, .8], suitcase: [.95, .8], bags: [1.35, .7], crate: [.92, 1], stroller: [.8, 1.18], sign: [1.2, 1.56],
  parasol: [1.75, 2.2], flowers: [1.1, .75], leafpile: [1.35, .56], stoolsO: [1.2, .6], umbrella: [.8, 1.9], copier: [1.42, 1.38], mug: [.95, .85], toys: [1.0, .84], zabuton: [1.25, .42], pot: [1.05, .82],
  clock: [.8, .86], telescope: [.78, 1.55], gachaO: [1.22, 1.6], tripod: [.85, 1.62], stoneLanternO: [1.0, 1.9], rickshaw: [1.3, 1.75], table: [1.5, .82], chabudai: [1.5, .78], mtable: [1.55, .78],
  wboard: [1.6, 2.0], shoes: [.92, .36], slipper: [.92, .36], roomba: [.95, .32] };
for (const k in ART_SPEC) { const f = OBS[k]; if (!f) continue; OBS[k] = L => { const o = f(L); if (!o.art) { o.art = k; o.artW = ART_SPEC[k][0]; o.artH = ART_SPEC[k][1]; o.av = o.av || {};
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
      let cnt = diff < .2 || (SV.runs <= 2 && G.t < 40) ? 1 : Math.random() < .55 ? 1 : 2; if (diff > .5 && Math.random() < .25) cnt = 3;
      const ls = [0, 1, 2].sort(() => Math.random() - .5).slice(0, cnt);
      let blocks = 0;
      for (const l of ls) {
        let [t, k] = pick(lane3);
        if (k === 'block' && cnt === 3 && blocks >= 2) { const alt = lane3.filter(e => e[1] !== 'block'); if (!alt.length) continue; [t, k] = pick(alt); }
        const o = makeObs(seg, t, s + rand(-.3, .3), l); if (o.k === 'block') blocks++; row.lanes[l] = o.k;
      }
    }
    rows.push(row); n++;
    const gapT = lerp(1.3, .78, clamp(diff, 0, 1)) * rand(.95, 1.3) * (SV.runs <= 2 && G.t < 40 ? 1.45 : 1); // new players get a little more room for their first runs
    s += Math.max(9, gapT * spd);
  }
  seg.rows = rows;
  // moving obstacles must have a clear lane in front of them
  for (const o of seg.obs) if (o.mv) { if (seg.obs.some(p => p !== o && p.lane === o.lane && p.s0 < o.s0 && p.s0 > o.s0 - 40)) o.mv = 0; }
  // hay lines that weave through the rows
  const rowAt = q => rows.find(rw => Math.abs(rw.s - q) < 1.6);
  let lane = 1, q = seg.first ? 22 : HW + 8, on = true, runLeft = rand(14, 30);
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
        addItem(seg, type, q, lane, y);
      }
    }
    q += 1.7; runLeft -= 1.7;
    if (runLeft <= 0) { on = !on; runLeft = on ? rand(14, 34) : rand(4, 12); if (Math.random() < .5) lane = clamp(lane + (Math.random() < .5 ? -1 : 1), 0, 2); }
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
  if (!G.pomPeek && !G.pom.on && G.char !== 'pom' && (G.planDay >= 2 || G.t > 52) && th.kind !== 'room' && th.kind !== 'train' && th.kind !== 'glass' && L > 80) G.pomPeek = { seg, s: L * .6, dir: Math.random() < .5 ? 1 : -1, b: { who: 'pom', view: 'back', ph: 0, look: 0, show: false, depth: 0 } };
  // Pom's sunflower seeds: once the run is well under way (day 2, or a long day 1), until Pom has joined
  if (!G.pom.on && G.char !== 'pom' && !(G.pomSeedAt > 0 && G.dist - G.pomSeedAt < 600) && (G.planDay >= 2 || G.t > 78) && ((G.pomPeek && G.pomPeek.ph) || G.t > 110) && rows.length >= 1 && L > 50 && Math.random() < .7) {
    // just past a row of obstacles, in a lane that the next row leaves open
    const i = Math.max(0, ((rows.length - 1) / 2) | 0), at = rows[i].s + 4.5, nx = rows[i + 1], free = [0, 1, 2].filter(l => !nx || nx.s - at > 7 || !nx.lanes[l]);
    if (free.length && at < L - 20) { seg.items = seg.items.filter(it => !(Math.abs(it.s - at) < 2.5)); addItem(seg, 'pomseed', at, pick(free), .6); G.pomSeedAt = G.dist; G.pomSeedN = (G.pomSeedN || 0) + 1; } }
  // one sightseeing stamp per Tokyo spot, in the middle of the stretch
  if (th.stamp && rows.length > 2 && !(seg.step && seg.step.cont)) { const i = (rows.length / 2) | 0; const at = (rows[i].s + rows[i + 1 < rows.length ? i + 1 : i].s) / 2 + 1; const free = [0, 1, 2].filter(l => !rows[i].lanes[l]); addItem(seg, 'stamp', at, free.length ? pick(free) : 1, .6); }
}
function addItem(seg, type, s, lane, y) { seg.items.push({ type, s, lane, lat: LANES[lane], y, got: 0, ph: Math.random() * 6 }); }
