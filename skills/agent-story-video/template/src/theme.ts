import { createContext, useContext } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadSchibsted } from "@remotion/google-fonts/SchibstedGrotesk";
import { loadFont as loadPlexArabic } from "@remotion/google-fonts/IBMPlexSansArabic";
import brand from "./brand.json";
import storyboard from "./storyboard.json";

// Creator brand (brand.json — ships with the eyoussef.me look: paper, ink, yellow). The "yellow" token is
// the brand's accent colour wherever it's used. The product's own colours (ACCENT) appear only inside its
// UI mock-ups.
export const BRAND = brand as { name: string; site: string; logo: string; colors: Record<string, string> };
export const C = {
  ...(brand.colors as {
    paper: string; paper2: string; paper3: string; ink: string; body: string; stone: string; line: string; line2: string;
    yellow: string; yellowDeep: string; night: string; night2: string; nightText: string; nightMuted: string;
  }),
  white: "#FFFFFF",
  selection: "rgba(84,132,220,0.55)",
  rec: "#FF4D3D",
};
export const PRODUCT = storyboard.product;
export const ACCENT = PRODUCT.accent as [string, string];
export const GRAD = `linear-gradient(135deg, ${ACCENT[0]}, ${ACCENT[1]})`;
/** Text/icon colour on the product accent: ink on a light accent (e.g. a yellow product), white on a dark one. */
const luma = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};
export const ON_ACCENT = luma(ACCENT[0]) > 0.6 ? C.ink : "#FFFFFF";

const latin = loadSchibsted("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;
const arabic = loadPlexArabic("normal", { weights: ["400", "500", "600", "700"], subsets: ["arabic", "latin"] }).fontFamily;
export const FONT = `"${latin}", "${arabic}", system-ui, sans-serif`;
export const FONT_AR = `"${arabic}", "${latin}", system-ui, sans-serif`;
// Arabic inside terminals/logs falls through the mono fonts to IBM Plex Sans Arabic instead of a tiny system font.
export const MONO = `"SF Mono", Menlo, Consolas, "${arabic}", monospace`;

export type Lang = "en" | "ar";
export const VideoCtx = createContext<{ lang: Lang; vertical: boolean }>({ lang: "en", vertical: false });
export const useV = () => {
  const v = useContext(VideoCtx);
  return { ...v, rtl: v.lang === "ar" };
};

/** Per-scene timing from plan.json: cue frames (voice-over words) and the music's beats, in local frames. */
export type SceneInfo = { id: string; landed: number; duration: number; cues: Record<string, number>; beats: { f: number; k: number }[] };
export const SceneCtx = createContext<SceneInfo>({ id: "", landed: 0, duration: 0, cues: {}, beats: [] });
export const useScene = () => useContext(SceneCtx);
export const useF = () => useCurrentFrame();
/** Frame of a named cue in the current scene, or `fallback` when the voice-over has no such word. */
export const useCue = () => {
  const { cues } = useContext(SceneCtx);
  return (name: string, fallback: number) => cues[name] ?? fallback;
};
/** 0–1 kick on every beat (stronger on downbeats and in louder bars), decaying in a few frames. */
export const usePulse = () => {
  const f = useCurrentFrame();
  const { beats } = useContext(SceneCtx);
  let last: { f: number; k: number } | undefined;
  for (const b of beats) {
    if (b.f > f) break;
    last = b;
  }
  return last ? last.k * Math.exp(-(f - last.f) / 5) : 0;
};

export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);
export const LINEAR = (x: number) => x;

/** 0→1 progress of an animation that starts at `start` and lasts `len` frames. */
export const p = (f: number, start: number, len: number, ease = OUT) =>
  interpolate(f, [start, start + Math.max(1e-6, len)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Heading type: tight Latin tracking; Arabic keeps 0 tracking so letters stay joined. */
export const heading = (rtl: boolean, size: number) => ({
  fontFamily: rtl ? FONT_AR : FONT,
  fontSize: size,
  fontWeight: 700,
  letterSpacing: rtl ? 0 : "-0.028em",
  lineHeight: rtl ? 1.32 : 1.06,
});
