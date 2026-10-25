// Builds src/plan.json — the cut list every scene and sound is placed on.
//   node scripts/plan-timeline.mjs                 # real plan: needs music/analysis.json + public/vo/*.json
//   node scripts/plan-timeline.mjs --preview       # silent visual preview before audio exists (120 BPM grid, estimated VO)
//   node scripts/plan-timeline.mjs --music music/candidates/2-x.json   # try a candidate track without copying it
//
// Rules: each scene lands (fully on screen) on a downbeat; scene length = whole bars sized to fit the longest
// voice-over of the two languages; the scene marked "onDrop" lands on the track's biggest drop (the music start
// is shifted / earlier scenes padded to make that happen); the film ends on the track's wind-down when it can.
// Cold open: scenes marked "prologue" (at the start, e.g. a teaser of the ending + a rewind bridge) sit before
// the story; the track starts fresh when the first story scene lands, and a prologue scene with
// "musicFrom": "<sceneId>" plays over the same bars of the track as that later scene does.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const preview = process.argv.includes("--preview");
const musicArg = process.argv.includes("--music") ? process.argv[process.argv.indexOf("--music") + 1] : "music/analysis.json";
const read = (p) => JSON.parse(readFileSync(path.join(root, p), "utf8"));
const storyboard = read("src/storyboard.json");
const narration = read("src/narration.json");
// A "copyFrom" clip (the cold-open teaser) has the same text and cues as the clip it copies.
narration.clips = narration.clips.map((c) => (c.copyFrom ? { ...narration.clips.find((x) => x.scene === c.copyFrom), ...c } : c));
// Languages to plan for (storyboard.langs, default English + Arabic); the longest clip per scene sets its length.
const LANGS = storyboard.langs ?? ["en", "ar"];
const FPS = 30;
const notes = [];

// ---------- music grid ----------
let music = null;
if (!preview) {
  if (!existsSync(path.join(root, musicArg))) throw new Error(`${musicArg} missing — run analyze-music.mjs with --json music/analysis.json (or use --preview)`);
  music = read(musicArg);
}
const bpm = music ? music.bpm : 120;
const BEAT = 60 / bpm;
const BAR = BEAT * 4;
const TRANSITION = Math.max(12, Math.min(18, Math.round(BEAT * FPS)));
const punch = music ? music.bars.map((b) => b.punch) : [];
const maxPunch = Math.max(1e-6, ...punch);
const punchN = punch.map((v) => v / maxPunch);

