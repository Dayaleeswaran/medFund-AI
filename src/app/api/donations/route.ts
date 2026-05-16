import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getDb, donations } from "@/db";
import { isDatabaseConfigured } from "@/db";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured for ORM" },
      { status: 503 },
    );
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { campaignId?: string; amount?: number; paymentRef?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const campaignId = body.campaignId?.trim();
  if (!campaignId || !UUID_RE.test(campaignId)) {
    return NextResponse.json(
      {
        error:
          "campaignId must be a UUID that exists in Supabase. Seed or sync campaigns to the database for ORM writes.",
      },
      { status: 400 },
    );
  }

  const amount = body.amount;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const paymentRef = body.paymentRef?.slice(0, 256) ?? null;

  try {
    const [row] = await getDb()
      .insert(donations)
      .values({
        campaignId,
        donorId: user.id,
        amount: amount.toFixed(2),
        status: "completed",
        paymentRef,
      })
      .returning();

    return NextResponse.json({ donation: row });
  } catch (e) {
    console.error("[donations]", e);
    return NextResponse.json(
      { error: "Insert failed — check campaign exists and FK constraints" },
      { status: 500 },
    );
  }
}
