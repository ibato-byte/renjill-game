// データ引き継ぎをすみずみまで：4つの言語 × スマホ/PC で、長いコード（RJ1.）を作る → 別の新しいブラウザで復元 → 全部の記録がそろうか。
// LINE やメモ帳から貼った形（改行・全角・見えない空白・「--」が「—」に化けた・前後に文字）、こわれたコード、古い版のセーブ（Node の zlib で作った RJ1 も）、
// DecompressionStream のない古いスマホ、この端末にも記録があるときの注意、アプリ版でのランキングのアカウント（行が2つにならない）、
// 8文字のコードの入れ方（全角・「ー」・リンクごと貼る）、LINE のアプリ内ブラウザから外のブラウザへ（コードを持ったまま）。
const { chromium } = require('playwright');
const zlib = require('zlib');
const PD = process.env.PD || '8765', PA = process.env.PA || '8790';
const DIST = `http://127.0.0.1:${PD}/test.html`, APP = `http://127.0.0.1:${PA}/`;
const KEY = 'renjill-hay-dash-v1';
const today = (() => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); })();
// a long-time player with everything the newer versions keep
const RICH = lang => ({ best: 123456, bank: 98765, clovers: 7, char: 'pom', pomMet: 1, pomTold: 1, mug: true, mugOn: false, mlevel: 6, runs: 321, streak: 5, daily: today, dailyDone: 'x', lang, mute: true,
  closet: { tie_red: 1, hat_witch_ren: 1, hat_pumpkin_pom: 1, hat_laurel_pom: 1, hat_laurel_ren: 1, hat_laurel_jill: 1, suit_royal_ren: 1, suit_royal_jill: 1, suit_royal_pom: 1, frame_pink: 1 },
  wear: { ren: { tie: 'red', hat: 'laurel', suit: '' }, jill: { frame: 'pink', hat: '', suit: 'royal' }, pom: { band: 'red', hat: 'pumpkin', suit: '' } },
  upg: { dash: 3, magnet: 5, jump: 1, x2: 2, fly: 4 }, stamps: { yamanote: 2, tokyoeki: 1 }, zukan: { carrot: 1, papaya: 3 }, ach: { firstOffice: '2026-1-2', yamanote: '2026-1-3' },
  totals: { hay: 2400000, veg: 500 }, opt: { ctrl: 'tap', sens: 'high', vib: false, calm: true, music: false, sfx: true },
  lgMode: 1, lgAura: 0, lastEv: '', ref: 'line', nick: 'ひっこし' + lang, nickAsked: 1, tutDone: 1, career: 15, bestDay: 3, bestClock: 1300, codes: { abc: '2026-10-1' },
  missions: { slots: [{ id: 'office', target: 3, base: 0, prog: 1, done: 0 }, { id: 'yamanote', target: 2, base: 0, prog: 2, done: 1 }, { id: 'chime', target: 1, base: 0, prog: 0, done: 0 }] },
  pid: 'pid-rich-' + lang, fol: 1, last: { score: 5000, place: { ja: '銀座', en: 'Ginza' } }, seen: { yamanote: 3 }, seenN: 3, obsKnow: { cone: 3 } });
