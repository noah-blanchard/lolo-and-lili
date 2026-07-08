export function useAddIngredients() {
  return { mutate: () => {} };
}
export function useDeleteMeal() {
  return { mutate: () => {} };
}
export function useUpsertMeal() {
  return { mutate: () => {}, isPending: false };
}
export function useMeals() {
  return { data: [] };
}
