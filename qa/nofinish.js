// 長く遊ぶと「早退しました」で終わる報告（2026-11-10）：走りが何度か壊れても、安全網は終わらせずに新しい道から続ける。
// 終わるしかないときも「早退」とは言わない（自分でやめたときだけ）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(700); await p.click('#btnStart'); await p.waitForTimeout(1500);
  const r = {};
  for (let i = 0; i < 5; i++) { await p.evaluate(() => { const G = window.__hayDash.G; G.invT = 5; G.s = NaN; }); await p.waitForTimeout(700); } // 15 秒のうちに 5 回こわれる
  await p.waitForTimeout(1500);
  Object.assign(r, await p.evaluate(() => { const G = window.__hayDash.G; return { mode: G.mode, rescue: window.__rescue || 0, newStreet: window.__newStreet || 0, finish: window.__finish || 0, s: G.s, tid: G.segs[G.ci] && G.segs[G.ci].tid, log: localStorage.getItem('rjErrLog') || '' }; }));
  await p.waitForTimeout(2500); r.moved = await p.evaluate(s => window.__hayDash.G.s > s + 1, r.s);
  // どうしても終わるとき：見出しは「早退」ではない
  await p.evaluate(() => window.__hayDash.ev("finishRun('test')")); await p.waitForTimeout(1500);
  r.cap = await p.evaluate(() => document.getElementById('sResult').innerText.slice(0, 80));
  const ok = r.mode === 'play' && r.newStreet > 0 && r.finish === 0 && r.moved && /rescue:/.test(r.log) && !/早退/.test(r.cap) && /一区切り/.test(r.cap) && !errs.length;
  delete r.log; console.log(JSON.stringify(r), errs.join('|')); console.log(ok ? 'NOFINISH OK' : 'NOFINISH NG'); await b.close(); })();
