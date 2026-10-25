import React from "react";
import storyboard from "../storyboard.json";
import { useScene } from "../theme";
import { Kicker } from "./Bits";
import { Txt, useT } from "./content";

type S = { id: string; prologue?: boolean; content?: { kicker?: Txt; kickerN?: number } };

/** The chapter pill from content.kicker, numbered by its place among the story's chaptered scenes. */
export const SceneKicker: React.FC = () => {
  const { id } = useScene();
  const t = useT();
  const all = (storyboard.scenes as S[]).filter((s) => !s.prologue && s.content?.kicker !== undefined);
  const i = all.findIndex((s) => s.id === id);
  const me = (storyboard.scenes as S[]).find((s) => s.id === id);
  if (!me?.content?.kicker) return null;
  return <Kicker n={me.content.kickerN ?? i + 1} text={t(me.content.kicker)} />;
};
