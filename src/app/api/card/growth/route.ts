import { NextRequest } from "next/server";
import { takeScreenshot } from "@/lib/screenshot";

export const maxDuration = 30;

/**
 * GET /api/card/growth?title=...&beforeValue=$15.8B&afterValue=$63.5B&...
 *
 * Returns a PNG screenshot of the GrowthStoryCard. All query params are
 * passed through to /render/growth (which fetches avatars via /api/score).
 *
 * Required:
 *   title
 *   beforeValue, afterValue
 *
 * Common:
 *   subtitle, theme
 *   beforeLabel, afterLabel
 *   delta, deltaDirection (up|down)
 *   platforms (CSV handles)
 *   platformTags (CSV, parallel to platforms)
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const title = params.get("title");
  const beforeValue = params.get("beforeValue");
  const afterValue = params.get("afterValue");

  if (!title || !beforeValue || !afterValue) {
    return Response.json(
      { error: "title, beforeValue, afterValue are required" },
      { status: 400 },
    );
  }

  try {
    const renderUrl = new URL("/render/growth", req.nextUrl.origin);
    params.forEach((value, key) => {
      renderUrl.searchParams.set(key, value);
    });

    const png = await takeScreenshot(renderUrl.toString(), "#card");

    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60, s-maxage=300",
        "Content-Disposition": `inline; filename="growth-${Date.now()}.png"`,
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
