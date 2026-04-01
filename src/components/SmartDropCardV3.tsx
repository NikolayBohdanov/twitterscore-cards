"use client";

import { forwardRef } from "react";
import { AccountData } from "./SmartDropCard";
import { CardTextOverrides, getTitle, getSubtitle, getCounterLabel, getFooterLeft, getFooterCenter, getFooterRight } from "./cardOverrides";

export type CardTheme = "light" | "dark";

interface Props {
  accounts: AccountData[];
  weekNumber: number;
  totalSmart: number;
  newCount: number;
  showTags?: boolean;
  theme?: CardTheme;
  overrides?: CardTextOverrides;
}

const themes = {
  light: {
    background: "#F5F5F5",
    cardBg: "#FFFFFF",
    cardBorder: "#E5E7EB",
    cardShadow: "0 4px 24px rgba(0,0,0,0.08)",
    headerBg: "#2563EB",
    headerText: "#FFFFFF",
    textPrimary: "#1A1A1A",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    scoreBarBg: "#F2F3F6",
    rowEven: "#F8FAFC",
    rowOdd: "#FFFFFF",
    rankColor: "#2563EB",
    rankMuted: "#9CA3AF",
    // FIX 2: horizontal logo (like dark) but blue version
    logoSrc: "/logo-horizontal-white.svg",
    logoFallback: "/logo-blue.svg",
    // We need a blue horizontal logo — use white on blue bg header area
    // Actually: light theme uses logo-blue.svg but horizontal style
    // Let's use logo-black.svg as fallback for now, main = horizontal white on blue header
    counterBg: "#EFF6FF",
    counterBorder: "#DBEAFE",
    counterText: "#2563EB",
    counterMuted: "#93C5FD",
    footerText: "#9CA3AF",
    avatarBorder: "#E5E7EB",
    avatarBorderTop: "#2563EB",
    avatarBg: "#F3F4F6",
    avatarFallbackColor: "#9CA3AF",
    nameSub: "#6B7280",
    divider: "#E5E7EB",
    titleText: "#1A1A1A",
    weekText: "#6B7280",
    separatorColor: "#D1D5DB",
    scoreText: "#1A1A1A",
    // FIX 4: no yellow tint on rows
    tagBg: "#F3F4F6",
    tagText: "#4B5563",
    tagBorder: "#E5E7EB",
  },
  dark: {
    background: "#121212",
    cardBg: "#1E1E1E",
    // FIX 1: more visible border in dark theme
    cardBorder: "#444444",
    cardShadow: "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
    headerBg: "rgba(255,255,255,0.06)",
    headerText: "rgba(255,255,255,0.7)",
    textPrimary: "#FFFFFF",
    textSecondary: "#9A9A9A",
    textMuted: "rgba(255,255,255,0.35)",
    scoreBarBg: "#333333",
    rowEven: "#252525",
    rowOdd: "#1E1E1E",
    rankColor: "#22C55E",
    rankMuted: "#6B7280",
    logoSrc: "/logo-horizontal-white.svg",
    logoFallback: "/logo-white.svg",
    counterBg: "rgba(34,197,94,0.08)",
    counterBorder: "rgba(34,197,94,0.15)",
    counterText: "#22C55E",
    counterMuted: "rgba(34,197,94,0.5)",
    footerText: "rgba(255,255,255,0.35)",
    avatarBorder: "#444444",
    avatarBorderTop: "rgba(255,255,255,0.3)",
    avatarBg: "#2A2A2A",
    avatarFallbackColor: "#6B7280",
    nameSub: "#808080",
    divider: "#333333",
    titleText: "#FFFFFF",
    weekText: "#808080",
    separatorColor: "#444444",
    scoreText: "#FFFFFF",
    tagBg: "rgba(255,255,255,0.08)",
    tagText: "rgba(255,255,255,0.6)",
    tagBorder: "rgba(255,255,255,0.1)",
  },
};

// Official TwitterScore score bar gradient (from Figma)
const SCORE_BAR_GRADIENT =
  "linear-gradient(90deg, #FF4B04 0%, #F2DB06 52%, #12E83B 100%)";

