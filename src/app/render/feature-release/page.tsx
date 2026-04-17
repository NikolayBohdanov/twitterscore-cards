"use client";

import { Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import FeatureReleaseCard, { FeatureLayout } from "@/components/FeatureReleaseCard";

/**
 * Headless render page for FeatureReleaseCard.
 * Driven by URL params, mirrors /render/growth + /render/projects pattern.
 *
 * Usage:
 *   /render/feature-release?title=Smart+Score
 *     &subtitle=Rank+any+crypto+account+by+real+influence
 *     &bullets=11M%2B+accounts+scored|Proprietary+algorithm|Not+follower-weighted
 *     &screenshotUrl=https%3A%2F%2F...&theme=dark&layout=side
 *
 * bullets are pipe-separated to allow commas inside each bullet.
 * Screenshot target: #card
 */
export default function RenderFeatureReleasePage() {
  return (
    <Suspense
      fallback={
        <div style={{ background: "#000", color: "#fff", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          Loading...
        </div>
      }
    >
      <RenderInner />
    </Suspense>
  );
}

function RenderInner() {
  const p = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);

  const title = p.get("title") || "New Feature";
  const subtitle = p.get("subtitle") || "";
  const screenshotUrl = p.get("screenshotUrl") || undefined;
  const theme = (p.get("theme") || "dark") as "dark" | "light";
  const layout = (p.get("layout") || "side") as FeatureLayout;

  // bullets are pipe-separated (not CSV) so that commas inside a bullet work
  const bullets = (p.get("bullets") || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Color+Emoji&display=swap');
        * { font-family: 'Inter', 'Noto Color Emoji', sans-serif; }
      `}</style>
      <div style={{ background: theme === "dark" ? "#000" : "#f5f5f5", padding: 0, margin: 0 }}>
        <div id="card" style={{ display: "inline-block" }}>
          <FeatureReleaseCard
            ref={cardRef}
            title={title}
            subtitle={subtitle}
            bullets={bullets}
            screenshotUrl={screenshotUrl}
            theme={theme}
            layout={layout}
          />
        </div>
      </div>
    </>
  );
}
