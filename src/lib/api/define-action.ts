import type { SupabaseClient, User } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { ApiError, type ApiResult, ErrorCode, err, ok } from "./result";

interface ActionContext<TInput> {
  input: TInput;
  supabase: SupabaseClient<Database>;
  user: User;
}

/**
 * Build an authenticated Server Action. Same guarantees as `defineRoute`
 * (authed user + zod validation + injected supabase) but returns an
 * `ApiResult<T>` directly instead of an HTTP response.
 */
export function defineAction<
  TOutput,
  TSchema extends z.ZodTypeAny = z.ZodUndefined,
>(
  schema: TSchema | undefined,
  handler: (ctx: ActionContext<z.infer<TSchema>>) => Promise<TOutput> | TOutput,
) {
  return async (rawInput?: z.infer<TSchema>): Promise<ApiResult<TOutput>> => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return err(ErrorCode.UNAUTHORIZED, "Not authenticated");

      let input = rawInput as z.infer<TSchema>;
      if (schema) {
        const parsed = schema.safeParse(rawInput);
        if (!parsed.success) {
          return err(
            ErrorCode.VALIDATION,
            "Validation failed",
            z.flattenError(parsed.error).fieldErrors,
          );
        }
        input = parsed.data;
      }

      const data = await handler({ input, supabase, user });
      return ok(data);
    } catch (error) {
      if (error instanceof ApiError) {
        return err(error.code, error.message, error.details);
      }
      console.error("[action] unhandled error:", error);
      return err(ErrorCode.INTERNAL, "Something went wrong");
    }
  };
}
