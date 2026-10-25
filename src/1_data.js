'use strict';
/* ================= utils ================= */
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
function wpick(list) { let t = 0; for (const e of list) t += e[1]; let r = Math.random() * t; for (const e of list) { r -= e[1]; if (r <= 0) return e[0]; } return list[0][0]; }
const hexRgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const fmt = n => Math.floor(n).toLocaleString(LANG === 'ja' ? 'ja-JP' : 'en-US');
function todayStr() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function clockStr(min) { min = Math.floor(min) % 1440; return Math.floor(min / 60) + ':' + String(min % 60).padStart(2, '0'); }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ================= save ================= */
const SAVE_KEY = 'renjill-hay-dash-v1';
const defSave = () => ({ best: 0, bank: 0, closet: {}, wear: { ren: { tie: 'gold', hat: '', suit: '' }, jill: { frame: 'brown', hat: '', suit: '' } }, upg: { dash: 0, magnet: 0, jump: 0, x2: 0, fly: 0 }, clovers: 1, char: 'ren', mug: false, mugOn: false,
  mlevel: 1, missions: null, totals: {}, zukan: {}, seenZukan: 0, daily: '', streak: 0, mute: false, runs: 0, bestClock: 480,
  lang: '', stamps: {}, album: {}, bestDay: 1, seenStamps: 0 });
let SV = defSave();
function svFrom(o) { const SVp = SV; SV = Object.assign(defSave(), o); try { const D = defSave(); SV.upg = Object.assign(D.upg, o.upg || {}); for (const k of ['totals', 'zukan', 'stamps', 'album', 'ach', 'opt']) if (!SV[k] || typeof SV[k] !== 'object') SV[k] = D[k] || {}; if (SV.missions && !Array.isArray(SV.missions.slots)) SV.missions = null; if (!(SV.char === 'ren' || SV.char === 'jill' || (SV.char === 'pom' && SV.pomMet))) SV.char = 'ren'; SV.nick = typeof SV.nick === 'string' ? SV.nick.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 12) : ''; const dw = defSave().wear; SV.wear = { ren: Object.assign(dw.ren, (o.wear || {}).ren || {}), jill: Object.assign(dw.jill, (o.wear || {}).jill || {}) }; SV.closet = o.closet || {}; } catch (e) { SV = SVp; throw e; } }
try { const raw = localStorage.getItem(SAVE_KEY); if (raw) { const o = JSON.parse(raw); SV = Object.assign(defSave(), o); const D = defSave(); SV.upg = Object.assign(D.upg, o.upg || {}); for (const k of ['totals', 'zukan', 'stamps', 'album', 'ach', 'opt']) if (!SV[k] || typeof SV[k] !== 'object') SV[k] = D[k] || {}; if (SV.missions && !Array.isArray(SV.missions.slots)) SV.missions = null; if (!(SV.char === 'ren' || SV.char === 'jill' || (SV.char === 'pom' && SV.pomMet))) SV.char = 'ren'; SV.nick = typeof SV.nick === 'string' ? SV.nick.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 12) : ''; const dw = defSave().wear; SV.wear = { ren: Object.assign(dw.ren, (o.wear || {}).ren || {}), jill: Object.assign(dw.jill, (o.wear || {}).jill || {}) }; SV.closet = o.closet || {}; } } catch (e) { }
// one stable player id per save: it travels with a transfer code, so a future app (iOS/Android) can take the same account over
if (!SV.pid) { try { SV.pid = (crypto.randomUUID ? crypto.randomUUID() : 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2)); } catch (e) { SV.pid = 'p' + Date.now().toString(36); } }
/* ---- account transfer: the whole save (without photos) as a code, readable by any build of the game ----
   format: RJ1.<base64url of deflated JSON>.<checksum>   (RJ0 = not compressed, for browsers without CompressionStream) */
const XFER_FIELDS_SKIP = ['album'];
async function xferMake() {
  const o = {}; for (const k in SV) if (!XFER_FIELDS_SKIP.includes(k)) o[k] = SV[k];
  try { const a = localStorage.getItem('hd_fsauth'); if (a) o._fs = JSON.parse(a); } catch (e) { } // the ranking account (app build) goes along
  o._v = 1; o._at = Date.now();
  const raw = new TextEncoder().encode(JSON.stringify(o)); let bytes = raw, tag = 'RJ0';
  try { if (typeof CompressionStream === 'function') { const cs = new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw')); bytes = new Uint8Array(await new Response(cs).arrayBuffer()); tag = 'RJ1'; } } catch (e) { bytes = raw; tag = 'RJ0'; }
  let bin = ''; for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
  const b64 = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return tag + '.' + b64 + '.' + xferSum(b64);
}
function xferSum(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); }
async function xferRead(code) {
  const m = String(code || '').replace(/\s+/g, '').match(/^(RJ[01])\.([A-Za-z0-9_-]+)\.([a-z0-9]+)$/); if (!m) throw new Error('format');
  if (xferSum(m[2]) !== m[3]) throw new Error('checksum');
  const bin = atob(m[2].replace(/-/g, '+').replace(/_/g, '/')); let bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  if (m[1] === 'RJ1') { if (typeof DecompressionStream !== 'function') throw new Error('browser'); const ds = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')); bytes = new Uint8Array(await new Response(ds).arrayBuffer()); }
  const o = JSON.parse(new TextDecoder().decode(bytes)); if (!o || typeof o !== 'object' || o._v !== 1) throw new Error('version'); return o;
}
async function xferApply(code) {
  const o = await xferRead(code), fs = o._fs; delete o._fs; delete o._v; delete o._at;
  const album = SV.album; svFrom(o); SV.album = album || {}; // photos stay with this device
  try { if (fs) localStorage.setItem('hd_fsauth', JSON.stringify(fs)); } catch (e) { }
  saveNow(); return true;
}
// while running, writes wait until the run stops (writing the whole save, photos and all, froze a frame on phones)
let SAVE_DIRTY = 0;
function save() { let playing = false; try { playing = G.mode === 'play' || G.mode === 'countdown'; } catch (e) { } if (playing) { SAVE_DIRTY = 1; return; } saveNow(); }
function saveFlush() { if (SAVE_DIRTY) saveNow(); }
let RESETTING = 0; // set while the player wipes their data: nothing may write it back
function saveNow() { if (RESETTING) return; // if storage is full, give up the oldest photos one by one (never the progress)
  SAVE_DIRTY = 0;
  for (let k = 0; k < 100; k++) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SV)); return; } catch (e) { const ks = Object.keys(SV.album || {}); if (!ks.length) return; delete SV.album[ks[0]]; } } }
const OPT = () => (SV.opt = Object.assign({ ctrl: 'swipe', sens: 'normal', vib: true, calm: !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches), music: true, sfx: true }, SV.opt || {}));
const QLANG = (/[?&]lang=(ja|en)\b/.exec(location.search) || [])[1]; // ?lang=en opens the English version (links from the English guide)
let LANG = QLANG || SV.lang || ((navigator.language || 'ja').toLowerCase().startsWith('ja') ? 'ja' : 'en');
const L = o => o == null ? '' : typeof o === 'string' ? o : (o[LANG] ?? o.ja ?? o.en ?? '');

