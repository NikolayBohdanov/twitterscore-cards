"use client";

import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import CollageCard from "@/components/CollageCard";

type Theme = "dark" | "light";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 675;

const btnStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
  background: active ? "#2563EB" : "rgba(255,255,255,0.05)",
  border: active ? "1px solid #2563EB" : "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8, color: active ? "#fff" : "rgba(255,255,255,0.5)",
});

function DropZone({ index, url, onDrop }: { index: number; url: string | null; onDrop: (idx: number, url: string) => void }) {
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onDrop(index, reader.result as string);
    reader.readAsDataURL(file);
  }, [index, onDrop]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e: Event) => {
          const f = (e.target as HTMLInputElement).files?.[0];
          if (f) handleFile(f);
        };
        input.click();
      }}
      style={{
        flex: 1,
        minHeight: 100,
        background: dragging ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.03)",
        border: `2px dashed ${dragging ? "#2563EB" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        overflow: "hidden",
        transition: "all 0.15s",
        position: "relative",
      }}
    >
      {url ? (
        <>
          <img src={url} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "top center" }} />
          <div
            onClick={(e) => { e.stopPropagation(); onDrop(index, ""); }}
            style={{
              position: "absolute", top: 6, right: 6,
              width: 22, height: 22, borderRadius: "50%",
              background: "rgba(0,0,0,0.6)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, cursor: "pointer",
            }}
          >✕</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Screenshot #{index + 1}</div>
        </>
      )}
    </div>
  );
}

function PreviewWrapper({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState(1);
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
        Preview — PNG downloads at full {CARD_WIDTH}×{CARD_HEIGHT}
      </h2>
      <div
        ref={(el) => { if (el) setScale(Math.min(el.clientWidth / CARD_WIDTH, 1)); }}
        style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", height: CARD_HEIGHT * scale }}
      >
        <div style={{ width: CARD_WIDTH, height: CARD_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function CollagePage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [screenshots, setScreenshots] = useState<(string | null)[]>([null, null, null, null]);
  const [urlBarTexts, setUrlBarTexts] = useState<string[]>(["twitterscore.io", "twitterscore.io", "twitterscore.io", "twitterscore.io"]);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((idx: number, url: string) => {
    setScreenshots((prev) => {
      const next = [...prev];
      next[idx] = url || null;
      return next;
    });
  }, []);

  const handleUrlChange = useCallback((idx: number, val: string) => {
    setUrlBarTexts((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  }, []);

  const download = useCallback(async () => {
    if (!cardRef.current) return;
    const url = await toPng(cardRef.current, { width: CARD_WIDTH, height: CARD_HEIGHT, pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = url;
    a.download = `collage-${Date.now()}.png`;
    a.click();
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px", display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.06)",
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
            🖼️ Collage Generator
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>4 screenshots in separate browser windows</p>
        </div>

        {/* Theme */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Theme:</span>
          {(["dark", "light"] as Theme[]).map((t) => (
            <button key={t} style={btnStyle(theme === t)} onClick={() => setTheme(t)}>
              {t === "dark" ? "Dark" : "Light"}
            </button>
          ))}
        </div>

        {/* URL bars */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", minWidth: 18 }}>#{i + 1}</span>
              <input
                value={urlBarTexts[i]}
                onChange={(e) => handleUrlChange(i, e.target.value)}
                style={{
                  flex: 1, padding: "6px 10px", fontSize: 12,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6, color: "#fff", outline: "none",
                }}
                placeholder="URL bar text"
              />
            </div>
          ))}
        </div>

        {/* Drop zones — 2×2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, minHeight: 220 }}>
          {[0, 1, 2, 3].map((i) => (
            <DropZone key={i} index={i} url={screenshots[i]} onDrop={handleDrop} />
          ))}
        </div>

        <button onClick={download} style={{
          padding: "10px 24px", fontSize: 14, fontWeight: 700,
          background: "#16a34a", color: "#fff",
          border: "none", borderRadius: 8, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start",
        }}>
          💾 Download PNG
        </button>
      </div>

      {/* Preview */}
      <PreviewWrapper>
        <CollageCard ref={cardRef} screenshots={screenshots} theme={theme} urlBarTexts={urlBarTexts} />
      </PreviewWrapper>
    </div>
  );
}
