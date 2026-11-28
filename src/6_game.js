const MAXSPD = 17.5;
const lowTop = o => o.k === 'high' && !o.full && o.top < 1.1; // low tables (slide under them, or jump onto / over them)
/* ================= game state ================= */
const GAME_URL = (window.HAYDASH_CONFIG && window.HAYDASH_CONFIG.url) || (window.HAYDASH_APP && /^https?:/.test(location.href) ? location.href.split('#')[0].split('?')[0] : 'https://hay-dash.coana.co.jp/');
const WEATHERS = ['clear', 'rain', 'clear', 'snow']; // by season: spring, rainy summer, autumn, winter
const G = {
  mode: 'title', t: 0, segs: [], ci: 0, s: 0, lane: 1, prevLane: 1, lat: 0, y: 0, vy: 0, slideT: 0, air: false,
  speed: 10.5, dist: 0, distEst: 0, speedEst: 10, score: 0, hay: 0, combo: 0, comboT: 0,
  pow: { dash: 0, magnet: 0, jump: 0, x2: 0, fly: 0 }, shield: 0, fever: 0, feverG: 0, chaseT: 0, chaseVis: 0, invT: 0,
  clock: 480, day: 1, turnQueued: 0, turnQT: 0, turnT: 0, char: SV.char, reviveN: 0, dyingT: 0, cause: '',
  plan: [], fork: null, forkRest: null, weather: 'clear', rush: 0, chimed: 0, look: 0, lookCD: 0, photoT: 0, capture: null, rumbleT: 8, shake: 0,
  player: { show: true, who: 'ren', view: 'back', ph: 0, depth: 0, look: 0 }, follow: { show: true, who: 'jill', view: 'back', ph: 1, back: .9, lat: 1.25, depth: 0, y: 0, vy: 0, side: 1, look: 0 },
  pom: { on: 0, show: false, who: 'pom', view: 'back', ph: 2, back: 2.1, lat: 0, depth: 0, y: 0, vy: 0, look: 0, mood: 'open', say: '' },
  stats: {}, flashT: 0, dtFX: .016, camYaw: 0, rx: 0, rz: 0, hint: 0, missionCheck: 0, announce: [],
};
function curSeg() { return G.segs[G.ci]; }
function forkLabels(fk) { return fk.lbl; }
function nextStep() {
  if (!G.plan.length) { const np = dayPlan(G.planDay + 1); G.planDay++; G.plan = np; G.planClock = 480; } // the new day only once its plan is made
  return G.plan.shift();
}
// one street of a fork's side, and the fork flag it needs when another fork follows it straight away
function forkSide(last, list, turnIn, t0, after) {
  const nf = list.length === 1 && after && after.fork;
  const sg = newSeg(last, list[0], { turnIn, t0, day: G.planDay, fork: nf || null }); if (nf) sg.forkLbl = forkLabels(nf, G.planDay); return sg;
}
// builds the streets ahead (max: at most that many per call, so a turn never builds three streets in one frame).
// All or nothing per street: if building one fails (a phone out of memory), its step goes back into the plan and it is tried
// again a moment later, so the route never loses a street and a fork is never half made.
function ensureSegs(max) {
  let built = 0;
  while (!G.fork && G.segs.length - G.ci < 4 && !(max && built >= max)) { // four ahead: a street is built well before it can come into view
    const last = G.segs[G.segs.length - 1];
    courseStart(last);
    let step, fromQ = 0; try { if (G.courseQ && G.courseQ.length) { step = G.courseQ.shift(); fromQ = 1; } else step = nextStep(); } catch (e) { reportErr(e); G.segDue = Math.max(G.segDue || 0, .25); break; }
    if (!step) break;
    const t0 = G.planClock;
    try {
      if (step.fork) {
        const Ls = Array.isArray(step.fork.L) ? step.fork.L : [step.fork.L], Rs = Array.isArray(step.fork.R) ? step.fork.R : [step.fork.R];
        G.distEst = G.dist + (G.segs.length - G.ci) * 90;
        const hy = last && last.forkY ? .5 : 1, a = forkSide(last, Ls, -hy, t0, G.plan[0]), b = forkSide(last, Rs, hy, t0, G.plan[0]); // Y 字路は 45 度ずつ
        G.fork = [a, b]; G.forkRest = { L: Ls.slice(1), R: Rs.slice(1), d0: Ls[0].d, d1: Rs[0].d };
        { const rs = Math.random() < .5 ? 0 : 1; richHay(G.fork[rs]); if (last) last.richSide = rs ? 1 : -1; } // one way has more hay, and its sign says so (2026-11-08)
        break;
      }
      const nf = G.courseQ && G.courseQ.length ? null : G.plan[0] && G.plan[0].fork; // 電波塔コースの途中では、分かれ道にしない
      G.distEst = G.dist + (G.segs.length - G.ci) * 90; G.speedEst = Math.min(MAXSPD + 1, G.speed + 1.2);
      // after a fork's own street only a fork can follow (it has no corner of its own); should a plain street ever come next, it turns
      const skyT = t2 => { const h = t2 && THEMES[t2.t]; return !!(h && h.sky); }, liftT = t2 => { const h = t2 && THEMES[t2.t]; return !!(h && h.lift); }, toSky = skyT(G.courseQ && G.courseQ[0]), straight = !nf && (skyT(step) || toSky || liftT(step) || !!step.straightOut); /* 2026-11-17 オーナー「高い所から飛ぶ瞬間が曲がり角でおかしい・着地で道が向きに合わせて動くのもおかしい」：空へ飛び出す展望台と、空の道は、角で曲がらずにまっすぐつなぐ */
      const sg = newSeg(last, step, { t0, day: G.planDay, fork: nf || null, straight, toSky, turnIn: last && last.fork ? (Math.random() < .5 ? -1 : 1) : undefined });
      if (nf) sg.forkLbl = forkLabels(nf, G.planDay);
      if (step.st) sg.stName = LANG === 'ja' || LANG === 'zh' ? step.st : stEn(step.st); // station names: kanji for Japanese/Chinese readers, romaji otherwise
      G.segs.push(sg); G.planClock = sg.t1; built++; if (sg.step && sg.step.co) segFace(sg); /* [塔 L2] 一つ前の道がまだあるうちに向きを決めておく */
    } catch (e) { (fromQ ? G.courseQ : G.plan).unshift(step); G.segFails = (G.segFails || 0) + 1; G.segDue = Math.max(G.segDue || 0, .25); reportErr(e); break; }
  }
  while (G.ci > 1) { G.segs.shift(); G.ci--; }
}
/* 電波塔コース（2026-11-17）：10万点・30万点をこえたら、1 回の遊びで 1 回ずつ。
   外の道のあと・分かれ道ではない所に、コース（足もと → 階段／エレベーター → 展望台 → オオタカ → 公園に着地）をはさむ。会社の中・電車の中からは始めない */
function courseTick() { if (G.mode !== 'play' || G.practice || !G.courseDone) return;
  if (G.courseDue) return; let best = null; for (const k in COURSES) if (!G.courseDone[k] && G.score >= COURSES[k].at && (!best || COURSES[k].at < COURSES[best].at)) best = k; if (best) G.courseDue = best; } // 点の低いコースから順に
function courseStart(last) { const k = G.courseDue; if (!k || !COURSES[k] || (G.courseQ && G.courseQ.length) || G.fork) return;
  const out = x => x && x.th && (x.th.kind === 'street' || (x.th.kind === 'deck' && !x.th.climb && !x.th.boat));
  if (!last || last.fork || !out(last) || last.th.course) return;
  const nx = G.plan[0]; if (nx && !nx.fork && THEMES[nx.t] && ['room', 'train', 'glass'].includes(THEMES[nx.t].kind)) return; // 次が建物・電車の中なら、外に出てから
  G.courseQ = COURSES[k].steps.map((x, i) => Object.assign({ co: k, co0: i === 0 }, x)); G.courseDone[k] = 1; G.courseDue = null; G.courseGo = k; setTimeout(aerWarm, 60); }
function reportErr(e) { window.__frameErr = (window.__frameErr || 0) + 1; window.__frameErrMsg = String(e && e.message || e); window.__frameErrAt = String(e && e.stack || '').split('\n').slice(1, 4).map(x => x.trim().replace(/^at /, '').replace(/\(?(?:https?|file):\/\/\S*\/([^/\s)]*:\d+:\d+)\)?/, '$1')).join(' < '); /* どこで起きたかも残す（テストの報告に出す） */ if (window.__frameErr < 4) console.error('frame error', e); errLog(window.__frameErrMsg); }
// エラーの記録（C-65）：最後の 10 件をこの端末に残し、設定の下で見られる（送信はしない）
function errLog(msg) { try { const a = JSON.parse(localStorage.getItem('rjErrLog') || '[]'); const m = String(msg).slice(0, 160); if (a.length && a[a.length - 1].m === m) a[a.length - 1].n++; else a.push({ t: Date.now(), m, n: 1 }); localStorage.setItem('rjErrLog', JSON.stringify(a.slice(-10))); } catch (x) { } }
addEventListener('error', e => { try { errLog((e && e.message) || 'error'); } catch (x) { } });

/* ---------- title diorama ---------- */
function setupTitle() {
  G.mode = 'title'; try { const d = dprWant(); if (d !== DPR && W) { DPR = d; resizeKeep(); } } catch (e) { } /* [H34] ホームにもどった時は細かく描く */ G.planDay = 1; G.plan = []; G.clock = 480; G.weather = 'clear';
  G.segs = [newSeg(null, { t: 'titleroom', d: 5 }, { empty: true })]; G.ci = 0; G.fork = null; G.segDue = 0; G.chaseVis = 0;
  buildTitleRoom(G.segs[0]);
  G.player.show = G.follow.show = true;
}
// the boss's bedroom at 8:00, laid out by hand: the futon he has just left, his jacket waiting, the morning sun through the shoji
const PLANT_STEPS = [0, 300, 2000, 8000, 30000];
function plantLv() { const h = (SV.totals || {}).hay || 0; let lv = 0; while (lv < PLANT_STEPS.length - 1 && h >= PLANT_STEPS[lv + 1]) lv++; return lv; }
/* 2026-11-19 オーナー「スタート画面の畳をもう少しブラッシュアップ。畳について学んで」：前は 1.8m×2.6m の大きな板に線を引いた床だった。
   [T7] 本当の大きさ（東京の家の江戸間：176×88cm）で 1 枚ずつ敷く [T8] 祝儀敷き：1 列ごとに半分ずらし、4 枚の角が 1 点に集まらない（十字の目地を作らない）
   [T9] 畳の色は 1 枚ずつ少しちがう（い草は張り替えた年で色が変わる）[T10] 窓（障子）の側の畳は、日に焼けて黄色っぽい
   [T6] 壁ぎわの余りは、細い木の畳寄せ */
function tatamiLay(seg) {
  const ML = 1.76, MW = .88, rows = Math.floor(2 * HW / MW), edge = (2 * HW - rows * MW) / 2, fS = seg.fS, fE = seg.fE, r = rnd(1907), base = C(seg.th.road[0]);
  seg.floor = seg.floor.filter(p => p.dec || (p.pat !== 'tatami'));
  let ti = 0;
  for (let row = 0; row < rows; row++) { const l0 = -HW + edge + row * MW, l1 = l0 + MW, off = row % 2 ? ML / 2 : 0;
    for (let a = fS - off; a < fE - .01; a += ML) { const s0 = Math.max(a, fS), s1 = Math.min(a + ML, fE); if (s1 - s0 < .04) continue;
      const sun = clamp((-.4 - (l0 + l1) / 2) / 3.6, 0, 1) * clamp(1 - Math.abs((s0 + s1) / 2 - 3.2) / 6, 0, 1), age = r(), j = 1 + (r() - .5) * .04; // [T10] lat < 0 が障子の側
      const c = [base[0] * j * (1 + sun * .05 + age * .03), base[1] * j * (1 - age * .02), base[2] * j * (1 - sun * .14 - age * .06)].map(x => Math.min(255, x));
      seg.floor.push({ v: quad(seg, [[s0, l0, 0], [s1, l0, 0], [s1, l1, 0], [s0, l1, 0]]), c, pat: 'tatamiM', ti: ti++, a: s0, b: s1, l0, l1, row, u0: (s0 - a) / ML, u1: (s1 - a) / ML }); } }
  if (edge > .02) for (const sd of [-1, 1]) { const l0 = sd < 0 ? -HW : HW - edge, l1 = sd < 0 ? -HW + edge : HW;
    for (let a = fS, i = 0; a < fE - .01; a += 3, i++) { const b = Math.min(a + 3, fE); seg.floor.push({ v: quad(seg, [[a, l0, 0], [b, l0, 0], [b, l1, 0], [a, l1, 0]]), c: [176, 132, 86], pat: 'yose', ti: i, a, b, l0, l1, sd }); } }
}
function buildTitleRoom(seg) {
  tatamiLay(seg);
  const sp = (type, v, s, lat, w, h, y) => seg.spr.push({ lat, s, y: y || 0, w, h, img: artKey(type, v || ''), keep: 1, gnd: w * .4 });
  const dec = (type, sd, s, w, y0, y1, extra) => { const lat = sd * (HW - .03), n = [-sd * seg.r[0], -sd * seg.r[1]], a = s, b = s + w; const pts = sd < 0 ? [[a, lat, y0], [b, lat, y0], [b, lat, y1], [a, lat, y1]] : [[b, lat, y0], [a, lat, y0], [a, lat, y1], [b, lat, y1]]; seg.decos.push(Object.assign({ v: quad(seg, pts), n, pat: type, v2: 1, seg, w }, extra || {})); };
  // the camera looks back down the room, so lat > 0 is screen-left. Right wall (lat < 0): two shoji windows the sun comes through, his jacket on a hook
  dec('shoji', -1, .4, 2.6, .2, 2.6); dec('shoji', -1, 3.2, 2.6, .2, 2.6); dec('hanger', -1, 6.1, .9, 1.0, 2.5);
  // left wall: the alcove, a wall clock, a calendar
  dec('tokonoma', 1, 3.6, 2.2, .35, 2.5); dec('clock', 1, 1.0, .9, 2.05, 2.8); dec('calendar', 1, 2.4, .8, 1.5, 2.3);
  seg.titleWins = [{ sd: -1, s0: .4, s1: 3.0 }, { sd: -1, s0: 3.2, s1: 5.8 }];
  // the futon he has just left (left), the low table with his mug and the paper (right), his things about the room
  /* 2026-11-17 オーナー：「スタート画面の布団に厚みがなくて安っぽい」。前は床に貼った 1 枚の絵だった。
     本物の敷きぶとんは厚さ 8〜10cm、掛けぶとんは 5〜8cm。敷きぶとんを本当の厚みの箱にして、上の面（シーツ・まくら・掛けぶとんの絵）をその上にのせる。
     掛けぶとんのめくった折り返しは、ふくらんだ厚み（もう 1 段）。まくらはそば殻のふくらんだ形（絵）。畳との間にやわらかいかげ。docs/TITLE-ROOM-2026-11-17.md */
  const FT = .11;
  seg.floor.push({ v: quad(seg, [[1.3, 1.3, FT + .004], [4.1, 1.3, FT + .004], [4.1, 3.3, FT + .004], [1.3, 3.3, FT + .004]]), c: [0, 0, 0], dec: 'futonD', ti: 0, a: 1.3, b: 4.1 });
  seg.floor.push({ v: quad(seg, [[1.18, 1.2, .006], [4.22, 1.2, .006], [4.22, 3.42, .006], [1.18, 3.42, .006]]), c: [0, 0, 0], dec: 'futonShadow', ti: 0, a: 1.18, b: 4.22 }); // [2] 畳に落ちるやわらかいかげ
  // [1][3][4] 敷きぶとんの厚み（11cm）：角の立った箱ではなく、綿でふくらんだやわらかい横（softSlab）。上はシーツの白、下へいくほど少しかげる（2026-11-17）
  softSlab(seg, { s0: 1.3, s1: 4.1, l0: 1.3, l1: 3.3, h: FT + .004, r: .07, rc: .05, col: [239, 232, 216], colAt: (q) => q < .5 ? [244, 238, 224] : [226, 216, 196] });
  // [5] まくらは上の面の絵の中（立てた絵にすると、モチの足の前にういて見えた）。上の面は、マットのふちまでいっぱいに切り出した絵（すみのすき間なし）
  // [6] 掛けぶとんの折り返しの厚みは、上の面の絵の中のかげとふくらみで出す（箱にすると、白い棒に見えた）
  seg.spr.push({ lat: 0, s: 3.4, y: 2.05, w: .9, h: .95, img: artKey('pendant', ''), keep: 1 });
  sp('lowtable', '', 2.4, -2.5, 1.5, .62); // the low round table, his mug and the morning paper on it (one picture, so nothing floats)
  { const ZT = .17, l = -1.58, sa = 3.4; seg.floor.push({ v: quad(seg, [[3.0, -2.0, .004], [3.85, -2.0, .004], [3.85, -1.15, .004], [3.0, -1.15, .004]]), c: [0, 0, 0], dec: 'zabuShadow', ti: 0, a: 3.0, b: 3.85 }); // [77] 畳に落ちるやわらかいかげ
    seg.floor.push({ v: quad(seg, [[sa - .26, l - .24, ZT + .002], [sa + .25, l - .24, ZT + .002], [sa + .25, l + .25, ZT + .002], [sa - .26, l + .25, ZT + .002]]), c: [0, 0, 0], dec: 'zabuTop', zc: '#B4572E', ti: 1, a: sa - .26, b: sa + .25 }); // 上の絵は、上の座布団の平らな所だけに
    // 座布団 2 枚（下は藍、上は朱）。綿でまるくふくらみ、角は丸い。上の 1 枚は少し小さく、少しずらして重ねる（2026-11-17：前は角の立った箱で、本を重ねたように見えた）
    softSlab(seg, { s0: sa - .29, s1: sa + .29, l0: l - .27, l1: l + .27, h: ZT / 2, r: .05, rc: .08, col: [94, 110, 158] });
    softSlab(seg, { s0: sa - .28, s1: sa + .27, l0: l - .26, l1: l + .27, h: ZT / 2 - .002, y0: ZT / 2 + .001, r: .05, rc: .08, col: [180, 87, 46], sb: .3 }); } // 上の 1 枚は、下の 1 枚より後に描く // 2026-11-17 ホーム画面の第 2 段：座布団 2 枚を本当の厚みの箱で（前は横にのびた 1 枚の絵）。横の面に 2 枚分の厚みを描く { const k = .6 + .2 * plantLv(); sp('plant', '', 5.6, 3.7, 1.0 * k, 1.75 * k); } /* 牧草で育つ観葉植物（B-12）：これまでに集めた牧草で 5 段階 */ sp('futon', '', 5.3, -3.8, 1.5, 1.1);
  if (EVENT) { const dk = EV_KITS[EVENT].deco; sp(dk, '', 3.9, -2.15, .46, .43); sp(dk, '', 2.75, -2.55, .36, .34); } // the season's decorations by the table
  /* 2026-11-17 オーナー：「タンスは紙切れみたいになってる」。前は壁に貼った絵だった。本物のきりのたんすは奥行き 45cm。
     奥行きのある箱にして、正面に引き出しの絵（4e_art.js の paintFace 'tansu2'）、上の面と横の面は木。上に小物（写真立て・一輪ざし） */
  seg.props.push(mkProp(seg, [{ l0: HW - .47, l1: HW - .03, s0: -1.2, s1: .3, y0: .06, y1: 1.65, c: '#B88A5C', face: 'tansu2', faceW: 300, faceH: 330, faceSide: 'L', face2: 'tansuSide', face2W: 200, face2H: 330, noEdge: 1 }, // [11] 奥行き 45cm の箱
    { l0: HW - .48, l1: HW - .02, s0: -1.22, s1: .32, y0: 1.65, y1: 1.69, c: '#C79A68' }, // [12] 天板（少し出っぱる）
    { l0: HW - .45, l1: HW - .05, s0: -1.16, s1: .26, y0: 0, y1: .06, c: '#5E3E24' }], { big: 1 })); // [13] 足もとの台輪（少し引っこむ）
  seg.spr.push({ lat: HW - .25, s: -.85, y: 1.69, w: .26, h: .3, img: artKey('photoFrame', ''), keep: 1 }); // [14] 写真立て
  seg.spr.push({ lat: HW - .25, s: -.05, y: 1.69, w: .16, h: .42, img: artKey('ichirin', ''), keep: 1 }); // [15] 一輪ざし
  seg.spr.push({ lat: -4.0, s: .5, y: 0, w: .9, h: 1.9, img: artKey('andon', '0'), pn: 1, keep: 1, gnd: .3 });
}
let TITLE_PITCH = .2, TITLE_WIDE = -.9;
/* [ホーム iPhone H1] 2026-11-20 オーナー「iPhone のスタート画面で色々重なって見づらい」：たて長のスマホでは、3 人が画面のまん中より上に立ち、
   SNS の新作の札・今日の目標・お知らせの真うしろにかくれていた（その下の畳は空いていた）。カメラの上下の向きを少し変えて、
   選んだ子の足もとが、下の台（キャラクターえらび・スタート）のすぐ上に来るようにする（札は上、3 人は下で、重ならない） */
let TITLE_DOCK = { y: 0, t: -1 };
function titleTallPitch(P, gy) {
  if (G.mode !== 'title') return TITLE_PITCH;
  if (G.t - TITLE_DOCK.t > .5 || G.t < TITLE_DOCK.t) { TITLE_DOCK.t = G.t; const d = document.querySelector('#sTitle.home:not([hidden]) .card>.chars'), a = $('#app'); if (d && d.offsetParent && a) { const r = d.getBoundingClientRect(), ar = a.getBoundingClientRect(); TITLE_DOCK.y = r.top - ar.top; const td = $('#sTitle.home #tToday'), tr = td && td.offsetParent ? td.getBoundingClientRect() : null; TITLE_DOCK.top = tr && tr.height > 8 ? tr.bottom - ar.top : 0; } else TITLE_DOCK.y = 0; }
  let want = TITLE_DOCK.y - 10; /* [ホーム iPhone H27] 2026-11-20 オーナー「スマホの画面の時にキャラクターが中心に来るように」：今日の目標の札と下の台の間があいている背の高いスマホでは、
     3 人の体のまん中が、そのあいた所のまん中に来るように、足もとを少し上げる（モチの背の高さは、画面のはばの約 0.32） */
  if (TITLE_DOCK.top > 0 && W < 600 && H > W * 1.25) { const ck = titleCamK(), mid = (TITLE_DOCK.top + TITLE_DOCK.y) / 2, feet = mid + W * .16 * ck + 8; if (feet < want) want = Math.max(feet, TITLE_DOCK.top + W * .32 * ck + 16); /* [よみ R31] カメラを引いた分、背の高さも小さく見積もる */ }
  TITLE_DOCK.feet = want; /* お知らせの置き場所（3 人の頭にかからないか）に使う */
  if (!(want > H * .45) || P.wx == null) return TITLE_PITCH; /* 台がない・台が上すぎる時は今までどおり */
  /* 足もと（地面の高さ）の点が、画面の want の高さに来る上下の向きを、その場で求める */
  const dx = P.wx - CAM.x, dz = P.wz - CAM.z, fw = dx * Math.sin(CAM.yaw) + dz * Math.cos(CAM.yaw), dy = (gy || 0) - CAM.y; /* はねる高さは入れない（カメラがはねに合わせてゆれない） */ if (!(fw > .5)) return TITLE_PITCH;
  const ang = Math.atan2(-dy, fw), off = Math.atan((want - HORIZON) / FOCAL); /* 足もとは目の高さより ang だけ下。画面で地平線より off だけ下に見せたい */
  const pt = clamp(ang - off, -.22, TITLE_PITCH); G.titlePitch = G.titlePitch == null ? pt : G.titlePitch + (pt - G.titlePitch) * .25; return G.titlePitch; }
/* [よみ R31] 2026-11-28 たて長のスマホ：左右の子（クリ・ユズ）が、左右の丸いボタンの列のうしろに 4〜6 割かくれていた（ボタンの名前を大きくした分、列も広い）。
   カメラを少し引いて 3 人をまとめて小さめに（せまい画面ほど引く）。左右の子が選んだ子に重ならない決まり（homelight）は、3 人とも同じ割合で小さくなるので変わらない */
