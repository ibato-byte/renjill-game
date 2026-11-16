// ホーム画面で跳ねるのは、選んだ子だけ（2026-11-17 オーナー：「選択したキャラクター以外も跳ねている」「選択したキャラクターだけが跳ねるように」）。
// 確かめること：3 人をそれぞれ選び、8 秒ぶんの時間で、選んだ子は上下に動き（跳ねる）、ほかの 2 人の高さは変わらない
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 3, char: 'ren' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1800); const res = {};
  for (const ch of ['ren', 'jill', 'pom']) { await p.click({ ren: '#pickRen', jill: '#pickJill', pom: '#pickPom' }[ch]); await p.waitForTimeout(300);
    const r = await p.evaluate(() => { const H = window.__hayDash, G = H.ev('G'); const seen = {}; const add = (o) => { if (!o || !o.who) return; const k = o.who, base = H.ev('segPos')(G.segs[0], 0, 0)[2]; (seen[k] = seen[k] || []).push(o.wy); };
      for (let i = 0; i < 240; i++) { G.t += 1 / 30; H.ev('titleFrame(1/30)'); add(G.player); add(G.follow); if (G.pom.show) add(G.pom); }
      const out = {}; for (const k in seen) out[k] = +(Math.max(...seen[k]) - Math.min(...seen[k])).toFixed(4); return { me: G.char, range: out }; });
    res[ch] = r; for (const k in r.range) { if (k === r.me) { if (!(r.range[k] > .02)) bad.push(ch + ' を選んだのに跳ねない（' + r.range[k] + '）'); } else if (r.range[k] > .001) bad.push(ch + ' を選んだ時、' + k + ' も跳ねている（' + r.range[k] + '）'); } }
  await b.close(); if (bad.length) { console.log('TITLEHOP NG\n' + bad.join('\n') + '\n' + JSON.stringify(res)); process.exit(1); } console.log('TITLEHOP OK ' + JSON.stringify(res)); })();
