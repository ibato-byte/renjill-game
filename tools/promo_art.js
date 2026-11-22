// 紹介動画の「文字」と「最後の 4 秒」を作る（キャラクターの絵はゲームと同じ描き方）。
// 使い方: node tools/promo_art.js dist/test.html <出力フォルダ> <フォントのフォルダ（make_og.js と同じ）>
//   → cap_0.png…（透明・1080×1920）と end/0000.jpg…（120 コマ）。組み立ては tools/make_promo.py。
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const CAPS = [['LATE FOR WORK!', '寝坊した課長、出社までダッシュ'], ['GRAB THE HAY', 'チモシーを集めて東京ダッシュ'], ['100+ TOKYO SPOTS', '東京100か所以上を走る'], ['PICK YOUR RUNNER', 'モチ・ユズ・新人のクリ']];
(async () => { const [html, out, fdir] = process.argv.slice(2); fs.mkdirSync(path.join(out, 'end'), { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined, args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 })));
  await p.goto('file://' + path.resolve(html)); await p.waitForTimeout(2500);
  const art = await p.evaluate(() => window.__hayDash.ev(`(() => { const o = {}; for (const w of ['ren','jill','pom']) for (const m of ['open','blink','happy']) { const c = bunHi(w, m, BUN[w]['front_' + m], 2.4); o[w + '_' + m] = c.toDataURL('image/png'); BUN_HI[w] = []; } return o; })()`));
  const F = (fam, file, w) => `@font-face{font-family:"${fam}";src:url("file://${fdir}/${file}") format("woff2");font-weight:${w}}`;
  const css = [F('PDela', '@fontsource/dela-gothic-one/files/dela-gothic-one-japanese-400-normal.woff2', 400), F('PDela', '@fontsource/dela-gothic-one/files/dela-gothic-one-latin-400-normal.woff2', 400), F('PZen', '@fontsource/zen-maru-gothic/files/zen-maru-gothic-japanese-900-normal.woff2', 900), F('PZen', '@fontsource/zen-maru-gothic/files/zen-maru-gothic-latin-900-normal.woff2', 900)].join('\n') + `
    html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:transparent}
    .cap{position:absolute;left:0;right:0;top:470px;text-align:center}
    .cap b{display:block;font:400 104px/1.08 PDela,sans-serif;color:#fff;-webkit-text-stroke:20px #3A2414;paint-order:stroke fill;letter-spacing:.01em;text-shadow:0 10px 0 rgba(58,36,20,.55)}
    .cap i{display:block;margin-top:14px;font:900 50px/1.2 PZen,sans-serif;font-style:normal;color:#FFD95A;-webkit-text-stroke:13px #3A2414;paint-order:stroke fill}
    .end{position:absolute;inset:0;background:radial-gradient(120% 70% at 50% 46%,#FFF6E2 0%,#F6E6C8 52%,#E9D2A6 100%);overflow:hidden}
    .end .ray{position:absolute;left:50%;top:50%;width:2400px;height:2400px;margin:-1200px;background:repeating-conic-gradient(rgba(255,255,255,.34) 0 7deg,transparent 7deg 20deg);-webkit-mask:radial-gradient(circle,#000 0,transparent 62%);mask:radial-gradient(circle,#000 0,transparent 62%)}
    .end .k{position:absolute;left:0;right:0;top:300px;text-align:center;font:900 46px/1 PZen,sans-serif;color:#B8791A;letter-spacing:.04em}
    .end h1{position:absolute;left:0;right:0;top:372px;margin:0;text-align:center;font:400 118px/1.16 PDela,sans-serif;color:#3A2414;letter-spacing:.01em}
    .end .ch{position:absolute;bottom:690px;transform-origin:50% 100%}
    .end .ch img{position:absolute;inset:0;width:100%;height:100%}
    .end .sh{position:absolute;bottom:672px;height:44px;border-radius:50%;background:rgba(92,60,28,.2);filter:blur(6px)}
    .end .free{position:absolute;left:50%;top:1290px;transform:translateX(-50%);padding:18px 44px;border-radius:999px;background:#D9A520;color:#3A2414;font:900 50px/1 PZen,sans-serif;white-space:nowrap;box-shadow:0 8px 0 #A87A12}
    .end .cta{position:absolute;left:50%;top:1440px;padding:34px 64px;border-radius:999px;background:#3A2414;color:#fff;font:900 56px/1 PZen,sans-serif;white-space:nowrap;box-shadow:0 12px 0 rgba(58,36,20,.28)}
    .end .bio{position:absolute;left:0;right:0;top:1612px;text-align:center;font:900 46px/1 PZen,sans-serif;color:#B8791A}
    .hay{position:absolute;width:10px;height:54px;border-radius:6px;background:#D9A520;opacity:.5}`;
  await p.setContent(`<style>${css}</style><div id="root"></div>`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  for (const [i, [en, ja]] of CAPS.entries()) { await p.evaluate(([en, ja]) => { document.getElementById('root').innerHTML = `<div class="cap"><b>${en}</b><i>${ja}</i></div>`; }, [en, ja]); await p.screenshot({ path: path.join(out, `cap_${i}.png`), omitBackground: true }); }
  // 最後の 4 秒：題名 → 3 人が順に飛び出す → 無料 → 押す場所。時間 t（秒）から形を決める（何度撮っても同じ絵）
  await p.evaluate(art => { const hay = Array.from({ length: 26 }, (_, i) => { const r = n => { const x = Math.sin((i + 1) * 12.9898 * n) * 43758.5453; return x - Math.floor(x); }; return `<i class="hay" data-i="${i}" style="left:${Math.round(r(1) * 1040)}px;top:${Math.round(r(2) * 1880)}px;--r:${Math.round(r(3) * 180)}"></i>`; }).join('');
    const ch = (w, x, s) => `<div class="sh" data-w="${w}" style="left:${x + s * .16}px;width:${s * .68}px"></div><div class="ch" data-w="${w}" style="left:${x}px;width:${s}px;height:${s}px">${['open', 'blink', 'happy'].map(m => `<img data-m="${m}" src="${art[w + '_' + m]}">`).join('')}</div>`;
    document.getElementById('root').innerHTML = `<div class="end"><div class="ray"></div>${hay}<div class="k">Tokyo Usagi Office: Hay Dash</div><h1>東京うさぎオフィスの<br>チモシーダッシュ</h1>${ch('ren', 230, 620)}${ch('jill', 640, 420)}${ch('pom', 30, 380)}<div class="free">FREE ・ 無料</div><div class="cta">▶ プロフィールのリンクから</div><div class="bio">Link in bio</div></div>`; }, art);
  await p.waitForTimeout(500);
  for (let f = 0; f < 120; f++) { await p.evaluate(t => { const $ = s => document.querySelector(s), E = (a, b) => Math.max(0, Math.min(1, (t - a) / (b - a))), back = k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }, out3 = k => 1 - Math.pow(1 - k, 3);
      $('.ray').style.transform = `rotate(${t * 5}deg)`; $('.end').style.opacity = 1;
      for (const h of document.querySelectorAll('.hay')) { const i = +h.dataset.i; h.style.transform = `translateY(${Math.sin(t * .9 + i) * 14}px) rotate(${+h.style.getPropertyValue('--r') + Math.sin(t * .7 + i * 2) * 12}deg)`; }
      const k = out3(E(0, .4)); $('.k').style.opacity = k; $('.k').style.transform = `translateY(${(1 - k) * 30}px)`;
      const h = E(.08, .58); $('.end h1').style.opacity = Math.min(1, h * 3); $('.end h1').style.transform = `scale(${.7 + .3 * back(h)})`;
      for (const [w, t0, ph] of [['ren', .3, 0], ['jill', .48, 1.3], ['pom', .66, 2.4]]) { const e = document.querySelector(`.ch[data-w=${w}]`), s = document.querySelector(`.sh[data-w=${w}]`), a = E(t0, t0 + .5), pop = a <= 0 ? 0 : back(a), bob = a >= 1 ? Math.sin((t - t0) * 2.6 + ph) : 0;
        e.style.opacity = a > 0 ? 1 : 0; e.style.transform = `translateY(${(1 - Math.min(1, pop)) * 160 - Math.max(0, pop - 1) * 60}px) scale(${.6 + .4 * pop + bob * .008},${.6 + .4 * pop - bob * .012})`; s.style.opacity = Math.min(1, a * 2); s.style.transform = `scaleX(${.7 + .3 * Math.min(1, pop)})`;
        const blink = Math.abs(t - (1.9 + ph * .35)) < .07 || Math.abs(t - (3.2 + ph * .2)) < .07, happy = t > 2.35 + ph * .12 && t < 3.05 + ph * .12; for (const im of e.querySelectorAll('img')) im.style.opacity = im.dataset.m === (happy ? 'happy' : blink ? 'blink' : 'open') ? 1 : 0; }
      const fr = E(1.0, 1.4); $('.free').style.opacity = Math.min(1, fr * 3); $('.free').style.transform = `translateX(-50%) scale(${fr <= 0 ? 0 : .5 + .5 * back(fr)}) rotate(-3deg)`;
      const c = E(1.3, 1.75), pulse = c >= 1 ? 1 + Math.sin((t - 1.75) * 5.2) * .022 : 1; $('.cta').style.opacity = Math.min(1, c * 3); $('.cta').style.transform = `translateX(-50%) scale(${(c <= 0 ? 0 : .6 + .4 * back(c)) * pulse})`;
      $('.bio').style.opacity = out3(E(1.6, 2.0)); }, f / 30);
    await p.screenshot({ path: path.join(out, 'end', String(f).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 94 }); }
  await b.close(); console.log('captions', CAPS.length, 'end frames 120'); })();
