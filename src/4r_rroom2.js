/* ================= 2026-11-28 景色 1000：家・会社・駅・電車の、本物にある物（続き） ================= docs/SCENERY-1000-2026-11-28.md */
Object.assign(DECO_SIZE, { rxShokasen: [1.0, .3, 1.75], rxAED: [.8, .9, 1.75], rxKamidana: [1.4, 2.0, 2.6], rxVcon: [2.4, .9, 2.3], rxSink: [1.8, 0, 2.0], rxShred: [1.0, 0, 1.0], rxPaperShelf: [1.6, 0, 1.9], rxSample: [2.2, .2, 1.7],
  rxFileBox: [2.6, 0, 2.3], rxTrophy: [2.0, .8, 2.2], rxCoinLocker: [2.4, 0, 2.0], rxGuideMap: [1.8, .9, 2.2], rxIntercom: [1.0, 1.2, 1.7], rxBreaker: [1.0, 1.75, 2.3], rxTowel: [1.0, .9, 1.6], rxBathDoor: [1.0, 0, 2.0], rxWindowK: [1.4, 1.2, 2.1],
  rxPlatNum: [1.6, 2.1, 2.8], rxEmergStop: [1.0, 1.1, 1.6], rxWaitRoom: [3.2, 0, 2.5], rxLineBand: [3.0, 1.4, 2.3], rxWinAd: [3.2, 1.95, 2.3], rxSticker: [1.2, 1.3, 1.85], rxEmerg: [1.0, .9, 1.7], rxFareBox: [1.0, 0, 1.2], rxLuggage: [2.0, 0, 1.9], rxMiniShrine: [2.2, 0, 2.6], rxRetroPoster: [1.3, 1.0, 2.3] });
