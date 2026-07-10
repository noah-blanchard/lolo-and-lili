"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { PetView, CareResult, PetActionType } from "@/lib/pets";
import { applyCare, settle, TREAT_COST } from "@/lib/pets";
import type { PetMemory } from "@/lib/supabase/types";
import type { AdoptPetInput, EquipInput } from "@/lib/schemas/pet";

export function usePet() {
  return useQuery({
    queryKey: queryKeys.pet(),
    queryFn: () => apiFetch<PetView | null>("/api/pets"),
  });
}

export function usePetMemories() {
  return useQuery({
    queryKey: queryKeys.petMemories(),
    queryFn: () => apiFetch<PetMemory[]>("/api/pets/memories"),
  });
}

export function useAdoptPet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdoptPetInput) =>
      apiFetch<PetView>("/api/pets", jsonBody(input)),
    onSuccess: (pet) => qc.setQueryData(queryKeys.pet(), pet),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.pet() }),
  });
}

export function useCarePet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type: PetActionType) =>
      apiFetch<CareResult>("/api/pets/care", jsonBody({ type })),

    // Optimistically apply the same pure `applyCare` the server runs so the
    // meters/treats animate the instant the button is tapped. The authoritative
    // pet (with milestone events) still lands in `onSuccess`; `onError` rolls
    // back if the server rejects (cooldown / not enough treats).
    onMutate: async (type) => {
      await qc.cancelQueries({ queryKey: queryKeys.pet() });
      const previous = qc.getQueryData<PetView>(queryKeys.pet());
      if (previous) {
        const { store } = applyCare(previous, type, previous.streak_count ?? 0);
        const settled = settle({ ...previous, ...store });
        const optimistic: PetView = {
          ...settled,
          treats: Math.max(0, previous.treats - (TREAT_COST[type] ?? 0)),
          cooldowns: previous.cooldowns,
          cuddledToday: type === "cuddle" ? true : previous.cuddledToday,
          partnerCuddledToday: previous.partnerCuddledToday,
        };
        qc.setQueryData(queryKeys.pet(), optimistic);
      }
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.pet(), ctx.previous);
    },
    onSuccess: (res) => qc.setQueryData(queryKeys.pet(), res.pet),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pet() });
      qc.invalidateQueries({ queryKey: queryKeys.petMemories() });
    },
  });
}

export function useEquip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EquipInput) =>
      apiFetch<PetView>("/api/pets/equip", jsonBody(input)),
    onSuccess: (pet) => qc.setQueryData(queryKeys.pet(), pet),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.pet() }),
  });
}

export function useRenamePet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<PetView>("/api/pets", {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    onSuccess: (pet) => qc.setQueryData(queryKeys.pet(), pet),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.pet() }),
  });
}
