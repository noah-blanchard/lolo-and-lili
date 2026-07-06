import type { NextRequest } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { jsonOk, toErrorResponse } from "./http";
import { fail, validationError } from "./result";

interface RouteContext<TInput> {
  req: NextRequest;
  input: TInput;
  supabase: SupabaseClient<Database>;
  user: User;
  params: Record<string, string>;
}

interface DefineRouteOptions<TSchema extends z.ZodTypeAny, TOutput> {
  /** zod schema for the JSON body. Omit for routes without a body. */
  input?: TSchema;
  handler: (ctx: RouteContext<z.infer<TSchema>>) => Promise<TOutput> | TOutput;
}

/**
 * Build an authenticated route handler. Guarantees an authed user, validates
 * the JSON body against `input`, injects `{ supabase, user, params }`, and
 * always responds with the standard `ApiResult` envelope.
 */
export function defineRoute<
  TOutput,
  TSchema extends z.ZodTypeAny = z.ZodUndefined,
>(opts: DefineRouteOptions<TSchema, TOutput>) {
  return async (
    req: NextRequest,
    context?: { params?: Promise<Record<string, string>> },
  ) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw fail.unauthorized();

      let input: z.infer<TSchema> = undefined as z.infer<TSchema>;
      if (opts.input) {
        const raw = await req.json().catch(() => ({}));
        const parsed = opts.input.safeParse(raw);
        if (!parsed.success) throw validationError(parsed.error);
        input = parsed.data;
      }

      const params = context?.params ? await context.params : {};
      const data = await opts.handler({ req, input, supabase, user, params });
      return jsonOk(data);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
