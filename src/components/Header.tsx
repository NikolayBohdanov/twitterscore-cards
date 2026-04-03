"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/smart-drop", label: "🎯 Smart Drop" },
  { href: "/projects", label: "📊 Projects" },
  { href: "/updates", label: "🚀 Product Updates" },
  { href: "/spotlight", label: "🔍 Spotlight" },
  { href: "/collage", label: "🖼️ Collage" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        gap: 0,
        height: 52,
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginRight: 32 }}>
        🗄️ TwitterScore Cards
      </span>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              padding: "14px 20px",
              fontSize: 13,
              fontWeight: 600,
              color: isActive ? "white" : "rgba(255,255,255,0.4)",
              borderBottom: isActive ? "2px solid #0544FD" : "2px solid transparent",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