function titleCamZ() { return W < 600 && W < H ? clamp(8.8 + (390 - W) * .02, 8.4, 9.6) : 7.9; }
function titleCamK() { return 4.2 / (titleCamZ() - 3.7); } /* 選んだ子の見た目の大きさ（カメラ 7.9 の時を 1） */
let TITLE_FRONT = 3.7, TITLE_BACK = 2.7; // ホーム画面：選んだ子の位置（手前）と、ほかの 2 人の位置（奥）
function titleFrame(dt) {
  const seg = G.segs[0], me = G.char, other = me === 'ren' ? 'jill' : 'ren', third = me === 'pom' ? 'jill' : 'pom';
  const P = G.player, F = G.follow;
  P.flash = F.flash = G.pom.flash = false; P.glow = F.glow = null; // ぶつかった直後の点滅を消す（遊び終わった時に点滅中だと、ホーム画面でもモチが半透明にちかちかし続けた。2026-11-16 オーナー指摘）
  P.who = me; F.who = other; F.off = false; F.show = true; P.big = me === 'pom' ? 1.3 : 1; P.view = F.view = 'front'; P.look = F.look = 0; // on the title, close to the camera: the smaller size. 2026-11-15：前を向かせる命令がこの説明書きの中に入っていて動かず、遊んだあとタイトルに戻るとモチ・ユズが後ろ姿のまま（クリだけ前向き）になっていた
  P.ph += dt * 3; F.ph += dt * 2;
  /* ホーム画面では顔を切りかえない（まばたき・あくび・にっこりをしない）。2026-11-16 オーナー：「キャラクター選択してる時に点滅するはいらない」。
     顔が目を開けた顔 → 閉じた顔 → 笑った顔と入れかわるのが、点滅に見えた。動きは、体の小さな上下だけ（qa/titlestill.js が見張る） */
  const renMood = 'open', jillMood = 'open', pomMood = 'open';
  if (me === 'ren') { P.mood = renMood; F.mood = jillMood; } else if (me === 'jill') { P.mood = jillMood; F.mood = renMood; } else { P.mood = pomMood; F.mood = renMood; }
  /* 2026-11-16 オーナー：「クリを選んだ時にユズにもスポットが当たる。どのキャラを選んでいるのか直感的に分かりづらい」。
     前は、選んだ子が横や奥にいて、選んでいない子のほうが手前で大きく見える並びがあった。いまは、選んだ子がいつもまん中のいちばん手前、ほかの 2 人は左右の少し奥。
     明かり（titleLight）は選んだ子だけに当てる（ほかの子も画面も暗くしない） */
  const wd = W > H * 1.25 && W >= 900, ph = W < H && W < 600, pt = W < H && !ph, sideL = wd ? 1.6 : ph ? 1.25 : pt ? 1.22 : 1.3, sideR = wd ? 1.12 : ph ? 1.25 : pt ? 1.22 : 1.3; /* [B24] たて長のスマホは 1.2 → 1.25（CI の遅いパソコンで、カメラのゆれの時に、左右の子が選んだ子にわずかに重なった。homelight） */ /* [B10] たて長のタブレット：右の子（モチ）が右の丸いボタンの列の後ろにかくれていた。少し内側に */ /* [H45] 2026-11-21：たて長のスマホでは、左右の子を少し内側に（左右の丸いボタンの列のうしろに半分かくれていた） */ // 横長の画面：右の子は札にかくれないよう寄せ、左の子は選んだ子に重ならないよう広げる（本番の大きな画面で、左の子が選んだ子のすぐ後ろに重なっていた）
  const pR = segPos(seg, TITLE_FRONT, 0), pJ = segPos(seg, TITLE_BACK, me === 'jill' ? sideL : -sideR);
  [P.wx, P.wz] = pR; P.wy = pR[2] + (me === 'pom' ? Math.abs(Math.sin(G.t * 5)) * .07 : Math.abs(Math.sin(P.ph)) * .05); [F.wx, F.wz] = pJ; F.wy = pJ[2]; // 跳ねるのは選んだ子だけ（ほかの子も跳ねていて、だれを選んだか分かりにくかった。2026-11-17 オーナー）
  P.air = F.air = P.slide = F.slide = false; P.tilt = F.tilt = 0; P.fly = F.fly = 0;
  /* たて長の画面（スマホ）：3 人が画面の上半分のまん中に全員おさまるよう、カメラを引いて 3 人のまん中に寄せる（2026-11-15 ホーム画面の作り直し：前は 3 人が見切れ、しかもメニューの札の後ろに隠れていた） */
  const tall = W < H * .8, mid = 0;
  const wide = W > H * 1.25 && W >= 900; // 横長：札が右にあるので、3 人が左のまん中に来るようカメラを右へ
  const cp = segPos(seg, (tall ? titleCamZ() : wide ? 6.9 : 6.6) - Math.sin(G.t * .11) * .2, (tall ? mid : wide ? TITLE_WIDE : 0) + Math.sin(G.t * .23) * (tall ? .18 : .3));
  CAM.x = cp[0]; CAM.z = cp[1]; CAM.y = (tall ? 1.02 : 1.1) + cp[2] + Math.sin(G.t * .7) * .015; CAM.yaw = Math.PI + Math.sin(G.t * .17) * .02; CAM.pitch = tall ? titleTallPitch(P, pR[2]) : .06;
  camPrep(); P.depth = 7.4 - TITLE_FRONT; F.depth = 7.4 - TITLE_BACK;
  // once you have met Kuri, the rookie peeks out on the title screen too, bouncing with excitement
  const M = G.pom; M.title = !!SV.pomMet; M.show = M.title;
  if (M.title) { const pm = segPos(seg, TITLE_BACK, me === 'jill' ? -sideR : sideL); M.view = 'front'; M.who = third; M.ph += dt * 4; M.wx = pm[0]; M.wz = pm[1]; M.wy = pm[2]; M.depth = 7.4 - TITLE_BACK; M.tilt = 0; M.air = M.slide = false;
    M.mood = third === 'pom' ? pomMood : jillMood; M.look = 0; }
}

/* ---------- run lifecycle ---------- */
function startRun() { G.drawRetry = 0; G.perfId = Date.now(); /* [軽く 4-0] 動作の記録は 1 回の走りごと */ try { const m0 = G.mode; G.mode = 'play'; const d = dprWant(); G.mode = m0; if (d !== DPR && W) { DPR = d; resizeKeep(); } } catch (e) { } /* [H34] 走る時は、今までどおりの細かさにもどす */ cpClear(); G.resumeN = 0; G.cpT = 0; try { Q_UP = 0; Q_GOOD = 0; bunHiFree(); } catch (e) { } bunniesNow(); kpPre();
  audioInit(); SFX.ui(); { const f = document.getElementById('tFresh'); if (f) f.remove(); } toastClear();
  if (G.player) G.player.fallHide = false; /* [塔 F11] */
  G.runId = (G.runId || 0) + 1; Object.assign(G, { mode: 'play', t: 0, s: 0, lane: 1, prevLane: 1, lat: 0, y: 0, vy: 0, slideT: 0, air: false, speed: SV.tutDone ? 12.5 : 10.5, dist: 0, distEst: 0, speedEst: 10, score: 0, hay: 0, combo: 0, comboT: 0,
    shield: 0, fever: 0, feverG: 0, chaseT: 2.0, chaseIntro: 1, chaseVis: .7, invT: 1.5, clock: 480, day: 1, turnQueued: 0, turnQT: 0, turnT: 0, reviveN: 0, cause: '', fallSeg: null, fallCam: null, flashT: 0, bestTold: 0, niceN: 0, niceT: -9, bumped: 0, musicArea: '',
    fork: null, forkRest: null, rush: 0, chimed: 0, soonTold: 0, gaugeTold: 0, gainT: 0, feverMax: 6, hitStop: 0, jumpBuf: 0, tut: null, tutDid: '', fovK: 0, look: 0, lookCD: 4, photoT: 0, capture: null, rumbleT: 8, shake: 0, announce: [] });
  G.pow = { dash: 0, magnet: 0, jump: 0, x2: 0, fly: 0 }; G.gig = null; G.gigNext = 24; G.gigLast = ''; G.bumpN = 0; G.prints = []; G.chalWon = 0; G.spTier = 0; G.slowT = 0; G.easy = !!OPT().easy;  if (G.easy) banner('RELAXED', t('easyY'), 'room');
  G.legend = !!(SV.lgMode && legendOn('mode') && SV.tutDone); G.aura = !!(SV.lgAura !== 0 && legendOn('aura')); // the Legendary bunny's own run: faster, x1.5 score / a golden sparkle trail
  if (G.legend) banner('LEGEND MODE', tr('伝説モード：速さ＋15%・スコア×1.5', 'Legend mode: 15% faster, score x1.5'), 'good');
  G.stats = { hay: 0, dist: 0, jumps: 0, slides: 0, treats: 0, veg: 0, powers: 0, turns: 0, score: 0, fevers: 0, clean: 0, cleanCur: 0, office: 0, chime: 0, looks: 0, flights: 0, bads: [], foods: {}, spots: [], stampsNew: [] };
  G.player.who = G.char; G.player.big = G.char === 'pom' ? POM_BIG : 1; G.player.say = ''; G.follow.who = G.char === 'ren' ? 'jill' : 'ren'; G.player.view = G.follow.view = 'back'; G.player.tilt = G.follow.tilt = 0;
  G.player.show = G.follow.show = true; G.player.look = 0;
  Object.assign(G.follow, { y: 0, vy: 0, air: false, slideT: 0, back: .9, lat: 1.25, side: 1, tuck: false, look: 0, say: '', off: G.char === 'pom' });
  // playing as Kuri: the rookie sets off first; the boss and Yuzu catch up one by one (in a random order), bringing their perks
  G.mates = { ren: 0, jill: 0 }; G.mateOrder = Math.random() < .5 ? ['ren', 'jill'] : ['jill', 'ren']; G.mateAt = [rand(20, 28), rand(52, 64)];
  G.pomPeek = null; G.peekSlow = 0; Object.assign(G.pom, { on: 0, who: 'pom', title: false, view: 'back', show: false, y: 0, vy: 0, air: false, slideT: 0, back: .25, lat: 0, tuck: false, look: 0, say: '', tilt: 0 }); G.pomCD = 0; G.pomSeedAt = 0; G.memoAt = 0; G.bumps = 0; G.lastHit = null; G.bestPic = 0; G.newTitles = []; G.chalFlag = 0;
  document.querySelectorAll('#app > .toast').forEach(e => e.remove());
  resetRoutes(SV.lastRoute); G.planDay = 1; G.plan = dayPlan(1); G.planClock = 480; G.courseQ = []; G.courseDone = {}; G.courseDue = null; G.courseGo = null;
  G.rev = !!(G.revNext && SV.tutDone && !G.practiceNext); G.revNext = 0; // 逆走デー（B-37）：夕方 6 時に会社を出て、帰り道を走って家（寝室）まで。そのまま次の日の朝へ
  if (G.rev) { const k = G.plan.findIndex(x => x.eve); G.plan = G.plan.slice(Math.max(0, k)).concat([{ t: 'genkan', d: 4, home: 1 }, { t: 'bedroom', d: 6, home: 1 }]); G.planClock = 1080; G.clock = 1080; G.chaseT = 0; G.chaseIntro = 0; G.chaseVis = 0; banner('REVERSE DAY', t('revGo'), 'good'); }
  { const f = G.plan.find(x => x.fork); SV.lastRoute = f ? [f.fork.L.t, f.fork.R.t] : []; save(); } G.weather = WEATHERS[0];
  G.segDue = 0; const step = G.plan.shift(); const s0 = newSeg(null, step, { t0: G.rev ? 1080 : 480, day: 1, len: SV.tutDone ? 0 : 140 }); G.planClock = s0.t1; G.segs = [s0]; G.ci = 0; G.tutEnd = 0;
  if (!SV.tutDone) setupTutorial(s0); else { G.tut = null; G.tutSeg = null; }
  G.practice = SV.tutDone && G.practiceNext ? G.practiceNext : ''; G.practiceNext = '';
  G.tidT = {}; G.epGigDone = 0; G.boss = null; G.revDone = 0; G.lastTrain = null; G.lastTrainDone = 0; G.matsuri = matsuriDay(); G.matsuriTold = 0;
  if (SV.ghost) delete SV.ghost; // ゴーストと競走（B-32）はやめた（2026-11-09 オーナーの判断）：前の版で残った記録を消す
  if (G.practice) { const tid = G.practice; G.plan = Array.from({ length: 8 }, () => ({ t: tid, d: 60 })); const p0 = newSeg(null, { t: tid, d: 60 }, { t0: 600, day: 1 }); G.segs = [p0]; G.ci = 0; G.planClock = p0.t1; G.clock = 600; G.chaseT = 0; G.chaseIntro = 0; G.chaseVis = 0; G.gigNext = 1e9; onEnterSeg(p0); banner('PRACTICE', t('practiceGo'), 'room'); } // 練習：選んだ場所から、同じ場所が続く
  ensureSegs();
  G.camYaw = 0; G.ey = G.camE = null; G.camSl = 0; const p = segPos(s0, 0, 0); G.rx = p[0]; G.rz = p[1];
  SV.runs++; save();
  if (!SV.missions) newMissions();
  show('hud'); musicKey = 0; musicArea = 'home'; musicStart();
  banner('8:00 AM', t('morning'), 'room');
  G.hint = 0; // the tutorial teaches everything on the first play; later runs start clean
  kpStart();
}
// 挑戦状の旗（B-42）：挑戦状の点数の 9 割まで来たら、前の道に旗を3本（どのレーンでも通れる）。旗の点数をこえると「挑戦状クリア」
function chalFlags() { if (!CHAL || G.chalWon || G.chalFlag || G.mode !== 'play' || G.score < CHAL.s * .9) return; const seg = curSeg(); if (seg.len - G.s < 40) return;
  G.chalFlag = 1; for (let l = 0; l < 3; l++) addItem(seg, 'chalflag', G.s + 32, l, .2); }
function stumble() {
  if (G.invT > 0) return;
  if (G.tut && G.tut.some(x => !x.done) && curSeg() === G.tutSeg) return;
  G.bumpN = (G.bumpN || 0) + 1;
  SFX.bump(); buzz(60); G.bumps = (G.bumps || 0) + 1; G.flashT = .6; G.combo = 0; G.stats.cleanCur = 0; G.invT = .9; G.hitStop = .08; G.shake = .7;
  if ((G.chaseT > 0 && !G.chaseIntro) || G.rush) { die('papers'); return; }
  G.chaseT = 5.5; G.chaseIntro = 0; bannerNow('BUMP!', t('bump1', 5), 'bad');
  pomSay(t('pomDonmai'), 'worry', 1.3);
}
function hit(o) {
  G.lastHit = o; // 結果画面で「ぶつかったのは、これ」（C-69）
  if (G.tut && G.tut.some(x => !x.done) && curSeg() === G.tutSeg) { smash(o); return; } // the first lesson never kills
  if (G.pow.dash > 0 || G.fever > 0 || G.invT > 0 || G.pow.fly > 0) { smash(o); return; }
  if (G.shield) { G.bumpN = (G.bumpN || 0) + 1; G.shield = 0; smash(o); G.invT = 1.2; SFX.bump(); banner('SAVED!', t('saved'), 'good'); return; }
  if (softHit()) { smash(o); return; }
  die('obstacle');
}
// 走り始めの 45 秒は、正面でぶつかっても・曲がり損ねても「BUMP!」で続く（追いかけられている間にもう 1 回で終わり）。
// 2026-11-16 オーナーの決定：CrazyGames の試験公開で、慣れていない人が 2 回目から 10〜15 秒で終わり、10 分まで遊んだ人が 2.4% だった。
const SOFT_T = 45;
function towerFall(seg) { const c = seg && seg.th && seg.th.course; return (c === 'tower' || c === 'skytree') && !seg.fork && !seg.th.lift && !G.practice; } /* [塔 F11] 電波塔のコースの曲がり角は、曲がりそこねると落ちる（練習はいつもどおり） */
function softHit() {
  if (G.t > SOFT_T || G.rush || G.practice || (G.chaseT > 0 && !G.chaseIntro)) return false;
  G.bumpN = (G.bumpN || 0) + 1; G.bumps = (G.bumps || 0) + 1; G.stats.soft = (G.stats.soft || 0) + 1;
  SFX.bump(); buzz(60); G.flashT = .6; G.combo = 0; G.stats.cleanCur = 0; G.invT = 1.2; G.hitStop = .08; G.shake = .7;
  G.chaseT = 5.5; G.chaseIntro = 0; bannerNow('BUMP!', t('bump1', 5), 'bad'); pomSay(t('pomDonmai'), 'worry', 1.3);
  { const seg = curSeg(); for (const o of seg.obs) if (o.s1 > G.s - 2 && o.s0 < G.s + 14) o.dead = .001; } // 立て直す間：すぐ先の障害物はどける
  return true;
}
// skill chain: close dodges, jump-overs and slide-unders within a second of each other
function nice(kind) {
  const now = G.t; G.niceN = (now - (G.niceT || -9) < 1.4) ? (G.niceN || 0) + 1 : 1; G.niceT = now;
  const mult = SV.mlevel * (G.legend ? 1.5 : 1) * (G.pow.x2 > 0 ? 2 : 1), pts = (40 + 30 * Math.min(G.niceN - 1, 4)) * mult; G.score += pts; G.stats.nice = (G.stats.nice || 0) + 1;
  const lbl = lab(kind === 'jump' ? 'NICE JUMP!' : kind === 'slide' ? 'NICE SLIDE!' : 'CLOSE!');
  floatText(W / 2, cheerY(.5), G.niceN > 1 ? `${lbl} ×${G.niceN}` : lbl, G.niceN > 2 ? '#FF8A5C' : '#F2C230');
  tone(523 * Math.pow(1.0595, Math.min(G.niceN, 5) * 2), .12, 'bell', .05); // 止める演出（hitStop）はやめた：ジャンプのたびに一瞬止まって「重い」と感じる（2026-11-09 の報告）
  if (G.niceN >= 3 && Math.random() < .6) react(pick(['wink', 'happy']), 0);
  // 3回つづけてナイスのときのスロー再生はやめた：ジャンプのあと急に遅くなるように感じる（2026-11-09 の報告。qa/funcheck・qa/poseprio で確認）
  if (kind === 'slide') { G.slideRow = (now - (G.slideRowT || -9) < 4) ? (G.slideRow || 0) + 1 : 1; G.slideRowT = now; if (G.slideRow === 3) { G.stats.slideMaster = (G.stats.slideMaster || 0) + 1; const p2 = 200 * SV.mlevel; G.score += p2; floatText(W / 2, cheerY(.34), lab('SLIDE MASTER!') + ' +' + fmt(p2), '#F2C230'); tone(523, .1, 'bell', .045); tone(784, .14, 'bell', .04, AU.ctx && AU.ctx.currentTime + .08); } } // three slide-unders in a row (2026-11-08)
}
function smash(o) { if (o.dead) return; o.dead = .001; o.vx = Math.random() < .5 ? -1 : 1; G.score += 30 * SV.mlevel; SFX.bump(); G.hitStop = .05; G.shake = Math.max(G.shake, .35);
  // 破片はその物の色で（C-41）：いちばん大きい箱と2番目の色
  const sp = spriteAt(G.player.wx, G.player.wy + .6, G.player.wz); if (sp && o.bx && o.bx.length) { const cs = o.bx.slice().sort((a, b) => (b.l1 - b.l0) * (b.y1 - b.y0) - (a.l1 - a.l0) * (a.y1 - a.y0)).map(b => b.c); burst(sp.sx, sp.sy - 40, cs[0], 10); if (cs[1]) burst(sp.sx, sp.sy - 40, cs[1], 6); G.debrisC = cs[0]; } }
function die(cause) {
  if (G.mode !== 'play') return;
  if (G.practice && cause !== 'quit' && cause !== 'time') { practiceGoOn(cause); return; } // 練習ではぶつかっても終わらない
  cpClear(); /* 走り終わり：「つづきから」は出さない（ぶつかる直前にアプリを閉じてやり直す、はできない） */
  G.cause = cause; G.mode = 'dying'; G.dyingT = .95;
  if (cause === 'fall') { /* [塔 F11] 2026-11-21 オーナー「東京タワーなどで曲がり角に曲がるのを失敗した時、真っ直ぐぶつかるのはおかしい。ぶつかるのではなく、そのまま落下してゲームオーバーに」
       高い所（電波塔の 2 つのコース）の曲がり角は、つきあたりが「へり」：曲がりそこねると、モチはへりの先へ飛び出して落ちていく。ユズ・クリはへりの手前で止まって見送る。カメラはへりに残って、落ちていく先を見下ろす */
    const seg = curSeg(), F = G.follow, M = G.pom; G.dyingT = 1.7; G.fallT = 0; G.fallVy = 1.6; G.fallV0 = Math.max(4, G.speed * .55); G.fallSeg = seg; G.fallCam = { x: CAM.x, y: CAM.y, z: CAM.z, pitch: CAM.pitch };
    G.fallF = { x: F.wx, y: F.wy, z: F.wz }; G.fallM = M && M.on ? { x: M.wx, y: M.wy, z: M.wz } : null; G.flashT = 0; G.shake = 0; buzz([30, 60, 30]);
    if (AU.ctx) { const t0 = AU.ctx.currentTime; for (let i = 0; i < 5; i++) tone(880 * Math.pow(.84, i), .16, 'sine', .04, t0 + i * .11); } musicStop('end'); }
  else { SFX.crash(); buzz([60, 40, 120]); G.flashT = 1; G.shake = 1; musicStop('end'); }
  G.player.look = 0; G.follow.look = 0; G.pom.look = 0;
  if (cause === 'papers') G.chaseVis = 1;
}
function practiceEnd() { G.mode = 'result'; musicStop(); const sc = Math.floor(G.score), hay = Math.floor(G.hay), n = G.stats.pracBumps || 0; G.practice = '';
  hideAll(); goTitle(); setTimeout(() => toastTitle(t('practiceDone', fmt(sc), fmt(hay), n)), 400); }
function practiceGoOn(cause) { G.cause = cause; G.stats.pracBumps = (G.stats.pracBumps || 0) + 1; SFX.bump(); const seg = curSeg();
  for (const o of seg.obs) if (o.s1 > G.s - 2 && o.s0 < G.s + 12) o.dead = .001;
  if (cause === 'wall') { if (seg.fork) G.turnQueued = Math.random() < .5 ? -1 : 1; try { doTurn(); } catch (e) { reportErr(e); } }
  G.invT = 1.5; G.chaseT = 0; G.chaseVis = 0; G.y = Math.max(G.y, 0); G.vy = 0; G.slideT = 0; G.combo = 0; banner('PRACTICE', t('practiceBump'), 'room'); }
// retry as many times as your charms or hay allow (the price rises a little each time)
function freeRevive() { return SV.runs <= 3 && G.reviveN === 0 && G.cause !== 'quit' && G.cause !== 'rescue'; } // the first fail of your first three runs: one free retry
function canRevive() { if (G.cause === 'time') return false; if (freeRevive()) return true; const c = reviveCost(); return SV.clovers >= c.clover || SV.bank + Math.floor(G.hay) >= c.hay || (typeof PORTAL !== 'undefined' && PORTAL.adOK()); } // (inside a game portal: or a rewarded ad)
/* 2026-11-15（オーナー：通信が悪くなった時などに強制終了になっても、途中から再開できるように）
   走っている間、2 秒ごとに「いまの走り」の要点を端末に書いておく（CP_KEY）。アプリが急に閉じた・読み込み直しになった時は、題名画面に「つづきから走る」が出る。
   ・ふつうの走りだけ（練習・逆走・はじめての練習は対象外）
   ・走り終わった（ぶつかった・やめた）ら消す。新しく走り始めても消す。データを消す時も消す
   ・1 回の走りで CP_MAX 回まで。CP_AGE（12 時間）たったら出ない
   ・保存データ（SV）とは別の場所なので、データ引き継ぎ（RJ1.）には入らない
   ・道すじ：いまの場所から、同じ日の残りの予定（もう作ってあった先の道＋予定）を続ける。次の日からは新しく決める */
const CP_KEY = 'renjill-hay-dash-run', CP_MAX = 3, CP_AGE = 12 * 3600e3;
const CP_NUM = ['t', 'speed', 'dist', 'distEst', 'speedEst', 'score', 'hay', 'shield', 'feverG', 'clock', 'day', 'reviveN', 'bestTold', 'niceN', 'niceT', 'bumped', 'rush', 'chimed', 'soonTold', 'gaugeTold', 'feverMax', 'gigNext', 'bumpN', 'chalWon', 'spTier', 'epGigDone', 'revDone', 'lastTrainDone', 'matsuriTold'];
function cpOK() { return G.mode === 'play' && !!SV.tutDone && !G.practice && !G.rev && !G.tut; }
function cpSave() { try { if (!cpOK()) return false; const seg = curSeg(); if (!seg || !seg.tid || !THEMES[seg.tid]) return false;
  const same = G.segs.slice(G.ci + 1).filter(s => s.day === seg.day && s.step && !s.step.fork).map(s => s.step);
  const o = { v: 1, at: Date.now(), char: G.char, easy: G.easy ? 1 : 0, tid: THEMES[seg.tid].course === 'tower' ? 'tland' : THEMES[seg.tid].course === 'skytree' ? 'sland' : seg.tid, t1: seg.t1, n: G.resumeN || 0, g: {}, stats: G.stats, plan: same.concat(G.planDay === seg.day ? G.plan : []) };
  for (const k of CP_NUM) { const v = G[k]; if (typeof v === 'number' && Number.isFinite(v)) o.g[k] = v; else if (typeof v === 'boolean') o.g[k] = v ? 1 : 0; }
  localStorage.setItem(CP_KEY, JSON.stringify(o)); return true; } catch (e) { return false; } }
function cpClear() { try { localStorage.removeItem(CP_KEY); } catch (e) { } }
function cpLoad() { try { const o = JSON.parse(localStorage.getItem(CP_KEY) || 'null'), now = Date.now();
  if (!o || o.v !== 1 || !o.g || !THEMES[o.tid] || !(o.at > 0) || now - o.at > CP_AGE || now < o.at - 6e5 || (o.n | 0) >= CP_MAX || !(o.g.score >= 0) || !(o.g.day >= 1) || !(o.g.clock >= 0) || !SV.tutDone) return null;
  if (!['ren', 'jill', 'pom'].includes(o.char) || (o.char === 'pom' && !SV.pomMet)) return null; return o; } catch (e) { return null; } }
function cpTick(now) { if (now < (G.cpT || 0)) return; G.cpT = now + 2000; cpSave(); }
function resumeRun() { const o = cpLoad(); if (!o) { cpClear(); return false; }
  G.char = o.char; G.practiceNext = ''; G.revNext = 0; hideAll(); startRun(); // まず新しい走りとして用意し、その上に、書いておいた要点を戻す
  try { for (const k of CP_NUM) if (typeof o.g[k] === 'number' && Number.isFinite(o.g[k])) G[k] = o.g[k]; if (o.stats && typeof o.stats === 'object') Object.assign(G.stats, o.stats);
    G.easy = !!o.easy; G.resumeN = (o.n | 0) + 1; SV.runs = Math.max(0, (SV.runs | 0) - 1); /* 同じ走りの続きなので、走った回数は増やさない */
    const d0 = Math.max(6, Math.min(60, (+o.t1 || 0) - G.clock || 20)), s0 = newSeg(null, { t: o.tid, d: d0 }, { t0: G.clock, day: G.day }); G.segs = [s0]; G.ci = 0; G.s = 0; G.lane = 1; G.prevLane = 1; G.lat = 0; G.fork = null; G.forkRest = null;
    G.planDay = G.day; G.plan = (Array.isArray(o.plan) ? o.plan : []).filter(x => x && typeof x.t === 'string' ? THEMES[x.t] : x && x.fork); G.planClock = s0.t1; G.segDue = 0; ensureSegs();
    const p = segPos(s0, 0, 0); G.rx = p[0]; G.rz = p[1]; G.camYaw = s0.dir * Math.PI / 2; G.ey = G.camE = null; G.camSl = 0; onEnterSeg(s0);
    G.combo = 0; G.comboT = 0; G.invT = 3; G.chaseT = 2.0; G.chaseIntro = 0; G.chaseVis = 0; G.cpT = 0; cpSave(); save(); } catch (e) { reportErr(e); }
  banner('WELCOME BACK', t('cpBack'), 'good'); G.mode = 'pause'; resume(); return true; }
function reviveCost() { return { clover: G.reviveN + 1, hay: 400 * (G.reviveN + 1) }; }
function doRevive(kind) {
  const c = reviveCost();
  if (kind === 'free') { if (!freeRevive()) return; }
  else if (kind === 'ad') { /* a rewarded ad the player chose to watch (game portals only) */ }
  else if (kind === 'clover') { if (SV.clovers < c.clover) return; SV.clovers -= c.clover; }
  else { const have = SV.bank + Math.floor(G.hay); if (have < c.hay) return; let need = c.hay; const fromRun = Math.min(Math.floor(G.hay), need); G.hay -= fromRun; need -= fromRun; SV.bank -= need; }
  save(); G.reviveN++;
  const seg = curSeg();
  for (const o of seg.obs) if (o.s1 > G.s - 2 && o.s0 < G.s + 30) o.dead = .001;
  { const nx = G.segs[G.ci + 1], left = 30 - Math.max(0, seg.len - G.s); if (nx && left > 0) for (const o of nx.obs) if (o.s0 < left) o.dead = .001; G.revClearN = left; } /* 曲がり角の手前で続けたとき、曲がった先の最初の障害物にすぐぶつかっていた */
  if (G.cause === 'fall') { G.y = 0; G.fallVy = 0; G.s = Math.min(G.s, seg.len + HW - .9); G.fallSeg = null; G.fallCam = null; G.player.fallHide = false; } /* [塔 F11] 落ちたあと続けるときは、へりの手前に戻して、曲がる */
  if (G.cause === 'wall' || G.cause === 'fall') { if (seg.fork) G.turnQueued = G.lane === 0 ? -1 : G.lane === 2 ? 1 : (G.lastSwipe || (Math.random() < .5 ? -1 : 1)); /* 分かれ道で続けるとき、行き先がでたらめだった → 寄っていた側・最後にスワイプした側へ */ try { doTurn(); } catch (e) { reportErr(e); } } // whatever happens here, the run goes on (the safety net puts the runner back if needed)
  { const cs = curSeg(); if (cs && cs !== seg) for (const o of cs.obs) if (o.s1 > G.s - 2 && o.s0 < G.s + 30) o.dead = .001; } // 曲がった先の道も
  G.mode = 'play'; G.invT = 2.5; G.chaseT = 0; G.chaseVis = 0; G.player.tilt = 0; G.follow.tilt = 0; G.pom.tilt = 0; G.y = Math.max(G.y, 0); G.vy = 0; G.slideT = 0;
  if (G.rush) G.rush = .5;
  hideAll(); show('hud'); musicStart(); banner('KEEP GOING!', t('keepGoing'), 'good');
}

