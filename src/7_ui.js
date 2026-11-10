/* ================= screens ================= */
const SCREENS = ['sTitle', 'sPanel', 'sPause', 'sRevive', 'sResult', 'hud'];
function hideAll() { SCREENS.forEach(id => { $('#' + id).hidden = true; }); }
function show(id) { $('#' + id).hidden = false; }
function goTitle() { hideAll(); setupTitle(); show('sTitle'); refreshTitle(); }
function applyLang() {
  { const a = $('#tGuide'); if (a) { a.textContent = tr('遊び方・キャラクター紹介', 'How to play & characters'); a.href = window.HAYDASH_APP ? (tr('./guide.html', './guide-en.html')) : 'https://hay-dash.coana.co.jp/' + (tr('guide', 'guide-en')); if (window.HAYDASH_APP) a.removeAttribute('target'); } }
  { const a = $('#tSite'); if (a) { a.textContent = tr('REN & JILL 公式サイト', 'Ren & Jill official site'); a.href = SITE_REF; } } { const f = $('#tFollow'); if (f) f.innerHTML = followLinks(); } // タイトル画面の下の小さな文字：アニメの公式サイト（2026-10-31 オーナー指示）
  document.documentElement.lang = ({ zh: 'zh-Hant', ko: 'ko' })[LANG] || LANG; $('#cv').setAttribute('aria-label', tr('レンとジルのチモシーダッシュ', 'Ren & Jill: Hay Dash'));
  $('#tStory').innerHTML = t('story'); $('#tStory').hidden = false; const lr = $('#tLast'); if (SV.runs > 0 && SV.last) { lr.hidden = false; lr.textContent = t('lastRun', fmt(SV.last.score), L(SV.last.place)) + (SV.best ? (tr('　', ' · ')) + t('lastBest', fmt(SV.best)) : ''); } else lr.hidden = true; $('#tSub').textContent = tr('レンとジル　チモシーダッシュ', 'Two office bunnies, one mad dash across Tokyo');
  cardTxt('#tRenRole', t('renRole')); cardTxt('#tRenPerk', t('renPerk') + (SV.bond ? '・' + t('bondLbl', bondLv()) : '')); cardTxt('#tJillRole', t('jillRole')); cardTxt('#tJillPerk', t('jillPerk') + (SV.bond ? '・' + t('bondLbl', bondLv()) : '')); { const met = !!SV.pomMet; cardTxt('#tPomRole', t('pomRole')); cardTxt('#tPomPerk', t('pomPerk')); $('#pickPom').hidden = !met; $('#pickPom').parentNode.classList.toggle('three', met); } // the rookie stays a secret until you have met him on the road
  $('#tMis').textContent = t('missions'); $('#tSta').textContent = t('stamps'); $('#tBook').textContent = t('book'); $('#tShop').textContent = t('shop'); $('#tHow').textContent = t('how');
  $('#tBestL').textContent = t('best'); $('#sTitle .chars').setAttribute('aria-label', t('pickChar')); $('#sResult .shbtns').setAttribute('aria-label', tr('友だちに挑戦状を送ろう', 'Challenge a friend')); $('#sResult .shbtns').setAttribute('role', 'group'); $('#chatIn').setAttribute('aria-label', tr('ゲームについて質問してね', 'Ask about the game')); $('#btnRank').textContent = tr('ランキング', 'Ranking'); $('#btnRank2').textContent = tr('ランキングをもっと見る', 'See the full ranking');  { const lt = $('#btnLangTop'); if (lt) lt.setAttribute('aria-label', t('langLbl', LANG_NAME[LANG])); } $('#pauseBtn').setAttribute('aria-label', t('pauseLbl')); $('#btnSet').setAttribute('aria-label', t('settings')); $('#btnSet').title = t('settings'); for (const id of ['pClose', 'chatClose']) $('#' + id).setAttribute('aria-label', t('close')); $('#tPause').textContent = t('pause'); $('#btnQuit').textContent = t('quit');
  $('#btnRvNo').textContent = t('seeResult'); $('#btnMenu').textContent = t('menu'); { const m = $('#tResMore'); if (m) m.textContent = t('resMore'); } $('#tCopy').textContent = t('copy'); { const sb = $('#tShareBar'); if (sb) sb.textContent = tr('友だちに挑戦状を送ろう', 'Challenge a friend');} $('#tShare').textContent = t('share'); $('#tShareImg').textContent = t('shareImg');
  $('#tKick').textContent = tr('レンとジルの', 'REN & JILL'); $('#tLogo').innerHTML = tr('チモシー<br><em>ダッシュ！</em>', 'HAY<br><em>DASH!</em>'); $('#tSub').textContent = t('tagline'); document.title = t('gameTitle');
  $('#nmRen').textContent = tr('レン', 'REN'); $('#nmJill').textContent = tr('ジル', 'JILL'); $('#nmPom').textContent = tr('ポム', 'POM'); $('#btnStart').textContent = t('start'); $('#btnAgain').textContent = t('again'); $('#btnResume').textContent = t('resume'); $('#tPauseH').textContent = lab('PAUSE'); $('#tPause').hidden = $('#tPause').textContent === $('#tPauseH').textContent;
  $('#lbScore').textContent = tr('スコア', 'SCORE'); $('#lbTime').textContent = tr('時刻', 'TIME'); $('#lbHay').textContent = tr('チモシー', 'HAY'); $('#resBest').textContent = lab('NEW BEST!');
  $('#btnChat').textContent = $('#btnChat2').textContent = tr('ジルに聞く', 'Ask Jill');
  ['btnMute', 'btnMute2'].forEach(id => $('#' + id).textContent = SV.mute ? t('soundOff') : t('soundOn'));
}
// the character cards are narrow: put each part ("課長" / "ホーランドロップ") on its own line, never split a word
function cardTxt(sel, txt) { const el = $(sel); el.textContent = ''; String(txt).split(/\s*[・：:·]\s*/).forEach((p, i) => { if (i) el.appendChild(document.createElement('br')); const s = document.createElement('span'); s.textContent = p; el.appendChild(s); }); }
function refreshTitle() {
  { const lt = $('#tLangTop'); if (lt) lt.textContent = LANG_NAME[LANG]; const bt = $('#btnLangTop'); if (bt) bt.hidden = !$('#sPanel').hidden; }
  refreshNameBtn();
  { const lv = plantLv(); if (lv > (SV.plantLv || 0)) { SV.plantLv = lv; save(); setTimeout(() => toastTitle(t('plantUp')), 1600); } } // 観葉植物が育った（B-12）
  applyLang();
  $('#tBest').textContent = fmt(SV.best); $('#tBank').textContent = fmt(SV.bank); $('#tCareer').innerHTML = careerHTML(); feedCard(); chalCard();
  { const dly = dailyToday(), done = SV.dailyDone === dly.key; $('#tDaily').textContent = (tr('今日のチャレンジ：', 'Today: ')) + L(dly.c.t(dly.n)) + (done ? ' ✓' : (tr('（チモシー300本＋お守り）', ' (300 hay + charm)'))); }
  { let q = $('#btnQuick'); if (!q) { q = document.createElement('button'); q.id = 'btnQuick'; q.className = 'sub small quick'; q.onclick = () => { SFX.ui(); G.quickNext = 1; hideAll(); startRun(); }; $('#tDaily').after(q); } q.textContent = t('quick') + (SV.bestT ? '　' + tr('ベスト ', 'best ') + fmt(SV.bestT) : ''); q.hidden = !SV.tutDone; } // a short game for a short break (2026-11-08)
  try { commShow(); commFetch(); } catch (e) { } // みんなの集計（B-45・47）
  { let e = $('#tHunt'); if (!e) { e = document.createElement('div'); e.id = 'tHunt'; e.className = 'hunt'; $('#tDaily').after(e); } const h = SV.tutDone ? huntNow() : null; e.hidden = !h; // あいことばのかくれんぼ（B-49）
    if (h) { const ch = [...h.w], got = SV.hunt && SV.hunt.w === h.w ? SV.hunt.got : []; e.innerHTML = `<span>${esc(tr('あいことばのかくれんぼ', 'Secret word hunt'))}</span><b>${ch.map((c, i) => got.includes(i) ? esc(c) : '？').join(' ')}</b><small>${esc(t('kanaHint', got.length, ch.length))}${h.ep ? esc(tr('　ヒント：動画「' + h.ep + '」', '  Hint: the video "' + h.ep + '"')) : ''}</small>`; } }
  { let q = $('#btnRev'); if (!q) { q = document.createElement('button'); q.id = 'btnRev'; q.className = 'sub small quick'; q.onclick = () => { SFX.ui(); G.revNext = 1; hideAll(); startRun(); }; $('#btnQuick').after(q); } q.textContent = t('revBtn'); q.hidden = !SV.tutDone || !revDay(); } // 逆走デー（B-37）
  { const q = $('#btnDuo'); if (q) q.remove(); } // ふたりで交代（B-33）はやめた（2026-11-09 オーナーの判断）
  { let q = $('#btnPractice'); if (!q) { q = document.createElement('button'); q.id = 'btnPractice'; q.className = 'sub small quick'; q.onclick = openPractice; $('#btnQuick').after(q); } q.textContent = t('practice'); q.hidden = !SV.tutDone; } // 練習・場所えらび（B-31・B-38）
  { let e = $('#tDayGoal'); if (!e) { e = document.createElement('div'); e.id = 'tDayGoal'; $('#tDaily').after(e); } const n = SV.dayHay && SV.dayHay.d === todayStr() ? SV.dayHay.n : 0, k = Math.min(1, n / DAY_GOAL);
    e.className = 'daygoal' + (n >= DAY_GOAL ? ' done' : ''); e.innerHTML = `<span>${esc(tr('今日のチモシー', 'Hay today'))}</span><i><b style="width:${(k * 100).toFixed(0)}%"></b></i><em>${fmt(Math.min(n, DAY_GOAL))} / ${DAY_GOAL}${n >= DAY_GOAL ? ' ✓' : ''}</em>`; } // today's hay goal (2026-11-08)
  $('#pickRen').setAttribute('aria-pressed', G.char === 'ren'); $('#pickJill').setAttribute('aria-pressed', G.char === 'jill'); $('#pickPom').setAttribute('aria-pressed', G.char === 'pom');
  if (SV.pomMet && !SV.pomTold) { SV.pomTold = 1; save(); setTimeout(() => { if (G.mode === 'title') toastTitle(t('pomUnlock')); }, 600); }
  $('#dotZukan').hidden = Object.keys(SV.zukan).length <= (SV.seenZukan || 0);
  $('#dotStamps').hidden = Object.keys(SV.stamps).length + Object.keys(SV.album).length <= (SV.seenStamps || 0);
  $('#dotMissions').hidden = !(SV.missions && SV.missions.slots.some(s => s.done));
}
let PANEL_FROM = null;
function openPanel(title, sub, html) { if ($('#sPanel').hidden) { const a = document.activeElement; PANEL_FROM = a && a !== document.body && !a.closest('#sPanel') ? a : null; } if (LANG !== 'en' && sub) { title = esc(sub); sub = ''; } document.querySelectorAll('.toast').forEach(x => x.remove()); if (sub && sub.toUpperCase() === title) sub = ''; $('#pTitle').innerHTML = `${title}<small>${esc(sub)}</small>`; $('#pBody').innerHTML = html; $('#pBody').scrollTop = 0; show('sPanel'); { const lt = $('#btnLangTop'); if (lt) lt.hidden = true; } $('#pClose').focus(); } // 言語ボタンが閉じるボタンにかぶらないよう、パネル中はかくす
function closePanel() { $('#sPanel').hidden = true; { const lt = $('#btnLangTop'); if (lt) lt.hidden = false; } if (G.mode === 'title') refreshTitle(); const f = PANEL_FROM; PANEL_FROM = null; if (f && f.isConnected && !f.closest('[hidden]')) try { f.focus({ preventScroll: true }); } catch (e) { } }

