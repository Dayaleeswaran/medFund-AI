import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/types";

type AuthState = {
  user: Profile | null;
  setUser: (u: Profile | null) => void;
  signOut: () => Promise<void>;
};



export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      signOut: async () => {
        try {
          const { createClient, isSupabaseConfigured } = await import(
            "@/lib/supabase/client"
          );
          if (typeof window !== "undefined" && isSupabaseConfigured()) {
            await createClient()?.auth.signOut();
          }
        } catch {
          /* ignore */
        }
        set({ user: null });
      },
    }),
    { name: "medifund-auth" },
  ),
);
