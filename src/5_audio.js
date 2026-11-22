/* ================= sound (synthesized, no files) =================
   2026-11-15 みがき直し：音はすべてこのファイルの中で作る（音声ファイルなし・無料）。
   ・出口に「音割れ止め」（コンプレッサー＋リミッター）。大きい音が重なっても割れない
   ・BGM は A メロ・B メロ・間奏のある 16 小節（前は 4 小節のくり返し）。和音（パッド）・ベース・ドラムつき。場面が変わるときは小節の頭で切りかわる
   ・効果音は、いま流れている BGM の調（キー）に合わせた音程で鳴る（牧草・ごはん・パワーアップ・ミッション）
   ・大事な効果音のあいだ、BGM を少し下げる（ダッキング）。消音・音量の切りかえは、ぷつっと言わないよう なめらかに
   ・題名画面にも静かな曲。画面を閉じている間は音の処理を止める（電池） */
const AU = { ctx: null, master: null, music: null, nextT: 0, step: 0, on: false, key: 0, area: 'home', bars: 0 };
const MASTER_LV = .6;
function audioInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') { try { AU.ctx.resume(); } catch (e) { } } return; }
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { AU.ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { AU.ctx = new AC(); }
    const X = AU.ctx; AU.master = X.createGain(); AU.master.gain.value = SV.mute ? 0 : MASTER_LV;
    // 軽いコンプレッサーで音のつぶをそろえ、最後にリミッターで音割れを止める
    try { const comp = X.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 18; comp.ratio.value = 3; comp.attack.value = .004; comp.release.value = .12;
      const lim = X.createDynamicsCompressor(); lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = .001; lim.release.value = .08;
      AU.master.connect(comp); comp.connect(lim); lim.connect(X.destination); AU.comp = comp; AU.lim = lim; } catch (e) { AU.master.connect(X.destination); }
    // 短い部屋の響き：左右で少しちがう・高い音は早く消える（しゃりしゃりしない）
    try { const sr = X.sampleRate, n = Math.floor(sr * .85), ir = X.createBuffer(2, n, sr); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); let lp = 0; for (let i = 0; i < n; i++) { const w = (Math.random() * 2 - 1), k = .42 - .3 * (i / n); lp += (w - lp) * k; d[i] = lp * Math.pow(1 - i / n, 2.4) * (i < 60 ? i / 60 : 1); } }
      const cvb = X.createConvolver(); cvb.buffer = ir; const vg = X.createGain(); vg.gain.value = .22; cvb.connect(vg); vg.connect(AU.master); AU.verb = cvb; } catch (e) { AU.verb = null; }
    // BGM：音量 → ダッキング → こもらせる用のフィルター → 出口
    AU.music = X.createGain(); AU.music.gain.value = musicLv(); AU.duckG = X.createGain(); AU.duckG.gain.value = 1; AU.music.connect(AU.duckG);
    try { AU.musicLP = X.createBiquadFilter(); AU.musicLP.type = 'lowpass'; AU.musicLP.frequency.value = 18000; AU.musicLP.Q.value = .5; AU.duckG.connect(AU.musicLP); AU.musicLP.connect(AU.master); } catch (e) { AU.duckG.connect(AU.master); }
    if (AU.verb) { const s = X.createGain(); s.gain.value = .5; AU.duckG.connect(s); s.connect(AU.verb); }
    AU.sfx = X.createGain(); AU.sfx.gain.value = sfxLv(); AU.sfx.connect(AU.master); if (AU.verb) { const s = X.createGain(); s.gain.value = .35; AU.sfx.connect(s); s.connect(AU.verb); }
    const nb = X.createBuffer(1, 2400, X.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < 2400; i++) nd[i] = (Math.random() * 2 - 1); AU.hat = nb;
    // やわらかい弦の波形（むき出しののこぎり波より角が丸い）
    try { const N = 24, re = new Float32Array(N), im = new Float32Array(N); for (let k = 1; k < N; k++) im[k] = Math.pow(k, -1.35) * (k % 2 ? 1 : .72); AU.wStr = X.createPeriodicWave(re, im); } catch (e) { AU.wStr = null; }
  } catch (e) { AU.ctx = null; }
}
function auNow() { return AU.ctx ? AU.ctx.currentTime : 0; }
function setMute(m) { SV.mute = m; save(); if (AU.master) { try { const t = auNow(); AU.master.gain.cancelScheduledValues(t); AU.master.gain.setTargetAtTime(m ? 0 : MASTER_LV, t, .03); } catch (e) { AU.master.gain.value = m ? 0 : MASTER_LV; } } }
// volume in three steps: normal / quiet / off (old saves keep true = normal) (2026-11-08)
function musicLv() { const m = OPT().music; return m === 'low' ? .17 : m ? .36 : 0; }
function sfxLv() { const m = OPT().sfx; return m === 'low' ? .5 : m ? 1 : 0; }
function applyAudioOpt() { if (!AU.ctx) return; try { const t = auNow(); AU.music.gain.setTargetAtTime(musicLv(), t, .04); AU.sfx.gain.setTargetAtTime(sfxLv(), t, .04); } catch (e) { AU.music.gain.value = musicLv(); AU.sfx.gain.value = sfxLv(); } }
// 大事な効果音のあいだ、BGM を少しだけ下げる
function duck(amt, sec) { if (!AU.ctx || !AU.duckG) return; try { const t = auNow(), g = AU.duckG.gain; g.cancelScheduledValues(t); g.setTargetAtTime(1 - amt, t, .02); g.setTargetAtTime(1, t + sec, .22); } catch (e) { } }
// BGM をこもらせる（一時停止・結果の間）／元に戻す
function musicMuffle(on) { if (!AU.ctx || !AU.musicLP) return; try { AU.musicLP.frequency.setTargetAtTime(on ? 700 : 18000, auNow(), on ? .08 : .15); } catch (e) { } }
// いまの BGM の調に合わせた音の高さ（semi = ドからの半音、oct = 4 がまん中のド）
function keyHz(semi, oct) { return 261.63 * Math.pow(2, ((AU.key || 0) + semi) / 12 + ((oct || 4) - 4)); }
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16];
// 効果音用：調の主音を 392〜554Hz（ソ4〜ド#5）におさめ、そこから五音音階で上がる（高すぎる音にならない）
function sfxHz(i) { let r = keyHz(0, 4); while (r < 392) r *= 2; while (r >= 554.4) r /= 2; return r * Math.pow(2, PENTA[Math.max(0, Math.min(PENTA.length - 1, i))] / 12); }
function tone(freq, dur, type, vol, when, slide, dest) {
  if (!AU.ctx) return; const t = when || AU.ctx.currentTime;
  if (type === 'pluck') return pluck(freq, dur, vol, t, dest);
  if (type === 'bell') return bell(freq, dur, vol, t, dest);
  if (type === 'ep') return epiano(freq, dur, vol, t, dest);
  const o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
  o.type = type || 'square'; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .2, t + .008); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  o.connect(g); g.connect(dest || AU.sfx || AU.master); o.start(t); o.stop(t + dur + .02);
}
// はじいた弦（ウクレレ風）：やわらかい波形を、明るさが落ちていくローパスで。はじく瞬間だけ少し音程が高い
function pluck(freq, dur, vol, t, dest) {
  const o = AU.ctx.createOscillator(), f = AU.ctx.createBiquadFilter(), g = AU.ctx.createGain();
  if (AU.wStr) o.setPeriodicWave(AU.wStr); else o.type = 'sawtooth'; o.frequency.setValueAtTime(freq * 1.012, t); o.frequency.exponentialRampToValueAtTime(freq, t + .03); o.detune.setValueAtTime(4, t);
  f.type = 'lowpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(Math.min(12000, freq * 7), t); f.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 1.3), t + Math.max(.08, dur * .9));
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime((vol || .2) * 1.3, t + .004); g.gain.exponentialRampToValueAtTime(.0006, t + dur);
  o.connect(f); f.connect(g); g.connect(dest || AU.sfx || AU.master); o.start(t); o.stop(t + dur + .02);
}
// 鉄琴：基音＋2つの非整数倍音
function bell(freq, dur, vol, t, dest) {
  for (const [r, a, d] of [[1, 1, 1], [2.76, .35, .45], [5.4, .12, .22]]) {
    if (freq * r > 9000) continue;
    const o = AU.ctx.createOscillator(), g = AU.ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(freq * r, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime((vol || .2) * a, t + .003); g.gain.exponentialRampToValueAtTime(.0005, t + dur * d);
    o.connect(g); g.connect(dest || AU.sfx || AU.master); o.start(t); o.stop(t + dur * d + .02);
  }
}
// やわらかい電子ピアノ：正弦波を、すぐ弱まる正弦波でゆらす（FM）。たたいた瞬間だけ少しきらっとする
function epiano(freq, dur, vol, t, dest) {
  const c = AU.ctx.createOscillator(), m = AU.ctx.createOscillator(), mg = AU.ctx.createGain(), g = AU.ctx.createGain();
  c.type = 'sine'; c.frequency.setValueAtTime(freq, t); m.type = 'sine'; m.frequency.setValueAtTime(freq, t);
  mg.gain.setValueAtTime(freq * 1.1, t); mg.gain.exponentialRampToValueAtTime(Math.max(1, freq * .08), t + Math.min(.3, dur * .6)); m.connect(mg); mg.connect(c.frequency);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .2, t + .005); g.gain.exponentialRampToValueAtTime(.0006, t + dur);
  c.connect(g); g.connect(dest || AU.sfx || AU.master); c.start(t); m.start(t); c.stop(t + dur + .02); m.stop(t + dur + .02);
}
// 和音のうすい下じき（パッド）：ゆっくり立ち上がる丸い音
function pad(freqs, dur, vol, t, dest) {
  for (const fq of freqs) { const o = AU.ctx.createOscillator(), g = AU.ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(fq, t); o.detune.setValueAtTime((fq % 7) - 3, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + Math.min(.12, dur * .3)); g.gain.setValueAtTime(vol, t + dur * .6); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(dest || AU.music || AU.master); o.start(t); o.stop(t + dur + .02); }
}
// 太鼓・足音：音程が下がる短い音
function thump(f0, f1, dur, vol, when, dest) {
  if (!AU.ctx) return; const t = when || AU.ctx.currentTime; const o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .3, t + .003); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  o.connect(g); g.connect(dest || AU.sfx || AU.master); o.start(t); o.stop(t + dur + .02);
}
const NOISE_BUF = {};
function noise(dur, vol, hp, dest, when, lp) {
  if (!AU.ctx) return; const t = when || AU.ctx.currentTime, n = Math.max(1, Math.floor(AU.ctx.sampleRate * dur));
  // 同じ長さのノイズは作りおき（ジャンプ・着地のたびに作ると、スマホでごみ集めの小さな引っかかりになる：2026-11-09）
  const key = n; let buf = NOISE_BUF[key]; if (!buf) { buf = NOISE_BUF[key] = AU.ctx.createBuffer(1, n, AU.ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n); }
  const src = AU.ctx.createBufferSource(); src.buffer = buf; const f = AU.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 800;
  const g = AU.ctx.createGain(); g.gain.value = vol || .2; src.connect(f); let last = f; if (lp) { const f2 = AU.ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; f.connect(f2); last = f2; } last.connect(g); g.connect(dest || AU.sfx || AU.master); src.start(t);
}
// 風を切る音：ノイズの通り道（バンドパス）を動かす。from→to（Hz）
function whoosh(dur, vol, from, to, dest) {
  if (!AU.ctx) return; const t = AU.ctx.currentTime, n = Math.max(1, Math.floor(AU.ctx.sampleRate * dur)); let buf = NOISE_BUF['w' + n]; if (!buf) { buf = NOISE_BUF['w' + n] = AU.ctx.createBuffer(1, n, AU.ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n); }
  const src = AU.ctx.createBufferSource(); src.buffer = buf; const f = AU.ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.1; f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = AU.ctx.createGain(); g.gain.value = vol; src.connect(f); f.connect(g); g.connect(dest || AU.sfx || AU.master); src.start(t);
}
// 左右：いまのレーンの位置に合わせて、取る音を少しだけ左右に振る（真ん中のレーンは真ん中）
function lanePan() {
  if (!AU.ctx || !AU.ctx.createStereoPanner || typeof G === 'undefined' || !Number.isFinite(G.lat)) return null;
  try { const p = AU.ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, G.lat / 2.5)) * .5; p.connect(AU.sfx || AU.master); return p; } catch (e) { return null; }
}
function panTo(x, dest) { if (!AU.ctx || !AU.ctx.createStereoPanner) return null; try { const p = AU.ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, x)); p.connect(dest || AU.sfx || AU.master); return p; } catch (e) { return null; } }
const lowS = (f, dur, vol, t, to, dest) => { // 低いうなり：のこぎり波をローパスに通す（むき出しだと耳にささる）
  if (!AU.ctx) return; const o = AU.ctx.createOscillator(), fl = AU.ctx.createBiquadFilter(), g = AU.ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  fl.type = 'lowpass'; fl.frequency.value = Math.max(260, f * 3.2); fl.Q.value = .7; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  o.connect(fl); fl.connect(g); g.connect(dest || AU.sfx || AU.master); o.start(t); o.stop(t + dur + .02); };
