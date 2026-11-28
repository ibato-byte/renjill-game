/* ================= 2026-11-28 景色 1000：町ごとの本物の道具（街灯・信号の交差点名・交番・神社の道具など） =================
   前は、どの町の街灯も同じ黒い柱の丸い灯り（lampC）だった。調べた本物の形で描き分ける：銀座のガス灯の形の街灯、商店街のスズラン灯、公園の緑の柱の灯り、
   日本橋の青銅の灯り、オフィス街の細い LED 灯、和風の木の灯り など。docs/SCENERY-1000-2026-11-28.md */
function rxShadowE(g, x, y, rx, ry, a) { g.fillStyle = `rgba(0,0,0,${a == null ? .25 : a})`; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); }
function rxCylG(g, x0, x1, c0, c1, c2) { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, c0); gr.addColorStop(.38, c1); gr.addColorStop(1, c2); return gr; }
function rxGlowC(g, x, y, R, col, a) { const gl = g.createRadialGradient(x, y, 1, x, y, R); gl.addColorStop(0, `rgba(${col},${a == null ? .9 : a})`); gl.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gl; g.fillRect(x - R, y - R, R * 2, R * 2); }
function rxFont(px, w) { return `${w || 900} ${Math.round(px)}px ${FAC_FONT}`; }
/* 街灯に付けるたての旗（フラッグ）。v の 2 つめ・3 つめ：町の名前と色 */
function rxFlag(g, x, y, w, h, txt, col, sd) { if (!txt) return; g.fillStyle = '#5A5F66'; g.fillRect(x - 1, y - 3, sd * (w + 6), 3); g.fillRect(x - 1, y + h, sd * (w + 6), 3);
  const fx = sd > 0 ? x + 3 : x - 3 - w, gr = g.createLinearGradient(fx, 0, fx + w, 0); gr.addColorStop(0, shadeHex(col, .82)); gr.addColorStop(.5, col); gr.addColorStop(1, shadeHex(col, .78)); g.fillStyle = gr; g.fillRect(fx, y, w, h);
  g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(fx + 3, y + 4, w - 6, 2); g.fillRect(fx + 3, y + h - 6, w - 6, 2); g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const ch = [...txt].slice(0, 4), fs = Math.min(w * .7, (h - 16) / ch.length); g.font = rxFont(fs); ch.forEach((c, i) => g.fillText(c, fx + w / 2, y + 10 + fs * (i + .5), w - 4)); }
