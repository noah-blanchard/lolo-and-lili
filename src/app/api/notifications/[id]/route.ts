import { defineRoute } from "@/lib/api/define-route";
import { markNotificationRead, deleteNotification } from "@/lib/services/notifications";

export const PATCH = defineRoute({
  handler: ({ supabase, user, params }) =>
    markNotificationRead(supabase, user.id, params.id),
});

export const DELETE = defineRoute({
  handler: ({ supabase, user, params }) =>
    deleteNotification(supabase, user.id, params.id),
});
