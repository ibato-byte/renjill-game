// ホーム画面で、顔が切りかわらないか（2026-11-16 オーナー：「キャラクター選択してる時に点滅するはいらない」。
// 目を開けた顔 → まばたき → にっこり → あくび、と入れかわるのが点滅に見えた）。
// 2026-11-17 オーナー「モチが寝てないのに ZZ と出るのはおかしい」→ Zz も出さない
// 確かめること：ホーム画面で 3 人を順に選び、それぞれ 12 秒ぶんの時間で、舞台の 3 人と札の絵の顔がずっと「開いた目」のまま
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 3, char: 'ren' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(2200);
  await p.evaluate(() => { window.__zz = 0; const f = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (t) { if (/^z+$/i.test(String(t).trim())) window.__zz++; return f.apply(this, arguments); }; }); // 2026-11-17：寝ていないのに「Zz」が出ない
  for (const id of ['#pickRen', '#pickJill', '#pickPom']) { await p.click(id); await p.waitForTimeout(300);
    const r = await p.evaluate(() => { const H = window.__hayDash; const G = H.ev('G'); const seen = new Set();
      H.ev("window.__bf = []; const __o = bunFrame; bunFrame = function (w, pose) { window.__bf.push(pose); return __o.apply(this, arguments); }");
      for (let t = 0; t < 12; t += 1 / 30) { G.t = t; H.ev('render()'); for (const c of ['ren', 'jill', 'pom']) H.ev('drawCharCard')(document.getElementById({ ren: 'cvRen', jill: 'cvJill', pom: 'cvPom' }[c]), c, t);
        for (const o of [G.player, G.follow, G.pom]) if (o && o.mood) seen.add(o.mood); }
      return { moods: [...seen], poses: [...new Set(window.__bf.filter(x => /^front_/.test(x)))] }; });
    const odd = r.moods.filter(m => m !== 'open'), oddP = r.poses.filter(x => !/^front_open/.test(x));
    if (odd.length) bad.push(id + ' 舞台の顔が切りかわる: ' + odd.join(','));
    if (oddP.length) bad.push(id + ' 札・舞台の絵の顔が切りかわる: ' + oddP.join(',')); }
  if (await p.evaluate(() => window.__zz)) bad.push('ホーム画面に、寝ていないのに「Zz」が出た');
  await b.close(); if (bad.length) { console.log('TITLESTILL NG\n' + bad.join('\n')); process.exit(1); } console.log('TITLESTILL OK 3 人 × 12 秒、顔は開いた目のまま・Zz なし'); })();
