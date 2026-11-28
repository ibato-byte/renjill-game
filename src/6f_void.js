/* ================= 2026-11-28 舞浜の夢の遊園地：谷のつり橋（板の無いレーン）・曲線の道・トロッコ（乗り物） ================= docs/MAIHAMA-2026-11-28.md
   オーナーの依頼：「左だけ・真ん中だけ・右だけ、といったように、どこかのレーン以外は落ちたらゲームオーバーで奈落の底まで落ちていく、これまでにないコース」
   「右折や左折も、直角に曲がるのではなく曲線を描いて曲がっていく」「人気の乗り物に乗って移動する（オオタカのように）」
   「現実的におかしくなったり、物理的におかしくなったり、バグが起こったり、止まってしまったりしないように」
   作り：
   ・th.void のある場所は、ふつうの床・かべを作らない。板の橋（レーンごとの板）・手すりのなわ・橋をささえる岩の柱・谷の底と崖を、ここで作る
   ・seg.pits＝[{ a, b, open: [左, 中, 右] }]。板の無いレーンの上に足がついたら、谷へ落ちる（跳んでいる間は落ちない。おりた所に板が無ければ落ちる）
   ・ずるくならないように：板の無い所は 9〜12m・その間は全部のレーンに板が 11m 以上（速さに合わせてのばす）・最初は 2 レーン残す・牧草は板のあるレーンに並ぶ（牧草を追えば落ちない）
     無敵の間・ダッシュ・フィーバー・紙飛行機・練習の間は、板のあるレーンへ自動で寄る（角を自動で曲がるのと同じ）
   ・曲線：短い道（13m）を 15 度ずつ向きを変えて 6 本つなぐと 90 度。つなぎ目は角が無く（goStraight）、いる場所はそのまま新しい向きで測りなおす。カメラは、つなぎ目の前後で少しずつ先へ回す
   ・トロッコ：乗っている間は操作しない。のぼりはおそく、くだりは速い。3 人は 1 台ずつのトロッコに座る */
const MV_EXT = .5, MV_CW = 30, MV_CD = -46; /* つなぎ目の重ね・崖までの横の距離・谷の深さ */
function mvOpenAt(seg, s) { const P = seg && seg.pits; if (!P) return null; for (const p of P) if (s >= p.a && s < p.b) return p.open; return null; } /* null＝3 レーンとも板がある */
function mvLaneOf(lat) { return clamp(Math.round(lat / LANE) + 1, 0, 2); }
function mvNear(open, lane) { let best = -1; for (let k = 0; k < 3; k++) if (open[k] && (best < 0 || Math.abs(k - lane) < Math.abs(best - lane))) best = k; return best; }
/* 板の無い所の並び：最初は 1 レーンだけ無い → その後は「左だけ・真ん中だけ・右だけ」。前と同じレーンは続けない */
function mvPattern(seg) { const L = seg.len, out = [], sp = Math.max(12, (G.speedEst || G.speed || 13)), rest = () => Math.max(11, sp * .85) + rand(0, 3); let s = (seg.first ? 26 : 13) + rand(0, 2), prev = -1, n = 0;
  const easy = !(seg.step && seg.step.cont); /* コースの最初の橋は、やさしく始める */
  while (s + 9 + 9 < L) { const len = rand(9, 12); let open;
    if ((easy && n === 0) || G.easy) { const miss = (Math.random() * 3) | 0; open = [1, 1, 1]; open[miss] = 0; prev = -1; } /* 「やさしい」で遊んでいる時は、いつも 2 レーン残す */
    else { let k = (Math.random() * 3) | 0; if (k === prev) k = (k + 1 + ((Math.random() * 2) | 0)) % 3; open = [0, 0, 0]; open[k] = 1; prev = k; }
    out.push({ a: s, b: Math.min(s + len, L - 9), open }); s += len + rest(); n++; }
  return out.length ? out : null; }
