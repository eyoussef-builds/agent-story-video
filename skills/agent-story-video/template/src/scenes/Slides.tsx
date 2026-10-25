import React from "react";
import { BACK, C, MONO, mix, p, useF, useV } from "../theme";
import { Icon, Paper } from "../ui/common";
import { HAS_NARRATOR } from "../story/Narrator";
import { Card, CheckRow, Pop, Tag, Terminal, useFont } from "../story/Bits";
import { Chat, ChatItem, ChatPlatform } from "../story/Chat";
import { SceneKicker } from "../story/Kicker";
import { Stage } from "../story/Stage";
import { Shot } from "../story/Shot";
import { SHOTS } from "../story/shots";
import { At, Rich, Txt, useAt, useContent, useT } from "../story/content";

/**
 * The general-purpose story scene: a sequence of slides, each one cross-fading in on its cue word, built from
 * blocks. Covers most beats of a behind-the-scenes story — the build montage (checklists + real screenshots),
 * testing (terminal output, feedback quote, fixes grid), the demo (a phone chat + tags), a punch line.
 * Write a custom scene only when a beat needs bespoke motion (see references/scenes.md).
 */
export type Block =
  | { type: "checklist"; title?: Txt; icon?: string; iconColor?: string; items: { text: Txt; at?: At }[] }
  | { type: "shot"; shot: string; width?: number; zoom?: { at: At; to: number; fx: number; fy: number; len?: number }; highlight?: { at: At; box: [number, number, number, number] } }
  | { type: "terminal"; title?: string; lines: string[]; at?: At; step?: number; size?: number }
  | { type: "tags"; items: { text: Txt; icon?: string; dark?: boolean; at?: At }[] }
  | { type: "quote"; text: Txt; icon?: string }
  | { type: "grid"; items: { icon: string; label: Txt }[]; at?: At; cols?: number }
  | { type: "headline"; text: Txt; at?: At; size?: number }
  | { type: "code"; file?: string; code: string; at?: At }
  | { type: "phone"; platform: ChatPlatform; pageName: string; label?: string; width?: number; height?: number; items: (Omit<ChatItem, "at" | "until" | "badgeAt" | "highlight" | "text"> & { at: At; until?: At; badgeAt?: At; text?: Txt; highlight?: { at: At; text: string } })[] }
  | { type: "compare"; left: { label?: Txt; text: Txt }; right: { label?: Txt; text: Txt }; bad?: At; good?: At; badLabel?: Txt }
  | { type: "note"; text: Txt; icon?: string }
  | { type: "stack"; row?: boolean; gap?: number; blocks: Block[] };

type SlidesContent = { slides: { at?: At; row?: boolean; gap?: number; blocks: Block[] }[]; callout?: { at: At; icon?: string; text: Txt }; height?: number };

