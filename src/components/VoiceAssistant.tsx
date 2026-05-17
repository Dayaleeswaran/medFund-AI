"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { GlowButton } from "@/components/GlowButton";
import { GlassCard } from "@/components/GlassCard";
import { getElevenLabsAgentUrlPlaceholder } from "@/services/elevenlabs-placeholder";
import { Button } from "@/components/ui/button";
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  type SpeechRecognitionAlt,
} from "@/lib/voice/browser-speech";

type Mode = "fundraiser" | "donate" | "access";

function VoiceAssistantOrb({
  listening,
  onToggle,
}: {
  listening: boolean;
  onToggle: () => void;
}) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!listening) return;
    const id = setInterval(() => setPulse((p) => !p), 900);
    return () => clearInterval(id);
  }, [listening]);

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className="relative flex h-32 w-32 items-center justify-center outline-none"
      aria-pressed={listening}
      aria-label={listening ? "Stop listening" : "Start voice input"}
    >
      <motion.span
        className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-400/60 via-[var(--mf-neon)] to-emerald-300/80 opacity-90 blur-md"
        animate={{ scale: listening ? [1, 1.08, 1] : 1 }}
        transition={{ repeat: listening ? Infinity : 0, duration: 2.4 }}
      />
      <motion.span
        className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-[#05192e]/80 shadow-[0_0_40px_rgba(52,255,154,0.35)] backdrop-blur-xl"
        animate={{ scale: pulse && listening ? 1.04 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        {listening ? (
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
  lines,
  partial,
  speakReplies,
  onSpeakRepliesChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lines: string[];
  partial: string;
  speakReplies: boolean;
  onSpeakRepliesChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogTitle>Voice command channel</DialogTitle>
        <div className="max-h-52 space-y-2 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-3 text-xs font-mono text-emerald-100/90">
          <AnimatePresence initial={false}>
            {lines.map((line, i) => (
              <motion.p
                key={`${i}-${line.slice(0, 24)}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="whitespace-pre-wrap leading-relaxed"
              >
                {line}
              </motion.p>
            ))}
          </AnimatePresence>
          {partial ? (
            <p className="border-t border-white/10 pt-2 italic text-emerald-200/70">
              … {partial}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1.5 rounded-xl"
            onClick={() => {
              const next = !speakReplies;
              onSpeakRepliesChange(next);
              if (!next && typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
          >
            {speakReplies ? (
              <>
                <Volume2 className="h-3.5 w-3.5" /> Read replies aloud
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5" /> Replies muted
              </>
            )}
          </Button>
          <p className="text-xs text-white/55">
            Click the orb to start / stop. Works best in Chrome or Edge over
            HTTPS.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function VoiceAssistantPanel() {
  const [mode, setMode] = useState<Mode>("fundraiser");
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  const [lines, setLines] = useState<string[]>([
    "Tip: allow microphone access when the browser asks.",
  ]);
  const [partial, setPartial] = useState("");
  const [listening, setListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(true);
  const speakRepliesRef = useRef(speakReplies);
  useEffect(() => {
    speakRepliesRef.current = speakReplies;
  }, [speakReplies]);

  const recognitionRef = useRef<SpeechRecognitionAlt | null>(null);
  const transcriptRef = useRef("");
  const sessionIdRef = useRef(0);

  const pushLine = useCallback((line: string) => {
    setLines((prev) => [...prev, line]);
  }, []);

  useEffect(() => {
    return () => {
      sessionIdRef.current += 1;
      recognitionRef.current?.abort();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const sendTranscript = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        pushLine("No speech captured — try again.");
        return;
      }
      pushLine(`You: ${trimmed}`);
      setPartial("");
      try {
        const res = await fetch("/api/voice/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, mode: modeRef.current }),
        });
        const j = (await res.json()) as { reply?: string; error?: string };
        if (!res.ok) {
          pushLine(j.error ?? `Request failed (${res.status})`);
          return;
        }
        const reply = j.reply ?? "";
        pushLine(`MediFund: ${reply}`);
        if (
          speakRepliesRef.current &&
          typeof window !== "undefined" &&
          "speechSynthesis" in window &&
          reply
        ) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(reply);
          u.lang = "en-US";
          window.speechSynthesis.speak(u);
        }
      } catch {
        pushLine("Network error — check your connection.");
      }
    },
    [pushLine],
  );

  const toggleListen = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      toast.error(
        "Voice input needs Chrome or Edge (Web Speech API). Safari support is limited.",
      );
      return;
    }

    sessionIdRef.current += 1;
    const sessionId = sessionIdRef.current;
    recognitionRef.current?.abort();

    const rec = createSpeechRecognition();
    if (!rec) {
      toast.error("Speech recognition is not available in this browser.");
      return;
    }

    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    transcriptRef.current = "";

    rec.onresult = (event) => {
      let full = "";
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      transcriptRef.current = full;
      setPartial(full);
    };

    rec.onerror = (ev) => {
      if (ev.error === "aborted") return;
      sessionIdRef.current += 1;
      const msg =
        ev.error === "not-allowed"
          ? "Microphone permission denied"
          : `Speech recognition: ${ev.error}`;
      toast.error(msg);
      setListening(false);
      setPartial("");
    };

    rec.onend = () => {
      setListening(false);
      setPartial("");
      if (sessionId !== sessionIdRef.current) return;
      void sendTranscript(transcriptRef.current);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
      // setCmdOpen(true); // User requested to not auto-open the voice command channel
      pushLine(
        `Listening (${modeRef.current} mode) — speak, then click the orb again to send.`,
      );
    } catch {
      toast.error("Could not start microphone.");
      setListening(false);
    }
  }, [listening, pushLine, sendTranscript]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <GlassCard className="relative flex flex-col items-center gap-6 overflow-hidden py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--mf-neon)]/15 to-transparent blur-2xl" />
        <p className="text-center text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/80">
          Voice copilot
        </p>
        <VoiceAssistantOrb listening={listening} onToggle={toggleListen} />
        <p className="max-w-md text-center text-sm text-white/70">
          Tap the orb to start listening, speak your question, then tap again to
          send. With{" "}
          <code className="rounded bg-white/10 px-1 text-[0.85em]">
            OPENAI_API_KEY
          </code>{" "}
          set, MediFund answers via the server; without it you still get a
          short fallback reply.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {(["fundraiser", "donate", "access"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              disabled={listening}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                mode === m
                  ? "bg-[var(--mf-neon)] text-[#04251a]"
                  : "bg-white/10 text-white/70 hover:bg-white/15 disabled:opacity-40"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="flex flex-col space-y-4">
        <div className="flex items-center justify-between gap-2 text-sm font-semibold text-white">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-[var(--mf-neon)]" />
            Live conversation
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-xl px-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => {
              const next = !speakReplies;
              setSpeakReplies(next);
              if (!next && typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
          >
            {speakReplies ? (
              <><Volume2 className="h-3 w-3" /> Replies ON</>
            ) : (
              <><VolumeX className="h-3 w-3" /> Muted</>
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs font-mono text-emerald-100/90 min-h-[300px]">
          <AnimatePresence initial={false}>
            {lines.map((line, i) => (
              <motion.p
                key={`${i}-${line.slice(0, 24)}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 whitespace-pre-wrap leading-relaxed"
              >
                {line}
              </motion.p>
            ))}
          </AnimatePresence>
          {partial ? (
            <p className="mt-2 border-t border-white/10 pt-2 italic text-emerald-200/70">
              … {partial}
            </p>
          ) : null}
        </div>
      </GlassCard>
    </div>
  );
}

export function VoiceAssistant() {
  return <VoiceAssistantPanel />;
}
