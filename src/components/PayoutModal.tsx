"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Send } from "lucide-react";
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
import type { Campaign } from "@/types";
import {
  fintechCeftsPayout,
  fintechGetBalance,
  fintechGetHistory,
} from "@/services/fintech-gateway";
import { useWalletStore } from "@/store/wallet-store";
import { useFintechEventsStore } from "@/store/fintech-events-store";
import { formatCurrency } from "@/lib/utils";

export function PayoutModal({
  campaign,
  trigger,
}: {
  campaign: Campaign;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("25000");
  const [account, setAccount] = useState("12345678");
  const [bankCode, setBankCode] = useState("6990");
  const [busy, setBusy] = useState(false);
  const debit = useWalletStore((s) => s.debit);
  const refreshMirror = useWalletStore((s) => s.syncBankFeed);
  const wallet = useWalletStore((s) => s.wallet);
  const push = useFintechEventsStore((s) => s.push);

  async function submit() {
    const n = Number(amount);
    if (!Number.isFinite(n) || n < 1) {
      toast.error("Invalid amount");
      return;
    }
    setBusy(true);
    try {
      const res = await fintechCeftsPayout({
        amount: n,
        beneficiaryAccountNumber: account.replace(/\s/g, ""),
        beneficiaryBankCode: bankCode.replace(/\s/g, ""),
        campaignId: campaign.id,
        remarks: `MediFund hospital · ${campaign.hospital_name}`,
      });
      debit(
        n,
        `CEFTS payout · ${res.reference} · ${campaign.hospital_name}`,
        campaign.id,
      );
      push({
        kind: "cefts_ok",
        campaignId: campaign.id,
        detail: res.reference,
      });
      toast.success(`CEFTS initiated · ${res.reference}`);
      setOpen(false);
      try {
        if (!wallet) return;
        const bal = await fintechGetBalance();
        const hist = await fintechGetHistory({ walletId: wallet.id });
        refreshMirror({
          balance: bal.available ?? bal.ledger ?? wallet.balance,
          currency: bal.currency ?? "LKR",
          bankTransactions: hist.transactions,
        });
      } catch {
        /* optional refresh */
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "CEFTS failed";
      push({
        kind: "cefts_fail",
        campaignId: campaign.id,
        detail: msg,
      });
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md border-cyan-400/25">
        <DialogTitle>Hospital payout (CEFTS)</DialogTitle>
        <p className="text-sm text-white/65">
          Sandbox beneficiaries:{" "}
          <button
            type="button"
            className="text-[var(--mf-neon)] underline"
            onClick={() => {
              setAccount("12345678");
              setBankCode("6990");
            }}
          >
            12345678 · 6990
          </button>
          {" · "}
          <button
            type="button"
            className="text-[var(--mf-neon)] underline"
            onClick={() => {
              setAccount("1546266");
              setBankCode("6000");
            }}
          >
            1546266 · 6000
          </button>
        </p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="p-amt">Amount (LKR)</Label>
            <Input
              id="p-amt"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="p-acc">Beneficiary account</Label>
            <Input
              id="p-acc"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="p-bc">Bank code</Label>
            <Input
              id="p-bc"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="mt-1"
            />
          </div>
          <p className="text-xs text-white/50">
            Campaign escrow target: {campaign.hospital_name}
          </p>
        </div>
        <GlowButton
          type="button"
          className="w-full gap-2"
          disabled={busy}
          onClick={() => void submit()}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send {formatCurrency(Number(amount) || 0)}
        </GlowButton>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}
