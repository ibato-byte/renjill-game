// 長く走っても絵のメモリが増え続けない（2026-11-12 の報告：8日目に「ここで一区切り」で終わった）。
// スマホの設定で、たくさんの場所を通り過ぎても、家具・看板などの絵の合計が上限の近くでとどまる。
// 手放した絵も、その場所にまた来たら描き直される（道の物が消えない）。
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 99, lang: 'ja', pomMet: 1 })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800); await p.click('#btnStart'); await p.waitForTimeout(1200);
  const r = await p.evaluate(async () => { const D = window.__hayDash, G = D.G, th = Object.keys(D.ev('THEMES'));
    const pa = () => { const S = D.ev('SPR'); let px = 0; for (const k in S) if (k.startsWith('pa|') && S[k] && S[k].width) px += S[k].width * S[k].height; return px / 1e6; };
    let peak = 0; const first = th[0];
    for (const t of th.slice(0, 70)) { try { G.jumpTo(t, 700, 3); } catch (e) { } await new Promise(r => setTimeout(r, 450)); peak = Math.max(peak, pa()); }
    // back to a street seen before (one with painted furniture): its pictures are painted again
    let keys = new Set(), S = null;
    for (const t of th.slice(0, 70)) { G.jumpTo(t, 700, 3); keys = new Set(); for (const q of G.segs[G.ci].spr || []) if (String(q.img).startsWith('pa|')) keys.add(q.img); for (const pr of G.segs[G.ci].props || []) for (const q of pr.spr || []) if (String(q.img).startsWith('pa|')) keys.add(q.img); if (keys.size >= 3 && [...keys].some(k => D.ev('SPR_OFF').has(k))) break; }
    await new Promise(r => setTimeout(r, 2500)); S = D.ev('SPR');
    const missing = [...keys].filter(k => !(S[k] && S[k].width));
    return { peak: +peak.toFixed(1), max: D.ev('SPR_MAXPX') / 1e6, off: D.ev('SPR_OFF').size, keys: keys.size, missing: missing.length }; });
  const ok = r.peak <= r.max * 1.35 && r.off > 0 && r.keys >= 3 && r.missing === 0 && !errs.length;
  console.log(JSON.stringify(r), errs.slice(0, 2).join('|')); console.log(ok ? 'MEM LONG OK' : 'MEM LONG NG'); await b.close();
})();
