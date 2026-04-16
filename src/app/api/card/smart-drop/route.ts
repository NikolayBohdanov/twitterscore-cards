import { NextRequest } from "next/server";
import { takeScreenshot } from "@/lib/screenshot";

export const maxDuration = 30;

/**
 * GET /api/card/smart-drop?usernames=yacineMTB,katexbt&theme=dark
 *
 * Returns a PNG screenshot of the Smart Drop card.
 * Passes all query params through to /render/smart-drop page.
 *
 * Params:
 *   usernames       — comma-separated Twitter handles (required)
 *   theme           — "dark" | "light" (default: dark)
 *   version         — "v1" | "v2" (default: v1)
 *   week            — week number
 *   totalSmart      — total smart accounts count
 *   sortByScore     — "true" | "false"
 *   showTags        — "true" | "false"
 *   title, subtitle, headerSubtitle, counterLabel
 *   titleBarText, footerLeft, footerCenter, footerRight
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const usernames = params.get("usernames");

  if (!usernames) {
    return Response.json(
      { error: "usernames parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Build the render page URL with all query params
    const renderUrl = new URL("/render/smart-drop", req.nextUrl.origin);
    params.forEach((value, key) => {
      renderUrl.searchParams.set(key, value);
    });

    const png = await takeScreenshot(renderUrl.toString(), "#card");

    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60, s-maxage=300",
        "Content-Disposition": `inline; filename="smart-drop-${Date.now()}.png"`,
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