Object.assign(DECO_DRAW, {
  /* [O9] 屋内消火栓：赤い箱・「消火栓」の白い字・上の赤いランプ（日本のビル・駅・地下街の廊下にかならずある） */
  rxShokasen(e) { bquad(.1, 0, .9, .8, tint('#C8362A')); bquad(.14, .04, .86, .76, tint('#D8443A')); qtext('消火栓', .2, .3, .8, .5, '#FFFFFF'); bquad(.4, .82, .6, .98, '#FF4A3A'); ctx.globalAlpha = .3; bquad(.3, .78, .7, 1.0, '#FF8A7A'); ctx.globalAlpha = 1; },
  /* [O10] AED の箱：白い箱にハートと電気のしるし */
  rxAED(e) { bquad(.08, 0, .92, 1, tint('#E9EDF0')); bquad(.12, .62, .88, .94, tint('#E8402E')); qtext('AED', .2, .66, .8, .9, '#FFFFFF'); { const c = bil(.5, .36), r2 = Math.max(3, Math.abs(bil(.68, .36)[0] - c[0])); ctx.fillStyle = tint('#2E8A55'); ctx.beginPath(); ctx.arc(c[0], c[1], r2, 0, 7); ctx.fill(); } },
  /* [O11] 神棚：かべの高い所の白木の棚・小さなお宮・しめ縄（日本の会社の部屋・店によくある） */
  rxKamidana(e) { bquad(0, 0, 1, .12, tint('#E3D2B0')); bquad(.3, .12, .7, .62, tint('#EFE2C6')); bquad(.26, .62, .74, .74, tint('#C9B48A')); bquad(.44, .2, .56, .45, tint('#8A6A48')); bquad(.1, .12, .22, .3, tint('#4C8A3A')); bquad(.78, .12, .9, .3, tint('#4C8A3A')); bquad(.05, .78, .95, .86, tint('#E8D8A8')); for (const u of [.25, .5, .75]) bquad(u - .02, .66, u + .02, .78, '#FFFFFF'); },
  /* [O12] オンライン会議の大きな画面：上にカメラの棒、画面にならぶ人の顔の枠 */
  rxVcon(e) { bquad(0, 0, 1, 1, tint('#1E2228')); bquad(.03, .05, .97, .9, tint('#2B3A4C')); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { bquad(.06 + i * .31, .1 + j * .4, .33 + i * .31, .46 + j * .4, tint(['#3E5266', '#46525E', '#3A4A5A'][(i + j) % 3])); const c = bil(.195 + i * .31, .3 + j * .4); ctx.fillStyle = tint('#E8C9A8'); ctx.beginPath(); ctx.arc(c[0], c[1], Math.max(2, Math.abs(bil(.24 + i * .31, .3)[0] - c[0])), 0, 7); ctx.fill(); } bquad(.35, .92, .65, .99, tint('#3B4048')); bquad(.48, .94, .52, .97, '#7FD06A'); },
  /* [O13] 給湯室の流し：ステンレスの流し・水切りかご・スポンジ・上の棚 */
  rxSink(e) { bquad(0, 0, 1, .45, tint('#E9EDF0')); bquad(.02, .45, .98, .5, tint('#BFC7CE')); bquad(.1, .47, .5, .49, tint('#8A949E')); bquad(.55, .5, .95, .66, tint('#E3E8EC')); for (let k = 0; k < 4; k++) bquad(.58 + k * .09, .52, .64 + k * .09, .64, tint(['#FBF6EE', '#9ED0F0', '#FBF6EE', '#F2C230'][k])); bquad(.28, .5, .32, .64, tint('#9AA0A6')); bquad(.12, .5, .2, .54, tint('#F2C230')); bquad(0, .78, 1, .84, tint('#E3E5E2')); for (let k = 0; k < 5; k++) bquad(.08 + k * .18, .84, .2 + k * .18, .96, tint('#F7F9FA')); },
  /* [O14] シュレッダー（「機密書類」の札） */
  rxShred(e) { bquad(.1, 0, .9, .85, tint('#5A6470')); bquad(.12, .62, .88, .82, tint('#3E4A55')); bquad(.2, .72, .8, .75, tint('#1E2228')); bquad(.2, .3, .8, .5, tint('#F4F1EA')); qtext('機密', .25, .32, .75, .48, '#C8362A'); bquad(.72, .9, .82, .96, '#7FD06A'); },
  /* [O15] コピー用紙の箱を積んだ棚 */
  rxPaperShelf(e) { bquad(0, 0, 1, 1, tint('#C9CDD2')); for (let r = 0; r < 4; r++) { bquad(.02, r * .25 + .02, .98, r * .25 + .04, tint('#8A9096')); for (let k = 0; k < 3; k++) bquad(.05 + k * .31, r * .25 + .05, .32 + k * .31, r * .25 + .22, tint(r === 3 ? '#E9E4DA' : '#F4F1EA')); } },
  /* [O16] 社員食堂の食品サンプルのショーケース（本物の料理に見える見本がならぶ） */
  rxSample(e) { bquad(0, 0, 1, 1, tint('#8A6A48')); bquad(.03, .08, .97, .92, tint('#FFF6E4')); for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { const u = .06 + k * .23, v = .15 + r * .4; bquad(u, v, u + .18, v + .04, tint('#FFFFFF')); bquad(u + .02, v + .04, u + .16, v + .16, tint(['#E8A040', '#C8463C', '#F2C230', '#7FA650', '#D9A86A', '#F7F2E6', '#B5302A', '#E8C99A'][r * 4 + k])); bquad(u + .03, v + .24, u + .15, v + .3, tint('#FBF6EE')); } ctx.globalAlpha = .3; bquad(.05, .1, .1, .88, '#FFFFFF'); ctx.globalAlpha = 1; },
  /* [O17] 資料室の保存箱の棚（年度と部署の手書きの札） */
  rxFileBox(e) { bquad(0, 0, 1, 1, tint('#B9BEC4')); for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++) { const u = .02 + k * .195, v = .03 + r * .245; bquad(u, v, u + .18, v + .21, tint('#E8DCC4')); bquad(u + .03, v + .08, u + .15, v + .15, tint('#FFFFFF')); bquad(u + .05, v + .1, u + .13, v + .11, tint('#2B2B2B')); bquad(u + .06, v + .025, u + .12, v + .055, tint('#8A7A60')); } },
  /* [O18] 役員室の表彰状とトロフィーの棚 */
  rxTrophy(e) { bquad(0, 0, 1, .45, tint('#6B4631')); bquad(.03, .03, .97, .42, tint('#8A6444')); for (let k = 0; k < 4; k++) { const u = .08 + k * .23; bquad(u + .04, .05, u + .12, .1, tint('#5A3A26')); bquad(u + .06, .1, u + .1, .25, tint('#E8C547')); bquad(u + .02, .25, u + .14, .35, tint('#F2D25A')); } for (let k = 0; k < 3; k++) { const u = .05 + k * .32; bquad(u, .55, u + .27, .95, tint('#C9A24A')); bquad(u + .02, .58, u + .25, .92, tint('#FBF6EE')); bquad(u + .06, .82, u + .21, .86, tint('#2B2B2B')); bquad(u + .19, .62, u + .23, .68, tint('#C8362A')); } },
  /* [O19] コインロッカー（地下街・駅） */
  rxCoinLocker(e) { for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { const u = i / 6 + .004, v = j / 4 + .004, big = j === 0; bquad(u, v, u + 1 / 6 - .008, v + 1 / 4 - .008, tint(big ? '#4E77A0' : '#6E94BC')); bquad(u + .03, v + .16, u + .07, v + .2, tint('#E9EDF0')); bquad(u + .1, v + .05, u + .12, v + .12, tint(j === 2 && i === 3 ? '#E8402E' : '#2B2F33')); } },
  /* [O20] 地下街の案内図（現在地の赤い点・出口の番号） */
  rxGuideMap(e) { bquad(0, 0, 1, 1, tint('#3B4048')); bquad(.04, .05, .96, .82, tint('#F4F1EA')); bquad(.04, .84, .96, .96, tint('#2E5F8E')); qtext(tr('地下街のご案内', 'Underground mall map'), .08, .85, .92, .95, '#FFFFFF'); for (let k = 0; k < 6; k++) bquad(.08 + k * .145, .15, .2 + k * .145, .7, tint(['#F2C230', '#9ED0F0', '#F4B8C8', '#B8E0A8', '#F2C230', '#E9D9BF'][k])); bquad(.04, .4, .96, .46, tint('#FFFFFF')); { const c = bil(.45, .43); ctx.fillStyle = '#E8402E'; ctx.beginPath(); ctx.arc(c[0], c[1], 3, 0, 7); ctx.fill(); } },
  /* [H9] 家のインターホンの親機（画面つき） */
  rxIntercom(e) { bquad(.25, 0, .75, 1, tint('#F4F4F2')); bquad(.3, .5, .7, .9, tint('#2B3540')); bquad(.32, .52, .68, .88, tint('#3E5266')); for (let k = 0; k < 3; k++) bquad(.32 + k * .13, .15, .42 + k * .13, .28, tint('#D9DEE2')); bquad(.44, .34, .56, .42, tint('#7FD06A')); },
  /* [H10] 分電盤（ろうかの高い所の、白いふたの箱） */
  rxBreaker(e) { bquad(.1, 0, .9, 1, tint('#EEF0ED')); bquad(.14, .06, .86, .94, tint('#F7F9FA')); bquad(.2, .55, .8, .58, tint('#C9CDD2')); bquad(.8, .4, .84, .6, tint('#9AA0A6')); },
  /* [H11] タオルかけとタオル（洗面所） */
  rxTowel(e) { bquad(.05, .86, .95, .9, tint('#C9CDD2')); bquad(.12, .2, .48, .88, tint('#F4C6D2')); bquad(.12, .3, .48, .34, tint('#FFFFFF')); bquad(.52, .3, .88, .88, tint('#9ED0F0')); bquad(.52, .4, .88, .44, tint('#FFFFFF')); },
  /* [H12] おふろの折れ戸（すりガラス） */
  rxBathDoor(e) { bquad(0, 0, 1, 1, tint('#D9DDE2')); for (const [a, b] of [[.05, .5], [.5, .95]]) { bquad(a, .05, b, .95, tint('#E9EEF2')); bquad(a + .04, .1, b - .04, .9, tint('#DDE8EE')); } bquad(.48, .05, .52, .95, tint('#B9C0C6')); bquad(.08, .45, .12, .55, tint('#9AA0A6')); },
  /* [H13] 台所の小窓（すりガラス・格子） */
  rxWindowK(e) { bquad(0, 0, 1, 1, tint('#E9E2D4')); bquad(.06, .08, .94, .92, tint('#D9E6EE')); for (let k = 1; k < 4; k++) bquad(.06 + k * .22 - .01, .08, .06 + k * .22 + .01, .92, tint('#B9C0C6')); bquad(.06, .48, .94, .52, tint('#B9C0C6')); },
  /* [S5] ホームののりば番号の札（大きな数字と線の色） */
  rxPlatNum(e) { bquad(0, 0, 1, 1, tint('#2B2F33')); bquad(.04, .06, .96, .94, tint('#F7F9FA')); bquad(.06, .1, .34, .9, tint(LC)); qtext(String(((e.v2 || 0) % 4) + 1), .08, .12, .32, .88, '#FFFFFF'); qtext(tr('番線', 'Track'), .38, .2, .92, .8, '#2B2B2B'); },
  /* [S6] ホームの非常停止ボタン（赤いボタンと黄色の札） */
  rxEmergStop(e) { bquad(.15, 0, .85, 1, tint('#F2C230')); bquad(.2, .05, .8, .95, tint('#FFD84A')); { const c = bil(.5, .55), r2 = Math.max(3, Math.abs(bil(.68, .55)[0] - c[0])); ctx.fillStyle = tint('#E8402E'); ctx.beginPath(); ctx.arc(c[0], c[1], r2, 0, 7); ctx.fill(); } qtext(tr('非常停止', 'STOP'), .2, .1, .8, .28, '#2B2B2B'); },
  /* [S7] ホームのガラスの待合室（中のベンチ・暖房） */
  rxWaitRoom(e) { bquad(0, 0, 1, 1, tint('#8A949E')); bquad(.02, .04, .98, .92, 'rgba(200,225,240,.55)'); for (let k = 1; k < 4; k++) bquad(k * .25 - .005, .04, k * .25 + .005, .92, tint('#8A949E')); bquad(.06, .22, .94, .28, tint('#B08155')); bquad(.06, .12, .94, .22, tint('#9A7048')); bquad(.3, .92, .7, 1, tint('#2E5F8E')); qtext(tr('待合室', 'Waiting room'), .32, .93, .68, .99, '#FFFFFF'); },
  /* [S8] 地下鉄の駅のかべの、線の色の帯と駅名 */
  rxLineBand(e) { bquad(0, .35, 1, .65, tint(LC)); bquad(0, .3, 1, .35, tint('#FFFFFF')); bquad(0, .65, 1, .7, tint('#FFFFFF')); qtext((e.seg && e.seg.stName) || '', .2, .38, .8, .62, '#FFFFFF'); },
  /* [T1] 電車の窓の上の広告のわく */
  rxWinAd(e) { for (let k = 0; k < 3; k++) { const u = .02 + k * .33; bquad(u, 0, u + .3, 1, tint('#C9CDD2')); bquad(u + .01, .08, u + .29, .92, tint(['#F7E7B8', '#CFE6F5', '#F4CFD8', '#D7EFD0'][((e.v2 || 0) + k) % 4])); bquad(u + .03, .55, u + .2, .75, tint('#3B2A20')); bquad(u + .03, .25, u + .25, .4, tint('#9AA9B6')); } },
  /* [T2] 優先席のステッカー（お年寄り・おなかに赤ちゃんのいる人・けがをした人・子ども連れの絵の札） */
  rxSticker(e) { bquad(0, 0, 1, 1, tint('#FFFFFF')); bquad(0, .78, 1, 1, tint('#F08A2E')); qtext(tr('優先席', 'Priority'), .1, .8, .9, .98, '#FFFFFF'); for (let k = 0; k < 4; k++) { const u = .05 + k * .235; bquad(u, .1, u + .2, .7, tint('#E9EDF0')); const c = bil(u + .1, .56); ctx.fillStyle = tint('#2E5F8E'); ctx.beginPath(); ctx.arc(c[0], c[1], 2.2, 0, 7); ctx.fill(); bquad(u + .07, .16, u + .13, .48, tint('#2E5F8E')); } },
  /* [T3] 非常通報ボタン（SOS）と消火器の箱 */
  rxEmerg(e) { bquad(.1, .55, .9, 1, tint('#F2F2F0')); bquad(.2, .62, .8, .92, tint('#E8402E')); qtext('SOS', .25, .66, .75, .88, '#FFFFFF'); bquad(.2, 0, .8, .45, tint('#C8362A')); qtext(tr('消火器', 'Fire ext.'), .22, .12, .78, .34, '#FFFFFF'); },
  /* [T4] 路面電車の運賃箱（前のドアの横・両替のつまみ） */
  rxFareBox(e) { bquad(.2, 0, .8, .3, tint('#5A6470')); bquad(.15, .3, .85, .9, tint('#2F3B47')); bquad(.25, .78, .75, .86, tint('#9AA0A6')); bquad(.3, .5, .7, .7, tint('#E9EDF0')); qtext(tr('運賃', 'Fare'), .3, .52, .7, .68, '#2B2B2B'); },
  /* [T5] 空港へのモノレールの大きな荷物置き場（たてのさく） */
  rxLuggage(e) { bquad(0, 0, 1, .06, tint('#9AA0A6')); bquad(0, .5, 1, .55, tint('#9AA0A6')); bquad(0, .94, 1, 1, tint('#9AA0A6')); for (let k = 0; k <= 5; k++) bquad(k * .2 - .01, 0, k * .2 + .01, 1, tint('#B9C0C6')); bquad(.1, .06, .35, .45, tint('#3E5266')); bquad(.55, .06, .85, .4, tint('#C8463C')); bquad(.12, .56, .4, .9, tint('#F2C230')); qtext(tr('荷物置場', 'Luggage'), .5, .6, .95, .85, '#3B4048'); },
  /* [T6] 赤い電波塔の展望台の小さな神社（本物の展望台にある、白木の小さなお宮と賽銭箱） */
  rxMiniShrine(e) { bquad(0, 0, 1, .12, tint('#C9C4BA')); bquad(.2, .12, .8, .2, tint('#6B5A4A')); bquad(.25, .2, .75, .62, tint('#EFE2C6')); bquad(.32, .26, .68, .56, tint('#D9C8A6')); bquad(.15, .62, .85, .72, tint('#4E5A54')); bquad(.38, .72, .62, .86, tint('#4E5A54')); bquad(.08, .85, .92, .92, tint('#E8D8A8')); for (const u of [.3, .5, .7]) bquad(u - .02, .76, u + .02, .85, '#FFFFFF'); bquad(.05, .12, .1, .7, tint('#C8362A')); bquad(.9, .12, .95, .7, tint('#C8362A')); },
  /* [Y1] ガード下・横丁のレトロなポスター（昭和の映画の看板の雰囲気。題名や実在の作品は描かない） */
  rxRetroPoster(e) { const c = ['#C8463C', '#2E5F8E', '#E8A040', '#2E8A55'][(e.v2 || 0) % 4]; bquad(0, 0, 1, 1, tint('#E9DFC8')); bquad(.06, .3, .94, .9, tint(c)); { const cc = bil(.5, .6); ctx.fillStyle = tint('#F7E7C8'); ctx.beginPath(); ctx.ellipse(cc[0], cc[1], Math.max(3, Math.abs(bil(.75, .6)[0] - cc[0])), Math.max(3, Math.abs(bil(.5, .78)[1] - cc[1])), 0, 0, 7); ctx.fill(); } bquad(.1, .08, .9, .24, tint('#2B2420')); ctx.globalAlpha = .18; bquad(0, 0, 1, .15, '#8A6A40'); bquad(.7, 0, 1, 1, '#8A6A40'); ctx.globalAlpha = 1; },
});
/* 優先席の近くの、黄色いつり革（本物の電車は、優先席の前のつり革だけ黄色やオレンジ） */
PROPS.strapY = (sd, s) => ({ w: 3, ln: [{ a: [s, sd * 3.0, 2.55], b: [s + 3, sd * 3.0, 2.55], c: '#C9CDD2', w: .05 }], spr: [0, 1, 2].map(k => ({ lat: sd * 3.0, s: s + .5 + k, y: 2.05, h: .5, w: .22, img: 'strapY' })) });
{ const bw1 = buildWorldSprites; buildWorldSprites = function () { bw1(); if (!SPR.strapY && SPR.strap) { const c = mk(SPR.strap.width, SPR.strap.height), g = c.getContext('2d') || noCtx(); g.drawImage(SPR.strap, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(242,194,48,.55)'; g.fillRect(0, 0, c.width, c.height); SPR.strapY = c; } }; }
/* 竹下通りのクレープ屋の店先（見本のクレープがならぶ） */
function rxPaintCrepe(g, W, H) { rxShadowE(g, W / 2, H - 4, W * .46, 6); g.fillStyle = '#FFE0EC'; g.fillRect(W * .05, H * .3, W * .9, H * .7 - 4); g.fillStyle = '#FF9ACF'; g.fillRect(0, H * .18, W, H * .14); g.fillStyle = '#FFFFFF'; g.font = rxFont(H * .1); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CREPE', W / 2, H * .25);
  g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(W * .1, H * .38, W * .8, H * .34); for (let k = 0; k < 6; k++) { const x = W * (.17 + k * .13), y = H * .62; g.fillStyle = '#E8B878'; g.beginPath(); g.moveTo(x - 10, y - 18); g.lineTo(x + 10, y - 18); g.lineTo(x, y + 10); g.closePath(); g.fill(); g.fillStyle = ['#FFFFFF', '#F7C6D6', '#F2C230', '#C8463C', '#7A4A2E', '#9AD8FF'][k]; g.beginPath(); g.arc(x, y - 20, 9, Math.PI, 0); g.fill(); g.fillStyle = '#E8402E'; g.beginPath(); g.arc(x + 3, y - 26, 3, 0, 7); g.fill(); } }
PROP_ART.rxCrepe = () => rxArtC('rxcrepe', 220, 200, rxPaintCrepe);
PROPS.crepe = rxOne('rxCrepe', 4.1, 2.2, 2.0, 2.8);
