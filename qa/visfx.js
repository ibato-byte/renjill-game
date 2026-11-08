// 見た目の小さな追加（C-32・33・34・35）が動いているか：雨の日にぬれて光る、室内の光、足もとの土ぼこり（地面ごとの色）。エラーが出ないこと
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9 })); });
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800); await p.click('#btnStart'); await p.waitForTimeout(1000);
  const step = async js => { await p.evaluate(js => { const G = window.__hayDash.G; eval(js); G.invT = 99; }, js); await p.waitForTimeout(700); return p.evaluate(() => { const G = window.__hayDash.G; return { wet: G.wetN || 0, shaft: G.shaftN || 0, dust: G.dustC || '' }; }); };
  const rain = await step("G.jumpTo('shinjuku', 600, 2); G.weather = 'rain'; G.wetN = 0; G.dustC = '';");
  const room = await step("G.jumpTo('desk', 600, 1); G.weather = 'clear'; G.shaftN = 0; G.wetN = 0;");
  const snow = await step("G.jumpTo('ueno', 600, 4); G.weather = 'snow'; G.dustC = '';");
  // 曲がり角（C-6）：曲がれる間は矢印の下に残りの線（--left が 1 → 0）
  const cue = await p.evaluate(async () => { const D = window.__hayDash, G = D.G; let sg; for (let i = 0; i < 12; i++) { G.jumpTo('ginza', 600, 1); sg = D.ev('curSeg()'); if (!sg.fork && sg.turn) break; } G.invT = 99; G.s = sg.len - 10; await new Promise(r => setTimeout(r, 80)); const c = document.getElementById('turnCue'); return { win: /\bwin\b/.test(c.className), left: parseFloat(c.style.getPropertyValue('--left')) }; });
  // あそびかたの動く絵（C-74）：高さがあって見えている
  await p.evaluate(() => { window.__hayDash.G.mode = 'title'; }); const how = await p.evaluate(() => { try { window.__hayDash.ev('openHow()'); } catch (e) { return -1; } const e = document.querySelector('.howanim'); return e ? e.getBoundingClientRect().height : 0; });
  console.log(JSON.stringify({ rain, room, snow, cue, how }));
  const ok = cue.win && cue.left > 0 && cue.left < 1 && how > 100 && rain.wet > 0 && rain.dust && room.shaft > 0 && room.wet === 0 && /244,247,250/.test(snow.dust);
  console.log(ok && !errs.length ? 'VISFX OK' : 'VISFX NG ' + errs.join(' | ')); await b.close();
})();
