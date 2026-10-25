// The cold-open "tape rewind" sound: the last seconds of the teaser's music, reversed and sped up.
//   node scripts/make-rewind.mjs        # after plan-timeline.mjs (reads the teaser's music bars from src/plan.json)
// → public/rewind.mp3 (used by the bridge scene's "sfx"). Uses the start of the track when there is no teaser music.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const plan = JSON.parse(readFileSync(path.join(root, "src/plan.json"), "utf8"));
const pm = plan.prologueMusic?.[0];
const end = pm ? pm.offsetSeconds + pm.frames / plan.fps : (plan.music?.offsetSeconds ?? 0) + 4;
execFileSync("ffmpeg", [
  "-v", "error", "-y", "-ss", Math.max(0, end - 4).toFixed(2), "-t", "4", "-i", path.join(root, "public/music.mp3"),
  "-af", "areverse,asetrate=44100*2.6,aresample=44100,afade=t=in:d=0.08,afade=t=out:st=1.15:d=0.4,highpass=f=180",
  "-ac", "2", "-b:a", "192k", path.join(root, "public/rewind.mp3"),
]);
console.log("public/rewind.mp3 (1.6 s)");