const rxV = v => { const a = String(v || '').split('|'); return { sd: a[0] === 'L' ? -1 : 1, t: a[1] || '', c: a[2] || '#C8463C', t2: a[3] || '' }; };
const RX_LAMP = {
  /* [L1] 銀座通り：ガス灯の形をとり入れた街灯（国の資料：銀座通りの街路灯は、ガス灯のデザインを取り入れたもの）。黒い柱・みぞのある台・4 枚ガラスの灯具・とがった帽子 */
  ginza(g, W, H, n, o) { const x = W / 2; rxShadowE(g, x + 4, H - 4, 22, 5);
    g.fillStyle = rxCylG(g, x - 14, x + 14, '#1E2124', '#4A4F55', '#141618'); rrect(g, x - 14, H - 70, 28, 66, 4); g.fill(); for (let k = -2; k <= 2; k++) { g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + k * 5 - .5, H - 64, 1.5, 54); } /* みぞのある台 */
    g.fillStyle = rxCylG(g, x - 6, x + 6, '#1A1C1F', '#50565C', '#121315'); g.fillRect(x - 5, 110, 10, H - 180); g.fillStyle = '#2A2D31'; for (const y of [H - 80, 300, 170]) { rrect(g, x - 9, y, 18, 10, 3); g.fill(); } /* 細い柱と節 */
    g.strokeStyle = '#25282C'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 130); g.quadraticCurveTo(x + 14, 112, x + 4, 96); g.moveTo(x, 130); g.quadraticCurveTo(x - 14, 112, x - 4, 96); g.stroke(); /* 灯具をささえる飾りのうで */
    const ly = 40, lw = 34; g.fillStyle = '#1C1E21'; g.beginPath(); g.moveTo(x - lw / 2 - 6, ly); g.lineTo(x, ly - 26); g.lineTo(x + lw / 2 + 6, ly); g.closePath(); g.fill(); g.fillRect(x - 2, ly - 36, 4, 12);
    const gr = g.createLinearGradient(0, ly, 0, ly + 56); gr.addColorStop(0, n ? '#FFF6D8' : '#E9EEF0'); gr.addColorStop(1, n ? '#FFD58A' : '#BCC6CC'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - lw / 2, ly); g.lineTo(x + lw / 2, ly); g.lineTo(x + lw / 2 - 6, ly + 56); g.lineTo(x - lw / 2 + 6, ly + 56); g.closePath(); g.fill();
    g.strokeStyle = '#1C1E21'; g.lineWidth = 2.5; g.stroke(); g.beginPath(); g.moveTo(x, ly); g.lineTo(x, ly + 56); g.stroke(); g.fillStyle = '#1C1E21'; g.fillRect(x - lw / 2 + 4, ly + 56, lw - 8, 8);
    if (!n) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x - lw / 2 + 4, ly + 4, 4, 44); }
    if (n) rxGlowC(g, x, ly + 28, 46, '255,214,140', .55);
    rxFlag(g, x + o.sd * 6, 190, 30, 100, o.t, o.c, o.sd); },
  /* [L2] 丸の内：細い黒の柱に、丸いすりガラスの灯り（落ち着いた石とガラスの町に合う、細身の古典的な形） */
  maru(g, W, H, n, o) { const x = W / 2; rxShadowE(g, x + 3, H - 4, 18, 4);
    g.fillStyle = rxCylG(g, x - 11, x + 11, '#202326', '#585E64', '#16181A'); g.beginPath(); g.moveTo(x - 12, H - 4); g.lineTo(x - 7, H - 60); g.lineTo(x + 7, H - 60); g.lineTo(x + 12, H - 4); g.closePath(); g.fill();
    g.fillStyle = rxCylG(g, x - 5, x + 5, '#1C1E21', '#5C636A', '#141618'); g.fillRect(x - 4, 80, 8, H - 140); g.fillStyle = '#2B2F33'; rrect(g, x - 8, 72, 16, 12, 3); g.fill();
    const gr = g.createRadialGradient(x - 6, 44, 2, x, 50, 26); gr.addColorStop(0, n ? '#FFFBEA' : '#FFFFFF'); gr.addColorStop(1, n ? '#FFE1A0' : '#C9D0D4'); g.fillStyle = gr; g.beginPath(); g.arc(x, 50, 24, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = '#1C1E21'; g.beginPath(); g.ellipse(x, 27, 15, 4, 0, 0, 7); g.fill(); g.fillRect(x - 2, 18, 4, 9);
    if (n) rxGlowC(g, x, 50, 50, '255,226,160', .5);
    rxFlag(g, x + o.sd * 5, 160, 28, 92, o.t, o.c, o.sd); },
  /* [L3] 公園の灯り：緑にぬった柱に、きのこの形のかさ（東京の都立公園でよく見る形） */
  park(g, W, H, n, o) { const x = W / 2; rxShadowE(g, x + 3, H - 4, 16, 4);
    g.fillStyle = rxCylG(g, x - 9, x + 9, '#22412E', '#4E7A58', '#1A3022'); rrect(g, x - 9, H - 34, 18, 30, 3); g.fill(); g.fillStyle = rxCylG(g, x - 4, x + 4, '#22412E', '#5A8A64', '#1A3022'); g.fillRect(x - 4, 90, 8, H - 120);
    const gl = g.createLinearGradient(0, 56, 0, 92); gl.addColorStop(0, n ? '#FFF3C8' : '#EEF2EE'); gl.addColorStop(1, n ? '#FFD27A' : '#BFC9C2'); g.fillStyle = gl; rrect(g, x - 13, 58, 26, 34, 6); g.fill();
    g.fillStyle = rxCylG(g, x - 30, x + 30, '#1F3A28', '#4E7A58', '#18301F'); g.beginPath(); g.moveTo(x - 32, 62); g.quadraticCurveTo(x, 18, x + 32, 62); g.closePath(); g.fill(); g.fillStyle = '#2A4A34'; g.fillRect(x - 2, 20, 4, 10);
    if (n) rxGlowC(g, x, 76, 44, '255,220,150', .55); },
  /* [L4] 商店街のスズラン灯：柱の上で 4 本のうでが弧をえがき、つりがねの形の灯りが下を向く（昭和から下町の商店街に多い） */
  suzuran(g, W, H, n, o) { const x = W / 2; rxShadowE(g, x + 3, H - 4, 18, 4);
    g.fillStyle = rxCylG(g, x - 5, x + 5, '#7A8086', '#D9DEE2', '#5A6066'); g.fillRect(x - 4, 70, 8, H - 74); g.fillStyle = '#9AA0A6'; g.fillRect(x - 9, H - 22, 18, 18);
    g.strokeStyle = '#8A9096'; g.lineWidth = 3.5; for (const k of [-1, 1]) for (const f of [.55, 1]) { g.beginPath(); g.moveTo(x, 96); g.quadraticCurveTo(x + k * 40 * f, 40, x + k * 46 * f, 74); g.stroke(); }
    for (const k of [-1, 1]) for (const f of [.55, 1]) { const bx = x + k * 46 * f, by = 74; const gr = g.createLinearGradient(0, by, 0, by + 22); gr.addColorStop(0, n ? '#FFF7DC' : '#FFFFFF'); gr.addColorStop(1, n ? '#FFD98C' : '#D6DCE0'); g.fillStyle = gr;
      g.beginPath(); g.moveTo(bx - 4, by); g.quadraticCurveTo(bx - 12, by + 6, bx - 11, by + 20); g.quadraticCurveTo(bx, by + 24, bx + 11, by + 20); g.quadraticCurveTo(bx + 12, by + 6, bx + 4, by); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1; g.stroke(); if (n) rxGlowC(g, bx, by + 16, 26, '255,222,150', .5); }
    g.fillStyle = '#8A9096'; g.beginPath(); g.arc(x, 66, 6, 0, 7); g.fill();
    rxFlag(g, x + o.sd * 5, 150, 30, 98, o.t, o.c, o.sd); },
  /* [L5] 日本橋の青銅の灯り：緑青（ろくしょう）の色の太い柱と、4 つの丸い灯り（明治の石の橋の灯りの形にならう） */
  kirin(g, W, H, n, o) { const x = W / 2; rxShadowE(g, x + 4, H - 4, 26, 5);
    g.fillStyle = rxCylG(g, x - 18, x + 18, '#3A5A4E', '#7FA898', '#2C463C'); g.beginPath(); g.moveTo(x - 20, H - 4); g.lineTo(x - 13, H - 90); g.lineTo(x + 13, H - 90); g.lineTo(x + 20, H - 4); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.15)'; for (let y = H - 80; y < H - 10; y += 14) g.fillRect(x - 15, y, 30, 2);
    g.fillStyle = rxCylG(g, x - 7, x + 7, '#34544A', '#86AE9E', '#28423A'); g.fillRect(x - 6, 120, 12, H - 210);
    g.strokeStyle = '#3E6056'; g.lineWidth = 4; g.beginPath(); for (const k of [-1, 1]) { g.moveTo(x, 130); g.quadraticCurveTo(x + k * 30, 128, x + k * 36, 104); } g.stroke();
    for (const [bx, by] of [[x - 36, 94], [x + 36, 94], [x - 14, 70], [x + 14, 70], [x, 46]]) { const gr = g.createRadialGradient(bx - 3, by - 3, 1, bx, by, 13); gr.addColorStop(0, n ? '#FFFBEA' : '#FFFFFF'); gr.addColorStop(1, n ? '#FFDA8E' : '#CED6D3'); g.fillStyle = gr; g.beginPath(); g.arc(bx, by, 12, 0, 7); g.fill(); g.fillStyle = '#34544A'; g.fillRect(bx - 5, by + 10, 10, 5); if (n) rxGlowC(g, bx, by, 30, '255,226,160', .45); } },
  /* [L6] オフィス街の LED 灯：銀色の細い柱が少し前へ曲がり、平たい灯具（大手町・汐留・西新宿などの新しい街の灯り） */
  led(g, W, H, n, o) { const x = W / 2 - o.sd * 16; rxShadowE(g, x + 3, H - 4, 14, 4);
    g.fillStyle = rxCylG(g, x - 5, x + 5, '#8C9399', '#E9EDF0', '#6C7379'); g.fillRect(x - 4, 60, 8, H - 64); g.strokeStyle = '#B9C0C6'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, 64); g.quadraticCurveTo(x, 30, x + o.sd * 34, 30); g.stroke();
    g.fillStyle = '#C9CFD4'; rrect(g, x + o.sd * 26 - 18, 24, 36, 10, 4); g.fill(); g.fillStyle = n ? '#FFFFFF' : '#DDE6EC'; g.fillRect(x + o.sd * 26 - 15, 33, 30, 3); if (n) rxGlowC(g, x + o.sd * 26, 38, 40, '235,245,255', .55);
    rxFlag(g, x + o.sd * 5, 150, 26, 90, o.t, o.c, o.sd); },
  /* [L7] 和風の街灯：こげ茶の木の柱に、障子の四角い灯り（神楽坂・柴又・門前町など石だたみの町） */
  wa(g, W, H, n, o) { const x = W / 2; rxShadowE(g, x + 3, H - 4, 16, 4);
    g.fillStyle = '#7A7468'; g.fillRect(x - 12, H - 20, 24, 16); g.fillStyle = rxCylG(g, x - 6, x + 6, '#3B2A20', '#7A5A44', '#2A1E17'); g.fillRect(x - 6, 120, 12, H - 140);
    g.fillStyle = '#2E2219'; g.beginPath(); g.moveTo(x - 30, 52); g.lineTo(x, 30); g.lineTo(x + 30, 52); g.closePath(); g.fill(); g.fillRect(x - 24, 112, 48, 8);
    g.fillStyle = n ? '#FFE8B8' : '#F4EEDC'; g.fillRect(x - 20, 54, 40, 58); g.strokeStyle = '#3B2A20'; g.lineWidth = 2; g.strokeRect(x - 20, 54, 40, 58); g.beginPath(); for (const y of [68, 82, 96]) { g.moveTo(x - 20, y); g.lineTo(x + 20, y); } g.moveTo(x, 54); g.lineTo(x, 112); g.stroke(); /* 障子の組子 */
    if (n) rxGlowC(g, x, 84, 48, '255,206,130', .5);
    rxFlag(g, x + o.sd * 7, 160, 28, 90, o.t, o.c, o.sd); },
  /* [L8] 川べりのテラスの灯り：白い柱に、上に帽子をかぶった四角い灯具（隅田川テラス） */
  terrace(g, W, H, n, o) { const x = W / 2; rxShadowE(g, x + 3, H - 4, 14, 4);
    g.fillStyle = rxCylG(g, x - 5, x + 5, '#A9B0B6', '#FFFFFF', '#8C9399'); g.fillRect(x - 4, 80, 8, H - 84); g.fillStyle = '#E9EDF0'; rrect(g, x - 9, H - 30, 18, 26, 3); g.fill();
    g.fillStyle = n ? '#FFF2CC' : '#EAF0F3'; rrect(g, x - 14, 40, 28, 40, 4); g.fill(); g.strokeStyle = '#B9C0C6'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#3E5E7A'; g.beginPath(); g.moveTo(x - 20, 42); g.lineTo(x, 26); g.lineTo(x + 20, 42); g.closePath(); g.fill();
    if (n) rxGlowC(g, x, 60, 42, '255,230,170', .55); },
};
function rxLampArt(kind) { return (n, v) => artCanvas('rxl|' + kind + '|' + v + '|' + (n ? 1 : 0), 120, 560, (g, w, h) => RX_LAMP[kind](g, w, h, n, rxV(v))); }
for (const k in RX_LAMP) PROP_ART['rxl_' + k] = rxLampArt(k);
/* 街灯の道具：PROPS の 'lampG' など。th.flag が [町の名前, 色] なら、たての旗を付ける */
function rxPaintKey(type, v, night) { const key = 'pa|' + type + '|' + v; if (!SPR[key] && !SPR_PEND[key]) { SPR_PEND[key] = () => PROP_ART[type](false, v); if (night) SPR_PEND[key + 'N'] = () => PROP_ART[type](true, v); } return key; }
function rxLampProp(kind, h) { return (sd, s, th) => { const fl = th && th.flag, v = (sd < 0 ? 'R' : 'L') + '|' + (fl && Math.random() < .7 ? fl[0] + '|' + fl[1] : ''), lat = sd * 3.15;
  return { w: 4, spr: [{ lat, s, y: 0, w: h * 120 / 560, h, img: rxPaintKey('rxl_' + kind, v, 1), pn: 1, gnd: .3 }, { lat, s: s + .2, y: h * .82, h: 2.6, w: 2.6, img: 'glow', glow: 1, night: 1 }] }; }; }
