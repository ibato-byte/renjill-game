// 電波塔コース（2026-11-17 オーナー：10万点で赤い電波塔を階段で登り、頂上から景色を見て、オオタカに運ばれて地上へ。30万点で押上の電波塔も同じ流れ）
// 確かめること：①10万点・30万点をこえると、コースが本当に始まる（足もと → 階段／展望台 → 空 → 公園に着地の順）。1 回の遊びで 1 回ずつ
// ②会社・電車の中のすぐあとからは始めない ③空の上：障害物なし・高さが下がる（はじめは塔の高さ、終わりは 0m）・カメラが回る・左右の操作で道からはずれない・かげが無い
// ④展望台にいる間は、空の先（地面の高さの公園）を描かない ⑤同じ目印は、コースのどの場所でも同じ本当の方角（brg） ⑥エラーなし
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200);
  await p.evaluate(() => window.__hayDash.ev('hideAll(); startRun()')); await p.waitForTimeout(600);
  // ⑤ 方角のそろい
  const brg = await p.evaluate(() => window.__hayDash.ev(`(() => { const out = []; for (const k in COURSES) { const seen = {}; for (const st of COURSES[k].steps) { const th = THEMES[st.t]; if (!th) { out.push('場所が無い ' + st.t); continue; } if (!th.climb) continue; /* 塔の上・空の上だけ（地上の足もと・着地の公園は、塔とは別の場所から見ている） */
    if (th.face == null) out.push(st.t + ' に向き（face）が無い'); for (const lm of th.lm || []) { if (lm.brg == null) { out.push(st.t + ' の ' + lm.t + ' に方角が無い'); continue; } if (seen[lm.t] != null && Math.abs(seen[lm.t] - lm.brg) > 3) out.push(k + '：' + lm.t + ' の方角が場所でちがう ' + seen[lm.t] + '/' + lm.brg); seen[lm.t] = lm.brg; } } }
    return out; })()`)); bad.push(...brg);
  // ⑧ 上から見た東京：本物の地図のビル・お寺・五重塔が、川・運河の上に立っていない（2026-11-18 オーナー「川の上にビルが来たらおかしい」）
  bad.push(...await p.evaluate(() => window.__hayDash.ev(`(() => { const out = []; const sd = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dz * t) * 1000; };
    for (const [nm, M] of [['赤い電波塔', RM_TOWER], ['押上', RM_SKY]]) for (const W of [M.water, M.water2]) { if (!W) continue; const [ln, w] = W; for (const b of [...M.bld, ...(M.temple || []), ...(M.pagoda || [])]) { let d = 1e9; for (let i = 0; i + 1 < ln.length; i++) d = Math.min(d, sd(b, ln[i], ln[i + 1])); if (d < w / 2 + 25) out.push(nm + '：川の上に建物 ' + b.slice(0, 2).join(',')); } } return out; })()`)));
  // ⑦ 1 日の道順に、行き先の無い道（undefined）が無い（2026-11-18：その日にもう通った所しか候補が無いと、行き先が空になり、道が作れずに走りが止まった）
  bad.push(...await p.evaluate(() => window.__hayDash.ev(`(() => { const out = new Set(); const chk = (x, d) => { if (!x) return; if (Array.isArray(x)) return x.forEach(y => chk(y, d)); if (x.fork) { chk(x.fork.L, d); chk(x.fork.R, d); return; } if (!themeFor(x.t, d)) out.add('道順に行き先の無い道 ' + x.t); }; for (let k = 0; k < 300; k++) { const d = 1 + (k % 40); dayPlan(d).forEach(x => chk(x, d)); } return [...out]; })()`)));
  await p.evaluate(() => { const { G } = window.__hayDash; G.jumpTo('ginza', 640, 1); G.invT = 999; G.score = 500500; G.pow.fly = 0; }); await p.waitForTimeout(400);
  const seen = [], info = { sky: [] }; let prevTid = null;
  for (let it = 0; it < 110; it++) {
    const r = await p.evaluate(() => window.__hayDash.ev(`(() => { const seg = G.segs[G.ci], th = seg.th, prev = G.segs[G.ci - 1]; G.invT = 999; G.pow.fly = 0; G.fever = 0;
      const o = { tid: seg.tid, sky: !!th.sky, prevKind: prev ? prev.th.kind : '', course: th.course || '', mode: G.mode, fe: window.__frameErr || 0, order: segOrder().map(s => s.tid), cut: skyCut(), segs: G.segs.map(s => s.tid) };
      if (th.sky) { o.obs = seg.obs.length; o.e0 = seg.e0 - (seg.base || 0); o.climb0 = th.climb[0]; o.endE = segE(seg, seg.len) - (seg.base || 0); o.prevEnd = G.segs[G.ci - 1] ? segE(G.segs[G.ci - 1], G.segs[G.ci - 1].len) - seg.e0 : 0; G.s = seg.len * .2; o.a1 = altitude(seg, G.s); G.s = seg.len * .5; o.spin = skySpin(seg); o.spinMax = 0; for (let k = 0; k <= 40; k++) { G.s = seg.len * .5 * k / 40; o.spinMax = Math.max(o.spinMax, Math.abs(skySpin(seg))); } o.spinEnd = (a => Math.abs(Math.atan2(Math.sin(a), Math.cos(a))))(skySpin((G.s = seg.len * .7, seg))); o.lookMid = skyLookK((G.s = seg.len * .3, seg)); o.lookEnd = skyLookK((G.s = seg.len * .7, seg)); G.s = seg.len * .5; const lane = G.lane, lat = G.lat; act('left'); act('right'); act('right'); o.laneKept = G.lane === lane && G.lat === lat; G.s = seg.len * .8; o.a2 = altitude(seg, G.s); o.prevHidden = prevHidden(); }
      if (th.grab || (th.climb && !th.sky)) { const ix = G.segs.findIndex(s => s.th.sky); if (ix > G.ci) o.drawsBeyondSky = segOrder().some(s => G.segs.indexOf(s) > ix); }
      return o; })()`));
    if (r.mode !== 'play') { bad.push('走りが止まった（' + r.mode + '）'); break; }
    if (r.tid !== prevTid) { seen.push(r.tid); prevTid = r.tid;
      if (r.tid === 'tfoot' || r.tid === 'sfoot') { if (['room', 'train', 'glass'].includes(r.prevKind)) bad.push(r.tid + '：建物・電車の中のすぐあとから始まった'); }
      if (r.sky) { info.sky.push(r); if (r.obs) bad.push(r.tid + '：空の上に障害物 ' + r.obs); if (Math.abs(r.e0 - r.climb0) > 1.5) bad.push(r.tid + '：はじめの高さが塔とちがう ' + r.e0); if (Math.abs(r.prevEnd) > .5) bad.push(r.tid + '：飛び立つ展望台と空の道の高さがずれている ' + r.prevEnd); if (Math.abs(r.endE) > .5) bad.push(r.tid + '：終わりが地面（0m）でない ' + r.endE);
        if (!(r.a1 > r.a2 + 50)) bad.push(r.tid + '：高さが下がらない ' + r.a1 + '→' + r.a2); /* 2026-11-20 オーナー「降りる時に道路が動く」：1 回転はやめ、左右を少し見わたすだけにした → 2026-11-20 オーナー「前の（ぐるっと見てから降りる）方がよかった」：1 回転を元にもどし、前半で回り終える。回っている間は遠くの景色を見る */ if (!(r.spinMax > 5.5)) bad.push(r.tid + '：カメラがぐるっと 1 回転しない ' + r.spinMax); if (r.spinEnd > .01) bad.push(r.tid + '：着地の前もカメラが横を向いている（回り終わっていない） ' + r.spinEnd); if (!(r.lookMid > .8)) bad.push(r.tid + '：回っている間、遠くの景色を見ていない（下の道ばかり見る） ' + r.lookMid); if (r.lookEnd > 0) bad.push(r.tid + '：着地の前も上を見たまま ' + r.lookEnd); if (!r.laneKept) bad.push(r.tid + '：左右の操作で道からはずれた'); if (!r.prevHidden) bad.push(r.tid + '：うしろの展望台を描いている'); }
      if (r.drawsBeyondSky) bad.push(r.tid + '：展望台・階段から、空の先（地面の公園）が見えている'); }
    if (r.fe) { bad.push('絵のエラー ' + r.tid + ' ' + (await p.evaluate(() => window.__frameErrMsg + ' @ ' + window.__frameErrAt))); break; }
    if (seen.includes('denboin') && r.tid !== 'denboin') break;
    await p.waitForTimeout(250);
    await p.evaluate(() => { const H = window.__hayDash, G = H.G, seg = G.segs[G.ci]; G.invT = 999; G.s = seg.len - 2; for (const o of seg.obs) o.dead = .001; if (!seg.th.sky && !seg.th.grab) H.act(seg.fork ? 'left' : seg.turn < 0 ? 'left' : 'right'); });
    await p.waitForTimeout(450);
  }
  const path1 = seen.join('>'); const want = [['tfoot', 'tlobby', 'troof', 'tstair', 'tpass', 'tdeck', 'hawk', 'tland'], ['sfoot', 'slobby', 'selev', 'sdeck', 'selev2', 'skytree', 'hawk2', 'sland'], ['asakusa', 'nakamise', 'hozomon', 'hondo', 'denboin']];
  for (const w of want) { const i = seen.lastIndexOf(w[0]); if (i < 0 || seen.slice(i, i + w.length).join('>') !== w.join('>')) bad.push('コースの順番がちがう：' + w.join('>') + ' ／ 通った道：' + path1); }
  if (seen.filter(x => x === 'tfoot').length > 1) bad.push('赤い電波塔コースが 2 回始まった');
  if (seen.indexOf('tfoot') > seen.indexOf('sfoot')) bad.push('30万点のコースが 10万点のコースより先'); if (seen.indexOf('sfoot') > seen.indexOf('nakamise')) bad.push('50万点のコースが 30万点のコースより先');
  await b.close(); if (bad.length) { console.log('TOWERCOURSE NG\n' + [...new Set(bad)].join('\n')); process.exit(1); }
  console.log('TOWERCOURSE OK ' + path1 + ' / 空の高さ ' + info.sky.map(s => s.a1 + '→' + s.a2 + 'm').join(', ')); })();
