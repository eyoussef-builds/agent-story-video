// Subtitles + talk envelope for narrated films: node scripts/make-captions.mjs
// For each voice-over clip it aligns the SCRIPT text (narration.json) to Whisper's word timestamps, so the
// captions show what was written (not Whisper's spelling) at the moment it's spoken. Writes:
//   src/captions.json  { lang: { sceneId: [{ s, e, text }] } }   (seconds from the clip start)
//   src/vo-env.json    { lang: { sceneId: [0..1 per frame] } }   (voice loudness at 30 fps, for a talking character)
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (p) => JSON.parse(readFileSync(path.join(root, p), "utf8"));
const narration = read("src/narration.json");
// A "copyFrom" clip (the cold-open teaser) has the same text and cues as the clip it copies.
narration.clips = narration.clips.map((c) => (c.copyFrom ? { ...narration.clips.find((x) => x.scene === c.copyFrom), ...c } : c));
const storyboard = read("src/storyboard.json");
const LANGS = storyboard.langs ?? ["en", "ar"];
const MAX_WORDS = Number(process.env.CAPTION_WORDS ?? 6);
const fold = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[ٱأإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ـ/g, "").replace(/[^\p{L}\p{N}]/gu, "");
const sim = (a, b) => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  let i = 0;
  while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
  return i >= 3 || (i >= 2 && Math.min(a.length, b.length) <= 3) ? 0.8 : 0;
};

const captions = {}, env = {};
for (const lang of LANGS) {
  captions[lang] = {};
  env[lang] = {};
  for (const clip of narration.clips) {
    const vo = read(`public/vo/${lang}-${clip.scene}.json`);
    const tokens = clip[lang].split(/\s+/).filter(Boolean);
    const T = tokens.map(fold), W = vo.words.map((w) => fold(w.w));
    // Needleman–Wunsch style alignment of script tokens to heard words.
    const n = T.length, m = W.length, D = Array.from({ length: n + 1 }, () => new Float64Array(m + 1)), B = Array.from({ length: n + 1 }, () => new Int8Array(m + 1));
    for (let i = 1; i <= n; i++) { D[i][0] = -0.3 * i; B[i][0] = 1; }
    for (let j = 1; j <= m; j++) { D[0][j] = -0.3 * j; B[0][j] = 2; }
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
      const opts = [D[i - 1][j - 1] + sim(T[i - 1], W[j - 1]) - 0.05, D[i - 1][j] - 0.3, D[i][j - 1] - 0.3];
      const k = opts.indexOf(Math.max(...opts));
      D[i][j] = opts[k]; B[i][j] = k;
    }
    const time = new Array(n).fill(null);
    for (let i = n, j = m; i > 0 || j > 0; ) {
      const k = B[i][j];
      if (i > 0 && j > 0 && k === 0) { time[i - 1] = vo.words[j - 1]; i--; j--; } else if (i > 0 && (j === 0 || k === 1)) i--; else j--;
    }
    // Fill gaps by interpolating between known neighbours (or the clip edges).
    const start = time.map((w) => (w ? w.s : null)), end = time.map((w) => (w ? w.e : null));
    for (let i = 0; i < n; i++) if (start[i] == null) {
      let a = i - 1; while (a >= 0 && start[a] == null) a--;
      let b = i + 1; while (b < n && start[b] == null) b++;
      const t0 = a >= 0 ? end[a] : 0, t1 = b < n ? start[b] : vo.duration;
      const span = b - a, frac = (i - a) / span;
      start[i] = t0 + (t1 - t0) * (frac - 1 / span / 2); end[i] = t0 + (t1 - t0) * frac;
    }
    // Phrases: break after punctuation or every MAX_WORDS words.
    const segs = [];
    let cur = [];
    tokens.forEach((tok, i) => {
      cur.push(i);
      if (/[،,.؟?!…؛:]$/.test(tok) || cur.length >= MAX_WORDS || i === n - 1) {
        segs.push({ s: +Math.max(0, start[cur[0]]).toFixed(2), e: +Math.min(vo.duration, end[cur[cur.length - 1]] + 0.15).toFixed(2), text: cur.map((k) => tokens[k]).join(" ") });
        cur = [];
      }
    });
    // Merge tiny fragments ("Hi," / "التعليق،") into the neighbouring phrase.
    for (let i = segs.length - 1; i > 0; i--) {
      const w = segs[i].text.split(" ").length, pw = segs[i - 1].text.split(" ").length;
      const ar = (t) => /[\u0600-\u06FF]/.test(t);
      if (w <= 2 && pw + w <= MAX_WORDS + 2 && ar(segs[i].text) === ar(segs[i - 1].text)) { segs[i - 1].text += " " + segs[i].text; segs[i - 1].e = segs[i].e; segs.splice(i, 1); }
    }
    if (segs.length > 1 && segs[0].text.split(" ").length <= 2) { segs[1].text = segs[0].text + " " + segs[1].text; segs[1].s = segs[0].s; segs.shift(); }
    captions[lang][clip.scene] = segs;
    // Script words with their spoken times — plan-timeline.mjs uses these for cue words (exact script spelling).
    writeFileSync(path.join(root, `public/vo/${lang}-${clip.scene}.aligned.json`), JSON.stringify({ duration: vo.duration, words: tokens.map((w, i) => ({ w, s: +start[i].toFixed(3), e: +end[i].toFixed(3) })) }));
    // Loudness envelope at 30 fps, normalised to the clip's 95th percentile.
    const raw = execFileSync("ffmpeg", ["-v", "error", "-i", path.join(root, `public/vo/${lang}-${clip.scene}.wav`), "-ac", "1", "-ar", "48000", "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
    const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
    const fr = 1600, rms = [];
    for (let i = 0; i < x.length; i += fr) { let s = 0; for (let k = i; k < Math.min(x.length, i + fr); k++) s += x[k] * x[k]; rms.push(Math.sqrt(s / fr)); }
    const p95 = [...rms].sort((a, b) => a - b)[Math.floor(rms.length * 0.95)] || 1;
    env[lang][clip.scene] = rms.map((v) => +Math.min(1, v / p95).toFixed(2));
    console.log(`${lang}-${clip.scene}: ${segs.length} captions, matched ${time.filter(Boolean).length}/${n} words`);
  }
}
writeFileSync(path.join(root, "src/captions.json"), JSON.stringify(captions));
writeFileSync(path.join(root, "src/vo-env.json"), JSON.stringify(env));
