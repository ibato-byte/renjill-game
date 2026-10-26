// 動けなくなる・跳びすぎるバグ探し：ボットが長く走り、ジャンプ連打・スライド・レーン変更・パワーアップ・車を混ぜる。
// 見張るもの：空中のまま地面にいる（ジャンプできない）・走る動きが止まる・高すぎるジャンプ・数値の壊れ（NaN）
const { chromium } = require('playwright');
const SEC = +(process.argv[2] || process.env.SEC || 120), LATE = +(process.env.LATE || 1);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = [], found = [];
  for (const ch of ['ren', 'jill', 'pom']) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(ch + ': ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(500);
    await p.evaluate(c => { const D = window.__hayDash; D.SV.tutDone = 1; D.SV.nickAsked = 1; D.SV.pomMet = 1; D.SV.runs = 30; D.SV.char = c; D.G.char = c; D.ev('save()'); }, ch);
    await p.click('#btnStart'); await p.waitForTimeout(400);
    const r = await p.evaluate(async ([SEC, LATE]) => {
      const D = window.__hayDash, G = D.G, out = [], t0 = performance.now(); let lastErr = 0, lastProbe = 0, lastWarp = performance.now(), lastTick = 0, lastFly = -1e9, tooHigh = 0, airGround = 0, still = 0, lastPh = G.player.ph, maxY = 0, lastAct = 0, revives = 0;
      const note = (k, extra) => { if (out.length < 40) out.push(Object.assign({ k, t: +G.t.toFixed(1), y: +G.y.toFixed(2), vy: +(G.vy || 0).toFixed(2), air: G.air, mode: G.mode, pow: Object.keys(G.pow).filter(x => G.pow[x] > 0).join('+'), th: G.segs[G.ci] && G.segs[G.ci].th.en }, extra || {})); };
      await new Promise(res => { const iv = setInterval(() => {
        const now = performance.now(); if (now - t0 > SEC * 1000) { clearInterval(iv); res(); return; }
        if (G.mode === 'dead' || G.mode === 'result' || G.mode === 'dying') { if (G.mode === 'dead') { revives++; D.ev("G.reviveN = 0; doRevive('free')"); if (G.mode !== 'play') { D.ev('SV.clovers = 9'); D.ev("doRevive('clover')"); } } return; }
        if (G.mode !== 'play') return;
        if (G.invT < 2) G.invT = 2; // never die, keep running
        if (!isFinite(G.y) || !isFinite(G.vy) || !isFinite(G.s)) note('NaN');
        if ((window.__frameErr || 0) > lastErr) { lastErr = window.__frameErr; note('FRAME ERROR', { msg: window.__frameErrMsg, n: window.__frameErr }); }
        // the run must keep moving: the running cycle advances unless in the air / sliding / looking back
        const ph = G.player.ph; if (Math.abs(ph - lastPh) < 1e-6 && !G.air && G.slideT <= 0 && !(G.player.look > 0)) { if (++still === 20) note('RUN FROZEN'); } else still = 0; lastPh = ph;
        if (G.air && G.y < .02 && Math.abs(G.vy) < .01 && G.pow.fly <= 0) { if (++airGround === 15) note('STUCK IN AIR ON GROUND'); } else airGround = 0;
        if (G.pow.fly > 0) lastFly = now; if (G.pow.fly <= 0 && now - lastFly > 2500) { if (G.y > maxY) maxY = G.y; if (G.y > 2.3 && !tooHigh) { tooHigh = 1; note('TOO HIGH', { maxY: +G.y.toFixed(2) }); } } if (G.y < .5) tooHigh = 0; // gliding down after a flight is fine
        // the player: mostly jumps, some slides and lane changes; now and then a power-up or a car right ahead
        if (now - lastAct > 140) { lastAct = now; const r = Math.random();
          if (r < .45) D.act('up'); else if (r < .6) D.act('down'); else if (r < .8) D.act(Math.random() < .5 ? 'left' : 'right');
          else if (r < .83) D.ev("G.pow.jump = 3"); else if (r < .85) D.ev("G.pow.fly = 2.5; G.flyY = 2.6"); else if (r < .88) D.ev("G.pow.dash = 2");
          else if (r < .92) { const sg = G.segs[G.ci]; if (sg && G.s + 30 < sg.len) D.addObs(sg, Math.random() < .5 ? 'car' : 'supercar', G.s + 22, G.lane); }
          else if (r < .94) D.ev("G.fever = 3; G.feverMax = 3"); }
        // can we still jump? on the ground, not flying: a jump must lift off at once
        if (now - lastProbe > 1300 && !G.air && G.pow.fly <= 0 && G.mode === 'play') { lastProbe = now; D.act('up'); if (!(G.vy > 0 && G.air)) note('JUMP REFUSED', { vy: G.vy, slide: G.slideT, ground: G.y }); }
        // late in the run: jump to the evening / day 2-3 now and then
        if (LATE && now - lastWarp > 20000) { lastWarp = now; const th = ['ginza', 'shibuya', 'asakusa', 'kukodeck', 'kuko', 'akihabara', 'desk', 'yamanote', 'odaiba', 'shinjuku'][(Math.random() * 10) | 0]; try { G.jumpTo(th, 1100 + ((Math.random() * 300) | 0), 2 + ((Math.random() * 2) | 0)); } catch (e) { note('WARP ' + e.message); } }
        // frames must keep coming
        if (lastTick && now - lastTick > 600) note('STALL', { ms: Math.round(now - lastTick) }); lastTick = now;
      }, 30); });
      return { out, maxY: +maxY.toFixed(2), revives, dist: Math.round(G.dist), t: +G.t.toFixed(1) };
    }, [SEC, LATE]);
    found.push({ ch, ...r }); await p.close();
  }
  for (const f of found) console.log(f.ch, 'dist', f.dist, 'maxY', f.maxY, 'revives', f.revives, f.out.length ? JSON.stringify(f.out) : 'clean');
  const bad = found.some(f => f.out.length) || errs.length;
  console.log(errs.join('|') || '', bad ? 'STUCK FOUND' : 'NO STUCK no errors'); await b.close();
})();
