import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { Database } from "./types";

/**
 * Refresh the Supabase auth session on the edge and sync refreshed cookies onto
 * the response produced by the i18n middleware. Must run on every request so
 * Server Components always see a valid session.
 *
 * IMPORTANT: cookies are written to BOTH the request (so downstream reads in
 * this same pass are fresh) and the response (so the browser is updated).
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  const supabase = createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touch the user to trigger a token refresh when needed. Do not add logic
  // between client creation and this call (per Supabase SSR guidance).
  await supabase.auth.getUser();

  return response;
}
