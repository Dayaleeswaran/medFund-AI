"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlowButton } from "@/components/GlowButton";
import { useCampaignStore } from "@/store/campaign-store";
import { useWalletStore } from "@/store/wallet-store";
import { useAuthStore } from "@/store/auth-store";
import type { Campaign } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  fintechGetBalance,
  fintechGetHistory,
  fintechHealth,
  fintechTransferDonation,
} from "@/services/fintech-gateway";
import { useFintechEventsStore } from "@/store/fintech-events-store";

export function DonationModal({
  campaign,
  trigger,
}: {
  campaign: Campaign;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("5000");
  const [step, setStep] = useState<"form" | "success">("form");
  const [busy, setBusy] = useState(false);
  const [lastRef, setLastRef] = useState<string | null>(null);

  const applyDonation = useCampaignStore((s) => s.applyDonation);
  const patchCampaign = useCampaignStore((s) => s.patchCampaign);
  const credit = useWalletStore((s) => s.credit);
  const syncBankFeed = useWalletStore((s) => s.syncBankFeed);
  const wallet = useWalletStore((s) => s.wallet);
  const user = useAuthStore((s) => s.user);
  const pushEvent = useFintechEventsStore((s) => s.push);

  async function refreshBankMirror() {
    try {
      const bal = await fintechGetBalance();
      const hist = await fintechGetHistory({ walletId: wallet.id });
      const balance =
        bal.available ??
        bal.ledger ??
        wallet.balance;
      syncBankFeed({
        balance,
        currency: bal.currency ?? "LKR",
        bankTransactions: hist.transactions,
      });
    } catch {
      /* mirror is best-effort */
    }
  }

  async function onDonate() {
    const n = Number(amount);
    if (!Number.isFinite(n) || n < 100) {
      toast.error("Enter at least 100 LKR (sandbox)");
      return;
    }
    setBusy(true);
    try {
      const { configured } = await fintechHealth();
      if (!configured) {
        toast.error(
          "Banking API not configured. Add FINTECH_BASE_URL and FINTECH_API_KEY to .env.local",
        );
        return;
      }

      const transfer = await fintechTransferDonation({
        amount: n,
        campaignId: campaign.id,
        narration: `MediFund · ${campaign.patient_name} · ${campaign.title.slice(0, 40)}`,
      });

      setLastRef(transfer.reference);
      applyDonation(campaign.id, n);
      credit(
        n,
        `Internal transfer · ${campaign.patient_name} · ${transfer.reference}`,
        campaign.id,
      );
      pushEvent({
        kind: "internal_transfer_ok",
        campaignId: campaign.id,
        detail: transfer.reference,
      });
      const c = useCampaignStore
        .getState()
        .campaigns.find((x) => x.id === campaign.id);
      const fraudBase = c?.fraud_score ?? campaign.fraud_score;
      patchCampaign(campaign.id, {
        fraud_score: Math.max(0, fraudBase - 2),
        trust_score: Math.min(100, (c?.trust_score ?? campaign.trust_score) + 1),
      });

      if (isSupabaseConfigured() && user?.id && !user.id.startsWith("demo")) {
        const res = await fetch("/api/donations", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId: campaign.id,
            amount: n,
            paymentRef: transfer.reference,
          }),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          console.warn(
            "[donation ORM]",
            j.error ?? `HTTP ${res.status} — campaign may need UUID in DB`,
          );
        }
      }

      await refreshBankMirror();
      setStep("success");
      toast.success("Sandbox transfer posted — escrow credited");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transfer failed";
      pushEvent({
        kind: "internal_transfer_fail",
        campaignId: campaign.id,
        detail: msg,
      });
      const c = useCampaignStore
        .getState()
        .campaigns.find((x) => x.id === campaign.id);
      const fraudBase = c?.fraud_score ?? campaign.fraud_score;
      patchCampaign(campaign.id, {
        fraud_score: Math.min(100, fraudBase + 5),
      });
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  function onOpenChange(v: boolean) {
    setOpen(v);
    if (!v) {
      setStep("form");
      setAmount("5000");
      setLastRef(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md border-[var(--mf-neon)]/20">
        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-4"
            >
              <DialogTitle>Live sandbox donation</DialogTitle>
              <p className="text-sm text-white/65">
                Executes a real{" "}
                <span className="font-semibold text-[var(--mf-neon)]">
                  internal transfer
                </span>{" "}
                on the buildathon core banking API (source → escrow account).
                Keys stay server-side.
              </p>
              <div className="space-y-2">
                <Label htmlFor="amt">Amount (LKR)</Label>
                <Input
                  id="amt"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
                <p>
                  Recipient narrative:{" "}
                  <span className="text-white">{campaign.patient_name}</span> ·{" "}
                  {campaign.hospital_name}
                </p>
                <p className="mt-1">
                  Campaign progress:{" "}
                  {formatCurrency(campaign.raised_amount)} raised (UI) · Goal{" "}
                  {formatCurrency(campaign.target_amount)}
                </p>
              </div>
              <GlowButton
                type="button"
                className="w-full"
                disabled={busy}
                onClick={() => void onDonate()}
              >
                {busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting transfer…
                  </span>
                ) : (
                  <>
                    Donate{" "}
                    {formatCurrency(Number(amount) || 0, "LKR", "en-LK")}
                  </>
                )}
              </GlowButton>
              <p className="text-center text-[11px] text-white/45">
                Rate limit: 100 calls / 15 min · X-API-Key never sent to browser
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="ok"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 py-2 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--mf-neon)]/20 text-[var(--mf-neon)] shadow-[0_0_32px_rgba(52,255,154,0.45)]">
                ✓
              </div>
              <DialogTitle>Transfer accepted</DialogTitle>
              <p className="text-sm text-white/70">
                Core banking reference{" "}
                <span className="font-mono text-[var(--mf-neon)]">
                  {lastRef}
                </span>
                . Wallet mirror refreshed from ledger where available.
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
