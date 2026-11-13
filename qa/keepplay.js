// 続けて高い点を目指したくなる仕組み（2026-11-13 オーナーの依頼「すぐ飽きてやめてしまう」→ 31 個の改善）が全部はたらいているか。
// 走っている間：つぎの目標のバー・大台・75%/90%・今日のベスト・今日の目標スコア・ぬいた相手・コンボのボーナス・ペース・スタートブースト
// 結果：評価（S〜D）・自己ベストとの差・前回との差・今日/今週のベスト・おしい！・勲章・コツ・次の順位・うちわけ・最近の5回・倍率・次に買える物・明日の予告・れんぞく・今日の1回目
// 題名：今日の目標スコア・今日/今週のベスト・キャラクターごとのベスト・きろく・ミッションの入れかえ・おかえりボーナス。古いセーブ・こわれた数字でも動く
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [], bad = [], ok = (c, m) => { if (!c) bad.push(m); };
  const day = d => { const x = new Date(Date.now() - d * 864e5); return x.getFullYear() + '-' + (x.getMonth() + 1) + '-' + x.getDate(); };
  const open = async (sv, lang) => { const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(s => { if (!sessionStorage.getItem('k')) { sessionStorage.setItem('k', 1); localStorage.setItem('renjill-hay-dash-v1', s); } }, JSON.stringify(Object.assign({ tutDone: 1, nickAsked: 1, runs: 9, lang: lang || 'ja', pomMet: 1, daily: day(0), streak: 2 }, sv)));
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200); return p; };
  const ev = (p, s) => p.evaluate(s => window.__hayDash.ev(s), s);
  const finish = async p => { await p.evaluate(() => { window.__hayDash.G.invT = 0; window.__die('obstacle'); }); await p.waitForTimeout(1300); if (await p.evaluate(() => !document.querySelector('#sRevive').hidden)) await p.click('#btnRvNo'); await p.waitForTimeout(1800); };
  const txt = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e && !e.hidden ? e.textContent : ''; }, sel);
  const banners = p => p.evaluate(() => { window.__bn = []; const D = window.__hayDash; const el = document.querySelector('#banner .ja'); new MutationObserver(() => window.__bn.push(el.textContent)).observe(el, { childList: true, characterData: true, subtree: true }); });

  // ---- A：記録のある人（ベスト 30,000・所持 950本）----
  let p = await open({ best: 30000, bank: 950, mlevel: 2, kp: { d: day(0), db: 12000, w: 'old', wb: 20000, h: [8000, 22000, 15000, 30000], last: 30000, cb: { ren: 30000, jill: 22000 }, top: [[30000, 'r', day(1), 'lobby']], sp: { 3: 3000 }, ls: day(0) } });
  const title = await p.evaluate(() => document.querySelector('#sTitle').innerText);
  ok(/今日の目標スコア 18,000/.test(title), '題名：今日の目標スコア（ベストの6割）'); ok(/今日 12,000/.test(title), '題名：今日のベスト'); ok(/ベスト 30,000/.test(await txt(p, '#pickRen .cbest')) && /22,000/.test(await txt(p, '#pickJill .cbest')), '題名：キャラクターごとのベスト');
  await p.click('#btnRecords'); await p.waitForTimeout(250); { const r = await txt(p, '#pBody'); ok(/30,000/.test(r) && /見習いランナー/.test(r) && /最近10回の平均/.test(r), 'きろくの画面'); } await p.click('#pClose');
  await p.click('#btnMissions'); await p.waitForTimeout(250); { const before = await ev(p, 'JSON.stringify(SV.missions.slots.map(s => s.id))'), bank = await ev(p, 'SV.bank'); await p.click('[data-reroll]'); await p.waitForTimeout(250);
    const after = await ev(p, 'JSON.stringify(SV.missions.slots.map(s => s.id))'); ok(before !== after && (await ev(p, 'SV.bank')) === bank - 100 && (await ev(p, 'SV.missions.slots.length')) === 3, 'ミッションの入れかえ（100本）'); } await p.click('#pClose');
  await ev(p, "KP_RIVALS = [{ s: 5200, n: 'ミミ' }, { s: 90000, n: 'ロロ' }]; KP_RIVALS.test = 1");
  await p.click('#btnBoost'); ok((await p.getAttribute('#btnBoost', 'aria-pressed')) === 'true', 'スタートブーストの切りかえ');
  await p.click('#btnStart'); await p.waitForTimeout(1200); await banners(p);
  ok((await ev(p, 'SV.bank')) === 650 && (await ev(p, 'G.pow.x2 > 0 && G.pow.magnet > 0')), 'スタートブースト：200本でスコア2倍とマグネット');
  await p.evaluate(() => { const G = window.__hayDash.G; G.invT = 999; G.score = 4000; }); await p.waitForTimeout(500);
  ok(/ミミ 5,200/.test(await txt(p, '#kpNext')), 'つぎの目標：すぐ上の相手 → ' + await txt(p, '#kpNext'));
  await p.evaluate(() => { window.__hayDash.G.score = 5300; }); await p.waitForTimeout(2600);
  for (const s of [10100, 12100, 18100, 23000, 27500]) { await p.evaluate(s => { window.__hayDash.G.score = s; }, s); await p.waitForTimeout(450); }
  await p.evaluate(() => { const G = window.__hayDash.G; G.jumpTo('lobby', 545); G.invT = 999; G.combo = 31; G.comboT = 9; }); await p.waitForTimeout(600);
  { const s = await ev(p, 'JSON.stringify({ m: G.stats.kpMile, r: G.stats.kpRival, g: G.stats.kpGoal, c: G.stats.kpCombo, pace: G.stats.kpPace, t75: G.kp.t75, t90: G.kp.t90, day: G.kp.dayTold, tg: SV.kp.tg })'), o = JSON.parse(s), bn = (await p.evaluate(() => window.__bn)).join('|');
    ok(o.m === 2, '大台（10,000・25,000）' + s); ok(o.r === 1 && /ミミ さんをぬいた/.test(bn), 'ぬいた相手の名前'); ok(o.g === 1 && o.tg === day(0), '今日の目標スコア達成'); ok(o.c === 1, '30コンボのボーナス'); ok(typeof o.pace === 'number', 'ペース（ベストのときとの差）'); ok(o.t75 && o.t90 && o.day, '75%・90%・今日のベスト');
    ok(/自己ベスト 30,000/.test(await txt(p, '#kpNext')), 'つぎの目標：自己ベスト → ' + await txt(p, '#kpNext')); }
  await finish(p);
  { const r = await txt(p, '#resKeep'), m = await p.evaluate(() => document.querySelector('#resKeepMore').textContent), g = await txt(p, '.kp-grade'), k = JSON.parse(await ev(p, 'JSON.stringify(SV.kp)')), again = await txt(p, '#btnAgain');
    ok(g === 'A', '評価 A（ベストの8割以上）: ' + g); ok(/自己ベストの 9\d%/.test(r), '自己ベストとの差'); ok(/前回より −/.test(r), '前回との差'); ok(/今日のベスト 2\d,\d{3}/.test(r) && /今日のベスト更新/.test(r), '今日のベスト'); ok(/おしい！/.test(r), 'おしい！');
    ok(/スコア勲章/.test(r) && k.md === 2, '勲章（10,000・30,000）'); ok(/コツ：/.test(r), 'コツ'); ok(/次の順位：ロロ さんまで/.test(r), '次の順位'); ok(/今日の目標スコア達成 ＋150本/.test(r), '今日の目標のごほうび');
    ok(/点数のうちわけ/.test(m) && /最近の5回/.test(m) && /スコア倍率 ×2/.test(m) && /が買える/.test(m) && /明日も来ると ログインボーナス 90本（3日連続）/.test(m), 'くわしく：うちわけ・最近の5回・倍率・次に買える物・明日の予告 ' + m.slice(0, 200));
    ok(k.h.length === 5 && k.top.length === 2 && k.cb.ren === 30000 && k.db > 27000 && k.wb === k.db && k.lw === 20000 && k.lwDone === 1 && /先週のベストをこえた/.test(r), '記録の保存・先週のベストごえ ' + JSON.stringify(k).slice(0, 300));
    ok(/れんぞく2回目：チモシー＋5%/.test(again) && (await p.evaluate(() => document.querySelector('#btnAgain').classList.contains('pulse'))), 'もう1回のボタン（れんぞく・ゆれる）'); }
  // れんぞく2回目：スペースキーで始まり、チモシーが5%ふえる。数え上げはタップで飛ばせる
  await p.keyboard.press('Space'); await p.waitForTimeout(900); ok((await ev(p, 'G.mode')) === 'play' && (await ev(p, 'KP_CHAIN')) === 1, 'スペースキーでもう1回');
  await p.evaluate(() => { const G = window.__hayDash.G; G.jumpTo('lobby', 545); G.invT = 999; G.hay = 200; G.dist = 400; G.score = 31000; }); await p.waitForTimeout(600); await p.evaluate(() => { window.__hayDash.G.invT = 0; window.__die('obstacle'); }); await p.waitForTimeout(1300); if (await p.evaluate(() => !document.querySelector('#sRevive').hidden)) await p.click('#btnRvNo'); await p.waitForTimeout(250);
  await p.click('#resScore'); await p.waitForTimeout(120); ok(/^3\d,\d{3}$/.test(await txt(p, '#resScore')), '点数をタップで数え上げを飛ばす'); await p.waitForTimeout(800);
  { const r = await txt(p, '#resKeep'); ok((await txt(p, '.kp-grade')) === 'S' && /自己ベストを .* 更新/.test(r), '評価 S（自己ベスト）'); ok(/今日の1回目ボーナス ＋1\d\d本/.test(r) && /れんぞく2回目 ＋1\d本/.test(r), '今日の1回目・れんぞくのチモシー ' + r); ok(!/おしい/.test(r), '自己ベストのときは「おしい」を出さない');
    ok(Object.keys(JSON.parse(await ev(p, 'JSON.stringify(SV.kp.sp)'))).length >= 1, 'ベストのペースを保存'); }
  await p.click('#btnMenu'); await p.waitForTimeout(500); ok(/今日の目標スコア .* ✓/.test(await txt(p, '#tKeep')), '題名：今日の目標スコア ✓');
  await p.context().close();

  // ---- B：やさしいモード・1分ダッシュでは出さない（記録にも入れない）----
  p = await open({ best: 30000, bank: 500 }); await ev(p, 'G.quickNext = 1; hideAll(); startRun()'); await p.waitForTimeout(900); await p.evaluate(() => { const G = window.__hayDash.G; G.invT = 99; G.score = 12000; }); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.querySelector('#kpGoal').hidden), '1分ダッシュ：つぎの目標を出さない'); await p.evaluate(() => { window.__hayDash.G.invT = 0; window.__die('time'); }); await p.waitForTimeout(2500);
  ok(await p.evaluate(() => document.querySelector('#resKeep').hidden) && !(await ev(p, '(SV.kp && SV.kp.h || []).length')), '1分ダッシュ：記録に入れない'); await p.context().close();

  // ---- C：3日ぶり → おかえりボーナス。古いセーブ（kp なし）・こわれた kp でも動く ----
  p = await open({ best: 5000, bank: 100, clovers: 1, daily: day(4), streak: 3, kp: 'x' }); await p.waitForTimeout(1500);
  ok((await ev(p, 'SV.bank')) >= 400 && (await ev(p, 'SV.clovers')) === 2, 'おかえりボーナス（300本とお守り）'); ok((await ev(p, 'typeof SV.kp')) === 'object' && /今日の目標スコア 3,000/.test(await txt(p, '#tKeep')), 'こわれた記録でも動く'); await p.context().close();
  p = await open({ best: 0, runs: 0, tutDone: 0, kp: { h: 'a', top: [1, [NaN]], cb: 3, md: -4, db: 'z' } }); ok(await p.evaluate(() => document.querySelector('#tKeep').hidden), 'はじめての人には出さない（チュートリアルの前）'); ok((await ev(p, 'SV.bank')) < 300, 'はじめての人におかえりボーナスを出さない'); await p.context().close();

  // ---- D：英語 ----
  p = await open({ best: 30000, bank: 950, kp: { last: 9000 } }, 'en'); ok(/Today's score goal 18,000/.test(await txt(p, '#tKeep')) && /Start boost/.test(await txt(p, '#btnBoost')) && (await txt(p, '#btnRecords')) === 'Records', '英語の題名');
  await p.click('#btnStart'); await p.waitForTimeout(900); await p.evaluate(() => { const G = window.__hayDash.G; G.invT = 99; G.score = 9500; }); await p.waitForTimeout(400); ok(/Next 10,000/.test(await txt(p, '#kpNext')), '英語：つぎの目標'); await finish(p);
  { const all = await p.evaluate(() => document.querySelector('#resKeep').textContent + document.querySelector('#resKeepMore').textContent + document.querySelector('#btnAgain').textContent); ok(/of your best/.test(all) && /Tip:/.test(all) && /Where the points came from/.test(all) && /in a row/.test(all) && !/[ぁ-んァ-ヶ]/.test(all), '英語の結果（日本語がまざらない）'); }
  await p.context().close();

  console.log(bad.length || errs.length ? 'KEEPPLAY NG\n' + bad.concat(errs).join('\n') : 'KEEPPLAY OK'); await b.close();
})();
