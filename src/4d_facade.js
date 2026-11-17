/* ================= building facades as textures =================
   Each building front is painted once into an offscreen canvas (windows, frames, balconies, signs, grime),
   with the wall itself left transparent so the building's own color shows through. The renderer then maps
   the texture onto the wall in perspective strips. This replaces hundreds of per-frame polygon fills with a
   handful of drawImage calls, and gives the fronts far more detail than the old per-quad painting. */
const FAC_P = 20; // texture pixels per world unit
const FAC_CACHE = new Map(); let FAC_N = 0, FAC_PX = 0;
const FAC_PHONE = navigator.maxTouchPoints >= 1 && Math.min(screen.width, screen.height) < 820, FAC_MAXN = FAC_PHONE ? 140 : 190, FAC_MAXPX = FAC_PHONE ? 8e6 : 14e6; // phones run out of canvas memory first
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
  const ks = Math.min(1, 700 / PH, 320 / PW); c.width = Math.max(8, Math.round(PW * ks)); c.height = Math.max(8, Math.round(PH * ks)); // tall towers are painted at a lower resolution
  const g = c.getContext('2d') || noCtx(), r = rnd(variant * 131 + 7 + Math.round(w * 3) + Math.round(h * 5)); if (g === NOCTX) return null; g.scale(c.width / PW, c.height / PH);
  // the texture's y runs top-down, the wall's v runs bottom-up: flip so v=0 (street level) is at the bottom
  const paint = FAC_STYLE[st] || FAC_STYLE.mixed;
  paint(g, r, PW, PH, w, h, night, variant, mood || '');
  // weathering: a dark wash at the base, a lighter cap at the top, a faint vertical streak or two
  const gr = g.createLinearGradient(0, PH, 0, PH - 1.6 * FAC_P); gr.addColorStop(0, 'rgba(40,32,28,.22)'); gr.addColorStop(1, 'rgba(40,32,28,0)'); g.fillStyle = gr; g.fillRect(0, PH - 1.6 * FAC_P, PW, 1.6 * FAC_P);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, PW, 2);
  for (let i = 0; i < 2; i++) if (r() < .5) { const x = r() * PW; const sg = g.createLinearGradient(0, 0, 0, PH * .6); sg.addColorStop(0, 'rgba(30,30,30,.16)'); sg.addColorStop(1, 'rgba(30,30,30,0)'); g.fillStyle = sg; g.fillRect(x, 0, 2 + r() * 2, PH * .6); }
  const px = c.width * c.height; FAC_PX += px; FAC_CACHE.set(key, { c, n: ++FAC_N, px }); return c;
}
/* shared pieces */
const FAC_GLASS = ['#6E8EA8', '#5E7C97', '#7F9FB8', '#8AA7BE'];
function winPane(g, r, x, y, w, h, night, o) {
  o = o || {};
  if (night) { const v = r(); if (v < .55) { g.fillStyle = r() < .75 ? `rgb(255,${225 + (r() * 20) | 0},${160 + (r() * 40) | 0})` : '#DCE8F2'; g.fillRect(x, y, w, h); // lit room
      g.fillStyle = 'rgba(0,0,0,.18)'; if (r() < .5) g.fillRect(x + w * .55, y, w * .45, h); if (r() < .4) g.fillRect(x, y + h * .7, w, h * .3); }
    else { g.fillStyle = v < .8 ? '#2A3548' : '#1B2333'; g.fillRect(x, y, w, h); } }
  else { // daytime: sky reflected in the upper part, the dark room below
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, o.sky || '#9FBBD2'); gr.addColorStop(.55, FAC_GLASS[(r() * 4) | 0]); gr.addColorStop(1, '#3E5468'); g.fillStyle = gr; g.fillRect(x, y, w, h);
    if (r() < .25) { g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x, y, w * .3, h); } // a curtain
    if (r() < .18) { g.fillStyle = 'rgba(240,235,220,.9)'; g.fillRect(x + 1, y + h * .35, w - 2, h * .65); } // a blind
  }
  g.fillStyle = o.frame || 'rgba(60,60,64,.9)'; g.lineWidth = 1; g.strokeStyle = o.frame || 'rgba(60,60,64,.9)'; g.strokeRect(x + .5, y + .5, w - 1, h - 1);
  if (!o.noMullion && w > 14) { g.fillRect(x + w / 2 - .5, y, 1, h); }
  g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x, y, w, 1.5); // the lintel's shadow
}
function balcony(g, r, x, y, w, night) { // railing in front of a floor
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x, y, w, 3);
  g.fillStyle = 'rgba(235,235,230,.85)'; g.fillRect(x, y - 16, w, 2); for (let k = 0; k < w; k += 5) g.fillRect(x + k, y - 16, 1, 16);
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x, y - 16, w, 16);
  if (r() < .5) { g.fillStyle = r() < .5 ? '#E9EDF0' : '#C8D2DA'; g.fillRect(x + w * .1 + r() * w * .5, y - 15, 9, 10); } // laundry / a box
}
function acUnit(g, x, y) { g.fillStyle = '#D9DCDF'; g.fillRect(x, y, 10, 7); g.fillStyle = '#9AA0A6'; g.fillRect(x + 2, y + 1, 6, 5); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x, y + 7, 10, 2); }
function slabLine(g, PW, y) { g.fillStyle = 'rgba(0,0,0,.13)'; g.fillRect(0, y, PW, 2); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, y - 1, PW, 1); }
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
  const H = y1 - y0, glassTop = y0 + H * .28, awnH = H * .14;
  // display window with interior
  g.fillStyle = night ? '#FFF0CC' : '#2E3A46'; g.fillRect(4, glassTop, PW - 8, y1 - glassTop - 3);
  if (!night) { const gr = g.createLinearGradient(0, glassTop, 0, y1); gr.addColorStop(0, 'rgba(170,200,225,.75)'); gr.addColorStop(.6, 'rgba(120,150,175,.35)'); gr.addColorStop(1, 'rgba(40,50,60,0)'); g.fillStyle = gr; g.fillRect(4, glassTop, PW - 8, y1 - glassTop - 3); }
  // shelves / people inside
  for (let k = 0; k < 4 + r() * 4; k++) { g.fillStyle = ['#E86A75', '#F2C230', '#4E77A0', '#5F9E5A', '#F08A2E', '#FBF6EE'][(r() * 6) | 0]; g.globalAlpha = night ? .9 : .55; g.fillRect(8 + r() * (PW - 24), glassTop + 8 + r() * (y1 - glassTop - 26), 6 + r() * 8, 6 + r() * 10); } g.globalAlpha = 1;
  // door
  const dx = PW * (.25 + r() * .5); g.fillStyle = 'rgba(30,30,36,.85)'; g.fillRect(dx - 9, glassTop + 3, 18, y1 - glassTop - 6); g.fillStyle = night ? 'rgba(255,240,200,.75)' : 'rgba(120,150,175,.5)'; g.fillRect(dx - 7, glassTop + 5, 14, y1 - glassTop - 14);
  // frame & mullions
  g.strokeStyle = 'rgba(40,40,44,.9)'; g.lineWidth = 2; g.strokeRect(4, glassTop, PW - 8, y1 - glassTop - 3); for (let x = 4 + 28; x < PW - 8; x += 28) g.fillRect(x, glassTop, 1.5, y1 - glassTop - 3);
  // awning with sign
  const col = awningCols[(r() * awningCols.length) | 0];
  g.fillStyle = col; g.fillRect(0, glassTop - awnH, PW, awnH); g.fillStyle = 'rgba(255,255,255,.18)'; for (let x = 0; x < PW; x += 14) g.fillRect(x, glassTop - awnH, 7, awnH);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, glassTop - 2, PW, 3);
  const word = words[(r() * words.length) | 0];
  signText(g, word, 6, y0 + 2, PW - 12, glassTop - awnH - y0 - 4, night ? '#FFF6E0' : '#2B2B2B', night ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.55)');
  if (night) { g.fillStyle = 'rgba(255,230,170,.35)'; g.fillRect(0, glassTop - awnH - 2, PW, 2); }
  // step / curb
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y1 - 3, PW, 3);
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
  luxury(g, r, PW, PH, w, h, night, variant) {
    const fl = 3.2 * FAC_P, floors = Math.max(1, Math.floor(h / 3.2));
    // ground floor: tall showcase glazing
    const y0 = PH - fl * 1.25; g.fillStyle = night ? '#FFF3D8' : '#2F3D4C'; g.fillRect(6, y0, PW - 12, PH - y0 - 4);
    if (!night) { const gr = g.createLinearGradient(0, y0, 0, PH); gr.addColorStop(0, 'rgba(190,210,230,.8)'); gr.addColorStop(1, 'rgba(60,80,100,.1)'); g.fillStyle = gr; g.fillRect(6, y0, PW - 12, PH - y0 - 4); }
    for (let k = 0; k < 3; k++) { g.fillStyle = night ? ['#E86A75', '#4E77A0', '#F2C230'][k] : 'rgba(255,255,255,.35)'; g.fillRect(14 + k * (PW - 28) / 3, y0 + 20 + r() * 20, 10, 24); } // mannequins / displays
    g.fillStyle = '#B08A3E'; g.fillRect(4, y0 - 6, PW - 8, 6); g.fillRect(4, y0, 2, PH - y0 - 4); g.fillRect(PW - 6, y0, 2, PH - y0 - 4); for (let x = 6 + (PW - 12) / 3; x < PW - 8; x += (PW - 12) / 3) g.fillRect(x, y0, 2, PH - y0 - 4);
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, PH - 4, PW, 4);
    // upper floors: wide windows in a stone grid
    const cols = Math.max(1, Math.round(w / 3));
    for (let k = 1; k < floors; k++) {
      const yt = PH - fl * 1.25 - k * fl; if (yt < -fl) break;
      slabLine(g, PW, yt + fl * .12);
      const ww = (PW - 8) / cols; for (let i = 0; i < cols; i++) winPane(g, r, 4 + i * ww + ww * .1, yt + fl * .22, ww * .8, fl * .62, night, { frame: 'rgba(70,60,40,.9)', sky: '#B8CEDF' });
    }
    g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(0, 0, PW, 8); g.fillStyle = '#B08A3E'; g.fillRect(0, 8, PW, 2);
    if (night) { g.fillStyle = 'rgba(255,220,160,.35)'; g.fillRect(0, y0 - 10, PW, 4); }
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
  machiya(g, r, PW, PH, w, h, night, variant) {
    g.fillStyle = '#3B2E26'; g.fillRect(0, 0, PW, PH); const gf = Math.min(PH, 3.0 * FAC_P);
    g.fillStyle = night ? '#FFD9A0' : '#5A4636'; g.fillRect(4, PH - gf + 14, PW - 8, gf - 18);
    g.fillStyle = '#2A201A'; for (let x = 6; x < PW - 6; x += 5) g.fillRect(x, PH - gf + 14, 2, gf - 18); // the lattice (koshi)
    const nx = PW * (.3 + r() * .4), nc = ['#2F3E5C', '#5C2A2A', '#2E4A3A', '#E9E2D5'][(r() * 4) | 0]; g.fillStyle = nc; for (let k = 0; k < 3; k++) g.fillRect(nx - 22 + k * 15, PH - gf + 14, 13, gf * .42);
    signText(g, MACHIYA_WORDS[(r() * MACHIYA_WORDS.length) | 0], nx - 22, PH - gf + 18, 43, 14, nc === '#E9E2D5' ? '#2B2B2B' : '#FBF6EE');
    if (night) { g.save(); g.shadowColor = '#FFB060'; g.shadowBlur = 12; g.fillStyle = '#FFE3B0'; g.beginPath(); g.ellipse(PW - 14, PH - gf + 26, 6, 9, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
    g.fillStyle = '#4A4F57'; g.fillRect(0, PH - gf, PW, 12); g.fillStyle = 'rgba(255,255,255,.18)'; for (let x = 0; x < PW; x += 7) g.fillRect(x, PH - gf, 1, 12);
    if (PH > gf + 24) { const y = PH - gf - 40; g.fillStyle = night ? '#F7D58A' : '#C9BFA8'; g.fillRect(PW * .2, y, PW * .6, 28); g.fillStyle = '#2A201A'; for (let x = PW * .2; x < PW * .8; x += 6) g.fillRect(x, y, 2, 28); g.fillStyle = '#4A4F57'; g.fillRect(0, 0, PW, 8); }
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
  },
  market(g, r, PW, PH, w, h, night, variant, mood) {
    const gf = Math.min(PH, 2.8 * FAC_P);
    g.fillStyle = night ? '#FFEFC9' : '#D6CDBF'; g.fillRect(0, PH - gf, PW, gf);
    for (let x = 4; x < PW - 8; x += 11) for (let row = 0; row < 3; row++) { g.fillStyle = ['#E86A75', '#F2C230', '#8A5530', '#5F9E5A', '#C8463C', '#F3E8DA', '#F08A2E'][(r() * 7) | 0]; g.fillRect(x, PH - gf + 14 + row * 16 + r() * 3, 9, 11); }
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, PH - 6, PW, 6);
    const col = ['#C8463C', '#F2C230', '#355F86', '#E86A75'][(r() * 4) | 0]; { const MW = MARKET_MOOD[mood] || MARKET_WORDS; signText(g, MW[(r() * MW.length) | 0], 2, PH - gf - 14, PW - 4, 14, '#FBF6EE', col); }
    g.fillStyle = col; g.fillRect(0, PH - gf, PW, 8); g.fillStyle = 'rgba(255,255,255,.3)'; for (let x = 0; x < PW; x += 8) g.fillRect(x, PH - gf, 4, 8);
    if (PH > gf + 24) { for (let x = 6; x < PW - 14; x += 24) winPane(g, r, x, PH - gf - 44, 16, 22, night); }
  },
};

