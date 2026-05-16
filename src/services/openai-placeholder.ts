/**
 * OpenAI integration placeholder.
 * Wire to your API route with server-side key.
 */
export async function generateCampaignCopyOutline(
  prompt: string,
): Promise<string> {
  await new Promise((r) => setTimeout(r, 300));
  return [
    "## Suggested narrative",
    "- Lead with the clinical urgency (time-bound).",
    "- Cite verified hospital and attending unit.",
    "- Include transparent use-of-funds bullets.",
    "",
    `User prompt snapshot: ${prompt.slice(0, 200)}${prompt.length > 200 ? "…" : ""}`,
  ].join("\n");
}

export const OPENAI_PLACEHOLDER_MODEL = "gpt-4.1-placeholder";
