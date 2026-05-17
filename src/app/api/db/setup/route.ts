import { readFileSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import postgres from "postgres";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Applies `supabase/schema.sql` using your Supabase Postgres URL (`DATABASE_URL`).
 *
 * Supabase's public HTTP/JS APIs (PostgREST, anon key) cannot run CREATE TABLE.
 * This uses the same database access as the SQL Editor.
 *
 * POST /api/db/setup
 * Headers: Authorization: Bearer <DB_SETUP_SECRET>
 * Body:   { "confirm": "APPLY_MEDIFUND_SCHEMA" }
 *
 * Prefer Session pooler or direct DB host for DDL; transaction pooler may block some statements.
 */
export async function POST(req: Request) {
  const secret = process.env.DB_SETUP_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      {
        error:
          "DB_SETUP_SECRET is not set. Add it to .env.local for one-time schema apply.",
      },
      { status: 503 },
    );
  }

  const auth = req.headers.get("authorization");
  if (
    auth !== `Bearer ${secret}` &&
    req.headers.get("x-db-setup-secret") !== secret
  ) {
    return NextResponse.json(
      {
        error:
          "Unauthorized. Send Authorization: Bearer <DB_SETUP_SECRET> or x-db-setup-secret.",
      },
      { status: 401 },
    );
  }

  let body: { confirm?: string };
  try {
    body = (await req.json()) as { confirm?: string };
  } catch {
    return NextResponse.json({ error: "Expected JSON body" }, { status: 400 });
  }

  if (body.confirm !== "APPLY_MEDIFUND_SCHEMA") {
    return NextResponse.json(
      {
        error:
          'Set body to { "confirm": "APPLY_MEDIFUND_SCHEMA" } to avoid accidental runs.',
      },
      { status: 400 },
    );
  }

  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    return NextResponse.json(
      { error: "DATABASE_URL is not set (Supabase Postgres connection string)" },
      { status: 503 },
    );
  }

  const sqlPath = path.join(process.cwd(), "supabase", "schema.sql");
  let ddl: string;
  try {
    ddl = readFileSync(sqlPath, "utf8");
  } catch {
    return NextResponse.json(
      { error: `Could not read ${sqlPath}` },
      { status: 500 },
    );
  }

  const client = postgres(url, {
    max: 1,
    prepare: false,
    connect_timeout: 60,
    idle_timeout: 60,
  });

  try {
    await client.unsafe(ddl);
    await client.end({ timeout: 15 });
    return NextResponse.json({
      ok: true,
      message:
        "schema.sql executed. If some lines were already applied (e.g. realtime publication), check logs in Supabase.",
    });
  } catch (e) {
    await client.end({ timeout: 5 }).catch(() => {});
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        error: message,
        hint:
          "Use Session mode / port 5432 connection string if the pooler rejects DDL. Re-running may fail on publication/trigger—run remaining SQL in the Supabase SQL Editor.",
      },
      { status: 500 },
    );
  }
}

export function GET() {
  return NextResponse.json(
    {
      method: "POST only",
      description:
        "Apply MediFund tables to Supabase Postgres via DATABASE_URL (not the anon REST API).",
      headers: ["Authorization: Bearer <DB_SETUP_SECRET>", "or x-db-setup-secret"],
      body: { confirm: "APPLY_MEDIFUND_SCHEMA" },
    },
    { status: 200 },
  );
}