function mvStretches(seg) { const L = seg.len, out = []; let s = -MV_EXT; for (const p of seg.pits || []) { if (p.a > s) out.push({ a: s, b: p.a, open: null }); out.push(p); s = p.b; } if (s < L + MV_EXT) out.push({ a: s, b: L + MV_EXT, open: null }); return out; }
function mvEdge(open, sd) { if (!open) return sd * ROAD; let k = sd < 0 ? 0 : 2; while (k >= 0 && k <= 2 && !open[k]) k -= sd; return k === (sd < 0 ? 0 : 2) ? sd * ROAD : LANES[k] + sd * LANE / 2; } /* 板のある所の、外がわのへり */
/* トロッコの線路の高さ（コースの地面からの高さ m）：巻き上げの坂 → 大きなくだり → 山と谷 → 最後は地面へ */
const MV_CART_H = [5, 10, 12, 3, 7, 2, 8, 4, 9, 2, 6, 3, 8, 2, 5, 7, 3, 1, 0, 0];
function mvRideTerrain(seg) { const base = seg.base != null ? seg.base : seg.e0 || 0, n = G.mvCartN = (seg.step && seg.step.cont ? (G.mvCartN || 0) + 1 : 0), h = MV_CART_H[Math.min(n, MV_CART_H.length - 1)], d = base + h - (seg.e0 || 0); seg.cartN = n; seg.hp = Math.abs(d) > .01 ? { a: 0, b: seg.len, d, hump: 0, w2: 0, shape: 'slope' } : null; }
function mvBuild(seg) { const th = seg.th, o = th.void, L = seg.len, rail = !!o.rail; seg.fS = 0; seg.fE = L;
  if (th.ride) mvRideTerrain(seg);
  seg.pits = o.pits ? mvPattern(seg) : null;
  const bend = Math.abs(seg.turnIn || 0) < 1 ? Math.abs(seg.turnIn || 0) : 0, exF = MV_CW * Math.tan(Math.max(bend, 1 / 6) * Math.PI / 4) + 1; /* 曲線のつなぎ目：外がわにすき間ができないよう、崖と谷の底を少し長く作る */
  let i = 0;
  if (rail) { /* 線路：まくら木（1m ごと）・2 本のレール・下の太い木のけた */
    for (let a = -MV_EXT; a < L + MV_EXT - .01; a += 1, i++) seg.floor.push({ v: quad(seg, [[a + .2, -1.05, 0], [a + .62, -1.05, 0], [a + .62, 1.05, 0], [a + .2, 1.05, 0]]), c: i % 2 ? [112, 86, 62] : [120, 93, 68], pat: null, ti: i, a: a + .2, b: a + .62, mid: 1 });
    for (const q of [-.62, .62]) for (let a = -MV_EXT; a < L + MV_EXT - .01; a += 2) { const b = Math.min(a + 2, L + MV_EXT); seg.lines.push({ a: [a, q, -.12], b: [b, q, -.12], c: '#5A4230', w: .3 }, { a: [a, q, .09], b: [b, q, .09], c: '#C9D0D6', w: .11 }); } } /* レールは 2m ずつ（坂の形に沿う。1 本の線だと、坂でまくら木から浮く） */
  else for (const st of mvStretches(seg)) { /* 板：レーンごとに 1.5m ずつ。色を少しずつ変えて、古い板の橋に */
    for (let a = st.a; a < st.b - .01; a += 1.5, i++) { const b = Math.min(a + 1.5, st.b);
      for (let k = 0; k < 3; k++) { if (st.open && !st.open[k]) continue; const l0 = k === 0 ? -ROAD : LANES[k] - LANE / 2, l1 = k === 2 ? ROAD : LANES[k] + LANE / 2;
        seg.floor.push({ v: quad(seg, [[a, l0, 0], [b, l0, 0], [b, l1, 0], [a, l1, 0]]), c: floorTone(th, 'road', i + k), pat: th.rpat, ti: i, a, b, mid: 1 }); } }
    if (st.open) for (let k = 0; k < 3; k++) { if (st.open[k]) continue; /* 板の無いレーン：手前と先に、折れた板の残り（長さがばらばら）と、黄色い矢印（板のあるレーンへ） */
      const c0 = LANES[k], near = mvNear(st.open, k), dir = Math.sign(near - k) || 1;
      for (let j = 0; j < 3; j++) { const l0 = c0 - LANE / 2 + j * LANE / 3 + .03, l1 = l0 + LANE / 3 - .06, e1 = rand(.25, .95), e2 = rand(.2, .8);
        seg.floor.push({ v: quad(seg, [[st.a, l0, 0], [st.a + e1, l0, 0], [st.a + e1, l1, 0], [st.a, l1, 0]]), c: [150 - j * 8, 108 - j * 6, 70 - j * 4], pat: null, ti: j, a: st.a, b: st.a + e1, mid: 1 });
        seg.floor.push({ v: quad(seg, [[st.b - e2, l0, 0], [st.b, l0, 0], [st.b, l1, 0], [st.b - e2, l1, 0]]), c: [150 - j * 8, 108 - j * 6, 70 - j * 4], pat: null, ti: j, a: st.b - e2, b: st.b, mid: 1 }); }
      for (let j = 0; j < 2; j++) { const s = st.a - 2.6 - j * 2.4; if (s < 1) break; seg.lines.push({ a: [s, c0 - dir * .3, .02], b: [s + .36, c0 + dir * .3, .02], c: '#F2C230', w: .07, glowN: 1 }, { a: [s + .72, c0 - dir * .3, .02], b: [s + .36, c0 + dir * .3, .02], c: '#F2C230', w: .07, glowN: 1 }); } }
    /* 夜：残っている板のふちが、白く光る（2026-11-28：夜明け前は、板と谷の暗さがほとんど同じで、どこに板が無いのか見分けにくかった。明るさを測って分かった） */
    if (st.open) for (let k = 0; k < 3; k++) if (st.open[k]) for (const e of [-1, 1]) { const nb = k + e; if (nb >= 0 && nb <= 2 && st.open[nb]) continue; const lt = LANES[k] + e * (LANE / 2 - .04); for (let s = st.a; s < st.b - .01; s += 3) seg.lines.push({ a: [s, lt, .03], b: [Math.min(st.b, s + 3), lt, .03], c: '#9C7448', w: .05, glowN: 1, mvEdge: 1 }); }
    for (const sd of [-1, 1]) { const e = mvEdge(st.open, sd) + sd * .08; /* 手すりのなわ（2 本）と、3m ごとの柱。板の無い所では、残った板のへりに沿う */
      seg.lines.push({ a: [st.a, e, .98], b: [st.b, e, .98], c: '#7A5A3A', w: .07 }, { a: [st.a, e, .52], b: [st.b, e, .52], c: '#8A6A48', w: .05 });
      for (let a = Math.ceil(st.a / 3) * 3; a < st.b - .01; a += 3) seg.lines.push({ a: [a, e, 0], b: [a, e, 1.05], c: '#5A4230', w: .1 }); } }
  if (seg.turn !== 0 || seg.fork) { /* 先が角（直角に曲がる）の時：角の四角に板の広い台を作る（コースの中では、いつも角の無いつなぎ目。テストや続きからで、橋 1 本だけの時のため） */
    for (let a = L, j = 0; a < L + HW - .01; a += 1.5, j++) seg.floor.push({ v: quad(seg, [[a, -HW, 0], [a + 1.5, -HW, 0], [a + 1.5, HW, 0], [a, HW, 0]]), c: floorTone(th, 'road', j), pat: th.rpat, ti: j, a, b: a + 1.5, mid: 1 });
    seg.lines.push({ a: [L + HW, -HW, .98], b: [L + HW, HW, .98], c: '#7A5A3A', w: .07 }, { a: [L + HW, -HW, .52], b: [L + HW, HW, .52], c: '#8A6A48', w: .05 }); seg.fE = L + HW; }
  /* 橋・線路をささえる物：岩の柱（谷の底まで）と横木。線路は木を組んだやぐら */
  const yB = (seg.base != null ? seg.base : (seg.e0 || 0)) - (seg.e0 || 0); /* コースの地面の高さ（この道の始まりから見て）。谷の底・崖は、線路が上がり下がりしても同じ高さに */
  { const bx = [], bxR = [], bxU = []; for (let a = rail ? 3 : 6; a < L - 1; a += rail ? 6.5 : 12) { if (rail) { const bx = bxR; for (const q of [-.9, .9]) bx.push(B(q, a, .22, .22, MV_CD - 14, -.2, '#6B4E36')); bx.push(B(0, a, 2.2, .2, -3.2, -3, '#6B4E36'), B(0, a, 2.2, .2, -9, -8.8, '#6B4E36'), B(0, a, 2.2, .24, -.45, -.2, '#5A4230')); }
      else { /* つり橋の塔：板の外がわに立つ丸太の塔（谷の底から）と、塔と塔の間にたるんだ太いなわ。板の下には何も置かない（床より下の箱は、床の上に重なって見えるため） */
        for (const sd of [-1, 1]) { const lt = sd * (ROAD + .62); bxU.push(B(lt, a, .46, .46, MV_CD, -.5, '#6B4E36')); bx.push(B(lt, a, .46, .46, -.5, 3.5, '#6B4E36'), B(lt, a - .08, .62, .62, 3.5, 3.72, '#8A6444'));
          const a2 = Math.min(a + 12, L + MV_EXT), n2 = 6; for (let j = 0; j < n2; j++) { const t0 = j / n2, t1 = (j + 1) / n2, y = t => 3.45 - 1.9 * Math.sin(Math.PI * t); seg.lines.push({ a: [lerp(a, a2, t0), lt, y(t0)], b: [lerp(a, a2, t1), lt, y(t1)], c: '#5A4230', w: .09 });
            if (j > 0) { const sx = lerp(a, a2, t0), ed = mvEdge(mvOpenAt(seg, sx), sd); if (Math.abs(ed) > ROAD - .05) seg.lines.push({ a: [sx, lt, y(t0)], b: [sx, lt - sd * .5, 1.0], c: '#8A6A48', w: .04 }); } } } } }
    if (bx.length) seg.props.push(mkProp(seg, bx, { big: 1 }));
    /* 板・まくら木より下の所（塔の足・線路のやぐら）は、別の物として持つ。真上を走っている間は、板にかくれて見えないはずなので描かない（6g_voidfx.js の mvxHide。
       前は、床より下の物も床の上に重ねて描かれ、塔の足が板の上を画面の下までつきぬけて見えた。2026-11-28） */
    for (const u of [bxR, bxU]) if (u.length) { const pu = mkProp(seg, u, { big: 1 }); pu.mvBelow = 1; seg.props.push(pu); } }
  /* 谷：底（岩と、まん中の川）・両がわの崖（地層の線）・崖の上の木 */
  for (let a = -exF; a < L + exF - .01; a += 13) { const b = Math.min(a + 13, L + exF);
    const D = MV_CD + yB, T = 16 + yB;
    seg.floor.push({ v: quad(seg, [[a, -MV_CW, D], [b, -MV_CW, D], [b, MV_CW, D], [a, MV_CW, D]], 1), c: [74, 82, 80], pat: null, far: 1, a, b });
    seg.floor.push({ v: quad(seg, [[a, -7, D + .2], [b, -7, D + .2], [b, 5, D + .2], [a, 5, D + .2]], 1), c: C('#3E7A86'), pat: 'sea', far: 1, a, b });
    for (const sd of [-1, 1]) { const lat = sd * MV_CW, n = [-sd * seg.r[0], -sd * seg.r[1]];
      seg.walls.push({ v: quad(seg, sd < 0 ? [[a, lat, D], [b, lat, D], [b, lat, T], [a, lat, T]] : [[b, lat, D], [a, lat, D], [a, lat, T], [b, lat, T]], 1), c: C(((a / 13) | 0) % 2 ? '#9A8168' : '#927A62'), n, sh: sd < 0 ? .94 : .82 }); } }
  for (const sd of [-1, 1]) { const lat = sd * (MV_CW - .15); for (const [y, c, w] of [[10, '#B39A7C', .5], [4, '#7E6851', .7], [-3, '#A88E70', .4], [-12, '#75604B', .9], [-22, '#8E775E', .5], [-33, '#6A5644', .8]]) seg.lines.push({ a: [-exF, lat, y + yB], b: [L + exF, lat, y + yB], c, w, abs: 1 });
    for (let a = 2; a < L; a += rand(6, 9)) seg.spr.push({ lat: sd * (MV_CW + 3 + rand(0, 4)), s: a, y: 15.5 + yB - (segE(seg, a) - (seg.e0 || 0)), h: rand(7, 10), w: rand(8, 11), img: 'canopy_green', far: 1, keep: 1 }); }
  /* 牧草：板のあるレーンに並べる（牧草を追えば落ちない）。線路は、まん中に */
  if (rail) { for (let s = 2; s < L - 1; s += 2.6) addItem(seg, Math.random() < .04 ? 'goldhay' : 'hay', s, 1, .9); }
  else { const P = seg.pits || []; let lane = 1; for (let s = seg.first ? 12 : 3; s < L - 2; s += 2.4) { const p = P.find(q => s >= q.a - 7 && s < q.b); if (p) { const t = mvNear(p.open, lane); if (t >= 0) lane = t; } addItem(seg, Math.random() < .03 ? 'goldhay' : 'hay', s, lane, .5); } } }
{ const bg0 = buildGeometry; buildGeometry = function (seg) { if (seg.th.void) { mvBuild(seg); return; } bg0(seg); }; }
/* 続けるとき・無敵の間：板のあるレーンへ */
function mvSafeLane(seg) { if (!seg || !seg.pits) return; const open = mvOpenAt(seg, G.s) || mvOpenAt(seg, G.s + 6); if (!open || open[G.lane]) return; const k = mvNear(open, G.lane); if (k >= 0) { G.lane = k; G.prevLane = k; G.lat = LANES[k]; } }
function mvAssist() { return G.invT > 0 || G.pow.fly > 0 || G.pow.dash > 0 || G.fever > 0 || !!G.practice || !!(G.tut && G.tut.some && G.tut.some(x => !x.done)); }
function mvTick(dt) { if (G.mode !== 'play') return; const seg = curSeg(); if (!seg) return; const P = G.player, F = G.follow, M = G.pom, ride = seg.th.ride ? 1 : 0;
  P.cart = F.cart = ride; if (M) M.cart = ride; if (ride) { if (G.lane !== 1) { G.prevLane = G.lane; G.lane = 1; } return; }
  if (!seg.pits) return;
  const assist = mvAssist();
  if (assist) { const ah = mvOpenAt(seg, G.s + Math.max(5, G.speed * .5)) || mvOpenAt(seg, G.s); if (ah && !ah[G.lane]) { const k = mvNear(ah, G.lane); if (k >= 0) { G.prevLane = G.lane; G.lane = k; } } }
  for (const b of [F, M]) { if (!b || b.lat == null) continue; const ob = mvOpenAt(seg, G.s - (b.back || 0)); if (ob && !ob[mvLaneOf(b.lat)]) { const k = mvNear(ob, mvLaneOf(b.lat)); if (k >= 0) b.lat = lerp(b.lat, LANES[k], Math.min(1, dt * 22)); } } /* ユズ・クリも、板の上を走る */
  const open = mvOpenAt(seg, G.s); if (!open) return; if (G.y > .06 || G.air) return; /* 跳んでいる間は落ちない */
  if (open[mvLaneOf(G.lat)]) return;
  if (assist) { const k = mvNear(open, G.lane); if (k >= 0) { G.lane = k; G.lat = LANES[k]; } return; }
  die('pit'); }
{ const up0 = update; update = function (dt) { up0(dt); try { mvTick(dt); } catch (e) { reportErr(e); } }; }
/* 曲線の道：つなぎ目の前後で、カメラの向きを少しずつ先へ回す（つなぎ目の手前で半分、こえてから残りの半分） */
function mvYawLead(seg) { const L = seg.len, nx = G.segs[G.ci + 1]; let a = 0;
  if (seg.turnIn && Math.abs(seg.turnIn) < 1 && !seg.halfIn) a -= seg.turnIn * Math.PI / 4 * (1 - sstep(clamp(G.s / (L * .5), 0, 1)));
  if (seg.turn === 0 && !seg.fork && nx && nx.turnIn && Math.abs(nx.turnIn) < 1 && !nx.halfIn) a += nx.turnIn * Math.PI / 4 * sstep(clamp((G.s - L * .5) / (L * .5), 0, 1));
  return a; }
