'use strict';
/* ================= utils ================= */
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
function wpick(list) { let t = 0; for (const e of list) t += e[1]; let r = Math.random() * t; for (const e of list) { r -= e[1]; if (r <= 0) return e[0]; } return list[0][0]; }
const hexRgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const fmt = n => Math.floor(n).toLocaleString(({ ja: 'ja-JP', en: 'en-US', zh: 'zh-TW', ko: 'ko-KR' })[LANG] || 'en-US');
function todayStr() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function clockStr(min) { min = Math.floor(min) % 1440; return Math.floor(min / 60) + ':' + String(min % 60).padStart(2, '0'); }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ================= save ================= */
const SAVE_KEY = 'renjill-hay-dash-v1';
const defSave = () => ({ best: 0, bank: 0, closet: {}, wear: { ren: { tie: 'gold', hat: '', suit: '' }, jill: { frame: 'brown', hat: '', suit: '' }, pom: { band: 'red', hat: '', suit: '' } }, upg: { dash: 0, magnet: 0, jump: 0, x2: 0, fly: 0 }, clovers: 1, char: 'ren', mug: false, mugOn: false,
  mlevel: 1, missions: null, totals: {}, zukan: {}, seenZukan: 0, daily: '', streak: 0, mute: false, runs: 0, bestClock: 480,
  lang: '', stamps: {}, album: {}, bestDay: 1, seenStamps: 0 });
let SV = defSave();
function svFrom(o) { const SVp = SV; SV = Object.assign(defSave(), o); try { const D = defSave(); SV.upg = Object.assign(D.upg, o.upg && typeof o.upg === 'object' ? o.upg : {}); for (const k of ['totals', 'zukan', 'stamps', 'album', 'ach', 'opt']) if (!SV[k] || typeof SV[k] !== 'object') SV[k] = D[k] || {}; if (SV.missions && !Array.isArray(SV.missions.slots)) SV.missions = null; if (!(SV.char === 'ren' || SV.char === 'jill' || (SV.char === 'pom' && SV.pomMet))) SV.char = 'ren'; SV.nick = typeof SV.nick === 'string' ? SV.nick.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 12) : ''; const dw = defSave().wear; SV.wear = { ren: Object.assign(dw.ren, (o.wear || {}).ren || {}), jill: Object.assign(dw.jill, (o.wear || {}).jill || {}), pom: Object.assign(dw.pom, (o.wear || {}).pom || {}) }; SV.closet = o.closet && typeof o.closet === 'object' && !Array.isArray(o.closet) ? o.closet : {}; if (SV.last && (typeof SV.last !== 'object' || !Number.isFinite(+SV.last.score))) delete SV.last; svNums(); } catch (e) { SV = SVp; throw e; } }
// numbers from an old or damaged save: never NaN, never negative (the title would show “NaN” hay)
function svNums() { const D = defSave(); for (const k of ['best', 'bank', 'clovers', 'runs', 'mlevel', 'streak', 'bestClock', 'bestDay', 'seenZukan', 'seenStamps']) { const v = +SV[k]; SV[k] = Number.isFinite(v) && v >= 0 ? Math.floor(v) : D[k]; } if (SV.mlevel < 1) SV.mlevel = 1; if (SV.bestDay < 1) SV.bestDay = 1; for (const k in SV.upg) { const v = +SV.upg[k]; SV.upg[k] = Number.isFinite(v) ? Math.max(0, Math.min(5, Math.floor(v))) : 0; } if (!SV.wear || typeof SV.wear !== 'object') SV.wear = D.wear; }
try { const raw = localStorage.getItem(SAVE_KEY); if (raw) { const o = JSON.parse(raw); if (o && typeof o === 'object' && !Array.isArray(o)) svFrom(o); } } catch (e) { SV = defSave(); }
// one stable player id per save: it travels with a transfer code, so a future app (iOS/Android) can take the same account over
if (!SV.pid) { try { SV.pid = (crypto.randomUUID ? crypto.randomUUID() : 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2)); } catch (e) { SV.pid = 'p' + Date.now().toString(36); } }
/* ---- Ren & Jill on social media (the official profiles; plain text links, no logos) ---- */
const SNS_HANDLE = '@renjill_office';
const SNS = [{ id: 'ig', name: 'Instagram', url: 'https://www.instagram.com/renjill_office/' }, { id: 'tt', name: 'TikTok', url: 'https://www.tiktok.com/@renjill_office' },
  { id: 'yt', name: 'YouTube', url: 'https://www.youtube.com/@renjill_office' }, { id: 'th', name: 'Threads', url: 'https://www.threads.net/@renjill_office' },
  { id: 'fb', name: 'Facebook', url: 'https://www.facebook.com/1358515160686321' }];
const OFFICIAL_SITE = 'https://renjill.coana.co.jp/', SITE_REF = OFFICIAL_SITE + '?ref=haydash'; // the official site can count visits that came from the game
/* ---- where a new player came from: ?ref=<channel> on a shared link (one short word from this list, nothing personal).
   Kept once (the first visit) and sent with the ranking row as "src", so qa/kpi.mjs can count players per channel. */
const REF_OK = ['x', 'line', 'fb', 'ig', 'th', 'copy', 'share', 'site', 'yt', 'tt', 'guide', 'rank', 'qr', 'itch', 'gamejolt', 'newgrounds', 'freem', 'plicy', 'portal', 'indiedb', 'crazygames', 'gamenora', 'addicting'];
// played inside a game portal that has its own rules (CrazyGames: no links out to a playable web version, ads only through its SDK).
// Decided once per tab: the address (?ref=crazygames) or the page that framed us; kept in sessionStorage because the address is cleaned right after
const HOST_PORTAL = (() => { try { const r = (new URLSearchParams(location.search).get('ref') || '').toLowerCase(), anc = [...(location.ancestorOrigins || [])].join(' ') + ' ' + (document.referrer || '');
  const p = r === 'crazygames' || /crazygames\./i.test(anc) ? 'crazygames' : (sessionStorage.getItem('rjPortal') || ''); if (p) sessionStorage.setItem('rjPortal', p); return p; } catch (e) { return ''; } })();
const REF_IN = (() => { try { const q = new URLSearchParams(location.search), r = (q.get('ref') || '').toLowerCase(); if (!q.has('ref')) return ''; q.delete('ref'); const rest = q.toString(); history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash); return REF_OK.includes(r) ? r : ''; } catch (e) { return ''; } })();
if (REF_IN && !SV.ref) SV.ref = REF_IN;
/* ---- account transfer: the whole save (without photos) as a code, readable by any build of the game ----
   format: RJ1.<base64url of deflated JSON>.<checksum>   (RJ0 = not compressed, for browsers without CompressionStream) */
