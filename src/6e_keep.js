/* ================= もっと高い点を目指して、続けて遊びたくなる仕組み（2026-11-13 オーナーの依頼：すぐ飽きてやめてしまう） =================
   Everything here hangs off four hooks: kpPre()/kpStart() (startRun), kpHud() (every frame of a run), kpEnd() (the result) and
   kpTitle() (the title). It applies to normal runs only (not Relaxed, not the 1-minute game, not practice).
   The numbers live in SV.kp (small, travels with a transfer code; an old save simply has none):
   d/db today's best, w/wb this week's best, lw last week's best, h the last 10 scores, top the 10 best runs, cb best per runner,
   md medals earned, sp the best run's score at each 3-hour mark, tg the day today's target was reached, fr the day of the first-run bonus,
   ls the last day played (for the welcome-back gift), last the score before this one. */
const KS = {
  nextBest: ['自己ベスト', 'Best'], nextToday: ['今日のベスト', "Today's best"], nextGoal: ['今日の目標', "Today's goal"], nextMile: ['つぎの大台', 'Next'],
  mile: ['{0}点 突破！ チモシー＋{1}本', '{0} points! +{1} hay'], best75: ['自己ベストの75%！ あと {0}点', '75% of your best! {0} to go'], best90: ['自己ベストまであと少し！ あと {0}点', 'Almost your best! {0} to go'],
  todayUp: ['今日のベストをこえた！', "Past today's best!"], goalHit: ['今日の目標スコア達成！ チモシー＋{0}本', "Today's score goal done! +{0} hay"], rivalUp: ['{0} さんをぬいた！', 'You passed {0}!'],
  comboB: ['{0}コンボ！ ＋{1}', '{0} combo! +{1}'], paceUp: ['ベストのときより ＋{0}', '+{0} vs your best run'], paceDn: ['ベストのときより −{0}', '−{0} vs your best run'],

  vsFirst: ['最初の記録！ 次はこの点をこえよう', 'Your first score! Beat it next'], vsUp: ['自己ベストを {0} 更新！', 'New best by {0}!'], vsDown: ['自己ベストの {1}%（あと {0}点）', '{1}% of your best ({0} to go)'], vsDownS: ['自己ベストの {1}%', '{1}% of your best'],
  lastUp: ['前回より ＋{0}', '+{0} vs last run'], lastDn: ['前回より −{0}', '−{0} vs last run'], todayB: ['今日のベスト {0}', "Today's best {0}"], weekB: ['今週のベスト {0}', "This week's best {0}"],
  near: ['おしい！ あと {0}点で自己ベスト。もう1回！', 'So close! {0} more for a new best. One more run!'],
  tipFever: ['コツ：チモシーを続けて取るとゲージがたまり、フィーバーで点が2倍', 'Tip: keep collecting hay to fill the gauge — Fever doubles your points'],
  tipCombo: ['コツ：チモシーを切らさず取るとコンボ。30コンボからボーナス', 'Tip: collect hay without a gap for a combo — bonuses start at 30'],
  tipNice: ['コツ：障害物をギリギリでよけると「ナイス！」で点が入る', 'Tip: dodge at the last moment for a “Nice!” bonus'],
  tipOffice: ['コツ：9:00までにオフィスに着くと大きなボーナス', 'Tip: reach the office by 9:00 for a big bonus'],
  tipMission: ['コツ：ミッションを3つ達成すると、スコア倍率が上がる', 'Tip: clear all three missions to raise your score multiplier'],
  tipLong: ['コツ：長く走るほど速くなり、1mあたりの点も増える', 'Tip: the longer you run, the faster you go and the more each metre is worth'],
  medal: ['スコア勲章「{0}」 ＋{1}本', 'Score medal: {0} +{1}'], medalC: ['スコア勲章「{0}」 ＋{1}本・お守り＋{2}', 'Score medal: {0} +{1}, +{2} charm'],
  first: ['今日の1回目ボーナス ＋{0}本', 'First run today: +{0} hay'], chain: ['れんぞく{0}回目 ＋{1}本', 'Run {0} in a row: +{1} hay'], weekBeat: ['先週のベストをこえた！ お守り＋1', "Beat last week's best! +1 charm"],
  goalDone: ['今日の目標スコア達成 ＋{0}本', "Today's goal done +{0}"], dayUp: ['今日のベスト更新！', "New best today!"],
  again: ['れんぞく{0}回目：チモシー＋{1}%', 'Run {0} in a row: +{1}% hay'],
  bdH: ['点数のうちわけ', 'Where the points came from'], bdD: ['走った距離', 'Distance'], bdC: ['チモシー・ごはん', 'Hay & food'], bdB: ['技・ボーナス', 'Tricks & bonuses'],
  histH: ['最近の5回', 'Last 5 runs'], multL: ['スコア倍率 ×{0}　ミッションをあと{1}つ達成で ×{2}', 'Score multiplier x{0} — {1} more mission(s) for x{2}'],
  unlockNow: ['「{0}」が買える！（購買部）', 'You can buy “{0}” now (Shop)'], unlockLeft: ['あと {0}本で「{1}」が買える', '{0} more hay buys “{1}”'],
  tmrw: ['明日も来ると ログインボーナス {0}本（{1}日連続）', 'Come back tomorrow: +{0} hay (day {1} in a row)'],
  rivalNext: ['次の順位：{0} さんまで あと {1}点', 'Next up: {0} — {1} points ahead'], rivalTop: ['今月の1位です！', "You're #1 this month!"],
  tToday: ['今日 {0}', 'Today {0}'], tWeek: ['今週 {0}', 'Week {0}'], tGoal: ['今日の目標 {0}点（+{1}本）', "Today's goal {0} (+{1} hay)"], tGoalOk: ['今日の目標 {0}点 ✓', "Today's goal {0} ✓"],
  
  rec: ['きろく', 'Records'], recH: ['自分の記録', 'Your records'], recTop: ['ベスト10', 'Top 10 runs'], recNone: ['まだ記録がありません。まず1回走ろう！', 'No records yet. Go for a run!'],
  recAvg: ['最近10回の平均', 'Average of last 10'], recChar: ['キャラクターごとのベスト', 'Best by runner'], recMedal: ['スコア勲章', 'Score medals'], recNext: ['次の勲章：{0}点', 'Next medal: {0}'],
  cbest: ['ベスト {0}', 'Best {0}'], back: ['おかえりなさい！ チモシー{0}本とお守りをどうぞ', 'Welcome back! Here are {0} hay and a charm'],
  reroll: ['ミッションを入れかえる（チモシー{0}本）', 'Swap a mission ({0} hay)'],
};
const kt = (k, ...a) => tr(KS[k][0], KS[k][1]).replace(/\{(\d)\}/g, (_, i) => a[i] ?? '');
const KP_MILE = [10000, 25000, 50000, 100000, 250000, 500000, 1e6, 2.5e6, 5e6, 1e7, 2.5e7, 5e7, 1e8, 2.5e8, 5e8, 1e9];
const KP_MEDAL = [[10000, '見習いランナー', 'Trainee runner', 50, 0], [30000, '通勤ランナー', 'Commuter', 80, 0], [100000, '快速ランナー', 'Rapid runner', 120, 0], [300000, '特急ランナー', 'Express runner', 160, 0],
  [1e6, '100万点クラブ', 'Million club', 200, 1], [3e6, '東京の風', 'Wind of Tokyo', 250, 0], [1e7, '1000万点クラブ', 'Ten-million club', 300, 1], [3e7, '光のランナー', 'Runner of light', 400, 0], [1e8, '1億点の伝説', 'Hundred-million legend', 500, 2]];
