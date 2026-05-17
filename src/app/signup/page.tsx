"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getSiteOrigin } from "@/lib/supabase/site-url";
import { signupErrorMessage } from "@/lib/auth/auth-errors";

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Use at least 6 characters"),
  role: z.enum(["donator", "fund_raiser", "hospital", "admin"], {
    message: "Please select a role",
  }),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", role: "donator" },
  });

  async function onSubmit(values: SignupValues) {
    if (!isSupabaseConfigured()) {
      toast.error(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to .env.local, then restart the dev server.",
      );
      return;
    }
    const supabase = createClient();
    if (!supabase) return;

    try {
      const origin = getSiteOrigin() || window.location.origin;
      const redirectTo = `${origin}/auth/callback?next=/dashboard`;
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          data: {
            full_name: values.fullName.trim(),
            role: values.role,
            is_verified: values.role === "admin" || values.role === "hospital",
          },
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;
      if (data.session) {
        toast.success("Account ready — signed you in.");
        window.location.assign(`${window.location.origin}/dashboard`);
        return;
      }
      toast.success(
        "Check your email — enter the OTP on the verification screen if enabled.",
      );
      router.replace(
        `/auth/verify-otp?email=${encodeURIComponent(values.email.trim())}&type=signup&next=/dashboard`,
      );
    } catch (err: unknown) {
      const raw =
        err instanceof Error ? err.message : "Could not create your account.";
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: unknown }).code)
          : "";
      if (process.env.NODE_ENV === "development") {
        console.error("[signup] Supabase error:", { message: raw, code, err });
      }
      toast.error(signupErrorMessage(raw, code));
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-white">
          Create your MedFund ID
        </h1>
        <p className="mt-2 text-sm text-cyan-50/85">
          One identity for donating, receiving care funds, or attesting as a
          hospital partner.
        </p>
      </div>
      <GlassCard className="bg-white/70 text-[var(--mf-navy)]">
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              className="mt-1 text-[var(--mf-navy)]"
              {...form.register("fullName")}
              aria-invalid={Boolean(form.formState.errors.fullName)}
            />
            {form.formState.errors.fullName ? (
              <p className="mt-1 text-xs text-rose-600">
                {form.formState.errors.fullName.message}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1 text-[var(--mf-navy)]"
              {...form.register("email")}
              aria-invalid={Boolean(form.formState.errors.email)}
            />
            {form.formState.errors.email ? (
              <p className="mt-1 text-xs text-rose-600">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              className="mt-1 text-[var(--mf-navy)]"
              {...form.register("password")}
              aria-invalid={Boolean(form.formState.errors.password)}
            />
            {form.formState.errors.password ? (
              <p className="mt-1 text-xs text-rose-600">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="role">Account Type</Label>
            <select
              id="role"
              className="mt-1 block w-full rounded-md border border-[var(--mf-navy)]/20 bg-white px-3 py-2 text-sm text-[var(--mf-navy)] shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              {...form.register("role")}
              aria-invalid={Boolean(form.formState.errors.role)}
            >
              <option value="donator">Donator</option>
              <option value="fund_raiser">Fund Raiser</option>
              <option value="hospital">Hospital Partner</option>
              <option value="admin">Administrator</option>
            </select>
            {form.formState.errors.role ? (
              <p className="mt-1 text-xs text-rose-600">
                {form.formState.errors.role.message}
              </p>
            ) : null}
          </div>
          <GlowButton
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting || !isSupabaseConfigured()}
          >
            {form.formState.isSubmitting ? "Creating…" : "Create account"}
          </GlowButton>
        </form>
        {!isSupabaseConfigured() ? (
          <p className="mt-4 text-center text-xs text-rose-600">
            Add Supabase keys to .env.local to create a real account.
          </p>
        ) : (
          <p className="mt-4 text-center text-xs text-[var(--mf-ink)]/55">
            Email confirmation / OTP must be enabled in Supabase Auth for the
            verify screen. Magic links still work via email.
          </p>
        )}
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
