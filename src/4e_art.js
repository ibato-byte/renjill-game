/* ================= illustrated obstacles =================
   The things that run at you (cars, scooters, bikes) and the common street obstacles are painted once
   as front-view illustrations (shading, glass, lights) and drawn as billboards, instead of as boxes.
   The boxes stay as the collision shape. Everything is generic: no badges, no brand shapes. */
const ART_C = new Map();
const ART_MAX = (navigator.maxTouchPoints >= 1 && Math.min(screen.width, screen.height) < 820) ? 120 : 260;
let ART_SOFT = 0, ART_KEPT = 0; // set while drawing something far away: a picture not painted yet waits for idle time instead
function artCanvas(key, w, h, paint) {
  let c = ART_C.get(key); if (c) return c;
  if (ART_SOFT && !texOK()) return null; TEXN++;
  if (ART_C.size - ART_KEPT > ART_MAX) { for (const [k0, old] of ART_C) { if (old.__keep) continue; ART_C.delete(k0); try { old.width = old.height = 0; } catch (e) { } break; } } // oldest loose picture out (phones); the ones the scenery holds on to do not count
  c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d') || noCtx(); if (g === NOCTX) return null; paint(g, w, h); ART_C.set(key, c); return c;
}
// out of picture memory (see noCtx): drop every picture that is only a kept copy; each is painted again when it is next needed
function freePictures() {
  while (LIT_LIST.length) { const e = LIT_LIST.shift(); const m = LIT_CACHE.get(e.img); if (m) { if (m[e.k] === e.c) delete m[e.k]; if (m.last === e.c) m.last = null; } try { e.c.width = e.c.height = 0; } catch (x) { } } LIT_PX = 0;
  for (const v of FAC_CACHE.values()) { try { v.c.width = v.c.height = 0; } catch (x) { } } FAC_CACHE.clear(); FAC_PX = 0;
  for (const [k0, old] of [...ART_C]) { if (old.__keep) continue; ART_C.delete(k0); try { old.width = old.height = 0; } catch (x) { } }
}
const shadeHex = (hex, k) => { const c = hexRgb(hex); return `rgb(${clamp(c[0] * k, 0, 255) | 0},${clamp(c[1] * k, 0, 255) | 0},${clamp(c[2] * k, 0, 255) | 0})`; };
function rrect(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
function vgrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([t, c]) => gr.addColorStop(t, c)); return gr; }

/* ---- cars, seen from the front ---- */
/* ---- 車（正面から）。2026-11-17 オーナー：「スポーツカーや普通車のクオリティが低すぎる。現実の車をもっと参考に、30 以上のブラッシュアップを」
   前は「四角い体・台形の窓・白い楕円のライト・黒い四角の格子」だけだった。本物の車の正面のつくりを部品ごとに描く（会社のマーク・車名は出さない）。
   調べたこと（日本の道を走る車の正面）：
   ・窓（フロントガラス）は上にいくほどせまい台形で、まわりに黒いふち（セラミックの帯・ドットのぼかし）。上の方は色つき。内側にミラー・センサー・日よけ・ダッシュボード。日本の車は右ハンドル＝正面から見て左に運転する人
   ・ボンネットは空をうつして上が明るく、手前は地面の色。ボンネットとバンパー・フェンダーのあいだに細いすき間（パネルのつなぎ目）
   ・ライトは「黒い器の中に、丸いレンズ（プロジェクター）と、細い LED の光の線（昼間も光る）」。外のはしにオレンジの方向指示器
   ・格子（グリル）は、はちの巣か横の桟。まん中にレーダーの小さな四角（車のマークの代わり）
   ・バンパーの下に、黒い空気の取り入れ口と、左右のくぼみにフォグライト。いちばん下は黒い樹脂のリップ
   ・ナンバー：自家用は白地に緑の字、軽自動車は黄色地に黒い字、タクシーなど仕事の車は緑地に白い字（日本の決まり）。上に地名と番号、下にひらがなと 4 けた
   ・タイヤは正面から見ると、黒いゴムのブロックの帯。車の下は真っ暗（地面とのあいだのかげ）
   車ごとに：セダン（低く長いボンネット）／ハイブリッド（細いライト・小さな格子）／SUV（高い・黒い樹脂のふち・銀色の下のガード・屋根のレール）／
   軽（せまく背が高い・四角い）／タクシー（屋根の行灯・「空車」の赤い表示・緑のナンバー）／ワゴン車（短い鼻・大きな窓・高い屋根）。
   夜は、ライトとその光の線が光り、窓の中は暗く、ガラスに町の明かりがうつる */
