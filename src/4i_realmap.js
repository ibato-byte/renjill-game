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
  far: [[5.9, 5.7, 'white']],
  planes: [[3.5, -9.5]], // [M35] 南の空港へおりていく飛行機（海の上） // [M29] 8.2km 先の押上の電波塔（立体）
  bld: [
    // [x, y, 幅, 奥行き, 高さ, 色 0〜4] 本物の高いビル
    [-0.49, 0.21, 70, 70, 325, 1], [-0.42, 0.14, 45, 40, 237, 0], [-0.58, 0.28, 40, 40, 220, 4], // 麻布台（いちばん高いビルと 2 本）
    [0.39, 0.91, 60, 55, 255, 1], [0.33, 1.02, 55, 50, 266, 1], [0.48, 1.03, 45, 45, 185, 0], [0.52, 0.86, 40, 40, 221, 4], // 虎ノ門（4 本）
    [1.56, 0.67, 55, 45, 213, 3], [1.45, 0.78, 45, 40, 200, 1], [1.68, 0.78, 40, 40, 192, 0], [1.75, 0.55, 45, 40, 173, 2], [1.4, 0.55, 40, 35, 150, 4], [1.62, 0.92, 40, 40, 168, 1], [1.84, 0.7, 35, 35, 140, 0], // 汐留（ビルのかたまり）
    [1.04, -0.37, 60, 50, 235, 1], [1.12, -0.25, 40, 40, 160, 0], [0.92, -0.45, 35, 35, 120, 4], // 浜松町の駅の前
    [-1.47, 0.21, 60, 60, 238, 3], [-1.31, 0.77, 60, 55, 248, 1], [-1.6, 0.35, 40, 40, 160, 0], [-1.2, 0.6, 40, 40, 150, 4], [-1.42, 0.05, 35, 35, 120, 2], // 六本木（2 本の高いビルと、まわり）
    [-0.42, 0.99, 50, 50, 153, 0], [-0.3, 1.12, 40, 40, 140, 4], // 赤坂
    [0.62, 1.8, 50, 45, 150, 4], [0.85, 1.65, 45, 40, 140, 0], [0.4, 1.95, 40, 40, 130, 1], // 霞が関
    [1.3, -1.25, 35, 35, 140, 4], [1.95, -1.55, 35, 35, 150, 0], [1.05, -1.75, 35, 35, 130, 4], [1.6, -2.05, 35, 35, 145, 1], // 芝浦のマンション（運河の両岸。水の上には置かない）
    [-0.3, -3.35, 55, 45, 150, 1], [0.1, -3.45, 50, 45, 145, 0], [-0.5, -3.55, 45, 40, 130, 4], [0.25, -3.2, 45, 40, 120, 2], [-0.1, -3.7, 40, 40, 140, 1], // 品川
    [1.95, -0.6, 90, 30, 22, 2], [2.05, -0.9, 110, 34, 18, 4], [1.85, -1.3, 80, 30, 24, 2], [1.7, -1.75, 120, 36, 16, 4], [1.55, -2.1, 90, 30, 20, 2], // [M34] 海ぞいの倉庫・ふ頭の長くひくい建物（芝浦・竹芝）
    [2.86, 0.05, 40, 40, 190, 4], [3.0, -0.2, 40, 40, 175, 0], [2.98, 0.28, 40, 40, 160, 4], // 勝どき・月島のタワーマンション（35.6588, 139.7770 から計算）
    [-4.87, 3.44, 70, 50, 243, 2], [-4.6, 3.2, 55, 50, 223, 1], [-4.75, 3.75, 55, 50, 210, 0], [-5.1, 3.1, 50, 50, 200, 3], [-4.4, 3.55, 50, 45, 204, 1], [-5.0, 3.9, 45, 45, 190, 4], [-4.45, 2.95, 45, 45, 180, 0], // [M28] 新宿の高層ビル街（都庁と 6 本）
  ],
  rail: [[1.17, 0.86], [1.12, 0.3], [1.04, -0.37], [0.75, -0.95], [0.2, -1.43], [-0.25, -2.4], [-0.62, -3.34]], railW: 46, // 新橋 → 浜松町 → 田町 → 品川（山手線・京浜東北線・東海道線…何本も並ぶ）
  hwy: [[[1.6, 1.1], [1.48, 0.2], [1.38, -0.45], [0.95, -1.5], [0.6, -2.5], [0.4, -3.3]], [[1.48, 0.2], [0.9, 0.35], [0.3, 0.55], [-0.3, 0.6], [-1.0, 0.45], [-1.8, 0.3]], [[0.3, 0.55], [0.15, 1.2], [0.25, 2.2]]], // 首都高：海ぞいの 1 号線・六本木へ行く 3 号線・都心環状線
  water: [[[1.95, 1.0], [1.9, 0.2], [1.75, -0.6], [1.5, -1.2], [1.2, -2.2], [0.9, -3.0]], 70], // 運河（芝浦）
  water2: [[[3.72, 2.04], [3.2, 1.23], [2.75, 0.5], [2.6, 0.0], [2.5, -0.5], [2.45, -1.0]], 200], // [M54] 隅田川の河口（築地・勝どきのあいだ。はば約 200m）
  bridges: [[2.7, 0.36], [3.2, 1.23]], // [M55] 勝どき橋・佃大橋
  moat: [[0.12, 3.63], [1.33, 3.67], [1.38, 2.45], [0.97, 2.17], [0.25, 2.33], [-0.03, 2.97], [0.12, 3.63]], // [M48] 皇居のお堀（森のまわりを一周。皇居の中心は北緯 35.6852・東経 139.7528 → 赤い電波塔から北へ約 2.95km）
  temple: [[0.23, -0.12, 52, 40, 22]], // 増上寺の本堂（芝公園の中）
  brick: [[1.96, 2.51, 330, 30, 28, 0.25]], // [M47] 東京駅の赤れんがの駅舎（北緯 35.6812・東経 139.7671 から計算）（長さ 330m、南北にのびる。ドームの屋根）
  ponds: [[1.68, 0.17, .09], [1.12, -0.12, .03]],
  piers: [[2.05, -0.34, 0], [2.1, -0.85, 0]], // [M53] 竹芝・日の出のさん橋（海につき出た長い台と、とまっている船）
  roads: [[[0.5, 2.0], [0.45, 0.5], [0.35, -0.6], [0.1, -1.5], [-0.3, -3.2]], [[-0.2, 2.0], [-0.05, 0.6], [-0.25, -0.5], [-0.6, -1.5]], [[1.5, 0.6], [1.35, -0.6], [1.0, -1.8], [0.7, -3.0]], [[-1.8, 0.35], [-0.6, 0.45], [0.45, 0.5], [1.5, 0.6]]], // [M31] 大通り（日比谷通り・桜田通り・海岸通り・外堀・六本木への道）
  stations: [[0, .02, .1], [0, .33, .4], [0, .58, .65], [0, .93, 1]], // [M27] 駅のホームの屋根（新橋・浜松町・田町・品川）
  bridge: [[1.28, -2.3], [2.25, -2.62], 126, 52], // [M18] 海の上の吊り橋（2 本の白い塔・高さ 126m、道は海の上 52m）
  park: [[[-0.05, 0.15], [0.3, 0.2], [0.45, -0.05], [0.4, -0.5], [0.1, -0.55], [-0.08, -0.25]], // 芝公園の森
    [[1.45, 0.4], [1.85, 0.42], [1.95, 0.05], [1.8, -0.15], [1.5, -0.1], [1.42, 0.15]], // [M20] 海ぞいの大きな庭園（池と森）
    [[1.02, -0.04], [1.2, -0.02], [1.22, -0.2], [1.04, -0.22]], // [M21] 浜松町の駅の前の庭園（旧芝離宮。35.6575, 139.7576）
    [[0.2, 3.55], [1.25, 3.6], [1.3, 2.5], [0.95, 2.25], [0.3, 2.4], [0.05, 2.95]], // [M48] 皇居の森（大きな緑。まわりにお堀）
    [[-0.95, 0.25], [-0.75, 0.3], [-0.72, 0.1], [-0.92, 0.05]]], // [M22] 麻布の大きなお寺と墓地の森
};
const RM_SKY = { // 押上の電波塔のまわり（隅田川・浅草・錦糸町・両国・上野・大手町）
  land: [-0.84, 0.42], // 隅田公園（隅田川の東の岸）。2026-11-18：川・駅・名所の位置を、すべて緯度・経度から計算しなおした（押上の電波塔＝北緯 35.7101・東経 139.8107 が原点。東へ 1 度＝90.3km、北へ 1 度＝111km）
  far: [[-5.9, -5.7, 'red']],
  planes: [[2.0, -14.0]], // [M29] 8.2km 先の赤い電波塔（立体）
  bld: [
    [0.39, -1.5, 55, 50, 130, 1], [0.2, -1.6, 45, 40, 110, 0], [0.55, -1.35, 40, 40, 100, 4], [0.3, -1.75, 40, 40, 95, 2], // 錦糸町
    [-1.58, -1.47, 70, 60, 40, 5], // 両国の国技館（ひくく大きい・緑の屋根。35.6969, 139.7932）
    [-1.3, 0.12, 35, 35, 60, 0], [-1.5, -0.1, 30, 30, 55, 4], [-1.55, 0.35, 30, 30, 50, 1], // 浅草の駅のまわり（川の西）
    [-0.2, -0.15, 40, 40, 90, 1], [0.15, -0.2, 35, 35, 70, 4], // 押上の駅の上のビル
    [-3.0, 0.35, 45, 40, 110, 0], [-2.8, 0.1, 40, 40, 90, 4], // 上野（駅 35.7141, 139.7774）
    [-3.38, -1.3, 50, 45, 120, 1], [-3.2, -1.45, 45, 40, 110, 0], // 秋葉原（駅 35.6984, 139.7731）
    [-4.15, -2.79, 60, 55, 200, 1], [-4.35, -3.0, 55, 50, 190, 3], [-3.95, -3.1, 55, 50, 180, 0], [-4.5, -2.6, 50, 50, 170, 4], [-4.05, -2.5, 45, 45, 160, 1], // 大手町・丸の内（35.685, 139.765）
    [1.6, -1.0, 40, 40, 80, 0], [2.2, -2.6, 40, 40, 100, 4], // 亀戸・住吉
    [-10.75, -2.28, 70, 50, 243, 2], [-10.5, -2.5, 55, 50, 223, 1], [-10.6, -2.0, 55, 50, 210, 0], [-11.0, -2.6, 50, 50, 200, 3], // [M50] 11km 先の新宿の高層ビル街（都庁ほか）
  ],
  rail: [[-1.4, 0.1], [-0.9, 0.05], [-0.2, -0.02], [0.4, 0.0], [1.4, 0.15], [2.4, 0.3]], railW: 24, // 東武線（浅草から川をわたって、押上の電波塔の横）
  rail2: [[-3.38, -1.3], [-2.4, -1.5], [-1.56, -1.59], [0.33, -1.49], [1.45, -1.45], [3.0, -1.35]], // 総武線（秋葉原 → 両国 → 錦糸町）
  hwy: [[[-0.05, 2.1], [-0.6, 0.85], [-0.9, 0.1], [-1.4, -0.95], [-1.85, -1.8], [-2.05, -2.9]], [[-1.85, -1.8], [-0.5, -1.25], [0.8, -1.05], [2.5, -0.9]]], // 首都高：川ぞいの 6 号向島線・東へ行く 7 号線
  water: [[[-0.5, 0.0], [0.4, -0.08], [1.4, -0.06], [2.5, -0.04]], 26], // 北十間川（塔のすぐ南）
  water2: [[[-0.25, 2.1], [-0.8, 0.8], [-1.1, 0.04], [-1.62, -0.98], [-2.07, -1.84], [-2.3, -3.0], [-2.5, -4.0]], 170], // [M40] 隅田川（はば約 170m。浅草・両国の西）
  bridges: [[-0.8, 0.8], [-1.0, 0.3], [-1.1, 0.04], [-1.35, -0.45], [-1.62, -0.98], [-2.07, -1.84]], // [M41] 隅田川の橋（吾妻橋など、色のちがう 6 本）
  bridge: [[-4.6, -8.0], [-3.9, -8.35], 126, 52], // [M51] 9km 先の海の上の吊り橋
  temple: [[-1.26, 0.58, 40, 30, 18]], // 浅草寺の本堂（35.7148, 139.7967）
  pagoda: [[-1.33, 0.49, 53]],
  brick: [[-4.16, -3.2, 330, 30, 28, 0.25]], // [M52] 東京駅の赤れんがの駅舎（押上から西南西へ 5.2km）
  ponds: [[-3.67, 0.21, .12]], // 上野の池（不忍池 35.7120, 139.7700）
  roads: [[[-2.5, 0.12], [-1.4, 0.1], [0.0, 0.05], [1.6, 0.0], [3.0, -0.05]], [[0.3, 1.5], [0.32, 0.0], [0.35, -1.5], [0.4, -3.0]], [[-1.62, -0.98], [0.0, -1.05], [1.8, -1.15]], [[-0.3, 0.2], [0.6, 1.2], [1.4, 2.4]]], // [M31] 大通り（浅草通り・四ツ目通り・蔵前橋通り・水戸街道）
  stations: [[0, .55, .68], [1, .48, .56], [1, .12, .2]], // 押上の電波塔の駅・錦糸町・両国 // [M19] 浅草の五重塔（高さ 53m）
  park: [[[-3.85, 0.85], [-3.25, 0.9], [-3.2, 0.3], [-3.5, 0.05], [-3.9, 0.15]], // [M23] 上野の大きな公園（森と池）
    [[0.25, -1.62], [0.5, -1.6], [0.52, -1.78], [0.27, -1.8]], // [M24] 錦糸町の公園
    [[-0.6, 0.95], [-0.45, 0.95], [-0.7, 0.2], [-0.85, 0.2]]], // [M25] 隅田川の東の岸の公園（川ぞいの細長い森）
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
  if (!lowq) { const r = rnd(7311); for (let k = 0; k < 18; k++) { const x = (r() - .5) * 5, y = (r() - .5) * 5, [wx, wz] = Wk(x, y), a = r() * 3; if (M.bld.some(b => Math.hypot(b[0] - x, b[1] - y) < .2)) continue; if ([M.water, M.water2].some(W => W && W[0].some((q, i) => i && (() => { const a2 = W[0][i - 1], dx = q[0] - a2[0], dz = q[1] - a2[1], t = clamp(((x - a2[0]) * dx + (y - a2[1]) * dz) / (dx * dx + dz * dz || 1), 0, 1); return Math.hypot(x - a2[0] - dx * t, y - a2[1] - dz * t) * 1000 < W[1] / 2 + 60; })()))) continue; /* 川・運河の上には置かない */
      const box = (w, h, c, yy) => polyW([[-w, -h], [w, -h], [w, h], [-w, h]].map(([u, v]) => [wx + u * Math.cos(a) + v * Math.sin(a), wz - u * Math.sin(a) + v * Math.cos(a)]), c, yy || 0);
      if (k % 3 === 0) { box(45, 30, night ? '#2A2620' : mix([196, 170, 128].map((v, q) => v * amb[q]), 1, 1500)); const pts = []; for (let m = 0; m < 16; m++) { const t = m / 16 * Math.PI * 2, u = Math.cos(t) * 32, v = Math.sin(t) * 18; pts.push([wx + u * Math.cos(a) + v * Math.sin(a), wz - u * Math.sin(a) + v * Math.cos(a)]); } if (!night) { ctx.save(); polyW(pts, 'rgba(240,236,226,.55)', .1); ctx.restore(); } box(18, 12, night ? '#22262E' : mix([214, 210, 200].map((v, q) => v * amb[q]), 1, 1500), 0); } /* [M45] 学校の校庭（土の色・白いトラック）と校舎 */
      else { box(22, 14, night ? '#1C1E26' : mix([118, 120, 124].map((v, q) => v * amb[q]), 1, 1500)); if (!night) for (let m = -3; m <= 3; m++) box(.3, 12, 'rgba(240,240,236,.6)', .05 + 0 * m); } } } /* [M46] コインパーキング（灰色のアスファルトに白い線） */
  if (M.moat) ribbon(M.moat, 40, night ? '#0C1630' : 'rgba(78,112,128,.95)');
  // [M2] 川・運河：本物の位置の水の帯（岸の白いコンクリート）
  if (M.water) { const [line, w] = M.water; ribbon(line, w + 10, night ? '#2A2E3A' : 'rgba(196,192,182,.95)'); ribbon(line, w, night ? '#0C1630' : 'rgba(84,118,144,.98)'); }
  const riverAll = () => { /* [M66] 川・水面の明かり・橋をまとめて描く（着地の公園の上に川を描きなおす時も、橋と明かりが消えない） */
  if (M.water2) { const [line, w] = M.water2; ribbon(line, w + 16, night ? '#2A2E3A' : 'rgba(196,192,182,.95)'); ribbon(line, w, night ? '#1A2842' : 'rgba(78,112,140,.98)'); /* [M63] 夜の隅田川を、真っ黒にせず少し明るい紺に */ if (!lowq && !night) ribbon(line, w * .25, 'rgba(190,215,230,.18)');
    if (!lowq) { /* [空 W1] 2026-11-21：空から見た隅田川が、のっぺりした青い帯だった。水面のさざなみ（川に沿った短い光の線。ゆっくりきらめく）と、 [空 W2] 川をゆっくり進む水上バス 2 そう（白い船体と、うしろの白い波のあと） */
      ctx.lineCap = 'round'; for (let i = 0; i + 1 < line.length; i++) { const a = Wk(...line[i]), b = Wk(...line[i + 1]), L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
        for (let u = 6, n = 0; u < L; u += 9, n++) { const off = ((n * 37) % 100 / 100 - .5) * (w - 24), x0 = a[0] + ux * u - uz * off, z0 = a[1] + uz * u + ux * off, q0 = P(x0, z0, 0); if (!q0 || q0[1] < yb) continue; const q1 = P(x0 + ux * 7, z0 + uz * 7, 0); if (!q1) continue; const lw = clamp(1.6 * F / q0[2], .4, 2.2); if (lw < .5) continue;
          const tw = .5 + .5 * Math.sin(G.t * 1.7 + n * 1.9 + i); ctx.strokeStyle = night ? `rgba(160,180,230,${(.10 * tw).toFixed(3)})` : `rgba(235,245,250,${(.22 * tw + .06).toFixed(3)})`; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.stroke(); } }
      const tot = []; let acc = 0; for (let i = 0; i + 1 < line.length; i++) { const a = Wk(...line[i]), b = Wk(...line[i + 1]), L = Math.hypot(b[0] - a[0], b[1] - a[1]); tot.push([a, b, L, acc]); acc += L; }
      if (camH > 40) for (let k = 0; k < 2; k++) { /* [空 W3] 低い所では水上バスを描かない（川は土手と木のむこうなのに、地平線の上に白い船が浮いて見えた） */ const pos = ((G.t * 3.2 * (k ? -1 : 1) + k * acc * .47) % acc + acc) % acc, seg2 = tot.find(t => pos >= t[3] && pos < t[3] + t[2]) || tot[0], [a, b, L] = seg2, u = pos - seg2[3], ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, dirS = k ? -1 : 1, off = (k ? -.22 : .22) * w, cx = a[0] + ux * u - uz * off, cz = a[1] + uz * u + ux * off;
        const pt = (fa, la) => P(cx + ux * fa * dirS - uz * la, cz + uz * fa * dirS + ux * la, 0), hull = [pt(16, 0), pt(10, 3.2), pt(-16, 3.2), pt(-16, -3.2), pt(10, -3.2)], wake = [pt(-16, 3.2), pt(-60, 9), pt(-60, -9), pt(-16, -3.2)];
        if (hull.some(v => !v) || wake.some(v => !v)) continue; ctx.fillStyle = night ? 'rgba(150,170,210,.12)' : 'rgba(240,248,252,.35)'; ctx.beginPath(); wake.forEach((v, m) => m ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])); ctx.closePath(); ctx.fill();
        ctx.fillStyle = night ? '#4A5266' : '#F2F4F6'; ctx.beginPath(); hull.forEach((v, m) => m ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])); ctx.closePath(); ctx.fill();
        const r1 = [pt(8, 0), pt(4, 2.2), pt(-12, 2.2), pt(-12, -2.2), pt(4, -2.2)]; if (!r1.some(v => !v)) { ctx.fillStyle = night ? 'rgba(255,220,150,.85)' : '#5D8FB8'; ctx.beginPath(); r1.forEach((v, m) => m ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])); ctx.closePath(); ctx.fill(); } } ctx.lineCap = 'butt'; } if (night && !lowq) for (let i = 0; i + 1 < line.length; i++) { const a = Wk(...line[i]), b = Wk(...line[i + 1]), L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L; for (let u = 10; u < L; u += 28) for (const sd of [-1, 1]) { const off = sd * (w / 2 - 6 - ((u * 7) % 13)), q = P(a[0] + ux * u - uz * off, a[1] + uz * u + ux * off, 0); if (!q || q[1] < yb) continue; const r = clamp(3 * F / q[2], .5, 4), fl = .55 + .45 * Math.sin(G.t * 2.3 + u * .7 + i); ctx.fillStyle = `rgba(255,${(200 + (u % 3) * 18) | 0},140,${(.42 * fl).toFixed(3)})`; ctx.fillRect(q[0] - r / 2, q[1], r, r * 4.5); } } } /* [M65] 夜の隅田川：両岸の町の明かりが水面にうつって、ゆらゆらゆれる（たての光のすじ） */
  for (let k = 0; k < (M.bridges || []).length; k++) { /* [M68] 2026-11-18 オーナー「川の上に不自然に橋が浮いている」：橋の場所を川のまん中の線にのせ、向きを川に直角に、長さを川の幅＋両岸まで。
      岸の先は、坂で地面までおりる（前は、決まった東西の向きで長さも合わず、はしが陸の上の空中で切れていた）。川の中に太い橋脚、その上にけた、道、らんかん */
    const [bx0, by0] = M.bridges[k], ln = M.water2[0], wR = M.water2[1]; let best = null;
    for (let i = 0; i + 1 < ln.length; i++) { const [ax, ay] = ln[i], [qx, qy] = ln[i + 1], dx = qx - ax, dy = qy - ay, L2s = dx * dx + dy * dy, t = clamp(((bx0 - ax) * dx + (by0 - ay) * dy) / L2s, 0, 1), px = ax + dx * t, py = ay + dy * t, dd = Math.hypot(bx0 - px, by0 - py); if (!best || dd < best.dd) best = { dd, px, py, dx, dy }; }
    if (!best) continue; const [cx, cz] = Wk(best.px, best.py), [fx1, fz1] = Wk(best.px + best.dx * .01, best.py + best.dy * .01), rl = Math.hypot(fx1 - cx, fz1 - cz) || 1, rx = (fx1 - cx) / rl, rz = (fz1 - cz) / rl, ux = rz, uz = -rx, vx = rx, vz = rz;
    const half = wR / 2 + 12, ramp = 26, HB = 6.6, L2 = 8, bc = ['#C8463C', '#4E8FC4', '#E9E4D8', '#6FA36A', '#D9A030', '#9AA6B2'][k % 6], E = (sl, sv) => [cx + ux * sl + vx * L2 * sv, cz + uz * sl + vz * L2 * sv];
    const quadY = (pts, fill) => { const q = pts.map(([sl, sv, y]) => P(...E(sl, sv), y)); if (q.some(v => !v)) return; ctx.fillStyle = fill; ctx.beginPath(); q.forEach((v, m) => m ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])); ctx.closePath(); ctx.fill(); };
    const pierC = night ? '#22242E' : '#9A9C9E', girC = night ? '#1A1C26' : bc, roadC = night ? '#2E3040' : '#8E9096', railC = night ? '#3A3C4C' : bc;
    for (const sl of [-wR * .28, 0, wR * .28]) for (const sv of [-1, 1]) quadY([[sl - 2.2, sv * .7, 0], [sl + 2.2, sv * .7, 0], [sl + 2.2, sv * .7, HB - 1.4], [sl - 2.2, sv * .7, HB - 1.4]], pierC); /* 川の中の太い橋脚（3 つ） */
    for (const sv of [-1, 1]) quadY([[-half, sv, HB - 1.4], [half, sv, HB - 1.4], [half, sv, HB], [-half, sv, HB]], girC); /* けた（川の上だけ） */
    for (const sd of [-1, 1]) { const a0 = sd * half, a1 = sd * (half + ramp); for (const sv of [-1, 1]) quadY([[a0, sv, 0], [a1, sv, 0], [a1, sv, 0], [a0, sv, HB]], night ? '#20222C' : '#A8A49A'); quadY([[a0, -1, HB], [a1, -1, 0], [a1, 1, 0], [a0, 1, HB]], roadC); } /* 両岸の坂：橋の高さから地面までおりる（横の土台のかべと、坂の道） */
    quadY([[-half, -1, HB], [half, -1, HB], [half, 1, HB], [-half, 1, HB]], roadC); /* 橋の上の道 */
    for (const sv of [-.9, .9]) { for (const sd of [-1, 1]) quadY([[sd * half, sv - .08, HB + .9], [sd * (half + ramp), sv - .08, .9], [sd * (half + ramp), sv + .08, .9], [sd * half, sv + .08, HB + .9]], railC); quadY([[-half, sv - .08, HB + .9], [half, sv - .08, HB + .9], [half, sv + .08, HB + .9], [-half, sv + .08, HB + .9]], railC); } /* らんかん */
    if (night) for (let m = 0; m <= 8; m++) for (const sv of [-.9, .9]) { const q = P(...E(-half + m / 8 * half * 2, sv), HB + 2.4); if (!q) continue; ctx.fillStyle = 'rgba(255,214,150,.95)'; ctx.beginPath(); ctx.arc(q[0], q[1], clamp(.9 * F / q[2], .6, 2.6), 0, 7); ctx.fill(); } } /* 夜は、らんかんにそって街灯の点の列 */
  }; riverAll();
  for (const [line, w, nb] of [[M.water2 && M.water2[0], M.water2 && M.water2[1], 5], [M.water && M.water[0], M.water && M.water[1], 2]]) { if (!line || lowq) continue;
    for (let n = 0; n < nb; n++) { const dir = n % 2 ? 1 : -1, p = along(line, G.t * .0025 * dir + n / nb), lat = dir * w * .2, cx = p[0] - p[3] * lat, cz = p[1] + p[2] * lat, Lb = n === 0 && nb > 2 ? 34 : 16, hb = 3;
      const fx = p[2] * dir, fz = p[3] * dir, nx = -fz * hb, nz = fx * hb; polyW([[cx + fx * Lb / 2 + nx * .3, cz + fz * Lb / 2 + nz * .3], [cx + nx, cz + nz], [cx - fx * Lb / 2 + nx, cz - fz * Lb / 2 + nz], [cx - fx * Lb / 2 - nx, cz - fz * Lb / 2 - nz], [cx - nx, cz - nz], [cx + fx * Lb / 2 - nx * .3, cz + fz * Lb / 2 - nz * .3]], night ? 'rgba(255,230,170,.8)' : (n === 0 && nb > 2 ? '#DDE6EE' : '#F2F2EE'), 1.2); /* [M42] 川をゆく船（いちばん長いのは水上バス。銀色の平たい屋根） */
      if (!night) polyW([[cx - fx * Lb / 2 - nx * .8, cz - fz * Lb / 2 - nz * .8], [cx - fx * Lb / 2 + nx * .8, cz - fz * Lb / 2 + nz * .8], [cx - fx * (Lb / 2 + 40) + nx * 2.6, cz - fz * (Lb / 2 + 40) + nz * 2.6], [cx - fx * (Lb / 2 + 40) - nx * 2.6, cz - fz * (Lb / 2 + 40) - nz * 2.6]], 'rgba(230,240,245,.4)', .1); } } /* [M43] 船のうしろの白い引き波 */
  // [M3] 線路の帯（バラストの茶色・レールの光る線）と [M4] 走る電車（立体の長い箱）
  for (const [line, w, kind] of [[M.rail, M.railW || 30, 0], [M.rail2, 24, 1]]) { if (!line) continue;
    ribbon(line, w, night ? '#1E2230' : 'rgba(132,120,104,.96)'); if (!lowq) for (let k = -2; k <= 2; k++) ribbon(line.map(q => q), 1.2, night ? 'rgba(160,170,200,.25)' : 'rgba(210,210,214,.5)');
    for (let n = 0; n < (lowq ? 2 : 5); n++) { const t = (G.t * (0.012 + n * .002) + n * .21) * (n % 2 ? -1 : 1), p = along(line, t), ln = 200, col = kind ? [234, 220, 90] : [[150, 196, 90], [80, 150, 220], [230, 120, 60], [210, 214, 220], [150, 196, 90]][n];
      const lat = (n - 2) * (w / 6), px = p[0] - p[3] * lat, pz = p[1] + p[2] * lat, bx = px - p[2] * ln, bz = pz - p[3] * ln, hw = 1.5, nx = -p[3] * hw, nz = p[2] * hw;
      const box = [[px + nx, pz + nz], [px - nx, pz - nz], [bx - nx, bz - nz], [bx + nx, bz + nz]]; polyW(box, night ? 'rgba(255,230,170,.85)' : `rgb(${col.map((v, q) => (v * amb[q]) | 0)})`, 3.6); polyW(box, night ? 'rgba(0,0,0,0)' : 'rgba(20,20,24,.25)', 3.0); } }
  for (const [ri, t0, t1] of M.stations || []) { const line = ri ? M.rail2 : M.rail; if (!line) continue; const pts = []; for (let k = 0; k <= 6; k++) { const p = along(line, lerp(t0, t1, k / 6)); pts.push(p); } const w = (ri ? 24 : M.railW || 30) * .85;
    for (let k = 0; k + 1 < pts.length; k++) { const a = pts[k], b = pts[k + 1], nx = -a[3] * w / 2, nz = a[2] * w / 2; polyW([[a[0] + nx, a[1] + nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz], [a[0] - nx, a[1] - nz]], night ? 'rgba(255,240,210,.55)' : mix([226, 228, 226].map((v, q) => v * amb[q]), 1, 1500), 9); } } /* 駅：線路の上に、長いホームの屋根（夜は明るい） */
  if (night && !lowq) for (const line of [...(M.roads || []), ...(M.hwy || [])]) for (let i = 0; i + 1 < line.length; i++) { const a = Wk(...line[i]), b = Wk(...line[i + 1]), L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L; for (let u = 0; u < L; u += 35) for (const sd of [-1, 1]) { const q = P(a[0] + ux * u - uz * sd * 14, a[1] + uz * u + ux * sd * 14, 8); if (!q || q[1] < yb) continue; const r = clamp(2.2 * F / q[2], .5, 3); ctx.fillStyle = 'rgba(255,222,160,.9)'; ctx.fillRect(q[0] - r / 2, q[1] - r / 2, r, r); } } /* [M56] 夜：大通りと首都高の両わきの街灯の光の列 */
  for (const line of M.roads || []) { ribbon(line, 30, night ? '#1A1C26' : mix([120, 122, 126].map((v, q) => v * amb[q]), 1, 1500)); if (!lowq) { ribbon(line, .8, night ? 'rgba(255,214,150,.35)' : 'rgba(240,240,236,.7)'); for (const off of [-.32, .32]) ribbon(line.map(q => q), .5, night ? 'rgba(255,214,150,.2)' : 'rgba(230,230,226,.45)'); }
    for (let n = 0; n < (lowq ? 4 : 10); n++) { const dir = n % 2 ? 1 : -1, p = along(line, G.t * .006 * dir + n / 10), lat2 = dir * 5, q = P(p[0] - p[3] * lat2, p[1] + p[2] * lat2, 1.6); if (!q || q[1] < yb) continue; const sz = clamp(4.5 * F / q[2], .6, 7); ctx.fillStyle = night ? (dir > 0 ? 'rgba(255,90,70,.95)' : 'rgba(255,246,220,.95)') : ['#E9EDF0', '#2B2F36', '#C8463C', '#F2F2EE', '#4E77A0', '#D9A030'][n % 6]; ctx.fillRect(q[0] - sz / 2, q[1] - sz / 3, sz, sz * .6); } } /* [M32] 大通りを走る車（夜は前と後ろの明かり） */
  // [M5] 首都高：高さ 12m の高架。下にかげ、柱、上の白い線、走る車（夜は赤と白の光の列）
  for (const line of M.hwy || []) { ribbon(line, 26, night ? 'rgba(0,0,0,.25)' : 'rgba(30,34,44,.18)', 0); ribbon(line, 22, night ? '#30343E' : mix([168, 170, 172].map((v, q) => v * amb[q]), 1, 1500), 12);
    if (!lowq) { ribbon(line, 1, night ? 'rgba(255,190,110,.55)' : 'rgba(246,246,240,.8)', 12.1); for (let i = 0; i + 1 < line.length; i++) { const a = Wk(...line[i]), b = Wk(...line[i + 1]), L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let u = 20; u < L; u += 60) { const k = u / L, x = lerp(a[0], b[0], k), z = lerp(a[1], b[1], k), q0 = P(x, z, 0), q1 = P(x, z, 12); if (q0 && q1 && q1[1] > yb) { ctx.strokeStyle = night ? 'rgba(40,44,56,.9)' : 'rgba(120,124,130,.85)'; ctx.lineWidth = Math.max(.8, 5 * F / q0[2]); ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.stroke(); } } } // 柱
      for (let n = 0; n < 14; n++) { const p = along(line, G.t * .008 * (n % 2 ? 1 : -1) + n / 14), q = P(p[0] + (n % 2 ? 4 : -4) * -p[3], p[1] + (n % 2 ? 4 : -4) * p[2], 13); if (!q || q[1] < yb) continue; const sz = clamp(5 * F / q[2], .8, 6); ctx.fillStyle = night ? (n % 2 ? 'rgba(255,90,70,.95)' : 'rgba(255,246,220,.95)') : ['#E9EDF0', '#2B2F36', '#C8463C', '#F2F2EE', '#4E77A0'][n % 5]; ctx.fillRect(q[0] - sz / 2, q[1] - sz / 3, sz, sz * .6); } } }
  // 立っている物（本物の高いビル・お寺）。遠い順に描くための、ならべる用の箱
  const stand = [];
  for (const b of M.bld) { const [wx, wz] = Wk(b[0], b[1]); stand.push({ wx, wz, bw: b[2] / 2, bd: b[3] / 2, tall: b[4], col: b[5], real: 1, rot }); }
  for (const t of M.temple || []) { const [wx, wz] = Wk(t[0], t[1]); stand.push({ wx, wz, bw: t[2] / 2, bd: t[3] / 2, tall: t[4], temple: 1, rot }); }
  if (th.sky) { const p0 = segPos(seg, th.climb[0] > 400 ? -22 : -26, 0), wx = p0[0], wz = p0[1]; stand.push({ wx, wz, tower: 1, kind: th.climb[0] > 400 ? 'white' : 'red', hd: dirA }); } /* [空 T1] 2026-11-21 オーナー「スカイツリーから飛び降りてすぐ振り返ると、スカイツリー全体が見えて、距離感が現実的じゃない」：塔を地図の原点（着地の公園から約 0.9km）に立てていたので、飛び立って数十 m なのに、塔は 700m 以上先の小さな塔に見えた。塔は、飛び立った所のすぐうしろ（塔の中心から数十 m）に立てる（ふり返ると、目の前に太い塔の体がそびえる） */ /* 塔は、地図の原点＝本物の場所に立つ（押上は、着地の川べりから東南東へ約 0.9km） */ /* 塔の中心は、飛び立った所（テラスの先）の少しうしろ */
  for (const [x, y, kind] of M.far || []) { const [wx, wz] = Wk(x, y); stand.push({ wx, wz, tower: 1, kind, hd: dirA }); }
  if (M.bridge) { const [A, B, th2, dk] = M.bridge, a = Wk(A[0], A[1]), b = Wk(B[0], B[1]), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; stand.push({ wx: mid[0], wz: mid[1], bridge: { a, b, th: th2, dk } }); }
  for (const b of M.brick || []) { const [x, y, len, w, h] = b, [wx, wz] = Wk(x, y); stand.push({ wx, wz, brick: { len, w, h }, rot: rot }); }
  for (const [x, y] of M.piers || []) { const [wx, wz] = Wk(x, y); stand.push({ wx, wz, pier: 1, rot: rot }); }
  for (const pg of M.pagoda || []) { const [wx, wz] = Wk(pg[0], pg[1]); stand.push({ wx, wz, pagoda: pg[2], rot }); }
  const water = () => { riverAll(); }; /* 着地の公園の森の上にも、川を描きなおす（公園の形が川にかぶっていた） */
  const planes = (M.planes || []).map(([x, y]) => Wk(x, y));
  if (!lowq) { const r = rnd(4242); for (let k = 0; k < (night ? 0 : 14); k++) { const x = (r() - .5) * 6, y = (r() - .5) * 6, [wx, wz] = Wk(x, y); if (M.bld.some(b => Math.hypot(b[0] - x, b[1] - y) < .15)) continue; stand.push({ wx, wz, crane: 1, rot: rot + r() * 3, h: 60 + r() * 50, t: r() }); } } /* [M38] 工事中のビルの上のクレーン（東京は、いつもどこかで工事をしている） */
  const segD = (px, pz, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = clamp(((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz || 1), 0, 1); return Math.hypot(px - a[0] - dx * t, pz - a[1] - dz * t); };
  const lines = [[M.water2, 30], [M.water, 30], [M.rail && [M.rail, M.railW || 30], 20], [M.rail2 && [M.rail2, 24], 20], ...(M.hwy || []).map(l => [[l, 22], 15]), ...(M.roads || []).map(l => [[l, 30], 12])].filter(x => x[0]).map(([[ln, w], pad]) => [ln.map(q => Wk(q[0], q[1])), w / 2 + pad]);
  const onLine = (wx, wz) => lines.some(([ln, r]) => { for (let i = 0; i + 1 < ln.length; i++) if (segD(wx, wz, ln[i], ln[i + 1]) < r) return true; return false; }); /* [M44] 川・線路・首都高・大通りの上には、作り物のビルを立てない（川の中にビルが立っていた） */
  /* [着地 A8〜A10] 2026-11-20：本物の地図の公園（芝公園・浜離宮・皇居・上野・隅田公園など）は、一色の緑の板だった。上から見て森に見えるよう、中に木を植える。
     [A8] 公園の形の中に 24m ごとに木（少しずらす）。川・線路・大通りの上には植えない [A9] 1.5km より遠い木は描かない（遠くは森の色だけで十分・軽く）
     [A10] 着地する公園のまん中（作り物の森と芝生がある所）には植えない（2 重にならない） */
  const parkTrees = (P2, park, draw) => { if (lowq || night && camH > 300) return; let T = seg.__rmT; const key = sx + ',' + sy + ',' + rot + ',' + ox + ',' + oz;
    if (!T || T.key !== key) { T = { key, pts: [] }; const inPoly = (pg, x, y) => { let c = false; for (let i = 0, j = pg.length - 1; i < pg.length; j = i++) { const [xi, yi] = pg[i], [xj, yj] = pg[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
      for (const pk of M.park || []) { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of pk) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        for (let x = x0; x <= x1; x += .024) for (let y = y0; y <= y1; y += .024) { const h1 = acHash(Math.round(x * 1000), Math.round(y * 1000), 41), h2 = acHash(Math.round(x * 1000), Math.round(y * 1000), 43), px = x + (h1 - .5) * .02, py = y + (h2 - .5) * .02; if (!inPoly(pk, px, py)) continue; const [wx, wz] = Wk(px, py); if (onLine(wx, wz)) continue; T.pts.push([wx, wz, 7 + h1 * 6, (h2 * 3) | 0]); } }
      seg.__rmT = T; }
    for (const [wx, wz, r, c] of T.pts) { if (park) { const qx = wx - park.x, qz = wz - park.z, f = qx * park.fx + qz * park.fz, l = qx * park.ux + qz * park.uz; if (((f - 40) / 262) ** 2 + (l / 192) ** 2 < 1) continue; } const dx = wx - cx0, dz = wz - cz0, d = dx * cs + dz * cc; if (d < 4 || d > 1500) continue; if (Math.abs(dx * cc - dz * cs) > d * (W / 2 / F + .2) + 30) continue; draw(wx, wz, r, c, d); } };
  return { water, planes, stand, onLine, parkTrees, near: (wx, wz) => onLine(wx, wz) || M.bld.some(b => { const [x, z] = Wk(b[0], b[1]); return Math.hypot(wx - x, wz - z) < 120; }) || (M.park || []).some(pk => { const c = pk.reduce((a, q) => [a[0] + q[0] / pk.length, a[1] + q[1] / pk.length], [0, 0]); const [x, z] = Wk(c[0], c[1]); return Math.hypot(wx - x, wz - z) < 260; }) };
}
/* [M7] お寺の本堂：低い基壇・白いかべ・大きな黒い瓦の屋根（四方へ下がる形） */
function rmTemple(o, s, night, mixC) { const { P, yb } = o, { wx, wz, bw, bd, tall, rot } = s, cr = Math.cos(rot), sr = Math.sin(rot), at = (x, z) => [wx + x * cr + z * sr, wz - x * sr + z * cr];
  const c4 = [[-bw, -bd], [bw, -bd], [bw, bd], [-bw, bd]].map(q => at(q[0], q[1])), wallH = tall * .45, b0 = c4.map(q => P(q[0], q[1], 0)), b1 = c4.map(q => P(q[0], q[1], wallH)), eave = [[-bw - 6, -bd - 6], [bw + 6, -bd - 6], [bw + 6, bd + 6], [-bw - 6, bd + 6]].map(q => at(q[0], q[1])).map(q => P(q[0], q[1], wallH)), ridge = [at(-bw * .45, 0), at(bw * .45, 0)].map(q => P(q[0], q[1], tall));
  if ([...b0, ...b1, ...eave, ...ridge].some(q => !q)) return; if (ridge.every(q => q[1] < yb)) return;
  ctx.fillStyle = mixC(night ? [70, 66, 60] : [236, 228, 212], 1); ctx.beginPath(); b0.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); b1.slice().reverse().forEach(q => ctx.lineTo(q[0], q[1])); ctx.closePath(); ctx.fill();
  const rb = night ? [30, 32, 38] : [96, 100, 108], fk = [1.22, .86, .7, 1.04]; /* 瓦は空がうつって、少し青みのある灰色（真っ黒にしない） */ /* [着地 T4] 2026-11-22：屋根の 4 つの面を同じ色でぬっていたので、上から見ると、公園の中に暗い平らな板が置いてあるように見えた。面ごとに明るさを変えて、寄棟の屋根の形が見えるように */ for (const [i, j, r] of [[0, 1, 0], [1, 2, 1], [2, 3, 1], [3, 0, 0]]) { ctx.fillStyle = mixC(rb.map(v => Math.min(255, v * fk[i])), 1); ctx.beginPath(); ctx.moveTo(eave[i][0], eave[i][1]); ctx.lineTo(eave[j][0], eave[j][1]); const r0 = (i === 1 || i === 2) ? ridge[1] : ridge[0], r1 = (j === 1 || j === 2) ? ridge[1] : ridge[0]; ctx.lineTo(r1[0], r1[1]); ctx.lineTo(r0[0], r0[1]); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = night ? 'rgba(120,120,130,.4)' : 'rgba(30,30,34,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ridge[0][0], ridge[0][1]); ctx.lineTo(ridge[1][0], ridge[1][1]); ctx.stroke(); }
/* [M13] 飛び立った塔そのもの（立体）：オオタカで飛び立ってふり返ると、すぐうしろに、今までいた塔が本当の大きさで立っている。
   赤い電波塔：4 本の脚が上へ細くなる鉄骨の塔（高さ 333m、足もとの幅 約 95m）。赤と白の帯、150m の展望台、250m の上の展望台、てっぺんのアンテナ。夜は明かり。
   押上の電波塔：足もとは三角、上へ行くほど丸い白い塔（634m）。350m と 450m の展望台（ガラスの帯）。 */
function rmTowerBody(o, t, night, fog, fkOf) {
  const { P, cx0, cz0, cs, cc, yb } = o, red = t.kind === 'red', Ht = red ? 333 : 634, fdx = Math.sin(t.hd), fdz = Math.cos(t.hd);
  const half = y => red ? (y < 150 ? lerp(48, 12, Math.pow(y / 150, .8)) : y < 250 ? lerp(12, 6, (y - 150) / 100) : lerp(3, .6, (y - 250) / 83)) : (y < 350 ? lerp(36, 19, y / 350) : y < 460 ? 19 - (y - 350) * .04 : lerp(8, .8, (y - 460) / 174));
  const n = red ? 4 : 8, rot0 = t.hd + Math.PI / 4, cor = (y, k) => { const a = rot0 + k / n * Math.PI * 2, r = half(y) * (red ? Math.SQRT2 : 1); return [t.wx + Math.sin(a) * r, t.wz + Math.cos(a) * r]; };
  const d0 = (t.wx - cx0) * cs + (t.wz - cz0) * cc, fk = fkOf(Math.max(1, d0));
  if (!night && typeof SUN !== 'undefined' && SUN.alt > .03 && G.weather === 'clear') { /* [空 T3] 2026-11-21：晴れた昼は、塔の長いかげが町の上にのびる（夕方ほど長い。本物も、夕方は塔のかげが何 km ものびる） */
    const L = Math.min(Ht / Math.tan(SUN.alt), 2600), dx = -Math.sin(SUN.az), dz = -Math.cos(SUN.az), px = -dz, pz = dx, w0 = half(0) * .9, w1 = half(Ht * .55) * .9;
    const pts = [[t.wx + px * w0, t.wz + pz * w0], [t.wx + dx * L * .55 + px * w1, t.wz + dz * L * .55 + pz * w1], [t.wx + dx * L, t.wz + dz * L], [t.wx + dx * L * .55 - px * w1, t.wz + dz * L * .55 - pz * w1], [t.wx - px * w0, t.wz - pz * w0]].map(([x, z]) => P(x, z, 0));
    if (pts.every(q => q)) { ctx.fillStyle = `rgba(20,26,44,${(.2 * (1 - fk)).toFixed(3)})`; ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill(); } }
  const colAt = (y, k) => { const c = red ? (night ? [255, 140, 60] : (((y / 333 * 7) | 0) % 2 ? [236, 234, 228] : [214, 74, 40])) : (night ? [170, 200, 255] : [226, 232, 238]); const l = k % 2 ? .82 : 1; return `rgb(${c.map((v, q) => (lerp(v * l * (night ? 1 : LT.amb[q]), fog[q], fk)) | 0)})`; };
  const STEP = red ? 16.65 : 30;
  for (let y = 0; y < Ht - .1; y += STEP) { const y2 = Math.min(Ht, y + STEP);
    for (let k = 0; k < n; k++) { const a0 = cor(y, k), a1 = cor(y, k + 1), b0 = cor(y2, k), b1 = cor(y2, k + 1), mx = (a0[0] + a1[0]) / 2, mz = (a0[1] + a1[1]) / 2, nx = mx - t.wx, nz = mz - t.wz;
      if (nx * (mx - cx0) + nz * (mz - cz0) > 0) continue; // 見えない裏の面
      const q = [P(a0[0], a0[1], y), P(a1[0], a1[1], y), P(b1[0], b1[1], y2), P(b0[0], b0[1], y2)]; if (q.some(v => !v)) continue; if (Math.max(q[0][1], q[1][1]) < yb - 600) continue;
      ctx.fillStyle = colAt(y, k); if (red) ctx.globalAlpha = y > 140 && y < 160 || y > 240 && y < 255 ? .7 : .1; /* 鉄骨の塔は向こうが透けて見える（面はうすく、線を太く） */ ctx.beginPath(); q.forEach((v, i) => i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
      if (red) { ctx.strokeStyle = colAt(y, k); ctx.lineWidth = Math.max(.8, 2.2 * FOCAL / Math.max(30, q[0][2])); ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[3][0], q[3][1]); ctx.lineWidth *= 2.2; ctx.stroke(); ctx.lineWidth /= 2.2; ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[2][0], q[2][1]); ctx.moveTo(q[1][0], q[1][1]); ctx.lineTo(q[3][0], q[3][1]); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[3][0], q[3][1]); ctx.moveTo(q[1][0], q[1][1]); ctx.lineTo(q[2][0], q[2][1]); ctx.stroke(); } /* [M14] 鉄骨の X の筋かいと、4 本の脚 */
      else { const lw = clamp(1.4 * FOCAL / Math.max(30, q[0][2]), .8, 3.2); ctx.strokeStyle = night ? 'rgba(140,175,240,.7)' : 'rgba(128,142,158,.62)'; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[2][0], q[2][1]); ctx.moveTo(q[1][0], q[1][1]); ctx.lineTo(q[3][0], q[3][1]); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[1][0], q[1][1]);
        if (lw > 1.3) { const m = (u, v) => [lerp(lerp(q[0][0], q[1][0], u), lerp(q[3][0], q[2][0], u), v), lerp(lerp(q[0][1], q[1][1], u), lerp(q[3][1], q[2][1], u), v)], A = m(0, .5), Bm = m(1, .5); ctx.moveTo(A[0], A[1]); ctx.lineTo(Bm[0], Bm[1]); } ctx.stroke(); /* [空 T2] 近くで見る押上の塔は、白い鉄骨の X の網目と、輪の横の線（前は 30m ごとに斜めの細い線 1 本で、近くで見ると、のっぺりした白い柱だった） */
        ctx.strokeStyle = night ? 'rgba(220,235,255,.35)' : 'rgba(255,255,255,.5)'; ctx.lineWidth = Math.max(.6, lw * .4); ctx.beginPath(); ctx.moveTo(q[0][0] + lw * .6, q[0][1]); ctx.lineTo(q[2][0] + lw * .6, q[2][1]); ctx.stroke(); } } } /* [M15] 押上の塔の白い鉄骨の網目 */
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

