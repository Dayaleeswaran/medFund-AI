"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export function CampaignAudioPlayer({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fallback Web Speech API
  const speakFallback = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("Speech synthesis not supported in this browser.");
      setLoading(false);
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => {
      setPlaying(false);
      toast.error("Failed to narrate using browser speech.");
    };
    
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
    setLoading(false);
  };

  const togglePlay = async () => {
    if (playing) {
      if (audioRef.current) {
        audioRef.current.pause();
      } else {
        window.speechSynthesis.cancel();
      }
      setPlaying(false);
      return;
    }

    setLoading(true);

    if (audioRef.current) {
      // Already fetched and buffered
      audioRef.current.play();
      setPlaying(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        if (res.status === 503) {
          // Fallback if key isn't configured
          speakFallback();
          return;
        }
        throw new Error("TTS failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => setPlaying(false);
      audioRef.current = audio;
      
      await audio.play();
      setPlaying(true);
      setLoading(false);
    } catch (e) {
      console.error(e);
      // Fallback
      speakFallback();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10"
      onClick={togglePlay}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-[var(--mf-neon)]" />
      ) : playing ? (
        <Pause className="h-4 w-4 text-[var(--mf-neon)]" />
      ) : (
        <Volume2 className="h-4 w-4 text-[var(--mf-neon)]" />
      )}
      {playing ? "Pause" : "Listen"}
    </Button>
  );
}
