// Voice-over: node scripts/make-voiceover.mjs [en|ar ...] [--only sceneId,sceneId]   (needs OPENAI_API_KEY)
// Each narration clip → OpenAI TTS (narration.json voice) → sped up (narration.json speed) → trimmed and
// loudness-normalised WAV in public/vo/<lang>-<scene>.wav, plus Whisper word timestamps in
// public/vo/<lang>-<scene>.json so plan-timeline.mjs can cue the picture to spoken words.
// A clip with "copyFrom": "<sceneId>" (the cold-open teaser) reuses that clip's take instead of a new TTS call.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const narration = JSON.parse(readFileSync(path.join(root, "src/narration.json"), "utf8"));
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;
const storyboard = JSON.parse(readFileSync(path.join(root, "src/storyboard.json"), "utf8"));
const langs = args.filter((a, i) => ["en", "ar"].includes(a) && args[i - 1] !== "--only");
if (!langs.length) langs.push(...(storyboard.langs ?? ["en", "ar"]));
const outDir = path.join(root, "public/vo");
const tmpDir = path.join(root, "out/.vo-raw");
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
const auth = { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` };

// Speed, plus an optional character pitch lift in semitones (narration.json "pitch"; raises pitch and formants,
// e.g. 6 for a kid-like voice) and an optional ffmpeg clean-up chain ("clean", e.g. breath-noise reduction).
// OpenAI TTS WAV is 24 kHz mono.
const k = 2 ** ((narration.pitch ?? 0) / 12);
const tempoChain = [
  narration.pitch ? `asetrate=${Math.round(24000 * k)},aresample=48000,atempo=${(narration.speed / k).toFixed(4)}` : `atempo=${narration.speed}`,
  narration.clean,
].filter(Boolean).join(",");

const LANG_STYLE = {
  en: "Speak clear, natural American English.",
  ar: "Speak natural, modern Egyptian Arabic with a clear Cairo accent, not formal Modern Standard Arabic. Pronounce English product names in English.",
};

async function tts(text, lang, file) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: narration.model ?? "gpt-4o-mini-tts",
      voice: narration.voice,
      input: text,
      instructions: `${narration.style} ${narration.pronounce ?? ""} ${LANG_STYLE[lang]}`,
      response_format: "wav",
    }),
  });
  if (!res.ok) throw new Error(`TTS HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

async function words(file, lang) {
  const form = new FormData();
  form.append("file", new Blob([readFileSync(file)], { type: "audio/wav" }), path.basename(file));
  form.append("model", "whisper-1");
  form.append("language", lang);
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "word");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: auth, body: form });
  if (!res.ok) throw new Error(`Whisper HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

for (const lang of langs) {
  // Copies last, after the clips they copy from.
  const clips = [...narration.clips.filter((c) => !c.copyFrom), ...narration.clips.filter((c) => c.copyFrom)];
  for (const clip of clips) {
    if (only && !only.includes(clip.scene) && !(clip.copyFrom && only.includes(clip.copyFrom))) continue;
    if (clip.copyFrom) {
      for (const ext of ["wav", "json"]) copyFileSync(path.join(outDir, `${lang}-${clip.copyFrom}.${ext}`), path.join(outDir, `${lang}-${clip.scene}.${ext}`));
      console.log(`${lang}-${clip.scene}: copied from ${lang}-${clip.copyFrom}`);
      continue;
    }
    const raw = path.join(tmpDir, `${lang}-${clip.scene}.wav`);
    const out = path.join(outDir, `${lang}-${clip.scene}.wav`);
    // Keep the previous take (out/.vo-prev/) so a regenerated clip can be compared or restored.
    if (existsSync(out)) {
      mkdirSync(path.join(root, "out/.vo-prev"), { recursive: true });
      const stamp = Date.now();
      copyFileSync(out, path.join(root, `out/.vo-prev/${lang}-${clip.scene}-${stamp}.wav`));
      const words = out.replace(/\.wav$/, ".json");
      if (existsSync(words)) copyFileSync(words, path.join(root, `out/.vo-prev/${lang}-${clip.scene}-${stamp}.json`));
    }
    await tts(clip[lang], lang, raw);
    execFileSync("ffmpeg", [
      "-v", "error", "-y", "-i", raw,
      "-af", `${tempoChain},silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=7`,
      "-ar", "48000", "-ac", "1", out,
    ]);
    const duration = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out]).toString().trim();
    const tr = await words(out, lang);
    writeFileSync(
      path.join(outDir, `${lang}-${clip.scene}.json`),
      JSON.stringify({ scene: clip.scene, lang, duration, text: tr.text, words: (tr.words || []).map((w) => ({ w: w.word, s: +w.start.toFixed(3), e: +w.end.toFixed(3) })) }, null, 1),
    );
    // TTS sometimes drops a short final sentence; flag script words missing from the transcript.
    const fold = (w) => w.toLowerCase().normalize("NFKD").replace(/[ٱأإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[^\p{L}\p{N}]/gu, "");
    const heard = (tr.words || []).map((w) => fold(w.word));
    const said = clip[lang].split(/\s+/).map(fold).filter((w) => w.length > 2);
    const missing = said.filter((w) => !heard.some((h) => h.startsWith(w.slice(0, 3)) || w.startsWith(h.slice(0, 3))));
    const tail = said.slice(-2).filter((w) => missing.includes(w));
    console.log(`${lang}-${clip.scene}: ${duration.toFixed(2)}s  "${tr.text}"`);
    if (tail.length || missing.length > Math.max(1, said.length * 0.25))
      console.log(`  ⚠ possibly not spoken: ${missing.join(" ")} — listen/regenerate; join a short closing fragment to the sentence before it`);
  }
}
