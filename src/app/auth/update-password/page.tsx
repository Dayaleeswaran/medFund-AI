"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
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
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      router.replace("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-[var(--mf-navy)]">
          Set new password
        </h1>
        <p className="mt-2 text-sm text-[var(--mf-ink)]/70">
          Use a strong password you haven&apos;t used elsewhere.
        </p>
      </div>
      <GlassCard className="bg-white/70 text-[var(--mf-navy)]">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              className="mt-1 text-[var(--mf-navy)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <GlowButton
            type="submit"
            className="w-full"
            disabled={loading || !isSupabaseConfigured()}
          >
            {loading ? "Saving…" : "Save password"}
          </GlowButton>
        </form>
        {!isSupabaseConfigured() ? (
          <p className="mt-4 text-center text-xs text-[var(--mf-ink)]/60">
            Add Supabase keys to .env.local and restart the dev server to update
            your password here.
          </p>
        ) : null}
        <div className="mt-6 text-center text-sm">
          <Link className="font-semibold text-cyan-700 underline" href="/login">
            Sign in
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
