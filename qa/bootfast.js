// 起動を速くした仕組み（2026-11-15：開いた直後は前向きの絵だけ描き、走る絵はあとから描く）が、絵の欠けを生まない
//  ① 開いて 3 秒後には、3 匹とも全部の絵がそろっている（走る 8 コマ・跳ぶ・すべる・ふり返る・前向き）
//  ② 開いてすぐ（絵がそろう前）にスタートしても、走る絵がその場でそろう
//  ③ 着せかえを保存している人は、開いた時から着せかえた姿（ふつうの姿を一度描いてから描き直さない）
//  ④ 開いてすぐ「あそびかた」を開いても、走る後ろ姿の絵が出る
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../dist') + '/test.html';
(async () => { const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const bad = [];
  const open = async (save, pre) => { const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.addInitScript(s => localStorage.setItem('renjill-hay-dash-v1', JSON.stringify(s)), save); if (pre) await p.addInitScript(pre); await p.goto(URL); return [p, errs]; };
  const need = `(() => { const out = {}; for (const w of ['ren','jill','pom']) { const B = BUN[w] || {}, miss = []; for (let k = 0; k < RUN_FRAMES; k++) if (!B['run' + k] || !B['run' + k].width) miss.push('run' + k); for (const k of ['air','fall','slide','look_happy','look_worry','look_cheer','front_open','front_blink','front_happy']) if (!B[k] || !B[k].width) miss.push(k); if (w === 'ren') for (const k of ['run0m','airm','front_openm']) if (!B[k] || !B[k].width) miss.push(k); out[w] = miss; } return { miss: out, todo: [...BUN_TODO] }; })()`;
  // ① そろう
  { const [p, errs] = await open({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 }); await p.waitForFunction(() => window.__hayDash && window.__hayDash.ev('BUN_TODO.size') === 0, null, { timeout: 15000 }).catch(() => { });
    const r = await p.evaluate(s => window.__hayDash.ev(s), need); for (const w in r.miss) if (r.miss[w].length) bad.push('① 絵が足りない ' + w + ': ' + r.miss[w].join(',')); if (r.todo.length) bad.push('① まだ描き終わっていない: ' + r.todo); if (errs.length) bad.push('① エラー: ' + errs[0]); await p.close(); }
  // ② すぐスタート（あとから描く仕組みを止めて、絵がそろう前を作る）
  { const [p, errs] = await open({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', pomMet: 1 }, () => { const st = window.setTimeout; window.__held = []; window.setTimeout = (f, ms, ...a) => (ms === 350 || ms === 80) && /buildBunnies|BUN_TODO/.test(String(f)) ? (window.__held.push(f), 0) : st(f, ms, ...a); });
    await p.waitForFunction(() => window.__hayDash && document.getElementById('btnStart'), null, { timeout: 15000 }); await p.waitForTimeout(500);
    const before = await p.evaluate(() => window.__hayDash.ev('[...BUN_TODO].length')); if (before !== 3) bad.push('② 試験の前提：開いた直後は 3 匹とも走る絵がまだのはず（' + before + '）');
    const how = await p.evaluate(() => window.__hayDash.ev(`(() => { const a = BUN.ren.front_open, f0 = BUN.ren.run0; openHow && 0; return { hadRun: !!f0, front: !!(a && a.width) }; })()`)); if (how.hadRun) bad.push('② 試験の前提：走る絵がもうある'); if (!how.front) bad.push('② 開いた直後に前向きの絵がない');
    await p.click('#btnStart'); await p.waitForTimeout(700);
    const r = await p.evaluate(s => window.__hayDash.ev(s), need); for (const w in r.miss) if (r.miss[w].length) bad.push('② すぐスタートで絵が足りない ' + w + ': ' + r.miss[w].join(',')); if (errs.length) bad.push('② エラー: ' + errs[0]); await p.close(); }
  // ③ 着せかえ（赤いネクタイを保存 → 開いた時の前向きの絵に赤がある・走る絵にも赤がある）
  { const [p, errs] = await open({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja', wear: { ren: { tie: 'red' } } }); await p.waitForFunction(() => window.__hayDash && window.__hayDash.ev('BUN_TODO.size') === 0, null, { timeout: 15000 }).catch(() => { });
    const r = await p.evaluate(() => window.__hayDash.ev(`(() => { const red = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 16) if (d[i + 3] > 200 && d[i] > 170 && d[i + 1] < 110 && d[i + 2] < 100) n++; return n; }; return { tie: WEAR.ren.tie, front: red(BUN.ren.front_open), run: red(BUN.ren.run2), jill: red(BUN.jill.front_open) }; })()`));
    if (r.tie !== 'red') bad.push('③ 着せかえが開いた時に反映されていない（' + r.tie + '）'); if (r.front < 20) bad.push('③ 前向きの絵が赤いネクタイになっていない（赤い点 ' + r.front + '）'); if (r.run < 5) bad.push('③ 走る絵が赤いネクタイになっていない（赤い点 ' + r.run + '）'); if (errs.length) bad.push('③ エラー: ' + errs[0]); await p.close(); }
  // ④ すぐ「あそびかた」
  { const [p, errs] = await open({ tutDone: 1, nickAsked: 1, runs: 9, lang: 'ja' }, () => { const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => (ms === 350 || ms === 80) && /buildBunnies|BUN_TODO/.test(String(f)) ? 0 : st(f, ms, ...a); });
    await p.waitForFunction(() => window.__hayDash && document.getElementById('btnStart'), null, { timeout: 15000 }); await p.waitForTimeout(400);
    const r = await p.evaluate(() => { const bt = document.getElementById('btnHow'); if (!bt) return { skip: 1 }; bt.click(); const im = document.querySelector('.ha-bun'); const H = window.__hayDash; return { has: !!im, same: im ? im.src === H.ev('BUN.ren.run0.toDataURL()') : false, run: H.ev('!!BUN.ren.run0') }; });
    if (!r.skip) { if (!r.has) bad.push('④ あそびかたの動く絵がない'); else if (!r.run || !r.same) bad.push('④ あそびかたの絵が走る後ろ姿になっていない'); } if (errs.length) bad.push('④ エラー: ' + errs[0]); await p.close(); }
  await b.close();
  if (bad.length) { console.log('BOOTFAST NG\n' + bad.join('\n')); process.exit(1); } console.log('BOOTFAST OK');
})();
