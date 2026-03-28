"use client";

import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import SpotlightCard, { SpotlightFormat, SpotlightDimensions } from "@/components/SpotlightCard";

type Theme = "dark" | "light";

const CHROME_HEIGHT = 38; // window dots bar
const FOOTER_HEIGHT = 36; // footer + padding
const PADDING_V = 32; // top + bottom padding
const CARD_WIDTH = 1200;

const formats: { key: SpotlightFormat; label: string; icon: string; size: string }[] = [
  { key: "adaptive", label: "Adaptive", icon: "✨", size: "fits image" },
  { key: "standard", label: "Standard", icon: "📐", size: "1200×675" },
  { key: "wide", label: "Wide", icon: "📏", size: "1200×540" },
  { key: "tall", label: "Tall", icon: "📱", size: "1200×900" },
];

const btnStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
  background: active ? "#2563EB" : "rgba(255,255,255,0.05)",
  border: active ? "1px solid #2563EB" : "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8, color: active ? "#fff" : "rgba(255,255,255,0.5)",
});

const fixedSizes: Record<string, { w: number; h: number }> = { standard: { w: 1200, h: 675 }, wide: { w: 1200, h: 540 }, tall: { w: 1200, h: 900 } };

function PreviewWrapper({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const [scale, setScale] = useState(1);
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
        Preview — PNG downloads at full {w}×{h}
      </h2>
      <div
        ref={(el) => { if (el) setScale(Math.min(el.clientWidth / w, 1)); }}
        style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", height: h * scale }}
      >
        <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function SpotlightPage() {
  const [format, setFormat] = useState<SpotlightFormat>("adaptive");
  const [theme, setTheme] = useState<Theme>("dark");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [adaptiveDims, setAdaptiveDims] = useState<SpotlightDimensions>({ width: 1200, height: 675 });
  const [urlBarText, setUrlBarText] = useState("twitterscore.io");
  const cardRef = useRef<HTMLDivElement>(null);

  const getSize = () => {
    if (format === "adaptive") return { w: adaptiveDims.width, h: adaptiveDims.height };
    return fixedSizes[format] || fixedSizes.standard;
  };
  const { w, h } = getSize();

  // Calculate adaptive height from image dimensions
  const onImageLoad = useCallback((dataUrl: string) => {
    setScreenshotUrl(dataUrl);
    if (format === "adaptive") {
      const img = new Image();
      img.onload = () => {
        const imgAspect = img.width / img.height;
        const contentWidth = CARD_WIDTH - 48; // padding 24*2
        const imgHeight = contentWidth / imgAspect;
        const totalHeight = Math.round(imgHeight + CHROME_HEIGHT + FOOTER_HEIGHT + PADDING_V);
        const clampedHeight = Math.max(400, Math.min(totalHeight, 1200));
        setAdaptiveDims({ width: CARD_WIDTH, height: clampedHeight });
      };
      img.src = dataUrl;
    }
  }, [format]);

  const downloadPng = useCallback(async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { width: w, height: h, pixelRatio: 2, cacheBust: true });
    const link = document.createElement("a");
    link.download = `spotlight-${format}.png`;
    link.href = dataUrl;
    link.click();
  }, [format, w, h]);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 24, marginBottom: 32, border: "1px solid rgba(255,255,255,0.06)" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🔍 Project Spotlight Generator</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16, marginTop: 0 }}>Screenshot of a TwitterScore project page in a browser frame</p>

          {/* Format selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {formats.map(f => (
              <button key={f.key} onClick={() => setFormat(f.key)} style={btnStyle(format === f.key)}>
                {f.icon} {f.label} <span style={{ opacity: 0.5, fontSize: 11 }}>({f.size})</span>
              </button>
            ))}
          </div>

          {/* Theme */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", alignSelf: "center", marginRight: 8 }}>Theme:</label>
            <button onClick={() => setTheme("dark")} style={btnStyle(theme === "dark")}>Dark</button>
            <button onClick={() => setTheme("light")} style={btnStyle(theme === "light")}>Light</button>
          </div>

          {/* URL bar text */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginRight: 8 }}>URL bar:</label>
            <input
              type="text"
              value={urlBarText}
              onChange={e => setUrlBarText(e.target.value)}
              style={{
                padding: "8px 14px", fontSize: 13, fontWeight: 500,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#fff", width: 300,
                outline: "none",
              }}
              placeholder="twitterscore.io"
            />
          </div>

          {/* Screenshot drop zone */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>Screenshot (drag & drop or click)</label>
            <div
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#0544FD"; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              onDrop={e => {
                e.preventDefault(); e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                const file = e.dataTransfer.files[0];
                if (file?.type.startsWith("image/")) { const r = new FileReader(); r.onload = () => onImageLoad(r.result as string); r.readAsDataURL(file); }
              }}
              onClick={() => {
                const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
                input.onchange = () => { const f = input.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => onImageLoad(r.result as string); r.readAsDataURL(f); } };
                input.click();
              }}
              style={{
                border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 12,
                padding: screenshotUrl ? 0 : 32, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", transition: "border-color 0.2s",
              }}
            >
              {screenshotUrl ? (
                <div style={{ position: "relative", width: "100%" }}>
                  <img src={screenshotUrl} style={{ width: "100%", maxHeight: 200, objectFit: "contain" }} />
                  <button
                    onClick={e => { e.stopPropagation(); setScreenshotUrl(""); }}
                    style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 6, color: "#FF5F57", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: "4px 10px" }}
                  >✕ Remove</button>
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
                  <div style={{ fontSize: 13 }}>Drop TwitterScore page screenshot here</div>
                </div>
              )}
            </div>
          </div>

          {/* Download */}
          <button onClick={downloadPng} style={{ padding: "10px 24px", background: "#00CC66", border: "none", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            📥 Download PNG
          </button>
        </div>

        <PreviewWrapper w={w} h={h}>
          <SpotlightCard
            ref={cardRef}
            screenshotUrl={screenshotUrl || undefined}
            theme={theme}
            format={format}
            adaptiveDimensions={format === "adaptive" ? adaptiveDims : undefined}
            urlBarText={urlBarText}
          />
        </PreviewWrapper>
      </div>
    </div>
  );
}