const XFER_FIELDS_SKIP = ['album', 'bestPics', 'ghost']; // 写真はこの端末だけ（引き継ぎコード・記録の保存先には入れない）
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
// a code pasted from LINE, a notes app or a mail: line breaks, full-width letters (ＲＪ１．…), invisible spaces, “smart” dashes (-- → —)
// and words around it are all fine. The checksum decides where the code ends.
function xferParse(code) {
  const s = String(code || '').normalize('NFKC').replace(/[\u2014\u2015\u2E3A]/g, '--').replace(/[\u2010-\u2013\u2212\uFE63]/g, '-').replace(/[\u200B-\u200D\u2060\uFEFF\u00AD]/g, '').replace(/^[ \t]*(?:>[ \t]*)+/gm, ''); // also the “> ” of a quoted mail
  const m = /(RJ[01])\s*\.([A-Za-z0-9_\-\s]+)\.\s*([a-z0-9][a-z0-9\s]*)/i.exec(s); if (!m) throw new Error('format');
  const body = m[2].replace(/\s+/g, ''), sum = xferSum(body); if (!body) throw new Error('format');
  if (!m[3].replace(/\s+/g, '').startsWith(sum)) throw new Error('checksum');
  return { tag: m[1].toUpperCase(), body };
}
async function xferRead(code) {
  const m = xferParse(code);
  const bin = atob(m.body.replace(/-/g, '+').replace(/_/g, '/')); let bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  if (m.tag === 'RJ1') { if (typeof DecompressionStream === 'function') { const ds = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')); bytes = new Uint8Array(await new Response(ds).arrayBuffer()); } else bytes = xferInflate(bytes); }
  const o = JSON.parse(new TextDecoder().decode(bytes)); if (!o || typeof o !== 'object' || Array.isArray(o) || o._v !== 1) throw new Error('version'); return o;
}
// older phones (iPhone before iOS 16.4) have no DecompressionStream: a small raw-DEFLATE reader so RJ1 codes open there too
function xferInflate(src) {
  let pos = 0, bit = 0, bb = 0; const out = [];
  const bits = n => { let v = 0; for (let i = 0; i < n; i++) { if (!bit) { if (pos >= src.length) throw new Error('data'); bb = src[pos++]; bit = 8; } v |= (bb & 1) << i; bb >>= 1; bit--; } return v; };
  const build = lens => { const cnt = new Uint16Array(16), offs = new Uint16Array(16), sym = new Uint16Array(lens.length); for (const l of lens) cnt[l]++; cnt[0] = 0; for (let i = 1; i < 16; i++) offs[i] = offs[i - 1] + cnt[i - 1]; for (let i = 0; i < lens.length; i++) if (lens[i]) sym[offs[lens[i]]++] = i; return { cnt, sym }; };
  const dec = h => { let code = 0, first = 0, idx = 0; for (let l = 1; l < 16; l++) { code |= bits(1); const c = h.cnt[l]; if (code - c < first) return h.sym[idx + code - first]; idx += c; first += c; first <<= 1; code <<= 1; } throw new Error('data'); };
  const LB = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258], LE = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
  const DB = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577], DE = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
  let last;
  do { last = bits(1); const type = bits(2);
    if (type === 0) { bit = 0; if (pos + 4 > src.length) throw new Error('data'); const len = src[pos] | src[pos + 1] << 8; pos += 4; if (pos + len > src.length) throw new Error('data'); for (let i = 0; i < len; i++) out.push(src[pos++]); continue; }
    if (type === 3) throw new Error('data');
    let lh, dh;
    if (type === 1) { const l = []; for (let i = 0; i < 288; i++) l.push(i < 144 ? 8 : i < 256 ? 9 : i < 280 ? 7 : 8); lh = build(l); dh = build(new Array(30).fill(5)); }
    else { const nl = bits(5) + 257, nd = bits(5) + 1, nc = bits(4) + 4, ORD = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], cl = new Array(19).fill(0);
      for (let i = 0; i < nc; i++) cl[ORD[i]] = bits(3); const ch = build(cl), lens = [];
      while (lens.length < nl + nd) { const s = dec(ch); if (s < 16) lens.push(s); else if (s === 16) { if (!lens.length) throw new Error('data'); const p = lens[lens.length - 1]; for (let r = 3 + bits(2); r--;) lens.push(p); } else for (let r = s === 17 ? 3 + bits(3) : 11 + bits(7); r--;) lens.push(0); }
      lh = build(lens.slice(0, nl)); dh = build(lens.slice(nl, nl + nd)); }
    for (;;) { const s = dec(lh); if (s < 256) out.push(s); else if (s === 256) break; else { const i = s - 257; if (i >= 29) throw new Error('data'); const len = LB[i] + bits(LE[i]), d = dec(dh); if (d >= 30) throw new Error('data'); const dist = DB[d] + bits(DE[d]); if (dist > out.length) throw new Error('data'); for (let k = 0; k < len; k++) out.push(out[out.length - dist]); }
      if (out.length > 8e6) throw new Error('data'); }
  } while (!last);
  return new Uint8Array(out);
}
async function xferApply(code) {
  const o = await xferRead(code), fs = o._fs; delete o._fs; delete o._v; delete o._at;
  const album = SV.album, bestPics = SV.bestPics, pid = SV.pid; svFrom(o); SV.album = album || {}; SV.bestPics = bestPics || []; if (!SV.pid) SV.pid = pid; // photos stay with this device; a code from before player ids keeps this device's id
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
  for (let k = 0; k < 100; k++) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SV)); return; } catch (e) { if (SV.bestPics && SV.bestPics.length > 1) { SV.bestPics.pop(); continue; } const ks = Object.keys(SV.album || {}); if (!ks.length) return; delete SV.album[ks[0]]; } } }
const OPT = () => (SV.opt = Object.assign({ ctrl: 'swipe', sens: 'normal', vib: true, calm: !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches), music: true, sfx: true, easy: false, big: false, hand: false, ghost: true }, SV.opt || {}));
/* ---- languages: the same four as the official site (日本語・English・繁體中文・한국어) ----
   Chinese and Korean come from I18N (src/0_i18n.js, keyed by the Japanese text); anything missing falls back to English. */
const LANGS = ['ja', 'en', 'zh', 'ko'], LANG_NAME = { ja: '日本語', en: 'English', zh: '繁體中文', ko: '한국어' };
const QLANG = (/[?&]lang=(ja|en|zh|ko)\b/.exec(location.search) || [])[1]; // ?lang=en opens the English version (links from the guides)
const navLang = () => { const n = (navigator.language || 'ja').toLowerCase(); return n.startsWith('ja') ? 'ja' : n.startsWith('zh') ? 'zh' : n.startsWith('ko') ? 'ko' : 'en'; };
let LANG = QLANG || (LANGS.includes(SV.lang) ? SV.lang : navLang());
const i18nMiss = ja => { if (window.__i18nMiss) window.__i18nMiss.add(ja); }; // the language check (qa/i18n_audit.js) lists phrases with no translation yet
const tr = (ja, en) => LANG === 'ja' ? ja : LANG === 'en' ? en : ((I18N[LANG] || {})[ja] ?? (i18nMiss(ja), en)); // a Japanese/English pair in the current language
const L = o => o == null ? '' : typeof o === 'string' ? o : (o[LANG] ?? (LANG === 'ja' ? (o.ja ?? o.en) : LANG === 'en' ? (o.en ?? o.ja) : ((o.ja != null && (I18N[LANG] || {})[o.ja]) || (o.ja != null && i18nMiss(o.ja), o.en ?? o.ja))) ?? '');

