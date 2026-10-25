const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, locale: 'ja-JP' });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => {
    const store = { 'ranks/u_a': { m202610: 50000, m202610c: 'jill', all: 90000, nick: 'ジル推し' }, 'ranks/u_b': { m202610: 1200, all: 1200 } };
    const mon = (() => { const j = new Date(Date.now() + 9 * 3600e3); return 'm' + j.getUTCFullYear() + String(j.getUTCMonth() + 1).padStart(2, '0'); })();
    if (mon !== 'm202610') { store['ranks/u_a'][mon] = 50000; store['ranks/u_b'][mon] = 1200; }
    const snap = (id, d) => ({ id, exists: !!d, data: () => d });
    const q = (f = [], ob = null, lim = 1000) => ({ where: (a, o, v) => q([...f, [a, o, v]], ob, lim), orderBy: (a, d) => q(f, [a, d], lim), limit: n => q(f, ob, n),
      get: async () => { let docs = Object.entries(store).filter(([k]) => k.startsWith('ranks/')).map(([k, v]) => ({ id: k.split('/')[1], v }));
        for (const [a, o, v] of f) docs = docs.filter(d => o === '>' ? d.v[a] > v : true); if (ob) docs.sort((x, y) => (y.v[ob[0]] || 0) - (x.v[ob[0]] || 0)); docs = docs.slice(0, lim);
        return { docs: docs.map(d => snap(d.id, d.v)), size: docs.length }; } });
    const db = { doc: path => ({ get: async () => snap(path.split('/')[1], store[path]), set: async d => { store[path] = JSON.parse(JSON.stringify(d)); }, update: async d => { Object.assign(store[path], d); } }), collection: () => q() };
    const user = { id: async () => 'u_me', profiles: async ids => Object.fromEntries(ids.map(i => [i, { id: i, name: i === 'u_b' ? 'Taro' : '' }])) };
    window.claude = { use: async n => n === 'db' ? db : n === 'user' ? user : null }; window.__store = store;
  });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(800);
  await p.evaluate(() => { window.__hayDash.SV.tutDone = 1; });
  await p.click('#btnStart'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const G = window.__hayDash.G; G.score = 23456; G.reviveN = 3; G.invT = 0; window.__die('obstacle'); });
  await p.waitForTimeout(2500);
  await p.click('#resNameToggle'); await p.fill('#resNameIn', 'うさ太郎'); await p.click('#resNameOk'); await p.waitForTimeout(1200);
  await p.screenshot({ path: 'shots/rank_result.png', fullPage: true });
  console.log(await p.evaluate(() => document.querySelector('#resRank').innerText.replace(/\n+/g, ' | ')));
  console.log('stored me:', await p.evaluate(() => JSON.stringify(window.__store['ranks/u_me'])));
  await p.click('#btnRank2'); await p.waitForTimeout(1500);
  await p.fill('#nickIn', 'レン課長'); await p.click('#nickSave'); await p.waitForTimeout(300);
  await p.click('[data-rt="all"]'); await p.waitForTimeout(800);
  await p.screenshot({ path: 'shots/rank_panel.png' });
  console.log(await p.evaluate(() => document.querySelector('#rkFull').innerText.replace(/\n+/g, ' | ')));
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
