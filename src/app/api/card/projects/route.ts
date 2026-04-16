import { NextRequest } from "next/server";
import { takeScreenshot } from "@/lib/screenshot";

export const maxDuration = 30;

/**
 * GET /api/card/projects?projects=...&metricDisplays=...&metricLabel=TVL&...
 *
 * Returns a PNG screenshot of the Projects card (Leaderboard / Funding Rounds / etc).
 * All query params are passed through to /render/projects page.
 *
 * Required: projects (comma-separated @handles)
 * Common:
 *   layout=bars-metric (default)
 *   title, subtitle, theme
 *   names (display names, CSV)
 *   scores (TwitterScore per project, CSV)
 *   metricLabel, metricDisplays, metricValues, metricDiffs
 *   categories (category tags per project, CSV)
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const projects = params.get("projects");

  if (!projects) {
    return Response.json(
      { error: "projects parameter is required (comma-separated handles)" },
      { status: 400 }
    );
  }

  try {
    const renderUrl = new URL("/render/projects", req.nextUrl.origin);
    params.forEach((value, key) => {
      renderUrl.searchParams.set(key, value);
    });

    const png = await takeScreenshot(renderUrl.toString(), "#card");

    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60, s-maxage=300",
        "Content-Disposition": `inline; filename="projects-${Date.now()}.png"`,
      },
    });
  } catch (error) {
    console.error("Screenshot error:", error);
    return Response.json(
      { error: "Failed to generate card image", details: String(error) },
      { status: 500 }
    );
  }
}
