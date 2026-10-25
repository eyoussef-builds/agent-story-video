import { useCurrentFrame } from "remotion";
import env from "../vo-env.json";
import { useScene, useV } from "../theme";

/** Voice loudness (0–1) right now in the current scene, for the narrator's talking ring / lift. */
export const useTalk = () => {
  const f = useCurrentFrame();
  const { lang } = useV();
  const { id, cues } = useScene();
  const series = (env as Record<string, Record<string, number[]>>)[lang]?.[id];
  const start = cues.vo;
  if (!series || start === undefined) return 0;
  return series[f - start] ?? 0;
};
