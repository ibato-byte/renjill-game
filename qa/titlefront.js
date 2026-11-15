// タイトル画面では、出ている 3 人がみんな前を向く（2026-11-15 の報告：「レンを選んでいるのに、振り向いているのはポム」。
// 前を向かせる命令が説明書きの中に入って動かず、1 回遊んでタイトルに戻ると、レンとジルが後ろ姿のままだった）。
// 確かめること：開いた直後・1 回遊んで戻った後・キャラクターを選び直した後の 3 つで、3 人の絵がみんな前向き（front_）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 3, char: 'ren' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1500);
  const look = async (when) => { await p.waitForTimeout(700); const r = await p.evaluate(() => { const G = window.__hayDash.G; return ['player', 'follow', 'pom'].map(k => ({ k, who: G[k].who, show: G[k].show, pose: G[k].pose || '' })); });
    for (const x of r) if (x.show && !/^front_/.test(x.pose)) bad.push(`${when}：${x.who} が前を向いていない（${x.pose}）`);
    if (r.filter(x => x.show).length < 3) bad.push(`${when}：3 人そろっていない ${JSON.stringify(r)}`); };
  await look('開いた直後');
  await p.click('#btnStart'); await p.waitForTimeout(2500); await p.evaluate(() => { const H = window.__hayDash; H.G.player.look = 1; H.G.follow.look = 1; H.ev('goTitle()'); });
  await look('遊んで戻った後');
  for (const id of ['#pickJill', '#pickRen']) { const vis = await p.isVisible(id); if (vis) { await p.click(id); await look(id + ' を選んだ後'); } }
  await b.close(); if (bad.length) { console.log('TITLEFRONT NG\n' + [...new Set(bad)].join('\n')); process.exit(1); } console.log('TITLEFRONT OK');
})();
