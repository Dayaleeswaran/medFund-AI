import type { User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/types";

/** Map Supabase Auth user → app Profile (JWT metadata + email). */
export function mapAuthUserToProfile(user: User, emailFallback?: string): Profile {
    const role = (user.user_metadata?.role as UserRole | undefined) ?? "donator";
    return {
    id: user.id,
    full_name:
      (user.user_metadata?.full_name as string | undefined) ??
      user.email ??
      emailFallback ??
      "User",
    role,
    avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    is_verified:
      role === "admin" || role === "hospital"
        ? true
        : !!user.user_metadata?.is_verified,
  };
}