const BlockView: React.FC<{ b: Block; W: number; start: number }> = ({ b, W, start }) => {
  const f = useF();
  const { vertical } = useV();
  const at = useAt();
  const t = useT();
  const font = useFont();
  switch (b.type) {
    case "checklist":
      return (
        <Card style={{ width: Math.min(W, vertical ? 860 : 760), padding: "30px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
          {b.title ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: font, fontSize: 32, fontWeight: 800, color: C.ink }}>
              {b.icon ? <Icon name={b.icon} size={34} color={b.iconColor ?? C.ink} /> : null} {t(b.title)}
            </div>
          ) : null}
          {b.items.map((it, i) => (
            <CheckRow key={i} at={at(it.at, start + 10 + i * 20)}>{t(it.text)}</CheckRow>
          ))}
        </Card>
      );
    case "shot": {
      const spec = SHOTS[b.shot];
      if (!spec) throw new Error(`Unknown shot "${b.shot}" — add it to src/story/shots.ts`);
      return (
        <Shot
          spec={spec}
          width={W * (b.width ?? 1)}
          zoom={b.zoom ? { at: at(b.zoom.at, start), to: b.zoom.to, fx: b.zoom.fx, fy: b.zoom.fy, len: b.zoom.len } : undefined}
          highlight={b.highlight ? { at: at(b.highlight.at, start + 30), box: b.highlight.box } : undefined}
        />
      );
    }
    case "terminal":
      return <Terminal at={at(b.at, start + 6)} step={b.step ?? 4} width={Math.min(W, vertical ? 940 : 1100)} title={b.title} size={b.size ?? (vertical ? 19 : 22)} lines={b.lines} />;
    case "tags":
      return (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, maxWidth: W }}>
          {b.items.map((it, i) => {
            const a = at(it.at, start + 6 + i * 12) - 4;
            return f >= a ? <Pop key={i} at={a}><Tag dark={it.dark} icon={it.icon} style={{ height: 46, fontSize: 23 }}>{t(it.text)}</Tag></Pop> : null;
          })}
        </div>
      );
    case "quote":
      return (
        <Card style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 26px", background: C.ink, border: "none" }}>
          <Icon name={b.icon ?? "MessageSquareQuote"} size={34} color={C.yellow} />
          <div style={{ fontFamily: font, fontSize: vertical ? 34 : 36, fontWeight: 800, color: C.paper }}>{t(b.text)}</div>
        </Card>
      );
    case "grid": {
      const a0 = at(b.at, start + 10);
      const cols = b.cols ?? (vertical ? 2 : Math.min(4, b.items.length));
      return (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
          {b.items.map((it, i) => {
            const tt = p(f, a0 + i * 14, 16, BACK);
            return (
              <Card key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "22px 18px", width: vertical ? 440 : Math.min(300, (W - 16 * (cols - 1)) / cols), opacity: Math.min(1, tt * 1.4), transform: `scale(${mix(0.8, 1, tt)})` }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: C.yellow, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={it.icon} size={34} color={C.ink} />
                </div>
                <div style={{ fontFamily: font, fontSize: 28, fontWeight: 700, color: C.ink, textAlign: "center" }}>{t(it.label)}</div>
              </Card>
            );
          })}
        </div>
      );
    }
    case "headline": {
      const a = at(b.at, start);
      const tt = p(f, a, 18, BACK);
      return (
        <div style={{ fontFamily: font, fontSize: b.size ?? (vertical ? 64 : 76), fontWeight: 800, color: C.ink, textAlign: "center", lineHeight: 1.3, maxWidth: W, opacity: Math.min(1, tt * 1.4), transform: `scale(${mix(0.85, 1, tt)})` }}>
          <Rich text={b.text} at={a + 10} />
        </div>
      );
    }
    case "code":
      return (
        <div dir="ltr" style={{ borderRadius: 14, background: "#1F1F1F", padding: "14px 20px", fontFamily: MONO, fontSize: vertical ? 17 : 19, color: "#E6E6E6", maxWidth: Math.min(W, vertical ? 960 : 1100), opacity: p(f, at(b.at, start) - 6, 14), whiteSpace: "pre-wrap" }}>
          {b.file ? <div style={{ color: "#8A8A8A", fontSize: 15, marginBottom: 6 }}>{b.file}</div> : null}
          {b.code}
        </div>
      );
    case "phone": {
      const items: ChatItem[] = b.items.map((it, i) => ({
        ...it,
        text: it.text === undefined ? undefined : t(it.text),
        at: at(it.at, start + 10 + i * 30),
        until: it.until === undefined ? undefined : at(it.until, start + 40 + i * 30),
        badgeAt: it.badgeAt === undefined ? undefined : at(it.badgeAt, start + 60),
        highlight: it.highlight ? { at: at(it.highlight.at, start + 20), text: it.highlight.text } : undefined,
      }));
      return <Chat platform={b.platform} pageName={b.pageName} label={b.label} width={b.width ?? (vertical ? 640 : 470)} height={b.height ?? (vertical ? 960 : 800)} items={items} />;
    }
    case "compare": {
      const bad = b.bad === undefined ? 0 : p(f, at(b.bad, 9999), 12) - (b.good === undefined ? 0 : p(f, at(b.good, 9999), 12));
      const good = b.good === undefined ? 0 : p(f, at(b.good, 9999) + 8, 14, BACK);
      const side = (x: { label?: Txt; text: Txt }, i: number) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          {x.label ? <div style={{ fontFamily: font, fontSize: 22, fontWeight: 700, color: C.stone }}>{t(x.label)}</div> : null}
          <Card style={{ padding: "18px 28px", maxWidth: vertical ? 900 : 620, border: i === 0 ? `2.5px solid ${C.ink}` : undefined, background: i === 0 ? C.yellow : C.white }}>
            <div style={{ fontFamily: font, fontSize: vertical ? 36 : 38, fontWeight: 700, color: C.ink, textAlign: "center" }}><Rich text={x.text} /></div>
          </Card>
        </div>
      );
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "center", gap: vertical ? 20 : 36 }}>
            {side(b.left, 0)}
            <div style={{ width: 90, height: 90, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: good > 0.5 ? C.yellow : bad > 0.5 ? "#F4D8D2" : C.paper3, border: `2.5px solid ${good > 0.5 ? C.ink : C.line2}`, transform: `scale(${1 + good * 0.12})`, flex: "none" }}>
              <Icon name={good > 0.5 ? "Check" : bad > 0.5 ? "X" : "Equal"} size={50} color={good > 0.5 ? C.ink : bad > 0.5 ? "#B5402B" : C.stone} stroke={3} />
            </div>
            {side(b.right, 1)}
          </div>
          {b.badLabel && bad > 0.05 ? <Tag dark icon="SearchX" style={{ opacity: bad, height: 46, fontSize: 24 }}>{t(b.badLabel)}</Tag> : null}
        </div>
      );
    }
    case "note":
      return <Tag icon={b.icon ?? "Info"} style={{ background: C.paper3 }}>{t(b.text)}</Tag>;
    case "stack":
      return (
        <div style={{ display: "flex", flexDirection: b.row && !vertical ? "row" : "column", alignItems: "center", justifyContent: "center", gap: b.gap ?? 20 }}>
          {b.blocks.map((x, i) => (
            <BlockView key={i} b={x} W={b.row && !vertical ? W / b.blocks.length : W} start={start} />
          ))}
        </div>
      );
  }
};

