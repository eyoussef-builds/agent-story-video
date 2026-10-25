import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import narrator from "../narrator.json";
import { BACK, C, FONT, mix, p } from "../theme";
import { Icon } from "../ui/common";

/**
 * The storyteller — the agent who built the thing — configured in src/narrator.json:
 *   "sprite": the creator's own animated character (a sprite sheet: one row per state, one column per frame)
 *   "image":  a still avatar or logo in a circle (public/narrator/…)
 *   "badge":  a built-in neutral mark: an icon in a brand-coloured circle (no character art needed)
 *   "none":   no on-screen narrator; the voice and captions carry the story
 * Motion rule: calm. The narrator must never pull the eye from the story — hold the still frame, play one
 * slow cycle when the pose changes (`since`) and then every `every` frames; `times` plays a one-off gesture
 * (a jump, a wave) that many times, then rests. `talk` (0–1 voice loudness) only lifts a sprite by a hair
 * and lights the ring of an image/badge.
 */
export type NarratorState = "idle" | "review" | "waiting" | "working" | "jumping" | "waving" | "failed" | "runningLeft" | "runningRight";

type SpriteCfg = { file: string; cell: [number, number]; columns: number; rows: number; fps?: number; states: Record<string, [number, number]>; face?: { row: number; col: number; x: number; y: number; size: number } };
type Cfg = {
  kind: "sprite" | "image" | "badge" | "none";
  name: string;
  subtitle?: string | Record<string, string>;
  badge?: { icon: string; color?: string; iconColor?: string };
  image?: string;
  sprite?: SpriteCfg;
};
export const NARRATOR = narrator as unknown as Cfg;
export const HAS_NARRATOR = NARRATOR.kind !== "none";

/** Width/height of the narrator at `size` (sprite: cell × size; image/badge: a 150 px circle × size). */
export const narratorBox = (size: number): [number, number] => {
  if (NARRATOR.kind === "sprite" && NARRATOR.sprite) return [NARRATOR.sprite.cell[0] * size, NARRATOR.sprite.cell[1] * size];
  return [150 * size, 150 * size];
};

const SpriteFigure: React.FC<{ cfg: SpriteCfg; state: NarratorState; size: number; talk: number; since: number; every: number; times?: number; loop: boolean; flip: boolean }> = ({ cfg, state, size, talk, since, every, times, loop, flip }) => {
  const frame = useCurrentFrame();
  const fps = cfg.fps ?? 6;
  const [row, n] = cfg.states[state] ?? cfg.states.idle ?? [0, 1];
  const cycle = Math.round((n * 30) / fps);
  const local = Math.max(0, frame - since);
  const step = (t: number) => Math.floor((t * fps) / 30) % n;
  const calm = local % Math.max(cycle, every);
  const col = loop ? step(frame) : times !== undefined ? (local < cycle * times ? step(local) : 0) : calm < cycle ? step(calm) : 0;
  const [cw, ch] = cfg.cell;
  const w = cw * size, h = ch * size;
  // <Img> (not a CSS background) so Remotion waits for the sheet to load before rendering a frame.
  return (
    <div style={{ width: w, height: h, flex: "none" }}>
      <div
        style={{
          width: w,
          height: h,
          position: "relative",
          overflow: "hidden",
          transform: `scaleX(${flip ? -1 : 1}) translateY(${-talk * 1.5 * size}px)`,
          transformOrigin: "50% 100%",
          filter: "drop-shadow(0 10px 14px rgba(21,19,15,0.18))",
        }}
      >
        <Img src={staticFile(cfg.file)} style={{ position: "absolute", left: -col * w, top: -row * h, width: cw * cfg.columns * size, height: ch * cfg.rows * size, maxWidth: "none" }} />
      </div>
    </div>
  );
};