Object.assign(PROPS, { lampG: rxLampProp('ginza', 5.4), lampM: rxLampProp('maru', 5.0), lampP: rxLampProp('park', 3.8), lampSz: rxLampProp('suzuran', 4.6), lampK: rxLampProp('kirin', 4.8), lampL: rxLampProp('led', 6.0), lampW: rxLampProp('wa', 3.6), lampT: rxLampProp('terrace', 3.6) });

/* ---------- [F1] 交差点の名前の板つき信号：本物の東京の交差点は、信号のうでに青い板で交差点の名前（日本語とローマ字）が付く ---------- */
function rxPaintSignal(g, W, H, n, v) { const o = rxV(v), sd = o.sd, x = sd > 0 ? 26 : W - 26; rxShadowE(g, x + 4, H - 4, 18, 4);
  g.fillStyle = rxCylG(g, x - 7, x + 7, '#7C8288', '#D5DADE', '#5E646A'); g.fillRect(x - 6, 40, 12, H - 44); g.fillStyle = '#8A9096'; g.fillRect(x - 10, H - 18, 20, 14);
  const ax = x + sd * (W - 60); g.fillStyle = '#9AA0A6'; g.fillRect(Math.min(x, ax), 48, Math.abs(ax - x), 7); g.strokeStyle = '#9AA0A6'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 110); g.lineTo(x + sd * 60, 55); g.stroke(); /* うでと、ななめの支え */
  const hx = ax - sd * 90, hw = 96; g.fillStyle = '#3C4652'; rrect(g, Math.min(hx, hx + sd * hw), 20, hw, 36, 6); g.fill(); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(Math.min(hx, hx + sd * hw), 20, hw, 4);
  const cols = ['#3FD3A0', '#F2B230', '#F0503A']; for (let k = 0; k < 3; k++) { const cx = hx + sd * (16 + k * 32), on = k === 0; g.fillStyle = '#20262C'; g.beginPath(); g.arc(cx, 38, 13, 0, 7); g.fill(); g.fillStyle = on ? cols[k] : shadeHex(cols[k], .35); g.beginPath(); g.arc(cx, 38, 10, 0, 7); g.fill(); if (on) rxGlowC(g, cx, 38, 22, '120,255,200', n ? .7 : .35); g.fillStyle = '#3C4652'; g.fillRect(cx - 14, 22, 28, 5); } /* 横にならぶ 3 つの灯り（青・黄・赤）と、灯りの上のひさし */
  if (o.t) { const px = Math.min(x + sd * 8, x + sd * 8 + sd * 150), pw = 150; g.fillStyle = '#1E4E9A'; rrect(g, px, 62, pw, 44, 4); g.fill(); g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.strokeRect(px + 3, 65, pw - 6, 38);
    g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = rxFont(18); g.fillText(o.t, px + pw / 2, 78, pw - 14); g.font = rxFont(10, 700); g.fillText(o.c || '', px + pw / 2, 96, pw - 14); } /* 交差点の名前の青い板（白いふち・上が日本語・下がローマ字） */
  g.fillStyle = '#3C4652'; rrect(g, x + sd * 8 - (sd < 0 ? 26 : 0), 150, 26, 52, 4); g.fill(); g.fillStyle = '#5CE0A8'; g.beginPath(); g.arc(x + sd * 8 + (sd < 0 ? -13 : 13), 186, 6, 0, 7); g.fill(); g.fillStyle = '#4A2420'; g.beginPath(); g.arc(x + sd * 8 + (sd < 0 ? -13 : 13), 164, 6, 0, 7); g.fill(); /* 歩行者の信号 */
  g.fillStyle = '#F2C230'; g.fillRect(x - 6, H - 130, 12, 20); g.fillStyle = '#2B2B2B'; for (let k = 0; k < 3; k++) g.fillRect(x - 6, H - 128 + k * 7, 12, 3); }
