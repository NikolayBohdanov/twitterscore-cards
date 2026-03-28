"use client";

import { forwardRef } from "react";

export type SpotlightFormat = "adaptive" | "standard" | "wide" | "tall";

export interface SpotlightProps {
  screenshotUrl?: string;
  theme?: "dark" | "light";
  format?: SpotlightFormat;
  adaptiveDimensions?: SpotlightDimensions;
  urlBarText?: string;
}

export interface SpotlightDimensions {
  width: number;
  height: number;
}

const fixedFormats: Record<string, SpotlightDimensions> = {
  standard: { width: 1200, height: 675 },
  wide: { width: 1200, height: 540 },
  tall: { width: 1200, height: 900 },
};

const themes = {
  dark: {
    bg: "linear-gradient(160deg, #010E3D 0%, #021B6B 25%, #0544FD 50%, #021B6B 75%, #010E3D 100%)",
    blob1: "rgba(100,50,255,0.3)", blob2: "rgba(0,200,255,0.2)", blob3: "rgba(5,68,253,0.4)",
    frameBg: "#111827",
    frameBorder: "rgba(255,255,255,0.12)",
    textMuted: "rgba(255,255,255,0.3)",
    footer: "rgba(255,255,255,0.3)",
    urlBarBg: "rgba(255,255,255,0.06)",
    windowDots: ["#FF5F57", "#FEBC2E", "#28C840"],
    shadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  light: {
    bg: "linear-gradient(160deg, #B8CCF5 0%, #9BB5F0 25%, #7BA0EB 50%, #9BB5F0 75%, #B8CCF5 100%)",
    blob1: "rgba(100,50,255,0.06)", blob2: "rgba(0,150,255,0.05)", blob3: "rgba(5,68,253,0.08)",
    frameBg: "#FFFFFF",
    frameBorder: "rgba(0,0,0,0.1)",
    textMuted: "rgba(255,255,255,0.5)",
    footer: "rgba(255,255,255,0.5)",
    urlBarBg: "rgba(0,0,0,0.05)",
    windowDots: ["#FF5F57", "#FEBC2E", "#28C840"],
    shadow: "0 8px 32px rgba(0,0,0,0.2)",
  },
};

const SpotlightCard = forwardRef<HTMLDivElement, SpotlightProps>(
  ({ screenshotUrl, theme = "dark", format = "adaptive", adaptiveDimensions, urlBarText = "twitterscore.io" }, ref) => {
    const c = themes[theme];
    const { width, height } = format === "adaptive" && adaptiveDimensions
      ? adaptiveDimensions
      : (fixedFormats[format] || fixedFormats.standard);

    return (
      <div
        ref={ref}
        style={{
          width, height,
          background: c.bg,
          fontFamily: "'Inter', sans-serif",
          display: "flex", flexDirection: "column",
          padding: "16px 24px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Blobs */}
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${c.blob1} 0%, transparent 70%)`, filter: "blur(80px)", top: -100, left: -100, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${c.blob2} 0%, transparent 70%)`, filter: "blur(60px)", bottom: -80, right: -60, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle, ${c.blob3} 0%, transparent 70%)`, filter: "blur(70px)", top: "40%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
        {/* Stars */}
        {[{ top: "6%", left: "10%" }, { top: "12%", left: "80%" }, { top: "80%", left: "6%" }, { top: "85%", left: "88%" }].map((s, i) => (
          <div key={i} style={{ position: "absolute", top: s.top, left: s.left, width: 2, height: 2, borderRadius: "50%", background: "#fff", opacity: 0.2, pointerEvents: "none" }} />
        ))}

        {/* Browser frame */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          background: c.frameBg,
          borderRadius: 12,
          border: `1px solid ${c.frameBorder}`,
          overflow: "hidden",
          boxShadow: c.shadow,
          position: "relative", zIndex: 1,
        }}>
          {/* Window chrome */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 14px",
            borderBottom: `1px solid ${c.frameBorder}`,
            flexShrink: 0,
          }}>
            {c.windowDots.map((color, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
            ))}
            <div style={{
              flex: 1, marginLeft: 10,
              background: c.urlBarBg, borderRadius: 5, padding: "5px 12px",
              fontSize: 11, color: c.textMuted,
            }}>{urlBarText}</div>
          </div>

          {/* Screenshot — contain to show full image, bg matches frame */}
          <div style={{ flex: 1, overflow: "hidden", background: c.frameBg, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
            {screenshotUrl ? (
              <img
                src={screenshotUrl}
                style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "top center" }}
                crossOrigin="anonymous"
              />
            ) : (
              <div style={{
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: c.textMuted, fontSize: 15,
              }}>
                Drop a screenshot of the TwitterScore page
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: c.footer, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>twitterscore.io</span>
          <span style={{ fontSize: 10, color: c.footer }}>Real-Time Social Intelligence for Crypto</span>
          <span style={{ fontSize: 10, color: c.footer, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>@Twiter_score</span>
        </div>
      </div>
    );
  }
);

SpotlightCard.displayName = "SpotlightCard";
export default SpotlightCard;
