// 共有用の画像（app/og.png 1200x630）を作る（2026-11-15 作り直し：前の画像は、英語の説明の後ろを障子の線が横切って打ち消し線のように見えていた）。
// 使い方: python3 build.py && node tools/make_og.js dist/test.html /tmp/og2x.png <フォントのフォルダ>  → 1200x630 に縮めて app/og.png に置く
//   フォントのフォルダ＝ npm i @fontsource/dela-gothic-one @fontsource/zen-maru-gothic した node_modules（どちらも無料の SIL OFL。ゲームと同じ字）
// アプリのアイコン（icon-512.png など）は renjill-auto の rig/icon3.js で作る（キャラクターの絵は SNS と同じ元の絵）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const [html, out, fdir] = process.argv.slice(2); const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined, args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(html)); await p.waitForTimeout(2200);
  const F = (fam, file, w) => `@font-face{font-family:"${fam}";src:url("file://${fdir}/${file}") format("woff2");font-weight:${w}}`;
  await p.addStyleTag({ content: [F('OGDela', '@fontsource/dela-gothic-one/files/dela-gothic-one-japanese-400-normal.woff2', 400), F('OGDela', '@fontsource/dela-gothic-one/files/dela-gothic-one-latin-400-normal.woff2', 400), F('OGZen', '@fontsource/zen-maru-gothic/files/zen-maru-gothic-japanese-700-normal.woff2', 700), F('OGZen', '@fontsource/zen-maru-gothic/files/zen-maru-gothic-latin-700-normal.woff2', 700), F('OGZen', '@fontsource/zen-maru-gothic/files/zen-maru-gothic-japanese-900-normal.woff2', 900), F('OGZen', '@fontsource/zen-maru-gothic/files/zen-maru-gothic-latin-900-normal.woff2', 900)].join('\n').replace(/latin-(\d+)-normal\.woff2"\) format\("woff2"\);font-weight:(\d+)\}/g, 'latin-$1-normal.woff2") format("woff2");font-weight:$2;unicode-range:U+0000-00FF}') });
  await p.evaluate(() => { const H = window.__hayDash, G = H.G; for (const id of ['sTitle', 'hud']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; } document.querySelectorAll('#app > .toast, #btnLangTop').forEach(e => e.style.display = 'none');
    const ren = H.ev("bunHi('ren','happy',BUN.ren.front_happy,2.2).toDataURL()"), jill = H.ev("bunHi('jill','happy',BUN.jill.front_happy,2.2).toDataURL()");
    G.player.show = false; G.follow.show = false; G.pom.show = false; H.ev('render()');
    const bg = document.getElementById('cv').toDataURL('image/jpeg', .95);
    const d = document.createElement('div'); d.id = 'ogx'; d.innerHTML = `<style>
      #ogx{position:absolute;inset:0;z-index:99;pointer-events:none;font-family:"OGZen",sans-serif;background:#3B2A20 url(${bg}) center/cover}
      #ogx .shade{position:absolute;inset:0;background:linear-gradient(100deg,rgba(46,30,20,.9) 0%,rgba(46,30,20,.74) 36%,rgba(46,30,20,.12) 62%,rgba(46,30,20,0) 75%),radial-gradient(ellipse at 76% 96%,rgba(30,18,10,.34) 0%,rgba(30,18,10,0) 42%)}
      #ogx .t{position:absolute;left:62px;top:70px;color:#FBF6EE}
      #ogx .k{font-weight:900;font-size:26px;letter-spacing:.22em}
      #ogx .l{font-family:"OGDela","OGZen",sans-serif;font-size:100px;line-height:1.08;margin-top:8px;color:#FBF6EE;text-shadow:0 7px 0 #24160d,0 0 26px rgba(0,0,0,.25);letter-spacing:.01em}
      #ogx .l b{display:block;color:#F6C545;font-weight:400}
      #ogx .s{font-weight:700;font-size:26px;margin-top:20px;line-height:1.5}
      #ogx .c{display:inline-block;margin-top:24px;background:#D8473B;color:#fff;font-weight:900;font-size:27px;padding:11px 30px;border-radius:999px;border:4px solid #FBF6EE;box-shadow:0 5px 0 rgba(0,0,0,.35)}
      #ogx img{position:absolute;filter:drop-shadow(0 10px 6px rgba(30,18,10,.28))}
    </style><div class="shade"></div><img src="${ren}" style="height:520px;right:150px;bottom:6px"><img src="${jill}" style="height:400px;right:8px;bottom:0px">
    <div class="t"><div class="k">REN &amp; JILL ・ レンとジル</div><div class="l">チモシー<b>ダッシュ！</b></div><div class="s">うさぎの課長と部下が、東京をかけぬける<br>Two office bunnies dash across Tokyo</div><div class="c">無料で遊べる ・ Free to play</div></div>`; document.getElementById('app').appendChild(d); });
  await p.evaluate(() => document.fonts.load('100px OGDela', 'チモシーダッシュ！').then(() => document.fonts.load('900 26px OGZen', 'レンとジル無料で遊べる')).then(() => document.fonts.load('700 26px OGZen', 'うさぎの課長と部下が、東京をかけぬける')));
  await p.waitForTimeout(900); console.log(await p.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + f.weight).join(',')));
  await p.screenshot({ path: out }); await b.close(); })();