PROP_ART.rxSig = (n, v) => artCanvas('rxsig|' + v + '|' + (n ? 1 : 0), 360, 560, (g, w, h) => rxPaintSignal(g, w, h, n, v));
PROPS.sigN = (sd, s, th) => { const pl = th && th.plate ? pick(th.plate) : null, v = (sd < 0 ? 'R' : 'L') + '|' + (pl ? pl[0] + '|' + pl[1] : ''); return { w: 5, spr: [{ lat: sd * 2.3, s, y: 0, w: 3.6, h: 5.6, img: rxPaintKey('rxSig', v, 1), pn: 1, gnd: .3 }] }; };

/* ---------- [F2] 交番：小さな建物・赤い丸い灯り・「交番 KOBAN」の札・ガラスの戸・とめた自転車（東京のどの繁華街の駅前にもある） ---------- */
function rxPaintKoban(g, W, H, n, v) { const o = rxV(v), base = o.c && o.c[0] === '#' ? o.c : '#B9B2A5'; rxShadowE(g, W / 2, H - 6, W * .48, 10, .3);
  const gr = g.createLinearGradient(0, 60, 0, H); gr.addColorStop(0, shadeHex(base, 1.08)); gr.addColorStop(1, shadeHex(base, .82)); g.fillStyle = gr; rrect(g, 20, 70, W - 40, H - 76, 6); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1; for (let y = 80; y < H - 8; y += 12) { g.beginPath(); g.moveTo(22, y); g.lineTo(W - 22, y); g.stroke(); } /* タイルの目地 */
  g.fillStyle = '#5A5F66'; g.beginPath(); g.moveTo(8, 72); g.lineTo(W - 8, 72); g.lineTo(W - 18, 52); g.lineTo(18, 52); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(18, 52, W - 36, 3); /* 屋根のひさし */
  const dx = W * .3, dw = W * .4; g.fillStyle = n ? '#FFF1C8' : '#9FB8C8'; g.fillRect(dx, 110, dw, H - 116); g.strokeStyle = '#3B4048'; g.lineWidth = 4; g.strokeRect(dx, 110, dw, H - 116); g.beginPath(); g.moveTo(dx + dw / 2, 110); g.lineTo(dx + dw / 2, H - 6); g.stroke(); if (!n) { g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(dx + 6, 116, 6, H - 130); } /* ガラスの戸 */
  g.fillStyle = '#FFFFFF'; rrect(g, W * .24, 80, W * .52, 24, 3); g.fill(); g.fillStyle = '#1E3E7A'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = rxFont(13); g.fillText('交番', W * .41, 92); g.font = rxFont(9, 700); g.fillText('KOBAN', W * .63, 92); /* 札 */
  g.fillStyle = n ? '#FF3A2E' : '#C8362A'; g.beginPath(); g.arc(W / 2, 40, 11, 0, 7); g.fill(); g.fillStyle = '#5A5F66'; g.fillRect(W / 2 - 3, 46, 6, 8); if (n) rxGlowC(g, W / 2, 40, 40, '255,70,50', .7); else { g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(W / 2 - 4, 36, 3, 0, 7); g.fill(); } /* 赤い丸い灯り */
  g.fillStyle = '#E8E8E8'; g.fillRect(W - 70, H - 46, 54, 4); g.strokeStyle = '#2B2B2B'; g.lineWidth = 3; for (const cx of [W - 62, W - 24]) { g.beginPath(); g.arc(cx, H - 18, 13, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(W - 62, H - 18); g.lineTo(W - 44, H - 40); g.lineTo(W - 24, H - 18); g.stroke(); /* 白い自転車 */
  g.fillStyle = n ? '#FFF6DA' : '#C9D6DE'; g.fillRect(28, 118, W * .18, 40); g.strokeStyle = '#3B4048'; g.lineWidth = 3; g.strokeRect(28, 118, W * .18, 40); }
PROP_ART.rxKoban = (n, v) => artCanvas('rxkoban|' + v + '|' + (n ? 1 : 0), 300, 280, (g, w, h) => rxPaintKoban(g, w, h, n, v));
PROPS.koban = (sd, s, th) => ({ w: 4, spr: [{ lat: sd * 4.2, s: s + 1.4, y: 0, w: 3.2, h: 3.0, img: rxPaintKey('rxKoban', (sd < 0 ? 'R' : 'L') + '||' + ((th && th.kobanC) || ''), 1), pn: 1, gnd: 1.2 }] });

/* ---------- [F3] 緑の公衆電話のボックス（ガラスの箱・緑のわく・中の電話。夜は中が光る） ---------- */
function rxPaintPhone(g, W, H, n) { rxShadowE(g, W / 2, H - 4, W * .45, 6);
  g.fillStyle = n ? 'rgba(255,248,220,.85)' : 'rgba(190,215,225,.55)'; g.fillRect(12, 28, W - 24, H - 34); g.strokeStyle = '#2E8A55'; g.lineWidth = 7; g.strokeRect(12, 28, W - 24, H - 34); g.beginPath(); g.moveTo(W / 2, 28); g.lineTo(W / 2, H - 6); g.stroke();
  g.fillStyle = '#2E8A55'; rrect(g, 6, 8, W - 12, 24, 4); g.fill(); g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = rxFont(13); g.fillText('公衆電話', W / 2, 20, W - 20);
  g.fillStyle = '#7D868E'; rrect(g, W * .58, H * .38, W * .26, H * .2, 3); g.fill(); g.fillStyle = '#C8CDD2'; g.fillRect(W * .62, H * .42, W * .1, 4); if (!n) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(18, 34, 5, H - 50); } }
PROP_ART.rxPhone = (n) => artCanvas('rxphone|' + (n ? 1 : 0), 110, 300, (g, w, h) => rxPaintPhone(g, w, h, n));
PROPS.phoneBox = (sd, s) => ({ w: 1.6, spr: [{ lat: sd * 3.9, s: s + .4, y: 0, w: .9, h: 2.4, img: rxPaintKey('rxPhone', '', 1), pn: 1, gnd: .5 }] });

/* ---------- [F4] キッチンカー（丸の内仲通りの昼休み・公園の広場）：白い車・横の窓が開き、ひさしと黒板のメニュー ---------- */
function rxPaintKCar(g, W, H, n, v) { const c = ['#F2C230', '#C8463C', '#3A7DB8', '#2E8A55', '#E86A75'][(+v || 0) % 5]; rxShadowE(g, W / 2, H - 8, W * .48, 10, .3);
  const gr = g.createLinearGradient(0, 40, 0, H - 30); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, '#D6DADE'); g.fillStyle = gr; rrect(g, 14, 40, W - 28, H - 70, 18); g.fill();
  g.fillStyle = c; g.fillRect(14, H - 58, W - 28, 14); g.fillStyle = '#2B2F33'; rrect(g, W - 80, 56, 56, 40, 8); g.fill(); g.fillStyle = 'rgba(160,200,220,.8)'; rrect(g, W - 76, 60, 48, 32, 6); g.fill(); /* 色の帯・運転席の窓 */
  g.fillStyle = n ? '#FFE9B0' : '#F7F1E4'; g.fillRect(36, 64, W * .48, 50); g.fillStyle = '#8A6A4A'; g.fillRect(36, 108, W * .48, 8); for (let k = 0; k < 4; k++) { g.fillStyle = ['#E86A75', '#F2C230', '#7FD06A', '#FBF6EE'][k]; g.beginPath(); g.arc(50 + k * 22, 104, 6, 0, 7); g.fill(); } /* 開いた窓と、カウンターの上の品 */
  g.fillStyle = c; g.beginPath(); g.moveTo(30, 62); g.lineTo(36 + W * .48 + 6, 62); g.lineTo(36 + W * .48 + 16, 40); g.lineTo(20, 40); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 6; k++) g.fillRect(24 + k * 26, 42, 12, 18); /* しまのひさし */
  for (const cx of [60, W - 60]) { g.fillStyle = '#1E1E22'; g.beginPath(); g.arc(cx, H - 26, 18, 0, 7); g.fill(); g.fillStyle = '#9AA0A6'; g.beginPath(); g.arc(cx, H - 26, 7, 0, 7); g.fill(); }
  g.fillStyle = '#2E2A27'; g.fillRect(W * .5 - 70, H - 80, 44, 56); g.fillStyle = '#FBF6EE'; g.font = rxFont(9, 700); g.textAlign = 'center'; for (let k = 0; k < 3; k++) g.fillRect(W * .5 - 64, H - 70 + k * 12, 32, 2); }
