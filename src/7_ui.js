/* ================= screens ================= */
const SCREENS = ['sTitle', 'sPanel', 'sPause', 'sRevive', 'sResult', 'hud'];
function hideAll() { SCREENS.forEach(id => { $('#' + id).hidden = true; }); }
function show(id) { $('#' + id).hidden = false; }
function goTitle() { hideAll(); setupTitle(); show('sTitle'); refreshTitle(); }
function applyLang() {
  { const a = $('#tGuide'); if (a) { a.textContent = LANG === 'ja' ? '遊び方・キャラクター紹介' : 'How to play & characters'; a.href = window.HAYDASH_APP ? (LANG === 'ja' ? './guide.html' : './guide-en.html') : 'https://renjill-hay-dash.pages.dev/' + (LANG === 'ja' ? 'guide' : 'guide-en'); if (window.HAYDASH_APP) a.removeAttribute('target'); } }
  document.documentElement.lang = LANG; $('#cv').setAttribute('aria-label', LANG === 'ja' ? 'レンとジルのチモシーダッシュ' : 'Ren & Jill: Hay Dash');
  $('#tStory').innerHTML = t('story'); $('#tStory').hidden = false; const lr = $('#tLast'); if (SV.runs > 0 && SV.last) { lr.hidden = false; lr.textContent = t('lastRun', fmt(SV.last.score), SV.last.place) + (SV.best ? (LANG === 'ja' ? '　' : ' · ') + t('lastBest', fmt(SV.best)) : ''); } else lr.hidden = true; $('#tSub').textContent = LANG === 'ja' ? 'レンとジル　チモシーダッシュ' : 'Two office bunnies, one mad dash across Tokyo';
  cardTxt('#tRenRole', t('renRole')); cardTxt('#tRenPerk', t('renPerk')); cardTxt('#tJillRole', t('jillRole')); cardTxt('#tJillPerk', t('jillPerk')); { const met = !!SV.pomMet; cardTxt('#tPomRole', t('pomRole')); cardTxt('#tPomPerk', t('pomPerk')); $('#pickPom').hidden = !met; $('#pickPom').parentNode.classList.toggle('three', met); } // the rookie stays a secret until you have met him on the road
  $('#tMis').textContent = t('missions'); $('#tSta').textContent = t('stamps'); $('#tBook').textContent = t('book'); $('#tShop').textContent = t('shop'); $('#tHow').textContent = t('how');
  $('#tBestL').textContent = t('best'); $('#btnRank').textContent = LANG === 'ja' ? 'ランキング' : 'Ranking'; $('#btnRank2').textContent = LANG === 'ja' ? 'ランキングをもっと見る' : 'See the full ranking'; $('#btnLang').textContent = t('lang'); $('#tPause').textContent = t('pause'); $('#btnQuit').textContent = t('quit');
  $('#btnRvNo').textContent = t('seeResult'); $('#btnMenu').textContent = t('menu'); { const m = $('#tResMore'); if (m) m.textContent = t('resMore'); } $('#tCopy').textContent = t('copy'); { const sb = $('#tShareBar'); if (sb) sb.textContent = LANG === 'ja' ? '友だちに挑戦状を送ろう' : 'Challenge a friend';} $('#tShare').textContent = t('share'); $('#tShareImg').textContent = t('shareImg');
  $('#tKick').textContent = LANG === 'ja' ? 'レンとジルの' : 'REN & JILL'; $('#tLogo').innerHTML = LANG === 'ja' ? 'チモシー<br><em>ダッシュ！</em>' : 'HAY<br><em>DASH!</em>'; $('#tSub').textContent = t('tagline'); document.title = t('gameTitle');
  $('#nmRen').textContent = LANG === 'ja' ? 'レン' : 'REN'; $('#nmJill').textContent = LANG === 'ja' ? 'ジル' : 'JILL'; $('#nmPom').textContent = LANG === 'ja' ? 'ポム' : 'POM'; $('#btnStart').textContent = t('start'); $('#btnAgain').textContent = t('again'); $('#btnResume').textContent = t('resume'); $('#tPauseH').textContent = lab('PAUSE');
  $('#lbScore').textContent = LANG === 'ja' ? 'スコア' : 'SCORE'; $('#lbTime').textContent = LANG === 'ja' ? '時刻' : 'TIME'; $('#lbHay').textContent = LANG === 'ja' ? 'チモシー' : 'HAY'; $('#resBest').textContent = lab('NEW BEST!');
  $('#btnChat').textContent = $('#btnChat2').textContent = LANG === 'ja' ? 'ジルに聞く' : 'Ask Jill';
  ['btnMute', 'btnMute2'].forEach(id => $('#' + id).textContent = SV.mute ? t('soundOff') : t('soundOn'));
}
// the character cards are narrow: put each part ("課長" / "ホーランドロップ") on its own line, never split a word
function cardTxt(sel, txt) { const el = $(sel); el.textContent = ''; String(txt).split(/\s*[・：:·]\s*/).forEach((p, i) => { if (i) el.appendChild(document.createElement('br')); const s = document.createElement('span'); s.textContent = p; el.appendChild(s); }); }
function refreshTitle() {
  refreshNameBtn();
  applyLang();
  $('#tBest').textContent = fmt(SV.best); $('#tBank').textContent = fmt(SV.bank); $('#tCareer').innerHTML = careerHTML(); feedCard(); chalCard();
  { const dly = dailyToday(), done = SV.dailyDone === dly.key; $('#tDaily').textContent = (LANG === 'ja' ? '今日のチャレンジ：' : 'Today: ') + L(dly.c.t(dly.n)) + (done ? ' ✓' : (LANG === 'ja' ? '（チモシー300本＋お守り）' : ' (300 hay + charm)')); }
  $('#pickRen').setAttribute('aria-pressed', G.char === 'ren'); $('#pickJill').setAttribute('aria-pressed', G.char === 'jill'); $('#pickPom').setAttribute('aria-pressed', G.char === 'pom');
  if (SV.pomMet && !SV.pomTold) { SV.pomTold = 1; save(); setTimeout(() => { if (G.mode === 'title') toastTitle(t('pomUnlock')); }, 600); }
  $('#dotZukan').hidden = Object.keys(SV.zukan).length <= (SV.seenZukan || 0);
  $('#dotStamps').hidden = Object.keys(SV.stamps).length + Object.keys(SV.album).length <= (SV.seenStamps || 0);
  $('#dotMissions').hidden = !(SV.missions && SV.missions.slots.some(s => s.done));
}
function openPanel(title, sub, html) { if (LANG === 'ja' && sub) { title = esc(sub); sub = ''; } document.querySelectorAll('.toast').forEach(x => x.remove()); if (sub && sub.toUpperCase() === title) sub = ''; $('#pTitle').innerHTML = `${title}<small>${esc(sub)}</small>`; $('#pBody').innerHTML = html; $('#pBody').scrollTop = 0; show('sPanel'); $('#pClose').focus(); }
function closePanel() { $('#sPanel').hidden = true; if (G.mode === 'title') refreshTitle(); }

