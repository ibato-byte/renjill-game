// あいことばのかくれんぼ（B-49）：期間中は題名に「？ ？ ？」、走ると「？」の札が1回の走りに1枚まで出る、取ると1文字ずつ、そろうとチモシー、期間外・そろった後は出ない
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', 1); localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', bank: 0 })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900);
  const r = {};
  r.title = await p.evaluate(() => { const D = window.__hayDash; D.ev("FEED = Object.assign({}, FEED || {}, { hunt: { w: 'いいね', hay: 300, from: '2000-01-01', until: '2999-12-31', ep: '了解です' } }); refreshTitle()"); const e = document.getElementById('tHunt'); return { shown: !!e && !e.hidden, txt: e ? e.textContent : '' }; });
  await p.click('#btnStart'); await p.waitForTimeout(800);
  // many streets after the first half-minute: at most one letter card per run
  r.spawn = await p.evaluate(() => { const D = window.__hayDash, G = D.G; G.t = 40; let n = 0; for (let i = 0; i < 60; i++) { const sg = D.ev("newSeg(null, { t: 'ginza', d: 60 }, {})"); n += sg.items.filter(it => it.type === 'kana').length; } return { n, put: G.kanaPut }; });
  r.got = await p.evaluate(() => { const D = window.__hayDash, SV = D.SV; const b0 = SV.bank; const out = []; for (let i = 0; i < 3; i++) { D.ev('kanaGot(100, 100)'); out.push(SV.hunt.got.length); } return { out, done: SV.hunt.done, bank: SV.bank - b0, after: D.ev('huntNow()') }; });
  r.off = await p.evaluate(() => { const D = window.__hayDash; D.ev("FEED.hunt = { w: 'ねこ', hay: 300, from: '2000-01-01', until: '2001-01-01' }"); return D.ev('huntNow()'); });
  console.log(JSON.stringify(r));
  const ok = r.title.shown && /？ ？ ？/.test(r.title.txt) && /了解です/.test(r.title.txt) && r.spawn.n === 1 && r.spawn.put === 1 && r.got.out.join() === '1,2,3' && r.got.done === 1 && r.got.bank === 300 && r.got.after === null && r.off === null;
  console.log(ok && !errs.length ? 'HUNT OK' : 'HUNT NG ' + errs.join(' | ')); await b.close();
})();
