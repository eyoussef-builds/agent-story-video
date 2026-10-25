// Lengthen a track that is a few bars too short, musically: after bar B, jump back to bar A and play on.
//   node scripts/extend-music.mjs --repeat 81-97        # needs music/analysis.json for the bar times
// Pick A and B at the same place in two phrases (ideally both phrase starts after the drop, 8 or 16 bars
// apart) so the seam is inaudible; an 80 ms crossfade hides the cut. Repeating bars AFTER the drop keeps the
// drop where it was; repeating bars before it moves the drop later. The original is kept in music/original.mp3.
// Then re-run: node scripts/analyze-music.mjs public/music.mp3 --json music/analysis.json
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const args = process.argv.slice(2);
const m = /^(\d+)-(\d+)$/.exec(args[args.indexOf("--repeat") + 1] ?? "");
if (!m) throw new Error("usage: node scripts/extend-music.mjs --repeat A-B   (bar numbers from music/analysis.json)");
const [a, b] = [+m[1], +m[2]];
const analysis = JSON.parse(readFileSync(path.join(root, "music/analysis.json"), "utf8"));
const bars = analysis.bars;
if (!(a < b && b < bars.length)) throw new Error(`bars must satisfy A < B < ${bars.length}`);
const src = path.join(root, "music/original.mp3");
if (!existsSync(src)) copyFileSync(path.join(root, "public/music.mp3"), src);
const tA = bars[a].t, tB = bars[b].t;
execFileSync("ffmpeg", [
  "-v", "error", "-y", "-i", src, "-i", src, "-filter_complex",
  `[0]atrim=0:${(tB + 0.04).toFixed(3)},asetpts=N/SR/TB[x];[1]atrim=${(tA - 0.04).toFixed(3)},asetpts=N/SR/TB[y];[x][y]acrossfade=d=0.08:c1=tri:c2=tri`,
  "-b:a", "256k", path.join(root, "public/music.mp3"),
]);
const dur = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(root, "public/music.mp3")]).toString().trim();
console.log(`public/music.mp3: bars ${a}–${b - 1} play twice (+${(tB - tA).toFixed(1)} s) → ${dur.toFixed(1)} s. Now re-run analyze-music.mjs.`);
