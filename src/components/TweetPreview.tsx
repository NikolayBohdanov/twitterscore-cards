"use client";

import { useState, useEffect } from "react";

interface Account {
  username: string;
  score: number;
}

interface Props {
  accounts: Account[];
  weekNumber: number;
  totalSmart: number;
}

const VARIANTS = [
  { key: 1 as const, label: "Classic", icon: "📋", desc: "Original format" },
  { key: 2 as const, label: "Optimized", icon: "⚡", desc: "Best practices" },
  { key: 3 as const, label: "AI Creative", icon: "🤖", desc: "Unique each time" },
];

export default function TweetPreview({ accounts, weekNumber, totalSmart }: Props) {
  const [texts, setTexts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number>(1);

  // Auto-generate V1 and V2 on mount / data change
  useEffect(() => {
    if (accounts.length === 0) return;
    generateVariant(1);
    generateVariant(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, weekNumber, totalSmart]);

  const generateVariant = async (variant: 1 | 2 | 3) => {
    setLoading(prev => ({ ...prev, [variant]: true }));
    setErrors(prev => ({ ...prev, [variant]: "" }));
    try {
      const res = await fetch("/api/generate-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accounts, weekNumber, totalSmart, variant }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setTexts(prev => ({ ...prev, [variant]: data.text }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      setErrors(prev => ({ ...prev, [variant]: msg }));
    } finally {
      setLoading(prev => ({ ...prev, [variant]: false }));
    }
  };

  const copyToClipboard = async (variant: number) => {
    const text = texts[variant];
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(variant);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(variant);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const charCount = (text: string) => text?.length || 0;

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: 16,
      padding: 24,
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, marginTop: 0 }}>
        📝 Tweet Text
      </h2>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 0, marginBottom: 16 }}>
        Auto-generated tweet text — copy and paste to Twitter
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {VARIANTS.map(v => (
          <button
            key={v.key}
            onClick={() => {
              setActiveTab(v.key);
              if (v.key === 3 && !texts[3] && !loading[3]) {
                generateVariant(3);
              }
            }}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background: activeTab === v.key ? "rgba(5,68,253,0.15)" : "rgba(255,255,255,0.03)",
              color: activeTab === v.key ? "#5B8DEF" : "rgba(255,255,255,0.5)",
              border: activeTab === v.key ? "1px solid rgba(5,68,253,0.3)" : "1px solid rgba(255,255,255,0.06)",
              transition: "all 0.15s ease",
            }}
          >
            {v.icon} {v.label}
            <span style={{ display: "block", fontSize: 10, fontWeight: 400, marginTop: 2, opacity: 0.6 }}>
              {v.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Active variant content */}
      {VARIANTS.map(v => (
        <div key={v.key} style={{ display: activeTab === v.key ? "block" : "none" }}>
          {/* Twitter-style preview */}
          <div style={{
            background: "#000",
            borderRadius: 12,
            border: "1px solid #2F3336",
            overflow: "hidden",
          }}>
            {/* Tweet header */}
            <div style={{
              padding: "12px 16px 0",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, #0544FD, #00CC66)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
              }}>🐦</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#E7E9EA" }}>
                    🐦 Score
                  </span>
                  <svg width="18" height="18" viewBox="0 0 22 22" style={{ flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="11" fill="#1D9BF0" />
                    <path d="M9.5 14.25L6.75 11.5L5.75 12.5L9.5 16.25L17.5 8.25L16.5 7.25L9.5 14.25Z" fill="white" />
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: "#71767B" }}>@Twiter_score</span>
              </div>
            </div>

            {/* Tweet body */}
            <div style={{
              padding: "8px 16px 12px",
              minHeight: 80,
            }}>
              {loading[v.key] ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  color: "rgba(255,255,255,0.4)", fontSize: 14, padding: "20px 0",
                }}>
                  <span style={{
                    display: "inline-block", width: 16, height: 16,
                    border: "2px solid rgba(255,255,255,0.2)",
                    borderTopColor: "#5B8DEF",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  Generating{v.key === 3 ? " with AI" : ""}...
                </div>
              ) : errors[v.key] ? (
                <div style={{ color: "#F4212E", fontSize: 14, padding: "12px 0" }}>
                  ⚠️ {errors[v.key]}
                </div>
              ) : texts[v.key] ? (
                <div style={{
                  fontSize: 15,
                  lineHeight: 1.45,
                  color: "#E7E9EA",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {formatTweetText(texts[v.key])}
                </div>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, padding: "20px 0" }}>
                  Click to generate
                </div>
              )}
            </div>

            {/* Image preview placeholder */}
            <div style={{
              margin: "0 16px 12px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 12,
              border: "1px solid #2F3336",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "rgba(255,255,255,0.3)",
              fontSize: 13,
            }}>
              🖼️ Smart Drop card image attached
            </div>

            {/* Tweet footer (engagement) */}
            <div style={{
              padding: "0 16px 12px",
              display: "flex",
              gap: 40,
              color: "#71767B",
              fontSize: 13,
            }}>
              <span>💬</span>
              <span>🔁</span>
              <span>❤️</span>
              <span>📊</span>
              <span>↗️</span>
            </div>
          </div>

          {/* Actions bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
            gap: 8,
          }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              {texts[v.key] ? `${charCount(texts[v.key])} chars` : ""}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {v.key === 3 && (
                <button
                  onClick={() => generateVariant(3)}
                  disabled={loading[3]}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: loading[3] ? "wait" : "pointer",
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.6)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  🔄 Regenerate
                </button>
              )}
              <button
                onClick={() => copyToClipboard(v.key)}
                disabled={!texts[v.key]}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: texts[v.key] ? "pointer" : "default",
                  background: copied === v.key ? "#22C55E" : "#0544FD",
                  color: "#fff",
                  border: "none",
                  transition: "background 0.2s",
                  opacity: texts[v.key] ? 1 : 0.4,
                }}
              >
                {copied === v.key ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Format tweet text: make @mentions blue
function formatTweetText(text: string) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} style={{ color: "#1D9BF0" }}>{part}</span>
      );
    }
    return part;
  });
}
