import type { ReactNode } from "react";
import { ME_ID, PARTNER_ID } from "./fixtures";

// Storybook has no realtime channel; expose both partners as "online" and a
// pass-through provider so components calling useOnlineUsers() render fine.
const online = new Set<string>([ME_ID, PARTNER_ID]);

export function useOnlineUsers() {
  return online;
}

const lastSeen = new Map<string, string>();

export function useLastSeen() {
  return lastSeen;
}

export function RealtimeProvider({ children }: { coupleId?: string; userId?: string; children: ReactNode }) {
  return <>{children}</>;
}
