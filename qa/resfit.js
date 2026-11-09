// 結果画面の点数が、8桁・9桁でも枠からはみ出さない（320・390・1280 幅、4言語）（2026-11-09 の報告：8桁で下2桁が切れた）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  for (const [w, h] of [[320, 640], [390, 844], [1280, 760]]) for (const lang of ['ja', 'en']) for (const score of [1234567, 10328912, 123456789]) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(l => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: l, pomMet: 1 })), lang);
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(600); await p.addStyleTag({ content: '#resScore{letter-spacing:.14em}' }); /* 本物の太い数字の字（Dela Gothic One）は、テストの代わりの字より幅が広い：広めにして確かめる */ await p.click('#btnStart'); await p.waitForTimeout(800);
    await p.evaluate(s => { const D = window.__hayDash; D.G.score = s; D.ev("G.cause = 'obstacle'; G.mode = 'dead'; endRun()"); }, score); await p.waitForTimeout(2200);
    const r = await p.evaluate(() => { const e = document.getElementById('resScore'), box = e.closest('.res-score').parentElement.getBoundingClientRect(), rc = e.getBoundingClientRect(); const card = e.closest('.card, .panel, section') || document.body; const cr = card.getBoundingClientRect();
      return { txt: e.textContent, ok: e.scrollWidth <= e.clientWidth + 1 && rc.right <= Math.min(cr.right, innerWidth) + 1 && rc.left >= Math.max(cr.left, 0) - 1, fs: getComputedStyle(e).fontSize }; });
    if (!r.ok || errs.length) bad.push(`${w} ${lang} ${score} ${JSON.stringify(r)} ${errs.join('|')}`); await p.close(); }
  console.log(bad.length ? 'RESFIT NG ' + bad.join(' / ') : 'RESFIT OK'); await b.close(); })();