/* 短い道が続く所（曲線・線路）は、先の道を多めに作っておく（4 本先までだと 50m ほど先で道がとぎれて見える） */
function mvNeedMore() { if (!G.courseQ || !G.courseQ.length) return false; const h = THEMES[G.courseQ[0].t]; if (!h || !h.void) return false; if (G.segs.length - G.ci >= 16) return false; let ah = 0; for (let i = G.ci + 1; i < G.segs.length; i++) ah += G.segs[i].len; return ah < 140; }
/* トロッコの速さ：のぼりはおそく、くだりは速い */
function mvRideK(seg) { const L = seg.len, sl = (segE(seg, Math.min(L, G.s + 1.5)) - segE(seg, Math.max(0, G.s - 1.5))) / 3; return clamp(1.08 - sl * 2.2, .6, 1.7); }
/* 谷の空：地平線より下は、霧のかかった谷の暗さ（ふつうの場所は床の色でぬるので、板の色の地面が広がって見えてしまう） */
{ const ds1 = drawSky; drawSky = function (seg) { ds1(seg); if (!seg || !seg.th.void || G.skyIn) return; const hz = HORIZON - Math.tan(CAM.pitch) * FOCAL, y0 = Math.max(0, hz); if (y0 >= H) return; const N = LT.night > .5, g = ctx.createLinearGradient(0, y0, 0, H);
  g.addColorStop(0, N ? 'rgb(44,52,84)' : 'rgb(176,190,196)'); g.addColorStop(.3, N ? 'rgb(28,34,58)' : 'rgb(110,124,128)'); g.addColorStop(1, N ? 'rgb(12,14,28)' : 'rgb(58,66,70)'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0); }; }
