// 赤い電波塔：入口の建物の階段を上りきり、右に曲がって屋上へ出るところ（2026-11-19 オーナー「止まったり、外の景色がおかしくなる」）
// ① コースを最後まで（階段の 10m 先まで）走って、エラーも止まりもない
// ② 屋上のまわりに、下の地面・まわりのビル・公園の木がある（前は 700m 先まで何もなかった）。曲がり角（道の始まりより手前）には置かない
// ③ 遠くの町の絵は、曲がっている間も毎コマ描きなおさない（ずらしてはる）。上下の向きが変わっただけでは描きなおさない
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200);
  await p.evaluate(() => window.__hayDash.ev('hideAll(); startRun()')); await p.waitForTimeout(500);
  // ②
  const roof = await p.evaluate(() => { const { G } = window.__hayDash; G.jumpTo('tfoot', 640, 1); const H = window.__hayDash; const seg = H.ev('newSeg(null, { t: "troof", d: 30 }, { t0: 640, day: 1 })'); const th = seg.th; const G0 = -th.climb[0];
    const low = arr => arr.filter(w => (w.v || []).length && Math.min(...w.v.filter((_, i) => i % 3 === 1)) < G0 + 1);
    return { ground: seg.floor.filter(f => f.far && f.v && Math.max(...f.v.filter((_, i) => i % 3 === 1)) < G0 + .5).length, walls: low(seg.walls).length, trees: seg.spr.filter(q => q.img === 'canopy_green' && q.y <= G0 + .1).length, treeS: Math.min(...seg.spr.filter(q => q.img === 'canopy_green').map(q => q.s)), boxes: seg.props.reduce((n, pr) => n + (pr.bx || []).filter(x => x.y0 <= G0 + .1 && x.y1 > G0 + 8).length, 0) }; });
  if (roof.ground < 6) bad.push('屋上の下の地面が少ない ' + roof.ground); if (roof.walls < 10) bad.push('屋上のまわりのかべ・ビルの絵が少ない ' + roof.walls); if (roof.boxes < 4) bad.push('まわりのビル（立体）が少ない ' + roof.boxes); if (roof.trees < 4) bad.push('公園の木が少ない ' + roof.trees); if (roof.treeS < 10) bad.push('公園の木が曲がり角に近い（建物の中からかべごしに見える）' + roof.treeS);
  // ③
  const sky = await p.evaluate(() => { const H = window.__hayDash, { G } = H; G.jumpTo('shinbashi', 600, 1); G.invT = 999; H.ev('lowQ = 0'); G.lockQ = 1; G.mode = 'pause'; let n = 0; const f = H.ev('skyline3d'); H.ev('skyline3d = (function(f){ return function(){ window.__skyN = (window.__skyN || 0) + 1; return f.apply(this, arguments); }; })(skyline3d)');
    H.ev('SK3C[0] = SK3C[1] = null; render()'); window.__skyN = 0; G.turnT = .6; for (let i = 0; i < 20; i++) { H.ev('CAM.yaw += .02; render()'); } const turn = window.__skyN; G.turnT = 0; window.__skyN = 0; for (let i = 0; i < 20; i++) { H.ev('CAM.pitch += .002; render()'); } const pitch = window.__skyN; H.ev('skyline3d = ' + 'f'.replace('f', '(' + f.toString() + ')')); return { turn, pitch }; });
  if (sky.turn > 24) bad.push('曲がっている間、遠くの町を毎コマ描きなおしている（2 層 × 20 コマで ' + sky.turn + ' 回）'); if (sky.pitch > 0) bad.push('上下の向きが変わっただけで、遠くの町を描きなおしている ' + sky.pitch);
  // ①
  await p.evaluate(() => { const H = window.__hayDash, { G, act } = H; G.jumpTo('ginza', 640, 1); G.invT = 999; G.courseDue = 'tower'; G.courseDone = G.courseDone || {};
    setInterval(() => { if (G.mode !== 'play') return; const seg = G.segs[G.ci]; G.invT = 99; G.pow.fly = 0; if (G.s > seg.len - Math.max(13, G.speed) + 1 && !G.turnQueued) act(seg.fork ? 'left' : seg.turn > 0 ? 'right' : 'left'); }, 16); });
  let st = null, seen = new Set();
  for (let i = 0; i < 2400; i++) { await p.waitForTimeout(100); st = await p.evaluate(() => { const G = window.__hayDash.G, s = G.segs[G.ci]; return { tid: s.tid, s: G.s, mode: G.mode, fe: window.__frameErr || 0, msg: window.__frameErrMsg || '' }; }); seen.add(st.tid);
    if (st.mode !== 'play') { bad.push('走りが止まった（' + st.mode + '）'); break; } if (st.fe) { bad.push('描く途中のエラー ' + st.msg); break; } if (st.tid === 'tstair' && st.s > 10) break; }
  if (!(seen.has('tlobby') && seen.has('troof') && st && st.tid === 'tstair')) bad.push('階段の入口まで行けなかった ' + [...seen].join('>'));
  console.log(JSON.stringify({ roof, sky }));
  await b.close(); if (bad.length) { console.log('TOWERTURN NG\n' + bad.join('\n')); process.exit(1); } console.log('TOWERTURN OK');
})();