/* ---------- work calls during a run (2026-11-08) ----------
   So a run is not just running: every 30-45 seconds a short job comes in, each with its own rule for a few seconds
   (like the set pieces of other runners). Done = bonus points; missed = a gentle word, the run goes on. */
const GIGS = {
  boss: { dur: 10, pts: 600, en: 'THE PRESIDENT IS WATCHING!', ja: '10秒、ぶつからずに走ろう', enL: 'No bumps for 10 seconds', jaS: '社長が見てる：ぶつからない', enS: 'The president is watching: no bumps' },
  call: { dur: 15, need: 35, pts: 500, en: 'PHONE CALL: AN ERRAND!', ja: '15秒でチモシーを35本あつめて', enL: 'Grab 35 hay in 15 seconds', jaS: 'おつかい：チモシー', enS: 'Errand: hay' },
  memo: { dur: 14, need: 3, pts: 700, en: 'PAPERWORK RUSH!', ja: '14秒でナイスジャンプ・スライドを3回', enL: '3 nice jumps or slides in 14 seconds', jaS: '書類の山：ナイス', enS: 'Paperwork: nice moves' },
  rain: { dur: 9, pts: 0, en: 'SNACK TIME!', ja: '9秒間、チモシーが2倍！', enL: 'Double hay for 9 seconds', jaS: '差し入れ：チモシー2倍', enS: 'Snack time: hay x2' },
};
function gigFree() { return G.mode === 'play' && SV.tutDone && !(G.tut && G.tut.some(x => !x.done)) && !(G.pow.fly > 0) && !(G.fever > 0) && !G.rush && !(G.chaseT > 0 && !G.chaseIntro) && !(G.turnT > 0); }
function gigStart() {
  const ks = Object.keys(GIGS).filter(k => k !== G.gigLast), ep = !G.epGigDone ? epGig() : null; let k = pick(ks); if (ep) { k = ep.k; G.epGigDone = 1; } const d = GIGS[k];
  G.gig = { k, t: 0, b0: k === 'boss' ? (G.bumpN || 0) : k === 'call' ? G.stats.hay : k === 'memo' ? (G.stats.nice || 0) : 0, n: 0, ep: ep ? 1 : 0 }; G.gigLast = k;
  if (ep) { G.stats.epGig = 1; bannerNow(d.en, t('epGig', ep.title, tr(d.ja, d.enL)), 'good'); } else bannerNow(d.en, tr(d.ja, d.enL), 'good'); tone(659, .1, 'bell', .045); tone(880, .12, 'bell', .04, AU.ctx && AU.ctx.currentTime + .1);
}
function gigEnd(ok) {
  const g = G.gig, d = GIGS[g.k]; G.gig = null; G.gigNext = rand(30, 44);
  if (ok) { G.stats.gigs = (G.stats.gigs || 0) + 1; const p = Math.round(d.pts * SV.mlevel * (g.ep ? 1.5 : 1));
    if (p) { G.score += p; floatText(W / 2, cheerY(.36), lab('GOOD WORK!') + ' +' + fmt(p), '#F2C230'); }
    if (g.k !== 'rain') { banner('GOOD WORK!', tr('ボーナスゲット！', 'Bonus earned!'), 'good'); SFX.mission(); burst(W / 2, H * .4, '#F2C230', 22); react('happy', 1); } }
  else banner('SO CLOSE!', tr('次のおしごとでがんばろう', 'Get the next one.'), 'room');
}
function gigTick(dt) {
  if (!G.gig) { if (!gigFree()) return; G.gigNext -= dt; if (G.gigNext <= 0) gigStart(); return; }
  if (G.mode !== 'play') return;
  const g = G.gig, d = GIGS[g.k]; g.t += dt;
  if (g.k === 'boss') { if ((G.bumpN || 0) > g.b0) return gigEnd(false); g.n = Math.min(d.dur, g.t); if (g.t >= d.dur) return gigEnd(true); }
  else if (g.k === 'call' || g.k === 'memo') { g.n = (g.k === 'call' ? G.stats.hay : (G.stats.nice || 0)) - g.b0; if (g.n >= d.need) return gigEnd(true); if (g.t >= d.dur) return gigEnd(false); }
  else if (g.t >= d.dur) return gigEnd(true);
}
function gigHud() {
  const e = el('gigCard'); if (!e) return; const g = G.gig; if (!g || G.mode !== 'play') { if (!e.hidden) e.hidden = true; return; }
  const d = GIGS[g.k]; if (e.hidden) e.hidden = false; e.className = 'gig ' + g.k;
  setText('gigT', tr(d.jaS, d.enS)); setText('gigN', d.need ? fmt(Math.min(g.n, d.need)) + ' / ' + fmt(d.need) : Math.max(0, Math.ceil(d.dur - g.t)) + tr('秒', 's'));
  const b = el('gigBar'); if (b) b.style.width = (Math.max(0, 1 - g.t / d.dur) * 100).toFixed(1) + '%';
}

/* ---------- input actions ---------- */
function turnWindow(seg) { return seg.len - Math.max(13, G.speed * 1.0); }
function act(a) {
  if (G.mode !== 'play') return;
  const seg = curSeg();
  if (seg && seg.th.sky) return; // オオタカに運ばれている間は、操作しない（ぐるっと見回す）
  if (a === 'left' || a === 'right') {
    const d = a === 'left' ? -1 : 1;
    G.lastSwipe = d;
    if (G.s > turnWindow(seg) && (seg.fork || d === seg.turn) && (!G.turnQueued || G.turnAuto || (seg.fork && G.turnQueued !== d))) {
      G.turnQueued = d; G.turnAuto = 0; G.turnQT = seg.len - G.s; SFX.turn(); flashChoice(seg, d); return; }
    const nl = clamp(G.lane + d, 0, 2); if (nl !== G.lane) { G.prevLane = G.lane; G.lane = nl; G.laneT = .35; G.tutDid = 'side'; tone(392 + d * 30, .05, 'pluck', .045); }
  } else if (a === 'up') {
    if (G.pow.fly > 0) return;
    G.player.look = 0; // ふり返り中でも、すぐ前を向いて跳ぶ
    if (!G.air || G.coyote > 0) { G.coyote = 0; G.vy = capV(G.pow.jump > 0 ? SUPERV : JUMPV, G.y, 0, jumpTop(curSeg())); G.takeT = .09; G.takeR = 0; G.vault = 0; G.vaultDown = 0; G.air = true; G.slideT = 0; G.stats.jumps++; SFX.jump(); G.tutDid = 'up'; if (G.pow.jump > 0 && G.y < .2) skyHay(G.vy); } // one plain jump for everything (low things are cleared by its normal height)
    else G.jumpBuf = .2; // a jump pressed a moment before landing still counts (.16 → .2, 2026-11-08)
  } else if (a === 'down') {
    if (G.pow.fly > 0) return;
    G.player.look = 0; // ふり返り中でも、すぐ前を向いてしゃがむ
    if (G.air) { G.vy = -22; G.slideT = .62; G.jumpBuf = 0; } else { if (G.slideT <= 0) { G.stats.slides++; SFX.slide(); } G.slideT = .68; }
    G.tutDid = 'down';
  }
}
function flashChoice(seg, d) {
  const cue = $('#turnCue'); cue.textContent = ''; cue.className = ''; /* 曲がると決めた時の大きな矢印も出さない（オーナー 2026-11-18）。音と、分かれ道の行き先の帯で伝わる */
  if (seg.fork && seg.forkLbl) banner(d < 0 ? '← LEFT' : 'RIGHT →', L(d < 0 ? seg.forkLbl.L : seg.forkLbl.R), 'good');
}
// the turn itself never fails half way: the street to turn into is found (or built) first; only then does the runner move onto it.
// (A turn that broke off after the runner had left the old street but before arriving on the new one left the run pointing at a
// street that did not exist: the picture stopped mid-turn, with no runner, and no swipe did anything.)
function goStraight() { /* 角の無いつなぎ目：向きも横の位置もそのまま、次の道の頭へ（カメラも回らない） */
  const seg = curSeg(); let next = G.segs[G.ci + 1]; if (!next) { ensureSegs(1); next = G.segs[G.ci + 1]; } if (!next) { G.s = Math.min(G.s, seg.len); G.segDue = Math.max(G.segDue || 0, .2); return; }
  try { onLeaveSeg(seg); } catch (e) { reportErr(e); }
  if (seg.th.lift) { G.camE = null; G.ey = null; G.liftDing = 1; try { tone(988, .14, 'bell', .04); tone(784, .2, 'bell', .035, AU.ctx && AU.ctx.currentTime + .14); } catch (e) { } } /* [H13] エレベーターが着いた：カメラは新しい高さへそのまま（ゆっくり追いかけると、350m の間を飛んで見えた）・着いた音 */
  G.ci = G.segs.indexOf(next); G.s = Math.max(0, G.s - seg.len); G.turnQueued = 0; G.turnAuto = 0; G.turnQT = 0;
  if (G.segs.length - G.ci < 2 && !G.fork) ensureSegs(1); while (G.ci > 1) { G.segs.shift(); G.ci--; } G.segDue = .3;
  try { onEnterSeg(next); } catch (e) { reportErr(e); } }
function doTurn() {
  if (!G.turnAuto && G.turnQT > 0 && G.turnQT < 4.5 && !curSeg().fork) { const p3 = 80 * SV.mlevel; G.score += p3; G.stats.niceCorner = (G.stats.niceCorner || 0) + 1; floatText(W / 2, cheerY(.36), lab('NICE CORNER!') + ' +' + fmt(p3), '#F2C230'); tone(587, .1, 'bell', .04); } // a corner taken right at the last moment (2026-11-08)
  const seg = curSeg(); let dir = seg.fork ? (G.turnQueued || -1) : seg.turn; const over = clamp(G.s - seg.len, 0, 2);
  let next = null;
  if (seg.fork) {
    if (!G.fork && !G.segs[G.ci + 1]) ensureSegs(); // its two streets are normally built long before: if that failed, once more now
    if (G.fork) {
      const pickL = dir < 0, chosen = pickL ? G.fork[0] : G.fork[1];
      G.forkGhost = { seg: pickL ? G.fork[1] : G.fork[0], of: chosen }; /* 2026-11-17 オーナー「通り過ぎた景色が消えていく」：分かれ道で選ばなかったほうの道が、選んだ瞬間にまるごと消えていた（Y 字路ではななめ前に見えているのに）。選んだ道を 60m 進むまで、そのまま描く */
      G.segs.push(chosen); G.planClock = chosen.t1; G.plan = (pickL ? G.forkRest.L : G.forkRest.R).concat(G.plan); G.fork = null; G.forkRest = null; next = chosen;
    } else if (!G.segs[G.ci + 1]) { // still no fork: just the chosen side, so the run goes on
      const step = G.plan[0];
      try { if (step && step.fork) { const side = dir < 0 ? step.fork.L : step.fork.R, list = Array.isArray(side) ? side : [side]; G.plan.shift(); const t0 = G.planClock;
          try { next = forkSide(seg, list, dir, t0, G.plan[0]); } catch (e) { G.plan.unshift(step); throw e; }
          G.plan = list.slice(1).concat(G.plan); G.segs.push(next); G.planClock = next.t1; } } catch (e) { reportErr(e); }
    }
  }
  if (!next) { next = G.segs[G.ci + 1]; if (!next) { ensureSegs(1); next = G.segs[G.ci + 1]; } }
  if (!next) { G.s = Math.min(G.s, seg.len); G.segDue = Math.max(G.segDue || 0, .2); return; } // nothing to turn into yet: wait at the corner (the safety net ends the run if it never comes)
  if (next.turnIn) dir = next.turnIn; // the street that was built decides the side
  let ns = dir > 0 ? G.lat : -G.lat, nlat = clamp(dir > 0 ? -over : over, -ROAD, ROAD);
  if (Math.abs(next.turnIn) === .5) { const p = segPos(seg, G.s, G.lat), dx = p[0] - next.sx, dz = p[1] - next.sz; ns = dx * next.f[0] + dz * next.f[1]; nlat = clamp(dx * next.r[0] + dz * next.r[1], -ROAD, ROAD); } // Y 字路（45 度）：いる場所を、そのまま新しい道の向きで測りなおす
  try { onLeaveSeg(seg); } catch (e) { reportErr(e); }
  if (seg.fork && seg.fork.label === 'lunch') G.stats.lunch = 1;
  const qt = G.turnQT;
  G.ci = G.segs.indexOf(next);
  G.s = ns; G.lat = nlat; G.lane = clamp(Math.round(nlat / 1.5) + 1, 0, 2); G.prevLane = G.lane; G.turnQueued = 0; G.turnAuto = 0; G.turnQT = 0; G.turnT = .8; G.turnDir = dir; G.stats.turns++;
  // the streets after it: only what is needed right now on the turn's frame, the rest a moment later (one per frame)
  if (G.segs.length - G.ci < 2 && !G.fork) ensureSegs(1); while (G.ci > 1) { G.segs.shift(); G.ci--; }
  G.segDue = .3;
  if (qt > 6) react('wink', 0);
  try { onEnterSeg(next); } catch (e) { reportErr(e); }
}
function onEnterSeg(n) {
  BQ.length = Math.min(BQ.length, 1);
  try { sprTrim(); } catch (e) { reportErr(e); } // 長く走っても絵のメモリが増え続けないように（2026-11-12）
  const th = n.th, firstVisit = !(SV.seen && SV.seen[n.tid]); /* 2026-11-15（文字を減らす）：場所の説明の一文は、はじめて来た時だけ。2 回目からは場所の名前だけ */ G.day = n.day; G.stats[n.tid] = 1; G.forkHinted = 0; markSeen(n.tid);
  G.weather = WEATHERS[(n.day - 1) % WEATHERS.length];
  if (!G.stats.spots.includes(n.tid) && th.stamp) G.stats.spots.push(n.tid);
  if (n.step && n.step.cont) { /* still the same place */ }
  else if (n.t0 === 480 && n.day > 1) { banner(LANG === 'en' ? t('dayLbl') + ' ' + n.day + ' · ' + seasonOf(n.day).toUpperCase() : `${t('dayN', n.day)}・${L(SEASON_LBL[seasonOf(n.day)]).split('・')[0]}`, L(SEASON_LBL[seasonOf(n.day)]), 'room'); /* 2026-11-09：「日目」だけが出ていた（数字なしの t('dayN')） */ G.chimed = 0; }
  else if (n.step && n.step.co0 && COURSES[n.step.co]) { const cz = COURSES[n.step.co]; bannerNow(LANG === 'en' ? cz.en.toUpperCase() : L(cz), L(th.arrive || ARRIVE[n.tid] || { ja: '', en: '' }), 'good'); SFX.mission(); }
  else if (th.sky) { bannerNow(tr('オオタカ！', 'GOSHAWK!'), L(th.arrive), 'good'); /* [F6] 白くぬりつぶす画面の切りかえはやめた（展望台と空の道の高さがそろったので、そのまま飛び立てる。白い間、モチとユズが見えなくなっていた） */ tone(1175, .18, 'bell', .04); }
  else if (n.tid === 'lobby' || n.tid === 'ehall') { G.stats.office = 1; const b = 500 * SV.mlevel; G.score += b; banner('9:00 ON TIME!', t('onTime', fmt(b)), 'good'); SFX.mission(); react('cheer', 1); }
  else if (n.t0 >= 1080 && !G.chimed) { G.chimed = 1; G.rush = 0; G.stats.chime = 1; const b = 1000 * SV.mlevel; G.score += b; SFX.chime(); startFever(7); bannerNow("IT'S 6 PM! FEVER", t('chime', fmt(b)), 'good'); react('sparkle', 1); }
  else if (n.step && n.step.last) banner('LAST TRAIN', t('lastTrain'), 'room');
  else if (!firstVisit) { } /* [B36] 2 回目からは、場所の名前の帯を出さない（左上の札にいつも場所の名前があり、同じ字が 2 か所に出ていた） */
  else if (th.arrive || ARRIVE[n.tid]) banner(LANG === 'en' ? lblOf(n.tid).en.toUpperCase() : L(lblOf(n.tid)), firstVisit ? L(th.arrive || ARRIVE[n.tid]) : '', 'room');
  else banner(LANG === 'en' ? lblOf(n.tid).en.toUpperCase() : L(lblOf(n.tid)), LANG === 'en' || !firstVisit ? '' : (L(th).split('・')[1] || ''), 'room');
  if (th.rush) { G.rush = 1; G.chaseT = 0; G.boss = { seg: n, rev: G.reviveN || 0 }; bannerNow('BOSS: DEADLINE', t('bossGo'), 'bad'); } else { G.rush = 0; G.boss = null; } // 締め切りの山（B-39）：ボス戦ふう
  if (n.th.kind === 'train' && n.step.line) { G.announce = n.step.line.map((st, i) => ({ s: n.len * (i + 1) / (n.step.line.length + 1), st })); }
  else G.announce = [];
  G.photoT = th.stamp && !SV.album[n.tid] && !(n.step && n.step.cont) ? 2.4 : 0; G.capture = null;
  { const ar = areaOf(n.tid, n.t0); musicArea = ar === 'evening' && n.t0 >= 1170 ? 'night' : ar; const prevArea = G.musicArea; G.musicArea = musicArea; musicKey = { home: 0, commute: 2, office: 5, evening: -3, night: -5 }[musicArea];
    if (G.matsuri && matsuriSeg(n.th)) { musicArea = 'matsuri'; G.musicArea = 'matsuri'; musicKey = 0; if (!G.matsuriTold) { G.matsuriTold = 1; banner('FESTIVAL!', t('matsuri'), 'good'); } } // お祭りの日（B-29）
    if (prevArea !== musicArea) AU.swap = 1; } /* 曲の切りかえは小節の頭で（musicTick）。前は場面が変わった瞬間に、曲の途中からいきなり変わっていた */
  if (n.tid === 'station') setTimeout(jingle, 400);
  if (G.rev && n.tid === 'bedroom' && n.step && n.step.home && !G.revDone) { G.revDone = 1; const b = 3000 * SV.mlevel; G.score += b; G.stats.revHome = 1; bannerNow('HOME!', t('revHome', fmt(b)), 'good'); SFX.mission(); react('sparkle', 1); } // 逆走デー：家に着いた
}
function onLeaveSeg(o) {
  if (G.boss && G.boss.seg === o && G.mode === 'play') { const clean = (G.reviveN || 0) === G.boss.rev, b = (clean ? 2500 : 800) * SV.mlevel; G.score += b; G.stats.bossWin = 1; bannerNow('ESCAPED!', t(clean ? 'bossWin' : 'bossWin2', fmt(b)), 'good'); SFX.mission(); react('sparkle', 1); if (!OPT().calm) { burst(W / 2, H * .25, '#FFFDF7', 30); burst(W / 2, H * .25, '#C8463C', 12); } G.boss = null; } // 締め切りの山から逃げ切った
  if (SUMMIT[o.tid]) { const b = 800 * SV.mlevel; G.score += b; if (o.tid === 'tower') G.stats.towerTop = 1; if (o.tid === 'skytree') G.stats.skytreeTop = 1; banner(SUMMIT[o.tid].en, LANG === 'en' ? SUMMIT[o.tid].en2 : L(SUMMIT[o.tid]), 'good'); SFX.mission(); react('sparkle', 1); }
}
// each fever makes the next one take longer to earn (the 6 PM chime fever does not count)
function feverK() { return 1 / (1 + .6 * (G.stats.feversEarned || 0)); }
function startFever(sec) {
  if (!sec) G.stats.feversEarned = (G.stats.feversEarned || 0) + 1;
  G.fever = sec || 6; G.feverMax = G.fever; G.feverG = 0; G.soonTold = 0; G.stats.fevers++; SFX.power();
  bannerNow('MUNCH MUNCH FEVER!', t('feverGo', Math.round(G.fever)), 'good');
  floatText(W / 2, cheerY(.3), lab('FEVER!'), '#F2C230'); react('sparkle', 0); pomSay(t('pomFever'), 'sparkle', 1.4);
  const seg = curSeg(); const a = G.s + 5, b = Math.min(seg.len - 12, G.s + G.speed * 1.3 * (G.fever + .5));
  for (const o of seg.obs) if (o.s0 > a - 3 && o.s0 < b + 2) o.dead = 1.3;
  seg.items = seg.items.filter(it => it.s < a || it.s > b || ['power', 'stamp'].includes(ITEMS[it.type].kind));
  for (let q = a; q < b; q += 1.5) for (let l = 0; l < 3; l++) addItem(seg, (Math.random() < .08 ? pick(VEG) : 'hay'), q, l, .45);
}
function startFly() {
  G.stats.flights++; const seg = curSeg(); const k = seg.th.kind; G.flyY = (k === 'room' || k === 'train') ? 1.55 : 3.4;
  const a = G.s + 6, b = Math.min(seg.len - 14, G.s + G.speed * 1.1 * G.pow.fly);
  let lane = G.lane;
  for (let q = a; q < b; q += 1.6) { if (Math.random() < .12) lane = clamp(lane + (Math.random() < .5 ? -1 : 1), 0, 2); addItem(seg, Math.random() < .03 ? 'goldhay' : 'hay', q, lane, G.flyY + .45); }
}
/* ---- Kuri, the sporty new hire (a golden hamster) ---- */
const POM_BIG = 1.7; // Kuri as the runner is drawn about Yuzu's size, so a table or a curtain reads as something to slide under
function pomOn() { return G.pom.on && G.pom.who === 'pom'; } // the rookie runs with you (not the bunny that catches up when you play as Kuri)
function pomSay(line, mood, dur) { const M = G.pom; if (!pomOn()) return; M.look = dur || 1.3; M.mood = mood || 'happy'; M.say = line; }
// super jump: a little arc of hay in the sky along the jump, with a golden one at the top (2026-11-08)
function skyHay(v) { const seg = curSeg(); if (!seg || seg.fork || !(v > 0)) return 0; const t1 = v / GRAV, h = v * v / (2 * GRAV), t2 = Math.sqrt(2 * h / (GRAV * 1.25)), T = t1 + t2; let n = 0;
  for (let k = 1; k <= 5; k++) { const tt = T * k / 6, q = G.s + G.speed * tt; if (q > seg.len - 3) break; const y = tt <= t1 ? v * tt - .5 * GRAV * tt * tt : h - .5 * GRAV * 1.25 * (tt - t1) * (tt - t1);
    const yy = Math.max(0, y) + .45, near = seg.items.filter(x => !x.got && x.lane === G.lane && Math.abs(x.s - q) < 1);
    if (near.some(x => ITEMS[x.type].kind !== 'hay')) continue; // a carrot or a power-up stays where it is
    if (near.length) { near.forEach(x => { x.y = yy; x.s = q; if (k === 3) x.type = 'goldhay'; }); n++; continue; } // hay already there is lifted into the arc
    addItem(seg, k === 3 ? 'goldhay' : 'hay', q, G.lane, yy); n++; } return n; }
function pomPouch(n) { // Kuri stuffs the hay you pass into its cheek pouches; when they are full it shares a bonus
  const M = G.pom, me = G.char === 'pom'; M.pouch = (M.pouch || 0) + n; if (M.pouch < (me ? 60 : 80)) return; M.pouch = 0; G.stats.pomPuff = (G.stats.pomPuff || 0) + 1;
  const b = 600 * SV.mlevel; G.score += b; if (me) { const P = G.player; P.look = 1.2; P.mood = 'puff'; P.say = t('pomPuff'); G.lookCD = Math.max(G.lookCD, 2); } else pomSay(t('pomPuff'), 'puff', 1.5); floatText(W / 2, cheerY(.36), (tr('ほお袋ボーナス +', 'POUCH BONUS +')) + fmt(b), '#F2C230'); SFX.treat();
  const seg = curSeg(), a = G.s + 8, e = Math.min(seg.len - 14, a + 16); let lane = G.lane; for (let q = a; q < e; q += 1.6) addItem(seg, Math.random() < .12 ? 'goldhay' : 'hay', q, lane, .45);
}
function pomJoin() {
  const M = G.pom; if (M.on) { G.score += 200 * SV.mlevel; return; }
  M.on = 1; M.show = true; M.lat = G.lat; M.back = 6; M.y = 0; M.vy = 0; M.air = false; M.pouch = 0; G.stats.pom = 1;
  SFX.pom(); burst(W / 2, H * .55, '#F2C230', 26); buzz(40); G.hitStop = .06;
  const first = !SV.pomMet; SV.pomMet = (SV.pomMet || 0) + 1; save(); G.pomPeek = null;
  bannerNow(first ? (tr('ナゾの新人あらわる！', 'A MYSTERY ROOKIE!')) : (tr('クリ合流！', 'KURI JOINS!')), t(first ? 'pomJoin' : 'pomJoin2'), 'good');
  const id = G.runId; setTimeout(() => { if (G.runId === id) pomSay(t(first ? 'pomHi' : 'pomHi2'), 'sparkle', 1.8); }, 500);
}
// bad food: the runner turns round looking unwell, and the partner looks back, worried
function hasPerk(w) { return G.char === w; } // each runner has only their own perk (the bunnies who catch up Kuri do not add theirs: all three are equally hard)
function mateCheck() { // Kuri mode: the next bunny dashes up from behind and joins the run
  if (G.char !== 'pom' || G.mode !== 'play') return; const n = (G.mates.ren ? 1 : 0) + (G.mates.jill ? 1 : 0); if (n >= 2 || G.t < G.mateAt[n] || G.pow.fly > 0 || G.turnT > 0) return;
  const w = G.mateOrder[n]; G.mates[w] = 1; G.stats.mates = n + 1;
  const B = n === 0 ? G.follow : G.pom;
  if (n === 0) { Object.assign(B, { who: w, off: false, back: 7, lat: G.lat + 1.25, y: 0, vy: 0, air: false, look: 0, say: '' }); }
  else { Object.assign(B, { who: w, on: 1, show: true, back: 7, lat: G.lat - G.follow.side * 1.2, y: 0, vy: 0, air: false, look: 0, say: '', big: 1 }); }
  SFX.mission(); burst(W / 2, H * .55, '#F2C230', 22); buzz(30);
  bannerNow(t(w === 'ren' ? 'mateRenH' : 'mateJillH'), t(w === 'ren' ? 'mateRen' : 'mateJill') + (n ? t('mateAll') : ''), 'good');
  const id = G.runId; setTimeout(() => { if (G.runId !== id || G.mode !== 'play') return; B.look = 1.5; B.mood = 'happy'; B.say = t(w === 'ren' ? 'mateRenSay' : 'mateJillSay');
    const all = () => { if (G.runId !== id || G.mode !== 'play') return; if (G.turnT > 0 || !G.follow.show) { setTimeout(all, 400); return; } /* 曲がり角で仲間が見えないときに「全員そろったっす！」と言っていた → 見えてから */ const P = G.player; P.look = 1.3; P.mood = 'sparkle'; P.say = t(n ? 'matePomAll' : 'matePomSay'); };
    setTimeout(all, 1500); }, 700);
}
function feelSick() {
  if (G.mode !== 'play') return;
  const P = G.player, F = G.follow; P.look = 1.5; P.mood = 'sick'; G.lookCD = 3; G.stats.looks++;
  if (F.show) { F.look = 1.6; F.mood = 'worry'; G.worryT = 1.6;
    F.say = P.who === 'jill' ? t('worryRen') : P.who === 'pom' ? t('worryPom') : t('worryJill'); }
  if (pomOn() && G.pom.show) pomSay(t('pomWorry'), 'worry', 1.7);
  if (G.char === 'pom' && G.pom.on && G.pom.show && !pomOn()) { const M = G.pom; M.look = 1.6; M.mood = 'worry'; M.say = t('worryPom'); }
  tone(392, .16, 'pluck', .07); tone(330, .2, 'pluck', .06, AU.ctx && AU.ctx.currentTime + .14);
}
// the bunny turns around with a cute face
function react(mood, both) {
  if (G.mode !== 'play') return;
  if (G.lookCD > 0 && !both) return;
  { const seg = curSeg(), ahead = G.speed * 1.3; if (!both && seg.obs.some(o => !o.dead && o.k !== 'deco' && o.s0 + (o.ds || 0) > G.s - 1 && o.s0 + (o.ds || 0) < G.s + ahead)) return; }
  G.lookCD = both ? 2.5 : 10; G.player.look = 1.05; G.player.mood = mood; G.player.say = ''; G.stats.looks++;
  if (both) { G.follow.look = 1.05; G.follow.mood = pick(['happy', 'sparkle', 'open']); }
  tone(784, .12, 'bell', .05); tone(1047, .16, 'bell', .04, AU.ctx && AU.ctx.currentTime + .08);
}

