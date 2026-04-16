"use client";

import { forwardRef } from "react";
import { AccountData } from "./SmartDropCard";

export type ProjectsTheme = "light" | "dark";
export type ProjectsLayout = "bars" | "bars-custom" | "bars-metric" | "grid" | "podium" | "tiles";

export interface CustomColumnData {
  line1: string;
  line2?: string;
}

/**
 * Generic metric column for ranking by ANY numeric metric (not TwitterScore).
 * Used by Leaderboard (TVL) and Funding Rounds (Fundraising amount).
 *   - `label`: column header, e.g. "TVL", "Fundraising"
 *   - `displays`: formatted strings per row, e.g. ["$746.7M", "$402.3M"]
 *   - `values`: optional raw numbers for bar length scaling
 *   - `diffs`: optional % changes shown as colored badges next to display
 */
export interface MetricColumn {
  label: string;
  displays: string[];
  values?: number[];
  diffs?: number[];
}

interface Props {
  accounts: AccountData[];
  title: string;
  subtitle: string;
  diffPeriod: "week" | "month";
  layout: ProjectsLayout;
  theme?: ProjectsTheme;
  filters?: string[];
  showTags?: boolean;
  customColumnHeader?: string;
  customColumnData?: Record<number, CustomColumnData>; // index -> data
  metricColumn?: MetricColumn; // bars-metric layout data
}

function getDiff(acc: AccountData, period: "week" | "month"): number {
  return period === "week" ? (acc.weekDiff || 0) : (acc.monthDiff || 0);
}

function formatDiff(diff: number): string {
  if (diff > 0) return `↑ +${Math.round(diff)}`;
  if (diff < 0) return `↓ ${Math.round(diff)}`;
  return "—";
}

function diffColor(diff: number, c: ThemeColors): string {
  if (diff > 0) return "#22C55E";
  if (diff < 0) return "#EF4444";
  return c.textMuted;
}

function formatScore(score: number): string {
  if (score >= 100) return Math.round(score).toString();
  if (score >= 10) return score.toFixed(1);
  return score.toFixed(2);
}

function getRankDisplay(i: number): string {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return `${i + 1}`;
}

// Official TwitterScore formula: y = round(⁴√(score × 100000))
// Non-linear scale: small scores get visible bars, large scores fill more
function scoreToPercent(score: number): number {
  if (score <= 0) return 0;
  return Math.min(Math.round(Math.pow(score * 100000, 0.25)), 100);
}
function scoreBarBgSize(score: number): string {
  const pct = scoreToPercent(score);
  if (pct <= 0) return "100% 100%";
  return `${(100 / pct) * 100}% 100%`;
}

const SCORE_GRADIENT = "linear-gradient(90deg, #FF4B04 0%, #F2DB06 52%, #12E83B 100%)";

interface ThemeColors {
  bg: string; cardBg: string; border: string; headerBg: string;
  text: string; textSec: string; textMuted: string; scoreBar: string;
  tagBg: string; tagText: string; tagBorder: string;
  badgeBg: string; badgeBorder: string; badgeText: string;
  footer: string; logo: string;
  tileBg: string; tileBorder: string; tileText: string; tileSec: string;
  filterBg: string; filterActive: string;
  goldBorder: string; silverBorder: string; bronzeBorder: string;
}

const themes: Record<string, ThemeColors> = {
  dark: {
    bg: "#121212", cardBg: "#1E1E1E", border: "#444", headerBg: "rgba(255,255,255,0.06)",
    text: "#fff", textSec: "#808080", textMuted: "#555", scoreBar: "#333",
    tagBg: "rgba(255,255,255,0.06)", tagText: "rgba(255,255,255,0.5)", tagBorder: "rgba(255,255,255,0.08)",
    badgeBg: "rgba(34,197,94,0.1)", badgeBorder: "rgba(34,197,94,0.2)", badgeText: "#22C55E",
    footer: "rgba(255,255,255,0.25)", logo: "/logo-horizontal-white.svg",
    tileBg: "#161B22", tileBorder: "#21262D", tileText: "#E6EDF3", tileSec: "#484F58",
    filterBg: "rgba(255,255,255,0.06)", filterActive: "#2563EB",
    goldBorder: "rgba(234,179,8,0.4)", silverBorder: "rgba(148,163,184,0.3)", bronzeBorder: "rgba(180,83,9,0.3)",
  },
  light: {
    bg: "#F5F5F5", cardBg: "#FFFFFF", border: "#E5E7EB", headerBg: "#2563EB",
    text: "#1A1A1A", textSec: "#6B7280", textMuted: "#9CA3AF", scoreBar: "#F2F3F6",
    tagBg: "#F3F4F6", tagText: "#4B5563", tagBorder: "#E5E7EB",
    badgeBg: "#EFF6FF", badgeBorder: "#DBEAFE", badgeText: "#2563EB",
    footer: "#9CA3AF", logo: "/logo-horizontal-blue.svg",
    tileBg: "#FFFFFF", tileBorder: "#E5E7EB", tileText: "#1A1A1A", tileSec: "#6B7280",
    filterBg: "#F3F4F6", filterActive: "#2563EB",
    goldBorder: "rgba(234,179,8,0.5)", silverBorder: "rgba(148,163,184,0.4)", bronzeBorder: "rgba(180,83,9,0.4)",
  },
};

function scoreBarEl(score: number, height: number, bgColor: string, radius: number) {
  const pct = scoreToPercent(score);
  return (
    <div style={{ flex: 1, height, background: bgColor, borderRadius: 0, overflow: "hidden" }}>
      {pct > 0 && (
        <div style={{
          width: `${pct}%`,
          height: "100%",
          background: SCORE_GRADIENT,
          backgroundSize: scoreBarBgSize(score),
          backgroundPosition: "left",
          backgroundRepeat: "no-repeat",
          borderRadius: 0,
        }} />
      )}
    </div>
  );
}

