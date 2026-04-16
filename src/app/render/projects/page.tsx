"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AccountData } from "@/components/SmartDropCard";
import ProjectsCard, { ProjectsTheme, MetricColumn } from "@/components/ProjectsCard";

/**
 * Headless render page for Projects cards (Leaderboard, Funding Rounds, etc).
 * Driven entirely by URL params. No UI controls.
 *
 * Usage:
 *   /render/projects?layout=bars-metric
 *     &title=Top+10+Perp+DEXs+by+TVL&subtitle=April+2026
 *     &projects=JupiterExchange,HyperliquidX,GMX_IO
 *     &names=Jupiter+Perps,Hyperliquid+HLP,GMX+V2
 *     &scores=505,572,212             // TwitterScore per project
 *     &metricLabel=TVL
 *     &metricDisplays=$746.7M,$402.3M,$263.3M
 *     &metricValues=746.7,402.3,263.3
 *     &metricDiffs=7.6,-2.3,-1.1
 *     &categories=Derivatives,Derivatives,Derivatives
 *     &theme=dark
 *
 * Screenshot target: #card
 */
export default function RenderProjectsPage() {
  return (
    <Suspense fallback={<div style={{ background: "#000", color: "#fff", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <RenderInner />
    </Suspense>
  );
}

function splitCsv(v: string | null): string[] {
  if (!v) return [];
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

function splitNums(v: string | null): number[] {
  return splitCsv(v).map((x) => Number(x)).filter((n) => !Number.isNaN(n));
}

function RenderInner() {
  const p = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const layout = (p.get("layout") || "bars-metric") as "bars" | "bars-metric" | "bars-custom" | "grid" | "podium" | "tiles";
  const title = p.get("title") || "Top Projects";
  const subtitle = p.get("subtitle") || "";
  const theme = (p.get("theme") || "dark") as ProjectsTheme;
  const metricLabel = p.get("metricLabel") || "Metric";

  const projects = splitCsv(p.get("projects")); // Twitter handles
  const names = splitCsv(p.get("names"));       // Display names (fallback to handles)
  const scoresParam = splitNums(p.get("scores"));
  const categories = splitCsv(p.get("categories"));
  const metricDisplays = splitCsv(p.get("metricDisplays"));
  const metricValues = splitNums(p.get("metricValues"));
  const metricDiffs = splitNums(p.get("metricDiffs"));

  // Fetch avatars via /api/score so the card shows logos.
  // Falls back to first-letter placeholder if fetch fails.
  useEffect(() => {
    if (projects.length === 0) {
      setError("No projects provided");
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      const out: AccountData[] = [];
      for (let i = 0; i < projects.length; i++) {
        const handle = projects[i];
        try {
          const res = await fetch(`/api/score?username=${encodeURIComponent(handle)}`);
          const data = await res.json();
          if (res.ok) {
            out.push({
              ...data,
              // Override with URL-provided fields so UI-served score doesn't
              // compete with the metric-column values we want to rank by.
              name: names[i] || data.name || handle,
              score: scoresParam[i] ?? data.score ?? 0,
              category: categories[i] || data.category || "",
            });
          } else {
            out.push({
              username: handle,
              name: names[i] || handle,
              score: scoresParam[i] ?? 0,
              avatar: "",
              category: categories[i] || "",
              tags: [],
              followers: 0,
            });
          }
        } catch {
          out.push({
            username: handle,
            name: names[i] || handle,
            score: scoresParam[i] ?? 0,
            avatar: "",
            category: categories[i] || "",
            tags: [],
            followers: 0,
          });
        }
      }
      setAccounts(out);
      setLoading(false);
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#000", color: "#fff" }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#000", color: "#FF5F57" }}>{error}</div>;
  }

  const metricColumn: MetricColumn | undefined =
    metricDisplays.length > 0
      ? {
          label: metricLabel,
          displays: metricDisplays,
          values: metricValues.length ? metricValues : undefined,
          diffs: metricDiffs.length ? metricDiffs : undefined,
        }
      : undefined;

  return (
    <>
      {/* Matches smart-drop render page: inject Noto Color Emoji + Inter so headless Chromium
          has real color emoji glyphs. Without this, "🎯 Perp DEX Leaderboard 🎯" shows tofu. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Color+Emoji&display=swap');
        * { font-family: 'Inter', 'Noto Color Emoji', sans-serif; }
      `}</style>
      <div style={{ background: theme === "dark" ? "#000" : "#f5f5f5", padding: 0, margin: 0 }}>
        <div id="card" style={{ display: "inline-block" }}>
          <ProjectsCard
            ref={cardRef}
            accounts={accounts}
            title={title}
            subtitle={subtitle}
            diffPeriod="month"
            layout={layout}
            theme={theme}
            showTags={true}
            metricColumn={metricColumn}
          />
        </div>
      </div>
    </>
  );
}
