// 途中で閉じてしまった走りを、つづきから再開できる（2026-11-15 オーナー：通信が悪くなった時などに強制終了ではなく、途中から再開したい）
//  ① 走っている途中で画面を読み込み直す → 題名画面に「つづきから走る」→ 押すと、点・チモシー・日・時刻・場所がそのまま（3・2・1 のあと）
//  ② 再開したあと、次の道に進める（道すじが切れない）・エラーなし
//  ③ ぶつかって終わった走りは、読み込み直しても「つづきから」が出ない
//  ④ 新しくスタートしたら、前のつづきは消える
//  ⑤ 練習・1分ダッシュでは書かない
//  ⑥ 1 回の走りで 3 回まで・12 時間たったら出ない
//  ⑦ データ引き継ぎの保存データ（SV）には入らない
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../dist') + '/test.html', KEY = 'renjill-hay-dash-run';
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { if (!localStorage.getItem('renjill-hay-dash-v1')) localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 })); });
  await p.goto(URL); await p.waitForTimeout(900);
  const ev = s => p.evaluate(x => window.__hayDash.ev(x), s), vis = () => p.evaluate(() => { const e = document.getElementById('btnCont'); if (!e || e.hidden) return false; const r = e.getBoundingClientRect(); return r.width > 40 && r.height > 20 && r.top >= 0 && r.bottom <= innerHeight; });
  if (await vis()) bad.push('はじめから「つづきから」が出ている');
  // ① 走って、進めて、読み込み直す
  await p.click('#btnStart'); await p.waitForTimeout(900);
  await p.evaluate(() => { const H = window.__hayDash, G = H.G; H.setQ(0); G.invT = 99; }); await p.waitForTimeout(600);
  await ev(`(() => { G.score = 48200; G.hay = 137; G.stats.hay = 137; G.stats.jumps = 12; G.invT = 99; cpSave(); })()`); await p.waitForTimeout(2600);
  const before = await ev(`({ score: Math.floor(G.score), hay: Math.floor(G.hay), day: G.day, clock: G.clock, tid: curSeg().tid, runs: SV.runs, cp: !!localStorage.getItem('${KEY}') })`);
  if (!before.cp) bad.push('① 走っている間に書かれていない');
  await p.reload(); await p.waitForTimeout(1100);
  if (!(await vis())) bad.push('① 読み込み直したあと、題名画面に「つづきから」が出ない'); else {
    const label = await p.evaluate(() => document.getElementById('btnCont').textContent); if (!/4[89],\d{3}/.test(label)) bad.push('① ボタンに点数が出ていない（' + label + '）');
    await p.click('#btnCont'); await p.waitForTimeout(300); const cd = await ev('G.mode'); if (cd !== 'countdown') bad.push('① 3・2・1 が出ない（' + cd + '）');
    await p.waitForTimeout(2200); const a = await ev(`({ mode: G.mode, score: Math.floor(G.score), hay: Math.floor(G.hay), day: G.day, clock: G.clock, tid: curSeg().tid, jumps: G.stats.jumps, runs: SV.runs, n: G.resumeN, inv: G.invT > 0 })`);
    if (a.mode !== 'play') bad.push('① 再開したのに走っていない（' + a.mode + '）'); if (a.score < before.score || a.score > before.score + 4000) bad.push('① 点が戻っていない（' + before.score + ' → ' + a.score + '）'); if (a.hay < before.hay) bad.push('① チモシーが戻っていない（' + before.hay + ' → ' + a.hay + '）');
    if (a.day !== before.day) bad.push('① 日が違う'); if (a.clock < before.clock - 1 || a.clock > before.clock + 30) bad.push('① 時刻が違う（' + before.clock + ' → ' + a.clock + '）'); if (a.tid !== before.tid) bad.push('① 場所が違う（' + before.tid + ' → ' + a.tid + '）');
    if (a.jumps < 12) bad.push('① 走りの記録（ジャンプの数）が戻っていない'); if (a.runs !== before.runs) bad.push('① 走った回数が増えた（' + before.runs + ' → ' + a.runs + '）'); if (a.n !== 1) bad.push('① 再開の回数が数えられていない');
    // ② 次の道へ進める
    const r2 = await p.evaluate(() => new Promise(res => { const H = window.__hayDash, G = H.G; const id0 = H.ev('curSeg().id'); const t0 = performance.now(); const tick = () => { G.invT = 99; if (G.mode === 'play') G.speed = 60; const id = H.ev('curSeg().id'); if (id !== id0 && H.ev('G.segs.length - G.ci') >= 2) return res({ ok: 1, tid: H.ev('curSeg().tid'), day: G.day }); if (performance.now() - t0 > 25000) return res({ ok: 0, mode: G.mode, s: G.s }); requestAnimationFrame(tick); }; tick(); }));
    if (!r2.ok) bad.push('② 再開したあと、次の道に進めない ' + JSON.stringify(r2)); }
  // ③ ぶつかって終わる → 消える
  await p.evaluate(() => { const G = window.__hayDash.G; G.invT = 0; G.speed = 14; window.__die('hit'); }); await p.waitForTimeout(400);
  if (await p.evaluate(k => !!localStorage.getItem(k), KEY)) bad.push('③ ぶつかった直後に、つづきが残っている'); await p.reload(); await p.waitForTimeout(1000); if (await vis()) bad.push('③ 終わった走りなのに「つづきから」が出る');
  // ④ 新しくスタート → 前のつづきは消える ／ ⑥ 回数と時間
  const mk = (n, ago) => p.evaluate(a => localStorage.setItem(a.k, JSON.stringify({ v: 1, at: Date.now() - a.ago, char: 'ren', easy: 0, tid: 'street', t1: 620, n: a.n, g: { score: 1234, hay: 5, day: 1, clock: 600, speed: 13, dist: 300, t: 40 }, stats: {}, plan: [] })), { k: KEY, n, ago });
  await mk(0, 0); await p.reload(); await p.waitForTimeout(1000); if (!(await vis())) bad.push('④ 用意したつづきが出ない（試験の前提）');
  await p.click('#btnStart'); await p.waitForTimeout(700); if (await p.evaluate(k => { const o = JSON.parse(localStorage.getItem(k) || 'null'); return !!(o && o.g && o.g.score === 1234); }, KEY)) bad.push('④ 新しくスタートしたのに、前のつづきが残っている');
  await p.evaluate(() => { const G = window.__hayDash.G; G.invT = 0; window.__die('hit'); }); await p.waitForTimeout(300); /* 走っている最中に読み込み直すと、その走りが書かれる（正しい動き）ので、先に終わらせる */
  await mk(3, 0); await p.reload(); await p.waitForTimeout(1000); if (await vis()) bad.push('⑥ 3 回使ったのに、まだ出る');
  await mk(0, 13 * 3600e3); await p.reload(); await p.waitForTimeout(1000); if (await vis()) bad.push('⑥ 12 時間たったのに、まだ出る');
  // ⑤ 練習・1分ダッシュでは書かない
  await p.evaluate(k => localStorage.removeItem(k), KEY); await p.reload(); await p.waitForTimeout(900);
  await p.evaluate(() => { const G = window.__hayDash.G; G.quickNext = 1; }); await p.click('#btnStart'); await p.waitForTimeout(900); await ev('cpSave()'); await p.waitForTimeout(2300);
  if (await p.evaluate(k => !!localStorage.getItem(k), KEY)) bad.push('⑤ 1分ダッシュで書かれた');
  await p.reload(); await p.waitForTimeout(900); await p.evaluate(() => { const G = window.__hayDash.G; G.practiceNext = 'shibuya'; }); await p.click('#btnStart'); await p.waitForTimeout(900); await ev('cpSave()'); await p.waitForTimeout(2300);
  if (await p.evaluate(k => !!localStorage.getItem(k), KEY)) bad.push('⑤ 練習で書かれた');
  // ⑦ 保存データには入らない
  const sv = await p.evaluate(() => localStorage.getItem('renjill-hay-dash-v1') || ''); if (/"plan"|resumeN|"cp"/.test(sv)) bad.push('⑦ 保存データに、つづきの中身が入っている');
  if (errs.length) bad.push('エラー: ' + errs.slice(0, 2).join(' / ')); await b.close();
  if (bad.length) { console.log('RESUME NG\n' + bad.join('\n')); process.exit(1); } console.log('RESUME OK');
})();