/* ================= interface text ================= */
const STR = {
  resMore: ['くわしく見る（ミッション・えさメモ・シェア画像）', 'More: missions, food note, share image'], resNameT: ['ランキングの名前をつける', 'Set your ranking name'],
  pomPeek2: ['ポムが走っていった！ ひまわりの種を見つけたら合流するよ', 'There goes Pom! Find the sunflower seeds to team up'], pomPeekSay: ['先輩、お先っす！', 'Race you there, senpai!'],
  pomHi2: ['先輩！今日もお供するっす！', 'Senpai! Reporting for duty again!'], pomJoin2: ['新人のポムが合流！ ほお袋がいっぱいになるとボーナス（スコア1.2倍）', 'Pom is back! Fill those cheek pouches for a bonus (score ×1.2)'], pomPuff: ['ほお袋MAXっす！おすそわけ！', 'Pouches full! Sharing!'], pomPeek: ['道のまん中に…ハムスター!? こっちを見てる…', 'A hamster... in the road!? It’s looking at you...'],
  pomJoin: ['体育会系の新入社員、キンクマハムスターのポムが合流！ ほお袋がいっぱいになるとボーナス（スコア1.2倍）', 'Meet Pom, the sporty new hire (a golden hamster)! Fill those cheek pouches for a bonus (score ×1.2)'], pomHi: ['押忍！新人のポムっす！', 'Osu! Pom, the new hire, reporting for duty!'],
  pomWorry: ['先輩!? 大丈夫っすか!?', 'Senpai!? You OK!?'], pomDonmai: ['ドンマイっす！', "Shake it off!"], pomFever: ['ファイトーー！', 'Go, go, gooo!'], pomNice: ['ナイスっす！', 'Nice one!'], pomNice2: ['まだまだいけるっす！', 'Keep it up!'], pomStamp: ['スタンプ、映えるっす！', 'Ooh, picture-perfect!'],
  bigText: ['文字の大きさ', 'Text size'], bigN: ['ふつう', 'Normal'], bigY: ['大きめ', 'Large'], bigNote: ['画面の上の数字・お知らせの帯・この画面の文字を少し大きくします', 'Makes the top numbers, the message strip and these menus a little bigger'],
  sensNote: ['「敏感」にすると、短いスワイプでも反応します', 'High: shorter swipes count'], calmNote: ['画面のゆれ・フラッシュ・残像をおさえます', 'Less shaking, flashing and trails'],
  hitWhat: ['ぶつかったのは、これ', 'You bumped into this'], hitWhatN: ['ぶつかったのは「{0}」', 'You bumped into this'],
  ghostOpt: ['ベストの自分と競走', 'Race your best run'], ghostNote: ['いちばん良かった走りが、うすいうさぎになって前を走ります。上に「ベストより +12m」などと出ます', 'Your best run appears as a faint bunny ahead of you, with a "+12m vs best" count at the top'],
  ghostAhead: ['ベストより +{0}m', '+{0}m vs best'], ghostBehind: ['ベストまで {0}m', '{0}m behind best'], ghostTag: ['ベスト', 'BEST'],
  hand: ['片手で操作', 'One-handed'], handNote: ['タップ操作を画面の下半分だけにします（左右＝移動、まんなかの上＝ジャンプ、下＝スライディング）', 'Tap controls use only the lower half (sides = move, middle top = jump, bottom = slide)'],
  errLogH: ['エラーの記録', 'Error log'], errLogNote: ['うまく動かなかったときの記録です（この端末だけに残ります）。お問い合わせのときに見せてください', 'Problems this device ran into (kept only here). Handy if you contact us'], errLogNone: ['記録はありません', 'Nothing recorded'],
  goldTie: ['{0}の月間ランキング {1}位！ 金のネクタイをどうぞ', '#{1} in the {0} ranking! Here is your gold tie'], goldTieBadge: ['金のネクタイ（{0} {1}位）', 'Gold tie ({0}, #{1})'],
  titleNew: ['新しい称号を手に入れた！', 'New title!'], titleShareBtn: ['称号「{0}」をシェア', 'Share your title: {0}'], titleShareText: ['「レンとジルのチモシーダッシュ」で称号「{0}」を手に入れた！ #レンとジル #チモシーダッシュ', 'Got the title “{0}” in Ren & Jill: Hay Dash! #RenAndJill #HayDash'], titleSaved: ['称号カードの画像を保存しました（文章もコピー済み）', 'Title card saved (text copied too)'],
  kanaGot: ['あいことばの文字「{0}」を見つけた！（{1}/{2}）', 'Secret word letter "{0}" found! ({1}/{2})'], kanaDone: ['あいことば「{0}」がそろった！ +{1}', 'Secret word "{0}" complete! +{1}'], kanaHint: ['走っていると、あいことばの文字が落ちていることがあります（{0}/{1}）', 'Letters of a secret word are hidden along the way ({0}/{1})'],
  lastGo: ['終電まで {0} 秒！ ドアが閉まる前に飛び乗ろう', 'Last train in {0}s! Make it before the doors close'], lastOk: ['終電に飛び乗り！ +{0}', 'Made the last train! +{0}'], lastMiss: ['ドアが閉まった…次の電車で帰ろう', 'The doors closed... take the next one'], lastHud: ['終電まで {0}秒', 'Last train {0}s'], lastClosed: ['ドアが閉まった', 'Doors closed'],
  revBtn: ['🌙 逆走デー：夕方から家まで', '🌙 Reverse day: home from 6 PM'], revGo: ['逆走デー！ 会社から家まで帰ろう', 'Reverse day! Run home from the office'], revHome: ['ただいま！ 家に着いた +{0}', 'Home at last! +{0}'],
  bossGo: ['締め切りの山がせまる！ ぶつからずに逃げ切れ', 'The Deadline Mountain is coming! Escape without a bump'], bossName: ['締め切りの山　あと {0}m', 'Deadline Mountain: {0}m to go'], bossWin: ['締め切りの山から逃げ切った！ +{0}', 'Escaped the Deadline Mountain! +{0}'], bossWin2: ['なんとか逃げ切った！ +{0}', 'Just got away! +{0}'],
  epGig: ['今日の動画「{0}」より：{1}', 'From today\'s video "{0}": {1}'],
  matsuri: ['お祭りの日！ 提灯の道は祭りばやし', 'Festival day! Lantern streets play festival music'],
  duo: ['👥 ふたりで交代', '👥 Take turns (2 players)'], duoTurn: ['{0}P の番', 'Player {0}'], duoNext: ['{0}P：{1}　次は 2P の番！', 'P1: {1}. Now it is P2\'s turn!'], duoGo2: ['2P スタート', 'P2, GO!'],
  duoSum: ['ふたりの合計 {0}（1P {1} ＋ 2P {2}）', 'Team total {0} (P1 {1} + P2 {2})'], duoWin: ['この回は {0}P の勝ち！', 'P{0} wins this round!'], duoTie: ['引き分け！', 'A tie!'], duoNote: ['ふたりの走りはランキングには入りません', 'Two-player runs are not on the ranking'],
  practice: ['練習・場所えらび', 'Practice: pick a place'], practiceNote: ['行ったことのある場所から選んで走れます。ぶつかっても終わりません（やめるときは一時停止→やめる）。点数・牧草は記録に入りません', 'Pick a place you have been to. Bumps never end the run (pause → quit to stop). Scores and hay are not saved'], practiceHome: ['課長の家から', 'From the boss’s home'], practiceMore: ['名所に行くと、ここで選べる場所が増えます', 'Visit more spots to unlock more places here'], practiceGo: ['練習：ぶつかっても続きます', 'Practice: bumps won’t stop you'], practiceBump: ['ぶつかった！（練習なので続けます）', 'Bump! (Practice, keep going)'], practiceDone: ['練習おつかれさま：{0}点・牧草{1}本・ぶつかった{2}回（記録には入りません）', 'Practice done: {0} pts, {1} hay, {2} bumps (not saved)'],
  howA1: ['左右にスワイプ：よける', 'Swipe left/right: dodge'], howA2: ['上にスワイプ：ジャンプ', 'Swipe up: jump'], howA3: ['下にスワイプ：スライディング', 'Swipe down: slide'],
  mapH: ['走った場所の地図', 'Map of where you ran'], mapNote: ['足あと＝行った名所（{0} / {1}）。灰色の点はまだ行っていない所', 'Paw prints = spots you have visited ({0} / {1}). Grey dots: not yet'],
  plantLv: ['机の観葉植物 Lv.{0}', 'Desk plant Lv.{0}'], plantNext: ['あと牧草{0}本で育つ', '{0} more hay to grow'], plantNote: ['集めた牧草で育ちます', 'Grows with all the hay you collect'],
  plantUp: ['机の観葉植物が大きくなった！（集めた牧草で育つ）', 'Your desk plant grew! (It grows with all the hay you collect)'], bestPics: ['自己ベストの記念写真', 'Personal best photos'], bestPicCap: ['自己ベスト {0}点', 'Best {0}'],
  memoJill: ['課長、助かります！', 'Thanks, boss!'], memoRen: ['おお、助かった！', 'Oh, a lifesaver!'], memoPom: ['先輩、助かるっす！', 'Thanks, chief!'],
  worryRen: ['ジル、大丈夫か!?', 'Jill, are you OK!?'], worryJill: ['課長、大丈夫ですか!?', 'Boss, are you OK!?'],
  start: ['スタート', 'START'], again: ['もう一回！', 'ONE MORE RUN'], resume: ['つづける', 'RESUME'],
  legal: ['このゲームはフィクションです。登場する地名・駅名は場所を表すためのもので、実在の施設・企業・団体とは関係がなく、公認を受けたものでもありません。うさぎの食べ物のメモは一般的な目安です（主な出典：長野県動物愛護センターの資料）。本物のうさぎのことは、うさぎを診られる動物病院に相談してください。チャットのジルの答えは間違うこともあります。フォント：Dela Gothic One、Zen Maru Gothic（SIL Open Font License 1.1）。音楽・効果音・絵はこのゲームのために作ったものです。© COANA TOKYO「レンとジル」',
    'This game is fiction. Place and station names are used only to show where you are; the game is not affiliated with or endorsed by any real facility, company or group. Rabbit food notes are general guidance (main source: Nagano Prefecture Animal Welfare Center). For a real rabbit, ask a vet who sees rabbits. Chat Jill’s answers may be wrong. Fonts: Dela Gothic One, Zen Maru Gothic (SIL Open Font License 1.1). All music, sound effects and art were made for this game. © COANA TOKYO “Ren & Jill”'],
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
  reviveClover: ['お守り×{0}で続ける', 'Use {0} charm to continue'], reviveHay: ['チモシー{0}本で続ける', 'Continue for {0} hay'], reviveAd: ['広告を見て続ける', 'Watch an ad to keep going'], adFail: ['広告を出せませんでした', 'No ad right now'],
  reviveHave: ['お守り {0}個・チモシー {1}本', 'Charms: {0} · Hay: {1}'], seeResult: ['結果を見る', 'See result'],
  keepGoing: ['まだ定時じゃない！', 'Not quitting time yet!'],
  morning: ['課長、寝坊。走れ！', 'The boss overslept. Run!'],
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
  shareText: ['「レンとジルのチモシーダッシュ」で {0}点！ {1}まで走った（{2}）この記録、こえられる？ #レンとジル #チモシーダッシュ', 'I scored {0} in Ren & Jill: Hay Dash and made it to {1} ({2}). Can you beat it? #RenAndJill #レンとジル'],
  shareTextWon: ['挑戦状の{3}点をこえて {0}点！（{2}）次はあなたの番！ #レンとジル #チモシーダッシュ', 'Beat the {3} challenge with {0} ({2})! Your turn! #RenAndJill #レンとジル'],
  reviveFree: ['初回ボーナスで続ける', 'Continue for free'], reviveFreeNote: ['最初の3回のプレイは、1回だけ無料で続けられます', 'First-run bonus: in your first 3 runs, continue once for free'], firstFever: ['フィーバー中はぶつかっても平気！', 'You can’t crash in a fever!'],
  resetH: ['データのリセット', 'Reset your data'], resetNote: ['スコア・チモシー・服・スタンプ・ランキングの記録をすべて消して、はじめからにします。元にはもどせません（残したいときは先に「記録のバックアップ」のコードを作ってください）。', 'Erase every record (scores, hay, clothes, stamps and your ranking entries) and start over. This cannot be undone: make a backup code first if you want to keep a copy.'],
  resetBtn: ['データをリセットする', 'Reset my data'], resetAsk: ['本当にすべて消しますか？', 'Really erase everything?'], resetYes: ['消してはじめから', 'Erase all'], resetNo: ['やめる', 'Cancel'],
  resetDoing: ['消しています…', 'Erasing...'], resetDone: ['消しました。はじめから始めます', 'Done. Starting over'],
  linkH: ['記録の引き継ぎ（ログイン不要）', 'Move your progress (no sign-in)'], linkNote: ['スマホを変えたとき、LINE とブラウザ、スマホとパソコンなど、どこでも同じ記録で遊べます。', 'New phone, LINE and your browser, phone and PC: keep playing with the same progress anywhere.'],
  linkMake: ['引き継ぎコードを出す', 'Get a transfer code'], linkPh: ['コード（8文字）', '8 letters'], linkInH: ['この端末に引き継ぐ：前の端末で出したコードを入れる', 'Move progress here: enter the code from your other device'], linkInHow: ['前に遊んだ端末でこのゲームを開き、⚙ →「引き継ぎコードを出す」を押すと、8文字のコードが出ます。', 'On the device you played before, open the game, tap ⚙ and “Get a transfer code”.'], linkOutH: ['ほかの端末へ引き継ぐ', 'Move progress to another device'], linkGo: ['引き継ぐ', 'Transfer'], linkWait: ['少し待ってください…', 'One moment...'],
  linkShow: ['引き継ぎたい端末で、このゲームを開いて ⚙ →「この端末に引き継ぐ」にこの8文字を入れてください（{0}分有効）。リンクを送って開いてもOKです。', 'On the other device, open the game, tap ⚙ and enter these 8 letters under “Move progress here” (valid {0} minutes). Or send yourself the link and open it there.'], linkCopy: ['引き継ぎリンクをコピー・送る', 'Copy / send the transfer link'], linkCopied: ['リンクをコピーしました', 'Link copied'],
  linkBad: ['コードが見つかりません（まちがい・15分が過ぎた・使用ずみ）', 'Code not found (typo, expired after 15 minutes, or already used)'], linkSelf: ['これはこの端末で出したコードです。引き継ぎたい端末のほうで入れてください', 'This code was made here. Enter it on the device you want to move to.'],
  linkAsk: ['この記録（ベスト {0}点・チモシー {1}本）を引き継ぎますか？', 'Bring over this progress (best {0}, hay {1})?'], linkMine: ['この端末のほうが記録が上です（ベスト {0}点）。この端末でコードを出して、もう一方で入れるのがおすすめです', 'This device has the better record (best {0}). Better: get the code here and enter it on the other one.'],
  linkYes: ['引き継ぐ', 'Bring it over'], linkDone: ['引き継ぎました。前の記録で続けます', 'Done! Continuing with your progress'], linkFail: ['うまくいきませんでした。少しあとでもう一度ためしてください', 'That did not work. Please try again in a moment.'],
  inAppLine: ['前に遊んだ記録で続けるなら', 'To keep your progress'], inAppOther: ['前に遊んだ記録で続けるなら', 'To keep your progress'], inAppNote: ['LINEやアプリの中では、ブラウザで遊んだ記録が見えません。ブラウザで開くと、前の記録の続きから遊べます', 'Inside LINE or another app, your browser progress is not visible. Open the game in your browser to pick up where you left off.'],
  inAppGo: ['ブラウザで開く', 'Open in your browser'], inAppHow: ['開かないときは、右上の「…」や共有ボタンから「ブラウザで開く」を選んでください', 'If it does not open, tap ⋯ or the share button and choose “Open in browser”'], close: ['閉じる', 'Close'],
  freshH: ['前に遊んだことがある？', 'Played before?'], freshNote: ['別のスマホやブラウザで遊んだ記録を、この端末に引き継げます（ログイン不要）', 'Bring progress from another phone or browser to this one (no sign-in)'], freshGo: ['記録を引き継ぐ', 'Bring my progress'],
  chalCard: ['友だちからの挑戦状', 'A FRIEND’S CHALLENGE'], chalBody: ['{0}点をこえろ！', 'Beat {0}!'], chalHud: ['挑戦 {0}', 'BEAT {0}'],
  chalWin: ['挑戦状クリア！', 'CHALLENGE BEATEN!'], chalWinSub: ['友だちの{0}点をこえた！', 'You beat your friend’s {0}!'],
  chalLeft: ['挑戦状まであと{0}点！ ', '{0} more to beat the challenge! '], chalDone: ['挑戦状クリア！（{0}点をこえた） ', 'Challenge beaten (over {0})! '],
  follow: ['レンとジルをフォロー', 'Follow Ren & Jill'], followSite: ['公式サイト', 'Official site'], followAsk: ['いい走りでした！ レンとジルのアニメもSNSで公開中です', 'Great run! The Ren & Jill anime is on social media too'],
  watchNew: ['最新話を見る', 'Watch the newest episode'], snsH: ['公式SNS', 'Official social media'], snsNote: ['アニメの新作や「あいことば」は、ここで発表しています', 'New episodes and secret words are posted here'],
  pauseLbl: ['一時停止', 'Pause'], pickChar: ['走るキャラクターを選ぶ', 'Choose who runs'], langLbl: ['言語：{0}', 'Language: {0}'],
  snsFaq: ['レンとジルのアニメは YouTube・TikTok・Instagram・Threads・Facebook（どれも @renjill_office）で見られます。新しい話が出るとタイトル画面にも出ますよ。「あいことば」もSNSで発表しています。', 'The Ren & Jill anime is on YouTube, TikTok, Instagram, Threads and Facebook (all @renjill_office). New episodes also show up on the title screen, and the secret words are posted there too.'],
  daily: ['おはよう！ {0}日連続出社ボーナス：チモシー{1}本', 'GOOD MORNING! {0}-day streak bonus: {1} hay'],
  dayLbl: ['日目', 'DAY'], dayN: ['{0}日目', 'DAY {0}'], comboN: ['{0}コンボ', '{0} COMBO'], hayN: ['チモシー {0}本', 'HAY {0}'], achGot: ['{0}（+{1}）', '{0} (+{1} hay)'], titlesN: ['称号 {0} / {1}', 'TITLES {0} / {1}'],
  nextStar: ['次の★まで {0}', '{0} to the next ★'], nextPromo: ['次の昇進まで {0}', '{0} to the next promotion'], legendStar: ['伝説の★{0}！（チモシー{1}本＋お守り{2}{3}）', 'Legend ★{0}! (+{1} hay, +{2} charm{3})'],
  promoted: ['昇進！ {0}に（チモシー{1}本＋お守り）', 'Promoted to {0}! (+{1} hay, +1 charm)'], rankYou: ['あなたは <b>{0}位</b><small>ベスト {1}</small>', "You're <b>#{0}</b><small>best {1}</small>"], untilMD: ['（〜{0}/{1}）', ' (to {0}/{1})'],
  stampFaq: ['東京の名所を初めて通るとスタンプと記念写真がもらえます。全部で{0}種類。分かれ道でまだ行っていない方を選ぶのがコツです。', "Pass a Tokyo spot for the first time to get its stamp and a photo. There are {0}. At forks, pick the way you haven't been."],
  climbs: ['高さ{0}→{1}mを登る', 'climbs {0}→{1} m'], sep: ['・', ' · '],
  settings: ['設定', 'Settings'], ctrl: ['操作', 'Controls'], ctrlSwipe: ['スワイプ', 'Swipe'], ctrlTap: ['タップ', 'Tap'],
  ctrlNote: ['タップ：画面の左右をタップでレーン移動、真ん中の上半分でジャンプ、下半分でスライディング。', 'Tap: tap the left or right side to change lanes, the upper middle to jump, the lower middle to slide.'],
  sens: ['スワイプの感度', 'Swipe sensitivity'], sensN: ['ふつう', 'Normal'], sensH: ['敏感', 'High'],
  easy: ['あそびの速さ', 'Pace'], easyN: ['ふつう', 'Normal'], easyY: ['のんびり', 'Relaxed'], easyNote: ['のんびり：速くならず、障害物も少なめ。小さな子や、はじめての人に。ランキングと自己ベストには入りません', 'Relaxed: the speed stays gentle and there are fewer obstacles. Good for small children and first-timers. Not counted for the ranking or your best.'],
  richHay: ['こっちは牧草多め！', 'More hay this way!'],
  calH: ['出社カレンダー', 'Days at work'], calN: ['この4週間で {0} 日', '{0} days in the last 4 weeks'],
  quick: ['⏱ 1分ダッシュ', '⏱ 1-minute dash'], quickHud: ['のこり {0} 秒', '{0}s left'], quickBest: ['1分ダッシュの自己ベスト：{0}', '1-minute best: {0}'], easyRes: ['のんびりモード（ランキング・自己ベストには入りません）', 'Relaxed mode (not counted for the ranking or your best)'], bond: ['なかよし', 'Buddies'], bondUp: ['レンとジルのなかよし度が上がった！ Lv.{0}', 'Ren & Jill are better buddies! Lv.{0}'], bondLbl: ['なかよし Lv.{0}', 'Buddies Lv.{0}'],
  vib: ['振動', 'Vibration'], calm: ['画面の揺れ・演出をひかえめに', 'Reduce screen shake and flashes'], music: ['音楽', 'Music'], sfx: ['効果音', 'Sound effects'], on: ['オン', 'On'], off: ['オフ', 'Off'], lvLow: ['小さめ', 'Low'], vibLow: ['弱め', 'Light'],
  resetTut: ['チュートリアルをもう一度', 'Replay the tutorial'], xfer: ['記録のバックアップ（予備）', 'Backup of your progress (spare)'], xferNote: ['ネットにつながらないときなどの予備です。長いコードをメモ帳などに保存しておけば、あとで記録をもどせます。ふだんの引き継ぎは上の「記録の引き継ぎ」が簡単です。（写真アルバムは入りません）', 'A spare for when you are offline: save the long code somewhere and restore it later. For everyday moves, “Move your progress” above is easier. (Photos are not included.)'], xferMake: ['バックアップのコードを作る', 'Make a backup code'], xferCopied: ['コードをコピーしました。メモ帳などに保存しておいてください', 'Code copied. Keep it somewhere safe'], xferPaste: ['ここにバックアップのコードを貼り付け', 'Paste a backup code here'], xferLoad: ['このコードで復元', 'Restore from this code'], xferDone: ['記録をもどしました！', 'Restored!'], xferBad: ['コードが正しくありません。最後まで貼り付けられているか確認してください', 'That code does not look right. Check it was pasted in full'], xferConfirm: ['今の記録はこのコードの記録で上書きされます。もう一度押すと復元します', 'Your current progress will be replaced. Tap again to restore'], xferMine: ['この端末にも記録があります（ベスト {0}点・チモシー {1}本・{2}回プレイ）。続けると、この端末の記録は上の記録に入れかわります', 'This device has progress too (best {0}, hay {1}, {2} runs). It will be replaced by the progress above.'], resetDone: ['次のスタートでチュートリアルが始まります', 'The tutorial will play on your next run'],
};
const t = (k, ...a) => { const s = STR[k] ? tr(STR[k][0], STR[k][1]) : k; return s.replace(/\{(\d)\}/g, (_, i) => a[i] ?? ''); };

