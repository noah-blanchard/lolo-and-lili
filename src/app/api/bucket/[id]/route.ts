import { defineRoute } from "@/lib/api/define-route";
import { deleteBucket, toggleBucket } from "@/lib/services/bucket";

export const PATCH = defineRoute({
  handler: ({ supabase, user, params }) => toggleBucket(supabase, user, params.id),
});

export const DELETE = defineRoute({
  handler: ({ supabase, params }) => deleteBucket(supabase, params.id),
});
