/* ================= building facades as textures =================
   Each building front is painted once into an offscreen canvas (windows, frames, balconies, signs, grime),
   with the wall itself left transparent so the building's own color shows through. The renderer then maps
   the texture onto the wall in perspective strips. This replaces hundreds of per-frame polygon fills with a
   handful of drawImage calls, and gives the fronts far more detail than the old per-quad painting. */
const FAC_P = 20; // texture pixels per world unit
const FAC_CACHE = new Map(); let FAC_N = 0, FAC_PX = 0;
const FAC_PHONE = navigator.maxTouchPoints >= 1 && Math.min(screen.width, screen.height) < 820, FAC_MAXN = FAC_PHONE ? 140 : 260, /* [R21] PC は絵を多めに持っておく（描き直しで絵が一瞬かわるのを減らす） */ FAC_MAXPX = FAC_PHONE ? 8e6 : 14e6; // phones run out of canvas memory first
const FAC_FONT = '"Zen Maru Gothic","Hiragino Sans","Noto Sans JP",sans-serif';
const SHOP_WORDS = ['ラーメン', 'カフェ', '書店', '薬局', 'パン', '食堂', '花屋', '寿司', '居酒屋', '雑貨', '珈琲', '天ぷら', '眼鏡', '古書', 'うどん', '定食', 'クリニック', '不動産', '時計', '文具'];
const MARKET_WORDS = ['鮮魚', '乾物', '果物', 'お菓子', '雑貨', '洋品', '海苔', '豆', 'お茶', '靴'];
const NEON_MOOD = {
  def: { words: SHOP_WORDS, marquee: ['24h', 'OPEN', 'SALE', 'カラオケ', '薬', 'ゲーム'], neon: ['#FF5C7A', '#5CD3FF', '#FFD24A', '#7CF08A', '#D08CFF', '#FF9A3C'], poster: [], ink: '#2B2B2B' },
  shibuya: { words: ['FASHION', 'STYLE', 'MUSIC', 'CAFE', 'SNEAKERS', 'ラーメン', 'カラオケ', 'TOKYO', 'CINEMA', 'RECORDS'], marquee: ['SALE', 'NEW', 'OPEN', 'LIVE', 'SHIBUYA', 'CINEMA'], neon: ['#FFFFFF', '#F2F2F2', '#FFD24A', '#5CD3FF', '#FF5C7A'], poster: [], ink: '#111' },
  akiba: { words: ['ゲーム', '電気', 'PC', 'ガチャ', 'フィギュア', 'メイドカフェ', 'アニメ', 'カード', 'パーツ', 'ジャンク'], marquee: ['SALE', '免税', 'OPEN', 'ゲーム', 'PC', 'DUTY FREE'], neon: ['#5CD3FF', '#FF9ACF', '#FFF07A', '#9CFF8A', '#C8A2FF'], poster: ['#F7C9E0', '#C9ECF7', '#FFF1B8', '#D5F5D0', '#E3D4FF'], ink: '#30254A' },
  kabuki: { words: ['カラオケ', 'バー', '居酒屋', 'スナック', 'カフェ', 'ラーメン', 'クラブ', '焼肉', 'ゲーム', 'サウナ'], marquee: ['24h', 'OPEN', 'BAR', 'KARAOKE', '居酒屋', '飲み放題'], neon: ['#FF3B6B', '#FF5CA8', '#FFC23B', '#FF7A3C', '#E04BFF', '#FFD24A'], poster: [], ink: '#2B1020' },
};
Object.assign(NEON_MOOD, {
  harajuku: { words: ['クレープ', 'CREPE', 'KAWAII', '古着', 'アクセサリー', 'パンケーキ', 'POP', 'わたあめ', 'プリクラ', 'SWEETS'], marquee: ['NEW', 'SALE', 'CREPE', 'OPEN', 'KAWAII'], neon: ['#FF9ACF', '#9AD8FF', '#FFE27A', '#B8F2A0', '#D7B4FF'], poster: ['#FFD6EA', '#D6F0FF', '#FFF3C2', '#E2FFD6', '#EBDDFF'], ink: '#5A2A4A' },
  korea: { words: ['韓国料理', 'サムギョプサル', 'チーズ', 'K-POP', 'コスメ', 'ホットク', 'チキン', 'カフェ', '韓国食品', 'トッポッキ'], marquee: ['OPEN', 'K-FOOD', 'COSME', 'NEW', '韓国'], neon: ['#FF5C7A', '#5CD3FF', '#FFD24A', '#FF9ACF', '#9CFF8A'], poster: ['#FFD6E0', '#D6F0FF', '#FFF3C2'], ink: '#2B2B2B' },
  ikebukuro: { words: ['ゲーム', 'カラオケ', 'ラーメン', 'アニメ', '書店', 'カフェ', '映画', '焼肉', '水族館', 'ボウリング'], marquee: ['24h', 'OPEN', 'GAME', 'SALE', 'CINEMA'], neon: ['#5CD3FF', '#FFD24A', '#FF5C7A', '#7CF08A', '#FF9A3C'], poster: [], ink: '#2B2B2B' },
  roppongi: { words: ['BAR', 'BISTRO', 'GALLERY', 'CAFE', 'CLUB', 'WINE', 'SUSHI', 'LOUNGE', 'MUSEUM', 'DINING'], marquee: ['OPEN', 'BAR', 'LIVE', 'DINING'], neon: ['#FFFFFF', '#FFD9A0', '#9AD8FF', '#FFB0C8'], poster: [], ink: '#111' },
  shinbashi: { words: ['焼き鳥', '居酒屋', 'もつ焼', '立ち飲み', 'そば', '定食', 'ラーメン', '大衆酒場', 'おでん', 'ハイボール'], marquee: ['飲み放題', 'OPEN', '生ビール', '焼き鳥', '24h'], neon: ['#FF5C3B', '#FFC23B', '#FF7A3C', '#FFFFFF'], poster: [], ink: '#2B1A12' },
});
const MARKET_MOOD = { tsukiji: ['鮮魚', '玉子焼', '海鮮丼', '乾物', '包丁', '寿司', 'かつお節', 'お茶', '海苔', '佃煮'], dougu: ['包丁', '食器', '調理道具', '漆器', '鍋', 'のれん', '提灯', 'ざる', '食品見本', '業務用'], yanaka: ['惣菜', 'コロッケ', '和菓子', '酒店', 'せんべい', '肉屋', '八百屋', '豆腐', '金物', '手ぬぐい'], monja: ['もんじゃ', 'お好み焼', '鉄板焼', 'もんじゃ', '甘味', '酒店'] };
const MACHIYA_WORDS = ['料亭', '甘味処', '蕎麦', '和菓子', '小料理', '茶房', '割烹', '鰻', 'おばんざい', '和雑貨'];
const BOOK_WORDS = ['古書', '古書店', '美術書', '文庫', '洋書', '和本', '古地図', '漫画', '映画書', '詩集'];
const NAKAMISE_WORDS = ['人形焼', 'せんべい', '雷おこし', '扇子', '甘味', '土産', '手ぬぐい', 'きびだんご', '浅草のり'];

