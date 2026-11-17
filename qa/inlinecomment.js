// 1 行の途中の「//」のあとに、命令が続いていない（2026-11-17）
// 説明を書き足した時に、その後ろの命令（閉じかっこなど）まで説明の中に入って消えてしまう失敗が、何度も起きた（ゲームが「読み込み中」のまま止まった）。
// 開いていないかっこを説明の中で閉じている形（「]) : null,」など。2026-11-17 アニメ側で起こしかけた）も止める
// src/*.js の各行で、文字列の外にある「// 」のあとに、かっこ・命令・「=」が続いていたら止める
const fs = require('fs'), path = require('path');
const dir = path.resolve(__dirname, '../src'), bad = [];
const strip = (l) => l.replace(/\\./g, '__').replace(/'[^']*'|"[^"]*"|`[^`]*`|\/(?![/*])(?:[^/\\\n]|\\.)+\/[gimsuy]*/g, "''");
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
  fs.readFileSync(path.join(dir, f), 'utf8').split('\n').forEach((line, i) => {
    const code = strip(line), k = code.indexOf('// '); if (k <= 0 || /^\s*$/.test(code.slice(0, k))) return;
    const rest = code.slice(k + 3).replace(/（[^）]*）/g, '').replace(/[^\x00-\x7f]+/g, ' ').replace(/\[[\w.\-]+\]/g, ' ');   // 「[42]」のような番号は命令ではない
    if (/\b(?:if|for|while)\s*\(|\b[A-Za-z_$][\w$.]*\([^()]*\)\s*;|^\s*[})\]]+\s*[;,]?\s*$|\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=|\b[A-Za-z_$][\w$.]*\s*=\s*[[{'"]|[}\]]\s*[;,)]?\s*$/.test(rest) || ((t) => (t.match(/[)\]}]/g) || []).length > (t.match(/[([{]/g) || []).length)(line.slice(line.lastIndexOf('// ')).replace(/[^\x00-\x7f]+/g, ' '))) bad.push(`${f}:${i + 1} ${line.trim().slice(0, 90)}`);
  });
}
if (bad.length) { console.log('INLINECOMMENT NG（// のあとに命令がある）\n' + bad.slice(0, 20).join('\n')); process.exit(1); }
console.log('INLINECOMMENT OK');
