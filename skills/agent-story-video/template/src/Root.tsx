import React from "react";
import { Composition } from "remotion";
import { PLAN } from "./timeline";
import { StoryVideo } from "./StoryVideo";

import storyboard from "./storyboard.json";
import type { Lang } from "./theme";

// One 16:9 and one 9:16 composition per language in storyboard.langs: en-landscape, ar-vertical, …
const LANGS = ((storyboard as { langs?: Lang[] }).langs ?? ["en", "ar"]) as Lang[];
export const VARIANTS = LANGS.flatMap((lang) => [
  { id: `${lang}-landscape`, lang, vertical: false },
  { id: `${lang}-vertical`, lang, vertical: true },
]);

export const Root: React.FC = () => (
  <>
    {VARIANTS.map((v) => (
      <Composition key={v.id} id={v.id} component={StoryVideo} durationInFrames={PLAN.total} fps={PLAN.fps} width={v.vertical ? 1080 : 1920} height={v.vertical ? 1920 : 1080} defaultProps={{ lang: v.lang, vertical: v.vertical }} />
    ))}
  </>
);
