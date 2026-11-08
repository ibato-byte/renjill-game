// ゲームサイト CrazyGames の中で遊ぶとき（?ref=crazygames）だけの動き。自社サイト版は何も変わらない（広告も SDK も読み込まない）
// - CrazyGames の中：外へ出るリンク（共有・公式サイト・遊び方・ランキングページ・SNS）が見えない・押しても開かない
// - 遊んでいる間だけ gameplayStart、終わると gameplayStop を伝える
// - 広告は feed.json の cgAds が true のときだけ、続ける画面の「広告を見て続ける」（見た人だけ）。最後まで見たら続きから走れる
const { chromium } = require('playwright'); const path = require('path');
const FAKE = `window.CrazyGames={SDK:{environment:'crazygames',calls:[],init(){return Promise.resolve()},game:{loadingStop(){CrazyGames.SDK.calls.push('loadingStop')},gameplayStart(){CrazyGames.SDK.calls.push('start')},gameplayStop(){CrazyGames.SDK.calls.push('stop')}},ad:{requestAd(k,cb){CrazyGames.SDK.calls.push('ad:'+k);cb.adStarted&&cb.adStarted();setTimeout(()=>cb.adFinished&&cb.adFinished(),300)}}}};`;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  for (const [mode, ads] of [['own', 0], ['cg', 0], ['cg', 1]]) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(mode + ' ' + e.message));
    let sdkAsked = 0; await p.route('**/sdk.crazygames.com/**', r => { sdkAsked++; r.fulfill({ contentType: 'text/javascript', body: FAKE }); });
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await ctx.addInitScript(([ads]) => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', 1); localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, bank: 0, clovers: 0 })); if (ads) localStorage.setItem('rjFeed', JSON.stringify({ cgAds: true })); }, [ads]);
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html' + (mode === 'cg' ? '?ref=crazygames' : '')); await p.waitForTimeout(1500);
    const outLinks = () => p.evaluate(() => [...document.querySelectorAll('a[href^="http"]')].filter(a => a.offsetParent !== null && a.getClientRects().length).map(a => a.id || a.textContent.trim().slice(0, 20)));
    if (mode === 'own') { if (sdkAsked) errs.push('own site loaded the portal SDK'); const l = await outLinks(); if (!l.length) errs.push('own site lost its links'); await ctx.close(); continue; }
    if (!sdkAsked) errs.push('SDK not loaded in CrazyGames');
    const l1 = await outLinks(); if (l1.length) errs.push('title links out: ' + l1.join(','));
    await p.click('#btnStart'); await p.waitForTimeout(2500);
    let calls = await p.evaluate(() => CrazyGames.SDK.calls.slice()); if (!calls.includes('start')) errs.push('no gameplayStart ' + calls);
    // crash on purpose: the retry screen
    await p.evaluate(() => { const H = window.__hayDash; H.G.reviveN = 3; H.SV.clovers = 0; H.SV.bank = 0; H.G.hay = 0; H.ev("die('obstacle')"); });
    await p.waitForTimeout(2600);
    calls = await p.evaluate(() => CrazyGames.SDK.calls.slice()); if (!calls.includes('stop')) errs.push('no gameplayStop ' + calls);
    const st = await p.evaluate(() => ({ rv: !document.getElementById('sRevive').hidden, ad: !document.getElementById('btnRvAd').hidden, res: !document.getElementById('sResult').hidden, mode: window.__hayDash.G.mode }));
    if (!ads) { if (st.ad || st.rv) errs.push('ad offered while ads are off ' + JSON.stringify(st)); const l2 = await outLinks(); if (st.res && l2.length) errs.push('result links out: ' + l2.join(',')); }
    else {
      if (!st.rv || !st.ad) errs.push('no "watch an ad" on the retry screen ' + JSON.stringify(st));
      else { await p.click('#btnRvAd'); await p.waitForTimeout(1200); const m = await p.evaluate(() => window.__hayDash.G.mode); calls = await p.evaluate(() => CrazyGames.SDK.calls.slice()); if (m !== 'play' || !calls.includes('ad:rewarded')) errs.push('rewarded revive failed ' + m + ' ' + calls); }
    }
    await p.screenshot({ path: (process.env.SHOTS || path.resolve(__dirname, '../shots')) + `/portal_${ads ? 'ads' : 'basic'}.png` });
    await ctx.close();
  }
  console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'PORTAL OK no errors'); await b.close();
})();
