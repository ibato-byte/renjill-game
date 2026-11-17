/* ================= 障害物の絵の作り込み（2026-11-17） =================
   オーナー：「ゲームの中で出てくるアイテムや障害物を 1 つ 1 つ、現実の物を調べて、リアルで質の高い絵に。最低 200、様々な角度で」。
   いちばん簡単な絵だった物（ロボットそうじ機・スリッパ・段・柱・駅の柱・かばん・ロープ・ピクニック・浮き輪・落ち葉・雪玉・座ぶとん・のれん…）は描き直し、
   ほかの物には、本物にある部品・質感・光とかげを上から描き足す（元の絵の関数はそのまま。ここで ART の絵を差しかえる）。
   番号つきの一覧は docs/ITEMS-2026-11-17.md（ここのコメントの [番号] と同じ） */
// 上から描き足すための小さな道具
const AP = {
  gloss(g, x, y, rx, ry, a, rot) { const gr = g.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry)); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry)); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, Math.max(rx, ry), 0, 7); g.fill(); g.restore(); },
  ao(g, W, H, k, w) { const gr = g.createRadialGradient(W / 2, H - 4, 2, W / 2, H - 4, W * (w || .5)); gr.addColorStop(0, `rgba(0,0,0,${k})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.save(); g.translate(0, H - 4); g.scale(1, .14); g.translate(0, -(H - 4)); g.fillStyle = gr; g.beginPath(); g.arc(W / 2, H - 4, W * (w || .5), 0, 7); g.fill(); g.restore(); },
  stitch(g, pts, c, w) { g.save(); g.strokeStyle = c; g.lineWidth = w || 1.2; g.setLineDash([3, 2.5]); g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.restore(); },
  grain(g, x, y, w, h, c, n, seed, vert) { const r = rnd(seed); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.strokeStyle = c; g.lineWidth = 1; for (let i = 0; i < n; i++) { const t = r(); g.beginPath(); if (vert) { const xx = x + t * w; g.moveTo(xx, y); g.bezierCurveTo(xx + (r() - .5) * 6, y + h * .3, xx + (r() - .5) * 6, y + h * .7, xx + (r() - .5) * 4, y + h); } else { const yy = y + t * h; g.moveTo(x, yy); g.bezierCurveTo(x + w * .3, yy + (r() - .5) * 5, x + w * .7, yy + (r() - .5) * 5, x + w, yy + (r() - .5) * 3); } g.stroke(); } g.restore(); },
  knot(g, x, y, r, c) { g.save(); g.strokeStyle = c; g.lineWidth = 1; for (let k = 1; k <= 3; k++) { g.beginPath(); g.ellipse(x, y, r * k * .5, r * k * .28, 0, 0, 7); g.stroke(); } g.restore(); },
};
const ART_PLUS = {}; // 名前 → 元の絵のあとに描き足す関数
function plusArt(name, w, h, base, plus) { ART[name] = (o, night) => artCanvas(name + '|p2|' + (o && o.av ? JSON.stringify(o.av) : ''), w, h, (g, W, H) => { base(g, W, H, o, night); plus(g, W, H, o, night); }); }

/* ---- ロボットそうじ機（うしろから） [1〜12] ---- */
function paintRoomba2(g, W, H) {
  AP.ao(g, W, H, .55, .52); // [1] 床との間の濃いかげ
  const cx = W / 2, cy = H * .56, rx = W * .47, ry = H * .38;
  g.fillStyle = '#16171B'; g.beginPath(); g.ellipse(cx, cy + H * .1, rx, ry * .55, 0, 0, 7); g.fill(); // [2] 側面（低い円柱の厚み）
  const side = g.createLinearGradient(cx - rx, 0, cx + rx, 0); side.addColorStop(0, '#1C1D22'); side.addColorStop(.3, '#4C4E57'); side.addColorStop(.55, '#2A2C33'); side.addColorStop(1, '#141519'); g.fillStyle = side; g.fillRect(cx - rx, cy, rx * 2, H * .1); // [3] 側面の金属っぽい光
  g.fillStyle = vgrad(g, cy - ry, cy + ry * .2, [[0, '#5A5D66'], [.5, '#33353D'], [1, '#202228']]); g.beginPath(); g.ellipse(cx, cy, rx, ry * .55, 0, 0, 7); g.fill(); // [4] 上の面（ゆるい傾き）
  g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(cx, cy, rx * .82, ry * .45, 0, 0, 7); g.stroke(); // [5] 上ぶたのつなぎ目
  g.fillStyle = '#26282E'; g.beginPath(); g.ellipse(cx, cy - ry * .14, rx * .2, ry * .2, 0, 0, 7); g.fill(); g.fillStyle = vgrad(g, cy - ry * .32, cy - ry * .02, [[0, '#5E616A'], [1, '#2A2C32']]); g.beginPath(); g.ellipse(cx, cy - ry * .2, rx * .18, ry * .17, 0, 0, 7); g.fill(); // [6] まん中の丸いセンサーの塔
  g.fillStyle = 'rgba(160,220,255,.5)'; g.fillRect(cx - rx * .12, cy - ry * .22, rx * .24, ry * .05); // [7] センサーの窓
  g.strokeStyle = 'rgba(120,230,140,.9)'; g.lineWidth = 2; g.shadowColor = 'rgba(120,230,140,.9)'; g.shadowBlur = 4; g.beginPath(); g.ellipse(cx, cy + ry * .12, rx * .1, ry * .07, 0, 0, 7); g.stroke(); g.shadowBlur = 0; // [8] ボタンのまわりの緑の光の輪
  g.fillStyle = '#3A3C44'; g.beginPath(); g.ellipse(cx, cy + ry * .12, rx * .07, ry * .05, 0, 0, 7); g.fill();
  g.fillStyle = '#0E0F12'; rrect(g, cx - rx * .3, cy + ry * .28, rx * .6, ry * .1, 3); g.fill(); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(cx - rx * .28, cy + ry * .29, rx * .56, 1.5); // [9] うしろのごみ箱の取り出し口
  for (const sd of [-1, 1]) { g.fillStyle = '#B9BEC4'; rrect(g, cx + sd * rx * .5 - 4, cy + H * .08, 8, 3, 1); g.fill(); } // [10] 充電の金属の接点
  g.strokeStyle = 'rgba(40,40,44,.9)'; g.lineWidth = 1.2; for (let k = 0; k < 6; k++) { const a = -2.4 + k * .16; g.beginPath(); g.moveTo(cx - rx * .86, cy + H * .14); g.lineTo(cx - rx * .86 + Math.cos(a) * W * .1, cy + H * .14 + Math.sin(a) * H * .12 + H * .1); g.stroke(); } // [11] 横からのぞく回るブラシの毛
  AP.gloss(g, cx - rx * .4, cy - ry * .25, rx * .3, ry * .1, .28, -.08); // [12] 上の面のつや
}
/* ---- スリッパ（うしろから。くつと分ける） [13〜20] ---- */
function paintSlipper2(g, W, H) {
  AP.ao(g, W, H, .35, .5); const c = '#4E77A0';
  for (const [x, tilt] of [[.03, -.05], [.52, .06]]) { const x0 = W * x, w = W * .45, cx = x0 + w / 2; g.save(); g.translate(cx, H * .8); g.rotate(tilt); g.translate(-cx, -H * .8);
    g.fillStyle = vgrad(g, H * .7, H, [[0, '#E9E4DA'], [1, '#A8A296']]); rrect(g, x0, H * .7, w, H * .26, 10); g.fill(); // [13] 厚いスポンジの底（かかとは平ら）
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x0 + 4, H * .9, w - 8, 2); // [14] 底のぬい合わせのかげ
    g.fillStyle = vgrad(g, H * .62, H * .74, [[0, shadeHex(c, .75)], [1, shadeHex(c, .95)]]); g.beginPath(); g.ellipse(cx, H * .72, w * .44, H * .1, 0, Math.PI, 0); g.fill(); // [15] 中じき（足の乗る面。かかと側は開いている）
    g.fillStyle = vgrad(g, H * .12, H * .72, [[0, shadeHex(c, 1.2)], [1, shadeHex(c, .8)]]); g.beginPath(); g.moveTo(x0 + w * .06, H * .7); g.bezierCurveTo(x0 + w * .04, H * .25, x0 + w * .96, H * .25, x0 + w * .94, H * .7); g.quadraticCurveTo(cx, H * .5, x0 + w * .06, H * .7); g.fill(); // [16] 足の甲をおおう前の布（向こう側）
    const r = rnd(x * 100 + 3); g.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 40; i++) g.fillRect(x0 + w * (.12 + r() * .76), H * (.3 + r() * .32), 1.4, 1.4); // [17] パイル地の毛羽
    g.strokeStyle = shadeHex(c, 1.35); g.lineWidth = 2.4; g.beginPath(); g.moveTo(x0 + w * .07, H * .69); g.bezierCurveTo(x0 + w * .05, H * .26, x0 + w * .95, H * .26, x0 + w * .93, H * .69); g.stroke(); // [18] ふちのパイピング
    AP.stitch(g, [[x0 + 6, H * .78], [x0 + w - 6, H * .78]], 'rgba(120,110,95,.6)'); // [19] 底のまわりのぬい目
    AP.gloss(g, x0 + w * .32, H * .38, w * .12, H * .08, .25); g.restore(); } // [20] 布のふくらみの光
}
/* ---- くつ（描き足し） [21〜26] ---- */
function shoesPlus(g, W, H) {
  for (const x of [.02, .52]) { const x0 = W * x, w = W * .46, cx = x0 + w / 2;
    g.fillStyle = '#2B2B2B'; rrect(g, cx - w * .05, H * .06, w * .1, H * .14, [4, 4, 1, 1]); g.fill(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1; g.strokeRect(cx - w * .03, H * .09, w * .06, H * .06); // [21] かかとのつまみの輪
    g.strokeStyle = 'rgba(60,55,50,.55)'; g.lineWidth = 1.2; for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(x0 + w * (.06 + k * .15), H * .86); g.lineTo(x0 + w * (.04 + k * .15), H * .96); g.stroke(); } // [22] 底のかかとのみぞ
    g.fillStyle = 'rgba(230,240,250,.8)'; rrect(g, cx - w * .22, H * .55, w * .44, H * .04, 2); g.fill(); // [23] 反射材の細い帯
    g.fillStyle = '#F3F1EC'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(cx + sd * w * .3, H * .27, 2.2, 3.5, sd * .4, 0, 7); g.fill(); } // [24] はき口からのぞくひもの先
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0 + w * .12, H * .58); g.quadraticCurveTo(cx, H * .66, x0 + w * .88, H * .58); g.stroke(); // [25] かかとの補強の切りかえ
    g.fillStyle = 'rgba(80,60,40,.18)'; g.beginPath(); g.ellipse(x0 + w * .7, H * .9, w * .14, H * .03, 0, 0, 7); g.fill(); } // [26] 底のふちの土のよごれ
}
/* ---- 上がりかまち（玄関の段） [27〜33] ---- */
function paintStep2(g, W, H) {
  g.fillStyle = vgrad(g, H * .26, H, [[0, '#7A5634'], [1, '#4A321E']]); g.fillRect(0, H * .26, W, H * .74); // [27] 段の正面（けこみ）は暗い
  AP.grain(g, 0, H * .3, W, H * .66, 'rgba(30,18,8,.25)', 26, 7); // [28] 正面の木目
  g.fillStyle = vgrad(g, 0, H * .3, [[0, '#E3BE86'], [.5, '#C99D63'], [1, '#9C7448']]); g.fillRect(0, H * .06, W, H * .24); // [29] 上の板（かまち）
  AP.grain(g, 0, H * .06, W, H * .24, 'rgba(90,55,25,.3)', 14, 9);
  for (const x of [.12, .63]) AP.knot(g, W * x, H * .17, 8, 'rgba(90,55,25,.4)'); // [30] 節
  g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(0, H * .06, W, 2.5); g.fillStyle = 'rgba(255,240,215,.22)'; g.fillRect(0, H * .265, W, 3); // [31] 角の丸みの光（上と手前のふち）
  AP.gloss(g, W * .5, H * .16, W * .2, H * .06, .3); // [32] まん中が人の足でみがかれてつやつや
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, H * .3, W, H * .05); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, H * .94, W, H * .06); // [33] 板の下のかげと、床とのすき間
}
/* ---- 木の柱 [34〜40] ---- */
function paintPillar2(g, W, H) {
  const gr = g.createLinearGradient(W * .12, 0, W * .88, 0); gr.addColorStop(0, '#4A3220'); gr.addColorStop(.12, '#7A5838'); gr.addColorStop(.42, '#A88058'); gr.addColorStop(.6, '#8A6442'); gr.addColorStop(1, '#3E2A1A'); g.fillStyle = gr; g.fillRect(W * .12, 0, W * .76, H); // [34] 角柱の 2 面（左は光、右はかげ）
  g.fillStyle = 'rgba(255,240,215,.35)'; g.fillRect(W * .44, 0, 2, H * .92); // [35] 面取りした角の細い光
  AP.grain(g, W * .12, 0, W * .76, H * .92, 'rgba(40,24,10,.28)', 18, 21, 1); // [36] たての木目
  AP.knot(g, W * .3, H * .66, 7, 'rgba(40,24,10,.45)'); // [37] 節
  g.fillStyle = vgrad(g, H * .9, H, [[0, '#5A5E64'], [1, '#2A2C30']]); g.fillRect(W * .08, H * .9, W * .84, H * .1); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(W * .08, H * .9, W * .84, 2); // [38] 足もとの金物（根巻き）
  g.fillStyle = '#F2E6D8'; rrect(g, W * .25, H * .3, W * .5, H * .2, 3); g.fill(); g.strokeStyle = '#8A5A36'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#2B2B2B'; g.font = `900 ${Math.round(W * .2)}px "Zen Maru Gothic",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('禁', W / 2, H * .36); g.fillText('煙', W / 2, H * .45);
  g.fillStyle = '#9AA0A6'; for (const y of [.315, .485]) { g.beginPath(); g.arc(W * .3, H * y, 2, 0, 7); g.fill(); g.beginPath(); g.arc(W * .7, H * y, 2, 0, 7); g.fill(); } // [39] 札の留めねじ
  g.fillStyle = 'rgba(30,20,10,.25)'; for (const [x, y] of [[.3, .8], [.62, .84], [.5, .77]]) { g.beginPath(); g.ellipse(W * x, H * y, 6, 2, .3, 0, 7); g.fill(); } // [40] けとばしたすりきず
}
/* ---- 駅のほそい柱 [41〜45] ---- */
function paintStationPole2(g, W, H) {
  const gr = g.createLinearGradient(W * .3, 0, W * .7, 0); gr.addColorStop(0, '#5E7A94'); gr.addColorStop(.35, '#D9E6F0'); gr.addColorStop(.5, '#A9BED0'); gr.addColorStop(1, '#4E6A84'); g.fillStyle = gr; g.fillRect(W * .3, 0, W * .4, H); // [41] 丸い鉄の柱のつや
  g.fillStyle = 'rgba(0,0,0,.25)'; for (const y of [.15, .78]) g.fillRect(W * .29, H * y, W * .42, 3); // [42] 継ぎ目の帯
  g.fillStyle = '#F2C230'; g.fillRect(W * .24, H * .46, W * .52, H * .12); g.strokeStyle = '#2B2B2B'; g.lineWidth = 1.5; g.strokeRect(W * .24, H * .46, W * .52, H * .12); g.fillStyle = '#2B2B2B'; g.font = `900 ${Math.round(W * .24)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('3', W / 2, H * .52); // [43] 番号の札（ふちどり）
  g.save(); g.beginPath(); g.rect(W * .3, H * .86, W * .4, H * .09); g.clip(); g.fillStyle = '#F2C230'; g.fillRect(0, H * .86, W, H * .09); g.fillStyle = '#2B2B2B'; for (let k = -2; k < 6; k++) { g.beginPath(); g.moveTo(W * .3 + k * 8, H * .95); g.lineTo(W * .3 + k * 8 + 4, H * .95); g.lineTo(W * .3 + k * 8 + 12, H * .86); g.lineTo(W * .3 + k * 8 + 8, H * .86); g.fill(); } g.restore(); // [44] 足もとの黄と黒の注意のしま
  g.fillStyle = '#2B2B2B'; g.fillRect(W * .22, H * .95, W * .56, H * .05); AP.ao(g, W, H, .35, .5); // [45] 床への固定の台とかげ
}
/* ---- かばん [46〜53] ---- */
function paintBag2(g, W, H) {
  AP.ao(g, W, H, .4, .5); const c = '#8C5A3C';
  g.fillStyle = shadeHex(c, .62); g.beginPath(); g.moveTo(W * .1, H * .4); g.lineTo(W * .04, H * .9); g.lineTo(W * .12, H * .94); g.closePath(); g.fill(); // [46] 横のまち（厚み）
  g.fillStyle = vgrad(g, H * .3, H, [[0, shadeHex(c, 1.15)], [.6, c], [1, shadeHex(c, .72)]]); rrect(g, W * .1, H * .34, W * .82, H * .6, [14, 14, 10, 10]); g.fill();
  const r = rnd(5); g.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 120; i++) { g.beginPath(); g.arc(W * (.12 + r() * .78), H * (.36 + r() * .56), .9, 0, 7); g.fill(); } // [47] 革のしぼ（細かいつぶ）
  AP.stitch(g, [[W * .14, H * .4], [W * .14, H * .88], [W * .88, H * .88], [W * .88, H * .4]], 'rgba(240,220,190,.7)'); // [48] ふちのぬい目
  g.fillStyle = shadeHex(c, .85); rrect(g, W * .1, H * .34, W * .82, H * .2, [14, 14, 4, 4]); g.fill(); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(W * .1, H * .54, W * .82, 2); // [49] かぶせ（ふた）
  { const gg = g.createLinearGradient(W * .44, 0, W * .56, 0); gg.addColorStop(0, '#9C7418'); gg.addColorStop(.5, '#FFE7A0'); gg.addColorStop(1, '#9C7418'); g.fillStyle = gg; rrect(g, W * .44, H * .5, W * .12, H * .1, 2); g.fill(); } // [50] 金具（金のつや）
  g.strokeStyle = shadeHex(c, .7); g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(W * .3, H * .36); g.quadraticCurveTo(W / 2, -H * .06, W * .7, H * .36); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(W * .32, H * .33); g.quadraticCurveTo(W / 2, -H * .03, W * .68, H * .33); g.stroke(); // [51] 持ち手の丸みとつや
  g.fillStyle = '#C9A030'; for (const x of [.3, .7]) { g.beginPath(); g.arc(W * x, H * .37, 3.5, 0, 7); g.fill(); } // [52] 持ち手の付け根の金の輪
  g.fillStyle = '#5A4632'; for (const x of [.2, .8]) { g.beginPath(); g.ellipse(W * x, H * .95, 4, 2, 0, 0, 7); g.fill(); } AP.gloss(g, W * .3, H * .66, W * .12, H * .1, .22); // [53] 底びょうと、革のつや
}
/* ---- ロープの仕切り（ホテル・展望台） [54〜61] ---- */
function paintRope2(g, W, H) {
  const px = [W * .06, W * .5, W * .94];
  for (const x of px) { g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x, H * .98, 18, 4, 0, 0, 7); g.fill();
    const bg = g.createLinearGradient(x - 16, 0, x + 16, 0); bg.addColorStop(0, '#7A5A12'); bg.addColorStop(.4, '#F6DC86'); bg.addColorStop(1, '#6A4C0E'); g.fillStyle = bg; g.beginPath(); g.ellipse(x, H * .95, 16, 5, 0, 0, 7); g.fill(); g.fillRect(x - 16, H * .9, 32, H * .05); g.beginPath(); g.ellipse(x, H * .9, 16, 5, 0, 0, 7); g.fill(); // [54] 重い丸い台
    const pg = g.createLinearGradient(x - 5, 0, x + 5, 0); pg.addColorStop(0, '#7A5A12'); pg.addColorStop(.35, '#FFF0B8'); pg.addColorStop(.6, '#C9A030'); pg.addColorStop(1, '#5E440C'); g.fillStyle = pg; g.fillRect(x - 4.5, H * .16, 9, H * .74); // [55] 真ちゅうの柱のつや
    for (const y of [.36, .7]) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x - 5, H * y, 10, 2); } // [56] 柱のくびれの線
    const fg = g.createRadialGradient(x - 2, H * .1, 1, x, H * .12, 8); fg.addColorStop(0, '#FFF6D0'); fg.addColorStop(.5, '#D9B040'); fg.addColorStop(1, '#6A4C0E'); g.fillStyle = fg; g.beginPath(); g.arc(x, H * .12, 8, 0, 7); g.fill(); } // [57] 上の玉のつや
  for (let i = 0; i < 2; i++) { const a = px[i] + 6, b = px[i + 1] - 6, mid = (a + b) / 2;
    g.strokeStyle = '#7E1018'; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(a, H * .2); g.quadraticCurveTo(mid, H * .64, b, H * .2); g.stroke(); // [58] ロープの下側のかげ
    g.strokeStyle = '#C42634'; g.lineWidth = 8; g.beginPath(); g.moveTo(a, H * .19); g.quadraticCurveTo(mid, H * .6, b, H * .19); g.stroke();
    g.strokeStyle = 'rgba(255,190,200,.35)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(a, H * .16); g.quadraticCurveTo(mid, H * .56, b, H * .16); g.stroke(); // [59] ビロードの毛並みの光
    for (const x of [a, b]) { g.fillStyle = '#C9A030'; rrect(g, x - 5, H * .15, 10, 9, 2); g.fill(); g.fillStyle = '#FFE7A0'; g.fillRect(x - 3, H * .16, 3, 3); } } // [60] 端の金具（フック）
  g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 1; g.setLineDash([2, 3]); for (let i = 0; i < 2; i++) { const a = px[i] + 6, b = px[i + 1] - 6; g.beginPath(); g.moveTo(a, H * .19); g.quadraticCurveTo((a + b) / 2, H * .6, b, H * .19); g.stroke(); } g.setLineDash([]); // [61] ロープのよりめ
}
/* ---- ピクニック（レジャーシートとお弁当） [62〜71] ---- */
function paintPicnic2(g, W, H) {
  const sheet = () => { g.beginPath(); g.moveTo(W * .08, H * .34); g.lineTo(W * .92, H * .34); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); };
  sheet(); g.fillStyle = '#2E6CA8'; g.fill(); g.save(); sheet(); g.clip(); // [62] 青と白のチェックのシート
  for (let k = 0; k < 9; k++) { const t = k / 8, xa = lerp(W * .08, 0, 0) + t * W * .84, xb = t * W; g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 5; g.beginPath(); g.moveTo(W * .08 + t * W * .84, H * .34); g.lineTo(xb, H); g.stroke(); }
  for (let k = 0; k < 4; k++) { const y = H * (.38 + k * .17); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(0, y, W, H * .05); }
  g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W * .2, H * .5); g.quadraticCurveTo(W * .3, H * .7, W * .22, H * .95); g.moveTo(W * .8, H * .45); g.quadraticCurveTo(W * .7, H * .62, W * .78, H * .9); g.stroke(); g.restore(); // [63] シートのしわ
  g.fillStyle = '#7A6248'; for (const [x, y] of [[.1, .37], [.9, .37]]) { g.beginPath(); g.ellipse(W * x, H * y, 7, 4, 0, 0, 7); g.fill(); } // [64] すみを押さえる小石
  g.fillStyle = 'rgba(0,0,0,.25)'; rrect(g, W * .27, H * .22, W * .34, H * .5, 6); g.fill(); g.fillStyle = '#2B2B2B'; rrect(g, W * .26, H * .18, W * .34, H * .5, 6); g.fill(); g.fillStyle = '#B5302A'; rrect(g, W * .27, H * .19, W * .32, H * .46, 4); g.fill(); // [65] 黒と朱のお弁当箱
  g.fillStyle = '#F5F2EA'; for (const x of [.31, .39]) { g.beginPath(); g.moveTo(W * x, H * .44); g.lineTo(W * (x + .04), H * .26); g.lineTo(W * (x + .08), H * .44); g.closePath(); g.fill(); g.fillStyle = '#1E2A1E'; g.fillRect(W * (x + .015), H * .36, W * .05, H * .08); g.fillStyle = '#F5F2EA'; } // [66] おにぎりとのり
  g.fillStyle = '#F2C230'; rrect(g, W * .48, H * .24, W * .09, H * .12, 2); g.fill(); g.strokeStyle = '#D9A21B'; g.lineWidth = 1; for (const y of [.28, .32]) { g.beginPath(); g.moveTo(W * .48, H * y); g.lineTo(W * .57, H * y); g.stroke(); } // [67] 玉子焼き
  g.fillStyle = '#B86A2C'; for (const [x, y] of [[.32, .54], [.37, .57], [.42, .53]]) { g.beginPath(); g.arc(W * x, H * y, W * .028, 0, 7); g.fill(); } g.fillStyle = '#6FAE4A'; g.beginPath(); g.ellipse(W * .52, H * .53, W * .05, H * .06, .3, 0, 7); g.fill(); g.fillStyle = '#E2463A'; g.beginPath(); g.arc(W * .5, H * .44, W * .02, 0, 7); g.fill(); // [68] からあげ・レタス・ミニトマト
  { const tg = g.createLinearGradient(W * .66, 0, W * .8, 0); tg.addColorStop(0, '#1E3E5E'); tg.addColorStop(.4, '#4E86B8'); tg.addColorStop(1, '#1A3450'); g.fillStyle = tg; rrect(g, W * .66, H * .08, W * .13, H * .58, 8); g.fill(); } g.fillStyle = vgrad(g, H * .02, H * .14, [[0, '#E3E7EB'], [1, '#8E979F']]); rrect(g, W * .655, H * .02, W * .14, H * .12, 4); g.fill(); // [69] 水とうのつやとコップのふた
  g.fillStyle = '#FBF6EE'; rrect(g, W * .82, H * .36, W * .07, H * .2, 2); g.fill(); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(W * .82, H * .36, W * .07, 2); // [70] 紙コップ
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(W * .66, H * .66, W * .13, 3); // [71] 水とうの足もとのかげ
}
/* ---- 浮き輪（救命浮環） [72〜78] ---- */
function paintRing2(g, W, H) {
  AP.ao(g, W, H, .3, .45); g.save(); g.translate(W / 2, H * .58); g.scale(1, .48); const R = W * .36, T = W * .2;
  g.lineWidth = T; g.strokeStyle = '#D9D9D4'; g.beginPath(); g.arc(0, 4, R, 0, 7); g.stroke(); // [72] 厚みの下側
  g.strokeStyle = '#F6F6F2'; g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke();
  g.strokeStyle = '#D33A2C'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(0, 0, R, k * Math.PI / 2 + .3, k * Math.PI / 2 + .9); g.stroke(); } // [73] 4 つの赤い区切り
  const rg = g.createRadialGradient(0, 0, R - T / 2, 0, 0, R + T / 2); rg.addColorStop(0, 'rgba(0,0,0,.28)'); rg.addColorStop(.35, 'rgba(0,0,0,0)'); rg.addColorStop(.65, 'rgba(255,255,255,0)'); rg.addColorStop(.8, 'rgba(255,255,255,.3)'); rg.addColorStop(1, 'rgba(0,0,0,.25)'); g.strokeStyle = rg; g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke(); // [74] ドーナツの丸み（内側と外側のかげ・上のつや）
  g.strokeStyle = '#E8DCC0'; g.lineWidth = 2.5; for (let k = 0; k < 4; k++) { const a0 = k * Math.PI / 2 - .35, a1 = a0 + .7; g.beginPath(); g.arc(0, 0, R + T / 2 + 3, a0, a1); g.stroke(); } // [75] まわりのつかみロープ
  g.fillStyle = '#3A3A3A'; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 - .35; g.beginPath(); g.arc(Math.cos(a) * (R + T / 2), Math.sin(a) * (R + T / 2), 3, 0, 7); g.fill(); } // [76] ロープの留め金
  g.restore(); g.fillStyle = 'rgba(140,190,230,.5)'; for (const [x, y] of [[.3, .5], [.62, .44], [.7, .7]]) { g.beginPath(); g.ellipse(W * x, H * y, 2.5, 1.5, 0, 0, 7); g.fill(); } // [77] 水のしずく
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(W / 2, H * .58, W * .17, H * .09, 0, 0, 7); g.fill(); // [78] まん中の穴の向こうの床のかげ
}
/* ---- 落ち葉の山（いちょう） [79〜85] ---- */
function paintLeaves2(g, W, H) {
  AP.ao(g, W, H, .25, .5);
  g.fillStyle = vgrad(g, H * .2, H, [[0, '#E8BE3A'], [1, '#A47614']]); g.beginPath(); g.moveTo(W * .02, H * .98); g.bezierCurveTo(W * .14, H * .3, W * .4, H * .12, W * .52, H * .14); g.bezierCurveTo(W * .7, H * .16, W * .9, H * .4, W * .98, H * .98); g.closePath(); g.fill(); // [79] こんもりした山の形と、下ほど暗いかげ
  const r = rnd(41), fan = (x, y, s, rot, c) => { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = c; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, s, -Math.PI * .85, -Math.PI * .15); g.closePath(); g.fill(); g.strokeStyle = 'rgba(120,80,10,.4)'; g.lineWidth = .8; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, s * .5); g.stroke(); g.beginPath(); g.moveTo(-s * .05, -s * .95); g.lineTo(0, -s * .55); g.lineTo(s * .05, -s * .95); g.stroke(); g.restore(); }; // [80] いちょうの扇の形の葉（まん中の切れこみ・葉のすじ・柄）
  for (let i = 0; i < 70; i++) { const t = r(), x = W * (.08 + t * .84), top = H * (.98 - Math.sin(t * Math.PI) * .82), y = top + r() * (H * .96 - top); fan(x, y, 7 + r() * 6, r() * 6.3, ['#F6D24A', '#E8B624', '#F2C230', '#D9A21B', '#FBE07A'][(r() * 5) | 0]); } // [81] 葉の色のちがい（黄・山吹・うすい黄）
  for (let i = 0; i < 6; i++) { const x = W * (.2 + r() * .6), y = H * (.4 + r() * .4); g.save(); g.translate(x, y); g.rotate(r() * 6); g.fillStyle = '#C8462C'; g.beginPath(); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .55; g.lineTo(Math.cos(a) * 8, Math.sin(a) * 8); g.lineTo(Math.cos(a + .27) * 3, Math.sin(a + .27) * 3); } g.closePath(); g.fill(); g.restore(); } // [82] まじったもみじの赤い葉
  g.fillStyle = 'rgba(90,60,10,.18)'; g.beginPath(); g.ellipse(W * .62, H * .7, W * .2, H * .15, 0, 0, 7); g.fill(); // [83] 山の右下のかげ
  for (let i = 0; i < 8; i++) fan(W * (r() < .5 ? r() * .12 : .88 + r() * .1), H * (.88 + r() * .1), 6, r() * 6.3, '#F2C230'); // [84] まわりに散った葉
  AP.gloss(g, W * .4, H * .3, W * .14, H * .08, .25); // [85] てっぺんに当たる光
}
/* ---- 雪玉 [86〜91] ---- */
function snowballPlus(g, W, H) {
  const r0 = Math.min(W, H) * .47, cx = W / 2, cy = H - r0 - H * .02, r = rnd(17);
  g.save(); g.beginPath(); g.arc(cx, cy, r0, 0, 7); g.clip();
  g.fillStyle = 'rgba(120,150,200,.22)'; g.beginPath(); g.ellipse(cx + r0 * .25, cy + r0 * .45, r0 * .9, r0 * .6, 0, 0, 7); g.fill(); // [86] 下と右の青いかげ（雪のかげは青い）
  g.strokeStyle = 'rgba(150,170,205,.35)'; g.lineWidth = 2; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(cx, cy + r0 * .1, r0 * (.95 - k * .02), r0 * (.35 + k * .18), (k - 1.5) * .25, 0, 7); g.stroke(); } // [87] 転がしてできた巻きのすじ
  for (let i = 0; i < 18; i++) { g.fillStyle = 'rgba(200,215,235,.6)'; g.beginPath(); g.arc(cx + (r() - .5) * r0 * 1.6, cy + (r() - .5) * r0 * 1.6, 2 + r() * 4, 0, 7); g.fill(); } // [88] でこぼこの小さなかたまり
  g.restore();
  g.strokeStyle = '#5A3E28'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - r0 * .5, cy + r0 * .2); g.lineTo(cx - r0 * .3, cy + r0 * .05); g.lineTo(cx - r0 * .22, cy + r0 * .12); g.stroke(); g.fillStyle = '#B86A2C'; g.beginPath(); g.ellipse(cx + r0 * .35, cy - r0 * .3, 5, 3, .5, 0, 7); g.fill(); // [89] まきこんだ小枝と落ち葉
  g.fillStyle = '#FFFFFF'; for (let i = 0; i < 26; i++) { const a = r() * 6.3, d = r() * r0 * .9; g.globalAlpha = .5 + r() * .5; g.fillRect(cx + Math.cos(a) * d - r0 * .2, cy + Math.sin(a) * d - r0 * .25, 1.6, 1.6); } g.globalAlpha = 1; // [90] 雪のきらきら
  g.fillStyle = 'rgba(235,242,250,.9)'; g.beginPath(); g.ellipse(cx, H - 6, r0 * .9, 5, 0, 0, 7); g.fill(); // [91] 足もとにこぼれた雪
}
/* ---- マグカップ [92〜97] ---- */
function mugPlus(g, W, H) {
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(W * .46, H * .97, W * .44, H * .035, 0, 0, 7); g.fill(); g.fillStyle = '#B88B5C'; g.beginPath(); g.ellipse(W * .46, H * .95, W * .42, H * .03, 0, 0, 7); g.fill(); // [92] コルクのコースター
  g.fillStyle = '#4A2A18'; g.beginPath(); g.ellipse(W * .45, H * .14, W * .34, H * .045, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(200,150,100,.6)'; g.beginPath(); g.ellipse(W * .45, H * .14, W * .2, H * .02, 0, 0, 7); g.fill(); // [93] コーヒーの面と、うかんだ泡
  AP.gloss(g, W * .38, H * .135, W * .06, H * .01, .5); // [94] 面に映る明かり
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; g.lineCap = 'round'; for (const [x, k] of [[.36, 1], [.5, -1]]) { g.beginPath(); g.moveTo(W * x, H * .1); g.bezierCurveTo(W * (x + k * .08), H * .02, W * (x - k * .06), -H * .05, W * (x + k * .04), -H * .1); g.stroke(); } // [95] ゆげ
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(W * .16, H * .22, W * .04, H * .6); // [96] 陶器のたての光
  g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(W * .12, H * .9); g.quadraticCurveTo(W * .45, H * .94, W * .78, H * .9); g.stroke(); // [97] 底の高台のかげ
}
/* ---- 積み木 [98〜102] ---- */
function toysPlus(g, W, H) {
  const r = rnd(23); g.strokeStyle = 'rgba(90,60,25,.22)'; g.lineWidth = 1; for (let i = 0; i < 14; i++) { const x = W * (.05 + r() * .9), y = H * (.3 + r() * .65); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 14, y + 1); g.stroke(); } // [98] 色の下から見える木目
  g.fillStyle = 'rgba(255,255,255,.35)'; for (const [x, y, s] of [[.08, .58, .32], [.5, .58, .32], [.28, .2, .32]]) { g.fillRect(W * x + 3, H * y + 2, W * s - 6, 2); g.fillRect(W * x + 2, H * y + 3, 2, H * s - 6); } // [99] 面取りした角の光
  g.fillStyle = 'rgba(240,225,200,.8)'; for (const [x, y] of [[.12, .66], [.74, .9], [.55, .3]]) { g.beginPath(); g.ellipse(W * x, H * y, 3, 2, 0, 0, 7); g.fill(); } // [100] 塗りがはげた所（木の色）
  g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(W * .06, H * .92, W * .88, H * .03); // [101] 床との接地のかげ
  g.fillStyle = '#E2463A'; rrect(g, W * .82, H * .8, W * .14, H * .12, 4); g.fill(); g.fillStyle = '#2B2B2B'; for (const x of [.85, .93]) { g.beginPath(); g.arc(W * x, H * .93, 3.5, 0, 7); g.fill(); } // [102] そばに転がる小さな車のおもちゃ
}
/* ---- 座ぶとん [103〜108] ---- */
function paintCushions2(g, W, H) {
  AP.ao(g, W, H, .3, .5);
  for (const [y, c, hh] of [[.52, '#5E6E9E', .4], [.16, '#B4572E', .42]]) { const top = H * y, h = H * hh;
    g.fillStyle = vgrad(g, top, top + h, [[0, shadeHex(c, 1.18)], [.5, c], [1, shadeHex(c, .7)]]); g.beginPath(); g.moveTo(W * .06, top + h * .5); g.bezierCurveTo(W * .04, top, W * .2, top - h * .05, W * .5, top + h * .02); g.bezierCurveTo(W * .8, top - h * .05, W * .96, top, W * .94, top + h * .5); g.bezierCurveTo(W * .96, top + h, W * .8, top + h * 1.02, W * .5, top + h * .95); g.bezierCurveTo(W * .2, top + h * 1.02, W * .04, top + h, W * .06, top + h * .5); g.fill(); // [103] ふっくらした、ふちの丸い形
    const r = rnd(top | 0); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; for (let i = 0; i < 10; i++) { const x = W * (.15 + r() * .7), yy = top + h * (.2 + r() * .6); g.beginPath(); g.arc(x, yy, 5, 0, Math.PI); g.stroke(); } // [104] 青海波などの地紋
    AP.stitch(g, [[W * .1, top + h * .5], [W * .9, top + h * .5]], 'rgba(255,255,255,.35)'); // [105] 横のぬい目
    g.fillStyle = shadeHex(c, .6); g.beginPath(); g.arc(W * .5, top + h * .35, 4, 0, 7); g.fill(); g.strokeStyle = shadeHex(c, .5); g.lineWidth = 1.5; g.beginPath(); g.moveTo(W * .5 - 6, top + h * .35 - 3); g.lineTo(W * .5 + 6, top + h * .35 + 3); g.moveTo(W * .5 + 6, top + h * .35 - 3); g.lineTo(W * .5 - 6, top + h * .35 + 3); g.stroke(); // [106] まん中の綴じ（とじ糸）
    for (const x of [.06, .94]) { g.fillStyle = shadeHex(c, .8); g.beginPath(); g.moveTo(W * x, top + h * .45); g.lineTo(W * x + (x < .5 ? -8 : 8), top + h * .7); g.lineTo(W * x + (x < .5 ? -2 : 2), top + h * .72); g.closePath(); g.fill(); } // [107] すみの房
    AP.gloss(g, W * .35, top + h * .25, W * .16, h * .14, .2); } // [108] 布のつや
}
/* ---- のれん（描き足し） [109〜114] ---- */
function norenPlus(g, W, H) {
  const top = H * .02, bot = H * .76, n = 3, pw = W / n;
  g.fillStyle = '#B88A52'; g.fillRect(0, top, W, 7); g.fillStyle = '#8A6234'; for (let x = W * .15; x < W; x += W * .3) g.fillRect(x, top - 1, 4, 9); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(0, top + 1, W, 1.5); // [109] 竹のさおの節とつや
  for (let i = 0; i < n; i++) { const x0 = i * pw + 3, x1 = (i + 1) * pw - 3; for (let k = 0; k < 4; k++) { const x = x0 + (x1 - x0) * (k + .5) / 4, fg = g.createLinearGradient(x - 8, 0, x + 8, 0); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(.5, 'rgba(0,0,0,.12)'); fg.addColorStop(1, 'rgba(255,255,255,.06)'); g.fillStyle = fg; g.fillRect(x - 8, top + 8, 16, bot - top - 16); } // [110] 布のたてのひだ（光とかげ）
    g.fillStyle = 'rgba(255,255,255,.6)'; for (let x = x0 + 4; x < x1; x += 10) g.fillRect(x, top + 9, 4, 3); // [111] 上の竿通しのぬい目
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0 - 3, bot - 10); g.quadraticCurveTo((x0 + x1) / 2, bot + 3, x1 + 3, bot - 10); g.stroke(); } // [112] すその折り返しのぬい
  g.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 1; i < n; i++) g.fillRect(i * pw - 3, top + 8, 6, bot - top - 8); // [113] 切れ目のすき間（向こうの暗がり）
  g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(0, top + 8, W, (bot - top) * .3); // [114] 上の方に当たる光（色あせ）
}
/* ---- テーブル・ちゃぶ台（描き足し） [115〜122] ---- */
function tablePlus(kind) { return (g, W, H) => {
  if (kind === 'chabudai') { g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(W / 2, H * .03, W * .48, H * .03, 0, 0, 7); g.fill(); // [115] ちゃぶ台の丸い天板の上の面（奥行き）
    g.fillStyle = '#4A2C16'; for (const x of [.2, .8]) { g.beginPath(); g.moveTo(W * x - 8, H * .3); g.lineTo(W * x + 8, H * .3); g.lineTo(W * x + 5, H * .98); g.lineTo(W * x - 5, H * .98); g.closePath(); g.fill(); } // [116] 折りたたみ脚（内側にもう 2 本）
    g.fillStyle = '#C9A030'; for (const x of [.2, .8]) { g.beginPath(); g.arc(W * x, H * .34, 3, 0, 7); g.fill(); } } // [117] 脚の金具
  if (kind === 'mtable') { g.fillStyle = '#5E6670'; g.fillRect(W * .2, H * .32, W * .6, H * .05); g.fillStyle = '#2B2B2B'; for (const x of [.3, .5, .7]) g.fillRect(W * x, H * .335, W * .05, H * .02); // [118] 会議テーブルの下の配線トレイとコンセント
    g.fillStyle = '#2B2B2B'; for (const x of [.08, .9]) { g.beginPath(); g.arc(W * x, H * .985, 4, 0, 7); g.fill(); } g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, H * .19, W, H * .03); } // [119] キャスターと、天板のふちの樹脂
  if (kind === 'table') { AP.knot(g, W * .7, H * .1, 9, 'rgba(90,55,25,.35)'); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(W * .62, H * .02, W * .2, H * .02); } // [120] 天板の節と窓の映りこみ
  g.fillStyle = 'rgba(0,0,0,.18)'; for (const x of [.08, .92]) { g.beginPath(); g.ellipse(W * x, H * .985, 10, 3, 0, 0, 7); g.fill(); } // [121] 脚の足もとのかげ
  AP.gloss(g, W * .3, H * .06, W * .18, H * .03, .25); // [122] 天板のつや
}; }
/* ---- 書類の山（描き足し） [123〜128] ---- */
function papersPlus(tall) { return (g, W, H) => { const r = rnd(tall ? 31 : 13), n = tall ? 16 : 6;
  for (let i = 0; i < n; i++) { const y = H * (tall ? .02 + i * .058 : .2 + i * .12); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(W * .12, y + 3, W * .76, 1); if (r() < .4) { g.fillStyle = ['#F6E26A', '#9FD3F0', '#F4A6B8'][(r() * 3) | 0]; g.fillRect(W * (.2 + r() * .55), y - 2, W * .05, 6); } } // [123] 紙の束の境目と、はみ出したふせん
  g.fillStyle = '#2B2B2B'; for (const y of tall ? [.2, .55] : [.3]) { rrect(g, W * .45, H * y, W * .1, H * (tall ? .03 : .07), 2); g.fill(); g.strokeStyle = '#B9C0C7'; g.lineWidth = 2; g.beginPath(); g.moveTo(W * .47, H * y); g.lineTo(W * .5, H * y - 8); g.lineTo(W * .53, H * y); g.stroke(); } // [124] 黒いダブルクリップ
  g.fillStyle = '#C9CDD2'; g.fillRect(W * .16, H * (tall ? .1 : .25), 6, 1.5); // [125] ホッチキスの針
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.moveTo(W * .82, H * (tall ? .03 : .2)); g.quadraticCurveTo(W * .9, H * (tall ? .0 : .15), W * .88, H * (tall ? .06 : .26)); g.lineTo(W * .82, H * (tall ? .06 : .26)); g.fill(); // [126] めくれた紙のすみ
  g.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 6; i++) g.fillRect(W * (.22 + r() * .5), H * (tall ? .01 : .17), W * .12, 1.2); // [127] いちばん上の紙の字の行
  g.fillStyle = 'rgba(200,60,50,.7)'; g.beginPath(); g.arc(W * .7, H * (tall ? .03 : .19), 4, 0, 7); g.fill(); // [128] はんこ（朱肉の丸）
}; }
/* ---- 鉢植え（描き足し） [129〜133] ---- */
function plantPlus(g, W, H) {
  g.fillStyle = '#4A3424'; g.beginPath(); g.ellipse(W / 2, H * .645, W * .27, H * .02, 0, 0, 7); g.fill(); const r = rnd(8); g.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 20; i++) g.fillRect(W * (.28 + r() * .44), H * (.635 + r() * .02), 1.5, 1.5); // [129] 土の面と細かい粒
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(W * .22, H * .64, W * .56, 2.5); // [130] 鉢のふちの光
  g.fillStyle = vgrad(g, H * .96, H, [[0, '#B07848'], [1, '#7A5030']]); g.beginPath(); g.ellipse(W / 2, H * .975, W * .3, H * .02, 0, 0, 7); g.fill(); // [131] 受け皿
  g.strokeStyle = 'rgba(30,60,20,.35)'; g.lineWidth = 1; for (let i = 0; i < 14; i++) { const x = W * (.2 + r() * .6), y = H * (.08 + r() * .45); g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 6, y - 2); g.stroke(); } // [132] 葉のすじ
  g.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(W * (.2 + r() * .6), H * (.08 + r() * .45), 5, 2, -.4, 0, 7); g.fill(); } // [133] 葉のつや
}
/* ---- 時計（描き足し） [134〜138] ---- */
function clockPlus(g, W, H) {
  const cx = W / 2, cy = H * .56, R = W * .3;
  g.fillStyle = '#2B2B2B'; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, rr = k % 3 ? 2 : 3.2; g.beginPath(); g.arc(cx + Math.cos(a) * R * .82, cy + Math.sin(a) * R * .82, rr, 0, 7); g.fill(); } // [134] 目盛り（3・6・9・12 は大きく）
  g.strokeStyle = '#D33A2C'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + R * .75 * Math.cos(1.1), cy + R * .75 * Math.sin(1.1)); g.stroke(); // [135] 赤い秒針
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(cx - R * .35, cy - R * .4, R * .35, R * .14, -.6, 0, 7); g.fill(); // [136] ガラスの映りこみ
  g.fillStyle = '#5A4632'; g.fillRect(cx - 2, H * .04, 4, H * .1); g.fillStyle = '#C9962F'; g.beginPath(); g.arc(cx, H * .1, 5, 0, 7); g.fill(); // [137] ベルを打つハンマー
  for (const x of [.22, .78]) AP.gloss(g, W * x - 4, H * .1, 6, 4, .6); // [138] ベルのつや
}
/* ---- かさ立て（描き足し） [139〜142] ---- */
function umbrellaPlus(g, W, H) {
  g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1; for (const x of [.28, .42, .56, .7]) { g.beginPath(); g.moveTo(W * x, H * .22); g.lineTo(W * x, H * .6); g.stroke(); } // [139] かさの骨のすじ
  g.fillStyle = 'rgba(160,190,220,.6)'; for (const [x, y] of [[.3, .66], [.5, .9], [.62, .8]]) { g.beginPath(); g.ellipse(W * x, H * y, 2, 3, 0, 0, 7); g.fill(); } // [140] したたる雨のしずく
  g.fillStyle = 'rgba(160,190,220,.35)'; g.beginPath(); g.ellipse(W / 2, H * .985, W * .4, 3, 0, 0, 7); g.fill(); // [141] 足もとの水たまり
  g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(W * .26, H * .66, 3, H * .3); // [142] 筒のつや
}
/* ---- 段ボール（描き足し） [143〜146] ---- */
function boxPlus(g, W, H) {
  g.fillStyle = 'rgba(255,255,255,.85)'; rrect(g, W * .6, H * .5, W * .26, H * .2, 2); g.fill(); g.fillStyle = 'rgba(0,0,0,.5)'; for (let i = 0; i < 5; i++) g.fillRect(W * .62, H * (.53 + i * .03), W * (.12 + (i % 2) * .08), 1.5); // [143] 送り状（伝票）
  g.fillStyle = '#2B2B2B'; g.font = `700 ${Math.round(H * .06)}px sans-serif`; g.textAlign = 'center'; g.fillText('↑↑', W * .75, H * .42); // [144] 天地無用の矢印
  g.fillStyle = 'rgba(90,60,30,.2)'; g.beginPath(); g.ellipse(W * .2, H * .85, W * .08, H * .04, 0, 0, 7); g.fill(); // [145] 角のこすれ・水じみ
  g.strokeStyle = 'rgba(60,40,20,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(W * .06, H * .3); g.lineTo(W * .1, H * .38); g.lineTo(W * .07, H * .45); g.stroke(); // [146] 角のへこみのしわ
}
/* ---- コーン（描き足し） [147〜149] ---- */
function conePlus(g, W, H) {
  g.fillStyle = 'rgba(255,255,255,.55)'; for (const y of [.3, .58]) g.fillRect(W * .44, H * y + 2, W * .05, H * .08); // [147] 反射テープのきらり
  g.fillStyle = '#1A1C1F'; for (const x of [.12, .88]) { g.beginPath(); g.arc(W * x, H * .93, 3, 0, 7); g.fill(); } // [148] 台のすみのくぼみ
  g.fillStyle = 'rgba(80,60,40,.2)'; g.fillRect(W * .2, H * .82, W * .6, 3); // [149] 道路の泥はね
}
/* ---- ベンチ・いす・丸いす・スーツケースなど（描き足し） [150〜170] ---- */
function benchPlus(g, W, H) { g.fillStyle = '#5E6670'; rrect(g, W * .47, H * .4, W * .06, H * .26, 3); g.fill(); // [150] まん中のひじかけ（寝そべり防止）
  g.fillStyle = '#C9A030'; rrect(g, W * .4, H * .06, W * .2, H * .06, 2); g.fill(); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(W * .43, H * .085, W * .14, 1.5); // [151] 寄付の小さな金のプレート
  g.fillStyle = '#2B2B2B'; for (const x of [.08, .86]) g.fillRect(W * x - 3, H * .96, W * .06 + 6, H * .04); } // [152] 脚の足の台
function chairPlus(g, W, H) { g.fillStyle = 'rgba(0,0,0,.25)'; rrect(g, W * .46, H * .52, W * .08, H * .2, 2); g.fill(); g.fillStyle = '#9AA0A6'; g.fillRect(W * .48, H * .52, W * .04, H * .25); // [153] ガスシリンダーの銀色
  g.fillStyle = '#2B2B2B'; rrect(g, W * .7, H * .55, W * .12, H * .03, 2); g.fill(); // [154] 高さ調節のレバー
  AP.stitch(g, [[W * .22, H * .2], [W * .78, H * .2]], 'rgba(255,255,255,.35)'); AP.gloss(g, W * .35, H * .12, W * .12, H * .05, .25); } // [155] 背もたれのぬい目とつや
function stoolsPlus(g, W, H) { g.strokeStyle = '#9AA0A6'; g.lineWidth = 2.5; for (const cx of [.27, .73]) { g.beginPath(); g.ellipse(W * cx, H * .7, W * .14, H * .04, 0, 0, 7); g.stroke(); } // [156] 足かけの輪
  g.fillStyle = '#2B2B2B'; for (const x of [.12, .4, .6, .88]) { g.beginPath(); g.ellipse(W * x, H * .97, 4, 2, 0, 0, 7); g.fill(); } // [157] 脚のゴムキャップ
  for (const cx of [.27, .73]) AP.gloss(g, W * cx - 10, H * .3, W * .08, H * .03, .4); } // [158] 座面のビニールのつや
function suitcasePlus(g, W, H) { g.fillStyle = '#2B2B2B'; for (const x of [.22, .78]) { rrect(g, W * x - 6, H * .9, 12, H * .08, 3); g.fill(); g.fillStyle = '#555'; g.beginPath(); g.arc(W * x, H * .96, 4, 0, 7); g.fill(); g.fillStyle = '#2B2B2B'; } // [159] 4 つの車輪（2 つ見える）
  g.fillStyle = '#C9CDD2'; rrect(g, W * .62, H * .45, W * .14, H * .08, 2); g.fill(); g.fillStyle = '#2B2B2B'; for (let k = 0; k < 3; k++) g.fillRect(W * (.635 + k * .04), H * .47, W * .025, H * .04); // [160] ダイヤル錠
  g.fillStyle = '#E8DCC0'; rrect(g, W * .08, H * .3, W * .1, H * .14, 2); g.fill(); g.strokeStyle = '#8A6A3A'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(W * .13, H * .3); g.lineTo(W * .13, H * .2); g.stroke(); // [161] 名札のタグ
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(W * .2, H * .32, 3, H * .52); } // [162] たてのみぞの光
function strollerPlus(g, W, H) { g.fillStyle = 'rgba(0,0,0,.35)'; rrect(g, W * .3, H * .72, W * .4, H * .1, 4); g.fill(); g.fillStyle = '#C9CDD2'; g.fillRect(W * .3, H * .72, W * .4, 2); // [163] 下の荷物かご
  g.strokeStyle = '#2B2B2B'; g.lineWidth = 2; for (const x of [.2, .8]) { g.beginPath(); g.arc(W * x, H * .9, W * .05, 0, 7); g.stroke(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; g.beginPath(); g.moveTo(W * x - Math.cos(a) * W * .05, H * .9 - Math.sin(a) * W * .05); g.lineTo(W * x + Math.cos(a) * W * .05, H * .9 + Math.sin(a) * W * .05); g.stroke(); } } // [164] 車輪のスポーク
  g.fillStyle = '#F2C230'; g.beginPath(); g.arc(W * .7, H * .3, 5, 0, 7); g.fill(); } // [165] つるしたおもちゃ
function bagsPlus(g, W, H) { g.fillStyle = 'rgba(255,255,255,.9)'; rrect(g, W * .58, H * .18, W * .12, H * .1, 2); g.fill(); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(W * .6, H * .21, W * .08, 1.5); // [166] レシート
  g.fillStyle = '#6FAE4A'; g.beginPath(); g.ellipse(W * .3, H * .1, W * .03, H * .12, -.3, 0, 7); g.fill(); g.fillStyle = '#E8E2C8'; g.fillRect(W * .2, H * .12, W * .1, H * .06); } // [167] ふくろからのぞくねぎとパン
function cratePlus(g, W, H) { g.fillStyle = '#D9C27A'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(W * (.18 + i * .13), H * .03 + 3, 4, 0, 7); g.fill(); } // [168] いちばん上のびんの王冠
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(W * .05, H * .1, W * .9, 2); } // [169] 箱のふちの光
function potPlus(g, W, H) { g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 3; g.lineCap = 'round'; for (const x of [.4, .58]) { g.beginPath(); g.moveTo(W * x, H * .1); g.bezierCurveTo(W * (x + .06), H * .02, W * (x - .05), -H * .02, W * (x + .03), -H * .06); g.stroke(); } } // [170] ふたのすき間のゆげ
/* ---- 石灯籠・人力車・望遠鏡・カプセルの機械・三脚（描き足し） [171〜190] ---- */
function lanternPlus(g, W, H) { const r = rnd(61); g.fillStyle = 'rgba(70,110,50,.45)'; for (let i = 0; i < 26; i++) { const y = H * (r() < .5 ? .28 + r() * .06 : .86 + r() * .1); g.beginPath(); g.arc(W * (.25 + r() * .5), y, 2 + r() * 3, 0, 7); g.fill(); } // [171] こけ（笠の上と台座）
  g.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 30; i++) g.fillRect(W * (.3 + r() * .4), H * (.3 + r() * .6), 1.5, 1.5); // [172] 石の細かいあばた
  g.strokeStyle = 'rgba(30,30,30,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(W * .44, H * .62); g.lineTo(W * .48, H * .7); g.lineTo(W * .45, H * .76); g.stroke(); // [173] ひび
  g.fillStyle = 'rgba(40,30,20,.35)'; g.fillRect(W * .38, H * .9, W * .24, H * .03); } // [174] 雨だれのしみ
function rickshawPlus(g, W, H) { g.fillStyle = '#C9A030'; for (const x of [.1, .9]) { g.beginPath(); g.arc(W * x, H * .7, 4, 0, 7); g.fill(); } // [175] 車輪の真ちゅうの軸
  g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(W * .3, H * .22, W * .4, 2); // [176] ほろの革のつや
  g.fillStyle = '#B5302A'; rrect(g, W * .32, H * .45, W * .36, H * .08, 3); g.fill(); g.strokeStyle = '#F2C230'; g.lineWidth = 1.5; g.strokeRect(W * .33, H * .46, W * .34, H * .06); // [177] ひざかけの赤い毛布とふち
  g.fillStyle = '#F6E8C8'; g.beginPath(); g.ellipse(W * .5, H * .4, W * .05, H * .04, 0, 0, 7); g.fill(); } // [178] 座席のちょうちんの紋
function scopePlus(g, W, H) { g.fillStyle = '#1A1C1F'; for (const x of [.37, .63]) { g.beginPath(); g.arc(W * x, H * .14, W * .06, 0, 7); g.fill(); } g.fillStyle = 'rgba(120,180,230,.5)'; for (const x of [.37, .63]) { g.beginPath(); g.arc(W * x - 2, H * .13, W * .025, 0, 7); g.fill(); } // [179] 接眼のゴムとレンズの青い反射
  g.fillStyle = '#C9CDD2'; rrect(g, W * .42, H * .4, W * .16, H * .06, 2); g.fill(); g.fillStyle = '#2B2B2B'; g.fillRect(W * .47, H * .42, W * .06, 2); // [180] 硬貨の入れ口
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(W * .44, H * .3, 3, H * .55); } // [181] 柱のつや
function gachaPlus(g, W, H) { for (const x of [.25, .75]) { const r = rnd(x * 50); for (let i = 0; i < 6; i++) { const px = W * (x - .15 + r() * .3), py = H * (.12 + r() * .2); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(px - 2, py - 2, 2, 0, 7); g.fill(); } } // [182] カプセルのつやの点
  g.fillStyle = 'rgba(255,255,255,.3)'; for (const x of [.08, .58]) g.fillRect(W * x, H * .06, 4, H * .3); // [183] 窓のガラスの光
  g.fillStyle = '#F6F2E6'; for (const x of [.25, .75]) { rrect(g, W * x - W * .1, H * .42, W * .2, H * .07, 2); g.fill(); g.fillStyle = '#C8463C'; g.fillRect(W * x - W * .08, H * .44, W * .05, H * .03); g.fillStyle = '#F6F2E6'; } // [184] 値段のシール
  g.fillStyle = 'rgba(0,0,0,.4)'; for (const x of [.25, .75]) rrect(g, W * x - W * .07, H * .82, W * .14, H * .06, 3), g.fill(); } // [185] 取り出し口のふた
function tripodPlus(g, W, H) { g.fillStyle = '#C8463C'; g.beginPath(); g.arc(W * .62, H * .07, 3, 0, 7); g.fill(); // [186] 録画中の赤い光
  g.fillStyle = 'rgba(120,180,230,.6)'; g.beginPath(); g.arc(W * .5, H * .11, W * .04, 0, 7); g.fill(); // [187] レンズの青い反射
  g.strokeStyle = '#9AA0A6'; g.lineWidth = 2; for (const y of [.45, .65]) { g.beginPath(); g.moveTo(W * .3, H * y); g.lineTo(W * .7, H * y); g.stroke(); } // [188] 脚の伸縮の留め具
  g.fillStyle = '#2B2B2B'; for (const x of [.08, .5, .92]) { g.beginPath(); g.ellipse(W * x, H * .985, 4, 2, 0, 0, 7); g.fill(); } } // [189] 脚の先のゴム
function copierPlus(g, W, H) { g.fillStyle = 'rgba(255,255,255,.95)'; rrect(g, W * .1, H * .06, W * .3, H * .04, 1); g.fill(); g.fillStyle = 'rgba(0,0,0,.3)'; for (let i = 0; i < 3; i++) g.fillRect(W * .12, H * (.07 + i * .008), W * .2, 1); // [190] 出てきたコピーの紙
  g.fillStyle = '#7FD06A'; g.beginPath(); g.arc(W * .82, H * .2, 2.5, 0, 7); g.fill(); g.fillStyle = '#F2A23A'; g.beginPath(); g.arc(W * .86, H * .2, 2.5, 0, 7); g.fill(); // [191] 電源と注意のランプ
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(W * .05, H * .97, W * .9, 2); g.fillStyle = '#2B2B2B'; for (const x of [.1, .9]) { g.beginPath(); g.arc(W * x, H * .985, 3, 0, 7); g.fill(); } } // [192] キャスター
function flowersPlus(g, W, H) { const r = rnd(77); g.fillStyle = '#F6E26A'; for (let i = 0; i < 18; i++) { g.beginPath(); g.arc(W * (.1 + r() * .8), H * (.18 + r() * .2), 1.6, 0, 7); g.fill(); } // [193] 花のまん中のしべ
  g.fillStyle = 'rgba(40,80,30,.4)'; for (let i = 0; i < 10; i++) { g.beginPath(); g.ellipse(W * (.1 + r() * .8), H * (.42 + r() * .08), 6, 2.5, r() * 2, 0, 7); g.fill(); } // [194] 葉のかげ
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(W * .08, H * .55, W * .84, 2.5); } // [195] プランターのふちの光
function kickPlus(g, W, H) { g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(W * .44, H * .6, 2, H * .1); } // [196] キックボードの柱の光
function bikePlus(g, W, H) { g.fillStyle = '#C8463C'; g.beginPath(); g.arc(W / 2, H * .985, 3, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.beginPath(); g.arc(W / 2, H * .86, W * .055, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); } // [197] 自転車の赤い反射板とタイヤのつや
function cartPlus(g, W, H) { g.strokeStyle = 'rgba(80,90,100,.5)'; g.lineWidth = 1; for (let x = W * .1; x < W * .9; x += 8) { g.beginPath(); g.moveTo(x, H * .78); g.lineTo(x, H * .9); g.stroke(); } // [198] カートの下の網
  g.fillStyle = '#2B2B2B'; rrect(g, W * .05, H * .02, W * .25, H * .04, 3); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(W * .07, H * .025, W * .2, 1.5); } // [199] 持ち手のブレーキのバー
function barrierPlus(g, W, H) { g.fillStyle = '#C9CDD2'; for (const x of [.06, .94]) for (const y of [.3, .8]) { g.beginPath(); g.arc(W * x, H * y, 2.5, 0, 7); g.fill(); } g.fillStyle = 'rgba(255,255,255,.9)'; rrect(g, W * .4, H * .5, W * .2, H * .14, 2); g.fill(); g.fillStyle = '#C8463C'; g.font = `900 ${Math.round(H * .09)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('工事中', W / 2, H * .575); } // [200] さくの留めボルトと「工事中」の札

// 差しかえ（元の絵の大きさ・名前のまま。絵の名前に |p2 を付けて、古い絵とまざらないように）
ART.roomba = () => artCanvas('roomba|p2', 200, 70, paintRoomba2);
ART.slipper = () => artCanvas('slipper|p2', 180, 70, paintSlipper2);
ART.step = () => artCanvas('step|p2', 920, 60, paintStep2);
ART.pillar = () => artCanvas('pillar|p2', 130, 370, paintPillar2);
ART.pole = () => artCanvas('pole|p2', 60, 300, paintStationPole2);
ART.bag = () => artCanvas('bag|p2', 110, 90, paintBag2);
ART.rope = () => artCanvas('rope|p2', 540, 80, paintRope2);
ART.picnic = () => artCanvas('picnic|p2', 180, 70, paintPicnic2);
ART.ring = () => artCanvas('ring|p2', 100, 40, paintRing2);
ART.leafpile = () => artCanvas('leaves|p2', 260, 120, paintLeaves2);
ART.zabuton = () => artCanvas('zabuton|p2', 260, 100, paintCushions2);
plusArt('shoes', 180, 80, (g, w, h) => paintShoes(g, w, h, '#C8463C'), shoesPlus);
plusArt('snowball', 200, 190, paintSnowball, snowballPlus);
plusArt('mug', 200, 200, paintMug, mugPlus);
plusArt('toys', 200, 180, paintToys, toysPlus);
plusArt('table', 320, 170, (g, w, h) => paintTableHigh(g, w, h, 'table'), tablePlus('table'));
plusArt('chabudai', 320, 160, (g, w, h) => paintTableHigh(g, w, h, 'chabudai'), tablePlus('chabudai'));
plusArt('mtable', 320, 160, (g, w, h) => paintTableHigh(g, w, h, 'mtable'), tablePlus('mtable'));
plusArt('papers', 220, 130, (g, w, h) => paintPapers(g, w, h, 0), papersPlus(0));
plusArt('paperTall', 220, 380, (g, w, h) => paintPapers(g, w, h, 1), papersPlus(1));
plusArt('plant', 240, 420, paintPlant, plantPlus);
plusArt('clock', 180, 180, paintClock, clockPlus);
plusArt('umbrella', 180, 380, paintUmbrellas, umbrellaPlus);
plusArt('box', 200, 170, paintCardboard, boxPlus);
plusArt('cone', 120, 140, paintCone, conePlus);
plusArt('bench', 260, 110, paintBench, benchPlus);
plusArt('chair', 200, 170, paintChair, chairPlus);
plusArt('stoolsO', 240, 130, paintStools, stoolsPlus);
plusArt('suitcase', 200, 170, (g, w, h, o) => paintSuitcase(g, w, h, o && o.av ? o.av.c : '#355F86'), suitcasePlus);
plusArt('stroller', 200, 240, paintStroller, strollerPlus);
plusArt('bags', 220, 150, paintBags, bagsPlus);
plusArt('pot', 220, 180, paintPot, potPlus);
plusArt('stoneLanternO', 200, 380, paintStoneLantern, lanternPlus);
plusArt('rickshaw', 260, 360, paintRickshaw, rickshawPlus);
plusArt('telescope', 180, 320, paintBinoculars, scopePlus);
plusArt('gachaO', 260, 340, paintGacha, gachaPlus);
plusArt('tripod', 200, 330, paintTripod, tripodPlus);
plusArt('copier', 280, 280, paintCopier, copierPlus);
plusArt('flowers', 240, 160, paintFlowers, flowersPlus);
plusArt('barrier', 240, 150, paintBarrier2, barrierPlus);
{ const n0 = ART.noren; ART.noren = (o, night) => { const c = n0(o, night); if (c && !c.__plus) { norenPlus(c.getContext('2d'), c.width, c.height); c.__plus = 1; } return c; }; }
{ const c0 = ART.crate; ART.crate = (o, night) => { const c = c0(o, night); if (c && !c.__plus) { cratePlus(c.getContext('2d'), c.width, c.height); c.__plus = 1; } return c; }; }
{ const k0 = ART.kick, b0 = ART.bike, cart0 = ART.cart; ART.kick = (o, n) => { const c = k0(o, n); if (c && !c.__plus) { kickPlus(c.getContext('2d'), c.width, c.height); c.__plus = 1; } return c; }; ART.bike = (o, n) => { const c = b0(o, n); if (c && !c.__plus) { bikePlus(c.getContext('2d'), c.width, c.height); c.__plus = 1; } return c; }; if (cart0) ART.cart = (o, n) => { const c = cart0(o, n); if (c && !c.__plus) { cartPlus(c.getContext('2d'), c.width, c.height); c.__plus = 1; } return c; }; }
// ホームの部屋の小物も同じ絵を使う
Object.assign(PROP_ART, { tChabudai: () => ART.chabudai({}), tMug: () => ART.mug({}), tPapers: () => ART.papers({}), tClock: () => ART.clock({}), tZabuton: () => ART.zabuton({}), tToys: () => ART.toys({}) });

/* ================= ホーム画面（課長の寝室）の作り込み（2026-11-17） =================
   オーナー：「スタート画面の布団に厚みがなくて安っぽいし、タンスは紙切れみたい。作り込まれた現実のような最高の品質に。最低 50 個以上」。
   [番号] は docs/TITLE-ROOM-2026-11-17.md と同じ */
// [5] まくら：そば殻のふくらみ（まん中が少しへこむ）・白いカバーのしわ・ファスナーの線
function paintPillowS(g, W, H) { g.fillStyle = 'rgba(60,45,25,.25)'; g.beginPath(); g.ellipse(W / 2, H * .88, W * .46, H * .12, 0, 0, 7); g.fill();
  puffLayer(g, W * .04, H * .18, W * .92, H * .72, '#F7F3EA', '#D3C8B2', { bulge: .35, sag: .12 }); g.fillStyle = 'rgba(120,100,70,.14)'; g.beginPath(); g.ellipse(W * .5, H * .5, W * .2, H * .16, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(150,130,100,.4)'; g.lineWidth = 2; for (const x of [.2, .78]) { g.beginPath(); g.moveTo(W * x, H * .3); g.quadraticCurveTo(W * (x + .04), H * .5, W * x, H * .75); g.stroke(); } AP.stitch(g, [[W * .1, H * .82], [W * .9, H * .82]], 'rgba(150,130,100,.5)'); }
// [6] 掛けぶとんの折り返し：ふっくらした厚み、表の柄の色と裏の白、ひだのかげ
function paintQuiltFold(g, W, H) { g.fillStyle = 'rgba(40,30,20,.22)'; g.fillRect(W * .02, H * .78, W * .96, H * .18);
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#FBF7EE'); gr.addColorStop(.5, '#E9E0CE'); gr.addColorStop(1, '#C9BCA2'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, H * .85);
  for (let x = 0; x <= W; x += W / 24) g.lineTo(x, H * (.18 + Math.sin(x / W * Math.PI * 3 + .6) * .1 + (x / W) * .06)); g.lineTo(W, H * .85); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(90,110,150,.55)'; g.lineWidth = 3; g.beginPath(); for (let x = 0; x <= W; x += W / 24) { const y = H * (.18 + Math.sin(x / W * Math.PI * 3 + .6) * .1 + (x / W) * .06); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  g.fillStyle = 'rgba(120,100,70,.18)'; for (const x of [.22, .55, .82]) { const fg = g.createLinearGradient(W * (x - .05), 0, W * (x + .05), 0); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(.5, 'rgba(90,70,40,.18)'); fg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = fg; g.fillRect(W * (x - .05), H * .2, W * .1, H * .65); } }
// [14] 写真立て（ふたりで写った写真：うさぎの形の明るいかげ）
function paintPhotoFrame(g, W, H) { g.fillStyle = '#5E3E24'; rrect(g, W * .08, H * .05, W * .84, H * .82, 4); g.fill(); g.fillStyle = '#E9F0F4'; g.fillRect(W * .18, H * .14, W * .64, H * .62);
  g.fillStyle = '#9CC2DA'; g.fillRect(W * .18, H * .14, W * .64, H * .3); g.fillStyle = '#C9A57A'; g.beginPath(); g.ellipse(W * .38, H * .6, W * .12, H * .14, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(W * .6, H * .62, W * .1, H * .12, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(W * .18, H * .14); g.lineTo(W * .4, H * .14); g.lineTo(W * .18, H * .5); g.fill(); g.fillStyle = '#3E2A18'; g.fillRect(W * .44, H * .86, W * .12, H * .12); }
// [15] 一輪ざし：青い陶器の細い花びんと、季節の花一輪
function paintIchirin(g, W, H) { const vg = g.createLinearGradient(W * .25, 0, W * .75, 0); vg.addColorStop(0, '#2E4A62'); vg.addColorStop(.4, '#7EA2C0'); vg.addColorStop(1, '#22384C'); g.fillStyle = vg;
  g.beginPath(); g.moveTo(W * .42, H * .5); g.bezierCurveTo(W * .2, H * .62, W * .2, H * .98, W * .5, H * .98); g.bezierCurveTo(W * .8, H * .98, W * .8, H * .62, W * .58, H * .5); g.closePath(); g.fill();
  g.strokeStyle = '#4E7A3E'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(W * .5, H * .5); g.quadraticCurveTo(W * .45, H * .3, W * .55, H * .12); g.stroke(); g.fillStyle = '#E86A85'; for (let k = 0; k < 5; k++) { const a = k * 1.26; g.beginPath(); g.ellipse(W * .55 + Math.cos(a) * 5, H * .1 + Math.sin(a) * 5, 4.5, 3, a, 0, 7); g.fill(); } g.fillStyle = '#F6E26A'; g.beginPath(); g.arc(W * .55, H * .1, 2.5, 0, 7); g.fill(); }
Object.assign(PROP_ART, { pillowS: () => artCanvas('pillowS', 260, 90, paintPillowS), quiltFold: () => artCanvas('quiltFold', 600, 60, paintQuiltFold), photoFrame: () => artCanvas('photoFrame', 90, 100, paintPhotoFrame), ichirin: () => artCanvas('ichirin', 60, 150, paintIchirin) });
// [16〜22] たんすの正面：きりの明るい木目、引き出し（上は 2 つに分かれる）、わらび手の鉄の取っ手と座金、すみの金具、錠前、引き出しのすき間のかげ、上の光
{ const pf1 = paintFace; paintFace = function (kind, W, H) { // [10] 敷きぶとんの横の面／[6] 掛けぶとんの折り返しの横：木綿のカバーのふくらみ（上は光、下はかげ）・上のふちのパイピング・とじのくぼみ
  if (kind === 'futonSide' || kind === 'quiltEdge') return artCanvas('face|' + kind, W, H, (g) => { const q = kind === 'quiltEdge';
    g.fillStyle = vgrad(g, 0, H, q ? [[0, '#FBF7EE'], [.5, '#E6DCC8'], [1, '#C4B79C']] : [[0, '#FBF7EE'], [.25, '#F1EADB'], [.7, '#DCD2BE'], [1, '#B8AC94']]); g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(0, 0, W, H * .12); g.fillStyle = q ? 'rgba(90,110,150,.6)' : 'rgba(170,150,120,.5)'; g.fillRect(0, H * .1, W, H * .06);
    if (!q) { g.fillStyle = 'rgba(140,120,90,.14)'; for (let x = W * .06; x < W; x += W * .12) { g.beginPath(); g.ellipse(x, H * .55, 2.5, 2, 0, 0, 7); g.fill(); } } // [97] とじのくぼみを小さく・うすく（前は、こぶのように目立った）
    { const eg = g.createLinearGradient(0, 0, W, 0); eg.addColorStop(0, 'rgba(90,70,40,.22)'); eg.addColorStop(.04, 'rgba(90,70,40,0)'); eg.addColorStop(.96, 'rgba(90,70,40,0)'); eg.addColorStop(1, 'rgba(90,70,40,.22)'); g.fillStyle = eg; g.fillRect(0, 0, W, H); } // [98] 両はしの丸み（かどがかげになる）
    g.fillStyle = 'rgba(80,60,30,.2)'; g.fillRect(0, H * .9, W, H * .1); });
  return pf1(kind, W, H); }; }
{ const pf0 = paintFace; paintFace = function (kind, W, H) { if (kind !== 'tansu2') return pf0(kind, W, H); return artCanvas('face|tansu2b', W * 2, H * 2, (g, W, H) => {
  /* 2026-11-17 ホーム画面の第 2 段（オーナー「タンスなど、まだごわごわしてる」）：桐たんすを作り直し。絵を 2 倍の細かさに。
     [78] 桐の柾目（まっすぐで細い木目） [79] 引き出しごとの色のちがい [80] 引き出しのふちの面取り（上と左は光、下と右はかげ） [81] 引き出しのすき間の深いかげ
     [82] 外わくの木の厚み [83] わらび手の取っ手（細く、つや） [84] 取っ手の下に落ちるかげ [85] 座金の菊の形の彫り [86] 錠前の鍵穴 [87] すみの金具の透かしと鋲 [88] 窓からの光の、ななめのつや */
  const grain = (x, y, w, h, seed) => { const r = rnd(seed * 31 + 7); for (let k = 0; k < w / 3; k++) { const xx = x + r() * w, a = .04 + r() * .08; g.fillStyle = `rgba(120,78,40,${a.toFixed(3)})`; g.fillRect(xx, y, .8 + r() * 1.2, h); } for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(255,240,220,.08)'; g.fillRect(x + r() * w, y, 2 + r() * 4, h); } };
  const wood = (x, y, w, h, seed, k) => { g.fillStyle = vgrad(g, y, y + h, [[0, shadeHex('#DCBC92', 1.04 * k)], [1, shadeHex('#C9A274', .96 * k)]]); g.fillRect(x, y, w, h); grain(x, y, w, h, seed); };
  g.fillStyle = '#7A5230'; g.fillRect(0, 0, W, H); wood(W * .015, H * .008, W * .97, H * .984, 3, .9); // [82]
  g.fillStyle = 'rgba(90,60,30,.25)'; g.fillRect(W * .015, H * .008, W * .97, 3); g.fillRect(W * .015, H * .008, 3, H * .984);
  const rows = [[.03, .2, 2], [.22, .43, 1], [.45, .66, 1], [.68, .955, 1]];
  rows.forEach(([v0, v1, n], ri) => { for (let c = 0; c < n; c++) { const x0 = W * (.05 + c * .46), w = n === 2 ? W * .44 : W * .9, y0 = H * v0, h = H * (v1 - v0), k = .96 + ((ri * 3 + c * 5) % 7) * .012;
    g.fillStyle = 'rgba(40,22,8,.7)'; g.fillRect(x0 - 3, y0 - 3, w + 6, h + 6); wood(x0, y0, w, h, ri * 7 + c, k); // [79] [81]
    g.fillStyle = 'rgba(255,244,222,.55)'; g.fillRect(x0, y0, w, 3); g.fillRect(x0, y0, 3, h); g.fillStyle = 'rgba(70,40,15,.35)'; g.fillRect(x0, y0 + h - 4, w, 4); g.fillRect(x0 + w - 3, y0, 3, h); // [80]
    const hx = x0 + w / 2, hy = y0 + h * .46, hw = W * .085;
    g.fillStyle = '#2A2420'; g.beginPath(); for (let a = 0; a < 16; a++) { const rr = (a % 2 ? .82 : 1) * hw * .62, ang = a / 16 * 6.283; g.lineTo(hx + Math.cos(ang) * rr * 1.5, hy - H * .006 + Math.sin(ang) * rr * .55); } g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.ellipse(hx - hw * .3, hy - H * .012, hw * .4, H * .006, 0, 0, 7); g.fill(); // [85] 菊の形の座金
    g.strokeStyle = 'rgba(40,22,8,.35)'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx - hw, hy + 4); g.quadraticCurveTo(hx - hw * .9, hy + H * .055 + 4, hx, hy + H * .05 + 4); g.quadraticCurveTo(hx + hw * .9, hy + H * .055 + 4, hx + hw, hy + 4); g.stroke(); // [84]
    g.strokeStyle = '#1A1512'; g.lineWidth = 5; g.beginPath(); g.moveTo(hx - hw, hy); g.quadraticCurveTo(hx - hw * .9, hy + H * .055, hx, hy + H * .05); g.quadraticCurveTo(hx + hw * .9, hy + H * .055, hx + hw, hy); g.stroke(); for (const sx of [-1, 1]) { g.beginPath(); g.arc(hx + sx * hw, hy - 2, 3.5, 0, 7); g.fillStyle = '#1A1512'; g.fill(); }
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(hx - hw * .7, hy + H * .036); g.quadraticCurveTo(hx, hy + H * .048, hx + hw * .7, hy + H * .036); g.stroke(); // [83]
    if (ri === 1) { const ly = y0 + h * .18; g.fillStyle = '#2A2420'; g.beginPath(); g.ellipse(hx, ly, W * .035, H * .022, 0, 0, 7); g.fill(); g.fillStyle = '#C9A030'; g.beginPath(); g.arc(hx, ly - H * .004, 3, 0, 7); g.fill(); g.fillRect(hx - 1.2, ly - H * .004, 2.4, H * .015); } } }); // [86]
  for (const [x, y, fx, fy] of [[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]]) { const s = W * .085; g.fillStyle = '#2A2420'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + fx * s, y); g.lineTo(x + fx * s * .7, y + fy * s * .45); g.lineTo(x + fx * s * .45, y + fy * s * .7); g.lineTo(x, y + fy * s); g.closePath(); g.fill(); g.fillStyle = '#C9B48A'; g.beginPath(); g.arc(x + fx * s * .38, y + fy * s * .38, 3.2, 0, 7); g.fill(); g.fillStyle = '#7A6A50'; g.beginPath(); g.arc(x + fx * s * .7, y + fy * s * .15, 2.2, 0, 7); g.arc(x + fx * s * .15, y + fy * s * .7, 2.2, 0, 7); g.fill(); } // [87]
  const sh = g.createLinearGradient(0, 0, W, H); sh.addColorStop(0, 'rgba(255,248,230,0)'); sh.addColorStop(.55, 'rgba(255,248,230,.14)'); sh.addColorStop(.62, 'rgba(255,248,230,0)'); g.fillStyle = sh; g.fillRect(0, 0, W, H); // [88]
}); }; }
// [34〜36] たたんだ布団（部屋のすみ）：たたみ目のふくらみと、しまの柄・上にたたんだパジャマ
{ const f0 = PROP_ART.futon; PROP_ART.futon = (n, v) => { const c = f0(n, v); if (c && !c.__plus) { const g = c.getContext('2d'), W = c.width, H = c.height;
  g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 2; for (const y of [.72, .58, .44]) { g.beginPath(); g.moveTo(W * .1, H * y); g.quadraticCurveTo(W * .5, H * (y - .03), W * .9, H * y); g.stroke(); } // [34] たたみ目の光
  g.strokeStyle = 'rgba(40,60,100,.25)'; g.lineWidth = 3; for (let x = W * .14; x < W * .9; x += W * .09) { g.beginPath(); g.moveTo(x, H * .33); g.lineTo(x + 3, H * .44); g.stroke(); } // [35] 掛けぶとんのしま
  g.fillStyle = '#9CC2DA'; rrect(g, W * .58, H * .08, W * .24, H * .1, 6); g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(W * .6, H * .1, W * .2, 2); c.__plus = 1; } return c; }; } // [36] たたんだパジャマ
// [37〜39] 行灯：和紙の光のにじみ、木のわくのつや、床に落ちる光の輪
{ const a0 = PROP_ART.andon; if (a0) PROP_ART.andon = (n, v) => { const c = a0(n, v); if (c && !c.__plus) { const g = c.getContext('2d'), W = c.width, H = c.height;
  AP.gloss(g, W * .5, H * .5, W * .3, H * .3, .25); g.fillStyle = 'rgba(255,240,215,.3)'; for (const x of [.22, .74]) g.fillRect(W * x, H * .1, 2, H * .82); g.fillStyle = 'rgba(255,220,150,.2)'; g.beginPath(); g.ellipse(W / 2, H * .97, W * .45, H * .03, 0, 0, 7); g.fill(); c.__plus = 1; } return c; }; }
// [40〜42] つり下げの和紙のあかり：竹ひごの輪、上のかさの金具、中の電球のぼんやりした光
{ const p0 = PROP_ART.pendant; if (p0) PROP_ART.pendant = (n, v) => { const c = p0(n, v); if (c && !c.__plus) { const g = c.getContext('2d'), W = c.width, H = c.height;
  g.strokeStyle = 'rgba(150,120,80,.35)'; g.lineWidth = 1; for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(W / 2, H * (.3 + k * .085), W * .45 * Math.sin(Math.PI * (k + 1) / 8), H * .02, 0, 0, Math.PI); g.stroke(); }
  g.fillStyle = '#6A4A2A'; g.beginPath(); g.ellipse(W / 2, H * .22, W * .1, H * .025, 0, 0, 7); g.fill(); { const lg = g.createRadialGradient(W / 2, H * .6, 2, W / 2, H * .6, W * .22); lg.addColorStop(0, 'rgba(255,250,225,.7)'); lg.addColorStop(1, 'rgba(255,250,225,0)'); g.fillStyle = lg; g.fillRect(0, 0, W, H); } c.__plus = 1; } return c; }; }
// [59〜62] ちゃぶ台：マグのゆげ、新聞のたたみ目と見出し、木の天板の映りこみ、脚のかげ
{ const l0 = PROP_ART.lowtable; if (l0) PROP_ART.lowtable = (n, v) => { const c = l0(n, v); if (c && !c.__plus) { const g = c.getContext('2d'), W = c.width, H = c.height;
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2.5; g.lineCap = 'round'; for (const [x, k] of [[.34, 1], [.38, -1]]) { g.beginPath(); g.moveTo(W * x, H * .1); g.bezierCurveTo(W * (x + k * .03), H * .04, W * (x - k * .02), -H * .01, W * (x + k * .015), -H * .05); g.stroke(); }
  g.save(); g.translate(W * .64, H * .36); g.rotate(-.12); g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(-W * .11, -H * .055, W * .1, H * .03); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -H * .07); g.lineTo(0, H * .05); g.stroke(); g.restore();
  AP.gloss(g, W * .55, H * .28, W * .1, H * .02, .3); g.fillStyle = 'rgba(0,0,0,.18)'; for (const x of [.2, .8]) { g.beginPath(); g.ellipse(W * x, H * .9, 10, 3, 0, 0, 7); g.fill(); } c.__plus = 1; } return c; }; }

/* ================= 東京の道ならではの物（2026-11-17 景色 31〜50） =================
   オーナー：「東京のリアルな地形や場所や景色などに矛盾なく、質や再現度が高く」。日本の道で本当によく見る物を足す（会社のマーク・商標は出さない）。
   カーブミラー（オレンジの柱に丸い鏡）／道路標識（止まれの赤い逆三角・進入禁止・一方通行・速度 30）／消火栓の赤い標識と黄色いふた／バス停（丸い標識・時刻表・ベンチ） */
// [31〜34] カーブミラー：オレンジの柱、丸い凸面の鏡（ふちはオレンジ）、鏡にうつる道とまわりの景色（ゆがんで丸い）、上のフード
function paintCMirror(g, W, H, night, v) { const dir = v === 'L' ? -1 : 1, x0 = W / 2, my = H * .2, R = W * .32;
  const pg = g.createLinearGradient(x0 - 6, 0, x0 + 6, 0); pg.addColorStop(0, '#B8501C'); pg.addColorStop(.5, '#FF9A4A'); pg.addColorStop(1, '#A2461A'); g.fillStyle = pg; g.fillRect(x0 - 5, my, 10, H * .8); // [31] オレンジの柱
  g.fillStyle = '#2B2B2B'; g.fillRect(x0 - 8, H * .96, 16, H * .04); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x0, H - 3, 16, 3, 0, 0, 7); g.fill();
  g.fillStyle = '#E87A2E'; g.beginPath(); g.arc(x0, my, R + 6, 0, 7); g.fill(); // [32] 鏡のふち
  g.save(); g.beginPath(); g.arc(x0, my, R, 0, 7); g.clip(); const sk = g.createLinearGradient(0, my - R, 0, my + R); sk.addColorStop(0, night ? '#1C2440' : '#BFD6EA'); sk.addColorStop(.5, night ? '#2A3050' : '#E6EEF4'); sk.addColorStop(.55, night ? '#26262C' : '#8A8C90'); sk.addColorStop(1, night ? '#1A1A1E' : '#6E7076'); g.fillStyle = sk; g.fillRect(x0 - R, my - R, R * 2, R * 2);
  g.fillStyle = night ? '#2E3448' : '#C9BFAE'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(x0 + sd * R, my - R * .5); g.quadraticCurveTo(x0 + sd * R * .4, my - R * .1, x0 + sd * R * .3, my + R * .1); g.lineTo(x0 + sd * R, my + R); g.closePath(); g.fill(); } // [33] 鏡にうつる、丸くゆがんだ道と家
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.setLineDash([5, 5]); g.beginPath(); g.moveTo(x0, my + R); g.quadraticCurveTo(x0 - R * .05, my + R * .3, x0, my + R * .05); g.stroke(); g.setLineDash([]);
  g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(x0 - R * .4, my - R * .45, R * .35, R * .14, -.6, 0, 7); g.fill(); g.restore(); // 鏡のつや
  g.fillStyle = '#C8601E'; g.beginPath(); g.arc(x0, my, R + 6, Math.PI * 1.05, Math.PI * 1.95); g.lineTo(x0 + R * .8, my - R - 12); g.lineTo(x0 - R * .8, my - R - 12); g.closePath(); g.fill(); } // [34] 上のフード（雨よけ）
// [35〜41] 道路標識：青い丸の柱の上に、止まれ（赤い逆三角・白い字）・進入禁止（赤い丸に白い横棒）・一方通行（青い四角に白い矢印）・速度 30（赤いふちの丸）。裏は灰色、留め金具
function paintRoadSign(g, W, H, night, v) { const kind = v === 'R' ? 'speed' : v === 'L' ? 'stop' : (String(v).split('|')[1] || 'stop'), x0 = W / 2, sy = H * .18, R = W * .36;
  const pg = g.createLinearGradient(x0 - 4, 0, x0 + 4, 0); pg.addColorStop(0, '#7A7E84'); pg.addColorStop(.5, '#D9DCDF'); pg.addColorStop(1, '#6A6E74'); g.fillStyle = pg; g.fillRect(x0 - 3.5, sy, 7, H - sy); // [35] 細い鉄の柱
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x0, H - 3, 12, 3, 0, 0, 7); g.fill();
  g.fillStyle = '#5A5E64'; for (const y of [sy - R * .3, sy + R * .3]) g.fillRect(x0 - 8, y, 16, 4); // [36] 留め金具
  const lit = night ? 1.25 : 1, c = (h) => shadeHex(h, lit);
  if (kind === 'stop') { g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(x0 - R * 1.08, sy - R * .62); g.lineTo(x0 + R * 1.08, sy - R * .62); g.lineTo(x0, sy + R * 1.05); g.closePath(); g.fill(); g.fillStyle = c('#D7262E'); g.beginPath(); g.moveTo(x0 - R, sy - R * .56); g.lineTo(x0 + R, sy - R * .56); g.lineTo(x0, sy + R * .95); g.closePath(); g.fill(); // [37] 止まれ：赤い逆三角と白いふち
    g.fillStyle = '#FFFFFF'; g.font = `900 ${Math.round(R * .42)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('止まれ', x0, sy - R * .16); }
  else if (kind === 'noentry') { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x0, sy, R + 3, 0, 7); g.fill(); g.fillStyle = c('#D7262E'); g.beginPath(); g.arc(x0, sy, R, 0, 7); g.fill(); g.fillStyle = '#FFFFFF'; g.fillRect(x0 - R * .7, sy - R * .16, R * 1.4, R * .32); } // [38] 進入禁止
  else if (kind === 'oneway') { g.fillStyle = '#FFFFFF'; rrect(g, x0 - R * 1.05, sy - R * .5, R * 2.1, R, 4); g.fill(); g.fillStyle = c('#1E5AA8'); rrect(g, x0 - R, sy - R * .45, R * 2, R * .9, 3); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(x0 - R * .7, sy - R * .1); g.lineTo(x0 + R * .3, sy - R * .1); g.lineTo(x0 + R * .3, sy - R * .28); g.lineTo(x0 + R * .8, sy); g.lineTo(x0 + R * .3, sy + R * .28); g.lineTo(x0 + R * .3, sy + R * .1); g.lineTo(x0 - R * .7, sy + R * .1); g.closePath(); g.fill(); } // [39] 一方通行
  else { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x0, sy, R, 0, 7); g.fill(); g.strokeStyle = c('#D7262E'); g.lineWidth = R * .16; g.beginPath(); g.arc(x0, sy, R * .9, 0, 7); g.stroke(); g.fillStyle = c('#1E5AA8'); g.font = `900 ${Math.round(R * .8)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('30', x0, sy + R * .04); } // [40] 速度 30
  g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(x0 - R * .4, sy - R * .35, R * .3, R * .1, -.5, 0, 7); g.fill(); } // [41] 反射シートのつや（夜は明るく光る）
// [42〜45] 消火栓の標識：赤い丸に白い「消火栓」、柱の赤と白、足もとの黄色いふた、歩道の白いマーク
function paintHydrant(g, W, H, night) { const x0 = W / 2, sy = H * .16, R = W * .3;
  for (let y = sy; y < H; y += 14) { g.fillStyle = Math.floor((y - sy) / 14) % 2 ? '#F2F2F2' : '#D7262E'; g.fillRect(x0 - 3.5, y, 7, Math.min(14, H - y)); } // [42] 赤と白の柱
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x0, sy, R + 3, 0, 7); g.fill(); g.fillStyle = night ? '#FF3A3A' : '#D7262E'; g.beginPath(); g.arc(x0, sy, R, 0, 7); g.fill(); g.fillStyle = '#FFFFFF'; g.font = `900 ${Math.round(R * .5)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('消火', x0, sy - R * .25); g.fillText('栓', x0, sy + R * .32); // [43] 赤い丸の標識
  g.fillStyle = '#E8C23A'; g.beginPath(); g.ellipse(x0 + W * .18, H - 5, W * .16, 5, 0, 0, 7); g.fill(); g.strokeStyle = '#8A6A10'; g.lineWidth = 1; g.beginPath(); g.ellipse(x0 + W * .18, H - 5, W * .1, 3, 0, 0, 7); g.stroke(); // [44] 足もとの黄色いふた
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x0, H - 3, 10, 3, 0, 0, 7); g.fill(); } // [45] 柱のかげ
// [46〜50] バス停：丸い標識の板（行き先の帯）、時刻表のケース、柱の重い台、となりのベンチ、夜は時刻表のあかり
function paintBusStop(g, W, H, night) { const x0 = W * .32, sy = H * .14, R = W * .16;
  g.fillStyle = '#2B2B2B'; g.fillRect(x0 - W * .08, H * .92, W * .16, H * .08); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(x0 - W * .08, H * .92, W * .16, 2); // [46] 柱の重い台
  const pg = g.createLinearGradient(x0 - 4, 0, x0 + 4, 0); pg.addColorStop(0, '#7A7E84'); pg.addColorStop(.5, '#E3E6E8'); pg.addColorStop(1, '#6A6E74'); g.fillStyle = pg; g.fillRect(x0 - 3.5, sy, 7, H * .78);
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x0, sy, R + 3, 0, 7); g.fill(); g.fillStyle = '#2E7A4E'; g.beginPath(); g.arc(x0, sy, R, 0, 7); g.fill(); g.fillStyle = '#FFFFFF'; g.font = `900 ${Math.round(R * .5)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('バス', x0, sy - R * .1); g.fillRect(x0 - R * .7, sy + R * .32, R * 1.4, R * .12); // [47] 丸い標識と帯
  g.fillStyle = night ? '#FFF6D8' : '#F4F4F0'; rrect(g, x0 - W * .09, H * .32, W * .18, H * .26, 3); g.fill(); g.strokeStyle = '#5A5E64'; g.lineWidth = 2; g.stroke(); g.fillStyle = 'rgba(0,0,0,.45)'; for (let k = 0; k < 9; k++) g.fillRect(x0 - W * .07, H * (.35 + k * .024), W * (.05 + (k % 3) * .03), 1.5); // [48] 時刻表のケースと時刻の字
  if (night) { g.fillStyle = 'rgba(255,240,200,.25)'; g.beginPath(); g.arc(x0, H * .45, W * .2, 0, 7); g.fill(); } // [50] 夜は時刻表のあかり
  g.fillStyle = '#7A8088'; g.fillRect(W * .55, H * .8, W * .38, H * .04); g.fillRect(W * .58, H * .84, 4, H * .14); g.fillRect(W * .88, H * .84, 4, H * .14); g.fillStyle = '#9AA4AE'; g.fillRect(W * .55, H * .72, W * .38, H * .03); // [49] となりのベンチ
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(W / 2, H - 3, W * .4, 4, 0, 0, 7); g.fill(); }
// 2026-11-17 景色 63〜67：ごみ集積所（住宅街の道ばた。緑の網をかぶせたごみ袋の山）
function paintGomi(g, W, H, night) { const base = H - 8, sh = night ? .55 : 1, c = (h) => shadeHex(h, sh);
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(W / 2, base + 3, W * .46, 7, 0, 0, 7); g.fill(); // [67] 網とごみ袋のかげ
  const bags = [[.2, .62, .2, '#EEF1F2'], [.42, .55, .24, '#DDE9F0'], [.66, .6, .21, '#F2F2EE'], [.83, .68, .15, '#E4ECEF'], [.32, .78, .18, '#F4F3EF'], [.56, .76, .2, '#D9E6EE'], [.76, .8, .16, '#EEF0EE']];
  for (const [x, y, r, col] of bags) { const cx = W * x, cy = H * y, rx = W * r * .62, ry = H * r * 1.05, gr = g.createRadialGradient(cx - rx * .3, cy - ry * .4, 2, cx, cy, rx * 1.2); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(.5, c(col)); gr.addColorStop(1, c('#9AA6AE')); g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(80,90,100,.35)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx - rx * .2, cy - ry * .95); g.quadraticCurveTo(cx, cy - ry * 1.25, cx + rx * .25, cy - ry * .9); g.stroke(); g.beginPath(); g.moveTo(cx - rx * .5, cy - ry * .1); g.lineTo(cx - rx * .1, cy + ry * .5); g.stroke(); } // [64] 半透明のごみ袋のふくらみとしわ・結び目
  g.save(); g.beginPath(); g.moveTo(W * .04, base); g.bezierCurveTo(W * .04, H * .3, W * .3, H * .3, W * .5, H * .32); g.bezierCurveTo(W * .75, H * .32, W * .97, H * .38, W * .96, base); g.closePath(); g.fillStyle = night ? 'rgba(20,65,35,.32)' : 'rgba(40,130,70,.32)'; g.fill(); g.clip();
  g.strokeStyle = night ? 'rgba(15,55,30,.85)' : 'rgba(30,110,60,.85)'; g.lineWidth = 1.3; g.beginPath(); for (let k = -H; k < W + H; k += 7) { g.moveTo(k, 0); g.lineTo(k + H, H); g.moveTo(k + H, 0); g.lineTo(k, H); } g.stroke(); g.restore(); // [63] 目の細かい緑の網
  g.fillStyle = c('#2F5FA8'); rrect(g, W * .03, base - 7, W * .94, 8, 4); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(W * .05, base - 6, W * .9, 2); // [65] 網のすその青いおもり
  g.fillStyle = c('#7A7E84'); g.fillRect(W * .9, H * .08, 4, base - H * .08); g.fillStyle = c('#FFFFFF'); rrect(g, W * .74, H * .06, W * .24, H * .26, 3); g.fill(); g.strokeStyle = c('#2E7A4E'); g.lineWidth = 2; g.stroke(); g.fillStyle = c('#2E7A4E'); g.fillRect(W * .74, H * .06, W * .24, H * .07); g.fillStyle = '#FFFFFF'; g.font = `900 ${Math.round(H * .05)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ごみ集積所', W * .86, H * .095, W * .22);
  g.fillStyle = c('#3A3A3A'); g.font = `700 ${Math.round(H * .045)}px sans-serif`; g.fillText('燃やすごみ', W * .86, H * .17, W * .22); g.fillText('月・木', W * .86, H * .24, W * .22); } // [66] 「ごみ集積所」の札と曜日
// 2026-11-17 景色 68〜73：下町の軒先（エアコンの室外機・配管・植木鉢の列・発泡スチロールの箱の植木・じょうろ）
function paintNoki(g, W, H, night) { const base = H - 6, sh = night ? .5 : 1, c = (h) => shadeHex(h, sh);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(W / 2, base + 2, W * .48, 6, 0, 0, 7); g.fill(); // [73] 軒先のかげ
  const ax = W * .05, aw = W * .42, ah = H * .5, ay = base - ah; { const gr = g.createLinearGradient(0, ay, 0, base); gr.addColorStop(0, c('#F1F0EA')); gr.addColorStop(1, c('#C9C7BF')); g.fillStyle = gr; } rrect(g, ax, ay, aw, ah, 4); g.fill(); g.strokeStyle = c('#9A988F'); g.lineWidth = 1.5; g.stroke();
  const fx = ax + aw * .38, fy = ay + ah * .5, fr = ah * .38; g.fillStyle = c('#4A4C50'); g.beginPath(); g.arc(fx, fy, fr, 0, 7); g.fill(); g.strokeStyle = c('#D6D4CC'); g.lineWidth = 1.6; g.beginPath(); for (let k = -4; k <= 4; k++) { const yy = fy + k * fr / 4.5, dx = Math.sqrt(Math.max(0, fr * fr - (yy - fy) ** 2)); g.moveTo(fx - dx, yy); g.lineTo(fx + dx, yy); } g.stroke(); g.fillStyle = c('#8A8C90'); g.beginPath(); g.arc(fx, fy, fr * .18, 0, 7); g.fill(); // [68] 室外機：ファンの丸と格子
  g.fillStyle = c('#B5B3AB'); for (let k = 0; k < 5; k++) g.fillRect(ax + aw * .76, ay + ah * (.18 + k * .14), aw * .16, 2); g.fillStyle = c('#6E6C66'); g.fillRect(ax + 4, base - 3, 8, 4); g.fillRect(ax + aw - 12, base - 3, 8, 4);
  g.strokeStyle = c('#F4F3EE'); g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax + aw - 6, ay + ah * .3); g.quadraticCurveTo(ax + aw + 10, ay + ah * .3, ax + aw + 8, ay - 10); g.lineTo(ax + aw + 8, 0); g.stroke(); g.strokeStyle = 'rgba(120,120,110,.5)'; g.lineWidth = 1; g.beginPath(); for (let y = 6; y < ay; y += 5) { g.moveTo(ax + aw + 5, y); g.lineTo(ax + aw + 11, y + 3); } g.stroke(); g.lineCap = 'butt'; // [69] 白いテープを巻いた配管
  const pots = [[.58, .2, '#B4643A'], [.7, .17, '#C0714A'], [.8, .2, '#A85A34'], [.9, .15, '#B9764C']];
  for (const [x, r, col] of pots) { const cx = W * x, pw = W * r * .5, ph = H * .2, py = base - ph; g.fillStyle = c('#2F6B34'); for (let k = 0; k < 7; k++) { const a = -2.6 + k * .35; g.beginPath(); g.ellipse(cx + Math.cos(a) * pw * .6, py - H * .06 + Math.sin(a) * H * .08, pw * .32, H * .05, a, 0, 7); g.fill(); } g.fillStyle = c('#4E8F48'); g.beginPath(); g.ellipse(cx, py - H * .08, pw * .5, H * .06, 0, 0, 7); g.fill();
    const gr = g.createLinearGradient(cx - pw / 2, 0, cx + pw / 2, 0); gr.addColorStop(0, shadeHex(col, .8 * sh)); gr.addColorStop(.4, shadeHex(col, 1.15 * sh)); gr.addColorStop(1, shadeHex(col, .7 * sh)); g.fillStyle = gr; g.beginPath(); g.moveTo(cx - pw / 2, py); g.lineTo(cx + pw / 2, py); g.lineTo(cx + pw * .38, base); g.lineTo(cx - pw * .38, base); g.closePath(); g.fill(); g.fillStyle = shadeHex(col, .9 * sh); g.fillRect(cx - pw / 2 - 2, py - 2, pw + 4, 6); } // [70] 素焼きの植木鉢の列
  g.fillStyle = c('#F4F4F2'); g.fillRect(W * .49, base - H * .16, W * .14, H * .16); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(W * .49, base - H * .16, W * .14, 3); g.fillStyle = c('#6E9E3A'); for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(W * (.51 + k * .025), base - H * .19, 4, 9, (k - 2) * .3, 0, 7); g.fill(); } // [71] 発泡スチロールの箱の植木（ねぎ）
  g.fillStyle = c('#3E8ACC'); g.beginPath(); g.ellipse(W * .96, base - H * .07, W * .03, H * .07, 0, 0, 7); g.fill(); g.strokeStyle = c('#3E8ACC'); g.lineWidth = 3; g.beginPath(); g.moveTo(W * .94, base - H * .1); g.lineTo(W * .9, base - H * .2); g.stroke(); } // [72] じょうろ
Object.assign(PROP_ART, {
  cmirror: (n, v) => artCanvas('pcmirror|' + v + n, 140, 400, (g, w, h) => paintCMirror(g, w, h, n, v)),
  roadsign: (n, v) => artCanvas('proadsign|' + v + n, 120, 300, (g, w, h) => paintRoadSign(g, w, h, n, v)),
  hydrant: (n, v) => artCanvas('phydrant|' + n, 100, 260, (g, w, h) => paintHydrant(g, w, h, n)),
  busstop: (n, v) => artCanvas('pbusstop|' + n, 240, 330, (g, w, h) => paintBusStop(g, w, h, n)),
  gomi: (n, v) => artCanvas('pgomi|' + n, 300, 190, (g, w, h) => paintGomi(g, w, h, n)),
  noki: (n, v) => artCanvas('pnoki|' + n, 320, 230, (g, w, h) => paintNoki(g, w, h, n)),
});
Object.assign(PROP_DIM, { cmirror: { w: 1.0, h: 3.0, off: 0 }, roadsign: { w: .9, h: 2.6, off: 0 }, hydrant: { w: .7, h: 2.0, off: 0 }, busstop: { w: 1.9, h: 2.6, off: 0 }, gomi: { w: 1.7, h: 1.1, off: 0 }, noki: { w: 1.8, h: 1.3, off: 0 } });
/* 2026-11-17 景色 105〜111：住宅街の電柱（前は、コンクリートの柱・腕木・変圧器・黄色い札だけ） */
function paintPolePlus(g, W, H, night) { paintPole(g, W, H); const x = W / 2;
  g.fillStyle = '#5B6066'; for (let k = 0; k < 7; k++) { const y = H * (.24 + k * .045), sd = k % 2 ? 1 : -1; g.fillRect(x + sd * 6, y, sd * 9, 3); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x + sd * 6, y + 3, sd * 9, 1); g.fillStyle = '#5B6066'; } // [105] 上の方の足場ボルト（互い違い）
  g.strokeStyle = '#3A3A3A'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + 4, H * .2); g.lineTo(W - 4, H); g.stroke(); g.fillStyle = '#F2C230'; g.save(); g.translate(W - 14, H - 40); g.rotate(Math.atan2(H * .8, W / 2 - 8)); g.fillRect(-36, -4, 72, 8); g.fillStyle = '#2B2B2B'; for (let k = -34; k < 36; k += 12) g.fillRect(k, -4, 6, 8); g.restore(); // [106] 支線と、黄色と黒のしまのカバー
  g.fillStyle = '#1E5AA8'; rrect(g, x - 9, H * .42, 18, 40, 2); g.fill(); g.fillStyle = '#FFFFFF'; g.font = '700 9px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('2丁目', x, H * .42 + 13, 16); g.font = '900 12px sans-serif'; g.fillText('5', x, H * .42 + 29); // [107] 住所の表示板（青い板に白い字）
  g.fillStyle = '#E8E6DF'; g.fillRect(x - 5, H * .33, 10, 12); g.fillStyle = '#2B2B2B'; g.fillRect(x - 3, H * .33 + 3, 6, 1.5); g.fillRect(x - 3, H * .33 + 7, 6, 1.5); // [108] 電柱の番号札
  g.strokeStyle = '#2B2B2B'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 6, H * .16); g.quadraticCurveTo(x - 30, H * .24, 0, H * .27); g.moveTo(x - 6, H * .18); g.quadraticCurveTo(x - 26, H * .25, 0, H * .3); g.stroke(); g.fillStyle = '#3A3A3A'; g.fillRect(x - 8, H * .15, 16, 7); // [109] ケーブルの束と、家へたれ下がる引き込み線
  g.fillStyle = '#9A968C'; g.fillRect(x - 13, H - 8, 26, 8); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x - 13, H - 8, 26, 2); // [110] 根もとのコンクリート
  const ly = H * .29; g.strokeStyle = '#8B8F93'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 5, ly); g.lineTo(x - 28, ly - 8); g.stroke(); g.fillStyle = '#D9DCDF'; rrect(g, x - 38, ly - 12, 16, 7, 3); g.fill(); g.fillStyle = night ? '#FFFFFF' : '#C9CDD2'; g.fillRect(x - 36, ly - 6, 12, 2.5); // [111] 防犯灯（夜は光る）
  if (night) { const gl = g.createRadialGradient(x - 30, ly - 4, 1, x - 30, ly - 4, 26); gl.addColorStop(0, 'rgba(235,245,255,.85)'); gl.addColorStop(1, 'rgba(235,245,255,0)'); g.fillStyle = gl; g.fillRect(x - 58, ly - 30, 56, 56); } }
PROP_ART.pole = (n) => artCanvas('ppole2|' + (n ? 1 : 0), 120, 560, (g, w, h) => paintPolePlus(g, w, h, n));

/* 2026-11-17 景色 131〜135：オフィス街・駅前の歩道（車止め・案内地図） */
function paintBollards(g, W, H, night) { for (let k = 0; k < 3; k++) { const x = W * (.17 + k * .33), bw = W * .09, top = H * .22;
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + 4, H - 4, bw * 1.3, 5, 0, 0, 7); g.fill();
    const gr = g.createLinearGradient(x - bw, 0, x + bw, 0); gr.addColorStop(0, '#6E747A'); gr.addColorStop(.35, '#F2F4F6'); gr.addColorStop(.6, '#B9BEC4'); gr.addColorStop(1, '#5A6066'); g.fillStyle = gr; g.fillRect(x - bw, top, bw * 2, H - top - 4); // [131] ステンレスの車止め
    g.beginPath(); g.ellipse(x, top, bw, bw * .7, 0, Math.PI, 0); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(x - bw * .3, top - bw * .2, bw * .3, bw * .15, 0, 0, 7); g.fill(); // [132] 頭の丸みと光
    g.fillStyle = night ? '#FFE27A' : '#E8C23A'; g.fillRect(x - bw, top + H * .12, bw * 2, H * .07); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x - bw * .4, top + H * .12, bw * .3, H * .07); } } // [133] 黄色い反射の帯
function paintAreaMap(g, W, H, night) { const x0 = W * .1, x1 = W * .9, y0 = H * .1, y1 = H * .62;
  g.fillStyle = '#4A5058'; g.fillRect(W * .2, y1, W * .07, H - y1); g.fillRect(W * .73, y1, W * .07, H - y1); g.fillStyle = '#5A626C'; g.fillRect(x0 - 6, y0 - 14, x1 - x0 + 12, 12); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x0, y0 - 2, x1 - x0, 4); // [135] 案内板の屋根
  g.fillStyle = '#3A4048'; g.fillRect(x0 - 4, y0 - 4, x1 - x0 + 8, y1 - y0 + 8); g.fillStyle = night ? '#FFFCEB' : '#F4F1E8'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.fillStyle = night ? '#CFE6C2' : '#BFD9B0'; g.fillRect(x0 + (x1 - x0) * .55, y0 + 10, (x1 - x0) * .3, (y1 - y0) * .35); g.fillStyle = night ? '#BFDDF2' : '#A9CDE8'; g.fillRect(x0, y0 + (y1 - y0) * .75, x1 - x0, (y1 - y0) * .1); // 地図：公園と川
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 5; g.beginPath(); for (const f of [.3, .6]) { g.moveTo(x0, y0 + (y1 - y0) * f); g.lineTo(x1, y0 + (y1 - y0) * f); g.moveTo(x0 + (x1 - x0) * f, y0); g.lineTo(x0 + (x1 - x0) * f, y1); } g.stroke(); g.fillStyle = '#C9C2B0'; for (let k = 0; k < 9; k++) g.fillRect(x0 + 6 + (k % 3) * (x1 - x0) * .3, y0 + 6 + ((k / 3) | 0) * (y1 - y0) * .3, (x1 - x0) * .2, (y1 - y0) * .18);
  g.fillStyle = '#D7262E'; g.beginPath(); g.arc(x0 + (x1 - x0) * .45, y0 + (y1 - y0) * .5, 6, 0, 7); g.fill(); g.font = `900 ${Math.round(H * .045)}px sans-serif`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('現在地', x0 + (x1 - x0) * .45 + 9, y0 + (y1 - y0) * .5); // [134] 案内地図と現在地の赤い点
  g.fillStyle = '#1E5AA8'; g.fillRect(x0, y0, x1 - x0, H * .06); g.fillStyle = '#FFFFFF'; g.font = `900 ${Math.round(H * .04)}px sans-serif`; g.textAlign = 'center'; g.fillText('周辺案内図', (x0 + x1) / 2, y0 + H * .03);
  if (night) { g.fillStyle = 'rgba(255,250,220,.18)'; g.fillRect(x0 - 10, y0 - 10, x1 - x0 + 20, y1 - y0 + 20); } } // [135] 夜は中から光る
Object.assign(PROP_ART, { bollard: (n) => artCanvas('pbollard|' + n, 200, 110, (g, w, h) => paintBollards(g, w, h, n)), areamap: (n) => artCanvas('pareamap|' + n, 220, 300, (g, w, h) => paintAreaMap(g, w, h, n)) });
Object.assign(PROP_DIM, { bollard: { w: 1.8, h: .95, off: 0 }, areamap: { w: 1.5, h: 2.1, off: 0 } });

/* [76] 座布団の横の面：ふっくらした厚み（上は光、まん中がふくらみ、下はかげ）と横の縫い目 */
{ const pf2 = paintFace; paintFace = function (kind, W, H) { if (!/^zabuSide/.test(kind)) return pf2(kind, W, H); return artCanvas('face|' + kind, W, H, (g) => {
  for (const [y0, c] of [[0, '#B4572E'], [.5, '#5E6E9E']]) { const t = H * y0, h = H * .5; g.fillStyle = vgrad(g, t, t + h, [[0, shadeHex(c, 1.15)], [.4, shadeHex(c, 1.02)], [1, shadeHex(c, .6)]]); g.fillRect(0, t, W, h);
    g.setLineDash([4, 3]); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, t + h * .45); g.lineTo(W, t + h * .45); g.stroke(); g.setLineDash([]); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, t + h - 2, W, 2); } }); }; }

/* [89] たんすの横の板：桐の柾目と、上から下への光のグラデーション [90] 横の板の継ぎ目と、手前のふちの面取りの光 [91] 下のほうの、畳からの照り返し */
{ const pf3 = paintFace; paintFace = function (kind, W, H) { if (kind !== 'tansuSide') return pf3(kind, W, H); return artCanvas('face|tansuSide', W * 2, H * 2, (g, W, H) => {
  g.fillStyle = vgrad(g, 0, H, [[0, '#B48C5E'], [.6, '#A27A4E'], [1, '#8E6A42']]); g.fillRect(0, 0, W, H); const r = rnd(77); // [92] 窓と反対を向く面なので、正面より暗く
  for (let k = 0; k < W / 2.5; k++) { g.fillStyle = `rgba(110,70,35,${(.04 + r() * .09).toFixed(3)})`; g.fillRect(r() * W, 0, .8 + r() * 1.4, H); } for (let k = 0; k < 8; k++) { g.fillStyle = 'rgba(255,240,215,.08)'; g.fillRect(r() * W, 0, 3 + r() * 5, H); }
  g.fillStyle = 'rgba(80,50,20,.3)'; g.fillRect(W * .5, 0, 1.5, H); g.fillStyle = 'rgba(255,240,215,.4)'; g.fillRect(0, 0, 4, H); g.fillRect(W - 4, 0, 4, H); g.fillStyle = 'rgba(90,60,25,.35)'; g.fillRect(0, 0, W, 5);
  const gr = g.createLinearGradient(0, H * .8, 0, H); gr.addColorStop(0, 'rgba(200,190,120,0)'); gr.addColorStop(1, 'rgba(200,190,120,.18)'); g.fillStyle = gr; g.fillRect(0, H * .8, W, H * .2); }); }; }

/* 2026-11-17 ホーム画面の第 2 段：[105] ちゃぶ台の天板の木目と、窓の光のつや [106] マグの取っ手の光 [107] つり下げのあかりの和紙のせんい [111] 写真立てのガラスの映りこみ [112] 一輪ざしのつや */
{ const l1 = PROP_ART.lowtable; if (l1) PROP_ART.lowtable = (n, v) => { const c = l1(n, v); if (c && !c.__plus2) { const g = c.getContext('2d'), W = c.width, H = c.height, r = rnd(19);
  g.save(); g.globalCompositeOperation = 'source-atop'; g.strokeStyle = 'rgba(90,55,25,.16)'; g.lineWidth = 1; for (let k = 0; k < 14; k++) { const y = H * (.3 + r() * .25); g.beginPath(); g.moveTo(W * (.05 + r() * .3), y); g.quadraticCurveTo(W * .5, y + (r() - .5) * 6, W * (.65 + r() * .3), y + (r() - .5) * 4); g.stroke(); }
  const gl = g.createLinearGradient(W * .2, 0, W * .6, 0); gl.addColorStop(0, 'rgba(255,250,235,0)'); gl.addColorStop(.5, 'rgba(255,250,235,.18)'); gl.addColorStop(1, 'rgba(255,250,235,0)'); g.fillStyle = gl; g.fillRect(0, H * .25, W, H * .3); g.restore();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.2; g.beginPath(); g.arc(W * .43, H * .2, W * .018, -1.2, .6); g.stroke(); c.__plus2 = 1; } return c; }; }
{ const p1 = PROP_ART.pendant; if (p1) PROP_ART.pendant = (n, v) => { const c = p1(n, v); if (c && !c.__plus2) { const g = c.getContext('2d'), W = c.width, H = c.height, r = rnd(23); g.save(); g.globalCompositeOperation = 'source-atop'; g.strokeStyle = 'rgba(170,145,105,.18)'; g.lineWidth = .7; for (let k = 0; k < 40; k++) { const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 4, y + (r() - .5) * 6, x + 6 + r() * 8, y + (r() - .5) * 4); g.stroke(); } g.restore(); c.__plus2 = 1; } return c; }; }
{ const pf = PROP_ART.photoFrame; PROP_ART.photoFrame = () => { const c = pf(); if (c && !c.__plus2) { const g = c.getContext('2d'), W = c.width, H = c.height; g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.moveTo(W * .2, H * .15); g.lineTo(W * .45, H * .15); g.lineTo(W * .25, H * .6); g.lineTo(W * .15, H * .6); g.closePath(); g.fill(); c.__plus2 = 1; } return c; }; }
{ const ic = PROP_ART.ichirin; PROP_ART.ichirin = () => { const c = ic(); if (c && !c.__plus2) { const g = c.getContext('2d'), W = c.width, H = c.height; g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(W * .38, H * .75, W * .05, H * .12, -.1, 0, 7); g.fill(); c.__plus2 = 1; } return c; }; }
