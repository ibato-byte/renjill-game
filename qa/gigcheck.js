// 走っている途中のおしごと（2026-11-08）：単調にならないよう、30〜45秒ごとに短い「おしごと」が来る。
// 社長が見てる（ぶつからない）／おつかい（チモシーを集める）／書類の山（ナイスを決める）／差し入れ（チモシー2倍）。
// 成功でボーナス、失敗でもランは続く。表示（カード）が日英・スマホとPCで切れない。チュートリアル中・フィーバー中は来ない。
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = []; const ok = {};
  for (const [lang, w, h] of [['ja', 390, 844], ['en', 390, 844], ['en', 1280, 800], ['ko', 320, 640]]) {
    const tag = lang + w + ':';
    const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(tag + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(l => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, best: 5000, clovers: 9, bank: 99999, lang: l, daily: (d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate())(new Date()) })); }, lang);
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800);
    await p.evaluate(() => window.__hayDash.ev('hideAll(); startRun()')); await p.waitForTimeout(500);
    ok[tag + 'notAtStart'] = await p.evaluate(() => !window.__hayDash.G.gig && window.__hayDash.G.gigNext >= 20);
    // it comes by itself
    ok[tag + 'comes'] = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; G.invT = 99; G.gigNext = .2; await new Promise(r => setTimeout(r, 900)); return !!G.gig; });
    // none during fever
    ok[tag + 'noFever'] = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; G.gig = null; G.fever = 3; G.gigNext = .1; await new Promise(r => setTimeout(r, 500)); const r = !G.gig; G.fever = 0; return r; });
    const res = {};
    for (const k of ['boss', 'call', 'memo', 'rain']) for (const want of [true, false]) {
      if (k === 'rain' && !want) continue;
      res[k + want] = await p.evaluate(async ([k, want]) => { const D = window.__hayDash, G = D.G, ev = D.ev;
        G.mode = 'play'; G.invT = 99; G.gig = null; G.gigLast = ['boss', 'call', 'memo', 'rain'].filter(x => x !== k).join(); // only k is left to pick
        ev('G.gigLast = "zz"'); const keys = Object.keys(ev('GIGS')); let tries = 0; do { G.gig = null; G.gigLast = 'zz'; ev('gigStart()'); } while (G.gig.k !== k && ++tries < 60);
        await new Promise(r => setTimeout(r, 120));
        const card = document.querySelector('#gigCard'), shown = !card.hidden, txt = card.textContent, cut = [...card.querySelectorAll('b')].some(e => e.scrollWidth > e.clientWidth + 1);
        const sc0 = G.score, hay0 = G.hay;
        if (want) { if (k === 'boss' || k === 'rain') G.gig.t = ev('GIGS')[k].dur - .05; if (k === 'call') G.stats.hay += 40; if (k === 'memo') G.stats.nice = (G.stats.nice || 0) + 3; }
        else { if (k === 'boss') { G.invT = 0; ev('stumble()'); G.invT = 99; G.chaseT = 0; } else G.gig.t = 99; }
        await new Promise(r => setTimeout(r, 250));
        return { shown, txt, cut, done: !G.gig, gain: G.score - sc0, gigs: G.stats.gigs || 0, next: G.gigNext, mode: G.mode }; }, [k, want]);
    }
    for (const [key, r] of Object.entries(res)) {
      const want = key.endsWith('true');
      ok[tag + key] = r.shown && !r.cut && r.done && r.next >= 25 && r.mode === 'play' && (want ? (key.startsWith('rain') ? true : r.gain >= 400) : r.gain < 400) && r.txt.length > 3;
      if (!ok[tag + key]) console.log(tag, key, JSON.stringify(r));
    }
    // snack time doubles hay (and plain time does not)
    ok[tag + 'rainHay'] = await p.evaluate(() => { const D = window.__hayDash, G = D.G, ev = D.ev; const hk = Object.keys(ev('ITEMS')).find(k => ev('ITEMS')[k].kind === 'hay' && !ev('ITEMS')[k].gold);
      G.gig = null; let h0 = G.hay; ev('collect')({ type: hk }, ev('curSeg()')); const one = G.hay - h0;
      G.gig = { k: 'rain', t: 0, b0: 0, n: 0 }; h0 = G.hay; ev('collect')({ type: hk }, ev('curSeg()')); const two = G.hay - h0; G.gig = null; return one === 1 && two === 2; });
    // a picture of the card
    await p.evaluate(() => { const D = window.__hayDash, G = D.G; G.gig = { k: 'call', t: 4, b0: G.stats.hay - 12, n: 12 }; });
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.resolve(__dirname, '../shots') + `/gig_${lang}_${w}.png` });
    await p.close();
  }
  console.log(JSON.stringify(ok));
  console.log(Object.values(ok).every(Boolean) && !errs.length ? 'GIG OK' : 'GIG NG ' + errs.slice(0, 3).join(' | '));
  await b.close();
})();
