// 建物から出てすぐ、動く物（人力車など）が走ってこないか（2026-11-16 オーナー：「室内で人力車にぶつかるのはおかしい」）。
// 確かめること：室内（部屋・電車・ガラスの建物）のあとの通りを 300 回作り、①入り口から 70m までに動く物が無い
// ②70m より先の動く物も、走ってきて入り口から 30m より手前には入らない（走る処理をそのまま進めて確かめる）
// ③ふつう（前が外）の通りでは、今まで通り動く物が出る
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1800); await p.click('#btnStart'); await p.waitForTimeout(500);
  const r = await p.evaluate(() => { const H = window.__hayDash, ev = H.ev, TH = H.THEMES; const newSeg = ev('newSeg'); ev('G').paused = true;
    const inK = Object.keys(TH).filter(k => ['room', 'train', 'glass'].includes(TH[k].kind)), outK = Object.keys(TH).filter(k => TH[k].kind === 'street' && TH[k].obs.includes('rickshaw'));
    let near = 0, nearOut = 0, moversIn = 0, moversOut = 0, intrude = 0;
    for (let i = 0; i < 300; i++) { const a = newSeg(null, { t: inK[i % inK.length], d: 30 }, { len: 60 }); const sg = newSeg(a, { t: outK[i % outK.length], d: 30 });
      for (const o of sg.obs) if (o.mv) { moversIn++; if (o.s0 < 70) near++; }
      // 走る処理と同じ式で、プレーヤーが 12m/秒で入り口から進む間の動く物の位置を追う
      let s = 0; const dt = 1 / 60; while (s < 60) { for (const o of sg.obs) if (o.mv) { if (o.s0 + (o.ds || 0) - s < 42 && (!sg.prevIn || o.s0 + (o.ds || 0) > 30)) o.ds = (o.ds || 0) - o.mv * dt; if (o.s0 + (o.ds || 0) < 30 && o.s0 + (o.ds || 0) > s - 1) intrude = Math.max(intrude, 30 - (o.s0 + o.ds)); } s += 12 * dt; }
      const c = newSeg(newSeg(null, { t: outK[i % outK.length], d: 30 }, { len: 60 }), { t: outK[i % outK.length], d: 30 }); for (const o of c.obs) if (o.mv) { moversOut++; if (o.s0 < 70) nearOut++; } }
    return { near, moversIn, moversOut, nearOut, intrude: +intrude.toFixed(2), inK: inK.length, outK: outK.length }; });
  if (r.near) bad.push('室内のすぐあとに動く物がある: ' + r.near + ' 個');
  if (r.intrude > .05) bad.push('動く物が入り口から 30m より手前へ入ってきた（' + r.intrude + 'm）');
  if (!(r.moversOut > 20)) bad.push('ふつうの通りで動く物が出なくなった（' + r.moversOut + '）');
  await b.close(); if (bad.length) { console.log('INDOORMOVER NG\n' + bad.join('\n') + '\n' + JSON.stringify(r)); process.exit(1); } console.log('INDOORMOVER OK ' + JSON.stringify(r)); })();