function openMissions() { SFX.ui(); openPanel('MISSIONS', t('missions'), `<div class="lvl"><b>×${SV.mlevel}</b><span>${esc(t('missionNote'))}</span></div>${missionHTML()}${dailyHTML()}${weekHTML()}${calHTML()}${achHTML()}`); }
// the days you came to work: the last four weeks as a little calendar of stamps (2026-11-08)
function calHTML() { const days = new Set(SV.playDays || []), cells = []; const now = new Date(); const ds = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  const start = new Date(now); start.setDate(now.getDate() - 27 - ((now.getDay() + 6) % 7) + 6); // 4 rows of 7, ending this week
  for (let i = 0; i < 28; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const k = ds(d), fut = d > now; cells.push(`<i class="${days.has(k) ? 'on' : ''}${fut ? ' fut' : ''}${k === ds(now) ? ' today' : ''}" title="${d.getMonth() + 1}/${d.getDate()}">${d.getDate()}</i>`); }
  const n = [...days].filter(k => { const [y, m, dd] = k.split('-').map(Number); return (now - new Date(y, m - 1, dd)) / 864e5 < 28; }).length;
  return `<div class="m cal"><p><b>${esc(t('calH'))}</b> <span class="n">${esc(t('calN', n))}</span></p><div class="calg">${tr('月火水木金土日', 'MTWTFSS').split('').map(w => `<b>${w}</b>`).join('')}${cells.join('')}</div></div>`; }
function shopHTML() {
  const ups = Object.keys(POW).map(k => {
    const lv = SV.upg[k] || 0, cost = UPG_COST[lv], d = POW[k];
    return `<div class="shop-item"><img src="${SPR_URL[d.ico]}" alt=""><p>${esc(L(d))}<small>${t('durNow', (d.base + lv * 1.4).toFixed(1))}${lv < 5 ? ` → ${(d.base + (lv + 1) * 1.4).toFixed(1)}` : t('max')}</small><span class="pips">${[0, 1, 2, 3, 4].map(i => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</span></p>
      <button class="buy" data-up="${k}" ${lv >= 5 || SV.bank < cost ? 'disabled' : ''}>${lv >= 5 ? 'MAX' : `<img src="${SPR_URL.hay}" alt="">${fmt(cost)}`}</button></div>`;
  }).join('');
  const clover = `<div class="shop-item"><img src="${SPR_URL.clover}" alt=""><p>${t('charmName')}<small>${t('charmNote', SV.clovers)}</small></p><button class="buy" data-buy="clover" ${SV.bank < 500 ? 'disabled' : ''}><img src="${SPR_URL.hay}" alt="">500</button></div>`;
  const mug = `<div class="shop-item"><img src="${SPR_URL.mugIcon}" alt=""><p>${t('mugName')}<small>${t('mugNote')}</small></p>${SV.mug ? `<button class="buy" data-mug="1">${SV.mugOn ? t('unwear') : t('wear')}</button>` : `<button class="buy" data-buy="mug" ${SV.bank < 1500 ? 'disabled' : ''}><img src="${SPR_URL.hay}" alt="">1,500</button>`}</div>`;
  const wear = SV.wear || (SV.wear = { ren: { tie: 'gold', hat: '', suit: '' }, jill: { frame: 'brown', hat: '', suit: '' }, pom: { band: 'red', hat: '', suit: '' } }); if (!wear.pom) wear.pom = { band: 'red', hat: '', suit: '' }; SV.closet = SV.closet || {};
  const closet = ['ren', 'jill'].concat(SV.pomMet ? ['pom'] : []).map(who => `<h3 class="ph" style="font-size:16px;margin:10px 0 4px">${LANG === 'en' ? who.toUpperCase() : tr(({ ren: 'レン', jill: 'ジル', pom: 'ポム' })[who], who)}<small>${esc(t('closet'))}</small></h3>` + closetList(who).map(c => {
    const own = SV.closet[c.id], on = own && wear[who][c.slot] === c.v;
    return `<div class="shop-item"><img src="${closetIcon(c)}" alt=""><p>${esc(L(c))}${on ? `<small>${esc(t('wearing'))}</small>` : ''}</p>${own ? `<button class="buy${on ? '' : ' off'}" data-wear="${c.id}">${on ? t('takeOff') : t('putOn')}</button>` : c.lg != null ? `<button class="buy" disabled>${tr('伝説で解放', 'Legend only')}</button>` : `<button class="buy" data-buy="${c.id}" ${SV.bank < c.cost ? 'disabled' : ''}><img src="${SPR_URL.hay}" alt="">${fmt(c.cost)}</button>`}</div>`; }).join('')).join('');
  const li = legendInfo(), ja = LANG === 'ja', tg = (k, on, ok) => ok ? `<button class="buy${on ? '' : ' off'}" data-lg="${k}">${on ? (tr('オン', 'On')) : (tr('オフ', 'Off'))}</button>` : `<span class="lock">🔒</span>`;
  const legend = `<div class="legendbox"><h3>${tr('伝説のうさぎ特典', 'Legendary bunny perks')}${li ? ` <small>★${li.stars}</small>` : ''}</h3>${li ? '' : `<p class="note">${tr('最高位「伝説のうさぎ」になると手に入ります。その先も★がふえるたびに特典があります。', 'Reach the top rank, Legendary bunny, to unlock these. Every ★ after that brings more.')}</p>`}
    <div class="row3${li ? '' : ' lock'}"><span>${tr('伝説モード（速さ＋15%・スコア×1.5）', 'Legend mode (15% faster, score x1.5)')}</span>${tg('mode', !!SV.lgMode, legendOn('mode'))}</div>
    <div class="row3${legendOn('aura') ? '' : ' lock'}"><span>${tr('伝説の輝き（★1）', 'Golden sparkle trail (★1)')}</span>${tg('aura', SV.lgAura !== 0, legendOn('aura'))}</div>
    <div class="row3${legendOn('gold') ? '' : ' lock'}"><span>${tr('ランキングの金の名札（★2）', 'Gold name on the ranking (★2)')}</span>${legendOn('gold') ? '✓' : '<span class="lock">🔒</span>'}</div>
    <p class="note">${tr('月桂冠と金の礼服は、下の着せ替えにあります（3人とも）。★ごとにチモシー2,000本とお守り。', 'The laurel and the gold coat are in the wardrobe below (all three). Every ★: 2,000 hay and a charm.')}</p></div>`;
  return `<div class="bank"><span>${t('bankHave')}</span><span><img src="${SPR_URL.hay}" alt=""> <b>${fmt(SV.bank)}</b></span></div>${ups}${clover}${mug}${legend}${closet}<p class="note">${t('closetNote')}</p><p class="note">${t('shopNote')}</p>`;
}
const CLOSET_ICON = {};
function closetIcon(c) { // a small picture of the item
  if (CLOSET_ICON[c.id]) return CLOSET_ICON[c.id];
  const cv = mk(64), g = cv.getContext('2d') || noCtx(); g.translate(32, 40);
  if (c.slot === 'tie') { const keep = WEAR.ren.tie; WEAR.ren.tie = c.v; g.scale(.7, .7); g.translate(0, -36); tie(g, 0, 0, 60, 0); WEAR.ren.tie = keep; }
  else if (c.slot === 'frame') { const keep = WEAR.jill.frame; WEAR.jill.frame = c.v; g.scale(.9, .9); glasses(g, -14, 14, -6, 12); WEAR.jill.frame = keep; }
  else if (c.slot === 'band') { const keep = WEAR.pom.band; WEAR.pom.band = c.v; g.scale(.55, .55); g.translate(0, -10); headband(g, 0, 0, 48, 0); WEAR.pom.band = keep; }
  else if (c.slot === 'suit') { g.scale(.26, .26); g.translate(0, -20); if (c.v === 'bee') { beeWings(g, 0, -10, .9, -.1); suitOver(g, 'bee', 0, 10, 92, 66); antennae(g, 0, -56, 1.1); } else if (c.v === 'zebra') { suitOver(g, 'zebra', 0, 10, 92, 66); zebraMane(g, 0, -84, 40, 1.2); } else suitOver(g, c.v, 0, 10, 92, 66); }
  else { g.scale(.42, .42); g.translate(0, 20); hat(g, c.v, 1); }
  try { CLOSET_ICON[c.id] = cv.toDataURL(); } catch (e) { CLOSET_ICON[c.id] = ''; } return CLOSET_ICON[c.id];
}
function applyWear() { // put the saved outfit on and repaint the bunnies that changed
  const w = SV.wear || {}; let changed = '';
  const ch = new Set(); for (const who of ['ren', 'jill', 'pom']) { const src = w[who] || {}; for (const k in WEAR[who]) { const v = src[k] != null ? src[k] : WEAR[who][k]; if (WEAR[who][k] !== v) { WEAR[who][k] = v; ch.add(who); } } }
  if (ch.size > 1) buildBunnies(); else if (ch.size) buildBunnies([...ch][0]); changed = ch.size ? 'yes' : '';
  return !!changed;
}
function openShop() { SFX.ui(); openPanel('SHOP', t('shop'), shopHTML()); }
function zukanHTML(sel) {
  const n = ZUKAN_ORDER.filter(id => SV.zukan[id]).length;
  const tiles = ZUKAN_ORDER.map(id => { const d = ITEMS[id], got = SV.zukan[id]; return `<button class="zi${got ? '' : ' locked'}${d.kind === 'bad' ? ' ng' : ''}" data-z="${id}"><img src="${SPR_URL[id]}" alt="">${got ? esc(L(d)) : (tr('？？？', '???'))}</button>`; }).join('');
  let det = `<div class="zdetail"><b>${lab('TAP A FOOD')}</b>${esc(t('tapFood'))}</div>`;
  if (sel && SV.zukan[sel]) { const d = ITEMS[sel]; det = `<div class="zdetail"><b>${d.kind === 'bad' ? (tr('NG｜', 'DON’T FEED · ')) : ''}${esc(L(d))}</b>${esc(L(d.tip)).replace(/\n/g, '<br>')}</div>`; }
  return `<div class="bank"><span>${t('kinds', n, ZUKAN_ORDER.length)}</span></div>${det}<div class="zk">${tiles}</div><p class="note">${esc(t('foodNote'))}</p>`;
}
function openZukan() { SFX.ui(); SV.seenZukan = Object.keys(SV.zukan).length; save(); openPanel('FOOD BOOK', t('book'), zukanHTML()); }
function stampsHTML(sel) {
  const n = STAMP_ORDER.filter(id => SV.stamps[id]).length;
  const tiles = STAMP_ORDER.map(id => { const st = THEMES[id].stamp, got = SV.stamps[id]; return `<button class="st${got ? '' : ' locked'}" data-s="${id}"><img src="${stampURL(id)}" alt="">${got ? esc(L(st)) : (tr('？？？', '???'))}</button>`; }).join('');
  let det = `<div class="zdetail"><b>${tr('東京スタンプラリー', 'TOKYO STAMP RALLY')}</b>${esc(t('stampNote'))}</div>`;
  if (sel && SV.stamps[sel]) { const st = THEMES[sel].stamp; det = `<div class="zdetail"><b>${esc(L(st))}</b>${esc(L(st.note))}</div>`; }
  const pics = STAMP_ORDER.filter(id => SV.album[id]).map(id => `<figure><img src="${SV.album[id]}" alt="${esc(L(THEMES[id].stamp))}"><figcaption>${esc(L(THEMES[id].stamp))}</figcaption></figure>`).join('');
  const bp = (SV.bestPics || []).filter(p => p && p.img).map(p => `<figure><img src="${p.img}" alt=""><figcaption>${esc(t('bestPicCap', fmt(p.s)))}<br><small>${esc(new Date(p.d).toLocaleDateString())}</small></figcaption></figure>`).join('');
  return `<div class="bank"><span>${n} / ${STAMP_ORDER.length}</span></div>${det}${tokyoMapHTML()}${bp ? `<h3 class="ph" style="font-size:18px;margin-top:6px">${esc(t('bestPics'))}</h3><div class="album best">${bp}</div>` : ''}<div class="stamps">${tiles}</div><h3 class="ph" style="font-size:18px;margin-top:6px">${LANG === 'en' ? 'PHOTOS<small>' + t('photos') + '</small>' : t('photos')}</h3>${pics ? `<div class="album">${pics}</div>` : `<p class="note">${t('noPhoto')}</p>`}`;
}
// 走った場所の地図（B-20）：東京の略図（湾・隅田川・山手線の輪）に、行った名所は足あと、まだの所は灰色の点
const MAP_PT = { yamanote: [139.747, 35.646], tokyoeki: [139.767, 35.681], ginza: [139.765, 35.671], yurakucho: [139.762, 35.675], kokyo: [139.756, 35.682], chidori: [139.745, 35.690], nakadori: [139.766, 35.678], omotesando: [139.711, 35.666], gaien: [139.719, 35.675], asakusa: [139.796, 35.711], river: [139.802, 35.704], skytree: [139.811, 35.710], tower: [139.745, 35.659], shibuya: [139.701, 35.659], akihabara: [139.773, 35.698], ameyoko: [139.774, 35.708], ueno: [139.771, 35.715], shinjuku: [139.692, 35.690], kabukicho: [139.703, 35.695], odaiba: [139.775, 35.630],
  subway: [139.739, 35.672], toden: [139.728, 35.735], bayline: [139.781, 35.627], shokudo: [139.760, 35.684], rooftop: [139.764, 35.686], nihonbashi: [139.774, 35.684], tsukiji: [139.770, 35.665], hibiya: [139.756, 35.673], jimbocho: [139.758, 35.696], kagurazaka: [139.739, 35.702], shiodome: [139.760, 35.664], shinbashi: [139.758, 35.666], hamarikyu: [139.763, 35.660], yanaka: [139.766, 35.727], nezu: [139.767, 35.720], dougu: [139.789, 35.712], ryogoku: [139.793, 35.697], kiyosumi: [139.798, 35.681], sumidakoen: [139.804, 35.713], shinobazu: [139.770, 35.712], yakata: [139.798, 35.700],
  sando: [139.699, 35.676], takeshita: [139.703, 35.671], ekimae: [139.699, 35.661], daikanyama: [139.703, 35.649], meguro: [139.698, 35.643], roppongi: [139.731, 35.663], gyoen: [139.710, 35.685], yokocho: [139.698, 35.693], ikebukuro: [139.713, 35.731], shinokubo: [139.700, 35.701], zojoji: [139.748, 35.657], toyosu: [139.793, 35.649], kaihin: [139.774, 35.629], hie: [139.741, 35.674], tsukishima: [139.783, 35.663], kanda: [139.768, 35.702], kuramae: [139.791, 35.704], terrace: [139.794, 35.688], shibamata: [139.877, 35.758], catst: [139.706, 35.666], shimokita: [139.668, 35.661], yoyogi: [139.695, 35.672],
  kichijoji: [139.574, 35.700], takeshiba: [139.762, 35.654], chikagai: [139.768, 35.680], ochanomizu: [139.764, 35.699], koishikawa: [139.749, 35.707], akasaka: [139.737, 35.675], okachimachi: [139.775, 35.707], monzen: [139.796, 35.672], kiba: [139.809, 35.674], ebisu: [139.710, 35.646], nakano: [139.665, 35.707], koenji: [139.649, 35.705], jiyugaoka: [139.669, 35.607], sangenjaya: [139.670, 35.643], yotsuya: [139.729, 35.686], ichigaya: [139.736, 35.692], tennozu: [139.750, 35.622], harumi: [139.774, 35.649], kachidoki: [139.775, 35.663], monorail: [139.748, 35.600], kuko: [139.784, 35.549], kukodeck: [139.790, 35.553] };
