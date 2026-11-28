/* ================= 2026-11-28 舞浜の夢の遊園地：手ざわりのブラッシュアップ（ごほうび・音・乗り物の写真・風） ================= docs/MAIHAMA-2026-11-28.md
   どれも「遊びの決まり」は変えない（落ちる・落ちないは 6f_void.js のまま）。うまくいった時の手ごたえと、乗り物らしさを足す。 */
const MVX = { seg: null, pitI: 0, row: 0, clackD: 0, chainT: 0, inDrop: 0, photo: 0, windT: 3, frame: 0, fell: 0, birdT: 9 };
function mvxAt() { const P = G.player, sp = spriteAt(P.wx, P.wy + .5, P.wz); return sp ? [sp.sx, sp.sy] : [W / 2, H * .6]; }
/* [手 1] 板の無い所を 1 つこえるごとに、小さなごほうび（続けてこえると、音が 1 段ずつ上がり、点も増える）。助けが入っている間（無敵・空・練習）は数えない */
function mvxPits(seg) { const P = seg.pits; while (MVX.pitI < P.length && G.s >= P[MVX.pitI].b + .4) { MVX.pitI++; if (mvAssist() || G.y > .5) continue;
    const pts = Math.round(60 * SV.mlevel * (1 + Math.min(MVX.row, 4) * .5)); G.score += pts; G.stats.pitPass = (G.stats.pitPass || 0) + 1; const at = mvxAt();
    floatText(W / 2, cheerY(.36), '+' + fmt(pts), '#F2C230'); burst(at[0], at[1], '#F6D25A', 6); tone(sfxHz(Math.min(MVX.row, 5)) * 2, .16, 'pluck', .09); tone(sfxHz(Math.min(MVX.row, 5)) * 2, .5, 'bell', .03); MVX.row++; } }
/* [手 2〜4] 場所が変わった時：橋をわたりきった・トロッコに乗った・お城に着いた */
function mvxEnter(seg, prev) { const th = seg.th, pt = prev && prev.th; MVX.pitI = 0; if (seg.pits) while (MVX.pitI < seg.pits.length && G.s >= seg.pits[MVX.pitI].b) MVX.pitI++;
  if (pt && prev.tid === 'mvalley' && prev.pits && seg.tid !== 'mvalley' && MVX.row > 0) { const b = 300 * SV.mlevel; G.score += b; G.stats.mvBridge = (G.stats.mvBridge || 0) + 1; banner('BRIDGE CLEAR!', tr('谷をわたりきった！', 'You crossed the valley!'), 'good'); SFX.mission(); MVX.row = 0; }
  if (th.ride && !(pt && pt.ride)) { MVX.photo = 0; MVX.clackD = 0; MVX.inDrop = 0; G.stats.mvCart = 1; banner('MINE CART!', tr('トロッコ！', 'Mine cart!'), 'good'); thump(180, 70, .16, .16); noise(.12, .05, 900); buzz(20); } /* がたん、と乗りこむ */
  if (pt && pt.ride && !th.ride) { thump(150, 60, .14, .12); whoosh(.4, .04, 1800, 500); G.mvDropK = 0; } /* 降りる時の、ブレーキの音 */
  if (seg.tid === 'mcastle' && pt && prev.tid !== 'mcastle' && pt.course === 'maihama' && seg.step && seg.step.straightOut) { const b = 1000 * SV.mlevel; G.score += b; G.stats.mvCastle = 1; bannerNow('THE CASTLE!', tr('王国のお城に到着！', 'You reached the castle!'), 'good'); SFX.best(); react('cheer', 1); } }
