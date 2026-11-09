/* ================= sound (synthesized, no files) ================= */
const AU = { ctx: null, master: null, music: null, nextT: 0, step: 0, on: false };
function audioInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    AU.ctx = new AC(); AU.master = AU.ctx.createGain(); AU.master.gain.value = SV.mute ? 0 : .6;
    // 2026-11：軽いコンプレッサーで音割れを防ぎ、短い響き（部屋鳴り）を少し足す。音の数が増えても耳に痛くならない
    try { const comp = AU.ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 18; comp.ratio.value = 3; comp.attack.value = .004; comp.release.value = .12; AU.master.connect(comp); comp.connect(AU.ctx.destination); AU.comp = comp; } catch (e) { AU.master.connect(AU.ctx.destination); }
    try { const sr = AU.ctx.sampleRate, n = Math.floor(sr * .7), ir = AU.ctx.createBuffer(2, n, sr); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); let lp = 0; for (let i = 0; i < n; i++) { const w = (Math.random() * 2 - 1); lp += (w - lp) * .35; d[i] = lp * Math.pow(1 - i / n, 2.6) * (i < 40 ? i / 40 : 1); } } const cv = AU.ctx.createConvolver(); cv.buffer = ir; const vg = AU.ctx.createGain(); vg.gain.value = .22; cv.connect(vg); vg.connect(AU.master); AU.verb = cv; } catch (e) { AU.verb = null; }
    AU.music = AU.ctx.createGain(); AU.music.gain.value = musicLv(); AU.music.connect(AU.master); if (AU.verb) { const s = AU.ctx.createGain(); s.gain.value = .5; AU.music.connect(s); s.connect(AU.verb); }
    AU.sfx = AU.ctx.createGain(); AU.sfx.gain.value = sfxLv(); AU.sfx.connect(AU.master); if (AU.verb) { const s = AU.ctx.createGain(); s.gain.value = .35; AU.sfx.connect(s); s.connect(AU.verb); }
    const nb = AU.ctx.createBuffer(1, 800, AU.ctx.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < 800; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / 800); AU.hat = nb;
  } catch (e) { AU.ctx = null; }
}
function setMute(m) { SV.mute = m; save(); if (AU.master) AU.master.gain.value = m ? 0 : .6; }
// volume in three steps: normal / quiet / off (old saves keep true = normal) (2026-11-08)
function musicLv() { const m = OPT().music; return m === 'low' ? .17 : m ? .36 : 0; }
function sfxLv() { const m = OPT().sfx; return m === 'low' ? .5 : m ? 1 : 0; }
function applyAudioOpt() { if (!AU.ctx) return; AU.music.gain.value = musicLv(); AU.sfx.gain.value = sfxLv(); }
function tone(freq, dur, type, vol, when, slide, dest) {
  if (!AU.ctx) return; const t = when || AU.ctx.currentTime;
  if (type === 'pluck') return pluck(freq, dur, vol, t, dest);
  if (type === 'bell') return bell(freq, dur, vol, t, dest);
  const o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
  o.type = type || 'square'; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .2, t + .008); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  o.connect(g); g.connect(dest || AU.sfx || AU.master); o.start(t); o.stop(t + dur + .02);
}
// はじいた弦（ウクレレ風）：倍音を含む波形を、明るさが落ちていくローパスで
function pluck(freq, dur, vol, t, dest) {
  const o = AU.ctx.createOscillator(), f = AU.ctx.createBiquadFilter(), g = AU.ctx.createGain();
  o.type = 'sawtooth'; o.frequency.setValueAtTime(freq, t); o.detune.setValueAtTime(4, t);
  f.type = 'lowpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(Math.min(12000, freq * 7), t); f.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 1.3), t + Math.max(.08, dur * .9));
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime((vol || .2) * 1.3, t + .004); g.gain.exponentialRampToValueAtTime(.0006, t + dur);
  o.connect(f); f.connect(g); g.connect(dest || AU.sfx || AU.master); o.start(t); o.stop(t + dur + .02);
}
// 鉄琴：基音＋2つの非整数倍音
function bell(freq, dur, vol, t, dest) {
  for (const [r, a, d] of [[1, 1, 1], [2.76, .35, .45], [5.4, .12, .22]]) {
    const o = AU.ctx.createOscillator(), g = AU.ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(freq * r, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime((vol || .2) * a, t + .003); g.gain.exponentialRampToValueAtTime(.0005, t + dur * d);
    o.connect(g); g.connect(dest || AU.sfx || AU.master); o.start(t); o.stop(t + dur * d + .02);
  }
}
// 太鼓・足音：音程が下がる短い音
function thump(f0, f1, dur, vol, when, dest) {
  if (!AU.ctx) return; const t = when || AU.ctx.currentTime; const o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .3, t + .003); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  o.connect(g); g.connect(dest || AU.sfx || AU.master); o.start(t); o.stop(t + dur + .02);
}
function noise(dur, vol, hp, dest) {
  if (!AU.ctx) return; const t = AU.ctx.currentTime, n = Math.floor(AU.ctx.sampleRate * dur);
  const buf = AU.ctx.createBuffer(1, n, AU.ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = AU.ctx.createBufferSource(); src.buffer = buf; const f = AU.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 800;
  const g = AU.ctx.createGain(); g.gain.value = vol || .2; src.connect(f); f.connect(g); g.connect(dest || AU.sfx || AU.master); src.start(t);
}
// 左右：いまのレーンの位置に合わせて、取る音を少しだけ左右に振る（真ん中のレーンは真ん中）
function lanePan() {
  if (!AU.ctx || !AU.ctx.createStereoPanner || typeof G === 'undefined' || !Number.isFinite(G.lat)) return null;
  try { const p = AU.ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, G.lat / 2.5)) * .5; p.connect(AU.sfx || AU.master); return p; } catch (e) { return null; }
}
const SFX = {
  hay(n) { const d = lanePan(), f = 660 * Math.pow(1.0595, Math.min(n, 7)); tone(f, .12, 'pluck', .07, 0, 0, d); tone(f * 2, .06, 'sine', .018, AU.ctx && AU.ctx.currentTime + .01, 0, d); }, /* いちばん多く鳴る音なので小さく・低めに（BGM より大きく聞こえた・2026-11-08） */
  food() { const d = lanePan(); tone(660, .12, 'pluck', .16, 0, 0, d); tone(990, .16, 'pluck', .14, AU.ctx && AU.ctx.currentTime + .06, 0, d); noise(.05, .06, 2500, d); },
  treat() { const d = lanePan(); [784, 988, 1175, 1568].forEach((f, i) => tone(f, .5, 'bell', .14, AU.ctx && AU.ctx.currentTime + i * .06, 0, d)); },
  step(k, fl) { if (fl === 'room' || fl === 'deck') { thump(k ? 120 : 110, 60, .07, .03); noise(.04, .008, 500); } else if (fl === 'glass' || fl === 'train') { thump(k ? 170 : 160, 80, .05, .03); noise(.025, .014, 2400); } else { thump(k ? 150 : 135, 70, .06, .035); noise(.03, .012, 1200); } }, // footsteps by floor: soft on tatami and wood, crisp on tiles, plain on the street (2026-11-08)        // 足音（走りの拍に合わせて 6_game から）
  land() { thump(170, 70, .1, .1); noise(.06, .05, 600); },                        // 着地
  pom() { const t = AU.ctx && AU.ctx.currentTime; tone(420, .09, 'sine', .14, 0, 900); tone(470, .1, 'sine', .14, t + .13, 980); noise(.08, .05, 1500); tone(1568, .4, 'bell', .06, t + .26); },   // ポムの登場（ほおぶくろ「ぽん、ぽん」）
  power() { [523, 659, 784, 1047, 1319].forEach((f, i) => { tone(f, .18, 'pluck', .12, AU.ctx && AU.ctx.currentTime + i * .05); tone(f, .6, 'bell', .05, AU.ctx && AU.ctx.currentTime + i * .05); }); },
  jump() { tone(320, .16, 'sine', .14, 0, 640); noise(.12, .05, 1800); },
  slide() { noise(.22, .14, 900); thump(140, 80, .12, .08); },
  turn() { tone(1047, .12, 'pluck', .1); tone(1319, .16, 'pluck', .1, AU.ctx && AU.ctx.currentTime + .06); noise(.08, .05, 3000); },
  bump() { thump(170, 60, .22, .3); noise(.1, .16, 400); tone(900, .04, 'triangle', .05); },
  bad() { tone(392, .14, 'sawtooth', .1, 0, 196); tone(311, .2, 'sawtooth', .1, AU.ctx && AU.ctx.currentTime + .14, 150); },
  crash() { noise(.45, .3, 200); thump(220, 45, .5, .35); tone(220, .5, 'sawtooth', .08, 0, 55); },
  rumble() { if (!AU.ctx) return; const t0 = AU.ctx.currentTime; for (let i = 0; i < 6; i++) { tone(55 + (i % 2) * 8, .22, 'sawtooth', .07, t0 + i * .16); } noise(1.0, .08, 120); },
  roar() { if (!AU.ctx) return; tone(70, 1.1, 'sawtooth', .09, 0, 160); tone(140, .9, 'square', .03, 0, 320); },
  ui() { tone(440, .06, 'pluck', .06); tone(220, .07, 'sine', .03); }, /* 高い音が耳ざわりだったので、低く・やわらかく（2026-11-08） */
  mission() { [659, 784, 1047, 1319].forEach((f, i) => { tone(f, .2, 'pluck', .14, AU.ctx && AU.ctx.currentTime + i * .09); tone(f, .7, 'bell', .06, AU.ctx && AU.ctx.currentTime + i * .09); }); },
  chime() { // the classic school/office chime
    if (!AU.ctx) return; const t = AU.ctx.currentTime; const N = [659, 523, 587, 392, 392, 587, 659, 523];
    N.forEach((f, i) => { tone(f, 1.1, 'sine', .2, t + i * .5); tone(f, 1.3, 'bell', .07, t + i * .5); });   // 鐘の倍音を少し（鉄琴型）
  },
};
// one little original theme per part of the day (melody in semitones, -99 = rest)
const SONGS = {
  home:    { bpm: 104, inst: 'bell', lv: .06, mel: [0, 4, 7, 4, 9, 7, 4, -99, 2, 5, 9, 5, 7, -99, 4, 2, 0, 4, 7, 12, 11, 9, 7, -99, 5, 4, 2, 4, 0, -99, -99, -99], bass: [0, 0, 5, 5, 7, 7, 0, 0], bw: 'sine', hat: 0 },
  commute: { bpm: 132, inst: 'pluck', lv: .08, mel: [0, 4, 7, 9, 7, 4, 2, 4, 0, 4, 7, 12, 9, 7, 4, 2, 0, 2, 4, 7, 9, 12, 9, 7, 5, 4, 2, 4, 2, 0, -1, -3], bass: [0, 0, 7, 7, 5, 5, 7, 7], bw: 'triangle', hat: 1 },
  office:  { bpm: 118, inst: 'pluck', lv: .07, mel: [7, -99, 7, 9, 7, 4, -99, 2, 4, -99, 4, 5, 4, 0, -99, -99, 2, -99, 2, 4, 2, -1, -99, 0, 2, 4, 7, 4, 2, 0, -99, -99], bass: [0, 4, 5, 7, 9, 7, 5, 4], bw: 'triangle', hat: 1 },
  evening: { bpm: 112, inst: 'bell', lv: .05, mel: [11, 9, 7, 4, 7, -99, 9, 11, 12, 11, 9, 7, 9, -99, -99, 4, 7, 9, 11, 14, 12, 11, 9, 7, 4, 2, 4, 7, -99, -99, -99, -99], bass: [0, 0, -3, -3, 5, 5, 7, 7], bw: 'sine', hat: 1, chord: 1 },
  // お祭りの日（B-29）：提灯の道だけの祭りばやし（ヨナ抜きの笛と三味線ふう、太鼓）。どこかの曲ではなく、このゲームのための短いフレーズ
  matsuri: { bpm: 128, inst: 'pluck', lv: .08, mel: [12, 9, 7, 9, 12, -99, 14, 12, 9, 7, 4, 7, 9, -99, -99, -99, 7, 9, 12, 14, 16, 14, 12, 9, 12, 9, 7, 4, 7, -99, -99, -99], bass: [0, 0, 7, 7, 9, 9, 7, 7], bw: 'triangle', hat: 1, taiko: 1 },
  night:   { bpm: 92, inst: 'sine', lv: .07, mel: [7, -99, 4, -99, 2, 4, -99, -99, 9, -99, 7, -99, 4, 2, -99, -99, 0, -99, 2, 4, 7, -99, 9, -99, 7, 4, 2, -99, 0, -99, -99, -99], bass: [0, 0, 5, 5, -3, -3, 7, 7], bw: 'sine', hat: 0, chord: 1 },
};
let musicKey = 0, musicArea = 'home';
// 2026-11-08：場所の環境音（C-50）と雨の音（C-52）。ファイルは使わず、ノイズと短い音で作る。効果音の音量設定に従う
//  雨：外の区間で雨の日だけ、さあっというノイズ（屋内・電車では小さく）。海辺（deck）：ゆっくり寄せては返す波。公園：昼間ときどき小鳥。電車：ときどき小さな鈴
function ambLoop(hp, lp) { const n = AU.ctx.sampleRate * 2, b = AU.ctx.createBuffer(1, n, AU.ctx.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < n; i++) { l = l * .6 + (Math.random() * 2 - 1) * .4; d[i] = l; }
  const src = AU.ctx.createBufferSource(); src.buffer = b; src.loop = true; const f1 = AU.ctx.createBiquadFilter(); f1.type = 'highpass'; f1.frequency.value = hp; const f2 = AU.ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp;
  const g = AU.ctx.createGain(); g.gain.value = 0; src.connect(f1); f1.connect(f2); f2.connect(g); g.connect(AU.sfx || AU.master); src.start(); g.src = src; return g; }
