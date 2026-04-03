"use client";

import { forwardRef } from "react";

export interface CollageProps {
  screenshots: (string | null)[];
  theme?: "dark" | "light";
  urlBarTexts?: string[];
}

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
    shadow: "0 4px 20px rgba(0,0,0,0.4)",
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
    shadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
};

const CollageCard = forwardRef<HTMLDivElement, CollageProps>(
  ({ screenshots, theme = "dark", urlBarTexts = [] }, ref) => {
    const c = themes[theme];

    const renderWindow = (screenshotUrl: string | null, index: number) => {
      const urlText = urlBarTexts[index] || "twitterscore.io";
      return (
        <div
          key={index}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: c.frameBg,
            borderRadius: 10,
            border: `1px solid ${c.frameBorder}`,
            overflow: "hidden",
            boxShadow: c.shadow,
            position: "relative",
            zIndex: 1,
            minHeight: 0,
          }}
        >
          {/* Window chrome */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 10px",
              borderBottom: `1px solid ${c.frameBorder}`,
              flexShrink: 0,
            }}
          >
            {c.windowDots.map((color, i) => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
            ))}
            <div
              style={{
                flex: 1,
                marginLeft: 6,
                background: c.urlBarBg,
                borderRadius: 4,
                padding: "3px 8px",
                fontSize: 9,
                color: c.textMuted,
              }}
            >
              {urlText}
            </div>
          </div>

          {/* Screenshot */}
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              background: c.frameBg,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              minHeight: 0,
            }}
          >
            {screenshotUrl ? (
              <img
                src={screenshotUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "top center",
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: c.textMuted,
                  fontSize: 12,
                }}
              >
                Drop screenshot #{index + 1}
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div
        ref={ref}
        style={{
          width: 1200,
          height: 675,
          background: c.bg,
          fontFamily: "'Inter', sans-serif",
          display: "flex",
          flexDirection: "column",
          padding: "14px 18px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Blobs */}
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${c.blob1} 0%, transparent 70%)`, filter: "blur(80px)", top: -100, left: -100, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${c.blob2} 0%, transparent 70%)`, filter: "blur(60px)", bottom: -80, right: -60, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle, ${c.blob3} 0%, transparent 70%)`, filter: "blur(70px)", top: "40%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

        {/* 2×2 Grid of browser windows */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 10,
            position: "relative",
            zIndex: 1,
            minHeight: 0,
          }}
        >
          {[0, 1, 2, 3].map((i) => renderWindow(screenshots[i] || null, i))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: c.footer, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>twitterscore.io</span>
          <span style={{ fontSize: 10, color: c.footer }}>Real-Time Social Intelligence for Crypto</span>
          <span style={{ fontSize: 10, color: c.footer, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>@Twiter_score</span>
        </div>
      </div>
    );
  }
);

CollageCard.displayName = "CollageCard";
export default CollageCard;
