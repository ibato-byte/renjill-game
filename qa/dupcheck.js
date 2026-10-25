// 同じ名前の関数・定数が2回定義されていないか（あとの定義が前のものを黙って上書きして、絵が壊れるのを防ぐ）
const fs = require('fs'), path = require('path');
const dir = path.resolve(__dirname, '../src'); const seen = {}; const dup = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) {
  fs.readFileSync(path.join(dir, f), 'utf8').split('\n').forEach((l, i) => { const m = /^(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(|^(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=/.exec(l); if (!m) return; const n = m[1] || m[2]; if (seen[n]) dup.push(`${n}: ${seen[n]} と ${f}:${i + 1}`); else seen[n] = `${f}:${i + 1}`; });
}
if (dup.length) { console.log('DUPLICATE\n' + dup.join('\n')); process.exit(1); }
console.log('no duplicates, ' + Object.keys(seen).length + ' names; no errors');