const CAR_SHAPE = { // 正面の形（画面の割合）：屋根の高さ・屋根の半はば・窓の下・肩の半はば・体の半はば・ライトの高さ・バンパーの高さ・車の下
  sedan: { roofY: .13, roofH: .29, beltY: .47, beltH: .43, bodyH: .485, lightY: .555, bumpY: .7, botY: .9, glassT: .02, hood: .05, grille: 'slat', light: 'proj' },
  hybrid: { roofY: .12, roofH: .28, beltY: .48, beltH: .42, bodyH: .485, lightY: .56, bumpY: .72, botY: .9, glassT: .015, hood: .04, grille: 'hex', light: 'slim' },
  taxi: { roofY: .2, roofH: .3, beltY: .49, beltH: .43, bodyH: .48, lightY: .575, bumpY: .72, botY: .9, glassT: .02, hood: .05, grille: 'slat', light: 'round' },
  suv: { roofY: .07, roofH: .34, beltY: .43, beltH: .44, bodyH: .49, lightY: .52, bumpY: .68, botY: .86, glassT: .025, hood: .04, grille: 'big', light: 'proj', suv: 1 },
  kei: { roofY: .05, roofH: .34, beltY: .43, beltH: .38, bodyH: .4, lightY: .53, bumpY: .7, botY: .9, glassT: .02, hood: .03, grille: 'slat', light: 'round', kei: 1 },
  van: { roofY: .03, roofH: .37, beltY: .42, beltH: .4, bodyH: .44, lightY: .56, bumpY: .73, botY: .91, glassT: .03, hood: .02, grille: 'slat', light: 'proj' },
};
function carPlate(g, cx, y, w, kind, night) { // 日本のナンバー：自家用＝白に緑・軽＝黄に黒・仕事の車＝緑に白
  const h = w * .5, bg = kind === 'kei' ? '#F2D23A' : kind === 'taxi' ? '#2F7A4E' : '#F6F6EE', fg = kind === 'kei' ? '#1E1E1E' : kind === 'taxi' ? '#F6F6EE' : '#2F6E46';
  g.fillStyle = 'rgba(0,0,0,.45)'; rrect(g, cx - w / 2 - 2, y - 2, w + 4, h + 4, 4); g.fill(); // 枠
  g.fillStyle = bg; rrect(g, cx - w / 2, y, w, h, 3); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(cx - w / 2 + 2, y + 1, w - 4, h * .18); // つや
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 ${Math.round(h * .3)}px sans-serif`; g.fillText('品川 500', cx + w * .06, y + h * .26);
  g.font = `700 ${Math.round(h * .26)}px sans-serif`; g.fillText('あ', cx - w * .38, y + h * .7); g.font = `900 ${Math.round(h * .5)}px sans-serif`; g.fillText('12-34', cx + w * .08, y + h * .68);
  for (const sx of [-.36, .36]) { g.fillStyle = 'rgba(120,120,120,.8)'; g.beginPath(); g.arc(cx + w * sx, y + h * .14, h * .05, 0, 7); g.fill(); } // 留めねじ
  if (night) { g.fillStyle = 'rgba(255,255,240,.18)'; g.fillRect(cx - w / 2, y, w, h * .5); } }
function paintCar(g, W, H, col, type, night) {
  const S = CAR_SHAPE[type] || CAR_SHAPE.sedan, cx = W / 2, X = f => W * f, Y = f => H * f, metallic = !['#2B2B2B', '#F3F3F3', '#F2C230', '#2F6B4F'].includes(col);
  const roofY = Y(S.roofY), belt = Y(S.beltY), lightY = Y(S.lightY), bump = Y(S.bumpY), bot = Y(S.botY), bh = X(S.bodyH), sh = X(S.beltH), rh = X(S.roofH);
  // ①地面のかげ（車の下は真っ暗、外へやわらかく）
  { const gr = g.createRadialGradient(cx, H - 6, 4, cx, H - 6, W * .56); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(.7, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.save(); g.translate(0, H - 6); g.scale(1, .12); g.translate(0, -(H - 6)); g.beginPath(); g.arc(cx, H - 6, W * .56, 0, 7); g.fill(); g.restore(); }
  g.fillStyle = 'rgba(8,8,10,.85)'; rrect(g, cx - bh * .9, bot - 6, bh * 1.8, H - bot + 2, 6); g.fill(); // ②車の下のくらがり
  // ③タイヤ：ゴムのブロックの帯（正面から見える前輪）。タイヤの上のかげ
  for (const sd of [-1, 1]) { const tx = cx + sd * bh * .8, tw = W * (S.suv ? .15 : .13), ty = bot - Y(.07);
    g.fillStyle = vgrad(g, ty, H - 3, [[0, '#0E0F11'], [.5, '#22252A'], [1, '#0B0C0E']]); rrect(g, tx - tw / 2, ty, tw, H - 3 - ty, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1.2; for (let y = ty + 5; y < H - 6; y += 5) { g.beginPath(); g.moveTo(tx - tw * .4, y); g.lineTo(tx - tw * .1, y + 1.5); g.moveTo(tx + tw * .1, y + 1.5); g.lineTo(tx + tw * .4, y); g.stroke(); } // ブロックの溝
    g.fillStyle = 'rgba(255,255,255,.08)'; rrect(g, tx - tw / 2 + 2, ty + 2, tw * .25, H - ty - 8, 4); g.fill(); } // 横のふくらみの光
  // ④体（肩から下）：上は空をうつして明るく、下は地面の色で暗く。メタリックは細かいつぶ
  const body = () => { g.beginPath(); g.moveTo(cx - sh, belt); g.bezierCurveTo(cx - bh * .97, belt + Y(.01), cx - bh, lightY - Y(.03), cx - bh, lightY + Y(.02)); g.lineTo(cx - bh * .99, bot - Y(.04)); g.quadraticCurveTo(cx - bh * .98, bot, cx - bh * .9, bot);
    g.lineTo(cx + bh * .9, bot); g.quadraticCurveTo(cx + bh * .98, bot, cx + bh * .99, bot - Y(.04)); g.lineTo(cx + bh, lightY + Y(.02)); g.bezierCurveTo(cx + bh, lightY - Y(.03), cx + bh * .97, belt + Y(.01), cx + sh, belt); g.closePath(); };
  body(); g.fillStyle = vgrad(g, belt, bot, [[0, shadeHex(col, 1.22)], [.12, shadeHex(col, 1.08)], [.4, shadeHex(col, .96)], [.75, shadeHex(col, .8)], [1, shadeHex(col, .58)]]); g.fill();
  g.save(); body(); g.clip();
  { const hg = g.createLinearGradient(0, belt, 0, lightY); hg.addColorStop(0, 'rgba(200,225,255,.35)'); hg.addColorStop(.6, 'rgba(255,255,255,.08)'); hg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = hg; g.fillRect(0, belt, W, lightY - belt); } // ⑤ボンネットに空がうつる
  g.fillStyle = 'rgba(40,46,56,.22)'; g.beginPath(); g.moveTo(cx - bh, belt + Y(.035)); g.quadraticCurveTo(cx, belt + Y(.05), cx + bh, belt + Y(.035)); g.lineTo(cx + bh, belt + Y(.045)); g.quadraticCurveTo(cx, belt + Y(.06), cx - bh, belt + Y(.045)); g.fill(); // ⑥ボンネットにうつる町の地平線（暗い帯）
  for (const sd of [-1, 1]) { const fg = g.createRadialGradient(cx + sd * bh * .78, belt + Y(.03), 2, cx + sd * bh * .78, belt + Y(.03), W * .14); fg.addColorStop(0, 'rgba(255,255,255,.5)'); fg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = fg; g.fillRect(0, belt - Y(.05), W, Y(.2)); } // ⑦フェンダーの上のつやの点
  if (metallic) { const r = rnd(col.length * 31 + type.length); for (let i = 0; i < 260; i++) { g.fillStyle = r() < .5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.08)'; g.fillRect(cx - bh + r() * bh * 2, belt + r() * (bot - belt), 1, 1); } } // ⑧メタリックの細かい光のつぶ
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(cx - bh, bot - Y(.05), bh * 2, Y(.06)); // ⑨下のふちのかげ（地面の照り返しの少ない所）
  g.restore();
  // ⑩パネルのつなぎ目：ボンネットとフェンダー、バンパーの上
  g.strokeStyle = 'rgba(0,0,0,.32)'; g.lineWidth = 1.2; g.beginPath(); for (const sd of [-1, 1]) { g.moveTo(cx + sd * sh * .86, belt + 2); g.quadraticCurveTo(cx + sd * bh * .74, lightY - Y(.04), cx + sd * bh * .66, lightY - Y(.012)); } g.moveTo(cx - bh * .66, lightY - Y(.012)); g.quadraticCurveTo(cx, lightY - Y(.02), cx + bh * .66, lightY - Y(.012)); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1.5; g.beginPath(); for (const sd of [-1, 1]) { g.moveTo(cx + sd * sh * .5, belt + Y(.012)); g.quadraticCurveTo(cx + sd * sh * .45, lightY - Y(.06), cx + sd * sh * .36, lightY - Y(.03)); } g.stroke(); // ⑪ボンネットの 2 本のプレスライン（光）
  g.fillStyle = '#20242A'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(cx + sd * W * .06, belt + Y(.012), 2.4, 1.4, 0, 0, 7); g.fill(); } // ⑫ウォッシャーの小さな口
  // ⑬窓のまわり（屋根と柱）
  const cab = () => { g.beginPath(); g.moveTo(cx - sh * .98, belt + 1); g.lineTo(cx - rh - X(.015), roofY + Y(.03)); g.quadraticCurveTo(cx - rh + X(.01), roofY - Y(.005), cx - rh + X(.05), roofY - Y(.01)); g.lineTo(cx + rh - X(.05), roofY - Y(.01)); g.quadraticCurveTo(cx + rh - X(.01), roofY - Y(.005), cx + rh + X(.015), roofY + Y(.03)); g.lineTo(cx + sh * .98, belt + 1); g.closePath(); };
  cab(); g.fillStyle = vgrad(g, roofY, belt, [[0, shadeHex(col, 1.18)], [.2, shadeHex(col, 1.02)], [1, shadeHex(col, .86)]]); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - rh + X(.04), roofY - Y(.008)); g.lineTo(cx + rh - X(.04), roofY - Y(.008)); g.stroke(); // ⑭屋根のふちの光
  // ⑮フロントガラス：黒いふち（ドットのぼかし）→ 色つきの上の帯 → 空と町のうつりこみ → 中のダッシュボード
  const gt = roofY + Y(S.glassT + .02), gb = belt - Y(.008), gl = (t) => lerp(rh - X(.012), sh * .9, t);
  const glass = () => { g.beginPath(); g.moveTo(cx - gl(1), gb); g.lineTo(cx - gl(0), gt); g.quadraticCurveTo(cx, gt - Y(.012), cx + gl(0), gt); g.lineTo(cx + gl(1), gb); g.closePath(); };
  glass(); g.fillStyle = '#0E1115'; g.fill();
  g.save(); glass(); g.clip();
  const inset = 5; g.fillStyle = vgrad(g, gt, gb, night ? [[0, '#0B0E14'], [.6, '#141A24'], [1, '#0A0C10']] : [[0, '#3C4C5C'], [.16, '#7E9AB2'], [.5, '#A9C2D6'], [.78, '#5E7286'], [1, '#2A3440']]); g.beginPath(); g.moveTo(cx - gl(1) + inset, gb - inset); g.lineTo(cx - gl(0) + inset, gt + inset); g.lineTo(cx + gl(0) - inset, gt + inset); g.lineTo(cx + gl(1) - inset, gb - inset); g.closePath(); g.fill();
  if (!night) { g.fillStyle = 'rgba(30,50,80,.35)'; g.fillRect(0, gt, W, (gb - gt) * .16); } // 上の色つきの帯
  // 中：日よけ・ハンドル・運転する人（右ハンドル＝正面から見て左）・となりの席・ダッシュボード
  const ih = gb - gt; g.fillStyle = night ? 'rgba(0,0,0,.6)' : 'rgba(22,26,32,.6)';
  for (const sd of [-1, 1]) rrect(g, cx + sd * gl(.2) * .5 - X(.09), gt + ih * .16, X(.18), ih * .1, 3), g.fill(); // 日よけ
  g.fillStyle = night ? 'rgba(0,0,0,.7)' : 'rgba(18,22,28,.62)'; g.beginPath(); g.ellipse(cx - gl(.6) * .5, gt + ih * .5, X(.06), ih * .16, 0, 0, 7); g.fill(); g.fillRect(cx - gl(.6) * .5 - X(.085), gt + ih * .62, X(.17), ih * .3); // 運転する人
  g.beginPath(); g.ellipse(cx + gl(.6) * .5, gt + ih * .58, X(.07), ih * .2, 0, 0, 7); g.fill(); // となりの席の背もたれ
  g.strokeStyle = night ? 'rgba(0,0,0,.8)' : 'rgba(10,12,16,.75)'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx - gl(.6) * .5, gt + ih * .82, X(.055), ih * .06, 0, Math.PI, 0); g.stroke(); // ハンドル
  g.fillStyle = night ? '#07090C' : 'rgba(16,18,22,.85)'; g.fillRect(0, gb - ih * .14, W, ih * .14); // ダッシュボード
  g.fillStyle = night ? 'rgba(120,200,255,.5)' : 'rgba(255,255,255,.12)'; g.fillRect(cx - gl(.8) * .5 - X(.03), gb - ih * .12, X(.06), ih * .04); // メーターの光
  g.fillStyle = 'rgba(20,22,26,.85)'; rrect(g, cx - X(.035), gt + ih * .02, X(.07), ih * .07, 3); g.fill(); g.fillStyle = 'rgba(40,44,50,.9)'; rrect(g, cx - X(.06), gt + ih * .09, X(.12), ih * .045, 3); g.fill(); // ⑯センサーの箱とルームミラー
  if (type === 'taxi') { g.fillStyle = '#E8322A'; rrect(g, cx + gl(.85) * .5 - X(.02), gb - ih * .3, X(.12), ih * .14, 2); g.fill(); g.fillStyle = '#FFF2C8'; g.font = `900 ${Math.round(ih * .11)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('空車', cx + gl(.85) * .5 + X(.04), gb - ih * .23); } // ⑰タクシーの「空車」の表示（助手席側）
  // うつりこみ：空の明るいななめの帯と、ビルの縦のすじ
  g.fillStyle = night ? 'rgba(255,214,150,.12)' : 'rgba(255,255,255,.3)'; g.beginPath(); g.moveTo(cx + X(.06), gt); g.lineTo(cx + X(.18), gt); g.lineTo(cx - X(.02), gb); g.lineTo(cx - X(.14), gb); g.closePath(); g.fill();
  g.fillStyle = night ? 'rgba(255,214,150,.18)' : 'rgba(255,255,255,.12)'; for (let i = 0; i < 6; i++) { const x = cx - gl(.5) + (i + .4) * gl(.5) * .34; g.fillRect(x, gt + ih * .05, X(.012), ih * (.3 + (i % 3) * .1)); } // ⑱ガラスにうつるビルの縦のすじ（夜は窓の明かり）
  g.restore();
  // ⑲ガラスのふちの黒いセラミックの帯（点のぼかし）
  g.save(); glass(); g.clip(); g.strokeStyle = '#08090B'; g.lineWidth = 9; glass(); g.stroke(); g.fillStyle = 'rgba(8,9,11,.7)'; for (let x = cx - gl(.5); x < cx + gl(.5); x += 5) { g.beginPath(); g.arc(x, gt + 6.5, 1.1, 0, 7); g.fill(); } g.restore();
  // ⑳ワイパー（ガラスの下で休んでいる）
  g.strokeStyle = '#121416'; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - gl(1) * .78, gb - 2); g.lineTo(cx - X(.02), gb - Y(.02)); g.moveTo(cx + X(.03), gb - 2); g.lineTo(cx + gl(1) * .6, gb - Y(.016)); g.stroke();
  // ㉑ドアミラー：黒い付け根・体の色のカバー・方向指示器の細い光
  for (const sd of [-1, 1]) { const mx = cx + sd * (sh + X(.035)), my = belt - Y(.035);
    g.fillStyle = '#16181B'; g.beginPath(); g.moveTo(cx + sd * sh * .96, belt - Y(.005)); g.lineTo(mx - sd * X(.02), my + Y(.02)); g.lineTo(mx - sd * X(.02), my + Y(.035)); g.lineTo(cx + sd * sh * .96, belt + Y(.012)); g.fill();
    g.fillStyle = vgrad(g, my - Y(.03), my + Y(.03), [[0, shadeHex(col, 1.2)], [1, shadeHex(col, .8)]]); rrect(g, mx - X(.04), my - Y(.028), X(.08), Y(.058), [8, 8, 6, 6]); g.fill();
    g.fillStyle = night ? '#FFB24A' : 'rgba(255,170,60,.85)'; rrect(g, mx - X(.035), my + Y(.018), X(.07), Y(.008), 2); g.fill(); }
  // ㉒SUV：屋根のレール／タクシー：屋根の行灯／アンテナ
  if (S.suv) { g.fillStyle = '#1A1C1F'; for (const sd of [-1, 1]) rrect(g, cx + sd * rh * .78 - X(.015), roofY - Y(.03), X(.03), Y(.028), 3), g.fill(); g.fillStyle = '#2A2D31'; g.fillRect(cx - rh * .8, roofY - Y(.03), rh * 1.6, Y(.012)); }
  if (type === 'taxi') { const tw = X(.24), th = Y(.1), ty = roofY - th - Y(.005); g.fillStyle = '#D9D4C8'; rrect(g, cx - tw * .45, ty + th * .82, tw * .9, th * .22, 3); g.fill();
    g.fillStyle = night ? vgrad(g, ty, ty + th, [[0, '#FFF6D0'], [1, '#FFD98A']]) : vgrad(g, ty, ty + th, [[0, '#FFFDF6'], [1, '#E2DCCD']]); g.beginPath(); g.moveTo(cx - tw / 2, ty + th * .9); g.quadraticCurveTo(cx - tw / 2, ty + th * .15, cx - tw * .25, ty); g.lineTo(cx + tw * .25, ty); g.quadraticCurveTo(cx + tw / 2, ty + th * .15, cx + tw / 2, ty + th * .9); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = night ? '#5A3A10' : '#2B2B2B'; g.font = `900 ${Math.round(th * .5)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TAXI', cx, ty + th * .52); }
  else if (!S.suv) { g.fillStyle = shadeHex(col, .5); g.beginPath(); g.moveTo(cx - X(.02), roofY - Y(.008)); g.quadraticCurveTo(cx, roofY - Y(.04), cx + X(.025), roofY - Y(.008)); g.fill(); } // シャークフィンのアンテナ（うしろの方に少し）
  // ㉓ライト：黒い器・プロジェクターのレンズ・LED の光の線・オレンジの方向指示器・ガラスのつや
  const lw = X(S.light === 'slim' ? .17 : S.light === 'round' ? .15 : .19), lh = Y(S.light === 'slim' ? .045 : S.light === 'round' ? .07 : .062);
  for (const sd of [-1, 1]) { const x0 = cx + sd * bh * .9, x1 = cx + sd * (bh * .9 - lw), ly = lightY - lh * .55, xa = Math.min(x0, x1), xb = Math.max(x0, x1);
    const shape = () => { g.beginPath(); if (S.light === 'round') { g.ellipse((xa + xb) / 2, ly + lh / 2, lw / 2, lh / 2, 0, 0, 7); return; } g.moveTo(x0, ly + lh * .1); g.quadraticCurveTo(x0 + sd * X(.005), ly + lh * .85, x0 - sd * lw * .15, ly + lh); g.lineTo(x1, ly + lh * .78); g.quadraticCurveTo(x1 - sd * X(.008), ly + lh * .3, x1 + sd * X(.01), ly + lh * .05); g.closePath(); };
    shape(); g.fillStyle = '#0B0D10'; g.fill(); g.save(); shape(); g.clip();
    g.fillStyle = vgrad(g, ly, ly + lh, [[0, '#3A414A'], [.5, '#1A1E24'], [1, '#2C3138']]); g.fillRect(xa, ly, lw, lh); // 器の中のくらがり
    const lx = (xa + xb) / 2 - sd * lw * .12, lr = lh * .32; // プロジェクターのレンズ
    { const rg = g.createRadialGradient(lx - lr * .3, ly + lh * .5 - lr * .3, 1, lx, ly + lh * .5, lr); rg.addColorStop(0, night ? '#FFFFFF' : '#E9F2FA'); rg.addColorStop(.5, night ? '#FFF6D8' : '#8FA3B6'); rg.addColorStop(1, night ? '#C9B98A' : '#2A333D'); g.fillStyle = rg; g.beginPath(); g.arc(lx, ly + lh * .5, lr, 0, 7); g.fill(); g.strokeStyle = '#9AA6B2'; g.lineWidth = 1.2; g.stroke(); }
    if (S.light !== 'round') { const lx2 = lx + sd * lw * .32; g.fillStyle = night ? '#FFF8E2' : '#C3CDD6'; g.beginPath(); g.arc(lx2, ly + lh * .5, lr * .7, 0, 7); g.fill(); g.strokeStyle = '#7F8A96'; g.stroke(); } // 2 つ目のレンズ（ハイビーム）
    g.strokeStyle = night ? '#FFFFFF' : '#F4F9FF'; g.lineWidth = Math.max(2, lh * .12); g.lineCap = 'round'; g.shadowColor = night ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.5)'; g.shadowBlur = night ? 8 : 3; // LED の光の線（昼間も光る）。L 字
    g.beginPath(); g.moveTo(xa + lw * .08, ly + lh * .16); g.lineTo(xb - lw * .08, ly + lh * .16); if (S.light === 'slim') { g.moveTo(sd < 0 ? xb - lw * .1 : xa + lw * .1, ly + lh * .16); g.lineTo(sd < 0 ? xb - lw * .12 : xa + lw * .12, ly + lh * .8); } g.stroke(); g.shadowBlur = 0;
    g.fillStyle = night ? 'rgba(255,180,80,.9)' : 'rgba(255,170,60,.75)'; g.fillRect(sd < 0 ? xa : xb - lw * .12, ly + lh * .35, lw * .12, lh * .5); // 方向指示器（外のはし）
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(xa + lw * .3, ly + lh * .18, lw * .25, lh * .08, -.1, 0, 7); g.fill(); g.restore(); // ガラスのつや
    shape(); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1; g.stroke(); }
  // ㉔格子（グリル）：はちの巣／横の桟／大きな格子。まん中にレーダーの小さな四角（車のマークは出さない）
  { const gw = S.grille === 'big' ? bh * .9 : S.grille === 'hex' ? bh * .5 : bh * .62, gy = lightY - Y(.03), gh = S.grille === 'big' ? Y(.1) : S.grille === 'hex' ? Y(.035) : Y(.06);
    g.fillStyle = '#121418'; rrect(g, cx - gw / 2, gy, gw, gh, Math.min(10, gh / 2)); g.fill(); g.save(); rrect(g, cx - gw / 2, gy, gw, gh, Math.min(10, gh / 2)); g.clip();
    if (S.grille === 'slat' || S.grille === 'big') { g.strokeStyle = S.grille === 'big' ? 'rgba(170,176,184,.55)' : 'rgba(255,255,255,.16)'; g.lineWidth = S.grille === 'big' ? 3 : 2; for (let y = gy + gh / 4; y < gy + gh; y += gh / 4) { g.beginPath(); g.moveTo(cx - gw / 2, y); g.lineTo(cx + gw / 2, y); g.stroke(); } }
    else { g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1; for (let y = gy; y < gy + gh + 4; y += 5) for (let x = cx - gw / 2 + ((y / 5) % 2) * 3; x < cx + gw / 2; x += 6) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y - 2); g.lineTo(x + 6, y); g.stroke(); } }
    g.restore(); g.strokeStyle = S.grille === 'big' ? '#8A9098' : shadeHex(col, .7); g.lineWidth = 2; rrect(g, cx - gw / 2, gy, gw, gh, Math.min(10, gh / 2)); g.stroke(); // 格子のふち
    g.fillStyle = '#2A2F36'; rrect(g, cx - X(.03), gy + gh * .2, X(.06), gh * .6, 3); g.fill(); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(cx - X(.025), gy + gh * .24, X(.05), gh * .12); } // レーダーのカバー
  // ㉕バンパー：下の空気の取り入れ口・左右のくぼみとフォグライト・黒い樹脂のリップ・SUV は銀色のガード
  { const iy = bump - Y(.01), iw = bh * (S.kei ? .7 : .86), ih2 = Y(.07);
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(cx - bh * .95, iy - Y(.035)); g.quadraticCurveTo(cx, iy - Y(.05), cx + bh * .95, iy - Y(.035)); g.lineTo(cx + bh * .95, iy - Y(.03)); g.quadraticCurveTo(cx, iy - Y(.045), cx - bh * .95, iy - Y(.03)); g.fill(); // バンパーの角の光
    g.fillStyle = '#121418'; g.beginPath(); g.moveTo(cx - iw / 2, iy); g.lineTo(cx + iw / 2, iy); g.lineTo(cx + iw / 2 - X(.02), iy + ih2); g.lineTo(cx - iw / 2 + X(.02), iy + ih2); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = 1; for (let x = cx - iw / 2 + 6; x < cx + iw / 2 - 6; x += 7) { g.beginPath(); g.moveTo(x, iy + 3); g.lineTo(x, iy + ih2 - 3); g.stroke(); }
    for (const sd of [-1, 1]) { const fx = cx + sd * bh * .8; g.fillStyle = '#16181C'; rrect(g, fx - X(.05), iy - Y(.005), X(.1), Y(.05), 6); g.fill(); g.fillStyle = night ? '#FFF6D8' : '#C9D2DA'; rrect(g, fx - X(.03), iy + Y(.01), X(.06), Y(.018), 4); g.fill(); } // フォグライト
    g.fillStyle = S.suv ? '#9AA1A8' : '#1A1C20'; rrect(g, cx - bh * .92, bot - Y(.035), bh * 1.84, Y(.03), 4); g.fill(); // いちばん下のリップ／SUV は銀色のガード
    if (S.suv) { g.fillStyle = '#1C1E22'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(cx + sd * bh, lightY + Y(.02)); g.lineTo(cx + sd * bh * 1.02, bot - Y(.02)); g.lineTo(cx + sd * bh * .9, bot - Y(.02)); g.lineTo(cx + sd * bh * .93, lightY + Y(.05)); g.closePath(); g.fill(); } } // SUV の黒い樹脂のふち
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(cx - X(.012), iy + ih2 + 2, X(.024), Y(.012)); // けん引フックのふた
    carPlate(g, cx, iy + Y(.012), X(S.kei ? .165 : .18), S.kei ? 'kei' : type === 'taxi' ? 'taxi' : '', night); } // ㉖ナンバー（日本の色の決まり）
  // ㉗体のふちの光（空の反射）と、肩のかげ
  g.save(); body(); g.clip(); g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 3; body(); g.stroke(); g.restore();
  // ㉘夜：ライトの光のにじみ
  if (night) { g.globalCompositeOperation = 'lighter'; for (const sd of [-1, 1]) { const lx = cx + sd * (bh * .9 - lw / 2), gr = g.createRadialGradient(lx, lightY - lh * .1, 2, lx, lightY - lh * .1, lw * .9); gr.addColorStop(0, 'rgba(255,250,230,.6)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(lx - lw, lightY - lw, lw * 2, lw * 2); } g.globalCompositeOperation = 'source-over'; }
}
/* スポーツカー（正面）：とても低く、はばが広い。ねかせた大きな窓、くさびの形の鼻、細いつり目の LED、大きな左右の空気の取り入れ口（網）、
   まん中の口、黒いカーボンのリップ（スプリッター）、太いタイヤ、ボンネットの空気の出口、細い棒の上のミラー */
function paintSupercar(g, W, H, col, night) {
  const cx = W / 2, X = f => W * f, Y = f => H * f, bot = Y(.9), top = Y(.44), roofY = Y(.16);
  { const gr = g.createRadialGradient(cx, H - 5, 4, cx, H - 5, W * .56); gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.save(); g.translate(0, H - 5); g.scale(1, .1); g.translate(0, -(H - 5)); g.beginPath(); g.arc(cx, H - 5, W * .56, 0, 7); g.fill(); g.restore(); }
  g.fillStyle = 'rgba(6,6,8,.9)'; rrect(g, cx - X(.44), bot - 6, X(.88), H - bot + 2, 5); g.fill();
  for (const sd of [-1, 1]) { const tx = cx + sd * X(.4), tw = X(.17), ty = Y(.66); g.fillStyle = vgrad(g, ty, H - 2, [[0, '#0C0D0F'], [.5, '#202328'], [1, '#09090B']]); rrect(g, tx - tw / 2, ty, tw, H - 2 - ty, 8); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 1.2; for (let y = ty + 5; y < H - 5; y += 5) { g.beginPath(); g.moveTo(tx - tw * .42, y); g.lineTo(tx + tw * .42, y); g.stroke(); } } // 太いタイヤ（はばの広いゴムの帯）
  const body = () => { g.beginPath(); g.moveTo(cx - X(.47), bot); g.lineTo(cx - X(.49), Y(.66)); g.bezierCurveTo(cx - X(.495), Y(.52), cx - X(.44), top + Y(.02), cx - X(.32), top); g.quadraticCurveTo(cx, top + Y(.04), cx + X(.32), top); g.bezierCurveTo(cx + X(.44), top + Y(.02), cx + X(.495), Y(.52), cx + X(.49), Y(.66)); g.lineTo(cx + X(.47), bot); g.closePath(); };
  body(); g.fillStyle = vgrad(g, top, bot, [[0, shadeHex(col, 1.3)], [.25, shadeHex(col, 1.05)], [.6, shadeHex(col, .85)], [1, shadeHex(col, .5)]]); g.fill();
  g.save(); body(); g.clip();
  { const hg = g.createLinearGradient(0, top, 0, Y(.6)); hg.addColorStop(0, 'rgba(210,230,255,.45)'); hg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hg; g.fillRect(0, top, W, Y(.16)); } // ボンネットにうつる空
  for (const sd of [-1, 1]) { const fg = g.createRadialGradient(cx + sd * X(.36), top + Y(.04), 2, cx + sd * X(.36), top + Y(.04), X(.12)); fg.addColorStop(0, 'rgba(255,255,255,.6)'); fg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = fg; g.fillRect(0, top - Y(.05), W, Y(.2)); } // 盛り上がったフェンダーのつや
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, bot - Y(.06), W, Y(.07)); g.restore();
  // ボンネットのくぼみと空気の出口
  g.fillStyle = shadeHex(col, .72); g.beginPath(); g.moveTo(cx - X(.16), top + Y(.03)); g.quadraticCurveTo(cx, top + Y(.07), cx + X(.16), top + Y(.03)); g.lineTo(cx + X(.1), Y(.56)); g.quadraticCurveTo(cx, Y(.58), cx - X(.1), Y(.56)); g.closePath(); g.fill();
  g.fillStyle = '#121418'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(cx + sd * X(.06), top + Y(.06)); g.lineTo(cx + sd * X(.14), top + Y(.045)); g.lineTo(cx + sd * X(.12), top + Y(.075)); g.lineTo(cx + sd * X(.055), top + Y(.085)); g.closePath(); g.fill(); }
  // 屋根と、ねかせた大きな窓
  const cab = () => { g.beginPath(); g.moveTo(cx - X(.3), top + Y(.01)); g.bezierCurveTo(cx - X(.26), Y(.3), cx - X(.18), roofY + Y(.02), cx - X(.1), roofY); g.lineTo(cx + X(.1), roofY); g.bezierCurveTo(cx + X(.18), roofY + Y(.02), cx + X(.26), Y(.3), cx + X(.3), top + Y(.01)); g.closePath(); };
  cab(); g.fillStyle = vgrad(g, roofY, top, [[0, shadeHex(col, 1.2)], [1, shadeHex(col, .9)]]); g.fill();
  const glass = () => { g.beginPath(); g.moveTo(cx - X(.27), top); g.bezierCurveTo(cx - X(.235), Y(.31), cx - X(.16), roofY + Y(.05), cx - X(.09), roofY + Y(.03)); g.lineTo(cx + X(.09), roofY + Y(.03)); g.bezierCurveTo(cx + X(.16), roofY + Y(.05), cx + X(.235), Y(.31), cx + X(.27), top); g.closePath(); };
  glass(); g.fillStyle = night ? '#07090D' : vgrad(g, roofY, top, [[0, '#2A3846'], [.3, '#7F9AB0'], [.7, '#4C6074'], [1, '#141A20']]); g.fill();
  g.save(); glass(); g.clip(); g.strokeStyle = '#050607'; g.lineWidth = 8; glass(); g.stroke();
  g.fillStyle = 'rgba(12,14,18,.7)'; g.beginPath(); g.ellipse(cx - X(.08), Y(.33), X(.045), Y(.06), 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(cx + X(.08), Y(.34), X(.045), Y(.06), 0, 0, 7); g.fill(); // ふたりの頭（低く座る）
  g.fillStyle = night ? 'rgba(255,214,150,.15)' : 'rgba(255,255,255,.32)'; g.beginPath(); g.moveTo(cx + X(.03), roofY); g.lineTo(cx + X(.12), roofY); g.lineTo(cx - X(.04), top); g.lineTo(cx - X(.13), top); g.closePath(); g.fill(); g.restore();
  g.strokeStyle = '#111316'; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - X(.2), top - 2); g.lineTo(cx + X(.06), top - Y(.03)); g.stroke(); // 1 本のワイパー
  for (const sd of [-1, 1]) { const mx = cx + sd * X(.36), my = top - Y(.04); g.strokeStyle = '#16181B'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + sd * X(.29), top + Y(.01)); g.lineTo(mx, my + Y(.02)); g.stroke(); g.fillStyle = vgrad(g, my - Y(.03), my + Y(.03), [[0, shadeHex(col, 1.2)], [1, shadeHex(col, .75)]]); rrect(g, mx - X(.035), my - Y(.025), X(.07), Y(.05), [10, 10, 4, 4]); g.fill(); } // 細い棒の上のミラー
  // つり目の LED ライト（細いくさび形。外へいくほど上がる）
  for (const sd of [-1, 1]) { const x0 = cx + sd * X(.13), x1 = cx + sd * X(.45), y0 = Y(.535), y1 = Y(.49);
    const sh = () => { g.beginPath(); g.moveTo(x0, y0 + Y(.012)); g.lineTo(x1, y1); g.lineTo(x1 - sd * X(.01), y1 + Y(.035)); g.lineTo(x0 + sd * X(.03), y0 + Y(.035)); g.closePath(); };
    sh(); g.fillStyle = '#0B0D10'; g.fill(); g.save(); sh(); g.clip(); g.fillStyle = '#1C2026'; g.fillRect(0, y1 - 4, W, Y(.08));
    for (let k = 0; k < 3; k++) { const t = .35 + k * .2, x = lerp(x0, x1, t), y = lerp(y0, y1, t) + Y(.02); g.fillStyle = night ? '#FFFFFF' : '#DDE7F0'; g.beginPath(); g.arc(x, y, Y(.011), 0, 7); g.fill(); } // 小さなレンズが 3 つ
    g.strokeStyle = night ? '#FFFFFF' : '#F6FBFF'; g.lineWidth = 2.6; g.shadowColor = 'rgba(255,255,255,.9)'; g.shadowBlur = night ? 9 : 3; g.beginPath(); g.moveTo(x0 + sd * X(.01), y0 + Y(.012)); g.lineTo(x1 - sd * X(.01), y1 + Y(.006)); g.stroke(); g.shadowBlur = 0; g.restore(); } // 上のふちの LED の線
  // 大きな左右の空気の取り入れ口（網）・まん中の口・黒いリップ
  const intake = (pts) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
  for (const sd of [-1, 1]) { const P = [[cx + sd * X(.2), Y(.6)], [cx + sd * X(.44), Y(.57)], [cx + sd * X(.46), Y(.76)], [cx + sd * X(.24), Y(.8)]]; intake(P); g.fillStyle = '#0A0B0D'; g.fill(); g.save(); intake(P); g.clip();
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; for (let y = Y(.56); y < Y(.82); y += 5) for (let x = cx + sd * X(.2) - X(.3); x < cx + sd * X(.2) + X(.3); x += 6) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y - 2.5); g.lineTo(x + 6, y); g.stroke(); } g.restore();
    intake(P); g.strokeStyle = shadeHex(col, 1.25); g.lineWidth = 1.5; g.stroke(); g.fillStyle = shadeHex(col, .9); g.beginPath(); g.moveTo(cx + sd * X(.3), Y(.59)); g.lineTo(cx + sd * X(.33), Y(.59)); g.lineTo(cx + sd * X(.36), Y(.78)); g.lineTo(cx + sd * X(.33), Y(.785)); g.fill(); } // 口の中の縦の羽
  { const P = [[cx - X(.15), Y(.66)], [cx + X(.15), Y(.66)], [cx + X(.17), Y(.8)], [cx - X(.17), Y(.8)]]; intake(P); g.fillStyle = '#0B0C0E'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = 1.5; for (let y = Y(.69); y < Y(.79); y += 5) { g.beginPath(); g.moveTo(cx - X(.15), y); g.lineTo(cx + X(.15), y); g.stroke(); } }
  carPlate(g, cx, Y(.675), X(.13), '', night); // ナンバー（まん中の口の前）
  { g.fillStyle = '#16181B'; g.beginPath(); g.moveTo(cx - X(.47), bot - Y(.04)); g.lineTo(cx + X(.47), bot - Y(.04)); g.lineTo(cx + X(.49), bot + Y(.01)); g.lineTo(cx - X(.49), bot + Y(.01)); g.closePath(); g.fill(); // カーボンのリップ
    g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1; for (let x = cx - X(.46); x < cx + X(.46); x += 5) { g.beginPath(); g.moveTo(x, bot - Y(.035)); g.lineTo(x + 4, bot); g.stroke(); } } // 炭素の織り目
  g.save(); body(); g.clip(); g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 3; body(); g.stroke(); g.restore(); // 体のふちの光
  if (night) { g.globalCompositeOperation = 'lighter'; for (const sd of [-1, 1]) { const lx = cx + sd * X(.3), gr = g.createRadialGradient(lx, Y(.51), 2, lx, Y(.51), X(.14)); gr.addColorStop(0, 'rgba(255,250,235,.55)'); gr.addColorStop(1, 'rgba(255,245,210,0)'); g.fillStyle = gr; g.fillRect(lx - X(.15), Y(.36), X(.3), Y(.3)); } g.globalCompositeOperation = 'source-over'; }
}
/* ---- people riding toward you ---- */
function paintRider(g, W, H, shirt, pants, helmet, kind) {
  const cx = W / 2;
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(cx, H - 5, W * .3, 6, 0, 0, Math.PI * 2); g.fill();
  if (kind === 'kick') { /* the scooter itself is drawn after the rider, in front (see the end) */
  } else { // a bicycle: thin wheel, fork, basket, handlebar
    g.fillStyle = '#16181B'; rrect(g, cx - W * .03, H * .72, W * .06, H * .27, 4); g.fill();
    g.fillStyle = '#6C7A88'; g.fillRect(cx - W * .015, H * .5, W * .03, H * .26);
    g.fillStyle = '#B9C3CC'; rrect(g, cx - W * .16, H * .5, W * .32, H * .12, 4); g.fill(); g.strokeStyle = '#6C7A88'; g.lineWidth = 2; for (let x = -.14; x <= .14; x += .04) { g.beginPath(); g.moveTo(cx + W * x, H * .5); g.lineTo(cx + W * x, H * .62); g.stroke(); }
    g.fillStyle = '#2F3B47'; rrect(g, cx - W * .3, H * .45, W * .6, H * .025, 4); g.fill();
    g.fillStyle = '#FFF3D6'; rrect(g, cx - W * .04, H * .63, W * .08, H * .035, 3); g.fill();
  }
  // legs
  g.fillStyle = vgrad(g, H * .55, H * .88, [[0, shadeHex(pants, 1.1)], [1, shadeHex(pants, .7)]]);
  const legB = kind === 'kick' ? H * .82 : H * .87; rrect(g, cx - W * .14, H * .55, W * .11, legB - H * .55, 6); g.fill(); rrect(g, cx + W * .03, H * .55, W * .11, legB - H * .55, 6); g.fill();
  /* 見た目 130〜137：自転車・キックボードに乗る人。くつに底とつま先の丸み／ひざのしわ／首／えりと前のファスナー／肩のぬい目とわきのかげ／耳と、ヘルメットの下の髪／ヘルメットに通気の穴・あごひも・つや／自転車のどろよけとライトの光 */
  for (const sd of [-1, 1]) { const fx = cx + sd * W * .085; g.fillStyle = '#F3F1EC'; rrect(g, fx - W * .075, legB + H * .008, W * .15, H * .016, 2); g.fill(); g.fillStyle = vgrad(g, legB - H * .03, legB + H * .01, [[0, '#4A4A50'], [1, '#1C1C1E']]); rrect(g, fx - W * .07, legB - H * .028, W * .14, H * .04, [8, 8, 2, 2]); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(fx - W * .03, legB - H * .02, W * .06, 2);
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(fx - W * .045, H * .7); g.quadraticCurveTo(fx, H * .712, fx + W * .045, H * .7); g.stroke(); }
  if (kind !== 'kick') { g.strokeStyle = '#3A444E'; g.lineWidth = 3; g.beginPath(); g.arc(cx, H * .86, W * .06, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); const lg = g.createRadialGradient(cx, H * .647, 1, cx, H * .647, W * .12); lg.addColorStop(0, 'rgba(255,243,200,.55)'); lg.addColorStop(1, 'rgba(255,243,200,0)'); g.fillStyle = lg; g.fillRect(cx - W * .14, H * .58, W * .28, H * .13); }
  g.fillStyle = '#E2BFA4'; g.fillRect(cx - W * .035, H * .19, W * .07, H * .04);
  // body and arms reaching the handlebar
  g.fillStyle = vgrad(g, H * .2, H * .6, [[0, shadeHex(shirt, 1.15)], [1, shadeHex(shirt, .75)]]);
  rrect(g, cx - W * .2, H * .2, W * .4, H * .4, [W * .14, W * .14, 8, 8]); g.fill();
  g.strokeStyle = shadeHex(shirt, .85); g.lineWidth = W * .09; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx - W * .17, H * .27); g.quadraticCurveTo(cx - W * .3, H * .34, cx - W * .26, H * .43); g.moveTo(cx + W * .17, H * .27); g.quadraticCurveTo(cx + W * .3, H * .34, cx + W * .26, H * .43); g.stroke();
  g.fillStyle = '#F1D9C4'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(cx + sd * W * .26, H * .43, W * .045, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = shadeHex(shirt, 1.3); g.beginPath(); g.moveTo(cx - W * .07, H * .205); g.lineTo(cx, H * .25); g.lineTo(cx + W * .07, H * .205); g.lineTo(cx + W * .05, H * .2); g.lineTo(cx, H * .23); g.lineTo(cx - W * .05, H * .2); g.closePath(); g.fill();
  g.strokeStyle = shadeHex(shirt, .6); g.lineWidth = 1.4; g.beginPath(); g.moveTo(cx, H * .25); g.lineTo(cx, H * .59); g.stroke(); g.fillStyle = '#C9CDD2'; g.fillRect(cx - 1.5, H * .25, 3, H * .012);
  g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 1.5; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(cx + sd * W * .13, H * .22); g.quadraticCurveTo(cx + sd * W * .17, H * .3, cx + sd * W * .15, H * .42); g.stroke(); } g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(cx - W * .2, H * .52, W * .4, H * .08);
  g.fillStyle = '#E2BFA4'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(cx + sd * W * .1, H * .145, W * .018, H * .02, 0, 0, Math.PI * 2); g.fill(); } g.fillStyle = '#3B2A20'; g.beginPath(); g.ellipse(cx, H * .115, W * .105, H * .05, 0, Math.PI, 0); g.fill();
  // head, hair, helmet
  g.fillStyle = vgrad(g, H * .06, H * .21, [[0, '#F6E2CF'], [1, '#E2BFA4']]); g.beginPath(); g.ellipse(cx, H * .14, W * .1, H * .075, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(60,40,30,.7)'; g.fillRect(cx - W * .05, H * .135, W * .025, H * .012); g.fillRect(cx + W * .025, H * .135, W * .025, H * .012);
  g.fillStyle = vgrad(g, H * .02, H * .12, [[0, shadeHex(helmet, 1.2)], [1, shadeHex(helmet, .8)]]); g.beginPath(); g.ellipse(cx, H * .1, W * .12, H * .065, 0, Math.PI, 0); g.fill(); g.fillRect(cx - W * .12, H * .095, W * .24, H * .015);
  g.fillStyle = 'rgba(0,0,0,.3)'; for (const x of [-.055, 0, .055]) { rrect(g, cx + W * x - W * .012, H * .055, W * .024, H * .03, 3); g.fill(); } g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(cx - W * .06, H * .06, W * .03, H * .01, -.4, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#2B2B2B'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(cx - W * .095, H * .11); g.quadraticCurveTo(cx - W * .08, H * .2, cx, H * .212); g.quadraticCurveTo(cx + W * .08, H * .2, cx + W * .095, H * .11); g.stroke();
  g.strokeStyle = 'rgba(150,90,70,.7)'; g.lineWidth = 1.4; g.lineCap = 'round'; g.beginPath(); g.arc(cx, H * .165, W * .025, .2, Math.PI - .2); g.stroke();
  if (kind === 'kick') kickScooter(g, W, H, cx);
}
// a shared electric kick scooter at a slight angle, in front of its rider: fat front wheel, teal stem with a bright
// headlight and a lightning badge, a wide handlebar with a little display, the long deck under the feet, a number plate
function kickScooter(g, W, H, cx) {
  const fx = cx - W * .06; // the front wheel sits a little to the left: we see the scooter three-quarter on
  g.fillStyle = '#2B2E33'; g.beginPath(); g.moveTo(fx - W * .05, H * .9); g.lineTo(cx + W * .3, H * .845); g.lineTo(cx + W * .32, H * .87); g.lineTo(fx + W * .02, H * .93); g.closePath(); g.fill(); // deck
  g.fillStyle = '#2BB38A'; g.beginPath(); g.moveTo(fx - W * .04, H * .925); g.lineTo(cx + W * .32, H * .87); g.lineTo(cx + W * .32, H * .885); g.lineTo(fx - W * .03, H * .94); g.closePath(); g.fill();
  g.fillStyle = '#16181B'; rrect(g, cx + W * .26, H * .86, W * .09, H * .07, 5); g.fill(); // rear wheel
  g.fillStyle = '#16181B'; rrect(g, fx - W * .09, H * .87, W * .18, H * .125, 9); g.fill(); g.fillStyle = '#4A4E54'; rrect(g, fx - W * .045, H * .9, W * .09, H * .07, 4); g.fill(); // front wheel
  g.fillStyle = '#2BB38A'; g.beginPath(); g.moveTo(fx - W * .11, H * .885); g.quadraticCurveTo(fx, H * .84, fx + W * .11, H * .885); g.lineTo(fx + W * .09, H * .895); g.quadraticCurveTo(fx, H * .86, fx - W * .09, H * .895); g.closePath(); g.fill(); // fender
  g.fillStyle = '#F7F7F2'; rrect(g, fx - W * .065, H * .8, W * .13, H * .04, 2); g.fill(); g.fillStyle = '#2F7A4E'; g.font = `900 ${Math.round(H * .024)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('12-34', fx, H * .821);
  const sg = g.createLinearGradient(fx - W * .04, 0, fx + W * .04, 0); sg.addColorStop(0, '#1C7A5E'); sg.addColorStop(.45, '#3FD3A4'); sg.addColorStop(1, '#1C7A5E');
  g.fillStyle = sg; g.beginPath(); g.moveTo(fx - W * .045, H * .8); g.lineTo(fx - W * .028, H * .4); g.lineTo(fx + W * .028, H * .4); g.lineTo(fx + W * .045, H * .8); g.closePath(); g.fill(); // stem, in front of the rider
  g.fillStyle = '#FFFBEA'; g.beginPath(); g.ellipse(fx, H * .6, W * .06, H * .026, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#155C47'; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = 'rgba(255,250,220,.55)'; g.beginPath(); g.ellipse(fx, H * .6, W * .1, H * .04, 0, 0, Math.PI * 2); g.fill(); // headlight glow
  g.fillStyle = '#F2C230'; g.beginPath(); g.moveTo(fx + W * .005, H * .66); g.lineTo(fx - W * .018, H * .7); g.lineTo(fx, H * .7); g.lineTo(fx - W * .008, H * .735); g.lineTo(fx + W * .02, H * .69); g.lineTo(fx + W * .002, H * .69); g.closePath(); g.fill(); // electric badge
  g.strokeStyle = '#2B2E33'; g.lineWidth = W * .04; g.lineCap = 'round'; g.beginPath(); g.moveTo(fx - W * .27, H * .405); g.quadraticCurveTo(fx, H * .38, fx + W * .3, H * .41); g.stroke();
  g.fillStyle = '#1C1C1E'; rrect(g, fx - W * .065, H * .372, W * .13, H * .032, 3); g.fill(); g.fillStyle = '#7FE0C0'; g.fillRect(fx - W * .045, H * .38, W * .09, H * .015);
  g.fillStyle = '#F1D9C4'; for (const x of [fx - W * .25, fx + W * .28]) { g.beginPath(); g.arc(x, H * .405, W * .045, 0, Math.PI * 2); g.fill(); } // hands on the grips
}
/* ---- street obstacles ---- */
function paintCone(g, W, H) {
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(W / 2, H - 4, W * .45, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#26282B'; rrect(g, W * .06, H * .88, W * .88, H * .1, 4); g.fill();
  const gr = g.createLinearGradient(W * .2, 0, W * .8, 0); gr.addColorStop(0, '#C9541C'); gr.addColorStop(.38, '#FF9A4A'); gr.addColorStop(1, '#B4461A');
  g.fillStyle = gr; g.beginPath(); g.moveTo(W * .44, H * .04); g.lineTo(W * .56, H * .04); g.lineTo(W * .82, H * .89); g.lineTo(W * .18, H * .89); g.closePath(); g.fill();
  g.save(); g.clip(); const wg = g.createLinearGradient(W * .2, 0, W * .8, 0); wg.addColorStop(0, '#C9CDD0'); wg.addColorStop(.38, '#FFFFFF'); wg.addColorStop(1, '#AEB3B7'); g.fillStyle = wg; g.fillRect(0, H * .3, W, H * .12); g.fillRect(0, H * .58, W, H * .1); g.restore();
  /* 見た目 103〜105：コーン。先の丸いキャップ／台のふちの光／よごれのかすれ */
  g.fillStyle = '#FFB070'; g.beginPath(); g.ellipse(W / 2, H * .04, W * .06, H * .012, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; rrect(g, W * .08, H * .885, W * .84, H * .02, 2); g.fill();
  g.fillStyle = 'rgba(60,40,25,.14)'; for (const [x, y, w, h] of [[.3, .8, .16, .05], [.52, .5, .1, .04], [.42, .22, .06, .05]]) { g.beginPath(); g.ellipse(W * x, H * y, W * w, H * h, .3, 0, Math.PI * 2); g.fill(); }
}
function paintBarrier(g, W, H) { /* 見た目 28〜32：工事のさく。板のふちと厚み／しまのつや消しの濃淡／脚を丸いパイプに／おもりの台／ランプにガラスのつやと台 */
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(W / 2, H - 4, W * .48, 6, 0, 0, Math.PI * 2); g.fill();
  for (const x of [W * .09, W * .91]) { const pg = g.createLinearGradient(x - W * .03, 0, x + W * .03, 0); pg.addColorStop(0, '#2C2F33'); pg.addColorStop(.4, '#7A8087'); pg.addColorStop(1, '#2C2F33'); g.fillStyle = pg; rrect(g, x - W * .028, H * .26, W * .056, H * .7, 4); g.fill();
    g.fillStyle = vgrad(g, H * .9, H, [[0, '#55595E'], [1, '#26282B']]); rrect(g, x - W * .085, H * .92, W * .17, H * .07, 4); g.fill(); }
  for (const y of [H * .32, H * .62]) { g.save(); rrect(g, W * .02, y, W * .96, H * .2, 5); g.clip(); g.fillStyle = vgrad(g, y, y + H * .2, [[0, '#FFD64A'], [1, '#D9A51E']]); g.fillRect(0, y, W, H * .2); g.fillStyle = vgrad(g, y, y + H * .2, [[0, '#33363A'], [1, '#17181A']]); for (let x = -W; x < W * 1.2; x += W * .16) { g.beginPath(); g.moveTo(x, y + H * .2); g.lineTo(x + W * .08, y + H * .2); g.lineTo(x + W * .16, y); g.lineTo(x + W * .08, y); g.closePath(); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(0, y, W, H * .025); g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, y + H * .175, W, H * .025); g.restore();
    g.strokeStyle = 'rgba(30,25,10,.55)'; g.lineWidth = 1.5; rrect(g, W * .02, y, W * .96, H * .2, 5); g.stroke(); g.fillStyle = '#C9CDD2'; for (const x of [.09, .91]) { g.beginPath(); g.arc(W * x, y + H * .1, W * .014, 0, Math.PI * 2); g.fill(); } }
  g.fillStyle = '#2C2F33'; rrect(g, W * .46, H * .25, W * .08, H * .07, 2); g.fill(); { const cx = W / 2, cy = H * .19, r = W * .058; const lg = g.createRadialGradient(cx - r * .3, cy - r * .35, 1, cx, cy, r); lg.addColorStop(0, '#FFD0B0'); lg.addColorStop(.5, '#FF5A3C'); lg.addColorStop(1, '#B8301C'); g.fillStyle = lg; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(cx - r * .35, cy - r * .4, r * .22, r * .13, -.6, 0, Math.PI * 2); g.fill(); }
}
function paintBench(g, W, H) {
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(W / 2, H - 4, W * .5, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3E4650'; for (const x of [W * .08, W * .86]) g.fillRect(x, H * .45, W * .06, H * .53);
  for (let k = 0; k < 3; k++) { const y = H * (.38 + k * .1); g.fillStyle = vgrad(g, y, y + H * .07, [[0, '#C8945F'], [1, '#8C6038']]); rrect(g, W * .02, y, W * .96, H * .07, 3); g.fill(); }
  for (let k = 0; k < 2; k++) { const y = H * (.04 + k * .14); g.fillStyle = vgrad(g, y, y + H * .09, [[0, '#C8945F'], [1, '#8C6038']]); rrect(g, W * .04, y, W * .92, H * .09, 3); g.fill(); }
  g.fillStyle = '#3E4650'; g.fillRect(W * .1, H * .02, W * .04, H * .4); g.fillRect(W * .86, H * .02, W * .04, H * .4);
  /* 見た目 90〜93：ベンチ。板の木目／ボルト／鉄のひじかけ／脚の足 */
  g.strokeStyle = 'rgba(70,40,15,.25)'; g.lineWidth = 1; for (const y of [.085, .225, .415, .515, .615]) { g.beginPath(); g.moveTo(W * .06, H * y); g.quadraticCurveTo(W * .5, H * (y + .012), W * .94, H * y); g.stroke(); }
  g.fillStyle = '#C9CDD2'; for (const x of [.12, .88]) for (const y of [.085, .225, .415, .515, .615]) { g.beginPath(); g.arc(W * x, H * y, 2, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = '#2E353D'; g.lineWidth = W * .022; g.lineCap = 'round'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(W * (.5 + sd * .47), H * .5); g.quadraticCurveTo(W * (.5 + sd * .5), H * .28, W * (.5 + sd * .43), H * .27); g.stroke(); }
  g.fillStyle = '#2E353D'; for (const x of [.06, .84]) { rrect(g, W * x, H * .94, W * .1, H * .05, 2); g.fill(); }
}
function paintCardboard(g, W, H) {
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(W / 2, H - 4, W * .5, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = vgrad(g, H * .14, H, [[0, '#D9A86A'], [1, '#A9763E']]); g.fillRect(W * .04, H * .14, W * .92, H * .84);
  g.fillStyle = '#E7BC82'; g.beginPath(); g.moveTo(W * .04, H * .14); g.lineTo(W * .16, H * .02); g.lineTo(W * .98, H * .02); g.lineTo(W * .96, H * .14); g.closePath(); g.fill();
  g.fillStyle = 'rgba(240,230,200,.75)'; g.fillRect(W * .44, H * .14, W * .12, H * .84); g.fillRect(W * .5, H * .02, W * .1, H * .12);
  g.strokeStyle = 'rgba(90,60,30,.5)'; g.lineWidth = 2; g.strokeRect(W * .04, H * .14, W * .92, H * .84);
  g.fillStyle = 'rgba(60,40,20,.55)'; g.font = `900 ${Math.round(H * .1)}px ${typeof FAC_FONT !== 'undefined' ? FAC_FONT : 'sans-serif'}`; g.textAlign = 'center'; g.fillText('こわれもの', W * .26, H * .62); g.fillText('↑↑', W * .76, H * .5);
  /* 見た目 126〜129：段ボール箱。波形の紙のすじ／テープのつやとふち／持ち手の穴／かどのへこみとかげ */
  g.strokeStyle = 'rgba(90,60,30,.1)'; g.lineWidth = 1; for (let x = W * .07; x < W * .95; x += W * .028) { g.beginPath(); g.moveTo(x, H * .15); g.lineTo(x, H * .97); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(W * .45, H * .14, W * .025, H * .84); g.fillStyle = 'rgba(120,95,55,.3)'; g.fillRect(W * .555, H * .14, W * .006, H * .84);
  g.fillStyle = 'rgba(60,35,15,.6)'; rrect(g, W * .68, H * .26, W * .16, H * .055, 6); g.fill(); g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(W * .04, H * .14, W * .92, H * .02); g.fillStyle = 'rgba(60,35,15,.16)'; g.fillRect(W * .9, H * .14, W * .06, H * .84);
}
const ART = {
  car: (o, night) => artCanvas(`car|${o.av.t}|${o.av.c}|${night ? 'n' : 'd'}`, 360, 300, (g, w, h) => paintCar(g, w, h, o.av.c, o.av.t, night)),
  supercar: (o, night) => artCanvas(`super|${o.av.c}|${night ? 'n' : 'd'}`, 400, 220, (g, w, h) => paintSupercar(g, w, h, o.av.c, night)),
  kick: (o) => artCanvas(`kick|${o.av.s}|${o.av.p}|${o.av.h}`, 160, 320, (g, w, h) => paintRider(g, w, h, o.av.s, o.av.p, o.av.h, 'kick')),
  bike: (o) => artCanvas(`bike|${o.av.s}|${o.av.p}|${o.av.h}`, 160, 320, (g, w, h) => paintRider(g, w, h, o.av.s, o.av.p, o.av.h, 'bike')),
  cone: () => artCanvas('cone', 120, 140, paintCone),
  barrier: () => artCanvas('barrier', 240, 150, paintBarrier),
  bench: () => artCanvas('bench', 260, 110, paintBench),
  box: () => artCanvas('box', 200, 170, paintCardboard),
};
/* ---- more illustrated obstacles: everything you meet is painted, so its shape says what to do:
   jump = low and solid to the ground; slide = raised, clearly open underneath, supports at the sides; dodge = tall and solid ---- */
const SH = (g, W, H, k) => { g.fillStyle = `rgba(0,0,0,${k || .3})`; g.beginPath(); g.ellipse(W / 2, H - 4, W * .48, 6, 0, 0, Math.PI * 2); g.fill(); };
function paperSheet(g, x, y, w, h, tilt) { g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(tilt || 0); g.fillStyle = vgrad(g, -h / 2, h / 2, [[0, '#FFFFFF'], [1, '#E4E2DA']]); g.fillRect(-w / 2, -h / 2, w, h); g.strokeStyle = 'rgba(120,115,100,.35)'; g.lineWidth = 1; g.strokeRect(-w / 2, -h / 2, w, h); g.restore(); }
function paintPapers(g, W, H, tall) {
  SH(g, W, H); const n = tall ? 16 : 6, r = rnd(tall ? 9 : 5);
  for (let k = 0; k < n; k++) { const y = H - 6 - (k + 1) * (H - 10) / n, off = (r() - .5) * W * .08; paperSheet(g, W * .08 + off, y, W * .84, (H - 10) / n + 2, (r() - .5) * .05); }
  g.fillStyle = 'rgba(120,115,100,.25)'; for (let k = 1; k < n; k++) g.fillRect(W * .1, H - 6 - k * (H - 10) / n, W * .8, 1.5);
  if (tall) { g.fillStyle = '#C8463C'; g.fillRect(W * .12, H * .42, W * .14, H * .03); g.fillStyle = '#F2C230'; g.fillRect(W * .7, H * .2, W * .1, H * .04); }
}
function paintPlant(g, W, H) {
  SH(g, W, H); g.fillStyle = vgrad(g, H * .62, H, [[0, '#C8945F'], [1, '#8C6038']]); g.beginPath(); g.moveTo(W * .22, H * .64); g.lineTo(W * .78, H * .64); g.lineTo(W * .7, H * .98); g.lineTo(W * .3, H * .98); g.closePath(); g.fill();
  g.fillStyle = '#6B4631'; g.fillRect(W * .2, H * .62, W * .6, H * .04);
  const r = rnd(4); for (let k = 0; k < 14; k++) { const a = -Math.PI / 2 + (r() - .5) * 2.4, L = H * (.3 + r() * .3), cx = W / 2 + Math.cos(a) * L * .55, cy = H * .62 + Math.sin(a) * L;
    g.strokeStyle = '#3F6E3A'; g.lineWidth = 3; g.beginPath(); g.moveTo(W / 2, H * .62); g.quadraticCurveTo(W / 2 + Math.cos(a) * L * .2, H * .62 + Math.sin(a) * L * .6, cx, cy); g.stroke();
    g.fillStyle = vgrad(g, cy - 20, cy + 20, [[0, '#7DB46A'], [1, '#3F7A3F']]); g.beginPath(); g.ellipse(cx, cy, W * .13, H * .055, a + Math.PI / 2, 0, Math.PI * 2); g.fill(); }
}
function paintChair(g, W, H) { /* 見た目 69〜72：事務いす。背もたれのふくらみとぬい目／座面の厚み／5 本脚とキャスター／ガス柱のつや */
  SH(g, W, H, .25); g.strokeStyle = '#2B2B2B'; g.lineWidth = 6; g.lineCap = 'round'; for (const x of [.12, .32, .5, .68, .88]) { g.beginPath(); g.moveTo(W / 2, H * .86); g.lineTo(W * x, H * (x === .5 ? .97 : x < .3 || x > .7 ? .94 : .955)); g.stroke(); }
  for (const x of [.12, .32, .5, .68, .88]) { const y = H * (x === .5 ? .975 : x < .3 || x > .7 ? .95 : .965); g.fillStyle = '#1C1C1E'; g.beginPath(); g.arc(W * x, y, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#6E747A'; g.beginPath(); g.arc(W * x, y, 2, 0, Math.PI * 2); g.fill(); }
  { const pg = g.createLinearGradient(W * .46, 0, W * .54, 0); pg.addColorStop(0, '#5E646B'); pg.addColorStop(.4, '#C9CDD2'); pg.addColorStop(1, '#5E646B'); g.fillStyle = pg; g.fillRect(W * .465, H * .56, W * .07, H * .31); g.fillStyle = '#2B2B2B'; g.fillRect(W * .44, H * .78, W * .12, H * .08); }
  g.fillStyle = '#7A241E'; rrect(g, W * .08, H * .5, W * .84, H * .1, 10); g.fill(); g.fillStyle = vgrad(g, H * .44, H * .57, [[0, '#EC6A5C'], [1, '#B63A30']]); rrect(g, W * .08, H * .455, W * .84, H * .1, 12); g.fill();
  g.fillStyle = '#2B2B2B'; g.fillRect(W * .45, H * .4, W * .1, H * .07);
  g.fillStyle = vgrad(g, H * .02, H * .44, [[0, '#EC6A5C'], [.6, '#C8463C'], [1, '#A8352C']]); rrect(g, W * .16, H * .02, W * .68, H * .41, 18); g.fill();
  g.strokeStyle = 'rgba(110,25,20,.4)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(W * .22, H * .16); g.quadraticCurveTo(W * .5, H * .19, W * .78, H * .16); g.moveTo(W * .22, H * .29); g.quadraticCurveTo(W * .5, H * .32, W * .78, H * .29); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.2)'; rrect(g, W * .2, H * .04, W * .6, H * .05, 10); g.fill();
}
function paintSuitcase(g, W, H, col) { /* 見た目 65〜68：スーツケース。かどの金具／まん中の合わせ目とロック／のびる持ち手を金属に／車輪のうけ */
  SH(g, W, H); for (const x of [.16, .84]) { g.fillStyle = '#3B3B40'; rrect(g, W * x - 9, H * .9, 18, H * .05, 3); g.fill(); g.fillStyle = '#1C1C1E'; g.beginPath(); g.arc(W * x, H * .955, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = '#8A9098'; g.beginPath(); g.arc(W * x, H * .955, 2.6, 0, Math.PI * 2); g.fill(); }
  { const mg = g.createLinearGradient(0, 0, W * .1, 0); mg.addColorStop(0, '#6E747A'); mg.addColorStop(.5, '#D0D5DA'); mg.addColorStop(1, '#6E747A'); g.fillStyle = '#9AA0A6'; g.fillRect(W * .36, H * .03, W * .045, H * .19); g.fillRect(W * .595, H * .03, W * .045, H * .19); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(W * .365, H * .03, W * .012, H * .19); g.fillRect(W * .6, H * .03, W * .012, H * .19); }
  g.fillStyle = vgrad(g, 0, H * .06, [[0, '#55555C'], [1, '#2B2B30']]); rrect(g, W * .33, H * .0, W * .34, H * .055, 5); g.fill();
  g.fillStyle = vgrad(g, H * .2, H * .92, [[0, shadeHex(col, 1.22)], [.5, col], [1, shadeHex(col, .68)]]); rrect(g, W * .06, H * .2, W * .88, H * .72, 16); g.fill();
  g.strokeStyle = shadeHex(col, .62); g.lineWidth = 3; for (const x of [.22, .36, .64, .78]) { g.beginPath(); g.moveTo(W * x, H * .25); g.lineTo(W * x, H * .87); g.stroke(); } g.strokeStyle = shadeHex(col, 1.3); g.lineWidth = 1; for (const x of [.22, .36, .64, .78]) { g.beginPath(); g.moveTo(W * x + 2.5, H * .25); g.lineTo(W * x + 2.5, H * .87); g.stroke(); }
  g.fillStyle = shadeHex(col, .5); g.fillRect(W * .495, H * .2, W * .01, H * .72); g.fillStyle = '#C9CDD2'; rrect(g, W * .46, H * .5, W * .08, H * .07, 3); g.fill(); g.fillStyle = '#3B3B40'; g.beginPath(); g.arc(W * .5, H * .535, W * .012, 0, Math.PI * 2); g.fill();
  g.fillStyle = shadeHex(col, .55); for (const [x, y] of [[.06, .2], [.86, .2], [.06, .84], [.86, .84]]) { rrect(g, W * x, H * y, W * .08, H * .08, [x < .5 && y < .5 ? 16 : 3, x > .5 && y < .5 ? 16 : 3, x > .5 && y > .5 ? 16 : 3, x < .5 && y > .5 ? 16 : 3]); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.2)'; rrect(g, W * .1, H * .23, W * .06, H * .62, 8); g.fill();
}
function paintBags(g, W, H) { /* 見た目 33〜36：買い物ぶくろ。四角 2 枚 → 口の折り返しとまち（横の折り目）／ひもの持ち手と穴／紙のしわ／文字をやめて丸い印（文字を減らす） */
  SH(g, W, H); for (const [x, w, h, c, hc] of [[.04, .5, .8, '#5C8FC4', '#F3EEE6'], [.46, .5, .72, '#E9E2D5', '#8A6A48']]) { const y = H - H * h - 3, x0 = W * x, ww = W * w;
    g.fillStyle = vgrad(g, y, H, [[0, shadeHex(c, 1.1)], [1, shadeHex(c, .8)]]); g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + ww, y); g.lineTo(x0 + ww * .97, H - 3); g.lineTo(x0 + ww * .03, H - 3); g.closePath(); g.fill();
    g.fillStyle = shadeHex(c, .7); g.beginPath(); g.moveTo(x0 + ww, y); g.lineTo(x0 + ww * .86, y + H * h * .5); g.lineTo(x0 + ww * .97, H - 3); g.closePath(); g.fill(); // まち（横の折り目）
    g.fillStyle = shadeHex(c, 1.2); g.fillRect(x0, y, ww, H * .04); g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(x0, y + H * .04, ww, 2);
    g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0 + ww * .2, y + H * h * .3); g.lineTo(x0 + ww * .3, H - 3); g.moveTo(x0 + ww * .6, y + H * h * .2); g.lineTo(x0 + ww * .52, H - 3); g.stroke(); // 紙のしわ
    g.strokeStyle = hc; g.lineWidth = 3.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0 + ww * .3, y + H * .03); g.bezierCurveTo(x0 + ww * .3, y - H * .2, x0 + ww * .7, y - H * .2, x0 + ww * .7, y + H * .03); g.stroke(); g.fillStyle = 'rgba(0,0,0,.4)'; for (const u of [.3, .7]) { g.beginPath(); g.arc(x0 + ww * u, y + H * .03, 2.4, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(x0 + ww * .04, y + H * .05, ww * .1, H * h * .9); }
  g.fillStyle = '#F3EEE6'; g.beginPath(); g.arc(W * .27, H * .6, W * .1, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C8463C'; g.beginPath(); g.arc(W * .27, H * .6, W * .065, 0, Math.PI * 2); g.fill();
}
function paintCrates(g, W, H, n) { /* 見た目 1〜5（2026-11-16）：びんのケース。色の板 3 枚 → ふち・持ち手の穴・たてのリブ・中のびんの王冠・少しずらした積み方 */
  SH(g, W, H); const h = (H - 8) / n; for (let k = 0; k < n; k++) { const y = H - 6 - (k + 1) * h, c = k % 2 ? '#C8463C' : '#E0A030', ox = (k % 2 ? 1 : -1) * W * .012 * (k ? 1 : 0), x0 = W * .05 + ox, w = W * .9;
    g.fillStyle = vgrad(g, y, y + h, [[0, shadeHex(c, 1.12)], [.5, c], [1, shadeHex(c, .72)]]); rrect(g, x0, y + 3, w, h - 3, 7); g.fill();
    g.fillStyle = shadeHex(c, 1.28); rrect(g, x0 - W * .012, y + 2, w + W * .024, h * .13, 4); g.fill(); g.fillStyle = shadeHex(c, .6); g.fillRect(x0, y + 2 + h * .13, w, 2); // 上のふちと、その下のかげ
    g.fillStyle = shadeHex(c, .86); for (const x of [.07, .345, .62, .895]) g.fillRect(x0 + w * x - 2, y + h * .2, 4, h * .74); // たてのリブ
    for (const x of [.12, .395, .67]) { const hx = x0 + w * x, hw = w * .2, hy = y + h * .3, hh = h * .36; g.fillStyle = 'rgba(30,18,10,.72)'; rrect(g, hx, hy, hw, hh, 5); g.fill();
      g.fillStyle = '#5E7F5A'; g.fillRect(hx + hw * .16, hy + hh * .42, hw * .24, hh * .58); g.fillRect(hx + hw * .6, hy + hh * .42, hw * .24, hh * .58); g.fillStyle = '#D8C27A'; g.fillRect(hx + hw * .16, hy + hh * .3, hw * .24, hh * .16); g.fillRect(hx + hw * .6, hy + hh * .3, hw * .24, hh * .16); // 穴からのぞく、びんの首と王冠
      g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(hx, hy, hw, hh * .22); }
    g.fillStyle = 'rgba(255,255,255,.16)'; rrect(g, x0 + w * .02, y + h * .2, w * .035, h * .7, 3); g.fill(); }
}
function paintStroller(g, W, H) { /* 見た目 50〜53：ベビーカー。車輪にホイールと二重タイヤ／ほろのひだとふち／かごの下の荷物入れ／持ち手 */
  SH(g, W, H); g.strokeStyle = '#7C8894'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(W * .14, H * .9); g.lineTo(W * .3, H * .5); g.moveTo(W * .86, H * .9); g.lineTo(W * .7, H * .5); g.stroke();
  g.fillStyle = 'rgba(60,75,90,.5)'; g.beginPath(); g.moveTo(W * .24, H * .74); g.lineTo(W * .76, H * .74); g.lineTo(W * .7, H * .86); g.lineTo(W * .3, H * .86); g.closePath(); g.fill();
  for (const x of [.14, .86]) { g.fillStyle = '#1C1C1E'; g.beginPath(); g.ellipse(W * x, H * .9, W * .075, H * .085, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3A3A40'; g.beginPath(); g.ellipse(W * x, H * .9, W * .055, H * .064, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C9CDD2'; g.beginPath(); g.ellipse(W * x, H * .9, W * .03, H * .035, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#6E747A'; g.beginPath(); g.arc(W * x, H * .9, W * .01, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = vgrad(g, H * .4, H * .74, [[0, '#C4D1DE'], [1, '#7F93A8']]); rrect(g, W * .16, H * .42, W * .68, H * .32, 16); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; rrect(g, W * .2, H * .44, W * .6, H * .03, 6); g.fill(); g.fillStyle = '#F3EEE6'; rrect(g, W * .3, H * .5, W * .4, H * .16, 10); g.fill(); g.fillStyle = 'rgba(120,140,160,.25)'; rrect(g, W * .3, H * .6, W * .4, H * .06, 8); g.fill();
  g.fillStyle = vgrad(g, H * .05, H * .45, [[0, '#A9BED2'], [1, '#56708A']]); g.beginPath(); g.moveTo(W * .12, H * .45); g.quadraticCurveTo(W * .2, H * .02, W * .55, H * .05); g.quadraticCurveTo(W * .86, H * .1, W * .88, H * .45); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(40,60,80,.3)'; g.lineWidth = 1.6; for (const t of [.2, .4, .6, .8]) { g.beginPath(); g.moveTo(W * (.12 + .76 * t), H * .45); g.quadraticCurveTo(W * (.24 + .46 * t), H * .2, W * (.36 + .26 * t), H * .06); g.stroke(); }
  g.fillStyle = '#F3EEE6'; g.beginPath(); g.moveTo(W * .12, H * .45); g.lineTo(W * .88, H * .45); g.lineTo(W * .88, H * .475); g.quadraticCurveTo(W * .5, H * .5, W * .12, H * .475); g.closePath(); g.fill();
  g.strokeStyle = '#2B343D'; g.lineWidth = 4; g.beginPath(); g.moveTo(W * .1, H * .4); g.lineTo(W * .06, H * .3); g.moveTo(W * .9, H * .4); g.lineTo(W * .94, H * .3); g.stroke(); // 持ち手（うしろへのびる 2 本の先）
}
function paintSandwich(g, W, H, txt) {
  SH(g, W, H); g.fillStyle = '#5A3D27'; g.fillRect(W * .04, H * .94, W * .1, H * .05); g.fillRect(W * .86, H * .94, W * .1, H * .05);
  g.fillStyle = vgrad(g, 0, H, [[0, '#7A5538'], [1, '#4A3020']]); g.beginPath(); g.moveTo(W * .1, H * .02); g.lineTo(W * .9, H * .02); g.lineTo(W * .98, H * .96); g.lineTo(W * .02, H * .96); g.closePath(); g.fill();
  g.fillStyle = '#F6EBDC'; g.beginPath(); g.moveTo(W * .16, H * .08); g.lineTo(W * .84, H * .08); g.lineTo(W * .9, H * .88); g.lineTo(W * .1, H * .88); g.closePath(); g.fill();
  g.fillStyle = '#3B2A20'; g.font = `900 ${Math.round(W * .2)}px ${typeof FAC_FONT !== 'undefined' ? FAC_FONT : 'sans-serif'}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  [...txt].forEach((ch, i, a) => g.fillText(ch, W / 2, H * (.2 + .62 * (i + .5) / a.length)));
  /* 見た目 138〜140：立て看板。木のわくの面取り／紙にふちの線／上のちょうつがい */
  g.strokeStyle = 'rgba(255,220,180,.2)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(W * .12, H * .04); g.lineTo(W * .05, H * .94); g.moveTo(W * .88, H * .04); g.lineTo(W * .95, H * .94); g.stroke(); g.strokeStyle = 'rgba(30,15,5,.3)'; g.beginPath(); g.moveTo(W * .145, H * .06); g.lineTo(W * .085, H * .9); g.moveTo(W * .855, H * .06); g.lineTo(W * .915, H * .9); g.stroke();
  g.strokeStyle = 'rgba(120,85,55,.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(W * .2, H * .11); g.lineTo(W * .8, H * .11); g.lineTo(W * .85, H * .85); g.lineTo(W * .15, H * .85); g.closePath(); g.stroke();
  g.fillStyle = '#C9A86A'; for (const x of [.3, .7]) { rrect(g, W * x - W * .04, 0, W * .08, H * .035, 2); g.fill(); }
}
function paintCafe(g, W, H, col) { /* 見た目 115〜118：カフェのテラス席。パラソルのふちのたれ／支柱を金属に・台／テーブルの上にカップ／いすを、背もたれのある形に */
  SH(g, W, H); { const pg = g.createLinearGradient(W * .47, 0, W * .53, 0); pg.addColorStop(0, '#6E747A'); pg.addColorStop(.4, '#D0D5DA'); pg.addColorStop(1, '#6E747A'); g.fillStyle = pg; g.fillRect(W * .485, H * .08, W * .03, H * .58); }
  g.fillStyle = vgrad(g, 0, H * .14, [[0, shadeHex(col, 1.22)], [1, shadeHex(col, .8)]]); g.beginPath(); g.moveTo(W * .02, H * .14); g.quadraticCurveTo(W / 2, -H * .06, W * .98, H * .14); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(W * (.1 + k * .2), H * .14); g.lineTo(W / 2, H * .02); g.lineTo(W * (.2 + k * .2), H * .14); g.closePath(); if (k % 2) g.fill(); }
  for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? '#F3EEE6' : shadeHex(col, .82); g.beginPath(); g.moveTo(W * (.02 + k * .12), H * .14); g.lineTo(W * (.02 + (k + 1) * .12), H * .14); g.quadraticCurveTo(W * (.02 + (k + .5) * .12), H * .19, W * (.02 + k * .12), H * .14); g.fill(); } g.fillStyle = '#C9CDD2'; g.beginPath(); g.arc(W / 2, H * .015, W * .015, 0, Math.PI * 2); g.fill();
  for (const sd of [-1, 1]) { const cx = W * (.5 + sd * .4); g.fillStyle = vgrad(g, H * .44, H * .7, [[0, '#C49A6C'], [1, '#8C6038']]); rrect(g, cx - W * .075, H * .46, W * .15, H * .2, 8); g.fill(); g.strokeStyle = 'rgba(70,40,15,.35)'; g.lineWidth = 1.5; for (const u of [-.03, .03]) { g.beginPath(); g.moveTo(cx + W * u, H * .48); g.lineTo(cx + W * u, H * .64); g.stroke(); }
    g.fillStyle = vgrad(g, H * .62, H, [[0, '#B08155'], [1, '#7A5538']]); rrect(g, cx - W * .08, H * .64, W * .16, H * .07, 5); g.fill(); g.fillStyle = '#6E4A30'; g.fillRect(cx - W * .07, H * .71, W * .02, H * .27); g.fillRect(cx + W * .05, H * .71, W * .02, H * .27); }
  g.fillStyle = vgrad(g, H * .62, H, [[0, '#FBF6EE'], [1, '#D9D2C6']]); g.beginPath(); g.moveTo(W * .26, H * .64); g.lineTo(W * .74, H * .64); g.lineTo(W * .8, H * .97); g.lineTo(W * .2, H * .97); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(120,105,85,.25)'; g.lineWidth = 1.5; for (const u of [.36, .5, .64]) { g.beginPath(); g.moveTo(W * u, H * .66); g.lineTo(W * (.5 + (u - .5) * 1.25), H * .97); g.stroke(); }
  g.fillStyle = '#EDE6DA'; g.beginPath(); g.ellipse(W / 2, H * .64, W * .25, H * .018, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FFFFFF'; rrect(g, W * .38, H * .595, W * .07, H * .04, 2); g.fill(); g.fillStyle = '#6B4631'; g.fillRect(W * .385, H * .597, W * .06, H * .008); g.fillStyle = '#5F9E5A'; g.beginPath(); g.ellipse(W * .58, H * .6, W * .035, H * .03, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#B5653A'; rrect(g, W * .56, H * .615, W * .04, H * .025, 2); g.fill();
}
function paintFlowers(g, W, H) { /* 見た目 194〜197：花のプランター。花を花びらのある形に／葉のしげみに明暗／はちのふちと厚み／はちの横の濃淡 */
  SH(g, W, H); { const pg = g.createLinearGradient(W * .04, 0, W * .96, 0); pg.addColorStop(0, '#A39C90'); pg.addColorStop(.3, '#E3DCD0'); pg.addColorStop(1, '#8F887C'); g.fillStyle = pg; } g.beginPath(); g.moveTo(W * .04, H * .48); g.lineTo(W * .96, H * .48); g.lineTo(W * .92, H * .98); g.lineTo(W * .08, H * .98); g.closePath(); g.fill();
  g.fillStyle = vgrad(g, H * .44, H * .56, [[0, '#EEE8DC'], [1, '#B4AD9F']]); rrect(g, W * .02, H * .44, W * .96, H * .09, 4); g.fill(); g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(W * .05, H * .53, W * .9, H * .02);
  g.fillStyle = '#3F7A3E'; g.beginPath(); g.ellipse(W / 2, H * .44, W * .47, H * .15, 0, 0, Math.PI * 2); g.fill(); const r = rnd(8);
  for (let k = 0; k < 26; k++) { g.fillStyle = k % 2 ? '#5F9E5A' : '#4C8A48'; const x = W * (.08 + r() * .84), y = H * (.36 + r() * .14); g.save(); g.translate(x, y); g.rotate(r() * 2 - 1); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(W * .025, -H * .06, 0, -H * .12); g.quadraticCurveTo(-W * .025, -H * .06, 0, 0); g.fill(); g.restore(); }
  for (let k = 0; k < 16; k++) { const col = ['#E86A75', '#F2C230', '#FBF6EE', '#C792EA', '#F08A2E'][(r() * 5) | 0], x = W * (.1 + r() * .8), y = H * (.22 + r() * .2), pr = W * .028; g.save(); g.translate(x, y); g.rotate(r() * 3);
    for (let i = 0; i < 5; i++) { g.rotate(Math.PI * 2 / 5); const pg = g.createLinearGradient(0, 0, 0, -pr * 2.2); pg.addColorStop(0, shadeHex(col, .82)); pg.addColorStop(1, col); g.fillStyle = pg; g.beginPath(); g.ellipse(0, -pr * 1.15, pr * .85, pr * 1.15, 0, 0, Math.PI * 2); g.fill(); } g.fillStyle = col === '#F2C230' ? '#B8651E' : '#F6D36B'; g.beginPath(); g.arc(0, 0, pr * .55, 0, Math.PI * 2); g.fill(); g.restore(); }
}
function paintLeaves(g, W, H) {
  SH(g, W, H, .2); g.fillStyle = vgrad(g, 0, H, [[0, '#F2CD45'], [1, '#C9961B']]); g.beginPath(); g.moveTo(W * .02, H * .98); g.quadraticCurveTo(W * .12, H * .1, W / 2, H * .04); g.quadraticCurveTo(W * .88, H * .1, W * .98, H * .98); g.closePath(); g.fill();
  const r = rnd(3); for (let k = 0; k < 40; k++) { g.fillStyle = ['#F2CD45', '#E8B923', '#D9A21B', '#C77A1B'][(r() * 4) | 0]; g.save(); g.translate(W * (.12 + r() * .76), H * (.2 + r() * .72)); g.rotate(r() * 6); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, W * .06, -.6, .6); g.closePath(); g.fill(); g.restore(); }
}
// 雪の日に転がってくる雪玉（B-28）：白い玉に青い影、てっぺんの光、表面の小さな雪のつぶ
function paintSnowball(g, W, H) {
  SH(g, W, H, .22); const r = Math.min(W, H) * .47, cx = W / 2, cy = H - r - H * .02;
  const gr = g.createRadialGradient(cx - r * .35, cy - r * .4, r * .1, cx, cy, r); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(.65, '#EEF3F8'); gr.addColorStop(1, '#B9C8DA');
  g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(120,140,170,.55)'; g.lineWidth = Math.max(2, W * .012); g.stroke();
  const q = rnd(7); g.fillStyle = 'rgba(160,178,205,.55)'; for (let k = 0; k < 14; k++) { const a = q() * Math.PI * 2, d = q() * r * .85; g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r * (.03 + q() * .04), 0, Math.PI * 2); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(cx - r * .38, cy - r * .45, r * .2, r * .12, -.6, 0, Math.PI * 2); g.fill();
}
function paintStools(g, W, H) { /* 見た目 6〜9：丸いす。座面のふくらみとつや／ふちのパイピング／先のすぼまった金属の脚／足かけの輪 */
  SH(g, W, H); for (const x of [.02, .52]) { const cx = W * (x + .23);
    for (const [dx, k] of [[-.17, 1], [.17, 1], [-.07, .82], [.07, .82]]) { g.strokeStyle = k < 1 ? '#6E747A' : '#A9B0B6'; g.lineWidth = W * .022; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx + W * dx * .7, H * .24); g.lineTo(cx + W * dx, H * (k < 1 ? .9 : .97)); g.stroke(); }
    g.strokeStyle = '#8A9198'; g.lineWidth = W * .014; g.beginPath(); g.ellipse(cx, H * .66, W * .15, H * .035, 0, 0, Math.PI); g.stroke();
    g.fillStyle = '#8E2A22'; g.beginPath(); g.ellipse(cx, H * .2, W * .225, H * .1, 0, 0, Math.PI * 2); g.fill(); g.fillRect(cx - W * .225, H * .13, W * .45, H * .07);
    g.fillStyle = vgrad(g, 0, H * .26, [[0, '#EC6A5C'], [.6, '#C8463C'], [1, '#A5332A']]); g.beginPath(); g.ellipse(cx, H * .13, W * .225, H * .11, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(110,25,20,.5)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, H * .135, W * .2, H * .09, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(cx - W * .07, H * .095, W * .08, H * .028, -.2, 0, Math.PI * 2); g.fill(); }
}
function paintUmbrellas(g, W, H) { /* 見た目 86〜89：かさ立て。かさを、たたんだ布のふくらみとベルトのある形に／木の J の持ち手／かさ立てに横の濃淡とふち／水受け */
  SH(g, W, H); const cs = ['#C8463C', '#F2C230', '#3B2A20', '#355F86'];
  cs.forEach((c, k) => { const x = W * (.24 + k * .17), top = H * (.06 + (k % 2) * .08), lean = (k - 1.5) * 4; g.save(); g.translate(x, H * .56); g.rotate(-lean * .012);
    g.fillStyle = vgrad(g, -H * .46, 0, [[0, shadeHex(c, 1.15)], [1, shadeHex(c, .7)]]); g.beginPath(); g.moveTo(-W * .012, top - H * .5); g.lineTo(W * .012, top - H * .5); g.quadraticCurveTo(W * .055, -H * .2, W * .03, 0); g.lineTo(-W * .03, 0); g.quadraticCurveTo(-W * .055, -H * .2, -W * .012, top - H * .5); g.fill();
    g.strokeStyle = shadeHex(c, .55); g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, top - H * .48); g.lineTo(0, 0); g.stroke(); g.fillStyle = shadeHex(c, .5); g.fillRect(-W * .04, -H * .22, W * .08, H * .018);
    g.strokeStyle = '#7A4E2C'; g.lineWidth = 3.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, top - H * .5); g.lineTo(0, top - H * .56); g.arc(7, top - H * .56, 7, Math.PI, 0); g.stroke(); g.restore(); });
  { const bg = g.createLinearGradient(W * .12, 0, W * .88, 0); bg.addColorStop(0, '#4A6C8E'); bg.addColorStop(.3, '#7FA4C8'); bg.addColorStop(1, '#3A5876'); g.fillStyle = bg; } rrect(g, W * .12, H * .5, W * .76, H * .47, 10); g.fill();
  g.fillStyle = '#35506B'; rrect(g, W * .1, H * .49, W * .8, H * .04, 5); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(W * .12, H * .495, W * .76, 2); g.fillStyle = '#2B3F54'; rrect(g, W * .08, H * .94, W * .84, H * .045, 4); g.fill();
}
function paintCopier(g, W, H) { /* 見た目 172〜175：コピー機。上のふたとガラス面／操作パネルのボタンと画面の光／出てきた紙／トレーの取っ手と段のかげ */
  SH(g, W, H); { const bg = g.createLinearGradient(W * .03, 0, W * .97, 0); bg.addColorStop(0, '#C6CDD4'); bg.addColorStop(.25, '#F3F5F7'); bg.addColorStop(1, '#AEB6BE'); g.fillStyle = bg; } rrect(g, W * .03, H * .14, W * .94, H * .84, 8); g.fill();
  g.fillStyle = vgrad(g, H * .02, H * .16, [[0, '#B4C0CB'], [1, '#7E8C99']]); rrect(g, W * .03, H * .02, W * .94, H * .14, 6); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(W * .06, H * .035, W * .88, H * .012); g.fillStyle = '#2B343D'; g.fillRect(W * .03, H * .145, W * .94, H * .012);
  g.fillStyle = '#35414C'; rrect(g, W * .55, H * .2, W * .37, H * .13, 4); g.fill(); g.fillStyle = vgrad(g, H * .21, H * .3, [[0, '#B8F0A8'], [1, '#5FBE58']]); rrect(g, W * .58, H * .22, W * .13, H * .07, 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(W * .585, H * .225, W * .05, H * .012);
  for (const [x, c] of [[.75, '#7FD06A'], [.8, '#C9CDD2'], [.85, '#C9CDD2'], [.75, '#C9CDD2'], [.8, '#C9CDD2'], [.85, '#E86A5F']].entries()) { const [xx, col] = c; g.fillStyle = col; g.beginPath(); g.arc(W * xx, H * (x < 3 ? .235 : .29), W * .015, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#2B343D'; g.fillRect(W * .07, H * .3, W * .42, H * .025); g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(W * .1, H * .31); g.lineTo(W * .46, H * .31); g.lineTo(W * .44, H * .25); g.lineTo(W * .12, H * .25); g.closePath(); g.fill(); g.strokeStyle = 'rgba(120,130,140,.5)'; g.lineWidth = 1; for (const y of [.265, .28, .295]) { g.beginPath(); g.moveTo(W * .15, H * y); g.lineTo(W * .4, H * y); g.stroke(); }
  for (const y of [.48, .66, .84]) { g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(W * .06, H * y, W * .88, H * .012); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(W * .06, H * (y + .012), W * .88, H * .008); g.fillStyle = '#8A96A2'; rrect(g, W * .4, H * (y - .085), W * .2, H * .035, 4); g.fill(); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(W * .42, H * (y - .065), W * .16, H * .01); }
}
function paintMug(g, W, H) {
  SH(g, W, H); g.strokeStyle = '#E9E2D5'; g.lineWidth = W * .1; g.beginPath(); g.arc(W * .82, H * .5, W * .14, -1.2, 1.2); g.stroke();
  g.fillStyle = vgrad(g, 0, H, [[0, '#FFFFFF'], [1, '#D9D2C6']]); rrect(g, W * .06, H * .04, W * .74, H * .94, [6, 6, 22, 22]); g.fill();
  g.fillStyle = '#4E77A0'; g.fillRect(W * .06, H * .36, W * .74, H * .12); g.fillStyle = '#6B4631'; g.beginPath(); g.ellipse(W * .43, H * .06, W * .34, H * .04, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * .3, H * .02); g.quadraticCurveTo(W * .25, -H * .1, W * .35, -H * .2); g.stroke();
  /* 見た目 100〜102：マグカップ。横の丸みの濃淡／口のふちの厚み／帯のつや */
  { const mg = g.createLinearGradient(W * .06, 0, W * .8, 0); mg.addColorStop(0, 'rgba(120,100,80,.2)'); mg.addColorStop(.25, 'rgba(255,255,255,.3)'); mg.addColorStop(.6, 'rgba(255,255,255,0)'); mg.addColorStop(1, 'rgba(120,100,80,.26)'); g.fillStyle = mg; rrect(g, W * .06, H * .04, W * .74, H * .94, [6, 6, 22, 22]); g.fill(); }
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.beginPath(); g.ellipse(W * .43, H * .06, W * .355, H * .045, 0, 0, Math.PI * 2); g.stroke(); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(W * .16, H * .37, W * .1, H * .1);
}
function paintToys(g, W, H) {
  SH(g, W, H); const blk = (x, y, s, c) => { g.fillStyle = vgrad(g, y, y + s, [[0, shadeHex(c, 1.15)], [1, shadeHex(c, .75)]]); rrect(g, x, y, s, s, 6); g.fill(); };
  blk(W * .02, H * .52, W * .42, '#E86A75'); blk(W * .5, H * .52, W * .42, '#4E77A0'); blk(W * .26, H * .1, W * .42, '#F2C230');
  g.fillStyle = '#FBF6EE'; g.font = `900 ${Math.round(W * .26)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('A', W * .23, H * .74); g.fillText('B', W * .71, H * .74); g.fillText('C', W * .47, H * .32);
  /* 見た目 98〜99：つみ木。上と左のふちに光・下と右にかげ（面取り）／文字のまわりのくぼみの輪 */
  for (const [x, y] of [[W * .02, H * .52], [W * .5, H * .52], [W * .26, H * .1]]) { const sz = W * .42; g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(x + 5, y + 2, sz - 10, 3); g.fillRect(x + 2, y + 5, 3, sz - 10); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x + 5, y + sz - 5, sz - 10, 3); g.fillRect(x + sz - 5, y + 5, 3, sz - 10);
    g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; rrect(g, x + sz * .13, y + sz * .13, sz * .74, sz * .74, 5); g.stroke(); }
}
function paintCushions(g, W, H) { // two zabuton cushions stacked: plump, with the centre tuft and corner tassels
  g.fillStyle = 'rgba(40,30,20,.28)'; g.beginPath(); g.ellipse(W / 2, H - 6, W * .47, 7, 0, 0, Math.PI * 2); g.fill();
  const cols = [['#6E7FA6', '#465577'], ['#C98E4E', '#8E5E2E']];
  for (let k = 0; k < 2; k++) { const h = H * .4, y = H - 8 - h * (k + 1) * .9, x = W * (.05 + k * .02), w = W * (.9 - k * .04);
    puffLayer(g, x, y, w, h, cols[k][0], cols[k][1], { bulge: .35, sag: .18 });
    g.fillStyle = 'rgba(30,20,10,.28)'; g.beginPath(); g.ellipse(W / 2, y + h * .42, 5, 3, 0, 0, Math.PI * 2); g.fill(); // the centre tuft
    g.strokeStyle = '#E9C9A0'; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 - 5, y + h * .38); g.lineTo(W / 2 + 5, y + h * .46); g.moveTo(W / 2 + 5, y + h * .38); g.lineTo(W / 2 - 5, y + h * .46); g.stroke();
    g.fillStyle = shadeHex(cols[k][0], .8); for (const tx of [x - 2, x + w + 2]) { g.beginPath(); g.ellipse(tx, y + h * .5, 3.5, 6, 0, 0, Math.PI * 2); g.fill(); } } // corner tassels
}
function paintPot(g, W, H) { /* 見た目 41〜44：両手なべ。横にみがいた金属の濃淡／両わきの取っ手／ふたのふちの光／ふたのつまみを丸く */
  SH(g, W, H); { const mg = g.createLinearGradient(W * .08, 0, W * .92, 0); mg.addColorStop(0, '#7B8894'); mg.addColorStop(.18, '#DDE4EA'); mg.addColorStop(.4, '#A9B5C0'); mg.addColorStop(.8, '#8794A0'); mg.addColorStop(1, '#5E6A76'); g.fillStyle = mg; } rrect(g, W * .08, H * .2, W * .84, H * .78, [4, 4, 20, 20]); g.fill();
  g.fillStyle = vgrad(g, H * .2, H, [[0, 'rgba(255,255,255,.12)'], [.7, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.25)']]); rrect(g, W * .08, H * .2, W * .84, H * .78, [4, 4, 20, 20]); g.fill();
  g.strokeStyle = '#3F4A55'; g.lineWidth = H * .05; g.lineCap = 'round'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(W * (.5 + sd * .42), H * .34); g.quadraticCurveTo(W * (.5 + sd * .52), H * .38, W * (.5 + sd * .42), H * .46); g.stroke(); }
  g.fillStyle = vgrad(g, H * .1, H * .24, [[0, '#B4BFC9'], [1, '#6E7B88']]); rrect(g, W * .03, H * .13, W * .94, H * .1, 6); g.fill(); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(W * .07, H * .145, W * .86, H * .014);
  g.fillStyle = vgrad(g, H * .04, H * .14, [[0, '#C9D2DA'], [1, '#8492A0']]); g.beginPath(); g.ellipse(W / 2, H * .13, W * .3, H * .05, 0, Math.PI, 0); g.fill();
  g.fillStyle = vgrad(g, 0, H * .1, [[0, '#5A6672'], [1, '#2B343D']]); g.beginPath(); g.ellipse(W / 2, H * .055, W * .09, H * .05, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(W * .47, H * .035, W * .035, H * .012, -.2, 0, Math.PI * 2); g.fill();
}
function paintClock(g, W, H) {
  SH(g, W, H); g.fillStyle = '#C9962F'; for (const x of [.22, .78]) { g.beginPath(); g.arc(W * x, H * .14, W * .14, Math.PI, 0); g.fill(); }
  g.strokeStyle = '#3B2A20'; g.lineWidth = 5; g.beginPath(); g.moveTo(W * .2, H * .98); g.lineTo(W * .3, H * .82); g.moveTo(W * .8, H * .98); g.lineTo(W * .7, H * .82); g.stroke();
  g.fillStyle = vgrad(g, H * .14, H * .9, [[0, '#E86A5F'], [1, '#A8352C']]); g.beginPath(); g.arc(W / 2, H * .52, W * .42, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FBF6EE'; g.beginPath(); g.arc(W / 2, H * .52, W * .32, 0, Math.PI * 2); g.fill(); /* 見た目 94〜97：目ざまし時計。文字盤の目もり／ベルのつやと、まん中のハンマー／針の中心のとめ具／ガラスのうつりこみ */
  g.fillStyle = '#3B2A20'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r0 = W * (i % 3 ? .285 : .265), r1 = W * .305; g.save(); g.translate(W / 2, H * .52); g.rotate(a); g.fillRect(-(i % 3 ? 1 : 2), -r1, i % 3 ? 2 : 4, r1 - r0); g.restore(); }
  g.strokeStyle = '#2B2B2B'; g.lineCap = 'round'; g.lineWidth = 5; g.beginPath(); g.moveTo(W / 2, H * .52); g.lineTo(W * .66, H * .58); g.stroke(); g.lineWidth = 3.4; g.beginPath(); g.moveTo(W / 2, H * .52); g.lineTo(W / 2, H * .29); g.stroke(); g.strokeStyle = '#C8463C'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(W / 2, H * .52); g.lineTo(W * .36, H * .66); g.stroke();
  g.fillStyle = '#C9962F'; g.beginPath(); g.arc(W / 2, H * .52, W * .03, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.4)'; for (const x of [.17, .73]) { g.beginPath(); g.ellipse(W * x, H * .08, W * .05, H * .02, -.4, 0, Math.PI * 2); g.fill(); } g.fillStyle = '#8A6A1E'; g.fillRect(W * .485, H * .02, W * .03, H * .1); g.beginPath(); g.arc(W / 2, H * .025, W * .035, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.ellipse(W * .38, H * .38, W * .12, H * .05, -.7, 0, Math.PI * 2); g.fill();
}
function paintBinoculars(g, W, H) { /* 見た目 10〜13：展望台の望遠鏡。箱に黒丸 2 つ → 丸い鏡筒とレンズのガラス／コイン投入口／支柱のくびれ／台座のボルト */
  SH(g, W, H); g.fillStyle = vgrad(g, H * .4, H, [[0, '#6A7682'], [1, '#2F3B47']]); g.beginPath(); g.moveTo(W * .4, H * .38); g.lineTo(W * .6, H * .38); g.lineTo(W * .57, H * .86); g.lineTo(W * .43, H * .86); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(W * .43, H * .4, W * .035, H * .44);
  g.fillStyle = vgrad(g, H * .84, H, [[0, '#56626E'], [1, '#27313B']]); rrect(g, W * .2, H * .86, W * .6, H * .12, 6); g.fill(); g.fillStyle = '#AEB8C1'; for (const x of [.27, .73]) { g.beginPath(); g.arc(W * x, H * .92, W * .022, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = vgrad(g, 0, H * .4, [[0, '#C9D2DA'], [.5, '#9AA6B1'], [1, '#6F7C88']]); rrect(g, W * .05, H * .05, W * .9, H * .32, 14); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; rrect(g, W * .09, H * .07, W * .82, H * .04, 6); g.fill();
  for (const x of [.28, .72]) { const cx = W * x, cy = H * .21, r = W * .135; g.fillStyle = '#3A444E'; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    const lg = g.createRadialGradient(cx - r * .3, cy - r * .35, r * .1, cx, cy, r * .82); lg.addColorStop(0, '#9FD0F2'); lg.addColorStop(.5, '#2F5878'); lg.addColorStop(1, '#101820'); g.fillStyle = lg; g.beginPath(); g.arc(cx, cy, r * .8, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(cx - r * .32, cy - r * .36, r * .2, r * .12, -.6, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#2B343D'; rrect(g, W * .455, H * .12, W * .09, H * .18, 3); g.fill(); g.fillStyle = '#C9D2DA'; g.fillRect(W * .485, H * .15, W * .03, H * .07);
}
function paintGacha(g, W, H) { /* 見た目 73〜77：カプセルの機械。カプセルを 2 色のたまに／ガラスのうつりこみとふち／ハンドルを回すつまみに／取り出し口／値札の丸 */
  SH(g, W, H); for (const [x, c] of [[.01, '#E86A75'], [.51, '#4E77A0']]) { const x0 = W * x; g.fillStyle = vgrad(g, H * .5, H, [[0, shadeHex(c, 1.14)], [1, shadeHex(c, .68)]]); rrect(g, x0, H * .5, W * .48, H * .48, 7); g.fill();
    g.fillStyle = shadeHex(c, .8); rrect(g, x0, H * .02, W * .48, H * .5, 7); g.fill(); g.fillStyle = 'rgba(226,242,250,.95)'; rrect(g, x0 + W * .025, H * .045, W * .43, H * .45, 5); g.fill();
    const r = rnd(x * 10 + 2); for (let k = 0; k < 11; k++) { const cx = x0 + W * (.08 + r() * .32), cy = H * (.2 + r() * .26), rr = W * .052, col = ['#F2C230', '#E86A75', '#7FD06A', '#C792EA', '#5FA8E0'][(r() * 5) | 0];
      g.fillStyle = '#FBF6EE'; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(cx, cy, rr, Math.PI, 0); g.fill(); g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.stroke(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(cx - rr * .35, cy - rr * .4, rr * .2, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.moveTo(x0 + W * .04, H * .06); g.lineTo(x0 + W * .15, H * .06); g.lineTo(x0 + W * .07, H * .48); g.lineTo(x0 + W * .04, H * .48); g.closePath(); g.fill();
    { const cx = x0 + W * .17, cy = H * .68, rr = W * .075; const kg = g.createRadialGradient(cx - rr * .3, cy - rr * .3, 1, cx, cy, rr); kg.addColorStop(0, '#FFFFFF'); kg.addColorStop(1, '#9AA4AD'); g.fillStyle = kg; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.fill(); g.fillStyle = '#6E7B88'; rrect(g, cx - rr * .9, cy - rr * .2, rr * 1.8, rr * .4, 3); g.fill(); }
    g.fillStyle = 'rgba(20,20,26,.7)'; rrect(g, x0 + W * .28, H * .78, W * .15, H * .14, 5); g.fill(); g.fillStyle = '#FBF6EE'; g.beginPath(); g.arc(x0 + W * .36, H * .63, W * .04, 0, Math.PI * 2); g.fill(); g.fillStyle = shadeHex(c, .7); g.beginPath(); g.arc(x0 + W * .36, H * .63, W * .022, 0, Math.PI * 2); g.fill(); }
}
function paintTripod(g, W, H) { /* 見た目 37〜40：三脚のカメラ。脚を 2 段のパイプに／カメラにレンズのガラス・グリップ・シャッター／カメラバッグにふたとベルト／雲台 */
  SH(g, W, H); g.fillStyle = vgrad(g, H * .56, H, [[0, '#55636F'], [1, '#2B3640']]); rrect(g, W * .22, H * .6, W * .56, H * .38, 9); g.fill(); g.fillStyle = vgrad(g, H * .56, H * .7, [[0, '#63717D'], [1, '#3C4854']]); rrect(g, W * .2, H * .57, W * .6, H * .12, 8); g.fill();
  g.fillStyle = '#1F2830'; g.fillRect(W * .46, H * .66, W * .08, H * .07); g.fillStyle = '#C9CDD2'; g.fillRect(W * .475, H * .69, W * .05, H * .025); g.strokeStyle = '#1F2830'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * .32, H * .58); g.quadraticCurveTo(W * .5, H * .47, W * .68, H * .58); g.stroke();
  for (const [x1, c] of [[.1, '#2A2A2E'], [.9, '#2A2A2E'], [.5, '#3A3A40']]) { g.strokeStyle = c; g.lineCap = 'round'; g.lineWidth = 5.5; g.beginPath(); g.moveTo(W / 2, H * .2); g.lineTo(W * (.5 + (x1 - .5) * .55), H * (x1 === .5 ? .42 : .63)); g.stroke(); g.strokeStyle = '#8A9198'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * (.5 + (x1 - .5) * .55), H * (x1 === .5 ? .42 : .63)); g.lineTo(W * x1, H * (x1 === .5 ? .57 : .98)); g.stroke(); }
  g.fillStyle = '#4A4A50'; rrect(g, W * .44, H * .17, W * .12, H * .05, 3); g.fill();
  g.fillStyle = vgrad(g, H * .02, H * .18, [[0, '#3A3A40'], [1, '#17171A']]); rrect(g, W * .26, H * .03, W * .48, H * .15, 6); g.fill(); g.fillStyle = '#26262A'; rrect(g, W * .26, H * .03, W * .12, H * .15, 6); g.fill(); g.fillStyle = '#C8463C'; g.beginPath(); g.arc(W * .66, H * .035, W * .022, 0, Math.PI * 2); g.fill();
  { const cx = W * .52, cy = H * .105, r = W * .095; g.fillStyle = '#0E0E10'; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); const lg = g.createRadialGradient(cx - r * .3, cy - r * .3, 1, cx, cy, r * .78); lg.addColorStop(0, '#8FC4EC'); lg.addColorStop(.5, '#2F5878'); lg.addColorStop(1, '#0E1820'); g.fillStyle = lg; g.beginPath(); g.arc(cx, cy, r * .76, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(cx - r * .3, cy - r * .32, r * .14, 0, Math.PI * 2); g.fill(); }
}
function paintStoneLantern(g, W, H) { /* 見た目 14〜18：石灯籠。四角の積み重ね → そった笠と宝珠／火袋の格子窓／丸みのある竿／石のつぶつぶ／下のほうの苔 */
  SH(g, W, H); const stone = (c, y0, y1) => vgrad(g, H * y0, H * y1, [[0, shadeHex(c, 1.14)], [1, shadeHex(c, .76)]]);
  g.fillStyle = stone('#8F8A80', .86, .98); rrect(g, W * .1, H * .86, W * .8, H * .12, 5); g.fill(); g.fillStyle = stone('#99948A', .8, .87); rrect(g, W * .2, H * .8, W * .6, H * .07, 4); g.fill();
  { const sg = g.createLinearGradient(W * .36, 0, W * .64, 0); sg.addColorStop(0, '#7E796F'); sg.addColorStop(.35, '#ABA69B'); sg.addColorStop(1, '#77726A'); g.fillStyle = sg; g.beginPath(); g.moveTo(W * .38, H * .42); g.lineTo(W * .62, H * .42); g.quadraticCurveTo(W * .58, H * .62, W * .64, H * .8); g.lineTo(W * .36, H * .8); g.quadraticCurveTo(W * .42, H * .62, W * .38, H * .42); g.fill(); }
  g.fillStyle = stone('#8F8A80', .35, .43); rrect(g, W * .2, H * .35, W * .6, H * .08, 4); g.fill();
  g.fillStyle = stone('#A09B90', .18, .36); rrect(g, W * .27, H * .18, W * .46, H * .18, 3); g.fill();
  g.fillStyle = LT && LT.night > .4 ? '#FFD58A' : '#3E3A33'; g.fillRect(W * .37, H * .21, W * .26, H * .11); g.strokeStyle = '#8F8A80'; g.lineWidth = 2; g.beginPath(); g.moveTo(W * .5, H * .21); g.lineTo(W * .5, H * .32); g.moveTo(W * .37, H * .265); g.lineTo(W * .63, H * .265); g.stroke();
  g.fillStyle = stone('#8A857B', .04, .2); g.beginPath(); g.moveTo(W * .02, H * .2); g.quadraticCurveTo(W * .06, H * .15, W * .16, H * .14); g.quadraticCurveTo(W * .4, H * .1, W * .46, H * .05); g.lineTo(W * .54, H * .05); g.quadraticCurveTo(W * .6, H * .1, W * .84, H * .14); g.quadraticCurveTo(W * .94, H * .15, W * .98, H * .2); g.quadraticCurveTo(W * .5, H * .16, W * .02, H * .2); g.fill();
  g.fillStyle = '#9A958A'; g.beginPath(); g.moveTo(W * .5, 0); g.quadraticCurveTo(W * .58, H * .04, W * .5, H * .065); g.quadraticCurveTo(W * .42, H * .04, W * .5, 0); g.fill();
  g.globalCompositeOperation = 'source-atop'; let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 46; i++) { const x = W * (.2 + rnd() * .6), y = H * (.06 + rnd() * .9); g.fillStyle = rnd() < .5 ? 'rgba(255,255,255,.14)' : 'rgba(40,36,30,.14)'; g.fillRect(x, y, 2, 2); }
  g.fillStyle = 'rgba(96,128,72,.5)'; for (const [x, y, rx, ry] of [[.24, .955, .1, .02], [.7, .87, .09, .014], [.42, .79, .05, .012], [.3, .2, .05, .01]]) { g.beginPath(); g.ellipse(W * x, H * y, W * rx, H * ry, 0, 0, Math.PI * 2); g.fill(); } g.globalCompositeOperation = 'source-over';
}
function paintRickshaw(g, W, H) { /* 見た目 23〜27：人力車。黒い棒 2 本 → スポークのある大きな車輪／ほろのひだ／座席のふかふかとふち／ちょうちん／かじ棒 */
  SH(g, W, H); for (const x of [.09, .91]) { const cx = W * x, cy = H * .7, rx = W * .07, ry = H * .28; g.strokeStyle = '#1C1C1E'; g.lineWidth = W * .028; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = '#8A6A48'; g.lineWidth = 1.6; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * rx * .9, cy + Math.sin(a) * ry * .94); g.stroke(); } g.fillStyle = '#C9A86A'; g.beginPath(); g.ellipse(cx, cy, rx * .28, ry * .12, 0, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = '#3B2A20'; g.lineWidth = W * .022; g.lineCap = 'round'; g.beginPath(); g.moveTo(W * .22, H * .62); g.lineTo(W * .3, H * .93); g.moveTo(W * .78, H * .62); g.lineTo(W * .7, H * .93); g.stroke(); g.beginPath(); g.moveTo(W * .3, H * .93); g.lineTo(W * .7, H * .93); g.stroke();
  g.fillStyle = vgrad(g, H * .02, H * .36, [[0, '#3A3A3E'], [1, '#17171A']]); g.beginPath(); g.moveTo(W * .14, H * .36); g.quadraticCurveTo(W / 2, -H * .02, W * .86, H * .36); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1.6; for (const u of [.3, .42, .58, .7]) { g.beginPath(); g.moveTo(W * u, H * .36); g.quadraticCurveTo(W * (.5 + (u - .5) * .7), H * .16, W * (.5 + (u - .5) * .3), H * .19); g.stroke(); }
  g.fillStyle = '#1C1C1E'; rrect(g, W * .14, H * .58, W * .72, H * .07, 5); g.fill();
  g.fillStyle = vgrad(g, H * .34, H * .6, [[0, '#E55A40'], [.6, '#C8463C'], [1, '#8E2A1C']]); rrect(g, W * .16, H * .35, W * .68, H * .25, 10); g.fill();
  g.strokeStyle = 'rgba(110,25,20,.5)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(W * .5, H * .36); g.lineTo(W * .5, H * .59); g.moveTo(W * .19, H * .47); g.quadraticCurveTo(W * .5, H * .5, W * .81, H * .47); g.stroke(); g.fillStyle = 'rgba(255,255,255,.2)'; rrect(g, W * .2, H * .365, W * .6, H * .035, 6); g.fill();
  g.fillStyle = '#F3E9D0'; g.beginPath(); g.ellipse(W * .25, H * .68, W * .035, H * .06, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C8463C'; g.fillRect(W * .215, H * .665, W * .07, H * .03); g.fillStyle = '#2B2B2B'; g.fillRect(W * .225, H * .615, W * .05, H * .012); g.fillRect(W * .225, H * .735, W * .05, H * .012);
}
function paintTableHigh(g, W, H, kind) { // a table seen from the front: a top, two legs at the sides, open underneath
  SH(g, W, H, .18); const wood = kind === 'chabudai' ? ['#A86E40', '#5E3820'] : kind === 'table' ? ['#C8945F', '#8C6038'] : ['#F1EEE8', '#B9B4AA'];
  const top = kind === 'wboard' ? .02 : .0, legW = W * .06;
  if (kind === 'wboard') { g.fillStyle = '#9AA9B6'; g.fillRect(W * .02, H * .3, legW, H * .7); g.fillRect(W * .92, H * .3, legW, H * .7); g.fillRect(0, H * .96, W * .14, H * .04); g.fillRect(W * .86, H * .96, W * .14, H * .04);
    g.fillStyle = '#C9D2DA'; rrect(g, W * .04, H * .0, W * .92, H * .66, 6); g.fill(); g.fillStyle = '#FFFFFF'; rrect(g, W * .07, H * .03, W * .86, H * .6, 4); g.fill();
    g.strokeStyle = '#4E77A0'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * .15, H * .4); g.lineTo(W * .35, H * .3); g.lineTo(W * .5, H * .45); g.lineTo(W * .75, H * .15); g.stroke(); g.strokeStyle = '#C8463C'; g.beginPath(); g.moveTo(W * .15, H * .52); g.lineTo(W * .55, H * .52); g.stroke();
    /* 見た目 58〜61：ホワイトボード。ペンとイレーザーの受け／マグネット／板のうつりこみ／キャスター */
    g.fillStyle = vgrad(g, H * .64, H * .69, [[0, '#B4C0CB'], [1, '#7E8C99']]); rrect(g, W * .04, H * .64, W * .92, H * .045, 3); g.fill();
    for (const [x, c] of [[.2, '#2B2B2B'], [.29, '#C8463C'], [.38, '#4E77A0']]) { g.fillStyle = c; rrect(g, W * x, H * .625, W * .07, H * .02, 2); g.fill(); g.fillStyle = '#F3EEE6'; g.fillRect(W * x, H * .625, W * .015, H * .02); } g.fillStyle = '#5E6A76'; rrect(g, W * .62, H * .615, W * .14, H * .03, 3); g.fill(); g.fillStyle = '#F3EEE6'; g.fillRect(W * .62, H * .635, W * .14, H * .01);
    for (const [x, y, c] of [[.82, .08, '#C8463C'], [.87, .08, '#F2C230'], [.82, .14, '#4E77A0']]) { g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.arc(W * x + 1, H * y + 1.5, W * .018, 0, Math.PI * 2); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(W * x, H * y, W * .018, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(W * x - 1.5, H * y - 1.5, W * .006, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = 'rgba(180,205,230,.16)'; g.beginPath(); g.moveTo(W * .07, H * .03); g.lineTo(W * .3, H * .03); g.lineTo(W * .12, H * .63); g.lineTo(W * .07, H * .63); g.closePath(); g.fill();
    g.fillStyle = '#2B2B2B'; for (const x of [.03, .11, .89, .97]) { g.beginPath(); g.arc(W * x, H * .985, W * .018, 0, Math.PI * 2); g.fill(); } return; }
  g.fillStyle = vgrad(g, H * .2, H, [[0, wood[1]], [1, shadeHex(wood[1], .7)]]); g.fillRect(W * .05, H * .2, legW, H * .78); g.fillRect(W * .89, H * .2, legW, H * .78);
  g.fillStyle = vgrad(g, top, H * .22, [[0, shadeHex(wood[0], 1.15)], [1, wood[1]]]); rrect(g, 0, top, W, H * .22, 5); g.fill();
  g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(W * .02, top + 2, W * .96, H * .03);
  /* 見た目 62〜64：テーブル。天板の下の幕板とかげ／木目／脚の内側のかげ */
  g.fillStyle = shadeHex(wood[1], .82); g.fillRect(W * .07, H * .22, W * .86, H * .07); g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(W * .02, H * .22, W * .96, H * .018);
  if (kind !== 'mtable') { g.strokeStyle = 'rgba(70,40,15,.18)'; g.lineWidth = 1.2; for (const [y, a, b] of [[.07, .05, .6], [.12, .3, .95], [.165, .08, .5]]) { g.beginPath(); g.moveTo(W * a, H * y); g.quadraticCurveTo(W * (a + b) / 2, H * (y + .02), W * b, H * y); g.stroke(); } }
  g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(W * .05 + legW * .62, H * .29, legW * .38, H * .69); g.fillRect(W * .89, H * .29, legW * .38, H * .69);
}
function paintShoes(g, W, H, c) { /* 見た目 54〜57：くつ・スリッパ（後ろから見た形）。四角 → かかとの丸みと口の開き／底のふちとつま先のふくらみ／ぬい目／かかとのつまみ */
  SH(g, W, H, .22); for (const x of [.02, .52]) { const x0 = W * x, w = W * .46, cx = x0 + w / 2;
    g.fillStyle = vgrad(g, H * .2, H, [[0, shadeHex(c, 1.15)], [1, shadeHex(c, .75)]]); g.beginPath(); g.moveTo(x0 + w * .04, H * .88); g.bezierCurveTo(x0 - w * .02, H * .4, x0 + w * .2, H * .2, cx, H * .2); g.bezierCurveTo(x0 + w * .8, H * .2, x0 + w * 1.02, H * .4, x0 + w * .96, H * .88); g.closePath(); g.fill();
    g.fillStyle = 'rgba(30,20,15,.6)'; g.beginPath(); g.ellipse(cx, H * .34, w * .27, H * .1, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(cx, H * .36, w * .27, H * .1, 0, .15, Math.PI - .15); g.lineTo(cx - w * .27, H * .34); g.fill(); // はき口と、その奥の中じき
    g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.5; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(cx, H * .46); g.lineTo(cx, H * .84); g.stroke(); g.setLineDash([]);
    g.fillStyle = shadeHex(c, .6); rrect(g, cx - w * .06, H * .16, w * .12, H * .12, 3); g.fill();
    g.fillStyle = vgrad(g, H * .84, H * .98, [[0, '#F3F1EC'], [1, '#B4B0A8']]); rrect(g, x0 + w * .01, H * .84, w * .98, H * .13, 6); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x0 + w * .03, H * .84, w * .94, 2);
    g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(x0 + w * .28, H * .56, w * .08, H * .16, .2, 0, Math.PI * 2); g.fill(); }
}
function paintRoomba(g, W, H) {
  SH(g, W, H, .25); g.fillStyle = vgrad(g, H * .1, H, [[0, '#55565E'], [1, '#22232A']]); g.beginPath(); g.ellipse(W / 2, H * .55, W * .48, H * .42, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#6A6A72'; g.beginPath(); g.ellipse(W / 2, H * .38, W * .3, H * .2, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#7FD06A'; g.beginPath(); g.arc(W / 2, H * .6, 4, 0, Math.PI * 2); g.fill();
}
function paintBarrier2(g, W, H) { // a road barrier with a solid panel to the ground: plainly something to jump
  SH(g, W, H); g.fillStyle = '#3B3E42'; for (const x of [W * .04, W * .9]) g.fillRect(x, H * .14, W * .06, H * .84);
  g.save(); rrect(g, W * .02, H * .2, W * .96, H * .78, 6); g.clip(); g.fillStyle = '#F2C230'; g.fillRect(0, H * .2, W, H * .78); g.fillStyle = '#222'; for (let x = -W; x < W * 1.2; x += W * .18) { g.beginPath(); g.moveTo(x, H); g.lineTo(x + W * .09, H); g.lineTo(x + W * .09 + H * .8, H * .2); g.lineTo(x + H * .8, H * .2); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(0, H * .2, W, H * .05); g.restore();
  g.fillStyle = '#FF5A3C'; g.beginPath(); g.arc(W / 2, H * .1, W * .05, 0, Math.PI * 2); g.fill();
}
Object.assign(ART, {
  papers: () => artCanvas('papers', 220, 130, (g, w, h) => paintPapers(g, w, h, 0)), paperTall: () => artCanvas('paperTall', 220, 380, (g, w, h) => paintPapers(g, w, h, 1)),
  plant: () => artCanvas('plant', 240, 420, paintPlant), chair: () => artCanvas('chair', 200, 170, paintChair),
  suitcase: o => artCanvas('suitcase|' + o.av.c, 200, 170, (g, w, h) => paintSuitcase(g, w, h, o.av.c)), bags: () => artCanvas('bags', 220, 150, paintBags),
  crate: o => artCanvas('crate' + o.av.n, 200, 100 * o.av.n + 20, (g, w, h) => paintCrates(g, w, h, o.av.n)), stroller: () => artCanvas('stroller', 200, 240, paintStroller),
  sign: o => artCanvas('sign|' + o.av.t, 240, 320, (g, w, h) => paintSandwich(g, w, h, o.av.t)), parasol: o => artCanvas('cafe|' + o.av.c, 320, 440, (g, w, h) => paintCafe(g, w, h, o.av.c)),
  flowers: () => artCanvas('flowers', 240, 160, paintFlowers), leafpile: () => artCanvas('leaves', 260, 120, paintLeaves), snowball: () => artCanvas('snowball', 200, 190, paintSnowball), stoolsO: () => artCanvas('stools', 240, 130, paintStools),
  umbrella: () => artCanvas('umbrellas', 180, 380, paintUmbrellas), copier: () => artCanvas('copier', 280, 280, paintCopier), mug: () => artCanvas('mug', 200, 200, paintMug),
  toys: () => artCanvas('toys', 200, 180, paintToys), zabuton: () => artCanvas('zabuton', 260, 100, paintCushions), pot: () => artCanvas('pot', 220, 180, paintPot), clock: () => artCanvas('clock', 180, 180, paintClock),
  telescope: () => artCanvas('scope', 180, 320, paintBinoculars), gachaO: () => artCanvas('gacha', 260, 340, paintGacha), tripod: () => artCanvas('tripod', 200, 330, paintTripod),
  stoneLanternO: () => artCanvas('lantern', 200, 380, paintStoneLantern), jokoro: () => artCanvas('lantern', 200, 380, paintStoneLantern), rickshaw: () => artCanvas('rickshaw', 260, 360, paintRickshaw),
  table: () => artCanvas('table', 320, 170, (g, w, h) => paintTableHigh(g, w, h, 'table')), chabudai: () => artCanvas('chabudai', 320, 160, (g, w, h) => paintTableHigh(g, w, h, 'chabudai')),
  mtable: () => artCanvas('mtable', 320, 160, (g, w, h) => paintTableHigh(g, w, h, 'mtable')), wboard: () => artCanvas('wboard', 320, 420, (g, w, h) => paintTableHigh(g, w, h, 'wboard')),
  shoes: () => artCanvas('shoes', 180, 80, (g, w, h) => paintShoes(g, w, h, '#C8463C')), slipper: () => artCanvas('slipper', 180, 70, (g, w, h) => paintShoes(g, w, h, '#4E77A0')), roomba: () => artCanvas('roomba', 200, 70, paintRoomba),
  barrier: () => artCanvas('barrier2', 240, 150, paintBarrier2),
});

/* ================= props as illustrations =================
   Free-standing props (vending machines, plants, lanterns, stalls, bicycles...) are painted pieces stood in the scene
   instead of stacks of boxes; furniture against a wall keeps its body but shows a painted front. */
function paintVending(g, W, H, night, col) {
  SH(g, W, H, .3); g.fillStyle = vgrad(g, 0, H, [[0, shadeHex(col, 1.1)], [1, shadeHex(col, .75)]]); rrect(g, W * .04, H * .02, W * .92, H * .96, 6); g.fill();
  g.fillStyle = night ? '#FFFBEA' : '#F4F6F8'; rrect(g, W * .1, H * .08, W * .8, H * .5, 4); g.fill();
  const cs = ['#C8463C', '#F2C230', '#4E77A0', '#5F9E5A', '#E86A75', '#F08A2E', '#FBF6EE'];
  for (let row = 0; row < 3; row++) for (let k = 0; k < 5; k++) { const x = W * (.14 + k * .148), y = H * (.12 + row * .15), c = cs[(row * 5 + k * 3) % 7], bw = W * .1, bh = H * .1; /* 見た目 182〜185：自動販売機。色の四角 → びん・かんの形（首・ラベル・つや）／たなの板／えらぶボタンの光／お金の入れ口とおつり口 */
      if ((row + k) % 2) { g.fillStyle = vgrad(g, y, y + bh, [[0, shadeHex(c, 1.15)], [1, shadeHex(c, .78)]]); rrect(g, x + bw * .12, y + bh * .1, bw * .76, bh * .9, 3); g.fill(); g.fillStyle = '#C9CDD2'; g.fillRect(x + bw * .12, y + bh * .1, bw * .76, bh * .08); }
      else { g.fillStyle = vgrad(g, y, y + bh, [[0, shadeHex(c, 1.15)], [1, shadeHex(c, .78)]]); rrect(g, x + bw * .14, y + bh * .3, bw * .72, bh * .7, 3); g.fill(); g.fillRect(x + bw * .36, y + bh * .06, bw * .28, bh * .28); g.fillStyle = '#F3EEE6'; g.fillRect(x + bw * .34, y, bw * .32, bh * .08); g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(x + bw * .14, y + bh * .5, bw * .72, bh * .22); }
      g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(x + bw * .2, y + bh * .34, bw * .1, bh * .56);
      g.fillStyle = '#8A9098'; g.fillRect(W * .1, y + bh * 1.02, W * .8, H * .008); g.fillStyle = k % 3 ? '#4E77A0' : '#C8463C'; rrect(g, x + bw * .2, y + H * .112, bw * .6, H * .016, 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x + bw * .25, y + H * .114, bw * .2, H * .005); }
  if (night) { g.fillStyle = 'rgba(255,250,220,.35)'; g.fillRect(W * .1, H * .08, W * .8, H * .5); }
  g.fillStyle = '#2B2B2B'; rrect(g, W * .62, H * .62, W * .2, H * .1, 3); g.fill(); g.fillStyle = '#C9CDD2'; g.fillRect(W * .66, H * .64, W * .12, H * .012); g.fillStyle = '#7FD06A'; g.fillRect(W * .66, H * .67, W * .05, H * .02); g.fillStyle = '#3A3A40'; rrect(g, W * .2, H * .64, W * .16, H * .06, 3); g.fill();
  g.fillStyle = '#1C1C1E'; rrect(g, W * .14, H * .8, W * .72, H * .12, 4); g.fill(); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(W * .16, H * .81, W * .68, H * .02);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(W * .08, H * .04, W * .04, H * .9);
}
function paintPost(g, W, H) { /* 見た目 186〜189：ポスト。横の丸みの濃淡／投入口のひさしと奥のかげ／下の台と帯／集める時間の札 */
  SH(g, W, H); g.fillStyle = '#6E1F18'; rrect(g, W * .1, H * .9, W * .8, H * .08, 4); g.fill();
  { const bg = g.createLinearGradient(W * .12, 0, W * .88, 0); bg.addColorStop(0, '#9C2F27'); bg.addColorStop(.3, '#EC6A5C'); bg.addColorStop(.6, '#C8463C'); bg.addColorStop(1, '#8A251E'); g.fillStyle = bg; } rrect(g, W * .12, H * .12, W * .76, H * .8, [W * .3, W * .3, 6, 6]); g.fill();
  g.fillStyle = vgrad(g, H * .12, H * .92, [[0, 'rgba(255,255,255,.14)'], [.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.2)']]); rrect(g, W * .12, H * .12, W * .76, H * .8, [W * .3, W * .3, 6, 6]); g.fill();
  g.fillStyle = '#7A241E'; g.fillRect(W * .12, H * .78, W * .76, H * .02);
  g.fillStyle = '#8A251E'; rrect(g, W * .2, H * .285, W * .6, H * .035, 3); g.fill(); g.fillStyle = '#120D0D'; rrect(g, W * .24, H * .32, W * .52, H * .06, 3); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(W * .2, H * .285, W * .6, H * .008);
  g.fillStyle = 'rgba(0,0,0,.2)'; rrect(g, W * .31, H * .49, W * .4, H * .18, 3); g.fill(); g.fillStyle = '#FBF6EE'; rrect(g, W * .3, H * .48, W * .4, H * .18, 3); g.fill();
  g.fillStyle = '#C8463C'; g.font = `900 ${Math.round(W * .2)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('〒', W / 2, H * .57);
  g.fillStyle = '#F3EEE6'; rrect(g, W * .34, H * .7, W * .32, H * .055, 2); g.fill(); g.fillStyle = 'rgba(60,40,30,.5)'; for (const y of [.715, .735]) g.fillRect(W * .38, H * y, W * .24, H * .006);
  g.fillStyle = 'rgba(255,255,255,.28)'; rrect(g, W * .2, H * .2, W * .06, H * .66, 4); g.fill();
}
function bicycle(g, x, y, s, col) { g.strokeStyle = '#1C1C1E'; g.lineWidth = 3; for (const dx of [-.32, .32]) { g.beginPath(); g.arc(x + dx * s, y, s * .26, 0, Math.PI * 2); g.stroke(); }
  g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); g.moveTo(x - .32 * s, y); g.lineTo(x - .05 * s, y - .3 * s); g.lineTo(x + .22 * s, y - .3 * s); g.lineTo(x + .32 * s, y); g.moveTo(x - .05 * s, y - .3 * s); g.lineTo(x + .02 * s, y); g.lineTo(x - .32 * s, y); g.moveTo(x + .22 * s, y - .3 * s); g.lineTo(x + .28 * s, y - .45 * s); g.stroke();
  g.fillStyle = '#2B2B2B'; g.fillRect(x - .1 * s, y - .36 * s, .14 * s, .05 * s); g.fillRect(x + .22 * s, y - .48 * s, .14 * s, .04 * s);
  g.fillStyle = '#B9C3CC'; rrect(g, x + .3 * s, y - .44 * s, .16 * s, .12 * s, 2); g.fill(); }
function paintBikes(g, W, H) { SH(g, W, H, .22); const cs = ['#3A6FB0', '#C8463C', '#5F9E5A', '#E9E9E9']; for (let k = 0; k < 3; k++) bicycle(g, W * (.2 + k * .3), H * .72 - k * 2, W * .34, cs[k % 4]); }
function seasonShadow(g, W, H, k) { g.fillStyle = `rgba(40,25,10,${k || .28})`; g.beginPath(); g.ellipse(W / 2, H - 6, W * .4, 7, 0, 0, Math.PI * 2); g.fill(); }
function seasonPot(g, cx, y, w, h, c0, c1) { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.beginPath(); g.moveTo(cx - w / 2, y); g.lineTo(cx + w / 2, y); g.lineTo(cx + w * .38, y + h); g.lineTo(cx - w * .38, y + h); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(cx - w / 2, y, w, h * .14); }
function paintXmasTree(g, W, H, night) { // a small decorated fir in a pot; the lights glow after dark
  seasonShadow(g, W, H); seasonPot(g, W / 2, H * .8, W * .42, H * .17, '#B5552E', '#7A3418');
  for (const [y0, y1, w] of [[.5, .82, .9], [.3, .62, .72], [.1, .42, .52]]) { const gr = g.createLinearGradient(0, H * y0, 0, H * y1); gr.addColorStop(0, '#3F8A5E'); gr.addColorStop(1, '#245C3C'); g.fillStyle = gr; g.beginPath(); g.moveTo(W / 2, H * y0); g.quadraticCurveTo(W * (.5 + w * .2), H * (y0 + y1) / 2, W * (.5 + w / 2), H * y1); g.quadraticCurveTo(W / 2, H * (y1 + .03), W * (.5 - w / 2), H * y1); g.quadraticCurveTo(W * (.5 - w * .2), H * (y0 + y1) / 2, W / 2, H * y0); g.fill(); }
  g.strokeStyle = 'rgba(242,194,48,.8)'; g.lineWidth = 3; for (const [y, w] of [[.4, .34], [.6, .5], [.76, .62]]) { g.beginPath(); g.moveTo(W * (.5 - w / 2), H * (y - .03)); g.quadraticCurveTo(W / 2, H * (y + .04), W * (.5 + w / 2), H * (y - .05)); g.stroke(); }
  const r = rnd(4); if (night) { g.save(); g.shadowColor = 'rgba(255,220,120,.9)'; g.shadowBlur = 10; }
  for (let k = 0; k < 16; k++) { const y = .18 + r() * .62, w = (y - .1) * .8; g.fillStyle = ['#F2C230', '#E8465E', '#7FB8E6', '#FBF6EE'][k % 4]; g.beginPath(); g.arc(W * (.5 + (r() - .5) * w), H * y, 4, 0, Math.PI * 2); g.fill(); }
  if (night) g.restore();
  g.fillStyle = '#F2C230'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 6 : 14; g.lineTo(W / 2 + Math.cos(a) * rr, H * .09 + Math.sin(a) * rr); } g.closePath(); g.fill();
}
function paintKadomatsu(g, W, H) { // a New Year kadomatsu: three cut bamboo stems with pine, bound in straw
  seasonShadow(g, W, H);
  for (const [x, top, c] of [[.38, .12, '#6FA352'], [.6, .2, '#5F9E5A'], [.5, .04, '#7DB55E']]) { const gr = g.createLinearGradient(W * (x - .08), 0, W * (x + .08), 0); gr.addColorStop(0, '#4E7E3A'); gr.addColorStop(.5, c); gr.addColorStop(1, '#3F6A30'); g.fillStyle = gr; g.beginPath(); g.moveTo(W * (x - .08), H * .7); g.lineTo(W * (x - .08), H * (top + .06)); g.lineTo(W * (x + .08), H * top); g.lineTo(W * (x + .08), H * .7); g.closePath(); g.fill(); g.fillStyle = '#E8D9A8'; g.beginPath(); g.ellipse(W * x, H * (top + .03), W * .08, H * .025, -.35, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#2F6B3F'; for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; g.beginPath(); g.ellipse(W * (.5 + Math.cos(a) * .3), H * (.66 + Math.sin(a) * .05), 12, 4, a, 0, Math.PI * 2); g.fill(); }
  const gr = g.createLinearGradient(0, H * .68, 0, H * .98); gr.addColorStop(0, '#D9BE7A'); gr.addColorStop(1, '#A98A48'); g.fillStyle = gr; g.beginPath(); g.moveTo(W * .2, H * .68); g.lineTo(W * .8, H * .68); g.lineTo(W * .76, H * .98); g.lineTo(W * .24, H * .98); g.closePath(); g.fill();
  g.strokeStyle = '#6E5430'; g.lineWidth = 3; for (const y of [.76, .88]) { g.beginPath(); g.moveTo(W * .21, H * y); g.lineTo(W * .79, H * y); g.stroke(); }
  g.fillStyle = '#C8463C'; g.beginPath(); g.arc(W * .3, H * .62, 6, 0, Math.PI * 2); g.arc(W * .68, H * .63, 5, 0, Math.PI * 2); g.fill();
}
function paintHeartBox(g, W, H) { // a heart-shaped gift box with a ribbon
  seasonShadow(g, W, H); const cx = W / 2, cy = H * .56;
  const gr = g.createLinearGradient(0, H * .2, 0, H * .95); gr.addColorStop(0, '#F06A7E'); gr.addColorStop(1, '#B8324A'); g.fillStyle = gr; g.beginPath(); g.moveTo(cx, H * .92); g.bezierCurveTo(W * .06, H * .6, W * .14, H * .16, cx, H * .34); g.bezierCurveTo(W * .86, H * .16, W * .94, H * .6, cx, H * .92); g.fill();
  g.fillStyle = '#F2C230'; g.fillRect(cx - 5, H * .3, 10, H * .6); g.beginPath(); g.ellipse(cx - 14, H * .3, 14, 8, -.5, 0, Math.PI * 2); g.ellipse(cx + 14, H * .3, 14, 8, .5, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(W * .32, cy - H * .12, W * .07, H * .05, -.6, 0, Math.PI * 2); g.fill();
  /* 見た目 119〜121：ハートの箱。ふたの合わせ目／リボンの結び目とたれ／リボンのつや */
  g.strokeStyle = 'rgba(120,20,40,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W * .2, H * .54); g.quadraticCurveTo(cx, H * .62, W * .8, H * .54); g.stroke();
  g.fillStyle = '#D9A51E'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(cx, H * .31); g.quadraticCurveTo(cx + sd * 12, H * .4, cx + sd * 20, H * .46); g.lineTo(cx + sd * 10, H * .46); g.quadraticCurveTo(cx + sd * 5, H * .4, cx, H * .34); g.fill(); } g.beginPath(); g.arc(cx, H * .31, 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(cx - 4, H * .36, 2.5, H * .5); g.beginPath(); g.ellipse(cx - 16, H * .285, 6, 2.4, -.5, 0, Math.PI * 2); g.ellipse(cx + 12, H * .285, 6, 2.4, .5, 0, Math.PI * 2); g.fill();
}
function paintSakuraPot(g, W, H) { // a potted cherry branch in bloom
  seasonShadow(g, W, H); seasonPot(g, W / 2, H * .78, W * .4, H * .19, '#E9E2D2', '#BFB39A');
  g.strokeStyle = '#6B4631'; g.lineCap = 'round'; for (const [x1, y1, w] of [[.3, .2, 7], [.66, .12, 6], [.5, .32, 5]]) { g.lineWidth = w; g.beginPath(); g.moveTo(W / 2, H * .78); g.quadraticCurveTo(W * (x1 + .5) / 2, H * .5, W * x1, H * y1); g.stroke(); }
  const r = rnd(8); for (let k = 0; k < 70; k++) { const a = r() * Math.PI * 2, d = r(); const x = W * (.5 + Math.cos(a) * .36 * d), y = H * (.3 + Math.sin(a) * .2 * d); g.fillStyle = r() < .3 ? '#F2A8BC' : '#F9D3DE'; g.beginPath(); g.arc(x, y, 6 + r() * 4, 0, Math.PI * 2); g.fill(); }
}
function paintBambooWish(g, W, H) { // Tanabata bamboo with paper wishes (tanzaku)
  seasonShadow(g, W, H); g.fillStyle = '#7FA65A'; g.fillRect(W * .46, H * .05, W * .08, H * .9); g.fillStyle = '#5E8A40'; for (let y = .15; y < .95; y += .14) g.fillRect(W * .45, H * y, W * .1, 4);
  g.fillStyle = '#6F9E4E'; const r = rnd(6); for (let k = 0; k < 16; k++) { const y = H * (.08 + r() * .5), sd = r() < .5 ? -1 : 1; g.beginPath(); g.ellipse(W * .5 + sd * W * (.12 + r() * .2), y, W * .16, 6, sd * .4, 0, Math.PI * 2); g.fill(); }
  for (let k = 0; k < 7; k++) { const x = W * (.18 + r() * .64), y = H * (.18 + r() * .4); g.strokeStyle = 'rgba(80,60,40,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x, y); g.stroke(); g.fillStyle = ['#E8465E', '#F2C230', '#7FB8E6', '#A78BD6', '#FBF6EE'][k % 5]; g.fillRect(x - 6, y, 12, 34); }
}
function paintJackO(g, W, H, night) { // a carved pumpkin with a friendly face; it glows after dark
  g.fillStyle = 'rgba(40,25,10,.3)'; g.beginPath(); g.ellipse(W / 2, H - 6, W * .44, 7, 0, 0, Math.PI * 2); g.fill();
  const cy = H * .58, ry = H * .36;
  for (const [x, rx, c0, c1] of [[-.26, .24, '#C9561A', '#8E3A10'], [.26, .24, '#C9561A', '#8E3A10'], [-.12, .25, '#E97A24', '#A9461A'], [.12, .25, '#E97A24', '#A9461A'], [0, .2, '#F59339', '#C2581C']]) {
    const gr = g.createRadialGradient(W * (.5 + x) - 8, cy - ry * .4, 4, W * (.5 + x), cy, ry * 1.1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.beginPath(); g.ellipse(W * (.5 + x), cy, W * rx, ry, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#5E4426'; g.beginPath(); g.moveTo(W * .47, cy - ry + 6); g.quadraticCurveTo(W * .46, cy - ry - 16, W * .55, cy - ry - 22); g.lineTo(W * .56, cy - ry - 14); g.quadraticCurveTo(W * .52, cy - ry - 10, W * .53, cy - ry + 6); g.closePath(); g.fill();
  const face = night ? '#FFD45E' : '#4A2410';
  if (night) { g.save(); g.shadowColor = 'rgba(255,190,60,.9)'; g.shadowBlur = 18; }
  g.fillStyle = face;
  const eye = sx => { g.beginPath(); g.moveTo(W * (.5 + sx * .16), cy - ry * .42); g.quadraticCurveTo(W * (.5 + sx * .26), cy - ry * .1, W * (.5 + sx * .07), cy - ry * .08); g.quadraticCurveTo(W * (.5 + sx * .1), cy - ry * .3, W * (.5 + sx * .16), cy - ry * .42); g.fill(); };
  eye(-1); eye(1);
  g.beginPath(); g.moveTo(W * .3, cy + ry * .1); g.quadraticCurveTo(W * .5, cy + ry * .62, W * .7, cy + ry * .1); g.quadraticCurveTo(W * .62, cy + ry * .28, W * .56, cy + ry * .22); g.lineTo(W * .53, cy + ry * .32); g.lineTo(W * .47, cy + ry * .22); g.quadraticCurveTo(W * .4, cy + ry * .3, W * .3, cy + ry * .1); g.fill();
  if (night) g.restore();
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(W * .34, cy - ry * .55, W * .06, ry * .16, -.5, 0, Math.PI * 2); g.fill();
}
function paintAndon(g, W, H, night) {
  SH(g, W, H, .2); g.fillStyle = '#5E3820'; g.fillRect(W * .2, H * .9, W * .6, H * .08); for (const x of [.22, .74]) g.fillRect(W * x, H * .1, W * .04, H * .82);
  g.fillStyle = night ? vgrad(g, H * .12, H * .88, [[0, '#FFF6DA'], [1, '#FFD58A']]) : vgrad(g, H * .12, H * .88, [[0, '#FFF8EA'], [1, '#EADFC8']]); g.fillRect(W * .26, H * .12, W * .48, H * .76);
  g.strokeStyle = 'rgba(90,60,30,.5)'; g.lineWidth = 1.5; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(W * .26, H * (.12 + k * .19)); g.lineTo(W * .74, H * (.12 + k * .19)); g.stroke(); } g.fillStyle = '#5E3820'; g.fillRect(W * .18, H * .06, W * .64, H * .06);
  /* 見た目 198〜200：行灯。たての桟（さん）／和紙のせんい・中のあかりの芯／脚と、わくの面取り */
  g.strokeStyle = 'rgba(90,60,30,.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(W * .5, H * .12); g.lineTo(W * .5, H * .88); g.stroke();
  { const cg = g.createRadialGradient(W / 2, H * .56, 2, W / 2, H * .56, W * .3); cg.addColorStop(0, night ? 'rgba(255,255,235,.75)' : 'rgba(255,255,255,.35)'); cg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = cg; g.fillRect(W * .26, H * .12, W * .48, H * .76); }
  g.strokeStyle = 'rgba(160,130,90,.22)'; g.lineWidth = 1; for (const [x, y, l] of [[.3, .2, .1], [.56, .28, .12], [.34, .5, .08], [.6, .62, .1], [.32, .76, .12], [.55, .82, .07]]) { g.beginPath(); g.moveTo(W * x, H * y); g.lineTo(W * (x + l), H * (y + .012)); g.stroke(); }
  g.fillStyle = '#4A2C18'; for (const x of [.2, .72]) g.fillRect(W * x, H * .96, W * .08, H * .035); g.fillStyle = 'rgba(255,220,180,.25)'; g.fillRect(W * .18, H * .06, W * .64, H * .01); g.fillRect(W * .22, H * .1, W * .012, H * .8);
}
function paintFloorLamp(g, W, H, night) { /* 見た目 122〜125：フロアランプ。かさに布のひだとふち／夜はまわりのあかり／支柱を金属に／ひものスイッチ */
  SH(g, W, H, .2); g.fillStyle = vgrad(g, H * .94, H, [[0, '#5A4030'], [1, '#2B1E18']]); g.beginPath(); g.ellipse(W / 2, H * .97, W * .3, H * .025, 0, 0, Math.PI * 2); g.fill();
  { const pg = g.createLinearGradient(W * .47, 0, W * .53, 0); pg.addColorStop(0, '#3B2A20'); pg.addColorStop(.4, '#9A7A5A'); pg.addColorStop(1, '#3B2A20'); g.fillStyle = pg; g.fillRect(W * .475, H * .2, W * .05, H * .77); }
  if (night) { const gl = g.createRadialGradient(W / 2, H * .14, W * .1, W / 2, H * .14, W * .5); gl.addColorStop(0, 'rgba(255,220,150,.45)'); gl.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H * .4); }
  g.fillStyle = night ? vgrad(g, 0, H * .22, [[0, '#FFF3D0'], [1, '#FFD58A']]) : vgrad(g, 0, H * .22, [[0, '#FBF6EE'], [1, '#E3D5BC']]); g.beginPath(); g.moveTo(W * .22, H * .22); g.lineTo(W * .32, H * .02); g.lineTo(W * .68, H * .02); g.lineTo(W * .78, H * .22); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(150,120,80,.25)'; g.lineWidth = 1.2; for (let k = 1; k < 7; k++) { g.beginPath(); g.moveTo(W * (.32 + .36 * k / 7), H * .02); g.lineTo(W * (.22 + .56 * k / 7), H * .22); g.stroke(); }
  g.fillStyle = night ? '#E0A85A' : '#C9B594'; g.fillRect(W * .22, H * .21, W * .56, H * .012); g.fillRect(W * .32, H * .015, W * .36, H * .01);
  g.strokeStyle = '#8A6A48'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(W * .6, H * .22); g.lineTo(W * .6, H * .3); g.stroke(); g.fillStyle = '#C9962F'; g.beginPath(); g.arc(W * .6, H * .305, 2.6, 0, Math.PI * 2); g.fill();
}
function puffLayer(g, x, y, w, h, c0, c1, opt) {
  opt = opt || {}; const r = Math.min(h * .5, w * .12), bul = h * (opt.bulge || .16), sag = h * (opt.sag || .06);
  g.save();
  g.beginPath(); g.moveTo(x + r, y + sag);
  g.bezierCurveTo(x + w * .3, y - sag * .6, x + w * .7, y - sag * .6, x + w - r, y + sag);
  g.bezierCurveTo(x + w + bul * .4, y + sag, x + w + bul, y + h * .45, x + w - r * .25, y + h);
  g.bezierCurveTo(x + w * .66, y + h + sag * 1.2, x + w * .34, y + h + sag * 1.2, x + r * .25, y + h);
  g.bezierCurveTo(x - bul, y + h * .45, x - bul * .4, y + sag, x + r, y + sag); g.closePath();
  const gr = g.createLinearGradient(0, y - sag, 0, y + h + sag); gr.addColorStop(0, shadeHex(c0, 1.06)); gr.addColorStop(.35, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.fill();
  g.clip();
  if (opt.dots) { const rr = rnd(opt.seed || 3); g.fillStyle = opt.dots; for (let k = 0; k < w * h / 260; k++) { const px = x + rr() * w, py = y + rr() * h; g.beginPath(); for (let i = 0; i < 5; i++) { const a = i * Math.PI * .4; g.moveTo(px, py); g.arc(px + Math.cos(a) * 2.6, py + Math.sin(a) * 2.6, 1.9, 0, Math.PI * 2); } g.fill(); } }
  if (opt.tufts) { g.fillStyle = 'rgba(120,100,70,.18)'; for (let i = 1; i < 6; i++) { g.beginPath(); g.ellipse(x + w * i / 6, y + h * .5, 2.4, 1.6, 0, 0, Math.PI * 2); g.fill(); } }
  const hl = g.createLinearGradient(0, y, 0, y + h * .5); hl.addColorStop(0, 'rgba(255,255,255,.5)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hl; g.fillRect(x - bul, y - sag, w + bul * 2, h * .5);
  const sd = g.createLinearGradient(0, y + h * .62, 0, y + h + sag); sd.addColorStop(0, 'rgba(40,30,20,0)'); sd.addColorStop(1, 'rgba(40,30,20,.22)'); g.fillStyle = sd; g.fillRect(x - bul, y + h * .6, w + bul * 2, h * .5);
  // the side shading that makes it round
  const sx = g.createLinearGradient(x - bul, 0, x + w + bul, 0); sx.addColorStop(0, 'rgba(40,30,20,.16)'); sx.addColorStop(.12, 'rgba(40,30,20,0)'); sx.addColorStop(.88, 'rgba(40,30,20,0)'); sx.addColorStop(1, 'rgba(40,30,20,.2)'); g.fillStyle = sx; g.fillRect(x - bul, y - sag, w + bul * 2, h + sag * 2);
  g.restore();
}
function paintFutonStack(g, W, H) { // a futon folded away neatly: the mattress in three, the quilt in two, the pillow on top
  g.fillStyle = 'rgba(40,30,20,.28)'; g.beginPath(); g.ellipse(W / 2, H - 8, W * .47, 9, 0, 0, Math.PI * 2); g.fill();
  const cream = ['#F4EFE4', '#D9CFBE'], blue = ['#7E9DC4', '#4F6E98'];
  let y = H - 12; const L = (h, w, c, opt) => { y -= h * .86; puffLayer(g, (W - w) / 2, y, w, h, c[0], c[1], opt); };
  L(36, W * .9, cream, { tufts: 1 }); L(36, W * .9, cream, { tufts: 1, sag: .04 }); L(36, W * .88, cream, { tufts: 1, sag: .05 });
  L(46, W * .86, blue, { dots: 'rgba(255,255,255,.22)', seed: 4, bulge: .22 }); L(46, W * .84, blue, { dots: 'rgba(255,255,255,.22)', seed: 7, bulge: .22, sag: .08 });
  L(34, W * .42, ['#EDE4D2', '#C9B89A'], { bulge: .3, sag: .14 }); // the pillow
  g.strokeStyle = 'rgba(150,120,80,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W * .36, y + 17); g.quadraticCurveTo(W / 2, y + 12, W * .64, y + 17); g.stroke(); // the pillowcase seam
}
function paintBonbori(g, W, H, night) { /* 見た目 19〜22：ぼんぼり。白い箱 → 木のわく組みと和紙の濃淡／桜の紋を花びら 5 枚に／脚の台／夜はまわりにあかり */
  SH(g, W, H, .2); g.fillStyle = vgrad(g, H * .4, H, [[0, '#4A362A'], [1, '#2B1E18']]); g.fillRect(W * .465, H * .4, W * .07, H * .56); g.fillStyle = '#2B1E18'; rrect(g, W * .36, H * .95, W * .28, H * .035, 3); g.fill();
  if (night) { const gl = g.createRadialGradient(W / 2, H * .23, W * .1, W / 2, H * .23, W * .5); gl.addColorStop(0, 'rgba(255,210,150,.45)'); gl.addColorStop(1, 'rgba(255,210,150,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H * .5); }
  g.fillStyle = night ? vgrad(g, H * .06, H * .4, [[0, '#FFF6E4'], [.6, '#FFDCA8'], [1, '#FFC27A']]) : vgrad(g, H * .06, H * .4, [[0, '#FFFFFF'], [1, '#EFE0D2']]); g.beginPath(); g.moveTo(W * .26, H * .07); g.lineTo(W * .74, H * .07); g.lineTo(W * .7, H * .4); g.lineTo(W * .3, H * .4); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(60,40,28,.55)'; g.lineWidth = 1.6; g.beginPath(); for (const u of [.25, .5, .75]) { g.moveTo(W * (.26 + .48 * u), H * .07); g.lineTo(W * (.3 + .4 * u), H * .4); } g.moveTo(W * .28, H * .235); g.lineTo(W * .72, H * .235); g.stroke();
  g.fillStyle = '#2B1E18'; rrect(g, W * .22, H * .035, W * .56, H * .04, 3); g.fill(); rrect(g, W * .27, H * .39, W * .46, H * .03, 2); g.fill(); g.fillStyle = '#4A362A'; g.beginPath(); g.moveTo(W * .3, H * .035); g.lineTo(W * .5, H * .005); g.lineTo(W * .7, H * .035); g.closePath(); g.fill();
  g.save(); g.translate(W / 2, H * .225); g.fillStyle = '#E86A85'; for (let i = 0; i < 5; i++) { g.rotate(Math.PI * 2 / 5); g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-W * .05, -W * .03, -W * .05, -W * .09, -W * .015, -W * .1); g.lineTo(0, -W * .085); g.lineTo(W * .015, -W * .1); g.bezierCurveTo(W * .05, -W * .09, W * .05, -W * .03, 0, 0); g.fill(); } g.fillStyle = '#F6D36B'; g.beginPath(); g.arc(0, 0, W * .018, 0, Math.PI * 2); g.fill(); g.restore();
}
function paintStall(g, W, H, col) { /* 見た目 106〜110：屋台。日よけを、たれのあるしまの布に／くだものを、つやとへたのある玉に／木の箱に板目とふち／柱を丸い金属に／値札にひも */
  SH(g, W, H); for (const x of [.055, .945]) { const pg = g.createLinearGradient(W * x - 5, 0, W * x + 5, 0); pg.addColorStop(0, '#2B2B30'); pg.addColorStop(.45, '#8A8E94'); pg.addColorStop(1, '#2B2B30'); g.fillStyle = pg; g.fillRect(W * x - W * .015, H * .1, W * .03, H * .88); }
  g.fillStyle = vgrad(g, 0, H * .2, [[0, shadeHex(col, 1.18)], [1, shadeHex(col, .8)]]); g.beginPath(); g.moveTo(0, H * .19); g.lineTo(W * .06, H * .04); g.lineTo(W * .94, H * .04); g.lineTo(W, H * .19); g.closePath(); g.fill();
  g.save(); g.clip(); g.fillStyle = 'rgba(255,255,255,.4)'; for (let k = 0; k < 7; k++) if (k % 2) { g.beginPath(); g.moveTo(W * (.06 + k * .126), H * .04); g.lineTo(W * (.06 + (k + 1) * .126), H * .04); g.lineTo(W * (k + 1) / 7, H * .19); g.lineTo(W * k / 7, H * .19); g.closePath(); g.fill(); } g.restore();
  for (let k = 0; k < 7; k++) { g.fillStyle = k % 2 ? '#F3EEE6' : shadeHex(col, .86); g.beginPath(); g.moveTo(W * k / 7, H * .19); g.lineTo(W * (k + 1) / 7, H * .19); g.quadraticCurveTo(W * (k + .5) / 7, H * .27, W * k / 7, H * .19); g.fill(); } g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(0, H * .185, W, H * .012);
  g.fillStyle = vgrad(g, H * .6, H, [[0, '#B07A48'], [1, '#6E4426']]); g.fillRect(W * .06, H * .62, W * .88, H * .36); g.strokeStyle = 'rgba(50,28,12,.35)'; g.lineWidth = 1.5; for (const y of [.74, .86]) { g.beginPath(); g.moveTo(W * .06, H * y); g.lineTo(W * .94, H * y); g.stroke(); } g.fillStyle = '#8A5A32'; g.fillRect(W * .04, H * .6, W * .92, H * .035); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(W * .04, H * .6, W * .92, 2);
  const r = rnd(5); for (let k = 0; k < 16; k++) { const col2 = ['#E86A75', '#F2C230', '#5F9E5A', '#F08A2E', '#F3D9A0', '#C8463C'][(r() * 6) | 0], cx = W * (.12 + r() * .76), cy = H * (.5 + r() * .09), rr = W * .046; const fg = g.createRadialGradient(cx - rr * .3, cy - rr * .35, 1, cx, cy, rr); fg.addColorStop(0, shadeHex(col2, 1.35)); fg.addColorStop(.6, col2); fg.addColorStop(1, shadeHex(col2, .7)); g.fillStyle = fg; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.fill(); g.fillStyle = '#5A4020'; g.fillRect(cx - 1, cy - rr - 2, 2, 4); }
  g.strokeStyle = '#8A6A48'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(W * .42, H * .62); g.lineTo(W * .42, H * .66); g.moveTo(W * .58, H * .62); g.lineTo(W * .58, H * .66); g.stroke();
  g.fillStyle = 'rgba(0,0,0,.2)'; rrect(g, W * .365, H * .668, W * .28, H * .12, 3); g.fill(); g.fillStyle = '#FBF6EE'; rrect(g, W * .36, H * .66, W * .28, H * .12, 3); g.fill(); g.fillStyle = '#C8463C'; g.font = `900 ${Math.round(H * .07)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('100円', W / 2, H * .72);
}
function paintBookcart(g, W, H) { /* 見た目 111〜114：古本のワゴン。本に背のおびと厚み・かたむき／ワゴンの板目とふち／車輪にホイール／札にかげ */
  SH(g, W, H); g.fillStyle = vgrad(g, H * .3, H, [[0, '#94694A'], [1, '#5A3D27']]); g.fillRect(W * .04, H * .4, W * .92, H * .5); g.fillStyle = '#6E4A30'; g.fillRect(W * .02, H * .38, W * .96, H * .05); g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(W * .02, H * .38, W * .96, 2); g.strokeStyle = 'rgba(40,22,10,.3)'; g.lineWidth = 1.5; for (const y of [.58, .74]) { g.beginPath(); g.moveTo(W * .04, H * y); g.lineTo(W * .96, H * y); g.stroke(); }
  for (const x of [.14, .86]) { g.fillStyle = '#1C1C1E'; g.beginPath(); g.arc(W * x, H * .93, H * .065, 0, Math.PI * 2); g.fill(); g.fillStyle = '#8A9098'; g.beginPath(); g.arc(W * x, H * .93, H * .03, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3B3B40'; g.beginPath(); g.arc(W * x, H * .93, H * .01, 0, Math.PI * 2); g.fill(); }
  const r = rnd(12); let x = W * .07; while (x < W * .9) { const w = W * (.03 + r() * .04), c = ['#C8463C', '#355F86', '#E9E2D5', '#8A5530', '#5F9E5A', '#C9962F'][(r() * 6) | 0], top = H * (.12 + r() * .06), lean = r() < .18 ? .12 : 0; g.save(); g.translate(x, H * .4); g.rotate(lean);
    g.fillStyle = vgrad(g, top - H * .4, 0, [[0, shadeHex(c, 1.12)], [1, shadeHex(c, .8)]]); g.fillRect(0, top - H * .4, w - 1, H * .4 - top + 1); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(1, top - H * .4 + H * .04, w - 3, H * .012); g.fillRect(1, -H * .06, w - 3, H * .01); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(w - 2.5, top - H * .4, 1.5, H * .4 - top); g.restore(); x += w + (lean ? W * .012 : 0); }
  g.fillStyle = 'rgba(0,0,0,.22)'; rrect(g, W * .305, H * .51, W * .4, H * .16, 3); g.fill(); g.fillStyle = '#FBF6EE'; rrect(g, W * .3, H * .5, W * .4, H * .16, 3); g.fill(); g.fillStyle = '#3B2A20'; g.font = `900 ${Math.round(H * .1)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('均一', W / 2, H * .58);
}
function paintFishbox(g, W, H) { /* 見た目 78〜81：魚の箱。魚を、尾と目のある形に／氷のつぶ／発泡スチロールの箱のふちと厚み／木の台の板目 */
  SH(g, W, H); g.fillStyle = vgrad(g, H * .4, H, [[0, '#A06A3E'], [1, '#6E4426']]); g.fillRect(W * .04, H * .45, W * .92, H * .53); g.strokeStyle = 'rgba(50,28,12,.35)'; g.lineWidth = 1.5; for (const y of [.6, .76, .9]) { g.beginPath(); g.moveTo(W * .04, H * y); g.lineTo(W * .96, H * y); g.stroke(); } g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(W * .04, H * .45, W * .92, H * .03);
  for (const x of [.06, .52]) { const x0 = W * x; g.fillStyle = '#DCE3E8'; rrect(g, x0, H * .2, W * .42, H * .3, 5); g.fill(); g.fillStyle = '#F7F9FA'; rrect(g, x0, H * .18, W * .42, H * .27, 5); g.fill(); g.fillStyle = vgrad(g, H * .2, H * .42, [[0, '#D5E6F2'], [1, '#B4CDDF']]); rrect(g, x0 + W * .02, H * .205, W * .38, H * .21, 3); g.fill();
    const r = rnd(x * 7 + 3); g.fillStyle = 'rgba(255,255,255,.8)'; for (let k = 0; k < 16; k++) g.fillRect(x0 + W * (.03 + r() * .35), H * (.215 + r() * .18), 3, 3);
    for (let k = 0; k < 3; k++) { const cx = x0 + W * (.1 + k * .11), cy = H * (.3 + (k % 2) * .03), col = x < .3 ? ['#8FA9BE', '#5F7C94'] : ['#EFA583', '#C96F4A']; g.save(); g.translate(cx, cy); g.rotate(-.25);
      g.fillStyle = col[1]; g.beginPath(); g.moveTo(W * .045, 0); g.lineTo(W * .075, -H * .03); g.lineTo(W * .075, H * .03); g.closePath(); g.fill(); const fg = g.createLinearGradient(0, -H * .03, 0, H * .03); fg.addColorStop(0, col[1]); fg.addColorStop(.5, col[0]); fg.addColorStop(1, '#F3F1EC'); g.fillStyle = fg; g.beginPath(); g.ellipse(0, 0, W * .055, H * .03, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#FBF6EE'; g.beginPath(); g.arc(-W * .035, -H * .006, 2.2, 0, Math.PI * 2); g.fill(); g.fillStyle = '#1C1C1E'; g.beginPath(); g.arc(-W * .035, -H * .006, 1.1, 0, Math.PI * 2); g.fill(); g.restore(); } }
}
function paintCooler(g, W, H) { /* 見た目 82〜85：ウォーターサーバー。水のボトルに水面とあわ／出口のコック 2 つ（赤・青）／受け皿／本体の横の濃淡 */
  SH(g, W, H); { const bg = g.createLinearGradient(W * .14, 0, W * .86, 0); bg.addColorStop(0, '#D4DCE3'); bg.addColorStop(.3, '#FFFFFF'); bg.addColorStop(1, '#BFC9D2'); g.fillStyle = bg; } rrect(g, W * .14, H * .32, W * .72, H * .66, 7); g.fill();
  g.fillStyle = 'rgba(150,200,240,.75)'; rrect(g, W * .2, H * .0, W * .6, H * .34, [20, 20, 4, 4]); g.fill(); g.fillStyle = 'rgba(90,160,220,.45)'; rrect(g, W * .2, H * .08, W * .6, H * .26, [4, 4, 4, 4]); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(W * .2, H * .078, W * .6, 2);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(W * .27, H * .03, W * .07, H * .28); for (const [x, y, r] of [[.52, .22, 3], [.6, .15, 2], [.47, .12, 2]]) { g.beginPath(); g.arc(W * x, H * y, r, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#E7ECF0'; rrect(g, W * .2, H * .44, W * .6, H * .2, 5); g.fill(); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(W * .2, H * .44, W * .6, 3);
  for (const [x, c] of [[.38, '#C8463C'], [.62, '#4E77A0']]) { g.fillStyle = '#8A9098'; g.fillRect(W * x - 3, H * .5, 6, H * .06); g.fillStyle = c; rrect(g, W * x - 9, H * .47, 18, H * .04, 3); g.fill(); }
  g.fillStyle = '#9AA4AD'; rrect(g, W * .26, H * .62, W * .48, H * .025, 2); g.fill(); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(W * .14, H * .7, W * .72, 2);
}
function paintDesk(g, W, H) {
  SH(g, W, H, .22); g.fillStyle = '#9AA9B6'; g.fillRect(W * .06, H * .5, W * .05, H * .48); g.fillRect(W * .89, H * .5, W * .05, H * .48);
  g.fillStyle = vgrad(g, H * .44, H * .52, [[0, '#F3EFE8'], [1, '#C9C3B8']]); g.fillRect(W * .02, H * .44, W * .96, H * .08); g.fillStyle = '#B9C0C7'; g.fillRect(W * .56, H * .52, W * .32, H * .4);
  g.fillStyle = '#1C1919'; rrect(g, W * .22, H * .02, W * .5, H * .34, 4); g.fill(); g.fillStyle = vgrad(g, H * .04, H * .33, [[0, '#9ED8F5'], [1, '#4E8FC8']]); g.fillRect(W * .245, H * .04, W * .45, H * .29); g.fillStyle = '#46525E'; g.fillRect(W * .44, H * .36, W * .06, H * .08);
  g.fillStyle = '#FFFFFF'; g.fillRect(W * .74, H * .34, W * .14, H * .1); g.fillStyle = '#E9E4DA'; g.fillRect(W * .3, H * .41, W * .3, H * .03); g.fillStyle = '#FBF6EE'; g.beginPath(); g.ellipse(W * .14, H * .4, W * .04, H * .04, 0, 0, Math.PI * 2); g.fill();
  /* 見た目 190〜193：事務づくえ。画面のうつりこみと台／キーボードのキー／引き出しの段と取っ手／天板のふちのかげと、書類の文字 */
  g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.moveTo(W * .245, H * .04); g.lineTo(W * .42, H * .04); g.lineTo(W * .3, H * .33); g.lineTo(W * .245, H * .33); g.closePath(); g.fill(); g.fillStyle = '#46525E'; rrect(g, W * .39, H * .42, W * .16, H * .02, 2); g.fill();
  g.fillStyle = '#D5CFC4'; rrect(g, W * .3, H * .405, W * .3, H * .035, 2); g.fill(); g.fillStyle = 'rgba(90,85,75,.45)'; for (let k = 0; k < 11; k++) g.fillRect(W * (.31 + k * .026), H * .412, W * .018, H * .008); for (let k = 0; k < 10; k++) g.fillRect(W * (.32 + k * .026), H * .425, W * .018, H * .008);
  g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(W * .02, H * .52, W * .96, H * .014); g.strokeStyle = 'rgba(70,82,94,.5)'; g.lineWidth = 1.2; for (const y of [.65, .78]) { g.beginPath(); g.moveTo(W * .56, H * y); g.lineTo(W * .88, H * y); g.stroke(); } g.fillStyle = '#7E8C99'; for (const y of [.58, .71, .84]) { rrect(g, W * .68, H * y, W * .08, H * .018, 2); g.fill(); }
  g.fillStyle = 'rgba(90,100,110,.5)'; for (const y of [.36, .385, .41]) g.fillRect(W * .755, H * y, W * .11, H * .008); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(W * .02, H * .44, W * .96, H * .012);
}
const PROP_ART = {
  desk: () => artCanvas('pdesk', 260, 200, paintDesk),
  vending: (n, v) => artCanvas('pv|' + v + n, 160, 300, (g, w, h) => paintVending(g, w, h, n, v || '#E9ECEF')), post: () => artCanvas('ppost', 120, 220, paintPost), bikes: () => artCanvas('pbikes', 320, 160, paintBikes),
  xmasTree: n => artCanvas('pxmas' + n, 180, 320, (g, w, h) => paintXmasTree(g, w, h, n)), kadomatsu: () => artCanvas('pkado', 180, 300, paintKadomatsu), heartBox: () => artCanvas('pheart', 160, 130, paintHeartBox), sakuraPot: () => artCanvas('psakura', 200, 320, paintSakuraPot), bambooWish: () => artCanvas('pbamboo', 170, 380, paintBambooWish), jackO: n => artCanvas('pjack' + n, 170, 160, (g, w, h) => paintJackO(g, w, h, n)), plant: () => artCanvas('plant', 240, 420, paintPlant), andon: n => artCanvas('pandon' + n, 120, 220, (g, w, h) => paintAndon(g, w, h, n)), lampS: n => artCanvas('plamp' + n, 120, 400, (g, w, h) => paintFloorLamp(g, w, h, n)),
  umbrellaS: () => artCanvas('umbrellas', 180, 380, paintUmbrellas), boxesS: () => artCanvas('box', 200, 170, paintCardboard), papersS: () => artCanvas('paperTall', 220, 380, (g, w, h) => paintPapers(g, w, h, 1)),
  zabutonS: () => artCanvas('zabuton', 260, 100, paintCushions), futon: () => artCanvas('pfuton', 300, 220, paintFutonStack), bonbori: n => artCanvas('pbon' + n, 120, 300, (g, w, h) => paintBonbori(g, w, h, n)),
  flowers: () => artCanvas('flowers', 240, 160, paintFlowers), planter: () => artCanvas('flowers', 240, 160, paintFlowers), gacha: () => artCanvas('gacha', 260, 340, paintGacha), stoneLantern: () => artCanvas('lantern', 200, 380, paintStoneLantern),
  rickshawP: () => artCanvas('rickshaw', 260, 360, paintRickshaw), benchS: () => artCanvas('bench', 260, 110, paintBench), crates: () => artCanvas('crate3', 200, 320, (g, w, h) => paintCrates(g, w, h, 3)), stools: () => artCanvas('stools', 240, 130, paintStools),
  stall: (n, v) => artCanvas('pstall|' + v, 320, 300, (g, w, h) => paintStall(g, w, h, v || '#C8463C')), bookcart: () => artCanvas('pbook', 300, 200, paintBookcart), fishbox: () => artCanvas('pfish', 280, 160, paintFishbox),
  cafe: (n, v) => artCanvas('cafe|' + (v || '#355F86'), 320, 440, (g, w, h) => paintCafe(g, w, h, v || '#355F86')), scopeS: () => artCanvas('scope', 180, 320, paintBinoculars), water: () => artCanvas('pcool', 120, 260, paintCooler),
  copierS: () => artCanvas('copier', 280, 280, paintCopier), mchairs: () => artCanvas('chair', 200, 170, paintChair),
};

/* ---- painted fronts for furniture that stands against a wall (the side you see from the corridor) ---- */

/* 走る電車の横の面（5m ぶん）と先頭の顔（2026-11-16）。kind：'tc' + head/led/mid/cab + 帯の色 + 夜なら 'N' */
function paintTrainSide(g, W, H, kind) {
  const night = kind.endsWith('N'), part = kind.slice(2, kind.indexOf('#')), lc = kind.slice(kind.indexOf('#'), kind.indexOf('#') + 7);
  // ステンレスの車体：上は空を映して明るく、下へ少し暗く。細い横すじ（ヘアライン）
  g.fillStyle = vgrad(g, 0, H, [[0, '#E3E7EB'], [.45, '#CDD3D9'], [.8, '#BCC3CA'], [1, '#9FA7AF']]); g.fillRect(0, 0, W, H);
  g.globalAlpha = .12; for (let y = 4; y < H; y += 5) { g.fillStyle = y % 10 ? '#FFFFFF' : '#8A939C'; g.fillRect(0, y, W, 1); } g.globalAlpha = 1;
  if (part === 'cab') { // 先頭：大きな前の窓・行き先・前照灯・帯・連結器のまわり
    g.fillStyle = vgrad(g, 0, H, [[0, '#E9EDF0'], [1, '#B4BCC4']]); rrect(g, 0, 0, W, H, 18); g.fill();
    g.fillStyle = '#1F252C'; rrect(g, W * .08, H * .12, W * .84, H * .4, 14); g.fill();
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(W * .14, H * .5); g.lineTo(W * .42, H * .14); g.lineTo(W * .55, H * .14); g.lineTo(W * .27, H * .5); g.fill();
    g.fillStyle = '#111'; g.fillRect(W * .3, H * .15, W * .4, H * .08); g.fillStyle = '#FFB23C'; g.font = `700 ${Math.round(H * .055)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('各駅停車', W * .5, H * .19);
    g.fillStyle = lc; g.fillRect(0, H * .55, W, H * .09);
    for (const x of [.2, .8]) { g.fillStyle = night ? '#FFF8D8' : '#F2F4F6'; g.beginPath(); g.ellipse(W * x, H * .72, W * .07, H * .035, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#5E6A76'; g.lineWidth = 2; g.stroke(); }
    g.fillStyle = '#3A3F45'; g.fillRect(W * .4, H * .86, W * .2, H * .14); g.fillStyle = '#2B2E33'; g.fillRect(0, H * .93, W, H * .07);
    return; }
  const win = (x, w) => { // 窓：黒い枠・ガラス（昼は空と映りこみ、夜は車内の明かりとつり革のかげ）
    const y = H * .2, h = H * .4; g.fillStyle = '#4A525A'; rrect(g, x - 3, y - 3, w + 6, h + 6, 9); g.fill();
    if (night) { g.fillStyle = vgrad(g, y, y + h, [[0, '#FFF3CF'], [1, '#F2D9A0']]); rrect(g, x, y, w, h, 7); g.fill(); g.fillStyle = 'rgba(70,60,50,.45)';
      for (let k = 0; k < 4; k++) { const sx = x + w * (.12 + k * .25); g.fillRect(sx, y, 2, h * .2); g.beginPath(); g.arc(sx + 1, y + h * .24, 5, 0, Math.PI * 2); g.fill(); } }
    else { g.fillStyle = vgrad(g, y, y + h, [[0, '#6F8597'], [.55, '#3E4E5C'], [1, '#2C3843']]); rrect(g, x, y, w, h, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.moveTo(x + w * .1, y + h); g.lineTo(x + w * .45, y); g.lineTo(x + w * .62, y); g.lineTo(x + w * .27, y + h); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + w / 2 - 1, y, 2, h); };
  const door = (x, w) => { // 両開きのドア：すき間・ゴムのふち・細長い窓・ドアの帯
    g.fillStyle = '#2B2E33'; g.fillRect(x - 4, H * .1, w + 8, H * .82);
    for (const k of [0, 1]) { const dx = x + k * (w / 2 + 1), dw = w / 2 - 1; g.fillStyle = vgrad(g, 0, H, [[0, '#D6DBE0'], [1, '#AEB6BE']]); g.fillRect(dx, H * .11, dw, H * .8);
      g.fillStyle = lc; g.fillRect(dx, H * .11, dw, H * .05); g.fillRect(dx, H * .62, dw, H * .07);
      g.fillStyle = night ? '#F7E6B6' : '#34424F'; rrect(g, dx + dw * .2, H * .2, dw * .6, H * .36, 6); g.fill();
      if (!night) { g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(dx + dw * .24, H * .22, dw * .12, H * .32); } }
    g.fillStyle = '#1E2024'; g.fillRect(x + w / 2 - 1, H * .11, 2, H * .8); };
  // 窓の下の帯（うぐいす色）と、屋根のふちの細い帯
  g.fillStyle = lc; g.fillRect(0, H * .66, W, H * .07); g.fillRect(0, H * .03, W, H * .03);
  const u = W / 5; // 5m: 窓 1.6m・ドア 1.3m・窓 1.6m（両はしに柱）
  win(u * .25, u * 1.55); door(u * 1.95, u * 1.3); win(u * 3.45, u * 1.4);
  if (part === 'head') { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, 6, H); }
  if (part === 'led') { g.fillStyle = '#111'; g.fillRect(u * 2.05, H * .02, u * 1.1, H * .07); g.fillStyle = '#FFB23C'; g.font = `700 ${Math.round(H * .045)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('各駅停車', u * 2.6, H * .056); }
  g.fillStyle = vgrad(g, H * .9, H, [[0, '#7E868E'], [1, '#4A5057']]); g.fillRect(0, H * .9, W, H * .1); // すそ
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, H * .9, W, 1);
}
function paintFace(kind, W, H) {
  if (kind.startsWith('tc')) return artCanvas('face|' + kind, W, H, (g) => paintTrainSide(g, W, H, kind));
  if (/^cone\d/.test(kind)) return artCanvas('face|' + kind + W, W, H, (g) => { const i = +kind[4]; g.fillStyle = i ? '#F4F6F8' : '#E8732B'; g.fillRect(0, 0, W, H); if (i) { g.fillStyle = 'rgba(200,210,220,.7)'; for (let x = 2; x < W; x += 4) g.fillRect(x, H * .3, 2, H * .4); } const e = g.createLinearGradient(0, 0, W, 0); e.addColorStop(0, 'rgba(0,0,0,.25)'); e.addColorStop(.35, 'rgba(255,255,255,.18)'); e.addColorStop(1, 'rgba(0,0,0,.3)'); g.fillStyle = e; g.fillRect(0, 0, W, H); }); // [O1] コーンの丸み（左右のかげ）と反射の帯
  if (kind === 'pot') return artCanvas('face|pot' + W, W, H, (g) => { g.fillStyle = vgrad(g, 0, H, [[0, '#C08A5E'], [1, '#9A6A44']]); g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(W * .15, 0, W * .12, H); g.fillStyle = 'rgba(0,0,0,.12)'; for (let k = 0; k < 6; k++) g.fillRect((k * 23) % W, H * (.3 + (k % 3) * .2), 4, 2); }); // [O10] 素焼きの鉢のむら
  if (/^leaf\d/.test(kind)) return artCanvas('face|' + kind + W, W, H, (g) => { const i = +kind[4]; g.fillStyle = i ? '#4F8A4A' : '#5F9E5A'; g.fillRect(0, 0, W, H); for (let k = 0; k < 40; k++) { const x = (k * 37 + i * 11) % W, y = (k * 23) % H; g.fillStyle = ['#7DB46A', '#3F7A3E', '#6FAE62', '#2F6A34'][k % 4]; g.beginPath(); g.ellipse(x, y, 5, 3, (k % 5) * .6, 0, Math.PI * 2); g.fill(); } }); // [O10] 葉の 1 枚ずつ
  if (kind === 'quilt') return artCanvas('face|quilt' + W, W, H, (g) => { g.fillStyle = '#B9C7D6'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(80,100,120,.35)'; g.lineWidth = 1; for (let x = 0; x < W + H; x += 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x - H, H); g.stroke(); g.beginPath(); g.moveTo(x - H, 0); g.lineTo(x, H); g.stroke(); } }); // [O11] キルトの座席
  if (kind === 'copier') return artCanvas('face|copier' + W, W, H, (g) => { g.fillStyle = vgrad(g, 0, H, [[0, '#E9ECEF'], [1, '#C9CED3']]); g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < 3; k++) { const y = H * (.45 + k * .17); g.fillRect(4, y, W - 8, 2); g.fillStyle = 'rgba(80,90,100,.45)'; g.fillRect(W * .42, y + 5, W * .16, 4); g.fillStyle = 'rgba(0,0,0,.18)'; } g.fillStyle = '#3B3F46'; g.fillRect(W * .1, H * .12, W * .28, H * .14); g.fillStyle = '#7FD06A'; g.fillRect(W * .14, H * .15, W * .1, H * .06); }); // [O12]
  if (kind.startsWith('crate|')) return artCanvas('face|' + kind + W, W, H, (g) => { const c = kind.slice(6); g.fillStyle = vgrad(g, 0, H, [[0, shadeHex(c, 1.1)], [1, shadeHex(c, .82)]]); g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(0,0,0,.3)'; for (let x = 6; x < W - 6; x += 9) for (let y = 8; y < H - 6; y += 9) g.fillRect(x, y, 6, 6); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(W * .35, 3, W * .3, 5); }); // [O14] 樹脂のケース：四角い穴の格子・持ち手の穴
  if (kind.startsWith('gacha|')) return artCanvas('face|' + kind + W, W, H, (g) => { const c = kind.slice(6); g.fillStyle = c; g.fillRect(0, 0, W, H); g.fillStyle = '#FBF6EE'; g.fillRect(W * .15, H * .08, W * .7, H * .32); g.fillStyle = ['#F2C230', '#7FD06A', '#9C7BD0'][c.length % 3]; g.beginPath(); g.arc(W * .5, H * .24, W * .14, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C9CED3'; g.beginPath(); g.arc(W * .5, H * .58, W * .14, 0, Math.PI * 2); g.fill(); g.fillStyle = '#5A6168'; g.fillRect(W * .44, H * .53, W * .12, H * .1); g.fillStyle = '#2B2B2B'; g.fillRect(W * .3, H * .78, W * .4, H * .14); }); // [O13]
  if (kind === 'gcap') return artCanvas('face|gcap' + W, W, H, (g) => { g.fillStyle = 'rgba(221,239,248,.9)'; g.fillRect(0, 0, W, H); for (let k = 0; k < 14; k++) { const x = 8 + (k * 17) % (W - 16), y = H - 10 - ((k / 4) | 0) * 13 - (k % 2) * 4; g.fillStyle = ['#E86A75', '#F2C230', '#4E77A0', '#7FD06A', '#9C7BD0'][k % 5]; g.beginPath(); g.arc(x, y, 6, Math.PI, 0); g.fill(); g.fillStyle = '#FBF6EE'; g.beginPath(); g.arc(x, y, 6, 0, Math.PI); g.fill(); } g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(W * .12, 4, W * .1, H - 8); }); // [O13] 透明な窓の中のカプセル
  if (kind === 'bag') return artCanvas('face|bag' + W, W, H, (g) => { g.fillStyle = vgrad(g, 0, H, [[0, '#8A5E3E'], [1, '#5A3A26']]); g.fillRect(0, 0, W, H); g.setLineDash([3, 2]); g.strokeStyle = 'rgba(240,220,190,.6)'; g.strokeRect(4, 4, W - 8, H - 8); g.setLineDash([]); g.fillStyle = '#C9A24A'; g.fillRect(W * .45, H * .15, W * .1, H * .14); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(W * .1, H * .1, W * .25, H * .2); }); // [O6]
  if (kind === 'paperE') return artCanvas('face|paperE' + W, W, H, (g) => { g.fillStyle = '#F7F5EE'; g.fillRect(0, 0, W, H); for (let y = 1; y < H; y += 2) { g.fillStyle = `rgba(140,140,130,${.15 + ((y * 7) % 5) * .04})`; g.fillRect(0, y, W, .7); } }); // [O7] 紙の重なりの筋
  if (kind === 'tilep') return artCanvas('face|tilep' + W, W, H, (g) => { g.fillStyle = '#DCDAD2'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(120,118,110,.45)'; g.lineWidth = 1; for (let y = 0; y < H; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); for (let x = (y / 12) % 2 ? 0 : 10; x < W; x += 20) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 12); g.stroke(); } } const e = g.createLinearGradient(0, 0, W, 0); e.addColorStop(0, 'rgba(0,0,0,.12)'); e.addColorStop(.5, 'rgba(255,255,255,.1)'); e.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = e; g.fillRect(0, 0, W, H); }); // [O8]
  if (kind === 'ustand') return artCanvas('face|ustand' + W, W, H, (g) => { const e = g.createLinearGradient(0, 0, W, 0); e.addColorStop(0, '#7E868E'); e.addColorStop(.4, '#D9DEE2'); e.addColorStop(1, '#6E767E'); g.fillStyle = e; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 6; y < H; y += 10) g.fillRect(0, y, W, 1.5); }); // [O9]
  if (kind === 'stripe') return artCanvas('face|stripe' + W + 'x' + H, W, H, (g) => { g.fillStyle = '#F2C230'; g.fillRect(0, 0, W, H); g.fillStyle = '#1F1F22'; for (let x = -H; x < W + H; x += H * 1.6) { g.beginPath(); g.moveTo(x, H); g.lineTo(x + H * .8, H); g.lineTo(x + H * 1.6, 0); g.lineTo(x + H * .8, 0); g.closePath(); g.fill(); } g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(0, 0, W, 2); }); // [O2] 黄と黒のななめのしま
  if (kind === 'cbox') return artCanvas('face|cbox' + W, W, H, (g) => { g.fillStyle = vgrad(g, 0, H, [[0, '#D6A979'], [1, '#B98A5C']]); g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(120,80,40,.25)'; for (let y = 3; y < H; y += 3) g.fillRect(0, y, W, .6); g.fillStyle = 'rgba(230,210,170,.85)'; g.fillRect(W * .42, 0, W * .16, H * .22); g.strokeStyle = 'rgba(60,40,24,.75)'; g.lineWidth = 2; g.beginPath(); g.moveTo(W * .15, H * .7); g.lineTo(W * .15, H * .45); g.moveTo(W * .1, H * .52); g.lineTo(W * .15, H * .45); g.lineTo(W * .2, H * .52); g.moveTo(W * .26, H * .7); g.lineTo(W * .26, H * .45); g.moveTo(W * .21, H * .52); g.lineTo(W * .26, H * .45); g.lineTo(W * .31, H * .52); g.stroke(); g.fillStyle = 'rgba(40,24,16,.6)'; g.beginPath(); g.ellipse(W * .72, H * .4, W * .07, H * .05, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(0,0,0,.15)'; g.strokeRect(1, 1, W - 2, H - 2); }); // [O3] 段ボール：波の筋・テープ・「天地」の矢印・手をかける穴
  if (kind === 'wood') return artCanvas('face|wood' + W + 'x' + H, W, H, (g) => { g.fillStyle = vgrad(g, 0, H, [[0, '#C49260'], [1, '#9A6E44']]); g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(90,60,30,.35)'; g.lineWidth = .8; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(0, H * (.2 + k * .2)); g.bezierCurveTo(W * .3, H * (.1 + k * .2), W * .6, H * (.3 + k * .2), W, H * (.2 + k * .2)); g.stroke(); } }); // [O4] 木の板の木目
  if (kind.startsWith('case|')) return artCanvas('face|' + kind, W, H, (g) => { const c = kind.slice(5); g.fillStyle = vgrad(g, 0, H, [[0, shadeHex(c, 1.15)], [1, shadeHex(c, .8)]]); g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(0,0,0,.18)'; for (let x = W * .15; x < W * .9; x += W * .14) g.fillRect(x, H * .1, 2, H * .8); g.fillStyle = 'rgba(255,255,255,.2)'; for (let x = W * .15 + 2; x < W * .9; x += W * .14) g.fillRect(x, H * .1, 1, H * .8); g.fillStyle = '#5A5F66'; for (const [x, y] of [[0, 0], [W - 8, 0], [0, H - 8], [W - 8, H - 8]]) g.fillRect(x, y, 8, 8); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, H * .48, W, 2); }); // [O5] スーツケースのみぞ・角の金具・合わせ目
  if (kind === 'whl') return artCanvas('face|whl', W, H, (g) => { g.fillStyle = '#1C1919'; g.beginPath(); g.arc(W / 2, H / 2, W * .48, 0, Math.PI * 2); g.fill(); const gr = g.createRadialGradient(W * .45, H * .45, 2, W / 2, H / 2, W * .28); gr.addColorStop(0, '#E9EDF0'); gr.addColorStop(1, '#8A949E'); g.fillStyle = gr; g.beginPath(); g.arc(W / 2, H / 2, W * .27, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#5A6168'; g.lineWidth = 2; for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; g.beginPath(); g.moveTo(W / 2, H / 2); g.lineTo(W / 2 + Math.cos(a) * W * .25, H / 2 + Math.sin(a) * W * .25); g.stroke(); } g.fillStyle = '#3B3F46'; g.beginPath(); g.arc(W / 2, H / 2, W * .06, 0, Math.PI * 2); g.fill(); }); // [C1] タイヤとホイール（5 本スポーク）
  if (/^c[vw][SF]\|/.test(kind)) return artCanvas('face|' + kind + W, W, H, (g) => { const [k0, t, col] = kind.split('|'), dark = shadeHex(col, .62), lite = shadeHex(col, 1.18), taxi = t === 'taxi';
    if (k0 === 'cvS') { g.fillStyle = vgrad(g, 0, H, [[0, lite], [.45, col], [1, dark]]); g.fillRect(0, 0, W, H); // [C2] 車体の横：上が明るく下が暗い丸み
      g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(0, H * .3, W, 2); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, H * .3 + 2, W, 2); // [C3] キャラクターライン（光の筋）
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; for (const x of t === 'kei' || t === 'van' ? [W * .38, W * .7] : [W * .34, W * .58]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H * .85); g.stroke(); } // [C4] ドアの継ぎ目
      g.fillStyle = 'rgba(30,30,30,.55)'; for (const x of [W * .26, W * .5]) g.fillRect(x, H * .2, 14, 3); // [C5] ドアの取っ手
      g.fillStyle = '#1C1919'; for (const x of [W * .135, W * .755]) { g.beginPath(); g.arc(x, H, H * .62, Math.PI, 0); g.fill(); } // [C6] タイヤの上の丸いくぼみ
      g.fillStyle = 'rgba(20,20,20,.55)'; g.fillRect(0, H * .86, W, H * .14); // [C7] すその黒い樹脂
      if (taxi) { g.fillStyle = '#FBF6EE'; g.fillRect(W * .35, H * .42, W * .26, H * .2); g.fillStyle = '#2B2B2B'; g.font = `700 ${Math.round(H * .16)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('個人', W * .48, H * .52); } // [C8] タクシーのドアの表示（会社名なし）
      g.fillStyle = '#F08A2E'; g.fillRect(W - 6, H * .22, 6, 5); g.fillRect(0, H * .22, 6, 5); } // [C9] 横の方向指示器
    else if (k0 === 'cvF') { g.fillStyle = vgrad(g, 0, H, [[0, lite], [1, dark]]); g.fillRect(0, 0, W, H);
      g.fillStyle = '#1F2328'; g.fillRect(W * .3, H * .35, W * .4, H * .28); g.strokeStyle = 'rgba(160,166,172,.6)'; g.lineWidth = 1; for (let y = H * .4; y < H * .62; y += 4) { g.beginPath(); g.moveTo(W * .31, y); g.lineTo(W * .69, y); g.stroke(); } // [C10] グリル
      for (const x of [W * .04, W * .74]) { g.fillStyle = '#E9EDF0'; g.fillRect(x, H * .2, W * .22, H * .2); g.fillStyle = '#FFF6DC'; g.beginPath(); g.arc(x + W * .11, H * .3, H * .07, 0, Math.PI * 2); g.fill(); } // [C11] ヘッドライト（中に光る丸）
      g.fillStyle = '#FBF6EE'; g.fillRect(W * .38, H * .68, W * .24, H * .17); g.strokeStyle = '#3B5E3B'; g.strokeRect(W * .38, H * .68, W * .24, H * .17); g.fillStyle = '#3B5E3B'; g.fillRect(W * .42, H * .74, W * .16, 2); // [C12] ナンバープレート（文字は入れない）
      g.fillStyle = 'rgba(20,20,20,.6)'; g.fillRect(0, H * .86, W, H * .14); }
    else if (k0 === 'cwS') { g.fillStyle = col; g.fillRect(0, 0, W, H); const gx0 = W * .06, gx1 = W * .94; g.fillStyle = vgrad(g, 0, H, [[0, '#7E95AA'], [1, '#22313E']]); g.beginPath(); g.moveTo(gx0 + W * .1, H * .12); g.lineTo(gx1 - W * .08, H * .12); g.lineTo(gx1, H * .95); g.lineTo(gx0, H * .95); g.closePath(); g.fill(); // [C13] 横の窓（前と後ろがななめ）
      g.fillStyle = col; g.fillRect(W * .47, 0, W * .05, H); // [C14] まん中の柱
      g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.moveTo(W * .15, H * .9); g.lineTo(W * .3, H * .15); g.lineTo(W * .36, H * .15); g.lineTo(W * .21, H * .9); g.fill(); g.fillStyle = 'rgba(30,30,30,.4)'; g.beginPath(); g.ellipse(W * .32, H * .7, W * .05, H * .3, 0, 0, Math.PI * 2); g.fill(); } // [C15] 映りこみ・[C16] 運転する人のかげ
    else { g.fillStyle = col; g.fillRect(0, 0, W, H); g.fillStyle = vgrad(g, 0, H, [[0, '#A9BCCC'], [.5, '#4E6478'], [1, '#22313E']]); g.beginPath(); g.moveTo(W * .1, H * .1); g.lineTo(W * .9, H * .1); g.lineTo(W * .96, H * .96); g.lineTo(W * .04, H * .96); g.closePath(); g.fill(); // [C17] フロントガラス
      g.fillStyle = 'rgba(30,30,30,.45)'; for (const x of [W * .3, W * .7]) { g.beginPath(); g.ellipse(x, H * .7, W * .08, H * .32, 0, 0, Math.PI * 2); g.fill(); } g.fillStyle = '#2B2B2B'; g.fillRect(W * .47, H * .12, W * .06, H * .1); // [C18] 中の人と、ルームミラー
      g.strokeStyle = '#1C1919'; g.lineWidth = 2; g.beginPath(); g.moveTo(W * .15, H * .93); g.lineTo(W * .45, H * .8); g.moveTo(W * .55, H * .93); g.lineTo(W * .85, H * .8); g.stroke(); // [C19] ワイパー
      g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.moveTo(W * .6, H * .1); g.lineTo(W * .75, H * .1); g.lineTo(W * .5, H * .96); g.lineTo(W * .38, H * .96); g.fill(); } }); // [C20] ガラスの映りこみ
  if (kind.startsWith('ls')) return artCanvas('face|' + kind, W, H, (g) => { // [S13] 置き看板：白い箱に、たて書きの店の名前
    const n = +kind.slice(2) || 0, wd = ['カラオケ', 'ラーメン', '居酒屋', 'カフェ', '焼鳥', 'ゲーム', '中古', '定食', 'バー', '寿司'][n], col = ['#C8463C', '#355F86', '#2B2B2B', '#2E7D4F'][n % 4];
    g.fillStyle = '#FBF6EE'; g.fillRect(0, 0, W, H); g.fillStyle = col; g.fillRect(0, 0, W, 8); g.fillRect(0, H - 8, W, 8); g.textAlign = 'center'; g.textBaseline = 'middle'; const ch = [...wd], sz = Math.min(W * .7, (H - 24) / ch.length); g.font = `900 ${sz}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; ch.forEach((c, i) => g.fillText(c, W / 2, 14 + (i + .5) * (H - 28) / ch.length)); });
  if (kind.startsWith('ab')) return artCanvas('face|' + kind, W, H, (g) => { // [G30] 立て看板：木の枠・黒板・チョークの文字の行と、色チョークの絵
    const n = +kind.slice(2) || 0; g.fillStyle = '#7A5538'; g.fillRect(0, 0, W, H); g.fillStyle = '#23302A'; g.fillRect(6, 6, W - 12, H * .78); g.strokeStyle = 'rgba(240,240,230,.8)'; g.lineWidth = 2.5;
    g.font = `900 ${Math.round(W * .2)}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; g.fillStyle = 'rgba(245,242,232,.9)'; g.textAlign = 'center'; g.fillText(['本日', 'ランチ', 'おすすめ', 'OPEN', '営業中', 'MENU'][n % 6], W / 2, H * .2);
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(14, H * (.32 + k * .1)); g.lineTo(W - 14 - (k % 2) * 14, H * (.32 + k * .1)); g.stroke(); }
    g.fillStyle = ['#F2C230', '#E86A75', '#7FD06A'][n % 3]; g.beginPath(); g.arc(W * .7, H * .72, W * .08, 0, Math.PI * 2); g.fill(); });
  if (kind.startsWith('bb')) return artCanvas('face|' + kind, W, H, (g) => { // [G21] 屋上の広告板：架空の店・サービス（実在の会社名は使わない）
    const n = +kind.slice(2) || 0, Wd = ['カラオケ', '英会話', '不動産', '歯科', 'ラーメン', '質店', '学習塾', '整体', '焼肉', 'ホテル', '中古車', '眼科'][n % 12], bgs = [['#C8463C', '#FBF6EE'], ['#FBF6EE', '#2F5579'], ['#F2C230', '#2B2B2B'], ['#2F5579', '#FBF6EE'], ['#2E7D4F', '#FBF6EE'], ['#FBF6EE', '#C8463C']][n % 6];
    g.fillStyle = bgs[0]; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, H - 8, W, 8); g.strokeStyle = '#6E767E'; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6);
    g.fillStyle = bgs[1]; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${Math.round(H * .46)}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; let tw = g.measureText(Wd).width; if (tw > W * .8) g.font = `900 ${Math.round(H * .46 * W * .8 / tw)}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; g.fillText(Wd, W / 2, H * .45);
    g.font = `700 ${Math.round(H * .13)}px sans-serif`; g.fillText(['10:00〜22:00', '11:00〜23:00', '24h', '9:00〜20:00'][n % 4], W / 2, H * .82); }); /* 電話番号は書かない（架空の番号でも、実在の番号と重なるおそれ） */
  if (kind.startsWith('psd')) return artCanvas('face|' + kind + W + LC, W, H, (g) => { // ホームドアの面：白い板・あく所（ガラスの戸と黄色の注意）・線の色の帯
    const m = /^psd(-?\d+)_(-?\d+)/.exec(kind) || [0, 0, 20], ra = +m[1], rb = +m[2], X = r => (r - ra) / (rb - ra) * W;
    g.fillStyle = vgrad(g, 0, H, [[0, '#FFFFFF'], [1, '#D9DEE2']]); g.fillRect(0, 0, W, H); g.fillStyle = LC; g.fillRect(0, 0, W, H * .12);
    for (const d of [2.75, 7.55, 12.35, 17.15]) { const x0 = X(d - .9), x1 = X(d + .9); if (x1 < 0 || x0 > W) continue; g.fillStyle = '#E3E8EC'; g.fillRect(x0, H * .12, x1 - x0, H * .88); g.fillStyle = 'rgba(160,200,225,.6)'; g.fillRect(x0 + 6, H * .2, (x1 - x0) / 2 - 9, H * .45); g.fillRect((x0 + x1) / 2 + 3, H * .2, (x1 - x0) / 2 - 9, H * .45);
      g.fillStyle = '#2B2E33'; g.fillRect((x0 + x1) / 2 - 1, H * .12, 2, H * .88); g.fillStyle = '#E8C23A'; g.fillRect(x0, H * .86, x1 - x0, H * .08); }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, H - 3, W, 3); });
  if (kind.startsWith('ts')) return artCanvas('face|' + kind, W, H, (g) => { // 電車の座席：座面・背は 7 人ぶんのふくらみと縫い目、下は暖房の格子
    const pr = kind.endsWith('P'), c0 = pr ? '#A96E76' : '#3A7FA0', c1 = pr ? '#7A4A52' : '#215A78';
    if (kind === 'tspart') { g.fillStyle = vgrad(g, 0, H, [[0, '#EEF1F3'], [1, '#C3CAD1']]); rrect(g, 0, 0, W, H, 14); g.fill(); g.fillStyle = 'rgba(200,215,225,.75)'; rrect(g, W * .1, H * .08, W * .8, H * .6, 10); g.fill(); // 座席のはしの仕切り板：ステンレスの枠と、すりガラス
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(W * .16, H * .12, W * .1, H * .5); g.strokeStyle = 'rgba(90,100,110,.6)'; g.lineWidth = 3; rrect(g, 1.5, 1.5, W - 3, H - 3, 13); g.stroke(); return; }
    if (kind === 'tsbase') { g.fillStyle = vgrad(g, 0, H, [[0, '#9AA4AD'], [1, '#7E8892']]); g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(40,48,56,.55)'; for (let x = 8; x < W - 8; x += 7) g.fillRect(x, H * .3, 3, H * .4); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, W, 3); return; }
    g.fillStyle = vgrad(g, 0, H, [[0, c0], [1, c1]]); g.fillRect(0, 0, W, H);
    const nS = /^ts3/.test(kind) ? 3 : 7, cw = 1 / nS; /* [68] 3 人がけは 3 人ぶんのふくらみ（前は 1.4m に 7 人ぶんがつまっていた） */
    for (let k = 0; k < nS; k++) { const x = W * (.005 + k * cw); g.fillStyle = vgrad(g, 0, H, [[0, 'rgba(255,255,255,.16)'], [.5, 'rgba(255,255,255,.04)'], [1, 'rgba(0,0,0,.12)']]); rrect(g, x + 2, H * .08, W * (cw - .006), H * .84, Math.min(10, H * .3)); g.fill();
      g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x + W * (cw - .003), H * .12, 2, H * .76); }
    g.globalAlpha = .08; for (let y = 2; y < H; y += 3) { g.fillStyle = y % 6 ? '#FFFFFF' : '#000000'; g.fillRect(0, y, W, 1); } g.globalAlpha = 1; });
  return artCanvas('face|' + kind, W, H, (g) => {
    const knob = (x, y, r) => { g.fillStyle = '#C9962F'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(x - r * .3, y - r * .3, r * .35, 0, Math.PI * 2); g.fill(); };
    const panel = (x, y, w, h, c) => { g.fillStyle = vgrad(g, y, y + h, [[0, shadeHex(c, 1.12)], [1, shadeHex(c, .86)]]); g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, w - 2, h - 2); g.strokeStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(x + 2, y + 2); g.lineTo(x + w - 2, y + 2); g.stroke(); };
    if (kind === 'tansu') { panel(0, 0, W, H, '#8A5A36'); for (let r = 0; r < 4; r++) { const y = H * (.04 + r * .24); panel(W * .04, y, W * .92, H * .21, '#9C6A40'); for (const x of [.3, .7]) { g.strokeStyle = '#C9962F'; g.lineWidth = 3; g.beginPath(); g.arc(W * x, y + H * .1, H * .045, 0, Math.PI); g.stroke(); knob(W * x, y + H * .08, 3); } } }
    else if (kind === 'shelf') { panel(0, 0, W, H, '#7A5232'); const r = rnd(4); for (let k = 0; k < 4; k++) { const y0 = H * (.04 + k * .24), y1 = y0 + H * .2; g.fillStyle = '#4A2F20'; g.fillRect(W * .04, y0, W * .92, y1 - y0); let x = W * .06; while (x < W * .94) { const w = W * (.025 + r() * .035), h = (y1 - y0) * (.7 + r() * .28); g.fillStyle = ['#C8463C', '#355F86', '#F2C230', '#5F9E5A', '#E9E2D5', '#8A5530', '#46525E'][(r() * 7) | 0]; g.fillRect(x, y1 - h, w - 1, h); x += w; } g.fillStyle = '#9C6A40'; g.fillRect(0, y1, W, H * .04); } }
    else if (kind === 'sofa') { g.fillStyle = vgrad(g, 0, H, [[0, '#5A86B8'], [1, '#2F4E78']]); rrect(g, 0, H * .05, W, H * .95, 14); g.fill(); for (let k = 0; k < 3; k++) { g.fillStyle = vgrad(g, H * .1, H * .55, [[0, '#6E9AC9'], [1, '#41669A']]); rrect(g, W * (.08 + k * .29), H * .1, W * .27, H * .45, 12); g.fill(); g.fillStyle = vgrad(g, H * .55, H * .8, [[0, '#6E9AC9'], [1, '#3B5E8E']]); rrect(g, W * (.07 + k * .29), H * .56, W * .29, H * .22, 10); g.fill(); }
      g.fillStyle = '#3B2A20'; g.fillRect(W * .05, H * .92, W * .04, H * .08); g.fillRect(W * .91, H * .92, W * .04, H * .08); }
    else if (kind === 'sofaO') { g.fillStyle = vgrad(g, 0, H, [[0, '#5E6A78'], [1, '#353E4A']]); rrect(g, 0, 0, W, H, 10); g.fill(); for (let k = 0; k < 2; k++) { g.fillStyle = vgrad(g, H * .2, H * .7, [[0, '#6E7B88'], [1, '#46525E']]); rrect(g, W * (.06 + k * .46), H * .2, W * .42, H * .5, 10); g.fill(); } }
    else if (kind === 'tv') { panel(0, H * .55, W, H * .45, '#6B4631'); for (const x of [.05, .52]) { panel(W * x, H * .62, W * .43, H * .32, '#7A5538'); knob(W * (x + .38), H * .78, 3); }
      g.fillStyle = '#1C1919'; rrect(g, W * .12, 0, W * .76, H * .52, 6); g.fill(); g.fillStyle = vgrad(g, H * .03, H * .48, [[0, '#4E8FD0'], [1, '#2A5A8E']]); g.fillRect(W * .15, H * .03, W * .7, H * .45); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.moveTo(W * .5, H * .03); g.lineTo(W * .62, H * .03); g.lineTo(W * .4, H * .48); g.lineTo(W * .28, H * .48); g.closePath(); g.fill(); }
    else if (kind === 'counter') { g.fillStyle = '#9AA9B6'; g.fillRect(0, 0, W, H * .08); for (let k = 0; k < 3; k++) { panel(W * (.02 + k * .33), H * .12, W * .3, H * .84, '#F3EEE6'); g.fillStyle = '#9AA9B6'; rrect(g, W * (.13 + k * .33), H * .2, W * .08, H * .03, 2); g.fill(); } g.fillStyle = '#7D8B97'; g.fillRect(0, H * .96, W, H * .04); }
    else if (kind === 'fridge') { panel(0, 0, W, H, '#F7F9FA'); panel(W * .04, H * .02, W * .92, H * .34, '#F2F5F7'); panel(W * .04, H * .38, W * .92, H * .6, '#F2F5F7'); g.fillStyle = '#9AA9B6'; rrect(g, W * .82, H * .1, W * .05, H * .2, 2); g.fill(); rrect(g, W * .82, H * .44, W * .05, H * .3, 2); g.fill();
      g.fillStyle = '#E86A75'; g.beginPath(); g.arc(W * .3, H * .5, W * .06, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FBF6EE'; g.fillRect(W * .2, H * .58, W * .2, H * .12); }
    else if (kind === 'rack') { panel(0, 0, W, H, '#B9C3CC'); for (let k = 0; k < 3; k++) { const y = H * (.08 + k * .3); g.fillStyle = '#7D8B97'; g.fillRect(W * .04, y + H * .22, W * .92, H * .03); for (let j = 0; j < 4; j++) { g.fillStyle = ['#FBF6EE', '#E9A07A', '#9ED0F0', '#F2C230'][(j + k) % 4]; g.beginPath(); g.ellipse(W * (.16 + j * .22), y + H * .14, W * .08, H * .08, 0, 0, Math.PI * 2); g.fill(); } } }
    else if (kind === 'getabako') { panel(0, 0, W, H, '#9C7652'); for (let k = 0; k < 4; k++) { panel(W * (.02 + k * .245), H * .06, W * .23, H * .88, '#A98260'); for (let j = 1; j < 6; j++) { g.fillStyle = 'rgba(60,30,10,.25)'; g.fillRect(W * (.04 + k * .245), H * (.06 + j * .14), W * .19, 2); } knob(W * (.2 + k * .245), H * .5, 3); } }
    else if (kind === 'cabinet') { panel(0, 0, W, H, '#C9CDD2'); for (let k = 0; k < 4; k++) { panel(W * .05, H * (.03 + k * .24), W * .9, H * .21, '#D9DDE2'); g.fillStyle = '#7D8B97'; rrect(g, W * .38, H * (.07 + k * .24), W * .24, H * .04, 2); g.fill(); g.fillStyle = '#FBF6EE'; g.fillRect(W * .44, H * (.13 + k * .24), W * .12, H * .04); } }
    else if (kind === 'kiosk') { panel(0, 0, W, H, '#4E77A0'); g.fillStyle = '#FBF6EE'; g.fillRect(W * .04, H * .36, W * .92, H * .34); const r = rnd(6); for (let k = 0; k < 10; k++) { g.fillStyle = ['#C8463C', '#F2C230', '#5F9E5A', '#E86A75', '#355F86'][(r() * 5) | 0]; g.fillRect(W * (.06 + k * .09), H * (.4 + (k % 2) * .14), W * .07, H * .12); }
      g.fillStyle = '#F2C230'; g.fillRect(0, H * .08, W, H * .14); g.fillStyle = '#2B2B2B'; g.font = `900 ${Math.round(H * .1)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NEWS・売店', W / 2, H * .15); }
    else if (kind === 'seat') { g.fillStyle = vgrad(g, 0, H, [[0, '#3A7FA0'], [1, '#215A78']]); g.fillRect(0, 0, W, H); for (let k = 0; k < 7; k++) { g.fillStyle = 'rgba(255,255,255,.08)'; rrect(g, W * (.01 + k * .14), H * .06, W * .13, H * .88, 8); g.fill(); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(W * (.01 + k * .14) + W * .13, H * .1, 2, H * .8); } }
    else if (kind === 'hedge') { g.fillStyle = '#3F7A3F'; g.fillRect(0, 0, W, H); const r = rnd(9); for (let k = 0; k < 220; k++) { g.fillStyle = r() < .5 ? 'rgba(130,190,100,.6)' : 'rgba(30,70,30,.5)'; g.beginPath(); g.ellipse(r() * W, r() * H * .75, 4 + r() * 6, 3 + r() * 4, r() * 3, 0, Math.PI * 2); g.fill(); } g.fillStyle = vgrad(g, H * .72, H, [[0, '#8A8470'], [1, '#6E6858']]); g.fillRect(0, H * .72, W, H * .28); }
  });
}

// world size of each illustration: width follows the obstacle, height its top, the sprite anchored at the front face
function drawArt(o, sg, d) {
  const make = ART[o.art]; if (!make) return false;
  const lift = o.dead ? o.dead * o.dead * 9 : 0, side = o.dead ? o.dead * 7 * (o.vx || 1) : 0;
  const s = o.s0 + (o.ds || 0) + (o.dead ? o.dead * 6 : 0), lat = (o.l0 + o.l1) / 2 + side;
  const p = segPos(sg, s, lat), sp = spriteAt(p[0], lift + p[2], p[1]); if (!sp) return true; // off screen: not even painted yet
  const img = make(o, LT.night > .35); if (!img) return false;
  const ww = (o.artW || (o.l1 - o.l0)) * sp.k, hh = (o.artH || o.top || 1) * sp.k;
  ctx.globalAlpha = (o.dead ? clamp(1 - o.dead * 1.2, 0, 1) : passFade(d)) * (1 - fogK(d) * .9);
  ctx.drawImage(litSprite(img, LT.amb), sp.sx - ww / 2, sp.sy - hh, ww, hh);
  if (LT.night > .3 && (o.art === 'car' || o.art === 'supercar' || o.art === 'kick' || o.art === 'bike') && !o.dead) { // headlights at night, and their light on the road
    ctx.globalCompositeOperation = 'lighter';
    const hy = sp.sy - hh * (o.art === 'car' ? .4 : o.art === 'supercar' ? .38 : .5), lights = o.art === 'car' || o.art === 'supercar' ? [-.33, .33] : [0];
    for (const x of lights) { const lx = sp.sx + x * ww, R = Math.max(6, ww * .22), gr = ctx.createRadialGradient(lx, hy, 0, lx, hy, R); gr.addColorStop(0, 'rgba(255,250,225,.95)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = gr; ctx.fillRect(lx - R, hy - R, R * 2, R * 2); }
    const pool = ctx.createRadialGradient(sp.sx, sp.sy + hh * .1, 0, sp.sx, sp.sy + hh * .1, ww * 1.3); pool.addColorStop(0, `rgba(255,240,200,${(.28 * LT.night).toFixed(3)})`); pool.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = pool; ctx.beginPath(); ctx.ellipse(sp.sx, sp.sy + hh * .1, ww * 1.3, ww * .35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = 1; return true;
}

/* ================= street furniture as illustrations: lamp posts, utility poles, signals, rooftop clutter, people ================= */
function paintLampC(g, W, H, night, v) { // a modern street light: tapered post, an arm reaching over the road, a flat head
  const dir = v === 'L' ? -1 : 1, x0 = W / 2 + dir * -W * .22; // the post stands at the pavement side, the arm reaches toward the road
  const post = g.createLinearGradient(x0 - 8, 0, x0 + 8, 0); post.addColorStop(0, '#3A414A'); post.addColorStop(.45, '#6B737C'); post.addColorStop(1, '#2A3036');
  g.fillStyle = post; g.beginPath(); g.moveTo(x0 - 7, H); g.lineTo(x0 + 7, H); g.lineTo(x0 + 4, H * .12); g.lineTo(x0 - 4, H * .12); g.closePath(); g.fill();
  g.fillStyle = '#2F3B47'; g.fillRect(x0 - 11, H - 18, 22, 18); g.fillStyle = '#4B5560'; g.fillRect(x0 - 9, H - 60, 18, 40); // base and the inspection door
  g.strokeStyle = post; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, H * .13); g.quadraticCurveTo(x0 + dir * W * .22, H * .06, x0 + dir * W * .46, H * .08); g.stroke();
  const hx = x0 + dir * W * .46, hy = H * .08; // the head
  g.fillStyle = night ? '#FFF6DC' : '#E7ECEF'; g.beginPath(); g.ellipse(hx, hy + 6, W * .16, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#4B5560'; g.beginPath(); g.ellipse(hx, hy, W * .17, 8, 0, Math.PI, Math.PI * 2); g.fill();
  if (night) { g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(hx, hy + 8, 2, hx, hy + 8, W * .5); gl.addColorStop(0, 'rgba(255,230,170,.9)'); gl.addColorStop(.3, 'rgba(255,210,140,.35)'); gl.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H * .5); g.globalCompositeOperation = 'source-over'; }
}
function paintPole(g, W, H) { // a concrete utility pole with crossarms, insulators and a transformer drum
  const x = W / 2; const c = g.createLinearGradient(x - 9, 0, x + 9, 0); c.addColorStop(0, '#8B8F93'); c.addColorStop(.4, '#C9CCCF'); c.addColorStop(1, '#6F7478');
  g.fillStyle = c; g.beginPath(); g.moveTo(x - 10, H); g.lineTo(x + 10, H); g.lineTo(x + 6, 0); g.lineTo(x - 6, 0); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = H * .1; y < H; y += H * .18) g.fillRect(x - 9, y, 18, 2); // the rings of a cast pole
  g.fillStyle = '#5B6066'; g.fillRect(x - 46, H * .07, 92, 5); g.fillRect(x - 40, H * .14, 80, 4); // crossarms
  g.fillStyle = '#E8E6DF'; for (const ax of [-40, -22, 22, 40]) { g.beginPath(); g.ellipse(x + ax, H * .06, 4, 6, 0, 0, Math.PI * 2); g.fill(); } // insulators
  g.fillStyle = '#4A5056'; rrect(g, x + 10, H * .17, 22, 44, 4); g.fill(); g.fillStyle = '#3A3F44'; rrect(g, x + 8, H * .16, 26, 6, 2); g.fill(); // transformer
  g.strokeStyle = '#2B2B2B'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 21, H * .17); g.lineTo(x + 21, H * .1); g.stroke();
  g.fillStyle = '#F2C230'; g.fillRect(x - 7, H * .55, 14, 26); g.fillStyle = '#2B2B2B'; g.fillRect(x - 5, H * .58, 10, 3); g.fillRect(x - 5, H * .64, 10, 3); // a yellow notice plate
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x - 8, H - 30, 16, 30);
}
function paintSignal(g, W, H, night, v) { // a Japanese horizontal traffic signal on a bent pole, with a pedestrian light
  const dir = v === 'L' ? -1 : 1, x0 = W / 2 - dir * W * .3;
  const post = g.createLinearGradient(x0 - 7, 0, x0 + 7, 0); post.addColorStop(0, '#6E7278'); post.addColorStop(.5, '#B9BDC2'); post.addColorStop(1, '#5A5E63');
  g.fillStyle = post; g.fillRect(x0 - 6, H * .1, 12, H * .9); g.strokeStyle = post; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, H * .11); g.lineTo(x0 + dir * W * .52, H * .11); g.stroke();
  const hx = x0 + dir * W * .36, hy = H * .14, lw = W * .42, lh = 30; // the three-lamp head
  g.fillStyle = '#2E3338'; rrect(g, hx - lw / 2, hy, lw, lh, 5); g.fill(); g.fillStyle = '#1C1F22'; g.fillRect(hx - lw / 2 + 2, hy - 6, lw - 4, 6); // the visor
  const lamps = [['#3C8F6E', '#52D493'], ['#A88A2A', '#FFD64A'], ['#8C3A33', '#FF5A4A']]; const lit = night ? (Math.round(G.t) % 7 < 4 ? 0 : 2) : -1;
  lamps.forEach(([off, on], i) => { const lx = hx - lw / 2 + lw * (.17 + i * .33); g.fillStyle = i === lit || (!night && i === 0) ? on : off; g.beginPath(); g.arc(lx, hy + lh / 2, 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(lx - 3, hy + lh / 2 - 3, 3.5, 0, Math.PI * 2); g.fill(); });
  // the pedestrian signal on the post
  g.fillStyle = '#2E3338'; rrect(g, x0 - 14, H * .36, 28, 52, 4); g.fill(); g.fillStyle = '#C0392B'; rrect(g, x0 - 10, H * .37, 20, 22, 3); g.fill(); g.fillStyle = '#2E8B57'; rrect(g, x0 - 10, H * .36 + 27, 20, 22, 3); g.fill();
  g.fillStyle = '#1C1F22'; g.beginPath(); g.arc(x0, H * .37 + 11, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F7F4EE'; g.beginPath(); g.arc(x0, H * .36 + 38, 4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#F2C230'; g.fillRect(x0 - 6, H * .78, 12, 30); g.fillStyle = '#2B2B2B'; g.fillRect(x0 - 4, H * .82, 8, 2); // a yellow sleeve
}
function paintRoofKit(g, W, H, v) { // what stands on a Tokyo roof: tanks, AC units, antennas, a railing, a billboard frame
  const r = rnd(v * 17 + 3);
  g.strokeStyle = '#6F7478'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, H - 20); g.lineTo(W, H - 20); for (let x = 8; x < W; x += 22) { g.moveTo(x, H - 20); g.lineTo(x, H - 40); } g.moveTo(0, H - 40); g.lineTo(W, H - 40); g.stroke(); // parapet railing
  g.fillStyle = '#9AA0A6'; g.fillRect(0, H - 22, W, 22); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(0, H - 8, W, 8);
  if (v % 3 === 0) { // a water tank on legs
    const x = W * (.2 + r() * .3); g.fillStyle = '#5B6066'; g.fillRect(x - 24, H - 120, 4, 100); g.fillRect(x + 20, H - 120, 4, 100); g.fillRect(x - 2, H - 120, 4, 100);
    g.fillStyle = g.createLinearGradient(x - 30, 0, x + 30, 0); g.fillStyle.addColorStop(0, '#9FA6AD'); g.fillStyle.addColorStop(.5, '#E1E5E8'); g.fillStyle.addColorStop(1, '#8D959C'); rrect(g, x - 32, H - 190, 64, 76, 8); g.fill();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x - 32, H - 150, 64, 3); g.fillRect(x - 32, H - 128, 64, 3);
  }
  if (v % 3 === 1) { // two rooftop AC units
    for (const x of [W * .25, W * .55]) { g.fillStyle = '#B8BDC2'; rrect(g, x - 28, H - 86, 56, 46, 4); g.fill(); g.fillStyle = '#6F7478'; g.beginPath(); g.arc(x, H - 63, 15, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#A0A6AB'; g.lineWidth = 2; for (let a = 0; a < 6; a++) { g.beginPath(); g.moveTo(x, H - 63); g.lineTo(x + Math.cos(a) * 13, H - 63 + Math.sin(a) * 13); g.stroke(); } g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(x - 28, H - 46, 56, 6); }
  }
  if (v % 3 === 2) { // a billboard frame and a stairwell hut
    const x = W * .62; g.fillStyle = '#C9CDD2'; g.fillRect(x - 40, H - 150, 80, 50); g.strokeStyle = '#7A7F85'; g.lineWidth = 3; g.strokeRect(x - 40, H - 150, 80, 50); g.fillStyle = '#5B6066'; g.fillRect(x - 30, H - 100, 4, 60); g.fillRect(x + 26, H - 100, 4, 60);
    g.fillStyle = ['#C8463C', '#355F86', '#F2C230'][v % 3 ? v % 2 : 2]; g.fillRect(x - 34, H - 144, 68, 38); g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(x - 24, H - 130, 48, 6); g.fillRect(x - 24, H - 118, 30, 5);
    g.fillStyle = '#D7D2C8'; g.fillRect(W * .12, H - 92, 60, 72); g.fillStyle = '#B9B2A5'; g.fillRect(W * .12 - 4, H - 96, 68, 6); g.fillStyle = '#4A5056'; g.fillRect(W * .12 + 20, H - 70, 18, 50);
  }
  // an antenna somewhere
  const ax = W * (.1 + r() * .8); g.strokeStyle = '#4A5056'; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, H - 40); g.lineTo(ax, H - 140); for (const y of [H - 130, H - 115, H - 100]) { g.moveTo(ax - 14, y); g.lineTo(ax + 14, y); } g.stroke();
}
/* 歩行者（2026-11-15 作り直し。オーナー：「歩行者のデザインが安っぽすぎる」。前は四角と丸を重ねただけ・2 コマだった）。
   8 人それぞれに服・髪型・持ち物がある。体は丸みのある形に陰影をつけ、歩きは 4 コマ（足を前に出す・腕を逆にふる・体が少し上下する）。
   絵は 80×180 の目もりで描き、2 倍の細かさ（160×360）で作る。実在のブランド・ロゴは描かない */
const PEOPLE = [
  { top: '#2F4A6B', pants: '#22262E', hair: '#26211E', kind: 'suit', tie: '#B8473C', item: 'case', cut: 'short' },
  { top: '#C8554A', pants: '#3B4654', hair: '#5A3A26', kind: 'knit', item: 'tote', cut: 'bob' },
  { top: '#F4F1EA', pants: '#56626E', hair: '#2B2623', kind: 'shirt', item: 'lanyard', cut: 'short' },
  { top: '#6FA368', pants: '#2F3B47', hair: '#7A5236', kind: 'hood', item: 'pack', cut: 'messy' },
  { top: '#EFA7AE', pants: '#F2E8DA', hair: '#3B2A20', kind: 'cardi', item: 'shoulder', cut: 'long', skirt: 1 },
  { top: '#2A2C33', pants: '#2A2C33', hair: '#1F1C1A', kind: 'suit', tie: '#3F6E99', item: 'none', cut: 'part', glasses: 1 },
  { top: '#F0C13C', pants: '#3A5F86', hair: '#2B2623', kind: 'parka', item: 'pack', cut: 'cap' },
  { top: '#A9B4BE', pants: '#3A3F47', hair: '#B9B4AC', kind: 'coat', item: 'none', cut: 'hat', scarf: '#B8473C' }];
function paintWalker(g, W, H, v, frame, back) {
  const P = PEOPLE[v % PEOPLE.length], skin = v % 3 === 1 ? '#E8C2A2' : v % 3 === 2 ? '#F3D6BC' : '#EFCDB0', skinD = shadeHex(skin, .86);
  g.save(); g.scale(W / 80, H / 180); g.lineJoin = g.lineCap = 'round';
  const ph = frame / 4 * Math.PI * 2, a = Math.sin(ph), bob = -Math.abs(Math.cos(ph)) * 1.6, x = 40 + a * .8;
  const limb = (x1, y1, x2, y2, w1, w2, c1, c2) => { const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d; const gr = g.createLinearGradient(x1 + nx * w1, y1, x1 - nx * w1, y1); gr.addColorStop(0, c2); gr.addColorStop(.45, c1); gr.addColorStop(1, c2); g.fillStyle = gr;
    g.beginPath(); g.moveTo(x1 + nx * w1, y1 + ny * w1); g.lineTo(x2 + nx * w2, y2 + ny * w2); g.lineTo(x2 - nx * w2, y2 - ny * w2); g.lineTo(x1 - nx * w1, y1 - ny * w1); g.closePath(); g.fill(); g.beginPath(); g.arc(x1, y1, w1, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(x2, y2, w2, 0, Math.PI * 2); g.fill(); };
  // 足もとの影
  { const sh = g.createRadialGradient(40, 174, 1, 40, 174, 26); sh.addColorStop(0, 'rgba(30,22,16,.3)'); sh.addColorStop(1, 'rgba(30,22,16,0)'); g.fillStyle = sh; g.save(); g.translate(40, 174); g.scale(1, .24); g.translate(-40, -174); g.beginPath(); g.arc(40, 174, 26, 0, Math.PI * 2); g.fill(); g.restore(); }
  // 足：前に出した足は少し上（手前／奥）に見える。ひざで軽く曲がる
  const hipY = 104 + bob, legC = P.skirt ? skin : P.pants, legD = P.skirt ? skinD : shadeHex(P.pants, .72), shoe = P.kind === 'suit' ? '#1E1A18' : P.kind === 'hood' || P.kind === 'parka' ? '#F4F1EA' : '#4A3528';
  const legs = [[-1, Math.max(0, a)], [1, Math.max(0, -a)]].sort((p, q) => p[1] - q[1]); // 上がっていない足を先に
  for (const [sd, up] of legs) { const fx = x + sd * 7.5 - a * sd * .5, fy = 169 - up * 9, kx = x + sd * 7 + sd * up * 1.5, ky = (hipY + fy) / 2 - up * 2.5;
    limb(x + sd * 6.5, hipY, kx, ky, P.skirt ? 4.2 : 6.6, P.skirt ? 3.6 : 5.6, legC, legD); limb(kx, ky, fx, fy - 3, P.skirt ? 3.6 : 5.6, P.skirt ? 3 : 4.8, legC, legD);
    g.fillStyle = shoe; g.beginPath(); g.ellipse(fx + sd * .8, fy, 6.2, back ? 3.4 : 4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(fx + sd * .4, fy - 1.4, 3.4, 1.2, 0, 0, Math.PI * 2); g.fill();
    if (shoe === '#F4F1EA') { g.fillStyle = '#C9C4BA'; g.fillRect(fx - 5.5 + sd * .8, fy + 1.6, 11, 1.6); } }
  const hy0 = 30 + bob * 1.15, hr = 15.5, backHair = () => { if (P.cut === 'long' || P.cut === 'bob') { g.fillStyle = shadeHex(P.hair, .85); g.beginPath(); g.ellipse(x, hy0 + (P.cut === 'long' ? 13 : 6), hr + 2.5, P.cut === 'long' ? 25 : 16, 0, 0, Math.PI * 2); g.fill(); } };
  if (!back) backHair(); // 前から見ると、長い髪は体の後ろ
  // 体
  const top = P.top, topD = shadeHex(top, .74), topL = shadeHex(top, 1.1), sY = 54 + bob, wY = 106 + bob, long = P.kind === 'coat' ? 22 : P.kind === 'parka' ? 6 : 0;
  if (P.skirt) { const gr = vgrad(g, wY - 6, wY + 36, [[0, shadeHex(P.pants, 1.02)], [1, shadeHex(P.pants, .84)]]); g.fillStyle = gr; g.beginPath(); g.moveTo(x - 13, wY - 8); g.lineTo(x + 13, wY - 8); g.quadraticCurveTo(x + 21 + a, wY + 20, x + 19 + a * 1.5, wY + 36); g.quadraticCurveTo(x, wY + 40, x - 19 + a * 1.5, wY + 36); g.quadraticCurveTo(x - 21 + a, wY + 20, x - 13, wY - 8); g.fill();
    g.strokeStyle = 'rgba(120,100,80,.25)'; g.lineWidth = .8; for (const k of [-9, -3, 3, 9]) { g.beginPath(); g.moveTo(x + k * .7, wY); g.lineTo(x + k * 1.4 + a, wY + 35); g.stroke(); } }
  const body = () => { g.beginPath(); g.moveTo(x - 15, sY + 6); g.quadraticCurveTo(x - 16, sY - 1, x - 8, sY - 3); g.lineTo(x + 8, sY - 3); g.quadraticCurveTo(x + 16, sY - 1, x + 15, sY + 6); g.lineTo(x + 14.5 + long * .12, wY + long); g.quadraticCurveTo(x, wY + long + 4, x - 14.5 - long * .12, wY + long); g.closePath(); };
  { const gr = g.createLinearGradient(x - 16, 0, x + 16, 0); gr.addColorStop(0, topD); gr.addColorStop(.3, top); gr.addColorStop(.62, topL); gr.addColorStop(1, topD); g.fillStyle = gr; body(); g.fill();
    g.save(); body(); g.clip(); g.fillStyle = vgrad(g, sY, wY + long, [[0, 'rgba(255,255,255,.08)'], [.55, 'rgba(0,0,0,0)'], [1, 'rgba(20,14,10,.22)']]); g.fillRect(x - 20, sY - 6, 40, 90);
    g.strokeStyle = 'rgba(20,14,10,.14)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 10, wY - 20); g.quadraticCurveTo(x - 4, wY - 16, x - 9, wY - 6); g.moveTo(x + 10, wY - 24); g.quadraticCurveTo(x + 5, wY - 18, x + 9, wY - 8); g.stroke(); // 服のしわ
    if (!back) {
      if (P.kind === 'suit') { g.fillStyle = '#F6F3EC'; g.beginPath(); g.moveTo(x - 6, sY - 3); g.lineTo(x + 6, sY - 3); g.lineTo(x, sY + 22); g.closePath(); g.fill(); g.fillStyle = P.tie; g.beginPath(); g.moveTo(x - 2, sY + 1); g.lineTo(x + 2, sY + 1); g.lineTo(x + 2.8, sY + 17); g.lineTo(x, sY + 21); g.lineTo(x - 2.8, sY + 17); g.closePath(); g.fill();
        g.fillStyle = topD; g.beginPath(); g.moveTo(x - 7, sY - 3); g.lineTo(x - 1, sY + 22); g.lineTo(x - 9, sY + 10); g.closePath(); g.fill(); g.beginPath(); g.moveTo(x + 7, sY - 3); g.lineTo(x + 1, sY + 22); g.lineTo(x + 9, sY + 10); g.closePath(); g.fill(); g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.arc(x, sY + 30, 1, 0, 7); g.arc(x, sY + 38, 1, 0, 7); g.fill(); }
      else if (P.kind === 'shirt') { g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(x - 7, sY - 3); g.lineTo(x, sY + 5); g.lineTo(x + 7, sY - 3); g.lineTo(x + 4, sY - 5); g.lineTo(x - 4, sY - 5); g.closePath(); g.fill(); g.strokeStyle = 'rgba(60,70,80,.25)'; g.lineWidth = .8; g.beginPath(); g.moveTo(x, sY + 5); g.lineTo(x, wY); g.stroke();
        g.strokeStyle = '#3F6E99'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - 6, sY - 2); g.lineTo(x, sY + 24); g.lineTo(x + 6, sY - 2); g.stroke(); rrect(g, x - 4.5, sY + 23, 9, 11, 1.5); g.fillStyle = '#FBF6EE'; g.fill(); g.strokeStyle = '#355F86'; g.lineWidth = .9; g.stroke(); g.fillStyle = '#C9A176'; g.fillRect(x - 2.5, sY + 25, 5, 3.4); }
      else if (P.kind === 'hood' || P.kind === 'parka') { g.fillStyle = topD; g.beginPath(); g.ellipse(x, sY - 1, 11, 5, 0, 0, Math.PI); g.fill(); g.strokeStyle = '#F4F1EA'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(x - 3, sY + 3); g.lineTo(x - 3.5, sY + 14); g.moveTo(x + 3, sY + 3); g.lineTo(x + 3.5, sY + 13); g.stroke();
        if (P.kind === 'hood') { g.fillStyle = 'rgba(0,0,0,.14)'; rrect(g, x - 9, wY - 18, 18, 10, 4); g.fill(); } else { g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, sY + 4); g.lineTo(x, wY + long); g.stroke(); } }
      else if (P.kind === 'cardi') { g.fillStyle = '#FBF6EE'; g.beginPath(); g.moveTo(x - 5, sY - 3); g.lineTo(x + 5, sY - 3); g.lineTo(x + 3, wY - 6); g.lineTo(x - 3, wY - 6); g.closePath(); g.fill(); g.fillStyle = 'rgba(0,0,0,.25)'; for (const k of [12, 22, 32]) { g.beginPath(); g.arc(x + 5, sY + k, .9, 0, 7); g.fill(); } }
      else if (P.kind === 'knit') { g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 1; for (let k = 8; k < 46; k += 5) { g.beginPath(); g.moveTo(x - 14, sY + k); g.quadraticCurveTo(x, sY + k + 2, x + 14, sY + k); g.stroke(); } g.fillStyle = topD; g.beginPath(); g.ellipse(x, sY - 2, 8, 3.4, 0, 0, Math.PI * 2); g.fill(); }
      else if (P.kind === 'coat') { g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 1, sY + 6); g.lineTo(x + 1, wY + long); g.stroke(); g.fillStyle = 'rgba(0,0,0,.3)'; for (const k of [16, 30, 44]) { g.beginPath(); g.arc(x + 4, sY + k, 1.1, 0, 7); g.fill(); } }
    } else if (P.kind === 'suit' || P.kind === 'coat') { g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, sY + 4); g.lineTo(x, wY + long); g.stroke(); } // 背中のぬい目
    else if ((P.kind === 'hood' || P.kind === 'parka') && P.item !== 'pack') { g.fillStyle = topD; g.beginPath(); g.ellipse(x, sY + 3, 11, 8, 0, 0, Math.PI * 2); g.fill(); }
    g.restore(); }
  if (P.scarf) { g.fillStyle = P.scarf; rrect(g, x - 10, sY - 6, 20, 8, 4); g.fill(); if (!back) { rrect(g, x + 2, sY - 2, 6, 18, 2.5); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 2, sY + 11, 6, 1.4); } }
  // 背中のリュック（後ろ姿は上に、前からは肩ひもだけ）
  if (P.item === 'pack') { const pc = P.kind === 'parka' ? '#3A5F86' : '#4A4038'; if (back) { g.fillStyle = vgrad(g, sY + 2, sY + 40, [[0, shadeHex(pc, 1.15)], [1, shadeHex(pc, .8)]]); rrect(g, x - 11, sY + 2, 22, 34, 7); g.fill(); g.fillStyle = shadeHex(pc, .7); rrect(g, x - 8, sY + 18, 16, 13, 4); g.fill(); g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = .9; g.beginPath(); g.moveTo(x - 6, sY + 20); g.lineTo(x + 6, sY + 20); g.stroke(); }
    else { g.strokeStyle = pc; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 10, sY - 1); g.quadraticCurveTo(x - 12, sY + 16, x - 13, sY + 28); g.moveTo(x + 10, sY - 1); g.quadraticCurveTo(x + 12, sY + 16, x + 13, sY + 28); g.stroke(); } }
  // 腕：足と逆にふる。手に持ち物
  for (const sd of [-1, 1]) { const sw = -a * sd, hx = x + sd * 19 + sw * 1.2, hy = wY - 4 - Math.max(0, sw) * 5 + Math.abs(sw) * .5, ex = x + sd * 18.5, ey = sY + 26 - Math.max(0, sw) * 2;
    limb(x + sd * 15, sY + 5, ex, ey, 5.4, 4.8, top, topD); limb(ex, ey, hx, hy - 4, 4.8, 4.2, top, topD);
    g.fillStyle = skin; g.beginPath(); g.arc(hx, hy, 3.8, 0, Math.PI * 2); g.fill(); g.fillStyle = skinD; g.beginPath(); g.arc(hx + sd * .8, hy + 1, 2.2, 0, Math.PI); g.fill();
    const right = back ? sd < 0 : sd > 0; if (!right) continue;
    if (P.item === 'case') { g.strokeStyle = '#2B211B'; g.lineWidth = 1.6; g.beginPath(); g.arc(hx, hy + 5, 4, Math.PI, 0); g.stroke(); g.fillStyle = vgrad(g, hy + 5, hy + 22, [[0, '#6B4A32'], [1, '#4A3020']]); rrect(g, hx - 10, hy + 5, 20, 15, 2.5); g.fill(); g.fillStyle = '#D9B45A'; g.fillRect(hx - 1.5, hy + 5, 3, 3.4); g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(hx - 9, hy + 6.5, 18, 1.6); }
    else if (P.item === 'tote') { g.strokeStyle = '#B9A27E'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(hx - 5, hy + 12); g.lineTo(hx, hy); g.lineTo(hx + 5, hy + 12); g.stroke(); g.fillStyle = vgrad(g, hy + 10, hy + 32, [[0, '#F0E4CC'], [1, '#D8C6A2']]); g.beginPath(); g.moveTo(hx - 9, hy + 11); g.lineTo(hx + 9, hy + 11); g.lineTo(hx + 11, hy + 31); g.lineTo(hx - 11, hy + 31); g.closePath(); g.fill(); g.fillStyle = '#6FA368'; g.beginPath(); g.ellipse(hx - 3, hy + 10, 2.4, 5, -.4, 0, Math.PI * 2); g.ellipse(hx + 2, hy + 9, 2.2, 5.5, .3, 0, Math.PI * 2); g.fill(); }
    else if (P.item === 'shoulder') { g.strokeStyle = '#8A5A3C'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - sd * 9 * (back ? -1 : 1), sY - 1); g.lineTo(hx - sd * 3, wY - 2); g.stroke(); g.fillStyle = vgrad(g, wY - 4, wY + 12, [[0, '#A8714C'], [1, '#7C4E32']]); rrect(g, hx - sd * 3 - 7, wY - 3, 14, 12, 3.5); g.fill(); g.fillStyle = '#D9B45A'; g.beginPath(); g.arc(hx - sd * 3, wY + 2, 1.3, 0, 7); g.fill(); } }
  // 首・頭
  g.fillStyle = skinD; rrect(g, x - 4.2, hy0 + 11, 8.4, 11, 3); g.fill();
  for (const sd of [-1, 1]) { g.fillStyle = skin; g.beginPath(); g.ellipse(x + sd * (hr - .6), hy0 + 2, 2.6, 3.6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = skinD; g.beginPath(); g.ellipse(x + sd * (hr - .4), hy0 + 2.4, 1.2, 2, 0, 0, Math.PI * 2); g.fill(); }
  { const gr = g.createRadialGradient(x - 4, hy0 - 5, 2, x, hy0, hr * 1.25); gr.addColorStop(0, shadeHex(skin, 1.06)); gr.addColorStop(.7, skin); gr.addColorStop(1, skinD); g.fillStyle = gr; g.beginPath(); g.ellipse(x, hy0, hr, hr * 1.04, 0, 0, Math.PI * 2); g.fill(); }
  const hairG = g.createRadialGradient(x - 5, hy0 - 12, 2, x, hy0 - 4, hr * 1.5); hairG.addColorStop(0, shadeHex(P.hair, 1.5)); hairG.addColorStop(.5, P.hair); hairG.addColorStop(1, shadeHex(P.hair, .7)); g.fillStyle = hairG;
  if (back) { backHair(); g.fillStyle = hairG; g.beginPath(); g.ellipse(x, hy0 - .5, hr + 1, hr * 1.06 + 1, 0, 0, Math.PI * 2); g.fill(); if (P.cut === 'short' || P.cut === 'part' || P.cut === 'messy' || P.cut === 'cap' || P.cut === 'hat') { g.fillStyle = skinD; g.beginPath(); g.ellipse(x, hy0 + hr - 1, 6.5, 3.4, 0, 0, Math.PI); g.fill(); } // えりあし
    g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1; g.beginPath(); g.arc(x, hy0 - 2, hr - 4, Math.PI * 1.15, Math.PI * 1.6); g.stroke(); }
  else { g.beginPath(); // 前髪
    if (P.cut === 'short') { g.moveTo(x - hr - 1, hy0 - 1); g.quadraticCurveTo(x - hr - 1, hy0 - hr - 4, x, hy0 - hr - 3); g.quadraticCurveTo(x + hr + 1, hy0 - hr - 4, x + hr + 1, hy0 - 1); g.quadraticCurveTo(x + hr - 3, hy0 - 9, x + 4, hy0 - 10); g.quadraticCurveTo(x - 6, hy0 - 8, x - hr + 2, hy0 - 6); g.closePath(); }
    else if (P.cut === 'part') { g.moveTo(x - hr - 1, hy0); g.quadraticCurveTo(x - hr - 1, hy0 - hr - 4, x, hy0 - hr - 3); g.quadraticCurveTo(x + hr + 1, hy0 - hr - 4, x + hr + 1, hy0); g.quadraticCurveTo(x + hr - 2, hy0 - 10, x - 5, hy0 - 12); g.quadraticCurveTo(x - hr + 3, hy0 - 10, x - hr + 1, hy0 - 3); g.closePath(); }
    else if (P.cut === 'messy') { g.moveTo(x - hr - 1.5, hy0 + 1); g.quadraticCurveTo(x - hr - 3, hy0 - hr - 5, x - 2, hy0 - hr - 4); g.quadraticCurveTo(x + hr + 3, hy0 - hr - 5, x + hr + 1.5, hy0 + 1); for (const k of [10, 4, -2, -8]) g.lineTo(x + k, hy0 - 6 - (k & 1 ? 3 : 0)), g.lineTo(x + k - 3, hy0 - 10); g.closePath(); }
    else { g.moveTo(x - hr - 1.5, hy0 + 3); g.quadraticCurveTo(x - hr - 2.5, hy0 - hr - 5, x, hy0 - hr - 3.5); g.quadraticCurveTo(x + hr + 2.5, hy0 - hr - 5, x + hr + 1.5, hy0 + 3); g.quadraticCurveTo(x + hr - 1, hy0 - 6, x + 6, hy0 - 8); g.quadraticCurveTo(x, hy0 - 5, x - 6, hy0 - 8); g.quadraticCurveTo(x - hr + 1, hy0 - 6, x - hr - 1.5, hy0 + 3); g.closePath(); }
    g.fill(); g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1; g.beginPath(); g.arc(x - 2, hy0 - 4, hr - 3, Math.PI * 1.2, Math.PI * 1.55); g.stroke();
    // 顔：つぶらな目・ほお・小さな口
    for (const sd of [-1, 1]) { g.fillStyle = '#2A1E18'; g.beginPath(); g.ellipse(x + sd * 5.6, hy0 + 2.4, 1.7, 2.2, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x + sd * 5.6 + .6, hy0 + 1.6, .6, 0, 7); g.fill(); g.fillStyle = 'rgba(236,140,140,.38)'; g.beginPath(); g.ellipse(x + sd * 9, hy0 + 6.6, 3, 1.8, 0, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = '#9A5A50'; g.lineWidth = 1.1; g.beginPath(); g.arc(x, hy0 + 7, 2.6, Math.PI * .15, Math.PI * .85); g.stroke();
    if (P.glasses) { g.strokeStyle = '#2B2B2B'; g.lineWidth = 1; for (const sd of [-1, 1]) { rrect(g, x + sd * 5.6 - 4, hy0 - .6, 8, 6, 2); g.stroke(); } g.beginPath(); g.moveTo(x - 1.6, hy0 + 2); g.lineTo(x + 1.6, hy0 + 2); g.stroke(); } }
  if (P.cut === 'cap') { g.fillStyle = vgrad(g, hy0 - hr - 4, hy0 - 4, [[0, '#4E77A0'], [1, '#355F86']]); g.beginPath(); g.ellipse(x, hy0 - 6, hr + 1.5, hr - 2, 0, Math.PI, 0); g.fill(); if (!back) { g.fillStyle = '#2C4F73'; g.beginPath(); g.ellipse(x, hy0 - 6, hr + 3, 3.6, 0, 0, Math.PI); g.fill(); } else { g.fillStyle = '#2C4F73'; rrect(g, x - 5, hy0 - 8, 10, 3, 1.5); g.fill(); } g.fillStyle = '#F4F1EA'; g.beginPath(); g.arc(x, hy0 - hr - 3, 1.6, 0, 7); g.fill(); }
  if (P.cut === 'hat') { g.fillStyle = vgrad(g, hy0 - hr - 6, hy0 - 6, [[0, '#7A6A58'], [1, '#5C4E40']]); g.beginPath(); g.ellipse(x, hy0 - 8, hr - 1, hr - 3, 0, Math.PI, 0); g.fill(); g.fillStyle = '#4E4236'; g.beginPath(); g.ellipse(x, hy0 - 8, hr + 5, 3.4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#B8473C'; g.fillRect(x - hr + 1.5, hy0 - 12.5, hr * 2 - 3, 2.4); }
  g.restore();
}
Object.assign(PROP_ART, {
  lampC: (n, v) => artCanvas('plampC|' + v + n, 240, 480, (g, w, h) => paintLampC(g, w, h, n, v)),
  pole: () => artCanvas('ppole', 120, 560, paintPole),
  signal: (n, v) => artCanvas('psignal|' + v + n, 260, 420, (g, w, h) => paintSignal(g, w, h, n, v)),
  roof: (n, v) => artCanvas('proof' + v, 300, 200, (g, w, h) => paintRoofKit(g, w, h, +v || 0)),
  walker: (n, v) => { const [k, f, b] = String(v).split('.'); return artCanvas('pwalk' + v, 160, 360, (g, w, h) => paintWalker(g, w, h, +k, +f, +b)); },
});
// sprite sizes for the furniture that is painted whole (world units, and where the picture's base sits relative to the pavement)
const PROP_DIM = { lampC: { w: 2.4, h: 4.8, off: .5 }, pole: { w: 1.9, h: 8.9, off: 0 }, signal: { w: 3.3, h: 5.3, off: .6 } };

function paintKaminarimon(g, W, H, night) { // the thunder gate: two vermilion pillars, a dark lintel, the great red lantern
  const pw = W * .062, lint = H * .13;
  for (const x of [W * .13, W * .87]) { g.fillStyle = vgrad(g, 0, H, [[0, '#D9452B'], [1, '#9C2E1E']]); g.fillRect(x - pw / 2, lint, pw, H - lint); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - pw / 2 + 2, lint, pw * .3, H - lint); g.fillStyle = '#2B2B2B'; g.fillRect(x - pw / 2 - 3, H - 10, pw + 6, 10); }
  g.fillStyle = '#3B2A20'; g.fillRect(W * .04, lint * .35, W * .92, lint * .65); g.fillStyle = '#1E1A18'; g.fillRect(0, 0, W, lint * .4); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, lint * .4, W, 3);
  g.fillStyle = '#D9452B'; for (let x = W * .1; x < W * .9; x += W * .1) g.fillRect(x, lint * .45, 4, lint * .5); // rafters
  // the lantern: a red paper body with ribs, black bands, the characters, a dark base and a tassel
  const cx = W / 2, top = H * .5, bot = H * .85, lw = W * .08;
  g.fillStyle = '#2B2B2B'; g.fillRect(cx - 4, lint, 8, top - lint + 8); g.fillStyle = '#D9A21B'; g.fillRect(cx - 14, top - 10, 28, 6);
  const body = g.createRadialGradient(cx - lw * .3, (top + bot) / 2 - 20, 10, cx, (top + bot) / 2, lw * 1.2); body.addColorStop(0, night ? '#FF7A5A' : '#E85A3C'); body.addColorStop(.7, '#C8362A'); body.addColorStop(1, '#8A1F14');
  g.fillStyle = body; g.beginPath(); g.moveTo(cx - lw * .7, top + 8); g.bezierCurveTo(cx - lw * 1.25, top + (bot - top) * .3, cx - lw * 1.25, bot - (bot - top) * .3, cx - lw * .7, bot - 8); g.lineTo(cx + lw * .7, bot - 8); g.bezierCurveTo(cx + lw * 1.25, bot - (bot - top) * .3, cx + lw * 1.25, top + (bot - top) * .3, cx + lw * .7, top + 8); g.closePath(); g.fill();
  g.save(); g.clip(); g.strokeStyle = 'rgba(60,10,5,.35)'; g.lineWidth = 1.5; for (let y = top + 10; y < bot - 8; y += 6) { g.beginPath(); g.moveTo(cx - lw * 1.3, y); g.quadraticCurveTo(cx, y + 4, cx + lw * 1.3, y); g.stroke(); } g.restore(); // the ribs
  g.fillStyle = '#1E1A18'; g.fillRect(cx - lw * .72, top, lw * 1.44, 14); g.fillRect(cx - lw * .72, bot - 14, lw * 1.44, 14); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(cx - lw * .72, top + 2, lw * 1.44, 3);
  g.fillStyle = '#1A0F0A'; g.font = `900 ${Math.round(lw * .62)}px "Zen Maru Gothic","Hiragino Sans",serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('雷', cx, top + (bot - top) * .36); g.fillText('門', cx, top + (bot - top) * .66);
  g.fillStyle = '#2B2B2B'; g.beginPath(); g.moveTo(cx - 10, bot); g.lineTo(cx + 10, bot); g.lineTo(cx + 6, H - 2); g.lineTo(cx - 6, H - 2); g.closePath(); g.fill(); g.fillStyle = '#D9A21B'; g.fillRect(cx - 12, bot - 2, 24, 4); // the carved base and tassel ring
  if (night) { g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(cx, (top + bot) / 2, 10, cx, (top + bot) / 2, lw * 1.8); gl.addColorStop(0, 'rgba(255,170,110,.5)'); gl.addColorStop(1, 'rgba(255,150,90,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
}
ART.kaminarimon = (o, night) => artCanvas('kmon' + (night ? 'N' : ''), 720, 380, (g, w, h) => paintKaminarimon(g, w, h, night));

// the hanging ads follow the season of the day you are on (a 'summer outing' ad in winter, or a 'morning' ad at night, looked wrong — 2026-11-08)
const AD_SEASON = { spring: ['春の旅', 'お花見へ', '新生活'], summer: ['夏のおでかけ', '花火大会', '冷たい麦茶'], autumn: ['読書の秋', '紅葉狩り', '新米の季節'], winter: ['冬のあったか', '年末セール', '温泉へ'] };
const AD_ANY = ['新発売', '週末セール', '東京さんぽ', 'お弁当特集', '映画公開', '美術館へ', '牧草フェア'];
const adSeason = () => { try { return seasonOf(G.planDay || 1); } catch (e) { return 'spring'; } };
const adWords = se => [...(AD_SEASON[se] || AD_SEASON.spring), ...AD_ANY];
function paintAdPoster(g, W, H, v, se) { // a hanging train advertisement: a bright block of colour, a bold headline, a line of small print
  const r = rnd(v * 53 + 9), bg = ['#F7E7B8', '#CFE6F5', '#F4CFD8', '#D7EFD0', '#FBF6EE', '#2B2B2B'][v % 6], ink = v % 6 === 5 ? '#FBF6EE' : '#2B2B2B';
  g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = ['#C8463C', '#355F86', '#F2C230', '#5F9E5A', '#E86A75'][(r() * 5) | 0]; g.fillRect(W * .08, H * .12, W * .84, H * .42);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(W * .7, H * .33, H * .14, 0, Math.PI * 2); g.fill();
  g.fillStyle = ink; g.font = `900 ${Math.round(H * .17)}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; { const ws = adWords(se); g.fillText(ws[v % ws.length], W / 2, H * .7); }
  g.fillStyle = v % 6 === 5 ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.35)'; for (let k = 0; k < 3; k++) g.fillRect(W * .15, H * (.84 + k * .05), W * (.7 - k * .15), H * .02);
  g.fillStyle = '#9AA0A6'; g.fillRect(W * .2, 0, 3, H * .1); g.fillRect(W * .8, 0, 3, H * .1);
}
PROP_ART.ad = (n, v) => { const m = /^(\d+)([a-z]*)$/.exec(String(v)) || [], se = m[2] && AD_SEASON[m[2]] ? m[2] : adSeason(); return artCanvas('pad' + (+m[1] || 0) + se, 300, 200, (g, w, h) => paintAdPoster(g, w, h, +m[1] || 0, se)); }; // 季節は区間を作った日のもの（前の日の絵が使い回されて、夏に「お花見へ」が出ていた：2026-11-09）

/* ---- the last box-built obstacles, painted ---- */
function paintFuton(g, W, H) { // a futon laid out on the floor, seen from the side: the mattress, the rumpled quilt, the pillow
  g.fillStyle = 'rgba(40,30,20,.3)'; g.beginPath(); g.ellipse(W / 2, H - 5, W * .5, 6, 0, 0, Math.PI * 2); g.fill();
  const c = ['#7E9DC4', '#D99AA6', '#8FB59A'][(G.stats && G.stats.runs || 0) % 3];
  puffLayer(g, W * .02, H * .58, W * .96, H * .36, '#F4EFE4', '#D6CCBA', { bulge: .4, sag: .1, tufts: 1 });
  // the quilt: rolling humps where it was kicked about
  g.save(); g.beginPath(); g.moveTo(W * .2, H * .66);
  g.bezierCurveTo(W * .28, H * .2, W * .42, H * .3, W * .5, H * .4); g.bezierCurveTo(W * .58, H * .14, W * .76, H * .22, W * .84, H * .44);
  g.bezierCurveTo(W * .92, H * .56, W * .97, H * .66, W * .96, H * .8); g.bezierCurveTo(W * .7, H * .86, W * .4, H * .86, W * .18, H * .8); g.closePath();
  const gr = g.createLinearGradient(0, H * .15, 0, H * .86); gr.addColorStop(0, shadeHex(c, 1.12)); gr.addColorStop(.6, c); gr.addColorStop(1, shadeHex(c, .78)); g.fillStyle = gr; g.fill(); g.clip();
  g.strokeStyle = 'rgba(30,30,50,.18)'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * .5, H * .42); g.quadraticCurveTo(W * .54, H * .62, W * .5, H * .84); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.18)'; const rr = rnd(9); for (let k = 0; k < 60; k++) { g.beginPath(); g.arc(W * (.2 + rr() * .78), H * (.2 + rr() * .66), 2, 0, Math.PI * 2); g.fill(); }
  g.restore();
  puffLayer(g, W * .03, H * .38, W * .16, H * .3, '#EDE4D2', '#C9B89A', { bulge: .3, sag: .16 }); // the pillow
}
function paintNoren(g, W, H) { // a shop curtain in three split panels with a shop name, hung from a bamboo pole (open below)
  const home0 = G.segs && G.segs[G.ci] && G.segs[G.ci].th.kind === 'room', top = H * .02, bot = H * .76, col = home0 ? '#2F4E78' : ['#1F3A5F', '#7A2E24', '#2E5E3A', '#2B2B2B'][(G.day || 1) % 4];
  g.fillStyle = '#C9A06A'; g.fillRect(0, top, W, 6); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, top + 4, W, 2);
  const n = 3, pw = W / n;
  for (let i = 0; i < n; i++) { const x0 = i * pw + 3, x1 = (i + 1) * pw - 3; g.fillStyle = vgrad(g, top, bot, [[0, shadeHex(col, 1.12)], [1, shadeHex(col, .8)]]);
    g.beginPath(); g.moveTo(x0, top + 6); g.lineTo(x1, top + 6); g.lineTo(x1 + 4, bot - 8); g.quadraticCurveTo((x0 + x1) / 2, bot + 6, x0 - 4, bot - 8); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x0 + (x1 - x0) * .55, top + 6, (x1 - x0) * .18, bot - top - 14); }
  if (home0) { g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 3; for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) { const cx = i * pw + pw / 2, cy = top + (bot - top) * (.25 + k * .17); g.beginPath(); g.arc(cx, cy + 10, pw * .22, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(cx, cy + 10, pw * .12, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } return; }
  g.fillStyle = '#FBF6EE'; g.font = `900 ${Math.round(pw * .5)}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const word = home0 ? '' : ['食堂', '甘味', '湯', 'そば'][(G.day || 1) % 4], first = word.length === 1 ? 1 : 0; [...word].forEach((ch, i) => g.fillText(ch, pw * (i + first) + pw / 2, top + (bot - top) * .5));
  const cx = pw * (word.length === 1 ? 0 : 2) + pw / 2, cy = top + (bot - top) * .5; g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(cx, cy, pw * .17, 0, Math.PI * 2); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(cx, cy, pw * .11, 0, Math.PI * 2); g.fill(); // a shop crest on the spare panel
}
function paintStep(g, W, H) { // a long wooden step up to the raised floor, worn in the middle
  g.fillStyle = vgrad(g, 0, H, [[0, '#A8824F'], [1, '#6B4A2E']]); g.fillRect(0, H * .1, W, H * .9); g.fillStyle = '#C9A06A'; g.fillRect(0, H * .1, W, H * .18);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, H * .1, W, 3); g.strokeStyle = 'rgba(60,40,20,.35)'; g.lineWidth = 1.5; for (const y of [.42, .58, .74]) { g.beginPath(); g.moveTo(0, H * y); g.lineTo(W, H * y + 2); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.ellipse(W / 2, H * .2, W * .22, H * .06, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, H * .95, W, H * .05);
}
function paintPillar(g, W, H) { // a square timber pillar with a sign plate and a rounded base
  g.fillStyle = g.createLinearGradient(0, 0, W, 0); g.fillStyle.addColorStop(0, '#5A3E2A'); g.fillStyle.addColorStop(.4, '#9C7652'); g.fillStyle.addColorStop(1, '#4A3220'); g.fillRect(W * .12, 0, W * .76, H);
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; for (let y = 10; y < H; y += 14) { g.beginPath(); g.moveTo(W * .14, y); g.lineTo(W * .86, y + 3); g.stroke(); }
  g.fillStyle = '#2B2B2B'; g.fillRect(W * .06, H * .92, W * .88, H * .08); g.fillStyle = '#F2E6D8'; g.fillRect(W * .25, H * .3, W * .5, H * .2); g.strokeStyle = '#8A5A36'; g.lineWidth = 2; g.strokeRect(W * .25, H * .3, W * .5, H * .2);
  g.fillStyle = '#2B2B2B'; g.font = `900 ${Math.round(W * .2)}px "Zen Maru Gothic",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('禁', W / 2, H * .36); g.fillText('煙', W / 2, H * .45);
}
function paintStationPole(g, W, H) { // a slim station pillar, pale blue, with a number plate
  g.fillStyle = g.createLinearGradient(0, 0, W, 0); g.fillStyle.addColorStop(0, '#6E8AA3'); g.fillStyle.addColorStop(.45, '#C9D8E4'); g.fillStyle.addColorStop(1, '#5E7A94'); g.fillRect(W * .3, 0, W * .4, H);
  g.fillStyle = '#F2C230'; g.fillRect(W * .26, H * .48, W * .48, H * .1); g.fillStyle = '#2B2B2B'; g.font = `900 ${Math.round(W * .22)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('3', W / 2, H * .53);
  g.fillStyle = '#2B2B2B'; g.fillRect(W * .24, H * .95, W * .52, H * .05);
}
function paintBag(g, W, H) { // a handbag left on the floor
  SH(g, W, H, .25); const c = '#8C5A3C'; g.fillStyle = vgrad(g, H * .3, H, [[0, shadeHex(c, 1.12)], [1, shadeHex(c, .78)]]); rrect(g, W * .08, H * .32, W * .84, H * .62, 12); g.fill();
  g.strokeStyle = shadeHex(c, .7); g.lineWidth = 5; g.beginPath(); g.moveTo(W * .3, H * .34); g.quadraticCurveTo(W / 2, -H * .1, W * .7, H * .34); g.stroke();
  g.fillStyle = '#D9A21B'; g.fillRect(W * .44, H * .5, W * .12, H * .08); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(W * .08, H * .6, W * .84, 3);
}
function paintRope(g, W, H) { // a red velvet rope between brass stanchions
  const px = [W * .06, W * .5, W * .94];
  for (const x of px) { g.fillStyle = vgrad(g, 0, H, [[0, '#E6C560'], [1, '#9C7A1E']]); g.fillRect(x - 5, H * .12, 10, H * .88); g.fillStyle = '#C9A030'; g.beginPath(); g.ellipse(x, H * .98, 14, 5, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(x, H * .12, 7, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = '#B8202C'; g.lineWidth = 9; g.lineCap = 'round'; for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(px[i], H * .18); g.quadraticCurveTo((px[i] + px[i + 1]) / 2, H * .6, px[i + 1], H * .18); g.stroke(); }
  g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 3; for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(px[i], H * .15); g.quadraticCurveTo((px[i] + px[i + 1]) / 2, H * .55, px[i + 1], H * .15); g.stroke(); }
}
function paintJokoro(g, W, H) { // a bronze incense burner with a little roof, smoke rising
  /* 見た目 45〜49：お寺の香炉。四角 → 丸くふくらんだ胴／三本脚／そった屋根と金の宝珠／青銅の緑青（ろくしょう）／けむりをやわらかい筋に */
  SH(g, W, H, .3); const br = (y0, y1) => { const b = g.createLinearGradient(W * .14, 0, W * .86, 0); b.addColorStop(0, '#39463A'); b.addColorStop(.3, '#8A9A78'); b.addColorStop(.6, '#5C6B52'); b.addColorStop(1, '#2F3A30'); return b; };
  g.fillStyle = '#2F3A30'; for (const x of [.24, .5, .76]) { g.beginPath(); g.moveTo(W * (x - .06), H * .78); g.lineTo(W * (x + .06), H * .78); g.lineTo(W * (x + .035), H * .98); g.lineTo(W * (x - .035), H * .98); g.closePath(); g.fill(); }
  g.fillStyle = br(); g.beginPath(); g.moveTo(W * .18, H * .4); g.bezierCurveTo(W * .04, H * .56, W * .1, H * .84, W * .3, H * .86); g.lineTo(W * .7, H * .86); g.bezierCurveTo(W * .9, H * .84, W * .96, H * .56, W * .82, H * .4); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(W / 2, H * .41, W * .32, H * .028, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#6E7D62'; rrect(g, W * .14, H * .36, W * .72, H * .05, 4); g.fill();
  g.strokeStyle = 'rgba(200,215,170,.5)'; g.lineWidth = 2; g.beginPath(); g.ellipse(W / 2, H * .62, W * .14, H * .1, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(W * .5, H * .54); g.lineTo(W * .5, H * .7); g.moveTo(W * .39, H * .62); g.lineTo(W * .61, H * .62); g.stroke();
  g.fillStyle = 'rgba(120,190,160,.3)'; for (const [x, y, rx, ry] of [[.26, .7, .07, .05], [.72, .52, .06, .04], [.6, .8, .08, .025]]) { g.beginPath(); g.ellipse(W * x, H * y, W * rx, H * ry, .4, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#3E4A3A'; for (const x of [.2, .8]) g.fillRect(W * x - 3, H * .24, 6, H * .13);
  g.fillStyle = vgrad(g, H * .1, H * .27, [[0, '#7A8A6A'], [1, '#3E4A3A']]); g.beginPath(); g.moveTo(W * .04, H * .27); g.quadraticCurveTo(W * .12, H * .22, W * .3, H * .2); g.quadraticCurveTo(W * .46, H * .17, W * .5, H * .11); g.quadraticCurveTo(W * .54, H * .17, W * .7, H * .2); g.quadraticCurveTo(W * .88, H * .22, W * .96, H * .27); g.quadraticCurveTo(W * .5, H * .23, W * .04, H * .27); g.fill();
  { const cx = W / 2, cy = H * .1, r = 6.5; const gg = g.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, r); gg.addColorStop(0, '#FFE9A6'); gg.addColorStop(1, '#B98522'); g.fillStyle = gg; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = 'rgba(235,235,230,.5)'; g.lineCap = 'round'; for (const [x, k, lw] of [[.4, -1, 6], [.6, 1, 4.5]]) { g.lineWidth = lw; g.beginPath(); g.moveTo(W * x, H * .35); g.bezierCurveTo(W * (x + k * .16), H * .26, W * (x + k * .02), H * .16, W * (x + k * .14), H * .03); g.stroke(); }
}
function paintPicnic(g, W, H) { // a picnic sheet with a bento box and a thermos
  g.fillStyle = '#4E77A0'; g.beginPath(); g.moveTo(W * .1, H * .35); g.lineTo(W * .9, H * .35); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.18)'; for (let x = W * .1; x < W; x += W * .16) g.fillRect(x, H * .35, 5, H * .65);
  g.fillStyle = '#F2E6D8'; rrect(g, W * .28, H * .18, W * .3, H * .5, 6); g.fill(); g.fillStyle = '#C8463C'; g.fillRect(W * .31, H * .24, W * .1, H * .14); g.fillStyle = '#5F9E5A'; g.fillRect(W * .43, H * .24, W * .1, H * .14); g.fillStyle = '#F2C230'; g.fillRect(W * .31, H * .44, W * .22, H * .14);
  g.fillStyle = '#355F86'; rrect(g, W * .66, H * .02, W * .14, H * .62, 8); g.fill(); g.fillStyle = '#C9CDD2'; g.fillRect(W * .66, H * .02, W * .14, H * .14);
}
function paintRing(g, W, H) { // a life ring lying on the deck
  g.save(); g.translate(W / 2, H * .6); g.scale(1, .5); g.lineWidth = W * .22; g.strokeStyle = '#F2F2F2'; g.beginPath(); g.arc(0, 0, W * .36, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = '#D33A2C'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(0, 0, W * .36, k * Math.PI / 2 + .25, k * Math.PI / 2 + .85); g.stroke(); } g.restore();
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(W / 2, H * .9, W * .4, H * .1, 0, 0, Math.PI * 2); g.fill();
}
Object.assign(ART, {
  futon: () => artCanvas('futonO', 520, 70, paintFuton), noren: () => { const home = G.segs && G.segs[G.ci] && G.segs[G.ci].th.kind === 'room'; return artCanvas('norenO' + (home ? 'H' : (G.day || 1) % 4), 560, 290, paintNoren); }, step: () => artCanvas('stepO', 920, 60, paintStep),
  pillar: () => artCanvas('pillarO', 130, 370, paintPillar), pole: () => artCanvas('poleO', 60, 300, paintStationPole), bag: () => artCanvas('bagO', 110, 90, paintBag),
  rope: () => artCanvas('ropeO', 540, 80, paintRope), jokoro: () => artCanvas('jokoroO', 140, 210, paintJokoro), picnic: () => artCanvas('picnicO', 180, 70, paintPicnic), ring: () => artCanvas('ringO', 100, 40, paintRing),
});

// pieces for the title room, reusing the obstacle painters
Object.assign(PROP_ART, { tChabudai: () => ART.chabudai({}), tMug: () => ART.mug({}), tPapers: () => ART.papers({}), tClock: () => ART.clock({}), tZabuton: () => ART.zabuton({}), tToys: () => ART.toys({}) });

function paintPendant(g, W, H) { // a paper pendant lamp on a cord, lit from inside
  g.strokeStyle = '#4A3220'; g.lineWidth = 3; g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, H * .22); g.stroke();
  const gr = g.createRadialGradient(W / 2, H * .5, 4, W / 2, H * .55, W * .5); gr.addColorStop(0, '#FFF6DC'); gr.addColorStop(.75, '#F3E2BC'); gr.addColorStop(1, '#D9C49A');
  g.fillStyle = gr; g.beginPath(); g.ellipse(W / 2, H * .58, W * .46, H * .36, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(120,90,50,.35)'; g.lineWidth = 1.2; for (let k = 1; k < 7; k++) { const y = H * .58 + (k - 3.5) * H * .09, w = Math.sqrt(1 - Math.pow((k - 3.5) / 4, 2)) * W * .46; g.beginPath(); g.moveTo(W / 2 - w, y); g.quadraticCurveTo(W / 2, y + 3, W / 2 + w, y); g.stroke(); }
  g.fillStyle = '#4A3220'; g.fillRect(W * .42, H * .2, W * .16, 6); g.fillRect(W * .46, H * .92, W * .08, 5);
}
PROP_ART.pendant = () => artCanvas('pendant', 140, 140, paintPendant);
function paintTorii(g, W, H, v) { // a myojin torii: round pillars leaning in a little, the tie beam through them, the upswept top beam with its black cap, the name plaque
  const [col, top, kind] = String(v).split('/'); const c = col || '#C8463C', k = top || '#2B2B2B';
  if (kind === 'tunnel') return paintToriiTunnel(g, W, H, c, k);
  const px = [W * .2, W * .8], pw = W * .055, base = H, py0 = H * .2;
  for (const x of px) { const lean = (x < W / 2 ? 1 : -1) * W * .012; const gr = g.createLinearGradient(x - pw, 0, x + pw, 0); gr.addColorStop(0, shadeHex(c, .72)); gr.addColorStop(.4, shadeHex(c, 1.12)); gr.addColorStop(1, shadeHex(c, .62));
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - pw - lean * .2, base); g.lineTo(x + pw - lean * .2, base); g.lineTo(x + pw * .85 + lean, py0); g.lineTo(x - pw * .85 + lean, py0); g.closePath(); g.fill();
    g.fillStyle = '#2B2B2B'; g.fillRect(x - pw * 1.25, base - H * .045, pw * 2.5, H * .045); // the black foot
    g.fillStyle = shadeHex(c, .8); g.fillRect(x - pw * 1.1, H * .44, pw * 2.2, H * .02); }
  // the tie beam (nuki), running through and past the pillars
  g.fillStyle = vgrad(g, H * .3, H * .36, [[0, shadeHex(c, 1.1)], [1, shadeHex(c, .75)]]); g.fillRect(W * .08, H * .3, W * .84, H * .055);
  // the plaque between the beams
  g.fillStyle = shadeHex(c, .85); g.fillRect(W * .47, H * .19, W * .06, H * .11); g.fillStyle = '#2B2420'; g.fillRect(W * .445, H * .17, W * .11, H * .13); g.strokeStyle = '#C9A030'; g.lineWidth = 2; g.strokeRect(W * .45, H * .175, W * .1, H * .12);
  if (kind && kind !== 'tunnel') { /* 額の文字（縦書き・金）。前はまっ黒な板だった */ const tx = [...kind].slice(0, 2); g.fillStyle = '#E2BE55'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${Math.round(H * (tx.length > 1 ? .05 : .075))}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; tx.forEach((ch, i) => g.fillText(ch, W * .5, H * (tx.length > 1 ? .207 + i * .056 : .235))); }
  // the lower top beam (shimaki) and the upswept kasagi with its dark cap
  g.fillStyle = vgrad(g, H * .12, H * .18, [[0, shadeHex(c, 1.08)], [1, shadeHex(c, .72)]]); g.fillRect(W * .06, H * .125, W * .88, H * .055);
  g.fillStyle = k; g.beginPath(); g.moveTo(0, H * .02); g.quadraticCurveTo(W * .5, H * .1, W, H * .02); g.lineTo(W * .97, H * .125); g.quadraticCurveTo(W * .5, H * .17, W * .03, H * .125); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(W * .02, H * .04); g.quadraticCurveTo(W * .5, H * .11, W * .98, H * .04); g.lineTo(W * .98, H * .055); g.quadraticCurveTo(W * .5, H * .125, W * .02, H * .055); g.closePath(); g.fill();
}
/* 鳥居のトンネル用：背が高く、横木は上のほう（絵の上から 22% まで）にまとめ、額はなし。くぐる人の目の高さより下に何も渡さないので、道の先が見える（2026-11-15） */
function paintToriiTunnel(g, W, H, c, k) {
  const px = [W * .2, W * .8], pw = W * .05, base = H, py0 = H * .124;
  for (const x of px) { const lean = (x < W / 2 ? 1 : -1) * W * .012; const gr = g.createLinearGradient(x - pw, 0, x + pw, 0); gr.addColorStop(0, shadeHex(c, .72)); gr.addColorStop(.4, shadeHex(c, 1.12)); gr.addColorStop(1, shadeHex(c, .62));
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - pw - lean * .2, base); g.lineTo(x + pw - lean * .2, base); g.lineTo(x + pw * .85 + lean, py0); g.lineTo(x - pw * .85 + lean, py0); g.closePath(); g.fill();
    g.fillStyle = '#2B2B2B'; g.fillRect(x - pw * 1.25, base - H * .034, pw * 2.5, H * .034); }
  g.fillStyle = vgrad(g, H * .186, H * .22, [[0, shadeHex(c, 1.1)], [1, shadeHex(c, .75)]]); g.fillRect(W * .08, H * .186, W * .84, H * .034);                 // 貫（目の高さより上）
  g.fillStyle = vgrad(g, H * .078, H * .112, [[0, shadeHex(c, 1.08)], [1, shadeHex(c, .72)]]); g.fillRect(W * .06, H * .078, W * .88, H * .034);              // 島木
  g.fillStyle = k; g.beginPath(); g.moveTo(0, H * .012); g.quadraticCurveTo(W * .5, H * .062, W, H * .012); g.lineTo(W * .97, H * .078); g.quadraticCurveTo(W * .5, H * .106, W * .03, H * .078); g.closePath(); g.fill();   // 笠木
  g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(W * .02, H * .025); g.quadraticCurveTo(W * .5, H * .069, W * .98, H * .025); g.lineTo(W * .98, H * .034); g.quadraticCurveTo(W * .5, H * .078, W * .02, H * .034); g.closePath(); g.fill();
}
function paintStreetGate(g, W, H, v) { // a shopping-street arch: two slim posts, a lit sign board with the street's name, a row of bulbs
  const [txt, col] = String(v).split('/'); const c = col || '#2F5579';
  for (const x of [W * .06, W * .94]) { const gr = g.createLinearGradient(x - 8, 0, x + 8, 0); gr.addColorStop(0, '#2B2B30'); gr.addColorStop(.5, '#6E7278'); gr.addColorStop(1, '#2B2B30'); g.fillStyle = gr; g.fillRect(x - 7, H * .2, 14, H * .8); g.fillStyle = '#2B2B30'; g.fillRect(x - 12, H - 10, 24, 10); }
  g.fillStyle = shadeHex(c, .6); rrect(g, W * .02, H * .02, W * .96, H * .24, 8); g.fill(); g.fillStyle = vgrad(g, H * .04, H * .24, [[0, shadeHex(c, 1.15)], [1, c]]); rrect(g, W * .035, H * .035, W * .93, H * .21, 6); g.fill();
  g.fillStyle = '#FBF6EE'; g.font = `900 ${Math.round(H * .15)}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 4; g.fillText(txt || '', W / 2, H * .145, W * .86); g.shadowBlur = 0;
  g.fillStyle = '#FFE9A8'; for (let x = W * .05; x < W * .96; x += W * .035) { g.beginPath(); g.arc(x, H * .275, 3, 0, Math.PI * 2); g.fill(); }
  /* 見た目 179〜181：商店街のアーチ。電球のまわりのあかり／看板の上のふちの光と、下のかげ／柱の根もとの台と帯 */
  g.fillStyle = 'rgba(255,233,168,.28)'; for (let x = W * .05; x < W * .96; x += W * .035) { g.beginPath(); g.arc(x, H * .275, 7, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.25)'; rrect(g, W * .045, H * .04, W * .91, H * .02, 4); g.fill(); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(W * .04, H * .225, W * .92, H * .018);
  for (const x of [W * .06, W * .94]) { g.fillStyle = shadeHex(c, .9); g.fillRect(x - 8, H * .5, 16, H * .03); g.fillStyle = '#3A3A40'; rrect(g, x - 14, H - 16, 28, 16, 3); g.fill(); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(x - 14, H - 16, 28, 2); }
}
Object.assign(PROP_ART, { torii: (n, v) => artCanvas('ptorii|' + v, 720, 520, (g, w, h) => paintTorii(g, w, h, v)), sgate: (n, v) => artCanvas('psgate|' + v, 900, 560, (g, w, h) => paintStreetGate(g, w, h, v)) });
function paintOverpass(g, W, H, v) { // an elevated road or railway seen head-on: the deck's concrete edge with a sound wall or a railing, piers at both ends, the shadow underneath
  const rail = v === 'rail', deckY = H * (rail ? .62 : .66), deckH = H * (rail ? .14 : .2);
  for (const x of [W * .06, W * .94]) { const gr = g.createLinearGradient(x - W * .03, 0, x + W * .03, 0); gr.addColorStop(0, '#7E8388'); gr.addColorStop(.45, '#B9BEC4'); gr.addColorStop(1, '#6E737A'); g.fillStyle = gr; g.fillRect(x - W * .028, deckY, W * .056, H - deckY); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x - W * .028, H - 8, W * .056, 8); }
  g.fillStyle = vgrad(g, deckY - deckH, deckY, [[0, '#C9CDD2'], [.2, '#A9AFB5'], [1, '#8E949A']]); g.fillRect(0, deckY - deckH, W, deckH);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, deckY - 4, W, 4); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(0, deckY - deckH, W, 3);
  g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1.5; for (let x = W * .1; x < W; x += W * .12) { g.beginPath(); g.moveTo(x, deckY - deckH); g.lineTo(x, deckY); g.stroke(); } // panel joints
  if (rail) { g.strokeStyle = '#6E737A'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, deckY - deckH - 22); g.lineTo(W, deckY - deckH - 22); for (let x = 0; x < W; x += 18) { g.moveTo(x, deckY - deckH); g.lineTo(x, deckY - deckH - 22); } g.stroke();
    g.strokeStyle = '#4A4F55'; g.lineWidth = 2; for (let x = W * .05; x < W; x += W * .2) { g.beginPath(); g.moveTo(x, deckY - deckH); g.lineTo(x, deckY - deckH - 70); g.moveTo(x - 14, deckY - deckH - 64); g.lineTo(x + 14, deckY - deckH - 64); g.stroke(); } } // overhead line poles
  else { g.fillStyle = vgrad(g, deckY - deckH - H * .16, deckY - deckH, [[0, '#DCE5EC'], [1, '#B4C1CC']]); g.fillRect(0, deckY - deckH - H * .16, W, H * .16); g.strokeStyle = 'rgba(80,95,110,.45)'; g.lineWidth = 2; for (let x = 0; x < W; x += W * .05) { g.beginPath(); g.moveTo(x, deckY - deckH - H * .16); g.lineTo(x, deckY - deckH); g.stroke(); } // the sound wall
    g.fillStyle = '#2F6B4F'; rrect(g, W * .62, deckY - deckH - H * .15, W * .2, H * .1, 4); g.fill(); g.fillStyle = '#FBF6EE'; g.font = `900 ${Math.round(H * .045)}px "Zen Maru Gothic",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tr('首都高 出口', 'EXPRESSWAY EXIT'), W * .72, deckY - deckH - H * .1, W * .18); }
  // a shadow cast under the deck on whatever is behind
  g.fillStyle = 'rgba(30,35,45,.18)'; g.fillRect(W * .09, deckY, W * .82, H * .04);
  if (rail) { g.fillStyle = '#F2C230'; g.fillRect(W * .35, deckY - deckH * .82, W * .3, deckH * .64); g.fillStyle = '#2B2B2B'; g.font = `900 ${Math.round(deckH * .38)}px "Zen Maru Gothic",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tr('高さ制限 4.0m', 'MAX HEIGHT 4.0m'), W / 2, deckY - deckH * .5, W * .28); }
}
PROP_ART.overpass = (n, v) => artCanvas('poverpass|' + v + LANG, 1000, 560, (g, w, h) => paintOverpass(g, w, h, v));
function paintNobori(g, W, H, v) { // a tall banner on a pole, its top bar and a soft wave in the cloth
  const [c, txt] = String(v).split('|'), ink = c === '#FBF6EE' || c === '#F2C230' ? '#C8463C' : '#FBF6EE';
  g.fillStyle = '#9AA0A6'; g.fillRect(W * .12, 0, 5, H); g.fillRect(W * .12, H * .04, W * .78, 4);
  const x0 = W * .18, x1 = W * .9, y0 = H * .05, y1 = H * .72;
  g.fillStyle = c; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); for (let k = 0; k <= 10; k++) { const y = y0 + (y1 - y0) * k / 10; g.lineTo(x1 + Math.sin(k * .9) * 3, y); } g.lineTo(x0, y1); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.12)'; for (let k = 0; k < 4; k++) g.fillRect(x0 + (x1 - x0) * (.2 + k * .22), y0, 3, y1 - y0); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x0, y0, x1 - x0, 5);
  g.fillStyle = ink; g.font = `900 ${Math.round((x1 - x0) * .62)}px "Zen Maru Gothic","Hiragino Sans",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const ch = [...(txt || '名物')]; ch.forEach((t, i) => g.fillText(t, (x0 + x1) / 2, y0 + (y1 - y0) * (i + .5) / Math.max(3, ch.length)));
  g.fillStyle = '#5A5E63'; g.fillRect(W * .06, H - 10, W * .24, 10);
  /* 見た目 176〜178：のぼり旗。布の波のかげと光／さおのつやと先の玉／さおを通す輪（ちち） */
  { const fg = g.createLinearGradient(x0, 0, x1, 0); fg.addColorStop(0, 'rgba(0,0,0,.16)'); fg.addColorStop(.25, 'rgba(255,255,255,.16)'); fg.addColorStop(.55, 'rgba(0,0,0,.1)'); fg.addColorStop(.8, 'rgba(255,255,255,.12)'); fg.addColorStop(1, 'rgba(0,0,0,.14)'); g.fillStyle = fg; g.fillRect(x0, y0, x1 - x0, y1 - y0); }
  g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(W * .12, 0, 1.6, H); g.fillStyle = '#C9CDD2'; g.beginPath(); g.arc(W * .12 + 2.5, 3, 4, 0, Math.PI * 2); g.fill();
  g.fillStyle = shadeHex(c, .7); for (let k = 0; k < 5; k++) g.fillRect(W * .1, y0 + (y1 - y0) * (k + .5) / 5 - 3, W * .1, 6);
}
PROP_ART.nobori = (n, v) => artCanvas('pnobori|' + v, 90, 400, (g, w, h) => paintNobori(g, w, h, v));

function paintLowTable(g, W, H) { // a round chabudai seen from the room: the oval top in its grain, short legs, a mug and the folded morning paper on it
  g.fillStyle = 'rgba(40,30,20,.22)'; g.beginPath(); g.ellipse(W / 2, H * .9, W * .44, H * .08, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#5E3820'; for (const x of [.2, .8]) g.fillRect(W * x - 6, H * .46, 12, H * .44); g.fillStyle = '#4A2C18'; g.fillRect(W * .47, H * .5, 12, H * .38);
  g.fillStyle = '#6B4228'; g.beginPath(); g.ellipse(W / 2, H * .44, W * .48, H * .17, 0, 0, Math.PI * 2); g.fill(); // the edge
  const top = g.createRadialGradient(W * .4, H * .32, 10, W / 2, H * .38, W * .5); top.addColorStop(0, '#C48A58'); top.addColorStop(1, '#93603A'); g.fillStyle = top; g.beginPath(); g.ellipse(W / 2, H * .38, W * .47, H * .15, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(80,45,20,.25)'; g.lineWidth = 1.2; for (let k = 1; k < 6; k++) { g.beginPath(); g.ellipse(W / 2, H * .38, W * .47 * k / 6, H * .15 * k / 6, 0, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(W * .38, H * .33, W * .16, H * .03, -.1, 0, Math.PI * 2); g.fill();
  // the folded newspaper
  g.save(); g.translate(W * .64, H * .36); g.rotate(-.12); g.fillStyle = '#EDE9DF'; g.fillRect(-W * .13, -H * .07, W * .26, H * .12); g.fillStyle = 'rgba(0,0,0,.35)'; for (let k = 0; k < 4; k++) g.fillRect(-W * .11, -H * .05 + k * H * .025, W * .1, 2); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(W * .01, -H * .05, W * .1, H * .07); g.restore();
  // the mug (the one from the shop), with a little shine
  const mx = W * .36, my = H * .3; g.fillStyle = '#FBF6EE'; g.beginPath(); g.roundRect ? g.roundRect(mx - 14, my - 22, 28, 30, 5) : g.rect(mx - 14, my - 22, 28, 30); g.fill(); g.strokeStyle = '#FBF6EE'; g.lineWidth = 5; g.beginPath(); g.arc(mx + 16, my - 8, 7, -1.3, 1.3); g.stroke();
  g.fillStyle = '#4E77A0'; g.fillRect(mx - 14, my - 14, 28, 6); g.fillStyle = '#7A4E2E'; g.beginPath(); g.ellipse(mx, my - 21, 12, 3.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(mx + 6, my - 20, 6, 28);
}
PROP_ART.lowtable = () => artCanvas('lowtable', 300, 130, paintLowTable);
function paintPillarS(g, W, H) { // a station's square pillar: tiled, a line-colour band, a blue sign plate
  g.fillStyle = vgrad(g, 0, H, [[0, '#E6E6E0'], [1, '#C9C9C2']]); g.fillRect(W * .1, 0, W * .8, H);
  g.strokeStyle = 'rgba(0,0,0,.07)'; g.lineWidth = 1; for (let y = 10; y < H; y += 14) { g.beginPath(); g.moveTo(W * .1, y); g.lineTo(W * .9, y); g.stroke(); } for (let x = W * .1; x < W * .9; x += 14) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(W * .78, 0, W * .12, H); g.fillStyle = LC || '#80C241'; g.fillRect(W * .1, H * .72, W * .8, H * .03);
  g.fillStyle = '#2F5579'; g.fillRect(W * .16, H * .4, W * .68, H * .2); g.fillStyle = '#FBF6EE'; g.font = `900 ${Math.round(W * .2)}px "Zen Maru Gothic",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('出口', W / 2, H * .47); g.font = `900 ${Math.round(W * .12)}px sans-serif`; g.fillText('EXIT →', W / 2, H * .55);
  g.fillStyle = '#4A5058'; g.fillRect(W * .08, H - 8, W * .84, 8);
}
function paintGateS(g, W, H) { // a ticket gate seen from the side of the passage: the grey body, the card reader glowing, the flap
  g.fillStyle = vgrad(g, H * .1, H, [[0, '#6E7B88'], [1, '#46525E']]); rrect(g, W * .04, H * .12, W * .92, H * .86, 8); g.fill(); g.fillStyle = '#A9BDCC'; rrect(g, W * .04, H * .08, W * .92, H * .1, 6); g.fill();
  g.fillStyle = '#3FD18A'; rrect(g, W * .62, H * .1, W * .2, H * .06, 3); g.fill(); g.fillStyle = '#2B2B30'; g.fillRect(W * .12, H * .3, W * .3, H * .1);
  g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(W * .06, H * .2, W * .88, 3);
}
function paintKuroita(g, W, H) { // a black board fence of an old street, its top capped with tiles
  g.fillStyle = '#2E2A27'; g.fillRect(0, H * .12, W, H * .88); g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 2; for (let x = 6; x < W; x += 12) { g.beginPath(); g.moveTo(x, H * .12); g.lineTo(x, H); g.stroke(); }
  g.fillStyle = '#4A4F57'; g.fillRect(0, 0, W, H * .12); g.fillStyle = 'rgba(255,255,255,.2)'; for (let x = 0; x < W; x += 10) g.fillRect(x, 0, 2, H * .12);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, H * .12, W, 4); g.fillStyle = '#3B342E'; g.fillRect(0, H - 6, W, 6);
}
function paintBamboo(g, W, H) { // a bamboo fence (takegaki): upright canes tied with dark cord on three rails
  g.fillStyle = '#9C8A5C'; for (const y of [.2, .5, .8]) g.fillRect(0, H * y, W, 6);
  for (let x = 4; x < W; x += 9) { const gr = g.createLinearGradient(x, 0, x + 7, 0); gr.addColorStop(0, '#B8A770'); gr.addColorStop(.5, '#D9C98E'); gr.addColorStop(1, '#A08E58'); g.fillStyle = gr; g.fillRect(x, H * .06, 7, H * .94); g.fillStyle = 'rgba(80,60,30,.35)'; for (let y = H * .15; y < H; y += H * .22) g.fillRect(x, y, 7, 2); }
  g.fillStyle = '#3B2A20'; for (const y of [.2, .5, .8]) for (let x = 8; x < W; x += 36) g.fillRect(x, H * y - 2, 6, 10);
}
Object.assign(PROP_ART, { pillarS: () => artCanvas('ppillarS', 120, 420, paintPillarS) });
// fences run along the wall, so they are painted onto the face of their box (in the wall's own perspective)
const FACE_EXTRA = { kuroita: paintKuroita, bamboo: paintBamboo, gateS: paintGateS };
{ const pf0 = paintFace; paintFace = function (kind, W, H) { const f = FACE_EXTRA[kind]; return f ? artCanvas('face|' + kind, W, H, g => f(g, W, H)) : pf0(kind, W, H); }; }
function paintPlaneBack(g, W, H) { // a paper plane seen from behind: the two wings spread flat at hip height, the folded keel underneath, the crease lines
  const cx = W / 2, y = H * .42;
  const wing = (sd) => { g.beginPath(); g.moveTo(cx, y - 6); g.lineTo(cx + sd * W * .49, y - H * .22); g.lineTo(cx + sd * W * .46, y - H * .1); g.lineTo(cx + sd * W * .06, y + H * .1); g.closePath(); };
  for (const sd of [-1, 1]) { wing(sd); const gr = g.createLinearGradient(cx, 0, cx + sd * W * .5, 0); gr.addColorStop(0, '#E9EEF2'); gr.addColorStop(1, '#FFFFFF'); g.fillStyle = gr; g.fill(); g.strokeStyle = '#3B2A20'; g.lineWidth = 4; g.lineJoin = 'round'; g.stroke();
    g.strokeStyle = 'rgba(80,100,120,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + sd * W * .05, y + H * .02); g.lineTo(cx + sd * W * .44, y - H * .17); g.stroke(); }
  g.beginPath(); g.moveTo(cx - W * .07, y + H * .08); g.lineTo(cx + W * .07, y + H * .08); g.lineTo(cx, y + H * .5); g.closePath(); g.fillStyle = '#C9D4DE'; g.fill(); g.strokeStyle = '#3B2A20'; g.lineWidth = 4; g.stroke(); // the keel
  g.strokeStyle = 'rgba(80,100,120,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, y + H * .08); g.lineTo(cx, y + H * .46); g.stroke();
}
/* 乗っている紙飛行機の絵。使うたびに取り出す（2026-11-15 の報告：スマホで、紙飛行機に乗ると仲間と紙飛行機が消えた。
   絵の置き場がいっぱいになると古い絵から捨てる仕組みで、最初に作ったこの絵がまっ先に捨てられ、捨てた絵を描こうとして失敗 → その後に描く仲間まで出なかった）。
   捨てられていたら、その場で描き直す。SPR.planeBack と書いても同じ物が返る */
function planePic() { let c = ART_C.get('planeBack'); if (c && c.width) return c; if (c) ART_C.delete('planeBack'); const soft = ART_SOFT; ART_SOFT = 0; try { c = artCanvas('planeBack', 400, 160, paintPlaneBack); } finally { ART_SOFT = soft; } return c && c.width ? c : null; }
Object.defineProperty(SPR, 'planeBack', { get: planePic, enumerable: false, configurable: true });
