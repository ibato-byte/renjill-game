// ゴーストと競走（B-32）：ベストの走りがうすいうさぎで前を走る・上に「ベストより」の差・練習では出ない・設定で消せる・良い走りだけ上書き・引き継ぎコードに入らない
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', 1);
    const n = 400, d = Array.from({ length: n }, (_, i) => i * 12), l = Array.from({ length: n }, (_, i) => i % 20 < 10 ? '1' : '2').join('');
    localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, best: 50000, ghost: { s: 50000, d, l } })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900);
  await p.click('#btnStart'); await p.waitForTimeout(3500);
  const r = {};
  r.run = await p.evaluate(() => { const D = window.__hayDash, G = D.G; return { on: !!G.ghost, seen: G.ghostSeen || 0, hud: document.getElementById('hGhost').textContent, rec: G.ghRec.d.length, lanes: G.ghRec.l.length }; });
  // a better run replaces the ghost, a worse one does not
  r.save = await p.evaluate(() => { const D = window.__hayDash, G = D.G, SV = D.SV; G.score = 100; D.ev('ghostSave()'); const kept = SV.ghost.s; G.score = 60000; D.ev('ghostSave()'); return { kept, now: SV.ghost.s, n: SV.ghost.d.length, xfer: D.ev("XFER_FIELDS_SKIP.includes('ghost')") }; }).catch(e => ({ err: e.message }));
  // practice and the setting turn it off
  r.prac = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; G.practiceNext = 'bedroom'; D.ev('startRun()'); await new Promise(r => setTimeout(r, 600)); return !!G.ghost; });
  r.optOff = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; D.SV.opt.ghost = false; D.ev('startRun()'); await new Promise(r => setTimeout(r, 600)); const off = !G.ghost && document.getElementById('hGhost').textContent === ''; D.SV.opt.ghost = true; return off; });
  console.log(JSON.stringify(r));
  const ok = r.run.on && r.run.seen > 0 && /ベスト|best/i.test(r.run.hud) && r.run.rec >= 5 && r.run.rec === r.run.lanes && r.save.kept === 50000 && r.save.now === 60000 && r.save.n >= 5 && r.save.xfer && r.prac === false && r.optOff;
  console.log(ok && !errs.length ? 'GHOST OK' : 'GHOST NG ' + errs.join(' | ')); await b.close();
})();
