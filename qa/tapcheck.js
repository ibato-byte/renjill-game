// 押しやすさと文字の切れの点検（2026-11-08 の総点検から）：日英 × 320・390 幅で、題名・各パネル・結果画面を開き
// - ボタンが小さすぎない（高さ 32px 以上・幅 30px 以上）
// - 文字が途中で切れていない（はみ出しを隠している要素の中身が入りきる）
const { chromium } = require('playwright'); const path = require('path');
const AUD = () => {
  const inHidden = e => { for (let n = e; n; n = n.parentElement) if (n.hidden) return true; return false; };
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > .05; };
  const nm = e => (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]) + ' "' + (e.innerText || '').trim().slice(0, 20).replace(/\n/g, ' ') + '"';
  const out = [];
  for (const e of document.querySelectorAll('button')) { if (inHidden(e) || !vis(e)) continue; const r = e.getBoundingClientRect(); if (r.height < 32 || r.width < 30) out.push('SMALL ' + nm(e) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
  for (const e of document.querySelectorAll('body *')) { if (inHidden(e) || !vis(e) || e.closest('#cv')) continue; const cs = getComputedStyle(e); const txt = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (txt && (cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 1) out.push('CLIP ' + nm(e) + ' ' + e.scrollWidth + '>' + e.clientWidth); }
  return [...new Set(out)];
};
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const found = []; const errs = [];
  for (const w of [320, 390]) for (const lang of ['ja', 'en']) {
    const ctx = await b.newContext({ viewport: { width: w, height: w === 320 ? 568 : 844 }, locale: lang === 'ja' ? 'ja-JP' : 'en-US' }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(l => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: l, best: 123456, bank: 4321, mlevel: 8 })); }, lang);
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800);
    const rec = async k => { await p.waitForTimeout(300); for (const x of await p.evaluate(AUD)) found.push(`${w} ${lang} ${k}: ${x}`); };
    await rec('title');
    for (const id of ['btnMissions', 'btnShop', 'btnRank', 'btnSet']) { const ok = await p.evaluate(id => { const e = document.getElementById(id); if (!e || e.hidden) return 0; e.click(); return 1; }, id); if (!ok) continue; await rec(id); await p.evaluate(() => { ['sPanel', 'sChat', 'sName'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); }); }
    await p.click('#btnStart'); await p.waitForTimeout(900);
    await p.evaluate(() => window.__hayDash.ev('G.invT = 0; G.lives = 0; G.reviveN = 9; hideAll(); endRun()')); await p.waitForTimeout(1300); await rec('result');
    await ctx.close();
  }
  console.log(found.slice(0, 30).join('\n'));
  console.log(!found.length && !errs.length ? 'TAP OK' : 'TAP NG ' + found.length + ' ' + errs.slice(0, 2).join(' | '));
  await b.close();
})();
