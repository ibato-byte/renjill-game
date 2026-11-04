// いくら遊んでも手に入らない物がないか：えさ図鑑の全種類が道に出て、拾うと図鑑に載る／観光スタンプが全部の場所に出る／実績の条件がそろう
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(800);
  const r = await p.evaluate(() => window.__hayDash.ev(`(() => {
    const spawned = {}, stampMiss = [];
    G.planDay = 1; G.t = 200;
    for (const de of [300, 1500, 4000]) { G.distEst = de;
      for (const th of Object.keys(THEMES)) { let st = 0;
        for (let k = 0; k < 8; k++) { let s; try { const s0 = newSeg(null, { t: 'ginza', d: 40 }, { t0: 700, day: 1 }); s = newSeg(s0, { t: th, d: 60 }, { t0: 480 + (k * 97) % 600, day: 1 + (k % 3) }); } catch (e) { continue; }
          for (const it of s.items) { spawned[it.type] = 1; if (it.type === 'stamp') st++; } }
        if (THEMES[th].stamp && !st) stampMiss.push(de + ':' + th); } }
    // collecting each kind puts it in the book
    const keep = JSON.stringify(SV); SV.zukan = {}; G.mode = 'play'; G.invT = 99;
    const seg = G.segs[G.ci] || newSeg(null, { t: 'ginza', d: 40 }, { t0: 700, day: 1 });
    const notBooked = [];
    for (const id of ZUKAN_ORDER) { try { collect({ type: id, s: 0, lane: 1, got: 0 }, seg); } catch (e) { } if (!SV.zukan[id]) notBooked.push(id); }
    const allBook = ACH.find(a => a.id === 'bookAll').ok({}, SV);
    svFrom(JSON.parse(keep));
    return { neverSpawned: ZUKAN_ORDER.filter(id => !spawned[id]), stampMiss, notBooked, allBook, stampCount: STAMP_ORDER.length };
  })()`));
  console.log(JSON.stringify(r));
  if (r.neverSpawned.length) errs.push('never on the road: ' + r.neverSpawned.join(','));
  if (r.notBooked.length) errs.push('picked up but not in the food book: ' + r.notBooked.join(','));
  if (!r.allBook) errs.push('the "complete the food book" title cannot be earned');
  if (r.stampMiss.length) errs.push('places with no stamp: ' + r.stampMiss.slice(0, 20).join(','));
  console.log(errs.length ? 'FAIL ' + errs.join(' | ') : 'REACH OK no errors'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
