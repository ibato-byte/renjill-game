// the PWA: install bits, offline play, and the Firebase ranking against an in-memory fake of the REST API
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'ja-JP', serviceWorkers: 'allow' });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_|fonts/.test(m.text())) errs.push(m.text()); });
  const out = {};
  // fake Firebase
  const DB = {}; let n = 0; const calls = [];
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
  // other players already on the board
  const mk = (() => { const j = new Date(Date.now() + 9 * 3600e3); return 'm' + j.getUTCFullYear() + String(j.getUTCMonth() + 1).padStart(2, '0'); })();
  DB.other1 = { [mk]: { integerValue: '9000' }, all: { integerValue: '9000' }, nick: { stringValue: 'ポム推し' } };
  DB.other2 = { [mk]: { integerValue: '50' }, all: { integerValue: '50' } };
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('http://127.0.0.1:8790/'); await p.waitForTimeout(1500);
  out.manifest = await p.evaluate(async () => { const m = await (await fetch(document.querySelector('link[rel=manifest]').href)).json(); return m.name + ' icons ' + m.icons.length; });
  out.icons = await p.evaluate(async () => { const r = []; for (const u of ['icon-192.png', 'icon-512.png', 'maskable-512.png', 'apple-touch-icon.png']) r.push((await fetch(u)).status); return r.join(','); });
  await p.waitForTimeout(1000); out.sw = await p.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return r && r.active ? 'active' : 'none'; });
  // play a short run and die
  await p.evaluate(() => { localStorage.setItem('x', '1'); }); await p.click('#btnStart'); await p.waitForTimeout(3000);
  await p.evaluate(() => { document.querySelector('#tutCue') && 0; }); await p.waitForTimeout(6000);
  out.mode = await p.evaluate(() => document.querySelector('#hud') && !document.querySelector('#hud').hidden ? 'play' : 'other');
  // stop the run by pausing and quitting isn't wired here, so let an obstacle end it naturally (no input)
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(1000); const vis = await p.evaluate(() => !document.querySelector('#sResult').hidden || !document.querySelector('#sRevive').hidden); if (vis) break; }
  await p.evaluate(() => { const r = document.querySelector('#btnRvNo'); if (r && !document.querySelector('#sRevive').hidden) r.click(); }); await p.waitForTimeout(3500);
  out.rankLine = await p.evaluate(() => document.querySelector('#resRank .rk-me').textContent + ' | ' + [...document.querySelectorAll('#resRank .rk')].map(e => e.textContent).join(' / '));
  out.share = await p.evaluate(() => document.querySelector('#shX').href.slice(0, 200));
  out.calls = calls.slice(0, 12).join(', '); out.dbMine = JSON.stringify(DB.uid1 || null);
  // offline: reload with the network cut, the game must still start
  await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(1500);
  out.offline = await p.evaluate(() => !!document.querySelector('#btnStart') && document.querySelector('#btnStart').textContent);
  await p.click('#btnStart'); await p.waitForTimeout(2500); out.offlinePlay = await p.evaluate(() => !document.querySelector('#hud').hidden);
  console.log(JSON.stringify(out, null, 1)); console.log(errs.slice(0, 5).join('\n') || 'no errors');
  await b.close();
})();
