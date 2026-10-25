// はじめての人の最初の30秒：チュートリアル → ごほうびのフィーバー → 最初の失敗は無料でもう一回（はじめの3回まで）。日英。
const { chromium } = require('playwright');
const SH = process.env.SHOTS || 'shots';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = [], out = {};
  for (const lang of ['ja', 'en']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: lang === 'ja' ? 'ja-JP' : 'en-US' }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(lang + ': ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
    await p.evaluate(l => { const D = window.__hayDash; D.SV.lang = l; D.SV.nickAsked = 1; D.ev('LANG = SV.lang; save(); refreshTitle()'); }, lang);
    await p.click('#btnStart'); const t0 = Date.now(); let fever = 0, tutDone = 0, feverAt = 0;
    while (Date.now() - t0 < 24000) {
      const s = await p.evaluate(() => { const G = window.__hayDash.G; return { mode: G.mode, cue: document.querySelector('#tutCue').className + '|' + document.querySelector('#tutCue').textContent, fever: G.fever, tut: window.__hayDash.SV.tutDone, t: G.t, need: G.tut && (G.tut.find(x => !x.done) || {}).need, turn: G.tutSeg && G.tutSeg.turn }; });
      if (s.tut) tutDone = 1; if (s.fever > 0 && !fever) { fever = 1; feverAt = s.t; await p.screenshot({ path: SH + `/first_fever_${lang}.png` }); }
      if (s.mode !== 'play') break;
      if (/show/.test(s.cue)) { const n = s.need; if (n === 'side') await p.keyboard.press('ArrowLeft'); else if (n === 'up') await p.keyboard.press('ArrowUp'); else if (n === 'down') await p.keyboard.press('ArrowDown'); else if (n === 'turn' && /turn/.test(s.cue)) await p.keyboard.press(s.turn > 0 ? 'ArrowRight' : 'ArrowLeft'); }
      if (fever && s.fever === 0) break;
      await p.waitForTimeout(100);
    }
    if (!tutDone || !fever || feverAt > 20) errs.push(lang + ` FIRST 30s tut=${tutDone} fever=${fever} at ${feverAt}`);
    // the first fail: a free retry, charms untouched
    await p.waitForTimeout(1200);
    await p.evaluate(() => { const G = window.__hayDash.G; G.invT = 0; G.fever = 0; window.__die('obstacle'); }); await p.waitForTimeout(1400);
    const rv = await p.evaluate(() => ({ vis: !document.querySelector('#sRevive').hidden, btn: document.querySelector('#btnRvClover').textContent, hayHidden: document.querySelector('#btnRvHay').hidden, clovers: window.__hayDash.SV.clovers }));
    if (!rv.vis || !/初回ボーナス|for free/.test(rv.btn) || !rv.hayHidden) errs.push(lang + ' FREE REVIVE ' + JSON.stringify(rv));
    await p.screenshot({ path: SH + `/first_revive_${lang}.png` });
    await p.click('#btnRvClover'); await p.waitForTimeout(500);
    const after = await p.evaluate(() => ({ mode: window.__hayDash.G.mode, clovers: window.__hayDash.SV.clovers }));
    if (after.mode !== 'play' || after.clovers !== rv.clovers) errs.push(lang + ' AFTER FREE ' + JSON.stringify(after));
    // the second fail in the same run: the usual (paid) choice
    await p.waitForTimeout(2800); await p.evaluate(() => { const G = window.__hayDash.G; G.invT = 0; window.__die('obstacle'); }); await p.waitForTimeout(1400);
    const rv2 = await p.evaluate(() => ({ vis: !document.querySelector('#sRevive').hidden, btn: document.querySelector('#btnRvClover').textContent, mode: window.__hayDash.G.mode }));
    if (rv2.vis && /初回ボーナス|for free/.test(rv2.btn)) errs.push(lang + ' SECOND FREE ' + JSON.stringify(rv2));
    // after three runs: no more free retries
    await p.evaluate(() => { const D = window.__hayDash; D.SV.runs = 4; D.G.reviveN = 0; D.G.cause = 'obstacle'; });
    if (await p.evaluate(() => window.__hayDash.ev('freeRevive()'))) errs.push(lang + ' FREE AFTER 3 RUNS');
    out[lang] = { feverAt, rv, after, rv2 }; await ctx.close();
  }
  console.log(JSON.stringify(out)); console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'FIRST RUN OK no errors'); await b.close();
})();
