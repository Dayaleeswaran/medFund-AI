import { NextResponse } from "next/server";

const OPENAI_KEY = process.env.OPENAI_API_KEY?.trim();
const MODEL = process.env.OPENAI_CHAT_MODEL?.trim() ?? "gpt-4o-mini";

export async function POST(req: Request) {
  let body: { message?: unknown; mode?: unknown };
  try {
    body = (await req.json()) as { message?: unknown; mode?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 4000) : "";
  const mode =
    typeof body.mode === "string" && body.mode.length < 64
      ? body.mode
      : "fundraiser";

  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  if (!OPENAI_KEY) {
    return NextResponse.json({
      reply: [
        `You said: “${message.slice(0, 280)}${message.length > 280 ? "…" : ""}”.`,
        "",
        "To enable full voice answers, add OPENAI_API_KEY to your server env (.env.local).",
        `Context mode: ${mode}.`,
      ].join("\n"),
      source: "fallback" as const,
    });
  }

  const system = [
    "You are MediFund AI, a voice copilot for a medical crowdfunding app.",
    `Current flow: ${mode}.`,
    "fundraiser: help draft or refine an emergency campaign (urgency, hospital, transparency).",
    "donate: suggest how to pick verified campaigns and give safely.",
    "access: explain hospital verification and accessibility / high-contrast use.",
    "Reply in plain language, under 120 words, no markdown. Sound calm and trustworthy.",
  ].join(" ");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: message },
        ],
        max_tokens: 400,
        temperature: 0.65,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[voice/chat] OpenAI", res.status, detail);
      return NextResponse.json(
        { error: "Assistant temporarily unavailable" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply =
      data.choices?.[0]?.message?.content?.trim() ??
      "I could not generate a reply.";

    return NextResponse.json({ reply, source: "openai" as const });
  } catch (e) {
    console.error("[voice/chat]", e);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