/* [M35] 空港へおりていく飛行機：海の上を、高さ 900m → 300m へゆっくりおりていく（白い胴・つばさ・しっぽ。夜は赤と白の光） */
function rmPlanes(o, list, night) { const { P, yb } = o; for (let i = 0; i < list.length; i++) for (let n = 0; n < 2; n++) { const t = ((G.t * .012 + n * .5 + i * .3) % 1), [tx, tz] = list[i], sx = tx + 4200 * (1 - t), sz = tz - 2600 * (1 - t), y = 300 + 600 * (1 - t), dx = tx - sx, dz = tz - sz, L = Math.hypot(dx, dz) || 1, fx = dx / L, fz = dz / L;
  const nose = P(sx + fx * 30, sz + fz * 30, y), tail = P(sx - fx * 30, sz - fz * 30, y + 2), wl = P(sx - fz * 30, sz + fx * 30, y), wr = P(sx + fz * 30, sz - fx * 30, y), fin = P(sx - fx * 28, sz - fz * 28, y + 10);
  if (!nose || !tail || !wl || !wr || !fin) continue; if (nose[1] > yb + 40) continue; ctx.strokeStyle = night ? 'rgba(60,64,80,.9)' : 'rgba(246,246,246,.95)'; ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1, 5 * FOCAL / nose[2]); ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(tail[0], tail[1]); ctx.stroke(); ctx.lineWidth = Math.max(.6, 2.5 * FOCAL / nose[2]); ctx.beginPath(); ctx.moveTo(wl[0], wl[1]); ctx.lineTo(wr[0], wr[1]); ctx.moveTo(tail[0], tail[1]); ctx.lineTo(fin[0], fin[1]); ctx.stroke(); ctx.lineCap = 'butt';
  if (night || Math.floor(G.t * 1.6 + n) % 2) { ctx.fillStyle = night ? 'rgba(255,90,80,.95)' : 'rgba(255,90,80,.7)'; ctx.beginPath(); ctx.arc(wl[0], wl[1], 1.4, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(tail[0], tail[1], 1.2, 0, 7); ctx.fill(); } } }

