// SNS とのつながり：結果・タイトル・設定の「フォロー」の列、シェアのリンクの ?ref=（どのSNSから来たか数える）、
// 来た人の ref を1回だけ覚える、良い走りのあとの控えめなひと言（3日に1回まで・フォロー後は出ない）、最新話のリンク、
// 結果の時刻とチモシー、こわれた数字のセーブ、古い引き継ぎコードでも端末の pid が消えない。4か国語・スマホとPC。
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const URL0 = 'file://' + path.resolve(__dirname, '../dist') + '/test.html';
const FEED = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../dist/feed.json'), 'utf8'));
const PROFILES = ['https://www.instagram.com/renjill_office/', 'https://www.tiktok.com/@renjill_office', 'https://www.youtube.com/@renjill_office', 'https://www.threads.net/@renjill_office', 'https://www.facebook.com/1358515160686321'];
const errs = []; const E = (tag, m) => errs.push(tag + ' ' + m);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  for (const [lang, w, h] of [['ja', 390, 844], ['en', 390, 844], ['zh', 390, 844], ['ko', 390, 844], ['ja', 1280, 800], ['en', 1280, 800]]) {
    const tag = lang + w;
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); p.on('pageerror', e => E(tag, 'pageerror ' + e.message));
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    const feed = Object.assign({}, FEED, { latest: { date: new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10), ja: '最新話のテスト', en: 'Newest test episode', url: 'https://www.youtube.com/shorts/test' } });
    await p.route(/hay-dash\.coana\.co\.jp\/feed\.json/, r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(feed) }));
    await ctx.addInitScript(l => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', 1); localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 5, best: 100, lang: l, pid: 'pid-keep-me' })); }, lang);
    // arrives from a shared Instagram link: ?ref=ig is remembered once and taken out of the address (other words stay)
    await p.goto(URL0 + '?lang=' + lang + '&ref=ig'); await p.waitForTimeout(1600);
    const arr = await p.evaluate(() => ({ ref: window.__hayDash.SV.ref, q: location.search }));
    if (arr.ref !== 'ig' || /ref=/.test(arr.q) || !/lang=/.test(arr.q)) E(tag, 'arrival ref ' + JSON.stringify(arr));
    // title: the follow line and the newest-episode card (NEW for a week)
    const ti = await p.evaluate(() => ({ links: [...document.querySelectorAll('#tFollow a')].map(a => [a.href, a.target, a.rel]), feed: (document.querySelector('#tFeed') || {}).textContent || '', site: document.querySelector('#tSite').href }));
    for (const u of PROFILES) if (!ti.links.some(l => l[0] === u && l[1] === '_blank' && /noopener/.test(l[2]))) E(tag, 'title follow missing ' + u);
    if (!/NEW/.test(ti.feed)) E(tag, 'feed card NEW ' + ti.feed);
    if (!/renjill\.coana\.co\.jp\/\?ref=haydash/.test(ti.site)) E(tag, 'site ref ' + ti.site);
    if (w < 600) { const over = await p.evaluate(() => { const e = document.querySelector('#tFollow'); return e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > innerWidth; }); if (over) E(tag, 'title follow overflows'); }
    // settings: the official profiles
    await p.click('#btnSet'); await p.waitForTimeout(400);
    const st = await p.evaluate(() => [...document.querySelectorAll('#pBody .sns a')].map(a => a.href));
    for (const u of PROFILES) if (!st.includes(u)) E(tag, 'settings follow missing ' + u);
    const lr = await p.evaluate(() => { const b = document.querySelector('.langrow p b'); return b.scrollWidth <= b.clientWidth + 1; }); if (!lr) E(tag, 'language label clipped');
    await p.click('#pClose'); await p.waitForTimeout(200);
    const foc = await p.evaluate(() => document.activeElement && document.activeElement.id); if (foc !== 'btnSet') E(tag, 'focus did not return to the settings button: ' + foc);
    // a good run (new best after 5 runs): result shows time & hay, the follow box with the newest episode, and one friendly line
    await p.click('#btnStart'); await p.waitForTimeout(3500);
    await p.evaluate(() => window.__hayDash.ev("G.hay = 37; G.clock = 545; G.score = 99999; G.mode = 'dead'; endRun()")); await p.waitForTimeout(1500);
    const r = await p.evaluate(() => ({ clock: document.querySelector('#resClock').textContent, hay: document.querySelector('#resHay').textContent, ask: !!document.querySelector('#resFollow .fol-ask'), ep: (document.querySelector('#resFollow .fol-ep') || {}).href, chips: [...document.querySelectorAll('#resFollow .fol-chips a')].map(a => a.href),
      x: document.querySelector('#shX').href, line: document.querySelector('#shLine').href, th: document.querySelector('#shTh').href, fb: document.querySelector('#shFb').href, cap: window.__hayDash.ev("SHARE.caption('ig')"), plain: window.__hayDash.ev('SHARE.url()'), last: window.__hayDash.ev('JSON.parse(localStorage.getItem(SAVE_KEY)).last') }));
    if (!/9:05/.test(r.clock)) E(tag, 'result time ' + r.clock);
    if (!/^[1-9]/.test(r.hay.replace(/[^\d]/g, '') || '0')) E(tag, 'result hay ' + r.hay);
    if (!r.last || r.last.score !== 99999) E(tag, 'last run not saved ' + JSON.stringify(r.last));
    if (!r.ask) E(tag, 'no follow line after a good run');
    if (r.ep !== 'https://www.youtube.com/shorts/test') E(tag, 'episode link ' + r.ep);
    for (const u of PROFILES) if (!r.chips.includes(u)) E(tag, 'result follow missing ' + u);
    const xu = new URL(r.x).searchParams.get('url'); if (!/[?&]beat=99999&c=ren&ref=x$/.test(xu)) E(tag, 'x ref ' + xu);
    if (!/ref%3Dline|ref=line/.test(r.line)) E(tag, 'line ref ' + r.line);
    if (!/^https:\/\/www\.threads\.net\/intent\/post\?text=/.test(r.th) || !/ref%3Dth/.test(r.th) || !/renjill_office/.test(decodeURIComponent(r.th))) E(tag, 'threads ' + r.th);
    if (!/ref%3Dfb/.test(r.fb)) E(tag, 'fb ref ' + r.fb);
    if (!/@renjill_office/.test(r.cap) || !/ref=ig/.test(r.cap) || !/#レンとジル/.test(r.cap)) E(tag, 'ig caption ' + r.cap);
    if (/ref=/.test(r.plain)) E(tag, 'plain challenge link should carry no ref ' + r.plain);
    if (w < 600) { const over = await p.evaluate(() => [...document.querySelectorAll('#sResult .shbtns > *, #resFollow, #resFollow *')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).textOverflow !== 'ellipsis').map(e => e.id || e.className || e.tagName)); if (over.length) E(tag, 'result overflow ' + over.join(',')); }
    await p.screenshot({ path: `${process.env.SHOTS || '/tmp/rj-shots'}/growth_${tag}.png` });
    // the next good run the same day: no friendly line again (3 days); after tapping a follow link: never
    await p.click('#btnAgain'); await p.waitForTimeout(2500);
    await p.evaluate(() => window.__hayDash.ev("G.score = 199999; G.mode = 'dead'; endRun()")); await p.waitForTimeout(1200);
    if (await p.evaluate(() => !!document.querySelector('#resFollow .fol-ask'))) E(tag, 'friendly line shown twice in a row');
    await p.evaluate(() => { const a = document.querySelector('#resFollow .fol-chips a'); a.addEventListener('click', e => e.preventDefault(), { once: true }); a.click(); });
    if (!(await p.evaluate(() => window.__hayDash.SV.fol))) E(tag, 'follow tap not remembered');
    await p.evaluate(() => window.__hayDash.ev('SV.folAt = 0')); await p.click('#btnAgain'); await p.waitForTimeout(2500);
    await p.evaluate(() => window.__hayDash.ev("G.score = 299999; G.mode = 'dead'; endRun()")); await p.waitForTimeout(1200);
    if (await p.evaluate(() => !!document.querySelector('#resFollow .fol-ask'))) E(tag, 'friendly line after following');
    // the ranking row carries where the player came from
    const src = await p.evaluate(async () => { const rows = window.__rows = {}; const D = window.__hayDash; D.ev('RANK.db = { doc: k => ({ get: async () => ({ exists: !!window.__rows[k], data: () => window.__rows[k] }), set: async v => { window.__rows[k] = v; } }) }; RANK.uid = "u1"'); await D.ev('rankSubmit(1000, { char: "ren", day: 1, dist: 400 })'); const r = rows['ranks/u1']; D.ev('RANK.db = null; RANK.uid = null'); return r && r.src; });
    if (src !== 'ig') E(tag, 'ranking src ' + src);
    await ctx.close();
  }
  // a bad ref word is ignored; a later visit never replaces the first one
  { const ctx = await b.newContext(); const p = await ctx.newPage(); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto(URL0 + '?ref=<script>'); await p.waitForTimeout(900); const a = await p.evaluate(() => window.__hayDash.SV.ref || '');
    await p.goto(URL0 + '?ref=x'); await p.waitForTimeout(900); await p.evaluate(() => window.__hayDash.ev('saveNow()')); await p.goto(URL0 + '?ref=line'); await p.waitForTimeout(900); const c = await p.evaluate(() => window.__hayDash.SV.ref);
    if (a !== '' || c !== 'x') E('ref', 'bad/first ref ' + JSON.stringify([a, c]));
    // damaged numbers in a save: the title shows no NaN; an old transfer code without a player id keeps this device's id
    await p.evaluate(() => { window.__hayDash.ev('RESETTING = 1'); const d = new Date(); localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ best: 'abc', bank: null, clovers: -3, runs: 'x', mlevel: 0, upg: 'zz', wear: 5, tutDone: 1, pid: 'dev-pid', daily: d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(), streak: 1 })); }); await p.reload(); await p.waitForTimeout(900);
    const t = await p.evaluate(() => ({ txt: document.querySelector('#sTitle').innerText, sv: [window.__hayDash.SV.bank, window.__hayDash.SV.best, window.__hayDash.SV.clovers, window.__hayDash.SV.mlevel, window.__hayDash.SV.upg.dash, typeof window.__hayDash.SV.wear.ren] }));
    if (/NaN/.test(t.txt) || JSON.stringify(t.sv) !== '[0,0,1,1,0,"object"]') E('save', 'damaged numbers ' + JSON.stringify(t.sv));
    const pid = await p.evaluate(async () => { const D = window.__hayDash; const code = await D.ev('(async () => { const keep = SV.pid; delete SV.pid; const c = await xferMake(); SV.pid = keep; return c; })()'); await D.ev(`xferApply(${JSON.stringify(code)})`); return D.SV.pid; });
    if (pid !== 'dev-pid') E('xfer', 'pid lost after an old code ' + pid);
    await ctx.close(); }
  await b.close();
  console.log(errs.length ? 'FAIL\n' + errs.join('\n') : 'GROWTH OK no errors');
  process.exit(errs.length ? 1 : 0);
})();
