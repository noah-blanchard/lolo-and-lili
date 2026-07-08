import { mockMeal } from "../fixtures";

export function useMeals() {
  return { data: [mockMeal] };
}
export function useUpsertMeal() {
  return { mutate: () => {}, isPending: false };
}
export function useDeleteMeal() {
  return { mutate: () => {} };
}
export function useAddIngredients() {
  return { mutate: () => {} };
}
