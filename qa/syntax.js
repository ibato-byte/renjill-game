// 2026-11-28：src のファイルが、どれも正しい書き方になっているか（build.py は、つなげるだけで、書きまちがいに気づかない。
//  舞浜のブラッシュアップ中に、消し残した 1 行のせいでゲームが真っ白になった。画面を開くまで分からなかったので、ここで先に止める）。
const fs = require('fs'), path = require('path'), cp = require('child_process'); const dir = path.resolve(__dirname, '../src'), bad = [];
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
for (const f of files) { const r = cp.spawnSync(process.execPath, ['--check', path.join(dir, f)], { encoding: 'utf8' }); if (r.status !== 0) bad.push(f + ': ' + ((r.stderr || '').split('\n').find(l => /Error/.test(l)) || '書きまちがい')); }
if (bad.length) { console.log('SYNTAX NG\n' + bad.join('\n')); process.exit(1); } console.log('SYNTAX OK ' + files.length);