export const SlidesScene: React.FC = () => {
  const f = useF();
  const { vertical } = useV();
  const at = useAt();
  const t = useT();
  const font = useFont();
  const c = useContent<SlidesContent>();
  const W = vertical ? 960 : HAS_NARRATOR ? 1300 : 1560;
  const H = c.height ?? (vertical ? 1000 : 720);
  const starts = c.slides.map((s, i) => (i === 0 ? at(s.at, 0) : at(s.at, 60 + i * 120)) - (i === 0 ? 0 : 8));
  const show = (i: number) => (i === 0 ? 1 : p(f, starts[i], 14)) - (i < c.slides.length - 1 ? p(f, starts[i + 1], 14) : 0);
  const callout = c.callout ? p(f, at(c.callout.at, 9999) - 4, 16) : 0;
  return (
    <Paper>
      <SceneKicker />
      <Stage>
        <div style={{ position: "relative", width: W, height: H }}>
          {c.slides.map((s, i) => {
            const tt = show(i);
            if (tt <= 0.001) return null;
            return (
              <div key={i} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: s.row && !vertical ? "row" : "column", alignItems: "center", justifyContent: "center", gap: s.gap ?? (vertical ? 24 : 30), opacity: tt, transform: `scale(${mix(0.96, 1, tt)})` }}>
                {s.blocks.map((b, j) => (
                  <BlockView key={j} b={b} W={s.row && !vertical ? W / s.blocks.length - 30 : W} start={Math.max(0, starts[i])} />
                ))}
              </div>
            );
          })}
          {c.callout && callout > 0.01 ? (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: vertical ? -40 : 0, display: "flex", justifyContent: "center", opacity: callout, transform: `translateY(${(1 - callout) * 30}px)` }}>
              <Card style={{ display: "flex", alignItems: "center", gap: 16, border: `2.5px solid ${C.ink}`, padding: "16px 24px" }}>
                <Icon name={c.callout.icon ?? "Hand"} size={36} color={C.ink} />
                <div style={{ fontFamily: font, fontSize: 30, fontWeight: 800, color: C.ink }}>{t(c.callout.text)}</div>
              </Card>
            </div>
          ) : null}
        </div>
      </Stage>
    </Paper>
  );
};
