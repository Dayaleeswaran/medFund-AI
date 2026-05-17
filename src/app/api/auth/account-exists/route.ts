import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { checkAuthRouteRateLimit } from "@/lib/auth/rate-limit-auth";
import { getClientKeyFromRequest } from "@/lib/http/client-ip";

const bodySchema = z.object({
  email: z.string().trim().email(),
});

/** Uses service role (optional). Returns `{ exists: boolean | null }` — null means unknown. */
export async function POST(req: Request) {
  const ip = getClientKeyFromRequest(req);
  const rl = checkAuthRouteRateLimit(`account-exists:${ip}`);
  if (!rl.ok) {
    return NextResponse.json(
      { exists: null, error: "Too many requests", retryAfterSec: rl.retryAfterSec },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ exists: null, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ exists: null, error: "Invalid email" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    return NextResponse.json({ exists: null });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const norm = parsed.data.email.toLowerCase();
  let page = 1;
  const perPage = 200;

  try {
    while (page <= 25) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error) {
        console.error("[account-exists] admin listUsers", error.message);
        return NextResponse.json({ exists: null });
      }
      const users = data.users ?? [];
      const hit = users.some((u) => u.email?.toLowerCase() === norm);
      if (hit) return NextResponse.json({ exists: true });
      if (users.length < perPage) break;
      page += 1;
    }
    return NextResponse.json({ exists: false });
  } catch (e) {
    console.error("[account-exists]", e);
    return NextResponse.json({ exists: null });
  }
}