/* ================= interface text ================= */
const STR = {
  resMore: ['くわしく見る（ミッション・えさメモ・シェア画像）', 'More: missions, food note, share image'], resNameT: ['ランキングの名前をつける', 'Set your ranking name'],
  pomPeek2: ['ポムが走っていった！ ひまわりの種を見つけたら合流するよ', 'There goes Pom! Find the sunflower seeds to team up'], pomPeekSay: ['先輩、お先っす！', 'Race you there, senpai!'],
  pomHi2: ['先輩！今日もお供するっす！', 'Senpai! Reporting for duty again!'], pomJoin2: ['新人のポムが合流！ ほお袋がいっぱいになるとボーナス（スコア1.2倍）', 'Pom is back! Fill those cheek pouches for a bonus (score ×1.2)'], pomPuff: ['ほお袋MAXっす！おすそわけ！', 'Pouches full! Sharing!'], pomPeek: ['道のまん中に…ハムスター!? こっちを見てる…', 'A hamster... in the road!? It’s looking at you...'],
  pomJoin: ['体育会系の新入社員、キンクマハムスターのポムが合流！ ほお袋がいっぱいになるとボーナス（スコア1.2倍）', 'Meet Pom, the sporty new hire (a golden hamster)! Fill those cheek pouches for a bonus (score ×1.2)'], pomHi: ['押忍！新人のポムっす！', 'Osu! Pom, the new hire, reporting for duty!'],
  pomWorry: ['先輩!? 大丈夫っすか!?', 'Senpai!? You OK!?'], pomDonmai: ['ドンマイっす！', "Shake it off!"], pomFever: ['ファイトーー！', 'Go, go, gooo!'], pomNice: ['ナイスっす！', 'Nice one!'], pomNice2: ['まだまだいけるっす！', 'Keep it up!'], pomStamp: ['スタンプ、映えるっす！', 'Ooh, picture-perfect!'],
  worryRen: ['ジル、大丈夫か!?', 'Jill, are you OK!?'], worryJill: ['課長、大丈夫ですか!?', 'Boss, are you OK!?'],
  start: ['スタート', 'START'], again: ['もう一回！', 'ONE MORE RUN'], resume: ['つづける', 'RESUME'],
  legal: ['このゲームはフィクションです。登場する地名・駅名は場所を表すためのもので、実在の施設・企業・団体とは関係がなく、公認を受けたものでもありません。うさぎの食べ物のメモは一般的な目安です（主な出典：長野県動物愛護センターの資料）。本物のうさぎのことは、うさぎを診られる動物病院に相談してください。AIのジルの答えは間違うこともあります。フォント：Dela Gothic One、Zen Maru Gothic（SIL Open Font License 1.1）。音楽・効果音・絵はこのゲームのために作ったものです。© COANA TOKYO「レンとジル」',
    'This game is fiction. Place and station names are used only to show where you are; the game is not affiliated with or endorsed by any real facility, company or group. Rabbit food notes are general guidance (main source: Nagano Prefecture Animal Welfare Center). For a real rabbit, ask a vet who sees rabbits. AI Jill can make mistakes. Fonts: Dela Gothic One, Zen Maru Gothic (SIL Open Font License 1.1). All music, sound effects and art were made for this game. © COANA TOKYO “Ren & Jill”'],
  gameTitle: ['レンとジルのチモシーダッシュ', 'Ren & Jill: Hay Dash'], tagline: ['寝坊した課長と、東京をかけぬけて出社！', 'Two office bunnies, one mad dash across Tokyo'],
  missions: ['ミッション', 'Missions'], shop: ['購買部', 'Shop'], book: ['えさ図鑑', 'Food book'], stamps: ['スタンプ帳', 'Stamps'], how: ['あそびかた', 'How to play'],
  best: ['ベスト', 'Best'], soundOn: ['音：オン', 'Sound: on'], soundOff: ['音：オフ', 'Sound: off'], lang: ['English', '日本語'],
  quit: ['やめる', 'Quit'], menu: ['メニュー', 'Menu'], copy: ['リンクをコピー', 'Copy link'], copied: ['コピー済み', 'Copied'], copyFail: ['コピーできませんでした', 'Could not copy'],
  share: ['シェア画像を見る', 'See the share image'], shareImg: ['画像を長押し（右クリック）で保存できます', 'Long-press (or right-click) the image to save it'],
  pause: ['ひと休み', 'Taking a break'],
  story: ['<span class="stp"><b>朝</b>課長と出社</span><span class="stp"><b>道中</b>チモシー集め</span><span class="stp"><b>夜</b>東京を寄り道</span>',
    '<span class="stp"><b>AM</b>Off to work</span><span class="stp"><b>Run</b>Grab hay</span><span class="stp"><b>PM</b>See Tokyo</span>'],
  pomRole: ['新人・キンクマ・ハムスター', 'Rookie · Golden hamster'], pomPerk: ['ほお袋：60本でボーナス', 'Pouches: bonus every 60 hay'], pomUnlock: ['新人のポムで走れるようになりました！', 'You can now run as Pom, the rookie!'], worryPom: ['ポム、大丈夫か!?', 'Pom, you OK!?'],
  mateRenH: ['レン課長、合流！', 'REN JOINS!'], mateRen: ['寝坊した課長が追いついた！', 'The sleepy boss caught up!'],
  mateJillH: ['ジル先輩、合流！', 'JILL JOINS!'], mateJill: ['ジル先輩が追いついた！', 'Jill caught up!'],
  mateAll: ['　3人そろって出社！', ' The whole team is here!'], mateRenSay: ['ポム、早すぎるぞ…！', 'Pom, slow down...!'], mateJillSay: ['ポムくん、お待たせ！', 'Sorry I’m late, Pom!'],
  matePomSay: ['先輩！待ってたっす！', 'Senpai! I waited for you!'], matePomAll: ['全員そろったっす！', 'The whole team, let’s go!'],
  renRole: ['課長・ホーランドロップ', 'Boss · Holland Lop'], jillRole: ['部下・ネザーランド・ドワーフ', 'Assistant · Netherland Dwarf'],
  renPerk: ['牧草好き：チモシー +20%', 'Hay lover: +20% hay'], jillPerk: ['段取り上手：パワーアップ 30%長く', 'Organized: power-ups +30%'],
  hintMove: ['左右スワイプでレーン移動・上でジャンプ・下でスライディング', 'Swipe left/right to change lanes, up to jump, down to slide'],
  hintTurn: ['矢印が出たら、その向きにスワイプして曲がる', 'When an arrow appears, swipe that way to turn'],
  hintFork: ['分かれ道！ 行きたい方へスワイプ', 'A fork! Swipe toward where you want to go'],
  reviveClover: ['お守り×{0}で続ける', 'Use {0} charm to continue'], reviveHay: ['チモシー{0}本で続ける', 'Continue for {0} hay'],
  reviveHave: ['お守り {0}個・チモシー {1}本', 'Charms: {0} · Hay: {1}'], seeResult: ['結果を見る', 'See result'],
  keepGoing: ['まだ定時じゃない！', 'Not quitting time yet!'],
  morning: ['課長、寝坊。走れ！', 'The boss overslept. Run!'],
  dayN: ['翌朝。田端駅で待ち合わせて、今日も出社', 'Next morning. Meet at Tabata Station, off to work again'],
  lastTrain: ['終電に乗って帰ろう', 'Catch the last train home'],
  onTime: ['出社！ +{0}', 'Made it to work! +{0}'],
  chime: ['定時！ ここから課長と東京を寄り道 +{0}', 'Six o’clock! Time for a detour through Tokyo +{0}'],
  rush: ['締め切りまであと1時間。書類の山が迫る！', 'One hour to the deadline. The paper pile is right behind you!'],
  lunch: ['お昼休み。どこで食べる？', 'Lunch break. Where to?'],
  detour: ['どこに寄り道する？', 'Where shall we go tonight?'], errandQ: ['午後の外回り。どっちに行く？', 'Afternoon errand. Which way?'],
  saved: ['お守りが守ってくれた', 'The lucky charm saved you'], lucky: ['お守りゲット（続けるにも使える）', 'Lucky charm! (also lets you continue)'],
  igSaved: ['ストーリーズ用の画像を保存しました（文章もコピー済み）。Instagramで投稿かストーリーズを作り、この画像を選んでください。', 'Story image saved and caption copied. In Instagram, start a post or Story and pick this image.'],
  igShared: ['シェアしました', 'Shared'], fbShared: ['シェアしました（文章もコピー済み。投稿欄に貼り付けられます）', 'Shared. Your result text is copied too, so you can paste it into the post'],
  fbCopied: ['結果の文章をコピーしました。Facebookの投稿欄に貼り付けてください。', 'Your result text is copied. Paste it into your Facebook post.'], fbOpen: ['Facebookでシェア', 'Share on Facebook'], igOpen: ['Instagramを開く', 'Open Instagram'],
  shareMore: ['その他', 'More'],
  codeH: ['SNSのあいことば', 'Secret word from our posts'], codeNote: ['Instagram・Facebook・X の投稿で発表する「あいことば」を入れると、チモシーや帽子がもらえます', 'Enter the secret word from our Instagram, Facebook or X posts to get hay or a hat'],
  codePh: ['あいことば', 'Secret word'], codeOk: ['受け取る', 'Redeem'], codeBad: ['あいことばが違うか、期限が過ぎています', 'That word is wrong or has expired'], codeUsed: ['このあいことばは受け取り済みです', 'You already used this word'],
  codeGot: ['受け取りました！ チモシー{0}本', 'Got it! {0} hay'], codeOff: ['あいことばの確認には、インターネットの接続が必要です', 'Checking the word needs an internet connection'],
  feedNew: ['SNSの新作', 'New on our SNS'],
  hwGift: ['ハロウィン（〜10/31）：限定の帽子をプレゼント！購買部でかぶれます', 'Happy Halloween (to Oct 31)! Two gift hats are waiting in the Shop'],
  hwTag: ['ハロウィン限定', 'Halloween'], copyNote: ['ゲームのリンクと結果の文章をコピーしました。LINEやメッセージに貼り付けて送れます', 'The game link and your result are copied. Paste them into any chat'],
  nameBtn: ['名前：{0}', 'Name: {0}'], nameNone: ['名前を決める', 'Set name'],
  nameTitle: ['ランキングでの名前', 'Your name on the ranking'], nameNote: ['月間ランキングで、ほかのプレイヤーに表示されます（12文字まで）。本名や連絡先などの個人情報は入れないでください。あとから「名前」ボタンや設定で変えられます。', 'Shown to other players on the monthly ranking (up to 12 characters). Please do not use your real name or contact details. You can change it any time from the Name button or Settings.'],
  nameNG: ['この名前は使えません。別の名前にしてね', 'That name can’t be used. Please pick another one'],
  nameOk: ['決定', 'OK'], nameLater: ['あとで', 'Later'], namePh: ['例：レン推し', 'e.g. Ren fan'],
  hiCombo: ['{0}コンボ', '{0} combo'], hiNice: ['ナイス回避 {0}回', '{0} nice dodges'], hiFever: ['フィーバー {0}回', '{0} fevers'], hiNew: ['NEW {0}', 'NEW {0}'], hiLook: ['振り向き {0}回', '{0} look-backs'],
  lastRun: ['前回：{0}点・{1}まで到達', 'Last run: {0} pts, reached {1}'], lastBest: ['自己ベスト {0}点', 'Best {0} pts'],
  bestUp: ['自己ベストを {0} 更新！', 'You beat your best by {0}!'], bestShort: ['自己ベストまであと {0}', '{0} short of your best'],
  resName: ['名前（12文字まで・本名はNG）', 'Name (12 chars, no real names)'],
  newBestRun: ['自己ベスト更新中！', 'New best! Keep it going!'],
  livesOk: ['横にぶつかってもあと1回OK', 'You can take 1 side bump'],
  livesWarn: ['あと1回でアウト！ 回復まで{0}秒', 'One more bump and you’re out! Safe in {0}s'],
  livesRush: ['締め切り中：1回でもぶつかるとアウト', 'Deadline: any bump ends the run'],
  bump1: ['書類の山が迫る！ あと1回でアウト。{0}秒逃げきれば回復', 'Paper pile incoming! One more bump ends the run. Stay clear for {0}s'],
  feverJa: ['もぐもぐフィーバー！', 'Munch munch fever!'],
  feverGo: ['{0}秒間 無敵・スコア2倍・チモシー吸い寄せ！', '{0}s: invincible, ×2 score, hay flies to you!'],
  feverSoon: ['もぐもぐゲージ あと少し！ 食べ続けるとフィーバー', 'Munch meter almost full! Keep eating for a fever'],
  feverEnd: ['フィーバー終了。またゲージをためよう', 'Fever over. Fill the meter again'],
  gaugeHint: ['食べるとゲージがたまる。満タンでフィーバー', 'Eating fills the meter. Full meter = fever'],
  gauge: ['もぐもぐゲージ', 'Munch meter'], gaugeFull: ['フィーバー中', 'FEVER'],
  howBump: ['正面からぶつかる（障害物に突っこむ）と1回でアウト。横からぶつかるのは1回までOK：画面上のハートが1つ減り、書類の山が迫ってくる。5秒逃げきればハートが戻る。その間にもう1回ぶつかるとアウト。締め切りラッシュ中は横でも1回でアウト。四つ葉のお守りを持っていれば1回だけ守ってくれる。', 'Running head-on into an obstacle ends the run. A side bump is OK once: one heart goes dark and the paper pile closes in. Stay clear for 5 seconds and the heart comes back; another bump before then ends the run. During the deadline rush, any bump ends it. A four-leaf clover shield saves you once.'],
  howFever: ['チモシー・野菜・果物を食べると「もぐもぐゲージ」がたまる（果物ほど多い）。満タンになると数秒間フィーバー：無敵・スピードUP・スコア2倍で、3列に並んだチモシーが全部ひとりでに吸い寄せられる（どのレーンにいてもOK）。ダメな食べ物を食べるとゲージが減る。18:00の定時チャイムでもフィーバーになる。',
    'Hay, vegetables and fruit fill the munch meter (fruit fills it most). When it is full you get a fever for a few seconds: invincible, faster, double score, and all three rows of hay fly to you from any lane. Bad foods drain the meter. The 6 PM chime also starts a fever.'],
  noFood: ['{0}はうさぎにダメ', '{0} is bad for bunnies'],
  newBook: ['NEW! 図鑑に「{0}」', 'NEW in the food book: {0}'],
  newSpot: ['はじめて来た！ 記念写真を撮った', 'First visit! Photo saved to your album'],
  stampGet: ['スタンプゲット！', 'Stamp collected!'],
  nextStation: ['次は {0}', 'Next: {0}'],
  bonusRen: ['牧草好きボーナス +{0}本。', 'Hay-lover bonus +{0}. '],
  ranM: ['走った距離 {0}m', 'Ran {0} m'],
  lvlUp: ['ミッション全クリア！ 倍率が×{0}に上がった（ボーナス チモシー{1}本）', 'All missions cleared! Multiplier is now ×{0} (bonus: {1} hay)'],
  missionNote: ['いまのスコア倍率。3つ全部クリアしてランを終えると倍率が上がり、ボーナスのチモシーがもらえます。', 'Your score multiplier. Clear all three and finish a run to raise it and earn bonus hay.'],
  bankHave: ['手持ちのチモシー', 'Hay in the bank'], durNow: ['効果時間 {0}秒', 'Lasts {0}s'], max: ['（最大）', ' (max)'],
  charmName: ['お守り（四つ葉）×1', 'Lucky charm ×1'], charmNote: ['ぶつかった後に「続ける」ために使う。いま {0}個', 'Use it to continue after a crash. You have {0}'],
  closet: ['クローゼット', 'Closet'], closetNote: ['見た目だけ。タイトル画面・走っている姿・結果カードに反映されます。', 'Just for looks. Shows on the title screen, while running and on the share card.'],
  wearing: ['着用中', 'Wearing'], putOn: ['着る', 'Put on'], takeOff: ['脱ぐ', 'Take off'],
  mugName: ['課長のマグカップ', "The boss's mug"], mugNote: ['レン課長の頭の上に、いつものマグカップ。見た目だけ。', 'His trusty mug, worn as a hat. Just for looks.'],
  wear: ['かぶる', 'Put on'], unwear: ['はずす', 'Take off'],
  shopNote: ['チモシーはランで集めた分がたまります。レン課長で走ると +20%。', 'All the hay you collect is banked here. Running as Ren earns +20%.'],
  kinds: ['{0} / {1} 種類', '{0} / {1} found'], tapFood: ['ランで出会った食べ物が、ここにたまります。ダメな食べ物も、ぶつかると登録されます。', 'Foods you meet on your runs are saved here, including the ones bunnies must not eat.'],
  foodNote: ['豆知識は一般的な目安です（主な出典：長野県動物愛護センターのうさぎ飼育資料）。実際の食事の量や種類は、うさぎを診られる動物病院に相談してください。', 'These notes are general guidance (main source: Nagano Prefecture Animal Welfare Center’s rabbit care guide). Ask a vet who treats rabbits about your own bunny’s diet.'],
  stampNote: ['東京の名所を走ると、1か所に1つスタンプが出ます。はじめて行った場所では記念写真も残ります。', 'Each Tokyo spot hides one stamp. Your first visit to a place also saves a photo.'],
  photos: ['思い出アルバム', 'Photo album'], noPhoto: ['まだ写真がありません。名所に行くと増えます。', 'No photos yet. Visit Tokyo spots to add some.'],
  routeToday: ['今日のルート', "Today's route"],
  howGoal: ['8:00 課長の家 → 山手線で出社 → 18:00 定時 → 夜の東京を寄り道 → 終電で帰る → 翌朝は駅から出社。分かれ道では行き先を選べます。チモシーでもぐもぐゲージをためるとフィーバー。横からぶつかると崩れた書類の山が迫り、もう一度ぶつかると埋もれます。',
    '8:00 at the boss’s house → Yamanote Line to the office → 6 PM → Tokyo by night → the last train → next morning from the station. At forks you choose where to go. Fill the munch meter with hay for a fever. Side bumps bring the paper pile closer; a second bump buries you.'],
  howSwipeLR: ['左右スワイプでレーン移動。矢印が出たら、その向きにスワイプして角を曲がる', 'Swipe left/right to change lanes. When an arrow shows, swipe that way to turn the corner'],
  howUp: ['上スワイプでジャンプ。座布団・書類・コーンを飛びこえる', 'Swipe up to jump over cushions, papers and cones'],
  howDown: ['下スワイプでスライディング。ちゃぶ台・テーブル・のれん・提灯の下をくぐる', 'Swipe down to slide under tables, curtains and lanterns'],
  howKeys: ['パソコンは矢印キー・WASD・スペースでも遊べる。P か ESC で一時停止', 'On a computer: arrow keys, WASD or Space. P or Esc to pause'],
  howNG: ['チョコ・玉ねぎ・ポテチはうさぎにダメ。よけよう', 'Chocolate, onions and chips are bad for bunnies. Dodge them'],
  shareText: ['「レンとジルのチモシーダッシュ」で {0}点！ {1}まで走った（{2}）この記録、こえられる？ #レンとジル', 'I scored {0} in Ren & Jill: Hay Dash and made it to {1} ({2}). Can you beat it? #RenAndJill'],
  shareTextWon: ['挑戦状の{3}点をこえて {0}点！（{2}）次はあなたの番！ #レンとジル', 'Beat the {3} challenge with {0} ({2})! Your turn! #RenAndJill'],
  reviveFree: ['初回ボーナスで続ける', 'Continue for free'], reviveFreeNote: ['最初の3回のプレイは、1回だけ無料で続けられます', 'First-run bonus: in your first 3 runs, continue once for free'], firstFever: ['フィーバー中はぶつかっても平気！', 'You can’t crash in a fever!'],
  resetH: ['データのリセット', 'Reset your data'], resetNote: ['スコア・チモシー・服・スタンプ・ランキングの記録をすべて消して、はじめからにします。元にはもどせません（残したいときは先に「データ引き継ぎ」のコードを作ってください）。', 'Erase every record (scores, hay, clothes, stamps and your ranking entries) and start over. This cannot be undone: make a transfer code first if you want to keep a copy.'],
  resetBtn: ['データをリセットする', 'Reset my data'], resetAsk: ['本当にすべて消しますか？', 'Really erase everything?'], resetYes: ['消してはじめから', 'Erase all'], resetNo: ['やめる', 'Cancel'],
  resetDoing: ['消しています…', 'Erasing...'], resetDone: ['消しました。はじめから始めます', 'Done. Starting over'],
  chalCard: ['友だちからの挑戦状', 'A FRIEND’S CHALLENGE'], chalBody: ['{0}点をこえろ！', 'Beat {0}!'], chalHud: ['挑戦 {0}', 'BEAT {0}'],
  chalWin: ['挑戦状クリア！', 'CHALLENGE BEATEN!'], chalWinSub: ['友だちの{0}点をこえた！', 'You beat your friend’s {0}!'],
  chalLeft: ['挑戦状まであと{0}点！ ', '{0} more to beat the challenge! '], chalDone: ['挑戦状クリア！（{0}点をこえた） ', 'Challenge beaten (over {0})! '],
  daily: ['おはよう！ {0}日連続出社ボーナス：チモシー{1}本', 'GOOD MORNING! {0}-day streak bonus: {1} hay'],
  dayLbl: ['日目', 'DAY'],
  settings: ['設定', 'Settings'], ctrl: ['操作', 'Controls'], ctrlSwipe: ['スワイプ', 'Swipe'], ctrlTap: ['タップ', 'Tap'],
  ctrlNote: ['タップ：画面の左右をタップでレーン移動、真ん中の上半分でジャンプ、下半分でスライディング。', 'Tap: tap the left or right side to change lanes, the upper middle to jump, the lower middle to slide.'],
  sens: ['スワイプの感度', 'Swipe sensitivity'], sensN: ['ふつう', 'Normal'], sensH: ['敏感', 'High'],
  vib: ['振動', 'Vibration'], calm: ['画面の揺れ・演出をひかえめに', 'Reduce screen shake and flashes'], music: ['音楽', 'Music'], sfx: ['効果音', 'Sound effects'], on: ['オン', 'On'], off: ['オフ', 'Off'],
  resetTut: ['チュートリアルをもう一度', 'Replay the tutorial'], xfer: ['データ引き継ぎ', 'Transfer your data'], xferNote: ['機種変更や、将来のアプリ版に記録を引き継げます。「引き継ぎコードを作る」でコードをコピーし、新しい端末の同じ画面に貼り付けてください。（写真アルバムは引き継がれません）', 'Move your progress to a new device or a future app: make a code here, then paste it on the new device. (Photos stay on this device.)'], xferMake: ['引き継ぎコードを作る', 'Make a transfer code'], xferCopied: ['コードをコピーしました。メモ帳などに保存しておいてください', 'Code copied. Keep it somewhere safe'], xferPaste: ['ここに引き継ぎコードを貼り付け', 'Paste a transfer code here'], xferLoad: ['このコードで復元', 'Restore from this code'], xferDone: ['引き継ぎました！', 'Transferred!'], xferBad: ['コードが正しくありません。最後まで貼り付けられているか確認してください', 'That code does not look right. Check it was pasted in full'], xferConfirm: ['今の記録はこのコードの記録で上書きされます。もう一度押すと復元します', 'Your current progress will be replaced. Tap again to restore'], resetDone: ['次のスタートでチュートリアルが始まります', 'The tutorial will play on your next run'],
};
const t = (k, ...a) => { const s = STR[k] ? STR[k][LANG === 'ja' ? 0 : 1] : k; return s.replace(/\{(\d)\}/g, (_, i) => a[i] ?? ''); };

