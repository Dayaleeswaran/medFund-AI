import { eq } from "drizzle-orm";
import { getDb } from "../index";
import {
  adminSecurityAlerts,
  loginCredentialGuards,
} from "../schema";

export function normalizeLoginEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getLoginLockStatus(emailNorm: string): Promise<{
  locked: boolean;
  lockedUntilIso?: string;
}> {
  const db = getDb();
  const rows = await db
    .select()
    .from(loginCredentialGuards)
    .where(eq(loginCredentialGuards.emailNorm, emailNorm))
    .limit(1);
  const row = rows[0];

  if (!row?.lockedUntil) {
    return { locked: false };
  }

  if (row.lockedUntil.getTime() > Date.now()) {
    return {
      locked: true,
      lockedUntilIso: row.lockedUntil.toISOString(),
    };
  }

  await db
    .update(loginCredentialGuards)
    .set({
      lockedUntil: null,
      failedAttempts: 0,
      updatedAt: new Date(),
    })
    .where(eq(loginCredentialGuards.emailNorm, emailNorm));

  return { locked: false };
}

export async function recordLoginSuccess(emailNorm: string): Promise<void> {
  const db = getDb();
  await db
    .delete(loginCredentialGuards)
    .where(eq(loginCredentialGuards.emailNorm, emailNorm));
}

export async function recordLoginFailure(
  emailNorm: string,
  maxAttempts: number,
  lockMinutes: number,
): Promise<{ locked: boolean; attempts: number; lockedUntilIso?: string }> {
  const db = getDb();

  const rows = await db
    .select()
    .from(loginCredentialGuards)
    .where(eq(loginCredentialGuards.emailNorm, emailNorm))
    .limit(1);
  const row = rows[0];

  if (row?.lockedUntil && row.lockedUntil.getTime() > Date.now()) {
    return {
      locked: true,
      attempts: row.failedAttempts,
      lockedUntilIso: row.lockedUntil.toISOString(),
    };
  }

  const attempts = (row?.failedAttempts ?? 0) + 1;
  let lockedUntil: Date | null = null;

  if (attempts >= maxAttempts) {
    lockedUntil = new Date(Date.now() + lockMinutes * 60_000);
    await db.insert(adminSecurityAlerts).values({
      alertType: "login_lockout",
      summary: `Login lockout after ${maxAttempts} failed attempts for ${emailNorm}`,
      detail: {
        email_norm: emailNorm,
        failed_attempts: attempts,
        locked_until: lockedUntil.toISOString(),
      },
    });

    const webhook = process.env.ADMIN_LOCKOUT_WEBHOOK_URL?.trim();
    if (webhook) {
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "login_lockout",
            email_norm: emailNorm,
            attempts,
            locked_until: lockedUntil.toISOString(),
          }),
        });
      } catch {
        /* optional webhook */
      }
    }
  }

  if (row) {
    await db
      .update(loginCredentialGuards)
      .set({
        failedAttempts: attempts,
        lockedUntil,
        updatedAt: new Date(),
      })
      .where(eq(loginCredentialGuards.emailNorm, emailNorm));
  } else {
    await db.insert(loginCredentialGuards).values({
      emailNorm,
      failedAttempts: attempts,
      lockedUntil,
      updatedAt: new Date(),
    });
  }

  return {
    locked: Boolean(lockedUntil),
    attempts,
    lockedUntilIso: lockedUntil?.toISOString(),
  };
}
