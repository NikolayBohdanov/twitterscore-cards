"use client";

import { forwardRef } from "react";

export interface ChangelogItem {
  type: "added" | "fixed" | "improved";
  text: string;
}

export interface ChangelogProps {
  title: string;
  version?: string;
  date?: string;
  items: ChangelogItem[];
  theme?: "dark" | "light";
}

const typeConfig = {
  added: { icon: "✅", label: "Added", color: "#22C55E", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)" },
  fixed: { icon: "🔧", label: "Fixed", color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  improved: { icon: "⚡", label: "Improved", color: "#60A5FA", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)" },
};

const themes = {
  dark: {
    bg: "#0A0E17",
    cardBg: "rgba(255,255,255,0.03)",
    cardBorder: "rgba(255,255,255,0.06)",
    text: "#FFFFFF",
    textSec: "rgba(255,255,255,0.55)",
    textMuted: "rgba(255,255,255,0.3)",
    accent: "#0544FD",
    accentBg: "rgba(5,68,253,0.12)",
    accentBorder: "rgba(5,68,253,0.25)",
    headerLine: "linear-gradient(90deg, #0544FD 0%, transparent 100%)",
    footer: "rgba(255,255,255,0.25)",
    logo: "https://twitterscore-cards.vercel.app/logo-horizontal-white.svg",
    itemBg: "rgba(255,255,255,0.02)",
    itemBorder: "rgba(255,255,255,0.05)",
  },
  light: {
    bg: "#F8F9FC",
    cardBg: "rgba(255,255,255,0.8)",
    cardBorder: "rgba(0,0,0,0.06)",
    text: "#111827",
    textSec: "#4B5563",
    textMuted: "#9CA3AF",
    accent: "#0544FD",
    accentBg: "rgba(5,68,253,0.06)",
    accentBorder: "rgba(5,68,253,0.15)",
    headerLine: "linear-gradient(90deg, #0544FD 0%, transparent 100%)",
    footer: "rgba(0,0,0,0.3)",
    logo: "https://twitterscore-cards.vercel.app/logo-horizontal-blue.svg",
    itemBg: "rgba(0,0,0,0.02)",
    itemBorder: "rgba(0,0,0,0.05)",
  },
};

const ChangelogCard = forwardRef<HTMLDivElement, ChangelogProps>(
  ({ title, version, date, items, theme = "dark" }, ref) => {
    const c = themes[theme];

    return (
      <div
        ref={ref}
        style={{
          width: 1200, height: 675,
          background: c.bg,
          fontFamily: "'Inter', sans-serif",
          display: "flex", flexDirection: "column",
          padding: "28px 64px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <img src={c.logo} alt="TwitterScore" style={{ height: 28 }} crossOrigin="anonymous" />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {version && (
              <div style={{
                background: c.accentBg, border: `1px solid ${c.accentBorder}`,
                padding: "5px 14px", borderRadius: 20,
                fontSize: 11, fontWeight: 700, color: c.accent,
              }}>{version}</div>
            )}
            {date && (
              <div style={{
                padding: "5px 14px", borderRadius: 20,
                fontSize: 11, fontWeight: 600, color: c.textMuted,
                border: `1px solid ${c.cardBorder}`,
              }}>{date}</div>
            )}
            <div style={{
              background: c.accentBg, border: `1px solid ${c.accentBorder}`,
              padding: "5px 14px", borderRadius: 20,
              fontSize: 11, fontWeight: 700, color: c.accent, textTransform: "uppercase", letterSpacing: 1.2,
            }}>
              🔧 What&apos;s New
            </div>
          </div>
        </div>
        <div style={{ height: 2, background: c.headerLine, marginBottom: 20, borderRadius: 1 }} />

        {/* Title */}
        <div style={{ fontSize: 34, fontWeight: 900, color: c.text, marginBottom: 24, lineHeight: 1.2 }}>
          {title}
        </div>

        {/* Items */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>
          {items.slice(0, 8).map((item, i) => {
            const tc = typeConfig[item.type];
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 18px", borderRadius: 12,
                background: c.itemBg, border: `1px solid ${c.itemBorder}`,
              }}>
                <div style={{
                  padding: "4px 10px", borderRadius: 8,
                  background: tc.bg, border: `1px solid ${tc.border}`,
                  fontSize: 11, fontWeight: 700, color: tc.color,
                  flexShrink: 0, minWidth: 80, textAlign: "center",
                }}>
                  {tc.icon} {tc.label}
                </div>
                <div style={{ fontSize: 15, color: c.text, fontWeight: 500 }}>{item.text}</div>
              </div>
            );
          })}
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

ChangelogCard.displayName = "ChangelogCard";
export default ChangelogCard;
