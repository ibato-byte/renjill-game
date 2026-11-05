// 「飛び越えられそうなのに飛び越えられない」をなくす：障害物の見た目と当たりの高さが合っていること
// - 「飛びこえる」障害物（low）は普通のジャンプで越えられる高さ（当たりの高さ 1.1 まで）
// - 絵の高さが当たりの高さより低く見えない（絵が低いのに当たりが高いと、越えられそうで越えられない）
// - ランダムで形が変わる障害物（積んだ箱など）も、何度作っても上の2つを守る
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9 })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900);
  const bad = JSON.parse(await p.evaluate(() => window.__hayDash.ev(`JSON.stringify((()=>{const out=new Set();
    for (const k of Object.keys(OBS)) for (let i = 0; i < 200; i++) { let o; try { o = OBS[k](0); } catch (e) { continue; } if (!o || !o.bx) continue;
      let top = 0; for (const b of o.bx) if (b.y0 < 2.5) top = Math.max(top, Math.min(b.y1, 3.5)); if (o.hb) top = o.hb[2];
      const hit = o.car ? .5 : o.hitTop != null ? o.hitTop : top;
      if (o.k === 'low' && !o.full && hit > 1.1) out.add(k + ': jump-over but hit height ' + hit.toFixed(2));
      if (o.art && o.artH != null && o.k !== 'high' && !o.car && o.artH < top - .1) out.add(k + ': drawn ' + o.artH + ' tall but hits at ' + top.toFixed(2));
    } return [...out]; })())`)));
  errs.push(...bad);
  console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'JUMP FAIR OK no errors'); await b.close();
})();