let SFX_N = 0; // 鳴らした回数（同じ音が続いても、ほんの少しずつ音色を変える）
const SFX = {
  hay(n) { const d = lanePan(), f = sfxHz(Math.min(n, 5)) * (1 + ((SFX_N++ % 3) - 1) * .0018); tone(f, .12, 'pluck', .07, 0, 0, d); tone(f * 2, .06, 'sine', .018, AU.ctx && AU.ctx.currentTime + .01, 0, d); }, /* いちばん多く鳴る音なので小さく・低めに（BGM より大きく聞こえた・2026-11-08）。2026-11-15：コンボで上がる音程を、BGM の調の五音音階に（半音ずつだと曲とぶつかっていた） */
  food() { const d = lanePan(), t = auNow(); tone(sfxHz(2), .12, 'pluck', .16, 0, 0, d); tone(sfxHz(4), .16, 'pluck', .14, t + .06, 0, d); noise(.05, .05, 2500, d); },
  treat() { const d = lanePan(), t = auNow(); [0, 2, 3, 5].forEach((k, i) => tone(sfxHz(k) * 2, .5, 'bell', .12, t + i * .06, 0, d)); duck(.25, .35); },
  step(k, fl) { const d = panTo(k ? .14 : -.14); if (fl === 'room' || fl === 'deck') { thump(k ? 120 : 110, 60, .07, .03, 0, d); noise(.04, .008, 500, d); } else if (fl === 'glass' || fl === 'train') { thump(k ? 170 : 160, 80, .05, .03, 0, d); noise(.025, .014, 2400, d); } else { thump(k ? 150 : 135, 70, .06, .035, 0, d); noise(.03, .012, 1200, d); } }, // footsteps by floor: soft on tatami and wood, crisp on tiles, plain on the street (2026-11-08)。左右の足で、少しだけ左右から（2026-11-15）
  land() { thump(170, 70, .1, .1); noise(.06, .05, 600, null, 0, 3200); },                        // 着地（どすっ。高いざらつきは切る）
  pom() { const t = auNow(); tone(420, .09, 'sine', .14, 0, 900); tone(470, .1, 'sine', .14, t + .13, 980); noise(.08, .05, 1500); tone(sfxHz(5) * 2 > 1300 ? sfxHz(5) : sfxHz(5) * 2, .4, 'bell', .06, t + .26); },   // クリの登場（ほおぶくろ「ぽん、ぽん」）
  power() { const t = auNow(); [0, 2, 3, 5, 7].forEach((k, i) => { tone(sfxHz(k), .18, 'pluck', .12, t + i * .05); tone(sfxHz(k), .6, 'bell', .05, t + i * .05); }); whoosh(.35, .05, 500, 3200); duck(.3, .5); },
  jump() { const v = 1 + ((SFX_N++ % 3) - 1) * .03; tone(300 * v, .17, 'sine', .13, 0, 620 * v); whoosh(.16, .06, 900, 2600); },   // ぴょん（毎回ほんの少し高さがちがう）＋風
  slide() { whoosh(.26, .16, 2400, 500); thump(140, 80, .12, .08); },                                // ざざっ（高い所から低い所へ）
  turn() { const t = auNow(); tone(sfxHz(3) * 2, .12, 'pluck', .1); tone(sfxHz(5) * 2 > 1300 ? sfxHz(4) * 2 : sfxHz(5) * 2, .16, 'pluck', .1, t + .06); whoosh(.14, .05, 1800, 3600); },
  bump() { thump(170, 60, .22, .3); noise(.1, .14, 400, null, 0, 2600); tone(520, .05, 'sine', .05, 0, 300); duck(.3, .3); },
  bad() { const t = auNow(); tone(sfxHz(2), .16, 'pluck', .1, t, 0); tone(sfxHz(2) * .94, .16, 'sine', .06, t, sfxHz(2) * .8); tone(sfxHz(0) * .94, .24, 'pluck', .1, t + .15); tone(sfxHz(0) * .9, .24, 'sine', .06, t + .15, sfxHz(0) * .7); },   // うっ…（下がる2音。のこぎり波をやめた）
  crash() { const t = auNow(); noise(.45, .28, 200, null, 0, 3600); thump(220, 45, .5, .35); lowS(220, .5, .08, t, 55); duck(.6, .8); },
  rumble() { if (!AU.ctx) return; const t0 = AU.ctx.currentTime; for (let i = 0; i < 6; i++) lowS(55 + (i % 2) * 8, .22, .09, t0 + i * .16); noise(1.0, .08, 120, null, 0, 900); },
  roar() { if (!AU.ctx) return; const t = AU.ctx.currentTime; lowS(70, 1.1, .11, t, 160); lowS(140, .9, .04, t, 320); },
  ui() { tone(440, .06, 'pluck', .06); tone(220, .07, 'sine', .03); }, /* 高い音が耳ざわりだったので、低く・やわらかく（2026-11-08） */
  go() { const t = auNow(); tone(sfxHz(2), .1, 'pluck', .1, t); tone(sfxHz(5), .22, 'pluck', .12, t + .08); tone(sfxHz(5), .4, 'bell', .04, t + .08); },   // スタート・再開の「GO!」
  mission() { const t = auNow(); [2, 3, 5, 7].forEach((k, i) => { tone(sfxHz(k), .2, 'pluck', .14, t + i * .09); tone(sfxHz(k), .7, 'bell', .06, t + i * .09); }); duck(.3, .6); },
  best() { const t = auNow(); [0, 2, 4, 5, 7].forEach((k, i) => { tone(sfxHz(k), .22, 'pluck', .13, t + i * .08); }); [5, 7].forEach((k, i) => tone(sfxHz(k), 1.1, 'bell', .07, t + .4 + i * .02)); pad([sfxHz(0), sfxHz(2), sfxHz(4)], 1.1, .03, t + .4, AU.sfx); duck(.4, 1); },   // 自己ベスト：かけ上がって、和音でしめる
  over() { const t = auNow() + .5; [4, 2, 0].forEach((k, i) => tone(sfxHz(k) / 2, .5, 'pluck', .11, t + i * .17)); tone(sfxHz(0) / 2, .9, 'bell', .04, t + .34); },   // おしまいの3音（やさしく下がる）
  chime() { // the classic school/office chime
    if (!AU.ctx) return; const t = AU.ctx.currentTime; const N = [659, 523, 587, 392, 392, 587, 659, 523];
    N.forEach((f, i) => { tone(f, 1.1, 'sine', .2, t + i * .5); tone(f, 1.3, 'bell', .07, t + i * .5); });   // 鐘の倍音を少し（鉄琴型）
    duck(.45, 4.2);
  },
};
// one little original theme per part of the day (melody in semitones, -99 = rest). 8 分音符 32 個＝4 小節。
//  mel＝A メロ、mel2＝B メロ。bass / bass2 は半小節ごとの根音。inst＝主旋律の楽器（B メロは inst2）。pad＝和音の下じきの大きさ、sw＝はねるリズムの強さ、kick＝バスドラムの大きさ
const R_ = -99;
const SONGS = {
  title:   { bpm: 84, inst: 'bell', inst2: 'ep', lv: .05, pad: .9, sw: .1, kick: 0, hat: 0,
    mel: [0, R_, 4, R_, 7, R_, 4, R_, 9, R_, 7, R_, 4, R_, R_, R_, 2, R_, 5, R_, 9, R_, 7, R_, 4, R_, 2, R_, 0, R_, R_, R_], bass: [0, 0, 5, 5, 7, 7, 0, 0],
    mel2: [7, R_, R_, 4, R_, R_, 0, R_, 5, R_, R_, 4, R_, R_, 2, R_, 4, R_, R_, 0, R_, R_, -3, R_, 2, R_, 4, R_, 0, R_, R_, R_], bass2: [5, 5, 0, 0, -3, -3, 7, 0], bw: 'sine' },
  home:    { bpm: 104, inst: 'bell', inst2: 'pluck', lv: .06, pad: .5, sw: .1, kick: .6, mel: [0, 4, 7, 4, 9, 7, 4, -99, 2, 5, 9, 5, 7, -99, 4, 2, 0, 4, 7, 12, 11, 9, 7, -99, 5, 4, 2, 4, 0, -99, -99, -99], bass: [0, 0, 5, 5, 7, 7, 0, 0], bw: 'sine', hat: 0,
    mel2: [9, R_, 9, 7, 5, R_, 4, 5, 7, R_, 7, 5, 4, R_, 2, 4, 5, R_, 5, 4, 2, R_, 0, 2, 4, 2, 0, -1, 0, R_, R_, R_], bass2: [5, 5, 0, 0, 2, 7, 0, 0] },
  commute: { bpm: 132, inst: 'pluck', inst2: 'pluck', lv: .08, pad: .35, kick: 1, mel: [0, 4, 7, 9, 7, 4, 2, 4, 0, 4, 7, 12, 9, 7, 4, 2, 0, 2, 4, 7, 9, 12, 9, 7, 5, 4, 2, 4, 2, 0, -1, -3], bass: [0, 0, 7, 7, 5, 5, 7, 7], bw: 'triangle', hat: 1,
    mel2: [7, 7, 9, 7, 12, R_, 9, 7, 5, 5, 7, 5, 9, R_, 7, 5, 4, 4, 5, 4, 7, R_, 5, 4, 2, 4, 5, 7, 9, 7, 11, 12], bass2: [0, 0, 5, 5, 9, 9, 7, 7] },
  office:  { bpm: 118, inst: 'pluck', inst2: 'ep', lv: .07, pad: .4, kick: .9, mel: [7, -99, 7, 9, 7, 4, -99, 2, 4, -99, 4, 5, 4, 0, -99, -99, 2, -99, 2, 4, 2, -1, -99, 0, 2, 4, 7, 4, 2, 0, -99, -99], bass: [0, 4, 5, 7, 9, 7, 5, 4], bw: 'triangle', hat: 1,
    mel2: [0, R_, 4, 7, R_, 4, 0, R_, 2, R_, 5, 9, R_, 5, 2, R_, 4, R_, 7, 11, R_, 7, 4, R_, 5, 7, 9, 7, 5, 4, 2, R_], bass2: [0, 0, 2, 2, 4, 4, 5, 7] },
  evening: { bpm: 112, inst: 'bell', inst2: 'ep', lv: .05, pad: .9, sw: .08, kick: .8, mel: [11, 9, 7, 4, 7, -99, 9, 11, 12, 11, 9, 7, 9, -99, -99, 4, 7, 9, 11, 14, 12, 11, 9, 7, 4, 2, 4, 7, -99, -99, -99, -99], bass: [0, 0, -3, -3, 5, 5, 7, 7], bw: 'sine', hat: 1, chord: 1,
    mel2: [4, R_, 7, R_, 12, R_, 11, 9, 7, R_, R_, 4, 5, 7, R_, R_, 9, R_, 12, R_, 16, R_, 14, 12, 11, R_, 9, R_, 7, R_, R_, R_], bass2: [5, 5, 0, 0, 5, 5, 7, 7] },
  // お祭りの日（B-29）：提灯の道だけの祭りばやし（ヨナ抜きの笛と三味線ふう、太鼓）。どこかの曲ではなく、このゲームのための短いフレーズ
  matsuri: { bpm: 128, inst: 'pluck', inst2: 'pluck', lv: .08, pad: .2, kick: 1, mel: [12, 9, 7, 9, 12, -99, 14, 12, 9, 7, 4, 7, 9, -99, -99, -99, 7, 9, 12, 14, 16, 14, 12, 9, 12, 9, 7, 4, 7, -99, -99, -99], bass: [0, 0, 7, 7, 9, 9, 7, 7], bw: 'triangle', hat: 1, taiko: 1,
    mel2: [16, 14, 12, R_, 14, 12, 9, R_, 12, 9, 7, R_, 9, 7, 4, R_, 7, 9, 12, 9, 7, 9, 12, 14, 16, R_, 14, R_, 12, R_, R_, R_], bass2: [0, 0, 7, 7, 9, 9, 7, 7] },
  night:   { bpm: 92, inst: 'sine', inst2: 'ep', lv: .07, pad: 1, sw: .06, kick: .55, mel: [7, -99, 4, -99, 2, 4, -99, -99, 9, -99, 7, -99, 4, 2, -99, -99, 0, -99, 2, 4, 7, -99, 9, -99, 7, 4, 2, -99, 0, -99, -99, -99], bass: [0, 0, 5, 5, -3, -3, 7, 7], bw: 'sine', hat: 0, chord: 1,
    mel2: [0, R_, R_, 4, R_, R_, 7, R_, 5, R_, R_, 4, R_, R_, 2, R_, 0, R_, R_, -3, R_, R_, 0, R_, 2, R_, 4, R_, 2, R_, R_, R_], bass2: [5, 5, 0, 0, -3, -3, 7, 7] },
};
let musicKey = 0, musicArea = 'home';
// 曲の流れ（4 小節ごと）：A・A・B・A・間奏（主旋律は休み）・A・B・A。同じ 4 小節のくり返しに聞こえない
const SONG_FORM = ['A', 'A', 'B', 'A', 'X', 'A', 'B', 'A'];
// 根音から、その調の三和音（ド・ファ・ソは長調、レ・ミ・ラは短調）
function triad(r) { const d = ((r % 12) + 12) % 12, minor = d === 2 || d === 4 || d === 9; return [r, r + (minor ? 3 : 4), r + 7]; }
// 2026-11-08：場所の環境音（C-50）と雨の音（C-52）。ファイルは使わず、ノイズと短い音で作る。効果音の音量設定に従う
//  雨：外の区間で雨の日だけ、さあっというノイズ（屋内・電車では小さく）。海辺（deck）：ゆっくり寄せては返す波。公園：昼間ときどき小鳥。電車：ときどき小さな鈴
function ambLoop(hp, lp) { const n = AU.ctx.sampleRate * 2, b = AU.ctx.createBuffer(1, n, AU.ctx.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < n; i++) { l = l * .6 + (Math.random() * 2 - 1) * .4; d[i] = l; }
  const src = AU.ctx.createBufferSource(); src.buffer = b; src.loop = true; const f1 = AU.ctx.createBiquadFilter(); f1.type = 'highpass'; f1.frequency.value = hp; const f2 = AU.ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp;
  const g = AU.ctx.createGain(); g.gain.value = 0; src.connect(f1); f1.connect(f2); f2.connect(g); g.connect(AU.sfx || AU.master); src.start(); g.src = src; return g; }
