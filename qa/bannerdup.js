// お知らせの帯の見出しと本文が、同じことをくり返さない（「今日のチャレンジ達成！ チャレンジ達成！…」「9:00 出社！ 出社！」）（2026-11-09）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const dup = [];
  for (const lang of ['ja', 'en']) { const p = await b.newPage({ viewport: { width: 390, height: 844 } }); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(l => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: l, pomMet: 1 })), lang);
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(700); await p.click('#btnStart'); await p.waitForTimeout(400);
    await p.evaluate(() => { const D = window.__hayDash, G = D.G; setInterval(() => { if (G.mode !== 'play') return; G.invT = 2; const sg = D.ev('curSeg()'); if (sg && (sg.turn || sg.fork) && G.s > sg.len - 12 && !G.turnQueued) D.act((sg.turn || 1) < 0 ? 'left' : 'right'); }, 60); });
    // 帯がよく出る場面を順に：出社・今日のチャレンジ達成・フィーバー・お昼の分かれ道・定時
    await p.waitForTimeout(6000);
    await p.evaluate(() => { const D = window.__hayDash; try { D.ev("G.stats.perfect = 99; G.stats.jumps = 999; G.stats.slides = 999; G.stats.fevers = 99"); D.ev('dailyCheck && dailyCheck(true)'); } catch (e) { } });
    await p.evaluate(() => { const G = window.__hayDash.G; G.feverM = 999; }); await p.waitForTimeout(3000);
    await p.evaluate(() => window.__hayDash.G.testFork()); await p.waitForTimeout(5000);
    await p.evaluate(() => window.__hayDash.G.jumpTo('tokyoeki', 1078, 1)); await p.waitForTimeout(6000);
    dup.push(...(await p.evaluate(() => window.__hayDash.G.bannerDup || [])).map(x => lang + ': ' + x)); await p.close(); }
  console.log(dup.length ? 'BANNERDUP NG ' + [...new Set(dup)].join(' | ') : 'BANNERDUP OK'); await b.close(); })();