/* ================= world constants ================= */
const HW = 4.6;               // visual half width of every corridor (sidewalks / furniture live in 2.6..4.6)
const ROAD = 2.6;             // playable half width
const LANE = 1.5;
const LANES = [-LANE, 0, LANE];
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const GRAV = 24, JUMPV = 8.0, SUPERV = 9.6, VAULT_G = .5; // a car vault is a long, floaty leap (half the gravity) just over the roof, not a big high jump. Tall cars are dodged, not jumped
const vaultV = h => Math.sqrt(2 * GRAV * VAULT_G * h);
const MAX_JUMP = 2.1; // no jump ever goes higher than this above the floor (standing on a box, super jump or not)
const capV = (v, y, g) => Math.min(v, Math.sqrt(2 * GRAV * (g || 1) * Math.max(.25, MAX_JUMP - (y || 0))));
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
  chalflag: { ja: '挑戦状の旗', en: 'Challenge flag', kind: 'flag', pts: 0, tip: { ja: '', en: '' } }, // 挑戦状の点数の手前に立つ旗（図鑑には入らない）
  kana:     { ja: 'あいことばの文字', en: 'Secret word letter', kind: 'kana', pts: 100, tip: { ja: '', en: '' } }, // かくれんぼ（B-49）：1回の走りに1枚まで（図鑑には入らない）
  memo:     { ja: '落とした書類', en: 'Dropped papers', kind: 'memo', pts: 150, tip: { ja: '', en: '' } }, // 拾うと相棒がお礼（図鑑には入らない）
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
  { id: 'hayRun', scope: 'run', stat: 'hay', f: l => 60 + 40 * l, t: n => ({ ja: `1回のランでチモシーを${n}本集める`, zh: `一次跑步收集${n}根牧草`, ko: `한 번에 건초 ${n}개 모으기`, en: `Collect ${n} hay in one run` }) },
  { id: 'distRun', scope: 'run', stat: 'dist', f: l => 400 + 250 * l, t: n => ({ ja: `1回のランで${n}m走る`, zh: `一次跑步跑${n}m`, ko: `한 번에 ${n}m 달리기`, en: `Run ${n} m in one run` }) },
  { id: 'jumpTot', scope: 'total', stat: 'jumps', f: l => 25 + 10 * l, t: n => ({ ja: `合計${n}回ジャンプする`, zh: `累計跳躍${n}次`, ko: `총 ${n}번 점프하기`, en: `Jump ${n} times in total` }) },
  { id: 'slideTot', scope: 'total', stat: 'slides', f: l => 20 + 8 * l, t: n => ({ ja: `合計${n}回スライディングする`, zh: `累計滑行${n}次`, ko: `총 ${n}번 슬라이딩하기`, en: `Slide ${n} times in total` }) },
  { id: 'treatTot', scope: 'total', stat: 'treats', f: l => 3 + 2 * l, t: n => ({ ja: `おやつ（果物）を合計${n}個食べる`, zh: `累計吃${n}個點心（水果）`, ko: `간식(과일) 총 ${n}개 먹기`, en: `Eat ${n} fruit treats in total` }) },
  { id: 'vegRun', scope: 'run', stat: 'veg', f: l => 4 + 2 * l, t: n => ({ ja: `1回のランで野菜を${n}個食べる`, zh: `一次跑步吃${n}個蔬菜`, ko: `한 번에 채소 ${n}개 먹기`, en: `Eat ${n} vegetables in one run` }) },
  { id: 'powTot', scope: 'total', stat: 'powers', f: l => 3 + 2 * l, t: n => ({ ja: `パワーアップを合計${n}回とる`, zh: `累計拿到${n}次強化道具`, ko: `파워업 총 ${n}번 얻기`, en: `Grab ${n} power-ups in total` }) },
  { id: 'turnRun', scope: 'run', stat: 'turns', f: l => 4 + 2 * l, t: n => ({ ja: `1回のランで曲がり角を${n}回曲がる`, zh: `一次跑步轉彎${n}次`, ko: `한 번에 모퉁이 ${n}번 돌기`, en: `Turn ${n} corners in one run` }) },
  { id: 'scoreRun', scope: 'run', stat: 'score', f: l => 3000 + 3500 * l, t: n => ({ ja: `1回のランで${fmt(n)}点とる`, zh: `一次跑步拿到${fmt(n)}分`, ko: `한 번에 ${fmt(n)}점 얻기`, en: `Score ${fmt(n)} in one run` }) },
  { id: 'feverTot', scope: 'total', stat: 'fevers', f: l => 1 + l, t: n => ({ ja: `もぐもぐフィーバーを合計${n}回起こす`, zh: `累計觸發${n}次嚼嚼狂熱`, ko: `냠냠 피버 총 ${n}번 일으키기`, en: `Trigger ${n} fevers in total` }) },
  { id: 'cleanRun', scope: 'run', stat: 'clean', f: l => 300 + 200 * l, t: n => ({ ja: `ぶつからずに${n}m走る`, zh: `不撞到任何東西跑${n}m`, ko: `부딪히지 않고 ${n}m 달리기`, en: `Run ${n} m without a bump` }) },
  { id: 'office', scope: 'run', stat: 'office', f: () => 1, t: () => ({ ja: '9:00までにオフィスに着く', en: 'Get to the office by 9:00' }) },
  { id: 'yamanote', scope: 'run', stat: 'yamanote', f: () => 1, t: () => ({ ja: '山手線に乗る（車内を走りぬける）', en: 'Ride the Yamanote Line' }) },
  { id: 'lookTot', scope: 'total', stat: 'looks', f: l => 3 + l * 2, t: n => ({ ja: `振り向いた顔を合計${n}回見る`, zh: `累計看到${n}次回頭的臉`, ko: `뒤돌아보는 얼굴 총 ${n}번 보기`, en: `Earn ${n} look-backs (dodge well and they glance at you)` }) },
  { id: 'flyTot', scope: 'total', stat: 'flights', f: l => 1 + l, t: n => ({ ja: `紙ひこうきで合計${n}回飛ぶ`, zh: `累計搭紙飛機飛${n}次`, ko: `종이비행기로 총 ${n}번 날기`, en: `Fly the paper plane ${n} times` }) },
  { id: 'chime', scope: 'run', stat: 'chime', f: () => 1, t: () => ({ ja: '18:00の定時チャイムまで走りきる', en: 'Make it to the 6 PM chime' }), min: 3 },
  { id: 'stampTot', scope: 'abs', stat: 'stamps', f: l => Math.min(14, 2 + l), t: n => ({ ja: `観光スタンプを${n}個集める`, zh: `收集${n}個觀光印章`, ko: `관광 스탬프 ${n}개 모으기`, en: `Collect ${n} Tokyo stamps` }), min: 2 },
  { id: 'zukanAll', scope: 'abs', stat: 'zukan', f: l => Math.min(21, 6 + l * 2), t: n => ({ ja: `えさ図鑑を${n}種類うめる`, zh: `填滿${n}種飼料圖鑑`, ko: `먹이 도감 ${n}종류 채우기`, en: `Fill in ${n} food book entries` }) },
];