/* ================= world constants ================= */
const HW = 4.6;               // visual half width of every corridor (sidewalks / furniture live in 2.6..4.6)
const ROAD = 2.6;             // playable half width
const LANE = 1.5;
const LANES = [-LANE, 0, LANE];
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const GRAV = 24, JUMPV = 8.0, SUPERV = 12.4, CARV = 10.8; // CARV: the vault over a car (clears a van's roof)
const STAND_H = 0.92, SLIDE_H = 0.42;

/* ================= items ================= */
const ITEMS = {
  hay:      { ja: 'チモシー', en: 'Timothy hay', kind: 'hay', pts: 10, tip: { ja: 'うさぎの主食の牧草。いつでも食べられるよう、たっぷり用意します。繊維がお腹の動きを助け、よく噛むことで歯もすり減ります。', en: 'The staple: grass hay, available at all times. The fiber keeps the gut moving and all that chewing wears the teeth down.' } },
  goldhay:  { ja: '金のチモシー', en: 'Golden hay', kind: 'hay', pts: 300, gold: 1, tip: { ja: 'めったに出ない、ごほうびのチモシー。ゲームだけの特別品。', en: 'A rare golden bundle. Only in the game.' } },
  pellet:   { ja: 'ペレット', en: 'Pellets', kind: 'food', pts: 20, tip: { ja: 'うさぎ用の総合栄養食。量は体重の数%（資料により1.5〜5%）が目安で、太りやすいので控えめに。朝と夕方の2回に分けて。', en: 'A complete rabbit food. Guides vary (about 1.5–5% of body weight a day); err on the low side and split it between morning and evening.' } },
  komatsuna:{ ja: '小松菜', en: 'Komatsuna', kind: 'veg', pts: 30, tip: { ja: '緑の濃い葉野菜。野菜は水分の少ない緑黄色野菜が中心。よく洗って水気を切り、少しずつ。', en: 'Japanese mustard spinach, a dark leafy green. Leafy greens should be most of the veggies; wash, dry and give a little at a time.' } },
  chingen:  { ja: 'チンゲン菜', en: 'Bok choy', kind: 'veg', pts: 30, tip: { ja: 'うさぎに人気の葉野菜。はじめての野菜は少量から慣らします。', en: 'A popular leafy green. Introduce any new vegetable in small amounts.' } },
  parsley:  { ja: 'パセリ', en: 'Parsley', kind: 'veg', pts: 30, tip: { ja: '香りが強く、好きな子が多い野菜。少しだけ添えるくらいに。', en: 'Strong-smelling and loved by many bunnies. Just a small sprig.' } },
  carrotTop:{ ja: 'にんじんの葉', en: 'Carrot tops', kind: 'veg', pts: 30, tip: { ja: '根より糖分が少ない葉の部分。よく洗って少量を。', en: 'The leafy top has less sugar than the root. Wash well and give a little.' } },
  dandelion:{ ja: 'タンポポ', en: 'Dandelion', kind: 'veg', pts: 30, tip: { ja: '野草の定番。農薬や犬猫のふんがついていない場所のものを少量（長野県資料）。食べすぎるとお腹がゆるくなることも。', en: 'A classic wild green. Only from places free of pesticides and pet droppings, in small amounts (Nagano guide). Too much can loosen stools.' } },
  apple:    { ja: 'りんご', en: 'Apple', kind: 'treat', pts: 100, tip: { ja: '果物は「おやつ」。芯と種は取り、薄く切ったものを少しだけ。', en: 'Fruit is a treat. Remove the core and seeds and give a thin slice.' } },
  strawberry:{ ja: 'いちご', en: 'Strawberry', kind: 'treat', pts: 100, tip: { ja: '甘くて大人気。ごほうびに、ほんの少しだけ。', en: 'Sweet and loved. Just a little, as a reward.' } },
  banana:   { ja: 'バナナ', en: 'Banana', kind: 'treat', pts: 100, tip: { ja: '糖分がとても多い果物。ひとかけらで十分です。', en: 'Very sugary. One small piece is plenty.' } },
  pineapple:{ ja: 'パイナップル', en: 'Pineapple', kind: 'treat', pts: 100, tip: { ja: '消化を助けるといわれてきた果物（長野県資料）。糖分が多いので、生でも乾燥でもごく少量を。', en: 'Said to help digestion (Nagano guide). Fresh or dried, a small amount.' } },
  carrot:   { ja: 'にんじん', en: 'Carrot', kind: 'power', pow: 'dash', pts: 50, tip: { ja: '大好物だけど糖分が多いので、うさぎには「おやつ」扱い。週に1〜2回、少しだけ。\n【ゲーム】にんじんダッシュ：無敵で一気に走る。', en: 'A favorite, but sugary, so it counts as a treat: a little, once or twice a week.\n[Game] Carrot dash: invincible burst of speed.' } },
  papaya:   { ja: 'パパイヤ', en: 'Papaya', kind: 'power', pow: 'magnet', pts: 50, tip: { ja: '消化を助けるといわれてきた果物（長野県資料）。乾燥パパイヤはおやつの定番だが糖分が多いので少量を。\n【ゲーム】もぐもぐマグネット：まわりの食べ物を吸い寄せる。', en: 'Said to help digestion (Nagano guide). Dried papaya is a classic treat. Small amounts.\n[Game] Munch magnet: pulls food toward you.' } },
  alfalfa:  { ja: 'アルファルファ', en: 'Alfalfa', kind: 'power', pow: 'jump', pts: 50, tip: { ja: 'マメ科の牧草。たんぱく質とカルシウムが多いので子うさぎ向け。大人のうさぎは食べすぎに注意（長野県資料）。\n【ゲーム】ぴょんぴょんジャンプ：大ジャンプで箱も飛びこえる。', en: 'A legume hay, high in protein and calcium, so better for young bunnies. Adults should not have too much (Nagano guide).\n[Game] Super jump: clear even boxes.' } },
  plane:    { ja: '紙ひこうき', en: 'Paper plane', kind: 'power', pow: 'fly', pts: 50, office: 1, tip: { ja: '崩れた書類で折った紙ひこうき。乗ると空を飛べる（ゲームの中だけ）。', en: 'Folded from the fallen papers. Hop on and fly (in the game only).' } },
  clover:   { ja: '四つ葉のクローバー', en: 'Four-leaf clover', kind: 'power', pow: 'shield', pts: 50, tip: { ja: 'クローバーも野草の仲間。四つ葉はめったに見つからないラッキーアイテム。\n【ゲーム】お守り：1回だけぶつかっても平気。ランの後も「続ける」に使える。', en: 'Clover is a wild green too. A four-leaf one is rare and lucky.\n[Game] Lucky charm: survive one crash, or use it to continue.' } },
  hanko:    { ja: '承認ハンコ', en: 'Hanko seal', kind: 'power', pow: 'x2', pts: 50, office: 1, tip: { ja: 'ジルが押すと、なぜか全部スムーズに進む。\n【ゲーム】しばらくスコア2倍。', en: 'A Japanese approval seal. When Jill stamps with it, everything somehow goes smoothly.\n[Game] Double score for a while.' } },
  pomseed:  { ja: 'ひまわりの種', en: 'Sunflower seeds', kind: 'pom', pts: 200, tip: { ja: 'キンクマハムスターのポムの大好物。これをとるとポムが合流する。脂肪が多いので、うさぎのレンとジルは食べません。', en: 'Pom the hamster’s favorite. Pick them up and Pom joins you. Too fatty for bunnies, so Ren and Jill skip them.' } },
  stamp:    { ja: '観光スタンプ', en: 'Tokyo stamp', kind: 'stamp', pts: 500, tip: { ja: '', en: '' } },
  choco:    { ja: 'チョコレート', en: 'Chocolate', kind: 'bad', tip: { ja: 'うさぎには毒になる成分（テオブロミンなど）を含みます。絶対にあげないで。', en: 'Contains theobromine, which is toxic to rabbits. Never feed it.' } },
  onion:    { ja: '玉ねぎ・ネギ', en: 'Onions & leeks', kind: 'bad', tip: { ja: 'ネギの仲間（ニラ・ニンニクも）は中毒の原因になります。絶対にダメ（長野県資料）。', en: 'Onions and their relatives (leeks, garlic) are poisonous to rabbits (Nagano guide).' } },
  chips:    { ja: 'ポテトチップス', en: 'Potato chips', kind: 'bad', tip: { ja: '人間のお菓子は塩分・油・糖分が多すぎます。うさぎにはあげません（長野県資料）。', en: 'Human snacks have far too much salt, fat and sugar (Nagano guide).' } },
};
const VEG = ['komatsuna', 'chingen', 'parsley', 'carrotTop', 'dandelion'];
const TREATS = ['apple', 'strawberry', 'banana', 'pineapple'];
const POWERS = [['carrot', 3], ['papaya', 3], ['alfalfa', 2], ['hanko', 2], ['plane', 2], ['clover', 1]];
const BADS = ['choco', 'onion', 'chips'];
const ZUKAN_ORDER = ['hay', 'goldhay', 'pellet', 'komatsuna', 'chingen', 'parsley', 'carrotTop', 'dandelion', 'apple', 'strawberry', 'banana', 'pineapple', 'carrot', 'papaya', 'alfalfa', 'plane', 'clover', 'hanko', 'choco', 'onion', 'chips'];

