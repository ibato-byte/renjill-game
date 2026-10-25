// one-off: character portraits for the guide pages + the list of places (stamps) for the text
const { chromium } = require('playwright'); const fs = require('fs'); // 名所を足したら: python3 build.py && node qa/seo_assets.js && python3 build.py
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const p = await b.newPage(); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + process.cwd() + '/dist/test.html'); await p.waitForTimeout(800);
  const r = await p.evaluate(() => { const D = window.__hayDash, out = {};
    for (const [w, mood, sc] of [['ren', 'front_happy', 1], ['jill', 'front_happy', 1], ['pom', 'front_sparkle', 1.25]]) { const src = D.BUN[w][mood] || D.BUN[w].front_open, c = document.createElement('canvas'); c.width = 360; c.height = 360; const g = c.getContext('2d');
      const s = 360 / src.width * 1.02 * sc; g.translate(180, 352); g.scale(s, s); g.fillStyle = 'rgba(59,42,32,.14)'; g.beginPath(); g.ellipse(0, -10, 100, 14, 0, 0, Math.PI * 2); g.fill(); g.drawImage(src, -src.width / 2, -src.height + 8); out[w] = c.toDataURL('image/png'); }
    const T = D.THEMES, places = [];
    for (const k in T) { const th = T[k]; if (th.stamp && !th.hidden) places.push({ k, ja: th.stamp.ja, en: th.stamp.en, nja: th.stamp.note.ja, nen: th.stamp.note.en }); }
    out.places = places; return out; });
  for (const w of ['ren', 'jill', 'pom']) fs.writeFileSync(`app/img/${w}.png`, Buffer.from(r[w].split(',')[1], 'base64'));
  const seen = new Set(); fs.writeFileSync('seo_places.json', JSON.stringify(r.places.filter(x => !seen.has(x.ja) && seen.add(x.ja)), null, 0)); console.log(r.places.length); await b.close(); })();