function tokyoMapHTML() {
  const W = 320, H = 275, X = lo => (lo - 139.56) / (139.89 - 139.56) * W, Y = la => (35.77 - la) / (35.77 - 35.54) * H, P = ([lo, la]) => X(lo).toFixed(1) + ',' + Y(la).toFixed(1);
  const loop = [[139.767, 35.681], [139.774, 35.698], [139.777, 35.714], [139.765, 35.728], [139.739, 35.733], [139.711, 35.729], [139.700, 35.713], [139.700, 35.690], [139.702, 35.659], [139.716, 35.646], [139.740, 35.628], [139.747, 35.645], [139.758, 35.666]].map(P).join(' ');
  const river = [[139.800, 35.770], [139.805, 35.740], [139.800, 35.716], [139.797, 35.703], [139.793, 35.690], [139.785, 35.672], [139.777, 35.655]].map(P).join(' ');
  const bay = 'M' + [[139.735, 35.54], [139.748, 35.60], [139.756, 35.625], [139.762, 35.645], [139.785, 35.643], [139.83, 35.648], [139.89, 35.64], [139.89, 35.54]].map(P).join(' L') + ' Z';
  const got = STAMP_ORDER.filter(id => SV.stamps[id]), n = got.length;
  const dots = STAMP_ORDER.map(id => { const [x, y] = P(MAP_PT[id] || [139.75, 35.68]).split(',').map(Number), on = !!SV.stamps[id];
    return on ? `<g transform="translate(${x} ${y})" aria-label="${esc(L(THEMES[id].stamp))}"><ellipse cx="0" cy="1.5" rx="4.6" ry="3.8" fill="#C8463C"/><circle cx="-4" cy="-3.5" r="1.7" fill="#C8463C"/><circle cx="0" cy="-5" r="1.7" fill="#C8463C"/><circle cx="4" cy="-3.5" r="1.7" fill="#C8463C"/></g>`
      : `<circle cx="${x}" cy="${y}" r="3.2" fill="#B9AE9E" opacity=".8"/>` /* SVG の title 要素は使わない（ページの title の数を数える SEO の点検に引っかかる） */; }).join('');
  return `<div class="tmap"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('mapH'))}"><rect width="${W}" height="${H}" rx="12" fill="#F3EBDD"/><path d="${bay}" fill="#BFD6EA"/><polyline points="${river}" fill="none" stroke="#9CC3E2" stroke-width="5" stroke-linecap="round"/><polygon points="${loop}" fill="none" stroke="#80C241" stroke-width="3" stroke-dasharray="6 4" opacity=".9"/>${dots}</svg><p class="note">${esc(t('mapNote', n, STAMP_ORDER.length))}</p></div>`;
}
const STAMP_URL = {}; function stampURL(id) { const k = id + LANG; if (!STAMP_URL[k]) { try { STAMP_URL[k] = stampSprite(id).toDataURL(); } catch (e) { return ''; } } return STAMP_URL[k]; }
function openStamps() { SFX.ui(); SV.seenStamps = Object.keys(SV.stamps).length + Object.keys(SV.album).length; save(); openPanel('TOKYO', t('stamps'), stampsHTML()); }
function openHow() {
  SFX.ui();
  const ic = k => `<kbd><img src="${SPR_URL[k]}" width="28" alt=""></kbd>`;
  // 動く絵（C-74）：指が左右・上・下にスワイプして、うさぎがよける・跳ぶ・すべる。「動きを減らす」設定・OS の設定では止まる
  const demo = `<div class="howanim${OPT().calm ? ' still' : ''}" aria-hidden="true"><div class="ha-road"><i class="ha-l"></i><i class="ha-l r"></i></div><img class="ha-bun" src="${(() => { try { return bunFrame(SV.char === 'jill' ? 'jill' : 'ren', 'run0', false).toDataURL(); } catch (e) { return SPR_URL.hay; } })()}" alt=""><b class="ha-box"></b><span class="ha-finger"></span><em class="ha-cap"><span>${esc(t('howA1'))}</span><span>${esc(t('howA2'))}</span><span>${esc(t('howA3'))}</span></em></div>`;
  openPanel('HOW TO PLAY', t('how'), demo + `<div class="how">
    <kbd>← →</kbd><span>${t('howSwipeLR')}</span><kbd>↑</kbd><span>${t('howUp')}</span><kbd>↓</kbd><span>${t('howDown')}</span>${matchMedia('(hover:none) and (pointer:coarse)').matches ? '' : `<kbd>ESC</kbd><span>${t('howKeys')}</span>`}</div>
    <div class="zdetail"><b>${lab('GOAL')}</b>${esc(t('howGoal'))}</div>
    <div class="zdetail"><b>${lab('CORNERS')}</b>${esc(t('howTurn'))}</div>
    <div class="zdetail"><b>${lab('♥ BUMPS')}</b>${esc(t('howBump'))}</div>
    <div class="zdetail"><b>${lab('FEVER')}</b>${esc(t('howFever'))}</div>
    <div class="how">${ic('carrot')}<span>${esc(L(POW.dash))}</span>${ic('papaya')}<span>${esc(L(POW.magnet))}</span>${ic('alfalfa')}<span>${esc(L(POW.jump))}</span>
    ${ic('plane')}<span>${esc(L(POW.fly))}</span>${ic('hanko')}<span>${esc(L(POW.x2))}</span>${ic('clover')}<span>${esc(L(ITEMS.clover))}</span>${ic('choco')}<span>${esc(t('howNG'))}</span></div>
    <div class="zdetail"><b>${tr('クレジット・ご注意', 'CREDITS & NOTES')}</b>${esc(t('legal'))}</div>`);
}
// 文字の大きさ（C-29）：html に bigtext をつける
function applyLook() { try { document.documentElement.classList.toggle('bigtext', !!OPT().big); } catch (e) { } }
// 同じ見た目の品（例：レンのサンタ帽。買える物とクリスマスのプレゼント）は1つだけ出す：持っている物 → いつもの物 → 無料の物の順（2026-11-09 の報告）
function closetList(who) { const vis = CLOSET.filter(c => c.who === who && (!c.ev || c.ev === EVENT || SV.closet[c.id])), pick = {};
  const rank = c => SV.closet[c.id] ? (c.ev ? 1 : 0) : 4 + (c.ev ? 1 : 0) + (c.cost ? 2 : 0);
  for (const c of vis) { const k = c.slot + ':' + c.v; if (!pick[k] || rank(c) < rank(pick[k])) pick[k] = c; }
  return vis.filter(c => pick[c.slot + ':' + c.v] === c); }
function errLogHTML() { let a = []; try { a = JSON.parse(localStorage.getItem('rjErrLog') || '[]'); } catch (e) { }
  return `<details class="m xfer errlog"><summary><b>${esc(t('errLogH'))}</b> (${a.length})</summary><p class="note">${esc(t('errLogNote'))}</p>${a.length ? `<ul>${a.slice().reverse().map(x => `<li><code>${esc(new Date(x.t).toLocaleString())}${x.n > 1 ? ' ×' + x.n : ''}</code> ${esc(x.m)}</li>`).join('')}</ul>` : `<p class="note">${esc(t('errLogNone'))}</p>`}</details>`; }
