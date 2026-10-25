import React from "react";
import { BACK, C, FONT, FONT_AR, mix, p, useF, useV } from "../theme";
import { Sun } from "../ui/common";

export type ChatItem = {
  at: number; // frame it appears
  from: "page" | "user";
  kind?: "text" | "card" | "image" | "typing";
  text?: string;
  until?: number; // typing indicator end
  card?: { title: string; subtitle: string; button: string };
  image?: React.ReactNode;
  badge?: string; // small numbered badge, e.g. "1"
  badgeAt?: number;
  highlight?: { at: number; text: string }; // marker over part of the text
};

export type ChatPlatform = "messenger" | "instagram" | "whatsapp" | "app";
const PLATFORM_LABEL: Record<ChatPlatform, string> = { messenger: "Messenger", instagram: "Instagram", whatsapp: "WhatsApp", app: "Chat" };

/**
 * A phone chat seen from the person messaging the page/bot. Messages appear at their frames; older ones
 * scroll up. Layout is left-to-right like the apps (page left, person right); the text follows the language.
 */
export const Chat: React.FC<{ platform: ChatPlatform; items: ChatItem[]; width: number; height: number; pageName: string; note?: string; label?: string }> = ({ platform, items, width, height, pageName, note, label }) => {
  const f = useF();
  const { rtl } = useV();
  const font = rtl ? FONT_AR : FONT;
  const ig = platform === "instagram";
  const wa = platform === "whatsapp";
  const userBg = ig ? "linear-gradient(135deg, #5B51F7, #A23BD8)" : wa ? "#D9FDD3" : platform === "app" ? C.ink : "#0A7CFF";
  const userText = wa ? "#111" : "#fff";
  const linkColor = ig ? "#5B51F7" : wa ? "#128C7E" : platform === "app" ? C.ink : "#0A7CFF";
  const s = width / 420;
  const visible = items.filter((it) => f >= it.at && !(it.kind === "typing" && it.until !== undefined && f >= it.until));
  return (
    <div dir="ltr" style={{ width, height, borderRadius: 46 * s, background: "#15130F", padding: 10 * s, boxSizing: "border-box", boxShadow: "0 30px 70px rgba(21,19,15,0.28)", flex: "none" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 38 * s, background: C.white, overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: FONT }}>
        <div style={{ height: 66 * s, display: "flex", alignItems: "center", gap: 10 * s, padding: `0 ${16 * s}px`, borderBottom: `1px solid #E8E8E8`, flex: "none" }}>
          <div style={{ width: 38 * s, height: 38 * s, borderRadius: "50%", background: C.paper, border: `1.5px solid ${C.line2}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sun size={18 * s} />
          </div>
          <div>
            <div style={{ fontSize: 16 * s, fontWeight: 700, color: "#111" }}>{pageName}</div>
            <div style={{ fontSize: 12 * s, color: "#888" }}>{label ?? PLATFORM_LABEL[platform]}</div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 10 * s, padding: 14 * s, overflow: "hidden" }}>
          {visible.map((it, i) => {
            const t = p(f, it.at, 12, BACK);
            const mine = it.from === "user";
            const bubble: React.CSSProperties = {
              maxWidth: "78%",
              padding: `${10 * s}px ${14 * s}px`,
              borderRadius: 20 * s,
              background: mine ? userBg : "#F0F0F0",
              color: mine ? userText : "#111",
              fontFamily: font,
              fontSize: 17 * s,
              lineHeight: 1.45,
              direction: rtl ? "rtl" : "ltr",
              textAlign: rtl ? "right" : "left",
              position: "relative",
            };
            let body: React.ReactNode = null;
            if (it.kind === "typing") {
              body = (
                <div style={{ ...bubble, display: "flex", gap: 6 * s, padding: `${14 * s}px ${16 * s}px` }}>
                  {[0, 1, 2].map((k) => (
                    <div key={k} style={{ width: 8 * s, height: 8 * s, borderRadius: "50%", background: "#999", opacity: 0.35 + 0.65 * Math.max(0, Math.sin((f - k * 4) / 4)) }} />
                  ))}
                </div>
              );
            } else if (it.kind === "card" && it.card) {
              body = (
                <div style={{ width: "78%", borderRadius: 18 * s, border: "1px solid #E2E2E2", overflow: "hidden", background: C.white, direction: rtl ? "rtl" : "ltr" }}>
                  <div style={{ padding: `${12 * s}px ${14 * s}px`, borderBottom: "1px solid #EEE" }}>
                    <div style={{ fontFamily: FONT, fontSize: 17 * s, fontWeight: 800, color: "#111", direction: "ltr", textAlign: rtl ? "right" : "left" }}>{it.card.title}</div>
                    <div style={{ fontFamily: font, fontSize: 15 * s, color: "#555", marginTop: 4 * s }}>{it.card.subtitle}</div>
                  </div>
                  <div style={{ padding: `${10 * s}px`, textAlign: "center", fontFamily: font, fontSize: 16 * s, fontWeight: 700, color: linkColor }}>{it.card.button}</div>
                </div>
              );
            } else if (it.kind === "image") {
              body = <div style={{ width: "70%", borderRadius: 18 * s, overflow: "hidden", border: "1px solid #DDD" }}>{it.image}</div>;
            } else {
              const hl = it.highlight ? p(f, it.highlight.at, 12) : 0;
              const parts = it.highlight && it.text ? it.text.split(it.highlight.text) : null;
              body = (
                <div style={bubble}>
                  {parts && parts.length === 2 ? (
                    <>
                      {parts[0]}
                      <span style={{ background: `rgba(255,224,74,${hl})`, color: hl > 0.5 && mine ? C.ink : undefined, borderRadius: 4, padding: "0 2px" }}>{it.highlight!.text}</span>
                      {parts[1]}
                    </>
                  ) : (
                    it.text
                  )}
                </div>
              );
            }
            const badge = it.badge && it.badgeAt !== undefined ? p(f, it.badgeAt, 12, BACK) : 0;
            return (
              <div key={i} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 * s, opacity: Math.min(1, t * 1.4), transform: `translateY(${(1 - t) * 18}px) scale(${mix(0.92, 1, t)})`, transformOrigin: mine ? "right bottom" : "left bottom" }}>
                {!mine ? (
                  <div style={{ width: 28 * s, height: 28 * s, borderRadius: "50%", background: C.paper, border: `1px solid ${C.line2}`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    <Sun size={13 * s} />
                  </div>
                ) : null}
                {body}
                {badge > 0 ? (
                  <div style={{ width: 30 * s, height: 30 * s, borderRadius: "50%", background: C.yellow, border: `2px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 * s, color: C.ink, transform: `scale(${badge})`, flex: "none" }}>{it.badge}</div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div style={{ height: 54 * s, display: "flex", alignItems: "center", padding: `0 ${14 * s}px`, borderTop: "1px solid #EEE", flex: "none" }}>
          <div style={{ flex: 1, height: 36 * s, borderRadius: 18 * s, background: "#F2F2F2", display: "flex", alignItems: "center", paddingInline: 14 * s, fontSize: 14 * s, color: "#999" }}>{note ?? "Aa"}</div>
        </div>
      </div>
    </div>
  );
};
