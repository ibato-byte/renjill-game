/* ================= 2026-11-28 景色 1000：生き物・季節の物・道の表示・池の岸など（続き） ================= docs/SCENERY-1000-2026-11-28.md */
function rxPaintPigeons(g, W, H) { const r = rnd(81); for (let i = 0; i < 8; i++) { const x = W * (.08 + r() * .84), y = H * (.55 + r() * .4), s = 9 + r() * 4, sd = r() < .5 ? -1 : 1;
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(x, y + s * .55, s * .9, 2.5, 0, 0, 7); g.fill();
  const gr = g.createLinearGradient(0, y - s, 0, y + s * .5); gr.addColorStop(0, '#8A8F99'); gr.addColorStop(1, '#5E636C'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, s, s * .55, sd * .2, 0, 7); g.fill();
  g.fillStyle = '#6E8A84'; g.beginPath(); g.ellipse(x + sd * s * .55, y - s * .45, s * .32, s * .3, 0, 0, 7); g.fill(); g.fillStyle = '#7A7F88'; g.beginPath(); g.arc(x + sd * s * .75, y - s * .75, s * .26, 0, 7); g.fill(); /* 首の玉虫色と、小さな頭 */
  g.fillStyle = '#2B2B2B'; g.fillRect(x - sd * s * 1.1, y - 2, sd * s * .4, 3); g.fillStyle = '#E8A0A0'; g.fillRect(x - 2, y + s * .45, 1.5, 4); g.fillRect(x + 2, y + s * .45, 1.5, 4); g.fillStyle = '#E8B04A'; g.beginPath(); g.arc(x + sd * s * .8, y - s * .8, 1.2, 0, 7); g.fill(); } } /* 境内・広場のハト（灰色の体・首の緑の光・赤い足） */
function rxPaintCat(g, W, H, n, v) { const c = ['#E8A050', '#3B3633', '#F4EEE4', '#8A7A6A'][(+v || 0) % 4], x = W / 2; rxShadowE(g, x, H - 5, W * .36, 5);
  g.fillStyle = c; g.beginPath(); g.ellipse(x, H * .68, W * .3, H * .22, 0, 0, 7); g.fill(); g.beginPath(); g.arc(x + W * .18, H * .38, W * .19, 0, 7); g.fill();
  for (const k of [-1, 1]) { g.beginPath(); g.moveTo(x + W * .18 + k * W * .14, H * .3); g.lineTo(x + W * .18 + k * W * .16, H * .12); g.lineTo(x + W * .18 + k * W * .03, H * .24); g.closePath(); g.fill(); } /* 三角の耳 */
  g.strokeStyle = c; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - W * .26, H * .74); g.quadraticCurveTo(x - W * .46, H * .6, x - W * .38, H * .36); g.stroke();
  if (v % 4 === 0) { g.strokeStyle = '#C8783A'; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x - W * .1 + k * 8, H * .5); g.lineTo(x - W * .12 + k * 8, H * .62); g.stroke(); } } /* 茶とらのしま */
  g.fillStyle = '#2B2B2B'; for (const k of [-1, 1]) { g.beginPath(); g.ellipse(x + W * .18 + k * W * .07, H * .37, 2, 3, 0, 0, 7); g.fill(); } g.fillStyle = '#E8A0A0'; g.beginPath(); g.arc(x + W * .18, H * .43, 2, 0, 7); g.fill(); } /* 谷根千の、店先でくつろぐ猫 */
function rxPaintTaxi(g, W, H, n) { g.fillStyle = rxCylG(g, W / 2 - 4, W / 2 + 4, '#7C8288', '#D5DADE', '#5E646A'); g.fillRect(W / 2 - 4, 60, 8, H - 64); rxShadowE(g, W / 2, H - 4, 14, 3);
  g.fillStyle = '#1E4E9A'; rrect(g, 8, 6, W - 16, 60, 6); g.fill(); g.fillStyle = n ? '#FFF6D0' : '#FFFFFF'; rrect(g, 13, 11, W - 26, 50, 4); g.fill(); g.fillStyle = '#1E4E9A'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = rxFont(17); g.fillText('タクシー', W / 2, 28, W - 34); g.font = rxFont(11, 700); g.fillText('のりば TAXI', W / 2, 48, W - 34); if (n) rxGlowC(g, W / 2, 36, 60, '255,245,210', .35); } /* タクシーのりばの札（夜は光る） */
