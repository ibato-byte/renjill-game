// 言語の切りかえが見つけやすい：題名画面の右上に、今の言語名つきの地球ボタン。押すと4言語から選べ、選ぶと閉じて切りかわる（2026-11-09 の声）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  for (const [w, h] of [[320, 568], [390, 844], [844, 390], [1280, 760]]) { const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 })));
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800);
    const r = await p.evaluate(() => { const e = document.getElementById('btnLangTop'); if (!e || !e.offsetParent) return { vis: false }; const rc = e.getBoundingClientRect(); const top = document.elementFromPoint(rc.left + rc.width / 2, rc.top + rc.height / 2);
      return { vis: true, inView: rc.top >= 0 && rc.bottom <= innerHeight && rc.right <= innerWidth && rc.left >= 0, h: rc.height, w: rc.width, onTop: !!(top && top.closest('#btnLangTop')), txt: e.textContent }; });
    if (!r.vis || !r.inView || r.h < 32 || !r.onTop || !/日本語/.test(r.txt)) bad.push(w + 'x' + h + ' ' + JSON.stringify(r));
    // 他の画面（設定など）を開いたとき、閉じるボタンの上に重ならない
    await p.evaluate(() => window.__hayDash.ev('openSettings()')); await p.waitForTimeout(250);
    const cov = await p.evaluate(() => { const c = document.getElementById('pClose').getBoundingClientRect(); return [[.5, .5], [.3, .15], [.7, .15], [.5, .1]].every(([fx, fy]) => { const e = document.elementFromPoint(c.left + c.width * fx, c.top + c.height * fy); return !!(e && e.closest('#pClose')); }); });
    if (!cov) bad.push(w + ' covers pClose'); await p.evaluate(() => document.getElementById('pClose').click()); await p.waitForTimeout(200);
    await p.click('#btnLangTop'); await p.waitForTimeout(250);
    const n = await p.$$eval('[data-langpick]', a => a.length); if (n !== 4) bad.push(w + ' choices ' + n);
    await p.click('[data-langpick="en"]'); await p.waitForTimeout(250);
    const after = await p.evaluate(() => [document.getElementById('sPanel').hidden, document.getElementById('tLangTop').textContent, JSON.parse(localStorage.getItem('renjill-hay-dash-v1')).lang]);
    if (!after[0] || after[1] !== 'English' || after[2] !== 'en') bad.push(w + ' after ' + JSON.stringify(after));
    if (errs.length) bad.push(w + ' ERR ' + errs.join('|')); await p.close(); }
  console.log(bad.length ? 'LANGBTN NG ' + bad.join(' / ') : 'LANGBTN OK'); await b.close(); })();
