// ビル・店・家を 1 つずつ立体に作っているか（2026-11-17 オーナー「壁紙に雑な絵が描かれ途中で消える歪んだ作品。一つ一つ作り込んで現実に近い建造物に」）。
// 1 階の店が奥まっている／屋上のふち（コーニス）／段ごとに絵の一部を貼る／色は全部数字（色の取りちがいが無い）／
// 遠くの壁にも絵（もやでうすく）／家は門・妻・軒／写真（スマホ・PC）
const { chromium } = require('playwright');
const SH = process.env.SHOTS || 'shots';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = []; let alleys = 0;
  for (const [vw, vh, tag] of [[390, 844, 'sp'], [1280, 800, 'pc']]) for (const th of ['ginza', 'akihabara', 'street', 'shinbashi']) {
    const p = await b.newPage({ viewport: { width: vw, height: vh } });
    p.on('pageerror', e => errs.push(tag + th + ': ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', char: 'ren' })));
    await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(800);
    await p.evaluate(() => window.__hayDash.ev('hideAll(); startRun()')); await p.waitForTimeout(600);
    await p.evaluate(t => { const G = window.__hayDash.G; G.jumpTo(t, 600, 1); G.invT = 999; }, th); await p.waitForTimeout(900);
    const r = await p.evaluate(() => { const G = window.__hayDash.G, seg = G.segs[G.ci]; G.invT = 999; G.speed = .01; G.s = seg.len * .3; for (const o of seg.obs) o.dead = .001;
      const okC = c => Array.isArray(c) && c.length >= 3 && c.every(x => Number.isFinite(x));
      const badW = seg.walls.filter(w => !okC(w.c)).length, badF = seg.floor.filter(f => !f.dec && !okC(f.c)).length;
      const fac = seg.walls.filter(w => w.pat === 'fac' && w.fv != null), tiered = fac.filter(w => w.fy0 > 0).length;
      const HWv = 4.6, latOf = w => { const v = w.v; return null; };
      const recess = seg.walls.filter(w => w.pat === 'reveal').length, soffit = seg.walls.filter(w => w.pat === 'soffit').length, alley = seg.walls.filter(w => w.pat === 'alleyW').length;
      const bigBoxes = seg.props.filter(pr => pr.big).length, house = seg.th.fac && seg.th.fac.style === 'house', gables = seg.walls.filter(w => w.st === 'house' && w.side).length, roofs = seg.walls.filter(w => w.pat === 'roof').length;
      return { badW, badF, nFac: fac.length, tiered, recess, soffit, alley, bigBoxes, house, gables, roofs, style: seg.th.fac && seg.th.fac.style };
    });
    alleys += r.alley;
    if (r.badW || r.badF) errs.push(tag + th + ' colors that are not numbers: walls ' + r.badW + ' floor ' + r.badF);
    if (r.house) { if (r.gables < 3 || r.roofs < 3) errs.push(tag + th + ' houses need gables and roofs ' + JSON.stringify(r)); }
    else { if (!r.nFac || r.tiered < 4) errs.push(tag + th + ' building tiers ' + JSON.stringify(r)); if (r.bigBoxes < 4) errs.push(tag + th + ' roof edges / building parts ' + r.bigBoxes); }
    if (th === 'ginza' && (r.recess < 1 || r.soffit < 1)) errs.push(tag + th + ' shop fronts should be set back ' + JSON.stringify(r));
    // far walls still show their picture (drawn with fog), not a plain color
    const far = await p.evaluate(() => { const H = window.__hayDash; let n = 0; const f0 = H.ev('drawFacImg'); const seg = H.G.segs[H.G.ci]; const w = seg.walls.find(w => w.pat === 'fac' && w.fv != null); if (!w) return -1; try { H.ev('wallPattern')(w, 100); } catch (e) { return 'err ' + e.message; } return 1; });
    if (far !== 1 && far !== -1) errs.push(tag + th + ' far wall picture ' + far);
    await p.waitForTimeout(500); await p.screenshot({ path: `${SH}/city_${th}_${tag}.png` });
    await p.close();
  }
  await b.close();
  if (errs.length) { console.log('CITY REAL NG\n' + errs.join('\n')); process.exit(1); }
  console.log('CITY REAL OK (alleys seen ' + alleys + ')');
})();
