/* ================= 2026-11-28 景色 1000：場所ごとに、本物を調べて足した物 =================
   オーナー「全ステージをブラッシュする前に、そのステージに関わる現実の情報や画像などをインプットして、景色をブラッシュアップ。最低 1000 以上、全ステージ満遍なく」。
   ここは「どの場所に、何を足すか」の表。絵の道具は src/4k_rtree.js（木）・4l_rprop.js（街灯・信号・交番など）・4m_rset.js（神社・庭園・水辺）・4n_rroom.js（家・会社・駅のかべ）。
   調べた中身と、1 件ずつの一覧は docs/SCENERY-1000-2026-11-28.md。
   sw：道ばたの物の入れかえ（lampC → lampG など）。add：足す物。drop：外す物。set：設定を上書き。fac：建物の設定を上書き。se：季節ごとの上書き。rx：大きな見どころ（池・船・遠くの橋など）。wd：かべに足す物。 */
const RX_TREE_SEASON = { katsura: { autumn: 'katsuraA', winter: 'bare' }, platanus: { autumn: 'platanusA', winter: 'bare' }, yurinoki: { autumn: 'yurinokiA', winter: 'bare' }, mizuki: { spring: 'mizukiF', autumn: 'mizukiA', winter: 'bare' }, kaede: { autumn: 'kaedeA', winter: 'bare' }, yanagi: { winter: 'yanagiW' }, zelkova: { autumn: 'keyakiA', winter: 'bare' } };
const PLATE = (...a) => a.map(x => x.split('/'));
const RX_REAL = {
  /* ---- 課長の家 ---- */
  bedroom: { wd: ['rxOshiire', 'rxRanma', 'rxAC'], add: [['zabutonS', 1]] },
  hall: { wd: ['rxAC', 'rxDoorG'], add: [['umbrellaS', 1]], set: { light: 'round' } },
  living: { wd: ['rxAC', 'rxAC', 'rxScroll'], add: [['plant', 1]] },
  kitchen: { wd: ['rxRange', 'rxRice', 'rxRange', 'rxRice'] },
  genkan: { wd: ['rxDoorG', 'rxDoorG', 'rxScroll'], add: [['plant', 1]] },
  senmen: { wd: ['rxWasher', 'rxVanity', 'rxVanity'], drop: ['boxesS'] },
  washitsu: { wd: ['rxOshiire', 'rxRanma', 'rxScroll'] },
  kaidanH: { wd: ['rxAC', 'rxOshiire'] },
  /* ---- 会社 ---- */
  lobby: { wd: ['rxFloorGuide', 'rxFloorGuide'], add: [['sculpt', 1]] },
  desk: { wd: ['rxInOut', 'rxInOut', 'rxLocker'] },
  meeting: { wd: ['rxPod'] },
  kyuto: { wd: ['rxCoffee', 'rxCoffee', 'rxTrayRet'] },
  copy: { wd: ['rxLocker', 'rxInOut'] },
  deadline: { wd: ['rxInOut', 'rxLocker'] },
  ehall: { wd: ['rxFloorGuide', 'rxFloorGuide'] },
  shokudo: { wd: ['rxTicketM', 'rxTrayRet', 'rxTicketM'] },
  shiryo: { wd: ['rxMobShelf', 'rxMobShelf', 'rxMobShelf'] },
  yakuin: { wd: ['rxCalli', 'rxCalli'], add: [['plant', 1]] },
  present: { wd: ['rxPod'] },
  freeaddr: { wd: ['rxPod', 'rxPod', 'rxLocker'] },
  chikagai: { wd: ['rxShopG', 'rxShopG', 'rxShopG', 'rxExitY', 'rxExitY'] },
  /* ---- 駅・電車 ---- */
  station: { wd: ['rxDepBoard', 'rxDepBoard'], add: [['vending', 1]] },
  subwayst: { wd: ['rxDepBoard', 'rxExitY'], add: [['vending', 1]] },
  yamanote: { wd: ['rxFreeSp'] },
  subway: { wd: ['rxFreeSp'] },
  bayline: { wd: ['rxFreeSp'] },
  monorail: { wd: ['rxFreeSp'] },
  toden: { wd: ['trainmap'] },
  /* ---- 通勤の道 ---- */
  street: { set: { tree: 'mizuki', crowd: .7 }, add: [['azalea', 1], ['fbed', .8], ['kaki', .6], ['cat', .3]] },
  shotengai: { sw: { planter: 'fbed' }, add: [['lampSz', 2], ['cat', .3]], set: { flag: ['商店街', '#C8463C'] } },
  riverside: { sw: { lampC: 'lampT' }, set: { tree: 'sakura', crowd: .8 }, se: { summer: { tree: 'green' }, autumn: { tree: 'momiji' }, winter: { tree: 'bare' } }, rx: [['gulls', 1, { n: 2, seasons: ['autumn', 'winter', 'spring'] }]], add: [['fbed', .6]] },
  tokyoeki: { sw: { lampC: 'lampM' }, add: [['taxi', .7], ['fbed', .8], ['pigeons', .5]], set: { crowd: 1.3, flag: ['丸の内', '#7A2E2A'] } },
  /* ---- 銀座・有楽町・丸の内・皇居 ---- */
  ginza: { sw: { lampC: 'lampG' }, set: { tree: 'katsura', crowd: 1.4, flag: ['銀座', '#1E2A44'], plate: PLATE('銀座四丁目/Ginza 4-chome', '銀座二丁目/Ginza 2-chome', '銀座八丁目/Ginza 8-chome', '京橋/Kyobashi'), sname: ['中央通り', 'Chuo-dori'] },
    fac: { h: [26, 46] }, add: [['sigN', 1], ['koban', .3], ['taxi', .5], ['sname', .5]], sa: { winter: [['xmasTree', 2]] } },
  yurakucho: { rx: [['over', 0, { kind: 'lantern', y: 3.0, gap: 9 }]], add: [['vending', .5]] },
  nakadori: { sw: { lampC: 'lampM' }, set: { tree: 'katsura', crowd: 1.2, flag: ['丸の内', '#7A2E2A'], bigT: 'zelkova' }, noSe: 1, se: { autumn: { tree: 'katsuraA', bigT: 'keyakiA' }, winter: { tree: 'illum', bigT: 'illum' } }, add: [['bigTreeS', 2], ['tset', 2], ['kcar', .6], ['sculpt', 1]] },
  gyoko: { sw: { lampC: 'lampM' }, drop: ['busstop'], set: { sname: ['行幸通り', 'Gyoko-dori'], crowd: 1.1 }, add: [['sname', .6], ['pigeons', .4]] },
  otemachi: { sw: { lampC: 'lampL' }, set: { plate: PLATE('大手町/Otemachi', '大手町一丁目/Otemachi 1-chome', '丸の内一丁目/Marunouchi 1-chome'), crowd: 1.5 }, add: [['sigN', 1], ['sculpt', .6]], rx: [['bikelane', -1], ['bikelane', 1]] },
  kokyo: { sw: { lampC: 'lampM' }, set: { tree: 'matsuN', psign: '皇居外苑', crowd: .8 }, add: [['psign', .4], ['niwaki', 2]], rx: [['float', -1, { items: ['swanB', 'swanB'] }]] },
  chidori: { add: [['lampP', 1], ['psign', .4]], set: { psign: '千鳥ヶ淵' } },
  hibiya: { sw: { lampC: 'lampP', flowers: 'fbed' }, set: { psign: '日比谷公園' }, add: [['psign', .5], ['azalea', 1.5], ['pigeons', .4]],
    rx: [['pond', -1, { a: .12, b: .55, w: 22, items: ['fount:crane', 'island'] }], ['far', 1, { type: 'rxFountain', v: 'big', lat: 18, w: 11, h: 10, s: .7, night: 1 }], ['far', 1, { type: 'rxFountain', v: 'pelican', lat: 11, w: 4, h: 3.2, s: .25 }], ['far', 1, { img: 'bldg', lat: 70, w: 20, h: 70, n: 3, dl: 15 }]] },
  nihonbashi: { sw: { lampC: 'lampG' }, add: [['lampK', .8], ['sigN', 1], ['sname', .5]], set: { plate: PLATE('日本橋/Nihonbashi', '室町一丁目/Muromachi 1-chome', '日本橋一丁目/Nihonbashi 1-chome'), sname: ['中央通り', 'Chuo-dori'] }, fac: { h: [24, 36], pal: ['#D9CFBE', '#CFC3AE', '#E3D9C6', '#BDB3A3', '#C9C3B8'] } }, /* 中央通り（銀座・京橋・日本橋）の照明灯はガス灯をイメージした形（国の資料）。日本橋の橋の上は青銅の灯り */
  shiodome: { sw: { lampC: 'lampL' }, set: { plate: PLATE('汐留/Shiodome', '東新橋/Higashi-Shimbashi'), crowd: 1.2 }, add: [['sigN', 1], ['sculpt', .6], ['taxi', .4]], rx: [['bikelane', -1], ['bikelane', 1]] },
  shinbashi: { set: { plate: PLATE('新橋/Shimbashi', '新橋二丁目/Shimbashi 2-chome'), crowd: 1.4 }, add: [['sigN', 1], ['koban', .4], ['pigeons', .3]], rx: [['viaduct', -1, { lat: 24, col: '#80C241', y: 7.5 }]] },
  tsukiji: { add: [['lampSz', 1.5], ['nobori', 1], ['cat', .2]], set: { flag: ['築地', '#2E5F8E'], crowd: 1.5 } },
  hamarikyu: { set: { tree: 'matsuN', crowd: .6 }, sw: { pinetree: 'niwaki', stoneLantern: 'yukimi' }, add: [['nodate', .5]], sa: { spring: [['fbed', 1.5]], autumn: [['fbed', 1.5]] },
    rx: [['shore', 1, { trees: ['matsuN', 'mori'], city: [60, 160] }], ['float', 1, { items: ['tea:ryotei', 'island', 'stones'] }], ['gulls', 1, { n: 2 }]] },
  tsukishima: { add: [['lampSz', 2], ['sigN', .8]], set: { flag: ['もんじゃ', '#C8463C'], plate: PLATE('月島三丁目/Tsukishima 3-chome', '月島駅前/Tsukishima Sta.'), crowd: 1.3 }, rx: [['far', 1, { img: 'bldg', lat: 70, w: 22, h: 140, n: 2, dl: 12 }], ['far', -1, { img: 'bldg', lat: 80, w: 20, h: 120, n: 1 }]] },
  /* ---- 湾岸 ---- */
  kachidoki: { rx: [['gulls', 1, { n: 2 }], ['boats', -1, { n: 2, kinds: ['bus', 'yakata'], l0: 25, l1: 60 }], ['bridges', 1, { list: [['#F3F3F3', 'arch']], lat: 90 }]], add: [['lampM', 1]] },
  harumi: { rx: [['gulls', 1, { n: 3 }], ['boats', 1, { n: 2, kinds: ['bus', 'yakata'] }], ['cranes', -1, { n: 3, lat: 170 }]], add: [['lampT', 2], ['benchS', 1]], lm: [{ t: 'rbridge', sc: .7, off: .12 }] },
  toyosu: { rx: [['gulls', -1, { n: 3 }], ['boats', -1, { n: 2, kinds: ['yakata', 'bus'] }], ['far', 1, { img: 'bldg', lat: 90, w: 22, h: 130, n: 3, dl: 20 }]], add: [['lampT', 2]], lm: [{ t: 'rbridge', sc: .6, off: -.12 }] },
  kaihin: { rx: [['boats', 1, { n: 3, kinds: ['yakata', 'yakata', 'bus'], l0: 30, l1: 70 }], ['gulls', 1, { n: 3 }], ['far', 1, { type: 'rxIsland', v: '3', lat: 120, w: 40, h: 20, s: .5, y: -.6 }]], lm: [{ t: 'rbridge', sc: .9, off: .05 }], set: { crowd: 1.2 } },
  odaiba: { rx: [['gulls', 1, { n: 3 }], ['boats', -1, { n: 2, kinds: ['bus', 'yakata'], l0: 40, l1: 90 }], ['cranes', 1, { n: 4, lat: 200 }], ['far', -1, { type: 'rxIsland', v: '5', lat: 110, w: 36, h: 18, s: .6, y: -.6 }]] },
  takeshiba: { rx: [['boats', 1, { n: 2, kinds: ['ferry', 'ferry'], l0: 24, l1: 40 }], ['boats', -1, { n: 1, kinds: ['bus'], l0: 40, l1: 70 }], ['gulls', 1, { n: 3 }]], add: [['lampT', 2]], lm: [{ t: 'rbridge', sc: .8, off: .25 }] },
  tennozu: { rx: [['boats', -1, { n: 2, kinds: ['yakata', 'bus'], l0: 14, l1: 30 }], ['gulls', -1, { n: 2 }]], add: [['lampT', 2], ['tset', 1]] },
  rooftop: { add: [['fbed', 1], ['tset', 1], ['azalea', 1]] },
  /* ---- 浅草・隅田川・押上 ---- */
  asakusa: { add: [['koban', .3], ['pigeons', .4], ['nodate', .4]], set: { crowd: 1.7 } },
  nakamise: { rx: [['over', 0, { kind: 'flags', y: 4.3, gap: 11, cols: ['#F4B8C8', '#F7D6E0', '#FBF6EE', '#E86A75'], seasons: ['spring'] }], ['over', 0, { kind: 'flags', y: 4.3, gap: 11, cols: ['#C8362A', '#E8782E', '#F2C230'], seasons: ['autumn'] }], ['over', 0, { kind: 'flags', y: 4.3, gap: 11, cols: ['#3A7DB8', '#FBF6EE', '#9ED0F0'], seasons: ['summer'] }], ['over', 0, { kind: 'flags', y: 4.3, gap: 11, cols: ['#C8362A', '#FBF6EE', '#2E8A55'], seasons: ['winter'] }]], set: { crowd: 2 } },
  hozomon: { add: [['chozu', .5], ['pigeons', .6]], sw: { pinetree: 'niwaki' }, set: { crowd: 1.6 } },
  hondo: { add: [['omikuji', .6], ['ema', .4], ['pigeons', .6]], sw: { pinetree: 'niwaki' }, set: { crowd: 1.6 } },
  denboin: { add: [['lampW', 1.5], ['nodate', .3]], set: { flag: ['伝法院通', '#6B4631'], crowd: 1.3 } },
  river: { rx: [['boats', -1, { n: 2, kinds: ['yakata', 'bus'], l0: 18, l1: 40 }], ['gulls', 1, { n: 3, seasons: ['autumn', 'winter', 'spring'] }], ['far', 1, { img: 'bldg', lat: 85, w: 20, h: 40, n: 4, dl: 10 }]] },
  yakata: { rx: [['boats', 1, { n: 2, kinds: ['yakata', 'bus'], l0: 18, l1: 40 }], ['gulls', -1, { n: 2, seasons: ['autumn', 'winter', 'spring'] }]] },
  terrace: { sw: { lampC: 'lampT', planter: 'fbed' }, set: { wide: 100, crowd: .9 }, rx: [['bridges', 1, { list: [['#3A6FB0', 'arch'], ['#E8C547', 'under']], lat: 95, w: 70, h: 20 }], ['float', 1, { items: ['boat:bus', 'boat:yakata'] }], ['gulls', 1, { n: 2, seasons: ['autumn', 'winter', 'spring'] }]] },
  sumidakoen: { set: { wide: 100 }, rx: [['bridges', 1, { list: [['#C0392B', 'under']], lat: 95, w: 70, h: 20 }], ['float', 1, { items: ['boat:bus', 'boat:yakata'] }]], add: [['lampP', 1]] },
  sfoot: { sw: { lampC: 'lampT' }, add: [['fbed', .6], ['tset', .5]] },
  sland: { sw: { lampC: 'lampP', flowers: 'fbed' }, rx: [['float', -1, { items: ['boat:bus', 'boat:yakata'] }], ['bridges', -1, { list: [['#C0392B', 'under']], lat: 120, w: 70, h: 20 }]], set: { psign: '隅田公園' }, add: [['psign', .4]] },
  slobby: { wd: ['rxFloorGuide'] },
  sdeck: { add: [['tset', .6]] },
  kuramae: { add: [['lampSz', 2], ['sigN', .8]], set: { flag: ['蔵前', '#2E5F8E'], plate: PLATE('蔵前/Kuramae', '蔵前一丁目/Kuramae 1-chome', '蔵前橋/Kuramae-bashi') }, rx: [['bikelane', -1], ['bikelane', 1]] },
  ryogoku: { add: [['lampSz', 2], ['sigN', .8], ['sculpt', .5]], set: { flag: ['両国', '#5A2E7A'], plate: PLATE('両国/Ryogoku', '両国二丁目/Ryogoku 2-chome'), crowd: 1.2 } },
  dougu: { add: [['lampSz', 2], ['sigN', .8]], set: { flag: ['かっぱ橋', '#2E8A55'], plate: PLATE('菊屋橋/Kikuyabashi', '合羽橋/Kappabashi'), crowd: 1.1 } },
  kiyosumi: { set: { tree: 'matsuN', crowd: .5 }, sw: { pinetree: 'niwaki', stoneLantern: 'yukimi' }, add: [['kaki', .6]], rx: [['shore', -1, { trees: ['matsuN', 'kusu', 'mori'], city: [20, 45] }], ['float', -1, { items: ['stones', 'island', 'tea:ryotei', 'island', 'stones'] }]] },
  kiba: { sw: { lampC: 'lampP' }, set: { wide: 60, psign: '木場公園' }, add: [['fbed', 1], ['psign', .4]], rx: [['bridges', -1, { list: [['#E9EDF0', 'stay']], lat: 70, w: 60, h: 34 }]] },
  monzen: { add: [['lampW', 1.5], ['nobori', 1], ['komainu', .4], ['nodate', .3]], set: { flag: ['深川', '#2E5F8E'], crowd: 1.2 } },
  /* ---- 上野・谷根千・御徒町・秋葉原 ---- */
  ueno: { sw: { lampC: 'lampP' }, set: { psign: '上野恩賜公園', crowd: 1.4 }, add: [['psign', .4], ['pigeons', .6]], sa: { spring: [['bonbori', 3]] }, rx: [['far', -1, { type: 'rxFountain', v: 'big', lat: 16, w: 10, h: 9, s: .6, night: 1 }]] },
  shinobazu: { sw: { lampC: 'lampP' }, set: { tree: 'yanagi', crowd: .9 }, se: { summer: { tree: 'yanagi' } }, rx: [['shore', -1, { trees: ['@', 'kusu', 'mori'], city: [20, 60] }], ['float', -1, { items: ['lotus', 'tea:benten', 'swan', 'lotus'] }], ['gulls', -1, { n: 3, seasons: ['winter', 'autumn'] }]], add: [['pigeons', .4]] },
  ameyoko: { add: [['nobori', 1.5]], set: { crowd: 1.9 } },
  okachimachi: { fac: { mood: 'hoseki' }, add: [['lampSz', 1.5], ['sigN', .8]], set: { flag: ['御徒町', '#B07A3A'], plate: PLATE('御徒町駅前/Okachimachi Sta.', '上野三丁目/Ueno 3-chome') } },
  yanaka: { add: [['lampSz', 2], ['cat', 1.2]], sw: { planter: 'fbed' }, set: { flag: ['谷中銀座', '#C8463C'], crowd: 1.3 }, rx: [['over', 0, { kind: 'flags', y: 4.6, gap: 13 }]] },
  nezu: { add: [['azalea', 2.5], ['komainu', .8], ['chozu', .6], ['ema', .5], ['shinboku', .4], ['cat', .3]], set: { tree: 'kusu' } },
  shibamata: { add: [['lampW', 1.5], ['nodate', .6]], set: { flag: ['柴又', '#2E5F3E'], crowd: 1.1 } },
  akihabara: { sw: { signal: 'sigN' }, add: [['lampL', 1.2], ['koban', .3]], set: { flag: ['秋葉原', '#E86A9A'], plate: PLATE('外神田一丁目/Sotokanda 1-chome', '外神田四丁目/Sotokanda 4-chome', '末広町/Suehirocho', '万世橋/Manseibashi'), crowd: 1.6 } },
  kanda: { add: [['lampW', 1.5], ['komainu', .8], ['chozu', .6], ['ema', .6], ['omikuji', .4]], set: { flag: ['神田明神', '#B5302A'], crowd: 1.1 } },
  ochanomizu: { fac: { mood: 'gakki' }, add: [['sigN', 1], ['lampL', 1]], set: { plate: PLATE('駿河台下/Surugadai-shita', '御茶ノ水駅前/Ochanomizu Sta.'), crowd: 1.2 } },
  jimbocho: { add: [['sigN', 1]], set: { plate: PLATE('神保町/Jimbocho', '駿河台下/Surugadai-shita') }, sa: { autumn: [['bookcart', 3]] }, rx: [['bikelane', -1], ['bikelane', 1]] },
  koishikawa: { set: { tree: 'matsuN', crowd: .5 }, sw: { pinetree: 'niwaki', stoneLantern: 'yukimi' }, add: [['shidareT', .7], ['kaedeT', 1.2], ['kaki', .5]], rx: [['shore', 1, { trees: ['kaede', 'matsuN', 'mori'] }], ['float', 1, { items: ['bridge:engetsu', 'island', 'bridge:bridgeRed'] }]] },
  kagurazaka: { add: [['lampW', 1.5], ['sigN', .6], ['tset', .4], ['cat', .2]], set: { flag: ['神楽坂', '#8A2E2A'], plate: PLATE('神楽坂上/Kagurazaka-ue', '神楽坂下/Kagurazaka-shita'), crowd: 1.2 } },
  yotsuya: { add: [['lampP', 1]], set: { crowd: .8 } },
  ichigaya: { sw: { lampC: 'lampP' }, set: { crowd: .8 } },
  /* ---- 芝・赤い電波塔 ---- */
  tfoot: { sw: { lampC: 'lampP' }, set: { psign: '芝公園' }, add: [['psign', .5], ['fbed', .6]] },
  tlobby: { wd: ['rxFloorGuide'] },
  tland: { sw: { lampC: 'lampP', flowers: 'fbed' }, set: { psign: '芝公園' }, add: [['psign', .4], ['pigeons', .4]] },
  zojoji: { add: [['jizo', 2], ['chozu', .6], ['pigeons', .5]], sw: { pinetree: 'niwaki' }, set: { crowd: 1.1 } },
  /* ---- 渋谷・新宿・原宿 ---- */
  shibuya: { sw: { signal: 'sigN' }, add: [['koban', .3]], set: { plate: PLATE('渋谷駅前/Shibuya Sta.', '道玄坂下/Dogenzaka-shita', '宮益坂下/Miyamasuzaka-shita'), crowd: 2 } },
  ekimae: { sw: { signal: 'sigN' }, set: { plate: PLATE('渋谷駅前/Shibuya Sta.', '道玄坂上/Dogenzaka-ue'), crowd: 1.7 } },
  shinjuku: { sw: { lampC: 'lampL' }, add: [['sigN', 1], ['sculpt', .8], ['taxi', .4]], set: { plate: PLATE('西新宿一丁目/Nishi-Shinjuku 1-chome', '都庁前/Tochomae', '西新宿二丁目/Nishi-Shinjuku 2-chome'), crowd: 1.2 }, rx: [['bikelane', -1], ['bikelane', 1]] },
  kabukicho: { sw: { signal: 'sigN' }, add: [['koban', .3]], set: { plate: PLATE('新宿区役所前/Shinjuku Kuyakusho-mae', '歌舞伎町/Kabukicho'), crowd: 1.6 } },
  yokocho: { rx: [['over', 0, { kind: 'lantern', y: 2.9, gap: 8 }]], add: [['vending', .4]] },
  gyoen: { sw: { bigTree: 'bigTreeS', lampC: 'lampP' }, set: { tree: 'platanus', psign: '新宿御苑', crowd: .8 }, noSe: 1, se: { summer: { tree: 'platanus' }, autumn: { tree: 'platanusA' }, winter: { tree: 'bare' } }, add: [['psign', .4]], rx: [['pond', -1, { a: .2, b: .7, w: 20, items: ['island', 'tea:ryotei'] }]] },
  sando: { set: { tree: 'mori', crowd: 1.1 }, add: [['sakadaru', .6], ['chozu', .5], ['shinboku', .4], ['ema', .3]] },
  takeshita: { rx: [['over', 0, { kind: 'flags', y: 5.0, gap: 12, cols: ['#FF9ACF', '#9AD8FF', '#FFE27A', '#B8F2A0'] }]], set: { crowd: 2.2 } },
  omotesando: { sw: { bigTree: 'bigTreeS' }, add: [['sigN', 1], ['stoneLantern', .3]], set: { plate: PLATE('神宮前/Jingumae', '表参道/Omotesando'), crowd: 1.4 }, rx: [['bikelane', -1], ['bikelane', 1]] },
  catst: { add: [['tset', .6], ['sculpt', .3]], set: { crowd: 1.3 } },
  gaien: { sa: { autumn: [['kcar', .6], ['tset', .6]] }, set: { crowd: 1.2 } },
  yoyogi: { sw: { lampC: 'lampP' }, set: { psign: '代々木公園' }, add: [['psign', .4], ['pigeons', .3]], rx: [['far', 1, { type: 'rxFountain', v: 'big', lat: 20, w: 12, h: 11, s: .55, night: 1 }]] },
  daikanyama: { sw: { tree: 'bigTreeS' }, add: [['tset', 1], ['sigN', .6]], set: { plate: PLATE('鉢山町/Hachiyamacho', '代官山/Daikanyama') } },
  meguro: { sw: { lampC: 'lampT' }, sa: { spring: [['bonbori', 3]] }, rx: [['shore', 1, { trees: ['@', '@', 'green'], city: [8, 20] }]] },
  ebisu: { add: [['sigN', .8], ['lampL', 1], ['tset', .6]], set: { plate: PLATE('恵比寿駅前/Ebisu Sta.', '恵比寿南/Ebisu-minami') } },
  roppongi: { sw: { signal: 'sigN' }, set: { tree: 'zelkova', plate: PLATE('六本木/Roppongi', '六本木六丁目/Roppongi 6-chome'), crowd: 1.3 }, se: { winter: { tree: 'illum' } }, add: [['sculpt', .6], ['koban', .3], ['taxi', .4]] },
  hie: { add: [['chozu', .5], ['ema', .5], ['omikuji', .4], ['shinboku', .3]], set: { tree: 'kusu' } },
  akasaka: { sw: { signal: 'sigN' }, set: { plate: PLATE('赤坂見附/Akasaka-mitsuke', '赤坂三丁目/Akasaka 3-chome'), crowd: 1.2 }, add: [['taxi', .4]] },
  ikebukuro: { sw: { signal: 'sigN' }, add: [['koban', .3]], set: { plate: PLATE('池袋駅東口/Ikebukuro Sta. East', '東池袋一丁目/Higashi-Ikebukuro 1-chome'), crowd: 1.6 }, rx: [['far', 1, { img: 'bldg', lat: 90, w: 26, h: 200, n: 1, s: .7 }]] },
  shinokubo: { add: [['sigN', .8]], set: { plate: PLATE('新大久保駅前/Shin-Okubo Sta.', '百人町/Hyakunincho'), crowd: 1.7 } },
  shimokita: { add: [['tset', .4], ['cat', .2]], set: { crowd: 1.4 } },
  sangenjaya: { rx: [['over', 0, { kind: 'lantern', y: 3.0, gap: 9 }]] },
  nakano: { rx: [['over', 0, { kind: 'flags', y: 3.9, gap: 10 }]], add: [['vending', .5]] },
  koenji: { add: [['lampSz', 2]], set: { flag: ['高円寺', '#2E5F8E'], crowd: 1.2 }, rx: [['over', 0, { kind: 'lantern', y: 4.6, gap: 10, seasons: ['summer'] }]] },
  kichijoji: { sw: { lampC: 'lampP' }, set: { psign: '井の頭恩賜公園' }, add: [['psign', .4]], rx: [['shore', -1, { trees: ['@', 'kusu', 'mori'], city: [10, 24] }], ['float', -1, { items: ['swan', 'tea:benten', 'swan'] }]] },
  jiyugaoka: { add: [['tset', 1.2], ['fbed', .6], ['bigTreeS', .5]], set: { bigT: 'zelkova', crowd: 1.2 } },
  /* ---- 空港 ---- */
  kuko: { wd: ['rxShopG'] },
  kukodeck: { rx: [['planes', 1, { n: 3, lat: 80, fly: 1 }]] },
};
/* ---- 2 回目の調べ：季節の行事・生き物・通りの名前・遠くの見どころ（RX_REAL に足す） ---- */
const SN = (ja, en) => ({ set: { sname: [ja, en] }, add: [['sname', .5]] });
const RX_MORE = {
  bedroom: { sa: { summer: [['senpuki', .8]] } },
  living: { sa: { winter: [['kotatsu', 1]], summer: [['senpuki', .8]], autumn: [['tsukimi', .6]] } },
  washitsu: { sa: { winter: [['kotatsu', 1]], summer: [['senpuki', .6]], autumn: [['tsukimi', .8]] } },
  lobby: { sa: { winter: [['xmasTree', .8]] } },
  station: { wd: ['clock'] }, subwayst: { wd: ['clock'] },
  nakadori: SN('丸の内仲通り', 'Marunouchi Naka-dori'),
  kokyo: { rx: [['life', -1, { items: ['kamo'], n: 2 }]] },
  tsukiji: { se: { winter: { crowd: 2.3 } } },
  tsukishima: SN('西仲通り', 'Nishinaka-dori'),
  kachidoki: { lm: [{ t: 'skytree', sc: .5, off: -.3 }] },
  harumi: { rx: [['sky', 1, { n: 1 }]], lm: [{ t: 'skytree', sc: .45, off: -.32 }] },
  toyosu: { rx: [['sky', 1, { n: 1 }]], lm: [{ t: 'skytree', sc: .45, off: .34 }] },
  kaihin: { rx: [['sky', -1, { n: 2 }]], se: { summer: { crowd: 1.8 } } },
  odaiba: { rx: [['sky', 1, { n: 1 }]] },
  takeshiba: { rx: [['sky', 1, { n: 1 }], ['far', 1, { type: 'rxMast', lat: 14, w: 3, h: 16, s: .55, night: 1 }]] },
  asakusa: { se: { winter: { crowd: 2.2 } }, ...SN('雷門通り', 'Kaminarimon-dori') },
  nakamise: { se: { winter: { crowd: 2.6 } } },
  hondo: { sa: { summer: [['hozuki', 1.4]], winter: [['hagoita', 1.4]] } },
  river: { rx: [['hanabi', 1, { n: 4, seasons: ['summer'] }]] },
  yakata: { rx: [['hanabi', 1, { n: 5, seasons: ['summer'] }]] },
  terrace: { rx: [['hanabi', 1, { n: 3, seasons: ['summer'] }]] },
  sumidakoen: { rx: [['bridges', 1, { list: [['#5A6E8A', 'truss']], lat: 110, w: 80, h: 20 }]] },
  sland: { rx: [['hanabi', -1, { n: 5, seasons: ['summer'] }]] },
  kuramae: SN('江戸通り', 'Edo-dori'),
  ryogoku: { ...SN('国技館通り', 'Kokugikan-dori'), add: [['sname', .5], ['rikishi', 1]] },
  dougu: SN('かっぱ橋道具街', 'Kappabashi'),
  kiyosumi: { rx: [['life', -1, { items: ['koi', 'kamo'], n: 2 }]] },
  shinobazu: { rx: [['life', -1, { items: ['kamo'], n: 3 }]], lm: [{ t: 'skytree', sc: .55, off: .3 }] },
  ameyoko: { se: { winter: { crowd: 2.6 } } },
  akihabara: SN('中央通り', 'Chuo-dori'),
  kanda: { se: { winter: { crowd: 1.9 } }, set: { gate: '随神門', gateColor: '#B5302A' } },
  ochanomizu: { ...SN('明大通り', 'Meidai-dori'), rx: [['far', 1, { type: 'rxDome', lat: 40, w: 22, h: 19, s: .85, night: 1 }]] },
  jimbocho: SN('靖国通り', 'Yasukuni-dori'),
  koishikawa: { rx: [['life', 1, { items: ['koi'], n: 2 }]] },
  kagurazaka: SN('神楽坂通り', 'Kagurazaka-dori'),
  ichigaya: { rx: [['life', -1, { items: ['koi'], n: 3 }]] },
  shibuya: { add: [['hachiko', .3]] },
  gyoen: { rx: [['life', -1, { items: ['koi'], n: 2, fw: 20, y: -.3 }], ['far', 1, { type: 'rxOnshitsu', lat: 34, w: 26, h: 14, s: .6, night: 1 }]] },
  omotesando: SN('表参道', 'Omotesando'),
  daikanyama: SN('旧山手通り', 'Kyu-Yamate-dori'),
  roppongi: SN('外苑東通り', 'Gaien-higashi-dori'),
  akasaka: { ...SN('一ツ木通り', 'Hitotsugi-dori'), fac: { mood: 'akasaka' } },
  ikebukuro: SN('明治通り', 'Meiji-dori'),
  shinokubo: SN('大久保通り', 'Okubo-dori'),
  kichijoji: { rx: [['life', -1, { items: ['kamo', 'koi'], n: 2 }]] },
  kukodeck: { rx: [['sky', 1, { n: 2 }]] },
  ueno: { rx: [['far', -1, { type: 'rxMuseum', lat: 46, w: 44, h: 17, s: .95, night: 1 }]] },
  hibiya: { rx: [['far', 1, { type: 'rxBrick', lat: 60, w: 22, h: 19, s: .4, night: 1 }]] },
  yoyogi: { rx: [['far', -1, { type: 'rxTaiiku', lat: 70, w: 50, h: 22, s: .6, night: 1 }]] },
  hamarikyu: { rx: [['far', 1, { type: 'rxBridgeWood', lat: 20, w: 40, h: 4.5, s: .35, y: -.9 }]] },
  shibamata: { fac: { mood: 'shibamata' }, set: { gate: '二天門', gateColor: '#B5302A', gateWood: 1 } },
  monzen: { fac: { mood: 'monzen' } },
  koenji: { fac: { mood: 'koenji' }, add: [['pole', 1.5]] },
  shimokita: { fac: { mood: 'shimokita' }, add: [['pole', 1.5]] },
  yanaka: { add: [['pole', 1.5]] },
};
/* ---- 3 回目の調べ：部屋・電車・小さな通りの、まだ足りなかった本物（RX_REAL に足す） ---- */
const RX_MORE3 = {
  hall: { wd: ['rxIntercom', 'rxBreaker'] }, kaidanH: { wd: ['rxBreaker', 'rxIntercom'] }, senmen: { wd: ['rxTowel', 'rxBathDoor'] }, kitchen: { wd: ['rxWindowK'], add: [['plant', .5]] }, genkan: { wd: ['rxIntercom'], add: [['umbrellaS', .6]] },
  bedroom: { wd: ['rxScroll'] },
  lobby: { wd: ['rxAED', 'rxShokasen'] }, desk: { wd: ['rxKamidana', 'rxShokasen'] }, meeting: { wd: ['rxVcon', 'rxVcon', 'clock'] }, kyuto: { wd: ['rxSink', 'rxShokasen'] }, copy: { wd: ['rxShred', 'rxPaperShelf', 'rxPaperShelf'] },
  deadline: { wd: ['rxShokasen', 'rxKamidana'] }, ehall: { wd: ['rxAED', 'rxShokasen'], add: [['sculpt', .5]] }, shokudo: { wd: ['rxSample', 'rxSample', 'rxShokasen'] }, shiryo: { wd: ['rxFileBox', 'rxFileBox', 'rxShokasen'] },
  yakuin: { wd: ['rxTrophy', 'rxKamidana'] }, present: { wd: ['rxVcon', 'rxShokasen'] }, freeaddr: { wd: ['rxShokasen', 'rxAED'] }, chikagai: { wd: ['rxCoinLocker', 'rxGuideMap', 'rxShokasen', 'rxAED'] },
  kuko: { wd: ['rxAED', 'rxCoinLocker', 'rxShokasen'] },
  station: { wd: ['rxPlatNum', 'rxEmergStop', 'rxWaitRoom', 'rxAED'] }, subwayst: { wd: ['rxPlatNum', 'rxEmergStop', 'rxLineBand', 'rxShokasen'] },
  yamanote: { wd: ['rxSticker', 'rxEmerg'], add: [['strapY', 1]] }, subway: { wd: ['rxWinAd', 'rxSticker', 'rxEmerg'], add: [['strapY', 1]] },
  toden: { wd: ['rxFareBox', 'rxWinAd', 'rxSticker', 'rxEmerg'] }, bayline: { wd: ['rxWinAd', 'rxSticker', 'rxEmerg'], add: [['strapY', 1]] }, monorail: { wd: ['rxLuggage', 'rxLuggage', 'rxSticker', 'rxEmerg'] },
  tdeck: { wd: ['rxMiniShrine'], add: [['tset', .4]], rx: [['sky', 1, { n: 1 }]] }, tlobby: { wd: ['rxAED', 'rxShokasen'] }, slobby: { wd: ['rxCoinLocker', 'rxAED'] }, sdeck: { wd: ['rxShopG'], rx: [['sky', 1, { n: 1 }]] },
  skytree: { rx: [['sky', 1, { n: 1 }]] }, troof: { add: [['fbed', .5]] }, tstair: { rx: [['sky', 1, { n: 1 }]] }, tower: { rx: [['sky', 1, { n: 1 }]] },
  takeshita: { add: [['crepe', 1.5], ['gacha', 1], ['koban', .2]] }, nakano: { wd: ['rxShopG', 'rxShopG'], add: [['gacha', 1], ['stall', 1]] },
  yurakucho: { wd: ['rxRetroPoster', 'rxRetroPoster'] }, yokocho: { wd: ['rxRetroPoster'], add: [['cat', .3]] }, sangenjaya: { wd: ['rxRetroPoster'], add: [['vending', .5], ['cat', .3], ['bikes', .5]] },
  chidori: { rx: [['life', -1, { items: ['kamo'], n: 2 }]], add: [['kcar', .4]] }, ameyoko: { rx: [['over', 0, { kind: 'flags', y: 5.0, gap: 14 }]], add: [['fishbox', 1.5], ['crates', 1]] },
  yotsuya: { set: { psign: '外濠公園' }, add: [['psign', .4]] }, ichigaya: { set: { psign: '外濠公園' }, add: [['psign', .4]] },
  ekimae: { add: [['koban', .2], ['gacha', .8]], set: { sname: ['センター街', 'Center-gai'] }, rx: [['over', 0, { kind: 'flags', y: 5.4, gap: 16, cols: ['#F2F2F2', '#2B2B2B', '#FFD24A'] }]] },
  catst: { sw: { planter: 'fbed' }, set: { sname: ['キャットストリート', 'Cat Street'] }, add: [['sname', .4]] },
  gaien: { se: { autumn: { crowd: 2 } }, set: { psign: '明治神宮外苑' }, add: [['psign', .3]] },
  meguro: { rx: [['life', 1, { items: ['koi'], n: 2 }]], add: [['tset', .6]] },
  kabukicho: { add: [['taxi', .3]] }, ebisu: { set: { sname: ['駒沢通り', 'Komazawa-dori'] }, add: [['sname', .4], ['koban', .2]] },
  shotengai: { add: [['pole', 1.5]] }, denboin: { add: [['nobori', 1], ['rickshawP', .6]] }, tfoot: { add: [['pigeons', .4]] },
  river: { lm: [{ t: 'tower', sc: .35, off: -.3 }] }, sfoot: { add: [['pigeons', .3]] },
};
/* ---- 4 回目の調べ：季節の花（あじさい・モミジ）・冬の庭（雪吊り）・路地の鉢植え・名前の石・部屋の時計やカレンダー ---- */
const AJ = { sa: { summer: [['ajisai', 1.2]] } }, MOMI = { add: [['kaedeT', .8]] };
const RX_MORE4 = {
  hall: { wd: ['clock', 'calendar'] }, kitchen: { wd: ['calendar', 'clock'] }, genkan: { wd: ['mirror'] }, kaidanH: { wd: ['clock'] }, bedroom: { wd: ['clock'] }, living: { wd: ['clock', 'rxIntercom'] }, washitsu: { wd: ['rxAC'] }, senmen: { add: [['plant', .6]] },
  meeting: { wd: ['whiteboard', 'calendar'], add: [['plant', .6]] }, shiryo: { wd: ['rxPaperShelf', 'rxShred'] }, present: { wd: ['calendar'], add: [['plant', .6]] }, desk: { wd: ['rxPaperShelf', 'rxShred'] }, kyuto: { wd: ['rxRice', 'calendar'] },
  copy: { wd: ['rxShokasen', 'calendar'] }, deadline: { wd: ['rxPaperShelf', 'rxShred'] }, ehall: { wd: ['rxGuideMap'] }, shokudo: { wd: ['rxCoffee'] }, yakuin: { wd: ['clock', 'rxScroll'] }, freeaddr: { wd: ['rxCoffee'] },
  lobby: { wd: ['clock', 'rxGuideMap'] }, chikagai: { add: [['vending', .6]] }, kuko: { wd: ['rxGuideMap'], add: [['vending', .5]] }, station: { wd: ['rxShokasen'] }, monorail: { add: [['strapY', 1]] }, toden: { add: [['strapY', .8]] },
  troof: { add: [['benchS', 1]] }, tpass: { wd: ['rxShokasen', 'rxAED'] }, tdeck: { wd: ['rxShopG'] }, tlobby: { wd: ['rxShopG', 'rxCoinLocker'] }, slobby: { wd: ['rxShopG', 'rxGuideMap'] }, sdeck: { wd: ['rxAED'] },
  kukodeck: { add: [['lampT', 1], ['fbed', .5]] }, rooftop: { add: [['lampT', 1], ['pigeons', .3]] }, yakata: { rx: [['far', 1, { img: 'bldg', lat: 70, w: 20, h: 40, n: 3, dl: 10 }]] },
  kachidoki: { set: { sname: ['晴海通り', 'Harumi-dori'] }, add: [['sname', .4]] }, odaiba: { add: [['lampL', 1]] }, tennozu: { add: [['sculpt', .5], ['fbed', .5]] },
  sumidakoen: { add: [['kcar', .4]], set: { psign: '隅田公園' } }, okachimachi: { add: [['bikes', 1]] }, yotsuya: { add: [['pigeons', .3]] }, tland: { add: [['azalea', 1]] },
  zojoji: { add: [['nobori', 1], ['omikuji', .4], ['kaedeT', .8]], set: { psign: '増上寺' } }, shibuya: { add: [['pigeons', .4]], set: { sname: ['道玄坂', 'Dogenzaka'] } },
  hie: { add: [['nobori', 1], ['pigeons', .3], ['kaedeT', .8]] }, shinokubo: { add: [['pole', 1.2]] }, shimokita: { rx: [['over', 0, { kind: 'flags', y: 5.0, gap: 15 }]] },
  jiyugaoka: { set: { sname: ['九品仏川緑道', 'Kuhonbutsu Green Path'] }, add: [['sname', .4]] }, tsukiji: { add: [['sigN', .6]], set: { plate: PLATE('築地四丁目/Tsukiji 4-chome', '築地六丁目/Tsukiji 6-chome') } },
  kiba: { add: [['azalea', 1]], ...AJ }, sando: { add: [['pigeons', .4]] }, yoyogi: { add: [['kcar', .5]], ...AJ }, koenji: { add: [['cat', .3], ['hachi', 1]] }, kichijoji: { add: [['pigeons', .3], ['kaedeT', .8]] },
  /* あじさい（梅雨の 6 月：公園・寺社・住宅街） */
  street: { ...AJ, add: [['hachi', .6]] }, hibiya: { ...AJ, ...MOMI }, ueno: { ...AJ, ...MOMI }, nezu: { ...AJ, ...MOMI, set: { psign: '根津神社' } }, gyoen: { ...AJ, ...MOMI }, shinobazu: { ...AJ, set: { psign: '不忍池' } },
  riverside: AJ, terrace: AJ, meguro: AJ, kokyo: AJ, tfoot: AJ, kanda: { ...MOMI }, koishikawa: { ...AJ, set: { yukitsuri: 1, psign: '小石川後楽園' }, se: { winter: { tree: 'matsuY' } } },
  hamarikyu: { set: { yukitsuri: 1, psign: '浜離宮恩賜庭園' }, se: { winter: { tree: 'matsuY' } }, add: [['psign', .3]] }, kiyosumi: { ...AJ, set: { yukitsuri: 1, psign: '清澄庭園' }, se: { winter: { tree: 'matsuY' } }, add: [['psign', .3]] },
  hondo: { set: { psign: '浅草寺' } }, sumidakoen_: {},
  /* 下町の路地の鉢植え（夏はアサガオ） */
  yanaka: { add: [['hachi', 1.2]] }, shotengai: { add: [['hachi', .8]] }, tsukishima: { add: [['hachi', .8]] }, kuramae: { add: [['hachi', .5]] }, shibamata: { add: [['hachi', .5]] }, monzen: { add: [['hachi', .5]] },
};
delete RX_MORE4.sumidakoen_;
for (const t of ['nezu', 'shinobazu', 'koishikawa', 'hondo', 'zojoji', 'sumidakoen']) RX_MORE4[t].add = (RX_MORE4[t].add || []).concat([['psign', .3]]); /* 名前の石（公園・庭園・寺社の入口） */
/* ---- 5 回目の調べ：地下鉄の出入口の駅名（線の色）・都バスの停留所の名前・電柱の住所の札・季節のにぎわい・カラスなど ---- */
const SUB = (ja, en, c) => ({ set: { subway: [ja, en, c] }, add: [['subway', .7]] }), rxBUS = n => ({ sw: { busstop: 'busN' }, set: { busName: n } }), CH = (town, nums) => ({ sw: { pole: 'poleC' }, set: { chome: [town, nums] } });
const RXL = { G: '#F39700', M: '#E60012', H: '#9CAEB7', T: '#00A7DB', C: '#009944', Y: '#C1A470', Z: '#9B7CB6', O: '#B6007A' }; /* 地下鉄の線の色（銀座線・丸ノ内線・日比谷線・東西線・千代田線・有楽町線・半蔵門線・大江戸線） */
const RX_MORE5 = {};
const rx5 = (t, ...parts) => { RX_MORE5[t] = RX_MORE5[t] || {}; for (const p of parts) rxMerge(RX_MORE5[t], JSON.parse(JSON.stringify(p))); };
rx5('ginza', SUB('銀座駅', 'Ginza Sta.', RXL.G), rxBUS('銀座四丁目'), { add: [['fbed', .6]], se: { autumn: { leaves: 1 } } });
rx5('nihonbashi', SUB('日本橋駅', 'Nihombashi Sta.', RXL.G), rxBUS('日本橋'), { add: [['fbed', .6]] });
rx5('otemachi', SUB('大手町駅', 'Otemachi Sta.', RXL.M), rxBUS('大手町'), { add: [['kcar', .4]], set: { sname: ['永代通り', 'Eitai-dori'] } }, { add: [['sname', .4]] });
rx5('nakadori', SUB('二重橋前駅', 'Nijubashimae Sta.', RXL.C), { se: { autumn: { leaves: 1 }, winter: { crowd: 1.8 } } });
rx5('gyoko', SUB('二重橋前駅', 'Nijubashimae Sta.', RXL.C));
rx5('hibiya', SUB('日比谷駅', 'Hibiya Sta.', RXL.H), { add: [['kcar', .3], ['tset', .5]] });
rx5('shiodome', SUB('汐留駅', 'Shiodome Sta.', RXL.O), rxBUS('汐留駅前'), { add: [['kcar', .4]] });
rx5('shinbashi', SUB('新橋駅', 'Shimbashi Sta.', RXL.G), rxBUS('新橋駅前'), CH('新橋', ['2-8', '2-16', '3-25']));
rx5('shinjuku', SUB('都庁前駅', 'Tochomae Sta.', RXL.O), rxBUS('都庁第一本庁舎'), { add: [['koban', .2], ['kcar', .4]] });
rx5('roppongi', SUB('六本木駅', 'Roppongi Sta.', RXL.H), rxBUS('六本木駅前'), { se: { autumn: { leaves: 1 }, winter: { crowd: 1.8 } } });
rx5('akasaka', SUB('赤坂見附駅', 'Akasaka-mitsuke Sta.', RXL.G));
rx5('omotesando', SUB('表参道駅', 'Omotesando Sta.', RXL.G), rxBUS('表参道'), { add: [['tset', .5]], se: { autumn: { leaves: 1 } } });
rx5('takeshita', SUB('明治神宮前駅', 'Meiji-jingumae Sta.', RXL.C), rxBUS('原宿駅前'));
rx5('jimbocho', SUB('神保町駅', 'Jimbocho Sta.', RXL.Z), CH('神田神保町', ['1-1', '1-7', '2-3']));
rx5('kagurazaka', SUB('神楽坂駅', 'Kagurazaka Sta.', RXL.T));
rx5('monzen', SUB('門前仲町駅', 'Monzen-nakacho Sta.', RXL.T), { add: [['chozu', .4], ['ema', .3]], se: { winter: { crowd: 1.7 } } });
rx5('tsukishima', SUB('月島駅', 'Tsukishima Sta.', RXL.Y), { add: [['poleC', 1.2]], set: { chome: ['月島', ['1-8', '3-9', '3-17']] } });
rx5('kuramae', SUB('蔵前駅', 'Kuramae Sta.', RXL.O));
rx5('ryogoku', SUB('両国駅', 'Ryogoku Sta.', RXL.O));
rx5('dougu', SUB('田原町駅', 'Tawaramachi Sta.', RXL.G), CH('西浅草', ['2-25', '3-1', '3-7']));
rx5('asakusa', SUB('浅草駅', 'Asakusa Sta.', RXL.G));
rx5('akihabara', SUB('末広町駅', 'Suehirocho Sta.', RXL.G), rxBUS('秋葉原駅前'), CH('外神田', ['1-15', '3-16', '4-3']), { fac: { h: [18, 40] } });
rx5('okachimachi', SUB('仲御徒町駅', 'Naka-okachimachi Sta.', RXL.H));
rx5('ochanomizu', SUB('新御茶ノ水駅', 'Shin-ochanomizu Sta.', RXL.C), CH('神田駿河台', ['1-6', '2-1', '2-3']));
rx5('ebisu', SUB('恵比寿駅', 'Ebisu Sta.', RXL.H), { add: [['sculpt', .4]] });
rx5('ikebukuro', SUB('池袋駅', 'Ikebukuro Sta.', RXL.M), rxBUS('池袋駅東口'), CH('東池袋', ['1-1', '1-12', '1-30']), { add: [['gacha', .6]] });
rx5('shibuya', SUB('渋谷駅', 'Shibuya Sta.', RXL.G), rxBUS('渋谷駅前'), CH('道玄坂', ['2-1', '2-6', '1-2']));
rx5('kabukicho', SUB('新宿三丁目駅', 'Shinjuku-sanchome Sta.', RXL.M), CH('歌舞伎町', ['1-19', '1-21', '1-6']));
rx5('tsukiji', SUB('築地駅', 'Tsukiji Sta.', RXL.H));
rx5('tokyoeki', rxBUS('東京駅丸の内南口'));
rx5('shinokubo', rxBUS('新大久保駅前'), CH('百人町', ['1-1', '1-10', '2-2']));
rx5('catst', { drop: ['busstop'] });
rx5('yanaka', CH('谷中', ['3-12', '3-9', '7-18']), { lm: [{ t: 'skytree', sc: .45, off: .3 }] });
rx5('koenji', CH('高円寺北', ['2-22', '3-1', '2-38']), { se: { summer: { crowd: 2.1 } } });
rx5('shimokita', CH('北沢', ['2-25', '2-14', '2-30']));
rx5('shibamata', { add: [['poleC', 1], ['chozu', .4]], set: { chome: ['柴又', ['7-7', '7-3', '7-12']] }, se: { winter: { crowd: 1.8 } } });
rx5('ekimae', CH('宇田川町', ['25-1', '21-6', '33-6']));
rx5('ueno', { se: { spring: { crowd: 2.2 } }, add: [['koban', .2], ['azalea', .8], ['crows', .4]] });
rx5('meguro', { se: { spring: { crowd: 2 } } });
rx5('chidori', { set: { crowd: 2 } });
rx5('sumidakoen', { set: { crowd: 1.9 } });
rx5('gyoen', { se: { spring: { crowd: 1.6 }, autumn: { leaves: 1 } }, add: [['crows', .3]] });
rx5('kichijoji', { se: { spring: { crowd: 1.6 } } });
rx5('terrace', { se: { summer: { crowd: 1.6 } } });
rx5('sland', { se: { summer: { crowd: 1.8 } } });
rx5('hie', { se: { winter: { crowd: 1.6 } } });
rx5('sando', { se: { winter: { crowd: 2.4 } } });
rx5('zojoji', { se: { winter: { crowd: 1.6 } }, add: [['ema', .3]] });
rx5('yoyogi', { add: [['crows', .5], ['azalea', .6]] });
rx5('kokyo', { add: [['azalea', .8]] });
rx5('kanda', { add: [['shinboku', .3], ['nodate', .4]] });
rx5('koishikawa', { add: [['nodate', .3]] });
rx5('kiyosumi', { lm: [{ t: 'skytree', sc: .5, off: -.3 }] });
rx5('riverside', { rx: [['life', 1, { items: ['kamo'], n: 2 }]] });
rx5('kiba', { rx: [['life', -1, { items: ['kamo'], n: 2 }]], add: [['sculpt', .4]] });
rx5('hamarikyu', { rx: [['life', 1, { items: ['kamo'], n: 2 }]] });
rx5('sfoot', { rx: [['life', 1, { items: ['kamo'], n: 1, fw: 12 }]] });
rx5('daikanyama', { se: { autumn: { leaves: 1 } } });
rx5('hawk', { rx: [['gulls', 1, { n: 2 }]] });
rx5('hawk2', { rx: [['gulls', -1, { n: 2 }]] });
/* ---- 6 回目の調べ：公園の案内図と水飲み・下町の赤いポスト・駅のホームの印・展望台から見える山や空港など ---- */
const RX_MORE6 = {};
const rx6 = (ts, part) => { for (const t of ts) { RX_MORE6[t] = RX_MORE6[t] || {}; rxMerge(RX_MORE6[t], JSON.parse(JSON.stringify(part))); } };
rx6(['hibiya', 'ueno', 'yoyogi', 'kiba', 'kichijoji', 'tfoot', 'shinobazu', 'gyoen'], { add: [['fountainS', .5]] });
rx6(['hibiya', 'ueno', 'yoyogi', 'kiba', 'kichijoji', 'gyoen', 'hamarikyu', 'kiyosumi', 'koishikawa', 'shinobazu'], { add: [['areamap', .4]] });
rx6(['yanaka', 'asakusa', 'kagurazaka', 'shibamata', 'monzen', 'ryogoku', 'kuramae'], { add: [['areamap', .4]] });
rx6(['yanaka', 'kagurazaka', 'kuramae', 'tsukishima', 'shibamata', 'monzen', 'koenji', 'jimbocho', 'ochanomizu'], { add: [['post', .5]] });
rx6(['yanaka', 'kuramae', 'monzen'], { add: [['vending', .5]] });
rx6(['koenji', 'kuramae', 'okachimachi', 'shinokubo', 'kanda'], { add: [['nobori', 1]] });
rx6(['station', 'subwayst'], { rx: [['platmarks', 1]] });
rx6(['selev', 'selev2'], { rx: [['staff', 1, { n: 1 }]] });
rx6(['toden'], { wd: ['rxStopBtn', 'rxStopBtn'] });
RX_MORE6.yamanote = { wd: ['rxWinLCD'] }; /* 山手線の新しい車両は窓の上が画面（紙のわくは外す） */
rx6(['skytree', 'sdeck'], { lm: [{ t: 'tsukuba', brg: 25, sc: .8 }] });
rx6(['sdeck'], { lm: [{ t: 'airport', brg: 190, sc: .3 }] });
rx6(['tdeck'], { lm: [{ t: 'airport', brg: 165, sc: .35 }] });
rx6(['tstair', 'tower', 'troof'], { lm: [{ t: 'skytree', brg: 46, sc: .6 }] });
rx6(['yurakucho', 'slobby'], { wd: ['rxShokasen'] }); rx6(['hozomon'], { add: [['areamap', .3]] }); rx6(['kukodeck'], { add: [['tset', .5]] });
rx6(['kaidanH', 'shiryo'], { wd: ['calendar'] }); rx6(['ehall'], { wd: ['clock'] }); rx6(['shokudo'], { add: [['plant', .6]] }); rx6(['present', 'freeaddr'], { add: [['water', .6]] });
rx6(['chidori'], { set: { sname: ['千鳥ヶ淵緑道', 'Chidorigafuchi Path'] }, add: [['sname', .4]] }); rx6(['rooftop'], { add: [['sculpt', .3]] });
rx6(['kokyo'], { set: { sname: ['内堀通り', 'Uchibori-dori'] }, add: [['sname', .4]] });
rx6(['tokyoeki'], { set: { subway: ['東京駅', 'Tokyo Sta.', RXL.M] }, add: [['subway', .5]] });
rx6(['yanaka'], { set: { subway: ['千駄木駅', 'Sendagi Sta.', RXL.C] }, add: [['subway', .4]] });
/* 表をテーマへ当てる（1 回だけ）。季節の木：新しい木の種類は、季節に合わせて色をかえる（カツラは秋に黄色、冬は葉を落とす など） */
function rxMerge(a, b) { for (const k in b) { const v = b[k]; if (Array.isArray(v)) a[k] = (a[k] || []).concat(v); else if (v && typeof v === 'object' && !Array.isArray(v) && k !== 'set' && k !== 'sw' && k !== 'fac' && k !== 'se' && k !== 'sa') a[k] = Object.assign({}, a[k] || {}, v); else if (v && typeof v === 'object' && (k === 'se' || k === 'sa')) { a[k] = Object.assign({}, a[k] || {}); for (const q in v) a[k][q] = Array.isArray(v[q]) ? (a[k][q] || []).concat(v[q]) : Object.assign({}, a[k][q] || {}, v[q]); } else if (v && typeof v === 'object') a[k] = Object.assign({}, a[k] || {}, v); else a[k] = v; } }
function rxApplyReal() { for (const M of [RX_MORE, RX_MORE3, RX_MORE4, RX_MORE5, RX_MORE6]) for (const tid in M) { RX_REAL[tid] = RX_REAL[tid] || {}; rxMerge(RX_REAL[tid], M[tid]); }
  for (const tid in RX_REAL) { const th = THEMES[tid], r = RX_REAL[tid]; if (!th) continue;
  if (r.sw && th.props) th.props = th.props.map(([t, n]) => [r.sw[t] || t, n]);
  if (r.drop && th.props) th.props = th.props.filter(([t]) => !r.drop.includes(t));
  if (r.add) th.props = (th.props || []).concat(r.add.filter(a => a[1] > 0));
  if (r.set) Object.assign(th, r.set);
  if (r.fac && th.fac) th.fac = Object.assign({}, th.fac, r.fac);
  if (r.wd && th.wdeco) th.wdeco = th.wdeco.concat(r.wd);
  if (r.rx) th.rx = (th.rx || []).concat(r.rx);
  const ts = RX_TREE_SEASON[th.tree]; if (ts && !r.noSe) { const S = SEASONAL[tid] = SEASONAL[tid] || {}; for (const se in ts) { if (th.only && !th.only.includes(se)) continue; if (S[se] && S[se].tree) continue; S[se] = Object.assign({}, S[se] || {}, { tree: ts[se] }); } }
  if (r.lm) th.lm = (th.lm || []).concat(r.lm);
  if (r.sa && ['room', 'train', 'glass'].includes(th.kind)) { for (const se in r.sa) for (const [t, n] of r.sa[se]) th.rx = (th.rx || []).concat([['put', 1, { type: t, n: Math.max(1, Math.round(n * 2)), seasons: [se] }]]); } /* 部屋は季節のテーマを作らない（部屋の base は かべの下の色で、季節のテーマの base と名前がぶつかる） */
  else if (r.sa) { const S = SEASONAL[tid] = SEASONAL[tid] || {}; for (const se in r.sa) { if (th.only && !th.only.includes(se)) continue; S[se] = Object.assign({}, S[se] || {}); S[se].props = (S[se].props || th.props || []).concat(r.sa[se]); } }
  if (r.se) { const S = SEASONAL[tid] = SEASONAL[tid] || {}; for (const se in r.se) S[se] = Object.assign({}, S[se] || {}, r.se[se]); } } }
