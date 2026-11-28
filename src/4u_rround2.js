/* ================= 2026-11-28 景色 1000（2 回目）：数の少なかったステージを、本物を調べて足す ================= docs/SCENERY-1000-2026-11-28.md
   空の上（オオタカ）・電波塔の階段・エレベーター・ガード下と横丁・外堀（四谷・市ヶ谷）・屋形船
   ・ツバメ：春に南から来て、夏まで町の空を低く速く飛ぶ（黒っぽい背中・白いおなか・二つに分かれた長い尾）
   ・ムクドリ：秋から冬の夕方、大きな群れで空をうねるように飛び、駅前の木にねぐらを作る
   ・ヘリコプター：東京の空には、取材・救急・遊覧のヘリコプターがよく飛ぶ（会社の名前・マークは描かない）
   ・市ヶ谷の釣り堀：駅の前のお堀に、水に浮かぶ板の足場と小屋があり、人が小さな腰かけにすわって竿をたらす（鯉・金魚）
   ・やきとりの横丁：店先で焼く煙が、ちょうちんの明かりの中を白く流れる。消火器が店ごとに置いてある */
function rxPaintFlock(g, W, H, n, v) { const r = rnd(v === 'st' ? 173 : 179);
  if (v === 'st') { /* ムクドリの群れ（うねる雲のような形。1 羽ずつは小さな黒い点と翼） */
    for (let i = 0; i < 220; i++) { const t = r() * Math.PI * 2, q = Math.sqrt(r()), x = W * (.5 + .44 * q * Math.cos(t) * (1 + .25 * Math.sin(t * 3))), y = H * (.5 + .36 * q * Math.sin(t) + .12 * Math.sin(x / W * 6)), s = 1.6 + r() * 1.8;
      g.fillStyle = `rgba(30,30,36,${.55 + r() * .4})`; g.beginPath(); g.moveTo(x - s * 1.6, y - s * .4); g.quadraticCurveTo(x - s * .5, y - s * .7, x, y); g.quadraticCurveTo(x + s * .5, y - s * .7, x + s * 1.6, y - s * .4); g.lineTo(x, y + s * .45); g.closePath(); g.fill(); }
    return; }
  for (let i = 0; i < 4; i++) { const x = W * (.12 + i * .25 + r() * .08), y = H * (.25 + r() * .5), s = 14 + r() * 6, d = r() < .5 ? -1 : 1, up = r() < .5 ? 1 : -.3; /* ツバメ：とがった長い翼と、二つに分かれた尾 */
    g.fillStyle = '#1F2740'; g.beginPath(); g.moveTo(x - d * s * .9, y); g.quadraticCurveTo(x, y - s * .25, x + d * s * .55, y - s * .05); g.quadraticCurveTo(x, y + s * .18, x - d * s * .9, y); g.fill();
    g.beginPath(); g.moveTo(x - d * s * .1, y - s * .05); g.quadraticCurveTo(x - d * s * .4, y - s * .7 * up, x - d * s * 1.1, y - s * .95 * up); g.quadraticCurveTo(x - d * s * .1, y - s * .45 * up, x + d * s * .15, y); g.fill();
    g.beginPath(); g.moveTo(x + d * s * .05, y - s * .02); g.quadraticCurveTo(x + d * s * .35, y - s * .55 * up, x + d * s * .9, y - s * .75 * up); g.quadraticCurveTo(x + d * s * .2, y - s * .3 * up, x + d * s * .2, y + s * .05); g.fill();
    g.beginPath(); g.moveTo(x - d * s * .8, y); g.lineTo(x - d * s * 1.35, y - s * .16); g.lineTo(x - d * s * 1.05, y + s * .02); g.lineTo(x - d * s * 1.35, y + s * .2); g.closePath(); g.fill();
    g.fillStyle = '#F3EFE6'; g.beginPath(); g.ellipse(x - d * s * .05, y + s * .06, s * .32, s * .08, 0, 0, 7); g.fill(); g.fillStyle = '#B5432F'; g.beginPath(); g.arc(x + d * s * .45, y - s * .04, s * .07, 0, 7); g.fill(); } }
