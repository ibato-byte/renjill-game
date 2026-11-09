// 季節と木の矛盾チェック：春・夏・冬なのに黄色いイチョウ（秋の木）、春以外の桜、冬以外の枯れ木が出ないこと（2026-11-09）
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + path.resolve('dist/test.html')); await p.waitForTimeout(500);
  const bad = await p.evaluate(() => { const ev = window.__hayDash.ev, TH = ev('THEMES'), out = [];
    const ok = { ginkgo: ['autumn'], sakura: ['spring'], bare: ['winter'] };
    for (const tid of Object.keys(TH)) for (let day = 1; day <= 4; day++) { const se = ev('seasonOf')(day); const base = TH[tid]; if (base.only && !base.only.includes(se)) continue;
      const th = ev('themeFor')(tid, day); const tr = th.tree; if (ok[tr] && !ok[tr].includes(se)) out.push(tid + ':' + se + ':' + tr);
      if (th.petals && se !== 'spring') out.push(tid + ':' + se + ':petals'); if (th.leaves && se !== 'autumn') out.push(tid + ':' + se + ':leaves'); if (th.spat === 'leaves' && se !== 'autumn') out.push(tid + ':' + se + ':leafground'); }
    return out; });
  console.log(bad.length ? 'SEASONTREE NG ' + bad.join(' ') : 'SEASONTREE OK'); await b.close(); process.exit(bad.length ? 1 : 0); })();