function settingsHTML() {
  const o = OPT(), row = (lbl, key, opts) => `<div class="m"><p><b>${esc(lbl)}</b></p><span class="seg">${opts.map(([v, txt]) => `<button class="buy${o[key] === v ? '' : ' off'}" data-opt="${key}" data-v="${v}">${esc(txt)}</button>`).join('')}</span></div>`;
  const langRow = `<div class="m langrow"><p><b>🌐 Language</b></p><span class="seg langseg">${LANGS.map(l => `<button class="buy${LANG === l ? '' : ' off'}" data-lang="${l}" lang="${({ zh: 'zh-Hant' })[l] || l}">${LANG_NAME[l]}</button>`).join('')}</span></div>`; // all four, side by side (the title button cycles)
  return langRow + row(t('ctrl'), 'ctrl', [['swipe', t('ctrlSwipe')], ['tap', t('ctrlTap')]]) + `<p class="note">${esc(t('ctrlNote'))}</p>` +
    (OPT().ctrl === 'tap' ? row(t('hand'), 'hand', [[false, t('off')], [true, t('on')]]) + `<p class="note">${esc(t('handNote'))}</p>` : '') +
    row(t('sens'), 'sens', [['normal', t('sensN')], ['high', t('sensH')]]) + `<p class="note">${esc(t('sensNote'))}</p>` + row(t('vib'), 'vib', [[true, t('on')], ['low', t('vibLow')], [false, t('off')]]) +
    row(t('bigText'), 'big', [[false, t('bigN')], [true, t('bigY')]]) + `<p class="note">${esc(t('bigNote'))}</p>` +
    row(t('easy'), 'easy', [[false, t('easyN')], [true, t('easyY')]]) + `<p class="note">${esc(t('easyNote'))}</p>` +
    row(t('calm'), 'calm', [[true, t('on')], [false, t('off')]]) + `<p class="note">${esc(t('calmNote'))}</p>` + row(t('music'), 'music', [[true, t('on')], ['low', t('lvLow')], [false, t('off')]]) + row(t('sfx'), 'sfx', [[true, t('on')], ['low', t('lvLow')], [false, t('off')]]) +
    `<button class="sub" id="btnNameSet">${esc(SV.nick ? t('nameBtn', SV.nick) : t('nameNone'))}</button> <button class="sub" id="btnTut">${esc(t('resetTut'))}</button>` +
    `<div class="m xfer"><p><b>${esc(t('codeH'))}</b></p><p class="note">${esc(t('codeNote'))}</p><div class="btns" style="display:flex;gap:8px"><input id="codeIn" aria-label="${esc(t('codeH'))}" maxlength="24" autocomplete="off" autocapitalize="characters" enterkeyhint="done" placeholder="${esc(t('codePh'))}" style="flex:1;min-width:0;font:inherit;padding:8px 10px;border:2px solid var(--line);border-radius:10px"><button class="sub" id="btnCode" style="width:auto">${esc(t('codeOk'))}</button></div><p class="note" id="codeMsg" aria-live="polite"></p></div>` +
    `<div class="m xfer sns"><p><b>${esc(t('snsH'))}</b></p><p class="note">${esc(t('snsNote'))}</p>${followLinks('chips')}</div>` + linkHTML() + `<div class="m xfer"><p><b>${esc(t('xfer'))}</b></p><p class="note">${esc(t('xferNote'))}</p><button class="sub" id="btnXferMake">${esc(t('xferMake'))}</button><textarea id="xferOut" aria-label="${esc(t('xfer'))}" readonly rows="3" hidden></textarea>` +
    `<textarea id="xferIn" aria-label="${esc(t('xferPaste'))}" rows="3" placeholder="${esc(t('xferPaste'))}"></textarea><button class="sub" id="btnXferLoad">${esc(t('xferLoad'))}</button><p class="note" id="xferMsg" aria-live="polite"></p></div>` +
    errLogHTML() + `<div class="m xfer reset"><p><b>${esc(t('resetH'))}</b></p><p class="note">${esc(t('resetNote'))}</p><button class="sub danger" id="btnReset">${esc(t('resetBtn'))}</button>` +
    `<div id="resetAsk" hidden><p class="note"><b>${esc(t('resetAsk'))}</b></p><div style="display:flex;gap:8px"><button class="sub danger" id="btnResetYes">${esc(t('resetYes'))}</button><button class="sub" id="btnResetNo">${esc(t('resetNo'))}</button></div></div><p class="note" id="resetMsg" aria-live="polite"></p></div>`;
}
/* ---- the player's name for the ranking: asked before the first run, editable any time ---- */
let nameThenStart = 0;
function openName(first) {
  SFX.ui(); nameThenStart = first;
  openPanel('NAME', t('nameTitle'), `<div class="namebox"><input id="nameIn" maxlength="12" autocomplete="off" enterkeyhint="done" placeholder="${esc(t('namePh'))}" aria-label="${esc(t('nameTitle'))}"><p class="note">${esc(t('nameNote'))}</p>
    <div class="btns">${first ? `<button class="sub" id="nameLater">${esc(t('nameLater'))}</button>` : ''}<button class="big" id="nameOk">${esc(t('nameOk'))}</button></div></div>`);
  const i = $('#nameIn'); i.value = SV.nick || ''; setTimeout(() => { try { i.focus(); } catch (e) { } }, 50);
  i.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); nameDone(1); } };
}
// a small block list for public names (insults, slurs, adult words); names that hit it are not saved
const NG_NAME = ['死ね', 'しね', '殺す', 'ころす', 'きちがい', 'キチガイ', 'ガイジ', 'ちんこ', 'ちんぽ', 'まんこ', 'セックス', 'エロ', 'レイプ', 'fuck', 'shit', 'bitch', 'nigg', 'cunt', 'dick', 'pussy', 'porn', 'sex', 'rape', 'kill', 'nazi', 'hitler', 'faggot', 'retard'];
function nameBad(v) { const s = String(v).toLowerCase().replace(/[\s._\-*]/g, ''); return NG_NAME.some(w => s.includes(w.toLowerCase())) || /https?:|www\.|@|\d{3,}-?\d{3,}/.test(s); }
function cleanName(v) { return (v || '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 12); }
function nameDone(ok) {
  if (ok) { const v = cleanName($('#nameIn').value); if (v && nameBad(v)) { const n = document.querySelector('.namebox .note'); if (n) { n.textContent = t('nameNG'); n.style.color = '#C8463C'; } return; } setNick(v); }
  SV.nickAsked = 1; save(); refreshNameBtn();
  if (nameThenStart) { nameThenStart = 0; hideAll(); startRun(); } else closePanel();
}
function refreshNameBtn() { const b = $('#btnName'); if (b) b.textContent = SV.nick ? t('nameBtn', SV.nick) : t('nameNone'); }
// wipe everything on this device (progress, clothes, stamps, the ranking account) and take this player off the public boards
async function resetAll() {
  const msg = $('#resetMsg'); $('#btnResetYes').disabled = true; $('#btnResetNo').disabled = true; msg.textContent = t('resetDoing');
  try { if (rankOn()) await Promise.race([RANK.db.doc('ranks/' + RANK.uid).set({}), new Promise(r => setTimeout(r, 4000))]); } catch (e) { } // an empty row drops out of every ranking
  RESETTING = 1;
  for (const k of [SAVE_KEY, 'rjChal', 'hd_fsauth']) { try { localStorage.removeItem(k); } catch (e) { } }
  msg.textContent = t('resetDone'); setTimeout(() => location.reload(), 700);
}
/* ---- one account across browsers and devices: a short code (15 minutes) instead of a long transfer code ----
   links/<CODE> = { d: the transfer code of the device that made it, exp, by }. The code is the secret; it is deleted once used. */
const LINK_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', LINK_MIN = 15, LINK_SKEW = 3 * 3600e3; // a phone whose clock is a few hours off still reads a fresh code (the code is deleted once used)
const linkOn = () => !!(RANK.own && rankOn());
const linkFmt = c => c.slice(0, 4) + '-' + c.slice(4);
// the 8 letters, however they arrive: typed with a Japanese keyboard (ＡＢＣＤーＥＦＧＨ), pasted with words around them, or the whole link pasted
const linkClean = v => { const s = String(v || '').normalize('NFKC').toUpperCase().replace(/[\u2010-\u2015\u2212\u30FC\uFF70~]/g, '-');
  const m = /LINK=([A-Z0-9]{4}-?[A-Z0-9]{4})(?![A-Z0-9])/.exec(s) || /(?:^|[^A-Z0-9])([A-Z0-9]{4}-[A-Z0-9]{4})(?![A-Z0-9])/.exec(s);
  return (m ? m[1] : s).replace(/[^A-Z0-9]/g, '').slice(0, 8); };
function linkHTML() {
  if (!linkOn()) return '';
  return `<div class="m xfer link"><p><b>${esc(t('linkH'))}</b></p><p class="note">${esc(t('linkNote'))}</p>` +
    `<p class="linkstep" id="linkInH">${esc(t('linkInH'))}</p><p class="note">${esc(t('linkInHow'))}</p>` +
    `<div class="btns" style="display:flex;gap:8px;margin-top:6px"><input id="linkIn" aria-label="${esc(t('linkInH'))}" maxlength="200" autocomplete="off" autocapitalize="characters" enterkeyhint="go" placeholder="${esc(t('linkPh'))}" style="flex:1;min-width:0;font:inherit;font-size:18px;letter-spacing:.12em;text-transform:uppercase;padding:8px 10px;border-radius:10px;border:2px solid var(--line)"><button class="sub" id="btnLinkGo" style="flex:none;width:auto;padding-left:18px;padding-right:18px">${esc(t('linkGo'))}</button></div>` +
    `<p class="linkstep" style="margin-top:18px">${esc(t('linkOutH'))}</p><button class="sub" id="btnLinkMake">${esc(t('linkMake'))}</button><div id="linkOut" hidden></div>` +
    `<div id="linkAsk" hidden></div><p class="note" id="linkMsg" aria-live="polite"></p></div>`;
}
async function linkMake() {
  const msg = $('#linkMsg'), out = $('#linkOut'); msg.textContent = t('linkWait');
  try { saveNow(); const d = await xferMake(); let code = ''; const r = new Uint32Array(8); crypto.getRandomValues(r); for (const x of r) code += LINK_ABC[x % LINK_ABC.length];
    try { await RANK.db.doc('links/' + code).set({ d, exp: Date.now() + LINK_MIN * 60e3, by: RANK.uid }); }
    catch (e) { await RANK.db.doc('links/' + code).set({ d, exp: Date.now() - 2 * 3600e3 + LINK_MIN * 60e3, by: RANK.uid }); } // this phone's clock runs ahead (the server refuses a code that seems to last too long): once more, as if two hours earlier (readers allow LINK_SKEW)
    const url = extOpen((window.HAYDASH_APP && /^https?:/.test(location.href) ? location.href.split('#')[0].split('?')[0] : GAME_URL) + '?link=' + code); // sent to yourself on LINE, it opens in the phone's own browser (not a second account inside LINE)
    out.hidden = false; out.innerHTML = `<p class="linkcode">${esc(linkFmt(code))}</p><p class="note">${esc(t('linkShow', LINK_MIN))}</p><button class="sub" id="btnLinkCopy">${esc(t('linkCopy'))}</button>`; out.dataset.url = url;
    msg.textContent = '';
  } catch (e) { msg.textContent = t('linkFail'); }
}
async function linkLook(raw) {
  const code = linkClean(raw), msg = $('#linkMsg'), ask = $('#linkAsk'); ask.hidden = true; if (code.length !== 8) { msg.textContent = t('linkBad'); return; }
  msg.textContent = t('linkWait');
  try { const sn = await RANK.db.doc('links/' + code).get(); const o = sn.exists ? sn.data() : null;
    if (!o || !o.d || !(o.exp > Date.now() - LINK_SKEW)) { msg.textContent = t('linkBad'); return; }
    if (o.by === RANK.uid) { msg.textContent = t('linkSelf'); return; }
    const them = await xferRead(o.d); msg.textContent = '';
    ask.hidden = false; ask.dataset.code = code; ask.dataset.d = o.d;
    const mine = (SV.best || 0) > (+them.best || 0), more = xferMore(them);
    ask.innerHTML = `<p class="note"><b>${esc(t('linkAsk', fmt(+them.best || 0), fmt(+them.bank || 0)))}</b></p>` + (mine ? `<p class="note" style="color:#B3352A">${esc(t('linkMine', fmt(SV.best || 0)))}</p>` : more ? `<p class="note" style="color:#B3352A">${esc(more)}</p>` : '') +
      `<div style="display:flex;gap:8px"><button class="sub" id="btnLinkYes">${esc(t('linkYes'))}</button><button class="sub" id="btnLinkNo">${esc(t('resetNo'))}</button></div>`;
  } catch (e) { msg.textContent = t('linkFail'); }
}
async function linkApply() {
  const ask = $('#linkAsk'), msg = $('#linkMsg'), code = ask.dataset.code, d = ask.dataset.d; if (!code || !d) return;
  $('#btnLinkYes').disabled = true; msg.textContent = t('linkWait');
  let them = null; try { them = await xferRead(d); await xferApply(d); } catch (e) { $('#btnLinkYes').disabled = false; msg.textContent = t('linkFail'); return; } // the progress first: nothing is removed unless it arrived
  RESETTING = 1; // from here this page writes nothing back (the new save and account are in place)
  try { await RANK.db.doc('links/' + code).delete(); } catch (e) { }
  await xferLeaveBoard(them && them._fs); // this browser's own entry leaves the boards: one player, one row
  msg.textContent = t('linkDone'); setTimeout(() => location.reload(), 800);
}
// a transfer that brings another ranking account: this browser's old row is emptied (it would stay on the boards as a second player)
async function xferLeaveBoard(fs) { if (!RANK.own || !rankOn() || !fs || !fs.u || fs.u === RANK.uid) return; try { await Promise.race([RANK.db.doc('ranks/' + RANK.uid).set({}), new Promise(r => setTimeout(r, 4000))]); } catch (e) { } }
// this device has progress the code does not: say so before it is replaced (best, hay or runs; '' when nothing would be lost)
function xferMore(them) { const b = SV.best || 0, h = SV.bank || 0, r = SV.runs || 0; return b > (+them.best || 0) || h > (+them.bank || 0) || r > (+them.runs || 0) ? t('xferMine', fmt(b), fmt(h), fmt(r)) : ''; }
// the long backup code: show what it holds, warn when this device has more, and restore on the second tap (for this same code only)
async function xferLoad(b) {
  const code = $('#xferIn').value, msg = $('#xferMsg'); if (!code.trim() || b.disabled) return;
  let them, key; try { them = await xferRead(code); key = xferParse(code).body.slice(-24); } catch (e) { b.dataset.sure = ''; msg.textContent = t('xferBad'); return; }
  if (b.dataset.sure !== key) { b.dataset.sure = key; const more = xferMore(them);
    msg.innerHTML = `<b>${esc(t('linkAsk', fmt(+them.best || 0), fmt(+them.bank || 0)))}</b><br>` + (more ? `<span style="color:#B3352A">${esc(more)}</span><br>` : '') + esc(t('xferConfirm')); return; }
  b.disabled = true;
  try { await xferApply(code); } catch (e) { b.disabled = false; b.dataset.sure = ''; msg.textContent = t('xferBad'); return; }
  msg.textContent = t('xferDone');
  let kept = false; try { kept = localStorage.getItem(SAVE_KEY) === JSON.stringify(SV); } catch (e) { }
  if (kept) { RESETTING = 1; await xferLeaveBoard(them._fs); setTimeout(() => location.reload(), 900); return; } // a fresh start with the restored save: language, sound, account, gifts and perks all from it
  // a page that cannot keep data (a private window, a host without storage): the restored save stays in this page, so no reload
  LANG = LANGS.includes(SV.lang) ? SV.lang : LANG; G.char = SV.char || 'ren'; applyWear(); missionsFix(); setMute(!!SV.mute); applyAudioOpt(); refreshTitle(); { const lg = legendGrant(); if (lg) setTimeout(() => toastTitle(lg), 1000); }
  setTimeout(() => { if (!$('#sPanel').hidden) closePanel(); goTitle(); }, 900);
}
// opened from a "connect" link (?link=CODE): open the settings with the code filled in
const LINK_Q = (() => { try { const m = /[?&]link=([A-Za-z0-9-]{8,9})\b/.exec(location.search); if (m) { history.replaceState(null, '', location.pathname + location.hash); return linkClean(m[1]); } } catch (e) { } return ''; })();
function linkFromUrl() { if (!LINK_Q) return; const go = (n) => { if (!RANK.ready) { if (n < 40) setTimeout(() => go(n + 1), 250); return; } if (!linkOn()) { if (window.HAYDASH_APP) toastTitle(t('linkFail')); return; } openSettings(); const i = $('#linkIn'); if (i) { i.value = linkFmt(LINK_Q); i.scrollIntoView({ block: 'center' }); linkLook(LINK_Q); } }; go(0); }
// 練習モード・場所えらび（B-31・B-38）：行ったことのある名所（とスタートの家）から選んで走る。ぶつかっても終わらない（一時停止 → やめる で終わり）。記録・ランキング・牧草の貯金には入らない
function openPractice() { SFX.ui(); const ids = ['bedroom'].concat(STAMP_ORDER.filter(id => SV.stamps[id] && THEMES[id] && THEMES[id].kind !== 'train'));
  openPanel('PRACTICE', t('practice'), `<p class="note">${esc(t('practiceNote'))}</p><div class="plist">${ids.map(id => `<button class="sub" data-prac="${id}">${esc(id === 'bedroom' ? t('practiceHome') : L(THEMES[id].stamp))}</button>`).join('')}</div>${ids.length < 2 ? `<p class="note">${esc(t('practiceMore'))}</p>` : ''}`); }
function openSettings() { SFX.ui(); openPanel('SETTINGS', t('settings'), settingsHTML()); }
let rvTimer = null;
// ぶつかった物の絵を、続ける画面と結果画面に（C-69）。絵のある物だけ。書類に追いつかれた・壁・時間切れのときも、最後にぶつかった物
function showHit(pre) { const box = $('#' + pre + 'Hit'); if (!box) return; const o = G.lastHit; let url = '';
  try { if (o && o.art && G.cause !== 'time' && G.cause !== 'quit' && G.cause !== 'rescue' && typeof ART !== 'undefined' && ART[o.art]) { const c = ART[o.art](o, false); url = c && c.toDataURL ? c.toDataURL() : ''; } } catch (e) { url = ''; }
  box.hidden = !url; if (!url) return; $('#' + pre + 'HitImg').src = url; $('#' + pre + 'HitTxt').textContent = LANG === 'ja' && typeof OBS_JA !== 'undefined' && OBS_JA[o.type] ? t('hitWhatN', OBS_JA[o.type]) : t('hitWhat'); }
function openRevive() {
  const c = reviveCost(), cap = (CAPS[G.cause] || CAPS.obstacle)[G.char];
  $('#rvEn').textContent = tr(cap[1], cap[0]); $('#rvJa').textContent = ''; showHit('rv');
  const bc = $('#btnRvClover'), bh = $('#btnRvHay');
  const free = freeRevive(); bc.dataset.free = free ? '1' : '';
  bc.textContent = free ? t('reviveFree') : t('reviveClover', c.clover); bc.disabled = !free && SV.clovers < c.clover; bc.style.opacity = bc.disabled ? .45 : 1; /* お守りが足りないときはグレーにするだけ（文字は足さない。2026-11-10 オーナー：グレーで分かる） */
  bh.textContent = t('reviveHay', c.hay); bh.disabled = SV.bank + Math.floor(G.hay) < c.hay; bh.style.opacity = bh.disabled ? .45 : 1; if (bh.disabled) bh.textContent += t('rvShort', fmt(c.hay - SV.bank - Math.floor(G.hay))); bh.hidden = free;
  $('#rvHave').textContent = free ? t('reviveFreeNote') : t('reviveHave', SV.clovers, fmt(SV.bank + Math.floor(G.hay)));
  const ba = $('#btnRvAd'); if (ba) { ba.hidden = !PORTAL.adOK(); ba.textContent = t('reviveAd'); }
  if (bc.disabled && bh.disabled && (!ba || ba.hidden)) { endRun(); return; }
  hideAll(); show('sRevive'); { const f = !bc.disabled ? bc : !bh.disabled && !bh.hidden ? bh : $('#btnRvNo'); try { f.focus({ preventScroll: true }); } catch (e) { } } // keyboard players can continue with Enter
  const ring = $('#rvRing'), num = $('#rvNum'), t0 = performance.now();
  clearInterval(rvTimer);
  let rvLeft = 5, rvLast = performance.now();
  rvTimer = setInterval(() => { const now = performance.now(); if (!document.hidden) rvLeft -= (now - rvLast) / 1000; rvLast = now; const left = Math.max(0, rvLeft); num.textContent = Math.ceil(left); ring.style.setProperty('--p', (left / 5 * 100) + '%'); if (left <= 0) { clearInterval(rvTimer); if (G.mode === 'dead') { hideAll(); endRun(); } } }, 100);
}
function pause() { if (G.mode !== 'play') return; G.mode = 'pause'; saveFlush(); musicStop(); $('#pauseMissions').innerHTML = missionHTML(); hideAll(); show('hud'); show('sPause'); applyLang(); }
function resume() { if (G.mode !== 'pause') return; hideAll(); show('hud');
  const cue = $('#tutCue'); let n = 3; cue.className = 'show'; cue.innerHTML = `<b>${n}</b>`; G.mode = 'countdown';
  const tick = () => { if (G.mode !== 'countdown') { cue.className = ''; return; } n--; if (n > 0) { cue.innerHTML = `<b>${n}</b>`; SFX.ui(); setTimeout(tick, 450); } else { cue.innerHTML = '<b>GO!</b>'; setTimeout(() => { if (G.mode === 'countdown') cue.className = ''; }, 400); G.mode = 'play'; G.invT = Math.max(G.invT, .6); musicStart(); last = performance.now(); } };
  SFX.ui(); setTimeout(tick, 450); }

/* ================= input ================= */
const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', Space: 'up', ArrowDown: 'down', KeyS: 'down' };
addEventListener('keydown', e => {
  if (e.target && e.target.closest && e.target.closest('input,textarea,[contenteditable]') && e.code !== 'Escape') return; // typing a name or a code: letters are letters (P is not pause)
  if (e.code === 'Escape' || e.code === 'KeyP') { if (G.mode === 'play') pause(); else if (G.mode === 'pause') resume(); else if (!$('#sPanel').hidden) closePanel(); return; }
  if ((G.mode === 'title' || G.mode === 'result') && e.code === 'Enter' && $('#sPanel').hidden && !e.target.closest('button,a,summary,input,textarea')) { hideAll(); startRun(); return; }
  const a = KEYMAP[e.code]; if (a && G.mode === 'play') { e.preventDefault(); if (!e.repeat) act(a); }
});
let tp = null;
const stage = $('#app');
stage.addEventListener('pointerdown', e => {
  if (G.mode !== 'play') return; if (e.target.closest('button')) return;
  if (OPT().ctrl === 'tap') { const fx = e.clientX / W, fy = e.clientY / H;
    if (OPT().hand) { if (fy < .5) return; act(fx < .33 ? 'left' : fx > .67 ? 'right' : fy < .75 ? 'up' : 'down'); return; } // 片手（C-12）：指の届く下半分だけ。上の半分は押しても何も起きない
    act(fx < .33 ? 'left' : fx > .67 ? 'right' : fy < .62 ? 'up' : 'down'); return; }
  tp = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, px: e.clientX, py: e.clientY, tm: performance.now(), id: e.pointerId, fired: false };
});
stage.addEventListener('pointermove', e => {
  if (!tp || tp.id !== e.pointerId) return;
  const now = performance.now(), v = Math.hypot(e.clientX - tp.px, e.clientY - tp.py) / Math.max(1, now - tp.tm); tp.px = e.clientX; tp.py = e.clientY; tp.tm = now; G.swipeV = v;
  // 速いはじき（1ms に 0.9px 以上）は、短くても受け付ける：しきい値を 6 割に（C-5）
  const dx = e.clientX - tp.x, dy = e.clientY - tp.y, th = (OPT().sens === 'high' ? 12 : Math.max(16, Math.min(W, H) * .04)) * (v > .9 ? .6 : 1); // a shorter swipe counts (20px felt slow on a phone)
  if (Math.abs(dx) > th || Math.abs(dy) > th) { const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); if (dir !== tp.last || performance.now() - tp.t > 160) { act(dir); tp.last = dir; tp.t = performance.now(); tp.fired = true; } tp.x = e.clientX; tp.y = e.clientY; }
});
const endTouch = e => { if (!tp || tp.id !== e.pointerId) return; // a fast flick on a busy frame may arrive as just down + up: read it from the whole stroke
  if (!tp.fired && e.type === 'pointerup' && G.mode === 'play') { const dx = e.clientX - tp.sx, dy = e.clientY - tp.sy, th = OPT().sens === 'high' ? 10 : Math.max(14, Math.min(W, H) * .028);
    if (Math.abs(dx) > th || Math.abs(dy) > th) act(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); }
  tp = null; };
