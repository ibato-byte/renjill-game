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
  console.log(JSON.stringify({ rain, room, snow }));
  const ok = rain.wet > 0 && rain.dust && room.shaft > 0 && room.wet === 0 && /244,247,250/.test(snow.dust);
  console.log(ok && !errs.length ? 'VISFX OK' : 'VISFX NG ' + errs.join(' | ')); await b.close();
})();