function avatarEl(acc: AccountData, size: number, borderColor: string, bgColor: string, mutedColor: string) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bgColor, border: `2px solid ${borderColor}`, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {acc.avatar
        ? <img src={acc.avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
        : <span style={{ color: mutedColor, fontWeight: 700, fontSize: size * 0.38 }}>{acc.username[0]?.toUpperCase()}</span>}
    </div>
  );
}

function categoryTag(acc: AccountData, c: ThemeColors) {
  if (!acc.category || ["Top Smart", "Smart", "Rising", "New"].includes(acc.category)) return null;
  return <span style={{ background: c.tagBg, color: c.tagText, border: `1px solid ${c.tagBorder}`, padding: "2px 8px", borderRadius: 10, fontSize: 9, fontWeight: 600, whiteSpace: "nowrap" }}>{acc.category}</span>;
}

// SmartDrop-style theme colors for Bars layout
const barsThemes = {
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
    barBg: "rgba(255,255,255,0.08)",
    scoreLabel: "rgba(255,255,255,0.75)",
    tagBg: "rgba(74,158,255,0.12)",
    tagText: "rgba(74,158,255,0.85)",
    catBg: "rgba(255,255,255,0.08)",
    catText: "rgba(255,255,255,0.6)",
    rowBg: "rgba(255,255,255,0.025)",
    green: "#00FF88",
    logo: "/logo-horizontal-white.svg",
    shadow: "0 30px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
    blob1: "rgba(100,50,255,0.3)", blob2: "rgba(0,200,255,0.2)", blob3: "rgba(5,68,253,0.4)",
    starColor: "white", plusColor: "rgba(255,255,255,0.04)",
    avatarBorder: "rgba(255,255,255,0.1)", avatarBg: "rgba(255,255,255,0.05)", avatarText: "rgba(255,255,255,0.4)",
    footer: "rgba(255,255,255,0.35)",
    smartsColor: "#4FC3FF",
    badgeBg: "rgba(34,197,94,0.1)", badgeBorder: "rgba(34,197,94,0.2)", badgeText: "#22C55E",
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
    barBg: "rgba(0,0,0,0.06)",
    scoreLabel: "rgba(0,0,0,0.65)",
    tagBg: "rgba(5,68,253,0.08)",
    tagText: "#2563EB",
    catBg: "rgba(0,0,0,0.04)",
    catText: "rgba(0,0,0,0.55)",
    rowBg: "rgba(0,0,0,0.02)",
    green: "#00D4FF",
    logo: "/logo-horizontal-blue.svg",
    shadow: "0 10px 50px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.1)",
    blob1: "rgba(100,50,255,0.06)", blob2: "rgba(0,150,255,0.05)", blob3: "rgba(5,68,253,0.08)",
    starColor: "rgba(0,0,0,0.12)", plusColor: "rgba(0,0,0,0.03)",
    avatarBorder: "rgba(0,0,0,0.08)", avatarBg: "rgba(0,0,0,0.03)", avatarText: "rgba(0,0,0,0.35)",
    footer: "rgba(0,0,0,0.3)",
    smartsColor: "#2563EB",
    badgeBg: "#EFF6FF", badgeBorder: "#DBEAFE", badgeText: "#2563EB",
  },
};

