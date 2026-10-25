import React from "react";
import { Img, staticFile } from "remotion";
import { C, FONT, IN_OUT, mix, p, useF } from "../theme";

export type ShotSpec = {
  src: string; // file in public/shots/
  size: [number, number]; // full image size in px
  crop: [number, number, number, number]; // x, y, w, h in image px
  masks?: [number, number, number, number][]; // regions to blur (image px)
  title?: string; // optional window title
};

/**
 * A real screenshot inside a window frame: cropped, with private regions blurred, and an optional
 * slow zoom toward a focus point. `highlight` draws a yellow box around a region (image px).
 */
export const Shot: React.FC<{
  spec: ShotSpec;
  width: number;
  zoom?: { at: number; len?: number; to: number; fx: number; fy: number };
  highlight?: { at: number; box: [number, number, number, number] };
  style?: React.CSSProperties;
}> = ({ spec, width, zoom, highlight, style }) => {
  const f = useF();
  const [cx, cy, cw, ch] = spec.crop;
  const k = width / cw;
  const height = ch * k;
  const z = zoom ? mix(1, zoom.to, p(f, zoom.at, zoom.len ?? 60, IN_OUT)) : 1;
  const ox = zoom ? (zoom.fx - cx) * k : width / 2, oy = zoom ? (zoom.fy - cy) * k : height / 2;
  const box = (r: [number, number, number, number]) => ({ left: (r[0] - cx) * k, top: (r[1] - cy) * k, width: r[2] * k, height: r[3] * k });
  const hl = highlight ? p(f, highlight.at, 14) : 0;
  return (
    <div dir="ltr" style={{ width, borderRadius: 16, overflow: "hidden", background: C.white, border: `1.5px solid ${C.line2}`, boxShadow: "0 26px 60px rgba(21,19,15,0.18)", fontFamily: FONT, ...style }}>
      {spec.title ? (
        <div style={{ height: 38, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", background: C.paper2, borderBottom: `1px solid ${C.line}` }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
          ))}
          <div style={{ flex: 1, textAlign: "center", fontSize: 14, fontWeight: 600, color: C.stone, marginRight: 50 }}>{spec.title}</div>
        </div>
      ) : null}
      <div style={{ position: "relative", width, height, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: `${ox}px ${oy}px` }}>
          <Img src={staticFile(`shots/${spec.src}`)} style={{ position: "absolute", left: -cx * k, top: -cy * k, width: spec.size[0] * k, height: spec.size[1] * k }} />
          {(spec.masks ?? []).map((m, i) => (
            <div key={i} style={{ position: "absolute", ...box(m), borderRadius: 6, backdropFilter: "blur(9px)", WebkitBackdropFilter: "blur(9px)", background: "rgba(239,235,224,0.55)" }} />
          ))}
          {highlight ? (
            <div style={{ position: "absolute", ...box(highlight.box), borderRadius: 8, border: `${3 / z}px solid ${C.ink}`, boxShadow: `0 0 0 ${4 / z}px ${C.yellow}`, opacity: hl, transform: `scale(${mix(1.15, 1, hl)})` }} />
          ) : null}
        </div>
      </div>
    </div>
  );
};
