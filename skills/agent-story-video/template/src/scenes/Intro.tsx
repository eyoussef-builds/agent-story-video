import React from "react";
import { AbsoluteFill } from "remotion";
import { BACK, C, FONT, IN_OUT, mix, p, PRODUCT, useF, useV } from "../theme";
import { AppIcon, Paper } from "../ui/common";
import { HAS_NARRATOR, Narrator, NARRATOR } from "../story/Narrator";
import { Shot } from "../story/Shot";
import { SHOTS } from "../story/shots";
import { Tag, useFont } from "../story/Bits";
import { useTalk } from "../story/talk";
import { Txt, useAt, useContent, useT } from "../story/content";

type IntroContent = {
  hello?: { title?: Txt; subtitle?: Txt };
  shot?: string; // id in story/shots.ts
  tags?: { text: Txt; icon?: string }[];
  rewindTag?: Txt; // shown at the "story" cue: "let me take you back"
};

/** The narrator says hi and shows the finished product; at "story" the product greys out — we go back to the start. */
export const IntroScene: React.FC = () => {
  const f = useF();
  const { vertical } = useV();
  const at = useAt();
  const t = useT();
  const font = useFont();
  const talk = useTalk();
  const c = useContent<IntroContent>();
  const product = at("product", 80);
  const story = at("story", 280);
  const hi = p(f, 8, 16, BACK);
  const dash = p(f, product - 4, 26, BACK);
  const rewind = p(f, story, 24, IN_OUT);
  const shot = c.shot ? SHOTS[c.shot as keyof typeof SHOTS] : undefined;
  const shotW = vertical ? 960 : HAS_NARRATOR ? 1040 : 1200;
  const title = t(c.hello?.title) || `Hi, I'm ${NARRATOR.name} 👋`;
  const subtitle = t(c.hello?.subtitle ?? (NARRATOR.subtitle as Txt | undefined));
  const greeting = (
    <div style={{ background: C.white, border: `2px solid ${C.ink}`, borderRadius: 22, padding: "14px 22px", boxShadow: "0 14px 30px rgba(21,19,15,0.12)", opacity: Math.min(1, hi * 1.4), transform: `scale(${mix(0.6, 1, hi)})` }}>
      <div style={{ fontFamily: font, fontSize: vertical ? 40 : 38, fontWeight: 800, color: C.ink, whiteSpace: "nowrap" }}>{title}</div>
      {subtitle ? <div style={{ fontFamily: font, fontSize: vertical ? 24 : 22, fontWeight: 600, color: C.stone }}>{subtitle}</div> : null}
    </div>
  );
  return (
    <Paper>
      <AbsoluteFill style={{ flexDirection: vertical ? "column" : "row-reverse", alignItems: "center", justifyContent: "center", gap: vertical ? 40 : 70, padding: vertical ? "220px 60px 560px" : "0 110px 120px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          {greeting}
          {HAS_NARRATOR ? (
            <Narrator state={f < product + 20 ? "waving" : "idle"} since={f < product + 20 ? 6 : product + 20} times={f < product + 20 ? 2 : undefined} size={vertical ? 1.6 : 2.0} talk={talk} />
          ) : null}
        </div>
        <div style={{ opacity: Math.min(1, dash * 1.4), transform: `translateY(${(1 - dash) * 50}px) scale(${mix(0.9, 1, dash) * mix(1, 0.92, rewind)})`, filter: `grayscale(${rewind * 0.8})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <AppIcon size={vertical ? 78 : 70} />
            <div style={{ fontFamily: FONT, fontSize: vertical ? 64 : 60, fontWeight: 800, letterSpacing: "-0.03em", color: C.ink }}>{PRODUCT.name}</div>
          </div>
          {shot ? <Shot spec={shot} width={shotW} /> : null}
          {c.tags?.length ? (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              {c.tags.map((g, i) => (
                <Tag key={i} icon={g.icon}>{t(g.text)}</Tag>
              ))}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {c.rewindTag && rewind > 0.01 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: vertical ? 170 : 60, display: "flex", justifyContent: "center", opacity: rewind }}>
          <Tag dark icon="Rewind" style={{ fontSize: vertical ? 28 : 24, height: 50 }}>{t(c.rewindTag)}</Tag>
        </div>
      ) : null}
    </Paper>
  );
};