// 鳴らすときだけ作り、静かになったら止める（ずっと回していると、音がなくても電池と CPU を使う。CI のシェア画像の試験が時間切れになった：2026-11-08）
function ambSet(A, key, v, hp, lp, now) {
  if (v > 0) { if (!A[key]) A[key] = ambLoop(hp, lp); A[key].gain.setTargetAtTime(v, now, .4); A[key + 'Q'] = 0; return; }
  const g = A[key]; if (!g) return; g.gain.setTargetAtTime(0, now, .3); A[key + 'Q'] = (A[key + 'Q'] || now) ; if (now - A[key + 'Q'] > 1.5) { try { g.src.stop(); g.disconnect(); } catch (e) { } A[key] = null; A[key + 'Q'] = 0; } }
function ambTick() {
  if (!AU.ctx || typeof G === 'undefined') return;
  if (!AU.amb) AU.amb = { rain: null, sea: null, birdT: 0, chimeT: 0 };
  const A = AU.amb; if (A.off) return; const now = AU.ctx.currentTime, play = G.mode === 'play' || G.mode === 'countdown';
  let seg = null; try { seg = play ? curSeg() : null; } catch (e) { }
  const kind = seg ? seg.th.kind : '', inside = kind === 'room' || kind === 'train';
  const rainV = play && G.weather === 'rain' ? (inside ? .012 : .045) : 0;
  const seaV = play && kind === 'deck' ? .05 * (.55 + .45 * Math.sin(now * 1.1)) : 0;   // 寄せては返す
  try { ambSet(A, 'rain', rainV, 500, 7000, now); ambSet(A, 'sea', seaV, 120, 900, now); } catch (e) { A.off = 1; return; }
  A.level = { rain: rainV, sea: seaV };
  if (!play) return;
  const park = seg && seg.th.fac && seg.th.fac.style === 'park', day = G.clock < 17 * 60 && G.weather !== 'rain';
  if (park && day && now > A.birdT) { A.birdT = now + 2.5 + Math.random() * 4; const f = 1050 + Math.random() * 200; for (let i = 0; i < 2 + (Math.random() * 2 | 0); i++) tone(f + i * 40, .08, 'sine', .015, now + i * .12, (f + i * 40) * 1.22); /* 高すぎない小鳥（1300Hz 以下から少し上がる） */ A.birds = (A.birds || 0) + 1; }
  if (kind === 'train' && now > A.chimeT) { A.chimeT = now + 9 + Math.random() * 6; bell(1046.5, .5, .02, now); bell(784, .6, .018, now + .22); A.chimes = (A.chimes || 0) + 1; }
}
function musicTick() {
  ambTick();
  if (!AU.ctx || !AU.on) return;
  const sg = SONGS[musicArea] || SONGS.commute;
  const fev = typeof G !== 'undefined' && G.fever > 0;   // フィーバー中：主旋律を1オクターブ上、テンポ +10%
  const spb = 60 / ((sg.bpm + Math.min(30, (G.speed - 10) * 1.5)) * (fev ? 1.1 : 1)) / 2;
  while (AU.nextT < AU.ctx.currentTime + .12) {
    const st = AU.step, base = 261.63 * Math.pow(2, musicKey / 12), inst = sg.inst || 'pluck';
    const m = sg.mel[st % sg.mel.length]; if (m > -50) tone(base * (fev ? 4 : 2) * Math.pow(2, m / 12), spb * (inst === 'bell' ? 2.2 : inst === 'sine' ? 1.6 : 1.4), inst, sg.lv * (inst === 'pluck' ? 1.6 : 1), AU.nextT, 0, AU.music);
    if (st % 8 === 0 || st % 8 === 4) thump(120, 48, .14, .22, AU.nextT, AU.music);   // キック
    if (sg.taiko && (st % 8 === 3 || st % 16 === 14)) thump(95, 42, .2, .26, AU.nextT, AU.music);   // お祭りの太鼓（ドン・ドドン）
    if (sg.hat && (st % 8 === 2 || st % 8 === 6)) { const n = AU.ctx.createBufferSource(); n.buffer = AU.hat; const g = AU.ctx.createGain(); g.gain.value = .07; const f = AU.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; n.connect(f); f.connect(g); g.connect(AU.music); n.start(AU.nextT); }   // 軽いスネア
    if (st % 2 === 0) tone(base / 2 * Math.pow(2, sg.bass[(st / 4 | 0) % 8] / 12), spb * 1.7, sg.bw, .15, AU.nextT, 0, AU.music);
    if (sg.chord && st % 8 === 0) for (const iv of [4, 7, 11]) tone(base * Math.pow(2, (sg.bass[(st / 4 | 0) % 8] + iv) / 12), spb * 7, 'sine', .025, AU.nextT, 0, AU.music);
    if (sg.hat && st % 2 === 1 && AU.hat) { const n = AU.ctx.createBufferSource(); n.buffer = AU.hat; const g = AU.ctx.createGain(); g.gain.value = st % 4 === 3 ? .05 : .025; n.connect(g); g.connect(AU.music); n.start(AU.nextT); }
    AU.nextT += spb; AU.step++;
  }
}
// an original little platform jingle (not any real station's melody)
function jingle() { if (!AU.ctx) return; const t0 = AU.ctx.currentTime; [0, 4, 7, 12, 7, 9, 11, 12].forEach((iv, i) => tone(523.25 * Math.pow(2, iv / 12), .22, 'sine', .07, t0 + i * .13)); }
function musicStart() { if (!AU.ctx) return; AU.on = true; AU.nextT = AU.ctx.currentTime + .05; AU.step = 0; }
function musicStop() { AU.on = false; }
function buzz(ms) { const v = OPT().vib; if (!v) return; if (v === 'low') ms = Math.max(8, Math.round(ms * .4)); try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } }
