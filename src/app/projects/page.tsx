"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toPng } from "html-to-image";
import { AccountData } from "@/components/SmartDropCard";
import ProjectsCard, { ProjectsLayout, ProjectsTheme, CustomColumnData, MetricColumn } from "@/components/ProjectsCard";

const layouts: { id: ProjectsLayout; label: string; icon: string }[] = [
  { id: "bars", label: "Bar Chart", icon: "📊" },
  { id: "bars-metric", label: "Bar Chart (Metric)", icon: "📈" },
  { id: "bars-custom", label: "Bar Chart (Custom)", icon: "📝" },
  { id: "grid", label: "Card Grid", icon: "🔲" },
  { id: "podium", label: "Podium", icon: "🏆" },
  { id: "tiles", label: "Tiles", icon: "📋" },
];

// Per-row data entered manually for Bar Chart (Metric) layout.
// display = formatted string shown on card ("$746.7M"), value = raw number for bar scaling,
// diff = % change rendered as colored badge (optional).
interface MetricRow {
  display: string;
  value: string;
  diff: string;
}

// Build the MetricColumn prop from per-row form state. Returns undefined if no
// displays filled, so ProjectsCard falls back to the default score-based layout.
function buildMetricColumn(accounts: AccountData[], rows: Record<number, MetricRow>, label: string): MetricColumn | undefined {
  if (accounts.length === 0) return undefined;
  const displays: string[] = [];
  const values: number[] = [];
  const diffs: number[] = [];
  let anyDisplay = false;
  let anyValue = false;
  let anyDiff = false;
  for (let i = 0; i < accounts.length; i++) {
    const r = rows[i] || { display: "", value: "", diff: "" };
    displays.push(r.display);
    if (r.display) anyDisplay = true;
    const v = parseFloat(r.value);
    values.push(Number.isFinite(v) ? v : 0);
    if (Number.isFinite(v) && v !== 0) anyValue = true;
    const d = parseFloat(r.diff);
    diffs.push(Number.isFinite(d) ? d : 0);
    if (Number.isFinite(d) && d !== 0) anyDiff = true;
  }
  if (!anyDisplay) return undefined;
  return {
    label,
    displays,
    values: anyValue ? values : undefined,
    diffs: anyDiff ? diffs : undefined,
  };
}

