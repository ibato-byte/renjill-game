// ログインボーナス（毎日の出社ボーナス）：その日はじめて開くとチモシーがもらえる。連続で増え（ボーナスは7日分まで。日数は本当の数）、1日空くと1日目にもどる。同じ日は1回だけ。
const { chromium } = require('playwright');
const KEY = 'renjill-hay-dash-v1';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = [], out = [];
  const ds = off => { const d = new Date(Date.now() + off * 864e5); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  // [last daily, streak before, expected streak, expected bonus]
  const cases = [[null, 0, 1, 50], [ds(-1), 1, 2, 70], [ds(-1), 6, 7, 170], [ds(-1), 7, 8, 170], [ds(-1), 30, 31, 170], [ds(-2), 5, 1, 50], [ds(0), 3, 3, 0]];
  for (const lang of ['ja', 'en']) for (const [last, st, wantSt, wantB] of cases) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await ctx.addInitScript(([K, sv]) => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); localStorage.setItem(K, JSON.stringify(sv)); },
      [KEY, Object.assign({ tutDone: 1, nickAsked: 1, runs: 5, bank: 1000, best: 100, lang, streak: st }, last ? { daily: last } : {})]);
    await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900);
    const r = await p.evaluate(K => { const s = JSON.parse(localStorage.getItem(K)); return { bank: s.bank, streak: s.streak, daily: s.daily, toast: (document.querySelector('.toast') || {}).textContent || '' }; }, KEY);
    const gotB = r.bank - 1000; out.push(`${lang} ${last || 'first'}/${st} -> ${r.streak} +${gotB}`);
    if (r.streak !== wantSt || gotB !== wantB || r.daily !== ds(0)) errs.push(`${lang} case ${last}/${st}: ${JSON.stringify(r)} want streak ${wantSt} +${wantB}`);
    if (wantB && !(wantSt === 1 ? (lang === 'ja' ? !r.toast.includes('連続') && r.toast.includes(`${wantB}本`) : !r.toast.includes('-day') && r.toast.includes(`${wantB} hay`)) : (lang === 'ja' ? r.toast.includes(`${wantSt}日連続`) && r.toast.includes(`${wantB}本`) : r.toast.includes(`${wantSt}-day`) && r.toast.includes(`${wantB} hay`)))) errs.push(`${lang} toast missing ${JSON.stringify(r.toast)}`); // 1日目は「1日連続」と言わない
    // opening again the same day gives nothing more
    if (wantB) { await p.reload(); await p.waitForTimeout(700); const again = await p.evaluate(K => JSON.parse(localStorage.getItem(K)).bank, KEY); if (again !== r.bank) errs.push(`${lang} bonus given twice in a day`); }
    await ctx.close();
  }
  console.log(out.join(' | ')); console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'DAILY BONUS OK no errors'); await b.close();
})();
