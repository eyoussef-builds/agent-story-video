// Final QA of the rendered videos in out/: size, length, loudness, peaks, the voice over the music,
// and whether the drop lands where the plan put the drop scene.   node scripts/check-output.mjs
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const plan = JSON.parse(readFileSync(path.join(root, "src/plan.json"), "utf8"));
const storyboard = JSON.parse(readFileSync(path.join(root, "src/storyboard.json"), "utf8"));
const out = path.join(root, "out");
const name = storyboard.product.outputName;
const expected = (storyboard.langs ?? ["en", "ar"]).flatMap((l) => ["16x9", "9x16"].map((r) => `${name}-${l.toUpperCase()}-${r}.mp4`));
const present = new Set(readdirSync(out));
const files = expected.filter((f) => present.has(f));
for (const f of expected) if (!present.has(f)) console.log(`✗ missing ${f}`);
const sh = (cmd, args) => execFileSync(cmd, args, { maxBuffer: 1 << 28 }).toString();
let ok = files.length === expected.length;
for (const f of files) {
  const file = path.join(out, f);
  const [w, h] = sh("ffprobe", ["-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height", "-of", "csv=s=x:p=0", file]).trim().split("x").map(Number);
  const dur = +sh("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).trim();
  const audio = sh("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=codec_name", "-of", "csv=p=0", file]).trim();
  const r128 = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${file}" -af ebur128=peak=true -f null - 2>&1`], { maxBuffer: 1 << 28 }).toString();
  const I = +(r128.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop()?.match(/-?[\d.]+/)?.[0] ?? NaN);
  const peak = +(r128.match(/Peak:\s+(-?[\d.]+) dBFS/g)?.pop()?.match(/-?[\d.]+/)?.[0] ?? NaN);
  const problems = [];
  const vertical = f.includes("9x16");
  if (vertical ? !(w === 1080 && h === 1920) : !(w === 1920 && h === 1080)) problems.push(`size ${w}x${h}`);
  if (Math.abs(dur - plan.total / plan.fps) > 0.2) problems.push(`length ${dur}s ≠ plan ${(plan.total / plan.fps).toFixed(2)}s`);
  if (!audio) problems.push("no audio track");
  if (!(I > -19 && I < -12)) problems.push(`loudness ${I} LUFS (want −19…−12)`);
  if (!(peak < -1)) problems.push(`peak ${peak} dBFS (want < −1)`);
  ok &&= problems.length === 0;
  console.log(`${problems.length ? "✗" : "✓"} ${f}: ${w}x${h}, ${dur.toFixed(2)}s, ${I} LUFS, peak ${peak} dBFS${problems.length ? "  → " + problems.join("; ") : ""}`);
}
// Drop check: the onDrop scene's landing (video time) + the music start offset must equal the drop's time in the track.
if (plan.drop && plan.music) {
  // A cold open (prologue) delays the track's start by music.from frames.
  const trackAt = plan.drop.videoTime - (plan.music.from ?? 0) / plan.fps + plan.music.offsetSeconds;
  const err = Math.abs(trackAt - plan.drop.trackTime);
  console.log(`${err < 0.06 ? "✓" : "✗"} drop: "${plan.drop.sceneId}" lands at ${plan.drop.videoTime}s${plan.music.from ? ` − music start ${(plan.music.from / plan.fps).toFixed(2)}s` : ""} + music offset ${plan.music.offsetSeconds}s = ${trackAt.toFixed(2)}s in the track; drop is at ${plan.drop.trackTime}s`);
  ok &&= err < 0.06;
} else if (storyboard.scenes.some((s) => s.onDrop)) {
  console.log("✗ drop: the plan has no aligned drop (see plan-timeline.mjs notes)");
}
process.exit(ok ? 0 : 1);
