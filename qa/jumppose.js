// ジャンプの絵が、のぼり（air）→ くだり（fall）→ 走る、の順に変わる（2026-11-15：前は跳んでいる間ずっと同じ絵）。3 匹とも「落ちてくる絵」がある
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900); await p.click('#btnStart'); await p.waitForTimeout(900);
  await p.evaluate(() => { const H = window.__hayDash, G = H.G; H.setQ(0); G.jumpTo('street', 660, 1); G.invT = 99; }); await p.waitForTimeout(1200);
  const miss = await p.evaluate(() => window.__hayDash.ev(`['ren','jill','pom'].filter(w => !BUN[w].fall || !BUN[w].fall.width || BUN[w].fall === BUN[w].air).concat(BUN.ren.fallm && BUN.ren.fallm.width ? [] : ['ren(マグ)'])`)); if (miss.length) bad.push('落ちてくる絵がない: ' + miss);
  let seq = ''; for (let t = 0; t < 3 && !/air.*fall.*run/.test(seq); t++) { seq = await p.evaluate(() => new Promise(res => { const G = window.__hayDash.G, got = []; G.invT = 99; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp', key: 'ArrowUp', bubbles: true })); const t0 = performance.now(); const tick = () => { const ps = String(G.player.pose || '').replace(/[0-9]+$/, ''); if (got[got.length - 1] !== ps) got.push(ps); if (performance.now() - t0 < 1500) requestAnimationFrame(tick); else res(got.join('>')); }; tick(); })); await p.waitForTimeout(300); }
  if (!/air>fall>run/.test(seq)) bad.push('ジャンプの絵の順が air → fall → run になっていない（' + seq + '）'); if (errs.length) bad.push('エラー: ' + errs[0]);
  await b.close(); if (bad.length) { console.log('JUMPPOSE NG\n' + bad.join('\n')); process.exit(1); } console.log('JUMPPOSE OK ' + seq);
})();
