// 紹介動画の材料：ゲームの画面を 1 コマずつ撮る（1080×1920・30コマ/秒・時計を止めて進めるので、カクつかない）。
// 使い方：node qa/promo_frames.js <出力フォルダ> [dist/test.html]。組み立ては tools/make_promo.py。
// 走る人は自動でよける（当たって光る「無敵」を使わない＝実際の遊びと同じ見た目）。
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const FPS = 30;
// 場面の表：[場所, 時計（分）, 秒, 走る人]
const PLAN = (process.env.PLAN ? JSON.parse(process.env.PLAN) : [
  ['bedroom', 485, 1.0, 'ren'], ['genkan', 492, 1.0, 'ren'], ['street', 500, 1.0, 'ren'],
  ['station', 508, 1.0, 'ren'], ['yamanote', 520, 1.2, 'ren'], ['desk', 640, 0.8, 'ren'],
  ['shibuya', 780, 1.8, 'ren'], ['asakusa', 700, 1.8, 'ren'], ['gyoen', 720, 1.9, 'ren'],
  ['kaihin', 1066, 1.5, 'ren'], ['ginza', 1110, 1.5, 'ren'],
  ['kuko', 600, 1.7, 'pom'], ['akihabara', 1000, 1.8, 'pom'],
]);
(async () => {
  const out = path.resolve(process.argv[2] || '/tmp/promo/frames'), html = path.resolve(process.argv[3] || path.join(__dirname, '../dist/test.html')); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); let n = 0; const log = [];
  for (const who of [...new Set(PLAN.map(x => x[3]))]) {
    const ctx = await b.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale: process.env.LOC || 'ja-JP' });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    if (process.env.FONTS) await require(process.env.FONTS)(p); await p.route('**/firestore.googleapis.com/**', r => r.abort());
    await p.addInitScript(w => { try { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', metPom: 1, pomMet: 1, best: 52000, char: w, mute: 1 })); } catch (e) { } }, who);
    await p.clock.install(); await p.goto('file://' + html); await p.waitForTimeout(2500);
    await p.evaluate(() => { const H = window.__hayDash; H.setQ(0); for (const t of document.querySelectorAll('.toast')) t.remove(); document.getElementById('btnStart').click(); }); await p.waitForTimeout(1500);
    await p.clock.pauseAt(new Date(await p.evaluate(() => Date.now()) + 500));
    for (const [tid, clock, sec] of PLAN.filter(x => x[3] === who)) {
      const i0 = PLAN.findIndex(x => x[0] === tid && x[3] === who); // 出力の順番は表のとおり
      await p.evaluate(a => { const H = window.__hayDash; H.ev(`(()=>{const s0=newSeg(null,{t:'${a.tid}',d:90},{t0:${a.clock},day:1});G.segs=[s0];G.ci=0;G.s=4;G.lane=1;G.lat=0;G.fork=null;G.plan=dayPlan(1).filter(x=>!x.fork);G.planClock=s0.t1;ensureSegs();const p=segPos(s0,G.s,0);G.rx=p[0];G.rz=p[1];G.camYaw=0;G.ey=G.camE=null;G.invT=0;G.mode='play';G.speed=Math.max(G.speed,13);G.chaseT=0;G.chaseVis=0;onEnterSeg(s0);})()`); const G = H.G; G.score = Math.max(G.score, 6200 + a.i0 * 3100); G.hay = Math.max(G.hay, 40 + a.i0 * 22); }, { tid, clock, i0 });
      for (let k = 0; k < 6; k++) await p.clock.runFor(33); // カメラが落ち着くまで（この分は撮らない）
      const dir = path.join(out, String(i0).padStart(2, '0') + '_' + tid); fs.mkdirSync(dir, { recursive: true });
      for (let f = 0; f < Math.round(sec * FPS); f++) {
        await p.evaluate(() => { // 自動でよける：自分の列の先に物があれば、跳ぶ・くぐる・となりへ
          const H = window.__hayDash, G = H.G, seg = G.segs[G.ci]; if (!seg || G.mode !== 'play') return; const LW = H.ev('LANE'), v = G.speed;
          const near = (ln, d) => { let best = null; for (const o of seg.obs) { if (o.dead || o.k === 'deco') continue; const s0 = o.s0 + (o.ds || 0), s1 = o.s1 + (o.ds || 0), c = (ln - 1) * LW; if (s1 < G.s - .4 || s0 > G.s + d) continue; if (c + .42 > o.l0 && c - .42 < o.l1 && (!best || s0 < best.s0)) best = { s0, o }; } return best; };
          const me = near(G.lane, v * .95);
          if (me && !G.botBusy) { const o = me.o, gap = me.s0 - G.s, jump = o.k !== 'high' && (o.hitTop != null ? o.hitTop : o.top) < 1.15 && !o.full, duck = o.k === 'high';
            if (jump) { if (gap < v * .3) { H.act('up'); G.botBusy = 12; } }
            else if (duck && !near(G.lane, 0)) { if (gap < v * .32) { H.act('down'); G.botBusy = 14; } }
            else { const opts = [G.lane - 1, G.lane + 1].filter(l => l >= 0 && l <= 2 && !near(l, v * 1.3)); if (opts.length) { H.act(opts[0] < G.lane ? 'left' : 'right'); G.botBusy = 9; } else if (gap < v * .25) { G.invT = Math.max(G.invT, .5); } } }
          if (!me && !G.botBusy) { // 空いているときは、近くの牧草の列へ寄る（取りながら走る＝実際の遊び方）
            let it = null; for (const x of seg.items) { if (x.got || x.s < G.s + 2.5 || x.s > G.s + v * 1.25) continue; if (!it || x.s < it.s) it = x; }
            if (it && it.lane !== G.lane) { const to = G.lane + Math.sign(it.lane - G.lane); if (!near(to, v * 1.3)) { H.act(to < G.lane ? 'left' : 'right'); G.botBusy = 10; } }
            else if (it && it.y > .9 && it.s - G.s < v * .34 && !G.air) { H.act('up'); G.botBusy = 12; } }
          if (G.botBusy) G.botBusy--; if (G.s > seg.len - 12 && seg.turn && !G.turnQueued) H.act(seg.turn < 0 ? 'left' : 'right'); });
        await p.clock.runFor(f % 3 === 2 ? 34 : 33);
        await p.screenshot({ path: path.join(dir, String(f).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 93 }); n++; }
      const st = await p.evaluate(() => { const G = window.__hayDash.G; return { mode: G.mode, bumps: G.bumps || 0 }; }); log.push(`${tid}:${st.mode}${st.bumps ? ' bumps ' + st.bumps : ''}`);
    }
    if (errs.length) console.log('errors', errs.slice(0, 3)); await ctx.close();
  }
  console.log('frames', n, log.join(' ')); await b.close();
})();
