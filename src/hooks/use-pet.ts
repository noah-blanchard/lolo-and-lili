"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { PetView, CareResult, PetActionType } from "@/lib/pets";
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