// texture work per frame is capped so that a turn revealing a whole new street never freezes a frame:
// past the budget a missing front is drawn the simple way for a frame or two, and idle time paints ahead
let TEXB = 0, TEXN = 0;
function texOK() { return TEXN === 0 || performance.now() < TEXB; }
function facadeTex(st, variant, w, h, night, mood, soft) {
  const key = `${st}|${mood || ''}|${variant}|${w}|${h}|${night ? 1 : 0}`;
  const hit = FAC_CACHE.get(key); if (hit) { hit.n = ++FAC_N; return hit.c; }
  if (soft && !texOK()) return null; TEXN++;
  // a pixel budget (phones run out of canvas memory with many tall towers, and then new buildings draw blank)
  while (FAC_CACHE.size && (FAC_CACHE.size > FAC_MAXN || FAC_PX > FAC_MAXPX)) { let oldK = null, oldN = 1e18; for (const [k, v] of FAC_CACHE) if (v.n < oldN) { oldN = v.n; oldK = k; } const ev = FAC_CACHE.get(oldK); FAC_PX -= ev.px; FAC_CACHE.delete(oldK); try { ev.c.width = ev.c.height = 0; } catch (e) { } }
  const c = document.createElement('canvas'); const PW = Math.max(8, Math.round(w * FAC_P)), PH = Math.max(8, Math.round(h * FAC_P));
  const ks = Math.min(1, (FAC_PHONE ? 700 : 1000) / PH, (FAC_PHONE ? 320 : 460) / PW); /* [R5] PC では高いビルも細かく描く（近くでぼやけていた） */ c.width = Math.max(8, Math.round(PW * ks)); c.height = Math.max(8, Math.round(PH * ks)); // tall towers are painted at a lower resolution
  const g = c.getContext('2d') || noCtx(), r = rnd(variant * 131 + 7 + Math.round(w * 3) + Math.round(h * 5)); if (g === NOCTX) return null; g.scale(c.width / PW, c.height / PH);
  // the texture's y runs top-down, the wall's v runs bottom-up: flip so v=0 (street level) is at the bottom
  const paint = FAC_STYLE[st] || FAC_STYLE.mixed;
  paint(g, r, PW, PH, w, h, night, variant, mood || '');
  // weathering: a dark wash at the base, a lighter cap at the top, a faint vertical streak or two
  const gr = g.createLinearGradient(0, PH, 0, PH - 1.6 * FAC_P); gr.addColorStop(0, 'rgba(40,32,28,.22)'); gr.addColorStop(1, 'rgba(40,32,28,0)'); g.fillStyle = gr; g.fillRect(0, PH - 1.6 * FAC_P, PW, 1.6 * FAC_P);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, PW, 2);
  for (let i = 0; i < 2; i++) if (r() < .5) { const x = r() * PW; const sg = g.createLinearGradient(0, 0, 0, PH * .6); sg.addColorStop(0, 'rgba(30,30,30,.16)'); sg.addColorStop(1, 'rgba(30,30,30,0)'); g.fillStyle = sg; g.fillRect(x, 0, 2 + r() * 2, PH * .6); }
  facExtra(g, r, PW, PH, st, night, mood || '', w, h); facWear(g, r, PW, PH, st, night);
  const px = c.width * c.height; FAC_PX += px; FAC_CACHE.set(key, { c, n: ++FAC_N, px }); return c;
}
/* [T51〜] 建物の種類ごとの作り込み（描き終えた絵の上に足す） */
function facExtra(g, r, PW, PH, st, night, mood, w, h) {
  const fl = 3.2 * FAC_P, F = Math.floor(PH / fl);
  if (st === 'mixed' || st === 'neon') {
    if (F >= 3 && r() < .45) { const y = PH - 2 * fl, x = 10 + r() * Math.max(1, PW - 70); g.fillStyle = night ? 'rgba(255,240,200,.95)' : 'rgba(255,255,255,.9)'; g.font = `900 ${Math.round(fl * .18)}px ${FAC_FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; const t2 = ['2F 喫茶', '2F 理容', '2F 英会話', '2F 整骨院', '2F 雀荘', '2F 歯科'][(r() * 6) | 0]; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.35)'; g.strokeText(t2, x, y + fl * .5); g.fillText(t2, x, y + fl * .5); } // [T51] 2 階の窓に貼った店の文字
    if (F >= 2) { g.strokeStyle = 'rgba(80,84,90,.85)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 2); g.lineTo(PW, 2); for (let x = 4; x < PW; x += 9) { g.moveTo(x, 2); g.lineTo(x, 10); } g.stroke(); } // [T52] 屋上のフェンス
    if (r() < .3 && F >= 3) { const x = r() < .5 ? 2 : PW - 18; for (let y = PH - fl; y > fl; y -= fl) { g.fillStyle = 'rgba(220,224,228,.9)'; g.fillRect(x, y - 6, 16, 4); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, y - 2, 16, 2); } } // [T53] 外の非常階段の踊り場
    if (r() < .25 && F >= 3) { const x = 10 + r() * (PW - 20), y = PH - fl * (2 + ((r() * (F - 2)) | 0)) - 12; g.fillStyle = '#E3E5E7'; g.beginPath(); g.ellipse(x, y, 5, 6, -.4, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x - 1, y + 5, 2, 5); } // [T54] ベランダのアンテナの皿
    if (F >= 3 && r() < .5) { const y = 14; g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, y, PW, fl * .85); } } // [T55] いちばん上の階は、軒のかげで少し暗い
  if (st === 'neon' && night) { g.strokeStyle = 'rgba(255,240,200,.35)'; g.lineWidth = 1; g.strokeRect(1, 1, PW - 2, PH - fl - 2); // [T56] 夜：ビルのふちの小さな電球の線
    const sx = PW * (.15 + r() * .6); g.fillStyle = 'rgba(255,236,200,.85)'; g.fillRect(sx, PH - fl * 1.95, 14, fl * .95); g.fillStyle = 'rgba(0,0,0,.25)'; for (let k = 0; k < 6; k++) g.fillRect(sx, PH - fl * 1.95 + k * fl * .16, 14, 1.5); } // [T57] 2 階の店へ上がる、明るい階段の入口
  if (st === 'neon' && mood === 'shinbashi') { g.fillStyle = 'rgba(40,30,24,.9)'; g.fillRect(PW * .1, PH - fl * .62, 16, 22); g.fillStyle = '#FBF6EE'; for (let k = 0; k < 4; k++) g.fillRect(PW * .1 + 3, PH - fl * .62 + 4 + k * 4, 10, 1.4); } // [T58] 店先の手書きのお品書き
  if (st === 'luxury') { const x = PW * .5 - 14, y = PH - fl * 1.3 - 18; g.fillStyle = night ? '#E8C878' : '#B08A3E'; g.fillRect(x, y, 28, 10); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + 3, y + 4, 22, 1.4); } // [T59] 入口の上の金色の銘板（文字のない模様）
  if (st === 'glass') { const y = PH - fl; g.fillStyle = night ? 'rgba(255,236,190,.55)' : 'rgba(40,52,64,.35)'; g.fillRect(4, y + 4, PW - 8, fl - 8); g.fillStyle = night ? 'rgba(120,90,60,.6)' : 'rgba(20,24,30,.55)'; g.fillRect(PW * .4, PH - fl * .35, PW * .2, fl * .3); // [T60] 1 階のロビー：高い天井・受付のカウンター
    g.fillStyle = 'rgba(160,170,180,.9)'; g.fillRect(0, 0, PW, 6); g.fillStyle = 'rgba(0,0,0,.2)'; for (let x = 0; x < PW; x += 6) g.fillRect(x, 0, 2, 6); } // [T61] 屋上の機械をかくすルーバー
  if (st === 'machiya') { g.fillStyle = 'rgba(60,40,24,.85)'; for (let x = 6; x < PW - 6; x += 3) g.fillRect(x, PH - fl * .9, 1.2, fl * .62); // [T62] 1 階の細かい格子（千本格子）
    g.fillStyle = 'rgba(120,96,64,.9)'; g.beginPath(); for (let x = 2; x < PW; x += 6) { g.moveTo(x, PH); g.quadraticCurveTo(x + 3, PH - 16, x + 6, PH); } g.fill(); // [T63] 足もとの竹の犬矢来
    if (night) { g.fillStyle = 'rgba(255,214,140,.25)'; g.fillRect(6, PH - fl * .9, PW - 12, fl * .62); } } // [T64] 夜：格子の向こうの明かり
  if (st === 'market' || st === 'nakamise') { for (let x = 6; x < PW - 6; x += 9 + r() * 6) { g.fillStyle = ['#F2C230', '#FBF6EE', '#E86A75'][(r() * 3) | 0]; g.fillRect(x, PH - fl * .62, 6, 5); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 1, PH - fl * .62 + 2, 4, 1); } // [T65] 品物の値札
    g.fillStyle = 'rgba(150,150,154,.9)'; g.fillRect(0, PH - fl - 4, PW, 4); for (let x = 0; x < PW; x += 3) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x, PH - fl - 4, 1, 4); } } // [T66] 上げたシャッターの、たたまれた板の帯
  if (st === 'books') { for (let y = PH - fl * .8; y < PH - 8; y += 9) for (let x = 8; x < PW - 8; x += 3 + r() * 2) { g.fillStyle = ['#8A5530', '#C8463C', '#355F86', '#E9E2D5', '#5F9E5A', '#3B2A20'][(r() * 6) | 0]; g.globalAlpha = night ? .85 : .55; g.fillRect(x, y, 2.2, 7 + r() * 1.5); } g.globalAlpha = 1; } // [T67] 店の中の本だなの背表紙
  if (st === 'mixed' && F >= 3 && r() < .2) { const y = PH - fl * (2 + ((r() * Math.max(1, F - 2)) | 0)), x = 8 + r() * Math.max(1, PW - 60); g.fillStyle = 'rgba(251,246,238,.95)'; g.fillRect(x, y + fl * .3, 46, fl * .35); g.fillStyle = '#C8463C'; g.font = `900 ${Math.round(fl * .14)}px ${FAC_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('テナント募集', x + 23, y + fl * .48, 44); } // [T100] 空いた階の窓の「テナント募集」
  if (st === 'mixed' && F >= 4 && r() < .3) { const x = r() < .5 ? 6 : PW - 22, y = PH - fl * 3.6; g.fillStyle = 'rgba(255,255,255,.85)'; g.font = `900 ${Math.round(fl * .16)}px ${FAC_FONT}`; g.textAlign = 'center'; [...(['3F 歯科', '3F 塾', '3F 美容室'])[(r() * 3) | 0]].forEach((ch, i) => g.fillText(ch, x + 8, y + i * fl * .17)); } // [T101] 3 階の窓のたて書きの文字
  { g.fillStyle = 'rgba(40,40,44,.55)'; if (st === 'mixed' || st === 'neon') { g.fillRect(0, PH - fl, 4, fl); g.fillRect(PW - 4, PH - fl, 4, fl); } } // [T96] 1 階の両はしのタイル張りの柱
  if (st === 'glass' && !night) { for (let k = 0; k < 3; k++) { const x = 20 + r() * (PW - 40); g.fillStyle = 'rgba(20,24,30,.55)'; g.beginPath(); g.ellipse(x, PH - fl * .55, 2.5, 3, 0, 0, Math.PI * 2); g.fill(); g.fillRect(x - 3, PH - fl * .5, 6, fl * .45); } } // [T98] ロビーを歩く人のかげ
  if (st === 'neon' && !night) for (let k = 0; k < 2; k++) { const x = 6 + r() * (PW - 30), y = PH - fl * (1.3 + r() * .5); g.fillStyle = 'rgba(240,236,226,.75)'; g.fillRect(x, y, 16, 22); g.fillStyle = 'rgba(80,80,90,.5)'; for (let j = 0; j < 4; j++) g.fillRect(x + 2, y + 4 + j * 4, 12 - (j % 2) * 4, 1.3); } // [T99] 色あせた貼り紙
  if (st === 'glass' && night) for (let y = PH - fl; y > fl; y -= fl) if (r() < .25) { g.fillStyle = 'rgba(120,170,255,.25)'; g.fillRect(PW * r() * .6, y - fl * .7, PW * .3, fl * .4); } // [T102] 夜のオフィスの、画面の青い光
  if (st === 'house') for (let k = 0; k < 2; k++) if (r() < .5) { const x = PW * (.15 + k * .5), y = PH * .52; g.strokeStyle = 'rgba(150,150,145,.95)'; g.lineWidth = 1; g.beginPath(); for (let j = 0; j <= 5; j++) { g.moveTo(x + j * 4, y); g.lineTo(x + j * 4, y + 16); } g.moveTo(x, y); g.lineTo(x + 20, y); g.moveTo(x, y + 16); g.lineTo(x + 20, y + 16); g.stroke(); } // [T103] 小さな窓の面格子
  if (st === 'luxury' && !night) { const gy = PH - 3.4 * FAC_P * 1.3; const sh = g.createLinearGradient(0, gy, 0, gy + 18); sh.addColorStop(0, 'rgba(0,0,0,.25)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(0, gy, PW, 18); } // [T104] 日よけの下に落ちるかげ
  if (st === 'luxury' && !night) { g.fillStyle = 'rgba(255,250,230,.6)'; for (let x = 20; x < PW - 10; x += 28) { g.beginPath(); g.arc(x, PH - fl * 1.15, 1.6, 0, Math.PI * 2); g.fill(); } } // [T76] ショーウィンドウの天井のスポットライト
  if (st === 'neon' && !night) { g.strokeStyle = 'rgba(120,120,128,.35)'; g.lineWidth = 1; for (let k = 0; k < 2; k++) { const x = 10 + r() * (PW - 40), y = PH - fl * (1.5 + r() * 2); g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 8, y - 6, x + 16, y + 6, x + 24, y); g.stroke(); } } // [T77] 昼は消えているネオン管の形
  if (st === 'market' && night) { for (let x = 10; x < PW - 6; x += 18) { const y = PH - fl * .78; g.fillStyle = 'rgba(255,220,150,.35)'; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FFF2CC'; g.beginPath(); g.arc(x, y, 1.8, 0, Math.PI * 2); g.fill(); } } // [T78] 夜の市場の裸電球
  if (st === 'machiya' && PH > fl * 1.6) { g.fillStyle = 'rgba(60,40,24,.7)'; const y = PH - fl * 1.75; for (let x = 10; x < PW - 10; x += 4) g.fillRect(x, y, 1.6, fl * .4); } // [T80] 2 階のむしこ窓（たての細い格子）
  if (st === 'books') { for (let k = 0; k < 3; k++) { const x = 10 + r() * (PW - 24); g.fillStyle = 'rgba(251,246,238,.9)'; g.fillRect(x, PH - fl * .5, 9, 6); g.fillStyle = '#C8463C'; g.fillRect(x + 1.5, PH - fl * .5 + 2, 6, 1.2); } } // [T81] 手書きの値段の札
  if (st === 'mixed' && PW > 140 && F >= 3) { const x = r() < .5 ? PW * .08 : PW * .84; for (let y = PH - fl - fl * .6; y > fl * .3; y -= fl) { g.fillStyle = night ? 'rgba(220,235,245,.85)' : 'rgba(150,170,190,.8)'; g.fillRect(x, y, 9, fl * .3); g.strokeStyle = 'rgba(60,60,64,.8)'; g.strokeRect(x, y, 9, fl * .3); } } // [T84] 階段室のたての小窓の列
  if (st === 'mixed' && (r() < .3)) { g.strokeStyle = 'rgba(0,0,0,.06)'; g.lineWidth = .6; g.beginPath(); for (let y = 0; y < PH - fl; y += 4) { g.moveTo(0, y); g.lineTo(PW, y); } for (let x = 0; x < PW; x += 8) { g.moveTo(x, 0); g.lineTo(x, PH - fl); } g.stroke(); } // [T85] 小さなタイル張りの外壁
  if (st === 'house') { const ww = PW / Math.max(2, Math.round(w / 3)); for (let x = ww * .3; x < PW - 10; x += ww) { if (r() < .4) { g.fillStyle = 'rgba(150,150,145,.95)'; g.fillRect(x - 3, PH * .45, 4, PH * .2); g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = PH * .45; y < PH * .65; y += 3) g.fillRect(x - 3, y, 4, 1); } } // [T68] 雨戸の戸袋
    if (r() < .6) { g.fillStyle = '#E3E5E7'; g.fillRect(PW * (.6 + r() * .3), PH - 16, 11, 8); g.fillStyle = '#9AA0A6'; g.beginPath(); g.arc(PW * .7, PH - 12, 2.5, 0, Math.PI * 2); g.fill(); } // [T69] 家の横の室外機
    { const dx = PW * (.35 + r() * .3); g.fillStyle = 'rgba(110,80,56,.95)'; g.fillRect(dx, PH - fl * .78, 16, fl * .78); g.fillStyle = 'rgba(190,215,230,.7)'; g.fillRect(dx + 4, PH - fl * .7, 8, fl * .25); g.fillStyle = night ? '#FFE2A0' : '#E9E6DF'; g.fillRect(dx + 18, PH - fl * .7, 4, 5); if (night) { g.fillStyle = 'rgba(255,220,150,.25)'; g.beginPath(); g.arc(dx + 20, PH - fl * .68, 12, 0, Math.PI * 2); g.fill(); } } // [T82] 家の玄関：ガラスの入ったドアと、横の明かり
    if (r() < .5) { g.fillStyle = '#4F8A4A'; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(PW * .15 + k * 7, PH - 6, 4, 5, 0, 0, Math.PI * 2); g.fill(); } g.fillStyle = '#8A5530'; for (let k = 0; k < 3; k++) g.fillRect(PW * .15 + k * 7 - 3, PH - 4, 6, 4); } } // [T70] 玄関の鉢植え
}
/* [T34〜T45] どの建物にもかける「本物らしさ」の仕上げ（壁の材料・よごれ・光のたまり） */
function facWear(g, r, PW, PH, st, night) {
  const soft = st === 'glass' || st === 'nakamise' || st === 'market' || st === 'station';
  g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, 0, PW, 3); const ao = g.createLinearGradient(0, 0, 0, 14); ao.addColorStop(0, 'rgba(0,0,0,.16)'); ao.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = ao; g.fillRect(0, 3, PW, 14); // [T34] 屋上のふちの下にたまるかげ
  for (const [x0, dir] of [[0, 1], [PW, -1]]) { const e = g.createLinearGradient(x0, 0, x0 + dir * 10, 0); e.addColorStop(0, 'rgba(0,0,0,.14)'); e.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = e; g.fillRect(dir > 0 ? 0 : PW - 10, 0, 10, PH); } // [T35] 建物の角（となりとの境）の暗がり
  if (!soft) { g.globalAlpha = .07; for (let k = 0; k < 220; k++) { g.fillStyle = r() < .5 ? '#000000' : '#FFFFFF'; g.fillRect(r() * PW, r() * PH, 1 + r() * 2, 1 + r() * 2); } g.globalAlpha = 1; // [T36] 壁の材料のざらつき（吹きつけ・タイルのむら）
    if (r() < .5) { g.strokeStyle = 'rgba(0,0,0,.07)'; g.lineWidth = 1; g.beginPath(); for (let x = 36 + r() * 20; x < PW; x += 36 + r() * 30) { g.moveTo(x, 0); g.lineTo(x, PH); } g.stroke(); } // [T37] 外壁の板の目地（たて）
    for (let i = 0; i < 3; i++) if (r() < .45) { const x = r() * PW, y = r() * PH * .7, sg = g.createLinearGradient(0, y, 0, y + 60); sg.addColorStop(0, 'rgba(60,50,40,.14)'); sg.addColorStop(1, 'rgba(60,50,40,0)'); g.fillStyle = sg; g.fillRect(x, y, 1.5 + r() * 2.5, 60); } // [T38] 雨だれのすじ
    const sp = g.createLinearGradient(0, PH - 10, 0, PH); sp.addColorStop(0, 'rgba(60,50,40,0)'); sp.addColorStop(1, 'rgba(60,50,40,.25)'); g.fillStyle = sp; g.fillRect(0, PH - 10, PW, 10); // [T39] 地面からのはね返りのよごれ
    if (r() < .6) { const x = 6 + r() * (PW - 20), y = PH - 3.2 * FAC_P - 10; g.fillStyle = '#2F5579'; g.fillRect(x, y, 10, 5); g.fillStyle = '#FBF6EE'; g.fillRect(x + 1.5, y + 2, 7, 1); } // [T40] 番地の青い札
    if (r() < .55) { const x = r() < .5 ? 3 + r() * 6 : PW - 9 - r() * 6; g.fillStyle = 'rgba(120,124,128,.9)'; g.fillRect(x, 6, 3, PH - 6); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x, 6, 1, PH - 6); g.fillStyle = 'rgba(90,94,98,.9)'; for (let y = 30; y < PH; y += 60) g.fillRect(x - 1, y, 5, 2); } // [T41] たてどい（雨水の管）と留め金
    if (r() < .35 && PH > 140) { const x = 10 + r() * (PW - 30); g.fillStyle = 'rgba(200,60,50,.9)'; g.fillRect(x, PH - 3.2 * FAC_P - 26, 8, 8); g.fillStyle = '#FBF6EE'; g.fillRect(x + 2, PH - 3.2 * FAC_P - 23, 4, 2); } } // [T42] 消防の連結送水口の赤い札
  if (st === 'glass') { const fl = 3.2 * FAC_P; g.fillStyle = night ? 'rgba(20,24,32,.55)' : 'rgba(60,72,86,.35)'; for (let y = PH - fl; y > 0; y -= fl) g.fillRect(0, y - 5, PW, 5); // [T45] ガラスのビルの、各階の床のかくし板（スパンドレル）
    if (!night) { const d0 = g.createLinearGradient(0, 0, PW, PH); d0.addColorStop(0, 'rgba(255,255,255,.18)'); d0.addColorStop(.45, 'rgba(255,255,255,0)'); d0.addColorStop(.55, 'rgba(255,255,255,.12)'); d0.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = d0; g.fillRect(0, 0, PW, PH); // [T46] 空のうつりこみの、ななめの明るさ
      for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(255,255,255,.16)'; const cx = r() * PW, cy = r() * PH * .6, rw = 20 + r() * 40; g.beginPath(); g.ellipse(cx, cy, rw, rw * .35, 0, 0, Math.PI * 2); g.ellipse(cx + rw * .6, cy + 4, rw * .6, rw * .25, 0, 0, Math.PI * 2); g.fill(); } // [T47] 雲のうつりこみ
      g.fillStyle = 'rgba(40,50,62,.25)'; for (let k = 0; k < 2; k++) { const bw = 20 + r() * 40, bx = r() * PW; g.fillRect(bx, PH * (.35 + r() * .3), bw, PH); } } // [T48] 向かいのビルのうつりこみ
    else { g.fillStyle = 'rgba(255,240,200,.35)'; for (let y = PH - fl; y > 0; y -= fl) if (r() < .5) g.fillRect(0, y - fl + 6, PW, 1.5); } } // [T49] 夜：残業している階の天井の明かり
  if (st === 'mixed' && PH > 3.2 * FAC_P * 2.5 && r() < .55) { const nm = ['みどりビル', 'ひかりビル', 'あさひビル', 'さくらビル', '第二中村ビル', 'ことぶきビル', '大和ビル', '平和ビル'][(r() * 8) | 0], y = PH - 3.2 * FAC_P - 26, x = 8 + r() * Math.max(1, PW - 90);
    g.fillStyle = 'rgba(70,64,56,.9)'; g.fillRect(x, y, Math.min(80, PW - 16), 13); g.fillStyle = '#E9E2D5'; g.font = `700 10px ${FAC_FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(nm, x + 4, y + 7, Math.min(72, PW - 24)); } // [T50] ビルの名前の札（ありふれた名前）
  if (night) { const lg = g.createLinearGradient(0, PH, 0, PH - 3.2 * FAC_P * 1.6); lg.addColorStop(0, 'rgba(255,220,160,.22)'); lg.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = lg; g.fillRect(0, PH - 3.2 * FAC_P * 1.6, PW, 3.2 * FAC_P * 1.6); } // [T43] 夜：店の明かりが、壁の下の方を照らす
  else { const sk = g.createLinearGradient(0, 0, 0, PH * .4); sk.addColorStop(0, 'rgba(255,255,255,.07)'); sk.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sk; g.fillRect(0, 0, PW, PH * .4); } // [T44] 昼：上の方は空の光で少し明るい
}
/* shared pieces */
const FAC_GLASS = ['#6E8EA8', '#5E7C97', '#7F9FB8', '#8AA7BE'];
/* 2026-11-17 オーナー：「ビルやお店の景色が、壁紙に雑な絵」。窓・ベランダ・室外機・店先を、1 つずつ作り込む（番号は docs/CITY-200-2026-11-17.md の T） */
function winPane(g, r, x, y, w, h, night, o) {
  o = o || {};
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x - 1.5, y - 1.5, w + 3, h + 3); // [T1] 窓の穴の奥行き（壁の厚みのかげ）
  if (night) { const v = r(); if (v < .55) { const warm = r() < .75; g.fillStyle = warm ? `rgb(255,${225 + (r() * 20) | 0},${160 + (r() * 40) | 0})` : '#DCE8F2'; g.fillRect(x, y, w, h); // lit room
      g.fillStyle = warm ? 'rgba(255,255,240,.6)' : 'rgba(255,255,255,.7)'; g.fillRect(x + w * .15, y + 1, w * .7, 1.2); // [T2] 天井の明かりの線
      if (r() < .12) { g.fillStyle = (['rgba(255,150,170,.4)', 'rgba(150,230,170,.35)', 'rgba(170,190,255,.35)'])[(r() * 3) | 0]; g.fillRect(x, y, w, h); } // [T87] 色のついたカーテン越しの明かり
      g.fillStyle = 'rgba(60,40,30,.28)'; if (r() < .5) g.fillRect(x + w * .55, y, w * .45, h); if (r() < .4) g.fillRect(x, y + h * .7, w, h * .3); // 家具・カーテンのかげ
      if (r() < .25) { g.fillStyle = 'rgba(40,30,30,.45)'; g.beginPath(); g.ellipse(x + w * (.3 + r() * .4), y + h * .62, w * .07, h * .2, 0, 0, Math.PI * 2); g.fill(); } } // [T3] 部屋の中の人かげ
    else { g.fillStyle = v < .8 ? '#2A3548' : '#1B2333'; g.fillRect(x, y, w, h); if (r() < .12) { g.fillStyle = 'rgba(120,170,255,.35)'; g.fillRect(x + w * .2, y + h * .4, w * .3, h * .35); } } } // [T4] 暗い部屋に、テレビの青い光
  else { // daytime: sky reflected in the upper part, the dark room below
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, o.sky || '#9FBBD2'); gr.addColorStop(.55, FAC_GLASS[(r() * 4) | 0]); gr.addColorStop(1, '#3E5468'); g.fillStyle = gr; g.fillRect(x, y, w, h);
    if (r() < .5) { g.fillStyle = 'rgba(70,85,100,.35)'; const bw = w * (.2 + r() * .3); g.fillRect(x + r() * (w - bw), y + h * (.15 + r() * .2), bw, h); } // [T5] ガラスにうつる向かいのビル
    const ins = r(); if (ins < .22) { g.fillStyle = 'rgba(245,242,232,.92)'; for (let k = 0; k < h * .55; k += 2) g.fillRect(x + 1, y + 1 + k, w - 2, 1.4); } // [T6] ブラインド（羽根の筋）
    else if (ins < .45) { const cc = (['rgba(240,232,214,.85)', 'rgba(214,226,236,.85)', 'rgba(232,214,214,.8)'])[(r() * 9 | 0) % ['rgba(240,232,214,.85)', 'rgba(214,226,236,.85)', 'rgba(232,214,214,.8)'].length]; g.fillStyle = cc; const cw = w * (.22 + r() * .12); g.fillRect(x, y, cw, h); g.fillRect(x + w - cw, y, cw, h); g.fillStyle = 'rgba(0,0,0,.08)'; for (let k = 2; k < cw; k += 3) { g.fillRect(x + k, y, 1, h); g.fillRect(x + w - cw + k, y, 1, h); } } // [T7] 両わきのカーテンとひだ
    else if (ins < .55) { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + w / 2, y, w / 2, h); } // [T8] 半分だけ網戸
    else if (ins < .6) { g.fillStyle = 'rgba(20,24,30,.8)'; g.fillRect(x + w * .5, y, w * .5, h); } // [T88] 少しあけた窓（奥が暗い）
    g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.moveTo(x + w * .1, y + h); g.lineTo(x + w * .35, y); g.lineTo(x + w * .45, y); g.lineTo(x + w * .2, y + h); g.fill(); // [T9] ななめの光の映りこみ
    if (r() < .1) { g.fillStyle = '#5F9E5A'; g.beginPath(); g.ellipse(x + w * .2, y + h - 3, 3, 3, 0, 0, Math.PI * 2); g.fill(); } } // [T10] 窓辺の鉢植え
  const fc = o.frame || (['rgba(60,60,64,.9)', 'rgba(170,176,182,.95)', 'rgba(110,98,86,.9)'])[(r() * 9 | 0) % ['rgba(60,60,64,.9)', 'rgba(170,176,182,.95)', 'rgba(110,98,86,.9)'].length]; g.fillStyle = fc; g.lineWidth = 1.2; g.strokeStyle = fc; g.strokeRect(x + .5, y + .5, w - 1, h - 1); // [T11] 窓枠の色（黒・銀・茶）
  if (!o.noMullion && w > 14) { g.fillRect(x + w / 2 - .6, y, 1.2, h); }
  if (h > 26 && !o.noMullion) g.fillRect(x, y + h * .28, w, 1); // [T12] 背の高い窓は、上に欄間の横枠
  g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x, y, w, 1.5); // the lintel's shadow
  g.fillStyle = 'rgba(235,232,224,.9)'; g.fillRect(x - 2, y + h, w + 4, 1.6); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x - 2, y + h + 1.6, w + 4, 1.4); // [T13] 窓台（白い水切り）とその下のかげ
  g.fillStyle = 'rgba(70,60,50,.12)'; g.fillRect(x, y + h + 3, 2, 6); g.fillRect(x + w - 2, y + h + 3, 2, 5); // [T14] 窓台のはしから垂れた雨のしみ
}
function balcony(g, r, x, y, w, night) { // railing in front of a floor
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x, y, w, 3);
  const kind = r(); // [T15] 手すりは 3 種類：たて格子・すりガラスの板・コンクリートの腰壁
  if (kind < .4) { g.fillStyle = 'rgba(235,235,230,.85)'; g.fillRect(x, y - 16, w, 2); for (let k = 0; k < w; k += 4) g.fillRect(x + k, y - 16, 1, 16); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x, y - 16, w, 16); }
  else if (kind < .7) { g.fillStyle = 'rgba(200,214,224,.55)'; g.fillRect(x, y - 16, w, 15); g.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < w; k += 22) g.fillRect(x + k, y - 16, 1.2, 15); g.fillStyle = 'rgba(160,166,172,.95)'; g.fillRect(x, y - 17, w, 2); }
  else { g.fillStyle = 'rgba(205,200,190,.95)'; g.fillRect(x, y - 16, w, 15); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(x, y - 3, w, 2); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x, y - 16, w, 1.2); }
  g.fillStyle = 'rgba(0,0,0,.2)'; for (let k = 0; k < w; k += 30) g.fillRect(x + k, y - 17, 1.5, 17); // [T16] 部屋ごとの仕切り板の線
  if (r() < .5) { const lx = x + w * .1 + r() * w * .5; g.strokeStyle = 'rgba(140,140,140,.8)'; g.lineWidth = .8; g.beginPath(); g.moveTo(lx - 2, y - 22); g.lineTo(lx + 24, y - 22); g.stroke(); for (let k = 0; k < 4; k++) { g.fillStyle = ['#E9EDF0', '#C8D2DA', '#F4CFD8', '#D7EFD0', '#355F86'][(r() * 5) | 0]; g.fillRect(lx + k * 6, y - 22, 5, 8 + r() * 4); } } // [T17] 物干しざおと洗たく物
  if (r() < .35) { g.fillStyle = '#5F9E5A'; g.beginPath(); g.ellipse(x + w * (.7 + r() * .2), y - 19, 4, 4, 0, 0, Math.PI * 2); g.fill(); } // [T18] ベランダの植木
}
function acUnit(g, x, y) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + 1, y + 7, 10, 2.5); g.fillStyle = '#E3E5E7'; g.fillRect(x, y, 10, 7); g.fillStyle = '#9AA0A6'; g.beginPath(); g.arc(x + 4, y + 3.5, 2.6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C9CDD1'; g.fillRect(x + 7.5, y + 1, 1.8, 5); g.strokeStyle = 'rgba(120,120,120,.6)'; g.lineWidth = .6; g.beginPath(); g.moveTo(x + 10, y + 2); g.quadraticCurveTo(x + 13, y + 2, x + 13, y - 6); g.stroke(); } // [T19] 室外機：丸いファン・横の格子・下のかげ・壁へ上がる配管
function slabLine(g, PW, y) { g.fillStyle = 'rgba(0,0,0,.13)'; g.fillRect(0, y, PW, 2); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, y - 1, PW, 1); g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(0, y + 2, PW, 5); } // [T20] 床の帯の下に、雨だれのうすいよごれ
function signText(g, txt, x, y, w, h, color, bg) {
  if (bg) { g.fillStyle = bg; g.fillRect(x, y, w, h); }
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  let sz = Math.min(h * .72, 22); g.font = `900 ${sz}px ${FAC_FONT}`; const tw = g.measureText(txt).width; if (tw > w * .92) { sz *= w * .92 / tw; g.font = `900 ${sz}px ${FAC_FONT}`; }
  g.fillText(txt, x + w / 2, y + h / 2 + 1); g.restore();
}
function neonSign(g, r, x, y, w, h, night, txt, vertical, pal) {
  pal = pal || ['#FF5C7A', '#5CD3FF', '#FFD24A', '#7CF08A', '#D08CFF', '#FF9A3C']; const col = pal[(r() * pal.length) | 0];
  g.fillStyle = night ? col : 'rgba(255,255,255,.92)'; g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(0,0,0,.35)'; g.strokeRect(x + .5, y + .5, w - 1, h - 1);
  if (night) { g.save(); g.shadowColor = col; g.shadowBlur = 10; g.fillStyle = col; g.fillRect(x, y, w, h); g.restore(); }
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = night ? '#1A1020' : col; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (vertical) { const chars = [...txt], n = chars.length, sz = Math.min(w * .78, h / n * .8); g.font = `900 ${sz}px ${FAC_FONT}`; chars.forEach((ch, i) => g.fillText(ch, x + w / 2, y + (i + .5) * h / n)); }
  else { let sz = Math.min(h * .7, 20); g.font = `900 ${sz}px ${FAC_FONT}`; const tw = g.measureText(txt).width; if (tw > w * .9) { sz *= w * .9 / tw; g.font = `900 ${sz}px ${FAC_FONT}`; } g.fillText(txt, x + w / 2, y + h / 2 + 1); }
  g.restore();
}
function shopFront(g, r, PW, y0, y1, night, words, awningCols) { // y0 = top of ground floor, y1 = street level
  const H = y1 - y0, glassTop = y0 + H * .3, awnH = H * .12, gb = y1 - 3;
  r(); const shut = night && r() > .93 && words === SHOP_WORDS; /* 1 回目の数は種が小さいと必ず小さくなるので捨てる */ // [T93] 夜おそく、シャッターをおろした店もある
  // [T21] 店の中：奥の壁・天井の明かり・たな・カウンター・人（夜は明るく、昼は暗くて少しだけ見える）
  g.fillStyle = night ? (r() < .5 ? '#FFF0CC' : '#EEF6FF') : '#2E3A46'; g.fillRect(4, glassTop, PW - 8, gb - glassTop); // [T94] 店の明かりの色（あたたかい色・白い色）
  g.fillStyle = night ? 'rgba(255,255,255,.75)' : 'rgba(230,236,240,.35)'; for (let x = 14; x < PW - 14; x += 26) g.fillRect(x, glassTop + 3, 14, 1.6); // [T22] 天井の明かりの列
  const shelfC = night ? 'rgba(120,90,60,.5)' : 'rgba(150,160,170,.35)'; for (let k = 1; k <= 3; k++) { const yy = glassTop + (gb - glassTop) * (.2 + k * .17); g.fillStyle = shelfC; g.fillRect(8, yy, PW - 16, 1.4); // [T23] 奥のたなの段
    for (let x = 10; x < PW - 12; x += 3 + r() * 3) { g.fillStyle = ['#E86A75', '#F2C230', '#4E77A0', '#5F9E5A', '#F08A2E', '#FBF6EE', '#9C7BD0'][(r() * 7) | 0]; g.globalAlpha = night ? .85 : .4; g.fillRect(x, yy - 3 - r() * 2, 2.2, 3 + r() * 2); } } g.globalAlpha = 1; // [T24] たなの上の品物
  g.fillStyle = night ? 'rgba(140,100,70,.55)' : 'rgba(30,36,44,.6)'; g.fillRect(PW * (.55 + r() * .2), gb - (gb - glassTop) * .3, PW * .2, (gb - glassTop) * .3); // [T25] カウンター
  for (let k = 0; k < 1 + r() * 2; k++) { const px = 12 + r() * (PW - 30), ph = (gb - glassTop) * (.45 + r() * .1); g.fillStyle = night ? 'rgba(60,40,40,.55)' : 'rgba(20,24,30,.55)'; g.beginPath(); g.ellipse(px, gb - ph, 2.6, 3, 0, 0, Math.PI * 2); g.fill(); g.fillRect(px - 3.2, gb - ph + 2.5, 6.4, ph - 2.5); } // [T26] 店の中のお客さん
  if (!night) { const gr = g.createLinearGradient(0, glassTop, 0, gb); gr.addColorStop(0, 'rgba(170,200,225,.7)'); gr.addColorStop(.55, 'rgba(120,150,175,.28)'); gr.addColorStop(1, 'rgba(40,50,60,0)'); g.fillStyle = gr; g.fillRect(4, glassTop, PW - 8, gb - glassTop);
    g.fillStyle = 'rgba(255,255,255,.16)'; for (let x = 10; x < PW; x += 60) { g.beginPath(); g.moveTo(x, gb); g.lineTo(x + 18, glassTop); g.lineTo(x + 30, glassTop); g.lineTo(x + 12, gb); g.fill(); } } // [T27] ガラスの反射（空・ななめの光）
  // [T28] 入口：自動ドア 2 枚（まん中の合わせ目・取っ手）・足もとのマット
  const dx = PW * (.25 + r() * .5); g.fillStyle = 'rgba(30,30,36,.85)'; g.fillRect(dx - 11, glassTop + 2, 22, gb - glassTop - 2); g.fillStyle = night ? 'rgba(255,240,200,.75)' : 'rgba(120,150,175,.5)'; g.fillRect(dx - 9.5, glassTop + 4, 8.8, gb - glassTop - 8); g.fillRect(dx + .7, glassTop + 4, 8.8, gb - glassTop - 8);
  g.fillStyle = 'rgba(200,200,200,.9)'; g.fillRect(dx - 2.4, glassTop + (gb - glassTop) * .45, 1.2, 6); g.fillRect(dx + 1.2, glassTop + (gb - glassTop) * .45, 1.2, 6);
  g.fillStyle = 'rgba(40,40,44,.75)'; g.fillRect(dx - 12, gb - 1.5, 24, 2.5); g.fillStyle = '#F2C230'; g.fillRect(dx - 8, glassTop + (gb - glassTop) * .55, 4, 2); // ドアの注意のシール
  // [T29] 窓に貼った紙（営業時間・セール・メニュー）
  if (r() < .7) { const px = dx + (r() < .5 ? -1 : 1) * (22 + r() * 20); if (px > 8 && px < PW - 20) { g.fillStyle = 'rgba(251,246,238,.92)'; g.fillRect(px, glassTop + (gb - glassTop) * .35, 11, 14); g.fillStyle = (['#C8463C', '#355F86', '#3B2A20'])[(r() * 9 | 0) % ['#C8463C', '#355F86', '#3B2A20'].length]; for (let k = 0; k < 4; k++) g.fillRect(px + 2, glassTop + (gb - glassTop) * .35 + 3 + k * 2.5, 7 - (k % 2) * 2, 1); } }
  // frame & mullions
  g.fillStyle = 'rgba(40,40,44,.9)'; g.strokeStyle = 'rgba(40,40,44,.9)'; g.lineWidth = 2; g.strokeRect(4, glassTop, PW - 8, gb - glassTop); for (let x = 4 + 30; x < PW - 8; x += 30) if (Math.abs(x - dx) > 13) g.fillRect(x, glassTop, 1.5, gb - glassTop);
  g.fillStyle = 'rgba(110,110,114,.95)'; g.fillRect(4, gb - 4, PW - 8, 4); // [T30] ガラスの下の腰（金属のけこみ）
  // awning with sign
  const col = awningCols[(r() * awningCols.length) | 0];
  g.fillStyle = col; g.fillRect(0, glassTop - awnH, PW, awnH); g.fillStyle = 'rgba(255,255,255,.18)'; for (let x = 0; x < PW; x += 14) g.fillRect(x, glassTop - awnH, 7, awnH);
  g.fillStyle = 'rgba(0,0,0,.18)'; for (let x = 0; x < PW; x += 7) { g.beginPath(); g.arc(x + 3.5, glassTop, 3.5, 0, Math.PI); g.fill(); } // [T31] テントのすその波形
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, glassTop - 2, PW, 3);
  // [T32] 看板：枠・文字・小さなロゴの丸・夜は箱の中から光る
  const word = words[(r() * words.length) | 0], sy0 = y0 + 2, sh = glassTop - awnH - y0 - 4, bgC = night ? 'rgba(255,250,235,.95)' : (['rgba(255,255,255,.88)', 'rgba(251,246,238,.92)', 'rgba(43,43,43,.9)', 'rgba(53,95,134,.9)'])[(r() * 9 | 0) % ['rgba(255,255,255,.88)', 'rgba(251,246,238,.92)', 'rgba(43,43,43,.9)', 'rgba(53,95,134,.9)'].length], ink = /43,43,43|53,95,134/.test(bgC) ? '#FBF6EE' : '#2B2B2B';
  g.fillStyle = 'rgba(60,60,64,.9)'; g.fillRect(4, sy0 - 1, PW - 8, sh + 2); g.fillStyle = bgC; g.fillRect(6, sy0, PW - 12, sh);
  if (night) { g.save(); g.shadowColor = 'rgba(255,230,170,.9)'; g.shadowBlur = 8; g.fillStyle = 'rgba(255,240,200,.25)'; g.fillRect(6, sy0, PW - 12, sh); g.restore(); }
  { const c = (['#C8463C', '#F2C230', '#5F9E5A', '#4E77A0'])[(r() * 9 | 0) % ['#C8463C', '#F2C230', '#5F9E5A', '#4E77A0'].length]; g.fillStyle = c; g.beginPath(); g.arc(14, sy0 + sh / 2, Math.min(5, sh * .32), 0, Math.PI * 2); g.fill(); }
  signText(g, word, 22, sy0, PW - 34, sh, night ? '#2B2B2B' : ink, null);
  if (night) { g.fillStyle = 'rgba(255,230,170,.35)'; g.fillRect(0, glassTop - awnH - 2, PW, 2); }
  if (shut) { g.fillStyle = '#9AA0A6'; g.fillRect(4, glassTop, PW - 8, gb - glassTop); g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = glassTop; y < gb; y += 3) g.fillRect(4, y, PW - 8, 1); g.fillStyle = 'rgba(40,40,44,.5)'; g.fillRect(PW * .45, gb - 6, PW * .1, 2); }
  if (!night && sh > 14) { g.fillStyle = ink === '#FBF6EE' ? 'rgba(251,246,238,.7)' : 'rgba(43,43,43,.55)'; g.fillRect(PW * .35, sy0 + sh - 4, PW * .3, 1.4); } // [T95] 看板の下の小さな文字の行
  // step / curb
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y1 - 3, PW, 3); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(0, y1 - 3, PW, .8); // [T33] 入口の段のふち
}

const FAC_STYLE = {
  // the ordinary Tokyo mixed-use building: a shop below, offices or flats above, balconies, AC units, pipes
  mixed(g, r, PW, PH, w, h, night, variant) {
    const fl = 3.2 * FAC_P, floors = Math.max(1, Math.floor(h / 3.2));
    shopFront(g, r, PW, PH - fl, PH, night, SHOP_WORDS, ['#C8463C', '#355F86', '#5F9E5A', '#F2C230', '#3B2A20', '#8A5530']);
    const flat = r() < .5, cols = Math.max(1, Math.round(w / 2.6));
    for (let k = 1; k < floors; k++) {
      const yb = PH - k * fl, yt = yb - fl; slabLine(g, PW, yt + 2);
      const ww = (PW - 10) / cols;
      for (let i = 0; i < cols; i++) { const x = 5 + i * ww; winPane(g, r, x + ww * .14, yt + fl * .25, ww * .72, fl * .5, night); }
      if (flat) balcony(g, r, 3, yb - 4, PW - 6, night); else if (r() < .45) acUnit(g, 4 + r() * (PW - 20), yb - 12);
    }
    // a drain pipe down one side
    const px = r() < .5 ? 2 : PW - 5; g.fillStyle = 'rgba(70,70,75,.75)'; g.fillRect(px, 0, 3, PH); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(px, 0, 1, PH);
    // parapet
    g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(0, 0, PW, 6); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, 6, PW, 2);
  },
  // the same bones, plus vertical neon signs and screens
  neon(g, r, PW, PH, w, h, night, variant, mood) {
    const M = NEON_MOOD[mood] || NEON_MOOD.def;
    FAC_STYLE.mixed(g, r, PW, PH, w, h, night, variant, mood);
    const fl = 3.2 * FAC_P;
    /* 2026-11-17 景色 149〜152：繁華街の雑居ビル */
    if (PH > fl * 2.2 && w >= 4) { const tx = r() < .5 ? PW - 30 : 4, floorsN = Math.floor((PH - fl) / fl), cols = M.neon || ['#FF5C7A', '#5CD3FF', '#FFD24A'];
      g.fillStyle = 'rgba(30,30,34,.85)'; g.fillRect(tx - 2, PH - fl - floorsN * fl * .55 - 4, 30, floorsN * fl * .55 + 4);
      for (let k = 0; k < floorsN; k++) { const y = PH - fl - (k + 1) * fl * .55, col = cols[(r() * cols.length) | 0]; g.fillStyle = night ? col : '#F4F2EC'; g.fillRect(tx, y + 2, 26, fl * .55 - 4);
        if (night) { g.save(); g.shadowColor = col; g.shadowBlur = 8; g.fillRect(tx, y + 2, 26, fl * .55 - 4); g.restore(); } // [150] 夜：看板のまわりのにじんだ光
        g.fillStyle = night ? '#1A1020' : col; g.font = `900 ${Math.round(fl * .2)}px ${FAC_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText((k + 2) + 'F', tx + 7, y + fl * .27, 12); g.fillText([...M.words[(r() * M.words.length) | 0]].slice(0, 2).join(''), tx + 19, y + fl * .27, 13); } } // [149] 各階の店の看板が、たてにならぶ
    if (variant % 3 === 1 && PH > fl * 2) { const ex = r() < .5 ? 0 : PW - 22; g.strokeStyle = night ? 'rgba(150,150,160,.7)' : 'rgba(70,72,78,.9)'; g.lineWidth = 2; for (let y = PH - fl; y > 10; y -= fl) { g.strokeRect(ex + 1, y - fl, 20, fl); g.beginPath(); g.moveTo(ex + 1, y); g.lineTo(ex + 21, y - fl * .5); g.stroke(); } } // [151] 外の非常階段の鉄の骨組み
    { const gx = r() < .5 ? 0 : PW - 5; const gr = g.createLinearGradient(gx, 0, gx + 5, 0); gr.addColorStop(0, 'rgba(0,0,0,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(gx, 0, 5, PH); } // [152] となりのビルとのすき間の暗がり
    if (mood === 'akiba' && PH > fl * 2.5 && r() < .8) { // a full-height poster panel in pastel colors with bold generic kana
      const pw = Math.min(PW - 8, 34 + r() * 40), px = r() < .5 ? 4 : PW - pw - 4, py = 8, ph = PH - fl - 16;
      const col = M.poster[(r() * M.poster.length) | 0]; g.fillStyle = col; g.fillRect(px, py, pw, ph); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(px + 4, py + 4, pw - 8, ph * .35);
      g.fillStyle = M.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; const word = M.words[(r() * M.words.length) | 0], chars = [...word], sz = Math.min(pw * .7, ph * .5 / chars.length); g.font = `900 ${sz}px ${FAC_FONT}`;
      chars.forEach((ch, i) => g.fillText(ch, px + pw / 2, py + ph * .45 + (i - (chars.length - 1) / 2) * sz * 1.05));
      g.strokeStyle = 'rgba(0,0,0,.3)'; g.strokeRect(px + .5, py + .5, pw - 1, ph - 1); }
    if (w >= 4) { const sw = Math.min(26, PW * .3), sh = Math.min(PH - fl - 12, fl * (2 + (r() * 3) | 0)), sx = r() < .5 ? 2 : PW - sw - 2, sy = Math.max(4, PH - fl - sh - 8);
      neonSign(g, r, sx, sy, sw, sh, night, M.words[(r() * M.words.length) | 0], true, M.neon); }
    if (r() < (mood === 'kabuki' ? .9 : .5)) { const bh = fl * .5, by = PH - fl - bh - 2; neonSign(g, r, PW * .2, by, PW * .6, bh, night, M.marquee[(r() * M.marquee.length) | 0], false, M.neon); }
    if (mood === 'kabuki' && night) { g.fillStyle = 'rgba(255,60,120,.18)'; g.fillRect(0, PH - fl, PW, fl); } // pink spill of the ground floor
  },
  // Ginza: stone-clad fronts with large showcase windows, bronze trim and a glowing ground floor
  luxury(g, r, PW, PH, w, h, night, variant) { /* 2026-11-17 景色 136〜148：銀座・表参道の高級な店のビル（前は、ガラスの窓がならぶだけで、オフィスと見分けがつかなかった） */
    const P = FAC_P, fl = 3.4 * P, kind = variant % 3, y0 = PH - fl * 1.3, k0 = night ? .45 : 1;
    const stone = ['#E3D8C4', '#F1EEE8', '#B9B4AC'][kind], sh = (c, m) => shadeHex(c, m * k0);
    g.fillStyle = sh(stone, 1); g.fillRect(0, 0, PW, PH); for (let y = 0; y < y0; y += .6 * P) { g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(0, y, PW, 1); for (let x = ((y / (.6 * P)) % 2) * .6 * P; x < PW; x += 1.2 * P) g.fillRect(x, y, 1, .6 * P); } // [136] 石張りの壁と目地
    if (night) { const gr = g.createLinearGradient(0, y0, 0, y0 - 3 * fl); gr.addColorStop(0, 'rgba(255,214,150,.45)'); gr.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = gr; g.fillRect(0, y0 - 3 * fl, PW, 3 * fl); } // [146] 夜：壁を下から照らす
    if (kind === 2) { const gb = g.createLinearGradient(0, 0, 0, y0); gb.addColorStop(0, night ? '#3A3A48' : '#9FB6C8'); gb.addColorStop(1, night ? '#5A4A3A' : '#56687A'); g.fillStyle = gb; g.fillRect(0, fl * .4, PW, y0 - fl * .6); if (night) for (let y = fl * .6; y < y0 - fl * .3; y += fl) { g.fillStyle = 'rgba(255,225,170,.45)'; g.fillRect(0, y, PW, fl * .5); } g.fillStyle = night ? 'rgba(230,230,235,.35)' : 'rgba(250,250,252,.85)'; for (let x = 4; x < PW; x += 9) g.fillRect(x, fl * .4, 3, y0 - fl * .6); for (let y = fl * .4; y < y0 - fl * .2; y += fl) g.fillRect(0, y, PW, 3); } // [143] 金属の格子の外装（白いルーバー）
    else { const cols = Math.max(1, Math.round(w / 2.6)), ww = PW / cols; for (let y = y0 - fl; y > -fl * .5; y -= fl) for (let c = 0; c < cols; c++) { const x = c * ww + ww * .2, wx = ww * .6, wy = fl * .66, yy = y + fl * .18;
        g.fillStyle = sh(stone, .82); g.fillRect(x - 5, yy - 6, wx + 10, wy + 12); g.fillStyle = sh(stone, 1.08); g.fillRect(x - 5, yy - 6, wx + 10, 3); // [142] 石の窓わく
        if (night) { g.fillStyle = r() < .5 ? '#F3D9A8' : '#2A2C38'; g.fillRect(x, yy, wx, wy); g.fillStyle = 'rgba(255,255,255,.25)'; for (let xx = x + 2; xx < x + wx; xx += 4) g.fillRect(xx, yy, 1.5, wy); } // [147] 夜：カーテン越しの光
        else { const gr = g.createLinearGradient(0, yy, 0, yy + wy); gr.addColorStop(0, '#BCD0E0'); gr.addColorStop(1, '#4A5A6A'); g.fillStyle = gr; g.fillRect(x, yy, wx, wy); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + wx * .1, yy, wx * .15, wy); }
        g.fillStyle = sh('#3A3632', 1); g.fillRect(x - 3, yy + wy - 8, wx + 6, 2); for (let xx = x; xx < x + wx; xx += 5) g.fillRect(xx, yy + wy - 8, 1.5, 10); } } // [142] 小さなバルコニーの鉄の手すり
    g.fillStyle = sh(stone, .7); g.fillRect(0, 0, PW, 10); g.fillStyle = sh(stone, 1.1); g.fillRect(0, 10, PW, 4); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 14, PW, 6); // [144] 屋上の張り出したふち（コーニス）とかげ
    // 1 階：ショーウィンドウ
    g.fillStyle = sh('#2E2A26', 1); g.fillRect(0, y0, PW, PH - y0); const nW = Math.max(2, Math.round(PW / (2.8 * P))), sw = PW / nW, door = (nW / 2) | 0;
    for (let k = 0; k < nW; k++) { const x = k * sw + 6, xw = sw - 12, top = y0 + 14, bot = PH - .5 * P;
      if (k === door) { g.fillStyle = night ? '#FFE7B8' : '#3A3430'; g.fillRect(x + xw * .1, top + 10, xw * .8, PH - top - 14); g.fillStyle = '#C9A24A'; g.fillRect(x + xw * .5 - 1, top + 10, 2, PH - top - 14); g.fillRect(x + xw * .1, top + 6, xw * .8, 4); g.fillStyle = sh('#D8D0C2', 1); g.fillRect(x, PH - 6, xw, 6); continue; } // [139] 両開きの入口と石段
      g.fillStyle = night ? '#FFF2DA' : '#33404C'; g.fillRect(x, top, xw, bot - top);
      if (!night) { const gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, 'rgba(200,218,232,.75)'); gr.addColorStop(1, 'rgba(60,80,100,.15)'); g.fillStyle = gr; g.fillRect(x, top, xw, bot - top); }
      for (let m = 0; m < 2; m++) { const mx = x + xw * (.3 + m * .4), my = bot - 8, col = ['#2B2B2B', '#B9433A', '#E9E2D5', '#3A5A8C', '#8A6A4A'][(r() * 5) | 0]; g.fillStyle = night ? col : 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(mx, my - 1.25 * P, .14 * P, 0, 7); g.fill(); g.beginPath(); g.moveTo(mx - .22 * P, my - 1.05 * P); g.lineTo(mx + .22 * P, my - 1.05 * P); g.lineTo(mx + .3 * P, my - .3 * P); g.lineTo(mx - .3 * P, my - .3 * P); g.closePath(); g.fill(); g.fillRect(mx - 1, my - .3 * P, 2, .3 * P); } // [137] 中のマネキン
      if (night) { for (let m = 0; m < 3; m++) { const gl = g.createRadialGradient(x + xw * (.2 + m * .3), top + 4, 1, x + xw * (.2 + m * .3), top + 4, xw * .35); gl.addColorStop(0, 'rgba(255,255,255,.6)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(x, top, xw, bot - top); } } // [145] 夜：スポットライトの光の輪
      else { g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.moveTo(x + xw * .15, bot); g.lineTo(x + xw * .45, top); g.lineTo(x + xw * .55, top); g.lineTo(x + xw * .25, bot); g.fill(); } // [148] ガラスの映りこみ
      g.fillStyle = sh('#D8D0C2', 1); g.fillRect(x - 2, bot, xw + 4, PH - bot); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x - 2, bot, xw + 4, 2); } // [138] ショーウィンドウの足もとの台
    g.fillStyle = '#C9A24A'; g.fillRect(PW * .3, y0 - .45 * P, PW * .4, .28 * P); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(PW * .3, y0 - .45 * P, PW * .4, 2); g.fillStyle = sh('#2E2A26', 1); for (let k = 0; k < 6; k++) g.fillRect(PW * (.33 + k * .06), y0 - .4 * P, PW * .035, .18 * P); // [141] 金色の店名の板（字の形だけ）
    if (variant % 2 === 0) { const fx = PW - 10, fc = ['#7A1F2B', '#1E3A5C', '#2E4A3A', '#E9E2D5'][(variant >> 1) % 4]; g.fillStyle = '#8A8A8A'; g.fillRect(fx - 30, y0 - 1.6 * P, 30, 3); g.fillStyle = sh(fc, 1); g.fillRect(fx - 26, y0 - 1.6 * P + 3, 18, .9 * P); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(fx - 12, y0 - 1.6 * P + 3, 4, .9 * P); } // [140] 店先の小さな旗
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y0 - 3, PW, 3);
  },
  // Shinjuku: curtain-wall towers, glass bands reflecting the sky, spandrels between
  glass(g, r, PW, PH, w, h, night, variant) { /* 2026-11-17 景色 114〜130：オフィス街のガラスのビル（前は、青い帯と白い帯がならぶだけだった） */
    const P = FAC_P, band = 1.6 * P, kind = variant % 3, lob = PH - 4.2 * P;
    const skyTop = kind === 2 ? '#CFE0EE' : '#B4CDE2', skyBot = kind === 1 ? '#4A6A88' : '#5A7A96';
    for (let y = lob; y > -band; y -= band * 2) { const yt = y - band * 2;
      if (night) { for (let x = 0; x < PW; x += 1.2 * P) { const v = r(); g.fillStyle = v < .35 ? '#F6E7BE' : v < .45 ? '#DCE8F4' : v < .8 ? '#1E2840' : '#141A2C'; g.fillRect(x + 1, yt + 1, 1.2 * P - 2, band - 2); } // [129] 夜：残業の窓はまばら
        if (r() < .7) { g.fillStyle = 'rgba(255,255,240,.55)'; g.fillRect(0, yt + 3, PW, 1.5); } } // [128] 夜：階ごとの天井の照明の線
      else { const gr = g.createLinearGradient(0, yt, 0, yt + band); gr.addColorStop(0, skyTop); gr.addColorStop(1, skyBot); g.fillStyle = gr; g.fillRect(0, yt, PW, band);
        for (let x = 0; x < PW; x += 1.2 * P) { g.fillStyle = `rgba(${r() < .5 ? '255,255,255' : '20,30,50'},${(r() * .08).toFixed(3)})`; g.fillRect(x, yt, 1.2 * P, band); if (r() < .12) { g.fillStyle = 'rgba(235,236,232,.85)'; g.fillRect(x + 1, yt + 1, 1.2 * P - 2, band * (.3 + r() * .5)); } } // [116] ガラス 1 枚ずつの色むら [117] ブラインドを下ろした窓
        g.fillStyle = 'rgba(255,255,255,.18)'; for (let x = 6; x < PW; x += 1.2 * P) g.fillRect(x, yt + band * .18, 1.2 * P - 12, 1); } // [118] ガラスの奥の天井の照明の列
      g.fillStyle = kind === 2 ? '#E6E9EC' : '#46525F'; g.fillRect(0, yt + band, PW, band); const sg = g.createLinearGradient(0, yt + band, 0, yt + band * 2); sg.addColorStop(0, 'rgba(255,255,255,.18)'); sg.addColorStop(1, 'rgba(0,0,0,.18)'); g.fillStyle = sg; g.fillRect(0, yt + band, PW, band); // [120] 階ごとの帯の厚み（上は明るく下は暗い）
      g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, yt + band, PW, 2); }
    if (!night) { g.save(); g.beginPath(); g.rect(0, 0, PW, lob); g.clip(); g.globalAlpha = .35; g.fillStyle = '#FFFFFF'; for (let k = 0; k < 4; k++) { const cx = r() * PW, cy = r() * lob * .7; g.beginPath(); g.ellipse(cx, cy, 30 + r() * 50, 10 + r() * 14, -.25, 0, 7); g.fill(); } // [114] 雲が、ななめにゆがんで映る
      g.globalAlpha = .22; g.fillStyle = '#2A3442'; const ox = r() * PW * .6; g.fillRect(ox, lob * (.35 + r() * .2), PW * (.2 + r() * .25), lob); for (let y = lob * .5; y < lob; y += 10) { g.fillStyle = 'rgba(200,215,230,.25)'; g.fillRect(ox + 4, y, PW * .15, 3); } g.restore(); } // [115] 向かいのビルの映りこみ
    g.fillStyle = kind === 2 ? 'rgba(120,130,140,.6)' : 'rgba(215,224,232,.55)'; for (let x = 0; x < PW; x += P * 1.2) { g.fillRect(x, 0, 1.5, lob); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + 1.5, 0, 1.5, lob); g.fillStyle = kind === 2 ? 'rgba(120,130,140,.6)' : 'rgba(215,224,232,.55)'; } // [119] 方立（たての枠）とその横のかげ
    // 1 階：石の柱・ロビー・入口
    g.fillStyle = '#8E8A82'; g.fillRect(0, lob, PW, PH - lob); for (let y = lob + 8; y < PH; y += 14) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, y, PW, 1); } // [130] 1 階の石張り
    const cols = Math.max(2, Math.round(PW / (3 * P))); for (let k = 0; k <= cols; k++) { const x = k * PW / cols; g.fillStyle = '#B5AFA4'; g.fillRect(x - 6, lob, 12, PH - lob); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(x - 6, lob, 3, PH - lob); } // [125] 石張りの柱
    for (let k = 0; k < cols; k++) { const x0 = k * PW / cols + 7, x1 = (k + 1) * PW / cols - 7, yy = lob + 10; g.fillStyle = night ? '#FFF0CF' : '#3E4C5A'; g.fillRect(x0, yy, x1 - x0, PH - yy - 4);
      if (!night) { const gr = g.createLinearGradient(0, yy, 0, PH); gr.addColorStop(0, 'rgba(180,205,225,.55)'); gr.addColorStop(1, 'rgba(60,75,90,.1)'); g.fillStyle = gr; g.fillRect(x0, yy, x1 - x0, PH - yy - 4); }
      if (night) { for (let x = x0 + 8; x < x1; x += 18) { g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(x, yy + 3, 5, 2); } } // [127] 夜：ロビーのあたたかいあかりとダウンライト
      g.fillStyle = 'rgba(40,50,60,.6)'; g.fillRect(x0 + (x1 - x0) * .7, PH - 1.5 * P, 10, 1.4 * P - 4); g.fillStyle = night ? 'rgba(40,60,40,.55)' : 'rgba(46,90,46,.8)'; g.beginPath(); g.ellipse(x0 + (x1 - x0) * .7 + 5, PH - 1.5 * P, 8, 11, 0, 0, 7); g.fill(); // [122] ロビーの受付と観葉植物
      g.fillStyle = 'rgba(30,35,40,.85)'; for (let x = x0; x < x1; x += 22) g.fillRect(x, yy, 2, PH - yy - 4); }
    const dx = PW * (.35 + (variant % 2) * .15), dw = 2.4 * P; g.fillStyle = 'rgba(20,25,30,.9)'; g.fillRect(dx, PH - 2.4 * P, dw, 2.4 * P - 4); g.fillStyle = night ? 'rgba(255,240,200,.85)' : 'rgba(160,190,215,.6)'; g.fillRect(dx + 3, PH - 2.3 * P, dw / 2 - 5, 2.2 * P - 8); g.fillRect(dx + dw / 2 + 2, PH - 2.3 * P, dw / 2 - 5, 2.2 * P - 8); g.fillStyle = '#C9CDD2'; g.fillRect(dx + dw / 2 - 1, PH - 2.3 * P, 2, 2.2 * P - 8); // [121] 二重の自動ドア
    g.fillStyle = '#5A626C'; g.fillRect(dx - 20, PH - 2.9 * P, dw + 40, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(dx - 16, PH - 2.9 * P + 8, dw + 32, 5); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(dx - 20, PH - 2.9 * P, dw + 40, 2); // [123] 入口の上のひさし
    g.fillStyle = '#E8E4DA'; g.fillRect(dx - 2 * P, PH - 2.2 * P, 1.6 * P, .5 * P); g.fillStyle = '#3A3A3A'; g.font = `700 ${Math.round(.26 * P)}px ${FAC_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(['第一ビル', '中央ビル', '本町タワー'][variant % 3], dx - 1.2 * P, PH - 1.95 * P, 1.5 * P); // [124] ビルの名前の板
    g.fillStyle = '#4C7A3E'; for (let x = 4; x < dx - 2.2 * P; x += 10) { g.beginPath(); g.ellipse(x + 5, PH - 6, 7, 6, 0, 0, 7); g.fill(); } g.fillStyle = '#6E6A62'; g.fillRect(0, PH - 4, PW, 4); // [126] 足もとの植え込み
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, lob - 3, PW, 4);
  },
  // Nakamise: low shophouses with bright awnings and goods on display
  nakamise(g, r, PW, PH, w, h, night, variant) { // the stalls of a temple approach: a sign board, a striped awning, shutters above, goods hung and stacked
    const gf = Math.min(PH, 3.2 * FAC_P), top = PH - gf;
    // the shop's interior, warm and deep
    const inr = g.createLinearGradient(0, top, 0, PH); inr.addColorStop(0, night ? '#6E4A2A' : '#5A3C22'); inr.addColorStop(1, night ? '#B88A5A' : '#8A5E3A'); g.fillStyle = inr; g.fillRect(0, top, PW, gf);
    // shelves of goods: boxes of sweets, folded fans, little toys, each with a label
    const goods = ['#F2C230', '#E86A75', '#5F9E5A', '#FBF6EE', '#C8463C', '#F08A2E', '#6FA8DC', '#F7E0A0'];
    for (let row = 0; row < 2; row++) { const y = top + 22 + row * 20; g.fillStyle = '#C9A06A'; g.fillRect(0, y + 13, PW, 3);
      for (let x = 5; x < PW - 9; x += 11) { const c = goods[(r() * goods.length) | 0]; g.fillStyle = c; g.fillRect(x, y + (r() * 3 | 0), 9, 12); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x + 1.5, y + 4, 6, 3); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + 7, y, 2, 13); } }
    // the counter and a shopkeeper's lantern
    g.fillStyle = '#8A5530'; g.fillRect(0, PH - 16, PW, 16); g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(0, PH - 16, PW, 2);
    { const x = PW * (.15 + r() * .7), y = top + 10; g.fillStyle = night ? '#FFE2B0' : '#F4E4CF'; g.beginPath(); g.ellipse(x, y + 8, 5.5, 7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#B5302A'; g.fillRect(x - 5.5, y + 2, 11, 1.5); g.fillRect(x - 5.5, y + 13, 11, 1.5); g.fillStyle = '#2B2B2B'; g.fillRect(x - .7, top, 1.4, 6); }
    // things hanging from the eave: fans, a string of paper, a small banner
    for (let x = 8; x < PW - 8; x += 16) { const k = r(); if (k < .35) { g.fillStyle = ['#C8463C', '#355F86', '#F2C230'][(r() * 3) | 0]; g.beginPath(); g.moveTo(x, top + 2); g.lineTo(x - 6, top + 14); g.lineTo(x + 6, top + 14); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x - 3, top + 10, 6, 1.2); }
      else if (k < .6) { g.fillStyle = '#FBF6EE'; g.fillRect(x - 3, top + 1, 6, 16); g.fillStyle = '#B5302A'; g.fillRect(x - 2, top + 4, 4, 2); g.fillRect(x - 2, top + 9, 4, 2); } }
    // the awning: red and white stripes with a scalloped edge, over a dark wooden lintel
    const aw = 13; g.fillStyle = '#B5302A'; g.fillRect(0, top - aw, PW, aw); g.fillStyle = '#FBF6EE'; for (let x = 0; x < PW; x += 14) g.fillRect(x, top - aw, 7, aw);
    g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, top - 3, PW, 3); g.fillStyle = '#FBF6EE'; for (let x = 7; x < PW; x += 14) { g.beginPath(); g.arc(x, top, 3.5, 0, Math.PI); g.fill(); } g.fillStyle = '#B5302A'; for (let x = 0; x < PW; x += 14) { g.beginPath(); g.arc(x, top, 3.5, 0, Math.PI); g.fill(); }
    // the sign board above the awning: black lacquer with gold characters, or white with red
    const sbH = 16, sbY = top - aw - sbH - 2, dark = r() < .5; signText(g, NAKAMISE_WORDS[(r() * NAKAMISE_WORDS.length) | 0], 3, sbY, PW - 6, sbH, dark ? '#F2C230' : '#B5302A', dark ? '#2B2420' : '#FBF6EE');
    g.strokeStyle = dark ? '#8A6A2A' : '#B5302A'; g.lineWidth = 1.5; g.strokeRect(3.5, sbY + .5, PW - 7, sbH - 1);
    // wooden posts at both edges
    g.fillStyle = '#4A2F1C'; g.fillRect(0, sbY, 4, PH - sbY); g.fillRect(PW - 4, sbY, 4, PH - sbY); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(1, sbY, 1, PH - sbY); g.fillRect(PW - 3, sbY, 1, PH - sbY);
    if (night) { const gl = g.createLinearGradient(0, top, 0, PH); gl.addColorStop(0, 'rgba(255,200,120,.35)'); gl.addColorStop(1, 'rgba(255,200,120,.1)'); g.fillStyle = gl; g.fillRect(0, top, PW, gf); }
    // upper floor: a shuttered window and a tiled eave
    if (PH > gf + 28) { const wy = sbY - 36; if (wy > 8) { g.fillStyle = '#4A2F1C'; g.fillRect(PW * .25, wy, PW * .5, 26); g.fillStyle = night && r() < .5 ? '#FFE2B0' : '#DCE2E6'; g.fillRect(PW * .27, wy + 2, PW * .46, 22); g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = wy + 4; y < wy + 24; y += 4) g.fillRect(PW * .27, y, PW * .46, 1.5); }
      g.fillStyle = '#4A4F57'; g.fillRect(0, sbY - 8, PW, 7); g.fillStyle = 'rgba(255,255,255,.25)'; for (let x = 0; x < PW; x += 8) g.fillRect(x, sbY - 8, 1.5, 7); }
    g.fillStyle = '#4A4F57'; g.fillRect(0, 0, PW, 6); g.fillStyle = 'rgba(255,255,255,.2)'; for (let x = 0; x < PW; x += 8) g.fillRect(x, 0, 1.5, 6);
    /* 2026-11-17 景色 184〜188：浅草・仲見世の店（本物を調べて） */
    { const P = FAC_P, k0 = night ? .55 : 1;
      if (top > 40) { const ry = 0, rh = top - 30; g.fillStyle = shadeHex('#4A4F57', k0); g.fillRect(0, ry, PW, rh); for (let x = 0; x < PW; x += 6) { const gr = g.createLinearGradient(x, 0, x + 6, 0); gr.addColorStop(0, shadeHex('#5E646C', k0)); gr.addColorStop(.5, shadeHex('#8A9098', k0)); gr.addColorStop(1, shadeHex('#3E434A', k0)); g.fillStyle = gr; g.fillRect(x, ry, 5, rh); } g.fillStyle = 'rgba(0,0,0,.3)'; for (let y = ry + 8; y < ry + rh; y += 8) g.fillRect(0, y, PW, 1); } // [186] 屋根の瓦（1 枚ずつの丸み）
      g.fillStyle = shadeHex('#C8452E', k0); g.fillRect(0, top - 4, PW, 5); g.fillRect(0, top, 4, gf); g.fillRect(PW - 4, top, 4, gf); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(0, top - 4, PW, 1); // [185] 朱色の柱と梁
      for (let x = 10; x < PW - 6; x += 22) { const ly = top + gf * .07; g.strokeStyle = '#2B2B2B'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, top); g.lineTo(x, ly - 5); g.stroke(); if (night) { g.save(); g.shadowColor = '#FF6A40'; g.shadowBlur = 10; } g.fillStyle = night ? '#FF6A4A' : '#D7262E'; g.beginPath(); g.ellipse(x, ly + 6, 3.5, 5, 0, 0, 7); g.fill(); if (night) g.restore(); g.fillStyle = '#2B2B2B'; g.fillRect(x - 3.5, ly + 1, 7, 1.2); g.fillRect(x - 3.5, ly + 10, 7, 1.2); } // [188] 赤い提灯の列
      if (variant % 3 === 0) { g.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(PW * .3 + k * 5, top + gf * .35 - k * 8, 5 + k * 2, 3 + k, 0, 0, 7); g.fill(); } } // [187] 人形焼を焼く湯気
      if (night && variant % 2 === 1) { const sy = top + gf * .25, sh2 = gf * .7; g.fillStyle = '#9AA0A6'; g.fillRect(4, sy, PW - 8, sh2); g.fillStyle = 'rgba(0,0,0,.1)'; for (let y = sy; y < sy + sh2; y += 3) g.fillRect(4, y, PW - 8, 1);
        const sky = g.createLinearGradient(0, sy, 0, sy + sh2); sky.addColorStop(0, '#2E4A7A'); sky.addColorStop(1, '#C86A4A'); g.globalAlpha = .85; g.fillStyle = sky; g.fillRect(8, sy + 4, PW - 16, sh2 - 8); g.globalAlpha = 1;
        g.fillStyle = '#C8452E'; g.fillRect(PW * .35, sy + sh2 * .45, PW * .3, sh2 * .4); g.fillStyle = '#2A2A2A'; g.fillRect(PW * .3, sy + sh2 * .4, PW * .4, 4); g.fillStyle = '#FFE0A0'; for (let x = 14; x < PW - 14; x += 14) { g.beginPath(); g.arc(x, sy + sh2 * .2, 3, 0, 7); g.fill(); } } } // [184] 夜：店じまいしたシャッターに描かれた、浅草の祭りの絵（本物も、閉店後のシャッターに絵がある）
  },
  // Tokyo Station: red brick with white stone bands, arched windows with keystones, a slate mansard with dormers
  station(g, r, PW, PH, w, h, night, variant) {
    g.fillStyle = '#A24A3A'; g.fillRect(0, 0, PW, PH);
    for (let y = 0; y < PH; y += 6) { g.fillStyle = (y / 6 | 0) % 2 ? 'rgba(255,220,200,.12)' : 'rgba(60,20,10,.12)'; g.fillRect(0, y, PW, 1.2); for (let x = ((y / 6 | 0) % 2) * 7; x < PW; x += 14) { g.fillStyle = `rgba(${120 + r() * 60 | 0},${40 + r() * 30 | 0},${30 + r() * 20 | 0},.35)`; g.fillRect(x, y + 1, 6, 4); } }
    const roofH = PH * .22; // mansard
    g.fillStyle = '#4A525C'; g.fillRect(0, 0, PW, roofH); g.fillStyle = 'rgba(255,255,255,.12)'; for (let y = 4; y < roofH; y += 7) g.fillRect(0, y, PW, 1);
    g.fillStyle = '#6E7680'; g.fillRect(0, roofH - 4, PW, 4);
    for (let x = 18; x < PW - 20; x += 46) { g.fillStyle = '#4A525C'; g.fillRect(x, roofH * .3, 18, roofH * .7); g.fillStyle = night ? '#F7D58A' : '#8FA3B8'; g.fillRect(x + 4, roofH * .42, 10, roofH * .45); g.fillStyle = '#E9E4DA'; g.fillRect(x - 2, roofH * .3 - 3, 22, 3); } // dormers
    const bands = [roofH + 4, roofH + (PH - roofH) * .36, roofH + (PH - roofH) * .72, PH - 6]; g.fillStyle = '#EDE6DA'; for (const y of bands) g.fillRect(0, y, PW, 4);
    for (let k = 0; k < 2; k++) { const y0 = bands[k] + 10, y1 = bands[k + 1] - 6, wh = y1 - y0; for (let x = 10; x < PW - 20; x += 34) { // arched windows
      g.fillStyle = night ? '#F3D9A0' : '#5A6B7C'; g.fillRect(x, y0 + 8, 20, wh - 8); g.beginPath(); g.arc(x + 10, y0 + 8, 10, Math.PI, 0); g.fill();
      g.strokeStyle = '#EDE6DA'; g.lineWidth = 2; g.beginPath(); g.arc(x + 10, y0 + 8, 11, Math.PI, 0); g.stroke(); g.fillStyle = '#EDE6DA'; g.fillRect(x + 8, y0 - 4, 4, 6);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + 9, y0 + 8, 2, wh - 8); g.fillRect(x, y0 + 8 + (wh - 8) * .5, 20, 2); } }
    // ground floor: tall arched entrances
    const g0 = bands[2] + 6; for (let x = 12; x < PW - 30; x += 52) { g.fillStyle = night ? '#FFEFC9' : '#3C4A58'; g.fillRect(x, g0 + 14, 28, PH - g0 - 20); g.beginPath(); g.arc(x + 14, g0 + 14, 14, Math.PI, 0); g.fill(); g.strokeStyle = '#EDE6DA'; g.lineWidth = 3; g.beginPath(); g.arc(x + 14, g0 + 14, 15, Math.PI, 0); g.stroke(); }
  },
  // Ameyoko: packed market stalls under hand-painted signs
  // old wooden townhouses: dark lattice fronts, noren, a tiled eave (Kagurazaka, Yanaka)
  machiya(g, r, PW, PH, w, h, night, variant) { /* 2026-11-17 景色 166〜175：神楽坂・谷中などの古い町家（前は、こげ茶の面に格子とのれんだけ） */
    const P = FAC_P, gf = Math.min(PH, 3.0 * P), k0 = night ? .5 : 1, sh = (c, m) => shadeHex(c, m * k0), plaster = variant % 3 === 1;
    g.fillStyle = sh(['#3B2E26', '#4A3A2E', '#2E2622'][variant % 3], 1); g.fillRect(0, 0, PW, PH);
    for (let x = 0; x < PW; x += 7) { g.fillStyle = `rgba(${r() < .5 ? '255,235,210' : '0,0,0'},${(.04 + r() * .06).toFixed(3)})`; g.fillRect(x, 0, 7, PH - gf); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, 0, 1, PH - gf); } // [166] たての板壁と、1 枚ずつの色のちがい
    if (plaster && PH > gf + 24) { g.fillStyle = sh('#E8E1D2', 1); g.fillRect(0, 8, PW, PH - gf - 8); for (let k = 0; k < 40; k++) { g.fillStyle = 'rgba(120,100,70,.06)'; g.fillRect(r() * PW, 8 + r() * (PH - gf - 8), 6, 4); } } // [171] 2 階の白いしっくいの壁
    if (PH > gf + 24) { const y = PH - gf - 40; g.fillStyle = night ? '#F7D58A' : sh(plaster ? '#3A2E26' : '#C9BFA8', 1); g.fillRect(PW * .2, y, PW * .6, 28); g.fillStyle = sh(plaster ? '#E8E1D2' : '#2A201A', 1); for (let x = PW * .2; x < PW * .8; x += 6) g.fillRect(x, y, 2.5, 28); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(PW * .2, y + 28, PW * .6, 2); } // [171] 虫籠窓（ぬりこめた、たての格子窓）
    g.fillStyle = sh('#4A4F57', 1); g.fillRect(0, 0, PW, 8); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 8, PW, 5); // [175] 屋根の軒のかげ
    const ey = PH - gf; g.fillStyle = sh('#4A4F57', 1); g.fillRect(0, ey, PW, 12); for (let x = 0; x < PW; x += 6) { const gr = g.createLinearGradient(x, 0, x + 6, 0); gr.addColorStop(0, sh('#5E646C', 1)); gr.addColorStop(.5, sh('#8A9098', 1)); gr.addColorStop(1, sh('#3E434A', 1)); g.fillStyle = gr; g.fillRect(x, ey, 5, 12); g.fillStyle = sh('#2E3238', 1); g.beginPath(); g.arc(x + 2.5, ey + 12, 2.5, 0, Math.PI); g.fill(); } g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, ey + 13, PW, 3); // [167] 1 階のひさしの瓦（1 枚ずつの丸みとかげ）
    const top = ey + 16, bot = PH - 8;
    g.fillStyle = night ? '#FFE1A8' : sh('#EDE6D6', 1); g.fillRect(4, top, PW - 8, bot - top); g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = top; y < bot; y += 9) g.fillRect(4, y, PW - 8, 1); for (let x = 4; x < PW - 4; x += 12) g.fillRect(x, top, 1, bot - top); // [168] 格子の奥の障子
    g.fillStyle = sh('#2A201A', 1); for (let x = 6; x < PW - 6; x += 5) g.fillRect(x, top, 2, bot - top); g.fillStyle = sh('#3A2C22', 1); g.fillRect(4, top, PW - 8, 3); // 格子（千本格子）
    const dx = PW * (.55 + (variant % 2) * .15) - 14; g.fillStyle = sh('#4A3828', 1); g.fillRect(dx, top, 28, bot - top); g.fillStyle = night ? 'rgba(255,225,170,.9)' : 'rgba(170,190,205,.6)'; g.fillRect(dx + 3, top + 4, 10, bot - top - 8); g.fillRect(dx + 15, top + 4, 10, bot - top - 8); g.fillStyle = sh('#4A3828', 1); for (let y = top + 10; y < bot; y += 10) { g.fillRect(dx + 3, y, 10, 1.5); g.fillRect(dx + 15, y, 10, 1.5); } // [170] 入口のガラスの引き戸
    const nx = Math.max(24, PW * .28), nc = ['#2F3E5C', '#5C2A2A', '#2E4A3A', '#E9E2D5'][(r() * 4) | 0]; g.fillStyle = sh(nc, 1); for (let k = 0; k < 3; k++) { const x0 = nx - 22 + k * 15, hh = gf * .42; g.beginPath(); g.moveTo(x0, top - 2); g.lineTo(x0 + 13, top - 2); g.lineTo(x0 + 13, top + hh - 2); g.quadraticCurveTo(x0 + 9, top + hh + 2, x0 + 6, top + hh); g.quadraticCurveTo(x0 + 3, top + hh - 2, x0, top + hh + 1); g.closePath(); g.fill(); } // [169] のれん（すそがゆれる）
    signText(g, MACHIYA_WORDS[(r() * MACHIYA_WORDS.length) | 0], nx - 22, top + 2, 43, 14, nc === '#E9E2D5' ? '#2B2B2B' : '#FBF6EE');
    { const lx = PW - 14, ly = top + 14; g.fillStyle = sh('#2A201A', 1); g.fillRect(lx - 1, ey + 12, 2, 6); if (night) { g.save(); g.shadowColor = '#FFB060'; g.shadowBlur = 12; g.fillStyle = '#FFE3B0'; g.beginPath(); g.ellipse(lx, ly, 6, 9, 0, 0, 7); g.fill(); g.restore(); } else { g.fillStyle = '#F4EEDF'; g.beginPath(); g.ellipse(lx, ly, 6, 9, 0, 0, 7); g.fill(); g.fillStyle = '#2A201A'; g.fillRect(lx - 6, ly - 9, 12, 2); g.fillRect(lx - 6, ly + 7, 12, 2); } } // [172] 軒下の行灯（夜は光る）
    g.strokeStyle = sh('#6E5A3A', 1); g.lineWidth = 2; for (let x = 6; x < dx - 6; x += 5) { g.beginPath(); g.moveTo(x, PH - 4); g.quadraticCurveTo(x + 8, PH - 6, x + 10, PH - 20); g.stroke(); } g.fillStyle = sh('#5A4A30', 1); g.fillRect(4, PH - 21, dx - 10, 2); // [173] 犬矢来（竹のまがった柵）
    g.fillStyle = sh('#8A8478', 1); g.fillRect(dx - 4, PH - 6, 36, 6); g.fillStyle = 'rgba(160,180,195,.35)'; g.fillRect(dx - 2, PH - 3, 30, 2); g.fillStyle = sh('#A85A34', 1); g.fillRect(dx + 34, PH - 12, 8, 10); g.fillStyle = sh('#3E7A3A', 1); g.beginPath(); g.ellipse(dx + 38, PH - 15, 7, 5, 0, 0, 7); g.fill(); // [174] 打ち水でぬれた石段と植木鉢
  },
  // 2026-11-17 景色 74〜96：住宅街の 2 階建ての家（それまでは、うすい色の壁に青い窓が 2 つずつだけで、作り物っぽかった）
  house(g, r, PW, PH, w, h, night, variant) {
    const P = FAC_P, k = night ? .42 : 1, base = ['#EFE6D6', '#E2D6C2', '#D6CDBF', '#C9BFAF', '#E9E2D5', '#BFB6A6', '#DCD3C4', '#C7C9C4'][variant % 8], sh = (c, m) => shadeHex(c, m * k);
    g.fillStyle = sh(base, 1); g.fillRect(0, 0, PW, PH);
    const siding = variant % 3 !== 2; if (siding) { for (let y = PH; y > 0; y -= .45 * P) { g.fillStyle = 'rgba(0,0,0,.07)'; g.fillRect(0, y - 1.5, PW, 1.5); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, y - 2.5, PW, 1); } for (let x = 30 + r() * 30; x < PW; x += 45 + r() * 30) { g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(x, 0, 1, PH); } } // [74] 外壁のサイディングの横じまと継ぎ目
    else { for (let i = 0; i < 260; i++) { g.fillStyle = r() < .5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.07)'; g.fillRect(r() * PW, r() * PH, 2, 2); } } // [75] 吹きつけの壁のざらざら
    const fl = 2.9 * P, g1 = PH, g2 = PH - fl, top = Math.max(0, PH - fl * 2);
    g.fillStyle = sh(base, .86); g.fillRect(0, g2 - 3, PW, 5); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(0, g2 - 4, PW, 1); // [92] 1 階と 2 階の間の帯
    const win = (x, y, ww, hh, lit) => { g.fillStyle = sh('#E8E8E4', 1); g.fillRect(x - 3, y - 3, ww + 6, hh + 6); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x - 3, y + hh + 3, ww + 6, 2); // [81] 白いアルミサッシ [93] 窓の下のかげ
      if (night) { const on = lit; g.fillStyle = on ? '#FFE2A8' : '#232A38'; g.fillRect(x, y, ww, hh); if (on) { g.fillStyle = 'rgba(255,255,255,.35)'; for (let xx = x + 2; xx < x + ww; xx += 4) g.fillRect(xx, y, 1.5, hh); g.fillStyle = 'rgba(120,70,30,.25)'; g.fillRect(x + ww * .55, y, ww * .45, hh); } } // [90] カーテン越しのあかり [91] レースのカーテンのひだ
      else { const gr = g.createLinearGradient(0, y, 0, y + hh); gr.addColorStop(0, '#B7CCDB'); gr.addColorStop(.5, '#7F98AC'); gr.addColorStop(1, '#4E6274'); g.fillStyle = gr; g.fillRect(x, y, ww, hh); g.fillStyle = 'rgba(245,242,232,.75)'; g.fillRect(x + ww * .52, y + 1, ww * .46, hh - 2); g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.moveTo(x + 2, y + hh); g.lineTo(x + ww * .3, y); g.lineTo(x + ww * .4, y); g.lineTo(x + ww * .12, y + hh); g.fill(); }
      g.fillStyle = sh('#D5D5D0', 1); g.fillRect(x + ww / 2 - 1.5, y, 3, hh); };
    // 1 階：玄関・小窓（面格子）・掃き出し窓
    const dx = PW * (.12 + r() * .2), dw = 1.0 * P, dh = 2.1 * P, dy = g1 - dh - 4;
    g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(dx - 10, dy - 14, dw + 20, 4); g.fillStyle = sh('#6E6E6E', 1); g.fillRect(dx - 12, dy - 18, dw + 24, 5); // [77] 玄関の上のひさし
    { const wood = ['#7A5236', '#5E4030', '#8E6A4A', '#4A4A4E'][variant % 4], gr = g.createLinearGradient(dx, 0, dx + dw, 0); gr.addColorStop(0, sh(wood, .85)); gr.addColorStop(.5, sh(wood, 1.12)); gr.addColorStop(1, sh(wood, .8)); g.fillStyle = gr; g.fillRect(dx, dy, dw, dh); g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = dy + 3; y < dy + dh; y += 4) g.fillRect(dx, y, dw, 1); g.fillStyle = night ? '#FFE9B8' : 'rgba(200,215,225,.7)'; g.fillRect(dx + dw * .2, dy + 6, dw * .14, dh * .7); g.fillStyle = sh('#C9C2B0', 1.1); g.fillRect(dx + dw * .78, dy + dh * .45, 3, 12); } // [76] 木目の玄関ドアと取っ手
    { const lx = dx + dw + 8, ly = dy + 8; if (night) { g.save(); g.shadowColor = '#FFC870'; g.shadowBlur = 14; g.fillStyle = '#FFF0C8'; g.beginPath(); g.arc(lx, ly, 3.5, 0, 7); g.fill(); g.restore(); g.fillStyle = 'rgba(255,210,140,.18)'; g.beginPath(); g.arc(lx, ly + 10, 22, 0, 7); g.fill(); } else { g.fillStyle = '#F4F1E6'; g.beginPath(); g.arc(lx, ly, 3.5, 0, 7); g.fill(); g.strokeStyle = '#6E6E6E'; g.lineWidth = 1; g.stroke(); } } // [78] 玄関灯（夜は点く）
    g.fillStyle = sh('#3A3A3A', 1); g.fillRect(dx - 14, dy + dh * .32, 9, 6); g.fillStyle = sh('#EDE7D8', 1); g.fillRect(dx - 13, dy + dh * .32 + 1, 7, 4); // [79] 表札
    g.fillStyle = sh('#DADADA', 1); g.fillRect(dx - 12, dy + dh * .45, 5, 8); g.fillStyle = sh('#333', 1); g.fillRect(dx - 11, dy + dh * .45 + 1, 3, 3); // [80] インターホン
    const sx = Math.min(PW - 1.8 * P - 8, dx + dw + 1.2 * P); if (sx + 1.8 * P < PW) win(sx, g1 - 2.2 * P, 1.8 * P, 1.9 * P, r() < .6); // 掃き出し窓
    { const mx = dx > PW * .3 ? dx - .9 * P : Math.max(sx + 1.8 * P + 14, PW - .9 * P - 10); if (mx > 6 && mx + .7 * P < PW - 4) { win(mx, g1 - 2.1 * P, .7 * P, .55 * P, r() < .4); g.fillStyle = sh('#CFCFCB', 1); for (let x = mx + 2; x < mx + .7 * P; x += 4) g.fillRect(x, g1 - 2.1 * P - 2, 1.5, .55 * P + 4); } } // [82] 小窓の面格子
    // 2 階：ベランダ・窓・雨戸の戸袋・小さなひさし
    if (PH > fl + 20) { const n2 = Math.max(1, Math.round(PW / (3.2 * P))); for (let i = 0; i < n2; i++) { const cw = PW / n2, ww = Math.min(1.7 * P, cw * .62), x = i * cw + (cw - ww) / 2, y = g2 - 2.3 * P;
        win(x, y, ww, 1.75 * P, r() < .55); g.fillStyle = sh(base, .9); g.fillRect(x + ww + 4, y - 2, .45 * P, 1.75 * P + 4); g.fillStyle = 'rgba(0,0,0,.08)'; for (let yy = y; yy < y + 1.75 * P; yy += 3) g.fillRect(x + ww + 4, yy, .45 * P, 1); // [83] 雨戸の戸袋
        g.fillStyle = sh('#7C7C7C', 1); g.fillRect(x - 6, y - 9, ww + 12, 4); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x - 4, y - 5, ww + 8, 3); } // [87] 窓の上の小さなひさし
      const bx = PW * (.4 + r() * .1), bw = PW * .5, by = g2 - 1.0 * P; if (r() < .8) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(bx, by + 1.0 * P - 2, bw, 4); g.fillStyle = sh('#ECEBE6', 1); g.fillRect(bx, by, bw, 3); for (let x = bx; x < bx + bw; x += 4) g.fillRect(x, by, 1.3, 1.0 * P); g.fillRect(bx, by + 1.0 * P - 3, bw, 3); // [84] ベランダの手すり
        if (!night && r() < .7) { const fc = ['#F2EFE6', '#E7C9CF', '#C9D9E8', '#F2E2B8'][(r() * 4) | 0]; g.fillStyle = fc; g.fillRect(bx + bw * .1, by - 3, bw * .35, .75 * P); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(bx + bw * .1, by + .5 * P, bw * .35, 3); } // [95] 干した布団
        if (!night) { g.strokeStyle = sh('#9A9A9A', 1); g.lineWidth = 1; g.beginPath(); g.moveTo(bx + bw * .5, by - .7 * P); g.lineTo(bx + bw * .95, by - .7 * P); g.stroke(); for (let x = bx + bw * .53; x < bx + bw * .93; x += 7 + r() * 5) { g.fillStyle = ['#FFFFFF', '#7FA6D6', '#E6A4A9', '#F2C230', '#5F9E5A'][(r() * 5) | 0]; g.fillRect(x, by - .7 * P, 5, 8 + r() * 6); } } // [96] 洗濯物
        g.fillStyle = sh('#E9EAE6', 1); g.fillRect(bx + bw - .9 * P, by + .25 * P, .8 * P, .6 * P); g.fillStyle = sh('#5A5C60', 1); g.beginPath(); g.arc(bx + bw - .55 * P, by + .55 * P, .22 * P, 0, 7); g.fill(); } } // [85] ベランダの室外機
    { const gx = r() < .5 ? 3 : PW - 6; g.fillStyle = sh('#8E8A80', 1); g.fillRect(gx, top, 3, PH - top); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(gx, top, 1, PH - top); for (let y = top + 20; y < PH; y += 40) { g.fillStyle = sh('#6E6A60', 1); g.fillRect(gx - 1, y, 5, 2); } } // [86] たての雨どい
    { const vx = PW * (.55 + r() * .3), vy = g2 + .5 * P; g.fillStyle = sh('#D6D6D2', 1); g.beginPath(); g.arc(vx, vy, 5, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(vx - 4, vy + 1, 8, 2); g.fillStyle = 'rgba(80,60,40,.18)'; g.fillRect(vx - 2, vy + 4, 4, 18); } // [88] 換気口の丸いフードと、下のよごれのすじ
    { const mx = dx + dw + 22, my = g1 - 1.3 * P; g.fillStyle = sh('#CFCFCB', 1); g.fillRect(mx, my, 10, 14); g.fillStyle = sh('#2E2E2E', 1); g.fillRect(mx + 2, my + 3, 6, 4); g.fillStyle = sh('#6E6E6E', 1); g.fillRect(mx + 4, my + 14, 2, g1 - my - 14); } // [89] 電気のメーター
    g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, 0, PW, 6); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(0, 6, PW, 8); // [94] 屋根ののきのかげ
  },
  // second-hand bookshops: book racks under the window, shelves inside, a hand-written sign
  books(g, r, PW, PH, w, h, night, variant) {
    FAC_STYLE.mixed(g, r, PW, PH, w, h, night, variant);
    const gf = 3.2 * FAC_P; g.fillStyle = night ? '#FFEFC9' : '#6B4631'; g.fillRect(4, PH - gf * .72, PW - 8, gf * .68);
    for (let row = 0; row < 3; row++) { let x = 6; const y = PH - gf * .7 + row * gf * .22; while (x < PW - 8) { const bw = 3 + r() * 4; g.fillStyle = ['#C8463C', '#355F86', '#E9E2D5', '#8A5530', '#5F9E5A', '#C9962F', '#2B2B2B'][(r() * 7) | 0]; g.fillRect(x, y + 2, bw, gf * .18); x += bw + .6; } g.fillStyle = '#3B2A20'; g.fillRect(4, y + gf * .2, PW - 8, 2); }
    signText(g, BOOK_WORDS[(r() * BOOK_WORDS.length) | 0], 6, PH - gf + 2, PW - 12, gf * .2, '#FBF6EE', '#3B2A20');
    /* 2026-11-17 景色 176〜183：神保町の古書店 */
    const P = FAC_P, k0 = night ? .55 : 1, sh = (c, m) => shadeHex(c, m * k0);
    for (let row = 0; row < 3; row++) { const y = PH - gf * .7 + row * gf * .22; for (let x = 7; x < PW - 8; x += 4 + r() * 3) { g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(x, y + 6, 1.5, gf * .1); } g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(4, y + 1, PW - 8, 2); } // [177] 本の背の白い字の線 [178] 棚の奥のかげ
    { const cx = PW * .62, cw = PW * .3; g.fillStyle = night ? '#FFE9B8' : '#2E2A26'; g.fillRect(cx, PH - gf * .72, cw, gf * .5); if (!night) { g.fillStyle = 'rgba(170,190,205,.45)'; g.fillRect(cx, PH - gf * .72, cw, gf * .5); } g.fillStyle = sh('#6B4631', 1); g.fillRect(cx + cw * .2, PH - gf * .4, cw * .6, 6); g.fillStyle = night ? '#FFD27A' : '#E8D9A8'; g.beginPath(); g.arc(cx + cw * .5, PH - gf * .62, 4, 0, 7); g.fill(); } // [181] ガラス戸の奥の帳場と電気スタンド
    g.fillStyle = sh(['#2E4A3A', '#5C2A2A', '#2F3E5C'][variant % 3], 1); g.fillRect(0, PH - gf * .78, PW, 7); g.fillStyle = 'rgba(255,255,255,.2)'; for (let x = 0; x < PW; x += 9) g.fillRect(x, PH - gf * .78, 4, 7); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, PH - gf * .78 + 7, PW, 3); // [182] 店先の布のひさし
    { const tx = 6, ty = PH - gf * .3, tw = PW * .45; g.fillStyle = sh('#8A6A48', 1); g.beginPath(); g.moveTo(tx, ty + 18); g.lineTo(tx + tw, ty + 18); g.lineTo(tx + tw - 4, ty); g.lineTo(tx + 4, ty); g.closePath(); g.fill(); for (let x = tx + 6; x < tx + tw - 6; x += 3.5) { g.fillStyle = sh(['#C8463C', '#355F86', '#E9E2D5', '#8A5530', '#C9962F', '#5F9E5A'][(r() * 6) | 0], 1); g.save(); g.translate(x, ty + 2); g.rotate(-.2); g.fillRect(0, 0, 3, 12); g.restore(); } g.fillStyle = sh('#5A4028', 1); g.fillRect(tx + 6, ty + 18, 3, PH - ty - 18); g.fillRect(tx + tw - 9, ty + 18, 3, PH - ty - 18); } // [176] 店先の均一台（ななめに立てた本）
    { const sx = 8, sy = PH - gf * .3 - 22; g.fillStyle = sh('#F4EEDF', 1); g.fillRect(sx, sy, 34, 14); g.fillStyle = '#C8463C'; g.font = `900 ${Math.round(P * .32)}px ${FAC_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('均一 100円', sx + 17, sy + 7, 32); } // [179] 手書きの値札
    if (PH > gf + 30) { const vx = PW - 18, vy = PH - gf - 4 * P; g.fillStyle = sh('#3B2A20', 1); g.fillRect(vx, Math.max(4, vy), 14, 3 * P); g.fillStyle = '#FBF6EE'; g.font = `900 ${Math.round(P * .55)}px ${FAC_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('古', vx + 7, Math.max(4, vy) + P * .8); g.fillText('書', vx + 7, Math.max(4, vy) + P * 2); } // [180] 2 階のたての看板「古書」
    if (night && variant % 3 === 2) { g.fillStyle = sh('#9AA0A6', 1.6); g.fillRect(4, PH - gf * .72, PW * .55, gf * .32); g.fillStyle = 'rgba(0,0,0,.15)'; for (let y = PH - gf * .72; y < PH - gf * .4; y += 3) g.fillRect(4, y, PW * .55, 1); } // [183] 夜：シャッターを半分下ろした店
  },
  market(g, r, PW, PH, w, h, night, variant, mood) { /* 2026-11-17 景色 153〜165：市場・商店街の店（前は、色の四角がならぶだけだった） */
    const P = FAC_P, gf = Math.min(PH, 2.8 * P), y0 = PH - gf, fish = mood === 'tsukiji', k0 = night ? .5 : 1, sh = (c, m) => shadeHex(c, m * k0);
    const wall = ['#C9BFAE', '#B8B2A6', '#D6CDBF', '#A9A398'][variant % 4]; g.fillStyle = sh(wall, 1); g.fillRect(0, 0, PW, y0);
    if (variant % 2) { for (let x = 0; x < PW; x += 6) { g.fillStyle = x % 12 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.1)'; g.fillRect(x, 0, 3, y0); } } // [161] 2 階のトタンの壁（波板）
    if (PH > gf + 24) { for (let x = 6; x < PW - 14; x += 30) { const wy = Math.max(4, y0 - 52); g.fillStyle = sh('#6B4A30', 1); g.fillRect(x - 3, wy - 3, 24, 32); winPane(g, r, x, wy, 18, 26, night, { frame: 'rgba(80,55,35,.9)' }); } } // [161] 古い木の窓わく
    g.fillStyle = night ? '#3A3226' : '#2A2622'; g.fillRect(0, y0, PW, gf); // 店の奥
    for (let x = 10; x < PW - 10; x += 34) { g.fillStyle = night ? '#FFFFFF' : '#E8EEF0'; g.fillRect(x, y0 + 16, 24, 2.5); if (night) { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - 6, y0 + 12, 36, 10); } } // [153] 天井の蛍光灯
    for (let row = 0; row < 3; row++) { g.fillStyle = sh('#7A5A3A', .8 + row * .1); g.fillRect(0, y0 + 26 + row * 8, PW, 3); for (let x = 3; x < PW - 3; x += 5) { g.fillStyle = sh(['#C8463C', '#F2C230', '#F3E8DA', '#5F9E5A', '#355F86'][(r() * 5) | 0], .7); g.fillRect(x, y0 + 20 + row * 8, 4, 6); } } // [153] 奥の棚
    if (night) { g.fillStyle = 'rgba(255,245,220,.22)'; g.fillRect(0, y0 + 10, PW, gf - 10); } // [163] 夜：店の中の白い明るさ
    const ty = PH - gf * .52, tb = PH - 10; { const gr = g.createLinearGradient(0, ty, 0, tb); gr.addColorStop(0, sh('#8A6440', 1.1)); gr.addColorStop(1, sh('#5A3E26', 1)); g.fillStyle = gr; g.beginPath(); g.moveTo(2, ty + 6); g.lineTo(PW - 2, ty + 6); g.lineTo(PW - 2, tb); g.lineTo(2, tb); g.closePath(); g.fill(); for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(2, ty + 6 + k * (tb - ty) / 3, PW - 4, 2); } } // [154] 品物を並べたひな壇
    if (fish) { g.fillStyle = sh('#F4F6F8', 1); g.fillRect(4, ty + 4, PW - 8, tb - ty - 6); for (let row = 0; row < 3; row++) for (let x = 8; x < PW - 14; x += 13) { const yy = ty + 10 + row * (tb - ty) / 3.2; const gr = g.createLinearGradient(0, yy - 3, 0, yy + 3); gr.addColorStop(0, sh('#4A5868', 1)); gr.addColorStop(.5, sh('#D9E0E6', 1)); gr.addColorStop(1, sh('#8A96A2', 1)); g.fillStyle = gr; g.beginPath(); g.ellipse(x + 5, yy, 6, 2.6, .1, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - 1, yy); g.lineTo(x - 4, yy - 3); g.lineTo(x - 4, yy + 3); g.fill(); } } // [155] 氷の上に並ぶ銀色の魚
    else { for (let row = 0; row < 3; row++) for (let x = 6; x < PW - 8; x += 9) { const yy = ty + 10 + row * (tb - ty) / 3.2, c = ['#E86A75', '#F2C230', '#F08A2E', '#5F9E5A', '#C8463C', '#B5D86A', '#8A5530'][(r() * 7) | 0]; if (r() < .3) { g.fillStyle = sh('#E9E2D5', 1); g.fillRect(x - 3, yy - 4, 8, 9); g.fillStyle = sh(c, 1); g.fillRect(x - 2, yy - 1, 6, 4); } else { const gr = g.createRadialGradient(x - 1, yy - 2, .5, x, yy, 4.5); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(.3, sh(c, 1.1)); gr.addColorStop(1, sh(c, .7)); g.fillStyle = gr; g.beginPath(); g.arc(x, yy, 4, 0, 7); g.fill(); } } } // [155] 丸い果物・乾物の袋
    for (let x = 10; x < PW - 20; x += 26 + r() * 10) { const yy = ty + 4 + ((r() * 3) | 0) * (tb - ty) / 3.2; g.fillStyle = '#FFE24A'; g.fillRect(x, yy, 12, 7); g.fillStyle = '#C8463C'; g.fillRect(x + 2, yy + 2, 8, 1.5); g.fillRect(x + 2, yy + 4.5, 5, 1.2); } // [156] 黄色い値札
    { const x = variant % 2 ? 2 : PW - 16; g.fillStyle = sh('#F4F4F2', 1); g.fillRect(x, PH - 15, 14, 7); g.fillRect(x + 1, PH - 22, 13, 7); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x, PH - 15, 14, 1); g.fillRect(x + 1, PH - 22, 13, 1); } // [160] 発泡スチロールの箱の積み重ね
    g.fillStyle = sh('#6E6E6E', 1); g.fillRect(0, y0 - 8, PW, 8); g.fillStyle = 'rgba(0,0,0,.2)'; for (let x = 0; x < PW; x += 4) g.fillRect(x, y0 - 8, 1, 8); // [159] シャッターの巻き上げの箱
    const col = ['#C8463C', '#F2C230', '#355F86', '#E86A75', '#4A7AB0'][(r() * 5) | 0]; g.fillStyle = sh(col, 1); g.beginPath(); g.moveTo(0, y0); g.lineTo(PW, y0); g.lineTo(PW, y0 + 10); g.lineTo(0, y0 + 10); g.fill(); if (variant % 3 === 0) { g.fillStyle = 'rgba(255,255,255,.35)'; for (let x = 0; x < PW; x += 10) g.fillRect(x, y0, 5, 10); } else { g.fillStyle = 'rgba(0,0,0,.15)'; for (let x = 0; x < PW; x += 5) g.fillRect(x, y0, 1, 10); } g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y0 + 10, PW, 3); // [158] しまのテント・トタンのひさし
    { const MW = MARKET_MOOD[mood] || MARKET_WORDS; const bx = 4, bw = PW - 8, by = y0 - 26; g.fillStyle = sh('#8A6A48', 1); g.fillRect(bx, by, bw, 16); g.fillStyle = 'rgba(255,255,255,.1)'; for (let y = by + 2; y < by + 16; y += 3) g.fillRect(bx, y, bw, 1); signText(g, MW[(r() * MW.length) | 0], bx + 4, by + 1, bw - 8, 14, '#FBF6EE', null); } // [162] 木の板の看板
    for (let x = 14; x < PW - 8; x += 30) { g.strokeStyle = '#2B2B2B'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y0 + 13); g.lineTo(x, y0 + 22); g.stroke(); if (night) { g.save(); g.shadowColor = '#FFC060'; g.shadowBlur = 10; g.fillStyle = '#FFE8B0'; g.beginPath(); g.arc(x, y0 + 25, 3.5, 0, 7); g.fill(); g.restore(); } else { g.fillStyle = 'rgba(240,240,230,.9)'; g.beginPath(); g.arc(x, y0 + 25, 3, 0, 7); g.fill(); } } // [157] 店先の裸電球（夜は光る）
    if (variant % 4 === 1) { const nc = ['#2F3E5C', '#C8463C', '#E9E2D5'][(r() * 3) | 0]; for (let x = PW * .55; x < PW * .9; x += 9) { g.fillStyle = sh(nc, 1); g.fillRect(x, y0 + 13, 8, gf * .28); } } // [165] 店先の日よけ布
    if (fish) { g.fillStyle = 'rgba(200,215,225,.25)'; g.fillRect(0, PH - 6, PW, 6); g.fillStyle = 'rgba(255,255,255,.25)'; for (let x = 6; x < PW; x += 18) g.fillRect(x, PH - 4, 8, 1.5); } // [164] 水をまいた、ぬれた床
    else { g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, PH - 6, PW, 6); }

  },
};

/* ---- the renderer side: draw the wall's texture in perspective strips ---- */
const FS = new Float32Array(12);
function drawFacadeTex(w, dist) { /* [R16] 夕方：昼の絵と夜の絵を少しずつ入れかえる（前は一瞬で切りかわり、窓の明かりが急に全部ついた） */
  const n = LT.night; if (n > .27 && n < .43 && dist < 70) { drawFacImg(w, dist, false, 1); drawFacImg(w, dist, true, (n - .27) / .16); return; }
  drawFacImg(w, dist, n > .35, 1);
}
function drawFacImg(w, dist, night, aMul) {
  const img0 = facadeTex(w.st, w.fv, w.fw, w.fh, night, w.fm, dist > 18 ? 1 : 0); /* [R6] 近くの壁は、その場で必ず描く（間に合わない時に簡単な絵へ切りかわり、目の前で絵が変わった） */
  if (!img0 || !img0.width) return aMul < 1 ? null : facade(w, dist);
  let img = night ? img0 : litSprite(img0, LT.amb);
  const lq = typeof lowQ !== 'undefined' ? lowQ : 0; // the light mode keeps every building front, just in fewer, cheaper strips
  const v = w.v; let IW = img.width, IH = img.height;
  // world corners: A0 bottom-a, B0 bottom-b, B1 top-b, A1 top-a; camera depth is linear along the wall
  const C = [[v[0], v[1], v[2]], [v[3], v[4], v[5]], [v[6], v[7], v[8]], [v[9], v[10], v[11]]];
  for (let i = 0; i < 4; i++) tc(C[i][0], C[i][1], C[i][2], FS, i * 3);
  const zA = Math.min(FS[2], FS[11]), zB = Math.min(FS[5], FS[8]), ZN = NEAR + .05;
  if (zA < ZN && zB < ZN) return;
  // the part of the wall in front of the camera, as a range of u (0 = a end, 1 = b end)
  let ua = 0, ub = 1;
  if (zA < ZN) ua = (ZN - zA) / (zB - zA); else if (zB < ZN) ub = (ZN - zA) / (zB - zA);
  ua = clamp(ua, 0, 1); ub = clamp(ub, 0, 1); if (ub - ua < .002) return;
  const za = lerp(zA, zB, ua), zb = lerp(zA, zB, ub), ratio = Math.max(za, zb) / Math.max(.3, Math.min(za, zb));
  { const ppx = FOCAL / Math.max(.5, Math.min(za, zb)) / FAC_P; img = facMip(img, ppx); IW = img.width; IH = img.height; } /* [R2] 遠くの壁は、前もって小さくした絵で（大きい絵を小さく縮めると、窓がちらちら・ざらざらになった） */
  // columns follow the depth change (the near end of a long wall would swim with one affine map); rows follow screen height
  const cols = clamp(Math.ceil(Math.log2(ratio) * (lq ? .9 : 1.7)), 1, lq ? 3 : 8); /* [R3] 遠くても、ななめに長く見える壁は細かく分けて貼る（1 枚で貼ると絵がゆがんで泳いだ） */
  /* 2026-11-18 オーナー「曲がり角に近づくと、かべのビルの絵が上の方へ不自然に上がっていく」：高いかべを縦 4 段までしか分けずに貼っていたので、
     近づくと（カメラは少し下を向いているので）上ほど遠くなり、1 段の中で絵がずれて「上へすべる」ように見えた。上と下の遠さのちがいと、画面の高さから段の数を決める */
  const vz = (() => { const m = (ua + ub) / 2, bx = lerp(C[0][0], C[1][0], m), by = lerp(C[0][1], C[1][1], m), bz = lerp(C[0][2], C[1][2], m), tx = lerp(C[3][0], C[2][0], m), ty = lerp(C[3][1], C[2][1], m), tz = lerp(C[3][2], C[2][2], m); tc(bx, by, bz, FS, 0); tc(tx, ty, tz, FS, 3); const z0 = Math.max(NEAR, FS[2]), z1 = Math.max(NEAR, FS[5]); return [Math.max(z0, z1) / Math.min(z0, z1), Math.abs(FS[1] / z0 - FS[4] / z1) * FOCAL]; })();
  const rows = clamp(Math.ceil(Math.log2(vz[0]) * (lq ? 4 : 7)) + Math.ceil(vz[1] / (lq ? 260 : 150)), 1, lq ? 6 : 12), noClip = dist > (lq ? 12 : 30) && ua === 0 && ub === 1;
  const P = (u, t) => { const bx = lerp(C[0][0], C[1][0], u), by = lerp(C[0][1], C[1][1], u), bz = lerp(C[0][2], C[1][2], u), tx = lerp(C[3][0], C[2][0], u), ty = lerp(C[3][1], C[2][1], u), tz = lerp(C[3][2], C[2][2], u); return [lerp(bx, tx, t), lerp(by, ty, t), lerp(bz, tz, t)]; };
  const sx = [0, 0, 0, 0], sy = [0, 0, 0, 0];
  const fa = (1 - fogK(dist) * .92) * aMul; if (fa < .03) return; ctx.globalAlpha = fa; /* [R1] 遠くの壁の絵も、もやの濃さに合わせてうすく（前は 75m で急に簡単な絵、95m で無地に変わり「途中で消える」ように見えた） */
  for (let ci = 0; ci < cols; ci++) {
    const uL = lerp(ua, ub, ci / cols), uR = lerp(ua, ub, (ci + 1) / cols);
    const tu0 = (w.fu0 + (w.fu1 - w.fu0) * uL) * IW, tu1 = (w.fu0 + (w.fu1 - w.fu0) * uR) * IW, tw = tu1 - tu0; if (Math.abs(tw) < .3) continue;
    for (let k = 0; k < rows; k++) {
      const t0 = k / rows, t1 = (k + 1) / rows, q = [P(uL, t0), P(uR, t0), P(uR, t1), P(uL, t1)];
      let ok = true; for (let i = 0; i < 4; i++) { tc(q[i][0], q[i][1], q[i][2], FS, i * 3); const z = FS[i * 3 + 2]; if (z < NEAR) { ok = false; break; } sx[i] = W / 2 + FS[i * 3] * FOCAL / z; sy[i] = HORIZON - FS[i * 3 + 1] * FOCAL / z; }
      if (!ok) continue;
      const f0 = w.fy0 || 0, f1 = w.fy1 == null ? 1 : w.fy1, ty1 = IH * (1 - (f0 + (f1 - f0) * t0)), ty0 = IH * (1 - (f0 + (f1 - f0) * t1)), th = ty1 - ty0; if (th < .3) continue; /* [R4] 段ごとの壁には、絵の縦の一部だけを貼る（1 階・基壇・塔） */
      const a = (sx[1] - sx[0]) / tw, b = (sy[1] - sy[0]) / tw, c = (sx[3] - sx[0]) / th, d = (sy[3] - sy[0]) / th;
      ctx.save();
      if (!noClip) { // a hair of overlap hides the seams between cells
        const cx = (sx[0] + sx[1] + sx[2] + sx[3]) / 4, cy = (sy[0] + sy[1] + sy[2] + sy[3]) / 4; ctx.beginPath();
        for (let i = 0; i < 4; i++) { const dx = sx[i] - cx, dy = sy[i] - cy, L = Math.hypot(dx, dy) || 1, e = .6 / L; i ? ctx.lineTo(sx[i] + dx * e, sy[i] + dy * e) : ctx.moveTo(sx[i] + dx * e, sy[i] + dy * e); }
        ctx.closePath(); ctx.clip(); }
      ctx.transform(a, b, -c, -d, sx[0] - a * tu0 + c * ty1, sy[0] - b * tu0 + d * ty1); // texture y grows downward, the wall's v grows upward
      const ux = Math.min(tu0, tu1), uw = Math.abs(tw);
      ctx.drawImage(img, ux, ty0, uw, th, ux, ty0, uw, th);
      if (PROF.on) PROF.strips = (PROF.strips || 0) + 1;
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
}
const FAC_MIP = new WeakMap();
function facMip(img, ppx) { if (ppx > .55 || !img || img.width < 64) return img; let m = FAC_MIP.get(img); if (!m) { m = []; FAC_MIP.set(img, m); }
  const lv = ppx > .28 ? 0 : 1; if (!m[lv]) { const src = lv ? facMip(img, .4) : img, c = document.createElement('canvas'); c.width = Math.max(8, src.width >> 1); c.height = Math.max(8, src.height >> 1); const g = c.getContext('2d'); if (!g) return img; g.imageSmoothingQuality = 'high'; g.drawImage(src, 0, 0, c.width, c.height); c.__half = (lv + 1); m[lv] = c; }
  return m[lv]; }

const SPR_PEND = {};
const SPR_FN = {}; // how each late-painted picture is made, kept so that it can be painted again (picRepairAll)
const SPR_OFF = new Set(); // pictures let go to save memory (painted again only when a street that uses them comes near)
function sprPaint(k) { const f = SPR_PEND[k]; if (!f) return SPR[k]; delete SPR_PEND[k]; SPR_FN[k] = f; SPR_OFF.delete(k); const low = CANVAS_LOW; try { SPR[k] = f(); if (CANVAS_LOW !== low) { delete SPR[k]; SPR_PEND[k] = f; return null; } /* out of picture memory: painted again later, not kept blank */ if (SPR[k] && !SPR[k].__keep) { SPR[k].__keep = 1; ART_KEPT++; } } catch (e) { } return SPR[k]; }
/* 長く走ると、通った場所の家具・看板などの絵がたまり続けていた（8日目に「ここで一区切り」で終わった報告 2026-11-12。
   スマホで 7日目→13日目に絵の合計が 25→50 Mpx と増え続け、iPhone の絵のメモリが足りなくなって描けなくなる）。
   スマホでは、今の道と先の道で使っていない絵を手放し、また通ったら描き直す。 */
const SPR_MAXPX = FAC_PHONE ? 6e6 : 24e6;
function sprTrim(maxPx) {
  maxPx = maxPx == null ? SPR_MAXPX : maxPx; let px = 0; const ks = [];
  for (const k in SPR) { if (k.slice(0, 3) !== 'pa|') continue; const c = SPR[k]; if (c && c.width) { px += c.width * c.height; ks.push(k); } }
  if (px <= maxPx) return 0;
  const live = new Set(); for (const sg of (G.segs || []).concat(G.fork || [])) { if (!sg) continue; for (const q of sg.spr || []) live.add(q.img); for (const pr of sg.props || []) for (const q of pr.spr || []) live.add(q.img); }
  let n = 0;
  for (const k of ks) {
    if (px <= maxPx * .7) break;
    if (live.has(k) || live.has(k.replace(/N$/, '')) || !SPR_FN[k]) continue;
    const c = SPR[k]; delete SPR[k]; SPR_PEND[k] = SPR_FN[k]; SPR_OFF.add(k); px -= c.width * c.height; n++;
    for (const [ak, av] of ART_C) if (av === c) { ART_C.delete(ak); break; }
    if (c.__keep) { ART_KEPT = Math.max(0, ART_KEPT - 1); c.__keep = 0; }
    if (typeof TINT_CACHE !== 'undefined') TINT_CACHE.delete(c); // no size change: a picture still held somewhere must stay drawable (picRepairAll); the memory goes once nothing holds it
  }
  return n;
}
// idle time: paint the fronts of the streets ahead (and their lit copies) before they come round the corner
function texWarm(ms) {
  const end = performance.now() + Math.max(1.5, ms); const night = LT.night > .35;
  let near = null; if (SPR_OFF.size) { near = new Set(); for (const sg of G.segs.slice(G.ci, G.ci + 3).concat(G.fork || [])) { if (!sg) continue; for (const q of sg.spr || []) { near.add(q.img); near.add(q.img + 'N'); } for (const pr of sg.props || []) for (const q of pr.spr || []) { near.add(q.img); near.add(q.img + 'N'); } } }
  for (const k in SPR_PEND) { if (near && SPR_OFF.has(k) && !near.has(k)) continue; sprPaint(k); if (performance.now() > end) return; } // a picture let go is painted again only when its street comes near
  const list = G.segs.slice(G.ci, G.ci + (FAC_PHONE ? 2 : 3)).concat(G.fork || []); // only what can come into view soon (warming further ahead pushed the current street out of the phone's cache)
  for (const sg of list) { if (!sg || !sg.walls) continue;
    for (const w of sg.walls) { if (w.pat !== 'fac' || w.fv == null) continue;
      const img0 = facadeTex(w.st, w.fv, w.fw, w.fh, night, w.fm); if (!night) litSprite(img0, LT.amb, 1);
      if (performance.now() > end) return; } }
  for (const sg of list) { if (!sg || !sg.props || sg.fcDone) continue; for (const pr of sg.props) { if (pr.fc) continue; pr.fc = []; for (const b of pr.bx) for (const fc of boxFaces(sg, b, 0, 0, 0)) pr.fc.push([fc, b]); if (performance.now() > end) return; } sg.fcDone = 1; } /* [軽く] 先の道の、物の面（箱の 6 面）を前もって作っておく（角を曲がって初めて見えた時に、まとめて作って一瞬止まっていた） */
  // then the art of the obstacles and props ahead, lit the way that stretch will be (indoors and out differ)
  const cur = G.segs[G.ci]; let swapped = false;
  try {
    for (const sg of list) { if (!sg) continue;
      if (sg !== cur) { computeLight(sg); swapped = true; } const key = LT.amb.map(x => Math.round(Math.min(1, x) * 6)).join() + (LT.night > .35 ? 'N' : '');
      if (sg.warmA === key) continue; const nt = LT.night > .35;
      for (const o of sg.obs) { const mk = o.art && ART[o.art]; if (!mk) continue; const img = mk(o, nt); if (img) litSprite(img, LT.amb, 1); if (performance.now() > end) return; }
      for (const sp of sg.spr) { const img = SPR[sp.img]; if (img && !sp.glow && sp.img !== 'glow') litSprite(img, LT.amb, 1); if (performance.now() > end) return; }
      for (const w of sg.walls) { if (w.pat !== 'fac' || w.fv == null) continue; const img0 = facadeTex(w.st, w.fv, w.fw, w.fh, nt, w.fm); if (!nt) litSprite(img0, LT.amb, 1); if (performance.now() > end) return; }
      if (sg.tid && THEMES[sg.tid] && THEMES[sg.tid].stamp) stampSprite(sg.tid);
      sg.warmA = key; }
  } finally { if (swapped && cur) computeLight(cur); }
}

// every kept picture is empty (see picCheck): the item and scenery pictures are painted again now, the late-painted ones when next needed
function picRepairAll() {
  // (their sizes are left alone: a street already built may still hold one, and drawing a picture of no size would stop the frame)
  for (const k in SPR_FN) { const c = SPR[k]; if (c) { if (c.__keep) ART_KEPT = Math.max(0, ART_KEPT - 1); delete SPR[k]; } SPR_PEND[k] = SPR_FN[k]; }
  ART_C.clear(); GRAINP = null;
  TINT_CACHE.clear(); CLOUD_SPR.length = 0; for (const k in STAMP_CACHE) delete STAMP_CACHE[k];
  buildItemSprites(); buildWorldSprites();
  if (FTEX.asphalt) { for (const k in FTEX) delete FTEX[k]; buildFloorTex(); }
}
