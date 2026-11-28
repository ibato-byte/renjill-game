/* ================= 2026-11-28 景色 1000：家・会社・駅・地下街の、本物にある物（かべの絵） =================
   前は、家の台所に流し台と冷蔵庫だけ、会社の部屋にはどこも同じ机と棚だけだった。日本の家・会社・駅で本当に見かける物をかべに描く。docs/SCENERY-1000-2026-11-28.md */
Object.assign(DECO_SIZE, { rxRange: [2.0, 0, 2.5], rxRice: [1.8, 0, 2.2], rxWasher: [1.3, 0, 2.1], rxVanity: [1.4, 0, 2.3], rxDoorG: [1.3, 0, 2.25], rxAC: [1.1, 2.02, 2.36], rxOshiire: [1.9, 0, 2.3], rxRanma: [1.8, 2.32, 2.78],
  rxInOut: [1.7, .95, 2.15], rxFloorGuide: [1.4, 1.0, 2.3], rxTicketM: [1.2, 0, 1.85], rxTrayRet: [2.2, .7, 1.75], rxMobShelf: [2.6, 0, 2.45], rxCoffee: [1.5, .9, 1.9], rxPod: [2.0, 0, 2.45], rxLocker: [2.2, 0, 2.0],
  rxDepBoard: [2.6, 2.05, 2.75], rxShopG: [3.2, 0, 2.7], rxExitY: [2.2, 2.15, 2.65], rxFreeSp: [1.6, .3, 2.05], rxScroll: [1.0, .9, 2.3], rxCalli: [1.6, 1.2, 2.1] });
