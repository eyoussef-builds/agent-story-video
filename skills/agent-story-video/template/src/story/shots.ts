import type { ShotSpec } from "./Shot";

// Real screenshots in public/shots/, cropped, with every private detail blurred (masks, in image pixels):
// account/app IDs, e-mails, phone numbers, other people's names and faces, tokens, URLs of private projects.
// Measure boxes on the full-size image; check every mask at full size in a still before rendering.
// Example: dashboard: { src: "dashboard.png", size: [1600, 900], crop: [0, 0, 1600, 900], title: "My app · Overview", masks: [[1180, 24, 260, 36]] },
export const SHOTS: Record<string, ShotSpec> = {
  repo: { src: "repo.png", size: [1512, 900], crop: [140, 180, 1240, 520], title: "github.com/eyoussef-builds/product-showcase-video" },
};
