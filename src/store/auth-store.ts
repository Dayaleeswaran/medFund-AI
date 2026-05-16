import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/types";

type AuthState = {
  user: Profile | null;
  setUser: (u: Profile | null) => void;
  demoLogin: (role?: Profile["role"]) => void;
  signOut: () => void;
};

const demoProfile = (role: Profile["role"] = "donor"): Profile => ({
  id: "demo-user",
  full_name: role === "hospital" ? "Dr. A. Kapoor" : "Alex River",
  role,
  avatar_url: null,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      demoLogin: (role = "donor") => set({ user: demoProfile(role) }),
      signOut: () => set({ user: null }),
    }),
    { name: "medifund-auth" },
  ),
);