/* [手 5〜10] トロッコ：レールのつぎ目の「カタン」、のぼりの鎖の「カチカチ」、くだりの風・視野の広がり・ふるえ、いちばん大きなくだりで記念写真 */
function mvxRide(seg, dt) { const L = seg.len, sl = (segE(seg, Math.min(L, G.s + 1.5)) - segE(seg, Math.max(0, G.s - 1.5))) / 3;
  MVX.clackD += G.speed * dt; if (MVX.clackD > 2.6) { MVX.clackD = 0; thump(150, 95, .05, .045); noise(.025, .018, 2200); }
  if (sl > .12) { MVX.chainT -= dt; if (MVX.chainT <= 0) { MVX.chainT = .12; noise(.018, .03, 3200); tone(1250, .02, 'sine', .012); } }
  if (sl < -.2) { if (!MVX.inDrop) { MVX.inDrop = 1; whoosh(.8, .07, 500, 2600); buzz(25); } if (Math.random() < dt * 26) { const sd = Math.random() < .5 ? -1 : 1; FX.push({ x: W / 2 + sd * W * rand(.2, .5), y: H * rand(.25, .8), vx: sd * rand(300, 520), vy: rand(60, 160), life: .32, t: 0, c: 'rgba(255,255,255,.7)', r: rand(1.2, 2.4) }); } } else MVX.inDrop = 0;
  G.mvDropK = lerp(G.mvDropK || 0, clamp(-sl * 2.4, 0, .8), Math.min(1, dt * 3)); /* くだりでは視野が少し広がる（速さを感じる） */
  if (!MVX.photo && sl < -.3 && (G.mvCartN | 0) >= 2) { MVX.photo = 1; MVX.frame = 1; G.stats.mvPhoto = 1; noise(.05, .1, 3000); tone(1900, .035, 'sine', .04); tone(1400, .05, 'sine', .03, auNow() + .06); floatText(W / 2, cheerY(.5), tr('パシャ！', 'Snap!'), '#FFFFFF'); } }
/* [手 11・12] 谷の風の音と、遠くのトビの声（たまに） */
function mvxAir(dt) { MVX.windT -= dt; if (MVX.windT <= 0) { MVX.windT = rand(4, 7); whoosh(1.4, .016, 240, 640); } MVX.birdT -= dt; if (MVX.birdT <= 0) { MVX.birdT = rand(11, 19); if (LT.night < .5) { const t = auNow(); tone(1500, .5, 'sine', .014, t, 1050); tone(1320, .4, 'sine', .01, t + .55, 980); } } }
/* [手 13] 落ちる時、割れた板のかけらが、いっしょに散る */
function mvxDebris() { const at = mvxAt(); burst(at[0], at[1], '#B9895A', 9); burst(at[0], at[1], '#8A6444', 5); thump(260, 120, .07, .1); }
/* [手 14〜18] 動く物：気球はゆっくり上下し、白鳥のボートは水の上をすべり、間欠泉は 9 秒ごとに吹き上がり、チョウ・トンボ・ホタル・コウモリはふわふわ飛ぶ（絵の場所と大きさを、毎コマ少しずつ動かす） */
function mvxAnim(dt) { MVX.t = (MVX.t || 0) + dt; const t = MVX.t; for (let i = Math.max(0, G.ci - 1), e = Math.min(G.segs.length, G.ci + 8); i < e; i++) { const sg = G.segs[i]; if (sg.mvA === 0) continue;
    if (!sg.mvA) { const a = sg.spr.filter(q => q.mv); if (!a.length) { sg.mvA = 0; continue; } for (const q of a) { q.ms = q.s; q.ml = q.lat; q.my = q.y; q.mh = q.h; q.mw = q.w; } sg.mvA = a; }
    for (const q of sg.mvA) { const p = q.ph || 0; if (q.mv === 'bob') { q.y = q.my + Math.sin(t * .5 + p) * .7; q.lat = q.ml + Math.sin(t * .13 + p) * 1.4; } else if (q.mv === 'glide') { q.s = q.ms + Math.sin(t * .12 + p) * 4; q.lat = q.ml + Math.cos(t * .09 + p) * .8; }
      else if (q.mv === 'erupt') { const c = ((t + p * 2) % 9) / 9, k = c < .07 ? c / .07 : c < .34 ? 1 : c < .5 ? 1 - (c - .34) / .16 : 0; q.h = q.mh * (.1 + .9 * k); q.w = q.mw * (.45 + .55 * k); } else if (q.mv === 'flit') { q.lat = q.ml + Math.sin(t * .9 + p) * 1.3; q.y = q.my + Math.sin(t * 1.3 + p * 2) * .5; } } } }
