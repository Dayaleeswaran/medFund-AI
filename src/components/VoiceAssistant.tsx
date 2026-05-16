"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { GlowButton } from "@/components/GlowButton";
import { GlassCard } from "@/components/GlassCard";
import { getElevenLabsAgentUrlPlaceholder } from "@/services/elevenlabs-placeholder";

type Mode = "fundraiser" | "donate" | "access";

export function VoiceAssistantOrb() {
  const [active, setActive] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setPulse((p) => !p), 900);
    return () => clearInterval(id);
  }, [active]);

  return (
    <motion.button
      type="button"
      onClick={() => setActive((a) => !a)}
      className="relative flex h-32 w-32 items-center justify-center outline-none"
      aria-pressed={active}
    >
      <motion.span
        className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-400/60 via-[var(--mf-neon)] to-emerald-300/80 opacity-90 blur-md"
        animate={{ scale: active ? [1, 1.08, 1] : 1 }}
        transition={{ repeat: active ? Infinity : 0, duration: 2.4 }}
      />
      <motion.span
        className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-[#05192e]/80 shadow-[0_0_40px_rgba(52,255,154,0.35)] backdrop-blur-xl"
        animate={{ scale: pulse && active ? 1.04 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        {active ? (
          <Mic className="h-9 w-9 text-white" />
        ) : (
          <MicOff className="h-9 w-9 text-white/70" />
        )}
      </motion.span>
    </motion.button>
  );
}

function VoiceCommandModal({
  open,
  onOpenChange,
  mode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
}) {
  const [lines, setLines] = useState<string[]>([
    "Listening for wake word: “MediFund”",
  ]);

  useEffect(() => {
    if (!open) return;
    const timers = [
      setTimeout(() => {
        setLines((l) => [
          ...l,
          mode === "fundraiser"
            ? "Drafting title + urgency from voice biomarkers…"
            : mode === "donate"
              ? "Matching safest campaign using geolocation + trust score…"
              : "Enabling large-type hospital verification mode…",
        ]);
      }, 700),
      setTimeout(() => {
        setLines((l) => [...l, "ElevenLabs streaming session idle (demo)."]);
      }, 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [open, mode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogTitle>Voice command channel</DialogTitle>
        <div className="max-h-52 space-y-2 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-3 text-xs font-mono text-emerald-100/90">
          <AnimatePresence initial={false}>
            {lines.map((line, i) => (
              <motion.p
                key={`${line}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="leading-relaxed"
              >
                {line}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
        <p className="text-xs text-white/55">
          Wire this modal to your ConvAI agent; the UI already handles muted
          states, waveform placeholders, and emergency-highlight skin.
        </p>
      </DialogContent>
    </Dialog>
  );
}

export function VoiceAssistantPanel() {
  const [mode, setMode] = useState<Mode>("fundraiser");
  const [cmdOpen, setCmdOpen] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <GlassCard className="relative flex flex-col items-center gap-6 overflow-hidden py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--mf-neon)]/15 to-transparent blur-2xl" />
        <p className="text-center text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/80">
          Voice copilot
        </p>
        <VoiceAssistantOrb />
        <p className="max-w-md text-center text-sm text-white/70">
          Hold the orb to narrate an emergency — MediFund drafts the campaign,
          attaches hospital IDs, and runs parallel fraud models before publish.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {(["fundraiser", "donate", "access"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                mode === m
                  ? "bg-[var(--mf-neon)] text-[#04251a]"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <GlowButton type="button" onClick={() => setCmdOpen(true)}>
          Launch voice console
        </GlowButton>
      </GlassCard>

      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Volume2 className="h-4 w-4 text-[var(--mf-neon)]" />
          Accessibility-first flows
        </div>
        <ul className="space-y-3 text-sm text-white/70">
          <li>• Hands-free donation with amount confirmation loops</li>
          <li>• Reads fraud summaries aloud in plain language</li>
          <li>• High-contrast mode syncs with OS settings</li>
        </ul>
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-3 text-[11px] leading-relaxed text-white/45">
          ElevenLabs agent URL placeholder:{" "}
          <span className="break-all text-cyan-200/80">
            {getElevenLabsAgentUrlPlaceholder()}
          </span>
        </div>
      </GlassCard>

      <VoiceCommandModal
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        mode={mode}
      />
    </div>
  );
}

export function VoiceAssistant() {
  return <VoiceAssistantPanel />;
}