function rxPaintHeli(g, W, H, n) { const cx = W * .42, cy = H * .55; /* ヘリコプター（白い胴に青い線。会社の名前やマークは入れない） */
  g.strokeStyle = '#3B3F45'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - 52, H * .9); g.lineTo(cx + 58, H * .9); g.moveTo(cx - 30, H * .9); g.lineTo(cx - 22, cy + 22); g.moveTo(cx + 30, H * .9); g.lineTo(cx + 26, cy + 22); g.stroke(); /* 足（スキッド） */
  g.fillStyle = '#E9EDF0'; g.beginPath(); g.moveTo(cx + 40, cy - 6); g.lineTo(W * .93, cy - 14); g.lineTo(W * .95, cy - 4); g.lineTo(cx + 40, cy + 10); g.closePath(); g.fill(); /* しっぽ */
  g.fillStyle = '#C9D0D6'; g.beginPath(); g.moveTo(W * .9, cy - 14); g.lineTo(W * .93, cy - 36); g.lineTo(W * .97, cy - 34); g.lineTo(W * .96, cy - 6); g.closePath(); g.fill(); g.strokeStyle = 'rgba(60,64,70,.55)'; g.lineWidth = 2; g.beginPath(); g.arc(W * .94, cy - 12, 13, 0, 7); g.stroke(); /* しっぽの羽 */
  const bg = g.createLinearGradient(0, cy - 30, 0, cy + 26); bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(.6, '#E3E8EC'); bg.addColorStop(1, '#A9B2BA'); g.fillStyle = bg; g.beginPath(); g.ellipse(cx, cy, 58, 28, 0, 0, 7); g.fill(); /* 丸い胴 */
  g.fillStyle = '#2E6FAE'; g.beginPath(); g.ellipse(cx + 4, cy + 8, 56, 7, .02, 0, Math.PI); g.fill(); g.fillRect(cx + 40, cy + 2, W * .5 - 40, 4);
  const wg = g.createLinearGradient(cx - 58, cy - 20, cx - 20, cy + 6); wg.addColorStop(0, '#2B4A63'); wg.addColorStop(1, '#7FA6C2'); g.fillStyle = wg; g.beginPath(); g.ellipse(cx - 30, cy - 4, 26, 18, -.2, Math.PI * .65, Math.PI * 1.7); g.fill(); /* 前の大きな窓 */
  g.fillStyle = '#5E7A92'; rrect(g, cx - 4, cy - 14, 22, 16, 3); g.fill(); g.fillStyle = '#9AA3AB'; rrect(g, cx - 6, cy - 36, 30, 10, 3); g.fill(); g.fillRect(cx + 7, cy - 42, 4, 8); /* 横の窓と、上のエンジン */
  g.fillStyle = 'rgba(60,64,70,.35)'; g.beginPath(); g.ellipse(cx + 9, cy - 43, W * .46, 4, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(40,44,50,.75)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + 9 - W * .44, cy - 44); g.lineTo(cx + 9 + W * .44, cy - 42); g.stroke(); /* 回る羽（ぶれて見える） */
  if (n) { g.fillStyle = '#FF4A3A'; g.beginPath(); g.arc(cx + 2, cy + 24, 4, 0, 7); g.fill(); g.fillStyle = '#7CFF8A'; g.beginPath(); g.arc(W * .95, cy - 34, 3, 0, 7); g.fill(); rxGlowC(g, cx + 2, cy + 24, 26, '255,90,70', .5); } }
