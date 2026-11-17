// 現実味の見張り（2026-11-17 オーナー：「右に曲がっても左に曲がっても正面にタワーや皇居が見えるのはおかしい」「Y 字路がリリースされてない」「通り過ぎた景色が消えていく」）
// 確かめること：① 一度見えた目印（塔・城・山）は、角を曲がっても世界の同じ向きにある（次の道でまた正面に出ない）
// ② 昼ごはん・おつかいの分かれ道の半分以上が、Y 字路にできる形（外の道で、先の 2 本も外の道）になっている。分かれ道の手前は外の道
// ③ 道のわきの物（走る 3 レーンの外）は、通りすぎる時にうすくしない（うすくするのは、レーンの真上の物だけ） ④ 分かれ道で選ばなかった道は、選んだ直後も描く
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200);
  // ②
  const y = await p.evaluate(() => window.__hayDash.ev(`(() => { let n = 0, ok = 0, pre = 0; for (let d = 1; d <= 40; d++) { const plan = dayPlan(1 + d % 5); for (let i = 0; i < plan.length; i++) { const st = plan[i]; if (!st.fork || st.fork.label === 'detour') continue; n++; const pv = plan[i - 1], th = pv && pv.t && themeFor(pv.t, 1); if (th && th.kind === 'street') pre++; if (th && yOK(th, st.fork, 1)) ok++; } } return { n, ok, pre }; })()`));
  if (!(y.n >= 60)) bad.push('分かれ道の数がおかしい ' + JSON.stringify(y)); if (y.pre < y.n) bad.push('分かれ道の手前が外の道でない ' + (y.n - y.pre) + '/' + y.n); if (y.ok < y.n * .5) bad.push('Y 字路にできる分かれ道が半分より少ない ' + y.ok + '/' + y.n);
  // ③ ④
  await p.evaluate(() => window.__hayDash.ev('hideAll(); startRun()')); await p.waitForTimeout(600);
  // ①
  const lm = await p.evaluate(() => window.__hayDash.ev(`(() => { const out = []; const mk = (id, dir, th) => ({ id, dir, th }); const th = { lm: [{ t: 'tower', off: .2 }, { t: 'fuji', off: -.3 }] };
    const base = 900000 + ((Math.random() * 1000) | 0) * 10, s1 = mk(base, 0, th), s2 = mk(base + 1, 1, th), s3 = mk(base + 2, 2, th), far = mk(base + 40, 3, th);
    for (const l of th.lm) { const a1 = lmWorldAngle(s1, l), a2 = lmWorldAngle(s2, l), a3 = lmWorldAngle(s3, l), a9 = lmWorldAngle(far, l);
      if (Math.abs(angDiff(a1, a2)) > .01 || Math.abs(angDiff(a1, a3)) > .01) out.push(l.t + '：曲がったら向きが変わった（次の道でまた正面に出る）');
      if (Math.abs(angDiff(a9, far.dir * Math.PI / 2 + l.off)) > .01) out.push(l.t + '：ずっと出ていなかった目印が、古い向きのまま'); }
    const g = { lm: [{ t: 'tower', off: 0, grow: 1.5 }] }, s4 = mk(base + 3, 3, g); if (Math.abs(angDiff(lmWorldAngle(s4, g.lm[0]), s4.dir * Math.PI / 2)) > .01) out.push('塔へ向かう道（grow）なのに、塔が正面にない');
    return out; })()`)); bad.push(...lm);
  const f = await p.evaluate(() => window.__hayDash.ev(`(() => { const out = []; G.jumpTo('ginza', 640, 1); G.invT = 999; const seg = G.segs[G.ci]; G.s = 30; G.speed = .01;
    for (let k = -29; k <= 10; k++) seg.spr.push({ lat: 3.6, s: G.s + k, y: 2.4, w: 1, h: 1, img: 'hay', __t: 1 }, { lat: 0, s: G.s + k, y: 2.4, w: 1, h: 1, img: 'hay', __t: 2 }); G.sprFadeN = 0; render(); const n1 = G.sprFadeN || 0;
    seg.spr = seg.spr.filter(q => q.__t !== 2); G.sprFadeN = 0; render(); const n2 = G.sprFadeN || 0; if (!(n1 > 0)) out.push('レーンの真上の看板が、近くでうすくならない'); if (n2 > 0) out.push('道のわきの看板が、通りすぎる時にうすくなる（景色が消えていく）');
    const fake = { tid: 'x' }; G.forkGhost = { seg: G.segs[G.ci + 1] || seg, of: seg }; G.s = 10; if (!segOrder().includes(G.forkGhost.seg)) out.push('分かれ道で選ばなかった道を、選んだ直後に描いていない'); G.s = 70; segOrder(); if (G.forkGhost) out.push('選ばなかった道を、60m 進んでも持ち続けている'); return out; })()`)); bad.push(...f);
  await b.close(); if (bad.length) { console.log('REALWORLD NG\n' + bad.join('\n')); process.exit(1); } console.log('REALWORLD OK 目印は曲がっても同じ向き／Y 字路にできる分かれ道 ' + y.ok + '/' + y.n + '／道のわきの物は消えない'); })();
