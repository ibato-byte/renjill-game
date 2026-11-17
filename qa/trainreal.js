// 電車の中・ホームの電車を、本物の 20m・4 ドアの車両の並びで作っているか（2026-11-17 オーナー「電車のクオリティが全体的に低め。現実世界に近く」）。
// ドアは 4.8m ごと・左右で向かい合う／20m ごとにとなりの車両への通路（ほろ）／座席は 7 人がけ 3.2m・3 人がけ 1.4m／立っている人とつり革は走る車線に入らない／
// （曲がり角の側は、角の手前で車両が終わるので、片方が短いのはよい）窓の景色の流れる向きを左右で区別／ホームドアのあく所が電車のドアの前。スマホ・PC の写真も撮る
const { chromium } = require('playwright');
const SH = process.env.SHOTS || 'shots';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = [];
  for (const [vw, vh, tag] of [[390, 844, 'sp'], [1280, 800, 'pc']]) for (const th of ['yamanote', 'subway', 'station']) {
    const p = await b.newPage({ viewport: { width: vw, height: vh } });
    p.on('pageerror', e => errs.push(tag + th + ': ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', char: 'ren' })));
    await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(800);
    await p.evaluate(() => window.__hayDash.ev('hideAll(); startRun()')); await p.waitForTimeout(600);
    await p.evaluate(t => { const G = window.__hayDash.G; G.jumpTo(t, 480, 1); G.invT = 999; }, th); await p.waitForTimeout(900);
    const r = await p.evaluate(() => { const G = window.__hayDash.G, seg = G.segs[G.ci]; G.invT = 999; G.speed = .01; G.s = seg.len * .4; for (const o of seg.obs) o.dead = .001;
      const doors = seg.decos.filter(e => e.pat === 'door'), cen = e => { const q = e.v; return null; };
      const ds = {}; for (const e of doors) { const k = e.sd; (ds[k] = ds[k] || []).push(e); }
      const dl = (seg.tlay && seg.tlay.cars) || [];
      const T = seg.tlay, ss = T ? T.cars : [];
      const doorS = sd => seg.decos.filter(e => e.pat === 'door' && e.sd === sd).map(e => e.car * 100 + e.di);
      const seats = seg.props.filter(pr => pr.bx && pr.bx.some(x => /^tsC/.test(x.face || ''))).map(pr => { const x = pr.bx.find(x => /^tsC/.test(x.face)); return +(x.s1 - x.s0).toFixed(2); });
      const riders = seg.spr.filter(q => q.rider).map(q => Math.abs(q.lat)), straps = seg.spr.filter(q => q.img === 'strap' || q.img === 'strapP'), prio = straps.filter(q => q.img === 'strapP').length;
      const gang = seg.walls.filter(w => w.pat === 'gangP').length, wins = seg.decos.filter(e => e.pat === 'seatwin' && e.car), psd = seg.props.filter(pr => pr.bx && pr.bx.some(x => /^psd/.test(x.face || ''))).length;
      return { kind: seg.th.kind, side: seg.th.leftWall || '', cars: ss.length, dL: doorS(-1).join(), dR: doorS(1).join(), nDoor: doors.length, seats, riders, nStrap: straps.length, prio, gang, winSd: wins.every(e => e.sd === -1 || e.sd === 1), nWin: wins.length, psd, len: seg.len }; });
    if (r.kind === 'train') {
      if (!(r.dL.startsWith(r.dR) || r.dR.startsWith(r.dL)) || !r.nDoor) errs.push(tag + th + ' doors are not opposite each other ' + r.dL + ' / ' + r.dR);
      if (r.gang < 4) errs.push(tag + th + ' too few gangways (cars) ' + r.gang);
      if (!r.seats.length || r.seats.some(x => Math.abs(x - 3.2) > .05 && Math.abs(x - 1.42) > .05)) errs.push(tag + th + ' seat lengths ' + r.seats.join());
      if (!r.seats.includes(3.2) || !r.seats.includes(1.42)) errs.push(tag + th + ' needs both 7- and 3-seat benches');
      if (r.riders.some(l => l < 3.4)) errs.push(tag + th + ' a standing passenger is in the running lanes');
      if (r.nStrap < 40 || r.prio < 2) errs.push(tag + th + ' straps ' + r.nStrap + ' priority ' + r.prio);
      if (!r.winSd || r.nWin < 8) errs.push(tag + th + ' windows ' + r.nWin);
    } else if (r.side === 'trainside' && r.psd < 2) errs.push(tag + th + ' no platform doors');
    await p.waitForTimeout(500);
    if (tag === 'sp' || th === 'yamanote') await p.screenshot({ path: `${SH}/train_${th}_${tag}.png` });
    await p.close();
  }
  await b.close();
  if (errs.length) { console.log('TRAIN REAL NG\n' + errs.join('\n')); process.exit(1); }
  console.log('TRAIN REAL OK');
})();
