// 検索で見つけてもらうための確認：タイトル・説明・正規URL・構造化データ・robots.txt・sitemap.xml・ガイドページ（日英）・画像の説明文・スマホではみ出さない
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const APP = path.join(process.cwd(), 'app'), SITE = 'https://hay-dash.coana.co.jp/';
const errs = [], rd = f => fs.readFileSync(path.join(APP, f), 'utf8');
const ld = s => [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => { try { return JSON.parse(m[1]); } catch (e) { errs.push('LD JSON broken'); return null; } });
const one = (s, re, name) => { const m = s.match(re); if (!m) errs.push('missing ' + name); return m ? m[1] : ''; };
for (const [f, canon] of [['index.html', SITE], ['guide.html', SITE + 'guide'], ['guide-en.html', SITE + 'guide-en'], ['food.html', SITE + 'food'], ['food-en.html', SITE + 'food-en'], ['ranking.html', SITE + 'ranking']]) {
  const s = rd(f), title = one(s, /<title>([^<]+)<\/title>/, f + ' title'), desc = one(s, /<meta name="description" content="([^"]+)"/, f + ' description');
  if ((s.match(/<title>/g) || []).length !== 1) errs.push(f + ' title count');
  if (title.length < 15 || title.length > 70) errs.push(f + ' title length ' + title.length);
  if (desc.length < 50 || desc.length > 200) errs.push(f + ' description length ' + desc.length);
  if (one(s, /<link rel="canonical" href="([^"]+)"/, f + ' canonical') !== canon) errs.push(f + ' canonical wrong');
  if (!/property="og:image"/.test(s)) errs.push(f + ' og:image');
  if (/noindex/.test(s)) errs.push(f + ' noindex!');
  if (/Claude|claude\.ai|AI を使用|AIを使用/.test(s.replace(/<meta name="claude:[^>]+>/g, '').replace(/<script>[\s\S]*?<\/script>/g, ''))) errs.push(f + ' mentions Claude/AI');
}
{ const L = ld(rd('index.html')).filter(Boolean); if (!L.some(x => [].concat(x['@type']).includes('VideoGame') && x.offers && x.offers.price === '0')) errs.push('index VideoGame LD'); if (JSON.stringify(L).includes('aggregateRating')) errs.push('no made-up ratings'); }
for (const f of ['guide.html', 'guide-en.html']) { const s = rd(f), L = ld(s).flat().filter(Boolean);
  if (!L.some(x => x['@type'] === 'FAQPage' && x.mainEntity.length >= 4)) errs.push(f + ' FAQ LD');
  for (const h of ['ja', 'en', 'x-default']) if (!new RegExp(`hreflang="${h}" href="${SITE}guide`).test(s)) errs.push(f + ' hreflang ' + h);
  if ([...s.matchAll(/<img [^>]*>/g)].some(m => !/alt="[^"]{4,}"/.test(m[0]))) errs.push(f + ' img without alt');
  for (const m of s.matchAll(/src="(img\/[^"]+)"/g)) if (!fs.existsSync(path.join(APP, m[1]))) errs.push(f + ' missing ' + m[1]);
  if (!/長野県動物愛護センター|Nagano Prefecture Animal Welfare Center/.test(s)) errs.push(f + ' food source');
  if ((s.match(/<li><b>/g) || []).length < 40) errs.push(f + ' places list short'); }
// えさ図鑑のページ（2026-11-08）：ゲームのえさ図鑑と同じ内容・出典・ダメな物がのっている・ゲームだけの物はのせない
for (const f of ['food.html', 'food-en.html']) { const s = rd(f), L = ld(s).flat().filter(Boolean);
  if (!L.some(x => x['@type'] === 'Article')) errs.push(f + ' Article LD');
  if (!/長野県動物愛護センター|Nagano Prefecture Animal Welfare Center/.test(s)) errs.push(f + ' food source');
  if ((s.match(/<li><b>/g) || []).length < 15) errs.push(f + ' food list short');
  if (!/チョコレート|Chocolate/.test(s) || !/玉ねぎ|Onions/.test(s)) errs.push(f + ' bad foods missing');
  if (/金のチモシー|Golden hay|紙ひこうき|Paper plane|【ゲーム】|\[Game\]/.test(s)) errs.push(f + ' game-only text on the food page'); }
for (const f of ['guide.html', 'guide-en.html']) if (!/href="food(-en)?"/.test(rd(f))) errs.push(f + ' no link to the food page');
{ const r = rd('robots.txt'); if (!/Allow: \//.test(r) || !r.includes(SITE + 'sitemap.xml') || /Disallow: \/\s*$/m.test(r)) errs.push('robots.txt'); }
{ const x = rd('sitemap.xml'); for (const u of ['', 'guide', 'guide-en', 'food', 'food-en', 'ranking']) if (!x.includes(`<loc>${SITE}${u}</loc>`)) errs.push('sitemap ' + u); }
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  for (const [vw, vh] of [[390, 844], [1280, 800]]) for (const f of ['guide.html', 'guide-en.html', 'food.html', 'food-en.html']) { const p = await b.newPage({ viewport: { width: vw, height: vh } }); p.on('pageerror', e => errs.push(f + ': ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('http://127.0.0.1:8790/' + f); await p.waitForTimeout(300);
    const o = await p.evaluate(() => ({ over: document.documentElement.scrollWidth > innerWidth + 1, h1: document.querySelectorAll('h1').length, play: (document.querySelector('a.play') || {}).getAttribute('href') }));
    if (o.over || o.h1 !== 1 || o.play == null) errs.push(f + ' ' + vw + ' ' + JSON.stringify(o)); await p.close(); }
  // the game links to the guide in the right language
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'ja-JP' })).newPage(); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  for (const [q, want] of [['', 'guide.html'], ['?lang=en', 'guide-en.html']]) { await p.goto('http://127.0.0.1:8790/' + q); await p.waitForTimeout(600); const h = await p.evaluate(() => (document.querySelector('#tGuide') || {}).getAttribute('href')); if (!h || !h.endsWith(want)) errs.push('game guide link ' + q + ' ' + h); }
  await b.close(); console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'SEO OK no errors'); })();
