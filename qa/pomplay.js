// ポムで走れる：会う前はカギ付き（？？？）、会ったら選べて、走れて、ほお袋ボーナスが出る。日英・スマホ/PC。
const { chromium } = require('playwright');
const SH = process.env.SHOTS || 'shots';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = []; const out = {};
  for (const [vw, vh, tag] of [[390, 844, 'sp'], [1280, 800, 'pc']]) for (const lang of ['ja', 'en']) {
    const p = await b.newPage({ viewport: { width: vw, height: vh } });
    p.on('pageerror', e => errs.push(tag + lang + ': ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(400);
    // 1) never met Pom: no Pom card at all (two characters only)
    await p.evaluate(l => { const D = window.__hayDash; D.SV.tutDone = 1; D.SV.nickAsked = 1; D.SV.lang = l; D.SV.pomMet = 0; D.SV.char = 'ren'; D.ev('save(); LANG = SV.lang; refreshTitle()'); }, lang);
    await p.waitForTimeout(300);
    const lk = await p.evaluate(() => ({ visible: !!document.querySelector('#pickPom').offsetParent, cols: getComputedStyle(document.querySelector('.chars')).gridTemplateColumns.split(' ').length }));
    if (lk.visible || lk.cols !== 2) errs.push(tag + lang + ' HIDDEN ' + JSON.stringify(lk));
    if (tag === 'sp' && lang === 'ja') await p.screenshot({ path: SH + '/pom_hidden.png' });
    // 2) met: unlocked, pick, title, run
    await p.evaluate(() => { const D = window.__hayDash; D.ev('toastClear()'); D.SV.pomMet = 1; D.SV.pomTold = 0; D.ev('save(); refreshTitle()'); });
    await p.waitForTimeout(900);
    const toast = await p.evaluate(() => [...document.querySelectorAll('.toast')].map(x => x.textContent).join('|'));
    if (!/ポム|Pom/.test(toast)) errs.push(tag + lang + ' NO UNLOCK TOAST ' + toast);
    await p.click('#pickPom'); await p.waitForTimeout(700);
    const ti = await p.evaluate(() => { const G = window.__hayDash.G; return { char: G.char, sv: window.__hayDash.SV.char, P: G.player.who, F: G.follow.who, M: G.pom.who, nm: document.querySelector('#nmPom').textContent, pressed: document.querySelector('#pickPom').getAttribute('aria-pressed'), over: [...document.querySelectorAll('.char')].some(e => e.scrollWidth > e.clientWidth + 1), vis: !!document.querySelector('#pickPom').offsetParent }; });
    if (ti.char !== 'pom' || ti.P !== 'pom' || ti.F !== 'ren' || ti.M !== 'jill' || ti.pressed !== 'true' || ti.over || !ti.vis) errs.push(tag + lang + ' TITLE ' + JSON.stringify(ti));
    await p.screenshot({ path: SH + `/pom_title_${tag}_${lang}.png` });
    await p.click('#btnStart'); await p.evaluate(() => { window.__hayDash.G.invT = 999; }); await p.waitForTimeout(2500);
    await p.keyboard.press('ArrowUp'); await p.waitForTimeout(180);
    await p.screenshot({ path: SH + `/pom_jump_${tag}_${lang}.png` });
    const r = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; const s0 = G.score; for (let i = 0; i < 61; i++) D.ev("pomPouch(1)"); await new Promise(r => setTimeout(r, 120));
      return { mode: G.mode, P: G.player.who, F: G.follow.who, offAtStart: G.follow.off && !G.follow.show, pomOn: G.pom.on, puff: G.stats.pomPuff || 0, bonus: G.score - s0, say: G.player.say, peek: !!G.pomPeek }; });
    if (r.P !== 'pom' || r.pomOn || r.puff < 1 || r.bonus < 600 || r.peek || !r.offAtStart) errs.push(tag + lang + ' RUN ' + JSON.stringify(r));
    // the bunnies catch up one by one; then all three run together. No perks stack (Ren's hay, Jill's power-ups, Pom's companion x1.2): all three are equally hard
    const m = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; G.invT = 99; G.mateAt = [G.t + .3, G.t + 2.2]; await new Promise(r => setTimeout(r, 1200));
      const one = { mode: G.mode, t: G.t.toFixed(1), at: G.mateAt.map(x => x.toFixed(1)), F: G.follow.who, off: G.follow.off, n: (G.mates.ren ? 1 : 0) + (G.mates.jill ? 1 : 0), banner: (document.querySelector('#banner') || {}).textContent || '' };
      await new Promise(r => setTimeout(r, 2400)); for (let i = 0; i < 30 && !(G.follow.show && G.pom.show); i++) await new Promise(r => setTimeout(r, 100)); /* right after a corner the buddies are briefly behind it */ return { one, F: G.follow.who, Fshow: G.follow.show, Mshow2: G.pom.show, M: G.pom.who, Mon: G.pom.on, Mshow: G.pom.show, mates: G.mates, jillPerk: D.ev("hasPerk('jill')"), renPerk: D.ev("hasPerk('ren')"), pomOn: D.ev('pomOn()'), order: G.mateOrder }; });
    if (m.one.n !== 1 || m.one.off || m.one.F !== m.order[0] || m.M !== m.order[1] || !m.Mon || !m.Fshow || !m.Mshow2 || m.jillPerk || m.renPerk || m.pomOn) errs.push(tag + lang + ' MATES ' + JSON.stringify(m));
    out['m' + tag + lang] = m;
    await p.waitForTimeout(1500); await p.screenshot({ path: SH + `/pom_team_${tag}_${lang}.png` });
    await p.waitForTimeout(300); await p.screenshot({ path: SH + `/pom_puff_${tag}_${lang}.png` });
    // end the run: result screen works for Pom (captions, ranking icon)
    await p.evaluate(() => window.__die && window.__die('obstacle')); await p.waitForTimeout(1500); await p.evaluate(() => { const D = window.__hayDash; if (D.G.mode === 'dead') D.ev('hideAll(); endRun()'); }); await p.waitForTimeout(800);
    const res = await p.evaluate(() => ({ cap: document.querySelector('#resEn').textContent, mode: window.__hayDash.G.mode }));
    if (!res.cap) errs.push(tag + lang + ' RESULT ' + JSON.stringify(res));
    // 3) the save keeps Pom after reload; a broken save with char pom but never met falls back to Ren
    await p.reload(); await p.waitForTimeout(500);
    const kept = await p.evaluate(() => window.__hayDash.G.char);
    if (kept !== 'pom') errs.push(tag + lang + ' NOT KEPT ' + kept);
    const fb = await p.evaluate(() => { const D = window.__hayDash; D.ev("svFrom(Object.assign(JSON.parse(JSON.stringify(SV)), { pomMet: 0, char: 'pom' }))"); const c = D.SV.char; D.ev("SV.pomMet = 1; SV.char = 'pom'; save()"); return c; });
    if (fb !== 'ren') errs.push(tag + lang + ' FALLBACK ' + fb);
    out[tag + lang] = { lk, ti, r, res };
    await p.close();
  }
  console.log(JSON.stringify(out)); console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'POM PLAY OK no errors'); await b.close();
})();