/* ================= power-ups & shop ================= */
const POW = {
  dash:   { ico: 'carrot', ja: 'にんじんダッシュ', en: 'Carrot dash', base: 4.0 },
  magnet: { ico: 'papaya', ja: 'もぐもぐマグネット', en: 'Munch magnet', base: 7.0 },
  jump:   { ico: 'alfalfa', ja: 'ぴょんぴょんジャンプ', en: 'Super jump', base: 8.0 },
  x2:     { ico: 'hanko', ja: 'スコア2倍', en: 'Double score', base: 8.0 },
  fly:    { ico: 'plane', ja: '紙ひこうき', en: 'Paper plane', base: 5.0 },
};
const UPG_COST = [150, 400, 900, 1800, 3500];
function powDur(k) { return (POW[k].base + (SV.upg[k] || 0) * 1.4) * (hasPerk('jill') ? 1.3 : 1); }

/* ================= missions ================= */
const MT = [
  { id: 'hayRun', scope: 'run', stat: 'hay', f: l => 60 + 40 * l, t: n => ({ ja: `1回のランでチモシーを${n}本集める`, en: `Collect ${n} hay in one run` }) },
  { id: 'distRun', scope: 'run', stat: 'dist', f: l => 400 + 250 * l, t: n => ({ ja: `1回のランで${n}m走る`, en: `Run ${n} m in one run` }) },
  { id: 'jumpTot', scope: 'total', stat: 'jumps', f: l => 25 + 10 * l, t: n => ({ ja: `合計${n}回ジャンプする`, en: `Jump ${n} times in total` }) },
  { id: 'slideTot', scope: 'total', stat: 'slides', f: l => 20 + 8 * l, t: n => ({ ja: `合計${n}回スライディングする`, en: `Slide ${n} times in total` }) },
  { id: 'treatTot', scope: 'total', stat: 'treats', f: l => 3 + 2 * l, t: n => ({ ja: `おやつ（果物）を合計${n}個食べる`, en: `Eat ${n} fruit treats in total` }) },
  { id: 'vegRun', scope: 'run', stat: 'veg', f: l => 4 + 2 * l, t: n => ({ ja: `1回のランで野菜を${n}個食べる`, en: `Eat ${n} vegetables in one run` }) },
  { id: 'powTot', scope: 'total', stat: 'powers', f: l => 3 + 2 * l, t: n => ({ ja: `パワーアップを合計${n}回とる`, en: `Grab ${n} power-ups in total` }) },
  { id: 'turnRun', scope: 'run', stat: 'turns', f: l => 4 + 2 * l, t: n => ({ ja: `1回のランで曲がり角を${n}回曲がる`, en: `Turn ${n} corners in one run` }) },
  { id: 'scoreRun', scope: 'run', stat: 'score', f: l => 3000 + 3500 * l, t: n => ({ ja: `1回のランで${fmt(n)}点とる`, en: `Score ${fmt(n)} in one run` }) },
  { id: 'feverTot', scope: 'total', stat: 'fevers', f: l => 1 + l, t: n => ({ ja: `もぐもぐフィーバーを合計${n}回起こす`, en: `Trigger ${n} fevers in total` }) },
  { id: 'cleanRun', scope: 'run', stat: 'clean', f: l => 300 + 200 * l, t: n => ({ ja: `ぶつからずに${n}m走る`, en: `Run ${n} m without a bump` }) },
  { id: 'office', scope: 'run', stat: 'office', f: () => 1, t: () => ({ ja: '9:00までにオフィスに着く', en: 'Get to the office by 9:00' }) },
  { id: 'yamanote', scope: 'run', stat: 'yamanote', f: () => 1, t: () => ({ ja: '山手線に乗る（車内を走りぬける）', en: 'Ride the Yamanote Line' }) },
  { id: 'lookTot', scope: 'total', stat: 'looks', f: l => 3 + l * 2, t: n => ({ ja: `振り向いた顔を合計${n}回見る`, en: `Earn ${n} look-backs (dodge well and they glance at you)` }) },
  { id: 'flyTot', scope: 'total', stat: 'flights', f: l => 1 + l, t: n => ({ ja: `紙ひこうきで合計${n}回飛ぶ`, en: `Fly the paper plane ${n} times` }) },
  { id: 'chime', scope: 'run', stat: 'chime', f: () => 1, t: () => ({ ja: '18:00の定時チャイムまで走りきる', en: 'Make it to the 6 PM chime' }), min: 3 },
  { id: 'stampTot', scope: 'abs', stat: 'stamps', f: l => Math.min(14, 2 + l), t: n => ({ ja: `観光スタンプを${n}個集める`, en: `Collect ${n} Tokyo stamps` }), min: 2 },
  { id: 'zukanAll', scope: 'abs', stat: 'zukan', f: l => Math.min(21, 6 + l * 2), t: n => ({ ja: `えさ図鑑を${n}種類うめる`, en: `Fill in ${n} food book entries` }) },
];

