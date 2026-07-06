import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * First-party magic-link landing. The email links here (on OUR domain) with a
 * `token_hash`, which we verify server-side — so the browser never bounces
 * through supabase.co. That avoids the "bounce tracker" classification and
 * iOS Safari capping the session cookie lifetime. No custom domain needed.
 *
 * Requires the Supabase "Magic Link" email template to point here, e.g.:
 *   {{ .SiteURL }}/api/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? "email") as EmailOtpType;
  const next = searchParams.get("next") ?? "/";

  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      // Proxy adds the locale prefix on redirect.
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
