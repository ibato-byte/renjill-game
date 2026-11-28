// スタンプ帳の「大きく見る」地図（2026-11-28 オーナー「スタンプ帳の地図はまだ小さくて非常に見づらい」[地図 M1〜M25]）
// 見る物（スマホ 390x844・320x568・パソコン 1280x800、日本語・英語）：
//  (1) スタンプ帳に「大きく」のボタンがあり、押すと画面いっぱいの地図が開く。地図そのもの（印でない所）を押しても開く
//  (2) 開いた時の駅の名前は、画面の上で 12px 以上（小さな地図の名前は 8px 前後だった）
//  (3) ＋で拡大すると地図は大きくなるが、名所の印の大きさは画面の上でほぼ同じ（印が重ならずに分かれる）
//  (4) 指 2 本でつまんで広げると拡大、1 本で動かすと地図が動く（指の動きを作って確かめる）
//  (5) 名所の印を押すと、その名所がえらばれてふき出しが出る（後ろのスタンプ帳も同じ所）
//  (6) ✕・Esc で閉じる。スタンプ帳を閉じると大きな地図も消える (7) エラーが出ない
const { chromium } = require('playwright'); const path = require('path');
(async () => { const bad = [], log = []; const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  for (const [w, h, lang] of [[390, 844, 'ja'], [320, 568, 'en'], [1280, 800, 'ja']]) { const tag = lang + ' ' + w + 'x' + h + '：', mob = w < 900;
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob }); const p = await ctx.newPage(); p.on('pageerror', e => bad.push(tag + 'エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(l => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 40, lang: l, stamps: { ginza: 1, asakusa: 1, ueno: 1, shibuya: 1, akihabara: 1, tsukiji: 1, roppongi: 1 } })), lang);
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1400);
    await p.evaluate(() => document.getElementById('btnStamps').click()); await p.waitForTimeout(500);
    // (1) ボタン
    const btn = await p.evaluate(() => { const e = document.querySelector('#pBody .rbig'); if (!e) return null; return { h: e.offsetHeight, vis: e.offsetWidth > 0 }; }); /* 高さは、画面が出てくる動き（少し小さい所から大きくなる）に左右されない offsetHeight で */
    if (!btn || !btn.vis) { bad.push(tag + '「大きく」のボタンがない'); await ctx.close(); continue; } if (btn.h < 36) bad.push(tag + '「大きく」のボタンが低い（' + btn.h + 'px）');
    await p.evaluate(() => document.querySelector('#pBody .rbig').click()); await p.waitForTimeout(700);
    const full = await p.evaluate(() => { const d = document.getElementById('tmFull'); if (!d) return null; const r = d.getBoundingClientRect(), s = d.querySelector('.tmf-m svg'), sr = s && s.getBoundingClientRect(); const st = [...d.querySelectorAll('.msta text')].map(t => Math.round(t.getBoundingClientRect().height)); return { cover: r.left <= 0 && r.top <= 0 && r.right >= innerWidth - 1 && r.bottom >= innerHeight - 1, svg: sr ? [Math.round(sr.width), Math.round(sr.height)] : null, st }; });
    if (!full) { bad.push(tag + '「大きく」を押しても大きな地図が開かない'); await ctx.close(); continue; }
    if (!full.cover) bad.push(tag + '大きな地図が画面いっぱいではない'); if (!full.svg || full.svg[0] < w * .9) bad.push(tag + '大きな地図の絵が小さい ' + JSON.stringify(full.svg));
    // (2) 駅の名前の大きさ（字の高さ）
    const stMin = Math.min(...full.st.filter(x => x > 0)); log.push(tag + '駅の名前の高さ ' + stMin + 'px'); if (!(stMin >= 12)) bad.push(tag + '大きな地図の駅の名前が小さい（' + stMin + 'px。12px 以上）');
    // (3) ＋で拡大しても、印の大きさは同じくらい
    const dotR = () => p.evaluate(() => { const d = [...document.querySelectorAll('#tmFull .mdot')].map(e => e.querySelector('circle:nth-of-type(2)') || e.querySelector('circle')).filter(Boolean)[0]; const r = d.getBoundingClientRect(); return r.width; });
    const zNow = () => p.evaluate(() => window.__hayDash.ev('TMF.z'));
    const drawn = () => p.waitForFunction(() => { const m = document.querySelector('#tmFull .tmf-m'); const z = window.__hayDash.ev('TMF.z'), t = m && new DOMMatrix(getComputedStyle(m).transform); return m && m.dataset.z === z.toFixed(4) && Math.abs(t.a - z) < z * .01; }, null, { timeout: 5000 }).catch(() => bad.push(tag + '拡大の後、地図が描き直されない')); /* 拡大が止まってから描き直すので、それと拡大の動きが終わるのを待つ（重い機械でも） */
    await drawn(); const r1 = await dotR(), z1 = await zNow(); await p.evaluate(() => document.querySelector('#tmFull [data-tz="1"]').click()); await p.waitForTimeout(300); await drawn(); const r2 = await dotR(), z2 = await zNow();
    log.push(tag + '拡大 ' + z1.toFixed(2) + ' → ' + z2.toFixed(2) + '・印 ' + r1.toFixed(1) + ' → ' + r2.toFixed(1) + 'px');
    if (!(z2 > z1 * 1.3)) bad.push(tag + '＋で拡大しない（' + z1 + ' → ' + z2 + '）'); if (!(r2 < r1 * 1.35 && r2 > r1 * .7)) bad.push(tag + '拡大すると印の大きさが変わる（' + r1.toFixed(1) + ' → ' + r2.toFixed(1) + 'px）');
    // (4) 指の動き：2 本でつまんで広げる → 拡大、1 本で動かす → 動く
    const pz = await p.evaluate(async () => { const a = document.querySelector('#tmFull .tmf-a'), r = a.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, ev = (t, id, x, y) => a.dispatchEvent(new PointerEvent(t, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, bubbles: true, isPrimary: id === 11 })), w8 = ms => new Promise(s => setTimeout(s, ms));
      document.querySelector('#tmFull [data-tz="0"]').click(); await w8(400); const z0 = window.__hayDash.ev('TMF.z');
      ev('pointerdown', 11, cx - 30, cy); ev('pointerdown', 12, cx + 30, cy); for (let i = 1; i <= 6; i++) { ev('pointermove', 11, cx - 30 - i * 12, cy); ev('pointermove', 12, cx + 30 + i * 12, cy); await w8(16); } ev('pointerup', 11, cx - 102, cy); ev('pointerup', 12, cx + 102, cy); await w8(300);
      const z1 = window.__hayDash.ev('TMF.z'), x0 = window.__hayDash.ev('TMF.x');
      ev('pointerdown', 13, cx, cy); for (let i = 1; i <= 6; i++) { ev('pointermove', 13, cx + i * 10, cy + i * 6); await w8(16); } ev('pointerup', 13, cx + 60, cy + 36); await w8(300);
      return { z0, z1, x0, x1: window.__hayDash.ev('TMF.x') }; });
    log.push(tag + 'つまむ ' + JSON.stringify(pz)); if (!(pz.z1 > pz.z0 * 1.4)) bad.push(tag + '2 本の指で広げても拡大しない ' + JSON.stringify(pz)); if (!(Math.abs(pz.x1 - pz.x0) > 20)) bad.push(tag + '1 本の指で動かしても地図が動かない ' + JSON.stringify(pz));
    // (5) 印を押す
    const pick = await p.evaluate(() => { const d = [...document.querySelectorAll('#tmFull .mdot')].find(e => { const r = e.getBoundingClientRect(); return r.left > 30 && r.right < innerWidth - 90 && r.top > 90 && r.bottom < innerHeight - 60; }); if (!d) return null; const r = d.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, id: d.dataset.s }; });
    if (!pick) bad.push(tag + '押せる名所の印が見つからない'); else { await p.mouse.click(pick.x, pick.y); await p.waitForTimeout(500); const r = await p.evaluate(() => ({ sel: window.__hayDash.ev('RALLY.sel'), pin: !!document.querySelector('#tmFull .mpin'), back: !!document.querySelector('#pBody .tmap .mpin') })); if (r.sel !== pick.id || !r.pin) bad.push(tag + '名所の印を押しても、えらばれない ' + JSON.stringify(r) + ' ' + pick.id); if (!r.back) bad.push(tag + '後ろのスタンプ帳の地図に、えらんだ所が出ない'); }
    // (6) 閉じる
    await p.keyboard.press('Escape'); await p.waitForTimeout(300); if (await p.evaluate(() => !!document.getElementById('tmFull'))) bad.push(tag + 'Esc で閉じない');
    if (await p.evaluate(() => document.getElementById('sPanel').hidden)) bad.push(tag + 'Esc で、大きな地図だけでなくスタンプ帳まで閉じた');
    // 地図そのものを押しても開く
    const opened = await p.evaluate(async () => { const m = document.querySelector('#pBody .tmapw'); const r = m.getBoundingClientRect(); const el = document.elementFromPoint(r.left + 12, r.top + r.height / 2); el.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: r.left + 12, clientY: r.top + r.height / 2 })); await new Promise(s => setTimeout(s, 300)); return !!document.getElementById('tmFull'); });
    if (!opened) bad.push(tag + '地図そのものを押しても、大きな地図が開かない');
    if (opened) { await p.evaluate(() => document.querySelector('#tmFull .tmf-x').click()); await p.waitForTimeout(250); if (await p.evaluate(() => !!document.getElementById('tmFull'))) bad.push(tag + '✕で閉じない'); }
    await p.evaluate(() => document.querySelector('#pBody .rbig').click()); await p.waitForTimeout(300); await p.evaluate(() => window.__hayDash.ev('closePanel()')); await p.waitForTimeout(200); if (await p.evaluate(() => !!document.getElementById('tmFull'))) bad.push(tag + 'スタンプ帳を閉じても、大きな地図が残った');
    await ctx.close(); }
  await b.close(); console.log(log.join('\n')); if (bad.length) { console.log('MAPBIG NG ' + bad.length + '\n' + bad.join('\n')); process.exit(1); } console.log('MAPBIG OK'); })();
