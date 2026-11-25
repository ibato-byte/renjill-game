/* ================= screens ================= */
const SCREENS = ['sTitle', 'sPanel', 'sPause', 'sRevive', 'sResult', 'hud'];
function hideAll() { SCREENS.forEach(id => { $('#' + id).hidden = true; }); }
function show(id) { $('#' + id).hidden = false; }
function goTitle() { hideAll(); setupTitle(); show('sTitle'); refreshTitle(); try { titleMusic(); } catch (e) { } }
function applyLang() {
  { const a = $('#tGuide'); if (a) { a.textContent = tr('遊び方・キャラクター紹介', 'How to play & characters'); a.href = window.HAYDASH_APP ? (tr('./guide.html', './guide-en.html')) : 'https://hay-dash.coana.co.jp/' + (tr('guide', 'guide-en')); if (window.HAYDASH_APP) a.removeAttribute('target'); } }
  { const a = $('#tSite'); if (a) { a.textContent = tr('TOKYO USAGI OFFICE 公式サイト', 'Tokyo Usagi Office official site'); a.href = SITE_REF; } } { const f = $('#tFollow'); if (f) f.innerHTML = followLinks(); } // タイトル画面の下の小さな文字：アニメの公式サイト（2026-10-31 オーナー指示）
  document.documentElement.lang = ({ zh: 'zh-Hant', ko: 'ko' })[LANG] || LANG; $('#cv').setAttribute('aria-label', tr('東京うさぎオフィスのチモシーダッシュ', 'Tokyo Usagi Office: Hay Dash'));
  /* 2026-11-15（オーナー：文字が多い）：題名画面の文字を減らす。①「朝・道中・夜」の説明は、はじめの 3 回だけ ②「前回：○点・○まで到達」はやめる（自己ベストは下に出ている） */
  $('#tStory').innerHTML = t('story'); $('#tStory').hidden = (SV.runs || 0) >= 3; const lr = $('#tLast'); lr.hidden = true; $('#tSub').textContent = tr('東京うさぎオフィス　チモシーダッシュ', 'Two office bunnies, one mad dash across Tokyo');
  cardTxt('#tRenRole', t('renRole')); cardTxt('#tRenPerk', t('renPerk') + (SV.bond ? '・' + t('bondLbl', bondLv()) : '')); cardTxt('#tJillRole', t('jillRole')); cardTxt('#tJillPerk', t('jillPerk') + (SV.bond ? '・' + t('bondLbl', bondLv()) : '')); { const met = !!SV.pomMet; cardTxt('#tPomRole', t('pomRole')); cardTxt('#tPomPerk', t('pomPerk')); $('#pickPom').hidden = !met; $('#pickPom').parentNode.classList.toggle('three', met); } // the rookie stays a secret until you have met him on the road
  $('#tMis').textContent = t('missions'); $('#tSta').textContent = t('stamps'); $('#tBook').textContent = t('book'); $('#tShop').textContent = t('shop'); $('#tHow').textContent = t('how');
  $('#tBestL').textContent = t('best'); $('#sTitle .chars').setAttribute('aria-label', t('pickChar')); $('#sResult .shbtns').setAttribute('aria-label', tr('友だちに挑戦状を送ろう', 'Challenge a friend')); $('#sResult .shbtns').setAttribute('role', 'group'); $('#chatIn').setAttribute('aria-label', tr('ゲームについて質問してね', 'Ask about the game')); $('#btnRank').textContent = tr('ランキング', 'Ranking'); $('#btnRank2').textContent = tr('ランキングをもっと見る', 'See the full ranking');  { const lt = $('#btnLangTop'); if (lt) lt.setAttribute('aria-label', t('langLbl', LANG_NAME[LANG])); } $('#pauseBtn').setAttribute('aria-label', t('pauseLbl')); $('#btnSet').setAttribute('aria-label', t('settings')); $('#btnSet').title = t('settings'); for (const id of ['pClose', 'chatClose']) $('#' + id).setAttribute('aria-label', t('close')); $('#tPause').textContent = t('pause'); $('#btnQuit').textContent = t('quit');
  $('#btnRvNo').textContent = t('seeResult'); $('#btnMenu').textContent = t('menu'); { const m = $('#tResMore'); if (m) m.textContent = t('resMore'); } $('#tCopy').textContent = t('copy'); { const sb = $('#tShareBar'); if (sb) sb.textContent = tr('友だちに挑戦状を送ろう', 'Challenge a friend');} $('#tShare').textContent = t('share'); $('#tShareImg').textContent = t('shareImg');
  $('#tKick').textContent = tr('東京うさぎオフィスの', 'TOKYO USAGI OFFICE'); logoBuild(); $('#tSub').textContent = t('tagline'); document.title = t('gameTitle');
  $('#nmRen').textContent = tr('モチ', 'MOCHI'); $('#nmJill').textContent = tr('ユズ', 'YUZU'); $('#nmPom').textContent = tr('クリ', 'KURI'); $('#btnStart').textContent = t('start'); $('#btnAgain').textContent = t('again'); $('#btnResume').textContent = t('resume'); $('#tPauseH').textContent = lab('PAUSE'); $('#tPause').hidden = $('#tPause').textContent === $('#tPauseH').textContent;
  $('#lbScore').textContent = tr('スコア', 'SCORE'); $('#lbTime').textContent = tr('時刻', 'TIME'); $('#lbHay').textContent = tr('チモシー', 'HAY'); $('#resBest').textContent = lab('NEW BEST!');
  $('#btnChat').textContent = $('#btnChat2').textContent = tr('ユズに聞く', 'Ask Yuzu');
  ['btnMute', 'btnMute2'].forEach(id => $('#' + id).textContent = SV.mute ? t('soundOff') : t('soundOn'));
  { const m = $('#btnMute'); m.classList.toggle('off', !!SV.mute); m.setAttribute('aria-label', m.textContent); m.setAttribute('aria-pressed', SV.mute ? 'false' : 'true'); /* 読み上げ：音が出ているかを伝える */ m.title = m.textContent; $('#btnSet').title = tr('設定', 'Settings'); /* PC：絵だけのボタンに、マウスをのせると名前が出る */ $('#btnSet').setAttribute('aria-label', tr('設定', 'Settings')); } /* ホームでは、音と設定は絵のボタン（字は読み上げ用に残す） */
}
// the character cards are narrow: put each part ("課長" / "ホーランドロップ") on its own line, never split a word
function cardTxt(sel, txt) { const el = $(sel); el.textContent = ''; String(txt).split(/\s*[・：:·]\s*/).forEach((p, i) => { if (i) el.appendChild(document.createElement('br')); const s = document.createElement('span'); s.textContent = p; el.appendChild(s); }); }
function refreshTitle() {
  document.documentElement.classList.toggle('cg-fresh', HOST_PORTAL === 'crazygames' && !(SV.runs > 0)); // CrazyGames ではじめての人には、スタートだけの題名（head.html）
  { const lt = $('#tLangTop'); if (lt) lt.textContent = LANG_NAME[LANG]; const bt = $('#btnLangTop'); if (bt) bt.hidden = !$('#sPanel').hidden; }
  refreshNameBtn();
  { const lv = plantLv(); if (lv > (SV.plantLv || 0)) { SV.plantLv = lv; save(); setTimeout(() => toastTitle(t('plantUp')), 1600); } } // 観葉植物が育った（B-12）
  applyLang();
  $('#tBest').textContent = fmt(SV.best); $('#tBank').textContent = fmt(SV.bank); { const bp = $('#tBest').parentNode; if (bp) { bp.setAttribute('aria-label', t('best') + ' ' + fmt(SV.best)); bp.classList.toggle('zero', !SV.best); } } /* まだ走っていない人には、ベストの「0」の札を出さない（ホーム） */ $('#tCareer').innerHTML = careerHTML(); feedCard(); chalCard();
  { const dly = dailyToday(), done = SV.dailyDone === dly.key; $('#tDaily').textContent = (tr('チャレンジ：', 'Challenge: ')) + L(dly.c.t(dly.n)) + (done ? ' ✓' : (tr('（+300本・お守り）', ' (+300 hay, charm)'))); }
  { const q = $('#btnQuick'); if (q) q.remove(); } // 1分ダッシュ（2026-11-08）はやめた（2026-11-15 オーナーの判断）
  try { commShow(); commFetch(); } catch (e) { } // みんなの集計（B-45・47）
  { const e = $('#tHunt'); if (e) e.remove(); } // あいことばのかくれんぼ（B-49）はやめた（2026-11-15 オーナーの判断：何のためにあるのか分かりにくい。SNS の「あいことば」（設定で入れるとチモシーがもらえる）と名前が同じでまぎらわしい）
  { let q = $('#btnRev'); if (!q) { q = document.createElement('button'); q.id = 'btnRev'; q.className = 'sub small quick'; q.onclick = () => { SFX.ui(); G.revNext = 1; hideAll(); startRun(); }; $('#tDaily').after(q); } q.textContent = t('revBtn'); q.hidden = !SV.tutDone || !revDay(); } // 逆走デー（B-37）
  { let q = $('#btnCont'); const cp = cpLoad(); if (!q) { q = document.createElement('button'); q.id = 'btnCont'; q.className = 'sub resume'; q.onclick = () => { SFX.ui(); resumeRun(); }; $('#btnStart').before(q); } q.hidden = !cp; if (cp) q.textContent = t('cpBtn', cp.g.day | 0, fmt(Math.floor(cp.g.score))); } // 途中で閉じてしまった走りのつづき（2026-11-15）
  { const q = $('#btnDuo'); if (q) q.remove(); } // ふたりで交代（B-33）はやめた（2026-11-09 オーナーの判断）
  { let q = $('#btnPractice'); if (!q) { q = document.createElement('button'); q.id = 'btnPractice'; q.className = 'sub small quick'; q.onclick = openPractice; $('#tDaily').after(q); } q.textContent = t('practice'); q.hidden = !SV.tutDone; } // 練習・場所えらび（B-31・B-38）
  { let e = $('#tDayGoal'); if (!e) { e = document.createElement('div'); e.id = 'tDayGoal'; $('#tDaily').after(e); } const n = SV.dayHay && SV.dayHay.d === todayStr() ? SV.dayHay.n : 0, k = Math.min(1, n / DAY_GOAL);
    e.className = 'daygoal' + (n >= DAY_GOAL ? ' done' : ''); e.innerHTML = `<span>${esc(tr('今日のチモシー', 'Hay today'))}</span><i><b style="width:${(k * 100).toFixed(0)}%"></b></i><em>${fmt(Math.min(n, DAY_GOAL))} / ${DAY_GOAL}${n >= DAY_GOAL ? ' ✓' : ''}</em>`; } // today's hay goal (2026-11-08)
  try { kpTitle(); todayGrid(); } catch (e) { reportErr(e); }
  $('#pickRen').setAttribute('aria-pressed', G.char === 'ren'); $('#pickJill').setAttribute('aria-pressed', G.char === 'jill'); $('#pickPom').setAttribute('aria-pressed', G.char === 'pom');
  if (SV.pomMet && !SV.pomTold) { SV.pomTold = 1; save(); setTimeout(() => { if (G.mode === 'title') toastTitle(t('pomUnlock')); }, 600); }
  $('#dotZukan').hidden = Object.keys(SV.zukan).length <= (SV.seenZukan || 0);
  $('#dotStamps').hidden = Object.keys(SV.stamps).length + Object.keys(SV.album).length <= (SV.seenStamps || 0);
  $('#dotMissions').hidden = !(SV.missions && SV.missions.slots.some(s => s.done));
}
let PANEL_FROM = null;
function openPanel(title, sub, html) { if ($('#sPanel').hidden) { const a = document.activeElement; PANEL_FROM = a && a !== document.body && !a.closest('#sPanel') ? a : null; } if (LANG !== 'en' && sub) { title = esc(sub); sub = ''; } document.querySelectorAll('.toast').forEach(x => x.remove()); toastSubBack(); musicMuffle(true); /* メニューを開いている間、曲は少しこもらせる */ if (sub && sub.toUpperCase() === title) sub = ''; $('#pTitle').innerHTML = `${title}<small>${esc(sub)}</small>`; $('#pBody').innerHTML = html; $('#pBody').scrollTop = 0; show('sPanel'); { const lt = $('#btnLangTop'); if (lt) lt.hidden = true; } $('#pClose').focus(); } // 言語ボタンが閉じるボタンにかぶらないよう、パネル中はかくす
function closePanel() { $('#sPanel').hidden = true; musicMuffle(false); { const lt = $('#btnLangTop'); if (lt) lt.hidden = false; } if (G.mode === 'title') refreshTitle(); const f = PANEL_FROM; PANEL_FROM = null; if (f && f.isConnected && !f.closest('[hidden]')) try { f.focus({ preventScroll: true }); } catch (e) { } }

function missionsBody() { return `${mLevelHTML()}<h3 class="msec">${msvg('star')}${tr('いまのミッション', 'Missions')}</h3>${missionHTML(1)}<h3 class="msec">${msvg('sun')}${tr('今日と今週', 'Today & this week')}</h3>${mDailyHTML()}${mWeekHTML()}${calHTML()}${mAchHTML()}`; } /* [ミッション 8] 見出しの絵つきの 3 つのまとまり（いまのミッション・今日と今週・称号） */
function openMissions() { SFX.ui(); ACH_SEL = ''; openPanel('MISSIONS', t('missions'), missionsBody()); }
// the days you came to work: the last four weeks as a little calendar of stamps (2026-11-08)
function calHTML() { const days = new Set(SV.playDays || []), cells = []; const now = new Date(); const ds = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  const start = new Date(now); start.setDate(now.getDate() - 27 - ((now.getDay() + 6) % 7) + 6); // 4 rows of 7, ending this week
  for (let i = 0; i < 28; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const k = ds(d), fut = d > now; cells.push(`<i class="${days.has(k) ? 'on' : ''}${fut ? ' fut' : ''}${k === ds(now) ? ' today' : ''}" title="${d.getMonth() + 1}/${d.getDate()}">${d.getDate()}</i>`); }
  const n = [...days].filter(k => { const [y, m, dd] = k.split('-').map(Number); return (now - new Date(y, m - 1, dd)) / 864e5 < 28; }).length;
  let stk = 0; { const d = new Date(now); if (!days.has(ds(d))) d.setDate(d.getDate() - 1); while (days.has(ds(d)) && stk < 999) { stk++; d.setDate(d.getDate() - 1); } } /* [ミッション 14] いま何日続けて来ているか（炎の絵と日数） */
  return `<div class="m cal mcal"><p><b>${msvg('paw')}${esc(t('calH'))}</b> <span class="n">${esc(t('calN', n))}</span></p>${stk > 1 ? `<span class="mstk">${msvg('fire')}${tr('{0}日つづけて出社', '{0}-day streak').replace('{0}', stk)}</span>` : ''}<div class="calg">${tr('月火水木金土日', 'MTWTFSS').split('').map(w => `<b>${w}</b>`).join('')}${cells.join('')}</div></div>`; }
