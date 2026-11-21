// iPhone のホーム画面が 1 画面に収まること（2026-11-21 オーナー「まだ上下が収まりきってない」）
// iPhone の 5 つの大きさで、上のふち（時計の帯）の分を入れて写し、スタートボタンが画面の中・左右の丸いボタンが社員の帯の下にもぐらない・音と設定とランキングなどが右の列にある、を確かめる
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const bad = [], log = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const src = fs.readFileSync(path.resolve(__dirname, '../dist/hay-dash.html'), 'utf8');
  for (const [w, h, top] of [[375, 600, 20], [360, 720, 24], [393, 797, 59], [402, 811, 62], [430, 870, 59], [1280, 800, 0]]) {
    const tmp = path.resolve(__dirname, '../dist/_homefit_' + w + '.html'); fs.writeFileSync(tmp, src.replace(/env\(safe-area-inset-top(,\s*[^)]*)?\)/g, top + 'px'));
    const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => bad.push('エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 40, lang: 'ja', best: 132028, bank: 1997, char: 'jill', pomMet: 1, pomTold: 1, bond: 50 })); });
    await p.goto('file://' + tmp); await p.waitForTimeout(2500);
    const r = await p.evaluate(() => { const q = id => { const e = document.getElementById(id); if (!e) return null; const c = e.getBoundingClientRect(); return c.height ? c : null; }; const st = q('btnStart'), car = q('tCareer'), mi = q('btnMissions'), rk = q('btnRank'), mu = q('btnMute'), rc = q('btnRecords');
      return { ih: innerHeight, stB: st && Math.round(st.bottom), carB: car && Math.round(car.bottom), miT: mi && Math.round(mi.top), muIn: !!document.querySelector('#sTitle .row2 #btnMute'), rcIn: !!document.querySelector('#sTitle .row2 #btnRecords'), rkB: rk && Math.round(rk.bottom), rcB: rc && Math.round(rc.bottom) }; });
    log.push(w + 'x' + h + ' ' + JSON.stringify(r)); const ph = w < 600;
    if (!r.stB || r.stB > r.ih) bad.push(w + 'x' + h + '：スタートボタンが画面の下にはみ出す ' + r.stB + ' > ' + r.ih);
    if (ph && r.miT != null && r.carB != null && r.miT < r.carB) bad.push(w + 'x' + h + '：ミッションのボタンが社員の帯にもぐる');
    if (ph && (!r.muIn || !r.rcIn)) bad.push(w + 'x' + h + '：音・設定・きろくが右の列にない');
    if (!ph && (r.muIn || r.rcIn)) bad.push(w + 'x' + h + '：横長の画面なのに右の列に入っている');
    if (ph && r.rcB && r.rcB > r.ih - 150) bad.push(w + 'x' + h + '：右の列が下の台にかかる');
    await p.close(); fs.unlinkSync(tmp); }
  console.log(log.join('\n')); await b.close(); if (bad.length) { console.log('HOMEFIT NG\n' + bad.join('\n')); process.exit(1); } console.log('HOMEFIT OK');
})();