// ---------- voice-over lengths ----------
const clipFor = (sceneId) => narration.clips.find((c) => c.scene === sceneId);
const missingVo = new Set();
const voInfo = (lang, sceneId) => {
  // Prefer the script-aligned words from make-captions.mjs (exact script spelling), else Whisper's words.
  const aligned = path.join(root, `public/vo/${lang}-${sceneId}.aligned.json`);
  if (!preview && existsSync(aligned)) return JSON.parse(readFileSync(aligned, "utf8"));
  const file = path.join(root, `public/vo/${lang}-${sceneId}.json`);
  if (!preview && existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  const clip = clipFor(sceneId);
  if (!clip) return null;
  if (!preview) missingVo.add(`${lang}-${sceneId}`);
  // Estimates for Marin at 1.35×: English ≈ 17 chars/s, Arabic ≈ 13 chars/s (measured on real takes).
  const text = clip[lang];
  const duration = text.length / (lang === "ar" ? 13 : 17);
  const ws = text.split(/\s+/).filter(Boolean);
  return { duration, words: ws.map((w, i) => ({ w, s: (i / ws.length) * duration, e: ((i + 1) / ws.length) * duration })) };
};

// ---------- scene lengths in bars ----------
const scenes = storyboard.scenes.map((s) => {
  const vo = Math.max(0, ...LANGS.map((l) => voInfo(l, s.id)?.duration ?? 0));
  const need = Math.max(s.minSeconds, s.voDelay + vo + TRANSITION / FPS + 0.15);
  return { ...s, vo, need, bars: Math.max(1, Math.ceil(need / BAR - 0.08)) };
});

// ---------- align the drop ----------
let offsetBars = 0;
let drop = null;
const P = scenes.findIndex((s) => !s.prologue); // first story scene
const proBars = () => scenes.slice(0, P).reduce((a, s) => a + s.bars, 0);
const dropIdx = scenes.findIndex((s) => s.onDrop);
if (music && dropIdx > P) {
  const n = punch.length;
  const candidates = [];
  for (let d = 2; d < n - 2; d++) {
    const before = (punchN[d - 1] + punchN[d - 2]) / 2;
    const after = (punchN[d] + punchN[d + 1]) / 2;
    if (punchN[d] >= 0.7) candidates.push({ d, rise: after - before });
  }
  candidates.sort((a, b) => b.rise - a.rise);
  const before = scenes.slice(P, dropIdx).reduce((a, s) => a + s.bars, 0);
  // The music may start later (skipping intro bars) — but only on a 4-bar phrase boundary so it enters
  // musically; the remaining 0–3 bars are padded into the tightest pre-drop scenes.
  const fit = candidates.find((c) => c.rise > 0.2 && c.d >= before && c.d - before <= 27);
  if (fit) {
    const gap = fit.d - before;
    offsetBars = gap - (gap % 4);
    let pad = gap - offsetBars;
    const order = scenes
      .slice(P, dropIdx)
      .map((s, i) => ({ i: P + i, slack: s.bars * BAR - s.need }))
      .sort((a, b) => a.slack - b.slack);
    for (let k = 0; pad > 0; k = (k + 1) % order.length, pad--) scenes[order[k].i].bars += 1;
    drop = { sceneId: scenes[dropIdx].id, trackBar: fit.d, trackTime: music.bars[fit.d].t };
    notes.push(`drop at track bar ${fit.d} (${music.bars[fit.d].t}s, rise ${fit.rise.toFixed(2)}) → "${scenes[dropIdx].id}" lands on it; music starts at bar ${offsetBars}${gap - offsetBars ? `, ${gap - offsetBars} bar(s) padded before it` : ""}`);
  } else {
    notes.push(`no usable drop after bar ${before}: "${scenes[dropIdx].id}" not drop-aligned (pick a track whose drop comes later, or shorten earlier scenes)`);
  }
}

// ---------- ending ----------
let totalBars = scenes.reduce((a, s) => a + s.bars, 0);
if (music) {
  const available = punch.length - offsetBars;
  let wind = punch.length;
  for (let i = punch.length - 1; i >= 0; i--) if (punchN[i] >= 0.5) { wind = i + 1; break; }
  const windVideo = wind - offsetBars + proBars(); // first quiet bar, in video bars
  // Let the end card ride the track's wind-down, but never hold it more than 2 extra bars.
  if (windVideo >= totalBars && windVideo + 1 - totalBars <= 2) {
    scenes[scenes.length - 1].bars += windVideo + 1 - totalBars;
    notes.push(`end card stretched ${windVideo + 1 - totalBars} bar(s) to ride the track's wind-down`);
    totalBars = windVideo + 1;
  } else if (windVideo > totalBars) {
    notes.push(`the track is still at full energy when the film ends (wind-down ${windVideo - totalBars} bars later) — it fades over 1.5 s; fine, but a track whose wind-down lands within 2 bars of the end feels more finished`);
  }
  if (totalBars - proBars() > available) notes.push(`⚠ track is ${available} bars after the offset but the film needs ${totalBars}: pick a longer track`);
}

// ---------- frames ----------
const frameOfBar = (b) => Math.round(b * BAR * FPS);
let acc = 0;
const landedAt = scenes.map((s) => { const f = frameOfBar(acc); acc += s.bars; return f; });
const total = frameOfBar(totalBars);
const from = landedAt.map((f, i) => (i === 0 ? 0 : f - TRANSITION));
const planScenes = scenes.map((s, i) => ({
  id: s.id,
  type: s.type,
  bars: s.bars,
  from: from[i],
  duration: i < scenes.length - 1 ? from[i + 1] - from[i] + TRANSITION : total - from[i],
  landed: landedAt[i] - from[i],
}));

// Track bar under each video bar: story bars follow the offset; a prologue scene with musicFrom borrows
// that scene's bars; other prologue bars (the bridge) have no music.
const startBar = (id) => scenes.slice(0, scenes.findIndex((s) => s.id === id)).reduce((a, s) => a + s.bars, 0);
const trackBarAt = (vb) => {
  if (vb >= proBars()) return offsetBars + vb - proBars();
  let acc2 = 0;
  for (const s of scenes.slice(0, P)) {
    if (vb < acc2 + s.bars) return s.musicFrom ? offsetBars + startBar(s.musicFrom) - proBars() + (vb - acc2) : -1;
    acc2 += s.bars;
  }
  return -1;
};
const prologueMusic = [];
if (music) {
  let acc2 = 0;
  for (const s of scenes.slice(0, P)) {
    if (s.musicFrom) {
      const tb = offsetBars + startBar(s.musicFrom) - proBars();
      prologueMusic.push({ scene: s.id, from: frameOfBar(acc2), frames: frameOfBar(acc2 + s.bars) - frameOfBar(acc2), offsetSeconds: +music.bars[tb].t.toFixed(3) });
      notes.push(`prologue "${s.id}" plays over track bars ${tb}–${tb + s.bars - 1} (the music under "${s.musicFrom}")`);
    }
    acc2 += s.bars;
  }
}
const beats = [];
if (music) {
  for (let b = 0; b * BEAT * FPS < total; b++) {
    const bar = trackBarAt(Math.floor(b / 4));
    beats.push({ f: Math.round(b * BEAT * FPS), k: +((punchN[bar] ?? 0) * (b % 4 === 0 ? 1 : 0.55)).toFixed(3) });
  }
}

// ---------- voice-over placement + cue words ----------
// Whisper is inconsistent with Arabic hamza/alef forms (أي vs اي), ta marbuta, alef maqsura and diacritics: fold them.
const norm = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[ٱأإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ـ/g, "").replace(/[^\p{L}\p{N}]/gu, "");
const langs = {};
for (const lang of LANGS) {
  const vo = [];
  const cues = {};
  scenes.forEach((s, i) => {
    const clip = clipFor(s.id);
    cues[s.id] = {};
    if (!clip) return;
    const info = voInfo(lang, s.id);
    const start = landedAt[i] + Math.round(s.voDelay * FPS);
    const local = start - from[i];
    cues[s.id].vo = local;
    cues[s.id].voEnd = local + Math.round(info.duration * FPS);
    if (!preview) vo.push({ scene: s.id, from: start, frames: Math.ceil(info.duration * FPS) + 2, src: `vo/${lang}-${s.id}.wav` });
    let at = 0;
    for (const [name, words] of Object.entries(clip.cues ?? {})) {
      // "claude|cloud|كلود": alternative prefixes — Whisper spells names in either script or mishears them.
      const keys = words[lang === "ar" ? 1 : 0].split("|").map(norm);
      const key = keys.join("|");
      const idx = info.words.findIndex((w, j) => j >= at && keys.some((k) => norm(w.w).startsWith(k)));
      if (idx >= 0) {
        cues[s.id][name] = local + Math.round(info.words[idx].s * FPS);
        at = idx + 1;
      } else notes.push(`cue "${name}" (${key}) not found in ${lang}-${s.id}: "${info.words.map((w) => w.w).join(" ")}"`);
    }
    const nextLanding = i < scenes.length - 1 ? landedAt[i + 1] - TRANSITION : total;
    const end = start + Math.round(info.duration * FPS);
    if (end > nextLanding) notes.push(`${lang}-${s.id}: voice runs ${end - nextLanding} frames into the next transition`);
  });
  langs[lang] = { vo, cues };
}

if (missingVo.size) notes.unshift(`⚠ no voice-over yet for ${[...missingVo].join(", ")} — lengths and cues are estimates (run make-voiceover.mjs)`);
const plan = {
  fps: FPS,
  transition: TRANSITION,
  preview,
  drop: drop ? { ...drop, videoTime: +((landedAt[dropIdx]) / FPS).toFixed(3) } : null,
  music: music ? { file: "music.mp3", bpm, offsetSeconds: +(music.bars[offsetBars]?.t ?? offsetBars * BAR).toFixed(3), from: frameOfBar(proBars()) } : null,
  prologueMusic,
  total,
  scenes: planScenes,
  beats,
  langs,
  notes,
};
writeFileSync(path.join(root, "src/plan.json"), JSON.stringify(plan, null, 1));

console.log(`${preview ? "PREVIEW " : ""}plan: ${(total / FPS).toFixed(2)}s (${total} frames), ${bpm} BPM, bar ${BAR.toFixed(2)}s, transition ${TRANSITION}f${music ? `, music starts at ${plan.music.offsetSeconds}s` : ""}`);
for (const s of planScenes) {
  const sc = scenes.find((x) => x.id === s.id);
  const cueText = LANGS.map((l) => `${l}: ${Object.entries(langs[l].cues[s.id]).map(([k, v]) => `${k}=${v}`).join(" ")}`).join(" | ");
  console.log(`  ${s.id.padEnd(11)} ${String(s.bars).padStart(2)} bars  lands ${((s.from + s.landed) / FPS).toFixed(2).padStart(6)}s  needs ${sc.need.toFixed(1)}s  ${cueText}`);
}
const [minLen, maxLen] = storyboard.targetSeconds ?? [45, 65];
if (total / FPS > maxLen + 1) notes.push(`⚠ film is ${(total / FPS).toFixed(1)}s — aim for ${minLen}–${maxLen}s: tighten narration, lower minSeconds, drop a scene, or pick a track whose drop comes earlier`);
if (total / FPS < minLen - 5) notes.push(`⚠ film is only ${(total / FPS).toFixed(1)}s — aim for ${minLen}–${maxLen}s`);
for (const n of notes) console.log(`  • ${n}`);
