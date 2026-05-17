"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useCampaignStore } from "@/store/campaign-store";
import { useWalletStore } from "@/store/wallet-store";
import { useUserStore } from "@/store/user-store";

export function DataInitializer() {
  const user = useAuthStore((s) => s.user);
  const fetchCampaigns = useCampaignStore((s) => s.fetchCampaigns);
  const fetchWalletData = useWalletStore((s) => s.fetchWalletData);
  const fetchUsers = useUserStore((s) => s.fetchUsers);

  useEffect(() => {
    // Global data
    fetchCampaigns();
    
    // User-specific data
    if (user?.id) {
      fetchWalletData(user.id);
    }
    
    // Admin/Hospital data
    if (user?.role === "admin" || user?.role === "hospital") {
      fetchUsers();
    }
  }, [user?.id, user?.role, fetchCampaigns, fetchWalletData, fetchUsers]);

  return null;
}
