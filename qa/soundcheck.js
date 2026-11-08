// 音の点検（2026-11-08 オーナーの感想「ボタンの音が高くて耳ざわり」から）：
// - ゲームの中の効果音は、音のモジュール（src/5_audio.js）の柔らかい音色（pluck・bell・sine）で鳴らす。むき出しの矩形波・三角波・のこぎり波を直接使わない
// - 高すぎる音（1300Hz を超える基音）を直接鳴らさない
// - いちばんよく鳴る「牧草を取る音」は BGM より目立ちすぎない音量（0.08 以下）
const fs = require('fs'), path = require('path');
const src = path.resolve(__dirname, '../src'); const bad = [];
for (const f of fs.readdirSync(src).filter(f => f.endsWith('.js') && f !== '5_audio.js')) {
  const t = fs.readFileSync(path.join(src, f), 'utf8');
  for (const m of t.matchAll(/tone\(([^;]*?)\)/g)) {
    const args = m[1]; if (/'(square|triangle|sawtooth)'/.test(args)) bad.push(f + ': raw wave ' + m[0].slice(0, 60));
    const hz = parseFloat(args); if (hz > 1300) bad.push(f + ': too high ' + m[0].slice(0, 60));
  }
}
const au = fs.readFileSync(path.join(src, '5_audio.js'), 'utf8'); const hay = au.match(/hay\(n\) \{[^}]*\}/);
if (!hay) bad.push('hay sound not found'); else { const v = [...hay[0].matchAll(/'pluck', ([\d.]+)/g)].map(x => +x[1]); if (!v.length || Math.max(...v) > .08) bad.push('hay sound too loud ' + v); }
console.log(bad.length ? 'SOUND NG\n' + bad.join('\n') : 'SOUND OK');
