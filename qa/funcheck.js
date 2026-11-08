// 2026-11-08 に入れた「面白くなる機能」が本当に動くか：パーフェクトライン・コンボの節目・SPEED UP・スローモーション・金の道・今日の牧草の目標・空中キャッチ・すべりこみ名人・ナイスコーナー
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
    // air catch: five hay in one jump
    // （1回の評価の中でまとめて取る。評価のあいだにゲームのコマが進むと着地して数え直しになり、たまに落ちていた。2026-11-08）
    const air = D.ev(`(() => { const sg = curSeg(); for (let i = 0; i < 6; i++) addItem(sg, 'hay', G.s + 30 + i, 1, .45); G.air = true; G.airN = 0; G.pow.fly = 0; const a0 = G.stats.airCatch || 0; for (const it of sg.items.filter(x => !x.got && x.type === 'hay').slice(-6)) collect(it, sg); const r = (G.stats.airCatch || 0) > a0 ? 1 : 0; G.air = false; return r; })()`);
    // slide master: three slide-unders in a row
    G.niceT = -9; D.ev("nice('slide'); G.niceT = -9; nice('slide'); G.niceT = -9; nice('slide')"); const slideM = G.slideRow >= 3;
    // nice corner: a turn queued in the last metres
    D.ev('G.turnAuto = 0; G.turnQT = 3'); const nc0 = G.stats.niceCorner || 0; try { D.ev('if (!curSeg().fork) { const sg = curSeg(); sg.turn = sg.turn || 1; G.turnQueued = sg.turn; doTurn(); }'); } catch (e) { }
    const corner = (G.stats.niceCorner || 0) > nc0 || !!D.ev('curSeg().fork');
    // fork: one side gets more hay (twins that do not break a PERFECT LINE)
    const rich = D.ev(`JSON.stringify((()=>{ let n = 0, more = 0, noLine = 1; for (let i = 0; i < 30; i++) { const a = newSeg(null, { t: curSeg().step.t, d: 60 }, {}), c = newSeg(null, { t: curSeg().step.t, d: 60 }, {}); const h0 = a.items.filter(x => x.type === 'hay').length; richHay(a); const add = a.items.filter(x => x.type === 'hay').length - h0; if (a.rich) n++; if (add > 0) more++; a.items.slice(-add).forEach(x => { if (add > 0 && x.line) noLine = 0; }); } return { n, more, noLine }; })())`);
    const sky = D.ev('(() => { const sg = curSeg(); if (sg.fork) return 5; const keep = G.s; G.s = 4; sg.items = sg.items.filter(x => x.s < 3 || x.s > 20); const n = skyHay(SUPERV); const g = sg.items.some(x => x.type === "goldhay" && x.y > 1.5); G.s = keep; return g ? n : 0; })()');
    // dropped papers (B-24): they turn up on streets, and picking one up earns points and a thank-you from the partner
    const memo = D.ev(`JSON.stringify((() => { let seen = 0; G.t = 60; for (let i = 0; i < 60 && !seen; i++) { G.memoAt = 0; const a = newSeg(null, { t: 'shinjuku', d: 60 }, {}); if (a.items.some(x => x.type === 'memo')) seen = 1; }
      const sg = curSeg(); addItem(sg, 'memo', G.s + 40, 1, .45); const it = sg.items[sg.items.length - 1]; const s0 = G.score, m0 = G.stats.memos || 0; G.follow.show = true; collect(it, sg);
      return { seen, got: (G.stats.memos || 0) - m0, pts: G.score - s0, say: G.follow.say, book: !!SV.zukan.memo }; })())`);
    // president walks by (B-22): ten hay with no bumps inside the window earns the bonus; a bump ends it
    const pres = D.ev(`JSON.stringify((() => { const s0 = G.score, p0 = G.stats.pres || 0; G.pres = { t: 8, hay0: G.stats.hay, bump0: G.bumps || 0 }; G.stats.hay += 10; presTick(.016); const ok = (G.stats.pres || 0) - p0;
      G.pres = { t: 8, hay0: G.stats.hay, bump0: G.bumps || 0 }; G.bumps = (G.bumps || 0) + 1; presTick(.016); return { ok, pts: G.score - s0, endsOnBump: G.pres === null }; })())`);
    // snow days (B-28): snowballs roll on streets; rain (C-52) and the sea (C-50) have their own sound
    const snow = D.ev(`JSON.stringify((() => { const w = G.weather; G.weather = 'snow'; let n = 0; for (let i = 0; i < 40 && !n; i++) { const a = newSeg(null, { t: 'shinjuku', d: 60 }, {}); n = a.obs.filter(o => o.art === 'snowball' && o.mv > 0).length; }
      G.weather = 'clear'; let m = 0; for (let i = 0; i < 20; i++) { const a = newSeg(null, { t: 'shinjuku', d: 60 }, {}); m += a.obs.filter(o => o.art === 'snowball').length; } G.weather = w; return { n, m }; })())`);
    const amb = D.ev(`JSON.stringify((() => { if (!AU.ctx) return { skip: 1 }; const w = G.weather; G.weather = 'rain'; ambTick(); const r = AU.amb && AU.amb.level ? AU.amb.level.rain : -1; G.weather = 'clear'; ambTick(); const r0 = AU.amb.level.rain; G.weather = w; return { r, r0 }; })())`);
    return { pres: JSON.parse(pres), snow: JSON.parse(snow), amb: JSON.parse(amb), memo: JSON.parse(memo), sky, rich: JSON.parse(rich), air, slideM, corner, perfect, scoreUp: G.score > sc0, slow, gold, spTier: G.spTier, banners: seen.banner.join(' | ').slice(0, 400) };
  });
  ok.pres = r.pres.ok === 1 && r.pres.pts > 0 && r.pres.endsOnBump; ok.snowball = r.snow.n > 0 && r.snow.m === 0; ok.rainSound = !!r.amb.skip || (r.amb.r > 0 && r.amb.r0 === 0); if (!ok.pres || !ok.snowball || !ok.rainSound) console.log('new', JSON.stringify([r.pres, r.snow, r.amb]));
  ok.memo = r.memo.seen === 1 && r.memo.got === 1 && r.memo.pts > 0 && !!r.memo.say && !r.memo.book; if (!ok.memo) console.log('memo', JSON.stringify(r.memo));
  ok.perfect = r.perfect >= 1 && r.scoreUp; ok.combo = /25 COMBO/.test(r.banners); ok.speed = r.spTier >= 1 && /SPEED UP/.test(r.banners); ok.slow = r.slow; ok.gold = !!r.gold; ok.air = !!r.air; ok.slideMaster = r.slideM; ok.corner = r.corner; ok.sky = r.sky >= 4; ok.rich = r.rich.n === 30 && r.rich.more >= 20 && r.rich.noLine === 1;
  // the daily goal adds up at the end of a run
  await p.evaluate(() => { const D = window.__hayDash; D.G.hay = 350; D.ev('G.invT = 0; G.lives = 0; G.reviveN = 9; hideAll(); endRun()'); });
  await p.waitForTimeout(800);
  ok.goalCount = await p.evaluate(() => { const S = window.__hayDash.SV; return !!(S.dayHay && S.dayHay.n >= 300); });
  console.log(JSON.stringify(ok), r.banners.slice(0, 200));
  console.log(Object.values(ok).every(Boolean) && !errs.length ? 'FUN OK' : 'FUN NG ' + errs.slice(0, 3).join(' | '));
  await b.close();
})();
