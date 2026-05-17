import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeAuthNextPath } from "@/lib/auth/safe-redirect";
import { getSupabasePublicConfig } from "@/lib/supabase/env-public";

/**
 * OAuth + email-confirm + password-recovery (PKCE `code` exchange).
 *
 * Supabase Dashboard → Authentication → URL configuration:
 * - Redirect URLs must include: {SITE}/auth/callback
 *
 * Password emails: Dashboard → Authentication → SMTP (use Gmail SMTP + App Password to send from your Gmail).
 */
export async function GET(request: Request) {
  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeAuthNextPath(searchParams.get("next"));

  // Check if Supabase sent an explicit error in the URL (e.g. "Email link is invalid or has expired")
  const authError = searchParams.get("error");
  const authErrorDescription = searchParams.get("error_description");
  if (authError || authErrorDescription) {
    const msg = authErrorDescription || authError || "Authentication error";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(msg)}`, origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=missing_code`, origin));
  }

  const cookieStore = await cookies();
  const redirectTarget = new URL(next, origin);
  const response = NextResponse.redirect(redirectTarget);

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([k, v]) => {
          response.headers.set(k, v);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, origin),
    );
  }

  return response;
}
