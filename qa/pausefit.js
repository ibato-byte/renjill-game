// 一時停止の画面のボタンの文字が切れない（2026-11-15 オーナーの報告：「やめる」を 1 回押した時の確かめの言葉が「もう一度押…」と切れていた）
//  4 言語 × 320・360・393 幅 × ふだんの言葉と確かめの言葉。文字がボタンからはみ出さない・「…」で切られていない・ボタンの高さがそろっている
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [], seen = [];
  for (const lang of ['ja', 'en', 'zh', 'ko']) for (const w of [320, 360, 393]) { const p = await b.newPage({ viewport: { width: w, height: 760 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(l => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: l })), lang);
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800); await p.addStyleTag({ content: '#sPause .btns .sub{letter-spacing:' + (process.env.WIDE || '.14em') + '}' }); /* 端末によって字の幅が広い分 */ await p.click('#btnStart'); await p.waitForFunction(() => window.__hayDash.G.mode === 'play', null, { timeout: 15000 }).catch(() => bad.push(lang + ' ' + w + ' 走り始めない')); await p.waitForTimeout(300);
    await p.evaluate(() => { window.__hayDash.G.invT = 99; document.getElementById('pauseBtn').click(); }); await p.waitForFunction(() => !document.getElementById('sPause').hidden, null, { timeout: 8000 }).catch(() => bad.push(lang + ' ' + w + ' 一時停止の画面が出ない')); await p.waitForTimeout(300);
    const look = tag => p.evaluate(tag => { const out = []; const bs = [...document.querySelectorAll('#sPause .btns .sub')].filter(e => e.offsetParent); if (bs.length < 2) out.push(tag + ' ボタンが見つからない'); const hs = bs.map(e => Math.round(e.getBoundingClientRect().height));
      for (const e of bs) { const cs = getComputedStyle(e), r = document.createRange(); r.selectNodeContents(e); const tr = r.getBoundingClientRect(), er = e.getBoundingClientRect(); if (e.scrollWidth > e.clientWidth + 1 || tr.left < er.left - .5 || tr.right > er.right + .5 || tr.top < er.top - .5 || tr.bottom > er.bottom + .5) out.push(tag + ' 「' + e.textContent + '」がボタンからはみ出す'); if (cs.textOverflow === 'ellipsis') out.push(tag + ' 「…」で切る設定になっている'); }
      return { out, txt: bs.map(e => e.textContent).join('|'), hs }; }, tag);
    const a = await look(lang + ' ' + w + ' ふだん'); bad.push(...a.out);
    await p.evaluate(() => document.getElementById('btnQuit').click()); await p.waitForTimeout(250);
    const c = await look(lang + ' ' + w + ' 確かめ'); bad.push(...c.out); if (c.txt === a.txt) bad.push(lang + ' ' + w + ' 確かめの言葉に変わらない'); if (w === 393) seen.push(lang + ': ' + c.txt);
    if (await p.evaluate(() => window.__hayDash.G.mode) !== 'pause') bad.push(lang + ' ' + w + ' 1 回押しただけで終わった'); await p.close(); }
  await b.close(); console.log(seen.join('\n')); if (bad.length) { console.log('PAUSEFIT NG\n' + [...new Set(bad)].slice(0, 20).join('\n')); process.exit(1); } console.log('PAUSEFIT OK');
})();