function shopHTML() {
  const ups = Object.keys(POW).map(k => {
    const lv = SV.upg[k] || 0, cost = UPG_COST[lv], d = POW[k];
    return `<div class="shop-item"><img src="${SPR_URL[d.ico]}" alt=""><p>${esc(L(d))}<small>${t('durNow', (d.base + lv * 1.4).toFixed(1))}${lv < 5 ? ` → ${(d.base + (lv + 1) * 1.4).toFixed(1)}` : t('max')}</small><span class="pips">${[0, 1, 2, 3, 4].map(i => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</span></p>
      <button class="buy" data-up="${k}" ${lv >= 5 || SV.bank < cost ? 'disabled' : ''}>${lv >= 5 ? 'MAX' : `<img src="${SPR_URL.hay}" alt="">${fmt(cost)}`}</button></div>`;
  }).join('');
  const clover = `<div class="shop-item"><img src="${SPR_URL.clover}" alt=""><p>${t('charmName')}<small>${t('charmNote', SV.clovers)}</small></p><button class="buy" data-buy="clover" ${SV.bank < 500 ? 'disabled' : ''}><img src="${SPR_URL.hay}" alt="">500</button></div>`;
  const mug = `<div class="shop-item"><img src="${SPR_URL.mugIcon}" alt=""><p>${t('mugName')}<small>${t('mugNote')}</small></p>${SV.mug ? `<button class="buy" data-mug="1">${SV.mugOn ? t('unwear') : t('wear')}</button>` : `<button class="buy" data-buy="mug" ${SV.bank < 1500 ? 'disabled' : ''}><img src="${SPR_URL.hay}" alt="">1,500</button>`}</div>`;
  const wear = SV.wear || (SV.wear = { ren: { tie: 'gold', hat: '', suit: '' }, jill: { frame: 'brown', hat: '', suit: '' }, pom: { band: 'red', hat: '', suit: '' } }); if (!wear.pom) wear.pom = { band: 'red', hat: '', suit: '' }; SV.closet = SV.closet || {};
  const closet = ['ren', 'jill'].concat(SV.pomMet ? ['pom'] : []).map(who => `<section class="closet-sec"><h3 class="ph" style="font-size:16px;margin:10px 0 4px">${LANG === 'en' ? who.toUpperCase() : tr(({ ren: 'モチ', jill: 'ユズ', pom: 'クリ' })[who], who)}<small>${esc(t('closet'))}</small></h3>${fitHTML(who)}` + closetList(who).map(c => {
    const own = SV.closet[c.id], on = own && wear[who][c.slot] === c.v;
    return `<div class="shop-item${TRYON[who][c.slot] === c.v && !on ? ' trying' : ''}" data-try="${c.id}"><img src="${closetIcon(c)}" alt=""><p>${esc(L(c))}${on ? `<small>${esc(t('wearing'))}</small>` : ''}</p>${own ? `<button class="buy${on ? '' : ' off'}" data-wear="${c.id}">${on ? t('takeOff') : t('putOn')}</button>` : c.lg != null ? `<button class="buy" disabled>${tr('伝説で解放', 'Legend only')}</button>` : `<button class="buy" data-buy="${c.id}" ${SV.bank < c.cost ? 'disabled' : ''}><img src="${SPR_URL.hay}" alt="">${fmt(c.cost)}</button>`}</div>`; }).join('') + '</section>').join('');
  const li = legendInfo(), ja = LANG === 'ja', tg = (k, on, ok) => ok ? `<button class="buy${on ? '' : ' off'}" data-lg="${k}">${on ? (tr('オン', 'On')) : (tr('オフ', 'Off'))}</button>` : `<span class="lock">🔒</span>`;
  const legend = `<div class="legendbox"><h3>${tr('伝説のうさぎ特典', 'Legendary bunny perks')}${li ? ` <small>★${li.stars}</small>` : ''}</h3>${li ? '' : `<p class="note">${tr('最高位「伝説のうさぎ」になると手に入ります。その先も★がふえるたびに特典があります。', 'Reach the top rank, Legendary bunny, to unlock these. Every ★ after that brings more.')}</p>`}
    <div class="row3${li ? '' : ' lock'}"><span>${tr('伝説モード（速さ＋15%・スコア×1.5）', 'Legend mode (15% faster, score x1.5)')}</span>${tg('mode', !!SV.lgMode, legendOn('mode'))}</div>
    <div class="row3${legendOn('aura') ? '' : ' lock'}"><span>${tr('伝説の輝き（★1）', 'Golden sparkle trail (★1)')}</span>${tg('aura', SV.lgAura !== 0, legendOn('aura'))}</div>
    <div class="row3${legendOn('gold') ? '' : ' lock'}"><span>${tr('ランキングの金の名札（★2）', 'Gold name on the ranking (★2)')}</span>${legendOn('gold') ? '✓' : '<span class="lock">🔒</span>'}</div>
    <p class="note">${tr('月桂冠と金の礼服は、下の着せ替えにあります（3匹とも）。★ごとにチモシー2,000本とお守り。', 'The laurel and the gold coat are in the wardrobe below (all three). Every ★: 2,000 hay and a charm.')}</p></div>`;
  return `<div class="bank"><span>${t('bankHave')}</span><span><img src="${SPR_URL.hay}" alt=""> <b>${fmt(SV.bank)}</b></span></div>${ups}${clover}${mug}${legend}${closet}<p class="note">${t('closetNote')}</p><p class="note">${t('shopNote')}</p>`;
}
/* 試着室（2026-11-16。オーナー：「着せかえをしっかり楽しめるように」）：着せかえの列を押すと、買う前でも、鏡の中のキャラクターがその場で着てみせる（前と後ろ）。
   試着は見た目だけ（保存しない・チモシーは減らない）。もう一度押すと脱ぐ。買う・着るを押したら、試着は消える */
const TRYON = { ren: {}, jill: {}, pom: {} };
function fitPics(who) { const keep = Object.assign({}, WEAR[who]), seed = SEED, out = ['', ''];
  try { Object.assign(WEAR[who], (SV.wear || {})[who] || {}, TRYON[who]); const mug = who === 'ren' && SV.mugOn && !WEAR.ren.hat ? 1 : 0;
    SEED = 6; out[0] = paint(g => drawBody(g, who, { lift: 0, sq: 1, feet: 0, ear: 0, view: 'front', mood: Object.keys(TRYON[who]).length ? 'happy' : 'open', mug })).toDataURL();
    SEED = 11; out[1] = paint(g => drawBody(g, who, { lift: 0, sq: 1, feet: 0, ear: 0, tie: 0, tiePh: 0, view: 'back', mug })).toDataURL(); } catch (e) { }
  finally { for (const k in WEAR[who]) delete WEAR[who][k]; Object.assign(WEAR[who], keep); SEED = seed; }
  return out; }
function fitHTML(who) { const [f, b] = fitPics(who); return `<div class="fit" data-fit="${who}" aria-hidden="true"><img class="fit-f" src="${f}" alt=""><img class="fit-b" src="${b}" alt=""></div>`; }
function fitTry(row) { const c = CLOSET.find(x => x.id === row.dataset.try); if (!c) return; const on = TRYON[c.who][c.slot] === c.v; if (on) delete TRYON[c.who][c.slot]; else TRYON[c.who][c.slot] = c.v;
  const sec = row.closest('.closet-sec'); if (!sec) return; const [f, b] = fitPics(c.who), fi = sec.querySelector('.fit-f'), bi = sec.querySelector('.fit-b'); if (fi) fi.src = f; if (bi) bi.src = b;
  const mir = sec.querySelector('.fit'); if (mir) { mir.classList.remove('pop'); void mir.offsetWidth; mir.classList.add('pop'); }
  for (const r of sec.querySelectorAll('[data-try]')) { const k = CLOSET.find(x => x.id === r.dataset.try); r.classList.toggle('trying', !!k && TRYON[k.who][k.slot] === k.v && ((SV.wear || {})[k.who] || {})[k.slot] !== k.v); }
  SFX.ui(); }
