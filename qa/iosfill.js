// iPhone のホーム画面アプリで、画面の下に暗い帯が残らないための手当て（iosFill）が、ほかの環境をこわさない（2026-11-15）
//  ① ふつうのブラウザ（standalone でない）：何もしない
//  ② iPhone のホーム画面アプリ（standalone）で、枠がステータスバー分（59px）短い：画面いっぱいの高さにする・キャンバスもその高さ
//  ③ 同じく、キーボードが出ている間（大きく短い）：何もしない
//  ④ 同じく、枠がもう画面いっぱい：何もしない
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  const run = async (name, init, want) => { const p = await b.newPage({ viewport: { width: 393, height: 793 } }); p.on('pageerror', e => bad.push(name + ' エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' }))); if (init) await p.addInitScript(init);
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900);
    const r = await p.evaluate(() => { const a = document.getElementById('app'), c = document.getElementById('cv'); return { style: a.style.height, h: Math.round(a.getBoundingClientRect().height), cv: Math.round(c.getBoundingClientRect().height), mode: window.__hayDash.G.mode }; });
    if (r.mode !== 'title') bad.push(name + ' 題名画面になっていない'); const msg = want(r); if (msg) bad.push(name + ' ' + msg + ' ' + JSON.stringify(r)); await p.close(); };
  const fake = (sh) => `Object.defineProperty(navigator, 'standalone', { get: () => true }); Object.defineProperty(screen, 'height', { get: () => ${sh} }); Object.defineProperty(screen, 'width', { get: () => 393 });`;
  await run('① ふつうのブラウザ', null, r => r.style ? '高さを変えてしまった' : r.h !== 793 ? '枠の高さが変わった' : '');
  await run('② ホーム画面アプリ・59px 短い', fake(852), r => r.style !== '852px' ? '画面いっぱいになっていない' : r.cv !== 852 ? 'キャンバスが画面いっぱいになっていない' : '');
  await run('③ キーボードが出ている（大きく短い）', fake(1200), r => r.style ? '高さを変えてしまった' : '');
  await run('④ もう画面いっぱい', fake(793), r => r.style ? '高さを変えてしまった' : '');
  await b.close(); if (bad.length) { console.log('IOSFILL NG\n' + bad.join('\n')); process.exit(1); } console.log('IOSFILL OK');
})();