function rxPaintNodate(g, W, H) { rxShadowE(g, W / 2, H - 5, W * .45, 7); g.fillStyle = '#3B2A20'; g.fillRect(W / 2 - 2, H * .22, 4, H * .78 - 5);
  const pg = g.createRadialGradient(W / 2, H * .22, 4, W / 2, H * .3, W * .5); pg.addColorStop(0, '#E0503E'); pg.addColorStop(1, '#A82A22'); g.fillStyle = pg; g.beginPath(); g.moveTo(W * .04, H * .34); g.quadraticCurveTo(W / 2, H * -.02, W * .96, H * .34); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,230,200,.35)'; g.lineWidth = 1; for (let k = 1; k < 12; k++) { g.beginPath(); g.moveTo(W / 2, H * .06); g.lineTo(W * .04 + W * .92 * k / 12, H * .34); g.stroke(); } /* 赤い野点傘（骨の線） */
  g.fillStyle = '#C8362A'; g.fillRect(W * .12, H * .72, W * .76, H * .08); g.fillStyle = '#8A2620'; g.fillRect(W * .12, H * .8, W * .76, 3); g.fillStyle = '#5E4434'; for (const x of [.16, .82]) g.fillRect(W * x, H * .8, 5, H * .2 - 5); } /* 赤い毛せんを敷いた縁台（茶屋の店先・庭園の茶店） */
function rxPaintShinboku(g, W, H) { rxShadowE(g, W / 2, H - 5, W * .45, 8); const tg = g.createLinearGradient(W * .3, 0, W * .7, 0); tg.addColorStop(0, '#3E2E24'); tg.addColorStop(.4, '#7A5E48'); tg.addColorStop(1, '#2E2219'); g.fillStyle = tg;
  g.beginPath(); g.moveTo(W * .22, H); g.quadraticCurveTo(W * .34, H * .7, W * .32, H * .02); g.lineTo(W * .68, H * .02); g.quadraticCurveTo(W * .66, H * .7, W * .78, H); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(W * (.36 + k * .045), H * .05); g.lineTo(W * (.35 + k * .046), H * .95); g.stroke(); } /* 太い幹とたてのしわ */
  g.strokeStyle = '#E8D8A8'; g.lineWidth = 9; g.beginPath(); g.moveTo(W * .3, H * .42); g.quadraticCurveTo(W / 2, H * .5, W * .7, H * .42); g.stroke(); g.strokeStyle = 'rgba(120,90,40,.5)'; g.lineWidth = 1.5; for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(W * (.3 + k * .05), H * .41); g.lineTo(W * (.31 + k * .05), H * .47); g.stroke(); } /* しめ縄 */
  for (const x of [.38, .5, .62]) { g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(W * x, H * .47); g.lineTo(W * x + 6, H * .52); g.lineTo(W * x, H * .56); g.lineTo(W * x + 6, H * .61); g.lineTo(W * x, H * .65); g.lineTo(W * x - 3, H * .62); g.lineTo(W * x + 2, H * .58); g.lineTo(W * x - 3, H * .53); g.closePath(); g.fill(); } } /* 紙垂（しで） */
function rxPaintKotatsu(g, W, H) { rxShadowE(g, W / 2, H - 4, W * .48, 7); const fg = g.createLinearGradient(0, H * .3, 0, H); fg.addColorStop(0, '#C86A5A'); fg.addColorStop(1, '#9A4A3E'); g.fillStyle = fg; g.beginPath(); g.moveTo(W * .04, H - 4); g.quadraticCurveTo(W * .02, H * .45, W * .14, H * .36); g.lineTo(W * .86, H * .36); g.quadraticCurveTo(W * .98, H * .45, W * .96, H - 4); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,230,200,.3)'; g.lineWidth = 1.5; for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(W * .1, H * (.4 + k * .1)); g.lineTo(W * .9, H * (.4 + k * .1)); g.stroke(); } g.fillStyle = '#B98E62'; g.fillRect(W * .06, H * .28, W * .88, H * .09); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(W * .06, H * .28, W * .88, 2); /* こたつ：ふとんと天板 */
  for (let k = 0; k < 3; k++) { const x = W * (.35 + k * .12); g.fillStyle = '#F2902E'; g.beginPath(); g.arc(x, H * .22, 9, 0, 7); g.fill(); g.fillStyle = '#4C8A3A'; g.fillRect(x - 1, H * .22 - 11, 2, 3); } } /* 天板の上のみかん */
