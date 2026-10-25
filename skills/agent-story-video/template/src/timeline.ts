import plan from "./plan.json";
import type { Lang } from "./theme";

/** The cut list from scripts/plan-timeline.mjs, plus the music level curve (ducked under the voice-over). */
export type PlanScene = { id: string; type: string; bars: number; from: number; duration: number; landed: number };
export const PLAN = plan as unknown as {
  fps: number;
  transition: number;
  preview: boolean;
  music: { file: string; bpm: number; offsetSeconds: number; from?: number } | null;
  prologueMusic?: { scene: string; from: number; frames: number; offsetSeconds: number }[];
  total: number;
  scenes: PlanScene[];
  beats: { f: number; k: number }[];
  langs: Record<Lang, { vo: { scene: string; from: number; frames: number; src: string }[]; cues: Record<string, Record<string, number>> }>;
};

export const sceneBeats = (s: PlanScene) =>
  PLAN.beats.filter((b) => b.f >= s.from && b.f < s.from + s.duration).map((b) => ({ f: b.f - s.from, k: b.k }));

// Music alone sits around −16 LUFS (BASE on a ~−10 LUFS master); under the voice it drops ~7.5 dB.
const BASE = 0.5;
const DUCKED = 0.42;
// `start`/`end`: where this music bed sits in the film (the volume callback counts frames from its start).
export const musicVolume = (lang: Lang, start = 0, end = PLAN.total, fadeOutFrames = 45) => {
  const spans = PLAN.langs[lang].vo.map((v) => [v.from - 6, v.from + v.frames + 4]);
  return (local: number) => {
    const f = local + start;
    let duck = 0;
    for (const [a, b] of spans) {
      const d = f < a ? (a - f) / 8 : f > b ? (f - b) / 10 : 0;
      duck = Math.max(duck, 1 - Math.min(1, d));
    }
    const fadeIn = Math.min(1, local / 10);
    const fadeOut = Math.min(1, Math.max(0, (end - f) / fadeOutFrames));
    return BASE * (1 - (1 - DUCKED) * duck) * fadeIn * fadeOut;
  };
};
