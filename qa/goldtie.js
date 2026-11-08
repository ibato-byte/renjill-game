// 金のネクタイ（B-43）：先月の月間ランキングで 3 位以内なら印が付く。4 位以下・先月の記録なしでは付かない。月に 1 回だけ調べる
const { chromium } = require('playwright'); const path = require('path');
const run = async (b, myScore) => {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(my => {
    const j = new Date(Date.now() + 9 * 3600e3); j.setUTCDate(1); j.setUTCMonth(j.getUTCMonth() - 1); const pk = 'm' + j.getUTCFullYear() + String(j.getUTCMonth() + 1).padStart(2, '0');
    const store = {}; [9000, 7000, 5000, 3000].forEach((v, i) => { store['ranks/u_' + i] = { [pk]: v }; }); if (my != null) store['ranks/u_me'] = { [pk]: my };
    const snap = (id, d) => ({ id, exists: !!d, data: () => d || {} });
    const q = (ob = null, lim = 1000) => ({ where: () => q(ob, lim), orderBy: (a, d) => q([a, d], lim), limit: n => q(ob, n), get: async () => { let docs = Object.entries(store).map(([k, v]) => ({ id: k.split('/')[1], v })); if (ob) docs.sort((x, y) => (y.v[ob[0]] || 0) - (x.v[ob[0]] || 0)); docs = docs.slice(0, lim); return { docs: docs.map(d => snap(d.id, d.v)), size: docs.length }; } });
    const db = { doc: path => ({ get: async () => snap(path.split('/')[1], store[path]), set: async d => { store[path] = d; }, update: async d => { store[path] = Object.assign(store[path] || {}, d); } }), collection: () => q() };
    window.claude = { use: async n => n === 'db' ? db : n === 'user' ? { id: async () => 'u_me', profiles: async () => ({}) } : null };
    localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9 }));
  }, myScore);
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => ({ gt: window.__hayDash.SV.goldTie || null, badge: !!document.querySelector('.career .cr-gold') }));
  await p.close(); return { r, errs };
};
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const top = await run(b, 8000), low = await run(b, 1000), none = await run(b, null);
  console.log(JSON.stringify({ top: top.r, low: low.r, none: none.r }));
  const ok = top.r.gt && top.r.gt.r === 2 && top.r.badge && !low.r.gt && !low.r.badge && !none.r.gt; const errs = [...top.errs, ...low.errs, ...none.errs];
  console.log(ok && !errs.length ? 'GOLDTIE OK' : 'GOLDTIE NG ' + errs.join(' | ')); await b.close();
})();