/* ---- closet items: who, slot, price ---- */
const CLOSET = [
  { id: 'tie_red', who: 'ren', slot: 'tie', v: 'red', cost: 800, ja: '赤い水玉ネクタイ', en: 'Red polka-dot tie' },
  { id: 'tie_navy', who: 'ren', slot: 'tie', v: 'navy', cost: 800, ja: 'ネイビーのストライプネクタイ', en: 'Navy striped tie' },
  { id: 'tie_green', who: 'ren', slot: 'tie', v: 'green', cost: 800, ja: 'グリーンのネクタイ', en: 'Green tie' },
  { id: 'tie_sakura', who: 'ren', slot: 'tie', v: 'sakura', cost: 1500, ja: '桜もようのネクタイ', en: 'Cherry blossom tie' },
  { id: 'frame_red', who: 'jill', slot: 'frame', v: 'red', cost: 800, ja: '赤いフレームのメガネ', en: 'Red frames' },
  { id: 'frame_gold', who: 'jill', slot: 'frame', v: 'gold', cost: 1200, ja: 'ゴールドのメガネ', en: 'Gold frames' },
  { id: 'frame_pink', who: 'jill', slot: 'frame', v: 'pink', cost: 1200, ja: 'ピンクのメガネ', en: 'Pink frames' },
  { id: 'hat_beret_ren', who: 'ren', slot: 'hat', v: 'beret', cost: 1200, ja: '赤いベレー帽', en: 'Red beret' },
  { id: 'hat_straw_ren', who: 'ren', slot: 'hat', v: 'straw', cost: 1500, ja: '麦わら帽子', en: 'Straw hat' },
  { id: 'hat_helmet_ren', who: 'ren', slot: 'hat', v: 'helmet', cost: 2000, ja: '現場のヘルメット', en: 'Hard hat' },
  { id: 'hat_santa_ren', who: 'ren', slot: 'hat', v: 'santa', cost: 2500, ja: 'サンタ帽', en: 'Santa hat' },
  { id: 'hat_crown_ren', who: 'ren', slot: 'hat', v: 'crown', cost: 6000, ja: '社長の王冠', en: "The president's crown" },
  { id: 'hat_ribbon', who: 'jill', slot: 'hat', v: 'ribbon', cost: 1000, ja: 'ピンクのリボン', en: 'Pink ribbon' },
  { id: 'hat_beret_jill', who: 'jill', slot: 'hat', v: 'beret', cost: 1200, ja: '赤いベレー帽', en: 'Red beret' },
  { id: 'hat_straw_jill', who: 'jill', slot: 'hat', v: 'straw', cost: 1500, ja: '麦わら帽子', en: 'Straw hat' },
  { id: 'hat_santa_jill', who: 'jill', slot: 'hat', v: 'santa', cost: 2500, ja: 'サンタ帽', en: 'Santa hat' },
  { id: 'hat_crown_jill', who: 'jill', slot: 'hat', v: 'crown', cost: 6000, ja: '社長の王冠', en: "The president's crown" },
  { id: 'hat_witch_ren', who: 'ren', slot: 'hat', v: 'witch', cost: 0, ev: 'halloween', ja: '魔法使いの帽子（ハロウィン限定）', en: 'Wizard hat (Halloween gift)' },
  { id: 'hat_pumpkin_jill', who: 'jill', slot: 'hat', v: 'pumpkin', cost: 0, ev: 'halloween', ja: 'かぼちゃの帽子（ハロウィン限定）', en: 'Pumpkin cap (Halloween gift)' },
  { id: 'hat_antler_jill', who: 'jill', slot: 'hat', v: 'antler', cost: 0, ev: 'xmas', ja: 'トナカイのカチューシャ（クリスマス限定）', en: 'Reindeer antlers (Christmas gift)' },
  { id: 'hat_santa_gift_ren', who: 'ren', slot: 'hat', v: 'santa', cost: 0, ev: 'xmas', ja: 'サンタ帽（クリスマス限定）', en: 'Santa hat (Christmas gift)' },
  { id: 'hat_kagami_ren', who: 'ren', slot: 'hat', v: 'kagami', cost: 0, ev: 'newyear', ja: '鏡もちの帽子（お正月限定）', en: 'Rice-cake cap (New Year gift)' },
  { id: 'hat_sakura_jill', who: 'jill', slot: 'hat', v: 'sakura', cost: 0, ev: 'hanami', ja: '桜の髪かざり（お花見限定）', en: 'Cherry-blossom clip (spring gift)' },
  { id: 'hat_heart_jill', who: 'jill', slot: 'hat', v: 'heartband', cost: 0, ev: 'valentine', ja: 'ハートのカチューシャ（バレンタイン限定）', en: 'Heart headband (Valentine gift)' },
  { id: 'hat_star_ren', who: 'ren', slot: 'hat', v: 'starband', cost: 0, ev: 'tanabata', ja: '星のはちまき（七夕限定）', en: 'Star headband (Tanabata gift)' },
  { id: 'suit_bee', who: 'ren', slot: 'suit', v: 'bee', cost: 3000, ja: 'ミツバチのコスプレ', en: 'Honeybee costume' },
  { id: 'suit_zebra', who: 'jill', slot: 'suit', v: 'zebra', cost: 3000, ja: 'しまうま模様のコスプレ', en: 'Zebra costume' },
];