/* ---- closet items: who, slot, price ---- */
const SLOT_DEF = { tie: 'gold', frame: 'brown', band: 'red' }; // what each slot goes back to when an item is taken off ('' = nothing)
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
  // the Legendary bunny's rewards (not for sale: unlocked when you reach the top rank; lg = legend stars needed)
  { id: 'hat_laurel_ren', who: 'ren', slot: 'hat', v: 'laurel', cost: 0, lg: 0, ja: '伝説の月桂冠', en: 'Legendary laurel' },
  { id: 'hat_laurel_jill', who: 'jill', slot: 'hat', v: 'laurel', cost: 0, lg: 0, ja: '伝説の月桂冠', en: 'Legendary laurel' },
  { id: 'hat_laurel_pom', who: 'pom', slot: 'hat', v: 'laurel', cost: 0, lg: 0, ja: '伝説の月桂冠', en: 'Legendary laurel' },
  { id: 'suit_royal_ren', who: 'ren', slot: 'suit', v: 'royal', cost: 0, lg: 0, ja: '伝説の金の礼服', en: 'Legendary gold coat' },
  { id: 'suit_royal_jill', who: 'jill', slot: 'suit', v: 'royal', cost: 0, lg: 0, ja: '伝説の金の礼服', en: 'Legendary gold coat' },
  { id: 'suit_royal_pom', who: 'pom', slot: 'suit', v: 'royal', cost: 0, lg: 0, ja: '伝説の金の礼服', en: 'Legendary gold coat' },
  // Pom (after you have met him): headband colours, hats in his size, a costume, and his own seasonal gifts
  { id: 'band_blue', who: 'pom', slot: 'band', v: 'blue', cost: 600, ja: '青いはちまき', en: 'Blue headband' },
  { id: 'band_green', who: 'pom', slot: 'band', v: 'green', cost: 600, ja: '緑のはちまき', en: 'Green headband' },
  { id: 'band_pink', who: 'pom', slot: 'band', v: 'pink', cost: 800, ja: 'ピンクのはちまき', en: 'Pink headband' },
  { id: 'band_gold', who: 'pom', slot: 'band', v: 'gold', cost: 1500, ja: '金のはちまき', en: 'Gold headband' },
  { id: 'hat_beret_pom', who: 'pom', slot: 'hat', v: 'beret', cost: 1200, ja: '赤いベレー帽', en: 'Red beret' },
  { id: 'hat_straw_pom', who: 'pom', slot: 'hat', v: 'straw', cost: 1500, ja: '麦わら帽子', en: 'Straw hat' },
  { id: 'hat_helmet_pom', who: 'pom', slot: 'hat', v: 'helmet', cost: 2000, ja: '現場のヘルメット', en: 'Hard hat' },
  { id: 'hat_santa_pom', who: 'pom', slot: 'hat', v: 'santa', cost: 2500, ja: 'サンタ帽', en: 'Santa hat' },
  { id: 'hat_crown_pom', who: 'pom', slot: 'hat', v: 'crown', cost: 6000, ja: '社長の王冠', en: "The president's crown" },
  { id: 'suit_bee_pom', who: 'pom', slot: 'suit', v: 'bee', cost: 3000, ja: 'ミツバチのコスプレ', en: 'Honeybee costume' },
  { id: 'hat_antler_pom', who: 'pom', slot: 'hat', v: 'antler', cost: 0, ev: 'xmas', ja: 'トナカイのカチューシャ（クリスマス限定）', en: 'Reindeer antlers (Christmas gift)' },
  { id: 'hat_kagami_pom', who: 'pom', slot: 'hat', v: 'kagami', cost: 0, ev: 'newyear', ja: '鏡もちの帽子（お正月限定）', en: 'Rice-cake cap (New Year gift)' },
  { id: 'hat_heart_pom', who: 'pom', slot: 'hat', v: 'heartband', cost: 0, ev: 'valentine', ja: 'ハートのカチューシャ（バレンタイン限定）', en: 'Heart headband (Valentine gift)' },
  { id: 'hat_sakura_pom', who: 'pom', slot: 'hat', v: 'sakura', cost: 0, ev: 'hanami', ja: '桜の髪かざり（お花見限定）', en: 'Cherry-blossom clip (spring gift)' },
  { id: 'hat_star_pom', who: 'pom', slot: 'hat', v: 'starband', cost: 0, ev: 'tanabata', ja: '星のはちまき（七夕限定）', en: 'Star headband (Tanabata gift)' },
  { id: 'hat_pumpkin_pom', who: 'pom', slot: 'hat', v: 'pumpkin', cost: 0, ev: 'halloween', ja: 'かぼちゃの帽子（ハロウィン限定）', en: 'Pumpkin cap (Halloween gift)' },
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
  // '#ev=<id>' forces an event only in the test build (screenshots, promo videos). Links from old posts (like '#halloween')
  // never bring an event back after it has ended: the public game always follows the date (feed → calendar).
  try { const m = /[#&]ev=([a-z]+)/.exec(location.hash); if (m && EV_KITS[m[1]] && !window.HAYDASH_APP && !(window.claude && window.claude.use)) return { id: m[1] }; } catch (e) { }
  try { let f = JSON.parse(localStorage.getItem('rjFeed') || 'null'); const inl = window.HAYDASH_EVENTS; if (inl && Array.isArray(inl.events) && !(f && Array.isArray(f.events) && (f.updated || '') > (inl.updated || ''))) f = inl; if (f && Array.isArray(f.events)) { const e = f.events.find(e => e && EV_KITS[e.id] && e.from <= iso && iso <= e.to); if (e) return e; if (f.eventsOnly) return {}; } } catch (e) { }
  const c = EV_CAL.find(([, a, b]) => a <= md && md <= b); return c ? { id: c[0], to: d.getFullYear() + '-' + c[2] } : {};
})();
const EVENT = EVENT_INFO.id || '';
/* ---- in Japanese mode the English labels give way to Japanese ones ---- */
const JA_LBL = { 'LUNCH?': 'お昼休み', 'WHICH WAY?': '分かれ道', 'JUMP': 'ジャンプ', 'SLIDE': 'スライディング', 'DODGE': 'よける', 'NEW TITLE!': '称号ゲット！', 'ALMOST!': 'もう少し！', 'DAILY CLEAR!': '今日のチャレンジ達成！', 'GOOD!': 'いいね！', 'FIRST-RUN BONUS!': '初回ボーナス！', 'KEEP GOING!': 'まだまだ！', 'LAST TRAIN': '終電', 'LUCKY!': 'ラッキー！',
  'MISSION CLEAR': 'ミッション達成', 'PHOTO': '記念写真', 'SAVED!': 'セーフ！', 'STAMP!': 'スタンプ！', 'BUMP!': 'ぶつかった！', 'MUNCH MUNCH FEVER!': 'もぐもぐフィーバー！', "IT'S 6 PM! FEVER": '定時！ フィーバー',
  'NEW BEST!': '自己ベスト！', '8:00 AM': '朝 8:00', '9:00 ON TIME!': '9:00 出社！', '← LEFT': '← 左へ', 'RIGHT →': '右へ →', 'FEVER!': 'フィーバー！', 'NICE JUMP!': 'ナイスジャンプ！', 'NICE SLIDE!': 'ナイススライド！',
  'CLOSE!': 'ギリギリ！', '← SWIPE →': '← スワイプ →', '↑ JUMP': '↑ ジャンプ', '↓ SLIDE': '↓ スライディング', 'TURN →': '右へ曲がる →', '← TURN': '← 左へ曲がる', '450 m!': '地上450m！', '150 m DECK!': '地上150m！',
  'GOAL': 'あそびかた', '♥ BUMPS': 'ぶつかったら', 'FEVER': 'もぐもぐフィーバー', 'TAP A FOOD': 'タップすると解説', 'BUNNY FOOD NOTE': 'うさぎごはんメモ', 'NG FOOD': 'あげちゃダメ', 'GO!': 'GO！', 'OOPS.': 'あっ。', 'PAUSE': 'ひと休み',
  'GOOD WORK!': 'おしごと完了！', 'SO CLOSE!': 'おしい！', 'THE PRESIDENT IS WATCHING!': '社長が見てる！', 'PHONE CALL: AN ERRAND!': 'おつかいの電話！', 'PAPERWORK RUSH!': '書類の山！', 'SNACK TIME!': '差し入れタイム！' };
