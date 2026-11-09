// ふり返り中でもしゃがむ・跳ぶ（2026-11-09 の報告）：ふり返って顔を見せている間に下スワイプ → すぐしゃがみの絵、上スワイプ → 跳ぶ絵。
//  ナイスジャンプで画面が一瞬止まらない（hitStop 0）＝ジャンプのたびに重く感じない
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900); await p.click('#btnStart'); await p.waitForTimeout(1500);
  const look = () => p.evaluate(() => { const G = window.__hayDash.G; G.invT = 99; G.player.look = 1.4; G.player.mood = 'happy'; });
  const pose = () => p.evaluate(() => window.__hayDash.G.player.pose);
  const r = {};
  await look(); await p.waitForTimeout(120); r.looking = await pose();
  await p.evaluate(() => window.__hayDash.ev("act('down')")); await p.waitForTimeout(120); r.down = await pose(); r.lookAfter = await p.evaluate(() => window.__hayDash.G.player.look);
  await p.waitForTimeout(900); await look(); await p.waitForTimeout(120);
  await p.evaluate(() => window.__hayDash.ev("act('up')")); await p.waitForTimeout(120); r.up = await pose();
  // a slide that starts while the bunny still has a reaction running (look set again by the game) still shows the slide
  await p.waitForTimeout(900); await p.evaluate(() => { const G = window.__hayDash.G; window.__hayDash.ev("act('down')"); G.player.look = 1.2; }); await p.waitForTimeout(100); r.downLook = await pose();
  r.stop = await p.evaluate(() => { const D = window.__hayDash, G = D.G; G.hitStop = 0; D.ev("nice('jump')"); D.ev("nice('slide')"); return G.hitStop; });
  // three NICE jumps in a row: the run keeps its speed (no slow motion: 2026-11-09)
  r.pace = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; G.invT = 99; const w = async () => { const d0 = G.dist, t0 = performance.now(); await new Promise(r => setTimeout(r, 600)); return (G.dist - d0) / ((performance.now() - t0) / 1000) / G.speed; };
    const a = await w(); D.ev("nice('jump'); nice('jump'); nice('jump')"); D.ev("act('up')"); const b = await w(); return { a: +a.toFixed(2), b: +b.toFixed(2) }; });
  console.log(JSON.stringify(r));
  const ok = /^look_/.test(r.looking) && r.down === 'slide' && r.lookAfter === 0 && r.up === 'air' && r.downLook === 'slide' && r.stop === 0 && r.pace.b > r.pace.a * .85;
  console.log(ok && !errs.length ? 'POSEPRIO OK' : 'POSEPRIO NG ' + errs.join(' | ')); await b.close();
})();
