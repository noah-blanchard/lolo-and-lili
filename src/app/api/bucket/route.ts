import { defineRoute } from "@/lib/api/define-route";
import { addBucketSchema } from "@/lib/schemas/bucket";
import { addBucket, listBucket } from "@/lib/services/bucket";

export const GET = defineRoute({
  handler: ({ supabase }) => listBucket(supabase),
});

export const POST = defineRoute({
  input: addBucketSchema,
  handler: ({ supabase, user, input }) => addBucket(supabase, user, input),
});