Object.assign(DECO_DRAW, {
  /* [H1] 台所のガスこんろとレンジフード：下の収納・3 口のこんろ・タイルのかべ・銀のフード */
  rxRange(e) { bquad(0, 0, 1, .36, tint('#D9C2A0')); for (const u of [.02, .51]) bquad(u, .04, u + .47, .33, tint('#E3D0B0')); bquad(.46, .18, .48, .22, tint('#8A7A60')); bquad(.53, .18, .55, .22, tint('#8A7A60'));
    bquad(0, .36, 1, .4, tint('#2B2B2E')); for (const u of [.18, .5, .82]) bquad(u - .1, .37, u + .1, .395, tint('#555559'));
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) bquad(i / 6 + .004, .4 + j * .055 + .003, (i + 1) / 6 - .004, .4 + (j + 1) * .055 - .003, tint(j % 2 === i % 2 ? '#F4F1EA' : '#EAE6DD'));
    bquad(.1, .62, .9, .7, tint('#BFC7CE')); bquad(.18, .7, .82, .9, tint('#D5DBE0')); bquad(.2, .62, .8, .635, tint('#2B2F33')); bquad(.12, .9, .88, 1, tint('#E9E4DA')); },
  /* [H2] 台所のカウンター：炊飯器・電気ケトル・電子レンジ・水切りかご */
  rxRice(e) { bquad(0, 0, 1, .4, tint('#E3D0B0')); bquad(0, .4, 1, .43, tint('#BFC7CE')); bquad(.06, .43, .3, .55, tint('#F4F4F2')); bquad(.08, .55, .28, .58, tint('#E6E6E4')); bquad(.14, .48, .2, .51, tint('#3A7DB8'));
    bquad(.36, .43, .46, .56, tint('#F4F4F2')); bquad(.44, .5, .47, .54, tint('#BFC7CE')); bquad(.55, .43, .95, .62, tint('#2F3236')); bquad(.58, .46, .82, .59, tint('#3E4A55')); bquad(.85, .48, .92, .56, tint('#7FD06A'));
    bquad(.04, .7, .96, 1, tint('#F2EADB')); for (let k = 0; k < 6; k++) bquad(.08 + k * .15, .74, .19 + k * .15, .96, tint('#E6DBC6')); },
  /* [H3] 洗濯機と防水パン・上の棚と洗剤 */
  rxWasher(e) { bquad(.05, 0, .95, .05, tint('#E9EDF0')); bquad(.1, .05, .9, .52, tint('#F7F9FA')); bquad(.12, .5, .88, .54, tint('#C9D0D6')); bquad(.55, .42, .85, .48, tint('#3E5266')); bquad(.6, .44, .64, .46, tint('#7FD06A'));
    bquad(.2, .12, .8, .42, 'rgba(160,180,195,.35)'); bquad(0, .78, 1, .81, tint('#E9E4DA')); bquad(.1, .81, .25, .95, tint('#4E9AD8')); bquad(.3, .81, .42, .92, tint('#F7F9FA')); bquad(.46, .81, .6, .97, tint('#F2C230')); bquad(.7, .81, .9, .9, tint('#E86A75')); },
  /* [H4] 洗面台：白い台と、3 面の鏡の戸だな・上の明かり */
  rxVanity(e) { bquad(.05, 0, .95, .38, tint('#F4F1EA')); bquad(.48, .05, .52, .36, tint('#D9D4C8')); bquad(0, .38, 1, .44, tint('#FFFFFF')); bquad(.3, .4, .7, .43, tint('#D5DEE6')); bquad(.48, .44, .52, .52, tint('#BFC7CE'));
    for (const [a, b] of [[.05, .35], [.35, .65], [.65, .95]]) { bquad(a, .55, b, .88, tint('#BFD2DE')); bquad(a + .02, .57, b - .02, .86, tint('#D9E6EE')); bquad(a + .05, .6, a + .08, .82, 'rgba(255,255,255,.6)'); }
    bquad(.05, .88, .95, .95, tint('#F7F9FA')); bquad(.1, .89, .9, .935, tint('#FFF6DA')); },
  /* [H5] 玄関のドア：こげ茶の戸・細長いすりガラス・レバーの取っ手・のぞき穴・横のインターホン */
  rxDoorG(e) { bquad(.08, 0, .82, .98, tint('#4A3428')); bquad(.12, .02, .78, .96, tint('#5E4434')); bquad(.38, .25, .52, .85, tint('#E9E4DA')); for (let k = 0; k < 6; k++) bquad(.38, .25 + k * .1, .52, .26 + k * .1, tint('#D9D2C6'));
    bquad(.66, .46, .76, .48, tint('#C9CDD2')); bquad(.66, .43, .69, .5, tint('#9AA0A6')); { const c = bil(.45, .88); ctx.fillStyle = tint('#C9CDD2'); ctx.beginPath(); ctx.arc(c[0], c[1], 1.5, 0, 7); ctx.fill(); }
    bquad(.87, .55, .97, .68, tint('#E9EDF0')); bquad(.89, .6, .95, .66, tint('#2F3236')); bquad(.9, .57, .94, .58, tint('#C9CDD2')); bquad(.03, .97, .87, 1, tint('#2B2420')); },
  /* [H6] かべかけのエアコン（日本の家のどの部屋にもある）：白い本体・下の風の出口・小さなランプ */
  rxAC(e) { bquad(0, .1, 1, 1, tint('#F7F9FA')); bquad(0, .82, 1, 1, tint('#FFFFFF')); bquad(.04, .1, .96, .26, tint('#E3E8EC')); bquad(.06, .14, .94, .18, tint('#C9D0D6')); bquad(.85, .5, .9, .58, tint('#7FD06A')); bquad(0, 0, 1, .1, 'rgba(0,0,0,.08)'); },
  /* [H7] 押し入れ：上と下のふすま、まん中の中段の線（ふとんをしまう所） */
  rxOshiire(e) { bquad(0, 0, 1, 1, tint('#6B4631')); for (const [v0, v1] of [[.02, .44], [.5, .98]]) for (const [u0, u1] of [[.03, .5], [.5, .97]]) { bquad(u0, v0, u1, v1, tint('#EFE6D2')); bquad(u0 + .02, v0 + .02, u1 - .02, v1 - .02, tint('#F4ECDA')); bquad(u0 + .03, v0 + .04, u1 - .03, v0 + .1, 'rgba(150,120,80,.12)'); }
    bquad(.03, .44, .97, .5, tint('#8A6A48')); for (const u of [.12, .88]) { const c = bil(u, .72); ctx.fillStyle = tint('#3B2A20'); ctx.beginPath(); ctx.arc(c[0], c[1], 2, 0, 7); ctx.fill(); const d = bil(u, .25); ctx.beginPath(); ctx.arc(d[0], d[1], 2, 0, 7); ctx.fill(); } },
  /* [H8] 欄間：ふすまの上の、すかしぼりの板（雲と松の形） */
  rxRanma(e) { bquad(0, 0, 1, 1, tint('#8A6444')); bquad(.03, .12, .97, .88, tint('#F2E8D4')); ctx.fillStyle = tint('#6B4631'); for (let k = 0; k < 7; k++) { const c = bil(.08 + k * .14, .5); ctx.beginPath(); ctx.ellipse(c[0], c[1], 6, 3, 0, 0, 7); ctx.fill(); } bquad(.4, .3, .6, .7, tint('#6B4631')); },
  /* [O1] 会社の在席ボード（行動予定表）：名前の札と、在席・外出のマグネット、行き先の手書き */
  rxInOut(e) { bquad(0, 0, 1, 1, tint('#9AA9B6')); bquad(.02, .04, .98, .96, tint('#FFFFFF')); bquad(.02, .86, .98, .96, tint('#2E5F8E')); qtext(tr('行動予定', 'Who’s in'), .1, .87, .9, .95, '#FFFFFF');
    for (let k = 0; k < 7; k++) { const v = .78 - k * .105; bquad(.05, v, .3, v + .08, tint('#F4F1EA')); bquad(.33, v + .01, .38, v + .07, tint(['#E8402E', '#2E8A55', '#2E8A55', '#F2C230', '#2E8A55', '#E8402E', '#2E8A55'][k])); ctx.strokeStyle = tint('#2E5F8E'); ctx.lineWidth = 1; ctx.beginPath(); bline(.45, v + .04, .45 + (k * 37 % 40) / 100, v + .045); ctx.stroke(); } },
  /* [O2] フロアの案内板（エレベーターの横）：階ごとの部署の名前 */
  rxFloorGuide(e) { bquad(0, 0, 1, 1, tint('#3B4048')); bquad(.04, .03, .96, .97, tint('#F4F1EA')); bquad(.04, .86, .96, .97, tint('#3B4048')); qtext('FLOOR GUIDE', .1, .88, .9, .95, '#FFFFFF');
    for (let k = 0; k < 7; k++) { const v = .76 - k * .1; bquad(.08, v, .22, v + .07, tint('#2E5F8E')); qtext(String(12 - k) + 'F', .08, v, .22, v + .07, '#FFFFFF'); bquad(.27, v + .025, .85 - (k % 3) * .12, v + .045, tint('#6E7680')); } },
  /* [O3] 社員食堂の食券機：ボタンの並び・お金を入れる所・おつりの口 */
  rxTicketM(e) { bquad(.05, 0, .95, 1, tint('#2F3B47')); bquad(.08, .45, .92, .95, tint('#E9EDF0')); for (let i = 0; i < 3; i++) for (let j = 0; j < 6; j++) bquad(.12 + i * .27, .5 + j * .072, .35 + i * .27, .56 + j * .072, tint(['#F2C230', '#E86A75', '#7FD06A', '#9ED0F0'][(i + j) % 4]));
    bquad(.2, .25, .45, .38, tint('#1E2228')); bquad(.55, .25, .8, .32, tint('#1E2228')); bquad(.3, .08, .7, .16, tint('#1E2228')); bquad(.1, .96, .9, 1, tint('#C8463C')); },
  /* [O4] 食堂のトレー返却口：ステンレスの台と、たてにならぶトレーのたな */
  rxTrayRet(e) { bquad(0, 0, 1, 1, tint('#C9D0D6')); bquad(.03, .05, .97, .35, tint('#E3E8EC')); bquad(.05, .4, .95, .95, tint('#5A6470')); for (let k = 0; k < 8; k++) bquad(.08 + k * .11, .45, .16 + k * .11, .9, tint(k % 2 ? '#E8C99A' : '#D9B888')); qtext(tr('返却口', 'Trays'), .3, .12, .7, .3, '#3B4048'); },
  /* [O5] 資料室の移動棚：ハンドルで動かす、背の高い棚の横の面 */
  rxMobShelf(e) { for (let k = 0; k < 4; k++) { const u0 = k * .25 + .01, u1 = u0 + .23; bquad(u0, 0, u1, 1, tint('#E3E5E2')); bquad(u0 + .01, .02, u1 - .01, .98, tint('#EEF0ED')); bquad(u0 + .03, .82, u1 - .03, .9, tint('#2E5F8E'));
      { const c = bil((u0 + u1) / 2, .5), rr = Math.max(3, Math.abs(bil(u0 + .06, .5)[0] - c[0])); ctx.strokeStyle = tint('#7A828A'); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(c[0], c[1], rr, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(c[0] - rr, c[1]); ctx.lineTo(c[0] + rr, c[1]); ctx.moveTo(c[0], c[1] - rr); ctx.lineTo(c[0], c[1] + rr); ctx.stroke(); } bquad(u0, 0, u1, .03, tint('#8A9096')); } },
  /* [O6] 給湯室のコーヒーメーカーと湯わかし器 */
  rxCoffee(e) { bquad(0, 0, 1, .1, tint('#C9D0D6')); bquad(.05, .1, .4, .85, tint('#2B2B2E')); bquad(.1, .55, .35, .78, tint('#3E4A55')); bquad(.16, .12, .3, .3, tint('#F7F9FA')); bquad(.5, .1, .75, .7, tint('#F4F4F2')); bquad(.55, .55, .7, .65, tint('#E8402E')); bquad(.8, .1, .95, .45, tint('#E9EDF0')); for (let k = 0; k < 3; k++) bquad(.82, .5 + k * .1, .93, .57 + k * .1, tint('#FBF6EE')); },
  /* [O7] 電話・オンライン会議用の小さな個室（フリーアドレスの部屋にある、ガラスの戸の箱） */
  rxPod(e) { bquad(0, 0, 1, 1, tint('#3B4A5A')); bquad(.06, .04, .94, .9, tint('#A9C2D2')); bquad(.08, .06, .92, .88, 'rgba(220,235,245,.7)'); bquad(.3, .25, .7, .5, tint('#5A6470')); bquad(.35, .5, .65, .56, tint('#E9E4DA')); bquad(.06, .9, .94, .98, tint('#2B3540')); bquad(.8, .45, .84, .55, tint('#C9D0D6')); bquad(.1, .93, .25, .96, tint('#7FD06A')); },
  /* [O8] 社員のロッカー：番号の札・鍵 */
  rxLocker(e) { for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { const u0 = i / 6 + .005, v0 = j / 3 + .005; bquad(u0, v0, u0 + 1 / 6 - .01, v0 + 1 / 3 - .01, tint('#D9DDE2')); bquad(u0 + .03, v0 + .22, u0 + .1, v0 + .27, tint('#F7F9FA')); bquad(u0 + .12, v0 + .12, u0 + .14, v0 + .18, tint('#8A9096')); for (let k = 0; k < 3; k++) bquad(u0 + .03, v0 + .04 + k * .03, u0 + .13, v0 + .05 + k * .03, tint('#BFC5CB')); } },
  /* [S1] 駅の発車標：黒い板に、オレンジと緑の字で「時刻・行き先・番線」 */
  rxDepBoard(e) { bquad(-.02, -.05, 1.02, 1.05, tint('#2F3236')); bquad(0, 0, 1, 1, '#0C0D10'); for (let k = 0; k < 2; k++) { const v = .55 - k * .45; bquad(.03, v, .16, v + .35, '#3FD06A'); bquad(.19, v, .38, v + .35, '#FFB030'); bquad(.42, v, .8, v + .35, '#FFB030'); bquad(.84, v, .97, v + .35, '#FFFFFF'); ctx.globalAlpha = .55; bquad(.03, v + .16, .97, v + .18, '#0C0D10'); ctx.globalAlpha = 1; } },
  /* [S2] 地下街の店のガラスの正面：明るい店の中・品物・上の名前の板 */
  rxShopG(e) { const c = ['#C8463C', '#2E5F8E', '#2E8A55', '#8A5530', '#3B2A20', '#B07A3A'][(e.v2 || 0) % 6]; bquad(0, 0, 1, 1, tint('#2B2F33')); bquad(.02, .02, .98, .8, tint('#FFF6E4')); bquad(.02, .02, .98, .3, tint('#F4E6CE'));
    for (let k = 0; k < 6; k++) bquad(.06 + k * .155, .32, .16 + k * .155, .52 + (k % 3) * .05, tint(['#E86A75', '#F2C230', '#7FD06A', '#9ED0F0', '#FBF6EE', '#D9A86A'][(k + (e.v2 || 0)) % 6])); bquad(.02, .82, .98, 1, tint(c)); qtext(['和菓子', 'カフェ', '弁当', '土産', '書店', 'パン'][(e.v2 || 0) % 6], .2, .84, .8, .98, '#FFFFFF');
    ctx.globalAlpha = .35; bquad(.05, .1, .1, .75, '#FFFFFF'); ctx.globalAlpha = 1; },
  /* [S3] 地下街の黄色い出口の案内（「出口」・番号・矢印） */
  rxExitY(e) { bquad(0, 0, 1, 1, tint('#F2C230')); bquad(.02, .06, .98, .94, tint('#FFD23A')); bquad(.04, .14, .24, .86, tint('#2B2B2B')); qtext(tr('出口', 'Exit'), .04, .2, .24, .8, '#FFD23A'); qtext(['八重洲中央口', '日本橋口', '丸の内地下中央口', '八重洲北口'][(e.v2 || 0) % 4], .28, .2, .82, .8, '#2B2B2B'); bquad(.86, .4, .95, .6, tint('#2B2B2B')); },
  /* [S4] 電車の車いす・ベビーカーのスペース（大きな絵の札と、手すり） */
  rxFreeSp(e) { bquad(0, 0, 1, 1, tint('#E9ECEF')); bquad(.15, .55, .85, .95, tint('#2E6FAE')); { const c = bil(.5, .78); ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(c[0], c[1], Math.max(3, Math.abs(bil(.62, .78)[0] - c[0])), 0, 7); ctx.fill(); } bquad(.1, .35, .9, .38, tint('#C9CDD2')); bquad(.1, .05, .9, .1, tint('#C9CDD2')); },
  /* [W1] 床の間のかけじく：表装の布・白い紙に山水の墨絵 */
  rxScroll(e) { bquad(.15, 0, .85, 1, tint('#5E6E5A')); bquad(.22, .1, .78, .88, tint('#F4EEDC')); ctx.strokeStyle = tint('#4A4A48'); ctx.lineWidth = 1.2; ctx.beginPath(); bline(.28, .4, .45, .7); bline(.45, .7, .6, .45); bline(.55, .5, .72, .62); ctx.stroke(); bquad(.12, .97, .88, 1, tint('#3B2A20')); bquad(.12, 0, .88, .03, tint('#3B2A20')); },
  /* [W2] 役員室の書の額（太い墨の字） */
  rxCalli(e) { bquad(0, 0, 1, 1, tint('#3B2A20')); bquad(.05, .08, .95, .92, tint('#F7F2E6')); qtext(['和', '誠', '進', '道'][(e.v2 || 0) % 4], .15, .15, .85, .85, '#1E1E1E'); bquad(.82, .15, .88, .24, tint('#C8362A')); },
});
