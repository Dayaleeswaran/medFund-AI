import { VoiceAssistantPanel } from "@/components/VoiceAssistant";

export default function VoiceAssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/90">
          Voice AI
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Hands-free fundraising & donation copilot
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-cyan-50/85">
          Pair this surface with ElevenLabs ConvAI and your OpenAI guardrails.
          The visual layer stays urgency-forward, calm enough for shocked families.
        </p>
      </div>
      <VoiceAssistantPanel />
    </div>
  );
}
