/* ================= places =================
   kind: room (walls + ceiling), street (sidewalks + building facades), deck (open air, railings, view), train, glass
   fac: facade style for streets. props: furniture / street furniture in the side zones. */
const TREE = { green: ['#5F9E5A', '#4C8A48', '#7DB46A'], ginkgo: ['#E8B923', '#F2CD45', '#D9A21B'], sakura: ['#F4C6D2', '#EFB3C3', '#F9DCE4'], fresh: ['#8CC26A', '#A3D07C', '#79B25C'], bare: ['#6B5A50'], pine: ['#2F5A3A', '#3B6B45', '#27503A'], zelkova: ['#6FA35A', '#5F9450', '#88B86E'] };
const THEMES = {
  /* ---- the boss's house ---- */
  titleroom: { ja: '課長の家・寝室', en: "The boss's bedroom", kind: 'room', len: [26, 26], road: ['#D6C98A', '#CEBF7E'], rpat: 'tatami', side: ['#D2C483', '#C9BA77'], spat: 'tatami',
    wall: '#EFE6D2', base: '#8A6A48', wallH: 3.0, ceil: '#B49A78', cpat: 'wood', light: 'round', wdeco: ['shoji'], backW: 5.2, backAt: -1.6, props: [], obs: [], hidden: 1 },
  bedroom:  { ja: '課長の家・寝室', en: "The boss's bedroom", kind: 'room', len: [62, 72], road: ['#D6C98A', '#CEBF7E'], rpat: 'tatami', side: ['#D2C483', '#C9BA77'], spat: 'tatami',
    wall: '#EFE6D2', base: '#8A6A48', wallH: 3.0, ceil: '#B49A78', cpat: 'wood', light: 'round', wdeco: ['shoji', 'shoji', 'fusuma', 'tokonoma', 'calendar'], props: [['tansu', 2], ['futon', 2], ['andon', 2], ['zabutonS', 2], ['papersS', 2]], obs: ['zabuton', 'clock', 'chabudai', 'futon', 'box', 'papers'] },
  hall:     { ja: '課長の家・廊下', en: "The boss's hallway", kind: 'room', len: [60, 70], road: ['#B98A5A', '#B08152'], rpat: 'boards', side: ['#B08152', '#A87A4C'], spat: 'boards',
    wall: '#F1E7D6', base: '#6B4631', wallH: 2.9, ceil: '#E9DFCC', cpat: 'plain', light: 'round', wdeco: ['window', 'frame', 'fusuma', 'window'], props: [['shelf', 2], ['plant', 2], ['boxesS', 2], ['umbrellaS', 1]], obs: ['box', 'slipper', 'roomba', 'roomba', 'papers'] },
  living:   { ja: '課長の家・リビング', en: "The boss's living room", kind: 'room', len: [62, 72], road: ['#C49A6C', '#BB9163'], rpat: 'boards', side: ['#B5503F', '#AA4A3A'], spat: 'rug',
    wall: '#F3E8DA', base: '#7A5A48', wallH: 3.0, ceil: '#EFE6D8', cpat: 'plain', light: 'round', wdeco: ['window', 'frame', 'window', 'calendar'], props: [['sofa', 2], ['tvstand', 2], ['shelf', 2], ['plant', 2], ['lampS', 1]], obs: ['chabudai', 'zabuton', 'box', 'toys', 'papers'] },
  kitchen:  { ja: '課長の家・台所', en: "The boss's kitchen", kind: 'room', len: [60, 68], road: ['#E9E2D4', '#DCD3C2'], rpat: 'grid', side: ['#DCD3C2', '#D2C8B6'], spat: 'grid',
    wall: '#FBF6EE', base: '#9A7F5A', wallH: 2.9, ceil: '#F3EEE6', cpat: 'plain', light: 'panel', wdeco: ['window', 'window'], props: [['counter', 3], ['fridge', 1], ['rack', 2]], obs: ['table', 'pot', 'noren', 'box'] },
  genkan:   { ja: '課長の家・玄関', en: "The boss's entryway", kind: 'room', len: [56, 64], road: ['#9A9890', '#8F8D85'], rpat: 'stone', side: ['#8F8D85', '#86847C'], spat: 'stone',
    wall: '#EAD7BE', base: '#6B4631', wallH: 3.0, ceil: '#D9C6AA', cpat: 'wood', light: 'round', wdeco: ['frame', 'window'], props: [['getabako', 3], ['umbrellaS', 2], ['plant', 1]], obs: ['shoes', 'umbrella', 'step', 'box'] },
  /* ---- commute ---- */
  street:   { ja: '住宅街', en: 'Quiet neighborhood', kind: 'street', len: [92, 110], road: ['#76777C', '#707176'], rpat: 'road', side: ['#B8B2A6', '#B0AA9E'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'house', h: [6, 9], pal: ['#EFE6D6', '#E2D6C2', '#D6CDBF', '#C9BFAF', '#E9E2D5', '#BFB6A6'] }, props: [['pole', 3], ['vending', 2], ['tree', 2], ['post', 1], ['bikes', 1], ['hedge', 2]], obs: ['cone', 'kick', 'bags', 'cone', 'car'], lm: [{ t: 'fuji', sc: .6, off: .3 }, { t: 'tower', sc: .45 }], tree: 'green' },
  station:  { ja: '駅のホーム', en: 'Station platform', kind: 'room', len: [80, 92], road: ['#C8C8C2', '#BDBDB6'], rpat: 'platform', side: ['#BDBDB6', '#B4B4AD'], spat: 'grid',
    wall: '#E4E4DE', base: '#6E7B88', wallH: 3.6, ceil: '#9AA3AC', cpat: 'beams', light: 'strip', wdeco: ['stationsign', 'poster', 'timetable', 'poster'], leftWall: 'trainside', props: [['pillarS', 3], ['benchS', 2], ['kiosk', 1]], obs: ['pillar', 'cone', 'suitcase', 'bag'] },
  yamanote: { ja: '山手線（車内）', en: 'Yamanote Line train', kind: 'train', len: [96, 108], road: ['#8E9AA6', '#87939F'], rpat: 'train', side: ['#87939F', '#808C98'], spat: 'train',
    wall: '#E8ECEF', base: '#80C241', wallH: 2.9, ceil: '#DDE2E6', cpat: 'plain', light: 'strip', wdeco: ['seatwin', 'seatwin', 'door', 'seatwin', 'trainmap'], props: [['nakazuri', 2], ['seat', 4], ['strapS', 3]], obs: ['pole', 'suitcase', 'bag', 'papers'],
    stamp: { k: '山手', ja: '山手線', en: 'Yamanote Line', note: { ja: '東京の中心をぐるっと回る環状線。ウグイス色のラインが目印。', en: 'The loop line around central Tokyo, known by its pale green stripe.' } } },
  tokyoeki: { ja: '東京駅・丸の内駅舎', en: 'Tokyo Station, Marunouchi', kind: 'street', len: [96, 110], road: ['#C9C2B6', '#BFB8AB'], rpat: 'plaza', side: ['#BDB5A7', '#B3AB9D'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'station', h: [13, 13], left: 'station', right: 'glass', pal: ['#B5533C'], pal2: ['#9FB4C6', '#8FA6BA', '#B4C3D1'] }, props: [['lampC', 3], ['tree', 2], ['benchS', 1]], obs: ['plant', 'bench', 'kick', 'cone'], tree: 'green',
    stamp: { k: '駅舎', ja: '東京駅 丸の内駅舎', en: 'Tokyo Station', note: { ja: '赤レンガの駅舎。2012年に創建時の姿に復原された。', en: 'The red-brick station building, restored to its original look in 2012.' } } },
  /* ---- the office ---- */
  lobby:    { ja: 'オフィス受付', en: 'Office lobby', kind: 'room', len: [66, 76], road: ['#D9D2C6', '#CFC7BA'], rpat: 'grid', side: ['#CFC7BA', '#C5BDB0'], spat: 'grid',
    wall: '#F2EEE6', base: '#46525E', wallH: 3.6, ceil: '#E9E5DD', cpat: 'plain', light: 'panel', wdeco: ['citywin', 'plantwall', 'citywin', 'frame'], props: [['plant', 2], ['sofaO', 1], ['gateS', 1]], obs: ['plant', 'ogates', 'box'] },
  desk:     { ja: '執務室', en: 'Office floor', kind: 'room', len: [80, 92], road: ['#7F8C99', '#77848F'], rpat: 'carpet', side: ['#77848F', '#707D88'], spat: 'carpet',
    wall: '#EEF1F3', base: '#46525E', wallH: 3.0, ceil: '#F0F2F4', cpat: 'grid', light: 'panel', wdeco: ['citywin', 'calendar', 'whiteboard', 'clock', 'citywin'], props: [['desk', 5], ['cabinet', 1], ['plant', 1], ['water', 1]], obs: ['papers', 'paperTall', 'chair', 'box', 'mug'] },
  meeting:  { ja: '会議室', en: 'Meeting room', kind: 'room', len: [72, 82], road: ['#6E7B88', '#66737F'], rpat: 'carpet', side: ['#66737F', '#606D79'], spat: 'carpet',
    wall: '#E9EDF0', base: '#46525E', wallH: 3.0, ceil: '#ECEFF1', cpat: 'grid', light: 'panel', wdeco: ['screen', 'citywin', 'clock', 'citywin'], props: [['mchairs', 4], ['plant', 1]], obs: ['mtable', 'wboard', 'chair', 'papers'] },
  kyuto:    { ja: '給湯室', en: 'Office pantry', kind: 'room', len: [64, 72], road: ['#E3E8EC', '#D7DDE2'], rpat: 'grid', side: ['#D7DDE2', '#CDD3D9'], spat: 'grid',
    wall: '#F7F9FA', base: '#9AA9B6', wallH: 2.9, ceil: '#F4F6F7', cpat: 'plain', light: 'panel', wdeco: ['citywin', 'poster'], props: [['counter', 2], ['fridge', 1], ['water', 1]], obs: ['mug', 'mug', 'box', 'pot'] },
  copy:     { ja: 'コピー室', en: 'Copy room', kind: 'room', len: [64, 72], road: ['#D6D9DC', '#CBCED2'], rpat: 'grid', side: ['#CBCED2', '#C1C5C9'], spat: 'grid',
    wall: '#F0F2F4', base: '#6E7B88', wallH: 2.9, ceil: '#EEF0F2', cpat: 'grid', light: 'panel', wdeco: ['poster', 'clock', 'citywin'], props: [['copierS', 2], ['cabinet', 2], ['boxesS', 2]], obs: ['copier', 'papers', 'paperTall', 'box'] },
  deadline: { ja: '執務室・締め切り前', en: 'Office floor: deadline', kind: 'room', len: [96, 106], road: ['#7F8C99', '#77848F'], rpat: 'carpet', side: ['#77848F', '#707D88'], spat: 'carpet',
    wall: '#EEF1F3', base: '#46525E', wallH: 3.0, ceil: '#F0F2F4', cpat: 'grid', light: 'panel', wdeco: ['citywin', 'calendar', 'clock', 'citywin'], props: [['desk', 5], ['papersS', 3]], obs: ['papers', 'paperTall', 'papers', 'chair', 'box'], rush: 1 },
  /* ---- lunch ---- */
  ginza:    { ja: '銀座・中央通り', en: 'Ginza, Chuo-dori', kind: 'street', len: [100, 112], road: ['#8E8C88', '#87857F'], rpat: 'hokoten', side: ['#C9C1B2', '#BFB7A8'], spat: 'walk', curb: '#E6E2DA',
    fac: { style: 'luxury', h: [20, 34], pal: ['#E8E1D3', '#D9D0BF', '#C9C3B8', '#9FB4C6', '#E3DACA', '#BDB3A3'] }, props: [['lampC', 3], ['tree', 2], ['flowers', 2]], obs: ['parasol', 'bench', 'flowers', 'cone', 'supercar'], lm: [{ t: 'clock', sc: 1, off: .18 }], tree: 'green',
    stamp: { k: '銀座', ja: '銀座', en: 'Ginza', note: { ja: '週末・祝日の午後、中央通りは歩行者天国になり、車道を歩ける。', en: 'On weekend and holiday afternoons Chuo-dori becomes a pedestrian street.' } } },
  yurakucho:{ ja: '有楽町ガード下', en: 'Yurakucho, under the tracks', kind: 'room', len: [92, 104], road: ['#6E6A63', '#67635C'], rpat: 'stone', side: ['#615D56', '#5A5650'], spat: 'stone',
    wall: '#9A4A36', wpat: 'bricks', base: '#4A2A20', wallH: 3.4, ceil: '#3A3A3E', cpat: 'girder', light: 'bulb', wdeco: ['izakaya', 'izakaya', 'izakaya', 'menu'], props: [['crates', 2], ['stools', 2], ['chochin', 3]], obs: ['crate', 'crate', 'stoolsO', 'noren'], rumble: 1,
    stamp: { k: '有楽', ja: '有楽町ガード下', en: 'Yurakucho', note: { ja: '線路の高架下に、レンガのアーチと飲み屋が並ぶ。', en: 'Brick arches and small bars under the elevated tracks.' } } },
  /* ---- evening, east ---- */
  asakusa:  { ja: '浅草・雷門と仲見世', en: 'Asakusa, Kaminarimon', kind: 'street', len: [104, 116], road: ['#B9AE9C', '#AFA392'], rpat: 'stone', side: ['#A89C88', '#9F937F'], spat: 'stone',
    fac: { style: 'nakamise', h: [4.5, 6], pal: ['#C9432F', '#B83B29', '#D04A33'] }, props: [['chochin', 4], ['stoneLantern', 1], ['rickshawP', 1]], obs: ['kaminarimon', 'rickshaw', 'bench', 'jokoro'], lm: [{ t: 'skytree', sc: 1.05, off: .22 }, { t: 'pagoda', sc: .9, off: -.12 }], first: 'kaminarimon',
    stamp: { k: '雷門', ja: '雷門', en: 'Kaminarimon', note: { ja: '浅草寺の入口の門。大きな赤い提灯が目印。', en: 'The gate of Senso-ji temple, famous for its giant red lantern.' } } },
  river:    { ja: '隅田川・水上バス', en: 'Sumida River water bus', kind: 'deck', len: [104, 116], road: ['#EDEAE3', '#E2DED5'], rpat: 'planks', side: ['#2E6E99', '#2A6690'], spat: 'water', view: 'river', rail: '#F3F3F3',
    props: [['buoyS', 1]], obs: ['bridge', 'ring', 'bench', 'bridge', 'rope'], lm: [{ t: 'skytree', sc: 1.4, off: .15 }, { t: 'kokugikan', sc: 1, off: -.28 }],
    stamp: { k: '隅田', ja: '隅田川', en: 'Sumida River', note: { ja: '水上バスで、色とりどりの橋をくぐって進む。', en: 'The water bus glides under a series of colorful bridges.' } } },
  skytree:  { ja: '押上の電波塔・展望回廊', lbl: '押上の電波塔', lblEn: 'Oshiage tower', en: 'Oshiage tower, sky walkway', kind: 'glass', len: [108, 118], road: ['#E3E7EB', '#D9DEE3'], rpat: 'grid', side: ['#D9DEE3', '#CFD5DB'], spat: 'grid', climb: [350, 450], view: 'city',
    props: [['scopeS', 1]], obs: ['telescope', 'bench', 'rope', 'suitcase'], lm: [{ t: 'fuji', sc: 1, off: .3 }, { t: 'tower', sc: .5, off: -.25 }],
    stamp: { k: '634', ja: '押上の電波塔', en: 'Oshiage tower', note: { ja: '高さ634mの電波塔。展望回廊は地上約450m。', en: 'A 634 m broadcasting tower. Its sky walkway is about 450 m up.' } } },
  /* ---- evening, west ---- */
  shibuya:  { ja: '渋谷スクランブル交差点', lbl: '渋谷', lblEn: 'Shibuya', en: 'Shibuya Scramble Crossing', kind: 'street', len: [100, 112], road: ['#5E5E63', '#59595E'], rpat: 'scramble', side: ['#A8A49C', '#A09C94'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'neon', mood: 'shibuya', h: [16, 30], pal: ['#8A8F99', '#6E7480', '#9AA0AA', '#7A7F88', '#B0B4BA'], screen: .8, vsign: .5 }, props: [['signal', 2], ['pole', 1], ['guard', 2]], obs: ['cone', 'kick', 'sign', 'barrier', 'car'], lm: [{ t: 'cyl', sc: 1, off: .22 }],
    stamp: { k: '渋谷', ja: '渋谷スクランブル交差点', en: 'Shibuya Crossing', note: { ja: '青信号で、四方八方から人がいっせいに渡る。', en: 'When the lights turn green, people cross from every direction at once.' } } },
  tower:    { ja: '芝公園の赤い電波塔・外階段', lbl: '赤い電波塔', lblEn: 'Red tower', en: 'Red tower in Shiba, outdoor stairs', kind: 'deck', len: [108, 118], road: ['#9AA0A6', '#90969C'], rpat: 'stairs', side: ['#8A9096', '#80868C'], spat: 'stairs', climb: [0, 150], view: 'city', rail: '#D9452B', beams: '#D9452B',
    props: [], obs: ['cone', 'bench', 'suitcase', 'rope'], lm: [{ t: 'skytree', sc: .55, off: .25 }, { t: 'fuji', sc: .9, off: -.3 }],
    stamp: { k: '333', ja: '芝公園の赤い電波塔', en: 'Red tower in Shiba', note: { ja: '高さ333mの電波塔。外階段は約600段で、地上150mの展望台まで続く。', en: 'A 333 m broadcasting tower. About 600 outdoor steps lead up to the deck at 150 m.' } } },
  /* ---- evening, day 2+ ---- */
  akihabara:{ ja: '秋葉原・電気街', en: 'Akihabara Electric Town', kind: 'street', len: [100, 112], road: ['#6A6A70', '#646469'], rpat: 'road', side: ['#A5A097', '#9D988F'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'neon', mood: 'akiba', h: [12, 24], pal: ['#7A7F88', '#E8E4DC', '#8A8F99', '#C9C5BD', '#6E7480'], screen: .6, vsign: .85 }, props: [['vending', 2], ['gacha', 2], ['signal', 1], ['pole', 1]], obs: ['gachaO', 'box', 'cone', 'sign', 'kick'],
    stamp: { k: '秋葉', ja: '秋葉原', en: 'Akihabara', note: { ja: '電気街。家電やゲーム、アニメのお店が集まる。', en: 'Electric Town: electronics, games and anime shops.' } } },
  ueno:     { ja: '上野公園・イチョウ並木', en: 'Ueno Park ginkgo avenue', kind: 'street', len: [104, 116], road: ['#C8B58F', '#BFAC86'], rpat: 'gravel', side: ['#D9B84A', '#D1AF42'], spat: 'leaves', curb: '#8A7A5A',
    fac: { style: 'park' }, props: [['tree', 6], ['benchS', 1], ['lampC', 2]], obs: ['bench', 'cone', 'leafpile', 'stoneLanternO'], tree: 'ginkgo', leaves: 1, lm: [{ t: 'skytree', sc: .7, off: .2 }],
    stamp: { k: '上野', ja: '上野公園', en: 'Ueno Park', note: { ja: '美術館や動物園が集まる大きな公園。秋はイチョウが黄色に色づく。', en: 'A big park full of museums and a zoo. The ginkgo trees turn yellow in autumn.' } } },
  shinjuku: { ja: '西新宿・高層ビル街', lblEn: 'West Shinjuku', en: 'West Shinjuku skyscrapers', kind: 'street', len: [100, 112], road: ['#6E6F74', '#68696E'], rpat: 'road', side: ['#B9B5AD', '#B1ADA5'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'glass', h: [40, 90], pal: ['#7F95A8', '#91A6B8', '#6E8498', '#A3B5C4', '#5E7488'] }, props: [['tree', 2], ['lampC', 2], ['hedge', 2]], obs: ['cone', 'barrier', 'plant', 'kick', 'car', 'car', 'supercar'], lm: [{ t: 'fuji', sc: .8, off: -.28 }, { t: 'tocho', sc: 1, off: .15 }], tree: 'green',
    stamp: { k: '新宿', ja: '西新宿', en: 'West Shinjuku', note: { ja: '高層ビルが立ち並ぶ。東京都庁もここにある。', en: 'A forest of skyscrapers, including the Tokyo Metropolitan Government Building.' } } },
  odaiba:   { ja: 'お台場の吊り橋', lblEn: 'Odaiba bridge', en: 'Odaiba suspension bridge', kind: 'deck', len: [112, 122], road: ['#6E6F74', '#68696E'], rpat: 'road', side: ['#2B5F86', '#285A80'], spat: 'water', view: 'sea', rail: '#E9EEF2',
    props: [], obs: ['cone', 'barrier', 'car', 'car', 'kick', 'supercar'], lm: [{ t: 'fuji', sc: .9, off: .32 }, { t: 'tower', sc: .8, off: -.2 }], bridge: 1,
    stamp: { k: '吊橋', ja: 'お台場の吊り橋', en: 'Odaiba bridge', note: { ja: '芝浦とお台場を結ぶ吊り橋。夜はライトアップされる。', en: 'The suspension bridge between Shibaura and Odaiba, lit up at night.' } } },
  /* ---- added from the Tokyo sightseeing guide ---- */
  kokyo:    { ja: '皇居外苑・二重橋', en: 'Imperial Palace, Nijubashi', kind: 'street', len: [104, 116], road: ['#D9CBA8', '#D1C29E'], rpat: 'gravel', side: ['#7FA35E', '#77995A'], spat: 'lawn', curb: '#B9B2A5',
    fac: { style: 'park' }, moat: -1, props: [['tree', 4], ['lampC', 2]], obs: ['bench', 'cone', 'stoneLanternO', 'leafpile'], tree: 'pine', lm: [{ t: 'yagura', sc: 1, off: -.32 }, { t: 'nijubashi', sc: 1, off: -.2 }],
    stamp: { k: '皇居', ja: '皇居外苑', en: 'Imperial Palace', note: { ja: 'お堀と石垣、黒松の広場。二重橋の奥に伏見櫓が見える。', en: 'Moats, stone walls and black pines, with the Fushimi-yagura turret beyond Nijubashi bridge.' } } },
  nakadori: { ja: '丸の内仲通り', en: 'Marunouchi Naka-dori', kind: 'street', len: [100, 112], road: ['#B9A88C', '#B1A084'], rpat: 'brickroad', side: ['#C9C1B2', '#BFB7A8'], spat: 'walk', curb: '#E6E2DA',
    fac: { style: 'luxury', h: [24, 40], pal: ['#D9D0BF', '#C9C3B8', '#9FB4C6', '#E3DACA', '#BDB3A3'] }, props: [['tree', 5], ['lampC', 2], ['benchS', 1]], obs: ['bench', 'flowers', 'cone', 'parasol'], tree: 'illum', lm: [{ t: 'tower', sc: .45, off: .3 }],
    stamp: { k: '仲通', ja: '丸の内仲通り', en: 'Naka-dori', note: { ja: '石畳と街路樹の通り。冬は木々がシャンパンゴールドの光で飾られる。', en: 'A tree-lined stone-paved street, lit with champagne-gold lights in winter.' } } },
  gaien:    { ja: '神宮外苑いちょう並木', lbl: '外苑いちょう並木', lblEn: 'Gaien ginkgo', en: 'Jingu Gaien ginkgo avenue', kind: 'street', len: [104, 116], road: ['#7A7B80', '#74757A'], rpat: 'road', side: ['#D9B84A', '#D1AF42'], spat: 'leaves', curb: '#D9D6CE',
    fac: { style: 'park' }, props: [['coneTree', 8]], obs: ['leafpile', 'cone', 'bench', 'kick', 'car'], tree: 'ginkgo', leaves: 1, lm: [{ t: 'gallery', sc: 1, off: 0 }],
    stamp: { k: '外苑', ja: '神宮外苑いちょう並木', en: 'Gaien ginkgo avenue', note: { ja: '円すい形に刈られたイチョウが4列に並び、秋は黄金色のトンネルになる。', en: 'Four rows of cone-trimmed ginkgo trees turn into a golden tunnel in autumn.' } } },
  ameyoko:  { ja: '上野・アメ横', lbl: 'アメ横', en: 'Ueno Ameyoko', kind: 'street', len: [100, 112], road: ['#8E8C88', '#87857F'], rpat: 'stone', side: ['#8F8D85', '#86847C'], spat: 'stone', curb: '#B9B2A5',
    fac: { style: 'market', left: 'viaduct', h: [5, 8], pal: ['#E9E2D5', '#D6CDBF', '#C9BFAF', '#F3E8DA'] }, props: [['stall', 5], ['chochin', 2]], obs: ['crate', 'box', 'sign', 'stoolsO'], gate: 'アメ横', rumble: 1,
    stamp: { k: 'アメ', ja: 'アメ横', en: 'Ameyoko', note: { ja: '高架線路沿いにお店がぎっしり並ぶ商店街。乾物や果物を売る威勢のいい呼び込みでにぎやか。', en: 'A packed market street along the elevated tracks, loud with shop calls.' } } },
  kabukicho:{ ja: '新宿・歌舞伎町', lbl: '歌舞伎町', en: 'Shinjuku Kabukicho', kind: 'street', len: [100, 112], road: ['#5A5A60', '#55555B'], rpat: 'road', side: ['#8F8B84', '#88847D'], spat: 'walk', curb: '#B9B2A5',
    fac: { style: 'neon', mood: 'kabuki', h: [14, 32], pal: ['#6E7480', '#7A7F88', '#5E6470', '#8A8F99'], screen: .5, vsign: .95 }, props: [['signal', 1], ['vending', 2], ['pole', 1]], obs: ['cone', 'sign', 'barrier', 'box', 'kick'], gate: '歌舞伎町', gateColor: '#C8263C',
    stamp: { k: '歌舞', ja: '歌舞伎町', en: 'Kabukicho', note: { ja: '赤いゲートとネオンの街。夜になるほど色とりどりに光る。', en: 'The red gate and a sea of neon that grows brighter as night falls.' } } },
  omotesando:{ ja: '表参道・原宿', en: 'Omotesando & Harajuku', kind: 'street', len: [100, 112], road: ['#7A7B80', '#74757A'], rpat: 'road', side: ['#C9C1B2', '#BFB7A8'], spat: 'walk', curb: '#E6E2DA',
    fac: { style: 'luxury', h: [10, 22], pal: ['#E8E1D3', '#9FB4C6', '#D9D0BF', '#F3EEE6', '#BDB3A3', '#8A8F99'] }, props: [['bigTree', 4], ['lampC', 1], ['flowers', 1]], obs: ['bench', 'flowers', 'cone', 'kick', 'car', 'supercar'], tree: 'zelkova',
    stamp: { k: '表参', ja: '表参道', en: 'Omotesando', note: { ja: 'ケヤキ並木の大通り。明治神宮へ続く参道として生まれた。', en: 'A zelkova-lined boulevard that began as the approach to Meiji Jingu shrine.' } } },
  chidori:  { ja: '千鳥ヶ淵の桜', lblEn: 'Chidorigafuchi', en: 'Chidorigafuchi cherry blossoms', kind: 'street', len: [108, 120], road: ['#CDBFAE', '#C6B8A6'], rpat: 'petalstone', side: ['#B7A797', '#AE9E8E'], spat: 'petals', curb: '#9A9384',
    fac: { style: 'park' }, moat: -1, props: [['bonbori', 4], ['benchS', 1]], obs: ['picnic', 'picnic', 'tripod', 'bench', 'cone', 'stroller'], tree: 'sakura', petals: 1, only: ['spring'], boats: 1, lm: [{ t: 'tower', sc: .38, off: .34 }],
    stamp: { k: '千鳥', ja: '千鳥ヶ淵', en: 'Chidorigafuchi', note: { ja: '皇居のお堀に沿って約700mの桜並木。満開の枝が水面に垂れ、ボートで花の下をくぐれる。夜はぼんぼりで夜桜に。', en: 'About 700 m of cherry trees along the palace moat. Blossoms hang over the water, boats glide beneath, and paper lanterns light them at night.' } } },
};
// Yamanote stations in loop order
const YAMANOTE = ['東京', '有楽町', '新橋', '浜松町', '田町', '高輪ゲートウェイ', '品川', '大崎', '五反田', '目黒', '恵比寿', '渋谷', '原宿', '代々木', '新宿', '新大久保', '高田馬場', '目白', '池袋', '大塚', '巣鴨', '駒込', '田端', '西日暮里', '日暮里', '鶯谷', '上野', '御徒町', '秋葉原', '神田'];
const YAMANOTE_EN = ['Tokyo', 'Yurakucho', 'Shimbashi', 'Hamamatsucho', 'Tamachi', 'Takanawa Gateway', 'Shinagawa', 'Osaki', 'Gotanda', 'Meguro', 'Ebisu', 'Shibuya', 'Harajuku', 'Yoyogi', 'Shinjuku', 'Shin-Okubo', 'Takadanobaba', 'Mejiro', 'Ikebukuro', 'Otsuka', 'Sugamo', 'Komagome', 'Tabata', 'Nishi-Nippori', 'Nippori', 'Uguisudani', 'Ueno', 'Okachimachi', 'Akihabara', 'Kanda'];
const ARRIVE = {
  yamanote: { ja: 'ウグイス色の山手線で移動', en: 'Hop on the pale-green Yamanote Line' },
  tokyoeki: { ja: '赤レンガの東京駅。会社はすぐそこ', en: 'Red-brick Tokyo Station. The office is close' },
  ginza: { ja: '歩行者天国でランチへ', en: 'Lunch on the pedestrian street' }, yurakucho: { ja: '電車が頭の上を走るガード下', en: 'Trains rumble overhead' },
  asakusa: { ja: '雷門の大提灯はスライディングでくぐる', en: 'Slide under the giant lantern' }, river: { ja: '水上バスで橋をくぐって進む', en: 'Duck under the bridges' },
  skytree: { ja: '展望回廊、地上450mへ', en: 'Up to the sky walkway, 450 m' }, shibuya: { ja: 'スクランブル交差点を駆けぬける', en: 'Dash across the scramble' },
  tower: { ja: '外階段 約600段、地上150mの展望台へ', en: 'About 600 steps to the 150 m deck' }, akihabara: { ja: '電気街のネオンの中へ', en: 'Into the neon of Electric Town' },
  ueno: { ja: '黄色いイチョウ並木', en: 'Under the yellow ginkgo trees' }, shinjuku: { ja: '高層ビルの谷間を走る', en: 'Through the canyon of towers' }, odaiba: { ja: '海の上の吊り橋を渡る', en: 'Across the bridge over the bay' },
  kokyo: { ja: 'お堀の向こうに二重橋と伏見櫓', en: 'Nijubashi and the old turret across the moat' }, nakadori: { ja: '街路樹の光のトンネル', en: 'A tunnel of tree lights' },
  gaien: { ja: '黄金色のいちょう並木', en: 'A golden avenue of ginkgo' }, ameyoko: { ja: '頭の上を電車、両側にお店', en: 'Trains overhead, shops on both sides' },
  chidori: { ja: 'お堀に咲く満開の桜並木', en: 'Cherry trees in full bloom over the moat' }, kabukicho: { ja: '赤いゲートとネオンの街', en: 'Through the red gate into the neon' }, omotesando: { ja: 'ケヤキ並木の大通り', en: 'Down the zelkova boulevard' },
  errand: { ja: '', en: '' },
  station: { ja: '電車がホームに入ってきた', en: 'The train is pulling in' }, deadline: { ja: '締め切りまであと1時間', en: 'One hour to the deadline' },
};
const SUMMIT = { tower: { en: '150 m DECK!', ja: '地上150mの展望台に到着', en2: 'You reached the 150 m deck' }, skytree: { en: '450 m!', ja: '地上450mの展望回廊を走りきった', en2: 'You ran the whole sky walkway' } };

