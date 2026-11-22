// クリのあいさつ（「先輩、お先っす！」）：歩道から走って出て、となりの車線で並んで走りながら言い、加速して走りぬける。
// 空中にうかない・道の上で止まったまま近づいてこない・横にすべらない・言う時も足が動いている、を見張る（2026-11-17 オーナー「並走しながら言うように」）
const { chromium } = require('playwright');
const SH = process.env.SHOTS || 'shots';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = []; let shot = 0;
  for (const [vw, vh, tag] of [[390, 844, 'sp'], [1280, 800, 'pc']]) {
    const p = await b.newPage({ viewport: { width: vw, height: vh } });
    p.on('pageerror', e => errs.push(tag + ': ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 3, char: 'ren' })));
    await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(900);
    await p.evaluate(() => window.__hayDash.ev('hideAll(); startRun()')); await p.waitForTimeout(700);
    await p.evaluate(() => { const H = window.__hayDash, G = H.G; G.jumpTo('ginza', 100, 1); G.invT = 999; }); await p.waitForTimeout(800);
    await p.evaluate(() => { const H = window.__hayDash, G = H.G, seg = H.ev('curSeg()'); for (const o of seg.obs) o.dead = .001; G.pomPeek = { seg, s: G.s + 36, dir: 1, b: { who: 'pom', view: 'back', ph: 0, look: 0, show: false, depth: 0 } }; });
    const S = await p.evaluate(() => new Promise(res => { const H = window.__hayDash, G = H.G, out = []; let n = 0;
      const tick = () => { const k = G.pomPeek; G.invT = 999; if (k && k.ph && k.b.show) { const seg = k.seg, gp = H.ev('segPos')(seg, k.ps, k.lat); out.push({ ph: k.ph, v: k.v, vl: k.vl, rel: k.ps - G.s, up: k.b.wy - gp[2], pose: k.b.pose || '', say: k.b.say, look: k.b.look, gs: G.speed }); }
        if (++n < 520 && !(k && k.ph === 'gone')) requestAnimationFrame(tick); else res(out); }; requestAnimationFrame(tick); }));
    if (process.env.DBG) console.log(tag, S.map(x => x.ph[0] + x.rel.toFixed(0)).join(' '));
    const side = S.filter(x => x.ph === 'side'), ins = S.filter(x => x.ph === 'in');
    if (S.length < 30) errs.push(tag + ' too few frames ' + S.length);
    if (!side.length) errs.push(tag + ' never ran alongside');
    if (S.some(x => x.v < .5)) errs.push(tag + ' standing still on the road (slides toward the camera)');
    if (S.some(x => Math.abs(x.vl) > x.v * .25 + .05)) errs.push(tag + ' slides sideways faster than it runs forward');
    if (S.some(x => x.up > .02 && x.ph !== 'out' && x.ph !== 'in')) errs.push(tag + ' floats above the ground');
    if (side.some(x => Math.abs(x.v - x.gs) > 3)) errs.push(tag + ' alongside but not at the same speed');
    if (side.some(x => Math.abs(x.rel) > 3.2)) errs.push(tag + ' alongside but too far ' + Math.max(...side.map(x => Math.abs(x.rel))).toFixed(1));
    if (!side.some(x => x.say && /^rlook/.test(x.pose))) errs.push(tag + ' does not say the line while running (run-look frame)');
    if (S.some(x => x.look > 0)) errs.push(tag + ' uses the standing look-back picture');
    if (!S.some(x => x.ph === 'out' && x.v > x.gs + 2)) errs.push(tag + ' does not dash away');
    if (tag === 'sp') { await p.screenshot({ path: SH + '/pom_peek_sp.png' }); shot = 1; }
    await p.close();
  }
  await b.close();
  if (errs.length) { console.log('KURI PEEK NG\n' + errs.join('\n')); process.exit(1); }
  console.log('KURI PEEK OK');
})();
