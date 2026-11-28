// 画面を開いたら、いつも一番上から（2026-11-28 オーナー「ミッションをスクロールしてからスタンプ帳などを開くと、上からではなく途中から表示される」）
// わけ：画面の中のスクロールする箱（#pBody）が前の位置を覚えていて、かくしている間に 0 にしても効かなかった。
// 見る物：(1) ある画面を下までスクロール → 閉じる → 別の画面を開く と、一番上（0）から (2) 閉じずに別の画面へ切りかえても 0 から
//         (3) 同じ画面を開き直しても 0 から (4) 画面の中の並べかえ（スタンプ帳の「よく行く順」）では、今の位置のまま（上へ飛ばない）
//         (5) 結果画面も、前の回でスクロールした位置が残らない
const { chromium } = require('playwright'); const path = require('path');
const IDS = ['btnMissions', 'btnStamps', 'btnZukan', 'btnShop', 'btnHow', 'btnRank', 'btnRecords', 'btnPractice', 'btnSet'];
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  for (const [w, h] of [[390, 844], [1280, 800]]) { const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 900, hasTouch: w < 900 }); const p = await ctx.newPage(); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 40, best: 1655381, bank: 4834, lang: 'ja', stamps: { ginza: 1, asakusa: 1 }, zukan: { hay: 1 } })));
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1500);
    const tag = w + 'x' + h + '：', click = id => p.evaluate(id => { const e = document.getElementById(id); if (e) e.click(); return !!e; }, id);
    const bottom = () => p.evaluate(() => { const b = document.getElementById('pBody'); b.scrollTop = b.scrollHeight; return Math.round(b.scrollTop); });
    const top = () => p.evaluate(() => Math.round(document.getElementById('pBody').scrollTop));
    // (1) 閉じてから開く
    for (let i = 0; i < IDS.length; i++) { const a = IDS[i], z = IDS[(i + 1) % IDS.length]; await click(a); await p.waitForTimeout(350); const down = await bottom(); await click('pClose'); await p.waitForTimeout(250); await click(z); await p.waitForTimeout(350); const t = await top(); if (down > 0 && t !== 0) bad.push(tag + a + ' を下までスクロール → 閉じる → ' + z + ' を開くと、途中（' + t + 'px）から表示される'); await click('pClose'); await p.waitForTimeout(200); }
    // (2) 閉じずに切りかえる (3) 同じ画面を開き直す
    for (const [a, z] of [['btnMissions', 'btnStamps'], ['btnShop', 'btnSet'], ['btnStamps', 'btnStamps']]) { await click(a); await p.waitForTimeout(350); const down = await bottom(); if (a !== z) await click(z); else { await click('pClose'); await p.waitForTimeout(200); await click(z); } await p.waitForTimeout(350); const t = await top(); if (down > 0 && t !== 0) bad.push(tag + a + ' → ' + z + '：途中（' + t + 'px）から表示される'); await click('pClose'); await p.waitForTimeout(200); }
    // (4) 画面の中の並べかえでは、位置を保つ
    { await click('btnStamps'); await p.waitForTimeout(400); const r = await p.evaluate(() => { const b = document.getElementById('pBody'), s = b.querySelector('[data-rsort]:not(.on)') || b.querySelector('[data-rsort]'); if (!s) return null; b.scrollTop = Math.max(0, s.getBoundingClientRect().top - b.getBoundingClientRect().top + b.scrollTop - 100); const before = b.scrollTop; s.click(); return [Math.round(before), Math.round(b.scrollTop)]; });
      if (r && r[0] > 0 && Math.abs(r[1] - r[0]) > 2) bad.push(tag + 'スタンプ帳の並べかえで、スクロールの位置が ' + r[0] + ' → ' + r[1] + ' に飛んだ'); await click('pClose'); await p.waitForTimeout(200); }
    // (5) 結果画面：スクロールしてから、もう一度出す
    { const r = await p.evaluate(() => { const s = document.getElementById('sResult'); if (!s) return null; s.hidden = false; const sc = [s, ...s.querySelectorAll('.card,.body')].find(e => e.scrollHeight > e.clientHeight + 4); if (!sc) { s.hidden = true; return 'none'; } sc.scrollTop = sc.scrollHeight; const d = sc.scrollTop; s.hidden = true; window.__hayDash.ev("show('sResult')"); const t = sc.scrollTop; s.hidden = true; return [Math.round(d), Math.round(t)]; });
      if (Array.isArray(r) && r[0] > 0 && r[1] !== 0) bad.push(tag + '結果画面が、前にスクロールした位置（' + r[1] + 'px）から表示される'); }
    await ctx.close(); }
  await b.close(); if (bad.length) { console.log('PANELSCROLL NG ' + bad.length + '\n' + bad.join('\n')); process.exit(1); } console.log('PANELSCROLL OK'); })();