stage.addEventListener('pointerup', endTouch); stage.addEventListener('pointercancel', endTouch);
document.addEventListener('visibilitychange', () => { if (document.hidden) { saveNow(); if (G.mode === 'countdown') { G.mode = 'play'; $('#tutCue').className = ''; } pause(); } });

/* ================= buttons ================= */
$('#btnStart').onclick = () => { hideAll(); startRun(); };
$('#btnName').onclick = () => openName(0);
$('#btnChat').onclick = chatOpen; $('#btnChat2').onclick = chatOpen; $('#chatClose').onclick = chatClose;
$('#chatForm').onsubmit = e => { e.preventDefault(); chatAsk($('#chatIn').value); }; $('#chatStop').onclick = () => { if (CHAT.ctl) CHAT.ctl.abort(); };
$('#sChat').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') chatClose(); });
$('#fcL').onclick = () => { if (G.mode === 'play' && G.s > turnWindow(curSeg())) act('left'); }; $('#fcR').onclick = () => { if (G.mode === 'play' && G.s > turnWindow(curSeg())) act('right'); };
$('#shIg').onclick = e => { SFX.ui(); e.preventDefault(); shareInstagram(); };
$('#shFb').onclick = e => { SFX.ui(); e.preventDefault(); shareFacebook(); };
for (const [id, ch] of [['shX', 'x'], ['shLine', 'line'], ['shTh', 'th']]) $('#' + id).onclick = () => { SFX.ui(); copyText(SHARE.caption(ch)); }; // the link itself opens X / LINE with the text filled in; the text is also copied, just in case
$('#resNameOk').onclick = () => { $('#resNameToggle').hidden = true; const v = cleanName($('#resNameIn').value); if (!v) return; if (nameBad(v)) { $('#resNameIn').value = ''; $('#resNameIn').placeholder = t('nameNG'); return; } SFX.ui(); setNick(v); SV.nickAsked = 1; save(); $('#resRank .rk-name').hidden = true; rankAfterRun(G.score); };
$('#resNameIn').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); $('#resNameOk').click(); } };
$('#pickRen').onclick = () => { G.char = 'ren'; SV.char = 'ren'; save(); refreshTitle(); audioInit(); SFX.ui(); };
$('#pickJill').onclick = () => { G.char = 'jill'; SV.char = 'jill'; save(); refreshTitle(); audioInit(); SFX.ui(); };
$('#pickPom').onclick = () => { audioInit(); if (!SV.pomMet) return; G.char = 'pom'; SV.char = 'pom'; save(); refreshTitle(); SFX.ui(); };
$('#btnMissions').onclick = openMissions; $('#btnShop').onclick = openShop; $('#btnZukan').onclick = openZukan; $('#btnHow').onclick = openHow; $('#btnStamps').onclick = openStamps;
$('#btnSet').onclick = openSettings;
$('#btnRank').onclick = () => openRanking('month'); $('#btnRank2').onclick = () => { hideAll(); show('sTitle'); setupTitle(); refreshTitle(); openRanking('month'); };
$('#btnLangTop').onclick = () => { SFX.ui(); openPanel('LANGUAGE', t('langPick'), `<div class="langpick">${LANGS.map(l => `<button class="buy${LANG === l ? '' : ' off'}" data-langpick="${l}" lang="${({ zh: 'zh-Hant' })[l] || l}">${LANG_NAME[l]}</button>`).join('')}</div>`); };
/* 下の小さい言語ボタンはやめた：右上の地球ボタンだけ（2026-11-10 オーナーの判断） */
$('#pClose').onclick = closePanel;
$('#sPanel').addEventListener('click', e => {
  const up = e.target.closest('[data-up]'), buy = e.target.closest('[data-buy]'), mg = e.target.closest('[data-mug]'), z = e.target.closest('[data-z]'), sst = e.target.closest('[data-s]');
  if (e.target === $('#sPanel')) { closePanel(); return; }
  if (up) { const k = up.dataset.up, c = UPG_COST[SV.upg[k] || 0]; if (SV.bank >= c && (SV.upg[k] || 0) < 5) { SV.bank -= c; SV.upg[k] = (SV.upg[k] || 0) + 1; save(); SFX.power(); $('#pBody').innerHTML = shopHTML(); } }
  if (buy) { const k = buy.dataset.buy; if (k === 'clover' && SV.bank >= 500) { SV.bank -= 500; SV.clovers++; } if (k === 'mug' && SV.bank >= 1500) { SV.bank -= 1500; SV.mug = true; SV.mugOn = true; SV.wear.ren.hat = ''; applyWear(); }
    const c = CLOSET.find(x => x.id === k); if (c && c.lg == null && !c.ev && !SV.closet[c.id] && SV.bank >= c.cost) { SV.bank -= c.cost; SV.closet[c.id] = 1; SV.wear[c.who][c.slot] = c.v; if (c.slot === 'hat' && c.who === 'ren') SV.mugOn = false; applyWear(); } save(); SFX.power(); $('#pBody').innerHTML = shopHTML(); }
  { const lgb = e.target.closest('[data-lg]'); if (lgb) { const k = lgb.dataset.lg; if (k === 'mode' && legendOn('mode')) SV.lgMode = SV.lgMode ? 0 : 1; if (k === 'aura' && legendOn('aura')) SV.lgAura = SV.lgAura === 0 ? 1 : 0; save(); SFX.ui(); $('#pBody').innerHTML = shopHTML(); } }
  if (mg) { SV.mugOn = !SV.mugOn; if (SV.mugOn) { SV.wear.ren.hat = ''; applyWear(); } save(); SFX.ui(); $('#pBody').innerHTML = shopHTML(); }
  const wr = e.target.closest('[data-wear]'); if (wr) { const c = CLOSET.find(x => x.id === wr.dataset.wear); if (c && SV.closet[c.id]) { const cur = SV.wear[c.who][c.slot]; SV.wear[c.who][c.slot] = cur === c.v ? (SLOT_DEF[c.slot] || '') : c.v; if (c.slot === 'hat' && c.who === 'ren' && SV.wear.ren.hat) SV.mugOn = false; save(); applyWear(); SFX.ui(); $('#pBody').innerHTML = shopHTML(); } }
  if (z) { SFX.ui(); $('#pBody').innerHTML = zukanHTML(z.dataset.z); }
  if (sst) { SFX.ui(); $('#pBody').innerHTML = stampsHTML(sst.dataset.s); }
  { const lp = e.target.closest('[data-langpick]'); if (lp && LANGS.includes(lp.dataset.langpick)) { LANG = lp.dataset.langpick; SV.lang = LANG; save(); refreshTitle(); SFX.ui(); closePanel(); return; } }
  { const lb = e.target.closest('[data-lang]'); if (lb && LANGS.includes(lb.dataset.lang)) { LANG = lb.dataset.lang; SV.lang = LANG; save(); refreshTitle(); SFX.ui(); openPanel('SETTINGS', t('settings'), settingsHTML()); } }
  { const pr = e.target.closest('[data-prac]'); if (pr) { SFX.ui(); G.practiceNext = pr.dataset.prac; closePanel(); hideAll(); startRun(); return; } }
  const op = e.target.closest('[data-opt]');
  if (op) { const k = op.dataset.opt; let v = op.dataset.v; if (v === 'true') v = true; else if (v === 'false') v = false; SV.opt[k] = v; save(); audioInit(); applyAudioOpt(); applyLook(); SFX.ui(); $('#pBody').innerHTML = settingsHTML(); }
  const rt = e.target.closest('[data-rt]'); if (rt) openRanking(rt.dataset.rt);
  if (e.target.id === 'nickSave') saveNick();
  if (e.target.id === 'nameOk') nameDone(1);
  if (e.target.id === 'nameLater') nameDone(0);
  if (e.target.id === 'btnNameSet') openName(0);
  if (e.target.id === 'btnTut') { SV.tutDone = 0; save(); e.target.textContent = t('resetDone'); }
  if (e.target.id === 'btnXferMake') { saveNow(); xferMake().then(code => { const o = $('#xferOut'); o.hidden = false; o.value = code; o.select(); try { navigator.clipboard.writeText(code).catch(() => { }); } catch (x) { } $('#xferMsg').textContent = t('xferCopied'); }).catch(() => { $('#xferMsg').textContent = t('xferBad'); }); }
  if (e.target.id === 'btnCode') { redeemCode($('#codeIn').value); return; }
  if (e.target.id === 'btnLinkMake') { linkMake(); return; }
  if (e.target.id === 'btnLinkCopy') { const u = $('#linkOut').dataset.url; copyText(u).then(ok => { $('#linkMsg').textContent = ok ? t('linkCopied') : u; }); if (navigator.share && SHARE.phone()) navigator.share({ url: u }).catch(() => { }); return; }
  if (e.target.id === 'btnLinkGo') { linkLook($('#linkIn').value); return; }
  if (e.target.id === 'btnLinkYes') { linkApply(); return; }
  if (e.target.id === 'btnLinkNo') { $('#linkAsk').hidden = true; return; }
  if (e.target.id === 'btnReset') { $('#resetAsk').hidden = false; $('#btnReset').hidden = true; $('#btnResetNo').focus(); return; }
  if (e.target.id === 'btnResetNo') { $('#resetAsk').hidden = true; $('#btnReset').hidden = false; return; }
  if (e.target.id === 'btnResetYes') { resetAll(); return; }
  if (e.target.id === 'btnXferLoad') { xferLoad(e.target); return; }
});
const toggleMute = () => { audioInit(); setMute(!SV.mute); applyLang(); };
$('#btnMute').onclick = toggleMute; $('#btnMute2').onclick = toggleMute;
$('#pauseBtn').onclick = pause; $('#btnResume').onclick = resume;
/* 一時停止の「やめる」は2回押し（つづけるのとまちがえて押すと、その回が終わってしまっていた）2026-11-09 qa/quitconfirm */
let QUITASK = 0;
$('#btnQuit').onclick = () => { const q = $('#btnQuit'); if (performance.now() - QUITASK > 3000) { QUITASK = performance.now(); q.textContent = t('quitSure'); q.classList.add('danger'); setTimeout(() => { if (performance.now() - QUITASK >= 2900) { q.textContent = t('quit'); q.classList.remove('danger'); } }, 3000); return; }
  QUITASK = 0; q.textContent = t('quit'); q.classList.remove('danger'); G.mode = 'dead'; G.cause = 'quit'; endRun(); };
