/* ================= the app's own ranking store (Firebase Firestore over REST, no SDK) =================
   Used only outside claude.ai, when config.js holds a Firebase project. It offers the same small interface the
   ranking code already uses: doc(path).get/set/update and collection().where().orderBy().limit().get(), plus count(). */
function fsdbMake(cfg) {
  const KEY = cfg.apiKey, PID = cfg.projectId, BASE = `https://firestore.googleapis.com/v1/projects/${PID}/databases/(default)/documents`;
  const AUTH = { id: null, exp: 0, uid: null, refresh: null };
  try { const a = JSON.parse(localStorage.getItem('hd_fsauth') || 'null'); if (a) { AUTH.refresh = a.r; AUTH.uid = a.u; } } catch (e) { }
  const keep = () => { try { localStorage.setItem('hd_fsauth', JSON.stringify({ r: AUTH.refresh, u: AUTH.uid })); } catch (e) { } };
  async function token() { // an anonymous Firebase account per device, refreshed when its token runs out
    if (AUTH.id && Date.now() < AUTH.exp - 60e3) return AUTH.id;
    if (AUTH.refresh) {
      const r = await fetch(`https://securetoken.googleapis.com/v1/token?key=${KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(AUTH.refresh) });
      if (r.ok) { const j = await r.json(); AUTH.id = j.id_token; AUTH.refresh = j.refresh_token; AUTH.uid = j.user_id; AUTH.exp = Date.now() + (+j.expires_in || 3600) * 1000; keep(); return AUTH.id; }
    }
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) });
    if (!r.ok) throw new Error('auth ' + r.status);
    const j = await r.json(); AUTH.id = j.idToken; AUTH.refresh = j.refreshToken; AUTH.uid = j.localId; AUTH.exp = Date.now() + (+j.expiresIn || 3600) * 1000; keep(); return AUTH.id;
  }
  const enc = v => typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }) : typeof v === 'boolean' ? { booleanValue: v } : v == null ? { nullValue: null } : { stringValue: String(v) };
  const dec = f => 'integerValue' in f ? +f.integerValue : 'doubleValue' in f ? +f.doubleValue : 'booleanValue' in f ? f.booleanValue : 'stringValue' in f ? f.stringValue : null;
  const fieldsOf = o => { const f = {}; for (const k in o) f[k] = enc(o[k]); return f; };
  const dataOf = d => { const o = {}; for (const k in (d.fields || {})) o[k] = dec(d.fields[k]); return o; };
  const idOf = name => name.split('/').pop();
  async function call(url, opt) { const t = await token(); const r = await fetch(url, Object.assign({}, opt, { headers: Object.assign({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, (opt || {}).headers || {}) })); return r; }
  function doc(path) {
    const url = BASE + '/' + path;
    return {
      async get() { const r = await call(url); if (r.status === 404) return { exists: false, data: () => ({}) }; if (!r.ok) throw new Error('get ' + r.status); const d = await r.json(); return { exists: true, data: () => dataOf(d) }; },
      async set(o) { const r = await call(url, { method: 'PATCH', body: JSON.stringify({ fields: fieldsOf(o) }) }); if (!r.ok) throw new Error('set ' + r.status); },
      async update(o) { const q = Object.keys(o).map(k => 'updateMask.fieldPaths=' + encodeURIComponent(k)).join('&'); const r = await call(url + '?' + q + '&currentDocument.exists=true', { method: 'PATCH', body: JSON.stringify({ fields: fieldsOf(o) }) }); if (!r.ok) throw new Error('update ' + r.status); },
    };
  }
  function collection(name) {
    const q = { from: [{ collectionId: name }] };
    const api = {
      where(f, op, v) { q.where = { fieldFilter: { field: { fieldPath: f }, op: op === '>' ? 'GREATER_THAN' : op === '>=' ? 'GREATER_THAN_OR_EQUAL' : 'EQUAL', value: enc(v) } }; return api; },
      orderBy(f, dir) { q.orderBy = [{ field: { fieldPath: f }, direction: dir === 'desc' ? 'DESCENDING' : 'ASCENDING' }]; return api; },
      limit(n) { q.limit = n; return api; },
      async get() { const r = await call(BASE + ':runQuery', { method: 'POST', body: JSON.stringify({ structuredQuery: q }) }); if (!r.ok) throw new Error('query ' + r.status); const rows = (await r.json()).filter(x => x.document);
        const docs = rows.map(x => ({ id: idOf(x.document.name), data: () => dataOf(x.document) })); return { docs, size: docs.length }; },
      async count() { const sq = Object.assign({}, q); delete sq.limit; delete sq.orderBy; const r = await call(BASE + ':runAggregationQuery', { method: 'POST', body: JSON.stringify({ structuredAggregationQuery: { structuredQuery: sq, aggregations: [{ alias: 'n', count: {} }] } }) });
        if (!r.ok) throw new Error('count ' + r.status); const j = await r.json(); const a = j[0] && j[0].result && j[0].result.aggregateFields && j[0].result.aggregateFields.n; return a ? dec(a) : 0; },
    };
    return api;
  }
  return { doc, collection, async uid() { await token(); return AUTH.uid; } };
}
