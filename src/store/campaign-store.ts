import { create } from "zustand";
import type { Campaign } from "@/types";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data";

type CampaignState = {
  campaigns: Campaign[];
  setCampaigns: (c: Campaign[]) => void;
  upsertCampaign: (c: Campaign) => void;
  patchCampaign: (id: string, patch: Partial<Campaign>) => void;
  applyDonation: (campaignId: string, amount: number) => void;
};

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: MOCK_CAMPAIGNS,
  setCampaigns: (campaigns) => set({ campaigns }),
  upsertCampaign: (c) =>
    set((s) => ({
      campaigns: [
        c,
        ...s.campaigns.filter((x) => x.id !== c.id),
      ],
    })),
  patchCampaign: (id, patch) =>
    set((s) => ({
      campaigns: s.campaigns.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    })),
  applyDonation: (campaignId, amount) => {
    const c = get().campaigns.find((x) => x.id === campaignId);
    if (!c) return;
    get().patchCampaign(campaignId, {
      raised_amount: c.raised_amount + amount,
      donor_count: c.donor_count + 1,
    });
  },
}));
