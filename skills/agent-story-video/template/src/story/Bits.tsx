import React from "react";
import { BACK, C, FONT, FONT_AR, MONO, mix, p, useF, useV } from "../theme";

/** The heading/body font for the current language. */
export const useFont = () => (useV().rtl ? FONT_AR : FONT);
import { Icon } from "../ui/common";

/** Chapter pill shown at the top of each scene: "3 · The question that started it". */
export const Kicker: React.FC<{ n: number; text: string }> = ({ n, text }) => {
  const f = useF();
  const { vertical } = useV();
  const font = useFont();
  const t = p(f, 2, 18);
  return (
    <div style={{ position: "absolute", top: vertical ? 170 : 54, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: t, transform: `translateY(${(1 - t) * -12}px)`, zIndex: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, height: vertical ? 56 : 50, paddingInline: 8, paddingInlineEnd: 20, borderRadius: 14, background: C.ink, color: C.paper, fontFamily: font, fontSize: vertical ? 27 : 24, fontWeight: 700 }}>
        <div style={{ width: vertical ? 40 : 36, height: vertical ? 40 : 36, borderRadius: 10, background: C.yellow, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800 }}>{n}</div>
        {text}
      </div>
    </div>
  );
};

/** Small label tag, e.g. "Real tests" or "Paraphrased conversation". */
export const Tag: React.FC<{ children: React.ReactNode; dark?: boolean; icon?: string; style?: React.CSSProperties }> = ({ children, dark, icon, style }) => {
  const font = useFont();
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, paddingInline: 14, borderRadius: 10, background: dark ? C.ink : C.yellow, color: dark ? C.yellow : C.ink, fontFamily: font, fontSize: 21, fontWeight: 700, whiteSpace: "nowrap", ...style }}>
      {icon ? <Icon name={icon} size={20} color={dark ? C.yellow : C.ink} /> : null}
      {children}
    </div>
  );
};

/** A white card that pops in at `at`. */
export const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; from?: "up" | "down" | "none" }> = ({ at, children, style, from = "up" }) => {
  const f = useF();
  const t = p(f, at, 18, BACK);
  return (
    <div style={{ opacity: Math.min(1, t * 1.5), transform: `translateY(${from === "up" ? (1 - t) * 30 : from === "down" ? (t - 1) * 30 : 0}px) scale(${mix(0.9, 1, t)})`, ...style }}>{children}</div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; dark?: boolean }> = ({ children, style, dark }) => (
  <div style={{ borderRadius: 22, background: dark ? C.night2 : C.white, border: `1.5px solid ${dark ? "#3B3428" : C.line2}`, boxShadow: "0 18px 44px rgba(21,19,15,0.10)", padding: "22px 26px", boxSizing: "border-box", ...style }}>{children}</div>
);

/** A checklist row that ticks at `at`. */
export const CheckRow: React.FC<{ at: number; children: React.ReactNode; size?: number }> = ({ at, children, size = 28 }) => {
  const f = useF();
  const font = useFont();
  const t = p(f, at, 14, BACK);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: font, fontSize: size, fontWeight: 600, color: t > 0.2 ? C.ink : C.stone, opacity: mix(0.45, 1, Math.min(1, t)) }}>
      <div style={{ width: size * 1.3, height: size * 1.3, borderRadius: size * 0.35, background: t > 0.2 ? C.yellow : C.paper3, border: `2px solid ${t > 0.2 ? C.ink : C.line2}`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", transform: `scale(${mix(0.8, 1, Math.min(1, t))})` }}>
        {t > 0.2 ? <Icon name="Check" size={size * 0.85} color={C.ink} stroke={3} /> : null}
      </div>
      {children}
    </div>
  );
};

/** Terminal box with lines revealed one by one from `at`. */
export const Terminal: React.FC<{ at: number; lines: string[]; width: number; title?: string; step?: number; size?: number }> = ({ at, lines, width, title = "Terminal", step = 5, size = 22 }) => {
  const f = useF();
  return (
    <div dir="ltr" style={{ width, borderRadius: 16, overflow: "hidden", background: "#1F1F1F", border: "1px solid #3B3B3B", boxShadow: "0 26px 60px rgba(21,19,15,0.25)" }}>
      <div style={{ height: 36, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", background: "#2B2B2B" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
        ))}
        <div style={{ flex: 1, textAlign: "center", fontFamily: FONT, fontSize: 14, color: "#9C9C9C", marginRight: 50 }}>{title}</div>
      </div>
      <div style={{ padding: "16px 20px", fontFamily: MONO, fontSize: size, lineHeight: 1.6 }}>
        {lines.map((l, i) => {
          const a = at + i * step;
          if (f < a) return null;
          const color = l.startsWith("# pass") || l.startsWith("✓") ? "#7EE2A8" : l.startsWith("# fail") ? "#E6E6E6" : l.startsWith("$") ? C.yellow : l.startsWith("ok") ? "#9ADBB5" : "#CFCFCF";
          return (
            <div key={i} style={{ color, whiteSpace: "pre", opacity: p(f, a, 6), fontWeight: l.startsWith("# pass") ? 800 : 400, fontSize: l.startsWith("# pass") ? size * 1.5 : size }}>
              {l}
            </div>
          );
        })}
      </div>
    </div>
  );
};
