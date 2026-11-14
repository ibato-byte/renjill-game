// 音の試験（2026-11-15 の音のみがき直しの見張り）
//  ① 曲の音が調から外れていない（主旋律・ベースが長音階の音だけ）・長さがそろっている（8分音符32個＝4小節、ベース8個）
//  ② 効果音を全部鳴らしてもエラーが出ない／全部を一度に重ねても音が割れない（出口の大きさが 1.0 未満）
//  ③ 曲が進む・場面の切りかえは小節の頭で起きる・題名画面の曲が流れる・消音で出口が 0 になる
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined, args: ['--autoplay-policy=no-user-gesture-required'] }); const bad = [], errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' })));
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800);
  const st = await p.evaluate(() => window.__hayDash.ev(`(() => { const out = [], ok = new Set([0, 2, 4, 5, 7, 9, 11]); for (const [k, s] of Object.entries(SONGS)) { for (const key of ['mel', 'mel2']) { const m = s[key]; if (!m) { out.push(k + '.' + key + ' がない'); continue; } if (m.length !== 32) out.push(k + '.' + key + ' の長さ ' + m.length); for (const n of m) if (n > -50 && !ok.has(((n % 12) + 12) % 12)) out.push(k + '.' + key + ' 調の外の音 ' + n); if (m.filter(n => n > -50).length < 8) out.push(k + '.' + key + ' 音が少ない'); }
      for (const key of ['bass', 'bass2']) { const m = s[key]; if (!m || m.length !== 8) { out.push(k + '.' + key + ' の長さ'); continue; } for (const n of m) if (!ok.has(((n % 12) + 12) % 12) || ((n % 12) + 12) % 12 === 11) out.push(k + '.' + key + ' 根音 ' + n); } }
    return out; })()`));
  if (st.length) bad.push('曲：' + st.slice(0, 6).join(' / '));
  await p.click('#pickRen'); await p.waitForTimeout(500);
  const title = await p.evaluate(() => window.__hayDash.ev(`({ ctx: !!AU.ctx, state: AU.ctx && AU.ctx.state, on: AU.on, area: AU.area })`));
  if (!title.ctx) bad.push('音の用意ができない'); else if (title.state === 'running' && (!title.on || title.area !== 'title')) bad.push('題名画面の曲が流れない ' + JSON.stringify(title));
  await p.click('#btnStart'); await p.waitForTimeout(1200);
  const run = await p.evaluate(async () => { const H = window.__hayDash, ev = H.ev; H.G.invT = 999; const r = { state: ev('AU.ctx.state') };
    ev(`window.__an = AU.ctx.createAnalyser(); __an.fftSize = 2048; (AU.lim || AU.comp || AU.master).connect(__an); window.__pk = 0; window.__buf = new Float32Array(2048); window.__meter = setInterval(() => { __an.getFloatTimeDomainData(__buf); for (let i = 0; i < __buf.length; i++) { const a = Math.abs(__buf[i]); if (a > __pk) __pk = a; } }, 15);`);
    const wait = ms => new Promise(f => setTimeout(f, ms));
    r.area0 = ev('AU.area'); const s0 = ev('AU.step'); await wait(1500); r.adv = ev('AU.step') - s0; r.musicPk = ev('__pk');
    // 場面の切りかえ：小節の途中で頼んでも、小節の頭まで前の曲のまま
    ev(`window.__sw = []; musicArea = 'office'; musicKey = 5; window.__swT = setInterval(() => { __sw.push([AU.area, AU.step % 8]); }, 8);`); await wait(2600); ev('clearInterval(__swT)');
    const sw = ev('__sw'); const first = sw.findIndex(x => x[0] === 'office'); r.swOK = first >= 0 && sw[first][1] <= 2 && sw.slice(0, first).every(x => x[0] !== 'office'); r.key = ev('AU.key');
    // 効果音をひとつずつ
    r.sfxErr = []; for (const k of Object.keys(ev('SFX'))) { try { ev('SFX.' + k + (k === 'hay' ? '(3)' : k === 'step' ? "(1,'room')" : '()')); } catch (e) { r.sfxErr.push(k + ': ' + e.message); } await wait(60); }
    await wait(900); r.pkEach = ev('__pk');
    // 全部を一度に、3回
    for (let n = 0; n < 3; n++) { for (const k of Object.keys(ev('SFX'))) { try { ev('SFX.' + k + (k === 'hay' ? '(5)' : k === 'step' ? "(0,'street')" : '()')); } catch (e) { } } await wait(250); }
    await wait(1200); r.pkAll = ev('__pk'); r.hayHz = [0, 1, 2, 3, 4, 5, 9].map(n => Math.round(ev('sfxHz(Math.min(' + n + ', 5))')));
    ev('setMute(true)'); await wait(500); ev('__pk = 0'); await wait(400); r.pkMute = ev('__pk'); ev('setMute(false)'); ev('clearInterval(__meter)'); return r; });
  if (run.state === 'running') {
    if (run.adv < 3) bad.push('曲が進まない ' + run.adv);
    if (!(run.musicPk > .002)) bad.push('曲が鳴っていない ' + run.musicPk);
    if (!run.swOK) bad.push('曲の切りかえが小節の頭でない');
    if (run.pkAll >= .999) bad.push('音が割れる ' + run.pkAll);
    if (run.pkMute > .02) bad.push('消音で音が残る ' + run.pkMute);
  } else console.log('（この環境では音の出口が動かないので、鳴り方の確認はとばした：' + run.state + '）');
  if (run.sfxErr.length) bad.push('効果音のエラー ' + run.sfxErr.join(' / '));
  if (run.hayHz.some((f, i) => i && f < run.hayHz[i - 1]) || Math.max(...run.hayHz) > 1300) bad.push('牧草の音の高さ ' + run.hayHz);
  if (errs.length) bad.push('pageerror ' + errs.slice(0, 2).join(' | '));
  console.log(JSON.stringify({ title, run: Object.assign({}, run, { sfxErr: run.sfxErr.length }) }));
  console.log(bad.length ? 'AUDIO NG ' + bad.join(' / ') : 'AUDIO OK'); await b.close(); })();
