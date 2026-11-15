// 試着室（2026-11-16）：購買部で着せかえの列を押すと、買う前でも鏡の中のキャラクターが着てみせる。
// 確かめること：①列を押すと鏡の絵が変わる ②チモシーも、着ている物（保存）も変わらない ③もう一度押すと元の絵に戻る ④「買う」ボタンは今までどおり買える ⑤起動時にエラーが出ない
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { if (!localStorage.getItem('renjill-hay-dash-v1')) localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 30, lang: 'ja', pomMet: 3, bank: 9000 })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1500);
  if (!(await p.evaluate(() => !!window.__hayDash))) { console.log('FITROOM NG\n起動していない ' + bad.join(' ')); process.exit(1); }
  await p.click('#btnShop'); await p.waitForTimeout(500);
  const st = () => p.evaluate(() => { const H = window.__hayDash, sec = document.querySelector('[data-fit="ren"]'); return { f: sec.querySelector('.fit-f').src.length + ':' + sec.querySelector('.fit-f').src.slice(-60), bank: H.ev('SV.bank'), wear: JSON.stringify(H.ev('SV.wear.ren')), own: !!H.ev('SV.closet.hat_beret_ren') }; });
  const a = await st(); await p.locator('[data-try="hat_beret_ren"] p').click(); await p.waitForTimeout(300); const c = await st();
  if (a.f === c.f) bad.push('① 列を押しても鏡の絵が変わらない'); if (a.bank !== c.bank || a.wear !== c.wear || c.own) bad.push('② 試着でチモシー・持ち物・着ている物が変わった');
  if (!(await p.locator('[data-try="hat_beret_ren"]').evaluate(e => e.classList.contains('trying')))) bad.push('① 試着中の印が付かない');
  await p.locator('[data-try="hat_beret_ren"] p').click(); await p.waitForTimeout(300); const d = await st(); if (d.f !== a.f) bad.push('③ もう一度押しても元に戻らない');
  await p.locator('[data-try="hat_beret_ren"] button').click(); await p.waitForTimeout(400); const e = await st(); if (!e.own || e.bank !== a.bank - 1200) bad.push(`④ 買えない（持っている=${e.own}・チモシー ${a.bank}→${e.bank}）`);
  await b.close(); if (bad.length) { console.log('FITROOM NG\n' + bad.join('\n')); process.exit(1); } console.log('FITROOM OK');
})();
