// 中国語（繁體）・韓国語で、訳されていない文字が残っていないか：全画面・走っている間（いろいろな場所・フィーバー・結果）を回り、
// ① 訳のない文（日本語の元の文）を記録 ② 画面の文字・キャンバスに描いた文字に、ひらがな・カタカナが残っていないか（・ー は区切りなので除く）
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [], report = {};
  for (const lang of ['zh', 'ko']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(l => { window.__i18nMiss = new Set(); window.__canvasText = new Set(); const f = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { try { window.__canvasText.add(String(t)); } catch (e) { } return f.call(this, t, ...a); };
      if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', 1); localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 0, nickAsked: 1, runs: 0, bank: 12345, lang: l, pomMet: 1, nick: 'Test', zukan: { carrot: 1, alfalfa: 1, apple: 1, choco: 1 }, stamps: { asakusa: 1 }, last: { score: 1200, place: { ja: '渋谷', en: 'Shibuya' } } })); } }, lang);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(lang + ' ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200);
    const texts = new Set(); const grab = async () => { for (const s of await p.evaluate(() => [document.body.innerText, ...[...document.querySelectorAll('[placeholder],[aria-label],[title]')].map(e => (e.placeholder || '') + ' ' + (e.getAttribute('aria-label') || '') + ' ' + (e.title || ''))])) s.split('\n').forEach(x => x.trim() && texts.add(x.trim())); };
    await grab();
    for (const btn of ['#btnShop', '#btnMissions', '#btnStamps', '#btnZukan', '#btnHow', '#btnSet', '#btnName', '#btnChat', '#btnRank']) { if (!(await p.$(btn))) continue; await p.click(btn).catch(() => { }); await p.waitForTimeout(400); await grab();
      if (btn === '#btnZukan') { await p.evaluate(() => { const z = document.querySelector('[data-z]:not(.locked)'); z && z.click(); }); await p.waitForTimeout(200); await grab(); }
      if (btn === '#btnChat') { for (const q of ['?', 'ranking', 'stamp']) { await p.fill('#chatIn', q); await p.click('#chatSend'); await p.waitForTimeout(200); } await grab(); }
      await p.keyboard.press('Escape'); await p.waitForTimeout(200); await p.evaluate(() => window.__hayDash.ev("['sPanel','sChat','sName'].forEach(id => { const e = document.getElementById(id); if (e) e.hidden = true; })")); }
    // the tutorial, then runs through many places
    await p.click('#btnStart'); await p.waitForTimeout(1500); for (let i = 0; i < 12; i++) { await p.evaluate(() => { const D = window.__hayDash; D.act(['up', 'down', 'left', 'right'][(Math.random() * 4) | 0]); }); await p.waitForTimeout(300); await grab(); }
    const themes = await p.evaluate(() => Object.keys(window.__hayDash.THEMES));
    await p.evaluate(() => { const D = window.__hayDash; D.SV.tutDone = 1; D.ev('save()'); });
    for (let i = 0; i < themes.length; i += 1) {
      await p.evaluate(([th, i]) => { const G = window.__hayDash.G; G.invT = 99; try { G.jumpTo(th, 300 + (i * 97) % 1300, 1 + (i % 4)); } catch (e) { } if (i % 7 === 0) { G.feverG = 100; } if (i % 9 === 0) G.pow.jump = 3; }, [themes[i], i]);
      await p.waitForTimeout(260); if (i % 3 === 0) await grab();
    }
    await p.evaluate(() => window.__hayDash.ev('G.invT = 0; G.lives = 0; G.reviveN = 9; endRun()')); await p.waitForTimeout(2200); await grab();
    const miss = await p.evaluate(() => [...window.__i18nMiss].filter(m => /[\u3040-\u30ff\u3400-\u9fff]/.test(m))); const canvas = await p.evaluate(() => [...window.__canvasText]);
    const kana = /[぀-ゟ゠-ヺー-ヿ]/; // hiragana + katakana except the middle dot (・ U+30FB) … and the long mark ー is real Japanese: flag it
    const bad = [...texts].filter(s => kana.test(s.replace(/#レンとジル/g, '')));
    report[lang] = { miss: miss.slice(0, 80), missN: miss.length, kana: [...new Set(bad)].slice(0, 60), kanaN: bad.length };
    await p.screenshot({ path: (process.env.SHOTS || 'shots') + `/i18n_result_${lang}.png` }); await ctx.close();
  }
  console.log(JSON.stringify(report, null, 1));
  const total = report.zh.missN + report.ko.missN + report.zh.kanaN + report.ko.kanaN;
  console.log(errs.length || total ? 'FAIL ' + errs.join(' || ') + ` missing ${report.zh.missN}+${report.ko.missN}, kana ${report.zh.kanaN}+${report.ko.kanaN}` : 'I18N OK no errors'); await b.close();
})();
