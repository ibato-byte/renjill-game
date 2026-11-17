/* ================= 上から見た東京（2026-11-17） =================
   オーナー：「図形の組み合わせだけのような景色にならないように。現実のような絶景に」。
   前は、地平線の下が一色の地面（のちに、四角い色の板のならび）だった。
   空から撮った写真のように見えるよう、町を 1 枚の細かい絵（1 ドット＝1 m、たて横 1024 m）に描きこみ、
   それを本当の遠近（高さ÷きょり）で地面にしきつめる。見回すと回り、進むと流れる。遠くは、同じ絵を小さくちぢめた物を使う（ちらつかない）。
   その上に、大きな地形（川・大きな公園・高速道路・線路・町ごとの色のちがい）の絵を重ね、海・雲のかげ・高いビル・かすみを足す。
   描きこんだ物の一覧は docs/AERIAL-2026-11-17.md */
const AER = { N: 1024, det: {}, mac: {}, pat: {}, MN: 512, MM: 32 };
function aerCanvas(n) { const c = document.createElement('canvas'); c.width = c.height = n; return c; }
// ---- 細かい絵：屋根の 1 つ 1 つ、道の白線、車、木、線路 ----
function aerDetail(night) {
  const N = AER.N, c = aerCanvas(N), g = c.getContext('2d'), r = rnd(4242), R = (a, b) => a + r() * (b - a);
  const ROOF = night ? ['#1B2033', '#20263A', '#181C2C', '#232A40', '#1D2236', '#262C42'] : ['#B9B8B2', '#D6D5CF', '#8E9096', '#9AA4AE', '#A38F7C', '#C9BFA9', '#ABA9A3', '#9A6E5E', '#C3C7C9', '#74787E', '#B7AE9E', '#8892A0'];
  const TILE = night ? ['#161A2A', '#1A1D2C', '#141826'] : ['#5E6168', '#6E6A66', '#7A5A4C', '#4E5E6E', '#807870', '#5A6A5C'];
  g.fillStyle = night ? '#101424' : '#74777C'; g.fillRect(0, 0, N, N);
  // アスファルトのむら（補修のあと・色のちがい）
  for (let i = 0; i < 900; i++) { g.fillStyle = night ? `rgba(255,255,255,${R(0, .02)})` : `rgba(${r() < .5 ? '0,0,0' : '255,255,255'},${R(.01, .05)})`; g.fillRect(r() * N, r() * N, R(4, 30), R(2, 10)); }
  // 道のあみ目：大通り（はば 24m）が 1 本ずつ、あとは細い道（6〜9m）。少しずつ間をかえる（きれいな方眼にしない）
  const mk = () => { const a = [{ p: 0, w: 24 }]; let p = 12; for (;;) { p += R(58, 104); if (p > N - 70) break; a.push({ p: Math.round(p), w: r() < .14 ? 14 : R(6, 9) }); } return a; };
  const VX = mk(), HZ = mk();
  const lots = [], spots = [];
  const sub = (x0, y0, x1, y1, d) => { const w = x1 - x0, h = y1 - y0; if ((w < 30 && h < 30) || d > 5 || (Math.max(w, h) < 46 && r() < .35)) { lots.push([x0, y0, x1, y1]); return; }
    if (w > h) { const m = x0 + w * R(.36, .64); sub(x0, y0, m, y1, d + 1); sub(m, y0, x1, y1, d + 1); } else { const m = y0 + h * R(.36, .64); sub(x0, y0, x1, m, d + 1); sub(x0, m, x1, y1, d + 1); } };
  for (let i = 0; i < VX.length; i++) for (let j = 0; j < HZ.length; j++) {
    const x0 = VX[i].p + VX[i].w / 2, x1 = (i + 1 < VX.length ? VX[i + 1].p : N) - (i + 1 < VX.length ? VX[i + 1].w : 24) / 2, y0 = HZ[j].p + HZ[j].w / 2, y1 = (j + 1 < HZ.length ? HZ[j + 1].p : N) - (j + 1 < HZ.length ? HZ[j + 1].w : 24) / 2;
    // 歩道（区画のふち）
    g.fillStyle = night ? '#1A1F30' : '#9C9A94'; g.fillRect(x0 - 1.6, y0 - 1.6, x1 - x0 + 3.2, y1 - y0 + 3.2);
    const kind = r(); if (kind < .045) spots.push(['park', x0, y0, x1, y1]); else if (kind < .075) spots.push(['school', x0, y0, x1, y1]); else if (kind < .1) spots.push(['shrine', x0, y0, x1, y1]); else if (kind < .13) spots.push(['big', x0, y0, x1, y1]);
    else { if (r() < .5) { const m = y0 + (y1 - y0) * R(.4, .6); g.fillStyle = night ? '#0E1220' : '#6A6D72'; g.fillRect(x0, m - 1.6, x1 - x0, 3.2); sub(x0 + 1, y0 + 1, x1 - 1, m - 2, 0); sub(x0 + 1, m + 2, x1 - 1, y1 - 1, 0); } else sub(x0 + 1, y0 + 1, x1 - 1, y1 - 1, 0); } }
  // かげ（建物の高さ）：日は左上から。先に全部のかげを落とす
  const hs = lots.map(() => { const q = r(); return q < .55 ? R(1.5, 3) : q < .88 ? R(3, 6) : R(7, 15); });
  if (!night) { g.fillStyle = 'rgba(20,24,34,.42)'; lots.forEach(([x0, y0, x1, y1], k) => { const h = hs[k], i = 1.2; g.beginPath(); g.moveTo(x1 - i, y0 + i); g.lineTo(x1 - i + h, y0 + i + h * 1.2); g.lineTo(x1 - i + h, y1 - i + h * 1.2); g.lineTo(x0 + i + h, y1 - i + h * 1.2); g.lineTo(x0 + i, y1 - i); g.lineTo(x1 - i, y1 - i); g.closePath(); g.fill(); }); }
  lots.forEach(([x0, y0, x1, y1], k) => { const w = x1 - x0, h = y1 - y0, hh = hs[k], q = r(), i = R(.9, 2.2), X = x0 + i, Y = y0 + i, Wd = w - 2 * i, Hd = h - 2 * i; if (Wd < 3 || Hd < 3) return;
    if (q < .05) { // 月ぎめ駐車場：白い線と車
      g.fillStyle = night ? '#171B2B' : '#85888C'; g.fillRect(X, Y, Wd, Hd); g.strokeStyle = night ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.7)'; g.lineWidth = .5; for (let x = X + 2.6; x < X + Wd - 1; x += 2.6) { g.beginPath(); g.moveTo(x, Y + 1); g.lineTo(x, Y + 6); g.stroke(); }
      for (let x = X + .5; x < X + Wd - 2.4; x += 2.6) if (r() < .6) { g.fillStyle = night ? '#2A3048' : ['#F4F4F2', '#22262C', '#B9BDC2', '#9A3A32', '#2E4E8A', '#D9D6CE'][(r() * 6) | 0]; g.fillRect(x + .4, Y + 1.4, 1.8, 4.2); } return; }
    if (q < .08) { // 空き地・工事中：土と重機
      g.fillStyle = night ? '#161824' : '#A08F74'; g.fillRect(X, Y, Wd, Hd); g.fillStyle = night ? '#22263A' : '#E2B53A'; g.fillRect(X + Wd * .4, Y + Hd * .4, 3, 2); return; }
    const small = Wd < 15 && Hd < 15 && hh < 6;
    if (small && r() < .78) { // 家：かわら屋根（むねで 2 色に分かれる。日の当たる側が明るい）
      const c0 = TILE[(r() * TILE.length) | 0], vert = Wd < Hd; g.fillStyle = c0; g.fillRect(X, Y, Wd, Hd);
      g.fillStyle = night ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.2)'; if (vert) g.fillRect(X, Y, Wd / 2, Hd); else g.fillRect(X, Y, Wd, Hd / 2);
      g.strokeStyle = night ? 'rgba(0,0,0,.4)' : 'rgba(30,30,34,.45)'; g.lineWidth = .5; g.beginPath(); if (vert) { g.moveTo(X + Wd / 2, Y); g.lineTo(X + Wd / 2, Y + Hd); } else { g.moveTo(X, Y + Hd / 2); g.lineTo(X + Wd, Y + Hd / 2); } g.stroke();
      if (r() < .3 && !night) { g.fillStyle = '#2A3A5A'; g.fillRect(X + Wd * .2, Y + Hd * .15, Wd * .25, Hd * .25); } // 太陽光パネル
      if (r() < .5) { g.fillStyle = night ? '#18241C' : ['#5E8A4E', '#6E9A56', '#4E7A46'][(r() * 3) | 0]; g.beginPath(); g.arc(x0 + R(1, 2), y0 + R(1, h - 1), R(1, 2.2), 0, 7); g.fill(); } // 庭の木
      if (night && r() < .6) { g.fillStyle = r() < .7 ? 'rgba(255,214,150,.9)' : 'rgba(230,240,255,.85)'; g.fillRect(X + R(0, Wd - 1.5), Y + Hd - 1.2, 1.4, 1); } return; }
    // ビル・マンション：平らな屋根
    const c0 = ROOF[(r() * ROOF.length) | 0]; const gr = g.createLinearGradient(X, Y, X + Wd, Y + Hd); gr.addColorStop(0, c0); gr.addColorStop(1, night ? '#12162400' : 'rgba(0,0,0,.14)'); g.fillStyle = c0; g.fillRect(X, Y, Wd, Hd); g.fillStyle = gr; g.fillRect(X, Y, Wd, Hd);
    g.strokeStyle = night ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.55)'; g.lineWidth = .7; g.beginPath(); g.moveTo(X, Y + Hd); g.lineTo(X, Y); g.lineTo(X + Wd, Y); g.stroke(); // 日の当たるへり（パラペット）
    g.strokeStyle = night ? 'rgba(0,0,0,.5)' : 'rgba(40,42,48,.4)'; g.beginPath(); g.moveTo(X + Wd, Y); g.lineTo(X + Wd, Y + Hd); g.lineTo(X, Y + Hd); g.stroke();
    if (!night) { g.strokeStyle = 'rgba(60,62,68,.22)'; g.lineWidth = .5; g.strokeRect(X + 1.2, Y + 1.2, Wd - 2.4, Hd - 2.4); } // 屋上のふちの内側
    const nd = Math.min(6, (Wd * Hd / 60) | 0);
    for (let m = 0; m < nd; m++) { const t = r(), px = X + R(1.5, Math.max(1.6, Wd - 4)), py = Y + R(1.5, Math.max(1.6, Hd - 4));
      if (t < .4) { g.fillStyle = night ? '#0C0F1A' : 'rgba(30,32,38,.45)'; g.fillRect(px + .6, py + .7, 2.2, 1.6); g.fillStyle = night ? '#2A3046' : '#E4E6E8'; g.fillRect(px, py, 2.2, 1.6); } // 室外機（かげつき）
      else if (t < .55) { g.fillStyle = night ? '#0C0F1A' : 'rgba(30,32,38,.5)'; g.fillRect(px + 1, py + 1.2, 4, 3); g.fillStyle = night ? '#262C42' : '#A9ACB0'; g.fillRect(px, py, 4, 3); g.fillStyle = night ? '#2E3550' : '#C9CCD0'; g.fillRect(px, py, 4, .8); } // 階段室
      else if (t < .65) { g.fillStyle = night ? '#0C0F1A' : 'rgba(30,32,38,.45)'; g.beginPath(); g.arc(px + 1.6, py + 1.8, 1.5, 0, 7); g.fill(); g.fillStyle = night ? '#2A3046' : '#D9DCDF'; g.beginPath(); g.arc(px + 1, py + 1, 1.5, 0, 7); g.fill(); } // 貯水タンク
      else if (t < .74 && Wd > 9) { g.fillStyle = night ? '#141A30' : '#27375A'; g.fillRect(px, py, 5, 3); g.strokeStyle = night ? 'rgba(255,255,255,.05)' : 'rgba(190,210,240,.5)'; g.lineWidth = .3; for (let u = 1; u < 5; u += 1.25) { g.beginPath(); g.moveTo(px + u, py); g.lineTo(px + u, py + 3); g.stroke(); } } // 太陽光パネル
      else if (t < .82 && Wd > 9) { g.fillStyle = night ? '#16221A' : '#6C9A58'; g.fillRect(px, py, 4.5, 3.2); g.fillStyle = night ? '#1A2A1E' : '#87B36C'; g.fillRect(px + .6, py + .6, 1.4, 1.2); } // 屋上の庭
      else if (t < .88) { g.strokeStyle = night ? 'rgba(255,255,255,.06)' : 'rgba(250,250,250,.7)'; g.lineWidth = .4; g.beginPath(); g.moveTo(px, py); g.lineTo(px + 4, py); g.moveTo(px, py + 1.2); g.lineTo(px + 4, py + 1.2); g.stroke(); } // 物ほしざお
      else if (t < .93 && hh > 7 && Wd > 14) { g.strokeStyle = night ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.85)'; g.lineWidth = .6; g.beginPath(); g.arc(px + 3, py + 3, 3.2, 0, 7); g.stroke(); g.beginPath(); g.moveTo(px + 1.8, py + 1.6); g.lineTo(px + 1.8, py + 4.4); g.moveTo(px + 4.2, py + 1.6); g.lineTo(px + 4.2, py + 4.4); g.moveTo(px + 1.8, py + 3); g.lineTo(px + 4.2, py + 3); g.stroke(); } // 高いビルのヘリの丸印
    }
    if (hh > 5 && !night && Wd > 8) { g.fillStyle = 'rgba(255,255,255,.1)'; for (let y = Y + Hd - 1; y > Y + Hd * .5; y -= 1.6) g.fillRect(X + Wd - .9, y, .9, .8); } // マンションのベランダ（東の面がちらっと見える）
    if (night) { const n2 = Math.min(10, (Wd * Hd / 26) | 0); for (let m = 0; m < n2; m++) if (r() < .55) { g.fillStyle = r() < .65 ? `rgba(255,${200 + r() * 30 | 0},${130 + r() * 50 | 0},${R(.55, .95)})` : `rgba(225,238,255,${R(.5, .9)})`; g.fillRect(X + Wd - R(.6, 1.6), Y + R(.5, Hd - 1.5), 1.1, .9 + r()); if (r() < .5) g.fillRect(X + R(.5, Wd - 1.5), Y + Hd - R(.6, 1.6), .9 + r(), 1.1); } }
  });
  // とくべつな区画
  for (const [k, x0, y0, x1, y1] of spots) { const w = x1 - x0, h = y1 - y0;
    if (k === 'park') { g.fillStyle = night ? '#101A14' : '#7FA862'; g.fillRect(x0, y0, w, h); for (let m = 0; m < 26; m++) { g.fillStyle = night ? 'rgba(255,255,255,.012)' : `rgba(${r() < .5 ? '255,255,220' : '40,80,30'},${R(.04, .1)})`; g.beginPath(); g.ellipse(x0 + r() * w, y0 + r() * h, R(4, 12), R(3, 8), r() * 3, 0, 7); g.fill(); }
      g.strokeStyle = night ? '#22283A' : '#D8CBA6'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0 + h * .3); g.bezierCurveTo(x0 + w * .4, y0 + h * .1, x0 + w * .5, y0 + h * .9, x1, y0 + h * .7); g.stroke(); g.beginPath(); g.ellipse(x0 + w * .5, y0 + h * .5, w * .16, h * .14, 0, 0, 7); g.stroke();
      g.fillStyle = night ? '#0E1830' : '#6E9AB4'; g.beginPath(); g.ellipse(x0 + w * .72, y0 + h * .3, w * .12, h * .1, .4, 0, 7); g.fill(); // 池
      for (let m = 0; m < w * h / 60; m++) { const px = x0 + R(2, w - 2), py = y0 + R(2, h - 2), rr = R(1.6, 3.6); if (!night) { g.fillStyle = 'rgba(20,40,20,.35)'; g.beginPath(); g.arc(px + rr * .5, py + rr * .6, rr, 0, 7); g.fill(); } g.fillStyle = night ? '#0C1610' : ['#4E7F42', '#5E9150', '#44743C', '#6C9E58'][(r() * 4) | 0]; g.beginPath(); g.arc(px, py, rr, 0, 7); g.fill(); if (!night) { g.fillStyle = 'rgba(200,230,150,.25)'; g.beginPath(); g.arc(px - rr * .3, py - rr * .3, rr * .45, 0, 7); g.fill(); } }
      if (night) for (let m = 0; m < 5; m++) { g.fillStyle = 'rgba(255,230,170,.8)'; g.fillRect(x0 + R(4, w - 4), y0 + R(4, h - 4), 1.2, 1.2); } }
    else if (k === 'school') { g.fillStyle = night ? '#191A26' : '#C9B58C'; g.fillRect(x0, y0, w, h); g.strokeStyle = night ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.8)'; g.lineWidth = .8; g.beginPath(); g.ellipse(x0 + w * .6, y0 + h * .58, w * .26, h * .26, 0, 0, 7); g.stroke();
      if (!night) { g.fillStyle = 'rgba(20,24,34,.4)'; g.fillRect(x0 + 8, y0 + 9, w - 6, 12); } g.fillStyle = night ? '#20263A' : '#D9D6CE'; g.fillRect(x0 + 3, y0 + 3, w - 6, 12); g.fillRect(x0 + 3, y0 + 3, 12, h * .6); g.fillStyle = night ? '#141A30' : '#5E8AB4'; g.fillRect(x1 - 20, y1 - 12, 16, 8); } // 校舎・運動場の白いだ円・プール
    else if (k === 'shrine') { g.fillStyle = night ? '#0E1812' : '#5F8A4E'; g.fillRect(x0, y0, w, h); for (let m = 0; m < w * h / 30; m++) { g.fillStyle = night ? '#0A140E' : ['#3E6E36', '#4E7F42', '#35602F'][(r() * 3) | 0]; g.beginPath(); g.arc(x0 + R(2, w - 2), y0 + R(2, h - 2), R(2, 4.5), 0, 7); g.fill(); }
      g.fillStyle = night ? '#1E2232' : '#CFC6B0'; g.fillRect(x0 + w * .46, y0 + h * .3, w * .08, h * .7); g.fillStyle = night ? '#141826' : '#4A5560'; g.fillRect(x0 + w * .34, y0 + h * .12, w * .32, h * .2); g.fillStyle = night ? '#1A1E2E' : '#6A7680'; g.fillRect(x0 + w * .34, y0 + h * .12, w * .32, h * .09); g.fillStyle = night ? '#3A1E1E' : '#C8442E'; g.fillRect(x0 + w * .42, y1 - 5, w * .16, 1.4); } // 鎮守の森・参道・社殿の屋根・鳥居
    else { if (!night) { g.fillStyle = 'rgba(20,24,34,.5)'; g.fillRect(x0 + 22, y0 + 26, w - 12, h - 12); } const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, night ? '#242B42' : '#C9CED3'); gr.addColorStop(1, night ? '#161B2C' : '#8E979F'); g.fillStyle = gr; g.fillRect(x0 + 6, y0 + 6, w - 12, h - 12);
      g.strokeStyle = night ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.7)'; g.lineWidth = 1; g.strokeRect(x0 + 6, y0 + 6, w - 12, h - 12); g.fillStyle = night ? '#1C2236' : '#7E878F'; g.fillRect(x0 + w * .3, y0 + h * .3, w * .4, h * .4); g.strokeStyle = night ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(x0 + w * .5, y0 + h * .5, Math.min(w, h) * .1, 0, 7); g.stroke();
      if (night) for (let m = 0; m < 70; m++) { g.fillStyle = r() < .6 ? 'rgba(255,220,150,.9)' : 'rgba(220,235,255,.9)'; g.fillRect(x1 - 6 - r() * 2, y0 + 6 + r() * (h - 12), 1.4, 1); g.fillRect(x0 + 6 + r() * (w - 12), y1 - 6 - r() * 2, 1, 1.4); } } // 大きなオフィスビル（長いかげ・屋上の丸印）
  }
  // 道の上：白線・横断歩道・街路樹・車・街灯
  const wrapV = (p, w, f) => { f(p); if (p - w < 0) f(p + N); if (p + w > N) f(p - N); };
  for (const v of VX) wrapV(v.p, v.w, px => { const big = v.w > 20;
    if (big) { g.fillStyle = night ? '#141A2C' : '#7C8086'; g.fillRect(px - 12, 0, 24, N); g.fillStyle = night ? '#182030' : '#9C9A94'; g.fillRect(px - 12, 0, 2.4, N); g.fillRect(px + 9.6, 0, 2.4, N); // 歩道
      g.fillStyle = night ? '#101A14' : '#6E9A58'; g.fillRect(px - .8, 0, 1.6, N); for (let y = 6; y < N; y += 9) { g.fillStyle = night ? '#0C1610' : '#4E7F42'; g.beginPath(); g.arc(px, y, 1.8, 0, 7); g.fill(); g.beginPath(); g.arc(px - 10.8, y + 4, 1.5, 0, 7); g.fill(); g.beginPath(); g.arc(px + 10.8, y + 2, 1.5, 0, 7); g.fill(); } // 中央分離帯と街路樹
      g.strokeStyle = night ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.75)'; g.lineWidth = .35; g.setLineDash([5, 5]); for (const o of [-6.4, -3.4, 3.4, 6.4]) { g.beginPath(); g.moveTo(px + o, 0); g.lineTo(px + o, N); g.stroke(); } g.setLineDash([]);
      for (let y = 4; y < N; y += R(7, 22)) { const ln = [-8, -5, -2, 2, 5, 8][(r() * 6) | 0], bus = r() < .08, L2 = bus ? 10 : 4.4; if (night) { g.fillStyle = ln < 0 ? 'rgba(255,250,235,.95)' : 'rgba(255,60,50,.9)'; g.fillRect(px + ln - .8, y, .6, .7); g.fillRect(px + ln + .3, y, .6, .7); g.fillStyle = 'rgba(255,240,200,.1)'; if (ln < 0) g.fillRect(px + ln - 1, y - 5, 2.2, 5); } else { g.fillStyle = 'rgba(20,22,28,.4)'; g.fillRect(px + ln - .5, y + .6, 2.2, L2); g.fillStyle = bus ? '#E9E4D6' : ['#F4F4F2', '#22262C', '#B9BDC2', '#9A3A32', '#2E4E8A', '#D9D6CE', '#E2B53A'][(r() * 7) | 0]; g.fillRect(px + ln - 1, y, 2, L2); g.fillStyle = 'rgba(40,60,80,.6)'; g.fillRect(px + ln - .8, y + 1, 1.6, 1); } }
      if (night) for (let y = 3; y < N; y += 18) for (const o of [-11, 11]) { const gl = g.createRadialGradient(px + o, y, 0, px + o, y, 7); gl.addColorStop(0, 'rgba(255,214,150,.75)'); gl.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = gl; g.fillRect(px + o - 7, y - 7, 14, 14); } }
    else { g.fillStyle = night ? '#0F1322' : '#6C6F74'; g.fillRect(px - v.w / 2, 0, v.w, N); if (v.w > 10) { g.strokeStyle = night ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.6)'; g.lineWidth = .3; g.setLineDash([4, 5]); g.beginPath(); g.moveTo(px, 0); g.lineTo(px, N); g.stroke(); g.setLineDash([]); }
      for (let y = 5; y < N; y += R(20, 60)) { if (night) { g.fillStyle = 'rgba(255,224,170,.85)'; g.fillRect(px - v.w / 2 + .2, y, 1, 1); } else { g.fillStyle = ['#F4F4F2', '#22262C', '#B9BDC2', '#2E4E8A'][(r() * 4) | 0]; g.fillRect(px - 1.9, y, 1.8, 4); } } } });
  for (const hz of HZ) wrapV(hz.p, hz.w, py => { const big = hz.w > 20;
    g.fillStyle = night ? (big ? '#141A2C' : '#0F1322') : (big ? '#7C8086' : '#6C6F74'); g.fillRect(0, py - hz.w / 2, N, hz.w);
    if (big) { g.fillStyle = night ? '#182030' : '#9C9A94'; g.fillRect(0, py - 12, N, 2.4); g.fillRect(0, py + 9.6, N, 2.4); g.strokeStyle = night ? 'rgba(255,220,120,.25)' : 'rgba(240,200,60,.8)'; g.lineWidth = .4; g.beginPath(); g.moveTo(0, py); g.lineTo(N, py); g.stroke(); g.strokeStyle = night ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.75)'; g.lineWidth = .35; g.setLineDash([5, 5]); for (const o of [-6, -3, 3, 6]) { g.beginPath(); g.moveTo(0, py + o); g.lineTo(N, py + o); g.stroke(); } g.setLineDash([]);
      for (let x = 4; x < N; x += R(8, 26)) { const ln = [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5][(r() * 6) | 0]; if (night) { g.fillStyle = ln < 0 ? 'rgba(255,60,50,.9)' : 'rgba(255,250,235,.95)'; g.fillRect(x, py + ln - .8, .7, .6); g.fillRect(x, py + ln + .3, .7, .6); } else { g.fillStyle = 'rgba(20,22,28,.4)'; g.fillRect(x + .6, py + ln - .5, 4.4, 2.2); g.fillStyle = ['#F4F4F2', '#22262C', '#B9BDC2', '#9A3A32', '#2E4E8A', '#3E8A5E'][(r() * 6) | 0]; g.fillRect(x, py + ln - 1, 4.4, 2); } }
      if (night) for (let x = 9; x < N; x += 18) for (const o of [-11, 11]) { const gl = g.createRadialGradient(x, py + o, 0, x, py + o, 7); gl.addColorStop(0, 'rgba(255,214,150,.75)'); gl.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = gl; g.fillRect(x - 7, py + o - 7, 14, 14); } }
    else for (let x = 5; x < N; x += R(24, 70)) { if (night) { g.fillStyle = 'rgba(255,224,170,.85)'; g.fillRect(x, py - hz.w / 2 + .2, 1, 1); } else { g.fillStyle = ['#F4F4F2', '#B9BDC2', '#9A3A32'][(r() * 3) | 0]; g.fillRect(x, py + .2, 4, 1.8); } } });
  // 交差点：横断歩道のしま・止まれの線
  for (const v of VX) for (const hz of HZ) { if (v.w < 12 && hz.w < 12) continue; g.fillStyle = night ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.8)';
    for (const px of v.p === 0 ? [0, N] : [v.p]) for (const py of hz.p === 0 ? [0, N] : [hz.p]) { for (let u = -v.w / 2 + 1; u < v.w / 2 - 1; u += 1.6) { g.fillRect(px + u, py - hz.w / 2 - 4, .8, 3); g.fillRect(px + u, py + hz.w / 2 + 1, .8, 3); } for (let u = -hz.w / 2 + 1; u < hz.w / 2 - 1; u += 1.6) { g.fillRect(px - v.w / 2 - 4, py + u, 3, .8); g.fillRect(px + v.w / 2 + 1, py + u, 3, .8); } } }
  // 線路（高架）：砂利の帯・レール 2 組・架線の柱・銀色の電車・高架のかげ
  { const ry = Math.round((HZ[Math.max(1, (HZ.length / 2) | 0)].p + 34) % N), y0 = ry;
    if (!night) { g.fillStyle = 'rgba(20,24,34,.35)'; g.fillRect(0, y0 + 4, N, 13); } g.fillStyle = night ? '#16182A' : '#8A8378'; g.fillRect(0, y0, N, 12); g.strokeStyle = night ? 'rgba(200,210,230,.25)' : '#4A4640'; g.lineWidth = .4; for (const o of [2.2, 3.7, 8.3, 9.8]) { g.beginPath(); g.moveTo(0, y0 + o); g.lineTo(N, y0 + o); g.stroke(); }
    g.strokeStyle = night ? 'rgba(0,0,0,.3)' : 'rgba(60,54,46,.35)'; g.lineWidth = .5; for (let x = 0; x < N; x += 1.4) { g.beginPath(); g.moveTo(x, y0 + 1.8); g.lineTo(x, y0 + 4.1); g.moveTo(x, y0 + 7.9); g.lineTo(x, y0 + 10.2); g.stroke(); } // まくら木
    g.fillStyle = night ? '#2A3046' : '#5A5E66'; for (let x = 10; x < N; x += 40) { g.fillRect(x, y0 - .5, .8, 13); } // 架線の柱
    const tx = 300; for (let c2 = 0; c2 < 8; c2++) { const x = tx + c2 * 20.6; g.fillStyle = night ? '#3A4058' : '#D9DDE1'; g.fillRect(x, y0 + 1.5, 20, 2.9); g.fillStyle = night ? '#4A5270' : '#F0F2F4'; g.fillRect(x + .5, y0 + 2, 19, .7); g.fillStyle = night ? 'rgba(255,236,190,.9)' : '#8A9098'; g.fillRect(x + 4, y0 + 2.8, 3, 1); g.fillRect(x + 13, y0 + 2.8, 3, 1); if (night) for (let u = 1; u < 19; u += 2) g.fillRect(x + u, y0 + 4.4, 1.2, .5); }
    g.fillStyle = night ? '#22283C' : '#B7BCC2'; g.fillRect(620, y0 - 6, 150, 5); g.fillRect(620, y0 + 12.5, 150, 5); g.strokeStyle = night ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.6)'; for (let x = 620; x < 770; x += 6) { g.beginPath(); g.moveTo(x, y0 - 6); g.lineTo(x, y0 - 1); g.moveTo(x, y0 + 12.5); g.lineTo(x, y0 + 17.5); g.stroke(); } if (night) { g.fillStyle = 'rgba(235,245,255,.5)'; g.fillRect(620, y0 - 1.4, 150, .8); g.fillRect(620, y0 + 12, 150, .8); } } // 駅のホームの屋根
  // 夜：繁華街のネオン（少しだけ）
  if (night) for (let m = 0; m < 160; m++) { g.fillStyle = ['rgba(255,90,140,.85)', 'rgba(90,220,255,.85)', 'rgba(120,255,160,.8)', 'rgba(255,170,60,.9)'][(r() * 4) | 0]; const v = VX[(r() * VX.length) | 0]; g.fillRect((v.p + (r() < .5 ? -1 : 1) * (v.w / 2 + 2.4) + N) % N, r() * N, 1.2, R(1.5, 4)); }
  return c;
}
// ---- 大きな地形の絵（1 ドット＝32 m、たて横 16 km）：川・運河・大きな公園・高速道路・線路・町ごとの色 ----
function aerMacro(night) {
  const N = AER.MN, c = aerCanvas(N), g = c.getContext('2d'), r = rnd(977), R = (a, b) => a + r() * (b - a), TAU = Math.PI * 2;
  const wrap = f => { for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) { g.save(); g.translate(ox, oy); f(); g.restore(); } };
  // 町ごとの色のちがい（商業地は白っぽく、下町は少し茶色く、新しい町は青っぽく）
  for (let i = 0; i < 26; i++) { const x = r() * N, y = r() * N, rad = R(30, 90), col = night ? ['255,190,110', '255,214,150', '160,190,255', '0,0,10'][i % 4] : ['255,255,255', '120,96,70', '70,100,140', '20,24,30', '250,244,230'][i % 5], a = night ? (i % 4 === 3 ? .35 : .16) : R(.06, .15);
    wrap(() => { const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }); }
  // 大きな公園・庭園・お寺の森（こんもりした木のかたまり、中に池や芝生）
  for (let i = 0; i < 9; i++) { const x = r() * N, y = r() * N, a = R(6, 20), b = R(5, 14), rot = r() * 3;
    wrap(() => { g.fillStyle = night ? 'rgba(6,10,14,.92)' : 'rgba(74,112,62,.95)'; g.beginPath(); for (let k = 0; k <= 20; k++) { const t = k / 20 * TAU, rr = 1 + Math.sin(t * 3 + i) * .13 + Math.sin(t * 7 + i * 2) * .06, px = Math.cos(t) * a * rr, py = Math.sin(t) * b * rr; const X = x + px * Math.cos(rot) - py * Math.sin(rot), Y = y + px * Math.sin(rot) + py * Math.cos(rot); k ? g.lineTo(X, Y) : g.moveTo(X, Y); } g.fill();
      if (!night) { g.fillStyle = 'rgba(132,170,98,.9)'; g.beginPath(); g.ellipse(x + a * .2, y, a * .32, b * .3, rot, 0, TAU); g.fill(); g.fillStyle = 'rgba(46,82,44,.5)'; for (let k = 0; k < 14; k++) { g.beginPath(); g.arc(x + Math.cos(k * 2.4) * a * .6, y + Math.sin(k * 2.4) * b * .6, 1.2, 0, TAU); g.fill(); } }
      g.fillStyle = night ? 'rgba(14,22,44,.95)' : 'rgba(96,134,160,.95)'; g.beginPath(); g.ellipse(x - a * .35, y + b * .15, a * .2, b * .16, rot + .5, 0, TAU); g.fill(); }); }
  // 川：ゆるく曲がる帯（はば約 190m）。岸の遊歩道、川面のうすい光、橋
  const rx = y => N * .62 + Math.sin(y / N * TAU) * 34 + Math.sin(y / N * TAU * 2 + 1) * 10;
  wrap(() => { g.lineCap = 'butt'; g.lineJoin = 'round'; const path = () => { g.beginPath(); for (let y = -2; y <= N + 2; y += 4) y < 0 ? g.moveTo(rx(y), y) : g.lineTo(rx(y), y); };
    g.strokeStyle = night ? 'rgba(40,46,70,.9)' : 'rgba(196,192,180,.95)'; g.lineWidth = 8.4; path(); g.stroke(); g.strokeStyle = night ? 'rgba(8,12,30,1)' : 'rgba(88,124,150,1)'; g.lineWidth = 6; path(); g.stroke();
    g.strokeStyle = night ? 'rgba(120,140,200,.12)' : 'rgba(190,220,235,.35)'; g.lineWidth = 1.4; g.beginPath(); for (let y = -2; y <= N + 2; y += 4) y < 0 ? g.moveTo(rx(y) - 1, y) : g.lineTo(rx(y) - 1, y); g.stroke(); });
  for (let y = 14; y < N; y += R(22, 44)) { const x = rx(y), col = night ? ['rgba(255,214,150,.95)', 'rgba(150,200,255,.95)', 'rgba(255,255,255,.9)'][(r() * 3) | 0] : ['rgba(232,232,226,1)', 'rgba(110,150,190,1)', 'rgba(196,74,58,1)', 'rgba(240,206,90,1)', 'rgba(120,170,120,1)'][(r() * 5) | 0]; g.strokeStyle = night ? 'rgba(0,0,0,.6)' : 'rgba(20,26,36,.35)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - 5.2, y + .8); g.lineTo(x + 5.2, y + .8); g.stroke(); g.strokeStyle = col; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 5.2, y); g.lineTo(x + 5.2, y); g.stroke(); } // 色とりどりの橋
  for (let y = 30; y < N; y += R(60, 120)) { const x = rx(y) + R(-1.5, 1.5); g.fillStyle = night ? 'rgba(255,230,170,.9)' : 'rgba(250,250,250,.95)'; g.fillRect(x, y, .8, 1.6); if (!night) { g.strokeStyle = 'rgba(230,240,245,.5)'; g.lineWidth = .4; g.beginPath(); g.moveTo(x + .4, y + 1.6); g.lineTo(x - .8, y + 5); g.moveTo(x + .4, y + 1.6); g.lineTo(x + 1.6, y + 5); g.stroke(); } } // 水上バスと引き波
  // 運河（まっすぐ・細い）
  wrap(() => { g.strokeStyle = night ? 'rgba(8,12,30,1)' : 'rgba(92,126,150,1)'; g.lineWidth = 2; g.beginPath(); g.moveTo(rx(N * .3), N * .3); g.lineTo(N * .95, N * .3); g.lineTo(N * .95, N * .78); g.stroke(); });
  // 高速道路：曲がりながら町をぬう明るい帯（夜はオレンジの明かりの線）
  const ey = x => N * .34 + Math.sin(x / N * TAU + .7) * 46 + Math.sin(x / N * TAU * 3) * 9;
  wrap(() => { const path = () => { g.beginPath(); for (let x = -2; x <= N + 2; x += 4) x < 0 ? g.moveTo(x, ey(x)) : g.lineTo(x, ey(x)); }; g.strokeStyle = night ? 'rgba(0,0,0,.5)' : 'rgba(20,26,36,.3)'; g.lineWidth = 1.6; g.save(); g.translate(.7, .9); path(); g.stroke(); g.restore();
    g.strokeStyle = night ? 'rgba(255,176,90,.95)' : 'rgba(206,206,200,1)'; g.lineWidth = 1.1; path(); g.stroke(); if (!night) { g.strokeStyle = 'rgba(120,124,130,.9)'; g.lineWidth = .25; path(); g.stroke(); } });
  // 環状の大通りと放射の大通り
  wrap(() => { g.strokeStyle = night ? 'rgba(255,214,150,.5)' : 'rgba(150,152,156,.85)'; g.lineWidth = .9; g.beginPath(); g.arc(N * .3, N * .7, N * .22, 0, TAU); g.stroke(); for (let k = 0; k < 5; k++) { const a = k * 1.26 + .3; g.beginPath(); g.moveTo(N * .3, N * .7); g.lineTo(N * .3 + Math.cos(a) * N * .6, N * .7 + Math.sin(a) * N * .6); g.stroke(); } });
  // 線路：何本も集まる大きな駅と、ひろがる車両基地
  wrap(() => { g.strokeStyle = night ? 'rgba(90,100,130,.7)' : 'rgba(128,118,104,.95)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, N * .86); g.bezierCurveTo(N * .3, N * .8, N * .5, N * .95, N, N * .86); g.stroke(); g.beginPath(); g.moveTo(N * .12, 0); g.bezierCurveTo(N * .2, N * .4, N * .05, N * .7, N * .12, N); g.stroke();
    g.fillStyle = night ? 'rgba(30,36,56,.9)' : 'rgba(140,132,120,.9)'; g.fillRect(N * .1, N * .5, 7, 16); g.strokeStyle = night ? 'rgba(160,180,220,.3)' : 'rgba(70,64,56,.7)'; g.lineWidth = .3; for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(N * .1 + .5 + k, N * .5); g.lineTo(N * .1 + .5 + k, N * .5 + 16); g.stroke(); } });
  // 競技場（だ円の屋根）・大きな倉庫街・ふ頭のコンテナ
  wrap(() => { g.fillStyle = night ? 'rgba(40,48,70,.95)' : 'rgba(226,228,226,.98)'; g.beginPath(); g.ellipse(N * .8, N * .12, 7, 5.6, .3, 0, TAU); g.fill(); g.fillStyle = night ? 'rgba(10,20,14,1)' : 'rgba(98,150,84,1)'; g.beginPath(); g.ellipse(N * .8, N * .12, 3.6, 2.4, .3, 0, TAU); g.fill();
    for (let k = 0; k < 16; k++) { g.fillStyle = night ? 'rgba(26,32,50,.95)' : ['rgba(186,190,194,.95)', 'rgba(150,170,190,.95)', 'rgba(206,200,188,.95)'][k % 3]; g.fillRect(N * .97 + (k % 4) * 4.2, N * .34 + ((k / 4) | 0) * 5, 3.6, 4); }
    for (let k = 0; k < 40; k++) { g.fillStyle = night ? 'rgba(255,200,120,.5)' : ['rgba(180,70,56,.95)', 'rgba(60,100,160,.95)', 'rgba(210,170,60,.95)', 'rgba(70,130,100,.95)'][k % 4]; g.fillRect(N * .97 + (k % 10) * 1.5, N * .58 + ((k / 10) | 0) * 1.3, 1.2, .9); } });
  // 高いビルのかたまりが落とす長いかげ（昼）／明るい町の中心（夜）
  for (let i = 0; i < 7; i++) { const x = r() * N, y = r() * N; wrap(() => { for (let k = 0; k < 9; k++) { const px = x + R(-9, 9), py = y + R(-9, 9); if (night) { g.fillStyle = 'rgba(255,226,170,.55)'; g.fillRect(px, py, 1, 1); } else { g.fillStyle = 'rgba(20,26,40,.3)'; g.beginPath(); g.moveTo(px, py); g.lineTo(px + 1.2, py); g.lineTo(px + 4.4, py + 3.6); g.lineTo(px + 3.2, py + 3.6); g.closePath(); g.fill(); g.fillStyle = 'rgba(214,220,226,.9)'; g.fillRect(px, py - .6, 1.2, 1.2); } } }); }
  return c;
}
function aerFine(night, grass) { const k = (night ? 'fn' : 'fd') + (grass ? 'g' : ''); if (AER.pat[k]) return AER.pat[k]; // [R2] 1 ドット＝25cm の細かいきめ（くり返しが目立たない 256 ドット）
  const N = 256, c = aerCanvas(N), g = c.getContext('2d'), r = rnd(4411); g.clearRect(0, 0, N, N);
  for (let i = 0; i < 2600; i++) { const v = r(); g.fillStyle = v < .5 ? (night ? 'rgba(0,0,0,.22)' : 'rgba(30,30,34,.16)') : (night ? 'rgba(120,130,160,.10)' : 'rgba(255,255,250,.16)'); g.fillRect(r() * N, r() * N, .6 + r() * 1.2, .6 + r() * 1.2); } // [R3] 粒
  for (let i = 0; i < 14; i++) { const x = r() * N, y = r() * N, rr = 4 + r() * 16; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, night ? 'rgba(0,0,0,.14)' : 'rgba(40,36,30,.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); } // [R4] しみ・水のあと
  g.strokeStyle = night ? 'rgba(0,0,0,.25)' : 'rgba(40,40,44,.18)'; g.lineWidth = .5; for (let i = 0; i < 9; i++) { let x = r() * N, y = r() * N; g.beginPath(); g.moveTo(x, y); for (let m = 0; m < 6; m++) { x += (r() - .5) * 14; y += (r() - .5) * 14; g.lineTo(x, y); } g.stroke(); } // [R5] ひび
  if (grass) { for (let i = 0; i < 3800; i++) { const x = r() * N, y = r() * N, v = r(); g.strokeStyle = night ? (v < .5 ? 'rgba(0,0,0,.25)' : 'rgba(90,120,100,.12)') : (v < .45 ? 'rgba(40,70,30,.28)' : v < .85 ? 'rgba(170,200,110,.24)' : 'rgba(210,190,120,.22)'); g.lineWidth = .5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 1.6, y + 1 + r() * 2); g.stroke(); } // [R7] 芝の葉・枯れた所（公園の上）
    for (let i = 0; i < 18; i++) { const x = r() * N, y = r() * N, rr = 6 + r() * 20, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, night ? 'rgba(0,0,0,.12)' : (i & 1 ? 'rgba(60,90,40,.16)' : 'rgba(200,190,120,.14)')); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); } // [R8] 芝のこい所・うすい所のむら
    return (AER.pat[k] = ctx.createPattern(c, 'repeat')); }
  g.strokeStyle = night ? 'rgba(0,0,0,.18)' : 'rgba(60,58,54,.12)'; g.lineWidth = .4; for (let x = 0; x < N; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, N); g.stroke(); } for (let y = 0; y < N; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(N, y); g.stroke(); } // [R6] 屋上・歩道の目地（4m ごと）
  return (AER.pat[k] = ctx.createPattern(c, 'repeat')); }