/* [手 19] 板の無い所が近づいて、いまのレーンに板が無い時：板の残っているレーンの入口が、金色にきらっと光って教える（字は出さない） */
function mvxHint(seg, dt) { const P = seg.pits; if (!P || MVX.pitI >= P.length) return; const p = P[MVX.pitI], d = p.a - G.s; if (d < 1 || d > 20 || p.open[G.lane]) return; MVX.hintT = (MVX.hintT || 0) - dt; if (MVX.hintT > 0) return; MVX.hintT = .16;
  for (let k = 0; k < 3; k++) if (p.open[k]) { const w = segPos(seg, p.a + .8, LANES[k]), sp = spriteAt(w[0], w[2] + .25, w[1]); if (sp) FX.push({ x: sp.sx + rand(-10, 10), y: sp.sy, vx: rand(-20, 20), vy: rand(-90, -40), life: .45, t: 0, c: '#FFE28A', r: rand(1.6, 3) }); } }
/* [手 20] 板の下にかくれる物は描かない：カメラが、その橋・線路の真上（横に 8m 以内）にある間は、板より下の物（塔の足・やぐら・谷の底の岩や水晶や間欠泉）は板にかくれて見えないはず。
   この絵の描き方は「遠い物から順に重ねる」だけなので、ほうっておくと板の上に重なって見える。曲がった先の橋を横から見る時は、ちゃんと見せる */
function mvxHide() { for (let i = Math.max(0, G.ci - 1), e = G.segs.length; i < e; i++) { const sg = G.segs[i]; if (!sg.th.void) continue; if (!sg.mvD) { sg.mvD = 1; for (const sp of sg.spr) if (sp.y + (sp.h || 0) < -1) sp.mvDeep = 1; }
    const p0 = segPos(sg, 0, 0), lat = (CAM.x - p0[0]) * sg.r[0] + (CAM.z - p0[1]) * sg.r[1], hide = Math.abs(lat) < 8; if (sg.mvHid === hide) continue; sg.mvHid = hide; for (const pr of sg.props) if (pr.mvBelow) pr.nodraw = hide; for (const sp of sg.spr) if (sp.mvDeep) sp.under = hide; } }
function mvxTick(dt) { try { mvxHide(); } catch (e) { reportErr(e); } MVX.frame = Math.max(0, MVX.frame - dt * 1.3); if (G.mode === 'play' || G.mode === 'dying') { try { mvxAnim(dt); } catch (e) { reportErr(e); } }
  if (G.mode !== 'play') { if (G.mode === 'dying' && G.cause === 'pit' && !MVX.fell) { MVX.fell = 1; MVX.row = 0; mvxDebris(); } if (G.mode !== 'dying') { MVX.seg = null; G.mvDropK = 0; } return; }
  MVX.fell = 0; const seg = curSeg(); if (!seg) return; if (seg !== MVX.seg) { const prev = MVX.seg; MVX.seg = seg; mvxEnter(seg, prev); }
  if (seg.th.ride) mvxRide(seg, dt); else { if (G.mvDropK) G.mvDropK = lerp(G.mvDropK, 0, Math.min(1, dt * 4)); if (seg.pits) { mvxPits(seg); mvxHint(seg, dt); } }
  if (seg.th.void) mvxAir(dt); }
{ const up1 = update; update = function (dt) { up1(dt); try { mvxTick(dt); } catch (e) { reportErr(e); } }; }
/* [手 10] 記念写真：画面のふちに、白い写真のわくが出て、すっと消える（画面全体は光らせない＝まぶしくしない） */
{ const fx0 = drawFX; drawFX = function () { fx0(); if (MVX.frame > 0 && G.mode === 'play') { const a = Math.min(1, MVX.frame * 1.6), w = Math.max(10, Math.min(W, H) * .028); ctx.save(); ctx.globalAlpha = a * .9; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = w; ctx.strokeRect(w / 2, w / 2, W - w, H - w); ctx.restore(); } }; }