PROP_ART.rxKCar = (n, v) => artCanvas('rxkcar|' + v + '|' + (n ? 1 : 0), 300, 200, (g, w, h) => rxPaintKCar(g, w, h, n, v));
PROPS.kcar = (sd, s) => ({ w: 6, spr: [{ lat: sd * 4.3, s: s + 2, y: 0, w: 4.6, h: 3.0, img: rxPaintKey('rxKCar', String((Math.random() * 5) | 0), 1), pn: 1, gnd: 1.6 }] });

/* ---------- [F5] 通りのテラス席：丸いテーブルと 2 つのいす、生成り色のパラソル（丸の内仲通りのアーバンテラス・九品仏川緑道） ---------- */
function rxPaintTSet(g, W, H) { rxShadowE(g, W / 2, H - 6, W * .44, 9);
  g.fillStyle = '#5A5F66'; g.fillRect(W / 2 - 3, 40, 6, H - 46); const pg = g.createLinearGradient(0, 8, 0, 60); pg.addColorStop(0, '#FBF6EA'); pg.addColorStop(1, '#D9CFBC'); g.fillStyle = pg; g.beginPath(); g.moveTo(10, 56); g.quadraticCurveTo(W / 2, -6, W - 10, 56); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1; for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(W / 2, 12); g.lineTo(10 + (W - 20) * k / 6, 56); g.stroke(); }
  g.fillStyle = '#E9E4DA'; g.beginPath(); g.ellipse(W / 2, H - 60, 44, 9, 0, 0, 7); g.fill(); g.fillStyle = '#3B3F45'; g.fillRect(W / 2 - 3, H - 58, 6, 50);
  for (const k of [-1, 1]) { const cx = W / 2 + k * 70; g.fillStyle = '#3B3F45'; g.fillRect(cx - 18, H - 50, 36, 5); g.fillRect(cx - 18, H - 50, 3, 44); g.fillRect(cx + 15, H - 50, 3, 44); g.fillRect(cx + k * 15 - 1.5, H - 90, 3, 40); g.fillRect(cx + k * 15 - (k > 0 ? 18 : 0), H - 90, 18, 4); } }
