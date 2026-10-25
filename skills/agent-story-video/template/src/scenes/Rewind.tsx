import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT, IN_OUT, mix, p, useF, useScene, useV } from "../theme";
import { PLAN } from "../timeline";
import { Icon, Paper } from "../ui/common";
import { HAS_NARRATOR, Narrator } from "../story/Narrator";
import { useFont } from "../story/Bits";
import { useTalk } from "../story/talk";
import { At, Rich, Txt, useAt, useContent } from "../story/content";

const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

/**
 * Cold-open bridge (a "prologue" scene after the teaser): the film "rewinds" — the timecode runs back from the
 * ending to 0:00 while the narrator says the bridge line (e.g. "But the story started long before that…").
 */
export const RewindScene: React.FC = () => {
  const f = useF();
  const { vertical } = useV();
  const { landed, duration } = useScene();
  const at = useAt();
  const font = useFont();
  const talk = useTalk();
  const c = useContent<{ label?: Txt; labelAt?: At }>();
  const last = PLAN.scenes[PLAN.scenes.length - 1];
  const from = Math.max(1, (last.from + last.landed) / PLAN.fps);
  const back = p(f, landed - 8, 48, IN_OUT);
  const t = mix(from, 0, back);
  const words = p(f, at(c.labelAt, landed + 30) - 4, 16);
  const out = p(f, duration - 14, 14);
  return (
    <Paper bg={C.night} dots={C.night2}>
      <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: vertical ? 40 : 34, padding: vertical ? "200px 60px 560px" : "0 120px 120px", opacity: 1 - out * 0.4 }}>
        <div dir="ltr" style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div style={{ width: 118, height: 118, borderRadius: 59, background: C.yellow, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="Rewind" size={60} color={C.ink} />
          </div>
          <div style={{ fontFamily: FONT, fontSize: vertical ? 120 : 132, fontWeight: 800, color: C.yellow, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{clock(t)}</div>
        </div>
        <div dir="ltr" style={{ width: vertical ? 860 : 900, height: 12, borderRadius: 6, background: "rgba(250,248,242,0.16)", overflow: "hidden" }}>
          <div style={{ width: `${(t / from) * 100}%`, height: "100%", background: C.yellow, borderRadius: 6 }} />
        </div>
        {c.label ? (
          <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: words, transform: `translateY(${(1 - words) * 20}px)` }}>
            {HAS_NARRATOR ? <Narrator state="idle" size={vertical ? 0.8 : 0.75} talk={talk} /> : null}
            <div style={{ fontFamily: font, fontSize: vertical ? 56 : 58, fontWeight: 800, color: C.nightText }}><Rich text={c.label} /></div>
          </div>
        ) : null}
      </AbsoluteFill>
    </Paper>
  );
};
