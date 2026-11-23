// ランキングの保存先を作り直した時の引き取り（2026-11-24）：前の保存先で作った端末の番号（印 p が無い・cfg.prevProjectId の物）は
// 新しい保存先では使えないので、新しい番号を作り、写してあった前の行（imp:1）を自分の行に合わせてから消す。1台につき1回だけ。
// ①前の行のスコア・名前が自分の新しい行に入る ②前の行は消える（同じ人が2行にならない） ③新しい番号に印 p が付く ④開き直しても2回目は走らない
// ⑤前の保存先の設定（prevProjectId）が無い時は、印の無い番号もそのまま使う（今までどおり）
const { chromium } = require('playwright');
const APP = process.env.APP || 'http://127.0.0.1:8790/';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = []; let n = 0;
  async function run(lang, withPrev) {
    const DB = { ranks: {}, links: {} }, calls = [];
    DB.ranks.uidOLD = { all: { integerValue: '5000' }, allc: { stringValue: 'ren' }, nick: { stringValue: 'まえのなまえ' }, runs: { integerValue: '7' }, imp: { integerValue: '1' } };
    const conf = `window.HAYDASH_CONFIG = { firebase: { apiKey: 'TESTKEY', projectId: 'demo'${withPrev ? ", prevProjectId: 'old'" : ''} }, url: 'https://example.app/' };`;
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: lang === 'ja' ? 'ja-JP' : 'en-US' });
    await ctx.route('**/config.js', r => r.fulfill({ contentType: 'text/javascript', body: conf }));
    await ctx.route('https://identitytoolkit.googleapis.com/**', r => { n++; calls.push('signUp'); r.fulfill({ contentType: 'application/json', body: JSON.stringify({ idToken: 'tokNEW' + n, refreshToken: 'refNEW' + n, localId: 'uidNEW' + n, expiresIn: '3600' }) }); });
    await ctx.route('https://securetoken.googleapis.com/**', r => { const ref = new URLSearchParams(r.request().postData()).get('refresh_token') || ''; calls.push('refresh:' + ref); const id = ref === 'refOLD' ? 'uidOLD' : 'uidNEW' + ref.replace(/\D/g, ''); r.fulfill({ contentType: 'application/json', body: JSON.stringify({ id_token: 'tok' + id, refresh_token: ref, user_id: id, expires_in: '3600' }) }); });
    await ctx.route('https://firestore.googleapis.com/**', async r => {
      const req = r.request(), url = new URL(req.url()), m = req.method(), p2 = url.pathname.split('/documents')[1];
      if (!/^Bearer tok/.test(req.headers().authorization || '')) return r.fulfill({ status: 401, body: '{}' });
      const mm = /^\/(ranks|links)\/([^/]+)$/.exec(p2);
      if (mm) { const [, col, id] = mm, T = DB[col]; calls.push(m + ' ' + col + '/' + id);
        if (m === 'GET') return T[id] ? r.fulfill({ contentType: 'application/json', body: JSON.stringify({ name: `x/${col}/` + id, fields: T[id] }) }) : r.fulfill({ status: 404, body: '{}' });
        if (m === 'DELETE') { delete T[id]; return r.fulfill({ contentType: 'application/json', body: '{}' }); }
        const body = JSON.parse(req.postData()); T[id] = body.fields; return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ name: `x/${col}/` + id, fields: T[id] }) }); }
      if (/:run(Aggregation)?Query$/.test(p2)) return r.fulfill({ contentType: 'application/json', body: '[]' });
      r.fulfill({ status: 400, body: '{}' });
    });
    await ctx.addInitScript(l => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
      localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ best: 5000, bank: 100, tutDone: 1, nickAsked: 1, runs: 9, lang: l, nick: 'まえのなまえ' }));
      localStorage.setItem('hd_fsauth', JSON.stringify({ r: 'refOLD', u: 'uidOLD' })); }, lang);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(lang + ': ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto(APP); await p.waitForTimeout(3500);
    const st = await p.evaluate(() => ({ auth: JSON.parse(localStorage.getItem('hd_fsauth') || '{}'), prev: localStorage.getItem('hd_fsprev'), claim: localStorage.getItem('hd_fsclaim') }));
    const firstCalls = calls.length;
    await p.reload(); await p.waitForTimeout(2500);
    const again = calls.slice(firstCalls);
    await ctx.close();
    return { DB, st, calls, again };
  }
  for (const lang of ['ja', 'en']) {
    // 前の保存先の設定あり：引き取る
    const a = await run(lang, true), me = a.st.auth.u, row = me && a.DB.ranks[me];
    if (!me || me === 'uidOLD') errs.push(lang + ' a new number was not made ' + JSON.stringify(a.st));
    if (a.st.auth.p !== 'demo') errs.push(lang + ' the new number has no home mark ' + JSON.stringify(a.st.auth));
    if (!row) errs.push(lang + ' no row for the new number ' + JSON.stringify(Object.keys(a.DB.ranks)));
    else {
      if (+((row.all || {}).integerValue) < 5000) errs.push(lang + ' the old best did not come over ' + JSON.stringify(row));
      if (((row.nick || {}).stringValue) !== 'まえのなまえ') errs.push(lang + ' the old name did not come over ' + JSON.stringify(row));
      if (((row.prev || {}).stringValue) !== 'uidOLD') errs.push(lang + ' prev is not written ' + JSON.stringify(row));
      if (row.imp) errs.push(lang + ' the copy mark came along ' + JSON.stringify(row));
    }
    if (a.DB.ranks.uidOLD) errs.push(lang + ' the copied old row is still there (two rows for one player)');
    if (a.st.claim !== 'uidOLD') errs.push(lang + ' the takeover was not remembered ' + JSON.stringify(a.st));
    if (a.again.some(c => /uidOLD/.test(c))) errs.push(lang + ' the takeover ran again after reopening ' + JSON.stringify(a.again));
    // 前の保存先の設定なし：今までどおり（印の無い番号をそのまま使う）
    const c = await run(lang, false);
    if (c.st.auth.u !== 'uidOLD') errs.push(lang + ' without prevProjectId the existing number must be kept ' + JSON.stringify(c.st));
    if (c.calls.includes('signUp')) errs.push(lang + ' without prevProjectId no new number should be made');
    if (!c.DB.ranks.uidOLD) errs.push(lang + ' without prevProjectId the row must not be removed');
  }
  await b.close();
  if (errs.length) { console.log('FAIL ' + errs.join(' || ')); process.exit(1); }
  console.log('RANKMOVE OK no errors');
})();
