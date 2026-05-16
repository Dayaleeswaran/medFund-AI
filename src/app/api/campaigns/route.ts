import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/db";
import { listCampaignsDb } from "@/db/queries/campaigns";

/** GET /api/campaigns — list campaigns from Postgres (Drizzle ORM). */
export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured", campaigns: [] },
      { status: 503 },
    );
  }

  try {
    const rows = await listCampaignsDb(100);
    return NextResponse.json({ campaigns: rows });
  } catch (e) {
    console.error("[campaigns]", e);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}
