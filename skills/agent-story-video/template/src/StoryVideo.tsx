import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import captions from "./captions.json";
import env from "./vo-env.json";
import storyboard from "./storyboard.json";
import { SCENE_TYPES } from "./scenes";
import { BRAND, C, FONT, FONT_AR, Lang, SceneCtx, VideoCtx } from "./theme";
import { musicVolume, PLAN, sceneBeats } from "./timeline";
import { Sun } from "./ui/common";
import { HAS_NARRATOR, Narrator, NarratorState } from "./story/Narrator";

// narrator: the corner narrator's pose in this scene ("hidden" where the scene shows the narrator itself, or none);
// narratorAt: { cueName: pose } changes during the scene.
type StoryScene = { id: string; type: string; narrator?: NarratorState | "hidden"; narratorAt?: Record<string, NarratorState>; drop?: boolean; prologue?: boolean; sfx?: string };
const SB = storyboard.scenes as StoryScene[];

const currentVo = (lang: Lang, frame: number) => PLAN.langs[lang].vo.find((v) => frame >= v.from && frame < v.from + v.frames);

/** The narrator tells the story from the corner (hidden in scenes that show it large), calm so it never steals the eye. */
const CornerNarrator: React.FC<{ lang: Lang; vertical: boolean }> = ({ lang, vertical }) => {
  const frame = useCurrentFrame();
  let idx = 0;
  PLAN.scenes.forEach((s, i) => { if (frame >= s.from + PLAN.transition / 2) idx = i; });
  const s = PLAN.scenes[idx], sb = SB[idx];
  if (!HAS_NARRATOR) return null;
  const hiddenNow = sb.narrator === "hidden";
  const hiddenAt = (i: number) => SB[i]?.narrator === "hidden";
  // Fade across transitions into/out of hidden scenes.
  const vis = hiddenNow ? 0 : Math.min(
    idx > 0 && hiddenAt(idx - 1) ? interpolate(frame, [s.from, s.from + PLAN.transition + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1,
    idx < PLAN.scenes.length - 1 && hiddenAt(idx + 1) ? interpolate(frame, [s.from + s.duration - PLAN.transition - 6, s.from + s.duration - PLAN.transition], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1,
  );
  if (vis <= 0) return null;
  let state: NarratorState = (sb.narrator as NarratorState) ?? "idle";
  let since = s.from + s.landed;
  const cues = PLAN.langs[lang].cues[s.id] ?? {};
  Object.entries(sb.narratorAt ?? {}).forEach(([cue, st]) => {
    if (cues[cue] !== undefined && frame >= s.from + cues[cue] && s.from + cues[cue] >= since) { state = st; since = s.from + cues[cue]; }
  });
  const vo = currentVo(lang, frame);
  const talk = vo ? ((env as Record<string, Record<string, number[]>>)[lang]?.[vo.scene]?.[frame - vo.from] ?? 0) : 0;
  return (
    <div style={{ position: "absolute", right: vertical ? 24 : 36, bottom: vertical ? 320 : 30, opacity: vis, zIndex: 20 }}>
      <Narrator state={state} size={vertical ? 1.1 : 1.3} talk={talk} since={since} />
    </div>
  );
};

/** Burned-in captions from the script, timed to the spoken words. */
const Captions: React.FC<{ lang: Lang; vertical: boolean }> = ({ lang, vertical }) => {
  const frame = useCurrentFrame();
  const vo = currentVo(lang, frame);
  if (!vo) return null;
  const t = (frame - vo.from) / PLAN.fps;
  const segs = (captions as Record<string, Record<string, { s: number; e: number; text: string }[]>>)[lang]?.[vo.scene] ?? [];
  let seg: { s: number; e: number; text: string } | undefined;
  for (const sg of segs) if (t >= sg.s - 0.05) seg = sg;
  if (!seg || t > seg.e + 0.35) return null;
  const latin = !/[؀-ۿ]/.test(seg.text);
  return (
    <div style={{ position: "absolute", left: vertical ? 50 : 100, right: HAS_NARRATOR ? (vertical ? 280 : 330) : vertical ? 50 : 100, bottom: vertical ? 340 : 44, display: "flex", justifyContent: "center", zIndex: 19 }}>
      <div dir={latin ? "ltr" : "rtl"} style={{ maxWidth: "100%", padding: vertical ? "10px 20px" : "8px 22px", borderRadius: 14, background: C.yellow, border: `2px solid ${C.ink}`, boxShadow: "0 8px 22px rgba(21,19,15,0.18)", color: C.ink, fontFamily: latin ? FONT : FONT_AR, fontSize: vertical ? 38 : 38, fontWeight: 700, lineHeight: 1.35, textAlign: "center" }}>
        {seg.text}
      </div>
    </div>
  );
};

const Watermark: React.FC<{ vertical: boolean; from: number; to: number }> = ({ vertical, from, to }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 16, to - 10, to + 4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (o <= 0) return null;
  return (
    <div dir="ltr" style={{ position: "absolute", ...(vertical ? { top: 96, left: 0, right: 0, justifyContent: "center" } : { top: 40, left: 48 }), display: "flex", opacity: o, zIndex: 21 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 42, paddingInline: 16, borderRadius: 10, background: "rgba(250,248,242,0.92)", border: `1px solid ${C.line2}`, fontFamily: FONT, fontSize: 20, fontWeight: 700, color: C.ink }}>
        <Sun size={15} />
        {BRAND.site}
      </div>
    </div>
  );
};

export const StoryVideo: React.FC<{ lang: Lang; vertical: boolean }> = ({ lang, vertical }) => {
  const rtl = lang === "ar";
  const scenes = PLAN.scenes;
  const last = scenes[scenes.length - 1];
  const story = SB.findIndex((x) => !x.prologue); // the first story scene (after the cold open)
  const presentation = (i: number) => (SB[i + 1]?.drop || i + 1 === scenes.length - 1 ? wipe({ direction: "from-bottom" }) : fade());
  return (
    <VideoCtx.Provider value={{ lang, vertical }}>
      <AbsoluteFill dir={rtl ? "rtl" : "ltr"} style={{ background: C.paper, fontFamily: rtl ? FONT_AR : FONT, color: C.ink }}>
        <TransitionSeries>
          {scenes.flatMap((s, i) => {
            const Scene = SCENE_TYPES[s.type];
            if (!Scene) throw new Error(`Unknown scene type "${s.type}"`);
            const items = [
              <TransitionSeries.Sequence key={`s${i}`} durationInFrames={s.duration}>
                <SceneCtx.Provider value={{ id: s.id, landed: s.landed, duration: s.duration, cues: PLAN.langs[lang].cues[s.id] ?? {}, beats: sceneBeats(s) }}>
                  <Scene />
                </SceneCtx.Provider>
              </TransitionSeries.Sequence>,
            ];
            if (i < scenes.length - 1) items.push(<TransitionSeries.Transition key={`t${i}`} presentation={presentation(i) as never} timing={springTiming({ config: { damping: 200 }, durationInFrames: PLAN.transition })} />);
            return items;
          })}
        </TransitionSeries>
        <CornerNarrator lang={lang} vertical={vertical} />
        <Captions lang={lang} vertical={vertical} />
        <Watermark vertical={vertical} from={scenes[story + 1].from + PLAN.transition} to={last.from} />
        {PLAN.music ? (
          <Sequence from={PLAN.music.from ?? 0} layout="none">
            <Audio src={staticFile(PLAN.music.file)} trimBefore={Math.round(PLAN.music.offsetSeconds * PLAN.fps)} volume={musicVolume(lang, PLAN.music.from ?? 0)} />
          </Sequence>
        ) : null}
        {(PLAN.prologueMusic ?? []).map((m) => (
          <Sequence key={`pm-${m.scene}`} from={m.from} durationInFrames={m.frames} layout="none">
            <Audio src={staticFile(PLAN.music!.file)} trimBefore={Math.round(m.offsetSeconds * PLAN.fps)} volume={musicVolume(lang, m.from, m.from + m.frames, 14)} />
          </Sequence>
        ))}
        {scenes.map((s, i) => (SB[i].sfx ? (
          <Sequence key={`sfx-${s.id}`} from={s.from} layout="none">
            <Audio src={staticFile(SB[i].sfx!)} volume={0.55} />
          </Sequence>
        ) : null))}
        {PLAN.langs[lang].vo.map((v) => (
          <Sequence key={v.scene} from={v.from} durationInFrames={v.frames} layout="none">
            <Audio src={staticFile(v.src)} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </VideoCtx.Provider>
  );
};