function rxPaintSenpuki(g, W, H) { rxShadowE(g, W / 2, H - 4, W * .35, 5); g.fillStyle = '#F4F6F8'; g.beginPath(); g.ellipse(W / 2, H - 10, W * .3, 7, 0, 0, 7); g.fill(); g.fillRect(W / 2 - 4, H * .45, 8, H * .55 - 10);
  g.strokeStyle = '#C9D0D6'; g.lineWidth = 2; g.beginPath(); g.arc(W / 2, H * .3, W * .36, 0, 7); g.stroke(); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; g.beginPath(); g.moveTo(W / 2, H * .3); g.lineTo(W / 2 + Math.cos(a) * W * .36, H * .3 + Math.sin(a) * W * .36); g.stroke(); }
  g.fillStyle = 'rgba(158,208,240,.75)'; for (let k = 0; k < 3; k++) { g.save(); g.translate(W / 2, H * .3); g.rotate(k * 2.1); g.beginPath(); g.ellipse(0, -W * .17, W * .09, W * .17, 0, 0, 7); g.fill(); g.restore(); } g.fillStyle = '#9ED0F0'; g.beginPath(); g.arc(W / 2, H * .3, 6, 0, 7); g.fill(); } /* 夏の扇風機 */
function rxPaintTsukimi(g, W, H) { g.fillStyle = '#B98E62'; g.fillRect(W * .1, H - 16, W * .5, 12); g.fillStyle = '#F7F2E6'; for (let row = 0; row < 3; row++) for (let k = 0; k < 3 - row; k++) { g.beginPath(); g.arc(W * (.2 + k * .12 + row * .06), H - 24 - row * 12, 7, 0, 7); g.fill(); } /* 三方にのせた月見だんご */
  g.fillStyle = '#7A6A5A'; rrect(g, W * .66, H - 40, W * .22, 36, 6); g.fill(); g.strokeStyle = '#C9B48A'; g.lineWidth = 2; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(W * .77, H - 40); g.quadraticCurveTo(W * (.6 + k * .07), H * .3, W * (.55 + k * .08), H * .08); g.stroke(); g.fillStyle = '#E8DCC0'; g.beginPath(); g.ellipse(W * (.55 + k * .08), H * .12, 4, 10, (k - 3) * .2, 0, 7); g.fill(); } } /* ススキをいけた花びん（秋のお月見） */
function rxPaintSwanBird(g, W, H) { rxShadowE(g, W / 2, H - 4, W * .4, 4, .12); const bg = g.createLinearGradient(0, H * .4, 0, H); bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(1, '#D9DEE2'); g.fillStyle = bg; g.beginPath(); g.moveTo(W * .08, H * .7); g.quadraticCurveTo(W * .4, H * .98, W * .78, H * .72); g.quadraticCurveTo(W * .6, H * .45, W * .2, H * .55); g.closePath(); g.fill();
  g.strokeStyle = '#FFFFFF'; g.lineWidth = W * .06; g.lineCap = 'round'; g.beginPath(); g.moveTo(W * .7, H * .66); g.bezierCurveTo(W * .82, H * .4, W * .7, H * .25, W * .78, H * .16); g.stroke(); g.fillStyle = '#E8802E'; g.beginPath(); g.moveTo(W * .8, H * .14); g.lineTo(W * .93, H * .2); g.lineTo(W * .8, H * .22); g.closePath(); g.fill(); g.fillStyle = '#1E1E1E'; g.beginPath(); g.arc(W * .8, H * .15, 2.5, 0, 7); g.fill(); } /* お堀の白鳥 */
Object.assign(PROP_ART, { rxPigeons: () => artCanvas('rxpig', 240, 90, rxPaintPigeons), rxCat: (n, v) => artCanvas('rxcat|' + v, 90, 80, (g, w, h) => rxPaintCat(g, w, h, n, v)), rxTaxi: (n) => artCanvas('rxtaxi' + (n ? 1 : 0), 140, 300, (g, w, h) => rxPaintTaxi(g, w, h, n)),
  rxNodate: () => artCanvas('rxnodate', 220, 220, rxPaintNodate), rxShinboku: () => artCanvas('rxshinboku', 220, 300, rxPaintShinboku), rxKotatsu: () => artCanvas('rxkotatsu', 260, 140, rxPaintKotatsu), rxSenpuki: () => artCanvas('rxsenpuki', 110, 220, rxPaintSenpuki),
  rxTsukimi: () => artCanvas('rxtsukimi', 200, 140, rxPaintTsukimi), rxSwanB: () => artCanvas('rxswanb', 120, 90, rxPaintSwanBird) });
