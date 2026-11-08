// 入れた機能が消えていないかの見張り（qa/features.json の「しるし」が全部残っているか）
// 2026-11-08：古い版のファイルをもとにした変更で、操作感の改善（足音・着地・コヨーテジャンプ・コンボの弾み・テストのやり直し）が
// 公開版から気づかずに消えた。同じことが起きたら、ここで必ず止まる
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..'), list = JSON.parse(fs.readFileSync(path.join(__dirname, 'features.json'), 'utf8')).features;
const cache = {}, lost = [];
for (const f of list) { const t = cache[f.file] ??= (fs.existsSync(path.join(root, f.file)) ? fs.readFileSync(path.join(root, f.file), 'utf8') : ''); if (!t.includes(f.has)) lost.push(`${f.name}（${f.file}：${f.has}）`); }
console.log(lost.length ? 'FEATURE NG 消えた機能:\n' + lost.join('\n') : `FEATURE OK ${list.length} features`);
