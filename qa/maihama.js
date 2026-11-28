// 2026-11-28 舞浜の夢の遊園地（100 万点のコース）：板の無い道・落ちるアニメ・曲線・トロッコが、ずるくなく・止まらず・おかしくならないこと。
// オーナーの依頼：「現実的におかしくなったり、物理的におかしくなったり、バグが起こったり、止まってしまったりしないように」
// 確かめ方：
//  (1) コースの決まり：100 万点で始まる・全部の場所がある・曲線は 15 度 × 6 で 90 度・トロッコは最後に地面の高さへ戻る
//  (2) 板の無い道を 300 回作る（速さ 12〜22）：板の無い所は 9〜12m・間は 11m 以上（速さ × 0.85 秒ぶん以上）・どの所にも板のあるレーンがある・最初の 12m と最後の 9m は全部板・
//      「左だけ → 左だけ」のように同じレーンが続かない・牧草は板のあるレーンに置いてある
//  (3) 板の無いレーンに立つと、落ちて終わる（cause 'pit'）。カメラは穴の上から見下ろし、モチは谷の底へ。続けると、板のあるレーンに戻る
//  (4) 跳んでいる間は落ちない。無敵の間は、板のあるレーンへ自動で寄って落ちない
//  (5) コースを広場から最後まで走る（1 コマずつ進める）：絵のエラー 0・止まらない・1 コマで横へ飛ばない（曲線のつなぎ目）・カメラがかくっと回らない・
//      トロッコの間は操作がきかない・3 人が 1 列・速さはのぼりでおそく、くだりで速い・最後はお城への橋に着く
//  (6) 100 万点になると、次の外の道からコースが始まる
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200); await p.click('#btnStart'); await p.waitForTimeout(600);
  const ev = code => p.evaluate(c => window.__hayDash.ev(c), code);
  /* (1) */
  const r1 = await ev(`(() => { const c = COURSES.maihama, o = { at: c && c.at, miss: [], bends: [], cartEnd: null }; if (!c) return o; let run = 0; for (const s of c.steps) { if (!THEMES[s.t]) o.miss.push(s.t); if (s.bend) run += s.bend; else if (run) { o.bends.push(+run.toFixed(3)); run = 0; } } if (run) o.bends.push(+run.toFixed(3)); o.cartN = c.steps.filter(s => s.t === 'mcart').length; o.cartLast = MV_CART_H[Math.min(o.cartN, MV_CART_H.length) - 1]; o.void = ['mvalley', 'mcurve', 'mcart'].every(t => THEMES[t] && THEMES[t].void); return o; })()`);
  if (r1.at !== 1000000) bad.push('コースが 100 万点で始まらない: ' + r1.at);
  if (r1.miss && r1.miss.length) bad.push('無い場所がある: ' + r1.miss.join(','));
  if (!r1.bends || r1.bends.length < 4 || r1.bends.some(x => Math.abs(Math.abs(x) - 1) > .001)) bad.push('曲線が 90 度（15 度 × 6）になっていない: ' + JSON.stringify(r1.bends));
  if (r1.cartLast !== 0) bad.push('トロッコの最後が地面の高さに戻らない: ' + r1.cartLast + '（' + r1.cartN + ' 本）');
  if (!r1.void) bad.push('つり橋・曲線・トロッコが「板の橋」の作りになっていない');
  /* (2) */
  const r2 = await ev(`(() => { const o = { n: 0, bad: [], singles: 0, lanes: [0, 0, 0] }; G.paused = true; const base = G.segs[G.ci];
    for (let i = 0; i < 300; i++) { G.speedEst = 12 + (i % 11); const cont = i % 3 !== 0; let sg; try { sg = newSeg(base, { t: 'mvalley', d: 5, straightOut: 1, cont: cont ? 1 : 0, co: 'maihama' }, { straight: true }); } catch (e) { o.bad.push('作れない ' + e.message); break; }
      const P = sg.pits || []; o.n += P.length; if (!P.length) { o.bad.push('板の無い所が 1 つも無い'); continue; } const rest = Math.max(11, G.speedEst * .85) - .01; let prev = null;
      if (P[0].a < 12) o.bad.push('最初の板が短い ' + P[0].a.toFixed(1)); if (P[P.length - 1].b > sg.len - 8.99) o.bad.push('最後の板が短い ' + (sg.len - P[P.length - 1].b).toFixed(1));
      for (const q of P) { const len = q.b - q.a, nOpen = q.open.reduce((a, x) => a + x, 0); if (len > 12.01 || len < 3) o.bad.push('長さ ' + len.toFixed(1)); if (nOpen < 1) o.bad.push('板のあるレーンが無い'); if (nOpen === 3) o.bad.push('全部板（板の無い所ではない）');
        if (prev && q.a - prev.b < rest) o.bad.push('間が短い ' + (q.a - prev.b).toFixed(1) + '（速さ ' + G.speedEst + '）'); if (nOpen === 1) { o.singles++; o.lanes[q.open.indexOf(1)]++; if (prev && prev.open.join('') === q.open.join('')) o.bad.push('同じレーンが続く ' + q.open.join('')); } prev = q; }
      if (!cont && P[0].open.reduce((a, x) => a + x, 0) !== 2) o.bad.push('最初の橋の 1 つ目が、2 レーン残っていない');
      for (const it of sg.items) { const q = P.find(z => it.s >= z.a && it.s < z.b); if (q && !q.open[it.lane]) o.bad.push('牧草が板の無いレーンにある'); }
      const fl = sg.floor.filter(f => f.mid && f.a != null); for (const q of P) for (let k = 0; k < 3; k++) { const mid = (q.a + q.b) / 2, lat = LANES[k]; const has = fl.some(f => f.a <= mid && f.b >= mid && Math.min(f.v[0], f.v[3], f.v[6], f.v[9]) <= 1e9 && (() => { const l = [0, 3, 6, 9].map(j => (f.v[j] - sg.sx) * sg.r[0] + (f.v[j + 2] - sg.sz) * sg.r[1]); return Math.min(...l) <= lat + .01 && Math.max(...l) >= lat - .01; })()); if (has !== !!q.open[k]) o.bad.push('床と決まりが合わない lane ' + k + ' open ' + q.open[k]); } }
    G.paused = false; o.bad = [...new Set(o.bad)].slice(0, 8); return o; })()`);
  for (const x of r2.bad) bad.push('板の無い道: ' + x);
  if (r2.n < 400) bad.push('板の無い所が少なすぎる（見張りがこわれている）: ' + r2.n);
  if (r2.lanes.some(x => x < 30)) bad.push('左だけ・真ん中だけ・右だけ が、どれも出るようになっていない: ' + r2.lanes.join(','));
  /* (3)(4) */
  const fallSetup = `G.jumpTo('mvalley', 720, 1); G.invT = 0; G.pow.fly = 0; G.pow.dash = 0; G.fever = 0; window.__frameErr = 0; const sg = G.segs[0], pt = sg.pits[0], badL = pt.open.indexOf(0);`;
  await ev(`(() => { ${fallSetup} G.s = pt.a - 6; G.lane = badL; G.lat = LANES[badL]; G.prevLane = badL; })()`);
  let r3 = null; for (let i = 0; i < 40; i++) { await p.waitForTimeout(200); r3 = await ev(`({ mode: G.mode, cause: G.cause, y: G.y, pitch: CAM.pitch, fe: window.__frameErr || 0, msg: window.__frameErrMsg || '' })`); if (r3.mode !== 'play' && (r3.y < -6 || r3.mode === 'dead')) break; } /* 遅い機械でも待つ（時間ではなく、落ち始めて 6m 下がるまで） */
  if ((r3.mode !== 'dying' && r3.mode !== 'dead') || r3.cause !== 'pit') bad.push('板の無いレーンに立っても落ちない: ' + JSON.stringify(r3));
  if (!(r3.y < -3)) bad.push('落ちていかない（高さ ' + r3.y + '）'); if (r3.mode === 'dying' && !(r3.pitch > .9)) bad.push('落ちる時、カメラが穴を見下ろしていない（' + r3.pitch + '）'); if (r3.fe) bad.push('落ちる間の絵のエラー: ' + r3.msg);
  for (let i = 0; i < 50; i++) { await p.waitForTimeout(200); if ((await ev('G.mode')) === 'dead') break; }
  const r3b = await ev(`(() => { const o = { mode: G.mode, y: G.y }; G.hay = 99999; SV.clovers = 9; try { doRevive('clover'); G.mode = 'play'; } catch (e) { o.err = e.message; } const sg = curSeg(), op = mvOpenAt(sg, G.s); o.after = G.mode; o.y2 = G.y; o.onPlank = !op || !!op[G.lane]; o.lat = G.lat; o.lane = G.lane; o.fe = window.__frameErr || 0; return o; })()`);
  if (r3b.mode !== 'dead') bad.push('落ちたあと、終わりの画面にならない: ' + r3b.mode); if (r3b.y > -30) bad.push('谷の底まで落ちていない: ' + r3b.y);
  if (r3b.err || !r3b.onPlank || r3b.y2 !== 0) bad.push('続けた時、板のあるレーンに戻らない: ' + JSON.stringify(r3b));
  const r4 = await ev(`(() => { ${fallSetup} const o = {}; G.s = pt.a - 3; G.lane = badL; G.lat = LANES[badL]; G.prevLane = badL; G.y = 1.4; G.vy = 3; G.air = true; for (let i = 0; i < 8; i++) update(1 / 60); o.air = G.mode;
    G.jumpTo('mvalley', 720, 1); const s2 = G.segs[0], p2 = s2.pits[0], b2 = p2.open.indexOf(0); G.invT = 99; G.s = p2.a - 9; G.lane = b2; G.lat = LANES[b2]; G.prevLane = b2; let fell = 0, off = 0; for (let i = 0; i < 900 && curSeg() === s2; i++) { G.invT = 99; update(1 / 60); if (G.mode !== 'play') { fell = 1; break; } const op = mvOpenAt(s2, G.s); if (op && !op[mvLaneOf(G.lat)] && G.y < .05) off++; } o.fell = fell; o.off = off; o.fe = window.__frameErr || 0; return o; })()`);
  if (r4.air !== 'play') bad.push('跳んでいる間に落ちた'); if (r4.fell) bad.push('無敵の間に落ちた'); if (r4.off > 2) bad.push('無敵の間、板の無い所を走っている（' + r4.off + ' コマ）');
  /* (4a) 夜でも見分けられる：板の無い所ごとに、残った板のふちの「夜に光る線」がある（2026-11-28：夜明け前は板と谷の明るさがほぼ同じだった） */
  const r4a = await ev(`(() => { G.jumpTo('mvalley', 300, 1); const sg = G.segs[0]; let miss = 0; for (const q of sg.pits) { const n = sg.lines.filter(l => l.mvEdge && l.glowN && l.a[0] >= q.a - .01 && l.b[0] <= q.b + .01).length; if (n < 2) miss++; } return { pits: sg.pits.length, miss }; })()`);
  if (!r4a.pits || r4a.miss) bad.push('夜に光るふちの線が無い、板の無い所がある（' + r4a.miss + '/' + r4a.pits + '）');
  /* (4a2) 橋の真上を走っている間、板より下の物（塔の足・谷の底の物）は描かれない（2026-11-28：塔の足が、板の上を画面の下までつきぬけて見えた） */
  const r4c = await ev(`(() => { G.jumpTo('mvalley', 720, 1); for (let i = 0; i < 30; i++) { G.invT = 99; update(1 / 60); } const sg = curSeg(); return { below: sg.props.filter(q => q.mvBelow).length, shown: sg.props.filter(q => q.mvBelow && !q.nodraw).length, deep: sg.spr.filter(q => q.y + (q.h || 0) < -1 && !q.under).length, tall: sg.props.filter(q => !q.mvBelow && (q.bx || []).some(b => b.y0 < -1.5)).length }; })()`);
  if (!r4c.below || r4c.shown || r4c.deep || r4c.tall) bad.push('板より下の物が、板の上に重なって描かれる（' + JSON.stringify(r4c) + '）');
  /* (4b) 助けなしで、板の残っているレーンを走って 1 つこえると、ごほうびが出る（[手 1]）。「やさしい」の時は、いつも 2 レーン残る */
  let r4b = null; for (let k = 0; k < 4; k++) { r4b = await ev(`(() => { G.jumpTo('mvalley', 720, 1); const s2 = G.segs[0], p2 = s2.pits[0], ok = p2.open.indexOf(1), b0 = G.bumps || 0; G.stats.pitPass = 0; const sc0 = G.score; G.s = Math.max(1, p2.a - 4); G.lane = ok; G.prevLane = ok; G.lat = LANES[ok]; for (const o of s2.obs || []) o.dead = 1; for (let i = 0; i < 600 && curSeg() === s2 && G.s < p2.b + 2; i++) { G.invT = 0; G.fever = 0; update(1 / 60); if (G.mode !== 'play') break; } const r = { mode: G.mode, pass: G.stats.pitPass || 0, up: G.score - sc0, bump: (G.bumps || 0) - b0 };
    G.easy = true; let two = 0, n = 0; const base = G.segs[0]; for (let i = 0; i < 60; i++) { const sg = newSeg(base, { t: 'mvalley', d: 5, straightOut: 1, cont: 1, co: 'maihama' }, { straight: true }); for (const q of sg.pits || []) { n++; if (q.open[0] + q.open[1] + q.open[2] >= 2) two++; } } G.easy = false; r.easyN = n; r.easyTwo = two; return r; })()`); if (r4b.mode === 'play' && !r4b.bump) break; }
  if (r4b.mode === 'play' && !r4b.bump && !(r4b.pass >= 1)) bad.push('板の無い所をこえても、ごほうびが出ない（' + JSON.stringify(r4b) + '）'); if (!r4b.easyN || r4b.easyTwo !== r4b.easyN) bad.push('「やさしい」なのに、1 レーンしか残らない所がある（' + r4b.easyTwo + '/' + r4b.easyN + '）');
  /* (5) */
  const r5 = await ev(`(() => { const st = COURSES.maihama.steps.map((x, i) => Object.assign({ co: 'maihama', co0: i === 0 }, x)), i0 = st.findIndex(x => x.t === 'mplaza'); G.jumpTo('mplaza', 720, 1); G.segs[0].step = st[i0]; G.segs[0].turn = 0; G.segs[0].straight = true; G.courseQ = st.slice(i0 + 1); G.segs.length = 1; G.plan = dayPlan(1).filter(x => !x.fork); ensureSegs(); window.__frameErr = 0;
    const o = { seen: {}, jump: 0, yawMax: 0, stuck: 0, cartLane: 0, cartRow: 0, kMin: 9, kMax: 0, e: [], frames: 0, died: '', bends: 0 }; let px = null, pz = null, pyaw = null, lastS = -1, same = 0, cartT = 0;
    for (let i = 0; i < 60 * 240; i++) { G.invT = 99; const sg0 = curSeg(); if (sg0.th.ride && i % 40 === 0) act(i % 80 ? 'left' : 'right'); update(1 / 60); o.frames++; if (G.mode !== 'play') { o.died = G.mode + ' ' + G.cause; break; } const sg = curSeg(); o.seen[sg.tid] = (o.seen[sg.tid] || 0) + 1;
      const q = segPos(sg, G.s, G.lat); if (px != null) { const d = Math.hypot(q[0] - px, q[1] - pz), lim = G.speed / 60 * 1.7 + .5; if (d > lim) o.jump = Math.max(o.jump, +d.toFixed(2)); } px = q[0]; pz = q[1];
      if (pyaw != null && sg.th.void) { let dy = Math.abs(G.camYaw - pyaw); if (dy > Math.PI) dy = Math.PI * 2 - dy; o.yawMax = Math.max(o.yawMax, +dy.toFixed(4)); } pyaw = G.camYaw; if (sg.turnIn && Math.abs(sg.turnIn) < 1 && G.s < .3) o.bends++;
      if (sg.th.ride) { cartT++; if (G.lane !== 1 && cartT > 20) o.cartLane++; if (cartT > 90 && (Math.abs(G.follow.lat - G.lat) > .4 || G.follow.back < 1.2)) o.cartRow++; const k = mvRideK(sg); o.kMin = Math.min(o.kMin, k); o.kMax = Math.max(o.kMax, k); if (!G.player.cart) o.cartLane += 100; }
      if (Math.abs(G.s - lastS) < 1e-4) { if (++same > 240) { o.stuck = 1; break; } } else same = 0; lastS = G.s;
      if (sg.tid === 'mcastle' && G.s > 30) { o.e = [segE(sg, G.s) - (sg.base != null ? sg.base : 0), sg.dir]; break; } }
    o.fe = window.__frameErr || 0; o.msg = (window.__frameErrMsg || '') + ' @ ' + (window.__frameErrAt || ''); o.st = [G.stats.mvCart | 0, G.stats.mvPhoto | 0, G.stats.mvCastle | 0]; return o; })()`);
  if (r5.st.join('') !== '111') bad.push('トロッコ・記念写真・お城の到着のどれかが起きていない（' + r5.st.join('') + '）');
  if (r5.died) bad.push('コースの途中で終わった: ' + r5.died); if (r5.stuck) bad.push('コースの途中で止まった'); if (r5.fe) bad.push('コースの絵・動きのエラー: ' + r5.msg);
  for (const t of ['mhill', 'mfarm', 'mvalley', 'mcurve', 'mcart', 'mlake', 'mcastle']) if (!r5.seen[t]) bad.push('通らなかった場所: ' + t + '（' + Object.keys(r5.seen).join(',') + '）');
  if (r5.jump) bad.push('1 コマで横へ飛んだ（' + r5.jump + 'm）'); if (r5.yawMax > .05) bad.push('曲線でカメラがかくっと回る（1 コマ ' + r5.yawMax + '）');
  if (r5.cartLane) bad.push('トロッコの間に、操作がきいた・乗っていない（' + r5.cartLane + '）'); if (r5.cartRow > 30) bad.push('トロッコが 1 列になっていない（' + r5.cartRow + ' コマ）');
  if (!(r5.kMin < .9 && r5.kMax > 1.2)) bad.push('トロッコの速さが、のぼりでおそく・くだりで速くなっていない（' + r5.kMin + '〜' + r5.kMax + '）');
  if (r5.e.length && Math.abs(r5.e[0]) > .05) bad.push('トロッコをおりた先が、地面の高さに戻っていない（' + r5.e[0] + 'm）');
  /* (6) */
  const r6 = await ev(`(() => { G.jumpTo('ginza', 720, 1); G.courseDone = { tower: 1, skytree: 1, asakusa: 1 }; G.courseQ = []; G.courseDue = null; G.score = 1000001; G.segs.length = 1; G.plan = [{ t: 'nakadori', d: 20 }, { t: 'otemachi', d: 20 }, { t: 'gyoko', d: 20 }]; let t = ''; for (let i = 0; i < 60 * 40 && !t; i++) { G.invT = 99; update(1 / 60); if (G.mode !== 'play') break; ensureSegs(); const f = G.segs.find(s => s.step && s.step.co === 'maihama'); if (f) t = f.tid; } return { t, due: G.courseDue, done: !!G.courseDone.maihama }; })()`);
  if (r6.t !== 'keiyo') bad.push('100 万点でコースが始まらない: ' + JSON.stringify(r6));
  await b.close();
  console.log(JSON.stringify({ 板の無い所: r2.n, 左中右: r2.lanes.join('/'), 通った場所: Object.keys(r5.seen).length, コマ: r5.frames, 曲線: r5.bends, 回る速さ: r5.yawMax, トロッコの速さ: (r5.kMin || 0).toFixed(2) + '〜' + (r5.kMax || 0).toFixed(2) }));
  if (bad.length) { console.log('NG'); for (const x of [...new Set(bad)].slice(0, 24)) console.log(' - ' + x); process.exit(1); }
  console.log('MAIHAMA OK');
})();