function aerGet(night) { const k = night ? 'n' : 'd'; if (AER.det[k]) return AER.det[k];
  const base = aerDetail(night), mips = [base]; let cur = base;
  for (let m = 1; m < 6; m++) { const n = cur.width >> 1, c = aerCanvas(n), g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, n, n); mips.push(c); cur = c; } // 遠く用：半分ずつに小さくした絵（ちらつきを止める）
  AER.det[k] = mips.map(c => ctx.createPattern(c, 'repeat')); AER.mac[k] = ctx.createPattern(aerMacro(night), 'repeat'); return AER.det[k]; }
function aerWarm() { try { aerGet(LT.night > .4); } catch (e) { } } // コースが始まる前に作っておく（その場で作ると一瞬止まる）
function acHash(i, j, k) { let h = (i * 374761393 + j * 668265263 + k * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function aerialCity(seg, yb, alt, hz) {
  const N = LT.night, night = N > .4, cs = Math.sin(CAM.yaw), cc = Math.cos(CAM.yaw), th = seg.th, cx0 = CAM.x, cz0 = CAM.z, camH = alt + 2.4, F = FOCAL;
  const lowq = typeof lowQ !== 'undefined' && lowQ, det = aerGet(night), mac = AER.mac[night ? 'n' : 'd'];
  const fog = night ? [30, 38, 68] : [LT.bot[0] * .92, LT.bot[1] * .94, LT.bot[2] * .97];
  const bay = th.bay, face = th.face != null ? th.face : 0, dirA = seg.dir * Math.PI / 2;
  // 町の「基準の点」：場所ごとに決まった所（塔の足もと）を原点にする。どの場所から見ても同じ町が同じ所にある
  const ox = seg.sx, oz = seg.sz, rx = cx0 - ox, rz = cz0 - oz;
  const P = (wx, wz, y) => { const dx = wx - cx0, dz = wz - cz0, d = dx * cs + dz * cc; if (d < 1) return null; const l = dx * cc - dz * cs; return [W / 2 + l / d * F, hz + (camH - (y || 0)) / d * F, d]; };
  ctx.save(); ctx.beginPath(); ctx.rect(0, yb - 1, W, H - yb + 1); ctx.clip();
  ctx.fillStyle = `rgb(${fog.map(v => v | 0)})`; ctx.fillRect(0, yb - 1, W, H - yb + 1);
  // ---- 1) 地面の絵を、画面の横 1 すじずつ、本当の遠近でしきつめる ----
  const step = lowq ? 4 : 2, amb = night ? 1 : Math.min(1, (LT.amb[0] + LT.amb[1] + LT.amb[2]) / 3 + .08);
  const strip = (pat, mpp, y0, y1) => { const ym = (y0 + y1) / 2, d = camH * F / Math.max(.5, ym - hz), gy = -camH * F / (d * d);
    // 画面 → 地面：その横すじの 4 すみが、地面のどこに当たるか
    const w = (sx, sy) => { const dd = d + (sy - ym) / gy, l = (sx - W / 2) * dd / F; return [(rx + dd * cs + l * cc) / mpp, (rz + dd * cc - l * cs) / mpp]; };
    const a = w(0, y0), b = w(W, y0), c2 = w(W, y1), e = w(0, y1);
    ctx.save(); const A = cc * F / d * mpp, B = gy * cs * mpp, C2 = -cs * F / d * mpp, D = gy * cc * mpp; // 地面（絵のドット）→ 画面
    const bx = rx / mpp, bz = rz / mpp, e0 = W / 2 - (A * (bx + d * cs / mpp) + C2 * (bz + d * cc / mpp)), f0 = ym - (B * (bx + d * cs / mpp) + D * (bz + d * cc / mpp));
    ctx.transform(A, B, C2, D, e0, f0); ctx.fillStyle = pat; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(e[0], e[1]); ctx.closePath(); ctx.fill(); ctx.restore(); return d; };
  for (let y = Math.max(yb, hz + 2); y < H; y += step) { const d = camH * F / Math.max(.5, y + step / 2 - hz); if (d > 14000) continue;
    const foot = d / F * Math.max(1, d / camH * .5), lv = clamp(Math.round(Math.log2(Math.max(1, foot))), 0, 5); // 1 ドットが地面の何 m に当たるか → 絵の細かさをえらぶ
    strip(det[lv], 1 << lv, y - .3, y + step + .3); }
  if (night && !lowq) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .75; for (let y = Math.max(yb, hz + 2); y < H; y += step * 2) { const d = camH * F / Math.max(.5, y + step - hz); if (d > 9000) continue; const foot = d / F * Math.max(1, d / camH * .5), lv = clamp(Math.round(Math.log2(Math.max(1, foot))) - 1, 0, 5); strip(det[lv], 1 << lv, y - .3, y + step * 2 + .3); } ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; } // 夜：明かりをもう 1 回重ねて、明かりのじゅうたんに
  // ---- 2) 大きな地形（川・公園・高速・線路・町ごとの色）を重ねる ----
  ctx.globalAlpha = night ? .95 : .9; for (let y = Math.max(yb, hz + 2); y < H; y += step * 2) { const d = camH * F / Math.max(.5, y + step - hz); if (d > 14000) continue; strip(mac, AER.MM, y - .3, y + step * 2 + .3); } ctx.globalAlpha = 1;
  if (!night && amb < .97) { ctx.fillStyle = `rgba(${(LT.amb[0] * 40) | 0},${(LT.amb[1] * 30) | 0},${(LT.amb[2] * 40) | 0},${(1 - amb) * .9})`; ctx.fillRect(0, yb, W, H - yb); } // 朝夕：全体が少し暗く、色がつく
  if (!night && LT.amb[2] < .86) { const wg = ctx.createLinearGradient(0, yb, 0, H); wg.addColorStop(0, 'rgba(255,170,90,.28)'); wg.addColorStop(1, 'rgba(255,150,80,.08)'); ctx.fillStyle = wg; ctx.globalCompositeOperation = 'soft-light'; ctx.fillRect(0, yb, W, H - yb); ctx.globalCompositeOperation = 'source-over'; } // 夕焼けの色が町にうつる
  // ---- 3) 海（東京湾）：方角ときょりで決まる。水平線へ向かって明るく、きらめき、船と引き波、岸の白い線 ----
  if (bay) { const toA = b => dirA + (b - face) * Math.PI / 180, ring = (dist, y) => { const out = []; for (let k = 0; k <= 16; k++) { const a = toA(lerp(bay[0], bay[1], k / 16)), q = P(cx0 + Math.sin(a) * dist, cz0 + Math.cos(a) * dist, y); out.push(q); } return out; };
    const near = ring(bay[2]), far = ring(60000); let run = [];
    const flush = () => { if (run.length > 1) { ctx.beginPath(); run.forEach(([n], m) => m ? ctx.lineTo(n[0], n[1]) : ctx.moveTo(n[0], n[1])); for (let m = run.length - 1; m >= 0; m--) ctx.lineTo(run[m][1][0], Math.min(run[m][1][1], run[m][0][1])); ctx.closePath();
        const y0 = Math.min(...run.map(q => q[1][1])), y1 = Math.max(...run.map(q => q[0][1])), wg = ctx.createLinearGradient(0, y0, 0, Math.max(y0 + 1, y1)); if (night) { wg.addColorStop(0, 'rgb(26,34,62)'); wg.addColorStop(1, 'rgb(10,14,32)'); } else { wg.addColorStop(0, `rgb(${(fog[0] * .86) | 0},${(fog[1] * .9) | 0},${(fog[2] * .95) | 0})`); wg.addColorStop(.5, `rgb(${(96 * amb) | 0},${(134 * amb) | 0},${(162 * amb) | 0})`); wg.addColorStop(1, `rgb(${(70 * amb) | 0},${(108 * amb) | 0},${(140 * amb) | 0})`); } ctx.fillStyle = wg; ctx.fill();
        ctx.strokeStyle = night ? 'rgba(255,220,160,.5)' : 'rgba(240,244,244,.7)'; ctx.lineWidth = 1.2; ctx.beginPath(); run.forEach(([n], m) => m ? ctx.lineTo(n[0], n[1]) : ctx.moveTo(n[0], n[1])); ctx.stroke(); } run = []; };
    for (let k = 0; k <= 16; k++) { if (near[k] && far[k]) run.push([near[k], far[k]]); else flush(); } flush();
    for (let k = 0; k < (lowq ? 0 : 46); k++) { const h1 = acHash(k, 7, 3), h2 = acHash(k, 11, 5), a = toA(lerp(bay[0], bay[1], h1)), dist = bay[2] * (1.15 + h2 * h2 * 9), q = P(cx0 + Math.sin(a) * dist, cz0 + Math.cos(a) * dist); if (!q || q[1] < yb) continue;
      if (k < 7) { const sz = clamp(900 / q[2] * F / 400, .8, 5); ctx.fillStyle = night ? 'rgba(255,236,190,.95)' : 'rgba(250,250,248,.95)'; ctx.fillRect(q[0] - sz * 1.6, q[1] - sz * .5, sz * 3.2, sz * .8); if (!night) { ctx.fillStyle = 'rgba(190,60,50,.9)'; ctx.fillRect(q[0] - sz * 1.6, q[1] + sz * .1, sz * 3.2, sz * .25); ctx.strokeStyle = 'rgba(235,244,246,.55)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(q[0] + sz * 1.6, q[1]); ctx.lineTo(q[0] + sz * 6, q[1] - sz * .5); ctx.moveTo(q[0] + sz * 1.6, q[1]); ctx.lineTo(q[0] + sz * 6, q[1] + sz * .7); ctx.stroke(); } } // 船と引き波
      else if (Math.sin(G.t * (2 + h1 * 3) + k) > .2) { ctx.fillStyle = night ? 'rgba(200,214,255,.35)' : 'rgba(255,255,255,.75)'; ctx.fillRect(q[0], q[1], 2.4 + h2 * 3, 1); } } } // 波のきらめき
  // ---- 4) 雲のかげが、町の上をゆっくり流れる（昼） ----
  if (!night && !lowq && G.weather === 'clear') { ctx.fillStyle = 'rgba(24,34,60,.13)'; for (let k = 0; k < 5; k++) { const wx = ox + ((acHash(k, 3, 1) * 5000 + G.t * 9) % 5000) - 2500 + rx * 0, wz = oz + acHash(k, 5, 2) * 5000 - 2500, a = 260 + acHash(k, 9, 4) * 340, b2 = a * .55; ctx.beginPath(); let ok = 1;
      for (let m = 0; m <= 14; m++) { const t = m / 14 * Math.PI * 2, q = P(wx + Math.cos(t) * a * (1 + .15 * Math.sin(t * 3 + k)), wz + Math.sin(t) * b2 * (1 + .2 * Math.cos(t * 2 + k))); if (!q) { ok = 0; break; } m ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } if (ok) ctx.fill(); } }
  // ---- 4.5) 着地する公園（空の上の時）：森・芝生・園路・池。おりていく先に、本当に公園がある ----
  let park = null;
  if (th.sky) { const e = segPos(seg, seg.len - 10, 0), fx = Math.sin(dirA), fz = Math.cos(dirA), ux = Math.cos(dirA), uz = -Math.sin(dirA); park = { x: e[0], z: e[1], fx, fz, ux, uz };
    const Q = (f, l, y) => P(e[0] + fx * f + ux * l, e[1] + fz * f + uz * l, y), poly = (pts, fill) => { /* [D15] カメラの真下・うしろまで広がる形は、目の前で切って描く（前は、形の一部がカメラのうしろにあると、まるごと描かなかった＝真下の公園が消えた） */
      const cam = pts.map(([f, l]) => { const wx = e[0] + fx * f + ux * l, wz = e[1] + fz * f + uz * l, dx = wx - cx0, dz = wz - cz0; return [dx * cs + dz * cc, dx * cc - dz * cs]; }), NR = 1.5, out = [];
      for (let i = 0; i < cam.length; i++) { const A = cam[i], B = cam[(i + 1) % cam.length], ia = A[0] >= NR, ib = B[0] >= NR; if (ia) out.push(A); if (ia !== ib) { const t = (NR - A[0]) / (B[0] - A[0]); out.push([NR, A[1] + (B[1] - A[1]) * t]); } }
      if (out.length < 3) return; ctx.beginPath(); out.forEach(([d, l], i) => { const x = W / 2 + l / d * F, y = hz + camH / d * F; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
    const ring = (f0, l0, rf, rl, n) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [f0 + Math.cos(a) * rf * (1 + .08 * Math.sin(a * 5)), l0 + Math.sin(a) * rl * (1 + .08 * Math.cos(a * 3))]; });
    poly(ring(40, 0, 260, 190, 28), night ? '#14261C' : '#4E7A44'); // [D7] 公園の森（外がわ）
    poly(ring(60, 0, 150, 70, 22), night ? '#1C3224' : '#7FA35E'); // [D8] まん中の芝生の広場
    poly([[-400, -4], [230, -4], [230, 4], [-400, 4]], night ? '#3A3628' : '#D9CBA8'); poly([[100, -150], [104, -150], [104, 150], [100, 150]], night ? '#3A3628' : '#CDBF9C'); // [D9] 園路（着地する道と、横切る道）
    poly(ring(150, 90, 34, 22, 16), night ? '#152436' : '#5F8FA8'); // [D10] 池
    const rv = th.riv || 0; if (rv) { const n0 = rv * 16, n1 = rv * 100; poly([[-3000, n0 - rv * 6], [3000, n0 - rv * 6], [3000, n0], [-3000, n0]], night ? '#4A4A4A' : '#B9B4A8'); poly([[-3000, n0], [3000, n0], [3000, n1], [-3000, n1]], night ? '#0E1630' : '#58798F'); poly([[-3000, n1], [3000, n1], [3000, n1 + rv * 8], [-3000, n1 + rv * 8]], night ? '#4A4A4A' : '#B9B4A8'); /* [R9] 押上のオオタカ：着地する公園のわきに、本当に川（向こう岸は 100m 先。着地した場所の川とそろえる・両岸のコンクリートの護岸） */
      for (let k = 0; k < 3; k++) { const f0 = -600 + k * 700, w2 = 12; poly([[f0, n0], [f0 + w2, n0], [f0 + w2, n1], [f0, n1]], night ? '#3A3C48' : ['#C8C3B4', '#7EA0C4', '#C9564A'][k]); } /* [R10] 川にかかる橋（色のちがう 3 本） */
      if (!night) for (let k = 0; k < 6; k++) { const f0 = -500 + acHash(k, 2, 7) * 1200, l0 = n0 + rv * (30 + acHash(k, 5, 7) * 140); poly([[f0, l0], [f0 + 18, l0], [f0 + 18, l0 + rv * 4], [f0, l0 + rv * 4]], 'rgba(235,240,242,.9)'); poly([[f0 - 40, l0 + rv * 1.5], [f0, l0], [f0, l0 + rv * 4], [f0 - 40, l0 + rv * 2.5]], 'rgba(220,232,238,.35)'); } } /* [R11] 川をゆく船と、うしろの白い引き波 */
    if (alt < 70) { const fp = aerFine(night, !!th.sky), k = clamp((70 - alt) / 40, 0, 1); ctx.globalAlpha = .55 * k; for (let y = Math.max(yb, hz + 2); y < H; y += step) { const d = camH * F / Math.max(.5, y + step / 2 - hz); if (d > 260) continue; const foot = d / F * Math.max(1, d / camH * .5); if (foot > .9) continue; ctx.globalAlpha = .55 * k * clamp((.9 - foot) / .5, 0, 1); strip(fp, .25, y - .3, y + step + .3); } ctx.globalAlpha = 1; } // [R1] 低い所（70m より下）：足もとの地面に細かいきめ（アスファルトの粒・目地・小さなしみ）を重ね、引きのばされたぼやけを消す
    for (let k = 0; k < (lowq ? 40 : 140); k++) { const a = acHash(k, 3, 9) * Math.PI * 2, rr = .55 + acHash(k, 4, 9) * .45, f = 40 + Math.cos(a) * 250 * rr, l = Math.sin(a) * 180 * rr; if (Math.abs(l) < 9 && f > -400 && f < 230) continue; if (th.riv && l * th.riv > 12) continue; /* 川の上に木を生やさない */ const q = Q(f, l, 0); if (!q || q[1] < yb) continue; const sz = clamp(9 * F / q[2], .6, 40); // [D11] 森の木 1 本ずつ（丸い葉のかたまりと、かげ）
      ctx.fillStyle = 'rgba(20,30,20,.35)'; ctx.beginPath(); ctx.ellipse(q[0] + sz * .4, q[1] + sz * .2, sz, sz * .5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = night ? '#1E3A26' : ['#5F9E5A', '#4C8A48', '#6FAE62'][k % 3]; ctx.beginPath(); ctx.ellipse(q[0], q[1] - sz * .3, sz, sz * .62, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = night ? 'rgba(80,120,90,.3)' : 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(q[0] - sz * .3, q[1] - sz * .5, sz * .4, sz * .25, 0, 0, Math.PI * 2); ctx.fill(); }
    if (alt < 90) { const pl = G.player; for (const b of [pl, G.follow, G.pom]) { if (!b || !b.show || b.wx == null) continue; const q = P(b.wx, b.wz, 0); if (!q || q[1] < yb) continue; const sz = clamp(.38 * F / q[2], 1.2, 26), a = clamp(1 - alt / 90, 0, 1) * .26, blur = 1 + alt / 12; ctx.fillStyle = `rgba(20,24,30,${(a / blur * 1.6).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(q[0], q[1], sz * 1.6 * blur, sz * .45 * blur, 0, 0, Math.PI * 2); ctx.fill(); /* 高いほどうすく大きくぼける */ } } } // [D12] 低くなると、地面にオオタカとうさぎのかげが落ちる
  // ---- 5) 高いビル（立っている形）：かげ・窓の列・角の明るさ・屋上 ----
  { const S = 190, rng = lowq ? 900 : 2400, list = []; const i0 = Math.floor((rx - rng) / S), i1 = Math.ceil((rx + rng) / S), j0 = Math.floor((rz - rng) / S), j1 = Math.ceil((rz + rng) / S);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const h = acHash(i, j, 77); if (h < .8) continue; const wx = ox + (i + .2 + acHash(i, j, 5) * .5) * S, wz = oz + (j + .2 + acHash(i, j, 6) * .5) * S, dx = wx - cx0, dz = wz - cz0, d = dx * cs + dz * cc; if (d < 30 || d > rng) continue; if (Math.abs(dx * cc - dz * cs) > d * (W / 2 / F + .3)) continue;
      if (Math.hypot(wx - ox, wz - oz) < 70) continue; // 塔の真下には立てない
      if (park && Math.hypot(wx - park.x, wz - park.z) < 330) continue; // [D13] 公園の中・おりる道の上には、高いビルを立てない
      list.push([d, wx, wz, h, i, j]); }
    list.sort((a, b) => b[0] - a[0]);
    for (const [d, wx, wz, h, i, j] of list) { const hh = acHash(i, j, 9), tall = Math.min(camH * 1.15 + 40, 34 + (h - .8) / .2 * (hh > .8 ? 190 : 90)), bw = 16 + hh * 22, bd = 14 + acHash(i, j, 10) * 20, fk = clamp(1 - Math.exp(-d / (4200 + camH * 8)), 0, .85);
      const pts = [[wx - bw, wz - bd], [wx + bw, wz - bd], [wx + bw, wz + bd], [wx - bw, wz + bd]], tp = pts.map(q => P(q[0], q[1], tall)), bt = pts.map(q => P(q[0], q[1], 0)); if (tp.some(q => !q) || bt.some(q => !q) || tp.some(q => q[1] < yb + 1)) continue;
      const base = night ? [28, 34, 56] : [[176, 186, 196], [150, 164, 180], [198, 196, 188], [128, 144, 162], [208, 212, 216]][(hh * 5) | 0].map((v, q) => v * LT.amb[q]), mixF = (c, k) => c.map((v, q) => (lerp(v * k, fog[q], fk)) | 0);
      if (!night) { const s1 = P(pts[1][0] + tall * .5, pts[1][1] + tall * .62), s2 = P(pts[2][0] + tall * .5, pts[2][1] + tall * .62), s3 = P(pts[3][0] + tall * .5, pts[3][1] + tall * .62); if (s1 && s2 && s3) { ctx.fillStyle = `rgba(16,22,36,${(.34 * (1 - fk)).toFixed(3)})`; ctx.beginPath(); ctx.moveTo(bt[1][0], bt[1][1]); ctx.lineTo(s1[0], s1[1]); ctx.lineTo(s2[0], s2[1]); ctx.lineTo(s3[0], s3[1]); ctx.lineTo(bt[3][0], bt[3][1]); ctx.lineTo(bt[2][0], bt[2][1]); ctx.closePath(); ctx.fill(); } } // 地面に落ちる長いかげ
      for (let q = 0; q < 4; q++) { const n = (q + 1) % 4, ex = pts[n][0] - pts[q][0], ez = pts[n][1] - pts[q][1], nx = ez, nz = -ex; if (nx * ((pts[q][0] + pts[n][0]) / 2 - cx0) + nz * ((pts[q][1] + pts[n][1]) / 2 - cz0) >= 0) continue;
        const lit = q === 0 || q === 3 ? 1 : .68, x0 = bt[q][0], x1 = bt[n][0]; const fg = ctx.createLinearGradient(0, Math.min(tp[q][1], tp[n][1]), 0, Math.max(bt[q][1], bt[n][1])); fg.addColorStop(0, `rgb(${mixF(base, lit * 1.06)})`); fg.addColorStop(1, `rgb(${mixF(base, lit * .8)})`);
        ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(bt[q][0], bt[q][1]); ctx.lineTo(bt[n][0], bt[n][1]); ctx.lineTo(tp[n][0], tp[n][1]); ctx.lineTo(tp[q][0], tp[q][1]); ctx.closePath(); ctx.fill();
        if (Math.abs(x1 - x0) > 4 && d < 1500) { const rows = Math.min(26, (tall / 4) | 0), cols = Math.max(2, Math.min(9, Math.abs(x1 - x0) / 4 | 0)); // 窓：階ごとの帯と、たての柱
          ctx.strokeStyle = night ? 'rgba(0,0,0,.2)' : `rgba(40,56,76,${(.34 * (1 - fk)).toFixed(3)})`; ctx.lineWidth = Math.max(.5, Math.abs(bt[q][1] - tp[q][1]) / rows * .34); ctx.beginPath(); for (let rr = 1; rr < rows; rr++) { const t = rr / rows; ctx.moveTo(x0, lerp(bt[q][1], tp[q][1], t)); ctx.lineTo(x1, lerp(bt[n][1], tp[n][1], t)); } ctx.stroke();
          ctx.strokeStyle = night ? 'rgba(0,0,0,.25)' : `rgba(236,240,244,${(.3 * (1 - fk)).toFixed(3)})`; ctx.lineWidth = .7; ctx.beginPath(); for (let c3 = 1; c3 < cols; c3++) { const t = c3 / cols; ctx.moveTo(lerp(x0, x1, t), lerp(bt[q][1], bt[n][1], t)); ctx.lineTo(lerp(tp[q][0], tp[n][0], t), lerp(tp[q][1], tp[n][1], t)); } ctx.stroke();
          if (night) { for (let rr = 1; rr < rows; rr++) for (let c3 = 0; c3 < cols; c3++) { const hv = acHash(i * 31 + rr, j * 17 + c3, q); if (hv < .5) continue; const t = (rr + .2) / rows, u = (c3 + .2) / cols, u2 = (c3 + .8) / cols, L0 = [lerp(x0, x1, u), lerp(lerp(bt[q][1], tp[q][1], t), lerp(bt[n][1], tp[n][1], t), u)], L1 = [lerp(x0, x1, u2), lerp(lerp(bt[q][1], tp[q][1], t), lerp(bt[n][1], tp[n][1], t), u2)]; ctx.strokeStyle = hv > .85 ? 'rgba(225,238,255,.9)' : 'rgba(255,214,140,.85)'; ctx.lineWidth = Math.max(.8, Math.abs(bt[q][1] - tp[q][1]) / rows * .45); ctx.beginPath(); ctx.moveTo(L0[0], L0[1]); ctx.lineTo(L1[0], L1[1]); ctx.stroke(); } }
          else if (lit === 1) { const gl = ctx.createLinearGradient(x0, 0, x1, 0); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(.5, `rgba(255,255,255,${(.16 * (1 - fk)).toFixed(3)})`); gl.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.moveTo(bt[q][0], bt[q][1]); ctx.lineTo(bt[n][0], bt[n][1]); ctx.lineTo(tp[n][0], tp[n][1]); ctx.lineTo(tp[q][0], tp[q][1]); ctx.closePath(); ctx.fill(); } } } // ガラスに空がうつる光
      ctx.fillStyle = `rgb(${mixF(base, night ? 1.3 : 1.1)})`; ctx.beginPath(); tp.forEach((q, m) => m ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = night ? 'rgba(120,140,190,.4)' : `rgba(250,250,250,${(.7 * (1 - fk)).toFixed(3)})`; ctx.lineWidth = 1; ctx.stroke(); // 屋上のへり
      { const m = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)], c0 = m(tp[0], tp[2], .3), c1 = m(tp[1], tp[3], .3), c4 = m(tp[0], tp[2], .62), c5 = m(tp[1], tp[3], .62); ctx.fillStyle = `rgb(${mixF(base, night ? .8 : .78)})`; ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.lineTo(c1[0], c1[1]); ctx.lineTo(c4[0], c4[1]); ctx.lineTo(c5[0], c5[1]); ctx.closePath(); ctx.fill(); } // 屋上の機械室
      if (N > .3 && tall > 110 && Math.floor(G.t * 1.2 + h * 9) % 2) { ctx.fillStyle = '#FF4A3D'; ctx.beginPath(); ctx.arc(tp[0][0], tp[0][1], 1.8, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,74,61,.25)'; ctx.beginPath(); ctx.arc(tp[0][0], tp[0][1], 5, 0, 7); ctx.fill(); } } } // 航空障害灯
  // ---- 6) 空気の遠近：遠くほど青白くかすむ。地平線のすぐ下に、うすいもやの帯 ----
  { const hg = ctx.createLinearGradient(0, yb, 0, yb + (H - yb) * .55), f = fog.map(v => v | 0).join(); hg.addColorStop(0, `rgba(${f},${night ? .85 : .93})`); hg.addColorStop(.12, `rgba(${f},${night ? .5 : .62})`); hg.addColorStop(.4, `rgba(${f},.2)`); hg.addColorStop(1, `rgba(${f},0)`); ctx.fillStyle = hg; ctx.fillRect(0, yb, W, (H - yb) * .55);
    if (!night && !lowq) { ctx.fillStyle = 'rgba(255,255,255,.1)'; for (let k = 0; k < 3; k++) { const y = yb + 6 + k * 9 + Math.sin(G.t * .2 + k) * 2; ctx.beginPath(); ctx.ellipse(W * (.2 + k * .3) + Math.sin(G.t * .05 + k * 2) * 40, y, W * .5, 5 + k * 2, 0, 0, 7); ctx.fill(); } } }
  ctx.restore();
}
