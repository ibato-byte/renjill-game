/* ================= sound (synthesized, no files) ================= */
const AU = { ctx: null, master: null, music: null, nextT: 0, step: 0, on: false };
function audioInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    AU.ctx = new AC(); AU.master = AU.ctx.createGain(); AU.master.gain.value = SV.mute ? 0 : .6; AU.master.connect(AU.ctx.destination);
    AU.music = AU.ctx.createGain(); AU.music.gain.value = OPT().music ? .32 : 0; AU.music.connect(AU.master);
    AU.sfx = AU.ctx.createGain(); AU.sfx.gain.value = OPT().sfx ? 1 : 0; AU.sfx.connect(AU.master);
    const nb = AU.ctx.createBuffer(1, 800, AU.ctx.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < 800; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / 800); AU.hat = nb;
  } catch (e) { AU.ctx = null; }
}
function setMute(m) { SV.mute = m; save(); if (AU.master) AU.master.gain.value = m ? 0 : .6; }
function applyAudioOpt() { if (!AU.ctx) return; AU.music.gain.value = OPT().music ? .32 : 0; AU.sfx.gain.value = OPT().sfx ? 1 : 0; }
function tone(freq, dur, type, vol, when, slide, dest) {
  if (!AU.ctx) return; const t = when || AU.ctx.currentTime;
  const o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
  o.type = type || 'square'; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .2, t + .008); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  o.connect(g); g.connect(dest || AU.sfx || AU.master); o.start(t); o.stop(t + dur + .02);
}
function noise(dur, vol, hp) {
  if (!AU.ctx) return; const t = AU.ctx.currentTime, n = Math.floor(AU.ctx.sampleRate * dur);
  const buf = AU.ctx.createBuffer(1, n, AU.ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = AU.ctx.createBufferSource(); src.buffer = buf; const f = AU.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 800;
  const g = AU.ctx.createGain(); g.gain.value = vol || .2; src.connect(f); f.connect(g); g.connect(AU.sfx || AU.master); src.start(t);
}
const SFX = {
  hay(n) { tone(880 * Math.pow(1.0595, Math.min(n, 12)), .07, 'square', .07); },
  food() { tone(660, .06, 'triangle', .14); tone(990, .09, 'triangle', .12, AU.ctx && AU.ctx.currentTime + .05); },
  treat() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, .1, 'triangle', .13, AU.ctx && AU.ctx.currentTime + i * .05)); },
  power() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .12, 'square', .09, AU.ctx && AU.ctx.currentTime + i * .045)); },
  jump() { tone(320, .16, 'sine', .14, 0, 640); },
  slide() { noise(.18, .12, 1200); },
  turn() { tone(1047, .06, 'square', .08); tone(1319, .08, 'square', .08, AU.ctx && AU.ctx.currentTime + .06); },
  bump() { tone(180, .18, 'square', .18, 0, 90); noise(.12, .15, 300); },
  bad() { tone(392, .14, 'sawtooth', .1, 0, 196); tone(311, .2, 'sawtooth', .1, AU.ctx && AU.ctx.currentTime + .14, 150); },
  crash() { noise(.45, .3, 200); tone(220, .5, 'sawtooth', .16, 0, 55); },
  rumble() { if (!AU.ctx) return; const t0 = AU.ctx.currentTime; for (let i = 0; i < 6; i++) { tone(55 + (i % 2) * 8, .22, 'sawtooth', .07, t0 + i * .16); } noise(1.0, .08, 120); },
  roar() { if (!AU.ctx) return; tone(70, 1.1, 'sawtooth', .09, 0, 160); tone(140, .9, 'square', .03, 0, 320); },
  ui() { tone(740, .05, 'triangle', .1); },
  mission() { [659, 784, 1047, 1319].forEach((f, i) => tone(f, .16, 'triangle', .14, AU.ctx && AU.ctx.currentTime + i * .09)); },
  chime() { // the classic school/office chime
    if (!AU.ctx) return; const t = AU.ctx.currentTime; const N = [659, 523, 587, 392, 392, 587, 659, 523];
    N.forEach((f, i) => { tone(f, 1.1, 'sine', .22, t + i * .5); tone(f * 2, .6, 'sine', .05, t + i * .5); });
  },
};
// one little original theme per part of the day (melody in semitones, -99 = rest)
const SONGS = {
  home:    { bpm: 104, lead: 'triangle', lv: .07, mel: [0, 4, 7, 4, 9, 7, 4, -99, 2, 5, 9, 5, 7, -99, 4, 2, 0, 4, 7, 12, 11, 9, 7, -99, 5, 4, 2, 4, 0, -99, -99, -99], bass: [0, 0, 5, 5, 7, 7, 0, 0], bw: 'sine', hat: 0 },
  commute: { bpm: 132, lead: 'square', lv: .05, mel: [0, 4, 7, 9, 7, 4, 2, 4, 0, 4, 7, 12, 9, 7, 4, 2, 0, 2, 4, 7, 9, 12, 9, 7, 5, 4, 2, 4, 2, 0, -1, -3], bass: [0, 0, 7, 7, 5, 5, 7, 7], bw: 'triangle', hat: 1 },
  office:  { bpm: 118, lead: 'square', lv: .04, mel: [7, -99, 7, 9, 7, 4, -99, 2, 4, -99, 4, 5, 4, 0, -99, -99, 2, -99, 2, 4, 2, -1, -99, 0, 2, 4, 7, 4, 2, 0, -99, -99], bass: [0, 4, 5, 7, 9, 7, 5, 4], bw: 'triangle', hat: 1 },
  evening: { bpm: 112, lead: 'triangle', lv: .07, mel: [11, 9, 7, 4, 7, -99, 9, 11, 12, 11, 9, 7, 9, -99, -99, 4, 7, 9, 11, 14, 12, 11, 9, 7, 4, 2, 4, 7, -99, -99, -99, -99], bass: [0, 0, -3, -3, 5, 5, 7, 7], bw: 'sine', hat: 1, chord: 1 },
  night:   { bpm: 92, lead: 'sine', lv: .08, mel: [7, -99, 4, -99, 2, 4, -99, -99, 9, -99, 7, -99, 4, 2, -99, -99, 0, -99, 2, 4, 7, -99, 9, -99, 7, 4, 2, -99, 0, -99, -99, -99], bass: [0, 0, 5, 5, -3, -3, 7, 7], bw: 'sine', hat: 0, chord: 1 },
};
let musicKey = 0, musicArea = 'home';
function musicTick() {
  if (!AU.ctx || !AU.on) return;
  const sg = SONGS[musicArea] || SONGS.commute;
  const spb = 60 / (sg.bpm + Math.min(30, (G.speed - 10) * 1.5)) / 2;
  while (AU.nextT < AU.ctx.currentTime + .12) {
    const st = AU.step, base = 261.63 * Math.pow(2, musicKey / 12);
    const m = sg.mel[st % sg.mel.length]; if (m > -50) tone(base * 2 * Math.pow(2, m / 12), spb * (sg.lead === 'square' ? .8 : 1.4), sg.lead, sg.lv, AU.nextT, 0, AU.music);
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
function buzz(ms) { if (!OPT().vib) return; try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } }
