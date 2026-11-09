// 小さい文字の読みやすさ：プレイ中の上の数字まわり・題名画面の小さい文字の、文字と背景の明るさの差（4.5 以上）（2026-11-09）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800);
  const scan = sel => p.evaluate(sel => { const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const f = x => (x /= 255) <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; return [.2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]), m[3] == null ? 1 : m[3]]; };
    const bg = e => { for (let x = e; x; x = x.parentElement) { const c = getComputedStyle(x).backgroundColor; const [l, a] = lum(c); if (a > .85) return l; } return null; };
    const out = []; for (const e of document.querySelectorAll(sel)) { if (!e.offsetParent || !e.textContent.trim() || [...e.childNodes].every(n => n.nodeType !== 3 || !n.textContent.trim())) continue; const cs = getComputedStyle(e); if (parseFloat(cs.fontSize) >= 14 || parseFloat(cs.opacity) < .9) continue;
      const fg = lum(cs.color)[0], b = bg(e); if (b == null) continue; const r = (Math.max(fg, b) + .05) / (Math.min(fg, b) + .05); if (r < 4.5) out.push(e.id + '.' + e.className + ' "' + e.textContent.trim().slice(0, 12) + '" ' + r.toFixed(2)); } return out; }, sel);
  let bad = await scan('#hud *, #sTitle *');
  for (const fn of ['openMissions', 'openShop', 'openSettings', 'openStamps', 'openZukan', 'openHow']) { await p.evaluate(fn => window.__hayDash.ev(fn + '()'), fn); await p.waitForTimeout(250); bad = bad.concat((await scan('#sPanel *')).map(x => fn + ': ' + x)); await p.evaluate(() => document.getElementById('pClose').click()); }
  await p.click('#btnStart'); await p.waitForTimeout(1500); await p.evaluate(() => { const G = window.__hayDash.G; G.combo = 12; G.invT = 99; }); await p.waitForTimeout(600);
  bad = bad.concat(await scan('#hud .chip, #hud .chip *'));
  console.log(bad.length ? 'CONTRAST NG ' + bad.join(' / ') : 'CONTRAST OK'); await b.close(); })();
