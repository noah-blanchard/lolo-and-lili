import { defineRoute } from "@/lib/api/define-route";
import { listNotifications, markAllNotificationsRead } from "@/lib/services/notifications";

export const GET = defineRoute({
  handler: ({ supabase, user }) => listNotifications(supabase, user.id),
});

export const POST = defineRoute({
  handler: ({ supabase, user }) => markAllNotificationsRead(supabase, user.id),
});
