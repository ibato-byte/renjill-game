// 「ここで一区切り（記録は残ります）」で勝手に終わらない（2026-11-14 オーナー：途中で終わって記録は保存される、は意味不明。起きないようにして）。
// 今の道も同じ場所の新しい道も直せないときでも、ほかの道から同じ日・同じ時刻で走り続ける。死んだのに画面が出ないときも「一区切り」ではなく、ふつうの続ける／結果の画面。
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1, clovers: 9 })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(700); await p.click('#btnStart'); await p.waitForTimeout(1500);
  const r = {};
  // newStreet can not work (its street cannot be built): the run still goes on
  r.fresh = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; G.invT = 9; D.ev('G.day = 6; G.clock = 489'); D.ev('window.__ns = newStreet'); D.ev('newStreet = () => false');
    for (let i = 0; i < 4; i++) { G.s = NaN; await new Promise(r => setTimeout(r, 500)); }
    await new Promise(r => setTimeout(r, 1200)); const s0 = G.s; await new Promise(r => setTimeout(r, 1500));
    return { mode: G.mode, fin: window.__finish || 0, fresh: window.__freshRoad || 0, moved: G.s > s0 + 1, day: G.day }; });
  // dead with no screen shown: the normal screen, not 「一区切り」
  r.dead = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; D.ev("hideAll(); G.cause = 'obstacle'; G.mode = 'dead'"); await new Promise(r => setTimeout(r, 2500));
    const shown = ['sRevive', 'sResult'].filter(id => !document.getElementById(id).hidden); return { shown, cap: (document.getElementById('sResult').innerText || '').slice(0, 30), cause: G.cause }; });
  const ok = r.fresh.mode === 'play' && r.fresh.fin === 0 && r.fresh.fresh > 0 && r.fresh.moved && r.dead.shown.length && r.dead.cause !== 'rescue' && !/一区切り/.test(r.dead.cap) && !errs.length;
  console.log(JSON.stringify(r), errs.join('|')); console.log(ok ? 'KEEP RUN OK' : 'KEEP RUN NG'); await b.close(); })();
