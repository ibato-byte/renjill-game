// キャラクターが透明になって消えたままにならない（2026-11-13 の報告：プレイ中に消え、選択画面でも消えたまま）。
// iPhone がメモリ不足などで保存してある絵を空にしたのと同じ状態を作り（キャラクターの絵を全部消す）、
// ①題名画面のカード ②プレイ中 ③絵の全部が消えたとき、のどれでも2秒以内に描き直されることを確かめる。
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200);
  const ink = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++; return n; };
  const wipe = all => p.evaluate(all => { const D = window.__hayDash; for (const w of ['ren', 'jill', 'pom']) for (const k in D.BUN[w]) { const c = D.BUN[w][k]; c.getContext('2d').clearRect(-999, -999, 9999, 9999); }
    if (all) { const S = D.ev('SPR'); for (const k in S) { try { S[k].getContext('2d').clearRect(-999, -999, 9999, 9999); } catch (e) { } } } }, all);
  const cards = () => p.evaluate(`(${ink})(document.querySelector('#cvRen')) + ',' + (${ink})(document.querySelector('#cvJill')) + ',' + (${ink})(document.querySelector('#cvPom'))`).then(s => s.split(',').map(Number));
  const frames = () => p.evaluate(`(() => { const D = window.__hayDash, ink = ${ink}; let blank = 0, n = 0; for (const w of ['ren', 'jill', 'pom']) for (const k in D.BUN[w]) { n++; if (ink(D.BUN[w][k]) < 500) blank++; } return { n, blank, hay: ink(D.ev('SPR').hay), fix: D.ev('PIC_FIX') }; })()`);
  const r = {};
  r.card0 = await cards(); r.f0 = await frames();
  // ① 題名画面：消す → すぐは影だけ → 2秒以内に戻る
  await wipe(false); await p.waitForTimeout(60); r.cardGone = await cards(); await p.waitForTimeout(1900); r.card1 = await cards(); r.f1 = await frames();
  // ② プレイ中：消す → 戻る（走っている絵も、ふり返りの絵も）
  await p.click('#btnStart'); await p.waitForTimeout(1500); await p.evaluate(() => { window.__hayDash.G.invT = 99; });
  await wipe(false); await p.waitForTimeout(1900); r.f2 = await frames(); r.mode2 = await p.evaluate(() => window.__hayDash.G.mode);
  // ③ 全部の絵が消えた（アイテムの絵も）→ キャラクターもアイテムも戻る。走りは続く
  await wipe(true); await p.waitForTimeout(1900); r.f3 = await frames(); r.mode3 = await p.evaluate(() => window.__hayDash.G.mode);
  await p.waitForTimeout(1500); r.frameErr = await p.evaluate(() => window.__frameErr || 0); r.fixEnd = await p.evaluate(() => window.__hayDash.ev('PIC_FIX'));
  // 何も消えていないときは描き直さない（毎秒描き直して重くならない）
  await p.waitForTimeout(2500); r.fixIdle = await p.evaluate(() => window.__hayDash.ev('PIC_FIX'));
  console.log(JSON.stringify(r));
  const full = c => c.every(x => x > 2500);
  const ok = full(r.card0) && r.f0.blank === 0 && r.f0.fix === 0 && r.cardGone.every((x, i) => x < r.card0[i] * .5) && full(r.card1) && r.f1.blank === 0 && r.f1.fix === 1
    && r.f2.blank === 0 && r.mode2 === 'play' && r.f3.blank === 0 && r.f3.hay > 500 && r.mode3 === 'play' && !r.frameErr && r.fixEnd === 3 && r.fixIdle === 3;
  console.log(ok && !errs.length ? 'VANISH OK' : 'VANISH NG ' + errs.join(' | ')); await b.close();
})();
