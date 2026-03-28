import { NextRequest, NextResponse } from "next/server";

const API_KEY = "69b53667ea209b4211c128b67910b2d2";
const BASE = "https://twitterscore.io/api/v1";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ error: "username required" }, { status: 400 });
  }

  try {
    // Fetch score first to get twitter_id
    const scoreRes = await fetch(
      `${BASE}/get_twitter_score?api_key=${API_KEY}&username=${username}`
    );
    const scoreData = await scoreRes.json();

    if (!scoreData.success) {
      return NextResponse.json(
        { error: "Account not found", username },
        { status: 404 }
      );
    }

    // Use twitter_id for info to ensure consistency
    const twitterId = scoreData.twitter_id;
    const infoRes = await fetch(
      `${BASE}/get_twitter_info?api_key=${API_KEY}&twitter_id=${twitterId}`
    );
    const infoData = await infoRes.json();

    // Parse category: categories → tags → fallback by score
    let category = "";
    let tags: string[] = [];
    if (infoData.success) {
      // Categories have category_name field
      if (infoData.categories && infoData.categories.length > 0) {
        category = infoData.categories[0].category_name || infoData.categories[0].name || "";
      }
      // Tags (e.g. "a16z", "NFT", "DeFi") — API returns tag_name or name
      if (infoData.tags && infoData.tags.length > 0) {
        tags = infoData.tags.map((t: { tag_name?: string; name?: string }) => t.tag_name || t.name || "");
        // Use first tag's category if no category yet
        if (!category && infoData.tags[0].tag_categories?.length > 0) {
          category = infoData.tags[0].tag_categories[0].name || infoData.tags[0].tag_categories[0].tag_category_name || "";
        }
        // Use tag name as category fallback
        if (!category) {
          category = tags[0];
        }
      }
    }

    // Fetch smart followers count
    let smartFollowers = 0;
    try {
      const followersRes = await fetch(
        `${BASE}/get_followers?api_key=${API_KEY}&twitter_id=${twitterId}&size=1&page=1`
      );
      const followersData = await followersRes.json();
      if (followersData.success) {
        smartFollowers = followersData.total || 0;
      }
    } catch {
      // Non-critical, default to 0
    }

    // Fetch score diff (week/month)
    let weekDiff = 0;
    let monthDiff = 0;
    try {
      const diffRes = await fetch(
        `${BASE}/get_twitter_scores_diff?api_key=${API_KEY}&twitter_id=${twitterId}`
      );
      const diffData = await diffRes.json();
      if (diffData.success) {
        weekDiff = diffData.week?.diff || 0;
        monthDiff = diffData.month?.diff || 0;
      }
    } catch {
      // Non-critical
    }

    // Determine category from score range if still empty
    if (!category) {
      const score = scoreData.twitter_score;
      if (score >= 80) category = "Top Smart";
      else if (score >= 50) category = "Smart";
      else if (score >= 20) category = "Rising";
      else category = "New";
    }

    return NextResponse.json({
      username: scoreData.username,
      twitter_id: twitterId,
      name: infoData.success ? infoData.name || scoreData.username : scoreData.username,
      score: Math.round(scoreData.twitter_score * 10) / 10,
      avatar: infoData.success ? infoData.profile_image || "" : "",
      category,
      tags,
      followers: infoData.success ? infoData.followers_count || 0 : 0,
      smartFollowers,
      weekDiff,
      monthDiff,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "API error", detail: String(e) },
      { status: 500 }
    );
  }
}
