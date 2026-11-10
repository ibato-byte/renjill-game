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
  { n: 'practice', why: '練習・場所えらび（ぶつかっても終わらない・記録に入らない）', ok: has('PRACTICE OK') },
  { n: 'hunt', why: 'あいことばのかくれんぼ（1回の走りに1枚・そろうとチモシー・期間外は出ない）', ok: has('HUNT OK') },
  { n: 'matsuri', why: 'お祭りの日（提灯の通りで祭りばやし）', ok: has('MATSURI OK') },
  { n: 'lasttrain', why: '終電間際（夜の最後の電車に間に合えばボーナス）', ok: has('LASTTRAIN OK') },
  { n: 'revday', why: '逆走デー（夕方から家まで・ただいまボーナス・ランキングに入れない）', ok: has('REVDAY OK') },
  { n: 'boss', why: '締め切りの山（ボスのバー・逃げ切りボーナス）', ok: has('BOSS OK') },
  { n: 'epgig', why: '動画のネタがステージの出来事に（最初のおしごと・1.5 倍）', ok: has('EPGIG OK') },
  { n: 'poseprio', why: 'ふり返り中でもしゃがむ・跳ぶ絵になる／ナイスジャンプで止まらない（2026-11-09 の報告）', ok: has('POSEPRIO OK') },
  { n: 'feedsync', why: '削除された動画を「新作」のリンクにしない', ok: has('FEEDSYNC OK') },
  { n: 'hudlayout', why: 'お知らせの帯が、パワーアップ・ライフ・ボスのバー・分かれ道のカードと重ならない（2026-11-09）', ok: has('HUDLAYOUT OK') },
  { n: 'textfit', why: '320px 幅・4 言語で、ボタンや名前が切れない（2026-11-09）', ok: has('TEXTFIT OK') },
  { n: 'seasontree', why: '季節と木が合っている（春に黄色いイチョウ、秋に桜が出ない）（2026-11-09）', ok: has('SEASONTREE OK') },
  { n: 'revive', why: '分かれ道の壁で続けたら寄っていた側へ曲がる・曲がった先の障害物もどける（2026-11-09）', ok: has('REVIVE OK') },
  { n: 'langbtn', why: '言語の切りかえボタンが題名画面の右上に見えていて、押すと4言語から選べる（2026-11-09 の声）', ok: has('LANGBTN OK') },
  { n: 'contrast', why: 'プレイ中の上の小さい文字（倍率・コンボ）が背景にとけない（2026-11-09）', ok: has('CONTRAST OK') },
  { n: 'quitconfirm', why: '一時停止の「やめる」は2回押し（まちがえて押しても終わらない）（2026-11-09）', ok: has('QUITCONFIRM OK') },
  { n: 'roomfit', why: '時計の下の場所名が、どの場所・季節・言語でも「…」で切れない（2026-11-09）', ok: has('ROOMFIT OK') },
  { n: 'resfit', why: '結果画面の点数が8桁・9桁でも枠からはみ出さない（2026-11-09 の報告）', ok: has('RESFIT OK') },
  { n: 'bannerdup', why: 'お知らせの帯の見出しと本文が同じことをくり返さない（2026-11-09）', ok: has('BANNERDUP OK') },
  { n: 'nofinish', why: '長く遊んでも、走りが壊れたら新しい道から続ける（「早退しました」で終わらない）（2026-11-10 の報告）', ok: has('NOFINISH OK') },
  { n: 'toastpos', why: '題名画面のお知らせがボタンにかぶらない（横向きなど6つの画面サイズ）（2026-11-10）', ok: has('TOASTPOS OK') },
  { n: 'charmtext', why: 'お守りの「続ける」が押せないときはグレーだけ（「（お守りがない）」と書かない）（2026-11-10 オーナー）', ok: has('CHARMTEXT OK') },
  { n: 'closetdup', why: '着せかえに同じ見た目の品が2つ並ばない（2026-11-09 の報告）', ok: has('CLOSETDUP OK') },
  { n: 'community', why: 'みんなの集計（今日の名所・行事の合計、古い月の記録の片づけ）・クラブのランキングが出ない（2026-11-10 にやめた）', ok: has('COMMUNITY OK') },
  { n: 'titlecard', why: '新しい称号のシェア用カード（結果画面のボタン）', ok: has('TITLECARD OK') },
  { n: 'goldtie', why: '月間ランキング上位3人に金のネクタイ（経歴にバッジ）', ok: has('GOLDTIE OK') },
  { n: 'album', why: '自己ベストの記念写真・牧草で育つ観葉植物', ok: has('ALBUM OK') },
  { n: 'visfx', why: '見た目の小さな追加（雨でぬれて光る・室内の光・足もとの土ぼこり）', ok: has('VISFX OK') },
  { n: 'padhand', why: '片手のタップ・ゲームパッド・画面を回したときの描き直し 1 回・エラーの記録', ok: has('PADHAND OK') },
  { n: 'hitwhat', why: 'ぶつかった物の絵が続ける画面・結果画面に出る（日英）', ok: has('HITWHAT OK') },
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
  { n: 'featureguard', why: '入れた機能が消えていない（古い版のファイルで上書きして、機能が気づかずに消えた事故の再発防止）', ok: has('FEATURE OK'), timeout: 60 },
  { n: 'portal', why: 'CrazyGames の中だけ：外へのリンクを出さない・遊んでいる合図・見たい人だけの広告。自社サイト版は広告なし', ok: has('PORTAL OK'), timeout: 200 },
  { n: 'jumpfair', why: '飛び越えられそうなのに越えられない障害物がない（見た目と当たりの高さが合う）', ok: has('JUMP FAIR OK'), timeout: 120 },
  { n: 'wallcheck', why: '3レーンとも壁（飛び越えられない）の列が出ない', ok: has('WALL OK'), timeout: 200 },
  { n: 'worldcheck', why: '取れない物（壁や車に埋まった牧草）・重なった障害物・避けようのないダメな食べ物がない', ok: has('WORLD OK'), timeout: 300 },
  { n: 'soundcheck', why: '耳ざわりな音がない（むき出しの電子音・高すぎる音・牧草の音の大きさ）', ok: has('SOUND OK'), timeout: 30 },
  { n: 'tapcheck', why: 'ボタンが押しやすい大きさで、文字が切れていない（320・390 幅、日英）', ok: has('TAP OK'), timeout: 300 },
  { n: 'funcheck', why: '面白くなる機能が動く（パーフェクトライン・コンボの節目・SPEED UP・スロー・金の道・今日の目標）', ok: has('FUN OK'), timeout: 200 },
  { n: 'gigcheck', why: '走っている途中のおしごと（30〜45秒ごと・4種類とも成功と失敗・ごほうび・表示が日英で切れない）', ok: has('GIG OK'), timeout: 200 },
  { n: 'weekgoal', why: '今週の目標（週の合計・1回だけのごほうび・週が変わると0から・ミッション画面に出る）', ok: has('WEEK GOAL OK'), timeout: 200 },
  { n: 'modecheck', why: 'のんびりモード・1分ダッシュ・なかよし度が動く（自己ベストとランキングを分ける）', ok: has('MODE OK'), timeout: 200 },
  { n: 'hatfit', why: '帽子が頭にのっているだけにならない・ジルの耳が帽子から出る（全キャラの着せ替え一覧も撮る）', ok: has('HAT FIT OK'), timeout: 200 },
  { n: 'i18n_audit', why: '中国語・韓国語に訳のない文・カナが残っていない（全画面・走行中）', ok: has('I18N OK'), timeout: 400 },
  { n: 'reach', why: 'いくら遊んでも手に入らない物がない（図鑑・スタンプ・実績）', ok: has('REACH OK') },
  { n: 'growth', why: 'SNSとのつながり（フォローの列・シェアの ?ref=・最新話・控えめなひと言・結果の時刻・こわれた数字のセーブ・古いコードの pid）', ok: has('GROWTH OK'), timeout: 400 },
  { n: 'pbtest', why: '自己ベストを更新した瞬間に終わらない（1位の方からの報告・2026-11）', ok: has('PB OK'), timeout: 600 },
  { n: 'seo', why: '検索で見つけてもらう（タイトル・説明・ガイド・地図）', ok: has('SEO OK'), timeout: 200 },
];
if (MODE === 'smoke') { const keep = new Set(['featureguard', 'dupcheck', 'qa', 'reltest', 'apptest', 'seo', 'reach', 'soundcheck']); for (let i = T.length - 1; i >= 0; i--) if (!keep.has(T[i].n)) T.splice(i, 1); }
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
  const s = Date.now(); let { code, out } = await run(t);
  let pass = !/TIMEOUT/.test(out) && t.ok(out), flaky = false, first = '';
  const failLines = o => o.split('\n').filter(l => /FAIL|TIMEOUT|Error|pageerror/.test(l)).slice(0, 8).join('\n').slice(0, 800);
  /* 不合格なら1回だけやり直す（CI の機械が遅いと時間切れで落ちる試験がある。2回目で通れば「不安定」として記録し、合格扱い。2回とも落ちたら不合格） */
  if (!pass) { first = failLines(out); ({ code, out } = await run(t)); pass = !/TIMEOUT/.test(out) && t.ok(out); flaky = pass; }
  /* 落ちた理由の行（FAIL など）は、最後の6行に入っていなくても必ず残す */
  const why = failLines(out);
  results.push({ name: t.label || t.n, why: t.why, pass, flaky, first, sec: Math.round((Date.now() - s) / 1000), tail: (why && !pass ? why + '\n...\n' : '') + out.trim().split('\n').slice(-6).join('\n').slice(-900) });
  console.log((pass ? (flaky ? 'PASS(retry) ' : 'PASS ') : 'FAIL ') + (t.label || t.n) + ' (' + Math.round((Date.now() - s) / 1000) + 's)' + (flaky ? ' first: ' + first.replace(/\n/g, ' | ').slice(0, 300) : ''));
}
servers.forEach(s => s.close());
const failed = results.filter(r => !r.pass);
const report = { mode: MODE, at: new Date().toISOString(), sec: Math.round((Date.now() - t0) / 1000), passed: results.length - failed.length, total: results.length, failed: failed.map(f => f.name), results };
writeFileSync(path.join(ROOT, 'qa-report.json'), JSON.stringify(report, null, 1));
writeFileSync(path.join(ROOT, 'qa-report.md'), `# QA（${MODE}）${failed.length ? '不合格 ' + failed.length + '件' : '全部合格'}\n\n${results.map(r => `- ${r.pass ? '✅' : '❌'} ${r.why}（${r.name}・${r.sec}秒）`).join('\n')}\n\n${failed.map(f => `## ❌ ${f.name}\n\`\`\`\n${f.tail}\n\`\`\``).join('\n\n')}\n`);
console.log(failed.length ? 'QA FAILED: ' + failed.map(f => f.name).join(', ') : 'QA ALL PASSED ' + results.length);
process.exit(failed.length ? 1 : 0);
