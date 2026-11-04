/* ================= achievements, daily challenge, omikuji ================= */
// each achievement: test(stats of this run, save) -> true when earned
const ACH = [
  { id: 'firstOffice', hay: 100, n: { ja: 'はじめての出社', en: 'First day at work' }, d: { ja: '9:00までにオフィスに着く', en: 'Reach the office by 9:00' }, ok: s => s.office },
  { id: 'yamanote', hay: 80, n: { ja: '山手線デビュー', en: 'Yamanote rookie' }, d: { ja: '山手線の車内を走りぬける', en: 'Run through a Yamanote train' }, ok: s => s.yamanote },
  { id: 'lunch', hay: 120, n: { ja: 'ランチの達人', en: 'Lunch expert' }, d: { ja: 'お昼休みに外へランチに行く', en: 'Go out for lunch' }, ok: s => s.lunch },
  { id: 'chime', hay: 300, n: { ja: '定時ダッシャー', en: 'Six o’clock dasher' }, d: { ja: '18:00の定時チャイムまで走る', en: 'Run until the 6 PM chime' }, ok: s => s.chime },
  { id: 'deadline', hay: 200, n: { ja: '締め切りに勝った', en: 'Beat the deadline' }, d: { ja: '締め切りラッシュを走りきる', en: 'Survive the deadline rush' }, ok: s => s.chime && s.deadline },
  { id: 'tower', hay: 250, n: { ja: '赤い電波塔の外階段制覇', en: 'Red tower climber' }, d: { ja: '赤い電波塔の外階段を登りきる', en: 'Climb the red tower’s outdoor stairs' }, ok: s => s.towerTop },
  { id: 'skytree', hay: 250, n: { ja: '展望回廊ランナー', en: 'Sky walkway runner' }, d: { ja: '地上450mの展望回廊を走りきる', en: 'Run the whole 450 m sky walkway' }, ok: s => s.skytreeTop },
  { id: 'asakusa', hay: 150, n: { ja: '雷門くぐり', en: 'Under the lantern' }, d: { ja: '浅草の雷門をくぐる', en: 'Pass through Kaminarimon' }, ok: s => s.asakusa },
  { id: 'day2', hay: 500, n: { ja: '2日目の朝', en: 'Day two' }, d: { ja: '一晩走りきって2日目の朝を迎える', en: 'Run through the night to day 2' }, ok: s => s.day >= 2 },
  { id: 'day3', hay: 800, n: { ja: '皆勤賞', en: 'Perfect attendance' }, d: { ja: '3日目の朝を迎える', en: 'Reach day 3' }, ok: s => s.day >= 3 },
  { id: 'combo100', hay: 200, n: { ja: 'もぐもぐ名人', en: 'Munch master' }, d: { ja: '100コンボを決める', en: 'Get a 100 combo' }, ok: s => s.maxCombo >= 100 },
  { id: 'clean1k', hay: 200, n: { ja: '安全運転', en: 'Careful runner' }, d: { ja: 'ぶつからずに1000m走る', en: 'Run 1000 m without a bump' }, ok: s => s.clean >= 1000 },
  { id: 'noBad', hay: 150, n: { ja: '飼い主の鑑', en: 'Responsible owner' }, d: { ja: 'ダメな食べ物を一度も食べずに出社する', en: 'Reach the office without eating anything bad' }, ok: s => s.office && !s.bads.length },
  { id: 'fly3', hay: 150, n: { ja: '紙ひこうき乗り', en: 'Paper pilot' }, d: { ja: '1回のランで紙ひこうきに3回乗る', en: 'Fly 3 paper planes in one run' }, ok: s => s.flights >= 3 },
  { id: 'look10', hay: 120, n: { ja: '目が合った', en: 'Eye contact' }, d: { ja: '1回のランで振り向いた顔を10回見る', en: 'See 10 look-backs in one run' }, ok: s => s.looks >= 10 },
  { id: 'pom', hay: 300, n: { ja: '新人歓迎', en: 'Welcome, rookie' }, d: { ja: 'ひまわりの種をひろって、ナゾの新入社員と合流する', en: 'Pick up the sunflower seeds and meet the mystery new hire' }, ok: s => s.pom },
  { id: 'pomPuff', hay: 200, n: { ja: 'ほお袋いっぱい', en: 'Full pouches' }, d: { ja: 'ポムのほお袋をいっぱいにする', en: 'Fill Pom’s cheek pouches' }, ok: s => s.pomPuff },
  { id: 'stamps5', hay: 300, n: { ja: '東京さんぽ', en: 'Tokyo stroller' }, d: { ja: '観光スタンプを5種類集める', en: 'Collect 5 different stamps' }, ok: (s, sv) => Object.keys(sv.stamps).length >= 5 },
  { id: 'stampsAll', hay: 1500, n: { ja: '東京マスター', en: 'Tokyo master' }, d: { ja: '観光スタンプを全部集める', en: 'Collect every stamp' }, ok: (s, sv) => STAMP_ORDER.every(k => sv.stamps[k]) },
  { id: 'bookAll', hay: 1000, n: { ja: 'うさぎ博士', en: 'Bunny food expert' }, d: { ja: 'えさ図鑑をすべてうめる', en: 'Complete the food book' }, ok: (s, sv) => ZUKAN_ORDER.every(k => sv.zukan[k]) },
];
function checkAch(live) {
  SV.ach = SV.ach || {};
  const st = Object.assign({}, G.stats, { day: G.day, maxCombo: G.stats.maxCombo || 0 });
  const got = [];
  for (const a of ACH) if (!SV.ach[a.id] && a.ok(st, SV)) { SV.ach[a.id] = todayStr(); SV.bank += a.hay; got.push(a); }
  if (got.length) { save(); if (live) for (const a of got) { banner('NEW TITLE!', t('achGot', L(a.n), a.hay), 'good'); SFX.mission(); } }
  return got;
}
function achHTML() {
  SV.ach = SV.ach || {};
  const n = ACH.filter(a => SV.ach[a.id]).length;
  return `<h3 class="ph" style="font-size:18px">${LANG === 'en' ? `TITLES<small>${n} / ${ACH.length} earned</small>` : t('titlesN', n, ACH.length)}</h3>` + ACH.map(a => { const g = SV.ach[a.id];
    return `<div class="m${g ? ' done' : ''}"><p><b>${esc(L(a.n))}</b><br><small>${esc(L(a.d))}</small></p><span class="n">${g ? '✓' : '+' + a.hay}</span></div>`; }).join('');
}