/** Image or badge narrator: a circle with a soft ring that lights up with the voice; a gesture is one small pop. */
const Disc: React.FC<{ state: NarratorState; size: number; talk: number; since: number; times?: number; onYellow?: boolean }> = ({ state, size, talk, since, times, onYellow }) => {
  const frame = useCurrentFrame();
  const d = 150 * size;
  const gesture = (state === "waving" || state === "jumping") && times !== undefined ? p(frame, since, 10, BACK) - p(frame, since + 12, 14) : 0;
  const ring = Math.min(1, talk * 1.2);
  // On the yellow end card a yellow badge would vanish — use white there.
  const bg = onYellow && (NARRATOR.badge?.color ?? C.yellow).toUpperCase() === C.yellow.toUpperCase() ? C.white : NARRATOR.badge?.color ?? C.yellow;
  return (
    <div style={{ width: d, height: d, flex: "none", position: "relative", transform: `scale(${1 + gesture * 0.07})` }}>
      <div style={{ position: "absolute", inset: -8 * size, borderRadius: "50%", border: `${4 * size}px solid ${onYellow ? C.ink : C.yellow}`, opacity: mix(0.15, 0.9, ring), boxShadow: onYellow ? undefined : `0 0 ${18 * size * ring}px rgba(255,224,74,${0.6 * ring})` }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", background: NARRATOR.kind === "image" ? C.white : bg, border: `${3 * size}px solid ${C.ink}`, boxShadow: "0 14px 30px rgba(21,19,15,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {NARRATOR.kind === "image" && NARRATOR.image ? (
          <Img src={staticFile(NARRATOR.image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Icon name={NARRATOR.badge?.icon ?? "Bot"} size={d * 0.5} color={NARRATOR.badge?.iconColor ?? C.ink} stroke={2.2} />
        )}
      </div>
    </div>
  );
};

export const Narrator: React.FC<{
  state?: NarratorState;
  size?: number;
  talk?: number;
  since?: number;
  every?: number;
  times?: number;
  loop?: boolean;
  flip?: boolean;
  onYellow?: boolean; // drawn on the brand yellow (end card): keeps an image/badge narrator visible
  style?: React.CSSProperties;
}> = ({ state = "idle", size = 1.25, talk = 0, since = 0, every = 150, times, loop = false, flip = false, onYellow, style }) => {
  if (NARRATOR.kind === "none") return null;
  return (
    <div style={{ flex: "none", ...style }}>
      {NARRATOR.kind === "sprite" && NARRATOR.sprite ? (
        <SpriteFigure cfg={NARRATOR.sprite} state={state} size={size} talk={talk} since={since} every={every} times={times} loop={loop} flip={flip} />
      ) : (
        <Disc state={state} size={size} talk={talk} since={since} times={times} onYellow={onYellow} />
      )}
    </div>
  );
};

/** The narrator's face for chat avatars: a crop of the sprite, the image, the badge icon, or initials. */
export const NarratorFace: React.FC<{ size: number }> = ({ size }) => {
  const sp = NARRATOR.sprite;
  if (NARRATOR.kind === "sprite" && sp?.face) {
    const s = size / sp.face.size;
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: C.yellow, flex: "none", position: "relative" }}>
        <Img src={staticFile(sp.file)} style={{ position: "absolute", left: -(sp.face.col * sp.cell[0] + sp.face.x) * s, top: -(sp.face.row * sp.cell[1] + sp.face.y) * s, width: sp.cell[0] * sp.columns * s, height: sp.cell[1] * sp.rows * s, maxWidth: "none" }} />
      </div>
    );
  }
  if (NARRATOR.kind === "image" && NARRATOR.image) {
    return <Img src={staticFile(NARRATOR.image)} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flex: "none", border: `1.5px solid ${C.line2}` }} />;
  }
  if (NARRATOR.kind === "badge" || NARRATOR.kind === "sprite") {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", background: NARRATOR.badge?.color ?? C.yellow, border: `1.5px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Icon name={NARRATOR.badge?.icon ?? "Bot"} size={size * 0.55} color={NARRATOR.badge?.iconColor ?? C.ink} />
      </div>
    );
  }
  const initials = NARRATOR.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: C.ink, color: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: size * 0.4, flex: "none" }}>{initials}</div>
  );
};
