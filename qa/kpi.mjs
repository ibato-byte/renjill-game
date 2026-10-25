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
const out = { at: new Date().toISOString(), players_total: total, players_this_month: thisMonth, goal: 1000000 };
writeFileSync(path.join(ROOT, 'kpi.json'), JSON.stringify(out, null, 1));
console.log('KPI', JSON.stringify(out));
