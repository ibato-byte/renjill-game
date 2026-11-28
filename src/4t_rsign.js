/* ================= 2026-11-28 景色 1000：町の名前が分かる道ばたの物（地下鉄の出入口・バス停の名前・住所の札）とカラス ================= docs/SCENERY-1000-2026-11-28.md
   地下鉄の会社のマークは描かない（会社のマークは商標）。駅の名前・停留所の名前・住所は場所を示すだけ */
function rxPaintSubway(g, W, H, n, v) { const o = rxV(v); rxShadowE(g, W / 2, H - 4, W * .5, 6, .18);
  const fg = g.createLinearGradient(0, H * .45, 0, H); fg.addColorStop(0, '#9AA0A6'); fg.addColorStop(1, '#6E747A'); g.fillStyle = fg; g.fillRect(W * .06, H * .5, W * .88, H * .5 - 4); /* 下へおりる階段の囲いのかべ */
  g.fillStyle = '#3B3F45'; g.fillRect(W * .12, H * .56, W * .76, H * .4); for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#5A5F66' : '#4A4F55'; g.fillRect(W * .14, H * (.6 + k * .06), W * .72, H * .03); } /* 中に見える階段 */
  g.fillStyle = 'rgba(200,220,235,.55)'; g.fillRect(W * .04, H * .28, W * .92, H * .2); g.fillStyle = '#7A828A'; g.fillRect(W * .02, H * .24, W * .96, H * .05); for (const x of [.06, .94]) g.fillRect(W * x - 2, H * .24, 4, H * .3); /* ガラスの屋根 */
  g.fillStyle = '#F7F9FA'; rrect(g, W * .1, H * .02, W * .8, H * .2, 4); g.fill(); g.fillStyle = o.c && o.c[0] === '#' ? o.c : '#2E6FAE'; g.fillRect(W * .1, H * .02, W * .12, H * .2); g.fillStyle = '#FFFFFF'; g.font = rxFont(H * .07); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('地', W * .16, H * .09); g.fillText('下', W * .16, H * .16);
  g.fillStyle = '#2B2B2B'; g.font = rxFont(H * .085); g.fillText(o.t || '駅', W * .56, H * .1, W * .6); g.font = rxFont(H * .045, 700); g.fillText(o.t2 || 'Station', W * .56, H * .18, W * .6); /* 駅の名前（日本語・英語） */
  if (n) { rxGlowC(g, W / 2, H * .12, W * .5, '255,255,240', .35); rxGlowC(g, W / 2, H * .7, W * .4, '255,240,200', .3); } }
function rxPaintBusN(g, W, H, n, v) { const o = rxV(v); g.fillStyle = rxCylG(g, W / 2 - 4, W / 2 + 4, '#7C8288', '#D5DADE', '#5E646A'); g.fillRect(W / 2 - 4, 60, 8, H - 64); rxShadowE(g, W / 2, H - 4, 22, 4); g.fillStyle = '#5A5F66'; g.beginPath(); g.ellipse(W / 2, H - 8, 26, 7, 0, 0, 7); g.fill();
  g.fillStyle = '#2E8A55'; g.beginPath(); g.arc(W / 2, 40, 34, 0, 7); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(W / 2, 40, 28, 0, 7); g.fill(); g.fillStyle = '#2E8A55'; rrect(g, W / 2 - 17, 26, 34, 24, 5); g.fill(); g.fillStyle = '#FFFFFF'; g.fillRect(W / 2 - 13, 30, 26, 8); g.fillStyle = '#2E8A55'; for (const x of [-9, 9]) { g.beginPath(); g.arc(W / 2 + x, 52, 4, 0, 7); g.fill(); } /* 丸い札のバスの絵 */
  g.fillStyle = '#FFFFFF'; g.fillRect(W / 2 - 34, 82, 68, 100); g.strokeStyle = '#2E8A55'; g.lineWidth = 3; g.strokeRect(W / 2 - 34, 82, 68, 100); g.fillStyle = '#2B2B2B'; g.textAlign = 'center'; g.textBaseline = 'middle'; const ch = [...(o.t || '停留所')].slice(0, 6), fs = Math.min(18, 84 / ch.length); g.font = rxFont(fs); ch.forEach((c, i) => g.fillText(c, W / 2, 90 + fs * (i + .5))); /* 停留所の名前（たて書き） */
  g.fillStyle = n ? '#FFF6D0' : '#F4F1EA'; g.fillRect(W / 2 - 30, 196, 60, 70); g.fillStyle = '#9AA0A6'; for (let k = 0; k < 7; k++) g.fillRect(W / 2 - 26, 202 + k * 9, 30 + (k * 13) % 20, 3); if (n) rxGlowC(g, W / 2, 230, 50, '255,245,210', .35); } /* 時刻表（夜は明かり） */