PROP_ART.rxTSet = () => artCanvas('rxtset', 220, 220, rxPaintTSet);
PROPS.tset = (sd, s) => ({ w: 3, spr: [{ lat: sd * 4.0, s: s + 1, y: 0, w: 2.4, h: 2.4, img: rxPaintKey('rxTSet', ''), gnd: 1 }] });

/* ---------- [F6] 野外の彫刻（丸の内仲通り・六本木・西新宿・日比谷など、通りに置かれた芸術作品）：石の台の上の、なめらかなブロンズ・白い石の形 ---------- */
function rxPaintSculpt(g, W, H, n, v) { const k = (+v || 0) % 3; rxShadowE(g, W / 2, H - 4, W * .4, 7);
  const sg = g.createLinearGradient(0, H - 50, 0, H); sg.addColorStop(0, '#C9C4BA'); sg.addColorStop(1, '#8F8A80'); g.fillStyle = sg; g.fillRect(W * .2, H - 50, W * .6, 46); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(W * .2, H - 50, W * .6, 4);
  if (k === 0) { const bg = g.createLinearGradient(W * .3, 0, W * .7, 0); bg.addColorStop(0, '#3E2E22'); bg.addColorStop(.4, '#A8805A'); bg.addColorStop(1, '#2E2219'); g.fillStyle = bg; g.beginPath(); g.moveTo(W * .36, H - 50); g.bezierCurveTo(W * .2, H * .5, W * .55, H * .35, W * .45, H * .1); g.bezierCurveTo(W * .72, H * .2, W * .7, H * .55, W * .62, H - 50); g.closePath(); g.fill(); } /* ブロンズの、人の形を思わせるなめらかな形 */
  else if (k === 1) { g.strokeStyle = '#E9E6DE'; g.lineWidth = 22; g.beginPath(); g.ellipse(W / 2, H * .45, W * .26, H * .3, .3, 0, 7); g.stroke(); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 6; g.beginPath(); g.ellipse(W / 2 + 4, H * .47, W * .26, H * .3, .3, .3, 2.6); g.stroke(); } /* 白い石の輪 */
  else { for (let j = 0; j < 4; j++) { const c = ['#C8463C', '#2E6FAE', '#F2C230', '#2B2B2B'][j]; g.fillStyle = c; g.beginPath(); g.ellipse(W * (.36 + j * .09), H * (.62 - j * .13), W * .12, H * .06, -.3 + j * .2, 0, 7); g.fill(); } g.fillStyle = '#2B2B2B'; g.fillRect(W / 2 - 3, H * .2, 6, H * .6); } /* 色の玉が積み上がる形 */ }
