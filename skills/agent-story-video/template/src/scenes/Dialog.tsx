import React from "react";
import { BACK, C, FONT, mix, p, useF, useV } from "../theme";
import { Icon, Paper, Sun } from "../ui/common";
import { NarratorFace } from "../story/Narrator";
import { Card, Tag, useFont } from "../story/Bits";
import { SceneKicker } from "../story/Kicker";
import { Stage } from "../story/Stage";
import { At, Rich, Txt, useAt, useContent, useT } from "../story/content";

type DialogContent = {
  window?: { icon?: string; title: string }; // the tool the conversation happened in, e.g. "Codex", "Claude Code"
  messages: { who: "human" | "agent"; text: Txt; at: At; strike?: { at: At; label?: Txt } }[];
  flow?: { at: At; nodes: Txt[]; tag?: { at: At; text: Txt; icon?: string } }; // a small diagram beside the chat
  note?: { text: Txt; icon?: string }; // e.g. "Paraphrased conversation" — say so when it isn't verbatim
};

const Bubble: React.FC<{ who: "human" | "agent"; at: number; children: React.ReactNode; strike?: number; size: number }> = ({ who, at, children, strike = 0, size }) => {
  const f = useF();
  const font = useFont();
  const t = p(f, at, 14, BACK);
  if (f < at) return null;
  const me = who === "human";
  return (
    <div style={{ display: "flex", flexDirection: me ? "row" : "row-reverse", alignItems: "flex-end", gap: 12, alignSelf: me ? "flex-start" : "flex-end", opacity: Math.min(1, t * 1.4), transform: `translateY(${(1 - t) * 16}px)` }}>
      {me ? (
        <div style={{ width: size * 1.7, height: size * 1.7, borderRadius: "50%", background: C.paper, border: `1.5px solid ${C.line2}`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Sun size={size * 0.8} />
        </div>
      ) : (
        <NarratorFace size={size * 1.7} />
      )}
      <div style={{ position: "relative", maxWidth: size * 22, padding: "12px 18px", borderRadius: 18, background: me ? C.ink : C.white, color: me ? C.paper : C.ink, border: me ? "none" : `1.5px solid ${C.line2}`, fontFamily: font, fontSize: size, fontWeight: 600, lineHeight: 1.45 }}>
        <span style={{ textDecorationLine: strike > 0.5 ? "line-through" : "none", textDecorationThickness: 3, opacity: mix(1, 0.55, strike) }}>{children}</span>
      </div>
    </div>
  );
};

/** The conversation that started (or turned) the story: the human's ask, the agent's answers — a wrong one struck through. */
export const DialogScene: React.FC = () => {
  const f = useF();
  const { vertical } = useV();
  const at = useAt();
  const t = useT();
  const font = useFont();
  const c = useContent<DialogContent>();
  const fs = vertical ? 30 : 27;
  const flowAt = c.flow ? at(c.flow.at, 200) : 0;
  return (
    <Paper>
      <SceneKicker />
      <Stage row={!!c.flow} gap={vertical ? 34 : 50}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <Card style={{ width: vertical ? 960 : c.flow ? 760 : 1000, display: "flex", flexDirection: "column", gap: 16, padding: "22px 24px" }}>
            {c.window ? (
              <div dir="ltr" style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FONT, fontSize: 18, fontWeight: 700, color: C.stone }}>
                <Icon name={c.window.icon ?? "Terminal"} size={20} color={C.stone} /> {c.window.title}
              </div>
            ) : null}
            {c.messages.map((m, i) => {
              const strike = m.strike ? p(f, at(m.strike.at, 9999), 12) : 0;
              const bubble = (
                <Bubble key={i} who={m.who} at={at(m.at, 30 + i * 80)} size={fs} strike={strike}>
                  <Rich text={m.text} />
                </Bubble>
              );
              if (!m.strike?.label) return bubble;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, alignSelf: m.who === "agent" ? "flex-end" : "flex-start" }}>
                  {strike > 0.05 ? <Tag dark style={{ opacity: strike }}>{t(m.strike.label)}</Tag> : null}
                  {bubble}
                </div>
              );
            })}
          </Card>
          {c.note ? <Tag icon={c.note.icon ?? "Quote"} style={{ background: C.paper3 }}>{t(c.note.text)}</Tag> : null}
        </div>
        {c.flow ? (
          <div style={{ display: "flex", flexDirection: vertical ? "row" : "column", alignItems: "center", gap: vertical ? 8 : 14, opacity: p(f, flowAt - 6, 10), position: "relative" }}>
            {c.flow.nodes.map((n, i) => {
              const tt = p(f, flowAt + i * 12, 16, BACK);
              return (
                <React.Fragment key={i}>
                  {i > 0 ? <div style={{ transform: vertical ? "scaleX(-1)" : "rotate(90deg)", opacity: tt }}><Icon name="ArrowRight" size={vertical ? 26 : 34} color={C.stone} /></div> : null}
                  <div style={{ minWidth: vertical ? 0 : 300, flex: vertical ? 1 : undefined, padding: vertical ? "14px 10px" : "16px 22px", borderRadius: 16, background: i === 0 ? C.yellow : C.white, border: `2px solid ${i === 0 ? C.ink : C.line2}`, fontFamily: font, fontSize: vertical ? 22 : 28, fontWeight: 700, textAlign: "center", color: C.ink, opacity: Math.min(1, tt * 1.4), transform: `scale(${mix(0.8, 1, tt)})` }}>
                    {t(n)}
                  </div>
                </React.Fragment>
              );
            })}
            {c.flow.tag && f >= at(c.flow.tag.at, flowAt + 60) ? (
              <div style={{ opacity: p(f, at(c.flow.tag.at, flowAt + 60), 14), marginTop: vertical ? 0 : 8, position: vertical ? "absolute" : "static", top: vertical ? 110 : undefined }}>
                <Tag dark icon={c.flow.tag.icon ?? "ShieldCheck"}>{t(c.flow.tag.text)}</Tag>
              </div>
            ) : null}
          </div>
        ) : null}
      </Stage>
    </Paper>
  );
};
