import { create } from "zustand";
import type { Campaign } from "@/types";
import { createClient } from "@/lib/supabase/client";

type CampaignState = {
  campaigns: Campaign[];
  loading: boolean;
  fetchCampaigns: () => Promise<void>;
  upsertCampaign: (c: Campaign) => Promise<void>;
  patchCampaign: (id: string, patch: Partial<Campaign>) => Promise<void>;
  applyDonation: (campaignId: string, amount: number) => Promise<void>;
};

const supabase = createClient();

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  loading: false,
  fetchCampaigns: async () => {
    if (!supabase) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      set({ campaigns: data as Campaign[] });
    }
    set({ loading: false });
  },
  upsertCampaign: async (c) => {
    if (!supabase) return;
    // Optimistic update
    set((s) => ({
      campaigns: [c, ...s.campaigns.filter((x) => x.id !== c.id)],
    }));
    
    const { error } = await supabase.from("campaigns").upsert(c);
    if (error) {
      console.error("Supabase upsert error:", JSON.stringify(error, null, 2), error.message, error.details);
    }
  },
  patchCampaign: async (id, patch) => {
    if (!supabase) return;
    // Optimistic update
    set((s) => ({
      campaigns: s.campaigns.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    }));

    const { error } = await supabase.from("campaigns").update(patch).eq("id", id);
    if (error) {
      console.error("Supabase patch error:", JSON.stringify(error, null, 2), error.message);
    }
  },
  applyDonation: async (campaignId, amount) => {
    const c = get().campaigns.find((x) => x.id === campaignId);
    if (!c) return;
    
    const newAmount = c.raised_amount + amount;
    const newCount = c.donor_count + 1;
    
    await get().patchCampaign(campaignId, {
      raised_amount: newAmount,
      donor_count: newCount,
    });
  },
}));