$('#btnRvClover').onclick = () => { clearInterval(rvTimer); doRevive($('#btnRvClover').dataset.free ? 'free' : 'clover'); };
$('#btnRvHay').onclick = () => { clearInterval(rvTimer); doRevive('hay'); };
$('#btnRvNo').onclick = () => { clearInterval(rvTimer); hideAll(); endRun(); };
$('#btnAgain').onclick = () => { hideAll(); startRun(); };
$('#btnKuji').onclick = () => {
  const b = $('#btnKuji'); if (b.disabled) return; b.disabled = true; audioInit(); SFX.ui();
  b.textContent = tr('カラカラ…', 'Shaking…');
  setTimeout(() => { const k = drawKuji(); const i = KUJI.indexOf(k); SFX.mission();
    $('#kujiRes').innerHTML = `<div class="slip"><b>${tr(k[0], k[0])}</b><p><small>${k[1]}</small>${esc(tr(KUJI_MSG.ja[i], KUJI_MSG.en[i]))}<br>${tr('チモシー', 'Hay')} +${k[3]}${k[4] ? (tr('・お守り +1', ' · charm +1')) : ''}</p></div>`;
    b.textContent = tr('また次のランで', 'Another fortune next run!'); }, 700);
};
$('#btnMenu').onclick = () => { SFX.ui(); goTitle(); };
document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[data-fol]'); if (a && !SV.fol) { SV.fol = 1; save(); } });
$('#btnShare').onclick = () => { SFX.ui(); shareMore(); };

