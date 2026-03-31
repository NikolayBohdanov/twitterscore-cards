import { NextRequest, NextResponse } from "next/server";

interface AccountInput {
  username: string;
  score: number;
}

interface RequestBody {
  accounts: AccountInput[];
  weekNumber: number;
  totalSmart: number;
  variant: 1 | 2 | 3;
}

// ── Variant 1: Classic template (exact copy of original format) ──
function generateClassic(accounts: AccountInput[], weekNumber: number): string {
  const lines: string[] = [];
  lines.push("🚨 TwitterScore Weekly Smart Drop 🚨");
  lines.push("");
  lines.push("Our new Smarts just landed this week — meet the accounts making real noise on the timeline 👇");
  lines.push("");

  for (const a of accounts) {
    lines.push(`@${a.username} | TwitterScore: ${a.score}`);
  }

  lines.push("");
  lines.push("TwitterScore tracks real influence — not noise, not bots, not empty impressions.");
  lines.push("");
  lines.push("Signal > volume.");
  lines.push("Consistency > hype.");
  lines.push("");
  lines.push("Leaderboard keeps evolving.");
  lines.push("Who's grinding for next week? 👀");
  lines.push("");
  lines.push("We're watching: twitterscore.io");
  lines.push("Follow: @Twiter_score");

  return lines.join("\n");
}

// ── Variant 2: Optimized template (best practices applied) ──
const HOOKS = [
  (wk: number, total: number, n: number) =>
    `📊 TwitterScore Week #${wk}\n\n${total.toLocaleString()} smart accounts tracked. +${n} new smarts this drop 🔥`,
  (wk: number, total: number, n: number) =>
    `⚡ Week #${wk} Smart Drop\n\n${n} new accounts just cleared the bar out of ${total.toLocaleString()} tracked 👇`,
  (wk: number, _total: number, n: number) =>
    `🏆 Smart Drop — Week #${wk}\n\nThe latest ${n} accounts earning their spot on the leaderboard 👇`,
];

const CLOSERS = [
  "11M+ accounts in the pool. These cleared the bar.\nScore is earned, not bought.\n\nNo bots. No inflated reach. No shortcuts.\nWho's next?",
  "Real influence. Real consistency. Real signal.\n\nNo shortcuts. No inflated metrics.\nThe leaderboard keeps shifting — who's grinding for next week? 👀",
  "TwitterScore measures what matters — genuine influence over noise.\n\nSignal > volume.\nConsistency > hype.\n\nWho's showing up next week? 🔥",
];

function generateOptimized(accounts: AccountInput[], weekNumber: number, totalSmart: number): string {
  // Deterministic selection based on week number
  const hookIdx = weekNumber % HOOKS.length;
  const closerIdx = weekNumber % CLOSERS.length;

  const lines: string[] = [];
  lines.push(HOOKS[hookIdx](weekNumber, totalSmart, accounts.length));
  lines.push("");

  for (const a of accounts) {
    lines.push(`@${a.username} | TwitterScore: ${a.score}`);
  }

  lines.push("");
  lines.push(CLOSERS[closerIdx]);
  lines.push("");
  lines.push("Follow: @Twiter_score");

  return lines.join("\n");
}

// ── Variant 3: AI Creative (Gemini 2.5 Flash) ──
const EXAMPLE_TWEETS = `Example 1: "🚨 TwitterScore Weekly Smart Drop 🚨 Our new Smarts just landed this week — meet the accounts making real noise on the timeline 👇 @user | TwitterScore: 158 ... TwitterScore tracks real influence — not noise, not bots, not empty impressions. Signal > volume. Consistency > hype."

Example 2: "📊 TwitterScore Week #12 40,847 smart accounts tracked. +7 new smarts this drop 🔥 @user | TwitterScore: 125.6 ... 11M+ accounts in the pool. These 7 cleared the bar. Score is earned, not bought. No bots. No inflated reach."

Example 3: "Rising stars of TwitterScore 🌟 Many of you we already know, but soon the world will know you even better. These movers are leading the charge and shaping the future of the community."

Example 4: "Shoutout to the real ones 🫡 Today we're sharing some of the people who've been rocking with TwitterScore for a long time — building, grinding, and supporting the vision."

Example 5: "Crypto Twitter, let's do this 🔥 The main followers of @Twiter_score. And we don't just follow — we build, sew, analyze, and move the market forward."`;

async function generateCreative(accounts: AccountInput[], weekNumber: number, totalSmart: number): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCmXiGixjdffjwPkyId_WUT0R87hRMcuqU";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const accountBlock = accounts.map(a => `@${a.username} | TwitterScore: ${a.score}`).join("\n");

  const prompt = `You are a crypto Twitter copywriter for @Twiter_score — a platform tracking real influence on crypto Twitter.

Write a UNIQUE, CREATIVE tweet for the Weekly Smart Drop (Week #${weekNumber}).

DATA:
- ${accounts.length} new smart accounts this week
- ${totalSmart.toLocaleString()} total smart accounts tracked
- 11M+ accounts in the scoring pool

ACCOUNTS TO INCLUDE (you MUST list ALL of them exactly as shown):
${accountBlock}

REFERENCE TWEETS for tone and structure:
${EXAMPLE_TWEETS}

STRICT RULES:
1. English only
2. You MUST include EVERY account listed above with their exact score, formatted as "@username | TwitterScore: XXX" — one per line, with an empty line before and after the list
3. Hook: first 1-2 lines must grab attention (emoji + bold statement)
4. After the account list: add 2-4 lines of commentary (what TwitterScore means, why these accounts matter)
5. End with CTA: "Follow: @Twiter_score"
6. Use 2-4 emojis max (not every line)
7. Whitespace between sections for readability
8. Sound like authentic crypto Twitter — confident, direct, no corporate speak, no AI slop
9. Each generation should use a DIFFERENT creative angle: data callout, challenge, narrative, metaphor, recognition, etc.
10. Do NOT include any URLs or links
11. Do NOT use hashtags
12. Do NOT add "Week #" in the hook if it feels forced — be natural

Output ONLY the raw tweet text. No explanations, no markdown, no quotes.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");

  return text.trim();
}

// ── Handler ──
export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { accounts, weekNumber, totalSmart, variant } = body;

    if (!accounts?.length) {
      return NextResponse.json({ error: "No accounts provided" }, { status: 400 });
    }

    const simplified = accounts.map(a => ({
      username: a.username.replace("@", ""),
      score: Math.round(a.score * 10) / 10,
    }));

    let text: string;

    switch (variant) {
      case 1:
        text = generateClassic(simplified, weekNumber);
        break;
      case 2:
        text = generateOptimized(simplified, weekNumber, totalSmart);
        break;
      case 3:
        text = await generateCreative(simplified, weekNumber, totalSmart);
        break;
      default:
        return NextResponse.json({ error: "Invalid variant (1-3)" }, { status: 400 });
    }

    return NextResponse.json({ text, variant });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
