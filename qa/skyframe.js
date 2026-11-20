// オオタカで降りる間、レン（とジル）がいつも画面の中に見えていること（2026-11-20 オーナー「スカイツリーから飛び立った時に、スマホでもウェブでもキャラクターが画面から消えて下の方に行ってしまう」）
// 赤い電波塔・押上の電波塔のコースを、たて長のスマホ・横長のパソコンの 2 つの大きさで走り、空の上の毎コマで、レンの足もと・頭が画面の中（上 8%・下 6% の余白の内側）にあるかを見る
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = [], log = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  for (const [w, h] of [[390, 844], [1280, 720]]) for (const course of ['tower', 'skytree']) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })); let s0 = 7; Math.random = () => { s0 = (s0 * 16807) % 2147483647; return (s0 - 1) / 2147483646; }; const raf = window.requestAnimationFrame; window.requestAnimationFrame = f => window.__stop ? 0 : raf(f); });
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200);
    await p.evaluate(() => window.__hayDash.ev('hideAll(); startRun(); G.prepHold = 0'));
    const r = await p.evaluate(course => { window.__stop = 1; const H = window.__hayDash, { G, act } = H; G.mode = 'play'; try { G.jumpTo('ginza', 640, 1); } catch (e) { } G.courseDue = course; G.courseDone = {};
      let n = 0, lo = 1, hi = 0, worst = null, seen = 0; const HH = H.ev('H');
      for (let k = 0; k < 40000; k++) { const seg = G.segs[G.ci]; G.invT = 99; G.lives = 9; if (G.s > seg.len - Math.max(13, G.speed) + 1 && !G.turnQueued) act(seg.fork ? 'left' : seg.turn > 0 ? 'right' : 'left'); H.ev('update(1/60)'); G.mode = 'play';
        const s2 = G.segs[G.ci]; if (s2.th.sky) { seen = 1; const P = G.player; const f = H.ev('spriteAt')(P.wx, P.wy, P.wz); if (!f) { worst = worst || ['見えない', s2.tid, +G.s.toFixed(1)]; n++; continue; } const foot = f.sy / HH, head = (f.sy - f.k * 1.18 * .9) / HH; lo = Math.min(lo, head); hi = Math.max(hi, foot); if (foot > .94 || head < .08) { n++; if (!worst) worst = [s2.tid, +G.s.toFixed(1), +foot.toFixed(2), +head.toFixed(2)]; } }
        else if (seen && !s2.th.sky && G.s > 20) break; }
      return { n, lo: +lo.toFixed(2), hi: +hi.toFixed(2), worst, seen }; }, course);
    log.push(w + 'x' + h + ' ' + course + ' ' + JSON.stringify(r)); if (!r.seen) bad.push(w + 'x' + h + ' ' + course + '：空の道まで行けなかった'); else if (r.n) bad.push(w + 'x' + h + ' ' + course + '：レンが画面の外 ' + r.n + ' コマ ' + JSON.stringify(r.worst)); await p.close(); }
  console.log(log.join('\n')); await b.close(); if (bad.length) { console.log('SKYFRAME NG\n' + bad.join('\n')); process.exit(1); } console.log('SKYFRAME OK');
})();