/* ================= the day's route =================
   A plan is a list of steps: {t: room, d: minutes} or {fork: {L: {...}, R: {...}}} */
/* Every run builds its own days: forks pick spots that have not come up yet in this run,
   and the first fork avoids what the last run started with. */
const SINGLES = ['chidori', 'ginza', 'yurakucho', 'kokyo', 'nakadori', 'omotesando', 'gaien', 'akihabara', 'ameyoko', 'shinjuku', 'kabukicho', 'shibuya', 'ueno', 'odaiba', 'asakusa'];
const ROUTE = { used: new Set(), avoid: [], season: 'spring' };
/* ---- seasons: day 1 is April (the new business year), then summer, autumn, winter ---- */
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const seasonOf = day => SEASONS[((day || 1) - 1) % 4];
const SEASON_LBL = { spring: { ja: '春・4月 新年度', en: 'Spring · April' }, summer: { ja: '夏・梅雨', en: 'Summer · rainy season' }, autumn: { ja: '秋・紅葉', en: 'Autumn · golden leaves' }, winter: { ja: '冬・雪', en: 'Winter · snow' } };
// the same street looks different by season
const SEASONAL = {
  ueno: { spring: { ja: '上野公園・お花見', en: 'Ueno Park, cherry blossoms', tree: 'sakura', leaves: 0, petals: 1, spat: 'petals', side: ['#B7A797', '#AE9E8E'], rpat: 'petalstone', props: [['bonbori', 3], ['stall', 1], ['benchS', 1]], obs: ['picnic', 'picnic', 'bench', 'cone', 'stoneLanternO'], arrive: { ja: '花見客でにぎわう桜のトンネル', en: 'A tunnel of cherry blossoms, busy with picnics' } },
    summer: { ja: '上野公園・緑の並木', en: 'Ueno Park, green avenue', tree: 'green', leaves: 0, spat: 'lawn', side: ['#7FA35E', '#77995A'], obs: ['bench', 'cone', 'stoneLanternO'], arrive: { ja: '夏の緑の並木道', en: 'A green summer avenue' } },
    winter: { ja: '上野公園・冬木立', en: 'Ueno Park in winter', tree: 'bare', leaves: 0, spat: 'gravel', side: ['#A89F8A', '#A0977F'], obs: ['bench', 'cone', 'stoneLanternO'], arrive: { ja: '葉を落とした冬の並木', en: 'Bare winter trees' } } },
  gaien: { spring: { ja: '神宮外苑いちょう並木（新緑）', tree: 'green', en: 'Jingu Gaien ginkgo, fresh green', cone: 'canopy_coneG', leaves: 0, spat: 'walk', side: ['#BDB7AC', '#B5AFA4'], obs: ['cone', 'bench', 'kick', 'car'], arrive: { ja: '新緑のいちょう並木', en: 'Ginkgo trees in fresh green' } },
    summer: { ja: '神宮外苑いちょう並木（夏）', tree: 'green', en: 'Jingu Gaien ginkgo, summer', cone: 'canopy_coneG', leaves: 0, spat: 'walk', side: ['#BDB7AC', '#B5AFA4'], obs: ['cone', 'bench', 'kick', 'car'], arrive: { ja: '濃い緑のいちょう並木', en: 'Deep green ginkgo' } },
    winter: { ja: '神宮外苑いちょう並木（冬）', tree: 'bare', en: 'Jingu Gaien ginkgo, winter', cone: 'canopy_coneB', leaves: 0, spat: 'walk', side: ['#BDB7AC', '#B5AFA4'], obs: ['cone', 'bench', 'kick', 'car'], arrive: { ja: '葉を落としたいちょう並木', en: 'Bare ginkgo branches in winter' } } },
};
/* ================= more of Tokyo =================
   Generic, descriptive names only (place and street names, no company or facility brands). */