/* ---- today's challenge: the same for everyone on the same date ---- */
const DAILY = [
  { k: 'stamp', n: () => 1, t: n => ({ ja: '観光スタンプを1つとる', en: 'Grab a Tokyo stamp' }), v: s => s.stampsGot || 0 },
  { k: 'hay', n: () => 250, t: n => ({ ja: `1回のランでチモシーを${n}本`, en: `Collect ${n} hay in one run` }), v: s => s.hay },
  { k: 'combo', n: () => 60, t: n => ({ ja: `${n}コンボを決める`, en: `Get a ${n} combo` }), v: s => s.maxCombo || 0 },
  { k: 'treat', n: () => 6, t: n => ({ ja: `果物のおやつを${n}個`, en: `Eat ${n} fruit treats` }), v: s => s.treats },
  { k: 'fly', n: () => 2, t: n => ({ ja: `紙ひこうきに${n}回乗る`, en: `Fly the paper plane ${n} times` }), v: s => s.flights },
  { k: 'lunch', n: () => 1, t: () => ({ ja: 'お昼休みまで走る', en: 'Make it to the lunch break' }), v: s => s.lunch ? 1 : 0 },
  { k: 'look', n: () => 6, t: n => ({ ja: `振り向いた顔を${n}回見る`, en: `See ${n} look-backs` }), v: s => s.looks },
];
function dailyToday() { const d = new Date(); const seed = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate(); const c = DAILY[seed % DAILY.length]; return { c, n: c.n(), key: todayStr() }; }
function dailyCheck(live) {
  const dly = dailyToday(); SV.dailyDone = SV.dailyDone || '';
  if (SV.dailyDone === dly.key) return false;
  if (dly.c.v(G.stats) >= dly.n) { SV.dailyDone = dly.key; SV.bank += 300; SV.clovers++; save(); if (live) { banner('DAILY CLEAR!', tr('チャレンジ達成！ チモシー300本＋お守り', 'Daily challenge done! +300 hay and a lucky charm'), 'good'); SFX.mission(); react('sparkle', 1); } return true; }
  return false;
}
function dailyHTML() { const dly = dailyToday(), done = SV.dailyDone === dly.key; return `<div class="m${done ? ' done' : ''}"><p><b>${tr('今日のチャレンジ', "Today's challenge")}</b><br>${esc(L(dly.c.t(dly.n)))}</p><span class="n">${done ? 'CLEAR' : '+300'}</span></div>`; }

/* ---- omikuji (a fortune slip) after a good run ---- */
const KUJI = [['大吉', 'GREAT LUCK', 4, 400, 1], ['中吉', 'GOOD LUCK', 10, 200, 0], ['小吉', 'SMALL LUCK', 18, 120, 0], ['吉', 'FAIR LUCK', 30, 80, 0], ['末吉', 'LUCK ON THE WAY', 38, 40, 0]];
const KUJI_MSG = { ja: ['チモシーが山ほど届くでしょう', '書類がいつもより早く片づく日', '課長のマグカップが見つかるかも', '定時に帰れる予感', '寄り道に良いことあり'], en: ['Mountains of hay are coming your way', 'Your paperwork will fly by today', 'The boss may find his mug', 'You’ll leave work on time', 'A detour will bring good fortune'] };
function drawKuji() {
  const r = Math.random() * 100; let acc = 0, pickK = KUJI[KUJI.length - 1];
  for (const k of KUJI) { acc += k[2]; if (r < acc) { pickK = k; break; } }
  SV.bank += pickK[3]; if (pickK[4]) SV.clovers++; save();
  return pickK;
}

