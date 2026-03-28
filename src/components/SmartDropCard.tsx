"use client";

import { forwardRef } from "react";

export interface AccountData {
  username: string;
  name: string;
  score: number;
  avatar: string;
  category: string;
  tags: string[];
  followers: number;
  smartFollowers?: number;
  weekDiff?: number;
  monthDiff?: number;
}

export type CardTheme = "light" | "dark";

interface Props {
  accounts: AccountData[];
  weekNumber: number;
  totalSmart: number;
  newCount: number;
  theme?: CardTheme;
  showTags?: boolean;
}

// Official TwitterScore formula: y = round(⁴√(score × 100000))
function scoreToPercent(score: number): number {
  if (score <= 0) return 0;
  return Math.min(Math.round(Math.pow(score * 100000, 0.25)), 100);
}

function scoreBarBgSize(score: number): string {
  const pct = scoreToPercent(score);
  if (pct <= 0) return "100% 100%";
  return `${(100 / pct) * 100}% 100%`;
}

// Score formatting: >=100 → integer, 10-99 → 1 decimal, <10 → 2 decimals
function formatScore(score: number): string {
  if (score >= 100) return Math.round(score).toString();
  if (score >= 10) return score.toFixed(1);
  return score.toFixed(2);
}

const SCORE_GRADIENT = "linear-gradient(90deg, #FF4B04 0%, #F2DB06 52%, #12E83B 100%)";

const T = {
  dark: {
    outerBg: "linear-gradient(160deg, #010E3D 0%, #021B6B 25%, #0544FD 50%, #021B6B 75%, #010E3D 100%)",
    windowBg: "rgba(8, 15, 50, 0.65)",
    titleBarBg: "rgba(5, 10, 35, 0.5)",
    titleText: "rgba(255,255,255,0.55)",
    border: "rgba(255,255,255,0.1)",
    borderFaint: "rgba(255,255,255,0.06)",
    text: "white",
    textSec: "rgba(255,255,255,0.6)",
    textMuted: "rgba(255,255,255,0.4)",
    textFaint: "rgba(255,255,255,0.25)",
    textFaintest: "rgba(255,255,255,0.15)",
    rowBg: "rgba(255,255,255,0.025)",
    barBg: "rgba(255,255,255,0.08)",
    scoreLabel: "rgba(255,255,255,0.75)",
    tagBg: "rgba(74,158,255,0.12)",
    tagText: "rgba(74,158,255,0.85)",
    catBg: "rgba(255,255,255,0.08)",
    catText: "rgba(255,255,255,0.6)",
    green: "#00FF88",
    greenFaint: "rgba(0,255,136,0.4)",
    logo: "/logo-horizontal-white.svg",
    plusColor: "rgba(255,255,255,0.04)",
    starColor: "white",
    shadow: "0 30px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
    blob1: "rgba(100,50,255,0.3)", blob2: "rgba(0,200,255,0.2)", blob3: "rgba(5,68,253,0.4)",
    avatarBorder: "rgba(255,255,255,0.1)", avatarBg: "rgba(255,255,255,0.05)", avatarText: "rgba(255,255,255,0.4)",
    footer: "rgba(255,255,255,0.35)",
  },
  light: {
    outerBg: "linear-gradient(160deg, #B8CCF5 0%, #9BB5F0 25%, #7BA0EB 50%, #9BB5F0 75%, #B8CCF5 100%)",
    windowBg: "rgba(255, 255, 255, 0.95)",
    titleBarBg: "rgba(230, 235, 245, 0.98)",
    titleText: "rgba(0,0,0,0.65)",
    border: "rgba(0,0,0,0.2)",
    borderFaint: "rgba(0,0,0,0.1)",
    text: "#1a1a1a",
    textSec: "rgba(0,0,0,0.5)",
    textMuted: "rgba(0,0,0,0.4)",
    textFaint: "rgba(0,0,0,0.2)",
    textFaintest: "rgba(0,0,0,0.1)",
    rowBg: "rgba(0,0,0,0.02)",
    barBg: "rgba(0,0,0,0.06)",
    scoreLabel: "rgba(0,0,0,0.65)",
    tagBg: "rgba(5,68,253,0.08)",
    tagText: "#2563EB",
    catBg: "rgba(0,0,0,0.04)",
    catText: "rgba(0,0,0,0.55)",
    green: "#00D4FF",
    greenFaint: "rgba(0,212,255,0.4)",
    logo: "/logo-horizontal-blue.svg",
    plusColor: "rgba(0,0,0,0.03)",
    starColor: "rgba(0,0,0,0.12)",
    shadow: "0 10px 50px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.1)",
    blob1: "rgba(100,50,255,0.06)", blob2: "rgba(0,150,255,0.05)", blob3: "rgba(5,68,253,0.08)",
    avatarBorder: "rgba(0,0,0,0.08)", avatarBg: "rgba(0,0,0,0.03)", avatarText: "rgba(0,0,0,0.35)",
    footer: "rgba(0,0,0,0.3)",
  },
};

