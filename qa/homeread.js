// スタート画面とそこから開く画面の「字の大きさ・読みやすさ」の下限（2026-11-28 [よみ]）
// きっかけ：オーナー「スマホ画面だと文字が小さくて見づらい。スタンプ帳など字が小さい」。左右の丸いボタンの名前が 10px、今日の札の見出しが 9.5px、
// スタンプ帳の番号が 9px など、9〜10.5px の字がたくさんあった。左右の子（クリ・ユズ）も、左右のボタンの列のうしろに 4〜6 割かくれていた。
// 見る物：
//  (1) スマホ（6 つの大きさ × 日本語・英語）：スタート画面の見えている字は 11px 以上。左右のボタンの名前は 12px 以上（高さ 600 までは 11px 以上）で 1 行。
//      今日の札の見出しは 11px 以上、昇進の帯の「次の昇進まで」は 12px 以上。音・設定・言葉のボタンは高さ 40px 以上
//  (2) スマホ：左右の子が、左右のボタンの列のうしろに 3 割より多くかくれていない
//  (3) ホームから開く 10 の画面（ミッション〜ユズに聞く）：見えている字は 11px 以上（地図の字・絵の中は外す）
//  (4) パソコン：左右のボタンの名前・今日の札の見出しは 13px 以上
//  (5) 設定の「文字の大きさ：大きめ」：スタート画面のボタンの名前は 13px 以上・音と設定の丸に字が出ない
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../dist') + '/test.html';
const SV = { tutDone: 1, nickAsked: 1, runs: 40, best: 1655381, bank: 4834, pomMet: 3, pomTold: 1, char: 'ren', missions: { slots: [{ id: 'vegRun', target: 16, base: 3890, prog: 116, done: 1 }, { id: 'flyTot', target: 7, base: 28, prog: 0, done: 0 }, { id: 'treatTot', target: 15, base: 83, prog: 0, done: 0 }] }, stamps: { ginza: 1, asakusa: 1 }, zukan: { hay: 1, komatsuna: 1 } };
// 見えている字（文字の入った要素）の大きさを集める。絵（svg・canvas）の中・題字の 1 字ずつの飾り・下の小さなリンクは外す
const texts = root => { const out = []; const walk = n => { for (const c of n.childNodes) { if (c.nodeType === 3) { if (!c.textContent.trim()) continue; const e = c.parentElement; if (!e || e.closest('svg,canvas,.logo h1,.small-print,[hidden],[aria-hidden="true"]')) continue; if (!e.offsetParent && getComputedStyle(e).position !== 'fixed') continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < .2 || parseFloat(cs.fontSize) === 0) continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; out.push({ fs: parseFloat(cs.fontSize), t: c.textContent.trim().slice(0, 18), id: (e.id ? '#' + e.id : '') + '.' + String(e.className).slice(0, 16) }); } else if (c.nodeType === 1) walk(c); } }; walk(root); return out; };
(async () => { const bad = [], log = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const open = async (w, h, lang) => { const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 900, hasTouch: w < 900 }); const p = await ctx.newPage(); p.on('pageerror', e => bad.push(w + 'x' + h + ' エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(([sv, l]) => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify(Object.assign({}, sv, { lang: l }))), [SV, lang]); await p.goto(URL); await p.waitForTimeout(1800); await p.evaluate(() => document.querySelectorAll('.toast,.ttoast').forEach(x => x.remove())); await p.evaluate(() => Promise.race([Promise.all(document.getAnimations().filter(a => { try { return isFinite(a.effect.getComputedTiming().endTime); } catch (e) { return false; } }).map(a => a.finished.catch(() => { }))), new Promise(r => setTimeout(r, 3000))])); return [ctx, p]; }; /* 出てくる動きが終わってから測る（homescan の R119 と同じ） */
  // (1)(2) スマホのスタート画面
  for (const lang of ['ja', 'en']) for (const [w, h] of [[390, 844], [430, 932], [375, 667], [390, 664], [360, 740], [320, 568]]) { const [ctx, p] = await open(w, h, lang); const tag = lang + ' ' + w + 'x' + h + '：';
    const r = await p.evaluate(([fn, h]) => { const texts = eval('(' + fn + ')'); const st = document.getElementById('sTitle'); const all = texts(st); const q = s => [...st.querySelectorAll(s)].filter(e => e.offsetParent && !e.hidden);
      const labels = q('.row .mini em, .row2 .sub:not(.tog .sub)').map(e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return { t: e.textContent.trim(), fs: parseFloat(cs.fontSize), lines: Math.round((r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / parseFloat(cs.lineHeight)) }; });
      const tt = q('#tToday .tt-c small').map(e => parseFloat(getComputedStyle(e).fontSize)), cr = q('#tCareer .career small').map(e => parseFloat(getComputedStyle(e).fontSize));
      const btns = q('#btnMute, #btnSet, #btnLangTop').map(e => [e.id, Math.round(e.getBoundingClientRect().height)]);
      return { small: all.filter(x => x.fs < 11).slice(0, 5), labels, tt, cr, btns }; }, [texts.toString(), h]);
    for (const x of r.small) bad.push(tag + '11px より小さい字「' + x.t + '」' + x.fs + 'px ' + x.id);
    const lmin = h > 600 ? 12 : 11; for (const l of r.labels) { if (l.fs < lmin) bad.push(tag + 'ボタンの名前「' + l.t + '」が ' + l.fs + 'px（' + lmin + 'px 以上）'); if (l.lines > 1) bad.push(tag + 'ボタンの名前「' + l.t + '」が ' + l.lines + ' 行に折れている'); }
    for (const f of r.tt) if (f < 11) bad.push(tag + '今日の札の見出しが ' + f + 'px'); for (const f of r.cr) if (f < (w <= 340 ? 11 : 12)) bad.push(tag + '「次の昇進まで」が ' + f + 'px');
    for (const [id, bh] of r.btns) if (bh < 40) bad.push(tag + id + ' の高さが ' + bh + 'px（40px 以上）');
    if (lang === 'ja' && h > 600) { const c = await p.evaluate(() => { const H = window.__hayDash; if (!H) return null; const G = H.ev('G'); const at = o => { const s = H.ev('spriteAt')(o.wx, o.wy, o.wz); return s ? { x: s.sx, k: s.k } : null; }; const box = s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; };
        return { cs: [G.follow, G.pom && G.pom.show ? G.pom : null].filter(Boolean).map(at).filter(Boolean), L: box('#sTitle .row').right, R: box('#sTitle .row2').left }; });
      if (c) for (const q of c.cs) { const a = q.x - q.k * .45, z = q.x + q.k * .45, hid = q.x < w / 2 ? Math.max(0, Math.min(z, c.L) - a) : Math.max(0, z - Math.max(a, c.R)), k = hid / (z - a); log.push(tag + '左右の子のかくれ ' + Math.round(k * 100) + '%'); if (k > .3) bad.push(tag + '左右の子が、ボタンの列のうしろに ' + Math.round(k * 100) + '% かくれている（3 割まで）'); } }
    await ctx.close(); }
  // (3) ホームから開く画面
  for (const [lang, w, h] of [['ja', 390, 844], ['en', 320, 568]]) for (const id of ['btnMissions', 'btnStamps', 'btnZukan', 'btnShop', 'btnHow', 'btnRank', 'btnRecords', 'btnPractice', 'btnSet', 'btnChat']) { const [ctx, p] = await open(w, h, lang);
    const ok = await p.evaluate(id => { const e = document.getElementById(id); if (!e) return false; e.click(); return true; }, id); if (!ok) { await ctx.close(); continue; } await p.waitForTimeout(700);
    const r = await p.evaluate(fn => { const texts = eval('(' + fn + ')'); const sc = [...document.querySelectorAll('.screen')].find(s => !s.hidden && s.id !== 'sTitle'); if (!sc) return null; return texts(sc).filter(x => x.fs < 11).slice(0, 4); }, texts.toString());
    if (r == null) bad.push(lang + ' ' + id + '：画面が開かない'); else for (const x of r) bad.push(lang + ' ' + w + 'x' + h + ' ' + id + ' の画面：11px より小さい字「' + x.t + '」' + x.fs + 'px ' + x.id);
    await ctx.close(); }
  // (4) パソコン
  { const [ctx, p] = await open(1280, 800, 'ja'); const r = await p.evaluate(() => { const st = document.getElementById('sTitle'); const f = s => [...st.querySelectorAll(s)].filter(e => e.offsetParent).map(e => parseFloat(getComputedStyle(e).fontSize)); return { lb: f('.row .mini em, .row2 .sub'), tt: f('#tToday .tt-c small') }; });
    for (const f of r.lb) if (f < 13) bad.push('1280x800：ボタンの名前が ' + f + 'px（13px 以上）'); for (const f of r.tt) if (f < 13) bad.push('1280x800：今日の札の見出しが ' + f + 'px（13px 以上）'); await ctx.close(); }
  // (5) 設定の「文字の大きさ：大きめ」：スタート画面の名前が 1 段大きく、音・設定の丸に字が出ない（2026-11-28 手元で「音：オン」の字が丸の上に出た）
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(sv => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify(Object.assign({}, sv, { lang: 'ja', opt: { big: true } }))), SV); await p.goto(URL); await p.waitForTimeout(1800);
    const r = await p.evaluate(() => { const st = document.getElementById('sTitle'); return { big: document.documentElement.classList.contains('bigtext'), lb: [...st.querySelectorAll('.row .mini em, .row2>.sub')].filter(e => e.offsetParent).map(e => parseFloat(getComputedStyle(e).fontSize)), tog: [...st.querySelectorAll('.tog .sub')].map(e => parseFloat(getComputedStyle(e).fontSize)) }; });
    if (!r.big) bad.push('大きめ：html に bigtext が付かない'); for (const f of r.lb) if (f < 13) bad.push('大きめ：ボタンの名前が ' + f + 'px（13px 以上）'); for (const f of r.tog) if (f > 0) bad.push('大きめ：音・設定の丸に字が出ている（' + f + 'px）'); await ctx.close(); }
  await b.close(); console.log(log.join('\n')); if (bad.length) { console.log('HOMEREAD NG ' + bad.length + '\n' + [...new Set(bad)].slice(0, 40).join('\n')); process.exit(1); } console.log('HOMEREAD OK'); })();
