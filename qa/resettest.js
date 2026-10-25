// データのリセット：設定 → 確認 → すべて消えて、はじめから。ランキングの自分の記録も消える（アプリ版、Firebase は偽物）
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = [], out = {};
  for (const lang of ['ja', 'en']) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: lang === 'ja' ? 'ja-JP' : 'en-US' });
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  // fake Firebase
  const DB = {}; let n = 1; const calls = [];
  const conf = `window.HAYDASH_CONFIG = { firebase: { apiKey: 'TESTKEY', projectId: 'demo' }, url: 'https://example.app/' };`;
  await ctx.route('**/config.js', r => r.fulfill({ contentType: 'text/javascript', body: conf }));
  await ctx.route('https://identitytoolkit.googleapis.com/**', r => { calls.push('signUp'); n++; r.fulfill({ contentType: 'application/json', body: JSON.stringify({ idToken: 'tok' + n, refreshToken: 'ref' + n, localId: 'uid' + n, expiresIn: '3600' }) }); });
  await ctx.route('https://securetoken.googleapis.com/**', r => { calls.push('refresh'); r.fulfill({ contentType: 'application/json', body: JSON.stringify({ id_token: 'tokR', refresh_token: 'refR', user_id: 'uid1', expires_in: '3600' }) }); });
  await ctx.route('https://firestore.googleapis.com/**', async r => {
    const req = r.request(), url = new URL(req.url()), m = req.method(); calls.push(m + ' ' + url.pathname.split('/documents')[1]);
    if (!/^Bearer tok/.test(req.headers().authorization || '')) return r.fulfill({ status: 401, body: '{}' });
    const dec = f => 'integerValue' in f ? +f.integerValue : 'stringValue' in f ? f.stringValue : null;
    const p2 = url.pathname.split('/documents')[1];
    if (p2.startsWith('/ranks/')) { const id = p2.slice(7);
      if (m === 'GET') return DB[id] ? r.fulfill({ contentType: 'application/json', body: JSON.stringify({ name: 'x/ranks/' + id, fields: DB[id] }) }) : r.fulfill({ status: 404, body: '{}' });
      const body = JSON.parse(req.postData()); const mask = url.searchParams.getAll('updateMask.fieldPaths');
      if (mask.length) { if (!DB[id]) return r.fulfill({ status: 404, body: '{}' }); for (const k of mask) DB[id][k] = body.fields[k]; } else DB[id] = body.fields;
      return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ name: 'x/ranks/' + id, fields: DB[id] }) }); }
    if (p2 === ':runQuery' || p2 === ':runAggregationQuery') { const body = JSON.parse(req.postData()); const sq = body.structuredQuery || body.structuredAggregationQuery.structuredQuery;
      const f = sq.where.fieldFilter.field.fieldPath, v = dec(sq.where.fieldFilter.value);
      let rows = Object.entries(DB).filter(([id, d]) => d[f] && dec(d[f]) > v);
      if (p2 === ':runAggregationQuery') return r.fulfill({ contentType: 'application/json', body: JSON.stringify([{ result: { aggregateFields: { n: { integerValue: String(rows.length) } } } }]) });
      rows.sort((a, b) => dec(b[1][f]) - dec(a[1][f])); rows = rows.slice(0, sq.limit || 100);
      return r.fulfill({ contentType: 'application/json', body: JSON.stringify(rows.map(([id, d]) => ({ document: { name: 'projects/demo/databases/(default)/documents/ranks/' + id, fields: d } }))) }); }
    r.fulfill({ status: 400, body: '{}' });
  });
  const mk = (() => { const j = new Date(Date.now() + 9 * 3600e3); return 'm' + j.getUTCFullYear() + String(j.getUTCMonth() + 1).padStart(2, '0'); })();
  DB.uid1 = { [mk]: { integerValue: '7000' }, all: { integerValue: '7000' }, nick: { stringValue: 'リセット前' } };
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await ctx.addInitScript(l => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1'); localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ best: 7000, bank: 3210, tutDone: 1, nickAsked: 1, nick: 'リセット前', pomMet: 1, char: 'pom', runs: 30, lang: l, clovers: 5 })); localStorage.setItem('hd_fsauth', JSON.stringify({ r: 'ref1', u: 'uid1' })); localStorage.setItem('rjChal', JSON.stringify({ s: 99, c: 'ren', at: Date.now() })); }, lang);
  await p.goto('http://127.0.0.1:8790/'); await p.waitForTimeout(1500);
  const before = await p.evaluate(() => ({ best: document.querySelector('#tBest').textContent, bank: document.querySelector('#tBank').textContent }));
  if (!/7,000/.test(before.best)) errs.push(lang + ' setup ' + JSON.stringify(before));
  await p.click('#btnSet'); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('#btnReset').scrollIntoView()); await p.click('#btnReset'); await p.waitForTimeout(200);
  const ask = await p.evaluate(() => ({ ask: !document.querySelector('#resetAsk').hidden, txt: document.querySelector('#resetAsk').textContent, over: [...document.querySelectorAll('#pBody .m')].some(e => e.scrollWidth > e.clientWidth + 1) }));
  if (!ask.ask || ask.over) errs.push(lang + ' ask ' + JSON.stringify(ask));
  await p.screenshot({ path: (process.env.SHOTS || 'shots') + `/reset_ask_${lang}.png` });
  await p.click('#btnResetNo'); await p.waitForTimeout(200);
  if (!(await p.evaluate(() => document.querySelector('#resetAsk').hidden && JSON.parse(localStorage.getItem('renjill-hay-dash-v1')).best === 7000))) errs.push(lang + ' cancel did not keep data');
  await p.click('#btnReset'); await p.click('#btnResetYes'); await p.waitForTimeout(3000);
  const after = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('renjill-hay-dash-v1') || '{}'); return { best: s.best || 0, bank: s.bank || 0, tutDone: !!s.tutDone, pomMet: !!s.pomMet, nick: s.nick || '', chal: localStorage.getItem('rjChal'), auth: JSON.parse(localStorage.getItem('hd_fsauth') || '{}').u || '', tBest: document.querySelector('#tBest').textContent, pom: !!document.querySelector('#pickPom').offsetParent }; });
  out[lang] = { before, after, row: DB.uid1 };
  if (after.best || after.bank >= 3210 || after.tutDone || after.pomMet || after.nick || after.chal || after.auth === 'uid1' || after.pom) errs.push(lang + ' AFTER ' + JSON.stringify(after));
  if (Object.keys(DB.uid1 || {}).length) errs.push(lang + ' ranking row not cleared ' + JSON.stringify(DB.uid1));
  await ctx.close(); }
  console.log(JSON.stringify(out)); console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'RESET OK no errors'); await b.close();
})();