const KP_COMBO = [30, 60, 100, 150, 200, 300, 500], KP_GOAL_HAY = 150, KP_REROLL = 100;
let KP_CHAIN = 0, KP_RIVALS = [], KP_RIVAL_T = 0;
const kpN = v => Number.isFinite(+v) && +v > 0 ? Math.floor(+v) : 0;
let KP_REF = null, KP_DAY = '';
function kp() { // the kept numbers, always in shape (an old or damaged save has none or odd ones)
  let k = SV.kp; if (k && k === KP_REF && KP_DAY === todayStr()) return k; // looked over once a day per save (this is asked for every frame of a run)
  if (!k || typeof k !== 'object' || Array.isArray(k)) k = SV.kp = {};
  k.h = Array.isArray(k.h) ? k.h.map(kpN).slice(-10) : []; k.top = Array.isArray(k.top) ? k.top.filter(r => Array.isArray(r) && kpN(r[0])).slice(0, 10) : [];
  if (!k.cb || typeof k.cb !== 'object') k.cb = {}; if (!k.sp || typeof k.sp !== 'object') k.sp = {}; k.md = Math.min(KP_MEDAL.length, kpN(k.md));
  const td = todayStr(), wk = weekKey(); if (k.d !== td) { k.d = td; k.db = 0; } if (k.w !== wk) { k.lw = k.w ? kpN(k.wb) : 0; k.w = wk; k.wb = 0; k.lwDone = 0; }
  k.db = kpN(k.db); k.wb = kpN(k.wb); k.lw = kpN(k.lw); k.last = kpN(k.last); KP_REF = k; KP_DAY = td; return k;
}
function kpNormal() { return !G.easy && !G.practice; }
// today's score goal: a little under what you usually reach (60% of your best, in round numbers), so it is in reach every day and grows with you
function kpGoal() { const b = SV.best || 0; if (b < 2000) return 2000; const g = b * .6, p = Math.pow(10, Math.max(2, Math.floor(Math.log10(g)) - 1)); return Math.round(g / p) * p; }
function kpGoalDone() { return kp().tg === todayStr(); }
function kpPre() { KP_CHAIN = G.mode === 'result' ? KP_CHAIN + 1 : 0; } // “one more run” straight from the result keeps the chain going
function kpStart() {
  const k = kp(); G.kp = { mile: 0, t75: 0, t90: 0, dayTold: 0, goalTold: 0, comboI: 0, ck: Math.floor(480 / 180), split: {}, rivals: [], tgt: null };
  { const el = document.getElementById('kpGoal'); if (el) el.hidden = true; }
  if (!kpNormal()) { KP_CHAIN = 0; return; }
  G.kp.rivals = KP_RIVALS.filter(r => r.s > 0).sort((a, b) => a.s - b.s).slice(0, 3);
  k.ls = todayStr(); // スタートブースト（チモシー 200 本でスコア 2 倍とマグネット）はやめた（2026-11-15 オーナーの判断）
}
// the next thing to beat, in order of how close it is
function kpTarget() {
  const k = kp(), sc = G.score, c = [];
  if (!kpGoalDone() && !G.kp.goalTold) c.push({ s: kpGoal(), l: kt('nextGoal'), k: 'goal' });
  if (k.db > 0 && !G.kp.dayTold) c.push({ s: k.db, l: kt('nextToday'), k: 'day' });
  if ((SV.best || 0) > 500) c.push({ s: SV.best, l: kt('nextBest'), k: 'best' });
  for (const r of G.kp.rivals) c.push({ s: r.s, l: r.n, k: 'rival' });
  { const m = KP_MILE.find(x => x > sc); if (m) c.push({ s: m, l: kt('nextMile'), k: 'mile' }); }
  let best = null; for (const x of c) if (x.s > sc && (!best || x.s < best.s)) best = x; return best;
}
function kpHud() {
  const box = document.getElementById('kpGoal'); if (!G.kp || !box) return;
  if (!kpNormal() || !SV.tutDone || G.mode !== 'play') { if (!box.hidden) box.hidden = true; return; }
  const K = G.kp, k = kp(), sc = G.score, best = SV.best || 0;
  // marks passed on the way up
  while (K.mile < KP_MILE.length && sc >= KP_MILE[K.mile]) { const m = KP_MILE[K.mile], hay = 5 * (K.mile + 1); K.mile++; if (sc < m * 2.4) { G.hay += hay; G.stats.kpMile = (G.stats.kpMile || 0) + 1; banner(fmt(m) + '!', kt('mile', fmt(m), hay), 'good'); tone(659, .1, 'bell', .05); tone(988, .16, 'bell', .045, AU.ctx && AU.ctx.currentTime + .09); } }
  if (best > 4000 && !G.bestTold) { if (!K.t75 && sc >= best * .75) { K.t75 = 1; if (sc < best * .9) banner('75%', kt('best75', fmt(best - sc)), 'room'); } if (!K.t90 && sc >= best * .9) { K.t90 = 1; if (sc < best) banner('ALMOST!', kt('best90', fmt(best - sc)), 'good'); } }
  if (!K.dayTold && k.db > 0 && sc > k.db) { K.dayTold = 1; if (k.db < best * .98) { banner("TODAY'S BEST!", kt('todayUp'), 'good'); tone(784, .12, 'bell', .045); } }
  if (!K.goalTold && !kpGoalDone() && sc >= kpGoal()) { K.goalTold = 1; k.tg = todayStr(); G.hay += KP_GOAL_HAY; G.stats.kpGoal = 1; banner('GOAL!', kt('goalHit', KP_GOAL_HAY), 'good'); SFX.mission(); save(); }
  while (K.rivals.length && sc > K.rivals[0].s) { const r = K.rivals.shift(); G.stats.kpRival = (G.stats.kpRival || 0) + 1; banner('RANK UP!', kt('rivalUp', r.n), 'good'); tone(880, .1, 'bell', .05); react('cheer', 0); }
  // combo bonuses: 30, 60, 100 ... (they start over when the combo breaks)
  if (G.combo < 5) K.comboI = 0; else if (K.comboI < KP_COMBO.length && G.combo >= KP_COMBO[K.comboI]) { const n = KP_COMBO[K.comboI++], pts = n * 5 * SV.mlevel; G.score += pts; G.stats.kpCombo = (G.stats.kpCombo || 0) + 1; floatText(W / 2, cheerY(.42), kt('comboB', n, fmt(pts)), '#FF8A5C'); tone(1047, .1, 'bell', .045); }
  // pace: your score at every 3-hour mark of the day, next to the same mark of your best run
  { const ck = Math.floor(((G.day - 1) * 1440 + G.clock) / 180); if (ck > K.ck) { K.ck = ck; K.split[ck] = Math.floor(sc); const was = kpN(k.sp[ck]); if (was > 0 && best > 500) { const d = Math.floor(sc) - was; G.stats.kpPace = d; floatText(W / 2, cheerY(.3), d >= 0 ? kt('paceUp', fmt(d)) : kt('paceDn', fmt(-d)), d >= 0 ? '#7DD87A' : '#F6EBDC'); } } }
  // the bar under the score: the next thing to beat
  if (!K.tgt || sc >= K.tgt.s) { K.tgt = kpTarget(); K.from = K.tgt ? Math.min(sc, K.tgt.s * .5) : 0; }
  if (!K.tgt) { if (!box.hidden) box.hidden = true; return; }
  if (box.hidden) box.hidden = false;
  { const isB = K.tgt.k === 'best', near = isB && sc >= K.tgt.s * .85; if (box.classList.contains('kpg-best') !== isB) box.classList.toggle('kpg-best', isB); if (box.classList.contains('kpg-near') !== near) box.classList.toggle('kpg-near', near); } // 自己ベストの棒は太く金色、あと少しで光る（head.html）
  setStyle('kpFill', 'width', Math.round(clamp((sc - K.from) / Math.max(1, K.tgt.s - K.from), 0, 1) * 50) * 2 + '%'); setText('kpNext', K.tgt.l + '\n' + fmt(K.tgt.s));
}
function kpGrade(sc, prevBest, newBest) { if (!(prevBest > 0)) return ''; if (newBest) return 'S'; const r = sc / prevBest; return r >= .8 ? 'A' : r >= .5 ? 'B' : r >= .25 ? 'C' : 'D'; }
function kpTip(st) { // one thing that would have raised this score the most
  if (!(st.fevers > 0)) return kt('tipFever'); if ((st.maxCombo || 0) < 30) return kt('tipCombo'); if ((st.nice || 0) < 3) return kt('tipNice'); if (!st.office && !G.rev) return kt('tipOffice');
  if (SV.missions && SV.missions.slots.some(s => !s.done) && SV.mlevel < 6) return kt('tipMission'); return kt('tipLong');
}
function kpUnlock() { // the cheapest thing in the Shop you do not own yet
  let best = null; for (const c of CLOSET) { if (!c.cost || c.lg != null || c.ev || SV.closet[c.id] || (c.who === 'pom' && !SV.pomMet)) continue; if (!best || c.cost < best.cost) best = c; }
  if (!best) return ''; const left = best.cost - SV.bank; return left <= 0 ? kt('unlockNow', L(best)) : kt('unlockLeft', fmt(left), L(best));
}
function kpEnd(o) {
  const box = $('#resKeep'), more = $('#resKeepMore'), again = $('#btnAgain'); if (!box || !more) return;
  again.textContent = t('again'); again.classList.remove('pulse');
  if (!kpNormal()) { box.hidden = more.hidden = true; return; }
  const k = kp(), st = G.stats, sc = Math.floor(G.score), prevBest = o.prevBest || 0, newBest = !!o.newBest, td = todayStr(), badges = [], medals = []; let extra = 0;
  const last = k.last; k.last = sc; k.ls = td;
  const dayUp = k.db > 0 && sc > k.db; k.db = Math.max(k.db, sc); k.wb = Math.max(k.wb, sc); k.cb[G.char] = Math.max(kpN(k.cb[G.char]), sc);
  if (sc > 0) { k.h.push(sc); k.h = k.h.slice(-10); k.top.push([sc, G.char[0], td, curSeg().tid]); } k.top.sort((a, b) => b[0] - a[0]); k.top = k.top.slice(0, 10);
  if (newBest || !Object.keys(k.sp).length) k.sp = Object.assign({}, G.kp.split); // the pace to beat is the best run's
  if (dayUp && !newBest) badges.push(['new', kt('dayUp')]);
  if (k.lw > 0 && sc > k.lw && !k.lwDone) { k.lwDone = 1; SV.clovers++; badges.push(['new', kt('weekBeat')]); }
  while (k.md < KP_MEDAL.length && Math.max(SV.best || 0, sc) >= KP_MEDAL[k.md][0]) { const m = KP_MEDAL[k.md++]; SV.bank += m[3]; SV.clovers += m[4]; medals.push(['new', m[4] ? kt('medalC', tr(m[1], m[2]), m[3], m[4]) : kt('medal', tr(m[1], m[2]), m[3])]); }
  badges.push(...medals.slice(-2)); // a player who was already far along gets every medal at once: the last two are named, all are paid
  if (st.kpGoal) badges.push(['', kt('goalDone', KP_GOAL_HAY)]);
  if (k.fr !== td && G.dist > 150) { k.fr = td; const b = Math.floor(o.gained * .5); if (b > 0) { extra += b; badges.push(['', kt('first', b)]); } }
  if (KP_CHAIN > 0 && G.dist > 150) { const b = Math.floor(o.gained * .05 * Math.min(5, KP_CHAIN)); if (b > 0) { extra += b; badges.push(['', kt('chain', KP_CHAIN + 1, b)]); } }
  if (extra) { SV.bank += extra; $('#resHay').textContent = fmt(o.gained + extra); }
  save();
  const grade = kpGrade(sc, prevBest, newBest), near = !newBest && prevBest > 0 && sc >= prevBest * .85;
  /* 2026-11-15（オーナー：文字が多い）：結果画面の文字を減らす。①「あと○点」は、すぐ下の「おしい！」が言うので、近い時は上の行から外す ②前回との差・今週のベストは「くわしく見る」の中へ。今日のベストは、今回がそれに届かなかった時だけ ③コツは、はじめの 12 回と、自己ベストの半分に届かなかった時だけ */
  const vs = !(prevBest > 0) ? kt('vsFirst') : newBest ? kt('vsUp', fmt(sc - prevBest)) : near ? kt('vsDownS', 0, Math.floor(sc / prevBest * 100)) : kt('vsDown', fmt(prevBest - sc + 1), Math.floor(sc / prevBest * 100)) /* 「あと○点」は、すぐ下の「おしい！」と同じ数（こえるのに要る点）にそろえる。前は 1 点ずれていた */;
  const subAll = []; if (last > 0 && sc !== last) subAll.push(sc > last ? kt('lastUp', fmt(sc - last)) : kt('lastDn', fmt(last - sc))); subAll.push(kt('todayB', fmt(k.db))); if (k.wb > k.db) subAll.push(kt('weekB', fmt(k.wb)));
  const sub = sc < k.db ? [kt('todayB', fmt(k.db))] : [], showTip = (SV.runs || 0) <= 12 || (prevBest > 0 && sc < prevBest * .5);
  const low = prevBest > 0 && !newBest && sc < prevBest * .25; /* [B52] 自己ベストの 4 分の 1 にも届かない時は、「D」と「自己ベストの 0%（あと 131,177点）」の行を出さない（数字が大きく、がっかりさせるだけで、画面の字が多かった。コツの一行は出る） */
  box.hidden = false; box.innerHTML = (low ? '' : `<div class="kp-top">${grade ? `<b class="kp-grade g${grade}" aria-label="${grade}">${grade}</b>` : ''}<div class="kp-lines"><p class="kp-vs">${esc(vs)}</p>${sub.length ? `<p class="kp-sub">${sub.map(esc).join('<i>・</i>')}</p>` : ''}</div></div>`)
    + (near ? `<p class="kp-near">${esc(kt('near', fmt(prevBest - sc + 1)))}</p>` : '') + (badges.length ? `<div class="kp-badges">${badges.map(b => `<span class="${b[0]}">${esc(b[1])}</span>`).join('')}</div>` : '')
    + (showTip ? `<p class="kp-tip">${esc(kpTip(st))}</p>` : '') + `<p class="kp-rival" id="kpRival" hidden></p>`;
  if (near && !OPT().calm) again.classList.add('pulse');
  { const n = Math.min(5, KP_CHAIN + 1); again.innerHTML = `${esc(t('again'))}<small>${esc(kt('again', KP_CHAIN + 2, n * 5))}</small>`; }
  // the folded part: where the points came from, the last five runs, what comes next
  const d = Math.max(0, st.ptD || 0), c = Math.max(0, st.ptC || 0), b = Math.max(0, sc - d - c), tot = Math.max(1, d + c + b), row = (l, v, cl) => `<div class="kp-bd"><span>${esc(l)}</span><i><b class="${cl}" style="width:${(v / tot * 100).toFixed(1)}%"></b></i><em>${fmt(Math.floor(v))}</em></div>`;
  const h = k.h.slice(-5), hm = Math.max(1, ...h), left = SV.missions ? SV.missions.slots.filter(s => !s.done).length : 0, ul = kpUnlock(), strk = (SV.streak || 0) + 1;
  more.hidden = false; more.innerHTML = `<p class="kp-line">${subAll.map(esc).join('<i>・</i>')}</p><p class="kp-h">${esc(kt('bdH'))}</p>${row(kt('bdD'), d, 'd')}${row(kt('bdC'), c, 'c')}${row(kt('bdB'), b, 'b')}`
    + `<p class="kp-h">${esc(kt('histH'))}</p><div class="kp-hist">${h.map((v, i) => `<span${i === h.length - 1 ? ' class="now"' : ''}><i style="height:${Math.max(6, Math.round(v / hm * 100))}%"></i><em>${fmtShort(v)}</em></span>`).join('')}</div>`
    + (left > 0 ? `<p class="kp-line">${esc(kt('multL', SV.mlevel, left, SV.mlevel + 1))}</p>` : '') + (ul ? `<p class="kp-line">${esc(ul)}</p>` : '')
    + `<p class="kp-line">${esc(kt('tmrw', 30 + Math.min(7, strk) * 20, strk))}</p>`;
  if (KP_RIVALS.test) kpRivalFetch(sc); // (the live list is asked for by rankAfterRun, once this month's own best is known)
}
function fmtShort(v) { v = Math.floor(v); return v >= 1e8 ? (v / 1e8).toFixed(1) + (LANG === 'ja' ? '億' : LANG === 'zh' ? '億' : LANG === 'ko' ? '억' : 'e8') : v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e4 ? Math.round(v / 1e3) + 'K' : fmt(v); }
// the players just above you this month: named on the result, and passed by name on the next run (three small reads, at most once a minute)
async function kpRivalFetch(mine) {
  mine = Math.max(1, Math.floor(mine || 0));
  const show = () => { const e = document.getElementById('kpRival'); if (!e) return; const r = KP_RIVALS.filter(x => x.s > mine).sort((a, b) => a.s - b.s)[0]; e.hidden = !(r || KP_RIVALS.top); e.textContent = r ? kt('rivalNext', r.n, fmt(r.s - mine + 1)) : KP_RIVALS.top ? kt('rivalTop') : ''; };
  try {
    if (KP_RIVALS.test) { show(); return; }
    if (!rankOn() || !kpNormal() || G.rev) return; const now = Date.now(); if (now - KP_RIVAL_T < 60000) { show(); return; } KP_RIVAL_T = now;
    const mkey = monthKey(), sn = await RANK.db.collection('ranks').where(mkey, '>', mine).orderBy(mkey, 'asc').limit(3).get();
    const rows = sn.docs.map(d => Object.assign({ id: d.id }, d.data())).filter(r => r.id !== RANK.uid), nameOf = await rankNames(rows);
    KP_RIVALS = rows.map(r => ({ s: kpN(r[mkey]), n: nameOf(r.id) })).filter(r => r.s > 0); KP_RIVALS.top = !rows.length; show();
  } catch (e) { }
}
function kpTitle() {
  const k = kp(), anchor = $('#tDaily'); if (!anchor) return;
  let e = $('#tKeep'); if (!e) { e = document.createElement('div'); e.id = 'tKeep'; e.className = 'tkeep'; anchor.before(e); }
  const goal = kpGoal(), done = kpGoalDone(), bits = []; if (k.db > 0) bits.push(kt('tToday', fmt(k.db))); if (k.wb > 0 && k.wb !== k.db) bits.push(kt('tWeek', fmt(k.wb)));
  e.hidden = !SV.tutDone; e.innerHTML = `<p class="${done ? 'ok' : ''}">${esc(done ? kt('tGoalOk', fmt(goal)) : kt('tGoal', fmt(goal), KP_GOAL_HAY))}</p>` + (bits.length ? `<p class="s">${bits.map(esc).join('<i>・</i>')}</p>` : '');
  { const b = $('#btnBoost'); if (b) b.remove(); }
  let row = $('#tKeepBtns'); if (!row) { row = document.createElement('div'); row.id = 'tKeepBtns'; e.after(row); }
  let r = $('#btnRecords'); if (!r) { r = document.createElement('button'); r.id = 'btnRecords'; r.className = 'sub small'; r.onclick = kpRecords; row.prepend(r); }
  $('#tKeepBtns').hidden = !SV.tutDone;
  r.hidden = !SV.tutDone; r.textContent = kt('rec'); if (typeof homePlace === 'function') homePlace();
  for (const [w, id] of [['ren', 'pickRen'], ['jill', 'pickJill'], ['pom', 'pickPom']]) { const card = $('#' + id); if (!card) continue; let s = card.querySelector('.cbest'); if (!s) { s = document.createElement('span'); s.className = 'cbest'; card.appendChild(s); } const v = kpN(k.cb[w]); s.hidden = !v; s.textContent = v ? kt('cbest', fmt(v)) : ''; }
}
// 題名の「今日」：目標・チモシー・チャレンジを 1 つの枠に（2026-11-15 文字を減らす：3 行の文 → 数字と棒。元の行は試験と置き場所のために残し、見えなくする）
function todayGrid() {
  const card = $('#sTitle .card'), anchor = $('#tKeep'); if (!card || !anchor) return;
  let e = $('#tToday'); if (!e) { e = document.createElement('div'); e.id = 'tToday'; e.className = 'ttoday'; anchor.before(e); }
  const on = !!SV.tutDone; e.hidden = !on; card.classList.toggle('tgrid', on); if (!on) return;
  const k = kp(), goal = kpGoal(), gdone = kpGoalDone(), gk = gdone ? 1 : Math.min(1, kpN(k.db) / Math.max(1, goal));
  const n = SV.dayHay && SV.dayHay.d === todayStr() ? SV.dayHay.n : 0, hk = Math.min(1, n / DAY_GOAL), hdone = n >= DAY_GOAL, dly = dailyToday(), cdone = SV.dailyDone === dly.key;
  const cell = (lbl, val, kk, ok) => { const ln = String(val).replace(/<[^>]*>/g, '').length + (ok ? 2 : 0); /* [ホーム iPhone H17] 数の長さで字の大きさを変える（29,000,000 などの長い数がとなりの数にかかって読めなかった） */ /* [H83] 2026-11-23 オーナー「何桁に行っても見切れないように」：数の字の数（--n）と枠の幅から、CSS で字の大きさを決める（枠の幅 ÷ 字の数。どの桁でも枠に入る） */ return `<div class="tt-c${ok ? ' ok' : ''}"><span class="tt-r" style="--tk:${(+kk).toFixed(3)}" aria-hidden="true"></span><small>${esc(lbl)}</small><b><span class="ttn" style="--n:${ln}">${val}${ok ? ' ✓' : ''}</span></b><i><u style="width:${(kk * 100).toFixed(0)}%"></u></i></div>`; };
  e.style.setProperty('--hk', hk.toFixed(3)); e.classList.toggle('hdone', hdone); /* [スタート S31] 小さいスマホでは「今日のチモシー」の数を出せないので、札の下の細い緑の線で進み具合を見せる */
  e.innerHTML = cell(tr('今日の目標', "Today's goal"), fmt(goal), gk, gdone) + cell(tr('今日のチモシー', 'Hay today'), `${fmt(Math.min(n, DAY_GOAL))}<s>/${DAY_GOAL}</s>`, hk, hdone)
    + `<p class="tt-ch${cdone ? ' ok' : ''}"><span>${esc(L(dly.c.t(dly.n)))}</span><em>${cdone ? '✓' : '+300'}</em></p>`;
  const row = $('#tKeepBtns'); if (row) for (const id of ['btnPractice', 'btnRev']) { const b = $('#' + id); if (b && b.parentNode !== row && !b.closest('.row2')) row.appendChild(b); } /* [H86] 2026-11-23 オーナー「スマホでキャラクターを切りかえると、練習のロゴだけ動く」：右の列にある練習ボタンを、いったん下の列へ移して右の列へもどしていた（入れ直すたびに出てくる動きが最初から動いた）。右の列にある時は動かさない */ // 小さなボタンは 1 つの列に（1 行ずつ縦に並べない）
  if (typeof homePlace === 'function') homePlace();
  if (typeof ttFit === 'function') requestAnimationFrame(ttFit); /* [H76] 数が枠に入るか見る */
}
function kpRecords() {
  SFX.ui(); const k = kp(), nm = { r: tr('モチ', 'Mochi'), j: tr('ユズ', 'Yuzu'), p: tr('クリ', 'Kuri') }, avg = k.h.length ? Math.round(k.h.reduce((a, b) => a + b, 0) / k.h.length) : 0, best = SV.best || 0;
  /* [ミッション 20] 記録の画面：数の札に絵（王冠・太陽・グラフ）と色 */
  const tile = (ic, c, lbl, v) => `<span class="rt" style="--mc:${c}"><i>${msvg(ic)}</i><small>${esc(lbl)}</small><b>${fmt(v)}</b></span>`;
  const last = k.h.length ? k.h[k.h.length - 1] : 0, prev2 = k.h.length > 1 ? k.h[k.h.length - 2] : 0, diff = last - prev2; /* [ミッション 25] 前の回とくらべて、上がったか下がったか */
  const trend = k.h.length > 1 ? `<div class="rtrend ${diff >= 0 ? 'up' : 'dn'}">${msvg(diff >= 0 ? 'jump' : 'slide', 'sm')}${tr('前の回より', 'vs. the run before')} <b>${diff >= 0 ? '+' : '−'}${fmt(Math.abs(diff))}</b></div>` : '';
  const tiles = `<div class="rtiles">${tile('crown', '#D6A23C', t('best'), best)}${tile('sun', '#E8A82E', kt('nextToday'), k.db)}${tile('chart', '#4E77A0', kt('recAvg'), avg)}</div>`;
  /* [ミッション 21] 最近 10 回の点数のぼうグラフ（平均の点線・いちばん高い回は金色） */
  let chart = ''; if (k.h.length) { const mx = Math.max(1, ...k.h), Wc = 300, Hc = 92, bw = Wc / 10, ay = Hc - avg / mx * (Hc - 14), hi = k.h.indexOf(mx);
    chart = `<div class="rchart"><p class="kp-h">${msvg('chart', 'sm')}${tr('最近の点数', 'Recent runs')}</p><svg viewBox="0 0 ${Wc} ${Hc + 14}" aria-hidden="true">${k.h.map((v, i) => { const h = Math.max(3, v / mx * (Hc - 14)), x = i * bw + bw * .18; return `<rect x="${x.toFixed(1)}" y="${(Hc - h).toFixed(1)}" width="${(bw * .64).toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${i === hi ? '#D6A23C' : i === k.h.length - 1 ? '#7FB23F' : '#C9B79F'}"/>`; }).join('')}<path d="M0 ${ay.toFixed(1)} H${Wc}" stroke="#4E77A0" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${Wc - 2}" y="${(ay - 4).toFixed(1)}" text-anchor="end" class="rcl">${tr('平均', 'avg')} ${fmt(avg)}</text><text x="${((k.h.length - 1) * bw + bw / 2).toFixed(1)}" y="${Hc + 12}" text-anchor="middle" class="rcl">${tr('今回', 'last')}</text></svg></div>`; }
  /* [ミッション 22] キャラクターごとのベスト：ホーム画面の顔の絵と、いちばん高い人に対する帯 */
  const who = ['ren', 'jill'].concat(SV.pomMet ? ['pom'] : []), cbMax = Math.max(1, ...who.map(w => kpN(k.cb[w]))), face = w => { try { const c = document.getElementById({ ren: 'cvRen', jill: 'cvJill', pom: 'cvPom' }[w]); return c && c.width ? c.toDataURL() : ''; } catch (e) { return ''; } }, wc = { ren: '#D6A23C', jill: '#C8463C', pom: '#E88A2E' };
  const chars = who.map(w => { const v = kpN(k.cb[w]), f = face(w); return `<div class="rch" style="--mc:${wc[w]}">${f ? `<img src="${f}" alt="">` : `<i>${esc(nm[w[0]].slice(0, 1))}</i>`}<div><small>${esc(nm[w[0]])}</small><b>${fmt(v)}</b><span class="mbar"><i style="width:${(v / cbMax * 100).toFixed(0)}%"></i></span></div></div>`; }).join('');
  /* [ミッション 23] ベスト 10：上の 3 つは金・銀・銅の表彰台の札、4 位からは小さな行（場所と日付） */
  const md = ['#D6A23C', '#A9B4BF', '#C88A55'], row = (r, i) => { const th = THEMES[r[3]]; return `<li class="${i < 3 ? 'pod' : ''}" style="--mc:${md[i] || '#C9B79F'}"><span class="rrk">${i < 3 ? msvg('medal') : ''}<em>${i + 1}</em></span><b>${fmt(r[0])}</b><span class="rpl">${esc(nm[r[1]] || '')}${th ? ' · ' + esc(L(th)) : ''}</span><small>${esc(String(r[2] || '').split('-').slice(1).join('/'))}</small></li>`; };
  const top = k.top.length ? `<ol class="rtop">${k.top.map(row).join('')}</ol>` : `<p class="note">${esc(kt('recNone'))}</p>`;
  /* [ミッション 24] 点数の勲章：道の上に並んだメダル（取った物は金色）と、次の勲章までの帯 */
  const nx = KP_MEDAL[k.md], prev = k.md ? KP_MEDAL[k.md - 1][0] : 0, kk = nx ? Math.max(0, Math.min(1, (best - prev) / (nx[0] - prev))) : 1;
  const road = `<div class="rroad">${KP_MEDAL.map((m, i) => `<span class="${i < k.md ? 'got' : i === k.md ? 'nx' : ''}"><i>${msvg(i < k.md ? 'medal' : 'lock')}</i><small>${esc(tr(m[1], m[2]))}</small><em>${fmt(m[0])}</em></span>`).join('')}</div>${nx ? `<div class="rnx"><span>${esc(kt('recNext', fmt(nx[0])))}</span><span class="mbar"><i style="width:${(kk * 100).toFixed(0)}%"></i></span></div>` : ''}`;
  openPanel('RECORDS', kt('recH'), `<div class="kp-rec rec2">${tiles}${trend}${chart}<p class="kp-h">${msvg('star', 'sm')}${esc(kt('recChar'))}</p><div class="rchs">${chars}</div><p class="kp-h">${msvg('crown', 'sm')}${esc(kt('recTop'))}</p>${top}<p class="kp-h">${msvg('medal', 'sm')}${esc(kt('recMedal'))}</p>${road}</div>`);
  try { const r = document.querySelector('.rroad .nx'); if (r) r.scrollIntoView({ inline: 'center', block: 'nearest' }); } catch (e) { }
}
// back after three days or more away: a small gift, once
function kpComeback() {
  const k = kp(), td = todayStr(), day = s => { const p = String(s || '').split('-').map(Number); return p.length === 3 && p.every(Number.isFinite) ? Math.floor(new Date(p[0], p[1] - 1, p[2]).getTime() / 864e5) : 0; };
  const lastSeen = day(k.ls) || day(SV.daily), now = day(td); k.ls = td;
  if ((SV.runs || 0) > 0 && lastSeen && now - lastSeen >= 3) { SV.bank += 300; SV.clovers++; save(); setTimeout(() => toastTitle(kt('back', 300)), 900); return true; } save(); return false;
}
// a mission that does not suit you can be swapped for another (the level, and so the score multiplier, never gets stuck on one)
function kpReroll(id) {
  if (!SV.missions || SV.bank < KP_REROLL) return false; const i = SV.missions.slots.findIndex(s => s.id === id && !s.done); if (i < 0) return false;
  const pool = eligible().filter(m => !SV.missions.slots.some(s => s.id === m.id)); if (!pool.length) return false; const m = pick(pool);
  SV.bank -= KP_REROLL; SV.missions.slots[i] = { id: m.id, target: m.f(SV.mlevel), base: SV.totals[m.stat] || 0, prog: 0, done: 0 }; save(); return true;
}
function kpRerollHTML() { if (!SV.missions) return ''; const open = SV.missions.slots.filter(s => !s.done); if (!open.length) return '';
  return `<div class="kp-reroll"><span>${esc(kt('reroll', KP_REROLL))}</span>${open.map(s => { const m = MT.find(x => x.id === s.id); return m ? `<button class="sub small" data-reroll="${esc(s.id)}"${SV.bank < KP_REROLL ? ' disabled' : ''}>${esc(L(m.t(s.target)))}</button>` : ''; }).join('')}</div>`; }
