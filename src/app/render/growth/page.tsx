"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import GrowthStoryCard, { GrowthPlatform } from "@/components/GrowthStoryCard";

/**
 * Headless render page for GrowthStoryCard.
 * Driven entirely by URL params.
 *
 * Usage:
 *   /render/growth?title=Prediction+Markets+4x%27d
 *     &subtitle=2024+to+2025
 *     &beforeValue=%2415.8B&beforeLabel=2024
 *     &afterValue=%2463.5B&afterLabel=2025
 *     &delta=%2B301%25&deltaDirection=up
 *     &platforms=Polymarket,HyperliquidX,Kalshi,trylimitless
 *     &platformTags=leader,new+entrant,regulated+US,mobile+first
 *     &theme=dark
 *
 * Avatars + display names are fetched via /api/score per platform handle.
 * Screenshot target: #card
 */
export default function RenderGrowthPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            background: "#000",
            color: "#fff",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Loading...
        </div>
      }
    >
      <RenderInner />
    </Suspense>
  );
}

function splitCsv(v: string | null): string[] {
  if (!v) return [];
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

function RenderInner() {
  const p = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [platforms, setPlatforms] = useState<GrowthPlatform[]>([]);
  const [loading, setLoading] = useState(true);

  const title = p.get("title") || "Growth Story";
  const subtitle = p.get("subtitle") || "";
  const theme = (p.get("theme") || "dark") as "dark" | "light";

  const before = {
    value: p.get("beforeValue") || "—",
    label: p.get("beforeLabel") || undefined,
  };
  const after = {
    value: p.get("afterValue") || "—",
    label: p.get("afterLabel") || undefined,
  };

  const deltaValue = p.get("delta");
  const deltaDirParam = p.get("deltaDirection") || "up";
  const delta = deltaValue
    ? {
        value: deltaValue,
        direction: (deltaDirParam === "down" ? "down" : "up") as "up" | "down",
      }
    : undefined;

  const handles = splitCsv(p.get("platforms"));
  const tags = splitCsv(p.get("platformTags"));

  useEffect(() => {
    if (handles.length === 0) {
      setLoading(false);
      return;
    }
    const fetchAll = async () => {
      const out: GrowthPlatform[] = [];
      for (let i = 0; i < handles.length; i++) {
        const handle = handles[i];
        try {
          const res = await fetch(`/api/score?username=${encodeURIComponent(handle)}`);
          const data = await res.json();
          if (res.ok) {
            out.push({
              handle,
              name: data.name || handle,
              avatar: data.avatar,
              score: data.score,
              tag: tags[i],
            });
          } else {
            out.push({ handle, name: handle, tag: tags[i] });
          }
        } catch {
          out.push({ handle, name: handle, tag: tags[i] });
        }
      }
      setPlatforms(out);
      setLoading(false);
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#000",
          color: "#fff",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <>
      {/* Load Inter + Noto Color Emoji for headless Chromium — same pattern as
          /render/smart-drop and /render/projects. Without this, emoji render
          as tofu boxes because @sparticuz/chromium ships stripped. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Color+Emoji&display=swap');
        * { font-family: 'Inter', 'Noto Color Emoji', sans-serif; }
      `}</style>
      <div
        style={{
          background: theme === "dark" ? "#000" : "#f5f5f5",
          padding: 0,
          margin: 0,
        }}
      >
        <div id="card" style={{ display: "inline-block" }}>
          <GrowthStoryCard
            ref={cardRef}
            title={title}
            subtitle={subtitle}
            before={before}
            after={after}
            delta={delta}
            platforms={platforms}
            theme={theme}
          />
        </div>
      </div>
    </>
  );
}