/* ---- the career: experience from everything you do turns into office promotions ---- */
const RANKS = [['見習い', 'Trainee'], ['新入社員', 'New hire'], ['一人前', 'Associate'], ['主任', 'Supervisor'], ['係長', 'Team lead'], ['課長代理', 'Deputy manager'], ['課長', 'Manager'], ['次長', 'Senior manager'], ['部長', 'Director'], ['本部長', 'Division head'], ['常務', 'Managing director'], ['専務', 'Executive director'], ['副社長', 'Vice president'], ['社長', 'President'], ['会長', 'Chairman'], ['伝説のうさぎ', 'Legendary bunny']];
function careerXP() { const T = SV.totals || {}; return Math.round((T.hay || 0) * .5 + (T.veg || 0) * 2 + (SV.runs || 0) * 40 + Object.keys(SV.stamps || {}).length * 120 + Object.keys(SV.ach || {}).length * 150 + Object.keys(SV.zukan || {}).length * 40 + (SV.best || 0) * .02); }
function careerNeed(lv) { return Math.round(200 * Math.pow(1.5, lv)); } // xp from this level to the next
function careerLevel(xp) { let lv = 0, acc = 0; while (lv < RANKS.length - 1 && xp >= acc + careerNeed(lv)) { acc += careerNeed(lv); lv++; } return { lv, into: xp - acc, need: careerNeed(lv), max: lv >= RANKS.length - 1 }; }
function careerTitle(lv) { const r = RANKS[Math.min(lv, RANKS.length - 1)]; return tr(r[0], r[1]); }
function careerHTML() { const c = careerLevel(careerXP()); const pct = c.max ? 100 : Math.round(c.into / c.need * 100);
  const li = c.max ? legendInfo() : null; const lp = li ? Math.round(li.into / li.need * 100) : pct;
  return `<div class="career${li ? ' legend' : ''}"><span class="cr-t">${esc(careerTitle(c.lv))}${li && li.stars ? ' ★' + li.stars : ''}</span><span class="cr-lv">Lv.${c.lv + 1}</span><span class="cr-bar"><i style="width:${lp}%"></i></span><small>${li ? t('nextStar', fmt(li.need - li.into)) : t('nextPromo', fmt(c.need - c.into))}</small></div>`; }
/* ---- beyond the top rank: Legendary bunny stars (no end) ----
   Reaching Legendary bunny unlocks the laurel and the gold coat (all three), Legend mode (faster, x1.5 score) and a star on the board.
   Every LEGEND_STEP more experience adds a star: ★1 the golden sparkle trail, ★2 a gold name on the ranking, and every star hay + a charm. */
const LEGEND_STEP = 50000;
function legendInfo() { const c = careerLevel(careerXP()); if (!c.max) return null; const stars = Math.floor(c.into / LEGEND_STEP); return { stars, into: c.into % LEGEND_STEP, need: LEGEND_STEP }; }
const LEGEND_PERKS = [{ star: 0, ja: '伝説の月桂冠と金の礼服（3人とも）・伝説モード', en: 'Laurel & gold coat for all three, Legend mode' }, { star: 1, ja: '伝説の輝き（走ると金色の光の粒）', en: 'Golden sparkle trail' }, { star: 2, ja: 'ランキングの金の名札', en: 'A gold name on the ranking' }];
function legendGrant() { const li = legendInfo(); if (!li) return ''; let msg = ''; const seen = SV.lstar == null ? -1 : SV.lstar;
  if (seen < 0) { for (const c of CLOSET) if (c.lg != null && c.lg <= li.stars) SV.closet[c.id] = 1; msg = tr('伝説のうさぎ！ 月桂冠・金の礼服・伝説モードが使えます', 'Legendary bunny! Laurel, gold coat and Legend mode unlocked'); }
  if (li.stars > Math.max(0, seen)) { const n = li.stars - Math.max(0, seen); SV.bank += 2000 * n; SV.clovers = (SV.clovers || 0) + n; const p = LEGEND_PERKS.find(x => x.star === li.stars);
    msg = (msg ? msg + '　' : '') + t('legendStar', li.stars, fmt(2000 * n), n, p ? t('sep') + L(p) : ''); }
  if (seen !== li.stars) { SV.lstar = li.stars; save(); }
  return msg; }
const legendOn = k => { const li = legendInfo(); return !!li && li.stars >= ({ mode: 0, aura: 1, gold: 2 })[k]; };
// called after a run: a promotion is announced and rewarded
function careerCheck() { const lv = careerLevel(careerXP()).lv, was = SV.career || 0; if (lv <= was) return legendGrant(); SV.career = lv; const rw = 200 + lv * 100; SV.bank += rw; SV.clovers = (SV.clovers || 0) + 1; const lg = legendGrant(); return t('promoted', careerTitle(lv), rw) + (lg ? '　' + lg : ''); }
