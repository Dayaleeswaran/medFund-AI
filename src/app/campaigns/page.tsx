"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { CampaignCard } from "@/components/CampaignCard";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCampaignStore } from "@/store/campaign-store";
import type { Campaign } from "@/types";
import toast from "react-hot-toast";

export default function CampaignsPage() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const upsert = useCampaignStore((s) => s.upsertCampaign);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    patient_name: "",
    hospital_name: "",
    title: "",
    description: "",
    target_amount: "75000",
  });

  function submit() {
    const target = Number(form.target_amount);
    if (!form.patient_name || !form.hospital_name || !form.title || !target) {
      toast.error("Fill required fields");
      return;
    }
    const c: Campaign = {
      id: `cmp-${Date.now()}`,
      user_id: "local",
      patient_name: form.patient_name,
      hospital_name: form.hospital_name,
      title: form.title,
      description: form.description || null,
      medical_proof_url: null,
      target_amount: target,
      raised_amount: 0,
      urgency: "high",
      status: "pending_verification",
      verification_status: "pending",
      fraud_score: 22 + Math.round(Math.random() * 15),
      trust_score: 72,
      donor_count: 0,
      created_at: new Date().toISOString(),
    };
    upsert(c);
    toast.success("Campaign staged — awaiting hospital attestation");
    setOpen(false);
    setForm({
      patient_name: "",
      hospital_name: "",
      title: "",
      description: "",
      target_amount: "75000",
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/90">
            Live floor
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--mf-navy)] sm:text-4xl">
            Emergency campaigns streaming in realtime
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--mf-ink)]/75">
            Every card shows verification status, AI risk, donor velocity, and
            goal pressure — optimized for one-thumb mobile triage.
          </p>
        </div>
        <Button
          variant="secondary"
          className="h-12 gap-2 self-start rounded-2xl border-[var(--mf-navy)]/15 bg-white/70 text-[var(--mf-navy)]"
          onClick={() => setOpen((v) => !v)}
        >
          <Plus className="h-4 w-4" />
          New fundraiser
        </Button>
      </div>

      {open ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <GlassCard className="bg-white/65">
            <h2 className="text-lg font-semibold text-[var(--mf-navy)]">
              Create emergency campaign
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pn">Patient name</Label>
                <Input
                  id="pn"
                  className="mt-1 text-[var(--mf-navy)] placeholder:text-[var(--mf-ink)]/35"
                  value={form.patient_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, patient_name: e.target.value }))
                  }
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="hn">Hospital</Label>
                <Input
                  id="hn"
                  className="mt-1 text-[var(--mf-navy)] placeholder:text-[var(--mf-ink)]/35"
                  value={form.hospital_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hospital_name: e.target.value }))
                  }
                  placeholder="Verified facility"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="tl">Title</Label>
                <Input
                  id="tl"
                  className="mt-1 text-[var(--mf-navy)] placeholder:text-[var(--mf-ink)]/35"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Short emergency headline"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="desc">Situation</Label>
                <textarea
                  id="desc"
                  className="mt-1 min-h-[100px] w-full rounded-2xl border border-[var(--mf-navy)]/12 bg-white/80 px-4 py-3 text-sm text-[var(--mf-navy)] placeholder:text-[var(--mf-ink)]/40"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Clinical context, timeline, funding gap…"
                />
              </div>
              <div>
                <Label htmlFor="tg">Target (USD)</Label>
                <Input
                  id="tg"
                  className="mt-1 text-[var(--mf-navy)]"
                  value={form.target_amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, target_amount: e.target.value }))
                  }
                />
              </div>
            </div>
            <GlowButton
              type="button"
              className="mt-6"
              onClick={() => submit()}
            >
              Submit for verification
            </GlowButton>
          </GlassCard>
        </motion.div>
      ) : null}

      <div className="rounded-[32px] bg-gradient-to-b from-[#041a30] to-[#052038] p-5 sm:p-6 shadow-[0_30px_90px_rgba(4,26,48,0.35)]">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c, i) => (
            <CampaignCard key={c.id} campaign={c} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
