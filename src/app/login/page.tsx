"use client";

import { Suspense, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { mapAuthUserToProfile } from "@/lib/supabase/map-auth-user";
import {
  LOGIN_INVALID_USERNAME_OR_PASSWORD,
  LOGIN_NO_ACCOUNT_FOUND,
} from "@/lib/auth/auth-errors";
import { safeAuthNextPath } from "@/lib/auth/safe-redirect";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeAuthNextPath(searchParams.get("next"));
  const authError = searchParams.get("error");
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authError) return;
    const msg =
      authError === "missing_code"
        ? "Sign-in link was incomplete. Try again."
        : decodeURIComponent(authError);
    toast.error(msg);
  }, [authError]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      toast.error(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to .env.local, then restart the dev server.",
      );
      return;
    }
    const emailTrimmed = email.trim();
    if (!emailTrimmed || !password) {
      toast.error(LOGIN_INVALID_USERNAME_OR_PASSWORD);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("No client");
      const { error, data } = await supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password,
      });

      if (error) {
        const outcomeRes = await fetch("/api/auth/login-outcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailTrimmed.toLowerCase(),
            success: false,
          }),
        });
        const outcome = (await outcomeRes.json()) as {
          locked?: boolean;
          message?: string;
        };
        if (outcome.locked && outcome.message) {
          toast.error(outcome.message);
        } else {
          toast.error(LOGIN_INVALID_USERNAME_OR_PASSWORD);
        }
        return;
      }

      if (!data.user) {
        toast.error(LOGIN_INVALID_USERNAME_OR_PASSWORD);
        return;
      }

      await fetch("/api/auth/login-outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailTrimmed.toLowerCase(),
          success: true,
        }),
      });

      setUser(mapAuthUserToProfile(data.user, emailTrimmed));
      toast.success("Signed in");
      window.location.assign(`${window.location.origin}${next}`);
    } catch {
      toast.error(LOGIN_INVALID_USERNAME_OR_PASSWORD);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-cyan-50/85">
          Secure access to your emergency wallet and attestations.
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
              placeholder="you@hospital.org"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 text-[var(--mf-navy)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <GlowButton
            type="submit"
            className="w-full"
            disabled={loading || !isSupabaseConfigured()}
          >
            {loading ? "Signing in…" : "Continue"}
          </GlowButton>
        </form>
        {!isSupabaseConfigured() ? (
          <p className="mt-4 text-center text-xs text-rose-600">
            Supabase env not set — sign-in requires real credentials in .env.local.
          </p>
        ) : null}
        <div className="mt-4 flex justify-center text-sm">
          <Link
            className="font-medium text-cyan-700 underline"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        <div className="mt-6 flex justify-center gap-2 text-sm">
          <span className="text-[var(--mf-ink)]/60">New here?</span>
          <Link className="font-semibold text-cyan-700 underline" href="/signup">
            Create account
          </Link>
        </div>
        {isSupabaseConfigured() ? (
          <p className="mt-4 text-center text-xs text-[var(--mf-ink)]/55">
            With Supabase, sign in with a real account. Ask an admin to set
            your role in user metadata if you need hospital review access.
          </p>
        ) : null}
      </GlassCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-[var(--mf-ink)]/70">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
