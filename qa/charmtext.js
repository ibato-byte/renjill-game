// 続けるボタン（お守り）が押せないときは、グレーにするだけで「（お守りがない）」などの文字を足さない（2026-11-10 オーナー：グレーで分かる）
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.resolve(__dirname, '../src/7_ui.js'), 'utf8');
const bad = /bc\.textContent\s*\+=/.test(src) || /t\('rvNoClover'\)/.test(src);
console.log(bad ? 'CHARMTEXT NG お守りの続けるボタンに理由の文字を足している' : 'CHARMTEXT OK');
