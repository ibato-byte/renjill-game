// 走り始めの 45 秒はやさしく（2026-11-16 オーナーの決定）
// ① 45 秒まで：正面でぶつかっても「BUMP!」で続く ② 追いかけられている間にもう 1 回ぶつかると終わり
// ③ 45 秒を過ぎたら、正面でぶつかると今までどおり終わり ④ 45 秒まで：曲がり損ねても、ぶつかって曲がって続く
// ⑤ 締め切りの山（ボス）では今までどおり 1 回で終わり
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../dist') + '/test.html';
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  const fresh = async () => { const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
    await p.goto(URL); await p.waitForTimeout(1200); await p.click('#btnStart'); await p.waitForTimeout(1500); return p; };
  const H = (p, code) => p.evaluate(c => window.__hayDash.ev(c), code);
  const clear = "G.invT=0;G.fever=0;G.pow.dash=0;G.pow.fly=0;G.shield=0;G.reviveN=9;";
  { const p = await fresh(); await H(p, clear + "G.t=10;G.chaseT=0;hit({})");
    if (await H(p, 'G.mode') !== 'play') bad.push('① 10 秒で正面にぶつかって終わった'); if (!((await H(p, 'G.chaseT')) > 0)) bad.push('① BUMP のあと追いかけが来ない');
    await H(p, clear + "G.t=12;hit({})"); await p.waitForTimeout(100); if (await H(p, 'G.mode') === 'play') bad.push('② 追いかけられている間に 2 回目でも終わらない'); await p.close(); }
  { const p = await fresh(); await H(p, clear + "G.t=50;G.chaseT=0;hit({})"); if (await H(p, 'G.mode') === 'play') bad.push('③ 50 秒で正面にぶつかっても終わらない'); await p.close(); }
  { const p = await fresh(); await H(p, clear + "G.t=20;G.chaseT=0;G.turnQueued=0;G.rush=0;(()=>{let k=0;while(curSeg().fork||!curSeg().turn){G.ci++;ensureSegs();if(++k>40)break;}})();G.s=curSeg().len+2;G.lane=1;G.lat=1");
    const ci = await H(p, 'G.ci'); await p.waitForTimeout(400);
    if (await H(p, 'G.mode') !== 'play') bad.push('④ 20 秒で曲がり損ねて終わった (' + await H(p, 'G.cause') + ')'); else if (!((await H(p, 'G.ci')) > ci)) bad.push('④ 曲がっていない'); await p.close(); }
  { const p = await fresh(); await H(p, clear + "G.t=10;G.chaseT=0;G.rush=1;hit({})"); await p.waitForTimeout(100); if (await H(p, 'G.mode') === 'play') bad.push('⑤ ボスの道で 1 回目に終わらない'); await p.close(); }
  console.log(bad.length ? 'SOFTSTART FAIL\n' + bad.join('\n') : 'SOFTSTART OK no errors'); await b.close(); })();
