/* ================= 2026-11-28 舞浜の夢の遊園地「チモシー王国」（100 万点で行けるコース） ================= docs/MAIHAMA-2026-11-28.md
   オーナーの依頼（11-28）：100 万点に届いた後に、舞浜の遊園地へ行けるコース。レーンの板が無い所は落ちると谷の底へ・直角ではなく曲線で曲がる道・乗り物に乗って移動する場面。
   決まり（CLAUDE.md）：実在の会社・ブランド・他社キャラクター・ロゴ・商標は出さない。「〇〇風」の絵も作らない。
   → 舞浜（地名・駅名）にある、東京うさぎオフィスの世界だけの遊園地として作る。お城・乗り物・パレード・看板は、どこの遊園地にも似せず、うさぎと牧草（チモシー）とにんじんの形で作る。
   遊園地の「作り」（入口の広場 → 屋根のある商店街 → まん中の広場とお城 → テーマごとのエリア → 乗り物）は、本物のテーマパークの設計を調べて生かす。
   場所の本物：京葉線の東京駅のホームは地下深く・ほかのホームから数百 m 離れている／舞浜は 1975 年にできた埋立地で、駅は 1988 年に開業／駅前はヤシの並木と、リゾートを回るモノレール／
   旧江戸川をはさんだ葛西臨海公園に、高さ 117m の大きな観覧車 */
