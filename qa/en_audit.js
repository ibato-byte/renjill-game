// English UI audit: every screen, find visible Japanese text and overflowing text, screenshot each
const { chromium } = require('playwright');
const fs = require('fs'); fs.mkdirSync((process.env.SHOTS || '/tmp/rj-shots') + '/en', { recursive: true });
const SIZES = (process.env.SIZES || 'ph:390x844,pc:1280x800').split(',').map(s => { const [n, d] = s.split(':'); const [w, h] = d.split('x').map(Number); return [n, w, h]; });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const out = {};
  for (const [nm, w, h] of SIZES) {
    const p = await b.newPage({ viewport: { width: w, height: h }, locale: 'en-US', hasTouch: nm === 'ph' });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(1200);
    const scan = async (tag) => {
      const r = await p.evaluate(() => {
        const JP = /[぀-ヿ㐀-鿿！-｠]/; const res = { jp: [], over: [] };
        const vis = el => { if (!el) return false; const st = getComputedStyle(el); if (st.visibility === 'hidden' || st.display === 'none' || +st.opacity === 0) return false; const r = el.getClientRects(); return r.length && r[0].width > 0; };
        const visDeep = el => { for (let e = el; e && e !== document.body; e = e.parentElement) { if (!vis(e) || e.hidden) return false; } return true; };
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) { const s = n.textContent.trim(); if (s && JP.test(s) && n.parentElement && visDeep(n.parentElement)) res.jp.push((n.parentElement.id || n.parentElement.className || n.parentElement.tagName) + ': ' + s.slice(0, 80)); }
        for (const el of document.querySelectorAll('[placeholder],[aria-label],[title]')) for (const a of ['placeholder', 'aria-label', 'title']) { const v = el.getAttribute(a); if (v && JP.test(v) && visDeep(el)) res.jp.push('@' + a + ' ' + (el.id || el.tagName) + ': ' + v.slice(0, 60)); }
        for (const el of document.querySelectorAll('button,a,b,span,small,h1,h2,h3,p,div,i,label,li')) { if (!visDeep(el) || !el.textContent.trim() || el.children.length > 3) continue; const st = getComputedStyle(el); if (st.overflow === 'visible' && st.textOverflow !== 'ellipsis' && el.tagName !== 'BUTTON') { const r = el.getBoundingClientRect(), pr = el.parentElement.getBoundingClientRect(); if (r.right > innerWidth + 1 || r.left < -1) res.over.push('offscreen ' + (el.id || el.className || el.tagName) + ': ' + el.textContent.trim().slice(0, 40)); continue; }
          if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) res.over.push((el.id || el.className || el.tagName) + ' ' + el.scrollWidth + '>' + el.clientWidth + ': ' + el.textContent.trim().slice(0, 50)); }
        return res; });
      out[nm + ':' + tag] = r; await p.screenshot({ path: `${process.env.SHOTS || '/tmp/rj-shots'}/en/${nm}_${tag}.png` });
    };
    await scan('title');
    for (const id of ['btnMissions', 'btnStamps', 'btnZukan', 'btnShop', 'btnHow', 'btnRank', 'btnName', 'btnSet']) {
      const ok = await p.evaluate(id => { const e = document.getElementById(id); if (!e) return false; e.click(); return true; }, id); if (!ok) continue; await p.waitForTimeout(500);
      await scan(id);
      // scroll the panel down and scan again
      await p.evaluate(() => { const b = document.getElementById('pBody'); if (b) b.scrollTop = b.scrollHeight; }); await p.waitForTimeout(200); await scan(id + '_end');
      await p.evaluate(() => { const c = document.getElementById('pClose'); if (c && c.offsetParent) c.click(); }); await p.waitForTimeout(300);
    }
    await p.evaluate(() => document.getElementById('btnChat').click()); await p.waitForTimeout(500); await scan('chat'); await p.evaluate(() => document.getElementById('chatClose').click()); await p.waitForTimeout(300);
    // play: first run with tutorial
    await p.evaluate(() => document.getElementById('btnStart').click()); await p.waitForTimeout(2500); await scan('play1');
    await p.waitForTimeout(3000); await scan('play2');
    await p.evaluate(() => { const H = window.__hayDash; H.SV.tutDone = 1; }); 
    await p.evaluate(() => document.getElementById('pauseBtn').click()); await p.waitForTimeout(400); await scan('pause');
    await p.evaluate(() => document.getElementById('btnResume').click()); await p.waitForTimeout(500);
    // end a run
    await p.evaluate(() => { const H = window.__hayDash; try { H.ev('G.invT = 0; G.lives = 0; endRun && endRun()'); } catch (e) { } }); await p.waitForTimeout(1500); await scan('result');
    await p.evaluate(() => { const r = document.getElementById('resMore'); if (r) r.scrollIntoView(); }); await p.waitForTimeout(300); await scan('result_more');
    out[nm + ':errors'] = errs.slice(0, 5);
    await p.close();
  }
  fs.writeFileSync((process.env.SHOTS || '/tmp/rj-shots') + '/en_audit.json', JSON.stringify(out, null, 1));
  let n = 0; const seen = new Set();
  for (const [k, v] of Object.entries(out)) { if (Array.isArray(v)) { n += v.length; continue; } for (const x of v.jp.concat(v.over.map(o => 'OVER ' + o))) { if (/btnLang/.test(x) || /: (日本語|繁體中文|한국어)$/.test(x)) continue; const key = k.split(':')[0] + x; if (seen.has(key)) continue; seen.add(key); n++; console.log('ISSUE', k, x); } }
  console.log('EN_ISSUES ' + n);
  if (false) for (const [k, v] of Object.entries(out)) { if (Array.isArray(v)) { if (v.length) console.log(k, v); continue; } if (v.jp.length || v.over.length) console.log('==', k, '\n  JP:', v.jp.join('\n      '), '\n  OVER:', v.over.join('\n      ')); }
  await b.close(); process.exit(n ? 1 : 0);
})();