/* ---------- first-run tutorial ----------
   Three teaching obstacles in the first room; time slows near each one until the right swipe is made. */
const TUT = KB_PC ? [{ s: 46, need: 'side', ob: 'box', lane: 1, en: '← DODGE →', ja: { ja: '← → キーでよける', en: 'Press ← or → to dodge' } }, // PC: the arrow keys (2026-11-16)
  { s: 70, need: 'up', ob: 'futon', en: '↑ JUMP', ja: { ja: '↑ キーでジャンプ', en: 'Press ↑ to jump' } },
  { s: 94, need: 'down', ob: 'noren', en: '↓ SLIDE', ja: { ja: '↓ キーでスライディング', en: 'Press ↓ to slide' } }]
  : [{ s: 46, need: 'side', ob: 'box', lane: 1, en: '← SWIPE →', ja: { ja: '左右にスワイプしてよける', en: 'Swipe left or right to dodge' } },
  { s: 70, need: 'up', ob: 'futon', en: '↑ JUMP', ja: { ja: '上にスワイプしてジャンプ', en: 'Swipe up to jump' } },
  { s: 94, need: 'down', ob: 'noren', en: '↓ SLIDE', ja: { ja: '下にスワイプしてスライディング', en: 'Swipe down to slide' } }];
function setupTutorial(seg) {
  seg.obs = seg.obs.filter(o => o.s0 > 112); seg.items = seg.items.filter(it => it.s > 112);
  for (const st of TUT) { makeObs(seg, st.ob, st.s, st.lane ?? null); for (let q = st.s - 14; q < st.s - 3; q += 1.7) addItem(seg, 'hay', q, 1, .45); }
  const R = seg.turn > 0; // last lesson: the corner at the end of the room
  const turnStep = KB_PC ? { s: seg.len, need: 'turn', en: R ? 'TURN →' : '← TURN', ja: { ja: R ? '曲がり角！ 今、→ キーで曲がる' : '曲がり角！ 今、← キーで曲がる', en: R ? 'Corner! Press → now to turn' : 'Corner! Press ← now to turn' },
    pre: { ja: R ? 'この先は右に曲がる。矢印が出たら → キー' : 'この先は左に曲がる。矢印が出たら ← キー', en: R ? 'The path turns right ahead. Press → when the arrow appears' : 'The path turns left ahead. Press ← when the arrow appears' } }
    : { s: seg.len, need: 'turn', en: R ? 'TURN →' : '← TURN', ja: { ja: R ? '曲がり角！ 今、右にスワイプして曲がる' : '曲がり角！ 今、左にスワイプして曲がる', en: R ? 'Corner! Swipe right now to turn' : 'Corner! Swipe left now to turn' },
    pre: { ja: R ? 'この先は右に曲がる。矢印が出たら右へスワイプ' : 'この先は左に曲がる。矢印が出たら左へスワイプ', en: R ? 'The path turns right ahead. Swipe right when the arrow appears' : 'The path turns left ahead. Swipe left when the arrow appears' } };
  G.tut = TUT.concat([turnStep]).map(x => Object.assign({ done: 0 }, x)); G.tutSeg = seg;
}
function tutFinish(cue) { if (G.tutEnd) return; G.tutEnd = 1; SV.tutDone = 1; save(); cue.className = ''; banner('GOOD!', tr('その調子！ チモシーを集めながら進もう', 'Nice! Keep going and grab the hay'), 'good');
  if (SV.runs <= 1) { const id = G.runId; setTimeout(() => { if (G.runId !== id || G.mode !== 'play' || G.fever > 0) return; startFever(5); G.stats.fevers--; bannerNow(lab('FIRST-RUN BONUS!'), t('firstFever'), 'good'); burst(W / 2, H * .45, '#F2C230', 30); }, 2200); } } // a first taste of the fever, right after the lesson
function tutorialScale(seg, dt) {
  if (!G.tut) return 1;
  const cur = G.tut.find(x => !x.done); const cue = $('#tutCue');
  if (seg !== G.tutSeg) { if (cue.className) cue.className = ''; G.tut = null; return 1; }
  if (!cur) { tutFinish(cue); return 1; }
  if (seg !== G.tutSeg) { cue.className = ''; return 1; }
  const d = cur.s - G.s;
  if (cur.need === 'turn') {
    if (G.turnQueued === seg.turn) { cur.done = 1; cue.className = ''; tone(659, .12, 'bell', .05); tutFinish(cue); return 1; }
    const inWin = G.s > turnWindow(seg);
    if (inWin) { cue.innerHTML = `<b>${lab(cur.en)}</b><span>${esc(L(cur.ja))}</span>`; cue.className = 'show turn'; return clamp(.35 + (d - 4) * .05, .35, .65); }
    if (d < 34) { cue.innerHTML = `<b>${seg.turn > 0 ? '↱' : '↰'}</b><span>${esc(L(cur.pre))}</span>`; cue.className = 'show'; }
    return 1;
  }
  if (d < 0) { cur.done = 1; return 1; }
  if (d < 11) {
    const okWin = true;
    if ((G.tutDid === cur.need && okWin) || (cur.need === 'side' && G.lane !== 1)) { cur.done = 1; G.tutDid = ''; cue.className = ''; tone(659, .12, 'bell', .05); return 1; }
    if (G.tutDid === cur.need && !okWin) G.tutDid = ''; // too early: keep waiting
    cue.innerHTML = `<b>${lab(cur.en)}</b><span>${esc(L(cur.ja))}</span>`; cue.className = 'show';
    if (G.air || G.slideT > 0) return 1;
    return clamp(.38 + (d - 3) * .06, .38, .75); // eases down, but never to a crawl
  }
  G.tutDid = '';
  return 1;
}

/* ---------- per-frame update ---------- */
function update(dt) {
  if (G.prepHold) { G.prepHold -= dt; if (G.prepHold > 0 && G.mode === 'play') return; G.prepHold = 0; } /* 走り出す前の準備の間は、ゲームを止めておく（最大 1.5 秒） */
  if (G.segDue > 0 && G.mode !== 'title' && (G.segDue -= dt) <= 0) { G.segDue = 0; ensureSegs(1); if (!G.fork && G.segs.length - G.ci < 4 && !G.segDue) G.segDue = .05; } // one street per step, never a pile in one frame
  { const sg = G.segs[G.ci]; if (sg && sg.th.kind === 'train') trainTick(sg, dt); else G.jolt = 0; }
  for (const sg of [G.segs[G.ci], G.segs[G.ci + 1]]) if (sg && sg.walkers) for (const w of sg.walkers) { w.s += w.vs * dt; if (w.s > w.a1) w.s = w.a0; else if (w.s < w.a0) w.s = w.a1; }
  G.t += dt; G.dtFX = dt;
  if (G.mode === 'title') { titleFrame(dt); return; }
  if (G.mode === 'dying') {
    G.dyingT -= dt; G.player.tilt = lerp(G.player.tilt || 0, G.cause === 'papers' ? .3 : -1.2, dt * 8); G.follow.tilt = lerp(G.follow.tilt || 0, .5, dt * 6); G.pom.tilt = lerp(G.pom.tilt || 0, -.5, dt * 6);
    if (G.cause === 'papers') G.chaseVis = Math.min(1.6, G.chaseVis + dt * 1.5);
    G.flashT = Math.max(0, G.flashT - dt * 2);
    if (G.cause === 'fall' && G.fallCam) { /* [塔 F11] へりの先へ飛び出して落ちる */
      G.fallT += dt; G.s += G.fallV0 * Math.max(0, 1 - G.fallT * .8) * dt; G.fallVy -= 16 * dt; G.y += G.fallVy * dt; G.player.tilt = lerp(G.player.tilt || 0, -.6, dt * 4); G.follow.tilt = lerp(G.follow.tilt || 0, 0, dt * 6); G.pom.tilt = lerp(G.pom.tilt || 0, 0, dt * 6);
      placeCamera(dt * .3); const P = G.player, F = G.follow, M = G.pom, fc = G.fallCam;
      F.wx = G.fallF.x; F.wy = G.fallF.y; F.wz = G.fallF.z; if (G.fallM && M.on) { M.wx = G.fallM.x; M.wy = G.fallM.y; M.wz = G.fallM.z; }
      CAM.x = fc.x; CAM.y = fc.y; CAM.z = fc.z; CAM.pitch = fc.pitch + Math.min(.32, G.fallT * .45); camPrep(); G.vy = G.fallVy; P.air = true; P.fallHide = G.y < -1.3; /* へりより下へ落ちたら見えなくなる（床の上に重なって見えないように） */
      P.depth = (P.wx - CAM.x) * CAM.s + (P.wz - CAM.z) * CAM.c; F.depth = (F.wx - CAM.x) * CAM.s + (F.wz - CAM.z) * CAM.c; if (M.on) M.depth = (M.wx - CAM.x) * CAM.s + (M.wz - CAM.z) * CAM.c;
      if (G.dyingT <= 0) { G.mode = 'dead'; if (canRevive()) openRevive(); else endRun(); } return; }
    placeCamera(dt * .3);
    if (G.dyingT <= 0) { G.mode = 'dead'; if (canRevive()) openRevive(); else endRun(); }
    return;
  }
  if (G.mode !== 'play') return;
  if (OPT().calm) { G.hitStop = 0; G.shake = Math.min(G.shake, .15); }
  if (G.hitStop > 0) { G.hitStop -= dt; G.shake = Math.max(0, G.shake - dt); placeCamera(0); return; }
  const seg = curSeg(), P = G.player;
  dt *= tutorialScale(seg, dt);

  // speed rises gently and levels off (it used to reach 24 m/s mid-run, which got too hard)
  const base = Math.min(G.easy ? 12.6 : MAXSPD, (SV.tutDone ? 12.4 : 11) + G.dist * .0024 + (G.day - 1) * .7);
  { const tier = Math.floor((base - 12.4) / 1.8); if (tier > (G.spTier || 0) && SV.tutDone) { G.spTier = tier; banner('SPEED UP!', tr('少し速くなった！', 'A little faster now!'), 'good'); tone(523, .1, 'bell', .04); tone(784, .14, 'bell', .04, AU.ctx && AU.ctx.currentTime + .09); } } // so it never just 'gets hard' without a word (2026-11-08)
  const target = base * (G.legend ? 1.15 : 1) * (G.pow.dash > 0 ? 1.4 : 1) * (G.fever > 0 ? 1.18 : 1) * (G.pow.fly > 0 ? 1.1 : 1) * (seg.th.sky ? .5 : 1); // 空の上はゆっくり（景色を見わたす時間）
  G.speed = lerp(G.speed, target, 1 - Math.exp(-dt * 2.5));
  if (AU.music && OPT().music) { const cm = G.clock % 1440, night = cm >= 1200 || cm < 360, tg = musicLv() * (night ? .8 : 1); AU.music.gain.value += (tg - AU.music.gain.value) * Math.min(1, dt * .6); } // the music settles down at night (2026-11-08)
  const step = G.speed * dt, prevS = G.s, prevY = G.y;
  { const tm = G.tidT || (G.tidT = {}); tm[seg.tid] = (tm[seg.tid] || 0) + dt; } // その走りでいちばん長くいた名所（B-45）
  G.s += step; G.dist += step; G.stats.cleanCur += step; G.stats.clean = Math.max(G.stats.clean, G.stats.cleanCur);
  const mult = SV.mlevel * (G.legend ? 1.5 : 1) * (G.pow.x2 > 0 ? 2 : 1) * (G.fever > 0 ? 2 : 1) * (pomOn() ? 1.2 : 1);
  { const p = step * mult * (3 + G.speed * .12); G.score += p; G.stats.ptD = (G.stats.ptD || 0) + p; } // distance is the backbone: about 4-6 points per metre, more when fast
  const tl = LANES[G.lane]; const dl = tl - G.lat; if (G.pushT > 0) G.pushT -= dt; G.lat += Math.sign(dl) * Math.min(Math.abs(dl), dt * (G.pushT > 0 ? 7 : 17));
  if (G.laneT > 0) G.laneT -= dt;
  // support + movers
  let ground = 0;
  const pl0 = G.lat - .3, pl1 = G.lat + .3, flying = G.pow.fly > 0;
  for (const o of seg.obs) {
    if (o.dead) { o.dead += dt * 2.4; continue; }
    if (o.mv) { if (o.s0 + (o.ds || 0) - G.s < 42 && (!seg.prevIn || o.s0 + (o.ds || 0) > 30)) { o.ds = (o.ds || 0) - o.mv * dt; if (o.roar && !o.roared) { o.roared = 1; SFX.roar(); } } }
    if (o.k === 'deco' || (o.k === 'high' && !lowTop(o))) continue; // a low table top can be landed on, like a cushion
    const os0 = o.s0 + (o.ds || 0), os1 = o.s1 + (o.ds || 0);
    if (!o.car && G.s + .3 > os0 && G.s - .3 < os1 && pl1 > o.l0 && pl0 < o.l1 && prevY >= o.top - .22) ground = Math.max(ground, o.top);
  }
  // vertical
  if (flying) { G.y = lerp(G.y, G.flyY, 1 - Math.exp(-dt * 4)); G.vy = 0; G.air = true; }
  else {
    if (!G.air && G.y > ground + .001 && G.vy <= 0) G.coyote = .1; // coyote time: a jump still counts for a tenth of a second after running off an edge
    if (G.y > ground + .001 || G.vy > 0) { G.vy -= GRAV * dt * (G.vy < 0 ? 1.25 : 1) * (G.vault || 1); G.y += G.vy * dt; G.air = true;
      { const cs = curSeg(); if (cs && cs.ceilH) { const jt = jumpTop(cs) + .12; if (G.y > jt && G.y < 20) { G.y = jt; if (G.vy > 0) G.vy = 0; } } } /* ありえない高さ（数値の壊れ）は、ここで直さず安全ネット（runOK）に任せる */ /* 跳んだまま天井のある場所に入った時も、頭が天井をこえない */ }
    if (G.y <= ground + .001 && G.vy <= 0) { // land: also when the fall stops a hair above the floor (a height of 0.0005 used to leave the runner 'in the air' forever: no gravity, no landing, no jump)
      if (G.air && G.vy < -4) { SFX.land(); const sp = spriteAt(G.player.wx, G.ey || 0, G.player.wz); if (sp) for (let k = 0; k < 8; k++) FX.push({ x: sp.sx + rand(-30, 30), y: sp.sy, vx: rand(-120, 120), vy: rand(-90, -20), life: rand(.25, .45), t: 0, c: 'rgba(230,220,205,.85)', r: rand(2, 4) }); }
      if (G.air) { G.landT = .14; G.landK = clamp(-G.vy / 16, .4, 1); G.airN = 0; G.landDust = 1; } // the landing squash (drawn in drawBunnyWorld)
      G.y = ground; G.vy = 0;
      if (G.air && G.jumpBuf > 0) { G.jumpBuf = 0; G.vy = capV(G.pow.jump > 0 ? SUPERV : JUMPV, G.y, 0, jumpTop(curSeg())); G.takeT = .09; G.takeR = 0; G.stats.jumps++; SFX.jump(); G.y += .01; G.vault = 0; G.vaultDown = 0; } else { G.air = false; G.vault = 0; G.vaultDown = 0; }
    }
  }
  if (G.slideT > 0) G.slideT -= dt;
  const sliding = G.slideT > 0 && !G.air;
  const ph = sliding ? SLIDE_H : STAND_H;
  // collisions
  if (!flying) for (const o of seg.obs) {
    if (o.dead || o.k === 'deco') continue;
    const ds = o.ds || 0, os0 = o.s0 + ds, os1 = o.s1 + ds;
    if (os1 < G.s - 2 || os0 > G.s + 2) continue;
    const latHit = pl1 > o.l0 && pl0 < o.l1, sHit = G.s + .3 > os0 && G.s - .3 < os1;
    if (sHit && !latHit && o.k === 'block' && !o.nm && G.laneT > 0 && Math.min(Math.abs(pl0 - o.l1), Math.abs(o.l0 - pl1)) < .45) { o.nm = 1; nice('close'); }
    if (!(sHit && latHit)) continue;
    const oTop = o.hitTop != null ? o.hitTop : o.top, yHit = o.k === 'high' ? (G.y + ph > o.yb && G.y < o.top) : (G.y < oTop - .02 - (G.vy < 0 ? .12 : 0));
    if (!yHit) { if (!o.nm && !o.full && G.invT <= 0 && G.fever <= 0) { o.nm = 1; nice(o.k === 'high' ? 'slide' : 'jump'); } continue; }
    if ((o.k !== 'high' || lowTop(o)) && prevY >= oTop - .22) continue;
    const frontal = prevS + .3 <= os0 + (o.mv ? o.mv * dt : 0) + .06 + step * .1;
    if (frontal || o.full) hit(o);
    else { if (G.pow.dash > 0 || G.fever > 0) smash(o); else { let nl = G.prevLane; if (nl === G.lane) { const c = (o.l0 + o.l1) / 2; nl = clamp(G.lane + (G.lat >= c ? 1 : -1), 0, 2); if (nl === G.lane) nl = clamp(G.lane - (G.lat >= c ? 1 : -1), 0, 2); } G.lane = nl; G.prevLane = nl; G.lastHit = o; G.pushT = .3; stumble(); } } // 横からの押し戻しは 0.3 秒ゆっくり（C-9）
    if (G.mode !== 'play') return;
  }
  // a puddle on a rainy day: a splash when you run through it (2026-11-08)
  if (seg.puddles && G.weather === 'rain' && !G.air) for (const q of seg.puddles) { if (q.hit || Math.abs(G.s - q.s) > .5 || Math.abs(G.lat - q.lat) > .55 * q.w + .2) continue; q.hit = 1; G.stats.splash = (G.stats.splash || 0) + 1;
    const sp = spriteAt(G.player.wx, G.ey || 0, G.player.wz); if (sp && !OPT().calm) for (let k = 0; k < 14; k++) FX.push({ x: sp.sx + rand(-40, 40), y: sp.sy, vx: rand(-160, 160), vy: rand(-260, -90), life: rand(.3, .55), t: 0, c: 'rgba(170,205,235,.9)', r: rand(2, 4) });
    tone(330, .08, 'pluck', .03); tone(494, .06, 'pluck', .02, AU.ctx && AU.ctx.currentTime + .04); }
  // items
  const cy = G.y + (sliding ? .22 : .45);
  for (const it of seg.items) {
    if (it.got) continue;
    const kind = ITEMS[it.type].kind, dsI = it.s - G.s;
    if (dsI < -3) { it.got = 2; continue; }
    if ((G.pow.magnet > 0 || G.fever > 0) && kind !== 'bad' && dsI < (G.fever > 0 ? 5 : 15) && dsI > -1) { const k = Math.min(1, dt * 9); it.s = lerp(it.s, G.s + .1, k); it.lat = lerp(it.lat, G.lat, k); it.y = lerp(it.y, cy, k); }
    if (Math.abs(it.s - G.s) < .9 && Math.abs(it.lat - G.lat) < .85 && Math.abs(it.y - cy) < .85) collect(it, seg);
    if (G.mode !== 'play') return;
  }
  // corners and forks
  const win = turnWindow(seg);
  if (seg.turn === 0 && !seg.fork) { if (G.s >= seg.len) { goStraight(); return; } } else /* まっすぐつながる道（展望台 → 空 → 着地）：角が無いので、そのまま先へ */
  // invincible states turn on their own, but only at the very last moment, so a swipe always wins
  if (G.s > seg.len - .6 && !G.turnQueued && (G.pow.dash > 0 || G.fever > 0 || G.invT > 1.6 || flying || seg.fork || seg.th.sky || seg.th.grab || (G.tut && seg === G.tutSeg))) { G.turnQueued = seg.fork ? (G.lane === 0 ? -1 : G.lane === 2 ? 1 : (G.lastSwipe || -1)) : seg.turn; G.turnAuto = 1; }
  if (G.s >= seg.len && G.turnQueued) doTurn();
  else if (G.s > seg.len + HW - .8) { if (towerFall(seg)) { die('fall'); return; } if (!softHit()) { die('wall'); return; } G.turnQueued = seg.fork ? (G.lane === 0 ? -1 : G.lane === 2 ? 1 : (G.lastSwipe || -1)) : seg.turn; G.turnAuto = 1; try { doTurn(); } catch (e) { reportErr(e); } return; } // 走り始めは曲がり損ねても、ぶつかって曲がる
  const cue = $('#turnCue');
  { // fork cards: both destinations on screen well before the junction, lit up when the swipe window opens
    const fc = $('#forkCards'), showF = seg.fork && seg.forkLbl && G.s > seg.len - 42 && G.s < seg.len;
    if (showF) { if (fc.hidden) { fc.hidden = false; $('#fcL b').textContent = L(seg.forkLbl.L); $('#fcR b').textContent = L(seg.forkLbl.R); const q = seg.fork.label === 'lunch' ? t('lunch') : seg.fork.label === 'errand' ? t('errandQ') : t('detour'); $('#fcL small').textContent = q; $('#fcR small').textContent = t('hintFork'); if (seg.richSide) { const c = seg.richSide < 0 ? '#fcL' : '#fcR'; $(c + ' small').textContent = t('richHay'); } banner(seg.fork.label === 'lunch' ? 'LUNCH?' : 'WHICH WAY?', q + (tr('　', ' ')) + t('hintSwipe'), 'good'); $('#fcL').className = 'fc l' + (seg.richSide < 0 ? ' rich' : ''); $('#fcR').className = 'fc r' + (seg.richSide > 0 ? ' rich' : ''); }
      fc.classList.toggle('now', G.s > win && !G.turnQueued);
      if (G.turnQueued && !G.turnAuto) { $('#fcL').classList.toggle('pick', G.turnQueued < 0); $('#fcR').classList.toggle('pick', G.turnQueued > 0); $('#fcL').classList.toggle('dim', G.turnQueued > 0); $('#fcR').classList.toggle('dim', G.turnQueued < 0); } }
    else if (!fc.hidden) fc.hidden = true;
  }
  if (G.turnQueued && !G.turnAuto && G.s < seg.len) { /* chosen: keep the locked arrow */ }
  else if (G.s > win && G.s < seg.len && !G.turnQueued && (seg.turn || seg.fork)) { cue.textContent = seg.fork ? '←\u2002→' : seg.turn > 0 ? '→' : '←'; /* 2026-11-18 オーナー「大きな矢印はいらない（景色のじゃま）」→ 2026-11-19 オーナー「曲がる時の小さな線（ーー）は矢印にして」：曲がる側に、小さな矢印だけを出す（点滅はせず、ゆっくり大きさが変わる） */ cue.className = (seg.fork ? 'c' : seg.turn > 0 ? 'r' : 'l') + ' win show'; cue.style.setProperty('--left', clamp((seg.len - G.s) / Math.max(1, seg.len - win), 0, 1).toFixed(3)); } // 曲がれる残り（C-6）：矢印の下の線が短くなっていく
  else cue.className = '';
  // events inside a stretch
  if (seg.goldRoad && !seg.goldTold && G.s > seg.goldRoad - 34) { seg.goldTold = 1; banner('GOLDEN ROAD!', tr('金のチモシーの道！', 'A road of golden hay!'), 'good'); }
  for (const a of G.announce) if (!a.done && G.s > a.s) { a.done = 1; const st = LANG === 'ja' || LANG === 'zh' ? a.st : stEn(a.st); banner('NEXT: ' + stEn(a.st).toUpperCase(), LANG === 'en' ? '' : t('nextStation', st), 'room'); tone(659, .14, 'bell', .06); tone(523, .2, 'bell', .06, AU.ctx && AU.ctx.currentTime + .14); }
  if (seg.movers) for (const m of seg.movers) { if (m.cross) { m.dl = (m.dl == null ? -20 : m.dl) - m.v * dt * .6; if (m.dl > 90) m.dl = -40; continue; } m.ds += m.v * dt; if (m.r1 != null) { if (m.ds < m.r0 - 42) m.ds = m.r1 + 6; } else if (m.ds < -60) m.ds = seg.len + 30; }
  if (seg.th.rumble) { G.rumbleT -= dt; if (G.rumbleT <= 0) { G.rumbleT = rand(5, 8); G.shake = 1; SFX.rumble(); } }
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 1.6);
  if (G.photoT > 0) { G.photoT -= dt; if (G.photoT <= 0 && seg.th.stamp) { react('sparkle', 1); G.capture = { tid: seg.tid, t: .35 }; } }
  if (G.capture) { G.capture.t -= dt; }
  // timers
  for (const k in G.pow) if (G.pow[k] > 0) { G.pow[k] = Math.max(0, G.pow[k] - dt); if (k === 'fly' && G.pow.fly === 0) { G.invT = Math.max(G.invT, 1.2); G.vy = 0; } }
  if (G.fever > 0) { const f0 = G.fever; G.fever = Math.max(0, G.fever - dt); if (G.fever > 0 && G.fever < 2.2 && Math.ceil(f0 * 2) !== Math.ceil(G.fever * 2)) tone(784, .06, 'pluck', .035); // the fever's last seconds tick (2026-11-08)
    if (G.fever === 0) { banner('', t('feverEnd'), ''); G.invT = Math.max(G.invT, 1); } } // a moment's grace as the fever ends, so it never ends in a crash
  if (G.gainT > 0) G.gainT -= dt;
  if (G.invT > 0) G.invT -= dt;
  if (G.turnT > 0) G.turnT -= dt;
  if (G.lookCD > 0) G.lookCD -= dt;
  if (G.jumpBuf > 0) G.jumpBuf -= dt;
  if (G.coyote > 0) G.coyote -= dt;
  if (G.landT > 0) G.landT -= dt; if (G.takeT > 0) G.takeT -= dt;
  if (G.comboT > 0) { G.comboT -= dt; if (G.comboT <= 0) G.combo = 0; }
  if (G.chaseT > 0) G.chaseT = Math.max(0, G.chaseT - dt);
  courseTick(); chalFlags(); // 社長・おつかいは「おしごと」（gigTick）と同じなので、そちらに一本化（2026-11-08）
  const chaseTarget = G.rush ? .55 + .1 * Math.sin(G.t * 3) : G.chaseT > 0 ? Math.min(1, G.chaseT) : 0;
  G.chaseVis = lerp(G.chaseVis, chaseTarget, 1 - Math.exp(-dt * 4));
  G.flashT = Math.max(0, G.flashT - dt * 2.5);
  if (G.hint > 0) G.hint -= dt;
  G.clock = seg.t0 + (seg.t1 - seg.t0) * clamp(G.s / seg.len, 0, 1);
  // animation
  P.ph += dt * (P.who === 'pom' ? 10 + G.speed * .75 : 6 + G.speed * .55); /* [46] クリは足が短いので、もう少し速く足を回す（2026-11-17） */ /* クリは足が短いので、同じ速さでも足の回転が速い */
  { const c = Math.floor(P.ph / Math.PI); if (c !== G.stepC) { G.stepC = c; if (!G.air && !sliding && !flying && G.invT <= 0) SFX.step(c & 1, seg.th.kind); if (G.weather === 'snow' && seg.th.kind !== 'room' && seg.th.kind !== 'train') { const fw = segPos(seg, G.s, G.lat + ((c & 1) ? .12 : -.12)); (G.prints = G.prints || []).push({ x: fw[0], z: fw[1], y: fw[2], t: G.t, a: G.player.wy }); if (G.prints.length > 40) G.prints.shift(); } } } // footprints in the snow (2026-11-08) // a soft footstep on every stride
  { const sky = !!seg.th.sky, rel = sky ? clamp((G.s - (seg.len - 30)) / 16, 0, 1) : 0, nx = G.segs[G.ci + 1], hin = sky ? 1 : (seg.turn === 0 && !seg.fork && nx && nx.th.sky) ? clamp((G.s - (seg.len - 11)) / 8, 0, 1) : 0; /* [F4] 展望台のテラスの先で、オオタカが上からおりてきて、つかむ */ P.hawk = G.follow.hawk = G.pom.hawk = hin > 0; P.hawkIn = G.follow.hawkIn = G.pom.hawkIn = hin; P.hawkRel = G.follow.hawkRel = G.pom.hawkRel = rel; if (!sky) G.hawkLand = 0; else if (!sky && seg.th.climb && !OPT().calm && (seg.th.kind === 'deck' || seg.tid === 'tdeck') && Math.random() < dt * clamp(altitude(seg, G.s) / 300, 0, .5)) { try { whoosh(.9, .02 + clamp(altitude(seg, G.s) / 150, 0, 1) * .03, 250, 1200); } catch (e) { } } /* [H25] 外階段・屋上・展望台のテラス：高くなるほど、ときどき吹く風の音が強く・多くなる */ if (sky && !G.skyWhoosh) { G.skyWhoosh = 1; try { whoosh(1.4, .09, 300, 1800); } catch (e) { } } if (!sky) G.skyWhoosh = 0; /* [F9] 飛び立つ時の、長い風の音 */ if (rel > .2 && !G.hawkLand) { G.hawkLand = 1; G.landT = .14; G.landK = .85; if (!OPT().calm) G.shake = Math.max(G.shake || 0, .25); /* [F13] 着地の小さなゆれ */ try { SFX.land(); const sp = spriteAt(P.wx, G.ey || 0, P.wz); if (sp) for (let k = 0; k < 10; k++) FX.push({ x: sp.sx + rand(-34, 34), y: sp.sy, vx: rand(-130, 130), vy: rand(-80, -15), life: rand(.3, .5), t: 0, c: 'rgba(214,222,190,.85)', r: rand(2, 4) }); } catch (e) { } } /* [D18] 着地の一歩：足をはなした時、ぽんと着地（体が少しつぶれる・音・芝の小さなほこり） */ /* [D1] 地面の近くで、オオタカが足をはなす（0→1：はなして、空へもどっていく） */
    if (rel > 0 && !G.hawkLet) { G.hawkLet = 1; tone(880, .12, 'bell', .03); tone(660, .16, 'bell', .025, AU.ctx && AU.ctx.currentTime + .1); } if (!sky) G.hawkLet = 0; }
  P.air = G.air && !flying; P.slide = sliding; P.fly = flying; P.flash = G.invT > 0 && G.invT < 2.4 && !flying; P.glow = G.shield ? '#5FB05A' : G.pow.dash > 0 ? '#F08A2E' : null;
  if (P.look > 0) P.look = Math.max(0, P.look - dt);
  if (G.follow.look > 0) G.follow.look = Math.max(0, G.follow.look - dt);
  mateCheck();
  buddy(dt, seg);
  placeCamera(dt);
  gigTick(dt);
  G.missionCheck -= dt; if (G.missionCheck <= 0) { G.missionCheck = .5; checkMissions(true); checkAch(true); dailyCheck(true); }
  hud();
}
// 空の上：おりながら、カメラが 1 回ぐるっと回る（東京を 360 度見わたす。終わりは進む向きにもどる）
/* [降りる時 D1] 2026-11-20 オーナー「高い所から下に降りる時に、道路が動いてしまう」：オオタカと降りる間、カメラが 1 回転（360 度）していたので、
   下に見える着地の道（公園の小道）が、画面の中をぐるっと流れて「道が動く」ように見えた。回るのをやめ、左右を少し見わたす（±20 度）だけにして、
   後半（着地の道がはっきり見えてから）はまっすぐ前を向いたままにする */
