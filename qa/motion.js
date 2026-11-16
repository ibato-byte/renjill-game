// 動きの手ざわり（2026-11-15）：①跳ぶ瞬間の「ふみ切り」の沈み ②レーンを移る一瞬の残像は出さない（2026-11-17 オーナー：「左右に移動した時の残像はうざったいのでいらない」）。「動きをひかえめ」ではどちらも出ない。跳び始めは今までどおり押した瞬間（遅れない）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  for (const calm of [0, 1]) { const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(c => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', opt: c ? { calm: 1 } : {} })), calm);
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900); await p.click('#btnStart'); await p.waitForTimeout(900);
    await p.evaluate(() => { const H = window.__hayDash, G = H.G; H.setQ(0); G.jumpTo('street', 660, 1); G.invT = 99; G.takeN = 0; G.smearN = 0; }); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => new Promise(res => { const G = window.__hayDash.G; G.invT = 99; G.takeN = 0; G.smearN = 0; const key = c => window.dispatchEvent(new KeyboardEvent('keydown', { code: c, key: c, bubbles: true }));
      key('ArrowUp'); const vy0 = G.vy, air0 = G.air; setTimeout(() => { const take = G.takeN; key('ArrowLeft'); setTimeout(() => res({ vy0, air0, take, smear: G.smearN, calm: window.__hayDash.ev('!!OPT().calm') }), 500); }, 900); }));
    if (!(r.vy0 > 5) || !r.air0) bad.push('押した瞬間に跳んでいない（vy ' + r.vy0 + '）');
    if (!calm) { if (!(r.take >= 2)) bad.push('① ふみ切りの沈みが出ていない（' + r.take + '）'); if (r.smear) bad.push('② レーン移動の残像が出た（' + r.smear + '。オーナー 2026-11-17：いらない）'); }
    else { if (!r.calm) bad.push('試験の前提：ひかえめになっていない'); if (r.take) bad.push('「ひかえめ」なのに、ふみ切りの沈みが出た'); if (r.smear) bad.push('「ひかえめ」なのに、残像が出た'); }
    await p.close(); }
  await b.close(); if (bad.length) { console.log('MOTION NG\n' + bad.join('\n')); process.exit(1); } console.log('MOTION OK');
})();