// 鳴らすときだけ作り、静かになったら止める（ずっと回していると、音がなくても電池と CPU を使う。CI のシェア画像の試験が時間切れになった：2026-11-08）
function ambSet(A, key, v, hp, lp, now) {
  if (v > 0) { if (!A[key]) A[key] = ambLoop(hp, lp); A[key].gain.setTargetAtTime(v, now, .4); A[key + 'Q'] = 0; return; }
  const g = A[key]; if (!g) return; g.gain.setTargetAtTime(0, now, .3); A[key + 'Q'] = (A[key + 'Q'] || now) ; if (now - A[key + 'Q'] > 1.5) { try { g.src.stop(); g.disconnect(); } catch (e) { } A[key] = null; A[key + 'Q'] = 0; } }
const AMB_HIGH = { tower: 1, rooftop: 1, kukodeck: 1, skytree: 1 };
function ambTick() {
  if (!AU.ctx || typeof G === 'undefined') return;
  if (!AU.amb) AU.amb = { rain: null, sea: null, birdT: 0, chimeT: 0 };
  const A = AU.amb; if (A.off) return; const now = AU.ctx.currentTime, play = G.mode === 'play' || G.mode === 'countdown';
  let seg = null; try { seg = play ? curSeg() : null; } catch (e) { }
  const kind = seg ? seg.th.kind : '', inside = kind === 'room' || kind === 'train';
  const rainV = play && G.weather === 'rain' ? (inside ? .012 : .045) : 0;
  /* 2026-11-15：高い所（屋上の庭・電波塔の階段・空港の展望デッキ・展望台）は波の音ではなく風の音に（会社の屋上で波の音がしていた）。商店街・仲見世・市場は昼間、うすい人のざわめき */
  const high = seg && AMB_HIGH[seg.tid], st = seg && seg.th.fac ? seg.th.fac.style : '';
  const seaV = play && kind === 'deck' && !high ? .05 * (.55 + .45 * Math.sin(now * 1.1)) : 0;   // 寄せては返す
  const windV = play && high && !inside ? .03 * (.5 + .5 * Math.sin(now * .7) * Math.sin(now * .23 + 1)) + .012 : 0;
  const trainV = play && kind === 'train' ? (seg.th.tunnel ? .03 : .018) * (.7 + .3 * clamp((G.speed || 0) / 16, 0, 1)) * (.9 + .1 * Math.sin(now * 1.7)) : 0; /* [87] 走る電車の低いゴーという音（速いほど大きく・地下鉄はトンネルで大きく） */
  const crowdV = play && (st === 'nakamise' || st === 'market') && G.clock < 20 * 60 && G.weather !== 'rain' ? .013 * (.75 + .25 * Math.sin(now * .9)) : 0;
  try { ambSet(A, 'rain', rainV, 500, 7000, now); ambSet(A, 'sea', seaV, 120, 900, now); ambSet(A, 'wind', windV, 180, 620, now); ambSet(A, 'crowd', crowdV, 260, 1500, now); ambSet(A, 'rumble', trainV, 50, 380, now); } catch (e) { A.off = 1; return; }
  A.level = { rain: rainV, sea: seaV, wind: windV, crowd: crowdV, rumble: trainV };
  if (!play) return;
  const park = seg && seg.th.fac && seg.th.fac.style === 'park', day = G.clock < 17 * 60 && G.weather !== 'rain';
  if (park && day && now > A.birdT) { A.birdT = now + 2.5 + Math.random() * 4; const f = 1050 + Math.random() * 200; for (let i = 0; i < 2 + (Math.random() * 2 | 0); i++) tone(f + i * 40, .08, 'sine', .015, now + i * .12, (f + i * 40) * 1.22); /* 高すぎない小鳥（1300Hz 以下から少し上がる） */ A.birds = (A.birds || 0) + 1; }
  if (kind === 'train' && (G.joltN || 0) !== A.joltN) { A.joltN = G.joltN || 0; const v = Math.max(4, G.speed || 10), gap = Math.min(.6, 4.6 / v); /* [86] 継ぎ目の音を、車輪の並びどおりに：前の台車の 2 つの車輪「タタン」→ となりの車両の台車「タタン」。間は電車の速さで決まる */
    for (const [t0, f] of [[0, 74], [.085, 70], [gap, 66], [gap + .085, 62]]) { thump(f, f * .66, .08, .028, now + t0); noise(.025, .005, 900, null, now + t0, 2600); } A.rails = (A.rails || 0) + 1; }   // 電車：レールの継ぎ目の「タタン、タタン」
  if (kind === 'train' && now > A.chimeT) { A.chimeT = now + 9 + Math.random() * 6; bell(1046.5, .5, .02, now); bell(784, .6, .018, now + .22); A.chimes = (A.chimes || 0) + 1; }
}
function drumHit(kind, t, lv) { // ハイハット・スネア：ノイズを通り道でけずる
  const X = AU.ctx; if (!AU.hat) return; const n = X.createBufferSource(); n.buffer = AU.hat; const g = X.createGain(), f = X.createBiquadFilter();
  if (kind === 'snare') { f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = .8; g.gain.setValueAtTime(lv, t); g.gain.exponentialRampToValueAtTime(.001, t + .11); thump(210, 150, .07, lv * .6, t, AU.music); }
  else { f.type = 'highpass'; f.frequency.value = kind === 'open' ? 6500 : 7500; g.gain.setValueAtTime(lv, t); g.gain.exponentialRampToValueAtTime(.001, t + (kind === 'open' ? .16 : .035)); }
  n.connect(f); f.connect(g); g.connect(AU.music); n.start(t); n.stop(t + .2);
}
function musicTick() {
  ambTick();
  if (!AU.ctx || !AU.on) return;
  if (AU.ctx.state !== 'running') return;                      // 止まっている間（画面を閉じている・まだ音が許されていない）は、ためこまない
  if (AU.nextT < AU.ctx.currentTime - .5) AU.nextT = AU.ctx.currentTime + .05;   // 長く止まっていた後は、今から（たまった分を一気に鳴らさない）
  const fev = typeof G !== 'undefined' && G.fever > 0;   // フィーバー中：主旋律を1オクターブ上、テンポ +10%
  while (AU.nextT < AU.ctx.currentTime + .12) {
    // 場面（曲・調）の切りかえは小節の頭で
    if (AU.step % 8 === 0 && (AU.area !== musicArea || AU.key !== musicKey || AU.swap)) { const ch = AU.area !== musicArea; AU.area = musicArea; AU.key = musicKey; AU.swap = 0; if (ch) AU.step = 0; }
    const sg = SONGS[AU.area] || SONGS.commute, spd = typeof G !== 'undefined' && G.mode !== 'title' && Number.isFinite(G.speed) ? G.speed : 10;
    const spb = 60 / ((sg.bpm + Math.min(30, Math.max(0, spd - 10) * 1.5)) * (fev ? 1.1 : 1)) / 2;
    const st = AU.step, base = 261.63 * Math.pow(2, AU.key / 12), part = SONG_FORM[(st / 32 | 0) % SONG_FORM.length], B = part === 'B' && sg.mel2;
    const t = AU.nextT + (st % 2 ? (sg.sw || 0) * spb : 0), inst = (B ? sg.inst2 : sg.inst) || sg.inst || 'pluck', mel = B ? sg.mel2 : sg.mel, bassL = B && sg.bass2 ? sg.bass2 : sg.bass;
    const m = mel[st % mel.length], rest = part === 'X' && st % 32 < 16;   // 間奏：前半 2 小節は主旋律を休む
    if (m > -50 && !rest) { const acc = st % 4 === 0 ? 1.08 : .93, f = base * (fev ? 4 : 2) * Math.pow(2, m / 12);
      tone(f > 2100 ? f / 2 : f, spb * (inst === 'bell' ? 2.2 : inst === 'sine' ? 1.6 : inst === 'ep' ? 1.9 : 1.4), inst, sg.lv * (inst === 'pluck' ? 1.6 : inst === 'ep' ? 1.5 : 1) * acc, t, 0, AU.music); }
    const kk = sg.kick == null ? 1 : sg.kick;
    if (kk > 0 && (st % 8 === 0 || st % 8 === 4)) thump(120, 48, .14, .22 * kk, AU.nextT, AU.music);   // キック
    if (kk > .8 && st % 16 === 15 && sg.hat) thump(118, 50, .1, .1 * kk, t, AU.music);                // 2 小節に 1 回、次の小節へ押し出す弱いキック
    if (sg.taiko && (st % 8 === 3 || st % 16 === 14)) thump(95, 42, .2, .26, AU.nextT, AU.music);   // お祭りの太鼓（ドン・ドドン）
    if (sg.hat && (st % 8 === 2 || st % 8 === 6)) drumHit('snare', AU.nextT, .075);   // 軽いスネア
    if (sg.hat && st % 32 >= 30) drumHit('snare', t, st % 32 === 31 ? .06 : .04);       // 4 小節の終わりに小さなおかず
    const root = bassL[(st / 4 | 0) % 8];
    if (st % 2 === 0) tone(base / 2 * Math.pow(2, root / 12), spb * 1.7, sg.bw, .15, AU.nextT, 0, AU.music);
    if (sg.pad && st % 4 === 0) pad(triad(root).map(iv => base * Math.pow(2, iv / 12)), spb * 4.4, .016 * sg.pad, AU.nextT, AU.music);   // 和音の下じき（半小節ごと）
    if (sg.hat && st % 2 === 1) drumHit(st % 32 === 27 ? 'open' : 'hat', t, st % 4 === 3 ? .045 : .024);
    AU.nextT += spb; AU.step++; if (st % 8 === 7) AU.bars = (AU.bars || 0) + 1;
  }
}
// an original little platform jingle (not any real station's melody)
function jingle() { if (!AU.ctx) return; const t0 = AU.ctx.currentTime; [0, 4, 7, 12, 7, 9, 11, 12].forEach((iv, i) => tone(523.25 * Math.pow(2, iv / 12), .22, 'sine', .07, t0 + i * .13)); }
function musicStart() { if (!AU.ctx) return; AU.on = true; AU.nextT = AU.ctx.currentTime + .05; AU.step = 0; AU.area = musicArea; AU.key = musicKey; musicMuffle(false); }
function musicStop(how) { AU.on = false; if (how === 'end' && AU.ctx) SFX.over(); }
// 題名画面の静かな曲（音が出せるようになってから。走り始めると musicStart がその場面の曲に切りかえる）
function titleMusic() { if (!AU.ctx || typeof G === 'undefined' || G.mode !== 'title') return; if (AU.on && AU.area === 'title') return; musicArea = 'title'; musicKey = 0; musicStart(); }
// 画面を閉じている間は音の処理を止める（電池）。戻ったら再開
document.addEventListener('visibilitychange', () => { if (!AU.ctx) return; try { if (document.hidden) AU.ctx.suspend(); else AU.ctx.resume(); } catch (e) { } });
function buzz(ms) { const v = OPT().vib; if (!v) return; if (v === 'low') ms = Array.isArray(ms) ? ms.map(x => Math.max(8, Math.round(x * .4))) : Math.max(8, Math.round(ms * .4)); try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } }
// 画面にふれたら音を起こす：はじめての1回で音の用意をし、止められていた音（電話・画面ロック・ほかのアプリから戻った後）も再開する。題名画面なら静かな曲を流す
function audioWake() { try { if (!AU.ctx) audioInit(); else if (AU.ctx.state !== 'running') AU.ctx.resume(); if (typeof G !== 'undefined' && G.mode === 'title' && AU.ctx) setTimeout(() => { try { titleMusic(); } catch (e) { } }, 60); } catch (e) { } }
addEventListener('pointerdown', audioWake, true); addEventListener('keydown', audioWake, true);
// 2026-11-15 オーナー：「はじめて開いた時も題名の曲を」。スマホ・ブラウザの決まりで、画面に一度もふれていないうちは音を出せない（どのサイトも同じ）。
// そこで、最初のどのふれ方（指を離した時・クリック）でも、すぐ曲が始まるようにする（iPhone は pointerdown だけでは音が許されないことがある）
for (const ev of ['touchend', 'click']) addEventListener(ev, audioWake, true);