const ST = (k, ja, en, nja, nen) => ({ k, ja, en, note: { ja: nja, en: nen } });
Object.assign(THEMES, {
  /* ---- more of the boss's house ---- */
  senmen:   { ja: '課長の家・洗面所', en: "The boss's washroom", kind: 'room', len: [56, 64], road: ['#E3E8EC', '#D7DDE2'], rpat: 'grid', side: ['#D7DDE2', '#CDD3D9'], spat: 'grid',
    wall: '#F4F7F8', base: '#9AA9B6', wallH: 2.8, ceil: '#F3F5F6', cpat: 'plain', light: 'panel', wdeco: ['mirror', 'window', 'mirror', 'calendar'], props: [['rack', 2], ['boxesS', 1], ['plant', 1]], obs: ['box', 'slipper', 'roomba', 'bag'] },
  washitsu: { ja: '課長の家・和室', en: "The boss's tatami room", kind: 'room', len: [58, 66], road: ['#D6C98A', '#CEBF7E'], rpat: 'tatami', side: ['#D2C483', '#C9BA77'], spat: 'tatami',
    wall: '#E9DCC0', base: '#6B4631', wallH: 2.9, ceil: '#B49A78', cpat: 'wood', light: 'round', wdeco: ['fusuma', 'shoji', 'tokonoma', 'shoji'], props: [['andon', 2], ['zabutonS', 3], ['tansu', 1]], obs: ['zabuton', 'chabudai', 'futon', 'box'] },
  kaidanH:  { ja: '課長の家・階段の下', en: "The boss's stairway", kind: 'room', len: [56, 64], road: ['#B98A5A', '#B08152'], rpat: 'boards', side: ['#B08152', '#A87A4C'], spat: 'boards',
    wall: '#F1E7D6', base: '#6B4631', wallH: 3.2, ceil: '#E9DFCC', cpat: 'plain', light: 'round', wdeco: ['frame', 'window', 'calendar', 'frame'], props: [['shelf', 1], ['umbrellaS', 1], ['boxesS', 2], ['plant', 1]], obs: ['box', 'slipper', 'toys', 'papers'] },
  /* ---- more ways to get to work ---- */
  shotengai:{ ja: '下町の商店街（朝）', lbl: '下町の商店街', en: 'Old shopping street, morning', kind: 'street', len: [90, 104], road: ['#9A968E', '#928E86'], rpat: 'stone', side: ['#A8A49C', '#A09C94'], spat: 'walk', curb: '#C9C5BD',
    fac: { style: 'market', mood: 'yanaka', h: [5, 8], pal: ['#E9E2D5', '#D6CDBF', '#C9BFAF', '#F3E8DA'] }, props: [['nobori', 3], ['bikes', 2], ['vending', 1], ['planter', 1]], obs: ['bike', 'crate', 'cone', 'bags', 'kick'], hill: 0 },
  riverside:{ ja: '川沿いの遊歩道', lbl: '川沿いの遊歩道', en: 'Riverside path', kind: 'street', len: [92, 106], road: ['#B9AE9C', '#AFA392'], rpat: 'gravel', side: ['#7FA35E', '#77995A'], spat: 'lawn', curb: '#8A7A5A',
    fac: { style: 'park' }, moat: 1, props: [['tree', 3], ['benchS', 1], ['lampC', 1]], obs: ['bike', 'bench', 'cone', 'kick', 'stroller'], tree: 'green', lm: [{ t: 'skytree', sc: .6, off: .25 }] },
  subwayst: { ja: '地下鉄のホーム', en: 'Subway platform', kind: 'room', len: [78, 90], road: ['#B9B9B2', '#AFAFA8'], rpat: 'platform', side: ['#AFAFA8', '#A6A69F'], spat: 'grid',
    wall: '#D9DCD8', base: '#3F4A55', wallH: 3.3, ceil: '#6E7680', cpat: 'beams', light: 'strip', wdeco: ['stationsign', 'poster', 'timetable', 'poster'], leftWall: 'trainside', props: [['pillarS', 3], ['benchS', 2]], obs: ['pillar', 'suitcase', 'bag', 'cone'], lc: '#1E8CC8' },
  subway:   { ja: '地下鉄（車内）', en: 'Subway train', kind: 'train', len: [92, 104], road: ['#8E9AA6', '#87939F'], rpat: 'train', side: ['#87939F', '#808C98'], spat: 'train',
    wall: '#E8ECEF', base: '#1E8CC8', wallH: 2.9, ceil: '#DDE2E6', cpat: 'plain', light: 'strip', wdeco: ['seatwin', 'seatwin', 'door', 'seatwin', 'trainmap'], props: [['nakazuri', 2], ['seat', 4], ['strapS', 3]], obs: ['pole', 'suitcase', 'bag', 'papers'], lc: '#1E8CC8', tunnel: 1,
    stamp: ST('地下', '地下鉄', 'Subway', '地下をはしる電車。窓の外はトンネルのあかりが流れていく。', 'Trains under the city; tunnel lights stream past the windows.') },
  toden:    { ja: '路面電車（都電）', lbl: '路面電車', en: 'Streetcar (Toden)', kind: 'train', len: [88, 100], road: ['#9A8E80', '#92877A'], rpat: 'train', side: ['#92877A', '#8A7F72'], spat: 'train',
    wall: '#F3EEE6', base: '#D9407A', wallH: 2.7, ceil: '#E9E4DA', cpat: 'plain', light: 'round', wdeco: ['seatwin', 'seatwin', 'door', 'seatwin'], props: [['nakazuri', 2], ['seat', 4], ['strapS', 2]], obs: ['pole', 'bag', 'suitcase', 'papers'], lc: '#D9407A', winView: 'city',
    stamp: ST('都電', '路面電車', 'Streetcar', '東京に残る路面電車。町の中をのんびり走り、春は沿線にバラが咲く。', "Tokyo's last streetcar line, rolling slowly through the neighborhoods; roses bloom along it in spring.") },
  bayline:  { ja: '臨海の新交通（車内）', lbl: '臨海の新交通', en: 'Bayside driverless train', kind: 'train', len: [92, 104], road: ['#9AA6B2', '#93A0AC'], rpat: 'train', side: ['#93A0AC', '#8C99A5'], spat: 'train',
    wall: '#EEF2F5', base: '#2D6CB5', wallH: 2.8, ceil: '#E4E9ED', cpat: 'plain', light: 'strip', wdeco: ['seatwin', 'seatwin', 'door', 'seatwin', 'trainmap'], props: [['nakazuri', 2], ['seat', 4], ['strapS', 2]], obs: ['pole', 'suitcase', 'bag'], lc: '#2D6CB5',
    stamp: ST('臨海', '臨海の新交通', 'Bayside train', '運転士のいない新交通。ループを回って海の上の橋をわたる。', 'A driverless line that loops up onto the bridge over the bay.') },
  /* ---- more of the office ---- */
  ehall:    { ja: 'エレベーターホール', en: 'Elevator hall', kind: 'room', len: [60, 70], road: ['#D9D2C6', '#CFC7BA'], rpat: 'grid', side: ['#CFC7BA', '#C5BDB0'], spat: 'grid',
    wall: '#E9E6DF', base: '#46525E', wallH: 3.4, ceil: '#E9E5DD', cpat: 'plain', light: 'panel', wdeco: ['elevator', 'elevator', 'frame', 'elevator', 'plantwall'], props: [['plant', 2], ['gateS', 1]], obs: ['plant', 'box', 'suitcase', 'ogates'] },
  shokudo:  { ja: '社員食堂', en: 'Staff canteen', kind: 'room', len: [72, 82], road: ['#D9D2C6', '#CFC7BA'], rpat: 'grid', side: ['#CFC7BA', '#C5BDB0'], spat: 'grid',
    wall: '#F3EFE7', base: '#8A6A48', wallH: 3.2, ceil: '#F0ECE4', cpat: 'grid', light: 'panel', wdeco: ['menuboard', 'citywin', 'citywin', 'menuboard', 'clock'], props: [['mchairs', 4], ['water', 1], ['counter', 1]], obs: ['table', 'mug', 'chair', 'pot', 'box'],
    stamp: ST('食堂', '社員食堂', 'Staff canteen', '会社の中の食堂。日替わり定食がおすすめ。', 'The company canteen. The daily set meal is the one to get.') },
  shiryo:   { ja: '資料室', en: 'Archive room', kind: 'room', len: [64, 72], road: ['#9AA0A6', '#90969C'], rpat: 'carpet', side: ['#90969C', '#888E94'], spat: 'carpet',
    wall: '#EEF0F2', base: '#46525E', wallH: 3.0, ceil: '#EEF0F2', cpat: 'grid', light: 'panel', wdeco: ['bookshelf', 'bookshelf', 'clock', 'bookshelf'], props: [['cabinet', 3], ['boxesS', 2], ['papersS', 2]], obs: ['papers', 'paperTall', 'box', 'chair'] },
  yakuin:   { ja: '役員フロア', en: 'Executive floor', kind: 'room', len: [70, 80], road: ['#8A3A3A', '#823535'], rpat: 'carpet', side: ['#7A5538', '#704E33'], spat: 'boards',
    wall: '#EFE8DC', base: '#5A3D27', wallH: 3.3, ceil: '#EDE6DA', cpat: 'grid', light: 'round', wdeco: ['woodpanel', 'portrait', 'woodpanel', 'citywin', 'portrait'], props: [['sofaO', 2], ['plant', 2], ['lampS', 1]], obs: ['plant', 'chair', 'box', 'papers'] },
  rooftop:  { ja: '会社の屋上庭園', lbl: '屋上庭園', en: 'Rooftop garden', kind: 'deck', len: [92, 104], road: ['#C9C1B2', '#BFB7A8'], rpat: 'plaza', side: ['#7FA35E', '#77995A'], spat: 'lawn', view: 'city', rail: '#E9EEF2',
    props: [['planter', 2]], obs: ['bench', 'flowers', 'plant', 'cone'], lm: [{ t: 'tower', sc: .7, off: .25 }, { t: 'skytree', sc: .5, off: -.3 }],
    stamp: ST('屋上', '会社の屋上庭園', 'Rooftop garden', 'ビルの屋上の小さな庭。昼休みにひと息つける。', 'A small garden on the roof, good for a breather at lunch.') },
  present:  { ja: '会議室・プレゼン直前', en: 'Meeting room: big pitch', kind: 'room', len: [94, 104], road: ['#6E7B88', '#66737F'], rpat: 'carpet', side: ['#66737F', '#606D79'], spat: 'carpet',
    wall: '#E9EDF0', base: '#46525E', wallH: 3.0, ceil: '#ECEFF1', cpat: 'grid', light: 'panel', wdeco: ['screen', 'whiteboard', 'clock', 'screen'], props: [['mchairs', 4], ['papersS', 2]], obs: ['mtable', 'papers', 'chair', 'paperTall', 'wboard'], rush: 1 },
  /* ---- more sightseeing: central ---- */
  nihonbashi:{ ja: '日本橋', en: 'Nihonbashi', kind: 'street', len: [100, 112], road: ['#8E8C88', '#87857F'], rpat: 'road', side: ['#BDB5A7', '#B3AB9D'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'luxury', h: [18, 30], pal: ['#D9D0BF', '#C9C3B8', '#E3DACA', '#BDB3A3', '#B5A48A'] }, props: [['lampC', 3], ['tree', 1], ['flowers', 1]], obs: ['cone', 'barrier', 'kick', 'car', 'bench'], overpass: 1, tree: 'green',
    stamp: ST('日橋', '日本橋', 'Nihonbashi', '石づくりの橋。全国の道路の距離はここから数える。頭の上を高速道路が通る。', 'The stone bridge from which all road distances in Japan are measured, with an expressway passing overhead.') },
  tsukiji:  { ja: '築地場外市場', lbl: '築地', lblEn: 'Tsukiji', en: 'Tsukiji Outer Market', kind: 'street', len: [96, 108], road: ['#8E8C88', '#87857F'], rpat: 'stone', side: ['#8F8D85', '#86847C'], spat: 'stone', curb: '#B9B2A5',
    fac: { style: 'market', mood: 'tsukiji', h: [5, 9], pal: ['#E9E2D5', '#D6CDBF', '#C9BFAF', '#F3E8DA'] }, props: [['fishbox', 3], ['stall', 2], ['nobori', 1]], obs: ['crate', 'box', 'stoolsO', 'sign', 'bike'], flat: 1,
    stamp: ST('築地', '築地場外市場', 'Tsukiji Outer Market', '玉子焼や海鮮、包丁や乾物のお店がぎっしり。朝が一番にぎやか。', 'Packed with stalls of rolled omelet, seafood, knives and dried goods; busiest in the morning.') },
  hibiya:   { ja: '日比谷公園', en: 'Hibiya Park', kind: 'street', len: [100, 112], road: ['#D9CBA8', '#D1C29E'], rpat: 'gravel', side: ['#7FA35E', '#77995A'], spat: 'lawn', curb: '#B9B2A5',
    fac: { style: 'park' }, props: [['tree', 4], ['flowers', 2], ['lampC', 2], ['benchS', 1]], obs: ['bench', 'cone', 'flowers', 'stroller', 'leafpile'], tree: 'green', lm: [{ t: 'tower', sc: .5, off: .3 }],
    stamp: ST('日比', '日比谷公園', 'Hibiya Park', '日本で最初の洋風の公園。花壇と噴水があり、秋は菊の花の展示も。', "Japan's first Western-style park, with flower beds and a fountain.") },
  jimbocho: { ja: '神保町・古書店街', lbl: '神保町', en: 'Jimbocho booksellers', kind: 'street', len: [100, 112], road: ['#76777C', '#707176'], rpat: 'road', side: ['#B8B2A6', '#B0AA9E'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'books', h: [8, 16], pal: ['#D6CDBF', '#C9BFAF', '#B5A48A', '#E9E2D5', '#A89C88'] }, props: [['bookcart', 3], ['vending', 1], ['pole', 1], ['bikes', 1]], obs: ['bike', 'box', 'cone', 'sign', 'kick'],
    stamp: ST('古書', '神保町の古書店街', 'Jimbocho', '100軒以上の古本屋が並ぶ本の街。店先のワゴンに掘り出し物がある。', 'A town of over a hundred second-hand bookshops, with bargain carts out front.') },
  kagurazaka:{ ja: '神楽坂・石畳の路地', lbl: '神楽坂', en: 'Kagurazaka lanes', kind: 'street', len: [96, 108], road: ['#7E7A72', '#77736B'], rpat: 'stone', side: ['#6E6A63', '#67635C'], spat: 'stone', curb: '#5A5650',
    fac: { style: 'machiya', h: [5, 8], pal: ['#3B2E26', '#4A3A2E', '#2E2622'] }, props: [['kuroita', 3], ['chochin', 2], ['planter', 1]], obs: ['bike', 'bench', 'cone', 'stoolsO'], hill: 1,
    stamp: ST('神楽', '神楽坂', 'Kagurazaka', '坂の町。石畳の細い路地に、黒い板塀と料亭が残る。', 'A hillside town of narrow stone lanes, black wooden fences and old restaurants.') },
  shiodome:  { ja: '汐留・高層ビル街', lbl: '汐留', en: 'Shiodome towers', kind: 'street', len: [100, 112], road: ['#6E6F74', '#68696E'], rpat: 'road', side: ['#C9C5BD', '#C1BDB5'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'glass', h: [45, 85], pal: ['#91A6B8', '#A3B5C4', '#7F95A8', '#B4C3D1'] }, props: [['tree', 2], ['lampC', 2], ['planter', 1]], obs: ['cone', 'barrier', 'kick', 'car', 'supercar'], tree: 'green', lm: [{ t: 'tower', sc: .9, off: .2 }],
    stamp: ST('汐留', '汐留', 'Shiodome', '昔の貨物駅のあとにできた高層ビル街。ビルのすきまから赤い電波塔が見える。', 'Towers built on an old freight yard, with the red tower peeking between them.') },
  shinbashi: { ja: '新橋・駅前の飲み屋街', lbl: '新橋', en: 'Shimbashi after work', kind: 'street', len: [96, 108], road: ['#6A6A70', '#646469'], rpat: 'road', side: ['#9D988F', '#958F86'], spat: 'walk', curb: '#B9B2A5',
    fac: { style: 'neon', mood: 'shinbashi', h: [8, 16], pal: ['#8A8F99', '#C9C5BD', '#7A7F88', '#B0A898'], screen: .2, vsign: .9 }, props: [['sl', 1], ['chochin', 3], ['vending', 1], ['pole', 1]], obs: ['stoolsO', 'crate', 'sign', 'cone', 'box'],
    stamp: ST('新橋', '新橋', 'Shimbashi', '会社帰りの人でにぎわう駅前。広場には蒸気機関車が置かれている。', 'A station square busy with office workers after hours, with a steam locomotive on display.') },
  hamarikyu: { ja: '浜離宮の庭園', lbl: '浜離宮', en: 'Hama-rikyu Gardens', kind: 'street', len: [100, 112], road: ['#D9CBA8', '#D1C29E'], rpat: 'gravel', side: ['#7FA35E', '#77995A'], spat: 'lawn', curb: '#B9B2A5',
    fac: { style: 'park' }, moat: 1, props: [['pinetree', 4], ['stoneLantern', 1], ['benchS', 1]], obs: ['bench', 'stoneLanternO', 'cone', 'leafpile'], tree: 'pine', lm: [{ t: 'cyl', sc: .8, off: -.2 }, { t: 'tower', sc: .6, off: .3 }],
    stamp: ST('浜離', '浜離宮の庭園', 'Hama-rikyu', '海の水を引き入れた池のある大名庭園。松の向こうに高層ビルが並ぶ。', 'An old lord’s garden with a seawater pond; skyscrapers rise beyond the pines.') },
  /* ---- more sightseeing: east ---- */
  yanaka:   { ja: '谷中・下町の商店街', lbl: '谷中', en: 'Yanaka old shopping street', kind: 'street', len: [96, 108], road: ['#9A968E', '#928E86'], rpat: 'stone', side: ['#A8A49C', '#A09C94'], spat: 'walk', curb: '#C9C5BD',
    fac: { style: 'market', mood: 'yanaka', h: [5, 8], pal: ['#E9E2D5', '#D6CDBF', '#C9BFAF', '#F3E8DA', '#B5A48A'] }, props: [['stall', 2], ['nobori', 2], ['bikes', 1], ['planter', 1]], obs: ['bike', 'crate', 'bags', 'stoolsO', 'cone'], hill: -1,
    stamp: ST('谷中', '谷中の商店街', 'Yanaka', '夕やけがきれいな階段のある、昔ながらの商店街。ねこが多い町。', 'An old-style shopping street by a famous sunset staircase, in a town full of cats.') },
  nezu:     { ja: '根津・赤い鳥居のトンネル', lbl: '根津の鳥居', en: 'Nezu torii tunnel', kind: 'street', len: [100, 112], road: ['#B9AE9C', '#AFA392'], rpat: 'stone', side: ['#7FA35E', '#77995A'], spat: 'lawn', curb: '#8A7A5A',
    fac: { style: 'park' }, toriiTunnel: 1, props: [['stoneLantern', 2], ['tree', 2]], obs: ['bench', 'stoneLanternO', 'cone', 'leafpile'], tree: 'green', flat: 1,
    stamp: ST('根津', '根津の千本鳥居', 'Nezu torii', '小さな赤い鳥居がいくつも続く参道。春はツツジが一面に咲く。', 'A path through rows of small red torii gates; azaleas cover the slope in spring.') },
  dougu:    { ja: '浅草・道具の問屋街', lbl: '道具の問屋街', en: 'Kitchenware wholesale street', kind: 'street', len: [100, 112], road: ['#76777C', '#707176'], rpat: 'road', side: ['#B8B2A6', '#B0AA9E'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'market', mood: 'dougu', h: [8, 14], pal: ['#E9E2D5', '#D6CDBF', '#C9BFAF', '#9FB4C6', '#BFB6A6'] }, props: [['stall', 2], ['nobori', 1], ['vending', 1], ['pole', 1]], obs: ['box', 'crate', 'cone', 'bike', 'pot'], lm: [{ t: 'skytree', sc: .9, off: .2 }],
    stamp: ST('道具', '道具の問屋街', 'Kitchenware street', '包丁や食器、店の看板やのれんまで、料理の道具がなんでもそろう問屋街。', 'A wholesale street selling every kitchen tool, from knives and dishes to shop signs and noren curtains.') },
  ryogoku:  { ja: '両国・相撲の町', lbl: '両国', en: 'Ryogoku, sumo town', kind: 'street', len: [100, 112], road: ['#7A7B80', '#74757A'], rpat: 'road', side: ['#BDB5A7', '#B3AB9D'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'mixed', h: [8, 16], pal: ['#E9E2D5', '#D6CDBF', '#C9BFAF', '#BFB6A6'] }, props: [['nobori', 4], ['tree', 1], ['vending', 1]], obs: ['bike', 'cone', 'kick', 'car', 'bench'], lm: [{ t: 'kokugikan', sc: 1.2, off: -.2 }, { t: 'skytree', sc: .7, off: .3 }],
    stamp: ST('両国', '両国', 'Ryogoku', '相撲の町。場所の時期は色とりどりののぼりが通りに立ち、ちゃんこ鍋の店も多い。', 'The home of sumo: bright banners line the street during tournaments, and hot-pot restaurants are everywhere.') },
  kiyosumi: { ja: '清澄庭園', en: 'Kiyosumi Garden', kind: 'street', len: [96, 108], road: ['#C8B58F', '#BFAC86'], rpat: 'gravel', side: ['#7FA35E', '#77995A'], spat: 'lawn', curb: '#8A7A5A',
    fac: { style: 'park' }, moat: -1, props: [['pinetree', 4], ['stoneLantern', 2]], obs: ['bench', 'stoneLanternO', 'leafpile', 'cone'], tree: 'pine',
    stamp: ST('清澄', '清澄庭園', 'Kiyosumi', '大きな池のまわりを、全国から集めた名石がかこむ庭園。池には亀や鯉がいる。', 'A garden of famous stones from across Japan around a big pond full of turtles and carp.') },
  sumidakoen:{ ja: '隅田公園の桜', lbl: '隅田公園', en: 'Sumida Park cherries', kind: 'street', len: [104, 116], road: ['#CDBFAE', '#C6B8A6'], rpat: 'petalstone', side: ['#B7A797', '#AE9E8E'], spat: 'petals', curb: '#9A9384',
    fac: { style: 'park' }, moat: 1, props: [['bonbori', 4], ['benchS', 1]], obs: ['picnic', 'picnic', 'bench', 'cone', 'tripod'], tree: 'sakura', petals: 1, only: ['spring'], lm: [{ t: 'skytree', sc: 1.2, off: .2 }],
    stamp: ST('隅公', '隅田公園', 'Sumida Park', '川の両岸に桜が続き、そのむこうに押上の電波塔が見える。', 'Cherry trees line both banks, with the Oshiage tower beyond.') },
  shinobazu:{ ja: '上野・不忍池', lbl: '不忍池', en: 'Shinobazu Pond', kind: 'street', len: [100, 112], road: ['#C8B58F', '#BFAC86'], rpat: 'gravel', side: ['#7FA35E', '#77995A'], spat: 'lawn', curb: '#8A7A5A',
    fac: { style: 'park' }, moat: -1, props: [['tree', 3], ['lampC', 2], ['benchS', 1]], obs: ['bench', 'cone', 'stroller', 'leafpile'], tree: 'green', lm: [{ t: 'pagoda', sc: .8, off: -.25 }],
    stamp: ST('不忍', '不忍池', 'Shinobazu Pond', '上野公園の池。夏は一面にハスの葉が広がり、ボートにも乗れる。', 'The pond in Ueno Park, covered in lotus leaves in summer; you can rent a boat.') },
  yakata:   { ja: '屋形船（隅田川）', lbl: '屋形船', en: 'Yakatabune on the Sumida', kind: 'deck', len: [104, 116], road: ['#B9895A', '#AF8052'], rpat: 'tatami', side: ['#24506F', '#214A68'], spat: 'water', view: 'river', rail: '#C0392B', boat: 1, hull: '#5A3A26', boatLanterns: 1,
    props: [], obs: ['bridge', 'chabudai', 'zabuton', 'bridge', 'ring'], lm: [{ t: 'skytree', sc: 1.3, off: .15 }],
    stamp: ST('屋形', '屋形船', 'Yakatabune', 'ちょうちんを下げた屋根つきの船。食事をしながら川からの夜景を楽しむ。', 'A roofed pleasure boat hung with lanterns, for dinner with a view of the city from the river.') },
  /* ---- more sightseeing: west ---- */
  sando:    { ja: '代々木の杜・森の参道', lbl: '森の参道', en: 'Forest approach, Yoyogi', kind: 'street', len: [104, 116], road: ['#D9CBA8', '#D1C29E'], rpat: 'gravel', side: ['#5E7F48', '#577744'], spat: 'lawn', curb: '#8A7A5A',
    fac: { style: 'park' }, torii: '#8A6A48', toriiTop: '#6B5040', props: [['tree', 6], ['stoneLantern', 1]], obs: ['bench', 'leafpile', 'stoneLanternO', 'cone'], tree: 'green', flat: 1,
    stamp: ST('杜', '代々木の森の参道', 'Forest approach', '大きな木の鳥居をくぐると、都心とは思えない深い森が続く。', 'Pass under the great wooden torii into a forest you would never expect in the heart of the city.') },
  takeshita:{ ja: '原宿・竹下通り', lbl: '竹下通り', en: 'Harajuku, Takeshita Street', kind: 'street', len: [92, 104], road: ['#9A968E', '#928E86'], rpat: 'stone', side: ['#A8A49C', '#A09C94'], spat: 'walk', curb: '#C9C5BD',
    fac: { style: 'neon', mood: 'harajuku', h: [7, 14], pal: ['#F3E8EE', '#E8F0F6', '#FFF6E0', '#EDE6F6', '#F6E9E0'], screen: .3, vsign: .7 }, props: [['stall', 2], ['planter', 1], ['vending', 1]], obs: ['bags', 'stroller', 'sign', 'cone', 'bike'], gate: '竹下通り', gateColor: '#D97AAE',
    stamp: ST('竹下', '竹下通り', 'Takeshita Street', 'クレープや古着の店がならぶ、若者でにぎわう細い通り。', 'A narrow street packed with crêpe stands and vintage shops, busy with young people.') },
  ekimae:   { ja: '渋谷・駅前の繁華街', lbl: '渋谷の繁華街', en: 'Shibuya side streets', kind: 'street', len: [96, 108], road: ['#5E5E63', '#59595E'], rpat: 'stone', side: ['#8F8B84', '#88847D'], spat: 'walk', curb: '#B9B2A5',
    fac: { style: 'neon', mood: 'shibuya', h: [12, 24], pal: ['#8A8F99', '#6E7480', '#9AA0AA', '#B0B4BA'], screen: .5, vsign: .8 }, props: [['vending', 2], ['pole', 1], ['signal', 1]], obs: ['bags', 'sign', 'cone', 'kick', 'box'], hill: 1,
    stamp: ST('繁華', '渋谷の繁華街', 'Shibuya streets', '駅から坂をのぼる繁華街。服やレコード、カフェの店がぎっしり。', 'Busy streets climbing up from the station, crammed with fashion, record shops and cafés.') },
  daikanyama:{ ja: '代官山', en: 'Daikanyama', kind: 'street', len: [96, 108], road: ['#7A7B80', '#74757A'], rpat: 'road', side: ['#C9C1B2', '#BFB7A8'], spat: 'walk', curb: '#E6E2DA',
    fac: { style: 'luxury', h: [6, 12], pal: ['#F3EEE6', '#E8E1D3', '#D9D0BF', '#9FB4C6', '#E3DACA'] }, props: [['cafe', 3], ['tree', 2], ['planter', 1]], obs: ['bench', 'stroller', 'flowers', 'cone', 'kick'], tree: 'zelkova', hill: 1,
    stamp: ST('代官', '代官山', 'Daikanyama', '低いおしゃれな建物とカフェがならぶ、おちついた坂の町。', 'A calm hillside neighborhood of low, stylish buildings and cafés.') },
  meguro:   { ja: '目黒川沿い', lbl: '目黒川', en: 'Meguro River', kind: 'street', len: [100, 112], road: ['#B9AE9C', '#AFA392'], rpat: 'stone', side: ['#A8A49C', '#A09C94'], spat: 'walk', curb: '#8A8470',
    fac: { style: 'park' }, moat: 1, props: [['lampC', 2], ['benchS', 1], ['tree', 3]], obs: ['bike', 'bench', 'stroller', 'cone'], tree: 'green',
    stamp: ST('目黒', '目黒川', 'Meguro River', '川の両側に約800本の桜。春は花のトンネル、冬は青い光で飾られる。', 'About 800 cherry trees line the river: a tunnel of blossom in spring, blue lights in winter.') },
  roppongi: { ja: '六本木の夜景通り', lbl: '六本木', en: 'Roppongi lights', kind: 'street', len: [100, 112], road: ['#5E5E63', '#59595E'], rpat: 'road', side: ['#9D988F', '#958F86'], spat: 'walk', curb: '#B9B2A5',
    fac: { style: 'neon', mood: 'roppongi', h: [20, 40], pal: ['#6E7480', '#8A8F99', '#5E6470', '#9FB4C6'], screen: .4, vsign: .4 }, props: [['tree', 2], ['lampC', 2], ['signal', 1]], obs: ['cone', 'barrier', 'car', 'supercar', 'kick'], tree: 'illum', lm: [{ t: 'tower', sc: 1.4, off: .1 }], hill: -1,
    stamp: ST('六本', '六本木', 'Roppongi', '美術館とレストランの町。坂の向こうに赤い電波塔が大きく見える。', 'A town of museums and restaurants, with the red tower looming at the end of the slope.') },
  gyoen:    { ja: '新宿御苑', en: 'Shinjuku Gyoen', kind: 'street', len: [104, 116], road: ['#C8B58F', '#BFAC86'], rpat: 'gravel', side: ['#7FA35E', '#77995A'], spat: 'lawn', curb: '#8A7A5A',
    fac: { style: 'park' }, props: [['bigTree', 3], ['benchS', 1], ['lampC', 1]], obs: ['picnic', 'bench', 'leafpile', 'cone', 'stroller'], tree: 'zelkova', lm: [{ t: 'tocho', sc: .7, off: .25 }],
    stamp: ST('御苑', '新宿御苑', 'Shinjuku Gyoen', '広い芝生と大きな木の庭園。春は桜、秋は紅葉の名所。', 'Wide lawns and huge trees; famous for cherry blossoms in spring and autumn color.') },
  yokocho:  { ja: '新宿・線路沿いの横丁', lbl: '新宿の横丁', en: 'Shinjuku alley bars', kind: 'room', len: [88, 100], road: ['#5E5A53', '#57534C'], rpat: 'stone', side: ['#55514A', '#4E4A44'], spat: 'stone',
    wall: '#5A3A2A', base: '#2B1A12', wallH: 3.2, ceil: '#2A2A2E', cpat: 'girder', light: 'bulb', wdeco: ['izakaya', 'izakaya', 'menu', 'izakaya'], props: [['chochin', 4], ['stools', 2], ['crates', 1]], obs: ['stoolsO', 'crate', 'noren', 'box'],
    stamp: ST('横丁', '新宿の横丁', 'Shinjuku alleys', '線路沿いの細い路地に、やきとりの小さな店がひしめく。', 'Tiny yakitori bars squeezed into narrow alleys beside the tracks.') },
  ikebukuro:{ ja: '池袋・東口の繁華街', lbl: '池袋', en: 'Ikebukuro east side', kind: 'street', len: [100, 112], road: ['#6A6A70', '#646469'], rpat: 'road', side: ['#A5A097', '#9D988F'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'neon', mood: 'ikebukuro', h: [14, 30], pal: ['#7A7F88', '#E8E4DC', '#8A8F99', '#C9C5BD'], screen: .6, vsign: .7 }, props: [['vending', 2], ['signal', 1], ['pole', 1], ['tree', 1]], obs: ['cone', 'kick', 'sign', 'barrier', 'car'],
    stamp: ST('池袋', '池袋', 'Ikebukuro', 'ゲームセンターや映画館、アニメの店がならぶ北の大きな繁華街。', 'A big northern hub of arcades, cinemas and anime shops.') },
  shinokubo:{ ja: '新大久保・韓国料理の町', lbl: '新大久保', en: 'Shin-Okubo Koreatown', kind: 'street', len: [96, 108], road: ['#6A6A70', '#646469'], rpat: 'road', side: ['#A5A097', '#9D988F'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'neon', mood: 'korea', h: [8, 16], pal: ['#E8E4DC', '#C9C5BD', '#F3E8EE', '#8A8F99'], screen: .3, vsign: .7 }, props: [['stall', 2], ['vending', 1], ['pole', 1]], obs: ['bags', 'sign', 'cone', 'kick', 'box'],
    stamp: ST('大久', '新大久保', 'Shin-Okubo', '韓国料理やコスメの店がならぶ町。屋台のホットクのにおいがただよう。', 'Korean restaurants and cosmetics shops, with the smell of hotteok (sweet filled pancakes) from street stalls.') },
  zojoji:   { ja: '芝・大きな寺の三門', lbl: '芝の大寺', en: 'Great temple gate, Shiba', kind: 'street', len: [100, 112], road: ['#C9C2B6', '#BFB8AB'], rpat: 'plaza', side: ['#BDB5A7', '#B3AB9D'], spat: 'stone', curb: '#9A9384',
    fac: { style: 'park' }, gate: '三解脱門', gateColor: '#B5302A', props: [['stoneLantern', 2], ['pinetree', 3], ['tree', 1]], obs: ['bench', 'stoneLanternO', 'cone', 'rickshaw'], tree: 'pine', lm: [{ t: 'tower', sc: 1.6, off: .05 }], flat: 1,
    stamp: ST('三門', '芝の大寺', 'Shiba temple', '江戸時代からの大きな寺。朱色の門の真うしろに赤い電波塔がそびえる。', 'A great temple from the Edo era, with the red tower rising right behind its vermilion gate.') },
  /* ---- the bay ---- */
  toyosu:   { ja: '豊洲・海辺のプロムナード', lbl: '豊洲', en: 'Toyosu waterfront', kind: 'deck', len: [104, 116], road: ['#C9C1B2', '#BFB7A8'], rpat: 'planks', side: ['#2B5F86', '#285A80'], spat: 'water', view: 'sea', rail: '#E9EEF2',
    props: [['buoyS', 1]], obs: ['bench', 'bike', 'cone', 'stroller', 'kick'], lm: [{ t: 'tower', sc: .9, off: .25 }, { t: 'fuji', sc: .8, off: -.3 }],
    stamp: ST('豊洲', '豊洲の海辺', 'Toyosu', '新しい市場と高層マンションの町。海ぞいの遊歩道から東京の夜景が見える。', 'A new market town of high-rises, with city lights across the water from the promenade.') },
  kaihin:   { ja: 'お台場の砂浜', lbl: 'お台場の砂浜', en: 'Odaiba beach', kind: 'deck', len: [104, 116], road: ['#E9DCC0', '#E2D4B6'], rpat: 'sand', side: ['#2B5F86', '#285A80'], spat: 'water', view: 'sea', rail: '#C9B48A',
    props: [], obs: ['picnic', 'parasol', 'ring', 'cone', 'stroller'], lm: [{ t: 'tower', sc: .8, off: .25 }, { t: 'fuji', sc: .9, off: -.3 }],
    stamp: ST('砂浜', 'お台場の砂浜', 'Odaiba beach', '人工の砂浜。海の向こうに吊り橋と都心のビルが並ぶ。', 'A man-made beach facing the suspension bridge and the city skyline.') },
});
Object.assign(ARRIVE, {
  shotengai: { ja: 'シャッターが開きはじめた朝の商店街', en: 'Shutters rolling up on the morning street' }, riverside: { ja: '川の風が気持ちいい遊歩道', en: 'A breezy path along the river' },
  subwayst: { ja: '地下鉄がホームに入ってきた', en: 'The subway is pulling in' }, subway: { ja: 'トンネルのあかりが流れていく', en: 'Tunnel lights streaming by' }, toden: { ja: 'チンチン電車で町の中を進む', en: 'Rattling through town on the streetcar' },
  bayline: { ja: '運転士のいない電車で海の上へ', en: 'A driverless train out over the bay' }, ehall: { ja: 'エレベーター待ちの行列をすりぬける', en: 'Slip past the elevator queue' }, shokudo: { ja: '日替わり定食のにおい', en: 'The smell of the daily set meal' },
  shiryo: { ja: 'ほこりっぽい資料の山', en: 'Dusty stacks of files' }, yakuin: { ja: '役員フロアはしずかに走る', en: 'Run quietly past the executives' }, rooftop: { ja: '屋上の庭でひと息', en: 'A breather in the rooftop garden' }, present: { ja: 'プレゼンまであと1時間', en: 'One hour to the big pitch' },
  nihonbashi: { ja: '石の橋と頭上の高速道路', en: 'A stone bridge under the expressway' }, tsukiji: { ja: '玉子焼のにおいの市場', en: 'A market smelling of rolled omelet' }, hibiya: { ja: '花壇と噴水の公園', en: 'Flower beds and a fountain' },
  jimbocho: { ja: '古本のワゴンがならぶ本の街', en: 'Bargain book carts everywhere' }, kagurazaka: { ja: '石畳の坂道をのぼる', en: 'Up the stone-paved slope' }, shiodome: { ja: 'ビルの谷間に赤い電波塔', en: 'The red tower between the towers' },
  shinbashi: { ja: '会社帰りの人でいっぱいの駅前', en: 'Office workers heading out for a drink' }, hamarikyu: { ja: '松と池の庭園の向こうに高層ビル', en: 'Pines, a pond, and towers beyond' },
  yanaka: { ja: 'ねこの多い下町の商店街', en: 'An old shopping street full of cats' }, nezu: { ja: '赤い鳥居のトンネルをぬける', en: 'Through a tunnel of red torii' }, dougu: { ja: '包丁や食器の問屋街', en: 'A street of knives and dishes' },
  ryogoku: { ja: 'のぼりがはためく相撲の町', en: 'Banners flapping in sumo town' }, kiyosumi: { ja: '池と名石の庭園', en: 'A garden of ponds and stones' }, sumidakoen: { ja: '川ぞいの桜並木', en: 'Cherry trees along the river' },
  shinobazu: { ja: 'ハスの池のほとり', en: 'Beside the lotus pond' }, yakata: { ja: 'ちょうちんの屋形船で川を下る', en: 'Down the river on a lantern-lit boat' }, sando: { ja: '大きな鳥居をくぐって森の中へ', en: 'Under the great torii into the forest' },
  takeshita: { ja: 'クレープの甘いにおいの通り', en: 'A street that smells of crêpes' }, ekimae: { ja: '駅前の坂をかけのぼる', en: 'Up the busy slope from the station' }, daikanyama: { ja: 'カフェがならぶ坂の町', en: 'A hillside of cafés' },
  meguro: { ja: '川ぞいの並木道', en: 'Along the tree-lined river' }, roppongi: { ja: '赤い電波塔へ続く坂', en: 'Down the slope toward the red tower' }, gyoen: { ja: '広い芝生の庭園', en: 'Across the wide lawns' },
  yokocho: { ja: 'やきとりの煙の横丁', en: 'Through the yakitori smoke' }, ikebukuro: { ja: 'ゲームと映画の繁華街', en: 'Arcades and cinemas' }, shinokubo: { ja: '韓国料理のにおいの町', en: 'The smell of Korean street food' },
  zojoji: { ja: '朱色の門と赤い電波塔', en: 'A vermilion gate and the red tower' }, toyosu: { ja: '海ぞいの遊歩道', en: 'Along the waterfront' }, kaihin: { ja: '砂浜をかけぬける', en: 'Dash along the sand' },
});
Object.assign(SEASONAL, {
  meguro: { spring: { ja: '目黒川の桜', en: 'Meguro River cherries', tree: 'sakura', petals: 1, spat: 'petals', side: ['#B7A797', '#AE9E8E'], rpat: 'petalstone', props: [['bonbori', 3], ['benchS', 1]], obs: ['picnic', 'tripod', 'bench', 'stroller', 'cone'], arrive: { ja: '川の上をおおう桜のトンネル', en: 'Cherry blossoms arching over the river' } },
    winter: { ja: '目黒川・冬のイルミネーション', en: 'Meguro River winter lights', tree: 'illum', arrive: { ja: '川ぞいの木々に冬の光', en: 'Winter lights along the river' } } },
  gyoen: { spring: { ja: '新宿御苑・お花見', en: 'Shinjuku Gyoen in blossom', tree: 'sakura', petals: 1, spat: 'petals', side: ['#B7A797', '#AE9E8E'], props: [['benchS', 1], ['lampC', 1]], arrive: { ja: '芝生の上に満開の桜', en: 'Cherry trees in full bloom over the lawns' } },
    autumn: { ja: '新宿御苑・紅葉', en: 'Shinjuku Gyoen autumn', tree: 'ginkgo', leaves: 1, spat: 'leaves', side: ['#D9B84A', '#D1AF42'], arrive: { ja: '黄色と赤の秋の庭園', en: 'A garden of gold and red leaves' } } },
  hibiya: { autumn: { ja: '日比谷公園・秋', en: 'Hibiya Park in autumn', tree: 'ginkgo', leaves: 1, spat: 'leaves', side: ['#D9B84A', '#D1AF42'] }, winter: { ja: '日比谷公園・冬', en: 'Hibiya Park in winter', tree: 'bare' } },
  shinobazu: { summer: { ja: '不忍池・ハスの花', en: 'Shinobazu lotus in bloom', arrive: { ja: '池いっぱいのハスの花', en: 'The pond covered in lotus flowers' } } },
});

