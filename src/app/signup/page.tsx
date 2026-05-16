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
import { useAuthStore } from "@/store/auth-store";

export default function SignupPage() {
  const router = useRouter();
  const demoLogin = useAuthStore((s) => s.demoLogin);

  const [fullName, setFullName] = useState("");
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: "donor" },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm, then sign in.");
        router.replace("/login");
      } else {
        demoLogin("donor");
        toast.success("Demo donor created locally");
        router.replace("/dashboard");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-[var(--mf-navy)]">
          Create your MediFund ID
        </h1>
        <p className="mt-2 text-sm text-[var(--mf-ink)]/70">
          One identity for donating, receiving care funds, or attesting as a
          hospital partner.
        </p>
      </div>
      <GlassCard className="bg-white/70 text-[var(--mf-navy)]">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              className="mt-1 text-[var(--mf-navy)]"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              className="mt-1 text-[var(--mf-navy)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              className="mt-1 text-[var(--mf-navy)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <GlowButton type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </GlowButton>
        </form>
        {!isSupabaseConfigured() ? (
          <p className="mt-4 text-center text-xs text-[var(--mf-ink)]/60">
            Without Supabase keys we mint a safe local profile only.
          </p>
        ) : null}
        <div className="mt-6 flex justify-center gap-2 text-sm">
          <span className="text-[var(--mf-ink)]/60">Have an account?</span>
          <Link className="font-semibold text-cyan-700 underline" href="/login">
            Log in
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
