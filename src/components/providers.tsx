"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { mapAuthUserToProfile } from "@/lib/supabase/map-auth-user";
import { useSupabaseRealtime } from "@/hooks/use-supabase-realtime";

function AuthBridge({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    if (!supabase) return;

    void supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser(mapAuthUserToProfile(u));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(mapAuthUserToProfile(session.user));
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
