// share buttons on the result screen, across phones / desktop / share-sheet failures / sandboxed iframe
const { chromium, devices } = require('playwright');
const URL0 = 'file://' + require('path').resolve(__dirname, '../dist') + '/test.html';
const ONLY = process.env.ONLY; const SCEN0 = [
  { n: 'iphone-sheet', dev: 'iPhone 13', share: 'ok' },
  { n: 'iphone-sheet-cancel', dev: 'iPhone 13', share: 'abort' },
  { n: 'iphone-no-sheet', dev: 'iPhone 13', share: 'deny' },
  { n: 'android-sheet', dev: 'Pixel 7', share: 'ok' },
  { n: 'android-nofiles', dev: 'Pixel 7', share: 'ok', nofiles: 1 },
  { n: 'desktop', dev: null, share: 'none' },
  { n: 'iframe-desktop', dev: null, share: 'none', iframe: 1 },
  { n: 'iframe-iphone', dev: 'iPhone 13', share: 'deny', iframe: 1 },
];
const SCEN = ONLY ? SCEN0.filter(s => s.n.startsWith(ONLY)) : SCEN0;
let fails = 0; const F = (s, m) => { fails++; console.log('  FAIL', s, m); };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  for (const S of SCEN) {
    const opt = Object.assign({}, S.dev ? devices[S.dev] : { viewport: { width: 1280, height: 800 } }, { locale: 'ja-JP', permissions: ['clipboard-read', 'clipboard-write'], acceptDownloads: true });
    delete opt.defaultBrowserType;
    const ctx = await b.newContext(opt);
    await ctx.route('**/fonts.googleapis.com/**', r => r.abort());
    await ctx.route(/https:\/\/(x\.com|line\.me|social-plugins\.line\.me|www\.facebook\.com|www\.instagram\.com)\/.*/, r => r.fulfill({ status: 200, contentType: 'text/html', body: '<p>ok</p>' }));
    await ctx.addInitScript(([mode, nofiles]) => {
      window.__shares = [];
      if (mode === 'none') { try { delete Navigator.prototype.share; delete Navigator.prototype.canShare; } catch (e) { } navigator.share = undefined; navigator.canShare = undefined; return; }
      navigator.canShare = d => !(nofiles && d && d.files);
      navigator.share = async d => { window.__shares.push({ text: d.text, url: d.url, title: d.title, files: (d.files || []).map(f => [f.name, f.type, f.size]) });
        if (mode === 'abort') throw new DOMException('x', 'AbortError'); if (mode === 'deny') throw new DOMException('x', 'NotAllowedError'); };
    }, [S.share, !!S.nofiles]);
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
    let fr = page;
    if (S.iframe) { require('fs').writeFileSync(require('path').resolve(__dirname, '../dist') + '/_frame.html', `<body style=margin:0><iframe id=f sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads" src="test.html" style="width:100%;height:100vh;border:0"></iframe>`); await page.goto('file://' + require('path').resolve(__dirname, '../dist') + '/_frame.html'); await page.waitForTimeout(1500); fr = page.frames().find(f => f.url().endsWith('test.html')); }
    else { await page.goto(URL0); await page.waitForTimeout(1200); }
    await fr.evaluate(() => { const H = window.__hayDash; H.SV.tutDone = 1; H.SV.nickAsked = 1; document.getElementById('btnStart').click(); });
    await page.waitForTimeout(2500);
    await fr.evaluate(() => window.__hayDash.ev('G.invT = 0; G.lives = 0; endRun()')); await page.waitForTimeout(2000);
    const info = await fr.evaluate(() => ({ x: document.getElementById('shX').href, line: document.getElementById('shLine').href, fb: document.getElementById('shFb').href, more: document.getElementById('tCopy').textContent, files: !!window.__hayDash.ev('G.shareFiles'), txt: window.__hayDash.ev('G.lastShare') }));
    console.log('==', S.n, '| more-label:', info.more, '| files ready:', info.files);
    const xq = new URL(info.x); if (xq.host !== 'x.com' || xq.searchParams.get('text') !== info.txt || !/^https:\/\/renjill-hay-dash\.pages\.dev\/\?beat=\d+&c=(ren|jill|pom)$/.test(xq.searchParams.get('url'))) F(S.n, 'x link ' + info.x);
    const lq = new URL(info.line); const phone = !!S.dev;
    if (phone ? !(lq.host === 'line.me' && lq.searchParams.get('text').includes(info.txt) && lq.searchParams.get('text').includes('pages.dev')) : !(lq.host === 'social-plugins.line.me' && lq.searchParams.get('url'))) F(S.n, 'line link ' + info.line);
    if (!/sharer\.php\?u=https%3A%2F%2Frenjill-hay-dash/.test(info.fb)) F(S.n, 'fb link ' + info.fb);
    // X: tapping opens a new page with the intent URL
    const clickNew = async sel => { await page.waitForTimeout(700); const pr = ctx.waitForEvent('page', { timeout: 7000 }).catch(() => null); await fr.click(sel); const np = await pr; if (!np) return null; await np.waitForLoadState().catch(() => { }); const u = np.url(); await np.close(); return u; };
    for (const [sel, host] of [['#shX', 'x.com'], ['#shLine', phone ? 'line.me' : 'social-plugins.line.me']]) { const u = await clickNew(sel); if (!u || !u.includes(host)) F(S.n, sel + ' did not open ' + host + ' (got ' + u + ')'); }
    const clip = async () => { try { return await page.evaluate(() => navigator.clipboard.readText()); } catch (e) { return '?'; } };
    // Facebook
    const before = await fr.evaluate(() => window.__shares.length);
    const dlp = () => page.waitForEvent('download', { timeout: 6000 }).catch(() => null);
    await fr.click('#shFb'); await page.waitForTimeout(600);
    let r = await fr.evaluate(() => ({ s: window.__shares.slice(-1)[0], n: window.__shares.length, note: document.getElementById('igNote').innerText, link: (document.querySelector('#igNote a') || {}).href }));
    const sheetOK = S.share === 'ok' || S.share === 'abort';
    if (phone && S.share !== 'none') { if (r.n === before || !r.s.url) F(S.n, 'fb sheet not used'); }
    if (S.share === 'ok' && phone) { if (!r.note) F(S.n, 'fb: no confirmation'); }
    else if (S.share === 'abort' && phone) { if (r.note) F(S.n, 'fb: note after cancel'); }
    else if (!r.link || !r.link.includes('facebook.com/sharer')) F(S.n, 'fb fallback link missing: ' + r.note);
    console.log('   fb:', r.note.replace(/\n/g, ' ').slice(0, 70), r.link ? '[link]' : '', '| clipboard:', (await clip()).slice(0, 30));
    // Instagram
    const dl1 = dlp(); await fr.click('#shIg'); await page.waitForTimeout(1500); const d1 = await dl1;
    r = await fr.evaluate(() => ({ s: window.__shares.slice(-1)[0], n: window.__shares.length, note: document.getElementById('igNote').innerText, link: (document.querySelector('#igNote a') || {}).href }));
    if (phone && S.share === 'ok' && !S.nofiles) { if (!r.s.files.length || r.s.files[0][1] !== 'image/png' || r.s.files[0][2] < 50000) F(S.n, 'ig: picture not handed to sheet ' + JSON.stringify(r.s)); }
    else if (!(phone && S.share === 'abort')) { if (!d1) F(S.n, 'ig: picture not saved'); if (!r.link || !r.link.includes('instagram.com')) F(S.n, 'ig: no Instagram link'); }
    console.log('   ig:', r.note.replace(/\n/g, ' ').slice(0, 70), d1 ? '[saved ' + d1.suggestedFilename() + ']' : '', r.link ? '[link]' : '');
    // More / copy
    await fr.click('#btnShare'); await page.waitForTimeout(500);
    r = await fr.evaluate(() => ({ s: window.__shares.slice(-1)[0], n: window.__shares.length, note: document.getElementById('igNote').innerText }));
    const c = await clip();
    if (S.share === 'ok') { if (!r.s || !r.s.url || !r.s.text) F(S.n, 'more: sheet data ' + JSON.stringify(r.s)); }
    else if (S.share !== 'abort' && !(c.includes('pages.dev') && c.includes(info.txt.slice(0, 10)))) F(S.n, 'more: copy failed ' + c);
    console.log('   more:', r.note.slice(0, 60), '| clipboard ok:', c.includes('pages.dev'));
    if (errs.length) F(S.n, 'page errors ' + errs.join(' / '));
    await ctx.close();
  }
  console.log(fails ? 'FAILS ' + fails : 'ALL SHARE TESTS PASSED'); await b.close(); process.exit(fails ? 1 : 0);
})();