const CLOSET_ICON = {};
function closetIcon(c) { // a small picture of the item
  if (CLOSET_ICON[c.id]) return CLOSET_ICON[c.id];
  const cv = mk(128), g = cv.getContext('2d') || noCtx(); g.scale(2, 2); // 2 倍の細かさで描く（小さな絵がぼやけていた）
  { const sh = g.createRadialGradient(32, 56, 1, 32, 56, 20); sh.addColorStop(0, 'rgba(59,42,32,.2)'); sh.addColorStop(1, 'rgba(59,42,32,0)'); g.save(); g.translate(32, 56); g.scale(1, .28); g.translate(-32, -56); g.fillStyle = sh; g.beginPath(); g.arc(32, 56, 20, 0, 7); g.fill(); g.restore(); } // 品物の下に、うすい影
  g.translate(32, 40);
  if (c.slot === 'tie') { const keep = WEAR.ren.tie; WEAR.ren.tie = c.v; g.scale(.7, .7); g.translate(0, -36); tie(g, 0, 0, 60, 0); WEAR.ren.tie = keep; }
  else if (c.slot === 'frame') { const keep = WEAR.jill.frame; WEAR.jill.frame = c.v; g.scale(.9, .9); glasses(g, -14, 14, -6, 12); WEAR.jill.frame = keep; }
  else if (c.slot === 'band') { const keep = WEAR.pom.band; WEAR.pom.band = c.v; g.scale(.55, .55); g.translate(0, -10); headband(g, 0, 0, 48, 0); WEAR.pom.band = keep; }
  else if (c.slot === 'suit') { g.scale(.26, .26); g.translate(0, -20); fur(g, 0, 10, 92, 66, 0, '#E3C29C', '#C7A077'); /* 着ぐるみは体の形に色をのせる描き方なので、先に体を描く（描かないと絵が出ない） */ if (c.v === 'bee') { beeWings(g, 0, -10, .9, -.1); suitOver(g, 'bee', 0, 10, 92, 66); antennae(g, 0, -56, 1.1); } else if (c.v === 'zebra') { suitOver(g, 'zebra', 0, 10, 92, 66); zebraMane(g, 0, -84, 40, 1.2); } else suitOver(g, c.v, 0, 10, 92, 66); }
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
// 走った場所の地図（B-20）：東京の略図（湾・隅田川・山手線の輪）に、行った名所は足あと、まだの所は灰色の点
const MAP_PT = { yamanote: [139.747, 35.646], tokyoeki: [139.767, 35.681], ginza: [139.765, 35.671], yurakucho: [139.762, 35.675], kokyo: [139.756, 35.682], chidori: [139.745, 35.690], nakadori: [139.766, 35.678], omotesando: [139.711, 35.666], gaien: [139.719, 35.675], asakusa: [139.796, 35.711], river: [139.802, 35.704], skytree: [139.811, 35.710], tower: [139.745, 35.659], shibuya: [139.701, 35.659], akihabara: [139.773, 35.698], ameyoko: [139.774, 35.708], ueno: [139.771, 35.715], shinjuku: [139.692, 35.690], kabukicho: [139.703, 35.695], odaiba: [139.775, 35.630],
  subway: [139.739, 35.672], toden: [139.728, 35.735], bayline: [139.781, 35.627], shokudo: [139.760, 35.684], rooftop: [139.764, 35.686], nihonbashi: [139.774, 35.684], tsukiji: [139.770, 35.665], hibiya: [139.756, 35.673], jimbocho: [139.758, 35.696], kagurazaka: [139.739, 35.702], shiodome: [139.760, 35.664], shinbashi: [139.758, 35.666], hamarikyu: [139.763, 35.660], yanaka: [139.766, 35.727], nezu: [139.767, 35.720], dougu: [139.789, 35.712], ryogoku: [139.793, 35.697], kiyosumi: [139.798, 35.681], sumidakoen: [139.804, 35.713], shinobazu: [139.770, 35.712], yakata: [139.798, 35.700],
  sando: [139.699, 35.676], takeshita: [139.703, 35.671], ekimae: [139.699, 35.661], daikanyama: [139.703, 35.649], meguro: [139.698, 35.643], roppongi: [139.731, 35.663], gyoen: [139.710, 35.685], yokocho: [139.698, 35.693], ikebukuro: [139.713, 35.731], shinokubo: [139.700, 35.701], zojoji: [139.748, 35.657], toyosu: [139.793, 35.649], kaihin: [139.774, 35.629], hie: [139.741, 35.674], tsukishima: [139.783, 35.663], kanda: [139.768, 35.702], kuramae: [139.791, 35.704], terrace: [139.794, 35.688], shibamata: [139.877, 35.758], catst: [139.706, 35.666], shimokita: [139.668, 35.661], yoyogi: [139.695, 35.672],
  kichijoji: [139.574, 35.700], takeshiba: [139.762, 35.654], chikagai: [139.768, 35.680], ochanomizu: [139.764, 35.699], koishikawa: [139.749, 35.707], akasaka: [139.737, 35.675], okachimachi: [139.775, 35.707], monzen: [139.796, 35.672], kiba: [139.809, 35.674], ebisu: [139.710, 35.646], nakano: [139.665, 35.707], koenji: [139.649, 35.705], jiyugaoka: [139.669, 35.607], sangenjaya: [139.670, 35.643], yotsuya: [139.729, 35.686], ichigaya: [139.736, 35.692], tennozu: [139.750, 35.622], harumi: [139.774, 35.649], kachidoki: [139.775, 35.663], monorail: [139.748, 35.600], kuko: [139.784, 35.549], kukodeck: [139.790, 35.553] };
/* [ラリー] 2026-11-24 オーナー「東京スタンプラリーのクオリティが低すぎる。地図のクオリティを上げて、この機能を 100 以上ブラッシュアップして」：
   スタンプ帳を「旅のパスポート」に作り直す。上に進み具合の輪と次のごほうび、まん中に絵の地図（都心を大きく見る切りかえ・エリアの色・川・公園・線路・塔の絵）、
   下にエリアごとの棚（色の見出し・進み具合の帯・行った回数・新しいしるし）。文字は少なく、絵と色で分かるように（番号 [ラリー 1]〜 は docs/RALLY-2026-11-24.md） */
const RALLY = { view: 'all', area: 'all', sel: '', sort: 'list' };
/* [ラリー 16] 絵文字ではなく、ゲームの線の太さにそろえた小さな絵（足あと・カレンダー・カメラ・トロフィー・地図・虫めがね・プレゼント） */
const RICO = { foot: '<path d="M7 13c-2 0-3-1.6-3-3.4S5.3 6 7 6s3 1.8 3 3.6S9 13 7 13zM4 5.2a1.3 1.6 0 1 0 0-.1M7 3.6a1.3 1.6 0 1 0 0-.1M10 5.2a1.3 1.6 0 1 0 0-.1" fill="currentColor"/>', cal: '<rect x="2.5" y="3.5" width="11" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2.5 7h11M5.5 2v3M10.5 2v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  cam: '<rect x="2" y="5" width="12" height="8.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="9.2" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5.5 5l1.2-2h2.6l1.2 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>', cup: '<path d="M4.5 2.5h7v3.5a3.5 3.5 0 0 1-7 0zM8 9.5v2.5M5.5 13.5h5M4.5 4H2.5a2 2 0 0 0 2 3M11.5 4h2a2 2 0 0 1-2 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  map: '<path d="M2 4l4-1.5 4 1.5 4-1.5v9.5l-4 1.5-4-1.5-4 1.5z M6 2.5v9.5M10 4v9.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>', zoom: '<circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M10.2 10.2L14 14M5 7h4M7 5v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  gift: '<rect x="2.5" y="6" width="11" height="7.5" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2 6h12M8 6v7.5M8 6C6 2.5 3.5 3.5 5 5.4M8 6c2-3.5 4.5-2.5 3-.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' };
const rico = (k, c) => `<svg class="ric${c ? ' ' + c : ''}" viewBox="0 0 16 16" aria-hidden="true">${RICO[k]}</svg>`;
const RALLY_AREA = [ /* [ラリー 1] エリアの色と名前（ミッションのエリアと同じ分け方。入っていない名所は地図の場所で分ける） */
  { id: 'central', ja: '丸の内・銀座', en: 'Downtown', c: '#D6A23C', ach: 'areaCentral' }, { id: 'east', ja: '下町', en: 'Old town', c: '#C8463C', ach: 'areaEast' },
  { id: 'west', ja: '山の手・西', en: 'West side', c: '#4E77A0', ach: 'areaWest' }, { id: 'bay', ja: '湾岸', en: 'Bayside', c: '#2E9AA6' }, { id: 'far', ja: '郊外・空港', en: 'Further out', c: '#6F9A3E' }];
function rallyArea(id) { for (const a of ['central', 'east', 'west', 'bay']) if (AREA[a] && AREA[a].includes(id)) return a; const p = MAP_PT[id]; if (!p) return 'central'; const [lo, la] = p; /* [ラリー 2] */
  if (lo < 139.68 || la < 35.615 || lo > 139.85 || la > 35.735) return 'far'; if (la < 35.656 && lo >= 139.745) return 'bay'; if (lo >= 139.785 || (la >= 35.698 && lo >= 139.765)) return 'east'; if (lo < 139.735) return 'west'; return 'central'; }
function rallyAreaOf(a) { return RALLY_AREA.find(x => x.id === a) || RALLY_AREA[0]; }
function rallyNext(n, tot) { /* [ラリー 3] 次のごほうび（ミッションの「東京さんぽ」「エリア全部」「東京マスター」から、いちばん近い物） */
  const c = []; if (n < 5) c.push([5 - n, ACH.find(a => a.id === 'stamps5')]);
  for (const a of RALLY_AREA) if (a.ach && !(SV.ach || {})[a.ach]) { const ids = STAMP_ORDER.filter(k => AREA[a.id].includes(k)), left = ids.filter(k => !SV.stamps[k]).length; if (left) c.push([left, ACH.find(x => x.id === a.ach)]); }
  if (n < tot) c.push([tot - n, ACH.find(a => a.id === 'stampsAll')]); c.sort((p, q) => p[0] - q[0]); return c[0] && c[0][1] ? c[0] : null; }
function stampsHTML(sel) {
  if (sel !== undefined) RALLY.sel = sel || ''; sel = RALLY.sel;
  const tot = STAMP_ORDER.length, n = STAMP_ORDER.filter(id => SV.stamps[id]).length, seenT = SV.stampViewT || 0, T = SV.stampT || {}, pct = n / Math.max(1, tot);
  const isNew = id => SV.stamps[id] && T[id] && T[id] > seenT; /* [ラリー 4] 前に開いた時から増えたスタンプ */
  const nNew = STAMP_ORDER.filter(isNew).length; /* [ラリー 26] 新しいスタンプの数 */
  const nx = rallyNext(n, tot), R = 30, C = 2 * Math.PI * R, CODE = { central: 'C', east: 'E', west: 'W', bay: 'B', far: 'F' };
  const cnt = {}; for (const id of STAMP_ORDER) { const a = rallyArea(id); cnt[a] = cnt[a] || [0, 0]; cnt[a][1]++; if (SV.stamps[id]) cnt[a][0]++; }
  /* [ラリー 5] 上の札。[ラリー2 40] 文字の多い茶色の札をやめ、一日乗車券のような「きっぷ」に：左に集めた数の輪、まん中に名前とエリアごとの線、右の半券に次のごほうび（あと何個・チモシーの数）。
     [ラリー2 41] ％の数字・「よく行く」の行・円グラフをやめて、数字は集めた数だけ [ラリー2 42] きっぷの地紋（細い波）と、切り取りの点線・切り欠き */
  const hero = `<div class="rtk${n >= tot ? ' all' : ''}"><div class="rtk-a"><svg viewBox="0 0 76 76" class="rring" aria-hidden="true"><circle cx="38" cy="38" r="${R}" fill="#FFFDF8" stroke="#E6D8BF" stroke-width="7"/><circle cx="38" cy="38" r="${R}" fill="none" stroke="#C4402F" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 38 38)"/></svg><span class="rtk-n"><em>${n}</em><small>/ ${tot}</small></span></div>`
    + `<div class="rtk-b"><b>${tr('東京スタンプラリー', 'TOKYO STAMP RALLY')}</b><span class="rtk-ln" aria-hidden="true">${RALLY_AREA.filter(a => cnt[a.id]).map(a => `<i style="--ac:${a.c};--k:${(cnt[a.id][0] / cnt[a.id][1] * 100).toFixed(0)}%;flex:${cnt[a.id][1]}"></i>`).join('')}</span>${nNew ? `<span class="rnew">NEW ${nNew}</span>` : ''}</div>`
    + `<div class="rtk-c" title="${nx ? esc(L(nx[1].n)) : ''}">${nx ? `${rico('gift')}<span class="rtk-left"><small>${tr('あと', 'left')}</small><em>${nx[0]}</em></span><span class="rtk-hay">+${nx[1].hay}</span>` : `<span class="rtk-star">★</span>`}</div></div>`;
  const sortB = `<div class="rsort"><button class="${RALLY.sort === 'list' ? 'on' : ''}" data-rsort="list">${tr('名所の順', 'By place')}</button><button class="${RALLY.sort === 'visit' ? 'on' : ''}" data-rsort="visit">${rico('foot')}${tr('よく行く順', 'Most visited')}</button></div>`; /* [ラリー 96] 並びを「名所の順」と「よく行く順」で切りかえ */
  /* [ラリー 6] エリアの札。[ラリー2 43] 色の点は、駅の番号の札のような輪と英字（C・E・W・B・F） */
  const chips = `<div class="rchips" role="tablist"><button class="rchip${RALLY.area === 'all' ? ' on' : ''}" data-ra="all">${tr('ぜんぶ', 'All')}</button>${RALLY_AREA.filter(a => cnt[a.id]).map(a => { const [g, m] = cnt[a.id], done = g === m;
    return `<button class="rchip${RALLY.area === a.id ? ' on' : ''}${done ? ' done' : ''}" data-ra="${a.id}" style="--ac:${a.c}"><i class="rcode">${CODE[a.id]}</i>${esc(L(a))}<small>${done ? '★' : g + '/' + m}</small></button>`; }).join('')}</div>`;
  /* [ラリー 7] えらんだスタンプのくわしい札。[ラリー2 44] 大きなスタンプは紙に直に押した絵 [ラリー2 45] 行った回数は足あと 10 個の列（3・5・10 に印）で、「つぎの印まで」の字をやめる [ラリー2 46] 日付は、郵便の日付印のような丸い印 [ラリー2 47] まだの所は「？」ではなく、うすい下絵 [ラリー2 55] 札の右下に、東京のどのあたりかの小さな地図（山手線の輪・湾・赤い点） [ラリー2 56] まだの所の説明の文をやめ、小さな地図で場所を見せる */
  let det = '';
  if (sel && THEMES[sel] && THEMES[sel].stamp) { const st = THEMES[sel].stamp, got = SV.stamps[sel], a = rallyAreaOf(rallyArea(sel)), ph = SV.album && SV.album[sel];
    const gl = STAMP_ORDER.filter(k => SV.stamps[k]), gi = gl.indexOf(sel), nav = got && gl.length > 1 ? `<span class="rnav"><button data-s="${gl[(gi - 1 + gl.length) % gl.length]}" aria-label="${tr('前', 'Previous')}">‹</button><button data-s="${gl[(gi + 1) % gl.length]}" aria-label="${tr('次', 'Next')}">›</button></span>` : ''; /* [ラリー 23] 集めたスタンプを、札の左右のボタンで順に見られる */
    const tag = `<span class="rtag"><i class="rcode" style="--ac:${a.c}">${CODE[a.id]}</i>${esc(L(a))}</span>`, d = T[sel] ? new Date(T[sel]) : null;
    const pips = got ? `<span class="rpips" aria-label="×${+got}">${Array.from({ length: 10 }, (_, i) => `<i class="${i < got ? 'on' : ''}${i === 2 || i === 4 || i === 9 ? ' mk' : ''}"></i>`).join('')}${got > 10 ? `<em>×${got > 99 ? '99+' : got}</em>` : ''}</span>` : '';
    det = got ? `<div class="rdet" style="--ac:${a.c}">${nav}<img class="rbig" data-zst="${sel}" src="${stampURL(sel, 1, 1)}" alt="">${d ? `<span class="rdate" aria-label="${esc(d.toLocaleDateString())}"><small>TOKYO</small><b>${String(d.getFullYear()).slice(2)}.${d.getMonth() + 1}.${d.getDate()}</b></span>` : ''}<div class="rdt">${tag}<b>${esc(L(st))}</b><p>${esc(L(st.note))}</p><span class="rmeta"><button class="rmapb" data-rmap="${sel}">${rico('map')}${tr('地図', 'Map')}</button>${pips}${tokyoMiniLoc(sel)}</span></div>${ph ? `<img class="rph" src="${ph}" alt="">` : ''}</div>`
      : `<div class="rdet locked" style="--ac:${a.c}"><img class="rbig rgh" src="${stampURL(sel, 2, 1)}" alt=""><div class="rdt">${tag}<b>${tr('まだ行っていない名所', 'Not visited yet')}</b><span class="rmeta"><button class="rmapb" data-rmap="${sel}">${rico('map')}${tr('地図', 'Map')}</button>${tokyoMiniLoc(sel)}</span></div></div>`; }
  /* [ラリー 8] エリアごとの台紙。[ラリー2 48] 本物のスタンプラリーの台紙のように、同じ大きさのますを並べ、行った所はそのますにスタンプを押す。まだの所は、うすい下絵と番号（C01 など）。「？」の丸の列をやめる
     [ラリー2 49] 進み具合は、路線図のような線と駅の丸（行った所は色の丸） [ラリー2 50] よく行く所（3・5・10 回）は、ますの角に銅・銀・金の小さな丸 [ラリー2 51] 和紙のような台紙 [ラリー2 53] 新しいスタンプは、開いた時に「ぽん」と押される動き [ラリー2 54] 集めきったエリアは、台紙の右上に赤い丸の印 [ラリー2 63] えらんだ名所・新しい名所が、路線図のどの駅か分かる */
  const areas = RALLY.area === 'all' ? RALLY_AREA : RALLY_AREA.filter(a => a.id === RALLY.area);
  const shelves = areas.map(a => { const ids = STAMP_ORDER.filter(id => rallyArea(id) === a.id); if (!ids.length) return ''; const g = ids.filter(id => SV.stamps[id]).length;
    const ord = RALLY.sort === 'visit' ? [...ids].sort((p, q) => (SV.stamps[q] || 0) - (SV.stamps[p] || 0)) : ids; /* [ラリー 20] */
    const slot = id => { const st = THEMES[id].stamp, got = SV.stamps[id], tier = got >= 10 ? ' t3' : got >= 5 ? ' t2' : got >= 3 ? ' t1' : '', no = CODE[a.id] + String(ids.indexOf(id) + 1).padStart(2, '0'); /* [ラリー 25] */
      return got ? `<button class="ss got${tier}${id === sel ? ' sel' : ''}${isNew(id) ? ' new' : ''}" data-s="${id}"><img src="${stampURL(id, 1)}" alt=""><span class="stn">${esc(L(st))}</span>${got > 1 ? `<span class="stx">×${got > 99 ? '99+' : got}</span>` : ''}${isNew(id) ? '<span class="stnew">NEW</span>' : ''}</button>`
        : `<button class="ss no${id === sel ? ' sel' : ''}" data-s="${id}" aria-label="${tr('まだ行っていない名所', 'Not visited yet')}"><img src="${stampURL(id, 2)}" alt="" loading="lazy"><span class="stno">${no}</span></button>`; };
    return `<section class="rshelf${g === ids.length ? ' full' : ''}" style="--ac:${a.c}"><h4><i class="rcode">${CODE[a.id]}</i>${esc(L(a))}<small>${g} / ${ids.length}</small>${g === ids.length ? '<span class="rmedal">★</span>' : ''}</h4><div class="rline" aria-hidden="true">${ids.map(id => `<i class="${SV.stamps[id] ? 'on' : ''}${id === sel ? ' sel' : ''}${isNew(id) ? ' nw' : ''}"></i>`).join('')}</div><div class="sbk">${ord.map(slot).join('')}</div></section>`; }).join('');
  /* [ラリー 9] 写真：横に流れるアルバム（場所の名前と、エリアの色の帯） */
  const pics = STAMP_ORDER.filter(id => SV.album[id]).map(id => `<figure data-s="${id}" data-zoom="${id}" style="--ac:${rallyAreaOf(rallyArea(id)).c}"><img src="${SV.album[id]}" alt="${esc(L(THEMES[id].stamp))}" loading="lazy"><figcaption>${esc(L(THEMES[id].stamp))}</figcaption></figure>`).join('');
  const bp = (SV.bestPics || []).filter(p => p && p.img).map(p => `<figure><img src="${p.img}" alt="" loading="lazy"><figcaption>${esc(t('bestPicCap', fmt(p.s)))}<br><small>${esc(new Date(p.d).toLocaleDateString())}</small></figcaption></figure>`).join('');
  return `${hero}${tokyoMapHTML()}${chips}${det}${sortB}${shelves}<h3 class="ph rph3">${rico('cam')}${LANG === 'en' ? 'PHOTOS<small>' + t('photos') + '</small>' : t('photos')}</h3>${pics ? `<div class="album rstrip">${pics}</div>` : `<div class="rempty">${rico('cam')}<p class="note">${t('noPhoto')}</p></div>`}${bp ? `<h3 class="ph rph3">${rico('cup')}${esc(t('bestPics'))}</h3><div class="album best rstrip">${bp}</div>` : ''}`;
}
/* [ラリー 10] 絵の地図は src/7d_tokyomap.js（[ラリー2 20〜]）へ移し、本物の東京の形で描き直した */
const STAMP_URL = {}; function stampURL(id, mode, big) { const k = id + (mode || 0) + (big ? 'B' : '') + LANG; if (!STAMP_URL[k]) { try { STAMP_URL[k] = (mode === 2 && !big ? stampDraw(id, 96, 2) : stampSprite(id, big, mode)).toDataURL(); } catch (e) { return ''; } } return STAMP_URL[k]; } /* mode 1 = インクだけ（台紙に直に押す） 2 = うすい下絵 */
function openStamps() { SFX.ui(); SV.seenStamps = Object.keys(SV.stamps).length + Object.keys(SV.album).length; RALLY.sel = ''; const h = stampsHTML(); SV.stampViewT = Date.now(); save(); openPanel('TOKYO', t('stamps'), h); } /* [ラリー 4] 「NEW」は、前に開いた時から増えた物だけ（開いたら次からは消える） */
function openHow() {
  SFX.ui();
  const ic = k => `<kbd><img src="${SPR_URL[k]}" width="28" alt=""></kbd>`;
  // 動く絵（C-74）：指が左右・上・下にスワイプして、うさぎがよける・跳ぶ・すべる。「動きを減らす」設定・OS の設定では止まる
  const demo = `<div class="howanim${OPT().calm ? ' still' : ''}" aria-hidden="true"><div class="ha-road"><i class="ha-l"></i><i class="ha-l r"></i></div><img class="ha-bun" src="${(() => { try { bunniesNow(); return bunFrame(SV.char === 'jill' ? 'jill' : 'ren', 'run0', false).toDataURL(); } catch (e) { return SPR_URL.hay; } })()}" alt=""><b class="ha-box"></b><span class="ha-finger"></span><em class="ha-cap"><span>${esc(t('howA1'))}</span><span>${esc(t('howA2'))}</span><span>${esc(t('howA3'))}</span></em></div>`;
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
function applyLook() { try { document.documentElement.classList.toggle('bigtext', !!OPT().big); document.documentElement.classList.toggle('calm', !!OPT().calm); } catch (e) { } }
// 同じ見た目の品（例：モチのサンタ帽。買える物とクリスマスのプレゼント）は1つだけ出す：持っている物 → いつもの物 → 無料の物の順（2026-11-09 の報告）
function closetList(who) { const vis = CLOSET.filter(c => c.who === who && (!c.ev || c.ev === EVENT || SV.closet[c.id])), pick = {};
  const rank = c => SV.closet[c.id] ? (c.ev ? 1 : 0) : 4 + (c.ev ? 1 : 0) + (c.cost ? 2 : 0);
  for (const c of vis) { const k = c.slot + ':' + c.v; if (!pick[k] || rank(c) < rank(pick[k])) pick[k] = c; }
  return vis.filter(c => pick[c.slot + ':' + c.v] === c); }
function errLogHTML() { let a = []; try { a = JSON.parse(localStorage.getItem('rjErrLog') || '[]'); } catch (e) { }
  return `<details class="m xfer errlog"><summary><b>${esc(t('errLogH'))}</b> (${a.length})</summary><p class="note">${esc(t('errLogNote'))}</p>${a.length ? `<ul>${a.slice().reverse().map(x => `<li><code>${esc(new Date(x.t).toLocaleString())}${x.n > 1 ? ' ×' + x.n : ''}</code> ${esc(x.m)}</li>`).join('')}</ul>` : `<p class="note">${esc(t('errLogNone'))}</p>`}</details>`; }
function settingsHTML() {
  const o = OPT(), row = (lbl, key, opts) => `<div class="m"><p><b>${esc(lbl)}</b></p><span class="seg">${opts.map(([v, txt]) => `<button class="buy${o[key] === v ? '' : ' off'}" data-opt="${key}" data-v="${v}">${esc(txt)}</button>`).join('')}</span></div>`;
  const langRow = `<div class="m langrow"><p><b>🌐 Language</b></p><span class="seg langseg">${LANGS.map(l => `<button class="buy${LANG === l ? '' : ' off'}" data-lang="${l}" lang="${({ zh: 'zh-Hant' })[l] || l}">${LANG_NAME[l]}</button>`).join('')}</span></div>`; // all four, side by side (the title button cycles)
  const hd = k => `<h3 class="seth">${esc(t(k))}</h3>`;
  return langRow + hd('setCtrl') + row(t('ctrl'), 'ctrl', [['swipe', t('ctrlSwipe')], ['tap', t('ctrlTap')]]) + (o.ctrl === 'tap' ? `<p class="note">${esc(t('ctrlNote'))}</p>` : '') +
    (OPT().ctrl === 'tap' ? row(t('hand'), 'hand', [[false, t('off')], [true, t('on')]]) + `<p class="note">${esc(t('handNote'))}</p>` : '') +
    row(t('sens'), 'sens', [['normal', t('sensN')], ['high', t('sensH')]]) + (o.sens === 'high' ? `<p class="note">${esc(t('sensNote'))}</p>` : '') + row(t('vib'), 'vib', [[true, t('on')], ['low', t('vibLow')], [false, t('off')]]) +
    row(t('easy'), 'easy', [[false, t('easyN')], [true, t('easyY')]]) + (o.easy ? `<p class="note">${esc(t('easyNote'))}</p>` : '') +
    hd('setView') + row(t('bigText'), 'big', [[false, t('bigN')], [true, t('bigY')]]) + (o.big ? `<p class="note">${esc(t('bigNote'))}</p>` : '') +
    row(t('calm'), 'calm', [[true, t('on')], [false, t('off')]]) + (o.calm ? `<p class="note">${esc(t('calmNote'))}</p>` : '') + row(t('gfx'), 'gfx', [['auto', t('gfxAuto')], ['high', t('gfxHigh')], ['low', t('gfxLow')]]) + (o.gfx && o.gfx !== 'auto' ? `<p class="note">${esc(t('gfxNote'))}</p>` : '') + (fsCan() ? `<div class="m"><p><b>${esc(t('fsH'))}</b></p><span class="seg"><button class="buy${fsOn() ? '' : ' off'}" id="btnFs" type="button">${esc(t(fsOn() ? 'fsOff' : 'fsOn'))}</button></span></div>` : '') + hd('setSound') + row(t('music'), 'music', [[true, t('on')], ['low', t('lvLow')], [false, t('off')]]) + row(t('sfx'), 'sfx', [[true, t('on')], ['low', t('lvLow')], [false, t('off')]]) +
    hd('setData') + `<button class="sub" id="btnNameSet">${esc(SV.nick ? t('nameBtn', SV.nick) : t('nameNone'))}</button> <button class="sub" id="btnTut">${esc(t('resetTut'))}</button>` +
    `<div class="m xfer"><p><b>${esc(t('codeH'))}</b></p><p class="note">${esc(t('codeNote'))}</p><div class="btns" style="display:flex;gap:8px"><input id="codeIn" aria-label="${esc(t('codeH'))}" maxlength="24" autocomplete="off" autocapitalize="characters" enterkeyhint="done" placeholder="${esc(t('codePh'))}" style="flex:1;min-width:0;font:inherit;padding:8px 10px;border:2px solid var(--line);border-radius:10px"><button class="sub" id="btnCode" style="width:auto">${esc(t('codeOk'))}</button></div><p class="note" id="codeMsg" aria-live="polite"></p></div>` +
    `<div class="m xfer sns"><p><b>${esc(t('snsH'))}</b></p><p class="note">${esc(t('snsNote'))}</p>${followLinks('chips')}</div>` + linkHTML() + `<div class="m xfer"><p><b>${esc(t('xfer'))}</b></p><p class="note">${esc(t('xferNote'))}</p><button class="sub" id="btnXferMake">${esc(t('xferMake'))}</button><textarea id="xferOut" aria-label="${esc(t('xfer'))}" readonly rows="3" hidden></textarea>` +
    `<textarea id="xferIn" aria-label="${esc(t('xferPaste'))}" rows="3" placeholder="${esc(t('xferPaste'))}"></textarea><button class="sub" id="btnXferLoad">${esc(t('xferLoad'))}</button><p class="note" id="xferMsg" aria-live="polite"></p></div>` +
    errLogHTML() + perfLogHTML() + `<div class="m xfer reset"><p><b>${esc(t('resetH'))}</b></p><p class="note">${esc(t('resetNote'))}</p><button class="sub danger" id="btnReset">${esc(t('resetBtn'))}</button>` +
    `<div id="resetAsk" hidden><p class="note"><b>${esc(t('resetAsk'))}</b></p><div style="display:flex;gap:8px"><button class="sub danger" id="btnResetYes">${esc(t('resetYes'))}</button><button class="sub" id="btnResetNo">${esc(t('resetNo'))}</button></div></div><p class="note" id="resetMsg" aria-live="polite"></p></div>` + (window.HAYDASH_VER ? `<p class="note setver">${esc(t('verL', window.HAYDASH_VER))}</p>` : '');
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
  for (const k of [SAVE_KEY, 'rjChal', 'hd_fsauth', CP_KEY]) { try { localStorage.removeItem(k); } catch (e) { } }
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
  try { const an = o && (o.art || o.picArt); /* 立体にした障害物（車など）は、結果の画面では今までの絵で見せる */ if (an && G.cause !== 'time' && G.cause !== 'quit' && G.cause !== 'rescue' && G.cause !== 'fall' /* [塔 F12] 落ちて終わった時は「ぶつかった物」の絵を出さない（前に当たった物が出てしまう） */ && typeof ART !== 'undefined' && ART[an]) { const c = ART[an](o, false); url = c && c.toDataURL ? c.toDataURL() : ''; } } catch (e) { url = ''; }
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
  hideAll(); show('sRevive'); if (LASTIN === 'kb') { const f = !bc.disabled ? bc : !bh.disabled && !bh.hidden ? bh : $('#btnRvNo'); try { f.focus({ preventScroll: true }); } catch (e) { } } /* [B12] 指で遊んでいる時は、つづけるボタンに青いわくを出さない（キーボードの時だけ選んでおく） */ // keyboard players can continue with Enter
  const ring = $('#rvRing'), num = $('#rvNum'), t0 = performance.now();
  clearInterval(rvTimer);
  let rvLeft = 5, rvLast = performance.now();
  rvTimer = setInterval(() => { const now = performance.now(); if (!document.hidden) rvLeft -= (now - rvLast) / 1000; rvLast = now; const left = Math.max(0, rvLeft); num.textContent = Math.ceil(left); ring.style.setProperty('--p', (left / 5 * 100) + '%'); if (left <= 0) { clearInterval(rvTimer); if (G.mode === 'dead') { hideAll(); endRun(); } } }, 100);
}
function pause() { if (G.mode !== 'play') return; G.mode = 'pause'; saveFlush(); musicStop(); $('#pauseMissions').innerHTML = missionHTML(); hideAll(); show('hud'); show('sPause'); applyLang(); }
function resume() { if (G.mode !== 'pause') return; hideAll(); show('hud');
  const cue = $('#tutCue'); let n = 3; cue.className = 'show'; cue.innerHTML = `<b>${n}</b>`; G.mode = 'countdown';
  const tick = () => { if (G.mode !== 'countdown') { cue.className = ''; return; } n--; if (n > 0) { cue.innerHTML = `<b>${n}</b>`; SFX.ui(); setTimeout(tick, 450); } else { cue.innerHTML = '<b>GO!</b>'; SFX.go(); setTimeout(() => { if (G.mode === 'countdown') cue.className = ''; }, 400); G.mode = 'play'; G.invT = Math.max(G.invT, .6); musicStart(); last = performance.now(); } };
  SFX.ui(); setTimeout(tick, 450); }

/* ================= input ================= */
const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', Space: 'up', ArrowDown: 'down', KeyS: 'down' };
let LASTIN = 'ptr'; const setIn = v => { LASTIN = v; try { document.documentElement.dataset.in = v; } catch (e) { } }; setIn('ptr'); addEventListener('keydown', () => setIn('kb'), true); addEventListener('pointerdown', () => setIn('ptr'), true); addEventListener('touchstart', () => setIn('ptr'), { capture: true, passive: true }); /* [B27] 指・マウスで使っている時は、選択のわく（青い太いわく）を見せない（パネルの × などに、開いたとたん出ていた） */ /* [B12] さいごに使ったのがキーボードか指・マウスか */
addEventListener('keydown', e => {
  if (e.target && e.target.closest && e.target.closest('input,textarea,[contenteditable]') && e.code !== 'Escape') return; // typing a name or a code: letters are letters (P is not pause)
  if (e.code === 'KeyM' && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) { toggleMute(); return; } /* M：音のオン・オフ */
  if (e.code === 'Escape' || e.code === 'KeyP') { if (G.mode === 'play') pause(); else if (G.mode === 'pause') resume(); else if (!$('#sPanel').hidden) closePanel(); return; }
  if ((G.mode === 'title' || G.mode === 'result') && (e.code === 'Enter' || (e.code === 'Space' && G.mode === 'result')) && $('#sPanel').hidden && !e.target.closest('button,a,summary,input,textarea')) { hideAll(); startRun(); return; }
  const a = KEYMAP[e.code]; if (a && G.mode === 'play') { e.preventDefault(); if (!e.repeat) act(a); }
});
let tp = null;
const stage = $('#app');
/* 長押し・右クリックのメニュー（「画像を保存」など）と、2本指での拡大を、ゲームの画面では出さない。シェア用の画像・入力欄・リンクは今までどおり（2026-11-15） */
stage.addEventListener('contextmenu', e => { const el = e.target; if (el && el.closest && el.closest('input,textarea,a,img,[contenteditable],.chatlog,#xferOut')) return; e.preventDefault(); });
for (const ev of ['gesturestart', 'gesturechange']) document.addEventListener(ev, e => { if (G.mode === 'play' || G.mode === 'countdown' || G.mode === 'title') e.preventDefault(); }, { passive: false });
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
document.addEventListener('visibilitychange', () => { if (document.hidden) { cpSave(); saveNow(); if (G.mode === 'countdown') { G.mode = 'play'; $('#tutCue').className = ''; } pause(); } });

/* ================= buttons ================= */
$('#btnStart').onclick = () => { hideAll(); prepRun(); };
/* [軽く] 2026-11-18 オーナー「重すぎる。開いた時に少しローディングの時間を設けてもいい」：スタートを押したら、ほんの少し（長くても 0.6 秒）
   準備の画面（チモシーのくるくると棒）を出して、その間に、はじめの道と次の道の絵・建物の正面・物の面を、前もって作っておく。走り出してからの「一瞬止まる」を減らす */
function prepRun() { let el = document.getElementById('prepCue'); if (!el) { el = document.createElement('div'); el.id = 'prepCue'; el.innerHTML = '<img alt=""><i><b></b></i>'; document.body.appendChild(el); }
  try { el.querySelector('img').src = SPR_URL.hay; } catch (e) { } const bar = el.querySelector('b'); bar.style.width = '5%'; el.className = 'show';
  /* 2026-11-18 オーナー「描く量を減らして現実味を落とすのは避けて。開始前のローディングで対応して」：走り出す前に、時間をかけて全部用意する（長くても 1.5 秒）。
     ①はじめの道と次の 2 本の道の絵・建物の正面・物の面・明るさごとの絵 ②空から見る町の地面の絵（昼と夜）③路面・雲の絵。用意している間は、ゲームは止めておく（G.prepHold） */
  /* [軽く 2] 2026-11-19 オーナー「スマホでめちゃくちゃ止まりやすい。最初やゲームを始める前にしっかりロードの時間を作っていい。品質は絶対に落とさず」：
     決まった回数で打ち切らず、先の道の絵が「全部できた」と分かるまで用意する（スマホは長くても 4 秒、パソコンは 2.5 秒）。
     そのあと、本番と同じ絵を裏で数コマ描いて（遠くの町・やわらかい光・路面の模様の下ごしらえ）、走り出した最初の数秒の引っかかりもなくす */
  requestAnimationFrame(() => requestAnimationFrame(() => { startRun(); const phone = typeof FAC_PHONE !== 'undefined' && FAC_PHONE, cap = phone ? 4000 : 2500; G.prepHold = cap / 1000 + .5; const t0 = performance.now();
    const jobs = [() => { if (!FTEX.asphalt) buildFloorTex(); }, () => { if (!CLOUD_SPR.length) buildCloudSprites(); }, () => { if (typeof aerGet === 'function') aerGet(false); }, () => { if (typeof aerGet === 'function') aerGet(true); }, () => { if (typeof aerFine === 'function') { aerFine(false, true); aerFine(false, false); } }, () => { if (typeof aerFine === 'function') { aerFine(true, true); aerFine(true, false); } }, () => { if (!G.fork && G.segs.length - G.ci < 4) ensureSegs(); }];
    let k = 0, warmDone = false, warmN = 0, draw0 = -1;
    const step = () => { try { if (k < jobs.length) jobs[k++](); else if (!warmDone) { warmN++; warmDone = !!texWarm(phone ? 34 : 40); } } catch (e) { reportErr(e); if (k < jobs.length) k++; else warmDone = true; }
      const el2 = performance.now() - t0; if (warmDone && draw0 < 0) draw0 = G.drawN || 0; const drawn = draw0 < 0 ? 0 : (G.drawN || 0) - draw0;
      const frac = k < jobs.length ? k / jobs.length * .35 : warmDone ? .9 + Math.min(1, drawn / 6) * .1 : .35 + Math.min(.55, warmN * .02);
      bar.style.width = Math.min(100, 5 + Math.max(frac, el2 / cap * .9) * 95) + '%';
      const done = (warmDone && drawn >= 6) || el2 > cap;
      if (!done) requestAnimationFrame(step); else { bar.style.width = '100%'; G.prepHold = 0; G.prepEndT = performance.now(); setTimeout(() => { el.className = ''; }, 150); } };
    step(); })); }
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
$('#pickRen').onclick = () => { G.char = 'ren'; SV.char = 'ren'; save(); refreshTitle(); homeFitAgain(); audioInit(); SFX.ui(); };
$('#pickJill').onclick = () => { G.char = 'jill'; SV.char = 'jill'; save(); refreshTitle(); homeFitAgain(); audioInit(); SFX.ui(); };
$('#pickPom').onclick = () => { audioInit(); if (!SV.pomMet) return; G.char = 'pom'; SV.char = 'pom'; save(); refreshTitle(); homeFitAgain(); SFX.ui(); };
$('#btnMissions').onclick = openMissions; $('#btnShop').onclick = openShop; $('#btnZukan').onclick = openZukan; $('#btnHow').onclick = openHow; $('#btnStamps').onclick = openStamps;
$('#btnSet').onclick = openSettings;
$('#btnRank').onclick = () => openRanking('month'); $('#btnRank2').onclick = () => { hideAll(); show('sTitle'); setupTitle(); refreshTitle(); openRanking('month'); };
$('#btnLangTop').onclick = () => { SFX.ui(); openPanel('LANGUAGE', t('langPick'), `<div class="langpick">${LANGS.map(l => `<button class="buy${LANG === l ? '' : ' off'}" data-langpick="${l}" lang="${({ zh: 'zh-Hant' })[l] || l}">${LANG_NAME[l]}</button>`).join('')}</div>`); };
/* 下の小さい言語ボタンはやめた：右上の地球ボタンだけ（2026-11-10 オーナーの判断） */
$('#pClose').onclick = closePanel;
$('#sPanel').addEventListener('click', e => {
  const up = e.target.closest('[data-up]'), buy = e.target.closest('[data-buy]'), mg = e.target.closest('[data-mug]'), z = e.target.closest('[data-z]'), sst = e.target.closest('[data-s]');
  if (e.target === $('#sPanel')) { closePanel(); return; }
  { const rr = e.target.closest('[data-reroll]'); if (rr) { if (kpReroll(rr.dataset.reroll)) { SFX.ui(); const b = $('#pBody'), top = b.scrollTop; b.innerHTML = missionsBody(); b.scrollTop = top; refreshTitle(); } return; } } // ミッションの入れかえ（[ミッション 9] 入れかえても、見ていた所から動かない）
  { const af = e.target.closest('[data-achf]'); if (af) { SFX.ui(); ACH_F = af.dataset.achf; ACH_SEL = ''; const b = $('#pBody'), top = b.scrollTop; b.innerHTML = missionsBody(); b.scrollTop = top; return; } }
  { const ab = e.target.closest('[data-ach]'); if (ab) { SFX.ui(); ACH_SEL = ACH_SEL === ab.dataset.ach ? '' : ab.dataset.ach; const b = $('#pBody'), top = b.scrollTop; b.innerHTML = missionsBody(); b.scrollTop = top; const d = b.querySelector('.mach-d'); if (d) d.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; } } /* [ミッション 10] 称号のメダルを押すと、くわしい札（もう一度押すと閉じる） */
  if (up) { const k = up.dataset.up, c = UPG_COST[SV.upg[k] || 0]; if (SV.bank >= c && (SV.upg[k] || 0) < 5) { SV.bank -= c; SV.upg[k] = (SV.upg[k] || 0) + 1; save(); SFX.power(); $('#pBody').innerHTML = shopHTML(); } }
  if (buy) { const k = buy.dataset.buy; if (k === 'clover' && SV.bank >= 500) { SV.bank -= 500; SV.clovers++; } if (k === 'mug' && SV.bank >= 1500) { SV.bank -= 1500; SV.mug = true; SV.mugOn = true; SV.wear.ren.hat = ''; applyWear(); }
    const c = CLOSET.find(x => x.id === k); if (c && c.lg == null && !c.ev && !SV.closet[c.id] && SV.bank >= c.cost) { SV.bank -= c.cost; SV.closet[c.id] = 1; SV.wear[c.who][c.slot] = c.v; if (c.slot === 'hat' && c.who === 'ren') SV.mugOn = false; applyWear(); } save(); SFX.power(); $('#pBody').innerHTML = shopHTML(); }
  { const lgb = e.target.closest('[data-lg]'); if (lgb) { const k = lgb.dataset.lg; if (k === 'mode' && legendOn('mode')) SV.lgMode = SV.lgMode ? 0 : 1; if (k === 'aura' && legendOn('aura')) SV.lgAura = SV.lgAura === 0 ? 1 : 0; save(); SFX.ui(); $('#pBody').innerHTML = shopHTML(); } }
  if (mg) { SV.mugOn = !SV.mugOn; if (SV.mugOn) { SV.wear.ren.hat = ''; applyWear(); } save(); SFX.ui(); $('#pBody').innerHTML = shopHTML(); }
  { const ty = e.target.closest('[data-try]'); if (ty && !e.target.closest('button')) { fitTry(ty); return; } }
  const wr = e.target.closest('[data-wear]'); if (wr) { const c = CLOSET.find(x => x.id === wr.dataset.wear); if (c) delete TRYON[c.who][c.slot]; if (c && SV.closet[c.id]) { const cur = SV.wear[c.who][c.slot]; SV.wear[c.who][c.slot] = cur === c.v ? (SLOT_DEF[c.slot] || '') : c.v; if (c.slot === 'hat' && c.who === 'ren' && SV.wear.ren.hat) SV.mugOn = false; save(); applyWear(); SFX.ui(); $('#pBody').innerHTML = shopHTML(); } }
  if (z) { SFX.ui(); $('#pBody').innerHTML = zukanHTML(z.dataset.z); }
  { const lb = e.target.closest('.rlight'); if (lb) { lb.remove(); return; } const zs = e.target.closest('[data-zst]'); if (zs && THEMES[zs.dataset.zst]) { SFX.ui(); const id = zs.dataset.zst, d = document.createElement('div'); d.className = 'rlight'; d.setAttribute('role', 'dialog'); d.innerHTML = `<button class="rlx" aria-label="${tr('閉じる', 'Close')}">×</button><figure class="rlst"><img src="${stampURL(id, 1, 1)}" alt="${esc(L(THEMES[id].stamp))}"></figure>`; $('#sPanel').appendChild(d); return; } /* [ラリー2 57] 大きなスタンプを押すと、台紙いっぱいに大きく見られる */ const zf = e.target.closest('[data-zoom]'); if (zf && SV.album[zf.dataset.zoom]) { SFX.ui(); const id = zf.dataset.zoom, T = SV.stampT || {}, d = document.createElement('div'); d.className = 'rlight'; d.setAttribute('role', 'dialog'); d.innerHTML = `<button class="rlx" aria-label="${tr('閉じる', 'Close')}">×</button><figure><img src="${SV.album[id]}" alt=""><figcaption><b>${esc(L(THEMES[id].stamp))}</b>${T[id] ? `<small>${rico('cal')}${esc(new Date(T[id]).toLocaleDateString())}</small>` : ''}</figcaption></figure>`; $('#sPanel').appendChild(d); return; } } /* [ラリー 33] 記念写真を押すと、大きく見られる（もう一度押すと閉じる） */
  if (sst) { SFX.ui(); const b = $('#pBody'), top = b.scrollTop; b.innerHTML = stampsHTML(sst.dataset.s === RALLY.sel && !sst.closest('.tmap') ? '' : sst.dataset.s); b.scrollTop = top; if (sst.closest('.tmap') || sst.closest('.rstrip')) { const d = b.querySelector('.rdet'); if (d) d.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } } /* [ラリー 17] えらんでも、見ていた所から動かない。地図・写真から押した時は、くわしい札まで見せる。同じタイルをもう一度押すと閉じる */
  { const rs = e.target.closest('[data-rsort]'); if (rs) { SFX.ui(); RALLY.sort = rs.dataset.rsort; const b = $('#pBody'), top = b.scrollTop; b.innerHTML = stampsHTML(); b.scrollTop = top; return; } const rm = e.target.closest('[data-rmap]'); if (rm) { SFX.ui(); const p0 = MAP_PT[rm.dataset.rmap]; if (p0) RALLY.view = p0[0] > 139.683 && p0[0] < 139.829 && p0[1] < 35.7345 && p0[1] > 35.6228 ? 'center' : 'all'; const b = $('#pBody'); b.innerHTML = stampsHTML(); const m = b.querySelector('.tmap'); if (m) m.scrollIntoView({ block: 'start', behavior: 'smooth' }); return; } } /* [ラリー 94] 札の「地図」：その名所が見えるように地図を切りかえて、地図までもどる */
  { const ra = e.target.closest('[data-ra]'), rv = e.target.closest('[data-rv]'); if (ra || rv) { SFX.ui(); if (ra) RALLY.area = ra.dataset.ra; if (rv) RALLY.view = rv.dataset.rv; if (ra && ra.dataset.ra !== 'all' && RALLY.sel && rallyArea(RALLY.sel) !== ra.dataset.ra) RALLY.sel = ''; const b = $('#pBody'), top = b.scrollTop; b.innerHTML = stampsHTML(); b.scrollTop = top; return; } } /* [ラリー 18] エリアの札・地図の切りかえ */
  { const lp = e.target.closest('[data-langpick]'); if (lp && LANGS.includes(lp.dataset.langpick)) { LANG = lp.dataset.langpick; SV.lang = LANG; save(); refreshTitle(); SFX.ui(); closePanel(); return; } }
  { const lb = e.target.closest('[data-lang]'); if (lb && LANGS.includes(lb.dataset.lang)) { LANG = lb.dataset.lang; SV.lang = LANG; save(); refreshTitle(); SFX.ui(); openPanel('SETTINGS', t('settings'), settingsHTML()); } }
  { const pr = e.target.closest('[data-prac]'); if (pr) { SFX.ui(); G.practiceNext = pr.dataset.prac; closePanel(); hideAll(); startRun(); return; } }
  if (e.target.closest('#btnFs')) { SFX.ui(); fsToggle(); return; }
  const op = e.target.closest('[data-opt]');
  if (op) { const k = op.dataset.opt; let v = op.dataset.v; if (v === 'true') v = true; else if (v === 'false') v = false; SV.opt[k] = v; save(); audioInit(); applyAudioOpt(); applyLook(); if (k === 'gfx') applyGfx(); SFX.ui(); $('#pBody').innerHTML = settingsHTML(); }
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
let QUITASK = -1e9; /* 2026-11-15：0 だと、ページを開いて 3 秒以内は「2 回目の押し」と見なされて 1 回でやめてしまう（ふつうの操作では起きないが、試験で見つけた） */
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
let perfAcc = 0, perfN = 0, lowQ = 0, FT_AVG = 0, FT_DEBT = 0;
// the loop must never die: an error in one frame is reported once and the next frame goes on
let FRAME_ERRS = 0, FRAME_BAD = 0;
/* [軽く] 2026-11-18 オーナー「プレイ中スマホでまだ重い」：1 秒に 120 回・90 回描く画面のスマホでも、描くのは 1 秒に 60 回まで（それ以上は目には同じで、
   スマホが 2 倍働いて熱くなり、遅くなっていた）。間のコマは何もしない */
let FRAME_LAST = 0;
function frame(now) {
  if (FRAME_LAST && now - FRAME_LAST < 10) { requestAnimationFrame(frame); return; } FRAME_LAST = now; /* 120 回の画面は 1 回おきに描く（60 回）。90 回・60 回の画面はそのまま */
  try { frameBody(now); FRAME_BAD = 0; } catch (e) { FRAME_ERRS++; window.__frameErr = (window.__frameErr || 0) + 1; window.__frameErrMsg = String(e && e.message || e); window.__frameErrAt = String(e && e.stack || '').split('\n').slice(1, 3).map(x => x.trim().replace(/^at /, '').replace(/\(?(?:https?|file):\/\/\S*\/([^/\s)]*:\d+:\d+)\)?/, '$1').replace(/\(eval at [^)]*\)\S*\)?,?\s*/, '')).join(' < '); if (FRAME_ERRS < 4) console.error('frame error', e); try { for (let i = 0; i < 12; i++) ctx.restore(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; } catch (e2) { } frameTrouble(); }
  requestAnimationFrame(frame);
}
// the picture breaks off frame after frame (on a phone: usually out of picture memory): free the kept pictures, then draw more simply;
// if it still cannot be drawn, the run ends the normal way rather than leave a frozen, half-drawn screen
function frameTrouble() {
  FRAME_BAD++;
  if (FRAME_BAD === 3 || FRAME_BAD % 60 === 0) { try { freePictures(); sprTrim(0); } catch (e) { } }
  if (FRAME_BAD === 30 && !lowQ) { lowQ = 1; DPR = 1; try { resizeKeep(); } catch (e) { } }
  if (FRAME_BAD >= 150 && G.mode === 'play') { FRAME_BAD = 0; errLog('draw trouble ' + (G.drawRetry || 0) + ': ' + (window.__frameErrMsg || '?') + ' @ ' + (window.__frameErrAt || '?')); G.drawRetry = (G.drawRetry || 0) + 1; try { freePictures(); sprTrim(0); } catch (e) { } lowQ = 2; DPR = 1; try { resizeKeep(); } catch (e) { } if (G.drawRetry % 3 === 0) { try { picRepairAll(); } catch (e) { } } if (G.drawRetry < 8) return; finishRun('draw'); } // 絵が描けないときも、軽くして手放して描き直し、何度もやり直す（2026-11-14「一区切りが起きないように」：すぐ終わらせない）
}
function frameBody(now) {
  const raw = (now - last) / 1000; let dt = Math.min(.05, Math.max(0, raw)); last = now;
  /* 画面の更新（60/90/120 回/秒）に合わせて、コマの間隔のゆらぎ（15ms・18ms…）をならす。走る速さは同じまま、流れる景色のかくつきが減る（2026-11-15） */
  if (raw > .004 && raw < .05) { FT_AVG = FT_AVG ? FT_AVG + (raw - FT_AVG) * .08 : raw; if (Math.abs(raw - FT_AVG) < FT_AVG * .22) { FT_DEBT += raw - FT_AVG; if (Math.abs(FT_DEBT) > .03) FT_DEBT = 0; dt = Math.max(0, FT_AVG + FT_DEBT * .1); FT_DEBT -= FT_DEBT * .1; } else FT_AVG += (raw - FT_AVG) * .2; } // never backwards (the first frame after a countdown can be stamped a hair before it)
  /* [軽く 2] 画質の自動調整は「ずっと重い」時だけ：準備中・走り出してすぐの 1.5 秒・一瞬だけの引っかかり（ふだんの 2.5 倍以上）は数えない。たまたまの 1 コマで画質を下げない */
  if (G.mode === 'play' && raw < .25 && !G.prepHold && performance.now() - (G.prepEndT || 0) > 1500 && !(FT_AVG && raw > FT_AVG * 2.5 && raw > .03)) { perfAcc += raw; perfN++; if (perfN >= 90) { const avg = perfAcc / perfN; perfAcc = perfN = 0; qualityStep(avg); } }
  TEXN = 0; TEXB = performance.now() + 3; wakeTick(now); if (G.mode === 'play') cpTick(now);
  const pfOn = G.mode === 'play' && !G.prepHold, pf0 = pfOn ? performance.now() : 0; let pf1 = 0, pfS = 0;
  { let bad = null; if (G.mode !== 'pause' && G.mode !== 'dead' && G.mode !== 'result') { try { update(dt); } catch (e) { bad = e; } }
    if (bad) reportErr(bad); runGuard(Math.min(.1, Math.max(0, raw)), bad); } // a broken frame still draws, and the safety net looks at every frame
  // battery: while paused nothing on the stage moves, so it is drawn only a couple of times a second (2026-11-08)
  /* 2026-11-15：結果の画面・「続ける？」の画面も、舞台は止まっているので 1 秒に 2 回だけ描く（結果の画面を開いたままシェアしている間、スマホが熱くなりにくい）。
     題名画面は 1 秒に 30 コマ（メニューを開いている間は 4 コマ）。走っている間は今までどおり毎コマ */
  { const still = G.mode === 'pause' || G.mode === 'result' || G.mode === 'dead', gap = still ? 500 : G.mode === 'title' ? ($('#sPanel').hidden && $('#sChat').hidden ? 30 : 250) : 0;
    if (pfOn) { pf1 = performance.now(); pfS = PERFR.n % 60 === 30; if (pfS) { for (const k in PROF) PROF[k] = 0; PROF.on = 1; } }
    if (!gap || now - (G.pauseDrawT || 0) >= gap || G.drawNow) { G.pauseDrawT = now; G.drawNow = 0; render(); G.drawN = (G.drawN || 0) + 1; }
    if (pfOn) perfRec(raw, pf1 - pf0, performance.now() - pf1, pfS); else if (PERFR.n > 120 && PERFR.saveN !== PERFR.n && G.mode !== 'play') { PERFR.saveN = PERFR.n; perfSave(); } }
  if (G.mode === 'play') texWarm(Math.max(0, Math.min(3, TEXB - performance.now())));
  if (G.capture && G.capture.t <= 0) { takePhoto(G.capture.tid); G.capture = null; }
  if (G.mode === 'title') { if ((G.cardFitT = (G.cardFitT || 0) + 1) % 45 === 1) charCardFit(); drawCharCard($('#cvRen'), 'ren', G.t); drawCharCard($('#cvJill'), 'jill', G.t + 1.3); if (SV.pomMet) drawCharCard($('#cvPom'), 'pom', G.t + .6); }
  if (SAVE_DIRTY && G.mode !== 'play' && G.mode !== 'countdown') saveNow();
  musicTick(); padTick(); picCheck(now);
}
// back from the background, or the browser says the picture was lost: look at the kept pictures on the very next frame
for (const ev of ['pageshow', 'focus']) addEventListener(ev, () => { PIC_NEXT = 0; });
document.addEventListener('visibilitychange', () => { PIC_NEXT = 0; });
for (const ev of ['contextlost', 'contextrestored']) cv.addEventListener(ev, () => { PIC_NEXT = 0; });
// ゲームパッド（C-13）：十字キー・左スティックで操作、A でジャンプ、B でスライディング、スタートで一時停止
const PAD = { prev: {} };
function padTick() { let gp = null; try { const l = navigator.getGamepads ? navigator.getGamepads() : []; for (const g of l) if (g && g.connected) { gp = g; break; } } catch (e) { return; } if (!gp) return;
  const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed), ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  const now = { up: b(12) || b(0) || ay < -.6, down: b(13) || b(1) || ay > .6, left: b(14) || ax < -.6, right: b(15) || ax > .6, start: b(9) };
  for (const k of ['up', 'down', 'left', 'right']) if (now[k] && !PAD.prev[k] && G.mode === 'play') { act(k); G.padN = (G.padN || 0) + 1; }
  if (now.start && !PAD.prev.start) { if (G.mode === 'play') pause(); else if (G.mode === 'pause') resume(); }
  PAD.prev = now; }
addEventListener('pagehide', () => { try { cpSave(); saveNow(); } catch (e) { } });
// a computer: clicking another window (the game keeps running behind it) pauses, like switching tabs does (2026-11-08)
addEventListener('blur', () => { try { if (G.mode === 'play' && !matchMedia('(pointer:coarse)').matches) pause(); } catch (e) { } });
/* 走っている間は、画面が暗くなったり消えたりしないようにする（まっすぐ走っていて指をふれない時間が続くと、スマホが画面を消すことがあった）。一時停止・結果・題名では、ふつうに戻す */
let WAKE = null, WAKE_T = 0;
function wakeTick(now) { if (now < WAKE_T) return; WAKE_T = now + 1500; const want = (G.mode === 'play' || G.mode === 'countdown') && !document.hidden;
  try { if (want && !WAKE && navigator.wakeLock && navigator.wakeLock.request) { WAKE = 1; navigator.wakeLock.request('screen').then(w => { WAKE = w; try { w.addEventListener('release', () => { if (WAKE === w) WAKE = null; }); } catch (e) { } }).catch(() => { WAKE = null; WAKE_T = performance.now() + 20000; }); }
    else if (!want && WAKE && WAKE !== 1) { const w = WAKE; WAKE = null; w.release().catch(() => { }); } } catch (e) { WAKE = null; } }
/* 全画面（対応している端末だけ。iPhone のブラウザは対応していないので、ボタンを出さない） */
function fsCan() { const d = document, e = d.documentElement; return !!((d.fullscreenEnabled || d.webkitFullscreenEnabled) && (e.requestFullscreen || e.webkitRequestFullscreen)) && !(window.navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches)); }
function fsOn() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
function fsToggle() { try { const d = document, e = d.documentElement; if (fsOn()) (d.exitFullscreen || d.webkitExitFullscreen).call(d); else { const p = (e.requestFullscreen || e.webkitRequestFullscreen).call(e, { navigationUI: 'hide' }); if (p && p.catch) p.catch(() => { }); } } catch (x) { } }
document.addEventListener('fullscreenchange', () => { try { if (!$('#sPanel').hidden && $('#btnFs')) $('#pBody').innerHTML = settingsHTML(); } catch (e) { } });
/* 文字の形（フォント）があとから届いたら、町の看板などの絵を描き直す（最初は代わりの文字で描かれているため）。題名画面にいるときだけ・3回まで */
let FONT_REDO = 0, FONT_T = 0;
try { if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => { clearTimeout(FONT_T); FONT_T = setTimeout(() => { if (FONT_REDO >= 3 || G.mode !== 'title') return; FONT_REDO++; try { freePictures(); } catch (e) { } }, 600); }); } catch (e) { }
/* 2026-11-15：iPhone のホーム画面アプリ（全画面）で、画面のいちばん下に暗い帯が残る（オーナーの画面で確認。iOS の既知の不具合：上のステータスバーの分だけ、画面の高さが短く計算される）。
   アプリの枠が画面より「ステータスバーくらい（8〜80px）」短い時だけ、画面いっぱいの高さにする。ふつうのブラウザ・Android・PC では何もしない。キーボードが出ている間（大きく短い）も何もしない */
