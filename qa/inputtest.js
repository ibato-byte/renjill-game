// 操作が効かなくならない：ふつうのスワイプ、動きの途中が届かない速いフリック（押す→離すだけ）、キー。
// 高く跳びすぎない（箱の上から・スーパージャンプでも）。読み込み中に英語がちらっと見えない。
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = [], out = {};
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, locale: 'ja-JP' }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  // the first paint: before the game's script runs, the page must not show the English labels
  await ctx.addInitScript(() => { window.__firstVis = null; const iv = setInterval(() => { const s = document.querySelector('#btnStart'); if (s && window.__firstVis === null) { window.__firstVis = { booting: document.documentElement.classList.contains('booting'), vis: getComputedStyle(s).visibility, txt: s.textContent }; clearInterval(iv); } }, 1); });
  await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800);
  out.first = await p.evaluate(() => window.__firstVis); out.after = await p.evaluate(() => ({ booting: document.documentElement.classList.contains('booting'), txt: document.querySelector('#btnStart').textContent, boot: getComputedStyle(document.querySelector('#bootMsg')).display }));
  if (out.first && out.first.txt === 'START' && out.first.vis !== 'hidden') errs.push('English START visible while loading ' + JSON.stringify(out.first));
  if (out.after.booting || out.after.txt !== 'スタート' || out.after.boot !== 'none') errs.push('after boot ' + JSON.stringify(out.after));
  await p.evaluate(() => { const D = window.__hayDash; D.SV.tutDone = 1; D.SV.nickAsked = 1; D.ev('save()'); }); await p.click('#btnStart'); await p.waitForTimeout(500);
  const prep = () => p.evaluate(() => { const G = window.__hayDash.G; G.invT = 99; const sg = G.segs[G.ci]; sg.obs = []; G.y = 0; G.vy = 0; G.air = false; G.slideT = 0; G.pow.fly = 0; G.pow.jump = 0; });
  const ptr = (type, x, y) => p.evaluate(([type, x, y]) => document.querySelector('#app').dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, pointerId: 7, bubbles: true, pointerType: 'touch', isPrimary: true })), [type, x, y]);
  const st = () => p.evaluate(() => { const G = window.__hayDash.G; return { air: G.air, vy: +G.vy.toFixed(2), lane: G.lane, slide: G.slideT > 0 }; });
  // 1) a normal swipe up (moves arrive)
  await prep(); await ptr('pointerdown', 200, 600); await ptr('pointermove', 200, 560); await ptr('pointermove', 200, 520); await ptr('pointerup', 200, 520); out.swipe = await st();
  if (!out.swipe.air) errs.push('normal swipe up did not jump');
  // 2) a fast flick: only down and up reach the page
  await p.waitForTimeout(1300); await prep(); await ptr('pointerdown', 200, 600); await ptr('pointerup', 200, 540); out.flick = await st();
  if (!out.flick.air) errs.push('fast flick up did not jump');
  await p.waitForTimeout(1300); await prep(); const l0 = (await st()).lane; await ptr('pointerdown', 200, 600); await ptr('pointerup', 120, 604); out.flickL = await st();
  if (out.flickL.lane !== Math.max(0, l0 - 1)) errs.push('fast flick left did not change lane ' + JSON.stringify(out.flickL));
  // a tap (no movement) does nothing, and a swipe that already acted is not doubled on release
  await p.waitForTimeout(400); await prep(); await ptr('pointerdown', 200, 600); await ptr('pointerup', 202, 601); out.tap = await st(); if (out.tap.air) errs.push('a tap jumped');
  await p.waitForTimeout(400); await prep(); const l1 = (await st()).lane; await ptr('pointerdown', 200, 600); await ptr('pointermove', 260, 600); await ptr('pointerup', 262, 600); out.once = await st();
  if (out.once.lane !== Math.min(2, l1 + 1)) errs.push('swipe right acted twice or not at all ' + JSON.stringify({ l1, now: out.once.lane }));
  // 3) jump height: from the floor, from the top of a box, with the super jump: never above 2.1 (+ a hair)
  const peak = async setup => { await prep(); await p.evaluate(setup); await p.keyboard.press('ArrowUp'); let m = 0; for (let i = 0; i < 40; i++) { await p.waitForTimeout(30); m = Math.max(m, await p.evaluate(() => window.__hayDash.G.y)); } return +m.toFixed(2); };
  out.peakNormal = await peak(() => { });
  out.peakSuper = await peak(() => { window.__hayDash.G.pow.jump = 5; });
  out.peakFromBox = await peak(() => { const G = window.__hayDash.G; G.pow.jump = 5; G.y = 1.5; G.air = false; });
  for (const k of ['peakNormal', 'peakSuper', 'peakFromBox']) if (out[k] > 2.2) errs.push(k + ' too high ' + out[k]);
  // 4) a landing that stops a hair above the floor (0.0005) must still land: it used to freeze the runner 'in the air' so no jump worked again (found after a super jump, 10/26)
  for (const [y0, vy0, pj] of [[.0005, -8.4, 0], [.0009, -3, 0], [.0002, -11, 3], [1.5005, -6, 0]]) {
    await p.waitForTimeout(1300); await prep();
    const r = await p.evaluate(async ([y0, vy0, pj]) => { const G = window.__hayDash.G; G.pow.jump = pj; if (y0 > 1) { G.y = y0; G.vy = vy0; G.air = true; return { skip: 1 }; } G.y = y0; G.vy = vy0; G.air = true; await new Promise(r => setTimeout(r, 120)); const landed = !G.air; window.__hayDash.act('up'); return { landed, jumped: G.air && G.vy > 0, y: G.y }; }, [y0, vy0, pj]);
    if (!r.skip && (!r.landed || !r.jumped)) errs.push('hair-above-floor landing froze ' + JSON.stringify({ y0, vy0, pj, r }));
  }
  if (out.peakNormal < 1.1) errs.push('normal jump too low ' + out.peakNormal);
  console.log(JSON.stringify(out)); console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'INPUT OK no errors'); await b.close();
})();