const SAME = ['best', 'bank', 'clovers', 'char', 'pomMet', 'mug', 'mugOn', 'mlevel', 'runs', 'streak', 'daily', 'dailyDone', 'lang', 'mute', 'closet', 'wear', 'upg', 'stamps', 'zukan', 'ach', 'totals', 'opt', 'lstar', 'lgMode', 'lgAura', 'ref', 'nick', 'career', 'bestDay', 'bestClock', 'codes', 'missions', 'pid', 'fol', 'last', 'tutDone', 'nickAsked'];
const fw = s => s.replace(/[!-~]/g, c => String.fromCharCode(c.charCodeAt(0) + 0xFEE0));
// how a code arrives after LINE / a notes app / a mail
const PASTE = [
  ['as-is', c => c],
  ['line-wrapped', c => '引き継ぎコード\n' + c.match(/.{1,38}/g).join('\n') + '\n'],
  ['full-width', c => fw(c)],
  ['invisible+smart-dash', c => '​' + c.replace(/--/g, '—').replace(/(.{50})/, '$1​ ') + '﻿'],
  ['words-around', c => 'これ↓\r\n「' + c + '」 よろしくね'],
  ['crlf-spaces', c => '   ' + c.match(/.{1,25}/g).join(' \r\n ') + '   '],
  ['mail-quote', c => '> ' + c.match(/.{1,60}/g).join('\n> ')],
  ['as-is', c => c],
];
const deep = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const mk = (() => { const j = new Date(Date.now() + 9 * 3600e3); return 'm' + j.getUTCFullYear() + String(j.getUTCMonth() + 1).padStart(2, '0'); })();
// an RJ1 code made outside the browser (Node's zlib): any correct deflate must open
const nodeCode = o => { const b64 = zlib.deflateRawSync(Buffer.from(JSON.stringify(Object.assign({ _v: 1, _at: Date.now() }, o)))).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  let h = 2166136261; for (let i = 0; i < b64.length; i++) { h ^= b64.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return 'RJ1.' + b64 + '.' + h.toString(36); };
const nodeCode0 = o => { const b64 = Buffer.from(JSON.stringify(Object.assign({ _v: 1 }, o))).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  let h = 2166136261; for (let i = 0; i < b64.length; i++) { h ^= b64.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return 'RJ0.' + b64 + '.' + h.toString(36); };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = [], log = [];
  const fail = m => { errs.push(m); console.log('  ✗ ' + m); };
  async function page(o) {
    const ctx = await b.newContext(Object.assign({ viewport: o.vp || { width: 390, height: 844 }, locale: { ja: 'ja-JP', en: 'en-US', zh: 'zh-TW', ko: 'ko-KR' }[o.lang || 'ja'] }, o.ua ? { userAgent: o.ua } : {}));
    if (o.seed) await ctx.addInitScript(([k, s, fsa]) => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1'); localStorage.setItem(k, s); if (fsa) localStorage.setItem('hd_fsauth', fsa); }, [KEY, JSON.stringify(o.seed), o.fsauth ? JSON.stringify(o.fsauth) : '']);
    if (o.noDS) await ctx.addInitScript(() => { delete window.DecompressionStream; window.DecompressionStream = undefined; });
    if (o.fb) await o.fb(ctx);
    ctx.setDefaultTimeout(20000); ctx.setDefaultNavigationTimeout(90000); // a busy test machine: the 900 KB page can take a while to load if (process.env.DBG) console.log('· ' + (o.name || ''));
    const p = await ctx.newPage(); p.on('pageerror', e => fail((o.name || '') + ' pageerror ' + e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    return { ctx, p };
  }
  // 季節の配布品（帽子など）は、読んだ瞬間に配られたかどうかで A と B に差が出る（2026-11-08、ko/1280 と old iPhone で発見）ので、比べる前に取り除く
  const SVof = async p => { const sv = await p.evaluate(k => JSON.parse(localStorage.getItem(k) || '{}'), KEY); let ev = []; try { ev = await p.evaluate(() => window.__hayDash.ev('CLOSET.filter(c => c.ev).map(c => [c.id, c.who, c.slot, c.v])')); } catch (e) { }
    if (sv.closet) for (const [id] of ev) delete sv.closet[id]; if (sv.wear) for (const [, who, slot, v] of ev) if (sv.wear[who] && sv.wear[who][slot] === v) sv.wear[who][slot] = ''; return sv; };
  async function restore(p, text, expectWarn, tag) { // settings → paste → tap once (see what the code holds) → tap again (restore) → the page starts again
    await p.click('#btnSet'); await p.waitForTimeout(250);
    await p.evaluate(() => document.querySelector('#xferIn').scrollIntoView({ block: 'center' }));
    await p.fill('#xferIn', text); await p.click('#btnXferLoad'); await p.waitForTimeout(400);
    const m1 = await p.textContent('#xferMsg');
    if (!/123,456|123.456/.test(m1) && expectWarn !== null) fail(tag + ' first tap does not show what the code holds: ' + m1);
    const warn = /#B3352A|rgb\(179, 53, 42\)/.test(await p.innerHTML('#xferMsg'));
    if (expectWarn !== null && warn !== expectWarn) fail(tag + ' warning about this device\'s own progress ' + (expectWarn ? 'missing' : 'shown for nothing') + ': ' + m1);
    const nav = p.waitForNavigation({ timeout: 12000 }).catch(() => null);
    await p.click('#btnXferLoad'); if (await nav) await p.waitForLoadState('load'); await p.waitForTimeout(900);
    return m1;
  }

  // ---- 1. the long code, every language, phone and PC, with the ways a code gets pasted ----
  let k = 0;
  for (const lang of ['ja', 'en', 'zh', 'ko']) for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    const tag = `${lang}/${vp.width}`, how = PASTE[k++ % PASTE.length];
    const A = await page({ lang, vp, seed: RICH(lang), name: 'A ' + tag }); await A.p.goto(DIST); await A.p.waitForTimeout(700);
    await A.p.click('#btnSet'); await A.p.waitForTimeout(250); await A.p.evaluate(() => document.querySelector('#btnXferMake').scrollIntoView({ block: 'center' }));
    await A.p.click('#btnXferMake'); await A.p.waitForTimeout(500);
    const code = await A.p.inputValue('#xferOut'), svA = await SVof(A.p);
    if (!/^RJ[01]\.[A-Za-z0-9_-]+\.[a-z0-9]+$/.test(code)) { fail(tag + ' no code: ' + code.slice(0, 40)); await A.ctx.close(); continue; }
    if (!(await A.p.textContent('#xferMsg')).trim()) fail(tag + ' no message after making the code');
    { const ov = await A.p.evaluate(() => { const pb = document.querySelector('#pBody') || document.querySelector('#sPanel'); return [...pb.querySelectorAll('.xfer button, .xfer textarea, .xfer p')].filter(e => e.offsetParent && e.getBoundingClientRect().right > innerWidth + 1).map(e => e.id || e.className).slice(0, 3); });
      if (ov.length) fail(tag + ' transfer section runs off the screen: ' + ov.join(',')); }
    if (vp.width === 390) await A.p.screenshot({ path: (process.env.SHOTS || '/tmp/rj-shots') + `/xfer_make_${lang}.png` });
    // B: a new browser that played a little (more hay than the code on even turns: the warning must show)
    const more = k % 2 === 0, Bseed = { best: 300, bank: more ? 500000 : 50, runs: 2, tutDone: 1, nickAsked: 1, lang: lang === 'ja' ? 'en' : 'ja', pid: 'pid-B', daily: today, streak: 1 };
    const B = await page({ lang, vp, seed: Bseed, name: 'B ' + tag }); await B.p.goto(DIST); await B.p.waitForTimeout(700);
    // the second tap restores only the code that was checked: a different code needs its own first tap
    await B.p.click('#btnSet'); await B.p.waitForTimeout(200); await B.p.evaluate(() => document.querySelector('#xferIn').scrollIntoView({ block: 'center' }));
    await B.p.fill('#xferIn', code); await B.p.click('#btnXferLoad'); await B.p.waitForTimeout(300);
    await B.p.fill('#xferIn', nodeCode({ best: 1, bank: 1 })); await B.p.click('#btnXferLoad'); await B.p.waitForTimeout(700);
    if ((await SVof(B.p)).best !== 300) fail(tag + ' a second, different code was restored without its own check');
    await B.p.fill('#xferIn', code.slice(0, -12)); await B.p.click('#btnXferLoad'); await B.p.waitForTimeout(300);
    if (!/コード|code|代碼|코드/i.test(await B.p.textContent('#xferMsg'))) fail(tag + ' a cut-off code gives no message');
    await B.p.click('#pClose'); await B.p.waitForTimeout(150);
    await restore(B.p, how[1](code), more, tag + ' [' + how[0] + ']');
    const svB = await SVof(B.p);
    for (const f of SAME) if (!deep(svA[f], svB[f])) fail(`${tag} [${how[0]}] "${f}" not carried: ${JSON.stringify(svA[f])} → ${JSON.stringify(svB[f])}`);
    const ui = await B.p.evaluate(() => ({ title: !document.querySelector('#sTitle').hidden, best: document.querySelector('#tBest').textContent, bank: document.querySelector('#tBank').textContent, lang: document.documentElement.lang, pom: !document.querySelector('#pickPom').hidden && document.querySelector('#pickPom').getAttribute('aria-pressed'), mute: document.querySelector('#btnMute').textContent, hay: window.__hayDash.SV.bank }));
    if (!ui.title || !/123/.test(ui.best) || ui.bank.replace(/\D/g, '') !== String(svA.bank) || ui.lang.slice(0, 2) !== lang || ui.pom !== 'true') fail(tag + ' title after restore ' + JSON.stringify(ui));
    if (ui.hay !== svA.bank) fail(tag + ' hay changed on the first start after restore ' + svA.bank + ' → ' + ui.hay); // no second legend/daily/event gift
    // a run with the restored save (Pom, her hat, Legend mode) and back: nothing breaks, nothing is lost
    if (vp.width === 390) { await B.p.click('#btnStart'); await B.p.waitForTimeout(1500);
    await B.p.evaluate(() => { window.__hayDash.G.invT = 0; window.__die('obstacle'); }); await B.p.waitForTimeout(1200);
    await B.p.evaluate(() => { const r = document.querySelector('#btnRvNo'); if (r && !document.querySelector('#sRevive').hidden) r.click(); }); await B.p.waitForTimeout(1200);
    const after = await SVof(B.p); if (!(after.runs === svA.runs + 1) || !(after.bank >= svA.bank) || after.pid !== svA.pid || !deep(after.wear, svA.wear)) fail(tag + ' after one run ' + JSON.stringify({ runs: after.runs, bank: after.bank, pid: after.pid })); }
    log.push(tag + ' ' + how[0] + ' ok (' + code.length + ' chars)');
    await A.ctx.close(); await B.ctx.close();
  }

  // ---- 2. codes and saves from older versions, made outside the browser; damaged codes ----
  const OLD = [
    ['v1 (first version)', { best: 4000, bank: 1200, closet: { tie_red: 1 }, wear: { ren: { tie: 'red' }, jill: { frame: 'brown' } }, upg: { dash: 2 }, clovers: 2, char: 'jill', mug: true, mugOn: true, missions: null, totals: { hay: 3000 }, zukan: { carrot: 1 }, daily: '2025-12-1', streak: 3 }],
    ['before Pom', { best: 9000, bank: 3000, closet: { hat_beret_ren: 1 }, wear: { ren: { tie: 'gold', hat: 'beret', suit: '' }, jill: { frame: 'brown', hat: '', suit: '' } }, stamps: { yamanote: 1 }, mlevel: 3, missions: { slots: [{ id: 'gone_mission', target: 5, base: 0, prog: 0, done: 0 }, { id: 'office', target: 'x', prog: 0 }, null] }, lang: 'en', nick: 'old' }],
    ['legend, before stars were saved', { best: 300000, bank: 10, totals: { hay: 2400000, veg: 900 }, runs: 900, stamps: { yamanote: 3 }, closet: {}, wear: { ren: { tie: 'gold', hat: '', suit: '' }, jill: { frame: 'brown', hat: '', suit: '' }, pom: { band: 'red', hat: '', suit: '' } }, pomMet: 1, char: 'pom', career: 15, tutDone: 1 }],
    ['damaged numbers', { best: 'abc', bank: -50, clovers: null, runs: 'NaN', mlevel: 0, upg: { dash: 99, magnet: 'x' }, last: { score: 'x', place: 3 }, closet: [1, 2], wear: 'broken', char: 'pom', stamps: [], tutDone: 1 }],
  ];
  for (const [name, o] of OLD) for (const make of [nodeCode, nodeCode0]) {
    const tag = 'old save "' + name + '" ' + make(o).slice(0, 3);
    const B = await page({ name: tag }); await B.p.goto(DIST); await B.p.waitForTimeout(600);
    await restore(B.p, make(o), null, tag);
    const s = await SVof(B.p), st = await B.p.evaluate(() => ({ title: !document.querySelector('#sTitle').hidden, best: document.querySelector('#tBest').textContent, nan: /NaN|undefined/.test(document.querySelector('#sTitle').innerText) }));
    if (!st.title || st.nan) fail(tag + ' title ' + JSON.stringify(st));
    if (typeof o.best === 'number' && s.best !== o.best) fail(tag + ' best ' + s.best);
    if (!s.pid) fail(tag + ' no player id');
    if (!s.wear || !s.wear.pom || !s.wear.ren || !s.wear.jill) fail(tag + ' outfits ' + JSON.stringify(s.wear));
    { const ms = s.missions && s.missions.slots; await B.p.click('#btnMissions'); await B.p.waitForTimeout(200); const n = await B.p.evaluate(() => document.querySelectorAll('#pBody .m').length); await B.p.click('#pClose');
      const m2 = (await SVof(B.p)).missions; if (!m2 || m2.slots.length !== 3 || m2.slots.some(x => !x || !(x.target > 0))) fail(tag + ' missions not usable ' + JSON.stringify(m2)); if (n < 3) fail(tag + ' missions panel rows ' + n); }
    if (name.startsWith('legend')) { const s1 = await SVof(B.p); if (!s1.closet.hat_laurel_pom || !(s1.lstar >= 0)) fail(tag + ' legend perks not given ' + JSON.stringify({ lstar: s1.lstar, c: s1.closet }));
      await B.p.reload(); await B.p.waitForTimeout(700); const s2 = await SVof(B.p); if (s2.bank !== s1.bank || s2.clovers !== s1.clovers) fail(tag + ' legend gift given twice ' + s1.bank + ' → ' + s2.bank); }
    await B.p.click('#btnStart'); await B.p.waitForTimeout(1000); if ((await B.p.evaluate(() => window.__hayDash.G.mode)) !== 'play') fail(tag + ' cannot start a run');
    await B.ctx.close();
  }
  { // damaged codes never change anything, and say so in every language
    for (const lang of ['ja', 'en', 'zh', 'ko']) {
      const B = await page({ lang, seed: { best: 777, bank: 77, tutDone: 1, lang }, name: 'bad ' + lang }); await B.p.goto(DIST); await B.p.waitForTimeout(600);
      const good = await B.p.evaluate(() => window.__hayDash.ev('xferMake()'));
      await B.p.click('#btnSet'); await B.p.waitForTimeout(200); await B.p.evaluate(() => document.querySelector('#xferIn').scrollIntoView({ block: 'center' }));
      for (const bad of ['RJ1.garbage.123', good.slice(0, 40), good.slice(0, good.length - 2) + 'zz', good.replace(/\.(.{4})/, '.AAAA'), 'RJ2.' + good.slice(4), 'hello', nodeCode({ best: 5 }).replace('RJ1', 'RJ0'), nodeCode0({ _v: 2, best: 1 }), 'RJ1.' + 'A'.repeat(41) + '.' + 'abc']) {
        await B.p.fill('#xferIn', bad); await B.p.click('#btnXferLoad'); await B.p.waitForTimeout(250); await B.p.click('#btnXferLoad'); await B.p.waitForTimeout(250);
        const m = await B.p.textContent('#xferMsg'); if (!m.trim() || /123,456/.test(m)) fail(lang + ' bad code message "' + m + '" for ' + bad.slice(0, 20));
        if (LANG_JA_LEFT(lang, m)) fail(lang + ' bad-code message not in ' + lang + ': ' + m);
      }
      if ((await SVof(B.p)).best !== 777) fail(lang + ' a bad code changed the save');
      await B.ctx.close();
    }
  }
  { // a very long save (years of play) still makes a code and comes back; a browser without DecompressionStream (older iPhone) reads RJ1
    const big = RICH('ja'); big.seen = {}; for (let i = 0; i < 1500; i++) big.seen['place' + i] = i; big.codes = {}; for (let i = 0; i < 300; i++) big.codes['h' + i.toString(36).padStart(12, 'x')] = '2026-1-1';
    big.album = { yamanote: 'data:image/jpeg;base64,' + 'A'.repeat(200000) };
    const A = await page({ seed: big, name: 'big A' }); await A.p.goto(DIST); await A.p.waitForTimeout(700);
    const code = await A.p.evaluate(() => window.__hayDash.ev('xferMake()')); const svA = await SVof(A.p);
    if (code.length > 55000) fail('a long save makes a code too long for the 8-letter link (' + code.length + ')');
    if (code.includes('AAAAAAAAAAAAAAAAAAAA')) fail('photos went into the code');
    const B = await page({ noDS: true, name: 'old iPhone' }); await B.p.goto(DIST); await B.p.waitForTimeout(700);
    if (await B.p.evaluate(() => typeof DecompressionStream === 'function')) fail('could not remove DecompressionStream for the test');
    await restore(B.p, code, null, 'old iPhone');
    const svB = await SVof(B.p); for (const f of SAME.concat(['seen', 'seenN'])) if (!deep(svA[f], svB[f])) fail('old iPhone: "' + f + '" not carried');
    log.push('long save ' + code.length + ' chars; read without DecompressionStream ok');
    // and the other way: an older iPhone makes RJ0, a new phone reads it
    const C = await page({ noDS: true, seed: RICH('en'), name: 'RJ0 maker' }); await C.p.addInitScript(() => { window.CompressionStream = undefined; }); await C.p.goto(DIST); await C.p.waitForTimeout(700);
    const c0 = await C.p.evaluate(() => window.__hayDash.ev('xferMake()')); if (!c0.startsWith('RJ0.')) fail('no RJ0 without CompressionStream: ' + c0.slice(0, 4));
    const D = await page({ name: 'RJ0 reader' }); await D.p.goto(DIST); await D.p.waitForTimeout(600); await restore(D.p, c0, null, 'RJ0'); if ((await SVof(D.p)).best !== 123456) fail('RJ0 code not restored');
    // a page that cannot keep data (storage full or blocked): the restore still works for this visit, no reload into the old save
    const E = await page({ name: 'no storage' }); await E.p.goto(DIST); await E.p.waitForTimeout(600);
    await E.p.evaluate(() => { Storage.prototype.setItem = function () { throw new Error('QuotaExceededError'); }; });
    await restore(E.p, code, null, 'no storage');
    const e1 = await E.p.evaluate(() => ({ best: window.__hayDash.SV.best, lang: document.documentElement.lang, title: !document.querySelector('#sTitle').hidden, tBest: document.querySelector('#tBest').textContent }));
    if (e1.best !== svA.best || !e1.title || e1.tBest.replace(/\D/g, '') !== String(svA.best)) fail('no storage: restore lost ' + JSON.stringify(e1));
    for (const X of [A, B, C, D, E]) await X.ctx.close();
  }

  // the app's settings once the ranking connection is up (on a busy machine it can take a few seconds)
  async function linkGo(p, v) { await p.fill('#linkIn', v); await p.click('#btnLinkGo'); // wait for the answer (found / not found), not a fixed time
    await p.waitForFunction(() => !document.querySelector('#linkAsk').hidden || /[^.…\s]\s*$/.test(document.querySelector('#linkMsg').textContent), null, { timeout: 20000 }).catch(() => { }); }
  async function setApp(p) { for (let i = 0; i < 20; i++) { await p.click('#btnSet'); await p.waitForTimeout(250); if (await p.$('#linkIn')) return; await p.click('#pClose'); await p.waitForTimeout(750); } }
  // ---- 3. the app (PWA) with its ranking account: the long code carries the account; the 8-letter code; LINE ----
  const DB = { ranks: {}, links: {} }; let n = 0;
  const conf = `window.HAYDASH_CONFIG = { firebase: { apiKey: 'TESTKEY', projectId: 'demo' }, url: 'https://example.app/' };`;
  const fb = async ctx => {
    await ctx.route('**/config.js', r => r.fulfill({ contentType: 'text/javascript', body: conf }));
    await ctx.route('https://identitytoolkit.googleapis.com/**', r => { n++; r.fulfill({ contentType: 'application/json', body: JSON.stringify({ idToken: 'tokuid' + n, refreshToken: 'ref' + n, localId: 'uid' + n, expiresIn: '3600' }) }); });
    await ctx.route('https://securetoken.googleapis.com/**', r => { const ref = new URLSearchParams(r.request().postData()).get('refresh_token') || ''; const id = 'uid' + ref.replace(/\D/g, ''); r.fulfill({ contentType: 'application/json', body: JSON.stringify({ id_token: 'tok' + id, refresh_token: ref, user_id: id, expires_in: '3600' }) }); });
    await ctx.route('https://firestore.googleapis.com/**', async r => {
      const req = r.request(), url = new URL(req.url()), m = req.method(), p2 = url.pathname.split('/documents')[1], who = (req.headers().authorization || '').replace('Bearer tok', '');
      if (!who) return r.fulfill({ status: 401, body: '{}' });
      const mm = /^\/(ranks|links)\/([^/]+)$/.exec(p2);
      if (mm) { const [, col, id] = mm, T = DB[col];
        if (m === 'GET') return T[id] ? r.fulfill({ contentType: 'application/json', body: JSON.stringify({ name: `x/${col}/` + id, fields: T[id] }) }) : r.fulfill({ status: 404, body: '{}' });
        if (m === 'DELETE') { delete T[id]; return r.fulfill({ contentType: 'application/json', body: '{}' }); }
        if (col === 'ranks' && id !== who) return r.fulfill({ status: 403, body: '{}' }); // a device writes only its own row
        if (col === 'links') { const f = JSON.parse(req.postData()).fields; if (!(+f.exp.integerValue < Date.now() + 20 * 60e3) || f.d.stringValue.length >= 60000) return r.fulfill({ status: 403, body: '{}' }); }
        const body = JSON.parse(req.postData()); T[id] = body.fields; return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ name: `x/${col}/` + id, fields: T[id] }) }); }
      if (p2 === ':runQuery') return r.fulfill({ contentType: 'application/json', body: '[]' });
      if (p2 === ':runAggregationQuery') return r.fulfill({ contentType: 'application/json', body: '[{"result":{"aggregateFields":{"n":{"integerValue":"0"}}}}]' });
      r.fulfill({ status: 400, body: '{}' });
    });
  };
  for (const lang of ['ja', 'ko']) {
    DB.ranks = { uid1: { [mk]: { integerValue: '123456' }, all: { integerValue: '123456' }, nick: { stringValue: 'ひっこし' + lang } } }; DB.links = {}; n = 10;
    const A = await page({ lang, seed: RICH(lang), fsauth: { r: 'ref1', u: 'uid1' }, fb, name: 'app A ' + lang }); await A.p.goto(APP); await A.p.waitForTimeout(1500);
    await setApp(A.p); await A.p.evaluate(() => document.querySelector('#btnXferMake').scrollIntoView({ block: 'center' })); await A.p.click('#btnXferMake'); await A.p.waitForTimeout(500);
    const code = await A.p.inputValue('#xferOut');
    // B: this phone already has its own ranking row
    const B = await page({ lang, seed: { best: 200, bank: 60, runs: 1, tutDone: 1, nickAsked: 1, nick: 'Bさん', pid: 'pid-B', lang, daily: today }, fb, name: 'app B ' + lang }); await B.p.goto(APP); await B.p.waitForTimeout(1500);
    const bUid = await B.p.evaluate(() => JSON.parse(localStorage.getItem('hd_fsauth') || '{}').u); DB.ranks[bUid] = { [mk]: { integerValue: '200' }, all: { integerValue: '200' }, nick: { stringValue: 'Bさん' } };
    await restore(B.p, PASTE[1][1](code), false, 'app ' + lang);
    const s = await SVof(B.p), auth = await B.p.evaluate(() => JSON.parse(localStorage.getItem('hd_fsauth') || '{}').u);
    if (auth !== 'uid1') fail(lang + ' app: the ranking account did not come with the long code (' + auth + ')');
    if (Object.keys(DB.ranks[bUid] || {}).length) fail(lang + ' app: this phone\'s old ranking row is still on the board (two rows for one player)');
    if (s.pid !== 'pid-rich-' + lang || s.nick !== 'ひっこし' + lang) fail(lang + ' app: pid/name ' + s.pid + ' ' + s.nick);
    // a run on B goes to the same row as before (uid1), with the same name
    await B.p.click('#btnStart'); await B.p.waitForTimeout(1500); await B.p.evaluate(() => { const G = window.__hayDash ? window.__hayDash.G : null; if (G) { G.invT = 0; } });
    await B.p.evaluate(() => { document.querySelector('#pauseBtn').click(); }); await B.p.waitForTimeout(300); await B.p.click('#btnQuit'); await B.p.click('#btnQuit'); await B.p.waitForTimeout(2500);
    const rows = Object.keys(DB.ranks).filter(id => Object.keys(DB.ranks[id]).length);
    if (rows.length !== 1 || rows[0] !== 'uid1') fail(lang + ' app: rows on the board after a run ' + JSON.stringify(rows));
    if (!DB.ranks.uid1 || (DB.ranks.uid1.nick || {}).stringValue !== 'ひっこし' + lang) fail(lang + ' app: name on the board ' + JSON.stringify(DB.ranks.uid1 && DB.ranks.uid1.nick));
    // the 8-letter code: made on A, the link opens outside LINE; typed in odd ways on C
    await A.p.evaluate(() => document.querySelector('#btnLinkMake').scrollIntoView({ block: 'center' })); await A.p.click('#btnLinkMake'); await A.p.waitForTimeout(800);
    const lc = await A.p.evaluate(() => (document.querySelector('.linkcode') || {}).textContent || ''), lurl = await A.p.evaluate(() => document.querySelector('#linkOut').dataset.url || '');
    if (!/^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(lc)) fail(lang + ' no 8-letter code ' + lc);
    if (!/[?&]link=[A-Z2-9]{8}/.test(lurl) || !/openExternalBrowser=1/.test(lurl)) fail(lang + ' the transfer link would open inside LINE: ' + lurl);
    for (const [how, typed] of [['full-width + ー', fw(lc.slice(0, 4)) + 'ー' + fw(lc.slice(5))], ['whole link pasted', 'こちら ' + lurl + ' です'], ['spaces, small letters', ' ' + lc.toLowerCase().replace('-', ' ') + ' ']]) {
      const C = await page({ lang, fb, name: 'app C ' + how }); await C.p.goto(APP); await C.p.waitForTimeout(1500); await setApp(C.p);
      await C.p.evaluate(() => document.querySelector('#linkIn').scrollIntoView({ block: 'center' })); await linkGo(C.p, typed);
      const ask = await C.p.evaluate(() => !document.querySelector('#linkAsk').hidden && document.querySelector('#linkAsk').textContent);
      if (!ask || !/123,456/.test(ask)) fail(lang + ' 8-letter code typed as "' + how + '" not found: ' + (await C.p.textContent('#linkMsg')));
      await C.ctx.close();
    }
    // a phone whose clock is an hour ahead still reads a fresh code
    { const C = await page({ lang, fb, name: 'clock' }); await C.ctx.addInitScript(() => { const D0 = Date.now; Date.now = () => D0() + 3600e3; }); await C.p.goto(APP); await C.p.waitForTimeout(1500); await setApp(C.p);
      await C.p.evaluate(() => document.querySelector('#linkIn').scrollIntoView({ block: 'center' })); await linkGo(C.p, lc);
      if (!(await C.p.evaluate(() => !document.querySelector('#linkAsk').hidden))) fail(lang + ' a phone with its clock 1 hour ahead cannot read a fresh code');
      await C.ctx.close(); }
    // the phone that makes the code has its clock an hour ahead (the server would refuse the first try): the code still works
    { const A2 = await page({ lang, seed: RICH(lang), fsauth: { r: 'ref1', u: 'uid1' }, fb, name: 'clock ahead maker' }); await A2.ctx.addInitScript(() => { const D0 = Date.now; Date.now = () => D0() + 3600e3; });
      await A2.p.goto(APP); await A2.p.waitForTimeout(1500); await setApp(A2.p); await A2.p.evaluate(() => document.querySelector('#btnLinkMake').scrollIntoView({ block: 'center' }));
      await A2.p.click('#btnLinkMake'); await A2.p.waitForTimeout(1000); const c2 = await A2.p.evaluate(() => (document.querySelector('.linkcode') || {}).textContent || '');
      if (!/^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(c2)) fail(lang + ' a phone with its clock 1 hour ahead cannot make a code: ' + (await A2.p.textContent('#linkMsg')));
      else { const C = await page({ lang, fb, name: 'reader of clock-ahead code' }); await C.p.goto(APP); await C.p.waitForTimeout(1500); await setApp(C.p);
        await C.p.evaluate(() => document.querySelector('#linkIn').scrollIntoView({ block: 'center' })); await linkGo(C.p, c2);
        if (!(await C.p.evaluate(() => !document.querySelector('#linkAsk').hidden))) fail(lang + ' a code made by a phone whose clock runs ahead cannot be read'); await C.ctx.close(); }
      await A2.ctx.close(); }
    // LINE's own browser opened with the link: "open in your browser" keeps the code
    { const L = await page({ lang, fb, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari Line/13.20.0', name: 'LINE' });
      await L.p.goto(APP + '?link=' + lc.replace('-', '')); await L.p.waitForTimeout(1800);
      const href = await L.p.evaluate(() => (document.querySelector('#inAppGo') || {}).href || '');
      if (!/[?&]link=[A-Z2-9]{8}/.test(href) || !/openExternalBrowser=1/.test(href)) fail(lang + ' LINE → browser drops the transfer code: ' + href);
      await L.ctx.close(); }
    // a code that is not there (typo / used / expired) and a network failure: clear messages, nothing changes
    { const C = await page({ lang, fb, seed: { best: 55, tutDone: 1, lang }, name: 'C bad' }); await C.p.goto(APP); await C.p.waitForTimeout(1500); await setApp(C.p);
      await C.p.evaluate(() => document.querySelector('#linkIn').scrollIntoView({ block: 'center' }));
      for (const v of ['ABCD-EFG', 'ZZZZ-ZZZZ']) { await linkGo(C.p, v); if (!(await C.p.textContent('#linkMsg')).trim()) fail(lang + ' no message for link code ' + v); }
      await C.ctx.route('https://firestore.googleapis.com/**', r => r.abort()); await linkGo(C.p, lc);
      if (!(await C.p.textContent('#linkMsg')).trim() || (await SVof(C.p)).best !== 55) fail(lang + ' offline link code: no message or the save changed');
      await C.ctx.close(); }
    // the code itself is used on D: same account, the code is gone, D's old row leaves the board
    { const D = await page({ lang, fb, seed: { best: 10, bank: 999999, runs: 1, tutDone: 1, lang }, name: 'app D' }); await D.p.goto(APP); await D.p.waitForTimeout(1500);
      const dUid = await D.p.evaluate(() => JSON.parse(localStorage.getItem('hd_fsauth') || '{}').u); DB.ranks[dUid] = { all: { integerValue: '10' } };
      await setApp(D.p); await D.p.evaluate(() => document.querySelector('#linkIn').scrollIntoView({ block: 'center' })); await linkGo(D.p, lc);
      const warn = await D.p.evaluate(() => document.querySelector('#linkAsk').innerHTML); if (!/B3352A/.test(warn)) fail(lang + ' link: no warning although this phone has more hay');
      const nav = D.p.waitForNavigation({ timeout: 15000 }).catch(() => null); await D.p.click('#btnLinkYes'); if (await nav) await D.p.waitForLoadState('load'); await D.p.waitForTimeout(1200);
      const s2 = await SVof(D.p), au = await D.p.evaluate(() => JSON.parse(localStorage.getItem('hd_fsauth') || '{}').u);
      if (s2.best !== 123456 || s2.pid !== 'pid-rich-' + lang || au !== 'uid1') fail(lang + ' link: not moved ' + JSON.stringify({ best: s2.best, pid: s2.pid, au }));
      if (Object.keys(DB.ranks[dUid] || {}).length) fail(lang + ' link: old row stays'); if (DB.links[lc.replace('-', '')]) fail(lang + ' link: code not deleted');
      await D.ctx.close(); }
    // the transfer link opened with no connection: say it did not work (before, nothing happened and the code was dropped from the address)
    { const C = await page({ lang, fb, seed: { tutDone: 1, daily: today, streak: 1, lang }, name: 'offline link' }); await C.ctx.route('https://identitytoolkit.googleapis.com/**', r => r.abort()); await C.ctx.route('https://securetoken.googleapis.com/**', r => r.abort());
      await C.p.goto(APP + '?link=' + lc.replace('-', '')); await C.p.waitForTimeout(2500);
      // お知らせは1つずつ順番に出る（4秒ずつ）。先に別のお知らせがあると遅れて出るので、最大10秒まで待って確かめる（2026-11-08）
      let tx = ''; for (let w = 0; w < 10; w++) { tx = await C.p.evaluate(() => [...document.querySelectorAll('.toast')].map(e => e.textContent).join(' ')); if (/うまくいきません|다시 시도/.test(tx)) break; await C.p.waitForTimeout(1000); }
      if (!/うまくいきません|다시 시도/.test(tx)) fail(lang + ' a transfer link opened offline shows nothing'); await C.ctx.close(); }
    await A.ctx.close(); await B.ctx.close();
    log.push('app ' + lang + ' ok');
  }
  console.log(log.join('\n'));
  console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'XFER FULL OK no errors');
  await b.close();
})();
function LANG_JA_LEFT(lang, m) { return (lang === 'en' && /[ぁ-んァ-ン]/.test(m)) || ((lang === 'zh' || lang === 'ko') && /[ぁ-んァ-ン]/.test(m)); }
