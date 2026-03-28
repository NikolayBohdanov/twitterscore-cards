"use client";

import { forwardRef } from "react";
import { AccountData } from "./SmartDropCard";

interface Props {
  accounts: AccountData[];
  weekNumber: number;
  totalSmart: number;
  newCount: number;
  showTags?: boolean;
}

const SCORE_GRADIENT = "linear-gradient(90deg, #FF4B04 0%, #F2DB06 52%, #12E83B 100%)";

function scoreToPercent(score: number): number {
  if (score <= 0) return 0;
  return Math.min(Math.round(Math.pow(score * 100000, 0.25)), 100);
}

function scoreBarBgSize(score: number): string {
  const pct = scoreToPercent(score);
  if (pct <= 0) return "100% 100%";
  return `${(100 / pct) * 100}% 100%`;
}

function getScoreTextColor(score: number): string {
  if (score >= 50) return "#0544FD";
  if (score >= 20) return "#3B82F6";
  return "#94A3B8";
}

const SmartDropCardV2 = forwardRef<HTMLDivElement, Props>(
  ({ accounts, weekNumber, totalSmart, newCount }, ref) => {
    const prevTotal = totalSmart - newCount;
    const maxScore = Math.max(...accounts.map((a) => a.score), 100);

    return (
      <div
        ref={ref}
        style={{
          width: 1200,
          height: 675,
          position: "relative",
          overflow: "hidden",
          background: "white",
          fontFamily: "'Inter', sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: 4,
            background: "linear-gradient(90deg, #0544FD 0%, #3B82F6 50%, #93C5FD 100%)",
            flexShrink: 0,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 40px 16px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img
              src="/logo-blue.svg"
              alt="TwitterScore"
              style={{ height: 56 }}
              crossOrigin="anonymous"
              onError={(e) => {
                // fallback to black logo
                (e.target as HTMLImageElement).src = "/logo-black.svg";
              }}
            />
            <div
              style={{
                width: 1,
                height: 28,
                background: "#E2E8F0",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#0F172A",
                  letterSpacing: -0.3,
                }}
              >
                Weekly Smart Drop
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#94A3B8",
                  fontWeight: 500,
                }}
              >
                Week #{weekNumber}
              </div>
            </div>
          </div>

          {/* Counter */}
          <div
            style={{
              background: "#F0F4FF",
              borderRadius: 12,
              padding: "10px 20px",
              textAlign: "right",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#0544FD",
                letterSpacing: -0.5,
              }}
            >
              <span style={{ color: "#94A3B8", fontSize: 14, fontWeight: 500 }}>
                {prevTotal.toLocaleString()} →{" "}
              </span>
              {totalSmart.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: 1.2,
                fontWeight: 600,
              }}
            >
              Smart Accounts · +{newCount} new
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#E2E8F0", margin: "0 40px", flexShrink: 0 }} />

        {/* Account list */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "12px 40px",
            gap: 4,
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {accounts.map((acc, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                borderRadius: 12,
                background: i % 2 === 0 ? "#F8FAFC" : "white",
                gap: 16,
              }}
            >
              {/* Rank */}
              <div
                style={{
                  width: 28,
                  fontSize: 14,
                  fontWeight: 700,
                  color: i < 3 ? "#0544FD" : "#94A3B8",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>

              {/* Avatar */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid #E2E8F0",
                  background: "#F1F5F9",
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
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#94A3B8",
                    }}
                  >
                    {acc.username[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name + username */}
              <div style={{ width: 200, flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#0F172A",
                    lineHeight: 1.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {acc.name || acc.username}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#94A3B8",
                    fontWeight: 500,
                  }}
                >
                  @{acc.username}
                </div>
              </div>

              {/* Score bar */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    flex: 1,
                    height: 24,
                    background: "#F1F5F9",
                    borderRadius: 12,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: `${scoreToPercent(acc.score)}%`,
                      height: "100%",
                      background: SCORE_GRADIENT,
                      backgroundSize: scoreBarBgSize(acc.score),
                      backgroundPosition: "left",
                      backgroundRepeat: "no-repeat",
                      borderRadius: 12,
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 52,
                    fontSize: 20,
                    fontWeight: 900,
                    color: getScoreTextColor(acc.score),
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {acc.score}
                </div>
              </div>

              {/* Smart badge */}
              <div
                style={{
                  width: 70,
                  display: "flex",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    background: "#ECFDF5",
                    color: "#059669",
                    padding: "4px 10px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  ✓ Smart
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 40px",
            borderTop: "1px solid #E2E8F0",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "#94A3B8",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            twitterscore.io
          </span>
          <span
            style={{
              fontSize: 11,
              color: "#94A3B8",
              fontWeight: 500,
            }}
          >
            11M+ Accounts Tracked · Real-Time Scoring
          </span>
          <span
            style={{
              fontSize: 11,
              color: "#94A3B8",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            @Twiter_score
          </span>
        </div>
      </div>
    );
  }
);

SmartDropCardV2.displayName = "SmartDropCardV2";
export default SmartDropCardV2;