/* ---- seasonal events ----
   Each event is a "kit" (gift hats in CLOSET with ev:<id>, decorations in the streets and the title room, a title toast).
   Which event runs is decided by, in order: '#ev=<id>' in the address (testing) → the feed (feed.json "events", written
   by the weekly automation after it checks the calendar and the trends) → the built-in calendar below. */
const EV_KITS = {
  halloween: { deco: 'jackO', gift: { ja: 'ハロウィン：限定の帽子をプレゼント！購買部でかぶれます', en: 'Happy Halloween! Gift hats are waiting in the Shop' } },
  xmas: { deco: 'xmasTree', gift: { ja: 'クリスマス：限定の帽子をプレゼント！購買部でかぶれます', en: 'Merry Christmas! Gift hats are waiting in the Shop' } },
  newyear: { deco: 'kadomatsu', gift: { ja: 'あけましておめでとう：お正月の帽子をプレゼント！', en: 'Happy New Year! A New Year cap is waiting in the Shop' } },
  valentine: { deco: 'heartBox', gift: { ja: 'バレンタイン：限定のカチューシャをプレゼント！', en: 'Happy Valentine’s! A gift headband is in the Shop' } },
  hanami: { deco: 'sakuraPot', gift: { ja: 'お花見の季節：桜の髪かざりをプレゼント！', en: 'Cherry-blossom season! A gift clip is in the Shop' } },
  tanabata: { deco: 'bambooWish', gift: { ja: '七夕：星のはちまきをプレゼント！', en: 'Tanabata! A star headband is in the Shop' } },
};
// the built-in calendar (month-day ranges, local date) — the feed can add, move or replace these
const EV_CAL = [['newyear', '01-01', '01-07'], ['valentine', '02-01', '02-14'], ['hanami', '03-20', '04-10'], ['tanabata', '07-01', '07-07'], ['halloween', '10-15', '10-31'], ['xmas', '12-01', '12-25'], ['newyear', '12-29', '12-31']];
const EVENT_INFO = (() => {
  const d = new Date(), md = String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'), iso = d.getFullYear() + '-' + md;
  try { const m = /[#&]ev=([a-z]+)/.exec(location.hash) || /[#&](halloween)\b/.exec(location.hash); if (m && EV_KITS[m[1]]) return { id: m[1] }; } catch (e) { }
  try { const f = JSON.parse(localStorage.getItem('rjFeed') || 'null'); if (f && Array.isArray(f.events)) { const e = f.events.find(e => e && EV_KITS[e.id] && e.from <= iso && iso <= e.to); if (e) return e; if (f.eventsOnly) return {}; } } catch (e) { }
  const c = EV_CAL.find(([, a, b]) => a <= md && md <= b); return c ? { id: c[0], to: d.getFullYear() + '-' + c[2] } : {};
})();
const EVENT = EVENT_INFO.id || '';
/* ---- in Japanese mode the English labels give way to Japanese ones ---- */
const JA_LBL = { 'LUNCH?': 'お昼休み', 'WHICH WAY?': '分かれ道', 'JUMP': 'ジャンプ', 'SLIDE': 'スライディング', 'DODGE': 'よける', 'NEW TITLE!': '称号ゲット！', 'ALMOST!': 'もう少し！', 'DAILY CLEAR!': '今日のチャレンジ達成！', 'GOOD!': 'いいね！', 'FIRST-RUN BONUS!': '初回ボーナス！', 'KEEP GOING!': 'まだまだ！', 'LAST TRAIN': '終電', 'LUCKY!': 'ラッキー！',
  'MISSION CLEAR': 'ミッション達成', 'PHOTO': '記念写真', 'SAVED!': 'セーフ！', 'STAMP!': 'スタンプ！', 'BUMP!': 'ぶつかった！', 'MUNCH MUNCH FEVER!': 'もぐもぐフィーバー！', "IT'S 6 PM! FEVER": '定時！ フィーバー',
  'NEW BEST!': '自己ベスト！', '8:00 AM': '朝 8:00', '9:00 ON TIME!': '9:00 出社！', '← LEFT': '← 左へ', 'RIGHT →': '右へ →', 'FEVER!': 'フィーバー！', 'NICE JUMP!': 'ナイスジャンプ！', 'NICE SLIDE!': 'ナイススライド！',
  'CLOSE!': 'ギリギリ！', '← SWIPE →': '← スワイプ →', '↑ JUMP': '↑ ジャンプ', '↓ SLIDE': '↓ スライディング', 'TURN →': '右へ曲がる →', '← TURN': '← 左へ曲がる', '450 m!': '地上450m！', '150 m DECK!': '地上150m！',
  'GOAL': 'あそびかた', '♥ BUMPS': 'ぶつかったら', 'FEVER': 'もぐもぐフィーバー', 'TAP A FOOD': 'タップすると解説', 'BUNNY FOOD NOTE': 'うさぎごはんメモ', 'NG FOOD': 'あげちゃダメ', 'GO!': 'GO！', 'OOPS.': 'あっ。', 'PAUSE': 'ひと休み' };
function lab(en) {
  if (LANG !== 'ja' || !en) return en;
  if (JA_LBL[en] != null) return JA_LBL[en];
  if (/[^\x00-\x7F]/.test(en)) return en; // already Japanese
  let m;
  if ((m = /^DAY (\d+)/.exec(en))) return `${m[1]}日目`;
  if (/^NEXT: /.test(en)) return '次の駅';
  if (/^NO /.test(en)) return 'ダメ！';
  if (/^\d[\d,]* COMBO$/.test(en)) return en.replace(' COMBO', 'コンボ');
  return ''; // other English labels are dropped; the Japanese line carries the message
}
