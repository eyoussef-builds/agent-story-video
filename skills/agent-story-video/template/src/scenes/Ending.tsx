import React from "react";
import { AbsoluteFill } from "remotion";
import { BACK, BRAND, C, FONT, LINEAR, mix, p, PRODUCT, useF, usePulse, useV } from "../theme";
import { AppIcon, BrandMark, Icon, Paper } from "../ui/common";
import { HAS_NARRATOR, Narrator, NarratorState } from "../story/Narrator";
import { Pop, useFont } from "../story/Bits";
import { useTalk } from "../story/talk";
import { At, Rich, Txt, useAt, useContent } from "../story/content";

type EndingContent = {
  productAt?: At; // when the product name appears (default: start)
  links?: { icon: string; text: Txt; at: At }[]; // where to try / get it
  ask?: { icon?: string; text: Txt; at: At }; // e.g. "And the code on GitHub?"
  counter?: { at: At; to: number; label: Txt; sub?: Txt }; // a challenge: "100 shares … and the code goes public"
  final?: { icon?: string; text: Txt; at: At }; // the closing line
};

/**
 * The end card on the brand yellow: where to try it, an optional ask / challenge counter, the closing line,
 * the creator's mark. Also used, unchanged, as the cold-open teaser (a "prologue" scene with the same type).
 * The narrator rests, jumps once on the counter and waves twice on the closing line.
 */
export const EndingScene: React.FC = () => {
  const f = useF();
  const { vertical } = useV();
  const at = useAt();
  const font = useFont();
  const talk = useTalk();
  const pulse = usePulse();
  const c = useContent<EndingContent>();
  const product = at(c.productAt, 20);
  const ask = c.ask ? at(c.ask.at, 9999) : 9999;
  const hundred = c.counter ? at(c.counter.at, 9999) : 9999;
  const final = c.final ? at(c.final.at, 9999) : 9999;
  const count = c.counter ? Math.round(p(f, hundred - 10, 40, LINEAR) * c.counter.to) : 0;
  const big = p(f, hundred - 10, 20, BACK);
  const [state, since, times] = (f >= final ? ["waving", final, 2] : f >= hundred ? ["jumping", hundred, 1] : f >= ask ? ["waiting", ask, undefined] : ["review", 0, undefined]) as [NarratorState, number, number | undefined];
  const pill = (icon: string, label: Txt, a: number, key: React.Key) => (
    <Pop key={key} at={a}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, height: vertical ? 68 : 70, paddingInline: 24, borderRadius: 18, background: C.white, border: `2px solid ${C.ink}`, fontFamily: font, fontSize: vertical ? 30 : 33, fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>
        <Icon name={icon} size={32} color={C.ink} /> <Rich text={label} />
      </div>
    </Pop>
  );
  return (
    <Paper bg={C.yellow} dots={C.yellowDeep}>
      <AbsoluteFill style={{ flexDirection: vertical ? "column" : "row-reverse", alignItems: "center", justifyContent: "center", gap: vertical ? 30 : 70, padding: vertical ? "200px 60px 560px" : "0 110px 120px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          {HAS_NARRATOR ? <Narrator state={state} since={since} times={times} size={vertical ? 1.5 : 1.9} talk={talk} onYellow /> : <AppIcon size={vertical ? 180 : 220} backdrop />}
          <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: p(f, product - 6, 14) }}>
            {HAS_NARRATOR ? <AppIcon size={56} backdrop /> : null}
            <div style={{ fontFamily: FONT, fontSize: 46, fontWeight: 800, color: C.ink, letterSpacing: "-0.03em" }}>{PRODUCT.name}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: vertical ? 18 : 20 }}>
          {c.links?.length ? (
            <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", gap: 14, alignItems: "center" }}>
              {c.links.map((l, i) => {
                const a = at(l.at, product + 40 + i * 60) - 6;
                return f >= a ? pill(l.icon, l.text, a, i) : null;
              })}
            </div>
          ) : null}
          {c.ask && f >= ask - 6 ? pill(c.ask.icon ?? "Github", c.ask.text, ask - 6, "ask") : null}
          {c.counter && f >= hundred - 10 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: Math.min(1, big * 1.4), transform: `scale(${mix(0.7, 1, big) * (1 + pulse * 0.03)})` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, background: C.ink, color: C.yellow, borderRadius: 26, padding: vertical ? "10px 34px" : "8px 40px" }}>
                <div style={{ fontFamily: FONT, fontSize: vertical ? 130 : 140, fontWeight: 800, lineHeight: 1 }}>{count}</div>
                <div style={{ fontFamily: font, fontSize: vertical ? 46 : 50, fontWeight: 800 }}><Rich text={c.counter.label} /></div>
              </div>
              {c.counter.sub ? (
                <div style={{ fontFamily: font, fontSize: vertical ? 38 : 42, fontWeight: 800, color: C.ink, textAlign: "center", opacity: p(f, hundred + 30, 16) }}>
                  <Rich text={c.counter.sub} />
                </div>
              ) : null}
            </div>
          ) : null}
          {c.final && f >= final - 6 ? (
            <Pop at={final - 6}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: font, fontSize: vertical ? 36 : 40, fontWeight: 800, color: C.ink, textAlign: "center" }}>
                <Icon name={c.final.icon ?? "Heart"} size={40} color={C.ink} /> <span><Rich text={c.final.text} /></span>
              </div>
            </Pop>
          ) : null}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: vertical ? 300 : 40, display: "flex", justifyContent: "center", opacity: p(f, c.final ? final : c.counter ? hundred + 60 : product + 150, 20) }}>
        <BrandMark size={vertical ? 34 : 28} suffix={BRAND.site} />
      </div>
    </Paper>
  );
};
