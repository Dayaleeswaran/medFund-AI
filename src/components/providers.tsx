"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/types";
import { useSupabaseRealtime } from "@/hooks/use-supabase-realtime";

function AuthBridge({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    if (!supabase) return;

    const mapUser = (u: {
      id: string;
      email?: string | null;
      user_metadata?: Record<string, unknown>;
    }) => ({
      id: u.id,
      full_name:
        (u.user_metadata?.full_name as string | undefined) ??
        u.email ??
        "User",
      role: (u.user_metadata?.role as UserRole | undefined) ?? "donor",
      avatar_url: (u.user_metadata?.avatar_url as string | undefined) ?? null,
    });

    void supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser(mapUser(u));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(mapUser(session.user));
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  useSupabaseRealtime(user?.id);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthBridge>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "rounded-2xl border border-white/10 bg-[#071a2c]/95 text-white backdrop-blur-xl shadow-[0_0_30px_rgba(52,255,154,0.2)]",
        }}
      />
    </AuthBridge>
  );
}
