// PC（マウスとキーボード）ではチュートリアルと案内を矢印キーで、スマホではスワイプで出す（2026-11-16：ゲームサイトから来る人はほぼ PC で、
// 1 回で離れる人が 6 割。PC でも「スワイプして」と出ていた）。4 言語 × PC／スマホ。
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = [], out = {};
  const KEY = { ja: /キー/, en: /press/i, zh: /鍵/, ko: /키/ }, SWIPE = { ja: /スワイプ/, en: /swipe/i, zh: /滑動/, ko: /스와이프/ };
  for (const dev of ['pc', 'phone']) for (const lang of ['ja', 'en', 'zh', 'ko']) {
    const ctx = await b.newContext(dev === 'pc' ? { viewport: { width: 1280, height: 800 } } : { ...devices['iPhone 13'] }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(dev + lang + ': ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
    await p.evaluate(l => { const D = window.__hayDash; D.SV.lang = l; D.SV.nickAsked = 1; D.ev('LANG = SV.lang; save(); refreshTitle()'); }, lang);
    await p.click('#btnStart'); const t0 = Date.now(), seen = [];
    while (Date.now() - t0 < 20000 && seen.length < 4) {
      const s = await p.evaluate(() => { const c = document.querySelector('#tutCue'); return { mode: window.__hayDash.G.mode, show: /show/.test(c.className), tx: (c.querySelector('span') || {}).textContent || '' }; });
      if (s.mode !== 'play') break; if (s.show && s.tx && !seen.includes(s.tx)) seen.push(s.tx); await p.waitForTimeout(120);
    }
    const hints = await p.evaluate(() => ['hintMove', 'hintTurn', 'hintSwipe', 'hintFork'].map(k => window.__hayDash.ev(`t('${k}')`)));
    const want = dev === 'pc' ? KEY[lang] : SWIPE[lang], not = dev === 'pc' ? SWIPE[lang] : KEY[lang];
    if (seen.length < 3) errs.push(`${dev} ${lang} cues seen ${seen.length}`);
    for (const x of seen.concat(hints)) { if (!want.test(x) && !/[←→↑↓]/.test(x)) errs.push(`${dev} ${lang} NOT ${want}: ${x}`); if (not.test(x)) errs.push(`${dev} ${lang} WRONG ${not}: ${x}`); }
    if (lang !== 'ja' && seen.concat(hints).some(x => /[ぁ-んァ-ン]/.test(x))) errs.push(`${dev} ${lang} JAPANESE LEFT: ${seen.concat(hints).join(' / ')}`);
    out[dev + '_' + lang] = seen; await ctx.close();
  }
  console.log(JSON.stringify(out)); console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'KB CUE OK no errors'); await b.close();
})();
