import { create } from "zustand";
import type { Profile } from "@/types";
import { createClient } from "@/lib/supabase/client";

type UserState = {
  users: Profile[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  verifyUser: (id: string) => Promise<void>;
  addHospital: (name: string, region: string) => Promise<void>;
};

const supabase = createClient();

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  fetchUsers: async () => {
    if (!supabase) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      set({ users: data as Profile[] });
    }
    set({ loading: false });
  },
  verifyUser: async (id) => {
    if (!supabase) return;
    // Optimistic update
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, is_verified: true } : u)),
    }));
    
    await supabase
      .from("profiles")
      .update({ is_verified: true })
      .eq("id", id);
  },
  addHospital: async (name, region) => {
    if (!supabase) return;
    // Note: In a real app, this would involve creating an auth user.
    // For the demo, we'll insert into the profiles table directly.
    const newHospital: Profile = {
      id: crypto.randomUUID(),
      full_name: name,
      role: "hospital",
      avatar_url: null,
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    set((s) => ({ users: [newHospital, ...s.users] }));
    await supabase.from("profiles").insert(newHospital);
  },
}));
