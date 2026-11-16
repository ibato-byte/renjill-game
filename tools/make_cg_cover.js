// CrazyGames のサムネイル（16x9 1920x1080・2x3 800x1200・1x1 800x800）を作る（2026-11-16：前の絵はクリック率 1.0%＝下位20%）。
// 使い方: python3 build.py && node tools/make_cg_cover.js <出力フォルダ> <フォントのフォルダ（make_og.js と同じ）> [場所:時刻 例 kaihin:1066]
// ゲームの1コマ（キャラなし）＋前向きのレンとジル（ゲームと同じ描き方）＋ロゴ。 game frame (no players) + front-facing bunnies + logo. Label zone (top-left) kept clear.
const { chromium } = require('playwright'); const fs=require('fs'), path=require('path');
const [OUT, FD0, ST] = process.argv.slice(2); const FD = path.resolve(FD0); fs.mkdirSync(OUT, { recursive: true });
const HTML = 'file://' + path.resolve(__dirname, '../dist/test.html');
const SIZES = { '16x9':[1920,1080], '2x3':[800,1200], '1x1':[800,800] };
const [tid, clock] = (ST||'kaihin:1066').split(':');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined, args:['--allow-file-access-from-files'] });
  for (const [name,[W,H]] of Object.entries(SIZES)) {
    const ctx = await b.newContext({ viewport: { width: W/2, height: H/2 }, deviceScaleFactor: 2, locale:'en-US' }); const p = await ctx.newPage();
    p.on('pageerror', e => console.log('ERR', e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/firestore.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'en', pomMet: 1, best: 52000, char: 'ren', mute: 1 })));
    await p.clock.install(); await p.goto(HTML); await p.waitForTimeout(2500);
    await p.evaluate(() => { const H = window.__hayDash; H.setQ(0); for (const t of document.querySelectorAll('.toast')) t.remove(); document.getElementById('btnStart').click(); }); await p.waitForTimeout(1500);
    await p.clock.pauseAt(new Date(await p.evaluate(() => Date.now()) + 500));
    await p.evaluate(a => { const H = window.__hayDash; H.ev(`(()=>{const s0=newSeg(null,{t:'${a.tid}',d:90},{t0:${a.clock},day:1});G.segs=[s0];G.ci=0;G.s=4;G.lane=1;G.lat=0;G.fork=null;G.plan=dayPlan(1).filter(x=>!x.fork);G.planClock=s0.t1;ensureSegs();const p=segPos(s0,G.s,0);G.rx=p[0];G.rz=p[1];G.camYaw=0;G.ey=G.camE=null;G.invT=9;G.mode='play';G.speed=Math.max(G.speed,13);G.chaseT=0;G.chaseVis=0;onEnterSeg(s0);})()`); }, { tid, clock });
    for (let k = 0; k < 40; k++) await p.clock.runFor(33);
    const art = await p.evaluate(() => { const H = window.__hayDash, G = H.G; G.player.show=false; G.follow.show=false; G.pom.show=false; H.ev('render()');
      return { bg: document.getElementById('cv').toDataURL('image/jpeg',.95), ren: H.ev("bunHi('ren','happy',BUN.ren.front_happy,2.6).toDataURL()"), jill: H.ev("bunHi('jill','happy',BUN.jill.front_happy,2.6).toDataURL()"), hay: H.ev("(()=>{try{return document.getElementById('tHayIco').src}catch(e){return ''}})()") }; });
    await ctx.close();
    const pg = await b.newPage({ viewport: { width: W, height: H } });
    const land = W > H, sq = W === H;
    const logo = land ? 230 : sq ? 150 : 160;
    const css = `@font-face{font-family:D;src:url("file://${FD}/@fontsource/dela-gothic-one/files/dela-gothic-one-latin-400-normal.woff2")}
    @font-face{font-family:Z;font-weight:900;src:url("file://${FD}/@fontsource/zen-maru-gothic/files/zen-maru-gothic-latin-900-normal.woff2")}
    html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden}
    .bg{position:absolute;inset:0;background:url(${art.bg}) center/cover}
    .sh{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,rgba(40,20,10,.35),rgba(40,20,10,0) 55%)}
    .t{position:absolute;${land?'right:70px;top:70px;text-align:right':'left:0;right:0;top:'+(sq?150:190)+'px;text-align:center'}}
    .k{font:900 ${land?44:34}px Z;color:#fff;letter-spacing:.16em;-webkit-text-stroke:${land?12:10}px #3A2414;paint-order:stroke fill}
    .l{font:400 ${logo}px/0.98 D;color:#fff;-webkit-text-stroke:${logo*.13}px #3A2414;paint-order:stroke fill;text-shadow:0 ${logo*.07}px 0 #3A2414}
    .l b{font-weight:400;color:#FFC93C}
    img.c{position:absolute;filter:drop-shadow(0 18px 10px rgba(30,15,5,.4))}
    .hay{position:absolute;width:${land?22:14}px;height:${land?110:70}px;border-radius:10px;background:linear-gradient(#B8D96A,#7FA83A);box-shadow:0 0 0 ${land?5:4}px #3A2414}`;
    // bunnies: Ren big, Jill smaller, both "jumping" (tilted, lifted); hay sticks flying around
    const R = land ? {h:760,l:180,b:-20} : sq ? {h:440,l:40,b:-30} : {h:560,l:20,b:-20};
    const J = land ? {h:560,l:760,b:40} : sq ? {h:330,l:430,b:20} : {h:420,l:420,b:60};
    fs.writeFileSync(path.join(OUT, '_c.html'), `<style>${css}</style><div class="bg"></div><div class="sh"></div>
      <img class="c" src="${art.ren}" style="height:${R.h}px;left:${R.l}px;bottom:${R.b}px;transform:rotate(-6deg)">
      <img class="c" src="${art.jill}" style="height:${J.h}px;left:${J.l}px;bottom:${J.b}px;transform:rotate(7deg)">
      <div class="t"><div class="k">REN &amp; JILL</div><div class="l">HAY<br><b>DASH!</b></div></div>`); await pg.goto('file://' + path.resolve(OUT, '_c.html'));
    await pg.evaluate(()=>document.fonts.ready); await pg.waitForTimeout(500);
    await pg.screenshot({ path: path.join(OUT, `cg_${tid}_${name}.png`) }); await pg.close();
  }
  await b.close();
})();