function themeFor(tid, day) { const b = THEMES[tid], v = SEASONAL[tid] && SEASONAL[tid][seasonOf(day)]; return v ? Object.assign({}, b, v, { base: b }) : b; }
function resetRoutes(avoid) { ROUTE.used = new Set(); ROUTE.avoid = avoid || []; }
function takeSpots(n, not) {
  const okS = x => !THEMES[x].only || THEMES[x].only.includes(ROUTE.season);
  let pool = SINGLES.filter(x => okS(x) && !ROUTE.used.has(x) && !(not || []).includes(x) && !ROUTE.avoid.includes(x));
  if (pool.length < n) { ROUTE.used = new Set(); pool = SINGLES.filter(x => okS(x) && !(not || []).includes(x)); }
  const out = []; while (out.length < n && pool.length) { const i = (Math.random() * pool.length) | 0; out.push(pool.splice(i, 1)[0]); }
  out.forEach(x => ROUTE.used.add(x)); ROUTE.avoid = []; return out;
}
const lblOf = tid => { const ja = THEMES[tid].lbl || THEMES[tid].ja.split('・')[0], en = THEMES[tid].lblEn || (s => s.length > 16 && THEMES[tid].stamp ? THEMES[tid].stamp.en : s)(THEMES[tid].en.split(',')[0]);
  return { ja, en, zh: (I18N.zh || {})[ja] || en, ko: (I18N.ko || {})[ja] || en }; }; // short place names in all four languages
