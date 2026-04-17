import { NextRequest } from "next/server";
import { takeScreenshot } from "@/lib/screenshot";

export const maxDuration = 30;

/**
 * GET /api/card/feature-release?title=...&subtitle=...&bullets=...&...
 *
 * Returns a PNG screenshot of the FeatureReleaseCard via /render/feature-release.
 *
 * Required:
 *   title
 *
 * Optional:
 *   subtitle (1-liner pitch)
 *   bullets  (pipe-separated — "|" delimits, allows commas inside each)
 *   screenshotUrl (optional embedded UI preview)
 *   theme (dark | light, default dark)
 *   layout (side | wide, default side)
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const title = params.get("title");

  if (!title) {
    return Response.json(
      { error: "title parameter is required" },
      { status: 400 },
    );
  }

  try {
    const renderUrl = new URL("/render/feature-release", req.nextUrl.origin);
    params.forEach((value, key) => {
      renderUrl.searchParams.set(key, value);
    });

    const png = await takeScreenshot(renderUrl.toString(), "#card");

    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60, s-maxage=300",
        "Content-Disposition": `inline; filename="feature-release-${Date.now()}.png"`,
      },
    });
  } catch (error) {
    console.error("Screenshot error:", error);
    return Response.json(
      { error: "Failed to generate card image", details: String(error) },
      { status: 500 },
    );
  }
}
