"use client";

import { forwardRef } from "react";

/**
 * GrowthStoryCard — hero-stat card for "X → Y" narratives like
 * "Prediction markets 4x'd in a year: $15.8B → $63.5B".
 *
 * Shape: before value + arrow + after value + optional delta badge,
 * with a row of contributor platforms below.
 *
 * All unicode arrows/triangles are inline SVG — Google Fonts Inter loads
 * arrow glyph subsets lazily and headless Chromium renders them as tofu
 * before the lazy subset arrives. SVG bypasses the issue entirely.
 */

export interface GrowthPlatform {
  handle: string;
  name?: string;
  avatar?: string;
  score?: number;
  tag?: string; // e.g. "leader", "new entrant · HIP-4"
}

export interface GrowthStoryProps {
  title: string;
  subtitle?: string;
  before: { value: string; label?: string };
  after: { value: string; label?: string };
  delta?: { value: string; direction: "up" | "down" };
  platforms: GrowthPlatform[];
  theme?: "dark" | "light";
}

const themes = {
  dark: {
    outerBg:
      "linear-gradient(160deg, #010E3D 0%, #021B6B 25%, #0544FD 50%, #021B6B 75%, #010E3D 100%)",
    windowBg: "rgba(8, 15, 50, 0.65)",
    titleBarBg: "rgba(5, 10, 35, 0.5)",
    titleText: "rgba(255,255,255,0.55)",
    border: "rgba(255,255,255,0.1)",
    borderFaint: "rgba(255,255,255,0.06)",
    text: "#FFFFFF",
    textSec: "rgba(255,255,255,0.6)",
    textMuted: "rgba(255,255,255,0.4)",
    textFaint: "rgba(255,255,255,0.25)",
    heroCardBg: "rgba(255,255,255,0.04)",
    heroCardBorder: "rgba(255,255,255,0.08)",
    accent: "#4FC3FF",
    arrowColor: "#4FC3FF",
    deltaUpBg: "rgba(34,197,94,0.15)",
    deltaUpText: "#22C55E",
    deltaDownBg: "rgba(239,68,68,0.15)",
    deltaDownText: "#EF4444",
    platformBg: "rgba(255,255,255,0.05)",
    platformBorder: "rgba(255,255,255,0.08)",
    avatarBg: "rgba(255,255,255,0.05)",
    avatarBorder: "rgba(255,255,255,0.1)",
    avatarText: "rgba(255,255,255,0.4)",
    footer: "rgba(255,255,255,0.35)",
    shadow:
      "0 30px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
    logo: "/logo-horizontal-white.svg",
  },
  light: {
    outerBg:
      "linear-gradient(160deg, #B8CCF5 0%, #9BB5F0 25%, #7BA0EB 50%, #9BB5F0 75%, #B8CCF5 100%)",
    windowBg: "rgba(255, 255, 255, 0.95)",
    titleBarBg: "rgba(230, 235, 245, 0.98)",
    titleText: "rgba(0,0,0,0.65)",
    border: "rgba(0,0,0,0.2)",
    borderFaint: "rgba(0,0,0,0.1)",
    text: "#1a1a1a",
    textSec: "rgba(0,0,0,0.55)",
    textMuted: "rgba(0,0,0,0.4)",
    textFaint: "rgba(0,0,0,0.2)",
    heroCardBg: "rgba(5,68,253,0.04)",
    heroCardBorder: "rgba(0,0,0,0.08)",
    accent: "#0544FD",
    arrowColor: "#0544FD",
    deltaUpBg: "rgba(34,197,94,0.1)",
    deltaUpText: "#16A34A",
    deltaDownBg: "rgba(239,68,68,0.1)",
    deltaDownText: "#DC2626",
    platformBg: "rgba(0,0,0,0.02)",
    platformBorder: "rgba(0,0,0,0.08)",
    avatarBg: "rgba(0,0,0,0.03)",
    avatarBorder: "rgba(0,0,0,0.08)",
    avatarText: "rgba(0,0,0,0.35)",
    footer: "rgba(0,0,0,0.35)",
    shadow:
      "0 10px 50px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.1)",
    logo: "/logo-horizontal-blue.svg",
  },
};

