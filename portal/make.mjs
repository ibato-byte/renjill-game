// ゲームサイトに上げる zip を作る：node portal/make.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url)), OUT = path.join(DIR, 'dist');
const SITES = ['itch', 'gamejolt', 'newgrounds', 'freem', 'plicy', 'portal'];
const page = ref => `<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>レンとジルのチモシーダッシュ / Ren &amp; Jill: Hay Dash</title>
<style>html,body{margin:0;height:100%;background:#FBF2E2;overflow:hidden}iframe{position:fixed;inset:0;width:100%;height:100%;border:0;display:block}
#alt{position:fixed;left:0;right:0;bottom:0;text-align:center;font:600 13px/1.6 system-ui,sans-serif;padding:6px;background:rgba(251,242,226,.92);display:none}
#alt a{color:#3B2A20}</style></head>
<body>
<iframe id="g" onload="window.__ok=1" src="https://hay-dash.coana.co.jp/?ref=${ref}" title="Ren &amp; Jill: Hay Dash" allow="fullscreen; autoplay; clipboard-write; web-share; gamepad" allowfullscreen></iframe>
<div id="alt">うまく表示されないときは <a href="https://hay-dash.coana.co.jp/?ref=${ref}" target="_blank" rel="noopener">こちらから遊べます / Play here</a></div>
<script>setTimeout(function(){if(!window.__ok)document.getElementById('alt').style.display='block'},10000);</script>
</body></html>
`;
mkdirSync(OUT, { recursive: true });
for (const s of SITES) {
  const d = path.join(OUT, s); mkdirSync(d, { recursive: true });
  writeFileSync(path.join(d, 'index.html'), page(s));
  execSync(`cd "${d}" && rm -f ../haydash-${s}.zip && zip -q ../haydash-${s}.zip index.html`);
  console.log('portal', s, path.join(OUT, `haydash-${s}.zip`));
}
