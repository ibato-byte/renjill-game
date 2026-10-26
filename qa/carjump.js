const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
 const p = await b.newPage({ viewport: { width: 390, height: 844 } }); await p.route('**/fonts.googleapis.com/**', r => r.abort());
 await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(500);
 await p.evaluate(() => { const H = window.__hayDash; H.SV.tutDone = 1; H.SV.nickAsked = 1; H.SV.clovers = 0; }); await p.click('#btnStart'); await p.waitForTimeout(300);
 const res = [];
 // one simple rule: every ordinary car is dodged (taller than the runners); low things are hopped
 const cars = await p.evaluate(() => { const H = window.__hayDash, ks = new Set(); for (let i = 0; i < 40; i++) ks.add(H.ev('OBS').car(0).k); return [...ks].join(','); }); console.log('CARS ' + cars + (cars === 'block' ? ' CARBLOCK ok' : ' CARS NOT ALL BLOCK'));
 for (const dist of [4, 6, 8, 10]) for (const t of ['supercar', 'chair', 'stoolsO', 'bench', 'suitcase', 'stroller', 'cart', 'toys']) {
  const r = await p.evaluate(async ([dist, t]) => { const H = window.__hayDash, G = H.G; G.jumpTo('ginza', 720, 1, 'ginza'); G.invT = 0; G.s = 10; const seg = G.segs[0]; seg.obs = []; seg.items = []; G.lane = 1; G.lat = 0; G.mode = 'play';
    let o = H.addObs(seg, t, 40, 1); let jumped = false, maxY = 0, hit = false;
    await new Promise(res => { const iv = setInterval(() => { const gap = o.s0 + (o.ds || 0) - G.s; if (!jumped && gap < dist) { H.act('up'); jumped = true; } maxY = Math.max(maxY, G.y); if (G.mode !== 'play') { hit = true; clearInterval(iv); res(); } if (gap < -6 && !G.air) { clearInterval(iv); res(); } }, 8); });
    const out = { dist, t, hit, maxY: +maxY.toFixed(2), roof: +o.top.toFixed(2), high: maxY > 2.15 }; if (G.mode !== 'play') { G.mode = 'play'; } return out; }, [dist, t]);
  res.push(r); await p.waitForTimeout(100); }
 console.log(res.map(r => `${r.t}@${r.dist}m:${r.hit ? 'HIT' : 'ok'}${r.high ? ' TOOHIGH' : ''}(y${r.maxY}/roof${r.roof})`).join('  '));
 await b.close(); })();
