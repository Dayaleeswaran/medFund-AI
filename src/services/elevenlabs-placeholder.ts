/**
 * ElevenLabs voice — call from API route with key.
 */
export type VoiceSessionState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking";

export function getElevenLabsAgentUrlPlaceholder(): string {
  return "https://api.elevenlabs.io/v1/convai/agents/YOUR_AGENT_ID";
}