function rxPaintPoleC(g, W, H, n, v) { const o = rxV(v); PROP_ART.pole ? g.drawImage(PROP_ART.pole(n) || mk(1), 0, 0, W, H) : 0; const x = W / 2; g.fillStyle = '#1E5AA8'; rrect(g, x - 11, H * .42, 22, 44, 2); g.fill(); g.fillStyle = '#FFFFFF'; g.font = '700 7px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const t = o.t || ''; g.fillText(t.slice(0, 4), x, H * .42 + 10, 20); g.font = '700 7px sans-serif'; g.fillText(t.slice(4), x, H * .42 + 20, 20); g.font = '900 12px sans-serif'; g.fillText(o.c || '', x, H * .42 + 34); } /* 電柱の住所の青い札（町の名前と丁目・番地） */
function rxPaintCrows(g, W, H) { const r = rnd(131); for (let i = 0; i < 4; i++) { const x = W * (.12 + r() * .76), y = H * (.6 + r() * .3), s = 12 + r() * 3, sd = r() < .5 ? -1 : 1; g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(x, y + s * .6, s, 2.5, 0, 0, 7); g.fill();
  g.fillStyle = '#16161A'; g.beginPath(); g.ellipse(x, y, s, s * .5, sd * .25, 0, 7); g.fill(); g.beginPath(); g.arc(x + sd * s * .8, y - s * .5, s * .35, 0, 7); g.fill(); g.beginPath(); g.moveTo(x + sd * s * 1.05, y - s * .55); g.lineTo(x + sd * s * 1.6, y - s * .4); g.lineTo(x + sd * s * 1.05, y - s * .32); g.closePath(); g.fill(); g.beginPath(); g.moveTo(x - sd * s * .7, y - s * .1); g.lineTo(x - sd * s * 1.5, y + s * .15); g.lineTo(x - sd * s * .7, y + s * .3); g.closePath(); g.fill();
  g.fillStyle = 'rgba(120,140,200,.35)'; g.beginPath(); g.ellipse(x - sd * s * .2, y - s * .15, s * .5, s * .18, 0, 0, 7); g.fill(); g.strokeStyle = '#16161A'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 2, y + s * .4); g.lineTo(x - 3, y + s * .7); g.moveTo(x + 2, y + s * .4); g.lineTo(x + 3, y + s * .7); g.stroke(); } } /* 公園のカラス（黒い体に、光る青いつや・太いくちばし） */
Object.assign(PROP_ART, { rxSubway: (n, v) => rxArtC('rxsubway|' + v + (n ? 1 : 0), 300, 300, (g, w, h) => rxPaintSubway(g, w, h, n, v)), rxBusN: (n, v) => rxArtC('rxbusn|' + v + (n ? 1 : 0), 120, 300, (g, w, h) => rxPaintBusN(g, w, h, n, v)),
  rxPoleC: (n, v) => rxArtC('rxpolec|' + v + (n ? 1 : 0), 120, 560, (g, w, h) => rxPaintPoleC(g, w, h, n, v)), rxCrows: () => rxArtC('rxcrows', 220, 80, rxPaintCrows) });
