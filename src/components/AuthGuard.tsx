"use client";

import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { useEffect, useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!mounted || configured) return;
    if (!user) router.replace("/login");
  }, [mounted, configured, user, router]);

  if (configured) return <>{children}</>;

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-white/65">
        Initializing…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-white/65">
        Redirecting to sign in…
      </div>
    );
  }

  return <>{children}</>;
}
