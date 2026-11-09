// お祭りの日（B-29）：お祭りの日に提灯の通り（浅草）へ入ると音楽が祭りばやし＋お知らせ、ふつうの日や提灯のない通りでは変わらない。祭りの曲は太鼓つき
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900); await p.click('#btnStart'); await p.waitForTimeout(700);
  const r = await p.evaluate(() => { const D = window.__hayDash, G = D.G, ev = D.ev; const at = (tid, on) => { G.matsuri = on; G.matsuriTold = 0; G.jumpTo(tid, 1100, 1); return ev('musicArea'); };
    return { fest: at('asakusa', 1), told: G.matsuriTold, plain: at('asakusa', 0), noLantern: at('shinjuku', 1), song: ev('!!(SONGS.matsuri && SONGS.matsuri.taiko)'), day: typeof ev('matsuriDay()') === 'boolean' }; });
  console.log(JSON.stringify(r));
  const ok = r.fest === 'matsuri' && r.told === 1 && r.plain !== 'matsuri' && r.noLantern !== 'matsuri' && r.song && r.day;
  console.log(ok && !errs.length ? 'MATSURI OK' : 'MATSURI NG ' + errs.join(' | ')); await b.close();
})();
