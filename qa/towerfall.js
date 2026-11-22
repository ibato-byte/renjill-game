// 電波塔のコース：曲がり角で曲がりそこねたら、ぶつからずに落ちて終わる（2026-11-21 オーナー「真っ直ぐぶつかるのはおかしい。そのまま落下してゲームオーバーに」）
// ①終わり方が「落ちた」（壁にぶつかった、ではない）②レンがへりより下へ落ちていく ③落ちる間、つきあたりの壁を描かない ④続ける（お守りなど）と、先の道で走り続ける ⑤ふつうの町の角は今までどおり（壁）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  const run = async (course, tid) => { const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })); let s0 = 5; Math.random = () => { s0 = (s0 * 16807) % 2147483647; return (s0 - 1) / 2147483646; }; const raf = window.requestAnimationFrame; window.requestAnimationFrame = f => window.__stop ? 0 : raf(f); });
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1000); await p.evaluate(() => window.__hayDash.ev('hideAll(); startRun(); G.prepHold = 0; G.lockQ = 1'));
    const r = await p.evaluate(([course, tid]) => { window.__stop = 1; const H = window.__hayDash, { G, act } = H; G.mode = 'play'; G.jumpTo('ginza', 640, 1); if (course) { G.courseDue = course; G.courseDone = {}; }
      const step = turn => { const seg = G.segs[G.ci]; G.invT = turn ? 99 : 0; if (!turn) { G.fever = 0; G.feverG = 0; G.t = 9999; for (const o of seg.obs) o.dead = .001; } if (turn && G.s > seg.len - Math.max(13, G.speed) + 1 && !G.turnQueued) act(seg.fork ? 'left' : seg.turn > 0 ? 'right' : 'left'); H.ev('update(1/60)'); if (G.mode !== 'dying' && G.mode !== 'dead') G.mode = 'play'; G.chaseVis = 0; };
      const want = s => tid ? s.tid === tid : (s.turn && !s.fork && !(s.th.course)); for (let i = 0; i < 60000 && !(want(G.segs[G.ci]) && G.s >= G.segs[G.ci].len - 25); i++) step(1);
      const seg0 = G.segs[G.ci]; let minY = 0, endHidden = 0, n = 0; for (let i = 0; i < 600 && G.mode !== 'dead'; i++) { step(0); if (G.mode === 'dying') { n++; minY = Math.min(minY, G.y); if (G.fallSeg === seg0) { H.ev('render()'); endHidden = 1; } } }
      const out = { tid: seg0.tid, cause: G.cause, mode: G.mode, minY: +minY.toFixed(1), fallSeg: endHidden, n, cap: H.ev('(CAPS[G.cause] || CAPS.obstacle).ren[1]') };
      try { H.ev('doRevive("ad")'); for (let i = 0; i < 120; i++) { G.invT = 9; H.ev('update(1/60)'); } out.after = { mode: G.mode, tid: G.segs[G.ci].tid, y: +G.y.toFixed(2), hide: !!G.player.fallHide, fallSeg: !!G.fallSeg }; } catch (e) { out.after = { err: String(e) }; }
      return out; }, [course, tid]); await p.close(); return r; };
  const t1 = await run('tower', 'troof'), t2 = await run('skytree', 'slobby'), t3 = await run('', '');
  for (const [nm, r] of [['赤い電波塔の屋上', t1], ['押上の 4 階の入口', t2]]) {
    if (r.cause !== 'fall') bad.push(nm + '：終わり方が「落ちた」でない（' + r.cause + '）'); if (!(r.minY < -5)) bad.push(nm + '：へりより下へ落ちていない（' + r.minY + '）'); if (!r.fallSeg) bad.push(nm + '：落ちる間の合図（つきあたりの壁を描かない）が立っていない');
    if (r.cap !== '曲がりそこねて、落ちました') bad.push(nm + '：ひと言がちがう（' + r.cap + '）');
    if (!r.after || r.after.err || r.after.mode !== 'play' || r.after.tid === r.tid || r.after.y !== 0 || r.after.hide || r.after.fallSeg) bad.push(nm + '：続けた後に走れていない ' + JSON.stringify(r.after)); }
  if (t3.cause !== 'wall') bad.push('ふつうの町の角：壁にぶつかる終わり方でなくなった（' + t3.cause + '・' + t3.tid + '）');
  console.log(JSON.stringify({ t1, t2, t3 })); console.log(bad.length ? 'TOWERFALL NG\n' + bad.join('\n') : 'TOWERFALL OK'); await b.close(); })();