function lab(en) {
  if (LANG === 'en' || !en) return en;
  if (LANG !== 'ja') { // Chinese / Korean: the same patterns as Japanese, or the Japanese label's translation
    if (JA_LBL[en] != null) return (I18N[LANG] || {})[JA_LBL[en]] ?? en;
    if (/[^\x00-\x7F]/.test(en)) return en; const zh = LANG === 'zh'; let m;
    if ((m = /^DAY (\d+)/.exec(en))) return zh ? `第${m[1]}天` : `${m[1]}일째`;
    if (/^NEXT: /.test(en)) return zh ? '下一站' : '다음 역';
    if (/^NO /.test(en)) return zh ? '不行！' : '안 돼!';
    if (/^\d[\d,]* COMBO$/.test(en)) return en.replace(' COMBO', zh ? ' 連擊' : ' 콤보');
    const ja = labJa(en); return ja ? ((I18N[LANG] || {})[ja] ?? en) : ja; }
  return labJa(en);
}
function labJa(en) {
  if (JA_LBL[en] != null) return JA_LBL[en];
  if (/[^\x00-\x7F]/.test(en)) return en; // already Japanese
  let m;
  if ((m = /^DAY (\d+)/.exec(en))) return `${m[1]}日目`;
  if (/^NEXT: /.test(en)) return '次の駅';
  if (/^NO /.test(en)) return 'ダメ！';
  if (/^\d[\d,]* COMBO$/.test(en)) return en.replace(' COMBO', 'コンボ');
  return ''; // other English labels are dropped; the Japanese line carries the message
}
