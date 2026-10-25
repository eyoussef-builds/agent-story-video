import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import * as Lucide from "lucide-react";
import { BRAND, C, FONT, GRAD, IN_OUT, ON_ACCENT, PRODUCT, heading, p, useF, usePulse, useV } from "../theme";
/** Headline part: plain text, or { hl } for the yellow marker. */
export type Part = string | { hl: string };

/** Brand paper background with a slowly drifting dot grid whose dots kick on the music's beats. */
export const Paper: React.FC<{ children?: React.ReactNode; bg?: string; dots?: string }> = ({ children, bg = C.paper, dots = C.line }) => {
  const frame = useCurrentFrame();
  const r = 1.7 + usePulse() * 1.3;
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${dots} ${r}px, transparent ${r + 0.2}px)`,
          backgroundSize: "36px 36px",
          backgroundPosition: `${frame * 0.3}px ${frame * 0.18}px`,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

/** The creator's logo mark: brand.json "logo" — "sun" (a yellow dot with an ink ring) or an image file in public/. */
export const Sun: React.FC<{ size: number; fill?: string }> = ({ size, fill = C.yellow }) =>
  BRAND.logo && BRAND.logo !== "sun" ? (
    <Img src={staticFile(BRAND.logo)} style={{ width: size, height: size, flex: "none", objectFit: "contain" }} />
  ) : (
  <div
    style={{
      width: size,
      height: size,
      flex: "none",
      borderRadius: "50%",
      background: fill,
      boxShadow: `inset 0 0 0 ${Math.min(6, Math.max(1.5, size * 0.107))}px ${C.ink}`,
    }}
  />
);

export const BrandMark: React.FC<{ size: number; color?: string; suffix?: string }> = ({ size, color = C.ink, suffix }) => (
  <div dir="ltr" style={{ display: "flex", alignItems: "center", gap: size * 0.53, fontFamily: FONT, color }}>
    <Sun size={size * 0.74} />
    <span style={{ fontSize: size, fontWeight: 700, letterSpacing: "-0.01em" }}>{BRAND.name}</span>
    {suffix ? <span style={{ fontSize: size, fontWeight: 500, opacity: 0.7 }}>· {suffix}</span> : null}
  </div>
);

/**
 * The product's icon from public/ (storyboard.product.icon), or a lettered tile in the product colours.
 * `backdrop` (used on the yellow intro sun and end card) puts a light icon on a white tile when
 * storyboard.product.iconBackdrop is true, so a yellow icon doesn't vanish into the yellow brand.
 */
export const AppIcon: React.FC<{ size: number; style?: React.CSSProperties; backdrop?: boolean }> = ({ size, style, backdrop }) => {
  if (PRODUCT.icon && backdrop && (PRODUCT as { iconBackdrop?: boolean }).iconBackdrop) {
    return (
      <div style={{ width: size, height: size, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
        <div style={{ width: size * 0.84, height: size * 0.84, borderRadius: size * 0.22, background: C.white, border: `${Math.max(2, size * 0.012)}px solid ${C.ink}`, boxShadow: `0 ${size * 0.05}px ${size * 0.12}px rgba(21,19,15,0.16)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile(PRODUCT.icon)} style={{ width: size * 0.66, height: size * 0.66, objectFit: "contain" }} />
        </div>
      </div>
    );
  }
  if (PRODUCT.icon) return <Img src={staticFile(PRODUCT.icon)} style={{ width: size, height: size, flex: "none", objectFit: "contain", ...style }} />;
  const letters = PRODUCT.name
    .split(/[\s-]+/)
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div style={{ width: size, height: size, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
      <div
        style={{
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: size * 0.2,
          background: GRAD,
          boxShadow: `0 ${size * 0.05}px ${size * 0.12}px rgba(21,19,15,0.18)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ON_ACCENT,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: size * 0.34,
          letterSpacing: "-0.03em",
        }}
      >
        {letters}
      </div>
    </div>
  );
};

/** A lucide icon by PascalCase name ("Sparkles", "Terminal"…), or the product icon for "AppIcon". */
export const Icon: React.FC<{ name: string; size: number; color?: string; stroke?: number }> = ({ name, size, color = "currentColor", stroke = 2 }) => {
  if (name === "AppIcon") return <AppIcon size={size} />;
  const Cmp = (Lucide as unknown as Record<string, React.FC<{ size: number; color: string; strokeWidth: number }>>)[name] ?? Lucide.Sparkles;
  return <Cmp size={size} color={color} strokeWidth={stroke} />;
};

/** Word-by-word headline. `{ hl }` parts get a yellow marker that sweeps in the reading direction. */
export const Headline: React.FC<{
  parts: Part[];
  start: number;
  size: number;
  color?: string;
  weight?: number;
  align?: "start" | "center";
  maxWidth?: number;
  stagger?: number;
  hlBg?: string;
  hlText?: string;
  /** Frame at which the marker sweeps in (default: just after the last word lands). */
  hlAt?: number;
  style?: React.CSSProperties;
}> = ({ parts, start, size, color = C.ink, weight = 700, align = "start", maxWidth, stagger = 3, hlBg = C.yellow, hlText, hlAt, style }) => {
  const f = useF();
  const { rtl } = useV();
  const tokens: { text: string; hl: boolean }[] = [];
  for (const part of parts) {
    if (typeof part === "string") part.split(" ").filter(Boolean).forEach((w) => tokens.push({ text: w, hl: false }));
    else tokens.push({ text: part.hl, hl: true });
  }
  const marker = p(f, hlAt ?? start + tokens.length * stagger + 8, 16, IN_OUT);
  return (
    <div style={{ ...heading(rtl, size), fontWeight: weight, color, maxWidth, textAlign: align === "center" ? "center" : rtl ? "right" : "left", ...style }}>
      {tokens.map((tok, i) => {
        const t = p(f, start + i * stagger, 22);
        const inner = tok.hl ? (
          <span
            style={{
              display: "inline-block",
              whiteSpace: "nowrap",
              padding: "0 0.14em",
              margin: "0 -0.04em",
              borderRadius: "0.14em",
              backgroundImage: `linear-gradient(${hlBg}, ${hlBg})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${marker * 100}% 100%`,
              backgroundPosition: rtl ? "right center" : "left center",
              color: hlText ?? color,
            }}
          >
            {tok.text}
          </span>
        ) : (
          tok.text
        );
        return (
          <React.Fragment key={i}>
            {i > 0 ? " " : null}
            {/* Plain words sit above marked ones: Arabic descenders (a final ي's dots, ع's tail) reach into the
                next line, and a marker there must not paint over them. */}
            <span style={{ display: "inline-block", position: "relative", zIndex: tok.hl ? 0 : 1, opacity: t, transform: `translateY(${(1 - t) * 0.42}em)` }}>{inner}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const Pill: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number; border?: string; style?: React.CSSProperties }> = ({
  children,
  bg = C.paper3,
  color = C.ink,
  size = 26,
  border,
  style,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.4,
      paddingInline: size * 0.7,
      height: size * 2.1,
      borderRadius: size * 0.42,
      background: bg,
      color,
      border,
      fontSize: size,
      fontWeight: 600,
      whiteSpace: "nowrap",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

/** A physical Mac key; turns yellow while pressed. */
export const Keycap: React.FC<{ sym: string; size: number; pressed: number }> = ({ sym, size, pressed }) => {
  const label = ({ "⌃": "control", "⌥": "option", "⌘": "command", "⇧": "shift" } as Record<string, string>)[sym];
  const on = pressed > 0.5;
  return (
    <div
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: size * 0.17,
        background: on ? C.yellow : C.white,
        border: `2px solid ${on ? C.ink : C.line2}`,
        boxShadow: `0 ${(1 - pressed) * size * 0.07 + 1}px 0 ${on ? C.ink : C.line2}`,
        transform: `translateY(${pressed * size * 0.06}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: `${FONT}, "Apple Symbols"`,
        color: C.ink,
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: size * (label ? 0.34 : 0.42), fontWeight: 700, lineHeight: 1 }}>{sym}</div>
      {label ? <div style={{ fontSize: size * 0.15, color: C.stone, marginTop: size * 0.08, fontWeight: 600, fontFamily: FONT }}>{label}</div> : null}
    </div>
  );
};

/** Grey placeholder text line used inside mini illustrations. */
export const Bar: React.FC<{ w: string | number; h?: number; color?: string; style?: React.CSSProperties }> = ({ w, h = 12, color = C.line2, style }) => (
  <div style={{ width: w, height: h, borderRadius: h / 2, background: color, ...style }} />
);