PROP_ART.rxSculpt = (n, v) => artCanvas('rxsculpt|' + v, 160, 260, (g, w, h) => rxPaintSculpt(g, w, h, n, v));
PROPS.sculpt = (sd, s) => ({ w: 3.4, spr: [{ lat: sd * 4.1, s: s + 1.2, y: 0, w: 1.6, h: 2.6, img: rxPaintKey('rxSculpt', String((Math.random() * 3) | 0)), gnd: .8 }] });

/* ---------- [F7] 通りの名前の標識（青い板・白い字。日本語と英語。「中央通り Chuo-dori」など、東京の大通りの角に立つ） ---------- */
function rxPaintSName(g, W, H, n, v) { const o = rxV(v); g.fillStyle = rxCylG(g, W / 2 - 4, W / 2 + 4, '#7C8288', '#D5DADE', '#5E646A'); g.fillRect(W / 2 - 4, 40, 8, H - 44); rxShadowE(g, W / 2, H - 4, 14, 3);
  g.fillStyle = '#1E4E9A'; rrect(g, 6, 14, W - 12, 64, 5); g.fill(); g.strokeStyle = '#FFFFFF'; g.lineWidth = 2.5; g.strokeRect(10, 18, W - 20, 56); g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = rxFont(22); g.fillText(o.t, W / 2, 38, W - 30); g.font = rxFont(12, 700); g.fillText(o.c, W / 2, 62, W - 30); }