/* [M38] タワークレーン：たての細い柱（黄色と白）、横にのびる腕と、反対の重り、ゆっくり回る */
function rmCrane(o, c, night, mixC) { const { P } = o, a = c.rot + Math.sin(G.t * .05 + c.t * 9) * .6, base = P(c.wx, c.wz, 0), top = P(c.wx, c.wz, c.h); if (!base || !top) return; const col = mixC([226, 184, 60], 1);
  ctx.strokeStyle = col; ctx.lineWidth = Math.max(.8, 2.4 * FOCAL / base[2]); ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(top[0], top[1]); ctx.stroke();
  const j1 = P(c.wx + Math.sin(a) * 50, c.wz + Math.cos(a) * 50, c.h), j0 = P(c.wx - Math.sin(a) * 14, c.wz - Math.cos(a) * 14, c.h); if (!j1 || !j0) return; ctx.lineWidth = Math.max(.6, 1.6 * FOCAL / base[2]); ctx.beginPath(); ctx.moveTo(j0[0], j0[1]); ctx.lineTo(j1[0], j1[1]); ctx.stroke();
  ctx.fillStyle = mixC([120, 124, 130], 1); ctx.fillRect(j0[0] - 1.5, j0[1] - 1, 3, 2.2); const hook = P(c.wx + Math.sin(a) * 34, c.wz + Math.cos(a) * 34, c.h - 18), hk0 = P(c.wx + Math.sin(a) * 34, c.wz + Math.cos(a) * 34, c.h); if (hook && hk0) { ctx.strokeStyle = 'rgba(60,60,60,.5)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(hk0[0], hk0[1]); ctx.lineTo(hook[0], hook[1]); ctx.stroke(); } }

/* [M47] 赤れんがの駅舎：長い 3 階建て、赤いれんがのかべに白い帯、灰色の屋根、両はしと中央に丸いドーム */
function rmBrick(o, s, night, mixC) { const { P } = o, { len, w, h } = s.brick, cr = Math.cos(s.rot), sr = Math.sin(s.rot), at = (x, z) => [s.wx + x * cr + z * sr, s.wz - x * sr + z * cr];
  const box = (x0, x1, z0, z1, y0, y1, col, roof) => { const c = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]].map(q => at(q[0], q[1])), b = c.map(q => P(q[0], q[1], y0)), t = c.map(q => P(q[0], q[1], y1)); if ([...b, ...t].some(q => !q)) return;
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; ctx.fillStyle = mixC(col, i % 2 ? .82 : 1); ctx.beginPath(); ctx.moveTo(b[i][0], b[i][1]); ctx.lineTo(b[j][0], b[j][1]); ctx.lineTo(t[j][0], t[j][1]); ctx.lineTo(t[i][0], t[i][1]); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = mixC(roof, 1); ctx.beginPath(); t.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill(); };
  const red = night ? [120, 70, 50] : [176, 84, 60], roof = night ? [50, 54, 62] : [96, 100, 108];
  box(-w / 2, w / 2, -len / 2, len / 2, 0, h, red, roof);
  for (const z of [-len / 2 + 20, 0, len / 2 - 20]) { box(-w / 2 - 4, w / 2 + 4, z - 18, z + 18, 0, h + 4, red, roof); const top = at(0, z), q = P(top[0], top[1], h + 4), q2 = P(top[0], top[1], h + 20); if (q && q2) { const r = Math.abs(q2[1] - q[1]); ctx.fillStyle = mixC(night ? [40, 46, 56] : [70, 78, 86], 1); ctx.beginPath(); ctx.ellipse(q[0], q[1], r * 1.1, r, 0, Math.PI, 0); ctx.fill(); } } }

