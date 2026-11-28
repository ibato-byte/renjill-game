// 2026-11-28：1 行に「const A = …, B = …」と並べて決めた名前も、ほかのファイルとかぶっていないか（qa/dupcheck は行の最初の名前しか見ない。景色 1000 の作業で BUS が描く側の BUS とかぶり、ゲームが動かなくなった）
const fs = require('fs'), path = require('path'); const dir = path.resolve(__dirname, '../src'), seen = {}, dup = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) fs.readFileSync(path.join(dir, f), 'utf8').split('\n').forEach((l, i) => {
  const m = /^(?:const|let|var)\s+(.*)$/.exec(l); if (!m) return; let depth = 0, cur = '', parts = [];
  for (const ch of m[1]) { if ('([{'.includes(ch)) depth++; else if (')]}'.includes(ch)) depth--; if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch; if (ch === ';' && depth === 0) break; } parts.push(cur);
  for (const p of parts) { const n = /^\s*([A-Za-z_$][\w$]*)\s*=/.exec(p); if (!n) continue; if (seen[n[1]] && seen[n[1]] !== f + ':' + (i + 1)) dup.push(n[1] + ': ' + seen[n[1]] + ' と ' + f + ':' + (i + 1)); else seen[n[1]] = f + ':' + (i + 1); } });
if (dup.length) { console.log('RXNAMES NG\n' + dup.join('\n')); process.exit(1); } console.log('RXNAMES OK ' + Object.keys(seen).length);
