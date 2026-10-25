// Review stills (rendered at half size, one browser for all frames):
//   node scripts/stills.mjs <compositionId> <frame> [frame...]
//   node scripts/stills.mjs <compositionId> --scenes     # per scene: settled, last cue, and its final frame, + a contact sheet
//   add --full to render at full size (to check small text such as Arabic inside a terminal)
// Output: out/stills/<id>-<frame>.png and out/stills/<id>-sheet.png
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const [id, ...rest] = process.argv.slice(2);
const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const plan = JSON.parse(readFileSync(path.join(root, "src/plan.json"), "utf8"));
let frames = rest.filter((a) => /^\d+$/.test(a)).map(Number);
if (rest.includes("--scenes")) {
  const lang = id.startsWith("ar") ? "ar" : "en";
  frames = [];
  for (const s of plan.scenes) {
    const cues = Object.values(plan.langs[lang].cues[s.id] ?? {});
    const settle = s.from + s.landed + 24;
    const lastCue = cues.length ? s.from + Math.max(...cues) + 14 : s.from + s.duration - plan.transition - 4;
    const end = s.from + s.duration - (s === plan.scenes[plan.scenes.length - 1] ? 1 : plan.transition + 1);
    frames.push(settle, Math.min(lastCue, end - 6), end);
  }
  frames = [...new Set(frames)].sort((a, b) => a - b);
}
const outDir = path.join(root, "out/stills");
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const browser = await openBrowser("chrome");
const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
const files = [];
for (const frame of frames) {
  const output = path.join(outDir, `${id}-${String(frame).padStart(4, "0")}.png`);
  await renderStill({ serveUrl, composition, frame, output, puppeteerInstance: browser, scale: rest.includes("--full") ? 1 : 0.5, overwrite: true });
  files.push(output);
  console.log(output);
}
await browser.close({ silent: true });
if (rest.includes("--scenes") && files.length) {
  // Contact sheet: 4 columns (landscape) or 6 columns (vertical), scaled down.
  const cols = composition.width > composition.height ? 3 : 6; // landscape: 3 per scene (settled, cue, end)
  const w = composition.width > composition.height ? 480 : 270;
  const rows = Math.ceil(files.length / cols);
  const inputs = files.flatMap((f) => ["-i", f]);
  const scaled = files.map((_, i) => `[${i}]scale=${w}:-1[s${i}]`).join(";");
  const layout = files.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols)}*h0`).map((s) => s.replace(/(\d+)\*h0/, (m, r) => (r === "0" ? "0" : Array(+r).fill("h0").join("+"))));
  const sheet = path.join(outDir, `${id}-sheet.png`);
  execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", `${scaled};${files.map((_, i) => `[s${i}]`).join("")}xstack=inputs=${files.length}:layout=${layout.join("|")}:fill=white`, sheet]);
  console.log(`sheet: ${sheet} (${rows} rows)`);
}
