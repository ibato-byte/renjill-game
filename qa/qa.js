const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const issues = [];
  for (const [name, vp, loc] of [['se', { width: 320, height: 568 }, 'ja-JP'], ['phone', { width: 390, height: 844 }, 'en-US'], ['tablet', { width: 768, height: 1024 }, 'ja-JP'], ['desk', { width: 1440, height: 900 }, 'ja-JP']]) {
    const p = await b.newPage({ viewport: vp, locale: loc });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(700); if (name !== 'phone') await p.evaluate(() => { window.__hayDash.SV.nickAsked = 1; });
    const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (ov) issues.push(name + ': horizontal overflow on title');
    await p.screenshot({ path: `shots/qa_${name}_title.png` });
    for (const id of ['btnMissions', 'btnStamps', 'btnZukan', 'btnShop', 'btnHow', 'btnSet']) {
      await p.click('#' + id); await p.waitForTimeout(150);
      const o2 = await p.evaluate(() => { const b = document.querySelector('#pBody'); return [b.scrollWidth > b.clientWidth + 1, document.querySelector('.panel').getBoundingClientRect().bottom <= innerHeight + 1]; });
      if (o2[0]) issues.push(`${name}: ${id} panel content overflows sideways`);
      if (!o2[1]) issues.push(`${name}: ${id} panel taller than screen`);
      if (name === 'se') await p.screenshot({ path: `shots/qa_se_${id}.png` });
      await p.click('#pClose'); await p.waitForTimeout(80);
    }
    await p.click('#btnLang'); await p.waitForTimeout(100);
    const lang = await p.evaluate(() => document.querySelector('#btnStart').textContent + '|' + document.querySelector('#tMis').textContent);
    await p.click('#btnLang');
    if (name === 'phone') { // tap controls + Jill + revive + pause
      await p.click('#pickJill'); await p.click('#btnSet'); await p.click('[data-opt="ctrl"][data-v="tap"]'); await p.click('#pClose');
      await p.evaluate(() => { const SV = window.__hayDash.SV; SV.tutDone = 1; SV.bank = 5000; SV.clovers = 3; });
      await p.click('#btnStart'); await p.waitForTimeout(300);
      if (await p.$('#nameIn')) issues.push('START asked for a name (should not)'); await p.waitForTimeout(500);
      await p.mouse.click(40, 500); await p.waitForTimeout(150);
      const lane = await p.evaluate(() => window.__hayDash.G.lane); if (lane !== 0) issues.push('tap left did not change lane: ' + lane);
      await p.mouse.click(195, 300); await p.waitForTimeout(60);
      const air = await p.evaluate(() => window.__hayDash.G.air); if (!air) issues.push('tap top did not jump');
      await p.click('#pauseBtn'); await p.waitForTimeout(150); const pm = await p.evaluate(() => window.__hayDash.G.mode); if (pm !== 'pause') issues.push('pause failed');
      await p.click('#btnResume'); await p.waitForTimeout(400); const cd = await p.evaluate(() => window.__hayDash.G.mode); if (cd !== 'countdown') issues.push('no resume countdown: ' + cd); for (let k = 0; k < 50 && (await p.evaluate(() => window.__hayDash.G.mode)) === 'countdown'; k++) await p.waitForTimeout(100); const pm2 = await p.evaluate(() => window.__hayDash.G.mode); if (pm2 !== 'play') issues.push('resume failed: ' + pm2);
      for (let k = 0; k < 40 && (await p.evaluate(() => window.__hayDash.G.mode)) !== 'play'; k++) await p.waitForTimeout(100);
      await p.evaluate(() => { window.__hayDash.G.invT = 0; window.__die('obstacle'); });
      for (let k = 0; k < 40 && (await p.evaluate(() => document.querySelector('#sRevive').hidden)); k++) await p.waitForTimeout(100);
      const rv = await p.evaluate(() => !document.querySelector('#sRevive').hidden); if (!rv) issues.push('revive screen not shown');
      await p.click('#btnRvClover'); await p.waitForTimeout(300); const m2 = await p.evaluate(() => window.__hayDash.G.mode); if (m2 !== 'play') issues.push('revive with charm failed: ' + m2);
      await p.evaluate(() => { window.__hayDash.G.invT = 0; window.__die('wall'); }); await p.waitForTimeout(1300);
      await p.click('#btnRvHay'); await p.waitForTimeout(300); const m3 = await p.evaluate(() => window.__hayDash.G.mode); if (m3 !== 'play') issues.push('revive with hay failed: ' + m3);
      await p.click('#pauseBtn'); await p.click('#btnQuit'); await p.waitForTimeout(400);
      const res = await p.evaluate(() => !document.querySelector('#sResult').hidden); if (!res) issues.push('quit did not show result');
      await p.screenshot({ path: 'shots/qa_phone_result.png' });
      await p.click('#btnMenu'); await p.waitForTimeout(300);
      await p.click('#btnShop'); await p.click('[data-up="dash"]'); await p.click('[data-buy="mug"]'); await p.click('#pClose');
      const sv = await p.evaluate(() => { const SV = window.__hayDash.SV; return [SV.upg.dash, SV.mug, SV.mugOn, JSON.stringify(SV).length]; });
      if (sv[0] !== 1 || !sv[1]) issues.push('shop purchase failed ' + sv);
      console.log('save size bytes', sv[3]);
      await p.click('#pickRen'); await p.waitForTimeout(300); await p.screenshot({ path: 'shots/qa_mug_title.png' });
    }
    console.log(name, 'lang toggle ->', lang, errs.length ? 'ERRORS: ' + errs.slice(0, 4).join(' | ') : 'no errors');
    await p.close();
  }
  console.log(issues.length ? 'ISSUES:\n' + issues.join('\n') : 'no issues');
  await b.close();
})();
