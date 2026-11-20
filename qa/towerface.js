// 電波塔コースの「向き」がつじつまが合っているか（2026-11-20 オーナー「東京タワーが正面に見えていたのに、右に曲がったらまた見えるような矛盾」）
// ① 曲がる向きは決まっている（毎回同じ）：赤い電波塔は まっすぐ → 右 → 左 → まっすぐ → 左、押上は足もとからまっすぐ入口へ
// ② 道の本当の向き（face）は、一つ前の道の向き＋曲がった向き（エレベーターの中だけは例外）。塔・山の見える方角が、道をまたいでずれない
// ③ 塔の足もとでは塔が正面、塔の階段でも塔（の方角）が正面。屋上（塔の脚の真下）は右に曲がった先
// ④ 展望台の向きは、場所で決めた向き（景色の見え方）から 30° 以内
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200);
  await p.evaluate(() => window.__hayDash.ev('hideAll(); startRun()')); await p.waitForTimeout(400);
  const runs = [];
  for (const k of ['tower', 'skytree', 'tower', 'skytree', 'tower']) runs.push(await p.evaluate(k => { const H = window.__hayDash, { G } = H; G.mode = 'pause';
    G.jumpTo('ginza', 640, 1); G.mode = 'pause'; G.courseDone = {}; G.courseQ = null; G.courseDue = k; G.plan = [{ t: 'ginza', d: 60 }, { t: 'ginza', d: 60 }].concat(G.plan || []);
    const rec = {}, order = [];
    for (let n = 0; n < 40 && order.length < 9; n++) { H.ev('ensureSegs()'); for (const s of G.segs) if (s.step && s.step.co === k && !rec[s.id]) { rec[s.id] = 1; order.push({ t: s.tid, dir: s.dir, turn: s.turn, face: H.ev('segFace')(s), lift: !!s.th.lift, auth: s.th.face }); } G.ci = G.segs.length - 1; }
    return { k, order }; }, k));
  const ang = (a, b) => { const d = ((a - b) % 360 + 540) % 360 - 180; return Math.abs(d); };
  const want = { tower: [['tfoot', 0], ['tlobby', 1], ['troof', -1], ['tstair', 0], ['tpass', -1]], skytree: [['sfoot', 0]] };
  const sig = {};
  for (const r of runs) { const o = r.order; if (o.length < 8) { bad.push(r.k + ': コースの道が全部できない ' + o.map(x => x.t).join('>')); continue; }
    for (const [t, tu] of want[r.k]) { const x = o.find(y => y.t === t); if (!x || x.turn !== tu) bad.push(r.k + ': ' + t + ' の曲がる向きが ' + (x && x.turn) + '（' + tu + ' のはず）'); }
    for (let i = 1; i < o.length; i++) { const a = o[i - 1], c = o[i]; if (c.lift || c.face == null || a.face == null) continue; const exp = ((a.face + (c.dir - a.dir) * 90) % 360 + 360) % 360; if (ang(exp, c.face) > .5) bad.push(r.k + ': ' + a.t + '→' + c.t + ' の向きがずれる（' + c.face + ' / ' + exp + '）'); }
    const s = o.slice(0, -1).map(x => x.t + ':' + x.turn + ':' + Math.round(x.face)).join(' '); if (sig[r.k] && sig[r.k] !== s) bad.push(r.k + ': 走るたびに向きが変わる'); sig[r.k] = s;
    const F = t => (o.find(y => y.t === t) || {}).face;
    if (r.k === 'tower') { if (ang(F('tfoot'), 250) > 1) bad.push('塔の足もとで塔が正面にない'); if (ang(F('tstair'), 250) > 1) bad.push('塔の階段で塔の方角が正面にない ' + F('tstair')); if (ang(F('troof'), 340) > 1) bad.push('屋上の向きがおかしい ' + F('troof')); if (ang(F('tdeck'), 135) > 30) bad.push('展望台の向きが景色から離れすぎ ' + F('tdeck')); }
    else { if (ang(F('sdeck'), 226) > 30) bad.push('押上の展望デッキの向きが景色から離れすぎ ' + F('sdeck')); if (ang(F('skytree'), 21) > 30) bad.push('押上の回廊の向きが景色から離れすぎ ' + F('skytree')); } }
  console.log(JSON.stringify(sig));
  await b.close(); if (bad.length) { console.log('TOWERFACE NG\n' + [...new Set(bad)].join('\n')); process.exit(1); } console.log('TOWERFACE OK');
})();
