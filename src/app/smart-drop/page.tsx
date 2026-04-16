"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toPng } from "html-to-image";
import SmartDropCard, { AccountData, CardTheme } from "@/components/SmartDropCard";
import SmartDropCardV2 from "@/components/SmartDropCardV2";
import SmartDropCardV3 from "@/components/SmartDropCardV3";
import SmartDropCardV4 from "@/components/SmartDropCardV4";
import TweetPreview from "@/components/TweetPreview";
import { CardTextOverrides, DEFAULT_OVERRIDES } from "@/components/cardOverrides";

const versions = [
  { key: "v1", label: "V1", icon: "🎯" },
  { key: "v2", label: "V2", icon: "✨" },
];

export default function SmartDropPage() {
  const [version, setVersion] = useState("v1");
  const [theme, setTheme] = useState<CardTheme>("dark");
  const [input, setInput] = useState("");
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [weekNumber, setWeekNumber] = useState(12);
  const [totalSmart, setTotalSmart] = useState(40847);
  const [sortByScore, setSortByScore] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [originalOrder, setOriginalOrder] = useState<AccountData[]>([]);
  const [overrides, setOverrides] = useState<CardTextOverrides>({ ...DEFAULT_OVERRIDES });
  const cardRef = useRef<HTMLDivElement>(null);
  const updateOverride = (key: keyof CardTextOverrides, val: string) => setOverrides(prev => ({ ...prev, [key]: val }));
  const isEdited = JSON.stringify(overrides) !== JSON.stringify(DEFAULT_OVERRIDES);

  useEffect(() => {
    if (originalOrder.length === 0) return;
    setAccounts(sortByScore ? [...originalOrder].sort((a, b) => b.score - a.score) : [...originalOrder]);
  }, [sortByScore, originalOrder]);

  const fetchAccounts = async () => {
    const usernames = input.replace(/@/g, "").split(/[\s,;|\n]+/).map(u => u.trim()).filter(u => u.length > 0);
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

  const downloadPng = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const rect = cardRef.current.getBoundingClientRect();
      const dataUrl = await toPng(cardRef.current, { width: 1200, height: Math.round(rect.height), pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `smart-drop-${version}-week-${weekNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch { setError("Failed to generate image"); }
  }, [version, weekNumber]);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, color: "white", fontSize: 14,
  };

  const renderCard = () => {
    const props = { ref: cardRef, accounts, weekNumber, totalSmart, newCount: accounts.length, showTags, overrides };
    switch (version) {
      case "v1": return <SmartDropCard {...props} theme={theme} />;
      case "v2": return <SmartDropCardV2 {...props} theme={theme} />;
      case "v3": return <SmartDropCardV3 {...props} theme={theme} />;
      case "v4": return <SmartDropCardV4 {...props} theme={theme} />;
      default: return <SmartDropCard {...props} theme={theme} />;
    }
  };

  const supportsTheme = true; // both V1 and V2 support theme

  return (
    <div style={{ padding: 32 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 24, marginBottom: 32, border: "1px solid rgba(255,255,255,0.06)" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🎯 Smart Drop Generator</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16, marginTop: 0 }}>Generate Weekly Smart Drop cards for Twitter</p>

          {/* Version selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            {versions.map((v) => (
              <button key={v.key} onClick={() => setVersion(v.key)} style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: version === v.key ? "#2563EB" : "rgba(255,255,255,0.05)",
                color: version === v.key ? "#fff" : "rgba(255,255,255,0.5)",
                border: version === v.key ? "1px solid #2563EB" : "1px solid rgba(255,255,255,0.1)",
              }}>{v.icon} {v.label}</button>
            ))}

            {/* Spacer */}
            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />

            {/* Theme toggle */}
            {supportsTheme && (
              <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <button onClick={() => setTheme("dark")} style={{
                  padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
                  background: theme === "dark" ? "rgba(255,255,255,0.1)" : "transparent",
                  color: theme === "dark" ? "#fff" : "rgba(255,255,255,0.4)",
                }}>🌙 Dark</button>
                <button onClick={() => setTheme("light")} style={{
                  padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
                  background: theme === "light" ? "rgba(255,255,255,0.1)" : "transparent",
                  color: theme === "light" ? "#fff" : "rgba(255,255,255,0.4)",
                }}>☀️ Light</button>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "0 0 100px" }}>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Week #</label>
              <input type="number" value={weekNumber} onChange={e => setWeekNumber(Number(e.target.value))} style={inputStyle} />
            </div>
            <div style={{ flex: "0 0 160px" }}>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Total Smart Accounts</label>
              <input type="number" value={totalSmart} onChange={e => setTotalSmart(Number(e.target.value))} style={inputStyle} />
            </div>
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

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Usernames (comma, space, or newline separated)</label>
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="@Selene406, @CryptoFloki, @0xNeodallas..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={fetchAccounts} disabled={loading} style={{
              padding: "10px 24px", background: loading ? "#333" : "#0544FD",
              border: "none", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
            }}>{loading ? "Loading..." : "⚡ Generate Card"}</button>
            {accounts.length > 0 && (
              <>
                <button onClick={downloadPng} style={{
                  padding: "10px 24px", background: "#00CC66", border: "none",
                  borderRadius: 8, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}>📥 Download PNG</button>
                {isEdited && (
                  <button onClick={() => setOverrides({ ...DEFAULT_OVERRIDES })} style={{
                    padding: "10px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>↩️ Reset Texts</button>
                )}
              </>
            )}
          </div>

          {error && <div style={{ color: "#FF5F57", marginTop: 12, fontSize: 13 }}>{error}</div>}
        </div>

        {accounts.length > 0 && (
          <>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: 0 }}>Preview</h2>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>✏️ Edit texts below — changes update the card instantly</span>
              </div>
              <div style={{ borderRadius: 12, overflow: "auto", border: "1px solid rgba(255,255,255,0.06)" }}>
                {renderCard()}
              </div>

              {/* Editable text fields */}
              <div style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, marginTop: 16,
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>✏️ Edit Card Texts</span>
                  {isEdited && (
                    <button onClick={() => setOverrides({ ...DEFAULT_OVERRIDES })} style={{
                      padding: "4px 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 6, color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer",
                    }}>↩️ Reset All</button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {((version === "v1" ? [
                    ["titleBarText" as const, "Window Title (title bar)", overrides.titleBarText || "TwitterScore Database"],
                    ["headerSubtitle" as const, "Header Subtitle (below title)", overrides.headerSubtitle],
                    ["counterLabel" as const, "Counter Label (right side)", overrides.counterLabel || `Smart Accounts · +${accounts.length} new`],
                    ["footerLeft" as const, "Footer Left", overrides.footerLeft],
                    ["footerCenter" as const, "Footer Center", overrides.footerCenter],
                    ["footerRight" as const, "Footer Right", overrides.footerRight],
                  ] : [
                    ["title" as const, "Title", overrides.title],
                    ["subtitle" as const, "Subtitle", overrides.subtitle || `Week #${weekNumber}`],
                    ["headerSubtitle" as const, "Header Subtitle", overrides.headerSubtitle],
                    ["counterLabel" as const, "Counter Label", overrides.counterLabel || `Smart Accounts · +${accounts.length} new`],
                    ["footerLeft" as const, "Footer Left", overrides.footerLeft],
                    ["footerCenter" as const, "Footer Center", overrides.footerCenter],
                    ["footerRight" as const, "Footer Right", overrides.footerRight],
                  ]) as [keyof CardTextOverrides, string, string][]).map(([key, label, val]) => (
                    <div key={key}>
                      <label style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 3 }}>{label}</label>
                      <input
                        value={val}
                        onChange={e => updateOverride(key, e.target.value)}
                        style={{
                          width: "100%", padding: "6px 10px", fontSize: 13, color: "#fff",
                          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6, boxSizing: "border-box" as const,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <TweetPreview
                accounts={accounts.map(a => ({ username: a.username, score: a.score }))}
                weekNumber={weekNumber}
                totalSmart={totalSmart}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