Object.assign(THEMES, {
  keiyo: { ja: '京葉線（車内）', lbl: '京葉線', en: 'Keiyo Line train', kind: 'train', len: [96, 108], road: ['#8E9AA6', '#87939F'], rpat: 'train', side: ['#87939F', '#808C98'], spat: 'train',
    wall: '#E8ECEF', base: '#C9252F', wallH: 2.9, ceil: '#DDE2E6', cpat: 'plain', light: 'strip', wdeco: ['seatwin', 'seatwin', 'door', 'seatwin', 'trainmap'], props: [['nakazuri', 2], ['seat', 4], ['strapS', 3]], obs: ['suitcase', 'bag', 'pole', 'suitcase'], course: 'maihama',
    arrive: { ja: '赤い帯の京葉線で、海ぞいを舞浜へ', en: 'The red-striped Keiyo Line, along the bay to Maihama' } },
  mstation: { ja: '舞浜駅前・ヤシの並木', lbl: '舞浜駅前', lblEn: 'Maihama Station', en: 'Maihama Station, palm avenue', kind: 'street', len: [96, 106], road: ['#E3D8C6', '#DBCFBC'], rpat: 'plaza', side: ['#CFC4B2', '#C6BBA8'], spat: 'walk', curb: '#EFE8DA',
    fac: { style: 'park' }, town: 1, flat: 1, props: [['palmT', 4], ['lampM', 2], ['benchS', 1], ['areamap', .5], ['fbed', 1]], obs: ['suitcase', 'stroller', 'cone', 'bench'], tree: 'green', course: 'maihama', face: 180, noRail: 1,
    arrive: { ja: '海をうめ立てた町、舞浜。ヤシの並木の先に、夢の遊園地', en: 'Maihama, land won from the sea. Past the palms, the dream park' } },
  mgate: { ja: 'チモシー王国・入口の広場', lbl: '入口の広場', lblEn: 'Park gate', en: 'Hay Kingdom, entrance plaza', kind: 'street', len: [92, 102], road: ['#EAD3C2', '#E3CAB8'], rpat: 'plaza', side: ['#8FBF6A', '#86B562'], spat: 'lawn', curb: '#F3E9DC',
    fac: { style: 'park' }, flat: 1, props: [['fbed', 3], ['lampPk', 2], ['benchS', 1], ['mflag', 2], ['topiary', 1]], obs: ['stroller', 'suitcase', 'cone', 'bench'], tree: 'green', course: 'maihama', face: 180, noRail: 1, park: 1,
    arrive: { ja: 'うさぎの形の花だんが目じるし。ここから夢の国', en: 'A bunny-shaped flower bed marks the gate' } },
  marcade: { ja: 'チモシー王国・ガラス屋根の商店街', lbl: 'ガラス屋根の商店街', lblEn: 'Glass arcade', en: 'Hay Kingdom, glass-roofed arcade', kind: 'room', len: [92, 102], road: ['#D9C7B0', '#D2BFA7'], rpat: 'plaza', side: ['#CDBBA3', '#C6B39B'], spat: 'plaza',
    wall: '#F3E3CF', base: '#7FA88E', wallH: 5.4, ceil: '#DCEBF5', cpat: 'arcade', light: 'bulb', wdeco: ['mshop', 'mshop', 'mshop', 'mshopB'], props: [['lampPk', 2], ['mwagon', 1], ['benchS', 1], ['plant', 1]], obs: ['stroller', 'suitcase', 'bag', 'cone'], course: 'maihama', face: 180, park: 1,
    arrive: { ja: '雨の日もぬれない、ガラスの屋根の商店街', en: 'A shopping street under glass, dry on rainy days' } },
  mplaza: { ja: 'チモシー王国・お城の広場', lbl: 'お城の広場', lblEn: 'Castle plaza', en: 'Hay Kingdom, castle plaza', kind: 'street', len: [100, 110], road: ['#E9D9C8', '#E2D0BE'], rpat: 'plaza', side: ['#8FBF6A', '#86B562'], spat: 'lawn', curb: '#F3E9DC',
    fac: { style: 'park' }, flat: 1, props: [['lampPk', 2], ['benchS', 1], ['fbed', 2], ['mwagon', 1], ['mballoon', 1], ['topiary', 1]], obs: ['stroller', 'bench', 'cone', 'suitcase'], tree: 'green', course: 'maihama', face: 180, noRail: 1, park: 1,
    arrive: { ja: 'まん中の広場。にんじんの塔のお城が見える', en: 'The central plaza, with the carrot-spired castle ahead' } },
  /* 冒険の谷のつり橋：板の無いレーンは、落ちると谷の底へ。短い道を少しずつ向きを変えてつなぎ、曲線で曲がる（void：ふつうの床・かべを作らず、src/6f_void.js が板の橋を作る） */
  mvalley: { ja: 'チモシー王国・冒険の谷のつり橋', lbl: '冒険の谷', lblEn: 'Adventure valley', en: 'Hay Kingdom, valley rope bridge', kind: 'deck', len: [58, 64], road: ['#B9895A', '#AF8052'], rpat: 'boards', side: ['#B9895A', '#AF8052'], spat: 'boards',
    props: [], obs: [], noObs: 1, course: 'maihama', face: 180, void: { pits: 1 }, park: 1, noRail: 1,
    arrive: { ja: '板のあるレーンだけを走れ！ 落ちたら谷の底', en: 'Stay on the planks! Miss them and it’s a long way down' } },
  mcurve: { ja: 'チモシー王国・谷をまわる橋', lbl: '谷をまわる橋', lblEn: 'Valley curve', en: 'Hay Kingdom, curving bridge', kind: 'deck', len: [13, 13], road: ['#B9895A', '#AF8052'], rpat: 'boards', side: ['#B9895A', '#AF8052'], spat: 'boards',
    props: [], obs: [], noObs: 1, course: 'maihama', face: 180, void: { pits: 0 }, park: 1, noRail: 1 },
  /* トロッコ：乗り物に乗って移動する（オオタカと同じく、乗っている間は操作しない。山と谷をこえ、曲線で曲がる） */
  mcart: { ja: 'チモシー王国・にんじん山のトロッコ', lbl: 'トロッコ', lblEn: 'Mine cart', en: 'Hay Kingdom, carrot-mountain mine cart', kind: 'deck', len: [26, 26], road: ['#6B5A48', '#645342'], rpat: 'boards', side: ['#6B5A48', '#645342'], spat: 'boards',
    props: [], obs: [], noObs: 1, course: 'maihama', face: 180, void: { pits: 0, rail: 1 }, ride: 'cart', park: 1, noRail: 1,
    arrive: { ja: 'トロッコに乗って、山と谷をひとっ走り', en: 'All aboard the mine cart, over hill and valley' } },
  mcastle: { ja: 'チモシー王国・お城への橋', lbl: 'お城への橋', lblEn: 'Castle bridge', en: 'Hay Kingdom, bridge to the castle', kind: 'street', len: [96, 106], road: ['#E9D9C8', '#E2D0BE'], rpat: 'plaza', side: ['#8FBF6A', '#86B562'], spat: 'lawn', curb: '#F3E9DC',
    fac: { style: 'park' }, flat: 1, props: [['lampPk', 3], ['fbed', 2], ['mflag', 2], ['benchS', 1]], obs: ['stroller', 'bench', 'cone'], tree: 'green', course: 'maihama', face: 180, noRail: 1, park: 1,
    arrive: { ja: 'お城の門へ。夜は花火があがる', en: 'On to the castle gate. Fireworks at night' } },
});
/* 100 万点で始まる。曲線：mcurve を 6 本、15 度ずつ（bend 1/6 ＝ 90 度の 6 分の 1）つないで、90 度をなめらかに回る。straightOut＝角の無いつなぎ目 */
{ const B = (n, sg) => Array.from({ length: n }, () => ({ t: 'mcurve', d: .4, straightOut: 1, bend: sg / 6, cont: 1 })), CART = (n, sg) => Array.from({ length: n }, (_, i) => ({ t: 'mcart', d: .5, straightOut: 1, bend: sg ? sg / 6 : 0, cont: i > 0 ? 1 : 0 }));
  COURSES.maihama = { at: 1000000, ja: '舞浜の夢の遊園地へ！', en: 'To the dream park in Maihama!', steps: [
    { t: 'keiyo', d: 8, line: ['八丁堀', '新木場', '葛西臨海公園', '舞浜'] }, { t: 'mstation', d: 6, turn: 1 }, { t: 'mgate', d: 6, turn: -1 }, { t: 'marcade', d: 7, straightOut: 1 }, { t: 'mplaza', d: 8, straightOut: 1 },
    { t: 'mvalley', d: 5, straightOut: 1 }, ...B(6, 1), { t: 'mvalley', d: 5, straightOut: 1, cont: 1 }, ...B(6, -1), { t: 'mvalley', d: 5, straightOut: 1, cont: 1 },
    ...[...CART(3, 0), ...CART(6, -1), ...CART(3, 0), ...CART(6, 1), ...CART(2, 0)].map((x, i) => Object.assign(x, { cont: i > 0 ? 1 : 0 })), /* トロッコは 20 本でひと続き（高さの表 MV_CART_H の 20 個と同じ数。最後は地面の高さ） */
    { t: 'mcastle', d: 8, straightOut: 1 }, { t: 'mplaza', d: 6 }, { t: 'mstation', d: 5 }, { t: 'keiyo', d: 8, line: ['葛西臨海公園', '新木場', '八丁堀', '東京'] }] }; }
Object.assign(STATION_EN, { '八丁堀': 'Hatchobori', '新木場': 'Shin-Kiba', '葛西臨海公園': 'Kasai-Rinkai Park', '舞浜': 'Maihama', '東京': 'Tokyo' });
