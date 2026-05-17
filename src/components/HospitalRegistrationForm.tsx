"use client";

import { useState } from "react";
import { useUserStore } from "@/store/user-store";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export function HospitalRegistrationForm() {
  const addHospital = useUserStore((s) => s.addHospital);
  const [form, setForm] = useState({
    name: "",
    region: "Colombo, SL",
    email: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Please fill required fields");
      return;
    }
    addHospital(form.name, form.region);
    toast.success(`${form.name} registered and login credentials dispatched.`);
    setForm({ name: "", region: "Colombo, SL", email: "" });
  }

  return (
    <GlassCard className="bg-white/60">
      <h3 className="text-lg font-semibold text-[var(--mf-navy)]">Register Verified Hospital</h3>
      <p className="mt-1 text-xs text-[var(--mf-ink)]/60">
        This adds the institution to the trusted network and generates a secure hospital login.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="hname">Hospital Name</Label>
          <Input
            id="hname"
            className="mt-1 text-[var(--mf-navy)]"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Asiri Central"
          />
        </div>
        <div>
          <Label htmlFor="hemail">Administrative Email (Login)</Label>
          <Input
            id="hemail"
            type="email"
            className="mt-1 text-[var(--mf-navy)]"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="admin@hospital.com"
          />
        </div>
        <div>
          <Label htmlFor="hregion">Region</Label>
          <Input
            id="hregion"
            className="mt-1 text-[var(--mf-navy)]"
            value={form.region}
            onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
          />
        </div>
        <GlowButton type="submit" className="w-full">
          Register institution
        </GlowButton>
      </form>
    </GlassCard>
  );
}
