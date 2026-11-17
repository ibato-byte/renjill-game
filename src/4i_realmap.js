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
  ],
  rail: [[1.17, 0.86], [1.12, 0.3], [1.04, -0.37], [0.75, -0.95], [0.2, -1.43], [-0.25, -2.4], [-0.62, -3.34]], railW: 46, // 新橋 → 浜松町 → 田町 → 品川（山手線・京浜東北線・東海道線…何本も並ぶ）
  hwy: [[[1.6, 1.1], [1.48, 0.2], [1.38, -0.45], [0.95, -1.5], [0.6, -2.5], [0.4, -3.3]], [[1.48, 0.2], [0.9, 0.35], [0.3, 0.55], [-0.3, 0.6], [-1.0, 0.45], [-1.8, 0.3]], [[0.3, 0.55], [0.15, 1.2], [0.25, 2.2]]], // 首都高：海ぞいの 1 号線・六本木へ行く 3 号線・都心環状線
  water: [[[1.95, 1.0], [1.9, 0.2], [1.75, -0.6], [1.5, -1.2], [1.2, -2.2], [0.9, -3.0]], 70], // 運河（芝浦）
  temple: [[0.23, -0.12, 52, 40, 22]], // 増上寺の本堂（芝公園の中）
  park: [[[-0.05, 0.15], [0.3, 0.2], [0.45, -0.05], [0.4, -0.5], [0.1, -0.55], [-0.08, -0.25]]], // 芝公園の森
};
const RM_SKY = { // 押上の電波塔のまわり（隅田川・浅草・錦糸町・両国・上野・大手町）
  land: [-0.85, 0.45], // 隅田公園
  bld: [
    [0.39, -1.5, 55, 50, 130, 1], [0.2, -1.6, 45, 40, 110, 0], [0.55, -1.35, 40, 40, 100, 4], [0.3, -1.75, 40, 40, 95, 2], // 錦糸町
    [-1.25, -1.85, 70, 60, 40, 3], // 両国の国技館（ひくく大きい）
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
  park: [],
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
  // [M2] 川・運河：本物の位置の水の帯（岸の白いコンクリート）
  if (M.water) { const [line, w] = M.water; ribbon(line, w + 10, night ? '#2A2E3A' : 'rgba(196,192,182,.95)'); ribbon(line, w, night ? '#0C1630' : 'rgba(84,118,144,.98)'); }
  // [M3] 線路の帯（バラストの茶色・レールの光る線）と [M4] 走る電車（立体の長い箱）
  for (const [line, w, kind] of [[M.rail, M.railW || 30, 0], [M.rail2, 24, 1]]) { if (!line) continue;
    ribbon(line, w, night ? '#1E2230' : 'rgba(132,120,104,.96)'); if (!lowq) for (let k = -2; k <= 2; k++) ribbon(line.map(q => q), 1.2, night ? 'rgba(160,170,200,.25)' : 'rgba(210,210,214,.5)');
    for (let n = 0; n < (lowq ? 2 : 5); n++) { const t = (G.t * (0.012 + n * .002) + n * .21) * (n % 2 ? -1 : 1), p = along(line, t), ln = 200, col = kind ? [234, 220, 90] : [[150, 196, 90], [80, 150, 220], [230, 120, 60], [210, 214, 220], [150, 196, 90]][n];
      const lat = (n - 2) * (w / 6), px = p[0] - p[3] * lat, pz = p[1] + p[2] * lat, bx = px - p[2] * ln, bz = pz - p[3] * ln, hw = 1.5, nx = -p[3] * hw, nz = p[2] * hw;
      const box = [[px + nx, pz + nz], [px - nx, pz - nz], [bx - nx, bz - nz], [bx + nx, bz + nz]]; polyW(box, night ? 'rgba(255,230,170,.85)' : `rgb(${col.map((v, q) => (v * amb[q]) | 0)})`, 3.6); polyW(box, night ? 'rgba(0,0,0,0)' : 'rgba(20,20,24,.25)', 3.0); } }
  // [M5] 首都高：高さ 12m の高架。下にかげ、柱、上の白い線、走る車（夜は赤と白の光の列）
  for (const line of M.hwy || []) { ribbon(line, 26, night ? 'rgba(0,0,0,.25)' : 'rgba(30,34,44,.18)', 0); ribbon(line, 22, night ? '#30343E' : mix([168, 170, 172].map((v, q) => v * amb[q]), 1, 1500), 12);
    if (!lowq) { ribbon(line, 1, night ? 'rgba(255,190,110,.55)' : 'rgba(246,246,240,.8)', 12.1); for (let i = 0; i + 1 < line.length; i++) { const a = Wk(...line[i]), b = Wk(...line[i + 1]), L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let u = 20; u < L; u += 60) { const k = u / L, x = lerp(a[0], b[0], k), z = lerp(a[1], b[1], k), q0 = P(x, z, 0), q1 = P(x, z, 12); if (q0 && q1 && q1[1] > yb) { ctx.strokeStyle = night ? 'rgba(40,44,56,.9)' : 'rgba(120,124,130,.85)'; ctx.lineWidth = Math.max(.8, 5 * F / q0[2]); ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.stroke(); } } } // 柱
      for (let n = 0; n < 14; n++) { const p = along(line, G.t * .008 * (n % 2 ? 1 : -1) + n / 14), q = P(p[0] + (n % 2 ? 4 : -4) * -p[3], p[1] + (n % 2 ? 4 : -4) * p[2], 13); if (!q || q[1] < yb) continue; const sz = clamp(5 * F / q[2], .8, 6); ctx.fillStyle = night ? (n % 2 ? 'rgba(255,90,70,.95)' : 'rgba(255,246,220,.95)') : ['#E9EDF0', '#2B2F36', '#C8463C', '#F2F2EE', '#4E77A0'][n % 5]; ctx.fillRect(q[0] - sz / 2, q[1] - sz / 3, sz, sz * .6); } } }
  // 立っている物（本物の高いビル・お寺）。遠い順に描くための、ならべる用の箱
  const stand = [];
  for (const b of M.bld) { const [wx, wz] = Wk(b[0], b[1]); stand.push({ wx, wz, bw: b[2] / 2, bd: b[3] / 2, tall: b[4], col: b[5], real: 1, rot }); }
  for (const t of M.temple || []) { const [wx, wz] = Wk(t[0], t[1]); stand.push({ wx, wz, bw: t[2] / 2, bd: t[3] / 2, tall: t[4], temple: 1, rot }); }
  return { stand, near: (wx, wz) => M.bld.some(b => { const [x, z] = Wk(b[0], b[1]); return Math.hypot(wx - x, wz - z) < 120; }) || (M.park || []).some(pk => { const c = pk.reduce((a, q) => [a[0] + q[0] / pk.length, a[1] + q[1] / pk.length], [0, 0]); const [x, z] = Wk(c[0], c[1]); return Math.hypot(wx - x, wz - z) < 260; }) };
}
/* [M7] お寺の本堂：低い基壇・白いかべ・大きな黒い瓦の屋根（四方へ下がる形） */
function rmTemple(o, s, night, mixC) { const { P, yb } = o, { wx, wz, bw, bd, tall, rot } = s, cr = Math.cos(rot), sr = Math.sin(rot), at = (x, z) => [wx + x * cr + z * sr, wz - x * sr + z * cr];
  const c4 = [[-bw, -bd], [bw, -bd], [bw, bd], [-bw, bd]].map(q => at(q[0], q[1])), wallH = tall * .45, b0 = c4.map(q => P(q[0], q[1], 0)), b1 = c4.map(q => P(q[0], q[1], wallH)), eave = [[-bw - 6, -bd - 6], [bw + 6, -bd - 6], [bw + 6, bd + 6], [-bw - 6, bd + 6]].map(q => at(q[0], q[1])).map(q => P(q[0], q[1], wallH)), ridge = [at(-bw * .45, 0), at(bw * .45, 0)].map(q => P(q[0], q[1], tall));
  if ([...b0, ...b1, ...eave, ...ridge].some(q => !q)) return; if (ridge.every(q => q[1] < yb)) return;
  ctx.fillStyle = mixC(night ? [70, 66, 60] : [236, 228, 212], 1); ctx.beginPath(); b0.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); b1.slice().reverse().forEach(q => ctx.lineTo(q[0], q[1])); ctx.closePath(); ctx.fill();
  const roofC = mixC(night ? [30, 32, 38] : [62, 64, 70], 1); ctx.fillStyle = roofC; for (const [i, j, r] of [[0, 1, 0], [1, 2, 1], [2, 3, 1], [3, 0, 0]]) { ctx.beginPath(); ctx.moveTo(eave[i][0], eave[i][1]); ctx.lineTo(eave[j][0], eave[j][1]); const r0 = (i === 1 || i === 2) ? ridge[1] : ridge[0], r1 = (j === 1 || j === 2) ? ridge[1] : ridge[0]; ctx.lineTo(r1[0], r1[1]); ctx.lineTo(r0[0], r0[1]); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = night ? 'rgba(120,120,130,.4)' : 'rgba(30,30,34,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ridge[0][0], ridge[0][1]); ctx.lineTo(ridge[1][0], ridge[1][1]); ctx.stroke(); }
