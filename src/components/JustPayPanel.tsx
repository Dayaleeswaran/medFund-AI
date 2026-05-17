"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Smartphone } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GlowButton } from "@/components/GlowButton";
import {
  justPayPay,
  justPayRegister,
  justPayStatus,
  justPayVerify,
} from "@/services/fintech-gateway";
import { useFintechEventsStore } from "@/store/fintech-events-store";

export function JustPayPanel() {
  const [mobile, setMobile] = useState("");
  const [accountId, setAccountId] = useState("");
  const [otp, setOtp] = useState("");
  const [amount, setAmount] = useState("1000");
  const [txnRef, setTxnRef] = useState("");
  const [step, setStep] = useState<"idle" | "busy">("idle");
  const push = useFintechEventsStore((s) => s.push);

  async function register() {
    setStep("busy");
    try {
      await justPayRegister({
        MobileNumber: mobile,
        mobileNumber: mobile,
        CustomerName: "MediFund Demo",
      });
      toast.success("Registration request sent — check sandbox rules for body shape");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Register failed");
    } finally {
      setStep("idle");
    }
  }

  async function verify() {
    setStep("busy");
    try {
      await justPayVerify({
        MobileNumber: mobile,
        mobileNumber: mobile,
        AccountId: accountId,
        accountId,
        Otp: otp,
        otp,
      });
      toast.success("Verification submitted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verify failed");
    } finally {
      setStep("idle");
    }
  }

  async function pay() {
    setStep("busy");
    try {
      await justPayPay({
        AccountId: accountId,
        Amount: Number(amount),
        CurrencyCode: "LKR",
        Reference: `JP-${Date.now()}`,
      });
      push({ kind: "justpay_ok", detail: "initiated" });
      toast.success("JustPay transaction initiated — capture ID from API response in Network tab");
    } catch (e) {
      push({ kind: "justpay_fail", detail: String(e) });
      toast.error(e instanceof Error ? e.message : "Pay failed");
    } finally {
      setStep("idle");
    }
  }

  async function pollStatus() {
    if (!txnRef) {
      toast.error("Enter / capture transaction id first");
      return;
    }
    setStep("busy");
    try {
      await justPayStatus({ TransactionId: txnRef, transactionId: txnRef });
      toast.success("Status fetched — inspect network tab for raw shape");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Status failed");
    } finally {
      setStep("idle");
    }
  }

  return (
    <GlassCard className="bg-white/70 text-[var(--mf-navy)] border-white/40 shadow-xl">
      <div className="flex items-center gap-2">
        <Smartphone className="h-5 w-5 text-[var(--mf-navy)]" />
        <h2 className="text-lg font-bold text-[var(--mf-navy)]">JustPay (sandbox)</h2>
      </div>
      <p className="mt-2 text-sm text-[var(--mf-navy)]/70">
        Bodies are forwarded as JSON; align field names with your API manual if
        responses show validation errors.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="jp-m" className="text-xs font-bold text-[var(--mf-navy)]/80">MOBILE</Label>
          <Input
            id="jp-m"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="+94…"
            className="mt-1 border-[var(--mf-navy)]/20 bg-white/60 text-[var(--mf-navy)] font-medium placeholder:text-[var(--mf-navy)]/40 focus-visible:ring-[var(--mf-navy)]/50"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="jp-a" className="text-xs font-bold text-[var(--mf-navy)]/80">ACCOUNT ID (POST-REGISTER)</Label>
          <Input
            id="jp-a"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="mt-1 border-[var(--mf-navy)]/20 bg-white/60 text-[var(--mf-navy)] font-medium placeholder:text-[var(--mf-navy)]/40 focus-visible:ring-[var(--mf-navy)]/50"
          />
        </div>
        <div>
          <Label htmlFor="jp-o" className="text-xs font-bold text-[var(--mf-navy)]/80">OTP</Label>
          <Input
            id="jp-o"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="mt-1 border-[var(--mf-navy)]/20 bg-white/60 text-[var(--mf-navy)] font-medium placeholder:text-[var(--mf-navy)]/40 focus-visible:ring-[var(--mf-navy)]/50"
          />
        </div>
        <div>
          <Label htmlFor="jp-amt" className="text-xs font-bold text-[var(--mf-navy)]/80">AMOUNT LKR</Label>
          <Input
            id="jp-amt"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 border-[var(--mf-navy)]/20 bg-white/60 text-[var(--mf-navy)] font-medium placeholder:text-[var(--mf-navy)]/40 focus-visible:ring-[var(--mf-navy)]/50"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="jp-txn" className="text-xs font-bold text-[var(--mf-navy)]/80">TRANSACTION ID (STATUS POLL)</Label>
          <Input
            id="jp-txn"
            value={txnRef}
            onChange={(e) => setTxnRef(e.target.value)}
            className="mt-1 border-[var(--mf-navy)]/20 bg-white/60 text-[var(--mf-navy)] font-medium placeholder:text-[var(--mf-navy)]/40 focus-visible:ring-[var(--mf-navy)]/50"
          />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={step === "busy"}
          onClick={() => void register()}
          className="bg-[var(--mf-navy)] text-white hover:bg-[var(--mf-navy)]/90"
        >
          {step === "busy" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          Register
        </Button>
        <Button
          type="button"
          disabled={step === "busy"}
          onClick={() => void verify()}
          className="bg-[var(--mf-navy)] text-white hover:bg-[var(--mf-navy)]/90"
        >
          Verify OTP
        </Button>
        <GlowButton
          type="button"
          disabled={step === "busy"}
          className="!h-10 !px-6 !text-sm"
          onClick={() => void pay()}
        >
          Pay
        </GlowButton>
        <Button
          type="button"
          variant="outline"
          disabled={step === "busy"}
          onClick={() => void pollStatus()}
          className="border-[var(--mf-navy)]/30 text-[var(--mf-navy)] hover:bg-[var(--mf-navy)]/10"
        >
          Status
        </Button>
      </div>
    </GlassCard>
  );
}