/* [H70〜H72] 2026-11-22 オーナー（iPhone のアプリの写真）「下が見切れている」：画面の下に暗い帯が残り、スタートボタンが半分かくれていた。
   ①ホーム画面から開いた時の見分け方を増やす（navigator.standalone だけでは見分けられない iPhone があった。表示のしかた display-mode も見る）
   ②画面の本当の高さは、画面の大きさ・ブラウザの 100vh・100lvh・innerHeight のうち、いちばん大きい物（ステータスバーの分 62px 前後の差を見落とさない）
   ③アプリの枠（#app）が、見えている高さより短い時は、どんな画面でものばす（ふつうのブラウザでは同じ高さなので何もしない） */
function isStandalone() { try { return navigator.standalone === true || ['standalone', 'fullscreen'].some(m => matchMedia('(display-mode: ' + m + ')').matches); } catch (e) { return false; } }
let VH_PROBE = null;
function vhProbe(u) { try { if (!VH_PROBE) { VH_PROBE = document.createElement('div'); VH_PROBE.setAttribute('aria-hidden', 'true'); VH_PROBE.style.cssText = 'position:fixed;left:-9px;top:0;width:1px;visibility:hidden;pointer-events:none'; document.body.appendChild(VH_PROBE); } VH_PROBE.style.height = '100' + u; if (VH_PROBE.style.height === '') return 0; return VH_PROBE.getBoundingClientRect().height; } catch (e) { return 0; } }
function iosFill() { try { const app = $('#app'); if (!app) return false; const sa = isStandalone(), port = innerHeight >= innerWidth, a = screen.height, b = screen.width;
  const was = app.style.height; app.style.height = ''; app.style.bottom = ''; const h = app.getBoundingClientRect().height;
  let full = Math.max(innerHeight, document.documentElement.clientHeight || 0); /* ③ どの画面でも：見えている高さより短い枠はのばす */
  const ios = navigator.standalone === true || /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); /* 画面の大きさを使うのは iPhone・iPad だけ（Android のアプリは画面の大きさに上下のシステムのバーが入るので、のばすと下が切れる） */
  if (sa) full = Math.max(full, vhProbe('vh'), vhProbe('lvh'), ios ? (port ? Math.max(a, b) : Math.min(a, b)) : 0); /* ② ホーム画面のアプリだけ：画面の大きさと 100vh も見る（ブラウザでは下のバーの分まで広げない） */
  const gap = full - h; if (gap > 2 && gap < 130 && !(window.visualViewport && visualViewport.height < h * .75)) { app.style.height = Math.round(full) + 'px'; app.style.bottom = 'auto'; } /* キーボードが出ている間（見える高さがとても短い）は何もしない */
  return app.style.height !== was; /* 高さを変えた時だけ true */ } catch (e) { return false; } }
