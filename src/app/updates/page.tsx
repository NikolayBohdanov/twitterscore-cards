"use client";

import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import FeatureReleaseCard, { FeatureLayout } from "@/components/FeatureReleaseCard";
import MilestoneCard, { StatItem } from "@/components/MilestoneCard";
import ChangelogCard, { ChangelogItem } from "@/components/ChangelogCard";

type UpdateType = "feature" | "milestone" | "changelog";
type Theme = "dark" | "light";

function PreviewWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    if (containerRef.current) {
      const w = containerRef.current.clientWidth;
      setScale(Math.min(w / 1200, 1));
    }
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
        Preview — PNG downloads at full 1200×675
      </h2>
      <div
        ref={(el) => { (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el; if (el) { const w = el.clientWidth; setScale(Math.min(w / 1200, 1)); } }}
        style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", height: 675 * scale }}
      >
        <div style={{ width: 1200, height: 675, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 12px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8, color: "white", fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4,
};

const btnStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
  background: active ? "#0544FD" : "rgba(255,255,255,0.05)",
  border: active ? "none" : "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8, color: "white", transition: "all 0.15s",
});

export default function UpdatesPage() {
  const [type, setType] = useState<UpdateType>("feature");
  const [theme, setTheme] = useState<Theme>("dark");
  const cardRef = useRef<HTMLDivElement>(null);

  // Feature state
  const [featureTitle, setFeatureTitle] = useState("TwitterScore API\nis Now Live");
  const [featureSubtitle, setFeatureSubtitle] = useState("Tap into real CT data. Integrate scores, followers, analytics directly into your product.");
  const [featureBullets, setFeatureBullets] = useState("Twitter Scores for any account\nFollower growth history (3d to all-time)\nDeep audience analytics & top followers");
  const [featureScreenshot, setFeatureScreenshot] = useState("");
  const [featureLayout, setFeatureLayout] = useState<FeatureLayout>("side");

  // Milestone state
  const [milestoneTitle, setMilestoneTitle] = useState("We Mapped 37,600 Accounts");
  const [milestoneSubtitle, setMilestoneSubtitle] = useState("Expanded monitoring base — no noise, just building.");
  const [milestoneStats, setMilestoneStats] = useState<StatItem[]>([
    { value: "37,600", label: "Total Accounts", change: "+13,697 new" },
    { value: "2,617", label: "Venture Capital", change: "+1,199 new" },
    { value: "1,468", label: "Angels", change: "+498 new" },
    { value: "19,992", label: "Projects", change: "+12,000 new" },
  ]);

  // Changelog state
  const [changelogTitle, setChangelogTitle] = useState("March 2026 Update");
  const [changelogVersion, setChangelogVersion] = useState("v2.4.0");
  const [changelogDate, setChangelogDate] = useState("March 2026");
  const [changelogItems, setChangelogItems] = useState<ChangelogItem[]>([
    { type: "added", text: "Telegram Bot — auto-replies with scores in group chats" },
    { type: "added", text: "API Pricing page with Stripe integration" },
    { type: "added", text: "Bulk score checking (up to 100 accounts)" },
    { type: "improved", text: "Score recalculation now runs daily instead of weekly" },
    { type: "improved", text: "Follower graph extended to all-time range" },
    { type: "fixed", text: "Score mismatch on accounts with special characters" },
  ]);

  const downloadPng = useCallback(async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { width: 1200, height: 675, pixelRatio: 2, cacheBust: true });
    const link = document.createElement("a");
    link.download = `twitterscore-${type}-${theme}.png`;
    link.href = dataUrl;
    link.click();
  }, [type, theme]);

  const updateStat = (index: number, field: keyof StatItem, value: string) => {
    setMilestoneStats(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addStat = () => {
    if (milestoneStats.length < 4) setMilestoneStats(prev => [...prev, { value: "0", label: "Label" }]);
  };

  const removeStat = (index: number) => {
    setMilestoneStats(prev => prev.filter((_, i) => i !== index));
  };

  const updateChangelogItem = (index: number, field: keyof ChangelogItem, value: string) => {
    setChangelogItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addChangelogItem = () => {
    if (changelogItems.length < 8) setChangelogItems(prev => [...prev, { type: "added", text: "New item" }]);
  };

  const removeChangelogItem = (index: number) => {
    setChangelogItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          background: "rgba(255,255,255,0.03)", borderRadius: 16,
          padding: 24, marginBottom: 32, border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🚀 Product Updates Generator</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16, marginTop: 0 }}>Generate release cards, milestones, and changelogs</p>

          {/* Template selector — same style as Projects */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {([
              { key: "feature", label: "Interface Screenshot", icon: "🆕" },
              { key: "milestone", label: "Milestone", icon: "📊" },
              { key: "changelog", label: "Changelog", icon: "🔧" },
            ] as const).map((t) => (
              <button key={t.key} onClick={() => setType(t.key)} style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: type === t.key ? "#2563EB" : "rgba(255,255,255,0.05)",
                color: type === t.key ? "#fff" : "rgba(255,255,255,0.5)",
                border: type === t.key ? "1px solid #2563EB" : "1px solid rgba(255,255,255,0.1)",
              }}>{t.icon} {t.label}</button>
            ))}
          </div>

          {/* Theme toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", alignSelf: "center", marginRight: 8 }}>Theme:</label>
            <button onClick={() => setTheme("dark")} style={btnStyle(theme === "dark")}>Dark</button>
            <button onClick={() => setTheme("light")} style={btnStyle(theme === "light")}>Light</button>
          </div>

          {/* Feature form */}
          {type === "feature" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Layout</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setFeatureLayout("side")} style={btnStyle(featureLayout === "side")}>📐 Side (vertical screenshot)</button>
                  <button onClick={() => setFeatureLayout("wide")} style={btnStyle(featureLayout === "wide")}>📏 Wide (horizontal screenshot)</button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Title (use \n for line break)</label>
                <input value={featureTitle} onChange={e => setFeatureTitle(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Subtitle</label>
                <input value={featureSubtitle} onChange={e => setFeatureSubtitle(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Bullets (one per line)</label>
                <textarea value={featureBullets} onChange={e => setFeatureBullets(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Screenshot (drag & drop or click to upload)</label>
                <div
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#0544FD"; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith("image/")) {
                      const reader = new FileReader();
                      reader.onload = () => setFeatureScreenshot(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file"; input.accept = "image/*";
                    input.onchange = () => {
                      const file = input.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setFeatureScreenshot(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  style={{
                    border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 12,
                    padding: featureScreenshot ? 0 : 32, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden", transition: "border-color 0.2s",
                    minHeight: featureScreenshot ? 120 : undefined,
                  }}
                >
                  {featureScreenshot ? (
                    <div style={{ position: "relative", width: "100%" }}>
                      <img src={featureScreenshot} style={{ width: "100%", maxHeight: 200, objectFit: "contain" }} />
                      <button
                        onClick={e => { e.stopPropagation(); setFeatureScreenshot(""); }}
                        style={{
                          position: "absolute", top: 8, right: 8,
                          background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 6,
                          color: "#FF5F57", fontSize: 14, fontWeight: 700, cursor: "pointer",
                          padding: "4px 10px",
                        }}
                      >✕ Remove</button>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
                      <div style={{ fontSize: 13 }}>Drop image here or click to upload</div>
                      <div style={{ fontSize: 11, marginTop: 4, color: "rgba(255,255,255,0.2)" }}>Optional — leave empty for text-only card</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Milestone form */}
          {type === "milestone" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Title</label>
                <input value={milestoneTitle} onChange={e => setMilestoneTitle(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Subtitle (optional)</label>
                <input value={milestoneSubtitle} onChange={e => setMilestoneSubtitle(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Stats ({milestoneStats.length}/4)</label>
                {milestoneStats.map((stat, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input value={stat.value} onChange={e => updateStat(i, "value", e.target.value)} style={{ ...inputStyle, flex: "0 0 120px" }} placeholder="Value" />
                    <input value={stat.label} onChange={e => updateStat(i, "label", e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="Label" />
                    <input value={stat.change || ""} onChange={e => updateStat(i, "change", e.target.value)} style={{ ...inputStyle, flex: "0 0 150px" }} placeholder="Change (optional)" />
                    <button onClick={() => removeStat(i)} style={{ ...btnStyle(false), padding: "8px 12px", color: "#FF5F57" }}>✕</button>
                  </div>
                ))}
                {milestoneStats.length < 4 && (
                  <button onClick={addStat} style={btnStyle(false)}>+ Add Stat</button>
                )}
              </div>
            </div>
          )}

          {/* Changelog form */}
          {type === "changelog" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Title</label>
                  <input value={changelogTitle} onChange={e => setChangelogTitle(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: "0 0 120px" }}>
                  <label style={labelStyle}>Version</label>
                  <input value={changelogVersion} onChange={e => setChangelogVersion(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: "0 0 140px" }}>
                  <label style={labelStyle}>Date</label>
                  <input value={changelogDate} onChange={e => setChangelogDate(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Items ({changelogItems.length}/8)</label>
                {changelogItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <select
                      value={item.type}
                      onChange={e => updateChangelogItem(i, "type", e.target.value)}
                      style={{ ...inputStyle, flex: "0 0 120px", cursor: "pointer" }}
                    >
                      <option value="added">✅ Added</option>
                      <option value="fixed">🔧 Fixed</option>
                      <option value="improved">⚡ Improved</option>
                    </select>
                    <input value={item.text} onChange={e => updateChangelogItem(i, "text", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <button onClick={() => removeChangelogItem(i)} style={{ ...btnStyle(false), padding: "8px 12px", color: "#FF5F57" }}>✕</button>
                  </div>
                ))}
                {changelogItems.length < 8 && (
                  <button onClick={addChangelogItem} style={btnStyle(false)}>+ Add Item</button>
                )}
              </div>
            </div>
          )}

          {/* Download */}
          <div style={{ marginTop: 20 }}>
            <button onClick={downloadPng} style={{
              padding: "10px 24px", background: "#00CC66", border: "none",
              borderRadius: 8, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              📥 Download PNG
            </button>
          </div>
        </div>

        {/* Preview - scales to fit viewport */}
        <PreviewWrapper>
            {type === "feature" && (
              <FeatureReleaseCard
                ref={cardRef}
                title={featureTitle}
                subtitle={featureSubtitle}
                bullets={featureBullets.split("\n").filter(b => b.trim())}
                screenshotUrl={featureScreenshot || undefined}
                theme={theme}
                layout={featureLayout}
              />
            )}
            {type === "milestone" && (
              <MilestoneCard
                ref={cardRef}
                title={milestoneTitle}
                subtitle={milestoneSubtitle || undefined}
                stats={milestoneStats}
                theme={theme}
              />
            )}
            {type === "changelog" && (
              <ChangelogCard
                ref={cardRef}
                title={changelogTitle}
                version={changelogVersion || undefined}
                date={changelogDate || undefined}
                items={changelogItems}
                theme={theme}
              />
            )}
        </PreviewWrapper>
      </div>
    </div>
  );
}
