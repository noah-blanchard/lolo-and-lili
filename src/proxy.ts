import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed Middleware → Proxy. We compose two concerns here:
//   1. next-intl: locale detection (Accept-Language, fallback fr) + rewrite.
//   2. Supabase: refresh the auth session and sync cookies onto the response.
const handleI18n = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Run i18n first — it may redirect (e.g. "/" → "/fr") or rewrite.
  const response = handleI18n(request);
  // Attach refreshed Supabase auth cookies onto that same response.
  return updateSession(request, response);
}

export const config = {
  // Skip API routes, Next internals, and static files (anything with a dot).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
