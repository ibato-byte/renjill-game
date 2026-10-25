const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  for (const [loc, w] of [['ja-JP', 390], ['en-US', 1280]]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 }, locale: loc }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  let body = null;
  await p.route('https://firestore.googleapis.com/**', async r => { body = r.request().postDataJSON(); const f = body.structuredQuery.where.fieldFilter.field.fieldPath;
    const docs = [['a1', 9000, 'jill', 'ポム推し'], ['b2', 5200, 'ren', ''], ['c3', 1200, 'ren', '死ね'], ['d4', 300, 'jill', 'ジル課長補佐のすごい人']].map(([id, s, c, n]) => ({ document: { name: 'projects/x/databases/(default)/documents/ranks/' + id, fields: Object.assign({ [f]: { integerValue: String(s) }, [f + 'c']: { stringValue: c } }, n ? { nick: { stringValue: n } } : {}) } }));
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(docs) }); });
  await p.goto('http://127.0.0.1:8790/ranking.html'); await p.waitForTimeout(1200);
  const t = await p.evaluate(() => document.getElementById('list').innerText.replace(/\n/g, ' | '));
  await p.screenshot({ path: (process.env.SHOTS || '/tmp/rj-shots') + '/rankpage_' + loc + '.png' });
  await p.click('#tA'); await p.waitForTimeout(600); const field = body.structuredQuery.where.fieldFilter.field.fieldPath;
  console.log(loc, t, '| alltab field:', field, '| errors', errs); if (!/9,000/.test(t) || /死ね/.test(t) || field !== 'all' || errs.length) { console.log('FAIL rankpage'); process.exitCode = 1; } else console.log('no errors'); await p.close(); }
  await b.close(); })();
