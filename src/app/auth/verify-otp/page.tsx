"use client";

import type { FormEvent } from "react";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { OtpInput } from "@/components/auth/OtpInput";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { safeAuthNextPath } from "@/lib/auth/safe-redirect";

const OTP_TYPES = ["signup", "email", "recovery"] as const;

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email =
    searchParams.get("email")?.trim() ??
    searchParams.get("email_address")?.trim() ??
    "";
  const next = safeAuthNextPath(searchParams.get("next"));
  const typeParam = (searchParams.get("type") ?? "signup").toLowerCase();
  const otpType = OTP_TYPES.includes(typeParam as (typeof OTP_TYPES)[number])
    ? (typeParam as (typeof OTP_TYPES)[number])
    : "signup";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      toast.error("Supabase is not configured. Add keys to .env.local.");
      return;
    }
    if (!email) {
      toast.error("Missing email. Open the link from your email again.");
      return;
    }
    const token = code.replace(/\s/g, "");
    if (token.length < 6) {
      toast.error("Enter the 6-digit code from your email.");
      return;
    }

    const supabase = createClient();
    if (!supabase) return;

    setLoading(true);
    try {
      const { error, data } = await supabase.auth.verifyOtp({
        email,
        token,
        type: otpType,
      });
      if (error) throw error;
      if (data.session) {
        toast.success("Verified — welcome in.");
        window.location.assign(`${window.location.origin}${next}`);
        return;
      }
      toast.success("Code accepted. Continue in the app.");
      router.replace("/login");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Verification failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-[var(--mf-navy)]">
          Enter verification code
        </h1>
        <p className="mt-2 text-sm text-[var(--mf-ink)]/70">
          We sent a one-time code to{" "}
          <span className="font-semibold text-cyan-800">{email || "your email"}</span>
          . Paste it below (Supabase Auth must have email OTP enabled for this
          flow).
        </p>
      </div>
      <GlassCard className="bg-white/70 text-[var(--mf-navy)]">
        <form className="space-y-8" onSubmit={onSubmit}>
          <OtpInput value={code} onChange={setCode} disabled={loading} />
          <GlowButton
            type="submit"
            className="w-full"
            disabled={loading || !isSupabaseConfigured()}
          >
            {loading ? "Verifying…" : "Verify & continue"}
          </GlowButton>
        </form>
        <p className="mt-4 text-center text-xs text-[var(--mf-ink)]/55">
          Resetting a password? Use the link in the email, or choose type{" "}
          <code className="rounded bg-black/5 px-1">recovery</code> in the URL
          query when your project issues OTP codes.
        </p>
        <div className="mt-6 text-center text-sm">
          <Link className="font-semibold text-cyan-700 underline" href="/login">
            Back to sign in
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-[var(--mf-ink)]/70">
          Loading…
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
