// Renders the finished videos: node scripts/render-all.mjs [compositionId...]
// → out/<outputName>-{EN,AR}-{16x9,9x16}.mp4 for the languages in storyboard.langs (outputName from storyboard.json).
// One bundle + one browser for all.
// Remotion's headless Chrome crashes inside a sandboxed shell (ICU / GPU process abort) — run it unsandboxed.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, selectComposition } from "@remotion/renderer";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const storyboard = JSON.parse(readFileSync(path.join(root, "src/storyboard.json"), "utf8"));
const plan = JSON.parse(readFileSync(path.join(root, "src/plan.json"), "utf8"));
if (plan.preview) throw new Error("src/plan.json is a silent preview — run plan-timeline.mjs without --preview first");
const name = storyboard.product.outputName;
const OUTPUTS = {
  "en-landscape": `${name}-EN-16x9.mp4`,
  "ar-landscape": `${name}-AR-16x9.mp4`,
  "en-vertical": `${name}-EN-9x16.mp4`,
  "ar-vertical": `${name}-AR-9x16.mp4`,
};
const langs = storyboard.langs ?? ["en", "ar"];
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(OUTPUTS).filter((id) => langs.includes(id.slice(0, 2)));
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const browser = await openBrowser("chrome");
for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
  const outputLocation = path.join(root, "out", OUTPUTS[id]);
  let last = -1;
  const t = Date.now();
  await renderMedia({
    serveUrl,
    composition,
    outputLocation,
    puppeteerInstance: browser,
    codec: "h264",
    crf: 18,
    pixelFormat: "yuv420p",
    imageFormat: "jpeg",
    jpegQuality: 92,
    audioCodec: "aac",
    audioBitrate: "192k",
    concurrency: 4,
    overwrite: true,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 4) * 25;
      if (pct !== last) {
        last = pct;
        console.log(`${id}: ${pct}%`);
      }
    },
  });
  console.log(`DONE ${outputLocation} in ${Math.round((Date.now() - t) / 1000)}s`);
}
await browser.close({ silent: true });
