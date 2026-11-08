// 片手のタップ（C-12）・ゲームパッド（C-13）・画面を回したときの描き直し（C-63）・エラーの記録（C-65）
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, opt: { ctrl: 'tap', hand: true } }));
    // a fake gamepad: the test presses buttons by changing window.__pad
    window.__pad = { connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) }; navigator.getGamepads = () => [window.__pad]; });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800); await p.click('#btnStart'); await p.waitForTimeout(1200);
  const r = {};
  await p.evaluate(() => { const G = window.__hayDash.G; G.jumpTo('shinjuku', 600, 1); G.invT = 99; G.lane = 1; });
  // one-handed: a tap in the upper half does nothing, a tap at the lower left moves left
  await p.mouse.click(60, 200); await p.waitForTimeout(100); r.upperIgnored = await p.evaluate(() => window.__hayDash.G.lane === 1);
  await p.mouse.click(60, 760); await p.waitForTimeout(100); r.lowerLeft = await p.evaluate(() => window.__hayDash.G.lane === 0);
  // gamepad: d-pad right moves right (once per press)
  await p.evaluate(() => { window.__pad.buttons[15].pressed = true; }); await p.waitForTimeout(150); await p.evaluate(() => { window.__pad.buttons[15].pressed = false; }); await p.waitForTimeout(150);
  r.pad = await p.evaluate(() => ({ lane: window.__hayDash.G.lane, n: window.__hayDash.G.padN || 0 }));
  // start pauses
  await p.evaluate(() => { window.__pad.buttons[9].pressed = true; }); await p.waitForTimeout(150); r.paused = await p.evaluate(() => window.__hayDash.G.mode === 'pause');
  await p.evaluate(() => { window.__pad.buttons[9].pressed = false; }); await p.waitForTimeout(100);
  // rotation: many resize events in a burst give one redraw
  const n0 = await p.evaluate(() => window.__hayDash.G.resizeN || 0); await p.evaluate(() => { for (let i = 0; i < 12; i++) dispatchEvent(new Event('resize')); }); await p.waitForTimeout(300);
  r.resizes = (await p.evaluate(() => window.__hayDash.G.resizeN || 0)) - n0;
  // error log: a reported frame error shows up in the settings
  r.errlog = await p.evaluate(() => { const D = window.__hayDash; D.ev("reportErr(new Error('test error 123'))"); return (localStorage.getItem('rjErrLog') || '').includes('test error 123'); });
  console.log(JSON.stringify(r));
  const ok = r.upperIgnored && r.lowerLeft && r.pad.lane === 1 && r.pad.n === 1 && r.paused && r.resizes === 1 && r.errlog;
  console.log(ok && !errs.length ? 'PADHAND OK' : 'PADHAND NG ' + errs.join(' | ')); await b.close();
})();
