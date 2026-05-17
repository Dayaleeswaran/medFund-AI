"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getSiteOrigin } from "@/lib/supabase/site-url";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      toast.error(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to .env.local, then restart the dev server.",
      );
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    setLoading(true);
    try {
      const emailTrimmed = email.trim();
      const origin = getSiteOrigin() || window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(emailTrimmed, {
        redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
      });
      if (error) throw error;
      toast.success("Check your email for a reset link.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-white">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-cyan-50/85">
          We&apos;ll email you a link to choose a new password.
        </p>
      </div>
      <GlassCard className="bg-white/70 text-[var(--mf-navy)]">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1 text-[var(--mf-navy)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <GlowButton
            type="submit"
            className="w-full"
            disabled={loading || !isSupabaseConfigured()}
          >
            {loading ? "Sending…" : "Send reset link"}
          </GlowButton>
        </form>
        {!isSupabaseConfigured() ? (
          <p className="mt-4 text-center text-xs text-[var(--mf-ink)]/60">
            Add Supabase URL and anon (or publishable) key to .env.local, then
            restart the dev server, to send reset links.
          </p>
        ) : null}
        <div className="mt-6 text-center text-sm">
          <Link className="font-semibold text-cyan-700 underline" href="/login">
            Back to sign in
          </Link>
        </div>
        <p className="mt-6 text-center text-xs text-[var(--mf-ink)]/55">
          If Supabase sends one-time codes, verify them on{" "}
          <Link className="font-semibold text-cyan-700 underline" href="/auth/verify-otp?type=recovery">
            the OTP screen
          </Link>
          .
        </p>
      </GlassCard>
    </div>
  );
}