// Official TwitterScore formula: y = round(⁴√(score × 100000))
function scoreToPercent(score: number): number {
  if (score <= 0) return 0;
  return Math.min(Math.round(Math.pow(score * 100000, 0.25)), 100);
}
function scoreBarStyle(score: number): { width: string; backgroundSize: string } {
  const pct = scoreToPercent(score);
  const bgSize = pct > 0 ? `${(100 / pct) * 100}% 100%` : "100% 100%";
  return { width: `${Math.max(pct, 0.5)}%`, backgroundSize: bgSize };
}

function getRankIcon(index: number): string {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return `${index + 1}`;
}

// FIX 4: simple alternating rows, no gold/silver/bronze tint
function getRowBg(index: number, t: (typeof themes)["light"]): string {
  return index % 2 === 0 ? t.rowEven : t.rowOdd;
}

function getScoreBarWidth(score: number, maxScore: number): number {
  return Math.min((score / maxScore) * 100, 100);
}

function formatScore(score: number): string {
  if (score >= 100) return Math.round(score).toString();
  if (score >= 10) return (Math.round(score * 10) / 10).toFixed(1);
  return (Math.round(score * 100) / 100).toFixed(2);
}

const SmartDropCardV3 = forwardRef<HTMLDivElement, Props>(
  ({ accounts, weekNumber, totalSmart, newCount, theme = "light", overrides }, ref) => {
    const t = themes[theme];
    const prevTotal = totalSmart - newCount;
    const maxScore = Math.max(...accounts.map((a) => a.score), 100);

    // FIX 5: bigger avatars
    const rowHeight = accounts.length <= 5 ? 64 : accounts.length <= 8 ? 54 : 46;
    const avatarSize = accounts.length <= 5 ? 56 : accounts.length <= 8 ? 50 : 42;
    const nameFontSize = accounts.length <= 5 ? 15 : 13;
    const scoreFontSize = accounts.length <= 5 ? 20 : 17;

    // Check if any account has tags/category
    const hasTags = accounts.some(
      (a) => (a.tags && a.tags.length > 0) || a.category
    );

    return (
      <div
        ref={ref}
        style={{
          width: 1200,
          height: 675,
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
          background: t.background,
          display: "flex",
          flexDirection: "column",
          padding: "24px 40px",
        }}
      >
        {/* Header: logo + title + counter */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img
              src={theme === "light" ? "/logo-horizontal-blue.svg" : "/logo-horizontal-white.svg"}
              alt="TwitterScore"
              style={{ height: 44 }}
              crossOrigin="anonymous"
            />
            <div
              style={{
                width: 1,
                height: 28,
                background: t.separatorColor,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: t.titleText,
                  letterSpacing: -0.3,
                }}
              >
                {getTitle(overrides)}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: t.weekText,
                  fontWeight: 500,
                }}
              >
                {getSubtitle(overrides, weekNumber)}
              </div>
              {overrides?.headerSubtitle && (
                <div style={{ fontSize: 11, color: t.textSecondary, fontWeight: 500, marginTop: 2 }}>
                  {overrides.headerSubtitle}
                </div>
              )}
            </div>
          </div>

          {/* Counter */}
          <div
            style={{
              background: t.counterBg,
              border: `1px solid ${t.counterBorder}`,
              borderRadius: 12,
              padding: "10px 20px",
              textAlign: "right",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: t.counterText,
                letterSpacing: -0.5,
              }}
            >
              <span
                style={{
                  color: t.counterMuted,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {prevTotal.toLocaleString()} →{" "}
              </span>
              {totalSmart.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 9,
                color: t.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                fontWeight: 600,
              }}
            >
              {getCounterLabel(overrides, newCount)}
            </div>
          </div>
        </div>

        {/* Table card */}
        <div
          style={{
            flex: 1,
            background: t.cardBg,
            borderRadius: 14,
            border: `1px solid ${t.cardBorder}`,
            boxShadow: t.cardShadow,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "11px 28px",
              background: t.headerBg,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 40,
                fontSize: 10,
                fontWeight: 700,
                color: t.headerText,
                textTransform: "uppercase",
                letterSpacing: 1,
                textAlign: "center",
              }}
            >
              #
            </div>
            <div
              style={{
                width: 240,
                fontSize: 10,
                fontWeight: 700,
                color: t.headerText,
                textTransform: "uppercase",
                letterSpacing: 1,
                paddingLeft: 10,
              }}
            >
              Account
            </div>
            {/* FIX 6: Tags column header */}
            {hasTags && (
              <div
                style={{
                  flex: 1,
                  fontSize: 10,
                  fontWeight: 700,
                  color: t.headerText,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  paddingLeft: 8,
                }}
              >
                Tags
              </div>
            )}
            <div
              style={{
                width: 300,
                fontSize: 10,
                fontWeight: 700,
                color: t.headerText,
                textTransform: "uppercase",
                letterSpacing: 1,
                textAlign: "right",
                paddingRight: 4,
              }}
            >
              TwitterScore
            </div>
          </div>

          {/* Rows */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            {accounts.map((acc, i) => {
              // FIX 6: merge category + tags into one list
              const allTags: string[] = [];
              if (
                acc.category &&
                !["Top Smart", "Smart", "Rising", "New"].includes(acc.category)
              ) {
                allTags.push(acc.category);
              }
              if (acc.tags) {
                acc.tags.forEach((tag) => {
                  if (tag && !allTags.includes(tag)) allTags.push(tag);
                });
              }

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 28px",
                    height: rowHeight,
                    background: getRowBg(i, t),
                    borderBottom:
                      i < accounts.length - 1
                        ? `1px solid ${t.divider}`
                        : "none",
                    flexShrink: 0,
                  }}
                >
                  {/* Rank */}
                  <div
                    style={{
                      width: 40,
                      textAlign: "center",
                      fontSize: i < 3 ? 18 : 14,
                      fontWeight: 700,
                      color: i >= 3 ? t.rankMuted : undefined,
                      flexShrink: 0,
                    }}
                  >
                    {getRankIcon(i)}
                  </div>

                  {/* Avatar + Name */}
                  <div
                    style={{
                      width: 240,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      paddingLeft: 10,
                      minWidth: 0,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: `2px solid ${i < 3 ? t.avatarBorderTop : t.avatarBorder}`,
                        background: t.avatarBg,
                        flexShrink: 0,
                      }}
                    >
                      {acc.avatar ? (
                        <img
                          src={acc.avatar}
                          alt={acc.username}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
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
                            fontSize: avatarSize * 0.4,
                            fontWeight: 700,
                            color: t.avatarFallbackColor,
                          }}
                        >
                          {acc.username[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: nameFontSize,
                          fontWeight: 700,
                          color: t.textPrimary,
                          lineHeight: 1.2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        @{acc.username}
                      </div>
                      {acc.name && acc.name !== acc.username && (
                        <div
                          style={{
                            fontSize: 11,
                            color: t.nameSub,
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {acc.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FIX 6: Tags column — pills like on the screenshot */}
                  {hasTags && (
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                        alignItems: "center",
                        paddingLeft: 8,
                        paddingRight: 8,
                        overflow: "hidden",
                      }}
                    >
                      {allTags.slice(0, 3).map((tag, ti) => (
                        <span
                          key={ti}
                          style={{
                            background: t.tagBg,
                            color: t.tagText,
                            border: `1px solid ${t.tagBorder}`,
                            padding: "2px 10px",
                            borderRadius: 12,
                            fontSize: 10,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Score bar + number */}
                  <div
                    style={{
                      width: 300,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: 16,
                        background: t.scoreBarBg,
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          ...scoreBarStyle(acc.score),
                          height: "100%",
                          background: SCORE_BAR_GRADIENT,
                          borderRadius: 8,
                          backgroundPosition: "left",
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        width: 52,
                        fontSize: scoreFontSize,
                        fontWeight: 900,
                        color: t.scoreText,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {formatScore(acc.score)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0 0",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: t.footerText,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {getFooterLeft(overrides)}
          </span>
          <span
            style={{
              fontSize: 10,
              color: t.footerText,
              fontWeight: 500,
            }}
          >
            {getFooterCenter(overrides)}
          </span>
          <span
            style={{
              fontSize: 10,
              color: t.footerText,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {getFooterRight(overrides)}
          </span>
        </div>
      </div>
    );
  }
);

SmartDropCardV3.displayName = "SmartDropCardV3";
export default SmartDropCardV3;