const SmartDropCard = forwardRef<HTMLDivElement, Props>(
  ({ accounts, weekNumber, totalSmart, newCount, theme = "dark", showTags = true }, ref) => {
    const c = T[theme];
    const prevTotal = totalSmart - newCount;
    const rowCount = accounts.length;

    // Adaptive card height — always grows to fit all accounts
    // Title bar(40) + header(~80) + col headers+divider(~30) + footer(~40) + window padding from card edge(~45) + safety(~15)
    const fixedHeight = 250;
    const rowSpacing = 4;
    const idealRowHeight = 52; // each row gets this much space
    const neededHeight = fixedHeight + rowCount * idealRowHeight + (rowCount - 1) * rowSpacing;
    const cardHeight = Math.max(675, neededHeight);
    const rowHeight = idealRowHeight;

    // Calculate max tags width across all accounts so all rows use the same Tags column width
    const allTagsPerAccount = accounts.map((acc) => {
      const tags: string[] = [];
      if (acc.category && !["Top Smart", "Smart", "Rising", "New"].includes(acc.category)) tags.push(acc.category);
      if (showTags && acc.tags) for (const t of acc.tags) { if (!tags.includes(t)) tags.push(t); }
      return tags.slice(0, 4);
    });
    // Estimate: each char ~7px + 18px padding + 4px gap between tags
    const maxTagsWidth = Math.max(
      80, // minimum
      ...allTagsPerAccount.map((tags) =>
        tags.reduce((sum, tag) => sum + tag.length * 7 + 18 + 4, 0)
      )
    );
    const rowFontSize = rowHeight >= 46 ? 14 : 13;
    const avatarSize = rowHeight >= 46 ? 48 : rowHeight >= 42 ? 44 : 40;

    return (
      <div ref={ref} style={{
        width: 1200, height: cardHeight, position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: c.outerBg, fontFamily: "'Inter', sans-serif",
      }}>
        {/* Blobs */}
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${c.blob1} 0%, transparent 70%)`, filter: "blur(80px)", top: -100, left: -100 }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${c.blob2} 0%, transparent 70%)`, filter: "blur(60px)", bottom: -80, right: -60 }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle, ${c.blob3} 0%, transparent 70%)`, filter: "blur(70px)", top: "40%", left: "50%", transform: "translate(-50%, -50%)" }} />

        {/* Stars */}
        {[
          { top: "8%", left: "12%", size: 2, opacity: 0.2 }, { top: "15%", left: "78%", size: 3, opacity: 0.12 },
          { top: "45%", left: "5%", size: 2, opacity: 0.15 }, { top: "70%", left: "88%", size: 2, opacity: 0.18 },
          { top: "85%", left: "25%", size: 3, opacity: 0.1 }, { top: "30%", left: "95%", size: 2, opacity: 0.15 },
          { top: "55%", left: "15%", size: 2, opacity: 0.08 }, { top: "20%", left: "50%", size: 3, opacity: 0.1 },
          { top: "75%", left: "60%", size: 2, opacity: 0.12 }, { top: "10%", left: "35%", size: 1, opacity: 0.2 },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", top: s.top, left: s.left, width: s.size, height: s.size, borderRadius: "50%", background: c.starColor, opacity: s.opacity }} />
        ))}

        {/* Plus signs */}
        {[{ top: "12%", left: "8%" }, { top: "80%", left: "92%" }, { top: "5%", left: "68%" }, { top: "92%", left: "18%" }].map((p, i) => (
          <div key={i} style={{ position: "absolute", top: p.top, left: p.left, color: c.plusColor, fontSize: 18 }}>+</div>
        ))}

        {/* Window */}
        <div style={{
          width: 1120, height: cardHeight - 45, background: c.windowBg,
          backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)",
          borderRadius: 16, border: `1px solid ${c.border}`, boxShadow: c.shadow,
          display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 2,
        }}>
          {/* Title bar */}
          <div style={{ height: 40, background: c.titleBarBg, display: "flex", alignItems: "center", padding: "0 18px", gap: 8, borderBottom: `1px solid ${c.borderFaint}`, flexShrink: 0 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
            <div style={{ flex: 1, textAlign: "center" }}>
              <span style={{ fontSize: 14, color: c.titleText, fontWeight: 600 }}>TwitterScore Database</span>
            </div>
          </div>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 28px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img src={c.logo} alt="TwitterScore" style={{ height: 53 }} crossOrigin="anonymous" />
              <div style={{ width: 1, height: 32, background: c.border }} />
              <span style={{ fontSize: 24, fontWeight: 900, color: c.green, letterSpacing: -0.3 }}>
                +{newCount} New Smart Accounts
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: c.green, letterSpacing: -0.5 }}>
                <span style={{ color: c.greenFaint, fontSize: 15 }}>{prevTotal.toLocaleString()} → </span>
                {totalSmart.toLocaleString()}
              </div>
              <div style={{ fontSize: 9, color: c.textMuted, textTransform: "uppercase", letterSpacing: 1.5, marginTop: 1 }}>
                Smart Accounts (+{newCount} this week)
              </div>
            </div>
          </div>

          {/* Column headers */}
          <div style={{ display: "flex", padding: "0 28px", marginBottom: 4 }}>
            <div style={{ width: 80, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: c.textFaint, fontWeight: 700 }}>Status</div>
            <div style={{ width: 210, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: c.textFaint, fontWeight: 700 }}>Account</div>
            <div style={{ width: 70, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: c.textFaint, fontWeight: 700, textAlign: "center" }}>Smarts</div>
            <div style={{ flex: 1, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: c.textFaint, fontWeight: 700 }}>Score</div>
            <div style={{ width: maxTagsWidth, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: c.textFaint, fontWeight: 700 }}>Tags</div>
          </div>
          <div style={{ height: 1, background: c.borderFaint, margin: "0 28px 4px" }} />

          {/* Rows */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: rowSpacing, padding: "0 20px", overflow: "hidden", minHeight: 0 }}>
            {accounts.map((acc, i) => {
              const allTags: string[] = [];
              if (acc.category && !["Top Smart", "Smart", "Rising", "New"].includes(acc.category)) allTags.push(acc.category);
              if (showTags && acc.tags) for (const t of acc.tags) { if (!allTags.includes(t)) allTags.push(t); }

              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", height: rowHeight, padding: "0 12px",
                  borderRadius: 8, background: i % 2 === 0 ? c.rowBg : "transparent",
                }}>
                  {/* Smart */}
                  <div style={{ width: 80, color: c.green, fontWeight: 700, fontSize: 12 }}>+ ADDED</div>

                  {/* Account */}
                  <div style={{ width: 210, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <div style={{ width: avatarSize, height: avatarSize, borderRadius: "50%", overflow: "hidden", border: `2px solid ${c.avatarBorder}`, background: c.avatarBg, flexShrink: 0 }}>
                      {acc.avatar ? (
                        <img src={acc.avatar} alt={acc.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: c.avatarText }}>
                          {acc.username[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: rowFontSize, fontWeight: 700, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      @{acc.username}
                    </span>
                  </div>

                  {/* Smarts count */}
                  <div style={{ width: 70, textAlign: "center", fontSize: 12, fontWeight: 700, color: theme === "dark" ? "#4FC3FF" : "#2563EB", flexShrink: 0 }}>
                    {acc.smartFollowers ? acc.smartFollowers.toLocaleString() : "✓"}
                  </div>

                  {/* Score Bar — same width for all rows */}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 10, borderRadius: 6, background: c.barBg, overflow: "hidden" }}>
                      {scoreToPercent(acc.score) > 0 && (
                        <div style={{
                          width: `${scoreToPercent(acc.score)}%`, height: "100%", borderRadius: 6,
                          background: SCORE_GRADIENT, backgroundSize: scoreBarBgSize(acc.score),
                          backgroundPosition: "left", backgroundRepeat: "no-repeat",
                        }} />
                      )}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: c.scoreLabel, minWidth: 40, textAlign: "right", flexShrink: 0 }}>
                      {formatScore(acc.score)}
                    </span>
                  </div>

                  {/* Tags — fixed width, single row, left-aligned */}
                  <div style={{ width: maxTagsWidth, display: "flex", gap: 4, alignItems: "center", justifyContent: "flex-start", flexShrink: 0, marginLeft: 12 }}>
                    {allTags.slice(0, 4).map((tag, ti) => {
                      const isCat = ti === 0 && acc.category && !["Top Smart", "Smart", "Rising", "New"].includes(acc.category);
                      return (
                        <span key={ti} style={{
                          background: isCat ? c.catBg : c.tagBg,
                          color: isCat ? c.catText : c.tagText,
                          padding: "3px 9px", borderRadius: 8, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                        }}>{tag}</span>
                      );
                    })}
                    {allTags.length === 0 && (
                      <span style={{ color: c.textFaintest, fontSize: 11 }}>—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 28px", borderTop: `1px solid ${c.borderFaint}`, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: c.footer, textTransform: "uppercase", letterSpacing: 1, fontWeight: 500 }}>twitterscore.io</span>
            <span style={{ fontSize: 11, color: c.footer, textTransform: "uppercase", letterSpacing: 1, fontWeight: 500 }}>11M+ Accounts Tracked · Real-Time Scoring</span>
            <span style={{ fontSize: 11, color: c.footer, textTransform: "uppercase", letterSpacing: 1, fontWeight: 500 }}>@Twiter_score</span>
          </div>
        </div>
      </div>
    );
  }
);

SmartDropCard.displayName = "SmartDropCard";
export default SmartDropCard;
