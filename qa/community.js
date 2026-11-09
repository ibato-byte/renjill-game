// みんなの集計（B-45・46・47）：走ったあと自分の行に「今日の名所・行事のチモシー・クラブ」が入り、6 か月より前の月の記録は消える。
//  題名に「今日いちばん走られた場所」と行事の合計、ランキングの「クラブ」タブにクラブごとの合計。悪い名前のクラブは出さない
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => {
    const j = new Date(Date.now() + 9 * 3600e3), mk = 'm' + j.getUTCFullYear() + String(j.getUTCMonth() + 1).padStart(2, '0'), today = +j.toISOString().slice(0, 10).replace(/-/g, '');
    const store = window.__store = {
      'ranks/a': { [mk]: 9000, club: 'COANA', pd: today, pt: 'asakusa', e_xmas: 400000 }, 'ranks/b': { [mk]: 5000, club: 'coana', pd: today, pt: 'asakusa', e_xmas: 300000 },
      'ranks/c': { [mk]: 7000, club: 'ねこ部', pd: today, pt: 'ginza', e_xmas: 100000 }, 'ranks/d': { [mk]: 8000, club: 'http://spam', pd: 20200101, pt: 'ginza' },
      'ranks/u_me': { m202001: 100, m202001c: 'ren', m202001d: 1, [mk]: 100, e_halloween: 50 } };
    const snap = (id, d) => ({ id, exists: !!d, data: () => d || {} });
    const q = (ob = null, lim = 1000) => ({ where: () => q(ob, lim), orderBy: (a, d) => q([a, d], lim), limit: n => q(ob, n), get: async () => { let docs = Object.entries(store).map(([k, v]) => ({ id: k.split('/')[1], v })); if (ob) docs.sort((x, y) => (y.v[ob[0]] || 0) - (x.v[ob[0]] || 0)); docs = docs.slice(0, lim); return { docs: docs.map(d => snap(d.id, d.v)), size: docs.length }; } });
    const db = { doc: path => ({ get: async () => snap(path.split('/')[1], store[path]), set: async d => { store[path] = JSON.parse(JSON.stringify(d)); }, update: async d => { store[path] = Object.assign(store[path] || {}, d); } }), collection: () => q() };
    window.claude = { use: async n => n === 'db' ? db : n === 'user' ? { id: async () => 'u_me', profiles: async () => ({}) } : null };
    if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', 1); localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', club: 'COANA' })); localStorage.setItem('rjFeed', JSON.stringify({ updated: '2999-01-01', events: [{ id: 'xmas', from: '2000-01-01', to: '2999-12-31' }] })); }
  });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(2500);
  const r = {};
  r.title = await p.evaluate(() => { const e = document.getElementById('tComm'); return e && !e.hidden ? e.textContent : ''; });
  // a run: my row gets today's place, the event hay and the club; the old month is dropped
  r.row = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; D.ev('hideAll(); startRun()'); await new Promise(r => setTimeout(r, 300)); G.tidT = { ginza: 30, bedroom: 90 }; G.hay = 120; G.dist = 500;
    await D.ev("rankSubmit(3000, { char: 'ren', day: 1, dist: 500, hay: 120, place: topPlace() })"); return window.__store['ranks/u_me']; });
  r.clubs = await p.evaluate(async () => { const D = window.__hayDash; const list = await D.ev('clubTop(monthKey())'); return list.map(c => c.name + ':' + c.s + ':' + c.n); });
  r.tab = await p.evaluate(async () => { const D = window.__hayDash; D.ev("G.mode = 'title'"); await D.ev("openRanking('club')"); await new Promise(r => setTimeout(r, 300)); return document.getElementById('rkFull').textContent; });
  console.log(JSON.stringify(r));
  const row = r.row || {};
  const ok = /雷門（2人）/.test(r.title) && /800,000 \/ 1,000,000/.test(r.title) && row.pt === 'ginza' && row.pd > 20250000 && row.e_xmas === 120 && row.club === 'COANA' && !('m202001' in row) && !('m202001c' in row) && !('e_halloween' in row)
    && r.clubs[0] && /^COANA:/.test(r.clubs[0]) && r.clubs.every(c => !/spam/.test(c)) && /COANA/.test(r.tab) && /ねこ部/.test(r.tab);
  console.log(ok && !errs.length ? 'COMMUNITY OK' : 'COMMUNITY NG ' + errs.join(' | ')); await b.close();
})();
