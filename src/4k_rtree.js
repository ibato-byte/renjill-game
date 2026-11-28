/* ================= 2026-11-28 景色 1000：本物の木の種類で描き分ける =================
   オーナー「現実に近い作り込まれたクオリティに。ステージに関わる現実の情報を調べてから景色をブラッシュアップ」。docs/SCENERY-1000-2026-11-28.md
   前は、どの通りの木も同じ丸い緑のかたまり（green）だった。本物の並木の木（銀座のカツラ・日比谷のイチョウとプラタナス・明治神宮のクスノキの森など）を、葉の大きさ・木の形・色・季節の色で描き分ける */
function rxCrown(o) {
  const c = mk(256), g = c.getContext('2d') || noCtx(), r = rnd(o.seed || 7), cols = o.cols;
  const dark = hexRgb(cols[1]).map(x => x * .6), mid = hexRgb(cols[0]), lt = hexRgb(cols[2]).map(x => Math.min(255, x * 1.1));
  const cx = o.cx || 128, cy = o.cy || 122, rx = o.rx || 92, ry = o.ry || 86, n = o.n || 22, L0 = o.leaf ? o.leaf[0] : 4, L1 = o.leaf ? o.leaf[1] : 7;
  const dot = (x, y, R, col) => { g.fillStyle = col; g.beginPath(); if (o.oval) g.ellipse(x, y, R, R * o.oval, o.tilt || 0, 0, 7); else g.arc(x, y, R, 0, 7); g.fill(); };
  const clumps = []; for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()); let y = cy + Math.sin(a) * d * ry; if (o.flatTop) y = Math.max(y, cy - ry * .78); clumps.push([cx + Math.cos(a) * d * rx, y, (o.clump || 24) * (.7 + r() * .6)]); }
  clumps.sort((a, b) => a[1] - b[1]);
  for (const [x, y, R] of clumps) for (let i = 0; i < 14; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R; dot(x + Math.cos(a) * d, y + R * .25 + Math.sin(a) * d * .7, L0 + r() * (L1 - L0) * 1.2, rgbS(dark)); }
  for (const [x, y, R] of clumps) for (let i = 0; i < 17; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R * .9; dot(x + Math.cos(a) * d, y + Math.sin(a) * d * .65, L0 * .9 + r() * (L1 - L0), rgbS(mixRGB(dark, mid, .45 + r() * .55))); }
  for (const [x, y, R] of clumps) for (let i = 0; i < (o.hi || 10); i++) { const a = -Math.PI * (.12 + r() * .76), d = Math.sqrt(r()) * R * .8; dot(x - R * .14 + Math.cos(a) * d, y - R * .22 + Math.sin(a) * d * .5, L0 * .7 + r() * (L1 - L0) * .7, rgbS(mixRGB(mid, lt, .35 + r() * .65))); }
  if (o.extra) o.extra(g, r, clumps);
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < (o.gaps == null ? 10 : o.gaps); i++) dot(cx - rx + r() * rx * 2, cy - ry * .7 + r() * ry * 1.3, 2 + r() * 4, '#000');
  g.globalCompositeOperation = 'source-atop'; const sh = g.createLinearGradient(0, cy - ry * .4, 0, cy + ry); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(10,25,10,.34)'); g.fillStyle = sh; g.fillRect(0, 0, 256, 256);
  if (o.rim !== 0) { const rm = g.createRadialGradient(cx - rx * .35, cy - ry * .55, 4, cx - rx * .35, cy - ry * .55, rx * 1.2); rm.addColorStop(0, 'rgba(255,250,220,.16)'); rm.addColorStop(1, 'rgba(255,250,220,0)'); g.fillStyle = rm; g.fillRect(0, 0, 256, 256); } /* 上から当たる日の光（左上が明るい） */
  g.globalCompositeOperation = 'source-over';
  return c;
}
/* しだれる木（ヤナギ・しだれ桜）：上の枝から、細い枝が地面近くまでたれる。葉（花）は枝にそって細かく */
function rxWeep(seed, stem, leaf, o) {
  const c = mk(256), g = c.getContext('2d') || noCtx(), r = rnd(seed); o = o || {};
  g.strokeStyle = stem; g.lineCap = 'round';
  for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * .32; g.lineWidth = 3 - Math.abs(k - 3) * .3; g.beginPath(); g.moveTo(128, 120); g.quadraticCurveTo(128 + Math.cos(a) * 50, 120 + Math.sin(a) * 70, 128 + Math.cos(a) * 92, 46 + Math.abs(k - 3) * 14); g.stroke(); } /* 幹から上へ広がる太い枝 */
  const N = o.n || 150;
  for (let i = 0; i < N; i++) { const t = r(), x0 = 128 + (t - .5) * 200 * (o.spread || 1), y0 = 38 + Math.abs(t - .5) * 60 + r() * 26, len = (o.len || 150) * (.55 + r() * .5), sway = (r() - .5) * 18 + (x0 - 128) * .12, y1 = Math.min(252, y0 + len);
    g.strokeStyle = stem; g.globalAlpha = .55; g.lineWidth = .8; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + sway * .3, (y0 + y1) / 2, x0 + sway, y1); g.stroke(); g.globalAlpha = 1;
    const step = o.step || 4; for (let y = y0 + 2; y < y1; y += step + r() * 2) { const u = (y - y0) / (y1 - y0), x = x0 + sway * u * u, col = leaf[(r() * leaf.length) | 0];
      if (o.blossom && r() < o.blossom) { g.fillStyle = col; g.beginPath(); g.arc(x + (r() - .5) * 3, y, 1.6 + r() * 1.4, 0, 7); g.fill(); }
      else if (!o.blossom || o.leafToo) { g.fillStyle = col; g.beginPath(); g.ellipse(x + (r() - .5) * 2, y, 1.1, 2.6 + r() * 1.6, (r() - .5) * .5, 0, 7); g.fill(); } } }
  const sh = g.createLinearGradient(0, 40, 0, 256); sh.addColorStop(0, 'rgba(255,255,230,.1)'); sh.addColorStop(1, 'rgba(10,25,10,.25)'); g.globalCompositeOperation = 'source-atop'; g.fillStyle = sh; g.fillRect(0, 0, 256, 256); g.globalCompositeOperation = 'source-over';
  return c;
}
/* 庭の松（雲のように刈り込んだ黒松）：横に広がる葉のかたまりを何段か。その間に、くねった枝 */
function rxNiwaki(seed, cols) {
  const c = mk(256), g = c.getContext('2d') || noCtx(), r = rnd(seed), pads = [];
  for (let k = 0; k < 6; k++) { const y = 70 + k * 30 + (r() - .5) * 10, side = k % 2 ? 1 : -1, x = 128 + side * (12 + r() * 50) * (k ? 1 : .2), w = 86 - k * 4 + r() * 20; pads.push([x, y, w, 15 + r() * 6]); }
  pads.push([128, 46, 60, 18]);
  g.strokeStyle = '#4E3A2C'; g.lineCap = 'round'; for (const [x, y] of pads) { g.lineWidth = 5; g.beginPath(); g.moveTo(128 + (r() - .5) * 8, 250); g.bezierCurveTo(128 + (x - 128) * .2, 200, x - (x - 128) * .4, y + 40, x, y + 6); g.stroke(); } /* くねった枝 */
  for (const [x, y, w, h] of pads) { const gr = g.createLinearGradient(0, y - h, 0, y + h); gr.addColorStop(0, cols[2]); gr.addColorStop(.45, cols[0]); gr.addColorStop(1, cols[1]); g.fillStyle = gr;
    g.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; g.ellipse(x + Math.cos(a) * w * .38, y + Math.sin(a) * h * .3, w * .3, h * .62, 0, 0, 7); } g.fill(); /* 葉のかたまり：上が明るく、下がかげ */
    g.strokeStyle = 'rgba(20,40,25,.45)'; g.lineWidth = 1; for (let i = 0; i < 40; i++) { const px = x + (r() - .5) * w * 1.2, py = y + (r() - .3) * h; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (r() - .5) * 5, py - 4); g.stroke(); } /* 松葉のすじ */
    g.fillStyle = 'rgba(255,255,230,.18)'; g.beginPath(); g.ellipse(x - w * .15, y - h * .45, w * .32, h * .25, 0, 0, 7); g.fill(); }
  return c;
}
const RX_TREE = {
  katsura: () => rxCrown({ seed: 41, cols: ['#8EBF5C', '#6A9E46', '#BFDE82'], rx: 66, ry: 112, cy: 128, n: 24, leaf: [3, 5], clump: 20, hi: 14 }), /* [T1] カツラ：たて長の卵形・小さな丸い葉・明るい若草色（銀座通り・丸の内仲通りの街路樹） */
  katsuraA: () => rxCrown({ seed: 42, cols: ['#E6B53E', '#C98A2C', '#F6D875'], rx: 66, ry: 112, cy: 128, n: 24, leaf: [3, 5], clump: 20, hi: 14, extra: (g, r) => { for (let i = 0; i < 70; i++) { g.fillStyle = r() < .5 ? '#E9934A' : '#F1C14E'; g.beginPath(); g.arc(70 + r() * 116, 30 + r() * 190, 2.5, 0, 7); g.fill(); } } }), /* [T2] カツラの秋：黄色にあんず色がまじる */
  platanus: () => rxCrown({ seed: 43, cols: ['#7DAA55', '#5B8A42', '#AFD07C'], rx: 112, ry: 88, cy: 130, n: 20, leaf: [6, 10], clump: 28, hi: 9, oval: .8 }), /* [T3] プラタナス：横に広い大きな木・手のひらのような大きな葉 */
  platanusA: () => rxCrown({ seed: 44, cols: ['#C8A048', '#9C7A36', '#E3C672'], rx: 112, ry: 88, cy: 130, n: 20, leaf: [6, 10], clump: 28, hi: 9, oval: .8, gaps: 16 }), /* [T4] プラタナスの秋：黄色と茶色 */
  yurinoki: () => rxCrown({ seed: 45, cols: ['#6E9E4E', '#527E3C', '#9CC56F'], rx: 80, ry: 118, cy: 126, n: 24, leaf: [5, 8], clump: 22 }), /* [T5] ユリノキ：背の高い卵形 */
  yurinokiA: () => rxCrown({ seed: 46, cols: ['#F0C83A', '#D19E26', '#FBE47E'], rx: 80, ry: 118, cy: 126, n: 24, leaf: [5, 8], clump: 22, gaps: 14 }), /* [T6] ユリノキの秋：明るい黄色 */
  mizuki: () => rxCrown({ seed: 47, cols: ['#7AA650', '#5A8640', '#A6CB78'], rx: 90, ry: 70, cy: 150, n: 18, leaf: [4, 7], clump: 22 }), /* [T7] ハナミズキ：小さな丸い木 */
  mizukiF: () => rxCrown({ seed: 48, cols: ['#86B05A', '#5E8A44', '#B3D488'], rx: 90, ry: 70, cy: 150, n: 18, leaf: [4, 6], clump: 22, extra: (g, r, cl) => { for (let i = 0; i < 150; i++) { const [x, y, R] = cl[(r() * cl.length) | 0], a = r() * 7, d = r() * R, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * .7, col = r() < .65 ? '#FBF6F0' : '#F2B8C8'; g.fillStyle = col; for (let p = 0; p < 4; p++) { g.beginPath(); g.ellipse(px + Math.cos(p * 1.57) * 2.2, py + Math.sin(p * 1.57) * 2.2, 2.2, 1.4, p * 1.57, 0, 7); g.fill(); } g.fillStyle = '#9DBB5A'; g.fillRect(px - .6, py - .6, 1.2, 1.2); } } }), /* [T8] ハナミズキの春：白とうす紅の 4 枚の花びら */
  mizukiA: () => rxCrown({ seed: 49, cols: ['#C2482F', '#8E3426', '#E07448'], rx: 90, ry: 70, cy: 150, n: 18, leaf: [4, 7], clump: 22, gaps: 14 }), /* [T9] ハナミズキの秋：赤い葉 */
  kusu: () => rxCrown({ seed: 50, cols: ['#73A043', '#567C31', '#B5D066'], rx: 118, ry: 96, cy: 136, n: 26, leaf: [4, 7], clump: 28, hi: 14, gaps: 4 }), /* [T10] クスノキ：大きなドーム形・つやのある黄緑の葉（日比谷・明治神宮・神社の大木） */
  mori: () => rxCrown({ seed: 51, cols: ['#3F6C3A', '#2B5030', '#628E52'], rx: 120, ry: 104, cy: 128, n: 30, leaf: [5, 8], clump: 30, hi: 8, gaps: 3 }), /* [T11] 常緑の森（シイ・カシ）：濃い緑で、すき間が少ない */
  kaede: () => rxCrown({ seed: 52, cols: ['#7CAA50', '#5A883E', '#A8CF74'], rx: 108, ry: 74, cy: 140, n: 26, leaf: [3, 5], clump: 20, hi: 12, flatTop: 1 }), /* [T12] モミジ：細かい葉が横に重なる、平たい形 */
  kaedeA: () => rxCrown({ seed: 53, cols: ['#D84A2E', '#A2301E', '#F28A3C'], rx: 108, ry: 74, cy: 140, n: 26, leaf: [3, 5], clump: 20, hi: 12, flatTop: 1, extra: (g, r) => { for (let i = 0; i < 90; i++) { g.fillStyle = ['#F5B13A', '#E8622E', '#C8281E'][(r() * 3) | 0]; g.beginPath(); g.arc(40 + r() * 176, 70 + r() * 140, 2.6, 0, 7); g.fill(); } } }), /* [T13] モミジの秋：赤・だいだい・黄のまじり */
  yanagi: () => rxWeep(61, '#7A6A3C', ['#A8C85A', '#8DB34A', '#C2DB78', '#7FA445']), /* [T14] シダレヤナギ：細い枝が地面近くまでたれる（昔の銀座・川べりの柳） */
  yanagiW: () => rxWeep(62, '#9A8456', ['#C9B370', '#B8A060'], { n: 110, step: 9 }), /* [T15] 冬の柳：葉の少ない金色の枝 */
  shidare: () => rxWeep(63, '#5A4436', ['#F7C9D6', '#F2B3C6', '#FBE1E8', '#EFA2B8'], { blossom: .95, n: 170, step: 3 }), /* [T16] しだれ桜：うす紅の花が枝ごとたれる */
  shidareG: () => rxWeep(64, '#5A4436', ['#7FA650', '#6A9244', '#94BC64'], { n: 140 }), /* [T17] しだれ桜の夏：緑の葉 */
  matsuN: () => rxNiwaki(65, ['#3B6A46', '#203E2A', '#6E9A62']), /* [T18] 庭の黒松：雲のように段に刈り込んだ形（浜離宮・清澄・皇居外苑など大名庭園の松） */
  keyakiA: () => rxCrown({ seed: 66, cols: ['#C98A3E', '#9A6430', '#E2B062'], rx: 112, ry: 98, cy: 124, n: 26, leaf: [4, 6], clump: 24, gaps: 18, extra: (g, r) => { for (let i = 0; i < 60; i++) { g.fillStyle = r() < .5 ? '#B5522E' : '#D9A04A'; g.beginPath(); g.arc(30 + r() * 196, 40 + r() * 170, 2.2, 0, 7); g.fill(); } } }), /* [T19] ケヤキの秋：茶色がかった黄色と赤（表参道・仲通り） */
};
const RX_SNOW = ['katsura', 'platanus', 'yurinoki', 'mizuki', 'kusu', 'mori', 'kaede', 'yanagiW', 'matsuN']; /* [T20] 雪の日：常緑の木と冬の枝に雪をのせる */
function rxTreesReg() { for (const k in RX_TREE) { const key = 'canopy_' + k; if (!SPR[key] && !SPR_PEND[key]) SPR_PEND[key] = RX_TREE[k]; }
  for (const k of RX_SNOW) { const key = 'canopy_' + k; if (!SPR_PEND[key + 'S']) SPR_PEND[key + 'S'] = () => { const b = SPR[key] || sprPaint(key); return b ? snowCap(b, k === 'yanagiW' ? 3 : 7) : null; }; } }
{ const bw0 = buildWorldSprites; buildWorldSprites = function () { bw0(); rxTreesReg(); }; }