/* ================= where things are, and what comes next =================
   Every pick prefers what you have not seen for the longest time, across runs (SV.seen is updated when you
   actually enter a place), so the scenery keeps changing for a long while before anything comes round again. */
const AREA = {
  central: ['ginza', 'yurakucho', 'kokyo', 'nakadori', 'chidori', 'nihonbashi', 'tsukiji', 'hibiya', 'jimbocho', 'kagurazaka', 'shiodome', 'hamarikyu'],
  east: ['akihabara', 'ameyoko', 'ueno', 'asakusa', 'yanaka', 'nezu', 'dougu', 'ryogoku', 'kiyosumi', 'sumidakoen', 'shinobazu'],
  west: ['shibuya', 'omotesando', 'gaien', 'shinjuku', 'kabukicho', 'takeshita', 'ekimae', 'daikanyama', 'meguro', 'roppongi', 'gyoen', 'ikebukuro', 'shinokubo', 'sando'],
  bay: ['toyosu', 'kaihin'],
};
const NIGHT = { east: ['asakusa', 'ameyoko', 'akihabara', 'ueno', 'ryogoku'], west: ['kabukicho', 'shibuya', 'shinjuku', 'roppongi', 'yokocho', 'ikebukuro', 'shinokubo', 'ekimae'], bay: ['shinbashi', 'ginza', 'nakadori', 'yurakucho'] };
Object.assign(THEMES, {
  /* ---- arriving at / leaving the office district ---- */
  otemachi: { ja: '大手町・朝のオフィス街', lbl: '大手町', lblEn: 'Otemachi', en: 'Otemachi office district', kind: 'street', len: [92, 104], road: ['#6E6F74', '#68696E'], rpat: 'road', side: ['#C9C5BD', '#C1BDB5'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'glass', h: [40, 80], pal: ['#91A6B8', '#A3B5C4', '#7F95A8', '#B4C3D1'] }, props: [['tree', 3], ['lampC', 2], ['planter', 1]], obs: ['cone', 'kick', 'bike', 'barrier', 'car'], tree: 'green', flat: 1 },
  gyoko:    { ja: '行幸通り', lblEn: 'Gyoko-dori', en: 'Gyoko-dori boulevard', kind: 'street', len: [92, 104], road: ['#C9C2B6', '#BFB8AB'], rpat: 'plaza', side: ['#BDB5A7', '#B3AB9D'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'luxury', h: [28, 40], pal: ['#D9D0BF', '#C9C3B8', '#E3DACA', '#9FB4C6'] }, props: [['coneTree', 3], ['lampC', 2]], obs: ['bench', 'cone', 'kick', 'flowers'], tree: 'ginkgo', cone: 'canopy_coneG', flat: 1, lm: [{ t: 'yagura', sc: .7, off: 0 }] },
  freeaddr: { ja: '執務室・窓ぎわのフリーアドレス', lbl: '窓ぎわの執務室', lblEn: 'Window desks', en: 'Open-plan office by the windows', kind: 'room', len: [80, 92], road: ['#B9B2A5', '#B1AA9D'], rpat: 'boards', side: ['#8F969C', '#878E94'], spat: 'carpet',
    wall: '#F3F4F2', base: '#5A646E', wallH: 3.2, ceil: '#F2F3F1', cpat: 'grid', light: 'panel', wdeco: ['citywin', 'citywin', 'plantwall', 'citywin', 'clock'], props: [['desk', 4], ['plant', 2], ['sofaO', 1]], obs: ['papers', 'chair', 'box', 'mug', 'plant'] },
  /* ---- more sights ---- */
  hie:      { ja: '赤坂・山王の鳥居の坂', lbl: '山王の鳥居', en: 'Akasaka torii steps', kind: 'street', len: [96, 108], road: ['#B9AE9C', '#AFA392'], rpat: 'stone', side: ['#7FA35E', '#77995A'], spat: 'lawn', curb: '#8A7A5A',
    fac: { style: 'park' }, toriiTunnel: 1, props: [['stoneLantern', 2], ['tree', 2]], obs: ['bench', 'stoneLanternO', 'cone', 'leafpile'], tree: 'green', lm: [{ t: 'cyl', sc: .8, off: .25 }], flat: 1,
    stamp: ST('山王', '山王の鳥居', 'Sanno torii', '高層ビルのすぐ横に、赤い鳥居が続く坂の参道がある。', 'A slope of red torii gates right beside the skyscrapers.') },
  tsukishima:{ ja: '月島・もんじゃの町', lbl: '月島', en: 'Tsukishima monja street', kind: 'street', len: [96, 108], road: ['#7A7B80', '#74757A'], rpat: 'road', side: ['#B8B2A6', '#B0AA9E'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'market', mood: 'monja', h: [6, 12], pal: ['#E9E2D5', '#D6CDBF', '#C9BFAF', '#F3E8DA'] }, props: [['nobori', 3], ['vending', 1], ['bikes', 1]], obs: ['bike', 'sign', 'cone', 'stoolsO', 'kick'], lm: [{ t: 'cyl', sc: .7, off: -.25 }],
    stamp: ST('月島', '月島', 'Tsukishima', '鉄板で焼くもんじゃ焼きの店が70軒以上ならぶ。路地には古い長屋も残る。', 'Over seventy griddle restaurants serving monja-yaki (a runny savory pancake), with old row houses in the alleys.') },
  kanda:    { ja: '神田・明神さまの門前', lbl: '神田の門前', en: 'Kanda shrine approach', kind: 'street', len: [96, 108], road: ['#C9C2B6', '#BFB8AB'], rpat: 'plaza', side: ['#BDB5A7', '#B3AB9D'], spat: 'stone', curb: '#9A9384',
    fac: { style: 'nakamise', h: [4.5, 6], pal: ['#C9432F', '#B83B29', '#D04A33'] }, torii: '#9A8A7A', toriiTop: '#4A4F57', props: [['chochin', 3], ['stoneLantern', 1]], obs: ['bench', 'rickshaw', 'stoneLanternO', 'cone'], flat: 1,
    stamp: ST('神田', '神田の明神さま', 'Kanda shrine', '江戸の町を守ってきた神社の門前。商売繁盛を願う会社員も多くお参りする。', 'The approach to the shrine that has watched over Tokyo since it was Edo; many office workers pray here for good business.') },
  kuramae:  { ja: '蔵前・川沿いの工房の町', lbl: '蔵前', en: 'Kuramae workshops', kind: 'street', len: [96, 108], road: ['#7A7B80', '#74757A'], rpat: 'road', side: ['#B8B2A6', '#B0AA9E'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'mixed', h: [6, 14], pal: ['#D6CDBF', '#B5A48A', '#9A8E80', '#E9E2D5', '#8A8F99'] }, props: [['cafe', 2], ['bikes', 1], ['planter', 1], ['tree', 1]], obs: ['bike', 'cone', 'bench', 'box', 'kick'], lm: [{ t: 'skytree', sc: 1.1, off: .2 }],
    stamp: ST('蔵前', '蔵前', 'Kuramae', '革小物や文房具の工房、コーヒーの店が集まる、ものづくりの町。', 'A craft neighborhood of leather and stationery workshops and coffee roasters.') },
  terrace:  { ja: '隅田川テラス', lbl: '隅田川テラス', en: 'Sumida riverside terrace', kind: 'street', len: [100, 112], road: ['#C9C1B2', '#BFB7A8'], rpat: 'plaza', side: ['#A8A49C', '#A09C94'], spat: 'walk', curb: '#8A8470',
    fac: { style: 'park' }, moat: 1, props: [['lampC', 3], ['benchS', 1], ['planter', 1]], obs: ['bike', 'bench', 'stroller', 'cone', 'kick'], tree: 'green', lm: [{ t: 'skytree', sc: 1.3, off: .25 }],
    stamp: ST('川テ', '隅田川テラス', 'Sumida terrace', '川べりの遊歩道。色ちがいの橋がいくつも見え、夜は橋がライトアップされる。', 'A riverside walk with a run of differently colored bridges, lit up at night.') },
  shibamata:{ ja: '柴又・帝釈天の参道', lbl: '柴又', en: 'Shibamata temple street', kind: 'street', len: [96, 108], road: ['#B9AE9C', '#AFA392'], rpat: 'stone', side: ['#A89C88', '#9F937F'], spat: 'stone',
    fac: { style: 'nakamise', h: [4.5, 6], pal: ['#7A5538', '#6B4631', '#8A6444'] }, props: [['chochin', 3], ['nobori', 2]], obs: ['bench', 'rickshaw', 'jokoro', 'stoolsO'], flat: 1,
    stamp: ST('柴又', '柴又の参道', 'Shibamata', 'お寺へ続く参道に、草だんごやせんべいの老舗がならぶ。昔の映画の舞台としても知られる。', 'A temple street of old shops selling mugwort dumplings and rice crackers, famous from classic films.') },
  catst:    { ja: '原宿・キャットストリート', lbl: 'キャットストリート', en: 'Harajuku Cat Street', kind: 'street', len: [96, 108], road: ['#9A968E', '#928E86'], rpat: 'brickroad', side: ['#A8A49C', '#A09C94'], spat: 'walk', curb: '#C9C5BD',
    fac: { style: 'luxury', h: [6, 12], pal: ['#E8E1D3', '#C9C3B8', '#8A8F99', '#F3EEE6', '#B5A48A'] }, props: [['planter', 2], ['bikes', 1], ['cafe', 1]], obs: ['bike', 'kick', 'stroller', 'cone', 'bags'], hill: -1,
    stamp: ST('猫通', 'キャットストリート', 'Cat Street', '昔の川をふさいでできた、くねくねした裏通り。古着や雑貨の店が多い。', 'A winding back street built over an old river, lined with vintage and design shops.') },
  shimokita:{ ja: '下北沢・古着の町', lbl: '下北沢', en: 'Shimokitazawa', kind: 'street', len: [92, 104], road: ['#7A7B80', '#74757A'], rpat: 'road', side: ['#A8A49C', '#A09C94'], spat: 'walk', curb: '#C9C5BD',
    fac: { style: 'neon', mood: 'harajuku', h: [6, 12], pal: ['#E9E2D5', '#C9BFAF', '#8A8F99', '#D6CDBF'], screen: .1, vsign: .6 }, props: [['stall', 2], ['bikes', 2], ['vending', 1]], obs: ['bike', 'sign', 'bags', 'cone', 'stoolsO'],
    stamp: ST('下北', '下北沢', 'Shimokitazawa', '古着屋と小さな劇場、ライブハウスの町。細い道がくねくね続く。', 'A maze of narrow streets full of vintage shops, small theaters and live-music clubs.') },
  yoyogi:   { ja: '代々木公園', en: 'Yoyogi Park', kind: 'street', len: [100, 112], road: ['#C8B58F', '#BFAC86'], rpat: 'gravel', side: ['#7FA35E', '#77995A'], spat: 'lawn', curb: '#8A7A5A',
    fac: { style: 'park' }, props: [['tree', 4], ['benchS', 1], ['lampC', 1]], obs: ['bike', 'picnic', 'bench', 'stroller', 'cone'], tree: 'green', lm: [{ t: 'cyl', sc: .6, off: .3 }],
    stamp: ST('代公', '代々木公園', 'Yoyogi Park', '広い芝生とサイクリングコースの公園。週末は音楽やダンスの練習をする人でにぎわう。', 'Wide lawns and a cycling track; on weekends it fills with people practicing music and dance.') },
  kichijoji:{ ja: '吉祥寺・池のボート', lbl: '吉祥寺', en: 'Kichijoji pond', kind: 'street', len: [100, 112], road: ['#C8B58F', '#BFAC86'], rpat: 'gravel', side: ['#7FA35E', '#77995A'], spat: 'lawn', curb: '#8A7A5A',
    fac: { style: 'park' }, moat: -1, boats: 1, props: [['tree', 3], ['benchS', 1], ['lampC', 1]], obs: ['bench', 'stroller', 'leafpile', 'cone'], tree: 'green',
    stamp: ST('吉祥', '吉祥寺の池', 'Kichijoji', '大きな池でスワンボートがこげる公園。まわりは住みたい町として人気。', 'A park pond with swan boats, in one of Tokyo’s most popular neighborhoods.') },
  takeshiba:{ ja: '竹芝ふ頭', lbl: '竹芝', en: 'Takeshiba pier', kind: 'deck', len: [100, 112], road: ['#BDB7AC', '#B5AFA4'], rpat: 'planks', side: ['#2B5F86', '#285A80'], spat: 'water', view: 'sea', rail: '#E9EEF2',
    props: [['buoyS', 1]], obs: ['bench', 'ring', 'rope', 'cone', 'suitcase'], lm: [{ t: 'tower', sc: 1.1, off: -.2 }],
    stamp: ST('竹芝', '竹芝ふ頭', 'Takeshiba pier', '島へ向かう船が出る港。海の向こうに吊り橋、ふり返ると赤い電波塔。', 'The pier for ferries to the islands, with the suspension bridge ahead and the red tower behind.') },
});
SEASONAL.kichijoji = { spring: { ja: '吉祥寺・池の桜', en: 'Kichijoji pond in blossom', tree: 'sakura', petals: 1 } };
SEASONAL.yoyogi = { autumn: { ja: '代々木公園・イチョウ', en: 'Yoyogi Park ginkgo', tree: 'ginkgo', leaves: 1, spat: 'leaves', side: ['#D9B84A', '#D1AF42'] } };
Object.assign(ARRIVE, {
  otemachi: { ja: 'ビルの谷間を出社する人の波', en: 'Swept along with the morning crowd' }, gyoko: { ja: '駅からお堀へまっすぐのびる並木道', en: 'The straight avenue from the station to the moat' }, freeaddr: { ja: '窓ぎわの席はもう埋まりそう', en: 'The window seats are filling up' },
  hie: { ja: 'ビルの横の鳥居の坂', en: 'Torii steps beside the towers' }, tsukishima: { ja: '鉄板の音がひびく町', en: 'The sizzle of griddles' }, kanda: { ja: '商売繁盛をお願い', en: 'A quick prayer for good business' },
  kuramae: { ja: 'コーヒーと革の香り', en: 'Coffee and leather in the air' }, terrace: { ja: '川べりのテラスを走る', en: 'Along the riverside terrace' }, shibamata: { ja: '草だんごの参道', en: 'A street of mugwort dumplings' },
  catst: { ja: 'くねくねの裏通り', en: 'Down the winding back street' }, shimokita: { ja: '古着とライブハウスの町', en: 'Vintage shops and live music' }, yoyogi: { ja: '芝生の広場をかけぬける', en: 'Across the big lawns' },
  kichijoji: { ja: '池のボートを横目に', en: 'Past the swan boats' }, takeshiba: { ja: '島へ向かう船の港', en: 'Where the island ferries leave' },
});
AREA.central.push('hie', 'tsukishima', 'kanda'); AREA.east.push('kuramae', 'terrace', 'shibamata'); AREA.west.push('catst', 'shimokita', 'yoyogi', 'kichijoji'); AREA.bay.push('takeshiba');
NIGHT.west.push('shimokita'); NIGHT.bay.push('tsukishima'); NIGHT.east.push('terrace');

