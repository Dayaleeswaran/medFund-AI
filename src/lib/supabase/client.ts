import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./env-public";

export function createClient() {
  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) {
    return null;
  }
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured() {
  return getSupabasePublicConfig().isConfigured;
}
