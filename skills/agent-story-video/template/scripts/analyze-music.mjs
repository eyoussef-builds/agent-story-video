// Beat and energy analysis: node scripts/analyze-music.mjs <file.mp3> [--json out.json]
// Prints tempo, beat grid, onset strength and an energy curve so music can be matched to picture.
// "punch" per bar is the onset strength: it shows the intro, the build, breaks (dips) and the drop (big jump).
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const file = process.argv[2];
const jsonOut = process.argv.includes("--json") ? process.argv[process.argv.indexOf("--json") + 1] : null;
const SR = 22050;
const raw = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
const dur = x.length / SR;

// FFT (radix-2, in place)
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < len / 2; k++) {
        const c = Math.cos(ang * k), s = Math.sin(ang * k);
        const ar = re[i + k + len / 2] * c - im[i + k + len / 2] * s;
        const ai = re[i + k + len / 2] * s + im[i + k + len / 2] * c;
        re[i + k + len / 2] = re[i + k] - ar; im[i + k + len / 2] = im[i + k] - ai;
        re[i + k] += ar; im[i + k] += ai;
      }
    }
  }
}

const N = 1024, HOP = 256, hopT = HOP / SR;
const frames = Math.floor((x.length - N) / HOP);
const win = Float32Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N));
let prev = new Float32Array(N / 2);
const flux = new Float32Array(frames), low = new Float32Array(frames), rms = new Float32Array(frames), bright = new Float32Array(frames);
for (let f = 0; f < frames; f++) {
  const re = new Float64Array(N), im = new Float64Array(N);
  let e = 0;
  for (let i = 0; i < N; i++) { const v = x[f * HOP + i]; re[i] = v * win[i]; e += v * v; }
  rms[f] = Math.sqrt(e / N);
  fft(re, im);
  let fl = 0, lo = 0, tot = 0, hi = 0;
  const mag = new Float32Array(N / 2);
  for (let k = 1; k < N / 2; k++) {
    mag[k] = Math.log1p(100 * Math.hypot(re[k], im[k]));
    const d = mag[k] - prev[k];
    if (d > 0) fl += d;
    const hz = (k * SR) / N;
    if (hz < 150) lo += mag[k];
    if (hz > 3000) hi += mag[k];
    tot += mag[k];
  }
  flux[f] = fl; low[f] = lo; bright[f] = tot ? hi / tot : 0; prev = mag;
}
// Normalised onset envelope
const mean = flux.reduce((a, b) => a + b, 0) / frames;
const onset = flux.map((v) => Math.max(0, v - mean));

// Tempo via autocorrelation, preferring 90–150 BPM
let best = { bpm: 0, score: -1 };
for (let bpm = 70; bpm <= 180; bpm += 0.25) {
  const lag = 60 / bpm / hopT;
  let s = 0;
  for (let f = 0; f + Math.ceil(lag * 4) < frames; f++) {
    const a = onset[f];
    for (const m of [1, 2, 4]) {
      const g = f + lag * m, i0 = Math.floor(g), t = g - i0;
      s += a * (onset[i0] * (1 - t) + onset[i0 + 1] * t) / m;
    }
  }
  const w = Math.exp(-0.5 * Math.pow(Math.log2(bpm / 120) / 0.6, 2));
  if (s * w > best.score) best = { bpm, score: s * w };
}
const period = 60 / best.bpm;
// Beat phase: maximise onset energy on the grid
let phase = 0, pBest = -1;
for (let ph = 0; ph < period; ph += hopT / 2) {
  let s = 0;
  for (let t = ph; t < dur; t += period) { const i = Math.round(t / hopT); if (i < frames) s += onset[i]; }
  if (s > pBest) { pBest = s; phase = ph; }
}
// Downbeat: which beat of 4 carries the most low-end energy
const beatTimes = [];
for (let t = phase; t < dur; t += period) beatTimes.push(t);
const lowAt = (t) => { const i = Math.round(t / hopT); let s = 0; for (let k = -2; k <= 2; k++) s += low[i + k] || 0; return s; };
const onsetAt = (t) => onset[Math.round(t / hopT)] || 0;
const acc = [0, 0, 0, 0];
beatTimes.forEach((t, i) => (acc[i % 4] += lowAt(t) + onsetAt(t) * 3));
const down = acc.indexOf(Math.max(...acc));
const downbeats = beatTimes.filter((_, i) => i % 4 === down);

// Grid fit quality: share of onset energy within ±50 ms of a beat
let on = 0, all = 0;
for (let f = 0; f < frames; f++) {
  const t = f * hopT; const d = Math.abs(((t - phase + period / 2) % period) - period / 2);
  all += onset[f]; if (d < 0.05) on += onset[f];
}
// Energy per bar (dB) and brightness
const bars = downbeats.map((t0, i) => {
  const t1 = downbeats[i + 1] ?? Math.min(dur, t0 + period * 4);
  const a = Math.floor(t0 / hopT), b = Math.min(frames, Math.floor(t1 / hopT));
  let e = 0, br = 0, fl = 0;
  for (let f = a; f < b; f++) { e += rms[f] * rms[f]; br += bright[f]; fl += onset[f]; }
  const n = Math.max(1, b - a);
  return { t: +t0.toFixed(2), db: +(10 * Math.log10(e / n + 1e-12)).toFixed(1), bright: +(br / n).toFixed(3), punch: +(fl / n).toFixed(1) };
});
const blocks = " ▁▂▃▄▅▆▇█";
const dbs = bars.map((b) => b.db), lo = Math.min(...dbs), hi = Math.max(...dbs);
const spark = bars.map((b) => blocks[Math.round(((b.db - lo) / Math.max(1e-6, hi - lo)) * 8)]).join("");
const punchSpark = (() => { const ps = bars.map((b) => b.punch), a = Math.min(...ps), z = Math.max(...ps); return bars.map((b) => blocks[Math.round(((b.punch - a) / Math.max(1e-6, z - a)) * 8)]).join(""); })();
console.log(`${file.split("/").pop()}: ${dur.toFixed(1)}s, ${best.bpm} BPM, bar ${(period * 4).toFixed(2)}s, first downbeat ${downbeats[0]?.toFixed(2)}s, on-grid ${(on / all * 100).toFixed(0)}%`);
console.log(`  energy per bar: ${spark}`);
console.log(`  punch  per bar: ${punchSpark}`);
console.log(`  bar starts (s): ${bars.map((b) => b.t).join(" ")}`);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ file, duration: dur, bpm: best.bpm, period, phase, beats: beatTimes, downbeats, bars }, null, 1));