/* ================= boot ================= */
let last = performance.now();
let perfAcc = 0, perfN = 0, lowQ = 0;
// the loop must never die: an error in one frame is reported once and the next frame goes on
let FRAME_ERRS = 0, FRAME_BAD = 0;
function frame(now) {
  try { frameBody(now); FRAME_BAD = 0; } catch (e) { FRAME_ERRS++; window.__frameErr = (window.__frameErr || 0) + 1; window.__frameErrMsg = String(e && e.message || e); if (FRAME_ERRS < 4) console.error('frame error', e); try { for (let i = 0; i < 12; i++) ctx.restore(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; } catch (e2) { } frameTrouble(); }
  requestAnimationFrame(frame);
}
// the picture breaks off frame after frame (on a phone: usually out of picture memory): free the kept pictures, then draw more simply;
// if it still cannot be drawn, the run ends the normal way rather than leave a frozen, half-drawn screen
function frameTrouble() {
  FRAME_BAD++;
  if (FRAME_BAD === 3 || FRAME_BAD % 60 === 0) { try { freePictures(); } catch (e) { } }
  if (FRAME_BAD === 30 && !lowQ) { lowQ = 1; DPR = 1; try { resizeKeep(); } catch (e) { } }
  if (FRAME_BAD >= 150 && G.mode === 'play') { FRAME_BAD = 0; errLog('draw trouble ' + (G.drawRetry || 0)); if ((G.drawRetry || 0) < 2) { G.drawRetry = (G.drawRetry || 0) + 1; try { freePictures(); } catch (e) { } lowQ = 2; DPR = 1; try { resizeKeep(); } catch (e) { } return; } finishRun('draw'); } // 絵が描けないときも、まずは軽くして2回までやり直す（すぐ終わらせない）
}
function frameBody(now) {
  const raw = (now - last) / 1000, dt = Math.min(.05, Math.max(0, raw)); last = now; // never backwards (the first frame after a countdown can be stamped a hair before it)
  if (G.mode === 'play' && raw < .25) { perfAcc += raw; perfN++; if (perfN >= 90) { const avg = perfAcc / perfN; perfAcc = perfN = 0; if (avg > 1 / 42 && lowQ < 2 && !G.lockQ) { lowQ++; if (lowQ === 1) { DPR = 1; resizeKeep(); } } } }
  TEXN = 0; TEXB = performance.now() + 3;
  { let bad = null; if (G.mode !== 'pause' && G.mode !== 'dead' && G.mode !== 'result') { try { update(dt); } catch (e) { bad = e; } }
    if (bad) reportErr(bad); runGuard(Math.min(.1, Math.max(0, raw)), bad); } // a broken frame still draws, and the safety net looks at every frame
  // battery: while paused nothing on the stage moves, so it is drawn only a couple of times a second (2026-11-08)
  if (G.mode !== 'pause' || now - (G.pauseDrawT || 0) > 500) { G.pauseDrawT = now; render(); }
  if (G.mode === 'play') texWarm(Math.max(0, Math.min(3, TEXB - performance.now())));
  if (G.capture && G.capture.t <= 0) { takePhoto(G.capture.tid); G.capture = null; }
  if (G.mode === 'title') { drawCharCard($('#cvRen'), 'ren', G.t); drawCharCard($('#cvJill'), 'jill', G.t + 1.3); if (SV.pomMet) drawCharCard($('#cvPom'), 'pom', G.t + .6); }
  if (SAVE_DIRTY && G.mode !== 'play' && G.mode !== 'countdown') saveNow();
  musicTick(); padTick();
}
// ゲームパッド（C-13）：十字キー・左スティックで操作、A でジャンプ、B でスライディング、スタートで一時停止
const PAD = { prev: {} };
function padTick() { let gp = null; try { const l = navigator.getGamepads ? navigator.getGamepads() : []; for (const g of l) if (g && g.connected) { gp = g; break; } } catch (e) { return; } if (!gp) return;
  const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed), ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  const now = { up: b(12) || b(0) || ay < -.6, down: b(13) || b(1) || ay > .6, left: b(14) || ax < -.6, right: b(15) || ax > .6, start: b(9) };
  for (const k of ['up', 'down', 'left', 'right']) if (now[k] && !PAD.prev[k] && G.mode === 'play') { act(k); G.padN = (G.padN || 0) + 1; }
  if (now.start && !PAD.prev.start) { if (G.mode === 'play') pause(); else if (G.mode === 'pause') resume(); }
  PAD.prev = now; }
addEventListener('pagehide', () => { try { saveNow(); } catch (e) { } });
// a computer: clicking another window (the game keeps running behind it) pauses, like switching tabs does (2026-11-08)
addEventListener('blur', () => { try { if (G.mode === 'play' && !matchMedia('(pointer:coarse)').matches) pause(); } catch (e) { } });
function resizeKeep() { cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
function boot() {
  applyLook();
  buildItemSprites(); buildWorldSprites(); buildBunnies(); applyWear(); rankIcons(); rankInit(); chatInit(); resize(); { let rz = 0; const later = () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { G.resizeN = (G.resizeN || 0) + 1; resize(); }); }; addEventListener('resize', later); addEventListener('orientationchange', later); } // 画面を回したとき、描き直しは 1 回だけ（C-63）
  $('#hHayIco').src = SPR_URL.hay; $('#tHayIco').src = SPR_URL.hay;
  G.char = SV.char || 'ren'; missionsFix();
  goTitle(); document.documentElement.classList.remove('booting'); // the page shows only once its words are in the player's language
  dailyBonus(); document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && G.mode === 'title') dailyBonus(); }); // a phone that keeps the app open past midnight gets the next day's bonus when it comes back
  { // an event has ended: whoever still wears its gift goes back to their usual look once (the gift stays in the Shop and can be worn again)
    if (SV.lastEv !== EVENT) { let off = 0; for (const c of CLOSET) if (c.ev && c.ev !== EVENT && SV.wear[c.who] && SV.wear[c.who][c.slot] === c.v && !CLOSET.some(d => d !== c && d.who === c.who && d.slot === c.slot && d.v === c.v && (d.ev === EVENT || (!d.ev && SV.closet[d.id])))) { SV.wear[c.who][c.slot] = SLOT_DEF[c.slot] || ''; off = 1; } if (off) applyWear(); } // also on the first start after this update (saves without lastEv)
    if (SV.lastEv !== EVENT) { SV.lastEv = EVENT; save(); } }
  { const lg = legendGrant(); if (lg) { refreshTitle(); toastTitle(lg); } } // already a Legendary bunny before this update: the perks arrive now
  if (EVENT) { const gifts = CLOSET.filter(c => c.ev === EVENT && !SV.closet[c.id]); if (gifts.length) { for (const c of gifts) SV.closet[c.id] = 1; save(); const g = (EVENT_INFO.gift || EV_KITS[EVENT].gift), until = EVENT_INFO.to ? t('untilMD', +EVENT_INFO.to.slice(5, 7), +EVENT_INFO.to.slice(8, 10)) : ''; toastTitle(L(g) + until); } }
  loadFeed(); linkFromUrl(); inAppCard(); freshCard();
  setTimeout(() => { try { if (!CLOUD_SPR.length) buildCloudSprites(); if (!FTEX.asphalt) buildFloorTex(); } catch (e) { } }, 1200); // ready before the first street
  requestAnimationFrame(frame);
}
/* ---- SNS × game: a small feed (the latest episode and secret words) published next to the app (feed.json) ----
   The automation updates feed.json after each post; the game shows the latest episode on the title screen and
   lets players redeem the secret word from a post. Words are stored hashed (SHA-256 of the word in capitals). */
const FEED_URL = (window.HAYDASH_APP ? './' : 'https://hay-dash.coana.co.jp/') + 'feed.json';
let FEED = null; try { FEED = JSON.parse(localStorage.getItem('rjFeed') || 'null'); } catch (e) { }
function loadFeed() { try { fetch(FEED_URL + '?t=' + Math.floor(Date.now() / 36e5), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => { if (!j || typeof j !== 'object') return; FEED = j; try { localStorage.setItem('rjFeed', JSON.stringify(j)); } catch (e) { } feedCard(); }).catch(() => { }); } catch (e) { } }
function quietLine(id, html) { // one small line under START: a first-time player sees the game first, never a wall of notices
  let el = $('#' + id); if (el) return el; el = document.createElement('p'); el.className = 'quiet'; el.id = id; el.innerHTML = html;
  const after = $('#tDaily') || $('#btnStart'); after.parentNode.insertBefore(el, after.nextSibling); return el;
}
function dailyBonus() { // once a day: hay for coming to work, more for each day in a row (up to 7)
  const td = todayStr();
  if (SV.daily !== td) { const y = new Date(Date.now() - 864e5); const ys = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate(); SV.streak = SV.daily === ys ? SV.streak + 1 : 1; SV.daily = td; const b = 30 + Math.min(7, SV.streak) * 20; SV.bank += b; save(); refreshTitle(); toastTitle(SV.streak > 1 ? t('daily', SV.streak, b) : t('daily1', b)); /* 連続日数は本当の日数（ボーナスは7日分まで）。1日目は「1日連続」と言わない */ }
}
function inAppCard() { // inside an app's built-in browser the game would start a second account: offer the phone's own browser, quietly
  if (!window.HAYDASH_APP || !/^https?:/.test(location.href)) return; const ua = navigator.userAgent || '', line = /\bLine\//i.test(ua), other = /Instagram|FBAN|FBAV|FB_IAB|Twitter|TwitterAndroid|\bKAKAOTALK/i.test(ua);
  if (!line && !other) return;
  // the way out of each app's browser: LINE takes a flag; on Android any app hands the page to Chrome; on iPhone (iOS 17+) Safari opens from its own link form
  const here = location.href.split('#')[0] + (LINK_Q ? (location.href.split('#')[0].includes('?') ? '&' : '?') + 'link=' + LINK_Q : ''), android = /Android/i.test(ua), ios = /iPhone|iPad|iPod/i.test(ua);
  const go = line ? extOpen(here) : android ? 'intent://' + here.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;end' : ios ? 'x-safari-' + here : '';
  const el = quietLine('tInApp', `<span>${esc(t(line ? 'inAppLine' : 'inAppOther'))}</span> <a id="inAppGo" href="${esc(go || '#')}" title="${esc(t('inAppNote'))}">${esc(t('inAppGo'))} ›</a><small id="inAppHow" hidden>${esc(t('inAppNote'))}${line ? '' : ' ' + esc(t('inAppHow'))}</small>`);
  // if the app keeps the page (the link did nothing), explain once, still small
  $('#inAppGo').addEventListener('click', e => { if (!go) e.preventDefault(); setTimeout(() => { const h = $('#inAppHow'); if (h && document.visibilityState === 'visible') h.hidden = false; }, go ? 1500 : 0); });
}
function freshCard() { // a brand-new browser or home-screen app: if they played somewhere else, one tap to bring that account here
  const go = n => { if (!RANK.ready) { if (n < 40) setTimeout(() => go(n + 1), 250); return; } if (!linkOn() || (SV.runs || 0) > 0 || LINK_Q || G.mode !== 'title' || $('#tFresh') || $('#tInApp')) return;
    quietLine('tFresh', `<span>${esc(t('freshH'))}</span> <a id="freshGo" href="#">${esc(t('freshGo'))} ›</a>`);
    $('#freshGo').onclick = e => { e.preventDefault(); openSettings(); const h = $('#linkInH'), i = $('#linkIn'); if (h) { h.classList.add('hl'); (h.closest('.link') || h).scrollIntoView({ block: 'start' }); } if (i) setTimeout(() => i.focus({ preventScroll: true }), 300); };
  }; go(0);
}
function chalCard() { // a friend sent you their score: show it right above the START button
  let el = $('#tChal'); const on = CHAL && !CHAL.won; if (!on) { if (el) el.hidden = true; return; }
  if (!el) { el = document.createElement('div'); el.id = 'tChal'; el.className = 'chalcard'; el.setAttribute('role', 'note'); const b = $('#btnStart'); b.parentNode.insertBefore(el, b); }
  el.hidden = false; const ic = RANK_ICON[CHAL.c] || ''; el.innerHTML = `${ic ? `<img src="${ic}" alt="">` : ''}<span><small>${esc(t('chalCard'))}</small><b>${esc(t('chalBody', fmt(CHAL.s)))}</b></span>`;
}
function feedCard() {
  let el = $('#tFeed'); const e = FEED && FEED.latest; if (!e || !e.url || !/^https:\/\//.test(e.url)) { if (el) el.hidden = true; return; }
  if (!el) { el = document.createElement('a'); el.id = 'tFeed'; el.target = '_blank'; el.rel = 'noopener'; el.className = 'feedcard'; const c = $('#tCareer'); if (!c) return; c.parentNode.insertBefore(el, c.nextSibling); }
  const fresh = /^\d{4}-\d\d-\d\d$/.test(e.date || '') && Date.now() - new Date(e.date + 'T00:00:00+09:00').getTime() < 7 * 864e5;
  el.hidden = false; el.href = e.url; el.innerHTML = `${fresh ? '<em class="newtag">NEW</em>' : ''}<small>${esc(t('feedNew'))}</small><b>${esc(e[LANG] || (LANG === 'ja' ? (e.ja || e.en) : (e.en || e.ja)) || '')}</b><i>▶</i>`;
}
/* ---- Follow Ren & Jill: the official profiles as plain text links (title, settings, result). Never a popup. ---- */
function followLinks(kind) {
  const a = (u, txt) => `<a href="${esc(u)}" target="_blank" rel="noopener" data-fol="1">${esc(txt)}</a>`;
  const links = SNS.map(s => a(s.url, s.name)).concat(a(SITE_REF, t('followSite')));
  return kind === 'chips' ? `<div class="fol-chips" role="group" aria-label="${esc(t('follow'))}">${links.join('')}</div>` : `<span class="fol-h">${esc(t('follow'))}</span> ${links.join(' · ')}`;
}
function latestEpisode() { const e = FEED && FEED.latest; return e && e.url && /^https:\/\//.test(e.url) ? e : null; }
// the result screen: the newest episode and the profiles; after a good run, one friendly line (at most every 3 days, never once they have followed a link)
function resultFollow(good) {
  const box = $('#resFollow'); if (!box) return; const ep = latestEpisode();
  const ask = good && !SV.fol && Date.now() - (SV.folAt || 0) > 3 * 864e5; if (ask) { SV.folAt = Date.now(); save(); }
  box.innerHTML = (ask ? `<p class="fol-ask">${esc(t('followAsk'))}</p>` : '') +
    (ep ? `<a class="fol-ep" href="${esc(ep.url)}" target="_blank" rel="noopener"><i aria-hidden="true">▶</i><span><small>${esc(t('watchNew'))}</small><b>${esc(ep[LANG] || (LANG === 'ja' ? (ep.ja || ep.en) : (ep.en || ep.ja)) || '')}</b></span></a>` : '') +
    `<b class="fol-t">${esc(t('follow'))} <small>${esc(SNS_HANDLE)}</small></b>${followLinks('chips')}`;
  box.classList.toggle('glow', ask);
}
async function sha256Hex(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
async function redeemCode(raw) {
  const msg = $('#codeMsg'), w = String(raw || '').normalize('NFKC').trim().toUpperCase().replace(/\s+/g, ''); if (!w) return;
  if (!FEED || !Array.isArray(FEED.codes)) { msg.textContent = t('codeOff'); loadFeed(); return; }
  let h = ''; try { h = await sha256Hex(w); } catch (e) { msg.textContent = t('codeBad'); return; }
  SV.codes = SV.codes || {}; if (SV.codes[h]) { msg.textContent = t('codeUsed'); return; }
  const today = todayStr(), c = FEED.codes.find(x => x && x.h === h && (!x.until || x.until >= isoDay()));
  if (!c) { msg.textContent = t('codeBad'); return; }
  const hay = Math.max(0, Math.min(3000, c.hay | 0)); SV.codes[h] = today; SV.bank += hay;
  if (c.item && CLOSET.find(x => x.id === c.item)) SV.closet[c.item] = 1;
  save(); refreshTitle(); SFX.ui(); msg.textContent = t('codeGot', fmt(hay)); $('#codeIn').value = '';
}
const isoDay = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const TOASTQ = [];
function toastTitle(msg) { // one message at a time (the login bonus, a seasonal gift and a promotion used to land on top of each other)
  if (!msg) return; TOASTQ.push(msg); if (TOASTQ.length === 1) toastNext(); }
function toastNext() { const msg = TOASTQ[0]; if (msg == null) return; const d = document.createElement('div'); d.className = 'toast ttoast'; d.style.cssText = 'pointer-events:none;position:fixed;left:0;right:0;margin:0 auto;width:max-content;max-width:min(86vw,560px);top:calc(54px + env(safe-area-inset-top,0px));z-index:5;animation:pop .35s both, fade .5s ease-in 3.5s forwards'; d.innerHTML = '<span class="ja"></span>'; d.firstChild.textContent = msg; $('#app').appendChild(d); setTimeout(() => { if (!d.isConnected) return; d.remove(); TOASTQ.shift(); toastNext(); }, 4200); }
function toastClear() { TOASTQ.length = 0; document.querySelectorAll('.ttoast').forEach(d => d.remove()); } // the title's messages never follow you into the run
/*TEST-ONLY*/
window.__hayDash = { ev: s => eval(s), BUN, addObs: (seg, t, s, l) => makeObs(seg, t, s, l), markSeen: t => markSeen(t), THEMES, chatRules: () => chatRules(), dbg2: () => { const out = []; computeLight(G.segs[G.ci]); camPrep(); for (const sg of segOrder()) { for (const f of sg.floor.concat(sg.walls.map(w => Object.assign({ wall: 1 }, w)), sg.decos.map(w => Object.assign({ deco: 1 }, w)))) { const m = project(f.v); if (!m) continue; const n = Math.abs(m); let inside = false; const px = W / 2, py = H * .62; for (let i = 0, j = n - 1; i < n; j = i++) { const xi = SCR[i * 2], yi = SCR[i * 2 + 1], xj = SCR[j * 2], yj = SCR[j * 2 + 1]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside; } if (inside) { const sv = []; for (let i = 0; i < f.v.length; i += 3) { const dx = f.v[i] - sg.sx, dz = f.v[i + 2] - sg.sz; sv.push([+(dx * sg.f[0] + dz * sg.f[1]).toFixed(1), +(dx * sg.r[0] + dz * sg.r[1]).toFixed(1)]); } out.push({ seg: sg.id, wall: f.wall, deco: f.deco, pat: f.pat, c: f.c, cur: sg === G.segs[G.ci], len: sg.len, turn: sg.turn, turnIn: sg.turnIn, m, sv }); } } } return JSON.stringify({ G: [G.s, G.lat, G.ci], cam: [CAM.x, CAM.z], out: out.slice(0, 8) }); }, G, act, ITEMS, THEMES, makeObs, startFever, dayPlan, resetRoutes, dbg: () => { const sg = G.segs[G.ci]; computeLight(sg); camPrep(); const camS = (CAM.x - sg.sx) * sg.f[0] + (CAM.z - sg.sz) * sg.f[1]; const out = { camS, Gs: G.s, camY: CAM.y, pitch: CAM.pitch };
    out.q = sg.floor.filter(p => p.mid && p.a < camS + 6 && p.b > camS - 3).map(p => ({ a: p.a, b: p.b, ti: p.ti, m: project(p.v), d: +depthOf(p.v).toFixed(2), y: [SCR[1] | 0, SCR[3] | 0, SCR[5] | 0, SCR[7] | 0] })); return JSON.stringify(out); }, setQ: q => { lowQ = q; G.lockQ = 1; }, prof: () => { // timing of one frame's parts, for tests
    const seg = G.segs[G.ci]; const T = {}; const tm = (k, f) => { const t0 = performance.now(); f(); T[k] = +(performance.now() - t0).toFixed(2); };
    PROF.on = 1; for (const k in PROF) if (k !== 'on') PROF[k] = 0; computeLight(seg); camPrep(); tm('sky', () => drawSky(seg)); for (const sg of segOrder()) tm('seg_' + sg.tid + (sg === seg ? '*' : ''), () => drawSegment(sg, sg === seg)); tm('fx', drawFX); tm('post', postFX); PROF.on = 0; return Object.assign(T, PROF); }, get SV() { return SV; } }; window.__die = die;
G.jumpTo = (tid, clock, day, next) => { // test helper
  const s0 = newSeg(null, { t: tid, d: 30 }, { t0: clock || 600, day: day || 1 }); G.segs = [s0]; G.ci = 0; G.s = 0; G.lane = 1; G.lat = 0; G.fork = null; G.plan = next ? [{ t: next, d: 30 }, { t: next, d: 30 }, { t: next, d: 30 }] : dayPlan(1).filter(x => !x.fork); G.planClock = s0.t1; ensureSegs();
  const p = segPos(s0, 0, 0); G.rx = p[0]; G.rz = p[1]; G.camYaw = 0; G.ey = G.camE = null; G.invT = 99; G.mode = 'play'; onEnterSeg(s0); };
G.testFork = () => { // test helper: put the player just before the lunch fork
  const plan = dayPlan(1); const i = plan.findIndex(x => x.fork); const fk = plan[i];
  const s0 = newSeg(null, { t: 'meeting', d: 60 }, { t0: 660, day: 1, fork: fk.fork, empty: true }); s0.forkLbl = forkLabels(fk.fork);
  G.segs = [s0]; G.ci = 0; G.fork = null; G.s = s0.len - 30; G.lane = 1; G.lat = 0; G.plan = plan.slice(i); G.planClock = s0.t1; G.planDay = 1; ensureSegs();
  const p = segPos(s0, G.s, 0); G.rx = p[0]; G.rz = p[1]; G.camYaw = 0; G.ey = G.camE = null; G.invT = 0; G.mode = 'play';
};
/*END-TEST-ONLY*/
boot();
