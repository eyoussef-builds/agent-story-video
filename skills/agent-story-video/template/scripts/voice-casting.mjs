// Voice casting — samples + measurements so the user can choose the narrator's voice by ear, with numbers.
//   node scripts/voice-casting.mjs                 # every candidate in casting.json
//   node scripts/voice-casting.mjs --only C,D      # just some candidates (e.g. the adjustments of round 2)
//   node scripts/voice-casting.mjs --measure file.wav [...]   # measure existing audio only (no API calls)
// Needs OPENAI_API_KEY (TTS + Whisper, a few cents per round). Writes casting/<id>-<lang>.mp3 (to send to the
// user), casting/report.json and casting/report.md (the table to show next to the samples).
//
// casting.json:
// { "line": { "en": "…", "ar": "…" },          // 2–3 sentences in the narrator's real script (default: the intro clip)
//   "langs": ["ar"],                            // which languages to sample (default: storyboard.langs)
//   "style": "Voice: …",                        // base acting direction (default: narration.json style)
//   "candidates": [ { "id": "A", "voice": "marin", "style": "…extra direction…", "pitch": 0, "speed": 1.25, "clean": "" } ] }
//
// Measurements (per sample): pitch (median F0, Hz) and its range (semitones, 10–90th percentile) — how high
// and how lively the voice sounds; clarity (median harmonics-to-noise ratio, dB) and rough% (share of voiced
// frames under 9 dB) — low clarity / high rough% is what people hear as hoarse, breathy or raspy; speech rate
// (script characters per second); and Whisper's word match against the script (intelligibility).
// Raw TTS takes are cached by voice + direction in casting/.raw/, so pitch/speed/clean variants are free.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const args = process.argv.slice(2);
const read = (p) => JSON.parse(readFileSync(path.join(root, p), "utf8"));

// ---------- acoustic measurements ----------
const SR = 16000;
function decode(file) {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
}
const pct = (arr, q) => {
  if (!arr.length) return NaN;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.round(q * (s.length - 1))))];
};
export function measure(file) {
  const x = decode(file);
  const win = Math.round(0.04 * SR), hop = Math.round(0.01 * SR);
  const minLag = Math.floor(SR / 600), maxLag = Math.ceil(SR / 70);
  let peak = 0;
  for (const v of x) peak = Math.max(peak, Math.abs(v));
  const f0 = [], hnr = [];
  let speech = 0;
  for (let i = 0; i + win + maxLag < x.length; i += hop) {
    let e = 0;
    for (let n = 0; n < win; n++) e += x[i + n] * x[i + n];
    const rms = Math.sqrt(e / win);
    if (rms < peak * 0.04) continue; // silence
    speech++;
    let best = 0, lag = 0;
    const r = new Float64Array(maxLag + 2);
    for (let t = minLag; t <= maxLag + 1; t++) {
      let num = 0, e2 = 0;
      for (let n = 0; n < win; n++) { num += x[i + n] * x[i + n + t]; e2 += x[i + n + t] * x[i + n + t]; }
      r[t] = num / Math.sqrt(e * e2 + 1e-12);
    }
    for (let t = minLag + 1; t <= maxLag; t++) if (r[t] > best && r[t] >= r[t - 1] && r[t] >= r[t + 1]) { best = r[t]; lag = t; }
    if (best < 0.45 || !lag) continue; // unvoiced
    const a = r[lag - 1], b = r[lag], c = r[lag + 1];
    const shift = (a - c) / (2 * (a - 2 * b + c) || 1);
    f0.push(SR / (lag + shift));
    const rr = Math.min(0.9999, best);
    hnr.push(10 * Math.log10(rr / (1 - rr)));
  }
  const med = pct(f0, 0.5);
  return {
    seconds: +(x.length / SR).toFixed(2),
    pitchHz: Math.round(med),
    rangeSt: +(12 * Math.log2(pct(f0, 0.9) / pct(f0, 0.1))).toFixed(1),
    clarityDb: +pct(hnr, 0.5).toFixed(1),
    roughPct: Math.round((100 * hnr.filter((h) => h < 9).length) / Math.max(1, hnr.length)),
    voicedPct: Math.round((100 * f0.length) / Math.max(1, speech)),
  };
}

if (args[0] === "--measure") {
  for (const f of args.slice(1)) console.log(path.basename(f), JSON.stringify(measure(path.resolve(f))));
  process.exit(0);
}