Object.assign(PROPS, {
  pigeons: rxOne('rxPigeons', 3.6, 2.4, .9, 3.0), cat: rxOne('rxCat', 3.9, .8, .7, 1.6, () => String((Math.random() * 4) | 0)), taxi: rxOne('rxTaxi', 3.2, 1.2, 2.6, 2.0, '', 1),
  nodate: rxOne('rxNodate', 4.0, 2.4, 2.4, 3.2), shinboku: rxOne('rxShinboku', 4.6, 2.6, 3.6, 3.4),
  kotatsu: (sd, s) => ({ w: 2.4, spr: [{ lat: sd * 3.4, s: s + 1, y: 0, w: 1.9, h: 1.0, img: rxPaintKey('rxKotatsu', ''), gnd: .8 }] }), senpuki: rxOne('rxSenpuki', 4.0, .7, 1.4, 1.4), tsukimi: rxOne('rxTsukimi', 3.9, 1.3, .9, 1.8),
  /* 季節で姿の変わる大きな木（ケヤキなど）：bigTree は いつもケヤキの夏の絵だった。th.tree の季節の色を使う */
  bigTreeS: (sd, s, th) => ({ w: 5.5, spr: [{ lat: sd * 3.4, s: s + .5, y: 0, h: 9.4, w: 7.4, img: 'canopy_' + ((th && th.bigT) || (th && th.tree) || 'zelkova'), trunk: 1, gnd: .7 }] }),
  /* 庭のしだれ桜・モミジ：季節で絵がかわる */
  shidareT: (sd, s) => { const se = RX_SEASON(); return { w: 6, spr: [{ lat: sd * 4.2, s: s + 1, y: 0, h: 8, w: 7.5, img: 'canopy_' + (se === 'spring' ? 'shidare' : se === 'winter' ? 'yanagiW' : 'shidareG'), trunk: 1, gnd: .7 }] }; },
  kaedeT: (sd, s) => { const se = RX_SEASON(); return { w: 4.6, spr: [{ lat: sd * 3.8, s: s + .6, y: 0, h: 5.8, w: 6.4, img: 'canopy_' + (se === 'autumn' ? 'kaedeA' : se === 'winter' ? 'bare' : 'kaede'), trunk: 1, gnd: .6 }] }; },
  niwaki: (sd, s) => ({ w: 5, spr: [{ lat: sd * 3.9, s: s + .4, y: 0, h: 5.4, w: 5.6, img: 'canopy_matsuN', trunk: 1, gnd: .5 }] }),
  yanagiT: (sd, s) => ({ w: 5, spr: [{ lat: sd * 3.5, s: s + .4, y: 0, h: 7.5, w: 6, img: 'canopy_' + (RX_SEASON() === 'winter' ? 'yanagiW' : 'yanagi'), trunk: 1, gnd: .5 }] }),
});
/* ---- 道・水辺の追加（rx） ---- */
Object.assign(RX_SET, {
  /* 自転車ナビマーク：車道の左のはしの青い矢羽根（東京の幹線道路に 2016 年ごろから広くひかれた） */
  bikelane(seg, sd, o) { const L = seg.len, lat = sd * (ROAD - .55), dr = sd < 0 ? 1 : -1, ch = (s0, s1) => seg.lines.push({ a: [s0, lat - .25, .016], b: [s1, lat, .016], c: '#4A86CC', w: .09 }, { a: [s1, lat, .016], b: [s0, lat + .25, .016], c: '#4A86CC', w: .09 }); /* 日本は左側通行：左の車線の矢羽根は前へ、右の車線は手前へ向く */
    for (let s = 6; s < L - 8; s += 10) { ch(s + (dr < 0 ? .8 : 0), s + (dr < 0 ? 0 : .8)); ch(s + 1.1 + (dr < 0 ? .8 : 0), s + 1.1 + (dr < 0 ? 0 : .8)); } },
  /* お堀の石垣のかわりに、本物の池の岸（自然の石・草・木）。庭園の池は城の高い石垣ではない */
  shore(seg, sd, o) { const FW = seg.th.wide || 38, L = seg.len; seg.walls = seg.walls.filter(w => !(w.pat === 'ishigaki')); seg.spr = seg.spr.filter(sp => !(sp.far && sp.img === 'canopy_pine' && Math.abs(Math.abs(sp.lat) - 40) < 2));
    for (let a = -10; a < L + 20; a += rand(4, 7)) seg.spr.push({ lat: sd * (FW + rand(-1, 2)), s: a, y: -.6, h: rand(.9, 1.4), w: rand(4, 6), img: rxPaintKey('rxStones', ''), far: 1 });
    for (let a = -6; a < L + 20; a += rand(5, 9)) seg.spr.push({ lat: sd * (FW + rand(4, 12)), s: a, y: 0, h: rand(7, 11), w: rand(7, 10), img: 'canopy_' + (t => t === '@' ? (seg.th.tree === 'illum' || !seg.th.tree ? 'green' : seg.th.tree) : t)(pick(o.trees || ['kusu', 'mori', 'matsuN'])), trunk: 1, far: 1 }); /* '@'：その日の季節の並木（桜・柳など） */
    if (o.city) for (let a = 0; a < L + 20; a += rand(16, 26)) seg.spr.push({ lat: sd * (FW + rand(30, 60)), s: a, y: 0, h: rand(o.city[0], o.city[1]), w: rand(12, 22), img: 'bldg', nv: 1, far: 1 }); },
  /* 今ある水（お堀・池・川）の上に、物を浮かべる：o.items は pond と同じ */
  float(seg, sd, o) { const FW = seg.th.wide || 38, L = seg.len, se = RX_SEASON(), its = o.items || []; let k = 0;
    for (const it of its) { const [t, v] = it.split(':'), s = L * ((k++ + .5) / its.length) + rand(-3, 3), lat = sd * (HW + rand(6, Math.min(FW - 4, 30)));
      if (t === 'lotus') { for (let j = 0; j < 5; j++) rxSpr(seg, 'rxLotus', se, sd * (HW + 1.5 + j * 3), L * rand(.05, .95), 8, 2.6, { sp: { y: -.85 } }); }
      else if (t === 'swanB') { for (let j = 0; j < 2; j++) rxSpr(seg, 'rxSwanB', '', sd * (HW + rand(5, 16)), s + j * 3, 1.3, 1.0, { sp: { y: -.85 } }); }
      else if (t === 'swan') { for (let j = 0; j < 3; j++) rxSpr(seg, 'rxSwan', '', sd * (HW + rand(5, FW - 6)), s + rand(-8, 8), 2.2, 1.9, { sp: { y: -.85 } }); }
      else if (t === 'row') { for (let j = 0; j < 3; j++) rxSpr(seg, 'rxRowboat', '', sd * (HW + rand(4, FW - 6)), s + rand(-8, 8), 3.0, 1.1, { sp: { y: -.85 } }); }
      else if (t === 'island') rxSpr(seg, 'rxIsland', String(k), lat, s, 11, 8, { sp: { y: -.9 } });
      else if (t === 'stones') rxSpr(seg, 'rxStones', '', sd * (HW + 4), s, 9, 2.2, { sp: { y: -.82 } });
      else if (t === 'tea') rxSpr(seg, 'rxTea', v || 'ryotei', sd * Math.min(FW - 3, 26), s, v === 'benten' ? 9 : 12, v === 'benten' ? 9 : 6.5, { night: 1, sp: { y: v === 'benten' ? -.4 : -.8 } });
      else if (t === 'bridge') rxSpr(seg, 'rxTea', v || 'bridgeRed', lat, s, 12, v === 'engetsu' ? 6 : 4.5, { sp: { y: -.85 } });
      else if (t === 'boat') rxSpr(seg, 'rxBoat', v || 'bus', sd * rand(Math.min(20, FW - 6), Math.max(22, FW - 6)), s, v === 'yakata' ? 16 : 18, 6.6, { night: 1, sp: { y: -1, far: 1 } });
      else if (t === 'fount') rxSpr(seg, 'rxFountain', v || 'big', lat, s, 4.5, 4.5, { night: 1, sp: { y: -.85 } }); } },
});
/* ---- 町ごとの看板の言葉（本物の店の種類） ---- */
MARKET_MOOD.hoseki = ['宝石', '時計', '貴金属', '真珠', '地金', '指輪', '鑑定', '宝飾', '時計修理', '問屋']; /* 御徒町：宝石と時計の問屋の町 */
NEON_MOOD.gakki = Object.assign({}, NEON_MOOD.def, { words: ['ギター', '楽器', 'ドラム', 'ベース', 'ピアノ', '管楽器', '弦', '中古楽器', '修理', '楽譜'], marquee: ['GUITAR', 'SALE', 'DRUMS', 'BASS', 'OPEN'] }); /* 御茶ノ水：楽器店が並ぶ坂 */
/* ---- 隅田川の橋の色を本物に：蔵前橋は「稲のもみがらをイメージした黄色」（調べた資料）。前は白っぽい色だった ---- */
{ const ob0 = OBS.bridge; OBS.bridge = (...a) => { const o = ob0(...a); if (o && o.bx) for (const b of o.bx) { if (b.c === '#E9D9BF') b.c = '#E8C547'; if (b.txt === '蔵前橋') b.tc = '#3B2A20'; } return o; }; }
