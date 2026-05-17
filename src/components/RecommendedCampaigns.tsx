"use client";

import { useCampaignStore } from "@/store/campaign-store";
import { CampaignCard } from "@/components/CampaignCard";
import { Sparkles } from "lucide-react";

export function RecommendedCampaigns({ currentCampaignId }: { currentCampaignId: string }) {
  const campaigns = useCampaignStore((s) => s.campaigns);
  
  // Filter active and verified campaigns, exclude current, and sort by trust score
  const recommendations = campaigns
    .filter(c => c.id !== currentCampaignId && c.status === "active" && c.verification_status === "verified")
    .sort((a, b) => b.trust_score - a.trust_score)
    .slice(0, 3);

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <Sparkles className="h-5 w-5 text-[var(--mf-neon)]" />
        <h3 className="text-xl font-semibold text-white">You might also want to support</h3>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {recommendations.map((c, i) => (
          <CampaignCard key={c.id} campaign={c} index={i} />
        ))}
      </div>
    </div>
  );
}
