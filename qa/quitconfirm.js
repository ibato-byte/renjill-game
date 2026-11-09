// 一時停止の「やめる」は2回押し：1回だけではその回は終わらない／3秒たつと元に戻る／2回でやめられる（2026-11-09）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800); await p.click('#btnStart'); await p.waitForTimeout(1500);
  const mode = () => p.evaluate(() => window.__hayDash.G.mode), lbl = () => p.evaluate(() => document.getElementById('btnQuit').textContent);
  await p.click('#pauseBtn'); await p.waitForTimeout(200); await p.click('#btnQuit'); await p.waitForTimeout(200);
  const r = { once: await mode(), ask: await lbl() }; await p.waitForTimeout(3300); r.back = await lbl(); r.still = await mode();
  await p.click('#btnQuit'); await p.click('#btnQuit'); await p.waitForTimeout(600); r.twice = await mode();
  const ok = r.once === 'pause' && /もう一度/.test(r.ask) && r.back === 'やめる' && r.still === 'pause' && r.twice !== 'pause' && r.twice !== 'play' && !errs.length;
  console.log(JSON.stringify(r), errs.join('|')); console.log(ok ? 'QUITCONFIRM OK' : 'QUITCONFIRM NG'); await b.close(); })();
