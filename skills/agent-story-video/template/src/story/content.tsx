import React from "react";
import storyboard from "../storyboard.json";
import { C, FONT, Lang, p, useF, useScene, useV } from "../theme";

/**
 * On-screen copy lives in storyboard.json, in each scene's "content". Any text field is either one string
 * (same in every language) or { "en": "…", "ar": "…" }. Inside a text, [[words]] get the yellow marker.
 * Timings refer to the scene's cue words from narration.json: "match", "match+10", "match-6", or a frame number.
 */
export type Txt = string | Partial<Record<Lang, string>>;
export type At = string | number;

const pick = (x: Txt | undefined, lang: Lang) => (x === undefined ? "" : typeof x === "string" ? x : x[lang] ?? x.en ?? x.ar ?? "");

/** Picks a text for the current language and strips the [[marker]] brackets. */
export const useT = () => {
  const { lang } = useV();
  return (x: Txt | undefined) => pick(x, lang).replace(/\[\[|\]\]/g, "");
};

/** The raw text for the current language (markers kept), for <Rich>. */
export const useRaw = () => {
  const { lang } = useV();
  return (x: Txt | undefined) => pick(x, lang);
};

/** Resolves a timing ("cue", "cue+10", 120) to a frame of the current scene; `fallback` when the cue word is missing. */
export const useAt = () => {
  const { cues } = useScene();
  return (at: At | undefined, fallback: number) => {
    if (at === undefined) return fallback;
    if (typeof at === "number") return at;
    const m = /^([^+-]+?)\s*([+-]\s*\d+)?$/.exec(at);
    if (!m) return fallback;
    const base = cues[m[1]];
    return base === undefined ? fallback : base + (m[2] ? parseInt(m[2].replace(/\s/g, ""), 10) : 0);
  };
};

/**
 * This scene's "content" object from storyboard.json. A scene without content borrows it from the scene named
 * in "contentFrom" — or, for a cold-open teaser, from its "musicFrom" scene (the ending it previews).
 */
type SceneDef = { id: string; content?: unknown; contentFrom?: string; musicFrom?: string };
export const useContent = <T,>() => {
  const { id } = useScene();
  const all = storyboard.scenes as SceneDef[];
  const s = all.find((x) => x.id === id);
  const from = s && !s.content ? s.contentFrom ?? s.musicFrom : undefined;
  return ((from ? all.find((x) => x.id === from)?.content : s?.content) ?? {}) as T;
};

/** Text with [[marked]] parts; the marker sweeps in at `at` (immediately when omitted). */
export const Rich: React.FC<{ text: Txt | undefined; at?: number; markColor?: string; markText?: string }> = ({ text, at, markColor = C.yellow, markText }) => {
  const raw = useRaw()(text);
  const { rtl } = useV();
  const f = useF();
  const t = at === undefined ? 1 : p(f, at, 14);
  const parts = raw.split(/(\[\[.*?\]\])/g).filter(Boolean);
  return (
    <>
      {parts.map((s, i) =>
        s.startsWith("[[") ? (
          <span
            key={i}
            style={{
              backgroundImage: `linear-gradient(${markColor}, ${markColor})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${t * 100}% 100%`,
              backgroundPosition: rtl ? "right center" : "left center",
              borderRadius: 8,
              padding: "0 0.18em",
              color: markText,
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
            }}
          >
            {s.slice(2, -2)}
          </span>
        ) : (
          <React.Fragment key={i}>{rtl ? <Bidi text={s} /> : s}</React.Fragment>
        ),
      )}
    </>
  );
};

// Latin runs inside Arabic (names, URLs, @handles, "Claude Code") are isolated left-to-right in the Latin font,
// so punctuation and word order around them stay correct.
const LATIN_RUN = /([A-Za-z0-9@#][A-Za-z0-9@#._\-\/:+&' ]*[A-Za-z0-9])/g;
const Bidi: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(LATIN_RUN).map((s, i) =>
      i % 2 === 1 ? (
        <span key={i} dir="ltr" style={{ fontFamily: FONT, unicodeBidi: "isolate" }}>{s}</span>
      ) : (
        <React.Fragment key={i}>{s}</React.Fragment>
      ),
    )}
  </>
);

/** Latin-only text (a URL, a command, a product name) — render it left-to-right inside Arabic layouts. */
export const isLatin = (s: string) => !/[؀-ۿ]/.test(s);
