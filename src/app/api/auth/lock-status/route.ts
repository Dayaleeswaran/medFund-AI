import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/db";
import {
  getLoginLockStatus,
  normalizeLoginEmail,
} from "@/db/queries/auth-guard";

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email?.trim()) {
    return NextResponse.json({ locked: false });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ locked: false });
  }

  try {
    const emailNorm = normalizeLoginEmail(email);
    const { locked, lockedUntilIso } = await getLoginLockStatus(emailNorm);
    if (!locked) {
      return NextResponse.json({ locked: false });
    }
    return NextResponse.json({
      locked: true,
      lockedUntil: lockedUntilIso,
      message: `This account is temporarily locked after too many failed sign-in attempts. Try again after ${lockedUntilIso ? new Date(lockedUntilIso).toLocaleString() : "the lockout ends"}, or contact an administrator.`,
    });
  } catch {
    return NextResponse.json({ locked: false });
  }
}