/* [降りる時 S1] 2026-11-20 オーナー「前は景色をぐるっと見てから降りていたのに、真下にまっすぐ降りるようになった。前の方がよかった」：1 回転を元にもどす。
   ただし ①回るのは前半（道の長さの 55% まで）で終わらせ、後半は着地の道をまっすぐ見る ②回っている間はカメラを水平近くまで上げて（下の道ではなく）遠くの景色を見る（S2） */
function skySpinU(seg) { if (!seg || !seg.th.sky) return -1; return clamp((G.s - 10) / Math.max(40, seg.len * .55 - 10), 0, 1); }
function skySide(seg) { const y = G.camYaw != null ? G.camYaw : seg.dir * Math.PI / 2, y0 = seg.dir * Math.PI / 2, s0 = Math.sign(seg.r[0] * Math.cos(y0) - seg.r[1] * Math.sin(y0)) || 1; return [Math.cos(y) * s0, -Math.sin(y) * s0]; } /* [空 K8] 画面の上で「道の右」にあたる向き（カメラが回っても、画面の右） */
function skySpin(seg) { const u = skySpinU(seg); return u < 0 ? 0 : Math.PI * 2 * sstep(u); }
function skyLookK(seg) { const u = skySpinU(seg); if (u <= 0 || u >= 1) return 0; return sstep(clamp(u * 5, 0, 1)) * sstep(clamp((1 - u) * 3.5, 0, 1)); }
function placeCamera(dt) {
  const seg = curSeg(), P = G.player, F = G.follow;
  const p = segPos(seg, G.s, G.lat);
  const k = G.turnT > 0 ? 1 - Math.exp(-dt * 14) : 1;
  G.rx = lerp(G.rx, p[0], k); G.rz = lerp(G.rz, p[1], k);
  const eP = segE(seg, G.s); G.ey = G.ey == null || G.turnT <= 0 && Math.abs(G.ey - eP) > 3 ? eP : lerp(G.ey, eP, Math.min(1, dt * 18));
  P.wx = G.rx; P.wz = G.rz; P.wy = G.ey + G.y + (P.air || P.fly ? 0 : Math.abs(Math.sin(P.ph)) * (P.who === 'pom' ? .012 : .045 + Math.min(.035, G.speed * .002))); // the run bob grows a little with speed
  if (G.aura && G.mode === 'play' && !OPT().calm && (G.auraT = (G.auraT || 0) + (G.dtFX || .016)) > .045) { G.auraT = 0; const sp = spriteAt(P.wx + rand(-.35, .35), P.wy + rand(.2, 1.1) * (P.big || 1), P.wz + .2); if (sp) FX.push({ x: sp.sx, y: sp.sy, vx: rand(-25, 25), vy: rand(-70, -20), life: rand(.35, .7), t: 0, c: Math.random() < .5 ? 'rgba(255,214,90,.95)' : 'rgba(255,246,200,.95)', r: rand(1.5, 3.2) }); } P.vy = P.who === 'pom' ? G.vy : null;
  const skyF = seg.th.sky && P.hawk, skyK = skyF ? clamp((altitude(seg, G.s) - 2) / 14, 0, 1) : 0, fp = skyF ? segPos(seg, G.s - lerp(F.back, 0, skyK), /* [空 K7] 2026-11-21：横にならぶオオタカは、モチと同じか少し先に（カメラに近いと大きく高く写り、パソコンの横長の画面で上のはしで切れた） */ lerp(F.lat, G.lat + (G.lat > .5 ? -1.7 : 1.7) * (W < H ? .72 : 1), skyK)) : segPos(seg, G.s - F.back, F.lat); /* [空 K5] 2026-11-21：地面が近づいたら（高さ 16m から）、ユズはモチの横から、走る時のいつもの場所へ少しずつもどる（前は着地の直前、カメラが下がって近づくので、横にいたユズが画面の右のはしで切れた） */ /* [F8] 空の上：ユズはモチの横にならんで飛ぶ（うしろにいると、カメラがぐるっと回る時にモチと重なって見えなくなった） */ { const kF = G.turnT > 0 && F.wx != null && !skyF ? k : 1; F.wx = lerp(F.wx, fp[0], kF); F.wz = lerp(F.wz, fp[1], kF); } /* [曲がり角 K1] 曲がる間は、ユズもモチと同じように、なめらかに新しい道へ移る（急に横へとばない） */ if (skyF && skyK > 0) { const sv = skySide(seg), o = (G.lat > .5 ? -1.7 : 1.7) * (W < H ? .72 : 1); F.wx = lerp(fp[0], P.wx + sv[0] * o, skyK); F.wz = lerp(fp[1], P.wz + sv[1] * o, skyK); } /* [空 K8] 2026-11-21：ぐるっと見わたす間も、ユズのオオタカは画面の上でモチの横に（前は道の横に固定だったので、カメラが回ると、カメラのすぐ前に来て大きく写り、画面の上で切れた） */ F.wy = fp[2] + (F.y || 0) + (F.air ? 0 : Math.abs(Math.sin(F.ph)) * (F.who === 'pom' ? .012 : .06)); /* クリ（ハムスター）は足がほとんど地面についているので、体は上下しない */
  F.fly = P.fly; if (P.fly) { F.wy = G.ey + G.y - .3; }
  const strIn = !seg.first && seg.turnIn === 0 && !seg.prevFork; /* [F7] まっすぐつながった道（展望台 → 空 → 着地・エレベーター）：うしろの仲間は、つなぎ目の手前にいても見える（前は道の頭で消え、空へ飛び立つ時にユズが画面から消えた） */
  F.show = !F.off && (strIn || G.s - F.back > (seg.first ? -14 : seg.prevFork ? HW + .3 : -HW + .3)); /* 分かれ道（Y 字）の先は今までどおり */ /* [曲がり角 K1] 2026-11-23 オーナー「毎回曲がる瞬間に、一緒に走っているキャラクターが消える」：曲がった先の道の頭から 5m ほど（約 0.5 秒）、ユズを描いていなかった。曲がり角の四角は曲がった先の道の一部なので、角の中（道の頭より手前 4m まで）にいる時も描く */
  { const M = G.pom; if (M.on) { const mp = skyF ? segPos(seg, G.s + .2, G.lat + (G.lat > .5 ? 1.5 : -1.5) * (W < H ? .72 : 1)) /* [空 K6] 2026-11-21：たて長のスマホでは、横にならぶオオタカの間を 7 割にせまく（はしのオオタカが画面の右で切れた） */ /* [空 K2] 2026-11-20：クリのオオタカは、ユズと反対がわのモチの横に（前はモチのすぐうしろ・ユズと同じがわで、カメラから見るとモチの頭の上にクリのオオタカが重なった） */ : segPos(seg, G.s - M.back, M.lat); M.wx = mp[0]; M.wz = mp[1]; if (skyF) { const sv = skySide(seg), o = (G.lat > .5 ? 1.5 : -1.5) * (W < H ? .72 : 1); M.wx = P.wx + sv[0] * o; M.wz = P.wz + sv[1] * o; } M.wy = mp[2] + (M.y || 0) + (M.air ? 0 : Math.abs(Math.sin(M.ph)) * (M.who === 'pom' ? .012 : .05)); if (M.who === 'pom' && !M.air && !P.fly) M.lat += Math.sin(M.ph * .5) * .0035; /* ちょこまか：走りながら、ごく小さく左右にゆれる */ if (P.fly) M.wy = G.ey + G.y - .45; M.fly = P.fly; M.show = strIn || G.s - M.back > (seg.first ? -14 : HW + .3); } else M.show = false; }
  if (P.hawk && !(P.hawkRel > .2)) { const sw = k => .3 + Math.sin(G.t * 2.1 + k) * .07 * (1 + (P.hawkRel || 0) * 3); /* [D2] 着地の前は羽ばたきが強くなり、少し上下が大きい */ P.wy = G.ey + G.y + sw(0); F.wy = fp[2] + sw(1.3); if (G.pom.on) G.pom.wy += sw(2.1) - (G.pom.air ? 0 : Math.abs(Math.sin(G.pom.ph)) * .012); } // オオタカの羽ばたきで、ゆっくり上下
  const ty = seg.dir * Math.PI / 2 + skySpin(seg); let dy = ty - G.camYaw; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2;
  G.camYaw += dy * Math.min(1, dt * 9);
  { const want = H / W > 1.6 && !seg.th.toriiTunnel ? 1 : 0; G.camTall = G.camTall == null ? want : lerp(G.camTall, want, Math.min(1, dt * 2.5)); } // under the rows of small gates the higher camera looked straight into their beams (2026-11-14「鳥居のゾーンで前が見えない」): there it comes back down, smoothly
  { const pv = G.segs[G.ci - 1]; G.tkoK = seg.th.sky && G.mode === 'play' && pv && pv.th.climb ? sstep(clamp(G.s / 6, 0, 1)) * (1 - sstep(clamp((G.s - 8) / 20, 0, 1))) : 0; } /* [飛び立ち D3] 2026-11-23：飛び立つ 3 秒ほどは、カメラが少しうしろ・上へ下がる（足もとの展望台のへりと手すりが、画面の下で、だんだん遠ざかるのが見える。前は、1 コマで床が消えた） */
  const tk = G.camTall, dist = 3.9 + .3 * tk + 3.2 * G.tkoK, fx = Math.sin(G.camYaw), fz = Math.cos(G.camYaw); // tall phones: the camera sits a little higher and further back, so the road ahead shows above the runners' heads (2026-11-14; measured: 108 → 133 px of road above their heads; the first, higher try (153 px) looked down too steeply and ran into overhead gates, so it was eased)
  const sh = G.shake > 0 ? Math.sin(G.t * 60) * .09 * G.shake : 0, sway = seg.th.kind === 'train' && !OPT().calm ? Math.sin(G.t * 1.7) * .05 + Math.sin(G.t * .63 + 1) * .025 + (G.jolt || 0) * Math.sin(G.t * 38) * .35 : 0; /* [85] 2 つの周期の重なった横ゆれ ＋ 継ぎ目の小さなガタン */
  CAM.x = G.rx - fx * dist + Math.cos(G.camYaw) * (sh + sway); CAM.z = G.rz - fz * dist - Math.sin(G.camYaw) * (sh + sway);
  G.fovK = lerp(G.fovK || 0, (G.pow.dash > 0 || G.fever > 0 || G.pow.fly > 0) ? 1 : 0, Math.min(1, dt * 4)); G.skyK = lerp(G.skyK || 0, seg.th.sky && !(P.hawkRel > .3) ? 1 : 0, Math.min(1, dt * 1.5)); FOCAL = BASEF * (1 - .09 * G.fovK - .07 * G.skyK); /* [F10] 空へ飛び出すと、見える広さが少しずつ広がる（ひらけた感じ）。着地の前にもどる */
  /* [降りる時 D4] 階段（段と踊り場がくり返す道）では、カメラの高さを前後 3m の平均の高さに合わせる。前は段ごとの高さの変わり目でカメラが小きざみに上下し、画面の道全体がガクガク動いて見えた */
  const flt = seg.hp && seg.hp.shape === 'flights', eAt = flt ? (q => (segE(seg, q - 1.5) + segE(seg, q - .75) + segE(seg, q) + segE(seg, q + .75) + segE(seg, q + 1.5)) / 5) : (q => segE(seg, q));
  /* [空 K1] 2026-11-20 オーナー「スカイツリーから飛び立った時に、スマホでもウェブでもキャラクターが画面から消えて下の方に行ってしまう」：
     空の道は 451m を 220m でおりる急な坂なので、2.5m うしろの高さに合わせたカメラは、モチたちより 6m 以上も高く（さらにおくれて）、3 人が画面の下へ消えていた。
     空の上では、カメラの高さはモチたちの今の高さに合わせ、おくれもなくす */
  const skyCam = !!seg.th.sky, eC = skyCam ? eAt(G.s) : eAt(G.s - 2.5), ePc = flt ? eAt(G.s) : eP, slope = clamp((eAt(Math.min(seg.len, G.s + 14)) - ePc) / 14, -.3, .3);
  const camNew = G.camE == null;
  G.camE = G.camE == null || skyCam ? eC : lerp(G.camE, Math.max(eC, ePc - .4), Math.min(1, dt * 10)); G.camSl = lerp(G.camSl || 0, slope, Math.min(1, dt * 3));
  /* 2026-11-15（オーナーの報告：電車や室内で天井が低く見える・ジャンプすると天井から飛び出る）
     縦長のスマホはカメラが高い（2026-11-14 は 2.75m、11-16 からは 2.45m）ので、天井（2.9〜3m）のすぐ下をはうように見えていた。ジャンプするとカメラが天井をつきぬけた。
     天井のある場所では ①カメラの高さを「天井より CAM_CEIL_GAP 下」までにする ②ジャンプでカメラが上がる分は、天井の手前でなめらかに止める ③それでも天井より上には絶対に出さない */
  const ceilH = seg.ceilH || 0, camB = 2.1 + .35 * tk, camT = ceilH ? Math.min(camB, Math.max(2.1, ceilH - CAM_CEIL_GAP)) : camB;
  G.camH = camNew || G.camH == null ? camT : lerp(G.camH, camT, Math.min(1, dt * 5));
  let camUp = G.y * .6 + sh * .5; if (ceilH && camUp > 0) { const room = Math.max(.05, ceilH - CAM_CEIL_MIN - G.camH); camUp = room * (1 - Math.exp(-camUp / room)); }
  CAM.y = G.camE + G.camH + camUp + 1.3 * (G.tkoK || 0); if (ceilH) CAM.y = Math.min(CAM.y, G.camE + ceilH - CAM_CEIL_MIN + .08);
  CAM.yaw = G.camYaw; CAM.pitch = .19 + .04 * clamp((G.camH - 2.1) / .35, 0, 1) - G.camSl * (skyCam ? .22 : .55) + Math.min(.1, G.y * .03); if (skyCam && G.mode === 'play') { const pv = G.segs[G.ci - 1]; if (pv && pv.th.climb && G.s < 28) CAM.pitch += .11 * (G.tkoK || 0); } /* [飛び立ち D2] 2026-11-23：飛び立った直後は、少し下を見る（足もとの展望台の床と手すりが、下へ遠ざかっていくのが見える） */ /* [空 K4] 空の上は、カメラがモチたちと同じ高さなので、坂の分だけ下を向きすぎない（パソコンの横長の画面で、モチの頭が画面の上のはしに近づいた） */ { const lk = skyLookK(seg); if (lk > 0) CAM.pitch = lerp(CAM.pitch, W > H ? .09 : .07, lk); /* [空 K9] 2026-11-21：横長の画面で、見わたす間にモチのオオタカの羽が画面の上で切れた。下向きを少しへらす */ } /* [空 K3] 横長の画面（パソコン）は上下に見える広さがせまいので、上げすぎない（モチの頭が画面の上のはしに近づいた） */ /* [降りる時 S2] 回っている間は遠くの景色を見る（着地の道が画面を横切って流れて見えない） */
  camPrep();
  P.depth = (P.wx - CAM.x) * CAM.s + (P.wz - CAM.z) * CAM.c; F.depth = (F.wx - CAM.x) * CAM.s + (F.wz - CAM.z) * CAM.c;
  if (F.tuck) F.depth = P.depth + .3;
  if (G.pomPeek && G.pomPeek.seg === seg) peekStep(seg, dt, P);
  { const M = G.pom; if (M.on) { M.depth = (M.wx - CAM.x) * CAM.s + (M.wz - CAM.z) * CAM.c; if (M.tuck) M.depth = P.depth + .5; } }
}
/* クリのあいさつ（「先輩、お先っす！」）。2026-11-17 オーナー：「並走して走りながら言うように。いまは空中浮遊しながら物理的におかしく進んでる」。
   前の作り：クリは道の上の 1 点に止まったまま（走る絵なのに、こちらへすべって近づく）→ 急に自分と同じ速さで前に張りつき、ふり向いた止め絵のまま上下にふわふわ → 横へ消える。
   作り直し（番号は docs/POM-PEEK-2026-11-17.md）：歩道から走って出てきて、自分より少しおそい速さで前を走る（追いつく）→ となりの車線に入って並んで走る →
   走りながら肩ごしにふり向いて言う → 前を向き直し、ぐっと加速して歩道へぬける。足の動きはクリ自身の速さに合わせる */
function peekStep(seg, dt, P) {
  const k = G.pomPeek, B = k.b; G.peekSlow = 0;
  const laneFor = () => LANES[G.lane === 1 ? (G.follow.side > 0 ? 0 : 2) : G.lane === 0 ? 2 : 0]; // [9] 自分と相棒のいない車線
  const side = -k.dir * (HW + .5), AHEAD = 1.3; // [1] 歩道（道のはし）から出てくる [10] 自分の少し前（ななめ前）に並ぶ
  if (!k.ph && G.s > k.s - 34 && G.turnT <= 0) { k.ph = 'in'; k.ps = G.s + 15; k.lat = side; k.v = G.speed * .55; k.vl = 0; k.hy = 0; k.hv = 0; k.stop = laneFor(); k.t = 0; k.dust = 0; B.ph = Math.random() * 6;
    bannerNow(SV.pomMet ? (tr('あっ、クリ！', 'KURI!')) : (tr('！？', '!?')), t(SV.pomMet ? 'pomPeek2' : 'pomPeek'), 'room'); tone(784, .08, 'pluck', .045); tone(1047, .12, 'bell', .04, AU.ctx && AU.ctx.currentTime + .09); }
  if (!k.ph || k.ph === 'gone') { B.show = false; return; }
  const gs = G.speed || 0; let want;
  if (k.ph === 'in' || k.ph === 'side') { k.stop = lerp(k.stop, laneFor(), Math.min(1, dt * 2.5)); /* [11] 自分が車線を変えたら、クリも横へよける */
    want = gs + clamp((G.s + AHEAD - k.ps) * 2.6, -gs * .45, 5); } /* [2] はじめは自分よりおそく（追いつく） [3] 近づくと速さをそろえる（ばねのように、ゆっくり） */
  else want = gs + 4 + k.t * 9; /* [20] 走りぬける時は、ぐっと加速 */
  const acc = k.ph === 'out' ? 16 : 11; k.v += clamp(want - k.v, -acc * dt, acc * dt); k.v = Math.max(0, k.v); k.ps += k.v * dt; /* [4] 速さは急に変わらない（加速の上限） */
  // 横の動き：走りながらななめに車線へ入る（横へすべらない。前へ進む速さがある時だけ横へ動ける）
  const tl = k.ph === 'out' ? side * 1.15 : k.lat === side && k.v < gs * .5 ? side : k.stop; /* [5] 前へ走り出してから、車線へ入る */
  const vlMax = Math.min(k.ph === 'out' ? 1.5 : 3.2, k.v * .22); /* [6] 横へ動く速さは、前へ進む速さの 2 割まで（ななめに走る） */
  k.vl += clamp(clamp((tl - k.lat) * 3, -vlMax, vlMax) - k.vl, -9 * dt, 9 * dt); k.lat += k.vl * dt; /* [7] 横の動きも、なめらかに始まり・止まる */
  // 段差・低い物はぴょんと越える。高い物が来たら、先に歩道へぬける
  if (k.ph !== 'out') { const o = seg.obs.find(o => !o.dead && o.k !== 'deco' && o.s0 > k.ps && o.s0 < k.ps + 2.4 && o.l0 < k.lat + .35 && o.l1 > k.lat - .35);
    if (o && (o.y1 || 0) > .7) { k.ph = 'out'; k.t = 0; } else if (o && k.hy <= 0) k.hv = 3.2; } /* [12] 低い物は小さく跳ぶ [13] 高い物の前では、ぶつからずに走りぬけて退場 */
  if (k.hv || k.hy > 0) { k.hv -= 14 * dt; k.hy = Math.max(0, k.hy + k.hv * dt); if (k.hy <= 0 && k.hv < 0) { k.hv = 0; k.land = .12; } }
  if (k.land) k.land = Math.max(0, k.land - dt);
  if (k.ph === 'in' && Math.abs(k.ps - (G.s + AHEAD)) < .9 && Math.abs(k.lat - k.stop) < .2) { k.ph = 'side'; k.t = 0; } /* [8] 並んでから、ふり向く */
  if (k.ph === 'side') { k.t += dt; if (k.t > 2.25) { k.ph = 'out'; k.t = 0; k.dust = 1; } }
  else if (k.ph === 'out') { k.t += dt; if (k.ps - G.s > 34 || (Math.abs(k.lat) > HW + .9 && k.ps - G.s > 18)) k.ph = 'gone'; /* [24] すぐ横で消えない：十分に遠くへ走ってから */ }
  if (k.ph !== 'out' && k.ps > seg.len - 16) { k.ph = 'out'; k.t = 0; } /* [14] 道の終わり（曲がり角）の手前で、先に退場 */
  if (k.ph === 'gone' || k.ps > seg.len - 3) { k.ph = 'gone'; B.show = false; return; }
  // 体：足の動きは、クリ自身の速さに合わせる。上下のふわふわはやめる（体の上下は絵の中の足の動きだけ）
  B.ph += dt * (10 + k.v * .75); /* [15] 足の回転＝クリの速さ（止まり気味なら足もゆっくり） [16] 前の「上下にふわふわ」をやめた */
  const lookOn = k.ph === 'side' && k.t > .25 && k.t < 2.05; /* [17] 並んで少したってから、ふり向く [18] 言い終わってから、前を向き直す */
  B.look = 0; B.runLook = lookOn ? 1 : 0; B.mood = k.t < 1.2 ? 'sparkle' : 'open';
  B.say = lookOn && k.t > .35 ? (SV.pomMet ? t('pomPeekSay') : '？') : ''; B.sayA = lookOn ? Math.min(1, (k.t - .35) * 5, (2.05 - k.t) * 5) : 0; /* [19] ふきだしは、ふり向いてから出て、前を向く前に消える */
  B.tilt = clamp(k.vl * .045, -.12, .12); /* [21] 横へ動く時は、そちらへ体をかたむける */
  B.lean = k.ph === 'out' ? Math.min(1, k.t * 3) : 0; B.big = 1.45; B.hop = k.hy; B.land = k.land || 0; B.speedK = clamp((k.v - gs) / 6, 0, 1);
  const mp = segPos(seg, k.ps, k.lat); B.wx = mp[0]; B.wz = mp[1]; B.wy = mp[2] + k.hy; /* [22] 体は地面の上（足が地面に着く）。跳ぶ時だけ上へ */
  B.depth = (mp[0] - CAM.x) * CAM.s + (mp[1] - CAM.z) * CAM.c; B.show = true;
  if (k.dust) { k.dust = 0; const sp = spriteAt(mp[0], mp[2], mp[1]); if (sp && !OPT().calm) { burst(sp.sx, sp.sy - 4, '#D8C8A6', 7); tone(523, .05, 'pluck', .03); } } /* [23] けり出しの一瞬、足もとに土ぼこりと小さな足音 */
}

