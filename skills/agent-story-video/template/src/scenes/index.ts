import type React from "react";
import { DialogScene } from "./Dialog";
import { EndingScene } from "./Ending";
import { IntroScene } from "./Intro";
import { QuestionsScene } from "./Questions";
import { RewindScene } from "./Rewind";
import { SlidesScene } from "./Slides";

/** Scene types for storyboard.json. Add custom scenes here (src/scenes/custom/…), keyed by their type name. */
export const SCENE_TYPES: Record<string, React.FC> = {
  intro: IntroScene,
  dialog: DialogScene,
  questions: QuestionsScene,
  slides: SlidesScene,
  ending: EndingScene,
  rewind: RewindScene,
};
