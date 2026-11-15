// 電車は、線路のある場所だけを走る（2026-11-16 の報告：「公園で電車が通るのはおかしい」）。
// 原因 1：公園の道にも、くじ引きで「線路の橋（上を電車が横切る）」が出ていた。
// 原因 2：高架の上を走る電車が、高架の先（となりの場所の空）まで 60〜70m はみ出して走っていた。
// 確かめ方：(1) 公園・参道・水辺の場所を 60 回ずつ作り、線路の橋と電車が 1 つも無いこと。
//           (2) 高架のある場所で電車を 40 秒ぶん動かし、描く箱がいつも高架の範囲の中にあること。
//           (3) ふつうの町では、線路の橋が今まで通り出ること（消しすぎていない）。
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200); await p.click('#btnStart'); await p.waitForTimeout(600);
  const r = await p.evaluate(() => { const { ev, THEMES } = window.__hayDash; const G = ev('G'); G.paused = true;
    const mk = tid => ev('newSeg')(G.segs[G.ci], { t: tid, d: 12 }, {});
    const quiet = Object.keys(THEMES).filter(k => ev('noRail')(THEMES[k]) && THEMES[k].kind === 'street');
    const out = { quiet: quiet.length, badPark: [], over: [], bridges: 0, trains: 0 };
    for (const k of quiet) for (let i = 0; i < 60; i++) { let sg; try { sg = mk(k); } catch (e) { out.badPark.push(k + ' 作れない: ' + e.message); break; }
      if ((sg.hp && sg.hp.shape === 'underpass') || (sg.movers && sg.movers.length)) { out.badPark.push(k); break; } }
    for (const k of Object.keys(THEMES)) { const f = THEMES[k].fac; if (!f || (f.left !== 'viaduct' && f.right !== 'viaduct')) continue;
      for (let i = 0; i < 6; i++) { const sg = mk(k); for (const m of sg.movers || []) { if (m.cross) continue; out.trains++; if (m.r1 == null) { out.over.push(k + ' 範囲なし'); continue; }
        for (let t = 0; t < 400; t++) { m.ds += m.v * .1; if (m.ds < m.r0 - 42) m.ds = m.r1 + 6; for (const bx of ev('moverBoxes')(m)) { const a = bx.s0 + m.ds, z = bx.s1 + m.ds; if (a < m.r0 - .01 || z > m.r1 + .01) { out.over.push(k + ' ' + a.toFixed(1) + '〜' + z.toFixed(1) + '（高架 ' + m.r0.toFixed(1) + '〜' + m.r1.toFixed(1) + '）'); t = 999; break; } } } } } }
    for (let i = 0; i < 150; i++) { const sg = mk('street'); if (sg.hp && sg.hp.shape === 'underpass') out.bridges++; }
    return out; });
  if (r.quiet < 15) bad.push('公園・水辺の場所が ' + r.quiet + ' か所しか見つからない（見張りがこわれている）');
  for (const k of r.badPark) bad.push('公園・水辺に線路の橋か電車がある: ' + k);
  if (!r.trains) bad.push('高架の電車が 1 本も無い（見張りがこわれている）');
  for (const k of r.over) bad.push('電車が高架からはみ出す: ' + k);
  if (!r.bridges) bad.push('ふつうの町に線路の橋が 1 つも出ない（消しすぎ）');
  await b.close();
  console.log(JSON.stringify({ 公園と水辺: r.quiet, 高架の電車: r.trains, 町の線路の橋: r.bridges + '/150' }));
  if (bad.length) { console.log('NG'); for (const x of [...new Set(bad)].slice(0, 20)) console.log(' - ' + x); process.exit(1); }
  console.log('TRAINPLACE OK'); })();
