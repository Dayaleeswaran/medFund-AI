import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a helpful medical assistant. Summarize the following fundraising campaign description into a very short, empathetic 2-sentence TL;DR.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 100,
      temperature: 0.5,
    });

    const summary = response.choices[0]?.message?.content?.trim();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[ai/summarize] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
