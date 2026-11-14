// 重い端末での画質の自動調整の順番（2026-11-15）：①やわらかい光をやめる → ②絵の細かさを 1 段ずつ下げる（最低 0.7）→ ③演出を減らす（軽いモード）。軽くなったら細かさは戻る（2 回まで）。
//  設定「画質：軽い」は最初から軽いモード。「きれい」はやわらかい光をやめない。
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  const open = async (opt) => { const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(o => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', opt: o })), opt || {}); await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900); return p; };
  { const p = await open(); const r = await p.evaluate(() => window.__hayDash.ev(`(() => { G.lockQ = 0; lowQ = 0; RES_K = 1; DIF_K = 1; QLOG.length = 0; Q_UP = 0; Q_GOOD = 0; const log = []; const st = () => ({ dif: DIF_K, res: +RES_K.toFixed(2), low: lowQ });
      for (let i = 0; i < 7; i++) { qualityStep(1 / 36); log.push(st()); } for (let i = 0; i < 12; i++) qualityStep(1 / 60); log.push(st()); return { log, mode: gfxMode() }; })()`));
    const L = r.log; if (r.mode !== 'auto') bad.push('試験の前提：自動のはず（' + r.mode + '）');
    if (!(L[0].dif === 0 && L[0].res === 1 && L[0].low === 0)) bad.push('① 最初の一段は「やわらかい光をやめる」だけのはず ' + JSON.stringify(L[0]));
    if (!(L[1].res < 1 && L[1].low === 0)) bad.push('② 次は細かさを下げるはず ' + JSON.stringify(L[1])); if (!(L[2].res < L[1].res || L[2].low > 0)) bad.push('② さらに重ければ、もう 1 段 ' + JSON.stringify(L[2]));
    if (L.slice(0, 7).some(x => x.res < .69)) bad.push('② 細かさは 0.7 より下げない'); if (!(L[6].low >= 1)) bad.push('③ ずっと重ければ軽いモードになるはず ' + JSON.stringify(L[6])); await p.close(); }
  { const p = await open(); const r = await p.evaluate(() => window.__hayDash.ev(`(() => { G.lockQ = 0; lowQ = 0; RES_K = 1; DIF_K = 1; Q_UP = 0; Q_GOOD = 0; qualityStep(1 / 36); qualityStep(1 / 36); const down = +RES_K.toFixed(2); for (let i = 0; i < 6; i++) qualityStep(1 / 60); return { down, up: +RES_K.toFixed(2), low: lowQ }; })()`));
    if (!(r.down < 1 && r.up > r.down && r.low === 0)) bad.push('軽くなったら細かさが戻るはず ' + JSON.stringify(r)); await p.close(); }
  { const p = await open({ gfx: 'high' }); const r = await p.evaluate(() => window.__hayDash.ev(`(() => { G.lockQ = 0; lowQ = 0; RES_K = 1; DIF_K = 1; qualityStep(1 / 30.5); return { mode: gfxMode(), dif: DIF_K }; })()`)); if (r.mode !== 'high' || r.dif !== 1) bad.push('「きれい」では、やわらかい光をやめない ' + JSON.stringify(r)); await p.close(); }
  { const p = await open({ gfx: 'low' }); const r = await p.evaluate(() => window.__hayDash.ev(`({ mode: gfxMode(), low: lowQ, dpr: DPR })`)); if (r.mode !== 'low' || !(r.low >= 1) || r.dpr !== 1) bad.push('「軽い」は最初から軽いモード ' + JSON.stringify(r)); await p.close(); }
  await b.close(); if (bad.length) { console.log('QUALITY NG\n' + bad.join('\n')); process.exit(1); } console.log('QUALITY OK');
})();
