"use client";

import { forwardRef } from "react";

export interface StatItem {
  value: string;
  label: string;
  change?: string; // e.g. "+1,199 new"
}

export interface MilestoneProps {
  title: string;
  subtitle?: string;
  stats: StatItem[];
  theme?: "dark" | "light";
}

const themes = {
  dark: {
    bg: "linear-gradient(135deg, #0A1628 0%, #0D2847 40%, #0544FD 100%)",
    cardBg: "rgba(255,255,255,0.08)",
    cardBorder: "rgba(255,255,255,0.15)",
    text: "#FFFFFF",
    textSec: "rgba(255,255,255,0.6)",
    textMuted: "rgba(255,255,255,0.35)",
    accent: "#60A5FA",
    changeBg: "rgba(34,197,94,0.15)",
    changeBorder: "rgba(34,197,94,0.3)",
    changeText: "#22C55E",
    footer: "rgba(255,255,255,0.3)",
    logo: "https://twitterscore-cards.vercel.app/logo-horizontal-white.svg",
  },
  light: {
    bg: "linear-gradient(135deg, #EBF0FF 0%, #DBEAFE 40%, #93C5FD 100%)",
    cardBg: "rgba(255,255,255,0.7)",
    cardBorder: "rgba(0,0,0,0.08)",
    text: "#111827",
    textSec: "#4B5563",
    textMuted: "#9CA3AF",
    accent: "#0544FD",
    changeBg: "rgba(34,197,94,0.1)",
    changeBorder: "rgba(34,197,94,0.2)",
    changeText: "#16A34A",
    footer: "rgba(0,0,0,0.35)",
    logo: "https://twitterscore-cards.vercel.app/logo-horizontal-blue.svg",
  },
};

const MilestoneCard = forwardRef<HTMLDivElement, MilestoneProps>(
  ({ title, subtitle, stats, theme = "dark" }, ref) => {
    const c = themes[theme];
    const cols = Math.min(stats.length, 4);
    // For 2 items: side by side. For 3: row of 3. For 4: 2x2
    const isGrid = stats.length === 4;

    return (
      <div
        ref={ref}
        style={{
          width: 1200, height: 675,
          background: c.bg,
          fontFamily: "'Inter', sans-serif",
          display: "flex", flexDirection: "column",
          padding: "32px 64px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24, flexShrink: 0 }}>
          <img src={c.logo} alt="TwitterScore" style={{ height: 28, marginBottom: 8 }} crossOrigin="anonymous" />
          <div style={{
            fontSize: 11, fontWeight: 700, color: c.accent, textTransform: "uppercase",
            letterSpacing: 1.5, marginBottom: 16,
          }}>
            📊 Milestone
          </div>
          <div style={{ fontSize: 42, fontWeight: 900, color: c.text, textAlign: "center", lineHeight: 1.15, maxWidth: 900 }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 16, color: c.textSec, marginTop: 10, textAlign: "center", maxWidth: 700 }}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div style={{
          flex: 1, display: "flex",
          flexWrap: isGrid ? "wrap" : "nowrap",
          gap: 16,
          justifyContent: "center",
          alignItems: isGrid ? "center" : "stretch",
          alignContent: "center",
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              width: isGrid ? "calc(50% - 8px)" : `${100 / cols}%`,
              background: c.cardBg,
              border: `1px solid ${c.cardBorder}`,
              borderRadius: 16,
              padding: "28px 24px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(12px)",
            }}>
              <div style={{ fontSize: 52, fontWeight: 900, color: c.text, lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 14, color: c.textSec, fontWeight: 500, marginTop: 8 }}>
                {stat.label}
              </div>
              {stat.change && (
                <div style={{
                  marginTop: 10, padding: "4px 12px", borderRadius: 20,
                  background: c.changeBg, border: `1px solid ${c.changeBorder}`,
                  fontSize: 12, fontWeight: 700, color: c.changeText,
                }}>
                  {stat.change}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: c.footer, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>twitterscore.io</span>
          <span style={{ fontSize: 10, color: c.footer, fontWeight: 500 }}>Real-Time Social Intelligence for Crypto</span>
          <span style={{ fontSize: 10, color: c.footer, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>@Twiter_score</span>
        </div>
      </div>
    );
  }
);

MilestoneCard.displayName = "MilestoneCard";
export default MilestoneCard;
