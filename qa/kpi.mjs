// 遊んだ人の数を数える（アプリ版のランキングの記録＝1回以上遊んだ端末の数）。結果を kpi.json に書く。
// Firebase の匿名ログイン → Firestore の集計（count）。秘密の値は使わない（apiKey は公開前提の値。app/config.js から読む）。
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const conf = readFileSync(path.join(ROOT, 'app/config.js'), 'utf8');
const apiKey = (/apiKey:\s*'([^']+)'/.exec(conf) || [])[1], projectId = (/projectId:\s*'([^']+)'/.exec(conf) || [])[1];
if (!apiKey || !projectId) { console.log('KPI_SKIP no firebase config'); process.exit(0); }
const j = async (url, body, tok) => { const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(tok ? { authorization: 'Bearer ' + tok } : {}) }, body: JSON.stringify(body) }); if (!r.ok) throw new Error(url.split('?')[0] + ' ' + r.status + ' ' + (await r.text()).slice(0, 200)); return r.json(); };
const auth = await j(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, { returnSecureToken: true });
const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runAggregationQuery`;
const count = async where => { const q = { structuredAggregationQuery: { structuredQuery: Object.assign({ from: [{ collectionId: 'ranks' }] }, where ? { where } : {}), aggregations: [{ alias: 'n', count: {} }] } }; const r = await j(base, q, auth.idToken); return +((((r[0] || {}).result || {}).aggregateFields || {}).n || {}).integerValue || 0; };
const d = new Date(Date.now() + 9 * 3600e3), month = 'm' + d.toISOString().slice(0, 4) + d.toISOString().slice(5, 7);
const total = await count(null);
const thisMonth = await count({ fieldFilter: { field: { fieldPath: month }, op: 'GREATER_THAN', value: { integerValue: '0' } } });
const ymd = ms => +new Date(ms + 9 * 3600e3).toISOString().slice(0, 10).replace(/-/g, '');
const since = days => count({ fieldFilter: { field: { fieldPath: 'last' }, op: 'GREATER_THAN_OR_EQUAL', value: { integerValue: String(ymd(Date.now() - days * 864e5)) } } });
const dau = await since(1), wau = await since(7);
// where players came from: the ?ref= word on the shared link they opened (src on the ranking row; players without one opened the game directly)
const SRCS = ['x', 'line', 'fb', 'ig', 'th', 'copy', 'share', 'site', 'yt', 'tt', 'guide', 'rank', 'qr', 'itch', 'gamejolt', 'newgrounds', 'freem', 'plicy', 'portal', 'indiedb', 'crazygames', 'gamenora', 'addicting'], from = {};
for (const s of SRCS) { try { const n = await count({ fieldFilter: { field: { fieldPath: 'src' }, op: 'EQUAL', value: { stringValue: s } } }); if (n) from[s] = n; } catch (e) { } }
const out = { at: new Date().toISOString(), players_total: total, players_this_month: thisMonth, active_1d: dau, active_7d: wau, from, goal: 1000000 };
// keep a daily history (data/kpi.csv): the weekly automation reads the trend from it (growth slowing = players getting bored)
import('node:fs').then(fs => { const f = path.join(ROOT, 'data/kpi.csv'); fs.mkdirSync(path.dirname(f), { recursive: true }); if (!fs.existsSync(f)) fs.writeFileSync(f, 'date,players_total,players_this_month,active_1d,active_7d\n'); const d = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); const rows = fs.readFileSync(f, 'utf8').trim().split('\n'); if (!rows.some(r => r.startsWith(d + ','))) fs.appendFileSync(f, [d, total, thisMonth, dau, wau].join(',') + '\n'); });
writeFileSync(path.join(ROOT, 'kpi.json'), JSON.stringify(out, null, 1));
console.log('KPI', JSON.stringify(out));