/* [軽く 4-0] 2026-11-24 オーナー「スマホは全体的（に重い）」：クラウドの画面なしのパソコンでは、スマホの本当の重さ（絵をぬる速さ）が測れない。
   走っている間の、この端末での本当の重さ（1 秒のコマ数・重いコマの割合・計算と描く命令にかかった時間・画質の自動調整・描く部分ごとの時間）を、この端末にだけ残し、設定の「動作の記録」に出す。
   写真を送ってもらえば、計算が重いのか、絵をぬるのが重いのかが分かる（記録は 60 コマに 1 回だけ部分ごとの時間を測るので、ほぼ軽さは変わらない） */
const PERFR = { id: 0, n: 0, sum: 0, slow: 0, worst: 0, upd: 0, rnd: 0, pn: 0, parts: {}, saveN: 0 };
function perfRec(raw, tu, tr, sampled) {
  if (PERFR.id !== G.perfId) { if (PERFR.n > 120) perfSave(); Object.assign(PERFR, { id: G.perfId || 0, n: 0, sum: 0, slow: 0, worst: 0, upd: 0, rnd: 0, pn: 0, parts: {}, saveN: 0 }); }
  if (sampled) { PROF.on = 0; PERFR.pn++; for (const k in PROF) if (k !== 'on') { PERFR.parts[k] = (PERFR.parts[k] || 0) + PROF[k]; PROF[k] = 0; } }
  if (!(raw > 0 && raw < .5)) return; PERFR.n++; PERFR.sum += raw; if (raw > .025) PERFR.slow++; if (raw > PERFR.worst) PERFR.worst = raw; PERFR.upd += tu; PERFR.rnd += tr;
  if (PERFR.n - PERFR.saveN >= 600) { PERFR.saveN = PERFR.n; perfSave(); } }
