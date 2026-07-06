"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Profile } from "@/lib/supabase/types";

interface CoupleContextValue {
  coupleId: string;
  me: Profile;
  partner: Profile | null;
}

const CoupleContext = createContext<CoupleContextValue | null>(null);

export function CoupleProvider({
  value,
  children,
}: {
  value: CoupleContextValue;
  children: ReactNode;
}) {
  return (
    <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>
  );
}

export function useCouple() {
  const ctx = useContext(CoupleContext);
  if (!ctx) throw new Error("useCouple must be used within a CoupleProvider");
  return ctx;
}
