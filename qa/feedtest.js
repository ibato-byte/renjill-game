const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  for (const loc of ['ja-JP', 'en-US']) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, locale: loc }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.route('https://hay-dash.coana.co.jp/feed.json*', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: require('fs').readFileSync(require('path').resolve(__dirname, '../app') + '/feed.json', 'utf8') }));
  await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1800);
  const card = await p.evaluate(() => { const e = document.getElementById('tFeed'); return e && !e.hidden ? e.textContent + ' -> ' + e.href : 'none'; });
  const bank0 = await p.evaluate(() => window.__hayDash.SV.bank);
  await p.evaluate(() => document.getElementById('btnSet').click()); await p.waitForTimeout(400);
  const tryCode = async w => { await p.fill('#codeIn', w); await p.click('#btnCode'); await p.waitForTimeout(400); return p.evaluate(() => document.getElementById('codeMsg').textContent); };
  const r1 = await tryCode('nope'), r2 = await tryCode(' halloween '), r3 = await tryCode('HALLOWEEN');
  const bank1 = await p.evaluate(() => window.__hayDash.SV.bank);
  await p.screenshot({ path: `${process.env.SHOTS || '/tmp/rj-shots'}/feed_${loc}.png` });
  await p.reload(); await p.waitForTimeout(1200); const bank2 = await p.evaluate(() => window.__hayDash.SV.bank), used = await p.evaluate(() => JSON.stringify(window.__hayDash.SV.codes));
  console.log(loc, '| card:', card, '| wrong:', r1, '| ok:', r2, '| again:', r3, '| bank', bank0, '->', bank1, 'after reload', bank2, used, '| errors', errs.slice(0, 2));
  await p.close(); }
  await b.close(); })();
