import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/db";
import {
  normalizeLoginEmail,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/db/queries/auth-guard";

const DEFAULT_MAX = 3;
const DEFAULT_LOCK_MINUTES = 45;

function getLimits() {
  const max = Number(process.env.LOGIN_MAX_FAILED_ATTEMPTS ?? DEFAULT_MAX);
  const minutes = Number(
    process.env.LOGIN_LOCKOUT_MINUTES ?? DEFAULT_LOCK_MINUTES,
  );
  return {
    maxAttempts: Number.isFinite(max) && max > 0 ? max : DEFAULT_MAX,
    lockMinutes: Number.isFinite(minutes) && minutes > 0 ? minutes : DEFAULT_LOCK_MINUTES,
  };
}

export async function POST(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body: { email?: unknown; success?: unknown };
  try {
    body = (await req.json()) as { email?: unknown; success?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? normalizeLoginEmail(body.email) : "";
  const success = body.success === true;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    if (success) {
      await recordLoginSuccess(email);
      return NextResponse.json({ ok: true });
    }

    const { maxAttempts, lockMinutes } = getLimits();
    const result = await recordLoginFailure(email, maxAttempts, lockMinutes);

    if (result.locked) {
      return NextResponse.json({
        ok: true,
        locked: true,
        attempts: result.attempts,
        lockedUntil: result.lockedUntilIso,
        message: `This account is temporarily locked after ${maxAttempts} failed sign-in attempts. Try again after ${result.lockedUntilIso ? new Date(result.lockedUntilIso).toLocaleString() : "later"}, or contact an administrator. An alert was sent for admin review.`,
      });
    }

    return NextResponse.json({
      ok: true,
      locked: false,
      attempts: result.attempts,
    });
  } catch (e) {
    console.error("[login-outcome]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