function perfSave() { try { const P = PERFR; if (!P.n) return; const parts = Object.entries(P.parts).filter(([k]) => k !== 'on').sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => k + ' ' + (v / Math.max(1, P.pn)).toFixed(1));
    const e = { t: P.id || Date.now(), n: P.n, fps: +(P.n / P.sum).toFixed(1), slow: Math.round(P.slow / P.n * 100), worst: Math.round(P.worst * 1000), upd: +(P.upd / P.n).toFixed(1), rnd: +(P.rnd / P.n).toFixed(1), dpr: +DPR.toFixed(2), dev: +(window.devicePixelRatio || 1).toFixed(2), px: cv.width + 'x' + cv.height, q: QLOG.join(',') || '-', lq: lowQ, gfx: gfxMode(), parts: parts.join(', '), course: (G.segs[G.ci] && G.segs[G.ci].tid) || '' };
    let a = []; try { a = JSON.parse(localStorage.getItem('rjPerfLog') || '[]'); } catch (x) { } a = a.filter(x => x.t !== e.t); a.push(e); localStorage.setItem('rjPerfLog', JSON.stringify(a.slice(-6))); } catch (x) { } }
function perfLogHTML() { let a = []; try { a = JSON.parse(localStorage.getItem('rjPerfLog') || '[]'); } catch (e) { }
  return `<details class="m xfer errlog"><summary><b>${esc(t('perfLogH'))}</b> (${a.length})</summary><p class="note">${esc(t('perfLogNote'))}</p>${a.length ? `<ul>${a.slice().reverse().map(x => `<li><code>${esc(new Date(x.t).toLocaleString())}</code> ${esc(x.fps + ' fps · ' + t('perfSlow') + ' ' + x.slow + '% · max ' + x.worst + 'ms · upd ' + x.upd + 'ms · draw ' + x.rnd + 'ms · ' + x.dpr + '/' + x.dev + 'x ' + x.px + ' · q ' + x.q + ' L' + x.lq + ' ' + x.gfx + ' · ' + x.course + ' · ' + x.parts)}</li>`).join('')}</ul>` : `<p class="note">${esc(t('errLogNone'))}</p>`}</details>`; }
function resizeKeep() { cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); smoothOn(); G.drawNow = 1; }
/* 重いとき：まず絵の細かさを1段ずつ下げ（見た目はほとんど変わらない）、それでも重ければ演出を減らす。とても重い端末（30コマ/秒に届かない）はすぐ軽くする。
   軽い状態が続いたら細かさを戻す（1回の走りで2回まで。行ったり来たりしない） */
