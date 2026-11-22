// 旧名が画面・検索向けの文に残っていないか（2026-11-22：ブランドを「東京うさぎオフィス」、キャラクターをモチ・ユズ・クリに改名）。
// 公開版（app/index.html・ガイド・食べ物のページ）と、元の文（src・i18n.json・seo.py）を見る。
// 内部の名前（ren・jill・pom・renHead・renjill・URL）は対象外（保存データ・絵の名前を壊さないため変えていない）。
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
// 旧名の一覧（この行は「旧名」を含む。置き換えの道具は書き換えない）
const OLD = /レンとジル|(?<![ァ-ー])(?:レン|ジル|ポム)(?![ァ-ー])|(?<![A-Za-z0-9_.$\/-])(?:R(?=en\b)en|J(?=ill\b)ill|P(?=om\b)om|R(?=EN\b)EN|J(?=ILL\b)ILL|P(?=OM\b)OM)(?![A-Za-z0-9_\/-])|蓮與吉兒|renjill_office/g;
const files = ['app/index.html', 'app/guide.html', 'app/guide-en.html', 'app/food.html', 'app/food-en.html', 'app/ranking.html', 'app/manifest.webmanifest', 'i18n.json', 'seo.py']
  .concat(fs.readdirSync(path.join(ROOT, 'src')).map(f => 'src/' + f));
let bad = 0;
for (const f of files) {
  const p = path.join(ROOT, f); if (!fs.existsSync(p)) continue;
  fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
    if (l.includes('旧名')) return;
    const hit = l.replace(/https?:\/\/[^\s"'<>)]+/g, '').match(OLD);
    if (hit) { bad++; if (bad <= 15) console.log(`${f}:${i + 1} ${[...new Set(hit)].join('・')}`); }
  });
}
console.log(bad ? `BRANDNAME NG ${bad}` : 'BRANDNAME OK');
process.exit(bad ? 1 : 0);