PROP_ART.rxSName = (n, v) => artCanvas('rxsname|' + v, 200, 300, (g, w, h) => rxPaintSName(g, w, h, n, v));
PROPS.sname = (sd, s, th) => { const st = th && th.sname; if (!st) return { w: 1 }; return { w: 2.4, spr: [{ lat: sd * 3.3, s: s + .3, y: 0, w: 1.4, h: 2.9, img: rxPaintKey('rxSName', 'L|' + st[0] + '|' + st[1]), gnd: .3 }] }; };

/* ---------- [F8] 公園・庭園の入口の名前の石（みかげ石に、ほった名前）：日比谷公園・新宿御苑など ---------- */
function rxPaintPSign(g, W, H, n, v) { const o = rxV(v); rxShadowE(g, W / 2, H - 4, W * .46, 7);
  const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, '#6E6A62'); gr.addColorStop(.3, '#A8A39A'); gr.addColorStop(1, '#5E5A53'); g.fillStyle = gr; g.beginPath(); g.moveTo(8, H - 4); g.lineTo(14, 18); g.quadraticCurveTo(W / 2, 4, W - 14, 14); g.lineTo(W - 8, H - 4); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.08)'; for (let k = 0; k < 40; k++) g.fillRect(10 + Math.random() * (W - 20), 20 + Math.random() * (H - 30), 2, 2);
  g.fillStyle = '#2E2A26'; g.textAlign = 'center'; g.textBaseline = 'middle'; const ch = [...o.t]; const fs = Math.min(28, (W - 30) / Math.max(1, ch.length)); g.font = `700 ${fs}px "Yu Mincho","Hiragino Mincho ProN","Noto Serif JP",serif`; g.fillText(o.t, W / 2, H * .45, W - 24);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.font = `700 ${fs}px "Yu Mincho","Hiragino Mincho ProN","Noto Serif JP",serif`; g.fillText(o.t, W / 2 + 1, H * .45 + 1, W - 24); }
PROP_ART.rxPSign = (n, v) => artCanvas('rxpsign|' + v, 260, 110, (g, w, h) => rxPaintPSign(g, w, h, n, v));
PROPS.psign = (sd, s, th) => { const t = th && th.psign; if (!t) return { w: 1 }; return { w: 3.4, spr: [{ lat: sd * 4.0, s: s + 1.2, y: 0, w: 2.6, h: 1.1, img: rxPaintKey('rxPSign', 'L|' + t), gnd: 1 }] }; };