// ---------- casting round ----------
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
const auth = { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` };
const cfgFile = path.join(root, "casting.json");
if (!existsSync(cfgFile)) throw new Error("casting.json missing — see the header of this script and references/voice-casting.md");
const cfg = JSON.parse(readFileSync(cfgFile, "utf8"));
const narration = read("src/narration.json");
const storyboard = read("src/storyboard.json");
const langs = cfg.langs ?? storyboard.langs ?? ["en", "ar"];
const intro = narration.clips.find((c) => !c.copyFrom && c.scene !== "bridge") ?? narration.clips[0];
const line = (lang) => cfg.line?.[lang] ?? intro[lang];
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;
const LANG_STYLE = {
  en: "Speak clear, natural American English.",
  ar: "Speak natural, modern Egyptian Arabic with a clear Cairo accent, not formal Modern Standard Arabic. Pronounce English product names in English.",
};
const dir = path.join(root, "casting"), rawDir = path.join(dir, ".raw");
mkdirSync(rawDir, { recursive: true });

const fold = (w) => w.toLowerCase().normalize("NFKD").replace(/[ٱأإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[^\p{L}\p{N}]/gu, "");
const rows = existsSync(path.join(dir, "report.json")) ? JSON.parse(readFileSync(path.join(dir, "report.json"), "utf8")) : [];
for (const cand of cfg.candidates) {
  if (only && !only.includes(cand.id)) continue;
  for (const lang of langs) {
    const text = line(lang);
    const instructions = [cand.replaceStyle ?? cfg.style ?? narration.style, cand.style, narration.pronounce, LANG_STYLE[lang]].filter(Boolean).join(" ");
    const key = createHash("sha1").update(JSON.stringify([cand.voice, instructions, text, narration.model])).digest("hex").slice(0, 12);
    const raw = path.join(rawDir, `${cand.voice}-${lang}-${key}.wav`);
    if (!existsSync(raw)) {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ model: narration.model ?? "gpt-4o-mini-tts", voice: cand.voice, input: text, instructions, response_format: "wav" }),
      });
      if (!res.ok) throw new Error(`TTS ${cand.id} HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
      writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
    }
    // Same chain as make-voiceover.mjs: pitch lift (semitones) + speed, optional clean-up, trim, loudness.
    const speed = cand.speed ?? narration.speed ?? 1.25, semis = cand.pitch ?? 0, k = 2 ** (semis / 12);
    const chain = [semis ? `asetrate=${Math.round(24000 * k)},aresample=48000,atempo=${(speed / k).toFixed(4)}` : `atempo=${speed}`, cand.clean, "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=7"].filter(Boolean).join(",");
    const wav = path.join(rawDir, `${cand.id}-${lang}.wav`), mp3 = path.join(dir, `${cand.id}-${cand.voice}${semis ? `-pitch${semis > 0 ? "+" : ""}${semis}` : ""}-${lang}.mp3`);
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-af", chain, "-ar", "48000", "-ac", "1", wav]);
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", wav, "-b:a", "192k", mp3]);
    const m = measure(wav);
    const form = new FormData();
    form.append("file", new Blob([readFileSync(wav)], { type: "audio/wav" }), path.basename(wav));
    form.append("model", "whisper-1");
    form.append("language", lang);
    const tr = await (await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: auth, body: form })).json();
    const heard = (tr.text ?? "").split(/\s+/).map(fold);
    const said = text.split(/\s+/).map(fold).filter((w) => w.length > 2);
    const match = Math.round((100 * said.filter((w) => heard.some((h) => h.startsWith(w.slice(0, 3)))).length) / Math.max(1, said.length));
    const row = { id: cand.id, lang, voice: cand.voice, pitch: semis, speed, clean: cand.clean ?? "", file: path.relative(root, mp3), ...m, charsPerSec: +(text.replace(/\s+/g, "").length / m.seconds).toFixed(1), wordMatchPct: match, heard: tr.text };
    const i = rows.findIndex((r) => r.id === row.id && r.lang === lang);
    if (i >= 0) rows[i] = row; else rows.push(row);
    console.log(`${cand.id} ${lang} ${cand.voice}${semis ? ` ${semis > 0 ? "+" : ""}${semis}st` : ""} ×${speed}: pitch ${m.pitchHz} Hz, range ${m.rangeSt} st, clarity ${m.clarityDb} dB, rough ${m.roughPct}%, ${row.charsPerSec} chars/s, words ${match}%  → ${row.file}`);
  }
}
writeFileSync(path.join(dir, "report.json"), JSON.stringify(rows, null, 1));
const md = [
  "| Sample | Voice | Pitch lift | Speed | Pitch (Hz) | Range (st) | Clarity (dB) | Rough % | Chars/s | Words heard |",
  "|---|---|---|---|---|---|---|---|---|---|",
  ...rows.map((r) => `| ${r.id}-${r.lang} | ${r.voice} | ${r.pitch ? `${r.pitch > 0 ? "+" : ""}${r.pitch} st` : "—"} | ×${r.speed} | ${r.pitchHz} | ${r.rangeSt} | ${r.clarityDb} | ${r.roughPct} | ${r.charsPerSec} | ${r.wordMatchPct}% |`),
  "",
  "Higher clarity and lower rough % = cleaner (less hoarse/breathy). Pitch: ~100–150 Hz deep adult, ~170–230 Hz light adult, ~250–350 Hz child-like.",
].join("\n");
writeFileSync(path.join(dir, "report.md"), md);
console.log(`\n${md}\n\nreport: casting/report.md`);
