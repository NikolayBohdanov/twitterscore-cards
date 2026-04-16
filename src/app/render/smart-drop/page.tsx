"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SmartDropCard, { AccountData, CardTheme } from "@/components/SmartDropCard";
import SmartDropCardV2 from "@/components/SmartDropCardV2";
import { CardTextOverrides, DEFAULT_OVERRIDES } from "@/components/cardOverrides";

/**
 * Headless render page for Smart Drop cards.
 * No UI controls — just the card, driven entirely by URL params.
 *
 * Usage:
 *   /render/smart-drop?usernames=yacineMTB,katexbt&theme=dark&title=Smart+Influencer+Drop
 *
 * Params:
 *   usernames       — comma-separated Twitter handles (required)
 *   theme           — "dark" | "light" (default: dark)
 *   version         — "v1" | "v2" (default: v1)
 *   week            — week number (default: current ISO week)
 *   totalSmart      — total smart accounts count (default: 40847)
 *   sortByScore     — "true" | "false" (default: true)
 *   showTags        — "true" | "false" (default: true)
 *   title           — card title override
 *   subtitle        — card subtitle override
 *   headerSubtitle  — header subtitle (e.g. "Smart Influencer Drop")
 *   counterLabel    — counter label override
 *   footerLeft      — footer left text
 *   footerCenter    — footer center text
 *   footerRight     — footer right text
 *
 * The page auto-fetches scores and renders the card.
 * Use Playwright to screenshot the #card element.
 */
export default function RenderSmartDropPage() {
  return (
    <Suspense fallback={<div style={{ background: "#000", color: "#fff", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <RenderSmartDropInner />
    </Suspense>
  );
}

function RenderSmartDropInner() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  // Parse params
  const usernames = (searchParams.get("usernames") || "").split(",").map(u => u.trim().replace("@", "")).filter(Boolean);
  const theme = (searchParams.get("theme") || "dark") as CardTheme;
  const version = searchParams.get("version") || "v1";
  const weekNumber = Number(searchParams.get("week")) || getISOWeek();
  const totalSmart = Number(searchParams.get("totalSmart")) || 40847;
  const sortByScore = searchParams.get("sortByScore") !== "false";
  const showTags = searchParams.get("showTags") !== "false";

  const overrides: CardTextOverrides = {
    title: searchParams.get("title") || DEFAULT_OVERRIDES.title,
    subtitle: searchParams.get("subtitle") || "",
    headerSubtitle: searchParams.get("headerSubtitle") || "",
    counterLabel: searchParams.get("counterLabel") || "",
    footerLeft: searchParams.get("footerLeft") || DEFAULT_OVERRIDES.footerLeft,
    footerCenter: searchParams.get("footerCenter") || DEFAULT_OVERRIDES.footerCenter,
    footerRight: searchParams.get("footerRight") || DEFAULT_OVERRIDES.footerRight,
    titleBarText: searchParams.get("titleBarText") || DEFAULT_OVERRIDES.titleBarText,
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (usernames.length === 0) {
      setError("No usernames provided");
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        const results: AccountData[] = [];
        for (const username of usernames) {
          const res = await fetch(`/api/score?username=${username}`);
          const data = await res.json();
          if (res.ok) results.push(data);
          else results.push({ username, name: username, score: 0, avatar: "", category: "", tags: [], followers: 0 });
        }
        if (sortByScore) results.sort((a, b) => b.score - a.score);
        setAccounts(results);
      } catch {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#000", color: "#fff" }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#000", color: "#FF5F57" }}>
        {error}
      </div>
    );
  }

  const cardProps = {
    ref: cardRef,
    accounts,
    weekNumber,
    totalSmart,
    newCount: accounts.length,
    showTags,
    overrides,
  };

  return (
    <div style={{ background: theme === "dark" ? "#000" : "#f5f5f5", padding: 0, margin: 0 }}>
      <div id="card" style={{ display: "inline-block" }}>
        {version === "v2" ? (
          <SmartDropCardV2 {...cardProps} />
        ) : (
          <SmartDropCard {...cardProps} theme={theme} />
        )}
      </div>
    </div>
  );
}

function getISOWeek(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}
