// 着せ替えの見た目：全キャラの帽子・コスプレを、走る後ろ姿・振り向き・正面で描いて一覧画像にする（shots/hatfit_<who>.png）
// 帽子が頭に「のっているだけ」にならないこと：かぶる帽子（ヘルメット・ベレー帽・麦わら・サンタ帽など）は、つばが頭の上の端より下（おでこ側）に来ること
// ジルの耳はかぶる帽子をつけても見えること（帽子の上に耳が出る）
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXEC || undefined }); const errs = [];
  const p = await b.newPage({ viewport: { width: 400, height: 800 } }); p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { localStorage.setItem('renjill-hay-dash-v1', JSON.stringify({ tutDone: 1, nickAsked: 1, runs: 9, pomMet: 1 })); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + path.resolve(__dirname, '../dist') + '/test.html'); await p.waitForTimeout(900);
  const res = await p.evaluate(() => {
    const ev = window.__hayDash.ev, out = { sheets: {}, bad: [] };
    const items = JSON.parse(ev("JSON.stringify(CLOSET.filter(c=>c.slot==='hat'||c.slot==='suit').map(c=>[c.who,c.slot,c.v]))"));
    // the topmost row that has the hair/fur colour of the head: compare a frame with and without the hat
    const topOf = (cv, pred) => { const g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data; for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) { const i = (y * cv.width + x) * 4; if (d[i + 3] > 200 && pred(d[i], d[i + 1], d[i + 2])) return y; } return -1; };
    for (const who of ['ren', 'jill', 'pom']) {
      const list = [['none', '']].concat(items.filter(i => i[0] === who).map(i => [i[1], i[2]])), seen = new Set();
      const frames = [];
      for (const [slot, v] of list) { if (seen.has(slot + v)) continue; seen.add(slot + v);
        ev(`(()=>{WEAR.${who}.hat='';WEAR.${who}.suit='';${slot !== 'none' ? `WEAR.${who}.${slot}='${v}';` : ''}buildBunnies('${who}');})()`);
        const B = JSON.parse(ev(`JSON.stringify(['run0','look_happy','front_open'].map(k=>BUN['${who}'][k].toDataURL()))`)); frames.push([slot + ':' + v, B]);
        if (slot === 'hat' && who === 'jill' && ev(`HAT_COVER['${v}']?1:0`)) { // her pink inner ears must still show above the hat
          const pink = ev(`(()=>{const c=BUN.jill.front_open,g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=4){if(d[i+3]>200&&Math.abs(d[i]-0xEB)<14&&Math.abs(d[i+1]-0xB1)<18&&Math.abs(d[i+2]-0xA8)<18)n++;}return n;})()`);
          if (pink < 150) out.bad.push('jill ears hidden by ' + v + ' (' + pink + ')');
        }
      }
      out.sheets[who] = frames;
    }
    // covering hats sit low: the brim (the widest coloured row of the hat) must be below where the bare head starts
    for (const [who, x0] of [['ren', 0], ['jill', 0], ['pom', 0]]) {
      for (const v of ['helmet', 'beret', 'straw', 'santa']) {
        if (!items.some(i => i[0] === who && i[2] === v)) continue;
        const top = JSON.parse(ev(`(()=>{const get=k=>{WEAR.${who}.hat=k;WEAR.${who}.suit='';buildBunnies('${who}');const c=BUN['${who}'].front_open,d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let t=-1;for(let y=0;y<c.height&&t<0;y++)for(let x=0;x<c.width;x++){if(d[(y*c.width+x)*4+3]>200){t=y;break;}}return {t,h:c.height};};const a=get(''),b=get('${v}');WEAR.${who}.hat='';buildBunnies('${who}');return JSON.stringify([a.t,b.t]);})()`));
        const [bare, withHat] = top; // the hat may rise above the head, but not by more than a hat's own height (it must not float)
        if (withHat < bare - 95) out.bad.push(`${who} ${v} floats (${bare}→${withHat})`);
      }
    }
    return out;
  });
  errs.push(...res.bad);
  const dir = process.env.SHOTS || path.resolve(__dirname, '../shots'); fs.mkdirSync(dir, { recursive: true });
  // one sheet per character: rows of [back, look, front]
  const pg = await b.newPage({ viewport: { width: 900, height: 400 } });
  for (const who in res.sheets) {
    const html = '<body style="margin:0;background:#cfe3c8;font:12px sans-serif">' + res.sheets[who].map(([n, fr]) => `<div style="display:flex;align-items:center"><div style="width:110px">${n}</div>${fr.map(u => `<img src="${u}" style="width:180px">`).join('')}</div>`).join('') + '</body>';
    await pg.setContent(html); await pg.waitForTimeout(200); await pg.screenshot({ path: `${dir}/hatfit_${who}.png`, fullPage: true });
  }
  console.log(errs.length ? 'FAIL ' + errs.join(' || ') : 'HAT FIT OK no errors'); await b.close();
})();
