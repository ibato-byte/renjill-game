// Y 字路（2026-11-16 オーナー：「左右に曲がるだけでなく、Y 字路も。景色が透けたり世界観が崩れたりしないように」）
// 確かめること：①外の通り → 外の通り 2 本の分かれ道は Y 字にできる（公園・門のある所・室内は Y 字にしない）
// ②2 本は 45 度ずつ左右へ ③左も右も：曲がったあと道の上にいて（3 レーンの中）、止まらず、その先の角（90 度）も曲がれる
// ④エラー・安全網（rescue）なし ⑤分かれ目の路面と、とがった角の建物の正面・札がある
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  for (const [side, T] of [['left', ['ginza', 'shibuya', 'akihabara']], ['right', ['otemachi', 'ginza', 'shinjuku']], ['left', ['shinjuku', 'roppongi', 'ikebukuro']]]) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })); window.__forceY = 1; });
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200); await p.evaluate(() => window.__hayDash.ev('hideAll(); startRun()')); await p.waitForTimeout(600);
    const st = await p.evaluate(([a, l, r]) => window.__hayDash.ev(`(() => { const fk = { label: 'lunch', L: { t: '${l}', d: 40 }, R: { t: '${r}', d: 40 }, lbl: { L: { ja: 'L', en: 'L' }, R: { ja: 'R', en: 'R' } } };
      const s0 = newSeg(null, { t: '${a}', d: 60 }, { t0: 720, day: 1, fork: fk, empty: true }); try { s0.forkLbl = forkLabels(fk); } catch (e) {}
      G.segs = [s0]; G.ci = 0; G.fork = null; G.s = s0.len - 40; G.lane = 1; G.lat = 0; G.plan = [{ fork: fk }].concat(dayPlan(1).filter(x => !x.fork).slice(3)); G.planClock = s0.t1; G.planDay = 1; ensureSegs();
      const p = segPos(s0, G.s, 0); G.rx = p[0]; G.rz = p[1]; G.camYaw = 0; G.ey = G.camE = null; G.invT = 99; G.mode = 'play'; window.__rescue = 0;
      return { y: !!s0.forkY, d: G.fork ? G.fork.map(s => s.dir) : null, pad: s0.floor.some(f => f.yPad), front: !!s0.yFront, sign: s0.decos.some(d => d.sign), park: yOK(THEMES.hibiya, fk, 1), room: yOK(THEMES.meeting, fk, 1), gate: yOK(THEMES.ginza, { L: { t: 'ameyoko' }, R: { t: 'shibuya' } }, 1) }; })()`), T);
    const tag = T.join('→') + ' ' + side + '：';
    if (!st.y) bad.push(tag + 'Y 字にならない'); if (!st.d || Math.abs(st.d[0] - 3.5) > .01 || Math.abs(st.d[1] - .5) > .01) bad.push(tag + '2 本が 45 度ずつになっていない ' + JSON.stringify(st.d));
    if (!st.pad || !st.front || !st.sign) bad.push(tag + '分かれ目の路面・正面・札が無い'); if (st.park || st.room || st.gate) bad.push(tag + '公園・室内・門のある所が Y 字になる');
    await p.evaluate((sd) => { const { G, act } = window.__hayDash; window.__turns = 0; setInterval(() => { if (G.mode !== 'play') return; const seg = G.segs[G.ci]; G.invT = 99; if (G.s > seg.len - Math.max(13, G.speed) + 1 && !G.turnQueued) { window.__turns++; act(seg.fork ? sd : seg.turn > 0 ? 'right' : 'left'); } }, 50); }, side);
    let afterY = null, ci0 = null;
    for (let i = 0; i < 400; i++) { await p.waitForTimeout(100); const r = await p.evaluate(() => { const G = window.__hayDash.G, seg = G.segs[G.ci]; return { mode: G.mode, half: seg.halfIn, s: G.s, lat: G.lat, id: seg.id, turns: window.__turns, resc: window.__rescue || 0, ferr: window.__frameErr || 0 }; });
      if (r.mode !== 'play') { bad.push(tag + '走りが止まった（' + r.mode + '）'); break; }
      if (r.half && !afterY) { afterY = r; ci0 = r.id; const want = side === 'left' ? -1 : 1; if (r.half !== want) bad.push(tag + '選んだ側と違う道に入った'); if (Math.abs(r.lat) > 2.7) bad.push(tag + '曲がったあと道の外にいる（' + r.lat.toFixed(2) + '）'); }
      if (afterY && r.id !== ci0) { if (r.resc) bad.push(tag + '安全網が動いた'); if (r.ferr) bad.push(tag + '絵のエラー'); afterY.done = 1; break; } }
    if (!afterY) bad.push(tag + 'Y 字路を曲がれなかった'); else if (!afterY.done) bad.push(tag + 'Y 字路の先の角を曲がれなかった');
    await p.close(); }
  await b.close(); if (bad.length) { console.log('YFORK NG\n' + [...new Set(bad)].join('\n')); process.exit(1); } console.log('YFORK OK 3 通り（左・右）'); })();