/* トロッコの絵（木の箱・鉄の帯・車輪）。走る人の後ろから見るので、前の板を先に描き、後ろの板を体の手前に描く */
let MV_CART = null;
function mvCartArt() { if (MV_CART) return MV_CART; const mk2 = (fn) => { const c = document.createElement('canvas'); c.width = 220; c.height = 170; fn(c.getContext('2d'), 220, 170); return c; };
  const wood = (g, x, y, w, h, c0, c1) => { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; rrect(g, x, y, w, h, 7); g.fill(); g.strokeStyle = 'rgba(60,40,24,.35)'; g.lineWidth = 2; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x + 4, y + h * k / 4); g.lineTo(x + w - 4, y + h * k / 4); g.stroke(); } };
  MV_CART = { back: mk2((g, W2, H2) => { wood(g, 34, 46, W2 - 68, 70, '#8A6444', '#6E4E34'); g.fillStyle = 'rgba(30,20,12,.55)'; rrect(g, 42, 52, W2 - 84, 58, 5); g.fill(); g.fillStyle = '#5E6369'; g.fillRect(30, 44, W2 - 60, 7); }),
    front: mk2((g, W2, H2) => { g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(W2 / 2, H2 - 8, 92, 9, 0, 0, 7); g.fill();
      for (const x of [34, W2 - 34]) { g.fillStyle = '#3B3F45'; g.beginPath(); g.arc(x, H2 - 24, 19, 0, 7); g.fill(); g.fillStyle = '#8A939B'; g.beginPath(); g.arc(x, H2 - 24, 11, 0, 7); g.fill(); g.fillStyle = '#3B3F45'; g.beginPath(); g.arc(x, H2 - 24, 4, 0, 7); g.fill(); }
      wood(g, 14, 62, W2 - 28, 84, '#B58254', '#8A5E3A'); g.fillStyle = '#5E6369'; g.fillRect(10, 60, W2 - 20, 9); g.fillRect(10, 134, W2 - 20, 8); for (const x of [26, W2 / 2, W2 - 26]) { g.fillStyle = '#4A4F55'; g.fillRect(x - 5, 60, 10, 84); g.fillStyle = '#C9D0D6'; for (const y of [66, 100, 138]) { g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill(); } }
      g.fillStyle = '#F2C230'; g.beginPath(); g.moveTo(W2 / 2, 84); g.lineTo(W2 / 2 + 13, 118); g.lineTo(W2 / 2 - 13, 118); g.closePath(); g.fill(); g.fillStyle = '#5C9E48'; g.fillRect(W2 / 2 - 2, 76, 4, 10); }) }; /* 前の板のしるし：にんじんの形（会社のマークではない） */
  return MV_CART; }
function mvDrawCart(b, part) { const sp = spriteAt(b.wx, b.wy, b.wz); if (!sp) return; const img = mvCartArt()[part], w = 1.5 * sp.k * (b.who === 'pom' ? .78 : 1), h = w * img.height / img.width, a0 = ctx.globalAlpha; ctx.globalAlpha = 1; ctx.drawImage(img, sp.sx - w / 2, sp.sy - h * (part === 'back' ? .98 : .78), w, h); ctx.globalAlpha = a0; }
{ const dbw0 = drawBunnyWorld; drawBunnyWorld = function (b) { const on = b.cart && G.mode !== 'title'; if (on) try { mvDrawCart(b, 'back'); } catch (e) { reportErr(e); } dbw0(b); if (on) try { mvDrawCart(b, 'front'); } catch (e) { reportErr(e); } }; }