Object.assign(THEMES, {
  chikagai: { ja: '東京駅の地下街', lbl: '駅の地下街', en: 'Station underground mall', kind: 'room', len: [88, 100], road: ['#D9D2C6', '#CFC7BA'], rpat: 'grid', side: ['#CFC7BA', '#C5BDB0'], spat: 'grid',
    wall: '#F3EFE7', base: '#6E5A48', wallH: 3.2, ceil: '#ECE6DA', cpat: 'grid', light: 'panel', wdeco: ['izakaya', 'menu', 'poster', 'menuboard', 'izakaya'], props: [['plant', 1], ['benchS', 1]], obs: ['suitcase', 'bag', 'sign', 'cone', 'stroller'],
    stamp: ST('地下', '駅の地下街', 'Underground mall', '駅の地下にのびる大きな商店街。おみやげやラーメンの店がずらり。', 'A huge shopping street under the station, packed with souvenir shops and ramen counters.') },
  ochanomizu:{ ja: '御茶ノ水・楽器店の坂', lbl: '御茶ノ水', en: 'Ochanomizu guitar street', kind: 'street', len: [96, 108], road: ['#76777C', '#707176'], rpat: 'road', side: ['#B8B2A6', '#B0AA9E'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'neon', h: [8, 18], pal: ['#D6CDBF', '#C9BFAF', '#8A8F99', '#E9E2D5'], screen: .2, vsign: .6 }, props: [['vending', 1], ['pole', 1], ['bikes', 1], ['tree', 1]], obs: ['bike', 'sign', 'cone', 'kick', 'box'], hill: 1,
    stamp: ST('御茶', '御茶ノ水', 'Ochanomizu', 'ギターや楽器の店が坂にならぶ。谷の下を電車と川がならんで走る。', 'Guitar shops line the slope, with trains and a river running side by side in the valley below.') },
  koishikawa:{ ja: '小石川の大名庭園', lbl: '小石川の庭園', en: 'Koishikawa garden', kind: 'street', len: [96, 108], road: ['#C8B58F', '#BFAC86'], rpat: 'gravel', side: ['#7FA35E', '#77995A'], spat: 'lawn', curb: '#8A7A5A',
    fac: { style: 'park' }, moat: 1, props: [['pinetree', 3], ['stoneLantern', 2]], obs: ['bench', 'stoneLanternO', 'leafpile', 'cone'], tree: 'pine',
    stamp: ST('小石', '小石川の庭園', 'Koishikawa', '江戸時代の大名の庭。池や橋で、中国や日本の名所を小さく再現している。', 'An Edo-era lord’s garden recreating famous Chinese and Japanese scenery in miniature.') },
  akasaka:  { ja: '赤坂・夜の飲食店街', lbl: '赤坂', en: 'Akasaka at night', kind: 'street', len: [96, 108], road: ['#5E5E63', '#59595E'], rpat: 'road', side: ['#9D988F', '#958F86'], spat: 'walk', curb: '#B9B2A5',
    fac: { style: 'neon', mood: 'shinbashi', h: [10, 22], pal: ['#6E7480', '#8A8F99', '#C9C5BD', '#5E6470'], screen: .2, vsign: .9 }, props: [['chochin', 2], ['vending', 1], ['signal', 1]], obs: ['cone', 'sign', 'car', 'kick', 'box'], hill: -1,
    stamp: ST('赤坂', '赤坂', 'Akasaka', '料亭や焼肉、韓国料理の店がひしめく、大人の飲食店街。', 'A grown-up nightlife district of traditional restaurants, barbecue and Korean food.') },
  okachimachi:{ ja: '御徒町・宝石と問屋の町', lbl: '御徒町', en: 'Okachimachi wholesale', kind: 'street', len: [96, 108], road: ['#7A7B80', '#74757A'], rpat: 'road', side: ['#B8B2A6', '#B0AA9E'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'market', left: 'viaduct', h: [6, 12], pal: ['#E9E2D5', '#D6CDBF', '#9FB4C6', '#F3E8DA'] }, props: [['stall', 2], ['bikes', 1]], obs: ['box', 'crate', 'bike', 'cone', 'sign'], rumble: 1,
    stamp: ST('徒町', '御徒町', 'Okachimachi', '宝石の問屋や高架下の店がならぶ。上野まで商店街がつづく。', 'Jewelry wholesalers and shops under the tracks, all the way up to Ueno.') },
  monzen:   { ja: '門前仲町・深川のお不動さま', lbl: '門前仲町', en: 'Monzen-nakacho temple street', kind: 'street', len: [96, 108], road: ['#B9AE9C', '#AFA392'], rpat: 'stone', side: ['#A89C88', '#9F937F'], spat: 'stone',
    fac: { style: 'nakamise', h: [4.5, 6.5], pal: ['#C9432F', '#8A6444', '#B83B29'] }, props: [['chochin', 3], ['nobori', 2], ['stoneLantern', 1]], obs: ['bench', 'rickshaw', 'jokoro', 'stoolsO'], flat: 1,
    stamp: ST('門仲', '門前仲町', 'Monzen-nakacho', 'お寺と神社の門前町。毎月の縁日には屋台がならぶ。', 'A temple-and-shrine town with stalls on its monthly fair days.') },
  kiba:     { ja: '木場公園と運河', lbl: '木場', en: 'Kiba park and canals', kind: 'street', len: [100, 112], road: ['#C8B58F', '#BFAC86'], rpat: 'gravel', side: ['#7FA35E', '#77995A'], spat: 'lawn', curb: '#8A7A5A',
    fac: { style: 'park' }, moat: -1, props: [['tree', 4], ['benchS', 1], ['lampC', 1]], obs: ['bike', 'bench', 'stroller', 'cone', 'leafpile'], tree: 'green', lm: [{ t: 'skytree', sc: 1, off: .25 }],
    stamp: ST('木場', '木場公園', 'Kiba Park', '昔は材木を水にうかべていた町。運河と大きな公園がある。', 'Once a timber town where logs floated in the canals; now a big park.') },
  ebisu:    { ja: '恵比寿・横丁と坂の町', lbl: '恵比寿', en: 'Ebisu side streets', kind: 'street', len: [96, 108], road: ['#7A7B80', '#74757A'], rpat: 'road', side: ['#B8B2A6', '#B0AA9E'], spat: 'walk', curb: '#D9D6CE',
    fac: { style: 'luxury', h: [8, 18], pal: ['#E8E1D3', '#B5A48A', '#C9C3B8', '#9FB4C6'] }, props: [['cafe', 2], ['lampC', 1], ['tree', 1]], obs: ['bike', 'bench', 'cone', 'kick', 'stroller'], tree: 'zelkova', hill: 1,
    stamp: ST('恵比', '恵比寿', 'Ebisu', 'おしゃれなレストランと横丁がまざる町。駅前に大きな神さまの像がある。', 'Smart restaurants and little alley bars side by side, with a statue of Ebisu, god of good fortune, by the station.') },
  nakano:   { ja: '中野・アーケード商店街', lbl: '中野', en: 'Nakano arcade', kind: 'room', len: [92, 104], road: ['#C9C2B6', '#BFB8AB'], rpat: 'grid', side: ['#BFB8AB', '#B5AE9F'], spat: 'grid',
    wall: '#E9E2D5', base: '#6E5A48', wallH: 4.4, ceil: '#C9D4DE', cpat: 'beams', light: 'strip', wdeco: ['izakaya', 'poster', 'menu', 'poster', 'bookshelf'], props: [['vending', 1], ['bikes', 1]], obs: ['bike', 'bags', 'sign', 'cone', 'stroller'],
    stamp: ST('中野', '中野', 'Nakano', '屋根つきの長い商店街の先に、マンガやおもちゃの店が集まるビルがある。', 'A long covered shopping street leading to a building packed with manga and toy shops.') },
  koenji:   { ja: '高円寺・おどりの町', lbl: '高円寺', en: 'Koenji', kind: 'street', len: [92, 104], road: ['#9A968E', '#928E86'], rpat: 'stone', side: ['#A8A49C', '#A09C94'], spat: 'walk', curb: '#C9C5BD',
    fac: { style: 'market', mood: 'yanaka', h: [5, 9], pal: ['#E9E2D5', '#C9BFAF', '#B5A48A', '#F3E8DA'] }, props: [['chochin', 3], ['bikes', 2], ['stall', 1]], obs: ['bike', 'stoolsO', 'sign', 'bags', 'cone'],
    stamp: ST('高円', '高円寺', 'Koenji', '古着屋と古い商店街の町。夏は大きなおどりのお祭りでにぎわう。', 'Vintage shops and old shopping streets; a huge dance festival fills it in summer.') },
  jiyugaoka:{ ja: '自由が丘・スイーツの町', lbl: '自由が丘', en: 'Jiyugaoka sweets street', kind: 'street', len: [96, 108], road: ['#9A968E', '#928E86'], rpat: 'brickroad', side: ['#C9C1B2', '#BFB7A8'], spat: 'walk', curb: '#E6E2DA',
    fac: { style: 'luxury', h: [6, 12], pal: ['#F3EEE6', '#E8E1D3', '#F6E9E0', '#D9D0BF'] }, props: [['cafe', 2], ['planter', 2], ['tree', 1]], obs: ['stroller', 'bench', 'flowers', 'cone', 'bags'], tree: 'green',
    stamp: ST('自由', '自由が丘', 'Jiyugaoka', 'ケーキやスイーツの店が多い、ヨーロッパ風の町並み。', 'European-style streets famous for cake and sweet shops.') },
  sangenjaya:{ ja: '三軒茶屋・路地の三角地帯', lbl: '三軒茶屋', en: 'Sangenjaya alleys', kind: 'room', len: [88, 100], road: ['#5E5A53', '#57534C'], rpat: 'stone', side: ['#55514A', '#4E4A44'], spat: 'stone',
    wall: '#4A3A32', base: '#2B1A12', wallH: 3.4, ceil: '#2E2E34', cpat: 'girder', light: 'bulb', wdeco: ['izakaya', 'menu', 'izakaya', 'poster'], props: [['chochin', 3], ['crates', 1], ['stools', 1]], obs: ['stoolsO', 'crate', 'box', 'noren'],
    stamp: ST('三茶', '三軒茶屋', 'Sangenjaya', '大通りにはさまれた三角形の区画に、小さな飲み屋が迷路のようにならぶ。', 'A triangle between two big roads, packed with a maze of tiny bars.') },
  yotsuya:  { ja: '四谷・外堀の土手', lbl: '外堀の土手', en: 'Outer moat bank, Yotsuya', kind: 'street', len: [100, 112], road: ['#C8B58F', '#BFAC86'], rpat: 'gravel', side: ['#7FA35E', '#77995A'], spat: 'lawn', curb: '#8A7A5A',
    fac: { style: 'park' }, moat: 1, props: [['tree', 4], ['benchS', 1]], obs: ['bench', 'stroller', 'leafpile', 'cone'], tree: 'green',
    stamp: ST('外堀', '外堀の土手', 'Outer moat', '江戸城の外堀の土手が、線路ぞいの長い並木道になっている。', 'The bank of the old castle’s outer moat, now a long tree-lined walk beside the tracks.') },
  ichigaya: { ja: '市ヶ谷・お堀の釣り堀', lbl: '市ヶ谷', en: 'Ichigaya moat fishing', kind: 'street', len: [96, 108], road: ['#B9AE9C', '#AFA392'], rpat: 'stone', side: ['#A8A49C', '#A09C94'], spat: 'walk', curb: '#8A8470',
    fac: { style: 'park' }, moat: -1, boats: 1, props: [['lampC', 2], ['benchS', 1], ['tree', 2]], obs: ['bike', 'bench', 'cone', 'kick'], tree: 'green',
    stamp: ST('市谷', '市ヶ谷', 'Ichigaya', '駅のすぐ前のお堀で、釣り堀やボートが楽しめる。', 'Right outside the station, the old moat has a fishing pond and boats.') },
  tennozu:  { ja: '天王洲・運河のボードウォーク', lbl: '天王洲', en: 'Tennozu canal boardwalk', kind: 'deck', len: [100, 112], road: ['#B9895A', '#AF8052'], rpat: 'planks', side: ['#2B5F86', '#285A80'], spat: 'water', view: 'river', rail: '#E9EEF2',
    props: [['buoyS', 1]], obs: ['bench', 'bike', 'cone', 'stroller'], lm: [{ t: 'tower', sc: .8, off: .25 }],
    stamp: ST('天王', '天王洲', 'Tennozu', '運河ぞいの木の遊歩道。壁のアートやギャラリーが多い。', 'A wooden boardwalk along the canal, with murals and galleries.') },
  harumi:   { ja: '晴海ふ頭', lbl: '晴海', en: 'Harumi pier', kind: 'deck', len: [100, 112], road: ['#BDB7AC', '#B5AFA4'], rpat: 'plaza', side: ['#2B5F86', '#285A80'], spat: 'water', view: 'sea', rail: '#E9EEF2',
    props: [], obs: ['bench', 'ring', 'cone', 'rope', 'stroller'], lm: [{ t: 'tower', sc: .9, off: -.2 }, { t: 'fuji', sc: .8, off: .3 }],
    stamp: ST('晴海', '晴海ふ頭', 'Harumi pier', '大きな客船が来る港。海の向こうに都心のビルと吊り橋が見える。', 'A cruise-ship pier with the city towers and the suspension bridge across the water.') },
  kachidoki:{ ja: '勝どき橋', en: 'Kachidoki Bridge', kind: 'deck', len: [100, 112], road: ['#6E6F74', '#68696E'], rpat: 'road', side: ['#2E6E99', '#2A6690'], spat: 'water', view: 'river', rail: '#7F95A8', bridge: 1,
    props: [], obs: ['cone', 'kick', 'car', 'bike', 'barrier'], lm: [{ t: 'cyl', sc: .8, off: .2 }],
    stamp: ST('勝鬨', '勝どき橋', 'Kachidoki Bridge', '昔は真ん中が開いて船を通した、鉄の跳ね橋。', 'An iron drawbridge whose middle once opened to let ships through.') },
  monorail: { ja: '空港へのモノレール（車内）', lbl: 'モノレール', en: 'Airport monorail', kind: 'train', len: [92, 104], road: ['#9AA6B2', '#93A0AC'], rpat: 'train', side: ['#93A0AC', '#8C99A5'], spat: 'train',
    wall: '#EEF2F5', base: '#2D86C4', wallH: 2.8, ceil: '#E4E9ED', cpat: 'plain', light: 'strip', wdeco: ['seatwin', 'seatwin', 'door', 'seatwin', 'trainmap'], props: [['nakazuri', 2], ['seat', 4], ['strapS', 2]], obs: ['pole', 'suitcase', 'suitcase', 'bag'], lc: '#2D86C4',
    stamp: ST('モノ', '空港へのモノレール', 'Airport monorail', '運河や倉庫の上を走って空港へむかう、一本のレールの電車。', 'A one-rail train gliding over canals and warehouses out to the airport.') },
  kuko:     { ja: '羽田・空港の出発ロビー', lbl: '空港の出発ロビー', en: 'Airport departure hall', kind: 'room', len: [92, 104], road: ['#DAD7D0', '#D0CCC4'], rpat: 'grid', side: ['#D0CCC4', '#C6C2BA'], spat: 'grid',
    wall: '#EEF1F4', base: '#5E6B78', wallH: 4.6, ceil: '#E6EAEE', cpat: 'beams', light: 'panel', wdeco: ['flightboard', 'planewin', 'planewin', 'flightboard', 'planewin'], props: [['checkin', 3], ['cartS', 1], ['plant', 1], ['benchS', 1]], obs: ['suitcase', 'cart', 'cart', 'bags', 'cone', 'plant'],
    stamp: ST('出発', '空港の出発ロビー', 'Departure hall', '大きな窓の向こうに飛行機。案内板の行き先がパタパタ変わる。', 'Planes beyond the tall windows, and a board flipping to new destinations.') },
  kukodeck: { ja: '羽田・空港の展望デッキ', lbl: '空港の展望デッキ', en: 'Airport observation deck', kind: 'deck', len: [100, 112], road: ['#B9895A', '#AF8052'], rpat: 'planks', side: ['#2B5F86', '#285A80'], spat: 'water', view: 'sea', rail: '#E9EEF2',
    props: [['benchS', 1], ['scopeS', 1]], obs: ['bench', 'suitcase', 'cart', 'cone', 'stroller'], lm: [{ t: 'airport', sc: 1, off: .06 }, { t: 'fuji', sc: .7, off: -.5 }],
    stamp: ST('空港', '空港の展望デッキ', 'Airport deck', '海ぞいの空港の屋上。目の前の滑走路から飛行機が次々に飛び立つ。', 'A rooftop by the bay where planes take off one after another right in front of you.') },
});
Object.assign(ARRIVE, {
  monorail: { ja: '一本のレールで空港へ', en: 'One rail out to the airport' }, kuko: { ja: '飛行機の見える出発ロビー', en: 'A departure hall with planes outside' }, kukodeck: { ja: '飛び立つ飛行機を見送る', en: 'Watch the planes take off' },
  chikagai: { ja: 'おみやげ屋がならぶ地下街', en: 'A subterranean street of souvenir shops' }, ochanomizu: { ja: 'ギターの店がならぶ坂', en: 'Up the slope of guitar shops' }, koishikawa: { ja: '江戸の大名の庭', en: "An Edo lord's garden" },
  akasaka: { ja: '料亭と焼肉のにおい', en: 'Restaurants and barbecue smoke' }, okachimachi: { ja: '高架下の問屋街', en: 'Wholesalers under the tracks' }, monzen: { ja: '縁日の門前町', en: 'A temple town on fair day' },
  kiba: { ja: '運河と大きな公園', en: 'Canals and a big park' }, ebisu: { ja: '坂の上のレストラン街', en: 'Restaurants up the slope' }, nakano: { ja: '屋根つきの長い商店街', en: 'A long covered arcade' },
  koenji: { ja: '古着とちょうちんの町', en: 'Vintage shops and lanterns' }, jiyugaoka: { ja: 'ケーキの甘いにおい', en: 'The smell of cake' }, sangenjaya: { ja: '迷路のような飲み屋の路地', en: 'A maze of tiny bars' },
  yotsuya: { ja: '外堀ぞいの並木道', en: 'Along the old outer moat' }, ichigaya: { ja: 'お堀の釣り堀', en: 'The moat fishing pond' }, tennozu: { ja: '運河ぞいの木の遊歩道', en: 'A boardwalk by the canal' },
  harumi: { ja: '客船の港', en: 'The cruise-ship pier' }, kachidoki: { ja: '鉄の跳ね橋をわたる', en: 'Across the iron drawbridge' },
});
/* 行幸通りのイチョウも、黄色いのは秋だけ（春・夏は緑、冬ははだか）2026-11-09 qa/seasontree */
SEASONAL.gyoko = { spring: { tree: 'green' }, summer: { tree: 'green' }, winter: { tree: 'bare', cone: 'canopy_coneB' } };
SEASONAL.yotsuya = { spring: { ja: '外堀の土手・桜', en: 'Outer moat cherries', tree: 'sakura', petals: 1, spat: 'petals', side: ['#B7A797', '#AE9E8E'] } };
SEASONAL.koishikawa = { autumn: { ja: '小石川の庭園・紅葉', en: 'Koishikawa autumn', tree: 'ginkgo', leaves: 1 } };
AREA.central.push('chikagai', 'ochanomizu', 'koishikawa', 'akasaka', 'yotsuya', 'ichigaya'); AREA.east.push('okachimachi', 'monzen', 'kiba'); AREA.west.push('ebisu', 'nakano', 'koenji', 'jiyugaoka', 'sangenjaya'); AREA.bay.push('tennozu', 'harumi', 'kachidoki');
NIGHT.west.push('sangenjaya', 'ebisu', 'akasaka'); NIGHT.east.push('okachimachi', 'monzen'); NIGHT.bay.push('akasaka');