function openMissions() { SFX.ui(); openPanel('MISSIONS', t('missions'), `<div class="lvl"><b>×${SV.mlevel}</b><span>${esc(t('missionNote'))}</span></div>${missionHTML()}${dailyHTML()}${achHTML()}`); }
function shopHTML() {
  const ups = Object.keys(POW).map(k => {
    const lv = SV.upg[k] || 0, cost = UPG_COST[lv], d = POW[k];
    return `<div class="shop-item"><img src="${SPR_URL[d.ico]}" alt=""><p>${esc(L(d))}<small>${t('durNow', (d.base + lv * 1.4).toFixed(1))}${lv < 5 ? ` → ${(d.base + (lv + 1) * 1.4).toFixed(1)}` : t('max')}</small><span class="pips">${[0, 1, 2, 3, 4].map(i => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</span></p>
      <button class="buy" data-up="${k}" ${lv >= 5 || SV.bank < cost ? 'disabled' : ''}>${lv >= 5 ? 'MAX' : `<img src="${SPR_URL.hay}" alt="">${fmt(cost)}`}</button></div>`;
  }).join('');
  const clover = `<div class="shop-item"><img src="${SPR_URL.clover}" alt=""><p>${t('charmName')}<small>${t('charmNote', SV.clovers)}</small></p><button class="buy" data-buy="clover" ${SV.bank < 500 ? 'disabled' : ''}><img src="${SPR_URL.hay}" alt="">500</button></div>`;
  const mug = `<div class="shop-item"><img src="${SPR_URL.mugIcon}" alt=""><p>${t('mugName')}<small>${t('mugNote')}</small></p>${SV.mug ? `<button class="buy" data-mug="1">${SV.mugOn ? t('unwear') : t('wear')}</button>` : `<button class="buy" data-buy="mug" ${SV.bank < 1500 ? 'disabled' : ''}><img src="${SPR_URL.hay}" alt="">1,500</button>`}</div>`;
  const wear = SV.wear || (SV.wear = { ren: { tie: 'gold', hat: '', suit: '' }, jill: { frame: 'brown', hat: '', suit: '' } }); SV.closet = SV.closet || {};
  const closet = ['ren', 'jill'].map(who => `<h3 class="ph" style="font-size:16px;margin:10px 0 4px">${LANG === 'ja' ? (who === 'ren' ? 'レン' : 'ジル') : who.toUpperCase()}<small>${esc(t('closet'))}</small></h3>` + CLOSET.filter(c => c.who === who && (!c.ev || c.ev === EVENT || SV.closet[c.id])).map(c => {
    const own = SV.closet[c.id], on = own && wear[who][c.slot] === c.v;
    return `<div class="shop-item"><img src="${closetIcon(c)}" alt=""><p>${esc(L(c))}${on ? `<small>${esc(t('wearing'))}</small>` : ''}</p>${own ? `<button class="buy${on ? '' : ' off'}" data-wear="${c.id}">${on ? t('takeOff') : t('putOn')}</button>` : `<button class="buy" data-buy="${c.id}" ${SV.bank < c.cost ? 'disabled' : ''}><img src="${SPR_URL.hay}" alt="">${fmt(c.cost)}</button>`}</div>`; }).join('')).join('');
  return `<div class="bank"><span>${t('bankHave')}</span><span><img src="${SPR_URL.hay}" alt=""> <b>${fmt(SV.bank)}</b></span></div>${ups}${clover}${mug}${closet}<p class="note">${t('closetNote')}</p><p class="note">${t('shopNote')}</p>`;
}
const CLOSET_ICON = {};
function closetIcon(c) { // a small picture of the item
  if (CLOSET_ICON[c.id]) return CLOSET_ICON[c.id];
  const cv = mk(64), g = cv.getContext('2d'); g.translate(32, 40);
  if (c.slot === 'tie') { const keep = WEAR.ren.tie; WEAR.ren.tie = c.v; g.scale(.7, .7); g.translate(0, -36); tie(g, 0, 0, 60, 0); WEAR.ren.tie = keep; }
  else if (c.slot === 'frame') { const keep = WEAR.jill.frame; WEAR.jill.frame = c.v; g.scale(.9, .9); glasses(g, -14, 14, -6, 12); WEAR.jill.frame = keep; }
  else if (c.slot === 'suit') { g.scale(.26, .26); g.translate(0, -20); if (c.v === 'bee') { beeWings(g, 0, -10, .9, -.1); suitOver(g, 'bee', 0, 10, 92, 66); antennae(g, 0, -56, 1.1); } else { suitOver(g, 'zebra', 0, 10, 92, 66); zebraMane(g, 0, -84, 40, 1.2); } }
  else { g.scale(.42, .42); g.translate(0, 20); hat(g, c.v, 1); }
  try { CLOSET_ICON[c.id] = cv.toDataURL(); } catch (e) { CLOSET_ICON[c.id] = ''; } return CLOSET_ICON[c.id];
}
function applyWear() { // put the saved outfit on and repaint the bunnies that changed
  const w = SV.wear || {}; let changed = '';
  for (const who of ['ren', 'jill']) { const src = w[who] || {}; for (const k in WEAR[who]) { const v = src[k] != null ? src[k] : WEAR[who][k]; if (WEAR[who][k] !== v) { WEAR[who][k] = v; changed = changed ? 'both' : who; } } }
  if (changed === 'both') buildBunnies(); else if (changed) buildBunnies(changed);
  return !!changed;
}
function openShop() { SFX.ui(); openPanel('SHOP', t('shop'), shopHTML()); }
function zukanHTML(sel) {
  const n = ZUKAN_ORDER.filter(id => SV.zukan[id]).length;
  const tiles = ZUKAN_ORDER.map(id => { const d = ITEMS[id], got = SV.zukan[id]; return `<button class="zi${got ? '' : ' locked'}${d.kind === 'bad' ? ' ng' : ''}" data-z="${id}"><img src="${SPR_URL[id]}" alt="">${got ? esc(L(d)) : (LANG === 'ja' ? '？？？' : '???')}</button>`; }).join('');
  let det = `<div class="zdetail"><b>${lab('TAP A FOOD')}</b>${esc(t('tapFood'))}</div>`;
  if (sel && SV.zukan[sel]) { const d = ITEMS[sel]; det = `<div class="zdetail"><b>${d.kind === 'bad' ? (LANG === 'ja' ? 'NG｜' : 'DON’T FEED · ') : ''}${esc(L(d))}</b>${esc(L(d.tip)).replace(/\n/g, '<br>')}</div>`; }
  return `<div class="bank"><span>${t('kinds', n, ZUKAN_ORDER.length)}</span></div>${det}<div class="zk">${tiles}</div><p class="note">${esc(t('foodNote'))}</p>`;
}
function openZukan() { SFX.ui(); SV.seenZukan = Object.keys(SV.zukan).length; save(); openPanel('FOOD BOOK', t('book'), zukanHTML()); }
function stampsHTML(sel) {
  const n = STAMP_ORDER.filter(id => SV.stamps[id]).length;
  const tiles = STAMP_ORDER.map(id => { const st = THEMES[id].stamp, got = SV.stamps[id]; return `<button class="st${got ? '' : ' locked'}" data-s="${id}"><img src="${stampSprite(id).toDataURL()}" alt="">${got ? esc(L(st)) : (LANG === 'ja' ? '？？？' : '???')}</button>`; }).join('');
  let det = `<div class="zdetail"><b>${LANG === 'ja' ? '東京スタンプラリー' : 'TOKYO STAMP RALLY'}</b>${esc(t('stampNote'))}</div>`;
  if (sel && SV.stamps[sel]) { const st = THEMES[sel].stamp; det = `<div class="zdetail"><b>${esc(L(st))}</b>${esc(L(st.note))}</div>`; }
  const pics = STAMP_ORDER.filter(id => SV.album[id]).map(id => `<figure><img src="${SV.album[id]}" alt="${esc(L(THEMES[id].stamp))}"><figcaption>${esc(L(THEMES[id].stamp))}</figcaption></figure>`).join('');
  return `<div class="bank"><span>${n} / ${STAMP_ORDER.length}</span></div>${det}<div class="stamps">${tiles}</div><h3 class="ph" style="font-size:18px;margin-top:6px">${LANG === 'ja' ? t('photos') : 'PHOTOS<small>' + t('photos') + '</small>'}</h3>${pics ? `<div class="album">${pics}</div>` : `<p class="note">${t('noPhoto')}</p>`}`;
}
function openStamps() { SFX.ui(); SV.seenStamps = Object.keys(SV.stamps).length + Object.keys(SV.album).length; save(); openPanel('TOKYO', t('stamps'), stampsHTML()); }
function openHow() {
  SFX.ui();
  const ic = k => `<kbd><img src="${SPR_URL[k]}" width="28" alt=""></kbd>`;
  openPanel('HOW TO PLAY', t('how'), `<div class="how">
    <kbd>← →</kbd><span>${t('howSwipeLR')}</span><kbd>↑</kbd><span>${t('howUp')}</span><kbd>↓</kbd><span>${t('howDown')}</span><kbd>ESC</kbd><span>${t('howKeys')}</span></div>
    <div class="zdetail"><b>${lab('GOAL')}</b>${esc(t('howGoal'))}</div>
    <div class="zdetail"><b>${lab('♥ BUMPS')}</b>${esc(t('howBump'))}</div>
    <div class="zdetail"><b>${lab('FEVER')}</b>${esc(t('howFever'))}</div>
    <div class="how">${ic('carrot')}<span>${esc(L(POW.dash))}</span>${ic('papaya')}<span>${esc(L(POW.magnet))}</span>${ic('alfalfa')}<span>${esc(L(POW.jump))}</span>
    ${ic('plane')}<span>${esc(L(POW.fly))}</span>${ic('hanko')}<span>${esc(L(POW.x2))}</span>${ic('clover')}<span>${esc(L(ITEMS.clover))}</span>${ic('choco')}<span>${esc(t('howNG'))}</span></div>
    <div class="zdetail"><b>${LANG === 'ja' ? 'クレジット・ご注意' : 'CREDITS & NOTES'}</b>${esc(t('legal'))}</div>`);
}
function settingsHTML() {
  const o = OPT(), row = (lbl, key, opts) => `<div class="m"><p><b>${esc(lbl)}</b></p><span class="seg">${opts.map(([v, txt]) => `<button class="buy${o[key] === v ? '' : ' off'}" data-opt="${key}" data-v="${v}">${esc(txt)}</button>`).join('')}</span></div>`;
  return row(t('ctrl'), 'ctrl', [['swipe', t('ctrlSwipe')], ['tap', t('ctrlTap')]]) + `<p class="note">${esc(t('ctrlNote'))}</p>` +
    row(t('sens'), 'sens', [['normal', t('sensN')], ['high', t('sensH')]]) + row(t('vib'), 'vib', [[true, t('on')], [false, t('off')]]) +
    row(t('calm'), 'calm', [[true, t('on')], [false, t('off')]]) + row(t('music'), 'music', [[true, t('on')], [false, t('off')]]) + row(t('sfx'), 'sfx', [[true, t('on')], [false, t('off')]]) +
    `<button class="sub" id="btnNameSet">${esc(SV.nick ? t('nameBtn', SV.nick) : t('nameNone'))}</button> <button class="sub" id="btnTut">${esc(t('resetTut'))}</button>` +
    `<div class="m xfer"><p><b>${esc(t('codeH'))}</b></p><p class="note">${esc(t('codeNote'))}</p><div class="btns" style="display:flex;gap:8px"><input id="codeIn" maxlength="24" autocomplete="off" autocapitalize="characters" enterkeyhint="done" placeholder="${esc(t('codePh'))}" style="flex:1;min-width:0;font:inherit;padding:8px 10px;border:2px solid var(--line);border-radius:10px"><button class="sub" id="btnCode" style="width:auto">${esc(t('codeOk'))}</button></div><p class="note" id="codeMsg" aria-live="polite"></p></div>` +
    `<div class="m xfer"><p><b>${esc(t('xfer'))}</b></p><p class="note">${esc(t('xferNote'))}</p><button class="sub" id="btnXferMake">${esc(t('xferMake'))}</button><textarea id="xferOut" readonly rows="3" hidden></textarea>` +
    `<textarea id="xferIn" rows="3" placeholder="${esc(t('xferPaste'))}"></textarea><button class="sub" id="btnXferLoad">${esc(t('xferLoad'))}</button><p class="note" id="xferMsg" aria-live="polite"></p></div>` +
    `<div class="m xfer reset"><p><b>${esc(t('resetH'))}</b></p><p class="note">${esc(t('resetNote'))}</p><button class="sub danger" id="btnReset">${esc(t('resetBtn'))}</button>` +
    `<div id="resetAsk" hidden><p class="note"><b>${esc(t('resetAsk'))}</b></p><div style="display:flex;gap:8px"><button class="sub danger" id="btnResetYes">${esc(t('resetYes'))}</button><button class="sub" id="btnResetNo">${esc(t('resetNo'))}</button></div></div><p class="note" id="resetMsg" aria-live="polite"></p></div>`;
}
/* ---- the player's name for the ranking: asked before the first run, editable any time ---- */
let nameThenStart = 0;
function openName(first) {
  SFX.ui(); nameThenStart = first;
  openPanel('NAME', t('nameTitle'), `<div class="namebox"><input id="nameIn" maxlength="12" autocomplete="off" enterkeyhint="done" placeholder="${esc(t('namePh'))}"><p class="note">${esc(t('nameNote'))}</p>
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
function openSettings() { SFX.ui(); openPanel('SETTINGS', t('settings'), settingsHTML()); }
let rvTimer = null;
function openRevive() {
  const c = reviveCost(), cap = (CAPS[G.cause] || CAPS.obstacle)[G.char];
  $('#rvEn').textContent = LANG === 'ja' ? cap[1] : cap[0]; $('#rvJa').textContent = '';
  const bc = $('#btnRvClover'), bh = $('#btnRvHay');
  const free = freeRevive(); bc.dataset.free = free ? '1' : '';
  bc.textContent = free ? t('reviveFree') : t('reviveClover', c.clover); bc.disabled = !free && SV.clovers < c.clover; bc.style.opacity = bc.disabled ? .45 : 1;
  bh.textContent = t('reviveHay', c.hay); bh.disabled = SV.bank + Math.floor(G.hay) < c.hay; bh.style.opacity = bh.disabled ? .45 : 1; bh.hidden = free;
  $('#rvHave').textContent = free ? t('reviveFreeNote') : t('reviveHave', SV.clovers, fmt(SV.bank + Math.floor(G.hay)));
  if (bc.disabled && bh.disabled) { endRun(); return; }
  hideAll(); show('sRevive');
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
  if (e.code === 'Escape' || e.code === 'KeyP') { if (G.mode === 'play') pause(); else if (G.mode === 'pause') resume(); else if (!$('#sPanel').hidden) closePanel(); return; }
  if ((G.mode === 'title' || G.mode === 'result') && e.code === 'Enter' && $('#sPanel').hidden && !e.target.closest('button,a,summary,input,textarea')) { hideAll(); startRun(); return; }
  const a = KEYMAP[e.code]; if (a && G.mode === 'play') { e.preventDefault(); if (!e.repeat) act(a); }
});
let tp = null;
const stage = $('#app');
stage.addEventListener('pointerdown', e => {
  if (G.mode !== 'play') return; if (e.target.closest('button')) return;
  if (OPT().ctrl === 'tap') { const fx = e.clientX / W, fy = e.clientY / H; act(fx < .33 ? 'left' : fx > .67 ? 'right' : fy < .62 ? 'up' : 'down'); return; }
  tp = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, id: e.pointerId, fired: false };
});
stage.addEventListener('pointermove', e => {
  if (!tp || tp.id !== e.pointerId) return;
  const dx = e.clientX - tp.x, dy = e.clientY - tp.y, th = OPT().sens === 'high' ? 14 : Math.max(20, Math.min(W, H) * .04);
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
$('#shX').onclick = $('#shLine').onclick = () => { SFX.ui(); copyText(SHARE.text() + ' ' + SHARE.url()); }; // the link itself opens X / LINE with the text filled in; the text is also copied, just in case
$('#resNameOk').onclick = () => { $('#resNameToggle').hidden = true; const v = cleanName($('#resNameIn').value); if (!v) return; if (nameBad(v)) { $('#resNameIn').value = ''; $('#resNameIn').placeholder = t('nameNG'); return; } SFX.ui(); setNick(v); SV.nickAsked = 1; save(); $('#resRank .rk-name').hidden = true; rankAfterRun(G.score); };
$('#resNameIn').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); $('#resNameOk').click(); } };
$('#pickRen').onclick = () => { G.char = 'ren'; SV.char = 'ren'; save(); refreshTitle(); audioInit(); SFX.ui(); };
$('#pickJill').onclick = () => { G.char = 'jill'; SV.char = 'jill'; save(); refreshTitle(); audioInit(); SFX.ui(); };
$('#pickPom').onclick = () => { audioInit(); if (!SV.pomMet) return; G.char = 'pom'; SV.char = 'pom'; save(); refreshTitle(); SFX.ui(); };
$('#btnMissions').onclick = openMissions; $('#btnShop').onclick = openShop; $('#btnZukan').onclick = openZukan; $('#btnHow').onclick = openHow; $('#btnStamps').onclick = openStamps;
$('#btnSet').onclick = openSettings;
$('#btnRank').onclick = () => openRanking('month'); $('#btnRank2').onclick = () => { hideAll(); show('sTitle'); setupTitle(); refreshTitle(); openRanking('month'); };
$('#btnLang').onclick = () => { LANG = LANG === 'ja' ? 'en' : 'ja'; SV.lang = LANG; save(); refreshTitle(); SFX.ui(); };
$('#pClose').onclick = closePanel;
$('#sPanel').addEventListener('click', e => {
  const up = e.target.closest('[data-up]'), buy = e.target.closest('[data-buy]'), mg = e.target.closest('[data-mug]'), z = e.target.closest('[data-z]'), sst = e.target.closest('[data-s]');
  if (e.target === $('#sPanel')) { closePanel(); return; }
  if (up) { const k = up.dataset.up, c = UPG_COST[SV.upg[k] || 0]; if (SV.bank >= c && (SV.upg[k] || 0) < 5) { SV.bank -= c; SV.upg[k] = (SV.upg[k] || 0) + 1; save(); SFX.power(); $('#pBody').innerHTML = shopHTML(); } }
  if (buy) { const k = buy.dataset.buy; if (k === 'clover' && SV.bank >= 500) { SV.bank -= 500; SV.clovers++; } if (k === 'mug' && SV.bank >= 1500) { SV.bank -= 1500; SV.mug = true; SV.mugOn = true; SV.wear.ren.hat = ''; applyWear(); }
    const c = CLOSET.find(x => x.id === k); if (c && !SV.closet[c.id] && SV.bank >= c.cost) { SV.bank -= c.cost; SV.closet[c.id] = 1; SV.wear[c.who][c.slot] = c.v; if (c.slot === 'hat' && c.who === 'ren') SV.mugOn = false; applyWear(); } save(); SFX.power(); $('#pBody').innerHTML = shopHTML(); }
  if (mg) { SV.mugOn = !SV.mugOn; if (SV.mugOn) { SV.wear.ren.hat = ''; applyWear(); } save(); SFX.ui(); $('#pBody').innerHTML = shopHTML(); }
  const wr = e.target.closest('[data-wear]'); if (wr) { const c = CLOSET.find(x => x.id === wr.dataset.wear); if (c && SV.closet[c.id]) { const cur = SV.wear[c.who][c.slot]; SV.wear[c.who][c.slot] = cur === c.v ? (c.slot === 'tie' ? 'gold' : c.slot === 'frame' ? 'brown' : '') : c.v; if (c.slot === 'hat' && c.who === 'ren' && SV.wear.ren.hat) SV.mugOn = false; save(); applyWear(); SFX.ui(); $('#pBody').innerHTML = shopHTML(); } }
  if (z) { SFX.ui(); $('#pBody').innerHTML = zukanHTML(z.dataset.z); }
  if (sst) { SFX.ui(); $('#pBody').innerHTML = stampsHTML(sst.dataset.s); }
  const op = e.target.closest('[data-opt]');
  if (op) { const k = op.dataset.opt; let v = op.dataset.v; if (v === 'true') v = true; else if (v === 'false') v = false; SV.opt[k] = v; save(); audioInit(); applyAudioOpt(); SFX.ui(); $('#pBody').innerHTML = settingsHTML(); }
  const rt = e.target.closest('[data-rt]'); if (rt) openRanking(rt.dataset.rt);
  if (e.target.id === 'nickSave') saveNick();
  if (e.target.id === 'nameOk') nameDone(1);
  if (e.target.id === 'nameLater') nameDone(0);
  if (e.target.id === 'btnNameSet') openName(0);
  if (e.target.id === 'btnTut') { SV.tutDone = 0; save(); e.target.textContent = t('resetDone'); }
  if (e.target.id === 'btnXferMake') { saveNow(); xferMake().then(code => { const o = $('#xferOut'); o.hidden = false; o.value = code; o.select(); try { navigator.clipboard.writeText(code).catch(() => { }); } catch (x) { } $('#xferMsg').textContent = t('xferCopied'); }).catch(() => { $('#xferMsg').textContent = t('xferBad'); }); }
  if (e.target.id === 'btnCode') { redeemCode($('#codeIn').value); return; }
  if (e.target.id === 'btnReset') { $('#resetAsk').hidden = false; $('#btnReset').hidden = true; $('#btnResetNo').focus(); return; }
  if (e.target.id === 'btnResetNo') { $('#resetAsk').hidden = true; $('#btnReset').hidden = false; return; }
  if (e.target.id === 'btnResetYes') { resetAll(); return; }
  if (e.target.id === 'btnXferLoad') { const code = $('#xferIn').value.trim(), b = e.target; if (!code) return;
    xferRead(code).then(() => { if (!b.dataset.sure) { b.dataset.sure = 1; $('#xferMsg').textContent = t('xferConfirm'); return; }
      return xferApply(code).then(() => { $('#xferMsg').textContent = t('xferDone'); LANG = SV.lang || LANG; G.char = SV.char || 'ren'; applyWear(); setTimeout(() => { closePanel(); goTitle(); }, 900); }); })
      .catch(() => { b.dataset.sure = ''; $('#xferMsg').textContent = t('xferBad'); }); }
});
const toggleMute = () => { audioInit(); setMute(!SV.mute); applyLang(); };
$('#btnMute').onclick = toggleMute; $('#btnMute2').onclick = toggleMute;
$('#pauseBtn').onclick = pause; $('#btnResume').onclick = resume;
$('#btnQuit').onclick = () => { G.mode = 'dead'; G.cause = 'quit'; endRun(); };
$('#btnRvClover').onclick = () => { clearInterval(rvTimer); doRevive($('#btnRvClover').dataset.free ? 'free' : 'clover'); };
$('#btnRvHay').onclick = () => { clearInterval(rvTimer); doRevive('hay'); };
$('#btnRvNo').onclick = () => { clearInterval(rvTimer); hideAll(); endRun(); };
$('#btnAgain').onclick = () => { hideAll(); startRun(); };
$('#btnKuji').onclick = () => {
  const b = $('#btnKuji'); if (b.disabled) return; b.disabled = true; audioInit(); SFX.ui();
  b.textContent = LANG === 'ja' ? 'カラカラ…' : 'Shaking…';
  setTimeout(() => { const k = drawKuji(); const i = KUJI.indexOf(k); SFX.mission();
    $('#kujiRes').innerHTML = `<div class="slip"><b>${k[0]}</b><p><small>${k[1]}</small>${esc((LANG === 'ja' ? KUJI_MSG.ja : KUJI_MSG.en)[i])}<br>${LANG === 'ja' ? 'チモシー' : 'Hay'} +${k[3]}${k[4] ? (LANG === 'ja' ? '・お守り +1' : ' · charm +1') : ''}</p></div>`;
    b.textContent = LANG === 'ja' ? 'また次のランで' : 'Another fortune next run!'; }, 700);
};
$('#btnMenu').onclick = () => { SFX.ui(); goTitle(); };
$('#btnShare').onclick = () => { SFX.ui(); shareMore(); };

/* ================= boot ================= */
let last = performance.now();
let perfAcc = 0, perfN = 0, lowQ = 0;
// the loop must never die: an error in one frame is reported once and the next frame goes on
let FRAME_ERRS = 0;
function frame(now) {
  try { frameBody(now); } catch (e) { FRAME_ERRS++; window.__frameErr = (window.__frameErr || 0) + 1; window.__frameErrMsg = String(e && e.message || e); if (FRAME_ERRS < 4) console.error('frame error', e); try { for (let i = 0; i < 12; i++) ctx.restore(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; } catch (e2) { } }
  requestAnimationFrame(frame);
}
function frameBody(now) {
  const raw = (now - last) / 1000, dt = Math.min(.05, raw); last = now;
  if (G.mode === 'play' && raw < .25) { perfAcc += raw; perfN++; if (perfN >= 90) { const avg = perfAcc / perfN; perfAcc = perfN = 0; if (avg > 1 / 42 && lowQ < 2 && !G.lockQ) { lowQ++; if (lowQ === 1) { DPR = 1; resizeKeep(); } } } }
  TEXN = 0; TEXB = performance.now() + 3;
  if (G.mode !== 'pause' && G.mode !== 'dead' && G.mode !== 'result') update(dt);
  render();
  if (G.mode === 'play') texWarm(Math.max(0, Math.min(3, TEXB - performance.now())));
  if (G.capture && G.capture.t <= 0) { takePhoto(G.capture.tid); G.capture = null; }
  if (G.mode === 'title') { drawCharCard($('#cvRen'), 'ren', G.t); drawCharCard($('#cvJill'), 'jill', G.t + 1.3); if (SV.pomMet) drawCharCard($('#cvPom'), 'pom', G.t + .6); }
  if (SAVE_DIRTY && G.mode !== 'play' && G.mode !== 'countdown') saveNow();
  musicTick();
}
addEventListener('pagehide', () => { try { saveNow(); } catch (e) { } });
function resizeKeep() { cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
function boot() {
  buildItemSprites(); buildWorldSprites(); buildBunnies(); applyWear(); rankIcons(); rankInit(); chatInit(); resize(); addEventListener('resize', resize);
  $('#hHayIco').src = SPR_URL.hay; $('#tHayIco').src = SPR_URL.hay;
  G.char = SV.char || 'ren';
  goTitle(); document.documentElement.classList.remove('booting'); // the page shows only once its words are in the player's language
  const td = todayStr();
  if (SV.daily !== td) { const y = new Date(Date.now() - 864e5); const ys = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate(); SV.streak = SV.daily === ys ? Math.min(7, SV.streak + 1) : 1; SV.daily = td; const b = 30 + SV.streak * 20; SV.bank += b; save(); refreshTitle(); toastTitle(t('daily', SV.streak, b)); }
  if (EVENT) { const gifts = CLOSET.filter(c => c.ev === EVENT && !SV.closet[c.id]); if (gifts.length) { for (const c of gifts) SV.closet[c.id] = 1; save(); const g = (EVENT_INFO.gift || EV_KITS[EVENT].gift), until = EVENT_INFO.to ? (LANG === 'ja' ? `（〜${+EVENT_INFO.to.slice(5, 7)}/${+EVENT_INFO.to.slice(8, 10)}）` : ` (to ${EVENT_INFO.to.slice(5).replace('-', '/')})`) : ''; setTimeout(() => toastTitle(L(g) + until), document.querySelector('.toast') ? 4300 : 300); } }
  loadFeed();
  setTimeout(() => { try { if (!CLOUD_SPR.length) buildCloudSprites(); if (!FTEX.asphalt) buildFloorTex(); } catch (e) { } }, 1200); // ready before the first street
  requestAnimationFrame(frame);
}
/* ---- SNS × game: a small feed (the latest episode and secret words) published next to the app (feed.json) ----
   The automation updates feed.json after each post; the game shows the latest episode on the title screen and
   lets players redeem the secret word from a post. Words are stored hashed (SHA-256 of the word in capitals). */
const FEED_URL = (window.HAYDASH_APP ? './' : 'https://renjill-hay-dash.pages.dev/') + 'feed.json';
let FEED = null; try { FEED = JSON.parse(localStorage.getItem('rjFeed') || 'null'); } catch (e) { }
function loadFeed() { try { fetch(FEED_URL + '?t=' + Math.floor(Date.now() / 36e5), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => { if (!j || typeof j !== 'object') return; FEED = j; try { localStorage.setItem('rjFeed', JSON.stringify(j)); } catch (e) { } feedCard(); }).catch(() => { }); } catch (e) { } }
function chalCard() { // a friend sent you their score: show it right above the START button
  let el = $('#tChal'); const on = CHAL && !CHAL.won; if (!on) { if (el) el.hidden = true; return; }
  if (!el) { el = document.createElement('div'); el.id = 'tChal'; el.className = 'chalcard'; el.setAttribute('role', 'note'); const b = $('#btnStart'); b.parentNode.insertBefore(el, b); }
  el.hidden = false; const ic = RANK_ICON[CHAL.c] || ''; el.innerHTML = `${ic ? `<img src="${ic}" alt="">` : ''}<span><small>${esc(t('chalCard'))}</small><b>${esc(t('chalBody', fmt(CHAL.s)))}</b></span>`;
}
function feedCard() {
  let el = $('#tFeed'); const e = FEED && FEED.latest; if (!e || !e.url || !/^https:\/\//.test(e.url)) { if (el) el.hidden = true; return; }
  if (!el) { el = document.createElement('a'); el.id = 'tFeed'; el.target = '_blank'; el.rel = 'noopener'; el.className = 'feedcard'; const c = $('#tCareer'); if (!c) return; c.parentNode.insertBefore(el, c.nextSibling); }
  el.hidden = false; el.href = e.url; el.innerHTML = `<small>${esc(t('feedNew'))}</small><b>${esc(LANG === 'ja' ? (e.ja || e.en || '') : (e.en || e.ja || ''))}</b><i>▶</i>`;
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
function toastTitle(msg) { const d = document.createElement('div'); d.className = 'toast'; d.style.cssText = 'pointer-events:none;position:absolute;left:0;right:0;margin:0 auto;width:max-content;max-width:86vw;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:5;animation:pop .35s both, fade .5s ease-in 3.5s forwards'; d.innerHTML = '<span class="ja"></span>'; d.firstChild.textContent = msg; $('#app').appendChild(d); setTimeout(() => d.remove(), 4200); }
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
