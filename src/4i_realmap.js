/* ---- 上から見た東京：本物の地図にそった町（2026-11-17 夜 オーナー「鳥と降りていく時の景色を、物理的にも地理的にも東京に近く。ビルが変に重ならないように。
   イラストだけで終わらせず立体に、現実の映像のように」） docs/AERIAL-REAL-2026-11-17.md
   座標：塔の足もとを (0,0) にした、東 x・北 y（km）。緯度・経度から計算した。そこから、場所の向き（face）に合わせて世界の座標へ回す。
   ・高いビル：本物の場所・高さ・大きさ（m）の立体の箱（窓の帯・屋上の機械室・夜の航空障害灯）
   ・線路：何本も並んだ線路の帯と、走る電車（立体の長い箱）
   ・首都高：高さ 12m の高架（橋げた・柱・走る車の光）
   ・川・運河：本物の位置の水の帯と、橋
   ・お寺・公園：屋根のある本堂、森 */
const RM_TOWER = { // 赤い電波塔のまわり（芝公園・浜松町・汐留・虎ノ門・麻布台・六本木・品川）
  land: [0.14, -0.14], // オオタカが着地する所（芝公園）
  far: [[5.9, 5.7, 'white']], // [M29] 8.2km 先の押上の電波塔（立体）
  bld: [
    // [x, y, 幅, 奥行き, 高さ, 色 0〜4] 本物の高いビル
    [-0.49, 0.21, 70, 70, 325, 1], [-0.42, 0.14, 45, 40, 237, 0], [-0.58, 0.28, 40, 40, 220, 4], // 麻布台（いちばん高いビルと 2 本）
    [0.39, 0.91, 60, 55, 255, 1], [0.33, 1.02, 55, 50, 266, 1], [0.48, 1.03, 45, 45, 185, 0], [0.52, 0.86, 40, 40, 221, 4], // 虎ノ門（4 本）
    [1.56, 0.67, 55, 45, 213, 3], [1.45, 0.78, 45, 40, 200, 1], [1.68, 0.78, 40, 40, 192, 0], [1.75, 0.55, 45, 40, 173, 2], [1.4, 0.55, 40, 35, 150, 4], [1.62, 0.92, 40, 40, 168, 1], [1.84, 0.7, 35, 35, 140, 0], // 汐留（ビルのかたまり）
    [1.04, -0.37, 60, 50, 235, 1], [1.12, -0.25, 40, 40, 160, 0], [0.92, -0.45, 35, 35, 120, 4], // 浜松町の駅の前
    [-1.47, 0.21, 60, 60, 238, 3], [-1.31, 0.77, 60, 55, 248, 1], [-1.6, 0.35, 40, 40, 160, 0], [-1.2, 0.6, 40, 40, 150, 4], [-1.42, 0.05, 35, 35, 120, 2], // 六本木（2 本の高いビルと、まわり）
    [-0.42, 0.99, 50, 50, 153, 0], [-0.3, 1.12, 40, 40, 140, 4], // 赤坂
    [0.62, 1.8, 50, 45, 150, 4], [0.85, 1.65, 45, 40, 140, 0], [0.4, 1.95, 40, 40, 130, 1], // 霞が関
    [1.45, -1.35, 35, 35, 140, 4], [1.7, -1.6, 35, 35, 150, 0], [1.25, -1.75, 35, 35, 130, 4], [1.85, -1.95, 35, 35, 145, 1], // 芝浦のマンション
    [-0.3, -3.35, 55, 45, 150, 1], [0.1, -3.45, 50, 45, 145, 0], [-0.5, -3.55, 45, 40, 130, 4], [0.25, -3.2, 45, 40, 120, 2], [-0.1, -3.7, 40, 40, 140, 1], // 品川
    [3.5, 0.8, 40, 40, 190, 4], [3.7, 0.55, 40, 40, 175, 0], [3.3, 1.05, 40, 40, 160, 4], // 勝どき・月島のタワーマンション（海の向こう）
    [-4.87, 3.44, 70, 50, 243, 2], [-4.6, 3.2, 55, 50, 223, 1], [-4.75, 3.75, 55, 50, 210, 0], [-5.1, 3.1, 50, 50, 200, 3], [-4.4, 3.55, 50, 45, 204, 1], [-5.0, 3.9, 45, 45, 190, 4], [-4.45, 2.95, 45, 45, 180, 0], // [M28] 新宿の高層ビル街（都庁と 6 本）
  ],
  rail: [[1.17, 0.86], [1.12, 0.3], [1.04, -0.37], [0.75, -0.95], [0.2, -1.43], [-0.25, -2.4], [-0.62, -3.34]], railW: 46, // 新橋 → 浜松町 → 田町 → 品川（山手線・京浜東北線・東海道線…何本も並ぶ）
  hwy: [[[1.6, 1.1], [1.48, 0.2], [1.38, -0.45], [0.95, -1.5], [0.6, -2.5], [0.4, -3.3]], [[1.48, 0.2], [0.9, 0.35], [0.3, 0.55], [-0.3, 0.6], [-1.0, 0.45], [-1.8, 0.3]], [[0.3, 0.55], [0.15, 1.2], [0.25, 2.2]]], // 首都高：海ぞいの 1 号線・六本木へ行く 3 号線・都心環状線
  water: [[[1.95, 1.0], [1.9, 0.2], [1.75, -0.6], [1.5, -1.2], [1.2, -2.2], [0.9, -3.0]], 70], // 運河（芝浦）
  temple: [[0.23, -0.12, 52, 40, 22]], // 増上寺の本堂（芝公園の中）
  ponds: [[1.68, 0.17, .09], [1.22, -0.3, .03]],
  stations: [[0, .02, .1], [0, .33, .4], [0, .58, .65], [0, .93, 1]], // [M27] 駅のホームの屋根（新橋・浜松町・田町・品川）
  bridge: [[1.28, -2.3], [2.25, -2.62], 126, 52], // [M18] 海の上の吊り橋（2 本の白い塔・高さ 126m、道は海の上 52m）
  park: [[[-0.05, 0.15], [0.3, 0.2], [0.45, -0.05], [0.4, -0.5], [0.1, -0.55], [-0.08, -0.25]], // 芝公園の森
    [[1.45, 0.4], [1.85, 0.42], [1.95, 0.05], [1.8, -0.15], [1.5, -0.1], [1.42, 0.15]], // [M20] 海ぞいの大きな庭園（池と森）
    [[1.12, -0.22], [1.3, -0.2], [1.32, -0.36], [1.14, -0.38]], // [M21] 浜松町の駅の前の庭園
    [[-0.95, 0.25], [-0.75, 0.3], [-0.72, 0.1], [-0.92, 0.05]]], // [M22] 麻布の大きなお寺と墓地の森
};
const RM_SKY = { // 押上の電波塔のまわり（隅田川・浅草・錦糸町・両国・上野・大手町）
  land: [-0.85, 0.45], // 隅田公園
  far: [[-5.9, -5.7, 'red']], // [M29] 8.2km 先の赤い電波塔（立体）
  bld: [
    [0.39, -1.5, 55, 50, 130, 1], [0.2, -1.6, 45, 40, 110, 0], [0.55, -1.35, 40, 40, 100, 4], [0.3, -1.75, 40, 40, 95, 2], // 錦糸町
    [-1.25, -1.85, 70, 60, 40, 5], // 両国の国技館（ひくく大きい・緑の屋根）
    [-1.4, 0.15, 35, 35, 60, 0], [-1.6, -0.1, 30, 30, 55, 4], [-1.3, 0.4, 30, 30, 50, 1], // 浅草の駅のまわり
    [-0.2, -0.15, 40, 40, 90, 1], [0.15, -0.2, 35, 35, 70, 4], // 押上の駅の上のビル
    [-3.6, -0.6, 45, 40, 110, 0], [-3.3, -0.9, 40, 40, 90, 4], // 上野
    [-4.0, -3.1, 50, 45, 120, 1], [-3.8, -3.3, 45, 40, 110, 0], // 秋葉原
    [-4.4, -4.1, 60, 55, 200, 1], [-4.6, -4.3, 55, 50, 190, 3], [-4.2, -4.4, 55, 50, 180, 0], [-4.8, -3.9, 50, 50, 170, 4], [-4.3, -3.8, 45, 45, 160, 1], // 大手町・丸の内
    [1.6, -1.0, 40, 40, 80, 0], [2.2, -2.6, 40, 40, 100, 4], // 亀戸・住吉
  ],
  rail: [[-1.4, 0.1], [-0.9, 0.05], [-0.2, -0.02], [0.4, 0.0], [1.4, 0.15], [2.4, 0.3]], railW: 24, // 東武線（浅草から川をわたって、押上の電波塔の横）
  rail2: [[-3.8, -2.4], [-1.8, -2.15], [0.39, -1.6], [2.0, -1.4], [3.5, -1.2]], // 総武線（秋葉原 → 両国 → 錦糸町）
  hwy: [[[-0.6, 3.0], [-0.85, 1.6], [-1.0, 0.6], [-1.1, -0.4], [-1.45, -1.3], [-1.6, -2.3]], [[-1.45, -1.3], [-0.5, -1.15], [0.8, -1.0], [2.5, -0.9]]], // 首都高：川ぞいの 6 号向島線・東へ行く 7 号線
  water: [[[-0.5, 0.0], [0.4, -0.08], [1.4, -0.06], [2.5, -0.04]], 26], // 北十間川（塔のすぐ南）
  temple: [[-1.35, 0.3, 40, 30, 18]], // 浅草寺の本堂
  pagoda: [[-1.3, 0.52, 53]],
  ponds: [[-3.55, -0.45, .12]], // 上野の池
  stations: [[0, .55, .68], [1, .48, .56], [1, .12, .2]], // 押上の電波塔の駅・錦糸町・両国 // [M19] 浅草の五重塔（高さ 53m）
  park: [[[-3.9, 0.3], [-3.3, 0.35], [-3.2, -0.3], [-3.5, -0.6], [-3.95, -0.4]], // [M23] 上野の大きな公園（森と池）
    [[0.25, -1.62], [0.5, -1.6], [0.52, -1.78], [0.27, -1.8]], // [M24] 錦糸町の公園
    [[-0.75, 0.9], [-0.55, 0.95], [-0.6, 0.3], [-0.78, 0.3]]], // [M25] 隅田川の東の岸の公園（川ぞいの細長い森）
};
function rmFrame(seg) { const th = seg.th, c = th.course || (seg.step && seg.step.co); if (c === 'tower') return RM_TOWER; if (c === 'skytree') return RM_SKY; return null; }
/* 本物の地図の層を描く：地面の物（公園・川・線路・首都高）→ 立っている物（ビル・お寺）は、遠い順に */
function realMapLayer(seg, o) {
  const M = rmFrame(seg); if (!M) return null;
  const { P, cx0, cz0, cs, cc, hz, camH, F, night, fog, yb, lowq, ox, oz, dirA, face } = o, th = seg.th;
  // 回す：地図の北が、この場所の向き（face）に合うように。着地する所がそろうように、ずらす
  let sx = 0, sy = 0; if (th.sky && M.land) { const hd = face * Math.PI / 180, Lk = seg.len / 1000; sx = M.land[0] - Math.sin(hd) * Lk; sy = M.land[1] - Math.cos(hd) * Lk; }
  else if (M.land && seg.tid !== 'hawk' && seg.tid !== 'hawk2') { sx = 0; sy = 0; }
  const rot = dirA - face * Math.PI / 180, cr = Math.cos(rot), sr = Math.sin(rot);
  const Wk = (x, y) => { const X = (x - sx) * 1000, Y = (y - sy) * 1000; return [ox + X * cr + Y * sr, oz - X * sr + Y * cr]; }; // 東・北（m）→ 世界
  const toCam = (wx, wz) => { const dx = wx - cx0, dz = wz - cz0; return [dx * cs + dz * cc, dx * cc - dz * cs]; };
  const polyW = (pts, fill, y) => { const cam = pts.map(q => toCam(q[0], q[1])), NR = 1.5, out = []; // 目の前の面で切ってから描く（カメラのうしろに出た角があっても、消えない）
    for (let i = 0; i < cam.length; i++) { const A = cam[i], B = cam[(i + 1) % cam.length], ia = A[0] >= NR, ib = B[0] >= NR; if (ia) out.push(A); if (ia !== ib) { const t = (NR - A[0]) / (B[0] - A[0]); out.push([NR, A[1] + (B[1] - A[1]) * t]); } }
    if (out.length < 3) return false; ctx.beginPath(); out.forEach(([d, l], i) => { const x = W / 2 + l / d * F, yy = hz + (camH - (y || 0)) / d * F; i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); return true; };
  const ribbon = (line, w, fill, y) => { for (let i = 0; i + 1 < line.length; i++) { const a = Wk(line[i][0], line[i][1]), b = Wk(line[i + 1][0], line[i + 1][1]), dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, nx = -dz / L * w / 2, nz = dx / L * w / 2;
      polyW([[a[0] + nx, a[1] + nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz], [a[0] - nx, a[1] - nz]], fill, y); } };
  const along = (line, t) => { const segs = []; let tot = 0; for (let i = 0; i + 1 < line.length; i++) { const a = Wk(...line[i]), b = Wk(...line[i + 1]), l = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push([a, b, l]); tot += l; }
    let u = ((t % 1) + 1) % 1 * tot; for (const [a, b, l] of segs) { if (u <= l) { const k = u / l; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), (b[0] - a[0]) / l, (b[1] - a[1]) / l]; } u -= l; } const [a, b] = segs[segs.length - 1]; return [b[0], b[1], 1, 0]; };
  const fogK = d => clamp(1 - Math.exp(-d / (4200 + camH * 8)), 0, .85), mix = (c, k, d) => { const f = fogK(d); return `rgb(${c.map((v, q) => (lerp(v * k, fog[q], f)) | 0)})`; };
  const amb = night ? [1, 1, 1] : LT.amb;
  // [M1] 公園の森（本物の形）
  for (const pk of M.park) polyW(pk.map(q => Wk(q[0], q[1])), night ? '#0E1A14' : mix([78, 118, 70].map((v, q) => v * amb[q]), 1, 1500));
  for (const [x, y, r] of M.ponds || []) { const pts = []; for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; pts.push(Wk(x + Math.cos(a) * r * (1 + .15 * Math.sin(a * 3)), y + Math.sin(a) * r * .7)); } polyW(pts, night ? '#0C1630' : 'rgba(84,118,144,.95)'); } /* [M26] 庭園・公園の池 */
  // [M2] 川・運河：本物の位置の水の帯（岸の白いコンクリート）
  if (M.water) { const [line, w] = M.water; ribbon(line, w + 10, night ? '#2A2E3A' : 'rgba(196,192,182,.95)'); ribbon(line, w, night ? '#0C1630' : 'rgba(84,118,144,.98)'); }
  // [M3] 線路の帯（バラストの茶色・レールの光る線）と [M4] 走る電車（立体の長い箱）
  for (const [line, w, kind] of [[M.rail, M.railW || 30, 0], [M.rail2, 24, 1]]) { if (!line) continue;
    ribbon(line, w, night ? '#1E2230' : 'rgba(132,120,104,.96)'); if (!lowq) for (let k = -2; k <= 2; k++) ribbon(line.map(q => q), 1.2, night ? 'rgba(160,170,200,.25)' : 'rgba(210,210,214,.5)');
    for (let n = 0; n < (lowq ? 2 : 5); n++) { const t = (G.t * (0.012 + n * .002) + n * .21) * (n % 2 ? -1 : 1), p = along(line, t), ln = 200, col = kind ? [234, 220, 90] : [[150, 196, 90], [80, 150, 220], [230, 120, 60], [210, 214, 220], [150, 196, 90]][n];
      const lat = (n - 2) * (w / 6), px = p[0] - p[3] * lat, pz = p[1] + p[2] * lat, bx = px - p[2] * ln, bz = pz - p[3] * ln, hw = 1.5, nx = -p[3] * hw, nz = p[2] * hw;
      const box = [[px + nx, pz + nz], [px - nx, pz - nz], [bx - nx, bz - nz], [bx + nx, bz + nz]]; polyW(box, night ? 'rgba(255,230,170,.85)' : `rgb(${col.map((v, q) => (v * amb[q]) | 0)})`, 3.6); polyW(box, night ? 'rgba(0,0,0,0)' : 'rgba(20,20,24,.25)', 3.0); } }
  for (const [ri, t0, t1] of M.stations || []) { const line = ri ? M.rail2 : M.rail; if (!line) continue; const pts = []; for (let k = 0; k <= 6; k++) { const p = along(line, lerp(t0, t1, k / 6)); pts.push(p); } const w = (ri ? 24 : M.railW || 30) * .85;
    for (let k = 0; k + 1 < pts.length; k++) { const a = pts[k], b = pts[k + 1], nx = -a[3] * w / 2, nz = a[2] * w / 2; polyW([[a[0] + nx, a[1] + nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz], [a[0] - nx, a[1] - nz]], night ? 'rgba(255,240,210,.55)' : mix([226, 228, 226].map((v, q) => v * amb[q]), 1, 1500), 9); } } /* 駅：線路の上に、長いホームの屋根（夜は明るい） */
  // [M5] 首都高：高さ 12m の高架。下にかげ、柱、上の白い線、走る車（夜は赤と白の光の列）
  for (const line of M.hwy || []) { ribbon(line, 26, night ? 'rgba(0,0,0,.25)' : 'rgba(30,34,44,.18)', 0); ribbon(line, 22, night ? '#30343E' : mix([168, 170, 172].map((v, q) => v * amb[q]), 1, 1500), 12);
    if (!lowq) { ribbon(line, 1, night ? 'rgba(255,190,110,.55)' : 'rgba(246,246,240,.8)', 12.1); for (let i = 0; i + 1 < line.length; i++) { const a = Wk(...line[i]), b = Wk(...line[i + 1]), L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let u = 20; u < L; u += 60) { const k = u / L, x = lerp(a[0], b[0], k), z = lerp(a[1], b[1], k), q0 = P(x, z, 0), q1 = P(x, z, 12); if (q0 && q1 && q1[1] > yb) { ctx.strokeStyle = night ? 'rgba(40,44,56,.9)' : 'rgba(120,124,130,.85)'; ctx.lineWidth = Math.max(.8, 5 * F / q0[2]); ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.stroke(); } } } // 柱
      for (let n = 0; n < 14; n++) { const p = along(line, G.t * .008 * (n % 2 ? 1 : -1) + n / 14), q = P(p[0] + (n % 2 ? 4 : -4) * -p[3], p[1] + (n % 2 ? 4 : -4) * p[2], 13); if (!q || q[1] < yb) continue; const sz = clamp(5 * F / q[2], .8, 6); ctx.fillStyle = night ? (n % 2 ? 'rgba(255,90,70,.95)' : 'rgba(255,246,220,.95)') : ['#E9EDF0', '#2B2F36', '#C8463C', '#F2F2EE', '#4E77A0'][n % 5]; ctx.fillRect(q[0] - sz / 2, q[1] - sz / 3, sz, sz * .6); } } }
  // 立っている物（本物の高いビル・お寺）。遠い順に描くための、ならべる用の箱
  const stand = [];
  for (const b of M.bld) { const [wx, wz] = Wk(b[0], b[1]); stand.push({ wx, wz, bw: b[2] / 2, bd: b[3] / 2, tall: b[4], col: b[5], real: 1, rot }); }
  for (const t of M.temple || []) { const [wx, wz] = Wk(t[0], t[1]); stand.push({ wx, wz, bw: t[2] / 2, bd: t[3] / 2, tall: t[4], temple: 1, rot }); }
  if (th.sky) { const hd = dirA, back = th.climb[0] > 400 ? 30 : 42; stand.push({ wx: ox - Math.sin(hd) * back, wz: oz - Math.cos(hd) * back, tower: 1, kind: th.climb[0] > 400 ? 'white' : 'red', hd }); } /* 塔の中心は、飛び立った所（テラスの先）の少しうしろ */
  for (const [x, y, kind] of M.far || []) { const [wx, wz] = Wk(x, y); stand.push({ wx, wz, tower: 1, kind, hd: dirA }); }
  if (M.bridge) { const [A, B, th2, dk] = M.bridge, a = Wk(A[0], A[1]), b = Wk(B[0], B[1]), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; stand.push({ wx: mid[0], wz: mid[1], bridge: { a, b, th: th2, dk } }); }
  for (const pg of M.pagoda || []) { const [wx, wz] = Wk(pg[0], pg[1]); stand.push({ wx, wz, pagoda: pg[2], rot }); }
  return { stand, near: (wx, wz) => M.bld.some(b => { const [x, z] = Wk(b[0], b[1]); return Math.hypot(wx - x, wz - z) < 120; }) || (M.park || []).some(pk => { const c = pk.reduce((a, q) => [a[0] + q[0] / pk.length, a[1] + q[1] / pk.length], [0, 0]); const [x, z] = Wk(c[0], c[1]); return Math.hypot(wx - x, wz - z) < 260; }) };
}
/* [M7] お寺の本堂：低い基壇・白いかべ・大きな黒い瓦の屋根（四方へ下がる形） */
function rmTemple(o, s, night, mixC) { const { P, yb } = o, { wx, wz, bw, bd, tall, rot } = s, cr = Math.cos(rot), sr = Math.sin(rot), at = (x, z) => [wx + x * cr + z * sr, wz - x * sr + z * cr];
  const c4 = [[-bw, -bd], [bw, -bd], [bw, bd], [-bw, bd]].map(q => at(q[0], q[1])), wallH = tall * .45, b0 = c4.map(q => P(q[0], q[1], 0)), b1 = c4.map(q => P(q[0], q[1], wallH)), eave = [[-bw - 6, -bd - 6], [bw + 6, -bd - 6], [bw + 6, bd + 6], [-bw - 6, bd + 6]].map(q => at(q[0], q[1])).map(q => P(q[0], q[1], wallH)), ridge = [at(-bw * .45, 0), at(bw * .45, 0)].map(q => P(q[0], q[1], tall));
  if ([...b0, ...b1, ...eave, ...ridge].some(q => !q)) return; if (ridge.every(q => q[1] < yb)) return;
  ctx.fillStyle = mixC(night ? [70, 66, 60] : [236, 228, 212], 1); ctx.beginPath(); b0.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); b1.slice().reverse().forEach(q => ctx.lineTo(q[0], q[1])); ctx.closePath(); ctx.fill();
  const roofC = mixC(night ? [30, 32, 38] : [62, 64, 70], 1); ctx.fillStyle = roofC; for (const [i, j, r] of [[0, 1, 0], [1, 2, 1], [2, 3, 1], [3, 0, 0]]) { ctx.beginPath(); ctx.moveTo(eave[i][0], eave[i][1]); ctx.lineTo(eave[j][0], eave[j][1]); const r0 = (i === 1 || i === 2) ? ridge[1] : ridge[0], r1 = (j === 1 || j === 2) ? ridge[1] : ridge[0]; ctx.lineTo(r1[0], r1[1]); ctx.lineTo(r0[0], r0[1]); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = night ? 'rgba(120,120,130,.4)' : 'rgba(30,30,34,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ridge[0][0], ridge[0][1]); ctx.lineTo(ridge[1][0], ridge[1][1]); ctx.stroke(); }
/* [M13] 飛び立った塔そのもの（立体）：オオタカで飛び立ってふり返ると、すぐうしろに、今までいた塔が本当の大きさで立っている。
   赤い電波塔：4 本の脚が上へ細くなる鉄骨の塔（高さ 333m、足もとの幅 約 95m）。赤と白の帯、150m の展望台、250m の上の展望台、てっぺんのアンテナ。夜は明かり。
   押上の電波塔：足もとは三角、上へ行くほど丸い白い塔（634m）。350m と 450m の展望台（ガラスの帯）。 */
function rmTowerBody(o, t, night, fog, fkOf) {
  const { P, cx0, cz0, cs, cc, yb } = o, red = t.kind === 'red', Ht = red ? 333 : 634, fdx = Math.sin(t.hd), fdz = Math.cos(t.hd);
  const half = y => red ? (y < 150 ? lerp(48, 12, Math.pow(y / 150, .8)) : y < 250 ? lerp(12, 6, (y - 150) / 100) : lerp(3, .6, (y - 250) / 83)) : (y < 350 ? lerp(36, 19, y / 350) : y < 460 ? 19 - (y - 350) * .04 : lerp(8, .8, (y - 460) / 174));
  const n = red ? 4 : 8, rot0 = t.hd + Math.PI / 4, cor = (y, k) => { const a = rot0 + k / n * Math.PI * 2, r = half(y) * (red ? Math.SQRT2 : 1); return [t.wx + Math.sin(a) * r, t.wz + Math.cos(a) * r]; };
  const d0 = (t.wx - cx0) * cs + (t.wz - cz0) * cc, fk = fkOf(Math.max(1, d0));
  const colAt = (y, k) => { const c = red ? (night ? [255, 140, 60] : (((y / 333 * 7) | 0) % 2 ? [236, 234, 228] : [214, 74, 40])) : (night ? [170, 200, 255] : [226, 232, 238]); const l = k % 2 ? .82 : 1; return `rgb(${c.map((v, q) => (lerp(v * l * (night ? 1 : LT.amb[q]), fog[q], fk)) | 0)})`; };
  const STEP = red ? 16.65 : 30;
  for (let y = 0; y < Ht - .1; y += STEP) { const y2 = Math.min(Ht, y + STEP);
    for (let k = 0; k < n; k++) { const a0 = cor(y, k), a1 = cor(y, k + 1), b0 = cor(y2, k), b1 = cor(y2, k + 1), mx = (a0[0] + a1[0]) / 2, mz = (a0[1] + a1[1]) / 2, nx = mx - t.wx, nz = mz - t.wz;
      if (nx * (mx - cx0) + nz * (mz - cz0) > 0) continue; // 見えない裏の面
      const q = [P(a0[0], a0[1], y), P(a1[0], a1[1], y), P(b1[0], b1[1], y2), P(b0[0], b0[1], y2)]; if (q.some(v => !v)) continue; if (Math.max(q[0][1], q[1][1]) < yb - 600) continue;
      ctx.fillStyle = colAt(y, k); if (red) ctx.globalAlpha = y > 140 && y < 160 || y > 240 && y < 255 ? .7 : .1; /* 鉄骨の塔は向こうが透けて見える（面はうすく、線を太く） */ ctx.beginPath(); q.forEach((v, i) => i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
      if (red) { ctx.strokeStyle = colAt(y, k); ctx.lineWidth = Math.max(.8, 2.2 * FOCAL / Math.max(30, q[0][2])); ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[3][0], q[3][1]); ctx.lineWidth *= 2.2; ctx.stroke(); ctx.lineWidth /= 2.2; ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[2][0], q[2][1]); ctx.moveTo(q[1][0], q[1][1]); ctx.lineTo(q[3][0], q[3][1]); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[3][0], q[3][1]); ctx.moveTo(q[1][0], q[1][1]); ctx.lineTo(q[2][0], q[2][1]); ctx.stroke(); } /* [M14] 鉄骨の X の筋かいと、4 本の脚 */
      else { ctx.strokeStyle = night ? 'rgba(120,150,220,.4)' : 'rgba(150,164,180,.5)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[2][0], q[2][1]); ctx.stroke(); } } } /* [M15] 押上の塔の白い鉄骨の網目 */
  for (const [dy, dh, dw] of red ? [[145, 12, 20], [245, 7, 9]] : [[340, 22, 27], [440, 14, 21]]) { const ring = k => { const a = rot0 + k / 12 * Math.PI * 2; return [t.wx + Math.sin(a) * dw, t.wz + Math.cos(a) * dw]; }; /* [M16] 展望台：ガラスの帯の階（昼は空がうつり、夜は明かり） */
    for (let k = 0; k < 12; k++) { const a0 = ring(k), a1 = ring(k + 1), mx = (a0[0] + a1[0]) / 2, mz = (a0[1] + a1[1]) / 2; if ((mx - t.wx) * (mx - cx0) + (mz - t.wz) * (mz - cz0) > 0) continue;
      const q = [P(a0[0], a0[1], dy), P(a1[0], a1[1], dy), P(a1[0], a1[1], dy + dh), P(a0[0], a0[1], dy + dh)]; if (q.some(v => !v)) continue; ctx.fillStyle = night ? 'rgba(255,228,170,.95)' : `rgb(${[120, 140, 160].map((v, i) => (lerp(v, fog[i], fk)) | 0)})`; ctx.beginPath(); q.forEach((v, i) => i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = night ? 'rgba(80,60,40,.5)' : 'rgba(230,236,240,.6)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[3][0], q[3][1]); ctx.stroke(); } }
  { const q = P(t.wx, t.wz, Ht); if (q && N_blink()) { ctx.fillStyle = '#FF4A3D'; ctx.beginPath(); ctx.arc(q[0], q[1], 2.5, 0, 7); ctx.fill(); } } } /* [M17] てっぺんの航空障害灯（点めつ） */
function N_blink() { return Math.floor(G.t * 1.2) % 2 === 0; }

/* [M18] 海の上の吊り橋：2 本の白い塔（たての 2 本の柱と横のはり）、海の上の道（上下 2 段）、塔から下がる太いケーブルと、たてのつり糸。夜はケーブルに明かり */
function rmBridge(o, br, night, mixC) { const { P, yb } = o, { a, b, th, dk } = br, at = t => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), nx = -dz / L * 15, nz = dx / L * 15;
  const deck = [[a[0] + nx, a[1] + nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz], [a[0] - nx, a[1] - nz]].map(q => P(q[0], q[1], dk)); if (deck.every(q => q)) { ctx.fillStyle = mixC(night ? [60, 64, 76] : [214, 216, 214], 1); ctx.beginPath(); deck.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill();
    const lo = [[a[0], a[1]], [b[0], b[1]]].map(q => P(q[0], q[1], dk - 9)); if (lo.every(q => q)) { ctx.strokeStyle = mixC(night ? [40, 44, 56] : [170, 172, 170], 1); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lo[0][0], lo[0][1]); ctx.lineTo(lo[1][0], lo[1][1]); ctx.stroke(); } } /* 下の段（電車の道） */
  const tw = [.3, .7].map(at);
  for (const t2 of tw) for (const sd of [-1, 1]) { const q0 = P(t2[0] + nx * sd * .8, t2[1] + nz * sd * .8, 0), q1 = P(t2[0] + nx * sd * .8, t2[1] + nz * sd * .8, th); if (!q0 || !q1) continue; ctx.strokeStyle = mixC(night ? [200, 210, 230] : [246, 246, 242], 1); ctx.lineWidth = Math.max(1.2, 9 * FOCAL / q0[2]); ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.stroke(); }
  for (const t2 of tw) for (const yy of [th * .55, th * .95]) { const q0 = P(t2[0] + nx * .8, t2[1] + nz * .8, yy), q1 = P(t2[0] - nx * .8, t2[1] - nz * .8, yy); if (q0 && q1) { ctx.lineWidth = Math.max(1, 6 * FOCAL / q0[2]); ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.stroke(); } } /* 塔の横のはり */
  ctx.strokeStyle = night ? 'rgba(255,240,210,.85)' : mixC([236, 236, 232], 1); ctx.lineWidth = 1.2;
  for (const sd of [-1, 1]) { const pts = []; for (let k = 0; k <= 40; k++) { const t = k / 40, p2 = at(t), cab = t < .3 ? lerp(dk + 6, th, t / .3) : t > .7 ? lerp(th, dk + 6, (t - .7) / .3) : dk + 6 + (th - dk - 6) * Math.pow((t - .5) / .2, 2); const q = P(p2[0] + nx * sd * .8, p2[1] + nz * sd * .8, cab); pts.push([q, p2, cab]); }
    ctx.beginPath(); let st = 0; for (const [q] of pts) { if (!q) { st = 0; continue; } st ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); st = 1; } ctx.stroke();
    if (!night) { ctx.lineWidth = .5; ctx.beginPath(); for (let k = 2; k < 40; k += 2) { const [q, p2] = pts[k], q2 = P(p2[0] + nx * sd * .8, p2[1] + nz * sd * .8, dk); if (q && q2) { ctx.moveTo(q[0], q[1]); ctx.lineTo(q2[0], q2[1]); } } ctx.stroke(); ctx.lineWidth = 1.2; } } } /* つり糸 */
/* [M19] 五重塔：5 つの屋根（下ほど大きい）と、てっぺんの相輪 */
function rmPagoda(o, s, night, mixC) { const { P } = o, Ht = s.pagoda, cr = Math.cos(s.rot), sr = Math.sin(s.rot), at = (x, z) => [s.wx + x * cr + z * sr, s.wz - x * sr + z * cr];
  for (let k = 0; k < 5; k++) { const y0 = 4 + k * 7.2, w = 9.5 - k * .9, ew = w + 4, body = [[-w / 2, -w / 2], [w / 2, -w / 2], [w / 2, w / 2], [-w / 2, w / 2]].map(q => at(q[0], q[1])), eave = [[-ew, -ew], [ew, -ew], [ew, ew], [-ew, ew]].map(q => at(q[0], q[1]));
    const b0 = body.map(q => P(q[0], q[1], y0)), b1 = body.map(q => P(q[0], q[1], y0 + 4.5)); if ([...b0, ...b1].some(q => !q)) return; ctx.fillStyle = mixC(night ? [120, 40, 30] : [178, 52, 40], 1); ctx.beginPath(); b0.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); b1.slice().reverse().forEach(q => ctx.lineTo(q[0], q[1])); ctx.closePath(); ctx.fill();
    const e = eave.map(q => P(q[0], q[1], y0 + 4.5)), top = P(at(0, 0)[0], at(0, 0)[1], y0 + 7); if (e.some(q => !q) || !top) return; ctx.fillStyle = mixC(night ? [30, 32, 36] : [58, 60, 66], 1); for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; ctx.beginPath(); ctx.moveTo(e[i][0], e[i][1]); ctx.lineTo(e[j][0], e[j][1]); ctx.lineTo(top[0], top[1]); ctx.closePath(); ctx.fill(); } }
  const s0 = P(at(0, 0)[0], at(0, 0)[1], 40), s1 = P(at(0, 0)[0], at(0, 0)[1], Ht); if (s0 && s1) { ctx.strokeStyle = mixC(night ? [160, 140, 90] : [190, 160, 80], 1); ctx.lineWidth = Math.max(1, 1.6 * FOCAL / s0[2]); ctx.beginPath(); ctx.moveTo(s0[0], s0[1]); ctx.lineTo(s1[0], s1[1]); ctx.stroke(); } }
