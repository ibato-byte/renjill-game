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
  { n: 'vanish', why: 'キャラクターが透明になって消えたままにならない（iPhone が保存してある絵を空にしても、2秒以内に描き直す。題名画面・プレイ中・全部の絵）（2026-11-13 の報告）', ok: has('VANISH OK') },
  { n: 'keepplay', why: '続けて高い点を目指したくなる仕組み31個（つぎの目標・大台・ぬいた相手・評価・おしい！・うちわけ・きろく・勲章・今日の目標スコア・れんぞく・スタートブースト・おかえり など）（2026-11-13 オーナーの依頼）', ok: has('KEEPPLAY OK'), timeout: 300 },
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
  { n: 'kbcue', why: 'PC は矢印キー・スマホはスワイプで案内（4言語）', ok: has('KB CUE OK'), timeout: 300 },
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
  { n: 'toriiview', why: '鳥居のトンネルで道の先が見える（横木がカメラの目の高さより上・道の先が赤い鳥居でかくれない。縦長のスマホ・ふつうのスマホ・PC）（2026-11-15 オーナーの報告）', ok: has('TORIIVIEW OK'), timeout: 200 },
  { n: 'ceilview', why: '室内・電車で天井が低く見えない・ジャンプしてもカメラとキャラクターが天井をこえない・外は今までどおり（縦長のスマホ・ふつうのスマホ・PC）（2026-11-15 オーナーの報告）', ok: has('CEILVIEW OK'), timeout: 200 },
  { n: 'resume', why: '途中で閉じてしまった走りを、つづきから再開できる（点・チモシー・日・時刻・場所がそのまま／終わった走りは出ない／3 回まで・12 時間／練習と1分ダッシュは対象外／保存データには入らない）（2026-11-15 オーナーの希望）', ok: has('RESUME OK'), timeout: 200 },
  { n: 'quality', why: '重い端末の画質の自動調整の順番（やわらかい光をやめる → 細かさを下げる → 軽いモード）・軽くなったら戻る・「きれい」「軽い」の設定（2026-11-15）', ok: has('QUALITY OK'), timeout: 120 },
  { n: 'motion', why: '跳ぶ瞬間の沈み・レーン移動の残像が出る／「動きをひかえめ」では出ない／跳び始めは押した瞬間（2026-11-15）', ok: has('MOTION OK'), timeout: 120 },
  { n: 'pausefit', why: '一時停止のボタンの文字が切れない（「やめる」の確かめの言葉が「もう一度押…」と切れていた。4 言語 × 3 つの幅）（2026-11-15 オーナーの報告）', ok: has('PAUSEFIT OK'), timeout: 240 },
  { n: 'iosfill', why: 'iPhone のホーム画面アプリで下に暗い帯が残らない手当てが、ほかの環境をこわさない（2026-11-15）', ok: has('IOSFILL OK'), timeout: 120 },
  { n: 'lightfx', why: '夕方の光のすじ（昼・夜・軽いモードでは出ない）・やわらかい光（軽いモードでは働かない）（2026-11-15）', ok: has('LIGHTFX OK'), timeout: 120 },
  { n: 'buntint', why: '夕方の光でキャラクターが急に赤くならない・色の変化がなめらか（2026-11-15：18:00 の外で赤くなった）', ok: has('BUNTINT OK'), timeout: 120 },
  { n: 'animelook', why: 'キャラクターがアニメ（SNS の動画）と同じ絵のまま：色・形のもとの数字、前向きの絵の色、体の向き、帽子（2026-11-15：耳・口元・色が少しずつ違っていた）', ok: has('ANIMELOOK OK'), timeout: 120 },
  { n: 'picksteady', why: 'キャラクターを選んだとき、絵がはねたり切りかわったりしない（2026-11-15：オーナー「チカチカするやつ、いらない」）', ok: has('PICKSTEADY OK'), timeout: 120 },
  { n: 'planekeep', why: '紙飛行機に乗っても仲間と紙飛行機が消えない：絵の置き場が空になっても（スマホ）描き直す・1 人の失敗でほかの人が消えない（2026-11-15 の報告）', ok: has('PLANEKEEP OK'), timeout: 120 },
  { n: 'titlefront', why: 'タイトル画面で 3 人みんな前を向く（2026-11-15 の報告：レンを選んでいるのに前を向いているのはポムだけ。命令が説明書きの中に入って動いていなかった）', ok: has('TITLEFRONT OK'), timeout: 120 },
  { n: 'rankicon', why: 'ランキングの丸い顔が真ん中に来る（2026-11-15 の報告：レンは右寄り・ジルは左寄り）', ok: has('RANKICON OK'), timeout: 120 },
  { n: 'wearfit', why: '帽子が自然に見える：全部の帽子 × 3 人で、目が隠れない・ジルの耳が両方見える・わくからはみ出さない・後ろ姿でも頭にのる（2026-11-15：「帽子をただ載せただけ」「ベレー帽で耳が突き出す」）', ok: has('WEARFIT OK'), timeout: 180 },
  { n: 'fitroom', why: '試着室：着せかえの列を押すと鏡の中で着てみせる。チモシーも保存も変わらない・買うボタンは今までどおり（2026-11-16）', ok: has('FITROOM OK'), timeout: 120 },
  { n: 'homelight', why: 'ホーム画面：選んだ子がまん中のいちばん手前・明かりは選んだ子だけ（2026-11-16 の報告：ポムを選ぶとジルにもスポット。だれを選んだか分かりづらい）／走っている間は光を描かない', ok: has('HOMELIGHT OK'), timeout: 150 },
  { n: 'titlestill', why: 'ホーム画面：顔が切りかわらない（まばたき・にっこり・あくびが点滅に見えた。2026-11-16 オーナー：「キャラクター選択してる時に点滅するはいらない」）', ok: has('TITLESTILL OK'), timeout: 120 },
  { n: 'floattext', why: '浮かぶ文字が重ならない（2026-11-16：新しい食べ物を続けて取ると「NEW! 図鑑に…」が重なって読めなかった）', ok: has('FLOATTEXT OK'), timeout: 60 },
  { n: 'trainplace', why: '電車は線路のある場所だけ（2026-11-16 の報告：公園で電車が通る。公園・水辺に線路の橋が出ない／高架の電車が高架からはみ出さない）', ok: has('TRAINPLACE OK'), timeout: 120 },
  { n: 'wallsee', why: '建物の中から、壁の向こう（外・次の次の場所）が見えない（2026-11-15 の報告：壁が透けて次の次のステージが見える。曲がり角の奥の壁の左右と上に壁が無かった）', ok: has('WALLSEE OK'), timeout: 300 },
  { n: 'paperedge', why: '書類の山が画面の右の端まで届いている（2026-11-15 オーナー：スマホで右下にすき間）', ok: has('PAPEREDGE OK'), timeout: 180 },
  { n: 'titlemusic', why: 'はじめて開いて 1 回ふれたら、題名の曲が流れる（スマホのタップ・クリック・キー）（2026-11-15 オーナー）', ok: has('TITLEMUSIC OK'), timeout: 120 },
  { n: 'audiotest', why: '音の仕組みが壊れていない（題名の曲・場所ごとの曲と調・メニューで音がこもる・効果音で曲が下がる・終わりの音・音量の上限）（2026-11-15）', ok: has('AUDIO OK'), timeout: 120 },
  { n: 'bootfast', why: '起動を速くした仕組みで絵が欠けない（開いて 3 秒で全部の絵・すぐスタートしても走る絵がある・着せかえは開いた時から・すぐ「あそびかた」でも走る絵）（2026-11-15）', ok: has('BOOTFAST OK'), timeout: 120 },
  { n: 'cardframe', why: 'シェア画像の写真に、キャラクターが頭から足まで入る（縦長のスマホで頭しか入らなかった）（2026-11-15）', ok: has('CARDFRAME OK'), timeout: 120 },
  { n: 'jumppose', why: 'ジャンプの絵が のぼり → くだり → 走る の順に変わる・3 匹とも落ちてくる絵がある（2026-11-15）', ok: has('JUMPPOSE OK'), timeout: 90 },
  { n: 'memlong', why: '長く走っても絵のメモリが増え続けない（8日目に「ここで一区切り」で終わった報告）・また来た場所の絵は描き直される', ok: has('MEM LONG OK'), timeout: 200 },
  { n: 'keeprun', why: '「ここで一区切り」で勝手に終わらない（直せないときはほかの道から同じ時刻で続ける・死んだのに画面が出ないときはふつうの画面）', ok: has('KEEP RUN OK'), timeout: 120 },
  { n: 'drawlog', why: '絵が描けない時、エラーの記録に何がどこでこわれたかを残す（走りは続く）', ok: has('DRAW LOG OK'), timeout: 120 },
  { n: 'viewclear', why: '道の先が見える（帯・おしごとのカード・ナイスの文字が道の先にかからない、8つの画面の大きさ。スマホ縦長は頭の上に道が見える。鳥居のトンネルではカメラが下がる）', ok: has('VIEW CLEAR OK'), timeout: 200 },
  { n: 'featureguard', why: '入れた機能が消えていない（古い版のファイルで上書きして、機能が気づかずに消えた事故の再発防止）', ok: has('FEATURE OK'), timeout: 60 },
  { n: 'cgfresh', why: 'CrazyGames ではじめて開いた人は、キャラクターとスタートだけの題名（1 回走ると、ふだんの題名）。自社サイト版は今までどおり（2026-11-16）', ok: has('CGFRESH OK'), timeout: 200 },
  { n: 'softstart', why: '走り始めの 45 秒は、正面でぶつかっても曲がり損ねても BUMP! で続く（追いかけられている間にもう 1 回で終わり・ボスの道は今までどおり）（オーナー 2026-11-16）', ok: has('SOFTSTART OK'), timeout: 120 },
  { n: 'portal', why: 'CrazyGames の中だけ：外へのリンクを出さない・遊んでいる合図・見たい人だけの広告。自社サイト版は広告なし', ok: has('PORTAL OK'), timeout: 200 },
  { n: 'jumpfair', why: '飛び越えられそうなのに越えられない障害物がない（見た目と当たりの高さが合う）', ok: has('JUMP FAIR OK'), timeout: 120 },
  { n: 'wallcheck', why: '3レーンとも壁（飛び越えられない）の列が出ない', ok: has('WALL OK'), timeout: 200 },
  { n: 'worldcheck', why: '取れない物（壁や車に埋まった牧草）・重なった障害物・避けようのないダメな食べ物がない', ok: has('WORLD OK'), timeout: 300 },
  { n: 'soundcheck', why: '耳ざわりな音がない（むき出しの電子音・高すぎる音・牧草の音の大きさ）', ok: has('SOUND OK'), timeout: 30 },
  { n: 'tapcheck', why: 'ボタンが押しやすい大きさで、文字が切れていない（320・390 幅、日英）', ok: has('TAP OK'), timeout: 300 },
  { n: 'funcheck', why: '面白くなる機能が動く（パーフェクトライン・コンボの節目・SPEED UP・スロー・金の道・今日の目標）', ok: has('FUN OK'), timeout: 200 },
  { n: 'gigcheck', why: '走っている途中のおしごと（30〜45秒ごと・4種類とも成功と失敗・ごほうび・表示が日英で切れない）', ok: has('GIG OK'), timeout: 200 },
  { n: 'weekgoal', why: '今週の目標（週の合計・1回だけのごほうび・週が変わると0から・ミッション画面に出る）', ok: has('WEEK GOAL OK'), timeout: 200 },
  { n: 'modecheck', why: 'のんびりモード・なかよし度が動く（自己ベストとランキングを分ける）／1分ダッシュ・スタートブーストの入口が無い（2026-11-15 にやめた）', ok: has('MODE OK'), timeout: 200 },
  { n: 'hatfit', why: '帽子が頭にのっているだけにならない・ジルの耳が帽子から出る（全キャラの着せ替え一覧も撮る）', ok: has('HAT FIT OK'), timeout: 200 },
  { n: 'i18n_audit', why: '中国語・韓国語に訳のない文・カナが残っていない（全画面・走行中）', ok: has('I18N OK'), timeout: 400 },
  { n: 'reach', why: 'いくら遊んでも手に入らない物がない（図鑑・スタンプ・実績）', ok: has('REACH OK') },
  { n: 'growth', why: 'SNSとのつながり（フォローの列・シェアの ?ref=・最新話・控えめなひと言・結果の時刻・こわれた数字のセーブ・古いコードの pid）', ok: has('GROWTH OK'), timeout: 400 },
  { n: 'pbtest', why: '自己ベストを更新した瞬間に終わらない（1位の方からの報告・2026-11）', ok: has('PB OK'), timeout: 600 },
  { n: 'seo', why: '検索で見つけてもらう（タイトル・説明・ガイド・地図）', ok: has('SEO OK'), timeout: 200 },
];
// 手元でのやり直し用：FROM=名前 でその試験から、ONLY=名前,名前 でその試験だけ（CI では使わない）
if (process.env.FROM) { const i = T.findIndex(t => t.n === process.env.FROM); if (i > 0) T.splice(0, i); }
if (process.env.ONLY) { const k = new Set(process.env.ONLY.split(',')); for (let i = T.length - 1; i >= 0; i--) if (!k.has(T[i].n)) T.splice(i, 1); }
if (MODE === 'smoke') { const keep = new Set(['featureguard', 'dupcheck', 'qa', 'reltest', 'apptest', 'seo', 'reach', 'soundcheck', 'vanish']); for (let i = T.length - 1; i >= 0; i--) if (!keep.has(T[i].n)) T.splice(i, 1); }
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
  /* 2026-11-15：落ちた試験は、その場で理由（出力の終わり）も記録に出す。前は「FAIL 名前」だけで、GitHub の記録からは理由が分からなかった */
  if (!pass) console.log('  └ ' + results[results.length - 1].tail.replace(/\n/g, '\n    ').slice(0, 1500));
}
servers.forEach(s => s.close());
const failed = results.filter(r => !r.pass);
const report = { mode: MODE, at: new Date().toISOString(), sec: Math.round((Date.now() - t0) / 1000), passed: results.length - failed.length, total: results.length, failed: failed.map(f => f.name), results };
writeFileSync(path.join(ROOT, 'qa-report.json'), JSON.stringify(report, null, 1));
writeFileSync(path.join(ROOT, 'qa-report.md'), `# QA（${MODE}）${failed.length ? '不合格 ' + failed.length + '件' : '全部合格'}\n\n${results.map(r => `- ${r.pass ? '✅' : '❌'} ${r.why}（${r.name}・${r.sec}秒）`).join('\n')}\n\n${failed.map(f => `## ❌ ${f.name}\n\`\`\`\n${f.tail}\n\`\`\``).join('\n\n')}\n`);
console.log(failed.length ? 'QA FAILED: ' + failed.map(f => f.name).join(', ') : 'QA ALL PASSED ' + results.length);
process.exit(failed.length ? 1 : 0);