function rxPaintSmoke(g, W, H) { const r = rnd(181); for (let i = 0; i < 9; i++) { const t = i / 8, x = W * (.5 + Math.sin(t * 4 + r()) * .18 * t), y = H * (.92 - t * .82), rr = W * (.14 + t * .26); /* やきとりの煙（下はこく、上へ行くほど広がってうすくなる） */
  const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(240,240,242,${.6 - t * .42})`); gr.addColorStop(1, 'rgba(240,240,242,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } }
function rxPaintAngler(g, W, H, n, v) { const o = rxV(v), c = o.c || '#4E6A8A', r = rnd(o.t === 'b' ? 191 : 193); if (o.sd < 0) { g.translate(W, 0); g.scale(-1, 1); } /* 左の岸の人は、竿を左（お堀の方）へ出す */ rxShadowE(g, W * .3, H - 6, 34, 5, .2); /* 釣りをする人（うしろ姿。小さな腰かけにすわり、竿を水の方へ出す） */
  g.fillStyle = '#5A4A3A'; g.fillRect(W * .2, H * .78, 6, H * .2); g.fillRect(W * .36, H * .78, 6, H * .2); g.fillStyle = '#3E6E9A'; rrect(g, W * .16, H * .74, W * .3, 10, 3); g.fill(); /* 腰かけ */
  g.fillStyle = '#3B3F45'; rrect(g, W * .17, H * .64, W * .28, H * .14, 8); g.fill(); /* ひざ */
  const bg = g.createLinearGradient(W * .14, 0, W * .46, 0); bg.addColorStop(0, shadeHex(c, .75)); bg.addColorStop(.5, c); bg.addColorStop(1, shadeHex(c, .8)); g.fillStyle = bg; g.beginPath(); g.moveTo(W * .15, H * .7); g.quadraticCurveTo(W * .14, H * .38, W * .3, H * .34); g.quadraticCurveTo(W * .46, H * .38, W * .45, H * .7); g.closePath(); g.fill(); /* 背中（上着） */
  g.fillStyle = '#E8C9A8'; g.beginPath(); g.arc(W * .3, H * .27, W * .075, 0, 7); g.fill(); g.fillStyle = o.t === 'b' ? '#E9E2D2' : '#3A4A3A'; g.beginPath(); g.ellipse(W * .3, H * .22, W * .1, W * .055, 0, Math.PI, 0); g.fill(); g.fillRect(W * .19, H * .215, W * .22, 3); /* 頭とぼうし */
  g.strokeStyle = '#2B2B2B'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(W * .42, H * .55); g.quadraticCurveTo(W * .7, H * .1, W * .97, H * .14); g.stroke(); g.strokeStyle = 'rgba(240,240,240,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(W * .97, H * .14); g.lineTo(W * .96, H * .86); g.stroke(); /* 竿と糸 */
  g.fillStyle = '#E8402E'; g.beginPath(); g.ellipse(W * .96, H * .87, 3, 5, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(W * .96, H * .91, 12, 3, 0, 0, 7); g.stroke(); /* うきと波紋 */
  g.fillStyle = '#4A8ABF'; g.fillRect(W * .52, H * .8, 26, 22); g.fillStyle = '#3B6E99'; g.fillRect(W * .52, H * .8, 26, 4); if (r() < .6) { g.fillStyle = '#F07C2E'; g.beginPath(); g.ellipse(W * .52 + 13, H * .8 + 2, 6, 2, 0, 0, 7); g.fill(); } } /* 魚を入れるおけ */
function rxPaintFishHut(g, W, H, n) { rxShadowE(g, W / 2, H - 6, W * .46, 8, .2); /* 釣り堀の小屋（波板の屋根・受付の窓・貸し竿の棚・のぼり） */
  g.fillStyle = '#C9C2B2'; g.fillRect(W * .1, H * .38, W * .62, H * .58); g.fillStyle = '#B5AE9E'; for (let x = W * .1; x < W * .72; x += 14) g.fillRect(x, H * .38, 2, H * .58);
  g.fillStyle = '#4E7A6E'; g.beginPath(); g.moveTo(W * .04, H * .4); g.lineTo(W * .78, H * .4); g.lineTo(W * .74, H * .28); g.lineTo(W * .08, H * .28); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; for (let x = W * .1; x < W * .76; x += 9) { g.beginPath(); g.moveTo(x, H * .29); g.lineTo(x - 2, H * .39); g.stroke(); } /* 緑の波板の屋根 */
  g.fillStyle = n ? '#FFE9B0' : '#9FC0D8'; g.fillRect(W * .16, H * .48, W * .26, H * .2); g.strokeStyle = '#6E6A60'; g.lineWidth = 3; g.strokeRect(W * .16, H * .48, W * .26, H * .2); if (n) rxGlowC(g, W * .29, H * .58, 60, '255,230,170', .4); /* 受付の窓 */
  g.fillStyle = '#FBF6EE'; g.fillRect(W * .46, H * .46, W * .2, H * .3); g.fillStyle = '#2B2B2B'; g.font = rxFont(H * .07); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('つり堀', W * .56, H * .55, W * .19); g.font = rxFont(H * .04, 700); g.fillText('FISHING', W * .56, H * .66, W * .18); /* 看板（店の名前は入れない） */
  g.strokeStyle = '#3B3F45'; g.lineWidth = 2; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(W * (.76 + k * .03), H * .96); g.lineTo(W * (.74 + k * .035), H * .3); g.stroke(); } g.fillStyle = '#7A5A3A'; g.fillRect(W * .74, H * .86, W * .2, 6); /* 貸し竿の棚 */
  g.fillStyle = '#5A5F66'; g.fillRect(W * .07, H * .12, 3, H * .84); g.fillStyle = '#2E6FAE'; g.fillRect(W * .07 + 3, H * .12, W * .07, H * .36); g.fillStyle = '#FFFFFF'; g.font = rxFont(W * .045); ['釣', 'り', '堀'].forEach((ch, i) => g.fillText(ch, W * .07 + 3 + W * .035, H * (.18 + i * .1))); } /* のぼり */
Object.assign(PROP_ART, { rxFlock: (n, v) => rxArtC('rxflock|' + v, v === 'st' ? 420 : 260, v === 'st' ? 200 : 120, (g, w, h) => rxPaintFlock(g, w, h, n, v)), rxHeli: (n) => rxArtC('rxheli' + (n ? 1 : 0), 300, 140, (g, w, h) => rxPaintHeli(g, w, h, n)),
  rxSmoke: () => rxArtC('rxsmoke', 160, 220, rxPaintSmoke), rxAngler: (n, v) => rxArtC('rxangler|' + v, 200, 170, (g, w, h) => rxPaintAngler(g, w, h, n, v)), rxFishHut: (n) => rxArtC('rxfishhut' + (n ? 1 : 0), 360, 260, (g, w, h) => rxPaintFishHut(g, w, h, n)) });
Object.assign(RX_SET, {
  /* 鳥の群れ：o.kind 'sw'（ツバメ・春夏）'st'（ムクドリ・秋冬の夕方） */
  flock(seg, sd, o) { if (seg.th.sky) return; const L = seg.len, st = o.kind === 'st'; for (let k = 0; k < (o.n || 1); k++) rxSpr(seg, 'rxFlock', st ? 'st' : 'sw', sd * (st ? rand(28, 50) : rand(8, 22)), L * rand(.35, 1.0), st ? 30 : 7, st ? 14 : 3.2, { sp: { y: o.y != null ? o.y + rand(-3, 3) : st ? rand(14, 30) : rand(4, 12), far: 1 } }); },
  /* ヘリコプター（遠くの空をゆっくり横切る。夜は赤い光） */
  heli(seg, sd, o) { if (seg.th.sky) return; const L = seg.len; for (let k = 0; k < (o.n || 1); k++) rxSpr(seg, 'rxHeli', '', sd * rand(34, 58), L * rand(.55, 1.05), 9, 4.2, { night: 1, sp: { y: o.y != null ? o.y : rand(12, 30), far: 1 } }); },
  /* やきとりの煙（店先から白く立ちのぼる） */
  smoke(seg, sd, o) { const L = seg.len; for (let s = 6 + rand(0, 4); s < L - 4; s += o.gap || 11) { const side = Math.random() < .5 ? -1 : 1; seg.spr.push({ lat: side * (HW - .8), s, y: .9, w: 1.9, h: 2.6, img: rxPaintKey('rxSmoke', ''), keep: 1, glow: 1 }); } }, /* glow：夜の暗さで黒くしない（白い煙のまま） */
  /* 市ヶ谷の釣り堀：お堀に浮かぶ板の足場・小屋・竿をたらす人 */
  tsuribori(seg, sd, o) { const L = seg.len, a = L * (o.a != null ? o.a : .2), b = L * (o.b != null ? o.b : .8), l0 = HW + 2.6, l1 = HW + 5.0, lc = sd * (l0 + l1) / 2, bx = [];
    for (let s = a; s < b - .5; s += 6) { bx.push(B(lc, s, l1 - l0, 5.9, -.9, -.62, '#8A7A62')); bx.push(B(lc, s + .1, l1 - l0 - .1, 5.7, -.62, -.58, '#B59E7E')); } /* 浮かぶ板の足場 */
    bx.push(B(sd * (l1 + 1.9), a, 3.8, 6, -.9, -.62, '#8A7A62'), B(sd * (l1 + 1.9), a + .1, 3.7, 5.8, -.62, -.58, '#B59E7E')); /* 小屋の床（足場の外へ広い） */
    bx.push(B(sd * (HW + 1.3), a - 1.5, 2.6, 1.5, -.9, -.58, '#8A7A62')); /* 岸から足場へわたる板 */
    seg.props.push(mkProp(seg, bx, { big: 1 }));
    rxSpr(seg, 'rxFishHut', '', sd * (l1 + 1.9), a + 3, 4.4, 3.2, { night: 1, sp: { y: -.58 } });
    for (let s = a + 7, k = 0; s < b - 2; s += rand(3.2, 5.5), k++) { if (Math.random() < .25) continue; rxSpr(seg, 'rxAngler', (sd < 0 ? 'L' : 'R') + '|' + (k % 2 ? 'b' : 'a') + '|' + pick(['#4E6A8A', '#8A5A4A', '#5A7A4E', '#6E5A8A', '#B8794A']), sd * (l1 - .7), s, 1.7, 1.45, { sp: { y: -.58 } }); } },
});
Object.assign(DECO_SIZE, { rxElevInd: [1.3, 2.0, 2.7], rxElevBtn: [.5, .85, 1.65], rxRailH: [2.6, .82, 1.0], rxExting: [.6, 0, 1.25] });
Object.assign(DECO_DRAW, {
  /* エレベーターの上の、今の高さの表示（黒いガラスにだいだい色の数字。上向きの三角） */
  rxElevInd(e) { const th = e.seg && e.seg.th, to = (th && th.liftTo) || 350; bquad(0, 0, 1, 1, tint('#2A2C30')); bquad(.04, .08, .96, .92, tint('#0E0F12')); ctx.fillStyle = tint('#FF9A3A'); { const a = bil(.12, .3), b = bil(.26, .3), c = bil(.19, .75); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.fill(); } qtext(to + 'm', .3, .15, .94, .85, '#FFB45A'); },
  /* 行き先のボタンの板（ステンレスに、丸いボタンと、開く・閉じるの三角） */
  rxElevBtn(e) { bquad(.05, 0, .95, 1, tint('#B9C0C6')); bquad(.1, .03, .9, .97, tint('#D5DADE')); for (let k = 0; k < 3; k++) { const c = bil(.5, .78 - k * .2), r2 = Math.max(1.5, Math.abs(bil(.72, .5)[0] - bil(.5, .5)[0])); ctx.fillStyle = tint(k === 0 ? '#FFB45A' : '#8A939B'); ctx.beginPath(); ctx.arc(c[0], c[1], r2, 0, 7); ctx.fill(); ctx.fillStyle = tint('#EEF1F4'); ctx.beginPath(); ctx.arc(c[0], c[1], r2 * .6, 0, 7); ctx.fill(); }
    ctx.fillStyle = tint('#3B3F45'); for (const [u0, u1] of [[.18, .44], [.82, .56]]) { const a = bil(u0, .16), b = bil(u1, .1), c = bil(u1, .22); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.fill(); } },
  /* かべの手すり（みがいた銀色の棒） */
  rxRailH(e) { bquad(0, .3, 1, .7, tint('#C9D0D6')); bquad(0, .55, 1, .7, tint('#EEF1F4')); for (const u of [.08, .92]) bquad(u - .02, 0, u + .02, .4, tint('#8A939B')); },
  /* 消火器（赤い本体・黒いホース・上に「消火器」の赤い札） */
  rxExting(e) { bquad(.15, .82, .85, 1, tint('#C8362A')); qtext(tr('消火器', 'FIRE EXT.'), .18, .84, .82, .98, '#FFFFFF'); bquad(.3, 0, .7, .6, tint('#D8443A')); bquad(.3, .5, .7, .6, tint('#E86A5A')); bquad(.38, .6, .62, .68, tint('#3B3F45')); bquad(.62, .2, .7, .62, tint('#2B2B2B')); bquad(.3, 0, .7, .05, tint('#8A2A20')); },
});
/* オオタカと飛ぶ空（町は下に絵で描くので、道ばたの物は出ない）：ヘリコプターと鳥の群れを、空の絵として描く（飛行機と同じしくみ） */
function rxSkyImg(k, n) { const kk = n && (SPR[k + 'N'] || SPR_PEND[k + 'N']) ? k + 'N' : k; return SPR[kk] || (SPR_PEND[kk] ? sprPaint(kk) : null); }
function rxSkyLife(hz, seg) { const th = seg && seg.th; if (!th || !th.sky || !th.rx || (typeof lowQ !== 'undefined' && lowQ > 1)) return; const se = seasonOf(seg.day || 1), t = G.t || 0, N = LT.night > .5, spin = typeof skySpin === 'function' ? skySpin(seg) : 0, amx = Math.atan(W * .45 / FOCAL);
  for (const [k, sd, o] of th.rx) { if (k !== 'heli' && k !== 'flock' && k !== 'gulls') continue; if (o && o.seasons && !o.seasons.includes(se)) continue; if (k === 'gulls' && se === 'summer') continue; /* ユリカモメは冬の鳥（夏は北へ帰る） */
    const gu = k === 'gulls', st = k === 'flock' && o.kind === 'st', per = k === 'heli' ? 70 : st ? 90 : gu ? 40 : 9, u = (t / per + (sd > 0 ? .2 : .7)) % 1;
    let a = sd * (k === 'heli' ? .55 : st ? .8 : gu ? .45 : .62) * amx + (k === 'heli' || gu ? (u - .5) * .5 * amx * sd : st ? Math.sin(t * .05) * .1 : Math.sin(t * .9 + sd) * .18 * amx) - spin; while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; if (Math.abs(a) > 1.2) continue;
    const img = rxSkyImg(gu ? rxPaintKey('rxGulls', '') : rxPaintKey(k === 'heli' ? 'rxHeli' : 'rxFlock', k === 'heli' ? '' : st ? 'st' : 'sw', k === 'heli'), N); if (!img || !img.width) continue;
    const x = W / 2 + Math.tan(a) * FOCAL, ww = FOCAL * (k === 'heli' ? .07 : st ? .3 : gu ? .12 : .16), hh = ww * img.height / img.width, y = hz + FOCAL * (k === 'heli' ? .05 : st ? .02 : gu ? .08 : .2 + Math.sin(t * 1.3 + sd) * .04); /* 見下ろす町の上を飛ぶ（オオタカより低い空。上の時計やゲージとかさならない） */
    ctx.save(); ctx.globalAlpha = k === 'heli' ? .85 : st ? (N ? .5 : .75) : .9; if (k === 'heli' && sd < 0) { ctx.translate(x, y); ctx.scale(-1, 1); ctx.drawImage(img, -ww / 2, -hh / 2, ww, hh); } else ctx.drawImage(img, x - ww / 2, y - hh / 2, ww, hh); ctx.restore(); } }
{ const g0 = RX_SET.gulls; RX_SET.gulls = function (seg, sd, o) { if (!seg.th.sky) g0(seg, sd, o); }; } /* 空の上では、空の絵の方で描く */
{ const ds0 = drawSky; drawSky = function (seg) { ds0(seg); try { rxSkyLife(HORIZON - Math.tan(CAM.pitch) * FOCAL, seg); } catch (e) { reportErr(e); } }; } /* 空と町の絵を描いたあとに重ねる（先に描くと、町の遠くのかすみの下にかくれる） */