/* 電車の中のうごき（2026-11-17）：[83] レールの継ぎ目（25m ごと）を、電車の速さで通る。[84] 通るたびに車体が小さくガタン（カメラ）
   [93] つり革は車体のゆれにおくれて横にゆれ、速さが変わると前後にふれる [95] 立っている人も、ゆれに合わせて少し体がゆれる */
function trainTick(sg, dt) {
  G.jointD = (G.jointD || 0) + G.speed * dt; if (G.jointD > 25) { G.jointD -= 25; G.jolt = .045; G.joltN = (G.joltN || 0) + 1; }
  G.jolt = Math.max(0, (G.jolt || 0) - dt * .3);
  const acc = (G.speed - (G.tSpd0 == null ? G.speed : G.tSpd0)) / Math.max(dt, .001); G.tSpd0 = G.speed; G.tAcc = lerp(G.tAcc || 0, clamp(acc, -6, 6), Math.min(1, dt * 3));
  if (OPT().calm) return; const sw = Math.sin(G.t * 1.7 - .7) * .05 + (G.jolt || 0) * Math.sin(G.t * 30) * .6, fw = -(G.tAcc || 0) * .012;
  for (const q of sg.spr) { if (q.img !== 'strap' && q.img !== 'strapP' && !q.rider) continue; if (q.s0 == null) { q.s0 = q.s; q.l0 = q.lat; }
    const k = q.rider ? .35 : 1; q.lat = q.l0 - sw * k; q.s = q.s0 + fw * k + (q.rider ? 0 : Math.sin(G.t * 2.3 + q.s0) * .006); }
}
/* ---------- safety net ----------
   Whatever goes wrong in a frame (a street that could not be built, a picture the phone had no memory for, a number gone bad),
   a run must never freeze. Every frame of play is checked: the runner must be on a street that exists, with sane numbers, and
   moving. If not, the runner is put back on the street (with a moment of invincibility, like a revive); if that does not help
   (it keeps happening), the run ends with the normal result screen. Screens are checked too: a dead run always shows the
   revive or the result screen, and a countdown always ends. */
const GUARD = { errN: 0, stillT: 0, s: 0, segId: -1, fixes: 0, fixT: -1e9, mode: '', modeT: 0 };
function runOK() {
  const seg = curSeg(); if (!seg || !seg.f || !(seg.len > 0)) return 'noseg';
  for (const v of [G.s, G.lat, G.y, G.vy, G.speed, G.dist, G.score, G.rx, G.rz, G.camYaw, CAM.x, CAM.y, CAM.z, CAM.yaw, CAM.pitch]) if (!Number.isFinite(v)) return 'nan';
  if (Math.abs(G.lat) > HW + .5 || G.s < -HW - 2 || G.s > seg.len + HW + 2) return 'offtrack';
  if (G.y < -3 || G.y > 40) return 'height';
  if (G.turnT <= 0) { const p = segPos(seg, G.s, G.lat); if (Math.hypot(p[0] - G.rx, p[1] - G.rz) > 4) return 'drift'; } // the picture follows the runner (it stops following when the frame breaks off)
  return '';
}
function runGuard(rdt, err) {
  if (GUARD.mode !== G.mode) { GUARD.mode = G.mode; GUARD.modeT = 0; } else GUARD.modeT += rdt;
  if (G.mode === 'play') {
    GUARD.errN = err ? GUARD.errN + 1 : 0;
    const seg = curSeg(), id = seg ? seg.id : -1;
    if (id !== GUARD.segId || Math.abs(G.s - GUARD.s) > .01 || G.hitStop > 0) { GUARD.stillT = 0; GUARD.segId = id; GUARD.s = G.s; } else GUARD.stillT += rdt;
    const why = GUARD.errN >= 20 ? 'errors' : GUARD.stillT > 2.5 ? 'still' : runOK();
    if (why) rescueRun(why);
    return;
  }
  GUARD.errN = 0; GUARD.stillT = 0; GUARD.segId = -1;
  const hid = id => { const e = document.getElementById(id); return !e || e.hidden; };
  if (G.mode === 'dying' && GUARD.modeT > 3) { G.dyingT = 0; G.mode = 'dead'; GUARD.modeT = 0; try { if (canRevive()) openRevive(); else endRun(); } catch (e) { reportErr(e); finishRun('dying'); } }
  else if (G.mode === 'dead' && GUARD.modeT > 1.5 && hid('sRevive') && hid('sResult') && hid('sPanel')) { GUARD.modeT = 0; try { if (G.cause !== 'quit' && canRevive()) openRevive(); else endRun(); } catch (e) { reportErr(e); finishRun('dead'); } } // ふつうの続ける／結果の画面を出す（「一区切り」にしない）
  else if (G.mode === 'result' && GUARD.modeT > 1.5 && hid('sResult') && hid('sPanel')) { try { hideAll(); show('sResult'); } catch (e) { goTitle(); } }
  else if (G.mode === 'countdown' && GUARD.modeT > 4) { G.mode = 'play'; G.invT = Math.max(G.invT, 1); const c = document.getElementById('tutCue'); if (c) c.className = ''; }
}
function rescueRun(why) {
  GUARD.errN = 0; GUARD.stillT = 0; G.stats.rescues = (G.stats.rescues || 0) + 1; window.__rescue = (window.__rescue || 0) + 1; window.__rescueWhy = why;
  GUARD.fixes = G.t - GUARD.fixT < 15 ? GUARD.fixes + 1 : 1; GUARD.fixT = G.t;
  errLog('rescue: ' + why + ' @' + ((curSeg() || {}).tid || '?') + ' ' + Math.round(G.clock || 0)); // なぜ止まったかを端末の記録に（設定の「エラーの記録」で見られる）
  if (GUARD.fixes <= 2) { try { if (snapBack()) return; } catch (e) { reportErr(e); } }
  try { if (newStreet()) return; } catch (e) { reportErr(e); } // 2026-11-10 の報告「長く遊ぶと強制的に早退」：直せないときも終わらせず、新しい道を作ってそこから続ける
  if (!(G.freshN >= 1 && G.t - (G.freshT || -1e9) < 20)) { try { if (freshRoad()) { G.freshN = G.t - (G.freshT || -1e9) < 20 ? (G.freshN || 0) + 1 : 1; G.freshT = G.t; return; } } catch (e) { reportErr(e); } } // それでも同じことがすぐに続く（ゲームの中の故障）ときだけ、ふつうに終わる // 2026-11-14「途中で終わって記録は保存される、は意味不明。起きないようにして」：今の場所がだめでも、別の道から同じ時刻で続ける
  finishRun(why); // それでもだめなら、ふつうに終わる（点数・チモシー・ミッションは残る）
}
// put the runner back on the street they are on, in a lane, on the ground, with the camera right behind them
function snapBack() {
  if (!curSeg()) G.ci = Math.max(0, Math.min(G.ci | 0, G.segs.length - 1));
  const seg = curSeg(); if (!seg || !seg.f || !(seg.len > 0)) return false;
  if (!seg.fork && !G.segs[G.ci + 1]) ensureSegs(1);
  if (!Number.isFinite(G.s)) G.s = 0;
  G.s = clamp(G.s, 0, Math.max(0, seg.len - 8));
  if (!seg.fork && !G.segs[G.ci + 1] && seg.len - G.s < 30) return false; // a corner with nothing after it: no way on
  for (const k of ['speed', 'dist', 'score', 'hay']) if (!Number.isFinite(G[k])) G[k] = k === 'speed' ? 12 : 0;
  G.speed = clamp(G.speed, 8, MAXSPD * 1.6);
  G.lane = clamp(Number.isFinite(G.lat) ? Math.round(G.lat / LANE) + 1 : 1, 0, 2); G.lat = LANES[G.lane]; G.prevLane = G.lane;
  G.y = 0; G.vy = 0; G.air = false; G.slideT = 0; G.vault = 0; G.vaultDown = 0; G.jumpBuf = 0; G.pow.fly = 0;
  G.turnQueued = 0; G.turnAuto = 0; G.turnQT = 0; G.turnT = 0; G.hitStop = 0; G.shake = 0;
  for (const B of [G.follow, G.pom]) { B.y = 0; B.vy = 0; B.air = false; if (!Number.isFinite(B.lat)) B.lat = 0; if (!Number.isFinite(B.back)) B.back = 1; }
  const p = segPos(seg, G.s, G.lat); G.rx = p[0]; G.rz = p[1]; G.camYaw = seg.dir * Math.PI / 2; G.ey = G.camE = null; G.camSl = 0;
  G.invT = Math.max(G.invT, 2.5);
  for (const o of seg.obs) if (o.s1 > G.s - 2 && o.s0 < G.s + 30) o.dead = .001;
  { const fc = document.getElementById('forkCards'); if (fc) fc.hidden = true; const cue = document.getElementById('turnCue'); if (cue) cue.className = ''; }
  placeCamera(.016);
  if (runOK()) return false;
  banner('KEEP GOING!', t('keepGoing'), 'good');
  return true;
}
/* 今の道が直せないとき：同じ場所の新しい道を作り、その上から走り続ける（予定の続きはそのまま）。だめなら false */
function newStreet() {
  const old = curSeg(); const tid = old && old.tid; if (!tid || !THEMES[tid]) return false;
  const s0 = newSeg(null, { t: tid, d: 30 }, { t0: G.clock || 600, day: G.day || 1 }); if (!s0 || !(s0.len > 0)) return false;
  G.segs = [s0]; G.ci = 0; G.s = 0; G.lane = 1; G.lat = 0; G.fork = null; G.forkRest = null; G.planClock = s0.t1; ensureSegs();
  if (!G.segs[1] && !s0.fork) return false;
  const p = segPos(s0, 0, 0); G.rx = p[0]; G.rz = p[1]; G.camYaw = s0.dir * Math.PI / 2; G.ey = G.camE = null; G.camSl = 0;
  G.y = 0; G.vy = 0; G.air = false; G.slideT = 0; G.turnQueued = 0; G.turnAuto = 0; G.turnT = 0; G.invT = Math.max(G.invT, 3);
  try { onEnterSeg(s0); } catch (e) { reportErr(e); }
  placeCamera(.016); if (runOK()) return false; GUARD.fixes = 0; G.stats.newStreet = (G.stats.newStreet || 0) + 1; window.__newStreet = (window.__newStreet || 0) + 1;
  banner('KEEP GOING!', t('keepGoing'), 'good'); return true;
}
/* 最後の手：今の道も同じ場所の新しい道も作れないとき、ほかの場所の道を作って、同じ日・同じ時刻から続ける（点数・チモシーはそのまま） */
function freshRoad() {
  const day = G.day || 1, clock = Number.isFinite(G.clock) ? G.clock : 600, cur = (curSeg() || {}).tid;
  for (const tid of [cur, 'ginza', 'yamanote', 'shibuya', 'desk'].filter((x, i, a) => x && THEMES[x] && a.indexOf(x) === i)) {
    try {
      const s0 = newSeg(null, { t: tid, d: 30 }, { t0: clock, day }); if (!s0 || !(s0.len > 0)) continue;
      G.segs = [s0]; G.ci = 0; G.s = 0; G.lane = 1; G.lat = 0; G.fork = null; G.forkRest = null; G.planDay = day; G.planClock = s0.t1;
      { let c = 480; G.plan = dayPlan(day).filter(x => { if (x.fork) return false; c += (+x.d || 30); return c > clock; }); } if (!G.plan.length) G.plan = [{ t: tid, d: 30 }, { t: tid, d: 30 }]; // the rest of today's places (not this morning's again)
      ensureSegs(); if (!G.segs[1] && !s0.fork) continue;
      const p = segPos(s0, 0, 0); G.rx = p[0]; G.rz = p[1]; G.camYaw = s0.dir * Math.PI / 2; G.ey = G.camE = null; G.camSl = 0;
      G.y = 0; G.vy = 0; G.air = false; G.slideT = 0; G.turnQueued = 0; G.turnAuto = 0; G.turnT = 0; G.invT = Math.max(G.invT, 3);
      try { onEnterSeg(s0); } catch (e) { reportErr(e); }
      placeCamera(.016); if (runOK()) continue;
      GUARD.fixes = 0; G.stats.freshRoad = (G.stats.freshRoad || 0) + 1; window.__freshRoad = (window.__freshRoad || 0) + 1; errLog('fresh road: ' + tid);
      banner('KEEP GOING!', t('keepGoing'), 'good'); return true;
    } catch (e) { reportErr(e); }
  }
  return false;
}
function finishRun(why) {
  window.__finish = (window.__finish || 0) + 1; window.__finishWhy = why;
  if (!curSeg()) G.ci = Math.max(0, G.segs.length - 1);
  G.cause = 'rescue'; G.mode = 'dead'; errLog('finish: ' + why); // 安全網で終わったときは「早退しました」と言わない
  try { hideAll(); if (!curSeg()) throw new Error('no street'); endRun(); } catch (e) { reportErr(e); try { goTitle(); } catch (e2) { } }
}
// the other bunny runs beside you and dodges on its own; Kuri trots along behind, on the other side
function buddy(dt, seg) {
  const F = G.follow;
  if (G.lane === 0) F.side = 1; else if (G.lane === 2) F.side = -1;
  buddyMove(F, dt, seg, clamp(G.lat + F.side * (W / H < .62 ? 1.02 : 1.25), -ROAD + .45, ROAD - .45), G.char === 'pom' ? -.35 : F.who === 'ren' ? .1 : .9); /* ユズで走るとき、大きいモチ課長がカメラの近くで右の道をふさいでいた → 横にならんで走る */ // with Kuri running, the senpai leads half a step ahead (and stays out of the way of the camera)
  const M = G.pom; if (M.on) { buddyMove(M, dt, seg, clamp(G.lat - F.side * 1.2, -ROAD + .35, ROAD - .35), M.who === 'pom' ? .25 : -.15); if (M.look > 0) M.look = Math.max(0, M.look - dt); if (M.look <= 0) M.say = ''; }
}
function buddyMove(F, dt, seg, tlat0, back0) {
  let tlat = tlat0, tback = back0, tuck = false;
  const fs = G.s - F.back;
  if (!G.pow.fly) for (const o of seg.obs) {
    if (o.dead || o.k === 'deco') continue;
    const a = o.s0 + (o.ds || 0) - fs; if (a < -.6 || a > 3.4) continue;
    if (tlat + .3 > o.l0 && tlat - .3 < o.l1) {
      if (o.k === 'block' && !o.full) tuck = true;
      else if (o.k === 'low' && a < (o.car ? 5 : 1.7) && !F.air) { F.vy = o.car ? vaultV(o.vault || 1.6) : JUMPV; F.vault = !!o.car; F.air = true; }
      else if (o.k === 'high' && a < 1.9) F.slideT = .6;
    }
  }
  if (tuck) { tlat = G.lat; tback = back0 < .5 ? -.6 : .35; }
  F.lat += clamp(tlat - F.lat, -dt * 9, dt * 9);
  F.back = lerp(F.back, tback, 1 - Math.exp(-dt * 8));
  F.tuck = tuck && Math.abs(F.lat - G.lat) < .6;
  if (F.air) { F.vy -= GRAV * dt * (F.vy < 0 ? 1.25 : 1) * (F.vault ? VAULT_G : 1); F.y += F.vy * dt; if (F.y <= 0) { F.y = 0; F.vy = 0; F.air = false; } }
  if (F.slideT > 0) F.slideT -= dt;
  F.slide = F.slideT > 0 && !F.air;
  F.ph += dt * (F.who === 'pom' ? 10 + G.speed * .75 : 6.4 + G.speed * .55);
}
function collect(it, seg) {
  it.got = 1; const def = ITEMS[it.type]; const mult = SV.mlevel * (G.legend ? 1.5 : 1) * (G.pow.x2 > 0 ? 2 : 1) * (G.fever > 0 ? 2 : 1) * (pomOn() ? 1.2 : 1);
  const sp = spriteAt(G.player.wx, G.player.wy + .6, G.player.wz); const sx = sp ? sp.sx : W / 2, sy = sp ? sp.sy : H * .6;
  if (def.kind === 'stamp') {
    const tid = seg.tid, isNew = !SV.stamps[tid]; SV.stamps[tid] = (SV.stamps[tid] || 0) + 1; if (isNew) { if (!SV.stampT || typeof SV.stampT !== 'object') SV.stampT = {}; SV.stampT[tid] = Date.now(); } /* [ラリー 19] はじめて行った日を残す（スタンプ帳の札に出す） */ save();
    G.score += def.pts * mult; SFX.mission(); burst(sx, sy, '#C8463C', 24); buzz(30); G.hitStop = .08; if (isNew) G.stats.stampsNew.push(tid); G.stats.stampsGot = (G.stats.stampsGot || 0) + 1;
    banner('STAMP!', LANG === 'en' ? `${t('stampGet')} ${L(THEMES[tid].stamp)}` : `${t('stampGet')}「${L(THEMES[tid].stamp)}」`, 'good'); react('sparkle', 1); if (Math.random() < .5) pomSay(t('pomStamp'), 'sparkle', 1.2); return;
  }
  if (def.kind === 'pom') { pomJoin(); return; }
  if (def.kind === 'flag') { burst(sx, sy, '#F2C230', 14); burst(sx, sy, '#E86A75', 8); tone(784, .1, 'bell', .04); return; } // 挑戦状の旗：通りぬけるとお祝いの紙ふぶき（点は旗の点数をこえたときに chalTick で）
  if (def.kind === 'memo') { // dropped papers (B-24): the partner turns round to say thanks
    const pts = def.pts * mult; G.score += pts; G.stats.memos = (G.stats.memos || 0) + 1; floatText(sx, sy - 10, '+' + fmt(pts), '#F6EBDC'); burst(sx, sy, '#FFFDF7', 8);
    tone(659, .08, 'bell', .045); tone(988, .12, 'bell', .04, AU.ctx && AU.ctx.currentTime + .07);
    const F = G.follow; if (F.show) { F.look = 1.3; F.mood = 'happy'; F.say = F.who === 'jill' ? t('memoJill') : F.who === 'pom' ? t('memoPom') : t('memoRen'); }
    return;
  }
  // golden hay is a hay, but it has its own page in the food book (it used to never be recorded, so the book could never be completed)
  if ((def.kind !== 'hay' || it.type === 'goldhay') && !SV.zukan[it.type]) { SV.zukan[it.type] = 1; save(); if (def.kind !== 'bad') floatText(W / 2, cheerY(.42), t('newBook', L(def)), '#F2C230'); }
  if (it.type === 'hay' && !SV.zukan.hay) { SV.zukan.hay = 1; save(); }
  if (def.kind === 'bad') {
    SFX.bad(); G.stats.bads.push(it.type); G.feverG = Math.max(0, G.feverG - 25);
    bannerNow('NO ' + def.en.toUpperCase() + '!', t('noFood', L(def)), 'bad'); floatText(sx, sy, '×', '#C8463C');
    if (G.invT <= 0 && G.pow.dash <= 0 && G.fever <= 0) stumble();
    feelSick();
    return;
  }
  G.combo++; G.comboT = 1.3; comboPop(); G.stats.maxCombo = Math.max(G.stats.maxCombo || 0, G.combo);
  if ([25, 50, 100, 200, 300, 500].includes(G.combo)) { banner(G.combo + ' COMBO!', tr(pick(['その調子！', 'すごい、止まらない！', 'いい流れです！']), pick(['Keep it going!', 'Unstoppable!', 'What a streak!'])), 'good'); burst(W / 2, H * .35, '#F2C230', 26); burst(W / 2, H * .35, '#E86A75', 12); react('sparkle', 1); tone(659, .12, 'bell', .05); tone(988, .18, 'bell', .04, AU.ctx && AU.ctx.currentTime + .1); }
  if (it.line && (def.kind === 'hay' || def.kind === 'veg' || def.kind === 'food')) { const ln = seg.items.filter(x => x.line === it.line); if (ln.length >= 8 && ln.every(x => x.got === 1)) { const pts = 15 * ln.length * SV.mlevel; G.score += pts; G.stats.perfect = (G.stats.perfect || 0) + 1; floatText(W / 2, cheerY(.42), lab('PERFECT LINE!') + ' +' + fmt(pts), '#F2C230'); tone(523, .1, 'bell', .05); tone(659, .1, 'bell', .05, AU.ctx && AU.ctx.currentTime + .07); tone(784, .16, 'bell', .05, AU.ctx && AU.ctx.currentTime + .14); } }
  if (G.combo > 0 && G.combo % 30 === 0) react(pick(['happy', 'sparkle', 'wink']), 0);
  if (pomOn() && G.combo > 0 && G.combo % 50 === 0) pomSay(pick([t('pomNice'), t('pomNice2')]), 'happy', 1.2);
  G.stats.foods[it.type] = (G.stats.foods[it.type] || 0) + 1;
  { const p = (def.pts + (G.fever > 0 ? 0 : Math.min(G.combo, 20) * 1.5)) * (G.fever > 0 ? mult * .75 : mult); G.score += p; G.stats.ptC = (G.stats.ptC || 0) + p; }
  if (def.kind === 'hay' && (pomOn() || G.char === 'pom')) pomPouch(def.gold ? 5 : 1);
  if (def.kind === 'hay' && G.air && G.pow.fly <= 0) { G.airN = (G.airN || 0) + 1; if (G.airN === 5) { const pts = 120 * SV.mlevel; G.score += pts; G.stats.airCatch = (G.stats.airCatch || 0) + 1; floatText(W / 2, cheerY(.38), lab('AIR CATCH!') + ' +' + fmt(pts), '#9BD3F0'); tone(659, .1, 'bell', .045); tone(880, .14, 'bell', .04, AU.ctx && AU.ctx.currentTime + .08); } } // five hay in one jump (2026-11-08)
  if (def.kind === 'hay') { G.hay += def.gold ? 30 : 1; G.stats.hay += def.gold ? 30 : 1; if (G.gig && G.gig.k === 'rain') { G.hay += def.gold ? 30 : 1; G.stats.hay += def.gold ? 30 : 1; } G.feverG += (def.gold ? 25 : .55) * feverK(); SFX.hay(G.combo % 13); burst(sx, sy, def.gold ? '#F2C230' : '#9BB85A', def.gold ? 16 : 3); leaves(sx, sy, def.gold ? 6 : 3); if (!def.gold) FX.push({ x: sx, y: sy, vx: 0, vy: -40, life: .18, t: 0, c: 'rgba(255,255,230,.9)', r: 7 }); /* a soft glint on every hay */ if (def.gold) { floatText(sx, sy - 20, '+30', '#F2C230'); react('sparkle', 0); } }
  else if (def.kind === 'food') { G.feverG += 3 * feverK(); SFX.food(); if (G.stats.foods[it.type] === 1) floatText(sx, sy, L(def), '#F6EBDC'); }
  else if (def.kind === 'veg') { G.feverG += 5 * feverK(); G.stats.veg++; SFX.food(); if (G.stats.foods[it.type] === 1) floatText(sx, sy, L(def), '#B8D98A'); burst(sx, sy, '#5F9E5A', 6); }
  else if (def.kind === 'treat') { G.feverG += 9 * feverK(); G.stats.treats++; SFX.treat(); floatText(sx, sy, L(def) + '!', '#F2C230'); burst(sx, sy, '#E2434B', 10); if (Math.random() < .4) react('happy', 0); }
  else if (def.kind === 'power') {
    G.stats.powers++; SFX.power(); burst(sx, sy, '#F2C230', 14);
    if (def.pow === 'shield') { G.shield = 1; SV.clovers++; save(); banner('LUCKY!', t('lucky'), 'good'); }
    else { G.pow[def.pow] = powDur(def.pow); banner(def.en.toUpperCase(), L(POW[def.pow]), 'good'); if (def.pow === 'fly') startFly(); }
  }
  G.gainT = .15;
  if (G.feverG >= 100 && G.fever <= 0) startFever();
}

/* ---------- HUD ---------- */
const HUDC = {};
const EL = {}; const el = id => EL[id] || (EL[id] = document.getElementById(id));
function setCls(id, c, on) { const k = id + '.' + c; on = !!on; if (HUDC[k] !== on) { HUDC[k] = on; const e = el(id); if (e) e.classList.toggle(c, on); } }
function setStyle(id, prop, v) { const k = id + '#' + prop; if (HUDC[k] !== v) { HUDC[k] = v; const e = el(id); if (e) e.style[prop] = v; } }
/* [軽く 3-21] 数字が変わった時は、字の部品を作り直さず、中の字だけを書きかえる（毎コマ変わるスコアで、毎コマ新しい部品ができていた） */
const HUDE = {}; let POWK = null;
function setText(id, v) { if (HUDC[id] !== v) { HUDC[id] = v; let e = HUDE[id]; if (!e || !e.isConnected) e = HUDE[id] = document.getElementById(id); if (e) { const f = e.firstChild; if (f && f.nodeType === 3 && !f.nextSibling && v !== '') f.nodeValue = v; else e.textContent = v; } } }
// the score box shares the top row with the clock and the hay: when the number gets long (7 digits and up) or the place name is long, its digits shrink to fit
let FIT = { k: '', n: 0 };
/* 結果画面の大きな点数：桁が増えても枠に入るよう、文字を小さくする（8桁で下2桁がはみ出していた。2026-11-09 の報告。qa/resfit） */
function fitResScore(e) { if (!e) return; const box = e.parentElement; if (!box) return; const n = e.textContent.length; if (e.dataset.n == n) return; e.dataset.n = n; e.style.fontSize = '';
  const avail = box.clientWidth - 8, w = e.scrollWidth; if (w > avail && w > 0) e.style.fontSize = (parseFloat(getComputedStyle(e).fontSize) * avail / w * .98).toFixed(1) + 'px'; }
