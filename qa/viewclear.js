// 道の先が見える（2026-11-14 オーナー：「その調子などのせいで先が見づらい」「特にスマホで奥が見づらい」「鳥居のゾーンで前が見えない」）。
// いろいろな画面の大きさで、走っている間に出るもの（お知らせの帯・おしごとのカード・ナイスなどの文字）が、
// 道の先（奥の地平から走る2人の頭まで、道の幅の帯）にかからない。スマホ縦長では頭の上に道が十分見える。鳥居のトンネルではカメラが下がる。
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [], res = {}; let ok = true;
  for (const [w, h, mob] of [[390, 844, 1], [320, 640, 1], [360, 740, 1], [430, 932, 1], [768, 1024, 1], [844, 390, 1], [1280, 800, 0], [1920, 1080, 0]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 99, lang: 'ja', pomMet: 1 })));
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(700); await p.click('#btnStart'); await p.waitForTimeout(1200);
    const r = await p.evaluate(async () => { const D = window.__hayDash, G = D.G, ev = D.ev; G.jumpTo('ginza', 720, 2); G.invT = 99; G.s = 20;
      G.gig = { k: 'call', t: 3, b0: G.stats.hay - 12, n: 12 }; ev("bannerNow('50 COMBO!', 'その調子！ とても長いお知らせの文が入ってもだいじょうぶかどうか', 'good')");
      await new Promise(r => setTimeout(r, 900)); G.mode = 'pause'; await new Promise(r => setTimeout(r, 100));
      const sg = G.segs[G.ci], at = (s, lat, y) => { const q = ev('segPos')(sg, s, lat); return ev('spriteAt')(q[0], (G.ey || 0) + y, q[1]); };
      const head = at(G.s, 0, 1.05), far = at(G.s + 70, 0, 0), l = at(G.s + 12, -2.4, 0), rr = at(G.s + 12, 2.4, 0);
      const box = { x0: Math.min(l.sx, rr.sx), x1: Math.max(l.sx, rr.sx), y0: far.sy - 30, y1: head.sy }; // the road ahead, from the far end to the runners' heads
      const hits = []; for (const id of ['banner', 'gigCard']) { const e = document.getElementById(id); if (!e || e.hidden) continue; const q = e.getBoundingClientRect(); if (q.height < 2) continue; if (q.right > box.x0 && q.left < box.x1 && q.bottom > box.y0 && q.top < box.y1) hits.push(id + ' ' + [q.left, q.top, q.right, q.bottom].map(Math.round)); }
      { const bq = document.getElementById('banner').getBoundingClientRect(), gq = document.getElementById('gigCard').getBoundingClientRect(); if (!document.getElementById('gigCard').hidden && bq.height > 2 && bq.bottom > gq.top + 1 && bq.top < gq.bottom - 1) hits.push('banner over the work card'); }
      { const pb = document.getElementById('pauseBtn').getBoundingClientRect(); for (const id of ['banner', 'gigCard']) { const q = document.getElementById(id).getBoundingClientRect(); if (q.height > 2 && q.right > pb.left && q.left < pb.right && q.bottom > pb.top && q.top < pb.bottom) hits.push(id + ' over the pause button'); } }
      const cy = ev('cheerY')(.3) - 70; if (cy < box.y1) hits.push('cheer text rises to ' + Math.round(cy));
      const torii = await (async () => { G.mode = 'play'; G.jumpTo('nezu', 720, 2); G.invT = 99; G.s = 30; await new Promise(r => setTimeout(r, 1500)); return +(G.camTall || 0).toFixed(2); })();
      return { box: [box.x0, box.y0, box.x1, box.y1].map(Math.round), roadAboveHeads: Math.round(head.sy - far.sy), hits, tall: innerHeight / innerWidth > 1.6, camTallTorii: torii }; });
    const good = !r.hits.length && r.roadAboveHeads > h * (r.tall ? .14 : .15) && (!r.tall || r.camTallTorii < .2);
    if (!good) ok = false; res[w + 'x' + h] = r; await p.close();
  }
  console.log(JSON.stringify(res)); console.log(ok && !errs.length ? 'VIEW CLEAR OK' : 'VIEW CLEAR NG ' + errs.slice(0, 2).join(' | ')); await b.close();
})();
