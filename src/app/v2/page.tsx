"use client";

import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { AccountData } from "@/components/SmartDropCard";
import SmartDropCardV2 from "@/components/SmartDropCardV2";

export default function V2Page() {
  const [input, setInput] = useState("");
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [weekNumber, setWeekNumber] = useState(12);
  const [totalSmart, setTotalSmart] = useState(40847);
  const cardRef = useRef<HTMLDivElement>(null);

  const parseUsernames = (text: string): string[] => {
    return text
      .replace(/@/g, "")
      .split(/[\s,;|\n]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
  };

  const fetchAccounts = async () => {
    const usernames = parseUsernames(input);
    if (usernames.length === 0) {
      setError("Enter at least one username");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const results: AccountData[] = [];
      for (const username of usernames) {
        const res = await fetch(`/api/score?username=${username}`);
        const data = await res.json();
        if (res.ok) {
          results.push(data);
        } else {
          results.push({
            username,
            name: username,
            score: 0,
            avatar: "",
            category: "",
            tags: [],
            followers: 0,
          });
        }
      }
      const sorted = [...results].sort((a, b) => b.score - a.score);
      setAccounts(sorted);
    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const downloadPng = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1200,
        height: 675,
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `smart-drop-v2-week-${weekNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setError("Failed to generate image");
    }
  }, [weekNumber]);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Controls */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 16,
            padding: 24,
            marginBottom: 32,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            ✨ Weekly Smart Drop Generator V2
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16, marginTop: 0 }}>
            Brand design — white background, large avatars, score bars
          </p>

          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "0 0 100px" }}>
              <label
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Week #
              </label>
              <input
                type="number"
                value={weekNumber}
                onChange={(e) => setWeekNumber(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "white",
                  fontSize: 14,
                }}
              />
            </div>
            <div style={{ flex: "0 0 160px" }}>
              <label
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Total Smart Accounts
              </label>
              <input
                type="number"
                value={totalSmart}
                onChange={(e) => setTotalSmart(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "white",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Usernames (comma, space, or newline separated)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="@Selene406, @CryptoFloki, @0xNeodallas, @Kaffchad..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "white",
                fontSize: 14,
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={fetchAccounts}
              disabled={loading}
              style={{
                padding: "10px 24px",
                background: loading ? "#333" : "#0544FD",
                border: "none",
                borderRadius: 8,
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Loading..." : "⚡ Generate Card"}
            </button>
            {accounts.length > 0 && (
              <button
                onClick={downloadPng}
                style={{
                  padding: "10px 24px",
                  background: "#00CC66",
                  border: "none",
                  borderRadius: 8,
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                📥 Download PNG
              </button>
            )}
          </div>

          {error && (
            <div style={{ color: "#FF5F57", marginTop: 12, fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        {/* Preview */}
        {accounts.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 12,
              }}
            >
              Preview (1200×675)
            </h2>
            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <SmartDropCardV2
                ref={cardRef}
                accounts={accounts}
                weekNumber={weekNumber}
                totalSmart={totalSmart}
                newCount={accounts.length}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
