/* ================= monthly ranking (shared through the page's database) =================
   ranks/<viewer id> = { m202610: best score this month, m202610c: character, m202610d: day reached, all: best ever, nick } */
const RANK_PAGE = (window.HAYDASH_APP ? './' : 'https://renjill-hay-dash.pages.dev/') + 'ranking.html';
const RANK = { db: null, user: null, uid: null, ready: false, last: null };
function monthKey(d) { const j = new Date((d || new Date()).getTime() + 9 * 3600e3); return 'm' + j.getUTCFullYear() + String(j.getUTCMonth() + 1).padStart(2, '0'); }
function monthLabel(k) { const y = k.slice(1, 5), m = +k.slice(5); return LANG === 'ja' ? `${y}年${m}月` : new Date(+y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }); }
async function rankInit() {
  const cfg = (window.HAYDASH_CONFIG || {}).firebase;
  if (cfg && cfg.apiKey && cfg.projectId && !(window.claude && window.claude.use)) { // the app build: our own Firebase project
    try { RANK.db = fsdbMake(cfg); RANK.uid = await RANK.db.uid(); RANK.own = 1; } catch (e) { RANK.db = null; RANK.uid = null; }
    RANK.ready = true; return;
  }
  try {
    if (!window.claude || !window.claude.use) { RANK.ready = true; return; }
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    RANK.db = db; RANK.user = user;
    if (user) RANK.uid = await user.id();
  } catch (e) { RANK.db = null; }
  RANK.ready = true;
}
const rankOn = () => !!(RANK.db && RANK.uid);
async function rankSubmit(score, info) {
  if (!rankOn()) return null;
  // a score far beyond what the distance run can earn is not posted (simple guard; the game runs in the browser)
  const cap = ((info.dist || 0) * 45 + 25000 + (info.day || 1) * 15000) * Math.max(1, SV.mlevel || 1) * 1.5;
  if (!(score >= 0) || score > cap) return { err: 2, best: score };
  const ref = RANK.db.doc('ranks/' + RANK.uid), mk = monthKey();
  let cur = {};
  try { const sn = await ref.get(); if (sn.exists) cur = Object.assign({}, sn.data()); } catch (e) { }
  let changed = false; const sc = Math.floor(score);
  if (!(cur[mk] >= sc)) { cur[mk] = sc; cur[mk + 'c'] = info.char; cur[mk + 'd'] = info.day; changed = true; }
  if (!(cur.all >= sc)) { cur.all = sc; cur.allc = info.char; changed = true; }
  if (SV.nick && !nameBad(SV.nick) && cur.nick !== SV.nick) { cur.nick = SV.nick; changed = true; }
  { const j = new Date(Date.now() + 9 * 3600e3), day = +j.toISOString().slice(0, 10).replace(/-/g, ''); if (cur.last !== day) { cur.last = day; changed = true; } cur.runs = Math.min(1e6, (cur.runs | 0) + 1); changed = true; } // when this player last played (Japan date) and how many runs: the automation reads daily/weekly active players from these
  if (changed) { try { await ref.set(cur); } catch (e) { return { err: 1, best: cur[mk] } } }
  return { best: cur[mk] };
}
async function rankTop(field, n) {
  const sn = await RANK.db.collection('ranks').where(field, '>', 0).orderBy(field, 'desc').limit(n).get();
  return sn.docs.map(d => Object.assign({ id: d.id }, d.data()));
}
async function rankPos(field, score) { const c = RANK.db.collection('ranks').where(field, '>', score); if (c.count) return (await c.count()) + 1; const sn = await c.limit(1000).get(); return sn.size + 1; }
// names on the board: only the nickname a player chose; never the account name
function anonName(id) { let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return (LANG === 'ja' ? 'うさぎ' : 'Bunny') + '#' + String(h % 10000).padStart(4, '0'); }
async function rankNames(rows) {
  return id => { const r = rows.find(x => x.id === id); const n = r && typeof r.nick === 'string' ? cleanName(r.nick) : ''; return n && !nameBad(n) ? n : anonName(id); };
}
// the list itself; names go in with textContent
function rankList(el, rows, field, nameOf) {
  el.textContent = '';
  if (!rows.length) { const p = document.createElement('p'); p.className = 'note'; p.textContent = LANG === 'ja' ? 'まだ記録がありません。最初の1位になろう。' : 'No scores yet. Be the first.'; el.appendChild(p); return; }
  rows.forEach((r, i) => {
    const li = document.createElement('div'); li.className = 'rk' + (r.id === RANK.uid ? ' me' : '') + (i < 3 ? ' top' + (i + 1) : '');
    const n = document.createElement('b'); n.textContent = i + 1;
    const im = document.createElement('img'); im.alt = ''; im.src = (r[field + 'c'] || r.allc) === 'jill' ? RANK_ICON.jill : (r[field + 'c'] || r.allc) === 'pom' ? RANK_ICON.pom : RANK_ICON.ren;
    const nm = document.createElement('span'); nm.textContent = nameOf(r.id) + (r.id === RANK.uid ? (LANG === 'ja' ? '（あなた）' : ' (you)') : '');
    const sc = document.createElement('em'); sc.textContent = fmt(r[field]);
    li.append(n, im, nm, sc); el.appendChild(li);
  });
}
const RANK_ICON = {};
function rankIcons() { for (const w of ['ren', 'jill', 'pom']) { const c = mk(64), g = c.getContext('2d'); if (w === 'pom') g.drawImage(bunFrame(w, 'front_open'), 70, 70 + BTOP, 160, 160, 0, 0, 64, 64); else g.drawImage(bunFrame(w, 'front_open'), 40, 10 + BTOP, 220, 220, 0, 0, 64, 64); try { RANK_ICON[w] = c.toDataURL(); } catch (e) { RANK_ICON[w] = ''; } } }
// after a run: submit, then show this month's position and the top five
async function rankAfterRun(score) {
  const box = $('#resRank'); if (!box) return;
  const head = box.querySelector('.rk-h'), list = box.querySelector('.rk-list');
  head.textContent = (LANG === 'ja' ? '月間ランキング ' : 'Monthly ranking · ') + monthLabel(monthKey());
  { const nb = box.querySelector('.rk-name'), tg = $('#resNameToggle'); if (tg) { tg.hidden = !!SV.nick; tg.textContent = t('resNameT'); tg.onclick = () => { nb.hidden = !nb.hidden; }; } if (nb) { nb.hidden = true; if (!SV.nick) { const i = nb.querySelector('input'); i.value = ''; i.placeholder = t('namePh'); nb.querySelector('label').textContent = t('resName'); nb.querySelector('button').textContent = t('nameOk'); } } }
  if (!RANK.ready) await new Promise(r => setTimeout(r, 1500));
  const me0 = box.querySelector('.rk-me');
  if (!rankOn()) { me0.textContent = window.HAYDASH_APP ? (LANG === 'ja' ? 'ランキングに接続できませんでした' : 'Could not reach the ranking') : LANG === 'ja' ? 'ランキングはサインインして遊ぶと参加できます' : 'Sign in to join the monthly ranking'; return; }
  me0.textContent = LANG === 'ja' ? 'ランキング 読み込み中…' : 'Ranking: loading…';
  try {
    const res = await rankSubmit(score, { char: G.char, day: G.day, dist: G.dist });
    const mkey = monthKey(), best = res ? res.best : score;
    const [pos, top] = await Promise.all([rankPos(mkey, best), rankTop(mkey, 3)]);
    const nameOf = await rankNames(top);
    const me = box.querySelector('.rk-me'); me.innerHTML = LANG === 'ja' ? `あなたは <b>${pos}位</b><small>ベスト ${fmt(best)}</small>` : `You're <b>#${pos}</b><small>best ${fmt(best)}</small>`;
    if (res && res.err) me.textContent += LANG === 'ja' ? '　※記録は保存できない設定です' : ' · score not saved';
    rankList(list, top, mkey, nameOf);
  } catch (e) { me0.textContent = LANG === 'ja' ? 'ランキングを読み込めませんでした' : 'Could not load the ranking'; }
}
async function openRanking(tab) {
  SFX.ui(); tab = tab || 'month';
  const mkey = monthKey(), field = tab === 'all' ? 'all' : mkey;
  openPanel('RANKING', LANG === 'ja' ? 'ランキング' : 'Ranking', `<div class="tabs"><button class="buy${tab === 'month' ? '' : ' off'}" data-rt="month">${esc(monthLabel(mkey))}</button><button class="buy${tab === 'all' ? '' : ' off'}" data-rt="all">${LANG === 'ja' ? '歴代' : 'All time'}</button></div>
    <div class="nick"><label for="nickIn">${LANG === 'ja' ? 'ランキングでの名前' : 'Your name on the ranking'}</label><input id="nickIn" maxlength="12" autocomplete="off"><button class="buy" id="nickSave">${LANG === 'ja' ? '保存' : 'Save'}</button></div>
    <p class="note" style="margin:4px 0 8px"><a class="notelink" href="${RANK_PAGE}" target="_blank" rel="noopener">${LANG === 'ja' ? 'みんなのランキングのページを開く（だれでも見られます）' : 'Open the public ranking page (anyone can view)'}</a></p>
    <div class="rk-list" id="rkFull"><p class="note">${LANG === 'ja' ? '読み込み中…' : 'Loading…'}</p></div><p class="note">${LANG === 'ja' ? '毎月1日（日本時間）に月間ランキングが新しくなります。名前を決めないときは「うさぎ#番号」の匿名で表示されます。' : 'The monthly board starts fresh on the 1st (Japan time). Without a name you appear as an anonymous bunny.'}</p>`);
  $('#nickIn').value = SV.nick || '';
  const el = $('#rkFull');
  if (!RANK.ready) await new Promise(r => setTimeout(r, 1500));
  if (!rankOn()) { el.textContent = ''; const p = document.createElement('p'); p.className = 'note'; p.textContent = RANK.own === undefined && window.HAYDASH_APP ? (LANG === 'ja' ? 'ランキングは準備中です。' : 'The ranking is coming soon.') : LANG === 'ja' ? 'ランキングは公開ページで、サインインして遊んだ人の間で共有されます。' : 'Sign in on the shared page to join the monthly ranking.'; el.appendChild(p); return; }
  try { const rows = await rankTop(field, 50); rankList(el, rows, field, await rankNames(rows)); }
  catch (e) { el.textContent = LANG === 'ja' ? 'ランキングを読み込めませんでした。' : 'Could not load the ranking.'; }
}
// one place that changes the name: saved locally and on the board
async function setNick(v) {
  SV.nick = v; save(); if (typeof refreshNameBtn === 'function') refreshNameBtn();
  if (rankOn()) { try { const ref = RANK.db.doc('ranks/' + RANK.uid); const sn = await ref.get(); if (sn.exists) await ref.update({ nick: v }); } catch (e) { } }
}
async function saveNick() {
  const v = cleanName($('#nickIn').value); if (v && nameBad(v)) { $('#nickIn').value = ''; $('#nickIn').placeholder = t('nameNG'); return; }
  await setNick(v); SV.nickAsked = 1; save();
  $('#nickSave').textContent = LANG === 'ja' ? '保存しました' : 'Saved';
}
// a run that is closed or left mid-way still counts: post the score so far when the page is hidden
let RANK_LEFT = 0;
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'hidden' || G.mode !== 'play' || !rankOn() || G.score < 100 || RANK_LEFT === G.runId) return;
  RANK_LEFT = G.runId; rankSubmit(G.score, { char: G.char, day: G.day, dist: G.dist }).catch(() => { });
});
