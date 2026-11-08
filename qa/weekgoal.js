// 今週の目標（2026-11-08）：月曜〜日曜で1つの目標。何回走っても合計で数える。達成すると1回だけチモシー1000本＋お守り2。週が変わると0から。
// ミッション画面に進み具合が出る（日英）。古いセーブ（今週の記録なし・こわれた記録）でも動く。
const { chromium } = require('playwright'); const path = require('path');
const KEY = 'renjill-hay-dash-v1';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = []; const ok = {};
  for (const lang of ['ja', 'en']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(lang + ' ' + e.message));
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    // a damaged record from an old week: must start again from 0
    await ctx.addInitScript(([K, l]) => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); localStorage.setItem(K, JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, best: 5000, clovers: 1, bank: 1000, lang: l, wk: { w: '2020-1-6', n: 'x', d: 5, done: 1 } })); }, [KEY, lang]);
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900);
    const r = await p.evaluate(() => { const D = window.__hayDash, ev = D.ev;
      // the Monday of the week, for every day of a week
      const mon = ['2026-11-9', '2026-11-10', '2026-11-12', '2026-11-15'].map(s => { const [y, m, d] = s.split('-').map(Number); return ev(`weekKey(new Date(${y}, ${m - 1}, ${d}, 12))`); });
      const st0 = JSON.stringify(ev('weekState()'));
      const g = ev('weekGoal()');
      // a run that falls short, then runs that reach the goal: rewarded once
      const bank0 = D.SV.bank, cl0 = D.SV.clovers; const big = { hay: 99999, jumps: 99999, perfect: 99999, treats: 99999 };
      const half = {}; for (const k in big) half[k] = Math.floor(g.n / 2);
      const m1 = ev('weekAdd')(g.k === 'runs' || g.k === 'days' ? {} : half);
      let msgs = [m1]; for (let i = 0; i < 20 && !D.SV.wk.done; i++) { if (g.k === 'days') D.SV.wk.d.push('2000-1-' + (i + 1)); msgs.push(ev('weekAdd')(big)); }
      const got = msgs.filter(Boolean);
      const bank1 = D.SV.bank, cl1 = D.SV.clovers; ev('weekAdd')(big); const again = D.SV.bank - bank1;
      // the missions screen shows it
      ev('openMissions()'); const html = (document.querySelector('.m.week') || {}).textContent || '';
      return { mon, st0, g, got, gain: bank1 - bank0, clv: cl1 - cl0, again, done: D.SV.wk.done, html, txt: ev('weekText')(g) };
    });
    const tag = lang + ':';
    ok[tag + 'monday'] = r.mon.every(x => x === '2026-11-9');
    ok[tag + 'reset'] = /"n":0/.test(r.st0) && /"done":0/.test(r.st0);
    ok[tag + 'once'] = r.got.length === 1 && r.gain === 1000 && r.clv === 2 && r.again === 0 && r.done === 1;
    ok[tag + 'panel'] = r.html.includes(lang === 'ja' ? '今週の目標' : "This week's goal") && r.html.includes('CLEAR') && r.html.includes(r.txt);
    ok[tag + 'text'] = lang === 'ja' ? /[ぁ-ん]/.test(r.txt) && !r.txt.includes('{0}') : /^[ -~]+$/.test(r.txt) && !r.txt.includes('{0}');
    // a real run end adds to the week (and the result line shows when it is reached)
    const run = await p.evaluate(async () => { const D = window.__hayDash; D.SV.wk = null; D.ev('save()'); D.ev('hideAll(); startRun()'); await new Promise(r => setTimeout(r, 600));
      const G = D.G; G.stats.hay = 99999; G.stats.jumps = 99999; G.stats.perfect = 99999; G.stats.treats = 99999; G.hay = 10; G.dist = 300;
      D.ev('G.invT = 0; G.lives = 0; G.reviveN = 9; hideAll(); endRun()'); await new Promise(r => setTimeout(r, 300));
      return { wk: D.SV.wk, note: (document.querySelector('#resNote') || {}).textContent || '' }; });
    const goalK = r.g.k;
    ok[tag + 'run'] = !!run.wk && (goalK === 'runs' || goalK === 'days' ? run.wk.n >= 1 : run.wk.n > 0);
    if (run.wk && run.wk.done) ok[tag + 'runMsg'] = run.note.includes(lang === 'ja' ? '今週の目標達成' : 'Weekly goal done');
    await p.screenshot({ path: path.resolve(__dirname, '../shots') + `/weekgoal_${lang}.png` }).catch(() => {});
    await ctx.close();
  }
  console.log(JSON.stringify(ok));
  console.log(Object.values(ok).every(Boolean) && !errs.length ? 'WEEK GOAL OK' : 'WEEK GOAL NG ' + errs.slice(0, 3).join(' | '));
  await b.close();
})();
