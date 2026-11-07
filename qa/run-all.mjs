// QA の全部を順に動かし、合否を qa-report.json と qa-report.md に書く。
// 使い方: node qa/run-all.mjs [quick|full]   （先に python3 build.py を実行しておく）
// smoke = main への変更ごと（約1分。公開前の最低限。変更前に手元で quick を通しておく） / quick = 週3回（約20分） / full = 毎週（全ステージ×5場面、長時間プレイ、車ジャンプなど）
// 終了コード: 全部合格 0 / どれか不合格 1
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODE = process.argv[2] || 'quick';

// テストごとの合格の条件（出力の文字で判定）
const has = (...w) => o => w.every(x => o.includes(x));
const noErr = o => /no errors|no issues/.test(o) && !/pageerror|FAIL|Uncaught/.test(o);
const T = [
  { n: 'dupcheck', why: '同じ名前の関数の二重定義（上書き事故）', ok: noErr },
  { n: 'qa', why: '画面の流れ・言語切替', ok: noErr },
  { n: 'reltest', why: '公開版で起動して遊べる', ok: noErr },
  { n: 'tut', why: 'チュートリアル', ok: noErr },
  { n: 'tut2', why: 'チュートリアルの続き', ok: noErr },
  { n: 'fever2', why: 'フィーバーの取りこぼし', ok: o => noErr(o) && /"missedBehind":0/.test(o) },
  { n: 'ranktest', why: 'ランキング表示', ok: noErr },
  { n: 'saves', why: '壊れたセーブからの復旧', ok: noErr },
  { n: 'forktest', why: '分かれ道の操作', ok: o => !/FAIL|pageerror/.test(o) && /-> play/.test(o) },
  { n: 'ui', why: 'スマホの表示崩れ', ok: o => noErr(o) && /overflow false/.test(o) },
  { n: 'jumpbug', why: 'ジャンプの不具合', ok: o => /fails 0/.test(o) && noErr(o) },
  { n: 'sharetest', why: 'SNSシェア（8パターン）', ok: has('ALL SHARE TESTS PASSED') },
  { n: 'feedtest', why: 'SNSの新作カード・あいことば', ok: o => has('受け取りました', 'Got it!')(o) && !/errors \[ '/.test(o) },
  { n: 'en_audit', why: '英語版の日本語混入・はみ出し', ok: has('EN_ISSUES 0') },
  { n: 'sizes', why: '画面サイズ4種', ok: o => (o.match(/ ok/g) || []).length >= 4 },
  { n: 'xfer', why: 'データ引き継ぎ', ok: noErr },
  { n: 'xferfull', why: 'データ引き継ぎをすみずみまで（4言語×スマホ/PC・LINEやメモから貼ったコード・古い版のセーブ・古いiPhone・この端末にも記録があるとき・ランキングの行が2つにならない・8文字のコードの入れ方・LINEから外のブラウザへ）', ok: has('XFER FULL OK'), timeout: 1000 },
  { n: 'rankpage', why: 'だれでも見られるランキングのページ', ok: noErr },
  { n: 'apptest', why: 'アプリ版（ランキング・オフライン）', ok: has('"offlinePlay": true') },
  { n: 'pomplay', why: 'ポムで走れる（会う前は出ない・3人そろう）', ok: has('POM PLAY OK'), timeout: 400 },
  { n: 'chaltest', why: '友だちへの挑戦リンク', ok: has('CHALLENGE OK'), timeout: 400 },
  { n: 'firstrun', why: 'はじめての30秒（ごほうび・初回ボーナス）', ok: has('FIRST RUN OK'), timeout: 300 },
  { n: 'resettest', why: 'データのリセット（ランキングの記録も消える）', ok: has('RESET OK'), timeout: 200 },
  { n: 'inputtest', why: '操作が効かなくならない（速いフリック・高く跳びすぎない）', ok: has('INPUT OK'), timeout: 200 },
  { n: 'forkstuck', why: '分かれ道で画面が止まって動けなくならない（曲がる瞬間に道が作れない・分かれ道の道がない・数値の壊れ・絵のメモリ切れ→道に戻す／だめなら結果画面）', ok: has('FORK STUCK OK'), timeout: 400 },
  { n: 'stuck', args: ['60'], why: '長く走っても動けなくならない（3人・夕方/2日目へ）', ok: has('NO STUCK'), timeout: 400 },
  { n: 'linktest', why: 'アカウントが2つにならない（つなぐコード・LINEから外のブラウザへ）', ok: has('LINK OK'), timeout: 300 },
  { n: 'hudfit', why: '上の3つの枠がスマホではみ出さない（スコア7〜9桁）', ok: has('HUD FIT OK'), timeout: 300 },
  { n: 'dailybonus', why: 'ログインボーナス（毎日・連続・1日1回）', ok: has('DAILY BONUS OK'), timeout: 200 },
  { n: 'rankwear', why: 'ランキングの顔が着せ替えた姿で出る', ok: has('RANK WEAR OK'), timeout: 200 },
  { n: 'seasonal', why: '季節の企画がもれなく切り替わる（初回から・古いリンクで戻らない・終わった帽子）', ok: has('SEASONAL OK'), timeout: 300 },
  { n: 'legend', why: '伝説のうさぎの特典（到達ずみの人にも・二重にもらえない・まだの人は買えない）', ok: has('LEGEND OK'), timeout: 300 },
  { n: 'pomwear', why: 'ポムの着せ替え（会ってから・買う・かぶる・はずす）', ok: has('POM WEAR OK'), timeout: 200 },
  { n: 'jumpfair', why: '飛び越えられそうなのに越えられない障害物がない（見た目と当たりの高さが合う）', ok: has('JUMP FAIR OK'), timeout: 120 },
  { n: 'hatfit', why: '帽子が頭にのっているだけにならない・ジルの耳が帽子から出る（全キャラの着せ替え一覧も撮る）', ok: has('HAT FIT OK'), timeout: 200 },
  { n: 'i18n_audit', why: '中国語・韓国語に訳のない文・カナが残っていない（全画面・走行中）', ok: has('I18N OK'), timeout: 400 },
  { n: 'reach', why: 'いくら遊んでも手に入らない物がない（図鑑・スタンプ・実績）', ok: has('REACH OK') },
  { n: 'growth', why: 'SNSとのつながり（フォローの列・シェアの ?ref=・最新話・控えめなひと言・結果の時刻・こわれた数字のセーブ・古いコードの pid）', ok: has('GROWTH OK'), timeout: 400 },
  { n: 'pbtest', why: '自己ベストを更新した瞬間に終わらない（1位の方からの報告・2026-11）', ok: has('PB OK'), timeout: 600 },
  { n: 'seo', why: '検索で見つけてもらう（タイトル・説明・ガイド・地図）', ok: has('SEO OK'), timeout: 200 },
];
if (MODE === 'smoke') { const keep = new Set(['dupcheck', 'qa', 'reltest', 'apptest', 'seo', 'reach']); for (let i = T.length - 1; i >= 0; i--) if (!keep.has(T[i].n)) T.splice(i, 1); }
if (MODE === 'full') {
  for (let i = 0; i < 6; i++) T.push({ n: 'qa_stage', env: { NP: '6', PI: String(i) }, label: 'qa_stage#' + i, why: '全ステージ×5場面の表示（' + (i + 1) + '/6）', ok: has('bad 0'), timeout: 700 });
  T.push({ n: 'stuck', args: ['300'], env: { LATE: '0' }, label: 'stuck-long', why: 'とても長く走っても動けなくならない（5分×3人）', ok: has('NO STUCK'), timeout: 1200 });
  T.push({ n: 'carjump', why: '低い物は跳べる・車はよける（高く飛びすぎない）', ok: o => !/HIT/.test(o) && !/TOOHIGH/.test(o) && /CARBLOCK ok/.test(o), timeout: 600 });
  T.push({ n: 'longrun', args: ['24'], why: 'スマホで長時間プレイ（止まり・メモリ）', ok: o => /"mode":"play"/.test(o) && !/pageerror|Uncaught/.test(o), timeout: 500 });
  T.push({ n: 'en_play', why: '英語版のプレイ中の文字', ok: o => /JP strings seen in EN play: 0/.test(o), timeout: 900 });
}

// テスト用の小さなサーバー（dist と app）
function serve(dir, port) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
  return new Promise(res => { const s = http.createServer(async (q, r) => { try { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const b = await readFile(path.join(dir, p)); r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); r.end(b); } catch (e) { r.writeHead(404); r.end(); } }); s.listen(port, '127.0.0.1', () => res(s)); });
}
function run(t) {
  return new Promise(res => {
    const p = spawn(process.execPath, [path.join(ROOT, 'qa', t.n + '.js'), ...(t.args || [])], { cwd: ROOT, env: { ...process.env, ...(t.env || {}) } });
    let out = ''; p.stdout.on('data', d => out += d); p.stderr.on('data', d => out += d);
    const k = setTimeout(() => { out += '\nTIMEOUT'; p.kill('SIGKILL'); }, (t.timeout || 300) * 1000);
    p.on('close', code => { clearTimeout(k); res({ code, out }); });
  });
}
const servers = [await serve(path.join(ROOT, 'dist'), 8765), await serve(path.join(ROOT, 'app'), 8790)];
mkdirSync(process.env.SHOTS || '/tmp/rj-shots', { recursive: true });
const results = []; const t0 = Date.now();
for (const t of T) {
  const s = Date.now(); const { code, out } = await run(t);
  const pass = !/TIMEOUT/.test(out) && t.ok(out);
  results.push({ name: t.label || t.n, why: t.why, pass, sec: Math.round((Date.now() - s) / 1000), tail: out.trim().split('\n').slice(-6).join('\n').slice(-900) });
  console.log((pass ? 'PASS ' : 'FAIL ') + (t.label || t.n) + ' (' + Math.round((Date.now() - s) / 1000) + 's)');
}
servers.forEach(s => s.close());
const failed = results.filter(r => !r.pass);
const report = { mode: MODE, at: new Date().toISOString(), sec: Math.round((Date.now() - t0) / 1000), passed: results.length - failed.length, total: results.length, failed: failed.map(f => f.name), results };
writeFileSync(path.join(ROOT, 'qa-report.json'), JSON.stringify(report, null, 1));
writeFileSync(path.join(ROOT, 'qa-report.md'), `# QA（${MODE}）${failed.length ? '不合格 ' + failed.length + '件' : '全部合格'}\n\n${results.map(r => `- ${r.pass ? '✅' : '❌'} ${r.why}（${r.name}・${r.sec}秒）`).join('\n')}\n\n${failed.map(f => `## ❌ ${f.name}\n\`\`\`\n${f.tail}\n\`\`\``).join('\n\n')}\n`);
console.log(failed.length ? 'QA FAILED: ' + failed.map(f => f.name).join(', ') : 'QA ALL PASSED ' + results.length);
process.exit(failed.length ? 1 : 0);
