/** Product-spec login copy when account existence is confirmed server-side. */
export const LOGIN_NO_ACCOUNT_FOUND = "No account found";

export const LOGIN_INVALID_USERNAME_OR_PASSWORD =
  "Invalid Username or Password";

/**
 * Generic validation before hitting Supabase (empty fields).
 * Matches product wording for consistency.
 */
export const INVALID_EMAIL_OR_PASSWORD = LOGIN_INVALID_USERNAME_OR_PASSWORD;

export function signupErrorMessage(message: string, code?: string): string {
  const c = (code ?? "").toLowerCase().replace(/_/g, "");
  const m = message.toLowerCase();
  if (
    c.includes("useralreadyexists") ||
    c.includes("emailalreadyregistered") ||
    m.includes("already registered") ||
    m.includes("user already registered") ||
    m.includes("email address is already") ||
    m.includes("already been registered")
  ) {
    return "An account with this email already exists. Try signing in or reset your password.";
  }
  if (
    m.includes("password") &&
    (m.includes("weak") || m.includes("short") || m.includes("least"))
  ) {
    return "Password is too weak. Use at least 6 characters.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many requests. Wait a moment and try again.";
  }
  if (
    m.includes("signup") &&
    (m.includes("disabled") || m.includes("not allowed"))
  ) {
    return "New sign-ups are disabled. Contact support if you need access.";
  }
  if (looksLikeInvalidEmailError(m)) {
    return "Please enter a valid email address.";
  }
  if (
    m.includes("database error") ||
    m.includes("saving new user") ||
    m.includes("unexpected_failure") ||
    c.includes("unexpectedfailure")
  ) {
    return "Could not finish sign-up: server error while creating your profile. In Supabase, check Logs and verify the handle_new_user trigger and profiles/wallets tables exist (run migrations).";
  }
  if (
    m.includes("duplicate key") ||
    m.includes("unique constraint") ||
    m.includes("violates unique constraint")
  ) {
    return "This email may already be registered, or profile data is duplicated. Try signing in or use a different email. An admin can check the profiles and auth.users tables.";
  }
  if (m.includes("email") && m.includes("confirm") && m.includes("provider")) {
    return "Email confirmation may be misconfigured in Supabase (Auth → Providers / SMTP). Check project settings and try again.";
  }
  return "Could not create your account. Check your details and try again.";
}

/** Avoid treating every Supabase message that mentions "email" as a format error. */
function looksLikeInvalidEmailError(m: string): boolean {
  if (m.includes("invalid email")) return true;
  if (m.includes("unable to validate email")) return true;
  if (m.includes("email address") && m.includes("invalid")) return true;
  if (m.includes("malformed") && m.includes("email")) return true;
  if (m.includes("invalid format") && m.includes("email")) return true;
  return false;
}
