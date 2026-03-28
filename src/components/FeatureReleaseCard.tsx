"use client";

import { forwardRef } from "react";

export type FeatureLayout = "side" | "wide";

export interface FeatureReleaseProps {
  title: string;
  subtitle: string;
  bullets: string[];
  screenshotUrl?: string;
  theme?: "dark" | "light";
  layout?: FeatureLayout;
}

const themes = {
  dark: {
    outerBg: "linear-gradient(160deg, #010E3D 0%, #021B6B 25%, #0544FD 50%, #021B6B 75%, #010E3D 100%)",
    blob1: "rgba(100,50,255,0.3)", blob2: "rgba(0,200,255,0.2)", blob3: "rgba(5,68,253,0.4)",
    starColor: "#fff",
    plusColor: "rgba(255,255,255,0.15)",
    text: "#FFFFFF",
    textSec: "rgba(255,255,255,0.6)",
    accent: "#0544FD",
    accentBg: "rgba(5,68,253,0.2)",
    accentBorder: "rgba(5,68,253,0.4)",
    footer: "rgba(255,255,255,0.3)",
    logo: "https://twitterscore-cards.vercel.app/logo-horizontal-white.svg",
    // screenshot window
    windowBg: "rgba(8,15,50,0.75)",
    windowBorder: "rgba(255,255,255,0.12)",
    titleBarBg: "rgba(255,255,255,0.05)",
    titleText: "rgba(255,255,255,0.7)",
    windowShadow: "0 24px 80px rgba(0,0,0,0.5)",
    screenshotBg: "#0A0E1A",
  },
  light: {
    outerBg: "linear-gradient(160deg, #B8CCF5 0%, #9BB5F0 25%, #7BA0EB 50%, #9BB5F0 75%, #B8CCF5 100%)",
    blob1: "rgba(100,50,255,0.06)", blob2: "rgba(0,150,255,0.05)", blob3: "rgba(5,68,253,0.08)",
    starColor: "#fff",
    plusColor: "rgba(255,255,255,0.3)",
    text: "#FFFFFF",
    textSec: "rgba(255,255,255,0.8)",
    accent: "#FFFFFF",
    accentBg: "rgba(255,255,255,0.2)",
    accentBorder: "rgba(255,255,255,0.4)",
    footer: "rgba(255,255,255,0.5)",
    logo: "https://twitterscore-cards.vercel.app/logo-horizontal-white.svg",
    // screenshot window
    windowBg: "rgba(255,255,255,0.92)",
    windowBorder: "rgba(0,0,0,0.1)",
    titleBarBg: "rgba(0,0,0,0.04)",
    titleText: "rgba(0,0,0,0.5)",
    windowShadow: "0 24px 80px rgba(0,0,0,0.2)",
    screenshotBg: "#FFFFFF",
  },
};

const STARS = [
  { top: "8%", left: "8%", size: 2, opacity: 0.2 },
  { top: "15%", left: "72%", size: 3, opacity: 0.12 },
  { top: "55%", left: "4%", size: 2, opacity: 0.15 },
  { top: "75%", left: "85%", size: 2, opacity: 0.18 },
  { top: "88%", left: "22%", size: 3, opacity: 0.1 },
];

const FeatureReleaseCard = forwardRef<HTMLDivElement, FeatureReleaseProps>(
  ({ title, subtitle, bullets, screenshotUrl, theme = "dark" }, ref) => {
    const c = themes[theme];
    const hasScreenshot = !!screenshotUrl;

    return (
      <div
        ref={ref}
        style={{
          width: 1200, height: 675,
          position: "relative", overflow: "hidden",
          background: c.outerBg,
          fontFamily: "'Inter', sans-serif",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Blobs */}
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${c.blob1} 0%, transparent 70%)`, filter: "blur(80px)", top: -100, left: -100, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${c.blob2} 0%, transparent 70%)`, filter: "blur(60px)", bottom: -80, right: -60, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle, ${c.blob3} 0%, transparent 70%)`, filter: "blur(70px)", top: "40%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

        {/* Stars */}
        {STARS.map((s, i) => (
          <div key={i} style={{ position: "absolute", top: s.top, left: s.left, width: s.size, height: s.size, borderRadius: "50%", background: c.starColor, opacity: s.opacity, pointerEvents: "none" }} />
        ))}
        {/* Plus signs */}
        {[{ top: "10%", left: "6%" }, { top: "72%", left: "88%" }, { top: "4%", left: "65%" }, { top: "78%", left: "16%" }].map((p, i) => (
          <div key={i} style={{ position: "absolute", top: p.top, left: p.left, color: c.plusColor, fontSize: 18, pointerEvents: "none" }}>+</div>
        ))}

        {/* Layout: left text + right screenshot window */}
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", overflow: "hidden" }}>

          {/* Left column */}
          <div style={{
            flex: hasScreenshot ? "0 0 430px" : 1,
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "40px 40px 40px 64px",
          }}>
            {/* Logo above title */}
            <img src={c.logo} alt="TwitterScore" style={{ height: 50, objectFit: "contain", objectPosition: "left", marginBottom: 20 }} crossOrigin="anonymous" />

            <div style={{ fontSize: 38, fontWeight: 900, color: c.text, lineHeight: 1.15, marginBottom: 12 }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 14, color: c.textSec, lineHeight: 1.65, marginBottom: 24 }}>
                {subtitle}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {bullets.map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1,
                    background: c.accentBg, border: `1px solid ${c.accentBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: c.accent,
                  }}>✓</div>
                  <div style={{ fontSize: 14, color: c.text, fontWeight: 500, lineHeight: 1.5 }}>{b}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Right: screenshot in macOS-style window, bleeds to right edge */}
          {hasScreenshot && (
            <div style={{
              flex: 1,
              display: "flex", flexDirection: "column",
              background: c.windowBg,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "16px 0 0 16px",
              border: `1px solid ${c.windowBorder}`,
              borderRight: "none",
              overflow: "hidden",
              boxShadow: "-12px 0 40px rgba(0,0,0,0.35)",
              margin: "24px 0 24px 0",
            }}>
              {/* macOS title bar */}
              <div style={{
                height: 40, flexShrink: 0,
                background: c.titleBarBg,
                borderBottom: `1px solid ${c.windowBorder}`,
                display: "flex", alignItems: "center", padding: "0 16px", gap: 8,
              }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
                <div style={{ flex: 1, textAlign: "center" }}>
                  <span style={{ fontSize: 13, color: c.titleText, fontWeight: 600 }}>TwitterScore</span>
                </div>
              </div>
              {/* Screenshot */}
              <div style={{ flex: 1, overflow: "hidden", background: c.screenshotBg }}>
                <img
                  src={screenshotUrl}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }}
                  crossOrigin="anonymous"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer row (bottom, full width) */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", padding: "0 64px 16px", flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: c.footer, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>twitterscore.io</span>
          <span style={{ fontSize: 10, color: c.footer, fontWeight: 500 }}>Real-Time Social Intelligence for Crypto</span>
          <span style={{ fontSize: 10, color: c.footer, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>@Twiter_score</span>
        </div>
      </div>
    );
  }
);

FeatureReleaseCard.displayName = "FeatureReleaseCard";
export default FeatureReleaseCard;