const HOME_MID = ['hall', 'living', 'kitchen', 'senmen', 'washitsu', 'kaidanH'];
const MORNING_ST = ['street', 'shotengai', 'riverside'];
const STATION_EN = { '千駄木': 'Sendagi', '根津': 'Nezu', '湯島': 'Yushima', '新御茶ノ水': 'Shin-Ochanomizu', '大手町': 'Otemachi', '二重橋前': 'Nijubashimae', '町屋駅前': 'Machiya', '荒川車庫前': 'Arakawa-shako', '王子駅前': 'Oji', '飛鳥山': 'Asukayama', '庚申塚': 'Koshinzuka', '大塚駅前': 'Otsuka',
  '竹芝': 'Takeshiba', '末広町': 'Suehirocho', '上野広小路': 'Ueno-hirokoji', '日比谷': 'Hibiya', '虎ノ門': 'Toranomon', '神谷町': 'Kamiyacho', '芝浦ふ頭': 'Shibaura-futo', '台場': 'Daiba', '豊洲': 'Toyosu', '汐留': 'Shiodome', '天王洲アイル': 'Tennozu Isle', '大井競馬場前': 'Oi Keibajo-mae', '流通センター': 'Ryutsu Center', '羽田空港': 'Haneda Airport' };
const stEn = st => YAMANOTE_EN[YAMANOTE.indexOf(st)] || STATION_EN[st] || st;
function seenAt(tid) { return (SV.seen && SV.seen[tid]) || 0; }
function markSeen(tid) { if (!SV.seen) SV.seen = {}; SV.seenN = (SV.seenN || 0) + 1; SV.seen[tid] = SV.seenN; }
const okSeason = x => !THEMES[x] || !THEMES[x].only || THEMES[x].only.includes(ROUTE.season);
// n places from a list, least recently seen first (a little shuffle among equals), never twice in one day
function lruPick(list, n, today, extra, more) {
  const okX = x => okSeason(x) && !today.includes(x) && !(extra || []).includes(x);
  let cand = list.filter(x => okX(x) && !ROUTE.used.has(x)); if (cand.length < n) cand = list.filter(okX);
  // when everything here was seen recently, borrow from the neighbouring areas rather than repeat so soon
  const recent = x => seenAt(x) > 0 && seenAt(x) > (SV.seenN || 0) - 300;
  if (more && cand.filter(x => !recent(x)).length < n) for (const m of more) { cand = cand.concat(m.filter(x => okX(x) && !ROUTE.used.has(x) && !cand.includes(x))); if (cand.filter(x => !recent(x)).length >= n) break; }
  const pool = cand.map(x => [x, seenAt(x) + Math.random() * 1.5]).sort((a, b) => a[1] - b[1]);
  const top = pool.slice(0, Math.min(pool.length, n + 1)).map(x => x[0]), out = [];
  while (out.length < n && top.length) out.push(top.splice((Math.random() * top.length) | 0, 1)[0]);
  out.forEach(x => { today.push(x); ROUTE.used.add(x); }); return out;
}
function dayPlan(day) {
  ROUTE.season = seasonOf(day); ROUTE.used = new Set();
  const today = [], pk = (list, n, extra, more) => lruPick(list, n, today, extra, more), one = (list, extra) => pk(list, 1, extra)[0];
  // one of a few fixed landmarks, but only if it has not come up recently
  const notRecent = (x, w) => !seenAt(x) || seenAt(x) < (SV.seenN || 0) - w;
  const fresh = list => { const c = list.filter(x => okSeason(x) && !today.includes(x) && notRecent(x, 280)).sort((a, b) => seenAt(a) - seenAt(b)); if (!c.length) return null; today.push(c[0]); ROUTE.used.add(c[0]); return c[0]; };
  // the night spot is optional: skip it rather than show one you saw a few minutes ago
  const night = (list, more) => { const x = pk(list, 1, null, more)[0]; return x && notRecent(x, 220) ? x : null; };
  const NB = { central: [AREA.east, AREA.west], east: [AREA.central, AREA.west], west: [AREA.central, AREA.east], bay: [['shiodome', 'hamarikyu', 'tsukishima', 'tsukiji', 'terrace'], AREA.central, AREA.east] };
  /* ---- morning: the boss's house only on the first day; then by Yamanote Line, subway, or streetcar + Yamanote ---- */
  let start = [];
  const ride = one(['ym', 'sub', 'tram'].map(x => 'ride_' + x));
  if (day === 1) { const mid = SV.runs > 3 && Math.random() < .5 ? [] : [{ t: one(HOME_MID), d: 4 }]; start.push({ t: 'bedroom', d: 5 }, ...mid, { t: 'genkan', d: 4 }, { t: one(MORNING_ST), d: 6 }); }
  const used0 = start.reduce((a, x) => a + x.d, 0);
  if (ride === 'ride_sub') start.push({ t: 'subwayst', d: 5, st: '千駄木' }, { t: 'subway', d: 20, line: ['根津', '湯島', '新御茶ノ水', '大手町', '二重橋前'] });
  else if (ride === 'ride_tram') start.push({ t: 'toden', d: 14, line: ['荒川車庫前', '王子駅前', '飛鳥山', '庚申塚', '大塚駅前'] }, { t: 'station', d: 4, st: '大塚' }, { t: 'yamanote', d: 12, line: ['巣鴨', '田端', '日暮里', '上野', '秋葉原', '東京'] });
  else start.push({ t: 'station', d: 5, st: day === 1 ? '日暮里' : '田端' }, { t: 'yamanote', d: 20, line: day === 1 ? ['鶯谷', '上野', '御徒町', '秋葉原', '神田', '東京'] : ['西日暮里', '日暮里', '上野', '秋葉原', '神田', '東京'] });
  start.push({ t: ride === 'ride_sub' ? one(['otemachi', 'gyoko']) : one(['tokyoeki', 'gyoko', 'otemachi']), d: Math.max(6, 60 - start.reduce((a, x) => a + x.d, 0)) });
  const fk = (label, x, y) => ({ fork: { label, L: { t: x, d: 40 }, R: { t: y, d: 40 }, lbl: { L: lblOf(x), R: lblOf(y) } } });
  const two = (a, b) => ({ ja: lblOf(a).ja + '・' + lblOf(b).ja, en: lblOf(a).en + ' & ' + lblOf(b).en, zh: lblOf(a).zh + '・' + lblOf(b).zh, ko: lblOf(a).ko + ' & ' + lblOf(b).ko });
  /* ---- the office ---- */
  const door = one(['lobby', 'ehall']), am = one(['meeting', 'shiryo', 'yakuin', 'copy']);
  // lunch: two places near the office (the canteen and the rooftop count); spring always offers the cherry blossoms
  const lunch = pk([...AREA.central, 'shokudo', 'rooftop'], 2, null, NB.central);
  const pm = one(['kyuto', 'copy', 'shiryo', 'meeting'].filter(x => x !== am));
  // the afternoon errand: two stops in one part of town on each side
  const sides = Math.random() < .5 ? ['east', 'west'] : ['west', 'east'];
  const [a1] = pk(AREA[sides[0]], 1, null, NB[sides[0]]), [a2] = pk(AREA[sides[1]], 1, null, NB[sides[1]]);
  const office = [{ t: door, d: 20 }, { t: one(['desk', 'freeaddr']), d: 100 }, { t: am, d: 90 }, fk('lunch', lunch[0], lunch[1]), { t: pm, d: 40 }, fk('errand', a1, a2), { t: one(['kyuto', 'copy', 'shiryo'].filter(x => x !== pm && x !== am)) || 'kyuto', d: 40 }, { t: one(['deadline', 'present']), d: 170 }];
  /* ---- after six: two of three ways home (east by the Yamanote Line, south to Shiba, or out to the bay) ---- */
  const tmpl = {
    east: () => { const e = pk(AREA.east, 2, null, NB.east), boat = (Math.random() < .6 && fresh(['river', 'yakata'])) || null, hi = notRecent('skytree', 280) && !today.includes('skytree'); const n1 = night(NIGHT.east, [NIGHT.bay, NIGHT.west]);
      const go = Math.random() < .45 ? { t: 'subway', d: 15, line: ['神田', '末広町', '上野広小路', '上野'] } : { t: 'yamanote', d: 15, line: ['神田', '秋葉原', '御徒町', '上野'] };
      return { steps: [go, { t: e[0], d: 35 }, ...(boat ? [{ t: boat, d: 30 }] : []), hi ? { t: 'skytree', d: 40 } : { t: e[1] || e[0], d: 40 }, ...(n1 ? [{ t: n1, d: 40 }] : []), { t: 'yamanote', d: 30, line: ['上野', '鶯谷', '日暮里', '西日暮里', '田端'], last: 1 }],
        lbl: { ja: lblOf(e[0]).ja + '・' + (hi ? '押上の電波塔' : lblOf(e[1] || e[0]).ja), en: lblOf(e[0]).en + (hi ? ' & Oshiage tower' : ' & ' + lblOf(e[1] || e[0]).en) } }; },
    west: () => { const tw = fresh(['tower', 'zojoji']) || pk(AREA.west, 1, null, NB.west)[0], w = pk(AREA.west, 1, null, NB.west)[0], n2 = night(NIGHT.west, [NIGHT.bay, NIGHT.east]);
      const go = Math.random() < .45 ? { t: 'subway', d: 15, line: ['日比谷', '虎ノ門', '神谷町'] } : { t: 'yamanote', d: 15, line: ['有楽町', '新橋', '浜松町'] };
      return { steps: [go, { t: tw, d: 40 }, { t: w, d: 35 }, ...(n2 ? [{ t: n2, d: 40 }] : []), { t: 'yamanote', d: 30, line: ['新宿', '池袋', '巣鴨', '田端'], last: 1 }],
        lbl: { ja: lblOf(tw).ja + '・' + lblOf(w).ja, en: lblOf(tw).en + ' & ' + lblOf(w).en } }; },
    bay: () => { const by = pk(AREA.bay, Math.random() < .5 ? 1 : 2, null, NB.bay), n3 = night(NIGHT.bay, [NIGHT.west, NIGHT.east]);
      return { steps: [{ t: 'yamanote', d: 10, line: ['有楽町', '新橋'] }, { t: 'bayline', d: 20, line: ['汐留', '竹芝', '芝浦ふ頭'] }, ...(notRecent('odaiba', 280) ? [{ t: 'odaiba', d: 30 }] : []), { t: by[0], d: 35 }, ...(by[1] ? [{ t: by[1], d: 30 }] : []), ...(n3 ? [{ t: n3, d: 35 }] : []), { t: 'yamanote', d: 30, line: ['新橋', '東京', '上野', '田端'], last: 1 }],
        lbl: { ja: 'お台場・' + lblOf(by[0]).ja, en: 'Odaiba & ' + lblOf(by[0]).en } }; },
    // out to the airport by monorail: the departure hall, then the rooftop deck to watch the planes take off
    sky: () => ({ steps: [{ t: 'yamanote', d: 10, line: ['有楽町', '新橋', '浜松町'] }, { t: 'monorail', d: 18, line: ['浜松町', '天王洲アイル', '大井競馬場前', '流通センター', '羽田空港'] }, { t: 'kuko', d: 35 }, { t: 'kukodeck', d: 40 },
      { t: 'monorail', d: 15, line: ['羽田空港', '流通センター', '天王洲アイル', '浜松町'] }, { t: 'yamanote', d: 25, line: ['浜松町', '東京', '上野', '田端'], last: 1 }], lbl: { ja: '空港の展望デッキ', en: 'Airport deck' } }),
  };
  const ways = ['east', 'west', 'bay', 'sky'].map(k => [k, seenAt('way_' + k) + Math.random() + (k === 'bay' ? 25 : 0)]).sort((a, b) => a[1] - b[1]).slice(0, 2).map(x => x[0]);
  if (Math.random() < .5) ways.reverse();
  ways.forEach(k => markSeen('way_' + k));
  const W1 = tmpl[ways[0]](), W2 = tmpl[ways[1]]();
  const evening = [{ t: one(['tokyoeki', 'gyoko', 'otemachi']), d: 10, eve: 1 }, { fork: { label: 'detour', L: W1.steps, R: W2.steps, lbl: { L: W1.lbl, R: W2.lbl } } }];
  markSeen(ride);
  // a sightseeing spot lasts two stretches (round one corner and you are still there), which also spreads the places out
  const isSight = t => !!(THEMES[t] && THEMES[t].stamp && THEMES[t].kind !== 'train' && !THEMES[t].climb && !['tokyoeki', 'shokudo', 'rooftop'].includes(t));
  const dbl = st => isSight(st.t) ? [Object.assign({}, st, { d: st.d / 2 }), Object.assign({}, st, { d: st.d / 2, cont: 1 })] : [st];
  const exp = list => list.flatMap(st => st.fork ? [{ fork: Object.assign({}, st.fork, { L: (Array.isArray(st.fork.L) ? st.fork.L : [st.fork.L]).flatMap(dbl), R: (Array.isArray(st.fork.R) ? st.fork.R : [st.fork.R]).flatMap(dbl) }) }] : dbl(st));
  return exp([...start, ...office, ...evening]);
}
const HOME_T = ['bedroom', 'hall', 'living', 'kitchen', 'genkan', 'senmen', 'washitsu', 'kaidanH'];
function areaOf(tid, clock) { if (clock >= 1080) return 'evening'; if (HOME_T.includes(tid)) return 'home'; if (['street', 'station', 'yamanote', 'tokyoeki', 'shotengai', 'riverside', 'subwayst', 'subway', 'toden'].includes(tid)) return 'commute'; return 'office'; }
const STAMP_ORDER = ['yamanote', 'tokyoeki', 'ginza', 'yurakucho', 'kokyo', 'chidori', 'nakadori', 'omotesando', 'gaien', 'asakusa', 'river', 'skytree', 'tower', 'shibuya', 'akihabara', 'ameyoko', 'ueno', 'shinjuku', 'kabukicho', 'odaiba'];
{ const seen = new Set(STAMP_ORDER); for (const k in THEMES) if (THEMES[k].stamp && !seen.has(k)) STAMP_ORDER.push(k); }