/* ---- the renderer side: draw the wall's texture in perspective strips ---- */
const FS = new Float32Array(12);
function drawFacadeTex(w, dist) {
  const night = LT.night > .35, img0 = facadeTex(w.st, w.fv, w.fw, w.fh, night, w.fm, 1);
  if (!img0 || !img0.width) return facade(w, dist);
  const img = night ? img0 : litSprite(img0, LT.amb);
  const lq = typeof lowQ !== 'undefined' ? lowQ : 0; // the light mode keeps every building front, just in fewer, cheaper strips
  const v = w.v, IW = img.width, IH = img.height;
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
  // columns follow the depth change (the near end of a long wall would swim with one affine map); rows follow screen height
  const cols = dist > 30 || lq ? 1 : clamp(Math.ceil(Math.log2(ratio) * 1.6), 1, 6);
  const rows = dist > 30 || lq ? 1 : clamp(Math.ceil(80 / Math.max(4, Math.min(za, zb))), 1, 4), noClip = dist > (lq ? 12 : 30) && ua === 0 && ub === 1;
  const P = (u, t) => { const bx = lerp(C[0][0], C[1][0], u), by = lerp(C[0][1], C[1][1], u), bz = lerp(C[0][2], C[1][2], u), tx = lerp(C[3][0], C[2][0], u), ty = lerp(C[3][1], C[2][1], u), tz = lerp(C[3][2], C[2][2], u); return [lerp(bx, tx, t), lerp(by, ty, t), lerp(bz, tz, t)]; };
  const sx = [0, 0, 0, 0], sy = [0, 0, 0, 0];
  for (let ci = 0; ci < cols; ci++) {
    const uL = lerp(ua, ub, ci / cols), uR = lerp(ua, ub, (ci + 1) / cols);
    const tu0 = (w.fu0 + (w.fu1 - w.fu0) * uL) * IW, tu1 = (w.fu0 + (w.fu1 - w.fu0) * uR) * IW, tw = tu1 - tu0; if (Math.abs(tw) < .3) continue;
    for (let k = 0; k < rows; k++) {
      const t0 = k / rows, t1 = (k + 1) / rows, q = [P(uL, t0), P(uR, t0), P(uR, t1), P(uL, t1)];
      let ok = true; for (let i = 0; i < 4; i++) { tc(q[i][0], q[i][1], q[i][2], FS, i * 3); const z = FS[i * 3 + 2]; if (z < NEAR) { ok = false; break; } sx[i] = W / 2 + FS[i * 3] * FOCAL / z; sy[i] = HORIZON - FS[i * 3 + 1] * FOCAL / z; }
      if (!ok) continue;
      const ty1 = IH * (1 - t0), ty0 = IH * (1 - t1), th = ty1 - ty0; if (th < .3) continue;
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
}

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