let Q_GOOD = 0, Q_UP = 0; const QLOG = [];
function qualityStep(avg) {
  if (G.lockQ) return; const g = gfxMode(); if (g === 'low') return;
  const slow = avg > 1 / (g === 'high' ? 36 : 42), verySlow = avg > 1 / 30, dev = window.devicePixelRatio || 1;
  if (slow) { Q_GOOD = 0;
    if (g !== 'high' && !lowQ && typeof DIF_K !== 'undefined' && DIF_K > 0) { DIF_K = 0; QLOG.push('glow0'); return; } /* 重い時は、まず「やわらかい光」をやめる（細かさを下げるのはその後） */
    if (!verySlow && !lowQ && RES_K > .72 && Math.min(dev, 1.75) * RES_K > 1.08) { RES_K = Math.max(.7, RES_K - .15); DPR = dprWant(); resizeKeep(); QLOG.push('res' + RES_K.toFixed(2)); return; }
    if (lowQ < 2) { lowQ++; if (lowQ === 1) { DPR = 1; resizeKeep(); } QLOG.push('low' + lowQ); }
  } else if (avg < 1 / 55 && !lowQ && RES_K < 1 && Q_UP < 2) { if (++Q_GOOD >= 5) { Q_GOOD = 0; Q_UP++; RES_K = Math.min(1, RES_K + .15); DPR = dprWant(); resizeKeep(); QLOG.push('up' + RES_K.toFixed(2)); } }
  else Q_GOOD = 0;
}
function applyGfx() { const g = gfxMode(); if (g === 'low') { if (!lowQ) lowQ = 1; } else if (!G.lockQ && lowQ && !QLOG.some(x => x[0] === 'l')) lowQ = 0; if (g !== 'low' && !QLOG.length) RES_K = 1; DPR = dprWant(); try { resizeKeep(); } catch (e) { } }
function boot() {
  if (gfxMode() === 'low') lowQ = 1; /* 設定「画質：軽い」は最初から */
  applyLook();
  /* 2026-11-15：前は「全部描く → 着せかえを読んで、着がえた子をもう一度全部描く」で、着せかえている人ほど起動が遅かった。先に着せかえを読み、前向きの絵だけ描いて始める */
  try { iosFill(); const again = () => setTimeout(() => { if (iosFill()) { resize(); homeFitAgain(); } }, 350); for (const ev of ['resize', 'orientationchange', 'focusout', 'pageshow']) addEventListener(ev, again); document.addEventListener('visibilitychange', () => { if (!document.hidden) again(); }); try { matchMedia('(display-mode: standalone)').addEventListener('change', again); } catch (e) { } if (window.visualViewport) visualViewport.addEventListener('resize', again); setTimeout(again, 900); setTimeout(again, 2500); } catch (e) { } /* [H73] どの画面でも見直す（前はホーム画面アプリと分かった時だけ）。アプリにもどった時・表示のしかたが変わった時も */
  buildItemSprites(); buildWorldSprites(); BUN_LAZY = 1; try { applyWear(); for (const w of ['ren', 'jill', 'pom']) if (!BUN[w] || !BUN[w].front_open) buildBunnies(w); } finally { BUN_LAZY = 0; } bunniesLater(); rankIcons(); rankInit(); chatInit(); resize(); { let rz = 0; const later = () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { G.resizeN = (G.resizeN || 0) + 1; resize(); }); }; addEventListener('resize', later); addEventListener('orientationchange', later); } // 画面を回したとき、描き直しは 1 回だけ（C-63）
  $('#hHayIco').src = SPR_URL.hay; $('#tHayIco').src = SPR_URL.hay;
  G.char = SV.char || 'ren'; missionsFix();
  goTitle(); document.documentElement.classList.remove('booting'); // the page shows only once its words are in the player's language
  maintShow();
  try { kpComeback(); } catch (e) { reportErr(e); }
  dailyBonus(); document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && G.mode === 'title') dailyBonus(); }); // a phone that keeps the app open past midnight gets the next day's bonus when it comes back
  { // an event has ended: whoever still wears its gift goes back to their usual look once (the gift stays in the Shop and can be worn again)
    if (SV.lastEv !== EVENT) { let off = 0; for (const c of CLOSET) if (c.ev && c.ev !== EVENT && SV.wear[c.who] && SV.wear[c.who][c.slot] === c.v && !CLOSET.some(d => d !== c && d.who === c.who && d.slot === c.slot && d.v === c.v && (d.ev === EVENT || (!d.ev && SV.closet[d.id])))) { SV.wear[c.who][c.slot] = SLOT_DEF[c.slot] || ''; off = 1; } if (off) applyWear(); } // also on the first start after this update (saves without lastEv)
    if (SV.lastEv !== EVENT) { SV.lastEv = EVENT; save(); } }
  { const lg = legendGrant(); if (lg) { refreshTitle(); toastTitle(lg); } } // already a Legendary bunny before this update: the perks arrive now
  if (EVENT) { const gifts = CLOSET.filter(c => c.ev === EVENT && !SV.closet[c.id]); if (gifts.length) { for (const c of gifts) SV.closet[c.id] = 1; save(); const g = (EVENT_INFO.gift || EV_KITS[EVENT].gift), until = EVENT_INFO.to ? t('untilMD', +EVENT_INFO.to.slice(5, 7), +EVENT_INFO.to.slice(8, 10)) : ''; toastTitle(L(g) + until); } }
  loadFeed(); linkFromUrl(); inAppCard(); freshCard();
  setTimeout(() => { try { if (!CLOUD_SPR.length) buildCloudSprites(); if (!FTEX.asphalt) buildFloorTex(); } catch (e) { } }, 1200); // ready before the first street
  for (const [ms, f] of [[2600, () => aerGet(false)], [3600, () => aerGet(true)], [4400, () => { aerFine(false, true); aerFine(false, false); }], [5200, () => { aerFine(true, true); aerFine(true, false); }]]) setTimeout(() => { try { if (G.mode === 'title' && typeof aerGet === 'function') f(); } catch (e) { } }, ms); /* [軽く] 題名の画面にいる間に、空から見る町の地面の絵（昼・夜）を前もって作る（はじめて塔から飛んだ時に、一瞬止まっていた） */
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
/* ---- Follow Tokyo Usagi Office: the official profiles as plain text links (title, settings, result). Never a popup. ---- */
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
/* スタート画面をスクロールした時：上の暗いぼかしを消し、上に出ている知らせ（出社ボーナスなど）もかくす（下から上がってきた札の上に、ういて重なって見えた。2026-11-17） */
(() => { const st = document.getElementById('sTitle'); if (!st) return; st.addEventListener('scroll', () => { const on = st.scrollTop > 24; st.classList.toggle('scrolled', on); document.body.classList.toggle('tscroll', on); }, { passive: true }); })();
function toastTitle(msg) { // one message at a time (the login bonus, a seasonal gift and a promotion used to land on top of each other)
  if (!msg) return; TOASTQ.push(msg); if (TOASTQ.length === 1) toastNext(); }
function toastNext() { const msg = TOASTQ[0]; if (msg == null) return; const d = document.createElement('div'); d.className = 'toast ttoast'; d.style.cssText = 'pointer-events:none;position:fixed;left:0;right:0;margin:0 auto;width:max-content;max-width:min(86vw,560px);top:calc(54px + env(safe-area-inset-top,0px));z-index:5;animation:pop .35s both, fade .5s ease-in 2.3s forwards'; d.innerHTML = '<span class="ja"></span>'; d.firstChild.textContent = msg; $('#app').appendChild(d); toastPlace(d); setTimeout(() => { if (!d.isConnected) return; d.remove(); toastSubBack(); TOASTQ.shift(); toastNext(); }, 2900); } /* [ホーム iPhone H28] 2026-11-20 オーナー「通知はずっと表示する必要はない。途中で消えてもいい」：4.2 秒 → 2.9 秒で消す */
function toastSubBack() { try { if (!document.querySelector('.ttoast[data-sub]')) $('#tSub').style.visibility = ''; } catch (e) { } }
/* お知らせは、題名のロゴ（チモシーダッシュ！）にかぶせない（毎日の出社ボーナスが、ロゴの1行目をかくしていた：2026-11-15）。
   ロゴの下の一言の帯の上に重ねる（同じ形の帯なので、帯の中身が入れかわったように見える）。帯が見えない画面（横向きなど）では、ロゴより上か、今までの位置 */
/* 2026-11-19 題字（ロゴ）：オーナー「タイトルのデザインを、他のゲームを調べて、このゲームに一番合う形に。AI っぽさをなくして」。
   文字を 1 字ずつ少し傾け・上下させて手で書いたような弾みを出し、のばす棒「ー」はチモシーの穂、「！」は課長のネクタイにする（docs/LOGO-2026-11-19.md） */
function logoBuild() { const h = $('#tLogo'); if (!h) return; const ja = LANG === 'ja', W = { ja: [['チ', 'モ', 'シ', 'ー'], ['ダ', 'ッ', 'シ', 'ュ']], en: [['H', 'A', 'Y'], ['D', 'A', 'S', 'H']], zh: [['牧', '草'], ['衝', '刺']], ko: [['건', '초'], ['대', '시']] }[LANG] || [['H', 'A', 'Y'], ['D', 'A', 'S', 'H']], l1 = W[0], l2 = W[1];
  const sp = a => a.map((c, i) => `<span class="c c${i + 1}">${c}</span>`).join('');
  h.classList.toggle('kana', ja); h.setAttribute('aria-label', l1.join('') + (ja ? '' : ' ') + l2.join('') + (ja ? '！' : '!'));
  h.innerHTML = `<span class="ln l1" aria-hidden="true">${sp(l1)}<i class="hay"></i></span><br><em class="ln l2" aria-hidden="true">${sp(l2)}<i class="tie"></i></em>`; }
function toastPlace(d) { try { const sub = $('#tSub'), logo = $('#tLogo'), app = $('#app').getBoundingClientRect(); const h = d.offsetHeight || 36;
    { const dock = $('#sTitle.home .chars'), cr = $('#sTitle.home #tCareer'); if (dock && dock.offsetParent && !$('#sTitle').hidden) { const c = cr && cr.offsetParent && cr.getBoundingClientRect().height > 8 ? cr.getBoundingClientRect() : null, r = dock.getBoundingClientRect(); d.classList.add('hm'); let tt = c ? c.bottom - app.top + 8 : r.top - app.top - h - 16;
        /* 2026-11-19：背の低いスマホ（320×568）では、昇進の帯の下に出すと左の「ミッション」にかかった。その時は、左右のボタンの間の幅にしぼって、今日の目標の下に出す */
        const mb = $('#btnMissions'), mr = mb && mb.offsetParent ? mb.getBoundingClientRect() : null, td = $('#tToday'); d.classList.remove('hmn', 'hmw');
        if (c && ((mr && tt + app.top + h > mr.top - 4) || (innerWidth < 600 && innerHeight > innerWidth * 1.25))) { /* [H26] たて長のスマホでは、いつも今日の目標の下へ（背の高い画面で目標の札に重なっていた） */ d.classList.add('hmn'); const tr2 = td && td.offsetParent ? td.getBoundingClientRect() : null, tall = innerHeight > innerWidth * 1.25; const fd = $('#sTitle.home #tFeed'), fv = fd && fd.offsetParent && fd.getBoundingClientRect().height > 8; const feetY = typeof TITLE_DOCK !== 'undefined' && TITLE_DOCK.feet > 0 ? TITLE_DOCK.feet + app.top : r.top - 10, roomOk = tr2 && tr2.bottom + 8 + h < feetY - innerWidth * .34; /* 3 人の頭にかからない時だけ目標の下へ。かかる小さい画面は、昇進の帯の上に少しの間だけ重ねる */ tt = tall ? (fv ? c.bottom + 8 : roomOk ? tr2.bottom + 8 : c.top + 10) - app.top : (tr2 ? tr2.bottom : c.bottom) - app.top + 12; d.classList.toggle('hmw', tall && !fv && roomOk); } /* [ホーム iPhone H26] 2026-11-20：新作の札を外したので、お知らせは昇進の帯に重ねず、今日の目標のすぐ下（左右のボタンの間の、細いはば）に出す */ /* 新作の札が出ていない背の低いスマホでは、今日の目標ではなく昇進の帯の上に、少しの間だけ重ねる */ /* [ホーム iPhone H9] たて長のスマホでは、今日の目標の下（3 人の顔の上）に出していたお知らせを、昇進の帯のすぐ下（新作の札の上に少しの間だけ）に出す */
        if (!d.classList.contains('hmn') && td && td.offsetParent) { const q = td.getBoundingClientRect(), y0 = tt + app.top; if (q.height > 8 && y0 < q.bottom + 4 && y0 + h > q.top - 4) tt = q.bottom - app.top + 10; } /* [H60] 2026-11-22：タブレット・パソコンの横長の画面で、お知らせが「今日の目標」の札の字の上に重なっていた。重なる時は、札のすぐ下に出す */
        d.style.setProperty('--tt-top', Math.max(8, Math.round(tt)) + 'px'); return; } } /* 新しいホーム（2026-11-19）：お知らせは、昇進の帯のすぐ下・まん中に出す（左右のボタンやスタートにかぶせない。昇進の帯がない横向きは、台のすぐ上） */
    const sr = sub && sub.offsetParent ? sub.getBoundingClientRect() : null, lr = logo && logo.offsetParent ? logo.getBoundingClientRect() : null;
    let top = null;
    if (sr && sr.height > 8 && sr.top > 0 && sr.bottom < app.bottom) { top = sr.top + sr.height / 2 - h / 2; d.style.minWidth = Math.min(Math.round(sr.width), Math.round(app.width * .86)) + 'px'; sub.style.visibility = 'hidden'; d.dataset.sub = '1'; } /* 帯の上に重ねる間、下の帯の字はかくす（2つの文が重なって読めなかった） */
    else if (lr && lr.height > 8 && lr.bottom + h + 6 < app.bottom * .5) top = lr.bottom + 4;
    if (top != null) { d.style.top = Math.max(4, Math.round(top - app.top)) + 'px';
      const hit = [...document.querySelectorAll('#sTitle button')].some(x => { if (!x.offsetParent) return false; const q = x.getBoundingClientRect(), a = d.getBoundingClientRect(); return q.right > a.left && q.left < a.right && q.bottom > a.top && q.top < a.bottom; });
      if (hit) { d.style.top = 'calc(54px + env(safe-area-inset-top,0px))'; d.style.minWidth = ''; if (d.dataset.sub) { delete d.dataset.sub; sub.style.visibility = ''; } } }
  } catch (e) { } }
function toastClear() { TOASTQ.length = 0; document.querySelectorAll('.ttoast').forEach(d => d.remove()); toastSubBack(); } // the title's messages never follow you into the run
/*TEST-ONLY*/
window.__hayDash = { ev: s => eval(s), BUN, addObs: (seg, t, s, l) => makeObs(seg, t, s, l), markSeen: t => markSeen(t), THEMES, chatRules: () => chatRules(), dbg2: () => { const out = []; computeLight(G.segs[G.ci]); camPrep(); for (const sg of segOrder()) { for (const f of sg.floor.concat(sg.walls.map(w => Object.assign({ wall: 1 }, w)), sg.decos.map(w => Object.assign({ deco: 1 }, w)))) { const m = project(f.v); if (!m) continue; const n = Math.abs(m); let inside = false; const px = W / 2, py = H * .62; for (let i = 0, j = n - 1; i < n; j = i++) { const xi = SCR[i * 2], yi = SCR[i * 2 + 1], xj = SCR[j * 2], yj = SCR[j * 2 + 1]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside; } if (inside) { const sv = []; for (let i = 0; i < f.v.length; i += 3) { const dx = f.v[i] - sg.sx, dz = f.v[i + 2] - sg.sz; sv.push([+(dx * sg.f[0] + dz * sg.f[1]).toFixed(1), +(dx * sg.r[0] + dz * sg.r[1]).toFixed(1)]); } out.push({ seg: sg.id, wall: f.wall, deco: f.deco, pat: f.pat, c: f.c, cur: sg === G.segs[G.ci], len: sg.len, turn: sg.turn, turnIn: sg.turnIn, m, sv }); } } } return JSON.stringify({ G: [G.s, G.lat, G.ci], cam: [CAM.x, CAM.z], out: out.slice(0, 8) }); }, G, act, ITEMS, THEMES, makeObs, startFever, dayPlan, resetRoutes, dbg: () => { const sg = G.segs[G.ci]; computeLight(sg); camPrep(); const camS = (CAM.x - sg.sx) * sg.f[0] + (CAM.z - sg.sz) * sg.f[1]; const out = { camS, Gs: G.s, camY: CAM.y, pitch: CAM.pitch };
    out.q = sg.floor.filter(p => p.mid && p.a < camS + 6 && p.b > camS - 3).map(p => ({ a: p.a, b: p.b, ti: p.ti, m: project(p.v), d: +depthOf(p.v).toFixed(2), y: [SCR[1] | 0, SCR[3] | 0, SCR[5] | 0, SCR[7] | 0] })); return JSON.stringify(out); }, setQ: q => { lowQ = q; G.lockQ = 1; }, prof: () => { // timing of one frame's parts, for tests
    const seg = G.segs[G.ci]; const T = {}; const tm = (k, f) => { const t0 = performance.now(); f(); T[k] = +(performance.now() - t0).toFixed(2); };
    PROF.on = 1; for (const k in PROF) if (k !== 'on') PROF[k] = 0; computeLight(seg); camPrep(); tm('sky', () => drawSky(seg)); for (const sg of segOrder()) tm('seg_' + sg.tid + (sg === seg ? '*' : ''), () => drawSegment(sg, sg === seg)); tm('fx', drawFX); tm('post', postFX); PROF.on = 0; return Object.assign(T, PROF); }, get SV() { return SV; } }; window.__die = die;