const GrowthStoryCard = forwardRef<HTMLDivElement, GrowthStoryProps>(
  ({ title, subtitle, before, after, delta, platforms, theme = "dark" }, ref) => {
    const c = themes[theme];
    const platformCount = Math.min(platforms.length, 5);
    const isUp = (delta?.direction ?? "up") === "up";

    return (
      <div
        ref={ref}
        style={{
          width: 1200,
          height: 675,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: c.outerBg,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Window chrome */}
        <div
          style={{
            width: 1120,
            height: 630,
            background: c.windowBg,
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            borderRadius: 16,
            border: `1px solid ${c.border}`,
            boxShadow: c.shadow,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Title bar */}
          <div
            style={{
              height: 40,
              background: c.titleBarBg,
              display: "flex",
              alignItems: "center",
              padding: "0 18px",
              gap: 8,
              borderBottom: `1px solid ${c.borderFaint}`,
              flexShrink: 0,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
            <div style={{ flex: 1, textAlign: "center" }}>
              <span style={{ fontSize: 14, color: c.titleText, fontWeight: 600 }}>
                TwitterScore Database
              </span>
            </div>
          </div>

          {/* Header: logo + title + subtitle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "18px 32px 12px",
              gap: 20,
              flexShrink: 0,
            }}
          >
            <img
              src={c.logo}
              alt="TwitterScore"
              style={{ height: 44 }}
              crossOrigin="anonymous"
            />
            <div style={{ width: 1, height: 36, background: c.border }} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: c.text,
                  letterSpacing: -0.3,
                  lineHeight: 1.15,
                }}
              >
                {title}
              </div>
              {subtitle && (
                <div style={{ fontSize: 13, color: c.textSec, marginTop: 4 }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {/* Hero row: before → after (+ delta badge) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              padding: "10px 40px 20px",
              flexShrink: 0,
            }}
          >
            {/* Before card */}
            <div
              style={{
                flex: 1,
                background: c.heroCardBg,
                border: `1px solid ${c.heroCardBorder}`,
                borderRadius: 18,
                padding: "28px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  color: c.textMuted,
                  lineHeight: 1,
                  letterSpacing: -1,
                }}
              >
                {before.value}
              </div>
              {before.label && (
                <div
                  style={{
                    fontSize: 15,
                    color: c.textFaint,
                    marginTop: 8,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    fontWeight: 600,
                  }}
                >
                  {before.label}
                </div>
              )}
            </div>

            {/* Arrow (SVG — font-independent) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <svg
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 12h14m-5-5l5 5-5 5"
                  stroke={c.arrowColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {delta && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    padding: "4px 12px",
                    borderRadius: 8,
                    background: isUp ? c.deltaUpBg : c.deltaDownBg,
                    color: isUp ? c.deltaUpText : c.deltaDownText,
                    whiteSpace: "nowrap",
                  }}
                >
                  {delta.value}
                </span>
              )}
            </div>

            {/* After card (hero — accent color) */}
            <div
              style={{
                flex: 1,
                background: c.heroCardBg,
                border: `1px solid ${c.accent}`,
                borderRadius: 18,
                padding: "28px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 0 1px ${c.accent}20`,
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  color: c.accent,
                  lineHeight: 1,
                  letterSpacing: -1,
                }}
              >
                {after.value}
              </div>
              {after.label && (
                <div
                  style={{
                    fontSize: 15,
                    color: c.textSec,
                    marginTop: 8,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    fontWeight: 700,
                  }}
                >
                  {after.label}
                </div>
              )}
            </div>
          </div>

          {/* Platform row */}
          {platforms.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: "0 32px 16px",
                alignItems: "stretch",
                flex: 1,
                minHeight: 0,
              }}
            >
              {platforms.slice(0, 5).map((p, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: c.platformBg,
                    border: `1px solid ${c.platformBorder}`,
                    borderRadius: 14,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: `2px solid ${c.avatarBorder}`,
                      background: c.avatarBg,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {p.avatar ? (
                      <img
                        src={p.avatar}
                        alt={p.name || p.handle}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <span
                        style={{
                          color: c.avatarText,
                          fontWeight: 700,
                          fontSize: 16,
                        }}
                      >
                        {(p.name || p.handle)[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: c.text,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {p.name || p.handle}
                  </div>
                  {p.score !== undefined && p.score > 0 && (
                    <div
                      style={{
                        fontSize: 11,
                        color: c.accent,
                        fontWeight: 700,
                      }}
                    >
                      TS: {Math.round(p.score)}
                    </div>
                  )}
                  {p.tag && (
                    <div
                      style={{
                        fontSize: 10,
                        color: c.textFaint,
                        textAlign: "center",
                        lineHeight: 1.2,
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {p.tag}
                    </div>
                  )}
                </div>
              ))}
              {/* Pad remaining slots so row stays balanced when platforms < 5 */}
              {Array.from({ length: Math.max(0, 5 - platformCount) }).map((_, i) => (
                <div key={`pad-${i}`} style={{ flex: 1 }} />
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 28px",
              borderTop: `1px solid ${c.borderFaint}`,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: c.footer,
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: 500,
              }}
            >
              twitterscore.io
            </span>
            <span
              style={{
                fontSize: 11,
                color: c.footer,
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: 500,
              }}
            >
              11M+ accounts tracked · real-time scoring
            </span>
            <span
              style={{
                fontSize: 11,
                color: c.footer,
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: 500,
              }}
            >
              @twiter_score
            </span>
          </div>
        </div>
      </div>
    );
  },
);

GrowthStoryCard.displayName = "GrowthStoryCard";
export default GrowthStoryCard;
