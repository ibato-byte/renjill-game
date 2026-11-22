// [H70〜H81] 2026-11-22 オーナー（iPhone のアプリの写真）「見切れている。どんな端末でも起きない見やすい状態に」の見張り。
//  ① iPhone のホーム画面アプリ（表示のしかたが standalone。navigator.standalone は無い iPhone もある）で、アプリの枠がステータスバーの分（62px）短い：
//     枠が画面いっぱいにのび、下に暗い帯が残らない
//  ② どの画面の大きさでも（スマホ・タブレット・パソコン、たて・よこ）、ホーム画面で
//     スタートボタンが枠の中に全部入る・ボタンや札が画面の右や左のふちから外へ出ない・今日の目標の数（140,000 ✓・170/300）が切れない
//  ③ Android のホーム画面アプリ（画面の大きさに上下のシステムのバーが入る）では、枠を画面の大きさまでのばさない（下が切れるため）
//  数が大きい人（ベスト 9,999,999・部長・今日の目標達成・今日のチモシー 170/300・チャレンジ達成）の画面で見る
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [], rep = {};
  const SAVE = JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 140, lang: 'ja', best: 9999999, bank: 99999, char: 'ren', pomMet: 1, pomTold: 1 });
  const EV = 'SV.dayHay = { d: todayStr(), n: 170 }; SV.dailyDone = dailyToday().key; kpGoalDone = () => true; todayGrid(); try { homePlace(); } catch (e) { }';
  const look = async (name, w, h, app, droid) => {
    const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, isMobile: w < 600 }); p.on('pageerror', e => bad.push(name + ' エラー: ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(([s, app, droid]) => { localStorage.setItem('renjill-hay-dash-v1', s); if (droid) Object.defineProperty(screen, 'height', { get: () => innerHeight + droid }); if (app) { const mm = window.matchMedia.bind(window); window.matchMedia = q => /display-mode:\s*standalone/.test(q) ? Object.assign(mm('(min-width:0px)'), { media: q }) : mm(q);
      document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = '#app{bottom:' + app + 'px}'; document.head.appendChild(st); }); } }, [SAVE, app || 0, droid || 0]);
    await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1300); await p.evaluate(e => window.__hayDash.ev(e), EV); await p.waitForTimeout(app ? 2900 : 700);
    const r = await p.evaluate(() => { const A = document.getElementById('app').getBoundingClientRect(), o = []; const st = document.getElementById('btnStart').getBoundingClientRect();
      if (st.bottom > A.bottom + 1 || st.bottom > innerHeight + 1) o.push('スタートが下で切れる ' + Math.round(st.bottom) + '>' + Math.round(Math.min(A.bottom, innerHeight)));
      for (const el of document.querySelectorAll('#sTitle .card button, #sTitle .card #tToday .tt-c, #sTitle .card .bank>span, #sTitle .logo')) { if (el.closest('[hidden]') || getComputedStyle(el).display === 'none' || getComputedStyle(el).visibility === 'hidden') continue; const q = el.getBoundingClientRect(); if (!q.width || !q.height) continue;
        if (q.right > A.right + 1 || q.left < A.left - 1) o.push('横にはみ出す ' + (el.id || el.className) + ' ' + Math.round(q.left) + '..' + Math.round(q.right)); }
      for (const el of document.querySelectorAll('#sTitle #tToday .tt-c b')) if (el.clientWidth && el.scrollWidth > el.clientWidth + 1) o.push('数が切れる ' + el.textContent.trim());
      return { app: [Math.round(A.top), Math.round(A.bottom)], ih: innerHeight, o }; });
    rep[name] = r.o.length ? r.o : 'ok'; for (const m of r.o) bad.push(name + ' ' + m);
    if (r.app[1] > r.ih + 1) bad.push(name + ' アプリの枠が画面より長い（下が切れる） ' + JSON.stringify(r.app) + ' 画面 ' + r.ih);
    if (app && r.app[1] < r.ih - 1) bad.push(name + ' アプリの枠が画面の下までのびていない ' + JSON.stringify(r.app) + ' 画面 ' + r.ih);
    await p.close(); };
  for (const [w, h] of [[402, 874], [440, 956], [393, 852], [375, 812], [390, 844]]) await look('アプリ ' + w + 'x' + h, w, h, 62);
  await look('Android のアプリ（画面の大きさにシステムのバーが入る）', 412, 840, -0.001, 75); /* 枠は短くない。画面の大きさだけ 75px 大きい：のばさない */
  for (const [w, h] of [[320, 460], [320, 568], [360, 640], [375, 553], [375, 667], [390, 664], [402, 874], [430, 932], [600, 960], [768, 1024], [820, 1180], [1024, 768], [667, 375], [844, 390], [932, 430], [1280, 720], [1440, 900], [1920, 1080]]) await look(w + 'x' + h, w, h, 0);
  console.log(JSON.stringify(rep)); await b.close();
  if (bad.length) { console.log('APPFIT NG\n' + bad.join('\n')); process.exit(1); } console.log('APPFIT OK'); })();
