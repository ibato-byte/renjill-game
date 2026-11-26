const { chromium } = require('playwright'); const path = require('path');
// スタート画面の「切れ・はみ出し・重なり」を、言語 × 画面の大きさ × 状態で調べる（2026-11-26 [スタート S97]）。
// きっかけ：スタート画面の 100 の直しの中で、568x320 で「練習」「きろく」が画面の外に出て押せない・600x960 で「ベスト」の札がロゴにかさなる・640x900 で下の列が切れる、を人の目では見のがしていた。
// 見る物：①文字が横に切れていないか ②画面の外に出ていないか（下の小さなリンクの段は、もともと下へ送って見る物なので外す）③数字の札・ボタン・ロゴ・キャラクターがたがいにかさなっていないか
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const out = {};
  const svs = [{ tutDone: 1, nickAsked: 1, runs: 40, best: 123456, bank: 2350 }, { tutDone: 1, nickAsked: 1, runs: 300, pomMet: 1, best: 29000000, bank: 1234567, stamps: { ginza: 1 } }];
  for (const lang of ['ja', 'en']) for (const [w, h] of [[320, 568], [393, 852], [600, 960], [640, 900], [768, 1024], [1024, 1366], [568, 320], [740, 360], [844, 390], [1024, 768], [1366, 768], [2560, 1080]]) for (let si = 0; si < svs.length; si++) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 900, hasTouch: w < 900 }); const p = await ctx.newPage(); await p.route('**/fonts.googleapis.com/**', r => r.abort()); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(([l, sv]) => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify(Object.assign({}, sv, { lang: l }))); }, [lang, svs[si]]);
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1500); await p.evaluate(si => { document.querySelectorAll('.toast,.ttoast').forEach(x => x.remove()); const rv = document.getElementById('btnRev'); if (si === 1 && rv) rv.hidden = false; }, si); /* [S101] 2 つ目の状態では、金曜だけ出る「逆走デー」のボタンも出して調べる（曜日で結果が変わらないように） */ await p.waitForTimeout(200);
    const bad = await p.evaluate(() => { const bad = [], st = document.getElementById('sTitle'); const vis = e => e.offsetParent && !e.closest('[hidden]') && getComputedStyle(e).visibility !== 'hidden';
      for (const e of st.querySelectorAll('*')) { if (!vis(e) || e.children.length > 3 || e.closest('.small-print')) continue; const cs = getComputedStyle(e), r = e.getBoundingClientRect(); if (!r.width || !e.textContent.trim()) continue;
        if (cs.overflow === 'hidden' && e.scrollWidth > e.clientWidth + 2) bad.push('clip ' + e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 18) + ' "' + e.textContent.trim().slice(0, 20) + '"');
        if (r.right > innerWidth + 1 || r.left < -1 || r.bottom > innerHeight + 1) bad.push('off ' + e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 18) + ' "' + e.textContent.trim().slice(0, 16) + '" ' + Math.round(r.left) + ',' + Math.round(r.bottom)); }
      const boxes = [...st.querySelectorAll('.bank>span:not(.tog), #tCareer .career, #tToday, .row .mini, .row2 .sub, #btnStart, .chars .char, .langtop, .logo h1, #tKeepBtns .sub, .tog .sub')].filter(vis).map(e => [e, e.getBoundingClientRect()]);
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const [a, ra] = boxes[i], [c, rc] = boxes[j]; if (a.contains(c) || c.contains(a)) continue; const ox = Math.min(ra.right, rc.right) - Math.max(ra.left, rc.left), oy = Math.min(ra.bottom, rc.bottom) - Math.max(ra.top, rc.top); if (ox > 4 && oy > 4) bad.push('overlap ' + (a.id || a.className).slice(0, 14) + ' x ' + (c.id || c.className).slice(0, 14) + ' ' + Math.round(ox) + 'x' + Math.round(oy)); }
      return bad; });
    if (bad.length || errs.length) out[lang + ' ' + w + 'x' + h + ' s' + si] = [...new Set(bad)].slice(0, 6).concat(errs.map(e => 'ERR ' + e)); await ctx.close(); }
  const n = Object.keys(out).length; if (n) console.log(JSON.stringify(out, null, 1)); console.log(n === 0 ? 'HOMESCAN OK' : 'HOMESCAN NG ' + n); await b.close(); })();