// ============ LAYOUT 1: HORIZONTAL BARS (SmartDrop-style window) ============
function BarsLayout({ accounts, title, subtitle, diffPeriod, theme, showTags = true }: Omit<Props, "layout">) {
  const b = barsThemes[theme || "dark"];

  // Calculate max tags width
  const allTagsPerAccount = accounts.map((acc) => {
    const tags: string[] = [];
    if (acc.category && !["Top Smart", "Smart", "Rising", "New"].includes(acc.category)) tags.push(acc.category);
    if (showTags && acc.tags) for (const t of acc.tags) { if (!tags.includes(t)) tags.push(t); }
    return tags.slice(0, 3);
  });
  const maxTagsWidth = Math.max(80, ...allTagsPerAccount.map((tags) => tags.reduce((sum, tag) => sum + tag.length * 7 + 18 + 4, 0)));

  const rowCount = accounts.length;
  const rowSpacing = 4;
  const rowHeight = 52;
  // Dynamic height: grow if many accounts
  const fixedHeight = 250; // title bar + header + col headers + footer + padding
  const neededHeight = fixedHeight + rowCount * rowHeight + (rowCount - 1) * rowSpacing;
  const cardHeight = Math.max(675, neededHeight);
  const windowHeight = cardHeight - 45;

  return (
    <SmartWindow theme={theme || "dark"} cardHeight={cardHeight}>
      {/* Header with logo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 28px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={b.logo} alt="TwitterScore" style={{ height: 53 }} crossOrigin="anonymous" />
          <div style={{ width: 1, height: 32, background: b.border }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: b.text, letterSpacing: -0.5 }}>{title}</div>
            <div style={{ fontSize: 12, color: b.textSec, marginTop: 2 }}>{subtitle}</div>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: "flex", padding: "0 28px", marginBottom: 4 }}>
        <div style={{ width: 28, marginRight: 12 }} />
        <div style={{ width: 190, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: b.textFaint, fontWeight: 700 }}>Account</div>
        <div style={{ width: 70, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: b.textFaint, fontWeight: 700, textAlign: "center" }}>Smarts</div>
        <div style={{ flex: 1, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: b.textFaint, fontWeight: 700 }}>Score</div>
        <div style={{ width: maxTagsWidth, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: b.textFaint, fontWeight: 700 }}>Tags</div>
      </div>
      <div style={{ height: 1, background: b.borderFaint, margin: "0 28px 4px" }} />

      {/* Rows */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: rowSpacing, padding: "0 20px", overflow: "hidden", minHeight: 0 }}>
        {accounts.map((acc, i) => {
          const diff = getDiff(acc, diffPeriod);
          const allTags: string[] = [];
          if (acc.category && !["Top Smart", "Smart", "Rising", "New"].includes(acc.category)) allTags.push(acc.category);
          if (showTags && acc.tags) for (const t of acc.tags) { if (!allTags.includes(t)) allTags.push(t); }

          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", height: rowHeight, padding: "0 12px",
              borderRadius: 8, background: i % 2 === 0 ? b.rowBg : "transparent",
            }}>
              <div style={{ width: 28, fontSize: i < 3 ? 17 : 13, fontWeight: 700, color: i >= 3 ? b.textMuted : undefined, textAlign: "center", marginRight: 12 }}>{getRankDisplay(i)}</div>
              <div style={{ width: 190, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: `2px solid ${b.avatarBorder}`, background: b.avatarBg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {acc.avatar
                    ? <img src={acc.avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
                    : <span style={{ color: b.avatarText, fontWeight: 700, fontSize: 15 }}>{acc.username[0]?.toUpperCase()}</span>}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: b.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{acc.name || acc.username}</span>
              </div>
              <div style={{ width: 70, textAlign: "center", fontSize: 12, fontWeight: 700, color: b.smartsColor, flexShrink: 0 }}>
                {acc.smartFollowers ? acc.smartFollowers.toLocaleString() : "—"}
              </div>
              <div style={{ flex: 1, height: 28, borderRadius: 14, background: b.barBg, overflow: "hidden", display: "flex" }}>
                {scoreToPercent(acc.score) > 0 && (
                  <div style={{
                    width: `${Math.max(scoreToPercent(acc.score), 12)}%`, height: "100%", borderRadius: 14,
                    background: SCORE_GRADIENT, backgroundSize: scoreBarBgSize(acc.score),
                    backgroundPosition: "left", backgroundRepeat: "no-repeat",
                    display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 4 }}>
                      {formatScore(acc.score)}
                      {diff !== 0 && <span style={{ fontSize: 10, fontWeight: 700, color: diff > 0 ? "#B6FFD8" : "#FFB6B6" }}>{diff > 0 ? `▲+${Math.abs(Math.round(diff))}` : `▼${Math.round(diff)}`}</span>}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ width: maxTagsWidth, display: "flex", gap: 4, alignItems: "center", justifyContent: "flex-start", flexShrink: 0, marginLeft: 10 }}>
                {allTags.slice(0, 3).map((tag, ti) => {
                  const isCat = ti === 0 && acc.category && !["Top Smart", "Smart", "Rising", "New"].includes(acc.category);
                  return (
                    <span key={ti} style={{
                      background: isCat ? b.catBg : b.tagBg,
                      color: isCat ? b.catText : b.tagText,
                      padding: "3px 9px", borderRadius: 8, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                    }}>{tag}</span>
                  );
                })}
                {allTags.length === 0 && (
                  <span style={{ color: b.textFaint, fontSize: 11 }}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SmartWindow>
  );
}

// ============ LAYOUT 1C: BARS + GENERIC METRIC (TVL / Fundraising / Revenue) ============
// Like BarsLayout, but ranks by a custom numeric metric (e.g. TVL) instead of TwitterScore.
// Bar length scales to max metric value. TS score moves to a secondary column.
function BarsMetricLayout({ accounts, title, subtitle, theme, showTags = true, metricColumn }: Omit<Props, "layout">) {
  const b = barsThemes[theme || "dark"];
  const metric = metricColumn || { label: "Metric", displays: [] as string[] };

  // Tags width (same logic as BarsLayout)
  const allTagsPerAccount = accounts.map((acc) => {
    const tags: string[] = [];
    if (acc.category && !["Top Smart", "Smart", "Rising", "New"].includes(acc.category)) tags.push(acc.category);
    if (showTags && acc.tags) for (const t of acc.tags) { if (!tags.includes(t)) tags.push(t); }
    return tags.slice(0, 3);
  });
  const maxTagsWidth = Math.max(80, ...allTagsPerAccount.map((tags) => tags.reduce((sum, tag) => sum + tag.length * 7 + 18 + 4, 0)));

  // Bar length scaling — relative to max metric value so #1 fills the bar
  const rawValues = metric.values || [];
  const maxVal = rawValues.length ? Math.max(...rawValues) : 1;
  const barPct = (i: number): number => {
    if (!rawValues.length || !rawValues[i]) return 0;
    const raw = (rawValues[i] / maxVal) * 100;
    return Math.max(raw, 12); // min 12% floor so smallest bar is still visible
  };

  const rowCount = accounts.length;
  const rowSpacing = 4;
  const rowHeight = 52;
  const fixedHeight = 250;
  const neededHeight = fixedHeight + rowCount * rowHeight + (rowCount - 1) * rowSpacing;
  const cardHeight = Math.max(675, neededHeight);

  return (
    <SmartWindow theme={theme || "dark"} cardHeight={cardHeight}>
      {/* Header with logo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 28px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={b.logo} alt="TwitterScore" style={{ height: 53 }} crossOrigin="anonymous" />
          <div style={{ width: 1, height: 32, background: b.border }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: b.text, letterSpacing: -0.5 }}>{title}</div>
            <div style={{ fontSize: 12, color: b.textSec, marginTop: 2 }}>{subtitle}</div>
          </div>
        </div>
      </div>

      {/* Column headers — rank | Project | TS | <metric label> | Tags */}
      <div style={{ display: "flex", padding: "0 28px", marginBottom: 4 }}>
        <div style={{ width: 28, marginRight: 12 }} />
        <div style={{ width: 190, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: b.textFaint, fontWeight: 700 }}>Project</div>
        <div style={{ width: 60, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: b.textFaint, fontWeight: 700, textAlign: "center" }}>TS</div>
        <div style={{ flex: 1, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: b.textFaint, fontWeight: 700 }}>{metric.label}</div>
        <div style={{ width: maxTagsWidth, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: b.textFaint, fontWeight: 700 }}>Tags</div>
      </div>
      <div style={{ height: 1, background: b.borderFaint, margin: "0 28px 4px" }} />

      {/* Rows */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: rowSpacing, padding: "0 20px", overflow: "hidden", minHeight: 0 }}>
        {accounts.map((acc, i) => {
          const display = metric.displays[i] || "—";
          const diff = metric.diffs?.[i];
          const pct = barPct(i);
          const allTags: string[] = [];
          if (acc.category && !["Top Smart", "Smart", "Rising", "New"].includes(acc.category)) allTags.push(acc.category);
          if (showTags && acc.tags) for (const t of acc.tags) { if (!allTags.includes(t)) allTags.push(t); }

          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", height: rowHeight, padding: "0 12px",
              borderRadius: 8, background: i % 2 === 0 ? b.rowBg : "transparent",
            }}>
              {/* Rank */}
              <div style={{ width: 28, fontSize: i < 3 ? 17 : 13, fontWeight: 700, color: i >= 3 ? b.textMuted : undefined, textAlign: "center", marginRight: 12 }}>{getRankDisplay(i)}</div>

              {/* Project name + avatar */}
              <div style={{ width: 190, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: `2px solid ${b.avatarBorder}`, background: b.avatarBg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {acc.avatar
                    ? <img src={acc.avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
                    : <span style={{ color: b.avatarText, fontWeight: 700, fontSize: 15 }}>{(acc.name || acc.username)[0]?.toUpperCase()}</span>}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: b.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
                  {acc.name || acc.username}
                </span>
              </div>

              {/* TS score (secondary) */}
              <div style={{ width: 60, textAlign: "center", fontSize: 12, fontWeight: 700, color: b.smartsColor, flexShrink: 0 }}>
                {acc.score > 0 ? formatScore(acc.score) : "—"}
              </div>

              {/* Metric bar */}
              <div style={{ flex: 1, height: 28, borderRadius: 14, background: b.barBg, overflow: "hidden", display: "flex" }}>
                {pct > 0 && (
                  <div style={{
                    width: `${pct}%`, height: "100%", borderRadius: 14,
                    background: SCORE_GRADIENT,
                    display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 6 }}>
                      {display}
                      {diff !== undefined && diff !== 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: diff > 0 ? "#B6FFD8" : "#FFB6B6" }}>
                          {diff > 0 ? `▲+${diff.toFixed(1)}%` : `▼${diff.toFixed(1)}%`}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {pct === 0 && (
                  <div style={{ padding: "0 10px", display: "flex", alignItems: "center", color: b.textMuted, fontSize: 12, fontWeight: 700 }}>
                    {display}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div style={{ width: maxTagsWidth, display: "flex", gap: 4, alignItems: "center", justifyContent: "flex-start", flexShrink: 0, marginLeft: 10 }}>
                {allTags.slice(0, 3).map((tag, ti) => {
                  const isCat = ti === 0 && acc.category && !["Top Smart", "Smart", "Rising", "New"].includes(acc.category);
                  return (
                    <span key={ti} style={{
                      background: isCat ? b.catBg : b.tagBg,
                      color: isCat ? b.catText : b.tagText,
                      padding: "3px 9px", borderRadius: 8, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                    }}>{tag}</span>
                  );
                })}
                {allTags.length === 0 && (
                  <span style={{ color: b.textFaint, fontSize: 11 }}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SmartWindow>
  );
}

// ============ LAYOUT 1B: BARS + CUSTOM COLUMN ============
function BarsCustomLayout({ accounts, title, subtitle, diffPeriod, theme, showTags = true, customColumnHeader = "Notes", customColumnData = {} }: Omit<Props, "layout">) {
  const b = barsThemes[(theme as "dark" | "light") || "dark"];

  const allTagsPerAccount = accounts.map((acc) => {
    const tags: string[] = [];
    if (acc.category && !["Top Smart", "Smart", "Rising", "New"].includes(acc.category)) tags.push(acc.category);
    if (showTags && acc.tags) for (const t of acc.tags) { if (!tags.includes(t)) tags.push(t); }
    return tags.slice(0, 2);
  });
  const maxTagsWidth = Math.max(60, ...allTagsPerAccount.map((tags) => tags.reduce((sum, tag) => sum + tag.length * 7 + 18 + 4, 0)));

  const rowCount = accounts.length;
  const rowSpacing = 4;
  const rowHeight = 52;
  const customColWidth = 160;
  const fixedHeight = 250;
  const neededHeight = fixedHeight + rowCount * rowHeight + (rowCount - 1) * rowSpacing;
  const cardHeight = Math.max(675, neededHeight);

  return (
    <SmartWindow theme={theme || "dark"} cardHeight={cardHeight}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 28px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={b.logo} alt="TwitterScore" style={{ height: 53 }} crossOrigin="anonymous" />
          <div style={{ width: 1, height: 32, background: b.border }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: b.text, letterSpacing: -0.5 }}>{title}</div>
            <div style={{ fontSize: 12, color: b.textSec, marginTop: 2 }}>{subtitle}</div>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: "flex", padding: "0 28px", marginBottom: 4 }}>
        <div style={{ width: 28, marginRight: 12 }} />
        <div style={{ width: 170, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: b.textFaint, fontWeight: 700 }}>Account</div>
        <div style={{ width: 70, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: b.textFaint, fontWeight: 700, textAlign: "center" }}>Smarts</div>
        <div style={{ flex: 1, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: b.textFaint, fontWeight: 700 }}>Score</div>
        <div style={{ width: maxTagsWidth, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: b.textFaint, fontWeight: 700 }}>Tags</div>
        <div style={{ width: customColWidth, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: b.textFaint, fontWeight: 700, textAlign: "center" }}>{customColumnHeader}</div>
      </div>
      <div style={{ height: 1, background: b.borderFaint, margin: "0 28px 4px" }} />

      {/* Rows */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: rowSpacing, padding: "0 20px", overflow: "hidden", minHeight: 0 }}>
        {accounts.map((acc, i) => {
          const diff = getDiff(acc, diffPeriod);
          const allTags: string[] = [];
          if (acc.category && !["Top Smart", "Smart", "Rising", "New"].includes(acc.category)) allTags.push(acc.category);
          if (showTags && acc.tags) for (const t of acc.tags) { if (!allTags.includes(t)) allTags.push(t); }
          const custom = customColumnData[i];

          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", height: rowHeight, padding: "0 12px",
              borderRadius: 8, background: i % 2 === 0 ? b.rowBg : "transparent",
            }}>
              <div style={{ width: 28, fontSize: i < 3 ? 17 : 13, fontWeight: 700, color: i >= 3 ? b.textMuted : undefined, textAlign: "center", marginRight: 12 }}>{getRankDisplay(i)}</div>
              <div style={{ width: 170, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: `2px solid ${b.avatarBorder}`, background: b.avatarBg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {acc.avatar
                    ? <img src={acc.avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
                    : <span style={{ color: b.avatarText, fontWeight: 700, fontSize: 13 }}>{acc.username[0]?.toUpperCase()}</span>}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: b.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{acc.name || acc.username}</span>
              </div>
              <div style={{ width: 70, textAlign: "center", fontSize: 12, fontWeight: 700, color: b.smartsColor, flexShrink: 0 }}>
                {acc.smartFollowers ? acc.smartFollowers.toLocaleString() : "—"}
              </div>
              <div style={{ flex: 1, height: 28, borderRadius: 14, background: b.barBg, overflow: "hidden", display: "flex" }}>
                {scoreToPercent(acc.score) > 0 && (
                  <div style={{
                    width: `${Math.max(scoreToPercent(acc.score), 12)}%`, height: "100%", borderRadius: 14,
                    background: SCORE_GRADIENT, backgroundSize: scoreBarBgSize(acc.score),
                    backgroundPosition: "left", backgroundRepeat: "no-repeat",
                    display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 4 }}>
                      {formatScore(acc.score)}
                      {diff !== 0 && <span style={{ fontSize: 10, fontWeight: 700, color: diff > 0 ? "#B6FFD8" : "#FFB6B6" }}>{diff > 0 ? `▲+${Math.abs(Math.round(diff))}` : `▼${Math.round(diff)}`}</span>}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ width: maxTagsWidth, display: "flex", gap: 4, alignItems: "center", justifyContent: "flex-start", flexShrink: 0, marginLeft: 10 }}>
                {allTags.slice(0, 2).map((tag, ti) => {
                  const isCat = ti === 0 && acc.category && !["Top Smart", "Smart", "Rising", "New"].includes(acc.category);
                  return (
                    <span key={ti} style={{
                      background: isCat ? b.catBg : b.tagBg,
                      color: isCat ? b.catText : b.tagText,
                      padding: "3px 8px", borderRadius: 8, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap",
                    }}>{tag}</span>
                  );
                })}
                {allTags.length === 0 && <span style={{ color: b.textFaint, fontSize: 11 }}>—</span>}
              </div>
              {/* Custom column */}
              <div style={{ width: customColWidth, textAlign: "center", flexShrink: 0 }}>
                {custom ? (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: b.text, lineHeight: 1.3 }}>{custom.line1}</div>
                    {custom.line2 && <div style={{ fontSize: 10, fontWeight: 500, color: b.textMuted, lineHeight: 1.2, marginTop: 1 }}>{custom.line2}</div>}
                  </div>
                ) : (
                  <span style={{ color: b.textFaint, fontSize: 11 }}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SmartWindow>
  );
}

// ============ SHARED SMARTDROP-STYLE WINDOW WRAPPER ============
function SmartWindow({ theme, cardHeight, children }: { theme: string; cardHeight: number; children: React.ReactNode }) {
  const b = barsThemes[(theme as "dark" | "light") || "dark"];
  const windowHeight = cardHeight - 45;

  return (
    <div style={{ width: 1200, height: cardHeight, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: b.outerBg, fontFamily: "'Inter', sans-serif" }}>
      {/* Blobs */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${b.blob1} 0%, transparent 70%)`, filter: "blur(80px)", top: -100, left: -100 }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${b.blob2} 0%, transparent 70%)`, filter: "blur(60px)", bottom: -80, right: -60 }} />
      <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle, ${b.blob3} 0%, transparent 70%)`, filter: "blur(70px)", top: "40%", left: "50%", transform: "translate(-50%, -50%)" }} />

      {/* Stars */}
      {[
        { top: "8%", left: "12%", size: 2, opacity: 0.2 }, { top: "15%", left: "78%", size: 3, opacity: 0.12 },
        { top: "45%", left: "5%", size: 2, opacity: 0.15 }, { top: "70%", left: "88%", size: 2, opacity: 0.18 },
        { top: "85%", left: "25%", size: 3, opacity: 0.1 }, { top: "30%", left: "95%", size: 2, opacity: 0.15 },
      ].map((s, i) => (
        <div key={i} style={{ position: "absolute", top: s.top, left: s.left, width: s.size, height: s.size, borderRadius: "50%", background: b.starColor, opacity: s.opacity }} />
      ))}

      {/* Plus signs */}
      {[{ top: "12%", left: "8%" }, { top: "80%", left: "92%" }, { top: "5%", left: "68%" }, { top: "92%", left: "18%" }].map((p, i) => (
        <div key={i} style={{ position: "absolute", top: p.top, left: p.left, color: b.plusColor, fontSize: 18 }}>+</div>
      ))}

      {/* Window */}
      <div style={{
        width: 1120, height: windowHeight, background: b.windowBg,
        backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)",
        borderRadius: 16, border: `1px solid ${b.border}`, boxShadow: b.shadow,
        display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 2,
      }}>
        {/* Title bar with macOS dots */}
        <div style={{ height: 40, background: b.titleBarBg, display: "flex", alignItems: "center", padding: "0 18px", gap: 8, borderBottom: `1px solid ${b.borderFaint}`, flexShrink: 0 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <span style={{ fontSize: 14, color: b.titleText, fontWeight: 600 }}>TwitterScore Database</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {children}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 28px", borderTop: `1px solid ${b.borderFaint}`, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: b.footer, textTransform: "uppercase", letterSpacing: 1, fontWeight: 500 }}>twitterscore.io</span>
          <span style={{ fontSize: 11, color: b.footer, textTransform: "uppercase", letterSpacing: 1, fontWeight: 500 }}>11M+ Accounts Tracked · Real-Time Scoring</span>
          <span style={{ fontSize: 11, color: b.footer, textTransform: "uppercase", letterSpacing: 1, fontWeight: 500 }}>@Twiter_score</span>
        </div>
      </div>
    </div>
  );
}

// ============ LAYOUT 2: CARD GRID ============
function GridLayout({ accounts, title, subtitle, diffPeriod, theme, showTags = true }: Omit<Props, "layout">) {
  const b = barsThemes[(theme as "dark" | "light") || "dark"];
  const c = themes[theme || "dark"];
  const count = accounts.length;
  const cols = count <= 4 ? 2 : count <= 6 ? 3 : count <= 8 ? 4 : 5;
  const rows = Math.ceil(count / cols);
  const avatarSz = count <= 6 ? 48 : count <= 8 ? 42 : 36;
  const scoreSz = count <= 6 ? 26 : count <= 8 ? 22 : 18;
  const nameSz = count <= 6 ? 13 : 11;

  // Dynamic height: header ~70 + grid rows * ~140 + padding
  const cellHeight = count <= 6 ? 140 : count <= 8 ? 120 : 105;
  const contentHeight = 80 + rows * cellHeight + (rows - 1) * 8;
  const cardHeight = Math.max(675, contentHeight + 110); // +110 for titlebar + footer + outer padding

  return (
    <SmartWindow theme={theme || "dark"} cardHeight={cardHeight}>
      <div style={{ padding: "10px 28px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={b.logo} alt="TwitterScore" style={{ height: 53 }} crossOrigin="anonymous" />
          <div style={{ width: 1, height: 28, background: b.border }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: b.text, letterSpacing: -0.5 }}>{title}</div>
            <div style={{ fontSize: 12, color: b.textSec, marginTop: 2 }}>{subtitle}</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 8, padding: "0 20px 8px", overflow: "hidden" }}>
        {accounts.map((acc, i) => {
          const diff = getDiff(acc, diffPeriod);
          const borderColor = i === 0 ? c.goldBorder : i === 1 ? c.silverBorder : i === 2 ? c.bronzeBorder : b.borderFaint;
          return (
            <div key={i} style={{ background: b.rowBg, border: `1px solid ${borderColor}`, borderRadius: 12, padding: "10px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", minHeight: 0 }}>
              <div style={{ position: "absolute", top: 6, left: 10, fontSize: i < 3 ? 15 : 11, fontWeight: 700, color: b.textMuted }}>{getRankDisplay(i)}</div>
              {avatarEl(acc, avatarSz, b.avatarBorder, b.avatarBg, b.avatarText)}
              <div style={{ fontSize: nameSz, fontWeight: 800, color: b.text, textAlign: "center", marginTop: 4, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{acc.name || acc.username}</div>
              <div style={{ fontSize: 9, color: b.textSec }}>@{acc.username}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 4 }}>
                <span style={{ fontSize: scoreSz, fontWeight: 900, color: b.text }}>{formatScore(acc.score)}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: diff > 0 ? "#22C55E" : diff < 0 ? "#EF4444" : b.textMuted }}>{diff > 0 ? `↑ +${Math.round(diff)}` : diff < 0 ? `↓ ${Math.round(diff)}` : ""}</span>
              </div>
              <div style={{ width: "90%", marginTop: 4, height: 4, borderRadius: 2, background: b.barBg, overflow: "hidden" }}>
                {scoreToPercent(acc.score) > 0 && (
                  <div style={{ width: `${scoreToPercent(acc.score)}%`, height: "100%", borderRadius: 2, background: SCORE_GRADIENT, backgroundSize: scoreBarBgSize(acc.score), backgroundPosition: "left", backgroundRepeat: "no-repeat" }} />
                )}
              </div>
              <div style={{ marginTop: 3 }}>{categoryTag(acc, c)}</div>
            </div>
          );
        })}
      </div>
    </SmartWindow>
  );
}

// ============ LAYOUT 3: PODIUM + LIST ============
function PodiumLayout({ accounts, title, subtitle, diffPeriod, theme, showTags = true }: Omit<Props, "layout">) {
  const b = barsThemes[(theme as "dark" | "light") || "dark"];
  const c = themes[theme || "dark"];
  const top3 = accounts.slice(0, 3);
  const rest = accounts.slice(3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const medals = top3.length >= 3 ? ["🥈", "🥇", "🥉"] : ["🥇", "🥈", "🥉"];
  const borderColors = top3.length >= 3
    ? [c.silverBorder, c.goldBorder, c.bronzeBorder]
    : [c.goldBorder, c.silverBorder, c.bronzeBorder];
  const isCenter = (pi: number) => top3.length >= 3 ? pi === 1 : pi === 0;

  // Dynamic height
  const podiumHeight = 300;
  const perRow = Math.min(rest.length, 7);
  const restRows = rest.length > 0 ? Math.ceil(rest.length / perRow) : 0;
  const restRowHeight = 150; // each row of rest items (avatar+name+score+bar+diff)
  const cardHeight = Math.max(675, 110 + 80 + podiumHeight + restRows * restRowHeight + 60);

  return (
    <SmartWindow theme={theme || "dark"} cardHeight={cardHeight}>
      {/* Centered header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 28px 8px" }}>
        <img src={b.logo} alt="TwitterScore" style={{ height: 42 }} crossOrigin="anonymous" />
        <div style={{ fontSize: 22, fontWeight: 900, color: b.text, marginTop: 6 }}>{title}</div>
        <div style={{ fontSize: 11, color: b.textSec, marginTop: 2 }}>{subtitle}</div>
      </div>

      {/* Podium */}
      <div style={{ display: "flex", justifyContent: "center", gap: 14, padding: "0 28px", marginBottom: 14, alignItems: "flex-end", flex: rest.length > 0 ? undefined : 1 }}>
        {podiumOrder.map((acc, pi) => {
          if (!acc) return null;
          const diff = getDiff(acc, diffPeriod);
          const center = isCenter(pi);
          return (
            <div key={pi} style={{
              background: b.rowBg, borderRadius: 14, padding: center ? 20 : 16,
              display: "flex", flexDirection: "column", alignItems: "center",
              border: `1px solid ${borderColors[pi]}`, width: center ? 220 : 180,
              boxShadow: center ? `0 0 24px ${c.goldBorder}` : "none",
              marginBottom: center ? 8 : 0,
            }}>
              <div style={{ fontSize: center ? 32 : 24, marginBottom: 6 }}>{medals[pi]}</div>
              {avatarEl(acc, center ? 60 : 48, b.avatarBorder, b.avatarBg, b.avatarText)}
              <div style={{ fontSize: center ? 16 : 13, fontWeight: 800, color: b.text, marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{acc.name || acc.username}</div>
              <div style={{ fontSize: 10, color: b.textSec }}>@{acc.username}</div>
              <div style={{ fontSize: center ? 34 : 26, fontWeight: 900, color: b.smartsColor, marginTop: 6 }}>{formatScore(acc.score)}</div>
              <div style={{ width: "80%", marginTop: 6, height: 5, borderRadius: 3, background: b.barBg, overflow: "hidden" }}>
                {scoreToPercent(acc.score) > 0 && (
                  <div style={{ width: `${scoreToPercent(acc.score)}%`, height: "100%", borderRadius: 3, background: SCORE_GRADIENT, backgroundSize: scoreBarBgSize(acc.score), backgroundPosition: "left", backgroundRepeat: "no-repeat" }} />
                )}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: diff > 0 ? "#22C55E" : diff < 0 ? "#EF4444" : b.textMuted, marginTop: 4 }}>
                {diff > 0 ? `↑ +${Math.round(diff)}` : diff < 0 ? `↓ ${Math.round(diff)}` : "—"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest list */}
      {rest.length > 0 && (
        <div style={{ background: b.rowBg, borderRadius: 10, border: `1px solid ${b.borderFaint}`, display: "flex", overflow: "hidden", margin: "0 20px 8px", flexWrap: "wrap" }}>
          {rest.map((acc, ri) => {
            const diff = getDiff(acc, diffPeriod);
            const rowIdx = Math.floor(ri / perRow);
            const isLastRow = rowIdx === restRows - 1;
            return (
              <div key={ri} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: (ri + 1) % perRow !== 0 && ri < rest.length - 1 ? `1px solid ${b.borderFaint}` : "none", borderTop: rowIdx > 0 ? `1px solid ${b.borderFaint}` : "none", padding: "12px 4px", flex: `0 0 ${100 / perRow}%`, boxSizing: "border-box" }}>
                <div style={{ fontSize: 11, color: b.textMuted, fontWeight: 700, marginBottom: 3 }}>{ri + 4}</div>
                {avatarEl(acc, 26, b.avatarBorder, b.avatarBg, b.avatarText)}
                <div style={{ fontSize: 9, fontWeight: 700, color: b.text, marginTop: 3, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{acc.name || acc.username}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: b.text, marginTop: 2 }}>{formatScore(acc.score)}</div>
                <div style={{ width: "70%", marginTop: 3, height: 4, borderRadius: 2, background: b.barBg, overflow: "hidden" }}>
                  {scoreToPercent(acc.score) > 0 && (
                    <div style={{ width: `${scoreToPercent(acc.score)}%`, height: "100%", borderRadius: 2, background: SCORE_GRADIENT, backgroundSize: scoreBarBgSize(acc.score), backgroundPosition: "left", backgroundRepeat: "no-repeat" }} />
                  )}
                </div>
                <div style={{ fontSize: 8, fontWeight: 700, color: diff > 0 ? "#22C55E" : diff < 0 ? "#EF4444" : b.textMuted, marginTop: 2 }}>
                  {diff > 0 ? `↑ +${Math.round(diff)}` : diff < 0 ? `↓ ${Math.round(diff)}` : "—"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SmartWindow>
  );
}

// ============ LAYOUT 4: DASHBOARD TILES ============
function TilesLayout({ accounts, title, subtitle, diffPeriod, theme, filters, showTags = true }: Omit<Props, "layout">) {
  const b = barsThemes[(theme as "dark" | "light") || "dark"];
  const c = themes[theme || "dark"];

  // Dynamic height: header ~60 + tiles rows * ~110 (each tile ~100px + gap)
  const tileRows = Math.ceil(accounts.length / 2);
  const tileHeight = 110;
  const cardHeight = Math.max(675, 110 + 70 + tileRows * tileHeight + (tileRows - 1) * 8 + 30);

  return (
    <SmartWindow theme={theme || "dark"} cardHeight={cardHeight}>
      {/* Header with filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 28px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={b.logo} alt="TwitterScore" style={{ height: 53 }} crossOrigin="anonymous" />
          <div style={{ width: 1, height: 28, background: b.border }} />
          <div style={{ fontSize: 22, fontWeight: 900, color: b.text, letterSpacing: -0.5 }}>{title}</div>
        </div>
        {filters && filters.length > 0 && (
          <div style={{ display: "flex", gap: 6 }}>
            {filters.map((f, fi) => (
              <span key={f} style={{
                background: fi === 0 ? "#2563EB" : b.rowBg,
                color: fi === 0 ? "#fff" : b.textSec,
                padding: "5px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                border: fi === 0 ? "none" : `1px solid ${b.borderFaint}`,
              }}>{f}</span>
            ))}
          </div>
        )}
      </div>

      {/* Tiles grid */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, padding: "0 20px 8px", overflow: "hidden" }}>
        {accounts.map((acc, i) => {
          const diff = getDiff(acc, diffPeriod);
          return (
            <div key={i} style={{ background: b.rowBg, border: `1px solid ${i < 3 ? c.badgeBorder : b.borderFaint}`, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 22, fontSize: i < 3 ? 15 : 12, fontWeight: 800, color: i < 3 ? b.smartsColor : b.textMuted, textAlign: "center" }}>{getRankDisplay(i)}</div>
              {avatarEl(acc, 42, b.avatarBorder, b.avatarBg, b.avatarText)}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: b.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{acc.name || acc.username}</div>
                <div style={{ fontSize: 10, color: b.textSec }}>@{acc.username}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                  <span style={{ fontSize: 10, color: b.textSec }}>👥 {((acc.followers || 0) / 1000).toFixed(0)}K</span>
                  <span style={{ fontSize: 10, color: b.textSec }}>🔥 {acc.smartFollowers || 0} smart</span>
                </div>
                {acc.category && !["Top Smart", "Smart", "Rising", "New"].includes(acc.category) && (
                  <div style={{ marginTop: 2 }}>
                    <span style={{ background: b.tagBg, color: b.tagText, padding: "1px 7px", borderRadius: 6, fontSize: 9, fontWeight: 600 }}>{acc.category}</span>
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, width: 100 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: b.text }}>{formatScore(acc.score)}</div>
                <div style={{ marginTop: 3, height: 5, borderRadius: 3, background: b.barBg, overflow: "hidden" }}>
                  {scoreToPercent(acc.score) > 0 && (
                    <div style={{ width: `${scoreToPercent(acc.score)}%`, height: "100%", borderRadius: 3, background: SCORE_GRADIENT, backgroundSize: scoreBarBgSize(acc.score), backgroundPosition: "left", backgroundRepeat: "no-repeat" }} />
                  )}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: diff > 0 ? "#22C55E" : diff < 0 ? "#EF4444" : b.textMuted, marginTop: 2 }}>
                  {diff > 0 ? `↑ +${Math.round(diff)}` : diff < 0 ? `↓ ${Math.round(diff)}` : "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SmartWindow>
  );
}

// ============ MAIN COMPONENT ============
const ProjectsCard = forwardRef<HTMLDivElement, Props>(
  ({ accounts, title, subtitle, diffPeriod, layout, theme = "dark", filters, showTags = true, customColumnHeader, customColumnData, metricColumn }, ref) => {
    if (layout === "bars-custom") {
      return (
        <div ref={ref}>
          <BarsCustomLayout accounts={accounts} title={title} subtitle={subtitle} diffPeriod={diffPeriod} theme={theme} filters={filters} showTags={showTags} customColumnHeader={customColumnHeader} customColumnData={customColumnData} />
        </div>
      );
    }
    if (layout === "bars-metric") {
      return (
        <div ref={ref}>
          <BarsMetricLayout accounts={accounts} title={title} subtitle={subtitle} diffPeriod={diffPeriod} theme={theme} filters={filters} showTags={showTags} metricColumn={metricColumn} />
        </div>
      );
    }

    const layoutMap = { bars: BarsLayout, grid: GridLayout, podium: PodiumLayout, tiles: TilesLayout };
    const LayoutComponent = layoutMap[layout as keyof typeof layoutMap];

    return (
      <div ref={ref}>
        <LayoutComponent accounts={accounts} title={title} subtitle={subtitle} diffPeriod={diffPeriod} theme={theme} filters={filters} showTags={showTags} />
      </div>
    );
  }
);

ProjectsCard.displayName = "ProjectsCard";
export default ProjectsCard;