G.jumpTo = (tid, clock, day, next) => { // test helper
  G.prepHold = 0; // the start-up preparation does not hold a test that jumps somewhere
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

/* ---- メンテナンス中の表示（2026-11-17 オーナー：「これまで指示した作業が全て終わるまで、ゲームにアクセスしたらメンテナンス中の可愛い表示が出るように」） ----
   公開しているアプリ（HAYDASH_APP）だけに出す。自動チェック（navigator.webdriver）と、オーナーの確かめ用の ?preview=1 では出さない。
   終わったら、下の MAINT を 0 にする（関数の中に置く：起動の途中で呼ぶので、ファイルの後ろの const はまだ使えない） */
function maintShow() {
  const MAINT = 1;
  const END = Date.UTC(2026, 10, 18, 3, 0); // 終了予定：2026-11-18（水）12:00（日本時間）。オーナー「一旦、明日のお昼の12時までにして」（2026-11-17）。延ばす時はここを変える
  try { if (!MAINT || Date.now() >= END || !window.HAYDASH_APP || navigator.webdriver || /[?&]preview=1/.test(location.search)) return; } catch (e) { return; } /* 2026-11-18：終了予定（END）を過ぎたら、新しく公開しなおさなくても、メンテナンス表示は自動で出なくなる（オーナー「一旦、明日のお昼の12時までにして」） */
  const T = { ja: ['ただいまメンテナンス中', 'モチとユズとクリが、東京の町をもっと本物みたいにお手入れしています。', 'もうすぐもどります。また遊びに来てね！'],
    en: ['Under maintenance', 'Mochi, Yuzu and Kuri are making Tokyo look even more real.', 'We will be back soon. Please come again!'],
    zh: ['維護中', 'Mochi、Yuzu 和 Kuri 正在把東京的街道整理得更逼真。', '很快就回來，請再來玩！'], ko: ['점검 중', '모찌와 유자와 쿠리가 도쿄 거리를 더 진짜처럼 손보고 있어요.', '곧 돌아올게요. 또 놀러 와 주세요!'] }[LANG] || null;
  const tx = T || ['ただいまメンテナンス中', 'モチとユズとクリが、東京の町をもっと本物みたいにお手入れしています。', 'もうすぐもどります。また遊びに来てね！'];
  const d = document.createElement('div'); d.id = 'maint'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-live', 'polite');
  d.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:radial-gradient(circle at 30% 20%,#FFF6E4 0,#FCE9D8 40%,#F3DCCB 100%);font-family:"Zen Maru Gothic","Hiragino Sans",sans-serif;color:#3B2A20;text-align:center;overflow:hidden';
  d.innerHTML = '<div style="max-width:420px;width:100%;background:rgba(255,253,248,.92);border-radius:28px;box-shadow:0 10px 30px rgba(120,80,40,.18);padding:22px 20px 26px;position:relative">'
    + '<canvas id="maintCv" width="360" height="200" style="width:100%;max-width:360px;height:auto;display:block;margin:0 auto 6px"></canvas>'
    + '<div style="display:inline-block;background:#F2C230;color:#3B2A20;border-radius:999px;padding:4px 14px;font-weight:900;font-size:13px;letter-spacing:.08em;margin-bottom:10px">🛠 MAINTENANCE</div>'
    + '<h1 style="margin:0 0 10px;font-size:24px;font-weight:900;line-height:1.3">' + tx[0] + '</h1>'
    + (Date.now() < END ? '<div id="maintEnd" style="display:inline-block;margin:0 0 12px;padding:6px 14px;border-radius:14px;background:#FFF0D6;border:2px solid #F2C230;font-weight:900;font-size:15px;line-height:1.4">🕛 ' + ({ ja: '終了予定 11月18日（水）12:00', en: 'Back by Wed, Nov 18, 12:00 (JST)', zh: '預計結束 11月18日（三）12:00（日本時間）', ko: '종료 예정 11월 18일(수) 12:00 (일본 시간)' }[LANG] || '終了予定 11月18日（水）12:00') + '</div>' : '')
    + '<p style="margin:0 0 8px;font-size:15px;line-height:1.7">' + tx[1] + '</p><p style="margin:0;font-size:15px;line-height:1.7;font-weight:700;color:#A0522D">' + tx[2] + '</p></div>';
  document.body.appendChild(d);
  for (const ev of ['keydown', 'keyup', 'pointerdown', 'touchstart', 'wheel']) d.addEventListener(ev, e => e.stopPropagation(), { capture: true });
  addEventListener('keydown', e => { if (document.getElementById('maint')) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  try { G.mode = 'maint'; } catch (e) { }
  const cv = d.querySelector('#maintCv'), g = cv.getContext('2d'); if (!g) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = 360 * dpr; cv.height = 200 * dpr; g.scale(dpr, dpr);
  const pics = [['ren', 'front_sleepy', 70], ['jill', 'front_happy', 180], ['pom', 'front_cheer', 290]].map(([w, f, x]) => { let im = null; try { im = bunFrame(w, f, 0); } catch (e) { } return { w, im, x }; });
  const t0 = performance.now();
  const draw = () => { if (!document.getElementById('maint')) return; const t = (performance.now() - t0) / 1000; g.clearRect(0, 0, 360, 200);
    g.fillStyle = 'rgba(160,120,80,.12)'; g.beginPath(); g.ellipse(180, 178, 160, 14, 0, 0, Math.PI * 2); g.fill();
    for (const p of pics) { if (!p.im || !p.im.width) continue; const k = (p.w === 'pom' ? 112 : 128) / p.im.width, bob = p.w === 'ren' ? Math.sin(t * 1.4) * 1.5 : -Math.abs(Math.sin(t * 2.6 + p.x)) * 6, w = p.im.width * k, h = p.im.height * k; g.drawImage(p.im, p.x - w / 2, 178 - h + bob, w, h); }
    g.fillStyle = '#7A8EA4'; g.font = '900 16px sans-serif'; for (let k = 0; k < 3; k++) { const q = (t * .5 + k / 3) % 1; g.globalAlpha = Math.sin(q * Math.PI); g.fillText('z', 92 + q * 26 + k * 4, 70 - q * 46); } g.globalAlpha = 1; // ねているモチの Zz
    for (let k = 0; k < 6; k++) { const q = (t * .25 + k / 6) % 1, x = 30 + ((k * 97) % 300); g.globalAlpha = Math.sin(q * Math.PI) * .8; g.fillStyle = k % 2 ? '#E86A75' : '#F2C230'; g.beginPath(); g.arc(x, 150 - q * 130, 3 + (k % 3), 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; // ふわふわ上がる光のつぶ
    requestAnimationFrame(draw); };
  requestAnimationFrame(draw);
}

/* [H40・H41] 2026-11-21 オーナー（iPhone の写真 3 枚目）「まだ上下が収まりきってない」「音と設定の位置は、スタート画面の空いている中心より少し右下でもいい」：
   スマホのたて画面では、いちばん下の 1 行（きろく・練習・場所えらび）と、右上の 3 行目（音・設定）をやめ、右の列（ランキング・ユズに聞く）にまとめる。
   横長・大きな画面では、今までの場所にもどす */
function homePlace() { try {
  const ph = innerWidth < 600 && innerHeight > innerWidth, r2 = $('#sTitle .row2'), bank = $('#sTitle .bank'), tog = $('#sTitle .bank .tog') || $('#sTitle .row2 .tog'), keep = $('#tKeepBtns'); if (!r2) return;
  const ids = ['btnRecords', 'btnPractice', 'btnRev'];
  if (ph) { if (tog && tog.parentNode !== r2) r2.prepend(tog); for (const id of ids) { const b = $('#' + id); if (b && b.parentNode !== r2) r2.appendChild(b); } }
  else { if (tog && bank && tog.parentNode !== bank) bank.appendChild(tog); if (keep) for (const id of ids.slice().reverse()) { const b = $('#' + id); if (b && b.parentNode !== keep) keep.prepend(b); } const rv = $('#btnRev'); if (rv && keep && rv.parentNode === keep) keep.appendChild(rv); }
  { const q = $('#btnPractice'); if (q) q.textContent = ph ? tr('練習', 'Practice') : t('practice'); } /* [H44] 右の列の丸いボタンの名前は短く（「練習・場所えらび」は 2 行に切れた。中の画面で場所も選べる） */
  document.getElementById('sTitle') && document.getElementById('sTitle').classList.toggle('hph', ph);
  /* [H85] たて長のスマホ：音・設定の丸 2 つは、いちばん上の段の「日本語」の左に（右の列では、せまい iPhone で設定の丸が画面の外へ出た）。題字にかかる時は今まで通り右の列 */
  if (tog) { tog.classList.remove('toptog'); tog.style.left = tog.style.top = ''; const lang = document.getElementById('btnLangTop') || document.querySelector('#sTitle .langtop'), logo = document.querySelector('#sTitle.home .logo');
    if (ph && lang && lang.offsetParent) { const lr = lang.getBoundingClientRect(), gr = logo ? logo.getBoundingClientRect() : { right: 0 }; tog.classList.add('toptog'); const tw = tog.getBoundingClientRect().width || 80, x = lr.left - tw - 8;
      if (x > gr.right + 6) { const ty = lr.top + (lr.height - 36) / 2; tog.style.left = Math.round(x) + 'px'; tog.style.top = Math.round(ty) + 'px'; const q = tog.getBoundingClientRect(); if (Math.abs(q.left - x) > 1 || Math.abs(q.top - ty) > 1) { tog.style.left = Math.round(2 * x - q.left) + 'px'; tog.style.top = Math.round(2 * ty - q.top) + 'px'; } /* 親に動きの変形があっても、見た目の位置を合わせる */ } else tog.classList.remove('toptog'); } }
} catch (e) { } }
addEventListener('resize', () => homePlace());
/* [H47] 本物の iPhone は字（ウェブの字体）の高さがちがうので、それでもスタートボタンが画面の下にはみ出す時は、下の台（3 人の丸とスタート）を一段小さくする */
/* [H74〜H75] スタートボタンが画面の下にはみ出していないかは、ブラウザの高さではなく「アプリの枠の下」と「見えている高さ」の低い方でくらべる（前は innerHeight だけで、枠が短い iPhone では、はみ出しに気づかなかった）。
   1 段小さくしても入らない時は、もう 1 段（左右の丸・3 人の丸・スタートを小さく）。どの段でも入るまで、たて長のスマホ以外でも見る */
function homeBottom() { const app = document.getElementById('app'), r = app ? app.getBoundingClientRect() : null; let b = innerHeight; if (r && r.height > 0) b = Math.min(b, r.bottom); if (window.visualViewport && visualViewport.height > innerHeight * .75) b = Math.min(b, visualViewport.offsetTop + visualViewport.height + 1); return Math.max(b, innerHeight * .6); }
function homeFit() { try { const t = document.getElementById('sTitle'), st = document.getElementById('btnStart'); if (!t || !st || t.hidden) return; const ph = innerWidth < 600 && innerHeight > innerWidth; if (!ph) { t.classList.remove('hfit', 'hfit2'); return; }
  const over = () => st.getBoundingClientRect().bottom > homeBottom() - 4; if (!t.classList.contains('hfit') && over()) t.classList.add('hfit'); if (t.classList.contains('hfit') && !t.classList.contains('hfit2') && over()) t.classList.add('hfit2'); } catch (e) { } }
function homeFitAgain() { const t = document.getElementById('sTitle'); try { const app = document.getElementById('app'), cut = app ? Math.max(0, Math.round(app.getBoundingClientRect().bottom - innerHeight)) : 0; document.documentElement.style.setProperty('--appCut', Math.min(cut, 130) + 'px'); } catch (e) { } /* [H88] アプリの枠を画面の大きさまでのばした分（iPhone の見えている高さより下）は、iPhone によって見えない時がある（写真で、スタートが下で切れた）。その分だけ、スタートを上に上げておく（見えている時は、スタートの下に少し余白が増えるだけ） */ if (t) t.classList.remove('hfit', 'hfit2'); requestAnimationFrame(() => { try { homePlace(); } catch (e) { } homeFit(); ttFit(); }); }
/* [H76] 今日の目標・今日のチモシーの数（140,000 ✓・170/300）が、枠の右で切れていた（「/30」で切れる）。入りきらない時は、入るまで字を小さくする（いちばん小さくて 6 割） */
function ttFit() { try { for (const b of document.querySelectorAll('#sTitle #tToday .tt-c b')) { b.style.fontSize = ''; if (!b.clientWidth || b.scrollWidth <= b.clientWidth + .5) continue; const f0 = parseFloat(getComputedStyle(b).fontSize) || 19; let k = 1; while (b.scrollWidth > b.clientWidth + .5 && k > .6) { k -= .05; b.style.fontSize = (f0 * k).toFixed(1) + 'px'; } } } catch (e) { } }
addEventListener('resize', homeFitAgain);
try { document.fonts && document.fonts.ready.then(homeFitAgain); if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', homeFitAgain); } catch (e) { } /* [H79] 字の形（フォント）が届いて字が太く・広くなった時も、入り直しを見る */
setTimeout(homeFitAgain, 600); setTimeout(homeFitAgain, 2000);
/* [H87] 2026-11-23 オーナー（iPhone アプリの写真）「また見切れるようになった」：キャラを切りかえた後・アプリにもどった後に、下の台の高さが変わったり、アプリの枠の高さが iPhone の都合で変わったりしても、入り直しを見ていなかった（見るのは起動の時と画面の大きさが変わった時だけ）。
   ホーム画面が出ている間は 0.7 秒ごとに、①アプリの枠が見えている高さに合っているか ②スタートボタンが見えている所に入っているか ③今日の目標の数が枠に入っているか、を見て、ずれていたら直す（直す時だけ動く。見た目は変わらない） */
let HF_LAST = '';
setInterval(() => { try { const t = document.getElementById('sTitle'), st = document.getElementById('btnStart'); if (!t || t.hidden || !st || document.hidden) return; if (iosFill()) { try { resize(); } catch (e) { } }
  const key = innerWidth + 'x' + innerHeight + '|' + Math.round(homeBottom()) + '|' + G.char + '|' + Math.round(st.getBoundingClientRect().height);
  const over = st.getBoundingClientRect().bottom > homeBottom() - 4, clip = [...document.querySelectorAll('#sTitle #tToday .tt-c b')].some(b => b.clientWidth && b.scrollWidth > b.clientWidth + .5);
  if (over || clip || key !== HF_LAST) { HF_LAST = key; homeFitAgain(); } } catch (e) { } }, 700);
