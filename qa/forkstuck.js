// 分かれ道で動けなくなるバグ（2日目・午後の外回り→蔵前、iPhone）の再発防止と、安全ネットの確認。
// 1) 曲がった瞬間に次の道が作れなかった（スマホの絵のメモリ切れなど）→ 曲がり切って走り続ける
// 2) 道がずっと作れない → 角で止まらず、ふつうの結果画面で終わる
// 3) 分かれ道の2本の道が前もって作れていなかった → 選んだ側に曲がれる
// 4) 安全ネット：存在しない道・数値の壊れ・道の外・毎フレームのエラー → 道に戻す／だめなら結果画面
// 5) 絵のメモリ切れ（新しいキャンバスが描けない）→ 画面が止まったままにならない
// 6) 倒れて生き返った直後・一時停止から戻った直後の分かれ道 → 曲がれる
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '../dist/test.html');
const fails = [], errs = [];
const check = (name, ok, info) => { console.log((ok ? 'ok   ' : 'FAIL ') + name + (info ? '  ' + JSON.stringify(info) : '')); if (!ok) fails.push(name); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  async function page() {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, locale: 'ja-JP', hasTouch: true, isMobile: true });
    p.on('pageerror', e => errs.push(e.message));
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto(FILE); await p.waitForTimeout(400);
    await p.evaluate(() => { const D = window.__hayDash; D.SV.tutDone = 1; D.SV.nickAsked = 1; D.SV.runs = 30; D.SV.clovers = 0; D.SV.bank = 0; });
    await p.click('#btnStart'); await p.waitForTimeout(250);
    return p;
  }
  // the reported spot: day 2, 13:50, the afternoon errand fork; its left side is Kuramae (rain)
  const setup = (p, o) => p.evaluate(o => { const D = window.__hayDash, G = D.G;
    D.ev(`(() => { const plan = dayPlan(2); const i = plan.findIndex(x => x.fork && x.fork.label === 'errand'); const fk = plan[i];
      fk.fork.L = [{ t: 'kuramae', d: 20 }, { t: 'kuramae', d: 20, cont: 1 }]; fk.fork.lbl.L = lblOf('kuramae');
      const s0 = newSeg(null, { t: 'kyuto', d: 40 }, { t0: 790, day: 2, fork: fk.fork }); s0.forkLbl = forkLabels(fk.fork);
      G.planDay = 2; G.segs = [s0]; G.ci = 0; G.fork = null; G.s = s0.len - ${o.back || 40}; G.lane = 1; G.lat = 0; G.plan = plan.slice(i); G.planClock = s0.t1; G.segDue = 0;
      ${o.noFork ? '' : 'ensureSegs();'}
      const p = segPos(s0, G.s, 0); G.rx = p[0]; G.rz = p[1]; G.camYaw = 0; G.ey = G.camE = null; G.mode = 'play'; G.weather = 'rain'; G.day = 2; onEnterSeg(s0); G.speed = 17; G.invT = 99; })()`);
  }, o || {});
  const state = p => p.evaluate(() => { const D = window.__hayDash, G = D.G, s = G.segs[G.ci];
    const sp = D.ev('spriteAt(G.player.wx, G.player.wy, G.player.wz)');
    return { mode: G.mode, tid: s && s.tid, ci: G.ci, n: G.segs.length, s: G.s, len: s && s.len, lat: G.lat, yawErr: s ? Math.abs(((G.camYaw - s.dir * Math.PI / 2) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI) : 9,
      fork: !!G.fork, turns: G.stats.turns, seen: !!sp, ferr: window.__frameErr || 0, rescue: window.__rescue || 0, finish: window.__finish || 0, result: !document.getElementById('sResult').hidden, hud: !document.getElementById('hud').hidden }; });
  const nearEnd = async (p, m) => { for (let i = 0; i < 300; i++) { if (await p.evaluate(m => { const G = window.__hayDash.G, s = G.segs[G.ci]; return !s || G.s > s.len - m; }, m || 10)) return; await sleep(20); } };
  const swipe = async (p, dx) => { await p.mouse.move(195, 600); await p.mouse.down(); await p.mouse.move(195 + dx, 600, { steps: 4 }); await p.mouse.up(); };
  // a street that cannot be built: like the phone running out of memory in the middle of the turn
  const breakBuild = (p, mode) => p.evaluate(mode => { window.__brk = { mode, n: 0, on: 0 }; window.__hayDash.ev(`(() => { const orig = newSeg; newSeg = function (...a) { const k = window.__brk; if (k.on && (k.mode === 'always' || k.n++ === 0)) throw new TypeError("null is not an object (evaluating 'g.fillStyle')"); return orig.apply(this, a); };
    const od = doTurn; doTurn = function () { const k = window.__brk; if (k.mode !== 'fork') k.on = 1; try { return od.apply(this, arguments); } finally { if (k.mode === 'once') k.on = 0; } }; })()`); }, mode);

  { // 1) the reported case: the next street fails once during the turn into Kuramae
    const p = await page(); await setup(p); await breakBuild(p, 'once');
    await nearEnd(p, 11); await swipe(p, -90); await sleep(1600);
    const a = await state(p);
    check('turned into Kuramae although a street failed to build', a.mode === 'play' && a.tid === 'kuramae' && a.yawErr < .2 && a.s > 5 && a.s < a.len && Math.abs(a.lat) <= 2.7 && a.seen, a);
    await sleep(1200); const a2 = await state(p);
    check('the streets after Kuramae are built a moment later', a2.n - a2.ci >= 3 && a2.s > a.s && a2.mode === 'play', { n: a2.n, ci: a2.ci });
    await p.evaluate(() => { window.__hayDash.G.s = window.__hayDash.G.segs[window.__hayDash.G.ci].len - 14; }); await sleep(2500);
    const a3 = await state(p);
    check('and the next corner turns too', a3.turns >= a.turns + 1 && a3.mode === 'play' && a3.yawErr < .3, { turns: a3.turns, tid: a3.tid });
    await p.close();
  }
  { // 2) building fails every time from the turn on: the run ends normally (no frozen screen)
    const p = await page(); await setup(p); await breakBuild(p, 'always');
    await nearEnd(p, 11); await swipe(p, 90);
    let a; for (let i = 0; i < 40; i++) { await sleep(400); a = await state(p); if (a.result) break; if (a.tid === 'kuramae' || a.ci > 0) await p.evaluate(() => { const G = window.__hayDash.G, s = G.segs[G.ci]; if (s && G.s < s.len - 20) G.s = s.len - 20; }); }
    check('no street can be built: the run ends with the result screen', a.result && a.mode === 'result', a);
    await p.close();
  }
  { // 3) the fork's two streets were never built (it failed earlier): swipe right, turn right
    const p = await page(); await setup(p, { noFork: 1 });
    await p.evaluate(() => { const D = window.__hayDash, G = D.G; window.__dir0 = G.segs[G.ci].dir; });
    await nearEnd(p, 11); await swipe(p, 90); await sleep(1500);
    const a = await state(p), d = await p.evaluate(() => { const G = window.__hayDash.G, s = G.segs[G.ci]; return s ? (s.dir - window.__dir0 + 4) % 4 : -1; });
    check('fork without its streets: still turns to the chosen side', a.mode === 'play' && d === 1 && a.yawErr < .2 && a.s > 3 && a.seen, Object.assign({ d }, a));
    await p.close();
  }
  // 4) the safety net, one broken state at a time
  for (const [name, bad] of [
    ['run pointing at a street that does not exist (the old freeze)', 'G.ci = G.segs.length + 1'],
    ['a number gone bad (NaN)', 'G.s = NaN; G.lat = NaN'],
    ['runner off the street', 'G.lat = 40'],
    ['runner flung high into the air', 'G.y = 500; G.vy = 0; G.air = true'],
    ['an error in every frame', 'buddy = () => { throw new Error("boom") }'],
  ]) {
    const p = await page(); await setup(p, { back: 70 }); await sleep(300);
    const before = await state(p);
    await p.evaluate(bad => { window.__hayDash.ev(bad); }, bad); await sleep(1500);
    const a = await state(p);
    const fixed = a.rescue > before.rescue && ((a.mode === 'play' && a.tid && Number.isFinite(a.s) && Math.abs(a.lat) <= 2.7 && a.seen) || a.result);
    check('safety net: ' + name, fixed, a);
    if (name.startsWith('an error')) { // it keeps failing: after a few tries, the normal result screen
      let r; for (let i = 0; i < 20; i++) { await sleep(400); r = await state(p); if (r.result) break; }
      check('safety net: keeps failing -> result screen', r.result && r.finish > 0, r);
    } else { await sleep(1500); const r = await state(p); check('safety net: ' + name + ' -> keeps running', r.mode === 'play' && r.s > a.s, { s0: a.s, s1: r.s }); }
    await p.close();
  }
  { // 5) out of picture memory: new canvases get no 2D context; the screen must not stay frozen
    const p = await page(); await setup(p, { back: 60 }); await sleep(1500);
    await p.evaluate(() => { const orig = HTMLCanvasElement.prototype.getContext; window.__oom = 1; HTMLCanvasElement.prototype.getContext = function (k, o) { if (window.__oom && this.id !== 'cv' && !this.__ok) return null; this.__ok = 1; return orig.call(this, k, o); }; });
    await nearEnd(p, 11); await swipe(p, -90); await sleep(2500);
    const e0 = (await state(p)).ferr; await sleep(1500); const a = await state(p);
    check('out of picture memory: frames keep drawing (no endless errors), runner on screen', (a.mode === 'play' && a.ferr - e0 <= 3 && a.seen && a.tid === 'kuramae') || a.result, Object.assign({ newErr: a.ferr - e0 }, a));
    await p.close();
  }
  { // 6) a fork right after a revive (died at the wall) and right after pause/resume
    const p = await page(); await setup(p, { back: 3 });
    await p.evaluate(() => { const D = window.__hayDash, G = D.G; G.invT = 0; G.turnQueued = 0; G.s = G.segs[G.ci].len + 3.85; D.SV.clovers = 3; D.ev("G.turnAuto = 0; G.reviveN = 0; G.mode = 'play'; die('wall')"); });
    await sleep(1300); await p.evaluate(() => { window.__hayDash.ev("SV.clovers = 3; doRevive('clover')"); }); await sleep(800);
    const a = await state(p);
    check('revive at a fork: turned onto a street', a.mode === 'play' && a.ci >= 0 && a.tid !== 'kyuto' && a.yawErr < .3 && a.seen, a);
    await p.close();
    const q = await page(); await setup(q, { back: 30 }); await nearEnd(q, 12);
    await q.evaluate(() => { window.__hayDash.act('right'); window.__hayDash.ev('pause()'); }); await sleep(300);
    await q.evaluate(() => { window.__hayDash.ev('resume()'); }); await sleep(3200);
    const c = await state(q);
    check('pause right at the fork, resume: turns', c.mode === 'play' && c.tid !== 'kyuto' && c.yawErr < .3 && c.seen, c);
    await q.close();
  }
  await b.close();
  const real = errs.filter(m => !/boom|g\.fillStyle/.test(m));
  console.log('pageerrors', real.length ? real.slice(0, 5) : 'none');
  console.log(fails.length || real.length ? 'FORK STUCK FAIL ' + fails.join(' | ') : 'FORK STUCK OK');
})();
