import React from "react";
import { BACK, C, FONT, mix, p, useF, useV } from "../theme";
import { Icon, Paper } from "../ui/common";
import { NarratorFace } from "../story/Narrator";
import { Card, CheckRow, Tag, useFont } from "../story/Bits";
import { SceneKicker } from "../story/Kicker";
import { Stage } from "../story/Stage";
import { At, Rich, Txt, useAt, useContent, useT } from "../story/content";

type QuestionsContent = {
  chip?: { at: At; icon?: string; text: Txt }; // e.g. the skill or method used: "github.com/…/planning-skill"
  questions: { q: Txt; a: Txt; at: At }[]; // 2–4 real questions and the answers the human gave
  plan?: { at: At; title: Txt; icon?: string; items: { text: Txt; at?: At }[] }; // the agreed spec that came out of them
  note?: { text: Txt; icon?: string };
};

/** Asking before building: question cards with the human's answers, then the agreed plan as a checklist. */
export const QuestionsScene: React.FC = () => {
  const f = useF();
  const { vertical } = useV();
  const at = useAt();
  const t = useT();
  const font = useFont();
  const c = useContent<QuestionsContent>();
  const qs = c.questions.map((q, i) => at(q.at, 60 + i * 60));
  const planAt = c.plan ? at(c.plan.at, 330) : 99999;
  const fade = p(f, planAt - 6, 16);
  const tPlan = p(f, planAt - 4, 20, BACK);
  const cols = !vertical && c.questions.length > 1 ? 2 : 1;
  return (
    <Paper>
      <SceneKicker />
      <Stage gap={26}>
        {c.chip ? (
          <div dir="ltr" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderRadius: 14, background: C.white, border: `1.5px solid ${C.line2}`, opacity: p(f, at(c.chip.at, 20) - 6, 14), fontFamily: FONT, fontSize: vertical ? 24 : 22, fontWeight: 700, color: C.ink }}>
            <Icon name={c.chip.icon ?? "Github"} size={24} color={C.ink} /> <Rich text={c.chip.text} />
          </div>
        ) : null}
        <div style={{ position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: vertical ? 16 : 22, opacity: mix(1, 0.18, fade), filter: `blur(${fade * 2}px)` }}>
            {c.questions.map((q, i) => {
              const tq = p(f, qs[i] - 4, 14, BACK);
              const ta = p(f, Math.min(qs[i] + 34, (qs[i + 1] ?? planAt) - 6), 14, BACK);
              return (
                <Card key={i} style={{ width: vertical ? 940 : 640, display: "flex", flexDirection: "column", gap: 12, padding: "18px 20px", opacity: Math.min(1, tq * 1.4), transform: `scale(${mix(0.88, 1, tq)})` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <NarratorFace size={46} />
                    <div style={{ fontFamily: font, fontSize: vertical ? 29 : 27, fontWeight: 700, color: C.ink }}>{t(q.q)}</div>
                  </div>
                  <div style={{ alignSelf: "flex-end", opacity: ta, transform: `translateY(${(1 - ta) * 10}px)` }}>
                    <Tag dark>{t(q.a)}</Tag>
                  </div>
                </Card>
              );
            })}
          </div>
          {c.plan && f >= planAt - 6 ? (
            <div style={{ position: "absolute", inset: vertical ? 0 : "-40px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Card style={{ width: vertical ? 820 : 700, padding: "28px 34px", border: `2.5px solid ${C.ink}`, opacity: Math.min(1, tPlan * 1.4), transform: `scale(${mix(0.85, 1, tPlan)})`, display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: font, fontSize: 34, fontWeight: 800, color: C.ink }}>
                  <Icon name={c.plan.icon ?? "ClipboardCheck"} size={34} color={C.ink} /> {t(c.plan.title)}
                </div>
                {c.plan.items.map((s, i) => (
                  <CheckRow key={i} at={at(s.at, planAt + 20 + i * 25)} size={vertical ? 30 : 29}>{t(s.text)}</CheckRow>
                ))}
              </Card>
            </div>
          ) : null}
        </div>
        {c.note ? <Tag icon={c.note.icon ?? "Quote"} style={{ background: C.paper3, opacity: mix(1, 0, fade) }}>{t(c.note.text)}</Tag> : null}
      </Stage>
    </Paper>
  );
};
