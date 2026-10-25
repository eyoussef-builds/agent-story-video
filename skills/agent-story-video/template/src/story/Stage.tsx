import React from "react";
import { AbsoluteFill } from "remotion";
import { useV } from "../theme";
import { HAS_NARRATOR } from "./Narrator";

/**
 * The scene's content area, leaving room for the chapter pill (top), the narrator (bottom start corner) and
 * captions (bottom). 16:9: x 100–1610, y 130–930 (x 100–1820 with no narrator). 9:16: x 60–1020, y 250–1320.
 */
export const Stage: React.FC<{ children: React.ReactNode; gap?: number; row?: boolean; style?: React.CSSProperties }> = ({ children, gap = 36, row = false, style }) => {
  const { vertical } = useV();
  return (
    <AbsoluteFill
      style={{
        padding: vertical ? "250px 60px 600px" : HAS_NARRATOR ? "130px 310px 150px 100px" : "130px 100px 150px",
        display: "flex",
        flexDirection: row && !vertical ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        gap,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
