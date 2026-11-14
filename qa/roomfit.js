// 時計の下の場所名が、どの場所・どの季節・4言語でも2行に入って「…」で切れない（320・390 幅）（2026-11-09）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  for (const w of [320, 390]) { const p = await b.newPage({ viewport: { width: w, height: 760 } }); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 })));
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(700); await p.addStyleTag({ content: '#hRoom{letter-spacing:.09em}' }); /* 端末によって字の幅が広い（CI で英語がはみ出した）：広めにして確かめる */ await p.click('#btnStart'); await p.waitForTimeout(600);
    bad.push(...await p.evaluate(w => { const D = window.__hayDash, G = D.G; G.mode = 'pause'; const out = [], el = document.getElementById('hRoom'), TH = D.ev('THEMES');
      for (const lang of ['ja', 'en', 'zh', 'ko']) { D.ev(`LANG = '${lang}'`);
        for (const tid of Object.keys(TH)) for (let day = 1; day <= 4; day++) { const th = D.ev('themeFor')(tid, day); D.ev('roomFit')(el, th, th.climb ? ' 120m' : '');
          if (el.scrollHeight > el.clientHeight + 2) out.push(w + ' ' + lang + ' ' + tid + ' "' + el.textContent + '"');
          /* 2026-11-15：折り返しの位置（前は「渋谷スクランブル交差／点」のように 1 文字だけ下の行に落ちた）。1 文字だけの行がない・カタカナ語や英数字の途中で切れていない */
          if (lang !== 'en') { const tx = el.firstChild, s = el.textContent; if (tx && tx.nodeType === 3 && s.length > 3) { const r = document.createRange(), tops = []; for (let i = 0; i < s.length; i++) { if (s[i] === '\n' || s[i] === ' ') { tops.push(null); continue; } r.setStart(tx, i); r.setEnd(tx, i + 1); const q = r.getClientRects()[0]; tops.push(q ? Math.round(q.top) : null); }
            const idx = tops.map((t, i) => t == null ? -1 : i).filter(i => i >= 0), first = tops[idx[0]], n1 = idx.filter(i => Math.abs(tops[i] - first) < 4).length, n2 = idx.length - n1;
            if (n2 && (n1 < 2 || n2 < 2)) out.push(w + ' ' + lang + ' ' + tid + ' 1文字だけの行 "' + s.replace('\n', '／') + '"（' + n1 + '+' + n2 + '）');
            if (n2) { const last1 = idx[n1 - 1], next = idx[n1], a = s[last1], c = s[next], kata = x => /[\u30A1-\u30FA\u30FC-\u30FF]/.test(x), asc = x => /[A-Za-z0-9]/.test(x), joint = D.ev('KATA_CUT').some(wd => { const j = wd.indexOf('|'); return s.slice(0, next).endsWith(wd.slice(0, j)) && s.slice(next).startsWith(wd.slice(j + 1)); }); if (next === last1 + 1 && !joint && ((kata(a) && kata(c)) || (asc(a) && asc(c)))) out.push(w + ' ' + lang + ' ' + tid + ' 語の途中で折り返し "' + s.slice(0, next) + '／' + s.slice(next) + '"'); } } } } }
      D.ev("LANG = 'ja'"); return [...new Set(out)]; }, w)); await p.close(); }
  { // 同じ場所でも、季節が変わったら時計の下の名前も変わる（前の名前が残っていた。2026-11-10）
    const p = await b.newPage({ viewport: { width: 390, height: 844 } }); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 })));
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(700); await p.click('#btnStart'); await p.waitForTimeout(500);
    const names = []; for (const d of [2, 4]) { await p.evaluate(d => { const G = window.__hayDash.G; G.jumpTo('ueno', 640, d, 'ueno'); G.invT = 99; }, d); await p.waitForTimeout(900); names.push(await p.evaluate(() => document.getElementById('hRoom').textContent.replace(/\n/g, '') + '|' + window.__hayDash.ev("L(curSeg().th)"))); }
    for (const n of names) { const [shown, want] = n.replace(/\n/g, '').split('|'); /* 折り返しの印（改行）は名前の一部ではない */ if (!want.startsWith(shown.slice(0, 4)) && !shown.startsWith(want.slice(0, 4))) bad.push('stale room name ' + n); }
    if (names[0].split('|')[0] === names[1].split('|')[0]) bad.push('room name did not change with season ' + names.join(' / ')); await p.close(); }
  console.log(bad.length ? 'ROOMFIT NG ' + bad.length + ' ' + bad.slice(0, 12).join(' / ') : 'ROOMFIT OK'); await b.close(); })();
