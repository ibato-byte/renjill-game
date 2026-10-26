// アカウントが2つにならない：①「つなぐコード」でブラウザAの記録をブラウザBへ（ログインなし・8文字・15分）、②つなぐリンク（?link=）、
// ③LINE の中で開いたら「いつものブラウザで開く」、LINE で送るリンクは外のブラウザで開く。Firebase は偽物（2つのブラウザで共有）。
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = [], out = {}, DB = { ranks: {}, links: {} }; let n = 0;
  const mk = (() => { const j = new Date(Date.now() + 9 * 3600e3); return 'm' + j.getUTCFullYear() + String(j.getUTCMonth() + 1).padStart(2, '0'); })();
  const conf = `window.HAYDASH_CONFIG = { firebase: { apiKey: 'TESTKEY', projectId: 'demo' }, url: 'https://example.app/' };`;
  async function context(lang, ua) {
    const ctx = await b.newContext(Object.assign({ viewport: { width: 390, height: 844 }, locale: lang === 'ja' ? 'ja-JP' : 'en-US' }, ua ? { userAgent: ua } : {}));
    await ctx.route('**/config.js', r => r.fulfill({ contentType: 'text/javascript', body: conf }));
    await ctx.route('https://identitytoolkit.googleapis.com/**', r => { n++; r.fulfill({ contentType: 'application/json', body: JSON.stringify({ idToken: 'tok' + n, refreshToken: 'ref' + n, localId: 'uid' + n, expiresIn: '3600' }) }); });
    await ctx.route('https://securetoken.googleapis.com/**', r => { const ref = new URLSearchParams(r.request().postData()).get('refresh_token') || ''; const id = 'uid' + ref.replace(/\D/g, ''); r.fulfill({ contentType: 'application/json', body: JSON.stringify({ id_token: 'tok' + id, refresh_token: ref, user_id: id, expires_in: '3600' }) }); });
    await ctx.route('https://firestore.googleapis.com/**', async r => {
      const req = r.request(), url = new URL(req.url()), m = req.method(), p2 = url.pathname.split('/documents')[1];
      if (!/^Bearer tok/.test(req.headers().authorization || '')) return r.fulfill({ status: 401, body: '{}' });
      if (process.env.DBG) console.log('REQ', m, p2); const mm = /^\/(ranks|links)\/([^/]+)$/.exec(p2);
      if (mm) { const [, col, id] = mm, T = DB[col];
        if (m === 'GET') return T[id] ? r.fulfill({ contentType: 'application/json', body: JSON.stringify({ name: `x/${col}/` + id, fields: T[id] }) }) : r.fulfill({ status: 404, body: '{}' });
        if (m === 'DELETE') { delete T[id]; return r.fulfill({ contentType: 'application/json', body: '{}' }); }
        const body = JSON.parse(req.postData()); T[id] = body.fields; return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ name: `x/${col}/` + id, fields: T[id] }) }); }
      if (p2 === ':runQuery') return r.fulfill({ contentType: 'application/json', body: '[]' });
      r.fulfill({ status: 400, body: '{}' });
    });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(lang + ': ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    return { ctx, p };
  }
  for (const lang of ['ja', 'en']) {
    DB.ranks = {}; DB.links = {};
    // browser A: the one with the progress
    const A = await context(lang); n = 10;
    await A.ctx.addInitScript(l => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1'); localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ best: 8800, bank: 4321, tutDone: 1, nickAsked: 1, nick: 'つなぐテスト', runs: 40, lang: l, pid: 'pidA' })); localStorage.setItem('hd_fsauth', JSON.stringify({ r: 'ref1', u: 'uid1' })); }, lang);
    await A.p.goto('http://127.0.0.1:8790/'); await A.p.waitForTimeout(1500);
    await A.p.click('#btnSet'); await A.p.waitForTimeout(300);
    if (!(await A.p.$('#btnLinkMake'))) { errs.push(lang + ' no link section'); await A.ctx.close(); continue; }
    await A.p.evaluate(() => document.querySelector('#btnLinkMake').scrollIntoView()); await A.p.click('#btnLinkMake'); await A.p.waitForTimeout(800);
    const code = await A.p.evaluate(() => (document.querySelector('.linkcode') || {}).textContent || '');
    const linkUrl = await A.p.evaluate(() => document.querySelector('#linkOut').dataset.url);
    if (!/^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code) || !DB.links[code.replace('-', '')]) errs.push(lang + ' code not made ' + code);
    await A.p.screenshot({ path: (process.env.SHOTS || 'shots') + `/link_code_${lang}.png` });
    // browser B: a fresh browser (it got its own new account uid11 and played once)
    const B = await context(lang); await B.p.goto('http://127.0.0.1:8790/'); await B.p.waitForTimeout(1500);
    if (!(await B.p.$('#tFresh'))) errs.push(lang + ' fresh browser: no connect offer');
    if (await A.p.evaluate(() => !!document.querySelector('#tFresh'))) errs.push(lang + ' connect offer shown to a player with progress');
    await B.p.screenshot({ path: (process.env.SHOTS || 'shots') + `/link_fresh_${lang}.png` });
    const bUid = await B.p.evaluate(() => JSON.parse(localStorage.getItem('hd_fsauth') || '{}').u); DB.ranks[bUid] = { [mk]: { integerValue: '120' }, all: { integerValue: '120' } };
    await B.p.click('#btnSet'); await B.p.waitForTimeout(300); await B.p.evaluate(() => document.querySelector('#linkIn').scrollIntoView());
    // a wrong code first
    await B.p.fill('#linkIn', 'ZZZZ-ZZZZ'); await B.p.click('#btnLinkGo'); await B.p.waitForTimeout(500);
    if (!/見つかりません|not found/.test(await B.p.textContent('#linkMsg'))) errs.push(lang + ' wrong code message');
    await B.p.fill('#linkIn', ''); await B.p.type('#linkIn', code.toLowerCase()); if (process.env.DBG) console.log('VAL', await B.p.inputValue('#linkIn'), code, await B.p.evaluate(() => [document.querySelectorAll('#linkIn').length, document.querySelector('#linkIn').maxLength, document.querySelector('#sPanel').hidden])); await B.p.click('#btnLinkGo'); await B.p.waitForTimeout(700);
    const ask = await B.p.evaluate(() => ({ vis: !document.querySelector('#linkAsk').hidden, txt: document.querySelector('#linkAsk').textContent }));
    if (!ask.vis || !/8,800/.test(ask.txt)) { errs.push(lang + ' ask ' + JSON.stringify(ask) + ' msg=' + await B.p.textContent('#linkMsg') + ' links=' + JSON.stringify(Object.keys(DB.links))); console.log(errs.join(' | ')); process.exit(1); }
    await B.p.screenshot({ path: (process.env.SHOTS || 'shots') + `/link_ask_${lang}.png` });
    await B.p.click('#btnLinkYes'); await B.p.waitForTimeout(2600);
    const after = await B.p.evaluate(() => { const s = JSON.parse(localStorage.getItem('renjill-hay-dash-v1') || '{}'); return { best: s.best, bank: s.bank, nick: s.nick, pid: s.pid, auth: JSON.parse(localStorage.getItem('hd_fsauth') || '{}').u, tBest: document.querySelector('#tBest').textContent }; });
    out[lang] = { code, after, bRow: DB.ranks[bUid], links: Object.keys(DB.links).length };
    if (after.best !== 8800 || after.auth !== 'uid1' || after.pid !== 'pidA' || !/8,800/.test(after.tBest)) errs.push(lang + ' B not connected ' + JSON.stringify(after));
    if (Object.keys(DB.ranks[bUid] || {}).length) errs.push(lang + ' B old ranking row not removed');
    if (DB.links[code.replace('-', '')]) errs.push(lang + ' code not deleted after use');
    // the same code cannot be used twice
    const C = await context(lang); await C.p.goto('http://127.0.0.1:8790/'); await C.p.waitForTimeout(1300); await C.p.click('#btnSet'); await C.p.waitForTimeout(300);
    await C.p.fill('#linkIn', code); await C.p.click('#btnLinkGo'); await C.p.waitForTimeout(500);
    if (!/見つかりません|not found/.test(await C.p.textContent('#linkMsg'))) errs.push(lang + ' used code accepted again');
    // the connect link: a new code from A, opened in a fresh browser D
    await A.p.click('#btnLinkMake'); await A.p.waitForTimeout(800); const url2 = await A.p.evaluate(() => document.querySelector('#linkOut').dataset.url);
    const D = await context(lang); await D.p.goto('http://127.0.0.1:8790/?link=' + url2.split('link=')[1]); await D.p.waitForTimeout(2200);
    const dAsk = await D.p.evaluate(() => ({ panel: !document.querySelector('#sPanel').hidden, ask: !!document.querySelector('#linkAsk:not([hidden])'), url: location.search }));
    if (!dAsk.panel || !dAsk.ask || dAsk.url) errs.push(lang + ' connect link ' + JSON.stringify(dAsk));
    for (const X of [A, B, C, D]) await X.ctx.close();
    // LINE's in-app browser: a card with "open in my browser" (?openExternalBrowser=1); other in-app browsers: how-to
    const L = await context(lang, 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari Line/13.20.0'); await L.p.goto('http://127.0.0.1:8790/?beat=500&c=ren'); await L.p.waitForTimeout(1300);
    const li = await L.p.evaluate(() => ({ card: !!document.querySelector('#tInApp'), href: (document.querySelector('#inAppGo') || {}).href || '', over: (() => { const e = document.querySelector('#tInApp'); return e ? e.scrollWidth > e.clientWidth + 1 : false; })() }));
    if (!li.card || !/openExternalBrowser=1/.test(li.href) || li.over) errs.push(lang + ' LINE card ' + JSON.stringify(li));
    await L.p.screenshot({ path: (process.env.SHOTS || 'shots') + `/link_line_${lang}.png` }); await L.ctx.close();
    for (const [ua, want] of [['Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36 Instagram 330.0.0', /^intent:\/\/127\.0\.0\.1:8790\/#Intent;scheme=https;package=com\.android\.chrome;end$/],
      ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/450.0]', /^x-safari-http:\/\/127\.0\.0\.1:8790\/$/]]) {
      const X = await context(lang, ua); await X.p.goto('http://127.0.0.1:8790/'); await X.p.waitForTimeout(1200);
      const h = await X.p.evaluate(() => (document.querySelector('#inAppGo') || {}).getAttribute ? document.querySelector('#inAppGo').getAttribute('href') : ''); if (!want.test(h || '')) errs.push(lang + ' in-app way out ' + h);
      await X.ctx.close(); }
    const N = await context(lang); await N.p.goto('http://127.0.0.1:8790/'); await N.p.waitForTimeout(1000);
    if (await N.p.$('#tInApp')) errs.push(lang + ' in-app card in a normal browser'); await N.ctx.close();
  }
  console.log(JSON.stringify(out)); console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'LINK OK no errors'); await b.close();
})();
