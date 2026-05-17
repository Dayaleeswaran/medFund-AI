"use client";

import type { ClipboardEvent } from "react";
import { useRef } from "react";
import { motion } from "framer-motion";

type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (digits: string) => void;
  disabled?: boolean;
};

/** Animated OTP cells — paste fills sequentially. */
export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const chars = Array.from({ length }, (_, i) => value[i] ?? "");

  function focusCell(i: number) {
    refs.current[i]?.focus();
    refs.current[i]?.select();
  }

  function patchAt(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next =
      value.slice(0, index) + digit + value.slice(index + 1);
    onChange(next.slice(0, length));
    if (digit && index < length - 1) focusCell(index + 1);
  }

  function onPaste(e: ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    focusCell(Math.min(pasted.length, length - 1));
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={onPaste}>
      {chars.map((ch, i) => (
        <motion.input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={ch}
          onChange={(e) => patchAt(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !chars[i] && i > 0) focusCell(i - 1);
          }}
          className="h-12 w-10 rounded-xl border border-[var(--mf-navy)]/12 bg-white/80 text-center text-lg font-semibold text-[var(--mf-navy)] shadow-inner outline-none ring-cyan-400/40 transition focus:ring-2 sm:h-14 sm:w-12 sm:text-xl"
        />
      ))}
    </div>
  );
}