/* [M53] さん橋：海につき出た長い台（灰色）と、横にとまる白い船（2 階建ての客席・青い帯） */
function rmPier(o, s, night, mixC) { const { P } = o, cr = Math.cos(s.rot), sr = Math.sin(s.rot), at = (x, z) => [s.wx + x * cr + z * sr, s.wz - x * sr + z * cr];
  const quadAt = (pts, y, col) => { const q = pts.map(p => at(p[0], p[1])).map(p => P(p[0], p[1], y)); if (q.some(v => !v)) return; ctx.fillStyle = col; ctx.beginPath(); q.forEach((v, i) => i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])); ctx.closePath(); ctx.fill(); };
  quadAt([[0, -12], [160, -12], [160, 12], [0, 12]], 2, mixC(night ? [60, 64, 72] : [178, 178, 172], 1));
  quadAt([[30, 14], [110, 14], [110, 30], [30, 30]], 4, mixC(night ? [200, 190, 160] : [246, 246, 244], 1)); quadAt([[40, 17], [100, 17], [100, 27], [40, 27]], 8, mixC(night ? [230, 220, 180] : [236, 238, 240], 1));
  quadAt([[30, 14], [110, 14], [110, 15.5], [30, 15.5]], 4.2, mixC([60, 110, 170], 1)); }