function fitScore() {
  const sc = el('hScore'), hy = el('hHay'), top = sc && sc.closest('.hud-top'); if (!top || !hy) return;
  const ck = el('hClock'), lk = sc.textContent.length + '|' + hy.textContent.length + '|' + (ck ? ck.textContent.length : 0) + '|' + innerWidth + 'x' + innerHeight; if (FIT.k && lk === FIT.lk) return; FIT.lk = lk; /* [軽く 3-20] 字の数・画面の大きさが変わった時だけはかり直す（前は 12 コマごとに画面の並びを読み、書いた直後の並べ直しを毎回起こしていた） */ // a new digit refits at once (no frame where the boxes overlap); the rest is checked every 12 frames
  const clock = top.querySelector('.clock'), k = sc.textContent.length + '|' + hy.textContent.length + '|' + clock.offsetWidth + '|' + top.clientWidth; if (k === FIT.k) return; FIT.k = k;
  const gap = parseFloat(getComputedStyle(top).columnGap) || 8, half = (top.clientWidth - clock.offsetWidth) / 2 - gap;
  for (const [e, pad] of [[sc, 22], [hy, 22 + 32]]) { e.style.fontSize = ''; const base = parseFloat(getComputedStyle(e).fontSize), avail = half - pad; if (e.scrollWidth > avail) e.style.fontSize = Math.max(10, Math.floor(base * avail / e.scrollWidth)) + 'px'; }
}
function comboPop() { const e = el('combo'); if (!e || G.combo < 5) return; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); } // the combo count bounces on every pickup
function hud() {
  lastTrainTick(); bossHud(); layoutHud();
  gigHud(); chalTick(); setText('hChal', CHAL && !G.chalWon ? t('chalHud', fmt(CHAL.s)) : '');
  setText('hScore', fmt(G.score)); fitScore(); setText('hHay', String(Math.floor(G.hay))); { const hn = Math.floor(G.hay); if (hn !== HUDC.hayN) { const up = hn > (HUDC.hayN || 0); HUDC.hayN = hn; const e = el('hHay'); if (up && e && !OPT().calm) { e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); } } } // the hay count hops a little when it goes up (2026-11-08)
  { const mu = SV.mlevel * (G.pow.x2 > 0 ? 2 : 1) * (G.fever > 0 ? 2 : 1); setText('hMult', mu > 1 ? '×' + mu : ''); } /* [B31] 倍率が ×1 の時は出さない（いつも見える「×1」は情報がふえるだけだった） */
  setText('hClock', clockStr(G.clock)); setText('hDay', t('dayN', G.day));
  { const sg = curSeg(); const tail = sg.th.climb ? ` ${altitude(sg, G.s)}m` : '', key = sg.id + '|' + L(sg.th) + '|' + LANG + '|' + tail + '|' + innerWidth /* 同じ場所でも季節で名前が変わる（道ごとに見る） */, e = el('hRoom'); if (e && e.offsetParent && HUDC.roomK !== key) { HUDC.roomK = key; roomFit(e, sg.th, tail); } }
  { const danger = (G.chaseT > 0 && !G.chaseIntro) || G.rush; if (danger) G.bumped = 1; setCls('lives', 'hide', !G.bumped && !G.rush); setCls('lives', 'warn', danger); setCls('lives', 'one', danger);
    setText('livesTxt', G.rush ? t('livesRush') : danger ? t('livesWarn', Math.ceil(G.chaseT)) : ''); }
  const pct = clamp(G.feverG, 0, 100);
  setStyle('feverFill', 'width', Math.round((G.fever > 0 ? G.fever / (G.feverMax || 6) * 100 : pct) * 2) / 2 + '%');
  setCls('feverBar', 'on', G.fever > 0); setCls('feverBar', 'soon', G.fever <= 0 && pct >= 80);
  setCls('feverBar', 'gain', G.fever <= 0 && G.gainT > 0 && pct < 80);
  setCls('feverGlow', 'on', G.fever > 0);
  setText('feverLbl', G.fever > 0 ? (tr('もぐもぐフィーバー中！', 'FEVER!')) : (SV.runs || 0) <= 3 ? t('gauge') : ''); /* ゲージの名前は、はじめの 3 回だけ（そのあとは棒と % だけ） */
  setText('feverPct', G.fever > 0 ? G.fever.toFixed(1) + 's' : Math.floor(pct) + '%');
  if (pct >= 15 && !G.gaugeTold && SV.runs <= 3) { G.gaugeTold = 1; banner('', t('gaugeHint'), ''); }
  if (!G.bestTold && SV.best > 500 && G.score > SV.best) { bestPhoto(); G.bestTold = 1; bannerNow('NEW BEST!', t('newBestRun'), 'good'); react('cheer', 1); SFX.best(); react('sparkle', 1); if (!OPT().calm) { burst(W / 2, H * .3, '#F2C230', 40); burst(W / 2, H * .3, '#E86A75', 24); burst(W / 2, H * .3, '#6FC3DF', 18); } }
  if (G.fever <= 0 && pct >= 80 && !G.soonTold) { G.soonTold = 1; banner('ALMOST!', t('feverSoon'), 'good'); }
  let key = ''; for (const k in G.pow) if (G.pow[k] > 0) key += (key ? ',' : '') + k; if (G.shield) key += ',s'; /* [軽く 3-28] 毎コマの表・文字・画面の部品さがしをやめ、変わった時だけ作り直す */
  if (POWK !== key) { POWK = key; const on = Object.keys(G.pow).filter(k => G.pow[k] > 0), box = $('#pows'); box.dataset.k = key; box.innerHTML = on.map(k => `<div class="pow"><b class="ring" data-p="${k}"><img src="${SPR_URL[POW[k].ico]}" alt=""></b></div>`).join('') + (G.shield ? `<div class="pow"><img src="${SPR_URL.clover}" alt=""></div>` : ''); }
  if (key && key !== ',s') $('#pows').querySelectorAll('.ring[data-p]').forEach(u => { const k = u.dataset.p; u.style.setProperty('--p', (G.pow[k] / powDur(k) * 100).toFixed(1)); u.classList.toggle('low', G.pow[k] < 1.5); }); // 残り時間は丸いゲージ（C-70）
  setText('combo', G.combo >= 5 ? t('comboN', G.combo) : '');
  const h = $('#hint');
  if (G.hint > 0 && G.hint < 7) { if (HUDC.hintO !== 1) { HUDC.hintO = 1; h.style.opacity = 1; } setText('hint', G.hint > 3.5 ? t('hintMove') : t('hintTurn')); } else if (HUDC.hintO !== 0) { HUDC.hintO = 0; h.style.opacity = 0; } /* [軽く 3-22] 同じ値を毎コマ書かない */
  routeBar(); kpHud();
}
// a slim one-line banner low on the screen, below the runners (not over the road ahead); one message at a time
const BQ = []; let bOn = null;
function banner(en, ja, cls) {
  { const h = String(lab(en) || '').replace(/[！!。.\s]/g, ''), b = String(ja || '').replace(/[！!。.\s]/g, ''); if (cls !== 'room' && h.length >= 3 && b.includes(h)) (G.bannerDup = G.bannerDup || []).push(lab(en) + ' / ' + ja); } // 見出しと本文が同じことを言っていないか（qa/bannerdup）
  // room banners replace any queued room banner (the player is already somewhere else); rewards queue
  if (cls === 'room') { for (let i = BQ.length - 1; i >= 0; i--) if (BQ[i].cls === 'room') BQ.splice(i, 1); if (bOn && bOn.cls === 'room' && !BQ.length) { bOn = { en, ja, cls }; const el = $('#banner'); el.querySelector('.en').textContent = lab(en); el.querySelector('.ja').textContent = ja; return; } }
  BQ.push({ en, ja, cls }); if (BQ.length > 3) BQ.splice(0, BQ.length - 3);
  if (!bOn) nextBanner();
}
let bTimer = 0;
function nextBanner() {
  const m = BQ.shift(); const el = $('#banner'); if (!m) { bOn = null; el.classList.remove('show'); return; }
  bOn = m; el.className = 'show ' + (m.cls || '') + (((m.ja || '').length > (LANG === 'ja' ? 20 : 34)) ? ' long' : '');
  el.querySelector('.en').textContent = lab(m.en); el.querySelector('.ja').textContent = m.ja;
  clearTimeout(bTimer); bTimer = setTimeout(() => { el.classList.remove('show'); bTimer = setTimeout(nextBanner, 220); }, BQ.length ? 1300 : 2000);
}
function bannerNow(en, ja, cls) { BQ.length = 0; BQ.push({ en, ja, cls }); clearTimeout(bTimer); nextBanner(); }
// today's route progress: 8:00 → 9:00 → 18:00 → home
function routeBar() {
  const el = $('#routeFill'); if (!el) return;
  let m = G.clock % 1440; if (m < 420) m += 1440;
  el.style.width = (clamp((m - 480) / (1380 - 480), 0, 1) * 100).toFixed(1) + '%';
}

/* ---------- missions ---------- */
function eligible() { return MT.filter(m => !m.min || SV.mlevel >= m.min); }
function newMissions() {
  const pool = eligible().sort(() => Math.random() - .5); const slots = [];
  for (const m of pool) { if (slots.length >= 3) break; slots.push({ id: m.id, target: m.f(SV.mlevel), base: SV.totals[m.stat] || 0, prog: 0, done: 0 }); }
  SV.missions = { slots }; save();
}
// missions kept from an older version or a damaged code: a slot whose mission no longer exists (or has no number) could never clear,
// and the mission level would stop for good. Such slots are replaced; the good ones keep their progress.
function missionsFix() {
  if (!SV.missions) return; const all = Array.isArray(SV.missions.slots) ? SV.missions.slots : [];
  const ok = all.filter(sl => sl && typeof sl === 'object' && MT.some(x => x.id === sl.id) && Number.isFinite(+sl.target) && +sl.target > 0);
  for (const sl of ok) { sl.target = +sl.target; sl.base = Number.isFinite(+sl.base) ? +sl.base : 0; sl.prog = Number.isFinite(+sl.prog) ? +sl.prog : 0; }
  if (ok.length === all.length && ok.length >= 3) return;
  const pool = eligible().filter(m => !ok.some(sl => sl.id === m.id)).sort(() => Math.random() - .5);
  for (const m of pool) { if (ok.length >= 3) break; ok.push({ id: m.id, target: m.f(SV.mlevel), base: SV.totals[m.stat] || 0, prog: 0, done: 0 }); }
  SV.missions = { slots: ok }; save();
}
function missionProg(sl, live) {
  const m = MT.find(x => x.id === sl.id); if (!m) return 0;
  if (m.scope === 'abs') return m.stat === 'stamps' ? Object.keys(SV.stamps).length : Object.keys(SV.zukan).length;
  if (m.scope === 'total') return (SV.totals[m.stat] || 0) - sl.base + (live ? (G.stats[m.stat] || 0) : 0);
  return Math.max(sl.prog, live ? (m.stat === 'score' ? G.score : m.stat === 'dist' ? G.dist : (G.stats[m.stat] || 0)) : 0);
}
function checkMissions(live) {
  if (!SV.missions) return;
  for (const sl of SV.missions.slots) {
    if (sl.done) continue;
    if (missionProg(sl, live) >= sl.target) { sl.done = 1; save(); SFX.mission(); if (live) react('cheer', 0); const m = MT.find(x => x.id === sl.id); banner('MISSION CLEAR', L(m.t(sl.target)), 'good'); react('happy', 0); }
  }
}
function missionHTML(re) { /* re：ミッションの画面だけ、入れかえのボタンを出す（結果・一時停止の画面では出さない） */
  if (!SV.missions) newMissions();
  const live = G.mode === 'play' || G.mode === 'pause', ratio = sl => sl.done ? -1 : Math.min(1, missionProg(sl, live) / Math.max(1, sl.target));
  return [...SV.missions.slots].sort((a, b) => ratio(b) - ratio(a)).map(sl => { const m = MT.find(x => x.id === sl.id); if (!m) return ''; const p = Math.min(sl.target, Math.floor(missionProg(sl, live))); const done = sl.done || p >= sl.target; // the one you are closest to comes first (2026-11-08)
    const ic = micon(m.stat), canRe = !done && SV.bank >= KP_REROLL && G.mode !== 'play'; /* [ミッション 7] ミッションの札：種類の絵（色の丸）・文・太い進み具合の帯と数・クリアの判子。入れかえは、札の右の小さなボタン（前は下に、文の長いボタンが並んでいた） */
    return `<div class="m mcard mm${done ? ' done' : ''}" style="--mc:${ic.c}"><span class="mci">${ic.html}</span><div class="mcb"><p>${esc(L(m.t(sl.target)))}</p><span class="mbar"><i style="width:${((done ? 1 : p / sl.target) * 100).toFixed(0)}%"></i></span><span class="mnum">${done ? tr('クリア！', 'Cleared!') : `<b>${fmt(p)}</b> / ${fmt(sl.target)}<small class="mleft">${tr('あと', '')} ${fmt(sl.target - p)}${LANG === 'en' ? ' to go' : ''}</small>`}</span></div>${done ? `<span class="mok">${msvg('check')}</span>` : !re ? '' : `<button class="mre" data-reroll="${esc(sl.id)}"${canRe ? '' : ' disabled'} aria-label="${esc(kt('reroll', KP_REROLL))}">${msvg('reroll')}<small><img src="${SPR_URL.hay}" alt="">${KP_REROLL}</small></button>`}</div>`; }).join('');
}

/* ---------- photos ---------- */
// 自己ベストの記念写真（B-19）：走っている途中で自己ベストをこえた瞬間の画面を、新しい順に 6 枚まで残す。点数は結果で最後の点に直す
function bestPhoto() {
  try { const c = document.createElement('canvas'); const w = 280, h = Math.round(w * Math.min(1.25, H / W)); c.width = w; c.height = h; const g = c.getContext('2d') || noCtx();
    const sw = cv.width, sh = Math.round(cv.width * h / w); g.drawImage(cv, 0, Math.max(0, (cv.height - sh) * .35), sw, Math.min(sh, cv.height), 0, 0, w, h);
    SV.bestPics = (SV.bestPics || []).filter(p => p && p.img).slice(0, 5); SV.bestPics.unshift({ img: c.toDataURL('image/jpeg', .6), s: Math.floor(G.score), d: Date.now(), at: L(curSeg().th) }); G.bestPic = 1; save(); } catch (e) { }
}
function takePhoto(tid) {
  try {
    const c = document.createElement('canvas'); const w = 280, h = Math.round(w * Math.min(1.25, H / W));
    c.width = w; c.height = h; const g = c.getContext('2d') || noCtx();
    const sw = cv.width, sh = Math.round(cv.width * h / w); g.drawImage(cv, 0, Math.max(0, (cv.height - sh) * .35), sw, Math.min(sh, cv.height), 0, 0, w, h);
    g.fillStyle = 'rgba(251,246,238,.92)'; g.fillRect(0, h - 34, w, 34); g.fillStyle = '#3B2A20'; g.font = '900 15px "Zen Maru Gothic",sans-serif'; g.textBaseline = 'middle';
    g.fillText(L(THEMES[tid].stamp) + '  ' + clockStr(G.clock), 10, h - 17); g.drawImage(stampSprite(tid), w - 44, h - 70, 40, 40);
    SV.album[tid] = c.toDataURL('image/jpeg', .64); save();
    banner('PHOTO', t('newSpot'), 'good');
  } catch (e) { }
}

/* ---------- end of run ---------- */
const CAPS = {
  obstacle: { ren: ['EYES FRONT, BOSS.', '課長、前です'], jill: ['NOBODY’S PERFECT.', 'ユズにも、たまには'], pom: ['ROOKIE MISTAKE!', '新人、まだまだっす'] },
  papers: { ren: ['BURIED IN PAPERS.', '書類に埋もれた'], jill: ['BURIED IN PAPERS.', '書類に埋もれた'], pom: ['BURIED IN PAPERS.', '書類に埋もれた'] },
  wall: { ren: ['THAT’S A WALL.', 'そっちは壁です'], jill: ['THAT’S A WALL.', 'そっちは壁です'], pom: ['THAT’S A WALL.', 'そっちは壁です'] },
  fall: { ren: ['OVER THE EDGE.', '曲がりそこねて、落ちました'], jill: ['OVER THE EDGE.', '曲がりそこねて、落ちました'], pom: ['OVER THE EDGE.', '曲がりそこねて、落ちました'] }, /* [塔 F11] */
  quit: { ren: ['LEFT EARLY.', '早退しました'], jill: ['LEFT EARLY.', '早退しました'], pom: ['LEFT EARLY.', '早退しました'] },
  rescue: { ren: ['GOOD RUN!', 'ここで一区切り（記録は残ります）'], jill: ['GOOD RUN!', 'ここで一区切り（記録は残ります）'], pom: ['GOOD RUN!', 'ここで一区切り（記録は残ります）'] }, // 画面が動かなくなって安全網で終わったとき（自分でやめたのではない）
};
const DAY_GOAL = 300;
const bondLv = () => 1 + Math.floor(Math.sqrt((SV.bond || 0) / 3));
function endRun() {
  cpClear();
  if (G.practice) { practiceEnd(); return; }
  chalSave();
  if (!SV.tutDone && (!G.tut || G.tut.every(x => x.done) || G.dist > 150)) { SV.tutDone = 1; } // the lesson is done once it was played through
  G.mode = 'result'; musicStop();
  const bonus = hasPerk('ren') ? Math.floor(G.hay * .2) : 0, gained = Math.floor(G.hay) + bonus;
  SV.bank += gained;
  let bondMsg = ''; if (G.char !== 'pom' && G.dist > 150) { const lv0 = bondLv(); SV.bond = (SV.bond || 0) + 1; if (bondLv() > lv0) bondMsg = t('bondUp', bondLv()); } // Mochi & Yuzu's buddies level (2026-11-08)
  { const td = todayStr(); SV.playDays = (SV.playDays || []).filter(k => k !== td).concat(td).slice(-60); } // days you played, for the calendar
  let dayGoalMsg = ''; { const td = todayStr(); if (!SV.dayHay || SV.dayHay.d !== td) SV.dayHay = { d: td, n: 0 }; const b4 = SV.dayHay.n; SV.dayHay.n += gained; if (b4 < DAY_GOAL && SV.dayHay.n >= DAY_GOAL) { SV.bank += 100; dayGoalMsg = tr('今日の目標達成！ +100', 'Daily goal done! +100'); } } // today's hay goal (2026-11-08)
  const st = G.stats; st.score = G.score; st.dist = G.dist;
  checkMissions(true);
  for (const k of ['jumps', 'slides', 'treats', 'powers', 'fevers', 'hay', 'veg', 'turns', 'looks', 'flights']) SV.totals[k] = (SV.totals[k] || 0) + (st[k] || 0);
  for (const sl of SV.missions.slots) { const m = MT.find(x => x.id === sl.id); if (m && m.scope === 'run') sl.prog = Math.max(sl.prog, m.stat === 'score' ? G.score : m.stat === 'dist' ? G.dist : (st[m.stat] || 0)); }
  checkAch(false); dailyCheck(false);
  let weekMsg = ''; if (!G.easy) { try { weekMsg = weekAdd(st); } catch (e) { reportErr(e); } } // this week's goal (2026-11-08)
  const bk = 'best', prevBest = G.easy ? 0 : (SV[bk] || 0), newBest = !G.easy && G.score > (SV[bk] || 0); if (newBest) { SV[bk] = Math.floor(G.score); if (G.bestPic && SV.bestPics && SV.bestPics[0]) SV.bestPics[0].s = Math.floor(G.score); }
  if (!G.easy) SV.bestClock = Math.max(SV.bestClock || 480, G.clock + (G.day - 1) * 1440); SV.bestDay = Math.max(SV.bestDay || 1, G.day);
  let lvlMsg = '';
  if (SV.missions.slots.every(sl => sl.done)) { SV.mlevel++; const rw = 150 * SV.mlevel; SV.bank += rw; lvlMsg = t('lvlUp', SV.mlevel, rw); newMissions(); }
  { const pm = careerCheck(); if (pm) { lvlMsg = pm + (lvlMsg ? '　' + lvlMsg : ''); $('#resPromo').textContent = pm; $('#resPromo').hidden = false; } else $('#resPromo').hidden = true; }
  save();
  const cap = (CAPS[G.cause] || CAPS.obstacle)[G.char] || CAPS.obstacle.ren;
  $('#resEn').textContent = tr(cap[1], cap[0]); $('#resJa').textContent = ''; showHit('res'); try { titleShareBtn(); } catch (e) { reportErr(e); }
  $('#resBest').hidden = !newBest;
  { const el = $('#resScore'), total = Math.floor(G.score), t0 = performance.now(), dur = Math.min(1400, 500 + total / 60); el.textContent = '0';
    G.resSkip = 0; el.onclick = () => { G.resSkip = 1; }; // a tap on the number shows it at once
    const tick = () => { if (G.mode !== 'result') return; const k = G.resSkip ? 1 : Math.min(1, (performance.now() - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(Math.round(total * e)); fitResScore(el); if (k < 1) { if (Math.random() < .5) tone(440 + 220 * e, .04, 'pluck', .025); requestAnimationFrame(tick); } else { el.textContent = fmt(total); fitResScore(el); SFX.mission(); } }; requestAnimationFrame(tick); }
  { const hi = []; if ((st.maxCombo || 0) >= 20) hi.push(t('hiCombo', st.maxCombo)); if ((st.nice || 0) >= 3) hi.push(t('hiNice', st.nice)); if ((st.fevers || 0) >= 2) hi.push(t('hiFever', st.fevers)); if ((st.looks || 0) >= 3) hi.push(t('hiLook', st.looks));
    $('#resHi').innerHTML = st.stampsNew.map(tid => `<span class="new">${esc(t('hiNew', L(THEMES[tid].stamp)))}</span>`).join('') + hi.map(x => `<span>${esc(x)}</span>`).join(''); }
  SV.last = { score: Math.floor(G.score), place: { ja: curSeg().th.ja, en: curSeg().th.en } }; // the place in every language (shown in whatever language the title is in later)
  save(); $('#resClock').textContent = (G.day > 1 ? t('dayN', G.day) + ' ' : '') + clockStr(G.clock); $('#resHay').textContent = fmt(gained);
  const vsBest = prevBest > 0 ? (newBest ? t('bestUp', fmt(Math.floor(G.score) - prevBest)) : t('bestShort', fmt(prevBest - Math.floor(G.score)))) : '';
  $('#resNote').textContent = (CHAL ? (G.chalWon ? t('chalDone', fmt(CHAL.s)) : t('chalLeft', fmt(Math.ceil(CHAL.s - G.score) + 1))) : '') + (bonus ? t('bonusRen', bonus) : '') + (lvlMsg || t('ranM', fmt(G.dist))) + (vsBest ? '　' + vsBest : '') + (dayGoalMsg ? '　' + dayGoalMsg : '') + (weekMsg ? '　' + weekMsg : '') + (bondMsg ? '　' + bondMsg : '') + (G.easy ? '　' + t('easyRes') : '');
  $('#resSpots').innerHTML = st.spots.length ? st.spots.map(tid => `<span class="spot${st.stampsNew.includes(tid) ? ' new' : ''}"><img src="${stampURL(tid)}" alt="">${esc(L(THEMES[tid].stamp))}</span>`).join('') : '';
  $('#resMissions').innerHTML = missionHTML();
  const seen = st.bads.length ? st.bads[st.bads.length - 1] : pick(Object.keys(st.foods).length ? Object.keys(st.foods) : ['hay']);
  const d = ITEMS[seen]; $('#resTip').innerHTML = `<b>${d.kind === 'bad' ? (LANG === 'en' ? "DON'T FEED" : lab('NG FOOD')) : lab('BUNNY FOOD NOTE')}${tr('｜', ' · ')}${esc(L(d))}</b>${esc(L(d.tip).split('\n')[0])}`;
  const place = L(curSeg().th);
  G.lastShare = t(G.chalWon ? 'shareTextWon' : 'shareText', fmt(G.score), (G.day > 1 ? 'DAY ' + G.day + ' ' : '') + clockStr(G.clock), place, CHAL ? fmt(CHAL.s) : '');
  buildShareCard(cap, place, gained);
  const kb = $('#kujiBox'); kb.hidden = G.dist < 300; $('#kujiRes').innerHTML = ''; $('#btnKuji').disabled = false; $('#btnKuji').textContent = tr('おみくじを引く', 'Draw a fortune slip');
  $('#resCareer').innerHTML = careerHTML();
  resultFollow((newBest && SV.runs >= 3) || G.score >= 30000 || !!G.chalWon);
  try { kpEnd({ prevBest, newBest, gained }); } catch (e) { reportErr(e); }
  hideAll(); show('sResult');
  rankAfterRun(G.score);
}
/* ---- sharing a result ----
   Phones: X and LINE open their own share screens with the text filled in (their apps pick these links up).
   Facebook and Instagram take no text from a web link, so on phones they go through the phone's share sheet
   (Facebook gets the link, Instagram gets the picture) with the caption already copied; elsewhere the picture is saved
   and a plain link to the site is shown. Every step falls back to something the player can tap. */
// a friend's challenge link: ?beat=12345&c=jill (kept for two weeks, until you beat it)
const CHAL = (() => { try { const q = new URLSearchParams(location.search), n = parseInt(q.get('beat'), 10);
  if (n > 0 && n < 50000000) { const c = { s: n, c: ['ren', 'jill', 'pom'].includes(q.get('c')) ? q.get('c') : 'ren', at: Date.now() }; try { localStorage.setItem('rjChal', JSON.stringify(c)); history.replaceState(null, '', location.pathname + location.hash); } catch (e) { } return c; }
  const o = JSON.parse(localStorage.getItem('rjChal') || 'null'); if (o && o.s > 0 && o.s < 50000000 && Date.now() - o.at < 14 * 864e5 && !o.won) return o; } catch (e) { } return null; })();
function chalTick() { if (!CHAL || G.chalWon || G.mode !== 'play' || G.score <= CHAL.s) return; G.chalWon = 1; G.stats.chal = 1;
  bannerNow(t('chalWin'), t('chalWinSub', fmt(CHAL.s)), 'good'); SFX.mission(); burst(W / 2, H * .4, '#F2C230', 36); burst(W / 2, H * .4, '#E86A75', 18); buzz([30, 30, 60]); }
function chalSave() { if (CHAL && G.chalWon) { CHAL.won = 1; try { localStorage.setItem('rjChal', JSON.stringify(CHAL)); } catch (e) { } } }
const SHARE = {
  phone: () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent)),
  canSheet: () => typeof navigator.share === 'function',
  text: () => G.lastShare || '', url: ch => { const base = G.score > 0 ? GAME_URL + (GAME_URL.includes('?') ? '&' : '?') + 'beat=' + Math.floor(G.score) + '&c=' + G.char : GAME_URL; return ch ? base + (base.includes('?') ? '&' : '?') + 'ref=' + ch : base; },
  caption: ch => (G.lastShare || '') + (ch === 'ig' || ch === 'th' ? ' ' + SNS_HANDLE : '') + ' ' + SHARE.url(ch), // Instagram and Threads: the official account is tagged too // the link carries your score: whoever opens it gets a challenge to beat it
};
const encU = encodeURIComponent;
const extOpen = u => u + (u.includes('?') ? '&' : '?') + 'openExternalBrowser=1'; // LINE opens such a link in the phone's own browser (one account, not a second one inside LINE)
function shareLinks() {
  const txt = SHARE.text(), u = SHARE.url;
  return { x: `https://x.com/intent/post?text=${encU(txt)}&url=${encU(u('x'))}`,
    line: SHARE.phone() ? `https://line.me/R/share?text=${encU(txt + '\n' + extOpen(u('line')))}` : `https://social-plugins.line.me/lineit/share?url=${encU(u('line'))}&text=${encU(txt)}`,
    th: `https://www.threads.net/intent/post?text=${encU(SHARE.caption('th'))}`,
    fb: `https://www.facebook.com/sharer/sharer.php?u=${encU(u('fb'))}` };
}
async function copyText(s) { try { await navigator.clipboard.writeText(s); return true; } catch (e) { }
  try { const ta = document.createElement('textarea'); ta.value = s; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e) { return false; } }