export default function ProjectsPage() {
  const [input, setInput] = useState("");
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [originalOrder, setOriginalOrder] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("🚀 Fastest Growing Projects");
  const [subtitle, setSubtitle] = useState("March 2026 · DeFi Protocols");
  const [diffPeriod, setDiffPeriod] = useState<"week" | "month">("month");
  const [layout, setLayout] = useState<ProjectsLayout>("bars");
  const [filtersInput, setFiltersInput] = useState("All, DeFi, Perp DEX, L2");
  const [sortByScore, setSortByScore] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [customHeader, setCustomHeader] = useState("Notes");
  const [customData, setCustomData] = useState<Record<number, CustomColumnData>>({});
  const [metricLabel, setMetricLabel] = useState("TVL");
  const [metricData, setMetricData] = useState<Record<number, MetricRow>>({});
  const lightRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);

  const fetchAccounts = async () => {
    const usernames = input.replace(/@/g, "").split(/[\s,;|\n]+/).map((u) => u.trim()).filter((u) => u.length > 0);
    if (usernames.length === 0) { setError("Enter at least one username"); return; }
    setLoading(true); setError("");
    try {
      const results: AccountData[] = [];
      for (const username of usernames) {
        const res = await fetch(`/api/score?username=${username}`);
        const data = await res.json();
        if (res.ok) results.push(data);
        else results.push({ username, name: username, score: 0, avatar: "", category: "", tags: [], followers: 0 });
      }
      setOriginalOrder(results);
      setAccounts(sortByScore ? [...results].sort((a, b) => b.score - a.score) : results);
    } catch { setError("Failed to fetch data"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (originalOrder.length === 0) return;
    setAccounts(sortByScore ? [...originalOrder].sort((a, b) => b.score - a.score) : [...originalOrder]);
  }, [sortByScore, originalOrder]);

  // Auto-swap title/subtitle defaults when user switches layout families.
  // Leaves custom text alone — only replaces if current text matches the OTHER
  // layout's default. Lets the starter copy fit the card's real purpose.
  const BARS_DEFAULT_TITLE = "🚀 Fastest Growing Projects";
  const BARS_DEFAULT_SUBTITLE = "March 2026 · DeFi Protocols";
  const METRIC_DEFAULT_TITLE = "📈 Top Projects by TVL";
  const METRIC_DEFAULT_SUBTITLE = "April 2026 · DeFi";
  useEffect(() => {
    if (layout === "bars-metric") {
      if (title === BARS_DEFAULT_TITLE) setTitle(METRIC_DEFAULT_TITLE);
      if (subtitle === BARS_DEFAULT_SUBTITLE) setSubtitle(METRIC_DEFAULT_SUBTITLE);
    } else {
      if (title === METRIC_DEFAULT_TITLE) setTitle(BARS_DEFAULT_TITLE);
      if (subtitle === METRIC_DEFAULT_SUBTITLE) setSubtitle(BARS_DEFAULT_SUBTITLE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  const downloadPng = useCallback(async (ref: React.RefObject<HTMLDivElement | null>, suffix: string) => {
    if (!ref.current) return;
    try {
      const el = ref.current;
      const w = el.offsetWidth || 1200;
      const h = el.offsetHeight || 675;
      const dataUrl = await toPng(el, { width: w, height: h, pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `projects-${layout}-${suffix}.png`;
      link.href = dataUrl;
      link.click();
    } catch { setError("Failed to generate image"); }
  }, [layout]);

  const inputStyle = { width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontSize: 14 };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 24, marginBottom: 32, border: "1px solid rgba(255,255,255,0.06)" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>📊 Projects Table Generator</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16, marginTop: 0 }}>Generate project ranking cards with multiple layouts</p>

          {/* Layout selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {layouts.map((l) => (
              <button key={l.id} onClick={() => setLayout(l.id)} style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: layout === l.id ? "#2563EB" : "rgba(255,255,255,0.05)",
                color: layout === l.id ? "#fff" : "rgba(255,255,255,0.5)",
                border: layout === l.id ? "1px solid #2563EB" : "1px solid rgba(255,255,255,0.1)",
              }}>{l.icon} {l.label}</button>
            ))}
          </div>

          {/* Title + Subtitle */}
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Subtitle</label>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Period toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", alignSelf: "center", marginRight: 8 }}>Change period:</label>
            {(["week", "month"] as const).map((p) => (
              <button key={p} onClick={() => setDiffPeriod(p)} style={{
                padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: diffPeriod === p ? "#22C55E" : "rgba(255,255,255,0.05)",
                color: diffPeriod === p ? "#fff" : "rgba(255,255,255,0.5)",
                border: diffPeriod === p ? "1px solid #22C55E" : "1px solid rgba(255,255,255,0.1)",
              }}>{p === "week" ? "7 days" : "30 days"}</button>
            ))}
          </div>

          {/* Filters (for Tiles layout) */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Filter pills (comma-separated, first = active)</label>
            <input value={filtersInput} onChange={(e) => setFiltersInput(e.target.value)} style={inputStyle} placeholder="All, DeFi, Perp DEX, L2" />
          </div>

          {/* Toggles */}
          <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <div onClick={() => setSortByScore(!sortByScore)} style={{
                width: 40, height: 22, borderRadius: 11, cursor: "pointer",
                background: sortByScore ? "#22C55E" : "rgba(255,255,255,0.15)",
                position: "relative", transition: "background 0.2s",
              }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: sortByScore ? 20 : 2, transition: "left 0.2s" }} />
              </div>
              Sort by Score {sortByScore ? "(ON)" : "(OFF)"}
            </label>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <div onClick={() => setShowTags(!showTags)} style={{
                width: 40, height: 22, borderRadius: 11, cursor: "pointer",
                background: showTags ? "#22C55E" : "rgba(255,255,255,0.15)",
                position: "relative", transition: "background 0.2s",
              }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: showTags ? 20 : 2, transition: "left 0.2s" }} />
              </div>
              Tags + Category {showTags ? "(ON)" : "(OFF — category only)"}
            </label>
          </div>

          {/* Custom column header (for bars-custom) */}
          {layout === "bars-custom" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Custom column header</label>
              <input value={customHeader} onChange={(e) => setCustomHeader(e.target.value)} style={inputStyle} placeholder="Notes" />
            </div>
          )}

          {/* Metric column header (for bars-metric) */}
          {layout === "bars-metric" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Metric column header</label>
              <input value={metricLabel} onChange={(e) => setMetricLabel(e.target.value)} style={inputStyle} placeholder="TVL" />
            </div>
          )}

          {/* Usernames */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Usernames</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="@AaveAave, @ethena_labs, @penaborata..." rows={3} style={{ ...inputStyle, resize: "vertical" as const }} />
          </div>

          {/* Metric column data editor (for bars-metric, after generate) */}
          {layout === "bars-metric" && accounts.length > 0 && (
            <div style={{ marginBottom: 16, background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 8 }}>📈 Metric data per row</label>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>Display = what shows on card (e.g. &quot;$746.7M&quot;). Value = raw number for bar scaling. Diff (optional) = 7d % change, signed.</div>
              {accounts.map((acc, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 140, fontSize: 12, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {acc.name || `@${acc.username}`}
                  </span>
                  <input
                    value={metricData[i]?.display || ""}
                    onChange={(e) => setMetricData(prev => ({ ...prev, [i]: { display: e.target.value, value: prev[i]?.value || "", diff: prev[i]?.diff || "" } }))}
                    placeholder="$746.7M"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <input
                    value={metricData[i]?.value || ""}
                    onChange={(e) => setMetricData(prev => ({ ...prev, [i]: { display: prev[i]?.display || "", value: e.target.value, diff: prev[i]?.diff || "" } }))}
                    placeholder="746.7"
                    style={{ ...inputStyle, width: 100 }}
                  />
                  <input
                    value={metricData[i]?.diff || ""}
                    onChange={(e) => setMetricData(prev => ({ ...prev, [i]: { display: prev[i]?.display || "", value: prev[i]?.value || "", diff: e.target.value } }))}
                    placeholder="+7.6"
                    style={{ ...inputStyle, width: 80 }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Custom column data editor (for bars-custom, after generate) */}
          {layout === "bars-custom" && accounts.length > 0 && (
            <div style={{ marginBottom: 16, background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 8 }}>📝 Custom column data (per row)</label>
              {accounts.map((acc, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ width: 140, fontSize: 12, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {acc.name || `@${acc.username}`}
                  </span>
                  <input
                    value={customData[i]?.line1 || ""}
                    onChange={(e) => setCustomData(prev => ({ ...prev, [i]: { ...prev[i], line1: e.target.value } }))}
                    placeholder="Line 1 (bold)"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <input
                    value={customData[i]?.line2 || ""}
                    onChange={(e) => setCustomData(prev => ({ ...prev, [i]: { ...prev[i], line1: prev[i]?.line1 || "", line2: e.target.value } }))}
                    placeholder="Line 2 (smaller, optional)"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={fetchAccounts} disabled={loading} style={{
              padding: "10px 24px", background: loading ? "#333" : "#2563EB", border: "none", borderRadius: 8,
              color: "white", fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer",
            }}>{loading ? "Loading..." : "⚡ Generate Cards"}</button>
            {accounts.length > 0 && (
              <>
                <button onClick={() => downloadPng(lightRef, "light")} style={{ padding: "10px 24px", background: "#F5F5F5", border: "1px solid #E5E7EB", borderRadius: 8, color: "#1A1A1A", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>☀️ Download Light</button>
                <button onClick={() => downloadPng(darkRef, "dark")} style={{ padding: "10px 24px", background: "#1E1E1E", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🌙 Download Dark</button>
              </>
            )}
          </div>
          {error && <div style={{ color: "#FF5F57", marginTop: 12, fontSize: 13 }}>{error}</div>}
        </div>

        {accounts.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>☀️ Light Theme</h2>
              <div style={{ borderRadius: 12, overflow: "auto", border: "1px solid rgba(255,255,255,0.1)" }}>
                <ProjectsCard ref={lightRef} accounts={accounts} title={title} subtitle={subtitle} diffPeriod={diffPeriod} layout={layout} theme="light" filters={filtersInput.split(",").map(f => f.trim()).filter(f => f)} showTags={showTags} customColumnHeader={customHeader} customColumnData={customData} metricColumn={buildMetricColumn(accounts, metricData, metricLabel)} />
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>🌙 Dark Theme</h2>
              <div style={{ borderRadius: 12, overflow: "auto", border: "1px solid rgba(255,255,255,0.1)" }}>
                <ProjectsCard ref={darkRef} accounts={accounts} title={title} subtitle={subtitle} diffPeriod={diffPeriod} layout={layout} theme="dark" filters={filtersInput.split(",").map(f => f.trim()).filter(f => f)} showTags={showTags} customColumnHeader={customHeader} customColumnData={customData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
