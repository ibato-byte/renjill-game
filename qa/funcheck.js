// 2026-11-08 に入れた「面白くなる機能」が本当に動くか：パーフェクトライン・コンボの節目・SPEED UP・スローモーション・金の道・今日の牧草の目標
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = []; const ok = {};
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9 })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800);
  ok.goalTitle = await p.evaluate(() => !!document.querySelector('#tDayGoal') && /300/.test(document.querySelector('#tDayGoal').textContent));
  await p.click('#btnStart'); await p.waitForTimeout(600);
  const r = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; const seen = { banner: [], float: [] };
    const bn = document.querySelector('#banner'); new MutationObserver(() => seen.banner.push(bn.textContent)).observe(bn, { childList: true, subtree: true, characterData: true });
    // perfect line: collect every piece of one line by hand
    const sg = D.ev('curSeg()'); const lines = {}; for (const it of sg.items) if (it.line) (lines[it.line] = lines[it.line] || []).push(it);
    const ln = Object.values(lines).find(a => a.length >= 8); const sc0 = G.score;
    if (ln) for (const it of ln) D.ev(`collect(curSeg().items[${sg.items.indexOf(it)}], curSeg())`);
    const perfect = G.stats.perfect || 0;
    // combo milestone
    G.combo = 24; const hay = sg.items.find(it => !it.got && it.type === 'hay'); if (hay) D.ev(`collect(curSeg().items[${sg.items.indexOf(hay)}], curSeg())`);
    // slow motion after three NICE in a row
    D.ev("nice('jump'); nice('jump'); nice('jump')"); const slow = G.slowT > 0;
    // speed up: push the distance on
    G.dist += 2000; G.invT = 99; await new Promise(r => setTimeout(r, 900));
    // golden road: build a few stretches until one turns up
    let gold = 0; D.ev('G.t = 60'); for (let i = 0; i < 400 && !gold; i++) { const s = D.ev("newSeg(curSeg(), { t: 'shinjuku', d: 60 }, {})"); if (s.goldRoad && s.items.filter(x => x.type === 'goldhay').length === 6) gold = 1; }
    await new Promise(r => setTimeout(r, 2500));
    return { perfect, scoreUp: G.score > sc0, slow, gold, spTier: G.spTier, banners: seen.banner.join(' | ').slice(0, 400) };
  });
  ok.perfect = r.perfect >= 1 && r.scoreUp; ok.combo = /25 COMBO/.test(r.banners); ok.speed = r.spTier >= 1 && /SPEED UP/.test(r.banners); ok.slow = r.slow; ok.gold = !!r.gold;
  // the daily goal adds up at the end of a run
  await p.evaluate(() => { const D = window.__hayDash; D.G.hay = 350; D.ev('G.invT = 0; G.lives = 0; G.reviveN = 9; hideAll(); endRun()'); });
  await p.waitForTimeout(800);
  ok.goalCount = await p.evaluate(() => { const S = window.__hayDash.SV; return !!(S.dayHay && S.dayHay.n >= 300); });
  console.log(JSON.stringify(ok), r.banners.slice(0, 200));
  console.log(Object.values(ok).every(Boolean) && !errs.length ? 'FUN OK' : 'FUN NG ' + errs.slice(0, 3).join(' | '));
  await b.close();
})();