// the share sheet: 'ok' | 'abort' (the player closed it) | 'none' (not available here)
async function sheet(data) {
  if (!SHARE.canSheet()) return 'none';
  const d = Object.assign({}, data); if (d.files && !(navigator.canShare && navigator.canShare({ files: d.files }))) { if (data.needFiles) return 'none'; delete d.files; } delete d.needFiles;
  try { await navigator.share(d); return 'ok'; } catch (e) { return e && e.name === 'AbortError' ? 'abort' : 'none'; }
}
function shareNote(msg, link, label) { const n = $('#igNote'); n.textContent = msg || ''; if (link) { const a = document.createElement('a'); a.href = link; a.target = '_blank'; a.rel = 'noopener'; a.className = 'notelink'; a.textContent = label; n.append(' ', a); } }
function savePicture(blob) {
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'renjill-hay-dash.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); return true; } catch (e) { return false; }
}
async function sharePictureSave(blob) {
  try { const dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; if (dl) { await dl.save({ filename: 'renjill-hay-dash.png', data: blob }); return true; } } catch (e) { if (e && e.code === 'declined') return false; }
  return savePicture(blob);
}
async function shareFacebook() {
  const ok = await copyText(SHARE.caption('fb'));
  const r = SHARE.phone() ? await sheet({ url: SHARE.url('fb') }) : 'none';
  if (r === 'ok') return shareNote(t('fbShared'));
  if (r === 'abort') return shareNote('');
  shareNote(ok ? t('fbCopied') : '', shareLinks().fb, t('fbOpen'));
}
async function shareInstagram() {
  const f = G.shareFiles; await copyText(SHARE.caption('ig'));
  const r = f && SHARE.phone() ? await sheet({ files: [f.story], needFiles: 1 }) : 'none';
  if (r === 'ok') return shareNote(t('igShared'));
  if (r === 'abort') return shareNote('');
  const saved = f ? await sharePictureSave(f.storyBlob) : false;
  shareNote(saved ? t('igSaved') : t('shareImg'), 'https://www.instagram.com/', t('igOpen'));
}
async function shareMore() {
  const f = G.shareFiles, txt = SHARE.text();
  const r = await sheet({ title: t('gameTitle'), text: txt, url: SHARE.url('share'), files: f ? [f.square] : undefined });
  if (r === 'ok') return shareNote(t('igShared'));
  if (r === 'abort') return shareNote('');
  const ok = await copyText(txt + ' ' + SHARE.url('copy')); shareNote(ok ? t('copyNote') : t('copyFail'));
}
// the picture files are made ahead of time: a share sheet must open straight from the tap
function prepShareFiles(sq, story) {
  G.shareFiles = null; const mk = c => new Promise(r => { try { c.toBlob(r, 'image/png'); } catch (e) { r(null); } });
  Promise.all([mk(sq), mk(story)]).then(([a, b]) => { if (!a || !b) return; G.shareFiles = { square: new File([a], 'renjill-hay-dash.png', { type: 'image/png' }), story: new File([b], 'renjill-hay-dash-story.png', { type: 'image/png' }), storyBlob: b }; });
}
function fitFont(g, txt, maxW, size, tpl) { let s = size; g.font = tpl.replace('{}', s); while (s > 12 && g.measureText(txt).width > maxW) { s -= 2; g.font = tpl.replace('{}', s); } return s; } // the biggest size (up to `size`) that fits maxW
// 新しい称号のシェア用カード（B-48）：結果画面に「称号カードをシェア」。スマホは共有シート、パソコンは画像を保存して文章をコピー
function titleCard(a) { const c = document.createElement('canvas'); c.width = c.height = 1080; const g = c.getContext('2d') || noCtx();
  g.fillStyle = '#FBF6EE'; g.fillRect(0, 0, 1080, 1080); g.fillStyle = '#F2C230'; g.beginPath(); g.arc(540, 470, 330, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FBF6EE'; g.beginPath(); g.arc(540, 470, 290, 0, Math.PI * 2); g.fill();
  try { const b = bunFrame(G.char || 'ren', 'front_cheer', SV.mugOn); const k = 520 / Math.max(b.width, b.height); g.drawImage(b, 540 - b.width * k / 2, 470 - b.height * k / 2 + 20, b.width * k, b.height * k); } catch (e) { }
  g.textAlign = 'center'; g.fillStyle = '#A97A1E'; g.font = '900 46px "Zen Maru Gothic",sans-serif'; g.fillText(t('titleNew'), 540, 110);
  g.fillStyle = '#3B2A20'; fitFont(g, L(a.n), 960, 110, '400 {}px "Dela Gothic One",sans-serif'); g.fillText(L(a.n), 540, 900);
  g.fillStyle = '#6B5A50'; fitFont(g, L(a.d), 960, 40, '900 {}px "Zen Maru Gothic",sans-serif'); g.fillText(L(a.d), 540, 960);
  g.fillStyle = '#A97A1E'; g.font = '900 34px "Zen Maru Gothic",sans-serif'; g.fillText(tr('チモシーダッシュ', 'HAY DASH!') + '  ' + (SHARE.url('title') || '').replace(/^https?:\/\//, '').replace(/\?.*$/, ''), 540, 1035); return c; }
async function shareTitle(a) { const c = titleCard(a); const blob = await new Promise(r => { try { c.toBlob(r, 'image/png'); } catch (e) { r(null); } }); if (!blob) return; G.titleShared = (G.titleShared || 0) + 1;
  const txt = t('titleShareText', L(a.n)), file = new File([blob], 'renjill-title.png', { type: 'image/png' });
  const r = SHARE.phone() ? await sheet({ text: txt, url: SHARE.url('title'), files: [file] }) : 'none'; if (r === 'ok' || r === 'abort') return shareNote(r === 'ok' ? t('igShared') : '');
  const saved = await sharePictureSave(blob); const ok = await copyText(txt + ' ' + SHARE.url('title')); shareNote(saved ? t('titleSaved') : ok ? t('copyNote') : t('copyFail')); }
function titleShareBtn() { let box = document.getElementById('titleShare'); const list = (G.newTitles || []).slice(-2); if (!box) { box = document.createElement('div'); box.id = 'titleShare'; const bar = document.querySelector('#sResult .sharebar'); if (!bar) return; bar.before(box); }
  box.innerHTML = list.map((a, i) => `<button class="sub small tshare" data-tshare="${i}">${esc(t('titleShareBtn', L(a.n)))}</button>`).join(''); box.hidden = !list.length;
  box.onclick = e => { const b = e.target.closest('[data-tshare]'); if (b) shareTitle(list[+b.dataset.tshare]); }; }
function buildShareCard(cap, place, gained) {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1080; const g = c.getContext('2d') || noCtx();
  g.fillStyle = '#F6EBDC'; g.fillRect(0, 0, 1080, 1080);
  /* 2026-11-15：シェア画像の写真は、キャラクターが切れない位置で切り出す（前は画面のまん中を切り出していて、縦長のスマホでは走っている2人の頭しか入らなかった）。拡大もなめらかに */
  try { const sh = Math.min(cv.height, Math.round(cv.width * .62)); let top = (cv.height - sh) / 2;
    try { const sp = spriteAt(G.player.wx, G.player.wy || 0, G.player.wz); if (sp && Number.isFinite(sp.sy)) top = sp.sy * DPR + cv.height * .085 - sh; /* 後ろを走る相棒も入るよう、足もとの下に少し余白 */ } catch (e2) { }
    top = Math.max(0, Math.min(cv.height - sh, Math.round(top))); G.cardTop = top / Math.max(1, cv.height);
    g.imageSmoothingQuality = 'high'; g.drawImage(cv, 0, top, cv.width, sh, 60, 260, 960, 595); } catch (e) { }
  g.strokeStyle = '#3B2A20'; g.lineWidth = 8; g.strokeRect(60, 260, 960, 595);
  const pom = G.char === 'pom', kH = (BS + BTOP) / BS, who = (w, mood, x, size) => g.drawImage(bunFrame(w, mood, w === 'ren' && SV.mugOn), x, 278 - size * kH, size, size * kH);
  const titleW = pom ? 540 : 610; g.fillStyle = '#3B2A20'; g.textAlign = 'left'; fitFont(g, tr('チモシーダッシュ', 'HAY DASH!'), titleW, LANG === 'ja' ? 74 : 92, '400 {}px "Dela Gothic One","Hiragino Sans",sans-serif'); g.fillText(tr('チモシーダッシュ', 'HAY DASH!'), 60, 150);
  // under the title: the hashtag and where to play (the picture travels without its caption)
  const host = GAME_URL.replace(/^https?:\/\//, '').replace(/\/$/, ''), tag = LANG === 'ja' ? '#東京うさぎオフィス' : '#TokyoUsagiOffice';
  g.fillStyle = '#A97A1E'; fitFont(g, tag + '  ' + host, titleW, 34, '900 {}px "Zen Maru Gothic",sans-serif'); g.fillText(tag + '  ' + host, 64, 210);
  if (pom) { who('ren', 'front_happy', 610, 180); who('jill', 'front_open', 765, 155); who('pom', 'front_happy', 900, 150); }
  else { who('ren', 'front_happy', 700, 210); who('jill', 'front_open', 860, 180); }
  g.fillStyle = '#3B2A20'; fitFont(g, fmt(G.score), 600, 120, '400 {}px "Dela Gothic One",sans-serif'); g.fillText(fmt(G.score), 60, 990);
  g.font = '900 36px "Zen Maru Gothic",sans-serif'; g.fillStyle = '#6E5848';
  { const ln = `${G.day > 1 ? t('dayN', G.day) + ' · ' : ''}${clockStr(G.clock)} · ${place}`; fitFont(g, ln, 640, 36, '900 {}px "Zen Maru Gothic",sans-serif'); g.fillText(ln, 64, 1040); }
  g.textAlign = 'right'; g.font = '900 36px "Zen Maru Gothic",sans-serif'; g.fillText(t('hayN', fmt(gained)), 1016, 1040);
  { const capTxt = LANG === 'en' ? (cap[0].length > 18 ? 'GAME OVER' : cap[0]) : tr(cap[1], cap[0]); g.save(); g.translate(860, 940); g.rotate(-.12); g.fillStyle = '#C8463C'; g.textAlign = 'center'; fitFont(g, capTxt, 360, 44, '400 {}px "Dela Gothic One",sans-serif'); g.fillText(capTxt, 0, 0); g.restore(); } // long captions shrink instead of running off the card
  let x = 64; for (const tid of G.stats.spots.slice(0, 7)) { g.drawImage(stampSprite(tid, 1), x, 790, 120, 120); x += 110; }
  try { $('#shareImg').src = c.toDataURL('image/png'); } catch (e) { }
  { const sb = document.querySelector('#sResult .sharebar'); if (sb) { const cp = SHARE.phone() && SHARE.canSheet(); sb.classList.toggle('compact', cp); } }
  { const L2 = shareLinks(); $('#shX').href = L2.x; $('#shLine').href = L2.line; $('#shTh').href = L2.th; $('#shFb').href = L2.fb; $('#igNote').textContent = ''; $('#tCopy').textContent = SHARE.phone() && SHARE.canSheet() ? t('shareMore') : t('copy'); }
  G.shareCanvas = c;
  { // a tall 9:16 version for Instagram Stories: the square card on a warm backdrop, the title above, the hashtag below
    const t = document.createElement('canvas'); t.width = 1080; t.height = 1920; const q = t.getContext('2d') || noCtx();
    const bg = q.createLinearGradient(0, 0, 0, 1920); bg.addColorStop(0, '#F6E7C8'); bg.addColorStop(1, '#F2C9A6'); q.fillStyle = bg; q.fillRect(0, 0, 1080, 1920);
    q.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 40; i++) { q.beginPath(); q.arc((i * 263) % 1080, (i * 397) % 1920, 6 + (i % 5) * 4, 0, Math.PI * 2); q.fill(); }
    q.save(); q.translate(540, 980); q.rotate(-.03); q.shadowColor = 'rgba(59,42,32,.35)'; q.shadowBlur = 40; q.shadowOffsetY = 18; q.drawImage(c, -470, -470, 940, 940); q.restore();
    q.fillStyle = '#3B2A20'; q.textAlign = 'center'; q.font = '400 64px "Dela Gothic One","Hiragino Sans",sans-serif'; q.fillText(tr('今日のチモシーダッシュ', "TODAY'S HAY DASH"), 540, 400);
    q.font = '900 40px "Zen Maru Gothic",sans-serif'; q.fillStyle = '#6E5848'; q.fillText('#東京うさぎオフィス', 540, 1560); fitFont(q, tr('うさぎの課長と、東京をかけぬけて出社', 'Two office bunnies, one mad dash across Tokyo'), 960, 40, '900 {}px "Zen Maru Gothic",sans-serif'); q.fillText(tr('うさぎの課長と、東京をかけぬけて出社', 'Two office bunnies, one mad dash across Tokyo'), 540, 1620);
    // where to play and whom to follow, in a soft pill (a Story has no clickable caption)
    { const host = GAME_URL.replace(/^https?:\/\//, '').replace(/\/$/, ''); q.fillStyle = 'rgba(255,250,242,.92)'; q.beginPath(); q.roundRect ? q.roundRect(190, 1680, 700, 130, 40) : q.rect(190, 1680, 700, 130); q.fill();
      q.fillStyle = '#3B2A20'; fitFont(q, host, 640, 40, '900 {}px "Zen Maru Gothic",sans-serif'); q.fillText(host, 540, 1736); q.fillStyle = '#A97A1E'; q.font = '900 32px "Zen Maru Gothic",sans-serif'; q.fillText(SNS_HANDLE, 540, 1786); }
    G.shareStory = t; prepShareFiles(c, t);
  }
}



// あいことばのかくれんぼ（B-49）はやめた（2026-11-15 オーナーの判断）。前の保存データに SV.hunt が残っていても読まないだけで害はない。feed.json の hunt も読まない


// お祭りの日（B-29）：土日と、feed の行事 'matsuri' の日。提灯の並ぶ通り（浅草・アメ横・神楽坂など）に入ると、音楽が祭りばやしに
function matsuriDay() { const d = new Date().getDay(); return d === 0 || d === 6 || EVENT === 'matsuri'; }
function matsuriSeg(th) { return !!(th && Array.isArray(th.props) && th.props.some(p => p && p[0] === 'chochin')); }

// 終電間際（B-30）：夜 9 時をすぎて、次が最後の電車（帰りの山手線など）のとき、「終電まで ◯秒」。ドアが閉まる前に乗りこめばボーナス。
//  間に合わなくても走りは続く（次の電車で帰る）。時間は残りの道のりと今の速さから決め、ぶつからずに走れば間に合う長さにする
function lastTrainTick() {
  if (G.mode !== 'play' || G.practice) { setText('hLast', ''); return; }
  const seg = curSeg(), nx = G.segs[G.ci + 1], L = G.lastTrain;
  if (!L && !G.lastTrainDone && seg && seg.th.kind !== 'train' && nx && nx.step && nx.step.last && nx.th.kind === 'train' && G.clock >= 19 * 60 + 30) { // 夜の帰り道は 20 時台に終わるので、19:30 から（21 時では一度も出なかった：2026-11-09）
    const left = Math.max(10, seg.len - G.s), need = left / Math.max(10, G.speed) * 1.25 + 1.5;
    G.lastTrain = { seg: nx, until: G.t + need }; bannerNow('LAST TRAIN!', t('lastGo', Math.ceil(need)), 'good'); tone(988, .12, 'bell', .05); tone(784, .16, 'bell', .05, AU.ctx && AU.ctx.currentTime + .12); }
  const T = G.lastTrain; if (!T) { setText('hLast', ''); return; }
  if (seg === T.seg) { G.lastTrain = null; G.lastTrainDone = 1; setText('hLast', '');
    if (G.t <= T.until) { const b = 1500 * SV.mlevel; G.score += b; G.stats.lastTrain = 1; bannerNow('MADE IT!', t('lastOk', fmt(b)), 'good'); SFX.mission(); react('sparkle', 1); }
    else banner('', t('lastMiss'), 'room'); return; }
  const r = T.until - G.t; setText('hLast', r > 0 ? t('lastHud', r.toFixed(1)) : t('lastClosed')); setCls('hLast', 'late', r < 3);
}

// 逆走デー（B-37）：金曜日（と feed の行事 'gyakusou' の日）だけ題名にボタン。ランキングには入れない（朝の道をとばすので）
function revDay() { return new Date().getDay() === 5 || EVENT === 'gyakusou'; }

// 締め切りの山（B-39）：締め切り前の区間は、上に「ボスの体力」ふうのバー（残りの道のり）。1回もぶつからずに抜ければ大きなボーナス
function bossHud() {
  let e = el('bossBar'); const B = G.boss, seg = curSeg();
  if (!B || G.mode !== 'play' || seg !== B.seg) { if (e) e.hidden = true; return; }
  if (!e) { e = document.createElement('div'); e.id = 'bossBar'; e.innerHTML = '<b></b><i><s></s></i>'; $('#lives').after(e); }
  e.hidden = false; const k = clamp(1 - G.s / Math.max(1, seg.len), 0, 1); e.querySelector('b').textContent = t('bossName', Math.max(0, Math.round(seg.len - G.s))); e.querySelector('s').style.width = (k * 100).toFixed(1) + '%';
}

// その日の動画のネタが、ステージの出来事に（B-40）：走りの最初の「おしごと」を、いちばん新しい動画の話にあわせて選び、点は 1.5 倍。
//  feed の latest.gig（boss / call / memo / rain）があればそれ、なければ題名の言葉から。どれにも当たらなければ、いつもどおりの順番
const EP_GIG = [['boss', /社長|上司|会議|課長|面接|視察/], ['call', /電話|返信|メール|了解|連絡|チャット|通知/], ['memo', /書類|ハンコ|締め切り|印刷|資料|年賀状|付箋|シュレッダー|コピー/], ['rain', /差し入れ|お弁当|牧草|おやつ|みかん|夜食|ランチ|ジュース/]];
function epGig() { const e = typeof latestEpisode === 'function' ? latestEpisode() : null; if (!e) return null; const title = e.ja || e.en || ''; if (!title) return null;
  let k = e.gig && GIGS[e.gig] ? e.gig : ''; if (!k) { const m = EP_GIG.find(([, re]) => re.test(title)); k = m ? m[0] : ''; } return k ? { k, title: LANG === 'ja' ? title : (e[LANG] || e.en || title) } : null; }

// 上の帯（お知らせ）と分かれ道のカードを、上の段（ゲージ・ハート・パワーアップ・締め切りの山）のすぐ下に置く（2026-11-09：重なって読めなかった。qa/hudlayout）
let HUDL = 0;
/* 時計の下の場所名：長すぎて「…」で切れる名前は短い名前に（2行に入る長さ） */
/* 時計の下の場所名：長すぎて「…」で切れる名前は短い名前に。字の幅は端末でちがうので、実際に入れてみて、はみ出したら次に短い名前（qa/roomfit） */
function roomNames(th) { const n = L(th), b = th.base || th, en = LANG === 'en', g = k => th[k] || b[k], st = g('stamp');
  const cand = en ? [g('lblEn'), st && st.en, n.split(',')[0], n.split(/[:,·(]/)[0].trim()] : [g('lbl') && L({ ja: g('lbl'), en: g('lblEn') || b.en }), n.split('・').slice(-1)[0], n.split(/[・：（]/)[0], st && L(st)];
  return [n].concat(cand.filter(x => x && x.length < n.length).sort((x, y) => y.length - x.length)).filter((x, k, a) => a.indexOf(x) === k); }
function roomFit(e, th, tail) { const list = roomNames(th), fits = () => e.scrollHeight <= e.clientHeight + 1 && e.scrollWidth <= e.clientWidth + 1; e.style.fontSize = '';
  for (const fs of [0, 10, 9]) { if (fs) e.style.fontSize = fs + 'px'; for (let k = 0; k < list.length; k++) { e.textContent = list[k] + (tail || ''); if (fits()) { G.roomFitK = k; roomBreak(e, fits); return e.textContent; } } } /* 短い名前でも入らないときは、字を少し小さく */
  G.roomFitK = -1; return e.textContent; }
/* 2026-11-15：2 行になる場所の名前は、切りのいい所で折り返す（前は「渋谷スクランブル交差／点」のように 1 文字だけ下の行に落ちることがあった）。
   カタカナ語・英数字の途中では切らない。「・」「の」のあと、文字の種類が変わる所（カタカナ→漢字など）を優先し、上下の行の長さが近いものを選ぶ。入らなければ元のまま */
const KATA_CUT = ['エレベーター|ホール', 'フリー|アドレス', 'キャット|ストリート', 'ボード|ウォーク']; /* 場所の名前に出てくる、カタカナ語のつなぎ目（qa/roomfit.js が、新しい長いカタカナ語を見つけたら止める） */
function roomBreakAt(s) {
  const n = s.length, asc = c => /[A-Za-z0-9.]/.test(c), kind = c => /[\u30A1-\u30FA\u30FC-\u30FF]/.test(c) ? 'k' : asc(c) ? 'a' : /[\u3040-\u309F]/.test(c) ? 'h' : /[\u4E00-\u9FFF々]/.test(c) ? 'j' : /[\uAC00-\uD7AF]/.test(c) ? 'g' : 'o';
  const wid = t => { let w = 0; for (const c of t) w += asc(c) || c === ' ' ? .55 : 1; return w; }, out = [];
  for (let i = 2; i <= n - 2; i++) { const a = s[i - 1], b = s[i], ka = kind(a), kb = kind(b); let p = Math.abs(wid(s.slice(0, i).trim()) - wid(s.slice(i).trim()));
    const cut = ka === 'k' && kb === 'k' && KATA_CUT.some(w => { const j = w.indexOf('|'), a0 = w.slice(0, j), b0 = w.slice(j + 1); return s.slice(Math.max(0, i - a0.length), i) === a0 && s.slice(i, i + b0.length) === b0; }); /* 2 つのカタカナ語がつながった所（エレベーター｜ホール）は切ってよい */
    if (ka === kb && (ka === 'k' || ka === 'a' || ka === 'g') && !cut) p += 50; /* カタカナ語・英数字・ハングルの語の途中 */
    if (/[、。・·ー）」』：:,.!?！？)ゃゅょっャュョッァィゥェォ々]/.test(b) || /[（「『]/.test(a)) p += 50; /* 行のはじめ・終わりに来てはいけない字 */
    if (/[のをにはがでとへも]/.test(b) && (ka === 'j' || ka === 'k')) p += 50; /* 名詞のあとの「の」「を」などが行のはじめに来ない */
    if (/[・·：、]/.test(a) || b === '（' || a === ' ' || b === ' ') p -= 6; else if (a === 'の' && s[i - 2] !== '丸') p -= 2; else if (kb === 'h' && (ka === 'j' || ka === 'k') && !/^[\u3040-\u309F]{3,}/.test(s.slice(i))) p += 4; /* 送りがな（川沿｜い）の前では切らない。ひらがなが 3 字以上続くなら、ひらがなの語のはじまり（｜いちょう） */ else if (ka !== kb || cut) p -= 1.5; else if (ka === 'h') p += 6; else if (ka === 'j') p += 2;
    out.push([p, i]); }
  return out.sort((x, y) => x[0] - y[0] || x[1] - y[1]).filter(x => x[0] < 40); } /* [悪さ, 切る位置] のよい順 */
function roomBreak(e, fits) {
  try { if (LANG === 'en') return; const s = e.textContent; if (s.length < 6 || s.includes('\n')) return; const fs = parseFloat(getComputedStyle(e).fontSize) || 11; if (e.scrollHeight < fs * 1.2 * 1.5) return; /* 1 行に入っている */
    const all = roomBreakAt(s), keep = e.style.fontSize; if (!all.length) return;
    /* まず「いちばん切りのいい所」とほぼ同じ良さの候補だけ（今の字の大きさ → 少し小さく）。それでも入らなければ、残りの候補 */
    for (const at of [all.filter(x => x[0] <= all[0][0] + 2.5), all.slice(0, 6)]) for (const f of [0, 10, 9]) { if (f) { if (f >= fs) continue; e.style.fontSize = f + 'px'; } else e.style.fontSize = keep;
      for (const [, i] of at) { e.textContent = s.slice(0, i).trim() + '\n' + s.slice(i).trim(); if (fits()) return; } }
    e.style.fontSize = keep; e.textContent = s; } catch (er) { } }
function roomName(th) { return roomNames(th)[0]; }
function layoutHud() {
  const now = performance.now(); if (now - HUDL < 100) return; HUDL = now;
  const fc0 = el('forkCards'); if (!fc0 || fc0.hidden) return; /* [軽く 3-7] 画面の並びを読むのは、分かれ道のカードが出ている時だけ（前は 1 秒に 10 回、画面の並べ直しを起こしていた。いまの帯は下に固定で、位置を読む必要がない） */
  const b = el('banner'); if (!b) return; let y = 0;
  for (const id of ['routeBar', 'feverBar', 'lives', 'pows', 'bossBar']) { const e = el(id); if (!e || e.hidden || e.offsetParent === null) continue; const r = e.getBoundingClientRect(); if (r.height > 1 && r.width > 1) y = Math.max(y, r.bottom); }
  const pr = (b.offsetParent || document.body).getBoundingClientRect(), z = parseFloat(getComputedStyle(b).zoom) || 1, top = Math.max(y - pr.top + 8, 60);
  b.style.removeProperty('top'); // the banner now sits low, under the runners (2026-11-14: over the road ahead it hid what was coming)
  const fc = el('forkCards'); if (fc && !fc.hidden) fc.style.top = (top + 8).toFixed(1) + 'px';
}
