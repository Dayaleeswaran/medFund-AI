"use client";

import { Suspense, useState } from "react";
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
import type { UserRole } from "@/types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const setUser = useAuthStore((s) => s.setUser);
  const demoLogin = useAuthStore((s) => s.demoLogin);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        if (!supabase) throw new Error("No client");
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            full_name:
              (data.user.user_metadata?.full_name as string | undefined) ??
              email,
            role:
              (data.user.user_metadata?.role as UserRole | undefined) ??
              "donor",
            avatar_url: null,
          });
        }
        toast.success("Signed in");
        router.replace(next);
      } else {
        demoLogin("donor");
        toast.success("Demo session started");
        router.replace(next);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-[var(--mf-navy)]">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[var(--mf-ink)]/70">
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
            disabled={loading}
          >
            {loading ? "Signing in…" : "Continue"}
          </GlowButton>
        </form>
        {!isSupabaseConfigured() ? (
          <p className="mt-4 text-center text-xs text-[var(--mf-ink)]/60">
            Supabase env not set — Continue starts a local demo session.
          </p>
        ) : null}
        <div className="mt-6 flex justify-center gap-2 text-sm">
          <span className="text-[var(--mf-ink)]/60">New here?</span>
          <Link className="font-semibold text-cyan-700 underline" href="/signup">
            Create account
          </Link>
        </div>
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            className="w-full border-[var(--mf-navy)]/12 text-[var(--mf-navy)]"
            onClick={() => {
              demoLogin("hospital");
              toast.success("Hospital reviewer demo");
              router.replace("/admin");
            }}
          >
            Try hospital reviewer demo
          </Button>
        </div>
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
