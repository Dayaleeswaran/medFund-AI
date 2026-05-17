"use client";

import { useEffect } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useCampaignStore } from "@/store/campaign-store";
import { useWalletStore } from "@/store/wallet-store";
import { useNotificationStore } from "@/store/notification-store";
import type { Campaign } from "@/types";

function mapRowToCampaign(row: Record<string, unknown>): Campaign {
  return {
    id: String(row.id),
    user_id: row.user_id ? String(row.user_id) : null,
    patient_name: String(row.patient_name),
    hospital_name: String(row.hospital_name),
    title: String(row.title),
    description: row.description != null ? String(row.description) : null,
    medical_proof_url:
      row.medical_proof_url != null ? String(row.medical_proof_url) : null,
    target_amount: Number(row.target_amount),
    raised_amount: Number(row.raised_amount ?? 0),
    urgency: row.urgency as Campaign["urgency"],
    status: row.status as Campaign["status"],
    verification_status:
      row.verification_status as Campaign["verification_status"],
    fraud_score: Number(row.fraud_score ?? 0),
    trust_score: Number(row.trust_score ?? 0),
    donor_count: Number(row.donor_count ?? 0),
    created_at: row.created_at != null ? String(row.created_at) : undefined,
  };
}

/** Subscribes to live campaign & wallet updates when Supabase is configured */
export function useSupabaseRealtime(userId?: string | null) {
  const patchCampaign = useCampaignStore((s) => s.patchCampaign);
  const updateWallet = useWalletStore((s) => s.updateWallet);
  const addTransaction = useWalletStore((s) => s.addTransaction);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    if (!supabase || !userId) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    const campChannel = supabase
      .channel("campaigns-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaigns" },
        (payload) => {
          if (payload.eventType === "UPDATE" && payload.new) {
            const newCamp = mapRowToCampaign(payload.new as Record<string, unknown>);
            patchCampaign(String(newCamp.id), newCamp);

            // Check if status changed to verified
            if (
              payload.old && 
              (payload.old as Record<string, unknown>).verification_status !== "approved" && 
              newCamp.verification_status === "approved" &&
              newCamp.user_id === userId
            ) {
              useNotificationStore.getState().addNotification(
                "Campaign Approved!",
                `Your fundraiser "${newCamp.title}" has been verified and is now live.`
              );
            }
          }
        },
      )
      .subscribe();
    channels.push(campChannel);

    let cancelled = false;

    const run = async () => {
      const { data: w } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      let walletRowId: string | null = null;
      if (w) {
        walletRowId = String(w.id);
        updateWallet({
          id: walletRowId,
          user_id: String(w.user_id),
          balance: Number(w.balance),
          currency: String(w.currency ?? "LKR"),
          updated_at: w.updated_at != null ? String(w.updated_at) : undefined,
        });
      }

      const walletChannel = supabase
        .channel("wallet-user-" + userId)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "wallets",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.new) {
              const row = payload.new as Record<string, unknown>;
              updateWallet({
                id: String(row.id),
                user_id: String(row.user_id),
                balance: Number(row.balance),
                currency: String(row.currency ?? "LKR"),
                updated_at:
                  row.updated_at != null ? String(row.updated_at) : undefined,
              });
            }
          },
        )
        .subscribe();
      channels.push(walletChannel);

      if (walletRowId) {
        const txChannel = supabase
          .channel("tx-wallet-" + walletRowId)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "transactions",
              filter: `wallet_id=eq.${walletRowId}`,
            },
            (payload) => {
              if (payload.new) {
                const t = payload.new as Record<string, unknown>;
                const amount = Number(t.amount);
                const type = t.type as "inflow" | "outflow";
                
                addTransaction({
                  id: String(t.id),
                  wallet_id: String(t.wallet_id),
                  type,
                  amount,
                  description:
                    t.description != null ? String(t.description) : null,
                  campaign_id:
                    t.campaign_id != null ? String(t.campaign_id) : null,
                  created_at: String(t.created_at),
                });

                if (type === "inflow") {
                  useNotificationStore.getState().addNotification(
                    "New Donation Received",
                    `Your wallet was credited with LKR ${amount.toLocaleString()}`
                  );
                }
              }
            },
          )
          .subscribe();
        channels.push(txChannel);
      }
    };

    void run();

    return () => {
      cancelled = true;
      channels.forEach((ch) => {
        void supabase.removeChannel(ch);
      });
    };
  }, [userId, patchCampaign, updateWallet, addTransaction]);
}
