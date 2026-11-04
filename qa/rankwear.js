// ランキングの顔：それぞれのプレイヤーが着せ替えた姿で出る（知らない値・壊れた値は、いつもの姿にもどる）。自分の行は今の服。
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined });
  const errs = []; const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + require('path').resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(800);
  const r = await p.evaluate(() => { const D = window.__hayDash; return D.ev(`(() => {
    const rows = [
      { id: 'a', m: 900, mc: 'ren', wr: 'gold...0' }, { id: 'b', m: 800, mc: 'ren', wr: 'red.crown..0' }, { id: 'c', m: 700, mc: 'ren', wr: 'navy..bee.0' },
      { id: 'd', m: 600, mc: 'jill', wj: 'pink.ribbon.' }, { id: 'e', m: 500, mc: 'jill', wj: 'brown..' }, { id: 'f', m: 400, mc: 'pom' },
      { id: 'g', m: 300, mc: 'ren', wr: '<img src=x onerror=alert(1)>.zzz' }, { id: 'h', m: 200, mc: 'jill' }, { id: 'i', m: 100, mc: 'ren', wr: 'gold...1' } ];
    const el = document.createElement('div'); el.id = 'rwTest'; el.style.cssText = 'position:fixed;left:0;top:0;width:390px;background:#fff;z-index:99999;padding:8px'; document.body.appendChild(el);
    rankList(el, rows, 'm', id => 'player ' + id);
    const src = [...el.querySelectorAll('img')].map(i => i.src);
    return { src, def: { ren: RANK_ICON.ren, jill: RANK_ICON.jill, pom: RANK_ICON.pom }, wearNow: JSON.stringify(WEAR) };
  })()`); });
  const [a, bb, c, d, e, f, g, h, i] = r.src;
  if (r.src.some(x => !/^data:image\/png/.test(x))) errs.push('icon missing');
  if (a !== r.def.ren) errs.push('default ren outfit should match the plain icon');
  if (e !== r.def.jill || h !== r.def.jill) errs.push('default jill should match the plain icon');
  if (bb === a || c === a || bb === c) errs.push('ren outfits not drawn differently');
  if (d === e) errs.push('jill outfit not drawn');
  if (f !== r.def.pom) errs.push('pom icon');
  if (g !== r.def.ren) errs.push('broken outfit code did not fall back');
  if (i === a) errs.push('mug not drawn');
  if (r.wearNow !== JSON.stringify({ ren: { tie: 'gold', hat: '', suit: '' }, jill: { frame: 'brown', hat: '', suit: '' }, pom: { band: 'red', hat: '', suit: '' } })) errs.push('the player\'s own outfit changed while drawing others ' + r.wearNow);
  await p.screenshot({ path: (process.env.SHOTS || 'shots') + '/rank_wear.png', clip: { x: 0, y: 0, width: 390, height: 520 } });
  console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'RANK WEAR OK no errors'); await b.close();
})();
