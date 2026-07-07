"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import type { Coupon } from "@/lib/supabase/types";
import type { MintCouponInput } from "@/lib/schemas/coupon";
import { useCouple } from "@/components/providers/couple-provider";

export function useCoupons() {
  return useQuery({
    queryKey: queryKeys.coupons(),
    queryFn: () => apiFetch<Coupon[]>("/api/coupons"),
  });
}

export function useMintCoupon() {
  const queryClient = useQueryClient();
  const { me, coupleId } = useCouple();

  return useMutation({
    mutationFn: (input: MintCouponInput) =>
      apiFetch<Coupon>("/api/coupons", jsonBody(input)),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.coupons() });
      const previous = queryClient.getQueryData<Coupon[]>(queryKeys.coupons());
      const optimistic: Coupon = {
        id: input.id,
        couple_id: coupleId,
        created_by: me.id,
        title: input.title,
        emoji: input.emoji,
        cost_treats: input.cost_treats,
        status: "available",
        redeemed_by: null,
        redeemed_at: null,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<Coupon[]>(queryKeys.coupons(), (old) => [
        optimistic,
        ...(old ?? []),
      ]);
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.coupons(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons() }),
  });
}

export function useRedeemCoupon() {
  const queryClient = useQueryClient();
  const { me } = useCouple();

  return useMutation({
    mutationFn: (couponId: string) =>
      apiFetch<Coupon>(`/api/coupons/${couponId}/redeem`, { method: "POST" }),

    onMutate: async (couponId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.coupons() });
      const previous = queryClient.getQueryData<Coupon[]>(queryKeys.coupons());
      queryClient.setQueryData<Coupon[]>(queryKeys.coupons(), (old) =>
        (old ?? []).map((c) =>
          c.id === couponId
            ? { ...c, status: "redeemed", redeemed_by: me.id, redeemed_at: new Date().toISOString() }
            : c,
        ),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.coupons(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons() }),
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId: string) =>
      apiFetch<{ id: string }>(`/api/coupons/${couponId}`, { method: "DELETE" }),

    onMutate: async (couponId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.coupons() });
      const previous = queryClient.getQueryData<Coupon[]>(queryKeys.coupons());
      queryClient.setQueryData<Coupon[]>(queryKeys.coupons(), (old) =>
        (old ?? []).filter((c) => c.id !== couponId),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.coupons(), ctx.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons() }),
  });
}
