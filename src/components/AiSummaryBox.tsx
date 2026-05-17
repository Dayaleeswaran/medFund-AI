"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export function AiSummaryBox({ text }: { text: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await res.json();
      setSummary(data.summary);
    } catch (e) {
      console.error(e);
      toast.error("AI Summarization failed");
    } finally {
      setLoading(false);
    }
  };

  if (summary) {
    return (
      <div className="mt-4 rounded-2xl border border-[var(--mf-neon)]/30 bg-[var(--mf-neon)]/5 p-4 relative overflow-hidden">
        <div className="absolute -left-4 -top-4 h-16 w-16 rounded-full bg-[var(--mf-neon)]/20 blur-2xl" />
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-[var(--mf-neon)]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--mf-neon)]">
            AI Summary
          </span>
        </div>
        <p className="text-sm leading-relaxed text-white/90 relative z-10">
          {summary}
        </p>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="mt-4 gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10"
      onClick={fetchSummary}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-[var(--mf-neon)]" />
      ) : (
        <Sparkles className="h-4 w-4 text-[var(--mf-neon)]" />
      )}
      Generate AI TL;DR
    </Button>
  );
}
