import { mockNotifications } from "../fixtures";

export function useNotifications() {
  return { data: mockNotifications };
}
export function useUnreadCount() {
  return mockNotifications.filter((n) => !n.read).length;
}
export function useMarkNotificationRead() {
  return { mutate: () => {} };
}
export function useMarkAllNotificationsRead() {
  return { mutate: () => {} };
}
