// 上の段の重なり（2026-11-09）：お知らせの帯が、ゲージ・ハート・パワーアップ・締め切りの山のバーに重ならない。分かれ道のカードと帯は重ならない（2026-11-14 から帯は画面の下）
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900); await p.click('#btnStart'); await p.waitForTimeout(600);
  const rects = () => p.evaluate(() => { const o = {}; for (const id of ['banner', 'feverBar', 'lives', 'pows', 'bossBar', 'forkCards']) { const e = document.getElementById(id); if (!e || e.hidden || e.offsetParent === null) continue; const r = e.getBoundingClientRect(); if (r.height > 1) o[id] = [Math.round(r.top), Math.round(r.bottom)]; } return o; });
  const r = {};
  // deadline: boss bar + hearts + a power-up + a long banner
  await p.evaluate(() => { const D = window.__hayDash, G = D.G; G.jumpTo('deadline', 1000, 1); G.invT = 99; G.pow.dash = 5; G.pow.magnet = 5; D.ev("bannerNow('TEST', 'とても長いお知らせの文がここに入ります。二行になるくらい長い文でも、上の段に重ならないこと', 'good')"); });
  await p.waitForTimeout(700); r.boss = await rects();
  // a fork with its cards
  await p.evaluate(() => { const D = window.__hayDash, G = D.G; G.pow.dash = 0; G.pow.magnet = 0; G.testFork(); D.ev("bannerNow('分かれ道', 'どっちに行く？ 行きたい方へスワイプ', 'room')"); });
  await p.waitForTimeout(900); r.fork = await rects();
  console.log(JSON.stringify(r));
  const below = (o, a) => !o[a] || !o.banner || o.banner[0] >= o[a][1] - 1;
  const ok = r.boss.banner && r.boss.bossBar && ['feverBar', 'lives', 'pows', 'bossBar'].every(a => below(r.boss, a)) && (!r.fork.forkCards || !r.fork.banner || r.fork.forkCards[1] <= r.fork.banner[0] + 1 || r.fork.forkCards[0] >= r.fork.banner[1] - 1) && r.boss.banner[0] > 500 /* 2026-11-14：帯は走る2人の下（道の先をふさがない）。分かれ道のカードとは重ならない */;
  console.log(ok && !errs.length ? 'HUDLAYOUT OK' : 'HUDLAYOUT NG ' + errs.join(' | ')); await b.close();
})();