Object.assign(PROPS, {
  subway: (sd, s, th) => { const st = th && th.subway; if (!st) return { w: 1 }; return { w: 4.4, spr: [{ lat: sd * 4.1, s: s + 2, y: 0, w: 3.4, h: 3.2, img: rxPaintKey('rxSubway', 'L|' + st[0] + '|' + (st[2] || '#2E6FAE') + '|' + st[1], 1), pn: 1, gnd: 1.3 }] }; }, /* 地下鉄の出入口（ガラスの屋根・下へおりる階段・駅の名前） */
  busN: (sd, s, th) => { const st = th && th.busName; if (!st) return { w: 1 }; return { w: 2.6, spr: [{ lat: sd * 3.1, s: s + .5, y: 0, w: 1.0, h: 2.6, img: rxPaintKey('rxBusN', 'L|' + st, 1), pn: 1, gnd: .4 }] }; }, /* 都バスの停留所：丸い札と、停留所の名前・時刻表 */
  poleC: (sd, s, th) => { const p = PROPS.pole(sd, s, th), ch = th && th.chome; if (!ch || !p.bx) return p; const lat = p.bx[0] ? (p.bx[0].l0 + p.bx[0].l1) / 2 : sd * 3; return { w: p.w, pole: 1, spr: [{ lat, s: p.bx[0].s0, y: 0, w: 1.9, h: 8.9, img: rxPaintKey('rxPoleC', 'L|' + ch[0] + '|' + pick(ch[1]), 1), pn: 1, gnd: .35 }] }; }, /* 住所の札の町の名前が、その町のもの */
  crows: rxOne('rxCrows', 3.6, 2.0, .8, 2.6),
});
/* ---- 駅のホームの床の乗車位置の印・案内の係の人・電車の窓の上の画面・降車ボタン・のぼりの言葉 ---- */
Object.assign(RX_SET, {
  platmarks(seg, sd, o) { const L = seg.len, lat = sd * (HW - 1.25); for (let s = 6; s < L - 4; s += 20 / 4) { const k = Math.round(s / 5) % 4; if (k === 0 || k === 2) { seg.lines.push({ a: [s - .35, lat, .015], b: [s + .35, lat, .015], c: '#E8C547', w: .1 }, { a: [s - .35, lat, .015], b: [s, lat + sd * .45, .015], c: '#E8C547', w: .08 }, { a: [s + .35, lat, .015], b: [s, lat + sd * .45, .015], c: '#E8C547', w: .08 }); } } }, /* 乗車位置の黄色い三角（ドアの前の印） */
  staff(seg, sd, o) { for (let k = 0; k < (o.n || 1); k++) { const pk = (Math.random() * PEOPLE.length) | 0; seg.spr.push({ lat: sd * (HW - .7), s: 3 + k * 6, y: 0, w: .8, h: 1.75, img: artKey('walker', pk + '.0.0'), gnd: .3, keep: 1 }); } }, /* エレベーターの案内の係の人（押上の電波塔のエレベーターには、係の人が乗る） */
});
Object.assign(DECO_SIZE, { rxWinLCD: [3.2, 1.95, 2.3], rxStopBtn: [.6, 1.3, 1.7] });
Object.assign(DECO_DRAW, {
  /* [T7] 山手線（新しい車両）の窓の上の液晶の画面（紙の広告のかわりに、横長の画面が 3 つならぶ） */
  rxWinLCD(e) { for (let k = 0; k < 3; k++) { const u = .02 + k * .33; bquad(u, 0, u + .3, 1, tint('#1E2228')); bquad(u + .01, .08, u + .29, .92, tint(['#2E5F8E', '#3E7A4E', '#8A4A6E'][((e.v2 || 0) + k) % 3])); bquad(u + .03, .3, u + .2, .45, tint('#FBF6EE')); bquad(u + .03, .55, u + .25, .7, tint('#F2C230')); } },
  /* [T8] 路面電車の降車ボタン（「とまります」） */
  rxStopBtn(e) { bquad(.1, 0, .9, 1, tint('#E9EDF0')); { const c = bil(.5, .55), r2 = Math.max(2.5, Math.abs(bil(.78, .55)[0] - c[0])); ctx.fillStyle = tint('#F2C230'); ctx.beginPath(); ctx.arc(c[0], c[1], r2, 0, 7); ctx.fill(); ctx.fillStyle = tint('#8A5AB8'); ctx.beginPath(); ctx.arc(c[0], c[1], r2 * .55, 0, 7); ctx.fill(); } qtext(tr('とまります', 'STOP'), .12, .08, .88, .28, '#C8362A'); },
});
{ const nw = noboriWords; noboriWords = function (th) { const j = (th && th.ja) || '';
  if (/アメ横/.test(j)) return ['鮮魚', '乾物', '大売出し', '本日'];
  if (/道具/.test(j)) return ['包丁', '食器', '道具', '本日'];
  if (/高円寺/.test(j)) return ['古着', '阿波おどり', '本日', '営業中'];
  if (/蔵前/.test(j)) return ['手しごと', '珈琲', '工房', '本日'];
  if (/御徒町/.test(j)) return ['宝石', '時計', '買取', '本日'];
  if (/新大久保/.test(j)) return ['韓国料理', 'チキン', '本日', '営業中'];
  if (/山王/.test(j)) return ['奉納', '山王', '日枝', '奉納'];
  if (/芝・大きな寺/.test(j)) return ['奉納', '増上寺', '奉納', '御祈願'];
  if (/神田/.test(j)) return ['甘酒', '名物', '奉納', '神田祭'];
  return nw(th); }; } /* 神田明神の門前は、浅草の人形焼ではなく、甘酒と神田祭のぼり */
