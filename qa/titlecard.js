// 新しい称号のシェア用カード（B-48）：その走りで称号を取ったら、結果画面にボタンが出て、押すとカードの画像が保存される（パソコン）
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9 })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800); await p.click('#btnStart'); await p.waitForTimeout(1000);
  await p.evaluate(() => { const D = window.__hayDash; D.ev("G.newTitles = [ACH[0]]; G.score = 1234; G.cause = 'quit'; G.mode = 'dead'; endRun()"); }); await p.waitForTimeout(1200);
  const r = await p.evaluate(() => { const D = window.__hayDash; const btns = [...document.querySelectorAll('#titleShare [data-tshare]')]; const c = D.ev('titleCard(ACH[0])'); return { n: btns.length, txt: btns[0] && btns[0].textContent, w: c.width, h: c.height }; });
  const dl = p.waitForEvent('download', { timeout: 15000 }).catch(() => null); await p.click('#titleShare [data-tshare="0"]'); const d = await dl;
  r.saved = !!d && /png$/.test(d.suggestedFilename());
  console.log(JSON.stringify(r));
  const ok = r.n === 1 && r.w === 1080 && r.h === 1080 && r.saved;
  console.log(ok && !errs.length ? 'TITLECARD OK' : 'TITLECARD NG ' + errs.join(' | ')); await b.close();
})();
